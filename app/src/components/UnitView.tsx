import { useState } from 'react'
import type { Unit } from '../content/schema'
import { Rich, Tex } from '../ui/Rich'
import { Widget } from '../widgets/registry'
import { ChallengeCard } from './ChallengeCard'
import { RefList } from './RefList'

/**
 * One concept, in the order the course asks for:
 * lecture (the basis) → books (depth) → see it (visual) → clues (intuition) → play (challenges).
 * The stage labels are real structure: the order is the method.
 */
export function UnitView({ unit, index }: { unit: Unit; index: string }) {
  const [opened, setOpened] = useState(0)
  const [insight, setInsight] = useState(false)
  return (
    <section className="unit" id={unit.id} aria-labelledby={`${unit.id}-title`}>
      <header className="unit-head">
        <span className="unit-index mono">{index}</span>
        <h2 id={`${unit.id}-title`}>{unit.title}</h2>
        <p className="unit-question">{unit.question}</p>
      </header>

      <div className="stage stage-lecture">
        <span className="stage-label">The lecture says <span className="mono">{unit.lecture.pages}</span></span>
        <Rich text={unit.lecture.summary} />
        {unit.lecture.equations && (
          <div className="board">
            {unit.lecture.equations.map((e, i) => (
              <Tex key={i} display>{e}</Tex>
            ))}
          </div>
        )}
      </div>

      <div className="stage stage-books">
        <span className="stage-label">The books add</span>
        <RefList refs={unit.books} />
      </div>

      <div className="stage stage-visual">
        <span className="stage-label">See it</span>
        <Widget spec={unit.visual} />
        <ul className="try-this">
          {unit.visual.tryThis.map((t, i) => (
            <li key={i}><Rich text={t} as="span" /></li>
          ))}
        </ul>
      </div>

      <div className="stage stage-clues">
        <span className="stage-label">Follow the clues</span>
        <ol className="clues">
          {unit.clues.map((c, i) => (
            <li key={i} className={i < opened ? 'open' : ''}>
              <Rich text={c.ask} />
              {i < opened ? (
                <div className="clue-reveal">
                  <Rich text={c.reveal} />
                  {c.show && <Widget spec={c.show} />}
                </div>
              ) : i === opened ? (
                <button className="btn ghost" onClick={() => setOpened(i + 1)}>I've thought about it. Show me.</button>
              ) : null}
            </li>
          ))}
        </ol>
        {(opened >= unit.clues.length || insight) ? (
          <div className="insight" role="note">
            <span className="eyebrow">The intuition</span>
            <Rich text={unit.insight} />
          </div>
        ) : (
          <button className="btn ghost small-btn" onClick={() => setInsight(true)}>Skip to the intuition</button>
        )}
        {unit.pitfalls && (
          <div className="pitfalls">
            <span className="eyebrow">Don't fall for</span>
            <ul>
              {unit.pitfalls.map((p, i) => <li key={i}><Rich text={p} as="span" /></li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="stage stage-play">
        <span className="stage-label">Play</span>
        {unit.play.map((c) => (
          <ChallengeCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  )
}
