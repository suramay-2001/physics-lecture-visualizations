/**
 * `camera-frame` (SVG; GANDALF platform G2, P-optics-experiment-track §7 and P-B5-story §9.2): one simulated grey-level frame of a tweezer array. Content writes only INPUTS (the
 * pixel grid, the atoms, the photons per atom, the point spread function, the background, the noise model and its seed, the ROI and the panels); this resolver takes every grey level
 * from physics/optics/imaging.ts (`cameraFrame`: the mean photons per pixel, then ONE seeded draw; `filterWeights`; `wienerSmooth`), so the picture cannot disagree with the engine and the
 * same seed always draws the same frame. It is a simulation, never a measurement (the passport and the fidelity notes say so). Lazy chunk (stage/svg/kinds.ts); fidelity `camera-frame-*`.
 */
import { CAMERA_FRAME_FILTERS, CAMERA_FRAME_NOISE, CAMERA_FRAME_READOUTS, CAMERA_FRAME_SHOW, type CameraFrameState } from '../../content/stage'
import { cameraFrame, filterWeights, psfShare, randomBits, sitesFromBits, wienerSmooth, type FrameFilter } from '../../physics/optics/imaging'
import { populationFilter, receptiveField } from '../../physics/readout/classify'
import type { SvgReadout } from '../svgKinds'
import type { CameraFrameInputs, CameraFramePanel, ResolvedCameraFrame } from '../types'
import { fix } from './draw'

export const CAMERA_FRAME_LIMITS = { rows: [1, 12], cols: [1, 12], photons: [0, 200], psf: [0.3, 1.5], background: [0, 5], gain: [1, 1000], sigma: [0, 100], roi: [1, 5], sites: 16, panels: 3, defaultRoi: 3 } as const
export const CAMERA_LAYER_LIMITS = { count: 6, kernel: [1, 7] } as const
export const CAMERA_FRAME_DEFAULTS = { photons: 20, psf: 0.8, background: 0, seed: 1 } as const
const FIELDS = ['kind', 'rows', 'cols', 'occupancy', 'sites', 'photons', 'psf', 'background', 'noise', 'gain', 'sigma', 'seed', 'roi', 'show', 'panels', 'panel', 'denoise', 'layers', 'readouts', 'shot'] as const

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const inRange = (x: unknown, r: readonly [number, number]): x is number => isNum(x) && x >= r[0] && x <= r[1]

type PanelShow = CameraFrameInputs['panels'][number]['show']
const canon = (s: (typeof CAMERA_FRAME_SHOW)[number]): PanelShow => (s === 'truth' ? 'occupancy' : s)

export function cameraFrameInputs(st: CameraFrameState): CameraFrameInputs {
  const noise = st.noise ?? 'none'
  let bits: string
  if (st.sites) bits = ''
  else if (typeof st.occupancy === 'string') bits = st.occupancy
  else if (st.occupancy) bits = randomBits(st.rows, st.cols, st.occupancy.p, st.occupancy.seed)
  else bits = ''
  const sites = st.sites ? st.sites.map(([r, c]) => ({ r, c })) : bits ? sitesFromBits(st.rows, st.cols, bits) : []
  const roi = st.roi === undefined || st.roi === false ? null : st.roi === true ? CAMERA_FRAME_LIMITS.defaultRoi : st.roi.size
  const denoise = st.denoise ?? 'none'
  const panels: CameraFrameInputs['panels'] = st.panel ? st.panel.map((p) => ({ show: canon(p.show), filter: p.filter ?? null })) : [{ show: st.show ? canon(st.show) : noise === 'none' ? 'photons' : 'counts', filter: null }]
  return {
    rows: st.rows,
    cols: st.cols,
    sites,
    photons: st.photons ?? CAMERA_FRAME_DEFAULTS.photons,
    psf: st.psf ?? CAMERA_FRAME_DEFAULTS.psf,
    background: st.background ?? CAMERA_FRAME_DEFAULTS.background,
    noise,
    gain: st.gain ?? null,
    sigma: st.sigma ?? null,
    seed: st.seed ?? CAMERA_FRAME_DEFAULTS.seed,
    roi,
    panels,
    denoise,
    layers: st.layers ? [...st.layers] : [],
    readouts: st.readouts ? [...st.readouts] : ['atoms'],
    shot: st.shot,
  }
}

