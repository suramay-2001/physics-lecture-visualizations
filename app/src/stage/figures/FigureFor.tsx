/**
 * Print figures (W-709-platform "Print notes"): the stage of a beat redrawn as a flat SVG for paper. One numbered
 * `<figure>` per stage change in the reading version (StaticStory), shown only in print (styles/print.css).
 *
 * Every drawn quantity comes from `resolve()` (stage/resolve.ts: the engine's numbers at the end of the beat's hold,
 * s = 1), never from the content: a figure cannot disagree with the stage. Colours keep their meaning in print (amber
 * = +, cobalt = −, the state in ink, orchid for operators; classes `fg-*`, print colours in styles/print.css); gold and
 * copper never appear. Three-free (main chunk).
 *
 * Kinds: hilbert-plane (the real state plane, true angles), bloch (a fixed oblique projection of the sphere),
 * bloch-ball (the same projection, a point inside), operator-space (the arrow a in the same projection plus the a₀
 * gauge), lab-r3 (a schematic of the bench: source, magnets, outputs, the Born fractions on the plate). hopf is a
 * labelled placeholder: its fibers do not survive a 2D drawing yet. An SVG kind (content/stage.ts KIND_RENDER) is drawn
 * by its own scene component in print mode: the print figure IS the stage picture (stage/svgKinds.ts).
 */
import { createContext, type ReactNode } from 'react'
import type { Lecture, StageLayout, StageState } from '../../content/schema'
import { isSvgKind, layoutStates, passportOf } from '../../content/stage'
import type { CourseId, Track } from '../../content/courses'
import { derivFigureGroups, derivationSteps } from '../../content/track'
import { svgKindDef } from '../svgKinds'
import { Rich } from '../../ui/Rich'
import { resolve } from '../resolve'
import { budgetText } from '../budget'
import { photonLabAngle } from '../../physics/polarization'
import type { ResolvedBall, ResolvedBloch, ResolvedLab, ResolvedOperator, ResolvedPlane, V3 } from '../types'

/** Kinds drawn as a real figure; the others get a labelled placeholder (listed for the report). */
export const FIGURE_KINDS = ['hilbert-plane', 'bloch', 'bloch-ball', 'operator-space', 'lab-r3', 'complex-plane', 'amplitudes', 'circuit', 'matrix', 'two-qubit', 'plot', 'bb84'] as const
export const PLACEHOLDER_KINDS = ['hopf'] as const

const W = 320
const H = 240
/** A number for a label: finite, rounded, "−" for negatives. */
const num = (x: number, d = 2): string => (Number.isFinite(x) ? (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d).replace('-', '−') : '?')
const pct = (p: number): string => (Number.isFinite(p) ? `${Math.round(p * 100)} %` : '?')

/* ---------- a fixed oblique projection of physics space (z up, x toward the reader, y to the right) ---------- */
const AZ = (32 * Math.PI) / 180
const EL = (18 * Math.PI) / 180
/** Physics point → SVG (x right, y down) around (cx, cy) at radius R; depth > 0 = toward the reader. */
function project(p: V3, cx: number, cy: number, R: number): { x: number; y: number; depth: number } {
  const [x, y, z] = p
  const u = y * Math.cos(AZ) - x * Math.sin(AZ)
  const toward = x * Math.cos(AZ) + y * Math.sin(AZ)
  const v = z * Math.cos(EL) - toward * Math.sin(EL)
  return { x: cx + R * u, y: cy - R * v, depth: toward * Math.cos(EL) + z * Math.sin(EL) }
}

function Arrow({ from, to, cls, width = 2 }: { from: { x: number; y: number }; to: { x: number; y: number }; cls: string; width?: number }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  if (len < 1) return <circle cx={to.x} cy={to.y} r={3} className={`${cls}-fill`} />
  const ux = dx / len
  const uy = dy / len
  const hx = to.x - ux * 9
  const hy = to.y - uy * 9
  return (
    <g>
      <line x1={from.x} y1={from.y} x2={hx} y2={hy} className={cls} strokeWidth={width} />
      <polygon points={`${to.x},${to.y} ${hx - uy * 4.5},${hy + ux * 4.5} ${hx + uy * 4.5},${hy - ux * 4.5}`} className={`${cls}-fill`} />
    </g>
  )
}

