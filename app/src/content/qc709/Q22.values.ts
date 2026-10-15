/**
 * Chapter Q22 numbers (Physics 709, "Stabilizers, CSS codes and Gottesman–Knill"), computed once with the engine. Plan: docs/roles/proposals/P-Q22-story.md;
 * rulings docs/roles/decisions/qc709-Q21Q22.md.
 *
 * Every number a learner reads in Q22 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q22.json (pipeline/claims_qc709/q22.py, an independent route: itertools over GF(2) words, dense 2ⁿ × 2ⁿ Pauli and gate matrices,
 * dense state vectors, exact Fractions; never physics/qec nor this file's helpers). Keys start with `q22` and are unique across all courses.
 *
 * Running examples. Classical: the [6, 2] code (basic words 111000, 000111; checks 110000, 101000, 000110, 000101) and F7's Hamming code with the check
 * matrix M₇. Quantum: the bit-flip code (n = 3, checks Z₁Z₂, Z₂Z₃), Shor's [[9,1,3]], the five-qubit code, Steane's [[7,1,3]]. A bit string that is a place pattern
 * (a syndrome, a row of a check matrix) is shown as text; the number behind it is the integer read in binary where a claim needs one. The tableau of the
 * phase-flip encoder, of the X measurement and of the bit-flip cycle is followed by tableauTrace and checked against a dense state vector in q22.test.ts.
 */
import { c, type C } from '../../physics/complex'
import { type Mat, identity, matmul } from '../../physics/linalg'
import { gf2RowReduceSteps } from '../../physics/qc/bits'
import { type Circuit, type Op, runCircuit } from '../../physics/qc/circuit'
import { H, S, T, pauliString } from '../../physics/qc/gates'
import { correctionOutcome, fiveQubitCode, lookupDecoder, repetitionCode, shorCode, stabilizerDistance, steaneCode } from '../../physics/qec/codes'
import { GF2Matrix } from '../../physics/qec/gf2'
import { Pauli } from '../../physics/qec/pauli'
import {
  cliffordClosure,
  cliffordConjugate,
  cosetState,
  decodeSingleFlip,
  hadamardImage,
  linearCode,
  linearCodeFromChecks,
  pseudoThreshold,
  sameStabilizerGroup,
  singleFlipSyndromes,
  tableauTrace,
} from '../../physics/qec/q22'
import { failuresByWeight, logicalFailure } from '../../physics/qec/rates'
import { StabilizerCode } from '../../physics/qec/stabilizer'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* Classical codes                                                                                  */
/* ---------------------------------------------------------------------------------------------- */
/** F7's check matrix of the [7, 4] Hamming code: column j is the number j in binary, the top row the most significant bit. */
export const M_7: readonly string[] = ['0001111', '0110011', '1010101']
/** The [6, 2] code: its two basic words (the columns of G) and its four checks (the rows of M). */
export const G_62: readonly string[] = ['111000', '000111']
export const M_62: readonly string[] = ['110000', '101000', '000110', '000101']
const C62 = linearCode(G_62)
const C62M = linearCodeFromChecks(M_62)
const HAM = linearCodeFromChecks(M_7)
const HAM_DUAL = HAM.dual()
const rows = (words: readonly string[]): number[][] => words.map((w) => [...w].map(Number))
const M62m = GF2Matrix.fromRows(rows(M_62), 6)
const M7m = GF2Matrix.fromRows(rows(M_7), 7)
const bin = (w: string): number => parseInt(w, 2)
const decoded62 = decodeSingleFlip(M_62, '011000')
const L3 = linearCode(['1001', '0101', '0011'])

/* ---------------------------------------------------------------------------------------------- */
/* Quantum codes                                                                                    */
/* ---------------------------------------------------------------------------------------------- */
export const BITFLIP = repetitionCode(3, 'bit-flip')
export const SHOR = shorCode()
export const STEANE = steaneCode()
export const FIVE = fiveQubitCode()
const BFS = BITFLIP.stabilizer()
const SHORS = SHOR.stabilizer()
const STEANES = STEANE.stabilizer()

