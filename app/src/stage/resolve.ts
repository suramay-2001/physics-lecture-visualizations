/**
 * Content state → Resolved state (W-L1 §2.6; pure, frozen at `l1-freeze`).
 *
 * `resolve(state, s)` converts authored inputs (degrees, named kets, weights, sweeps at hold progress s)
 * and RECOMPUTES every observable with the engine: bench fractions (`benchTheory`), plane probabilities
 * (`prob`), Bloch P(+) (`prob` with `ketAlong`), ball purity (`purityOfNorm`), operator eigenvalues and
 * class (`classify`). Content never writes an observable, so prose, stage and claims cannot drift.
 *
 * `validateStage` / `validateLayout` / `validateTransition` return human-readable problems ([] = valid);
 * the content test requires [] for every beat, and DEV code may log them at mount.
 */
import type {
  BallPoint,
  BallState,
  BlochState,
  Dir,
  HilbertPlaneState,
  HopfState,
  LabDevice,
  LabReadout,
  LabState,
  MeasureAxis,
  OperatorSpec,
  OperatorState,
  PlaneKet,
  PlaneOp,
  Scrub,
  StageKind,
  StageLayout,
  StageState,
  StateOf,
} from '../content/stage'
import { HOPF_FIBER_SETS, layoutStates } from '../content/stage'
import { SHOTS } from '../content/stageVocab'
import { c, expi } from '../physics/complex'
import { blochOfMixture, pPlus as ballPPlus, purityOfNorm } from '../physics/density'
import { blochPoint } from '../physics/hopf'
import { type Mat, apply, identity, inner, vec, vscale } from '../physics/linalg'
import { parseMatrix2 } from '../physics/expr'
import { classify, compose, decomposeHermitian } from '../physics/operators'
import { binomialStd } from '../physics/random'
import { type Sign, benchTheory } from '../physics/sg'
import { AXIS, KET, type NamedKet, SIGMA_X, SIGMA_Z, SX, SZ, blochVector, ketAlong, ketFromBloch, prob, rotation, spreadsFromBloch, tiltXZ } from '../physics/spin'
import { clamp01, smoothstep } from './sample'
import type {
  Chip,
  Resolved,
  ResolvedBall,
  ResolvedBench,
  ResolvedBloch,
  ResolvedHopf,
  ResolvedLab,
  ResolvedOperator,
  ResolvedPlane,
  V3,
} from './types'

export const DEG = Math.PI / 180
const EPS = 1e-9

/* ------------------------------------------------------------------------------------------------ */
/* Scalars, directions, axes                                                                         */
/* ------------------------------------------------------------------------------------------------ */

/** A scrubbed value at hold progress s (linear unless `ease: 'smooth'`). */
export function scrub(v: Scrub, s: number): number {
  if (typeof v === 'number') return v
  const e = v.ease === 'smooth' ? smoothstep(s) : clamp01(s)
  return v.from + (v.to - v.from) * e
}

const NAMED_ANGLES: Record<NamedKet, [number, number]> = {
  '+z': [0, 0],
  '-z': [Math.PI, 0],
  '+x': [Math.PI / 2, 0],
  '-x': [Math.PI / 2, Math.PI],
  '+y': [Math.PI / 2, Math.PI / 2],
  '-y': [Math.PI / 2, -Math.PI / 2],
}
const isNamed = (d: unknown): d is NamedKet => typeof d === 'string' && d in NAMED_ANGLES

/** Bloch polar angles (radians) of a direction. */
export function dirAngles(d: Dir, s: number): { theta: number; phi: number } {
  if (isNamed(d)) return { theta: NAMED_ANGLES[d][0], phi: NAMED_ANGLES[d][1] }
  return { theta: scrub(d.thetaDeg, s) * DEG, phi: scrub(d.phiDeg, s) * DEG }
}

/** The ket of a direction: KET[name] for named kets (the lecture's phase convention), else ketFromBloch. */
export function dirKet(d: Dir, s: number) {
  if (isNamed(d)) return KET[d]
  const { theta, phi } = dirAngles(d, s)
  return ketFromBloch(theta, phi)
}

const spherical = (theta: number, phi: number): V3 => [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]

/** Unit measurement axis n̂ in physics coordinates. */
export function measureAxis(m: MeasureAxis, s: number): V3 {
  if (m === 'x' || m === 'y' || m === 'z') return [...AXIS[m]] as V3
  if (typeof m === 'number') return tiltXZ(m * DEG)
  if ('tiltDeg' in m) return tiltXZ(scrub(m.tiltDeg, s) * DEG)
  return spherical(scrub(m.thetaDeg, s) * DEG, scrub(m.phiDeg, s) * DEG)
}

const norm3 = (v: V3) => Math.hypot(v[0], v[1], v[2])
const near3 = (a: V3, b: V3, eps = 1e-9) => Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps && Math.abs(a[2] - b[2]) < eps

