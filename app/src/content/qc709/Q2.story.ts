/**
 * Chapter Q2 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q2-story.md §1, in both
 * tracks, with the judge's rulings (docs/roles/decisions/qc709-Q2Q3.md):
 *   - phase 'lecture' is what the 709 notes say (Lecture 2, printed pp. 6–10);
 *   - unit order: `q2-operators` before `q2-change` (ruling Q2-1: the notes present change of basis first, but
 *     A' = UAU† needs A_ij, outer products and the identity as a sum, which `q2-operators` builds);
 *   - D2, D3 kept in full, with bridges to `l5-coordinates`/`l5-operators` and the Rosetta line U = Spin Lab's B†
 *     (ruling Q2-2; no 448 edit);
 *   - Bergou p. 257's erratum (B35) is recorded here (q2-photon:b6) but boxed in a later chapter, which owns §14
 *     (ruling Q2-3): Q2 cites p. 257 only for |0⟩ = |H⟩ and the angle doubling, no formula from that page;
 *   - N19 (the notes "choose" δ₋ = π) is a silent note: only δ₊ = 0 is a choice; orthogonality forces δ₋ (ruling
 *     Q2-5), given with its reason at `q2-spin-space:b3`;
 *   - Stage gaps S1 (`hilbert-plane.labels: 'photon'`) and S2 (`amplitudes.globalPhaseDeg`) are implemented first
 *     (ruling Q2-4) and used at `q2-photon:b1`, `b2` and `b4`, `b5`, `b7`.
 *
 * Rules kept here (as in Q1's story file):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from Q2.values.ts, printed with d / tf / uf, and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Ground-up sentences ≤ 25 words, Formal ≤ 40; symbols defined before use in both tracks.
 * - Bridges go only to built Spin Lab units, named in words when the target 709 chapter is not yet written.
 */
import type { AmplitudesState, Beat, HilbertPlaneState, LabBench, LabDevice, LabState, Ref } from '../schema'
import { V, claim, close, d, tf } from './Q2.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out; same shapes as Q1.story.ts)                                     */
/* ---------------------------------------------------------------------------------------------- */

