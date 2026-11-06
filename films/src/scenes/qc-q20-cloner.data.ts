/**
 * What the film `qc-q20-cloner` draws, computed by the app's engine (P-Q20-story §9: "Cloning splits the information"): the two copies'
 * fidelities with the input as the cloner's program angle u turns from 0° to 60°. The first copy's fidelity starts at 1 and falls; the
 * second starts at one half and rises; the stages stop at the program angles the captions (openers/openerCopy.ts) quote. The scene only
 * lays out what `clonerFidelities` (physics/qc/machines.ts) returns for each whole degree; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { clonerFidelities } from '../../../app/src/physics/qc/machines.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q20-cloner'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The sweep: the program angle u in whole degrees, 0…60 (the chapter's range) (the input is the plan's running example, θ = 60°, φ = 90°, clonerFidelities' default). */
export const U_MAX = 60
const fid = Array.from({ length: U_MAX + 1 }, (_, u) => clonerFidelities(u))
const first: Pt[] = fid.map((f, u) => [u, f.f1])
const second: Pt[] = fid.map((f, u) => [u, f.f2])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg.plot,
  first: INK.state,
  second: phaseColor(0),
  axis: INK.silver,
  guide: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, u: number): FilmStage => ({ id, label, kind, from, tween, to, upTo: { first: u, second: u }, heights: {} })
/** Beat 1 (0–39): the start and the turn to 15°. Beat 2 (40–79): on to 30°. Beat 3 (80–119): on to 60°. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('start', 'the program at rest', 'start', 0, 0, 5, 0),
  st('to-15', 'turning the program', 'turn', 6, 28, 39, 15),
  st('to-30', 'turning on', 'turn', 40, 32, 79, 30),
  st('to-60', 'to the end of the turn', 'turn', 80, 32, 119, 60),
]

export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  // u in degrees along x (0° at the left), fidelity up y (0 on the baseline)
  views: { main: { ox: -400, oy: 300, sx: 13.3333333333, sy: 600 } },
  guides: [
    { id: 'base', view: 'main', pts: [[0, 0], [U_MAX, 0]], color: 'axis' },
    { id: 'top', view: 'main', pts: [[0, 1], [U_MAX, 1]], color: 'guide', dash: true },
  ],
  series: [
    { kind: 'line', id: 'first', view: 'main', color: 'first', width: 9, pts: first, tip: 17 },
    { kind: 'line', id: 'second', view: 'main', color: 'second', width: 9, pts: second, tip: 17 },
  ],
  stages: STAGES,
  keys: [
    { name: 'q20F1u0', stage: 'start', line: 'first' },
    { name: 'q20F2u0', stage: 'start', line: 'second' },
    { name: 'q20F1u15', stage: 'to-15', line: 'first' },
    { name: 'q20F2u15', stage: 'to-15', line: 'second' },
    { name: 'q20F56', stage: 'to-30', line: 'first' },
    { name: 'q20F1u60', stage: 'to-60', line: 'first' },
    { name: 'q20F2u60', stage: 'to-60', line: 'second' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