/* ------------------------------------------------------------------------------------------------ */
/* lab-r3                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

/** Device tilt in degrees from +z toward +x ('y' → NaN; flagged by validateStage). */
export function deviceTiltDeg(d: LabDevice, s: number): number {
  const a = d.axis
  if (a === 'z') return 0
  if (a === 'x') return 90
  if (a === 'y') return Number.NaN
  if (typeof a === 'number') return a
  return scrub(a.tiltDeg, s)
}

const NAMED_DIRS: [NamedKet, V3][] = [
  ['+z', [0, 0, 1]],
  ['-z', [0, 0, -1]],
  ['+x', [1, 0, 0]],
  ['-x', [-1, 0, 0]],
  ['+y', [0, 1, 0]],
  ['-y', [0, -1, 0]],
]
/** The named ket of the kept beam ±n̂, when ±n̂ is one of ±x, ±y, ±z. */
export function namedOf(axis: V3, sign: Sign): NamedKet | null {
  const v: V3 = sign === '+' ? axis : [-axis[0], -axis[1], -axis[2]]
  for (const [name, d] of NAMED_DIRS) if (near3(v, d)) return name
  return null
}

/** One bench at given tilts (radians): axes, exact fractions and chips recomputed with the engine. */
export function benchFrom(
  id: ResolvedBench['id'],
  source: ResolvedBench['source'],
  tilts: number[],
  keep: Sign[],
  openOther: boolean[],
  showPrep: boolean,
  fires = 1,
): ResolvedBench {
  const axes = tilts.map((t) => tiltXZ(Number.isFinite(t) ? t : 0) as V3)
  const theory = benchTheory({ source, axes: tilts.map((t) => (Number.isFinite(t) ? t / DEG : 0)), keep })
  const chips: Chip[] = [source === 'oven' ? 'oven' : { axis: blochVector(KET[source]) as V3, sign: '+', named: source }]
  for (let k = 0; k < tilts.length - 1; k++) chips.push({ axis: axes[k], sign: keep[k], named: namedOf(axes[k], keep[k]) })
  return { id, source, tilts, axes, keep, openOther, theory, chips, showPrep, fires }
}

export type LabStats = Pick<ResolvedLab, 'centroid' | 'sigmaBand' | 'sigmaFraction' | 'spread' | 'tallies'>

/**
 * The lab's engine statistics (interface change D4): ⟨σₙ⟩ centroid and the finite-sample band of bench 0, and
 * per-bench truth tallies. Pure; resolve AND interp call it, so an in-between frame's numbers are true for
 * its tilts. Keys are omitted (never undefined) when they do not apply. See ResolvedLab for the definitions.
 */
export function labStats(
  benches: readonly ResolvedBench[],
  batches: readonly number[] | null,
  batch: number,
  readouts: readonly LabReadout[],
): LabStats {
  const out: LabStats = {}
  const b0 = benches[0]
  const landed = b0 ? b0.theory.plus + b0.theory.minus : 0
  if (b0 && landed > EPS) {
    const p = b0.theory.plus / landed
    out.centroid = (b0.theory.plus - b0.theory.minus) / landed
    // a ±1 reading has variance 1 − ⟨σₙ⟩² (Lecture 3 §7): the same as spreadAlong(n, m) for a prepared state
    if (readouts.includes('spread')) out.spread = Math.sqrt(Math.max(0, 1 - out.centroid * out.centroid))
    if (batches) {
      const n = batches[Math.min(batches.length - 1, Math.max(0, batch))]
      // σ of the count of + readings is the binomial √(n p (1 − p)); a reading σₙ = 2·[+] − 1, so the mean
      // reading scatters twice as far as the fraction p.
      out.sigmaFraction = binomialStd(n, p) / n
      out.sigmaBand = (2 * binomialStd(n, p)) / n
    }
  }
  if (readouts.includes('truth-table') || readouts.includes('tally-bars'))
    out.tallies = benches.map((b) => {
      // false = every device reads −: the same bench with each device keeping its '−' output
      const f = benchTheory({ source: b.source, axes: b.tilts.map((t) => (Number.isFinite(t) ? t / DEG : 0)), keep: b.tilts.slice(0, -1).map((): Sign => '-') }).minus
      return { true: 1 - f, false: f }
    })
  return out
}

