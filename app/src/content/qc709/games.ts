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
      'So P’s Schmidt weights are $\\sqrt{0.75}$ and $\\sqrt{0.25}$.',
    ],
    wrong: 3,
    why: "These partners overlap (0.25): the Schmidt weights come from $\\rho_A$'s own eigenbasis, 0.924 and 0.383, not the 0/1 rows.",
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
