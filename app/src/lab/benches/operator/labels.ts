/**
 * The Operator Lab's projected DOM labels (pure; the page places them with LabStage's `useProjectedLabels`, whose
 * avoidance pass keeps any two visible labels and the overlay furniture apart: P review items 3 and 12). Words only:
 * the eigenvalue labels reuse the model's readout text (engine values).
 *
 * `priority`: lower is placed first and wins a clash; a label that finds no free spot near its anchor hides.
 *   0 the state and the bead · 1 the eigen labels and a⃗ · 2 the gauge, b⃗ and [A,B]/2i · 3 poles and axis names ·
 *   4 the ghost-sphere caption.
 * When the eigen-axis IS a pole (â = ±x̂, ±ŷ, ±ẑ, e.g. S_x), the pole's own label names the eigenstate
 * ("|λ₊⟩ = |+x⟩") and the separate |λ±⟩ label is dropped (item 12). The review asked for this within 10° of a pole;
 * off the pole "=" would be false, so there the avoidance pass separates the two labels instead.
 */
import type { Vec3 } from '../../../physics/spin'
import { POLE_LABELS, type Pole } from '../../../stage/scenes/bloch/blochLabels'
import type { LabLabel } from '../../LabStage'
import type { OperatorModel, Tone } from './model'

export interface LabelSpec extends LabLabel {
  text: string
  tone: Tone
  tier: 'axis' | 'chip'
}

export const POLES: [Pole, Vec3][] = [
  ['+x', [1.08, 0, 0]],
  ['-x', [-1.08, 0, 0]],
  ['+y', [0, 1.08, 0]],
  ['-y', [0, -1.08, 0]],
  ['+z', [0, 0, 1.16]],
  ['-z', [0, 0, -1.16]],
]
const out = (v: Vec3, k: number, extra = 0): Vec3 => {
  const l = Math.hypot(...v) || 1
  const s = k + extra / l
  return [v[0] * s, v[1] * s, v[2] * s]
}
/** Which end of the eigen-axis sits on this pole: '+' (λ₊), '−' (λ₋) or none (â is exactly ±pole within 1e-9). */
export function poleEnd(axis: Vec3 | null, pole: Pole): '+' | '-' | null {
  if (!axis) return null
  const k = pole[1] === 'x' ? 0 : pole[1] === 'y' ? 1 : 2
  const s = pole[0] === '+' ? 1 : -1
  const onAxis = axis.every((x, i) => (i === k ? Math.abs(Math.abs(x) - 1) < 1e-9 : Math.abs(x) < 1e-9))
  if (!onAxis) return null
  return Math.sign(axis[k]) === s ? '+' : '-'
}

export function labelsOf(m: OperatorModel): LabelSpec[] {
  const v = m.view
  const text = (key: string) => m.readouts.op.find((r) => r.key === key)?.text ?? ''
  const tip = out(v.a, v.scale)
  const cross = v.cross && Math.hypot(...v.cross) > 1e-6 ? v.cross : null
  const merged = (POLES.map(([pole]) => poleEnd(v.axis, pole)).filter(Boolean) as ('+' | '-')[]).length === 2
  const L: LabelSpec[] = [
    { key: 'ax-x', view: 'op', at: [1.76, 0, 0], text: '$a_x$', tone: 'silver', tier: 'axis', priority: 3 },
    { key: 'ax-y', view: 'op', at: [0, 1.76, 0], text: '$a_y$', tone: 'silver', tier: 'axis', priority: 3 },
    { key: 'ax-z', view: 'op', at: [0.14, 0, 1.7], text: '$a_z$', tone: 'silver', tier: 'axis', priority: 3 },
    { key: 'ghost', view: 'op', at: [0, 0, -1], dx: 0, dy: 16, text: 'ghost Bloch sphere · state space', tone: 'silver', tier: 'axis', priority: 4 },
    { key: 'vec-a', view: 'op', at: v.showArrow && Math.hypot(...v.a) > 1e-6 ? out(tip, 1, 0.16) : null, text: '$\\vec a$', tone: 'op', tier: 'axis', priority: 1 },
    { key: 'lam+', view: 'op', at: v.axis ? out(v.axis, 1.24) : null, text: text('lam+'), tone: 'plus', tier: 'axis', priority: 1 },
    { key: 'lam-', view: 'op', at: v.axis ? out(v.axis, -1.24) : null, text: text('lam-'), tone: 'minus', tier: 'axis', priority: 1 },
    // left of the mark: the gauge stands at the view's edge in the left/right split
    { key: 'a0', view: 'op', anchor: 'gauge-a0', dx: -24, text: '$a_0$', tone: 'op', tier: 'axis', priority: 2 },
    // item 12: the gauge's name stays by the gauge, sliding down below the readout column when they meet
    { key: 'gauge', view: 'op', anchor: 'gauge-top', text: 'a₀ gauge', tone: 'silver', tier: 'axis', priority: 2, slide: [0, 1] },
    { key: 'vec-b', view: 'op', at: v.b && Math.hypot(...v.b) > 1e-6 ? out(out(v.b, v.scale), 1, 0.14) : null, text: '$\\vec b$', tone: 'op', tier: 'axis', priority: 2 },
    // item 3: at the arrow's midpoint, beside it (its tip is where the eigen-axis labels crowd)
    { key: 'cross', view: 'op', at: cross ? out(cross, v.scale * 0.5) : null, dx: -40, text: '$[A,B]/2i$', tone: 'op', tier: 'axis', priority: 2 },
  ]
  for (const [pole, at] of POLES) {
    const end = poleEnd(v.axis, pole)
    const base = POLE_LABELS.spin[pole]
    L.push(
      end
        ? { key: `pole${pole}`, view: 'state', at, text: `$|\\lambda_${end === '+' ? '+' : '-'}\\rangle = ${base.slice(1)}`, tone: end === '+' ? 'plus' : 'minus', tier: 'axis', priority: 1 }
        : { key: `pole${pole}`, view: 'state', at, text: base, tone: 'silver', tier: 'axis', priority: 3 },
    )
  }
  L.push(
    { key: 'psi0', view: 'state', at: v.psi0, dx: 18, dy: -16, text: '$\\psi_0$', tone: 'state', tier: 'axis', priority: 0 },
    { key: 'bead', view: 'state', at: v.showBead ? v.bead : null, dx: 26, dy: 16, text: '$U(\\tau)\\psi_0$', tone: 'state', tier: 'axis', priority: 0 },
    { key: 'ket+', view: 'state', at: v.axis && !merged ? out(v.axis, 1.28) : null, text: '$|\\lambda_+\\rangle$', tone: 'plus', tier: 'axis', priority: 1 },
    { key: 'ket-', view: 'state', at: v.axis && !merged ? out(v.axis, -1.28) : null, text: '$|\\lambda_-\\rangle$', tone: 'minus', tier: 'axis', priority: 1 },
  )
  return L
}
