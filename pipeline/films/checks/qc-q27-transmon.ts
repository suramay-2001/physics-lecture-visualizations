/**
 * The manifest check for the film `qc-q27-transmon` (P-Q27-story §9, "From evenly spaced rungs to a usable qubit"): recompute every number
 * the film drew with the engine. Imports only the engine (`oscillatorLevels`, `transmonLadder`, `f01Band`) and the shared check kit
 * (checks/kit.ts), never the film's own data module. The plan's inputs (five rungs; E_J/E_C = 20 for the ladder and 1, 20 for the curves;
 * n_g = k/40; the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it registered the engine's import hook.
 */
import { f01Band, oscillatorLevels, transmonLadder } from '../../../app/src/physics/qc/solid.ts'
import { checkFilm, kitSelfTests, segment, type Plan, type PlanStage, type Pt } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const levels = oscillatorLevels(1, 1).slice(0, 5)
const even = levels.map((e) => (e - levels[0]) / (levels[1] - levels[0]))
const transmon = transmonLadder(20)
const ngs = Array.from({ length: 41 }, (_, k) => k / 40)
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, ladder: number[], k: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { band1: k, band20: k }, heights: { even, ladder } })

export const PLAN: Plan = {
  film: 'qc-q27-transmon',
  format: FORMAT,
  stages: [
    stage('even', 'evenly spaced rungs', 'start', 0, 0, 29, even, 0),
    stage('bend', 'the junction bends the ladder', 'bend', 30, 28, 69, transmon, 0),
    stage('noise', 'charge noise', 'sweep', 70, 40, 119, transmon, 40),
  ],
  lines: { band1: ngs.map((ng): Pt => [ng, f01Band(1, ng)]), band20: ngs.map((ng): Pt => [ng, f01Band(20, ng)]) },
  tips: ['band1', 'band20'],
  guides: { flat: segment(1, 0, 1) },
  keys: [
    { name: 'q27Rung2', stage: 'bend', bars: 'ladder', index: 2, value: transmonLadder(20)[2] },
    { name: 'q27Rung3', stage: 'bend', bars: 'ladder', index: 3, value: transmonLadder(20)[3] },
    { name: 'q27Rung4', stage: 'bend', bars: 'ladder', index: 4, value: transmonLadder(20)[4] },
    { name: 'q27Spread1', stage: 'noise', line: 'band1', value: f01Band(1, 1) },
    { name: 'q27Spread20', stage: 'noise', line: 'band20', value: f01Band(20, 1) },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
