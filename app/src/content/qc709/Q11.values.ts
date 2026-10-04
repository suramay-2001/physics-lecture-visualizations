/**
 * Chapter Q11 numbers (Physics 709, "Using entanglement: dense coding, teleportation, swapping"), computed once
 * with the engine. Plan: docs/roles/proposals/P-Q11-story.md; rulings docs/roles/decisions/qc709-Q10Q13.md.
 *
 * Every number a learner reads in Q11 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q11.json
 * (pipeline/claims_qc709/q11.py, an independent route). Keys start with `q11` and are unique across both courses.
 *
 * E2's `teleport.ts` is used directly (bellCycle, denseCode, teleport, swapIdentity, weylBell), cross-checked
 * against the independent `circuit.ts` route (runCircuit/branches) for the probabilities and the post-measurement
 * states, as the plan's §9.1 "already in the engine" notes describe.
 *
 * Stage-field note: `AmplitudesState` has no `inBasis` field (the plan's §9.2 assumed it would ship with the
 * matrix-v2 batch; it did not). Every `amp(...)` view below is drawn in the plain computational basis instead —
 * still engine-backed and still a distinct picture per step — with beat/derivation captions worded to match what is
 * actually drawn (see Q11.story.ts's header comment).
 */
import { apply, inner, type Mat, type Vec } from '../../physics/linalg'
import { abs } from '../../physics/complex'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { branches, runCircuit } from '../../physics/qc/circuit'
import { densityOf, fidelity, reducedBloch, reducedDensity, schmidt } from '../../physics/qc/density'
import { Ry, X, Z } from '../../physics/qc/gates'
import { bellMeasure } from '../../physics/qc/measure'
import { bell, BELL_BASIS, ket, kron } from '../../physics/qc/state'
import { bellCycle, denseCode, swapIdentity, teleport, weylBell } from '../../physics/qc/teleport'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* Circuits (plan §0 "Circuits"), built with Q8's own gate shorthand                                */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, param?: number): GateOp => ({ op: 'gate', gate, targets: [target], ...(param !== undefined ? { params: [param] } : {}) })
const cx = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'X', targets: [target], controls: [ctrl] })
const mOp = (qubit: number, bit: number) => ({ op: 'measure' as const, qubit, bit })
const condGate = (gate: GateOp['gate'], target: number, bit: number): GateOp => ({ op: 'gate', gate, targets: [target], cond: { bits: [bit], equals: '1' } })

/**
 * The Bell cycle, as a circuit: H, CNOT build Φ+, then the chosen Pauli acts on wire 0 (Alice) alone — matching
 * both the prose ("Alice does one gate on her qubit alone") and `teleport.ts bellCycle`'s own (op⊗I)|Φ+⟩
 * convention. (The plan's own circuit-shorthand table put the gate on wire 1; wire 0 is the one that agrees with
 * the text and the engine function, so that is what this build uses — a one-line correction, noted in the report.)
 */
export const C_CYCLE = (op: 'I' | 'X' | 'Y' | 'Z'): Circuit => ({ version: 1, qubits: 2, init: '00', wires: ['A', 'B'], columns: [[g('H', 0)], [cx(0, 1)], [g(op, 0)]] })

/** Dense coding: build Φ+, Alice's encoding gate on her qubit, then Bob's decode (CNOT, H, measure both). */
export const C_DC = (op: 'I' | 'X' | 'Y' | 'Z'): Circuit => ({
  version: 1,
  qubits: 2,
  clbits: 2,
  init: '00',
  wires: ['A', 'B'],
  columns: [[g('H', 0)], [cx(0, 1)], [g(op, 0)], [cx(0, 1)], [g('H', 0)], [mOp(0, 0), mOp(1, 1)]],
})

/** The teleported state |ψ⟩ = R_y(73.7°)|0⟩ ≈ 0.8|0⟩ + 0.6|1⟩ (plan §9.1), built on wire 0 of C_TELE. */
export const TELE_THETA_DEG = 73.7

