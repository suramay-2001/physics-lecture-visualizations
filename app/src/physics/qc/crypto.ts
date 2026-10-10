/**
 * Quantum cryptography (P-Q15-story §9.1; Bergou Ch. 6, printed pp. 105-114; N&C §12.6, pp. 582-591): the numbers behind the
 * one-time pad, the B92 key scheme with its two eavesdroppers, the entangling probe, the entangled-code secret sharing and Bergou's
 * Eq. 6.6. Every function here is exact: no sampling, only sums over every outcome of every measurement. The numpy twins
 * (pipeline/make_crypto_fixtures.py → __fixtures__/qc-crypto.json) take another route: explicit dense matrices, Kraus sums and an
 * SVD trace norm, never this module's circuits or `povm.ts`'s helpers.
 *
 * Conventions. Bit 0 ↔ |ψ₀⟩ = |0⟩ and bit 1 ↔ |ψ₁⟩ = |+⟩ (B92); a click of Bob's element E_i means "bit i" (`usdPovm`'s order); q0 is
 * the top wire and the most significant bit (state.ts); a bit read in the x basis is 0 for |+x⟩ and 1 for |−x⟩. Q (the key error rate) is the
 * fraction of kept (conclusive) rounds on which Alice's bit and Bob's differ.
 */
import { abs, abs2, c } from '../complex'
import { type Mat, type Vec, dagger, identity, inner, madd, matmul, norm, outer } from '../linalg'
import { runCircuit, type Circuit } from './circuit'
import { kronM } from './cmat'
import { densityOf, reducedBloch, reducedDensity } from './density'
import { Z as GATE_Z } from './gates'
import { measureInBasis, localBasisProbs } from './measure'
import { bornPovm, helstrom, helstromPovm, usd, usdPovm } from './povm'
import { bell, coefMatrix, ket } from './state'

/* ------------------------------------------------------------ the one-time pad ------------------------------------------------------------ */

/** The Caesar shift of letters (Bergou p. 106): a, b, … move `shift` places down the alphabet, wrapping; case and other characters are kept. A negative shift decrypts. */
export function caesar(text: string, shift: number): string {
  if (!Number.isInteger(shift)) throw new Error(`caesar: the shift must be a whole number (got ${shift})`)
  const k = ((shift % 26) + 26) % 26
  const move = (ch: string, base: number) => String.fromCharCode(base + ((ch.charCodeAt(0) - base + k) % 26))
  return text.replace(/[a-z]/g, (ch) => move(ch, 97)).replace(/[A-Z]/g, (ch) => move(ch, 65))
}

/** The bitwise sum modulo 2 of two bit strings of the same length: the one-time pad's c = m ⊕ k (and its undoing, c ⊕ k = m). */
export function xorBits(a: string, b: string): string {
  if (a.length !== b.length || !/^[01]*$/.test(a) || !/^[01]*$/.test(b)) throw new Error('xorBits: two bit strings of the same length')
  return [...a].map((x, i) => (x === b[i] ? '0' : '1')).join('')
}

/* ------------------------------------------------------------ B92 ------------------------------------------------------------ */

/** B92's two states: bit 0 is |0⟩, bit 1 is |+⟩ (Bergou p. 107). */
export const B92_STATES: readonly [Vec, Vec] = [ket('0'), ket('+')]
/** Their overlap |⟨0|+⟩|: the number every B92 rate below is built from. */
export const b92Overlap = (): number => abs(inner(B92_STATES[0], B92_STATES[1]))

export type B92Eve = 'none' | 'usd' | 'minerr'
export interface B92Rates {
  /** the share of rounds Bob answers (conclusive), whatever Eve did */
  kept: number
  /** the share he does not */
  inconclusive: number
  /** Q: among kept rounds, the chance Bob's bit differs from Alice's */
  qber: number
  /** among kept rounds, the chance Eve's best belief about the bit equals Alice's (½ with no Eve: nothing to know) */
  eveRight: number
  /** the chance Eve's own never-wrong reading is inconclusive (0 unless she uses it) */
  eveFail: number
}

