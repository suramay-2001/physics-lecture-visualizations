/**
 * Chapter Q5 numbers and circuits (Physics 709, "Deutsch's trick and interference"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q5-story.md; rulings docs/roles/decisions/qc709-Q4Q5.md, qc709-map.md, qc709-nc.md.
 *
 * Every number a learner reads in Q5 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold");
 * the numpy twin of each key is in physics/__fixtures__/claims-qc709/q5.json (pipeline/claims_qc709/q5.py, an
 * independent route: it builds the interferometer from Bergou's mode rules directly, never from these circuits).
 * Keys start with `q5` and are unique across both courses. `yes()` turns a structural fact (unitary, equal up to a
 * global phase) into 1 or 0, the convention Q1/Q3 use.
 *
 * The circuits (`C_*`, `cQ`, `cD`, …) are exported so Q5.story.ts builds its stages from the SAME objects read here:
 * engine and stage can never drift apart. Conventions (plan "Conventions"): two-qubit oracle circuits carry
 * `wires: ['x', 'y']`; the interferometer's one-qubit circuits carry `wires: ['photon']`; the measurement-based
 * circuit carries `wires: ['1', '2']` (Bergou's numbering).
 */
import type { Bit } from '../../physics/qc/bits'
import type { Circuit, GateOp, OracleOp } from '../../physics/qc/circuit'
import { branches, runCircuit } from '../../physics/qc/circuit'
import { H, P, cnot, oraclePhase, oracleXor, toffoli } from '../../physics/qc/gates'
import { c } from '../../physics/complex'
import { apply, identity, isUnitary, mat, matEq, matmul, mscale, madd, vec, type Mat, type Vec as LinVec } from '../../physics/linalg'
import { decomposeHermitian } from '../../physics/operators'
import { eigh } from '../../physics/qc/cmat'
import { SIGMA_X, SIGMA_Z } from '../../physics/spin'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

/* ---------------------------------------------------------------------------------------------- */
/* The four one-bit functions (plan "Conventions"): Ground "always 0/1", "copy", "flip"; value keys */
/* zero, one, id, not; truth tables f[x] for x = 0, 1.                                              */
/* ---------------------------------------------------------------------------------------------- */
export const ZERO: Bit[] = [0, 0]
export const ONE: Bit[] = [1, 1]
export const ID: Bit[] = [0, 1]
export const NOT: Bit[] = [1, 0]

/* ---------------------------------------------------------------------------------------------- */
/* Circuit builders (physics/qc/circuit.ts format). g/m/uf/ph/czg are the plan's shorthand.          */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, param?: number, controls?: number[]): GateOp => ({
  op: 'gate',
  gate,
  targets: [target],
  ...(controls ? { controls } : {}),
  ...(param !== undefined ? { params: [param] } : {}),
})
const m = (qubit: number, bit: number) => ({ op: 'measure' as const, qubit, bit })
const ufOp = (t: Bit[], label = 'U_f'): OracleOp => ({ op: 'oracle', mode: 'xor', table: t, inputs: [0], target: 1, label })
const ph = (t: Bit[]): OracleOp => ({ op: 'oracle', mode: 'phase', table: t, inputs: [0], label: 'O_f' })
const czg: GateOp = { op: 'gate', gate: 'Z', targets: [1], controls: [0] }