const Label = ({ x, y, children, cls = 'fg-txt', anchor = 'start' }: { x: number; y: number; children: ReactNode; cls?: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} className={cls} textAnchor={anchor}>
    {children}
  </text>
)

/** The sphere's frame: outline, equator (back dashed, front solid), axes, the poles in the outcome colours. */
function SphereFrame({ cx, cy, R }: { cx: number; cy: number; R: number }) {
  const eq = Array.from({ length: 73 }, (_, i) => (i / 72) * 2 * Math.PI).map((t) => project([Math.cos(t), Math.sin(t), 0], cx, cy, R))
  const seg = (front: boolean) =>
    eq
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (p.depth >= 0) === front)
      .map(({ p }, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')
  const ax = (v: V3, name: string) => {
    const a = project(v, cx, cy, R * 1.12)
    const b = project(v.map((c) => -c) as V3, cx, cy, R * 1.12)
    return (
      <g key={name}>
        <line x1={b.x} y1={b.y} x2={a.x} y2={a.y} className="fg-sil3" strokeWidth={1} />
        <Label x={a.x + 4} y={a.y + (name === 'z' ? -2 : 12)} cls="fg-lbl">
          {name}
        </Label>
      </g>
    )
  }
  const n = project([0, 0, 1], cx, cy, R)
  const s = project([0, 0, -1], cx, cy, R)
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} className="fg-sil2" fill="none" strokeWidth={1.2} />
      <path d={seg(false)} className="fg-sil3" fill="none" strokeDasharray="3 4" strokeWidth={1} />
      <path d={seg(true)} className="fg-sil2" fill="none" strokeWidth={1} />
      {ax([1, 0, 0], 'x')}
      {ax([0, 1, 0], 'y')}
      {ax([0, 0, 1], 'z')}
      <circle cx={n.x} cy={n.y} r={4.5} className="fg-plus-fill" />
      <circle cx={s.x} cy={s.y} r={4.5} className="fg-minus-fill" />
    </g>
  )
}

function Measure({ axis, cx, cy, R, p }: { axis: V3 | null; cx: number; cy: number; R: number; p: number | null }) {
  if (!axis) return null
  const a = project(axis, cx, cy, R)
  const b = project(axis.map((c) => -c) as V3, cx, cy, R)
  return (
    <g>
      <line x1={b.x} y1={b.y} x2={a.x} y2={a.y} className="fg-sil" strokeDasharray="5 4" strokeWidth={1.2} />
      <circle cx={a.x} cy={a.y} r={3.5} className="fg-plus-fill" />
      <circle cx={b.x} cy={b.y} r={3.5} className="fg-minus-fill" />
      {p !== null && (
        <Label x={8} y={H - 10}>
          {`P(+) along n̂ = ${num(p, 3)}`}
        </Label>
      )}
    </g>
  )
}

/** W-448 L8-A: light's six poles by name (the engine's POL kets: H/V on z, D/A on x, C± on y). */
const LIGHT_POLES: { v: V3; text: string }[] = [
  { v: [0, 0, 1], text: '|H⟩' },
  { v: [0, 0, -1], text: '|V⟩' },
  { v: [1, 0, 0], text: '|D⟩' },
  { v: [-1, 0, 0], text: '|A⟩' },
  { v: [0, 1, 0], text: '|C₊⟩' },
  { v: [0, -1, 0], text: '|C₋⟩' },
]

function BlochFig({ r }: { r: ResolvedBloch }) {
  const cx = W / 2
  const cy = H / 2 + 4
  const R = 88
  const c = project([0, 0, 0], cx, cy, R)
  const tip = project(r.r, cx, cy, R)
  const light = r.labels === 'poincare'
  return (
    <>
      <SphereFrame cx={cx} cy={cy} R={R} />
      {light &&
        LIGHT_POLES.map((p) => {
          const q = project(p.v, cx, cy, R * 1.2)
          return (
            <Label key={p.text} x={q.x + (p.v[2] === 0 ? 6 : -10)} y={q.y + (p.v[2] > 0 ? -4 : p.v[2] < 0 ? 14 : 4)} cls="fg-lbl">
              {p.text}
            </Label>
          )
        })}
      <Measure axis={r.axis} cx={cx} cy={cy} R={R} p={r.pPlus} />
      <Arrow from={c} to={tip} cls="fg-state" width={2.4} />
      <Label x={8} y={16}>
        {`r = (${num(r.r[0])}, ${num(r.r[1])}, ${num(r.r[2])})`}
      </Label>
      {r.photon && r.rot && (
        <Label x={8} y={32}>
          {`lab ${num((photonLabAngle(r.rot.angle) * 180) / Math.PI, 0)}° → sphere ${num((r.rot.angle * 180) / Math.PI, 0)}°`}
        </Label>
      )}
      {r.readouts.includes('budget') && (
        <Label x={8} y={r.axis ? H - 24 : H - 10}>
          {`(Δσ)² = ${r.variances.map((x) => num(x)).join(', ')} · ${budgetText(r.variances)}`}
        </Label>
      )}
    </>
  )
}