/**
 * B92 with Bob using the never-wrong reading (Bergou p. 107) against three Eves, by exact branch sums over Alice's bit, Eve's POVM outcome
 * and Bob's POVM outcome. 'none': Bob receives what Alice sent. 'usd': Eve reads with the same never-wrong POVM; on a click she resends that state,
 * on the inconclusive outcome she resends one of the two at random and believes it. 'minerr': Eve reads with the Helstrom POVM (always answers),
 * resends the state she names and believes it. Bob's kept share is 1 − |⟨ψ₀|ψ₁⟩| in every case (it does not depend on which state he gets).
 */
export function b92Rates(eve: B92Eve): B92Rates {
  const [p0, p1] = B92_STATES
  const rho = [densityOf(p0), densityOf(p1)]
  const bob = usdPovm(p0, p1)
  const eveUsd = usdPovm(p0, p1)
  const eveMin = helstromPovm(rho[0], rho[1], 0.5)
  let kept = 0
  let wrong = 0
  let right = 0
  let fail = 0
  for (const a of [0, 1] as const) {
    // each branch: its chance given Alice's bit, the state index Eve sends on, and her belief about the bit (-1: she has none)
    const branches: { p: number; resend: 0 | 1; belief: -1 | 0 | 1 }[] = []
    if (eve === 'none') branches.push({ p: 1, resend: a, belief: -1 })
    else if (eve === 'usd') {
      const q = bornPovm(eveUsd, rho[a])
      branches.push({ p: q[0], resend: 0, belief: 0 }, { p: q[1], resend: 1, belief: 1 }, { p: q[2] / 2, resend: 0, belief: 0 }, { p: q[2] / 2, resend: 1, belief: 1 })
      fail += q[2] / 2
    } else {
      const q = bornPovm(eveMin, rho[a])
      branches.push({ p: q[0], resend: 0, belief: 0 }, { p: q[1], resend: 1, belief: 1 })
    }
    for (const br of branches) {
      const got = bornPovm(bob, rho[br.resend]) // Bob: click 0, click 1, inconclusive
      const conclusive = got[0] + got[1]
      kept += 0.5 * br.p * conclusive
      wrong += 0.5 * br.p * got[1 - a]
      right += 0.5 * br.p * conclusive * (br.belief === -1 ? 0.5 : br.belief === a ? 1 : 0)
    }
  }
  return { kept, inconclusive: 1 - kept, qber: wrong / kept, eveRight: right / kept, eveFail: fail }
}

/** The B92 encoder as a circuit: Alice's bit a on wire 1 controls an H on the qubit sent (wire 2), so the qubit is |0⟩ for a = 0 and |+⟩ for a = 1. */
export function b92Circuit(a: 0 | 1): Circuit {
  return {
    version: 1,
    qubits: 2,
    init: `${a}0`,
    wires: ['Alice’s bit', 'qubit sent'],
    columns: [[{ op: 'gate', gate: 'H', targets: [1], controls: [0] }]],
  }
}

/* ------------------------------------------------------------ the entangling probe (Bergou pp. 109-110) ------------------------------------------------------------ */

/**
 * Eve's probe: a rotation Ry(φ) of her ancilla, controlled by Alice's qubit (wire 1), so |0⟩|0⟩ stays and |1⟩|0⟩ becomes |1⟩ (cos φ/2 |0⟩ + sin φ/2 |1⟩).
 * `init` is the input of the two wires: '00' or '10' (a z-basis bit), '+0' or '-0' (an x-basis bit).
 */
export function probeCircuit(phi: number, init: string): Circuit {
  return {
    version: 1,
    qubits: 2,
    init,
    wires: ['Alice’s qubit', 'Eve’s probe'],
    columns: [[{ op: 'gate', gate: 'Ry', targets: [1], controls: [0], params: [phi] }]],
  }
}
const lastOf = (C: Circuit): Vec => {
  const s = runCircuit(C).states
  return s[s.length - 1]
}

export interface ProbeResult {
  /** Bob's chance of misreading a z-basis bit (0: the probe never flips a z value) */
  zError: number
  /** Bob's chance of misreading an x-basis bit */
  xError: number
  /** the key error rate when the two bases are used equally: ½ (zError + xError) */
  qber: number
  /** Eve's best chance of naming a z-basis bit from her ancilla (the Helstrom bound on her two possible ancilla states) */
  eveGuess: number
  /** the length of Alice's qubit's Bloch arrow after the probe, for an x-basis input */
  rA: number
  /** the length of Eve's probe's Bloch arrow, for the same input */
  rE: number
}

