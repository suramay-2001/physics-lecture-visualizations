/**
 * The words beside the chapter openers (decision P3 #9): the Blender films (Hopf, belt trick, Grover) and, below them, the
 * Motion Canvas films of Physics 709. Each caption covers a frame range of the
 * film; the facts they state are checked against the engine in openerCopy.test.ts. The film itself states
 * no number: the DOM carries the claims, the frames illustrate them (CLAUDE.md: generated media never
 * states a physical result on its own).
 */
import { STAGE_THEME } from '../stage/tokens'

export type OpenerName = 'hopf' | 'belt' | 'grover'

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
    title: 'Every point of the Bloch sphere is a circle',
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
    title: 'Why spin ½ needs 720°',
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
    title: 'Grover’s search turns a state, step by step',
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
}

/** Public URL of one frame (Vite `base` is relative, so the built site works from any static path). */
export const frameUrl = (spec: Pick<OpenerSpec, 'dir'>, file: string): string => `${import.meta.env.BASE_URL}${spec.dir}/${file}`
export const frameFile = (f: number): string => `${String(f).padStart(4, '0')}.webp`
