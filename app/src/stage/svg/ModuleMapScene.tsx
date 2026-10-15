/**
 * The `module-map` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved machine only (stage/svg/moduleMap.ts took every count from
 * physics/qec/tdg.ts). Left to right, the modules of the line; each is
 *   code block    a silver square, its AREA growing with the square root of c (the bicycle code's qubits)
 *   12 wires      two columns of small dots under it, qubits 1-6 left and 7-12 right: qubit 1 (the PIVOT) filled, qubit 7 ringed, a hairline from the code block to the LPU through each
 *   LPU block     an orchid square under the dots, area growing with the square root of u; dashed, because u is the paper's REPORTED Table 1 figure (badged "reported")
 * Neighbouring LPUs are joined by an adapter, a white bar whose width grows with the square root of a. The T factory (amber, dashed: f is reported too) and its adapter (a-prime) stand at the
 * end of the line (linear layout) or in a second row under module 1 (triangular layout, Fig. 2b). With more than 12 modules the first three, a "… k more …" marker and the last two are drawn.
 * A highlight lights what an instruction uses and dims the rest; a change of highlight cross-fades. Block sizes follow the counts, where a block sits is a drawing choice (the passport and
 * the fidelity note say so). Plain Unicode text; every block carries an accessible name.
 */
import type { ReactNode } from 'react'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedModuleMap } from '../types'
import { packLines, wrapLine } from './CodeScene'
import { Label, type Pt } from './draw'
import { factoryText, litAmount, moduleMapReadouts, moduleMapSummary, partAlpha } from './moduleMap'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))

export interface MapBox {
  x: number
  y: number
  w: number
  h: number
}
export interface MapModule {
  index: number
  code: MapBox
  lpu: MapBox
  /** Logical qubit 1 … 12: 1-6 in the left column, 7-12 in the right; `q` counted from 1. */
  dots: { q: number; x: number; y: number }[]
  cx: number
}
export interface MapBadge {
  key: 'u' | 'f' | 'uf'
  text: string
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
}
export interface MapGeometry {
  area: MapBox
  /** Pixels per unit (a block's side is count^(1/4) units: its area grows with the square root of the count). */
  u: number
  modules: MapModule[]
  /** The adapter after module `after` (between module `after` and the next one drawn). */
  adapters: { after: number; box: MapBox; left: Pt; right: Pt }[]
  /** The "… k more …" marker between the third and the second-last module. */
  gap: { x: number; w: number; y: number; hidden: number; left: Pt; right: Pt } | null
  factory: { box: MapBox; adapter: MapBox; from: Pt; to: Pt } | null
  /** The y of the module numbers (above the code blocks), where the drawing ends, the y of the "reported" badge row under the line of modules, and the legend. */
  numbersY: number
  bottom: number
  badgeY: number
  /** The "reported" badges: u under the LPUs, f under the factory; a drawing too narrow for two stacks them into one ("u, f reported"). */
  badges: MapBadge[]
  legendY: number
  /** The figure's own text lines above the drawing (print and bare), and the box. */
  lines: string[]
  radius: number
}

/** One unit of a block's side: its area is sqrt(count) in units squared. */
const side = (count: number): number => Math.sqrt(Math.sqrt(count))
/** An adapter bar's width in units: it grows with the square root of its qubits. */
const barW = (count: number): number => Math.max(0.5, 0.32 * Math.sqrt(count))
const STRIP = 3.0 // the 12 wires: six rows of dots, half a unit apart
const GAP_PX = 34 // the "… k more …" marker
const NUMBERS_PX = 12 // the module numbers above the code blocks
const BADGE_PX = 14 // the "reported" badge under the line
const NARROW_PX = 130 // a drawing narrower than this shares one badge between u and f

/** The print figure is 320 × 220; a state with many readout lines gets 13 px more height per line beyond the third, so the drawing keeps its room. */
export function moduleMapPrintSize(r: ResolvedModuleMap): { w: number; h: number } {
  const lines = wrapLine(MAP_TITLE(r), 46).length + packLines(moduleMapReadouts(r).map((x) => x.text), 50).length
  return { w: 320, h: 220 + 13 * Math.max(0, lines - 3) }
}

