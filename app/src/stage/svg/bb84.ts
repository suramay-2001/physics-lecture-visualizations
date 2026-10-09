/**
 * `bb84` (SVG; W-448 L8-B): the protocol ledger of Lecture 8. One row per photon: what Alice prepared (basis, bit, the
 * polarization state), what Eve did to it (her basis, her reading, the state she resent) and what Bob read, with the sifting
 * mark (matched bases) and the error mark. Content writes only INPUTS (where the rounds come from, Eve's strategy, which
 * columns are drawn, whether to sift, the test sample); this resolver draws every bit, basis, outcome and tally from the one
 * seeded engine (physics/bb84.ts: Born draws on the engine's kets), shared with the `bb84-bench` widget and the `catch-eve`
 * Arcade game. The ledger shows the last 12 rounds; the tallies, Q̂ and the exact Q cover all `count` rounds.
 * Interpolation follows stage/interp.ts: the count and Eve's fraction lerp (a longer run only appends rounds), everything
 * else switches at the half-way point; every output is recomputed from the interpolated inputs. Lazy chunk (stage/svg/kinds.ts).
 */
import type { Bb84State, Scrub } from '../../content/stage'
import { BB84_READOUTS } from '../../content/stage'
import { BOARD_P8, bb84Q, bb84Rounds, bb84Tally, checkBoard, eveKnown, missProb, stateLetter, testResult, type Bb84Round, type BoardRow, type TestSpec } from '../../physics/bb84'
import { binomialStd } from '../../physics/random'
import { scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { Bb84Inputs, Bb84Row, ResolvedBb84 } from '../types'
import { fix, sci } from './draw'

/** Validation limits (P-L8 §9.2 G4): the run length and the rows drawn. */
export const BB84_LIMITS = { countMin: 1, countMax: 4000, rows: 12, seedMax: 0xffffffff } as const

const clampCount = (x: number): number => Math.max(BB84_LIMITS.countMin, Math.min(BB84_LIMITS.countMax, Math.round(x)))

/** The notes' board as engine rounds (no Eve): the same shape a seeded run has. */
function boardRounds(): Bb84Round[] {
  return BOARD_P8.map((r: BoardRow, i) => ({
    n: i + 1,
    aBit: r.aBit,
    aBasis: r.aBasis,
    bBasis: r.bBasis,
    bBit: r.bBit,
    eIntercept: false,
    eBasis: r.aBasis,
    eBit: null,
    kept: r.aBasis === r.bBasis,
    error: r.aBasis === r.bBasis && r.aBit !== r.bBit,
    eveKnows: false,
  }))
}

/** Which of the ledger's inputs a state asks for, with the count a whole number and Eve a fraction. */
export function bb84Inputs(st: Bb84State, s: number): Bb84Inputs {
  const rd = st.rounds
  const board = 'board' in rd
  const eve = st.eve === undefined || st.eve === 'off' ? 0 : st.eve === 'all' ? 1 : scrub(st.eve.fraction, s)
  const show = st.show ?? (eve > 0 ? ['alice', 'eve', 'bob'] : ['alice', 'bob'])
  return {
    board,
    seed: 'seed' in rd ? rd.seed : 0,
    count: 'count' in rd ? clampCount(scrub(rd.count, s)) : BOARD_P8.length,
    eve: board ? 0 : Math.max(0, Math.min(1, eve)),
    show: { alice: show.includes('alice'), eve: show.includes('eve'), bob: show.includes('bob') },
    sift: !!st.sift,
    test: st.test,
    highlight: st.highlight ?? [],
    readouts: [...(st.readouts ?? [])],
    shot: st.shot,
  }
}

const rowOf = (r: Bb84Round, tested: ReadonlySet<number>, highlight: ReadonlySet<number>, luck: ReadonlySet<number>): Bb84Row => ({
  n: r.n,
  aBasis: r.aBasis,
  aBit: r.aBit,
  aState: stateLetter(r.aBasis, r.aBit),
  bBasis: r.bBasis,
  bBit: r.bBit,
  eIntercept: r.eIntercept,
  eBasis: r.eBasis,
  eBit: r.eBit,
  eState: r.eBit === null ? null : stateLetter(r.eBasis, r.eBit),
  kept: r.kept,
  error: r.error,
  eveKnows: r.eveKnows,
  tested: tested.has(r.n),
  highlighted: highlight.has(r.n),
  luck: luck.has(r.n),
})

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function bb84From(inp: Bb84Inputs): ResolvedBb84 {
  const rounds = inp.board ? boardRounds() : bb84Rounds(inp.count, inp.seed, inp.eve)
  const tally = bb84Tally(rounds)
  const exactQ = inp.board ? 0 : bb84Q(inp.eve)
  const exactKnown = inp.board ? 0 : eveKnown(inp.eve)
  const luck = new Set(inp.board ? checkBoard(BOARD_P8).luck : [])
  let test: ResolvedBb84['test'] = null
  let testedSet: ReadonlySet<number> = new Set()
  if (inp.test) {
    const res = testResult(rounds, inp.test as TestSpec, inp.seed)
    testedSet = new Set(res.tested)
    // the chance that a test of this size shows nothing if Eve's attack gives the exact error rate (1 when there is no attack)
    test = { m: res.m, nErr: res.nErr, qhat: res.qhat, miss: missProb(Math.min(1, exactQ), res.m), tested: res.tested, remaining: res.remaining.length }
  }
  const shown = rounds.slice(Math.max(0, rounds.length - BB84_LIMITS.rows))
  const hl = new Set(inp.highlight)
  return {
    kind: 'bb84',
    board: inp.board,
    seed: inp.seed,
    count: rounds.length,
    eve: inp.eve,
    rows: shown.map((r) => rowOf(r, testedSet, hl, luck)),
    show: inp.show,
    sift: inp.sift,
    readouts: inp.readouts,
    kept: tally.kept,
    errors: tally.errors,
    qhat: tally.qhat,
    eveKnows: tally.eveKnows,
    exactQ,
    exactKnown,
    sigma: tally.kept > 0 && exactQ > 0 ? binomialStd(tally.kept, exactQ) / tally.kept : null,
    test,
    inputs: inp,
    shot: inp.shot,
  }
}

export function resolveBb84Stage(st: Bb84State, s: number): ResolvedBb84 {
  return bb84From(bb84Inputs(st, s))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

export function interpBb84Stage(a: ResolvedBb84, b: ResolvedBb84, t: number): ResolvedBb84 {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs
  const B = b.inputs
  const d = pick(A, B, t)
  // the same seeded run keeps its rounds: only the count and Eve's fraction move; anything else is a structural change
  if (!A.board && !B.board && A.seed === B.seed) return bb84From({ ...d, seed: A.seed, count: clampCount(lerp(A.count, B.count, t)), eve: lerp(A.eve, B.eve, t) })
  return bb84From(d)
}

/* ------------------------------------------------ validation ------------------------------------------------ */
export function validateBb84Stage(st: Bb84State): string[] {
  const errs: string[] = []
  const rd = st.rounds
  const board = 'board' in rd
  if ('board' in rd) {
    if (rd.board !== 'notes-p8') errs.push(`bb84 rounds.board: only 'notes-p8' (the board of the notes, p. 8)`)
    if (st.eve !== undefined && st.eve !== 'off') errs.push('bb84: the board has no eavesdropper (eve must be absent or off)')
  } else {
    const r = rd
    if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > BB84_LIMITS.seedMax) errs.push('bb84 rounds.seed: a whole number 0–4294967295')
    const scrubOk = (v: Scrub): boolean => (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
    if (!scrubOk(r.count)) errs.push('bb84 rounds.count: non-finite')
    else
      for (const x of typeof r.count === 'number' ? [r.count] : [r.count.from, r.count.to])
        if (x < BB84_LIMITS.countMin - 0.5 || x > BB84_LIMITS.countMax + 0.5) errs.push(`bb84 rounds.count: ${BB84_LIMITS.countMin}–${BB84_LIMITS.countMax} (got ${x})`)
    if (typeof r.count === 'number' && !Number.isInteger(r.count)) errs.push('bb84 rounds.count: a whole number (a sweep is rounded)')
  }
  if (typeof st.eve === 'object') {
    const f = st.eve.fraction
    for (const x of typeof f === 'number' ? [f] : [f.from, f.to]) if (!(x >= 0 && x <= 1)) errs.push('bb84 eve.fraction: between 0 and 1')
  } else if (st.eve !== undefined && st.eve !== 'off' && st.eve !== 'all') errs.push(`bb84 eve: 'off', 'all' or { fraction }`)
  const hasEve = typeof st.eve === 'object' || st.eve === 'all'
  if (st.show) {
    if (!st.show.length || new Set(st.show).size !== st.show.length || !st.show.every((p) => p === 'alice' || p === 'eve' || p === 'bob')) errs.push(`bb84 show: a non-empty list of 'alice', 'eve', 'bob', each once`)
    if (st.show.includes('eve') && !hasEve) errs.push(`bb84 show: Eve's column needs an eavesdropper (set eve)`)
  }
  for (const r of st.readouts ?? []) if (!(BB84_READOUTS as readonly string[]).includes(r)) errs.push(`bb84 readouts: unknown "${r}"`)
  if (st.readouts?.includes('eve-knows') && !hasEve) errs.push(`bb84 readouts: 'eve-knows' needs an eavesdropper`)
  if (st.show && !st.show.includes('bob') && (st.readouts?.includes('kept') || st.readouts?.includes('qber')))
    errs.push(`bb84 readouts: 'kept' and 'qber' compare Alice's and Bob's bits; show Bob`)
  if (st.test) {
    if (!st.sift) errs.push('bb84 test: the test sample is taken from the kept rounds; set sift: true')
    if ('rounds' in st.test) {
      if (!st.test.rounds.length || !st.test.rounds.every((n) => Number.isInteger(n) && n >= 1)) errs.push('bb84 test.rounds: round numbers (whole, from 1)')
    } else if ('size' in st.test) {
      if (!Number.isInteger(st.test.size) || st.test.size < 0) errs.push('bb84 test.size: a whole number ≥ 0')
    } else if (!(st.test.fraction >= 0 && st.test.fraction <= 1)) errs.push('bb84 test.fraction: between 0 and 1')
  }
  if (st.highlight && !st.highlight.every((n) => Number.isInteger(n) && n >= 1)) errs.push('bb84 highlight: round numbers (whole, from 1)')
  if (errs.length) return errs
  // checks that need the run: a named test round must be a kept round, a highlight must be a drawn round
  const r = resolveBb84Stage(st, 1)
  const rounds = board ? boardRounds() : bb84Rounds(r.count, r.seed, r.eve)
  if (st.test && 'rounds' in st.test) {
    const kept = new Set(rounds.filter((x) => x.kept).map((x) => x.n))
    for (const n of st.test.rounds) if (!kept.has(n)) errs.push(`bb84 test.rounds: round ${n} is not a kept round (the sample is drawn from the sifted key)`)
  }
  if (st.test && 'size' in st.test && st.test.size > r.kept) errs.push(`bb84 test.size: ${st.test.size} is more than the ${r.kept} kept rounds`)
  const drawn = new Set(r.rows.map((x) => x.n))
  for (const n of st.highlight ?? []) if (!drawn.has(n)) errs.push(`bb84 highlight: round ${n} is not one of the drawn rows (${r.rows[0]?.n}–${r.rows[r.rows.length - 1]?.n})`)
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const pct = (x: number): string => `${fix(100 * x, 0)}%`
/** A chance for the readout column: four decimals above 0.001, scientific below. */
export const missText = (p: number): string => (p >= 0.001 ? p.toFixed(4) : sci(p, 1))

export function bb84Readouts(r: ResolvedBb84): SvgReadout[] {
  const out: SvgReadout[] = []
  out.push({ name: 'tally', text: r.board ? `${r.count} photons · notes, p. 8` : `${r.count} photon${r.count === 1 ? '' : 's'} sent${r.eve > 0 ? ` · Eve ${r.eve >= 1 ? 'on every photon' : `on ${pct(r.eve)}`}` : ''}` })
  if (r.readouts.includes('kept')) out.push({ name: 'kept', text: `kept ${r.kept} of ${r.count}${r.board ? '' : ` (${pct(r.kept / r.count)})`}` })
  if (r.readouts.includes('qber')) {
    const q = r.qhat === null ? 'Q̂ = –' : `Q̂ = ${fix(r.qhat, 3)}${r.sigma !== null ? ` ± ${fix(r.sigma, 3)}` : ''}`
    out.push({ name: 'qber', text: r.board ? q : `${q} · exact Q = ${fix(r.exactQ, 3)}` })
  }
  if (r.readouts.includes('eve-knows')) out.push({ name: 'eve-knows', text: `Eve knows ${r.eveKnows} of ${r.kept} kept bits${r.kept ? ` (${pct(r.eveKnows / r.kept)})` : ''}` })
  if (r.test) {
    out.push({ name: 'test', text: `test sample: ${r.test.m} bits · ${r.test.nErr} error${r.test.nErr === 1 ? '' : 's'}${r.test.qhat === null ? '' : ` · Q̂ = ${fix(r.test.qhat, 3)}`}` })
    if (r.exactQ > 0) out.push({ name: 'miss', text: `chance Eve shows no error: ${missText(r.test.miss)}` })
    out.push({ name: 'key', text: `${r.test.remaining} bits stay secret` })
  }
  return out
}