function BallFig({ r }: { r: ResolvedBall }) {
  const cx = W / 2
  const cy = H / 2 + 4
  const R = 88
  const pt = project(r.r, cx, cy, R)
  const cmp = r.compare ? project(r.compare, cx, cy, R) : null
  return (
    <>
      <SphereFrame cx={cx} cy={cy} R={R} />
      <Measure axis={r.axis} cx={cx} cy={cy} R={R} p={r.pPlus} />
      {r.recipe?.map((g, i) => {
        const q = project(g.r, cx, cy, R)
        return <line key={i} x1={pt.x} y1={pt.y} x2={q.x} y2={q.y} className="fg-sil" strokeDasharray="2 3" strokeWidth={1} />
      })}
      {r.recipe?.map((g, i) => {
        const q = project(g.r, cx, cy, R)
        return <circle key={`d${i}`} cx={q.x} cy={q.y} r={3} className="fg-sil-fill" />
      })}
      {cmp && <circle cx={cmp.x} cy={cmp.y} r={5} className="fg-sil-fill" />}
      <circle cx={pt.x} cy={pt.y} r={5.5} className="fg-state-fill" />
      <Label x={8} y={16}>
        {`|r| = ${num(r.rNorm)} · Tr ρ² = ${num(r.purity)}`}
      </Label>
      {r.budgetShown > 0.5 && (
        <Label x={8} y={r.axis ? H - 24 : H - 10}>
          {`(Δσ)² = ${r.variances.map((x) => num(x)).join(', ')} · ${budgetText(r.variances)}`}
        </Label>
      )}
    </>
  )
}

