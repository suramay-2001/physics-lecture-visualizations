/**
 * The quantum Fourier transform, phase estimation, quantum counting and order finding (P-Q18-story §9.1; Bergou §7.4-7.5 pp. 126-130,
 * N&C §5.1-5.3 pp. 217-230 and §6.3 pp. 261-263). One engine for the numbers, the circuits and the readings the learner sees. Every number
 * has TWO routes that agree in a test (qft.test.ts): a closed form (the Dirichlet kernel of Bergou Eq. 7.38, N&C Eq. 5.4, 5.35) and a
 * full state-vector simulation of the circuit built here from the circuit module. The numpy twin (pipeline/make_qft_fixtures.py) is a third,
 * independent route: explicit 2ⁿ × 2ⁿ matrices and np.fft.
 *
 * Conventions. A register of m wires holds the number a = 2^{m-1}a₁ + … + a_m with q0 (the top wire) the most significant bit (state.ts).
 * U_F|a⟩ = 2^{-m/2} Σ_y e^{2πi a y/2^m} |y⟩ (sign +, the same as fourier.ts `dftMatrix`), the circuit being H and controlled R_k = P(2π/2^k),
 * then SWAPs (N&C Fig. 5.1). The eigenphase is written τ, a FRACTION of a turn: U|u⟩ = e^{2πiτ}|u⟩ = e^{iφ}|u⟩, so φ (an angle, as everywhere
 * in the course) is 2πτ; the books call τ "φ" and write e^{2πiφ}. Phase estimation reads τ ≈ a/2^m; a gate U = P(2πτ) has the eigenstate |1⟩.
 */
import { type C, abs2, c, expi } from '../complex'
import { type Mat, type Vec, apply, identity, matmul, mscale } from '../linalg'
import { type Circuit, type GateOp, type Op, type UnitaryOp, circuitUnitary, runCircuit } from './circuit'
import { binaryFraction, dirichlet, geometricSumDirect, orderFromPeak } from './fourier'
import { H } from './gates'
import { kronMAll } from './cmat'
import { marginal } from './measure'
import { modPow, multOrder } from './numtheory'
import { MAX_QUBITS } from './state'

const TURN = 2 * Math.PI
const DEG = Math.PI / 180

/** The most wires any circuit here may have (the circuit module's cap); the stage draws at most 5. */
export const QFT_MAX_M = MAX_QUBITS
/** The most counting wires the closed forms take (2^16 readings): order finding at 2L + 1 = 11 wires needs more than a circuit may hold. */
export const PE_MAX_M = 16

