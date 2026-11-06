/**
 * The manifest check for the film `qc-q24-rabi-ball` (P-Q24-story §9, "Rabi flopping, and the decay, inside the ball"): recompute every
 * number the film drew with the engine. Imports only the engine (`lindbladSolve`, `qubitJump`, `blochOf`, and `rabiPe` / `piPulseTime` for
 * the cross-checks) and the shared check kit (checks/kit.ts), never the film's own data module. The plan's inputs (Ω = 2π, T1 = 4, the
 * start in the ground state, t = k/80 for k = 0…160, the stage times 0, 0.5, 1, 2, the stage frames) are pinned below. Loaded by
 * pipeline/films/check_manifest.ts after it registered the engine's import hook.
 */
import { c } from '../../../app/src/physics/complex.ts'
import { blochOf, lindbladSolve, qubitJump } from '../../../app/src/physics/qc/blocheq.ts'
import { piPulseTime } from '../../../app/src/physics/qc/pulses.ts'
import { checkFilm, circle, kitSelfTests, segment, vsegment, type Plan, type PlanStage, type Pt } from './kit.ts'

const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }
const OMEGA = 2 * Math.PI
const bloch = (t: number) => blochOf(lindbladSolve([[c(1), c(0)], [c(0), c(0)]], [[c(0), c(OMEGA / 2)], [c(OMEGA / 2), c(0)]], [qubitJump(1 / 4)], t))
const stage = (id: string, label: string, kind: string, from: number, tween: number, to: number, k: number): PlanStage => ({ id, label, kind, from, tween, to, upTo: { path: k }, heights: {} })
// the half turn takes the engine's own pi-pulse time: 0.5 = 40/80
if (Math.abs(piPulseTime(OMEGA) - 40 / 80) > 1e-12) throw new Error('the plan assumes a half turn at t = 0.5')

export const PLAN: Plan = {
  film: 'qc-q24-rabi-ball',
  format: FORMAT,
  stages: [
    stage('rest', 'the qubit at rest', 'start', 0, 0, 5, 0),
    stage('half-turn', 'a half turn of the drive', 'turn', 6, 28, 39, 40),
    stage('full-turn', 'a full turn', 'turn', 40, 32, 79, 80),
    stage('turns-on', 'the turns go on', 'turn', 80, 32, 119, 160),
  ],
  lines: { path: Array.from({ length: 161 }, (_, k): Pt => [bloch(k / 80)[1], bloch(k / 80)[2]]) },
  tips: ['path'],
  guides: { edge: circle(1), yaxis: segment(0, -1, 1), zaxis: vsegment(0, -1, 1) },
  keys: [
    { name: 'q24RabiZ0', stage: 'rest', line: 'path', comp: 1, value: bloch(0)[2] },
    { name: 'q24RabiYHalf', stage: 'half-turn', line: 'path', comp: 0, value: bloch(0.5)[1] },
    { name: 'q24RabiZHalf', stage: 'half-turn', line: 'path', comp: 1, value: bloch(0.5)[2] },
    { name: 'q24RabiZFull', stage: 'full-turn', line: 'path', comp: 1, value: bloch(1)[2] },
    { name: 'q24RabiYEnd', stage: 'turns-on', line: 'path', comp: 0, value: bloch(2)[1] },
    { name: 'q24RabiZEnd', stage: 'turns-on', line: 'path', comp: 1, value: bloch(2)[2] },
  ],
}

export const check = (raw: unknown) => checkFilm(raw, PLAN)
export const selfTests = (raw: unknown) => kitSelfTests(raw, PLAN)
