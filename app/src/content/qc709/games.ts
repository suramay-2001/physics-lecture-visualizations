/**
 * Physics 709 Arcade (F1 + Q1 pilots): the ten levels the pilot plans specify (P-F1-story.md §11.2, P-Q1-story.md
 * §11.2), grouped by format the same way 448's are (arcade/games.ts). Every verdict comes from the engine; solutions
 * live here for the tests and are never shown. content/qc709/games.test.ts recomputes each correction independently.
 *
 * Lazy module: only the 709 pages and GamePage import this (chunk contract (h), build/chunks.test.ts) — it must
 * never reach 448's first paint. Ids start `qc-` (content/courses.test.ts). Types are shared with 448's arcade
 * (`import type`, erased at build: no runtime edge into arcade/games.ts's chunk).
 */
import type { ErrorRound, GameEntry, SgLevel, Trains } from '../../arcade/games'

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
]