export const MAP_TITLE = (r: ResolvedModuleMap): string => `${r.machine.code} code · ${r.machine.M} module${r.machine.M === 1 ? '' : 's'} · ${factoryText(r.machine.factory)}`

/** Legend items, with their widths; they wrap to a second row rather than leave the box. */
function legendItems(r: ResolvedModuleMap): { w: number; node: (x: number, y: number) => ReactNode }[] {
  const items: { w: number; node: (x: number, y: number) => ReactNode }[] = []
  items.push({ w: 52, node: (x, y) => <><rect x={x} y={y - 9} width={9} height={9} className="fg-sil" fill="none" strokeWidth={1.4} /><text x={x + 14} y={y} className="fg-lbl">code</text></> })
  items.push({ w: 52, node: (x, y) => <><rect x={x} y={y - 9} width={9} height={9} className="fg-op" fill="none" strokeWidth={1.4} strokeDasharray="2.5 1.5" /><text x={x + 14} y={y} className="fg-lbl">LPU</text></> })
  if (r.machine.M > 1) items.push({ w: 68, node: (x, y) => <><rect x={x + 2} y={y - 9} width={4} height={9} className="fg-state-fill" /><text x={x + 14} y={y} className="fg-lbl">adapter</text></> })
  if (r.machine.factory !== 'none') items.push({ w: 80, node: (x, y) => <><rect x={x} y={y - 9} width={9} height={9} className="fg-plus" fill="none" strokeWidth={1.4} strokeDasharray="2.5 1.5" /><text x={x + 14} y={y} className="fg-lbl">T factory</text></> })
  items.push({ w: 54, node: (x, y) => <><circle cx={x + 5} cy={y - 4} r={3.4} className="fg-state-fill" /><text x={x + 13} y={y} className="fg-lbl">pivot</text></> })
  items.push({ w: 68, node: (x, y) => <><circle cx={x + 5} cy={y - 4} r={4.6} className="fg-sil" fill="none" strokeWidth={1.2} /><circle cx={x + 5} cy={y - 4} r={1.8} className="fg-sil-fill" /><text x={x + 13} y={y} className="fg-lbl">qubit 7</text></> })
  items.push({ w: 118, node: (x, y) => <><text x={x} y={y} className="fg-lbl">dashed = reported</text></> })
  return items
}

