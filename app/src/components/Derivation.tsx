/**
 * A beat's derivation (W-709-platform §B; the approved Cryostat mockup's `.deriv`). At rest every line shows, numbered,
 * each with why it holds and the line itself; "Step through" shows them one at a time (Back / Next step, or ← / → on the
 * buttons), and "Show all" returns to rest. Printing always shows every line (styles/print.css).
 *
 * Accessibility: native buttons with visible labels; the stepping buttons are never `disabled` (a disabled button
 * drops keyboard focus to <body>), they carry `aria-disabled` at the ends instead; the current line is
 * `aria-current="step"` and a polite live region says "Line 3 of 6". Motion: a new line fades in only when motion is on
 * (`html[data-motion='on']`, the topbar toggle and prefers-reduced-motion); otherwise it simply appears.
 *
 * "Derivations drive the stage" (interface change W-709 #11): stepping, or focusing/clicking a line at rest, selects
 * it (`data-state`/`aria-pressed`, keyboard-accessible by Tab) and — in the live story only (`unitId`/`index` given,
 * and this is the beat under the centre line) — moves the beat's stage to that line's effective view
 * (`content/track.ts` `derivViewAt`, `stage/store.ts` `setDerivOverride`). Leaving the beat or pressing "Show all"
 * returns the stage to the beat-driven state. Read mode and print (`unitId` omitted) draw a figure strip after the
 * derivation instead, one `FigureFor` per distinct view (`content/track.ts` `derivFigureGroups`), lettered onto the
 * beat's own figure number.
 */
import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import type { CourseId, Track } from '../content/courses'
import type { Derivation as DerivationData } from '../content/schema'
import { derivFigureGroups, derivViewAt } from '../content/track'
import { FigureFor } from '../stage/figures/FigureFor'
import { setDerivOverride, useBeat } from '../stage/store'
import { Rich, Tex } from '../ui/Rich'

export function Derivation({
  d,
  track,
  unitId,
  index,
  figureNumber,
  course,
}: {
  d: DerivationData
  track: Track
  /** Live story only (components/StoryStage.tsx): drives the beat's stage while this is the active beat. */
  unitId?: string
  /** This beat's position in its unit's story (paired with `unitId`). */
  index?: number
  /** Read mode / print only (stage/StaticStory.tsx): the beat's own figure number, lettered for the strip. */
  figureNumber?: string
  /** Read mode / print only: the course, for the strip's passports. */
  course?: CourseId
}) {
  const steps = d[track]
  const n = steps.length
  const [stepping, setStepping] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const listId = useId()
  const live = unitId !== undefined && index !== undefined
  // always called (rules of hooks): harmless when !live (unitId defaults to '', never a real UnitTrack)
  const activeBeatIndex = useBeat(unitId ?? '')
  const isActiveBeat = live && activeBeatIndex === index

  const k = active ?? 0
  const go = (to: number) => setActive(Math.max(0, Math.min(n - 1, to)))
  const select = (i: number) => setActive(i)
  const onKey = (e: KeyboardEvent) => {
    if (!stepping) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(k + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(k - 1)
    }
  }

  // live only: push the active line's effective view (or null) to the stage store; leaving the beat clears it
  useEffect(() => {
    if (!live) return
    if (!isActiveBeat) {
      setStepping(false)
      setActive(null)
      return
    }
    const hit = active == null ? null : derivViewAt(steps, active)
    setDerivOverride(unitId!, hit?.view ? { layout: hit.view, caption: hit.viewCaption } : null)
  }, [live, isActiveBeat, active, steps, unitId])

  if (!n) return null
  const figureGroups = live ? [] : derivFigureGroups(steps)
  return (
    <div className="deriv" data-stepping={stepping ? 'on' : 'off'} data-track={track}>
      <div className="deriv-head">
        <span className="eyebrow">Derivation</span>
        <span className="deriv-result">
          <Tex>{d.result}</Tex>
        </span>
        <span className="deriv-tools" onKeyDown={onKey}>
          {stepping && (
            <>
              <button type="button" className="deriv-back" aria-disabled={k === 0} aria-controls={listId} onClick={() => go(k - 1)}>
                Back
              </button>
              <button type="button" className="deriv-next" aria-disabled={k === n - 1} aria-controls={listId} onClick={() => go(k + 1)}>
                Next step
              </button>
            </>
          )}
          <button
            type="button"
            className="deriv-toggle"
            aria-pressed={stepping}
            aria-controls={listId}
            onClick={() => {
              const turningOn = !stepping
              setStepping(turningOn)
              setActive(turningOn ? 0 : null)
            }}
          >
            {stepping ? 'Show all' : 'Step through'}
          </button>
        </span>
      </div>
      <ol className="deriv-steps" id={listId} aria-label={`Derivation, ${n} lines`}>
        {steps.map((s, i) => {
          const state = !stepping ? undefined : i < k ? 'done' : i === k ? 'now' : 'later'
          return (
            <li
              key={i}
              data-state={state}
              aria-current={state === 'now' ? 'step' : undefined}
              // at-rest selection moves the live stage (W-709 #11); Read mode's lines stay plain text, as before
              {...(live && !stepping
                ? { 'aria-pressed': active === i, tabIndex: 0, role: 'button', onClick: () => select(i), onFocus: () => select(i) }
                : {})}
            >
              <Rich className="why" text={s.why} />
              <Tex display>{s.tex}</Tex>
            </li>
          )
        })}
      </ol>
      <p className="visually-hidden" aria-live="polite">
        {stepping ? `Line ${k + 1} of ${n}` : ''}
      </p>
      {!live && figureNumber && figureGroups.length > 0 && (
        <div className="deriv-figures">
          {figureGroups.map((g, gi) => (
            <FigureFor
              key={gi}
              layout={g.view}
              number={`${figureNumber}${String.fromCharCode(97 + gi)}`}
              caption={g.from === g.to ? `line ${g.from}` : `lines ${g.from}–${g.to}`}
              course={course}
            />
          ))}
        </div>
      )}
    </div>
  )
}
