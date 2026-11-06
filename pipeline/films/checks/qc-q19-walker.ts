/**
 * The manifest check for the film `qc-q19-walker` (P-Q19-story §9, "A walker finds the marked spoke"): recompute every number the film
 * drew with the engine. Imports only the engine (`starSpokeChances`, and the closed form `groverSuccess` for the cross-check) and the
 * shared check kit (checks/kit.ts), never the film's own data module. The plan's inputs (N = 8 spokes, spoke 1 marked, 0 / 2 / 4 / 6
 * steps, the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it registered the engine's import hook.
 */
import { groverSuccess } from '../../../app/src/physics/qc/grover.ts'
import { starSpokeChances } from '../../../app/src/physics/qc/walk.ts'
import { checkFilm, kitSelfTests, type Plan, type PlanStage, segment } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const N = 8
const chances = (n: number): number[] => starSpokeChances(N, { marked: 1 }, n).spokes
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, n: number): PlanStage => ({
  id,
  label,
  kind,
  from,
  tween,
  to,
  upTo: {},
  heights: { marked: [chances(n)[0]], others: chances(n).slice(1) },
})

export const PLAN: Plan = {
  film: 'qc-q19-walker',
  format: FORMAT,
  stages: [
    stage('start', 'the walker at the start', 'start', 0, 0, 5, 0),
    stage('steps-2', 'a few steps', 'walk', 6, 28, 39, 2),
    stage('steps-4', 'more steps', 'walk', 40, 32, 79, 4),
    stage('steps-6', 'still more steps', 'walk', 80, 32, 119, 6),
  ],
  lines: {},
  tips: [],
  guides: { base: segment(0, -0.7, N - 0.3), top: segment(1, -0.7, N - 0.3) },
  keys: [
    { name: 'q19StarP0', stage: 'start', bars: 'marked', value: chances(0)[0] },
    { name: 'q19StarP2', stage: 'steps-2', bars: 'marked', value: chances(2)[0] },
    { name: 'q19StarP2Other', stage: 'steps-2', bars: 'others', value: chances(2)[1] },
    { name: 'q19StarP4', stage: 'steps-4', bars: 'marked', value: groverSuccess(8, 1, 2) }, // the star walk's four steps reach the chance two Grover steps do
    { name: 'q19StarP4Other', stage: 'steps-4', bars: 'others', value: chances(4)[1] },
    { name: 'q19StarP6', stage: 'steps-6', bars: 'marked', value: groverSuccess(8, 1, 3) }, // and six steps the chance of three
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
