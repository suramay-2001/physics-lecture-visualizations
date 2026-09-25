/**
 * D's measurement hooks (DEV or `?measure` only): `window.__stageD` = { bench, contrast, overlaps, audit }.
 * W1 ports the gate's bench/contrast into `window.__stage`; until then these give D's self-check its
 * numbers. Same methods as the gate: frames rendered back-to-back through r3f `advance()` with a 1-pixel
 * readPixels fence (CPU + GPU per frame); contrast = label ink vs its backing composited over the BRIGHTEST
 * canvas pixel under the label (canvas readback right after a render, so no preserveDrawingBuffer needed).
 */
import { advance, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type * as THREE from 'three'
import { setScroll, stage } from '../store'
import { getViews } from '../views'
import { reservedRects, type Rect } from './labels'

const enabled = () => import.meta.env.DEV || stage.measure

const lin = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const relLum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const parseRgba = (s: string): [number, number, number, number] => {
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 0]
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
}
const over = (top: [number, number, number, number], under: [number, number, number]): [number, number, number] => [
  top[0] * top[3] + under[0] * (1 - top[3]),
  top[1] * top[3] + under[1] * (1 - top[3]),
  top[2] * top[3] + under[2] * (1 - top[3]),
]
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function pct(buf: number[]) {
  if (!buf.length) return { n: 0, p50: NaN, p95: NaN, max: NaN }
  const s = [...buf].sort((a, b) => a - b)
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]
  const r = (x: number) => Math.round(x * 1000) / 1000
  return { n: s.length, p50: r(q(0.5)), p95: r(q(0.95)), max: r(s[s.length - 1]) }
}

