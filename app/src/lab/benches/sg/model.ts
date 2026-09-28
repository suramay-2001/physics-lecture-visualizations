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
 * Homework guard (Physics 709 HW1 P2; decisions/qc709-pilots.md ruling 3 as the judge ruled it in
 * docs/roles/audits/P-sg-review.md): the bench stays editable, but no preset, Try-this or readout gives the HW1 P2
 * function, a plot against the tilt, or its maximum. The only preset with a 90° magnet between two z magnets is the
 * lectures' own z → x → z example (`l1-zxz`, Lecture 1's worked example). A preset at a tilt that is not a multiple of
 * 90° needs a judge's ruling (`OFF_GRID_PRESETS`, empty today). review.test.ts checks all three.
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
/** A Born fraction that is 0 or 1 up to rounding (the engine's sums) is exactly that: it has no scatter at all. */
const exactly = (p: number): number => (Math.abs(p) < 5e-13 ? 0 : Math.abs(1 - p) < 5e-13 ? 1 : p)

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
/**
 * A scatter (a fraction's expected 1σ) in percentage points, as printed after "±": one decimal, two below 0.1 pt, so it
 * never reads "0.0". "0" when there is no scatter at all (a Born fraction of exactly 0 or 1); "< 0.01" below that.
 */
export function ptText(s: number): string {
  const pt = s * 100
  if (!(pt > 0)) return '0'
  if (pt < 0.005) return `<${NBSP}0.01`
  return pt < 0.1 ? pt.toFixed(2) : pt.toFixed(1)
}
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
 * plate "+ 247 · − 251 · stopped 502 / 1 000"; per spot its exact Born fraction "+ spot · Born 25.0 %"; the counted
 * fractions with the scatter to expect at this N (P review #2: the ± belongs to the sample, never to the prediction):
 * "counted: + 24.7 % · − 25.1 % · expect ± 1.4 pt at N = 1 000", ± = √(p(1−p)/N) (`binomialStd`) in percentage points,
 * one per spot when the two differ. Counts are cumulative for this setup. No-break spaces keep a number with its sign,
 * unit and denominator (P review #14): a line wraps only between its parts.
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
    text: c.n > 0 ? `+${NBSP}${count(c.plus)} · ${MINUS}${NBSP}${count(c.minus)} · stopped${NBSP}${count(stopped)}${NBSP}/${NBSP}${count(c.n)}` : 'nothing fired yet',
    tone: 'text',
  })
  out.push({ key: 'born-plus', text: `+ spot · Born ${pct1(th.plus)}`, tone: 'plus' })
  out.push({ key: 'born-minus', text: `${MINUS} spot · Born ${pct1(th.minus)}`, tone: 'minus' })
  if (c.n > 0) out.push({ key: 'counted', text: countedText(th, c), tone: 'text' })
  return out
}
/** "counted: + 24.7 % · − 25.1 % · expect ± 1.4 pt at N = 1 000" (two ± values, + first, when they differ). */
function countedText(th: BenchTheory, c: Counts): string {
  const pm = (x: string) => `±${NBSP}${x}${NBSP}pt`
  const [sp, sm] = [th.plus, th.minus].map((p) => ptText(fractionScatter(c.n, exactly(p)) ?? 0))
  const expect = sp === sm ? pm(sp) : `${pm(sp)} and ${pm(sm)}`
  return `counted: +${NBSP}${pct1(c.plus / c.n)} · ${MINUS}${NBSP}${pct1(c.minus / c.n)} · expect ${expect} at N${NBSP}=${NBSP}${count(c.n)}`
}

/** The stage caption (P review #10, #12: sentences ≤ 25 words; × removes a magnet, so ± only ever names a beam). */
export const CAPTION =
  'Drag a magnet’s knob round its ring to turn it about the beam (15° steps; Shift for 1°). Tap a ± pad to choose the beam that goes on. Tap “+” at the rail’s end to add a magnet, or “×” above one to remove it. The inset shows the plate face-on, seen along the beam.'

/** The < 900 px plate picture's caption: counts, with what they are counted of (P review #4: no bare %). */
export const plateCaption = (c: Counts): string =>
  c.n > 0 ? `On the plate: +${NBSP}${count(c.plus)} and ${MINUS}${NBSP}${count(c.minus)} of the ${count(c.n)} atoms fired.` : 'Nothing fired yet.'

/** Lecture 6's "Superposition or mixture?" unit (l6-mixture, the fifth of L6: review.test.ts checks the number). */
export const MIXTURE_UNIT = 'Unit\u00a06.5'

/**
 * The note under the source (P review #7): a sealed |±y⟩ box gives exactly the oven's counts on this bench, because
 * every magnet points in the x–z plane (n·r = 0 for both); Lecture 6's mixture unit makes the point.
 */