const mat = (s: string): Mat => pauliString(s)
const scaled = (A: Mat, k: number): Mat => A.map((r) => r.map((z) => c(z.re * k, z.im * k)))
const addM = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((z, j) => c(z.re + B[i][j].re, z.im + B[i][j].im)))
const trace = (A: Mat): C => A.reduce((s, r, i) => c(s.re + r[i].re, s.im + r[i].im), c(0))
/** A Pauli string acting on the basis state |j⟩ (leftmost letter on the most significant bit): the state it lands on and the phase it picks up. */
const act = (s: string, j: number): { to: number; phase: C } => {
  const n = s.length
  let to = j
  let phase = c(1)
  for (let q = 0; q < n; q++) {
    const b = (j >> (n - 1 - q)) & 1
    const l = s[q]
    if (l === 'X' || l === 'Y') to ^= 1 << (n - 1 - q)
    if (l === 'Z' && b) phase = c(-phase.re, -phase.im)
    if (l === 'Y') phase = b ? c(phase.im, -phase.re) : c(-phase.im, phase.re) // × i for b = 0, × (−i) for b = 1
  }
  return { to, phase }
}
const cmul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
/** The commutator size max_j |(AB − BA)|j⟩| of two Pauli strings, found by acting on every basis ket (route A for every commutation claim; any n ≤ 9). */
const commGap = (a: string, b: string): number => {
  let gap = 0
  for (let j = 0; j < 2 ** a.length; j++) {
    const rb = act(b, j)
    const ra = act(a, rb.to)
    const ab = cmul(ra.phase, rb.phase) // A B |j⟩ = phase |to⟩
    const sa = act(a, j)
    const sb = act(b, sa.to)
    const ba = cmul(sb.phase, sa.phase)
    gap = Math.max(gap, Math.hypot(ab.re - ba.re, ab.im - ba.im))
  }
  return gap
}
/** Dense projector Π_j (I + s_j g_j)/2 onto the common eigenspace with signs s_j of the generators (+1 = pass). */
const projector = (gens: readonly Pauli[], signs: readonly number[]): Mat => {
  const n = gens[0].n
  let P = identity(2 ** n)
  gens.forEach((g, j) => {
    const G = scaled(mat(g.letters().join('')), signs[j])
    P = matmul(P, scaled(addM(identity(2 ** n), G), 0.5))
  })
  return P
}
const letters = (p: Pauli): string => p.letters().join('')
const single = (n: number, q: number, l: 'X' | 'Y' | 'Z'): Pauli => Pauli.single(n, q, l)

/** The 16 elements of the one-qubit Pauli group P₁ = {±1, ±i} × {I, X, Y, Z}, counted as distinct (phase, letter) pairs reached by products of X, Y, Z. */
const p1Elements = ((): number => {
  const seen = new Set<string>()
  let frontier: Pauli[] = [Pauli.identity(1)]
  seen.add(frontier[0].toString())
  while (frontier.length) {
    const next: Pauli[] = []
    for (const p of frontier)
      for (const l of ['X', 'Y', 'Z'] as const) {
        const q = p.mul(single(1, 0, l))
        if (!seen.has(q.toString())) {
          seen.add(q.toString())
          next.push(q)
        }
      }
    frontier = next
  }
  return seen.size
})()

/** All 256 ordered pairs of two-qubit Pauli strings: how many are classified differently by the symplectic product and by the dense commutator. */
const sympDisagree = ((): number => {
  const all: string[] = []
  for (const a of 'IXYZ') for (const b of 'IXYZ') all.push(a + b)
  let bad = 0
  for (const s of all)
    for (const t of all) {
      const sym = Pauli.parse(s).commutesWith(Pauli.parse(t))
      const dense = commGap(s, t) < 1e-9
      if (sym !== dense) bad++
    }
  return bad
})()

