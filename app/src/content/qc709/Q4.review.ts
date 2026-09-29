/**
 * Chapter Q4 review cards: the exam layer in both tracks (P-Q4-story §6). Ground-up ≤ 25 words per sentence, Formal ≤
 * 40; ≤ 5 points each. Every number comes from Q4.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q4.values'

export const Q4_REVIEW: Record<string, ReviewCard> = {
  'q4-qubit': {
    points: [
      'A qubit is α|0⟩ + β|1⟩, with |0⟩ = |+z⟩.',
      'Reading gives 0 or 1 with chances |α|², |β|².',
      'It is a point on the sphere; a phase in front changes nothing.',
      'One reading gives one bit.',
    ],
    equations: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle,\\quad |\\alpha|^2 + |\\beta|^2 = 1',
    trap: 'Thinking a qubit stores its angles for reading: one reading gives one bit.',
    formal: {
      points: ['A unit vector of ℂ² up to phase.', 'Bergou Eq. 1.2 is Unit 3.2’s |θ, φ⟩.', 'Any two-level system can be a qubit.'],
      trap: 'Believing many bits hide inside one qubit: only one measurement’s worth of information ever comes out.',
    },
    claims: [
      claim('q4P0', 'ψ reads 0 with chance 0.75', () => close(V.q4P0, 0.75)),
      claim('q4P1', 'ψ reads 1 with chance 0.25', () => close(V.q4P1, 0.25)),
      claim('q4PhaseSame', 'iψ is the same physical state as ψ', () => V.q4PhaseSame === 1),
    ],
  },
  'q4-one-qubit-gates': {
    points: [
      'A gate is a unitary table; X swaps the amplitudes.',
      'Z flips the sign of |1⟩.',
      'H makes |±⟩ and H² = I.',
      'Gates turn the sphere; P(χ) and R_z(χ) differ by a global phase.',
    ],
    equations: 'X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix},\\quad H = \\tfrac1{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix},\\quad P(\\chi) = e^{i\\chi/2}R_z(\\chi)',
    trap: 'Calling H a “square root of NOT”: H² = I.',
    formal: {
      points: ['X = σ_x, Z = σ_z, H = (X + Z)/√2.', 'H = iR_n(π), n̂ = (x̂ + ẑ)/√2.', 'U = e^{iα}R_z(β)R_y(γ)R_z(δ).'],
      trap: 'Forgetting the global phase in X = iR_x(π): the matrices agree only up to that factor.',
    },
    claims: [
      claim('q4HH', 'H² = I', () => V.q4HH === 1),
      claim('q4HXZ', 'H = (X + Z)/√2', () => V.q4HXZ === 1),
      claim('q4Rz2pi', 'R_z(2π) = −I', () => V.q4Rz2pi === 1),
    ],
  },
  'q4-registers': {
    points: [
      'n qubits have 2ⁿ basis strings.',
      'Side by side, amplitudes multiply.',
      'A label is a binary number.',
      'Not every state is a product.',
    ],
    equations: '|\\Psi\\rangle = \\sum_{x=0}^{2^n - 1} c_x|x\\rangle,\\quad (|a\\rangle \\otimes |b\\rangle)_{ij} = a_ib_j',
    trap: 'Reading bars as places in space: they are basis strings.',
    formal: {
      points: ['Bergou Eqs. 1.3–1.4.', '(|a⟩ ⊗ |b⟩)_ij = a_ib_j, the Kronecker product.', 'Product iff det[c] = 0 (the 2-qubit coefficient matrix).'],
      trap: 'Assuming every two-qubit state factors into two one-qubit states: entangled states like Φ⁺ do not.',
    },
    claims: [
      claim('q4Dim3', 'three qubits have 8 basis states', () => V.q4Dim3 === 8),
      claim('q4ProdDet', 'a product state has coefficient determinant 0', () => close(V.q4ProdDet, 0)),
      claim('q4BellDet', 'the Bell pair has coefficient determinant 0.5', () => close(V.q4BellDet, 0.5)),
    ],
  },
  'q4-cnot': {
    points: [
      'CNOT flips the target when the control is 1.',
      'B becomes B ⊕ A.',
      'Its table is I with two columns swapped, and CNOT² = I.',
      'It copies bits, not qubits.',
    ],
    equations: '|A, B\\rangle \\mapsto |A, B \\oplus A\\rangle,\\quad U_{CN}^2 = I',
    trap: '“CNOT copies ψ”: it gives a|00⟩ + b|11⟩, not two copies.',
    formal: {
      points: ['U_CN = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X.', 'CZ is symmetric; CZ = (I ⊗ H)CNOT(I ⊗ H).', 'Unitary ⇒ reversible, unlike classical AND.'],
      trap: 'Treating linearity as if CNOT acted term by term on a description: CNOT(ψ ⊗ |0⟩) is one linear combination, a|00⟩ + b|11⟩, not a mixture of two runs.',
    },
    claims: [
      claim('q4CnotUnitary', 'CNOT is unitary', () => V.q4CnotUnitary === 1),
      claim('q4Cnot2', 'CNOT² = I', () => V.q4Cnot2 === 1),
      claim('q4CopyFails', 'CNOT(ψ ⊗ |0⟩) is not two copies of ψ', () => V.q4CopyFails === 1),
    ],
  },
  'q4-circuits': {
    points: [
      'Wires are time, read left to right.',
      'Matrices multiply right to left.',
      'H then CNOT makes Φ⁺.',
      'Three CNOTs make a SWAP; CNOT and one-qubit gates make everything.',
    ],
    equations: 'U_{CN}(H \\otimes I)|00\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle),\\quad \\mathrm{SWAP} = \\mathrm{CNOT}_{01}\\mathrm{CNOT}_{10}\\mathrm{CNOT}_{01}',
    trap: 'Writing the matrices in the order the boxes are drawn.',
    formal: {
      points: ['U_circuit = U_K⋯U_1.', 'N&C Eq. 1.27 gives every Bell state from an input.', 'Circuits are acyclic; no FANIN, no FANOUT.'],
      trap: 'Reading a circuit’s matrix left to right: the first box drawn stands next to the ket, so it is the RIGHTMOST factor.',
    },
    claims: [
      claim('q4CircOrder', 'the circuit H then Z is the matrix ZH', () => V.q4CircOrder === 1),
      claim('q4BellIsPhi', 'H then CNOT on |00⟩ gives Φ⁺', () => V.q4BellIsPhi === 1),
      claim('q4SwapIsSwap', 'three CNOTs make SWAP', () => V.q4SwapIsSwap === 1),
    ],
  },
  'q4-measure': {
    points: [
      'Reading a register gives x with chance |c_x|².',
      'Reading one qubit adds up the matching chances and rescales what is left.',
      'Φ⁺’s readings always agree.',
      'H then a reading is a reading in |±⟩.',
    ],
    equations: 'P(q_0 = 0) = |\\alpha_{00}|^2 + |\\alpha_{01}|^2,\\quad P(+) = \\tfrac12|\\alpha + \\beta|^2',
    trap: 'Forgetting to rescale the state left behind.',
    formal: {
      points: ['N&C Eq. 1.6: the marginal and the post-state of one qubit.', 'N&C Eq. 1.19: the ± decomposition.', 'The meter and its double classical wire.'],
      trap: 'Thinking the untouched qubit keeps a trace of the read amplitudes: after one reading it is a definite basis state, nothing more.',
    },
    claims: [
      claim('q4M2p0', 'reading qubit 0 of the split state gives 0 with chance 0.75', () => close(V.q4M2p0, 0.75)),
      claim('q4BellM0', 'reading either qubit of Φ⁺ gives 0 with chance 0.5', () => close(V.q4BellM0, 0.5)),
      claim('q4PlusBasisP0', 'ψ read in the ± basis: chance 0.933 of +', () => close(V.q4PlusBasisP0, 0.933, 1e-3)),
    ],
  },
}
