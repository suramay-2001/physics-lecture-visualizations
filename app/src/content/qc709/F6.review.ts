/**
 * Chapter F6 review cards, both tracks (plan: docs/roles/proposals/P-F6-story.md §6, pending in the plan and
 * authored here following F3's pattern). ≤ 5 points; Ground-up sentences ≤ 25 words, Formal ≤ 40; every number is
 * an F6 claim already used in the story.
 */
import type { ReviewCard } from '../schema'
import { C } from './F6.story'

export const F6_REVIEW: Record<string, ReviewCard> = {
  'f6-pairs': {
    points: [
      'Two systems with $m$ and $n$ states have $mn$ joint states, living in $\\mathbb C^m \\otimes \\mathbb C^n$.',
      'The joint basis states are $|ab\\rangle$, indexed big-endian: $|10\\rangle$ is index 2.',
      'A two-qubit register is one list of four amplitudes, not two lists of two.',
      'Ten qubits need $2^{10} = 1024$ amplitudes: dimensions multiply, they do not add.',
    ],
    equations: '\\dim(V \\otimes W) = \\dim V \\cdot \\dim W,\\quad |ab\\rangle',
    trap: 'Thinking $n$ systems need $n$ times the numbers. They need the PRODUCT of each system’s count, not the sum.',
    claims: [C.twoQDim, C.idx10, C.tenDim],
    formal: {
      points: [
        'The joint space $V \\otimes W$ of spaces of dimension $m, n$ has dimension $mn$ (Axler 9.73).',
        'The basis $\\{|a\\rangle \\otimes |b\\rangle\\} = \\{|ab\\rangle\\}$ is indexed $\\sum_k b_k 2^{n-1-k}$ (big-endian).',
        'A register is a unit vector in $\\mathbb C^{2^n}$, not a pair of smaller vectors.',
        'Dimension is multiplicative over factors: $\\dim = \\prod_i \\dim V_i$, so $n = 10$ gives $2^{10} = 1024$.',
      ],
      trap: 'Dimension is multiplicative, never additive, over tensor factors.',
    },
  },
  'f6-kron': {
    points: [
      'The tensor product multiplies every amplitude of the first factor by every amplitude of the second.',
      'For $(a_0, a_1) \\otimes (b_0, b_1)$ the result is $(a_0b_0, a_0b_1, a_1b_0, a_1b_1)$.',
      '$|{+}0\\rangle$’s amplitudes are 0.707, 0, 0.707, 0: the second qubit stays sharp at $|0\\rangle$.',
      'Order matters: $|0\\rangle \\otimes |1\\rangle$ and $|1\\rangle \\otimes |0\\rangle$ are different basis states.',
    ],
    equations: '(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b',
    trap: 'Adding amplitudes instead of multiplying them. $\\otimes$ is a product of lists, never a sum.',
    claims: [C.plusZeroRe, C.idx01, C.idx10],
    formal: {
      points: [
        '$(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b$ (Axler 9.72; N&C §2.1.7), extended bilinearly from a basis.',
        '$|{+}\\rangle \\otimes |0\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |10\\rangle)$: the second factor $|0\\rangle$ zeroes every $b=1$ term.',
        '$\\otimes$ is not commutative on labelled factors: $|01\\rangle \\ne |10\\rangle$ as basis vectors.',
      ],
      trap: 'Bilinearity is not commutativity: $\\otimes$ distributes over sums but does not commute on kets.',
    },
  },
  'f6-operator': {
    points: [
      'The Kronecker product $A \\otimes B$ is a block table: $B$ copied into every slot of $A$, scaled.',
      '$(A \\otimes B)(u \\otimes v) = Au \\otimes Bv$: each machine acts on its own factor.',
      '$X \\otimes I$ is a local operator: it changes qubit 1 only, leaving qubit 2 untouched.',
      '$X \\otimes I \\ne I \\otimes X$: the two tables differ, though local operators on different parts commute.',
    ],
    equations: '(A \\otimes B)_{(aa\'),(bb\')} = A_{ab}B_{a\'b\'},\\quad (A \\otimes B)(u \\otimes v) = Au \\otimes Bv',
    trap: 'Thinking $A \\otimes B$ equals $B \\otimes A$. The tables differ, even though local operators commute as operators.',
    claims: [C.xi, C.xiOn01, C.xiEqIX],
    formal: {
      points: [
        '$(A \\otimes B)_{(aa\'),(bb\')} = A_{ab}B_{a\'b\'}$: an $mn \\times mn$ block matrix (N&C §2.1.7).',
        '$(A \\otimes B)(u \\otimes v) = Au \\otimes Bv$, extended bilinearly to every state (Axler 9D).',
        '$A \\otimes I$ acts on system A alone: $\\langle ab|(A \\otimes I)|a\'b\'\\rangle = A_{aa\'}\\delta_{bb\'}$.',
        '$A \\otimes B = (A \\otimes I)(I \\otimes B)$: local operators on different parts commute, though $A \\otimes B \\ne B \\otimes A$ in general.',
      ],
      trap: 'Commuting as operators does not make $X \\otimes I$ and $I \\otimes X$ equal tables.',
    },
  },
  'f6-product-or-not': {
    points: [
      'A product state $|\\psi\\rangle \\otimes |\\varphi\\rangle$ splits back into two single states; an entangled one does not.',
      'The test: write the amplitudes as a table $C$; product exactly when $\\det C = 0$.',
      '$|{+}{+}\\rangle$ is a product ($\\det C = 0$); the Bell state is entangled ($\\det C = \\tfrac12$).',
      'The Schmidt rank (how many terms you truly need) is 2 for the Bell state in every local basis.',
    ],
    equations: '\\text{product} \\Leftrightarrow \\det C = c_{00}c_{11} - c_{01}c_{10} = 0',
    trap: 'Thinking a basis change could hide entanglement. The Schmidt rank is invariant under local basis changes.',
    claims: [C.prodDet, C.bellDet, C.bellSchmidt],
    formal: {
      points: [
        'A two-qubit state is a product iff its coefficient matrix $C = [c_{ab}]$ has rank 1, i.e. $\\det C = 0$.',
        '$|{+}{+}\\rangle$: $\\mathrm{rank}\\,C = 1$. $\\Phi^+$: $\\mathrm{rank}\\,C = 2$, with reduced states $\\tfrac12 I$ (Chapter Q8).',
        'Entanglement is exactly a non-factoring joint state, never a basis-dependent artifact.',
        'The Schmidt rank is invariant under local basis changes $C \\to UCV^\\top$ (both unitary).',
      ],
      trap: 'Entanglement is a property of the state, never of the chosen local bases.',
    },
  },
  'f6-growth': {
    points: [
      'Inner products factor over $\\otimes$: $\\langle a{\\otimes}b|c{\\otimes}d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$.',
      'A product of unit-length states is itself unit length.',
      'Dimensions multiply: $n$ qubits need $2^n$ amplitudes, 16 bytes each — 30 qubits already need 16 GiB.',
      'A product state uses only $2n$ real parameters; a general state needs $2 \\cdot 2^n - 2$: about 1% at $n=10$.',
    ],
    equations: '\\langle a{\\otimes}b|c{\\otimes}d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle,\\quad \\dim = 2^n',
    trap: 'Thinking storage or parameter count grows linearly with the number of qubits. Both grow exponentially.',
    claims: [C.prodNorm, C.mem30, C.prodFrac],
    formal: {
      points: [
        'The inner product on $V \\otimes W$ factors: $\\langle a{\\otimes}b|c{\\otimes}d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$ (Axler 9D).',
        '$\\{e_j \\otimes f_k\\}$ is a basis of $V \\otimes W$: $\\dim(V \\otimes W) = \\dim V \\cdot \\dim V$.',
        'An $n$-qubit register needs $2^n \\times 16$ bytes: $n=30 \\Rightarrow 16$ GiB, $n=50 \\Rightarrow 16$ PiB.',
        'A product state’s $2n$ real parameters are a vanishing fraction of a general state’s $2\\cdot2^n-2$: entanglement is generic.',
      ],
      trap: 'Exponential growth, not linear: the memory wall is why quantum systems are hard to simulate classically.',
    },
  },
}
