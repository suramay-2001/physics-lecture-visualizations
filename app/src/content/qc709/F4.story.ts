/**
 * Chapter F4 scroll story, both tracks over one stage (plan: docs/roles/proposals/P-F4-story.md §1–§2; rulings
 * docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md, qc709-nc.md).
 *
 * Rules kept here:
 * - An F chapter has no lecture notes: its own line is phase 'core' ("The foundation"), then 'books', then the clue.
 * - `text` is the Ground-up track (9th-grade start, ≤ 25 words per sentence), `formal` the Formal track (≤ 40).
 * - Matrices are row-major, $M[i][j] = \langle i|M|j\rangle$ (the engine's convention, `physics/linalg.ts`).
 * - Every number in the prose comes from F4.values.ts through a keyed claim. Sign-sensitive figures (an eigenvector's
 *   components, a complex eigenvalue's parts) are interpolated straight from `V` with `d(...)` rather than typed as a
 *   literal, so the shown text can never drift from the engine's own phase convention (first non-negligible
 *   eigenvector component real ≥ 0).
 * - Ruling (qc709-nc.md #1): "Hermitian ⇒ real eigenvalues" (any dimension) is 448 L3 homework (and N&C Ex. 2.17), so
 *   F4 states it and cites the notes' page (p. 15) at `f4-hermitian:b3`, WITHOUT a derivation — only the
 *   orthogonality half (distinct eigenvalues ⇒ orthogonal eigenvectors, D3b) is derived, at `f4-hermitian:b4`. The
 *   plan's own D3a (the sandwich proof of reality) is therefore not built; see the build report.
 * - Glossary reuse, not redefinition (build note): seven of the plan's §5 terms are ids Chapter Q2/Q3/Q8 already
 *   registered — `registerGloss` throws on a duplicate id. This chapter's prose reuses those entries with
 *   `[[id|shown text]]`. F3 already registered `qc-hermitian` (not the plan's placeholder `qc-hermitian-matrix`) for
 *   "A = A†"; F4 reuses that id. `qc-euler` and `qc-determinant` are CONCEPT-MAP ids only (content/qc709/concepts.ts),
 *   not registered glossary entries, so F4 names them in plain words instead of a dangling `[[gloss]]` link.
 * - F2 and F5 are not on this branch: F4 does not bridge to F2 (its prerequisite kets/inner-product material is
 *   recapped in words, as F3 did) and offers no F5 bridges (F5 is being built in parallel).
 */
import type { AmpSource, Beat, BlochState, ComplexPlaneState, MatrixCoef, MatrixGateName, MatrixGridState, MatrixSource, OperatorSpec, OperatorState, Ref, StageLayout, StageState } from '../schema'
import { V, claim, close, d } from './F4.values'

/** The named Bloch directions (`physics/spin.ts` `NamedKet`, not re-exported from `content/schema`). */
type NamedKet = '+z' | '-z' | '+x' | '-x' | '+y' | '-y'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */

const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
const gate = (name: MatrixGateName): MatrixSource => ({ gate: { name } })
/** '0'/'1'/'+'/'-' (and multi-qubit strings of those) go through `ket`; anything else (e.g. '+x') is a named `dir`. */
const amp = (label: string): AmpSource => (/^[01+-]+$/.test(label) ? { ket: label } : { dir: label as NamedKet })
const out = (a: string, b?: string): MatrixSource => ({ outer: b === undefined ? [amp(a)] : [amp(a), amp(b)] })
const prod = (...srcs: MatrixSource[]): MatrixSource => ({ product: srcs })
const adj = (src: MatrixSource): MatrixSource => ({ adjoint: src })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })
const pa = (letters: string): MatrixSource => ({ pauli: letters })
const opsM = (M: [[string, string], [string, string]], extra: Partial<Omit<OperatorState, 'kind' | 'op'>> = {}): OperatorState => ({
  kind: 'operator-space',
  op: { matrix: M } as OperatorSpec,
  eigen: true,
  labels: 'plain',
  shot: 'O-STD',
  ...extra,
})
/** '0'/'1' stand for the 709 lock |0⟩ ≡ |+z⟩, |1⟩ ≡ |−z⟩; anything else is a named Bloch direction already. */
const bl = (state: '0' | '1' | NamedKet | { thetaDeg: number; phiDeg: number }, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({
  kind: 'bloch',
  state: state === '0' ? '+z' : state === '1' ? '-z' : state,
  shot: 'B-STD',
  ...extra,
})
const cp = (s: Omit<ComplexPlaneState, 'kind' | 'shot'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...s })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

export const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })
export const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* Claims (keyed to F4.values.ts; see that file for the engine call behind each key)                */
/* ---------------------------------------------------------------------------------------------- */