function checkM(m: number, who: string, max = QFT_MAX_M): void {
  if (!Number.isInteger(m) || m < 1 || m > max) throw new Error(`${who}: m must be a whole number of wires in 1…${max} (got ${m})`)
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
/** 2^j written as a superscript on U or Q: U, U², U⁴, U⁸, U¹⁶ (the circuit stage draws plain Unicode in a gate box). */
const supNumber = (k: number): string => String(k).split('').map((d) => SUP[Number(d)]).join('')
const powerLabel = (base: string, j: number): string => (j === 0 ? base : `${base}${supNumber(2 ** j)}`)

/* ------------------------------------------------------------ the quantum Fourier transform ------------------------------------------------------------ */

const hOn = (q: number): GateOp => ({ op: 'gate', gate: 'H', targets: [q] })

/** Controlled R_k = diag(1, e^{2πi/2^k}) (N&C Eq. 5.11), control `ctrl`, target `target`; R₂ = S and R₃ = T are drawn as S and T gates under the labels R_2 and R_3. */
function controlledRk(k: number, ctrl: number, target: number, inverse: boolean): GateOp {
  const label = `R_${k}${inverse ? '†' : ''}`
  if (k === 2) return { op: 'gate', gate: inverse ? 'Sdg' : 'S', targets: [target], controls: [ctrl], label }
  if (k === 3) return { op: 'gate', gate: inverse ? 'Tdg' : 'T', targets: [target], controls: [ctrl], label }
  return { op: 'gate', gate: 'P', targets: [target], controls: [ctrl], params: [(inverse ? -1 : 1) * (TURN / 2 ** k)], label }
}

/** The input label of a circuit: a whole number a as its m-bit string, or a 0/1 string as given. */
function initLabel(m: number, init: number | string | undefined, who: string): string {
  if (init === undefined) return '0'.repeat(m)
  if (typeof init === 'number') {
    if (!Number.isInteger(init) || init < 0 || init >= 2 ** m) throw new Error(`${who}: the input a must be a whole number below 2^${m} (got ${init})`)
    return init.toString(2).padStart(m, '0')
  }
  if (init.length !== m || !/^[01]+$/.test(init)) throw new Error(`${who}: the input must be ${m} bits`)
  return init
}

/** The columns of U_F on wires 0 … m−1, in the order of N&C Fig. 5.1: for each wire l an H then the controlled R_k from every wire below it, then the SWAPs. */
function qftColumns(m: number): Op[][] {
  const cols: Op[][] = []
  for (let l = 0; l < m; l++) {
    cols.push([hOn(l)])
    for (let j = l + 1; j < m; j++) cols.push([controlledRk(j - l + 1, j, l, false)])
  }
  const swaps: Op[] = []
  for (let i = 0; i < Math.floor(m / 2); i++) swaps.push({ op: 'gate', gate: 'SWAP', targets: [i, m - 1 - i] })
  if (swaps.length) cols.push(swaps)
  return cols
}

/** The same columns reversed and each gate inverted (S → S†, T → T†, P(θ) → P(−θ)): U_F⁻¹ = U_F†. */
function inverseColumns(m: number): Op[][] {
  const out: Op[][] = []
  for (const col of qftColumns(m).slice().reverse())
    out.push(
      col.map((op): Op => {
        if (op.op !== 'gate' || op.gate === 'H' || op.gate === 'SWAP') return op
        const k = Number(/^R_(\d+)/.exec(op.label ?? '')![1])
        return controlledRk(k, op.controls![0], op.targets[0], true)
      }),
    )
  return out
}

/**
 * The quantum Fourier transform on m wires (N&C Fig. 5.1, Box 5.1): for wire l = 0 … m−1 an H, then R₂ from the wire below, R₃ from the next, …, and
 * at the end SWAPs of wire i with wire m−1−i. Its matrix is `dftMatrix(2^m)`. With `inverse` the columns run backwards with each gate inverted (U_F⁻¹).
 * `init` is the input a as a whole number or its bit string (default 0…0).
 */
export function qftCircuit(m: number, opts: { inverse?: boolean; init?: number | string } = {}): Circuit {
  checkM(m, 'qftCircuit')
  return { version: 1, qubits: m, init: initLabel(m, opts.init, 'qftCircuit'), columns: opts.inverse ? inverseColumns(m) : qftColumns(m) }
}

/** How many Hadamards, controlled R_k gates and SWAPs the circuit of U_F on m wires has, counted from the circuit itself. */
export function qftCounts(m: number): { hadamards: number; controlled: number; swaps: number; gates: number } {
  checkM(m, 'qftCounts')
  const ops = qftColumns(m).flat()
  const hadamards = ops.filter((o) => o.op === 'gate' && o.gate === 'H').length
  const swaps = ops.filter((o) => o.op === 'gate' && o.gate === 'SWAP').length
  const controlled = ops.length - hadamards - swaps
  return { hadamards, controlled, swaps, gates: hadamards + controlled }
}

/** The cost of the fast Fourier transform on 2^m numbers, m·2^m steps (N&C p. 220; the comparison of Unit 18.2). */
export const fftCost = (m: number): number => m * 2 ** m

/**
 * The turns of the m output wires of U_F|a⟩ in degrees, top wire first (N&C Eq. 5.4): wire l (counted from the top, l = 1 … m) carries the
 * relative phase e^{2πi·0.a_{m−l+1}…a_m}, the binary fraction of the LAST l digits of a. For a = 101 (5): 0.1, 0.01, 0.101 of a turn = 180°, 90°, 225°.
 */
export function qftProductAngles(a: number, m: number): number[] {
  checkM(m, 'qftProductAngles')
  const bits = initLabel(m, a, 'qftProductAngles')
  return Array.from({ length: m }, (_, i) => binaryFraction(bits.slice(m - (i + 1))) * 360)
}

/** U_F|a⟩ from the product form (N&C Eq. 5.4): ⊗_l (|0⟩ + e^{2πi·0.a_{m−l+1}…a_m}|1⟩)/√2, top wire first. */
export function qftFromProduct(a: number, m: number): Vec {
  const angles = qftProductAngles(a, m)
  let v: Vec = [c(1)]
  for (const deg of angles) {
    const w: Vec = [c(Math.SQRT1_2), c(Math.SQRT1_2 * Math.cos(deg * DEG), Math.SQRT1_2 * Math.sin(deg * DEG))]
    v = v.flatMap((x) => w.map((y) => c(x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re)))
  }
  return v
}

/** The squared length of the state as Bergou prints it on p. 127 (Eq. 7.34's prefactor 1/2^m instead of 2^{-m/2}): 2^m terms of size 2^{-m}, so 2^{-m}. Built term by term for a = 5 (or any a). */
export function qftPrintedNorm2(m: number, a = 1): number {
  checkM(m, 'qftPrintedNorm2')
  const M = 2 ** m
  let s = 0
  for (let y = 0; y < M; y++) s += abs2({ re: Math.cos((TURN * a * y) / M) / M, im: Math.sin((TURN * a * y) / M) / M })
  return s
}

/**
 * The value p. 127 prints for a = 2^{m−1}a₁ + 2^{m−1}a₂ + … + a_m, with the weight 2^{m−1} on the SECOND digit as well (the slip): the first two digits
 * both weigh 2^{m−1}, digit j ≥ 3 weighs 2^{m−j}. The right weight of digit j is 2^{m−j}. `bits` is the string a₁…a_m.
 */
export function expandPrinted(bits: string): number {
  if (!/^[01]{2,}$/.test(bits)) throw new Error('expandPrinted: two or more bits')
  const m = bits.length
  return [...bits].reduce((s, d, i) => s + Number(d) * (i === 1 ? 2 ** (m - 1) : 2 ** (m - 1 - i)), 0)
}
/** The right expansion a = Σ a_j 2^{m−j}. */
export const expandTrue = (bits: string): number => parseInt(bits, 2)

/* ------------------------------------------------------------ phase estimation ------------------------------------------------------------ */

const wiresPE = (m: number): string[] => [...Array.from({ length: m }, (_, q) => `q${q}`), 'u']

/**
 * Phase estimation of the gate U = P(2πτ) on its eigenstate |1⟩ (`target` '1'), or on |0⟩ (eigenphase 0) or |+⟩ (a mix of both), with m counting wires
 * (Bergou Fig. 7.6, p. 127; N&C Fig. 5.2): wires 0 … m−1 and the target wire m, init 0…0 then the target. Columns: H on every counting wire; U controlled by
 * wire m−1, U² by wire m−2, …, U^{2^{m−1}} by wire 0 (P gates with the angle 2π·2^j·τ); then U_F⁻¹ on the counting wires. 1 + m + (the QFT's columns) columns.
 * After column m + 1 the counting wires hold 2^{-m/2} Σ_y e^{2πiτy}|y⟩ (Bergou Eq. 7.37); the reading of the first m wires is `peDistribution`.
 */
export function phaseEstimationCircuit(tau: number, m: number, target: '0' | '1' | '+' = '1'): Circuit {
  checkM(m, 'phaseEstimationCircuit', QFT_MAX_M - 1)
  if (!Number.isFinite(tau)) throw new Error('phaseEstimationCircuit: tau must be a number')
  const columns: Op[][] = [Array.from({ length: m }, (_, q) => hOn(q))]
  for (let j = 0; j < m; j++)
    columns.push([{ op: 'gate', gate: 'P', targets: [m], controls: [m - 1 - j], params: [TURN * tau * 2 ** j], label: powerLabel('U', j) }])
  columns.push(...inverseColumns(m))
  return { version: 1, qubits: m + 1, init: `${'0'.repeat(m)}${target}`, wires: wiresPE(m), columns }
}

/** The cursor right after the controlled powers, where the counting wires hold Eq. 7.37's state: 1 + m. */
export const peKickColumn = (m: number): number => 1 + m

/** The amplitude of reading x on m wires: 2^{-m} Σ_y e^{2πi(τ − x/2^m)y}, summed term by term (Bergou Eq. 7.38). */
export function peAmplitude(tau: number, m: number, x: number): C {
  checkM(m, 'peAmplitude', PE_MAX_M)
  const M = 2 ** m
  const s = geometricSumDirect(expi(TURN * (tau - x / M)), M)
  return c(s.re / M, s.im / M)
}

/** P(x) for every reading x = 0 … 2^m − 1, from the sum itself (route A of the closed form). */
export const peDistributionDirect = (tau: number, m: number): number[] => Array.from({ length: 2 ** m }, (_, x) => abs2(peAmplitude(tau, m, x)))

/** P(x) = D_{2^m}(τ − x/2^m)², with D the Dirichlet kernel |sin πMδ|/(M|sin πδ|) (Bergou Eqs. 7.38-7.41; N&C Eq. 5.2x): the closed form. */
export function peDistribution(tau: number, m: number): number[] {
  checkM(m, 'peDistribution', PE_MAX_M)
  const M = 2 ** m
  return Array.from({ length: M }, (_, x) => dirichlet(M, tau - x / M) ** 2)
}

/** The nearest m-bit integer a to 2^m τ (mod 2^m) and the leftover δ = τ − a/2^m, |δ| ≤ 2^{-(m+1)} (Bergou p. 128). */
export function peNearest(tau: number, m: number): { a: number; delta: number } {
  checkM(m, 'peNearest', PE_MAX_M)
  const M = 2 ** m
  const r = Math.round(tau * M)
  return { a: ((r % M) + M) % M, delta: tau - r / M }
}

/** The chance of the best reading: max_x P(x). */
export const peBest = (tau: number, m: number): number => Math.max(...peDistribution(tau, m))

/** The worst case of the best reading: τ midway between two m-bit fractions (δ = 2^{-(m+1)}), D_{2^m}(2^{-(m+1)})²; it falls to 4/π² as m grows (Bergou Eq. 7.43). */
export const peWorstBest = (m: number): number => dirichlet(2 ** m, 2 ** -(m + 1)) ** 2

/** The chance that the reading x is within `w` of τ, as a fraction of a turn: |x/2^m − τ| ≤ w around the circle. */
export function peWithin(tau: number, m: number, w: number): number {
  checkM(m, 'peWithin', PE_MAX_M)
  const M = 2 ** m
  const P = peDistribution(tau, m)
  let s = 0
  for (let x = 0; x < M; x++) {
    const d = Math.abs(x / M - tau) % 1
    if (Math.min(d, 1 - d) <= w + 1e-9) s += P[x]
  }
  return s
}

/**
 * The worst case, over all τ, of the chance that the reading is off by more than k steps of 1/2^m: max_τ P(circular |x − 2^m τ| > k). It depends on the leftover
 * u = frac(2^m τ) only; u is scanned on a grid of 1/512 that includes ½, where the maximum sits (for k = 1, 2, 3 at m = 8: 0.189, 0.099, 0.067).
 */
export function peTailWorst(m: number, k: number): number {
  checkM(m, 'peTailWorst', PE_MAX_M)
  if (!Number.isInteger(k) || k < 0) throw new Error('peTailWorst: k must be a whole number of steps')
  const M = 2 ** m
  let worst = 0
  for (let i = 0; i < 512; i++) {
    const u = i / 512
    const P = peDistribution(u / M, m)
    let far = 0
    for (let x = 0; x < M; x++) {
      const d = Math.abs(x - u)
      if (Math.min(d, M - d) > k + 1e-12) far += P[x]
    }
    worst = Math.max(worst, far)
  }
  return worst
}

/** N&C Eq. 5.35 (p. 224): the number of wires t = n + ⌈log₂(2 + 1/(2ε))⌉ that reads n bits of τ with failure chance at most ε. */
export function ncWires(n: number, eps: number): number {
  if (!Number.isInteger(n) || n < 1) throw new Error('ncWires: n must be a whole number of bits')
  if (!(eps > 0 && eps < 1)) throw new Error('ncWires: ε must be between 0 and 1')
  return n + Math.ceil(Math.log2(2 + 1 / (2 * eps)))
}

/** The reading's distribution on the first m wires of a circuit's final state (the marginal of wires 0 … m−1). */
export function readingOfCircuit(circuit: Circuit, m: number, outcomes?: string): number[] {
  const run = runCircuit(circuit, outcomes !== undefined ? { outcomes } : {})
  return marginal(run.states[run.states.length - 1], Array.from({ length: m }, (_, q) => q))
}

/* ------------------------------------------------------------ quantum counting ------------------------------------------------------------ */

/** The Grover step Q = −U_H U₀ U_H U_f on n wires for ANY set of marked strings (indices; empty for no marked string, where U_f = I), as an explicit matrix. */
export function groverQMatrix(n: number, marked: readonly number[]): Mat {
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('groverQMatrix: n is a whole number of wires in 1…4')
  const N = 2 ** n
  if (marked.some((x) => !Number.isInteger(x) || x < 0 || x >= N) || new Set(marked).size !== marked.length) throw new Error(`groverQMatrix: marked lists different strings below ${N}`)
  const diag = (f: (x: number) => number): Mat => Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => c(i === j ? f(i) : 0)))
  const UH = kronMAll(Array.from({ length: n }, () => H))
  const U0 = diag((x) => (x === 0 ? -1 : 1))
  const Uf = diag((x) => (marked.includes(x) ? -1 : 1))
  return mscale(matmul(UH, matmul(U0, matmul(UH, Uf))), -1)
}

