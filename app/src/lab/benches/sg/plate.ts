/**
 * The plate's marks and a volley's flight (page side, pure): what the SG scene draws after a Fire. Every atom's FATE is
 * the engine's (model.ts `volleyOf`: seeded `fireAtom`); this file only gives it a look (a place across the ribbon, a
 * speed, a start time: decoration drawn from a second seeded stream, so the engine's draws stay exactly `fireMany`'s)
 * and turns it into a path through the schematic layout and a mark on the plate.
 *   - marks: plate-local points (the glass face), + or −, in order of arrival; at most MAX_DEPOSITS are drawn (every atom
 *     is counted: the readouts say so when the plate is full);
 *   - flight: up to MAX_FLOWN atoms of the volley (every k-th), PATH_POINTS points each, start and duration; a volley
 *     lasts ≤ 1.8 s (D-lab §5 item 1). Without motion there is no flight: the marks appear at once.
 */
import { axisVector, type Fate } from '../../../physics/sg'
import { rng } from '../../../physics/random'
import { flightPaths, fullLength, landingOf, sgLayout, type AtomLook, type SgLayout, type Tone } from './layout'
import { MAX_DEPOSITS, MAX_FLOWN, MAX_MAGNETS, setupKey, type SgSetup, type Volley } from './model'

/** Emission window and the flight time of a full path at speed 1 (s): the last atom lands by 0.55 + 0.95/0.9 ≈ 1.61 s. */
export const EMIT_S = 0.55
export const FLIGHT_S = 0.95
export const VOLLEY_MAX_S = 1.8

export interface Flight {
  id: number
  /** Atoms drawn in flight. */
  n: number
  /** n × PATH_POINTS × 3, physics. */
  points: Float32Array
  /** n × PATH_POINTS: 0 unpolarized, 1 +, 2 − (the outcome of the last magnet passed). */
  tones: Uint8Array
  /** Start and flight time of each atom (s from the volley's start). */
  t0: Float32Array
  dur: Float32Array
  /** When the last atom lands (s). */
  end: number
}
export interface Plate {
  /** The setup these marks belong to. */
  key: string
  /** Plate-local mark positions (x, y, z per mark; y is the glass face) and sign (1 = +, 2 = −), arrival order. */
  pos: Float32Array
  sign: Uint8Array
  /** Marks drawn (≤ MAX_DEPOSITS), and atoms that landed on the plate in all (the counts). */
  count: number
  landed: number
  /** Marks before the current volley (always shown). */
  start: number
  /** Arrival time (s) of marks start … count − 1, ascending; null: every mark is shown. */
  arrive: Float32Array | null
  flight: Flight | null
}

export const sourceKind = (s: SgSetup) =>
  s.source === 'oven'
    ? ({ kind: 'oven' } as const)
    : s.source[1] === 'y'
      ? ({ kind: 'sealed' } as const)
      : ({ kind: 'prep', tau: s.source[1] === 'x' ? Math.PI / 2 : 0, sign: s.source[0] === '-' ? -1 : 1 } as const)
/**
 * The < 900 px plate picture (P review #4): the plate seen along the beam, z up and x right like the dials, so its spots
 * turn with the last magnet. The + spot's centre lies along that magnet's +n̂ (the engine's `axisVector`), the − spot
 * opposite; `across` is the direction the spots spread along (across the pole). SVG units, y down.
 */
export function plateSpotsSvg(tiltDeg: number, cx: number, cy: number, r: number): { plus: [number, number]; minus: [number, number]; along: [number, number]; across: [number, number] } {
  const n = axisVector(tiltDeg)
  const along: [number, number] = [n[0], -n[2]]
  return { plus: [cx + r * along[0], cy + r * along[1]], minus: [cx - r * along[0], cy - r * along[1]], along, across: [-along[1], along[0]] }
}

/** The schematic layout of a setup (tilts in radians). */
export const layoutOfSetup = (s: SgSetup): SgLayout =>
  sgLayout({ taus: s.tilts.map((d) => (d * Math.PI) / 180), keep: s.keep, source: sourceKind(s), max: MAX_MAGNETS })
/** The tone atoms leave the source with: a sealed |±y⟩ box sends them out as its sign; the oven's are unpolarized. */
export const sourceTone = (s: SgSetup): Tone => (s.source[1] === 'y' ? (s.source[0] === '-' ? 2 : 1) : 0)

