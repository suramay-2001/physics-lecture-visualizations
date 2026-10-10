/**
 * Chapter F7 numbers (Physics 709, "Bits and logic that can run backwards"), computed once with the engine.
 * Plan: docs/roles/proposals/P-F7-story.md; rulings docs/roles/decisions/qc709-F7F8.md.
 *
 * Every number a learner reads in F7 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each
 * key is in physics/__fixtures__/claims-qc709/f7.json (pipeline/claims_qc709/f7.py, an independent route: gates as Python lambdas over
 * tuples of bits, explicit dense matrices for the circuits, itertools for the counts, integer-bitmask elimination, exact Fractions). Keys
 * start with `f7` and are unique across both courses. A bit string a claim talks about is stored as the number it spells (110 is 6).
 *
 * Running examples: two-bit gates; the 3-bit balanced, non-linear table T_BAL3; a = 110; the Simon-style table T_SIM (n = 3, two output
 * bits, f(x) = f(x ⊕ 110)); the strings 1011 and 0110; the check matrix of the [7,4] Hamming code. The circuits are built here (the
 * Toffoli columns, the three-bit AND with a work wire, the garbage test) so the story, the tests and the twin look at one object each.
 */
import { abs2 } from '../../physics/complex'
import { dagger, identity, matmul, maxDiff, type Vec } from '../../physics/linalg'
import {
  type Bit,
  bigORatio,
  bigOThreshold,
  bitString,
  composeMaps,
  dotMod2,
  exponentialCost,
  functionCensus,
  gateTable,
  gf2Nullspace,
  gf2RowReduceSteps,
  gf2Span,
  gf2Rank,
  hammingDistance,
  hammingParity,
  hammingWeight,
  isBalanced,
  isBijection,
  isConstant,
  isInvolution,
  landauerEV,
  landauerJ,
  mapCensus,
  maxPreimages,
  pairwiseSortComparisons,
  parseBits,
  periodicTable,
  permutationMatrix,
  preimageCount,
  quadraticCost,
  reversibleOracle,
  rootExponentialCost,
  syndromeOf,
  truthTable,
  xor,
} from '../../physics/qc/bits'
import { type Circuit, type GateOp, runCircuit } from '../../physics/qc/circuit'
import { detN, rankN } from '../../physics/qc/cmat'
import { reducedDensity, purityN } from '../../physics/qc/density'
import { groverOptimalK } from '../../physics/qc/grover'
import { djDeterministicWorst, dotOddCount, walshSum } from '../../physics/qc/oracles'
import { c } from '../../physics/complex'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* The functions and the matrices (plan "Conventions")                                              */
/* ---------------------------------------------------------------------------------------------- */
/** A balanced, non-linear 3-bit function: 1 on 000, 011, 100 and 101 (the table 1001 1100 read as f[0] … f[7]). */
export const T_BAL3: number[] = [1, 0, 0, 1, 1, 1, 0, 0]
/** Simon's promise on 3 bits with the secret s = 110: two output bits, f(x) = f(x ⊕ 110), every value taken twice. */
export const T_SIM: number[] = periodicTable(0b110, 3)
/** The two checks of the hidden-string story: y·s = 0 for y = 001 and y = 111. */
export const ROWS_Y: string[] = ['001', '111']
/** Three rows that tie over bits (110 ⊕ 011 = 101). */
export const ROWS_DEP: string[] = ['110', '011', '101']
/** The check matrix of the [7,4] Hamming code, one string per row (column j is j in binary, most significant bit in row 0). */
export const M_7: string[] = hammingParity(3).map((r) => r.join(''))
/** A codeword of that code and the same word received with place 6 flipped. */
export const WORD_OK = '1110000'
export const WORD_RX = '1110010'

/* ---------------------------------------------------------------------------------------------- */
/* The circuits, memoised so a story's stage states share one object per circuit                     */
/* ---------------------------------------------------------------------------------------------- */
const memo = new Map<string, Circuit>()
const once = (key: string, make: () => Circuit): Circuit => {
  let C = memo.get(key)
  if (!C) memo.set(key, (C = make()))
  return C
}
const gate = (g: GateOp['gate'], targets: number[], controls?: number[]): GateOp => ({ op: 'gate', gate: g, targets, ...(controls ? { controls } : {}) })
const toffoli = (a: number, b: number, t: number): GateOp => gate('X', [t], [a, b])
const hh = (): GateOp[] => [gate('H', [0]), gate('H', [1])]