const matPow = (M: Mat, p: number): Mat => {
  let out = identity(M.length)
  for (let i = 0; i < p; i++) out = matmul(M, out)
  return out
}
const matToPairs = (M: Mat): [number, number][][] => M.map((row) => row.map((z): [number, number] => [z.re, z.im]))

/**
 * Quantum counting on n search wires and m counting wires (Bergou §7.5 p. 129-130, N&C §6.3 pp. 261-263): wires 0 … m−1 count, wires m … m+n−1 search;
 * init all 0; H on every wire (the search wires then hold |w₀⟩); controlled-Q^{2^j} (an explicit unitary on the search wires) from counting wire m−1−j
 * for j = 0 … m−1; then U_F⁻¹ on the counting wires. `marked` lists the marked strings (empty allowed). The reading is the first m wires.
 */
export function countingCircuit(n: number, marked: readonly number[], m: number): Circuit {
  checkM(m, 'countingCircuit', QFT_MAX_M - n)
  const Q = groverQMatrix(n, marked)
  const total = m + n
  const columns: Op[][] = [Array.from({ length: total }, (_, q) => hOn(q))]
  for (let j = 0; j < m; j++) {
    const op: UnitaryOp = { op: 'unitary', matrix: matToPairs(matPow(Q, 2 ** j)), targets: Array.from({ length: n }, (_, i) => m + i), controls: [m - 1 - j], label: powerLabel('Q', j) }
    columns.push([op])
  }
  columns.push(...inverseColumns(m))
  const wires = [...Array.from({ length: m }, (_, q) => `q${q}`), ...Array.from({ length: n }, (_, i) => `s${i}`)]
  return { version: 1, qubits: total, init: '0'.repeat(total), wires, columns }
}

