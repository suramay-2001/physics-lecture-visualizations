/**
 * An opener film by name: the lazy entry point of the home page and of a unit's opener (components/UnitOpener.tsx). The
 * caption table (openers/openerCopy.ts) is read here, inside the lazy chunk, so it stays out of the first paint
 * (build/chunks.test.ts rule (l)); a caller that needs only the title uses openers/openerTitles.ts.
 */
import OpenerScrub, { type OpenerProps } from './OpenerScrub'
import { OPENERS } from './openerCopy'
import type { OpenerName } from './openerTitles'

export default function OpenerByName({ name, level }: { name: OpenerName; level?: OpenerProps['level'] }) {
  return <OpenerScrub spec={OPENERS[name]} level={level} />
}