export function emptyPlate(s: SgSetup): Plate {
  return { key: setupKey(s), pos: new Float32Array(0), sign: new Uint8Array(0), count: 0, landed: 0, start: 0, arrive: null, flight: null }
}

let flightIds = 0

/** Looks for n atoms from the volley's seed (a stream apart from the engine's). */
function looksOf(n: number, seed: number): { looks: AtomLook[]; t0: Float32Array } {
  const r = rng((seed ^ 0xa5a5a5a5) >>> 0)
  const looks: AtomLook[] = new Array(n)
  const t0 = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const u1 = r() || 1e-9
    const u2 = r()
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    looks[i] = { x: r() * 2 - 1, zj: Math.max(-2.5, Math.min(2.5, g)), v: 0.9 + 0.2 * r() }
    t0[i] = EMIT_S * ((i + r()) / n)
  }
  return { looks, t0 }
}

/** The plate after volley v: the old marks, plus v's plate atoms in order of arrival (and v's flight, with motion). */
export function buildPlate(s: SgSetup, old: Plate, v: Volley, motion: boolean): Plate {
  const lay = layoutOfSetup(s)
  const tone = sourceTone(s)
  const n = v.fates.length
  const { looks, t0 } = looksOf(n, v.seed)
  const full = fullLength(lay)
  // arrival times: a stopped atom's path is shorter, at the same speed
  const stride = Math.max(1, Math.ceil(n / MAX_FLOWN))
  const flownIdx: number[] = []
  for (let i = 0; i < n; i += stride) flownIdx.push(i)
  const fl = motion ? flightPaths(lay, flownIdx.map((i) => v.fates[i]), flownIdx.map((i) => looks[i]), tone) : null
  // plate atoms, with their arrival (a full path; flown ones use their own length)
  const landing: { i: number; t: number }[] = []
  for (let i = 0; i < n; i++) {
    const f: Fate = v.fates[i]
    if (f.end === 'plus' || f.end === 'minus') landing.push({ i, t: t0[i] + FLIGHT_S / looks[i].v })
  }
  landing.sort((a, b) => a.t - b.t)
  const key = setupKey(s)
  const fresh = old.key !== key
  const start = fresh ? 0 : old.count
  const room = Math.max(0, MAX_DEPOSITS - start)
  const add = Math.min(room, landing.length)
  let pos = fresh ? new Float32Array(0) : old.pos
  let sign = fresh ? new Uint8Array(0) : old.sign
  if (pos.length < (start + add) * 3) {
    const cap = Math.min(MAX_DEPOSITS, Math.max(start + add, 2 * (start + add), 1024))
    const p2 = new Float32Array(cap * 3)
    p2.set(pos.subarray(0, start * 3))
    const s2 = new Uint8Array(cap)
    s2.set(sign.subarray(0, start))
    pos = p2
    sign = s2
  }
  const arrive = new Float32Array(add)
  for (let j = 0; j < add; j++) {
    const { i, t } = landing[j]
    const p = landingOf(lay, v.fates[i], looks[i], tone)
    pos.set(p, (start + j) * 3)
    sign[start + j] = v.fates[i].end === 'plus' ? 1 : 2
    arrive[j] = t
  }
  let flight: Flight | null = null
  if (fl) {
    const m = flownIdx.length
    const ft0 = new Float32Array(m)
    const dur = new Float32Array(m)
    let end = 0
    for (let j = 0; j < m; j++) {
      const i = flownIdx[j]
      ft0[j] = t0[i]
      // a plate atom lands exactly when its mark appears; a stopped one flies its shorter path at the same speed
      const e = v.fates[i].end
      dur[j] = (FLIGHT_S * (e === 'plus' || e === 'minus' ? 1 : Math.min(1, fl.lengths[j] / full))) / looks[i].v
      end = Math.max(end, ft0[j] + dur[j])
    }
    for (const a of arrive) end = Math.max(end, a)
    flight = { id: ++flightIds, n: m, points: fl.points, tones: fl.tones, t0: ft0, dur, end: Math.min(VOLLEY_MAX_S, end) }
  }
  return {
    key,
    pos,
    sign,
    count: start + add,
    landed: (fresh ? 0 : old.landed) + landing.length,
    start: motion ? start : start + add,
    arrive: motion ? arrive : null,
    flight,
  }
}
