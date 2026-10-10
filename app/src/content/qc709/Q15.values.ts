/**
 * Chapter Q15 numbers (Physics 709, "Secret keys from quantum rules"), computed once with the engine. Plan: docs/roles/proposals/P-Q15-story.md;
 * rulings docs/roles/decisions/qc709-Q15Q17.md.
 *
 * Every number a learner reads in Q15 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q15.json (pipeline/claims_qc709/q15.py, an independent route: explicit state vectors and 4 × 4 matrices, Kraus sums
 * and an SVD trace norm; never physics/qc/crypto.ts, never povm.ts's helpers). Keys start with `q15` and are unique across both courses.
 *
 * Running examples. B92: bit 0 is |0⟩, bit 1 is |+⟩ (overlap 0.7071). Secret sharing: θ = 22.5°, where Charlie's two states overlap exactly as B92's
 * do. The Eq. 6.6 correction and the σ_z-defence correction are each backed by an engine computation of the discrepancy (`V.q15Eq66…`, `V.q15Cheat…`).
 * Values the engine returns as tiny floating noise around an exact 0 (a gap of 2e-16) are snapped to 0 here (`snap0`), never typed.
 */
import { c } from '../../physics/complex'
import { type Vec, inner } from '../../physics/linalg'
import { bb84Q } from '../../physics/bb84'
import { type Circuit, type GateOp, runCircuit } from '../../physics/qc/circuit'
import { eigh } from '../../physics/qc/cmat'
import { B92_STATES, b92Circuit, b92Overlap, b92Rates, caesar, charlieKets, eq66Check, probeAttack, probeCircuit, shareCircuit, shareSplit, shareThetaFor, sharingCheat, xorBits } from '../../physics/qc/crypto'
import { densityOf, reducedBloch, traceNorm } from '../../physics/qc/density'
import { chshFromAxes, chshMaxHorodecki, correlationTensor } from '../../physics/qc/entangle'
import { localBasisProbs, marginal, overlapProb } from '../../physics/qc/measure'
import { bornPovm, helstromPovm, usdPovm } from '../../physics/qc/povm'
import { bell, ket } from '../../physics/qc/state'
import { msub, mscale } from '../../physics/linalg'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
const snap0 = (x: number): number => (Math.abs(x) < 1e-12 ? 0 : x)
const last = (C: Circuit): Vec => {
  const s = runCircuit(C).states
  return s[s.length - 1]
}
const at = (C: Circuit, k: number): Vec => runCircuit(C).states[k]
/** The chance that wire `w` reads 1. */
const bitOne = (psi: Vec, w: number): number => marginal(psi, [w])[1]

/* ---------------------------------------------------------------------------------------------- */
/* The circuits                                                                                     */
/* ---------------------------------------------------------------------------------------------- */
const cx = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'X', targets: [target], controls: [ctrl] })
const g1 = (gate: GateOp['gate'], target: number): GateOp => ({ op: 'gate', gate, targets: [target] })

/** The one-time pad: the key wire k adds itself to the message wire m (a CNOT), and adds itself again. Key 1, message 1. */
export const C_PAD: Circuit = { version: 1, qubits: 2, init: '11', wires: ['key k', 'message m'], columns: [[cx(0, 1)], [cx(0, 1)]] }
/** Two messages under one key: columns 1–2 pad each message, column 3 adds the two ciphertexts, and the key wire has dropped out. */
export const C_REUSE: Circuit = { version: 1, qubits: 3, init: '110', wires: ['key k', 'first message', 'second message'], columns: [[cx(0, 1)], [cx(0, 2)], [cx(1, 2)]] }
/** A CNOT as a copier: the original |+⟩ and a blank, then CNOT. */
export const C_COPY: Circuit = { version: 1, qubits: 2, init: '+0', wires: ['original', 'copy'], columns: [[cx(0, 1)]] }
/** The singlet from |00⟩: H on Alice's wire, CNOT, then X on Bob's and Z on Alice's; then an H on each wire (reading x on both sides). */
export const C_SX: Circuit = {
  version: 1,
  qubits: 2,
  init: '00',
  wires: ['Alice', 'Bob'],
  columns: [[g1('H', 0)], [cx(0, 1)], [g1('X', 1), g1('Z', 0)], [g1('H', 0), g1('H', 1)]],
}
/** Splitting a key: the share wire copies the key (column 1), adds the random string r (column 2), and adds r again (column 3). Key 1, r = 1. */
export const C_SPLIT: Circuit = { version: 1, qubits: 3, init: '110', wires: ['key k', 'random r', 'share u'], columns: [[cx(0, 2)], [cx(1, 2)], [cx(1, 2)]] }

/** B92's encoder for Alice's bit a (1 gives |+⟩). */
export const C_B92 = (a: 0 | 1): Circuit => b92Circuit(a)

