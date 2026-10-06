/**
 * Chapter Q14 numbers (Physics 709, "Generalized measurements and telling states apart"), computed once with the
 * engine. Plan: docs/roles/proposals/P-Q14-story.md; rulings docs/roles/decisions/qc709-Q14.md, qc709-remap.md.
 *
 * Every number a learner reads in Q14 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q14.json (pipeline/claims_qc709/q14.py,
 * an independent route). Keys start with `q14` and are unique across both courses.
 *
 * Merged E3 `physics/qc/povm.ts` (`isPOVM`, `bornPovm`, `neumark`, `helstrom`, `usd`) covers every number — no new
 * engine code. The trine, the N&C unambiguous-discrimination POVM and the unsharp-Z meter have no engine
 * constructor (ruling 6 of qc709-Q14.md §9.1: only the five functions above merged), so they are BUILT HERE from
 * primitives (`outer`, `mscale`, `madd`, `msub`) and verified with `isPOVM` before any number is read off them —
 * exactly the plan's own fallback.
 *
 * Build note against the plan (ruling 3, qc709-Q14.md — reported to the orchestrator): the plan's own `matrix` POVM
 * source `{povm:{key, which, index?, param?}}` (plan §9.2 Q3) was declined; the discrimination `plot` curves
 * (`usdSuccessVsOverlap`, `helstromErrorVsOverlap`, `discrimCompare`) were declined too (§9.2 Q4). Every POVM element
 * with a coefficient outside the exact set `MATRIX_COEF_EXACT` (the trine's 2/3, the N&C constant 2−√2, the Neumark
 * isometry's √(2/3)) is drawn in Q14.story.ts as its bare rank-one direction (`{outer: [...]}`, values:'decimal'),
 * with the real coefficient stated in the caption from `V` via `d()`; Σ Eᵢ = I is drawn as `mx(pa('I'), {trace:
 * true})`, captioned "= Σᵢ Eᵢ"; the Neumark isometry V is never drawn as a grid (its entries are irrational), so
 * `q14-neumark` shows the ancilla circuit and the completeness identity only. The unsharp-Z meter's own operators
 * ARE drawn exactly: at η = ½ both are E± = ½I ± ¼Z, and ¼ = ½·½ is reachable by one level of NESTED `lin` (every
 * coefficient at every level stays in the exact set), so `q14-pointer` needs no fallback at all. The discrimination
 * curves are replaced by the SAME `matrix{spectrum}` view that already draws the Helstrom operator Γ exactly (its
 * eigenvalues are the engine's own, computed at whatever prior/pair the beat needs), with the swept number stated
 * in the caption via `d()` — the ruling's own suggested substitute.
 */
import { ONE, abs } from '../../physics/complex'
import { dagger, identity, inner, madd, matmul, mscale, msub, outer, vec, type Mat } from '../../physics/linalg'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { densityOf, traceNorm } from '../../physics/qc/density'
import { eigh, traceN, zeros } from '../../physics/qc/cmat'
import { Z } from '../../physics/qc/gates'
import { bornPovm, helstrom, isPOVM, neumark, usd } from '../../physics/qc/povm'
import { ket } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* Circuit (plan §0 "Circuits"): a system qubit S coupled to a meter/ancilla qubit M by a CNOT, then */
/* M is read. The generic "couple, then read the meter" picture (Bergou §5.2); the chapter's actual  */
/* POVM numbers (the unsharp-Z meter, the trine) come from the `matrix` views beside it, not from    */
/* this circuit's own state (a CNOT realises only the SHARP special case).                           */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, controls?: number[]): GateOp => ({ op: 'gate', gate, targets: [target], ...(controls ? { controls } : {}) })
export const C_METER: Circuit = { version: 1, qubits: 2, clbits: 1, init: '00', wires: ['S', 'M'], columns: [[g('X', 1, [0])], [{ op: 'measure', qubit: 1, bit: 0 }]] }

const I2: Mat = identity(2)
/** max|entry − I_n entry|, real and imaginary parts both, for a completeness/isometry check. */
const idGap = (M: Mat): number => Math.max(...M.flatMap((row, i) => row.map((x, j) => Math.abs(x.re - (i === j ? 1 : 0)) + Math.abs(x.im))))