export function sourceNote(src: SgSource): string {
  if (src === 'oven') return 'Its atoms meet the first magnet unpolarized.'
  if (src[1] === 'y')
    return (
      'A magnet here turns only about the beam, so none can prepare |±y⟩: those atoms come in a sealed box. ' +
      'On this bench the box gives exactly the oven’s counts, because every magnet points in the x–z plane. ' +
      `It is the mixture point of ${MIXTURE_UNIT}: no measurement along an x–z direction tells this pure state from the oven’s mixture.`
    )
  return 'Only the atoms the grey magnet lets through are fired and counted.'
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
 * The allowlist; ids are the lecture units they come from (D-lab §1: `#/lab/sg?preset=l1-zxz`). Homework guard (the
 * judge's ruling on HW1 P2, header): every tilt is a multiple of 90°, and the only preset with a 90° magnet between two z
 * magnets is `l1-zxz`, Lecture 1's own worked example. `l3-four` is z, z, x, x: repeated measurements, no x magnet
 * between two z magnets.
 */
export const SETUPS = presetTable<SgPreset>({
  'l1-z': { name: 'One magnet', source: 'oven', tilts: [0], keep: [], note: 'One z magnet: the oven’s atoms land in two spots and never between them.' },
  'l1-zz': { name: 'z then z', source: 'oven', tilts: [0, 0], keep: ['+'], note: 'Measure z twice: every atom that went + at the first magnet goes + again.' },
  'l1-zx': { name: 'z then x', source: 'oven', tilts: [0, 90], keep: ['+'], note: 'After a z magnet, an x magnet splits the kept beam half and half.' },
  'l1-zxz': { name: 'z → x → z', source: 'oven', tilts: [0, 90, 0], keep: ['+', '+'], note: 'The classic surprise: an x magnet between two z magnets brings the − spot back.' },
  'l1-flip': { name: 'Magnet upside down', source: 'oven', tilts: [0, 180], keep: ['+'], note: 'A magnet turned by 180° measures along −z: its + beam is the −z beam.' },
  'l2-plus-y': {
    name: 'Sealed |+y⟩ into z',
    source: '+y',
    tilts: [0],
    keep: [],
    note: `No magnet here can prepare |+y⟩, so it comes in a sealed box. On this bench it gives exactly the oven’s counts (${MIXTURE_UNIT}, mixtures).`,
  },
  'l3-four': {
    name: 'Four magnets',
    source: 'oven',
    tilts: [0, 0, 90, 90],
    keep: ['+', '+', '+'],
    note: 'z, z, x, x, keeping + each time: a measurement repeated at once repeats its answer, and a new axis splits the beam again.',
  },
})
/**
 * Presets at a tilt that is not a multiple of 90° (the HW1 P2 guard): each needs a judge's ruling, cited here with its
 * id. Empty: no preset sits off the quarter turns.
 */
export const OFF_GRID_PRESETS: readonly string[] = []
export const DEFAULT_SETUP = 'l1-zx'
export const PRESET_ORDER = ['l1-z', 'l1-zz', 'l1-zx', 'l1-zxz', 'l1-flip', 'l2-plus-y', 'l3-four'] as const

/**
 * The Try this (D-lab §2.1), checked against the engine in model.test.ts and review.test.ts (P review #8: it asks about
 * the number of atoms in the + spot, which moves when the magnets swap; sentences ≤ 25 words; no undefined ket). The
 * student builds it: no preset sets it.
 */
export const TRY_THIS =
  'Build z → 60° → z from the oven, keeping + at both stops. Predict what fraction of the atoms fired lands in the + spot, then fire 10 000. Now swap the last two magnets (z → z → 60°, still keeping +) and fire again. Why did the number of atoms in the + spot change?'
/** The two setups of the Try this (for the test and the answer). */
export const TRY_SETUPS: readonly [SgSetup, SgSetup] = [
  { source: 'oven', tilts: [0, 60, 0], keep: ['+', '+'] },
  { source: 'oven', tilts: [0, 0, 60], keep: ['+', '+'] },
]
export function tryThisAnswer(): string {
  const [a, b] = TRY_SETUPS.map((s) => theoryOf(s).plus)
  return (
    `The engine’s Born fractions: z → 60° → z sends ${pct1(a)} of the atoms fired to the + spot (9/32). z → z → 60° sends ${pct1(b)} (12/32). ` +
    'Each magnet leaves the atom in the state of its outcome. ' +
    'In the first order, the 60° magnet passes three quarters of the |+z⟩ atoms. ' +
    'Those atoms leave in the + state along 60°, which the last z magnet reads as + only three times in four. ' +
    'In the second order, the second z magnet passes every |+z⟩ atom, and only the last magnet splits them. ' +
    'Same magnets, different order, different counts: the order of measurements matters.'
  )
}