/** Teleportation: |ψ⟩A1, a shared Φ+ (A2,B); CNOT + H on Alice's pair; measure both; classically controlled X, Z. */
export const C_TELE: Circuit = {
  version: 1,
  qubits: 3,
  clbits: 2,
  init: '000',
  wires: ['A1', 'A2', 'B'],
  columns: [
    [g('Ry', 0, TELE_THETA_DEG * DEG)],
    [g('H', 1)],
    [cx(1, 2)],
    [cx(0, 1)],
    [g('H', 0)],
    [mOp(0, 0), mOp(1, 1)],
    [condGate('X', 2, 1)],
    [condGate('Z', 2, 0)],
  ],
}

/** Entanglement swapping: two independent Φ+ pairs (A,B1) and (B2,C); Bob's own Bell measurement on B1,B2. */
export const C_SWAP: Circuit = {
  version: 1,
  qubits: 4,
  clbits: 2,
  init: '0000',
  wires: ['A', 'B1', 'B2', 'C'],
  columns: [[g('H', 0)], [cx(0, 1)], [g('H', 2)], [cx(2, 3)], [cx(1, 2)], [g('H', 1)], [mOp(1, 0), mOp(2, 1)]],
}

/* ---------------------------------------------------------------------------------------------- */
/* q11-bell-tools: the Bell cycle                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const PHI_PLUS: Vec = bell('Phi+')
const CYCLE_I = bellCycle('I')
const CYCLE_Z = bellCycle('Z')
const CYCLE_X = bellCycle('X')
const CYCLE_Y = bellCycle('Y')
/** Fidelity of each cycle result against the standard Bell state it is named for (the engine's own match). */
const fidTo = (ket1: Vec, name: string) => fidelity(ket1, BELL_BASIS.find((b) => b.name === name)!.ket)
const cycleIFid = fidTo(CYCLE_I.ket, 'Φ+')
const cycleZFid = fidTo(CYCLE_Z.ket, 'Φ−')
const cycleXFid = fidTo(CYCLE_X.ket, 'Ψ+')
const cycleYFid = fidTo(CYCLE_Y.ket, 'Ψ−')
/** The largest overlap between any two of the four cycle results (0 for an orthonormal set). */
const cycleKets = [CYCLE_I.ket, CYCLE_Z.ket, CYCLE_X.ket, CYCLE_Y.ket]
let cycleOrtho = 0
for (let i = 0; i < cycleKets.length; i++) for (let j = i + 1; j < cycleKets.length; j++) cycleOrtho = Math.max(cycleOrtho, abs(inner(cycleKets[i], cycleKets[j])))

/* ---------------------------------------------------------------------------------------------- */
/* q11-dense-coding                                                                                 */
/* ---------------------------------------------------------------------------------------------- */
const DC_I = denseCode('00')
const DC_Z = denseCode('10')
const DC_X = denseCode('01')
const DC_Y = denseCode('11')
/** Every encoding's Bell measurement reads back exactly the bits that encoded it (prob 1, every time). */
const dcProb = Math.min(DC_I.prob, DC_Z.prob, DC_X.prob, DC_Y.prob)
/** Bob's half before any message: the reduced state of either qubit of a Bell pair is maximally mixed. */
const bobHalfLen = norm3(reducedBloch(densityOf(PHI_PLUS), 1))
/** Eve, holding only Alice's sent qubit, sees the SAME maximally-mixed state whichever bits were sent. */
const eveHalfLen = Math.max(...[DC_I, DC_Z, DC_X, DC_Y].map((d1) => norm3(reducedBloch(densityOf(d1.encoded), 0))))

function norm3(r: readonly [number, number, number]): number {
  return Math.hypot(r[0], r[1], r[2])
}

/* ---------------------------------------------------------------------------------------------- */
/* q11-teleport-algebra / q11-teleport-circuit                                                      */
/* ---------------------------------------------------------------------------------------------- */
const PSI: Vec = apply(Ry(TELE_THETA_DEG * DEG), ket('0'))
const PSI_RHO: Mat = densityOf(PSI)
const PSI_R = reducedBloch(PSI_RHO, 0)