/** The probe at angle φ (radians), read through the circuit, the reduced Bloch vectors and the Helstrom bound: x-error ½(1 − cos φ/2), Eve's guess ½(1 + sin φ/2), arrow cos φ/2. */
export function probeAttack(phi: number): ProbeResult {
  const z0 = lastOf(probeCircuit(phi, '00'))
  const z1 = lastOf(probeCircuit(phi, '10'))
  const xp = lastOf(probeCircuit(phi, '+0'))
  const xm = lastOf(probeCircuit(phi, '-0'))
  // Bob reads z: Alice's qubit read as 1 when 0 was sent, or as 0 when 1 was sent
  const zError = 0.5 * ((1 - reducedBloch(z0, 0)[2]) / 2) + 0.5 * ((1 + reducedBloch(z1, 0)[2]) / 2)
  // Bob reads x: |+⟩ sent and −x read, or |−⟩ sent and +x read
  const xError = 0.5 * ((1 - reducedBloch(xp, 0)[0]) / 2) + 0.5 * ((1 + reducedBloch(xm, 0)[0]) / 2)
  return {
    zError,
    xError,
    qber: (zError + xError) / 2,
    eveGuess: helstrom(reducedDensity(z0, [1]), reducedDensity(z1, [1]), 0.5),
    rA: Math.hypot(...reducedBloch(xp, 0)),
    rE: Math.hypot(...reducedBloch(xp, 1)),
  }
}

/* ------------------------------------------------------------ secret sharing with an entangled code (Bergou pp. 112-113) ------------------------------------------------------------ */

/**
 * Alice's logical state |ā⟩ as a circuit on Bob's wire (1) and Charlie's wire (2): Ry(2θ) on Bob, then a CNOT, then (for a = 1) a Z on Bob. The result
 * is cos θ|00⟩ + sin θ|11⟩ for a = 0 and cos θ|00⟩ − sin θ|11⟩ for a = 1 (Bergou Eq. 6.8). θ in radians.
 */
export function shareCircuit(theta: number, a: 0 | 1): Circuit {
  return {
    version: 1,
    qubits: 2,
    init: '00',
    wires: ['Bob', 'Charlie'],
    columns: [
      [{ op: 'gate', gate: 'Ry', targets: [0], params: [2 * theta] }],
      [{ op: 'gate', gate: 'X', targets: [1], controls: [0] }],
      ...(a === 1 ? [[{ op: 'gate' as const, gate: 'Z' as const, targets: [0] }]] : []),
    ],
  }
}

export interface ShareSplit {
  /** the chance Bob reads +x on |0̄⟩ */
  bobPlus: number
  /** Charlie's Bloch vector when Bob read +x, and when Bob read −x (on |0̄⟩) */
  charliePlus: [number, number, number]
  charlieMinus: [number, number, number]
  /** |⟨ψ₊|ψ₋⟩| of Charlie's two states: cos 2θ */
  overlap: number
  /** Charlie's never-wrong success chance on them: 1 − overlap */
  usd: number
}

/** Charlie's two kets when Bob reads ±x on the logical state |ā⟩ at angle θ: (⟨±x| ⊗ I)|ā⟩, normalised. */
export function charlieKets(theta: number, a: 0 | 1 = 0): { plus: Vec; minus: Vec; pPlus: number } {
  const C = coefMatrix(lastOf(shareCircuit(theta, a)), 1) // C[b][k]: Bob's bit b, Charlie's k
  const row = (sign: 1 | -1): Vec => [0, 1].map((k) => c((C[0][k].re + sign * C[1][k].re) / Math.SQRT2, (C[0][k].im + sign * C[1][k].im) / Math.SQRT2))
  const plus = row(1)
  const minus = row(-1)
  const pPlus = abs2(plus[0]) + abs2(plus[1])
  const unit = (v: Vec): Vec => v.map((z) => c(z.re / norm(v), z.im / norm(v)))
  return { plus: unit(plus), minus: unit(minus), pPlus }
}

/** Bob's reading and Charlie's two post-states for the logical bit 0 at angle θ (radians), with Charlie's never-wrong success on them. */
export function shareSplit(theta: number): ShareSplit {
  const psi = lastOf(shareCircuit(theta, 0))
  const m = measureInBasis(psi, 0, 'x')
  const { plus, minus } = charlieKets(theta, 0)
  return {
    bobPlus: m.p[0],
    charliePlus: reducedBloch(m.post[0]!, 1),
    charlieMinus: reducedBloch(m.post[1]!, 1),
    overlap: abs(inner(plus, minus)),
    usd: usd([plus, minus]),
  }
}

