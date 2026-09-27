/**
 * A beat's derivation (W-709-platform §B; the approved Cryostat mockup's `.deriv`). At rest every line shows, numbered,
 * each with why it holds and the line itself; "Step through" shows them one at a time (Back / Next step, or ← / → on the
 * buttons), and "Show all" returns to rest. Printing always shows every line (styles/print.css).
 *
 * Accessibility: native buttons with visible labels; the stepping buttons are never `disabled` (a disabled button
 * drops keyboard focus to <body>), they carry `aria-disabled` at the ends instead; the current line is
 * `aria-current="step"` and a polite live region says "Line 3 of 6". Motion: a new line fades in only when motion is on
 * (`html[data-motion='on']`, the topbar toggle and prefers-reduced-motion); otherwise it simply appears.
 */
import { useId, useState, type KeyboardEvent } from 'react'
import type { Track } from '../content/courses'
import type { Derivation as DerivationData } from '../content/schema'
import { Rich, Tex } from '../ui/Rich'

export function Derivation({ d, track }: { d: DerivationData; track: Track }) {
  const steps = d[track]
  const n = steps.length
  const [stepping, setStepping] = useState(false)
  const [k, setK] = useState(0)
  const listId = useId()
  const go = (to: number) => setK(Math.max(0, Math.min(n - 1, to)))
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
  if (!n) return null
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
              setStepping((s) => !s)
              setK(0)
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
            <li key={i} data-state={state} aria-current={state === 'now' ? 'step' : undefined}>
              <Rich className="why" text={s.why} />
              <Tex display>{s.tex}</Tex>
            </li>
          )
        })}
      </ol>
      <p className="visually-hidden" aria-live="polite">
        {stepping ? `Line ${k + 1} of ${n}` : ''}
      </p>
    </div>
  )
}