const TELE_00 = teleport(PSI, PHI_PLUS, '00')
const TELE_01 = teleport(PSI, PHI_PLUS, '01')
const TELE_10 = teleport(PSI, PHI_PLUS, '10')
const TELE_11 = teleport(PSI, PHI_PLUS, '11')
const teleP = TELE_00.prob
const teleProbsEqual = Math.max(...[TELE_00, TELE_01, TELE_10, TELE_11].map((t) => Math.abs(t.prob - 0.25)))
const teleFid = Math.min(TELE_00.fidelity, TELE_01.fidelity, TELE_10.fidelity, TELE_11.fidelity)
const teleFid10 = TELE_10.fidelity
const teleFid11 = TELE_11.fidelity
const bobPreLen = norm3(reducedBloch(TELE_00.bobPre, 0))

/** Bob's state BEFORE the correction, for each branch (the regrouping's four twisted copies of |ψ⟩). */
function twistedBob(outcome: '00' | '01' | '10' | '11'): Vec {
  const full = kron(PSI, PHI_PLUS)
  const READOUT: Record<string, string> = { 'Φ+': '00', 'Ψ+': '01', 'Φ−': '10', 'Ψ−': '11' }
  const branch = bellMeasure(full, 0, 1).find((o) => READOUT[o.name] === outcome)!
  return schmidt(branch.post!, [2]).a[0]
}
const bobTwisted00 = twistedBob('00')
const bobTwisted01 = twistedBob('01')
const bobTwisted10 = twistedBob('10')
const bobTwisted11 = twistedBob('11')
/** The twist each branch applies matches σ_xy = I, X, Z, ZX exactly (N&C Eq. 1.32). */
const twistFid00 = fidelity(bobTwisted00, PSI)
const twistFid01 = fidelity(bobTwisted01, apply(X, PSI))
const twistFid10 = fidelity(bobTwisted10, apply(Z, PSI))
const twistFid11 = fidelity(bobTwisted11, apply(Z, apply(X, PSI)))

/** Alice's data qubit after her measurement (outcome M1 = 1): a plain computational-basis state, not |ψ⟩. */
const TELE_RUN_10 = runCircuit(C_TELE, { outcomes: '10' })
const aliceGoneFid = fidelity(reducedDensity(TELE_RUN_10.states[6], [0]), densityOf(ket('1')))
/** The branches route (circuit.ts), independent of teleport.ts, agrees on every outcome's probability. */
const teleBranches = branches(C_TELE)
const teleBranchProbGap = Math.max(...teleBranches.map((b) => Math.abs(b.prob - 0.25)))

/* ---------------------------------------------------------------------------------------------- */
/* q11-swapping                                                                                     */
/* ---------------------------------------------------------------------------------------------- */
const SWAP_BRANCHES = swapIdentity(PHI_PLUS, PHI_PLUS)
const swapP = Math.min(...SWAP_BRANCHES.map((b) => b.prob))
const swapProbGap = Math.max(...SWAP_BRANCHES.map((b) => Math.abs(b.prob - 0.25)))
/** Every branch's A–C state is EXACTLY the Bell state matching Bob's own outcome (Bergou Eq. 3.21, Φ+ resources). */
const swapAcFidMin = Math.min(...SWAP_BRANCHES.map((b) => fidelity(b.ac, BELL_BASIS.find((x) => x.name === b.name)!.ket)))
const swap00 = SWAP_BRANCHES.find((b) => b.outcome === '00')!
const swapAc00Fid = fidelity(swap00.ac, bell('Phi+'))

/** The circuit route (branches on C_SWAP) agrees with the algebra route (swapIdentity) on every branch's A–C state. */
const SWAP_CIRCUIT_BRANCHES = branches(C_SWAP)
const swapCircuitAlgebraGap = Math.max(
  ...SWAP_CIRCUIT_BRANCHES.map((cb) => {
    // states[7]: after column 7, the LAST column (Bob's two measurements) — A, C's post-collapse state.
    const ac = schmidt(cb.states[7], [0, 3]).a[0]
    const matching = SWAP_BRANCHES.find((ab) => ab.outcome === cb.bits)!
    return 1 - fidelity(ac, matching.ac)
  }),
)

