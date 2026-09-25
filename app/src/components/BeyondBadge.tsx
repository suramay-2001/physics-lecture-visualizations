/**
 * "Beyond the lecture" badge (decision #6): marks a beat or unit whose content goes past what the lecture
 * covers. With `info` (Unit.beyondLecture) it also says why and cites the source.
 */
import type { BeyondLecture } from '../content/stage'
import { Rich } from '../ui/Rich'
import { RefList } from './RefList'

export function BeyondBadge({ info }: { info?: BeyondLecture }) {
  if (!info)
    return (
      <span className="beyond-badge" title="This goes past what the lecture covers">
        beyond the lecture
      </span>
    )
  return (
    <div className="beyond-block">
      <span className="beyond-badge">beyond the lecture</span>{' '}
      <span className="beyond-why">
        <Rich as="span" text={info.why} />
      </span>
      <RefList refs={[info.source]} compact />
    </div>
  )
}
