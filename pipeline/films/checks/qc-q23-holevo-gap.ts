/**
 * The manifest check for the film `qc-q23-holevo-gap` (P-Q23-story §9, "The Holevo gap for two states"): recompute every number the film
 * drew with the engine. Imports only the engine (`holevoChiPair`, `accessibleInfoPair`) and the shared check kit (checks/kit.ts), never the
 * film's own data module. The plan's inputs (the overlap s = i/50, the stage overlaps 0, 0.5, 0.8, 1, the stage frames) are pinned below.
 * Loaded by pipeline/films/check_manifest.ts after it registered the engine's import hook.
 */
import { accessibleInfoPair, holevoChiPair } from '../../../app/src/physics/qc/infoq.ts'
import { checkFilm, kitSelfTests, segment, type Plan, type PlanStage } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const ss = Array.from({ length: 51 }, (_, i) => i / 50)
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, i: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { chi: i, best: i }, heights: {} })

export const PLAN: Plan = {
  film: 'qc-q23-holevo-gap',
  format: FORMAT,
  stages: [
    stage('start', 'two orthogonal states', 'start', 0, 0, 5, 0),
    stage('to-half', 'the states move closer', 'sweep', 6, 28, 39, 25),
    stage('to-08', 'closer still', 'sweep', 40, 32, 79, 40),
    stage('to-one', 'the states coincide', 'sweep', 80, 32, 119, 50),
  ],
  lines: { chi: ss.map((s) => [s, holevoChiPair(s)]), best: ss.map((s) => [s, accessibleInfoPair(s)]) },
  tips: ['chi', 'best'],
  guides: { base: segment(0, 0, 1), top: segment(1, 0, 1) },
  keys: [
    { name: 'q23ChiS0', stage: 'start', line: 'chi', value: holevoChiPair(0) },
    { name: 'q23ChiS05', stage: 'to-half', line: 'chi', value: holevoChiPair(0.5) },
    { name: 'q23BestS05', stage: 'to-half', line: 'best', value: accessibleInfoPair(0.5) },
    { name: 'q23ChiS08', stage: 'to-08', line: 'chi', value: holevoChiPair(0.8) },
    { name: 'q23BestS08', stage: 'to-08', line: 'best', value: accessibleInfoPair(0.8) },
    { name: 'q23ChiS1', stage: 'to-one', line: 'chi', value: holevoChiPair(1) },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
