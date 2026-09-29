import { useMemo, useState } from 'react'
import type { Challenge, ChoiceChallenge, NumericChallenge, OrderChallenge, WalkStep } from '../content/schema'
import { progress, useProgress } from '../progress'
import { Rich } from '../ui/Rich'
import { parseNumber } from '../ui/parseNumber'
import { Widget } from '../widgets/registry'
import { RefList } from './RefList'

type Verdict = { ok: boolean; text: string } | null

/** Deterministic shuffle so an order puzzle looks the same on every visit (and in tests). */
function shuffled<T>(xs: T[], seed: string): T[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const out = xs.map((x, i) => ({ x, k: Math.imul(h ^ (i * 2654435761), 1597334677) >>> 0 }))
  out.sort((a, b) => a.k - b.k)
  const res = out.map((o) => o.x)
  // never hand back the solved order
  return res.every((x, i) => x === xs[i]) && xs.length > 1 ? [...res.slice(1), res[0]] : res
}

function ChoiceInput({ c, onVerdict }: { c: ChoiceChallenge; onVerdict: (v: Verdict) => void }) {
  const [pick, setPick] = useState<number | null>(null)
  return (
    <fieldset className="choices">
      <legend className="visually-hidden">Choose one answer</legend>
      {c.options.map((o, i) => (
        <label key={i} className={pick === i ? 'choice picked' : 'choice'}>
          <input type="radio" name={c.id} checked={pick === i} onChange={() => setPick(i)} />
          <Rich text={o.text} as="span" />
        </label>
      ))}
      <button className="btn" disabled={pick === null} onClick={() => {
        const o = c.options[pick!]
        onVerdict({ ok: o.correct, text: o.why })
      }}>Check answer</button>
    </fieldset>
  )
}

function NumericInput({ c, onVerdict }: { c: NumericChallenge; onVerdict: (v: Verdict) => void }) {
  const [raw, setRaw] = useState('')
  const val = parseNumber(raw)
  function check() {
    if (val === null) return
    const ok = Math.abs(val - c.answer) <= c.tolerance
    onVerdict({
      ok,
      text: ok
        ? `Correct: ${c.answer.toPrecision(4)}${c.unit ? ' ' + c.unit : ''}.`
        : Math.abs(val - c.answer) <= c.tolerance * 20
          ? 'Close, but not within tolerance. Check a factor of ½ or a square.'
          : 'Not quite. A hint might help.',
    })
  }
  return (
    <div className="numeric">
      <label>
        <span className="visually-hidden">Your answer</span>
        <input className="answer-input" value={raw} onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 3/4, √3/2, cos(pi/8)^2" inputMode="text" autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && val !== null && check()} />
      </label>
      {c.unit && <span className="answer-unit">{c.unit}</span>}
      <button className="btn" disabled={val === null} onClick={check}>Check answer</button>
      {raw && (
        <span className="mono small parsed">{val === null ? "couldn't read that. Try 0.75, 3/4 or sqrt(3)/2" : `read as ${val.toPrecision(6)}`}</span>
      )}
    </div>
  )
}

function OrderInput({ c, onVerdict }: { c: OrderChallenge; onVerdict: (v: Verdict) => void }) {
  const [items, setItems] = useState(() => shuffled(c.steps, c.id))
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d
      if (j < 0 || j >= xs.length) return xs
      const ys = [...xs]
      ;[ys[i], ys[j]] = [ys[j], ys[i]]
      return ys
    })
  return (
    <div className="order">
      <ol>
        {items.map((s, i) => (
          // A step may repeat (Deutsch's circuit has H twice): key by the text and which copy of it this is.
          <li key={`${s}#${items.slice(0, i).filter((x) => x === s).length}`}>
            <Rich text={s} as="span" />
            <span className="order-buttons">
              <button className="btn ghost" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn ghost" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
            </span>
          </li>
        ))}
      </ol>
      <button className="btn" onClick={() => {
        const firstWrong = items.findIndex((s, i) => s !== c.steps[i])
        onVerdict(firstWrong === -1
          ? { ok: true, text: 'Right order. Each step uses only what came before it.' }
          : { ok: false, text: `Steps 1–${firstWrong} are right. Step ${firstWrong + 1} doesn't follow yet.` })
      }}>Check order</button>
    </div>
  )
}

export function Walkthrough({ steps, startOpen = false }: { steps: WalkStep[]; startOpen?: boolean }) {
  const [shown, setShown] = useState(startOpen ? steps.length : 1)
  return (
    <ol className="walkthrough">
      {steps.slice(0, shown).map((s, i) => (
        <li key={i}>
          <Rich text={s.text} />
          {s.show && <Widget spec={s.show} />}
        </li>
      ))}
      {shown < steps.length && (
        <li className="walk-next">
          <button className="btn ghost" onClick={() => setShown((n) => n + 1)}>Next step ({shown}/{steps.length})</button>
          <button className="btn ghost" onClick={() => setShown(steps.length)}>Show all</button>
        </li>
      )}
    </ol>
  )
}

export function ChallengeCard({ c }: { c: Challenge }) {
  const p = useProgress()
  const rec = p.challenges[c.id]
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [hints, setHints] = useState(0)
  const [walk, setWalk] = useState(false)
  const input = useMemo(() => {
    const on = (v: Verdict) => {
      setVerdict(v)
      if (v) progress.attempt(c.id, v.ok)
    }
    if (c.kind === 'choice') return <ChoiceInput c={c} onVerdict={on} />
    if (c.kind === 'numeric') return <NumericInput c={c} onVerdict={on} />
    return <OrderInput c={c} onVerdict={on} />
  }, [c])

  return (
    <article className={`challenge tier-${c.tier}`} id={c.id}>
      <header>
        <span className="chip">{c.tier}</span>
        <h4>{c.title}</h4>
        {rec?.solved && <span className="solved" aria-label="solved">✓ solved</span>}
      </header>
      <Rich text={c.prompt} />
      {c.widget && <Widget spec={c.widget} />}
      {input}
      {verdict && (
        <div className={verdict.ok ? 'verdict ok' : 'verdict bad'} role="status">
          <Rich text={verdict.text} />
        </div>
      )}
      <div className="help-row">
        {c.hints.slice(0, hints).map((h, i) => (
          <div key={i} className="hint">
            <span className="eyebrow">Hint {i + 1}</span>
            <Rich text={h.text} />
          </div>
        ))}
        <div className="preset-row">
          {hints < 3 && (
            <button className="btn ghost" onClick={() => { setHints(hints + 1); progress.hint(c.id, hints + 1) }}>
              {hints === 0 ? 'Give me a hint' : `Next hint (${hints + 1}/3)`}
            </button>
          )}
          {!c.assigned && (
            <button className="btn ghost" onClick={() => { setWalk((w) => !w); progress.peek(c.id) }} aria-expanded={walk}>
              {walk ? 'Hide walkthrough' : 'Walk me through it'}
            </button>
          )}
        </div>
        {c.assigned && (
          <p className="assigned-note small">
            Assigned as homework ({c.assigned}), so you get hints only, no walkthrough. The work stays yours.
          </p>
        )}
        {walk && !c.assigned && <Walkthrough steps={c.walkthrough} />}
      </div>
      {c.refs && <RefList refs={c.refs} compact />}
    </article>
  )
}
