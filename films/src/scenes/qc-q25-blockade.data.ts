/**
 * What the film `qc-q25-blockade` draws, computed by the app's engine (P-Q25-story §9: "Blockade: the second atom stays down"): the error of
 * the three-pulse Rydberg gate (pi on atom 1, 2 pi on atom 2, pi on atom 1, `rydbergGate` in physics/qc/atoms.ts) against the ideal gate
 * diag(1, -1, -1, -1), as the blockade shift B between the two Rydberg states grows from 1 to 100 times the drive Ω (no decay). Both axes
 * are logarithmic: the scene draws u = log10(B/Ω) at B = 10^(k/20) and v = log10(error), so each dotted line is a factor of ten. The scene
 * only lays out what `rydbergError` returns; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { rydbergError } from '../../../app/src/physics/qc/atoms.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q25-blockade'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The sweep: u = k/20 = log10(B/Ω), k = 0…40, so B runs from 1 to 100 (Ω = 1, no decay). */
export const N_STEPS = 40
const us = Array.from({ length: N_STEPS + 1 }, (_, k) => k / 20)
const error: Pt[] = us.map((u) => [u, Math.log10(rydbergError(1, 10 ** u, 0))])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg.plot,
  error: INK.state,
  axis: INK.silver,
  guide: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, k: number): FilmStage => ({ id, label, kind, from, tween, to, upTo: { error: k }, heights: {} })
/** Beat 1 (0–29): B = 1. Beat 2 (30–69): B = 10. Beat 3 (70–119): B = 100. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('b-1', 'a weak blockade', 'start', 0, 0, 29, 0),
  st('b-10', 'a stronger blockade', 'sweep', 30, 36, 69, 20),
  st('b-100', 'a much stronger blockade', 'sweep', 70, 44, 119, 40),
]

// u = log10(B) along x (B = 1 at the left, B = 100 at the right), log10(error) up y; the decades of error are dotted lines, the floor is the axis
export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  views: { main: { ox: -400, oy: -375, sx: 400, sy: 150 } },
  guides: [
    ...[-1, -2, -3, -4].map((v) => ({ id: `decade${-v}`, view: 'main', pts: [[0, v], [2, v]] as Pt[], color: 'guide', dash: true })),
    { id: 'floor', view: 'main', pts: [[0, -4.5], [2, -4.5]], color: 'axis' },
  ],
  series: [{ kind: 'line', id: 'error', view: 'main', color: 'error', width: 9, pts: error, tip: 17 }],
  stages: STAGES,
  keys: [
    { name: 'q25LogErrB1', stage: 'b-1', line: 'error' },
    { name: 'q25LogErrB10', stage: 'b-10', line: 'error' },
    { name: 'q25LogErrB100', stage: 'b-100', line: 'error' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
