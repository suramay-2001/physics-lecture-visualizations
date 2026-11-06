/**
 * The manifest check for the film `qc-q25-blockade` (P-Q25-story §9, "Blockade: the second atom stays down"): recompute every number the
 * film drew with the engine. Imports only the engine (`rydbergError`) and the shared check
 * kit (checks/kit.ts), never the film's own data module. The plan's inputs (Ω = 1, no decay, B = 10^(k/20) for k = 0…40, drawn on log10
 * axes; the stage blockades 1, 10, 100; the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it registered
 * the engine's import hook.
 */
import { rydbergError } from '../../../app/src/physics/qc/atoms.ts'
import { checkFilm, kitSelfTests, segment, type Plan, type PlanStage, type Pt } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const us = Array.from({ length: 41 }, (_, k) => k / 20)
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, k: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { error: k }, heights: {} })
const logErr = (B: number): number => Math.log10(rydbergError(1, B, 0))

export const PLAN: Plan = {
  film: 'qc-q25-blockade',
  format: FORMAT,
  stages: [
    stage('b-1', 'a weak blockade', 'start', 0, 0, 29, 0),
    stage('b-10', 'a stronger blockade', 'sweep', 30, 36, 69, 20),
    stage('b-100', 'a much stronger blockade', 'sweep', 70, 44, 119, 40),
  ],
  lines: { error: us.map((u): Pt => [u, logErr(10 ** u)]) },
  tips: ['error'],
  guides: { decade1: segment(-1, 0, 2), decade2: segment(-2, 0, 2), decade3: segment(-3, 0, 2), decade4: segment(-4, 0, 2), floor: segment(-4.5, 0, 2) },
  keys: [
    { name: 'q25LogErrB1', stage: 'b-1', line: 'error', value: logErr(1) },
    { name: 'q25LogErrB10', stage: 'b-10', line: 'error', value: logErr(10) },
    { name: 'q25LogErrB100', stage: 'b-100', line: 'error', value: logErr(100) },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
