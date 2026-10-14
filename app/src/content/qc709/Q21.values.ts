/**
 * Chapter Q21 numbers (Physics 709, "Protecting qubits from noise"), computed once with the engine. Plan: docs/roles/proposals/P-Q21-story.md; rulings
 * docs/roles/decisions/qc709-Q21Q22.md.
 *
 * Every number a learner reads in Q21 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q21.json (pipeline/claims_qc709/q21.py, built on pipeline/qec_q21_numpy.py: dense Kronecker products, textbook code words,
 * itertools enumeration, np.reshape, closed forms; never physics/qec/errors.ts or this file's helpers). Keys start with `q21` and are unique across all courses.
 *
 * Running example: the qubit 0.6|0⟩ + 0.8|1⟩ (chances 0.36 and 0.64), prepared by R_y(θ_a), θ_a = 2 arccos 0.6. Code qubits are numbered 1 … n from the left; code
 * qubit j is wire q_{j−1}. Helpers (wires q3, q4) read 0 for a check of +1 and 1 for −1; a syndrome is written in helper bits and kept here as that binary number
 * (10 → 2, 11 → 3, 01 → 1).
 */
import { abs, c } from '../../physics/complex'
import { type Vec } from '../../physics/linalg'
import { gf2Nullspace, syndromeOf } from '../../physics/qc/bits'
import { type Circuit, type GateName, type Op, runCircuit } from '../../physics/qc/circuit'
import { kronM, randomUnitary, traceN } from '../../physics/qc/cmat'
import { mixtureN, densityOf } from '../../physics/qc/density'
import { P as PGate, Rx, pauliEigenvalue } from '../../physics/qc/gates'
import { marginal } from '../../physics/qc/measure'
import { rng } from '../../physics/random'
import { correctionOutcome, lookupDecoder } from '../../physics/qec/codes'
import { applyPauli, codewords } from '../../physics/qec/codewords'
import {
  codeSyndrome,
  dephasingFactor,
  envPauliExpansion,
  gaussianDephasingFactor,
  klMatrix,
  pauliCoefficients,
  pauliName,
  paulisOfWeight,
  repetitionBreakEven,
  uniformDephasingFactor,
} from '../../physics/qec/errors'
import { Pauli } from '../../physics/qec/pauli'
import { binomialPmf, qhbMinN, qhbNeed, repetitionFail } from '../../physics/qec/rates'
import { registeredCode } from '../../physics/qec/registry'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
/** The running qubit a|0⟩ + b|1⟩ with a = 0.6, b = 0.8: R_y(θ_a)|0⟩. */
const THETA_A = 2 * Math.acos(0.6)

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Circuits"), memoised so a story's stage states share one object per circuit  */
/* ---------------------------------------------------------------------------------------------- */
const gate = (g: GateName, targets: number[], extra: Partial<Extract<Op, { op: 'gate' }>> = {}): Op => ({ op: 'gate', gate: g, targets, ...extra })
const cnot = (ctl: number, t: number): Op => gate('X', [t], { controls: [ctl] })
const OUTCOMES = new WeakMap<Circuit, string>()
const memo = new Map<string, Circuit>()
const made = (key: string, outcomes: string | undefined, build: () => Circuit): Circuit => {
  let C = memo.get(key)
  if (!C) {
    C = build()
    memo.set(key, C)
    if (outcomes !== undefined) OUTCOMES.set(C, outcomes)
  }
  return C
}
/** The readings of the two helper wires that make a run with this circuit well defined (a circuit with a mid-circuit measurement needs them). */
export const outcomesOf = (C: Circuit): string | undefined => OUTCOMES.get(C)

