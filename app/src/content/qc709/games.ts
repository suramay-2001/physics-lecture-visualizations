/**
 * Physics 709 Arcade (F1 + Q1 pilots): the ten levels the pilot plans specify (P-F1-story.md §11.2, P-Q1-story.md
 * §11.2), grouped by format the same way 448's are (arcade/games.ts). Every verdict comes from the engine; solutions
 * live here for the tests and are never shown. content/qc709/games.test.ts recomputes each correction independently.
 *
 * Lazy module: only the 709 pages and GamePage import this (chunk contract (h), build/chunks.test.ts) — it must
 * never reach 448's first paint. Ids start `qc-` (content/courses.test.ts). Types are shared with 448's arcade
 * (`import type`, erased at build: no runtime edge into arcade/games.ts's chunk).
 */
import type { ErrorRound, GameEntry, GolfLevel, SgLevel, Trains } from '../../arcade/games'

const F1x = (unit: string, label: string): Trains => ({ lecture: 'F1', unit, label })
const NL1 = F1x('f1-number-line', 'F1.1 The gap that x² = −1 leaves')
const PL1 = F1x('f1-plane', 'F1.2 Numbers as points and arrows')
const ML1 = F1x('f1-multiply', 'F1.3 Multiplying stretches and turns')
const EU1 = F1x('f1-euler', 'F1.4 eⁱᵠ: walking round the unit circle')
const PH1 = F1x('f1-phase', 'F1.5 Phases you can and cannot see')

const F2x = (unit: string, label: string): Trains => ({ lecture: 'F2', unit, label })
const VE2 = F2x('f2-vectors', 'F2.1 Lists you can add: ℂⁿ and kets')
const IP2 = F2x('f2-inner-product', 'F2.2 Bra meets ket: ⟨α|β⟩')
const NA2 = F2x('f2-norm-angle', 'F2.3 Length, right angles, and the law of cosines')
const ON2 = F2x('f2-orthonormal', 'F2.4 A frame at right angles: components by inner products')
const GS2F = F2x('f2-gram-schmidt', 'F2.5 Straightening a skew frame: Gram–Schmidt')
const F3x = (unit: string, label: string): Trains => ({ lecture: 'F3', unit, label })
const LM3 = F3x('f3-linear-maps', 'F3.1 Machines that respect addition')
const MM3 = F3x('f3-matrix-of-map', 'F3.2 A map becomes a table')
const PR3 = F3x('f3-products', 'F3.3 One map then another: matrix products')
const AD3 = F3x('f3-adjoint', 'F3.4 The mirror of a map')
const CB3 = F3x('f3-change-of-basis', 'F3.5 The same map in a new frame')

const F4x = (unit: string, label: string): Trains => ({ lecture: 'F4', unit, label })
const EI4 = F4x('f4-eigen', 'F4.1 The arrows a machine only stretches')
const HE4 = F4x('f4-hermitian', 'F4.2 Tables equal to their own mirror')
const SP4 = F4x('f4-spectral', 'F4.3 Building and reading a matrix by its directions')
const UN4 = F4x('f4-unitary', 'F4.4 Machines that keep every length')
const CO4 = F4x('f4-commuting', 'F4.5 When two machines share directions')
const PO4 = F4x('f4-positive', 'F4.6 Tables with no negative stretch; square roots')

const F5x = (unit: string, label: string): Trains => ({ lecture: 'F5', unit, label })
const CH5 = F5x('f5-probability', 'F5.1 Chances over a list of outcomes')
const EX5 = F5x('f5-average', 'F5.2 The number you expect on average')
const SC5 = F5x('f5-spread', 'F5.3 How widely the readings scatter')
const BI5 = F5x('f5-surprise', 'F5.4 Counting information in bits')

const Q1x = (unit: string, label: string): Trains => ({ lecture: 'Q1', unit, label })
const TS1 = Q1x('q1-two-spots', 'Q1.1 Two spots from a lopsided magnet')
const SE1 = Q1x('q1-sequences', 'Q1.2 A second magnet can erase the first')
const SU1 = Q1x('q1-superposition', 'Q1.3 Adding states: the superposition principle')
const VS1 = Q1x('q1-vector-space', 'Q1.4 The rules for adding and scaling kets')
const IP1 = Q1x('q1-inner-product', 'Q1.5 Lengths and angles for complex vectors')

const Q2x = (unit: string, label: string): Trains => ({ lecture: 'Q2', unit, label })
const BS2 = Q2x('q2-basis', 'Q2.1 Independent arrows and a basis')
const GS2 = Q2x('q2-gram-schmidt', 'Q2.2 Straightening a basis with Gram–Schmidt')
const SP2 = Q2x('q2-spin-space', 'Q2.3 Spin states in the z and x frames')
const CH2 = Q2x('q2-change', 'Q2.5 Changing coordinates with one matrix')
const PH2 = Q2x('q2-photon', 'Q2.6 Turning the frame of a photon')
const Q3x = (unit: string, label: string): Trains => ({ lecture: 'Q3', unit, label })
const Q5x = (unit: string, label: string): Trains => ({ lecture: 'Q5', unit, label })
const Q6x = (unit: string, label: string): Trains => ({ lecture: 'Q6', unit, label })
const MA6 = Q6x('q6-many', 'Q6.1 Two qubits: the numbers multiply')
const TE6 = Q6x('q6-tensor', 'Q6.2 Operators on pairs: the tensor product')
const EN6 = Q6x('q6-entangled', 'Q6.3 States that will not factor')
const BB6 = Q6x('q6-bell-basis', 'Q6.4 The Bell basis: four entangled states')
const BC6 = Q6x('q6-bell-circuit', 'Q6.5 Reading and writing Bell states')
const PA6 = Q6x('q6-parities', 'Q6.6 Two parities: what the detectors really ask')
const PR5 = Q5x('q5-problem', "Q5.1 Constant or balanced: Deutsch's question")
const OR5 = Q5x('q5-oracle', 'Q5.2 The f-CNOT and the phase kickback')
const DE5 = Q5x('q5-deutsch', "Q5.4 Deutsch's circuit: one query, a global answer")
const IN5 = Q5x('q5-interferometer', 'Q5.5 Two paths, one photon: Deutsch in glass')
const OM5 = Q5x('q5-other-models', 'Q5.6 Two other ways to compute')
const BO3 = Q3x('q3-born', 'Q3.1 Chances from overlaps and projectors')
const BL3 = Q3x('q3-bloch', 'Q3.2 Every spin state is a point on a sphere')
const SO3 = Q3x('q3-spin-operators', 'Q3.3 Spin operators built from projectors')
const SP3 = Q3x('q3-spectral', 'Q3.5 Real eigenvalues, spectral form and spread')
const UN3 = Q3x('q3-uncertainty', 'Q3.6 Commutators and the floor under two spreads')

const Q7x = (unit: string, label: string): Trains => ({ lecture: 'Q7', unit, label })
const GH7 = Q7x('q7-ghz', 'Q7.1 GHZ: three qubits, all or nothing')
const BR7 = Q7x('q7-brackets', 'Q7.2 Reading GHZ in the x and y bases')
const PT7 = Q7x('q7-parity-table', 'Q7.3 One formula for every run')
const BS7 = Q7x('q7-bit-strings', 'Q7.4 Surviving strings carry the parity')
const OB7 = Q7x('q7-observables', 'Q7.5 Four products with certain values')
const ME7 = Q7x('q7-mermin', 'Q7.6 No instruction set can do it')

const Q4x = (unit: string, label: string): Trains => ({ lecture: 'Q4', unit, label })
const QB4 = Q4x('q4-qubit', 'Q4.1 From a bit to a qubit')
const GA4 = Q4x('q4-one-qubit-gates', 'Q4.2 One-qubit gates turn the sphere')
const CN4 = Q4x('q4-cnot', 'Q4.4 CNOT: flip the target when the control is 1')
const CI4 = Q4x('q4-circuits', 'Q4.5 Circuits: wires are time, products run backwards')
const ME4 = Q4x('q4-measure', 'Q4.6 Reading a register, whole or one qubit')

const Q8x = (unit: string, label: string): Trains => ({ lecture: 'Q8', unit, label })
const WH8 = Q8x('q8-why', 'Q8.1 The GHZ box: a coin, not a superposition')
const PR8 = Q8x('q8-pure-rho', 'Q8.2 One state as a matrix')
const TR8 = Q8x('q8-trace-rule', 'Q8.3 Averages and motion from the density matrix')
const MI8 = Q8x('q8-mixed', 'Q8.4 Mixtures: chances without phases')
const BA8 = Q8x('q8-ball', 'Q8.5 The Bloch ball: mixed states inside')
const RE8 = Q8x('q8-recipes', 'Q8.6 One matrix, many recipes')

const Q9x = (unit: string, label: string): Trains => ({ lecture: 'Q9', unit, label })
const PT9 = Q9x('q9-partial-trace', 'Q9.1 Looking at one part: the partial trace')
const SP9 = Q9x('q9-same-part', 'Q9.2 Same part, different whole')
const EN9 = Q9x('q9-entropy', 'Q9.3 Entropy: how mixed is a state?')
const SC9 = Q9x('q9-schmidt', 'Q9.4 The Schmidt form of a pair')
const PU9 = Q9x('q9-purification', 'Q9.5 Every mixture is part of something pure')
const DI9 = Q9x('q9-distance', 'Q9.6 How far apart are two states?')

const Q12x = (unit: string, label: string): Trains => ({ lecture: 'Q12', unit, label })
const PT12 = Q12x('q12-ppt', 'Q12.1 The partial transpose test')
const WI12 = Q12x('q12-witness', 'Q12.2 One observable that spots entanglement')
const LO12 = Q12x('q12-locc', 'Q12.3 Local moves and a shared coin')
const EN12 = Q12x('q12-entropy', 'Q12.4 Entanglement as a number')
const CO12 = Q12x('q12-concurrence', 'Q12.5 Concurrence: one formula for two qubits')
const MU12 = Q12x('q12-multipartite', 'Q12.6 Three qubits: GHZ, W and monogamy')
const Q13x = (unit: string, label: string): Trains => ({ lecture: 'Q13', unit, label })
const FU13 = Q13x('q13-from-unitary', 'Q13.1 Where channels come from')
const PR13 = Q13x('q13-properties', 'Q13.2 What a channel preserves — and the catch')
const ST13 = Q13x('q13-stinespring', 'Q13.3 Every channel is a unitary in disguise')
const DE13 = Q13x('q13-depolarizing', 'Q13.4 The shrinking Bloch ball')
const NC13 = Q13x('q13-no-cloning', 'Q13.5 Why you cannot copy a qubit')
const HE13 = Q13x('q13-herbert', 'Q13.6 Cloning would break relativity')

const Q14x = (unit: string, label: string): Trains => ({ lecture: 'Q14', unit, label })
const PO14 = Q14x('q14-pointer', 'Q14.1 Reading a qubit through a meter')
const PV14 = Q14x('q14-povm', 'Q14.2 More answers than dimensions')
const NM14 = Q14x('q14-neumark', 'Q14.3 Every POVM is projective upstairs')
const US14 = Q14x('q14-usd', 'Q14.4 Never wrong, sometimes unsure')
const ME14 = Q14x('q14-min-error', 'Q14.5 The fewest mistakes: Helstrom')
const CP14 = Q14x('q14-compare', 'Q14.6 The price of certainty')

const Q15x = (unit: string, label: string): Trains => ({ lecture: 'Q15', unit, label })
const OT15 = Q15x('q15-otp', 'Q15.1 A key used once hides anything')
const B915 = Q15x('q15-b92', 'Q15.2 Two look-alike states carry a key')
const BB15 = Q15x('q15-bb84', 'Q15.3 BB84: no error means no information')
const E915 = Q15x('q15-e91', 'Q15.4 Entanglement as the key’s source')
const SH15 = Q15x('q15-sharing', 'Q15.5 Splitting a secret between two people')

const Q21x = (unit: string, label: string): Trains => ({ lecture: 'Q21', unit, label })
const CL21 = Q21x('q21-classical', 'Q21.1 Three copies and a majority vote')
const BF21 = Q21x('q21-bit-flip', 'Q21.2 Checking parities without looking')
const PF21 = Q21x('q21-phase-flip', 'Q21.3 Phase flips are bit flips seen sideways')
const SH21 = Q21x('q21-shor', 'Q21.4 Nine qubits catch any single error')
const DG21 = Q21x('q21-digitize', 'Q21.5 Any error is a mix of four')
const KL21 = Q21x('q21-kl', 'Q21.6 The test every code must pass')
const DF21 = Q21x('q21-dfs', 'Q21.7 Hiding where the noise cannot reach')