/** Eve's probe at angle ξ (radians) on an x-basis input |+⟩: memoised so a story's states share one object. */
const memoProbe = new Map<number, Circuit>()
export const C_PROBE = (xiDeg: number): Circuit => {
  let C = memoProbe.get(xiDeg)
  if (!C) memoProbe.set(xiDeg, (C = probeCircuit(xiDeg * DEG, '+0')))
  return C
}

/** Secret sharing at θ = 22.5°: Alice's logical bit a on Bob's and Charlie's wires. */
export const THETA_SHARE = Math.PI / 8
export const THETA_SHARE_DEG = THETA_SHARE / DEG
export const C_SHARE = (a: 0 | 1): Circuit => shareCircuit(THETA_SHARE, a)

/* ---------------------------------------------------------------------------------------------- */
/* Directions the stages need, all taken from the engine                                             */
/* ---------------------------------------------------------------------------------------------- */
const snapDeg = (x: number): number => {
  const r = Math.round(x * 1e6) / 1e6
  return Object.is(r, -0) ? 0 : r === -180 ? 180 : r
}
/** A Bloch vector as the stage's (θ, φ) in degrees. */
export const dirOf = (v: readonly [number, number, number]): { thetaDeg: number; phiDeg: number } => ({
  thetaDeg: snapDeg(Math.acos(Math.max(-1, Math.min(1, v[2] / Math.hypot(...v)))) / DEG),
  phiDeg: snapDeg(Math.atan2(v[1], v[0]) / DEG),
})

const RHO0 = densityOf(B92_STATES[0])
const RHO1 = densityOf(B92_STATES[1])
const HEL = helstromPovm(RHO0, RHO1, 0.5)
/** The Bloch direction of a rank-one projector ½(I + n·σ). */
const projDir = (P: typeof RHO0): [number, number, number] => [2 * P[0][1].re, -2 * P[0][1].im, P[0][0].re - P[1][1].re]
/** Γ's eigen-axis (the Helstrom measurement's direction for "guess |0⟩"): (θ, φ) = (45°, 180°), read off the engine's Helstrom projector. */
export const HAX = dirOf(projDir(HEL[0]))

const SHARE = shareSplit(THETA_SHARE)
/** Charlie's two states when Bob reads +x or −x on the logical bit 0, as stage directions. */
export const CH_PLUS = dirOf(SHARE.charliePlus)
export const CH_MINUS = dirOf(SHARE.charlieMinus)

/** CHSH settings of Chapter Q10 (N&C): Alice's x and z, Bob's two tilted axes, as unit vectors for the engine. */
const unit = (thetaDeg: number, phiDeg: number): [number, number, number] => [Math.sin(thetaDeg * DEG) * Math.cos(phiDeg * DEG), Math.sin(thetaDeg * DEG) * Math.sin(phiDeg * DEG), Math.cos(thetaDeg * DEG)]
export const NC_A_VEC: [[number, number, number], [number, number, number]] = [[1, 0, 0], [0, 0, 1]]
export const NC_B_DIR = [{ thetaDeg: 135, phiDeg: 180 }, { thetaDeg: 45, phiDeg: 180 }] as const
const NC_B_VEC: [[number, number, number], [number, number, number]] = [unit(135, 180), unit(45, 180)]
const Z_X: [[number, number, number], [number, number, number]] = [[0, 0, 1], [1, 0, 0]]
const X_Z: [[number, number, number], [number, number, number]] = [[1, 0, 0], [0, 0, 1]]