/* ---------------------------------------------------------------------------------------------- */
/* q14-pointer: the unsharp-Z meter at η = ½ — E± = ½(I ± ½Z) = ½I ± ¼Z, exact (nested `lin`)        */
/* ---------------------------------------------------------------------------------------------- */
const E_PLUS: Mat = madd(mscale(I2, 0.5), mscale(Z, 0.25))
const E_MINUS: Mat = msub(mscale(I2, 0.5), mscale(Z, 0.25))
const UNSHARP = [E_PLUS, E_MINUS] as const
if (!isPOVM(UNSHARP)) throw new Error('Q14.values: the unsharp-Z meter at η=½ is not a POVM')
const unsharpSumGap = idGap(madd(E_PLUS, E_MINUS))
const p0Unsharp = bornPovm(UNSHARP, densityOf(ket('0')))
const pPlusUnsharp = bornPovm(UNSHARP, densityOf(ket('+')))

/* ---------------------------------------------------------------------------------------------- */
/* q14-povm / q14-neumark: the trine (Bergou Eq. 5.24) — three states 120° apart on the x–z circle  */
/* ---------------------------------------------------------------------------------------------- */
/** |ψ0⟩ = −½(|0⟩+√3|1⟩), Bloch (θ=120°,φ=0°); |ψ1⟩ = −½(|0⟩−√3|1⟩), Bloch (θ=120°,φ=180°); |ψ2⟩ = |0⟩. */
const PSI0 = vec(-0.5, -0.5 * Math.sqrt(3))
const PSI1 = vec(-0.5, 0.5 * Math.sqrt(3))
const PSI2 = vec(1, 0)
export const PSI0_DIR = { thetaDeg: 120, phiDeg: 0 } as const
export const PSI1_DIR = { thetaDeg: 120, phiDeg: 180 } as const
export const PSI2_DIR = { thetaDeg: 0, phiDeg: 0 } as const
const trineElems = [PSI0, PSI1, PSI2].map((psi) => mscale(outer(psi, psi), 2 / 3))
if (!isPOVM(trineElems)) throw new Error('Q14.values: the trine is not a POVM')
const trineSumGap = idGap(trineElems.reduce((a, E) => madd(a, E)))
const bornOnPsi0 = bornPovm(trineElems, densityOf(PSI0))
const bornOn0 = bornPovm(trineElems, densityOf(ket('0')))
/** The UNSCALED sum Σⱼ|ψⱼ⟩⟨ψⱼ| = (3/2)Σⱼ Eⱼ = (3/2)I, the "one and a half times the identity" claim. */
const trineProjSum = mscale(trineElems.reduce((a, E) => madd(a, E)), 1.5)

const { V: NEUMARK_V, projectors: NEUMARK_PROJ } = neumark(trineElems)
const neumarkVdagVGap = idGap(matmul(dagger(NEUMARK_V), NEUMARK_V))
const vRhoVdag = matmul(matmul(NEUMARK_V, densityOf(ket('0'))), dagger(NEUMARK_V))
const neumarkMatch = NEUMARK_PROJ.map((P) => traceN(matmul(P, vRhoVdag)).re)

/**
 * Item 6 Correction (Bergou p. 86's "e.g." is a slip): "extend V by the identity on the complement of |ψ_B⟩" is NOT
 * unitary. Build exactly that extension — V's own columns at domain index a·m (the |a⟩⊗|ψ_B=0⟩ slot) and the
 * identity on the complement slots a·m+i, i ≥ 1 — and show ‖U†U − I‖ > 0 (self-contained; the Q13 fix adds the same
 * kind of check for the Stinespring "e.g.", independently).
 */
const M_OUT = NEUMARK_PROJ.length
const D_SYS = 2
const extendByIdentity: Mat = zeros(D_SYS * M_OUT)
for (let a = 0; a < D_SYS; a++) {
  for (let row = 0; row < D_SYS * M_OUT; row++) extendByIdentity[row][a * M_OUT] = NEUMARK_V[row][a]
  for (let i = 1; i < M_OUT; i++) extendByIdentity[a * M_OUT + i][a * M_OUT + i] = ONE
}
const extendByIdentityGap = idGap(matmul(dagger(extendByIdentity), extendByIdentity))

