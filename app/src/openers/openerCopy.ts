/**
 * The words beside the chapter openers (decision P3 #9): the Blender films (Hopf, belt trick, Grover) and, below them, the
 * Motion Canvas films of Physics 709. Each caption covers a frame range of the
 * film; the facts they state are checked against the engine in openerCopy.test.ts. The film itself states
 * no number: the DOM carries the claims, the frames illustrate them (CLAUDE.md: generated media never
 * states a physical result on its own).
 */
import { STAGE_THEME } from '../stage/tokens'
import { OPENER_TITLES, type OpenerName } from './openerTitles'

export type { OpenerName }

export interface OpenerBeat {
  /** first and last frame this caption covers (inclusive) */
  from: number
  to: number
  text: string
}

export interface OpenerSpec {
  name: OpenerName
  /** where the frames live under the app's base URL, no trailing slash (the Blender openers: `openers/<name>`; the Motion Canvas films: `films/qc709/<name>`) */
  dir: string
  /** the stage ground behind the frames (default: the 448 state ground); the 709 films sit on the 709 stage navy */
  ground?: string
  title: string
  frames: number
  /** the still shown under reduced motion and on narrow screens (a copy of one frame) */
  poster: string
  alt: string
  beats: OpenerBeat[]
  /** what the picture gets right and what it distorts (decision: name the distortion) */
  fidelity: { exact: string[]; distorted: string[] }
}

