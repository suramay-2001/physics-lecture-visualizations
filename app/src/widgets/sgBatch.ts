/**
 * The SG widget's tally updater (widgets/SGLab.tsx), in its own module so SGLab.tsx exports only components and fast
 * refresh keeps working. The batch is fired once in the click handler; this updater only adds it to the plate, so it is
 * pure (no random draws) and React may call it twice under StrictMode without changing the result.
 */
import type { Tally } from '../physics/sg'

export function addBatch(batch: Tally): (t: Tally | null) => Tally {
  return (t) =>
    t
      ? { plus: t.plus + batch.plus, minus: t.minus + batch.minus, blocked: batch.blocked.map((b, k) => b + (t.blocked[k] ?? 0)) }
      : { plus: batch.plus, minus: batch.minus, blocked: [...batch.blocked] }
}
