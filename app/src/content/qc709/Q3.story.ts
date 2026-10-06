/**
 * Chapter Q3 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q3-story.md §1, in both tracks,
 * with the judge's rulings (docs/roles/decisions/qc709-Q2Q3.md):
 *   - Q3-1: the formerly assigned problems (⟨+n|−n⟩, ⟨S⟩ and ΔS for |+n⟩, the real-eigenvalue proof D2) are worked in
 *     full — homework-status.md records HW1 P1/P4(b), 448's l3-eig-real, l4-g-sy as submitted;
 *   - Q3-2 (N21): p. 15's Û†ÂÛ is diagonal only with p. 9's Û on the OTHER side; a box correction, in the notes' voice;
 *   - Q3-3: D5 keeps the notes' own Schwarz route (not a copy of 448's Reference-A proof), bridged to l7-uncertainty;
 *   - Q3-4: one link-back sentence to the Born rule (Q1), then only what p. 11 adds: the projector sandwich (D1),
 *     P² = P.
 *
 * Rules kept here (as in Q1's story file):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come from
 *   Q3.values.ts, printed with d / tf / uf, and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Ground-up sentences ≤ 25 words, Formal ≤ 40; symbols defined before use in both tracks.
 * - Bridges go only to built Spin Lab units; 709 chapters not yet built (Q2, Q4, Q6) are named in words.
 * - No `{{term|…}}` prose terms in this chapter: every anchor a reader might want is already named by a gloss tag,
 *   so `Beat.terms` stays empty throughout.
 */
import type { AmplitudesState, Beat, BlochState, HilbertPlaneState, LabBench, LabDevice, LabState, OperatorState, Ref } from '../schema'
import { V, claim, close, d, uf } from './Q3.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const lab = (benches: LabState['benches'], extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches, ...extra })
const main = (source: LabBench['source'], devices: LabDevice[], extra: Omit<LabBench, 'id' | 'source' | 'devices'> = {}): LabBench => ({ id: 'main', source, devices, ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
const ops = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', ...s })
const amp = (s: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', ...s })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })

const Z: LabDevice = { axis: 'z' }
const Zp: LabDevice = { axis: 'z', keep: '+' }
const X: LabDevice = { axis: 'x' }

const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })
const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })

/** N, the chapter's sphere state θ = 60°, φ = 45° (used across every unit). */
const N_STATE = { thetaDeg: 60, phiDeg: 45 } as const

/* claims shared by more than one beat */
const cAvgSz = claim('q3AvgSz', '⟨S_z⟩ = 0.25ħ for |+n⟩', () => close(V.q3AvgSz, 0.25))
const cAvgSxSy = claim('q3AvgSx', '⟨S_x⟩ = ⟨S_y⟩ = 0.306ħ for |+n⟩', () => close(V.q3AvgSx, V.q3AvgSy) && close(V.q3AvgSx, 0.3062, 1e-3))
const cVarSz = claim('q3VarSz', '(ΔS_z)² = 0.1875ħ² for |+n⟩', () => close(V.q3VarSz, 0.1875))
const cSpreadZ = claim('q3SpreadZ', 'ΔS_z = 0.433ħ for |+n⟩', () => close(V.q3SpreadZ, 0.433, 1e-3))
const cVarXY = claim('q3VarXY', '(ΔS_x)² = (ΔS_y)² = 0.15625ħ² for |+n⟩', () => close(V.q3VarXY, 0.15625))
const cSpreadXY = claim('q3SpreadXY', 'ΔS_x = ΔS_y = 0.395ħ for |+n⟩', () => close(V.q3SpreadXY, 0.3953, 1e-3))
const cNOrth = claim('q3NOrth', '⟨+n|−n⟩ = 0', () => close(V.q3NOrth, 0))
/** The Schwarz-to-Robertson split always carries the constant ½ (D5 step 4); ¼ = (½)² is its square (D5's result). */
const cHalf = claim('q3Half', 'the split ΔAΔB = ½[ΔA,ΔB] + ½{ΔA,ΔB} carries the constant ½', () => close(V.q3Half, 0.5))
const cQuarter = claim('q3Quarter', 'the uncertainty bound carries the constant ¼ = (½)²', () => close(V.q3Quarter, V.q3Half * V.q3Half))
const cPzInXHalf = claim('q3PzInXHalf', 'every entry of P_{+z} in the x basis is ½ = 0.707²', () => close(V.q3PzInXHalf, V.q3XZOverlap * V.q3XZOverlap, 1e-3))
const cAvgSzSq = claim('q3AvgSzSq', '⟨S_z⟩² = 0.0625ħ² for |+n⟩', () => close(V.q3AvgSzSq, V.q3AvgSz * V.q3AvgSz))
const cPsiBeta = claim('q3PsiBeta', 'ψ’s |−z⟩ coordinate is 0.5', () => close(V.q3PsiBeta, 0.5))

/* ---------------------------------------------------------------------------------------------- */
/* q3-born — Chances from overlaps and projectors                                                  */
/* ---------------------------------------------------------------------------------------------- */