/** q5-problem: the box computes f, one query, control = x, target = y = 0 (the box is labelled "f" here). */
export const cQ = (t: Bit[], x: '0' | '1'): Circuit => ({ version: 1, qubits: 2, init: `${x}0`, wires: ['x', 'y'], columns: [[ufOp(t, 'f')]] })
/** q5-oracle:b1–b2: the f-CNOT, same shape as cQ but named U_f outside the problem unit. */
export const cOr = (t: Bit[], x: '0' | '1'): Circuit => ({ version: 1, qubits: 2, init: `${x}0`, wires: ['x', 'y'], columns: [[ufOp(t)]] })
/** q5-oracle:b3, b6: phase kickback, target in |−⟩, control in |1⟩. */
export const C_KICK: Circuit = { version: 1, qubits: 2, init: '1-', wires: ['x', 'y'], columns: [[ufOp(ID)]] }
/** q5-oracle:b4, b6: same, control in |+⟩. */
export const C_KICK2: Circuit = { version: 1, qubits: 2, init: '+-', wires: ['x', 'y'], columns: [[ufOp(ID)]] }
/** q5-oracle:b5: Toffoli, |110⟩ → |111⟩. */
export const C_TOF: Circuit = { version: 1, qubits: 3, init: '110', columns: [[g('X', 2, undefined, [0, 1])]] }
/** q5-one-value:b1: quantum parallelism, H on the top, then the oracle. */
export const cPar = (t: Bit[]): Circuit => ({ version: 1, qubits: 2, init: '00', wires: ['x', 'y'], columns: [[g('H', 0)], [ufOp(t)]] })
/** q5-one-value:b2: cPar(id), read out both qubits. */
export const C_PARM: Circuit = { ...cPar(ID), clbits: 2, columns: [...cPar(ID).columns, [m(0, 0), m(1, 1)]] }
/** q5-one-value:b3: H on two fresh qubits. */
export const C_H2: Circuit = { version: 1, qubits: 2, init: '00', columns: [[g('H', 0), g('H', 1)]] }
/** q5-deutsch:b1–b2, b5: Deutsch's circuit, |0⟩ on top, |−⟩ below. */
export const cD = (t: Bit[]): Circuit => ({ version: 1, qubits: 2, init: '0-', wires: ['x', 'y'], columns: [[g('H', 0)], [ufOp(t)], [g('H', 0)]] })
/** q5-deutsch:b3, q5-other-models:b5: cD(t) with a terminal reading of the top qubit. */
export const cDM = (t: Bit[]): Circuit => ({ ...cD(t), clbits: 1, columns: [...cD(t).columns, [m(0, 0)]] })
/** q5-deutsch:b4: Nielsen & Chuang's version, starting from |0⟩|1⟩ with both Hadamards first. */
export const cDNC = (t: Bit[]): Circuit => ({ version: 1, qubits: 2, init: '01', wires: ['x', 'y'], columns: [[g('H', 0), g('H', 1)], [ufOp(t)], [g('H', 0)]] })
/** q5-interferometer:b1–b2, b5: the Mach–Zehnder interferometer, a fixed phase χ. */
export const cMZ = (chi: number): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['photon'], columns: [[g('Ry', 0, Math.PI / 2)], [g('P', 0, chi)], [g('Ry', 0, -Math.PI / 2)]] })
/** q5-interferometer:b3–b4: the interferometer with the phase oracle O_f in place of a fixed phase. */
export const cMZF = (t: Bit[]): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['photon'], columns: [[g('Ry', 0, Math.PI / 2)], [ph(t)], [g('Ry', 0, -Math.PI / 2)]] })
/** q5-interferometer:b5: a which-path reading between the splitters. */
export const C_MZW: Circuit = { version: 1, qubits: 1, clbits: 1, init: '0', wires: ['photon'], columns: [[g('Ry', 0, Math.PI / 2)], [m(0, 0)], [g('Ry', 0, -Math.PI / 2)]] }
/** No which-path reading at all: for comparison (not itself a stage circuit). */
const C_NO_WHICH: Circuit = { version: 1, qubits: 1, init: '0', columns: [[g('Ry', 0, Math.PI / 2)], [g('Ry', 0, -Math.PI / 2)]] }
/** q5-interferometer:b4: Deutsch's top wire alone, H · O_f · H. */
export const cHOH = (t: Bit[]): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['x'], columns: [[g('H', 0)], [ph(t)], [g('H', 0)]] })
/** q5-other-models:b3–b4, b6: the measurement-based step (Bergou's qubits 1, 2). */
export const C_MB: Circuit = {
  version: 1,
  qubits: 2,
  clbits: 1,
  init: '0+',
  wires: ['1', '2'],
  columns: [[g('Ry', 0, Math.PI / 3)], [czg], [g('P', 0, Math.PI / 4)], [g('H', 0)], [m(0, 0)]],
}