/* ---------------------------------------------------------------------------------------------- */
/* The simulation the story reads                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const S_PAD = runCircuit(C_PAD).states
const S_SX = runCircuit(C_SX).states
const S_SPLIT = runCircuit(C_SPLIT).states
const S_SHARE0 = last(C_SHARE(0))

const B92_NONE = b92Rates('none')
const B92_USD = b92Rates('usd')
const B92_MIN = b92Rates('minerr')
const bobUsd = usdPovm(B92_STATES[0], B92_STATES[1])
const GAMMA = mscale(msub(RHO1, RHO0), 0.5)

const P0 = probeAttack(0)
const P90 = probeAttack(90 * DEG)
const P180 = probeAttack(Math.PI)

const psiMinus = bell('Psi-')
const equalChance = (bases: ('x' | 'y' | 'z')[]): number => {
  const p = localBasisProbs(psiMinus, bases)
  return p[0] + p[3]
}
const T_SINGLET = correlationTensor(psiMinus)

const EQ66 = eq66Check()
const CHEAT = sharingCheat('cheat-first')
const EARLY = sharingCheat('sigma-first')
const HONEST = sharingCheat('honest')
const KETS_SH = charlieKets(THETA_SHARE, 0)
const pPlusOn = (r: readonly [number, number, number]): number => (1 + r[0]) / 2

export const V = {
  /* q15-otp */
  q15CaesarShift: caesar('Caesar', 3).charCodeAt(0) - 'Caesar'.charCodeAt(0),
  q15CaesarOk: caesar('Caesar', 3) === 'Fdhvdu' ? 1 : 0,
  q15PadCipher: bitOne(S_PAD[1], 1),
  q15PadBack: bitOne(S_PAD[2], 1),
  q15OtpEx: parseInt(xorBits('10110', '01101'), 2),
  q15CopyOverlap: overlapProb(ket('++'), last(C_COPY)),
  q15ReuseLeak: bitOne(last(C_REUSE), 2),

  /* q15-b92 */
  q15Overlap: b92Overlap(),
  q15OverlapSq: overlapProb(ket('+'), ket('0')),
  q15UsdScale: bobUsd[0][0][0].re / 0.5, // E_0 = scale · |−⟩⟨−|, and the dyad's (0,0) entry is ½
  q15B92Kept: B92_NONE.kept,
  q15B92Inconcl: B92_NONE.inconclusive,
  q15B92Q0: snap0(B92_NONE.qber),
  q15EveUsdFail: bornPovm(bobUsd, RHO0)[2],
  q15QUsdEve: B92_USD.qber,
  q15EveWrongShare: B92_USD.qber / B92_USD.eveFail, // wrong resends per failure of her never-wrong reading
  q15EveUsdRight: B92_USD.eveRight,
  q15QMinEve: B92_MIN.qber,
  q15EveMinRight: B92_MIN.eveRight,
  q15GammaNorm: traceNorm(GAMMA),
  q15GammaHi: eigh(GAMMA).values[1],

  /* q15-bb84 */
  q15BridgeQ: bb84Q(1),
  q15ProbeX0: snap0(P0.xError),
  q15ProbeGuess0: P0.eveGuess,
  q15ProbeX90: P90.xError,
  q15ProbeZ90: snap0(P90.zError),
  q15ProbeGuess90: P90.eveGuess,
  q15ProbeR90: P90.rA,
  q15ProbeRE90: P90.rE,
  q15ProbeGuess180: P180.eveGuess,
  q15ProbeQ180: P180.qber,

  /* q15-e91 */
  q15SameX: snap0(equalChance(['x', 'x'])),
  q15SameY: snap0(equalChance(['y', 'y'])),
  q15DiffXY: equalChance(['x', 'y']),
  q15CorrXX: T_SINGLET[0][0],
  q15CorrYY: T_SINGLET[1][1],
  q15ChshSinglet: chshFromAxes(psiMinus, NC_A_VEC, NC_B_VEC),
  q15ChshProduct: chshFromAxes(ket('+-'), NC_A_VEC, NC_B_VEC),
  q15ChshProductMax: chshMaxHorodecki(ket('+-')),
  q15Eq66Chsh: chshFromAxes(bell('Phi+'), Z_X, X_Z),
  q15Eq66Diff: EQ66.table[0][1][0], // P(a, b | z, x) for any pair (a, b)
  q15Eq66PrintedSum: EQ66.printedRowSum,
  q15Eq66PrintedGap: EQ66.printedGap,
  q15Eq66CorrectedGap: snap0(EQ66.correctedGap),
  q15Eq66LocalGap: snap0(EQ66.lambdaGap),

  /* q15-sharing */
  q15SplitShare: bitOne(S_SPLIT[2], 2),
  q15SplitBack: bitOne(S_SPLIT[3], 2),
  q15ShareR: Math.hypot(...reducedBloch(S_SHARE0, 0)),
  q15ShareBobPlus: SHARE.bobPlus,
  q15ShareCharlieX: SHARE.charliePlus[0],
  q15ShareOverlap: SHARE.overlap,
  q15ShareUsd: SHARE.usd,
  q15ShareTheta50: shareThetaFor(0.5),
  q15SharePxPlus: pPlusOn(SHARE.charliePlus),
  q15SharePxMinus: pPlusOn(SHARE.charlieMinus),
  q15ShareAlpha2: Math.abs(inner(ket('0'), KETS_SH.plus).re) ** 2,
  q15CheatGap: snap0(CHEAT.recordGap),
  q15CheatErr: snap0(CHEAT.errorRate),
  q15CheatKnows: CHEAT.charlieGuess,
  q15CheatEarlyGuess: EARLY.charlieGuess,
  q15CheatEarlyGap: snap0(EARLY.recordGap),
  q15HonestGuess: HONEST.charlieGuess,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { S_PAD, S_SX, S_SPLIT, at, c, claimKey, close, d, pct, tf, uf }