const born: Beat[] = [
  {
    id: 'q3-born:b1',
    phase: 'lecture',
    text: `Unit 1.3 met the [[qc-born-rule|Born rule]]: a chance is a size squared. The notes now state it for any two states. The overlap ⟨α|β⟩ is the [[qc-amplitude|probability amplitude]] for a system prepared in |β⟩ to be found in |α⟩, and the chance is |⟨α|β⟩|². For |+z⟩ and |+x⟩ it is ${uf(V.q3Pzx)}.`,
    formal: `The [[qc-born-rule|Born rule]] reads $P_{α|β} = |⟨α|β⟩|²$ for [[qc-normalized|normalized]] kets, with ⟨α|β⟩ the amplitude (notes p. 11) <<qc-l3-postulates|the same rule and the state after a measurement>>. The notes’ example: |⟨+x|+z⟩|² = ${uf(V.q3Pzx)}.`,
    caption: `|+z⟩ read in the x frame: ${uf(V.q3Pzx)} and ${uf(V.q3Pzx)}`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    fidelity: ['plane-shadow-born'],
    claims: [claim('q3Pzx', `|⟨+x|+z⟩|² = ${uf(V.q3Pzx)}`, () => close(V.q3Pzx, 0.5))],
  },
  {
    id: 'q3-born:b2',
    phase: 'lecture',
    introduces: ['qc-projector'],
    text: `Write the chance as ⟨ψ|M⟩⟨M|ψ⟩. The middle pair |M⟩⟨M| is an outer product (Unit 2.4), the [[qc-projector|projector]] P_M onto |M⟩: it keeps the part of a state along |M⟩. So the chance is a sandwich, p_M = ⟨ψ|P_M|ψ⟩. For ψ and |+x⟩ it is ${d(V.q3BornPlus, 3)}. <<qc-l3-projectors|Spin Lab 3.3>> pulls out one outcome’s piece the same way.`,
    formal: `p_M = |⟨M|ψ⟩|² = ⟨ψ|M⟩⟨M|ψ⟩ = ⟨ψ|P_M|ψ⟩ with P_M = |M⟩⟨M| (notes p. 11; D1): the probability is the projector’s average in ψ. Here P_{+x}ψ has length ${d(V.q3ProjLen, 3)}, and ⟨ψ|P_{+x}|ψ⟩ = ${d(V.q3BornPlus, 3)}.`,
    caption: `ψ onto |+x⟩: a shadow ${d(V.q3ProjLen, 3)} long, chance ${d(V.q3BornPlus, 3)}`,
    captionFormal: `⟨ψ|P_{+x}|ψ⟩ = ${d(V.q3BornPlus, 3)} = |⟨+x|ψ⟩|²`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', project: 1 }),
    derivation: {
      result: 'p_M = \\langle\\psi|P_M|\\psi\\rangle',
      ground: [
        {
          tex: 'p_M = |\\langle M|\\psi\\rangle|^2',
          why: 'The Born rule of Unit 1.3: a chance is an amplitude’s size squared.',
          view: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
          viewCaption: 'ψ’s shadow on |+x⟩: the amplitude ⟨+x|ψ⟩.',
        },
        { tex: '|z|^2 = z^*z', why: 'For any complex number, the size squared is the number times its mirror image (Chapter F1).' },
        { tex: '\\langle M|\\psi\\rangle^* = \\langle\\psi|M\\rangle', why: 'Swapping the two sides of an [[inner-product|inner product]] conjugates it (Unit 1.5).' },
        { tex: 'p_M = \\langle\\psi|M\\rangle\\langle M|\\psi\\rangle', why: 'Steps 2 and 3 with z = ⟨M|ψ⟩.' },
        { tex: 'P_M = |M\\rangle\\langle M|', why: 'Group the middle ket and bra as one operator, an outer product (Unit 2.4).' },
        {
          tex: 'p_M = \\langle\\psi|P_M|\\psi\\rangle',
          why: 'So the chance is P_M sandwiched in the state.',
          view: plane({ psi: { planeDeg: 30 }, basis: 'x', project: 1 }),
          viewCaption: 'The projection P_Mψ, drawn as a vector.',
          claims: [claim('q3BornPlus', 'ψ onto |+x⟩: chance 0.933', () => close(V.q3BornPlus, 0.933, 1e-3))],
        },
      ],
      formal: [
        {
          tex: 'p_M = |\\langle M|\\psi\\rangle|^2 = \\langle\\psi|M\\rangle\\langle M|\\psi\\rangle',
          why: 'Conjugate symmetry.',
          view: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
          viewCaption: 'ψ’s shadow on |+x⟩.',
        },
        {
          tex: 'p_M = \\langle\\psi|P_M|\\psi\\rangle',
          view: plane({ psi: { planeDeg: 30 }, basis: 'x', project: 1 }),
          viewCaption: 'The projection P_Mψ.',
          why: 'With P_M = |M⟩⟨M| (notes p. 11).',
          claims: [claim('q3SandwichMatchesProb', 'the sandwich equals the Born-rule chance', () => V.q3SandwichMatchesProb === 1)],
        },
      ],
    },
    claims: [
      claim('q3BornPlus', 'ψ onto |+x⟩: chance 0.933', () => close(V.q3BornPlus, 0.933, 1e-3)),
      claim('q3ProjLen', '‖P_{+x}ψ‖ = 0.966', () => close(V.q3ProjLen, 0.9659, 1e-3)),
    ],
  },
  {
    id: 'q3-born:b3',
    phase: 'lecture',
    text: 'Make a projector Λ_i = |e_i⟩⟨e_i| for every arrow of an [[orthonormal-basis|orthonormal basis]]. Unit 2.5 showed they add up to I, the operator that changes nothing. So the chances add to 1, and ψ = Σ_i|e_i⟩⟨e_i|ψ⟩ hands back its components.',
    formal:
      'An ON basis obeys ⟨i|j⟩ = δ_ij and Σ_iΛ_i = 1, Λ_i ≡ |i⟩⟨i| (notes p. 11; N&C eq. 2.22, p. 67). Then Σ_i p_i = ⟨ψ|Σ_iΛ_i|ψ⟩ = 1 and |β⟩ = Σ_i|e_i⟩⟨e_i|β⟩ = Σ_i c_i|e_i⟩.',
    caption: `ψ along x: chances ${d(V.q3BornPlus, 3)} and ${d(V.q3BornMinus, 3)}, adding to 1`,
    captionFormal: 'P_{+x} + P_{−x} = I',
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true }),
    refs: [nc('eq. 2.22, p. 67', 'The completeness relation for an [[orthonormal-basis|orthonormal basis]], Σ_i|i⟩⟨i| = 1, stated the same way.')],
    claims: [
      claim('q3BornPlus', 'ψ onto |+x⟩: chance 0.933', () => close(V.q3BornPlus, 0.933, 1e-3)),
      claim('q3BornMinus', 'ψ onto |−x⟩: chance 0.067', () => close(V.q3BornMinus, 0.067, 1e-3)),
      claim('q3Complete', 'the ±x and ±z projectors each add to I', () => V.q3Complete === 1),
    ],
  },
  {
    id: 'q3-born:b4',
    phase: 'books',
    text: 'Bergou lists the same rules as postulates. A projector used twice acts as once, P² = P. So the chance is also the squared length of P|ψ⟩. After the result, the state is P|ψ⟩ rescaled to length 1: here, |+x⟩.',
    formal:
      'Bergou §5.2 (p. 80): P_iP_j = δ_ijP_i, Σ_jP_j = I, p_j = ‖P_j|ψ⟩‖² = ⟨ψ|P_j²|ψ⟩ = ⟨ψ|P_j|ψ⟩, and the state after outcome j is P_j|ψ⟩/√p_j. N&C eqs. 2.103–2.104 (p. 88) say the same for projective measurements.',
    caption: 'P_{+x}ψ, rescaled: the state after a + result is |+x⟩',
    captionFormal: `‖P_{+x}ψ‖ = ${d(V.q3ProjLen, 3)} → P_{+x}ψ/‖P_{+x}ψ‖ = |+x⟩`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'x', project: 1, renormalize: true }),
    fidelity: ['plane-update-bookkeeping'],
    refs: [
      bergou('§5.2, p. 80', 'Six postulates, including P_iP_j = δ_ijP_i, Σ_jP_j = I, and the Lüders update rule after a measurement.'),
      nc('eqs. 2.103–2.104, p. 88', 'The same probability and post-measurement state for a projective measurement.'),
    ],
    claims: [claim('q3ProjLen', '‖P_{+x}ψ‖ = 0.966', () => close(V.q3ProjLen, 0.9659, 1e-3)), claim('q3AfterPlus', 'P_{+x}ψ, rescaled, is |+x⟩', () => V.q3AfterPlus === 1)],
  },
  {
    id: 'q3-born:b5',
    phase: 'clue',
    text: 'Multiply |M⟩ by −1, or by i. Does the projector |M⟩⟨M| change?',
    formal: 'Is |M⟩⟨M| invariant under |M⟩ → e^{iγ}|M⟩?',
    stage: plane({ psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: '$-|M\\rangle$' }] }),
    reveal: {
      text: 'No. The ket gains the phase and the bra gains its mirror image, and the two cancel: (i|M⟩)(−i⟨M|) = |M⟩⟨M|. A projector, like a chance, sees only the state, never its phase.',
      formal: 'No: e^{iγ}|M⟩⟨M|e^{−iγ} = |M⟩⟨M|, so projectors, and all probabilities, depend only on the ray (Chapter F1).',
      caption: 'P for i|+x⟩ equals P for |+x⟩',
      stage: plane({ psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: '$-|M\\rangle$' }] }),
      claims: [claim('q3PhaseProj', 'the projector is unchanged for −|+x⟩ and i|+x⟩', () => V.q3PhaseProj === 1)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q3-bloch — Every spin state is a point on a sphere                                              */
/* ---------------------------------------------------------------------------------------------- */

const blochUnit: Beat[] = [
  {
    id: 'q3-bloch:b1',
    phase: 'lecture',
    introduces: ['qc-bloch-sphere'],
    text: 'Make the first amplitude real and at least 0: turning both together changes nothing (Chapter F1). With the chances adding to 1, every spin state is then |+n⟩ = cos(θ/2)|+z⟩ + e^{iφ}sin(θ/2)|−z⟩. The [[qc-polar-angle|polar angle]] θ runs from 0° to 180°; the [[qc-azimuth|azimuth]] φ runs all the way round. <<qc-l6-bloch|three averages make a point>> builds the same sphere from averages.',
    formal:
      'Up to a [[global-phase|global phase]] every normalized ket is |+n⟩ = |θ, φ⟩ = cos(θ/2)|+z⟩ + e^{iφ}sin(θ/2)|−z⟩ with 0 ≤ θ ≤ π, 0 ≤ φ < 2π (notes p. 12, eq. 1.4; Bergou eq. 1.2, p. 2; N&C eq. 1.4, p. 15).',
    caption: `θ = 60°, φ = 45°: amplitudes ${d(V.q3NAlpha, 3)} and ${d(V.q3NBetaRe, 3)} + ${d(V.q3NBetaIm, 3)}i`,
    captionFormal: 'Rosetta: the notes’ ϕ is φ here; Bergou and N&C use the same θ, φ and |0⟩ = |+z⟩',
    stage: bloch({ state: N_STATE }),
    refs: [
      bergou('eq. 1.2, p. 2', 'The same two-angle form of a [[qubit|qubit]] state.'),
      nc('eq. 1.4, p. 15', 'The identical parametrization, up to a [[global-phase|global phase]].'),
    ],
    derivation: {
      result: '|{+n}\\rangle = \\cos\\tfrac\\theta2|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|{-z}\\rangle',
      ground: [
        {
          tex: '|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle',
          why: 'A general state: two complex numbers, α and β — four real numbers in all.',
          view: bloch({ state: '+z', globalPhaseDeg: 70 }),
          viewCaption: 'Turning the whole state by a phase moves no point on the sphere.',
        },
        { tex: '\\alpha \\to e^{-i\\arg\\alpha}\\alpha,\\ \\beta \\to e^{-i\\arg\\alpha}\\beta', why: 'Turning both amplitudes by the same phase changes no probability (Chapter F1): one of the four numbers is gone.' },
        { tex: '\\alpha \\ge 0\\ \\text{real}', why: 'After that turn the first amplitude is real and at least 0.' },
        { tex: '|\\alpha|^2 + |\\beta|^2 = 1', why: 'The chances along z must add to 1: one more number is fixed.' },
        { tex: '\\alpha = \\cos\\tfrac\\theta2,\\quad |\\beta| = \\sin\\tfrac\\theta2', why: 'A real number between 0 and 1, squared plus something summing to 1, is a cosine and a sine of a half-angle θ.' },
        {
          tex: '|{+n}\\rangle = \\cos\\tfrac\\theta2|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|{-z}\\rangle',
          why: 'Only β’s phase φ is still free: two real numbers, θ and φ, are left.',
          view: bloch({ state: N_STATE }),
          viewCaption: 'The two angles left over: a single point on the sphere.',
        },
      ],
      formal: [
        {
          tex: '\\alpha, \\beta\\ \\text{complex};\\quad \\alpha \\to e^{-i\\arg\\alpha}\\alpha,\\ \\beta \\to e^{-i\\arg\\alpha}\\beta \\Rightarrow \\alpha \\ge 0;\\quad |\\alpha|^2+|\\beta|^2=1',
          why: 'A global phase and normalization remove two of the four real parameters.',
          view: bloch({ state: '+z', globalPhaseDeg: 70 }),
          viewCaption: 'A global phase: no point on the sphere moves.',
        },
        {
          tex: '|{+n}\\rangle = \\cos\\tfrac\\theta2|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|{-z}\\rangle',
          why: 'The remaining freedom is exactly two angles, θ and φ (notes p. 12).',
          view: bloch({ state: N_STATE }),
          viewCaption: 'One point, two angles.',
        },
      ],
    },
    claims: [
      claim('q3NAlpha', '|+n⟩’s |+z⟩ amplitude is 0.866', () => close(V.q3NAlpha, 0.866, 1e-3)),
      claim('q3NBetaRe', '|+n⟩’s |−z⟩ amplitude has real part 0.354', () => close(V.q3NBetaRe, 0.3536, 1e-3)),
      claim('q3NBetaIm', '|+n⟩’s |−z⟩ amplitude has imaginary part 0.354', () => close(V.q3NBetaIm, 0.3536, 1e-3)),
    ],
  },
  {
    id: 'q3-bloch:b2',
    phase: 'lecture',
    text: `The same two angles name an arrow of length 1 in space, n̂ = (sin θ cos φ, sin θ sin φ, cos θ). So every spin state is one point on a sphere of radius 1, the [[qc-bloch-sphere|Bloch sphere]]. |0⟩ = |+z⟩ sits at the north pole; here n̂ = (${d(V.q3NVecXY, 3)}, ${d(V.q3NVecXY, 3)}, ${d(V.q3NVecZ, 3)}).`,
    formal:
      '|+n⟩ ↔ n̂ = (sin θ cos φ, sin θ sin φ, cos θ) ∈ S² (notes p. 12), one-to-one on rays: the global phase is gone, and the [[relative-phase|relative phase]] survives as φ. |±x⟩ and |±y⟩ sit on the equator at φ = 0, π and ±π/2 <<qc-l6-equator|the same longitude rule>>.',
    caption: `n̂ = (${d(V.q3NVecXY, 3)}, ${d(V.q3NVecXY, 3)}, ${d(V.q3NVecZ, 3)})`,
    captionFormal: `$\\hat n$ = (${d(V.q3NVecXY, 3)}, ${d(V.q3NVecXY, 3)}, ${d(V.q3NVecZ, 3)}) ∈ S²`,
    stage: bloch({ state: N_STATE, dropLines: ['z'] }),
    fidelity: ['bloch-not-lab-space'],
    claims: [
      claim('q3NVecXY', 'n̂’s x and y parts are 0.612 each', () => close(V.q3NVecXY, 0.6124, 1e-3)),
      claim('q3NVecZ', 'n̂’s z part is 0.5', () => close(V.q3NVecZ, 0.5)),
    ],
  },
  {
    id: 'q3-bloch:b3',
    phase: 'lecture',
    text: 'The opposite point has angles 180° − θ and φ + 180°. Its state is |−n⟩ = sin(θ/2)|+z⟩ − e^{iφ}cos(θ/2)|−z⟩. Its overlap with |+n⟩ is cos(θ/2)sin(θ/2) − sin(θ/2)cos(θ/2) = 0, since the phases cancel: opposite points are states at right angles.',
    formal:
      '|−n⟩ = |π − θ, φ + π⟩ = sin(θ/2)|+z⟩ − e^{iφ}cos(θ/2)|−z⟩ (eq. 1.5), and ⟨+n|−n⟩ = cos(θ/2)sin(θ/2) − e^{−iφ}sin(θ/2)e^{iφ}cos(θ/2) = 0 (notes p. 12). Its Bloch vector is −n̂ <<qc-l7-two-angles|sphere angles are twice state angles>>.',
    caption: 'the dot opposite |+n⟩ is |−n⟩',
    captionFormal: `⟨+n|−n⟩ = ${d(V.q3NOrth, 0)}; r(|−n⟩) = −n̂`,
    stage: bloch({ state: N_STATE, measure: N_STATE }),
    claims: [
      claim('q3MinusNAlpha', '|−n⟩’s |+z⟩ amplitude is 0.5', () => close(V.q3MinusNAlpha, 0.5)),
      claim('q3MinusNBetaAbs', '|−n⟩’s |−z⟩ amplitude has size 0.866', () => close(V.q3MinusNBetaAbs, 0.866, 1e-3)),
      cNOrth,
    ],
  },
  {
    id: 'q3-bloch:b4',
    phase: 'clue',
    text: 'The point opposite |+z⟩ is the south pole. Is its state −|+z⟩, the arrow turned around?',
    formal: 'Is −|+z⟩ the state at the south pole?',
    stage: bloch({ state: '+z' }),
    reveal: {
      text: 'No. −|+z⟩ is |+z⟩ times the phase −1: the same state, still at the north pole. The south pole is |−z⟩, at right angles. eq. 1.5 at θ = 0 gives −|−z⟩, again the south pole.',
      formal: 'No: −|+z⟩ = e^{iπ}|+z⟩ is the same ray. The antipode of n̂ = ẑ is |π, π⟩ = −|−z⟩ ≅ |−z⟩; opposite points are [[orthogonal|orthogonal]] kets, not negated ones.',
      caption: '−|+z⟩: north pole; |−z⟩: south pole',
      stage: bloch({ state: '-z', path: { about: 'x' } }),
      claims: [claim('q3MinusZpole', 'the south pole is |−z⟩, and −|+z⟩ is the same state as |+z⟩', () => V.q3MinusZpole === 1)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q3-spin-operators — Spin operators built from projectors                                        */
/* ---------------------------------------------------------------------------------------------- */

const spinOperators: Beat[] = [
  {
    id: 'q3-spin-operators:b1',
    phase: 'lecture',
    text: `A z magnet that passes only its + beam acts as P_{+z} = |+z⟩⟨+z|, the table [[1, 0], [0, 0]]. It turns α|+z⟩ + β|−z⟩ into α|+z⟩. Rescaled, that is |+z⟩: for ψ, (${d(V.q3PsiAlpha, 3)}, ${d(V.q3PsiBeta, 1)}) becomes (${d(V.q3ReducePsi0, 3)}, 0), then (1, 0). <<qc-l4-projectors|a projector asks a yes/no question>>.`,
    formal:
      'SG_{z+} ↔ P̂_{±z} = |±z⟩⟨±z| = diag(1, 0), diag(0, 1) (notes pp. 12–13). P̂_{+z}|ψ⟩ = α|+z⟩ is not normalized; the state after is P̂_{+z}|ψ⟩/‖P̂_{+z}|ψ⟩‖ = |+z⟩ up to phase.',
    caption: `ψ through the + filter: (${d(V.q3ReducePsi0, 3)}, 0), rescaled (1, 0)`,
    captionFormal: `P̂_{+z}ψ = (${d(V.q3ReducePsi0, 3)}, 0)`,
    stage: plane({ psi: { planeDeg: 30 }, basis: 'z', project: 1, renormalize: true }),
    claims: [claim('q3ReducePsi0', 'the filtered ψ keeps its |+z⟩ amplitude, 0.866', () => close(V.q3ReducePsi0, 0.866, 1e-3)), cPsiBeta],
  },
  {
    id: 'q3-spin-operators:b2',
    phase: 'lecture',
    text: `Write P_{+z} in the x basis with Unit 2.5’s rule P’ = UPU†. Every entry becomes ½: each is a product of two overlaps ⟨±x|+z⟩ = ${d(V.q3XZOverlap, 3)}. The table changed, yet squaring still gives it back: P² = P in every basis.`,
    formal:
      '(P̃_{+z})_{αβ} = ⟨α|+z⟩⟨+z|β⟩ for α, β ∈ {+x, −x} gives ½(1 1; 1 1) = ÛP̂_{+z}Û⁻¹ with Û = H (notes p. 13). P² = P is basis-free: (UPU†)² = UP²U†.',
    caption: `|+z⟩ in the x frame: ${d(V.q3XZOverlap, 3)} and ${d(V.q3XZOverlap, 3)}`,
    captionFormal: 'Rosetta: the notes’ “right/left states” here are |±x⟩ (see the errata box), not circular light',
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    claims: [
      claim('q3XZOverlap', '⟨+x|+z⟩ has size 0.707', () => close(V.q3XZOverlap, 0.7071, 1e-3)),
      claim('q3PzInX', 'P_{+z} in the x basis is ½(1 1; 1 1)', () => V.q3PzInX === 1),
      claim('q3Idem', 'P_{+z} in the x basis still squares to itself', () => V.q3Idem === 1),
      cPzInXHalf,
    ],
  },
  {
    id: 'q3-spin-operators:b3',
    phase: 'lecture',
    introduces: ['qc-spin-operator'],
    text: 'A spin reading along z is +ħ/2 or −ħ/2. Weight each projector by its reading and add: S_z = (ħ/2)P_{+z} − (ħ/2)P_{−z}. That is the [[qc-spin-operator|spin operator]] S_z = (ħ/2)[[1, 0], [0, −1]]. A z magnet that keeps every atom asks this operator, not a filter, what the beam’s spin is worth.',
    formal:
      'S_z = (ħ/2)P_{+z} + (−ħ/2)P_{−z} (notes p. 13): an observable is its values times their projectors <<qc-l4-matrices|spin matrices built from their outcomes>>.',
    caption: 'S_z = (ħ/2)P_{+z} − (ħ/2)P_{−z}',
    captionFormal: 'S_z = (ħ/2)(P_{+z} − P_{−z}): values times projectors',
    stage: lab([main('oven', [Z])], { readouts: ['fractions'], shot: 'L-PLATE' }),
    claims: [claim('q3SzBuild', 'S_z = (ħ/2)(P_{+z} − P_{−z})', () => V.q3SzBuild === 1)],
  },
  {
    id: 'q3-spin-operators:b4',
    phase: 'lecture',
    text: `Along x, the projectors of Unit 2.3’s |±x⟩ are P_{±x} = ½[[1, ±1], [±1, 1]], so S_x = (ħ/2)[[0, 1], [1, 0]]. For y, the notes ask for states that split 50/50 along both z and x. They are |±y⟩ = (|+z⟩ ± i|−z⟩)/√2, as in Unit 1.3.`,
    formal:
      'P_{±x} from eqs. 1.1–1.2 and S_x = (ħ/2)(P_{+x} − P_{−x}) (notes p. 13). |⟨±z|±y⟩|² = |⟨±x|±y⟩|² = ½ fixes |±y⟩ up to phase <<qc-l2-plus-y|real numbers cannot make +y>>; S_y = (ħ/2)(P_{+y} − P_{−y}).',
    caption: `|+y⟩: chance ${uf(V.q3Y5050)} along z and ${uf(V.q3Y5050)} along x`,
    captionFormal: `|⟨+z|+y⟩|² = |⟨+x|+y⟩|² = ${d(V.q3Y5050, 1)}`,
    stage: amp({ state: { dir: '+y' }, dials: true, labels: 'spin' }),
    claims: [
      claim('q3SxBuild', 'S_x = (ħ/2)(P_{+x} − P_{−x})', () => V.q3SxBuild === 1),
      claim('q3SyBuild', 'S_y = (ħ/2)(P_{+y} − P_{−y})', () => V.q3SyBuild === 1),
      claim('q3Y5050', '|+y⟩ splits ½ and ½ along both z and x', () => close(V.q3Y5050, 0.5)),
    ],
  },
  {
    id: 'q3-spin-operators:b5',
    phase: 'lecture',
    introduces: ['qc-pauli-matrices'],
    text: 'Take out ħ/2: S_i = (ħ/2)σ_i, where σ_x, σ_y, σ_z are the three [[qc-pauli-matrices|Pauli matrices]]. A magnet along n̂ measures S_n = (ħ/2)(|+n⟩⟨+n| − |−n⟩⟨−n|). Worked out, S_n = (ħ/2)σ_n with σ_n = n_xσ_x + n_yσ_y + n_zσ_z.',
    formal:
      'eq. 1.6: σ_x = (0 1; 1 0), σ_y = (0 −i; i 0), σ_z = (1 0; 0 −1) (notes p. 13); eq. 1.7: σ_n = (cos θ, sin θ e^{−iφ}; sin θ e^{iφ}, −cos θ) = n̂·σ⃗ (notes p. 14). Its readings are ±1: N&C’s ±1 is our ±ħ/2 (N&C ⚑, p. 90).',
    caption: 'the magnet along n̂: readings ±ħ/2 at the two dots',
    captionFormal: `σ_n’s corner entry: ${d(V.q3SigmaNTop, 3)} − ${d(V.q3SigmaNTop, 3)}i`,
    stage: bloch({ state: N_STATE, measure: N_STATE }),
    refs: [nc('Ex. 2.60, p. 90', 'N&C ⚑: the general σ_n and its ±1 eigenvalues, an exercise no sheet assigns.')],
    claims: [
      claim('q3SnIsSpinAlong', 'S_n = (ħ/2)(P_{+n} − P_{−n}) equals (ħ/2)n̂·σ⃗', () => V.q3SnIsSpinAlong === 1),
      claim('q3SigmaNTop', 'σ_n’s top-right entry has real part 0.612', () => close(V.q3SigmaNTop, 0.6124, 1e-3)),
      claim('q3SigmaNEig', 'σ_n’s eigenvalues are ±1', () => V.q3SigmaNEig === 1),
    ],
  },
  {
    id: 'q3-spin-operators:b6',
    phase: 'lecture',
    text: `For |+n⟩, the three averages together are ⟨S⟩ = (ħ/2)n̂: the sphere point IS the average spin, in units of ħ/2. Here ⟨S⟩ = (${d(V.q3AvgSx, 3)}, ${d(V.q3AvgSy, 3)}, ${d(V.q3AvgSz, 2)})ħ. Unit 3.4’s b3 links back here.`,
    formal:
      'α = cos(θ/2), β = e^{iφ}sin(θ/2) give ⟨S_z⟩ = (ħ/2)(|α|² − |β|²) = (ħ/2)cos θ and ⟨S_x⟩ + i⟨S_y⟩ = ħα*β = (ħ/2)sin θ e^{iφ}, so ⟨S⃗⟩ = (ħ/2)n̂ (D3; notes p. 14, eq. 1.8).',
    caption: `⟨S⟩ = (${d(V.q3AvgSx, 3)}, ${d(V.q3AvgSy, 3)}, ${d(V.q3AvgSz, 2)})ħ = (ħ/2)n̂`,
    stage: bloch({ state: N_STATE, readouts: ['averages'] }),
    derivation: {
      result: '\\langle\\vec S\\rangle = \\tfrac\\hbar2\\,\\hat n',
      ground: [
        {
          tex: 'c = \\cos\\tfrac\\theta2,\\quad s = \\sin\\tfrac\\theta2;\\quad |{+n}\\rangle = (c,\\ e^{i\\varphi}s)',
          why: 'The two amplitudes of |+n⟩ (Unit 3.2, D0).',
          view: amp({ state: { dir: N_STATE }, dials: true, labels: 'spin' }),
          viewCaption: '|+n⟩’s two dials: sizes c and s, relative phase φ.',
        },
        { tex: '\\sigma_z|{+n}\\rangle = (c,\\ -e^{i\\varphi}s)\\ \\Rightarrow\\ \\langle\\sigma_z\\rangle = c^2 - s^2', why: 'σ_z leaves the top entry and flips the sign of the bottom one; sandwich with (c, e^{iφ}s).' },
        { tex: 'c^2 - s^2 = \\cos\\theta', why: 'The double-angle rule for cosine.' },
        { tex: '\\sigma_x|{+n}\\rangle = (e^{i\\varphi}s,\\ c)\\ \\Rightarrow\\ \\langle\\sigma_x\\rangle = 2cs\\cos\\varphi', why: 'σ_x swaps the two entries; the sandwich picks out the real part of e^{iφ}, times 2cs.' },
        { tex: '\\sigma_y|{+n}\\rangle = (-ie^{i\\varphi}s,\\ ic)\\ \\Rightarrow\\ \\langle\\sigma_y\\rangle = 2cs\\sin\\varphi', why: 'σ_y swaps and adds a quarter turn; the sandwich picks out the imaginary part of e^{iφ}, times 2cs.' },
        {
          tex: '\\langle\\vec S\\rangle = \\tfrac\\hbar2\\,\\hat n',
          why: '2cs = sin θ, so (⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩) = n̂ exactly; multiply by ħ/2.',
          view: bloch({ state: N_STATE, readouts: ['averages'] }),
          viewCaption: 'The averages read off the sphere point itself.',
          claims: [cAvgSxSy, cAvgSz],
        },
      ],
      formal: [
        {
          tex: '\\langle\\sigma_z\\rangle = \\cos\\theta,\\quad \\langle\\sigma_x\\rangle + i\\langle\\sigma_y\\rangle = 2\\alpha^*\\beta = \\sin\\theta\\,e^{i\\varphi}',
          why: 'Direct sandwiches with eqs. 1.4 and 1.6.',
          view: amp({ state: { dir: N_STATE }, dials: true, labels: 'spin' }),
          viewCaption: 'α, β: the compact route’s inputs.',
        },
        {
          tex: '\\langle\\vec S\\rangle = \\tfrac\\hbar2\\,\\hat n',
          why: 'S⃗ = (ħ/2)σ⃗, and the sandwiches above equal n̂’s components.',
          view: bloch({ state: N_STATE, readouts: ['averages'] }),
          viewCaption: 'The result: the sphere point, in ħ/2.',
          claims: [claim('q3AvgSigma', '⟨σ_i⟩ agrees with n̂ componentwise', () => V.q3AvgSigma === 1)],
        },
      ],
    },
    claims: [cAvgSxSy, cAvgSz],
    refs: [bergou('eq. 2.20, p. 19', 'The Bloch vector as three averages, n_j = Tr(ρσ_j), the same fact from the density-matrix side.')],
  },
  {
    id: 'q3-spin-operators:b7',
    phase: 'clue',
    text: 'P_{+z} written in the x basis has the same four numbers as P_{+x} written in the z basis. Are P_{+z} and P_{+x} the same operator?',
    formal: '[P_{+z}]_x = [P_{+x}]_z as matrices. Does P_{+z} = P_{+x}?',
    stage: plane({ psi: '+z', others: [{ ket: '+x', role: 'second' }] }),
    reveal: {
      text: `No. P_{+z} keeps |+z⟩ whole, while P_{+x} shortens it to ${d(V.q3XZOverlap, 3)} of |+x⟩. The tables match only because H swaps the roles of the two bases.`,
      formal: `No: H P_{+z} H† = P_{+x} as matrices because H = H† maps z-coordinates to x-coordinates both ways; yet P_{+x}|+z⟩ has norm ${d(V.q3XZOverlap, 3)} while P_{+z}|+z⟩ = |+z⟩.`,
      caption: `P_{+x}|+z⟩: length ${d(V.q3XZOverlap, 3)}; P_{+z}|+z⟩: length 1`,
      stage: plane({ psi: '+z', basis: 'x', project: 1 }),
      claims: [
        claim('q3PzInXisPx', 'P_{+z} written in the x basis equals P_{+x}', () => V.q3PzInXisPx === 1),
        claim('q3NotSame', 'P_{+z} and P_{+x} are different operators', () => V.q3NotSame === 1),
        claim('q3XZOverlap', 'P_{+x}|+z⟩ has length 0.707', () => close(V.q3XZOverlap, 0.7071, 1e-3)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q3-observables — Measurement rules and why observables are Hermitian                            */
/* ---------------------------------------------------------------------------------------------- */

const observables: Beat[] = [
  {
    id: 'q3-observables:b1',
    phase: 'lecture',
    text: 'A measurement jumps the state into the state of the result it gives: |ψ⟩ → |α⟩. A [[qc-selective-measurement|selective measurement]] lets one result through and blocks the rest, like a magnet with one beam stopped. Behind the + filter, every atom is in |+z⟩.',
    formal:
      'Measurement projects |ψ⟩ onto one “measurement state” |α_i⟩, with P_i = |⟨α_i|ψ⟩|² for normalized kets; a selective measurement keeps one |α_i⟩ and rejects the rest (notes pp. 14–15) <<qc-l3-postulates|the Born rule and the state after a measurement>>.',
    caption: `oven → z (keep +) → z: all + at the plate; ${uf(V.q3SelectiveBlocked)} blocked`,
    stage: lab([main('oven', [Zp, Z])], { readouts: ['fractions', 'blocked'], shot: 'L-TRACK' }),
    claims: [
      claim('q3SelectivePlus', 'every kept atom lands in the + spot', () => close(V.q3SelectivePlus, 0.5)),
      claim('q3SelectiveBlocked', 'the first magnet blocks half the oven', () => close(V.q3SelectiveBlocked, 0.5)),
    ],
  },
  {
    id: 'q3-observables:b2',
    phase: 'lecture',
    introduces: ['qc-observable', 'qc-expectation'],
    text: `Give each result its value M_α, and build M = Σ_α M_α|α⟩⟨α|. The [[qc-expectation|expectation value]] is ⟨M⟩ = ⟨ψ|M|ψ⟩ = Σ_α M_αP_α: each value times its chance, added. For |+n⟩ along z: (ħ/2)(${d(V.q3Pz75, 2)}) − (ħ/2)(${d(V.q3Pz25, 2)}) = ${d(V.q3AvgSz, 2)}ħ.`,
    formal: `ℳ_α = M_α|α⟩⟨α| (M_α ∈ ℝ), ℳ = Σ_αℳ_α an [[qc-observable|observable]], ⟨M⟩ = ⟨ψ|ℳ|ψ⟩ = Σ_αM_αP_α (notes p. 15) <<qc-l4-average|the average that no atom reads>>. For |+n⟩: ⟨S_z⟩ = ${d(V.q3AvgSz, 2)}ħ = (ħ/2)cos θ.`,
    caption: `|+n⟩ along z: chances ${d(V.q3Pz75, 2)} and ${d(V.q3Pz25, 2)}, average ${d(V.q3AvgSz, 2)}ħ`,
    captionFormal: `⟨S_z⟩ = ${d(V.q3AvgSz, 2)}ħ`,
    stage: amp({ state: { dir: N_STATE }, mode: 'probability', labels: 'spin' }),
    claims: [
      claim('q3Pz75', 'P(+z) = 0.75 for |+n⟩', () => close(V.q3Pz75, 0.75)),
      claim('q3Pz25', 'P(−z) = 0.25 for |+n⟩', () => close(V.q3Pz25, 0.25)),
      cAvgSz,
      claim('q3AvgSzSum', '⟨S_z⟩ computed as value × chance, summed, agrees', () => close(V.q3AvgSzSum, V.q3AvgSz)),
    ],
  },
  {
    id: 'q3-observables:b3',
    phase: 'lecture',
    text: `Do the same along x and y. For |+n⟩ the three averages together are ⟨S⟩ = (ħ/2)n̂: the point on the sphere is the average spin, measured in units of ħ/2. Here ⟨S⟩ = (${d(V.q3AvgSx, 3)}, ${d(V.q3AvgSy, 3)}, ${d(V.q3AvgSz, 2)})ħ. The end of Unit 3.3 derives this from three sandwiches. <<qc-l5-averages|three averages from one column>>.`,
    formal:
      '⟨S_z⟩ = (ħ/2)(cos²(θ/2) − sin²(θ/2)) = (ħ/2)cos θ and ⟨S_x⟩ + i⟨S_y⟩ = ħα*β = (ħ/2)sin θ e^{iφ}, so ⟨S⃗⟩ = (ħ/2)n̂, derived at the end of Unit 3.3 (D3; notes p. 14, eq. 1.8). Bergou’s n_j = Tr(ρσ_j) (eq. 2.20, p. 19) is the same statement.',
    caption: `⟨S⟩ = (${d(V.q3AvgSx, 3)}, ${d(V.q3AvgSy, 3)}, ${d(V.q3AvgSz, 2)})ħ = (ħ/2)n̂`,
    stage: bloch({ state: N_STATE, readouts: ['averages'] }),
    claims: [cAvgSxSy, cAvgSz],
    refs: [bergou('eq. 2.20, p. 19', 'The Bloch vector as three averages, n_j = Tr(ρσ_j), the same fact from the density-matrix side.')],
  },
  {
    id: 'q3-observables:b4',
    phase: 'lecture',
    introduces: ['qc-adjoint'],
    text: 'Every operator A has a partner A†, its [[qc-adjoint|adjoint]]: the bra of A|α⟩ is ⟨α|A†. As a table, A† is A mirrored across its diagonal with every entry conjugated. Unit 2.4’s A turns arrows by +45°; its adjoint [[1, 1], [−1, 1]] turns them by −45°.',
    formal:
      '⟨β|A†|α⟩ = ⟨Aβ|α⟩ = ⟨α|Aβ⟩* = ⟨α|A|β⟩* defines A†, so (A†)_ij = A*_ji; (A†)† = A, (AB)† = B†A†, (cA)† = c*A† (notes p. 15; Axler p. 228 and p. 230).',
    caption: `A†ψ: turned back by 45°, stretched by ${d(V.q3AdagNorm, 3)}`,
    captionFormal: '(AB)† = B†A† ≠ A†B† here',
    stage: plane({ psi: { planeDeg: 30 }, image: { matrix: [['1', '1'], ['-1', '1']], label: '$A^\\dagger|\\psi\\rangle$' } }),
    fidelity: ['plane-image-not-state'],
    refs: [axler('7.1, p. 228; 7.5, p. 230', 'The adjoint’s definition and its three algebraic rules.')],
    claims: [
      claim('q3AdagCheck', 'A† = [[1, 1], [−1, 1]]', () => V.q3AdagCheck === 1),
      claim('q3AdagNorm', 'A†ψ has length 1.414', () => close(V.q3AdagNorm, 1.4142, 1e-3)),
      claim('q3AdjProdEq', '(AB)† = B†A†', () => V.q3AdjProdEq === 1),
      claim('q3AdjProdNeq', '(AB)† ≠ A†B† here', () => V.q3AdjProdNeq === 1),
      claim('q3AdjScale', '(cA)† = c*A†', () => V.q3AdjScale === 1),
    ],
  },
  {
    id: 'q3-observables:b5',
    phase: 'lecture',
    text: 'An operator is Hermitian when A† = A ([[qc-hermitian-matrix|Hermitian]], Unit 1.5). A measured value is a real number, so ⟨ψ|M|ψ⟩ must be real in every state. The notes show this forces M† = M: an observable’s operator is Hermitian.',
    formal:
      'If ⟨ψ|M|ψ⟩ ∈ ℝ for all ψ, then ⟨ψ|M|ψ⟩ = ⟨ψ|Mψ⟩* = ⟨Mψ|ψ⟩ = ⟨ψ|M†|ψ⟩, so ⟨ψ|(M − M†)|ψ⟩ = 0 for all ψ; over ℂ that forces M = M† (notes p. 16; Axler p. 234). This covers projective observables only (see the errata box; Q12 widens it).',
    caption: 'all three averages are real numbers',
    captionFormal: `a non-Hermitian (0 1; 0 0) gives ⟨+n|·|+n⟩ = ${d(V.q3NonHerm, 3)} + ${d(V.q3NonHerm, 3)}i`,
    stage: bloch({ state: N_STATE, readouts: ['averages'] }),
    refs: [axler('7.13–7.14, p. 234', 'The theorem: ⟨v, Tv⟩ ∈ ℝ for every complex v forces T Hermitian.')],
    claims: [
      claim('q3NonHerm', 'the non-Hermitian table gives 0.306 both real and imaginary', () => close(V.q3NonHerm, 0.306, 1e-3)),
      claim('q3NonHermIsHerm', 'that table is not Hermitian', () => V.q3NonHermIsHerm === 0),
    ],
  },
  {
    id: 'q3-observables:b6',
    phase: 'clue',
    text: 'The quarter turn J = [[0, −1], [1, 0]] gives ⟨v|Jv⟩ = 0, a real number, for every real arrow v. Yet J† ≠ J. Does J break the theorem?',
    formal: '⟨v|Jv⟩ = 0 for all real v, though J is anti-Hermitian. Is the theorem false?',
    stage: plane({ psi: { planeDeg: 30 }, image: { matrix: [['0', '-1'], ['1', '0']], label: '$J\\psi$' } }),
    reveal: {
      text: 'No. The theorem asks for every state, complex ones included. For |+y⟩, ⟨+y|J|+y⟩ = −i, which is not real. Real arrows alone cannot catch a non-Hermitian operator.',
      formal: 'No: over ℝ, ⟨v, Tv⟩ = 0 for all v allows T ≠ 0 (a rotation by π/2); over ℂ it forces T = 0 (Axler p. 234). Here ⟨+y|J|+y⟩ = −i.',
      caption: 'real arrows: 0; |+y⟩: −i',
      stage: amp({ state: { dir: '+y' }, dials: true, labels: 'spin' }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q3-spectral — Real eigenvalues, spectral form and spread                                        */
/* ---------------------------------------------------------------------------------------------- */

const M_OP = { matrix: [['1', '2-i'], ['2+i', '-3']] as [[string, string], [string, string]] }

const spectral: Beat[] = [
  {
    id: 'q3-spectral:b1',
    phase: 'lecture',
    introduces: ['qc-characteristic-equation'],
    text: `An [[qc-eigenvector|eigenvector]] of A is an arrow A only stretches: A|a⟩ = a|a⟩, and the stretch a is its [[qc-eigenvalue|eigenvalue]]. The eigenvalues solve the [[qc-characteristic-equation|characteristic equation]] det(A − aI) = 0, where a 2×2 table’s det is (top-left × bottom-right) − (top-right × bottom-left). The picture draws M = [[1, 2 − i], [2 + i, −3]] as an arrow ${d(V.q3MGaugeLen, 0)} long, half its eigenvalue gap. Its gauge sits at their midpoint, ${d(V.q3MGaugeA0, 0)}. <<qc-l3-eigen|Spin Lab 3.2>> finds the directions an operator only stretches; <<qc-f4-eigen|F4>> builds the full theory from here.`,
    formal:
      'A|α_i⟩ = a_i|α_i⟩, i.e. Σ_j A_kj c_j^{(i)} = a_i c_k^{(i)}; the a_i solve det(Â − a1) = 0 (notes p. 17; Axler p. 134). An eigenvalue with two LI eigenvectors is [[qc-degenerate|degenerate]].',
    caption: `M = [[1, 2 − i], [2 + i, −3]]: a² + ${d(V.q3MPolyB, 0)}a − ${d(-V.q3MPolyC, 0)} = 0, so a = ${d(V.q3MValHigh, 0)} or ${d(V.q3MValLow, 0)}`,
    captionFormal: `the arrow: half the gap, ${d(V.q3MGaugeLen, 0)}; the gauge: the midpoint, ${d(V.q3MGaugeA0, 0)}`,
    stage: ops({ op: M_OP, eigen: true, labels: 'plain' }),
    refs: [axler('5.5, p. 134', 'The eigenvalue equation Aα = aα (the characteristic-polynomial route here is the notes’, not this page’s).')],
    claims: [
      claim('q3MPolyB', 'the characteristic equation is a² + 2a − 8 = 0', () => close(V.q3MPolyB, 2)),
      claim('q3MPolyC', 'its constant term is −8', () => close(V.q3MPolyC, -8)),
      claim('q3MGaugeLen', 'the arrow is 3 long', () => close(V.q3MGaugeLen, 3)),
      claim('q3MGaugeA0', 'the gauge sits at −1', () => close(V.q3MGaugeA0, -1)),
      claim('q3MValLow', "M's low eigenvalue is −4", () => close(V.q3MValLow, -4)),
      claim('q3MValHigh', "M's high eigenvalue is 2", () => close(V.q3MValHigh, 2)),
    ],
  },
  {
    id: 'q3-spectral:b2',
    phase: 'lecture',
    text: 'For a Hermitian A every eigenvalue is real. Sandwich A between ⟨a| and |a⟩ in two ways. Letting A act on the ket gives a⟨a|a⟩; letting it act on the bra gives a*⟨a|a⟩. Since ⟨a|a⟩ is not zero, a = a*.',
    formal:
      'a₁⟨a₁|a₁⟩ = a₁*⟨a₁|a₁⟩ follows from A = A† (D2), and ⟨a₁|a₁⟩ > 0, so a₁ = a₁* ∈ ℝ (notes p. 17; Axler p. 233; N&C ⚑, p. 70, one direction; no open sheet assigns it). The quarter turn J, not Hermitian, has eigenvalues ±i.',
    caption: `M’s eigenvalues ${d(V.q3MValHigh, 0)} and ${d(V.q3MValLow, 0)}: real`,
    captionFormal: 'J = (0 −1; 1 0): eigenvalues ±i',
    stage: ops({ op: M_OP, eigen: true, labels: 'plain' }),
    derivation: {
      result: 'a_1 = a_1^*',
      ground: [
        {
          tex: 'A|a_1\\rangle = a_1|a_1\\rangle,\\quad A^\\dagger = A',
          why: 'An eigenvector of a Hermitian operator.',
          view: ops({ op: M_OP, eigen: true, labels: 'plain' }),
          viewCaption: 'M, Hermitian: its arrow (eigenvalue gap) and gauge.',
        },
        { tex: '\\langle a_1|A|a_1\\rangle = a_1\\langle a_1|a_1\\rangle', why: 'Let A act on the ket; the number a₁ comes out of the ket side unchanged.' },
        { tex: '\\langle a_1|A|a_1\\rangle = \\langle a_1|A^\\dagger|a_1\\rangle', why: 'A and A† are the same operator.' },
        { tex: '\\langle a_1|A^\\dagger|a_1\\rangle = \\langle A a_1|a_1\\rangle', why: 'That is what the adjoint means: A† on the right is A inside the bra (Unit 3.4).' },
        { tex: '\\langle A a_1|a_1\\rangle = \\langle a_1|A a_1\\rangle^*', why: 'Swapping the two sides conjugates (Unit 1.5).' },
        { tex: '\\langle a_1|A a_1\\rangle^* = a_1^*\\langle a_1|a_1\\rangle', why: 'Take a₁ out, then conjugate; ⟨a₁|a₁⟩ is real, so it is unchanged.' },
        { tex: 'a_1\\langle a_1|a_1\\rangle = a_1^*\\langle a_1|a_1\\rangle', why: 'Steps 2 to 6 are one chain of equal numbers.' },
        {
          tex: 'a_1 = a_1^*',
          why: '⟨a₁|a₁⟩ is a squared length, not zero for an eigenvector, so we may divide by it.',
          view: ops({ op: { named: 'Sz' }, eigen: true, labels: 'plain' }),
          viewCaption: 'Another Hermitian example, S_z: real eigenvalues too.',
        },
      ],
      formal: [
        {
          tex: 'a_1\\langle a_1|a_1\\rangle = \\langle a_1|A^\\dagger|a_1\\rangle = \\langle A a_1|a_1\\rangle = a_1^*\\langle a_1|a_1\\rangle',
          why: 'A = A†, the definition of A†, conjugate symmetry.',
          view: ops({ op: M_OP, eigen: true, labels: 'plain' }),
          viewCaption: 'M, Hermitian.',
        },
        {
          tex: 'a_1 = a_1^*',
          why: '⟨a₁|a₁⟩ > 0.',
          view: ops({ op: { named: 'Sz' }, eigen: true, labels: 'plain' }),
          viewCaption: 'S_z: another Hermitian example.',
        },
      ],
    },
    refs: [axler('7.12, p. 233', 'A Hermitian (self-adjoint) operator has only real eigenvalues.')],
    claims: [
      claim('q3MValLow', "M's low eigenvalue is −4, real", () => close(V.q3MValLow, -4)),
      claim('q3MValHigh', "M's high eigenvalue is 2, real", () => close(V.q3MValHigh, 2)),
      claim('q3JEig', 'J’s eigenvalues are ±i', () => V.q3JEig === 1),
    ],
  },
  {
    id: 'q3-spectral:b3',
    phase: 'lecture',
    text: 'Eigenvectors with different eigenvalues are at right angles. So, rescaled, a Hermitian operator’s eigenvectors form an orthonormal basis. M’s two eigenvectors have overlap 0, and so do |+n⟩ and |−n⟩ for S_n.',
    formal:
      '(a₂ − a₁)⟨a₂|a₁⟩ = 0 uses ⟨a₂|A = a₂⟨a₂|, with a₂ real by D2 (see the errata box); in a degenerate eigenspace, Gram–Schmidt (Unit 2.2) makes the eigenvectors ON. Hence an ON eigenbasis (notes p. 17; Axler p. 238, p. 246).',
    caption: `⟨eigenvector 1|eigenvector 2⟩ = ${d(V.q3MOrth, 0)}`,
    stage: ops({ op: M_OP, eigen: true, labels: 'plain' }),
    refs: [axler('7.22, p. 238', 'Eigenvectors of distinct eigenvalues of a self-adjoint operator are orthogonal (7.31, p. 246 then gives the ON eigenbasis).')],
    claims: [claim('q3MOrth', 'M’s two eigenvectors are orthogonal', () => close(V.q3MOrth, 0)), cNOrth],
  },
  {
    id: 'q3-spectral:b4',
    phase: 'lecture',
    introduces: ['qc-spectral-representation'],
    text: `In its own eigenbasis a Hermitian operator’s table is diagonal, with its eigenvalues down the diagonal. So A = Σ_i a_i|a_i⟩⟨a_i|, its [[qc-spectral-representation|spectral representation]], and any function acts on the eigenvalues: f(A) = Σ_i f(a_i)|a_i⟩⟨a_i|. Squaring S_z gives (ħ²/4)I, entry ${d(V.q3F, 2)}. <<qc-l5-operators|operators change coordinates too>> diagonalizes with B.`,
    formal:
      'A = Σ_ia_i|α_i⟩⟨α_i| and f(A) = Σ_if(a_i)|α_i⟩⟨α_i| (notes p. 17; N&C, p. 72). With Unit 2.5’s U (new basis = eigenbasis) the diagonal table is UAU†; the notes write Û†ÂÛ, which needs Û’s columns to be the eigenvectors (see the errata box).',
    caption: 'S_z: diagonal in its own basis, readings ±ħ/2',
    captionFormal: 'y basis: Uσ_yU† = diag(1, −1), U†σ_yU = σ_x',
    stage: ops({ op: { named: 'Sz' }, eigen: true }),
    refs: [nc('Box 2.2, p. 72', 'The spectral theorem and functions of a Hermitian operator, boxed the same way.')],
    claims: [
      claim('q3F', 'S_z² = (ħ²/4)I: its top-left entry is 0.25', () => close(V.q3F, 0.25)),
      claim('q3DiagUAUdIsDiag', 'ÛÂÛ† is diagonal', () => V.q3DiagUAUdIsDiag === 1),
      claim('q3DiagUdAUIsDiag', 'Û†ÂÛ, with p. 9’s Û, is not', () => V.q3DiagUdAUIsDiag === 0),
    ],
  },
  {
    id: 'q3-spectral:b5',
    phase: 'lecture',
    introduces: ['qc-dispersion'],
    text: `Powers work the same way: ⟨Aⁿ⟩ = Σ_ip_ia_iⁿ. The [[qc-dispersion|dispersion]] (ΔA)² = ⟨A²⟩ − ⟨A⟩² measures how widely readings scatter. For |+n⟩ along z: ⟨S_z²⟩ = ${d(V.q3Moment2, 2)}ħ² and ⟨S_z⟩² = ${d(V.q3AvgSz * V.q3AvgSz, 4)}ħ², so (ΔS_z)² = ${d(V.q3VarSz, 4)}ħ².`,
    formal: `⟨ψ|Aⁿ|ψ⟩ = Σ_i|⟨α_i|ψ⟩|²a_iⁿ (notes p. 18). With S_i² = (ħ²/4)I, (ΔS_i)² = (ħ²/4)(1 − n_i²) for |+n⟩ (D4): here (${d(V.q3VarXY, 3)}, ${d(V.q3VarXY, 3)}, ${d(V.q3VarSz, 4)})ħ² <<qc-l7-spreads|spreads you can read off the sphere>>.`,
    caption: `ΔS_z = ${d(V.q3SpreadZ, 3)}ħ for |+n⟩`,
    captionFormal: `(ΔS_x, ΔS_y, ΔS_z) = (${d(V.q3SpreadXY, 3)}, ${d(V.q3SpreadXY, 3)}, ${d(V.q3SpreadZ, 3)})ħ`,
    stage: bloch({ state: N_STATE, dropLines: ['x', 'y', 'z'], readouts: ['averages', 'spreads'] }),
    fidelity: ['bloch-spread-distance'],
    derivation: {
      result: '(\\Delta S_i)^2 = \\tfrac{\\hbar^2}4\\,(1 - n_i^2)',
      ground: [
        {
          tex: '(\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2',
          why: 'The dispersion: the average square minus the squared average.',
          view: ops({ op: { named: 'Sz' }, eigen: true }),
          viewCaption: 'S_z² = (ħ²/4)I: a gauge only, no arrow.',
        },
        { tex: 'S_i^2 = \\tfrac{\\hbar^2}4\\,I', why: 'Both readings of S_i square to ħ²/4, so the squared table is ħ²/4 times I.' },
        { tex: '\\langle S_i^2\\rangle = \\tfrac{\\hbar^2}4', why: 'In a state of length 1, the average of I is 1.' },
        { tex: '\\langle S_i\\rangle = \\tfrac\\hbar2\\,n_i', why: 'From D3.' },
        { tex: '(\\Delta S_i)^2 = \\tfrac{\\hbar^2}4 - \\tfrac{\\hbar^2}4\\,n_i^2', why: 'Put steps 3 and 4 into step 1.' },
        {
          tex: '(\\Delta S_i)^2 = \\tfrac{\\hbar^2}4\\,(1 - n_i^2)',
          why: 'Take out the common factor.',
          view: bloch({ state: N_STATE, dropLines: ['x', 'y', 'z'], readouts: ['averages', 'spreads'] }),
          viewCaption: 'The spreads, read straight off the sphere.',
          claims: [cVarSz, cVarXY],
        },
      ],
      formal: [
        {
          tex: '\\sigma_i^2 = I \\Rightarrow \\langle S_i^2\\rangle = \\tfrac{\\hbar^2}4',
          why: 'eq. 1.9 with i = j.',
          view: ops({ op: { named: 'Sz' }, eigen: true }),
          viewCaption: 'S_z² = (ħ²/4)I.',
        },
        {
          tex: '(\\Delta S_i)^2 = \\tfrac{\\hbar^2}4\\,(1 - n_i^2)',
          why: 'With D3.',
          view: bloch({ state: N_STATE, dropLines: ['x', 'y', 'z'], readouts: ['averages', 'spreads'] }),
          viewCaption: 'The spreads on the sphere.',
          claims: [cVarSz, cVarXY],
        },
      ],
    },
    claims: [
      claim('q3Moment1', '⟨S_z⟩ = 0.25ħ (first moment)', () => close(V.q3Moment1, 0.25)),
      claim('q3Moment2', '⟨S_z²⟩ = 0.25ħ²', () => close(V.q3Moment2, 0.25)),
      cVarSz,
      cSpreadZ,
      cVarXY,
      cSpreadXY,
      cAvgSzSq,
    ],
  },
  {
    id: 'q3-spectral:b6',
    phase: 'clue',
    text: 'Which states give S_n, the spin along n̂, no spread at all?',
    formal: 'For which ψ is (ΔS_n)² = 0?',
    stage: bloch({ state: N_STATE }),
    reveal: {
      text: 'Its eigenvectors, |+n⟩ and |−n⟩. In |+n⟩ every reading is +ħ/2, so the average is ħ/2 and nothing scatters: (ΔS_n)² = ħ²/4 − ħ²/4 = 0.',
      formal: '(ΔA)² = ‖(A − ⟨A⟩)ψ‖² vanishes iff Aψ = ⟨A⟩ψ: exactly the eigenvectors of A. For |+n⟩, ⟨S_n⟩ = ħ/2 and (ΔS_n)² = 0.',
      caption: `|+n⟩: ⟨S_n⟩ = ${d(V.q3EigZeroAvg, 1)}ħ, (ΔS_n)² = ${d(V.q3EigZeroVar, 0)}`,
      stage: bloch({ state: N_STATE, measure: N_STATE }),
      claims: [claim('q3EigZeroAvg', '⟨S_n⟩ = 0.5ħ for |+n⟩', () => close(V.q3EigZeroAvg, 0.5)), claim('q3EigZeroVar', '(ΔS_n)² = 0 for |+n⟩', () => close(V.q3EigZeroVar, 0))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q3-uncertainty — Commutators and the floor under two spreads                                    */
/* ---------------------------------------------------------------------------------------------- */

const uncertainty: Beat[] = [
  {
    id: 'q3-uncertainty:b1',
    phase: 'lecture',
    introduces: ['qc-commutator', 'qc-anticommutator', 'qc-levi-civita'],
    text: 'The [[qc-commutator|commutator]] [A, B] = AB − BA measures how much the order matters. For spin, [S_x, S_y] = iħS_z, and likewise round the cycle x → y → z → x. The [[qc-anticommutator|anticommutator]] {A, B} = AB + BA is zero for two different spin components. <<qc-l7-compatible|compatible measurements share a basis and commute>>.',
    formal:
      '[A,B] = −[B,A], [A, B + C] = [A,B] + [A,C], a product rule over each factor, and the Jacobi identity (notes p. 18). eq. 1.9: [S_i, S_j] = iħ[[qc-levi-civita|ε_ijk]]S_k, {S_i, S_j} = (ħ²/2)δ_ijI; S² = ΣS_i² = (3ħ²/4)I commutes with every S_i.',
    caption: 'S_x and S_y: arrows at right angles, so the order matters',
    captionFormal: `[S_x, S_y] = iħS_z; S² = ${d(V.q3S2Val, 2)}ħ² I`,
    stage: ops({ op: { named: 'Sx' }, add: { named: 'Sy' } }),
    fidelity: ['op-commutator-arrow'],
    claims: [
      claim('q3CommXY', '[S_x, S_y] = iħS_z', () => V.q3CommXY === 1),
      claim('q3AntiXY', '{S_x, S_y} = 0', () => V.q3AntiXY === 1),
      claim('q3AntiXX', '{S_x, S_x} = 0.5ħ²I', () => V.q3AntiXX === 1),
      claim('q3S2Val', 'S² = 0.75ħ² I', () => close(V.q3S2Val, 0.75)),
      claim('q3S2Check', 'S² is exactly 0.75ħ² I', () => V.q3S2Check === 1),
      claim('q3S2Comm', 'S² commutes with S_z', () => V.q3S2Comm === 1),
      claim('q3Jacobi', 'the Jacobi identity holds for S_x, S_y, S_z', () => V.q3Jacobi === 1),
    ],
  },
  {
    id: 'q3-uncertainty:b2',
    phase: 'lecture',
    introduces: ['qc-simultaneous-eigenvector'],
    text: 'Two observables are [[qc-compatible|compatible]] when their operators commute. Then, if A’s eigenvalues are all different, each eigenvector of A is an eigenvector of B too: a [[qc-simultaneous-eigenvector|simultaneous eigenvector]]. Measuring A and then B keeps both values sharp. <<qc-l7-order|swapping the order of two measurements>>.',
    formal:
      '0 = ⟨a_i|[A,B]|a_j⟩ = (a_i − a_j)⟨a_i|B|a_j⟩, so B is diagonal in A’s eigenbasis (notes pp. 18–19); if AB ≠ BA, no complete set |a, b⟩ exists, since diagonal tables commute (p. 19; Axler p. 176; N&C, p. 77). If A is degenerate, this picks out one eigenbasis inside that eigenspace, not every one (notes p. 19).',
    caption: 'S_x and P_{+x}: parallel arrows, so they commute',
    captionFormal: '[S_x, P_{+x}] = 0; in x: P_{+x} = diag(1, 0)',
    stage: ops({ op: { named: 'Sx' }, add: { matrix: [['1/2', '1/2'], ['1/2', '1/2']] } }),
    fidelity: ['op-parallel-commute'],
    refs: [
      axler('5.76, p. 176', 'Two diagonalizable operators are simultaneously diagonalizable iff they commute (here, self-adjoint, so the shared basis is orthonormal).'),
      nc('Thm 2.2, p. 77', 'The same simultaneous-diagonalization theorem.'),
    ],
    claims: [claim('q3CompatPx', '[S_x, P_{+x}] = 0', () => V.q3CompatPx === 1), claim('q3CompatPxDiag', 'in the x basis, P_{+x} is diag(1, 0)', () => V.q3CompatPxDiag === 1)],
  },
  {
    id: 'q3-uncertainty:b3',
    phase: 'lecture',
    text: `Shift an observable by its average: ΔA = A − ⟨A⟩I. Then the dispersion is the squared length of ΔA|ψ⟩. The [[qc-schwarz-inequality|Schwarz inequality]] says an overlap is never bigger than the lengths allow: |⟨a|b⟩|² ≤ ⟨a|a⟩⟨b|b⟩. For (1, i) and (2, 1): ${d(V.q3SchwarzLHS, 0)} ≤ ${d(V.q3SchwarzRHS, 0)}.`,
    formal:
      'ΔA = A − ⟨ψ|A|ψ⟩1 gives ⟨(ΔA)²⟩ = ‖ΔA|ψ⟩‖² = ⟨A²⟩ − ⟨A⟩² (notes p. 19). Schwarz: ⟨a|a⟩⟨b|b⟩ ≥ |⟨a|b⟩|², from ‖|a⟩ + λ|b⟩‖² ≥ 0 at λ = −⟨b|a⟩/⟨b|b⟩ (notes p. 19; Axler p. 189).',
    caption: '|+n⟩: ΔS_x and ΔS_y drawn as distances to the axes',
    captionFormal: `|⟨a|b⟩|² = ${d(V.q3SchwarzLHS, 0)} ≤ ${d(V.q3SchwarzRHS, 0)}; at the best λ, ‖a + λb‖² = ${d(V.q3SchwarzBestNorm, 0)}`,
    stage: bloch({ state: N_STATE, dropLines: ['x', 'y'], readouts: ['spreads'] }),
    refs: [axler('6.14, p. 189', 'The Cauchy–Schwarz inequality and its proof by completing a square.')],
    claims: [
      claim('q3SchwarzLHS', '|⟨a|b⟩|² = 5 for a = (1, i), b = (2, 1)', () => close(V.q3SchwarzLHS, 5)),
      claim('q3SchwarzRHS', '⟨a|a⟩⟨b|b⟩ = 10', () => close(V.q3SchwarzRHS, 10)),
      claim('q3SchwarzBestNorm', 'the best-λ norm is 1', () => close(V.q3SchwarzBestNorm, 1)),
      cVarXY,
    ],
  },
  {
    id: 'q3-uncertainty:b4',
    phase: 'lecture',
    text: 'Put |a⟩ = ΔA|ψ⟩ and |b⟩ = ΔB|ψ⟩ into Schwarz. Then split ΔAΔB into half its commutator plus half its anticommutator. The commutator half alone gives the [[qc-uncertainty-relation|uncertainty relation]]: (ΔA)²(ΔB)² ≥ ¼|⟨[A, B]⟩|².',
    formal: `eq. 1.10: ⟨(ΔA)²⟩⟨(ΔB)²⟩ ≥ ¼|⟨[A,B]⟩|² for every ψ (notes p. 19; D5). For |+n⟩, S_x, S_y: ${d(V.q3RobProdSq, 4)}ħ⁴ ≥ ${d(V.q3RobBoundSq, 4)}ħ⁴; the anticommutator term dropped in D5 is ${d(V.q3Cov2, 4)}ħ⁴ <<qc-l7-uncertainty|a floor under the product of spreads>>.`,
    caption: `ΔS_x·ΔS_y = ${d(V.q3RobProduct, 3)}ħ², above the floor (ħ/2)|⟨S_z⟩| = ${d(V.q3RobBound, 3)}ħ²`,
    captionFormal: `⟨[S_x, S_y]⟩ = ${d(V.q3CommExpIm, 2)}iħ²: purely imaginary`,
    stage: bloch({ state: N_STATE, dropLines: ['x', 'y'], readouts: ['spreads', 'bound'] }),
    derivation: {
      result: '\\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge \\tfrac14|\\langle[A,B]\\rangle|^2',
      ground: [
        {
          tex: '|a\\rangle = \\Delta A|\\psi\\rangle,\\quad |b\\rangle = \\Delta B|\\psi\\rangle',
          why: 'Two vectors built from the shifted operators of the previous beat.',
          view: ops({ op: { named: 'Sx' }, add: { named: 'Sy' } }),
          viewCaption: 'S_x and S_y: the two operators being shifted.',
        },
        { tex: '\\langle a|a\\rangle = \\langle(\\Delta A)^2\\rangle,\\quad \\langle b|b\\rangle = \\langle(\\Delta B)^2\\rangle', why: 'ΔA is Hermitian, so the bra of |a⟩ is ⟨ψ|ΔA, and its squared length is the dispersion.' },
        { tex: '\\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge |\\langle\\Delta A\\,\\Delta B\\rangle|^2', why: 'The Schwarz inequality, with ⟨a|b⟩ = ⟨ψ|ΔAΔB|ψ⟩.' },
        { tex: '\\Delta A\\,\\Delta B = \\tfrac12[\\Delta A, \\Delta B] + \\tfrac12\\{\\Delta A, \\Delta B\\}', why: 'Any product is half its commutator plus half its anticommutator.' },
        { tex: '[\\Delta A, \\Delta B] = [A, B]', why: 'The shifts are multiples of I, and I commutes with everything.' },
        { tex: '\\langle[A,B]\\rangle\\ \\text{imaginary},\\quad \\langle\\{\\Delta A, \\Delta B\\}\\rangle\\ \\text{real}', why: 'For Hermitian A and B, the commutator is anti-Hermitian and the anticommutator Hermitian.' },
        { tex: '|\\langle\\Delta A\\,\\Delta B\\rangle|^2 = \\tfrac14|\\langle[A,B]\\rangle|^2 + \\tfrac14\\langle\\Delta A\\,\\Delta B + \\Delta B\\,\\Delta A\\rangle^2', why: 'A size squared is the real part squared plus the imaginary part squared.' },
        { tex: '|\\langle\\Delta A\\,\\Delta B\\rangle|^2 \\ge \\tfrac14|\\langle[A,B]\\rangle|^2', why: 'Dropping a square, never negative, can only make the right side smaller.' },
        {
          tex: '\\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge \\tfrac14|\\langle[A,B]\\rangle|^2',
          why: 'Chain steps 3 and 8.',
          view: bloch({ state: N_STATE, dropLines: ['x', 'y'], readouts: ['spreads', 'bound'] }),
          viewCaption: 'The product of spreads against the floor, on the sphere.',
          claims: [claim('q3RobProdSq', 'the squared product 0.0244 ≥ the squared bound 0.0156', () => close(V.q3RobProdSq, 0.024414, 1e-4))],
        },
      ],
      formal: [
        {
          tex: '\\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge |\\langle\\Delta A\\,\\Delta B\\rangle|^2',
          why: 'Schwarz with |a⟩ = ΔA|ψ⟩, |b⟩ = ΔB|ψ⟩.',
          view: ops({ op: { named: 'Sx' }, add: { named: 'Sy' } }),
          viewCaption: 'S_x, S_y.',
        },
        { tex: '\\langle\\Delta A\\,\\Delta B\\rangle = \\tfrac12\\langle[A,B]\\rangle + \\tfrac12\\langle\\{\\Delta A,\\Delta B\\}\\rangle', why: 'Its first term is imaginary and its second real.' },
        {
          tex: '\\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge \\tfrac14|\\langle[A,B]\\rangle|^2',
          why: 'Keep only the imaginary part.',
          view: bloch({ state: N_STATE, dropLines: ['x', 'y'], readouts: ['spreads', 'bound'] }),
          viewCaption: 'The bound, on the sphere.',
          claims: [claim('q3RobBoundSq', 'the squared bound is 0.0156', () => close(V.q3RobBoundSq, 0.015625, 1e-4))],
        },
      ],
    },
    claims: [
      claim('q3RobProduct', 'ΔS_x·ΔS_y = 0.156ħ² for |+n⟩', () => close(V.q3RobProduct, 0.15625, 1e-3)),
      claim('q3RobBound', 'the floor (ħ/2)|⟨S_z⟩| = 0.125ħ²', () => close(V.q3RobBound, 0.125, 1e-3)),
      claim('q3CommExpIm', '⟨[S_x, S_y]⟩ = 0.25iħ²', () => close(V.q3CommExpIm, 0.25, 1e-3)),
      claim('q3Cov2', 'the dropped anticommutator term is 0.0088ħ⁴', () => close(V.q3Cov2, 0.008789, 1e-4)),
      claim('q3RobProdSq', 'the squared product is 0.0244ħ⁴', () => close(V.q3RobProdSq, 0.024414, 1e-4)),
      claim('q3RobBoundSq', 'the squared bound is 0.0156ħ⁴', () => close(V.q3RobBoundSq, 0.015625, 1e-4)),
      cHalf,
      cQuarter,
    ],
  },
  {
    id: 'q3-uncertainty:b5',
    phase: 'lecture',
    text: 'For |+x⟩, S_x is sharp, so the left side is 0; and ⟨S_z⟩ = 0 makes the right side 0 as well. For |+z⟩, (ΔS_x)² = (ΔS_y)² = ħ²/4, and both sides equal ħ⁴/16: this state sits exactly on the floor.',
    formal:
      '|+x⟩: (ΔS_x)² = 0, (ΔS_y)² = ħ²/4, ¼|iħ⟨S_z⟩|² = 0. |+z⟩: ¼(ħ/2)²ħ² = ħ⁴/16 = (ΔS_x)²(ΔS_y)², equality (notes pp. 19–20; ⟨S_x⟩ and ΔS_x for |+z⟩ are N&C ⚑, p. 90).',
    caption: `|+z⟩: ΔS_x·ΔS_y = ${d(V.q3RobZProduct, 2)}ħ² = (ħ/2)|⟨S_z⟩|`,
    captionFormal: `|+z⟩: ${d(V.q3RobZSq, 4)}ħ⁴ = ${d(V.q3RobZSq, 4)}ħ⁴`,
    stage: bloch({ state: '+z', readouts: ['spreads', 'bound'] }),
    refs: [nc('Ex. 2.59, p. 90', 'N&C ⚑: ⟨S_x⟩ and ΔS_x for |+z⟩, worked as an exercise no open sheet assigns.')],
    claims: [
      claim('q3RobZProduct', '|+z⟩: ΔS_x·ΔS_y = 0.25ħ²', () => close(V.q3RobZProduct, 0.25)),
      claim('q3RobZSq', '|+z⟩: both sides equal 0.0625ħ⁴', () => close(V.q3RobZSq, 0.0625)),
      claim('q3RobXVarY', '|+x⟩: (ΔS_y)² = 0.25ħ²', () => close(V.q3RobXVarY, 0.25)),
      cHalf,
      cQuarter,
    ],
  },
  {
    id: 'q3-uncertainty:b6',
    phase: 'books',
    text: `Nielsen and Chuang warn against a common misreading. The relation is not about one measurement disturbing another. Prepare many copies of |+z⟩; measure x on some and z on others. The x readings scatter ${uf(V.q3EnsXPlus)} and ${uf(V.q3EnsXPlus)}, and the z readings never do.`,
    formal:
      'N&C, p. 89, reaches ΔCΔD ≥ |⟨[C,D]⟩|/2 by splitting ⟨ψ|AB|ψ⟩ into real and imaginary parts and applying Cauchy–Schwarz. Its content is the statistics of separate, identically prepared ensembles, not the effect of one measurement on another.',
    caption: `copies of |+z⟩: x gives ${uf(V.q3EnsXPlus)} and ${uf(V.q3EnsXPlus)}; z gives all +`,
    stage: lab([{ id: 'A', source: '+z', devices: [X] }, { id: 'B', source: '+z', devices: [Z] }], { readouts: ['fractions'], shot: 'L-3Q' }),
    fidelity: ['lab-prepared-offstage'],
    refs: [nc('Box 2.4, p. 89', 'The same uncertainty bound, reached by splitting a sandwich into real and imaginary parts.')],
    claims: [
      claim('q3EnsXPlus', 'copies of |+z⟩ into an x magnet: ½ each way', () => close(V.q3EnsXPlus, 0.5)),
      claim('q3EnsZPlus', 'copies of |+z⟩ into a z magnet: all +', () => close(V.q3EnsZPlus, 1)),
    ],
  },
  {
    id: 'q3-uncertainty:b7',
    phase: 'clue',
    text: 'For |+x⟩ both sides of the uncertainty relation are 0. Does that make S_x and S_y compatible?',
    formal: 'In |+x⟩, (ΔS_x)²(ΔS_y)² = 0 = ¼|⟨[S_x, S_y]⟩|². Are S_x and S_y compatible?',
    stage: bloch({ state: '+x', readouts: ['spreads'] }),
    claims: [cQuarter],
    reveal: {
      text: 'No. Compatibility belongs to the operators, and [S_x, S_y] = iħS_z is never zero. The floor depends on the state: it vanishes for |+x⟩ only because ⟨S_z⟩ = 0 there.',
      formal: 'No: compatibility means [A,B] = 0 as operators. The bound ¼|⟨[A,B]⟩|² is state-dependent and vanishes whenever ⟨S_z⟩ = 0, as the notes remark.',
      caption: `|+x⟩: ΔS_x·ΔS_y = ${d(V.q3RobXProduct, 0)} and (ħ/2)|⟨S_z⟩| = ${d(V.q3RobXBound, 0)}`,
      stage: bloch({ state: '+x', readouts: ['spreads', 'bound'] }),
      claims: [
        claim('q3RobXProduct', '|+x⟩: ΔS_x·ΔS_y = 0', () => close(V.q3RobXProduct, 0)),
        claim('q3CommXY', '[S_x, S_y] is never the zero operator', () => V.q3CommXY === 1),
        cHalf,
        cQuarter,
      ],
    },
  },
]

export const Q3_STORY: Record<string, Beat[]> = {
  'q3-born': born,
  'q3-bloch': blochUnit,
  'q3-spin-operators': spinOperators,
  'q3-observables': observables,
  'q3-spectral': spectral,
  'q3-uncertainty': uncertainty,
}
