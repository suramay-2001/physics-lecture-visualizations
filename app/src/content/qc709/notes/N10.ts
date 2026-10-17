/**
 * Physics 709 Lecture 10 notes (N10), a full companion: section III (separable and entangled states, convexity, the criteria of entanglement
 * B.1 to B.3, the von Neumann entropy C and the conditional entropy C.1, the singlet correlation D), printed pages 47 to 55 of the new
 * edition, Eqs. 3.1 to 3.36. The prose paraphrases the notes in their Formal register and links the Chapter Q8, Q9, Q10 and Q12 units that
 * teach each section. Every number is a claim under its chapter's own key (Q9, Q10 or Q12): ruling W12. The worked alpha-family is
 * compared test by test in the section "The family compared" and drawn once, from the engine's state.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d, tf } from '../Q12.values'
import { V as V10 } from '../Q10.values'
import { keyedClaim } from '../../claimKit'
import { V as V9, claim as c9 } from '../Q9.values'

/** Chapter Q10's keys (its values module does not export a claim builder). */
const c10 = keyedClaim<keyof typeof V10>()

/** The alpha-family rho(alpha) = alpha|S><S| + ((1-alpha)/2)(|00><00| + |11><11|) at alpha = 0.6 and 0.8, as a mixture of three pure terms (weights from the engine). */
const FAMILY = (alpha: number) => ({
  mixture: [
    { w: alpha, ket: { bell: 'Psi-' as const } },
    { w: (1 - alpha) / 2, ket: { ket: '00' } },
    { w: (1 - alpha) / 2, ket: { ket: '11' } },
  ],
})