export const OPENERS: Record<OpenerName, OpenerSpec> = {
  hopf: {
    name: 'hopf',
    dir: 'openers/hopf',
    title: OPENER_TITLES.hopf,
    frames: 120,
    poster: 'poster.webp',
    alt: 'Circles in space, each linked through all the others, arranged on nested tori around a vertical line.',
    beats: [
      {
        from: 0,
        to: 29,
        text: 'Multiply a spin state by a phase, $e^{i\\chi}|{+z}\\rangle$, and nothing you can measure changes. So one point of the Bloch sphere stands for a whole circle of state vectors. The bead runs once around the circle for $|{+z}\\rangle$.',
      },
      {
        from: 30,
        to: 59,
        text: 'Each state on one latitude of the Bloch sphere (here $\\theta = 80°$) has its own circle. Together the circles sweep out a torus, and every circle passes once through every other one.',
      },
      {
        from: 60,
        to: 119,
        text: 'All the latitudes together fill space with nested tori. This is the Hopf fibration: the space of all spin-½ state vectors, a three-sphere, drawn here by stereographic projection. The circle for $|{-z}\\rangle$ runs through infinity, so it shows up as the straight line.',
      },
    ],
    fidelity: {
      exact: ['Every drawn circle is exactly the set of state vectors with one Bloch point.', 'Any two circles are linked once, as drawn.'],
      distorted: [
        'Stereographic projection keeps circles circular but stretches distances: outer circles look far bigger than they are.',
        'Only 128 of infinitely many circles are drawn, and a band of them is left out of the two outer tori so the inner ones show.',
      ],
    },
  },
  belt: {
    name: 'belt',
    dir: 'openers/belt',
    title: OPENER_TITLES.belt,
    frames: 120,
    poster: 'poster.webp',
    alt: 'A steel block hangs from a bracket on a belt. The block turns twice and the belt twists; then the belt loops round and hangs flat again.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'Turn the block once about the vertical, 360°. The belt now carries one twist. A spin-½ ket turned by 360° comes back as its negative, the same physical state: $R_z(2\\pi)|{+z}\\rangle = -|{+z}\\rangle$.',
      },
      {
        from: 40,
        to: 79,
        text: 'Turn it once more, 720° in all: two twists. Now the ket itself is back, $R_z(4\\pi)|{+z}\\rangle = +|{+z}\\rangle$.',
      },
      {
        from: 80,
        to: 119,
        text: 'Now hold the block still and loop the belt around. Both twists come out and the belt hangs flat. One twist can never be removed this way. The belt tracks the sign of a spin-½ ket. After one turn something is left over; after two, nothing is.',
      },
    ],
    fidelity: {
      exact: ['How each piece of belt is turned, frame by frame (the rotations are computed, not drawn by hand).', 'One twist after 360°, two after 720°, none at the end.'],
      distorted: ['The path the belt takes through space is one choice of many.', 'A real belt needs slack to make the loop; this one is allowed to change length.'],
    },
  },
  grover: {
    name: 'grover',
    dir: 'openers/grover',
    ground: STAGE_THEME.qc709.bg['grover-plane'],
    title: OPENER_TITLES.grover,
    frames: 120,
    poster: 'poster.webp',
    alt: 'A circle with a horizontal and a vertical axis, and a white arrow from its centre that begins just above the horizontal and turns upward in equal steps, leaving fainter arrows at its earlier angles. Below the circle, a row of eight bars: they start equal, then one white bar grows tall while the other seven shrink and dip below the line.',
    beats: [
      {
        from: 0,
        to: 19,
        text: 'Search eight strings for one marked string. At the start every string is equally likely, so the eight bars are equal. The whole search lives in a flat plane: across stands for the seven unmarked strings together, and up for the marked one. The state is the arrow. It starts at the small angle $\\alpha = 20.7°$ above the across axis, where $\\sin\\alpha = 1/\\sqrt{8}$.',
      },
      {
        from: 20,
        to: 71,
        text: 'One step of the search turns the arrow by $2\\alpha = 41.4°$ toward the marked axis. The marked bar grows while the others shrink. After two steps the arrow is $5\\alpha = 103.5°$ from the across axis, as close to straight up as whole steps allow, and a reading finds the marked string with chance $0.9453$. A bar below its line is a small negative amplitude.',
      },
      {
        from: 72,
        to: 119,
        text: 'Keep going and the arrow overshoots. A third step takes it to $7\\alpha = 144.9°$: the marked bar shrinks and the chance of finding the string falls back to $0.3301$. So the number of steps matters, and Unit 17.4 works out the best one.',
      },
    ],
    fidelity: {
      exact: [
        'Every arrow that rests is the search state after a whole number of steps, in the plane of the marked string and the rest.',
        'Each step turns the arrow by the same angle, $2\\alpha$, and the bars are the amplitudes of the eight strings (the marked bar is the arrow’s vertical part).',
      ],
      distorted: [
        'Between whole steps the arrow glides; the algorithm never rests in one of those in-between states.',
        'The circle and the bars are not drawn to one scale, and the across axis stands for seven strings at once.',
      ],
    },
  },
  'qc-q16-cancel': {
    name: 'qc-q16-cancel',
    dir: 'films/qc709/qc-q16-cancel',
    ground: STAGE_THEME.qc709.bg.amplitudes,
    title: OPENER_TITLES['qc-q16-cancel'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Eight upright bars on a line, blue where they point up and salmon where they point down, with a dashed line at their mean level. First all eight point up; four of them flip down one at a time while the dashed line sinks onto the axis. Then the bars change, and the leftmost column, boxed, is left empty. Finally all eight bars hang down and merge into one long downward bar in the boxed column.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'After the query, each of the eight strings has a bar of height $0.3536$ whose sign is $(-1)^{f(x)}$. Start with $f = 0$ everywhere: all eight bars point up and the dashed mean line sits on their tops. Now switch $f$ to 1 on four strings, one at a time. Each switch flips one bar below the axis and drops the mean line, until four bars are up, four are down and the mean is $0$.',
      },
      {
        from: 40,
        to: 79,
        text: 'The last Hadamards turn the all-zeros bar, the boxed one, into the average of the eight signs. For this balanced $f$ its amplitude is $0$, and so is its chance: the signs cancel. All the chance has moved to four other strings, $0.25$ on each.',
      },
      {
        from: 80,
        to: 119,
        text: 'Now a constant $f$, here $f = 1$ everywhere. Every sign is minus, so all eight bars hang down at $-0.3536$ with the mean line on their ends. The last Hadamards pile them into the boxed bar, whose amplitude is $-1$, so its chance is 1. A balanced $f$ leaves the all-zeros bar empty and a constant $f$ fills it, so one reading tells them apart.',
      },
    ],
    fidelity: {
      exact: [
        'Each bar is the amplitude of one string, taken from a simulation of the circuit after the query and after the last Hadamards.',
        'The dashed line is the mean of the eight bars.',
      ],
      distorted: [
        'The functions between “0 everywhere” and the balanced $f$ are neither constant nor balanced; they only show the mean line move.',
        'Between two pictures the bars glide in a straight line; only the pictures at rest are states of the circuit.',
      ],
    },
  },
  'qc-q17-mean': {
    name: 'qc-q17-mean',
    dir: 'films/qc709/qc-q17-mean',
    ground: STAGE_THEME.qc709.bg.amplitudes,
    title: OPENER_TITLES['qc-q17-mean'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Eight bars on a line, blue above it and salmon below, with a dashed line at their mean level and a grey column at the right. One bar flips below the line. Then every bar swings to the other side of the dashed line, each move marked by a thin arrow, and the flipped bar ends up tall. The two moves repeat, and the grey column rises to nearly the height of the tall bar.',
    beats: [
      {
        from: 0,
        to: 31,
        text: 'Start from the even mix: eight equal bars of height $0.3536$, with the dashed mean line on their tops. The mark flips the bar of the marked string, $101$, below the axis. The other seven stay where they are, so the mean line drops to $0.2652$.',
      },
      {
        from: 32,
        to: 71,
        text: 'Inversion about the mean sends every bar to the same distance on the other side of the mean line; the thin arrows show each move. The seven unmarked bars go from $0.3536$ down to $0.1768$, and the marked bar goes from $-0.3536$ up to $0.8839$. The mean line has not moved: it is still $0.2652$.',
      },
      {
        from: 72,
        to: 119,
        text: 'Do it again. The mark flips the tall bar down to $-0.8839$ and the mean line falls to $0.0442$. The inversion lifts the marked bar to $0.9723$ and sinks each of the others to $-0.0884$. The column at the right is the chance of the marked string, the square of its bar: $0.9453$.',
      },
    ],
    fidelity: {
      exact: [
        'Every picture at rest is a state the algorithm reaches: the even mix, a state after a mark, a state after an inversion.',
        'Each thin arrow runs from a bar’s old height to its new one, and the dashed mean line crosses each arrow at its middle.',
      ],
      distorted: [
        'Between two pictures the bars glide in a straight line; the circuit passes through other states on the way.',
        'The mark and the inversion are drawn as two moves; in the circuit the inversion is three more columns.',
      ],
    },
  },
  'qc-q19-walker': {
    name: 'qc-q19-walker',
    dir: 'films/qc709/qc-q19-walker',
    ground: STAGE_THEME.qc709.bg['walk-graph'],
    title: OPENER_TITLES['qc-q19-walker'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Eight upright bars on a line under a dotted line: the leftmost in blue, the other seven in grey. At first all eight are equally short. The blue bar then climbs to nearly the dotted line while the grey ones shrink to slivers, and finally the blue bar drops back and the grey ones rise a little.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'A walker starts spread evenly over the eight spokes of a star, so each bar is a chance of $0.125$. Spoke 1, in blue, is marked. After two steps the marked spoke holds $0.78125$ and each of the other seven spokes $0.03125$.',
      },
      {
        from: 40,
        to: 79,
        text: 'After four steps the marked spoke holds $0.9453$ and each of the others $0.0078$. That is the chance two Grover steps give on eight strings (Unit 17.4): the walk on the star searches the way Grover’s algorithm does.',
      },
      {
        from: 80,
        to: 119,
        text: 'Keep walking and it overshoots, as Grover’s search does. After six steps the marked spoke is down to $0.3301$ and each of the others is back up to $0.0957$. Unit 19.3 works out how many steps are best as the star grows.',
      },
    ],
    fidelity: {
      exact: [
        'Each bar is the chance of finding the walker on one spoke, from a simulation of the walk on the star after the steps shown.',
        'The seven grey bars are always equal, and the eight bars add up to 1.',
      ],
      distorted: [
        'Between two pictures the bars glide in a straight line; the walk itself moves in whole steps.',
        'Only every second step is shown: a step from an even one moves the walker between the centre and the rim without changing the chance on any spoke.',
      ],
    },
  },
  'qc-q20-cloner': {
    name: 'qc-q20-cloner',
    dir: 'films/qc709/qc-q20-cloner',
    ground: STAGE_THEME.qc709.bg.plot,
    title: OPENER_TITLES['qc-q20-cloner'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Two curves above a flat line and under a dotted line, one white and one blue. The white curve starts at the dotted line and slopes down; the blue curve starts halfway up and slopes up. They cross about a third of the way along, and the blue curve ends at the dotted line while the white one ends at half the height.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'The program angle $u$ sets how the cloner splits the information between its two copies. At $u = 0°$ the first copy is perfect, fidelity $1$, and the second is a coin toss, $0.5$. By $u = 15°$ the first has slipped to $0.9553$ and the second has risen to $0.6667$.',
      },
      {
        from: 40,
        to: 79,
        text: 'At $u = 30°$ the two curves cross: each copy has fidelity $0.8333$, which is $5/6$. This is the symmetric cloner of Unit 20.1, with both copies equally good. The same numbers come out for every input state.',
      },
      {
        from: 80,
        to: 119,
        text: 'Turn on to $u = 60°$ and the roles swap: the first copy falls to $0.5$ and the second is perfect, $1$. A better first copy always costs a worse second one. All along the turn the worse of the two copies is never better than $0.8333$.',
      },
    ],
    fidelity: {
      exact: [
        'Each curve is the fidelity of one output wire with the input state, from a simulation of the cloning circuit at every whole degree of $u$.',
        'The dot at the end of each curve is that wire’s fidelity at the angle shown.',
      ],
      distorted: [
        'Between two whole degrees the curve is a straight line; only the sampled angles come from the circuit.',
        'The picture shows fidelities only; it does not show how the information is split between the copies and the third wire.',
      ],
    },
  },
  'qc-q23-holevo-gap': {
    name: 'qc-q23-holevo-gap',
    dir: 'films/qc709/qc-q23-holevo-gap',
    ground: STAGE_THEME.qc709.bg.plot,
    title: OPENER_TITLES['qc-q23-holevo-gap'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Two curves above a flat line and under a dotted line, one white and one blue, both starting at the dotted line on the left. As they run right, both slope down to the flat line at the far end, the blue curve always below the white one, the two furthest apart a little past the middle.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'Two equally likely states, and the overlap $s$ between them. The white curve is the Holevo quantity $\\chi$, the most that any reading could tell about which state was sent. The blue curve is the best projective reading, found by trying measurement directions. At $s = 0$ the states are orthogonal and both are $1$ bit. At $s = 0.5$ the bound is $0.8113$ but the best reading gets only $0.6454$.',
      },
      {
        from: 40,
        to: 79,
        text: 'At $s = 0.8$ both have fallen: the bound to $0.469$ and the best reading to $0.2781$. At every overlap between the two ends the blue curve lies below the white one, so the reading falls short of the bound.',
      },
      {
        from: 80,
        to: 119,
        text: 'At $s = 1$ the two states are the same state and nothing can tell them apart, so both curves are $0$. The gap between them is widest near $s = 0.7$, where it is $0.2017$ bit.',
      },
    ],
    fidelity: {
      exact: [
        'Each white point is the Holevo quantity of the two states at that overlap, and each blue point is the largest information a projective reading gets, from a scan of measurement directions.',
        'The two states and their equal chances are the same all along the sweep; only the overlap changes.',
      ],
      distorted: [
        'Between two sampled overlaps the curves are straight lines; only the samples come from the engine.',
        'The blue curve is the best of the readings that were tried, projective ones; it does not search every measurement there is.',
      ],
    },
  },
  'qc-q26-hom': {
    name: 'qc-q26-hom',
    dir: 'films/qc709/qc-q26-hom',
    ground: STAGE_THEME.qc709.bg.plot,
    title: OPENER_TITLES['qc-q26-hom'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Two curves above a flat line and under a dotted line: a white one that starts at the dotted line, falls to the flat line in the middle and climbs back, and a dashed grey one that dips only to half the height in the middle. Both start and end at the dotted line.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'One photon enters each side of a beam splitter of reflectivity $R$. The curves show the chance that they leave one by each exit. At $R = 0$ the splitter lets everything through and both curves are $1$. At $R = 0.25$ photons that can be told apart give $0.625$ (the dashed curve), but photons that cannot be told apart give only $0.25$ (the white one).',
      },
      {
        from: 40,
        to: 79,
        text: 'At the balanced splitter, $R = 0.5$, photons that can be told apart still leave one by each exit half the time, $0.5$. Photons that cannot be told apart never do: the chance is $0$, and both always leave by the same exit. This is the Hong-Ou-Mandel dip (Unit 26.3).',
      },
      {
        from: 80,
        to: 119,
        text: 'Past the balanced splitter the white curve climbs again. At $R = 1$ the splitter is a mirror, the photons swap sides, and both curves are $1$ again. The white curve touches $0$ only at $R = 0.5$.',
      },
    ],
    fidelity: {
      exact: [
        'Each white point is the chance of one photon at each exit for two photons that cannot be told apart, from the two-photon amplitude of the beam splitter, and each dashed point is the same chance for two that can.',
        'The photons enter one per side, and only the reflectivity changes along the curves.',
      ],
      distorted: [
        'Between two sampled reflectivities the curves are straight lines; only the samples come from the engine.',
        'In the laboratory the dip is usually measured against the delay between the photons at a balanced splitter; here the splitter changes and the photons stay perfectly overlapped.',
      ],
    },
  },
  'qc-q25-blockade': {
    name: 'qc-q25-blockade',
    dir: 'films/qc709/qc-q25-blockade',
    ground: STAGE_THEME.qc709.bg.plot,
    title: OPENER_TITLES['qc-q25-blockade'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'A single white curve on a dark ground, starting near the top left and sloping down with small ripples to the bottom right, with four dotted horizontal lines behind it and a solid line below. A dot rides the end of the curve.',
    beats: [
      {
        from: 0,
        to: 29,
        text: 'Two Rydberg atoms and three pulses make a controlled-phase gate, as long as the blockade keeps both atoms from being excited at once. The blockade shift $B$ is measured in units of the drive $\\Omega$. The curve is the gate error on logarithmic axes: each dotted line is ten times lower than the one above. At $B = 1$ the error is $0.2666$.',
      },
      {
        from: 30,
        to: 69,
        text: 'At $B = 10$ the error is $0.0037$. A stronger blockade makes the gate error smaller, with small ripples on the way down.',
      },
      {
        from: 70,
        to: 119,
        text: 'At $B = 100$ the error is $0.000037$, about a hundred times smaller than at $B = 10$. Averaged over this last decade the slope on these axes is $-2$: ten times the blockade, a hundred times less error.',
      },
    ],
    fidelity: {
      exact: [
        'Each point is the error of the three-pulse gate against the ideal gate, from a simulation of the two atoms and the pulses at that blockade shift, with no decay.',
        'The dotted lines are factors of ten in the error, and the horizontal axis is logarithmic too, from $B = \\Omega$ to $B = 100\\,\\Omega$.',
      ],
      distorted: [
        'Between two sampled shifts the curve is a straight line on the logarithmic axes; only the samples come from the engine.',
        'Atom decay is left out, so the error keeps falling as the blockade grows; with decay the error would stop falling.',
      ],
    },
  },
  'qc-q24-rabi-ball': {
    name: 'qc-q24-rabi-ball',
    dir: 'films/qc709/qc-q24-rabi-ball',
    ground: STAGE_THEME.qc709.bg['bloch-ball'],
    title: OPENER_TITLES['qc-q24-rabi-ball'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'A circle with a dotted horizontal line and a dotted vertical line through its centre. A white path starts at the top of the circle and winds twice round, each loop a little smaller than the one before, ending with a dot inside the inner loop.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'The qubit starts at the top of the Bloch ball, $z = 1$, in the ground state. The picture is the ball seen from the side, with the drive turning the arrow about the axis that points out of the page: $\\Omega = 2\\pi$, so a half turn takes $0.5$, and the qubit decays with $T_1 = 4$ in the same time unit. After the half turn the arrow is near the bottom: its vertical part is $-0.909$ and not $-1$, because some of it decayed on the way.',
      },
      {
        from: 40,
        to: 79,
        text: 'After a full turn, at time $1$, the arrow is back near the top, but its vertical part is $0.8292$ and not $1$. Each turn ends a little short of the last one, and the arrow itself has shrunk: it is shorter than the radius of the ball.',
      },
      {
        from: 80,
        to: 119,
        text: 'Two turns on, at time $2$, its vertical part is $0.6875$, and the arrow’s length has fallen from $0.8292$ at time $1$ to $0.6876$. The tip spirals inward: the drive keeps turning the arrow and decay keeps shrinking it.',
      },
    ],
    fidelity: {
      exact: [
        'Each point is the qubit’s Bloch vector at one time, from the decaying-qubit equation solved exactly for that time, with the drive on resonance.',
        'The circle is the surface of the Bloch ball: a state that stayed pure would stay on it, and the path moves inside it once the qubit decays.',
      ],
      distorted: [
        'Only two of the three Bloch components are drawn: the drive turns the arrow about the axis out of the page, so the third part stays $0$ throughout.',
        'Between two sampled times the path is a straight line.',
      ],
    },
  },
  'qc-q27-transmon': {
    name: 'qc-q27-transmon',
    dir: 'films/qc709/qc-q27-transmon',
    ground: STAGE_THEME.qc709.bg.plot,
    title: OPENER_TITLES['qc-q27-transmon'],
    frames: 120,
    poster: 'poster.webp',
    alt: 'Five short horizontal bars stacked in a column near the top, white over grey, at first evenly spaced; then the upper white bars sink a little below their grey twins. Below them two curves over a flat line: a blue one that swings from high on the left down to the line in the middle and back up, and a white one that stays flat on the line.',
    beats: [
      {
        from: 0,
        to: 29,
        text: 'The energy levels of a circuit with only an inductor and a capacitor are evenly spaced: in units of the first gap the rungs sit at $0$, $1$, $2$, $3$, $4$. Every step is the same size, so nothing singles out the first two levels as a qubit.',
      },
      {
        from: 30,
        to: 69,
        text: 'The Josephson junction bends the ladder. For $E_J/E_C = 20$ the rungs move to $1$, $1.9543$, $2.8588$ and $3.7082$: each step is a little smaller than the one below, and the second is smaller than the first by $0.0457$ of the first. The grey rungs show where an evenly spaced ladder would put them.',
      },
      {
        from: 70,
        to: 119,
        text: 'The levels also move with the offset charge $n_g$. The curves show the first gap over one period of $n_g$, in units of its value at $n_g = 1/2$. At $E_J/E_C = 1$ it swings up to $1.3757$ times that value; at $E_J/E_C = 20$ it stays within $0.0001$ of $1$, so the qubit frequency hardly depends on the charge.',
      },
    ],
    fidelity: {
      exact: [
        'Each rung is an energy level in units of the first gap, from the matrix of the circuit: the inductor-capacitor circuit at the start, the junction circuit after the bend.',
        'Each curve is the first gap at one value of the offset charge, from the matrix of the junction circuit, in units of its value at $n_g = 1/2$.',
      ],
      distorted: [
        'Only the lowest five levels are drawn, and between two pictures the rungs glide in a straight line.',
        'The two panels use different vertical scales: the rungs are in units of the first gap, the curves in units of the gap at $n_g = 1/2$.',
      ],
    },
  },
}

/** Public URL of one frame (Vite `base` is relative, so the built site works from any static path). */
export const frameUrl = (spec: Pick<OpenerSpec, 'dir'>, file: string): string => `${import.meta.env.BASE_URL}${spec.dir}/${file}`
export const frameFile = (f: number): string => `${String(f).padStart(4, '0')}.webp`