/** The weight-1 errors of n qubits as Paulis. */
const weight1 = (n: number): Pauli[] => {
  const out: Pauli[] = []
  for (let q = 0; q < n; q++) for (const l of ['X', 'Y', 'Z'] as const) out.push(single(n, q, l))
  return out
}
const STEANE_DEC = lookupDecoder(STEANES, 3)
const steaneOutcome = (e: Pauli) => correctionOutcome(STEANES, STEANE_DEC, e)
const steaneW1Fixed = weight1(7).filter((e) => steaneOutcome(e).outcome === 'corrected').length
/** CSS decoding: the X part and the Z part of an error are read by their own table (H_Z and H_X), so X_iZ_j is fixed when X_i and Z_j each are. */
const steaneXZ = (() => {
  const okX = Array.from({ length: 7 }, (_, i) => steaneOutcome(single(7, i, 'X')).outcome === 'corrected')
  const okZ = Array.from({ length: 7 }, (_, j) => steaneOutcome(single(7, j, 'Z')).outcome === 'corrected')
  let ok = 0
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (okX[i] && okZ[j]) ok++
  return ok
})()
const fiveSyn = new Set(weight1(5).map((e) => FIVE.syndrome(e).join('')))
fiveSyn.delete('0000')
const dist = (code: StabilizerCode): number => stabilizerDistance(code).lower
const shorGaps = (logical: string): number => Math.max(...SHORS.generators.map((g) => commGap(logical, letters(g))))
const bfGaps = (logical: string): number => Math.max(...BFS.generators.map((g) => commGap(logical, letters(g))))
const steaneGaps = (logical: string): number => Math.max(...STEANES.generators.map((g) => commGap(logical, letters(g))))

/* ---------------------------------------------------------------------------------------------- */
/* Circuits                                                                                         */
/* ---------------------------------------------------------------------------------------------- */
const gate = (g: 'H' | 'X' | 'Z', targets: number[], controls?: number[], cond?: { bits: number[]; equals: string }): Op => ({ op: 'gate', gate: g, targets, ...(controls ? { controls } : {}), ...(cond ? { cond } : {}) })
const cx = (a: number, b: number): Op => gate('X', [b], [a])
/** The phase-flip encoder on |000⟩: [CNOT 1→2], [CNOT 1→3], [H on all three]. */
export const C_ENC_PF: Circuit = { version: 1, qubits: 3, init: '000', columns: [[cx(0, 1)], [cx(0, 2)], [gate('H', [0]), gate('H', [1]), gate('H', [2])]] }
/** Measure X on qubit 1 of |000⟩: [H], [measure], [H]. */
export const C_MX: Circuit = { version: 1, qubits: 3, init: '000', clbits: 1, columns: [[gate('H', [0])], [{ op: 'measure', qubit: 0, bit: 0 }], [gate('H', [0])]] }
/** The bit-flip encoder of 0.6|0⟩ + 0.8|1⟩ on three wires: [Ry(θ)], [CNOT 1→2], [CNOT 1→3] (cos θ/2 = 0.6). */
const THETA_A = 2 * Math.acos(0.6)
export const C_ENC3: Circuit = { version: 1, qubits: 3, init: '000', columns: [[{ op: 'gate', gate: 'Ry', targets: [0], params: [THETA_A] }], [cx(0, 1)], [cx(0, 2)]] }
/** The bit-flip cycle on ψ = |0⟩ with a flip on qubit 2: encode, flip, four parity CNOTs into the helpers, measure the helpers, fix (9 columns, five wires). */
export const C_BF0_X2: Circuit = {
  version: 1,
  qubits: 5,
  init: '00000',
  clbits: 2,
  columns: [
    [cx(0, 1)],
    [cx(0, 2)],
    [gate('X', [1])],
    [cx(0, 3)],
    [cx(1, 3)],
    [cx(1, 4)],
    [cx(2, 4)],
    [{ op: 'measure', qubit: 3, bit: 0 }, { op: 'measure', qubit: 4, bit: 1 }],
    [gate('X', [0], undefined, { bits: [0, 1], equals: '10' }), gate('X', [1], undefined, { bits: [0, 1], equals: '11' }), gate('X', [2], undefined, { bits: [0, 1], equals: '01' })],
  ],
}

/** How many moves (row swaps and XORs) reduce the three rows of Z₁Z₂, Z₂Z₃, Z₁Z₃: the end of the `bits` reduce view. */
export const ROWS3_MOVES: number = gf2RowReduceSteps(rows(['000110', '000011', '000101'])).steps.length

/** The authored tableau rows of the stage `tableau` view for the encoder, after 0, 1, 2 and 3 columns (the engine's trace is asserted equal in Q22.test.ts). */
export const ENC_ROWS: readonly (readonly string[])[] = [
  ['ZII', 'IZI', 'IIZ'],
  ['ZII', 'ZZI', 'IIZ'],
  ['ZII', 'ZZI', 'ZIZ'],
  ['XII', 'XXI', 'XIX'],
]
const encTrace = tableauTrace(C_ENC_PF)
const trackOk = (k: number): boolean => sameStabilizerGroup(encTrace.steps[k], ENC_ROWS[k].map((r) => '+' + r))

