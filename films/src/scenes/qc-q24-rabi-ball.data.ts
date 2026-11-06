/**
 * What the film `qc-q24-rabi-ball` draws, computed by the app's engine (P-Q24-story §9: "Rabi flopping, and the decay, inside the ball"):
 * the Bloch vector of a qubit that starts in the ground state, is driven on resonance with Ω = 2π (a half turn takes `piPulseTime` = 0.5)
 * and decays at rate 1/T1 with T1 = 4 (the Lindblad equation solved exactly, `lindbladSolve` with `qubitJump` in physics/qc/blocheq.ts), at
 * t = k/80 for k = 0…160. The drive turns the vector about the x axis, so it stays in the plane of the page: the scene draws its y and z
 * parts inside the unit circle (the ball's edge). It only lays out what the engine returns; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { c } from '../../../app/src/physics/complex.ts'
import { blochOf, lindbladSolve, qubitJump } from '../../../app/src/physics/qc/blocheq.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q24-rabi-ball'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The plan's inputs: the check pins them. Ω = 2π, T1 = 4, H = (Ω/2) X in the rotating frame, the start |0⟩ (the north pole). */
export const OMEGA = 2 * Math.PI
export const T1 = 4
export const N_STEPS = 160
const H = [[c(0), c(OMEGA / 2)], [c(OMEGA / 2), c(0)]]
const RHO0 = [[c(1), c(0)], [c(0), c(0)]]
const bloch = (t: number) => blochOf(lindbladSolve(RHO0, H, [qubitJump(1 / T1)], t))
const path: Pt[] = Array.from({ length: N_STEPS + 1 }, (_, k) => {
  const r = bloch(k / 80)
  return [r[1], r[2]]
})
/** the unit circle: 181 points, 2° apart */
const ball: Pt[] = Array.from({ length: 181 }, (_, i) => [Math.cos((i * 2 * Math.PI) / 180), Math.sin((i * 2 * Math.PI) / 180)])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg['bloch-ball'],
  path: INK.state,
  ball: INK.silver2,
  axis: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, k: number): FilmStage => ({ id, label, kind, from, tween, to, upTo: { path: k }, heights: {} })
/** Beat 1 (0–39): the start and the first half turn (t = 0.5). Beat 2 (40–79): a full turn (t = 1). Beat 3 (80–119): on to t = 2. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('rest', 'the qubit at rest', 'start', 0, 0, 5, 0),
  st('half-turn', 'a half turn of the drive', 'turn', 6, 28, 39, 40),
  st('full-turn', 'a full turn', 'turn', 40, 32, 79, 80),
  st('turns-on', 'the turns go on', 'turn', 80, 32, 119, 160),
]

// y along x, z up y (the ball's side view, radius 450 px), the unit circle and the two axes through its centre
export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  views: { ball: { ox: 0, oy: 40, sx: 450, sy: 450 } },
  guides: [
    { id: 'edge', view: 'ball', pts: ball, color: 'ball' },
    { id: 'yaxis', view: 'ball', pts: [[-1, 0], [1, 0]], color: 'axis', dash: true },
    { id: 'zaxis', view: 'ball', pts: [[0, -1], [0, 1]], color: 'axis', dash: true },
  ],
  series: [{ kind: 'line', id: 'path', view: 'ball', color: 'path', width: 7, pts: path, tip: 16 }],
  stages: STAGES,
  keys: [
    { name: 'q24RabiZ0', stage: 'rest', line: 'path', comp: 1 },
    { name: 'q24RabiYHalf', stage: 'half-turn', line: 'path', comp: 0 },
    { name: 'q24RabiZHalf', stage: 'half-turn', line: 'path', comp: 1 },
    { name: 'q24RabiZFull', stage: 'full-turn', line: 'path', comp: 1 },
    { name: 'q24RabiYEnd', stage: 'turns-on', line: 'path', comp: 0 },
    { name: 'q24RabiZEnd', stage: 'turns-on', line: 'path', comp: 1 },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
