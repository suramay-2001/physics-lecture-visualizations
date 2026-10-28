/**
 * Chapter Q20 review cards (Physics 709; P-Q20-story §6), one per unit, in both tracks. Every number on a card is backed by a claim of its unit (content/claims.test.ts); the Formal block
 * has its own points, equations and trap.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d, tf } from './Q20.values'

export const Q20_REVIEW: Record<string, ReviewCard> = {
  'q20-cloner': {
    points: [
      'Three wires and four CNOT gates make a cloner; the two lower wires hold the program.',
      'A mix of the two programs shares the state between wire 1 and wire 2.',
      `The equal split gives two clones, each with fidelity $${tf(V.q20F56)}$.`,
      'Every input is treated alike, so this is a universal cloner.',
    ],
    equations: '\\rho_{1,2} = \\tfrac56\\,|\\psi\\rangle\\langle\\psi| + \\tfrac16\\,|\\psi^\\perp\\rangle\\langle\\psi^\\perp|,\\quad \\mathbf r_{\\rm out} = \\tfrac23\\,\\mathbf r',
    trap: `Thinking a good enough cloner is perfect, or that $${tf(V.q20F56)}$ is the root fidelity of Chapter Q9 (it is its square).`,
    claims: [claim('q20F56', 'the equal-split clone has copy fidelity five sixths', () => close(V.q20F56, 5 / 6, 1e-9))],
    formal: {
      points: [
        'Fig. 8.1: CNOT $1\\to2$, $1\\to3$, $2\\to1$, $3\\to1$ with a program in qubits 2 and 3 (Eqs. 8.1–8.2).',
        'The program $c_0\\Xi_{00} + c_1\\Xi_{0x}$ trades $F_{\\rm c,1}$ against $F_{\\rm c,2}$ (Eqs. 8.3–8.4).',
        `The equal split gives $F_{\\rm c} = ${tf(V.q20F56)}$ for every input (Eq. 8.5).`,
      ],
      trap: `Reading $F_{\\rm c} = ${tf(V.q20F56)}$ as the root fidelity $F$ of Chapter Q9: $F_{\\rm c} = F^2$.`,
    },
  },
  'q20-unot': {
    points: [
      'The ideal NOT needs complex conjugation, which no gate can do.',
      `Wire 3 of the cloner, turned by a half-turn about $y$, is the best approximation: fidelity $${tf(V.q20UnotFid)}$.`,
      'Measuring along a random axis and building the opposite state does equally well.',
    ],
    equations: '\\Lambda_p\\ \\text{is completely positive}\\iff p \\le \\tfrac13',
    trap: 'Thinking measure-and-prepare also clones as well as the circuit does.',
    claims: [claim('q20UnotFid', 'the turned wire 3 has fidelity two thirds to the opposite state', () => close(V.q20UnotFid, 2 / 3, 1e-9))],
    formal: {
      points: [
        `The ideal U-NOT is $\\rho \\mapsto \\mathrm{Tr}(\\rho)I - \\rho = \\sigma_y\\rho^{T}\\sigma_y$, not completely positive (Eq. 8.6 onward).`,
        `The shrunk map $\\Lambda_p$ is completely positive iff $p \\le ${tf(V.q20UnotPStar)}$, and then $F_{\\rm c} = \\tfrac{1+p}{2} \\le ${tf(V.q20UnotFid)}$.`,
        'Measure-and-prepare gives the same state as the circuit (Eqs. 8.9–8.12).',
      ],
      trap: 'Taking the single-copy fidelity of measure-and-prepare cloning for the fidelity of the pair.',
    },
  },
  'q20-no-go': {
    points: [
      'The program output cannot depend on the data, because a unitary machine keeps overlaps.',
      'Two different operations therefore need orthogonal programs.',
      'So the program register needs at least as many dimensions as there are operations, which is a finite number for a finite register.',
    ],
    equations: '\\langle\\Pi_2|\\Pi_1\\rangle = \\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\,\\langle\\Pi_2\'|\\Pi_1\'\\rangle',
    trap: 'Thinking a measurement and a fix-up can beat the counting bound.',
    formal: {
      points: [
        'Eqs. 8.13–8.14: a processor $G$ makes $G(|\\psi\\rangle|\\Pi\\rangle) = U|\\psi\\rangle|\\Pi\'\\rangle$, and the program output $\\Pi\'$ is independent of $\\psi$.',
        'Eqs. 8.15–8.17: $\\langle\\psi|U_2^{-1}U_1|\\psi\\rangle$ must not depend on $\\psi$, so $U_2 = e^{i\\gamma}U_1$ unless the programs are orthogonal.',
        'Hence $\\dim\\mathcal H_p$ is at least the number of distinct operations (Eqs. 8.18–8.19).',
      ],
      trap: 'Counting $U$ and $e^{i\\gamma}U$ as two operations.',
    },
  },
  'q20-probabilistic': {
    points: [
      `A CNOT and one program qubit give the turn $e^{i\\alpha\\sigma_z}$ half the time, and the program wire says when.`,
      `Retrying with doubled programs reaches $1 - 2^{-k}$ after $k$ rounds.`,
      `A larger program with a Toffoli gate gives $${tf(V.q20ToffoliSuccess)}$ in one go.`,
    ],
    equations: '1 - 2^{-k}',
    trap: 'Believing that success is certain after finitely many rounds.',
    claims: [claim('q20ToffoliSuccess', 'the larger program succeeds with chance three quarters', () => close(V.q20ToffoliSuccess, 0.75, 1e-12))],
    formal: {
      points: [
        'Eqs. 8.20–8.21: the output is $\\tfrac{1}{\\sqrt2}(U(\\alpha)\\psi|0\\rangle + U^{-1}(\\alpha)\\psi|1\\rangle)$, success chance one half for every $\\alpha$ and $\\psi$.',
        'Eq. 8.29: after a failure, $\\Xi(2\\alpha)$ gives $U(\\alpha)\\psi$ or $U^{-1}(3\\alpha)\\psi$; the total is three quarters.',
        `Eq. 8.30: the Toffoli form has success chance $${tf(V.q20ToffoliSuccess)}$ and failure chance $${tf(V.q20ToffoliFail)}$.`,
      ],
      trap: 'Taking the retry law $1 - 2^{-k}$ for a guarantee: it is never exactly 1.',
    },
  },
  'q20-bell-programs': {
    points: [
      'Used as the program, each Bell state makes the circuit apply one Pauli gate.',
      'A phase flip about any direction is a mix of three Paulis, so its program is a mix of three Bell states.',
      `The flip works one time in three, whatever the direction and the data.`,
    ],
    equations: 'U_\\chi = -\\mathbf n\\cdot\\boldsymbol\\sigma',
    trap: 'Thinking the reading of the program wires changes the data.',
    claims: [claim('q20FlipSuccess', 'the flip program succeeds with chance one third', () => close(V.q20FlipSuccess, 1 / 3, 1e-9))],
    formal: {
      points: [
        'Eq. 8.23: $\\Phi^+ \\to I$, $\\Phi^- \\to \\sigma_z$, $\\Psi^+ \\to \\sigma_x$, $\\Psi^- \\to -i\\sigma_y$ (standard names).',
        `Eqs. 8.24–8.26: $U_\\chi = I - 2|\\chi\\rangle\\langle\\chi|$ has the program $c_x|\\Psi^+\\rangle + c_y|\\Psi^-\\rangle + c_z|\\Phi^-\\rangle$ and success chance $${tf(V.q20FlipSuccess)}$.`,
        'Eq. 8.28 gives the same program in the tidier form $U_{\\rm in}$ applied to a symmetric pair.',
      ],
      trap: 'Using the Bell names of the book for the standard ones: his $\\Psi_\\pm$ are our $\\Phi^\\pm$.',
    },
  },
  'q20-discriminator': {
    points: [
      'The two states to tell apart arrive as data, so the machine cannot be built around them.',
      'Symmetry gives the test: input 1 is symmetric under a swap of wires A and C, so the antisymmetric projector never fires on it.',
      `The chance of success is $${tf(V.q20DiscP0)}(1 - s^2)$ for overlap $s$.`,
    ],
    equations: 'P = \\tfrac13(1 - s^2)',
    trap: 'Thinking it is as good as a machine that knows the states.',
    claims: [claim('q20DiscP0', 'the programmable chance at s = 0 is one third', () => close(V.q20DiscP0, 1 / 3, 1e-9))],
    formal: {
      points: [
        'Eqs. 8.31–8.38: $\\Pi_1 = c_1I_A\\otimes P^{\\rm as}_{BC}$ and $\\Pi_2 = c_2I_B\\otimes P^{\\rm as}_{AC}$ never err, with $p_j = c_j(1 - s^2)/2$.',
        'Eqs. 8.39–8.47: $\\Pi_0 \\ge 0$ limits $c_1$ and $c_2$, and the optimum is $c_1 = c_2 = \\tfrac23$.',
        `The result is $P = \\tfrac13(1 - s^2)$, against $1 - s$ for known states.`,
      ],
      trap: 'Using the printed constant of Eqs. 8.42–8.43: the true determinant is $1 - c_1 - c_2 + \\tfrac34c_1c_2$.',
    },
  },
}
void d
