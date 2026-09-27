import { useEffect, useRef, useState } from 'react'
import type { Unit } from '../content/schema'
import { pickInsight, pickReview } from '../content/track'
import { stage, useStageFlag } from '../stage/store'
import { useTrackContext } from '../ui/trackPref'
import { chapterCount, chapterSteps, stepId, type StepKey } from './chapters'
import { Rich, Tex } from '../ui/Rich'
import { Widget } from '../widgets/registry'
import { BeyondBadge } from './BeyondBadge'
import { ChallengeCard } from './ChallengeCard'
import { RefList } from './RefList'
import { ReviewCard } from './ReviewCard'
import { StoryStage } from './StoryStage'

/** Scroll to a step anchor inside the page (the HashRouter owns location.hash, so no plain #fragment links). */
export function scrollToAnchor(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ block: 'start', behavior: stage.motion ? 'smooth' : 'auto' })
}

/** Chapter card (Phase 4a): "02 / 05", the title and the unit's question, and the chapter's own route of steps. */
function ChapterCard({ unit, index, position }: { unit: Unit; index: string; position: { k: number; n: number } }) {
  const ref = useRef<HTMLElement>(null)
  const motion = useStageFlag('motion')
  const [shown, setShown] = useState(!motion)
  useEffect(() => {
    const el = ref.current
    if (!motion || !el || typeof IntersectionObserver === 'undefined') return setShown(true)
    // motion list §4 item 3: the counter and title settle in once, as the card crosses 60 % of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -40% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [motion])
  const steps = chapterSteps(unit)
  return (
    <header ref={ref} className="unit-head chapter-card" data-shown={shown}>
      <p className="chapter-meta">
        <span className="chapter-count mono">{chapterCount(position.k, position.n)}</span>
        <span className="unit-index mono">{index}</span>
      </p>
      <h2 id={`${unit.id}-title`}>{unit.title}</h2>
      <p className="unit-question">{unit.question}</p>
      {unit.beyondLecture && <BeyondBadge info={unit.beyondLecture} />}
      <ol className="step-strip" aria-label="In this chapter">
        {steps.map((st) => (
          <li key={st.key}>
            <a
              href={`#${stepId(unit.id, st.key)}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToAnchor(stepId(unit.id, st.key))
              }}
            >
              {st.label}
            </a>
          </li>
        ))}
      </ol>
    </header>
  )
}

/** Invisible target of a step link and of the route rail's "you are here". */
const Anchor = ({ unit, step }: { unit: Unit; step: StepKey }) => <span id={stepId(unit.id, step)} className="step-anchor" aria-hidden="true" />

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
function StoryUnitView({ unit, index, position }: { unit: Unit; index: string; position: { k: number; n: number } }) {
  const track = useTrackContext()
  return (
    <section className="unit unit-story" id={unit.id} aria-labelledby={`${unit.id}-title`}>
      <ChapterCard unit={unit} index={index} position={position} />
      <Anchor unit={unit} step="story" />
      <StoryStage unit={unit} />
      <Anchor unit={unit} step="try" />
      <TryIt unit={unit} label="Try it" />
      <Anchor unit={unit} step="intuition" />
      <div className="stage stage-intuition">
        <div className="insight" role="note">
          <span className="eyebrow">The intuition</span>
          <Rich text={pickInsight(unit, track)} />
        </div>
        {unit.pitfalls?.length ? <Anchor unit={unit} step="pitfalls" /> : null}
        <Pitfalls unit={unit} />
      </div>
      {unit.review && <Anchor unit={unit} step="takeaway" />}
      {unit.review && <ReviewCard card={pickReview(unit.review, track)} unitId={unit.id} />}
      {unit.play.length > 0 && <Anchor unit={unit} step="play" />}
      <Play unit={unit} />
    </section>
  )
}

/**
 * One concept, in the order the course asks for:
 * lecture (the basis) → books (depth) → see it (visual) → clues (intuition) → play (challenges).
 * The stage labels are real structure: the order is the method. Units with a story use StoryUnitView.
 */
export function UnitView({ unit, index, position = { k: 0, n: 1 } }: { unit: Unit; index: string; position?: { k: number; n: number } }) {
  const [opened, setOpened] = useState(0)
  const [insight, setInsight] = useState(false)
  const track = useTrackContext()
  if (unit.story?.length) return <StoryUnitView unit={unit} index={index} position={position} />
  return (
    <section className="unit" id={unit.id} aria-labelledby={`${unit.id}-title`}>
      <ChapterCard unit={unit} index={index} position={position} />

      <Anchor unit={unit} step="lecture" />
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

      <Anchor unit={unit} step="books" />
      <div className="stage stage-books">
        <span className="block-label">The books add</span>
        <RefList refs={unit.books} />
      </div>

      <Anchor unit={unit} step="see" />
      <TryIt unit={unit} label="See it" />

      <Anchor unit={unit} step="clues" />
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
            <Rich text={pickInsight(unit, track)} />
          </div>
        ) : (
          <button className="btn ghost small-btn" onClick={() => setInsight(true)}>
            Skip to the intuition
          </button>
        )}
        <Pitfalls unit={unit} />
      </div>

      <Anchor unit={unit} step="play" />
      <Play unit={unit} always />
    </section>
  )
}
