/**
 * Fig. 9 of "Tour de gross" (paper-tdg, arXiv:2506.03094, p. 25): what a Pauli measurement on ONE module costs in bicycle measurements, beta = 1 + 6 k (Eq. 17), k being the fewest
 * native rotations that carry a native measurement Q (x) R into the wanted Q (x) P (P a Pauli on the module's other eleven logical qubits, Q the pivot letter on qubit 1).
 *
 * The full table needs a search over all 4^11 = 4 194 304 Paulis for every code, reading and pivot letter. That is the offline computation of pipeline/tdg_fig9.py (numpy;
 * fixture __fixtures__/tdg-fig9.json); TDG_FIG9_OFFLINE below holds its histograms and means as a literal, and the test compares the literal with the fixture, so the app never
 * runs the search. What this file does carry is the engine side that lets the test check the fixture independently:
 *   - the native measurements and rotations of a code, rebuilt from the engine's logical shift matrices (the same sets as tdg.ts `tdgNativeSets` counts: 540 / 245 / 510),
 *   - a Pauli on eleven qubits as one 22-bit integer (x bits 0..10, z bits 11..21; qubit i + 2 sits in bit i) and the transvection a native rotation applies to it,
 *   - the exact distance of one Pauli by a meet-in-the-middle search (two rotations out from the Pauli, two back from the targets), which is exact whenever the distance is at
 *     most 4, and the distance of EVERY Pauli by a breadth-first search (a few seconds, for the test, never for the page).
 * Pure: no clock, no randomness (purity.test.ts).
 */
import { bbCodeOf, logicalShiftMatrix } from './bbfamily'
import { GF2Matrix, popcount } from './gf2'
import type { TdgCode } from './tdg'

export type TdgFig9Q = 'I' | 'X' | 'Y' | 'Z'
export const TDG_FIG9_Q: readonly TdgFig9Q[] = ['I', 'X', 'Y', 'Z']
/** `rotations245`: the shift action the engine computes, rotations about natives with pivot letter X, Y or Z (Eq. 15 as printed); `rotations510`: the same action with the pivot letter I allowed
 * (the 510 the paper's text counts); `hypothetical245`: if every shift acted as A (+) A (what p. 47 states), 245 rotations. */
export type TdgFig9Reading = 'rotations245' | 'rotations510' | 'hypothetical245'
export const TDG_FIG9_READINGS: readonly TdgFig9Reading[] = ['rotations245', 'rotations510', 'hypothetical245']
/** beta = 1 + 6 k for k = 0 .. 4 rotations */
export const TDG_FIG9_BETAS = [1, 7, 13, 19, 25] as const
export type TdgFig9Beta = (typeof TDG_FIG9_BETAS)[number]
/** the number of Paulis on eleven qubits */
export const TDG_FIG9_STATES = 4 ** 11

export interface TdgFig9Summary {
  /** beta -> number of Paulis P with that cost (over all 4^11 Paulis; for the pivot letter I the identity is left out, so 4^11 - 1) */
  hist: Readonly<Record<TdgFig9Beta, number>>
  /** the mean of beta over those Paulis */
  mean: number
}
export interface TdgFig9Entry {
  byQ: Readonly<Record<TdgFig9Q, TdgFig9Summary>>
  /** for each Pauli P the cheapest of Q = X, Y, Z, over all 4^11 Paulis */
  minOverQ: TdgFig9Summary
}

/**
 * Computed offline by pipeline/tdg_fig9.py (4^11 states, a breadth-first search per entry); fixture app/src/physics/__fixtures__/tdg-fig9.json. tdgFig9.test.ts compares this literal with
 * the fixture and recomputes one histogram and a sample of costs in TypeScript.
 */
