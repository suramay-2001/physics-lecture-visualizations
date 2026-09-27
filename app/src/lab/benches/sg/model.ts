/**
 * The Stern–Gerlach bench's model (D-lab §2.1). PURE: no DOM, no Babylon. Every number a learner reads comes from the
 * engine (app/src/physics): the Born fractions from `benchTheory`, each magnet's pass fraction from `probUpAlong`, every
 * sampled count from `fireAtom` with the seeded `rng` (a new seed per volley, `seedOf`), the scatter of a sampled
 * fraction from `binomialStd`. The page formats them here and nowhere else.
 *
 * The bench: a source (the oven; |±z⟩ or |±x⟩ prepared by a greyed magnet; |±y⟩ in a sealed box, prepared elsewhere,
 * because a magnet here turns only about the beam: decisions/lab.md ruling 4), then 1–4 magnets. Each magnet is a tilt
 * τ in whole degrees about the beam, from +z toward +x (the engine's numeric `Axis`); every magnet but the last lets
 * one beam continue (keep ±), the last one's two beams land on the plate.
 *
 * Homework guard (decisions/qc709-pilots.md ruling 3, Physics 709 HW1 P2): the bench stays editable, but no preset puts
 * a magnet at a tilt that is not a multiple of 90°, nothing here plots a fraction against the tilt, and nothing states a
 * maximum. model.test.ts checks the preset table.
 */
import { axisVector, benchTheory, fireAtom, type Bench, type BenchTheory, type Fate, type Sign, type Tally } from '../../../physics/sg'
import { binomialStd, rng } from '../../../physics/random'
import { blochVector, KET, probUpAlong, type NamedKet, type Vec3 } from '../../../physics/spin'
import { presetTable } from '../../presets'

export type SgSource = 'oven' | NamedKet
export const SOURCES: readonly SgSource[] = ['oven', '+z', '-z', '+x', '-x', '+y', '-y']
export const MAX_MAGNETS = 4
/** The knob snaps to this many degrees (Shift: 1°). */
export const TILT_STEP = 15
/** Fire buttons (D-lab §2.1). */
export const VOLLEYS = [100, 1000, 10000] as const
/** Atoms drawn in flight per volley (D-lab §6: 2 000 atoms); every atom of a volley lands on the plate. */
export const MAX_FLOWN = 2000
/** Deposit marks the plate draws (D-lab §6: ≤ 20 000 thin instances); every atom is counted. */
export const MAX_DEPOSITS = 20000

export interface SgSetup {
  source: SgSource
  /** Tilt of each magnet, whole degrees [0, 360). */
  tilts: number[]
  /** Kept beam at each magnet but the last. */
  keep: Sign[]
}

/** Whole degrees in [0, 360); anything not finite is 0. */
export function wrapTilt(deg: number): number {
  if (!Number.isFinite(deg)) return 0
  const d = Math.round(deg) % 360
  return d < 0 ? d + 360 : d
}
/** A drag or a typed angle, snapped to TILT_STEP (or 1° when fine). */
export const snapTilt = (deg: number, fine = false): number => wrapTilt(fine ? Math.round(deg) : Math.round(deg / TILT_STEP) * TILT_STEP)
/** One keyboard step from `deg`: to the next multiple of TILT_STEP in direction `dir` (fine: ±1°). */
export function stepTilt(deg: number, dir: 1 | -1, fine = false): number {
  if (fine) return wrapTilt(deg + dir)
  const q = deg / TILT_STEP
  const next = dir > 0 ? Math.floor(q + 1e-9) + 1 : Math.ceil(q - 1e-9) - 1
  return wrapTilt(next * TILT_STEP)
}

/** Normalise any setup: 1–4 magnets, tilts wrapped, one keep per magnet but the last (missing ones keep +). */
export function cleanSetup(s: SgSetup): SgSetup {
  const tilts = (s.tilts.length ? s.tilts : [0]).slice(0, MAX_MAGNETS).map(wrapTilt)
  const keep = Array.from({ length: tilts.length - 1 }, (_, k): Sign => (s.keep[k] === '-' ? '-' : '+'))
  return { source: SOURCES.includes(s.source) ? s.source : 'oven', tilts, keep }
}

