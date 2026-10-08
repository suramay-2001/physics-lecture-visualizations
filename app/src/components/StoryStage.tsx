/**
 * One unit's scroll story (W-L1 §2.1–2.2; decision #17). THREE-FREE: the 3D side lives in the lazy host.
 *
 *   .story ─┬─ .story-beats       beat articles (phase eyebrow, text, clue "Show me", refs)
 *           └─ .story-stage-col   non-positioned dark backing (--stage-bg of the current beat's main kind)
 *                └─ .story-stage  sticky box, z 2: StageOverlay (passports, labels, readouts, caption)
 *
 * Live version (≥ 900 px, WebGL, context alive): a UnitTrack (ref-counted), one ScrollTrigger
 * (`useStoryScroll`), an IntersectionObserver near-check (rootMargin one viewport) that registers one
 * view per kind while near, and `track.box` = the sticky box. The ONE canvas draws the WebGL views
 * (StageHost); the SVG kinds (content/stage.ts KIND_RENDER) draw in the box itself (stage/svg/SvgStage.tsx), so a
 * unit whose kinds are all SVG runs live without WebGL. Otherwise: StaticStory (0 canvases).
 *
 * Clue beats are click-to-reveal inside the story (decision #17): the stage holds the question picture until
 * "Show me"; then the reveal text appears and the stage moves to the answer picture (a cut under reduced motion).
 */
import { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Beat, Unit } from '../content/schema'
import { introducesLabel } from '../content/glossRegistry'
import { beatLayout, glKinds, mainKind, svgKinds } from '../content/stage'
import { pickTrack } from '../content/track'
import { storyKinds } from '../stage/drive'
import { StaticStory, PHASE_LABEL } from '../stage/StaticStory'
import { registerView, releaseUnit, setRevealed, trackUnit, useBeat, useRevealed, type UnitTrack } from '../stage/store'
import { stageCssVars } from '../stage/tokens'
import { svgStageLayer } from '../stage/svgKinds'
import { useLiveStage } from '../stage/useLiveStage'
import { BEAT_ATTR, useStoryScroll } from '../stage/useStoryScroll'
import { BeatContext } from '../stage/readingPosition'
import { Rich } from '../ui/Rich'
import { useTrackContext } from '../ui/trackPref'
import { BeyondBadge } from './BeyondBadge'
import { ClassMark } from './ClassMark'
import { Derivation } from './Derivation'
import { RefList } from './RefList'
import { StageOverlay } from './StageOverlay'

/** The SVG route's live layer (content/stage.ts KIND_RENDER 'svg'): a lazy chunk with the SVG kinds; no WebGL. */
const SvgStage = lazy(() => import('../stage/svg/SvgStage'))

/** "Show me" / "Hide" for a clue beat, and the revealed step of reasoning. */
function ClueReveal({ unitId, index, beat }: { unitId: string; index: number; beat: Beat }) {
  const revealed = useRevealed(unitId, index)
  const answerId = useId()
  if (!beat.reveal) return null
  return (
    <>
      <button
        type="button"
        className="btn ghost reveal-btn"
        aria-expanded={revealed}
        aria-controls={answerId}
        onClick={() => setRevealed(unitId, index, !revealed)}
      >
        {revealed ? 'Hide the answer' : 'Show me'}
      </button>
      <div id={answerId} className="clue-reveal" hidden={!revealed}>
        {revealed && <Rich text={beat.reveal.text} />}
      </div>
    </>
  )
}

function StoryBeat({ unitId, beat: raw, index, active }: { unitId: string; beat: Beat; index: number; active: boolean }) {
  // the track picks the text; the beat's id, stage, terms and claims are shared (content/track.ts)
  const track = useTrackContext()
  const beat = useMemo(() => pickTrack(raw, track), [raw, track])
  const intro = introducesLabel(beat.introduces)
  return (
    <article
      className={`story-beat phase-${beat.phase}`}
      data-beat={beat.id}
      {...{ [BEAT_ATTR]: index }}
      data-active={active ? 'true' : 'false'}
      aria-current={active ? 'step' : undefined}
    >
      <div className="story-beat-body">
        <BeatContext.Provider value={beat.id}>
          {beat.classMark && <ClassMark mark={beat.classMark} />}
          <p className="eyebrow">
            {PHASE_LABEL[beat.phase]}
            {beat.beyondLecture && (
              <>
                {' · '}
                <BeyondBadge />
              </>
            )}
          </p>
          {intro && (
            <p className="eyebrow intro-eyebrow" data-intro={intro === 'New space' ? 'space' : 'notation'}>
              {intro}
            </p>
          )}
          <Rich text={beat.text} />
          {beat.derivation && <Derivation d={beat.derivation} track={track} unitId={unitId} index={index} />}
          {beat.reveal && <ClueReveal unitId={unitId} index={index} beat={beat} />}
          {beat.refs && <RefList refs={beat.refs} compact />}
        </BeatContext.Provider>
      </div>
    </article>
  )
}