export const TDG_FIG9_OFFLINE: Readonly<Record<TdgCode, Readonly<Record<TdgFig9Reading, TdgFig9Entry>>>> = {
  gross: {
    rotations245: {
      byQ: {
        I: { hist: { 1: 284, 7: 20892, 13: 1065715, 19: 3098888, 25: 8524 }, mean: 17.426684481307145 },
        X: { hist: { 1: 112, 7: 9605, 13: 441315, 19: 3528309, 25: 214963 }, mean: 18.648240089416504 },
        Y: { hist: { 1: 32, 7: 3603, 13: 218669, 19: 3291416, 25: 680584 }, mean: 19.650329113006592 },
        Z: { hist: { 1: 112, 7: 9605, 13: 441315, 19: 3528309, 25: 214963 }, mean: 18.648240089416504 },
      },
      minOverQ: { hist: { 1: 246, 7: 12579, 13: 490770, 19: 3505249, 25: 185460 }, mean: 18.526206016540527 },
    },
    rotations510: {
      byQ: {
        I: { hist: { 1: 284, 7: 31426, 13: 1703891, 19: 2458194, 25: 508 }, mean: 16.472161167183202 },
        X: { hist: { 1: 112, 7: 18313, 13: 1311750, 19: 2862686, 25: 1443 }, mean: 17.072716236114502 },
        Y: { hist: { 1: 32, 7: 6384, 13: 651507, 19: 3525171, 25: 11210 }, mean: 18.065645694732666 },
        Z: { hist: { 1: 112, 7: 18313, 13: 1311750, 19: 2862686, 25: 1443 }, mean: 17.072716236114502 },
      },
      minOverQ: { hist: { 1: 246, 7: 31044, 13: 1697649, 19: 2464645, 25: 720 }, mean: 16.48265027999878 },
    },
    hypothetical245: {
      byQ: {
        I: { hist: { 1: 284, 7: 20892, 13: 1065715, 19: 3098888, 25: 8524 }, mean: 17.426684481307145 },
        X: { hist: { 1: 112, 7: 9605, 13: 441315, 19: 3528309, 25: 214963 }, mean: 18.648240089416504 },
        Y: { hist: { 1: 32, 7: 3603, 13: 218669, 19: 3291416, 25: 680584 }, mean: 19.650329113006592 },
        Z: { hist: { 1: 112, 7: 9605, 13: 441315, 19: 3528309, 25: 214963 }, mean: 18.648240089416504 },
      },
      minOverQ: { hist: { 1: 246, 7: 12579, 13: 490770, 19: 3505249, 25: 185460 }, mean: 18.526206016540527 },
    },
  },
  'two-gross': {
    rotations245: {
      byQ: {
        I: { hist: { 1: 284, 7: 21094, 13: 1077947, 19: 3086514, 25: 8464 }, mean: 17.4085227032954 },
        X: { hist: { 1: 112, 7: 9895, 13: 454468, 19: 3531364, 25: 198465 }, mean: 18.604994297027588 },
        Y: { hist: { 1: 32, 7: 3613, 13: 220450, 19: 3304116, 25: 666093 }, mean: 19.627023220062256 },
        Z: { hist: { 1: 112, 7: 9895, 13: 454468, 19: 3531364, 25: 198465 }, mean: 18.604994297027588 },
      },
      minOverQ: { hist: { 1: 246, 7: 12953, 13: 506147, 19: 3504477, 25: 170481 }, mean: 18.481711387634277 },
    },
    rotations510: {
      byQ: {
        I: { hist: { 1: 284, 7: 31490, 13: 1716022, 19: 2445983, 25: 524 }, mean: 16.454647411023952 },
        X: { hist: { 1: 112, 7: 18665, 13: 1326928, 19: 2847163, 25: 1436 }, mean: 17.049986839294434 },
        Y: { hist: { 1: 32, 7: 6470, 13: 657704, 19: 3519178, 25: 10920 }, mean: 18.056119918823242 },
        Z: { hist: { 1: 112, 7: 18665, 13: 1326928, 19: 2847163, 25: 1436 }, mean: 17.049986839294434 },
      },
      minOverQ: { hist: { 1: 246, 7: 31640, 13: 1714365, 19: 2447325, 25: 728 }, mean: 16.45704412460327 },
    },
    hypothetical245: {
      byQ: {
        I: { hist: { 1: 284, 7: 21094, 13: 1077947, 19: 3086514, 25: 8464 }, mean: 17.4085227032954 },
        X: { hist: { 1: 112, 7: 9895, 13: 454468, 19: 3531364, 25: 198465 }, mean: 18.604994297027588 },
        Y: { hist: { 1: 32, 7: 3613, 13: 220450, 19: 3304116, 25: 666093 }, mean: 19.627023220062256 },
        Z: { hist: { 1: 112, 7: 9895, 13: 454468, 19: 3531364, 25: 198465 }, mean: 18.604994297027588 },
      },
      minOverQ: { hist: { 1: 246, 7: 12953, 13: 506147, 19: 3504477, 25: 170481 }, mean: 18.481711387634277 },
    },
  },
}

/** The summary behind one bar of Fig. 9: a pivot letter, or 'best' for the cheapest of X, Y, Z per Pauli. */
export function tdgFig9Summary(code: TdgCode, reading: TdgFig9Reading, q: TdgFig9Q | 'best'): TdgFig9Summary {
  const e = TDG_FIG9_OFFLINE[code][reading]
  return q === 'best' ? e.minOverQ : e.byQ[q]
}

/* ------------------------------------------------------------------ native measurements and rotations ------------------------------------------------------------------ */