/* ---------------------------------------------------------------------------------------------- */
/* q14-usd: |0⟩ vs |+⟩, equal priors — the N&C never-err POVM (Eqs. 2.118–2.120)                    */
/* ---------------------------------------------------------------------------------------------- */
const overlap0Plus = abs(inner(ket('0'), ket('+')))
const usdSucc = usd([ket('0'), ket('+')])
const usdHalfInconcl = (1 - usdSucc) / 2 // half the inconclusive rate, 0.354
const NC_CONST = Math.SQRT2 / (1 + Math.SQRT2) // = 2 − √2, Bergou/N&C's never-err coefficient
const E1_NC = mscale(outer(ket('1'), ket('1')), NC_CONST)
const E2_NC = mscale(outer(ket('-'), ket('-')), NC_CONST)
const E0_NC = msub(msub(I2, E1_NC), E2_NC)
if (!isPOVM([E0_NC, E1_NC, E2_NC])) throw new Error('Q14.values: the N&C USD POVM is not a POVM')
const ncElemsSumGap = idGap(madd(madd(E0_NC, E1_NC), E2_NC))

/* ---------------------------------------------------------------------------------------------- */
/* q14-min-error / q14-compare: the Helstrom operator Γ = η₂ρ₂ − η₁ρ₁ at equal priors               */
/* ---------------------------------------------------------------------------------------------- */
const GAMMA = mscale(msub(densityOf(ket('+')), densityOf(ket('0'))), 0.5)
const gammaSpec = eigh(GAMMA).values // ascending
const gammaTraceNorm = traceNorm(GAMMA) // √(1−c²), general; equals c = 0.7071 only because c² = ½ for this pair
const helstromSucc = helstrom(densityOf(ket('0')), densityOf(ket('+')), 0.5)
const helstromErr = 1 - helstromSucc
/** Identical states (c = 1): no measurement beats a coin toss, success exactly 1/2 (min-error's end of the sweep). */
const helstromCoinToss = helstrom(densityOf(ket('+')), densityOf(ket('+')), 0.5)
/** "Even odds": each of the two equally likely states has prior 1/(number of states). */
const EVEN_PRIOR = 1 / [ket('0'), ket('+')].length

/** At overlap 0 (orthogonal states): both strategies reach success 1. */
const helstromC0 = helstrom(densityOf(ket('0')), densityOf(ket('1')), 0.5)
const usdC0 = usd([ket('0'), ket('1')])

export const V = {
  /* q14-pointer */
  q14UnsharpEPlus00: E_PLUS[0][0].re,
  q14UnsharpEPlus11: E_PLUS[1][1].re,
  q14UnsharpEMinus00: E_MINUS[0][0].re,
  q14UnsharpEMinus11: E_MINUS[1][1].re,
  q14UnsharpSumGap: unsharpSumGap,
  q14UnsharpP0Plus: p0Unsharp[0],
  q14UnsharpP0Minus: p0Unsharp[1],
  q14UnsharpPPlusPlus: pPlusUnsharp[0],
  q14UnsharpPPlusMinus: pPlusUnsharp[1],

  /* q14-povm */
  q14TrineSumGap: trineSumGap,
  q14TrineCorrect: bornOnPsi0[0],
  q14TrineError: bornOnPsi0[1],
  q14TrineOnZero0: bornOn0[0],
  q14TrineOnZero1: bornOn0[1],
  q14TrineOnZero2: bornOn0[2],
  q14TrineProjDiag: trineProjSum[0][0].re,

  /* q14-neumark */
  q14NeumarkVdagVGap: neumarkVdagVGap,
  q14NeumarkMatch0: neumarkMatch[0],
  q14NeumarkMatch1: neumarkMatch[1],
  q14NeumarkMatch2: neumarkMatch[2],
  q14NeumarkAncillaDim: NEUMARK_PROJ.length,
  q14NeumarkExtendGap: extendByIdentityGap,

  /* q14-usd */
  q14Overlap0Plus: overlap0Plus,
  q14UsdSucc: usdSucc,
  q14UsdInconcl: 1 - usdSucc,
  q14UsdHalfInconcl: usdHalfInconcl,
  q14NcConst: NC_CONST,
  q14NcElemsSumGap: ncElemsSumGap,

  /* q14-min-error */
  q14HelstromSucc: helstromSucc,
  q14HelstromErr: helstromErr,
  q14HelstromGammaLo: gammaSpec[0],
  q14HelstromGammaHi: gammaSpec[1],
  q14GammaTraceNorm: gammaTraceNorm,
  q14EvenPrior: EVEN_PRIOR,

  /* q14-compare */
  q14CompareC0Helstrom: helstromC0,
  q14CompareC0Usd: usdC0,
  q14HelstromCoinToss: helstromCoinToss,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
