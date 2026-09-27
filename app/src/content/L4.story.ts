/**
 * Lecture 4 scroll story (owner: P). Beats per docs/roles/proposals/P-L4-story.md §1, with the judge's rulings:
 * `l4-projectors` and `l4-average` are second passes of Units 3.3 and 3.6 (one link-back beat each, defining nothing);
 * operator space shows the σ passport only from `l4-matrices:b5`, where the Pauli matrices are defined (`b4` uses
 * `labels: 'plain'`); Ŝz|ψ⟩ is drawn with the hilbert-plane `image` at its true length; the 60° preparation magnet
 * is a real bench device (fidelity `lab-prep-tilted`). The conditional √N beat (`l4-average:b7` of the plan) is
 * dropped: Lecture 3 already uses Townsend's √N remark (Unit 3.6 refs, widget caption and pitfall).
 *
 * Rules kept here (as in L1–L3.story.ts):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from L4.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Core text: ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 */
import type { BallState, Beat, HilbertPlaneState, LabBench, LabDevice, LabState, OperatorState, PlaneOp, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, pct, tf, uf } from './L4.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const main = (source: LabBench['source'], devices: LabDevice[], showPrep = false): LabBench =>
  showPrep ? { id: 'main', source, devices, showPrep } : { id: 'main', source, devices }
