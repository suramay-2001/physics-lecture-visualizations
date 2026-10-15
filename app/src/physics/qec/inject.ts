/**
 * Magic-state injection (background chapter B4, unit b4-injection; Litinski 2019, arXiv:1905.06903 Fig. 1 and arXiv:1808.02892 Fig. 7). Pure TypeScript on dense vectors (at most 4 qubits).
 *
 * `teleportT`: data a|0⟩ + b|1⟩ and the magic state |m⟩ = T|+⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2. A CNOT from the data onto the magic qubit followed by a Z readout of the magic qubit leaves
 *   outcome 0: a|0⟩ + b e^{iπ/4}|1⟩ = T|ψ⟩,   outcome 1: a e^{iπ/4}|0⟩ + b|1⟩ ∝ T†|ψ⟩,   each with chance 1/2; the S gate turns T† into T since S·T† = T.
 * `injectGeneral`: for a rotation about ANY Pauli P: measure P⊗Z_m (outcome s), then X_m (outcome t); the data are left with P^{[t = −1]} · P(−sπ/4)|ψ⟩, P(φ) = exp(iφP/2); all four (s, t) have chance 1/4.
 * `axes`: the Clifford fix after an odd s is P(π/2) about the axis just executed; a pending Clifford F makes the next planned axis B run about F·B·F†. (The Pauli fixes of t only flip signs of later
 * turns and are left out.) All of it is checked by independent dense routes in pipeline/b4_numpy.py.
 */
import { D1, dApply, dCnot, dEmbed1, dPauli, vInner, vKron, vNorm2, vProject, vScale, type DVec } from './dense'
import { Pauli } from './pauli'
import { rotateConj, signedLetters } from './pbc'
import { rng } from '../random'

const OMEGA: [number, number] = [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)]
/** |m⟩ = T|+⟩. */
export const MAGIC: DVec = { re: Float64Array.from([Math.SQRT1_2, Math.SQRT1_2 * OMEGA[0]]), im: Float64Array.from([0, Math.SQRT1_2 * OMEGA[1]]) }
const sgn = (bit: number): 1 | -1 => (bit === 0 ? 1 : -1)

export interface TeleportBranch {
  /** Chance of this reading. */
  prob: number
  /** The data after the reading (before any fix): [re0, im0, re1, im1]. */
  data: number[]
  /** The data after the fix (S for reading 1, nothing for reading 0). */
  fixed: number[]
  /** |⟨T ψ | fixed⟩|². */
  fidelity: number
}

const cnormalize = (v: DVec): DVec => vScale(v, 1 / Math.sqrt(vNorm2(v)))
const dataOf = (re: number, im: number, re1: number, im1: number): DVec => cnormalize({ re: Float64Array.from([re, re1]), im: Float64Array.from([im, im1]) })

/** One data qubit [a_re, a_im, b_re, b_im] teleported through the magic qubit: both readings. */
export function teleportT(psi: readonly [number, number, number, number]): [TeleportBranch, TeleportBranch] {
  const d = dataOf(psi[0], psi[1], psi[2], psi[3])
  const v = dApply(dCnot(0, 1, 2), vKron(d, MAGIC))
  const target = dApply(D1.T, d)
  const Zm = dEmbed1(D1.Z, 1, 2)
  const make = (o: 0 | 1): TeleportBranch => {
    const w = vProject(Zm, v, sgn(o))
    const prob = vNorm2(w)
    const data = cnormalize({ re: Float64Array.from([w.re[o], w.re[2 + o]]), im: Float64Array.from([w.im[o], w.im[2 + o]]) })
    const fixedV = o === 1 ? dApply(D1.S, data) : data
    const [ir, ii] = vInner(target, fixedV)
    return { prob, data: [data.re[0], data.im[0], data.re[1], data.im[1]], fixed: [fixedV.re[0], fixedV.im[0], fixedV.re[1], fixedV.im[1]], fidelity: ir * ir + ii * ii }
  }
  return [make(0), make(1)]
}

