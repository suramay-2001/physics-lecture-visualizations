# Pattern: a claim and its numpy twin

Every number a learner reads comes from the engine (`app/src/content/qc709/F1.values.ts`) and is backed by a
keyed `claim()` (`app/src/content/qc709/F1.story.ts`), checked at 1e-12 against an **independently computed**
numpy value (`pipeline/claims_qc709/f1.py`). Three files, one key: `f1ISquared`.

```ts
// F1.values.ts — 1. the engine value
import { I, mul } from '../../physics/complex'
export const V = { f1ISquared: mul(I, I).re /* −1 */ }
```

```ts
// F1.story.ts — 2. the claim, used in a beat's `claims: [...]`
import { V, claim, close } from './F1.values'
export const C = { iSquared: claim('f1ISquared', 'i² = −1', () => close(V.f1ISquared, -1)) }
```

```python
# pipeline/claims_qc709/f1.py — 3. the independent numpy twin (routes OTHER than the engine's)
import numpy as np
out['f1ISquared'] = float(np.real(np.complex128(1j) * np.complex128(1j)))  # −1
# ... one line per key ..., then written to app/src/physics/__fixtures__/claims-qc709/f1.json
```

`claim(id, humanStatement, check)` — `id` is globally unique across both courses (`content/values.ts`
`mergeValues` throws on a duplicate). Run the Python script twice from the repo root: the JSON output must be
**byte-identical** both times (no nondeterministic ordering, no unseeded-random drift).

## What makes this trustworthy

The engine multiplies complex parts by hand and takes integer powers by repeated squaring; the numpy twin uses a
built-in complex type and library calls instead. **Agreement between two differently-implemented routes is
evidence; agreement between the same formula typed twice is not.** `content/claims.test.ts` checks every engine
value against its fixture at 1e-12, and *separately* checks that every number displayed in content matches its
claim's formatted value — two different tests, because a claim can be numerically right while the *prose* still
states the wrong thing (which is exactly what `06-chapter-review`'s independent recompute step catches).

## A value the twin must NOT do

`P-F1-review.md` item 20 flagged twins that were **literals, not computations** (`f1Re34`, `f1Im34`, …) — a twin
that just restates the expected number defeats the whole independent-route requirement. Always compute it, even
when it looks trivial (`float(np.real(3 + 4j))`, not `3.0`).
