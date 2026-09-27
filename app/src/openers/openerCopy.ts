/**
 * The words beside the two Blender chapter openers (decision P3 #9). Each caption covers a frame range of the
 * film; the facts they state are checked against the engine in openerCopy.test.ts. The film itself states
 * no number: the DOM carries the claims, the frames illustrate them (CLAUDE.md: generated media never
 * states a physical result on its own).
 */

export type OpenerName = 'hopf' | 'belt'

export interface OpenerBeat {
  /** first and last frame this caption covers (inclusive) */
  from: number
  to: number
  text: string
}

export interface OpenerSpec {
  name: OpenerName
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
    title: 'Why spin ½ needs 720°',
    frames: 120,
    poster: 'poster.webp',
    alt: 'A steel block hangs from a bracket on a belt. The block turns twice and the belt twists; then the belt loops round and hangs flat again.',
    beats: [
      {
        from: 0,
        to: 39,
        text: 'Turn the block once about the vertical, 360°. The belt now carries one twist. A spin-½ state turned by 360° comes back as its negative: $R_z(2\\pi)|{+z}\\rangle = -|{+z}\\rangle$.',
      },
      {
        from: 40,
        to: 79,
        text: 'Turn it once more, 720° in all: two twists. The spin state is back where it started, $R_z(4\\pi)|{+z}\\rangle = +|{+z}\\rangle$.',
      },
      {
        from: 80,
        to: 119,
        text: 'Now hold the block still and loop the belt around. Both twists come out and the belt hangs flat. One twist can never be removed this way. The belt keeps track of the same thing as the sign of a spin-½ state: after one turn something is left over, after two turns nothing is.',
      },
    ],
    fidelity: {
      exact: ['How each piece of belt is turned, frame by frame (the rotations are computed, not drawn by hand).', 'One twist after 360°, two after 720°, none at the end.'],
      distorted: ['The path the belt takes through space is one choice of many.', 'A real belt needs slack to make the loop; this one is allowed to change length.'],
    },
  },
}

/** Public URL of one frame (Vite `base` is relative, so the built site works from any static path). */
export const frameUrl = (name: OpenerName, file: string): string => `${import.meta.env.BASE_URL}openers/${name}/${file}`
export const frameFile = (f: number): string => `${String(f).padStart(4, '0')}.webp`
