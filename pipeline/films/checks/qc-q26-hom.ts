/**
 * The manifest check for the film `qc-q26-hom` (P-Q26-story §9, "Two photons, one exit"): recompute every number the film drew with the
 * engine. Imports only the engine (`homDip`, `distinguishable`, `bsReal`) and the shared check kit (checks/kit.ts), never the film's own data module. The plan's inputs (R = i/100, the stage
 * reflectivities 0, 0.25, 0.5, 1, the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it registered the
 * engine's import hook.
 */
import { bsReal, distinguishable, homDip } from '../../../app/src/physics/qc/photons.ts'
import { checkFilm, kitSelfTests, segment, type Plan, type PlanStage } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const rs = Array.from({ length: 101 }, (_, i) => i / 100)
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, i: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { same: i, apart: i }, heights: {} })

export const PLAN: Plan = {
  film: 'qc-q26-hom',
  format: FORMAT,
  stages: [
    stage('start', 'a splitter that lets all through', 'start', 0, 0, 5, 0),
    stage('to-quarter', 'the splitter reflects more', 'sweep', 6, 28, 39, 25),
    stage('to-half', 'the balanced splitter', 'sweep', 40, 32, 79, 50),
    stage('to-mirror', 'on to a mirror', 'sweep', 80, 32, 119, 100),
  ],
  lines: { same: rs.map((r) => [r, homDip(r)]), apart: rs.map((r) => [r, distinguishable(bsReal(r))]) },
  tips: ['same', 'apart'],
  guides: { base: segment(0, 0, 1), top: segment(1, 0, 1) },
  keys: [
    { name: 'q26HomR0', stage: 'start', line: 'same', value: homDip(0) },
    { name: 'q26HomR25', stage: 'to-quarter', line: 'same', value: homDip(0.25) },
    { name: 'q26DistR25', stage: 'to-quarter', line: 'apart', value: distinguishable(bsReal(0.25)) },
    { name: 'q26HomDip', stage: 'to-half', line: 'same', value: homDip(0.5) },
    { name: 'q26DistR50', stage: 'to-half', line: 'apart', value: distinguishable(bsReal(0.5)) },
    { name: 'q26HomR100', stage: 'to-mirror', line: 'same', value: homDip(1) },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
