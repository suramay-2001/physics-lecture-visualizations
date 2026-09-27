/**
 * The reading version of a story (W-L1 §2.9): used for < 900 px, no WebGL, or a lost context. It never
 * requests the stage host, so it creates 0 WebGL contexts. Three-free.
 *
 * Beats become a reading column: phase eyebrow, text, caption, the passport line of each kind on stage,
 * flagged fidelity notes as text; clue beats keep click-to-reveal (decision #17, local state here). After
 * the first beat that uses a kind, one existing 2D widget per (unit, kind) shows that beat's state.
 * W0 scope: the component and its data path; W1 wires the live ↔ static swap (keeps the reading position).
 */
import { useId, useMemo, useState } from 'react'
import { fidelityOf } from '../content/fidelity'
import type { Beat, StageKind, Unit } from '../content/schema'
import { layoutStates, passportOf } from '../content/stage'
import { pickTrack } from '../content/track'
import { Derivation } from '../components/Derivation'
import { RefList } from '../components/RefList'
import { Rich } from '../ui/Rich'
import { useTrackContext } from '../ui/trackPref'
import { Widget } from '../widgets/registry'
import { staticWidgetFor } from './staticWidgets'

/** 'core' is the Foundations chapters' first phase (709 F1–F8 have no lecture notes; interface change W-709 #2). */
export const PHASE_LABEL: Record<Beat['phase'], string> = { lecture: 'The lecture says', core: 'The foundation', books: 'The books add', clue: 'Clue' }

function FidelityNotes({ beat }: { beat: Beat }) {
  if (!beat.fidelity?.length) return null
  const items = layoutStates(beat.stage).flatMap((s) => {
    const f = fidelityOf(passportOf(s).fidelityKey)
    return [...f.exact, ...f.schematic, ...f.misleading].filter((i) => beat.fidelity!.includes(i.id))
  })
  if (!items.length) return null
  return (
    <ul className="static-fidelity small">
      {items.map((i) => (
        <li key={i.id}>
          <Rich as="span" text={i.text} />
        </li>
      ))}
    </ul>
  )
}

function StaticBeat({ beat: raw, widgets }: { beat: Beat; widgets: StageKind[] }) {
  const [shown, setShown] = useState(false)
  const answerId = useId()
  // the track picks the text; the stage line, widgets and figures are the same in both (content/track.ts)
  const track = useTrackContext()
  const beat = useMemo(() => pickTrack(raw, track), [raw, track])
  return (
    <article className={`static-beat phase-${beat.phase}`} id={beat.id} data-beat={beat.id}>
      <p className="eyebrow">
        {PHASE_LABEL[beat.phase]}
        {beat.beyondLecture && <span className="beyond-badge"> · beyond the lecture</span>}
      </p>
      <Rich text={beat.text} />
      {beat.derivation && <Derivation d={beat.derivation} track={track} />}
      {beat.reveal && (
        <>
          <button type="button" className="reveal-btn" aria-expanded={shown} aria-controls={answerId} onClick={() => setShown((s) => !s)}>
            {shown ? 'Hide' : 'Show me'}
          </button>
          <div id={answerId} hidden={!shown}>
            {shown && <Rich text={beat.reveal.text} />}
          </div>
        </>
      )}
      <p className="static-stage-line small">
        {layoutStates(shown && beat.reveal?.stage ? beat.reveal.stage : beat.stage).map((s, i) => (
          <span key={i} className="static-passport mono">
            <Rich as="span" text={passportOf(s).title} /> · {passportOf(s).note}
          </span>
        ))}
        {beat.caption && (
          <span className="static-caption">
            {' '}
            — <Rich as="span" text={shown && beat.reveal?.caption ? beat.reveal.caption : beat.caption} />
          </span>
        )}
      </p>
      <FidelityNotes beat={beat} />
      {beat.refs && <RefList refs={beat.refs} compact />}
      {widgets.map((k) => {
        const s = layoutStates(beat.stage).find((x) => x.kind === k)
        const spec = s ? staticWidgetFor(s) : null
        return spec ? <Widget key={k} spec={spec} /> : null
      })}
    </article>
  )
}

export function StaticStory({ unit }: { unit: Unit }) {
  const story = unit.story ?? []
  // one 2D widget per (unit, kind): attached to the first beat that uses the kind
  const seen = new Set<StageKind>()
  const firstUse = story.map((b) => {
    const add: StageKind[] = []
    for (const s of layoutStates(b.stage))
      if (!seen.has(s.kind)) {
        seen.add(s.kind)
        add.push(s.kind)
      }
    return add
  })
  return (
    <div className="static-story" data-unit={unit.id}>
      {story.map((b, i) => (
        <StaticBeat key={b.id} beat={b} widgets={firstUse[i]} />
      ))}
    </div>
  )
}