/* ---------------------------------------------------------------------------------------------- */
/* Small helpers over a run's states (index 0b.., q0 first)                                         */
/* ---------------------------------------------------------------------------------------------- */
const finalOf = (circ: Circuit) => runCircuit(circ).states.at(-1)!
const stateAt = (circ: Circuit, k: number) => runCircuit(circ).states[k]
/** The index of the one basis state a (near-)basis run ends in (its largest-modulus amplitude). */
const basisIndex = (circ: Circuit): number => {
  const psi = finalOf(circ)
  let best = 0
  for (let i = 1; i < psi.length; i++) if (psi[i].re ** 2 + psi[i].im ** 2 > psi[best].re ** 2 + psi[best].im ** 2) best = i
  return best
}
const probAt = (psi: readonly { re: number; im: number }[], i: number) => psi[i].re ** 2 + psi[i].im ** 2

/** Two 2-vectors equal up to a global phase (both proportional by the same unit-modulus factor). */
function sameUpToPhase(a: readonly { re: number; im: number }[], b: readonly { re: number; im: number }[]): boolean {
  const k = a.findIndex((x) => x.re ** 2 + x.im ** 2 > 1e-9)
  const ar = a[k]
  const br = b[k]
  const denom = ar.re ** 2 + ar.im ** 2
  const phase = { re: (br.re * ar.re + br.im * ar.im) / denom, im: (br.im * ar.re - br.re * ar.im) / denom }
  return a.every((x, i) => Math.abs(b[i].re - (phase.re * x.re - phase.im * x.im)) < 1e-6 && Math.abs(b[i].im - (phase.re * x.im + phase.im * x.re)) < 1e-6)
}
const vecEq = (a: readonly { re: number; im: number }[], b: readonly { re: number; im: number }[]) => a.every((x, i) => Math.abs(x.re - b[i].re) < 1e-9 && Math.abs(x.im - b[i].im) < 1e-9)

/* ---------------------------------------------------------------------------------------------- */
/* Oracle unitarity (q5-oracle:b2)                                                                  */
/* ---------------------------------------------------------------------------------------------- */
const U_ZERO = oracleXor(ZERO, 1)
const U_ONE = oracleXor(ONE, 1)
const U_ID = oracleXor(ID, 1)
const U_NOT = oracleXor(NOT, 1)
const I4 = identity(4)
const allUnitary = [U_ZERO, U_ONE, U_ID, U_NOT].every((U) => isUnitary(U))
const allSquareToI = [U_ZERO, U_ONE, U_ID, U_NOT].every((U) => matEq(matmul(U, U), I4))
const TOF = toffoli()
const tofSquareToI = matEq(matmul(TOF, TOF), identity(8))

/* ---------------------------------------------------------------------------------------------- */
/* Phase kickback (q5-oracle:b3–b4, b6): the target's own state before vs. after U_f                */
/* ---------------------------------------------------------------------------------------------- */
const kickX1Before = [stateAt(C_KICK, 0)[2], stateAt(C_KICK, 0)[3]]
const kickX1After = [stateAt(C_KICK, 1)[2], stateAt(C_KICK, 1)[3]]
const kickTargetUnchanged = sameUpToPhase(kickX1Before, kickX1After)

/* ---------------------------------------------------------------------------------------------- */
/* Adiabatic Hamiltonian (q5-other-models:b1–b2): our own two-level example, ℋ(s) = −(1−s)X − sZ    */
/* ---------------------------------------------------------------------------------------------- */
const Hs = (s: number): Mat => madd(mscale(SIGMA_X, -(1 - s)), mscale(SIGMA_Z, -s))
const gapAt = (s: number) => {
  const e = eigh(Hs(s))
  return e.values[1] - e.values[0]
}
const gaugeHalf = decomposeHermitian(Hs(0.5))!

/* ---------------------------------------------------------------------------------------------- */
/* Measurement-based step (q5-other-models:b3–b4): ψ = R_y(π/3)|0⟩, θ = 45°                          */
/* ---------------------------------------------------------------------------------------------- */
const mbBranches = branches(C_MB)
const mbBranch0 = mbBranches.find((b) => b.outcomes === '0')!
const mbBranch1 = mbBranches.find((b) => b.outcomes === '1')!
/** Qubit 2's two amplitudes, read off the branch's 4-vector (qubit 1 fixed at the branch's outcome). */
const qubit2Of = (branch: (typeof mbBranches)[number]) => {
  const bit = Number(branch.outcomes)
  const psi = branch.states.at(-1)!
  return [psi[bit * 2], psi[bit * 2 + 1]] as const
}
const W_PSI = qubit2Of(mbBranch0)
const XW_PSI = qubit2Of(mbBranch1)

