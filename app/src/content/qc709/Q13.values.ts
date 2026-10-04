/**
 * Chapter Q13 numbers (Physics 709, "Open-system maps: Kraus operators and impossible machines"), computed once with
 * the engine. Plan: docs/roles/proposals/P-Q13-story.md; rulings docs/roles/decisions/qc709-Q10Q13.md,
 * qc709-remap.md.
 *
 * Every number a learner reads in Q13 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q13.json (pipeline/claims_qc709/q13.py,
 * an independent route). Keys start with `q13` and are unique across both courses.
 *
 * E3's `physics/qc/channels.ts` is used directly (depolarizing, dephasing, amplitudeDamping, applyKraus); every
 * affine-map number (the depolarizing shrink factor, the amplitude-damping offset) is read off by applying the
 * channel to a specific input and reducing its Bloch vector (`density.ts` reducedBloch) — E3 ships no `blochAffine`
 * helper (the plan's §9.1 assumed one would; it did not), so this is the direct route instead.
 *
 * Build note against the plan (reported to the orchestrator): the plan's running numeric example for "closed vs
 * open evolution" / "Σ A_m†A_m = I" was the depolarizing channel's own Kraus list, dilated by an explicit 2-qubit
 * environment unitary U_SE (plan §0 "Circuits", C_DEPOL) and drawn as a `matrix` grid (plan §0 "Stage shorthand",
 * `krausList`/`krausSumAA`). Neither is buildable without a stage or engine change this build may not make:
 *  - `krausFromUnitary`/`stinespring` (the plan's own E3 functions for the dilation) were never added to
 *    `channels.ts` (only `applyKraus, isCPTP, depolarizing, dephasing, bitFlip, amplitudeDamping, composeChannels,
 *    pauliTwirl, transposeMap, unotMap, choi, choiIsPositive` were); hand-deriving an 8×8 unitary completion of the
 *    depolarizing dilation's isometry (plan §12 Q2/Q3's own flagged risk) is out of scope for a single build.
 *  - the `matrix` kind's `lin` source only accepts coefficients from the fixed exact set `MATRIX_COEF_EXACT` (±1,
 *    ±½, ±i, ±1/√2); the depolarizing Kraus operators' √(p/3) coefficient is in that set for NO p, so its Kraus list
 *    and Σ A_m†A_m cannot be drawn as a `matrix` for any p (plan §12 Q2's own flagged gap; the proposed new
 *    `{channel: {...}}` source was not built either).
 * Substituted: the DEPHASING (phase-flip) channel at p = ½ — one of the depolarizing family Unit 13.4 itself
 * introduces — has BOTH Kraus coefficients exactly 1/√2, so its Σ A_m†A_m = I is drawn exactly via `lin` of
 * `product`s of `pauli` sources (no new stage source needed), and its Stinespring dilation is exactly ONE CNOT
 * (`C_DEPH` below: H then CNOT(S→E), tracing E out) — a standard textbook realization (N&C §8.3.3), simulated with
 * the existing `circuit` kind. The depolarizing channel's own completeness (`q13DepolSumGap`) and shrink factor are
 * still fully engine-backed, just not drawn as a `matrix` grid; the Bloch-ball unit (13.4) shows the shrink directly
 * as explicit `{r: [...]}` snapshots (already a supported `BallPoint`, no stage change), and amplitude damping at
 * γ = ½ ALSO has both Kraus coefficients exactly 1/√2, so it draws exactly too (Q13.story.ts).
 */
import { abs } from '../../physics/complex'
import { apply, dagger, identity, inner, madd, matmul, maxDiff, mscale, type Mat } from '../../physics/linalg'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { amplitudeDamping, applyKraus, depolarizing, dephasing } from '../../physics/qc/channels'
import { eigh } from '../../physics/qc/cmat'
import { densityOf, fidelity, mixtureN, ptranspose, reducedBloch } from '../../physics/qc/density'
import { cnot } from '../../physics/qc/gates'
import { bell, ket } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* Circuits (plan §0 "Circuits", adapted — see the header note)                                     */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, controls?: number[]): GateOp => ({ op: 'gate', gate, targets: [target], ...(controls ? { controls } : {}) })

/** S starts in |0⟩, H puts it in |+⟩, then CNOT(S→E) couples a fresh environment qubit. Tracing E out leaves the
 *  dephasing(½) channel on S exactly (N&C §8.3.3's own phase-damping circuit). */
export const C_DEPH: Circuit = { version: 1, qubits: 2, init: '00', wires: ['S', 'E'], columns: [[g('H', 0)], [g('X', 1, [0])]] }

/** A single CNOT (control = data, target = blank), the "cloner": copies basis states, entangles a superposition. */
export const C_CLONE: Circuit = { version: 1, qubits: 2, init: '10', wires: ['data', 'blank'], columns: [[g('X', 1, [0])]] }

/* ---------------------------------------------------------------------------------------------- */
/* q13-from-unitary / q13-stinespring: completeness, Σ_m A_m†A_m = I                                 */
/* ---------------------------------------------------------------------------------------------- */
const sumAdagA = (ks: readonly Mat[]): Mat => ks.map((K) => matmul(dagger(K), K)).reduce((a, b) => madd(a, b))
const I2M = identity(2)
/** The worked instance drawn on stage: dephasing(½) = {1/√2 I, 1/√2 Z}, both coefficients exact. */
const dephSumGap = maxDiff(sumAdagA(dephasing(0.5)), I2M)
/** The chapter's running example, computed the same way but not drawn as a matrix (see the header note). */
const depolSumGap = maxDiff(sumAdagA(depolarizing(0.5)), I2M)