/** C_TOF(s): one Toffoli on three wires a, b, c, starting in the string s. */
export const C_TOF = (s: string): Circuit => once(`tof:${s}`, () => ({ version: 1, qubits: 3, init: s, wires: ['a', 'b', 'c'], columns: [[toffoli(0, 1, 2)]] }))
/** C_TOF2(s): the same Toffoli twice in a row. */
export const C_TOF2 = (s: string): Circuit => once(`tof2:${s}`, () => ({ version: 1, qubits: 3, init: s, wires: ['a', 'b', 'c'], columns: [[toffoli(0, 1, 2)], [toffoli(0, 1, 2)]] }))
/** C_AND3(s): x₀x₁x₂ AND-ed through a work wire w into y: store x₀x₁ on w, add w·x₂ into y, then undo the first step. */
export const C_AND3 = (s: string): Circuit =>
  once(`and3:${s}`, () => ({
    version: 1,
    qubits: 5,
    init: s,
    wires: ['x₀', 'x₁', 'x₂', 'w', 'y'],
    columns: [[toffoli(0, 1, 3)], [toffoli(3, 2, 4)], [toffoli(0, 1, 3)]],
  }))
/** C_GARB: two Hadamard gates, a Toffoli that leaves x₀x₁ on the work wire w, two Hadamard gates again (the garbage is NOT undone). */
export const C_GARB: Circuit = { version: 1, qubits: 3, init: '000', wires: ['x₀', 'x₁', 'w'], columns: [hh(), [toffoli(0, 1, 2)], hh()] }
/** C_CLEAN: the same, with a second Toffoli that wipes the work wire before the last Hadamard gates. */
export const C_CLEAN: Circuit = { version: 1, qubits: 3, init: '000', wires: ['x₀', 'x₁', 'w'], columns: [hh(), [toffoli(0, 1, 2)], [toffoli(0, 1, 2)], hh()] }

/* ---------------------------------------------------------------------------------------------- */
/* The simulations the story reads                                                                  */
/* ---------------------------------------------------------------------------------------------- */
const states = (C: Circuit): Vec[] => runCircuit(C).states
/** The basis string a classical reversible run ends in: the one index that carries all the chance. */
function endString(C: Circuit, upTo?: number): number {
  const psi = states(C)[upTo ?? C.columns.length]
  const k = psi.findIndex((z) => abs2(z) > 0.5)
  if (k < 0 || abs2(psi[k]) < 1 - 1e-9) throw new Error('F7.values: a classical run must end in one basis string')
  return k
}
const probOf = (psi: Vec, i: number): number => abs2(psi[i])

const GARB = states(C_GARB).at(-1)!
const CLEAN = states(C_CLEAN).at(-1)!

// the Toffoli gives AND at c = 0 and NAND at c = 1, read off the circuit, as a four-row column
const colOf = (cIn: 0 | 1): number => parseBits([0, 1, 2, 3].map((ab) => endString(C_TOF(`${bitString(ab, 2)}${cIn}`)) & 1).join(''))
// the three-bit AND, run for every input: work wire back to 0 and y = x₀x₁x₂
let and3Clean = 1
for (let x = 0; x < 8; x++) {
  const end = endString(C_AND3(`${bitString(x, 3)}00`))
  const want = parseBits(`${bitString(x, 3)}0${x === 7 ? 1 : 0}`)
  if (end !== want) and3Clean = 0
}
// every two-bit f: the reversible form (x, y) → (x, y ⊕ f(x)) undoes itself and is a bijection of the 8 strings
let oracleOk = 1
for (let code = 0; code < 16; code++) {
  const perm = reversibleOracle(truthTable((x) => (code >> x) & 1, 2) as Bit[])
  if (!isBijection(perm, 3) || !isInvolution(perm) || composeMaps(perm, perm).some((v, i) => v !== i)) oracleOk = 0
}
// NAND builds NOT, AND and OR: checked on every input from the NAND table alone
const NAND = gateTable('NAND').out
const nand = (a: number, b: number): number => NAND[2 * a + b]
let nandUniversal = 1
for (let a = 0; a < 2; a++) {
  if (nand(a, a) !== 1 - a) nandUniversal = 0
  for (let b = 0; b < 2; b++) {
    const and = nand(nand(a, b), nand(a, b))
    const or = nand(nand(a, a), nand(b, b))
    if (and !== (a & b) || or !== (a | b)) nandUniversal = 0
  }
}
// (−1)^(a ⊕ b) = (−1)^a (−1)^b on all four rows
let signsMultiply = 1
for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if ((-1) ** xor(a, b) !== (-1) ** a * (-1) ** b) signsMultiply = 0
// a·x ⊕ b is balanced exactly when a ≠ 0, for all 16 pairs (a, b) with n = 3
let linBalancedIff = 1
for (let a = 0; a < 8; a++)
  for (const b of [0, 1] as const) {
    const t = truthTable((x) => dotMod2(a, x) ^ b, 3) as Bit[]
    if (isBalanced(t) !== (a !== 0) || isConstant(t) !== (a === 0)) linBalancedIff = 0
  }
