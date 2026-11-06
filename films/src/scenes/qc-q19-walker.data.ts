/**
 * What the film `qc-q19-walker` draws, computed by the app's engine (P-Q19-story §9: "A walker finds the marked spoke"): the chance on each
 * of the eight spokes of a star graph whose spoke 1 is marked, after 0, 2, 4 and 6 steps of the walk. The scene only lays out what
 * `starSpokeChances` (physics/qc/walk.ts) returns; it types no physics number of its own. Odd steps are left out because a step from an
 * even one only moves the walker between the centre and the rim (the spoke chances do not change), which the captions do not need.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { starSpokeChances } from '../../../app/src/physics/qc/walk.ts'
import type { FilmSpec, FilmStage } from '../kit'

export const FILM_ID = 'qc-q19-walker'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The plan's inputs: the check pins them. N = 8 spokes, spoke 1 marked. */
export const N_SPOKES = 8
export const STEPS = [0, 2, 4, 6] as const
const chances = (n: number): number[] => starSpokeChances(N_SPOKES, { marked: 1 }, n).spokes

export const COLORS = {
  ground: STAGE_THEME.qc709.bg['walk-graph'],
  marked: phaseColor(0),
  others: INK.silver,
  axis: INK.silver,
  guide: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, n: number): FilmStage => ({
  id,
  label,
  kind,
  from,
  tween,
  to,
  upTo: {},
  heights: { marked: [chances(n)[0]], others: chances(n).slice(1) },
})
/** Beat 1 (0–39): the even start, then two steps. Beat 2 (40–79): four steps. Beat 3 (80–119): six steps. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('start', 'the walker at the start', 'start', 0, 0, 5, STEPS[0]),
  st('steps-2', 'a few steps', 'walk', 6, 28, 39, STEPS[1]),
  st('steps-4', 'more steps', 'walk', 40, 32, 79, STEPS[2]),
  st('steps-6', 'still more steps', 'walk', 80, 32, 119, STEPS[3]),
]

// spoke j sits at u = j − 1, spoke 1 (the marked one) on the left
export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  views: { main: { ox: -322, oy: 300, sx: 92, sy: 600 } },
  guides: [
    { id: 'base', view: 'main', pts: [[-0.7, 0], [N_SPOKES - 0.3, 0]], color: 'axis' },
    { id: 'top', view: 'main', pts: [[-0.7, 1], [N_SPOKES - 0.3, 1]], color: 'guide', dash: true },
  ],
  series: [
    { kind: 'bars', id: 'others', view: 'main', color: 'others', width: 64, xs: Array.from({ length: N_SPOKES - 1 }, (_, i) => i + 1) },
    { kind: 'bars', id: 'marked', view: 'main', color: 'marked', width: 64, xs: [0] },
  ],
  stages: STAGES,
  keys: [
    { name: 'q19StarP0', stage: 'start', bars: 'marked' },
    { name: 'q19StarP2', stage: 'steps-2', bars: 'marked' },
    { name: 'q19StarP2Other', stage: 'steps-2', bars: 'others' },
    { name: 'q19StarP4', stage: 'steps-4', bars: 'marked' },
    { name: 'q19StarP4Other', stage: 'steps-4', bars: 'others' },
    { name: 'q19StarP6', stage: 'steps-6', bars: 'marked' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