/** The chance of each counting reading, by the closed form: ½ pe(α/π) + ½ pe(1 − α/π) with sin²α = M/N (Bergou p. 130 corrected: α/π, not α/2π). */
export function countingDistribution(N: number, M: number, m: number): number[] {
  checkM(m, 'countingDistribution', PE_MAX_M)
  if (!Number.isInteger(N) || N < 2 || !Number.isInteger(M) || M < 0 || M >= N) throw new Error('countingDistribution: 0 ≤ M < N')
  const alpha = Math.asin(Math.sqrt(M / N))
  const up = peDistribution(alpha / Math.PI, m)
  const down = peDistribution(1 - alpha / Math.PI, m)
  return up.map((p, a) => (p + down[a]) / 2)
}

/** M = N sin²(π a / 2^m): the number of marked strings a reading a of m counting wires points to (N&C p. 262, with α = πa/2^m). */
export const countEstimate = (a: number, m: number, N: number): number => N * Math.sin((Math.PI * a) / 2 ** m) ** 2

/**
 * What the p. 130 formula predicts, and what the circuit does: Bergou prints a₊/2^m ≈ α/2π and a₋/2^m ≈ (2π − α)/2π. `aPlus` and `aMinus` are the readings
 * that prints (rounded), `chance` is the SIMULATED chance (route A, the circuit) of reading either: 0 at N = 4, M = 2, where the true readings are 010 and 110.
 */