export interface TdgFig9Native {
  /** |N|: the distinct images of the 15 LPU Paulis under the logical shift actions */
  native: number
  /** for each pivot letter Q, the eleven-qubit parts R of the natives Q (x) R (the search's targets); R = 0 is listed when Q alone is native */
  targets: Readonly<Record<TdgFig9Q, readonly number[]>>
  /** the rotations of Eq. 15 as printed: eleven-qubit parts (non-zero) of natives whose pivot letter is X, Y or Z */
  rotations245: readonly number[]
  /** the same with the pivot letter I allowed */
  rotations510: readonly number[]
}

const LETTER = ['I', 'X', 'Z', 'Y'] as const // index: x bit + 2 z bit of the pivot qubit
const keyOf = (M: GF2Matrix): string => M.toRows().map((r) => r.join('')).join('/')
const nativeCache = new Map<string, TdgFig9Native>()

/** The eleven-qubit part of a 24-bit vector (x1..x12 | z1..z12) as one 22-bit integer: x bits 0..10 (qubits 2..12), z bits 11..21. */
export function tdgFig9Encode(x: readonly number[], z: readonly number[]): number {
  let xs = 0
  let zs = 0
  for (let i = 0; i < 11; i++) {
    xs |= (x[1 + i] & 1) << i
    zs |= (z[1 + i] & 1) << i
  }
  return xs | (zs << 11)
}

/**
 * The natives of a code from the engine's logical shift matrices. The matrices of all l m translations are x^a y^b -> Mx^a My^b (a translation acts on the logical operators as a
 * homomorphism), built from the two engine matrices of x and y; `action = 'hypothetical'` copies the upper 6 x 6 block onto the lower one (A (+) A, as p. 47 states).
 */
export function tdgFig9Native(code: TdgCode, action: 'actual' | 'hypothetical' = 'actual'): TdgFig9Native {
  const ck = `${code}/${action}`
  const hit = nativeCache.get(ck)
  if (hit) return hit
  const bb = bbCodeOf(code)
  const Mx = logicalShiftMatrix(bb, code, 1, 0)
  const My = logicalShiftMatrix(bb, code, 0, 1)
  const mats = new Map<string, GF2Matrix>()
  let row = GF2Matrix.identity(12)
  for (let a = 0; a < bb.l; a++) {
    let M = row
    for (let b = 0; b < bb.m; b++) {
      let use = M
      if (action === 'hypothetical') {
        use = GF2Matrix.zeros(12, 12)
        for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (M.get(i, j)) { use.set(i, j, 1); use.set(i + 6, j + 6, 1) }
      }
      mats.set(keyOf(use), use)
      M = M.mul(My)
    }
    row = row.mul(Mx)
  }
  // the natives: x -> M x and z -> M^-T z for the 15 non-trivial Paulis on logical qubits 1 and 7 (x1, z1, x7, z7)
  const members = new Set<number>() // pivot-x bit, pivot-z bit and the 22-bit rest in one integer
  for (const M of mats.values()) {
    const Zmap = M.inverse().transpose()
    for (let m = 1; m < 16; m++) {
      const x = new Array<number>(12).fill(0)
      const z = new Array<number>(12).fill(0)
      x[0] = m & 1
      z[0] = (m >> 1) & 1
      x[6] = (m >> 2) & 1
      z[6] = (m >> 3) & 1
      const xi = M.mulVec(x)
      const zi = Zmap.mulVec(z)
      members.add(tdgFig9Encode(xi, zi) + (xi[0] + 2 * zi[0]) * (1 << 22))
    }
  }
  const targets: Record<TdgFig9Q, number[]> = { I: [], X: [], Y: [], Z: [] }
  const r245 = new Set<number>()
  const r510 = new Set<number>()
  for (const s of members) {
    const rest = s % (1 << 22)
    const letter = LETTER[Math.floor(s / (1 << 22))]
    targets[letter].push(rest)
    if (rest !== 0) {
      r510.add(rest)
      if (letter !== 'I') r245.add(rest)
    }
  }
  const sorted = (a: Iterable<number>): number[] => [...a].sort((u, v) => u - v)
  const out: TdgFig9Native = {
    native: members.size,
    targets: { I: sorted(targets.I), X: sorted(targets.X), Y: sorted(targets.Y), Z: sorted(targets.Z) },
    rotations245: sorted(r245),
    rotations510: sorted(r510),
  }
  nativeCache.set(ck, out)
  return out
}

/* ------------------------------------------------------------------ the transvection and the searches ------------------------------------------------------------------ */

const MASK = (1 << 11) - 1
const PARITY = Uint8Array.from({ length: 1 << 11 }, (_, i) => popcount(i) & 1)