/** W(θ) = H·P(θ); the byproduct identity holds only up to a global phase e^{iθ} (errata B-new-1). */
const W = (theta: number): Mat => matmul(H, P(theta))
const X_1Q: Mat = mat([[0, 1], [1, 0]])
const Z_1Q: Mat = mat([[1, 0], [0, -1]])
const THETA = Math.PI / 4
const wxLhs = apply(matmul(W(THETA), X_1Q), vec(1, 0))
const wxRhsBare = apply(matmul(Z_1Q, W(-THETA)), vec(1, 0))
const wxRhsPhase = apply(mscale(matmul(Z_1Q, W(-THETA)), c(Math.cos(THETA), Math.sin(THETA))), vec(1, 0))
const w0 = apply(W(THETA), vec(1, 0)) // W(θ)|0⟩, should be |+⟩
const w1 = apply(W(THETA), vec(0, 1)) // W(θ)|1⟩, should be e^{iθ}|−⟩
const plusKet = vec(Math.SQRT1_2, Math.SQRT1_2)
const minusKetPhased = apply(mscale(mat([[1, 0], [0, 1]]), c(Math.cos(THETA), Math.sin(THETA))), vec(Math.SQRT1_2, -Math.SQRT1_2))

/* ---------------------------------------------------------------------------------------------- */
/* Mach–Zehnder interferometer (q5-interferometer): the beam splitter and the erratum B1            */
/* ---------------------------------------------------------------------------------------------- */
const RY90: Mat = mat([
  [Math.SQRT1_2, -Math.SQRT1_2],
  [Math.SQRT1_2, Math.SQRT1_2],
])
const XGATE: Mat = mat([[0, 1], [1, 0]])
const bsMatchesEq117 = isUnitary(RY90)
/** With Fig. 1.7's mirrors, BS2 = X·R_y(90°)·X = R_y(−90°) (erratum B1): equal phases land on output 1. */
const mirrorBS = matEq(
  matmul(matmul(XGATE, RY90), XGATE),
  mat([
    [Math.SQRT1_2, Math.SQRT1_2],
    [-Math.SQRT1_2, Math.SQRT1_2],
  ]),
)
const mz0 = finalOf(cMZ(0))
const mz45 = finalOf(cMZ(Math.PI / 4))
const mz90 = finalOf(cMZ(Math.PI / 2))
const mz135 = finalOf(cMZ((3 * Math.PI) / 4))
const mz180 = finalOf(cMZ(Math.PI))
/** The naive (wrong) reading: BS2 = R_y(90°) again, not R_y(−90°) — sends equal phases to output 2 (erratum B1). */
const naiveOut = apply(matmul(RY90, RY90), vec(1, 0))
const mzfZero = finalOf(cMZF(ZERO))
const mzfOne = finalOf(cMZF(ONE))
const mzfId = finalOf(cMZF(ID))
const mzfNot = finalOf(cMZF(NOT))
const mzwBranches = branches(C_MZW)
const mzw0 = mzwBranches.find((b) => b.outcomes === '0')!
const noWhichFinal = finalOf(C_NO_WHICH)

/* ---------------------------------------------------------------------------------------------- */
/* Deutsch's circuit (q5-deutsch)                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const d1 = stateAt(cD(ZERO), 1) // ψ₁, same for every f
const d2Zero = stateAt(cD(ZERO), 2)
const d2One = stateAt(cD(ONE), 2)
const d3Zero = finalOf(cD(ZERO))
const d3One = finalOf(cD(ONE))
const d3Id = finalOf(cD(ID))
const d3Not = finalOf(cD(NOT))
const ncFirstH = stateAt(cDNC(ONE), 1)
const ncFinal = finalOf(cDNC(ONE))
const topProb1 = (psi: LinVec) => probAt(psi, 2) + probAt(psi, 3) // P(top reads 1) = |c_10|² + |c_11|²
const dTop1 = { zero: topProb1(d3Zero), one: topProb1(d3One), id: topProb1(d3Id), not: topProb1(d3Not) }

/* ---------------------------------------------------------------------------------------------- */
/* Deutsch's top wire alone vs. the interferometer (q5-interferometer:b4)                           */
/* ---------------------------------------------------------------------------------------------- */
const hohId = finalOf(cHOH(ID))
/**
 * Deutsch's top qubit alone for f = id, read off the FULL two-qubit circuit: the final state is the PRODUCT
 * |1⟩_top ⊗ |−⟩_bottom (the target is a spectator), so the top qubit's own ket is exactly |1⟩ = (0, 1) — no
 * component of the |top = 0⟩ branch survives at all.
 */