export function countingPrintedReading(n: number, marked: readonly number[], m: number): { aPlus: number; aMinus: number; chance: number } {
  const N = 2 ** n
  const alpha = Math.asin(Math.sqrt(marked.length / N))
  const M = 2 ** m
  const aPlus = Math.round((M * alpha) / TURN)
  const aMinus = Math.round((M * (TURN - alpha)) / TURN) % M
  const P = readingOfCircuit(countingCircuit(n, marked, m), m)
  return { aPlus, aMinus, chance: aPlus === aMinus ? P[aPlus] : P[aPlus] + P[aMinus] }
}

/* ------------------------------------------------------------ order finding ------------------------------------------------------------ */

/** The orbit 1, x, x², … mod N up to the return to 1 (r numbers, r the order of x). */
export function orderOrbit(x: number, N: number): number[] {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`orderOrbit: ${x} has no order mod ${N}`)
  return Array.from({ length: r }, (_, k) => modPow(x, k, N))
}

/** The eigenphases s/r (s = 0 … r−1) of U_x|y⟩ = |xy mod N⟩ as fractions of a turn (N&C Eq. 5.39). */
export function orderEigenphases(x: number, N: number): number[] {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`orderEigenphases: ${x} has no order mod ${N}`)
  return Array.from({ length: r }, (_, s) => s / r)
}