function LiveStory({ unit }: { unit: Unit }) {
  const beats = unit.story!
  const kinds = useMemo(() => storyKinds(beats), [beats])
  // WebGL kinds draw on the one shared canvas (views registered with the host); SVG kinds draw in this box
  const gl = useMemo(() => glKinds(kinds), [kinds])
  const svg = useMemo(() => svgKinds(kinds), [kinds])
  const rootRef = useRef<HTMLDivElement>(null)
  const [track, setTrack] = useState<UnitTrack | null>(null)
  const [near, setNear] = useState(false)
  const [size, setSize] = useState({ w: 560, h: 720 })

  // one ref-counted UnitTrack per unit (StrictMode: release + track in one tick keeps the same object)
  useLayoutEffect(() => {
    setTrack(trackUnit(unit.id, beats))
    return () => releaseUnit(unit.id)
  }, [unit.id, beats])

  useStoryScroll(rootRef, track, !!track)

  // near = within one viewport: scenes are mounted (views registered) and the Driver runs
  useEffect(() => {
    const el = rootRef.current
    if (!el || !track) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [track])
  useEffect(() => {
    if (!track || !near) return
    track.near = true
    const offs = gl.map((k) => registerView(unit.id, k))
    return () => {
      offs.forEach((off) => off())
      track.near = false
    }
  }, [track, near, gl, unit.id])

  // the sticky box: view rects are relative to it; its size positions the passports
  const boxRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el || !track) return
      track.box = el
      const ro = new ResizeObserver(() => setSize((s) => (s.w === el.clientWidth && s.h === el.clientHeight ? s : { w: el.clientWidth, h: el.clientHeight })))
      ro.observe(el)
      return () => {
        ro.disconnect()
        if (track.box === el) track.box = null
      }
    },
    [track],
  )

  // the SVG layer's chunk is loaded before a chapter that uses it renders (LecturePage): mount it without a boundary
  const SvgLayer = svgStageLayer()
  const beat = useBeat(unit.id)
  const reading = useTrackContext() // Ground-up or Formal (`track` here is the unit's scroll track)
  const current = useMemo(() => pickTrack(beats[Math.min(beat, beats.length - 1)], reading), [beats, beat, reading])
  const revealed = useRevealed(unit.id, beat)
  const vars = stageCssVars(mainKind(beatLayout(current, revealed))) as React.CSSProperties

  return (
    <div className="story" ref={rootRef} data-unit={unit.id} data-mode="live">
      <div className="story-beats">
        {beats.map((b, i) => (
          <StoryBeat key={b.id} unitId={unit.id} beat={b} index={i} active={i === beat} />
        ))}
      </div>
      <div className="story-stage-col" style={vars}>
        <div className="story-stage" ref={boxRef} data-unit={unit.id} style={vars}>
          {/* a unit without a WebGL kind has no Driver on the canvas: this layer advances its reveals and clock */}
          {track && near && svg.length > 0 && (SvgLayer ? <SvgLayer unitId={unit.id} kinds={svg} ownsClock={gl.length === 0} /> : (
            <Suspense fallback={null}>
              <SvgStage unitId={unit.id} kinds={svg} ownsClock={gl.length === 0} />
            </Suspense>
          ))}
          {track && <StageOverlay unitId={unit.id} kinds={kinds} beat={current} revealed={revealed} size={size} />}
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {`Step ${beat + 1} of ${beats.length}: ${PHASE_LABEL[current.phase]}`}
      </p>
    </div>
  )
}

/** The story of a unit: live 3D stage when possible, else the static reading version. */
export function StoryStage({ unit }: { unit: Unit }) {
  // a unit whose kinds are all SVG needs no WebGL to run live (content/stage.ts KIND_RENDER)
  const kinds = useMemo(() => storyKinds(unit.story ?? []), [unit.story])
  const live = useLiveStage(kinds)
  if (!unit.story?.length) return null
  return live ? <LiveStory unit={unit} /> : <StaticStory unit={unit} />
}