const Q22x = (unit: string, label: string): Trains => ({ lecture: 'Q22', unit, label })
const LC22 = Q22x('q22-linear-codes', 'Q22.1 Classical codes from two matrices')
const ST22 = Q22x('q22-stabilizer', 'Q22.2 Naming states by the checks they pass')
const CM22 = Q22x('q22-check-matrix', 'Q22.3 Pauli strings as bits')
const CS22 = Q22x('q22-css', 'Q22.4 Two classical codes that fit together')
const DC22 = Q22x('q22-decode', 'Q22.5 From syndrome to correction')
const CF22 = Q22x('q22-clifford', 'Q22.6 Gates that move Pauli labels around')
const GK22 = Q22x('q22-gottesman-knill', 'Q22.7 When a quantum computer is easy to fake')
const Q19x = (unit: string, label: string): Trains => ({ lecture: 'Q19', unit, label })
const RW19 = Q19x('q19-random-walk', 'Q19.1 A walker that flips a coin')
const SC19 = Q19x('q19-scatter', 'Q19.2 A particle that lives on the edges')
const SS19 = Q19x('q19-star-search', 'Q19.3 Finding the marked spoke')
const EE19 = Q19x('q19-extra-edge', 'Q19.4 Finding an extra edge')
const SM19 = Q19x('q19-simulation', 'Q19.5 Imitating a spin chain with gates')
const QA19 = Q19x('q19-qaoa', 'Q19.6 Quantum circuit, classical tuner')
const Q20x = (unit: string, label: string): Trains => ({ lecture: 'Q20', unit, label })
const CL20 = Q20x('q20-cloner', 'Q20.1 A copier that loses quality')
const UN20 = Q20x('q20-unot', 'Q20.2 The best quantum NOT')
const NG20 = Q20x('q20-no-go', 'Q20.3 No machine runs every program')
const PB20 = Q20x('q20-probabilistic', 'Q20.4 A machine that sometimes fails')
const DI20 = Q20x('q20-discriminator', 'Q20.6 A discriminator that is told the states')
const Q23x = (unit: string, label: string): Trains => ({ lecture: 'Q23', unit, label })
const CC23 = Q23x('q23-classical-compare', 'Q23.1 Comparing two chance tables')
const EP23 = Q23x('q23-entropy-props', 'Q23.3 What entropy can and cannot do')
const QM23 = Q23x('q23-quantum-mutual', 'Q23.5 Quantum correlations that noise cannot raise')
const HO23 = Q23x('q23-holevo', 'Q23.6 How much can one particle carry?')
const Q24x = (unit: string, label: string): Trains => ({ lecture: 'Q24', unit, label })
const LI24 = Q24x('q24-lindblad', 'Q24.2 Why a qubit slowly forgets')
const BE24 = Q24x('q24-bloch-eq', 'Q24.3 Driving a qubit that decays')
const RB24 = Q24x('q24-rabi', 'Q24.4 Pulses that flip, and gates from them')
const RM24 = Q24x('q24-ramsey', 'Q24.5 Two half-pulses and a wait')
const DC24 = Q24x('q24-decoupling', 'Q24.6 Undoing slow noise with flips')
const Q25x = (unit: string, label: string): Trains => ({ lecture: 'Q25', unit, label })
const CO25 = Q25x('q25-cooling', 'Q25.1 Stopping, cooling and holding an atom')
const AG25 = Q25x('q25-atom-gates', 'Q25.3 Rotations, Raman light and Rydberg blockade')
const IT25 = Q25x('q25-ion-trap', 'Q25.4 Holding an ion in the air')
const IG25 = Q25x('q25-ion-gates', 'Q25.6 Entangling ions through their motion')
const Q26x = (unit: string, label: string): Trains => ({ lecture: 'Q26', unit, label })
const HM26 = Q26x('q26-hom', 'Q26.3 Two photons that leave together')
const NS26 = Q26x('q26-ns-cz', 'Q26.4 A sign flip from a heralded photon')
const NL26 = Q26x('q26-nonlinear', 'Q26.6 Photons that talk through matter')
const Q27x = (unit: string, label: string): Trains => ({ lecture: 'Q27', unit, label })
const LC27 = Q27x('q27-lc', 'Q27.1 A circuit that rings')
const SC27 = Q27x('q27-superconductivity', 'Q27.2 Pairs, a flux quantum, no resistance')
const TM27 = Q27x('q27-transmon', 'Q27.4 From charge qubit to transmon')
const DT27 = Q27x('q27-dots', 'Q27.6 One electron spin in a gated dot')
const F7x = (unit: string, label: string): Trains => ({ lecture: 'F7', unit, label })
const BO7 = F7x('f7-boolean', 'F7.1 Functions of bits as truth tables')
const RE7 = F7x('f7-reversible', 'F7.2 Gates that can run backwards')
const XO7 = F7x('f7-xor', 'F7.3 XOR: adding bits without carrying')
const GF7 = F7x('f7-gf2', 'F7.4 Linear algebra with only 0 and 1')
const CO7 = F7x('f7-cost', 'F7.5 Counting the cost of a method')
const F8x = (unit: string, label: string): Trains => ({ lecture: 'F8', unit, label })
const CL8 = F8x('f8-clock', 'F8.1 Clock arithmetic and repeating patterns')
const EU8 = F8x('f8-euclid', 'F8.2 Common factors, inverses and the order')
const RO8 = F8x('f8-roots', 'F8.3 Roots of unity: arrows that cancel')
const DF8 = F8x('f8-dft', 'F8.4 The Fourier transform finds the rhythm')
const GE8 = F8x('f8-geometric', 'F8.5 Near misses: geometric sums and peaks')
const FR8 = F8x('f8-fractions', 'F8.6 From a peak back to the period')

// ── Route the beam (Q1.2) ──────────────────────────────────────────────────────────────────────────────────
export const QC_SG_LEVELS: SgLevel[] = [
  {
    id: 'qc-sixteenth',
    title: 'One sixteenth',
    source: 'oven',
    target: { spot: 'plus', fraction: 1 / 16, label: '1⁄16' },
    maxDevices: 4,
    start: { axes: ['z'], keep: [] },
    hint: 'Every change of axis halves what is left.',
    why: 'Four magnets on alternating axes give four independent halvings: ½ × ½ × ½ × ½ = 1⁄16. (Tilted solutions exist too; any chain that lands 1⁄16 counts.)',
    solution: { axes: ['z', 'x', 'z', 'x'], keep: ['+', '+', '+'] },
    trains: SE1,
  },
  {
    id: 'qc-quarter-minus',
    title: 'A quarter on the minus spot',
    source: '+z',
    target: { spot: 'minus', fraction: 0.25, label: '¼' },
    maxDevices: 1,
    start: { axes: ['z'], keep: [] },
    hint: 'The chance of − is the squared overlap with the magnet’s − state.',
    why: 'A magnet tilted 60° gives P(−) = sin²30° = ¼ (any tilt of ±60° works).',
    solution: { axes: [60], keep: [] },
    trains: BO3,
  },
  {
    id: 'qc-quarter-plus',
    title: 'A quarter on the plus spot',
    source: '+z',
    target: { spot: 'plus', fraction: 0.25, label: '¼' },
    maxDevices: 1,
    start: { axes: ['z'], keep: [] },
    hint: 'A state tipped θ from the north pole reads + with chance cos²(θ/2).',
    why: 'A magnet tilted 120° passes cos²60° = ¼, the qubit of the polar-angle challenge (any tilt of ±120° works).',
    solution: { axes: [120], keep: [] },
    trains: QB4,
  },
]

// ── Bloch golf (Q3.2, Q3.3) ────────────────────────────────────────────────────────────────────────────────
export const QC_GOLF_LEVELS: GolfLevel[] = [
  {
    id: 'qc-golf-antipode',
    title: 'The opposite state',
    start: '+x',
    target: '-x',
    par: 2,
    hint: 'Opposite states are opposite points.',
    why: 'Two quarter turns about z carry +x through +y to −x.',
    solution: [
      { axis: 'z', sign: 1 },
      { axis: 'z', sign: 1 },
    ],
    trains: BL3,
  },
  {
    id: 'qc-golf-plus-y',
    title: 'Up to +y',
    start: '+z',
    target: '+y',
    par: 1,
    hint: 'Turn about the axis at right angles to both z and y.',
    why: 'R_x(−90°) carries +z to +y, the state that splits 50/50 along z and x.',
    solution: [{ axis: 'x', sign: -1 }],
    trains: SO3,
  },
  {
    id: 'qc-golf-h-on-one',
    title: 'H on |1⟩',
    start: '-z',
    target: '-x',
    par: 1,
    hint: 'H sends |1⟩ to |−⟩. Which quarter turn takes the south pole there?',
    why: 'R_y(+90°) carries −z to −x; H itself gets there by a half turn about (x̂ + ẑ)/√2.',
    solution: [{ axis: 'y', sign: 1 }],
    trains: GA4,
  },
]