/** The error column of the bit-flip circuit: 'none' (an identity), 'X1' … 'X1X2', 'Z1' … 'Z3', or 'rx<degrees>' (R_x on code qubit 2). */
function errorOps(e: string): Op[] {
  if (e === 'none') return [gate('I', [0])]
  if (e === 'X1X2') return [gate('X', [0]), gate('X', [1])]
  const single = /^([XZ])([123])$/.exec(e)
  if (single) return [gate(single[1] as GateName, [Number(single[2]) - 1])]
  const rx = /^rx(\d+)$/.exec(e)
  if (rx) return [gate('Rx', [1], { params: [Number(rx[1]) * DEG] })]
  throw new Error(`Q21 error column: unknown error ${e}`)
}
const SYN_OUT: Record<string, string> = { none: '00', X1: '10', X2: '11', X3: '01', X1X2: '01', Z1: '00', Z2: '00', Z3: '00', rx60: '00', rx90: '00' }
const PF_OUT: Record<string, string> = { none: '00', Z1: '10', Z2: '11', Z3: '01', X1: '00', X2: '00', X3: '00' }

const ENC: Op[][] = [[gate('Ry', [0], { params: [THETA_A] })], [cnot(0, 1)], [cnot(0, 2)]]
const PARITY: Op[][] = [[cnot(0, 3)], [cnot(1, 3)], [cnot(1, 4)], [cnot(2, 4)]]
/** The bit-flip circuit, 5 wires (q0–q2 the code qubits 1–3, q3–q4 helpers), 10 columns: encode ×3, the error, four parity CNOTs, measure, conditioned fixes. */
export const C_BF = (e: 'none' | 'X1' | 'X2' | 'X3' | 'X1X2' | 'Z1' | 'Z2' | 'Z3' | 'rx60' | 'rx90'): Circuit =>
  made(`bf-${e}`, SYN_OUT[e], () => ({
    version: 1,
    qubits: 5,
    clbits: 2,
    init: '00000',
    columns: [
      ...ENC,
      errorOps(e),
      ...PARITY,
      [
        { op: 'measure', qubit: 3, bit: 0 },
        { op: 'measure', qubit: 4, bit: 1 },
      ],
      [
        gate('X', [0], { cond: { bits: [0, 1], equals: '10' } }),
        gate('X', [1], { cond: { bits: [0, 1], equals: '11' } }),
        gate('X', [2], { cond: { bits: [0, 1], equals: '01' } }),
      ],
    ],
  }))
const H3 = (): Op[] => [gate('H', [0]), gate('H', [1]), gate('H', [2])]
/** The phase-flip circuit, 5 wires, 11 columns: the same encoder, H on the code qubits, the error (in the rotated frame), H, the four parity CNOTs, measure. */
export const C_PF = (e: 'none' | 'Z1' | 'Z2' | 'Z3' | 'X1' | 'X2' | 'X3'): Circuit =>
  made(`pf-${e}`, PF_OUT[e], () => ({
    version: 1,
    qubits: 5,
    clbits: 2,
    init: '00000',
    columns: [
      ...ENC,
      H3(),
      errorOps(e),
      H3(),
      ...PARITY,
      [
        { op: 'measure', qubit: 3, bit: 0 },
        { op: 'measure', qubit: 4, bit: 1 },
      ],
    ],
  }))
/** The encoder alone on three wires. */
export const C_ENC3: Circuit = made('enc3', undefined, () => ({ version: 1, qubits: 3, init: '000', columns: ENC }))
/** One qubit: R_y(θ_a), then the phase turn P(φ) (φ in degrees). */
export const C_1 = (phiDeg: number): Circuit =>
  made(`one-${phiDeg}`, undefined, () => ({ version: 1, qubits: 1, init: '0', columns: [[gate('Ry', [0], { params: [THETA_A] })], [gate('P', [0], { params: [phiDeg * DEG] })]] }))
const DFS_STATE: Op[][] = [[gate('Ry', [0], { params: [THETA_A] })], [cnot(0, 1)], [gate('X', [1])]]
/** Two qubits: 0.6|01⟩ + 0.8|10⟩, then both qubits turn by the same φ (degrees). */
export const C_DFS = (phiDeg: number): Circuit =>
  made(`dfs-${phiDeg}`, undefined, () => ({ version: 1, qubits: 2, init: '00', columns: [...DFS_STATE, [gate('P', [0], { params: [phiDeg * DEG] }), gate('P', [1], { params: [phiDeg * DEG] })]] }))
