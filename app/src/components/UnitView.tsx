import { useState } from 'react'
import type { Unit } from '../content/schema'
import { Rich, Tex } from '../ui/Rich'
import { Widget } from '../widgets/registry'
import { BeyondBadge } from './BeyondBadge'
import { ChallengeCard } from './ChallengeCard'
import { RefList } from './RefList'
import { ReviewCard } from './ReviewCard'
import { StoryStage } from './StoryStage'

function UnitHead({ unit, index }: { unit: Unit; index: string }) {
  return (
    <header className="unit-head">
      <span className="unit-index mono">{index}</span>
      <h2 id={`${unit.id}-title`}>{unit.title}</h2>
      <p className="unit-question">{unit.question}</p>
      {unit.beyondLecture && <BeyondBadge info={unit.beyondLecture} />}
    </header>
  )
}

function TryIt({ unit, label }: { unit: Unit; label: string }) {
  return (
    <div className="stage stage-visual">
      <span className="block-label">{label}</span>
      <Widget spec={unit.visual} />
      <ul className="try-this">
        {unit.visual.tryThis.map((t, i) => (
          <li key={i}>
            <Rich text={t} as="span" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Pitfalls({ unit }: { unit: Unit }) {
  if (!unit.pitfalls) return null
  return (
    <div className="pitfalls">
      <span className="eyebrow">Don't fall for</span>
      <ul>
        {unit.pitfalls.map((p, i) => (
          <li key={i}>
            <Rich text={p} as="span" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Play({ unit, always = false }: { unit: Unit; always?: boolean }) {
  if (!unit.play.length && !always) return null
  return (
    <div className="stage stage-play">
      <span className="block-label">Play</span>
      {unit.play.map((c) => (
        <ChallengeCard key={c.id} c={c} />
      ))}
    </div>
  )
}

/**
 * A unit WITH a story (decision #17): story beats (lecture → books → clues, clues click-to-reveal inside the
 * story) → Try it → intuition → pitfalls → review card → challenges. The separate "lecture says", "books add"
 * and clues blocks are gone: their content and page refs live in the beats.
 */
function StoryUnitView({ unit, index }: { unit: Unit; index: string }) {
  return (
    <section className="unit unit-story" id={unit.id} aria-labelledby={`${unit.id}-title`}>
      <UnitHead unit={unit} index={index} />
      <StoryStage unit={unit} />
      <TryIt unit={unit} label="Try it" />
      <div className="stage stage-intuition">
        <div className="insight" role="note">
          <span className="eyebrow">The intuition</span>
          <Rich text={unit.insight} />
        </div>
        <Pitfalls unit={unit} />
      </div>
      {unit.review && <ReviewCard card={unit.review} unitId={unit.id} />}
      <Play unit={unit} />
    </section>
  )
}

/**
 * One concept, in the order the course asks for:
 * lecture (the basis) → books (depth) → see it (visual) → clues (intuition) → play (challenges).
 * The stage labels are real structure: the order is the method. Units with a story use StoryUnitView.
 */
export function UnitView({ unit, index }: { unit: Unit; index: string }) {
  const [opened, setOpened] = useState(0)
  const [insight, setInsight] = useState(false)
  if (unit.story?.length) return <StoryUnitView unit={unit} index={index} />
  return (
    <section className="unit" id={unit.id} aria-labelledby={`${unit.id}-title`}>
      <UnitHead unit={unit} index={index} />

      <div className="stage stage-lecture">
        <span className="block-label">
          The lecture says <span className="mono">{unit.lecture.pages}</span>
        </span>
        <Rich text={unit.lecture.summary} />
        {unit.lecture.equations && (
          <div className="board">
            {unit.lecture.equations.map((e, i) => (
              <Tex key={i} display>
                {e}
              </Tex>
            ))}
          </div>
        )}
      </div>

      <div className="stage stage-books">
        <span className="block-label">The books add</span>
        <RefList refs={unit.books} />
      </div>

      <TryIt unit={unit} label="See it" />

      <div className="stage stage-clues">
        <span className="block-label">Follow the clues</span>
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
                <button className="btn ghost" onClick={() => setOpened(i + 1)}>
                  I've thought about it. Show me.
                </button>
              ) : null}
            </li>
          ))}
        </ol>
        {opened >= unit.clues.length || insight ? (
          <div className="insight" role="note">
            <span className="eyebrow">The intuition</span>
            <Rich text={unit.insight} />
          </div>
        ) : (
          <button className="btn ghost small-btn" onClick={() => setInsight(true)}>
            Skip to the intuition
          </button>
        )}
        <Pitfalls unit={unit} />
      </div>

      <Play unit={unit} always />
    </section>
  )
}