function PlaneFig({ r }: { r: ResolvedPlane }) {
  const cx = 70
  const cy = H - 50
  const R = 150 / Math.max(1, r.extent)
  const at = (ang: number, len = 1) => ({ x: cx + R * len * Math.cos(ang), y: cy - R * len * Math.sin(ang) })
  const o = { x: cx, y: cy }
  const quarter = `M${cx + R},${cy} A${R},${R} 0 0 0 ${cx},${cy - R}`
  const b1 = r.basis
  const b2 = r.basis === 0 ? Math.PI / 2 : r.basis - Math.PI / 2
  return (
    <>
      <path d={quarter} className="fg-sil3" fill="none" strokeWidth={1} />
      <line x1={cx - 20} y1={cy} x2={cx + R + 20} y2={cy} className="fg-sil3" strokeWidth={1} />
      <line x1={cx} y1={cy + 20} x2={cx} y2={cy - R - 20} className="fg-sil3" strokeWidth={1} />
      <Arrow from={o} to={at(b1)} cls="fg-plus" />
      <Arrow from={o} to={at(b2)} cls="fg-minus" />
      <Label x={at(b1).x + 4} y={at(b1).y + 14} cls="fg-plus-t">
        {r.labels === 'polarization' ? (r.basis === 0 ? '|H⟩' : '|D⟩') : r.basis === 0 ? '|+z⟩' : '|+x⟩'}
      </Label>
      <Label x={at(b2).x + 6} y={at(b2).y + 4} cls="fg-minus-t">
        {r.labels === 'polarization' ? (r.basis === 0 ? '|V⟩' : '|A⟩') : r.basis === 0 ? '|−z⟩' : '|−x⟩'}
      </Label>
      {r.others.map((k, i) => (
        <Arrow key={i} from={o} to={at(k.angle)} cls="fg-sil" width={1.4} />
      ))}
      {r.psi !== null && r.shadows > 0 && (
        <g>
          <line x1={at(r.psi).x} y1={at(r.psi).y} x2={at(b1, Math.cos(r.psi - b1)).x} y2={at(b1, Math.cos(r.psi - b1)).y} className="fg-sil" strokeDasharray="3 3" />
          <line x1={at(r.psi).x} y1={at(r.psi).y} x2={at(b2, Math.cos(r.psi - b2)).x} y2={at(b2, Math.cos(r.psi - b2)).y} className="fg-sil" strokeDasharray="3 3" />
        </g>
      )}
      {r.image && <Arrow from={o} to={{ x: cx + R * r.image.x, y: cy - R * r.image.y }} cls="fg-op" />}
      {r.sum && r.sum.alpha > 0.5 && (
        // two vectors, the dashed translated sides and their sum at its true length (P-Q1-story S1)
        <g data-mark="sum">
          <Arrow from={o} to={{ x: cx + R * r.sum.a.x, y: cy - R * r.sum.a.y }} cls="fg-sil" width={1.4} />
          <Arrow from={o} to={{ x: cx + R * r.sum.b.x, y: cy - R * r.sum.b.y }} cls="fg-sil" width={1.4} />
          <line x1={cx + R * r.sum.a.x} y1={cy - R * r.sum.a.y} x2={cx + R * r.sum.total.x} y2={cy - R * r.sum.total.y} className="fg-sil" strokeDasharray="4 3" />
          <line x1={cx + R * r.sum.b.x} y1={cy - R * r.sum.b.y} x2={cx + R * r.sum.total.x} y2={cy - R * r.sum.total.y} className="fg-sil" strokeDasharray="4 3" />
          <Arrow from={o} to={{ x: cx + R * r.sum.total.x, y: cy - R * r.sum.total.y }} cls="fg-state" width={2} />
          <Label x={8} y={H - 10}>
            {`|sum| = ${num(r.sum.len, 3)}`}
          </Label>
        </g>
      )}
      {r.psi !== null && <Arrow from={o} to={at(r.psi)} cls="fg-state" width={2.4} />}
      {r.psi !== null && (
        <Label x={at(r.psi).x + 6} y={at(r.psi).y - 6} cls="fg-lbl">
          |ψ⟩
        </Label>
      )}
      {r.probs && (
        <Label x={W - 8} y={16} anchor="end">
          {`P₁ = ${num(r.probs[0], 3)} · P₂ = ${num(r.probs[1], 3)}`}
        </Label>
      )}
    </>
  )
}

function OperatorFig({ r }: { r: ResolvedOperator }) {
  const cx = W / 2 - 30
  const cy = H / 2 + 4
  const R = 80
  const m = Math.max(1, Math.hypot(...r.a), Math.abs(r.a0))
  const s = R / m
  const c = project([0, 0, 0], cx, cy, R)
  const tip = project(r.a, cx, cy, s)
  const gx = W - 40
  const g0 = cy
  const gy = (v: number) => g0 - (v / m) * R
  return (
    <>
      <SphereFrame cx={cx} cy={cy} R={R} />
      {r.valid && <Arrow from={c} to={tip} cls="fg-op" width={2.4} />}
      <line x1={gx} y1={gy(m)} x2={gx} y2={gy(-m)} className="fg-sil2" strokeWidth={1.2} />
      <line x1={gx - 8} y1={gy(0)} x2={gx + 8} y2={gy(0)} className="fg-sil3" strokeWidth={1} />
      <rect x={gx - 6} y={gy(r.a0) - 2} width={12} height={4} className="fg-op-fill" />
      <Label x={gx} y={gy(-m) + 16} anchor="middle" cls="fg-lbl">
        a₀
      </Label>
      <Label x={8} y={16}>
        {`a = (${num(r.a[0])}, ${num(r.a[1])}, ${num(r.a[2])}) · a₀ = ${num(r.a0)}`}
      </Label>
      <Label x={8} y={H - 10}>
        {`eigenvalues ${num(r.eig[0])}, ${num(r.eig[1])}`}
      </Label>
    </>
  )
}

const tiltName = (t: number) => {
  const deg = (t * 180) / Math.PI
  return Math.abs(deg) < 1e-6 ? 'z' : Math.abs(deg - 90) < 1e-6 ? 'x' : `${num(deg, 0)}°`
}