/** Two qubits: the same state, then the first qubit turns by φ₁ and the second by φ₂ (degrees). */
export const C_IND = (phi1: number, phi2: number): Circuit =>
  made(`ind-${phi1}-${phi2}`, undefined, () => ({ version: 1, qubits: 2, init: '00', columns: [...DFS_STATE, [gate('P', [0], { params: [phi1 * DEG] }), gate('P', [1], { params: [phi2 * DEG] })]] }))

/* ---------------------------------------------------------------------------------------------- */
/* Helpers over the engine                                                                         */
/* ---------------------------------------------------------------------------------------------- */
const run = (C: Circuit) => runCircuit(C, outcomesOf(C) !== undefined ? { outcomes: outcomesOf(C)! } : {})
const at = (v: Vec, bits: string): number => v[parseInt(bits, 2)].re
const synBits = (signs: readonly (1 | -1)[]): number => signs.reduce((v: number, s) => 2 * v + (s === -1 ? 1 : 0), 0)
const argmax = (xs: readonly number[]): number => xs.indexOf(Math.max(...xs))
const helperIdx = (v: Vec): number => argmax(marginal(v, [3, 4]))
const pa = (s: string): Pauli => Pauli.parse(s)
/** The Pauli string with letter `l` on code qubit `j` (counted from 1) of n. */
const at1 = (n: number, l: string, j: number): Pauli => pa(Array.from({ length: n }, (_, i) => (i === j - 1 ? l : 'I')).join(''))

const rep3 = registeredCode('rep3')
const shor = registeredCode('shor9')
const REP_M = [
  [1, 1, 0],
  [0, 1, 1],
]
const bf = (e: Parameters<typeof C_BF>[0]) => run(C_BF(e)).states
const pf = (e: Parameters<typeof C_PF>[0]) => run(C_PF(e)).states
const a = 0.6
const b = 0.8

/** The code state a|0̄⟩ + b|1̄⟩ of a registered code as a dense vector (for the overlaps). */
function codeState(entry: ReturnType<typeof registeredCode>, a_: number, b_: number) {
  const w = codewords(entry)
  const re = new Float64Array(2 ** entry.n)
  const im = new Float64Array(2 ** entry.n)
  for (const x of w.zero) {
    re[parseInt(x.bits, 2)] += a_ * x.amp.re
    im[parseInt(x.bits, 2)] += a_ * x.amp.im
  }
  for (const x of w.one) {
    re[parseInt(x.bits, 2)] += b_ * x.amp.re
    im[parseInt(x.bits, 2)] += b_ * x.amp.im
  }
  return { re, im }
}
const norm2diff = (u: { re: Float64Array; im: Float64Array }, v: { re: Float64Array; im: Float64Array }): number => Math.sqrt(u.re.reduce((s, x, i) => s + (x - v.re[i]) ** 2 + (u.im[i] - v.im[i]) ** 2, 0))

/* ---------- classical ---------- */
const P_FLIP = 0.1
const P_LOW = 0.01
const RAW = bf('none')

/* ---------- bit-flip ---------- */
const psi1 = run(C_1(0)).states[2]
const enc3 = run(C_ENC3).states[3]
const psiCubed: Vec = (() => {
  const out: Vec = []
  for (let x = 0; x < 8; x++) {
    const bits = [(x >> 2) & 1, (x >> 1) & 1, x & 1]
    out.push(bits.reduce((acc, bit) => ({ re: acc.re * psi1[bit].re - acc.im * psi1[bit].im, im: acc.re * psi1[bit].im + acc.im * psi1[bit].re }), c(1)))
  }
  return out
})()
const small = bf('rx60')
const twoFlip = bf('X1X2')
const rxCoef = pauliCoefficients(Rx(60 * DEG))

