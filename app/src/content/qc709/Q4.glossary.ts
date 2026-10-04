/**
 * Chapter Q4 glossary (Physics 709; P-Q4-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased; `bridge`
 * names a Spin Lab unit (content/qc709/bridges.ts) that teaches the same idea, offered in the popover. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts).
 *
 * `qc-tensor-product` and `qc-xor` are owned by Q4 until F6 and F7 are planned (ruling qc709-Q4Q5.md #3); those
 * chapters then take ownership and Q4's beats become link-backs.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  /* q4-qubit (the `qubit` term itself is 448's own, content/glossary.ts, first at l1-quantized) */
  {
    id: 'qc-computational-basis',
    term: 'computational basis',
    gloss: 'The two states |0⟩ and |1⟩ of a qubit, or the strings |x⟩ of a register.',
    formal: 'The orthonormal set $\\{|x\\rangle : x \\in \\{0,1\\}^n\\}$.',
    first: 'q4-qubit:b1',
    introduces: 'space',
  },
  /* q4-one-qubit-gates */
  {
    id: 'qc-gate',
    term: 'gate',
    gloss: 'An operation that changes the state of one or more qubits.',
    formal: 'A unitary on $\\mathbb{C}^{2^n}$.',
    first: 'q4-one-qubit-gates:b1',
    bridge: 'qc-l3-operators',
    introduces: 'notation',
  },
  {
    id: 'qc-rotation-operator',
    term: 'rotation operator $R_n(\\chi)$',
    gloss: 'A gate written as a turn by angle χ about an axis n̂, built from n̂·σ.',
    formal: '$R_n(\\chi) = e^{-i\\chi\\hat n\\cdot\\vec\\sigma/2} = \\cos\\tfrac\\chi2 I - i\\sin\\tfrac\\chi2\\,\\hat n\\cdot\\vec\\sigma$.',
    first: 'q4-one-qubit-gates:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-phase-gate',
    term: 'phase gate $P(\\chi)$',
    gloss: 'The gate that keeps |0⟩ and multiplies |1⟩ by a pure turn of angle χ.',
    formal: '$\\mathrm{diag}(1, e^{i\\chi}) = e^{i\\chi/2}R_z(\\chi)$; $S = P(\\pi/2)$, $T = P(\\pi/4)$.',
    first: 'q4-one-qubit-gates:b6',
    bridge: 'qc-l6-equator',
  },
  /* q4-registers (`global phase` is 448's own term, content/glossary.ts, first at l1-vectors:b5) */
  {
    id: 'qc-register',
    term: 'register',
    gloss: 'Several qubits taken together as one system.',
    formal: 'ℂ² ⊗ ⋯ ⊗ ℂ², dimension 2ⁿ.',
    first: 'q4-registers:b1',
    introduces: 'space',
  },
  {
    id: 'qc-tensor-product',
    term: 'tensor product $\\otimes$',
    gloss: 'Two qubits side by side: each joint amplitude is a product of one amplitude from each.',
    formal: '$(|a\\rangle \\otimes |b\\rangle)_{ij} = a_ib_j$.',
    first: 'q4-registers:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-tensor-operator',
    term: 'operator tensor product $A \\otimes B$',
    gloss: 'A gate acting on one wire written as that gate times I on the other wire.',
    formal: '$(A \\otimes B)(|a\\rangle \\otimes |b\\rangle) = A|a\\rangle \\otimes B|b\\rangle$; a gate on one wire is $U \\otimes I$.',
    first: 'q4-registers:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-coefficient-matrix',
    term: 'coefficient matrix',
    gloss: 'A two-qubit state’s four amplitudes laid out as a 2×2 table, one row per first-qubit digit.',
    formal: '$C_{ab} = \\langle a_0b_1|\\Psi\\rangle$; a product state has $\\det C = 0$.',
    first: 'q4-registers:b5',
    introduces: 'notation',
  },
  /* q4-cnot */
  {
    id: 'qc-cnot',
    term: 'CNOT',
    gloss: 'The two-qubit gate that flips the target when the control is |1⟩.',
    formal: '$|0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes X$.',
    first: 'q4-cnot:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-xor',
    term: 'XOR $\\oplus$',
    gloss: 'Adding two bits and forgetting any carry: 1 ⊕ 1 = 0.',
    formal: 'Addition mod 2.',
    first: 'q4-cnot:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-controlled-gate',
    term: 'controlled gate',
    gloss: 'A gate applied to the target only when the control qubit is |1⟩.',
    formal: '$|0\\rangle\\langle0| \\otimes I + |1\\rangle\\langle1| \\otimes U$.',
    first: 'q4-cnot:b4',
    introduces: 'notation',
  },
  /* q4-circuits */
  {
    id: 'qc-circuit',
    term: 'circuit',
    gloss: 'Wires for qubits and boxes for gates, read left to right in time.',
    formal: 'A product $U_K\\cdots U_1$ drawn in time order.',
    first: 'q4-circuits:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-bell-state',
    term: 'Bell state',
    gloss: 'One of four two-qubit states made by H then CNOT; $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$.',
    formal: '$\\beta_{xy} = (|0,y\\rangle + (-1)^x|1,\\bar y\\rangle)/\\sqrt2$.',
    first: 'q4-circuits:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-swap-gate',
    term: 'SWAP',
    gloss: 'The gate that exchanges two qubits’ states.',
    formal: '$|a,b\\rangle \\mapsto |b,a\\rangle$, built from three CNOTs.',
    first: 'q4-circuits:b3',
  },
  {
    id: 'qc-universal-gate-set',
    term: 'universal gate set',
    gloss: 'A few kinds of gate from which every gate can be built.',
    formal: 'CNOT and $U(2)$ generate $U(2^n)$.',
    first: 'q4-circuits:b4',
  },
  /* q4-measure */
  {
    id: 'qc-partial-measurement',
    term: 'partial measurement',
    gloss: 'Reading only one qubit of a register: its chances add up the matching amplitudes.',
    formal: '$P(q_0{=}0) = |\\alpha_{00}|^2 + |\\alpha_{01}|^2$, post-state rescaled to length 1.',
    first: 'q4-measure:b2',
    introduces: 'notation',
  },
]