export const N10: Lecture = notesLecture({
  number: 10,
  title: 'Entanglement criteria and entropy',
  date: '2026-10-07',
  topics: [
    'separable and entangled states',
    'convexity of the set of states',
    'the coherence criterion',
    'concurrence and the partial transpose',
    'entropy and conditional entropy',
    'the alpha-family compared test by test',
  ],
  length: 'full',
  symbols: {
    '|\\cdot\\rangle': 'n10-separable:b1',
    '|\\psi\\rangle': 'n10-separable:b1',
    '|\\psi_A\\rangle': 'n10-separable:b1',
    '|\\psi_B\\rangle': 'n10-separable:b1',
    '\\otimes': 'n10-separable:b1',
    '|\\chi\\rangle': 'n10-separable:b1',
    '|01\\rangle': 'n10-separable:b1',
    '|10\\rangle': 'n10-separable:b1',
    '\\alpha': 'n10-separable:b1',
    '\\beta': 'n10-separable:b1',
    '\\rho': 'n10-separable:b2',
    'p_n': 'n10-separable:b2',
    'A_n': 'n10-separable:b2',
    'B_n': 'n10-separable:b2',
    '\\rho_1': 'n10-convexity:b1',
    '\\rho_2': 'n10-convexity:b1',
    '\\theta': 'n10-convexity:b1',
    '|0\\rangle': 'n10-coherence:b1',
    '|1\\rangle': 'n10-coherence:b1',
    'a_0': 'n10-coherence:b1',
    'a_1': 'n10-coherence:b1',
    'b_0': 'n10-coherence:b1',
    'b_1': 'n10-coherence:b1',
    'P_01': 'n10-coherence:b1',
    'P_10': 'n10-coherence:b1',
    'Q': 'n10-coherence:b1',
    'F': 'n10-coherence:b1',
    'F_coh': 'n10-coherence:b1',
    '|+x\\rangle': 'n10-coherence:b3',
    '\\Phi': 'n10-coherence:b3',
    '|S\\rangle': 'n10-family:b1',
    '|00\\rangle': 'n10-family:b1',
    '|11\\rangle': 'n10-family:b1',
    '\\langle\\cdot|': 'n10-family:b1',
    '\\Psi': 'n10-family:b1',
    'I': 'n10-family:b2',
    '\\tilde\\rho': 'n10-concurrence:b1',
    '\\sigma_y': 'n10-concurrence:b1',
    'R': 'n10-concurrence:b1',
    '\\lambda_1': 'n10-concurrence:b1',
    '\\lambda_2': 'n10-concurrence:b1',
    '\\lambda_3': 'n10-concurrence:b1',
    '\\lambda_4': 'n10-concurrence:b1',
    'C': 'n10-concurrence:b1',
    'E_f': 'n10-concurrence:b1',
    'E': 'n10-concurrence:b1',
    'h': 'n10-concurrence:b1',
    'i': 'n10-concurrence:b2',
    '\\Lambda': 'n10-concurrence:b2',
    '|\\tilde\\psi\\rangle': 'n10-concurrence:b2',
    '|\\psi^*\\rangle': 'n10-concurrence:b2',
    '\\langle\\cdot|\\cdot\\rangle': 'n10-concurrence:b2',
    '\\Lambda_00': 'n10-concurrence:b3',
    '\\Lambda_01': 'n10-concurrence:b3',
    '\\Lambda_10': 'n10-concurrence:b3',
    '\\Lambda_11': 'n10-concurrence:b3',
    '\\lambda_i': 'n10-concurrence:b4',
    '\\lambda_\\max': 'n10-concurrence:b4',
    '\\rho_ab,a\'b\'': 'n10-ptranspose:b1',
    'a': 'n10-ptranspose:b1',
    'b': 'n10-ptranspose:b1',
    '\\sigma_ab,a\'b\'': 'n10-ptranspose:b1',
    '\\rho_a\'b,ab\'': 'n10-ptranspose:b1',
    '\\sigma': 'n10-ptranspose:b1',
    'A': 'n10-ptranspose:b1',
    'T_B': 'n10-ptranspose:b1',
    'U_A': 'n10-ptranspose:b1',
    'U_B': 'n10-ptranspose:b1',
    '\\dagger': 'n10-ptranspose:b1',
    'T': 'n10-ptranspose:b2',
    'S': 'n10-entropy:b1',
    'd': 'n10-entropy:b1',
    '\\rho_A': 'n10-entropy:b2',
    '\\rho_B': 'n10-entropy:b2',
    '\\lambda': 'n10-entropy:b2',
    'B': 'n10-entropy:b3',
    '\\rho_AB': 'n10-entropy:b3',
    'P': 'n10-correlation:b1',
    '\\langle\\cdot\\rangle': 'n10-compare:b3',
    '\\sigma_i': 'n10-compare:b3',
    '\\sigma_j': 'n10-compare:b3',
  },
  sections: [
    {
      id: 'n10-separable',
      label: '§III',
      title: 'Separable and entangled states',
      pages: 'p. 47',
      summary: 'A product state is separable and any other pure state is entangled, while a mixed state is separable when it is a mixture of products.',
      body: [
        {
          text: 'A pure state of two parties is separable when it is a product, $|\\psi\\rangle = |\\psi_A\\rangle\\otimes|\\psi_B\\rangle$, and entangled otherwise. The state $|\\chi\\rangle = \\alpha|01\\rangle + \\beta|10\\rangle$ with $|\\alpha|^2 + |\\beta|^2 = 1$ (Eq. 3.1) is entangled exactly when $\\alpha\\beta \\ne 0$, since a vanishing coefficient leaves a product. It is the singlet at $\\alpha = -\\beta = 1/\\sqrt2$. Here $\\alpha$ is an amplitude; from Eq. 3.12 on it is a mixing weight (<<qc-q10-separable|Unit 10.1>>).',
        },
        {
          text: 'Mixed states need care, because a classical [[qc-mixture|mixture]] of products is not a single product yet carries no entanglement. A density matrix is therefore called separable when $\\rho = \\sum_np_n\\rho^A_n\\otimes\\rho^B_n$ with $p_n > 0$ and $\\sum_np_n = 1$ (Eq. 3.2), and entangled when no such decomposition exists. For pure states the two definitions coincide. Every separable state obeys Bell’s inequality, though some entangled states obey it as well (<<qc-q10-separable|Unit 10.1>>).',
        },
      ],
    },
    {
      id: 'n10-convexity',
      label: '§III.A',
      title: 'Mixtures and convexity',
      pages: 'pp. 47–48',
      summary: 'Density matrices form a convex set whose corners are the pure states, and the separable states form a smaller convex set inside it.',
      body: [
        {
          text: 'Mixing is the operation behind both definitions, so look at what it does to the set of states. Prepare $\\rho_1$ with chance $\\theta$ and $\\rho_2$ with chance $1-\\theta$, and the ensemble has the density matrix $\\rho(\\theta) = \\theta\\rho_1 + (1-\\theta)\\rho_2$ for $0 \\le \\theta \\le 1$ (Eq. 3.3). It is again a legitimate state, because the trace is linear and positive weights preserve positivity. A set that contains the whole segment between any two of its points is called convex, and density matrices qualify. For one [[qubit|qubit]] the Bloch vector of $\\rho(\\theta)$ slides along a straight chord, so the [[qc-bloch-ball|Bloch ball]] has no dents (<<qc-q8-recipes|Unit 8.6>>).',
          figure: {
            stage: { kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, recipe: true, purity: true, shot: 'B-STD' },
            caption: 'A mixture of two states lies on the straight chord between them and never leaves the ball.',
          },
        },
        {
          text: 'Which side of a boundary does a given state lie on? Within a convex set, a point is extremal when no genuine mixture of two different points produces it. On the Bloch ball these are the surface points, the pure states, as the uniqueness argument of Lecture 8 showed. The separable states sit inside the full set as a smaller convex region, because mixing separable states yields only separable states, and the corners of that region are the pure products. Entangled states are those outside it. Each criterion below asks which side a state lies on, and the sufficient tests can answer only “outside” (<<qc-q10-separable|Unit 10.1>>).',
        },
      ],
    },
    {
      id: 'n10-coherence',
      label: '§III.B.1',
      title: 'The coherence criterion',
      pages: 'pp. 48–49',
      summary: 'Two populations and one coherence of the middle block bound every separable state, so a measured value above one half proves entanglement.',
      body: [
        {
          text: 'The coherence criterion needs only part of the density matrix, which makes it cheap to measure. For a separable pure state of two qubits, $(a_0|0\\rangle + a_1|1\\rangle)\\otimes(b_0|0\\rangle + b_1|1\\rangle)$ (Eq. 3.4), the middle block holds the populations $P_{01} = |a_0|^2|b_1|^2$ and $P_{10} = |a_1|^2|b_0|^2$ and the coherence $Q = a_0b_1a_1^*b_0^*$ between $|01\\rangle$ and $|10\\rangle$ (Eqs. 3.5–3.6). The notes combine them into $F$; Chapter Q12 writes $F_{\\text{coh}}$, because Chapter Q9 keeps $F$ for the fidelity.',
        },
        {
          text: 'Define $F_{\\text{coh}} = (P_{01} + P_{10})/2 + |Q|$ (Eq. 3.10). Normalizing both qubits gives $(|a_0| - |b_1|)^2 + (|a_1| - |b_0|)^2 + 2|a_0||b_1| + 2|a_1||b_0| = 2$ (Eq. 3.7), so $|a_0||b_1| + |a_1||b_0| \\le 1$, and squaring turns this into $P_{01} + 2|Q| + P_{10} \\le 1$ (Eqs. 3.8–3.9). Hence every separable pure state has $F_{\\text{coh}} \\le \\tfrac{1}{2}$.',
        },
        {
          text: `The bound survives for mixtures, since populations average linearly and the coherence obeys the triangle inequality (Eq. 3.11). So $F_{\\text{coh}} \\le \\tfrac{1}{2}$ is necessary for separability, and a measured $F_{\\text{coh}} > \\tfrac{1}{2}$ proves entanglement, while a value of one half or less proves nothing. Populations alone never suffice. The product $|0\\rangle\\otimes(${d(V.q12ProdAAmp0, 1)}|0\\rangle + ${d(V.q12ProdAAmp1, 1)}|1\\rangle)$ has $F_{\\text{coh}} = ${d(V.q12CohProdA, 2)}$, the product $|{+x}\\rangle|{+x}\\rangle$ reaches the bound $\\tfrac{1}{2}$, and the singlet reaches $${tf(V.q12CohSinglet)}$. The criterion is blind to $\\Phi^+$, with $F_{\\text{coh}} = ${d(V.q12CohPhiPlus, 0)}$ (<<qc-q12-coherence|Unit 12.1>>).`,
          claims: [
            claim('q12CohProdA', 'the product of the up state with 0.6 up plus 0.8 down has F_coh = 0.32', () => close(V.q12CohProdA, 0.32, 1e-9)),
            claim('q12ProdAAmp0', 'the second factor has amplitude 0.6 on the up state', () => close(V.q12ProdAAmp0, 0.6, 1e-9)),
            claim('q12ProdAAmp1', 'the second factor has amplitude 0.8 on the down state', () => close(V.q12ProdAAmp1, 0.8, 1e-9)),
            claim('q12CohProdEq', 'the product of two x-up states sits exactly at the bound one half', () => close(V.q12CohProdEq, 0.5, 1e-9)),
            claim('q12CohSinglet', 'the singlet has F_coh = 1', () => close(V.q12CohSinglet, 1, 1e-9)),
            claim('q12CohPhiPlus', 'the state Phi plus has F_coh = 0: the criterion misses it', () => close(V.q12CohPhiPlus, 0, 1e-9)),
            claim('q12Half', 'the separable bound on F_coh is one half', () => close(V.q12Half, 0.5, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n10-family',
      label: '§III.B.1',
      title: 'The alpha-family',
      pages: 'pp. 49–50',
      summary: 'A one-parameter family of two-spin states mixes the singlet with two aligned states, and its two parts stay maximally mixed while its entanglement changes.',
      body: [
        {
          text: 'The worked example is $\\rho(\\alpha) = \\alpha|S\\rangle\\langle S| + \\tfrac{1-\\alpha}{2}\\big(|00\\rangle\\langle00| + |11\\rangle\\langle11|\\big)$ (Eq. 3.12), where $|S\\rangle$ is the singlet, written $\\Psi^-$ in Chapter Q12. In the product basis it is real, with the singlet block $\\alpha/2$ on the diagonal and $-\\alpha/2$ in the corners of the middle block and $(1-\\alpha)/2$ at $|00\\rangle$ and $|11\\rangle$ (Eq. 3.13). At $\\alpha = 1$ it is the singlet itself, and at $\\alpha = 0$ it is an equal mixture of $|00\\rangle$ and $|11\\rangle$, which is classical.',
          figure: {
            stage: { kind: 'matrix', source: { rho: FAMILY(V.q12FamF06) }, labels: 'kets', values: 'exact', blocks: 2, highlight: [[1, 1], [1, 2], [2, 1], [2, 2]], shot: 'M-GRID' },
            caption: 'The family as a four-by-four matrix with its middle block marked, the block that the coherence criterion reads.',
          },
        },
        {
          text: `Both reduced states equal $\\tfrac{1}{2}I$ for every $\\alpha$ (Eq. 3.14), so a measurement on one qubit says nothing about $\\alpha$, and the information sits in the correlations. In the middle block the populations are $\\alpha/2$ and the coherence is $-\\alpha/2$, so $F_{\\text{coh}} = \\alpha$ (Eq. 3.15). The state is entangled for $\\alpha > \\tfrac{1}{2}$, so the question is how well each test sees that range, as at $\\alpha = ${d(V.q12FamF06, 1)}$ (<<qc-q12-family|Unit 12.7>>).`,
          claims: [
            claim('q12FamRA', 'each half of the family is at the centre of the Bloch ball', () => close(V.q12FamRA, 0, 1e-9)),
            claim('q12FamF06', 'at alpha = 0.6, F_coh = 0.6', () => close(V.q12FamF06, 0.6, 1e-9)),
            claim('q12Half', 'the maximally mixed qubit and the thresholds carry the number one half', () => close(V.q12Half, 0.5, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n10-concurrence',
      label: '§III.B.2',
      title: 'Concurrence',
      pages: 'pp. 50–51',
      summary: 'Wootters’ concurrence is computed from the eigenvalues of a matrix built with a spin flip, equals twice the determinant of the coefficient matrix for a pure state, and is exact for two qubits.',
      body: [
        {
          text: 'For a density matrix $\\rho$ let $\\tilde\\rho = (\\sigma_y\\otimes\\sigma_y)\\rho^*(\\sigma_y\\otimes\\sigma_y)$ and $R = \\sqrt{\\sqrt\\rho\\,\\tilde\\rho\\,\\sqrt\\rho}$, with eigenvalues $\\lambda_1 \\ge \\lambda_2 \\ge \\lambda_3 \\ge \\lambda_4$ (Eq. 3.16). The concurrence is $C = \\max\\{0,\\ \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4\\}$, and the entanglement of formation is $E_f = E(C)$, where $E(x) = h\\big((1 - \\sqrt{1-x^2})/2\\big)$ and $h$ is the binary entropy (Eq. 3.17). The function $E$ grows monotonically from 0 to 1 bit as $C$ goes from 0 to 1, so a positive $E_f$ is necessary and sufficient for two qubits. The criterion is due to Wootters (Phys. Rev. Lett. 80, 2245, 1998) (<<qc-q12-concurrence|Unit 12.6>>).',
        },
        {
          text: `Take care with the complex conjugation, which is easy to drop. For $(|01\\rangle - i|10\\rangle)/\\sqrt2$ the full recipe gives $C = ${d(V.q12ConjC, 0)}$, and without the conjugation it returns ${d(V.q12ConjCNo, 0)}. A pure state has a coefficient matrix $\\Lambda$ that collects its four amplitudes (Eq. 3.18). Then $\\tilde\\rho$ is the projector on $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$, and $R$ has the single non-zero eigenvalue $|\\langle\\psi|\\tilde\\psi\\rangle|$ (<<qc-q12-concurrence|Unit 12.6>>).`,
          claims: [
            claim('q12ConjC', 'with the conjugation the state (|01> - i|10>)/sqrt 2 has C = 1', () => close(V.q12ConjC, 1, 1e-9)),
            claim('q12ConjCNo', 'without the conjugation it returns 0', () => close(V.q12ConjCNo, 0, 1e-9)),
          ],
        },
        {
          text: `Now evaluate that overlap. Write $|\\psi\\rangle = \\Lambda_{00}|00\\rangle + \\Lambda_{01}|01\\rangle + \\Lambda_{10}|10\\rangle + \\Lambda_{11}|11\\rangle$. The flip $\\sigma_y\\otimes\\sigma_y$ sends $|00\\rangle$ to $-|11\\rangle$, $|01\\rangle$ to $|10\\rangle$, $|10\\rangle$ to $|01\\rangle$ and $|11\\rangle$ to $-|00\\rangle$, while the conjugation turns every amplitude into its complex conjugate. Collecting terms gives $\\langle\\psi|\\tilde\\psi\\rangle = -2(\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10})^*$, hence $C = 2|\\det\\Lambda|$, the result left to Homework 3 in the notes. For $\\Lambda = \\mathrm{diag}(0.6,\\,0.8)$ the value is ${d(V.q12ConcLambda, 2)}, twice ${d(V10.q10FamDet, 2)} (<<qc-q12-concurrence|Unit 12.6>>).`,
          claims: [
            claim('q12ConcLambda', 'a pure state with coefficient matrix diag(0.6, 0.8) has C = 2 |det| = 0.96', () => close(V.q12ConcLambda, 0.96, 1e-9)),
            c10('q10FamDet', '|det| of diag(0.6, 0.8) is 0.48', () => close(V10.q10FamDet, 0.48, 1e-9)),
          ],
        },
        {
          text: `For the family $\\rho$ is real and unchanged by the spin flip, so $\\tilde\\rho = \\rho$ and $R = \\sqrt{\\sqrt\\rho\\,\\rho\\,\\sqrt\\rho} = \\sqrt{\\rho^2} = \\rho$. The numbers $\\lambda_i$ are then the eigenvalues of $\\rho$ itself, $\\alpha$, $0$ and $\\tfrac{1-\\alpha}{2}$ twice (Eqs. 3.19–3.20), and $C = 2\\lambda_{\\max} - 1$. This gives $C(\\alpha) = \\max\\{0,\\ 2\\alpha - 1\\}$ (Eq. 3.21): ${d(V.q12FamC06, 1)} at $\\alpha = ${d(V.q12FamF06, 1)}$ and ${d(V.q12FamC08, 1)} at $\\alpha = ${d(V.q12FamF08, 1)}$, so the family is entangled exactly for $\\alpha > \\tfrac{1}{2}$ (<<qc-q12-family|Unit 12.7>>).`,
          claims: [
            claim('q12FamC06', 'at alpha = 0.6, C = 0.2', () => close(V.q12FamC06, 0.2, 1e-9)),
            claim('q12FamC08', 'at alpha = 0.8, C = 0.6', () => close(V.q12FamC08, 0.6, 1e-9)),
            claim('q12FamF08', 'at alpha = 0.8, F_coh = 0.8', () => close(V.q12FamF08, 0.8, 1e-9)),
            claim('q12Half', 'the maximally mixed qubit and the thresholds carry the number one half', () => close(V.q12Half, 0.5, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n10-ptranspose',
      label: '§III.B.3',
      title: 'The partial transpose',
      pages: 'pp. 52–53',
      summary: 'Transposing one party’s indices keeps a separable state positive, so a negative eigenvalue of the result proves entanglement, and for two qubits it settles the question.',
      body: [
        {
          text: 'Write the matrix elements of a separable state with all indices, $\\rho_{ab,a\'b\'} = \\sum_np_n(\\rho^A_n)_{aa\'}(\\rho^B_n)_{bb\'}$ (Eq. 3.22), and define $\\sigma_{ab,a\'b\'} = \\rho_{a\'b,ab\'}$ (Eq. 3.23). Here $\\sigma$ is the partial transpose of the indices of $A$, not a Pauli matrix; Chapter Q12 writes it $\\rho^{T_B}$, which has the same eigenvalues. It is Hermitian but not a physical map, and local unitaries change it to $(U_A^*\\otimes U_B)\\sigma(U_A^*\\otimes U_B)^\\dagger$ (Eqs. 3.24–3.25), so its spectrum is basis-free (<<qc-q12-ppt|Unit 12.2>>).',
        },
        {
          text: `For a separable state $\\sigma = \\sum_np_n(\\rho^A_n)^T\\otimes\\rho^B_n$ (Eq. 3.26), and a transposed density matrix is again a density matrix, so $\\sigma \\ge 0$. A negative eigenvalue therefore proves entanglement, and for $2\\times2$ and $2\\times3$ systems the test is exact. For the family the eigenvalues are $\\alpha/2$ twice, $\\tfrac{1}{2}$ and $\\tfrac{1}{2} - \\alpha$ (Eq. 3.27), with $\\det\\sigma = \\alpha^2(1-2\\alpha)/16$. At $\\alpha = ${d(V.q12FamF06, 1)}$ the smallest eigenvalue is $-${d(V.q12FamSigMin06, 1)}$ and the determinant is negative, of size ${d(V.q12FamDet06, 4)}; at $\\alpha = ${d(V.q12FamF08, 1)}$ the smallest is $-${d(V.q12FamSigMin08, 1)}$ (<<qc-q12-family|Unit 12.7>>).`,
          claims: [
            claim('q12FamSigMin06', 'at alpha = 0.6 the smallest eigenvalue of the partial transpose is -0.1', () => close(V.q12FamSigMin06, 0.1, 1e-9)),
            claim('q12FamSigMin08', 'at alpha = 0.8 the smallest eigenvalue is -0.3', () => close(V.q12FamSigMin08, 0.3, 1e-9)),
            claim('q12FamDet06', 'at alpha = 0.6 the determinant alpha^2 (1 - 2 alpha)/16 has size 0.0045', () => close(V.q12FamDet06, 0.0045, 1e-9)),
            claim('q12FamF06', 'at alpha = 0.6, F_coh = 0.6', () => close(V.q12FamF06, 0.6, 1e-9)),
            claim('q12FamF08', 'at alpha = 0.8, F_coh = 0.8', () => close(V.q12FamF08, 0.8, 1e-9)),
            claim('q12Half', 'the maximally mixed qubit and the thresholds carry the number one half', () => close(V.q12Half, 0.5, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n10-entropy',
      label: '§III.C–C.1',
      title: 'Entropy and conditional entropy',
      pages: 'pp. 53–55',
      summary: 'The von Neumann entropy of a part measures the entanglement of a pure pair, and a negative conditional entropy of the pair proves entanglement in one direction only.',
      body: [
        {
          text: 'The von Neumann entropy is $S(\\rho) = -\\mathrm{Tr}\\{\\rho\\log_2\\rho\\} = -\\sum_i\\lambda_i\\log_2\\lambda_i$ (Eq. 3.28). For a pure state every eigenvalue is 0 or 1, so the entropy vanishes; it equals one bit for the maximally mixed qubit (Eq. 3.29), and reaches its largest value $\\log_2 d$ in $d$ dimensions. We always write the argument, since $S$ also names the CHSH score in Lecture 11 (<<qc-q9-entropy|Unit 9.3>>).',
        },
        {
          text: `For a pure pair the Schmidt weights $\\lambda_i$ make the two parts share one entropy, $S(\\rho_A) = S(\\rho_B)$ (Eq. 3.30), the entanglement entropy. Rank one means a product and $S = 0$. Equal weights give $\\log_2 d$, and no other weights do, because the relative entropy $\\sum_i\\lambda_i\\log_2(d\\lambda_i)$ is non-negative and vanishes only then. For two qubits $S = h(\\lambda)$ (Eqs. 3.31–3.32), which is ${d(V9.q9S0707, 3)} bit for the weights of Lecture 9 and one bit for a Bell state (<<qc-q9-entropy|Unit 9.3>>).`,
          claims: [c9('q9S0707', 'for the Schmidt weights 0.854 and 0.146 the entropy is h(0.854) = 0.601 bit', () => close(V9.q9S0707, 0.601, 1e-3))],
        },
        {
          text: `The entropy of a part signals entanglement only for pure pairs, because for a mixed pair ordinary mixing raises it too. What survives for mixed states is the conditional entropy $S(A|B) = S(\\rho_{AB}) - S(\\rho_B)$ (Eq. 3.33). Classically it is never negative, since a whole is not more uncertain than one of its parts, but quantum mechanically $S(A|B) < 0$ implies entanglement (Eq. 3.34). A pure entangled pair has $S(A|B) = -S(\\rho_B)$, which is $-${d(V.q12E30, 4)}$ bit for Schmidt weights three quarters and one quarter, and a Bell state has ${d(V.q12CondBell, 0)} bit. The test runs one way only: a non-negative value proves nothing (<<qc-q12-entropy|Unit 12.5>>).`,
          claims: [
            claim('q12CondPure30', 'the pair with Schmidt weights three quarters and one quarter has S(A|B) = -0.8113 bit', () => close(V.q12CondPure30, -0.8113, 1e-4)),
            claim('q12E30', 'the pair with Schmidt weights three quarters and one quarter has entanglement entropy 0.8113 bit', () => close(V.q12E30, 0.8113, 1e-4)),
            claim('q12CondBell', 'a Bell state has S(A|B) = -1 bit', () => close(V.q12CondBell, -1, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n10-compare',
      label: '§III.B–C',
      title: 'The family compared',
      pages: 'p. 55',
      summary: 'On the one-parameter family the coherence figure, the partial transpose and the concurrence all switch on at one half, the CHSH test later, and the conditional entropy last.',
      body: [
        {
          text: `Put the tests side by side on the family at $\\alpha = ${d(V.q12FamF06, 1)}$. The coherence figure is ${d(V.q12FamF06, 1)}, the concurrence ${d(V.q12FamC06, 1)} and the smallest eigenvalue of the partial transpose $-${d(V.q12FamSigMin06, 1)}$, so all three already see the entanglement, and each of them does so as soon as $\\alpha > \\tfrac{1}{2}$. The partial transpose and the concurrence are exact for two qubits, whereas the coherence figure is a sufficient test only and can miss entangled states (<<qc-q12-family|Unit 12.7>>).`,
          claims: [
            claim('q12FamF06', 'at alpha = 0.6, F_coh = 0.6', () => close(V.q12FamF06, 0.6, 1e-9)),
            claim('q12FamC06', 'at alpha = 0.6, C = 0.2', () => close(V.q12FamC06, 0.2, 1e-9)),
            claim('q12FamSigMin06', 'at alpha = 0.6 the smallest eigenvalue of the partial transpose is -0.1', () => close(V.q12FamSigMin06, 0.1, 1e-9)),
            claim('q12Half', 'the maximally mixed qubit and the thresholds carry the number one half', () => close(V.q12Half, 0.5, 1e-9)),
          ],
        },
        {
          text: `The conditional entropy reacts later. Since $\\rho_B = \\tfrac{1}{2}I$ for this family, $S(A|B) = -\\alpha\\log_2\\alpha - (1-\\alpha)\\log_2\\tfrac{1-\\alpha}{2} - 1$ (Eq. 3.35). At $\\alpha$ equal to three quarters it is still ${d(V.q12FamSAB075, 4)} bit; at $\\alpha = ${d(V.q12FamF08, 1)}$ it is $-${d(V.q12FamSAB08, 4)}$ bit; at the singlet it is $${d(V.q12FamSAB1, 0)}$ bit. It crosses zero only at $\\alpha \\approx ${d(V.q12FamSABThresh, 4)}$ (<<qc-q12-family|Unit 12.7>>).`,
          figure: {
            stage: {
              layout: 'split',
              top: { kind: 'matrix', source: { rho: FAMILY(V.q12FamF08) }, labels: 'kets', values: 'exact', ptranspose: 'B', spectrum: 'bars', shot: 'M-GRID' },
              bottom: { kind: 'two-qubit', source: { rho: FAMILY(V.q12FamF08) }, labels: 'A-B', arrows: 'reduced', grid: 'T', readouts: ['concurrence', 'chsh'], shot: 'TQ-PAIR' },
            },
            caption: 'The family at one value of the weight: the spectrum of the partial transpose with a negative bar (top), and the concurrence and the best CHSH score (bottom).',
          },
          claims: [
            claim('q12FamSAB075', 'at alpha = three quarters, S(A|B) = +0.0613 bit', () => close(V.q12FamSAB075, 0.0613, 1e-4)),
            claim('q12FamSAB08', 'at alpha = 0.8, S(A|B) = -0.0781 bit (size 0.0781)', () => close(V.q12FamSAB08, 0.0781, 1e-4)),
            claim('q12FamSAB1', 'at the singlet S(A|B) = -1', () => close(V.q12FamSAB1, -1, 1e-9)),
            claim('q12FamSABThresh', 'S(A|B) crosses zero at alpha = 0.7729', () => close(V.q12FamSABThresh, 0.7729, 1e-4)),
            claim('q12FamF08', 'at alpha = 0.8, F_coh = 0.8', () => close(V.q12FamF08, 0.8, 1e-9)),
          ],
        },
        {
          text: `The CHSH test goes beyond the notes (Horodecki criterion, <<qc-q12-family|Unit 12.7>>). Let $T$ be the matrix of the correlations $\\langle\\sigma_i\\otimes\\sigma_j\\rangle$ of the two spins. For the family it is $\\mathrm{diag}(-\\alpha, -\\alpha, 1-2\\alpha)$, so the best score is $2\\sqrt2\\,\\alpha$, which exceeds 2 only for $\\alpha > 1/\\sqrt2 \\approx ${d(V.q12FamChshThresh, 4)}$; at $\\alpha = ${d(V.q12FamF08, 1)}$ it is ${d(V.q12FamChshAt08, 4)}. On this family the coherence figure, the partial transpose and the concurrence switch on at one half, CHSH at $1/\\sqrt2$ and the conditional entropy at ${d(V.q12FamSABThresh, 4)}. The coherence figure, CHSH and the conditional entropy are sufficient but not necessary tests; only the partial transpose and the concurrence are exact for two qubits, where the entanglement of formation at $\\alpha = ${d(V.q12FamF08, 1)}$ is ${d(V.q12FamEf08, 3)} bit.`,
          claims: [
            claim('q12FamChshThresh', 'the CHSH score of the family passes 2 at alpha = 1/sqrt 2 = 0.7071', () => close(V.q12FamChshThresh, Math.SQRT1_2, 1e-9)),
            claim('q12FamChshAt08', 'at alpha = 0.8 the best score is 2 sqrt 2 times 0.8 = 2.2627', () => close(V.q12FamChshAt08, 2 * Math.SQRT2 * 0.8, 1e-9)),
            claim('q12FamEf08', 'at alpha = 0.8 the entanglement of formation is E(0.6) = 0.469 bit', () => close(V.q12FamEf08, 0.469, 1e-3)),
            claim('q12FamSABThresh', 'S(A|B) crosses zero at alpha = 0.7729', () => close(V.q12FamSABThresh, 0.7729, 1e-4)),
            claim('q12FamF08', 'at alpha = 0.8, F_coh = 0.8', () => close(V.q12FamF08, 0.8, 1e-9)),
          ],
        },
        {
          text: 'The family therefore separates the tests cleanly. For $\\tfrac{1}{2} < \\alpha \\le 1/\\sqrt2$ the state is entangled yet obeys every CHSH inequality, and between $1/\\sqrt2$ and the entropy threshold it violates CHSH while the conditional entropy is still not negative. One state can thus be entangled and invisible to a given test, which is why Lecture 11 asks what Bell’s own test can see (<<qc-q12-family|Unit 12.7>>).',
        },
      ],
    },
    {
      id: 'n10-correlation',
      label: '§III.D',
      title: 'Two-spin correlations',
      pages: 'p. 55',
      summary: 'For the singlet, the correlation of two spin readings is fixed by how the two analyzers are oriented relative to each other and is perfectly negative when they are parallel.',
      body: [
        {
          text: `Pick a direction $a$ for the first spin and a direction $b$ for the second, and average the product of the two readings over many pairs. For the singlet quantum mechanics gives $P(a,b) = -a\\cdot b$ (Eq. 3.36), a function of the angle between $a$ and $b$ only. Here $P$ is a correlation in $[-1, 1]$, not a probability. Parallel analyzers give ${d(V10.q10SingletPar, 0)}, perfect anticorrelation (<<qc-q10-bell|Unit 10.4>>).`,
          claims: [c10('q10SingletPar', 'the singlet’s correlation for parallel analyzers is -1', () => close(V10.q10SingletPar, -1, 1e-9))],
        },
        {
          text: 'In Lecture 11 a hidden-variable story supplies a pre-assigned answer of plus or minus one to each analyzer setting, and Bell’s argument compares the correlations such a story can produce with this quantity. The full singlet carries more than any single-party statistic can show, since each party alone sees a fair coin (<<qc-q10-bell|Unit 10.4>>).',
        },
      ],
    },
  ],
})