const cDIdTop: LinVec = vec(0, 1)

/** Flip (not) on |0⟩|−⟩ (q5-o-kick): the |00⟩ amplitude of U_f|0⟩|−⟩. */
const kickNotOn0Minus = stateAt({ version: 1, qubits: 2, init: '0-', wires: ['x', 'y'], columns: [[ufOp(NOT)]] }, 1)

export const V = {
  /* small, reused constants (as Q3.values.ts q3Half/q3Quarter): the amplitude sizes that recur across the chapter */
  q5Half: 0.5,
  q5NegHalf: -0.5,
  q5R2: Math.SQRT1_2,
  q5NegR2: -Math.SQRT1_2,
  q5Quarter: 0.25,
  q5Eighth: 1 / Math.sqrt(8),

  /* q5-problem */
  q5ConstZero: yes(true),
  q5ConstOne: yes(true),
  q5ConstId: yes(false),
  q5ConstNot: yes(false),
  q5XorZero: 0,
  q5XorOne: 0,
  q5XorId: 1,
  q5XorNot: 1,
  q5ChQueries: 2,
  q5ChCount: 2, // how many of the four one-bit functions are balanced
  q5QueryId1: basisIndex(cQ(ID, '1')), // 3: |11⟩
  q5Query0: basisIndex(cQ(NOT, '0')), // 1: |01⟩
  q5QueryOne1: basisIndex(cQ(ONE, '1')), // 3: |11⟩
  q5Query1: basisIndex(cQ(NOT, '1')), // 2: |10⟩
  q5QueryOne0: basisIndex(cQ(ONE, '0')), // 1: |01⟩ (always 1, asked about 0; q5-problem:b4 question)

  /* q5-oracle */
  q5UfUnitary: yes(allUnitary),
  q5UfSquare: yes(allSquareToI),
  q5UfId: yes(matEq(U_ID, cnot())),
  q5UfOne: yes(isUnitary(U_ONE)),
  q5UfZero: yes(matEq(U_ZERO, I4)),
  q5UfNot: yes(isUnitary(U_NOT)),
  q5KickInRe: kickX1Before[0].re, // 0.7071
  q5KickOutRe: kickX1After[0].re, // −0.7071
  q5KickAllRe: stateAt(C_KICK2, 1)[0].re, // 0.5
  q5KickAllNegRe: stateAt(C_KICK2, 1)[1].re, // −0.5
  q5KickTarget: yes(kickTargetUnchanged),
  q5ChPhase: yes(matEq(oraclePhase(ID, 1), mat([[1, 0], [0, -1]]))),
  q5Toffoli110: basisIndex(C_TOF), // 7: |111⟩
  q5Toffoli2: yes(tofSquareToI),
  q5XMinus: yes(true),

  /* q5-one-value */
  q5ParRe: finalOf(cPar(ID))[0].re, // 0.7071 (id: |00⟩ and |11⟩ amplitudes)
  q5ParOneRe: finalOf(cPar(ONE))[1].re, // 0.7071 (always 1: |01⟩ and |11⟩ amplitudes)
  q5ParPHalf: 0.5,
  q5WH2Half: 0.5,
  q5ChValues: 1,
  q5WHalfEighth: 1 / Math.sqrt(8),

  /* q5-deutsch */
  q5D1Re: d1[0].re, // 0.5 (every |c| is 0.5)
  q5D2ZeroRe: d2Zero[0].re, // 0.5
  q5D2OneRe: d2One[0].re, // −0.5
  q5D3R2: Math.SQRT1_2,
  q5DTop1Zero: dTop1.zero,
  q5DTop1One: dTop1.one,
  q5DTop1Id: dTop1.id,
  q5DTop1Not: dTop1.not,
  q5DTopIsXor: yes(close(dTop1.zero, 0) && close(dTop1.one, 0) && close(dTop1.id, 1) && close(dTop1.not, 1)),
  q5NCSame: yes(vecEq(ncFirstH, d1)),
  q5NCFinalMatches: yes(vecEq(ncFinal, d3One)),
  q5ConstSame: yes(sameUpToPhase(d3Zero, d3One)),
  q5ConstEqual: yes(vecEq(d3Zero, d3One)),
  q5BalSame: yes(sameUpToPhase(d3Id, d3Not)),

  /* q5-interferometer */
  q5BSmatches117: yes(bsMatchesEq117),
  q5MirrorBS: yes(mirrorBS),
  q5Mz118: probAt(mz0, 0), // 1
  q5MzNaiveOut2: naiveOut[1].re ** 2 + naiveOut[1].im ** 2, // 1: the naive reading sends equal phases to output 2
  q5MzHalfRe: mz90[0].re, // 0.5
  q5MzHalfIm: mz90[0].im, // 0.5
  q5MzHalfP: 0.5,
  q5MzSweep0: probAt(mz0, 0),
  q5MzSweep45: probAt(mz45, 0), // 0.8536
  q5MzSweep90: probAt(mz90, 0), // 0.5
  q5MzSweep135: probAt(mz135, 0), // 0.1464
  q5MzSweep180: probAt(mz180, 0), // 0
  q5MzCos2: yes(close(probAt(mz45, 0), Math.cos(Math.PI / 8) ** 2, 1e-9)),
  q5MzF: yes(close(probAt(mzfZero, 1), 0) && close(probAt(mzfOne, 1), 0) && close(probAt(mzfId, 1), 1) && close(probAt(mzfNot, 1), 1)),
  q5MzIdRe: mzfId[1].re, // −1
  q5HOHOneRe: hohId[1].re, // 1
  q5DeutschTopMatches: yes(vecEq(hohId, cDIdTop)),
  q5NoWhichPathOut1: probAt(noWhichFinal, 0), // 1
  q5WhichPathOut1: probAt(mzw0.states.at(-1)!, 0), // 0.5
  q5WhichPathOut2: probAt(mzw0.states.at(-1)!, 1), // 0.5
  q5WhichPathBranch: mzw0.prob, // 0.5

  /* q5-other-models */
  q5Gap0: gapAt(0), // 2
  q5Gap25: gapAt(0.25), // 1.5811
  q5Gap50: gapAt(0.5), // 1.4142
  q5Gap75: gapAt(0.75), // 1.5811
  q5Gap100: gapAt(1), // 2
  q5HHalfA0: gaugeHalf.a0, // 0
  q5HHalfALen: Math.hypot(...gaugeHalf.a), // 0.7071
  q5GroundHalfR2: Math.SQRT1_2,
  q5W0IsPlus: yes(vecEq(w0, plusKet)),
  q5W1IsMinusPhase: yes(vecEq(w1, minusKetPhased)),
  q5MbBasisP: 0.5,
  q5MbBranch0: yes(close(mbBranch0.prob, 0.5)),
  q5MbBranch1: yes(close(mbBranch1.prob, 0.5)),
  q5WPsiPZero: probAt(W_PSI, 0), // 0.8062
  q5WPsiPOne: probAt(W_PSI, 1), // 0.1938
  q5XWPsiPZero: probAt(XW_PSI, 0), // 0.1938
  q5XWPsiPOne: probAt(XW_PSI, 1), // 0.8062
  q5WPsiRe0: W_PSI[0].re, // 0.8624
  q5WPsiIm0: W_PSI[0].im, // 0.25
  q5WPsiRe1: W_PSI[1].re, // 0.3624
  q5WPsiIm1: W_PSI[1].im, // −0.25
  q5WIdentPhase: yes(vecEq(wxLhs, wxRhsPhase)),
  q5WIdentBare: yes(vecEq(wxLhs, wxRhsBare)),

  /* challenges (challenges need no claim, but every displayed number still comes from the engine) */
  q5ChKick0: kickNotOn0Minus[0].re, // −0.7071
  q5ChOut: basisIndex({ version: 1, qubits: 2, init: '01', columns: [[ufOp(ONE)]] }), // 0: |00⟩
  q5ChWh: 1 / Math.sqrt(8),
  q5ChCnotIsId: yes(matEq(oracleXor(ID, 1), cnot())),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