/** Do the Paulis p and g (22-bit encodings) anticommute? */
export const tdgFig9Anticommute = (p: number, g: number): boolean => PARITY[((p & MASK) & (g >> 11)) ^ ((p >> 11) & (g & MASK))] === 1

/** A native rotation about g carries p to p g when they anticommute and fixes it otherwise. */
export const tdgFig9Transvect = (p: number, g: number): number => (tdgFig9Anticommute(p, g) ? p ^ g : p)

/** The distance of every Pauli to a set of targets (-1 where none is reachable): a breadth-first search from the targets, each level expanded from its smaller side. */
export function tdgFig9Distances(rotations: readonly number[], targets: readonly number[]): Int8Array {
  const n = rotations.length
  const gx = Int32Array.from(rotations, (g) => g & MASK)
  const gz = Int32Array.from(rotations, (g) => g >> 11)
  const dist = new Int8Array(TDG_FIG9_STATES).fill(-1)
  for (const t of targets) dist[t] = 0
  let frontier = Int32Array.from(new Set(targets))
  let visited = frontier.length
  for (let k = 1; frontier.length > 0; k++) {
    if (frontier.length <= TDG_FIG9_STATES - visited) {
      for (const p of frontier) {
        const px = p & MASK
        const pz = p >> 11
        for (let j = 0; j < n; j++) {
          if (PARITY[(px & gz[j]) ^ (pz & gx[j])]) {
            const c = p ^ (gx[j] | (gz[j] << 11))
            if (dist[c] < 0) dist[c] = k
          }
        }
      }
    } else {
      for (let p = 0; p < TDG_FIG9_STATES; p++) {
        if (dist[p] >= 0) continue
        const px = p & MASK
        const pz = p >> 11
        for (let j = 0; j < n; j++) {
          if (PARITY[(px & gz[j]) ^ (pz & gx[j])] && dist[p ^ (gx[j] | (gz[j] << 11))] === k - 1) {
            dist[p] = k
            break
          }
        }
      }
    }
    const next: number[] = []
    for (let p = 0; p < TDG_FIG9_STATES; p++) if (dist[p] === k) next.push(p)
    frontier = Int32Array.from(next)
    visited += frontier.length
  }
  return dist
}

/** beta -> count (and the mean of beta) over the Paulis with a distance, from a distance table. */
export function tdgFig9Histogram(dist: Int8Array): TdgFig9Summary {
  const counts = [0, 0, 0, 0, 0]
  for (let p = 0; p < dist.length; p++) if (dist[p] >= 0) counts[dist[p]]++
  const total = counts.reduce((s, c) => s + c, 0)
  const sum = counts.reduce((s, c, k) => s + (1 + 6 * k) * c, 0)
  return { hist: { 1: counts[0], 7: counts[1], 13: counts[2], 19: counts[3], 25: counts[4] }, mean: sum / total }
}

/** The ball of radius `depth` around the targets: dist[p] = the fewest rotations (at most `depth`) that carry p to a target, -1 beyond. */
export function tdgFig9Ball(rotations: readonly number[], targets: readonly number[], depth: number): Int8Array {
  const dist = new Int8Array(TDG_FIG9_STATES).fill(-1)
  let frontier: number[] = []
  for (const t of targets) {
    if (dist[t] < 0) {
      dist[t] = 0
      frontier.push(t)
    }
  }
  for (let k = 1; k <= depth; k++) {
    const next: number[] = []
    for (const p of frontier)
      for (const g of rotations)
        if (tdgFig9Anticommute(p, g)) {
          const c = p ^ g
          if (dist[c] < 0) {
            dist[c] = k
            if (k < depth) next.push(c)
          }
        }
    frontier = next
  }
  return dist
}

/**
 * The fewest rotations that carry the Pauli p to a target, by meeting in the middle: every walk of at most two rotations out from p (about 60 000 for 245 rotations) joined to
 * `back`, the ball of radius two around the targets (tdgFig9Ball(..., 2)). Exact whenever the distance is at most 4 (a shortest path splits two from each end); null beyond.
 */
export function tdgFig9Distance(p: number, rotations: readonly number[], back: Int8Array): number | null {
  let best = 99
  const visit = (s: number, steps: number): void => {
    const b = back[s]
    if (b >= 0 && steps + b < best) best = steps + b
  }
  visit(p, 0)
  for (const g of rotations) {
    if (!tdgFig9Anticommute(p, g)) continue
    const s1 = p ^ g
    visit(s1, 1)
    for (const h of rotations) if (tdgFig9Anticommute(s1, h)) visit(s1 ^ h, 2)
  }
  return best === 99 ? null : best
}