/** The engine's bench for a setup (a numeric Axis is the tilt in degrees in the x–z plane: `axisVector`). */
export const benchOf = (s: SgSetup): Bench => ({ source: s.source, axes: s.tilts.slice(), keep: s.keep.slice(0, s.tilts.length - 1) })
export const theoryOf = (s: SgSetup): BenchTheory => benchTheory(benchOf(s))
/** A stable key of a setup (the picture and the tally are per setup). */
export const setupKey = (s: SgSetup): string => `${s.source}|${s.tilts.join(',')}|${s.keep.join('')}`

/**
 * The fraction of the atoms reaching magnet k that go on in its kept beam (P(kept | arrived), Born rule): ½ for the oven
 * at the first magnet, else (1 + s_k n_k·r)/2 for the state r that arrives (the source's Bloch vector, or the previous
 * magnet's kept outcome ±n). Defined even where no atom arrives. Null for the last magnet (both beams land).
 */
export function passOf(s: SgSetup, k: number): number | null {
  if (k >= s.tilts.length - 1) return null
  const sign = s.keep[k] === '-' ? -1 : 1
  const n = axisVector(s.tilts[k])
  const kept: Vec3 = [sign * n[0], sign * n[1], sign * n[2]]
  if (k === 0) return s.source === 'oven' ? 0.5 : probUpAlong(kept, blochVector(KET[s.source]))
  const ps = s.keep[k - 1] === '-' ? -1 : 1
  const pn = axisVector(s.tilts[k - 1])
  return probUpAlong(kept, [ps * pn[0], ps * pn[1], ps * pn[2]])
}

/* ------------------------------------------------------------------------------------------------ */
/* Sampling: every count from the engine's seeded fireAtom                                           */
/* ------------------------------------------------------------------------------------------------ */

/** A new seed per volley: the k-th volley of the session (golden-ratio stepping, never 0). */
export const seedOf = (k: number): number => ((0x5eed + Math.imul(k + 1, 0x9e3779b1)) >>> 0) || 1

export interface Counts extends Tally {
  /** Atoms fired (plus + minus + every blocked). */
  n: number
}
export const emptyCounts = (magnets: number): Counts => ({ n: 0, plus: 0, minus: 0, blocked: Array(Math.max(0, magnets - 1)).fill(0) })
export const addCounts = (a: Counts, b: Counts): Counts => ({ n: a.n + b.n, plus: a.plus + b.plus, minus: a.minus + b.minus, blocked: a.blocked.map((x, k) => x + (b.blocked[k] ?? 0)) })

export interface Volley {
  seed: number
  counts: Counts
  /** Every atom's fate, in firing order (the engine's `Fate`). */
  fates: Fate[]
}
/** Fire n atoms through the setup with the seeded engine draws: the same seed gives the same counts as `fireMany`. */
export function volleyOf(s: SgSetup, n: number, seed: number): Volley {
  const b = benchOf(s)
  const rand = rng(seed)
  const counts = emptyCounts(s.tilts.length)
  const fates: Fate[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const f = fireAtom(b, rand)
    fates[i] = f
    if (f.end === 'plus') counts.plus++
    else if (f.end === 'minus') counts.minus++
    else counts.blocked[f.end]++
  }
  counts.n = n
  return { seed, counts, fates }
}

/** The expected scatter (one standard deviation) of a sampled fraction at n atoms with Born probability p: √(p(1−p)/n). */
export const fractionScatter = (n: number, p: number): number | null => (n > 0 ? binomialStd(n, p) / n : null)

/* ------------------------------------------------------------------------------------------------ */
/* Words and numbers                                                                                 */
/* ------------------------------------------------------------------------------------------------ */

