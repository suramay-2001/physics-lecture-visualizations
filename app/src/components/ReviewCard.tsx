/**
 * The exam-review layer (PLAN "Readers"): one card per unit — ≤ 5 points, one display equation line and
 * "the one trap". Authored by P in `Unit.review`; the lints (≤ 25-word sentences) live in P's tests.
 */
import type { ReviewCard as Review } from '../content/stage'
import { Rich, Tex } from '../ui/Rich'

export function ReviewCard({ card, unitId }: { card: Review; unitId: string }) {
  const headId = `${unitId}-review`
  return (
    <aside className="review-card" aria-labelledby={headId} data-unit={unitId}>
      <p className="eyebrow" id={headId}>
        Review card
      </p>
      <ul className="review-points">
        {card.points.map((p, i) => (
          <li key={i}>
            <Rich as="span" text={p} />
          </li>
        ))}
      </ul>
      <div className="review-equations">
        <Tex display>{card.equations}</Tex>
      </div>
      <p className="review-trap">
        <strong>The one trap: </strong>
        <Rich as="span" text={card.trap} />
      </p>
    </aside>
  )
}
