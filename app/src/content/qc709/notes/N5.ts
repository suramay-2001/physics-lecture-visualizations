/**
 * Physics 709 Lecture 5 notes (N5), a short companion: section II (multiparticle systems), II.A (tensor product), II.B (gates), II.C (the
 * Bell basis) and II.D (the Bell measurement circuit), printed pages 23 to 28 of the new edition, Eqs. 2.1 to 2.4. The prose paraphrases the
 * notes and links the Chapter Q4 and Q6 units that teach each section; the one number is Chapter Q6's own (q6Param10Frac).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d } from '../Q6.values'

export const N5: Lecture = notesLecture({
  number: 5,
  title: 'Composite systems and the Bell basis',
  date: '2026-09-21',
  topics: [
    'multiplicative composition and 2^N amplitudes',
    'product and entangled states',
    'the tensor product of operators',
    'gates as unitary operators',
    'the Bell basis and its measurement circuit',
  ],
  length: 'short',
  symbols: {
    'N': 'n5-composite:b1',
    'n': 'n5-tensor:b1',
    'A': 'n5-tensor:b1',
    'm': 'n5-tensor:b1',
    'B': 'n5-tensor:b1',
    'A_ij': 'n5-tensor:b1',
    '\\otimes': 'n5-tensor:b1',
    'I': 'n5-tensor:b1',
    'U': 'n5-gates:b1',
    '\\dagger': 'n5-gates:b1',
    'H': 'n5-gates:b1',
    '|\\cdot\\rangle': 'n5-gates:b1',
    '|1\\rangle': 'n5-gates:b1',
    '|\\beta_xy\\rangle': 'n5-bell-basis:b1',
    '|0,y\\rangle': 'n5-bell-basis:b1',
    '|1,1\\oplusy\\rangle': 'n5-bell-basis:b1',
    '|xy\\rangle': 'n5-bell-circuit:b1',
  },
  sections: [
    {
      id: 'n5-composite',
      label: '§II',
      title: 'Composite systems',
      pages: 'pp. 23–25',
      summary: 'Classical composition adds while quantum composition multiplies, and most multiparticle states cannot be written as a product of single-particle states.',
      body: [
        {
          text: `Classical composition adds: $N$ bits need $N$ numbers. Quantum composition multiplies: $N$ [[qubit|qubits]] carry $2^N$ amplitudes. A [[qc-product-state|product state]] of two qubits has four real parameters against six for a general state, and at $N = 10$ the fraction falls to ${d(V.q6Param10Frac * 100, 2)} %. Most states are [[qc-entangled|entangled]] (<<qc-q6-many|Unit 6.1>>, <<qc-q6-entangled|Unit 6.3>>).`,
          claims: [claim('q6Param10Frac', 'at ten qubits product states are 0.98 percent of the parameters of a general state', () => close(V.q6Param10Frac, 20 / 2046, 1e-9))],
        },
      ],
    },
    {
      id: 'n5-tensor',
      label: '§II.A',
      title: 'Tensor product',
      pages: 'p. 25',
      summary: 'The tensor product of two matrices is a block matrix, and an operator on one particle acts on the pair through an identity on the other.',
      body: [
        {
          text: 'The tensor product of an $n\\times n$ matrix $A$ with an $m\\times m$ matrix $B$ is the $nm\\times nm$ matrix of blocks $A_{ij}B$ (Eq. 2.1). An operator acting on the first particle alone becomes $A\\otimes I$ on the pair (<<qc-q6-tensor|Unit 6.2>>).',
        },
      ],
    },
    {
      id: 'n5-gates',
      label: '§II.B',
      title: 'Quantum gates',
      pages: 'pp. 25–27',
      summary: 'A gate must keep probabilities summing to one, so it is a unitary and therefore reversible operator.',
      body: [
        {
          text: 'Probabilities must still sum to one after a gate, so a gate is unitary, $U^\\dagger U = I$ (Eq. 2.2), and reversible. The notes recall the Pauli gates, the Hadamard gate $H$, the controlled-NOT, which flips the target when the control is $|1\\rangle$, and the controlled-Z (<<qc-q4-one-qubit-gates|Unit 4.2>>, <<qc-q4-cnot|Unit 4.4>>).',
        },
      ],
    },
    {
      id: 'n5-bell-basis',
      label: '§II.C',
      title: 'The Bell basis',
      pages: 'pp. 27–28',
      summary: 'Four maximally entangled states form a right-angled basis of two qubits, named by the bits that say which sign and which parity they carry.',
      body: [
        {
          text: 'The four [[qc-bell-basis|Bell states]] $|\\beta_{xy}\\rangle = (|0,y\\rangle + (-1)^x|1,1\\oplus y\\rangle)/\\sqrt2$ (Eqs. 2.3–2.4) form an [[qc-orthonormal-basis|orthonormal basis]] of two qubits. Each qubit alone gives a random result while the pair is perfectly correlated (<<qc-q6-bell-basis|Unit 6.4>>).',
        },
      ],
    },
    {
      id: 'n5-bell-circuit',
      label: '§II.D',
      title: 'The Bell measurement circuit',
      pages: 'p. 28',
      summary: 'A controlled-NOT followed by a Hadamard gate turns the Bell basis into the computational basis, so ordinary readout names the Bell state.',
      body: [
        {
          text: 'A CNOT followed by a Hadamard gate on the first qubit maps $|\\beta_{xy}\\rangle$ to $|xy\\rangle$. Measuring both qubits afterwards therefore reads off which Bell state arrived (<<qc-q6-bell-circuit|Unit 6.5>>).',
        },
      ],
    },
  ],
})
