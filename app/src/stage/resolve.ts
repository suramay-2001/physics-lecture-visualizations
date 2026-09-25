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
  LabState,
  MeasureAxis,
  OperatorSpec,
  OperatorState,
  PlaneKet,
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
import { apply, vec, vscale } from '../physics/linalg'
import { parseMatrix2 } from '../physics/expr'
import { classify, compose, decomposeHermitian } from '../physics/operators'
import { type Sign, benchTheory } from '../physics/sg'
import { AXIS, KET, type NamedKet, blochVector, ketAlong, ketFromBloch, prob, rotation, tiltXZ } from '../physics/spin'
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
  return {
    kind: 'lab-r3',
    benches,
    gradient: st.field === 'uniform' ? 0 : 1,
    ghostBand: st.ghostBand ? 1 : 0,
    dim: st.dim ? 1 : 0,
    model: st.model ?? 'quantum',
    flow: st.flow ?? 'stream',
    deposit: st.deposit ?? 'build',
    readouts: st.readouts ?? [],
    variant: st.variant ?? 'sg',
    batches,
    batch: batches ? Math.min(batches.length - 1, Math.floor(clamp01(s) * batches.length)) : 0,
    shot: st.shot,
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

function resolvePlane(st: HilbertPlaneState, s: number): ResolvedPlane {
  const psi = st.psi === undefined ? null : planeAngle(st.psi, s)
  const basis = st.basis === 'x' ? Math.PI / 4 : 0
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
    shot: st.shot,
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* bloch                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

/** Observables of a Bloch state from its inputs (shared with interp so in-between frames are true). */
export function blochFrom(
  st: Pick<ResolvedBloch, 'trail' | 'labels' | 'path' | 'shot'>,
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
    shot: st.shot,
  }
}

function resolveBloch(st: BlochState, s: number): ResolvedBloch {
  return blochFrom(
    {
      trail: !!st.trail,
      labels: st.labels ?? 'spin',
      path: st.path === undefined || st.path === 'geodesic' ? 'geodesic' : { about: [...AXIS[st.path.about]] as V3 },
      shot: st.shot,
    },
    dirKet(st.state, s),
    st.rotate ? { axis: [...AXIS[st.rotate.axis]] as V3, angle: scrub(st.rotate.angleDeg, s) * DEG } : null,
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
  rest: Pick<ResolvedBall, 'compare' | 'recipe' | 'axis' | 'update' | 'purityShown' | 'shot'>,
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
  return ballFrom(p.r, {
    compare: st.compare === undefined ? null : ballPoint(st.compare, s).r,
    recipe: st.recipe ? p.recipe : null,
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
      break
    }
    case 'hilbert-plane':
      if (st.psi !== undefined) errs.push(...planeKetProblems(st.psi, 'hilbert-plane psi'))
      st.others?.forEach((o, i) => errs.push(...planeKetProblems(o.ket, `hilbert-plane others[${i}]`)))
      break
    case 'bloch':
      errs.push(...dirProblems(st.state, 'bloch state'), ...axisProblems(st.measure, 'bloch measure'))
      if (st.rotate && !scrubOk(st.rotate.angleDeg)) errs.push('bloch rotate: non-finite angle')
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