const roiBox = (inp: CameraFrameInputs): { r0: number; c0: number; size: number } | null => {
  if (inp.roi === null || inp.sites.length === 0) return null
  const half = Math.floor(inp.roi / 2)
  const r0 = Math.max(0, Math.min(inp.rows - inp.roi, Math.round(inp.sites[0].r) - half))
  const c0 = Math.max(0, Math.min(inp.cols - inp.roi, Math.round(inp.sites[0].c) - half))
  return { r0, c0, size: Math.min(inp.roi, inp.rows, inp.cols) }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function cameraFrameFrom(inp: CameraFrameInputs): ResolvedCameraFrame {
  const f = cameraFrame({ rows: inp.rows, cols: inp.cols, sites: inp.sites, photons: inp.photons, psf: inp.psf, background: inp.background, noise: inp.noise, gain: inp.gain ?? undefined, sigma: inp.sigma ?? undefined, seed: inp.seed })
  const roi = roiBox(inp)
  const n = inp.rows * inp.cols
  const gainScale = inp.noise === 'emccd' ? (inp.gain ?? 1) : 1
  const panels: CameraFramePanel[] = inp.panels.map((p): CameraFramePanel => {
    if (p.show === 'occupancy') {
      const values = new Array<number>(n).fill(0)
      for (const s of inp.sites) values[Math.round(s.r) * inp.cols + Math.round(s.c)] = 1
      return { show: 'occupancy', filter: null, title: 'atoms', unit: 'atom', values, lo: 0, hi: 1 }
    }
    if (p.show === 'photons') return { show: 'photons', filter: null, title: 'photons', unit: 'photons per pixel', values: f.means, lo: 0, hi: Math.max(1e-9, ...f.means) }
    if (p.show === 'counts') {
      const unit = inp.noise === 'emccd' ? 'counts per pixel' : inp.noise === 'poisson' ? 'photons per pixel' : 'photons per pixel'
      return { show: 'counts', filter: null, title: inp.noise === 'none' ? 'means' : 'counts', unit, values: f.counts, lo: Math.min(0, ...f.counts), hi: Math.max(1e-9, ...f.counts) }
    }
    if (p.show === 'weights') {
      const values = new Array<number>(n).fill(0)
      if (roi && p.filter === 'learned') {
        // the population least-squares filter of the first atom among all the atoms (each present with chance ½), over the ROI pixels; scaled so the largest weight is 1
        const profile = (s: { r: number; c: number }): number[] => {
          const out: number[] = []
          for (let i = 0; i < roi.size; i++) for (let j = 0; j < roi.size; j++) out.push(inp.photons * psfShare(roi.r0 + i, s.r, inp.psf) * psfShare(roi.c0 + j, s.c, inp.psf))
          return out
        }
        const w = populationFilter(inp.sites.map(profile), 0, 0.5, inp.background)
        const top = Math.max(1e-12, ...w.map(Math.abs))
        for (let i = 0; i < roi.size; i++) for (let j = 0; j < roi.size; j++) values[(roi.r0 + i) * inp.cols + roi.c0 + j] = w[i * roi.size + j] / top
        return { show: 'weights', filter: p.filter, title: 'weights · learned', unit: 'relative weight', values, lo: Math.min(0, ...values), hi: Math.max(1e-9, ...values) }
      }
      if (roi) {
        const w = filterWeights(p.filter as FrameFilter, roi.size, inp.psf, inp.photons, inp.background)
        for (let i = 0; i < roi.size; i++) for (let j = 0; j < roi.size; j++) values[(roi.r0 + i) * inp.cols + roi.c0 + j] = w[i * roi.size + j]
      }
      return { show: 'weights', filter: p.filter, title: `weights · ${p.filter}`, unit: 'weight', values, lo: 0, hi: Math.max(1e-9, ...values) }
    }
    if (p.show === 'rf') {
      // the receptive field of one output of the stack: a box of side r centred on the first atom (or the frame's middle), clipped to the frame
      const r = receptiveField(inp.layers.map((k) => ({ k, stride: 1 })))
      const cr = inp.sites.length ? Math.round(inp.sites[0].r) : Math.floor(inp.rows / 2)
      const cc = inp.sites.length ? Math.round(inp.sites[0].c) : Math.floor(inp.cols / 2)
      const half = (r - 1) / 2
      const values = new Array<number>(n).fill(0)
      for (let i = 0; i < inp.rows; i++) for (let j = 0; j < inp.cols; j++) if (Math.abs(i - cr) <= half && Math.abs(j - cc) <= half) values[i * inp.cols + j] = 1
      return { show: 'rf', filter: null, title: `receptive field · ${r}×${r}`, unit: 'seen by one output', values, lo: 0, hi: 1 }
    }
    // denoised: a Wiener smoother (known PSF, white noise) on the counts; the signal and noise powers come from the same inputs
    const A = gainScale * inp.photons
    const mbar = f.means.reduce((a, b) => a + b, 0) / n
    const v = inp.noise === 'none' ? 1e-9 : inp.noise === 'poisson' ? mbar : 2 * mbar * gainScale * gainScale + (inp.sigma ?? 0) ** 2
    const values = wienerSmooth(f.counts, inp.rows, inp.cols, inp.psf, Math.max(1e-9, inp.sites.length * A * A), n * v)
    return { show: 'denoised', filter: null, title: 'Wiener', unit: inp.noise === 'emccd' ? 'counts per pixel' : 'photons per pixel', values, lo: Math.min(0, ...values), hi: Math.max(1e-9, ...values) }
  })
  let roiMean: number | null = null
  if (roi) {
    roiMean = 0
    for (let i = 0; i < roi.size; i++) for (let j = 0; j < roi.size; j++) roiMean += f.means[(roi.r0 + i) * inp.cols + roi.c0 + j]
  }
  return { kind: 'camera-frame', rows: inp.rows, cols: inp.cols, sites: inp.sites, noise: inp.noise, panels, roi, roiMean, readouts: inp.readouts, inputs: inp, shot: inp.shot }
}

export const resolveCameraFrameStage = (st: CameraFrameState): ResolvedCameraFrame => cameraFrameFrom(cameraFrameInputs(st))

/** A seeded draw is not something to blend: a change of frame switches at the half-way point. */
export function interpCameraFrameStage(a: ResolvedCameraFrame, b: ResolvedCameraFrame, t: number): ResolvedCameraFrame {
  if (t <= 0) return a
  if (t >= 1) return b
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */
export function validateCameraFrameStage(st: CameraFrameState): string[] {
  const errs: string[] = []
  const o = st as unknown as Record<string, unknown>
  for (const k of Object.keys(o)) if (!(FIELDS as readonly string[]).includes(k)) errs.push(`camera-frame: unknown field "${k.slice(0, 40)}"`)
  const L = CAMERA_FRAME_LIMITS
  if (!isInt(o.rows) || !inRange(o.rows, L.rows)) errs.push(`camera-frame rows: a whole number ${L.rows[0]}…${L.rows[1]}`)
  if (!isInt(o.cols) || !inRange(o.cols, L.cols)) errs.push(`camera-frame cols: a whole number ${L.cols[0]}…${L.cols[1]}`)
  const R = isInt(o.rows) ? o.rows : 0
  const C = isInt(o.cols) ? o.cols : 0
  if (o.occupancy !== undefined && o.sites !== undefined) errs.push('camera-frame: occupancy or sites, not both')
  if (o.occupancy !== undefined) {
    const oc = o.occupancy
    if (typeof oc === 'string') {
      if (R && C && !new RegExp(`^[01]{${R * C}}$`).test(oc)) errs.push(`camera-frame occupancy: a string of ${R * C} bits (rows × cols), 0 or 1`)
    } else if (isObj(oc)) {
      for (const k of Object.keys(oc)) if (k !== 'p' && k !== 'seed') errs.push(`camera-frame occupancy: unknown field "${k.slice(0, 40)}"`)
      if (!inRange(oc.p, [0, 1])) errs.push('camera-frame occupancy.p: a chance 0…1')
      if (!isInt(oc.seed) || oc.seed < 0 || oc.seed > 2 ** 31) errs.push('camera-frame occupancy.seed: a whole number 0…2147483648')
    } else errs.push('camera-frame occupancy: a bit string or { p, seed }')
  }
  if (o.sites !== undefined) {
    const s = o.sites
    if (!Array.isArray(s) || s.length > L.sites) errs.push(`camera-frame sites: at most ${L.sites} atoms [row, column]`)
    else
      s.forEach((p, i) => {
        if (!Array.isArray(p) || p.length !== 2 || !isInt(p[0]) || !isInt(p[1]) || p[0] < 0 || p[1] < 0 || (R && p[0] >= R) || (C && p[1] >= C)) errs.push(`camera-frame sites[${i}]: [row, column] inside the frame`)
      })
    if (Array.isArray(s) && new Set(s.map((p) => JSON.stringify(p))).size !== s.length) errs.push('camera-frame sites: each atom once')
  }
  if (o.photons !== undefined && !inRange(o.photons, L.photons)) errs.push(`camera-frame photons: ${L.photons[0]}…${L.photons[1]} mean photons per atom`)
  if (o.psf !== undefined && !inRange(o.psf, L.psf)) errs.push(`camera-frame psf: ${L.psf[0]}…${L.psf[1]} pixels`)
  if (o.background !== undefined && !inRange(o.background, L.background)) errs.push(`camera-frame background: ${L.background[0]}…${L.background[1]} photons per pixel`)
  if (o.noise !== undefined && !(CAMERA_FRAME_NOISE as readonly unknown[]).includes(o.noise)) errs.push(`camera-frame noise: ${CAMERA_FRAME_NOISE.map((n) => `'${n}'`).join(', ')}`)
  const noise = (o.noise as string | undefined) ?? 'none'
  if (noise === 'emccd') {
    if (!inRange(o.gain, L.gain)) errs.push(`camera-frame gain: noise 'emccd' needs a gain ${L.gain[0]}…${L.gain[1]} counts per photoelectron`)
    if (!inRange(o.sigma, L.sigma)) errs.push(`camera-frame sigma: noise 'emccd' needs a read noise ${L.sigma[0]}…${L.sigma[1]} counts`)
  } else {
    if (o.gain !== undefined) errs.push("camera-frame gain: only with noise 'emccd'")
    if (o.sigma !== undefined) errs.push("camera-frame sigma: only with noise 'emccd'")
  }
  if (o.seed !== undefined && (!isInt(o.seed) || o.seed < 0 || o.seed > 2 ** 31)) errs.push('camera-frame seed: a whole number 0…2147483648')
  let roiOn = false
  if (o.roi !== undefined) {
    if (typeof o.roi === 'boolean') roiOn = o.roi
    else if (isObj(o.roi)) {
      roiOn = true
      for (const k of Object.keys(o.roi)) if (k !== 'size') errs.push(`camera-frame roi: unknown field "${k.slice(0, 40)}"`)
      if (!isInt(o.roi.size) || !inRange(o.roi.size, L.roi)) errs.push(`camera-frame roi.size: a whole number ${L.roi[0]}…${L.roi[1]}`)
      else if ((R && o.roi.size > R) || (C && o.roi.size > C)) errs.push('camera-frame roi.size: no larger than the frame')
    } else errs.push('camera-frame roi: true or { size }')
  }
  const hasAtom = (Array.isArray(o.sites) && o.sites.length > 0) || (typeof o.occupancy === 'string' && o.occupancy.includes('1')) || (isObj(o.occupancy) && isNum(o.occupancy.p) && o.occupancy.p > 0)
  if (roiOn && !hasAtom) errs.push('camera-frame roi: needs an atom to sit around')
  if (o.denoise !== undefined && o.denoise !== 'none' && o.denoise !== 'wiener') errs.push("camera-frame denoise: 'none' or 'wiener'")
  if (o.show !== undefined && o.panel !== undefined) errs.push('camera-frame: show or panel, not both')
  if (o.show !== undefined && !(CAMERA_FRAME_SHOW as readonly unknown[]).includes(o.show)) errs.push(`camera-frame show: ${CAMERA_FRAME_SHOW.map((n) => `'${n}'`).join(', ')}`)
  let panelList: { show?: unknown; filter?: unknown }[] = o.show !== undefined ? [{ show: o.show }] : []
  if (o.panel !== undefined) {
    if (!Array.isArray(o.panel) || o.panel.length < 1 || o.panel.length > L.panels) errs.push(`camera-frame panel: one to ${L.panels} panels { show, filter? }`)
    else {
      panelList = o.panel as { show?: unknown; filter?: unknown }[]
      panelList.forEach((p, i) => {
        if (!isObj(p)) return void errs.push(`camera-frame panel[${i}]: { show, filter? }`)
        for (const k of Object.keys(p)) if (k !== 'show' && k !== 'filter') errs.push(`camera-frame panel[${i}]: unknown field "${k.slice(0, 40)}"`)
        if (!(CAMERA_FRAME_SHOW as readonly unknown[]).includes(p.show)) errs.push(`camera-frame panel[${i}].show: ${CAMERA_FRAME_SHOW.map((n) => `'${n}'`).join(', ')}`)
      })
    }
  }
  if (o.panels !== undefined && (o.panels !== 1 && o.panels !== 2 && o.panels !== 3)) errs.push('camera-frame panels: 1, 2 or 3')
  else if (o.panels !== undefined && o.panel === undefined) errs.push('camera-frame panels: needs panel (a list of that many)')
  else if (o.panels !== undefined && Array.isArray(o.panel) && o.panel.length !== o.panels) errs.push('camera-frame panels: the same number as the panel list')
  panelList.forEach((p, i) => {
    const w = o.panel !== undefined ? `panel[${i}]` : 'show'
    if (p.show === 'weights') {
      if (!(CAMERA_FRAME_FILTERS as readonly unknown[]).includes(p.filter)) errs.push(`camera-frame ${w}: weights need a filter ${CAMERA_FRAME_FILTERS.map((n) => `'${n}'`).join(', ')}`)
      if (!roiOn) errs.push(`camera-frame ${w}: weights need a region of interest (roi)`)
      if (p.filter === 'llr' && !(isNum(o.background) && o.background > 0)) errs.push(`camera-frame ${w}: the llr filter needs a background above 0`)
    } else if (p.filter !== undefined) errs.push(`camera-frame ${w}: a filter only goes with weights`)
    if (p.show === 'denoised' && o.denoise !== 'wiener') errs.push(`camera-frame ${w}: denoised needs denoise: 'wiener'`)
  })
  if (o.layers !== undefined) {
    const ls = o.layers
    if (!Array.isArray(ls) || ls.length < 1 || ls.length > CAMERA_LAYER_LIMITS.count || !ls.every((k) => isInt(k) && k % 2 === 1 && inRange(k, CAMERA_LAYER_LIMITS.kernel)))
      errs.push(`camera-frame layers: 1 to ${CAMERA_LAYER_LIMITS.count} odd kernel sizes ${CAMERA_LAYER_LIMITS.kernel[0]}…${CAMERA_LAYER_LIMITS.kernel[1]}`)
    if (!panelList.some((p) => p.show === 'rf')) errs.push("camera-frame layers: only with an 'rf' panel")
  }
  if (panelList.some((p) => p.show === 'rf') && o.layers === undefined) errs.push("camera-frame: an 'rf' panel needs layers")
  panelList.forEach((p, i) => {
    if (p.show === 'weights' && p.filter === 'learned' && !(hasAtom && roiOn)) errs.push(`camera-frame ${o.panel !== undefined ? `panel[${i}]` : 'show'}: the learned filter needs an atom and a region of interest`)
  })
  if (o.show === 'weights') errs.push('camera-frame show: weights need a filter, so use panel: [{ show: \'weights\', filter }]')
  if (o.denoise === 'wiener' && !panelList.some((p) => p.show === 'denoised') && o.show === undefined && o.panel === undefined) errs.push("camera-frame denoise: 'wiener' needs a denoised panel")
  if (o.readouts !== undefined) {
    const ro = o.readouts
    if (!Array.isArray(ro)) errs.push('camera-frame readouts: a list')
    else {
      for (const r of ro) if (!(CAMERA_FRAME_READOUTS as readonly unknown[]).includes(r)) errs.push(`camera-frame readouts: unknown "${String(r)}"`)
      if (new Set(ro).size !== ro.length) errs.push('camera-frame readouts: each once')
      if (ro.includes('roi') && !roiOn) errs.push("camera-frame readouts: 'roi' needs a region of interest (roi)")
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
export function cameraFrameReadouts(r: ResolvedCameraFrame): SvgReadout[] {
  const out: SvgReadout[] = []
  for (const name of r.readouts) {
    if (name === 'atoms') out.push({ name, text: `${r.sites.length} atom${r.sites.length === 1 ? '' : 's'}` })
    else if (name === 'roi' && r.roi && r.roiMean !== null) out.push({ name, text: `ROI ${r.roi.size}×${r.roi.size}: ${fix(r.roiMean, 1)} photons expected` })
  }
  return out
}