/** Seeded random data states: the smallest fidelity with T|ψ⟩ over both fixed branches, and how far the readings' chances stray from 1/2. */
export function teleportSweep(trials = 200, seed = 11): { trials: number; fidelityMin: number; probSpread: number } {
  const rand = rng(seed)
  const g = (): number => {
    const u = Math.max(rand(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
  }
  let fmin = 1
  let pmin = 1
  let pmax = 0
  for (let i = 0; i < trials; i++) {
    const br = teleportT([g(), g(), g(), g()])
    for (const b of br) {
      fmin = Math.min(fmin, b.fidelity)
      pmin = Math.min(pmin, b.prob)
      pmax = Math.max(pmax, b.prob)
    }
  }
  return { trials, fidelityMin: fmin, probSpread: pmax - pmin }
}

/** The chances of the four (s, t) = 00, 01, 10, 11 and how far the post-state is from P^{[t]} P(−sπ/4)|ψ⟩ (largest 1 − fidelity), for a random data state on P's wires. */
export function injectGeneral(pauli: string, seed = 5): { probs: number[]; dev: number } {
  const n = pauli.length
  if (n < 1 || n > 3) throw new Error('inject.injectGeneral: 1 to 3 data wires')
  const rand = rng(seed + 31 * n)
  const g = (): number => {
    const u = Math.max(rand(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
  }
  const dim = 2 ** n
  const psi = cnormalize({ re: Float64Array.from({ length: dim }, g), im: Float64Array.from({ length: dim }, g) })
  const v = vKron(psi, MAGIC)
  const Pm = dPauli(pauli)
  const PZ = dPauli(pauli + 'Z')
  const Xm = dEmbed1(D1.X, n, n + 1)
  const probs: number[] = []
  let dev = 0
  for (const s of [0, 1] as const)
    for (const t of [0, 1] as const) {
      const w = vProject(Xm, vProject(PZ, v, sgn(s)), sgn(t))
      probs.push(vNorm2(w))
      // contract the magic qubit with the X eigenstate ⟨±|
      const k = sgn(t)
      const data = cnormalize({
        re: Float64Array.from({ length: dim }, (_, i) => w.re[2 * i] + k * w.re[2 * i + 1]),
        im: Float64Array.from({ length: dim }, (_, i) => w.im[2 * i] + k * w.im[2 * i + 1]),
      })
      // P(−sπ/4) = cos(π/8) I − i·(±1)·sin(π/8) P
      const Pp = dApply(Pm, psi)
      const c = Math.cos(Math.PI / 8)
      const sn = Math.sin(Math.PI / 8) * sgn(s)
      let expect: DVec = { re: psi.re.map((x, i) => c * x + sn * Pp.im[i]), im: psi.im.map((x, i) => c * x - sn * Pp.re[i]) }
      if (t === 1) expect = dApply(Pm, expect)
      expect = cnormalize(expect)
      const [ir, ii] = vInner(expect, data)
      dev = Math.max(dev, 1 - (ir * ir + ii * ii))
    }
  return { probs, dev }
}
/** The same over several Paulis: the smallest and largest chance and the worst deviation. */
export function injectSweep(paulis: readonly string[]): { paulis: number; probMin: number; probMax: number; dev: number } {
  let probMin = 1
  let probMax = 0
  let dev = 0
  for (const p of paulis) {
    const r = injectGeneral(p)
    probMin = Math.min(probMin, ...r.probs)
    probMax = Math.max(probMax, ...r.probs)
    dev = Math.max(dev, r.dev)
  }
  return { paulis: paulis.length, probMin, probMax, dev }
}

/* ---------------------------------------------------------------- the axis of the next injection depends on earlier readings */
export interface Executed {
  letter: 'X' | 'Y' | 'Z'
  sign: 1 | -1
  /** Printed form, e.g. "Z" or "−Y". */
  text: string
}
export const executedText = (e: { letter: string; sign: number }): string => `${e.sign < 0 ? '−' : ''}${e.letter}`

/**
 * Planned axes (letters X, Y, Z) and the s-readings of the injections (0 = even, 1 = odd). After an odd reading the Clifford fix is a quarter turn P(π/2) about the axis just run (sign included).
 * The next planned axis B runs about F·B·F† for the pending Clifford F (the product of the fixes so far).
 */
export function axes(planned: readonly string[], bits: readonly number[]): { executed: Executed[]; pending: Executed[] } {
  const executed: Executed[] = []
  const fixes: { axis: Pauli; angle: 'c+' | 'c-' }[] = []
  planned.forEach((b, i) => {
    let q = Pauli.parse(b)
    for (const f of fixes) q = rotateConj(q, f.axis, f.angle, 'forward')
    const sl = signedLetters(q)
    const e: Executed = { letter: sl.pauli as 'X' | 'Y' | 'Z', sign: sl.sign, text: executedText({ letter: sl.pauli, sign: sl.sign }) }
    executed.push(e)
    if (bits[i] === 1) fixes.push({ axis: Pauli.parse(sl.pauli), angle: sl.sign > 0 ? 'c+' : 'c-' })
  })
  return { executed, pending: fixes.map((f) => ({ letter: f.axis.letters().join('') as 'X' | 'Y' | 'Z', sign: f.angle === 'c+' ? 1 : -1, text: executedText({ letter: f.axis.letters().join(''), sign: f.angle === 'c+' ? 1 : -1 }) })) }
}
/** All 2^n reading histories of the planned axes: how many, and how many different executed sequences they give. */
export function axesCensus(planned: readonly string[]): { histories: number; distinct: number } {
  const seen = new Set<string>()
  const total = 2 ** planned.length
  for (let h = 0; h < total; h++) {
    const bits = planned.map((_, i) => (h >> (planned.length - 1 - i)) & 1)
    seen.add(
      axes(planned, bits)
        .executed.map((e) => e.text)
        .join(' '),
    )
  }
  return { histories: total, distinct: seen.size }
}