const lab = (benches: LabState['benches'], extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches, ...extra })
const main = (source: LabBench['source'], devices: LabDevice[], extra: Omit<LabBench, 'id' | 'source' | 'devices'> = {}): LabBench => ({ id: 'main', source, devices, ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
const amp = (s: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', ...s })
const sweep = (from: number, to: number) => ({ from, to })

const Z: LabDevice = { axis: 'z' }
const zBasis = [
  { ket: '+z' as const, role: 'basis' as const },
  { ket: '-z' as const, role: 'basis' as const },
]

const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })

/* claims shared by more than one beat */
const cComp30 = claim('q2Comp30Re0', 'ψ at 30° in {|+z⟩, |−z⟩}: (0.866, 0.5)', () => close(V.q2Comp30Re0, Math.sqrt(3) / 2) && close(V.q2Comp30Re1, 0.5))
const cComp30b = claim('q2Comp30Re1', 'the second component of ψ at 30° is 0.5', () => close(V.q2Comp30Re1, 0.5))
const cAngZX = claim('q2AngZX', '|+z⟩ and |+x⟩: 45° apart in this plane', () => close(V.q2AngZX, 45))
const cD30 = claim('q2D30Re0', 'ψ in the x frame: (0.966, 0.259)', () => close(V.q2D30Re0, V.q2Comp30xRe0) && close(V.q2D30Re1, V.q2Comp30xRe1))
const cD30b = claim('q2D30Re1', 'the second component of ψ in the x frame is 0.259', () => close(V.q2D30Re1, V.q2Comp30xRe1))

/* ---------------------------------------------------------------------------------------------- */
/* q2-basis — Independent arrows and a basis                                                       */
/* ---------------------------------------------------------------------------------------------- */

const basis: Beat[] = [
  {
    id: 'q2-basis:b1',
    phase: 'lecture',
    text: 'A set of arrows is [[qc-linearly-independent|linearly independent]] when no mix of them adds to the zero vector, unless every number in the mix is zero. Otherwise one arrow can be built from the others. For example, $|{+x}\\rangle$ is $(|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$, so these three arrows are dependent. <<qc-l4-basis|Spin Lab 4.1>> builds bases from the same idea.',
    formal:
      '$\\{|\\alpha_1\\rangle, \\ldots, |\\alpha_n\\rangle\\} \\subset V$ is linearly independent (LI) if $\\sum_i c_i|\\alpha_i\\rangle = 0$ forces every $c_i = 0$, and linearly dependent (LD) otherwise (notes p. 6; Axler p. 32). In $V^2(\\mathbb{C})$, $|{+x}\\rangle - (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2 = 0$ is a dependence.',
    caption: '$|{+x}\\rangle$ lies along $|{+z}\\rangle + |{-z}\\rangle$: the three are dependent',
    captionFormal: '$\\||{+x}\\rangle - (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2\\| = 0$',
    stage: plane({ psi: '+x', others: zBasis, sumOf: ['+z', '-z'] }),
    fidelity: ['qc-plane-vectors-not-states'],
    claims: [claim('q2Dep', "|+x⟩ minus the rescaled sum of |+z⟩, |−z⟩ is 0", () => close(V.q2Dep, 0)), claim('q2DepZZX', '{|+z⟩, |−z⟩, |+x⟩} is dependent', () => V.q2DepZZX === 0)],
  },
  {
    id: 'q2-basis:b2',
    phase: 'lecture',
    text: 'In a flat plane, two arrows that point different ways are independent, but a third is always a mix of them. The largest number of independent arrows is the [[qc-dimension|dimension]]. It is 2 for the plane and for a [[qubit|qubit]]’s space $V^2(\\mathbb{C})$.',
    formal:
      '$V(F)$ is $n$-dimensional if its largest LI set has $n$ members (notes p. 6; Axler p. 44). The [[qubit|qubit]] space $V^2(\\mathbb{C})$ has dimension 2 over $\\mathbb{C}$: $|{+z}\\rangle, |{+x}\\rangle$ is LI although not at right angles, while $|{+z}\\rangle, |{-z}\\rangle, |{+x}\\rangle$ has rank 2.',
    caption: '$|{+z}\\rangle$ and $|{+x}\\rangle$: independent, 45° apart',
    captionFormal: '$\\mathrm{rank}(|{+z}\\rangle, |{-z}\\rangle, |{+x}\\rangle) = 2$',
    stage: plane({ psi: '+x', others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$45^\\circ$' }),
    claims: [cAngZX, claim('q2IndepZX', '|+z⟩, |+x⟩ is independent', () => V.q2IndepZX === 1), claim('q2Dim', 'rank(|+z⟩, |−z⟩, |+x⟩) = 2', () => close(V.q2Dim, 2))],
  },
  {
    id: 'q2-basis:b3',
    phase: 'lecture',
    text: `Take $n$ independent arrows in a space of dimension $n$. Every vector is a mix of them, and the mixing numbers are unique: no second recipe exists. The arrows form a [[qc-basis|basis]], and the numbers are the vector’s [[qc-component|components]]. The arrow $\\psi$ at 30° is ${d(V.q2Comp30Re0)} of $|{+z}\\rangle$ plus ${d(V.q2Comp30Re1, 1)} of $|{-z}\\rangle$.`,
    formal:
      'If $\\{|e_1\\rangle, \\ldots, |e_n\\rangle\\}$ is LI in $V^n$, each $|\\alpha\\rangle \\in V^n$ has a unique expansion $|\\alpha\\rangle = \\sum_i c_i|e_i\\rangle$ (notes p. 6; Axler p. 39): two expansions would differ by $\\sum_i(c_i - c\'_i)|e_i\\rangle = 0$ (D1). The statement’s $V^N$ and $|\\alpha_i\\rangle$ read $V^n$ and $|e_i\\rangle$ (a notational slip, not a physics error).',
    caption: `$\\psi = ${d(V.q2Comp30Re0)}\\,|{+z}\\rangle + ${d(V.q2Comp30Re1, 1)}\\,|{-z}\\rangle$`,
    captionFormal: `components of $\\psi$ in $\\{|{\\pm z}\\rangle\\}$: $(${d(V.q2Comp30Re0)}, ${d(V.q2Comp30Re1, 1)})$`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true }),
    derivation: {
      result: 'c_i = c\'_i',
      ground: [
        { tex: '|\\alpha\\rangle = \\sum_i c_i|e_i\\rangle', why: 'Suppose one recipe gives the numbers $c_i$.' },
        { tex: '|\\alpha\\rangle = \\sum_i c\'_i|e_i\\rangle', why: 'Suppose a second recipe gives numbers $c\'_i$.' },
        { tex: '0 = \\sum_i (c_i - c\'_i)|e_i\\rangle', why: 'Subtract the second line from the first; the left sides cancel.' },
        { tex: 'c_i - c\'_i = 0\\ \\text{for every } i', why: 'The arrows are independent, so only the all-zero mix gives the zero vector.' },
        { tex: "c_i = c'_i", why: 'The two recipes were the same all along.' },
      ],
      formal: [{ tex: "\\sum_i (c_i - c'_i)|e_i\\rangle = 0 \\Rightarrow c_i = c'_i", why: 'Linear independence of $\\{|e_i\\rangle\\}$ (notes p. 6).' }],
    },
    claims: [cComp30, cComp30b],
  },
  {
    id: 'q2-basis:b4',
    phase: 'lecture',
    text: 'A basis is [[qc-orthonormal-basis|orthonormal]] when its arrows are at right angles to each other and each has length 1. In symbols $\\langle e_i|e_j\\rangle = \\delta_{ij}$, where the [[qc-kronecker-delta|Kronecker delta]] $\\delta_{ij}$ is 1 if $i = j$ and 0 if not.',
    formal:
      'The $|\\alpha_i\\rangle$ are [[qc-orthonormal-basis|orthonormal]] (ON) when $\\langle\\alpha_i|\\alpha_j\\rangle = \\delta_{ij}$: pairwise [[orthogonal|orthogonal]], each of norm 1 (notes p. 6; Axler p. 199). An ON list of length $n$ in $V^n$ is LI, hence a basis (Axler, same page).',
    caption: '$|{+z}\\rangle$ and $|{-z}\\rangle$: at right angles, each of length 1',
    captionFormal: '$\\langle{+z}|{-z}\\rangle = 0$, $\\langle{\\pm z}|{\\pm z}\\rangle = 1$',
    stage: plane({ psi: '+z', others: [{ ket: '-z', role: 'basis' }], rightAngle: true }),
    claims: [claim('q2Orth', '⟨+z|−z⟩ = 0', () => close(V.q2Orth, 0))],
  },
  {
    id: 'q2-basis:b5',
    phase: 'lecture',
    text: `In an orthonormal basis a component is just an overlap: $c_i = \\langle e_i|\\psi\\rangle$. Apply the bra $\\langle e_j|$ to $\\psi = \\sum c_i|e_i\\rangle$, and $\\delta_{ij}$ keeps only $c_j$. In the basis $|{+x}\\rangle, |{-x}\\rangle$, $\\psi$ has components ${d(V.q2Comp30xRe0)}$ and ${d(V.q2Comp30xRe1)}$. <<qc-l2-inner-product|Spin Lab 2.2>> reads coordinates the same way.`,
    formal: `In an ON basis $\\langle e_j|\\psi\\rangle = \\sum_i c_i\\langle e_j|e_i\\rangle = \\sum_i c_i\\delta_{ji} = c_j$ (notes p. 6; Axler p. 200, whose $\\langle v, e_k\\rangle$ is our $\\langle e_k|v\\rangle$). For $\\psi$, $(\\langle{+x}|\\psi\\rangle, \\langle{-x}|\\psi\\rangle) = (${d(V.q2Comp30xRe0)}, ${d(V.q2Comp30xRe1)})$.`,
    caption: `$\\psi$ in the x frame: ${d(V.q2Comp30xRe0)} and ${d(V.q2Comp30xRe1)}`,
    captionFormal: `$c_x(\\psi) = (${d(V.q2Comp30xRe0)}, ${d(V.q2Comp30xRe1)})$`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
    fidelity: ['plane-frame-turn-passive'],
    claims: [
      claim('q2Comp30xRe0', 'ψ in the x frame: (0.966, 0.259)', () => close(V.q2Comp30xRe0, 0.9659258262890683) && close(V.q2Comp30xRe1, 0.25881904510252085)),
      claim('q2Comp30xRe1', 'the second component of ψ in the x frame is 0.259', () => close(V.q2Comp30xRe1, 0.25881904510252085)),
    ],
  },
  {
    id: 'q2-basis:b6',
    phase: 'clue',
    text: '$|{+z}\\rangle$ and $|{+x}\\rangle$ are independent, so they form a basis of the plane. Are the components of $|{-z}\\rangle$ in this basis its overlaps with them?',
    formal: "In the non-orthogonal basis $\\{|{+z}\\rangle, |{+x}\\rangle\\}$, is $c_i = \\langle e_i|{-z}\\rangle$?",
    stage: plane({ psi: '-z', others: [{ ket: '+z', role: 'basis' }, { ket: '+x', role: 'second' }] }),
    reveal: {
      text: `No. $|{-z}\\rangle = -|{+z}\\rangle + \\sqrt2|{+x}\\rangle$, so its components are ${d(V.q2NonOrthRe0, 0)} and ${d(V.q2NonOrthRe1)}. The overlaps are ${d(V.q2NonOrthOvZ, 0)} and ${d(V.q2NonOrthOvX)}. The shortcut $c_i = \\langle e_i|\\psi\\rangle$ needs an orthonormal basis.`,
      formal: `No: the unique solution of $|{-z}\\rangle = c_1|{+z}\\rangle + c_2|{+x}\\rangle$ is $(${d(V.q2NonOrthRe0, 0)}, \\sqrt2)$, while $(\\langle{+z}|{-z}\\rangle, \\langle{+x}|{-z}\\rangle) = (${d(V.q2NonOrthOvZ, 0)}, ${d(V.q2NonOrthOvX)})$. Reading components as overlaps needs $\\langle e_i|e_j\\rangle = \\delta_{ij}$.`,
      caption: `components $(${d(V.q2NonOrthRe0, 0)}, ${d(V.q2NonOrthRe1)})$; overlaps $(${d(V.q2NonOrthOvZ, 0)}, ${d(V.q2NonOrthOvX)})$`,
      stage: plane({ psi: '-z', basis: 'z', shadows: true }),
      claims: [
        claim('q2NonOrthRe1', "components of |−z⟩ in {|+z⟩, |+x⟩}: (−1, 1.4142)", () => close(V.q2NonOrthRe0, -1) && close(V.q2NonOrthRe1, Math.SQRT2)),
        claim('q2NonOrthOvX', 'the overlaps are 0 and 0.7071, not the components', () => close(V.q2NonOrthOvZ, 0) && close(V.q2NonOrthOvX, Math.SQRT1_2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q2-gram-schmidt — Straightening a basis with Gram–Schmidt                                       */
/* ---------------------------------------------------------------------------------------------- */

const gramSchmidtUnit: Beat[] = [
  {
    id: 'q2-gram-schmidt:b1',
    phase: 'lecture',
    text: `Independent arrows need not be at right angles. The [[qc-gram-schmidt|Gram–Schmidt procedure]] turns any independent set into an orthonormal one, one arrow at a time. Try it on $|\\beta_1\\rangle = |{+z}\\rangle$ and $|\\beta_2\\rangle$, the arrow at 60°; their overlap is ${d(V.q2Gs60, 1)}.`,
    formal: `Gram–Schmidt maps an LI list $\\{|\\beta_1\\rangle, \\ldots, |\\beta_n\\rangle\\}$ to an ON list $\\{|\\alpha_1\\rangle, \\ldots, |\\alpha_n\\rangle\\}$ with the same span at every step (notes p. 6; Axler p. 201). Example: $|\\beta_1\\rangle = |{+z}\\rangle$, $|\\beta_2\\rangle = (${d(V.q2Gs60, 1)}, ${d(V.q2GsResRe1)})$, $\\langle\\beta_1|\\beta_2\\rangle = ${d(V.q2Gs60, 1)}$.`,
    caption: 'two independent arrows, 60° apart',
    captionFormal: `$\\langle\\beta_1|\\beta_2\\rangle = ${d(V.q2Gs60, 1)} \\ne 0$`,
    stage: plane({ psi: { planeDeg: 60 }, others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$60^\\circ$' }),
    claims: [claim('q2Gs60', '⟨+z|60°⟩ = 0.5', () => close(V.q2Gs60, 0.5))],
  },
  {
    id: 'q2-gram-schmidt:b2',
    phase: 'lecture',
    text: `Keep the first arrow: $|\\alpha\'_1\\rangle = |\\beta_1\\rangle$. From $|\\beta_2\\rangle$ take away its shadow on $|\\alpha\'_1\\rangle$, which is ${d(V.q2Gs60, 1)} of $|\\alpha\'_1\\rangle$. What is left, $|\\alpha\'_2\\rangle$, stands at right angles to $|\\alpha\'_1\\rangle$ and is ${d(V.q2GsResRe1)} long.`,
    formal: `$|\\alpha\'_2\\rangle = |\\beta_2\\rangle - |\\alpha\'_1\\rangle\\langle\\alpha\'_1|\\beta_2\\rangle/\\langle\\alpha\'_1|\\alpha\'_1\\rangle = (0, ${d(V.q2GsResRe1)})$, and $\\langle\\alpha\'_1|\\alpha\'_2\\rangle = \\langle\\beta_1|\\beta_2\\rangle - \\langle\\beta_1|\\beta_2\\rangle = 0$ by construction (N&C ⚑, p. 66, asks for the general proof; no sheet assigns it).`,
    caption: `what is left: ${d(V.q2GsResRe1)} long, straight up`,
    captionFormal: `$|\\alpha\'_2\\rangle = (0, ${d(V.q2GsResRe1)})$, $\\langle\\alpha\'_1|\\alpha\'_2\\rangle = 0$`,
    stage: plane({ psi: { planeDeg: 60 }, basis: 'z', project: 2 }),
    refs: [nc('p. 66', 'The same recipe; the general proof that the leftover is always at right angles is an exercise (N&C ⚑), assigned in no course sheet, so not derived here.')],
    claims: [
      claim('q2Gs60', 'the shadow removed is 0.5 of |+z⟩', () => close(V.q2Gs60, 0.5)),
      claim('q2GsResRe1', 'the leftover after removing the shadow: (0, 0.866)', () => close(V.q2GsResRe1, Math.sqrt(3) / 2)),
      claim('q2GsResOrth', 'the leftover is orthogonal to |+z⟩', () => close(V.q2GsResOrth, 0)),
    ],
  },
  {
    id: 'q2-gram-schmidt:b3',
    phase: 'lecture',
    text: `Last, divide each leftover by its length so that it has length 1. Here $|\\alpha_2\\rangle = |\\alpha\'_2\\rangle/${d(V.q2GsResRe1)} = |{-z}\\rangle$. So $|{+z}\\rangle$ and $|{-z}\\rangle$ are the orthonormal basis the recipe builds.`,
    formal: `$|\\alpha_i\\rangle = |\\alpha\'_i\\rangle/\\sqrt{\\langle\\alpha\'_i|\\alpha\'_i\\rangle}$ (notes p. 6). The notes rescale at the end, Axler at each step; since each projection divides by $\\langle\\alpha\'_i|\\alpha\'_i\\rangle$, both give the same list.`,
    caption: "rescaled to length 1: the leftover becomes $|{-z}\\rangle$",
    captionFormal: `$|\\alpha_2\\rangle = |\\alpha\'_2\\rangle/${d(V.q2GsResRe1)} = |{-z}\\rangle$`,
    stage: plane({ psi: { planeDeg: 60 }, basis: 'z', project: 2, renormalize: true }),
    fidelity: ['plane-update-bookkeeping'],
    claims: [claim('q2GsE2Re1', 'rescaled: |α2⟩ = (0, 1) = |−z⟩', () => close(V.q2GsE2Re0, 0) && close(V.q2GsE2Re1, 1))],
  },
  {
    id: 'q2-gram-schmidt:b4',
    phase: 'lecture',
    text: `With more arrows, repeat. From each new arrow take away its shadows on all the arrows already made, then rescale. In three dimensions the third arrow loses its shadow on the flat plane of the first two, as in the notes’ Fig. 4. The picture below still shows the 2D case; the 3D numbers are worked in words.`,
    formal: `$|\\alpha\'_j\\rangle = |\\beta_j\\rangle - \\sum_{i<j}|\\alpha\'_i\\rangle\\langle\\alpha\'_i|\\beta_j\\rangle/\\langle\\alpha\'_i|\\alpha\'_i\\rangle$ (notes pp. 6–7, Fig. 4). From $(1, 1, 0), (1, 0, 1), (0, 1, 1)$: $|\\alpha\'_2\\rangle = (${d(V.q2Gs3DRes1Re0)}, ${d(V.q2Gs3DRes1Re1)}, ${d(V.q2Gs3DRes1Re2, 0)})$, $|\\alpha\'_3\\rangle = (${d(V.q2Gs3DRes2Re0)}, ${d(V.q2Gs3DRes2Re1)}, ${d(V.q2Gs3DRes2Re2)})$, mutually orthogonal; the stage below keeps showing the 2D pair.`,
    caption: 'the same two steps, in the plane; the 3D example above has a third arrow',
    captionFormal: `the plane shows the 2D case; in 3D, $|\\alpha\'_3\\rangle = (${d(V.q2Gs3DRes2Re0)}, ${d(V.q2Gs3DRes2Re1)}, ${d(V.q2Gs3DRes2Re2)})$`,
    stage: plane({ psi: { planeDeg: 60 }, basis: 'z', project: 2, renormalize: true }),
    claims: [
      claim('q2Gs3DRes1Re0', "the 3D example's second residual: (0.5, −0.5, 1)", () => close(V.q2Gs3DRes1Re0, 0.5) && close(V.q2Gs3DRes1Re1, -0.5) && close(V.q2Gs3DRes1Re2, 1)),
      claim('q2Gs3DRes2Re0', "the 3D example's third residual: (−0.6667, 0.6667, 0.6667)", () => close(V.q2Gs3DRes2Re0, -2 / 3) && close(V.q2Gs3DRes2Re1, 2 / 3) && close(V.q2Gs3DRes2Re2, 2 / 3)),
      claim('q2Gs3DRes2Re1', "the third residual's second entry is 0.6667", () => close(V.q2Gs3DRes2Re1, 2 / 3)),
      claim('q2Gs3DRes2Re2', "the third residual's third entry is 0.6667", () => close(V.q2Gs3DRes2Re2, 2 / 3)),
      claim('q2Gs3DOrthAll', 'the three residuals are pairwise orthogonal', () => V.q2Gs3DOrthAll === 1),
    ],
  },
  {
    id: 'q2-gram-schmidt:b5',
    phase: 'books',
    text: `The recipe works with complex numbers too; each shadow uses the bra, whose numbers are conjugated (Unit 1.5). Start from $|{+y}\\rangle = (1, i)/\\sqrt2$, then $|{+z}\\rangle$. The leftover is $(${d(V.q2GsYResRe0, 1)}, ${d(V.q2GsYResIm1, 1)}i)$, which rescales to $|{-y}\\rangle = (1, -i)/\\sqrt2$.`,
    formal: `With $|\\beta_1\\rangle = |{+y}\\rangle$, $|\\beta_2\\rangle = |{+z}\\rangle$: $\\langle{+y}|{+z}\\rangle = 1/\\sqrt2$, $|\\alpha\'_2\\rangle = |{+z}\\rangle - |{+y}\\rangle/\\sqrt2 = (1/2, -i/2)$, and $|\\alpha_2\\rangle = |{-y}\\rangle$ exactly. N&C give the same recipe on p. 66.`,
    caption: 'from $|{+y}\\rangle$ and $|{+z}\\rangle$, Gram–Schmidt builds $|{+y}\\rangle$, $|{-y}\\rangle$',
    captionFormal: 'from $|{+y}\\rangle$ and $|{+z}\\rangle$, Gram–Schmidt builds $|{+y}\\rangle$, $|{-y}\\rangle$',
    stage: amp({ state: { dir: '-y' }, dials: true, labels: 'spin' }),
    refs: [nc('p. 66', 'The same Gram–Schmidt recipe applied to complex vectors.')],
    claims: [
      claim('q2GsYOv', '⟨+y|+z⟩ = 0.7071', () => close(V.q2GsYOv, Math.SQRT1_2)),
      claim('q2GsYResRe0', 'the leftover of |+z⟩ after |+y⟩: (0.5, −0.5i)', () => close(V.q2GsYResRe0, 0.5) && close(V.q2GsYResIm1, -0.5)),
      claim('q2GsYE2', 'rescaled it is exactly |−y⟩', () => V.q2GsYE2 === 1),
    ],
  },
  {
    id: 'q2-gram-schmidt:b6',
    phase: 'clue',
    text: 'Feed the recipe three arrows of the plane: $|{+z}\\rangle$, $|{-z}\\rangle$ and $|{+x}\\rangle$. What does it make of the third?',
    formal: 'Apply Gram–Schmidt to the LD list $|{+z}\\rangle$, $|{-z}\\rangle$, $|{+x}\\rangle$ in $V^2$. What is $|\\alpha\'_3\\rangle$?',
    stage: plane({ psi: '+x', others: zBasis }),
    reveal: {
      text: 'Nothing. Its shadows on $|{+z}\\rangle$ and $|{-z}\\rangle$ make up all of $|{+x}\\rangle$, so the leftover is the zero vector. It cannot be rescaled, so the recipe stops at two arrows. A zero leftover is how Gram–Schmidt detects dependence.',
      formal: '$|\\alpha\'_3\\rangle = |{+x}\\rangle - |{+z}\\rangle\\langle{+z}|{+x}\\rangle - |{-z}\\rangle\\langle{-z}|{+x}\\rangle = 0$: the list was LD, and the output has $\\dim V^2 = 2$ members.',
      caption: 'leftover of $|{+x}\\rangle$: the zero vector; two arrows out',
      stage: plane({ psi: '+x', basis: 'z', shadows: true }),
      claims: [claim('q2GsDep', 'the recipe on {|+z⟩, |−z⟩, |+x⟩} outputs only 2 arrows', () => close(V.q2GsDep, 2)), claim('q2Dep', 'the third residual is the zero vector', () => close(V.q2Dep, 0))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q2-spin-space — Spin states in the z and x frames                                               */
/* ---------------------------------------------------------------------------------------------- */

const spinSpace: Beat[] = [
  {
    id: 'q2-spin-space:b1',
    phase: 'lecture',
    text: `A spin state is $|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$. Here $\\alpha$ and $\\beta$ are numbers, its components in the z basis, called [[qc-amplitude|probability amplitudes]]. They may be complex: for $\\alpha = ${d(V.q2AmpExRe0)}$ and $\\beta = ${d(V.q2AmpExIm1, 1)}i$, the chances along z are $${tf(V.q2AmpExP0)}$ and $${tf(V.q2AmpExP1)}$.`,
    formal: `In $\\{|{\\pm z}\\rangle\\}$ the components $\\alpha = \\langle{+z}|\\psi\\rangle$, $\\beta = \\langle{-z}|\\psi\\rangle$ are the probability amplitudes (notes p. 7); Bergou and N&C write $\\alpha|0\\rangle + \\beta|1\\rangle$ with $|0\\rangle \\equiv |{+z}\\rangle$. For $(${d(V.q2AmpExRe0)}, ${d(V.q2AmpExIm1, 1)}i)$: $P(\\pm z) = ${tf(V.q2AmpExP0)}, ${tf(V.q2AmpExP1)}$.`,
    caption: `amplitudes ${d(V.q2AmpExRe0)} and ${d(V.q2AmpExIm1, 1)}i: chances $${tf(V.q2AmpExP0)}$ and $${tf(V.q2AmpExP1)}$`,
    captionFormal: "Rosetta: the notes' $|{\\to}\\rangle, |{\\leftarrow}\\rangle$ and N&C's $|{\\pm}\\rangle$ are $|{\\pm x}\\rangle$ here; R and L are kept for light (Unit 2.6)",
    stage: amp({ state: { dir: { thetaDeg: 60, phiDeg: 90 } }, dials: true, labels: 'spin' }),
    claims: [
      claim('q2AmpExRe0', 'ψ = 0.866|+z⟩ + 0.5i|−z⟩', () => close(V.q2AmpExRe0, Math.sqrt(3) / 2) && close(V.q2AmpExIm1, 0.5)),
      claim('q2AmpExP0', 'P(+z) = 0.75, P(−z) = 0.25', () => close(V.q2AmpExP0, 0.75) && close(V.q2AmpExP1, 0.25)),
      claim('q2AmpExP1', 'P(−z) = 0.25', () => close(V.q2AmpExP1, 0.25)),
    ],
  },
  {
    id: 'q2-spin-space:b2',
    phase: 'lecture',
    text: `Atoms from the + beam of an x magnet split half and half in a z magnet (Unit 1.2). So $|{+x}\\rangle$ has $|\\alpha|^2 = |\\beta|^2 = \\tfrac12$: both amplitudes have size $1/\\sqrt2 = ${d(V.q2ZXOverlap)}$. Nothing in the experiment prefers up to down along z.`,
    formal: 'Write $|s_x = \\pm\\rangle = \\alpha|{+z}\\rangle + e^{i\\delta_\\pm}\\beta|{-z}\\rangle$ with $\\alpha, \\beta \\ge 0$. The equal SG$_z$ statistics of $|{\\pm x}\\rangle$, which the $z \\to -z$ symmetry of the set-up requires, give $\\alpha = \\beta = 1/\\sqrt2$ (notes p. 7).',
    caption: '$|{+x}\\rangle$ atoms in a z magnet: ½ and ½',
    captionFormal: '$|{+x}\\rangle$ atoms in a z magnet: ½ and ½',
    stage: lab([main('+x', [Z])], { readouts: ['fractions'], shot: 'L-PLATE' }),
    fidelity: ['lab-prepared-offstage'],
    claims: [
      claim('q2XHalfPlus', 'a z magnet reads |+x⟩ atoms as ½, ½', () => close(V.q2XHalfPlus, 0.5) && close(V.q2XHalfMinus, 0.5)),
      claim('q2ZXOverlap', 'each amplitude of |+x⟩ along z has size 1/√2 = 0.7071', () => close(V.q2ZXOverlap, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q2-spin-space:b3',
    phase: 'lecture',
    text: "Turning both amplitudes together changes nothing (F1), so the first can be real. Which point on the equator we call $+x$ is our choice: the notes take $\\delta_+ = 0$. Then $|{-x}\\rangle$ has no choice left: it must be at right angles to $|{+x}\\rangle$, and that forces $\\delta_- = 180°$, a minus sign.",
    formal: '$\\langle{+x}|{-x}\\rangle = \\tfrac12(1 + e^{i(\\delta_- - \\delta_+)}) = 0$ forces $\\delta_- - \\delta_+ = \\pi$; $\\delta_+ = 0$ with $\\alpha$ real is the convention (only $\\delta_+ = 0$ is a free choice; $\\delta_-$ is then forced, not chosen). Hence the notes’ boxed pair, the columns $(1, \\pm1)/\\sqrt2$.',
    caption: '$|{-x}\\rangle$: the second amplitude points the opposite way',
    captionFormal: `$|\\langle{+x}|\\psi_\\delta\\rangle| = ${d(V.q2DeltaAt0, 0)}, ${d(V.q2DeltaAt90)}, ${d(V.q2DeltaAt180, 0)}$ at $\\delta = 0°, 90°, 180°$`,
    stage: amp({ state: { dir: '-x' }, dials: true, labels: 'spin' }),
    claims: [
      claim('q2XOrth', '⟨+x|−x⟩ = 0', () => close(V.q2XOrth, 0)),
      claim('q2DeltaAt0', "the shadow on |+x⟩ falls from 1 to 0 as δ runs 0° → 180°", () => close(V.q2DeltaAt0, 1) && close(V.q2DeltaAt90, Math.SQRT1_2) && close(V.q2DeltaAt180, 0, 1e-6)),
      claim('q2DeltaAt90', 'at δ = 90° the shadow on |+x⟩ is 0.7071', () => close(V.q2DeltaAt90, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q2-spin-space:b4',
    phase: 'lecture',
    text: 'Add the two equations: the $|{-z}\\rangle$ parts cancel, and $|{+z}\\rangle = (|{+x}\\rangle + |{-x}\\rangle)/\\sqrt2$. Subtract them instead: $|{-z}\\rangle = (|{+x}\\rangle - |{-x}\\rangle)/\\sqrt2$. These are the z states written in the x basis.',
    formal: 'Adding and subtracting the notes’ boxed pair gives $|{\\pm z}\\rangle = (|{+x}\\rangle \\pm |{-x}\\rangle)/\\sqrt2$ (notes pp. 7–8): the $\\gamma_1 = \\gamma_2 = 1/\\sqrt2$ that the $z \\to x \\to z$ experiment implies, and the inverse change of basis.',
    caption: `$|{+z}\\rangle$ in the x frame: ${d(V.q2ZXOverlap)} and ${d(V.q2ZXOverlap)}`,
    captionFormal: '$|{+z}\\rangle = (|{+x}\\rangle + |{-x}\\rangle)/\\sqrt2$',
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    claims: [
      claim('q2ZfromXPlusRe0', "|+z⟩ = (|+x⟩ + |−x⟩)/√2 → (1, 0)", () => close(V.q2ZfromXPlusRe0, 1) && close(V.q2ZfromXPlusRe1, 0)),
      claim('q2ZfromXMinusRe0', "|−z⟩ = (|+x⟩ − |−x⟩)/√2 → (0, 1)", () => close(V.q2ZfromXMinusRe0, 0) && close(V.q2ZfromXMinusRe1, 1)),
      claim('q2ZXOverlap', 'the x-basis coordinates of |+z⟩ are (0.7071, 0.7071)', () => close(V.q2ZXOverlap, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q2-spin-space:b5',
    phase: 'lecture',
    text: 'Draw $|{+z}\\rangle$ across and $|{-z}\\rangle$ up. Then $|{+x}\\rangle$ is the diagonal at 45°, and $|{-x}\\rangle$ points 45° below: the x frame is the z frame turned by 45°. In the lab +x and −x are opposite, yet here they are only 90° apart. <<qc-l2-three-bases|Spin Lab 2.5>> meets the third frame, y.',
    formal: `Fig. 5 (notes p. 8): $\\{|{\\pm x}\\rangle\\}$ is $\\{|{\\pm z}\\rangle\\}$ rotated by 45° in the real slice. State angles are half the sphere's: $\\langle{+x}|{-x}\\rangle = 0$ at 90° here is 180° on Chapter Q3's sphere <<qc-l7-two-angles|sphere angles are twice state angles>>. Complex states such as $|{+y}\\rangle$ leave this slice.`,
    caption: 'the x frame: the z frame turned by 45°',
    captionFormal: `45° between $|{+z}\\rangle$ and $|{+x}\\rangle$; $|{+x}\\rangle, |{-x}\\rangle$: 90° here, 180° on the sphere`,
    stage: plane({ psi: '+x', basis: 'x', others: zBasis, ticks: true }),
    fidelity: ['plane-half-angles', 'plane-bloch-doubles', 'plane-real-slice'],
    claims: [
      cAngZX,
      claim('q2AngXX90', '|+x⟩ and |−x⟩: 90° apart here', () => close(V.q2AngXX90, 90)),
      claim('q2AngXXBloch180', '|+x⟩ and |−x⟩: 180° apart on the sphere', () => close(V.q2AngXXBloch180, 180)),
    ],
  },
  {
    id: 'q2-spin-space:b6',
    phase: 'clue',
    text: 'Could the notes have chosen $\\delta_- = 90°$ instead, making the second state $(|{+z}\\rangle + i|{-z}\\rangle)/\\sqrt2$?',
    formal: 'Is $(|{+z}\\rangle + e^{i\\pi/2}|{-z}\\rangle)/\\sqrt2$ an admissible $|{-x}\\rangle$?',
    stage: amp({ state: { dir: '+y' }, dials: true, labels: 'spin' }),
    reveal: {
      text: 'No. That state is $|{+y}\\rangle$, and an x magnet passes it on its + side half the time. $|{-x}\\rangle$ must never land on that side, so its overlap with $|{+x}\\rangle$ must be 0. Only 180° gives that.',
      formal: `No: $|\\langle{+x}|\\psi_{\\pi/2}\\rangle|^2 = ${d(V.q2Delta90Prob, 1)}$ and $\\psi_{\\pi/2} = |{+y}\\rangle$ (Unit 1.3), unbiased with respect to $\\{|{\\pm x}\\rangle\\}$. Orthogonality to $|{+x}\\rangle$ forces $\\delta_- = \\pi$.`,
      caption: `$(|{+z}\\rangle + i|{-z}\\rangle)/\\sqrt2$ is $|{+y}\\rangle$: chance ${d(V.q2Delta90Prob, 1)} of +x, not 0`,
      claims: [claim('q2Delta90Prob', "δ₋ = 90° gives P(+x) = 0.5, not 0", () => close(V.q2Delta90Prob, 0.5)), claim('q2Delta90Same', "that state IS |+y⟩", () => V.q2Delta90Same === 1)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q2-operators — Operators, outer products and their tables                                       */
/* ---------------------------------------------------------------------------------------------- */

const operators: Beat[] = [
  {
    id: 'q2-operators:b1',
    phase: 'lecture',
    text: 'A [[qc-linear-operator|linear operator]] $A$ turns each vector $|\\psi\\rangle$ of a space into another vector $A|\\psi\\rangle$ of the same space. It respects mixing: $A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$ for any numbers $a$ and $b$. <<qc-l3-operators|Spin Lab 3.1>> starts operators the same way.',
    formal: 'A linear operator is a linear map of $V$ into itself, $A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$ (notes p. 10; Axler p. 133). The notes say "onto"; Unit 1.2’s projector $|{+z}\\rangle\\langle{+z}|$ is linear but reaches only one line.',
    caption: 'an operator: one arrow in, one arrow out',
    captionFormal: '$\\mathrm{rank}(|{+z}\\rangle\\langle{+z}|) = 1 < 2$: not onto',
    stage: plane({ psi: '+z', image: { matrix: [['1', '-1'], ['1', '1']], label: '$A|{+z}\\rangle$' } }),
    fidelity: ['plane-image-not-state'],
    claims: [claim('q2ProjRank', 'the rank of |+z⟩⟨+z| is 1', () => V.q2ProjRank === 1), claim('q2FigAzRe0', 'A|+z⟩ = (1, 1)', () => close(V.q2FigAzRe0, 1) && close(V.q2FigAzRe1, 1))],
  },
  {
    id: 'q2-operators:b2',
    phase: 'lecture',
    text: `The table $A = [[1, -1], [1, 1]]$ turns every arrow by 45° and stretches it by ${d(V.q2FigANorm, 3)}. It sends $|{+z}\\rangle$ to $(1, 1)$ and $|{-z}\\rangle$ to $(-1, 1)$: both ${d(V.q2FigANorm, 3)} long and still at right angles.`,
    formal: `$A = \\sqrt2 R(45°)$ is a rotation times a uniform scaling, as in Fig. 6 (notes p. 10): $\\langle A({+z})|A({-z})\\rangle = 0$ and $\\|Av\\| = \\sqrt2\\|v\\|$. Such an $A$ keeps orthogonality; a general linear operator keeps neither angles nor length ratios.`,
    caption: `every arrow turned 45° and stretched to ${d(V.q2FigANorm, 3)}`,
    captionFormal: `$\\langle A({+z})|A({-z})\\rangle = 0$; $\\|A|{+z}\\rangle\\| = \\|A|{-z}\\rangle\\| = 1.414$`,
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, image: { matrix: [['1', '-1'], ['1', '1']], label: '$A|\\psi\\rangle$' } }),
    claims: [
      claim('q2FigAmzRe0', 'A|−z⟩ = (−1, 1)', () => close(V.q2FigAmzRe0, -1) && close(V.q2FigAmzRe1, 1)),
      claim('q2FigAInner', 'A|+z⟩ and A|−z⟩ are orthogonal', () => close(V.q2FigAInner, 0)),
      claim('q2FigANorm', 'both images are 1.4142 long', () => close(V.q2FigANorm, Math.SQRT2)),
      claim('q2FigAAngle', 'A turns |+z⟩ by 45°', () => close(V.q2FigAAngle, 45)),
    ],
  },
  {
    id: 'q2-operators:b3',
    phase: 'lecture',
    text: 'Most operators are not like that. The shear $K = [[1, 1], [0, 1]]$ leaves $|{+z}\\rangle$ alone but tips $|{-z}\\rangle$ over to $(1, 1)$. The two images are 45° apart, no longer at right angles.',
    formal: 'For the shear $K$, $K|{+z}\\rangle = |{+z}\\rangle$ and $K|{-z}\\rangle = (1, 1)$, so $\\langle K({+z})|K({-z})\\rangle = 1 \\ne 0$: linearity alone preserves neither orthogonality nor norms.',
    caption: '$K|{-z}\\rangle = (1, 1)$: 45° from $K|{+z}\\rangle$',
    captionFormal: '$K|{-z}\\rangle = (1, 1)$: 45° from $K|{+z}\\rangle$',
    stage: plane({ psi: '-z', others: [{ ket: '+z', role: 'basis' }], image: { matrix: [['1', '1'], ['0', '1']], label: '$K|{-z}\\rangle$' } }),
    claims: [
      claim('q2ShearRe0', 'K|−z⟩ = (1, 1)', () => close(V.q2ShearRe0, 1) && close(V.q2ShearRe1, 1)),
      claim('q2ShearInner', 'K|+z⟩ and K|−z⟩ overlap by 1', () => close(V.q2ShearInner, 1)),
      claim('q2ShearAngle', 'they are 45° apart', () => close(V.q2ShearAngle, 45)),
    ],
  },
  {
    id: 'q2-operators:b4',
    phase: 'lecture',
    text: `Put a ket before a bra: $|\\alpha\\rangle\\langle\\beta|$. This [[qc-outer-product|outer product]] is an operator. Acting on $|\\psi\\rangle$ it gives $|\\alpha\\rangle\\langle\\beta|\\psi\\rangle$, a copy of $|\\alpha\\rangle$ scaled by the overlap $\\langle\\beta|\\psi\\rangle$. So $|{+z}\\rangle\\langle{+x}|$ sends $\\psi$ to $${d(V.q2OuterPsiRe0)}|{+z}\\rangle$.`,
    formal: `$|\\alpha\\rangle\\langle\\beta|: |\\psi\\rangle \\mapsto \\langle\\beta|\\psi\\rangle|\\alpha\\rangle$, with matrix $\\alpha\\beta^\\dagger$ (notes p. 10; N&C p. 67). $|{+z}\\rangle\\langle{+x}| = [[${d(V.q2OuterRe00)}, ${d(V.q2OuterRe01)}], [${d(V.q2OuterRe10, 0)}, ${d(V.q2OuterRe11, 0)}]]$; it annihilates $|{-x}\\rangle$ and maps $|{+x}\\rangle$ to $|{+z}\\rangle$.`,
    caption: `$|{+z}\\rangle\\langle{+x}|$ applied to $\\psi$: ${d(V.q2OuterPsiRe0)} of $|{+z}\\rangle$`,
    captionFormal: `$|{+z}\\rangle\\langle{+x}|\\psi\\rangle = (${d(V.q2OuterPsiRe0)}, ${d(V.q2OuterPsiRe1, 0)})$; $|{+z}\\rangle\\langle{+x}|{-x}\\rangle = 0$`,
    stage: plane({ psi: { planeDeg: 30 }, image: { matrix: [['sqrt(2)/2', 'sqrt(2)/2'], ['0', '0']], label: '$|{+z}\\rangle\\langle{+x}|\\psi\\rangle$' } }),
    claims: [
      claim('q2OuterRe00', '|+z⟩⟨+x| = [[0.7071, 0.7071], [0, 0]]', () => close(V.q2OuterRe00, Math.SQRT1_2) && close(V.q2OuterRe01, Math.SQRT1_2) && close(V.q2OuterRe10, 0) && close(V.q2OuterRe11, 0)),
      claim('q2OuterPsiRe0', "|+z⟩⟨+x|ψ⟩ = (0.9659, 0)", () => close(V.q2OuterPsiRe0, 0.9659258262890683) && close(V.q2OuterPsiRe1, 0)),
      claim('q2OuterMxRe0', '|+z⟩⟨+x|−x⟩ = 0', () => close(V.q2OuterMxRe0, 0) && close(V.q2OuterMxRe1, 0)),
    ],
  },
  {
    id: 'q2-operators:b5',
    phase: 'lecture',
    text: `Pick an orthonormal basis. The numbers $A_{ij} = \\langle e_i|A|e_j\\rangle$ are the operator’s [[qc-matrix-element|matrix elements]]. Then the components of $A|\\psi\\rangle$ are $f_i = \\sum_j A_{ij}c_j$: a row times the column of $c$’s. For $A$ and $\\psi$, $(f_1, f_2) = (${d(V.q2FacRe0)}, ${d(V.q2FacRe1)})$.`,
    formal: `$f_i = \\langle e_i|A|\\psi\\rangle = \\sum_j\\langle e_i|A|e_j\\rangle c_j = \\sum_j A_{ij}c_j$, i.e. $f = \\hat Ac$; and $A = \\sum_{ij}A_{ij}|e_i\\rangle\\langle e_j|$ (notes p. 10; Axler p. 69; N&C pp. 64, 68). Column $j$ is $A|e_j\\rangle$.`,
    caption: `$A$ applied to $\\psi$: $(${d(V.q2FacRe0)}, ${d(V.q2FacRe1)})$`,
    captionFormal: `$A_{12} = \\langle{+z}|A|{-z}\\rangle = ${d(V.q2Aij01, 0)}$; $\\sum_{ij}A_{ij}|e_i\\rangle\\langle e_j| = A$`,
    stage: plane({ psi: { planeDeg: 30 }, image: { matrix: [['1', '-1'], ['1', '1']], label: '$A|\\psi\\rangle$' } }),
    claims: [
      claim('q2FacRe0', 'A|ψ⟩ = (0.3660, 1.3660)', () => close(V.q2FacRe0, 0.36602540378443876) && close(V.q2FacRe1, 1.3660254037844386)),
      claim('q2FacRe1', 'the second component of A|ψ⟩ is 1.3660', () => close(V.q2FacRe1, 1.3660254037844386)),
      claim('q2Aij00', 'the table of A is [[1, −1], [1, 1]]', () => V.q2Aij00 === 1 && V.q2Aij01 === -1 && V.q2Aij10 === 1 && V.q2Aij11 === 1),
      claim('q2SumOuter', 'Σ Aij |ei⟩⟨ej| rebuilds A exactly', () => V.q2SumOuter === 1),
    ],
  },
  {
    id: 'q2-operators:b6',
    phase: 'clue',
    text: 'Define a rule that adds $|{+z}\\rangle$ to every vector. Is it a linear operator?',
    formal: 'Is $T|\\psi\\rangle = |\\psi\\rangle + |{+z}\\rangle$ linear on $V^2$?',
    stage: plane({ psi: '+x', others: [{ ket: '+z', role: 'basis' }] }),
    reveal: {
      text: 'No. It sends the zero vector to $|{+z}\\rangle$, of length 1. A linear operator must send 0 to 0, since $A(0\\cdot\\psi) = 0\\cdot A\\psi$. A shift is not linear.',
      formal: 'No: $T(0) = |{+z}\\rangle \\ne 0$, while linearity forces $A(0) = A(0\\cdot\\psi) = 0\\cdot A\\psi = 0$.',
      caption: 'the zero vector goes to $|{+z}\\rangle$, length 1',
      stage: plane({ psi: '+x', sumOf: ['+x', '+z'] }),
      claims: [claim('q2Shift', 'the shift sends 0 to a vector of length 1', () => close(V.q2Shift, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q2-change — Changing coordinates with one matrix                                                */
/* ---------------------------------------------------------------------------------------------- */

const change: Beat[] = [
  {
    id: 'q2-change:b1',
    phase: 'lecture',
    text: "One arrow $|\\alpha\\rangle$ has components $c_j$ in an old orthonormal basis and $c'_i$ in a new one. Each new component is an overlap: $c'_i = \\langle\\alpha'_i|\\alpha\\rangle$. Putting in the old expansion gives $c'_i = \\sum_j U_{ij}c_j$, with $U_{ij} = \\langle\\alpha'_i|\\alpha_j\\rangle$. <<qc-l5-coordinates|Spin Lab 5.3>> writes the same rule with B.",
    formal: "$c'_i = \\langle\\alpha'_i|\\alpha\\rangle = \\sum_j\\langle\\alpha'_i|\\alpha_j\\rangle c_j = \\sum_j U_{ij}c_j$, the [[qc-change-of-basis-matrix|change-of-basis matrix]] $U_{ij} = \\langle\\alpha'_i|\\alpha_j\\rangle$ (notes p. 8; D2). Column $j$ of $U$ lists the old $|\\alpha_j\\rangle$ in the new basis.",
    caption: 'same arrow, new frame: new numbers from $U$',
    captionFormal: "Rosetta: the notes' $U$ is Spin Lab's $B^\\dagger$: $c' = Uc$ is Spin Lab's $c_{\\rm new} = B^\\dagger c_{\\rm old}$",
    stage: plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true }),
    fidelity: ['plane-frame-turn-passive'],
    derivation: {
      result: "c'_i = \\sum_j U_{ij}c_j",
      ground: [
        { tex: '|\\alpha\\rangle = \\sum_j c_j|\\alpha_j\\rangle', why: 'The arrow written in the old basis.' },
        { tex: "c'_i = \\langle\\alpha'_i|\\alpha\\rangle", why: 'In an orthonormal basis a component is an overlap (Unit 2.1).' },
        { tex: "c'_i = \\langle\\alpha'_i|\\big(\\sum_j c_j|\\alpha_j\\rangle\\big)", why: 'Put step 1 into step 2.' },
        { tex: "c'_i = \\sum_j \\langle\\alpha'_i|\\alpha_j\\rangle\\,c_j", why: 'The bra passes into the sum, and numbers leave the ket side unchanged (Unit 1.5).' },
        { tex: "U_{ij} = \\langle\\alpha'_i|\\alpha_j\\rangle", why: 'Name the overlaps: a table with row $i$ and column $j$.' },
        { tex: "c'_i = \\sum_j U_{ij}c_j", why: 'Row $i$ of the table times the old column gives new component $i$.' },
      ],
      formal: [
        { tex: "c'_i = \\langle\\alpha'_i|\\alpha\\rangle = \\sum_j\\langle\\alpha'_i|\\alpha_j\\rangle c_j", why: 'ON expansion and linearity in the ket.' },
        { tex: "c'_i = \\sum_j U_{ij}c_j", why: 'With $U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$ (notes p. 8).' },
      ],
    },
    claims: [cComp30],
  },
  {
    id: 'q2-change:b2',
    phase: 'lecture',
    text: `From z to x, $U$ holds the four overlaps $\\langle{\\pm x}|{\\pm z}\\rangle$: $U = [[1, 1], [1, -1]]/\\sqrt2$. Its first column is $|{+z}\\rangle$ written in the x basis. For $\\psi$ it gives $d = Uc = (${d(V.q2D30Re0)}, ${d(V.q2D30Re1)})$, as in Unit 2.1.`,
    formal: `$U_{z\\to x} = (\\langle{\\pm x}|{\\pm z}\\rangle) = (1\\ 1; 1\\ {-1})/\\sqrt2$ (notes p. 9), so $d = Uc$: $\\psi \\mapsto (${d(V.q2D30Re0)}, ${d(V.q2D30Re1)})$. The squared entries still add to 1.`,
    caption: `$\\psi$ in the x frame: ${d(V.q2D30Re0)} and ${d(V.q2D30Re1)}`,
    captionFormal: `$U_{z\\to x}c = (${d(V.q2D30Re0)}, ${d(V.q2D30Re1)})$; ${d(V.q2Px30Plus, 3)} + ${d(V.q2Px30Minus, 3)} = 1`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
    claims: [
      claim('q2URe00', 'U_{z→x} = (1/√2)[[1, 1], [1, −1]]', () => close(V.q2URe00, Math.SQRT1_2) && close(V.q2URe01, Math.SQRT1_2) && close(V.q2URe10, Math.SQRT1_2) && close(V.q2URe11, -Math.SQRT1_2)),
      cD30,
      claim('q2Px30Plus', 'P(+x) = 0.933, P(−x) = 0.067 for ψ', () => close(V.q2Px30Plus, 0.9330127018922194) && close(V.q2Px30Minus, 0.06698729810778072)),
      claim('q2Px30Minus', 'P(−x) = 0.067 for ψ', () => close(V.q2Px30Minus, 0.06698729810778072)),
      cD30b,
    ],
  },
  {
    id: 'q2-change:b3',
    phase: 'lecture',
    text: 'The notes also do it by hand. Put $|{\\pm z}\\rangle = (|{+x}\\rangle \\pm |{-x}\\rangle)/\\sqrt2$ into $\\psi = c_1|{+z}\\rangle + c_2|{-z}\\rangle$ and collect: $d_1 = (c_1 + c_2)/\\sqrt2$ and $d_2 = (c_1 - c_2)/\\sqrt2$. The notes’ boxed equation prints $c_2 - c_1$; the matrix below it is right.',
    formal: `Substitution gives $d_2 = (c_1 - c_2)/\\sqrt2 = ${d(V.q2D30Re1)}$ for $\\psi$; the notes' boxed $(c_2 - c_1)/\\sqrt2$ has the wrong sign, and the matrix $d = Uc$ on the same page corrects it (see the errata box; N&C p. 22 has the right sign).`,
    caption: `$d_2 = (c_1 - c_2)/\\sqrt2 = ${d(V.q2D30Re1)}$, not $${d(V.q2Printed)}$`,
    captionFormal: `the notes' printed sign would give $${d(V.q2Printed)}$`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
    claims: [claim('q2D30Re1', 'd2 = 0.2588', () => close(V.q2D30Re1, 0.25881904510252085)), claim('q2Printed', "Eq. 1.3's printed sign gives −0.2588", () => close(V.q2Printed, -0.25881904510252085, 1e-6))],
  },
  {
    id: 'q2-change:b4',
    phase: 'lecture',
    text: 'U never changes a length or an angle. The reason is the [[qc-completeness|completeness relation]]: adding $|\\alpha_k\\rangle\\langle\\alpha_k|$ over a whole orthonormal basis gives $I$, the operator that changes nothing. So $UU^\\dagger = I$: U is [[qc-unitary|unitary]], and $U^\\dagger$ undoes it.',
    formal: `$[UU^\\dagger]_{ij} = \\sum_k\\langle\\alpha'_i|\\alpha_k\\rangle\\langle\\alpha_k|\\alpha'_j\\rangle = \\langle\\alpha'_i|\\alpha'_j\\rangle = \\delta_{ij}$, by $\\sum_k|\\alpha_k\\rangle\\langle\\alpha_k| = 1$ (notes p. 9; N&C p. 67). Here $[U^\\dagger]_{ij} = U^*_{ji} = \\langle\\alpha_i|\\alpha'_j\\rangle$; the notes print $\\langle\\alpha_j|\\alpha'_i\\rangle$, which is $U^*_{ij}$ (see the errata box).`,
    caption: '$U$ then $U^\\dagger$: back where we started',
    captionFormal: `z → y: $[U^\\dagger]_{12} = \\langle{+z}|{-y}\\rangle = ${d(V.q2UyRight01Re)}$, not $\\langle{-z}|{+y}\\rangle = ${d(V.q2UyNotes01Im)}i$`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
    claims: [
      claim('q2UnitZX', 'U_{z→x} is unitary', () => V.q2UnitZX === 1 && V.q2UnitZY === 1),
      claim('q2UyDag01Re', 'z → y: [U†]12 = 0.7071', () => close(V.q2UyDag01Re, Math.SQRT1_2)),
      claim('q2UyNotes01Im', "the notes' printed bracket ⟨−z|+y⟩ = 0.7071i", () => close(V.q2UyNotes01Im, Math.SQRT1_2)),
      claim('q2UyRight01Re', 'the right bracket ⟨+z|−y⟩ = 0.7071', () => close(V.q2UyRight01Re, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q2-change:b5',
    phase: 'lecture',
    text: "An operator's table depends on the basis as well. Slip the identity $I$ in on both sides of $A$: the new table is $A' = UAU^\\dagger$, the [[qc-similarity-transform|similarity transform]]. $S_z$'s table in the x basis moves off the diagonal: $(\\hbar/2)[[0, 1], [1, 0]]$. <<qc-l5-operators|Spin Lab 5.4>> changes operator tables with B.",
    formal: "$A'_{kl} = \\langle k'|A|l'\\rangle = \\sum_{ij}\\langle k'|i\\rangle A_{ij}\\langle j|l'\\rangle = \\sum_{ij}U_{ki}A_{ij}U^*_{lj}$, so $A' = UAU^\\dagger$ (notes p. 9; D3; Axler p. 93; N&C ⚑, p. 71, no sheet assigns it). With $U = U_{z\\to x}$: $US_zU^\\dagger$ is $S_x$'s table.",
    caption: `$S_z\\psi$ is one arrow; in x coordinates it reads $(${d(V.q2SzPsiXRe0)}, ${d(V.q2SzPsiXRe1)})$`,
    captionFormal: `$UAU^\\dagger\\cdot(Uc) = U(Ac)$: $(${d(V.q2SzPsiXRe0)}, ${d(V.q2SzPsiXRe1)})\\hbar$`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', image: { named: 'Sz', label: '$S_z|\\psi\\rangle$' } }),
    fidelity: ['plane-image-not-state', 'plane-frame-turn-passive'],
    derivation: {
      result: "A' = UAU^\\dagger",
      ground: [
        { tex: 'A_{ij} = \\langle i|A|j\\rangle,\\quad A\'_{kl} = \\langle k\'|A|l\'\\rangle', why: "The operator's table in the old basis {|i⟩} and in the new one {|k'⟩}." },
        { tex: 'I = \\sum_i |i\\rangle\\langle i|', why: 'The completeness relation (Unit 2.5): this sum changes nothing.' },
        { tex: "A'_{kl} = \\langle k'|\\,I A I\\,|l'\\rangle", why: 'Two copies of "change nothing" change nothing.' },
        { tex: "A'_{kl} = \\sum_{i,j}\\langle k'|i\\rangle A_{ij}\\langle j|l'\\rangle", why: 'Write out both sums; the middle pair is $A_{ij}$.' },
        { tex: "\\langle k'|i\\rangle = U_{ki},\\quad \\langle j|l'\\rangle = U^*_{lj}", why: "The first is an entry of U; the second has its sides swapped, so it is conjugated." },
        { tex: "A'_{kl} = \\sum_{i,j}U_{ki}A_{ij}U^*_{lj}", why: 'Put step 5 into step 4.' },
        { tex: "A' = UAU^\\dagger", why: "$U^*_{lj}$ is entry $(j, l)$ of $U^\\dagger$, so the double sum is a product of three tables." },
      ],
      formal: [
        { tex: "A'_{kl} = \\sum_{i,j}\\langle k'|i\\rangle A_{ij}\\langle j|l'\\rangle = \\sum_{i,j}U_{ki}A_{ij}U^*_{lj}", why: 'Two resolutions of the identity (notes p. 9).' },
        { tex: "A' = UAU^\\dagger", why: '$(U^\\dagger)_{jl} = U^*_{lj}$.' },
      ],
    },
    claims: [
      claim('q2SzXCheck', "U S_z U† equals S_x's table", () => V.q2SzXCheck === 1),
      claim('q2SzPsiXRe0', 'S_zψ in the x frame: (0.1294, 0.4830)', () => close(V.q2SzPsiXRe0, 0.12940952255126043) && close(V.q2SzPsiXRe1, 0.48296291314453416)),
      claim('q2SzPsiXRe1', 'the second component of S_zψ in the x frame is 0.4830', () => close(V.q2SzPsiXRe1, 0.48296291314453416)),
    ],
  },
  {
    id: 'q2-change:b6',
    phase: 'books',
    text: 'Quantum computing knows this table as the [[qc-hadamard|Hadamard gate]] $H$: $H|0\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt2$ and $H|1\\rangle = (|0\\rangle - |1\\rangle)/\\sqrt2$. Using it twice gives back the start: $H^2 = I$. Chapter Q4 uses $H$ as a gate.',
    formal: "With $|0\\rangle \\equiv |{+z}\\rangle$, the notes' $U_{z\\to x}$ equals Bergou's $H$ (p. 4): $H = H^\\dagger = H^{-1}$. As $U$ it relabels coordinates (passive); as a gate it moves the state (active); Chapter Q4 owns gates.",
    caption: '$H|0\\rangle = |{+x}\\rangle$, $H|1\\rangle = |{-x}\\rangle$, $H^2 = I$',
    captionFormal: '$H|0\\rangle = |{+x}\\rangle$, $H|1\\rangle = |{-x}\\rangle$, $H^2 = I$',
    stage: amp({ state: { dir: '+x' }, labels: 'spin' }),
    refs: [bergou('Eq. 1.8, p. 4', 'H is the same table as the notes’ U_{z→x}: the discovery this beat makes precise.')],
    claims: [
      claim('q2UisH', 'U_{z→x} is exactly the Hadamard matrix', () => V.q2UisH === 1),
      claim('q2HH', 'H² = I', () => V.q2HH === 1),
      claim('q2H0', 'H|0⟩ = |+x⟩', () => V.q2H0 === 1),
    ],
  },
  {
    id: 'q2-change:b7',
    phase: 'clue',
    text: "The notes' printed slip flips only the sign of $d_2$, so both chances along x stay the same. Does the slip matter?",
    formal: 'If $d_2 = (c_2 - c_1)/\\sqrt2$, which state do the new components describe?',
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x' }),
    reveal: {
      text: `Yes. For $\\psi$ at 30°, the wrong numbers $(${d(V.q2D30Re0)}, -${d(V.q2D30Re1)})$ describe the state at 60°. A z magnet would then read ${d(V.q2WrongPzPlus, 2)} and ${d(V.q2WrongPzMinus, 2)} instead of ${d(V.q2WrongPzMinus, 2)} and ${d(V.q2WrongPzPlus, 2)}.`,
      formal: `Yes: $U^\\dagger(${d(V.q2D30Re0)}, -${d(V.q2D30Re1)}) = (${d(V.q2WrongRe0)}, ${d(V.q2WrongRe1)})$, the state at 60°, the mirror image of $\\psi$ in the 45° line. The x statistics agree; the z statistics and every cross term do not.`,
      caption: `wrong sign → the state at 60°: P(+z) = ${d(V.q2WrongPzPlus, 2)}, not ${d(V.q2WrongPzMinus, 2)}`,
      stage: plane({ psi: { planeDeg: 60 }, others: [{ ket: { planeDeg: 30 }, role: 'ghost', badge: 'ψ' }], basis: 'z', shadows: true }),
      claims: [
        cD30,
        cD30b,
        claim('q2WrongRe0', "U†(0.966, −0.259) = (0.5, 0.866)", () => close(V.q2WrongRe0, 0.5, 1e-5) && close(V.q2WrongRe1, Math.sqrt(3) / 2, 1e-5)),
        claim('q2WrongRe1', 'the second component of the wrong-sign state is 0.866', () => close(V.q2WrongRe1, Math.sqrt(3) / 2, 1e-5)),
        claim('q2WrongPzPlus', "the wrong-sign state gives P(+z) = 0.25, P(−z) = 0.75", () => close(V.q2WrongPzPlus, 0.25) && close(V.q2WrongPzMinus, 0.75)),
        claim('q2WrongPzMinus', 'the wrong-sign state gives P(−z) = 0.75', () => close(V.q2WrongPzMinus, 0.75)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q2-photon — Turning the frame of a photon                                                       */
/* ---------------------------------------------------------------------------------------------- */

const photon: Beat[] = [
  {
    id: 'q2-photon:b1',
    phase: 'lecture',
    text: 'Light is a wave of electric field, and its [[qc-polarization|polarization]] is the direction the field swings. One photon has two basis states: $|x\\rangle$, swinging across, and $|y\\rangle$, swinging up. Any other straight-line polarization is a mix of them.',
    formal: 'A photon’s polarization state lies in $\\mathrm{span}\\{|x\\rangle, |y\\rangle\\}$ with $\\langle x|y\\rangle = 0$ (notes p. 9); classically this is the direction of the oscillating $E$ field.',
    caption: '$|x\\rangle$ across, $|y\\rangle$ up: two states at right angles',
    captionFormal: "Rosetta: the notes' frame angle $\\varphi$ is $\\chi$ here; photon $|x\\rangle, |y\\rangle$ (no sign) are not spin $|{\\pm x}\\rangle, |{\\pm y}\\rangle$; Bergou's $|0\\rangle = |H\\rangle = |x\\rangle$",
    stage: plane({ labels: 'photon', psi: { planeDeg: 0 }, others: [{ ket: { planeDeg: 90 }, role: 'basis' }], rightAngle: true }),
    fidelity: ['qc-plane-photon-real-slice'],
  },
  {
    id: 'q2-photon:b2',
    phase: 'lecture',
    text: `Turn the polarizer frame by an angle $\\chi$: $|x'\\rangle = \\cos\\chi|x\\rangle + \\sin\\chi|y\\rangle$ and $|y'\\rangle = -\\sin\\chi|x\\rangle + \\cos\\chi|y\\rangle$. At $\\chi = 45°$, $|x'\\rangle = (${d(V.q2Pol45Re0)}, ${d(V.q2Pol45Re1)})$. For light the state turns by the same angle as the filter.`,
    formal: 'The frame change $U_{ij} = \\langle i\'|j\\rangle = (\\cos\\chi, \\sin\\chi; -\\sin\\chi, \\cos\\chi)$ is real orthogonal, hence unitary (notes p. 9). It has determinant $+1$, a rotation; the spin $U_{z\\to x} = H$ has $-1$.',
    caption: `the frame turned by 45°: $|x'\\rangle = (${d(V.q2Pol45Re0)}, ${d(V.q2Pol45Re1)})$`,
    captionFormal: `$U(45°)$ unitary, $\\det U = +1$; $\\det H = -1$`,
    stage: plane({ labels: 'photon', psi: { planeDeg: 45 }, others: [{ ket: { planeDeg: 135 }, role: 'second', badge: "$|y'\\rangle$" }], rightAngle: true }),
    claims: [
      claim('q2Pol45Re0', "|x'⟩ at χ=45°: (0.7071, 0.7071)", () => close(V.q2Pol45Re0, Math.SQRT1_2) && close(V.q2Pol45Re1, Math.SQRT1_2)),
      claim('q2FrameU45Unitary', "the frame-turn table is unitary", () => V.q2FrameU45Unitary === 1),
      claim('q2DetUH', 'det H = −1; det U(45°) = +1', () => close(V.q2DetUH, -1) && close(V.q2DetU45, 1)),
    ],
  },
  {
    id: 'q2-photon:b3',
    phase: 'lecture',
    text: 'Two more states mix x and y with a quarter-turn phase: $|R\\rangle = (|x\\rangle + i|y\\rangle)/\\sqrt2$ and $|L\\rangle = (|x\\rangle - i|y\\rangle)/\\sqrt2$. In them the field turns round in a circle, one way or the other: [[qc-circular-polarization|circular polarization]]. Below, the bars’ $|0\\rangle$, $|1\\rangle$ are $|x\\rangle$, $|y\\rangle$.',
    formal: '$|R\\rangle, |L\\rangle = (|x\\rangle \\pm i|y\\rangle)/\\sqrt2$ (notes p. 9) are orthonormal and unbiased with respect to $\\{|x\\rangle, |y\\rangle\\}$: $|\\langle x|R\\rangle|^2 = \\tfrac12$. They carry the same numbers as the spin states $|{\\pm y}\\rangle$ of Unit 1.3.',
    caption: `$|R\\rangle$: amplitudes ${d(V.q2RRe0)} and ${d(V.q2RIm1)}i`,
    captionFormal: `$\\langle R|L\\rangle = 0$; $|\\langle x|R\\rangle|^2 = ${d(V.q2PxR, 1)}$`,
    stage: amp({ state: { dir: '+y' }, dials: true, labels: 'bits' }),
    claims: [
      claim('q2RRe0', '|R⟩ = (0.7071, 0.7071i)', () => close(V.q2RRe0, Math.SQRT1_2) && close(V.q2RIm1, Math.SQRT1_2)),
      claim('q2RL', '⟨R|L⟩ = 0', () => close(V.q2RL, 0)),
      claim('q2PxR', '|⟨x|R⟩|² = 0.5', () => close(V.q2PxR, 0.5)),
    ],
  },
  {
    id: 'q2-photon:b4',
    phase: 'lecture',
    text: "Build $|R'\\rangle$ the same way on the turned frame and collect the x and y parts. Both carry the same factor $\\cos\\chi - i\\sin\\chi = e^{-i\\chi}$ (Chapter F1). So $|R'\\rangle = e^{-i\\chi}|R\\rangle$: the same state with a new phase. Likewise $|L'\\rangle = e^{+i\\chi}|L\\rangle$.",
    formal: "$|R'\\rangle = (|x'\\rangle + i|y'\\rangle)/\\sqrt2 = e^{-i\\chi}|R\\rangle$ and $|L'\\rangle = e^{i\\chi}|L\\rangle$ (notes p. 9; D4): a frame turn is diagonal on $\\{|R\\rangle, |L\\rangle\\}$, with eigenvalues $e^{\\mp i\\chi}$.",
    caption: 'turning the frame by 45°: both dials of $|R\\rangle$ turn back by 45°',
    captionFormal: `$|R'\\rangle = e^{-i45°}|R\\rangle = (${d(V.q2Rp45Re0)} - ${d(-V.q2Rp45Im0)}i, ${d(V.q2Rp45Re1)} + ${d(V.q2Rp45Im1)}i)$`,
    stage: amp({ state: { dir: '+y' }, dials: true, labels: 'bits', globalPhaseDeg: sweep(0, -45) }),
    derivation: {
      result: "|R'\\rangle = e^{-i\\chi}|R\\rangle",
      ground: [
        { tex: "|R'\\rangle = (|x'\\rangle + i|y'\\rangle)/\\sqrt2", why: 'The recipe for |R⟩, built on the turned frame.' },
        { tex: "|x'\\rangle + i|y'\\rangle = (\\cos\\chi - i\\sin\\chi)|x\\rangle + (\\sin\\chi + i\\cos\\chi)|y\\rangle", why: "Put in |x'⟩ and |y'⟩ from b2 and collect the x and y parts." },
        { tex: '\\sin\\chi + i\\cos\\chi = i(\\cos\\chi - i\\sin\\chi)', why: 'Multiply out the right side: i cos χ − i² sin χ, and i² = −1.' },
        { tex: '\\cos\\chi - i\\sin\\chi = e^{-i\\chi}', why: 'Euler’s formula at the angle −χ (Chapter F1).' },
        { tex: "|x'\\rangle + i|y'\\rangle = e^{-i\\chi}\\big(|x\\rangle + i|y\\rangle\\big)", why: 'Both parts carry the same factor, so it comes out in front.' },
        { tex: "|R'\\rangle = e^{-i\\chi}|R\\rangle", why: 'Divide both sides by √2.' },
      ],
      formal: [
        { tex: "|x'\\rangle + i|y'\\rangle = e^{-i\\chi}|x\\rangle + ie^{-i\\chi}|y\\rangle", why: 'Substitute and apply Euler’s formula.' },
        { tex: "|R'\\rangle = e^{-i\\chi}|R\\rangle", why: "Same for |L'⟩ with i → −i (notes p. 9)." },
      ],
    },
    claims: [
      claim('q2Rp45Re0', "|R'⟩ at χ=45°: (0.5 − 0.5i, 0.5 + 0.5i)", () => close(V.q2Rp45Re0, 0.5) && close(V.q2Rp45Im0, -0.5) && close(V.q2Rp45Re1, 0.5) && close(V.q2Rp45Im1, 0.5)),
      claim('q2Rp45Phase', "|R'⟩ equals e^{−iχ}|R⟩ exactly", () => V.q2Rp45Phase === 1 && V.q2LpPhase === 1),
    ],
  },
  {
    id: 'q2-photon:b5',
    phase: 'lecture',
    text: 'The notes write the turn as $e^{-iJ_z\\chi/\\hbar}$, where $J_z$ is the photon’s spin about its line of flight, the turn’s [[qc-generator|generator]]. Since the turn multiplies $|R\\rangle$ by $e^{-i\\chi}$, $J_z|R\\rangle = \\hbar|R\\rangle$ and $J_z|L\\rangle = -\\hbar|L\\rangle$. A photon’s spin is $\\pm\\hbar$, twice an electron’s $\\hbar/2$.',
    formal: '$|R(L)\'\\rangle = e^{-iJ_z\\chi/\\hbar}|R(L)\\rangle$ for all $\\chi$ gives $J_z|R\\rangle = \\hbar|R\\rangle$, $J_z|L\\rangle = -\\hbar|L\\rangle$ (notes p. 9) <<qc-l6-generator|Sz generates the turn>>: the [[qc-helicity|helicity]] $\\pm\\hbar$. In $\\{|x\\rangle, |y\\rangle\\}$, $J_z = \\hbar(0\\ {-i}; i\\ 0)$.',
    caption: '$|L\\rangle$: the dials turn the other way',
    captionFormal: '$J_z/\\hbar$ on $\\{|x\\rangle, |y\\rangle\\}$: eigenvalues $\\pm1$ on $|R\\rangle, |L\\rangle$',
    stage: amp({ state: { dir: '-y' }, dials: true, labels: 'bits', globalPhaseDeg: sweep(0, 45) }),
    claims: [
      claim('q2JzR', 'J_z|R⟩ = ħ|R⟩', () => V.q2JzR === 1),
      claim('q2JzL', 'J_z|L⟩ = −ħ|L⟩', () => V.q2JzL === 1),
      claim('q2FrameExp', "cos χ I − i sin χ J = the frame's rotation matrix", () => V.q2FrameExp === 1),
    ],
  },
  {
    id: 'q2-photon:b6',
    phase: 'books',
    text: `Light-based quantum computers use this: Bergou sets $|0\\rangle = |H\\rangle$, horizontal (our $|x\\rangle$), and $|1\\rangle = |V\\rangle$. A polarizer turned by 45° passes half of $|x\\rangle$ light. A spin magnet turned by 45° passes ${d(V.q2Spin45, 3)} of $|{+z}\\rangle$ atoms. <<qc-l1-average|Spin Lab 1.3>> compares polarizers and magnets.`,
    formal: `Bergou §14.2 (p. 257): $|0\\rangle = |H\\rangle$, $|1\\rangle = |V\\rangle$, so a frame turn $\\chi$ is $R_y(2\\chi)$ on the qubit sphere: 45° here is 90° there <<qc-l7-two-angles|sphere angles are twice state angles>>. Malus: $\\cos^2\\chi = ${d(V.q2Malus45, 1)}$; spin: $\\cos^2(\\theta/2) = ${d(V.q2Spin45, 3)}$.`,
    caption: `45°: light passes ${d(V.q2Malus45, 1)}, spin passes ${d(V.q2Spin45, 3)}`,
    captionFormal: `$|\\langle x|x'\\rangle|^2 = ${d(V.q2Malus45, 1)}$ vs $|\\langle{+z}|\\theta = 45°\\rangle|^2 = ${d(V.q2Spin45, 3)}$`,
    stage: plane({ labels: 'photon', psi: { planeDeg: 45 }, basis: 'z', shadows: true }),
    refs: [bergou('§14.2, p. 257', 'Photon polarization as a qubit: |0⟩ = |H⟩, |1⟩ = |V⟩; its θ (Eq. therein) is half the sphere’s polar angle, matching the spin convention.')],
    claims: [
      claim('q2Malus45', "Malus's law: cos² 45° = 0.5", () => close(V.q2Malus45, 0.5)),
      claim('q2Spin45', 'spin at the same 45° tilt: 0.8536', () => close(V.q2Spin45, 0.8535533905932737)),
      claim('q2PolBloch45', 'the photon 45° turn is 90° on the sphere', () => close(V.q2PolBloch45, 90)),
      claim('q2FrameIsRy', 'the frame turn is exactly a spin R_y rotation, doubled', () => V.q2FrameIsRy === 1),
    ],
  },
  {
    id: 'q2-photon:b7',
    phase: 'clue',
    text: 'Turn the frame by 90°. What happens to $|x\\rangle$ light, and to $|R\\rangle$ light?',
    formal: "At $\\chi = 90°$, compare $|x'\\rangle$ with $|x\\rangle$ and $|R'\\rangle$ with $|R\\rangle$.",
    stage: amp({ state: { dir: '+y' }, dials: true, labels: 'bits' }),
    reveal: {
      text: '$|x'+"'"+'\\rangle = |y\\rangle$: the new x filter blocks all of the old $|x\\rangle$ light. But $|R'+"'"+'\\rangle = -i|R\\rangle$ is the same state: every filter reads it as before. Circular light has no preferred transverse axis.',
      formal: "$|\\langle x|x'\\rangle|^2 = 0$ while $|\\langle R|R'\\rangle|^2 = 1$: $\\{|R\\rangle, |L\\rangle\\}$ are the eigenstates of every frame turn, the $J_z$ basis.",
      caption: "$|\\langle x|x'\\rangle|^2 = 0$; $|\\langle R|R'\\rangle|^2 = 1$",
      stage: amp({ state: { dir: '+y' }, dials: true, labels: 'bits', globalPhaseDeg: -90 }),
      claims: [
        claim('q2Rot90P0', "a 90° turn sends |x⟩ light fully into |y⟩: it reads 0 on the new x filter", () => close(V.q2Rot90P0, 0, 1e-6)),
        claim('q2Rot90P1', '|R⟩ light is unaffected by a 90° frame turn', () => close(V.q2Rot90P1, 1)),
        claim('q2Rot90InnerIm', "⟨R|R'⟩ = −i", () => close(V.q2Rot90InnerIm, -1)),
      ],
    },
  },
]

export const Q2_STORY: Record<string, Beat[]> = {
  'q2-basis': basis,
  'q2-gram-schmidt': gramSchmidtUnit,
  'q2-spin-space': spinSpace,
  'q2-operators': operators,
  'q2-change': change,
  'q2-photon': photon,
}