// ── Spot the error ─────────────────────────────────────────────────────────────────────────────────────────
export const QC_ERROR_ROUNDS: ErrorRound[] = [
  {
    id: 'qc-root-minus-4',
    title: 'The square root of −4',
    steps: ['We want $x$ with $x^2 = -4$.', 'Try $x = -2$: a negative number squared stays negative.', 'So $(-2)^2 = -4$ and $x = -2$.', 'The other root is $+2$.'],
    wrong: 1,
    why: 'A negative number squared is positive: $(-2)^2 = 4$, not $-4$. The roots of $x^2 = -4$ are $\\pm 2i$: $(2i)^2 = 4i^2 = -4$.',
    trains: NL1,
  },
  {
    id: 'qc-size-by-adding',
    title: 'How far is 3 + 4i from zero?',
    steps: ['The real part is 3.', 'The imaginary part is 4.', 'The size adds the parts: $3 + 4 = 7$.', 'So $3 + 4i$ is 7 units from zero.'],
    wrong: 2,
    why: 'The parts are the legs of a right triangle, so the size is the hypotenuse: $|3 + 4i| = \\sqrt{3^2 + 4^2} = 5$, not 7.',
    trains: PL1,
  },
  {
    id: 'qc-sizes-add',
    title: 'The size of a product',
    steps: ['$|2 + i| = 2.236$ and $|1 + 3i| = 3.162$.', 'Multiplying adds the angles.', 'It adds the sizes too: $2.236 + 3.162 = 5.398$.', 'So $|(2 + i)(1 + 3i)| = 5.398$.'],
    wrong: 2,
    why: 'Sizes multiply, they do not add: $|(2 + i)(1 + 3i)| = 2.236 \\times 3.162 = 7.071$.',
    trains: ML1,
  },
  {
    id: 'qc-degrees-in-euler',
    title: 'Half a turn in Euler’s formula',
    steps: ['$e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$.', 'Half a turn is 180, so put $\\varphi = 180$.', 'So $e^{180i} = -1$.', 'Hence $e^{180i}$ and $e^{i\\pi}$ are equal.'],
    wrong: 1,
    why: '$\\varphi$ is in radians, and half a turn is $\\varphi = \\pi \\approx 3.14159$, not 180. Reading 180 as radians gives $e^{180i} \\approx -0.598 - 0.801i$, nowhere near $-1$.',
    trains: EU1,
  },
  {
    id: 'qc-global-phase-seen',
    title: 'A phase nobody can see',
    steps: [
      'Amplitudes $1/\\sqrt2$ and $1/\\sqrt2$ give chances ½ and ½.',
      'Multiply both by $i$: $i/\\sqrt2$ and $i/\\sqrt2$.',
      'The chances are still ½ and ½.',
      'But the state has turned by 90°, so a later interference will reveal it.',
    ],
    wrong: 3,
    why: 'A global phase turns every arrow together, so every sum — including any later interference — keeps its size: the two states are the same physical state, not merely the same chances.',
    trains: PH1,
  },
  {
    id: 'qc-smear',
    title: 'Where does the smear go?',
    steps: [
      'Each atom is pushed with $F_z = \\mu_z\\,\\partial B_z/\\partial z$.',
      'Its landing height is proportional to $\\mu_z$.',
      'Classical magnets point every way, so $\\mu_z$ takes every value from $-\\mu$ to $+\\mu$.',
      'So classically the plate shows two spots, at $\\pm\\Delta$.',
    ],
    wrong: 3,
    why: 'Every value of $\\mu_z$ gives its own height, so classically the plate shows a smeared band, not two spots (halving the moment halves the deflection, to 0.5 of it). Two sharp spots are the quantum surprise Stern and Gerlach found.',
    trains: TS1,
  },
  {
    id: 'qc-superposition-is-mixture',
    title: 'Half up, half down?',
    steps: [
      '$|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$.',
      'Along $z$ it gives ½ and ½.',
      'So a $|{+x}\\rangle$ beam is really half $|{+z}\\rangle$ atoms and half $|{-z}\\rangle$ atoms.',
      'Then an $x$ magnet splits it 50/50.',
    ],
    wrong: 2,
    why: 'An $x$ magnet sends every $|{+x}\\rangle$ atom to the + spot: all of it, not half. A superposition is not a mixture; only an actual half-and-half mixture of $|{+z}\\rangle$ and $|{-z}\\rangle$ atoms would split 50/50 on $x$.',
    trains: SU1,
  },
  {
    id: 'qc-degree-exactly-two',
    title: 'Quadratics as vectors',
    steps: ['Take the polynomials of degree exactly 2.', 'Scaling $x^2 + 1$ by 3 gives $3x^2 + 3$, still degree 2.', 'Adding two of them always gives degree 2.', 'So they form a vector space.'],
    wrong: 2,
    why: '$(x^2 + x) + (-x^2 + 1) = x + 1$, degree 1: the set is not closed under addition, so it fails a vector-space rule.',
    trains: VS1,
  },
  {
    id: 'qc-no-conjugate-3-4i',
    title: 'The length of (3, 4i)',
    steps: ['Take $\\alpha = (3, 4i)$.', 'Its bra is the row $(3, 4i)$.', 'So $\\langle\\alpha|\\alpha\\rangle = 9 + 16i^2 = -7$.', 'So its length is $\\sqrt{-7}$, a complex number.'],
    wrong: 1,
    why: 'The bra conjugates each entry: it is $(3, -4i)$, so $\\langle\\alpha|\\alpha\\rangle = 9 + 16 = 25$ and the length is $\\sqrt{25} = 5$.',
    trains: IP1,
  },
  {
    id: 'qc-slanted-overlaps',
    title: 'Components from overlaps',
    steps: [
      '$|{+z}\\rangle$ and $|{+x}\\rangle$ are independent, so they form a basis.',
      'Every vector has unique components in it.',
      'The components of $|{-z}\\rangle$ are its overlaps, 0 and 0.707.',
      'Unique components mean one recipe per vector.',
    ],
    wrong: 2,
    why: 'Overlaps give components only in an orthonormal basis; here they are $-1$ and $1.414$.',
    trains: BS2,
  },
  {
    id: 'qc-gs-no-rescale',
    title: 'A basis that is too short',
    steps: [
      'Keep $|\\alpha\'_1\\rangle = |{+z}\\rangle$.',
      'The shadow of the 60° arrow on $|{+z}\\rangle$ is $0.5|{+z}\\rangle$.',
      'Removing it leaves $(0, 0.866)$, at right angles to $|{+z}\\rangle$.',
      'So $|{+z}\\rangle$ and $(0, 0.866)$ form an orthonormal basis.',
    ],
    wrong: 3,
    why: '$(0, 0.866)$ has length 0.866; rescale it first.',
    trains: GS2,
  },
  {
    id: 'qc-delta-ninety',
    title: 'Any phase for |−x⟩?',
    steps: [
      '$|{\\pm x}\\rangle = (|{+z}\\rangle + e^{i\\delta_\\pm}|{-z}\\rangle)/\\sqrt2$, with equal sizes.',
      '$\\delta_+ = 0$ is a free choice of phase.',
      '$\\delta_-$ is free too, so take $\\delta_- = 90°$.',
      'The z chances of that state are ½ and ½.',
    ],
    wrong: 2,
    why: 'Orthogonality forces $\\delta_- = 180°$; $90°$ gives $|{+y}\\rangle$, with $P(+x) = 0.5$.',
    trains: SP2,
  },
  {
    id: 'qc-eq13-sign',
    title: 'A sign in the notes',
    steps: ['$\\psi = c_1|{+z}\\rangle + c_2|{-z}\\rangle$.', 'Put in $|{\\pm z}\\rangle = (|{+x}\\rangle \\pm |{-x}\\rangle)/\\sqrt2$.', 'Collecting gives $d_2 = (c_2 - c_1)/\\sqrt2$.', 'Either way, the chances along x are $d_1^2$ and $d_2^2$.'],
    wrong: 2,
    why: '$d_2 = (c_1 - c_2)/\\sqrt2$; the printed sign describes the state at 60°.',
    trains: CH2,
  },
  {
    id: 'qc-frame-phase',
    title: 'Turning the frame on circular light',
    steps: [
      '$|R\\rangle = (|x\\rangle + i|y\\rangle)/\\sqrt2$.',
      'Turning the frame by $\\chi$ gives $|R\'\\rangle = e^{-i\\chi}|R\\rangle$.',
      'A new phase factor makes a new state.',
      'So a filter for $|R\\rangle$ passes $|R\'\\rangle$ with the same chance.',
    ],
    wrong: 2,
    why: 'A global phase changes no chance; $|R\'\\rangle$ is the state $|R\\rangle$.',
    trains: PH2,
  },
  {
    id: 'qc-diagonal-everywhere',
    title: 'Diagonal in every basis?',
    steps: [
      '$S_z$ is diagonal in the $z$ basis.',
      'In the $x$ basis its table is $US_zU^\\dagger$.',
      'A diagonal table stays diagonal in every basis.',
      'Its eigenvalues $\\pm\\hbar/2$ are the same in every basis.',
    ],
    wrong: 2,
    why: 'In the $x$ basis $S_z = (\\hbar/2)(0\\ 1; 1\\ 0)$, off-diagonal; only the eigenbasis makes a Hermitian table diagonal.',
    trains: SP3,
  },
  {
    id: 'qc-floor-not-compatible',
    title: 'A zero floor',
    steps: [
      '$[S_x, S_y] = i\\hbar S_z$.',
      'For $|{+x}\\rangle$, $\\Delta S_x = 0$, so the left side of the uncertainty relation is 0.',
      'The right side is 0 too, since $\\langle S_z\\rangle = 0$.',
      'So $S_x$ and $S_y$ are compatible in the state $|{+x}\\rangle$.',
    ],
    wrong: 3,
    why: 'Compatibility is $[A, B] = 0$ for the operators, never true here; the floor merely vanishes in this one state.',
    trains: UN3,
  },
  {
    id: 'qc-cnot-copies',
    title: 'A CNOT copier',
    steps: [
      'CNOT maps $|0\\rangle|0\\rangle$ to $|0\\rangle|0\\rangle$ and $|1\\rangle|0\\rangle$ to $|1\\rangle|1\\rangle$.',
      'So it copies the control’s bit onto a blank target.',
      'A qubit $a|0\\rangle + b|1\\rangle$ is a sum of those two inputs.',
      'So CNOT turns $(a|0\\rangle + b|1\\rangle)|0\\rangle$ into two copies of the qubit.',
    ],
    wrong: 3,
    why: 'Linearity gives $a|00\\rangle + b|11\\rangle$, not $(a|0\\rangle+b|1\\rangle)\\otimes(a|0\\rangle+b|1\\rangle)$: the bit was copied, the qubit was not (N&C Eqs. 1.21–1.22).',
    trains: CN4,
  },
  {
    id: 'qc-circuit-order',
    title: 'Reading order',
    steps: [
      'The circuit applies $H$ to $|0\\rangle$, then $Z$.',
      'The first gate drawn acts first on the state.',
      'So the circuit’s matrix is $HZ$.',
      '$HZ|0\\rangle = |{+}\\rangle$.',
    ],
    wrong: 2,
    why: 'The first gate stands next to the ket, so the matrix is $ZH$, and $ZH|0\\rangle = |{-}\\rangle$, not $HZ|0\\rangle = |{+}\\rangle$.',
    trains: CI4,
  },
  {
    id: 'qc-plus-chance-square',
    title: 'Squaring, not sizing',
    steps: [
      '$\\psi = 0.6|0\\rangle + 0.8i|1\\rangle$.',
      'In the $|{\\pm}\\rangle$ basis the $+$ amplitude is $(\\alpha + \\beta)/\\sqrt2$.',
      'Its chance is $(\\alpha + \\beta)^2/2 = (0.6 + 0.8i)^2/2$.',
      'So $P({+}) = -0.14 + 0.48i$.',
    ],
    wrong: 2,
    why: 'A chance is a size squared, not a square: $|\\alpha+\\beta|^2/2 = |0.6+0.8i|^2/2 = 0.5$, a real number.',
    trains: ME4,
  },
  {
    id: 'qc-one-look',
    title: 'One look is enough?',
    steps: [
      '$f$ maps $\\{0,1\\}$ to $\\{0,1\\}$.',
      'There are four such functions: two constant, two balanced.',
      'We evaluate $f(0)$ and find $0$.',
      'So $f$ is constant.',
    ],
    wrong: 3,
    why: 'Copy (f(x) = x) also has f(0) = 0, and copy is balanced: one value of f never decides the question.',
    trains: PR5,
  },
  {
    id: 'qc-kickback-target',
    title: 'Where did the sign go?',
    steps: [
      '$U_f|x\\rangle|y\\rangle = |x\\rangle|y \\oplus f(x)\\rangle$.',
      'Take $y$ in $|-\\rangle = (|0\\rangle - |1\\rangle)/\\sqrt2$.',
      'If $f(x) = 1$ the target becomes $(|1\\rangle - |0\\rangle)/\\sqrt2$.',
      'So the target qubit has changed state.',
    ],
    wrong: 3,
    why: '(|1⟩ − |0⟩)/√2 = −|−⟩, the same ray as |−⟩; the sign multiplies the whole term and lands on the control, |x⟩.',
    trains: OR5,
  },
  {
    id: 'qc-deutsch-sign',
    title: 'One query, one bit',
    steps: [
      "Deutsch's circuit ends in $\\pm|f(0) \\oplus f(1)\\rangle|-\\rangle$.",
      'Reading the top qubit gives $f(0) \\oplus f(1)$.',
      'For $f \\equiv 1$ the state is $-|0\\rangle|-\\rangle$.',
      'The minus sign tells us that $f(0) = 1$.',
    ],
    wrong: 3,
    why: 'An overall sign multiplies the WHOLE state and is invisible to any reading; f ≡ 0 also gives +|0⟩|−⟩, not −.',
    trains: DE5,
  },
  {
    id: 'qc-which-path',
    title: 'Knowing the arm',
    steps: [
      'After the first splitter the photon is in $(|a\\rangle + |b\\rangle)/\\sqrt2$.',
      'With equal phases it always leaves by output 1.',
      'A detector on arm $b$ clicks half the time.',
      'So with the detector in place it still always leaves by output 1.',
    ],
    wrong: 3,
    why: 'Reading the arm collapses the photon to one arm; a single arm into the second splitter leaves each output with chance one half.',
    trains: IN5,
  },
  {
    id: 'qc-byproduct-phase',
    title: 'Moving the byproduct',
    steps: [
      '$W(\\theta) = H\\,P(\\theta)$.',
      'So $W(\\theta)X = H\\,P(\\theta)\\,X$.',
      '$P(\\theta)X = e^{i\\theta}X\\,P(-\\theta)$, and $HX = ZH$.',
      'So $W(\\theta)X = Z\\,W(-\\theta)$ exactly, with no phase.',
    ],
    wrong: 3,
    why: 'The steps give W(θ)X = e^{iθ}ZW(−θ); Bergou\'s identity holds only up to this global phase.',
    trains: OM5,
  },
  {
    id: 'qc-ghz-coins',
    title: 'Same mean, same spread?',
    steps: [
      'GHZ reads 000 or 111, each half the time.',
      'So its number of zeros averages $\\tfrac32$.',
      'Three independent $|{+x}\\rangle$ qubits also average $\\tfrac32$ zeros.',
      'So the two counts have the same variance too.',
    ],
    wrong: 3,
    why: 'GHZ’s zero-count has variance 2.25, three times the 0.75 of three independent coins: the same mean does not mean the same spread.',
    trains: GH7,
  },
  {
    id: 'qc-bra-conj',
    title: 'Bra or ket?',
    steps: [
      '$|{+y}\\rangle = (|0\\rangle + i|1\\rangle)/\\sqrt2$.',
      'Its bracket with $|0\\rangle$ is $1/\\sqrt2$.',
      'Its bracket with $|1\\rangle$ is $\\langle{+y}|1\\rangle = i/\\sqrt2$.',
      'So $\\zeta = i$ for a y reading of $+1$.',
    ],
    wrong: 2,
    why: 'A bra conjugates, so $\\langle{+y}|1\\rangle = -i/\\sqrt2$ and $\\zeta = -i$ for a y reading of $+1$.',
    trains: BR7,
  },
  {
    id: 'qc-odd-y',
    title: 'One y',
    steps: ['A run’s bracket is $(1 + s)/4$.', '$s = (-i)^{n_y}\\Pi$.', 'With one y, $s = \\pm i$.', 'So half of the outcomes are forbidden.'],
    wrong: 3,
    why: '$|1 \\pm i|^2/16 = \\tfrac18$ for every outcome: an odd $n_y$ forbids nothing, it spreads the chance equally over all eight.',
    trains: PT7,
  },
  {
    id: 'qc-parity-flip',
    title: 'Which strings survive?',
    steps: ['Record $+1$ as 0 and $-1$ as 1.', 'In an XXX run only the even strings occur.', 'YYX has two y’s, so $s = -\\Pi$.', 'So YYX also keeps the even strings.'],
    wrong: 3,
    why: '$s = -\\Pi$ flips the rule: YYX keeps the odd strings, not the even ones.',
    trains: BS7,
  },
  {
    id: 'qc-random-product',
    title: 'Random factors, random product?',
    steps: [
      'Each qubit’s X reading on GHZ is $+1$ or $-1$, half the time each.',
      'XXX’s value is the product of the three readings.',
      'A product of three random signs is random.',
      'So XXX gives $+1$ only half the time.',
    ],
    wrong: 2,
    why: 'The readings are correlated: GHZ is an eigenstate of XXX with spread 0, so the product is $+1$ every single run.',
    trains: OB7,
  },
  {
    id: 'qc-hidden-escape',
    title: 'Numbers or operators?',
    steps: [
      'Suppose cards with $y_1y_2x_3 = y_1x_2y_3 = x_1y_2y_3 = -1$.',
      'Then their product is $x_1x_2x_3(y_1y_2y_3)^2 = -1$.',
      'Since $y_i^2 = 1$, $x_1x_2x_3 = -1$.',
      'The operators obey the same rule, so quantum mechanics predicts $XXX = -1$ as well.',
    ],
    wrong: 3,
    why: 'As operators qubit 2 gives $Y\\cdot X\\cdot Y = -X$, so the product is $-XXX$: quantum mechanics predicts $+1$, not $-1$.',
    trains: ME7,
  },
  {
    id: 'qc-dims-add',
    title: 'Counting two qubits',
    steps: [
      'Each qubit has the basis states $|0\\rangle$ and $|1\\rangle$.',
      'A basis state of a pair picks one for each qubit.',
      'So two qubits have $2\\times2 = 4$ basis states.',
      'By the same count, three qubits have $2 + 2 + 2 = 6$.',
    ],
    wrong: 3,
    why: 'The count multiplies again: $2\\times2\\times2 = 8$, not $2+2+2=6$.',
    trains: MA6,
  },
  {
    id: 'qc-xz-block',
    title: 'Which XZ?',
    steps: [
      '$XZ$ names the Pauli string $X\\otimes Z$.',
      'It acts as X on qubit 1 and Z on qubit 2.',
      'So it is a $4\\times4$ matrix.',
      'Its top-left $2\\times2$ block is the product $X\\cdot Z$.',
    ],
    wrong: 3,
    why: 'The top-left block is $X_{11}Z = 0\\cdot Z$, the zero block, not the product $X\\cdot Z$.',
    trains: TE6,
  },
  {
    id: 'qc-four-filled',
    title: 'All four filled',
    steps: [
      'A product state has amplitudes $ac$, $ad$, $bc$, $bd$.',
      '$\\Phi^+$ fails the test: $c_{00}c_{11} - c_{01}c_{10} = \\tfrac12$.',
      '$|{+}{+}\\rangle$ has all four amplitudes non-zero.',
      'So $|{+}{+}\\rangle$ is entangled.',
    ],
    wrong: 3,
    why: 'Its test gives $\\tfrac14 - \\tfrac14 = 0$: $|{+}{+}\\rangle$ is a product, not entangled.',
    trains: EN6,
  },
  {
    id: 'qc-beta-names',
    title: 'Two-bit names',
    steps: [
      '$\\beta_{xy} = (|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle)/\\sqrt2$.',
      'For $\\beta_{10}$, x = 1 and y = 0.',
      'So $\\beta_{10} = (|00\\rangle - |11\\rangle)/\\sqrt2$.',
      'That is the singlet $\\Psi^-$.',
    ],
    wrong: 3,
    why: '$(|00\\rangle - |11\\rangle)/\\sqrt2$ is $\\Phi^-$; the singlet $\\Psi^-$ is $\\beta_{11}$.',
    trains: BB6,
  },
  {
    id: 'qc-bell-order',
    title: 'Which gate first?',
    steps: [
      'To read a Bell state, rotate the Bell basis onto the 0,1 basis.',
      'The rotation is $U = (H\\otimes I)\\,\\mathrm{CNOT}$.',
      'So the H acts first, then the CNOT.',
      'Then both qubits are read in the 0,1 basis.',
    ],
    wrong: 2,
    why: 'In a product of gates the right-hand factor acts first: CNOT acts first, then H.',
    trains: BC6,
  },
  {
    id: 'qc-parity-local',
    title: 'Two local readings?',
    steps: [
      'The detectors read $Z_1$ and $Z_2$ after the gates.',
      'Reading $Z_1$ after U is reading $U^\\dagger Z_1U = X_1X_2$ before it.',
      'Likewise $Z_2$ after U is $Z_1Z_2$ before it.',
      'So a Bell measurement reads $Z_1$ and $Z_2$ of the incoming pair.',
    ],
    wrong: 3,
    why: 'It reads the two parities $X_1X_2$ and $Z_1Z_2$ of the incoming pair, not single-qubit values.',
    trains: PA6,
  },
  {
    id: 'qc-z-only',
    title: 'Same chances, same state?',
    steps: [
      'The box reads 00 or 11, half the time each.',
      '$\\Phi^+$ also reads 00 or 11, half the time each.',
      'So their $\\langle Z_1Z_2\\rangle$ agree: both are +1.',
      'So the box is in the state $\\Phi^+$.',
    ],
    wrong: 3,
    why: 'Their $\\langle X_1X_2\\rangle$ differ, 0 against +1: the box is a mixture, not $\\Phi^+$.',
    trains: WH8,
  },
  {
    id: 'qc-coherence-chance',
    title: 'A negative chance?',
    steps: [
      'For $|-\\rangle$, $\\rho = \\tfrac12\\begin{pmatrix}1 & -1\\\\ -1 & 1\\end{pmatrix}$.',
      'The diagonal holds the chances, ½ and ½.',
      'The corners are −½.',
      'So reading $|-\\rangle$ has a negative chance somewhere.',
    ],
    wrong: 3,
    why: 'The corners are coherences, not chances: they carry the relative phase, and may be negative.',
    trains: PR8,
  },
  {
    id: 'qc-vn-sign',
    title: 'Which sign?',
    steps: [
      'The ket moves by $i\\hbar|\\dot\\psi\\rangle = \\hat H|\\psi\\rangle$.',
      'The bra moves by $-i\\hbar\\langle\\dot\\psi| = \\langle\\psi|\\hat H$.',
      'Together, $i\\hbar\\dot\\rho = \\hat H\\rho - \\rho\\hat H$.',
      'So $i\\hbar\\dot\\rho = [\\rho, \\hat H]$, as for an observable.',
    ],
    wrong: 3,
    why: '$\\hat H\\rho - \\rho\\hat H = [\\hat H, \\rho]$: the sign is opposite to Heisenberg’s.',
    trains: TR8,
  },
  {
    id: 'qc-mix-amplitudes',
    title: 'Mix the matrices',
    steps: [
      'A box holds $|0\\rangle$ and $|+\\rangle$, half each.',
      'Its $\\rho$ is half of each member’s $\\rho$.',
      'Its arrow is the average of the two arrows, inside the sphere.',
      'So the box is the ket $(|0\\rangle + |+\\rangle)/\\text{norm}$.',
    ],
    wrong: 3,
    why: 'That ket is pure, on the surface; the box has purity 0.75, strictly inside.',
    trains: MI8,
  },
  {
    id: 'qc-trace-enough',
    title: 'Trace 1 is enough?',
    steps: [
      '$\\tfrac12I + \\tfrac1{\\sqrt2}\\sigma_x$ has trace 1.',
      'It is Hermitian.',
      'Its entries all lie between 0 and 1.',
      'So it is a density matrix.',
    ],
    wrong: 3,
    why: '$|\\mathbf r| = \\sqrt2 > 1$, and one eigenvalue is negative, −0.207: positivity fails.',
    trains: BA8,
  },
  {
    id: 'qc-recipe-unique',
    title: 'Which recipe is real?',
    steps: [
      '$\\tfrac12(|0\\rangle\\langle0| + |1\\rangle\\langle1|) = \\tfrac12I$.',
      '$\\tfrac12(|{+x}\\rangle\\langle{+x}| + |{-x}\\rangle\\langle{-x}|) = \\tfrac12I$ too.',
      'Every prediction is $\\mathrm{Tr}(A\\rho)$.',
      'So a z reading of many copies reveals which recipe was used.',
    ],
    wrong: 3,
    why: 'Both boxes have the same $\\rho$, so no reading, z or otherwise, can tell them apart.',
    trains: RE8,
  },
  {
    id: 'qc-local-bell',
    title: 'Tell them apart locally?',
    steps: [
      '$\\Phi^+$ and $\\Phi^-$ are orthogonal.',
      'So some measurement tells them apart perfectly.',
      'Tracing out qubit B leaves $\\tfrac12I$ for both.',
      'So a reading of qubit A alone tells them apart.',
    ],
    wrong: 3,
    why: 'Both leave $\\rho_A = \\tfrac12I$; only a joint reading (the Bell measurement) separates orthogonal states whose parts agree.',
    trains: PT9,
  },
  {
    id: 'qc-same-whole',
    title: 'Same parts, same pair?',
    steps: [
      'The singlet leaves $\\rho_A = \\tfrac12I$.',
      'The coin pair leaves $\\rho_A = \\tfrac12I$.',
      'Their $\\rho_B$ agree as well.',
      'So the singlet and the coin pair are the same state.',
    ],
    wrong: 3,
    why: 'Their $xx$ cells are $-1$ and 0: the reduced states coincide but the correlations differ.',
    trains: SP9,
  },
  {
    id: 'qc-entropy-weights',
    title: 'Weights or eigenvalues?',
    steps: [
      "Unit 8.4's mixture is $|0\\rangle$ and $|{+}\\rangle$, half each.",
      'S is computed from the eigenvalues of $\\rho$.',
      "The eigenvalues are the recipe's chances, ½ and ½.",
      'So S = 1 bit.',
    ],
    wrong: 2,
    why: 'The eigenvalues are 0.854 and 0.146 (the recipe is not the eigenbasis), so S = 0.601 bit, not 1.',
    trains: EN9,
  },
  {
    id: 'qc-schmidt-rows',
    title: 'Any basis will do?',
    steps: [
      "Group P by A's 0/1 basis: $\\tilde v_0 = 0.707|0\\rangle + 0.5|1\\rangle$, $\\tilde v_1 = 0.5|1\\rangle$.",
      'Their squared lengths are 0.75 and 0.25.',
      'Every pure pair can be grouped this way.',
      'So P’s Schmidt coefficients are $\\sqrt{0.75}$ and $\\sqrt{0.25}$.',
    ],
    wrong: 3,
    why: "These partners overlap (0.25): the Schmidt coefficients come from $\\rho_A$'s own eigenbasis, 0.924 and 0.383, not the 0/1 rows.",
    trains: SC9,
  },
  {
    id: 'qc-purification-unique',
    title: 'One purification only?',
    steps: [
      "P purifies Unit 8.4's mixture.",
      'The eigen-recipe gives another purification.',
      'Both leave the same $\\rho_A$.',
      'So they must be the same two-qubit state.',
    ],
    wrong: 3,
    why: 'They differ by an H gate on B: purifications with the same partner are unique only up to a unitary there.',
    trains: PU9,
  },
  {
    id: 'qc-fidelity-gap',
    title: 'Which formula?',
    steps: [
      '$|0\\rangle$ and $|{+}\\rangle$ overlap with size 0.707.',
      'So F = 0.707.',
      'For pure states $D = \\sqrt{1 - F^2}$.',
      'So D = 1 − 0.707 = 0.293.',
    ],
    wrong: 3,
    why: '$D = \\sqrt{1 - 0.5} = 0.707$; $1 - F$ is only the lower bound for mixed states, not the pure-state formula.',
    trains: DI9,
  },
  {
    id: 'qc-chsh-final',
    title: 'No Bell violation, so separable?',
    steps: ['The running state at $p = 0.5$ breaks no CHSH bound.', 'CHSH is a test for entanglement.', 'So a state that passes CHSH is separable.', 'Therefore this state is separable.'],
    wrong: 2,
    why: 'CHSH is only sufficient for entanglement, never necessary: the partial transpose is already negative at $p = 0.5$, so the state is entangled even though it passes CHSH.',
    trains: PT12,
  },
  {
    id: 'qc-witness-positive',
    title: 'Is the witness positive?',
    steps: ['$W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$ is built from a projector.', 'A projector is a positive operator.', 'The partial transpose preserves positivity.', 'So $W \\ge 0$.'],
    wrong: 2,
    why: 'The partial transpose does **not** preserve positivity — that is the whole point of the Peres test. $W$ has a negative eigenvalue by construction.',
    trains: WI12,
  },
  {
    id: 'qc-locc-create',
    title: 'Make entanglement by phone?',
    steps: ['Alice and Bob share a product state.', 'They run local gates and phone each other.', 'The Procrustean step can succeed.', 'So LOCC made the pair entangled.'],
    wrong: 3,
    why: 'Procrustean distillation needs an already-entangled input (a tilted pair); LOCC cannot create entanglement starting from a genuine product state.',
    trains: LO12,
  },
  {
    id: 'qc-sa-mixed',
    title: 'Entropy as the measure?',
    steps: ['The Werner state at $w = 0.5$ has $S(\\rho_A) = 1$ bit.', 'A Bell state also has $S(\\rho_A) = 1$ bit.', 'Equal marginal entropy means equal entanglement.', 'So the Werner state is maximally entangled.'],
    wrong: 2,
    why: '$S(\\rho_A)$ measures entanglement only for pure pairs. The Werner state is mixed, and its concurrence is only $0.25$, far below maximal.',
    trains: EN12,
  },
  {
    id: 'qc-c-product',
    title: 'Concurrence of a product?',
    steps: ['$|01\\rangle$ is a two-qubit state.', 'Its coefficient matrix is $\\mathrm{diag}(0, 1)$ up to order.', '$C = 2|\\det A|$.', 'So $C = 2$.'],
    wrong: 3,
    why: '$\\det A = 0$ for a product state, so $C = 2|\\det A| = 0$, not $2$ — and concurrence never exceeds $1$ in any case.',
    trains: CO12,
  },
  {
    id: 'qc-ghz-pairs',
    title: 'GHZ’s pairs?',
    steps: ['$|\\mathrm{GHZ}\\rangle$ is strongly three-way entangled.', 'So each pair inside it is strongly entangled too.', 'Trace out one qubit; the pair stays entangled.', 'So $C_{AB} > 0$ for GHZ.'],
    wrong: 1,
    why: 'GHZ’s entanglement is purely three-way; its reduced two-qubit pair is a separable coin mixture, $C_{AB} = 0$.',
    trains: MU12,
  },
  {
    id: 'qc-open-unitary',
    title: 'Must it be unitary?',
    steps: [
      'A closed qubit evolves by $\\rho \\to U\\rho U^\\dagger$.',
      'A real qubit touches its environment.',
      'Tracing out the environment is still a unitary on the qubit.',
      'So open evolution is unitary too.',
    ],
    wrong: 2,
    why: 'Tracing out an entangled environment gives a non-unitary channel $\\sum_m A_m\\rho A_m^\\dagger$: a unitary keeps $\\mathrm{Tr}\\,\\rho^2$ fixed, but the channel can shrink it.',
    trains: FU13,
  },
  {
    id: 'qc-positive-enough',
    title: 'Is positive enough?',
    steps: [
      'The transpose keeps eigenvalues, so it is positive.',
      'A positive map sends states to states.',
      'So the transpose is a valid channel.',
      'Therefore transposing a density matrix is a physical operation.',
    ],
    wrong: 2,
    why: 'The transpose is positive but not completely positive: run on half of $\\Phi^+$, its Choi matrix has eigenvalue $-\\tfrac12$, so it is not a channel.',
    trains: PR13,
  },
  {
    id: 'qc-unique-env',
    title: 'One environment?',
    steps: [
      'A channel comes from a unitary on qubit + environment.',
      'So each channel has its own unique environment.',
      'Two Kraus sets with different sizes are different channels.',
      'You can read the environment off the channel.',
    ],
    wrong: 1,
    why: 'The dilation is not unique: Kraus sets related by $D_\\nu = \\sum_\\mu U_{\\nu\\mu}A_\\mu$ give the SAME channel, so no environment is privileged.',
    trains: ST13,
  },
  {
    id: 'qc-full-at-one',
    title: 'Fully mixed at p = 1?',
    steps: [
      'The depolarizing factor is $1 - \\tfrac{4p}3$.',
      'At $p = 1$ it is $-\\tfrac13$.',
      'A non-zero factor means the ball is not a point.',
      'So the qubit is fully depolarized at $p = 1$.',
    ],
    wrong: 3,
    why: 'Full depolarizing (factor $0$) is at $p = 0.75$; at $p = 1$ the factor is $-\\tfrac13$, an inverted ball, not a point.',
    trains: DE13,
  },
  {
    id: 'qc-cnot-cloner',
    title: 'CNOT as a copier',
    steps: [
      'A CNOT maps $|0\\rangle|0\\rangle \\to |00\\rangle$ and $|1\\rangle|0\\rangle \\to |11\\rangle$.',
      'So it copies the control onto the target.',
      'By linearity it copies any state.',
      'So a CNOT clones $|{+}\\rangle$ to $|{+}\\rangle|{+}\\rangle$.',
    ],
    wrong: 2,
    why: 'Linearity gives $U|{+}\\rangle|0\\rangle = \\Phi^+$, an entangled pair, not $|{+}\\rangle|{+}\\rangle$: the CNOT copies only the two basis states.',
    trains: NC13,
  },
  {
    id: 'qc-clone-signal',
    title: 'A harmless copier?',
    steps: [
      'Alice and Bob share a Bell pair.',
      "Bob's qubit is the maximally mixed state.",
      'A perfect cloner just makes copies of his own qubit.',
      'Copies are harmless, so a cloner would be allowed.',
    ],
    wrong: 3,
    why: "Copies of Bob's qubit would reveal which basis Alice measured, instantly: a cloner would let him signal faster than light, so no-signalling forbids it.",
    trains: HE13,
  },
  {
    id: 'qc-meter-sharp',
    title: 'Must a meter be sharp?',
    steps: [
      'A projective measurement gives sharp $|0\\rangle$/$|1\\rangle$ outcomes.',
      'Real meters have finite resolution.',
      'A blurry meter still gives sharp projective outcomes.',
      'So every qubit measurement is projective.',
    ],
    wrong: 3,
    why: 'A blurry meter is the POVM $E_\\pm = \\tfrac12(I \\pm \\eta Z)$, positive operators that are not projectors.',
    trains: PO14,
  },
  {
    id: 'qc-two-outcomes',
    title: 'Only two outcomes?',
    steps: [
      'A qubit lives in two dimensions.',
      'A projective measurement has at most two outcomes.',
      'A POVM drops the orthogonality rule.',
      'So three outcomes on a qubit are still impossible.',
    ],
    wrong: 3,
    why: 'The trine is a legitimate three-outcome POVM on a qubit, $\\sum_j\\tfrac23|\\psi_j\\rangle\\langle\\psi_j| = I$.',
    trains: PV14,
  },
  {
    id: 'qc-povm-fake',
    title: 'Just bookkeeping?',
    steps: [
      'A POVM is positive operators summing to $I$.',
      'It is a convenient notation.',
      'No real apparatus realises a non-projective POVM.',
      'So POVMs are only mathematics.',
    ],
    wrong: 3,
    why: "Neumark's theorem — every POVM is a sharp measurement on the system plus an ancilla, $V^\\dagger V = I$.",
    trains: NM14,
  },
  {
    id: 'qc-usd-error',
    title: "Is 'don't know' a mistake?",
    steps: ['USD has three outcomes.', 'Two identify the states, one is inconclusive.', 'The inconclusive outcome is a misidentification.', 'So USD is sometimes wrong.'],
    wrong: 3,
    why: 'The inconclusive outcome is a refusal to answer, never an error; USD is never wrong.',
    trains: US14,
  },
  {
    id: 'qc-measure-always',
    title: 'Always measure?',
    steps: [
      'Minimum-error discrimination minimises wrong guesses.',
      'Form $\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$.',
      'A measurement always beats guessing.',
      'So you should always measure.',
    ],
    wrong: 3,
    why: 'If $\\Gamma$ has no negative eigenvalue, always guessing the likelier state (no measurement) is optimal.',
    trains: ME14,
  },
  {
    id: 'qc-usd-beats',
    title: 'Is never-wrong best?',
    steps: ['USD never makes an error.', 'Minimum-error sometimes errs.', 'So USD gives more correct answers per trial.', 'USD is the better strategy overall.'],
    wrong: 3,
    why: 'Minimum-error success $0.854$ beats USD $0.293$ per trial; they optimise different things.',
    trains: CP14,
  },
  {
    id: 'qc-third-direction',
    title: 'A third direction?',
    steps: ['$(1,0)$ and $(0,1)$ span the plane.', 'Add $(1,1)$ for a third direction.', 'Now three directions span more.', 'So the space is three-dimensional.'],
    wrong: 2,
    why: '$(1,1) = (1,0) + (0,1)$: a third vector in a 2-D space is always dependent, so it adds no new direction. $\\mathbb C^2$ stays two-dimensional.',
    trains: VE2,
  },
  {
    id: 'qc-forgot-conjugate',
    title: 'The length of |+y⟩',
    steps: ['$|{+}y\\rangle = (1/\\sqrt2,\\ i/\\sqrt2)$.', 'Length² is $\\sum a_i^2$.', '$= \\tfrac12 + \\tfrac{i^2}2 = 0$.', 'So $|{+}y\\rangle$ has length 0.'],
    wrong: 1,
    why: 'Length² is $\\sum |a_i|^2$, with the conjugate, not the bare $\\sum a_i^2$: $\\langle{+}y|{+}y\\rangle = 1$, an honest unit length.',
    trains: IP2,
  },
  {
    id: 'qc-add-then-measure',
    title: 'A triangle shortcut',
    steps: ['$\\||{+}z\\rangle\\| = 1$ and $\\||{+}x\\rangle\\| = 1$.', 'So $\\||{+}z\\rangle + |{+}x\\rangle\\| = 1 + 1 = 2$.', 'Lengths add when you add vectors.', 'The sum has length 2.'],
    wrong: 1,
    why: 'The sum’s length is $1.8478$, not $2$: lengths only add when the two states are parallel (the triangle-inequality equality case).',
    trains: NA2,
  },
  {
    id: 'qc-coords-are-the-state',
    title: 'Coordinates everywhere',
    steps: ['In the z frame $|\\psi\\rangle = (0.6, 0.8)$.', 'Switch to the x frame.', 'The coordinates stay $(0.6, 0.8)$.', 'Coordinates are a property of the state.'],
    wrong: 2,
    why: 'In the x frame the coordinates are $(0.9899, -0.1414)$: components change with the frame, and only the length, $1$, is frame-free.',
    trains: ON2,
  },
  {
    id: 'qc-skip-the-shadow',
    title: 'A faster Gram–Schmidt',
    steps: ['Keep $e_1 = |{+}x\\rangle$.', 'For $e_2$, just normalize $|{+}z\\rangle$.', 'Now $e_1, e_2$ are a frame.', 'Done, no subtraction needed.'],
    wrong: 1,
    why: '$|{+}z\\rangle$ is not orthogonal to $e_1$: $\\langle{+}x|{+}z\\rangle = 0.7071 \\ne 0$. Its shadow on $e_1$ must be subtracted first.',
    trains: GS2F,
  },
  // Chapter F3 "Matrices and linear maps" (P-F3-story §11.2)
  {
    id: 'qc-square-is-linear',
    title: 'A linear rule?',
    steps: ['Define $A(a, b) = (a^2, b^2)$.', 'Check: $A$ sends sums to sums, so it is linear.', 'Give it a matrix.', 'Apply the matrix to any state.'],
    wrong: 1,
    why: 'Doubling the input quadruples $A$: squaring fails homogeneity, so there is no matrix for it.',
    trains: LM3,
  },
  {
    id: 'qc-rows-are-images',
    title: 'Reading the table',
    steps: ['The matrix of $X$ is $\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$.', 'Row 0 is $X|0\\rangle$.', 'So $X|0\\rangle = (0, 1)$, from row 0.', 'Read images off the rows.'],
    wrong: 1,
    why: 'The $k$th *column*, not row, is $A|e_k\\rangle$: $X|0\\rangle = (0, 1)$ is column 0 of the table.',
    trains: MM3,
  },
  {
    id: 'qc-order-free',
    title: 'Order-free products',
    steps: ['$X$ and $Z$ are both gates.', 'So $XZ = ZX$.', 'Multiplying gates is order-free.', 'You can reorder a circuit freely.'],
    wrong: 1,
    why: 'Matrix multiplication is not commutative: $XZ = -ZX$, so swapping the order flips every sign.',
    trains: PR3,
  },
  {
    id: 'qc-unitary-is-hermitian',
    title: 'Mirror or inverse?',
    steps: ['$S = \\operatorname{diag}(1, i)$ is a gate, so it is unitary.', 'Unitary means it equals its own mirror.', 'So $S^\\dagger = S$.', 'Thus $S$ is Hermitian.'],
    wrong: 1,
    why: 'Unitary means $S^\\dagger = S^{-1}$, not $S^\\dagger = S$; here $S^\\dagger = \\operatorname{diag}(1, -i) \\ne S$.',
    trains: AD3,
  },
  {
    id: 'qc-map-changed',
    title: 'Did the map change?',
    steps: ['$Z = \\operatorname{diag}(1, -1)$ in the z frame.', 'In the x frame its table is $X$.', 'So the map itself became a different map.', 'Changing frames changes the physics.'],
    wrong: 2,
    why: 'Only the table changed; $UZU^\\dagger = X$ is the same operator seen in a new frame — its lengths, trace and determinant are unchanged.',
    trains: CB3,
  },
  // Chapter F4 "Eigenvalues, Hermitian and unitary operators" (P-F4-story §11.2)
  {
    id: 'qc-eig-real-matrix',
    title: 'A real matrix, real eigenvalues?',
    steps: ['The quarter-turn $\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}$ has only real entries.', 'A real matrix must have real eigenvalues.', 'Its characteristic equation is $\\lambda^2 + 1 = 0$.', 'So its eigenvalues are real.'],
    wrong: 1,
    why: '$\\lambda^2 + 1 = 0$ gives $\\pm i$ — real entries, complex eigenvalues.',
    trains: EI4,
  },
  {
    id: 'qc-herm-needs-real-entries',
    title: 'Hermitian means real entries?',
    steps: ['$\\begin{pmatrix}2 & i\\\\ -i & 2\\end{pmatrix}$ has an $i$ in it.', 'A Hermitian table needs real entries.', 'So this table is not Hermitian.', 'Its eigenvalues could be complex.'],
    wrong: 1,
    why: 'Hermitian needs $A_{ij} = A_{ji}^*$, not real entries; this one is Hermitian, with eigenvalues $1, 3$.',
    trains: HE4,
  },
  {
    id: 'qc-sqrt-unique',
    title: 'One square root',
    steps: ['$\\sigma_x^2 = I$.', '$\\sigma_z^2 = I$ too.', 'A matrix has one square root.', 'So $\\sigma_x = \\sigma_z$.'],
    wrong: 2,
    why: 'Squaring forgets each eigenvalue’s sign, so $I$ has many square roots, including both $\\sigma_x$ and $\\sigma_z$.',
    trains: SP4,
  },
  {
    id: 'qc-unitary-real-eig',
    title: 'Unitary eigenvalues',
    steps: ['The phase gate $S = \\operatorname{diag}(1, i)$ keeps lengths.', 'A length-keeping table has eigenvalues of size $1$.', 'The only size-$1$ numbers are $+1$ and $-1$.', 'So $S$’s eigenvalues are $\\pm1$.'],
    wrong: 2,
    why: 'Size-1 numbers fill the whole unit circle; $S$’s eigenvalues are $1$ and $i$.',
    trains: UN4,
  },
  {
    id: 'qc-same-spectrum-commute',
    title: 'Same stretches, shared directions?',
    steps: ['$\\sigma_x$ and $\\sigma_z$ both have eigenvalues $+1, -1$.', 'Same eigenvalues means the same directions.', 'So they share an eigenbasis.', 'So $\\sigma_x\\sigma_z = \\sigma_z\\sigma_x$.'],
    wrong: 1,
    why: 'Equal spectra do not imply a shared basis; $[\\sigma_x, \\sigma_z] = -2i\\sigma_y \\ne 0$.',
    trains: CO4,
  },
  {
    id: 'qc-positive-is-projector',
    title: 'Positive means projector?',
    steps: ['$I + \\tfrac12(X + Z)$ is Hermitian.', 'Its eigenvalues $1.71$ and $0.29$ are both positive.', 'A positive table is a projector.', 'So it squares to itself.'],
    wrong: 2,
    why: 'A projector needs eigenvalues in $\\{0, 1\\}$; these are $1.71, 0.29$, so $A^2 \\ne A$.',
    trains: PO4,
  },
  // Chapter F5 "Chance with numbers" (P-F5-story §11.2)
  {
    id: 'qc-add-independent',
    title: 'Two sixes',
    steps: ['A die is rolled twice.', 'The chance of a six is $\\tfrac16$ each time.', 'The chance of two sixes adds them: $\\tfrac16 + \\tfrac16 = \\tfrac13$.', 'So two sixes happen a third of the time.'],
    wrong: 2,
    why: 'Independent chances multiply: $\\tfrac16 \\times \\tfrac16 = \\tfrac1{36}$, not $\\tfrac16 + \\tfrac16$.',
    trains: CH5,
  },
  {
    id: 'qc-mean-is-outcome',
    title: 'The expected face',
    steps: ["A fair die's faces are 1 to 6.", 'Its expectation is $3.5$.', 'An expectation is a possible reading.', 'So some roll must show $3.5$.'],
    wrong: 2,
    why: '$\\langle X\\rangle$ is a balance point, not an outcome; no face of a die shows $3.5$.',
    trains: EX5,
  },
  {
    id: 'qc-spread-over-n',
    title: 'Averaging many readings',
    steps: ['One reading has $\\sigma = 2$.', 'Average 100 of them.', 'Variances add, so the mean’s spread is $\\sigma/N = 0.02$.', 'So the average is pinned to $0.02$.'],
    wrong: 2,
    why: 'The spread falls as $\\sigma/\\sqrt N = 0.2$, not $\\sigma/N$: it is the square root of $N$ that divides, not $N$ itself.',
    trains: SC5,
  },
  {
    id: 'qc-sure-informative',
    title: 'A certain flip',
    steps: ['A trick coin always lands heads.', 'Each flip still has two possible faces.', 'So each flip carries $\\log_2 2 = 1$ bit.', 'A hundred flips carry 100 bits.'],
    wrong: 2,
    why: 'With $P(\\text{heads}) = 1$, $H = 0$: a certain outcome carries no information, however many times it repeats.',
    trains: BI5,
  },
  // Chapter Q15 (P-Q15-story §11.2): five spot-the-error rounds, each checked against the engine in Q15.arcade.test.ts
  {
    id: 'qc-pad-twice',
    title: 'A reused pad',
    steps: ['Alice pads two messages with the same random key $k$.', 'Each cipher text alone looks random.', 'So Eve learns nothing from the two together.', 'So reusing the pad is safe.'],
    wrong: 2,
    why: 'The key cancels: $c_1 \\oplus c_2 = m_1 \\oplus m_2$, so the two cipher texts together show Eve how the messages differ.',
    trains: OT15,
  },
  {
    id: 'qc-b92-35',
    title: 'The never-wrong Eve',
    steps: ['A never-wrong Eve is unsure $0.7071$ of the time.', 'Then she guesses, and half her guesses are wrong.', 'So half of $0.7071$ is $0.1464$, and $Q = 0.1464$.', 'Alice and Bob see that error rate in a test.'],
    wrong: 2,
    why: 'Half of $0.7071$ is $0.3536$, not $0.1464$. The value $0.1464$ is the key error rate of the minimum-error Eve.',
    trains: B915,
  },
  {
    id: 'qc-quiet-probe',
    title: 'A quiet probe',
    steps: ['Eve entangles a probe with each qubit Alice sends.', 'Her probe causes no error in the $z$ basis or in the $x$ basis.', 'So the probe still learns a little about each bit.', 'A little information is the price of a little noise.'],
    wrong: 2,
    why: 'No error in either basis forces the probe to end in the same state whatever Alice sent, so her best guess is a coin toss, $0.5$.',
    trains: BB15,
  },
  {
    id: 'qc-e91-zx',
    title: 'Only z and x',
    steps: ['Alice and Bob share $\\Phi^+$ and use only the settings $z$ and $x$.', 'With equal settings their results always agree.', 'With different settings their results are random.', 'These correlations score above $2$ on CHSH, so they violate it.'],
    wrong: 3,
    why: 'Two hidden coins, one for each setting, reproduce the whole table, so the score at these settings is exactly $2$. Ekert adds other test settings.',
    trains: E915,
  },
  {
    id: 'qc-share-alone',
    title: 'Bob’s sign alone',
    steps: ['Alice sends $|\\bar 0\\rangle$ or $|\\bar 1\\rangle$ to Bob and Charlie.', 'Bob reads $+x$ or $-x$, each with chance $0.5$ for either bit.', 'So Bob’s sign alone gives Alice’s bit.', 'Charlie then only confirms it.'],
    wrong: 2,
    why: 'Bob’s sign is a fair coin for both bits. Only the sum $\\beta \\oplus \\gamma$ of his sign and Charlie’s gives the bit.',
    trains: SH15,
  },
  // Chapter F7 (P-F7-story §11.2): five spot-the-error rounds, each checked against the engine in F7.arcade.test.ts
  {
    id: 'qc-and-undo',
    title: 'Running AND backwards',
    steps: ['AND reads two bits and returns one.', 'To run it backwards we start from the output.', 'The output 0 tells us the input was 00.', 'So AND can be undone.'],
    wrong: 2,
    why: 'The output 0 comes from three inputs, 00, 01 and 10, so it does not say which one went in. A gate that merges inputs cannot be undone.',
    trains: RE7,
  },
  {
    id: 'qc-balanced-common',
    title: 'The common kind of function',
    steps: [
      'A function of 3 bits has 8 rows, each with output 0 or 1.',
      'A balanced one has four 1s and four 0s, the even split.',
      'The even split is more likely than any other single split, so most functions are balanced.',
      'So a random 3-bit function is usually balanced.',
    ],
    wrong: 2,
    why: 'The even split is the likeliest single split, but it is only 70 of the 256 functions, about 27 %. Most functions are not balanced.',
    trains: BO7,
  },
  {
    id: 'qc-xor-carry',
    title: 'A carry in XOR',
    steps: ['XOR adds two bits.', '0 \u2295 0 = 0, 0 \u2295 1 = 1 and 1 \u2295 0 = 1.', '1 \u2295 1 = 10, with a carry into the next place.', 'So 1011 \u2295 0110 can be longer than four bits.'],
    wrong: 2,
    why: 'XOR drops the carry: 1 \u2295 1 = 0. Each place is added on its own, so 1011 \u2295 0110 = 1101, four bits again.',
    trains: XO7,
  },
  {
    id: 'qc-gf2-independent',
    title: 'Three tied rows',
    steps: [
      'Three strings are independent when none of them is a sum of the others.',
      'The rows 110, 011 and 101 are three different nonzero strings.',
      'So they are independent, and the rank is 3.',
      'So the only solution of the three checks is the zero string.',
    ],
    wrong: 2,
    why: 'Over bits 110 \u2295 011 = 101, so the rows are tied and the rank is 2. Over the real numbers the same rows would be independent.',
    trains: GF7,
  },
  {
    id: 'qc-root-exponential',
    title: 'Grover\u2019s speed-up',
    steps: [
      'A classical search of $N = 2^n$ items takes about $N$ queries.',
      'Grover\u2019s search takes about $\\sqrt N$ queries.',
      'The square root of $N$ is far smaller than $N$.',
      'So Grover\u2019s search is an exponential speed-up.',
    ],
    wrong: 3,
    why: '$\\sqrt N = 2^{n/2}$ still doubles with every two extra bits, so it is still exponential in $n$. The speed-up is a square root, a quadratic one.',
    trains: CO7,
  },
  // Chapter F8 (P-F8-story §11.2): six spot-the-error rounds, each checked against the engine in F8.arcade.test.ts
  {
    id: 'qc-negative-mod',
    title: 'The remainder of a negative number',
    steps: [
      'On a clock of 12 marks, every number lands on one mark, from 0 to 11.',
      'To place $-3$ we go three marks back from 0.',
      'Going back three marks from 0 lands on mark 9.',
      'So $-3 \\bmod 12$ is $-3$.',
    ],
    wrong: 3,
    why: 'A remainder is one of 0, 1, …, 11. Going back three marks from 0 lands on mark 9, so $-3 \\bmod 12 = 9$, not $-3$.',
    trains: CL8,
  },
  {
    id: 'qc-every-order',
    title: 'Does 3 have an order mod 21?',
    steps: [
      'The order of $x$ mod $N$ is the least $r > 0$ with $x^r \\equiv 1$.',
      'The powers of 3 mod 21 run 3, 9, 6, 18, 12, 15, then 3 again.',
      'The list repeats, so it has a period.',
      'A repeating list must come back to 1, so 3 has an order.',
    ],
    wrong: 3,
    why: 'The powers of 3 repeat without ever reaching 1, because each is a multiple of 3. Only numbers that share no factor with 21 have an order.',
    trains: EU8,
  },
  {
    id: 'qc-any-arrows-cancel',
    title: 'Three arrows of length 1',
    steps: [
      'The three cube roots of unity are 120° apart, and laid tip to tail they close a triangle.',
      'So their sum is 0.',
      'Any three arrows of length 1 are three arrows like these.',
      'So any three arrows of length 1 add to 0.',
    ],
    wrong: 2,
    why: 'Only an even spread cancels. Arrows at 0°, 120° and 0° add to a sum of length 1.732, not 0.',
    trains: RO8,
  },
  {
    id: 'qc-numpy-sign',
    title: 'Numpy’s fft and our table',
    steps: [
      'Our table $F_N$ has the entries $\\omega^{jk}/\\sqrt N$ with $\\omega = e^{2\\pi i/N}$.',
      'Numpy’s fft adds $c_j e^{-2\\pi ijk/N}$, with a minus sign in the exponent.',
      'So fft divided by $\\sqrt N$ is the same table as $F_N$.',
      'So its output is our $\\hat c$.',
    ],
    wrong: 2,
    why: 'The signs differ. Fft divided by $\\sqrt N$ is the conjugate table, with $\\omega^{-jk}$; numpy’s ifft with the orthonormal norm is our $F_N$.',
    trains: DF8,
  },
  {
    id: 'qc-more-arrows',
    title: 'Do more arrows raise the worst case?',
    steps: [
      'Eight arrows, each turned half a step more than the last, keep 0.6407 of their straight length.',
      'Sixty-four arrows are more arrows, with the same half-step rule.',
      'More arrows keep more of the length at half a step.',
      'So 64 arrows keep more than 0.6407.',
    ],
    wrong: 2,
    why: 'At half a step, 64 arrows keep 0.6367, a little less than 0.6407. The worst case settles at $2/\\pi$, 0.6366, from above.',
    trains: GE8,
  },
  {
    id: 'qc-first-convergent',
    title: 'A convergent is not yet a period',
    steps: [
      'The bar at 11 of the 32-point transform is read as the fraction $11/32$.',
      'The convergent of $11/32$ is $1/3$, so 3 is the candidate period.',
      'To check it, compute $2^3 \\bmod 21 = 8$.',
      'Since 3 divides the true period 6, we accept 3 as the period.',
    ],
    wrong: 3,
    why: 'A candidate $q$ is the period only if $2^q \\equiv 1$. Here $2^3 = 8$ fails, so bar 11 gives no period: its $k = 2$ and $r = 6$ shared a factor.',
    trains: FR8,
  },
  // Chapter Q21 (P-Q21-story §11.2): seven spot-the-error rounds, each checked against the engine in Q21.arcade.test.ts
  {
    id: 'qc-vote-always',
    title: 'More copies always help',
    steps: [
      'Each copy of a bit flips on its own with chance $p$.',
      'A vote of three copies fails with chance $p^2(3 - 2p)$, which is $0.028$ at $p = 0.1$.',
      'More copies make the vote safer at every $p$.',
      'So encoding a bit in copies never hurts.',
    ],
    wrong: 2,
    why: 'Above $p = 0.5$ the vote fails more often than a bare bit. Three copies break even exactly at $p = 0.5$.',
    trains: CL21,
  },
  {
    id: 'qc-bf-both-one',
    title: 'Which readings point to qubit 2',
    steps: [
      'A flip of qubit 2 turns $a|000\\rangle + b|111\\rangle$ into $a|010\\rangle + b|101\\rangle$.',
      'Both parity checks, $Z_1Z_2$ and $Z_2Z_3$, now read $-1$.',
      'So the fix $X_2$ is applied when both checks read $+1$.',
      'The amplitudes $a$ and $b$ are never read.',
    ],
    wrong: 2,
    why: 'Both checks reading $+1$ means no flip. A flip of qubit 2 shows as $-1$ on both, and that pattern triggers $X_2$.',
    trains: BF21,
  },
  {
    id: 'qc-bf-sees-z',
    title: 'The bit-flip code and a sign flip',
    steps: [
      'Apply $Z_1$ to $0.6|000\\rangle + 0.8|111\\rangle$.',
      'The state becomes $0.6|000\\rangle - 0.8|111\\rangle$.',
      'The bit-flip code catches this, because its checks see any error on qubit 1.',
      'The fix then restores the state.',
    ],
    wrong: 2,
    why: '$Z_1$ commutes with $Z_1Z_2$ and $Z_2Z_3$, so both checks read $+1$. The damage is invisible to the bit-flip code.',
    trains: PF21,
  },
  {
    id: 'qc-shor-group1',
    title: 'A sign flip in group 1',
    steps: [
      'The Shor code has two big checks, $X_1\\cdots X_6$ and $X_4\\cdots X_9$.',
      'A sign flip on qubit 1 anticommutes with the first big check only.',
      'So the readings are $(+1, -1)$ for group 1.',
      'One $Z$ in that group repairs the sign.',
    ],
    wrong: 2,
    why: 'Anticommuting with the first check means that it reads $-1$, so group 1 reads $(-1, +1)$. The pair $(+1, -1)$ belongs to group 3.',
    trains: SH21,
  },
  {
    id: 'qc-small-fix',
    title: 'A small error and a small fix',
    steps: [
      'Qubit 2 gets a small nudge, $R_x(60°)$.',
      'The state is part “nothing” and part “flip”.',
      'The helpers can read something in between, such as half a flip.',
      'A half flip is repaired by a half correction.',
    ],
    wrong: 2,
    why: 'Reading the helpers forces one branch: 00 with chance $0.75$ (nothing happened) or 11 with chance $0.25$ (a whole flip). Nothing lies between.',
    trains: DG21,
  },
  {
    id: 'qc-kl-identity',
    title: 'The table must be the identity',
    steps: [
      'On the Shor code, $Z_1$ and $Z_2$ act alike on every code word.',
      'So the Knill–Laflamme table $C$ has ones where $Z_1$ meets $Z_2$.',
      'The condition needs $C$ to be the identity.',
      'So the Shor code cannot correct $\\{I, Z_1, Z_2\\}$.',
    ],
    wrong: 2,
    why: 'The condition allows any Hermitian table that is the same for both code words. Here its eigenvalues are 0, 1 and 2, and the Shor code does correct the set.',
    trains: KL21,
  },
  {
    id: 'qc-dfs-independent',
    title: 'Noise that is not shared',
    steps: [
      'The pair $0.6|01\\rangle + 0.8|10\\rangle$ has coherence $0.48$.',
      'Collective noise turns both qubits by the same angle and changes nothing.',
      'Independent random phases of $\\pm60°$ on each qubit change nothing either.',
      'So the pair needs no checks at all.',
    ],
    wrong: 2,
    why: 'Independent phases leave the difference $\\varphi_1 - \\varphi_2$, and the coherence falls from $0.48$ to $0.12$.',
    trains: DF21,
  },
  // Chapter Q22 (P-Q22-story §11.2): seven spot-the-error rounds, each checked against the engine in Q22.arcade.test.ts. The Correction echoes are qc-dual-distance (E2) and qc-s-table (E3).
  {
    id: 'qc-dual-distance',
    title: 'The dual of the Hamming code',
    steps: [
      'The $[7, 4]$ Hamming code has 16 words, and the lightest nonzero one has weight 3.',
      'Its dual is the $[7, 3]$ code, with 8 words.',
      'The dual also has distance 3, like the Hamming code.',
      'A code of distance 3 fixes any single flip, so the dual does too.',
    ],
    wrong: 2,
    why: 'All 7 nonzero words of the dual weigh 4, so its distance is 4. Only the Hamming code has distance 3.',
    trains: LC22,
  },
  {
    id: 'qc-stab-dependent',
    title: 'A third check on three qubits',
    steps: [
      'The bit-flip code is named by $Z_1Z_2$ and $Z_2Z_3$, and stores 1 qubit in 3.',
      'Add $Z_1Z_3$ as a third check.',
      'Three checks on three qubits leave $3 - 3 = 0$ stored qubits.',
      'So the code space shrinks to a single state.',
    ],
    wrong: 2,
    why: '$Z_1Z_3$ is the product of the other two, so the three checks have rank 2, not 3. One qubit is still stored: $3 - 2 = 1$.',
    trains: CM22,
  },
  {
    id: 'qc-shor-z1z2-logical',
    title: 'A logical operator on two qubits',
    steps: [
      'A logical operator commutes with every check of the code but is not itself a check.',
      '$Z_1Z_2$ commutes with every check of Shor’s code.',
      'So $Z_1Z_2$ is a logical operator, and it touches only 2 qubits.',
      'So Shor’s code has distance 2, not 3.',
    ],
    wrong: 2,
    why: '$Z_1Z_2$ is itself one of the checks, so it is not logical. The lightest logical operator touches 3 qubits, so the distance is 3.',
    trains: ST22,
  },
  {
    id: 'qc-css-any-two',
    title: 'Any two classical codes make a quantum code',
    steps: [
      'A CSS code takes $X$-checks from the rows of $H_X$ and $Z$-checks from the rows of $H_Z$.',
      'All the checks commute exactly when $H_XH_Z^{T} = 0$.',
      'Take $H_X = H_Z = M_{62}$, the checks of the $[6, 2]$ code: each row passes the checks, so $H_XH_Z^{T} = 0$.',
      'So the $[6, 2]$ code gives a CSS code.',
    ],
    wrong: 2,
    why: 'A row of $M_{62}$ is a check, not a code word, and need not pass the checks. Rows 1 and 2 share one place, so $H_XH_Z^{T}$ has a 1 and $X_1X_2$ anticommutes with $Z_1Z_3$.',
    trains: CS22,
  },
  {
    id: 'qc-decode-two',
    title: 'Two flips on the Steane code',
    steps: [
      'The Steane code fixes any one flip, because each flip leaves its own syndrome.',
      'Flips on qubits 1 and 2 together leave the syndrome 011.',
      'No single flip leaves 011, so the table finds both flips and fixes them.',
      'So the Steane code fixes any two flips.',
    ],
    wrong: 2,
    why: 'The single flip on qubit 3 also leaves 011, so the table applies $X_3$ and leaves $X_1X_2X_3$, a logical operator. All 21 pairs of flips fail.',
    trains: DC22,
  },
  {
    id: 'qc-s-table',
    title: 'The phase gate and the Pauli table',
    steps: [
      'The phase gate $S$ turns $X$ into $Y$ and leaves $Z$ alone.',
      'Conjugation respects products, and $Y = iXZ$.',
      'So $SYS^\\dagger = i\\,(SXS^\\dagger)(SZS^\\dagger) = iYZ = Z$.',
      'So the table of $S$ is $X \\to Y$, $Y \\to Z$, $Z \\to Z$.',
    ],
    wrong: 2,
    why: 'Since $YZ = iX$, the product $iYZ$ is $-X$. So $SYS^\\dagger = -X$, and two different Paulis never land on the same one.',
    trains: CF22,
  },
  {
    id: 'qc-gk-entangled',
    title: 'Entangled means hard to simulate',
    steps: [
      'Gottesman–Knill says a circuit of Clifford gates and Pauli measurements is cheap to simulate.',
      'The Steane code word $|\\bar 0\\rangle$ is entangled across all 7 qubits.',
      'A state that entangled needs about $2^7$ amplitudes, so it is hard to simulate.',
      'So entanglement alone makes a quantum computer hard to fake.',
    ],
    wrong: 2,
    why: '$|\\bar 0\\rangle$ is named by just 7 checks, however entangled it is, and a tableau of those checks holds it. Hardness needs a non-Clifford gate such as $T$.',
    trains: GK22,
  },
  // Chapter Q19 (P-Q19-story §11.2): six spot-the-error rounds, each checked against the engine in Q19.arcade.test.ts
  {
    id: 'qc-walk-spread',
    title: 'A quantum walker’s spread',
    steps: [
      'A classical walker steps left or right on a fair coin, and after $n$ steps its spread is $\\sqrt n$.',
      'A quantum walker flips a Hadamard coin each step and keeps every path at once.',
      'Its paths only interfere, and interference moves chances around without changing the width, so its spread is also $\\sqrt n$.',
      'So at $n = 100$ both walkers spread to $10$, and the quantum walker is no faster.',
    ],
    wrong: 2,
    why: 'Interference does change the width. The quantum walker’s spread grows in proportion to $n$, about $0.54\\,n$, so it reaches $54.1$ at $n = 100$ while the classical walker reaches $10$.',
    trains: RW19,
  },
  {
    id: 'qc-vertex-equal',
    title: 'The centre of a star',
    steps: [
      'A walker travels along the edges of a star and arrives at the centre, where 8 edges meet.',
      'The centre must send it out along the 8 edges so that the total chance stays 1.',
      'The fairest rule gives each of the 8 edges the same amplitude, $1/8$.',
      'So the walker is equally likely to leave along any edge.',
    ],
    wrong: 2,
    why: 'Eight amplitudes of $1/8$ carry total chance $8 \\times (1/8)^2 = 1/8$, not 1. The centre gives the arrival edge $-0.75$ and each of the other seven $0.25$, and these squares add to 1.',
    trains: SC19,
  },
  {
    id: 'qc-walk-slow',
    title: 'How long the star walk takes',
    steps: [
      'A star has $N = 1024$ outer spokes, and one of them is marked.',
      'A classical search tries the spokes one by one and looks at about $512.5$ of them on average.',
      'A walker also visits the spokes one at a time, so the quantum walk needs about $N = 1024$ steps too.',
      'So the quantum walk gives no advantage over the classical search.',
    ],
    wrong: 2,
    why: 'The walk piles chance onto the marked spoke by interference, so it does not visit the spokes one by one. Its first peak is at step $50$, close to $\\tfrac\\pi2\\sqrt N = 50.27$, with chance $0.9995$.',
    trains: SS19,
  },
  {
    id: 'qc-extra-plus',
    title: 'Starting with a plus sign',
    steps: [
      'Spokes 1 and 2 share an extra edge, and the walker must find that pair.',
      'The start has a minus sign between its leaving and arriving edges, and at $N = 64$ it reaches chance $0.70$ on spokes 1 and 2.',
      'A sign is only a phase and a phase cannot change a chance, so a plus start finds the pair equally well.',
      'So with the plus sign the chance on spokes 1 and 2 also reaches about $0.70$.',
    ],
    wrong: 2,
    why: 'The sign is a relative phase between pieces of the start, and it decides whether the pieces add up. With a plus sign the chance on spokes 1 and 2 never exceeds $0.083$ at $N = 64$.',
    trains: EE19,
  },
  {
    id: 'qc-trotter-exact',
    title: 'Two bond gates in a row',
    steps: [
      'A chain of three spins has two bonds, with Hamiltonians $H_1$ and $H_2$, and $H = H_1 + H_2$.',
      'Each bond has its own gate, $e^{-iH_1t}$ and $e^{-iH_2t}$, in closed form.',
      'So the two gates in a row multiply to exactly $e^{-iHt}$.',
      'So one piece, $M = 1$, imitates the chain at $t = 2$ with no error.',
    ],
    wrong: 2,
    why: 'The two bonds share a spin, so $H_1$ and $H_2$ do not commute: $\\|[H_1, H_2]\\| = 0.433$. One piece misses the chain by $0.733$ at $t = 2$, and $M = 8$ pieces cut the miss to $0.0911$.',
    trains: SM19,
  },
  {
    id: 'qc-qaoa-sure',
    title: 'One layer of QAOA',
    steps: [
      'QAOA on a four-cycle starts from an equal mix of all 16 patterns, whose average cut is $2$.',
      'One layer at the best angles lifts the average cut to $3$, and the largest cut is $4$.',
      'An average of $3$ out of $4$ means the layer reads the largest cut every time.',
      'So one layer finds the best cut on every run.',
    ],
    wrong: 2,
    why: 'An average of $3$ is a mix of different cuts. The largest cut of $4$ comes up with chance $0.531$ and a cut of $2$ with chance $0.4375$, against $0.125$ for a random pattern.',
    trains: QA19,
  },
  // Chapter Q20 (P-Q20-story §11.2): six spot-the-error rounds, each checked against the engine in Q20.arcade.test.ts
  {
    id: 'qc-clone-perfect',
    title: 'Tuning the cloner',
    steps: [
      'The cloner has one dial, the program angle $u$, which sets how well each of its two output wires matches the input.',
      'At $u = 0$ wire 1 is a perfect copy, and at $u = 60^\\circ$ wire 2 is a perfect copy.',
      'So some angle between them makes both wires perfect copies.',
      'So a quantum machine can clone a qubit if its dial is tuned right.',
    ],
    wrong: 2,
    why: 'Quality trades between the wires. At the equal setting $u = 30^\\circ$ each wire has fidelity $5/6 = 0.833$, the best both wires can have together.',
    trains: CL20,
  },
  {
    id: 'qc-unot-gate',
    title: 'The universal NOT as a gate',
    steps: [
      'A universal NOT should send every state to the state exactly opposite it on the Bloch sphere.',
      'The gate $\\sigma_y$ sends $|{+z}\\rangle$ to $|{-z}\\rangle$ and $|{+x}\\rangle$ to $|{-x}\\rangle$, up to a phase.',
      'So $\\sigma_y$ sends every state to its opposite, and the U-NOT is the gate $\\sigma_y$.',
      'So a perfect U-NOT can be built from one unitary gate.',
    ],
    wrong: 2,
    why: 'The gate $\\sigma_y$ leaves $|{+y}\\rangle$ where it is: a gate turns the sphere, and no turn sends every point to its opposite. The best machine sends each arrow to the opposite direction, one third as long.',
    trains: UN20,
  },
  {
    id: 'qc-clone-both',
    title: 'Measure and prepare, as a pair',
    steps: [
      'Measure-and-prepare cloning reads the input in a random direction and prepares two copies of the result.',
      'Each single copy matches the input with fidelity $2/3$.',
      'The pair matches the ideal two-copy state $|\\psi\\rangle|\\psi\\rangle$ equally well, with fidelity $2/3$.',
      'So for the pair, measure-and-prepare matches the cloner circuit, which also gives $2/3$.',
    ],
    wrong: 2,
    why: 'The pair’s overlap with $|\\psi\\psi\\rangle$ is only $1/2$, below the cloner circuit’s $2/3$. The value $2/3$ belongs to a single copy, where the circuit gives $5/6$.',
    trains: UN20,
  },
  {
    id: 'qc-proc-universal',
    title: 'Programs for every gate',
    steps: [
      'A processor has a data wire and a program register, and the program picks the gate the data gets.',
      'Gates that differ by more than a phase need programs that are orthogonal.',
      'A program can be any superposition of basis states, so two program wires are enough to name every gate.',
      'So a two-wire program can run every one-qubit gate with certainty.',
    ],
    wrong: 2,
    why: 'Orthogonal programs need one dimension each, and $n$ program wires have $2^n$ dimensions: 4 for two wires, $1024$ for ten. Infinitely many gates need infinitely many dimensions.',
    trains: NG20,
  },
  {
    id: 'qc-rus-sure',
    title: 'Trying again',
    steps: [
      'The CNOT processor succeeds with chance $1/2$, and a failure leaves the data turned the wrong way.',
      'After a failure, a second run with a doubled program angle again succeeds with chance $1/2$ of what is left.',
      'So after $k$ rounds the chance of success is $1 - 2^{-k}$.',
      'So after 7 rounds the machine succeeds with certainty.',
    ],
    wrong: 3,
    why: 'The failure chance $2^{-k}$ halves each round but never reaches 0. After 7 rounds the chance is $0.992$; it takes 7 rounds to pass $0.99$ and 10 to pass $0.999$.',
    trains: PB20,
  },
  {
    id: 'qc-disc-orth',
    title: 'Orthogonal examples',
    steps: [
      'A programmable discriminator gets one example of each of two unknown states, and a data qubit equal to one of them.',
      'A machine told that the two states are orthogonal tells them apart every time.',
      'The examples here are orthogonal, so the programmable machine also tells them apart every time.',
      'So with orthogonal examples the programmable machine succeeds with chance 1.',
    ],
    wrong: 2,
    why: 'The programmable machine is not told the states are orthogonal. It can only test for the antisymmetric part, so at overlap $0$ its success chance is $1/3$, against $1$ for a machine told the states.',
    trains: DI20,
  },
  // Chapter Q23 (P-Q23-story §11.2): six spot-the-error rounds, each checked against the engine in Q23.arcade.test.ts
  {
    id: 'qc-rel-distance',
    title: 'Relative entropy as a distance',
    steps: [
      'The relative entropy $H(p\\|q)$ is $0$ when the two chance tables are equal and positive otherwise, as a distance should be.',
      'For the fair coin $p = (0.5, 0.5)$ and the biased coin $q = (0.9, 0.1)$ it is $0.737$ bits.',
      'Reading the pair from the other end changes nothing, so $H(q\\|p)$ is also $0.737$ bits.',
      'So the relative entropy is a distance between chance tables.',
    ],
    wrong: 2,
    why: 'The other way round, $H(q\\|p) = 0.531$ bits. A distance reads the same from both ends, so the relative entropy is not one.',
    trains: CC23,
  },
  {
    id: 'qc-fid-metric',
    title: 'Fidelity as a distance',
    steps: [
      'The square roots of a table’s chances form an arrow of length 1. The fidelity $F(p, q)$ is the dot product of two such arrows.',
      'Equal tables have $F = 1$, so $1 - F$ is $0$ for equal tables and grows as the tables differ.',
      'So $1 - F$ is a distance: a detour through a third table $r$ is never shorter.',
      'So going from $p = (0.5, 0.5)$ to $q = (0.9, 0.1)$ directly is never longer than going through $r = (0.7, 0.3)$.',
    ],
    wrong: 2,
    why: 'The direct $1 - F(p, q)$ is $0.106$, but the detour totals $0.054$. It is the angle $\\theta = \\cos^{-1}F$ that obeys the rule: $26.57^\\circ = 11.79^\\circ + 14.78^\\circ$.',
    trains: CC23,
  },
  {
    id: 'qc-whole-part',
    title: 'The whole and its part',
    steps: [
      'For two coins the pair is never less uncertain than one coin alone: $H(X, Y) \\ge H(X)$.',
      'A quantum pair has an entropy $S(AB)$, and its part $A$ has an entropy $S(A)$.',
      'The same rule holds for quantum states, so $S(AB) \\ge S(A)$ always.',
      'So a Bell pair has at least as much entropy as one of its qubits.',
    ],
    wrong: 2,
    why: 'A Bell pair is a pure state, so $S(AB) = 0$, while either qubit alone has $S(A) = 1$ bit. A quantum part can be more uncertain than its whole.',
    trains: EP23,
  },
  {
    id: 'qc-local-noise',
    title: 'Noise on one half',
    steps: [
      'The mutual information $S(A{:}B) = S(A) + S(B) - S(AB)$ counts the correlations between two parts.',
      'Bob may apply any noisy operation to his half $B$ and leave $A$ alone.',
      'Noise adds randomness to $B$, and randomness is correlation with something, so the pair can end up sharing more.',
      'So Bob can raise $S(A{:}B)$ by adding noise to his half.',
    ],
    wrong: 2,
    why: 'Noise on one half can only keep or lower $S(A{:}B)$. For a Bell pair with a phase-error chance of $0.1$ on Bob’s half it falls from $2$ to $1.531$, a fall of $0.469$.',
    trains: QM23,
  },
  {
    id: 'qc-holevo-reach',
    title: 'Reaching the Holevo number',
    steps: [
      'Alice sends $|0\\rangle$ or $|{+}\\rangle$ with chance $1/2$ each, and the Holevo number for this pair is $\\chi = 0.601$ bit.',
      'No measurement of Bob’s can give him more than $\\chi$.',
      'Measuring along $z$ gives him $0.311$ bit, which is less than $\\chi$.',
      'So some better measurement along a tilted axis must give him the full $0.601$ bit.',
    ],
    wrong: 3,
    why: 'The Holevo number is only an upper bound. For two states that are not orthogonal, even Bob’s best measurement gives $0.399$ bit.',
    trains: HO23,
  },
  {
    id: 'qc-bb84-full',
    title: 'A full bit per qubit',
    steps: [
      'Alice sends one of the four BB84 states, $|0\\rangle$, $|1\\rangle$, $|{+}\\rangle$ or $|{-}\\rangle$, each with chance $1/4$.',
      'Their average is $I/2$, so the Holevo number is $\\chi = 1$ bit, the most a qubit can carry.',
      'Bob measures along $z$, which reaches the Holevo number, so he learns $1$ bit.',
      'So a BB84 receiver learns a full bit about every state sent.',
    ],
    wrong: 2,
    why: 'Along $z$ Bob tells $|0\\rangle$ from $|1\\rangle$, but $|{+}\\rangle$ and $|{-}\\rangle$ read $0$ or $1$ at random. He learns $0.5$ bit, and no axis does better.',
    trains: HO23,
  },
  // Chapter Q24 (P-Q24-story §11.2): six spot-the-error rounds, each checked against the engine in Q24.arcade.test.ts
  {
    id: 'qc-t2-longer',
    title: 'A phase that outlives the population',
    steps: [
      'A decaying qubit loses its population over a time $T_1$ and its phase signal over a time $T_2$.',
      'With pure decay the phase signal lasts $T_2 = 2T_1$.',
      'The environment might also protect the phase while the population still decays, so $T_2 = 3T_1$ is allowed.',
      'So some qubits keep their phase three times longer than their population.',
    ],
    wrong: 2,
    why: 'At $T_2 = 3T_1$ the smaller eigenvalue of the state dips to $-0.0096$ near $3.2\\,T_1$, a negative chance. Positivity forces $T_2 \\le 2T_1$.',
    trains: LI24,
  },
  {
    id: 'qc-steady-invert',
    title: 'Driving until the qubit is inverted',
    steps: [
      'A resonant drive lifts the qubit toward the excited state, and decay pulls it back toward the ground state.',
      'Wait long enough and drive and decay balance, and a stronger drive moves the balance toward the excited state.',
      'So a strong enough drive leaves the qubit fully excited in the steady state.',
      'So steady light can invert a qubit.',
    ],
    wrong: 2,
    why: 'The balance never passes one half. On resonance the excited share is $s/(2(1+s))$ with $s = T_1T_2\\Omega^2$, only $0.495$ at $s = 100$.',
    trains: BE24,
  },
  {
    id: 'qc-rabi-sign',
    title: 'Which way a real drive turns',
    steps: [
      'A resonant drive $\\Omega$ turns the qubit about an axis in the $xy$ plane, and the phase of $\\Omega$ picks the axis.',
      'A real $\\Omega$ turns the qubit about $x$, and an imaginary $\\Omega$ turns it about $y$.',
      'For $\\Omega$ real and positive the pulse of angle $\\theta$ is $R_x(\\theta)$, which takes $|0\\rangle$ toward $-y$.',
      'So a quarter pulse leaves the arrow pointing along $-y$.',
    ],
    wrong: 2,
    why: 'Our calculation finds that a real positive $\\Omega$ gives $R_x(-\\theta)$, which takes $|0\\rangle$ to $|{+y}\\rangle$. At a quarter pulse it is $1.414$ away from $R_x(\\theta)$.',
    trains: RB24,
  },
  {
    id: 'qc-composite-zero',
    title: 'A composite pulse',
    steps: [
      'A pulse a little too long or too short turns by $\\pi(1 + \\epsilon)$, so it leaves an error of order $\\epsilon$.',
      'The four-pulse sequence $R_z(-\\pi)R_x(\\tfrac\\pi2)R_y(\\pi)R_x(\\tfrac\\pi2)$ equals a plain $\\pi$ pulse about $x$ when every angle is exact.',
      'With the same fractional error $\\epsilon$ in every angle, the four pulses cancel one another’s errors exactly.',
      'So a composite pulse removes the error.',
    ],
    wrong: 2,
    why: 'The error does not vanish: it shrinks to order $\\epsilon^2$. At $\\epsilon = 0.01$ the composite error is $0.000247$, against $0.0157$ for the plain pulse.',
    trains: RB24,
  },
  {
    id: 'qc-fast-noise',
    title: 'Noise that changes quickly',
    steps: [
      'Noise of size $\\sigma = 1$ has a correlation time $\\tau_c$, the time over which it forgets itself.',
      'Slow noise, with $\\tau_c = 10$, makes the signal fall in a bell shape with decay time $T_2^* = 1.45$.',
      'Noise that forgets itself faster changes more often, so it dephases the qubit faster and $T_2^*$ shrinks.',
      'So at $\\tau_c = 0.1$ the decay time is shorter than $1.45$.',
    ],
    wrong: 2,
    why: 'Fast noise averages itself out. At $\\tau_c = 0.1$ the decay time is $T_2^* = 10.1$, almost seven times longer than the $1.448$ of slow noise.',
    trains: RM24,
  },
  {
    id: 'qc-echo-any',
    title: 'What the echo cancels',
    steps: [
      'An echo waits a time $\\tau$, flips the qubit with a $\\pi$ pulse, waits $\\tau$ again, and flips it back.',
      'A fixed frequency error adds a phase in the first wait and the opposite phase in the second, so they cancel.',
      'Noise that changes during the waits is cancelled the same way, so the echo cancels any noise.',
      'So the echo restores the signal whatever the correlation time of the noise.',
    ],
    wrong: 2,
    why: 'The echo cancels only noise that stays put between the two waits. At correlation time $0.1$ it keeps $0.844$ against $0.827$ for plain Ramsey, hardly better.',
    trains: DC24,
  },
  // Chapter Q25 (P-Q25-story §11.2): six spot-the-error rounds, each checked against the engine in Q25.arcade.test.ts
  {
    id: 'qc-table-doppler',
    title: 'The narrow strontium line',
    steps: [
      'Cooling beams in optical molasses reach the Doppler temperature $T_D = \\hbar\\gamma/2k_B$, set by the width $\\gamma$ of the cooling line.',
      'Rubidium, with $\\gamma/2\\pi = 6.07$ MHz, reaches $T_D = 145.7\\,\\mu$K.',
      'Strontium’s narrow line at 689 nm has $\\gamma/2\\pi = 0.0074$ MHz, so by the same formula it reaches $T_D = 1.02\\,\\mu$K.',
      'So the narrow line cools to about a microkelvin.',
    ],
    wrong: 2,
    why: 'Our calculation finds $T_D = 0.178\\,\\mu$K for that line. The value near $1\\,\\mu$K is the recoil temperature of strontium’s 461 nm line, $1.03\\,\\mu$K.',
    trains: CO25,
  },
  {
    id: 'qc-load-full',
    title: 'Loading a tweezer site',
    steps: [
      'A tweezer site catches a random number $N$ of atoms from the cloud, with average $\\mu = 1$.',
      'Light-assisted collisions remove atoms in pairs, so a site ends with $0$ or $1$ atom.',
      'A site that catches at least one atom ends with one, so almost every site ends full.',
      'So loading fills every site with a single atom.',
    ],
    wrong: 2,
    why: 'A site that catches an even number of atoms ends empty. The chance of ending with one atom is $(1 - e^{-2\\mu})/2 = 0.432$ at $\\mu = 1$, and it never exceeds $1/2$.',
    trains: CO25,
  },
  {
    id: 'qc-blockade-fast',
    title: 'A stronger blockade',
    steps: [
      'In the $\\pi$–$2\\pi$–$\\pi$ gate the control atom’s Rydberg excitation blocks the target, but only up to the blockade strength $B$.',
      'The Rydberg state decays, so the pulse should be fast, while a leaky blockade calls for a pulse slow compared with $B$.',
      'Once $B$ is much larger than the Rabi frequency $\\Omega$ the leak is negligible, so a stronger blockade no longer lowers the gate error.',
      'So the best error stops improving as $B$ grows.',
    ],
    wrong: 2,
    why: 'A stronger blockade lets the pulse be faster, which cuts decay. The best error falls as $(B\\tau)^{-2/3}$: $0.00915$ at $B\\tau = 10^4$ and $0.00199$ at $10^5$, about $0.22$ times as large.',
    trains: AG25,
  },
  {
    id: 'qc-trap-static',
    title: 'Holding an ion with a still field',
    steps: [
      'In empty space the electric potential $\\phi$ obeys $\\nabla^2\\phi = 0$.',
      'A trap needs a potential energy that rises in every direction away from a rest point.',
      'A static quadrupole field has curvatures $2$, $2$ and $-4$, and a strong enough field makes all three positive.',
      'So a strong enough static field traps an ion.',
    ],
    wrong: 2,
    why: 'The three curvatures always sum to $0$, as $2 + 2 - 4$ does. Whatever the strength, one direction curves downward, so the rest point is a saddle.',
    trains: IT25,
  },
  {
    id: 'qc-cz-hot',
    title: 'A warm ion and the Cirac–Zoller gate',
    steps: [
      'The Cirac–Zoller gate moves a qubit state onto the shared vibration, applies a phase, and moves it back.',
      'The pulses are timed for a vibration that starts with no phonon.',
      'A warm ion starts with a few phonons, and the swap pulses change only slightly, so the gate still works.',
      'So the gate can run without cooling the ion first.',
    ],
    wrong: 2,
    why: 'With one phonon present the Bell-state chance falls from $1.000$ to $0.254$, and with two to $0.138$. The Mølmer–Sørensen gate keeps $1.000$ even with four phonons.',
    trains: IG25,
  },
  {
    id: 'qc-ms-time',
    title: 'When to stop the Mølmer–Sørensen gate',
    steps: [
      'In the Mølmer–Sørensen gate the drive makes the motion of the ions trace loops in phase space.',
      'The ions pick up an entangling phase that grows with the area of the loop.',
      'A gate stopped part-way round a loop still gives the right phase, so any gate time will do.',
      'So the gate makes the same Bell state whenever it is stopped.',
    ],
    wrong: 2,
    why: 'The motion must return to its start, so the gate must end after a whole number of loops. Stopped at $17.36$ loops the infidelity is $0.0229$; at $17$ loops it is $2.7 \\times 10^{-4}$.',
    trains: IG25,
  },
  // Chapter Q26 (P-Q26-story §11.2): four spot-the-error rounds, each checked against the engine in Q26.arcade.test.ts
  {
    id: 'qc-hom-add-chances',
    title: 'Two photons at a splitter',
    steps: [
      'One photon enters each input port of a 50:50 splitter.',
      'Alone, each photon leaves by either exit with chance $1/2$, and neither one knows about the other.',
      'So the chances just add up: with chance $1/2$ the photons leave one by each exit.',
      'So the output is spread over $|20\\rangle$, $|11\\rangle$ and $|02\\rangle$, with $|11\\rangle$ the likeliest.',
    ],
    wrong: 2,
    why: 'The two ways to leave one by each exit are arrows of equal length and opposite direction, and they cancel: the chance is $0$. The photons leave together, $|20\\rangle$ or $|02\\rangle$, one half each.',
    trains: HM26,
  },
  {
    id: 'qc-ns-average',
    title: 'The chance of the sign gate',
    steps: [
      'The nonlinear sign gate negates the amplitude of the two-photon part, using one ancilla photon and two detectors.',
      'It is accepted only when the detectors give the agreed reading, and then it succeeds with chance $0.2265$.',
      'This $0.2265$ is an average over inputs, so some inputs succeed far more often than others.',
      'So a well chosen input state could make the gate succeed much more often.',
    ],
    wrong: 2,
    why: 'The chance is $\\cos^2\\varphi = 0.2265$ for every input of at most two photons. The amplitudes for 0, 1 and 2 photons are all the same size after the gate.',
    trains: NS26,
  },
  {
    id: 'qc-klm-repeat',
    title: 'Three gates in a row',
    steps: [
      'A photonic CZ gate succeeds with chance $0.0513$, and its detectors tell us whether it worked.',
      'A program needs three such gates one after another on the same photons.',
      'Since failures are announced, each gate can be repeated on the same photons until it succeeds.',
      'So the three gates together succeed with a chance close to $1$.',
    ],
    wrong: 2,
    why: 'A failed gate has already measured the photons, so nothing is left to repeat on. All three must succeed in one run: $0.0513^3 = 1.35 \\times 10^{-4}$, about one run in $7400$.',
    trains: NS26,
  },
  {
    id: 'qc-cat-orthogonal',
    title: 'Two laser states as a qubit',
    steps: [
      'A laser beam in a coherent state $|\\alpha\\rangle$ has a photon number that varies around $\\alpha^2$.',
      'The states $|\\alpha\\rangle$ and $|{-\\alpha}\\rangle$ differ in the sign of the amplitude.',
      'Opposite signs make them orthogonal, so for any $\\alpha$ they are an exact $0$ and $1$ of a qubit.',
      'So two coherent states of opposite sign never overlap.',
    ],
    wrong: 2,
    why: 'Their overlap in chance is $e^{-4\\alpha^2}$: $0.0183$ at $\\alpha = 1$ and $1.1 \\times 10^{-7}$ at $\\alpha = 2$. It is never exactly $0$, but the even and odd cat states are exactly orthogonal.',
    trains: NL26,
  },
  // Chapter Q27 (P-Q27-story §11.2): four spot-the-error rounds, each checked against the engine in Q27.arcade.test.ts
  {
    id: 'qc-lc-qubit',
    title: 'An LC circuit as a qubit',
    steps: [
      'An LC circuit has levels $\\hbar\\omega(n + \\tfrac12)$, so its two lowest levels form a two-level system.',
      'Cooled to a few millikelvin, the circuit sits in its lowest level, so it starts in a definite state.',
      'A pulse at the frequency of the $0 \\to 1$ step drives only that step, so the two lowest levels act as a clean qubit.',
      'So an LC circuit is a good qubit.',
    ],
    wrong: 2,
    why: 'The rungs are equally spaced, so the same pulse also fits the $1 \\to 2$ step, and drives it $\\sqrt2 = 1.414$ times more strongly. The circuit leaks out of the qubit.',
    trains: LC27,
  },
  {
    id: 'qc-flux-h-over-e',
    title: 'The flux quantum',
    steps: [
      'The wave function of the paired electrons must come back to itself after one trip round a superconducting ring.',
      'So its phase turns by a whole number of turns, and the flux through the ring is a whole number of flux quanta.',
      'The carrier is an electron of charge $e$, so one flux quantum is $\\Phi_0 = h/e$.',
      'So the ring holds flux in steps of $h/e$.',
    ],
    wrong: 2,
    why: 'The carriers are Cooper pairs, with charge $2e$. So $\\Phi_0 = h/2e = 2.068 \\times 10^{-15}$ Wb, half of $h/e$.',
    trains: SC27,
  },
  {
    id: 'qc-transmon-anharm',
    title: 'How much anharmonicity a transmon needs',
    steps: [
      'A transmon is a charge qubit run at a large ratio $E_J/E_C$, so that charge noise barely moves its levels.',
      'Its rungs are not quite equal, and the second gap is shorter than the first by the relative anharmonicity $\\alpha$.',
      'To address the $0 \\to 1$ step alone, $|\\alpha|$ must be large, tens of percent.',
      'So doubling $E_J/E_C$ from 10 to 20, which shrinks $|\\alpha|$, would ruin the qubit.',
    ],
    wrong: 2,
    why: 'At $E_J/E_C = 20$ the anharmonicity is only $-0.0457$, and that is enough. Doubling the ratio cuts $|\\alpha|$ by just $1.52$, but cuts the charge dependence $967$ times.',
    trains: TM27,
  },
  {
    id: 'qc-dot-dipole',
    title: 'What couples two dot spins',
    steps: [
      'Two electrons sit in neighbouring dots, and each carries a spin.',
      'Each spin is a tiny magnet, and two magnets feel each other through their dipole fields.',
      'So the singlet and triplet states differ in energy because of the magnetic dipole force between the spins.',
      'So the coupling is magnetic, and a magnetic field could switch it.',
    ],
    wrong: 2,
    why: 'The splitting comes from the Coulomb force and the Pauli rule. In the model the singlet state has energy $1.1$ and the triplet $0.9$, and the gap $2K$ gives the coupling $-2K\\,\\mathbf s_1\\cdot\\mathbf s_2$.',
    trains: DT27,
  },
]