// the pairing x ↔ x ⊕ e_k flips a·x whenever a_k = 1 (the proof that the signs cancel), for a = 110 and k = 0
let pairFlips = 1
for (let x = 0; x < 8; x++) if (dotMod2(0b110, x ^ 0b100) === dotMod2(0b110, x)) pairFlips = 0

// every single flip of a code word shows as its own place number: the check results read j in binary when place j (counted from 1) is flipped
const M7num = M_7.map((r) => [...r].map(Number))
let hammingFlips = 1
for (let j = 1; j <= 7; j++) {
  const flipped = Array.from({ length: 7 }, (_, i) => (i === j - 1 ? '1' : '0')).join('')
  if (parseBits(syndromeOf(M7num, flipped)) !== j) hammingFlips = 0
}

const PTP = (() => {
  const P = permutationMatrix(gateTable('Toffoli').out)
  return maxDiff(matmul(dagger(P), P), identity(8))
})()
const census3 = functionCensus(3)
const census2 = functionCensus(2)
const maps22 = mapCensus(2, 2)
const steps = gf2RowReduceSteps(ROWS_Y.map((r) => [...r].map(Number)))
const nullY = gf2Span(gf2Nullspace(ROWS_Y.map((r) => [...r].map(Number)), 3), 3)
const rowsDep = ROWS_DEP.map((r) => [...r].map(Number))
const depMatrix = rowsDep.map((row) => row.map((v) => c(v)))
const f0 = (n: number): number => 3 * n * n + 5 * n + 7

