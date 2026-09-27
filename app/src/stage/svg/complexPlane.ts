/**
 * `complex-plane` (709; SVG; P-F1-story §9.2 S1): numbers as points and arrows. Content writes inputs only (z, w, the
 * marks to show, a power, an Euler limit, a chain or spokes of phasors); this resolver computes EVERY derived mark and
 * readout with the engine: physics/complex.ts (add, mul, conj, cpow, abs, arg, polar, expi) and
 * physics/qc/complexExtra.ts (eulerPath, phasorPath, phasorSum). Interpolation follows stage/interp.ts: the inputs lerp
 * (a number written in polar form turns by its angle, one written by parts moves straight), the outputs are recomputed.
 * Lazy chunk (stage/svg/kinds.ts).
 */
import type { CNum, ComplexMark, ComplexPlaneState, Scrub } from '../../content/stage'
import { type C, I, abs, abs2, add, arg, c, conj, cpow, expi, mul, polar } from '../../physics/complex'
import { eulerPath, phasorPath, phasorSum } from '../../physics/qc/complexExtra'
import { DEG, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { CNumber, ResolvedComplexPlane } from '../types'
import { degs, fix, fmtC, sup } from './draw'

export const COMPLEX_MARKS: readonly ComplexMark[] = ['sum', 'product', 'conj', 'parts', 'modulus', 'arg', 'arc', 'velocity']
/** Validation limits (P-F1-story §9.2): n whole 1–1000, at most 12 arrows, powers up to 64, drawings up to |z| 10⁴. */
export const COMPLEX_LIMITS = { nMin: 1, nMax: 1000, arrows: 12, upTo: 64, modulus: 1e4 } as const

/** A drawn number from an engine value: size and angle by complex.ts `abs` and `arg` (or the authored angle). */
export const cnumber = (z: C, phi?: number, isPolar = false): CNumber => ({ re: z.re, im: z.im, r: abs(z), phi: phi ?? arg(z), polar: isPolar })
const asC = (n: CNumber): C => c(n.re, n.im)

/** An authored number at hold progress s. */
export function cnumAt(n: CNum, s: number): CNumber {
  if ('r' in n) {
    const phi = scrub(n.phiDeg, s) * DEG
    return cnumber(polar(scrub(n.r, s), phi), phi, true)
  }
  return cnumber(c(scrub(n.re, s), scrub(n.im, s)))
}

/** The inputs of a frame: what interpolation lerps; everything else is recomputed from them. */
export interface ComplexInputs {
  z: CNumber | null
  w: CNumber | null
  show: readonly ComplexMark[]
  powers: { of: CNumber; upTo: number } | null
  euler: { rate: 'imag' | 'real'; param: number; n: number } | null
  chain: { phases: number[]; sizes: number[] } | null
  spokes: { phases: number[]; sizes: number[] } | null
  trail: { re: number; im: number }[] | null
  circle: boolean
  line: boolean
  extent: number
  shot?: ResolvedComplexPlane['shot']
}

/** Every derived mark from the inputs, by the engine (shared by resolve and interpolate). */
export function complexFrom(inp: ComplexInputs): ResolvedComplexPlane {
  const has = (m: ComplexMark) => inp.show.includes(m)
  const z = inp.z ? asC(inp.z) : null
  const w = inp.w ? asC(inp.w) : null
  let euler: ResolvedComplexPlane['euler'] = null
  if (inp.euler) {
    const { rate, param, n } = inp.euler
    const pts = rate === 'imag' ? eulerPath(param, n) : Array.from({ length: n + 1 }, (_, k) => cpow(c(1 + param / n), k))
    const points = pts.map((p) => cnumber(p))
    euler = { rate, param, n, points, end: points[n], limit: rate === 'imag' ? cnumber(expi(param), param, true) : cnumber(c(Math.exp(param))) }
  }
  return {
    kind: 'complex-plane',
    z: inp.z,
    w: inp.w,
    show: inp.show,
    sum: has('sum') && z && w ? cnumber(add(z, w)) : null,
    product: has('product') && z && w ? cnumber(mul(z, w)) : null,
    // the mirror keeps an authored angle's winding (a turned arrow's mirror turns the other way)
    conj: has('conj') && z ? cnumber(conj(z), inp.z!.polar ? -inp.z!.phi : undefined, inp.z!.polar) : null,
    velocity: has('velocity') && z ? cnumber(mul(I, z), inp.z!.phi + Math.PI / 2, true) : null,
    powers: inp.powers
      ? { of: inp.powers.of, upTo: inp.powers.upTo, points: Array.from({ length: inp.powers.upTo + 1 }, (_, k) => cnumber(cpow(asC(inp.powers!.of), k))) }
      : null,
    euler,
    chain: inp.chain
      ? (() => {
          const sum = phasorSum(inp.chain!.phases, inp.chain!.sizes)
          return { phases: inp.chain!.phases, sizes: inp.chain!.sizes, path: phasorPath(inp.chain!.phases, inp.chain!.sizes).map((p) => cnumber(p)), sum: cnumber(sum), sumAbs2: abs2(sum) }
        })()
      : null,
    spokes: inp.spokes ? { phases: inp.spokes.phases, sizes: inp.spokes.sizes, tips: inp.spokes.phases.map((ph, k) => cnumber(polar(inp.spokes!.sizes[k], ph), ph, true)) } : null,
    trail: inp.trail,
    circle: inp.circle,
    line: inp.line,
    extent: inp.extent,
    shot: inp.shot,
  }
}

const scrubInt = (v: Scrub, s: number) => Math.round(scrub(v, s))

function inputsAt(st: ComplexPlaneState, s: number, extent: number): ComplexInputs {
  const phases = (list: readonly Scrub[]) => list.map((p) => scrub(p, s) * DEG)
  const e = st.euler
  return {
    z: st.z ? cnumAt(st.z, s) : null,
    w: st.w ? cnumAt(st.w, s) : null,
    show: st.show ?? [],
    powers: st.powers ? { of: cnumAt(st.powers.of, s), upTo: scrubInt(st.powers.upTo, s) } : null,
    euler: e ? (e.rate === 'imag' ? { rate: 'imag', param: scrub(e.phiDeg, s) * DEG, n: scrubInt(e.n, s) } : { rate: 'real', param: e.x, n: scrubInt(e.n, s) }) : null,
    chain: st.chain ? { phases: phases(st.chain.phasesDeg), sizes: st.chain.phasesDeg.map((_, k) => st.chain!.sizes?.[k] ?? 1) } : null,
    spokes: st.spokes ? { phases: phases(st.spokes.phasesDeg), sizes: st.spokes.phasesDeg.map((_, k) => st.spokes!.sizes?.[k] ?? 1) } : null,
    trail: null,
    circle: st.circle ?? !st.line,
    line: !!st.line,
    extent,
    shot: st.shot,
  }
}

/** Every point a frame draws (for the extent and the number-line check). */
export function drawnPoints(r: ResolvedComplexPlane): { re: number; im: number }[] {
  const out: { re: number; im: number }[] = []
  for (const n of [r.z, r.w, r.sum, r.product, r.conj]) if (n) out.push(n)
  if (r.z && r.velocity) out.push({ re: r.z.re + r.velocity.re, im: r.z.im + r.velocity.im })
  if (r.powers) out.push(...r.powers.points)
  if (r.euler) out.push(...r.euler.points, r.euler.limit)
  if (r.chain) out.push(...r.chain.path)
  if (r.spokes) out.push(...r.spokes.tips)
  if (r.trail) out.push(...r.trail)
  return out
}

/** The drawing's half-size over the whole hold (17 samples), so a sweep never rescales the plane mid-beat. */
function extentOver(st: ComplexPlaneState): number {
  let m = 1
  for (let k = 0; k <= 16; k++) for (const p of drawnPoints(complexFrom(inputsAt(st, k / 16, 1)))) m = Math.max(m, Math.hypot(p.re, p.im))
  return Math.max(1.25, m * 1.12)
}

export function resolveComplexPlane(st: ComplexPlaneState, s: number): ResolvedComplexPlane {
  const inp = inputsAt(st, s, extentOver(st))
  if (st.trail && st.z) {
    const steps = Math.max(1, Math.ceil(64 * Math.min(1, Math.max(0, s))))
    inp.trail = Array.from({ length: steps + 1 }, (_, k) => {
      const p = cnumAt(st.z!, (Math.min(1, Math.max(0, s)) * k) / steps)
      return { re: p.re, im: p.im }
    })
  }
  return complexFrom(inp)
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** Two numbers in between: both polar → size and angle lerp (a turn); otherwise the parts lerp (a straight move). */
function lerpNum(a: CNumber | null, b: CNumber | null, t: number): CNumber | null {
  if (!a || !b) return pick(a, b, t)
  if (a.polar && b.polar) {
    const phi = lerp(a.phi, b.phi, t)
    return cnumber(polar(lerp(a.r, b.r, t), phi), phi, true)
  }
  return cnumber(c(lerp(a.re, b.re, t), lerp(a.im, b.im, t)))
}
const lerpList = (a: number[], b: number[], t: number) => a.map((x, i) => lerp(x, b[i], t))

function inputsOf(r: ResolvedComplexPlane): ComplexInputs {
  return {
    z: r.z,
    w: r.w,
    show: r.show,
    powers: r.powers ? { of: r.powers.of, upTo: r.powers.upTo } : null,
    euler: r.euler ? { rate: r.euler.rate, param: r.euler.param, n: r.euler.n } : null,
    chain: r.chain ? { phases: r.chain.phases, sizes: r.chain.sizes } : null,
    spokes: r.spokes ? { phases: r.spokes.phases, sizes: r.spokes.sizes } : null,
    trail: r.trail,
    circle: r.circle,
    line: r.line,
    extent: r.extent,
    shot: r.shot,
  }
}

export function interpComplexPlane(a: ResolvedComplexPlane, b: ResolvedComplexPlane, t: number): ResolvedComplexPlane {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = inputsOf(a)
  const B = inputsOf(b)
  const d = pick(A, B, t)
  const arrows = (x: ComplexInputs['chain'], y: ComplexInputs['chain']) =>
    x && y && x.phases.length === y.phases.length ? { phases: lerpList(x.phases, y.phases, t), sizes: lerpList(x.sizes, y.sizes, t) } : pick(x, y, t)
  return complexFrom({
    ...d,
    z: lerpNum(A.z, B.z, t),
    w: lerpNum(A.w, B.w, t),
    powers: A.powers && B.powers ? { of: lerpNum(A.powers.of, B.powers.of, t)!, upTo: Math.round(lerp(A.powers.upTo, B.powers.upTo, t)) } : d.powers,
    euler:
      A.euler && B.euler && A.euler.rate === B.euler.rate
        ? { rate: A.euler.rate, param: lerp(A.euler.param, B.euler.param, t), n: Math.max(1, Math.round(lerp(A.euler.n, B.euler.n, t))) }
        : d.euler,
    chain: arrows(A.chain, B.chain),
    spokes: arrows(A.spokes, B.spokes),
    extent: lerp(A.extent, B.extent, t),
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const finite = (v: Scrub | undefined): boolean => v === undefined || (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
const ends = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])

function cnumProblems(n: CNum | undefined, where: string): string[] {
  if (n === undefined) return []
  if (typeof n !== 'object' || n === null) return [`${where}: not a number ({re, im} or {r, phiDeg})`]
  if ('r' in n) {
    if (!finite(n.r) || !finite(n.phiDeg)) return [`${where}: non-finite size or angle`]
    return ends(n.r).some((x) => x < 0) ? [`${where}: a size r is never negative (turn the angle by 180° instead)`] : []
  }
  if ('re' in n) return finite(n.re) && finite(n.im) ? [] : [`${where}: non-finite part`]
  return [`${where}: not a number ({re, im} or {r, phiDeg})`]
}

function arrowsProblems(a: { phasesDeg: Scrub[]; sizes?: number[] } | undefined, where: string): string[] {
  if (!a) return []
  const errs: string[] = []
  if (!Array.isArray(a.phasesDeg) || a.phasesDeg.length < 1 || a.phasesDeg.length > COMPLEX_LIMITS.arrows) errs.push(`${where}: 1–${COMPLEX_LIMITS.arrows} arrows`)
  else if (!a.phasesDeg.every(finite)) errs.push(`${where}: non-finite phase`)
  if (a.sizes !== undefined && (a.sizes.length !== a.phasesDeg?.length || !a.sizes.every((x) => Number.isFinite(x) && x >= 0))) errs.push(`${where}: sizes are one finite number ≥ 0 per arrow`)
  return errs
}

function wholeProblems(v: Scrub, lo: number, hi: number, where: string): string[] {
  if (!finite(v)) return [`${where}: non-finite`]
  return ends(v).every((x) => Number.isInteger(x) && x >= lo && x <= hi) ? [] : [`${where}: a whole number ${lo}–${hi} (a sweep's ends too)`]
}

export function validateComplexPlane(st: ComplexPlaneState): string[] {
  const errs = [...cnumProblems(st.z, 'complex-plane z'), ...cnumProblems(st.w, 'complex-plane w')]
  for (const m of st.show ?? []) {
    if (!COMPLEX_MARKS.includes(m)) errs.push(`complex-plane show: unknown mark "${m}"`)
    else if ((m === 'sum' || m === 'product') && !(st.z && st.w)) errs.push(`complex-plane show '${m}': needs z and w`)
    else if (!st.z) errs.push(`complex-plane show '${m}': needs z`)
  }
  if (st.powers) {
    errs.push(...cnumProblems(st.powers.of, 'complex-plane powers.of'), ...wholeProblems(st.powers.upTo, 0, COMPLEX_LIMITS.upTo, 'complex-plane powers.upTo'))
  }
  if (st.euler) {
    const e = st.euler
    if (e.rate !== 'imag' && e.rate !== 'real') errs.push(`complex-plane euler: rate is 'imag' or 'real'`)
    else {
      errs.push(...wholeProblems(e.n, COMPLEX_LIMITS.nMin, COMPLEX_LIMITS.nMax, 'complex-plane euler.n'))
      if (e.rate === 'imag' ? !finite(e.phiDeg) : !Number.isFinite(e.x)) errs.push('complex-plane euler: non-finite angle or rate')
    }
  }
  errs.push(...arrowsProblems(st.chain, 'complex-plane chain'), ...arrowsProblems(st.spokes, 'complex-plane spokes'))
  if (st.line && st.show?.includes('velocity')) errs.push(`complex-plane line: the velocity of e^{iφ} points off the line`)
  if (errs.length) return errs
  // every drawn number stays finite and small enough to draw; on the number line, every one is real
  for (const s of [0, 0.5, 1]) {
    const r = resolveComplexPlane(st, s)
    const pts = drawnPoints(r)
    const big = pts.find((p) => !(Math.hypot(p.re, p.im) <= COMPLEX_LIMITS.modulus))
    if (big) {
      errs.push(`complex-plane: a drawn number of size ${Math.hypot(big.re, big.im).toExponential(2)} is too large to draw (≤ ${COMPLEX_LIMITS.modulus})`)
      break
    }
    if (st.line && pts.some((p) => Math.abs(p.im) > 1e-9 * Math.max(1, Math.hypot(p.re, p.im)))) {
      errs.push(`complex-plane line: every number on the number line is real (a nonzero imaginary part at s = ${s})`)
      break
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/**
 * The overlay's readout lines: one short fact per line (about 20 characters, so the right-aligned column never reaches
 * the passport), results after their inputs. Every number is formatted from the resolved state only.
 */
export function complexReadouts(r: ResolvedComplexPlane): SvgReadout[] {
  const has = (m: ComplexMark) => r.show.includes(m)
  const out: SvgReadout[] = []
  const num = (name: string, n: CNumber) => {
    out.push({ name, text: `${name} = ${fmtC(n)}` })
    if (has('modulus')) out.push({ name: `size-${name}`, text: `|${name}| = ${fix(n.r)}` })
    if (has('arg') && n.r > 1e-12) out.push({ name: `arg-${name}`, text: `arg ${name} = ${degs(n.phi)}` })
  }
  if (r.z) num('z', r.z)
  if (r.z && has('parts')) {
    out.push({ name: 're-z', text: `Re z = ${fix(r.z.re)}` })
    out.push({ name: 'im-z', text: `Im z = ${fix(r.z.im)}` })
  }
  if (r.w) num('w', r.w)
  if (r.sum) {
    out.push({ name: 'sum', text: `z + w = ${fmtC(r.sum)}` })
    if (has('modulus')) out.push({ name: 'size-sum', text: `|z + w| = ${fix(r.sum.r)}` })
  }
  if (r.product) num('zw', r.product)
  if (r.conj) out.push({ name: 'conj', text: `z* = ${fmtC(r.conj)}` })
  if (r.velocity) out.push({ name: 'velocity', text: `iz = ${fmtC(r.velocity)}` })
  if (r.powers) out.push({ name: 'powers', text: `z${sup(r.powers.upTo)} = ${fmtC(r.powers.points[r.powers.upTo])}` })
  if (r.euler) {
    out.push({ name: 'euler', text: `n = ${r.euler.n}` })
    out.push({ name: 'euler-end', text: r.euler.rate === 'imag' ? `end ${fmtC(r.euler.end)}` : `end ${fix(r.euler.end.re, 4)}` })
    if (r.euler.rate === 'imag') out.push({ name: 'euler-size', text: `size ${fix(r.euler.end.r)}` })
  }
  if (r.chain) {
    out.push({ name: 'chain', text: `sum = ${fmtC(r.chain.sum)}` })
    out.push({ name: 'chain-size', text: `size ${fix(r.chain.sum.r)}` })
    out.push({ name: 'chain-size2', text: `size² ${fix(r.chain.sumAbs2)}` })
  }
  return out
}