function LabFig({ r }: { r: ResolvedLab }) {
  const rows = r.benches.length
  const rowH = (H - 20) / rows
  return (
    <>
      {r.benches.map((b, bi) => {
        const y = 14 + rowH * bi + rowH / 2
        const n = b.tilts.length
        const step = (W - 110) / Math.max(1, n)
        const x0 = 26
        const fires = (b.fires ?? 1) > 0
        return (
          <g key={bi}>
            <rect x={x0 - 18} y={y - 10} width={20} height={20} rx={3} className="fg-sil2" fill="none" />
            <Label x={x0 - 8} y={y + 26} anchor="middle" cls="fg-lbl">
              {b.source === 'oven' ? 'oven' : `|${b.source}⟩`}
            </Label>
            {b.tilts.map((t, k) => {
              const x = x0 + 16 + k * step
              const last = k === n - 1
              return (
                <g key={k}>
                  <line x1={x - 14} y1={y} x2={x} y2={y} className={fires ? 'fg-state' : 'fg-sil3'} strokeWidth={1.4} />
                  <rect x={x} y={y - 14} width={34} height={28} rx={3} className="fg-sil" fill="none" strokeWidth={1.2} />
                  <Label x={x + 17} y={y + 4} anchor="middle" cls="fg-lbl">
                    {tiltName(t)}
                  </Label>
                  {!last && (
                    <Label x={x + 17} y={y - 18} anchor="middle" cls={b.keep[k] === '+' ? 'fg-plus-t' : 'fg-minus-t'}>
                      {`keep ${b.keep[k] === '+' ? '+' : '−'}`}
                    </Label>
                  )}
                  {!last && <line x1={x + 34} y1={y} x2={x + step - 14} y2={y} className={fires ? 'fg-state' : 'fg-sil3'} strokeWidth={1.4} />}
                </g>
              )
            })}
            {(() => {
              const px = x0 + 16 + (n - 1) * step + 34
              const plate = px + 30
              return (
                <g>
                  <line x1={px} y1={y - 4} x2={plate} y2={y - 16} className="fg-plus" strokeWidth={1.4} />
                  <line x1={px} y1={y + 4} x2={plate} y2={y + 16} className="fg-minus" strokeWidth={1.4} />
                  <line x1={plate} y1={y - 26} x2={plate} y2={y + 26} className="fg-sil" strokeWidth={2} />
                  <rect x={plate + 4} y={y - 20} width={Math.max(0.5, 40 * b.theory.plus)} height={7} className="fg-plus-fill" />
                  <rect x={plate + 4} y={y + 13} width={Math.max(0.5, 40 * b.theory.minus)} height={7} className="fg-minus-fill" />
                  <Label x={plate + 4} y={y - 24} cls="fg-plus-t">
                    {`+ ${pct(b.theory.plus)}`}
                  </Label>
                  <Label x={plate + 4} y={y + 32} cls="fg-minus-t">
                    {`− ${pct(b.theory.minus)}`}
                  </Label>
                </g>
              )
            })()}
          </g>
        )
      })}
    </>
  )
}

function Placeholder({ kind }: { kind: string }) {
  return (
    <>
      <rect x={10} y={10} width={W - 20} height={H - 20} rx={6} className="fg-sil3" fill="none" strokeDasharray="6 5" />
      <Label x={W / 2} y={H / 2 - 6} anchor="middle">
        {`${kind}: no print drawing yet`}
      </Label>
      <Label x={W / 2} y={H / 2 + 14} anchor="middle" cls="fg-lbl">
        (see the live stage on screen)
      </Label>
    </>
  )
}

/**
 * The print drawing of an SVG kind (content/stage.ts KIND_RENDER): its ONE scene component in print mode, so the figure
 * is the stage picture in print ink (stage/svgKinds.ts). Undefined when the kind is not SVG or its chunk is not loaded.
 */
function svgDrawing(state: StageState): { box: { w: number; h: number }; node: ReactNode } | undefined {
  if (!isSvgKind(state.kind)) return undefined
  const def = svgKindDef(state.kind)
  if (!def) return undefined
  return { box: def.print, node: <def.Scene state={resolve(state, 1) as never} mode="print" width={def.print.w} height={def.print.h} /> }
}

