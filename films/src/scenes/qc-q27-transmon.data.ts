/**
 * What the film `qc-q27-transmon` draws, computed by the app's engine (P-Q27-story §9: "From evenly spaced rungs to a usable qubit"):
 *   - the top panel's rungs: the first five energy levels in units of the first gap, for an inductor-capacitor circuit (`oscillatorLevels`
 *     in physics/qc/solid.ts: evenly spaced) and for the transmon at E_J/E_C = 20 (`transmonLadder`, the junction bends the ladder); the
 *     grey rungs stay at the evenly spaced heights, the white ones glide from there to the transmon's;
 *   - the bottom panel's curves: the first gap against the offset charge n_g over one period, in units of its value at n_g = 1/2
 *     (`f01Band`), at E_J/E_C = 1 and at E_J/E_C = 20, at n_g = k/40.
 * The scene only lays out what the engine returns; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { f01Band, oscillatorLevels, transmonLadder } from '../../../app/src/physics/qc/solid.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q27-transmon'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The plan's inputs: the check pins them. Five rungs; E_J/E_C = 20 for the ladder and 1 and 20 for the curves; n_g = k/40, k = 0…40. */
export const RUNGS = 5
export const R_LADDER = 20
export const R_CURVES = [1, 20] as const
export const N_STEPS = 40
const levels = oscillatorLevels(1, 1).slice(0, RUNGS)
const even = levels.map((e) => (e - levels[0]) / (levels[1] - levels[0]))
const transmon = transmonLadder(R_LADDER)
const ngs = Array.from({ length: N_STEPS + 1 }, (_, k) => k / N_STEPS)
const band = (r: number): Pt[] => ngs.map((ng) => [ng, f01Band(r, ng)])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg.plot,
  even: INK.silver3,
  ladder: INK.state,
  band1: phaseColor(0),
  band20: INK.state,
  axis: INK.silver,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, ladder: number[], k: number): FilmStage => ({
  id,
  label,
  kind,
  from,
  tween,
  to,
  upTo: { band1: k, band20: k },
  heights: { even, ladder },
})
/** Beat 1 (0–29): the evenly spaced ladder. Beat 2 (30–69): the junction bends it. Beat 3 (70–119): the first gap against the offset charge. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('even', 'evenly spaced rungs', 'start', 0, 0, 29, even, 0),
  st('bend', 'the junction bends the ladder', 'bend', 30, 28, 69, transmon, 0),
  st('noise', 'charge noise', 'sweep', 70, 40, 119, transmon, N_STEPS),
]

// the rungs: energy up y (0 at the bottom rung), all on one column; the curves: n_g along x (0 at the left), the first gap in units of its value at n_g = 1/2 up y (1 on the flat line)
export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  views: { ladder: { ox: 0, oy: -60, sx: 1, sy: 105 }, band: { ox: -400, oy: 1320, sx: 800, sy: 800 } },
  guides: [{ id: 'flat', view: 'band', pts: [[0, 1], [1, 1]], color: 'axis' }],
  series: [
    { kind: 'ticks', id: 'even', view: 'ladder', color: 'even', width: 8, length: 440, xs: Array.from({ length: RUNGS }, () => 0) },
    { kind: 'ticks', id: 'ladder', view: 'ladder', color: 'ladder', width: 12, length: 360, xs: Array.from({ length: RUNGS }, () => 0) },
    { kind: 'line', id: 'band1', view: 'band', color: 'band1', width: 8, pts: band(R_CURVES[0]), tip: 15 },
    { kind: 'line', id: 'band20', view: 'band', color: 'band20', width: 8, pts: band(R_CURVES[1]), tip: 15 },
  ],
  stages: STAGES,
  keys: [
    { name: 'q27Rung2', stage: 'bend', bars: 'ladder', index: 2 },
    { name: 'q27Rung3', stage: 'bend', bars: 'ladder', index: 3 },
    { name: 'q27Rung4', stage: 'bend', bars: 'ladder', index: 4 },
    { name: 'q27Spread1', stage: 'noise', line: 'band1' },
    { name: 'q27Spread20', stage: 'noise', line: 'band20' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