export const C = {
  xzValLow: claim('f4XZvalLow', `$\\tfrac12(X+Z)$'s smaller eigenvalue, $-1/\\sqrt2 = ${d(V.f4XZvalLow, 4)}$`, () => close(V.f4XZvalLow, -Math.SQRT1_2)),
  xzValHigh: claim('f4XZvalHigh', `$\\tfrac12(X+Z)$'s larger eigenvalue, $1/\\sqrt2 = ${d(V.f4XZvalHigh, 4)}$`, () => close(V.f4XZvalHigh, Math.SQRT1_2)),
  xzVecPlus: claim('f4XZvecPlus0', `the $+${d(V.f4XZvalHigh, 4)}$ eigenvector's components, $(${d(V.f4XZvecPlus0, 4)}, ${d(V.f4XZvecPlus1, 4)})$`, () => close(V.f4XZvecPlus0, Math.cos(Math.PI / 8)) && close(V.f4XZvecPlus1, Math.sin(Math.PI / 8))),
  xzTr: claim('f4XZtr', `$\\operatorname{tr}\\tfrac12(X+Z) = 0$`, () => close(V.f4XZtr, 0)),
  xzDet: claim('f4XZdet', `$\\det\\tfrac12(X+Z) = -0.5$`, () => close(V.f4XZdet, -0.5)),
  xzPolyDet: claim('f4XZpolyDet', 'the characteristic polynomial\u2019s constant term, $-0.5$, an independent route to the same determinant', () => close(V.f4XZpolyDet, -0.5)),
  xzGap: claim('f4XZgap', `the gap between the two eigenvalues, $\\sqrt2 = ${d(V.f4XZgap, 4)}$`, () => close(V.f4XZgap, Math.SQRT2)),
  zzValLow: claim('f4ZZvalLow', '$Z\\otimes Z$\u2019s eigenvalue $-1$ (doubly degenerate)', () => close(V.f4ZZvalLow, -1)),
  zzValHigh: claim('f4ZZvalHigh', '$Z\\otimes Z$\u2019s eigenvalue $+1$ (doubly degenerate)', () => close(V.f4ZZvalHigh, 1)),
  shearEig: claim('f4ShearEigVal', 'the shear\u2019s one eigenvalue, $2$ (repeated)', () => close(V.f4ShearEigVal, 2)),
  shearVecCount: claim('f4ShearVecCount', 'the shear has only $1$ independent eigenvector (defective)', () => V.f4ShearVecCount === 1),
  rPoly: claim('f4RPoly1', 'the quarter-turn\u2019s characteristic equation, $\\lambda^2 + 1 = 0$ (trace $0$, determinant $1$)', () => close(V.f4RPoly1, 0) && close(V.f4RPoly2, 1)),
  rVal: claim('f4RValIm', 'the quarter-turn\u2019s eigenvalues, $\\pm i$', () => close(V.f4RValRe, 0) && close(V.f4RValIm, 1)),
  xHerm: claim('f4XHerm', '$\\sigma_x$ is Hermitian', () => V.f4XHerm === 1),
  xEqAdj: claim('f4XEqAdj', '$\\sigma_x = \\sigma_x^\\dagger$', () => V.f4XEqAdj === 1),
  xValLow: claim('f4XvalLow', '$\\sigma_x$\u2019s eigenvalue $-1$', () => close(V.f4XvalLow, -1)),
  xValHigh: claim('f4XvalHigh', '$\\sigma_x$\u2019s eigenvalue $+1$', () => close(V.f4XvalHigh, 1)),
  xzVecMinus: claim('f4XZvecMinus0', `the $${d(V.f4XZvalLow, 4)}$ eigenvector's components, $(${d(V.f4XZvecMinus0, 4)}, ${d(V.f4XZvecMinus1, 4)})$`, () => close(V.f4XZvecMinus0 ** 2 + V.f4XZvecMinus1 ** 2, 1)),
  xzOrth: claim('f4XZorth', 'the two eigenvectors\u2019 overlap is $0$: at right angles', () => close(V.f4XZorth, 0)),
  zzPlusRank: claim('f4ZZplusRank', 'the $+1$ eigenspace of $Z\\otimes Z$ is $2$-dimensional', () => V.f4ZZplusRank === 2),
  xSpectralGap: claim('f4XspectralGap', 'the spectral sum $(+1)P_{+x} + (-1)P_{-x}$ rebuilds $\\sigma_x$ exactly', () => close(V.f4XspectralGap, 0)),
  xsqIsI: claim('f4XsqIsI', '$\\sigma_x^2 = I$', () => close(V.f4XsqIsI, 0)),
  xzSqrt: claim('f4XZsqrtValLow', `$\\sqrt{\\tfrac12(I+X)}$ has eigenvalues $0$ and $1$`, () => close(V.f4XZsqrtValLow, 0) && close(V.f4XZsqrtValHigh, 1)),
  zzProj: claim('f4ZZprojDiff', '$P_+ - P_-$ rebuilds $Z\\otimes Z$ exactly', () => close(V.f4ZZprojDiff, 0)),
  zsqIsI: claim('f4ZsqIsI', '$\\sigma_z^2 = I$', () => close(V.f4ZsqIsI, 0)),
  xsqEigVal: claim('f4XsqEigVal', '$\\sigma_x^2 = I$\u2019s eigenvalue, $1$ (both of them)', () => close(V.f4XsqEigVal, 1)),
  spectralRebuildTR: claim('f4SpectralRebuildTR', 'the rebuilt table\u2019s top-right entry, $1$', () => close(V.f4SpectralRebuildTR, 1)),
  hUnitary: claim('f4Hunitary', '$H$ is unitary', () => V.f4Hunitary === 1),
  hdH: claim('f4HdH', '$H^\\dagger H = I$', () => close(V.f4HdH, 0)),
  hOnZero: claim('f4HonZero0', `$H|0\\rangle = |{+}x\\rangle = (${d(V.f4HonZero0, 4)}, ${d(V.f4HonZero1, 4)})$`, () => close(V.f4HonZero0, Math.SQRT1_2) && close(V.f4HonZero1, Math.SQRT1_2)),
  hPreservesNorm: claim('f4HpreservesNorm', 'the length of $H(0.6, 0.8i)$ is $1$', () => close(V.f4HpreservesNorm, 1)),
  sAbsEig: claim('f4SAbsEig', 'each of $S$\u2019s eigenvalues has size $1$', () => close(V.f4SAbsEig, 1)),
  rzQuarter: claim('f4RzQuarterRe', `$e^{-i\\sigma_z\\pi/4}$\u2019s entries, $${d(V.f4RzQuarterRe, 4)} \\mp ${d(Math.abs(V.f4RzQuarterIm), 4)}i$`, () => close(V.f4RzQuarterRe, Math.SQRT1_2) && close(Math.abs(V.f4RzQuarterIm), Math.SQRT1_2)),
  rzActionAngle: claim('f4RzActionAngle', `$e^{-i(\\frac12\\sigma_z)(\\pi/2)}$ turns the sphere by $${d(V.f4RzActionAngle, 4)}$ rad`, () => close(V.f4RzActionAngle, Math.PI / 2)),
  rzEig: claim('f4RzEigRe', `that same unitary\u2019s eigenvalues, $e^{\\mp i\\pi/4} = ${d(V.f4RzEigRe, 4)} \\mp ${d(Math.abs(V.f4RzEigIm), 4)}i$`, () => close(V.f4RzEigRe, Math.SQRT1_2) && close(Math.abs(V.f4RzEigIm), Math.SQRT1_2)),
  rzHalfPiAngleDeg: claim('f4RzHalfPiAngleDeg', `$e^{-i\\sigma_z(\\pi/2)}$ turns the sphere by $${d(V.f4RzHalfPiAngleDeg, 0)}^\\circ$`, () => close(V.f4RzHalfPiAngleDeg, 180)),
  xIsUnitary: claim('f4XIsUnitary', '$\\sigma_x^\\dagger\\sigma_x = I$: unitary too', () => V.f4XIsUnitary === 1),
  zpSimulOk: claim('f4ZPsimulOk', '$\\sigma_z$ and $P_{+z}$ share a basis', () => V.f4ZPsimulOk === 1),
  zpPair: claim('f4ZPvalBatPlus', '$\\sigma_z = +1$ pairs with $P_{+z} = 1$; $\\sigma_z = -1$ pairs with $P_{+z} = 0$', () => close(V.f4ZPvalBatPlus, 1) && close(V.f4ZPvalBatMinus, 0)),
  xzComm: claim('f4XZcomm', 'the largest entry of $[\\sigma_x, \\sigma_z]$ has size $2$', () => close(V.f4XZcomm, 2)),
  xzNoSimul: claim('f4XZnoSimul', '$\\sigma_x$ and $\\sigma_z$ share no common eigenbasis', () => V.f4XZnoSimul === 1),
  iComm: claim('f4Icomm', '$[I, \\sigma_x] = 0$', () => close(V.f4Icomm, 0)),
  iBasis: claim('f4IbasisDiff', 'any orthonormal basis rebuilds $I$ the same way', () => close(V.f4IbasisDiff, 0)),
  projValLow: claim('f4ProjValLow', '$P_{+x}$\u2019s eigenvalue $0$', () => close(V.f4ProjValLow, 0)),
  projValHigh: claim('f4ProjValHigh', '$P_{+x}$\u2019s eigenvalue $1$', () => close(V.f4ProjValHigh, 1)),
  zValNeg: claim('f4ZvalNeg', '$\\sigma_z$\u2019s eigenvalue $-1$: below the line', () => close(V.f4ZvalNeg, -1)),
  halfIXisProj: claim('f4HalfIXisProj', '$\\tfrac12(I+X) = P_{+x}$ exactly', () => close(V.f4HalfIXisProj, 0)),
  sqrtProj: claim('f4SqrtProjDiff', '$\\sqrt{P_{+x}} = P_{+x}$: a projector is its own square root', () => close(V.f4SqrtProjDiff, 0)),
  shearSV: claim('f4ShearSV0', `the shear\u2019s singular values, $${d(V.f4ShearSV0, 4)}$ and $${d(V.f4ShearSV1, 4)}$`, () => V.f4ShearSV0 > V.f4ShearSV1 && V.f4ShearSV1 > 0),
  posNotProj: claim('f4PosNotProjLow', `$I + \\tfrac12(X+Z)$\u2019s eigenvalues, $${d(V.f4PosNotProjHigh, 4)}$ and $${d(V.f4PosNotProjLow, 4)}$`, () => close(V.f4PosNotProjLow, 1 - Math.SQRT1_2) && close(V.f4PosNotProjHigh, 1 + Math.SQRT1_2)),
  projIdem: claim('f4ProjIdemDiff', '$P_{+x}^2 = P_{+x}$', () => close(V.f4ProjIdemDiff, 0)),
  eTrace: claim('f4ETrace', 'eigenvalues $3$ and $-1$ sum to a trace of $2$', () => close(V.f4ETrace, 2)),
  hermEx1Max: claim('f4HermEx1Max', `$\\begin{pmatrix}2&i\\\\-i&2\\end{pmatrix}$\u2019s larger eigenvalue, $3$`, () => close(V.f4HermEx1Max, 3)),
  plusMinusXOverlap: claim('f4PlusMinusXOverlap', '$|\\langle{+}x|{-}x\\rangle| = 0$', () => close(V.f4PlusMinusXOverlap, 0)),
  gsAngleDeg: claim('f4GsAngleDeg', `the $S_x$ eigenvector sits at $${d(V.f4GsAngleDeg, 0)}^\\circ$, on the equator`, () => close(V.f4GsAngleDeg, 90)),
  sqrtDiag49: claim('f4SqrtDiag49Val', '$\\sqrt{\\operatorname{diag}(4,9)} = \\operatorname{diag}(2,3)$: larger entry $3$', () => close(V.f4SqrtDiag49Val, 3)),
  expHalfZPi: claim('f4ExpHalfZPiRe', `$e^{-i(\\frac12\\sigma_z)\\pi} = \\operatorname{diag}(-i, i)$: real part $0$`, () => close(V.f4ExpHalfZPiRe, 0)),
  half: claim('f4Half', 'the coefficient $\\tfrac12$', () => close(V.f4Half, 0.5)),
  shearSV1: claim('f4ShearSV1', `the shear\u2019s smaller singular value, $${d(V.f4ShearSV1, 4)}$`, () => V.f4ShearSV1 > 0 && V.f4ShearSV1 < V.f4ShearSV0),
  posNotProjHigh: claim('f4PosNotProjHigh', `$I + \\tfrac12(X+Z)$\u2019s larger eigenvalue, $${d(V.f4PosNotProjHigh, 4)}$`, () => close(V.f4PosNotProjHigh, 1 + Math.SQRT1_2)),
}

