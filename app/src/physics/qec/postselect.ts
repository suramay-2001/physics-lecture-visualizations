/**
 * Post-selection arithmetic (background chapter B4, unit b4-cultivate; Gidney, Shutty and Jones 2024 arXiv:2409.17595 Section 2, Gidney et al. 2025 arXiv:2312.04522 Section 4, Bombin et al. 2022
 * arXiv:2212.00813). Pure TypeScript.
 *   attempts(s)       the mean number of tries until the first success when each try is kept with chance s: Σ_{k≥1} k·s·(1−s)^{k−1} = 1/s.
 *   meanTime(stages)  the mean time per kept state when a run has stages with times t_i and keep chances s_i: with early abort a discarded run only spends the stages it reached,
 *                     (t_1 + s_1 t_2 + s_1 s_2 t_3 + …) / (s_1 s_2 …); without it every stage always runs, (t_1 + t_2 + …) / (s_1 s_2 …).
 *   escapeDiscard     the share of the runs that survived the early stages that the last stage discards: (P_end − P_early) / (1 − P_early) for the discarded fractions.
 *   gapTable          a toy of the logical gap: the n-bit repetition code with independent flips of chance p; the two candidate corrections weigh w and n − w, the gap is |n − 2w| and
 *                     the decoder follows the lighter one, so it fails when w > n/2. Keep the runs with gap ≥ cut: kept share and logical error among the kept.
 * The durations and the repetition code are teaching models of our own, not numbers of the papers.
 */
export const attempts = (s: number): number => {
  if (!(s > 0 && s <= 1)) throw new Error('postselect.attempts: the keep chance must be in (0, 1]')
  return 1 / s
}
/** The series Σ k s (1−s)^{k−1} to `terms` terms (used to check the closed form). */
export function attemptsSeries(s: number, terms = 5000): number {
  let sum = 0
  let q = 1
  for (let k = 1; k <= terms; k++) {
    sum += k * s * q
    q *= 1 - s
  }
  return sum
}

export interface Stage {
  t: number
  s: number
}
export function meanTime(stages: readonly Stage[], abort: boolean): number {
  if (!stages.length) throw new Error('postselect.meanTime: at least one stage')
  let reach = 1
  let total = 0
  for (const st of stages) {
    total += (abort ? reach : 1) * st.t
    reach *= st.s
  }
  return total / reach
}
/** The second-stage keep chance that makes the end-to-end keep chance `keep`, given the first stage's s1. */
export const secondKeep = (keep: number, s1: number): number => keep / s1
export const escapeDiscard = (early: number, end: number): number => (end - early) / (1 - early)

export interface GapRow {
  cut: number
  keep: number
  err: number
}
/** Every n-bit flip pattern: kept share and error among the kept for each odd cut-off 1, 3, … n, and the error with no cut. */
export function gapTable(n: number, p: number): { rows: GapRow[]; noCut: number } {
  if (!Number.isInteger(n) || n < 3 || n > 9 || n % 2 === 0) throw new Error('postselect.gapTable: n is odd, 3 to 9')
  const rows: GapRow[] = []
  const cuts = Array.from({ length: (n + 1) / 2 }, (_, i) => 2 * i + 1)
  const kept = cuts.map(() => 0)
  const bad = cuts.map(() => 0)
  let noCutBad = 0
  for (let e = 0; e < 1 << n; e++) {
    let w = 0
    for (let v = e; v; v &= v - 1) w++
    const pr = Math.pow(p, w) * Math.pow(1 - p, n - w)
    const gap = Math.abs(n - 2 * w)
    const fail = 2 * w > n
    if (fail) noCutBad += pr
    cuts.forEach((c, i) => {
      if (gap >= c) {
        kept[i] += pr
        if (fail) bad[i] += pr
      }
    })
  }
  cuts.forEach((cut, i) => rows.push({ cut, keep: kept[i], err: kept[i] > 0 ? bad[i] / kept[i] : 0 }))
  return { rows, noCut: noCutBad }
}