/** The angle θ (degrees, 0 to 45) at which Charlie's never-wrong success equals `target`, by bisection on `shareSplit` (it falls as θ grows). */
export function shareThetaFor(target: number): number {
  let lo = 0
  let hi = Math.PI / 4
  if (!(target > 0 && target < 1)) throw new Error('shareThetaFor: target in (0, 1)')
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    // at θ = 0 the code states coincide up to the sign of nothing: success 0 would be at overlap 1; success grows with θ up to θ = 45°
    if (shareSplit(mid).usd < target) lo = mid
    else hi = mid
  }
  return ((lo + hi) / 2) * (180 / Math.PI)
}

export type CheatOrder = 'honest' | 'cheat-first' | 'sigma-first'
export interface CheatResult {
  /** the largest difference, over every (a, s, b, c), between this run's public record and an honest run's */
  recordGap: number
  /** among rounds Charlie's own reading names a state: the chance the bit decoded as b ⊕ c ⊕ s differs from Alice's */
  errorRate: number
  /** among those rounds: the chance Charlie names Alice's bit from what he saw (his own x reading of Bob's qubit, if he took it, and his result) */
  charlieGuess: number
  /** the share of rounds Charlie's reading names a state (kept) */
  kept: number
}

const XPROJ: Mat[] = [outer(ket('+'), ket('+')), outer(ket('-'), ket('-'))]
const conjugate = (U: Mat, rho: Mat): Mat => matmul(matmul(U, rho), dagger(U))
const trace = (M: Mat): number => M.reduce((t, row, i) => t + row[i].re, 0)

/** The public record P(a, s, b, c) of one way to run the protocol, and the joint chance P(a, s, m, c) Charlie sees (m = null when he took no reading). */
function sharingRun(ord: CheatOrder, theta: number): { table: number[][][][]; joint: Map<string, number> } {
  const { plus, minus } = charlieKets(theta, 0)
  const E = usdPovm(plus, minus) // click ψ₊, click ψ₋, inconclusive
  const I2 = identity(2)
  const Zs = [kronM(I2, I2), kronM(GATE_Z, I2)]
  const table = [0, 1].map(() => [0, 1].map(() => [0, 1].map(() => [0, 0, 0]))) // [a][s][b][c]
  const joint = new Map<string, number>()
  for (const a of [0, 1] as const) {
    const rho = densityOf(lastOf(shareCircuit(theta, a)))
    for (const s of [0, 1] as const) {
      const read = (after: Mat, m: number | null) => {
        XPROJ.forEach((Pb, b) =>
          E.forEach((Ec, cc) => {
            const p = trace(matmul(kronM(Pb, Ec), after))
            table[a][s][b][cc] += p
            const key = `${a}|${s}|${m}|${cc}`
            joint.set(key, (joint.get(key) ?? 0) + p)
          }),
        )
      }
      if (ord === 'honest') read(conjugate(Zs[s], rho), null)
      else
        XPROJ.forEach((Pm, m) => {
          // Charlie reads Bob's qubit in x and sends it on in |m_x⟩
          const grab = (r: Mat): Mat => conjugate(kronM(Pm, I2), r)
          read(ord === 'cheat-first' ? conjugate(Zs[s], grab(rho)) : grab(conjugate(Zs[s], rho)), m)
        })
    }
  }
  return { table, joint }
}

/**
 * Charlie's grab (Bergou p. 113), by exact density-matrix sums: Alice sends |ā⟩ at angle θ (default 22.5°), Bob applies σ_z with chance ½ (s = 1)
 * and reads x (bit b); Charlie reads his qubit with the never-wrong POVM (c = 0 for ψ₊, 1 for ψ₋, 2 inconclusive). 'honest': nobody interferes.
 * 'cheat-first': Charlie measures Bob's qubit in x (reading m) and sends |m_x⟩ on BEFORE Bob's σ_z. 'sigma-first': Bob's σ_z acts first, then Charlie
 * measures and sends on. The public record is the table P(a, s, b, c); `recordGap` compares it with the honest table.
 */