/* ---------------------------------------------------------------------------------------------- */
/* Failure chances and the cost of simulating                                                       */
/* ---------------------------------------------------------------------------------------------- */
const failsX = failuresByWeight(STEANE, 'X')
/** Failures of the Steane code against X flips, by number of flips 0 … 7 (the polynomial of Unit 22.5). */
export const FAILS_X: readonly number[] = failsX
const tabBits = (n: number): number => n * (2 * n + 1)
const cycleRun = runCircuit(C_BF0_X2, { outcomes: '11' })
const tOnX = cliffordConjugate(T, 'X')
const coeff = (cj: { expansion: { pauli: string; re: number; im: number }[] }, p: string): number => cj.expansion.find((e) => e.pauli === p)?.re ?? 0
const hx = cliffordConjugate(H, 'X')
const sx = cliffordConjugate(S, 'X')
const sy = cliffordConjugate(S, 'Y')
const sz = cliffordConjugate(S, 'Z')
const cnotConj = cliffordConjugate(
  [
    [c(1), c(0), c(0), c(0)],
    [c(0), c(1), c(0), c(0)],
    [c(0), c(0), c(0), c(1)],
    [c(0), c(0), c(1), c(0)],
  ],
  'XI',
)
const hOver = cosetState(linearCode(M_7), '0000000')
const hImage = hadamardImage(hOver)
// (−iY)² as a dense matrix: −Y² = −I, so its trace over 2 is −1 (the slip in Bergou's Eq. 10.14)
const minusIY = ((): Mat => {
  const Y = mat('Y')
  return Y.map((r) => r.map((z) => c(z.im, -z.re)))
})()
const minusIYsq = trace(matmul(minusIY, minusIY)).re / 2

