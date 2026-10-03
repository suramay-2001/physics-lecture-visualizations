/**
 * Chapter Q4 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q4-story.md §1, in both tracks,
 * with the judge's rulings (docs/roles/decisions/qc709-Q4Q5.md):
 *   - Q4-1: `'lecture'` for the [L] beats, each citing Bergou or N&C, now joined by revised notes Lecture 5
 *     (pp. 21-26) where it teaches the same ground (re-map docs/roles/proposals/P-709-remap-L1L7.md §1.2);
 *   - Q4-2: engine defect E1 (a one-qubit runCircuit corrupting the shared KET constants) is already fixed on main;
 *   - Q4-3: Q4 owns `qc-tensor-product` and `qc-xor` for good (the re-map folds old F6/F7's scope elsewhere); Q4
 *     also owns the minimal "⊗ on operators" notation beat (qc709-Q6Q7.md ruling 2), since U⊗I appears here before
 *     Chapter Q6 exists;
 *   - Q4-4: Bergou's ⚑ P1.1, P1.4(a)/(b) are worked in full (no sheet assigns them, homework-status.md); HW2 P3
 *     (CNOT/CZ) is also worked in full now that HW2 is submitted;
 *   - Q4-5: entanglement previews (Φ⁺, the product test, Bell correlations) are named previews only: "Chapter Q6
 *     builds this" (Q6 owns the Bell basis, the parameter count and the Bell-measurement circuit; re-map §1.2).
 *
 * Rules kept here (as in Q3's story file):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come from
 *   Q4.values.ts, printed with d / pct / uf, and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Ground-up sentences ≤ 25 words, Formal ≤ 40; symbols defined before use in both tracks.
 * - No `{{term|…}}` prose terms in this chapter: every anchor a reader might want is already named by a gloss tag.
 */
import type { AmplitudesState, Beat, BlochState, CircuitStageState, Ref, StageLayout } from '../schema'
import {
  C_BELL,
  C_BELLM,
  C_COPY,
  C_COPYM,
  C_CX10,
  C_CZH,
  C_H,
  C_HH,
  C_HHCX,
  C_HZ,
  C_M2,
  C_PROD,
  C_PRODM,
  C_PSIH,
  C_SWAP3,
  C_H3,
  C_X,
  V,
  claim,
  close,
  d,
  pct,
} from './Q4.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const amp = (s: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', ...s })
const circ = (s: Omit<CircuitStageState, 'kind'>): CircuitStageState => ({ kind: 'circuit', shot: 'Q-WIRES', ...s })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
const split = (top: AmplitudesState | CircuitStageState | BlochState, bottom: AmplitudesState | CircuitStageState | BlochState): StageLayout => ({ layout: 'split', top, bottom })

const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })

/** ψ = Q3's running state, θ = 60°, φ = 0, prepared in circuits by g(Ry, 0, π/3). */
const PSI_DIR = { thetaDeg: 60, phiDeg: 0 } as const

/* claims shared by more than one beat */
const cP0 = claim('q4P0', 'ψ reads 0 with chance 0.75', () => close(V.q4P0, 0.75))
const cP1 = claim('q4P1', 'ψ reads 1 with chance 0.25', () => close(V.q4P1, 0.25))
const cCZcircuit = claim('q4CZcircuit', '(I ⊗ H) CNOT (I ⊗ H) = CZ', () => V.q4CZcircuit === 1)

/* ---------------------------------------------------------------------------------------------- */
/* q4-qubit — From a bit to a qubit                                                                */
/* ---------------------------------------------------------------------------------------------- */