const NBSP = '\u00a0'
const NNBSP = '\u202f'
/** A percentage to one decimal, "25.0 %" (the space never breaks). */
export const pct1 = (p: number): string => `${(Math.abs(p) < 5e-13 ? 0 : p * 100).toFixed(1)}${NBSP}%`
/** A count grouped in thousands, "10 000" (narrow no-break spaces). */
export const count = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP)
const MINUS = '−'
/** A kept sign as printed. */
export const signText = (s: Sign): string => (s === '-' ? MINUS : '+')
/** The axis a tilt measures along, when it is one of the four named ones. */
export const axisName = (deg: number): string | null => ({ 0: 'z', 90: 'x', 180: `${MINUS}z`, 270: `${MINUS}x` })[wrapTilt(deg)] ?? null
/** A source as printed. */
export function sourceText(src: SgSource): string {
  if (src === 'oven') return 'the oven (unpolarized atoms)'
  const ket = `|${src[0] === '-' ? MINUS : '+'}${src[1]}⟩`
  return src[1] === 'y' ? `${ket} (a sealed box, prepared elsewhere)` : `${ket} (prepared by a grey magnet)`
}
export const sourceShort = (src: SgSource): string => (src === 'oven' ? 'oven' : `|${src[0] === '-' ? MINUS : '+'}${src[1]}⟩`)
/** The chain in one line: "oven → z keep + → 60° keep + → z". */
export function chainText(s: SgSetup): string {
  const mags = s.tilts.map((t, k) => {
    const a = axisName(t) ?? `${wrapTilt(t)}°`
    return k < s.tilts.length - 1 ? `${a} keep ${signText(s.keep[k])}` : a
  })
  return [sourceShort(s.source), ...mags].join(' → ')
}

export type Tone = 'text' | 'plus' | 'minus' | 'silver'
export interface Readout {
  key: string
  text: string
  tone: Tone
}

/**
 * The readouts (engine values, formatted), D-lab §2.1: the source; per magnet "magnet 2 · 60° · passes 75.0 %"; the
 * plate "+ 247 · − 251 · stopped 502 / 1 000"; per spot "+ spot · Born 25.0 % ± 1.4 %" (± = the expected scatter of
 * the sampled fraction at the atoms fired so far, `binomialStd`); the counted fractions. Counts are cumulative for this
 * setup.
 */
export function readoutsOf(s: SgSetup, c: Counts): Readout[] {
  const th = theoryOf(s)
  const out: Readout[] = [{ key: 'source', text: `source · ${sourceShort(s.source)}${s.source === 'oven' ? ' (unpolarized)' : s.source[1] === 'y' ? ' (sealed box)' : ''}`, tone: 'text' }]
  s.tilts.forEach((t, k) => {
    const p = passOf(s, k)
    out.push({ key: `m${k + 1}`, text: `magnet ${k + 1} · ${wrapTilt(t)}° · ${p === null ? 'to the plate' : `passes ${pct1(p)}`}`, tone: 'text' })
  })
  const stopped = c.blocked.reduce((a, b) => a + b, 0)
  out.push({
    key: 'tally',
    text: c.n > 0 ? `+ ${count(c.plus)} · ${MINUS} ${count(c.minus)} · stopped ${count(stopped)} / ${count(c.n)}` : 'nothing fired yet',
    tone: 'text',
  })
  for (const [key, sign, p] of [
    ['born-plus', '+', th.plus],
    ['born-minus', MINUS, th.minus],
  ] as const) {
    const sc = fractionScatter(c.n, p)
    out.push({ key, text: `${sign} spot · Born ${pct1(p)}${sc === null ? '' : ` ± ${pct1(sc)}`}`, tone: sign === '+' ? 'plus' : 'minus' })
  }
  if (c.n > 0) out.push({ key: 'counted', text: `counted: + ${pct1(c.plus / c.n)} · ${MINUS} ${pct1(c.minus / c.n)}`, tone: 'text' })
  return out
}

/** Atoms stopped at each magnet (paper column): "stopped at magnet 1: 502 (Born 50.0 %)". */
export const stopLines = (s: SgSetup, c: Counts): string[] =>
  theoryOf(s).blocked.map((p, k) => `stopped after magnet ${k + 1}: ${c.n > 0 ? `${count(c.blocked[k] ?? 0)} of ${count(c.n)}` : '—'} (Born ${pct1(p)})`)