/* ---------- phase-flip ---------- */
const z1 = bf('Z1')
const overlapZ1 = (() => {
  let re = 0
  for (let k = 0; k < 32; k++) re += RAW[3][k].re * z1[4][k].re + RAW[3][k].im * z1[4][k].im
  return re
})()

/* ---------- shor ---------- */
const shorWords = codewords(shor)
const shorPsi = codeState(shor, a, b)
const X = (j: number) => at1(9, 'X', j)
const Zp = (j: number) => at1(9, 'Z', j)
const lit = (p: Pauli): string[] =>
  shor.stabilizer.generators.filter((_, i) => codeSyndrome(shor, p)[i] === -1).map(pauliName)
const z1z2 = pa('ZZIIIIIII')
const weight2X: Pauli[] = []
for (let i = 1; i <= 9; i++) for (let j = i + 1; j <= 9; j++) weight2X.push(X(i).mul(X(j)))
const dec2 = lookupDecoder(shor.stabilizer, 2)
const w2Fixed = weight2X.filter((e) => correctionOutcome(shor.stabilizer, dec2, e).outcome === 'corrected').length

/* ---------- digitize ---------- */
const U_AE = randomUnitary(4, rng(709))
const envSplit = envPauliExpansion(U_AE, [c(a), c(b)])
const damp = (() => {
  const gamma = 0.36
  return pauliCoefficients([[c(0), c(Math.sqrt(gamma))], [c(0), c(0)]])
})()
const rx90Coef = pauliCoefficients(Rx(90 * DEG))
const weightOf = (n: number, t: number): number => paulisOfWeight(n, t).length

/* ---------- kl ---------- */
const klRep = klMatrix(rep3, [Pauli.identity(3), pa('XII'), pa('IXI'), pa('IIX')])
const klZ1 = klMatrix(rep3, [Pauli.identity(3), pa('ZII')])
const klShor = klMatrix(shor, [Pauli.identity(9), Zp(1), Zp(2)])
const SHOR_TABLE = [
  [1, 0, 0],
  [0, 1, 1],
  [0, 1, 1],
]

/* ---------- dfs ---------- */
const rho1 = (phis: number[]) => mixtureN(phis.map((p) => ({ w: 1 / phis.length, psi: run(C_1(p)).states[2] })))
const rho2 = (pairs: [number, number][]) => mixtureN(pairs.map(([p1, p2]) => ({ w: 1 / pairs.length, psi: run(C_IND(p1, p2)).states[4] })))
const rhoDfs = (phis: number[]) => mixtureN(phis.map((p) => ({ w: 1 / phis.length, psi: run(C_DFS(p)).states[4] })))
const turn60 = kronM(PGate(60 * DEG), PGate(60 * DEG))
const phaseDeg = (k: number): number => (Math.atan2(turn60[k][k].im, turn60[k][k].re) / DEG + 360) % 360
const printedRho = (() => {
  const r = rho1([60, -60]).map((row) => row.map((x) => ({ ...x })))
  r[0][0] = c(r[0][0].re + r[0][1].re, r[0][0].im + r[0][1].im) // Eq. 9.56 as printed: the last term lands on |0⟩⟨0|
  r[0][1] = c(0)
  return r
})()

