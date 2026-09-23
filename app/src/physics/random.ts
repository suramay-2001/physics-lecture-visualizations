/**
 * Seeded randomness so a game round can be replayed exactly (and tested), plus the
 * finite-sample statistics that tell a player whether a count is surprising.
 */

/** mulberry32: tiny, fast, good enough for teaching simulations. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function binomialSample(n: number, p: number, rand: () => number): number {
  let k = 0
  for (let i = 0; i < n; i++) if (rand() < p) k++
  return k
}

/** Standard deviation of the count of successes in n trials (Reif §1.4–1.6). */
export const binomialStd = (n: number, p: number): number => Math.sqrt(n * p * (1 - p))

/** How many standard deviations an observed count sits from its expectation. */
export const zScore = (k: number, n: number, p: number): number => {
  const s = binomialStd(n, p)
  return s === 0 ? (k === n * p ? 0 : Infinity) : (k - n * p) / s
}

/** Exact binomial pmf, computed in log space so n in the thousands is safe. */
export function binomialPmf(k: number, n: number, p: number): number {
  if (p <= 0) return k === 0 ? 1 : 0
  if (p >= 1) return k === n ? 1 : 0
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p))
}

function logChoose(n: number, k: number): number {
  let s = 0
  for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i)
  return s
}