/** The drawing of one stage state, from the engine's resolved numbers. */
function Drawing({ state }: { state: StageState }) {
  switch (state.kind) {
    case 'hilbert-plane':
      return <PlaneFig r={resolve(state, 1)} />
    case 'bloch':
      return <BlochFig r={resolve(state, 1)} />
    case 'bloch-ball':
      return <BallFig r={resolve(state, 1)} />
    case 'operator-space':
      return <OperatorFig r={resolve(state, 1)} />
    case 'lab-r3':
      return <LabFig r={resolve(state, 1)} />
    default:
      return <Placeholder kind={state.kind} />
  }
}

/** Passport titles are rich strings; the figure's title is plain text. */
const plain = (s: string) => s.replace(/\$([^$]*)\$/g, '$1').replace(/\\(?:uparrow|downarrow)/g, '').replace(/[\\{}]/g, '')

/**
 * One numbered figure for a beat's stage: `number` like "Q0.2" (chapter id, then the count of stage changes so far).
 * `caption` is the beat's caption in the page's track (plain text).
 */
export function FigureFor({ layout, number, caption, course }: { layout: StageLayout; number: string; caption?: string; course?: CourseId }) {
  const states = layoutStates(layout)
  const titles = states.map((s) => plain(passportOf(s, course).title))
  const label = `Fig. ${number}`
  return (
    <figure className="print-figure" data-figure={number} data-kinds={states.map((s) => s.kind).join(' ')}>
      <div className="print-figure-row">
        {states.map((s, i) => {
          const svg = svgDrawing(s)
          return (
            <svg
              key={i}
              className={svg ? 'print-fig-svg svgk svgk-print' : 'print-fig-svg'}
              viewBox={`0 0 ${svg?.box.w ?? W} ${svg?.box.h ?? H}`}
              role="img"
              aria-label={`${label}: ${titles[i]}`}
            >
              <title>{`${label}: ${titles[i]}`}</title>
              {svg ? svg.node : <Drawing state={s} />}
            </svg>
          )
        })}
      </div>
      <figcaption>
        <b>{label}</b> {titles.join(' · ')}
        {caption && (
          <>
            {' — '}
            <Rich as="span" text={caption} />
          </>
        )}
      </figcaption>
    </figure>
  )
}

/**
 * Figure numbers of a lecture: a beat gets a figure when its stage differs from the previous beat's (the first beat
 * of every unit always does), OR when its derivation needs its own figure strip in EITHER track (W-709 #11: a beat
 * whose own `stage` happens to repeat the previous beat's, but whose derivation still has ≥ 1 distinct view, must not
 * go without a slot to letter) — numbered through the lecture: "Q0.1", "Q0.2", … (beat id → number).
 */
export function figureNumbers(l: Pick<Lecture, 'id' | 'units'>): Map<string, string> {
  const out = new Map<string, string>()
  let n = 0
  for (const u of l.units) {
    let prev = ''
    for (const b of u.story ?? []) {
      const key = JSON.stringify(b.stage)
      const hasDerivFigures = !!b.derivation && (['ground', 'formal'] as const).some((t) => derivFigureGroups(derivationSteps(b, t)).length > 0)
      if (key !== prev || hasDerivFigures) out.set(b.id, `${l.id ? `${l.id}.` : ''}${++n}`)
      prev = key
    }
  }
  return out
}

/** The page's figure numbers (LecturePage provides them for the whole lecture; a lone unit numbers its own). */
export const FigureNumbersContext = createContext<ReadonlyMap<string, string> | null>(null)

/**
 * The total count of print figures of a lecture in a track (W-709 #11): `figureNumbers`'s count, with a derivation's
 * own distinct views (`content/track.ts` `derivFigureGroups`) replacing its beat's single slot — the figure strip
 * after the derivation takes the slot's place (stage/StaticStory.tsx), so a beat with k ≥ 2 distinct views contributes
 * k figures instead of 1. Track-aware because ground and formal derivation lists may hold a different number of
 * views. `pages/LecturePage.tsx` writes this as `data-figures` (the count `e2e/print.spec.ts` reads).
 */
export function totalFigureCount(l: Pick<Lecture, 'id' | 'units'>, track: Track): number {
  const base = figureNumbers(l)
  let total = base.size
  for (const u of l.units)
    for (const b of u.story ?? []) {
      if (!b.derivation || !base.has(b.id)) continue
      const groups = derivFigureGroups(derivationSteps(b, track)).length
      if (groups > 0) total += groups - 1
    }
  return total
}