/** What the paper keeps when the bench changes (the counts belong to one setup). */
export interface Previous {
  chain: string
  text: string
}
export function previousOf(s: SgSetup, c: Counts): Previous | null {
  if (c.n === 0) return null
  const th = theoryOf(s)
  return { chain: chainText(s), text: `+ ${count(c.plus)} / ${count(c.n)} (${pct1(c.plus / c.n)}; Born ${pct1(th.plus)}) · ${MINUS} ${count(c.minus)} (Born ${pct1(th.minus)})` }
}

/* ------------------------------------------------------------------------------------------------ */
/* Presets (allowlist, decisions/lab.md ruling 7) and Try this                                       */
/* ------------------------------------------------------------------------------------------------ */

export interface SgPreset extends SgSetup {
  name: string
  /** One line under the title when opened by link. */
  note: string
}
/**
 * The allowlist. Every tilt is a multiple of 90° (HW1 P2 guard: no preset at a tilted middle magnet); ids are the
 * lecture units they come from (D-lab §1: `#/lab/sg?preset=l1-zxz`).
 */
export const SETUPS = presetTable<SgPreset>({
  'l1-z': { name: 'One magnet', source: 'oven', tilts: [0], keep: [], note: 'One z magnet: the oven’s atoms land in two spots and never between them.' },
  'l1-zz': { name: 'z then z', source: 'oven', tilts: [0, 0], keep: ['+'], note: 'Measure z twice: every atom that went + at the first magnet goes + again.' },
  'l1-zx': { name: 'z then x', source: 'oven', tilts: [0, 90], keep: ['+'], note: 'After a z magnet, an x magnet splits the kept beam half and half.' },
  'l1-zxz': { name: 'z → x → z', source: 'oven', tilts: [0, 90, 0], keep: ['+', '+'], note: 'The classic surprise: an x magnet between two z magnets brings the − spot back.' },
  'l1-flip': { name: 'Magnet upside down', source: 'oven', tilts: [0, 180], keep: ['+'], note: 'A magnet turned by 180° measures along −z: its + beam is the −z beam.' },
  'l2-plus-y': { name: 'Sealed |+y⟩ into z', source: '+y', tilts: [0], keep: [], note: 'No magnet here can prepare |+y⟩ (they turn only about the beam), so it comes in a sealed box.' },
  'l3-four': { name: 'Four magnets', source: 'oven', tilts: [0, 90, 0, 90], keep: ['+', '+', '+'], note: 'Four magnets, each a quarter turn from the last, keeping + each time.' },
})
export const DEFAULT_SETUP = 'l1-zx'
export const PRESET_ORDER = ['l1-z', 'l1-zz', 'l1-zx', 'l1-zxz', 'l1-flip', 'l2-plus-y', 'l3-four'] as const

/** The Try this (D-lab §2.1), checked against the engine in model.test.ts. The student builds it: no preset sets it. */
export const TRY_THIS =
  'Build z → 60° → z from the oven, keeping + at both stops. Predict the fraction of atoms that reach the last magnet’s + spot, then fire 10 000. Now swap the last two magnets (z → z → 60°, still keeping +) and fire again. Why did the + spot change?'
/** The two setups of the Try this (for the test and the answer). */
export const TRY_SETUPS: readonly [SgSetup, SgSetup] = [
  { source: 'oven', tilts: [0, 60, 0], keep: ['+', '+'] },
  { source: 'oven', tilts: [0, 0, 60], keep: ['+', '+'] },
]
export function tryThisAnswer(): string {
  const [a, b] = TRY_SETUPS.map((s) => theoryOf(s).plus)
  return (
    `The engine’s Born fractions: z → 60° → z sends ${pct1(a)} of the atoms to the + spot (9/32), z → z → 60° sends ${pct1(b)} (12/32). ` +
    'Each magnet leaves the atom in the state of its outcome. In the first order the 60° magnet passes three quarters of the |+z⟩ atoms and hands on |+60°⟩, which the last z magnet reads as + only three times in four. ' +
    'In the second order the second z magnet passes every |+z⟩ atom, and only the last magnet splits them. Same magnets, different order, different counts: the order of measurements matters.'
  )
}