export function sharingCheat(order: CheatOrder, theta = Math.PI / 8): CheatResult {
  const run = sharingRun(order, theta)
  const honest = sharingRun('honest', theta)
  let gap = 0
  let wrong = 0
  let kept = 0
  for (const a of [0, 1])
    for (const s of [0, 1])
      for (const b of [0, 1])
        for (const cc of [0, 1, 2]) {
          gap = Math.max(gap, Math.abs(run.table[a][s][b][cc] - honest.table[a][s][b][cc]))
          if (cc < 2) {
            kept += run.table[a][s][b][cc]
            if ((b ^ cc ^ s) !== a) wrong += run.table[a][s][b][cc]
          }
        }
  // Charlie's best guess of a from what he saw, over the rounds his reading names a state: his x reading m (if he took one) and c, with s unknown to him
  let right = 0
  let seen = 0
  for (const m of order === 'honest' ? ['null'] : ['0', '1'])
    for (const cc of [0, 1]) {
      const per = [0, 1].map((a) => [0, 1].reduce((u, s) => u + (run.joint.get(`${a}|${s}|${m}|${cc}`) ?? 0), 0))
      right += Math.max(per[0], per[1])
      seen += per[0] + per[1]
    }
  return { recordGap: gap, errorRate: wrong / kept, charlieGuess: right / seen, kept: kept / 4 }
}

/**
 * The chance that Bob's and Charlie's z readings agree on |0̄⟩ at angle θ when Bob reads z instead of x: 1 for an honest run (the code's z correlation is
 * perfect), but ½ once Charlie has read Bob's qubit along x and sent it on (his reading wipes out Bob's z value, whatever θ). This is the check the scheme
 * as described never makes: Bob only reads along x.
 */
export function sharingZAgreement(grab: boolean, theta = Math.PI / 8): number {
  let rho = densityOf(lastOf(shareCircuit(theta, 0)))
  if (grab) {
    const I2 = identity(2)
    rho = XPROJ.map((Pm) => conjugate(kronM(Pm, I2), rho)).reduce((a, b) => madd(a, b))
  }
  return rho[0][0].re + rho[3][3].re
}

/* ------------------------------------------------------------ Bergou's Eq. 6.6 (p. 111) ------------------------------------------------------------ */

export interface Eq66Check {
  /** the exact P(a, b | x, y) of Φ⁺ for the settings 0 = z, 1 = x on each side: table[x][y][2a + b] */
  table: number[][][]
  /** what the printed line adds up to for one fixed pair x = y: four entries of ½ */
  printedRowSum: number
  /** the largest difference between the exact table and the printed values (½ whatever a, b when x = y; ¼ when x ≠ y) */
  printedGap: number
  /** the largest difference between the exact table and ½δ_ab (x = y), ¼ (x ≠ y) */
  correctedGap: number
  /** the largest difference between the exact table and the hidden-variable copy a = λ_x, b = λ_y, with λ = (λ_z, λ_x) two independent fair bits */
  lambdaGap: number
}

/** Checks Eq. 6.6 against the state it names, Φ⁺ = (|00⟩ + |11⟩)/√2, measured in z (setting 0) or x (setting 1) by each side. */
export function eq66Check(): Eq66Check {
  const BASIS: ('z' | 'x')[] = ['z', 'x']
  const phi = bell('Phi+')
  const table = [0, 1].map((x) => [0, 1].map((y) => localBasisProbs(phi, [BASIS[x], BASIS[y]])))
  let printedGap = 0
  let correctedGap = 0
  let lambdaGap = 0
  for (const x of [0, 1])
    for (const y of [0, 1])
      for (const a of [0, 1])
        for (const b of [0, 1]) {
          const p = table[x][y][2 * a + b]
          printedGap = Math.max(printedGap, Math.abs(p - (x === y ? 0.5 : 0.25)))
          correctedGap = Math.max(correctedGap, Math.abs(p - (x === y ? (a === b ? 0.5 : 0) : 0.25)))
          let model = 0
          for (const lz of [0, 1]) for (const lx of [0, 1]) model += 0.25 * ((x === 0 ? lz : lx) === a ? 1 : 0) * ((y === 0 ? lz : lx) === b ? 1 : 0)
          lambdaGap = Math.max(lambdaGap, Math.abs(p - model))
        }
  return { table, printedRowSum: 4 * 0.5, printedGap, correctedGap, lambdaGap }
}
