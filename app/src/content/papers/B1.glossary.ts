/**
 * Background chapter B1 glossary (the Papers section; docs/specs/papers-platform.md), merged into the lazy papers pack by file name
 * (pack.ts). DATA ONLY, like the spec beside it (papers/specData.test.ts): one `export const GLOSSARY` literal. Ids start `pp-`;
 * every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a
 * first use that carries its tag in both tracks. The nine entries marked `introduces` are the notation beats of the chapter.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'pp-tanner-graph',
    term: 'Tanner graph',
    gloss: 'A drawing with a disc for each qubit and a square for each check, joined when the check acts on the qubit.',
    formal: 'The bipartite graph of the check matrices $H_X$ and $H_Z$: qubit $j$ joins check $c$ when the matrix entry is 1 (BE21 §II.2.2).',
    first: 'b1-toric:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-toric-code',
    term: 'toric code',
    gloss: 'Qubits on the edges of a grid wrapped into a torus, with a check at every corner and every tile.',
    formal: 'Kitaev’s code with $n = 2L^2$ edge qubits, stars $A_s$ and plaquettes $B_f$, $k = 2$ and $d = L$ (Kit03 §1).',
    first: 'b1-toric:b2',
  },
  {
    id: 'pp-logical-loop',
    term: 'logical loop',
    gloss: 'A loop round the torus that lights no check yet changes the stored qubits; its partner, a cut, acts the other way.',
    formal: 'A non-contractible Z chain, or the X cut across it, that commutes with every check and is not a stabilizer; the distance is $d = L$.',
    first: 'b1-toric:b5',
    introduces: 'notation',
  },
  {
    id: 'pp-rotated-surface-code',
    term: 'rotated surface code',
    gloss: 'The compact patch with $d^2$ data qubits and $d^2-1$ checks, turned by 45 degrees from the first design.',
    formal: 'The planar surface code drawn on a rotated lattice (Hor+12 §7.1), with checks of weight 4 in the bulk and weight 2 on the boundary.',
    first: 'b1-planar:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-surface-code-patch',
    term: 'patch',
    gloss: 'One logical qubit stored in a tile of about $2d^2$ qubits.',
    formal: 'A tile of the Litinski model: $d^2$ data qubits and $d^2-1$ check qubits, $2d^2-1$ in all.',
    first: 'b1-planar:b4',
    introduces: 'notation',
  },
  {
    id: 'pp-circuit-noise',
    term: 'circuit noise',
    gloss: 'The model in which every preparation, gate, wait and readout can fail.',
    formal: 'Faults with probability $p$ for preparation and measurement, $p/3$ per Pauli for an idle and $p/15$ per two-qubit Pauli for a CNOT (paper §2.6).',
    first: 'b1-cycle:b4',
    introduces: 'notation',
  },
  {
    id: 'pp-phenomenological-noise',
    term: 'phenomenological noise',
    gloss: 'A simpler model: only qubits and readouts fail, and the check circuits are perfect.',
    formal: 'Data errors with probability $p$ and readout flips with probability $q$, with perfect check circuits (Den+02 §III.3).',
    first: 'b1-cycle:b4',
  },
  {
    id: 'pp-detector',
    term: 'detector',
    gloss: 'A change in a check’s reading between two rounds.',
    formal: 'The XOR $D(i,t) = m_{i,t}\\oplus m_{i,t-1}$ of one check’s outcomes in consecutive rounds.',
    first: 'b1-spacetime:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-matching-decoder',
    term: 'matching decoder',
    gloss: 'A decoder that pairs lit detectors using the fewest faults in all.',
    formal: 'A decoder that returns a minimum-weight perfect matching of the lit detectors, with edges to a boundary (Den+02 §IV.7).',
    first: 'b1-spacetime:b2',
  },
  {
    id: 'pp-pauli-frame',
    term: 'Pauli frame',
    gloss: 'A classical list of fixes not yet applied, updated as gates act.',
    formal: 'A classically stored Pauli $K$, updated through each Clifford $U$ by $K \\mapsto UKU^\\dagger$.',
    first: 'b1-spacetime:b5',
    introduces: 'notation',
  },
  {
    id: 'pp-threshold',
    term: 'threshold',
    gloss: 'The error rate below which bigger codes do better and above which they do worse.',
    formal: 'The rate $p_c$ below which the logical error falls with the distance (Den+02); the $p^*$ of the fits is a reference rate, not this.',
    first: 'b1-threshold:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-fault-tolerance',
    term: 'fault tolerance',
    gloss: 'A design that keeps the circuit distance equal to the code distance.',
    formal: 'A gadget whose circuit distance equals $d$, so that fewer than $d/2$ faults are correctable (Rof19 §6.3).',
    first: 'b1-threshold:b4',
  },
  {
    id: 'pp-circuit-distance',
    term: 'circuit distance',
    gloss: 'The fewest faults anywhere in a circuit that flip the stored qubit unseen.',
    formal: 'The fewest circuit faults with trivial detectors and a logical flip, written $d_{\\text{circ}}$ (paper §2.6).',
    first: 'b1-threshold:b4',
    introduces: 'notation',
  },
]