export const V = {
  /* q21-classical */
  q21P: P_FLIP,
  q21PLow: P_LOW,
  q21RepC0: binomialPmf(3, 0, P_FLIP),
  q21RepC1: binomialPmf(3, 1, P_FLIP),
  q21RepC2: binomialPmf(3, 2, P_FLIP),
  q21RepC3: binomialPmf(3, 3, P_FLIP),
  q21RepFail01: repetitionFail(P_FLIP, 3),
  q21RepFail001: repetitionFail(P_LOW, 3),
  q21BreakEven: repetitionBreakEven(3),
  q21RepFail5: repetitionFail(P_FLIP, 5),
  q21RepRatio: repetitionFail(P_FLIP, 3) / repetitionFail(P_FLIP, 5),
  q21RepSyn1: Number.parseInt(syndromeOf(REP_M, '100'), 2),
  q21RepSyn2: Number.parseInt(syndromeOf(REP_M, '010'), 2),
  q21RepSyn3: Number.parseInt(syndromeOf(REP_M, '001'), 2),
  q21RepNullWords: 2 ** gf2Nullspace(REP_M).length,
  q21A: psi1[0].re,
  q21B: psi1[1].re,
  q21Chance0: psi1[0].re ** 2 + psi1[0].im ** 2,
  q21Chance1: psi1[1].re ** 2 + psi1[1].im ** 2,

  /* q21-bit-flip */
  q21EncBar0: at(RAW[3], '00000'),
  q21EncBar1: at(RAW[3], '11100'),
  q21NotCopy: enc3.reduce((s, x, k) => s + x.re * psiCubed[k].re + x.im * psiCubed[k].im, 0),
  q21EncChecks: ['ZZI', 'IZZ', 'ZIZ'].reduce((s, p) => s + (pauliEigenvalue(enc3, p) ?? 0), 0),
  q21T91None: synBits(codeSyndrome(rep3, Pauli.identity(3))),
  q21T91X1: synBits(codeSyndrome(rep3, pa('XII'))),
  q21T91X2: synBits(codeSyndrome(rep3, pa('IXI'))),
  q21T91X3: synBits(codeSyndrome(rep3, pa('IIX'))),
  q21BfSynX2: marginal(bf('X2')[8], [3, 4])[3],
  q21BfRestored0: at(bf('X2')[10], '00011') ** 2,
  q21BfRestored1: at(bf('X2')[10], '11111') ** 2,
  q21SmallP00: marginal(small[8], [3, 4])[0],
  q21SmallP11: marginal(small[8], [3, 4])[3],
  q21SmallEps: abs(rxCoef.X),
  q21TwoFlipSyn: helperIdx(twoFlip[8]),
  q21TwoFlipBar0: at(twoFlip[10], '00001'),
  q21TwoFlipBar1: at(twoFlip[10], '11101'),

  /* q21-phase-flip */
  q21Z1Syn: helperIdx(z1[8]),
  q21Z1Overlap: overlapZ1,
  q21Z1OverlapSize: Math.abs(overlapZ1),
  q21Z1Fid: overlapZ1 * overlapZ1,
  q21PfBar000: at(pf('none')[4], '00000'),
  q21PfSynZ1: helperIdx(pf('Z1')[10]),
  q21PfSynZ2: helperIdx(pf('Z2')[10]),
  q21PfSynZ3: helperIdx(pf('Z3')[10]),
  q21PfX1Syn: helperIdx(pf('X1')[10]),
  q21PfX1Bar000: at(pf('X1')[5], '00000'),
  q21PfX1BarSize: Math.abs(at(pf('X1')[5], '00000')),

  /* q21-shor */
  q21ShorBar: shorWords.zero[0].amp.re,
  q21ShorTerms: shorWords.zero.length,
  q21ShorChecks: shor.stabilizer.generators.length,
  q21ShorX5Lit: lit(X(5)).length,
  q21ShorZg1: synBits(codeSyndrome(shor, Zp(1)).slice(0, 2) as (1 | -1)[]),
  q21ShorZg2: synBits(codeSyndrome(shor, Zp(4)).slice(0, 2) as (1 | -1)[]),
  q21ShorZg3: synBits(codeSyndrome(shor, Zp(7)).slice(0, 2) as (1 | -1)[]),
  q21ShorWt1: weightOf(9, 1),
  q21ShorDistinct: new Set(paulisOfWeight(9, 1).map((p) => codeSyndrome(shor, p).join(','))).size,
  q21Z1Z2Trivial: norm2diff(applyPauli(z1z2, shorPsi), shorPsi),
  q21ShorW2Fixed: w2Fixed,
  q21ShorW2: weight2X.length,

  /* q21-digitize */
  q21RxCI: rxCoef.I.re,
  q21RxCX: abs(rxCoef.X),
  q21RxCXIm: rxCoef.X.im,
  q21RxCYZ: abs(rxCoef.Y) + abs(rxCoef.Z),
  q21EnvSplit: envSplit.gap,
  q21Wt1n3: weightOf(3, 1),
  q21Wt1n9: weightOf(9, 1),
  q21Wt1n5: weightOf(5, 1),
  q21Wt2n5: weightOf(5, 2) - weightOf(5, 1),
  q21Gamma: 0.36,
  q21DampCoef: abs(damp.X),

  /* q21-kl */
  q21KlBitflipI: Math.max(...klRep.C.flatMap((row, i) => row.map((z, j) => abs(c(z.re - (i === j ? 1 : 0), z.im))))),
  q21KlZ1Zero: klZ1.C[0][1].re,
  q21KlZ1One: klZ1.C1[0][1].re,
  q21KlShorC: Math.max(...klShor.C.flatMap((row, i) => row.map((z, j) => abs(c(z.re - SHOR_TABLE[i][j], z.im))))),
  q21KlShorEig0: klShor.eigenvalues[0],
  q21KlShorEig1: klShor.eigenvalues[1],
  q21KlShorEig2: klShor.eigenvalues[2],
  q21QhbMinN: qhbMinN(1, 1)!,
  q21Qhb5: qhbNeed(5, 1, 1),
  q21Qhb5Rooms: qhbNeed(5, 1, 1) / 2,
  q21QhbShorNeed: qhbNeed(9, 1, 1),
  q21QhbShorHave: 2 ** 9,
  q21Qhb4Need: qhbNeed(4, 1, 1),
  q21Qhb4Have: 2 ** 4,

  /* q21-dfs */
  q21Z60: dephasingFactor([60 * DEG, -60 * DEG]).re,
  q21Z60Sq: dephasingFactor([60 * DEG, -60 * DEG]).re ** 2,
  q21Off0: densityOf(psi1)[0][1].re,
  q21Off1: rho1([60, -60])[0][1].re,
  q21ZUniform: uniformDephasingFactor().re,
  q21ZGauss: gaussianDephasingFactor(1).re,
  q21DfsPh01: phaseDeg(1),
  q21DfsPh11: phaseDeg(3),
  q21DfsOff: rhoDfs([60, -60])[1][2].re,
  q21IndOff: rho2([[60, 60], [60, -60], [-60, 60], [-60, -60]])[1][2].re,
  q21PrintedTrace: traceN(printedRho).re,
  q21TrueTrace: traceN(rho1([60, -60])).re,

  /* challenges */
  q21ChFail: repetitionFail(0.2, 3),
  q21ChFive: repetitionFail(0.2, 5),
  q21ChSmall: marginal(bf('rx90')[8], [3, 4])[3],
  q21ChOverlap: (() => {
    const code = (x: number, y: number): Vec => Array.from({ length: 8 }, (_, k) => c(k === 0 ? x : k === 7 ? y : 0))
    const v = code(0.8, 0.6)
    const w = v.map((z, k) => (k >= 4 ? c(-z.re, -z.im) : z)) // Z on qubit 1 flips the sign of the strings whose first bit is 1
    return v.reduce((s, z, k) => s + z.re * w[k].re + z.im * w[k].im, 0)
  })(),
  q21ChCI: rx90Coef.I.re,
  q21ChZ90: dephasingFactor([90 * DEG, -90 * DEG]).re,
  q21ChOff30: densityOf(psi1)[0][1].re * dephasingFactor([30 * DEG, -30 * DEG]).re,
  q21ChInd30: rho2([[30, 30], [30, -30], [-30, 30], [-30, -30]])[1][2].re,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
