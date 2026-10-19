/**
 * `wavefunction` (SVG; W-448 L12): a complex function along a line, the position panel ψ(x) and the momentum panel φ(p) of the same state
 * (Lectures 12 and 13). Content writes only INPUTS (the source, how it is moved, which curves, cells, interval and readouts); this resolver draws
 * every sample, scale, moment and chance from the one engine (physics/wave.ts: the packet on its FFT grid, the analytic plane waves), so the
 * story and any Try-it cannot disagree. ħ = m = 1: lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ.
 *
 * Operations apply in the order boost → shift → time. Boost and shift act on the position grid / in k-space; shift and time are both functions of p̂
 * alone, so they are done in ONE transform pair. Interpolation (stage/interp.ts): σ, x₀, p₀, the plane momenta, boost, shift, time and the
 * interval's ends lerp (a sweep is never wrapped or snapped); a change of source or panels switches at the half-way point; the cells fade in or out
 * (a bar chart that fuses into the curve is a cross-fade of two pictures of the same density). Every output is recomputed from the interpolated inputs.
 * Lazy chunk (stage/svg/kinds.ts).
 */
import type { Scrub, WavefunctionState } from '../../content/stage'
import { WAVEFUNCTION_CELLS, WAVEFUNCTION_OVERLAYS, WAVEFUNCTION_PANELS, WAVEFUNCTION_READOUTS, WAVEFUNCTION_SHOW } from '../../content/stage'
import {
  GRID, type Wave, boost as boostWave, boxEnergy, boxPairEnergy, boxState, densitySpline, meanX, momentumMoments, norm, pOp, packet, peakDensity, planeSamples, shiftAndEvolve,
  spreadX, toMomentum, windowIndices, xTimes,
} from '../../physics/wave'
import { scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedWavefunction, WaveCurve, WavefunctionInputs, WavefunctionSourceInputs, WavefunctionStats } from '../types'
import { fix } from './draw'

/** Validation limits (the grid is [−32, 32): a packet must stay clear of its periodic edge). */
export const WAVEFUNCTION_LIMITS = {
  sigmaMin: 1 / 8,
  sigmaMax: 4,
  x0Max: 6,
  p0Max: 6,
  pMax: 8,
  boostMax: 6,
  shiftMax: 8,
  timeMax: 8,
  windowMax: 16,
  /** the packet's centre plus five of its widths must stay inside this |x| */
  edge: 28,
} as const

/** The walls of a `box` source: width 2 to 16, levels 1 to 8. */
const L_BOX = { min: 2, max: 16, nMax: 8 } as const
const DEFAULT_WINDOW = { x: [-8, 8] as [number, number], p: [-8, 8] as [number, number] }
const MAX_POINTS = 520

/* ------------------------------------------------ inputs ------------------------------------------------ */
export function wavefunctionInputs(st: WavefunctionState, s: number): WavefunctionInputs {
  const src = st.source
  let source: WavefunctionSourceInputs
  if ('packet' in src) source = { kind: 'packet', x0: scrub(src.packet.x0, s), sigma: scrub(src.packet.sigma, s), p0: src.packet.p0 === undefined ? 0 : scrub(src.packet.p0, s) }
  else if ('plane' in src) source = { kind: 'plane', p: src.plane.p }
  else if ('box' in src) source = { kind: 'box', L: src.box.L, n: typeof src.box.n === 'number' ? src.box.n : [src.box.n[0], src.box.n[1]] }
  else source = { kind: 'twoWaves', p1: src.twoWaves.p1, p2: src.twoWaves.p2 }
  return {
    source,
    boost: st.boost === undefined ? 0 : scrub(st.boost, s),
    shift: st.shift === undefined ? 0 : scrub(st.shift, s),
    time: st.time === undefined ? 0 : scrub(st.time, s),
    panels: [...(st.panels ?? ['position'])],
    show: [...(st.show ?? ['re', 'im', 'density'])],
    overlay: [...(st.overlay ?? [])],
    cells: st.cells ?? null,
    cellsAlpha: 1,
    interval: st.interval ? [st.interval[0], st.interval[1]] : null,
    window: { x: st.window?.x ?? (source.kind === 'box' ? [-1, source.L + 1] : DEFAULT_WINDOW.x), p: st.window?.p ?? DEFAULT_WINDOW.p },
    readouts: [...(st.readouts ?? [])],
    shot: st.shot,
  }
}