/* ---------------------------------------------------------------------------------------------- */
/* q13-properties: the transpose's Choi matrix                                                      */
/* ---------------------------------------------------------------------------------------------- */
const PHI_RHO = densityOf(bell('00+11'))
const PHI_PT = ptranspose(PHI_RHO, [1])
/** `eigh` is ascending and UNCLAMPED (unlike density.ts's own `spectrum`, which floors at 0): the −½ survives. */
const phiPtEigs = eigh(PHI_PT).values
const transposeSpecMin = phiPtEigs[0]
const transposeSpecMax = phiPtEigs[3]

/* ---------------------------------------------------------------------------------------------- */
/* q13-depolarizing: the shrinking Bloch ball, and amplitude damping's offset                       */
/* ---------------------------------------------------------------------------------------------- */
/** r_x of the depolarizing channel's image of |+⟩ (r = (1,0,0)): the whole-ball shrink factor 1 − 4p/3. */
function depolFactorAt(p: number): number {
  const out = applyKraus(depolarizing(p), densityOf(ket('+')))
  return reducedBloch(out, 0)[0]
}
const depolFactorP0 = depolFactorAt(0)
const depolFactorP50 = depolFactorAt(0.5)
const depolFactorP75 = depolFactorAt(0.75)
const depolFactorP100 = depolFactorAt(1)

const OVEN_RHO: Mat = mscale(I2M, 0.5)
/** The affine map's constant term c: the image of the centre (r = 0, the maximally mixed oven state). */
const ampDampC = reducedBloch(applyKraus(amplitudeDamping(0.5), OVEN_RHO), 0)
/** The image of |+⟩ (r = (1,0,0)): r_x = M_xx·1 + c_x, and c_x = 0, so this IS M_xx. */
const ampDampPlusOut = reducedBloch(applyKraus(amplitudeDamping(0.5), densityOf(ket('+'))), 0)
/** The image of |0⟩ (r = (0,0,1)): r_z = M_zz·1 + c_z, so M_zz is this minus c_z. */
const ampDampZeroOut = reducedBloch(applyKraus(amplitudeDamping(0.5), densityOf(ket('0'))), 0)
const ampDampCz = ampDampC[2]
const ampDampMxx = ampDampPlusOut[0] - ampDampC[0]
const ampDampMzz = ampDampZeroOut[2] - ampDampCz

/* ---------------------------------------------------------------------------------------------- */
/* q13-no-cloning                                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const CNOT2 = cnot(0, 1, 2)
/** The CNOT copies both basis states exactly: |00⟩ → |00⟩, |10⟩ → |11⟩. */
const cloneBasisFid = Math.min(fidelity(apply(CNOT2, ket('00')), ket('00')), fidelity(apply(CNOT2, ket('10')), ket('11')))
/** On a superposition it does NOT copy: CNOT|+⟩|0⟩ = Φ+ exactly (not |+⟩|+⟩). */
const cloneSupFid = fidelity(apply(CNOT2, ket('+0')), bell('00+11'))
/** The no-cloning proof's overlap that is neither 0 nor 1: ⟨0|+⟩. */
const overlap0Plus = abs(inner(ket('0'), ket('+')))

/* ---------------------------------------------------------------------------------------------- */
/* q13-herbert                                                                                      */
/* ---------------------------------------------------------------------------------------------- */
/** Alice's non-selective z-basis reading of Φ+ leaves Bob (qubit 1) at the mixture of |0⟩,|1⟩: ½I. */
const MZ_RHO = mixtureN([{ w: 0.5, psi: ket('00') }, { w: 0.5, psi: ket('11') }])
/** Her non-selective x-basis reading leaves Bob the SAME ½I: the mixture of |+⟩,|−⟩. */
const MX_RHO = mixtureN([{ w: 0.5, psi: ket('++') }, { w: 0.5, psi: ket('--') }])
const herbertRbZ = reducedBloch(MZ_RHO, 1)
const herbertRbX = reducedBloch(MX_RHO, 1)
const herbertRbZLen = Math.hypot(...herbertRbZ)
const herbertRbXLen = Math.hypot(...herbertRbX)

/* ---------------------------------------------------------------------------------------------- */
/* Exported non-V engine objects (for Q13.story.ts stage views)                                     */
/* ---------------------------------------------------------------------------------------------- */
export { MX_RHO, MZ_RHO }

export const V = {
  /* reusable constants */
  q13Half: 0.5,
  q13Quarter: 0.25,

  /* q13-from-unitary / q13-stinespring */
  q13DephSumGap: dephSumGap,
  q13DepolSumGap: depolSumGap,
  q13MaxKraus2: 4,

  /* q13-properties */
  q13TransposeSpecMin: transposeSpecMin,
  q13TransposeSpecMax: transposeSpecMax,

  /* q13-depolarizing */
  q13DepolFactorP0: depolFactorP0,
  q13DepolFactorP50: depolFactorP50,
  q13DepolFactorP75: depolFactorP75,
  q13DepolFactorP100: depolFactorP100,
  q13AmpDampCz: ampDampCz,
  q13AmpDampMxx: ampDampMxx,
  q13AmpDampMzz: ampDampMzz,

  /* q13-no-cloning */
  q13CloneBasisFid: cloneBasisFid,
  q13CloneSupFid: cloneSupFid,
  q13Overlap0Plus: overlap0Plus,

  /* q13-herbert */
  q13HerbertRbZLen: herbertRbZLen,
  q13HerbertRbXLen: herbertRbXLen,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
