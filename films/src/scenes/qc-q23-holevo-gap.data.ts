/**
 * What the film `qc-q23-holevo-gap` draws, computed by the app's engine (P-Q23-story §9: "The Holevo gap for two states"): for two equally
 * likely pure states with overlap s, the Holevo quantity χ (the most any reading could tell) against the best projective reading
 * (`accessibleInfoPair`, a scan of 721 measurement directions), as s sweeps from 0 (orthogonal) to 1 (the same state). The scene only lays
 * out what `holevoChiPair` and `accessibleInfoPair` (physics/qc/infoq.ts) return at s = i/50; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { accessibleInfoPair, holevoChiPair } from '../../../app/src/physics/qc/infoq.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q23-holevo-gap'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The sweep: the overlap s = i/50, i = 0…50. */
export const N_STEPS = 50
const ss = Array.from({ length: N_STEPS + 1 }, (_, i) => i / N_STEPS)
const chi: Pt[] = ss.map((s) => [s, holevoChiPair(s)])
const best: Pt[] = ss.map((s) => [s, accessibleInfoPair(s)])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg.plot,
  chi: INK.state,
  best: phaseColor(0),
  axis: INK.silver,
  guide: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, i: number): FilmStage => ({ id, label, kind, from, tween, to, upTo: { chi: i, best: i }, heights: {} })
/** Beat 1 (0–39): orthogonal states, then s = 0.5. Beat 2 (40–79): s = 0.8. Beat 3 (80–119): s = 1. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('start', 'two orthogonal states', 'start', 0, 0, 5, 0),
  st('to-half', 'the states move closer', 'sweep', 6, 28, 39, 25),
  st('to-08', 'closer still', 'sweep', 40, 32, 79, 40),
  st('to-one', 'the states coincide', 'sweep', 80, 32, 119, 50),
]

export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  // overlap s along x (0 at the left), bits up y (0 on the baseline)
  views: { main: { ox: -400, oy: 300, sx: 800, sy: 600 } },
  guides: [
    { id: 'base', view: 'main', pts: [[0, 0], [1, 0]], color: 'axis' },
    { id: 'top', view: 'main', pts: [[0, 1], [1, 1]], color: 'guide', dash: true },
  ],
  series: [
    { kind: 'line', id: 'chi', view: 'main', color: 'chi', width: 9, pts: chi, tip: 17 },
    { kind: 'line', id: 'best', view: 'main', color: 'best', width: 9, pts: best, tip: 17 },
  ],
  stages: STAGES,
  keys: [
    { name: 'q23ChiS0', stage: 'start', line: 'chi' },
    { name: 'q23ChiS05', stage: 'to-half', line: 'chi' },
    { name: 'q23BestS05', stage: 'to-half', line: 'best' },
    { name: 'q23ChiS08', stage: 'to-08', line: 'chi' },
    { name: 'q23BestS08', stage: 'to-08', line: 'best' },
    { name: 'q23ChiS1', stage: 'to-one', line: 'chi' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