/** The state |u_s⟩ = r^{-1/2} Σ_k e^{-2πisk/r} |x^k mod N⟩ on the N places (N&C Eq. 5.37). */
function orderEigenstate(x: number, N: number, s: number): Vec {
  const orbit = orderOrbit(x, N)
  const r = orbit.length
  const v: Vec = Array.from({ length: N }, () => c(0))
  orbit.forEach((y, k) => {
    v[y] = c(Math.cos((-TURN * s * k) / r) / Math.sqrt(r), Math.sin((-TURN * s * k) / r) / Math.sqrt(r))
  })
  return v
}

/** U_x applied to a vector on the N places: the amplitude of |y⟩ moves to |xy mod N⟩ (N&C Eq. 5.36). */
function applyUx(x: number, N: number, v: Vec): Vec {
  const out: Vec = Array.from({ length: N }, () => c(0))
  v.forEach((z, y) => {
    const t = Number((BigInt(x) * BigInt(y)) % BigInt(N))
    out[t] = c(out[t].re + z.re, out[t].im + z.im)
  })
  return out
}

/** The largest ‖U_x|u_s⟩ − e^{2πis/r}|u_s⟩‖ over s = 0 … r−1: zero when every |u_s⟩ is an eigenstate with eigenphase s/r. */
export function orderEigenResidual(x: number, N: number): number {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`orderEigenResidual: ${x} has no order mod ${N}`)
  let worst = 0
  for (let s = 0; s < r; s++) {
    const u = orderEigenstate(x, N, s)
    const Uu = applyUx(x, N, u)
    const e = expi((TURN * s) / r)
    let d = 0
    u.forEach((z, y) => {
      d += (Uu[y].re - (e.re * z.re - e.im * z.im)) ** 2 + (Uu[y].im - (e.re * z.im + e.im * z.re)) ** 2
    })
    worst = Math.max(worst, Math.sqrt(d))
  }
  return worst
}

