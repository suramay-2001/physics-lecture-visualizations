/**
 * Physics 709 Lecture 6 notes (N6), a short companion: sections II.D.1 and II.D.2 (preparing and projecting on Bell states, Eq. 2.5), II.E
 * (commuting stabilizers, Eqs. 2.6 to 2.8) and II.F (the GHZ state, Eqs. 2.9 and 2.10), printed pages 29 to 34 of the new edition. The prose
 * paraphrases the notes and links the Chapter Q6 and Q7 units that teach each section; the numbers are Chapter Q7's own (q7GhzP000, q7Quarter, q7Eighth).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d } from '../Q7.values'

export const N6: Lecture = notesLecture({
  number: 6,
  title: 'Preparing Bell states, stabilizers and GHZ',
  date: '2026-09-23',
  topics: [
    'preparing and projecting on Bell states',
    'the two commuting parities behind the Bell measurement',
    'the GHZ state',
    'bit-string probabilities in the x and y bases',
  ],
  length: 'short',
  symbols: {
    '|\\cdot\\rangle': 'n6-bell-circuit:b1',
    '|xy\\rangle': 'n6-bell-circuit:b1',
    '|\\beta_xy\\rangle': 'n6-bell-circuit:b1',
    '\\langle\\cdot|': 'n6-bell-circuit:b1',
    '\\Pi_xy': 'n6-bell-circuit:b1',
    '\\sigma_z': 'n6-parities:b1',
    '\\sigma_x': 'n6-parities:b1',
    '|000\\rangle': 'n6-ghz:b1',
    '|111\\rangle': 'n6-ghz:b1',
    '\\zeta_k': 'n6-bit-strings:b1',
    's': 'n6-bit-strings:b1',
    '\\zeta_1': 'n6-bit-strings:b1',
    '\\zeta_2': 'n6-bit-strings:b1',
    '\\zeta_3': 'n6-bit-strings:b1',
  },
  sections: [
    {
      id: 'n6-bell-circuit',
      label: '§II.D.1–D.2',
      title: 'Preparing and projecting on Bell states',
      pages: 'p. 29',
      summary: 'The Bell measurement circuit run backwards prepares the Bell states, and the measurement is a complete set of projectors.',
      body: [
        {
          text: 'Every gate is unitary, so the circuit that reads the Bell basis prepares it when run backwards: a Hadamard gate on the first [[qubit|qubit]] of $|xy\\rangle$ and then a CNOT give $|\\beta_{xy}\\rangle$. The measurement is the set of projectors $\\Pi_{xy} = |\\beta_{xy}\\rangle\\langle\\beta_{xy}|$, which sum to the identity (Eq. 2.5; <<qc-q6-bell-circuit|Unit 6.5>>).',
        },
      ],
    },
    {
      id: 'n6-parities',
      label: '§II.E',
      title: 'Commuting stabilizers',
      pages: 'pp. 29–31',
      summary: 'The two detectors of the Bell measurement read two commuting two-qubit parities, not single-qubit properties.',
      body: [
        {
          text: 'The two detectors do not measure single qubits. Pulling $\\sigma_z$ back through the circuit shows that they read the commuting parities $\\sigma_x\\sigma_x$ and $\\sigma_z\\sigma_z$ (Eq. 2.6), and the Bell states are their joint eigenvectors with eigenvalues $(-1)^x$ and $(-1)^y$ (Eq. 2.7). These two parities generate the [[qc-stabilizer|stabilizer]] of the Bell states (<<qc-q6-parities|Unit 6.6>>).',
        },
      ],
    },
    {
      id: 'n6-ghz',
      label: '§II.F.1',
      title: 'The GHZ state',
      pages: 'p. 31',
      summary: 'The three-qubit GHZ state is perfectly correlated in the computational basis, and in the x and y bases only the product of the three outcomes is fixed.',
      body: [
        {
          text: `The GHZ state $(|000\\rangle + |111\\rangle)/\\sqrt2$ gives only the strings 000 and 111, each with chance ${d(V.q7GhzP000, 1)}. Measured in the x or y basis, every single outcome is random, but the product of the three is fixed (<<qc-q7-ghz|Unit 7.1>>).`,
          claims: [claim('q7GhzP000', 'the GHZ state gives the string 000 with chance one half', () => close(V.q7GhzP000, 0.5, 1e-9))],
        },
      ],
    },
    {
      id: 'n6-bit-strings',
      label: '§II.F.2',
      title: 'Bit-string probabilities',
      pages: 'pp. 31–34',
      summary: 'One phase factor per outcome gives every bit-string chance at once, and the number of y measurements decides whether a parity is fixed.',
      body: [
        {
          text: `Each bracket carries a phase factor $\\zeta_k$ (Eq. 2.9), and with $s = \\zeta_1\\zeta_2\\zeta_3$ (Eq. 2.10) the chance of a string is $\\tfrac{|1+s|^2}{16}$. After an even number of y measurements half the strings occur with chance ${d(V.q7Quarter, 2)} and the rest never; after an odd number all eight have chance ${d(V.q7Eighth, 3)} (<<qc-q7-parity-table|Unit 7.3>>, <<qc-q7-bit-strings|Unit 7.4>>).`,
          claims: [
            claim('q7Quarter', 'each allowed string has chance one quarter', () => close(V.q7Quarter, 0.25, 1e-9)),
            claim('q7Eighth', 'with an odd number of y measurements all eight strings have chance one eighth', () => close(V.q7Eighth, 0.125, 1e-9)),
          ],
        },
      ],
    },
  ],
})
