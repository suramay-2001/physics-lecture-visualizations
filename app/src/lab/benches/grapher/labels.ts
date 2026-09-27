/**
 * The Grapher's projected DOM labels (pure; placed by LabStage's `useProjectedLabels`, whose avoidance pass keeps any
 * two visible labels and the overlay furniture apart). Graph space: one label per axis at the middle of its edge,
 * carrying the student's variable name and the fitted range ("x ∈ [0, 3.142]"); the height axis names the layers
 * drawn (f, g) or the curve's coordinate. Bloch path: the six pole kets and ψ(t) at the state cursor.
 * Student names are plain letters (VAR_RE), so a label never runs student text through TeX.
 */
import type { Vec3 } from '../../../physics/spin'
import { POLE_LABELS } from '../../../stage/scenes/bloch/blochLabels'
import type { LabLabel } from '../../LabStage'
import { heightName, num, type Geometry, type Layers, type Sampled } from './model'

export interface LabelSpec extends LabLabel {
  text: string
  /** TeX-free student words are plain; the pole kets are rich. */
  rich: boolean
  tone: 'silver' | 'state' | 'text'
}

const POLES: [keyof (typeof POLE_LABELS)['spin'], Vec3][] = [
  ['+x', [1.12, 0, 0]],
  ['-x', [-1.12, 0, 0]],
  ['+y', [0, 1.12, 0]],
  ['-y', [0, -1.12, 0]],
  ['+z', [0, 0, 1.18]],
  ['-z', [0, 0, -1.18]],
]
/** An axis's range; a float residue below 10⁻¹² of the larger end prints as 0 (the readouts' rule). */
const range = (lo: number, hi: number) => {
  const big = Math.max(Math.abs(lo), Math.abs(hi))
  const v = (x: number) => num(Math.abs(x) < 1e-12 * big ? 0 : x)
  return lo === hi ? `= ${v(lo)}` : `∈ [${v(lo)}, ${v(hi)}]`
}

export function labelsOf(s: Sampled, g: Geometry, layers: Layers, cursorAt: Vec3 | null): LabelSpec[] {
  if (s.kind === 'bloch') {
    const L: LabelSpec[] = POLES.map(([pole, at]) => ({ key: `pole${pole}`, at, text: POLE_LABELS.spin[pole], rich: true, tone: 'silver', priority: 3 }))
    L.push({ key: 'psi', at: cursorAt, dx: 26, dy: -18, text: `ψ(${s.cfg.v})`, rich: false, tone: 'state', priority: 0 })
    return L
  }
  const box = g.geo.box
  const fit = g.fit
  // nothing drawn (every sample a gap): the fit's zero extents are not the function's values, so no axis claims them
  if (!box || !fit || (s.kind === 'curve' && !s.ext)) return []
  const [x0, y0, z0] = box.min
  const [x1, y1, z1] = box.max
  const mid = (a: number, b: number) => (a + b) / 2
  // the three axis edges the default shot sees in front (x along y = max, y along x = max, height at x = max, y = min)
  const names = s.kind === 'surface' ? [s.cfg.vars[0], s.cfg.vars[1], heightName(layers, s.cfg) || 'height'] : [`x(${s.cfg.v})`, `y(${s.cfg.v})`, `z(${s.cfg.v})`]
  const ext = fit.ext
  const out = 0.16
  return [
    { key: 'ax-x', at: [mid(x0, x1), y1 + out, z0 - out], text: `${names[0]} ${range(ext[0][0], ext[0][1])}`, rich: false, tone: 'silver', priority: 1 },
    { key: 'ax-y', at: [x1 + out, mid(y0, y1), z0 - out], text: `${names[1]} ${range(ext[1][0], ext[1][1])}`, rich: false, tone: 'silver', priority: 1 },
    {
      key: 'ax-z',
      at: [x1 + out, y0 - out, mid(z0, z1)],
      text: s.kind === 'surface' && !g.zr ? `${names[2]}: no drawn sample` : `${names[2]} ${range(ext[2][0], ext[2][1])}`,
      rich: false,
      tone: 'silver',
      priority: 2,
    },
  ]
}
