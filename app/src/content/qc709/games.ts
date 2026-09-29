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

const Q4x = (unit: string, label: string): Trains => ({ lecture: 'Q4', unit, label })
const QB4 = Q4x('q4-qubit', 'Q4.1 From a bit to a qubit')
const GA4 = Q4x('q4-one-qubit-gates', 'Q4.2 One-qubit gates turn the sphere')
const CN4 = Q4x('q4-cnot', 'Q4.4 CNOT: flip the target when the control is 1')
const CI4 = Q4x('q4-circuits', 'Q4.5 Circuits: wires are time, products run backwards')
const ME4 = Q4x('q4-measure', 'Q4.6 Reading a register, whole or one qubit')

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
