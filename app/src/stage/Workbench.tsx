/**
 * DEV-only Workbench (W-L1 §7.1 item 3): `#/dev/stage/:lecture/:unit` mounts ONE unit's stage on the shared
 * canvas with a beat slider (u), a motion toggle, a term picker and the clue reveal — no scroll wiring.
 * D builds scenes here; `:lecture = demo` loads the DEV fixture (content/__fixtures__/demoStory.ts).
 * Registered in App only when `import.meta.env.DEV`, so production builds drop it (and the fixture).
 *
 * Measure: `window.__stage.contexts` must be 1 with the stage showing (freeze criterion).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DEMO } from '../content/__fixtures__/demoStory'
import { lectureById } from '../content'
import type { Lecture, Unit } from '../content/schema'
import { beatLayout, layoutSlots, mainKind, passportOf, type StageKind, type ViewSlot } from '../content/stage'
import { Rich } from '../ui/Rich'
import { requestStageHost } from './demand'
import { INSET, slotRect, storyKinds } from './drive'
import { StaticStory } from './StaticStory'
import {
  domRef,
  labelKey,
  prefersReducedMotion,
  registerView,
  releaseUnit,
  setFocusTerm,
  setMotion,
  setRevealed,
  setScroll,
  stage,
  trackUnit,
  useBeat,
  useFocusTerm,
  useRevealed,
  useStageFlag,
  useViewLabels,
  viewKey,
} from './store'
import { stageCssVars } from './tokens'

const PHASE: Record<string, string> = { lecture: 'lecture says', books: 'books add', clue: 'clue' }

function findUnit(lectureId: string, unitId: string | undefined): { lecture: Lecture | undefined; unit: Unit | undefined } {
  const lecture = lectureId === 'demo' ? DEMO : lectureById(lectureId)
  const unit = lecture?.units.find((u) => u.id === unitId) ?? lecture?.units.find((u) => u.story?.length)
  return { lecture, unit }
}

/** Anchored labels + readouts a scene published for one view (moved by useDomLabels, written by writeReadout). */
function ViewLabels({ vKey }: { vKey: string }) {
  const labels = useViewLabels(vKey)
  const entries = Object.entries(labels)
  const anchored = entries.filter(([, l]) => l.tier !== 'readout')
  const readouts = entries.filter(([, l]) => l.tier === 'readout')
  return (
    <>
      {anchored.map(([name, l]) => (
        <span key={name} ref={domRef(labelKey(vKey, name))} className="stage-label" data-tier={l.tier ?? 'axis'} data-tone={l.tone ?? 'text'} data-contrast="label" data-hidden="1" style={{ opacity: 0 }}>
          <Rich as="span" text={l.text} />
        </span>
      ))}
      {readouts.length > 0 && (
        <div className="stage-readouts" data-view={vKey}>
          {readouts.map(([name, l]) => (
            <span key={name} ref={domRef(labelKey(vKey, name))} className="stage-readout" data-tone={l.tone ?? 'text'} data-contrast="readout">
              {l.text}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

function passportPos(slot: ViewSlot, w: number, h: number): React.CSSProperties {
  const [x, y] = slotRect(slot, w, h)
  if (slot === 'inset') return { left: x, top: y - INSET.strip, fontSize: 11 }
  return { left: x + 14, top: y + 14 }
}

function Bench({ unit }: { unit: Unit }) {
  const beats = unit.story!
  const kinds = useMemo(() => storyKinds(beats), [beats])
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 600, h: 800 })
  const [u, setU] = useState(0.2)
  const [showStatic, setShowStatic] = useState(false)
  const [stats, setStats] = useState('')
  const motion = useStageFlag('motion')
  const beat = useBeat(unit.id)
  const current = beats[Math.min(beat, beats.length - 1)]
  const revealed = useRevealed(unit.id, beat)
  const focus = useFocusTerm()

  // one UnitTrack + one view per kind; near = true (no scroll wiring here)
  useLayoutEffect(() => {
    const t = trackUnit(unit.id, beats)
    t.near = true
    t.box = boxRef.current
    setScroll(t, u)
    const offs = kinds.map((k: StageKind) => registerView(unit.id, k))
    return () => {
      offs.forEach((off) => off())
      t.near = false
      if (t.box === boxRef.current) t.box = null
      releaseUnit(unit.id)
    }
    // u is applied by the slider handler; re-running on u would re-register views
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id, beats, kinds])

  useEffect(() => {
    requestStageHost()
    setMotion(!prefersReducedMotion())
  }, [])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const s = (window as unknown as { __stage?: { contexts: number; contextsLost: number; views: () => { key: string; weight: number; renders: number }[] } }).__stage
      if (!s) return setStats('window.__stage not installed yet')
      const v = s.views().map((x) => `${x.key}  w=${x.weight}  renders=${x.renders}`)
      setStats(`contexts ${s.contexts} (lost ${s.contextsLost})\n${v.join('\n')}`)
    }, 500)
    return () => clearInterval(id)
  }, [])

  const move = (next: number) => {
    setU(next)
    const t = stage.units.get(unit.id)
    if (t) setScroll(t, next)
  }
  const layout = beatLayout(current, revealed)
  const terms = revealed ? { ...current.terms, ...current.reveal?.terms } : (current.terms ?? {})
  const caption = revealed && current.reveal?.caption ? current.reveal.caption : current.caption

  return (
    <div className="wb">
      <section className="wb-controls" aria-label="Stage controls">
        <p className="eyebrow">DEV · stage workbench</p>
        <h1 className="wb-title">{unit.title}</h1>
        <ul className="wb-beats">
          {beats.map((b, i) => (
            <li key={b.id}>
              <button type="button" aria-current={i === beat} onClick={() => move(i + 0.5)}>
                {b.id.split(':')[1]} · {PHASE[b.phase]}
              </button>
            </li>
          ))}
        </ul>
        <label>
          beat position u = <span className="mono">{u.toFixed(3)}</span> / {beats.length}
          <input type="range" min={0} max={beats.length} step={0.001} value={u} onChange={(e) => move(Number(e.target.value))} />
        </label>
        <p>
          <label>
            <input type="checkbox" checked={motion} onChange={(e) => setMotion(e.target.checked)} /> full motion (off = reduced: cuts, 3-step sweeps)
          </label>
        </p>
        <p>
          <label>
            term{' '}
            <select value={focus ?? ''} onChange={(e) => setFocusTerm(e.target.value || null)}>
              <option value="">(none)</option>
              {Object.keys(terms).map((id) => (
                <option key={id} value={id}>
                  {id} → {terms[id].kind}:{terms[id].anchor}
                </option>
              ))}
            </select>
          </label>
        </p>
        <div className="wb-text" data-beat={current.id}>
          <p className="eyebrow">
            {current.id} · {PHASE[current.phase]}
          </p>
          <Rich text={current.text} />
          {current.reveal && (
            <>
              <button type="button" className="reveal-btn" aria-expanded={revealed} onClick={() => setRevealed(unit.id, beat, !revealed)}>
                {revealed ? 'Hide' : 'Show me'}
              </button>
              {revealed && <Rich text={current.reveal.text} />}
            </>
          )}
        </div>
        <p>
          <label>
            <input type="checkbox" checked={showStatic} onChange={(e) => setShowStatic(e.target.checked)} /> show the static reading version below
          </label>
        </p>
        <pre className="wb-stats" data-testid="wb-stats">
          {stats}
        </pre>
      </section>
      <div className="story-stage-col" style={stageCssVars(mainKind(layout)) as React.CSSProperties}>
        <div className="story-stage" ref={boxRef} data-unit={unit.id} style={stageCssVars(mainKind(layout)) as React.CSSProperties}>
          <div className="stage-overlay">
            {layoutSlots(layout).map(({ slot, state }) => {
              const p = passportOf(state)
              return (
                <button key={slot} type="button" className="stage-passport" data-contrast="passport" data-slot={slot} style={passportPos(slot, size.w, size.h)}>
                  <Rich as="span" text={p.title} />
                  {slot !== 'inset' && <span className="passport-note">{p.note}</span>}
                </button>
              )
            })}
            {kinds.map((k) => (
              <ViewLabels key={k} vKey={viewKey(unit.id, k)} />
            ))}
            {caption && (
              <p className="stage-caption" data-contrast="caption">
                <Rich as="span" text={caption} />
              </p>
            )}
          </div>
        </div>
      </div>
      {showStatic && (
        <section style={{ gridColumn: '1 / -1' }} aria-label="Static reading version">
          <StaticStory unit={unit} />
        </section>
      )}
    </div>
  )
}

export default function Workbench() {
  const { lecture: lectureId = 'demo', unit: unitId } = useParams()
  const { lecture, unit } = findUnit(lectureId, unitId)
  if (!lecture || !unit?.story?.length) {
    const withStory = [DEMO, ...(lecture && lecture !== DEMO ? [lecture] : [])].flatMap((l) =>
      l.units.filter((x) => x.story?.length).map((x) => ({ l: l.id.toLowerCase(), u: x.id })),
    )
    return (
      <div className="page">
        <h1>Stage workbench</h1>
        <p>No unit with a story at “{lectureId}/{unitId ?? ''}”. Units with a story:</p>
        <ul>
          {withStory.map((x) => (
            <li key={`${x.l}/${x.u}`}>
              <Link to={`/dev/stage/${x.l}/${x.u}`}>{`${x.l}/${x.u}`}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return <Bench key={`${lecture.id}/${unit.id}`} unit={unit} />
}