function install(gl: THREE.WebGLRenderer) {
  const W = window as unknown as { __stageD?: unknown }
  const ctx = () => gl.getContext()
  const fence = () => {
    const px = new Uint8Array(4)
    ctx().readPixels(0, 0, 1, 1, ctx().RGBA, ctx().UNSIGNED_BYTE, px)
  }
  const render = () => advance(performance.now())

  /** Pixels of a CSS rect of the page, read right after a render. */
  function readRect(r: DOMRect) {
    const canvas = gl.domElement
    const cr = canvas.getBoundingClientRect()
    const sx = canvas.width / cr.width
    const sy = canvas.height / cr.height
    const x0 = Math.max(0, Math.floor((r.left - cr.left) * sx))
    const x1 = Math.min(canvas.width, Math.ceil((r.right - cr.left) * sx))
    const yTop = Math.max(0, Math.floor((r.top - cr.top) * sy))
    const yBot = Math.min(canvas.height, Math.ceil((r.bottom - cr.top) * sy))
    const w = x1 - x0
    const h = yBot - yTop
    if (w <= 0 || h <= 0) return null
    const c = ctx()
    const buf = new Uint8Array(w * h * 4)
    c.readPixels(x0, canvas.height - yBot, w, h, c.RGBA, c.UNSIGNED_BYTE, buf)
    return buf
  }

  const labelsOn = () =>
    [...document.querySelectorAll<HTMLElement>('.story-stage [data-contrast]')].filter((el) => {
      const r = el.getBoundingClientRect()
      const op = Number(getComputedStyle(el).opacity)
      return el.dataset.hidden !== '1' && op > 0.02 && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && (el.textContent ?? '').trim() !== ''
    })

  function contrast() {
    render()
    const pageBg = parseRgba(getComputedStyle(document.body).backgroundColor)
    return labelsOn().map((el) => {
      const r = el.getBoundingClientRect()
      const buf = readRect(r)
      const cs = getComputedStyle(el)
      const opacity = Number(cs.opacity)
      const labelBg = parseRgba(cs.backgroundColor)
      const fg = parseRgba(cs.color)
      let worst: [number, number, number] = [0, 0, 0]
      let worstL = -1
      if (buf)
        for (let i = 0; i < buf.length; i += 4) {
          const a = buf[i + 3] / 255
          const c: [number, number, number] = a >= 1 ? [buf[i], buf[i + 1], buf[i + 2]] : [buf[i] + pageBg[0] * (1 - a), buf[i + 1] + pageBg[1] * (1 - a), buf[i + 2] + pageBg[2] * (1 - a)]
          const L = relLum(...c)
          if (L > worstL) {
            worstL = L
            worst = c
          }
        }
      // the element's own opacity (a fade) scales both its backing and its ink over the canvas
      const eff = over([labelBg[0], labelBg[1], labelBg[2], labelBg[3] * opacity], worst)
      const ink = over([fg[0], fg[1], fg[2], fg[3] * opacity], eff)
      return {
        text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40),
        kind: el.dataset.contrast,
        ratio: Math.round(ratio(relLum(...ink), relLum(...eff)) * 100) / 100,
        noBacking: Math.round(ratio(relLum(...over(fg, worst)), relLum(...worst)) * 100) / 100,
        worstPixel: '#' + worst.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''),
      }
    })
  }

  /** D §6.1 acceptance: visible labels vs reserved zones (+0 px) and each other. */
  function overlaps() {
    const out: string[] = []
    for (const box of document.querySelectorAll<HTMLElement>('.story-stage')) {
      const b = box.getBoundingClientRect()
      const reserved = reservedRects(box)
      const labels = labelsOn().filter((el) => box.contains(el) && el.classList.contains('stage-label'))
      const rects = labels.map((el) => {
        const r = el.getBoundingClientRect()
        return [r.left - b.left, r.top - b.top, r.width, r.height] as Rect
      })
      const hit = (a: Rect, c: Rect) => a[0] < c[0] + c[2] && a[0] + a[2] > c[0] && a[1] < c[1] + c[3] && a[1] + a[3] > c[1]
      rects.forEach((r, i) => {
        const t = (labels[i].textContent ?? '').trim()
        reserved.forEach((q) => hit(r, q) && out.push(`${t} × reserved[${q.map(Math.round).join(',')}]`))
        for (let j = i + 1; j < rects.length; j++) if (hit(r, rects[j])) out.push(`${t} × ${(labels[j].textContent ?? '').trim()}`)
        if (r[0] < 0 || r[1] < 0 || r[0] + r[2] > b.width || r[1] + r[3] > b.height) out.push(`${t} outside the stage`)
      })
    }
    return out
  }

  /**
   * Frame cost: for each beat position u of `unit`, render `frames` frames back-to-back (after 5 warm-up
   * frames), each fenced by a 1-pixel readPixels so the time includes the GPU finishing the frame.
   */
  async function bench(unit: string, us: number[], frames = 60) {
    const track = stage.units.get(unit)
    if (!track) return null
    const all: number[] = []
    const per: Record<string, unknown> = {}
    for (const u of us) {
      setScroll(track, u)
      for (let i = 0; i < 5; i++) {
        render()
        fence()
      }
      const times: number[] = []
      for (let i = 0; i < frames; i++) {
        const t0 = performance.now()
        render()
        fence()
        times.push(performance.now() - t0)
      }
      all.push(...times)
      const r = gl.info.render
      per[u.toFixed(2)] = { ...pct(times), calls: r.calls, triangles: r.triangles }
      await sleep(0)
    }
    const canvas = gl.domElement
    return { viewport: [innerWidth, innerHeight], canvas: [canvas.width, canvas.height], dpr: gl.getPixelRatio(), all: pct(all), per }
  }

  /** Contrast + overlaps at each u (waits for the 150 ms label fades to finish). */
  async function audit(unit: string, us: number[]) {
    const track = stage.units.get(unit)
    if (!track) return null
    const rows: unknown[] = []
    let worst = Infinity
    let worstAt = ''
    const allOverlaps: string[] = []
    for (const u of us) {
      setScroll(track, u)
      render()
      await sleep(260)
      render()
      const c = contrast()
      for (const row of c)
        if (row.ratio < worst) {
          worst = row.ratio
          worstAt = `u=${u} "${row.text}" over ${row.worstPixel}`
        }
      const o = overlaps()
      allOverlaps.push(...o.map((s) => `u=${u}: ${s}`))
      rows.push({ u, labels: c.length, min: Math.min(...c.map((x) => x.ratio)), overlaps: o.length })
    }
    return { worst, worstAt, overlaps: allOverlaps, rows }
  }

  W.__stageD = { bench, contrast, overlaps, audit, render, views: getViews }
}

/** Mount inside a scene: installs `window.__stageD` once (DEV or ?measure). */
export function DevMeasure() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (!enabled() || typeof window === 'undefined') return
    install(gl)
  }, [gl])
  return null
}