/* ------------------------------------------------ sampling ------------------------------------------------ */
const phaseOf = (re: number, im: number): number => Math.atan2(im, re)

function curveFrom(x: ArrayLike<number>, re: ArrayLike<number>, im: ArrayLike<number>): WaveCurve {
  const n = x.length
  const out: WaveCurve = { x: Array.from(x), re: Array.from(re), im: Array.from(im), density: new Array(n), phase: new Array(n) }
  for (let j = 0; j < n; j++) {
    out.density[j] = re[j] * re[j] + im[j] * im[j]
    out.phase[j] = phaseOf(re[j], im[j])
  }
  return out
}

/** Sample a grid wave over the position window. */
function sampleGrid(w: Wave, lo: number, hi: number): WaveCurve {
  const idx = windowIndices(GRID, lo, hi, MAX_POINTS)
  return curveFrom(idx.map((j) => GRID.x[j]), idx.map((j) => w.re[j]), idx.map((j) => w.im[j]))
}

/** The positions of a plane-wave drawing: an even spacing over the window (the analytic samples need no grid). */
function planeXs(lo: number, hi: number): number[] {
  const n = 513 // 512 equal steps: x = 0 is a sample whenever the window is symmetric
  return Array.from({ length: n }, (_, j) => lo + ((hi - lo) * j) / (n - 1))
}

const planeMomenta = (src: WavefunctionSourceInputs): number[] => (src.kind === 'plane' ? [src.p] : src.kind === 'twoWaves' ? [src.p1, src.p2] : [])