/** ‖r^{-1/2} Σ_s |u_s⟩ − |1⟩‖: zero (N&C Eq. 5.44): the plain number 1 is an even mix of all r eigenstates. */
export function oneIsSumResidual(x: number, N: number): number {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`oneIsSumResidual: ${x} has no order mod ${N}`)
  const total: Vec = Array.from({ length: N }, () => c(0))
  for (let s = 0; s < r; s++) orderEigenstate(x, N, s).forEach((z, y) => (total[y] = c(total[y].re + z.re / Math.sqrt(r), total[y].im + z.im / Math.sqrt(r))))
  return Math.sqrt(total.reduce((acc, z, y) => acc + (z.re - (y === 1 % N ? 1 : 0)) ** 2 + z.im ** 2, 0))
}

/** How many different values the eigenphases of U_x^p take: the distinct p·s/r mod 1 (U_x^p = U_{x^p mod N} has order r/gcd(p, r)). */
export function distinctPowerPhases(x: number, N: number, p: number): number {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`distinctPowerPhases: ${x} has no order mod ${N}`)
  return new Set(Array.from({ length: r }, (_, s) => (p * s) % r)).size
}

/** The reading's chance when phase estimation on t wires starts the gate U_x in |1⟩: the mean over s of the distribution for the eigenphase s/r (N&C p. 227-229). */
export function orderFindingDistribution(x: number, N: number, t: number): number[] {
  const phases = orderEigenphases(x, N)
  const out = new Array<number>(2 ** t).fill(0)
  for (const tau of phases) peDistribution(tau, t).forEach((p, y) => (out[y] += p / phases.length))
  return out
}

/** The `count` tallest readings, in increasing order (ties to the lower reading). */
export function tallestReadings(P: readonly number[], count: number): number[] {
  return P.map((p, y) => [p, y] as const)
    .sort((a, b) => Math.round(b[0] * 1e9) - Math.round(a[0] * 1e9) || a[1] - b[1])
    .slice(0, count)
    .map(([, y]) => y)
    .sort((a, b) => a - b)
}

/** The chance that a run reads a y whose continued-fraction test returns the true order r (`orderFromPeak`): the per-run success of Shor's quantum step. */
export function orderSuccess(x: number, N: number, t: number): number {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`orderSuccess: ${x} has no order mod ${N}`)
  const P = orderFindingDistribution(x, N, t)
  return P.reduce((s, p, y) => (orderFromPeak(y, t, x, N) === r ? s + p : s), 0)
}

/** The readings y of t wires whose continued fraction returns the order (the "good" readings). */
export function orderGoodReadings(x: number, N: number, t: number): number[] {
  const r = multOrder(x, N)
  if (r === null) throw new Error(`orderGoodReadings: ${x} has no order mod ${N}`)
  return Array.from({ length: 2 ** t }, (_, y) => y).filter((y) => orderFromPeak(y, t, x, N) === r)
}

/** The matrix of U_F for a check against the circuit (a thin wrapper so a caller needs no second import). */
export const qftCircuitMatrix = (m: number): Mat => circuitUnitary(qftCircuit(m))

/** Applies a circuit's matrix to a vector (used by tests to compare the inverse circuit with the matrix route). */
export const applyCircuitMatrix = (circuit: Circuit, v: Vec): Vec => apply(circuitUnitary(circuit), v)
