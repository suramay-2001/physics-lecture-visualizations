/**
 * Chapter Q26 glossary (Physics 709; P-Q26-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence (`gloss`, ≤ 25 words)
 * and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-`. `introduces` marks the two notation beats: the scattering matrix S (q26-beamsplitter:b1) and the Fock state
 * |ij> (q26-beamsplitter:b4), each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-beam-splitter, qc-photon-modes, qc-mach-zehnder, qc-phase-shifter, qc-polarization, qc-photon-space, qc-teleportation, qc-cnot, qc-phase-gate,
 * qc-swap-gate and qc-bell-measurement, and 448's polarizing-beam-splitter and wave-plate. Not tagged here (parallel plans own them): the Lindblad, Rabi and Zeeman entries of
 * Chapters Q24 and Q25.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-linear-optics',
    term: 'linear optics',
    gloss: 'Mirrors, splitters, wave plates and phase shifters: parts that treat every photon alike.',
    formal: 'Devices whose action on the modes is a unitary matrix on the creation operators (Bergou Chapter 14).',
    first: 'q26-encodings:b1',
  },
  {
    id: 'qc-dual-rail',
    term: 'dual-rail qubit',
    gloss: 'A qubit stored in which of two paths one photon takes.',
    formal: 'The states $|0\\rangle$ and $|1\\rangle$ mean one photon in path 0 or in path 1, the one-photon mode space (Bergou p. 257).',
    first: 'q26-encodings:b4',
    bridge: 'qc-q5-interferometer',
  },
  {
    id: 'qc-scattering-matrix',
    term: 'scattering matrix $S$',
    gloss: 'The table that turns the amplitudes entering a splitter into the amplitudes leaving it.',
    formal: "$S = \\begin{pmatrix}t' & r\\\\ r' & t\\end{pmatrix}$, unitary for a lossless splitter (Bergou Fig. 14.2).",
    first: 'q26-beamsplitter:b1',
    introduces: 'notation',
    symbols: ['S'],
    bridge: 'qc-f4-unitary',
  },
  {
    id: 'qc-stokes-relations',
    term: 'Stokes relations',
    gloss: `The rules that $t$, $r$, $t'$ and $r'$ obey when no light is lost.`,
    formal: "$|r| = |r'|$, $|t| = |t'|$ and $rt'^* + r'^*t = 0$ for a lossless splitter (eq. 14.1).",
    first: 'q26-beamsplitter:b2',
  },
  {
    id: 'qc-fock-state',
    term: 'Fock state $|ij\\rangle_{23}$',
    gloss: 'A state with an exact number of photons in each mode.',
    formal: '$|ij\\rangle_{23}$ has $i$ photons in mode 2 and $j$ photons in mode 3; it is a label for occupations, not a register of two qubits.',
    first: 'q26-beamsplitter:b4',
    introduces: 'notation',
    symbols: ['|ij\\rangle'],
  },
  {
    id: 'qc-hong-ou-mandel',
    term: 'Hong–Ou–Mandel effect',
    gloss: 'Two identical photons meeting on a 50:50 splitter leave together by the same exit.',
    formal: "$a_0^\\dagger a_1^\\dagger \\to (|20\\rangle + e^{i\\phi}|02\\rangle)/\\sqrt2$, because $t't + r'r = 0$ for a lossless 50:50 splitter.",
    first: 'q26-hom:b1',
  },
  {
    id: 'qc-nonlinear-sign-gate',
    term: 'nonlinear sign gate',
    gloss: 'A gate that multiplies the two-photon component of a state by minus one and leaves the rest alone.',
    formal: '$c_0|0\\rangle + c_1|1\\rangle + c_2|2\\rangle \\to c_0|0\\rangle + c_1|1\\rangle - c_2|2\\rangle$ on one mode (Bergou p. 258).',
    first: 'q26-ns-cz:b1',
  },
  {
    id: 'qc-heralded-gate',
    term: 'heralded gate',
    gloss: 'A gate that works only when detectors show an agreed signal; then we know it worked.',
    formal: 'A gate accepted on an agreed detection pattern; a run that shows any other pattern is discarded.',
    first: 'q26-ns-cz:b1',
  },
  {
    id: 'qc-gate-teleportation',
    term: 'gate teleportation',
    gloss: 'Doing a gate on a qubit by teleporting it through a prepared entangled state.',
    formal: 'Applying a unitary by Bell measurements on a resource state and Pauli fix-ups (Knill, Laflamme and Milburn).',
    first: 'q26-teleport-gate:b1',
    bridge: 'qc-q11-teleport-circuit',
  },
  {
    id: 'qc-klm',
    term: 'KLM scheme',
    gloss: 'The plan that makes linear-optics gates succeed with chance close to 1 by using many photons.',
    formal: 'Gate teleportation with success $P_n = (n/(n+1))^2$ (Knill, Laflamme and Milburn 2001).',
    first: 'q26-teleport-gate:b5',
  },
  {
    id: 'qc-cross-kerr',
    term: 'cross-Kerr phase',
    gloss: 'A phase that depends on the photon numbers in two modes.',
    formal: '$e^{i\\varphi\\hat n_1\\hat n_2}$, a phase on the pair of occupations (eq. 14.3).',
    first: 'q26-nonlinear:b1',
  },
  {
    id: 'qc-jaynes-cummings',
    term: 'Jaynes–Cummings model',
    gloss: 'One two-level atom exchanging energy with one light mode.',
    formal: '$\\hat H = \\hbar\\omega_a\\sigma_z/2 + \\hbar\\omega\\hat a^\\dagger\\hat a + \\tfrac{\\hbar\\Omega_0}{2}(\\hat a\\sigma_+ + \\hat a^\\dagger\\sigma_-)$ for one atom and one mode.',
    first: 'q26-nonlinear:b2',
    bridge: 'qc-l11-two-level',
  },
  {
    id: 'qc-dispersive-shift',
    term: 'dispersive shift $\\chi$',
    gloss: 'The small energy change each photon causes when atom and light are far from resonance.',
    formal: '$\\chi = \\frac{\\Omega_0^2}{4\\Delta}$ when $|\\Delta| \\gg \\Omega_n$: each photon moves the level by $\\hbar\\chi$.',
    first: 'q26-nonlinear:b3',
  },
  {
    id: 'qc-coherent-state',
    term: 'coherent state',
    gloss: 'The state of laser light: a Poisson-spread photon number.',
    formal: '$|\\alpha\\rangle = e^{-|\\alpha|^2/2}\\sum_n\\alpha^n|n\\rangle/\\sqrt{n!}$, an eigenstate of $\\hat a$ with eigenvalue $\\alpha$.',
    first: 'q26-nonlinear:b5',
  },
  {
    id: 'qc-cat-state',
    term: 'cat state',
    gloss: 'A sum or difference of two opposite coherent states.',
    formal: '$|\\alpha\\rangle \\pm |-\\alpha\\rangle$: even or odd photon number, so the two are orthogonal to each other.',
    first: 'q26-nonlinear:b5',
  },
]
