/**
 * The manifest check for the film `qc-q20-cloner` (P-Q20-story §9, "Cloning splits the information"): recompute every number the film
 * drew with the engine. Imports only the engine (`clonerFidelities`) and the shared check kit (checks/kit.ts), never the film's own data
 * module. The plan's inputs (whole-degree sweep 0…60, the stage angles 0, 15, 30, 60, the stage frames) are pinned below. Loaded by
 * pipeline/films/check_manifest.ts after it registered the engine's import hook.
 */
import { clonerFidelities } from '../../../app/src/physics/qc/machines.ts'
import { checkFilm, kitSelfTests, type Plan, type PlanStage, segment } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const fid = Array.from({ length: 61 }, (_, u) => clonerFidelities(u))
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, u: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { first: u, second: u }, heights: {} })

export const PLAN: Plan = {
  film: 'qc-q20-cloner',
  format: FORMAT,
  stages: [
    stage('start', 'the program at rest', 'start', 0, 0, 5, 0),
    stage('to-15', 'turning the program', 'turn', 6, 28, 39, 15),
    stage('to-30', 'turning on', 'turn', 40, 32, 79, 30),
    stage('to-60', 'to the end of the turn', 'turn', 80, 32, 119, 60),
  ],
  lines: { first: fid.map((f, u) => [u, f.f1]), second: fid.map((f, u) => [u, f.f2]) },
  tips: ['first', 'second'],
  guides: { base: segment(0, 0, 60), top: segment(1, 0, 60) },
  keys: [
    { name: 'q20F1u0', stage: 'start', line: 'first', value: clonerFidelities(0).f1 },
    { name: 'q20F2u0', stage: 'start', line: 'second', value: clonerFidelities(0).f2 },
    { name: 'q20F1u15', stage: 'to-15', line: 'first', value: clonerFidelities(15).f1 },
    { name: 'q20F2u15', stage: 'to-15', line: 'second', value: clonerFidelities(15).f2 },
    { name: 'q20F56', stage: 'to-30', line: 'first', value: clonerFidelities(30).f1 },
    { name: 'q20F1u60', stage: 'to-60', line: 'first', value: clonerFidelities(60).f1 },
    { name: 'q20F2u60', stage: 'to-60', line: 'second', value: clonerFidelities(60).f2 },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