/* ---------------------------------------------------------------------------------------------- */
/* f4-eigen — The arrows a machine only stretches                                                   */
/* ---------------------------------------------------------------------------------------------- */

const eigen: Beat[] = [
  {
    id: 'f4-eigen:b1',
    phase: 'core',
    introduces: ['qc-eigenvalue', 'qc-eigenvector'],
    text:
      'Chapter F3 saw a matrix move arrows. For some arrows it does something simple: it only stretches them, never turning them. An [[qc-eigenvector|eigenvector]] of $A$ is an arrow $A$ only scales, $A|a\\rangle = \\lambda|a\\rangle$, and the scale $\\lambda$ is its [[qc-eigenvalue|eigenvalue]]. The zero arrow does not count.',
    formal:
      `A nonzero $|a\\rangle$ with $A|a\\rangle = \\lambda|a\\rangle$, for a possibly complex $\\lambda$, is an [[qc-eigenvector|eigenvector]] of $A$ with [[qc-eigenvalue|eigenvalue]] $\\lambda$ (Axler Eq. 5.5, p. 133). On $\\tfrac12(X+Z)$ the arrow $|{+}n\\rangle$ at $\\theta = 45^\\circ$ is only stretched, by $1/\\sqrt2 = ${d(V.f4XZvalHigh, 4)}$.`,
    caption: 'the arrow $A$ only stretches, never turns',
    captionFormal: 'Rosetta: Axler writes the adjoint as $A^*$ and reads his [[qc-inner-product|inner product]] linear in the SECOND slot, ours in the first; a scalar $\\lambda$ is an eigenvalue',
    stage: opsM([['1/2', '1/2'], ['1/2', '-1/2']]),
    claims: [C.xzValHigh],
  },
  {
    id: 'f4-eigen:b2',
    phase: 'core',
    introduces: ['qc-characteristic-equation'],
    text:
      'To find the eigenvalues, ask when $A - \\lambda I$ squashes some arrow to zero. That happens exactly when its determinant (Chapter F3) is zero: the [[qc-characteristic-equation|characteristic equation]] $\\det(A - \\lambda I) = 0$. For a 2×2 table it is the quadratic $\\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A = 0$.',
    formal:
      '$\\lambda$ is an eigenvalue iff $A - \\lambda I$ is not invertible, i.e. $\\det(A - \\lambda I) = 0$, the [[qc-characteristic-equation|characteristic polynomial]] (Axler Eq. 5.27, p. 163). For 2×2, $\\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A = 0$. For $\\tfrac12(X+Z)$: $\\operatorname{tr} = 0$, $\\det = -0.5$, so $\\lambda^2 = 0.5$.',
    caption: `$\\lambda^2 - 0\\cdot\\lambda - 0.5 = 0$, so $\\lambda = \\pm${d(V.f4XZvalHigh, 4)}$`,
    captionFormal: '$\\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A = 0$',
    stage: mx(lin(['+1/2', pa('X')], ['+1/2', pa('Z')]), { spectrum: 'bars' }),
    derivation: {
      result: '\\lambda^2 - (\\operatorname{tr}\\,A)\\lambda + \\det A = 0',
      ground: [
        { tex: 'A|a\\rangle = \\lambda|a\\rangle \\Rightarrow (A - \\lambda I)|a\\rangle = 0', why: 'An eigenvector is squashed to zero by $A - \\lambda I$.', view: opsM([['1/2', '1/2'], ['1/2', '-1/2']]), viewCaption: 'the operator $\\tfrac12(X+Z)$' },
        { tex: '(A - \\lambda I)\\text{ squashes a nonzero arrow} \\Leftrightarrow \\det(A - \\lambda I) = 0', why: 'A table kills an arrow only when its determinant (Chapter F3) is zero.' },
        { tex: '\\det\\begin{pmatrix}a - \\lambda & b\\\\ c & d - \\lambda\\end{pmatrix} = (a-\\lambda)(d-\\lambda) - bc', why: 'Write out the 2×2 determinant.' },
        { tex: '= \\lambda^2 - (a + d)\\lambda + (ad - bc)', why: 'Multiply out; $a + d = \\operatorname{tr} A$, $ad - bc = \\det A$.', view: mx(lin(['+1/2', pa('X')], ['+1/2', pa('Z')]), { spectrum: 'bars' }), viewCaption: 'the two roots as bars, $\\pm0.707$' },
        { tex: '\\lambda^2 - (\\operatorname{tr}\\,A)\\lambda + \\det A = 0', why: 'So the eigenvalues solve this quadratic.' },
      ],
      formal: [
        { tex: '\\det(A - \\lambda I) = 0', why: '$A - \\lambda I$ singular (Axler Eq. 5.27).', view: opsM([['1/2', '1/2'], ['1/2', '-1/2']]) },
        { tex: '\\lambda^2 - (\\operatorname{tr}\\,A)\\lambda + \\det A = 0', why: 'the $2\\times2$ characteristic polynomial.', view: mx(lin(['+1/2', pa('X')], ['+1/2', pa('Z')]), { spectrum: 'bars' }) },
      ],
    },
    claims: [C.xzTr, C.xzDet, C.xzPolyDet, C.xzValHigh, C.xzValLow],
  },
  {
    id: 'f4-eigen:b3',
    phase: 'core',
    text:
      `The two eigenvalues $\\pm${d(V.f4XZvalHigh, 4)}$ are the two stretches. Each has its own eigenvector: the $+${d(V.f4XZvalHigh, 4)}$ arrow points at $45^\\circ$ in the $x$–$z$ plane, the other at right angles to it. On the operator-space picture the arrow's length is half the gap, $${d(V.f4XZvalHigh, 4)}$, and its midpoint sits at $0$.`,
    formal:
      `$\\tfrac12(X+Z) = \\tfrac1{\\sqrt2}\\,\\mathbf n\\cdot\\boldsymbol\\sigma$ with $\\mathbf n = (1, 0, 1)/\\sqrt2$, so its eigenvectors are $|{\\pm}n\\rangle$ and its eigenvalues $\\pm1/\\sqrt2$. In operator space the arrow's length is half the eigenvalue gap, $${d(V.f4XZvalHigh, 4)}$, and its direction is the $+$ eigenvector (Axler 5A).`,
    caption: `two stretches $\\pm${d(V.f4XZvalHigh, 4)}$, two directions at right angles`,
    captionFormal: '$\\mathbf n = (1, 0, 1)/\\sqrt2$; eigenvalues $\\pm1/\\sqrt2$',
    stage: split(opsM([['1/2', '1/2'], ['1/2', '-1/2']]), bl({ thetaDeg: 45, phiDeg: 0 })),
    claims: [C.xzValHigh, C.xzValLow, C.xzVecPlus, C.xzGap],
  },
  {
    id: 'f4-eigen:b4',
    phase: 'books',
    introduces: ['qc-degenerate'],
    text:
      'A stretch can repeat. The table $Z \\otimes Z$ (Chapter F6\u2019s language) stretches by $+1$ in two directions and $-1$ in two more: a repeated eigenvalue is [[qc-degenerate|degenerate]]. A degenerate value still has a whole plane of eigenvectors. The shear $\\begin{pmatrix}2 & 1\\\\ 0 & 2\\end{pmatrix}$ is different: $2$ repeats, but only one arrow survives.',
    formal:
      'A $\\lambda$ whose eigenspace has dimension $> 1$ is [[qc-degenerate|degenerate]] (Axler 5A). $Z \\otimes Z$ has eigenvalues $+1, +1, -1, -1$, each a 2-dimensional eigenspace. A defective matrix, like the shear with the single eigenvalue $2$ and one eigenvector $(1, 0)$, is **not** diagonalizable — a case the next unit\u2019s Hermitian tables never show.',
    caption: '$+1$ twice, $-1$ twice: a degenerate table',
    captionFormal: '$Z\\otimes Z$: eigenvalues $+1, +1, -1, -1$; the shear is defective',
    stage: mx(pa('ZZ'), { spectrum: 'bars' }),
    refs: [axler('5A, p. 133', 'Eigenspaces and degeneracy.'), axler('5.27, p. 163', 'The characteristic polynomial of a 2×2 operator.')],
    claims: [C.zzValLow, C.zzValHigh, C.shearEig, C.shearVecCount],
  },
  {
    id: 'f4-eigen:b5',
    phase: 'clue',
    text: 'The quarter-turn $R = \\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}$ turns every real arrow by $90^\\circ$. So no real arrow is only stretched. Does $R$ have any eigenvectors at all?',
    formal: 'The rotation $R$ (by $90^\\circ$) fixes no real direction. Does it have complex eigenvalues?',
    stage: mx(lin(['-i', pa('Y')])),
    reveal: {
      text:
        'Yes, but the eigenvalues are imaginary: $\\pm i$. The characteristic equation is $\\lambda^2 + 1 = 0$, which has no real root but two complex ones. The eigenvectors are complex arrows. A real turn hides complex stretch directions.',
      formal:
        '$\\det(R - \\lambda I) = \\lambda^2 + 1 = 0$, so $\\lambda = \\pm i$ with eigenvectors $(1, \\mp i)/\\sqrt2$ (Chapter F1 built $i$ for exactly this). Over the complex numbers every square matrix has an eigenvalue (the fundamental theorem of algebra); the next unit asks which matrices keep them real.',
      caption: '$R$: eigenvalues $\\pm i$, not real',
      stage: cp({ spokes: { phasesDeg: [90, 270] } }),
      claims: [C.rPoly, C.rVal],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f4-hermitian — Tables equal to their own mirror                                                  */
/* ---------------------------------------------------------------------------------------------- */

const hermitian: Beat[] = [
  {
    id: 'f4-hermitian:b1',
    phase: 'core',
    introduces: ['qc-hermitian'],
    text:
      'A table is [[qc-hermitian|Hermitian]] when it equals its own mirror: flip it across the diagonal, conjugate every entry (Chapter F1\u2019s mirror). Nothing changes: $A = A^\\dagger$. The diagonal entries must then be real. $\\sigma_x = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}$ is Hermitian; so is $\\tfrac12(X+Z)$.',
    formal:
      '$A$ is [[qc-hermitian|Hermitian]] (Axler: self-adjoint) when $A = A^\\dagger$, i.e. $A_{ij} = A_{ji}^*$ (Axler Eq. 7.10, p. 233; the adjoint is Chapter F3\u2019s $\\dagger$). Diagonal entries are real. Hermitian matrices are the real-valued observables of physics; this unit proves the two facts that make them so.',
    caption: '$A = A^\\dagger$: the table is its own mirror',
    captionFormal: '$A_{ij} = A_{ji}^*$; $\\sigma_x = \\sigma_x^\\dagger$',
    stage: mx(pa('X')),
    claims: [C.xHerm, C.xEqAdj],
    fidelity: ['qc-matrix-entries'],
  },
  {
    id: 'f4-hermitian:b2',
    phase: 'core',
    text:
      'A Hermitian table always stretches by real amounts. For a 2×2 Hermitian $\\begin{pmatrix}a & b\\\\ b^* & d\\end{pmatrix}$ the characteristic equation\u2019s discriminant is $(a - d)^2 + 4|b|^2$, a sum of squares. It is never negative, so the two eigenvalues are always real.',
    formal:
      'For $\\begin{pmatrix}a & b\\\\ b^* & d\\end{pmatrix}$ (with $a, d$ real), $\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}$. The discriminant is $\\ge 0$, so $\\lambda$ is real (Axler Eq. 7.13, p. 234, the general statement). Contrast $R$, not Hermitian, with eigenvalues $\\pm i$.',
    caption: 'the discriminant $(a-d)^2 + 4|b|^2 \\ge 0$: real stretches',
    captionFormal: '$\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}$',
    stage: mx(pa('X'), { spectrum: 'bars' }),
    derivation: {
      result: '\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}',
      ground: [
        { tex: 'A = \\begin{pmatrix}a & b\\\\ b^* & d\\end{pmatrix},\\ a, d\\ \\text{real}', why: 'A Hermitian 2×2: real diagonal, mirror corners.', view: opsM([['0', '1'], ['1', '0']]), viewCaption: '$\\sigma_x$: $a = d = 0$, $b = 1$' },
        { tex: '\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}', why: 'The quadratic formula on the previous unit\u2019s polynomial ($\\det A = ad - |b|^2$).' },
        { tex: '(a-d)^2 + 4|b|^2 \\ge 0', why: 'A sum of squares is never negative, so the root is real.' },
        { tex: '\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}', why: 'Both eigenvalues are real.', view: mx(pa('X'), { spectrum: 'bars' }), viewCaption: 'bars at $+1$ and $-1$, both real' },
      ],
      formal: [
        { tex: '\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2},\\ \\text{discriminant} \\ge 0', why: 'Hermiticity makes $bb^* = |b|^2 \\ge 0$.', view: opsM([['0', '1'], ['1', '0']]) },
        { tex: '\\lambda = \\tfrac{a+d}2 \\pm \\tfrac12\\sqrt{(a-d)^2 + 4|b|^2}', why: 'real for every Hermitian 2×2.', view: mx(pa('X'), { spectrum: 'bars' }) },
      ],
    },
    claims: [C.xValLow, C.xValHigh, C.rVal],
  },
  {
    id: 'f4-hermitian:b3',
    phase: 'core',
    text:
      'This holds in any size, not just 2×2: a Hermitian table\u2019s eigenvalues are always real. The 709 notes prove it directly, sandwiching $A$ between a bra and ket two ways (p. 15). We cite that proof instead of repeating it.',
    formal:
      'In any dimension, a Hermitian operator\u2019s eigenvalues are real (Axler Eq. 7.13; the notes prove it on p. 15 by comparing $\\langle a|A|a\\rangle$ read as $A$ acting on the ket against $A = A^\\dagger$ acting on the bra). We state the result here and move to its partner fact, [[qc-orthogonal|orthogonality]].',
    caption: 'any dimension: Hermitian $\\Rightarrow$ real eigenvalues (notes p. 15)',
    captionFormal: '$\\lambda = \\lambda^*$ in any dimension (notes p. 15)',
    stage: split(opsM([['1/2', '1/2'], ['1/2', '-1/2']]), mx(lin(['+1/2', pa('X')], ['+1/2', pa('Z')]), { spectrum: 'bars' })),
    claims: [C.xzValLow, C.xzValHigh],
  },
  {
    id: 'f4-hermitian:b4',
    phase: 'core',
    text:
      'Eigenvectors with different eigenvalues point at right angles. If $A|a_1\\rangle = \\lambda_1|a_1\\rangle$ and $A|a_2\\rangle = \\lambda_2|a_2\\rangle$ with $\\lambda_1 \\ne \\lambda_2$, then $(\\lambda_1 - \\lambda_2)\\langle a_2|a_1\\rangle = 0$, so the overlap is zero. The two directions of $\\tfrac12(X+Z)$ are perpendicular.',
    formal:
      '$(\\lambda_2 - \\lambda_1)\\langle a_2|a_1\\rangle = \\langle a_2|A|a_1\\rangle - \\langle Aa_2|a_1\\rangle = 0$ (both eigenvalues real, by the previous beat), so $\\langle a_2|a_1\\rangle = 0$; a degenerate eigenspace is made [[qc-orthonormal-basis|orthonormal]] by Gram–Schmidt (Chapter F2). Hence a Hermitian operator has an orthonormal eigenbasis (Axler Eq. 7.22; notes p. 15).',
    caption: 'the two directions are at right angles: overlap $0$',
    captionFormal: '$\\langle a_2|a_1\\rangle = 0$ for $\\lambda_1 \\ne \\lambda_2$',
    stage: bl({ thetaDeg: 45, phiDeg: 0 }),
    derivation: {
      result: '\\langle a_2|a_1\\rangle = 0',
      ground: [
        { tex: 'A|a_1\\rangle = \\lambda_1|a_1\\rangle,\\ A|a_2\\rangle = \\lambda_2|a_2\\rangle,\\ \\lambda_1 \\ne \\lambda_2', why: 'Two eigenvectors, different stretches.', view: bl({ thetaDeg: 45, phiDeg: 0 }), viewCaption: `the $+${d(V.f4XZvalHigh, 4)}$ direction` },
        { tex: '\\langle a_2|A|a_1\\rangle = \\lambda_1\\langle a_2|a_1\\rangle', why: '$A$ on the ket.' },
        { tex: '\\langle a_2|A|a_1\\rangle = \\langle Aa_2|a_1\\rangle = \\lambda_2^*\\langle a_2|a_1\\rangle = \\lambda_2\\langle a_2|a_1\\rangle', why: '$A = A^\\dagger$; $\\lambda_2$ is real (the previous beat).' },
        { tex: '(\\lambda_1 - \\lambda_2)\\langle a_2|a_1\\rangle = 0 \\Rightarrow \\langle a_2|a_1\\rangle = 0', why: 'The eigenvalues differ, so the overlap is zero.', view: bl({ thetaDeg: 135, phiDeg: 0 }), viewCaption: 'the orthogonal direction, at right angles' },
      ],
      formal: [
        { tex: '(\\lambda_1 - \\lambda_2)\\langle a_2|a_1\\rangle = \\langle a_2|A|a_1\\rangle - \\langle Aa_2|a_1\\rangle = 0', why: 'self-adjointness, $\\lambda_2$ real.', view: mx(lin(['+1/2', pa('X')], ['+1/2', pa('Z')]), { basis: [amp('+x'), amp('-x')] }) },
        { tex: '\\langle a_2|a_1\\rangle = 0', why: 'a degenerate space is made orthonormal by [[qc-gram-schmidt|Gram\u2013Schmidt]] (Chapter F2).', view: bl({ thetaDeg: 135, phiDeg: 0 }) },
      ],
    },
    claims: [C.xzOrth],
  },
  {
    id: 'f4-hermitian:b5',
    phase: 'clue',
    text: '$Z \\otimes Z$ has the eigenvalue $+1$ twice. Are its two $+1$ arrows forced to be at right angles?',
    formal: 'For the degenerate eigenvalue $+1$ of $Z \\otimes Z$, must a chosen pair of eigenvectors be orthogonal?',
    stage: mx(pa('ZZ'), { spectrum: 'bars' }),
    reveal: {
      text:
        'Not automatically — any arrow in the whole $+1$ plane works, and two of them can sit at any angle. But we can always pick a right-angle pair with Gram–Schmidt. So a Hermitian table still has an [[qc-orthonormal-basis|orthonormal]] set of directions, degeneracy and all.',
      formal:
        'Within one eigenspace any basis is eigenvectors, so orthogonality is a choice, secured by Gram–Schmidt (Chapter F2). The spectral theorem (next unit) needs this: even with repeats, an orthonormal eigenbasis exists (Axler Eq. 7.29).',
      caption: '$+1$ eigenspace: a plane; pick a right-angle pair',
      stage: mx(pa('ZZ'), { blocks: 2, highlight: [[0, 0], [3, 3]] }),
      claims: [C.zzValLow, C.zzValHigh, C.zzPlusRank],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f4-spectral — Building and reading a matrix by its directions                                    */
/* ---------------------------------------------------------------------------------------------- */

const spectral: Beat[] = [
  {
    id: 'f4-spectral:b1',
    phase: 'core',
    introduces: ['qc-spectral-representation'],
    text:
      'Now run it backwards. Take each eigenvalue, multiply by the projector onto its eigenvector, and add: $A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|$, the [[qc-spectral-representation|spectral decomposition]]. For $\\sigma_x$ it is $(+1)|{+}x\\rangle\\langle{+}x| + (-1)|{-}x\\rangle\\langle{-}x|$. The projectors are Chapter F3\u2019s outer products.',
    formal:
      'Every Hermitian $A$ equals $\\sum_i \\lambda_i|a_i\\rangle\\langle a_i|$ over an orthonormal eigenbasis, the [[qc-spectral-representation|spectral decomposition]] (Axler Eq. 7.29, p. 246, the spectral theorem; N&C §2.2 Box 2.2, p. 72; notes p. 15). The eigenvalue times its [[qc-projector|projector]]; $\\sigma_x = |{+}x\\rangle\\langle{+}x| - |{-}x\\rangle\\langle{-}x|$.',
    caption: '$\\sigma_x = (+1)P_{+x} + (-1)P_{-x}$',
    captionFormal: '$A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|$',
    stage: mx(lin(['+1', out('+x')], ['-1', out('-x')])),
    claims: [C.xSpectralGap, C.xValLow, C.xValHigh],
  },
  {
    id: 'f4-spectral:b2',
    phase: 'core',
    introduces: [],
    text:
      'Change to the basis of eigenvectors (Chapter F3\u2019s change of basis). In that frame the table is diagonal, its eigenvalues down the diagonal and zeros elsewhere: $B^\\dagger A B = \\operatorname{diag}(\\lambda_1, \\lambda_2)$, where $B$\u2019s columns are the eigenvectors. For $\\sigma_x$ in the $x$-basis: $\\operatorname{diag}(1, -1)$.',
    formal:
      'With $B = [\\,|a_1\\rangle\\ |a_2\\rangle\\ \\cdots]$ (eigenvectors as columns, unitary by the hermitian unit\u2019s orthonormality), $B^\\dagger A B = D = \\operatorname{diag}(\\lambda_i)$: $A$ is [[qc-diagonalize|diagonalized]] (Axler Eq. 7.29; Chapter F3\u2019s $A\' = UAU^\\dagger$ with $U = B^\\dagger$). $\\tfrac12(X+Z)$ in its own basis is $\\operatorname{diag}(1/\\sqrt2, -1/\\sqrt2)$.',
    caption: '$\\sigma_x$ in the $x$-basis: $\\operatorname{diag}(1, -1)$',
    captionFormal: '$B^\\dagger A B = \\operatorname{diag}(\\lambda_i)$',
    stage: mx(pa('X'), { basis: [amp('+x'), amp('-x')] }),
    derivation: {
      result: 'B^\\dagger A B = \\operatorname{diag}(\\lambda_1, \\lambda_2)',
      ground: [
        { tex: 'A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|', why: 'The spectral sum (previous beat).', view: mx(lin(['+1', out('+x')], ['-1', out('-x')])), viewCaption: '$\\sigma_x$ rebuilt' },
        { tex: 'B = [\\,|a_1\\rangle\\ |a_2\\rangle\\,]', why: 'Put the eigenvectors in as columns; $B$ is unitary (orthonormal, the hermitian unit).' },
        { tex: '(B^\\dagger A B)_{ij} = \\langle a_i|A|a_j\\rangle = \\lambda_j\\delta_{ij}', why: 'Each entry is $A$ between two eigenvectors.' },
        { tex: 'B^\\dagger A B = \\operatorname{diag}(\\lambda_1, \\lambda_2)', why: 'So the table is diagonal in its own basis.', view: mx(pa('X'), { basis: [amp('+x'), amp('-x')] }), viewCaption: 'grid $\\to$ $\\operatorname{diag}(1, -1)$' },
      ],
      formal: [
        { tex: 'B^\\dagger A B = D,\\ D = \\operatorname{diag}(\\lambda_i)', why: '$B$ unitary, columns the eigenbasis (Axler Eq. 7.29).', view: mx(pa('X')) },
        { tex: 'B^\\dagger A B = \\operatorname{diag}(\\lambda_1, \\lambda_2)', why: 'Chapter F3\u2019s $A\' = UAU^\\dagger$ with $U = B^\\dagger$.', view: mx(pa('X'), { basis: [amp('+x'), amp('-x')] }) },
      ],
    },
    claims: [C.xValLow, C.xValHigh],
  },
  {
    id: 'f4-spectral:b3',
    phase: 'core',
    introduces: ['qc-function-of-operator'],
    text:
      'A function of a table acts on its eigenvalues alone: $f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|$, the [[qc-function-of-operator|function of an operator]]. Square $\\sigma_x$ and every eigenvalue squares: $(\\pm1)^2 = 1$, so $\\sigma_x^2 = I$. The square root of $\\tfrac12(I + X)$ keeps the same directions.',
    formal:
      'For $A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|$, $A^n = \\sum_i \\lambda_i^n|a_i\\rangle\\langle a_i|$ and $f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|$, the [[qc-function-of-operator|functional calculus]] (N&C Box 2.2, p. 72). $\\sigma_x^2 = I$; $\\exp(-iAt)$ and $\\sqrt A$ are read off the same way (engine `funcHermitian`).',
    caption: '$\\sigma_x^2 = I$: each $\\pm1$ squares to $1$',
    captionFormal: '$f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|$',
    stage: mx(prod(pa('X'), pa('X'))),
    derivation: {
      result: 'f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|',
      ground: [
        { tex: 'A = B D B^\\dagger,\\ D = \\operatorname{diag}(\\lambda_i)', why: 'Diagonalize (the previous beat).', view: mx(pa('X'), { basis: [amp('+x'), amp('-x')] }), viewCaption: 'the diagonal $D$' },
        { tex: 'A^2 = B D B^\\dagger B D B^\\dagger = B D^2 B^\\dagger', why: 'The middle $B^\\dagger B = I$ cancels.' },
        { tex: 'A^n = B D^n B^\\dagger', why: 'Repeat: powers act on the diagonal alone.', view: mx(prod(pa('X'), pa('X'))), viewCaption: '$\\sigma_x^2$' },
        { tex: 'f(A) = B f(D) B^\\dagger = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|', why: 'Any power series, so any function, acts on the eigenvalues.', view: mx(lin(['+1', out('+x')], ['+1', out('-x')])), viewCaption: '$\\sigma_x^2 = I = P_{+x} + P_{-x}$' },
      ],
      formal: [
        { tex: 'A^n = B D^n B^\\dagger', why: '$B^\\dagger B = I$ between factors.', view: mx(pa('X'), { basis: [amp('+x'), amp('-x')] }) },
        { tex: 'f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|', why: 'functional calculus (N&C Box 2.2); $\\sigma_x^2 = I$, $\\sqrt P = P$.', view: mx(prod(pa('X'), pa('X'))) },
      ],
    },
    claims: [C.xsqIsI, C.xzSqrt],
  },
  {
    id: 'f4-spectral:b4',
    phase: 'books',
    text:
      'This works in any size, not just 2×2. A 4×4 Hermitian table like $Z \\otimes Z$ still splits into its directions: $Z \\otimes Z = P_+ - P_-$. $P_+$ projects onto its whole $+1$ plane, $P_-$ onto the $-1$ plane. The spectral recipe adds one term per distinct eigenvalue.',
    formal:
      'In dimension $n$, $A = \\sum_\\lambda \\lambda\\, P_\\lambda$ with $P_\\lambda$ the orthogonal projector onto the $\\lambda$-eigenspace, $\\sum_\\lambda P_\\lambda = I$, $P_\\lambda P_\\mu = \\delta_{\\lambda\\mu}P_\\lambda$ (Axler Eq. 7.29; N&C §2.2). $Z\\otimes Z = P_+ - P_-$, each $P_\\pm$ of rank 2. (A **[[qc-normal-operator|normal operator]]**, $AA^\\dagger = A^\\dagger A$, is exactly the broader class this theorem covers — Hermitian is the real-eigenvalue special case, Axler Eq. 7.24.)',
    caption: '$Z \\otimes Z = P_+ - P_-$: one term per distinct stretch',
    captionFormal: '$A = \\sum_\\lambda \\lambda P_\\lambda$, $\\sum_\\lambda P_\\lambda = I$',
    stage: mx(pa('ZZ'), { spectrum: 'bars', blocks: 2 }),
    refs: [axler('7.29, p. 246', 'The complex spectral theorem.'), nc('§2.2, p. 72', 'The spectral decomposition and Box 2.2.')],
    claims: [C.zzValLow, C.zzValHigh, C.zzProj],
  },
  {
    id: 'f4-spectral:b5',
    phase: 'clue',
    text: '$\\sigma_x$ has eigenvalues $+1$ and $-1$. Squaring gives $\\sigma_x^2 = I$, whose eigenvalues are both $+1$. If we only knew $\\sigma_x^2$, could we get $\\sigma_x$ back?',
    formal: 'From $A^2 = I$ alone, is $A$ determined? What does the functional calculus say about $\\sqrt{\\cdot}$?',
    stage: mx(prod(pa('X'), pa('X'))),
    reveal: {
      text:
        'No. Squaring throws away the sign of each eigenvalue, so many tables share the same square. A square root must choose a sign for each direction. $I$ has square roots $\\sigma_x$, $\\sigma_z$, $I$ itself, and more.',
      formal:
        '$A \\mapsto A^2$ is many-to-one: any $A = \\sum_i (\\pm1)|a_i\\rangle\\langle a_i|$ squares to $I$. A function is single-valued only once a branch is fixed per eigenvalue; the **positive** square root (every $\\sqrt{\\lambda_i} \\ge 0$) needs $A \\ge 0$ (the positive unit, next).',
      caption: '$\\sigma_x^2 = \\sigma_z^2 = I$: the square forgets the sign',
      stage: mx(pa('X'), { spectrum: 'bars' }),
      claims: [C.xsqIsI, C.zsqIsI],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f4-unitary — Machines that keep every length                                                     */
/* ---------------------------------------------------------------------------------------------- */

const unitary: Beat[] = [
  {
    id: 'f4-unitary:b1',
    phase: 'core',
    introduces: ['qc-unitary'],
    text:
      `A [[qc-unitary|unitary]] table keeps every length: $|Uv| = |v|$ for every arrow. In entries this means its columns are perpendicular unit arrows, $U^\\dagger U = I$. The Hadamard table $H$, entries $\\pm${d(V.f4HonZero0, 4)}$, is unitary; so is the quarter-turn $R$.`,
    formal:
      '$U$ is [[qc-unitary|unitary]] (Axler: an isometry) when $U^\\dagger U = UU^\\dagger = I$, equivalently $\\langle Uv|Uw\\rangle = \\langle v|w\\rangle$ for all $v, w$ (Axler Eq. 7.51, p. 270; Chapter F3\u2019s $\\dagger$). Its columns are an orthonormal basis. Unitaries are the length- and angle-preserving maps — the quantum gates of later chapters.',
    caption: '$U^\\dagger U = I$: columns are perpendicular unit arrows',
    captionFormal: '$\\langle Uv|Uw\\rangle = \\langle v|w\\rangle$; $H^\\dagger H = I$',
    stage: mx(prod(adj(gate('H')), gate('H'))),
    claims: [C.hUnitary, C.hdH, C.hOnZero],
  },
  {
    id: 'f4-unitary:b2',
    phase: 'core',
    text:
      'Why do lengths stay? Because $|Uv|^2 = \\langle Uv|Uv\\rangle = \\langle v|U^\\dagger U|v\\rangle = \\langle v|v\\rangle = |v|^2$. The middle collapses because $U^\\dagger U = I$. So a unitary turns and reflects the whole space but never stretches it: a rigid motion.',
    formal:
      '$\\|Uv\\|^2 = \\langle v|U^\\dagger U|v\\rangle = \\langle v|v\\rangle = \\|v\\|^2$, so $U$ is an isometry (Axler Eq. 7.51). Conversely an isometry is unitary. $H$ sends $|0\\rangle \\to |{+}x\\rangle$, $|1\\rangle \\to |{-}x\\rangle$: an orthonormal basis to an orthonormal basis, each of length 1.',
    caption: '$|Uv| = |v|$: no stretch, only turn',
    captionFormal: '$\\|Uv\\|^2 = \\langle v|U^\\dagger U|v\\rangle = \\|v\\|^2$',
    stage: bl('+x'),
    derivation: {
      result: '\\|Uv\\| = \\|v\\|',
      ground: [
        { tex: 'U^\\dagger U = I', why: 'The defining property of a unitary (previous beat).', view: mx(prod(adj(gate('H')), gate('H'))), viewCaption: '$H^\\dagger H = I$' },
        { tex: '\\|Uv\\|^2 = \\langle Uv|Uv\\rangle', why: 'Length squared is the [[qc-inner-product|inner product]] of an arrow with itself (Chapter F2).' },
        { tex: '= \\langle v|U^\\dagger U|v\\rangle = \\langle v|v\\rangle', why: 'Move $U^\\dagger$ across (Chapter F3), then $U^\\dagger U = I$.' },
        { tex: '\\|Uv\\| = \\|v\\|', why: 'A unitary keeps every length.', view: bl('+x'), viewCaption: '$H$: $|0\\rangle \\to |{+}x\\rangle$, same length' },
      ],
      formal: [
        { tex: '\\|Uv\\|^2 = \\langle v|U^\\dagger U|v\\rangle = \\|v\\|^2', why: '$U^\\dagger U = I$ (Axler Eq. 7.51).', view: mx(prod(adj(gate('H')), gate('H'))) },
        { tex: '\\|Uv\\| = \\|v\\|', why: '$U$ is an isometry; conversely every isometry is unitary.', view: bl('+x') },
      ],
    },
    claims: [C.hOnZero, C.hPreservesNorm],
  },
  {
    id: 'f4-unitary:b3',
    phase: 'core',
    introduces: ['qc-unitary-eigenvalue'],
    text:
      'Since a unitary keeps lengths, every eigenvalue has size 1: $|Ua| = |\\lambda||a| = |a|$ forces $|\\lambda| = 1$. So the [[qc-unitary-eigenvalue|eigenvalues lie on the unit circle]] (Chapter F1), as $e^{i\\theta}$. The phase gate $S = \\operatorname{diag}(1, i)$ has eigenvalues $1$ and $i$.',
    formal:
      'If $U|a\\rangle = \\lambda|a\\rangle$ and $U$ is unitary, $\\|a\\| = \\|Ua\\| = |\\lambda|\\,\\|a\\|$, so $|\\lambda| = 1$: the [[qc-unitary-eigenvalue|eigenvalues lie on the unit circle]], $\\lambda = e^{i\\theta}$ (Axler 7E). $S = \\operatorname{diag}(1, i)$; $H$ has $\\pm1$; $e^{-i\\sigma_z t}$ has $e^{\\mp it}$.',
    caption: 'every eigenvalue has size 1: on the unit circle',
    captionFormal: '$|\\lambda| = 1$, $\\lambda = e^{i\\theta}$',
    stage: split(mx(gate('S')), cp({ spokes: { phasesDeg: [0, 90], sizes: [1, 1] } })),
    claims: [C.sAbsEig],
  },
  {
    id: 'f4-unitary:b4',
    phase: 'books',
    text:
      'A [[qubit|qubit]] unitary turns the [[qc-bloch-sphere|Bloch sphere]]. Every $U = e^{-i\\theta\\,\\mathbf n\\cdot\\boldsymbol\\sigma/2}$ rotates the sphere by $\\theta$ about the axis $\\mathbf n$. Its eigenvectors are $|{\\pm}n\\rangle$, the poles of the turn, and its eigenvalues are $e^{\\mp i\\theta/2}$. Running a Hermitian $H$ as $e^{-iHt}$ makes time a rotation.',
    formal:
      '$e^{-iHt} = \\sum_i e^{-i\\lambda_i t}|a_i\\rangle\\langle a_i|$ (the functional calculus), a unitary with the **same** eigenvectors as $H$ and eigenvalues $e^{-i\\lambda_i t}$ on the unit circle. For $H = \\tfrac12\\mathbf n\\cdot\\boldsymbol\\sigma$ it is the Bloch rotation about $\\mathbf n$ by $t$ (Axler 7E; engine `expmHermitian`, `unitaryAction`).',
    caption: '$e^{-i\\sigma_z t}$: a turn about the $z$ axis',
    captionFormal: '$e^{-iHt} = \\sum_i e^{-i\\lambda_i t}|a_i\\rangle\\langle a_i|$',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } }, trail: true }),
    refs: [axler('7E, p. 270', 'Isometries and unitaries.')],
    claims: [C.rzActionAngle, C.rzEig],
  },
  {
    id: 'f4-unitary:b5',
    phase: 'clue',
    text: '$\\sigma_x$ is Hermitian ($A = A^\\dagger$). It is also unitary ($A^\\dagger A = I$). Which eigenvalues can a table with both properties have?',
    formal: 'If $A = A^\\dagger$ and $A^\\dagger A = I$, what are $A$\u2019s eigenvalues?',
    stage: mx(pa('X'), { spectrum: 'bars' }),
    reveal: {
      text:
        'Only $+1$ and $-1$. Hermitian forces the eigenvalues real; unitary forces them size 1. The only real numbers of size 1 are $\\pm1$. So $A^2 = I$, and $\\sigma_x$, $\\sigma_z$, the Pauli matrices are all of this kind.',
      formal:
        'Real (Hermitian) and on the unit circle (unitary) means $\\lambda \\in \\{+1, -1\\}$, so $A^2 = I$: $A$ is a reflection. The [[qc-pauli-matrices|Pauli matrices]] are the Hermitian **and** unitary $2\\times2$ tables (Axler 7A, 7E).',
      caption: 'Hermitian + unitary $\\Rightarrow$ eigenvalues $\\pm1$, $A^2 = I$',
      stage: mx(prod(pa('X'), pa('X'))),
      claims: [C.xHerm, C.xIsUnitary, C.xsqIsI],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f4-commuting — When two machines share directions                                                */
/* ---------------------------------------------------------------------------------------------- */

const commuting: Beat[] = [
  {
    id: 'f4-commuting:b1',
    phase: 'core',
    introduces: ['qc-simultaneous-eigenbasis'],
    text:
      'Two Hermitian tables can sometimes be diagonalized at once: they share a set of eigenvectors, a [[qc-simultaneous-eigenbasis|simultaneous eigenbasis]]. Then each shared arrow is an eigenvector of both. $\\sigma_z$ and the projector $P_{+z} = \\tfrac12(I + \\sigma_z)$ share the $z$ directions.',
    formal:
      '$A$ and $B$ have a [[qc-simultaneous-eigenbasis|simultaneous eigenbasis]] — one orthonormal basis of common eigenvectors — iff they [[qc-commutator|commute]], $[A, B] = AB - BA = 0$ (Axler 5E, p. 175; notes p. 16). $\\sigma_z$ and $P_{+z} = \\tfrac12(I+\\sigma_z)$ are both diagonal in the $z$ basis.',
    caption: '$\\sigma_z$ and $P_{+z}$: the same two directions',
    captionFormal: 'a common orthonormal eigenbasis',
    stage: mx(pa('Z')),
    claims: [C.zpSimulOk, C.zpPair],
  },
  {
    id: 'f4-commuting:b2',
    phase: 'core',
    text:
      'The test is whether order matters. If $AB = BA$, the tables commute, and a shared eigenbasis exists. If $AB \\ne BA$, no shared basis can exist. $\\sigma_x$ and $\\sigma_z$ fail: $\\sigma_x\\sigma_z \\ne \\sigma_z\\sigma_x$, so they have no common directions.',
    formal:
      'If $[A, B] = 0$ and $A$\u2019s eigenvalues are distinct, then $0 = \\langle a_i|[A,B]|a_j\\rangle = (\\lambda_i - \\lambda_j)\\langle a_i|B|a_j\\rangle$ forces $B$ diagonal in $A$\u2019s eigenbasis (notes p. 16). Diagonal tables commute, so the condition is exact (Axler 5E). $[\\sigma_x, \\sigma_z] = -2i\\sigma_y \\ne 0$.',
    caption: '$\\sigma_x\\sigma_z \\ne \\sigma_z\\sigma_x$: no shared directions',
    captionFormal: '$[A, B] = 0 \\Leftrightarrow$ simultaneously diagonalizable',
    stage: mx(prod(pa('X'), pa('Z'))),
    derivation: {
      result: '[A, B] = 0 \\Leftrightarrow\\ A, B\\ \\text{share an eigenbasis}',
      ground: [
        { tex: '[A, B] = 0,\\quad A|a_i\\rangle = \\lambda_i|a_i\\rangle', why: '$A$, $B$ commute; $A$ has distinct eigenvalues.', view: mx(pa('Z')), viewCaption: '$\\sigma_z$ and $P_{+z}$, both diagonal in $z$' },
        { tex: '\\langle a_i|[A, B]|a_j\\rangle = 0', why: 'The commutator is zero, so every entry is.' },
        { tex: '(\\lambda_i - \\lambda_j)\\langle a_i|B|a_j\\rangle = 0', why: 'Expand $[A,B]$; let $A$ act left and right.' },
        { tex: 'i \\ne j \\Rightarrow \\langle a_i|B|a_j\\rangle = 0', why: 'Different eigenvalues force the off-diagonal $B$ entries to vanish: $B$ is diagonal in $A$\u2019s basis.', view: mx(out('0'), { spectrum: 'bars' }), viewCaption: 'a shared eigenbasis' },
        { tex: '[A, B] = 0 \\Leftrightarrow\\ A, B\\ \\text{share an eigenbasis}', why: 'A diagonal $B$ in $A$\u2019s basis is exactly a shared eigenbasis.' },
      ],
      formal: [
        { tex: '0 = \\langle a_i|[A,B]|a_j\\rangle = (\\lambda_i - \\lambda_j)\\langle a_i|B|a_j\\rangle', why: '$A$ Hermitian, distinct spectrum (notes p. 16).', view: mx(prod(pa('X'), pa('Z'))), viewCaption: '$XZ \\ne ZX$: the failing case' },
        { tex: '[A, B] = 0 \\Leftrightarrow\\ A, B\\ \\text{share an eigenbasis}', why: 'diagonal tables commute (Axler 5E).', view: mx(out('0')) },
      ],
    },
    claims: [C.xzComm, C.xzNoSimul],
  },
  {
    id: 'f4-commuting:b3',
    phase: 'clue',
    text: 'The identity $I$ commutes with every table. Does that mean $I$ shares a special set of directions with each one?',
    formal: '$[I, A] = 0$ for all $A$. What is $I$\u2019s eigenbasis, and why does it never conflict?',
    stage: mx(lin(['+1', out('+x')], ['+1', out('-x')])),
    reveal: {
      text:
        '$I$ stretches every arrow by $1$, so **every** arrow is its eigenvector. It has no directions of its own to insist on, so it fits any table\u2019s eigenbasis. A degenerate table, with one eigenvalue everywhere, is this flexible too.',
      formal:
        '$I = 1\\cdot I$ has the single eigenvalue $1$ with the whole space as its eigenspace, so any orthonormal basis diagonalizes it. A fully degenerate operator (one eigenvalue) commutes with all; distinct eigenvalues are what pin a basis down (Axler 5E).',
      caption: '$I$: every arrow is an eigenvector',
      stage: mx(lin(['+1', out('0')], ['+1', out('1')])),
      claims: [C.iComm, C.iBasis],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f4-positive — Tables with no negative stretch; square roots                                      */
/* ---------------------------------------------------------------------------------------------- */

const positive: Beat[] = [
  {
    id: 'f4-positive:b1',
    phase: 'core',
    introduces: ['qc-positive-operator'],
    text:
      'A Hermitian table is [[qc-positive-operator|positive]] when it never stretches an arrow backwards: $\\langle v|A|v\\rangle \\ge 0$ for every arrow. That happens exactly when no eigenvalue is negative. The projector $P_{+x}$, with eigenvalues $1$ and $0$, is positive; $\\sigma_z$, with a $-1$, is not.',
    formal:
      '$A \\ge 0$ (a [[qc-positive-operator|positive operator]]) iff $A = A^\\dagger$ and $\\langle v|A|v\\rangle \\ge 0$ for all $v$, iff its spectrum is $\\ge 0$ (Axler Eq. 7.43, p. 251). $P_{+x} \\ge 0$ (eigenvalues 1, 0); $\\sigma_z$ has $-1$, so $\\sigma_z \\not\\ge 0$. Every $A^\\dagger A$ is positive.',
    caption: '$P_{+x}$: eigenvalues $1$ and $0$, none negative',
    captionFormal: '$A \\ge 0 \\Leftrightarrow$ spectrum $\\ge 0$',
    stage: mx(out('+x'), { spectrum: 'bars' }),
    claims: [C.projValLow, C.projValHigh, C.zValNeg],
  },
  {
    id: 'f4-positive:b2',
    phase: 'core',
    text:
      'A positive table has a positive square root. Take the positive square root of each eigenvalue, keep the same directions, and add: $\\sqrt A = \\sum_i \\sqrt{\\lambda_i}|a_i\\rangle\\langle a_i|$. Its square is $A$. The square root of $\\tfrac12(I + X)$ has eigenvalues $1$ and $0$.',
    formal:
      'For $A \\ge 0$, $\\sqrt A = \\sum_i \\sqrt{\\lambda_i}|a_i\\rangle\\langle a_i| \\ge 0$ is the unique positive [[qc-operator-square-root|operator square root]] with $(\\sqrt A)^2 = A$ (Axler Eq. 7.44–7.52, pp. 258–260; engine `sqrtPSD`/`funcHermitian`). It needs $\\lambda_i \\ge 0$, which is why the branch is fixed here and not in the spectral unit.',
    caption: '$\\sqrt A$: the square root of each stretch, same directions',
    captionFormal: '$\\sqrt A = \\sum_i \\sqrt{\\lambda_i}|a_i\\rangle\\langle a_i|$',
    stage: mx(lin(['+1/2', pa('I')], ['+1/2', pa('X')]), { spectrum: 'bars' }),
    claims: [C.halfIXisProj, C.sqrtProj],
  },
  {
    id: 'f4-positive:b3',
    phase: 'books',
    text:
      `Even a table that is not Hermitian can be split. Any matrix is a rotation times a positive stretch: $A = U P$ with $U$ unitary and $P = \\sqrt{A^\\dagger A} \\ge 0$, the polar form. The stretch amounts are the singular values. The shear $\\begin{pmatrix}2 & 1\\\\ 0 & 2\\end{pmatrix}$ has singular values $${d(V.f4ShearSV0, 4)}$ and $${d(V.f4ShearSV1, 4)}$.`,
    formal:
      `The singular-value decomposition $A = U\\,\\Sigma\\,V^\\dagger$ ($\\Sigma \\ge 0$ diagonal, the [[qc-svd|singular-value decomposition]]) and the [[qc-polar-decomposition|polar form]] $A = U|A|$, $|A| = \\sqrt{A^\\dagger A}$, hold for every matrix (Axler Eq. 7.58, p. 285; engine \`svd\`, \`polar\`). The shear's singular values are $${d(V.f4ShearSV0, 4)}, ${d(V.f4ShearSV1, 4)}$ — its true stretch factors, unlike its repeated eigenvalue $2$.`,
    caption: `$A^\\dagger A$ for the shear: its eigenvalues’ square roots are $${d(V.f4ShearSV0, 4)}$ and $${d(V.f4ShearSV1, 4)}$`,
    captionFormal: `$A = U\\Sigma V^\\dagger$; shear $\\Sigma = (${d(V.f4ShearSV0, 4)}, ${d(V.f4ShearSV1, 4)})$, read from $A^\\dagger A$ (shown; Hermitian, unlike $A$ itself)`,
    stage: opsM([['4', '2'], ['2', '5']]),
    refs: [axler('7.58, p. 285', 'The singular-value decomposition and the polar form.'), axler('7.44\u20137.52, pp. 258\u2013260', 'The positive square root.')],
    claims: [C.shearSV, C.shearSV1, C.shearEig],
  },
  {
    id: 'f4-positive:b4',
    phase: 'clue',
    text: 'A projector squares to itself, $P^2 = P$. The table $\\tfrac12(I + X)$ is a projector. Is every positive table a projector?',
    formal: 'Is $A \\ge 0$ enough to make $A^2 = A$?',
    stage: mx(lin(['+1/2', pa('I')], ['+1/2', pa('X')]), { spectrum: 'bars' }),
    reveal: {
      text:
        `No. A projector's eigenvalues are only $0$ and $1$. A positive table can stretch by any amount $\\ge 0$, like $3$ or $5$. $\\tfrac12(X + Z) + I$ is positive (eigenvalues $${d(V.f4PosNotProjHigh, 4)}$ and $${d(V.f4PosNotProjLow, 4)}$) but squares to something else.`,
      formal:
        `$A^2 = A \\Leftrightarrow$ eigenvalues in $\\{0, 1\\}$ — a projector. $A \\ge 0$ only needs them $\\ge 0$. $I + \\tfrac12(X + Z)$ has eigenvalues $1 \\pm 1/\\sqrt2 = ${d(V.f4PosNotProjHigh, 4)}, ${d(V.f4PosNotProjLow, 4)} > 0$, so it is positive but not idempotent.`,
      caption: 'positive: eigenvalues $\\ge 0$; projector: eigenvalues $0$ or $1$',
      stage: mx(lin(['+1', pa('I')], ['+1/2', pa('X')], ['+1/2', pa('Z')]), { spectrum: 'bars' }),
      claims: [C.posNotProj, C.posNotProjHigh, C.projIdem],
    },
  },
]

export const F4_STORY: Record<string, Beat[]> = {
  'f4-eigen': eigen,
  'f4-hermitian': hermitian,
  'f4-spectral': spectral,
  'f4-unitary': unitary,
  'f4-commuting': commuting,
  'f4-positive': positive,
}
