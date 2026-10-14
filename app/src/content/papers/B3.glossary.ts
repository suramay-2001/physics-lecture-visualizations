/**
 * Background chapter B3 glossary (the Papers section), merged into the lazy papers pack by file name (pack.ts). DATA ONLY, like the spec beside it: one `export const GLOSSARY`
 * literal. Ids start `pp-`; every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a first use that
 * carries its tag in both tracks. The entries marked `introduces` are the notation beats of the chapter.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'pp-product-measurement',
    term: 'Pauli product measurement',
    gloss: 'Reading whether several stored qubits agree, in one go, without reading any of them alone.',
    formal: 'Measuring a product of Paulis, e.g. $Z_1Z_2$ or $\\bar Z_1\\bar Z_2$, without measuring either factor (Lit19a Introduction).',
    first: 'b3-logical-measure:b2',
  },
  {
    id: 'pp-stabilizer-update',
    term: 'update rule',
    gloss: 'What happens to the checks of a state when a Pauli is measured: a fixed answer, a swapped check, or a new check.',
    formal: 'If $\\pm P\\in S$ the outcome is fixed; otherwise it is a fair coin and $P$ replaces a clashing generator, or joins $S$ when none clashes.',
    first: 'b3-logical-measure:b3',
    introduces: 'notation',
  },
  {
    id: 'pp-logical-measurement',
    term: 'logical measurement',
    gloss: 'Reading one number about the stored qubits, not about the physical ones.',
    formal: 'Measuring a logical Pauli $L\\in N(S)\\setminus S$: $\\pm L$ joins $S$ and $k$ drops by one.',
    first: 'b3-logical-measure:b4',
  },
  {
    id: 'pp-lattice-surgery',
    term: 'lattice surgery',
    gloss: 'Joining two patches for a while to measure a product of their logicals, then separating them.',
    formal: 'A merge (seam qubits in $|0\\rangle$, new $X$ checks, about $d$ rounds) followed by a split ($Z$ readout of the seam), after Hor12 §3.',
    first: 'b3-surgery:b1',
  },
  {
    id: 'pp-code-deformation',
    term: 'code deformation',
    gloss: 'Changing the checks for a while; the stored data survive if the distance stays large enough.',
    formal: 'A sequence of codes sharing the logical qubits, with the distance kept throughout.',
    first: 'b3-surgery:b1',
  },
  {
    id: 'pp-gauging',
    term: 'gauging measurement',
    gloss: 'Measuring a logical by attaching a graph of new qubits to the qubits where it acts.',
    formal: 'WY24 Algorithm 1: edge qubits in $|0\\rangle$, vertex checks $A_v$ and cycle checks $B_c$, outcome $\\sigma=\\prod_vA_v$.',
    first: 'b3-gauging:b1',
  },
  {
    id: 'pp-aux-graph',
    term: 'auxiliary graph',
    gloss: 'A graph whose dots sit on the support of the logical and whose links are new qubits.',
    formal: 'A connected graph $G=(V,E)$ with $V\\leftrightarrow\\operatorname{supp}L$ and one new qubit per edge.',
    first: 'b3-gauging:b1',
  },
  {
    id: 'pp-vertex-check',
    term: 'dot check',
    gloss: 'An X check on one dot and on all the links that touch it.',
    formal: 'The vertex check $A_v=X_v\\prod_{e\\ni v}X_e$.',
    first: 'b3-gauging:b2',
    introduces: 'notation',
  },
  {
    id: 'pp-cycle-check',
    term: 'loop check',
    gloss: 'A Z check on all the links of one loop of the graph.',
    formal: 'The cycle check $B_c=\\prod_{e\\in c}Z_e$ for a cycle $c$ of a basis.',
    first: 'b3-gauging:b2',
    introduces: 'notation',
  },
  {
    id: 'pp-cycle-basis',
    term: 'cycle basis',
    gloss: 'A list of independent loops from which every loop of the graph can be built.',
    formal: '$E-V+1$ cycles generating the null space of the incidence matrix over GF(2).',
    first: 'b3-gauging:b3',
    introduces: 'notation',
  },
  {
    id: 'pp-cheeger',
    term: 'Cheeger constant',
    gloss: 'The worst bottleneck of a graph: the fewest links leaving a set of dots, per dot in the set.',
    formal: '$h(G)=\\min_{0<|S|\\le|V|/2}|\\partial S|/|S|$ with $\\partial S$ the edges leaving $S$.',
    first: 'b3-distance:b2',
    introduces: 'notation',
  },
  {
    id: 'pp-gauge-qubit',
    term: 'gauge qubit',
    gloss: 'A spare qubit that no check constrains; it carries no data.',
    formal: 'An unfixed degree of freedom of a subsystem code.',
    first: 'b3-distance:b3',
  },
  {
    id: 'pp-time-like',
    term: 'time-like failure',
    gloss: 'A measurement that lies, as opposed to a qubit that errs; repeating the measurement guards against it.',
    formal: 'A flipped check outcome, guarded by repeating the measurement for about $d$ rounds.',
    first: 'b3-distance:b4',
  },
  {
    id: 'pp-bridge',
    term: 'bridge',
    gloss: 'Extra links that join the measurement graphs of two code blocks.',
    formal: '$w$ edges between $G_A$ and $G_B$, adding $w-1$ cycles (Cro24 §3.6).',
    first: 'b3-bridges:b1',
  },
  {
    id: 'pp-adapter',
    term: 'adapter',
    gloss: 'A one-to-one matching of dots that joins the graphs of two different codes.',
    formal: 'A matching between equal-size vertex subsets of two graphs (SJY24 Def. 8).',
    first: 'b3-bridges:b3',
  },
]