export const V = {
  /* f7-boolean */
  f7AndCol: parseBits(gateTable('AND').out.join('')),
  f7OrCol: parseBits(gateTable('OR').out.join('')),
  f7XorCol: parseBits(gateTable('XOR').out.join('')),
  f7NandCol: parseBits(gateTable('NAND').out.join('')),
  f7AndOnes: gateTable('AND').out.reduce<number>((s, v) => s + v, 0),
  f7AndOnlyAt: gateTable('AND').out.indexOf(1),
  f7Funcs1: functionCensus(1).total,
  f7Funcs2: census2.total,
  f7Funcs3: census3.total,
  f7Rows3: 2 ** 3,
  f7Const: census3.constant,
  f7Balanced3: census3.balanced,
  f7Neither3: census3.neither,
  f7Balanced2: census2.balanced,
  f7BalancedShare3: census3.balanced / census3.total,
  f7Neither2: census2.neither,
  f7BalIs: Number(isBalanced(T_BAL3 as Bit[])),
  f7BalOnes: T_BAL3.reduce<number>((s, v) => s + v, 0),
  f7NandUniversal: nandUniversal,
  f7HalfSum11: gateTable('XOR').out[3],
  f7HalfCarry11: gateTable('AND').out[3],

  /* f7-reversible */
  f7AndZeroPre: preimageCount(gateTable('AND').out, 0),
  f7CnotBij: Number(isBijection(gateTable('CNOT').out, 2)),
  f7CnotMaxPre: maxPreimages(gateTable('CNOT').out),
  f7Maps22: maps22.total,
  f7Perms22: maps22.bijections,
  f7TofUnitary: PTP,
  f7Tof110: endString(C_TOF('110')),
  f7TofAnd: colOf(0),
  f7TofNand: colOf(1),
  f7TofBack110: endString(C_TOF2('110')),
  f7OracleSelfInv16: oracleOk,
  f7Landauer300Mant: landauerJ(300) / 1e-21,
  f7Landauer300eV: landauerEV(300),
  f7And3In11100: endString(C_AND3('11100')),
  f7And3WorkMid: (endString(C_AND3('11100'), 1) >> 1) & 1, // the work wire w (bit 1 of the 5-bit index) after the first column
  f7And3WorkEnd: (endString(C_AND3('11100')) >> 1) & 1,
  f7And3CleanAll: and3Clean,
  f7GarbageP00: probOf(GARB, 0b000) + probOf(GARB, 0b001),
  f7GarbageP000: probOf(GARB, 0b000),
  f7GarbageP001: probOf(GARB, 0b001),
  f7CleanP00: probOf(CLEAN, 0b000) + probOf(CLEAN, 0b001),
  f7GarbageAmp000: GARB[0b000].re,
  f7GarbageAmp001: GARB[0b001].re,
  f7GarbagePurity: purityN(reducedDensity(GARB, [0, 1])),

  /* f7-xor */
  f7Xor1011With0110: xor(0b1011, 0b0110),
  f7OtpBack: xor(xor(0b1011, 0b0110), 0b0110),
  f7SignsMultiply: signsMultiply,
  f7Dot110With011: dotMod2(0b110, 0b011),
  f7Dot110With111: dotMod2(0b110, 0b111),
  f7Count110: dotOddCount(0b110, 3),
  f7SignSum110: walshSum(0b110, 3),
  f7SignSum000: walshSum(0, 3),
  f7PairFlips: pairFlips,
  f7LinBalancedIff: linBalancedIff,
  f7MinusShare110: dotOddCount(0b110, 3) / 2 ** 3,
  f7Dot1011With0110: dotMod2(0b1011, 0b0110),

  /* f7-gf2 */
  f7Xor101With011: xor(0b101, 0b011),
  f7Wt1101: hammingWeight(0b1101),
  f7Dist1011To0110: hammingDistance(0b1011, 0b0110),
  f7HammingCodeword: parseBits(syndromeOf(M_7.map((r) => [...r].map(Number)), WORD_OK)),
  f7Syndrome6: parseBits(syndromeOf(M_7.map((r) => [...r].map(Number)), WORD_RX)),
  f7HammingAllFlips: hammingFlips,
  f7HammingN: M_7[0].length,
  f7HammingK: M_7[0].length - gf2Rank(M_7.map((r) => [...r].map(Number))),
  f7HammingRate: (M_7[0].length - gf2Rank(M_7.map((r) => [...r].map(Number)))) / M_7[0].length,
  f7SimonPeriod110: Number(T_SIM.every((v, x) => v === T_SIM[x ^ 0b110]) && Math.max(...T_SIM.map((v) => preimageCount(T_SIM, v))) === 2),
  f7SimonRank: gf2Rank(ROWS_Y.map((r) => [...r].map(Number))),
  f7RankY: steps.rank,
  f7NullYVec: nullY.filter((v) => v !== 0)[0],
  f7NullYSize: nullY.length,
  f7PerpOf110: Array.from({ length: 8 }, (_, y) => dotMod2(y, 0b110)).filter((v) => v === 0).length,
  f7ReduceMoves: steps.steps.length,
  f7RankGF2Dep: gf2Rank(rowsDep),
  f7DetRealDep: detN(depMatrix).re,
  f7RankRealDep: rankN(depMatrix),
  f7RowsDepXor: parseBits(ROWS_DEP[0]) ^ parseBits(ROWS_DEP[1]),

  /* f7-cost */
  f7Sort10: pairwiseSortComparisons(10),
  f7Sq10: quadraticCost(10),
  f7SqDouble: quadraticCost(20) / quadraticCost(10),
  f7Exp10: exponentialCost(10),
  f7BigOn0: bigOThreshold(f0, quadraticCost, 4) ?? -1,
  f7BigOlast: bigORatio(7),
  f7Sq30: quadraticCost(30),
  f7Exp30: exponentialCost(30),
  f7Exp30Mant9: exponentialCost(30) / 1e9,
  f7Sq50: quadraticCost(50),
  f7Exp50Mant15: exponentialCost(50) / 1e15,
  f7Exp21over20: exponentialCost(21) / exponentialCost(20),
  f7Sq21minus20: quadraticCost(21) - quadraticCost(20),
  f7Dj10: djDeterministicWorst(10),
  f7Grover2e20: groverOptimalK(2 ** 20),
  f7Classical2e20: 2 ** 20 - 1,
  f7Exp20: exponentialCost(20),
  f7Sqrt2e20: rootExponentialCost(20),
  f7SqrtDoubles: rootExponentialCost(22) / rootExponentialCost(20),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