/* ---------------------------------------------------------------------------------------------- */
/* q11-qudit: the Weyl–Bell basis (Formal aside)                                                    */
/* ---------------------------------------------------------------------------------------------- */
/** max_{(n,m)≠(n',m')} |⟨χ_{n,m}|χ_{n',m'}⟩|, and max_{(n,m)} ||⟨χ_{n,m}|χ_{n,m}⟩| − 1| : both ≈ 0 ⇒ orthonormal. */
function weylGramGap(N: number): number {
  const states: Vec[] = []
  for (let n = 0; n < N; n++) for (let m = 0; m < N; m++) states.push(weylBell(N, n, m))
  let gap = 0
  for (let i = 0; i < states.length; i++)
    for (let j = 0; j < states.length; j++) {
      const target = i === j ? 1 : 0
      gap = Math.max(gap, Math.abs(abs(inner(states[i], states[j])) - target))
    }
  return gap
}
const weylGram2Gap = weylGramGap(2)
const weylGram3Gap = weylGramGap(3)
/** For N = 2 the Weyl–Bell basis IS the ordinary Bell basis (up to the engine's own phase convention). */
const weylMatchesBell2 = Math.min(
  fidelity(weylBell(2, 0, 0), bell('Phi+')),
  fidelity(weylBell(2, 1, 0), bell('Phi-')),
  fidelity(weylBell(2, 0, 1), bell('Psi+')),
  fidelity(weylBell(2, 1, 1), bell('Psi-')),
)

/* ---------------------------------------------------------------------------------------------- */
/* Exported non-V engine objects (for use in Q11.ts challenges, Q11.story.ts stage views)           */
/* ---------------------------------------------------------------------------------------------- */
export { PHI_PLUS, PSI, PSI_R, bobTwisted00, bobTwisted01, bobTwisted10, bobTwisted11 }

export const V = {
  /* reusable constants (recurring exact values, as Q8's q8Half / q8Quarter) */
  q11Half: 0.5,
  q11Quarter: 0.25,
  q11One: 1,

  /* q11-bell-tools */
  q11CycleI: cycleIFid,
  q11CycleZ: cycleZFid,
  q11CycleX: cycleXFid,
  q11CycleY: cycleYFid,
  q11CycleOrtho: cycleOrtho,

  /* q11-dense-coding */
  q11DCbits: 2,
  q11DCprob: dcProb,
  q11BobHalf: bobHalfLen,
  q11EveHalf: eveHalfLen,

  /* q11-teleport-algebra */
  q11TeleP: teleP,
  q11TeleProbsEqual: teleProbsEqual,
  q11TeleFid: teleFid,
  q11TeleFid10: teleFid10,
  q11TeleFid11: teleFid11,
  q11TwistFid00: twistFid00,
  q11TwistFid01: twistFid01,
  q11TwistFid10: twistFid10,
  q11TwistFid11: twistFid11,

  /* q11-teleport-circuit */
  q11BobPre: bobPreLen,
  q11BobPostRx: PSI_R[0],
  q11BobPostRz: PSI_R[2],
  q11AliceGone: aliceGoneFid,
  q11TeleBranchProbGap: teleBranchProbGap,

  /* q11-swapping */
  q11SwapP: swapP,
  q11SwapProbGap: swapProbGap,
  q11SwapAcFidMin: swapAcFidMin,
  q11SwapAc00: swapAc00Fid,
  q11SwapCircuitAlgebraGap: swapCircuitAlgebraGap,

  /* q11-qudit */
  q11WeylOrtho2: weylGram2Gap,
  q11WeylOrtho3: weylGram3Gap,
  q11WeylCount3: 9,
  q11WeylMatchesBell2: weylMatchesBell2,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