const lab = (bench: LabBench, extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [bench], ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** Operator space with the σ passport: only from l4-matrices:b5 on, where the Pauli matrices are defined (judge ruling). */
const op = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', ...s })

const Z: LabDevice = { axis: 'z' }
const X: LabDevice = { axis: 'x' }
const Zkeep: LabDevice = { axis: 'z', keep: '+' }
/** A yes/no filter: + goes on, the "no" atoms land on their own plate. */
const Zask: LabDevice = { axis: 'z', keep: '+', openOther: true }
/** The 60° preparation magnet (judge ruling: a real bench device, fed by the oven, keeping +). */
const PREP60: LabDevice = { axis: { tiltDeg: 60 }, keep: '+' }
const sweep = (from: number, to: number) => ({ from, to })
const at30 = { planeDeg: 30 }
const SZ_IMG: PlaneOp & { label: string } = { named: 'Sz', label: '$\\hat S_z|\\psi\\rangle$' }

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l4-basis — Four principles and a complete basis                                                 */
/* ---------------------------------------------------------------------------------------------- */

const basis: Beat[] = [
  {
    id: 'l4-basis:b1',
    phase: 'lecture',
    text: 'Lecture 3 answered three questions about measuring an [[observable]] $A$ with a [[hermitian|Hermitian]] operator $\\hat A$ (Unit 3.4). The results are its [[eigenvalue|eigenvalues]] $a_i$. The result $a_i$ has probability $|\\langle a_i|\\psi\\rangle|^2$ and leaves the state $|a_i\\rangle$. This lecture turns those answers into principles and asks what the eigenstates must do.',
    caption: `Lecture 3’s example as a reminder: $|{+x}\\rangle$ atoms measured along $z$ read $\\pm\\tfrac{\\hbar}{2}$, ${uf(V.l4XonZPlus)} each`,
    stage: lab(main('+x', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
    claims: [
      claim('l4XonZPlus', '|+x⟩ along z: ½ read +ħ/2 …', () => close(V.l4XonZPlus, 0.5)),
      claim('l4XonZMinus', '… and ½ read −ħ/2', () => close(V.l4XonZMinus, 0.5)),
    ],
  },
  {
    id: 'l4-basis:b2',
    phase: 'lecture',
    text: 'Susskind states four [[qm-principles|principles]]. Observables are operators (1), results are eigenvalues (2), [[distinguishable]] states are [[orthogonal]] (3), and the [[born-rule|Born rule]] gives the odds (4). Lecture 3’s update rule stays beside them. Susskind’s own fifth principle concerns time, not measurement.',
    caption: 'Principle 2 in the lab: the eigenstate $|{+z}\\rangle$ reads $+\\tfrac{\\hbar}{2}$ every time',
    stage: lab(main('+z', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
    refs: [
      susskind(
        '§3.2 (printed pp. 69–74, the pages the notes cite)',
        'The four principles of measurement. His |u⟩, |d⟩ are our |±z⟩, his |r⟩, |l⟩ are |±x⟩, and his |i⟩, |o⟩ are |±y⟩. The notes credit a “Chapter 4”; the principles are in his Lecture 3 (see the errata).',
      ),
    ],
    claims: [claim('l4UpOnZ', 'every |+z⟩ atom reads +ħ/2 along z', () => close(V.l4UpOnZ, 1))],
  },
  {
    id: 'l4-basis:b3',
    phase: 'lecture',
    text: 'Principle 3 in numbers: $\\htmlClass{term-ra}{\\langle{+z}|{-z}\\rangle = 0}$, so an $S_z$ magnet never confuses these two states. But $\\langle{+z}|{+x}\\rangle = \\htmlClass{term-arc}{1/\\sqrt2}$, so no single measurement can always tell $|{+z}\\rangle$ from $|{+x}\\rangle$. They are different states that overlap.',
    caption: `at a {{ra|right angle}}: always told apart · $45^\\circ$ apart in [[state-space|state space]]: a $|{+x}\\rangle$ atom still reads + along $z$ ${uf(V.l4ZXProb)} of the time`,
    stage: plane({ psi: '+x', others: [{ ket: '-z', role: 'second' }], basis: 'z', rightAngle: true, arc: true }),
    terms: { ra: t('hilbert-plane', 'right-angle'), arc: t('hilbert-plane', 'angle-arc') },
    claims: [
      claim('l4ZMinusZ', '⟨+z|−z⟩ = 0', () => close(V.l4ZMinusZ, 0)),
      claim('l4ZXOverlap', '⟨+z|+x⟩ = 1/√2 = 0.707', () => close(V.l4ZXOverlap, Math.SQRT1_2)),
      claim('l4ZXProb', 'a |+x⟩ atom reads + along z with probability ½, so a + does not prove |+z⟩', () => close(V.l4ZXProb, 0.5)),
    ],
  },
  {
    id: 'l4-basis:b4',
    phase: 'lecture',
    text: 'A Hermitian operator’s eigenvectors can always be picked [[orthonormal-basis|orthonormal]]: $\\langle a_i|a_j\\rangle = \\delta_{ij}$, where the [[kronecker-delta|Kronecker delta]] $\\delta_{ij}$ is 1 when $i = j$ and 0 otherwise. They are also complete: every state is a sum $|\\psi\\rangle = \\sum_i c_i|a_i\\rangle$ with numbers $c_i$. Such a basis is an [[eigenbasis]]. Orthonormal says the basis states do not overlap; complete says no state is left out.',
    caption: 'every arrow splits into a $|{+z}\\rangle$ part and a $|{-z}\\rangle$ part, and the two {{bars|bars}} always total 1',
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true, rightAngle: true }),
    terms: { bars: t('hilbert-plane', 'bar-1') },
    claims: [claim('l4BarsTotal', 'the two z probabilities add to 1 at every sampled angle', () => close(V.l4BarsTotal, 1))],
  },
  {
    id: 'l4-basis:b5',
    phase: 'lecture',
    text: 'With Lecture 3’s [[projector|projectors]] $\\hat P_i = |a_i\\rangle\\langle a_i|$, completeness takes operator form: $\\sum_i \\hat P_i = I$, the [[identity-operator|identity]]. Acting on any state, the projectors hand back every component: $\\sum_i \\hat P_i|\\psi\\rangle = |\\psi\\rangle$. This [[completeness-relation|completeness relation]] holds in every orthonormal basis, the $x$ basis too.',
    caption: `even $|{+z}\\rangle$ splits into a $+x$ part and a $-x$ part, {{sh|shadows}} whose squares are ${uf(V.l4ZonXPlus)} and ${uf(V.l4ZonXMinus)}`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l4ComplZ', 'P̂₊z + P̂₋z = I', () => V.l4ComplZ === 1),
      claim('l4ComplX', 'P̂₊x + P̂₋x = I', () => V.l4ComplX === 1),
      claim('l4ZonXPlus', '|⟨+x|+z⟩|² = ½', () => close(V.l4ZonXPlus, 0.5)),
      claim('l4ZonXMinus', '|⟨−x|+z⟩|² = ½', () => close(V.l4ZonXMinus, 0.5)),
    ],
  },
  {
    id: 'l4-basis:b6',
    phase: 'books',
    text: 'Susskind calls this the fundamental theorem (§3.1.5): a Hermitian operator has an orthonormal basis of eigenvectors. Eigenvectors with different eigenvalues are orthogonal automatically, and both books prove it in a few lines (Townsend §2.8, p. 67). That the eigenvalues are real is a Lecture 3 homework proof, so here it is only named.',
    caption: '$\\hat S_x$ has two different eigenvalues, $+\\tfrac{\\hbar}{2}$ and $-\\tfrac{\\hbar}{2}$, so $|{+x}\\rangle$ and $|{-x}\\rangle$ meet at a {{ra|right angle}}',
    stage: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true }),
    terms: { ra: t('hilbert-plane', 'right-angle') },
    refs: [
      susskind('§3.1.5', 'The fundamental theorem for Hermitian operators, and what it promises about their eigenvectors: enough of them, at right angles, to build every state.'),
      townsend('§2.8, p. 67 (eqs. 2.131–2.138)', 'Why eigenvectors with different eigenvalues are orthogonal. The same pages also prove that the eigenvalues are real, the Lecture 3 homework, so try it first.'),
    ],
    claims: [
      claim('l4SxEigUp', 'Ŝx has eigenvalues +ħ/2 …', () => close(V.l4SxEigUp, 0.5)),
      claim('l4SxEigDown', '… and −ħ/2', () => close(V.l4SxEigDown, -0.5)),
      claim('l4XMinusXOverlap', '⟨+x|−x⟩ = 0', () => close(V.l4XMinusXOverlap, 0)),
    ],
  },
  {
    id: 'l4-basis:b7',
    phase: 'clue',
    text: 'An $S_z$ measurement has only two basis states, $|{+z}\\rangle$ and $|{-z}\\rangle$. Is $|{+x}\\rangle$, which is neither, left out of that measurement?',
    stage: plane({ psi: '+x', basis: 'z' }),
    reveal: {
      text: 'No. $|{+x}\\rangle = \\tfrac{1}{\\sqrt2}|{+z}\\rangle + \\tfrac{1}{\\sqrt2}|{-z}\\rangle$ is a [[superposition]] of that basis, so it lies fully inside it. Completeness asks only that every input can be written in the basis, not that it be a basis state. The squared coefficients, ½ and ½, use up all the probability.',
      caption: `two equal {{sh|shadows}} of $1/\\sqrt2$, each squaring to ${uf(V.l4ZXProb)}`,
      stage: plane({ psi: '+x', basis: 'z', shadows: true, ticks: true }),
      terms: { sh: t('hilbert-plane', 'shadow-1') },
      claims: [
        claim('l4ZXOverlap', '⟨+z|+x⟩ = 0.707', () => close(V.l4ZXOverlap, Math.SQRT1_2)),
        claim('l4MZXOverlap', '⟨−z|+x⟩ = 0.707', () => close(V.l4MZXOverlap, Math.SQRT1_2)),
        claim('l4ZXProb', 'each squares to ½', () => close(V.l4ZXProb, 0.5)),
        claim('l4BarsTotal', 'the two add to 1', () => close(V.l4BarsTotal, 1)),
      ],
    },
  },
  {
    id: 'l4-basis:b8',
    phase: 'clue',
    text: 'The identity $I$ has the eigenvalue 1 twice. Both $|v_1\\rangle = \\binom10$ and $|v_2\\rangle = \\tfrac{1}{\\sqrt2}\\binom11$ satisfy $I|v\\rangle = 1\\,|v\\rangle$. Do they form an orthonormal eigenbasis?',
    stage: plane({ psi: '+x', others: [{ ket: '+z', role: 'second', badge: '|v₁⟩' }], basis: 'z', arc: true }),
    reveal: {
      text: 'No: $\\langle v_1|v_2\\rangle = 1/\\sqrt2$, not 0. When an eigenvalue is [[degenerate]], every mix of its eigenvectors is again an eigenvector, so we may choose. The [[gram-schmidt|Gram–Schmidt procedure]] chooses: keep $|e_1\\rangle = |v_1\\rangle$, and subtract $|e_1\\rangle\\langle e_1|v_2\\rangle$ from $|v_2\\rangle$. That leaves $|w_2\\rangle = \\tfrac{1}{\\sqrt2}\\binom01$, which rescales to $|e_2\\rangle = \\binom01$.',
      caption: 'the leftover part is the {{sh|shadow}} of length $1/\\sqrt2$ on $|{-z}\\rangle$; rescaled, it meets $|v_1\\rangle$ at a {{ra|right angle}}',
      stage: plane({ psi: '+x', basis: 'z', shadows: true, others: [{ ket: '-z', role: 'second', badge: '|e₂⟩' }], rightAngle: true }),
      terms: { sh: t('hilbert-plane', 'shadow-2'), ra: t('hilbert-plane', 'right-angle') },
      claims: [
        claim('l4ZXOverlap', '⟨v₁|v₂⟩ = 1/√2', () => close(V.l4ZXOverlap, Math.SQRT1_2)),
        claim('l4IdEigTop', 'I has the eigenvalue 1 …', () => close(V.l4IdEigTop, 1)),
        claim('l4IdEigLow', '… twice', () => close(V.l4IdEigLow, 1)),
        claim('l4IdAnyEigen', 'every sampled vector is an eigenvector of I', () => V.l4IdAnyEigen === 1),
        claim('l4GsResidualUp', '|w₂⟩ has no |+z⟩ part …', () => close(V.l4GsResidualUp, 0)),
        claim('l4GsResidualDown', '… and length 1/√2', () => close(V.l4GsResidualDown, Math.SQRT1_2)),
        claim('l4GsE2IsDown', 'rescaled, |e₂⟩ = |−z⟩', () => V.l4GsE2IsDown === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l4-projectors — A projector asks a yes/no question (second pass of Unit 3.3)                    */
/* ---------------------------------------------------------------------------------------------- */

const projectors: Beat[] = [
  {
    id: 'l4-projectors:b1',
    phase: 'lecture',
    text: 'Lecture 3 built the [[projector]] $\\hat P_{+z}$, which keeps the up part of a state and deletes the rest (Unit 3.3). This unit asks what happens when we measure $\\hat P_{+z}$ itself, and how one projector fits into a full measurement.',
    caption: `Lecture 3’s picture: $\\htmlClass{term-pr}{\\hat P_{+z}|\\psi\\rangle}$ is the {{sh|shadow}} on the $|{+z}\\rangle$ axis, here ${uf(V.l4PuP60)} long`,
    stage: plane({ psi: { planeDeg: 60 }, basis: 'z', shadows: true, project: 1 }),
    terms: { pr: t('hilbert-plane', 'projection'), sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l4PuP60', 'for the arrow at 60°, P̂₊z keeps ½|+z⟩ …', () => close(V.l4PuP60, 0.5)),
      claim('l4PuP60Rest', '… and nothing along |−z⟩', () => close(V.l4PuP60Rest, 0)),
    ],
  },
  {
    id: 'l4-projectors:b2',
    phase: 'lecture',
    text: '$\\hat P_{+z}$ is Hermitian, so it too has a complete eigenbasis once we count the state it sends to zero. Indeed $\\hat P_{+z}|{+z}\\rangle = 1\\,|{+z}\\rangle$ and $\\hat P_{+z}|{-z}\\rangle = 0\\,|{-z}\\rangle$. Everything it outputs lies on the up line; that line is its [[range]]. Its eigenbasis still spans both directions, which is a different statement.',
    caption: 'eigenvalue 1: $|{+z}\\rangle$ · eigenvalue 0: $|{-z}\\rangle$, whose {{sh|shadow}} on the up axis is zero',
    stage: plane({ psi: '-z', basis: 'z', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l4PuEigTop', 'P̂₊z has eigenvalues 1 …', () => close(V.l4PuEigTop, 1)),
      claim('l4PuEigLow', '… and 0', () => close(V.l4PuEigLow, 0)),
      claim('l4PuVecs', 'with eigenvectors |+z⟩ and |−z⟩', () => V.l4PuVecs === 1),
      claim('l4PuKillsDown', 'P̂₊z|−z⟩ = 0', () => close(V.l4PuKillsDown, 0)),
    ],
  },
  {
    id: 'l4-projectors:b3',
    phase: 'lecture',
    text: 'Measuring $\\hat P_{+z}$ asks one [[yes-no-observable|yes/no question]]: is the spin up along $z$? “Yes” has the value 1 and the projector $\\hat P_{+z}$; “no” has the value 0 and the projector $\\hat P_{-z} = I - \\hat P_{+z}$. A “no” leaves the atom in $|{-z}\\rangle$, a real state, never in the [[zero-ket|zero vector]].',
    caption: `yes (1): ${uf(V.l4PuMeanX)} of the atoms go on in $|{+z}\\rangle$ · no (0): ${uf(V.l4YesNoBlocked)} land on their own plate in $|{-z}\\rangle$`,
    stage: lab(main('+x', [Zask, Z], true), { readouts: ['fractions'], shot: 'L-WIDE' }),
    fidelity: ['lab-no-plate', 'lab-both-paths'],
    claims: [
      claim('l4PuMeanX', 'P(yes) = ⟨+x|P̂₊z|+x⟩ = ½', () => close(V.l4PuMeanX, 0.5)),
      claim('l4YesNoBlocked', '½ of the atoms take the “no” exit', () => close(V.l4YesNoBlocked, 0.5)),
      claim('l4YesNoPlus', 'the “yes” atoms all read + again', () => close(V.l4YesNoPlus, 0.5)),
      claim('l4PdIsIMinusPu', 'P̂₋z = I − P̂₊z', () => V.l4PdIsIMinusPu === 1),
    ],
  },
  {
    id: 'l4-projectors:b4',
    phase: 'lecture',
    text: 'Keep three objects apart. One projector $\\hat P_i$ isolates one outcome, and $\\langle\\psi|\\hat P_i|\\psi\\rangle$ is that outcome’s share of the probability. The [[complete-family|complete family]] of projectors sums to $I$, which is why the shares add to 1. The observable $\\hat A = \\sum_i a_i\\hat P_i$ attaches a result $a_i$ to each outcome.',
    caption: `one {{b1|bar}} is one outcome’s share, and both bars total 1; at $60^\\circ$ they are ${uf(V.l4Pu60Exp)} and ${uf(V.l4Pd60Exp)}`,
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true }),
    terms: { b1: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l4Pu60Exp', 'at 60°: ⟨ψ|P̂₊z|ψ⟩ = ¼ …', () => close(V.l4Pu60Exp, 0.25)),
      claim('l4Pd60Exp', '… and ⟨ψ|P̂₋z|ψ⟩ = ¾', () => close(V.l4Pd60Exp, 0.75)),
      claim('l4BarsTotal', 'the shares add to 1 at every sampled angle', () => close(V.l4BarsTotal, 1)),
      claim('l4SpecSz', '(ħ/2)P̂₊z − (ħ/2)P̂₋z = Ŝz', () => V.l4SpecSz === 1),
    ],
  },
  {
    id: 'l4-projectors:b5',
    phase: 'books',
    text: 'Townsend (§2.3, pp. 42–44) writes $\\hat P_\\pm$ for $\\hat P_{\\pm z}$ and builds them in the lab: a $z$ magnet with one path {{blk|blocked}}. Every $|{+z}\\rangle$ atom passes $\\hat P_+$, which is eigenvalue 1, and no $|{-z}\\rangle$ atom does, eigenvalue 0. A second identical filter stops nothing more: $\\hat P_+^2 = \\hat P_+$. An opposite filter stops everything: $\\hat P_+\\hat P_- = 0$.',
    caption: `filter, then the same filter: the first stop catches ${uf(V.l4FilterBlocked1)} of the atoms, the second none`,
    stage: lab(main('+x', [Zkeep, Zkeep, Z], true), { readouts: ['fractions', 'blocked'], shot: 'L-WIDE' }),
    terms: { blk: t('lab-r3', 'beam-stop') },
    fidelity: ['lab-block-projects', 'lab-filter-is-projector'],
    refs: [
      townsend('§2.3, pp. 42–44 (Figs. 2.4–2.5, eqs. 2.49–2.52)', 'The projection operators built as Stern–Gerlach devices with one beam blocked, their eigenvalues 1 and 0, and what two projectors in a row do.'),
    ],
    claims: [
      claim('l4FilterBlocked1', 'the first filter stops ½ …', () => close(V.l4FilterBlocked1, 0.5)),
      claim('l4FilterBlocked2', '… the second stops none', () => close(V.l4FilterBlocked2, 0)),
      claim('l4FilterPlus', 'the other ½ land +', () => close(V.l4FilterPlus, 0.5)),
      claim('l4FilterMinus', 'none land −', () => close(V.l4FilterMinus, 0)),
      claim('l4PuIdem', 'P̂₊² = P̂₊', () => V.l4PuIdem === 1),
      claim('l4PuPdZero', 'P̂₊P̂₋ = 0', () => close(V.l4PuPdZero, 0)),
    ],
  },
  {
    id: 'l4-projectors:b6',
    phase: 'clue',
    text: 'The matrix $Q = \\begin{pmatrix}1&1\\\\0&0\\end{pmatrix}$ also satisfies $Q^2 = Q$. Could $Q$ stand for a yes/no measurement?',
    stage: plane({ psi: '+z', basis: 'z' }),
    reveal: {
      text: 'No. $Q$ is not Hermitian, and its “yes” state $\\binom10$ and its “no” state $\\tfrac{1}{\\sqrt2}\\binom{1}{-1}$ overlap by $1/\\sqrt2$. Outcomes of one measurement must be perfectly distinguishable, hence orthogonal (Principle 3). So a measurement projector needs $\\hat P^2 = \\hat P$ and also $\\hat P^\\dagger = \\hat P$: it must be an [[orthogonal-projector|orthogonal projector]].',
      caption: 'the “no” state $|{-x}\\rangle$ sits {{arc|45°}} from the “yes” state $|{+z}\\rangle$, not at a right angle',
      stage: plane({ psi: '-x', others: [{ ket: '+z', role: 'second', badge: 'Q keeps this' }], basis: 'z', arc: true }),
      terms: { arc: t('hilbert-plane', 'angle-arc') },
      claims: [
        claim('l4QIdem', 'Q² = Q', () => V.l4QIdem === 1),
        claim('l4QHerm', 'Q is not Hermitian', () => V.l4QHerm === 0),
        claim('l4QProj', 'so Q is not an (orthogonal) projector …', () => V.l4QProj === 0),
        claim('l4PuProj', '… while P̂₊z is', () => V.l4PuProj === 1),
        claim('l4QEigTop', 'Q has eigenvalues 1 …', () => close(V.l4QEigTop, 1)),
        claim('l4QEigLow', '… and 0', () => close(V.l4QEigLow, 0)),
        claim('l4QKeepsUp', 'Q keeps (1, 0)', () => V.l4QKeepsUp === 1),
        claim('l4QKillsMinusX', 'Q sends (1, −1)/√2 to zero', () => close(V.l4QKillsMinusX, 0)),
        claim('l4ZMinusXOverlap', 'the two overlap by 1/√2', () => close(V.l4ZMinusXOverlap, Math.SQRT1_2)),
      ],
    },
  },
  {
    id: 'l4-projectors:b7',
    phase: 'clue',
    text: 'An atom in $|{-z}\\rangle$ is asked “up along $z$?”. The update rule $\\hat P_{+z}|\\psi\\rangle/\\sqrt{p}$, with $p$ the probability of “yes”, would divide zero by zero. Which state is it in afterwards?',
    stage: lab(main('-z', [Zask, Z], true), { readouts: ['fractions'], shot: 'L-WIDE' }),
    reveal: {
      text: 'The rule is only for outcomes with $p > 0$. Here “yes” has probability $|\\langle{+z}|{-z}\\rangle|^2 = 0$, so it never happens: the answer is “no” every time. The atom stays in $|{-z}\\rangle$. The zero vector $\\hat P_{+z}|{-z}\\rangle = 0$ is not a state at all: it has no length to rescale.',
      caption: 'every atom takes the “no” plate; none goes on',
      fidelity: ['lab-no-plate'],
      claims: [
        claim('l4UpGivenDown', 'P(yes | −z) = 0', () => close(V.l4UpGivenDown, 0)),
        claim('l4DownAskedBlocked', 'every atom takes the “no” exit', () => close(V.l4DownAskedBlocked, 1)),
        claim('l4PuKillsDown', 'P̂₊z|−z⟩ = 0', () => close(V.l4PuKillsDown, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l4-example — One state, the whole prediction                                                    */
/* ---------------------------------------------------------------------------------------------- */

const ball: BallState = {
  kind: 'bloch-ball',
  point: { thetaDeg: 60, phiDeg: 0 },
  compare: { mix: [{ of: '+z', w: 0.75 }, { of: '-z', w: 0.25 }] },
  measure: 'z',
  shot: 'B-STD',
}

const example: Beat[] = [
  {
    id: 'l4-example:b1',
    phase: 'lecture',
    text: 'Prepare $|\\psi\\rangle = \\tfrac{\\sqrt3}{2}|{+z}\\rangle + \\tfrac12|{-z}\\rangle$ and measure $S_z$. It is [[normalized]]: $\\langle\\psi|\\psi\\rangle = \\tfrac34 + \\tfrac14 = 1$. The possible results are the eigenvalues of $\\hat S_z$, $+\\tfrac{\\hbar}{2}$ and $-\\tfrac{\\hbar}{2}$, and nothing else.',
    caption: '$|\\psi\\rangle$ sits $30^\\circ$ from $|{+z}\\rangle$ in state space',
    stage: plane({ psi: at30, basis: 'z' }),
    claims: [
      claim('l4PsiNorm', '|ψ| = 1', () => close(V.l4PsiNorm, 1)),
      claim('l4PsiIsPlane30', 'the arrow drawn at 30° is ψ', () => V.l4PsiIsPlane30 === 1),
      claim('l4PsiAmpDown', 'the |−z⟩ amplitude is ½', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4PsiUp', '|√3/2|² = ¾ …', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', '… and |½|² = ¼', () => close(V.l4PsiDown, 0.25)),
      claim('l4SzEigUp', 'the eigenvalues of Ŝz are +ħ/2 …', () => close(V.l4SzEigUp, 0.5)),
      claim('l4SzEigDown', '… and −ħ/2', () => close(V.l4SzEigDown, -0.5)),
    ],
  },
  {
    id: 'l4-example:b2',
    phase: 'lecture',
    text: 'Orthogonality reads off each [[amplitude]]. $\\langle{+z}|\\psi\\rangle = \\tfrac{\\sqrt3}{2}$, because the $|{-z}\\rangle$ term has no overlap with $|{+z}\\rangle$; likewise $\\langle{-z}|\\psi\\rangle = \\tfrac12$. Squaring gives $P(+\\tfrac{\\hbar}{2}) = \\tfrac34$ and $P(-\\tfrac{\\hbar}{2}) = \\tfrac14$. They add to 1 because $\\hat P_{+z} + \\hat P_{-z} = I$.',
    caption: `{{sh|shadows}} $\\tfrac{\\sqrt3}{2}$ and $\\tfrac12$ · {{bars|bars}} ${d(V.l4PsiUp, 2)} and ${d(V.l4PsiDown, 2)}`,
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1'), bars: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l4PsiAmpUp', '⟨+z|ψ⟩ = √3/2 = 0.866', () => close(V.l4PsiAmpUp, Math.sqrt(3) / 2)),
      claim('l4PsiAmpDown', '⟨−z|ψ⟩ = ½', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4PsiUp', 'P(+ħ/2) = ¾', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', 'P(−ħ/2) = ¼', () => close(V.l4PsiDown, 0.25)),
    ],
  },
  {
    id: 'l4-example:b3',
    phase: 'lecture',
    text: 'Suppose $+\\tfrac{\\hbar}{2}$ is found. By Lecture 3’s [[state-update|update rule]] the state becomes $\\hat P_{+z}|\\psi\\rangle/\\sqrt{3/4} = \\big(\\tfrac{\\sqrt3}{2}|{+z}\\rangle\\big)/\\tfrac{\\sqrt3}{2} = |{+z}\\rangle$. After $-\\tfrac{\\hbar}{2}$ it becomes $|{-z}\\rangle$ in the same way.',
    caption: 'the {{pv|kept part}}, $\\tfrac{\\sqrt3}{2}$ long, is rescaled to length 1: the state after $+\\tfrac{\\hbar}{2}$',
    stage: plane({ psi: at30, basis: 'z', project: 1, renormalize: true }),
    terms: { pv: t('hilbert-plane', 'projection') },
    fidelity: ['plane-update-bookkeeping'],
    claims: [
      claim('l4PsiUp', 'the rescaling divides by √(¾)', () => close(V.l4PsiUp, 0.75)),
      claim('l4PuPsiLen', 'the kept part is √3/2 long', () => close(V.l4PuPsiLen, Math.sqrt(3) / 2)),
      claim('l4CollapseUp', 'after +ħ/2 the state is |+z⟩', () => V.l4CollapseUp === 1),
      claim('l4CollapseDown', 'after −ħ/2 it is |−z⟩', () => V.l4CollapseDown === 1),
    ],
  },
  {
    id: 'l4-example:b4',
    phase: 'lecture',
    text: 'Measure $S_z$ again at once: $+\\tfrac{\\hbar}{2}$ now has probability 1, because the input is $|{+z}\\rangle$. Keep four things apart: the amplitude $\\tfrac{\\sqrt3}{2}$, the probability $\\tfrac34$, the result $+\\tfrac{\\hbar}{2}$, and the state afterwards, $|{+z}\\rangle$.',
    caption: '{{amp|amplitude}} = shadow · {{pr|probability}} = bar · result = its label · state after = the {{st|axis arrow}}',
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    terms: { amp: t('hilbert-plane', 'shadow-1'), pr: t('hilbert-plane', 'bar-1'), st: t('hilbert-plane', 'basis-1') },
    claims: [
      claim('l4RepeatUp', '|⟨+z|+z⟩|² = 1', () => close(V.l4RepeatUp, 1)),
      claim('l4PsiAmpUp', 'the amplitude is 0.866 …', () => close(V.l4PsiAmpUp, Math.sqrt(3) / 2)),
      claim('l4PsiUp', '… the probability ¾', () => close(V.l4PsiUp, 0.75)),
    ],
  },
  {
    id: 'l4-example:b5',
    phase: 'books',
    text: 'Townsend writes projectors as matrices (§2.4, p. 48). In the $z$ basis $\\hat P_{+z}$ is $\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$, so the update is one matrix product, $\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}\\begin{pmatrix}\\tfrac{\\sqrt3}{2}\\\\\\tfrac12\\end{pmatrix} = \\htmlClass{term-pv}{\\begin{pmatrix}\\tfrac{\\sqrt3}{2}\\\\0\\end{pmatrix}}$, then a division by $\\sqrt{3/4}$. What is left is the column $\\binom10$, which is $|{+z}\\rangle$.',
    caption: 'the matrix keeps the first entry and zeroes the second: the {{pv|kept part}} of $|\\psi\\rangle$ along $|{+z}\\rangle$',
    stage: plane({ psi: at30, basis: 'z', project: 1 }),
    terms: { pv: t('hilbert-plane', 'projection') },
    refs: [
      townsend('§2.4, p. 48 (eqs. 2.67–2.69)', 'The matrix of a projector in the $z$ basis, and a projector acting on a column. His Examples 1.1–1.2 use a mirror image of this state; Lecture 3 works them.'),
    ],
    claims: [
      claim('l4PuMatrix', 'P̂₊z is the matrix [[1, 0], [0, 0]]', () => V.l4PuMatrix === 1),
      claim('l4PsiAmpDown', 'the column of ψ is (√3/2, ½)', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4PuPsi0', 'the product keeps √3/2 …', () => close(V.l4PuPsi0, Math.sqrt(3) / 2)),
      claim('l4PuPsi1', '… and zeroes the second entry', () => close(V.l4PuPsi1, 0)),
      claim('l4PsiUp', 'the division is by √(¾)', () => close(V.l4PsiUp, 0.75)),
      claim('l4PuPsiRescaled', 'what is left is (1, 0) = |+z⟩', () => V.l4PuPsiRescaled === 1),
    ],
  },
  {
    id: 'l4-example:b6',
    phase: 'clue',
    text: 'The notes never say how a lab would make this $|\\psi\\rangle$. Can a Stern–Gerlach magnet do it?',
    stage: lab(main('oven', [Z]), { deposit: 'clear', shot: 'L-EST' }),
    beyondLecture: true,
    reveal: {
      text: 'Yes: keep the + beam of a magnet tilted $60^\\circ$ from $z$ toward $x$. Lecture 1 found that magnet’s + state, $\\cos 30^\\circ|{+z}\\rangle + \\sin 30^\\circ|{-z}\\rangle$, which is exactly $|\\psi\\rangle$. A $z$ magnet after it splits the kept atoms 3 : 1, the split that Lecture 1’s notes wrongly put at $45^\\circ$.',
      caption: `the oven loses ${uf(V.l4Prep60Blocked)} at the {{mag|tilted magnet}}; the plate gets ${uf(V.l4Prep60Plus)} in + and ${uf(V.l4Prep60Minus)} in −, a {{fill|fill}} of ${uf(V.l4Prep60Fill)}`,
      stage: lab(main('oven', [PREP60, Z]), { readouts: ['fractions', 'fill-bar'], shot: 'L-WIDE' }),
      terms: { mag: t('lab-r3', 'magnet-1'), fill: t('lab-r3', 'fill-bar') },
      fidelity: ['lab-prep-tilted', 'lab-tilt-real'],
      claims: [
        claim('l4Prep60Ket', 'the 60° magnet’s + state is ψ', () => V.l4Prep60Ket === 1),
        claim('l4Prep60Blocked', '½ of the oven is stopped', () => close(V.l4Prep60Blocked, 0.5)),
        claim('l4Prep60Plus', '⅜ lands +', () => close(V.l4Prep60Plus, 0.375)),
        claim('l4Prep60Minus', '⅛ lands −', () => close(V.l4Prep60Minus, 0.125)),
        claim('l4Prep60Fill', 'of the atoms that land, ¾ are +', () => close(V.l4Prep60Fill, 0.75)),
      ],
    },
  },
  {
    id: 'l4-example:b7',
    phase: 'clue',
    text: 'Is $|\\psi\\rangle$ just a beam in which three quarters of the atoms are $|{+z}\\rangle$ and one quarter are $|{-z}\\rangle$? Along $z$, both give 3 : 1.',
    stage: ball,
    beyondLecture: true,
    reveal: {
      text: `No. Measured along $x$, $|\\psi\\rangle$ gives $+\\tfrac{\\hbar}{2}$ about ${pct(V.l4PsiXPlus)} of the time, while the three-to-one [[mixture]] gives ${pct(V.l4MixXPlus)}. In $|\\psi\\rangle$ the two parts add as amplitudes; the mixed beam only adds probabilities. Unit 4.6 computes the ${pct(V.l4PsiXPlus)}.`,
      caption: 'the {{pt|state}} sits on the surface; the {{cmp|mixed beam}} sits inside, halfway up the axis, and along $x$ the two differ',
      stage: { ...ball, measure: 'x', recipe: true },
      terms: { pt: t('bloch-ball', 'point'), cmp: t('bloch-ball', 'compare') },
      fidelity: ['ball-inside-not-partly-up'],
      claims: [
        claim('l4PsiXPlus', 'ψ along x: P(+) = 0.933 ≈ 93 %', () => close(V.l4PsiXPlus, (2 + Math.sqrt(3)) / 4)),
        claim('l4MixXPlus', 'the ¾ : ¼ mixture along x: 50 %', () => close(V.l4MixXPlus, 0.5)),
        claim('l4MixZPlus', 'along z both give ¾', () => close(V.l4MixZPlus, 0.75) && close(V.l4PsiUp, 0.75)),
        claim('l4PsiBlochX', 'ψ sits at (0.866, 0, 0.5) …', () => close(V.l4PsiBlochX, Math.sqrt(3) / 2) && close(V.l4PsiBlochZ, 0.5)),
        claim('l4PsiBlochZ', '… on the surface', () => close(V.l4PsiBlochX ** 2 + V.l4PsiBlochZ ** 2, 1)),
        claim('l4MixBlochZ', 'the mixture sits at (0, 0, 0.5), inside', () => close(V.l4MixBlochZ, 0.5) && close(V.l4MixBlochX, 0)),
        claim('l4MixBlochX', 'with no x part', () => close(V.l4MixBlochX, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l4-average — The average that no atom reads (second pass of Unit 3.6)                           */
/* ---------------------------------------------------------------------------------------------- */

const prepZ = main('oven', [PREP60, Z])

const average: Beat[] = [
  {
    id: 'l4-average:b1',
    phase: 'lecture',
    text: 'Lecture 3 defined the [[expectation|expectation value]] $\\langle A\\rangle$, the mean reading over many freshly prepared atoms (Unit 3.6). Here we apply it to this lecture’s state, prepared and measured many times.',
    caption: `atoms leaving the $60^\\circ$ magnet are in $|\\psi\\rangle$; the plate fills ${uf(V.l4Prep60Plus)} and ${uf(V.l4Prep60Minus)}, that is 3 : 1`,
    stage: lab(prepZ, { readouts: ['fractions'], shot: 'L-PLATE' }),
    fidelity: ['lab-prep-tilted'],
    claims: [
      claim('l4Prep60Ket', 'atoms leaving the 60° magnet are in ψ', () => V.l4Prep60Ket === 1),
      claim('l4Prep60Plus', '⅜ of the oven lands + …', () => close(V.l4Prep60Plus, 0.375)),
      claim('l4Prep60Minus', '… and ⅛ lands −: 3 : 1', () => close(V.l4Prep60Minus, 0.125) && close(V.l4Prep60Plus / V.l4Prep60Minus, 3)),
    ],
  },
  {
    id: 'l4-average:b2',
    phase: 'lecture',
    text: 'For our state, $\\langle S_z\\rangle = (+\\tfrac{\\hbar}{2})\\tfrac34 + (-\\tfrac{\\hbar}{2})\\tfrac14 = \\htmlClass{term-avg}{\\tfrac{\\hbar}{4}}$. No atom ever reads $\\tfrac{\\hbar}{4}$: each reads $+\\tfrac{\\hbar}{2}$ or $-\\tfrac{\\hbar}{2}$. The mean leans positive only because + is three times as likely as −.',
    caption: `the {{tick|tick}} sits at the average [[sigma-reading|reading]] $\\langle\\sigma_z\\rangle = ${tf(V.l4Centroid60)}$, that is $\\langle S_z\\rangle = \\tfrac{\\hbar}{4}$; no atom lands on it`,
    stage: lab(prepZ, { readouts: ['centroid'], shot: 'L-PLATE-C' }),
    terms: { avg: t('lab-r3', 'centroid'), tick: t('lab-r3', 'centroid') },
    fidelity: ['lab-centroid-is-mean', 'lab-prep-tilted'],
    claims: [
      claim('l4MeanSz', '⟨ψ|Ŝz|ψ⟩ = ħ/4', () => close(V.l4MeanSz, 0.25)),
      claim('l4MeanSzSum', '(ħ/2)(¾) − (ħ/2)(¼) = ħ/4', () => close(V.l4MeanSzSum, V.l4MeanSz)),
      claim('l4PsiUp', 'P(+) = ¾', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', 'P(−) = ¼', () => close(V.l4PsiDown, 0.25)),
      claim('l4Centroid60', 'the centroid ⟨σz⟩ = ½ = 2⟨Sz⟩/ħ', () => close(V.l4Centroid60, 0.5) && close(V.l4Centroid60, 2 * V.l4MeanSz)),
    ],
  },
  {
    id: 'l4-average:b3',
    phase: 'lecture',
    text: '“Repeat” can mean two experiments. [[repeated-preparations|Fresh preparations]], one $S_z$ reading each, give a 3 : 1 mix whose mean is $\\tfrac{\\hbar}{4}$. Measuring one atom again and again gives its first answer every time, as long as nothing acts on it in between.',
    caption: `keep $+\\tfrac{\\hbar}{2}$ and measure again: ${uf(V.l4Rep60Blocked1)} of the oven stops at the $60^\\circ$ magnet, ${uf(V.l4Rep60Blocked2)} at the $z$ filter, and every atom that reaches the plate repeats +`,
    stage: lab(main('oven', [PREP60, Zkeep, Z]), { readouts: ['fractions'], shot: 'L-WIDE' }),
    fidelity: ['lab-prep-tilted'],
    claims: [
      claim('l4MeanSz', 'fresh preparations average ħ/4', () => close(V.l4MeanSz, 0.25)),
      claim('l4Rep60Blocked1', '½ stops at the 60° magnet', () => close(V.l4Rep60Blocked1, 0.5)),
      claim('l4Rep60Blocked2', '⅛ stops at the z filter', () => close(V.l4Rep60Blocked2, 0.125)),
      claim('l4Rep60Plus', '⅜ lands +', () => close(V.l4Rep60Plus, 0.375)),
      claim('l4Rep60Minus', 'none lands −', () => close(V.l4Rep60Minus, 0)),
    ],
  },
  {
    id: 'l4-average:b4',
    phase: 'lecture',
    text: 'Check with Lecture 3’s [[sandwich]] $\\langle\\psi|\\hat S_z|\\psi\\rangle$. First, $\\htmlClass{term-img}{\\hat S_z|\\psi\\rangle} = \\tfrac{\\hbar}{2}\\big(\\tfrac{\\sqrt3}{2}|{+z}\\rangle - \\tfrac12|{-z}\\rangle\\big)$. Its [[inner-product|inner product]] with $|\\psi\\rangle$ is $\\tfrac{\\hbar}{2}\\big(\\tfrac34 - \\tfrac14\\big) = \\tfrac{\\hbar}{4}$. The cross terms drop out because $\\langle{+z}|{-z}\\rangle = 0$.',
    caption: `$\\hat S_z$ flips the sign of the down part: the {{img|image}} points to $-30^\\circ$ and is ${uf(V.l4SzPsiLen)} long (ħ = 1)`,
    stage: plane({ psi: at30, image: SZ_IMG, basis: 'z' }),
    terms: { img: t('hilbert-plane', 'image') },
    fidelity: ['plane-image-not-state'],
    claims: [
      claim('l4SzPsi0', 'Ŝz|ψ⟩ = (0.433, −0.25) with ħ = 1 …', () => close(V.l4SzPsi0, Math.sqrt(3) / 4) && close(V.l4SzPsi1, -0.25)),
      claim('l4SzPsi1', '… whose down part is −½ of ½', () => close(V.l4SzPsi1, -V.l4PsiAmpDown / 2)),
      claim('l4PsiAmpDown', 'the down amplitude of ψ is ½', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4SzPsiLen', 'its length is ½', () => close(V.l4SzPsiLen, 0.5)),
      claim('l4SzPsiAtMinus30', 'it points to −30°', () => V.l4SzPsiAtMinus30 === 1),
      claim('l4SandwichSz', '⟨ψ|Ŝz ψ⟩ = ħ/4', () => close(V.l4SandwichSz, 0.25)),
      claim('l4PsiUp', '¾ …', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', '… minus ¼', () => close(V.l4PsiDown, 0.25)),
    ],
  },
  {
    id: 'l4-average:b5',
    phase: 'books',
    text: 'Townsend writes the same product with matrices (§2.6, p. 58): a row, times the matrix of $\\hat S_z$, times a column. Here that is $\\big(\\tfrac{\\sqrt3}{2}\\;\\;\\tfrac12\\big)\\,\\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}\\begin{pmatrix}\\tfrac{\\sqrt3}{2}\\\\\\tfrac12\\end{pmatrix} = \\tfrac{\\hbar}{4}$. Any basis gives the same number, as long as the row, the matrix and the column all use it.',
    caption: 'row × matrix × column: $\\tfrac{\\hbar}{2}\\big(\\tfrac34 - \\tfrac14\\big) = \\tfrac{\\hbar}{4}$, and the same $\\tfrac{\\hbar}{4}$ in the $x$ basis',
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    refs: [townsend('§2.6, p. 58 (eqs. 2.105–2.107)', 'The expectation value as a row times a matrix times a column, and why any one basis gives the same number.')],
    claims: [
      claim('l4MeanSz', 'row × matrix × column = ħ/4', () => close(V.l4MeanSz, 0.25)),
      claim('l4MeanSzInX', 'the same ħ/4 in the x basis', () => close(V.l4MeanSzInX, V.l4MeanSz)),
      claim('l4PsiAmpDown', 'the row is (√3/2, ½)', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4PsiUp', '¾ …', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', '… minus ¼', () => close(V.l4PsiDown, 0.25)),
    ],
  },
  {
    id: 'l4-average:b6',
    phase: 'books',
    text: 'Susskind stresses that measuring $A$ is not applying $\\hat A$ (§3.5), as Unit 3.4 showed. Here $\\hat S_z|\\psi\\rangle$ is neither $|{+z}\\rangle$ nor $|{-z}\\rangle$, yet an $S_z$ measurement always leaves one of those two. His §4.7 says what $\\hat A|\\psi\\rangle$ is for: it is the right half of the sandwich.',
    caption: `rescaled, the {{img|image}} would be a new state: an $x$ magnet would pass ${d(V.l4ImgXPlus)} of it, against ${d(V.l4PsiXPlus)} for $|\\psi\\rangle$`,
    stage: plane({ psi: at30, image: SZ_IMG, basis: 'z' }),
    terms: { img: t('hilbert-plane', 'image') },
    fidelity: ['plane-image-not-state'],
    refs: [
      susskind('§3.5; §4.7 (printed pp. 80–82 for §3.5, as the notes cite)', 'Applying an operator is not measuring it; the average of an observable is the sandwich of its operator.'),
    ],
    claims: [
      claim('l4SzPsiNotUp', 'Ŝz|ψ⟩ is not the state |+z⟩ …', () => V.l4SzPsiNotUp === 1),
      claim('l4SzPsiNotDown', '… nor |−z⟩', () => V.l4SzPsiNotDown === 1),
      claim('l4ImgXPlus', 'rescaled, it passes an x magnet with probability 0.067 …', () => close(V.l4ImgXPlus, (2 - Math.sqrt(3)) / 4)),
      claim('l4PsiXPlus', '… against 0.933 for ψ', () => close(V.l4PsiXPlus, (2 + Math.sqrt(3)) / 4)),
    ],
  },
  {
    id: 'l4-average:b7',
    phase: 'clue',
    text: 'The notes give zero as the long-run average of $S_z$ for this $|\\psi\\rangle$. Is that right?',
    stage: lab(prepZ, { batches: [1000], readouts: ['centroid'], shot: 'L-PLATE-C' }),
    reveal: {
      text: 'No. For this $|\\psi\\rangle$ the mean is $\\tfrac{\\hbar}{4}$, found above in two ways. Zero is the mean for $|{+x}\\rangle$, the state of Lecture 3’s example, and the sentence was carried over from there. Its “equal counts” should likewise read “counts near 3 : 1” (see the [[errata]]).',
      caption: `the {{tick|tick}} settles at $\\langle\\sigma_z\\rangle = ${tf(V.l4Centroid60)}$, not at 0`,
      terms: { tick: t('lab-r3', 'centroid') },
      fidelity: ['lab-centroid-is-mean', 'lab-prep-tilted'],
      claims: [
        claim('l4MeanSz', 'the mean is ħ/4', () => close(V.l4MeanSz, 0.25)),
        claim('l4MeanSzX', 'zero is the mean for |+x⟩', () => close(V.l4MeanSzX, 0)),
        claim('l4Centroid60', 'the tick at ⟨σz⟩ = ½', () => close(V.l4Centroid60, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l4-matrices — Spin matrices built from their outcomes                                           */
/* ---------------------------------------------------------------------------------------------- */

const matrices: Beat[] = [
  {
    id: 'l4-matrices:b1',
    phase: 'lecture',
    text: 'From here on $\\hat S_z$ is the operator and $S_z$ its matrix in the [[z-basis|z basis]], where $|{+z}\\rangle$ is the column $\\binom10$ and $|{-z}\\rangle$ is $\\binom01$. Leave the four entries $m_{ij}$ (row $i$, column $j$) unknown. The principles fix them: $|{\\pm z}\\rangle$ must be eigenvectors with the measured values $\\pm\\tfrac{\\hbar}{2}$.',
    caption: 'the data: every atom prepared in $|{+z}\\rangle$ reads $+\\tfrac{\\hbar}{2}$',
    stage: lab(main('+z', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
    claims: [
      claim('l4UpOnZ', '|+z⟩ always reads +ħ/2', () => close(V.l4UpOnZ, 1)),
      claim('l4DownOnZ', '|−z⟩ always reads −ħ/2', () => close(V.l4DownOnZ, 1)),
    ],
  },
  {
    id: 'l4-matrices:b2',
    phase: 'lecture',
    text: 'Column 1 of a matrix is where it sends $\\binom10$, and column 2 is where it sends $\\binom01$. So $\\hat S_z|{+z}\\rangle = \\tfrac{\\hbar}{2}|{+z}\\rangle$ gives $m_{11} = \\tfrac{\\hbar}{2}$ and $m_{21} = 0$. And $\\hat S_z|{-z}\\rangle = -\\tfrac{\\hbar}{2}|{-z}\\rangle$ gives $m_{12} = 0$ and $m_{22} = -\\tfrac{\\hbar}{2}$. Hence $S_z = \\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$.',
    caption: 'the other fact: every atom prepared in $|{-z}\\rangle$ reads $-\\tfrac{\\hbar}{2}$',
    stage: lab(main('-z', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
    claims: [
      claim('l4SzUpCol', 'Ŝz|+z⟩ = (½, 0) …', () => close(V.l4SzUpCol, 0.5) && close(V.l4SzUpColLow, 0)),
      claim('l4SzUpColLow', '… so m₂₁ = 0', () => close(V.l4SzUpColLow, 0)),
      claim('l4SzDownCol', 'Ŝz|−z⟩ = (0, −½)', () => close(V.l4SzDownCol, -0.5)),
      claim('l4SzIsDiag', 'Sz = diag(½, −½) with ħ = 1', () => V.l4SzIsDiag === 1),
      claim('l4DownOnZ', '|−z⟩ always reads −ħ/2', () => close(V.l4DownOnZ, 1)),
    ],
  },
  {
    id: 'l4-matrices:b3',
    phase: 'lecture',
    text: 'For $x$ the definite states are $|{\\pm x}\\rangle$, the columns $\\tfrac{1}{\\sqrt2}\\binom{1}{\\pm1}$. Weight each outcome projector by its value, as in Unit 3.3: $\\hat S_x = \\tfrac{\\hbar}{2}\\big(|{+x}\\rangle\\langle{+x}| - |{-x}\\rangle\\langle{-x}|\\big)$. With the matrices $P_{\\pm x} = \\tfrac12\\begin{pmatrix}1&\\pm1\\\\\\pm1&1\\end{pmatrix}$ this gives $S_x = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$, the second of the [[spin-matrices|spin matrices]].',
    caption: `the projectors $\\hat P_{\\pm x}$ split any state into its $\\pm x$ {{sh|parts}}, and $\\hat S_x$ weights them $\\pm\\tfrac{\\hbar}{2}$; every entry of $P_{+x}$ is $${tf(V.l4PpxEntry)}$`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l4PpxEntry', 'P₊x = ½[[1, 1], [1, 1]]', () => close(V.l4PpxEntry, 0.5) && close(V.l4PpxOff, 0.5)),
      claim('l4PpxOff', 'its corner entries are ½', () => close(V.l4PpxOff, 0.5)),
      claim('l4PmxOff', 'P₋x has corner entries −½', () => close(V.l4PmxOff, -0.5)),
      claim('l4SpecSx', '(ħ/2)(P̂₊x − P̂₋x) = Ŝx', () => V.l4SpecSx === 1),
      claim('l4ComplX', 'P̂₊x + P̂₋x = I', () => V.l4ComplX === 1),
    ],
  },
  {
    id: 'l4-matrices:b4',
    phase: 'lecture',
    text: 'For $y$ the kets are complex: $|{+y}\\rangle$ is the column $\\tfrac{1}{\\sqrt2}\\binom{1}{i}$, so its bra is the [[complex-conjugate|conjugated]] row $\\tfrac{1}{\\sqrt2}(1\\;\\;-i)$. That gives $P_{+y} = \\tfrac12\\begin{pmatrix}1&-i\\\\i&1\\end{pmatrix}$ and $P_{-y} = \\tfrac12\\begin{pmatrix}1&i\\\\-i&1\\end{pmatrix}$. Weighting by $\\pm\\tfrac{\\hbar}{2}$ gives $S_y = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}$.',
    caption: `a new picture, [[operator-space|operator space]]: $S_y$ is an {{arrow|arrow}} ${uf(V.l4SyArrow)} long along $y$, and the {{ep|ends}} of its axis mark $|{\\pm y}\\rangle$ (explained in the next step)`,
    stage: op({ op: { named: 'Sy' }, eigen: true, gauge: false, labels: 'plain', shot: 'O-STD' }),
    terms: { arrow: t('operator-space', 'arrow-a'), ep: t('operator-space', 'eigen-plus') },
    fidelity: ['operator-arrow-not-state'],
    claims: [
      claim('l4PyEntry11', 'P₊y has ½ on its diagonal …', () => close(V.l4PyEntry11, 0.5)),
      claim('l4PyEntry01Im', '… and −i/2 top right', () => close(V.l4PyEntry01Im, -0.5)),
      claim('l4PmyEntry01Im', 'P₋y has +i/2 top right', () => close(V.l4PmyEntry01Im, 0.5)),
      claim('l4SpecSy', '(ħ/2)(P̂₊y − P̂₋y) = Ŝy', () => V.l4SpecSy === 1),
      claim('l4SyArrow', 'the arrow of Ŝy is ½ long, along y', () => close(V.l4SyArrow, 0.5)),
    ],
  },
  {
    id: 'l4-matrices:b5',
    phase: 'lecture',
    text: 'Remove the units: $\\sigma_i = \\tfrac{2}{\\hbar}S_i$ gives the [[pauli-matrices|Pauli matrices]] $\\sigma_x = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$, $\\sigma_y = \\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}$ and $\\sigma_z = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$, so $S_i = \\tfrac{\\hbar}{2}\\sigma_i$. Susskind works with $\\sigma_i$, whose readings are $\\pm1$ instead of $\\pm\\tfrac{\\hbar}{2}$. The eigenstates are the same.',
    caption: `how to read [[operator-space|this space]]: a matrix $a_0 I + a_x\\sigma_x + a_y\\sigma_y + a_z\\sigma_z$ is the {{arrow|arrow}} $(a_x, a_y, a_z)$ plus the {{gauge|gauge}} $a_0$. So $S_z = \\tfrac12\\sigma_z$ is an arrow ${uf(V.l4SzArrowZ)} long along $z$ (ħ = 1).`,
    stage: op({ op: { named: 'Sz' }, eigen: true, gauge: true, shot: 'O-STD' }),
    terms: { arrow: t('operator-space', 'arrow-a'), gauge: t('operator-space', 'gauge-a0') },
    fidelity: ['op-four-dimensions'],
    claims: [
      claim('l4SigmaHalf', 'Sx, Sy, Sz = ½σx, ½σy, ½σz with ħ = 1', () => V.l4SigmaHalf === 1),
      claim('l4SzArrowZ', 'Ŝz is the arrow ½ along z …', () => close(V.l4SzArrowZ, 0.5)),
      claim('l4SzGauge', '… with gauge 0', () => close(V.l4SzGauge, 0)),
      claim('l4SxArrowX', 'Ŝx is ½ along x', () => close(V.l4SxArrowX, 0.5)),
      claim('l4SyArrow', 'Ŝy is ½ along y', () => close(V.l4SyArrow, 0.5)),
    ],
  },
  {
    id: 'l4-matrices:b6',
    phase: 'lecture',
    text: '$S_x$ and $S_z$ are real and symmetric, so they are Hermitian. For $S_y$, transpose and conjugate: $\\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}^\\dagger$ is the same matrix again. An $i$ is allowed. What matters is $A_{ij} = A_{ji}^*$, with $A_{ij}$ the entry in row $i$, column $j$, and $^*$ the complex conjugate.',
    caption: 'all three {{arrow|arrows}} have a place in this space, which holds Hermitian matrices only',
    stage: op({ op: { named: 'Sy' }, eigen: true, gauge: true }),
    terms: { arrow: t('operator-space', 'arrow-a') },
    fidelity: ['op-hermitian-only'],
    claims: [
      claim('l4SpinHerm', 'Sx, Sy and Sz are Hermitian', () => V.l4SpinHerm === 1),
      claim('l4SigmaYDagger', 'σy† = σy', () => V.l4SigmaYDagger === 1),
    ],
  },
  {
    id: 'l4-matrices:b7',
    phase: 'books',
    text: 'Susskind gets the same three matrices by writing each pair of eigen-equations as four equations for the four entries (§3.4). Townsend reaches them by another route that this lecture does not need (§3.6, pp. 95–96). Different routes, same matrices: the definite states and their values pin the operator down.',
    caption: `$\\hat S_x$: the {{ep|ends}} of its axis are $|{\\pm x}\\rangle$, with eigenvalues $\\pm${tf(V.l4SxEigUp)}$ (ħ = 1)`,
    stage: op({ op: { named: 'Sx' }, eigen: true }),
    terms: { ep: t('operator-space', 'eigen-plus') },
    refs: [
      susskind('§3.4 (printed pp. 75–80, as the notes cite)', 'The three spin matrices from their eigenvectors and eigenvalues, entry by entry.'),
      townsend('§3.6, pp. 94–96 (eqs. 3.88–3.89)', 'The same matrices by another route, and the Pauli matrices by name.'),
    ],
    claims: [
      claim('l4SxEigUp', 'Ŝx has eigenvalues +½ …', () => close(V.l4SxEigUp, 0.5)),
      claim('l4SxEigDown', '… and −½', () => close(V.l4SxEigDown, -0.5)),
      claim('l4SxVectors', 'with eigenvectors |+x⟩ and |−x⟩', () => V.l4SxVectors === 1),
    ],
  },
  {
    id: 'l4-matrices:b8',
    phase: 'clue',
    text: 'Townsend writes the matrix $\\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ and calls it $S_z$ (§2.6, p. 59). Our $S_x$ has exactly these entries. Is one of us wrong?',
    stage: op({ op: { named: 'Sx' }, eigen: true }),
    reveal: {
      text: 'Neither. Townsend writes $\\hat S_z$ in the $x$ basis $\\{|{+x}\\rangle, |{-x}\\rangle\\}$, where it swaps the two basis states; we write $\\hat S_x$ in the $z$ basis. The subscript names the quantity measured, and the basis names the coordinates. Every matrix in this lecture uses the $z$ basis.',
      caption: 'the operator $\\hat S_z$ has not moved: still the {{arrow|arrow}} along $z$. Only its table of entries depends on the basis.',
      stage: op({ op: { named: 'Sz' }, eigen: true }),
      terms: { arrow: t('operator-space', 'arrow-a') },
      fidelity: ['operator-basis-free'],
      claims: [
        claim('l4SzInXIsSx', 'Ŝz in the x basis has the entries of Sx', () => V.l4SzInXIsSx === 1),
        claim('l4SxInXIsSz', 'and Ŝx in the x basis has the entries of Sz', () => V.l4SxInXIsSz === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l4-eigen — From a matrix back to outcomes                                                       */
/* ---------------------------------------------------------------------------------------------- */

const eigen: Beat[] = [
  {
    id: 'l4-eigen:b1',
    phase: 'lecture',
    text: 'Now reverse the question: only the matrix $S_x = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ is given. The [[eigenvalue-problem|eigenvalue problem]] asks for a number $\\lambda$ and a nonzero column $\\binom{c_1}{c_2}$ with $S_x\\binom{c_1}{c_2} = \\lambda\\binom{c_1}{c_2}$. Moving everything to one side gives $(S_x - \\lambda I)\\binom{c_1}{c_2} = \\binom00$.',
    caption: 'the eigen-axis stays hidden until we solve for it',
    stage: op({ op: { named: 'Sx' }, eigen: false, gauge: true }),
  },
  {
    id: 'l4-eigen:b2',
    phase: 'lecture',
    text: 'If $S_x - \\lambda I$ had an [[inverse]], applying it would force the column to be zero. So a nonzero solution needs $\\det(S_x - \\lambda I) = 0$, the [[characteristic-equation|characteristic equation]]. For a 2×2 matrix the [[determinant]] multiplies the two diagonal entries and subtracts the product of the off-diagonal pair. Here it reads $\\lambda^2 - \\tfrac{\\hbar^2}{4} = 0$. Its roots $\\lambda_\\pm = \\pm\\tfrac{\\hbar}{2}$ are the only possible results.',
    caption: `at $\\lambda = 0$ the determinant is $-${tf(V.l4CharPolyDetSize)}\\hbar^2$, not 0, so no atom reads 0`,
    stage: op({ op: { named: 'Sx' }, eigen: false, gauge: true }),
    claims: [
      claim('l4CharPolyLin', 'det(Sx − λI) has no λ term (−tr Sx = 0) …', () => close(V.l4CharPolyLin, 0)),
      claim('l4CharPolyDet', '… and constant det Sx = −¼: λ² − ¼', () => close(V.l4CharPolyDet, -0.25)),
      claim('l4CharPolyDetSize', 'of size ¼', () => close(V.l4CharPolyDetSize, 0.25)),
      claim('l4DetAtPlus', 'it vanishes at λ = +½ …', () => close(V.l4DetAtPlus, 0)),
      claim('l4DetAtMinus', '… and at λ = −½', () => close(V.l4DetAtMinus, 0)),
      claim('l4DetAtZero', 'at λ = 0 it is −¼, not 0', () => close(V.l4DetAtZero, -0.25)),
    ],
  },
  {
    id: 'l4-eigen:b3',
    phase: 'lecture',
    text: 'Put $\\lambda = +\\tfrac{\\hbar}{2}$ back in: both rows say $c_2 = c_1$. Normalizing gives $|c_1|^2 + |c_2|^2 = 2|c_1|^2 = 1$. The [[phase-convention|phase convention]], first component real and positive, then gives $\\htmlClass{term-ep}{|{+x}\\rangle}$, the column $\\tfrac{1}{\\sqrt2}\\binom11$. With $\\lambda = -\\tfrac{\\hbar}{2}$ the same steps give $c_2 = -c_1$ and $\\htmlClass{term-em}{|{-x}\\rangle}$, the column $\\tfrac{1}{\\sqrt2}\\binom{1}{-1}$.',
    caption: `the eigen-axis appears along $x$: each component of $|{+x}\\rangle$ is $1/\\sqrt2 \\approx ${d(V.l4EigForPlus0)}$`,
    stage: op({ op: { named: 'Sx' }, eigen: true, gauge: true }),
    terms: { ep: t('operator-space', 'eigen-plus'), em: t('operator-space', 'eigen-minus') },
    claims: [
      claim('l4EigForPlus0', 'back-substitution at +½ gives (0.707, …', () => close(V.l4EigForPlus0, Math.SQRT1_2)),
      claim('l4EigForPlus1', '… 0.707)', () => close(V.l4EigForPlus1, Math.SQRT1_2)),
      claim('l4EigForMinus1', 'at −½ the second component is −0.707', () => close(V.l4EigForMinus1, -Math.SQRT1_2)),
      claim('l4EigForAgree', 'both agree with the engine’s eigenvectors |±x⟩', () => V.l4EigForAgree === 1),
    ],
  },
  {
    id: 'l4-eigen:b4',
    phase: 'lecture',
    text: 'Check: $\\langle{+x}|{-x}\\rangle = \\tfrac12(1 - 1) = 0$. Two orthonormal vectors in a two-dimensional space already form a complete basis, the same statement as $\\hat P_{+x} + \\hat P_{-x} = I$. The method has recovered both results and both definite states.',
    caption: 'the two eigenvectors meet at a {{ra|right angle}} in state space',
    stage: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true }),
    terms: { ra: t('hilbert-plane', 'right-angle') },
    claims: [
      claim('l4HalfFactor', 'the factor ½ = (1/√2)(1/√2)', () => close(V.l4HalfFactor, 0.5)),
      claim('l4XMinusXOverlap', '⟨+x|−x⟩ = 0', () => close(V.l4XMinusXOverlap, 0)),
      claim('l4ComplX', 'P̂₊x + P̂₋x = I', () => V.l4ComplX === 1),
    ],
  },
  {
    id: 'l4-eigen:b5',
    phase: 'lecture',
    text: 'For any input $|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$ with $|\\alpha|^2 + |\\beta|^2 = 1$, the eigenvectors give the amplitudes $\\langle{\\pm x}|\\psi\\rangle = (\\alpha \\pm \\beta)/\\sqrt2$. So $P(\\pm\\tfrac{\\hbar}{2}) = \\tfrac12|\\alpha \\pm \\beta|^2$, and the two add up to $|\\alpha|^2 + |\\beta|^2 = 1$. The atom is then left in $|{\\pm x}\\rangle$.',
    caption: `the state of Unit 4.3 measured along $x$: {{bars|bars}} ${d(V.l4PsiXPlus)} and ${d(V.l4PsiXMinus)}`,
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { bars: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l4HalfFactor', 'the ½ in ½|α ± β|²', () => close(V.l4HalfFactor, 0.5)),
      claim('l4Formula', '½|α ± β|² matches the Born rule for ψ, (0.6, 0.8) and |+y⟩', () => V.l4Formula === 1),
      claim('l4PsiXPlus', 'for ψ: 0.933 …', () => close(V.l4PsiXPlus, (2 + Math.sqrt(3)) / 4)),
      claim('l4PsiXMinus', '… and 0.067', () => close(V.l4PsiXMinus, (2 - Math.sqrt(3)) / 4)),
    ],
  },
  {
    id: 'l4-eigen:b6',
    phase: 'lecture',
    text: `The mean follows from the same list: $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}P(+\\tfrac{\\hbar}{2}) - \\tfrac{\\hbar}{2}P(-\\tfrac{\\hbar}{2}) = \\langle\\psi|\\hat S_x|\\psi\\rangle$. For our state that is $\\tfrac{\\sqrt3}{4}\\hbar \\approx ${d(V.l4MeanSx)}\\hbar$. Given only a matrix, we can now predict every feature of its measurement.`,
    caption: `an $x$ magnet after the $60^\\circ$ preparation: the {{tick|tick}} sits at $\\langle\\sigma_x\\rangle = ${d(V.l4CentroidX)}$, that is $\\langle S_x\\rangle = ${d(V.l4MeanSx)}\\hbar$`,
    stage: lab(main('oven', [PREP60, X]), { readouts: ['centroid'], shot: 'L-PLATE-C' }),
    terms: { tick: t('lab-r3', 'centroid') },
    fidelity: ['lab-prep-tilted', 'lab-centroid-is-mean'],
    claims: [
      claim('l4MeanSx', '⟨ψ|Ŝx|ψ⟩ = √3/4 = 0.433 (ħ)', () => close(V.l4MeanSx, Math.sqrt(3) / 4)),
      claim('l4MeanSxSum', '(ħ/2)(P(+) − P(−)) gives the same', () => close(V.l4MeanSxSum, V.l4MeanSx)),
      claim('l4Prep60XPlus', 'the bench: 0.4665 of the oven lands + …', () => close(V.l4Prep60XPlus, (2 + Math.sqrt(3)) / 8)),
      claim('l4Prep60XMinus', '… and 0.0335 lands −', () => close(V.l4Prep60XMinus, (2 - Math.sqrt(3)) / 8)),
      claim('l4CentroidX', 'the centroid ⟨σx⟩ = 0.866 = 2⟨Sx⟩/ħ', () => close(V.l4CentroidX, 2 * V.l4MeanSx)),
    ],
  },
  {
    id: 'l4-eigen:b7',
    phase: 'books',
    text: 'Susskind solves the same eigenvalue problem for a magnet tilted by an angle $\\theta$ from $z$ toward $x$ (§3.7). The results are again $\\pm1$ in his units, with orthogonal eigenvectors. At $\\theta = 60^\\circ$ the + eigenvector is exactly our $|\\psi\\rangle$, which is why the $60^\\circ$ magnet prepares it.',
    caption: `the tilted spin matrix: an {{arrow|arrow}} ${uf(V.l4TiltLen)} long, $60^\\circ$ from $z$ toward $x$, whose {{ep|+ end}} is $|\\psi\\rangle$`,
    stage: op({ op: { a0: 0, a: [V.l4TiltAx, 0, V.l4TiltAz] }, eigen: true, gauge: true }),
    terms: { arrow: t('operator-space', 'arrow-a'), ep: t('operator-space', 'eigen-plus') },
    beyondLecture: true,
    refs: [susskind('§3.7 (Exercise 3.3)', 'The eigenvalue problem for a spin component along a tilted direction: the same two results at every tilt, with orthogonal eigenvectors.')],
    claims: [
      claim('l4TiltEigUp', 'the tilted Ŝn has eigenvalues +½ …', () => close(V.l4TiltEigUp, 0.5)),
      claim('l4TiltEigDown', '… and −½ (±1 for σn)', () => close(V.l4TiltEigDown, -0.5)),
      claim('l4TiltVecIsPsi', 'its + eigenvector at 60° is ψ', () => V.l4TiltVecIsPsi === 1),
      claim('l4TiltMeanUp', 'Lecture 1’s ⟨σn⟩ = cos 60° = ½ on |+z⟩', () => close(V.l4TiltMeanUp, 0.5)),
      claim('l4TiltLen', 'the arrow is ½ long …', () => close(V.l4TiltLen, 0.5)),
      claim('l4TiltAx', '… with x part √3/4 …', () => close(V.l4TiltAx, Math.sqrt(3) / 4)),
      claim('l4TiltAz', '… and z part ¼: 60° from z', () => close(V.l4TiltAz, 0.25) && close(Math.atan2(V.l4TiltAx, V.l4TiltAz), Math.PI / 3)),
    ],
  },
  {
    id: 'l4-eigen:b8',
    phase: 'clue',
    text: 'The + eigenvector could just as well be written $-\\tfrac{1}{\\sqrt2}\\binom11$ or $\\tfrac{i}{\\sqrt2}\\binom11$. Did choosing $\\tfrac{1}{\\sqrt2}\\binom11$ lose anything?',
    stage: plane({ psi: '+x', basis: 'x' }),
    reveal: {
      text: 'Nothing. A common factor of size 1 changes no probability, so all three describe the same physical state: Lecture 1’s [[global-phase|global phase]]. The phase convention only makes everyone’s answers match, and the app’s engine uses the same rule.',
      caption: 'the $-1$ version is drawn as a {{gh|second arrow}}, the same state; the $i$ version cannot be drawn on a real plane',
      stage: plane({ psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: 'same state' }], basis: 'x' }),
      terms: { gh: t('hilbert-plane', 'ghost') },
      fidelity: ['plane-sign-twice'],
      claims: [
        claim('l4NegSame', '−|+x⟩ is the same state as |+x⟩', () => V.l4NegSame === 1),
        claim('l4ISame', 'so is i|+x⟩', () => V.l4ISame === 1),
        claim('l4CanonI', 'the phase convention turns i|+x⟩ back into |+x⟩', () => V.l4CanonI === 1),
      ],
    },
  },
]

export const L4_STORY: Record<string, Beat[]> = {
  'l4-basis': basis,
  'l4-projectors': projectors,
  'l4-example': example,
  'l4-average': average,
  'l4-matrices': matrices,
  'l4-eigen': eigen,
}