// ── Arcade index ────────────────────────────────────────────────────────────────────────────────────────────
const uniq = (t: Trains[]) => t.filter((x, i) => t.findIndex((y) => y.unit === x.unit) === i)

export const QC_GAMES: GameEntry[] = [
  {
    id: 'qc-route-the-beam',
    kind: 'sg-puzzle',
    title: 'Route the beam',
    blurb: 'Build a chain of magnets that lands exactly the asked-for fraction of atoms on one spot.',
    levels: QC_SG_LEVELS.length,
    trains: uniq(QC_SG_LEVELS.map((l) => l.trains)),
  },
  {
    id: 'qc-spot-the-error',
    kind: 'spot-the-error',
    title: 'Spot the error',
    blurb: 'Each argument goes wrong at one step, the kind of slip real notes and real students make. Find where it first goes wrong.',
    levels: QC_ERROR_ROUNDS.length,
    trains: uniq(QC_ERROR_ROUNDS.map((r) => r.trains)),
  },
  {
    id: 'qc-bloch-golf',
    kind: 'bloch-golf',
    title: 'Bloch golf',
    blurb: 'Reach the target state in as few quarter turns as possible.',
    levels: QC_GOLF_LEVELS.length,
    trains: uniq(QC_GOLF_LEVELS.map((l) => l.trains)),
  },
]