function resolveLab(st: LabState, s: number): ResolvedLab {
  const benches = st.benches.map((b) =>
    benchFrom(
      b.id,
      b.source,
      b.devices.map((d) => deviceTiltDeg(d, s) * DEG),
      b.devices.slice(0, -1).map((d) => d.keep ?? '+'),
      b.devices.map((d) => !!d.openOther),
      !!b.showPrep,
      b.fires === false ? 0 : 1,
    ),
  )
  const batches = st.batches && st.batches.length ? [...st.batches] : null
  const batch = batches ? Math.min(batches.length - 1, Math.floor(clamp01(s) * batches.length)) : 0
  const readouts = st.readouts ?? []
  return {
    kind: 'lab-r3',
    benches,
    gradient: st.field === 'uniform' ? 0 : 1,
    ghostBand: st.ghostBand ? 1 : 0,
    dim: st.dim ? 1 : 0,
    model: st.model ?? 'quantum',
    flow: st.flow ?? 'stream',
    deposit: st.deposit ?? 'build',
    readouts,
    variant: st.variant ?? 'sg',
    batches,
    batch,
    shot: st.shot,
    beamTo: st.beamTo ?? 'plate',
    ...labStats(benches, batches, batch, readouts),
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* hilbert-plane                                                                                     */
/* ------------------------------------------------------------------------------------------------ */

/** Angle of a real ket in the plane (radians): |+z⟩ at 0, |−z⟩ at π/2, |+x⟩ at π/4, |−x⟩ at −π/4. */
export function planeAngle(k: PlaneKet, s: number): number {
  if (k === '+z') return 0
  if (k === '-z') return Math.PI / 2
  if (k === '+x') return Math.PI / 4
  if (k === '-x') return -Math.PI / 4
  if ('planeDeg' in k) return scrub(k.planeDeg, s) * DEG
  if ('blochDeg' in k) return (scrub(k.blochDeg, s) * DEG) / 2 // the half-angle is computed, never authored
  return planeAngle(k.neg, s) + Math.PI
}

const planeKet = (angle: number) => vec(Math.cos(angle), Math.sin(angle))

/** [P(first basis ket), P(second)] for ψ at `psi` in the frame at `basis` — the engine's Born rule. */
export function planeProbs(psi: number, basis: number): [number, number] {
  const k = planeKet(psi)
  return [prob(planeKet(basis), k), prob(planeKet(basis + Math.PI / 2), k)]
}

const PLANE_OPS: Record<'I' | 'sx' | 'sz' | 'Sx' | 'Sz', Mat> = { I: identity(2), sx: SIGMA_X, sz: SIGMA_Z, Sx: SX, Sz: SZ }

/** The real 2×2 matrix of a plane operator, or null when a cell does not compile or is not real. */
export function planeOpMatrix(op: PlaneOp): Mat | null {
  if ('named' in op) return PLANE_OPS[op.named] ?? null
  const m = parseMatrix2(op.matrix)
  if (!m.ok) return null
  return m.M.every((row) => row.every((z) => Math.abs(z.im) < 1e-12)) ? m.M : null
}

/** Â|ψ⟩ for ψ at plane angle `psi`: (x, y) = its |+z⟩ and |−z⟩ parts (real by construction). */
function planeImage(M: Mat, psi: number): { x: number; y: number } {
  const v = apply(M, planeKet(psi))
  return { x: v[0].re, y: v[1].re }
}

/** Plane angle of frame vector `index`: z frame |+z⟩ 0, |−z⟩ 90°; x frame |+x⟩ 45°, |−x⟩ −45° (the engine's kets). */
export const frameAngle = (basis: number, index: 0 | 1): number => (index === 0 ? basis : basis === 0 ? Math.PI / 2 : basis - Math.PI / 2)

/** Signed part of ψ along frame vector `index`: cᵢ = ⟨eᵢ|ψ⟩, with the engine's inner product on the real kets. */
function frameCoeff(psi: number, basis: number, index: 0 | 1): number {
  return inner(planeKet(frameAngle(basis, index)), planeKet(psi)).re
}

function resolvePlane(st: HilbertPlaneState, s: number): ResolvedPlane {
  const psi = st.psi === undefined ? null : planeAngle(st.psi, s)
  const basis = st.basis === 'x' ? Math.PI / 4 : 0
  const M = st.image ? planeOpMatrix(st.image) : null
  const image = M && psi !== null ? { ...planeImage(M, psi), alpha: 1, label: st.image?.label ?? '$\\hat A|\\psi\\rangle$' } : null
  // the zoom follows the longest image over the whole hold, so a sweep never rescales the plane mid-beat
  let extent = 1
  if (M && st.psi !== undefined)
    for (let k = 0; k <= 16; k++) {
      const im = planeImage(M, planeAngle(st.psi, k / 16))
      extent = Math.max(extent, Math.hypot(im.x, im.y))
    }
  let project: ResolvedPlane['project'] = null
  if (st.project && psi !== null) {
    const index = (st.project - 1) as 0 | 1
    const ci = frameCoeff(psi, basis, index)
    const renorm = st.renormalize ? smoothstep(clamp01(s)) : 0
    project = { index, len: Math.sign(ci) * (Math.abs(ci) + (1 - Math.abs(ci)) * renorm), alpha: 1, renorm }
  }
  return {
    kind: 'hilbert-plane',
    psi,
    psiAlpha: psi === null ? 0 : 1,
    others: (st.others ?? []).map((o) => ({ angle: planeAngle(o.ket, s), role: o.role, badge: o.badge, alpha: 1 })),
    basis,
    probs: psi === null ? null : planeProbs(psi, basis),
    shadows: st.shadows ? 1 : 0,
    rightAngle: st.rightAngle ? 1 : 0,
    arc: st.arc ? 1 : 0,
    ticks: st.ticks ? 1 : 0,
    image,
    extent,
    project,
    shot: st.shot,
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* bloch                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

/** Observables of a Bloch state from its inputs (shared with interp so in-between frames are true). */
export function blochFrom(
  st: Pick<ResolvedBloch, 'trail' | 'labels' | 'path' | 'shot' | 'dropLines' | 'readouts'>,
  ket0: ReturnType<typeof dirKet>,
  rot: ResolvedBloch['rot'],
  gamma: number,
  axis: V3 | null,
): ResolvedBloch {
  const base = blochVector(ket0) as V3
  const ket1 = rot ? apply(rotation(rot.axis, rot.angle), ket0) : ket0
  const ket = vscale(ket1, expi(gamma))
  const r = blochVector(ket) as V3
  return {
    kind: 'bloch',
    r,
    ket,
    globalPhase: gamma,
    axis,
    pPlus: axis ? prob(ketAlong(axis), ket) : null,
    trail: st.trail,
    labels: st.labels,
    path: st.path,
    base,
    rot,
    dropLines: st.dropLines,
    readouts: st.readouts,
    avg: [r[0] / 2, r[1] / 2, r[2] / 2],
    spreads: spreadsFromBloch(r) as V3,
    shot: st.shot,
  }
}

/** A rotation axis of a bloch state: a named axis or any direction (θ from +z, φ from +x toward +y). */
export function rotateAxis(a: NonNullable<BlochState['rotate']>['axis']): V3 {
  if (typeof a === 'string') return [...AXIS[a]] as V3
  const t = a.thetaDeg * DEG
  const p = a.phiDeg * DEG
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]
}

function resolveBloch(st: BlochState, s: number): ResolvedBloch {
  return blochFrom(
    {
      trail: !!st.trail,
      labels: st.labels ?? 'spin',
      path: st.path === undefined || st.path === 'geodesic' ? 'geodesic' : { about: [...AXIS[st.path.about]] as V3 },
      shot: st.shot,
      dropLines: st.dropLines ?? [],
      readouts: st.readouts ?? [],
    },
    dirKet(st.state, s),
    st.rotate ? { axis: rotateAxis(st.rotate.axis), angle: scrub(st.rotate.angleDeg, s) * DEG } : null,
    scrub(st.globalPhaseDeg ?? 0, s) * DEG,
    st.measure === undefined ? null : measureAxis(st.measure, s),
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* bloch-ball                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

/** Bloch vector of a ball point and its recipe (the mixture's ingredients; the oven is ½ +z + ½ −z). */
export function ballPoint(p: BallPoint, s: number): { r: V3; recipe: { w: number; r: V3 }[] | null } {
  if (p === 'oven')
    return {
      r: [0, 0, 0],
      recipe: [
        { w: 0.5, r: [0, 0, 1] },
        { w: 0.5, r: [0, 0, -1] },
      ],
    }
  if (typeof p === 'object' && 'mix' in p) {
    const parts = p.mix.map((m) => ({ w: m.w, r: blochVector(dirKet(m.of, s)) as V3 }))
    return { r: blochOfMixture(parts) as V3, recipe: parts }
  }
  if (typeof p === 'object' && 'r' in p) return { r: [p.r[0], p.r[1], p.r[2]], recipe: null }
  return { r: blochVector(dirKet(p, s)) as V3, recipe: null }
}

/** Observables of a ball state from its inputs. */
export function ballFrom(
  r: V3,
  rest: Pick<ResolvedBall, 'compare' | 'recipe' | 'compareRecipe' | 'axis' | 'update' | 'purityShown' | 'shot'>,
): ResolvedBall {
  const rNorm = norm3(r)
  return {
    kind: 'bloch-ball',
    r,
    rNorm,
    purity: purityOfNorm(rNorm),
    pPlus: rest.axis ? ballPPlus(r, rest.axis) : null,
    ...rest,
  }
}

function resolveBall(st: BallState, s: number): ResolvedBall {
  const p = ballPoint(st.point, s)
  const c = st.compare === undefined ? null : ballPoint(st.compare, s)
  return ballFrom(p.r, {
    compare: c ? c.r : null,
    recipe: st.recipe ? p.recipe : null,
    compareRecipe: st.recipe && c ? c.recipe : null,
    axis: st.measure === undefined ? null : measureAxis(st.measure, s),
    update: st.update ?? 'none',
    purityShown: st.purity ? 1 : 0,
    shot: st.shot,
  })
}

/* ------------------------------------------------------------------------------------------------ */
/* hopf                                                                                              */
/* ------------------------------------------------------------------------------------------------ */

/** The marked bead: R_z(α) moves the base point to φ₀ + α and the phase to χ₀ − α/2 (decision #15). */
export function hopfMarked(theta: number, phi0: number, chi0: number, alpha: number): NonNullable<ResolvedHopf['marked']> {
  const phi = phi0 + alpha
  return { theta, phi, chi: chi0 - alpha / 2, r: blochPoint(theta, phi), base: { theta, phi: phi0, chi: chi0 }, rotAngle: alpha }
}

function resolveHopf(st: HopfState, s: number): ResolvedHopf {
  let marked: ResolvedHopf['marked'] = null
  if (st.marked) {
    const { theta, phi } = dirAngles(st.marked.state, s)
    const chi0 = scrub(st.marked.globalPhaseDeg ?? 0, s) * DEG
    const alpha = st.marked.rotate ? scrub(st.marked.rotate.angleDeg, s) * DEG : 0
    marked = hopfMarked(theta, phi, chi0, alpha)
  }
  return {
    kind: 'hopf',
    fibers: st.fibers,
    reveal: HOPF_FIBER_SETS.indexOf(st.fibers),
    count: st.count ?? 64,
    linking: st.linking ? 1 : 0,
    marked,
    mini: st.mini ?? true,
    shot: st.shot,
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* operator-space                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

const NAMED_OPS: Record<'I' | 'sx' | 'sy' | 'sz' | 'Sx' | 'Sy' | 'Sz', { a0: number; a: V3 }> = {
  I: { a0: 1, a: [0, 0, 0] },
  sx: { a0: 0, a: [1, 0, 0] },
  sy: { a0: 0, a: [0, 1, 0] },
  sz: { a0: 0, a: [0, 0, 1] },
  Sx: { a0: 0, a: [0.5, 0, 0] },
  Sy: { a0: 0, a: [0, 0.5, 0] },
  Sz: { a0: 0, a: [0, 0, 0.5] },
}

/** A `matrix` spec compiled by physics/expr.ts (no eval) → Hermitian (a₀, a⃗), or null (bad entry / not Hermitian). */
function matrixCoeffs(cells: [[string, string], [string, string]]): { a0: number; a: V3 } | null {
  const m = parseMatrix2(cells)
  if (!m.ok) return null
  const d = decomposeHermitian(m.M)
  return d ? { a0: d.a0, a: [d.a[0], d.a[1], d.a[2]] } : null
}

/** (a₀, a⃗) of an operator spec; a `matrix` spec that fails to compile or is not Hermitian resolves as invalid. */
export function opCoeffs(spec: OperatorSpec, s: number): { a0: number; a: V3; valid: boolean } {
  if ('named' in spec) {
    const k = scrub(spec.scale ?? 1, s)
    const n = NAMED_OPS[spec.named]
    return { a0: k * n.a0, a: [k * n.a[0], k * n.a[1], k * n.a[2]], valid: true }
  }
  if ('matrix' in spec) {
    const m = matrixCoeffs(spec.matrix)
    return m ? { ...m, valid: true } : { a0: 0, a: [0, 0, 0], valid: false }
  }
  return { a0: scrub(spec.a0, s), a: [scrub(spec.a[0], s), scrub(spec.a[1], s), scrub(spec.a[2], s)], valid: true }
}

const eigOf = (a0: number, a: V3): [number, number] => {
  const len = norm3(a)
  return [a0 + len, a0 - len]
}

/** Observables of an operator from its coefficients: eigenvalues a₀ ± |a⃗|, â, classification, sum. */
export function operatorFrom(
  op: { a0: number; a: V3; valid: boolean },
  add: { a0: number; a: V3 } | null,
  rest: Pick<ResolvedOperator, 'eigen' | 'gauge' | 'shot'>,
): ResolvedOperator {
  const len = norm3(op.a)
  const M = compose({ a0: c(op.a0), a: [c(op.a[0]), c(op.a[1]), c(op.a[2])] })
  return {
    kind: 'operator-space',
    a0: op.a0,
    a: op.a,
    eig: eigOf(op.a0, op.a),
    ahat: len > 1e-12 ? [op.a[0] / len, op.a[1] / len, op.a[2] / len] : null,
    cls: classify(M),
    add,
    sum: add
      ? {
          a0: op.a0 + add.a0,
          a: [op.a[0] + add.a[0], op.a[1] + add.a[1], op.a[2] + add.a[2]],
          eig: eigOf(op.a0 + add.a0, [op.a[0] + add.a[0], op.a[1] + add.a[1], op.a[2] + add.a[2]]),
        }
      : null,
    valid: op.valid,
    ...rest,
  }
}

function resolveOperator(st: OperatorState, s: number): ResolvedOperator {
  const add = st.add ? opCoeffs(st.add, s) : null
  const op = opCoeffs(st.op, s)
  return operatorFrom(
    { ...op, valid: op.valid && (add?.valid ?? true) },
    add ? { a0: add.a0, a: add.a } : null,
    { eigen: st.eigen ? 1 : 0, gauge: st.gauge === false ? 0 : 1, shot: st.shot },
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Entry points                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

/** Content state at hold progress s → Resolved state with engine observables. Never throws on valid input. */
export function resolve<K extends StageKind>(st: StateOf<K>, s: number): Resolved<K> {
  const x = st as StageState
  switch (x.kind) {
    case 'lab-r3':
      return resolveLab(x, s) as Resolved<K>
    case 'hilbert-plane':
      return resolvePlane(x, s) as Resolved<K>
    case 'bloch':
      return resolveBloch(x, s) as Resolved<K>
    case 'bloch-ball':
      return resolveBall(x, s) as Resolved<K>
    case 'hopf':
      return resolveHopf(x, s) as Resolved<K>
    case 'operator-space':
      return resolveOperator(x, s) as Resolved<K>
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Validation                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

const scrubOk = (v: Scrub | undefined) =>
  v === undefined || (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))

function dirProblems(d: Dir, where: string): string[] {
  if (isNamed(d)) return []
  if (typeof d !== 'object' || d === null || !('thetaDeg' in d)) return [`${where}: not a direction`]
  return scrubOk(d.thetaDeg) && scrubOk(d.phiDeg) ? [] : [`${where}: non-finite angle`]
}

function axisProblems(m: MeasureAxis | undefined, where: string): string[] {
  if (m === undefined || m === 'x' || m === 'y' || m === 'z') return []
  if (typeof m === 'number') return Number.isFinite(m) ? [] : [`${where}: non-finite tilt`]
  if ('tiltDeg' in m) return scrubOk(m.tiltDeg) ? [] : [`${where}: non-finite tilt`]
  return scrubOk(m.thetaDeg) && scrubOk(m.phiDeg) ? [] : [`${where}: non-finite angle`]
}

function planeKetProblems(k: PlaneKet, where: string): string[] {
  if (k === '+z' || k === '-z' || k === '+x' || k === '-x') return []
  if (typeof k !== 'object' || k === null) return [`${where}: not a real ket (only ±z, ±x, planeDeg, blochDeg, neg)`]
  if ('planeDeg' in k) return scrubOk(k.planeDeg) ? [] : [`${where}: non-finite angle`]
  if ('blochDeg' in k) return scrubOk(k.blochDeg) ? [] : [`${where}: non-finite angle`]
  if ('neg' in k) return planeKetProblems(k.neg, `${where}.neg`)
  return [`${where}: not a real ket`]
}

function ballPointProblems(p: BallPoint, s: number, where: string): string[] {
  if (p === 'oven') return []
  if (typeof p === 'object' && 'mix' in p) {
    const errs: string[] = []
    if (!p.mix.length) errs.push(`${where}: empty mixture`)
    const sum = p.mix.reduce((a, m) => a + m.w, 0)
    if (Math.abs(sum - 1) > 1e-9) errs.push(`${where}: weights sum to ${sum}, not 1`)
    p.mix.forEach((m, i) => {
      if (!(m.w >= 0)) errs.push(`${where}.mix[${i}]: negative weight`)
      errs.push(...dirProblems(m.of, `${where}.mix[${i}].of`))
    })
    return errs
  }
  if (typeof p === 'object' && 'r' in p) {
    if (!p.r.every(Number.isFinite)) return [`${where}: non-finite r`]
    return norm3(p.r) <= 1 + EPS ? [] : [`${where}: |r| = ${norm3(p.r)} > 1 is not a state`]
  }
  void s
  return dirProblems(p, where)
}

function opProblems(spec: OperatorSpec, where: string): string[] {
  if ('named' in spec) return spec.named in NAMED_OPS && scrubOk(spec.scale) ? [] : [`${where}: bad named operator`]
  if ('matrix' in spec) {
    const m = parseMatrix2(spec.matrix)
    if (!m.ok) return [`${where}: matrix cell [${m.cell.join(',')}] does not compile (${m.reason} at ${m.pos})`]
    return decomposeHermitian(m.M) ? [] : [`${where}: matrix is not Hermitian`]
  }
  return scrubOk(spec.a0) && spec.a.every(scrubOk) ? [] : [`${where}: non-finite coefficient`]
}

/** Readouts drawn from the plate deposit (a beam that stops in the gap cannot feed them). */
const PLATE_READOUTS: readonly LabReadout[] = ['centroid', 'fill-bar', 'sigma-band', 'spread', 'truth-table', 'tally-bars']

/** Problems with one stage state ([] = valid). */
export function validateStage(st: StageState): string[] {
  const k = st.kind
  const errs: string[] = []
  if (st.shot !== undefined && !SHOTS[k].includes(st.shot)) errs.push(`${k}: unknown shot "${st.shot}"`)
  switch (st.kind) {
    case 'lab-r3': {
      const ids = st.benches.map((b) => b.id)
      if (st.benches.length === 1 && ids[0] !== 'main') errs.push(`lab-r3: a single bench has id 'main'`)
      if (st.benches.length === 2 && !(ids.includes('A') && ids.includes('B'))) errs.push(`lab-r3: two benches are 'A' and 'B'`)
      st.benches.forEach((b) => {
        const w = `lab-r3 bench ${b.id}`
        if (b.devices.length < 1 || b.devices.length > 4) errs.push(`${w}: 1–4 devices`)
        // the prep module is a magnet along the source's axis (scenes/lab/layout.ts); none on this bench can point along y
        if (b.showPrep && (b.source === 'oven' || b.source[1] === 'y')) errs.push(`${w}: showPrep draws a magnet along the source's axis; it needs a ±z or ±x source`)
        b.devices.forEach((d, i) => {
          if (d.axis === 'y') errs.push(`${w} device ${i}: the beam flies along y; magnets point in the x–z plane`)
          else if (typeof d.axis === 'number' ? !Number.isFinite(d.axis) : typeof d.axis === 'object' && !scrubOk(d.axis.tiltDeg))
            errs.push(`${w} device ${i}: non-finite tilt`)
          const last = i === b.devices.length - 1
          if (!last && d.keep === undefined) errs.push(`${w} device ${i}: 'keep' is required on every device but the last`)
          if (last && d.keep !== undefined) errs.push(`${w} device ${i}: the last device lands both beams; 'keep' has no meaning`)
        })
      })
      for (const b of st.benches)
        if (b.fires !== undefined && typeof b.fires !== 'boolean') errs.push(`lab-r3 bench ${b.id}: 'fires' is true or false`)
      if (st.benches.every((b) => b.fires === false) && (st.flow ?? 'stream') !== 'off')
        errs.push(`lab-r3: no bench fires; say flow: 'off' instead`)
      if (st.batches && !st.batches.every((n) => Number.isInteger(n) && n > 0)) errs.push('lab-r3: batches are positive integers')
      if (st.readouts?.includes('spread') && !st.readouts.includes('centroid')) errs.push(`lab-r3: the 'spread' bracket sits on the centroid; add 'centroid'`)
      if (st.beamTo !== undefined && st.beamTo !== 'gap' && st.beamTo !== 'plate') errs.push(`lab-r3: beamTo is 'gap' or 'plate'`)
      if (st.beamTo === 'gap') {
        const onPlate = (st.readouts ?? []).filter((r) => PLATE_READOUTS.includes(r))
        if (onPlate.length) errs.push(`lab-r3: beamTo 'gap' stops the atoms before the plate; plate readouts [${onPlate.join(', ')}] have nothing to show`)
        if (st.batches?.length) errs.push(`lab-r3: beamTo 'gap' stops the atoms before the plate; batches need the plate`)
      }
      break
    }
    case 'hilbert-plane':
      if (st.psi !== undefined) errs.push(...planeKetProblems(st.psi, 'hilbert-plane psi'))
      st.others?.forEach((o, i) => errs.push(...planeKetProblems(o.ket, `hilbert-plane others[${i}]`)))
      if (st.image) {
        if (st.psi === undefined) errs.push('hilbert-plane image: needs psi (the image is Â applied to ψ)')
        if (!planeOpMatrix(st.image)) errs.push('hilbert-plane image: a cell does not compile or is not real (a complex entry leaves this real slice)')
      }
      if (st.project !== undefined) {
        if (st.project !== 1 && st.project !== 2) errs.push('hilbert-plane project: 1 or 2 (the frame vector)')
        if (st.psi === undefined) errs.push('hilbert-plane project: needs psi')
      }
      if (st.renormalize && st.project === undefined) errs.push('hilbert-plane renormalize: needs project')
      if (st.renormalize && st.project && st.psi !== undefined)
        for (const k of [0, 0.5, 1])
          if (Math.abs(frameCoeff(planeAngle(st.psi, k), st.basis === 'x' ? Math.PI / 4 : 0, (st.project - 1) as 0 | 1)) < 1e-9)
            errs.push('hilbert-plane renormalize: that outcome has probability 0, so there is nothing to rescale')
      break
    case 'bloch':
      errs.push(...dirProblems(st.state, 'bloch state'), ...axisProblems(st.measure, 'bloch measure'))
      if (st.rotate && !scrubOk(st.rotate.angleDeg)) errs.push('bloch rotate: non-finite angle')
      if (st.rotate && typeof st.rotate.axis === 'object' && !(Number.isFinite(st.rotate.axis.thetaDeg) && Number.isFinite(st.rotate.axis.phiDeg)))
        errs.push('bloch rotate: non-finite axis direction')
      if (st.readouts?.includes('bound') && !st.readouts.includes('spreads')) errs.push(`bloch readouts: 'bound' compares the spreads; add 'spreads'`)
      if (!scrubOk(st.globalPhaseDeg)) errs.push('bloch globalPhaseDeg: non-finite')
      break
    case 'bloch-ball':
      errs.push(...ballPointProblems(st.point, 0, 'bloch-ball point'), ...axisProblems(st.measure, 'bloch-ball measure'))
      if (st.compare !== undefined) errs.push(...ballPointProblems(st.compare, 0, 'bloch-ball compare'))
      break
    case 'hopf':
      if (!HOPF_FIBER_SETS.includes(st.fibers)) errs.push(`hopf: unknown fiber set "${st.fibers}"`)
      if (st.count !== undefined && st.count !== 64 && st.count !== 128) errs.push('hopf: count is 64 or 128')
      if (st.marked) {
        errs.push(...dirProblems(st.marked.state, 'hopf marked'))
        if (!scrubOk(st.marked.globalPhaseDeg) || (st.marked.rotate && !scrubOk(st.marked.rotate.angleDeg))) errs.push('hopf marked: non-finite angle')
      }
      break
    case 'operator-space':
      errs.push(...opProblems(st.op, 'operator-space op'))
      if (st.add) errs.push(...opProblems(st.add, 'operator-space add'))
      break
  }
  // Every resolved number must be finite across the hold.
  if (!errs.length) {
    for (const s of [0, 0.5, 1]) {
      const bad = firstNonFinite(resolve(st, s))
      if (bad) {
        errs.push(`${k}: non-finite resolved value at s = ${s} (${bad})`)
        break
      }
    }
  }
  return errs
}

/** Path of the first non-finite number in a resolved state, or null. */
export function firstNonFinite(x: unknown, path = ''): string | null {
  if (typeof x === 'number') return Number.isFinite(x) ? null : path || '(root)'
  if (Array.isArray(x)) {
    for (let i = 0; i < x.length; i++) {
      const p = firstNonFinite(x[i], `${path}[${i}]`)
      if (p) return p
    }
    return null
  }
  if (x && typeof x === 'object') {
    for (const [key, v] of Object.entries(x)) {
      const p = firstNonFinite(v, path ? `${path}.${key}` : key)
      if (p) return p
    }
  }
  return null
}

/** Problems with a layout: each state, and no repeated kind (a kind keeps one view per unit). */
export function validateLayout(l: StageLayout): string[] {
  const states = layoutStates(l)
  const errs = states.flatMap(validateStage)
  const kinds = states.map((s) => s.kind)
  if (new Set(kinds).size !== kinds.length) errs.push(`layout repeats a kind: ${kinds.join(' + ')}`)
  return errs
}

/** Problems with the change from state a (leaving, at s = 1) to b (entering, at s = 0) of the same kind. */
export function validateTransition(a: StageState, b: StageState): string[] {
  if (a.kind !== b.kind) return []
  if (a.kind === 'bloch' && b.kind === 'bloch') {
    const ra = resolveBloch(a, 1)
    const rb = resolveBloch(b, 0)
    const sameRotation = ra.rot && rb.rot && near3(ra.base, rb.base) && near3(ra.rot.axis, rb.rot.axis)
    if (rb.path === 'geodesic') {
      const d = ra.r[0] * rb.r[0] + ra.r[1] * rb.r[1] + ra.r[2] * rb.r[2]
      if (!sameRotation && d < -1 + 1e-9) return ['bloch: antipodal endpoints have no unique great circle; set path: { about }']
    } else {
      const ax = rb.path.about
      const pa = ra.r[0] * ax[0] + ra.r[1] * ax[1] + ra.r[2] * ax[2]
      const pb = rb.r[0] * ax[0] + rb.r[1] * ax[1] + rb.r[2] * ax[2]
      if (Math.abs(pa - pb) > 1e-6) return ['bloch: path.about needs both endpoints at the same height along that axis']
    }
  }
  if (a.kind === 'hopf' && b.kind === 'hopf' && (a.count ?? 64) !== (b.count ?? 64))
    return ['hopf: avoid changing the fiber count between beats (geometry rebuild)']
  return []
}