const qubit: Beat[] = [
  {
    id: 'q4-qubit:b1',
    phase: 'lecture',
    text: `A bit is 0 or 1, like a switch that is off or on. A [[qubit|qubit]] is a two-level system whose states |0⟩ and |1⟩ play the parts of 0 and 1. It can also be in a [[qc-superposition|superposition]] α|0⟩ + β|1⟩, as in Unit 1.3. In this course |0⟩ is |+z⟩ and |1⟩ is |−z⟩. <<qc-l1-vectors|states are vectors>> first drew spin states as arrows.`,
    formal: `$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, a unit vector of ℂ² (Bergou eq. 1.1, p. 1; N&C eq. 1.1, p. 13; notes L5 p. 21: a single qubit versus many); $\\{|0\\rangle, |1\\rangle\\}$ is the [[qc-computational-basis|computational basis]]. Lock: $|0\\rangle \\equiv |{+z}\\rangle$, $|1\\rangle \\equiv |{-z}\\rangle$.`,
    caption: `ψ = ${d(V.q4PsiAlpha, 3)}|0⟩ + ${d(V.q4PsiBeta, 1)}|1⟩: two bars`,
    captionFormal: `Rosetta: Bergou's and N&C's |0⟩, |1⟩ are our |+z⟩, |−z⟩`,
    stage: amp({ state: { dir: PSI_DIR }, labels: 'spin', dials: true }),
    fidelity: ['qc-amp-zero-is-up'],
    introduces: ['qc-computational-basis'],
    claims: [
      claim('q4PsiAlpha', 'ψ’s |0⟩ amplitude is 0.866', () => close(V.q4PsiAlpha, 0.866, 1e-3)),
      claim('q4PsiBeta', 'ψ’s |1⟩ amplitude is 0.5', () => close(V.q4PsiBeta, 0.5)),
    ],
  },
  {
    id: 'q4-qubit:b2',
    phase: 'lecture',
    text: 'You cannot read α and β off a qubit. Reading it gives 0 with chance |α|² or 1 with chance |β|², the [[qc-born-rule|Born rule]] of Unit 1.3. Afterwards the qubit is |0⟩ or |1⟩, whichever was read. For ψ the chances are 75 % and 25 %.',
    formal:
      'A computational-basis measurement returns 0 w.p. $|\\alpha|^2$ and 1 w.p. $|\\beta|^2$, leaving $|0\\rangle$ or $|1\\rangle$: the [[qc-born-rule|Born rule]] (N&C pp. 13, 15) <<qc-l3-postulates|the same rule and the state after a measurement>>. Normalization, $|\\alpha|^2 + |\\beta|^2 = 1$, is the chances adding to 1.',
    caption: `ψ read: 0 with chance ${pct(V.q4P0)}, 1 with chance ${pct(V.q4P1)}`,
    stage: amp({ state: { dir: PSI_DIR }, mode: 'probability' }),
    claims: [cP0, cP1],
  },
  {
    id: 'q4-qubit:b3',
    phase: 'lecture',
    text: 'Unit 3.2 put every spin state on a sphere with two angles. Bergou does the same for a qubit, with |0⟩ at the north pole and |1⟩ at the south. ψ sits at θ = 60°, φ = 0. A phase in front of the whole state does not move the point.',
    formal:
      'Bergou eq. 1.2 (p. 2) and N&C eq. 1.4 (p. 15) are Unit 3.2’s $|\\theta, \\varphi\\rangle$ (notes L3 pp. 12–13, via Unit 3.2’s own parametrization). N&C eq. 1.3 keeps a factor $e^{i\\gamma}$ in front; it changes no chance, so it is dropped (Chapter F1) <<qc-l6-bloch|three averages make a point>>.',
    caption: `ψ on the sphere: (${d(V.q4PsiVecX, 3)}, 0, ${d(V.q4PsiVecZ, 1)})`,
    captionFormal: 'e^(iγ)ψ, γ swept to 90°: the point stays',
    stage: bloch({ state: PSI_DIR, globalPhaseDeg: { from: 0, to: 90 } }),
    fidelity: ['bloch-not-lab-space'],
    claims: [
      claim('q4PsiVecX', 'ψ’s Bloch vector has x = 0.866', () => close(V.q4PsiVecX, 0.866, 1e-3)),
      claim('q4PsiVecZ', 'ψ’s Bloch vector has z = 0.5', () => close(V.q4PsiVecZ, 0.5)),
      claim('q4PhaseSame', 'iψ is the same physical state as ψ', () => V.q4PhaseSame === 1),
    ],
  },
  {
    id: 'q4-qubit:b4',
    phase: 'books',
    text: 'Any two-level system can hold a qubit. Bergou names electron and nuclear spins and a photon’s polarization. Nielsen and Chuang add an atom’s two lowest levels. A short flash of light moves the atom from |0⟩ half way to |1⟩, into |+⟩ = (|0⟩ + |1⟩)/√2.',
    formal:
      'Bergou §1.1 lists spins and photon polarization (Unit 2.6); N&C Fig. 1.2 (p. 14) adds two atomic levels, ground $|0\\rangle$ and excited $|1\\rangle$. A shorter pulse leaves $|{+}\\rangle \\equiv (|0\\rangle + |1\\rangle)/\\sqrt2$ (N&C eq. 1.2), our $|{+x}\\rangle$.',
    caption: `|+⟩ = |+x⟩: chances ${pct(V.q4PlusP0)} and ${pct(V.q4PlusP1)}`,
    stage: amp({ state: { ket: '+' }, mode: 'probability' }),
    refs: [bergou('§1.1, pp. 1–2', 'Names spins, photon polarization and other two-level systems as candidate [[qubit|qubits]].'), nc('Fig. 1.2, p. 14', 'Two atomic levels, ground and excited, as a qubit; a short pulse gives |+⟩.')],
    claims: [claim('q4PlusP0', '|+⟩ reads 0 with chance 0.5', () => close(V.q4PlusP0, 0.5)), claim('q4PlusP1', '|+⟩ reads 1 with chance 0.5', () => close(V.q4PlusP1, 0.5))],
  },
  {
    id: 'q4-qubit:b5',
    phase: 'clue',
    text: 'A point on the sphere needs two angles, each with endless digits. Could one qubit store a whole book?',
    formal: '$\\theta$ and $\\varphi$ are real numbers. Can one qubit deliver unboundedly many bits?',
    stage: bloch({ state: PSI_DIR }),
    reveal: {
      text: 'No. One reading gives one bit, 0 or 1, and leaves |0⟩ or |1⟩. The angles show up only as chances, found by reading many identical copies.',
      formal: 'No: one measurement yields one bit and collapses the state; $\\alpha$ and $\\beta$ are estimated only from many identically prepared copies (N&C pp. 15–16). A later chapter makes the limit exact.',
      caption: `ψ read many times: ${pct(V.q4P0)} and ${pct(V.q4P1)}`,
      stage: amp({ state: { dir: PSI_DIR }, mode: 'probability' }),
      claims: [cP0, cP1],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q4-one-qubit-gates — One-qubit gates turn the sphere                                             */
/* ---------------------------------------------------------------------------------------------- */

const oneQubitGates: Beat[] = [
  {
    id: 'q4-one-qubit-gates:b1',
    phase: 'lecture',
    text: 'A [[qc-gate|gate]] changes a qubit’s state. The quantum NOT swaps |0⟩ and |1⟩. Being linear, it turns α|0⟩ + β|1⟩ into α|1⟩ + β|0⟩. As a table acting on the column (α, β) it is $X = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}$, Unit 3.3’s σ_x.',
    formal:
      'NOT: $\\alpha|0\\rangle + \\beta|1\\rangle \\mapsto \\alpha|1\\rangle + \\beta|0\\rangle$ (Bergou eq. 1.5); on the column $(\\alpha,\\beta)^\\mathsf{T}$ (eq. 1.6) it is $X = \\sigma_x$ (eq. 1.7, p. 3; N&C eqs. 1.10–1.12; notes L5 p. 24: X = σ_x, the NOT gate). Its columns are $X|0\\rangle$ and $X|1\\rangle$.',
    caption: `Xψ = (${d(V.q4XPsi0, 1)}, ${d(V.q4XPsi1, 3)}): the chances swap to ${pct(V.q4XP0)} and ${pct(V.q4XP1)}`,
    captionFormal: 'X|0⟩ = |1⟩',
    stage: split(circ({ circuit: C_X, upTo: { from: 0, to: 1 } }), amp({ state: { circuit: C_X, upTo: { from: 0, to: 1 } } })),
    fidelity: ['qc-circuit-wires-are-time'],
    introduces: ['qc-gate'],
    derivation: {
      result: 'X = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}',
      ground: [
        { tex: '|0\\rangle \\mapsto |1\\rangle,\\quad |1\\rangle \\mapsto |0\\rangle', why: 'The NOT gate, asked of the two basis states.' },
        { tex: '\\alpha|0\\rangle + \\beta|1\\rangle \\mapsto \\alpha|1\\rangle + \\beta|0\\rangle', why: 'A gate is linear: it acts on each part and keeps the amplitudes.' },
        { tex: '\\alpha|0\\rangle + \\beta|1\\rangle = \\begin{pmatrix}\\alpha\\\\ \\beta\\end{pmatrix}', why: 'Write a qubit as a column: the top entry for |0⟩, the bottom for |1⟩.' },
        {
          tex: 'X\\begin{pmatrix}1\\\\ 0\\end{pmatrix} = \\begin{pmatrix}0\\\\ 1\\end{pmatrix},\\quad X\\begin{pmatrix}0\\\\ 1\\end{pmatrix} = \\begin{pmatrix}1\\\\ 0\\end{pmatrix}',
          why: 'Step 1 in columns; a table’s columns are what it makes of |0⟩ and |1⟩ (Unit 2.4).',
          view: circ({ circuit: C_X, upTo: { from: 0, to: 1 } }),
          viewCaption: 'The circuit running X on |0⟩ then on |1⟩.',
        },
        {
          tex: 'X = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}',
          why: 'Put the two columns side by side.',
          claims: [claim('q4X0', 'X|0⟩ = |1⟩', () => V.q4X0 === 1)],
          view: bloch({ state: '+z', rotate: { axis: 'x', angleDeg: { from: 0, to: 180 } } }),
          viewCaption: 'X as a half turn about x: |0⟩ swings to |1⟩.',
        },
      ],
      formal: [
        { tex: 'X_{ij} = \\langle i|X|j\\rangle = 1 - \\delta_{ij}', why: 'Matrix elements from the action on the basis (Unit 2.4).', view: amp({ state: { circuit: C_X, upTo: 1 } }), viewCaption: 'Xψ’s bars, read off entry by entry.' },
        {
          tex: 'X = \\sigma_x = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}',
          why: 'eq. 1.7.',
          claims: [claim('q4X0', 'X|0⟩ = |1⟩', () => V.q4X0 === 1)],
          view: bloch({ state: '+z', rotate: { axis: 'x', angleDeg: { from: 0, to: 180 } } }),
          viewCaption: 'The same half turn about x.',
        },
      ],
    },
    claims: [
      claim('q4XPsi0', 'Xψ’s |0⟩ amplitude is 0.5', () => close(V.q4XPsi0, 0.5, 1e-3)),
      claim('q4XPsi1', 'Xψ’s |1⟩ amplitude is 0.866', () => close(V.q4XPsi1, 0.866, 1e-3)),
      claim('q4XP0', 'Xψ reads 0 with chance 0.25', () => close(V.q4XP0, 0.25)),
      claim('q4XP1', 'Xψ reads 1 with chance 0.75', () => close(V.q4XP1, 0.75)),
    ],
  },
  {
    id: 'q4-one-qubit-gates:b2',
    phase: 'lecture',
    text: 'Every gate is [[qc-unitary|unitary]], as in Unit 2.5: U†U = I. That keeps the chances adding to 1, and U† undoes the gate. So no gate loses information: the output always tells you the input.',
    formal:
      'Gates are unitary because they are time evolutions (Bergou p. 3); $U^\\dagger U = I$ is exactly what preserves $|\\alpha|^2 + |\\beta|^2 = 1$ for every input, and every unitary is a legal gate (N&C p. 18; notes L5 p. 24, eq. 2.2, derived from norm preservation). $X^\\dagger X = I$.',
    caption: 'X†X = I: X undoes itself',
    stage: split(circ({ circuit: C_X, upTo: 1 }), amp({ state: { circuit: C_X, upTo: 1 } })),
    derivation: {
      result: 'U^\\dagger U = I',
      ground: [
        {
          tex: 'U(\\alpha|0\\rangle + \\beta|1\\rangle) = \\alpha\\,U|0\\rangle + \\beta\\,U|1\\rangle',
          why: 'A gate is linear: it acts on each part and keeps the amplitudes (as in the X derivation, Unit 4.2).',
          view: amp({ state: { circuit: C_X, upTo: 0 } }),
          viewCaption: 'ψ before the gate: its bars already add to 1.',
        },
        { tex: '|\\alpha|^2 + |\\beta|^2 = 1\\ \\text{for the input, and again for the output}', why: 'Every input and every output must be a valid state: its own chances add to 1.' },
        {
          tex: 'U|0\\rangle,\\ U|1\\rangle\\ \\text{stay the same length, and stay perpendicular to each other}',
          why: 'That must hold for every α, β exactly when the two output columns are themselves a unit-length, perpendicular pair.',
        },
        {
          tex: 'U^\\dagger U = I',
          why: 'An orthonormal pair of columns is exactly what U†U = I says: each column dotted with itself is 1, and with the other is 0.',
          claims: [claim('q4XUnitary', 'checked on X: X†X = I', () => V.q4XUnitary === 1)],
          view: circ({ circuit: C_X, upTo: 1 }),
          viewCaption: 'X itself: applying it keeps every chance intact.',
        },
      ],
      formal: [
        {
          tex: 'U\\begin{pmatrix}\\alpha\\\\ \\beta\\end{pmatrix},\\quad |\\alpha|^2 + |\\beta|^2 = 1\\ \\text{before and after}',
          why: 'Every physical state is a unit column, before U and after it.',
          view: circ({ circuit: C_X, upTo: 1 }),
          viewCaption: 'X preserves every ψ’s norm.',
        },
        {
          tex: 'U^\\dagger U = I',
          why: 'True for every α, β exactly when U’s columns are orthonormal, which is what U†U = I states entry by entry.',
          claims: [claim('q4XUnitary', 'checked on X: X†X = I', () => V.q4XUnitary === 1)],
          view: amp({ state: { circuit: C_X, upTo: 1 } }),
          viewCaption: 'X’s bars after the gate: still summing to 1.',
        },
      ],
    },
    claims: [claim('q4XUnitary', 'X†X = I', () => V.q4XUnitary === 1)],
  },
  {
    id: 'q4-one-qubit-gates:b3',
    phase: 'lecture',
    text: 'The Z gate, $\\begin{pmatrix}1 & 0\\\\ 0 & -1\\end{pmatrix}$, keeps |0⟩ and flips the sign of |1⟩. Zψ still reads 75 % and 25 %. On the sphere Z turns the point half way round the z axis, to φ = 180°. X is likewise a half turn about x.',
    formal: `Z = σ_z (N&C eq. 1.13, p. 19; notes L5 p. 24). One-qubit gates act on the sphere as rotations (p. 19): with $R_n(\\chi) = e^{-i\\chi\\hat n\\cdot\\vec\\sigma/2}$ (notes L5 pp. 24–25, from $(\\hat n\\cdot\\vec\\sigma)^2 = 1$), $X = iR_x(\\pi)$ and $Z = iR_z(\\pi)$ <<qc-l6-generator|S_z generates the turn>>. Zψ has Bloch vector $(${d(V.q4ZBlochX, 3)}, 0, ${d(V.q4ZBlochZ, 1)})$.`,
    caption: 'Zψ: same chances, the point turned to φ = 180°',
    captionFormal: 'X = iR_x(π): the factor i is a global phase',
    stage: bloch({ state: PSI_DIR, rotate: { axis: 'z', angleDeg: { from: 0, to: 180 } } }),
    introduces: ['qc-rotation-operator'],
    derivation: {
      result: 'R_n(\\theta) = \\cos\\tfrac\\theta2\\,I - i\\sin\\tfrac\\theta2\\,\\hat n\\cdot\\vec\\sigma',
      ground: [
        {
          tex: '(\\hat n\\cdot\\vec\\sigma)^2 = I',
          why: 'Each Pauli squares to I and two different ones anticommute, so the cross terms cancel for a unit vector n̂ (Unit 3.6).',
          claims: [claim('q4NdotSigmaSq', 'checked on n̂ = (x̂+ẑ)/√2, H’s own axis: (n̂·σ)² = I', () => V.q4NdotSigmaSq === 1)],
          view: bloch({ state: { thetaDeg: 45, phiDeg: 0 } }),
          viewCaption: 'n̂ = (x̂ + ẑ)/√2, the axis itself, as a point on the sphere.',
        },
        { tex: 'R_n(\\theta) = e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2}', why: 'The rotation operator is this exponential of an operator (Chapter F4).' },
        {
          tex: 'e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2} = \\cos\\tfrac\\theta2\\,I - i\\sin\\tfrac\\theta2\\,\\hat n\\cdot\\vec\\sigma',
          why: 'Squaring to I splits the exponential’s series into a part built only from I and a part with one leftover factor of n̂·σ, which sum to cosine and −i·sine, just as e^{iφ} splits into cosine and i·sine (Chapter F1).',
        },
        {
          tex: 'R_n(\\theta) = \\cos\\tfrac\\theta2\\,I - i\\sin\\tfrac\\theta2\\,\\hat n\\cdot\\vec\\sigma',
          why: 'Combine the last two lines.',
          claims: [claim('q4HNC', 'checked at θ = π, n̂ = (x̂+ẑ)/√2: this is exactly H', () => V.q4HNC === 1)],
          view: amp({ state: { dir: PSI_DIR } }),
          viewCaption: 'ψ’s own bars: the formula holds whatever the axis.',
        },
      ],
      formal: [
        {
          tex: '(\\hat n\\cdot\\vec\\sigma)^2 = I \\ \\Rightarrow\\ e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2}\\ \\text{splits into even and odd parts}',
          why: 'A square root of the identity splits its exponential into cosine and sine parts.',
          view: bloch({ state: { thetaDeg: 45, phiDeg: 0 } }),
          viewCaption: 'n̂, the axis the series is built on.',
        },
        {
          tex: 'R_n(\\theta) = \\cos\\tfrac\\theta2\\,I - i\\sin\\tfrac\\theta2\\,\\hat n\\cdot\\vec\\sigma',
          why: 'H = iR_n(π) is this formula at θ = π, n̂ = (x̂+ẑ)/√2 (Unit 2.6).',
          claims: [claim('q4HNC', 'checked at θ = π, n̂ = (x̂+ẑ)/√2: this is exactly H', () => V.q4HNC === 1)],
          view: amp({ state: { dir: PSI_DIR } }),
          viewCaption: 'ψ’s bars again, for contrast.',
        },
      ],
    },
    claims: [
      claim('q4ZPsi0', 'Zψ’s |0⟩ amplitude is 0.866', () => close(V.q4ZPsi0, 0.866, 1e-3)),
      claim('q4ZPsi1', 'Zψ’s |1⟩ amplitude is −0.5', () => close(V.q4ZPsi1, -0.5)),
      cP0,
      cP1,
      claim('q4ZBlochX', 'Zψ has Bloch x = −0.866', () => close(V.q4ZBlochX, -0.866, 1e-3)),
      claim('q4ZBlochZ', 'Zψ has Bloch z = 0.5', () => close(V.q4ZBlochZ, 0.5)),
      claim('q4XisRx', 'X = iR_x(π)', () => V.q4XisRx === 1),
      claim('q4ZisRz', 'Z = iR_z(π)', () => V.q4ZisRz === 1),
    ],
  },
  {
    id: 'q4-one-qubit-gates:b4',
    phase: 'lecture',
    text: 'The [[qc-hadamard|Hadamard]] gate sends |0⟩ to |+⟩ and |1⟩ to |−⟩ = (|0⟩ − |1⟩)/√2. It turns a sure bit into an even mix, which no classical gate does. It is Unit 2.5’s H, now used as a gate: H = (X + Z)/√2, and H² = I.',
    formal:
      '$H|0\\rangle = |{+}\\rangle$, $H|1\\rangle = |{-}\\rangle$ (Bergou eq. 1.8, p. 4; N&C eq. 1.14, p. 19), so $H = \\tfrac1{\\sqrt2}(1\\ 1; 1\\ {-1}) = (X+Z)/\\sqrt2$ (notes L5 p. 24, the same gate built from the Pauli matrices), Unit 2.5’s $z \\to x$ change of basis. $H^2 = I$.',
    caption: `H|0⟩ = (${d(V.q4H00, 3)}, ${d(V.q4H01, 3)}): chances 50 % and 50 %`,
    captionFormal: `H|1⟩ = (${d(V.q4H10, 3)}, ${d(V.q4H11, 3)})`,
    stage: split(circ({ circuit: C_H, upTo: { from: 0, to: 1 } }), amp({ state: { circuit: C_H, upTo: { from: 0, to: 1 } } })),
    derivation: {
      result: 'H = \\tfrac1{\\sqrt2}(X + Z)\\text{ and }H^2 = I',
      ground: [
        { tex: 'H|0\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle),\\quad H|1\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle - |1\\rangle)', why: 'Bergou’s definition of the gate.' },
        {
          tex: 'H = \\tfrac1{\\sqrt2}\\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}',
          why: 'The two outputs are the table’s columns (the previous derivation’s method).',
          view: circ({ circuit: C_H, upTo: { from: 0, to: 1 } }),
          viewCaption: 'The circuit running H on |0⟩ then on |1⟩.',
        },
        { tex: 'X + Z = \\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}', why: 'Add the two tables entry by entry.' },
        { tex: 'H = \\tfrac1{\\sqrt2}(X + Z)', why: 'Compare the last two steps.' },
        { tex: 'H^2 = \\tfrac12(X^2 + XZ + ZX + Z^2)', why: 'Multiply out, keeping the order inside each product.' },
        { tex: 'X^2 = Z^2 = I,\\quad ZX = -XZ', why: 'Unit 3.6’s Pauli rules: each squares to I, and two different ones anticommute.' },
        {
          tex: 'H^2 = \\tfrac12(I + I) = I',
          why: 'The middle terms cancel.',
          claims: [claim('q4HH', 'H² = I', () => V.q4HH === 1)],
          view: bloch({ state: '+z', rotate: { axis: { thetaDeg: 45, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
          viewCaption: 'Two H half turns about the same axis: a full turn, back to |0⟩.',
        },
      ],
      formal: [
        { tex: 'H = \\tfrac1{\\sqrt2}(X + Z)', why: 'eq. 1.8’s columns.', view: amp({ state: { circuit: C_H, upTo: 1 } }), viewCaption: 'H|0⟩’s bars.' },
        {
          tex: 'H^2 = \\tfrac12\\big(2I + \\{X, Z\\}\\big) = I',
          why: '{σ_i, σ_j} = 2δ_ijI.',
          claims: [claim('q4HH', 'H² = I', () => V.q4HH === 1)],
          view: bloch({ state: '+z', rotate: { axis: { thetaDeg: 45, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
          viewCaption: 'The same full turn.',
        },
      ],
    },
    claims: [
      claim('q4HXZ', 'H = (X + Z)/√2', () => V.q4HXZ === 1),
      claim('q4H00', 'H|0⟩’s amplitudes are 0.707', () => close(V.q4H00, 0.7071, 1e-3) && close(V.q4H01, 0.7071, 1e-3)),
      claim('q4H10', 'H|1⟩’s amplitudes are 0.707, −0.707', () => close(V.q4H10, 0.7071, 1e-3) && close(V.q4H11, -0.7071, 1e-3)),
      claim('q4HalfFromH', 'H’s normalization squared is one half, the ½ in H² = ½(I + I)', () => close(V.q4HalfFromH, 0.5)),
    ],
  },
  {
    id: 'q4-one-qubit-gates:b5',
    phase: 'lecture',
    text: 'On the sphere H is a half turn about the axis half way between x and z. It swaps the x and z axes and flips y. So ψ, 60° from the north pole, lands 30° from it: Hψ = (0.966, 0.259). <<qc-l6-active|turn the state, keep the axes>> turns the state this same way.',
    formal: `$H = iR_n(\\pi)$, $\\hat n = (\\hat x + \\hat z)/\\sqrt2$; N&C Fig. 1.4 (p. 19) gets the same map from $R_y(90°)$ then $R_x(180°)$: $H = iR_x(\\pi)R_y(\\pi/2)$. Hψ has Bloch vector $(${d(V.q4HBlochX, 1)}, 0, ${d(V.q4HBlochZ, 3)})$ and chances ${pct(V.q4HP0)}, ${pct(V.q4HP1)}, Unit 3.1’s $|\\langle{+x}|\\psi\\rangle|^2$.`,
    caption: 'Hψ: θ from 60° to 30°',
    captionFormal: 'H = iR_x(π)R_y(π/2) = iR_n(π)',
    stage: bloch({ state: PSI_DIR, rotate: { axis: { thetaDeg: 45, phiDeg: 0 }, angleDeg: { from: 0, to: 180 } } }),
    claims: [
      claim('q4HPsi0', 'Hψ’s |0⟩ amplitude is 0.966', () => close(V.q4HPsi0, 0.9659, 1e-3)),
      claim('q4HPsi1', 'Hψ’s |1⟩ amplitude is 0.259', () => close(V.q4HPsi1, 0.2588, 1e-3)),
      claim('q4HBlochX', 'Hψ has Bloch x = 0.5', () => close(V.q4HBlochX, 0.5)),
      claim('q4HBlochZ', 'Hψ has Bloch z = 0.866', () => close(V.q4HBlochZ, 0.866, 1e-3)),
      claim('q4HP0', 'Hψ reads 0 with chance 93.3 %', () => close(V.q4HP0, 0.933, 1e-3)),
      claim('q4HP1', 'Hψ reads 1 with chance 6.7 %', () => close(V.q4HP1, 0.067, 1e-3)),
      claim('q4HTurn', 'H = iR_x(π)R_y(π/2)', () => V.q4HTurn === 1),
      claim('q4HNC', 'H = iR_n(π), n̂ = (x̂+ẑ)/√2', () => V.q4HNC === 1),
    ],
  },
  {
    id: 'q4-one-qubit-gates:b6',
    phase: 'lecture',
    text: 'R_z(χ) = $\\begin{pmatrix}e^{-i\\chi/2} & 0\\\\ 0 & e^{i\\chi/2}\\end{pmatrix}$ turns the sphere by the angle χ about z. The [[qc-phase-gate|phase gate]] P(χ) = $\\begin{pmatrix}1 & 0\\\\ 0 & e^{i\\chi}\\end{pmatrix}$ makes the same turn. The two differ only by a [[global-phase|global phase]], which changes no chance. S = P(90°) turns |+⟩ into |+y⟩.',
    formal:
      '$R_z(\\beta) = \\mathrm{diag}(e^{-i\\beta/2}, e^{i\\beta/2})$ (N&C eq. 1.16) and the real $R_y(\\gamma)$ (eq. 1.15); $P(\\chi) = e^{i\\chi/2}R_z(\\chi)$, so $Z = P(\\pi)$, $S = P(\\pi/2)$, $T = P(\\pi/4)$ (T, N&C: π/8 gate; Chapter F1; notes L5 p. 24: $S = \\mathrm{diag}(1,i)$, $T = \\mathrm{diag}(1,e^{i\\pi/4})$). N&C Box 1.1, eq. 1.17, p. 20 gives any one-qubit gate as $U = e^{i\\alpha}R_z(\\beta)R_y(\\gamma)R_z(\\delta)$; $R_z(2\\pi) = -I$ <<qc-l7-full-turn|a full turn flips the sign>>.',
    caption: 'S|+⟩ = |+y⟩: a quarter turn about z',
    captionFormal: 'T = e^(iπ/8)R_z(π/4); R_z(360°) = −I',
    stage: bloch({ state: '+x', rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } } }),
    derivation: {
      result: 'P(\\chi) = e^{i\\chi/2}R_z(\\chi)',
      ground: [
        { tex: '|\\psi\\rangle = \\cos\\tfrac\\theta2|0\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|1\\rangle', why: 'A point on the sphere (Unit 3.2).' },
        { tex: 'P(\\chi)|\\psi\\rangle = \\cos\\tfrac\\theta2|0\\rangle + e^{i(\\varphi + \\chi)}\\sin\\tfrac\\theta2|1\\rangle', why: 'P(χ) multiplies the |1⟩ amplitude by e^{iχ}, and multiplying arrows adds their angles (Chapter F1).' },
        {
          tex: '(\\theta, \\varphi) \\to (\\theta, \\varphi + \\chi)',
          why: 'Same polar angle, azimuth moved on by χ: a turn by χ about z.',
          view: bloch({ state: '+x', rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } } }),
          viewCaption: 'P(χ) turning |+x⟩ by χ about z.',
        },
        { tex: 'R_z(\\chi) = \\begin{pmatrix}e^{-i\\chi/2} & 0\\\\ 0 & e^{i\\chi/2}\\end{pmatrix}', why: 'N&C’s z rotation (eq. 1.16).' },
        { tex: 'R_z(\\chi) = e^{-i\\chi/2}P(\\chi)', why: 'Take e^{−iχ/2} out of both diagonal entries.' },
        {
          tex: 'P(\\chi) = e^{i\\chi/2}R_z(\\chi)',
          why: 'So the two differ by a global phase and make the same turn.',
          claims: [claim('q4PRz', 'P(χ) = e^{iχ/2}R_z(χ) for every χ', () => V.q4PRz === 1)],
          view: amp({ state: { ket: '+' }, mode: 'probability' }),
          viewCaption: 'P(χ) changes no chance: |+⟩’s bars stay 50/50.',
        },
      ],
      formal: [
        {
          tex: 'P(\\chi)|\\theta, \\varphi\\rangle = |\\theta, \\varphi + \\chi\\rangle',
          why: 'Unit 3.2’s |θ, φ⟩.',
          view: bloch({ state: '+x', rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } } }),
          viewCaption: 'The same z turn.',
        },
        {
          tex: 'R_z(\\chi) = e^{-i\\chi\\sigma_z/2},\\quad P(\\chi) = e^{i\\chi/2}R_z(\\chi)',
          why: 'Factor out the global phase.',
          claims: [claim('q4PRz', 'P(χ) = e^{iχ/2}R_z(χ) for every χ', () => V.q4PRz === 1)],
          view: amp({ state: { ket: '+' }, mode: 'probability' }),
          viewCaption: 'No chance moves.',
        },
      ],
    },
    claims: [
      claim('q4SPlus', 'S|+⟩ = |+y⟩', () => V.q4SPlus === 1),
      claim('q4TRz', 'T = e^{iπ/8}R_z(π/4)', () => V.q4TRz === 1),
      claim('q4Rz2pi', 'R_z(360°) = −I', () => V.q4Rz2pi === 1),
    ],
  },
  {
    id: 'q4-one-qubit-gates:b7',
    phase: 'clue',
    text: 'H takes |0⟩ half way to |1⟩. Do two H gates in a row make a NOT?',
    formal: 'Is H a square root of X, that is, H² = X?',
    stage: split(circ({ circuit: C_HH, upTo: 1 }), amp({ state: { circuit: C_HH, upTo: 1 } })),
    reveal: {
      text: 'No. H² = I: two half turns about one axis make a full turn, back to the start. A half-way gate that works is R_x(90°); done twice, it is a NOT up to a phase.',
      formal: 'No: $H^2 = I$ (N&C p. 19). $R_x(\\pi/2)^2 = R_x(\\pi) = -iX$, a square root of NOT up to a global phase; $R_x(\\pi/2)|0\\rangle$ also reads 50 %, 50 %.',
      caption: 'H·H = I; R_x(90°)·R_x(90°) = −iX',
      stage: bloch({ state: '+z', rotate: { axis: { thetaDeg: 45, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
      claims: [
        claim('q4HHisX', 'H² ≠ X', () => V.q4HHisX === 0),
        claim('q4SqrtNot', 'R_x(90°)² = −iX', () => V.q4SqrtNot === 1),
        claim('q4SqrtNotP0', 'R_x(90°)|0⟩ reads 0 with chance 50 %', () => close(V.q4SqrtNotP0, 0.5)),
        claim('q4SqrtNotP1', 'R_x(90°)|0⟩ reads 1 with chance 50 %', () => close(V.q4SqrtNotP1, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q4-registers — Registers: 2ⁿ amplitudes for n qubits                                             */
/* ---------------------------------------------------------------------------------------------- */

const registers: Beat[] = [
  {
    id: 'q4-registers:b1',
    phase: 'lecture',
    text: 'Two bits have four settings: 00, 01, 10 and 11. Two qubits, a [[qc-register|register]], have four basis states |00⟩, |01⟩, |10⟩, |11⟩, each with its own amplitude. These amplitudes add and scale like any vector. The left digit belongs to the first qubit, drawn on the top wire. <<qc-l2-vector-space|kets add and scale like vectors>>.',
    formal:
      '$|\\psi\\rangle = \\alpha_{00}|00\\rangle + \\alpha_{01}|01\\rangle + \\alpha_{10}|10\\rangle + \\alpha_{11}|11\\rangle$, $\\sum_x|\\alpha_x|^2 = 1$ (N&C eq. 1.5, p. 16; notes L5 p. 21, multi-qubit strings and a doubling count of amplitudes). Lock: the left label is qubit 0, the top wire and the most significant bit.',
    caption: '|01⟩: one bar, the second of four',
    captionFormal: 'Rosetta: Bergou’s qubit 1 and N&C’s first qubit are our qubit 0',
    stage: amp({ state: { ket: '01' } }),
    fidelity: ['qc-amp-bars-not-places'],
    introduces: ['qc-register'],
  },
  {
    id: 'q4-registers:b2',
    phase: 'lecture',
    text: 'Put ψ beside a second qubit in |+⟩. Each two-qubit amplitude is a product: the first qubit’s amplitude for its digit times the second’s for its digit. So |10⟩ gets 0.5 × 0.707 = 0.354. This is the [[qc-tensor-product|tensor product]] ψ ⊗ |+⟩. A gate can act on one wire alone: drawing U on the top wire means U ⊗ I on the whole register.',
    formal: `$(|a\\rangle \\otimes |b\\rangle)_{ij} = a_ib_j$, the Kronecker product of the columns; Bergou eq. 1.3 (p. 2) builds the basis this way (notes L5 p. 23, one ket factor per qubit). $\\psi \\otimes |{+}\\rangle = (${d(V.q4Prod0, 3)}, ${d(V.q4Prod0, 3)}, ${d(V.q4Prod2, 3)}, ${d(V.q4Prod2, 3)})$, with chances ${pct(V.q4ProdP0)}, ${pct(V.q4ProdP0)}, ${pct(V.q4ProdP2)}, ${pct(V.q4ProdP2)} adding to 1. For operators, $(A \\otimes B)(|a\\rangle \\otimes |b\\rangle) = A|a\\rangle \\otimes B|b\\rangle$ (notes L5 p. 23, eq. 2.1); a gate drawn on one wire alone is $U \\otimes I$. Whether an operator is a product is a separate question from whether a state is one (Chapter Q6 builds this further).`,
    caption: `ψ ⊗ |+⟩: bars ${d(V.q4Prod0, 3)}, ${d(V.q4Prod0, 3)}, ${d(V.q4Prod2, 3)}, ${d(V.q4Prod2, 3)}`,
    captionFormal: 'chances sum: 1; (A ⊗ B)(|a⟩ ⊗ |b⟩) = A|a⟩ ⊗ B|b⟩',
    stage: split(circ({ circuit: C_PROD }), amp({ state: { circuit: C_PROD } })),
    introduces: ['qc-tensor-product', 'qc-tensor-operator'],
    claims: [
      claim('q4PsiBeta', 'ψ’s |1⟩ amplitude is 0.5', () => close(V.q4PsiBeta, 0.5)),
      claim('q4PlusAmp', '|+⟩’s amplitude is 0.707', () => close(V.q4PlusAmp, Math.SQRT1_2, 1e-3)),
      claim('q4Prod0', 'ψ ⊗ |+⟩’s |00⟩ and |01⟩ bars are 0.612', () => close(V.q4Prod0, 0.6124, 1e-3)),
      claim('q4Prod2', 'ψ ⊗ |+⟩’s |10⟩ and |11⟩ bars are 0.354', () => close(V.q4Prod2, 0.3536, 1e-3)),
      claim('q4ProdIsProduct', 'ψ ⊗ |+⟩ is a product state', () => V.q4ProdIsProduct === 1),
      claim('q4ProdP0', 'ψ ⊗ |+⟩ reads 00 or 01 with chance 0.375 each', () => close(V.q4ProdP0, 0.375)),
      claim('q4ProdP2', 'ψ ⊗ |+⟩ reads 10 or 11 with chance 0.125 each', () => close(V.q4ProdP2, 0.125)),
      claim('q4ProdPsum', 'those chances add to 1', () => close(V.q4ProdPsum, 1)),
    ],
  },
  {
    id: 'q4-registers:b3',
    phase: 'lecture',
    text: 'Each extra qubit doubles the count. n qubits have 2ⁿ basis states |x⟩, labelled by the n-digit binary numbers x. H on each of three qubits turns |000⟩ into 8 equal bars of 0.354. For 500 qubits, 2⁵⁰⁰ is a number with 151 digits.',
    formal:
      'The N-qubit basis is $|x\\rangle = |x_1\\ldots x_N\\rangle$, $x = 0, \\ldots, 2^N - 1$, and $|\\Psi\\rangle = \\sum_x c_x|x\\rangle$ (Bergou eqs. 1.3–1.4, p. 2; notes L5 p. 21: N-index strings and $2^N$ amplitudes, not $2N$). $H^{\\otimes 3}|000\\rangle$ has every $c_x = 1/\\sqrt8 = 0.354$; N&C (p. 17) notes that $2^{500}$ exceeds the number of atoms in the Universe.',
    caption: `three qubits: 8 bars of ${d(V.q4H3Amp, 3)}`,
    captionFormal: `2⁵⁰⁰: ${V.q4Digits500} digits`,
    stage: split(circ({ circuit: C_H3 }), amp({ state: { circuit: C_H3 } })),
    claims: [
      claim('q4Dim3', 'three qubits have 8 basis states', () => V.q4Dim3 === 8),
      claim('q4H3Amp', 'H on each of three qubits gives amplitude 0.354 to each of 8 bars', () => close(V.q4H3Amp, 0.3536, 1e-3)),
      claim('q4H3isWH', 'H^{⊗3} is the Walsh–Hadamard transform', () => V.q4H3isWH === 1),
      claim('q4Digits500', '2⁵⁰⁰ has 151 digits', () => V.q4Digits500 === 151),
    ],
  },
  {
    id: 'q4-registers:b4',
    phase: 'lecture',
    text: 'Read a label as a binary number to find its bar: |101⟩ is bar number 5, counting from 0. Bar 6 of three qubits is |110⟩.',
    formal: '$|x_1x_2x_3\\rangle \\mapsto x = 4x_1 + 2x_2 + x_3$ (big-endian, N&C’s $|x_1x_2\\ldots x_n\\rangle$, p. 17): $|101\\rangle \\mapsto 5$ and $6 \\mapsto |110\\rangle$.',
    caption: '|101⟩: bar number 5',
    stage: amp({ state: { ket: '101' } }),
    claims: [
      claim('q4Idx101', '|101⟩ is bar number 5', () => V.q4Idx101 === 5),
      claim('q4Bits6', 'bar 6 of three qubits is |110⟩', () => V.q4Bits6 === 110),
    ],
  },
  {
    id: 'q4-registers:b5',
    phase: 'clue',
    text: 'Every pair of one-qubit states makes a two-qubit state. Is every two-qubit state such a pair?',
    formal: 'Is every $|\\Psi\\rangle$, a vector of ℂ⁴, of the form $|a\\rangle \\otimes |b\\rangle$?',
    caption: 'the four amplitudes, laid out as a 2×2 table',
    captionFormal: 'C_{ab} = ⟨a₀b₁|Ψ⟩',
    stage: split(circ({ circuit: C_PROD }), amp({ state: { circuit: C_PROD } })),
    introduces: ['qc-coefficient-matrix'],
    reveal: {
      text: 'No. For a product, (first bar × last bar) − (second bar × third bar) is always 0. For (|00⟩ + |11⟩)/√2 it is 0.5. Such states are called entangled; Chapter Q6 builds this further.',
      formal:
        'No: $|\\Psi\\rangle$ is a product iff $\\det[[c_{00}, c_{01}], [c_{10}, c_{11}]] = 0$ (notes L5 p. 22, the same determinant test worked directly on the coefficients). For $(|00\\rangle + |11\\rangle)/\\sqrt2$ it is 0.5, for $\\psi \\otimes |{+}\\rangle$ it is 0. Chapter Q6 builds this further.',
      caption: 'ψ ⊗ |+⟩: 0; (|00⟩ + |11⟩)/√2: 0.5',
      stage: amp({ state: { bell: '00+11' } }),
      claims: [
        claim('q4ProdDet', 'the product state’s determinant is 0', () => close(V.q4ProdDet, 0)),
        claim('q4BellDet', 'the Bell pair’s determinant is 0.5', () => close(V.q4BellDet, 0.5)),
        claim('q4ProdProduct', 'the product state is a product (det 0)', () => V.q4ProdProduct === 1),
        claim('q4BellProduct', 'the Bell pair is not a product (det ≠ 0)', () => V.q4BellProduct === 0),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q4-cnot — CNOT: flip the target when the control is 1                                            */
/* ---------------------------------------------------------------------------------------------- */

const cnotUnit: Beat[] = [
  {
    id: 'q4-cnot:b1',
    phase: 'lecture',
    text: '[[qc-cnot|CNOT]] acts on two qubits, a control and a target. If the control is |0⟩ nothing happens; if it is |1⟩ the target flips. So |10⟩ becomes |11⟩, and |11⟩ becomes |10⟩.',
    formal:
      'C-NOT (Bergou eq. 1.9, Fig. 1.4, p. 4; N&C eq. 1.18, p. 21; notes L5 p. 24): $|00\\rangle \\mapsto |00\\rangle$, $|01\\rangle \\mapsto |01\\rangle$, $|10\\rangle \\mapsto |11\\rangle$, $|11\\rangle \\mapsto |10\\rangle$. The control (the dot, top wire) passes unchanged.',
    caption: '|10⟩ → |11⟩: the bar moves one place',
    captionFormal: 'U_CN: |10⟩ ↦ |11⟩, |11⟩ ↦ |10⟩',
    stage: split(circ({ circuit: C_CX10, upTo: { from: 0, to: 1 } }), amp({ state: { circuit: C_CX10, upTo: { from: 0, to: 1 } } })),
    introduces: ['qc-cnot'],
    claims: [claim('q4Cnot10', 'CNOT|10⟩ = |11⟩', () => V.q4Cnot10 === 1)],
  },
  {
    id: 'q4-cnot:b2',
    phase: 'lecture',
    text: 'In one line: the target B becomes B ⊕ A, where ⊕ is [[qc-xor|XOR]], adding bits without carrying. So 0 ⊕ 0 = 0, 0 ⊕ 1 = 1, 1 ⊕ 0 = 1 and 1 ⊕ 1 = 0. That is why CNOT is also called the XOR gate.',
    formal:
      '$|A, B\\rangle \\mapsto |A, B \\oplus A\\rangle$ with $\\oplus$ addition mod 2 (N&C p. 21; notes L5 p. 24: $U_{CN} = |0\\rangle\\langle0|\\otimes1 + |1\\rangle\\langle1|\\otimes\\sigma_x$); Bergou calls C-NOT the exclusive-OR gate (p. 4). A later Foundations chapter treats Boolean logic in full.',
    caption: '⊕: 0, 1, 1, 0',
    captionFormal: 'B ↦ B ⊕ A, addition mod 2',
    stage: split(circ({ circuit: C_CX10, upTo: 1 }), amp({ state: { circuit: C_CX10, upTo: 1 } })),
    introduces: ['qc-xor'],
  },
  {
    id: 'q4-cnot:b3',
    phase: 'lecture',
    text: 'Write the four outputs as columns, in the order |00⟩, |01⟩, |10⟩, |11⟩. The table is the identity with its last two columns swapped. It is unitary, and applying it twice changes nothing.',
    formal:
      '$U_{CN} = |0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes X$, its columns read off eq. 1.9 (Bergou ⚑ Problem 1.1(b)–(c); N&C Fig. 1.6; notes L5 p. 24): $U_{CN}^\\dagger U_{CN} = I$ and $U_{CN}^2 = I$.',
    caption: 'CNOT’s table: I with its last two columns swapped',
    captionFormal: 'U_CN² = I',
    stage: split(circ({ circuit: C_CX10, upTo: { from: 0, to: 1 } }), amp({ state: { circuit: C_CX10, upTo: { from: 0, to: 1 } } })),
    derivation: {
      result: 'U_{CN}^2 = I',
      ground: [
        { tex: '|00\\rangle, |01\\rangle, |10\\rangle, |11\\rangle \\;\\to\\; \\text{columns } 1, 2, 3, 4', why: 'Number the basis states in binary order (Unit 4.3).' },
        { tex: 'U|00\\rangle = |00\\rangle,\\quad U|01\\rangle = |01\\rangle', why: 'Control 0: nothing happens, so columns 1 and 2 are those of I.' },
        {
          tex: 'U|10\\rangle = |11\\rangle,\\quad U|11\\rangle = |10\\rangle',
          why: 'Control 1: the target flips, so column 3 is |11⟩ and column 4 is |10⟩.',
          view: circ({ circuit: C_CX10, upTo: { from: 0, to: 1 } }),
          viewCaption: 'CNOT running on |10⟩: the control stays, the target flips.',
        },
        { tex: 'U_{CN} = \\begin{pmatrix}1&0&0&0\\\\ 0&1&0&0\\\\ 0&0&0&1\\\\ 0&0&1&0\\end{pmatrix}', why: 'The four columns side by side.', claims: [claim('q4CnotMat', 'CNOT’s table is I with its last two columns swapped', () => V.q4CnotMat === 1)] },
        { tex: 'U_{CN}^\\dagger = U_{CN}', why: 'The table is real and symmetric, so its adjoint is itself.' },
        { tex: 'U_{CN}^2|x, y\\rangle = |x, y \\oplus x \\oplus x\\rangle = |x, y\\rangle', why: 'XOR with the same bit twice gives the bit back, so U_CN² fixes every basis ket.' },
        {
          tex: 'U_{CN}^\\dagger U_{CN} = U_{CN}^2 = I',
          why: 'Squaring to I on every basis ket means U_CN² = I; with U_CN† = U_CN this is also U_CN†U_CN = I, so U_CN is unitary.',
          claims: [claim('q4CnotUnitary', 'CNOT is unitary', () => V.q4CnotUnitary === 1), claim('q4Cnot2', 'CNOT² = I', () => V.q4Cnot2 === 1)],
          view: amp({ state: { circuit: C_CX10, upTo: 1 }, mode: 'probability' }),
          viewCaption: 'CNOT|10⟩’s chances: all in |11⟩, ready to flip right back.',
        },
      ],
      formal: [
        { tex: 'U_{CN} = |0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes X', why: 'eq. 1.9 in operator form.', view: circ({ circuit: C_CX10, upTo: 1 }), viewCaption: 'CNOT’s circuit.' },
        {
          tex: 'U_{CN}^2 = |0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes X^2 = I',
          why: 'Cross terms vanish, X² = I; U_CN† = U_CN.',
          claims: [claim('q4CnotUnitary', 'CNOT is unitary', () => V.q4CnotUnitary === 1), claim('q4Cnot2', 'CNOT² = I', () => V.q4Cnot2 === 1)],
          view: amp({ state: { circuit: C_CX10, upTo: 1 } }),
          viewCaption: 'CNOT|10⟩’s bars.',
        },
      ],
    },
  },
  {
    id: 'q4-cnot:b4',
    phase: 'lecture',
    text: 'Any gate U can be controlled the same way: apply U to the target only when the control is |1⟩. With U = Z this is CZ, which flips the sign of |11⟩ and nothing else. CZ does not care which wire is the control.',
    formal:
      '$C\\text{-}U = |0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes U$, a [[qc-controlled-gate|controlled gate]] (N&C Fig. 1.8, p. 24). $CZ = \\mathrm{diag}(1,1,1,-1)$ is symmetric in its wires (notes L5 p. 25: $CZ = \\mathrm{diag}(1,1,1,-1)$), and $CZ = (I \\otimes H)\\,\\mathrm{CNOT}\\,(I \\otimes H)$ (Bergou ⚑ Problem 1.4(b); notes L5 p. 25, the same identity turned round).',
    caption: 'CZ on |+⟩|+⟩: only the |11⟩ bar changes sign',
    captionFormal: '(I ⊗ H) CNOT (I ⊗ H) = CZ',
    stage: split(circ({ circuit: C_CZH, upTo: { from: 0, to: 3 } }), amp({ state: { circuit: C_CZH, upTo: { from: 0, to: 3 } } })),
    fidelity: ['qc-amp-hue-is-phase'],
    introduces: ['qc-controlled-gate'],
    claims: [
      claim('q4CZpp3', 'CZ on |+⟩|+⟩: only the |11⟩ bar changes sign, to −0.5', () => close(V.q4CZpp3, -0.5)),
      claim('q4CZ', 'CZ = diag(1, 1, 1, −1)', () => V.q4CZ === 1),
      claim('q4CZSym', 'CZ does not care which wire is the control', () => V.q4CZSym === 1),
      claim('q4CZfromCnot', 'CZ = (I ⊗ H) CNOT (I ⊗ H)', () => V.q4CZfromCnot === 1),
      cCZcircuit,
    ],
  },
  {
    id: 'q4-cnot:b5',
    phase: 'books',
    text: 'Bergou explains why AND has no quantum version: output 0 comes from three inputs, 00, 01 and 10, so the input cannot be recovered. CNOT keeps its control, so its output always tells you its input.',
    formal:
      'Unitary ⇒ invertible, so an irreversible classical gate (AND; XOR alone, N&C p. 21) has no direct quantum version (Bergou p. 3; notes L5 p. 24: AND discards information). Keeping the control makes XOR reversible; N&C’s Toffoli gate does the same for AND (Unit 5.2).',
    caption: 'AND gives 0 for three of its four inputs',
    stage: split(circ({ circuit: C_CX10, upTo: { from: 0, to: 1 } }), amp({ state: { circuit: C_CX10, upTo: { from: 0, to: 1 } } })),
    refs: [bergou('p. 3', 'AND has no direct quantum version: three of its four inputs give the same output.'), nc('pp. 21, 29', 'XOR alone is not reversible; the Toffoli gate embeds AND reversibly (§1.4.1).')],
    claims: [claim('q4AndZeros', 'AND gives 0 for 3 of its 4 inputs', () => V.q4AndZeros === 3)],
  },
  {
    id: 'q4-cnot:b6',
    phase: 'clue',
    text: 'CNOT turns |00⟩ into |00⟩ and |10⟩ into |11⟩: it copies a bit onto a blank target. Feed it ψ and a blank |0⟩. Do you get two copies of ψ?',
    formal: 'CNOT($|x\\rangle|0\\rangle$) = $|x\\rangle|x\\rangle$ for $x \\in \\{0, 1\\}$. Does CNOT($\\psi \\otimes |0\\rangle$) equal $\\psi \\otimes \\psi$?',
    stage: split(circ({ circuit: C_COPY, upTo: 1 }), amp({ state: { circuit: C_COPY, upTo: 1 } })),
    reveal: {
      text: `No. Linearity gives ${d(V.q4CopyOut0, 3)}|00⟩ + ${d(V.q4CopyOut3, 1)}|11⟩, two bars. Two copies of ψ would fill all four bars: ${d(V.q4PsiPsi0, 2)}, ${d(V.q4PsiPsi1, 3)}, ${d(V.q4PsiPsi1, 3)}, ${d(V.q4PsiPsi3, 2)}. The bit was copied; the qubit was not.`,
      formal: `No: $a|00\\rangle + b|11\\rangle \\ne a^2|00\\rangle + ab(|01\\rangle + |10\\rangle) + b^2|11\\rangle$ unless $ab = 0$ (N&C eqs. 1.21–1.22, pp. 24–25). No circuit copies an unknown state: the no-cloning theorem, proved in a later chapter.`,
      caption: `CNOT(ψ, 0): (${d(V.q4CopyOut0, 3)}, 0, 0, ${d(V.q4CopyOut3, 1)}); ψ ⊗ ψ: (${d(V.q4PsiPsi0, 2)}, ${d(V.q4PsiPsi1, 3)}, ${d(V.q4PsiPsi1, 3)}, ${d(V.q4PsiPsi3, 2)})`,
      stage: split(circ({ circuit: C_COPY, upTo: { from: 1, to: 2 } }), amp({ state: { circuit: C_COPY, upTo: { from: 1, to: 2 } } })),
      claims: [
        claim('q4CopyBasis', 'CNOT copies |0⟩ and |1⟩ onto a blank target', () => V.q4CopyBasis === 1),
        claim('q4CopyOut0', 'CNOT(ψ, 0)’s |00⟩ amplitude is 0.866', () => close(V.q4CopyOut0, 0.866, 1e-3)),
        claim('q4CopyOut3', 'CNOT(ψ, 0)’s |11⟩ amplitude is 0.5', () => close(V.q4CopyOut3, 0.5)),
        claim('q4PsiPsi0', 'ψ ⊗ ψ’s |00⟩ amplitude is 0.75', () => close(V.q4PsiPsi0, 0.75)),
        claim('q4PsiPsi1', 'ψ ⊗ ψ’s |01⟩ and |10⟩ amplitudes are 0.433', () => close(V.q4PsiPsi1, 0.433, 1e-3)),
        claim('q4PsiPsi3', 'ψ ⊗ ψ’s |11⟩ amplitude is 0.25', () => close(V.q4PsiPsi3, 0.25)),
        claim('q4CopyFails', 'CNOT(ψ, 0) is not ψ ⊗ ψ', () => V.q4CopyFails === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q4-circuits — Circuits: wires are time, products run backwards                                  */
/* ---------------------------------------------------------------------------------------------- */

const circuits: Beat[] = [
  {
    id: 'q4-circuits:b1',
    phase: 'lecture',
    text: 'A [[qc-circuit|circuit]] draws each qubit as a wire and each gate as a box on it. Read it left to right: that is the order in time. The matrices multiply the other way round: H then Z is the product ZH. <<qc-l3-operators|operators are machines that turn states into states>>.',
    formal:
      'Wires are time or a moving carrier, not copper, and inputs default to $|0\\ldots0\\rangle$ (N&C p. 23). A circuit $U_1$ then $U_2$ is the operator $U_2U_1$: H then Z sends $|0\\rangle$ to $|{-}\\rangle$, and Z then H sends it to $|{+}\\rangle$.',
    caption: `H then Z: |0⟩ ends as (${d(V.q4HthenZ0, 3)}, ${d(V.q4HthenZ1, 3)})`,
    captionFormal: 'the circuit’s matrix is ZH ≠ HZ',
    stage: split(circ({ circuit: C_HZ, upTo: { from: 0, to: 2 } }), amp({ state: { circuit: C_HZ, upTo: { from: 0, to: 2 } } })),
    fidelity: ['qc-circuit-wires-are-time'],
    introduces: ['qc-circuit'],
    derivation: {
      result: 'U_{\\text{circuit}} = U_2U_1',
      ground: [
        { tex: '|\\psi_1\\rangle = U_1|\\psi_0\\rangle', why: 'The first box acts first, on the input.', view: circ({ circuit: C_HZ, upTo: { from: 0, to: 1 } }), viewCaption: 'The circuit, up to the first box.' },
        { tex: '|\\psi_2\\rangle = U_2|\\psi_1\\rangle', why: 'The second box acts on what the first produced.' },
        { tex: '|\\psi_2\\rangle = U_2U_1|\\psi_0\\rangle', why: 'Put the first step into the second.' },
        { tex: 'ZH|0\\rangle = Z|{+}\\rangle = |{-}\\rangle', why: 'A worked check: H then Z on |0⟩.', claims: [claim('q4CircOrder', 'the circuit H then Z is the matrix ZH', () => V.q4CircOrder === 1)] },
        {
          tex: 'U_{\\text{circuit}} = U_2U_1',
          why: 'The box drawn last is written first: wires run left to right, products right to left.',
          view: amp({ state: { circuit: C_HZ, upTo: 2 } }),
          viewCaption: 'The finished circuit’s bars: |0⟩ ends in |−⟩.',
        },
      ],
      formal: [
        { tex: 'ZH \\neq HZ', why: '$ZH|0\\rangle = |{-}\\rangle$ but $HZ|0\\rangle = |{+}\\rangle$.', claims: [claim('q4CircOrder', 'the circuit H then Z is the matrix ZH', () => V.q4CircOrder === 1)], view: circ({ circuit: C_HZ, upTo: 2 }), viewCaption: 'The circuit in full.' },
        { tex: 'U_{\\text{circuit}} = U_K \\cdots U_2U_1', why: 'Composition of maps.', view: amp({ state: { circuit: C_HZ, upTo: 2 }, mode: 'probability' }), viewCaption: 'Its final chances.' },
      ],
    },
    claims: [
      claim('q4HthenZ0', 'H then Z on |0⟩: |0⟩ amplitude 0.707', () => close(V.q4HthenZ0, 0.7071, 1e-3)),
      claim('q4HthenZ1', 'H then Z on |0⟩: |1⟩ amplitude −0.707', () => close(V.q4HthenZ1, -0.7071, 1e-3)),
      claim('q4ZthenH0', 'Z then H on |0⟩: |0⟩ amplitude 0.707', () => close(V.q4ZthenH0, 0.7071, 1e-3)),
      claim('q4ZthenH1', 'Z then H on |0⟩: |1⟩ amplitude 0.707', () => close(V.q4ZthenH1, 0.7071, 1e-3)),
      claim('q4CircOrderWrong', 'the circuit is not the matrix HZ', () => V.q4CircOrderWrong === 0),
    ],
  },
  {
    id: 'q4-circuits:b2',
    phase: 'lecture',
    text: 'H on the top qubit, then CNOT. From |00⟩, H makes (|00⟩ + |10⟩)/√2. CNOT flips the target only in the |10⟩ part, giving (|00⟩ + |11⟩)/√2. This [[qc-bell-state|Bell state]] is called Φ⁺. CNOT itself is not a product A ⊗ B, which is why it can entangle.',
    formal:
      'N&C Fig. 1.12 (p. 26): $(H \\otimes I)$ then CNOT maps $|00\\rangle \\mapsto (|00\\rangle + |11\\rangle)/\\sqrt2 = \\Phi^+$ (notes, N&C: β₀₀; Bergou: Ψ₊); the other inputs give N&C’s eq. 1.27 (notes L5 pp. 21, 23). $\\Phi^+$ fails Unit 4.3’s product test; Chapter Q6 builds the full Bell basis from here.',
    caption: 'after H: bars at |00⟩, |10⟩; after CNOT: at |00⟩, |11⟩',
    captionFormal: `Φ⁺ = (${d(V.q4Bell0, 3)}, 0, 0, ${d(V.q4Bell3, 3)})`,
    stage: split(circ({ circuit: C_BELL, upTo: { from: 0, to: 2 } }), amp({ state: { circuit: C_BELL, upTo: { from: 0, to: 2 } } })),
    introduces: ['qc-bell-state'],
    derivation: {
      result: 'U_{CN}(H \\otimes I)|00\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle)',
      ground: [
        { tex: '|00\\rangle = |0\\rangle \\otimes |0\\rangle', why: 'The input, one qubit per wire.' },
        {
          tex: '(H \\otimes I)|00\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle) \\otimes |0\\rangle',
          why: 'H acts on the top qubit only.',
          view: circ({ circuit: C_BELL, upTo: 1 }),
          viewCaption: 'The circuit after H alone.',
        },
        { tex: '= \\tfrac1{\\sqrt2}(|00\\rangle + |10\\rangle)', why: 'Multiply out with Unit 4.3’s product rule.' },
        { tex: 'U_{CN}|00\\rangle = |00\\rangle,\\quad U_{CN}|10\\rangle = |11\\rangle', why: 'CNOT’s truth table, one term at a time.' },
        {
          tex: 'U_{CN}\\tfrac1{\\sqrt2}(|00\\rangle + |10\\rangle) = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle)',
          why: 'A gate is linear, so it acts on each term.',
          claims: [claim('q4Bell0', 'H then CNOT on |00⟩: |00⟩ amplitude 0.707', () => close(V.q4Bell0, 0.7071, 1e-3)), claim('q4Bell3', 'H then CNOT on |00⟩: |11⟩ amplitude 0.707', () => close(V.q4Bell3, 0.7071, 1e-3))],
          view: amp({ state: { circuit: C_BELL, upTo: 2 } }),
          viewCaption: 'Φ⁺’s bars: |00⟩ and |11⟩ only.',
        },
      ],
      formal: [
        {
          tex: 'U_{CN}(H \\otimes I)|xy\\rangle = \\tfrac1{\\sqrt2}\\big(|0, y\\rangle + (-1)^x|1, \\bar y\\rangle\\big)',
          why: 'N&C eq. 1.27, all four inputs.',
          claims: [claim('q4BellFormula', 'N&C’s eq. 1.27 holds on all four inputs', () => V.q4BellFormula === 1)],
          view: amp({ state: { bell: '00+11' } }),
          viewCaption: 'Φ⁺’s bars, drawn directly.',
        },
        {
          tex: 'U_{CN}(H \\otimes I)|00\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle)',
          why: 'The x = 0, y = 0 case: linearity and eq. 1.9 give Φ⁺.',
          claims: [claim('q4Bell0', 'H then CNOT on |00⟩: |00⟩ amplitude 0.707', () => close(V.q4Bell0, 0.7071, 1e-3)), claim('q4Bell3', 'H then CNOT on |00⟩: |11⟩ amplitude 0.707', () => close(V.q4Bell3, 0.7071, 1e-3))],
          view: circ({ circuit: C_BELL, upTo: 2 }),
          viewCaption: 'The full two-gate circuit.',
        },
      ],
    },
    claims: [
      claim('q4BellMid0', 'after H alone: the |00⟩ bar is 0.707', () => close(V.q4BellMid0, 0.7071, 1e-3)),
      claim('q4BellMid2', 'after H alone: the |10⟩ bar is 0.707', () => close(V.q4BellMid2, 0.7071, 1e-3)),
      claim('q4BellIsPhi', 'the result is Φ⁺', () => V.q4BellIsPhi === 1),
    ],
  },
  {
    id: 'q4-circuits:b3',
    phase: 'lecture',
    text: 'Three CNOTs, the middle one upside down, swap two qubits. Follow |10⟩: it becomes |11⟩, then |01⟩, and the last CNOT leaves |01⟩ alone. In bits: a, b becomes a, a ⊕ b, then b, a ⊕ b, then b, a.',
    formal:
      '$|a, b\\rangle \\mapsto |a, a \\oplus b\\rangle \\mapsto |b, a \\oplus b\\rangle \\mapsto |b, a\\rangle$ (N&C eq. 1.20, Fig. 1.7, p. 23; Bergou ⚑ Problem 1.4(a)), so $\\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01}$ is the [[qc-swap-gate|SWAP]] gate.',
    caption: '|10⟩ → |11⟩ → |01⟩ → |01⟩',
    stage: split(circ({ circuit: C_SWAP3, upTo: { from: 0, to: 3 } }), amp({ state: { circuit: C_SWAP3, upTo: { from: 0, to: 3 } } })),
    derivation: {
      result: '\\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01} = \\mathrm{SWAP}',
      ground: [
        { tex: '|a, b\\rangle \\to |a, a \\oplus b\\rangle', why: 'First CNOT: the top controls, and the bottom becomes a ⊕ b.', view: circ({ circuit: C_SWAP3, upTo: 1 }), viewCaption: 'The circuit after the first CNOT.' },
        { tex: '\\to |a \\oplus (a \\oplus b), a \\oplus b\\rangle', why: 'Second CNOT: the bottom controls, and the top is XORed with it.' },
        { tex: 'a \\oplus (a \\oplus b) = b', why: 'XOR with a twice cancels, since a ⊕ a = 0.' },
        { tex: '\\to |b, (a \\oplus b) \\oplus b\\rangle = |b, a\\rangle', why: 'Third CNOT: the top, now b, controls; b ⊕ b cancels.' },
        { tex: '|a, b\\rangle \\to |b, a\\rangle', why: 'True for all four basis states, so by linearity for every state.' },
        {
          tex: '\\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01} = \\mathrm{SWAP}',
          why: 'A gate agreeing with SWAP on every basis ket is SWAP.',
          claims: [claim('q4SwapIsSwap', 'three crossed CNOTs make SWAP', () => V.q4SwapIsSwap === 1)],
          view: amp({ state: { circuit: C_SWAP3, upTo: 3 } }),
          viewCaption: 'The final bars: |10⟩ became |01⟩.',
        },
      ],
      formal: [
        { tex: '\\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01}|a, b\\rangle = |b, a\\rangle', why: 'N&C eq. 1.20.', view: circ({ circuit: C_SWAP3, upTo: 3 }), viewCaption: 'The full three-CNOT circuit.' },
        {
          tex: '\\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01} = \\mathrm{SWAP}',
          why: 'Equal on a basis, hence equal.',
          claims: [claim('q4SwapIsSwap', 'three crossed CNOTs make SWAP', () => V.q4SwapIsSwap === 1)],
          view: amp({ state: { circuit: C_SWAP3, upTo: 3 }, mode: 'probability' }),
          viewCaption: 'Its chances, all on |01⟩.',
        },
      ],
    },
  },
  {
    id: 'q4-circuits:b4',
    phase: 'lecture',
    text: 'CNOT and the one-qubit gates are enough for everything: any unitary on any number of qubits can be built from them. Bergou and Nielsen and Chuang state this here without proof. CZ from H, CNOT and H is one small example.',
    formal:
      'CNOT together with all one-qubit unitaries is a [[qc-universal-gate-set|universal set]] (Bergou p. 5; N&C p. 22, proof in N&C §4.5), the quantum counterpart of NAND’s universality. N&C Box 1.1, eq. 1.17, p. 20 already reduces one-qubit gates to $R_z$ and $R_y$; notes L5 p. 25 writes the same CZ–CNOT identity the other way round, $\\mathrm{CNOT} = (1\\otimes H)\\mathrm{CZ}(1\\otimes H)$ (HW2 P3).',
    caption: 'CZ = H, CNOT, H on the bottom wire',
    stage: split(circ({ circuit: C_CZH }), amp({ state: { circuit: C_CZH } })),
    claims: [cCZcircuit],
  },
  {
    id: 'q4-circuits:b5',
    phase: 'books',
    text: 'Nielsen and Chuang list three things quantum circuits never do: loop back, join two wires into one, or split one wire into copies. Joining loses information, and copying is what Unit 4.4’s clue showed to fail.',
    formal: 'Quantum circuits are acyclic and forbid FANIN (not reversible) and FANOUT (no-cloning), N&C p. 23. A measurement is a meter with a double-line classical output (Fig. 1.10, Unit 4.6).',
    caption: 'no loops, no joins, no copies',
    stage: split(circ({ circuit: C_BELL }), amp({ state: { circuit: C_BELL } })),
    refs: [nc('p. 23', 'Circuits are acyclic and forbid FANIN and FANOUT; a measurement is a meter with a double classical wire.')],
  },
  {
    id: 'q4-circuits:b6',
    phase: 'clue',
    text: 'Put an H on both wires before and after a CNOT. Is the top wire still the control?',
    formal: 'Is $(H \\otimes H)\\,\\mathrm{CNOT}_{01}\\,(H \\otimes H)$ a CNOT whose control is qubit 0?',
    stage: split(circ({ circuit: C_HHCX, upTo: 0 }), amp({ state: { circuit: C_HHCX, upTo: 0 } })),
    reveal: {
      text: 'No. The result is a CNOT pointing the other way: the bottom wire controls the top. Here |01⟩ comes out as |11⟩, so the top qubit flipped. Seen through Hadamards, control and target trade places.',
      formal: 'No: $(H \\otimes H)\\,\\mathrm{CNOT}_{01}\\,(H \\otimes H) = \\mathrm{CNOT}_{10}$, since $HXH = Z$ and CZ is symmetric. In the $|{\\pm}\\rangle$ basis control and target exchange roles.',
      caption: '|01⟩ → |11⟩: the top qubit flipped',
      stage: split(circ({ circuit: C_HHCX, upTo: { from: 0, to: 3 } }), amp({ state: { circuit: C_HHCX, upTo: { from: 0, to: 3 } } })),
      claims: [
        claim('q4HHcx01', '(H⊗H) CNOT (H⊗H) on |01⟩ gives |11⟩', () => V.q4HHcx01 === 1),
        claim('q4HHcnot', '(H⊗H) CNOT (H⊗H) = CNOT with the wires reversed', () => V.q4HHcnot === 1),
        claim('q4HXH', 'HXH = Z', () => V.q4HXH === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q4-measure — Reading a register, whole or one qubit                                             */
/* ---------------------------------------------------------------------------------------------- */

const measure: Beat[] = [
  {
    id: 'q4-measure:b1',
    phase: 'lecture',
    text: 'Reading a register gives a string x with chance |c_x|², where c_x is the amplitude of |x⟩. The state becomes |x⟩. In a circuit, a reading is a meter; a double line carries the bit it produces. For ψ ⊗ |+⟩: 37.5 % each for 00 and 01, 12.5 % each for 10 and 11.',
    formal: 'Outcome $x$ w.p. $|\\alpha_x|^2$, post-state $|x\\rangle$ (N&C p. 16); the meter and the double-line classical wire are N&C Fig. 1.10 (p. 24).',
    caption: `ψ ⊗ |+⟩ read: ${pct(V.q4ProdMeasure0)}, ${pct(V.q4ProdMeasure0)}, ${pct(V.q4ProdMeasure2)}, ${pct(V.q4ProdMeasure2)}`,
    stage: split(circ({ circuit: C_PRODM }), amp({ state: { circuit: C_PRODM }, mode: 'probability' })),
    claims: [
      claim('q4ProdMeasure0', 'ψ ⊗ |+⟩ reads 00 or 01 with chance 0.375 each', () => close(V.q4ProdMeasure0, 0.375)),
      claim('q4ProdMeasure2', 'ψ ⊗ |+⟩ reads 10 or 11 with chance 0.125 each', () => close(V.q4ProdMeasure2, 0.125)),
    ],
  },
  {
    id: 'q4-measure:b2',
    phase: 'lecture',
    text: 'You can read just the first qubit. The chance of 0 is the chance of |00⟩ plus that of |01⟩. Keep only those two amplitudes and rescale them to length 1. What is left for the second qubit depends on the reading.',
    formal: `$P(q_0 = 0) = |\\alpha_{00}|^2 + |\\alpha_{01}|^2$, post-state $(\\alpha_{00}|00\\rangle + \\alpha_{01}|01\\rangle)/\\sqrt{|\\alpha_{00}|^2 + |\\alpha_{01}|^2}$ (N&C eq. 1.6, p. 16). For $${d(V.q4M2pre0, 3)}(|00\\rangle + |01\\rangle) + ${d(V.q4Prod2, 3)}(|10\\rangle - |11\\rangle)$: 0 w.p. ${pct(V.q4M2p0)} leaves $|0\\rangle|{+}\\rangle$, 1 w.p. ${pct(V.q4M2p1)} leaves $|1\\rangle|{-}\\rangle$.`,
    caption: 'read 1 (chance 25 %): the second qubit is left in |−⟩',
    captionFormal: 'post-states |0⟩|+⟩ and |1⟩|−⟩',
    stage: split(circ({ circuit: C_M2, outcomes: '1' }), amp({ state: { circuit: C_M2, outcomes: '1' } })),
    introduces: ['qc-partial-measurement'],
    claims: [
      claim('q4M2pre0', 'the pre-measurement state’s |00⟩ amplitude is 0.612', () => close(V.q4M2pre0, 0.6124, 1e-3)),
      claim('q4M2pre3', 'the pre-measurement state’s |11⟩ amplitude is −0.354', () => close(V.q4M2pre3, -0.3536, 1e-3)),
      claim('q4Prod2', 'the size of that amplitude is 0.354', () => close(V.q4Prod2, 0.3536, 1e-3)),
      claim('q4M2p0', 'reading qubit 0 gives 0 with chance 75 %', () => close(V.q4M2p0, 0.75)),
      claim('q4M2p1', 'reading qubit 0 gives 1 with chance 25 %', () => close(V.q4M2p1, 0.25)),
      claim('q4M2post0IsPlus', 'reading 0 leaves the second qubit in |+⟩', () => V.q4M2post0IsPlus === 1),
      claim('q4M2post1IsMinus', 'reading 1 leaves the second qubit in |−⟩', () => V.q4M2post1IsMinus === 1),
    ],
  },
  {
    id: 'q4-measure:b3',
    phase: 'lecture',
    text: 'Read the first qubit of Φ⁺: 0 or 1, half the time each. After a 0 the state is |00⟩; after a 1 it is |11⟩. So reading the second qubit always repeats the first.',
    formal:
      'For $\\Phi^+$, $P(q_0 = 0) = P(q_0 = 1) = \\tfrac12$ with post-states $|00\\rangle$, $|11\\rangle$: the outcomes are perfectly correlated (N&C p. 17; notes L5 pp. 25–26, eqs. 2.3–2.4, the Bell basis β_xy specialized to β₀₀). That these correlations beat any classical model is a later chapter’s result.',
    caption: 'Φ⁺ read: 00 or 11, never 01 or 10',
    stage: split(circ({ circuit: C_BELLM }), amp({ state: { circuit: C_BELLM }, mode: 'probability' })),
    claims: [
      claim('q4BellM0', 'reading either qubit of Φ⁺ gives 0 with chance 0.5', () => close(V.q4BellM0, 0.5)),
      claim('q4BellM1', 'reading either qubit of Φ⁺ gives 1 with chance 0.5', () => close(V.q4BellM1, 0.5)),
      claim('q4BellMpost0', 'reading 0 leaves Φ⁺ in |00⟩', () => V.q4BellMpost0 === 1),
      claim('q4BellMpost1', 'reading 1 leaves Φ⁺ in |11⟩', () => V.q4BellMpost1 === 1),
    ],
  },
  {
    id: 'q4-measure:b4',
    phase: 'books',
    text: 'A qubit can also be read in the basis |+⟩, |−⟩. Nielsen and Chuang rewrite ψ = α|0⟩ + β|1⟩ in that basis, and the chance of + is |α + β|²/2. For ψ it is 93.3 %, Unit 3.1’s number. In a circuit: H, then an ordinary reading.',
    formal:
      'ψ = $((\\alpha + \\beta)/\\sqrt2)|{+}\\rangle + ((\\alpha - \\beta)/\\sqrt2)|{-}\\rangle$ (N&C eq. 1.19, p. 22), so $P({+}) = |\\alpha + \\beta|^2/2 = |\\langle{+x}|\\psi\\rangle|^2 = 0.933$. H maps $|{\\pm}\\rangle$ to $|0\\rangle, |1\\rangle$, so reading after H is reading in $|{\\pm}\\rangle$ <<qc-l2-three-bases|three bases, each blind to the others>>.',
    caption: 'ψ in the ± basis: 93.3 % and 6.7 %',
    stage: split(circ({ circuit: C_PSIH }), amp({ state: { circuit: C_PSIH }, mode: 'probability' })),
    refs: [nc('eq. 1.19, p. 22', 'ψ rewritten in the |±⟩ basis; the chance of + is |α + β|²/2.')],
    claims: [
      claim('q4PlusBasisP0', 'ψ in the ± basis reads + with chance 93.3 %', () => close(V.q4PlusBasisP0, 0.933, 1e-3)),
      claim('q4PlusBasisP1', 'ψ in the ± basis reads − with chance 6.7 %', () => close(V.q4PlusBasisP1, 0.067, 1e-3)),
      claim('q4PlusBasisViaH', 'reading after H matches reading in the ± basis directly', () => V.q4PlusBasisViaH === 1),
      claim('q4PlusFormula', '|α + β|²/2 = 0.933', () => close(V.q4PlusFormula, 0.933, 1e-3)),
    ],
  },
  {
    id: 'q4-measure:b5',
    phase: 'clue',
    text: 'Start from 0.866|00⟩ + 0.5|11⟩, Unit 4.4’s failed copy, and read the first qubit. Does the second qubit still carry 0.866 and 0.5?',
    formal: 'After measuring $q_0$ of $a|00\\rangle + b|11\\rangle$, does $q_1$ keep any trace of $a$ and $b$?',
    stage: split(circ({ circuit: C_COPY }), amp({ state: { circuit: C_COPY } })),
    claims: [claim('q4PsiAlpha', 'the |00⟩ amplitude here is 0.866', () => close(V.q4PsiAlpha, 0.866, 1e-3))],
    reveal: {
      text: 'No. After a 0 the second qubit is exactly |0⟩; after a 1, exactly |1⟩. The numbers 75 % and 25 % show only in how often each happens.',
      formal: `No: the post-states are $|00\\rangle$ and $|11\\rangle$, w.p. $|a|^2 = ${d(V.q4CopyRead0, 2)}$ and $|b|^2 = ${d(V.q4CopyRead1, 2)}$; the amplitudes are gone after one reading (N&C p. 25), another way to see that no copy was made.`,
      caption: 'read 0 (75 %): |00⟩; read 1 (25 %): |11⟩',
      stage: split(circ({ circuit: C_COPYM, outcomes: '0' }), amp({ state: { circuit: C_COPYM, outcomes: '0' } })),
      claims: [
        claim('q4CopyRead0', 'reading qubit 0 gives 0 with chance 75 %', () => close(V.q4CopyRead0, 0.75)),
        claim('q4CopyRead1', 'reading qubit 0 gives 1 with chance 25 %', () => close(V.q4CopyRead1, 0.25)),
        claim('q4CopyReadPost0', 'reading 0 leaves |00⟩', () => V.q4CopyReadPost0 === 1),
        claim('q4CopyReadPost1', 'reading 1 leaves |11⟩', () => V.q4CopyReadPost1 === 1),
      ],
    },
  },
]

export const Q4_STORY: Record<string, Beat[]> = {
  'q4-qubit': qubit,
  'q4-one-qubit-gates': oneQubitGates,
  'q4-registers': registers,
  'q4-cnot': cnotUnit,
  'q4-circuits': circuits,
  'q4-measure': measure,
}