/* ---------------------------------------------------------------------------------------------- */
/* The values                                                                                       */
/* ---------------------------------------------------------------------------------------------- */
export const V = {
  // ---- q22-linear-codes
  q22G62Words: C62.words().length,
  q22Rate62: C62.rate,
  q22MG62: M62m.mul(C62.generator()).totalWeight(),
  q22Null62: C62M.words().length,
  q22D62: C62.distance(),
  q22Syn62: new Set(singleFlipSyndromes(M_62)).size,
  q22HamW3: HAM.weightEnumerator()[3],
  q22HamW4: HAM.weightEnumerator()[4],
  q22HamWords: HAM.words().length,
  q22DualWords: HAM_DUAL.words().length,
  q22DualD: HAM_DUAL.distance(),
  q22HamD: HAM.distance(),
  q22TwoFlip62: decoded62.place ?? 0,
  q22Wrong62: bin(decoded62.word) === bin('111000') ? [...decoded62.word].filter((b) => b === '1').length : 0,
  q22L3Words: L3.words().length,
  // ---- q22-stabilizer
  q22G1: p1Elements,
  q22XYisZ: Math.abs(1 - single(1, 0, 'X').mul(single(1, 0, 'Y')).phase),
  q22SBitflip: BFS.elements().length,
  q22VSdim: trace(projector(BFS.generators, [1, 1])).re,
  q22AntiX1: commGap('XII', 'ZZI') > 1e-9 ? 1 : 0,
  q22KBitflip: BITFLIP.k,
  q22KShor: SHOR.k,
  q22TrP: trace(projector(BFS.generators, [-1, 1])).re,
  q22SynX2: BFS.syndrome(single(3, 1, 'X')).filter((b) => b === 1).length,
  q22RankDep: GF2Matrix.fromRows(rows(['000110', '000011', '000101']), 6).rank(),
  q22SteaneDim: 2 ** STEANES.k,
  q22HalfKept: trace(scaled(addM(identity(8), mat('ZZI')), 0.5)).re / 8,
  // ---- q22-check-matrix
  q22RowSum: bin('000110') ^ bin('000011'),
  q22SympX1: Pauli.parse('XII').commutesWith(Pauli.parse('ZZI')) ? 0 : 1,
  q22SympAll: sympDisagree,
  q22Rank3: GF2Matrix.fromRows(rows(['000110', '000011', '000101']), 6).rank(),
  q22RankShor: SHORS.rank,
  q22LogZ1: bfGaps('ZII'),
  q22ShorZbar: shorGaps('XXXIIIIII'),
  q22ShorXbar: shorGaps('ZIIZIIZII'),
  q22DBitflip: dist(BFS),
  q22DShor: dist(SHORS),
  q22FiveD: dist(FIVE),
  q22RankFive: FIVE.rank,
  q22FiveRate: FIVE.k / FIVE.n,
  q22ShorRate: SHOR.k / SHOR.n,
  q22FiveSyn: fiveSyn.size,
  q22FiveSymp: Pauli.parse('XZZXI').commutesWith(Pauli.parse('IXZZX')) ? 0 : 1,
  // ---- q22-css
  q22SteaneHXHZ: M7m.mul(M7m.transpose()).totalWeight(),
  q22Overlap: [...'0001111'].filter((b, j) => b === '1' && '0110011'[j] === '1').length,
  q22KSteane: STEANE.k,
  q22ShorRankX: SHOR.rankX,
  q22ShorRankZ: SHOR.rankZ,
  q22SteaneAmp: hOver[0].amp,
  q22SteaneWords: hOver.length,
  q22SteaneH: hImage[0].amp,
  q22DSteane: dist(STEANES),
  q22SteaneAll1: steaneW1Fixed,
  q22SteaneXbar3: steaneGaps('XXXIIII'),
  q22Css62Fails: M62m.mul(M62m.transpose()).get(0, 1),
  q22E1Strict: dist(STEANES) > 2 * 1 + 1 ? 1 : 0,
  q22E1Ge: dist(STEANES) >= 2 * 1 + 1 ? 1 : 0,
  // ---- q22-decode
  q22SynX5: bin(M7m.mulVec(single(7, 4, 'X').x).join('')),
  q22Syn64: 2 ** STEANES.rank,
  q22SynY3: bin(M7m.mulVec(single(7, 2, 'Y').z).join('')),
  q22SteaneXZ: steaneXZ,
  q22TwoFlipSyn: bin(M7m.mulVec(single(7, 0, 'X').mul(single(7, 1, 'X')).x).join('')),
  q22Residual: bin(steaneOutcome(single(7, 0, 'X').mul(single(7, 1, 'X'))).residual!.x.join('')),
  q22PIn001: 0.01,
  q22PIn01: 0.1,
  q22PIn05: 0.05,
  q22PL001: logicalFailure(STEANE, 0.01, 'X'),
  q22PL01: logicalFailure(STEANE, 0.1, 'X'),
  q22PL005: logicalFailure(STEANE, 0.05, 'X'),
  q22PStar: pseudoThreshold(STEANE, 'X'),
  q22PLHalf: logicalFailure(STEANE, 0.5, 'X'),
  q22FailTotal: failsX.reduce((a, b) => a + b, 0),
  q22W3Fixed: 35 - failsX[3],
  // ---- q22-clifford
  q22HXH: Math.abs(coeff(hx, 'Z') - 1),
  q22SXS: Math.abs(coeff(sx, 'Y') - 1),
  q22SZS: Math.abs(coeff(sz, 'Z') - 1),
  q22SYSminusX: Math.abs(coeff(sy, 'X') + 1),
  q22SYSZ: Math.abs(coeff(sy, 'Z')),
  q22CnotX1: Math.abs(coeff(cnotConj, 'XX') - 1),
  q22Cliff24: cliffordClosure(1).size,
  q22TrackEnd: [0, 1, 2, 3].every(trackOk) ? 1 : 0,
  q22MeasX: runCircuit(C_MX, { outcomes: '0' }).prob,
  q22TXT: coeff(tOnX, 'X'),
  q22TXTY: coeff(tOnX, 'Y'),
  // ---- q22-gottesman-knill
  q22Tab10: tabBits(10),
  q22Tab50: tabBits(50),
  q22Tab100: tabBits(100),
  q22Amp20: 2 ** 20,
  q22Amp50Mant: 2 ** 50 / 1e15,
  q22Amp100Mant: 2 ** 100 / 1e30,
  q22TabSyn: cycleRun.prob,
  q22SteaneGens: new StabilizerCode([...STEANES.generators, Pauli.parse('ZZZZZZZ')]).rank,
  // ---- the corrections
  q22E4Square: minusIYsq,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
