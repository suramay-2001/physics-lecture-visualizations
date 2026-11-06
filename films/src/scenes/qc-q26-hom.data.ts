/**
 * What the film `qc-q26-hom` draws, computed by the app's engine (P-Q26-story §9: "Two photons, one exit"): the chance that two photons,
 * one entering each side of a beam splitter, leave one by each exit, as the splitter's reflectivity R sweeps from 0 to 1: for photons that
 * cannot be told apart (`homDip`, the two-photon amplitude of the middle outcome) and, dashed, for photons that can (`distinguishable`).
 * The scene only lays out what `homDip` and `distinguishable` (physics/qc/photons.ts) return at R = i/100; it types no physics number of its own.
 *
 * Pure TS: no Motion Canvas import.
 */
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { bsReal, distinguishable, homDip } from '../../../app/src/physics/qc/photons.ts'
import type { FilmSpec, FilmStage, Pt } from '../kit'

export const FILM_ID = 'qc-q26-hom'
/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The sweep: the reflectivity R = i/100, i = 0…100. */
export const N_STEPS = 100
const rs = Array.from({ length: N_STEPS + 1 }, (_, i) => i / N_STEPS)
const same: Pt[] = rs.map((r) => [r, homDip(r)])
const apart: Pt[] = rs.map((r) => [r, distinguishable(bsReal(r))])

export const COLORS = {
  ground: STAGE_THEME.qc709.bg.plot,
  same: INK.state,
  apart: INK.silver,
  axis: INK.silver,
  guide: INK.silver3,
  label: INK.text,
} as const

const st = (id: string, label: string, kind: string, from: number, tween: number, to: number, i: number): FilmStage => ({ id, label, kind, from, tween, to, upTo: { same: i, apart: i }, heights: {} })
/** Beat 1 (0–39): the mirror-free splitter, then R = 0.25. Beat 2 (40–79): R = 0.5. Beat 3 (80–119): R = 1. Each beat of the captions starts on one stage. */
export const STAGES: FilmStage[] = [
  st('start', 'a splitter that lets all through', 'start', 0, 0, 5, 0),
  st('to-quarter', 'the splitter reflects more', 'sweep', 6, 28, 39, 25),
  st('to-half', 'the balanced splitter', 'sweep', 40, 32, 79, 50),
  st('to-mirror', 'on to a mirror', 'sweep', 80, 32, 119, 100),
]

export const SPEC: FilmSpec = {
  id: FILM_ID,
  format: FORMAT,
  colors: COLORS,
  // reflectivity R along x (0 at the left), chance up y (0 on the baseline)
  views: { main: { ox: -400, oy: 300, sx: 800, sy: 600 } },
  guides: [
    { id: 'base', view: 'main', pts: [[0, 0], [1, 0]], color: 'axis' },
    { id: 'top', view: 'main', pts: [[0, 1], [1, 1]], color: 'guide', dash: true },
  ],
  series: [
    { kind: 'line', id: 'apart', view: 'main', color: 'apart', width: 7, dash: true, pts: apart, tip: 14 },
    { kind: 'line', id: 'same', view: 'main', color: 'same', width: 9, pts: same, tip: 17 },
  ],
  stages: STAGES,
  keys: [
    { name: 'q26HomR0', stage: 'start', line: 'same' },
    { name: 'q26HomR25', stage: 'to-quarter', line: 'same' },
    { name: 'q26DistR25', stage: 'to-quarter', line: 'apart' },
    { name: 'q26HomDip', stage: 'to-half', line: 'same' },
    { name: 'q26DistR50', stage: 'to-half', line: 'apart' },
    { name: 'q26HomR100', stage: 'to-mirror', line: 'same' },
  ],
  labelAt: { x: -FORMAT.width / 2 + 90, y: -FORMAT.height / 2 + 95 },
}