/** The final centre and width of a packet after the boost, shift and time (closed forms, used only to validate the periodic box). */
export function packetReach(x0: number, sigma: number, p0: number, boost: number, shift: number, time: number): number {
  const centre = x0 + shift + (p0 + boost) * time
  const width = sigma * Math.sqrt(1 + (time / (2 * sigma * sigma)) ** 2)
  return Math.abs(centre) + 5 * width
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function wavefunctionFrom(inp: WavefunctionInputs): ResolvedWavefunction {
  const [xlo, xhi] = inp.window.x
  const [plo, phi] = inp.window.p
  const wantP = inp.panels.includes('momentum')
  const src = inp.source
  const stats: WavefunctionStats = { norm: null, xmean: null, xspread: null, pmean: null, pspread: null, product: null, interval: null, peak: null, cell: null, wavelength: null, energy: null }
  let position: WaveCurve
  let momentum: WaveCurve | null = null
  let momentumSpikes: number[] | null = null
  let original: WaveCurve | null = null
  let xpsi: ResolvedWavefunction['xpsi'] = null
  let ppsi: ResolvedWavefunction['ppsi'] = null
  let cells: ResolvedWavefunction['cells'] = null
  let intervalOut: [number, number] | null = inp.interval
  let walls: [number, number] | null = null
  const scale = { amp: 1, dens: 1, ampP: 1, densP: 1 }

  if (src.kind === 'packet' || src.kind === 'box') {
    // a packet moves freely (boost, shift, time); a box state keeps its levels and only turns each by its own phase e^{-iE_n t} (boost, shift and overlays are refused)
    const w0 = src.kind === 'packet' ? packet(GRID, { x0: src.x0, sigma: src.sigma, p0: src.p0 }) : boxState(GRID, src.L, src.n, 0)
    let w: Wave
    if (src.kind === 'packet') {
      w = inp.boost !== 0 ? boostWave(w0, GRID, inp.boost) : w0
      if (inp.shift !== 0 || inp.time !== 0) w = shiftAndEvolve(w, GRID, inp.shift, inp.time)
    } else {
      w = inp.time !== 0 ? boxState(GRID, src.L, src.n, inp.time) : w0
      stats.energy = typeof src.n === 'number' ? boxEnergy(src.L, src.n) : boxPairEnergy(src.L, src.n[0], src.n[1])
      walls = [0, src.L]
    }
    position = sampleGrid(w, xlo, xhi)
    if (inp.overlay.includes('original')) original = sampleGrid(w0, xlo, xhi)
    if (inp.overlay.includes('xpsi')) {
      const q = xTimes(w, GRID)
      const c = sampleGrid(q, xlo, xhi)
      xpsi = { re: c.re, im: c.im }
    }
    if (inp.overlay.includes('ppsi')) {
      const q = pOp(w, GRID)
      const c = sampleGrid(q, xlo, xhi)
      ppsi = { re: c.re, im: c.im }
    }
    stats.norm = norm(w, GRID)
    stats.xmean = meanX(w, GRID)
    stats.xspread = spreadX(w, GRID)
    const pm = momentumMoments(w, GRID)
    stats.pmean = pm.mean
    stats.pspread = pm.spread
    stats.product = stats.xspread * stats.pspread
    stats.peak = peakDensity(w)
    const needChances = inp.interval !== null || inp.cells !== null || inp.readouts.includes('interval') || inp.readouts.includes('cell')
    if (needChances) {
      const sp = densitySpline(w, GRID)
      if (inp.interval) stats.interval = sp.integral(inp.interval[0], inp.interval[1])
      if (inp.cells !== null) {
        const n = inp.cells
        const cw = (xhi - xlo) / n
        const chances: number[] = []
        for (let i = 0; i < n; i++) chances.push(sp.integral(xlo + i * cw, xlo + (i + 1) * cw))
        cells = { n, chances, alpha: inp.cellsAlpha }
        stats.cell = { width: cw, chance: sp.integral(0, cw), perLength: sp.integral(0, cw) / cw }
      }
    }
    if (wantP) {
      const m = toMomentum(w, GRID)
      const idx: number[] = []
      for (let i = 0; i < m.p.length; i++) if (m.p[i] >= plo - 1e-9 && m.p[i] <= phi + 1e-9) idx.push(i)
      const stride = Math.max(1, Math.ceil(idx.length / MAX_POINTS))
      const pick = idx.filter((_, k) => k % stride === 0)
      momentum = curveFrom(pick.map((i) => m.p[i]), pick.map((i) => m.phi.re[i]), pick.map((i) => m.phi.im[i]))
    }
    // the scales come from the UNMOVED source: spreading in time then shows as a lower, wider curve
    if (src.kind === 'packet') {
      scale.amp = Math.pow(2 * Math.PI * src.sigma * src.sigma, -0.25)
      scale.dens = 1 / (src.sigma * Math.sqrt(2 * Math.PI))
    } else {
      // the tallest a level (the root of 2/L) or an equal pair (root 2 times that, the two crests together) can be
      const pair = typeof src.n !== 'number'
      scale.amp = Math.sqrt(2 / src.L) * (pair ? Math.SQRT2 : 1)
      scale.dens = (pair ? 4 : 2) / src.L
    }
  } else {
    const xs = planeXs(xlo, xhi)
    const opts = { boost: inp.boost, shift: inp.shift, time: inp.time }
    const w = planeSamples(xs, planeMomenta(src), opts)
    position = curveFrom(xs, w.re, w.im)
    const ps = planeMomenta(src).map((p) => p + inp.boost)
    if (inp.overlay.includes('xpsi')) xpsi = { re: position.re.map((v, j) => v * xs[j]), im: position.im.map((v, j) => v * xs[j]) }
    if (inp.overlay.includes('ppsi')) {
      // p̂ acts on each plane component: its momentum times its own amplitude
      const parts = planeMomenta(src).map((p) => planeSamples(xs, [p], opts))
      const amp = 1 / Math.sqrt(parts.length)
      ppsi = {
        re: xs.map((_, j) => parts.reduce((a, q, k) => a + amp * ps[k] * q.re[j], 0)),
        im: xs.map((_, j) => parts.reduce((a, q, k) => a + amp * ps[k] * q.im[j], 0)),
      }
    }
    if (src.kind === 'plane') {
      stats.pmean = ps[0]
      stats.pspread = 0
      stats.wavelength = ps[0] === 0 ? null : (2 * Math.PI) / Math.abs(ps[0])
      scale.amp = 1
      scale.dens = 1
    } else {
      stats.pmean = (ps[0] + ps[1]) / 2
      stats.pspread = Math.abs(ps[1] - ps[0]) / 2
      scale.amp = Math.SQRT2
      scale.dens = 2
    }
    if (wantP) momentumSpikes = ps
    intervalOut = null
  }

  // a shown overlay may reach beyond ψ itself (x̂ψ grows with x): the amplitude scale covers it, so every curve is on ONE scale
  const reach = (a: { re: number[]; im: number[] } | null) => (a ? Math.max(...a.re.map(Math.abs), ...a.im.map(Math.abs)) : 0)
  scale.amp = Math.max(scale.amp, reach(xpsi), reach(ppsi))
  if (momentum) {
    scale.ampP = Math.max(...momentum.re.map(Math.abs), ...momentum.im.map(Math.abs), 1e-12)
    scale.densP = Math.max(...momentum.density, 1e-12)
  }

  return {
    kind: 'wavefunction',
    source: src,
    boost: inp.boost,
    shift: inp.shift,
    time: inp.time,
    panels: inp.panels,
    show: inp.show,
    overlay: inp.overlay,
    window: inp.window,
    position,
    momentum,
    momentumSpikes,
    original,
    xpsi,
    ppsi,
    cells,
    interval: intervalOut,
    scale,
    stats,
    readouts: inp.readouts,
    inputs: inp,
    walls,
    shot: inp.shot,
  }
}

export function resolveWavefunctionStage(st: WavefunctionState, s: number): ResolvedWavefunction {
  return wavefunctionFrom(wavefunctionInputs(st, s))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

function lerpSource(a: WavefunctionSourceInputs, b: WavefunctionSourceInputs, t: number): WavefunctionSourceInputs {
  if (a.kind === 'packet' && b.kind === 'packet') return { kind: 'packet', x0: lerp(a.x0, b.x0, t), sigma: lerp(a.sigma, b.sigma, t), p0: lerp(a.p0, b.p0, t) }
  if (a.kind === 'plane' && b.kind === 'plane') return { kind: 'plane', p: lerp(a.p, b.p, t) }
  if (a.kind === 'twoWaves' && b.kind === 'twoWaves') return { kind: 'twoWaves', p1: lerp(a.p1, b.p1, t), p2: lerp(a.p2, b.p2, t) }
  if (a.kind === 'box' && b.kind === 'box' && JSON.stringify(a.n) === JSON.stringify(b.n)) return { kind: 'box', L: lerp(a.L, b.L, t), n: a.n }
  return pick(a, b, t)
}

export function interpWavefunctionStage(a: ResolvedWavefunction, b: ResolvedWavefunction, t: number): ResolvedWavefunction {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs
  const B = b.inputs
  const d = pick(A, B, t)
  // the bars fade in or out when the cells appear or go; a change between two counts switches at the half-way point
  let cells = d.cells
  let cellsAlpha = d.cellsAlpha
  if (A.cells !== null && B.cells === null) {
    cells = A.cells
    cellsAlpha = 1 - t
  } else if (A.cells === null && B.cells !== null) {
    cells = B.cells
    cellsAlpha = t
  }
  const interval: [number, number] | null = A.interval && B.interval ? [lerp(A.interval[0], B.interval[0], t), lerp(A.interval[1], B.interval[1], t)] : d.interval
  return wavefunctionFrom({
    ...d,
    source: lerpSource(A.source, B.source, t),
    boost: lerp(A.boost, B.boost, t),
    shift: lerp(A.shift, B.shift, t),
    time: lerp(A.time, B.time, t),
    cells,
    cellsAlpha,
    interval,
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const scrubFinite = (v: Scrub): boolean => (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
const scrubEnds = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])
const isCell = (n: unknown): boolean => (WAVEFUNCTION_CELLS as readonly unknown[]).includes(n)

export function validateWavefunctionStage(st: WavefunctionState): string[] {
  const errs: string[] = []
  const L = WAVEFUNCTION_LIMITS
  const src = st.source as unknown as Record<string, unknown> | undefined
  const kinds = src ? ['packet', 'plane', 'twoWaves', 'box'].filter((k) => k in src) : []
  if (kinds.length !== 1) {
    errs.push("wavefunction source: exactly one of 'packet', 'plane', 'twoWaves' and 'box'")
    return errs
  }
  const limit = (name: string, v: Scrub | undefined, max: number, lo = -max) => {
    if (v === undefined) return
    if (!scrubFinite(v)) errs.push(`wavefunction ${name}: non-finite`)
    else for (const x of scrubEnds(v)) if (x < lo - 1e-12 || x > max + 1e-12) errs.push(`wavefunction ${name}: between ${lo} and ${max} (got ${x})`)
  }
  limit('boost', st.boost, L.boostMax)
  limit('shift', st.shift, L.shiftMax)
  limit('time', st.time, L.timeMax, 0)
  const kind = kinds[0]
  if ('packet' in st.source) {
    const { x0, sigma, p0 } = st.source.packet
    limit('packet sigma', sigma, L.sigmaMax, L.sigmaMin)
    limit('packet x0', x0, L.x0Max)
    limit('packet p0', p0, L.p0Max)
    // a packet that wraps round the periodic box would draw a false picture: keep its centre and five widths inside |x| ≤ edge
    if ([x0, sigma, p0 ?? 0, st.boost ?? 0, st.shift ?? 0, st.time ?? 0].every(scrubFinite)) {
      const ends = (v: Scrub | undefined) => (v === undefined ? [0] : scrubEnds(v))
      for (const a of ends(x0)) for (const sg of ends(sigma)) for (const pp of ends(p0)) for (const b of ends(st.boost)) for (const sh of ends(st.shift)) for (const tm of ends(st.time))
        if (packetReach(a, sg, pp, b, sh, tm) > L.edge) errs.push(`wavefunction packet: with x0 ${a}, sigma ${sg}, p0 ${pp}, boost ${b}, shift ${sh}, time ${tm} the packet reaches the edge of the periodic box (centre + 5 widths must stay within ±${L.edge})`)
    }
  } else if ('box' in st.source) {
    const { L, n } = st.source.box
    const levels = typeof n === 'number' ? [n] : Array.isArray(n) && n.length === 2 ? [n[0], n[1]] : []
    if (!(Number.isFinite(L) && L >= L_BOX.min && L <= L_BOX.max)) errs.push(`wavefunction box L: between ${L_BOX.min} and ${L_BOX.max} (got ${L})`)
    if (!levels.length || !levels.every((m) => Number.isInteger(m) && m >= 1 && m <= L_BOX.nMax)) errs.push(`wavefunction box n: a whole number from 1 to ${L_BOX.nMax}, or a pair of two such numbers`)
    else if (levels.length === 2 && levels[0] === levels[1]) errs.push('wavefunction box n: the two levels of a pair must differ')
    for (const [name, v] of [['boost', st.boost], ['shift', st.shift]] as const)
      if (v !== undefined) errs.push(`wavefunction ${name}: a box source takes no ${name} (the walls fix its momentum content); use 'time' to turn each level by its own phase`)
  } else if ('plane' in st.source) {
    if (!Number.isFinite(st.source.plane.p) || Math.abs(st.source.plane.p) > L.pMax) errs.push(`wavefunction plane p: at most ±${L.pMax}`)
  } else {
    const { p1, p2 } = st.source.twoWaves
    if (![p1, p2].every((p) => Number.isFinite(p) && Math.abs(p) <= L.pMax)) errs.push(`wavefunction twoWaves: p1 and p2 at most ±${L.pMax}`)
    else if (p1 === p2) errs.push('wavefunction twoWaves: p1 and p2 must differ')
  }
  const panels = st.panels ?? ['position']
  if (!panels.length || new Set(panels).size !== panels.length || !panels.every((p) => (WAVEFUNCTION_PANELS as readonly string[]).includes(p)))
    errs.push(`wavefunction panels: a non-empty list of ${WAVEFUNCTION_PANELS.map((p) => `'${p}'`).join(', ')}, each once`)
  const show = st.show ?? ['re', 'im', 'density']
  if (!show.length || new Set(show).size !== show.length || !show.every((p) => (WAVEFUNCTION_SHOW as readonly string[]).includes(p)))
    errs.push(`wavefunction show: a non-empty list of ${WAVEFUNCTION_SHOW.map((p) => `'${p}'`).join(', ')}, each once`)
  const overlay = st.overlay ?? []
  for (const o of overlay) if (!(WAVEFUNCTION_OVERLAYS as readonly string[]).includes(o)) errs.push(`wavefunction overlay: unknown "${o}"`)
  if (new Set(overlay).size !== overlay.length) errs.push('wavefunction overlay: each once')
  const hasPos = panels.includes('position')
  if (overlay.length && !hasPos) errs.push("wavefunction overlay: needs the 'position' panel")
  if (st.cells !== undefined && !hasPos) errs.push("wavefunction cells: needs the 'position' panel")
  if (st.interval !== undefined && !hasPos) errs.push("wavefunction interval: needs the 'position' panel")
  if (st.cells !== undefined && !isCell(st.cells)) errs.push(`wavefunction cells: one of ${WAVEFUNCTION_CELLS.join(', ')}`)
  const win = { x: st.window?.x ?? DEFAULT_WINDOW.x, p: st.window?.p ?? DEFAULT_WINDOW.p }
  for (const [name, w] of [['x', win.x], ['p', win.p]] as const) {
    if (!(Number.isFinite(w[0]) && Number.isFinite(w[1]) && w[0] < w[1] && Math.abs(w[0]) <= L.windowMax && Math.abs(w[1]) <= L.windowMax)) errs.push(`wavefunction window.${name}: a < b within ±${L.windowMax}`)
  }
  if (st.interval !== undefined) {
    const [a, b] = st.interval
    if (!(Number.isFinite(a) && Number.isFinite(b) && a < b && a >= win.x[0] && b <= win.x[1])) errs.push('wavefunction interval: a < b inside the position window')
  }
  if (kind === 'box') {
    if (st.cells !== undefined) errs.push('wavefunction cells: a box source takes no cells')
    if (st.interval !== undefined) errs.push('wavefunction interval: a box source takes no interval')
    if (overlay.length) errs.push('wavefunction overlay: a box source takes no overlay')
  }
  if (kind !== 'packet' && kind !== 'box') {
    if (st.cells !== undefined) errs.push('wavefunction cells: a plane or two-wave source cannot be chopped into cells (it is not normalisable)')
    if (st.interval !== undefined) errs.push('wavefunction interval: a plane or two-wave source has no chance in a stretch (it is not normalisable)')
    if (overlay.includes('original')) errs.push("wavefunction overlay 'original': a plane or two-wave source takes no 'original'")
  }
  const readouts = st.readouts ?? []
  for (const r of readouts) {
    if (!(WAVEFUNCTION_READOUTS as readonly string[]).includes(r)) {
      errs.push(`wavefunction readouts: unknown "${r}"`)
      continue
    }
    if (kind !== 'packet' && kind !== 'box' && !['pmean', 'pspread', 'wavelength'].includes(r)) errs.push(`wavefunction readouts: "${r}" needs a packet source (a plane wave is not normalisable)`)
    if (kind === 'box' && ['interval', 'cell', 'wavelength'].includes(r)) errs.push(`wavefunction readouts: "${r}" is not defined for a box source`)
    if (r === 'energy' && kind !== 'box') errs.push("wavefunction readouts: 'energy' needs a box source")
    if (r === 'wavelength' && kind !== 'plane') errs.push("wavefunction readouts: 'wavelength' needs a plane source")
    if (r === 'interval' && st.interval === undefined) errs.push("wavefunction readouts: 'interval' needs an interval")
    if (r === 'cell' && st.cells === undefined) errs.push("wavefunction readouts: 'cell' needs cells")
  }
  if (new Set(readouts).size !== readouts.length) errs.push('wavefunction readouts: each once')
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** Three significant figures (a chance of 0.0125 must not read 0.013): trailing zeros dropped, a typographic minus. */
const sig3 = (x: number): string => (Number.isFinite(x) ? String(Number(x.toPrecision(3))).replace('-', '−') : '?')

export function wavefunctionReadouts(r: ResolvedWavefunction): SvgReadout[] {
  const s = r.stats
  const out: SvgReadout[] = []
  const put = (name: string, text: string) => out.push({ name, text })
  for (const name of r.readouts) {
    switch (name) {
      case 'norm':
        if (s.norm !== null) put(name, `∫|ψ|²dx = ${fix(s.norm, 3)}`)
        break
      case 'xmean':
        if (s.xmean !== null) put(name, `⟨x⟩ = ${fix(s.xmean, 2)} ℓ`)
        break
      case 'xspread':
        if (s.xspread !== null) put(name, `Δx = ${fix(s.xspread, 2)} ℓ`)
        break
      case 'pmean':
        if (s.pmean !== null) put(name, `⟨p⟩ = ${fix(s.pmean, 2)} ħ/ℓ`)
        break
      case 'pspread':
        if (s.pspread !== null) put(name, `Δp = ${fix(s.pspread, 2)} ħ/ℓ`)
        break
      case 'product':
        if (s.product !== null) put(name, `ΔxΔp = ${fix(s.product, 3)} ħ`)
        break
      case 'interval':
        if (s.interval !== null && r.interval) put(name, `P(${fix(r.interval[0], 2)} < x < ${fix(r.interval[1], 2)}) = ${fix(s.interval, 3)}`)
        break
      case 'peak':
        if (s.peak !== null) put(name, `max |ψ|² = ${fix(s.peak, 3)} per ℓ`)
        break
      case 'cell':
        if (s.cell) put(name, `cell [0, ${fix(s.cell.width, 3)}): ${sig3(s.cell.chance)}`)
        break
      case 'wavelength':
        if (s.wavelength !== null) put(name, `λ = 2π/p = ${fix(s.wavelength, 2)} ℓ`)
        break
      case 'energy':
        if (s.energy !== null) put(name, `${r.source.kind === 'box' && typeof r.source.n !== 'number' ? '⟨E⟩' : 'E'} = ${fix(s.energy, 3)} ħ²/mℓ²`)
        break
    }
  }
  // the cell's second line: chance ÷ width, the density the bars approach
  if (s.cell && r.readouts.includes('cell')) put('cellDensity', `  = ${sig3(s.cell.perLength)} per ℓ`)
  return out
}