/** How many rows the legend needs in a drawing area of this width. */
export function legendRowCount(r: ResolvedModuleMap, areaW: number): number {
  let rows = 1
  let x = 0
  for (const it of legendItems(r)) {
    if (x > 0 && x + it.w - 10 > areaW) {
      rows++
      x = 0
    }
    x += it.w
  }
  return rows
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function moduleMapGeometry(r: ResolvedModuleMap, width: number, height: number, own: boolean, slot?: string | null): MapGeometry {
  const readouts = moduleMapReadouts(r)
  const lines = own ? [...wrapLine(MAP_TITLE(r), 46), ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const legendRows = legendRowCount(r, area.w)
  const legendH = 7 + 13 * legendRows
  const picTop = area.y + (own ? 4 : 10) + NUMBERS_PX
  const picBottom = area.y + area.h - legendH - 6

  const { c, u, a, aPrime, f } = r.parts
  const factory = r.machine.factory !== 'none'
  const tri = r.machine.layout === 'triangular'
  const sc = side(c)
  const su = side(u)
  const sf = factory ? side(f) : 0
  const aw = barW(a)
  const fw = factory ? barW(aPrime) : 0
  // the gap between two code blocks holds the adapter between their LPUs (which are narrower than the code blocks)
  const G = Math.max(1.4, aw + 0.9 - (sc - su))
  const stripTop = sc + 0.4
  const lpuTop = sc + 0.8 + STRIP
  const lpuCy = lpuTop + su / 2
  const modH = lpuTop + su
  const slots = r.shown.length
  const hidden = r.hidden > 0
  // the width of the line in units: every module and the gaps between them; the factory (linear) or the part of it that sticks out (triangular)
  const nGaps = slots - 1 + (hidden ? 1 : 0)
  const gapPx = hidden ? GAP_PX : 0
  let widthU = slots * sc + nGaps * G
  let leftU = 0
  if (factory && !tri) widthU += (su - sc) / 2 + fw + 0.8 + sf
  if (factory && tri) {
    leftU = Math.max(0, (sf - sc) / 2)
    widthU += slots === 1 ? 2 * leftU : leftU
  }
  // the height: the module, and the factory's row (triangular) or the factory's own extent (linear)
  let heightU = modH
  if (factory && tri) heightU = modH + fw + 0.8 + sf
  else if (factory) heightU = Math.max(modH, lpuCy + sf / 2)
  const availW = area.w - gapPx
  const availH = picBottom - picTop - BADGE_PX
  const unit = clamp(Math.min(availW / widthU, availH / heightU), 1.4, 18)
  const drawW = widthU * unit + gapPx
  const x0 = area.x + (area.w - drawW) / 2 + leftU * unit
  const drawH = heightU * unit
  const y0 = picTop + Math.max(0, (availH - drawH) / 2)
  const lpuY = y0 + lpuCy * unit

  const modules: MapModule[] = []
  const adapters: MapGeometry['adapters'] = []
  let gap: MapGeometry['gap'] = null
  let x = x0
  r.shown.forEach((index, k) => {
    if (hidden && k === 3) {
      // the marker sits between the third and the second-last module, a gap on each side of it
      const prev = modules[modules.length - 1]
      gap = { x, w: GAP_PX, y: lpuY, hidden: r.hidden, left: { x: prev.cx + (su * unit) / 2, y: lpuY }, right: { x: 0, y: lpuY } }
      x += GAP_PX + G * unit
    }
    const cx = x + (sc * unit) / 2
    if (gap && k === 3) gap.right = { x: cx - (su * unit) / 2, y: lpuY }
    const dots: MapModule['dots'] = []
    for (let q = 1; q <= 12; q++) {
      const col = q <= 6 ? 0 : 1
      const row = (q - 1) % 6
      dots.push({ q, x: cx + (col === 0 ? -0.6 : 0.6) * unit, y: y0 + (stripTop + (row + 0.5) * 0.5) * unit })
    }
    modules.push({
      index,
      code: { x, y: y0, w: sc * unit, h: sc * unit },
      lpu: { x: cx - (su * unit) / 2, y: y0 + lpuTop * unit, w: su * unit, h: su * unit },
      dots,
      cx,
    })
    // the adapter after this module, when the next one drawn is its neighbour
    const next = r.shown[k + 1]
    if (next !== undefined && next === index + 1) {
      const right = cx + (su * unit) / 2
      const nextCx = x + sc * unit + G * unit + (sc * unit) / 2
      const left = nextCx - (su * unit) / 2
      const mid = (right + left) / 2
      const h = su * unit * 0.9
      adapters.push({ after: index, box: { x: mid - (aw * unit) / 2, y: lpuY - h / 2, w: aw * unit, h }, left: { x: right, y: lpuY }, right: { x: left, y: lpuY } })
    }
    x += sc * unit + G * unit
  })
  let fac: MapGeometry['factory'] = null
  if (factory) {
    if (!tri) {
      const last = modules[modules.length - 1]
      const lpuRight = last.cx + (su * unit) / 2
      const fx = lpuRight + (fw + 0.8) * unit
      const h = su * unit * 0.9
      fac = {
        box: { x: fx, y: y0 + (lpuCy - sf / 2) * unit, w: sf * unit, h: sf * unit },
        adapter: { x: lpuRight + 0.4 * unit, y: lpuY - h / 2, w: fw * unit, h },
        from: { x: lpuRight, y: lpuY },
        to: { x: fx, y: lpuY },
      }
    } else {
      const first = modules[0]
      const lpuBottom = y0 + modH * unit
      const fy = lpuBottom + (fw + 0.8) * unit
      const wBar = su * unit * 0.9
      fac = {
        box: { x: first.cx - (sf * unit) / 2, y: fy, w: sf * unit, h: sf * unit },
        adapter: { x: first.cx - wBar / 2, y: lpuBottom + 0.4 * unit, w: wBar, h: fw * unit },
        from: { x: first.cx, y: lpuBottom },
        to: { x: first.cx, y: fy },
      }
    }
  }
  const moduleBottom = y0 + modH * unit
  const lowest = Math.max(moduleBottom, fac ? fac.box.y + fac.box.h : 0)
  // the badges: u under the module farthest from the factory (or beside a lone triangular module's LPU), f under the factory; a drawing too narrow for two of them shares one
  const badgeY = moduleBottom + 13
  const badges: MapBadge[] = []
  const lone = tri && modules.length === 1
  const uMod = tri && modules.length > 1 ? modules[modules.length - 1] : modules[0]
  if (fac && drawW < NARROW_PX) badges.push({ key: 'uf', text: 'u, f reported', x: area.x + area.w / 2, y: lowest + 13, anchor: 'middle' })
  else {
    badges.push(lone ? { key: 'u', text: 'u reported', x: uMod.lpu.x + uMod.lpu.w + 8, y: uMod.lpu.y + uMod.lpu.h / 2 + 4, anchor: 'start' } : { key: 'u', text: 'u reported', x: uMod.lpu.x, y: badgeY, anchor: 'start' })
    if (fac) badges.push({ key: 'f', text: 'f reported', x: clamp(fac.box.x + fac.box.w / 2, area.x + 29, area.x + area.w - 29), y: fac.box.y + fac.box.h + 12, anchor: 'middle' })
  }
  return {
    area,
    u: unit,
    modules,
    adapters,
    gap,
    factory: fac,
    numbersY: y0 - 4,
    bottom: lowest,
    badgeY: Math.max(badgeY, ...badges.map((b) => b.y)),
    badges,
    legendY: area.y + area.h - 4 - 13 * (legendRows - 1),
    lines,
    radius: Math.max(0.9, 0.16 * unit),
  }
}

interface Ctx {
  r: ResolvedModuleMap
  g: MapGeometry
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)
const a2 = (v: number): string => v.toFixed(2)

/** A lit part's outline: a bright ring that fades with the light. */
function LitRing({ box, amount, pad = 2.2 }: { box: MapBox; amount: number; pad?: number }) {
  if (amount < 0.02) return null
  return <rect x={box.x - pad} y={box.y - pad} width={box.w + 2 * pad} height={box.h + 2 * pad} rx={2} fill="none" className="fg-state" strokeWidth={1.8} opacity={clamp(amount, 0, 1)} data-lit={a2(amount)} />
}

function ModuleView({ m, c }: { m: MapModule; c: Ctx }) {
  const { r, g } = c
  const i = m.index
  const wired = partAlpha(r, 'wire', i)
  const codeA = partAlpha(r, 'code', i)
  const lpuA = partAlpha(r, 'lpu', i)
  const pivA = partAlpha(r, 'pivot', i)
  const number = i + 1
  const bigEnough = m.code.w >= 34
  const wide = m.lpu.w >= 30
  const cName = `code block of module ${number}: ${r.parts.c} qubits (computed)`
  const lName = `logical processing unit of module ${number}: ${r.parts.u} qubits (reported, Table 1)`
  return (
    <g data-anchor="module" data-module={i} className={fcls(c, 'module')}>
      <g opacity={wired * 0.7}>
        {m.dots.map((d) => (
          <line key={d.q} x1={d.x} y1={m.code.y + m.code.h} x2={d.x} y2={m.lpu.y} className="fg-sil3" strokeWidth={0.6} />
        ))}
      </g>
      <g data-anchor="code" className={fcls(c, 'code')} role="img" aria-label={cName} data-part="code" opacity={codeA}>
        <title>{cName}</title>
        <rect x={m.code.x} y={m.code.y} width={m.code.w} height={m.code.h} className="fg-sil" fill="var(--fg-halo, transparent)" strokeWidth={1.3} />
        <rect x={m.code.x} y={m.code.y} width={m.code.w} height={m.code.h} className="fg-sil-fill" fillOpacity={0.22} stroke="none" />
        {bigEnough && (
          <text x={m.code.x + m.code.w / 2} y={m.code.y + m.code.h / 2 + 4} textAnchor="middle" className="fg-lbl" style={{ fontSize: 11 }}>
            code
          </text>
        )}
      </g>
      <LitRing box={m.code} amount={litAmount(r, 'code', i)} />
      <g data-anchor="lpu" className={fcls(c, 'lpu')} role="img" aria-label={lName} data-part="lpu" data-reported="1" opacity={lpuA}>
        <title>{lName}</title>
        <rect x={m.lpu.x} y={m.lpu.y} width={m.lpu.w} height={m.lpu.h} className="fg-op" fill="var(--fg-halo, transparent)" strokeWidth={1.3} strokeDasharray="3 2" />
        <rect x={m.lpu.x} y={m.lpu.y} width={m.lpu.w} height={m.lpu.h} className="fg-op-fill" fillOpacity={0.2} stroke="none" />
        {wide && (
          <text x={m.lpu.x + m.lpu.w / 2} y={m.lpu.y + m.lpu.h / 2 + 4} textAnchor="middle" className="fg-lbl" style={{ fontSize: 11 }}>
            LPU
          </text>
        )}
      </g>
      <LitRing box={m.lpu} amount={litAmount(r, 'lpu', i)} />
      <g data-anchor="pivot" className={fcls(c, 'pivot')}>
        {m.dots.map((d) => {
          const pivot = d.q === 1
          const seven = d.q === 7
          const a = pivot ? pivA : wired
          const lit = pivot ? litAmount(r, 'pivot', i) : 0
          const name = `logical qubit ${d.q} of module ${number}${pivot ? ' (the pivot)' : seven ? ' (the other qubit of the LPU)' : ''}`
          return (
            <g key={d.q} role="img" aria-label={name} data-wire={d.q} data-part={pivot ? 'pivot' : 'wire'} opacity={a}>
              <title>{name}</title>
              {lit > 0.02 && <circle cx={d.x} cy={d.y} r={g.radius * 2.6 + 1.5} fill="none" className="fg-state" strokeWidth={1.6} opacity={clamp(lit, 0, 1)} data-lit={a2(lit)} />}
              {seven && <circle cx={d.x} cy={d.y} r={g.radius * 1.9 + 0.8} fill="none" className="fg-sil" strokeWidth={Math.max(0.7, g.radius * 0.5)} />}
              <circle cx={d.x} cy={d.y} r={pivot ? g.radius * 1.5 : g.radius} className={pivot ? 'fg-state-fill' : 'fg-sil-fill'} />
            </g>
          )
        })}
      </g>
    </g>
  )
}

function Adapters({ c }: { c: Ctx }) {
  const { r, g } = c
  return (
    <g data-anchor="adapter" className={fcls(c, 'adapter')}>
      {g.adapters.map((ad) => {
        const a = partAlpha(r, 'adapter', ad.after)
        const lit = litAmount(r, 'adapter', ad.after)
        const name = `adapter between module ${ad.after + 1} and module ${ad.after + 2}: ${r.parts.a} qubits (computed)`
        return (
          <g key={ad.after} role="img" aria-label={name} data-part="adapter" data-after={ad.after} opacity={a}>
            <title>{name}</title>
            <line x1={ad.left.x} y1={ad.left.y} x2={ad.right.x} y2={ad.right.y} className="fg-sil" strokeWidth={1} />
            <rect x={ad.box.x} y={ad.box.y} width={ad.box.w} height={ad.box.h} className="fg-state-fill" fillOpacity={0.85} stroke="none" />
            <LitRing box={ad.box} amount={lit} pad={1.8} />
          </g>
        )
      })}
      {g.gap && (
        <g data-gap={g.gap.hidden} opacity={partAlpha(r, 'adapter', -1)}>
          <line x1={g.gap.left.x} y1={g.gap.left.y} x2={g.gap.right.x} y2={g.gap.right.y} className="fg-sil" strokeWidth={1} strokeDasharray="2 3" />
          <text x={g.gap.x + g.gap.w / 2 + 0} y={g.gap.y - 7} textAnchor="middle" className="fg-lbl" style={{ fontSize: 13, fontWeight: 700 }}>
            …
          </text>
          <text x={g.gap.x + g.gap.w / 2} y={g.gap.y + 6} textAnchor="middle" className="fg-lbl" style={{ fontSize: 10 }}>
            {`${g.gap.hidden} more`}
          </text>
        </g>
      )}
    </g>
  )
}

function FactoryView({ c }: { c: Ctx }) {
  const { r, g } = c
  const fac = g.factory
  if (!fac) return null
  const fa = partAlpha(r, 'factory', 0)
  const aa = partAlpha(r, 'fadapter', 0)
  const big = fac.box.w >= 30
  const fName = `T factory: ${r.parts.f} qubits (reported, Table 1)`
  const aName = `code-factory adapter: ${r.parts.aPrime} qubits (computed from the factory's patch distance ${r.parts.dFactory})`
  return (
    <g data-anchor="factory" className={fcls(c, 'factory')}>
      <g role="img" aria-label={aName} data-part="fadapter" opacity={aa}>
        <title>{aName}</title>
        <line x1={fac.from.x} y1={fac.from.y} x2={fac.to.x} y2={fac.to.y} className="fg-sil" strokeWidth={1} />
        <rect x={fac.adapter.x} y={fac.adapter.y} width={fac.adapter.w} height={fac.adapter.h} className="fg-state-fill" fillOpacity={0.85} stroke="none" />
        <LitRing box={fac.adapter} amount={litAmount(r, 'fadapter', 0)} pad={1.8} />
      </g>
      <g role="img" aria-label={fName} data-part="factory" data-reported="1" opacity={fa}>
        <title>{fName}</title>
        <rect x={fac.box.x} y={fac.box.y} width={fac.box.w} height={fac.box.h} className="fg-plus" fill="var(--fg-halo, transparent)" strokeWidth={1.3} strokeDasharray="3 2" />
        <rect x={fac.box.x} y={fac.box.y} width={fac.box.w} height={fac.box.h} className="fg-plus-fill" fillOpacity={0.2} stroke="none" />
        {big && (
          <text x={fac.box.x + fac.box.w / 2} y={fac.box.y + fac.box.h / 2 + 4} textAnchor="middle" className="fg-lbl" style={{ fontSize: 11 }}>
            T
          </text>
        )}
        <LitRing box={fac.box} amount={litAmount(r, 'factory', 0)} />
      </g>
    </g>
  )
}

/** The module numbers above the code blocks, and the "reported" badges (u under an LPU, f under the factory). */
function Labels({ c }: { c: Ctx }) {
  const { g } = c
  const mods = g.modules
  // a number only where it fits (a module slot of at least 14 px), always the first and the last
  const pitch = mods.length > 1 ? Math.min(...mods.slice(1).map((m, k) => m.cx - mods[k].cx)) : 99
  return (
    <g data-anchor="readout" className={fcls(c, 'readout')}>
      {mods.map((m, k) => {
        const show = pitch >= 14 || k === 0 || k === mods.length - 1
        return show ? (
          <text key={m.index} x={m.cx} y={g.numbersY} textAnchor="middle" className="fg-lbl" style={{ fontSize: 10 }} data-module-label={m.index + 1}>
            {m.index + 1}
          </text>
        ) : null
      })}
      {g.badges.map((b) => (
        <text key={b.key} x={b.x} y={b.y} textAnchor={b.anchor} className="fg-lbl" style={{ fontSize: 10, fontStyle: 'italic' }} data-badge={b.key}>
          {b.text}
        </text>
      ))}
    </g>
  )
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  let x = 0
  let row = 0
  return (
    <g data-legend="module-map">
      {legendItems(r).map((it, i) => {
        if (x > 0 && x + it.w - 10 > g.area.w) {
          row++
          x = 0
        }
        const at = g.area.x + x
        x += it.w
        return <g key={i}>{it.node(at, g.legendY + 13 * row)}</g>
      })}
    </g>
  )
}

export function ModuleMapScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'module-map'>) {
  const own = mode === 'print' || !!bare
  const g = moduleMapGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, focus }
  const summary = moduleMapSummary(r)
  return (
    <g className="svgk-scene" data-kind="module-map" data-code={r.machine.code} data-layout={r.machine.layout} data-modules={r.machine.M} data-highlight={r.highlight}>
      <title>{summary}</title>
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {`${r.machine.code} code · ${r.machine.M} module${r.machine.M === 1 ? '' : 's'}`}
        </text>
      )}
      <Adapters c={c} />
      {g.modules.map((m) => (
        <ModuleView key={m.index} m={m} c={c} />
      ))}
      <FactoryView c={c} />
      <Labels c={c} />
      <Legend c={c} />
    </g>
  )
}

