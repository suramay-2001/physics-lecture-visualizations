/**
 * Chapter Q23 review cards: the exam layer in both tracks (P-Q23-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q23.values.ts and is backed by a keyed claim of its unit (the unit's `claims` hold every claim of its beats).
 */
import type { ReviewCard } from '../schema'
import { V, d } from './Q23.values'

export const Q23_REVIEW: Record<string, ReviewCard> = {
  'q23-classical-compare': {
    points: [
      `Distance is half the total gap between two chance tables: $${d(V.q23Dpq, 1)}$ for the fair and the biased coin.`,
      `Fidelity is the cosine of the angle between the square-root arrows: $${d(V.q23Fpq, 3)}$, an angle of ${d(V.q23ThetaPq, 1)}°.`,
      `Relative entropy is a lopsided surprise: $${d(V.q23Hpq, 3)}$ bits one way and $${d(V.q23Hqp, 3)}$ the other.`,
      'It is never negative, zero only for equal tables, and infinite if one table calls a possible outcome impossible.',
    ],
    equations: 'F = \\sum_x\\sqrt{p_xq_x} = \\cos\\theta',
    trap: 'Calling relative entropy a distance: it is not symmetric.',
    formal: {
      points: [
        '$D(p,q) = \\tfrac12\\sum_x|p(x) - q(x)|$ is a metric (Bergou p. 190, Eq. 11.1); $\\theta = \\cos^{-1}F$ is a metric and $F = \\sum_x\\sqrt{p(x)q(x)}$ is not (Eq. 11.2).',
        '$H(p\\|q) = \\sum_xp(x)\\log_2\\frac{p(x)}{q(x)} \\ge 0$ with equality only for $p = q$ (Eq. 11.4); it is not symmetric, and it is infinite if $q$ vanishes where $p$ does not.',
        `For the two coins $D = ${d(V.q23Dpq, 1)}$ and $F = ${d(V.q23Fpq, 4)}$, and $H(p\\|q) = ${d(V.q23Hpq, 4)}$ against $H(q\\|p) = ${d(V.q23Hqp, 4)}$.`,
      ],
      equations: 'D = \\tfrac12\\sum_x|p_x - q_x|,\\quad F = \\cos\\theta',
      trap: 'Treating $H(p\\|q)$ as a metric: it fails symmetry and the triangle rule.',
    },
  },
  'q23-quantum-compare': {
    points: [
      `A measurement turns two states into two chance tables. Their distance is at most the quantum distance, $${d(V.q23DquantumZP, 3)}$ for $|0\\rangle$ and $|{+}\\rangle$.`,
      `The best measurement reaches that distance; reading $z$ or $x$ gives only $${d(V.q23DmeasZ, 1)}$.`,
      'The quantum relative entropy is never negative, and zero only for equal states.',
      `It sees the eigenvectors: two states with the same eigenvalues but turned axes give $${d(V.q23SrelSameEig, 3)}$ bits, not $0$.`,
    ],
    equations: 'S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0',
    trap: 'Saying that equal eigenvalues mean zero relative entropy.',
    formal: {
      points: [
        'Every table distance is at most $D(\\rho,\\sigma) = \\max_P\\mathrm{Tr}\\,P(\\rho - \\sigma)$, with equality for the projector onto the positive part of $\\rho - \\sigma$ (Eq. 11.5).',
        'Klein: $S(\\rho\\|\\sigma) \\ge \\sum_ip_i\\log\\frac{p_i}{r_i} \\ge 0$ with $r_i = \\sum_j|\\langle u_i|v_j\\rangle|^2q_j$ (Eqs. 3.43–3.46).',
        `For $\\rho = \\mathrm{diag}(0.9, 0.1)$ and a $\\sigma$ of the same spectrum along $x$: $S = ${d(V.q23SrelNC, 3)} \\ge H(p\\|r) = ${d(V.q23KleinH, 3)}$.`,
      ],
      equations: 'S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0',
      trap: 'Reading $S(\\rho\\|\\sigma)$ off the two eigenvalue tables alone, which gives $H(p\\|p) = 0$ for equal spectra.',
    },
  },
  'q23-entropy-props': {
    points: [
      `Entropy is at most $\\log_2d$: a four-level state with chances $0.4, 0.3, 0.2, 0.1$ has $${d(V.q23S4Level, 3)}$ bits, below $2$.`,
      `A label register adds its own entropy to the average entropy of the states: $${d(V.q23SBlock, 1)}$ bits in the example.`,
      'The whole is never more uncertain than its parts added: a Bell pair has $0 \\le 1 + 1$.',
      'Mixing never lowers entropy below the average of the parts.',
    ],
    equations: 'S(\\rho_{AB}) \\le S(\\rho_A) + S(\\rho_B)',
    trap: 'Taking $S(AB) \\ge S(A)$ for granted: it holds for chance tables, not for entangled pairs.',
    formal: {
      points: [
        '$0 \\le S(\\rho) \\le \\log_2d$ with equality on the right only for $I/d$ (Eq. 3.47), because $S(\\rho\\|I/d) = \\log_2d - S(\\rho) \\ge 0$.',
        '$S(\\sum_ip_i|i\\rangle\\langle i|\\otimes\\rho_i) = H(\\{p_i\\}) + \\sum_ip_iS(\\rho_i)$ (Eq. 3.48), and $S(\\rho_{AB}) \\le S(\\rho_A) + S(\\rho_B)$ (Eq. 3.50).',
        '$S(\\sum_ip_i\\rho_i) \\ge \\sum_ip_iS(\\rho_i)$ (Eq. 3.54); strong subadditivity $S(\\rho_{ABC}) + S(\\rho_B) \\le S(\\rho_{AB}) + S(\\rho_{BC})$ is stated, not proved (Eq. 11.18).',
      ],
      equations: 'S(\\rho_{AB}) \\le S(\\rho_A) + S(\\rho_B)',
      trap: 'Using $S(AB) \\ge S(A)$ for a quantum pair: a Bell pair has $S(AB) = 0 < S(A) = 1$.',
    },
  },
  'q23-two-variables': {
    points: [
      `For the noisy wire the joint entropy is $${d(V.q23JointH, 3)}$ bits and the mutual information $${d(V.q23Imutual, 3)}$.`,
      `The capacity of a bit-flip wire is one minus the binary entropy of the flip chance. It is $${d(V.q23BscCap, 3)}$ bits at flip chance $0.1$, and $0$ at one half.`,
      'Independent variables share nothing; perfectly correlated ones share their whole entropy.',
      `Three copies and a majority vote fail with chance $${d(V.q23Rep3Fail, 3)}$ at a third of a bit per use, far below the capacity.`,
    ],
    equations: 'I(X{:}Y) = H(X) + H(Y) - H(X,Y)',
    trap: 'Expecting repetition to reach the capacity.',
    formal: {
      points: [
        '$H(X,Y) = H(X) + H(Y|X)$ and $I(X{:}Y) = H(X) + H(Y) - H(X,Y) = H(p_{XY}\\|p_Xp_Y)$ (Eqs. 11.10–11.16); $I$ is symmetric.',
        '$C = \\max_{p_X}I(X{:}Y)$ is the largest rate of reliable communication (Bergou p. 194, stated without proof); for the binary symmetric channel $C = 1 - h(f)$.',
        `At $f = 0.1$: $H(X,Y) = ${d(V.q23JointH, 4)}$, $I = ${d(V.q23Imutual, 4)} = C$ at the fair input.`,
      ],
      equations: 'I(X{:}Y) = H(X) + H(Y) - H(X,Y),\\quad C = 1 - h(f)',
      trap: 'Taking the rate of a repetition code for the capacity: the vote sits far below $C$.',
    },
  },
  'q23-quantum-mutual': {
    points: [
      `A Bell pair shares $${d(V.q23IBell, 0)}$ bits of quantum mutual information, twice what a classical pair can.`,
      `A phase error of chance $0.1$ on one half lowers it to $${d(V.q23IDeph01, 3)}$.`,
      `Discarding a system never raises it: two qubits of a GHZ state share $${d(V.q23IGhzAB, 0)}$ bit, but one shares $${d(V.q23IGhzABC, 0)}$ with the other two.`,
      'A local noisy operation is a unitary on a bigger system plus a discard, so it only keeps or lowers the correlation.',
    ],
    equations: 'S(A{:}B) = S(A) - S(A|B)',
    trap: 'Believing that local noise can create correlation.',
    formal: {
      points: [
        '$S(A{:}B) = S(\\rho_A) + S(\\rho_B) - S(\\rho_{AB}) = S(A) - S(A|B)$ (Eq. 11.17); a Bell pair has $S(A{:}B) = 2$.',
        'Strong subadditivity gives $S(A{:}B) \\le S(A{:}BC)$ (Eq. 11.19), and a trace-preserving operation on $B$, by its Stinespring dilation, gives $S(A{:}B)$ no rise.',
        `The dephased pair $(1 - p)\\Phi^+ + p\\,\\Phi^-$ has $S(A{:}B) = 2 - h(p)$: $${d(V.q23IDeph01, 4)}$ at $p = 0.1$.`,
      ],
      equations: 'S(A{:}B) \\le S(A{:}BC),\\quad S(A\'{:}B\') \\le S(A{:}B)',
      trap: 'Letting a local operation raise $S(A{:}B)$: the helper-and-discard picture forbids it.',
    },
  },
  'q23-holevo': {
    points: [
      `Bob learns at most $\\chi$: for the pair $|0\\rangle$, $|{+}\\rangle$ it is $${d(V.q23ChiZP, 3)}$ bits, not $1$.`,
      `The best reading of that pair learns $${d(V.q23IBestZP, 3)}$ bits and a $z$ reading $${d(V.q23IZPz, 3)}$: the bound is a ceiling, not a promise.`,
      `The four BB84 states have $\\chi = ${d(V.q23ChiBB84, 0)}$, but any reading learns only $${d(V.q23IBB84z, 1)}$ bit.`,
      `Unambiguous discrimination of two states at overlap $0.5$ fails with chance at least $${d(V.q23UsdBound05, 3)}$; the best machine fails with $${d(V.q23UsdPfExact05, 1)}$.`,
      `With an entangled partner the four Bell states have $\\chi = ${d(V.q23ChiBellPair, 0)}$, while Alice’s qubit alone carries $${d(V.q23ChiBellAliceOnly, 0)}$.`,
    ],
    equations: 'I(X{:}Y) \\le S(\\rho) - \\sum_xp_xS(\\rho_x)',
    trap: 'Thinking that Bob can always learn $\\chi$.',
    formal: {
      points: [
        '$I(X{:}Y) \\le \\chi = S(\\rho) - \\sum_xp_xS(\\rho_x)$ for every POVM (Bergou p. 196, Eq. 11.20); the accessible information is the largest $I$ and can be smaller.',
        `For two equiprobable pure states $\\chi = h(\\tfrac{1+s}{2})$: $${d(V.q23ChiZP, 4)}$ at $s = ${d(V.q23PairOverlap, 4)}$, against $I_{\\mathrm{acc}} = ${d(V.q23IBestZP, 4)}$.`,
        'The proof chains $S(P{:}Q) = S(P{:}QM) \\ge S(P\'{:}Q\'M\') \\ge S(P\'{:}M\')$, none of whose steps raises the mutual information (Eqs. 11.21–11.29).',
        `Unambiguous discrimination obeys $P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N$ (Eq. 11.40): $${d(V.q23UsdBound05, 4)}$ at $s = 0.5$.`,
      ],
      equations: 'I(X{:}Y) \\le \\chi,\\quad P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N',
      trap: 'Taking the Holevo number for the information a measurement gains: it is only an upper bound.',
    },
  },
}
