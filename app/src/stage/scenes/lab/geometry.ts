/**
 * Lab apparatus geometry (D §3.1), authored in a module's LOCAL physics frame: entrance at y = 0, exit at
 * y = L, z up, x across the pole. Built once per scene; shared across modules.
 *
 * Pole pieces are height-fields across x, extruded along the beam, so the knife-edge and groove can MORPH
 * to flat poles (uniform field, l1-quantized:b5a) with one morph target and identical topology.
 */
import * as THREE from 'three'
import { LAB } from './layout'

const W = 0.95 // pole half-width in x
const TOP = 1.55
const BASE = -1.55

/** Knife-edge profile (underside of the top pole): tip z 0.61, tip radius 0.07, flanks at 35°. */
export function knifeZ(x: number): number {
  const r = 0.07
  const zc = 0.61 + r
  const a = (35 * Math.PI) / 180
  const xt = r * Math.sin(a)
  const ax = Math.abs(x)
  if (ax <= xt) return zc - Math.sqrt(r * r - ax * ax)
  return zc - r * Math.cos(a) + (ax - xt) * Math.tan(a)
}
/** Groove profile (top of the bottom pole): shoulders −0.46, circular groove half-width 0.38, depth 0.34. */
export function grooveZ(x: number): number {
  const hw = 0.38
  const depth = 0.34
  const R = (hw * hw + depth * depth) / (2 * depth)
  const zc = -0.46 - depth + R
  const ax = Math.abs(x)
  if (ax >= hw) return -0.46
  return zc - Math.sqrt(Math.max(0, R * R - ax * ax))
}
export const FLAT_TOP = 0.53
export const FLAT_BOTTOM = -0.53

/** x samples across the pole, dense near the axis (the tip and the groove need the resolution). */
function xSamples(n = 41): number[] {
  const xs: number[] = []
  for (let i = 0; i < n; i++) {
    const t = (2 * i) / (n - 1) - 1
    xs.push(W * Math.sign(t) * Math.abs(t) ** 1.7)
  }
  return xs
}

/**
 * A pole as a closed height-field solid: profile surface z = prof(x) facing the gap, a flat back at
 * z = back, two side walls and two end caps. `flat` builds the morph target with the same topology.
 */
function poleGeometry(prof: (x: number) => number, flatZ: number, back: number): THREE.BufferGeometry {
  const xs = xSamples()
  const L = LAB.L
  const build = (zOf: (x: number) => number) => {
    const pos: number[] = []
    const nor: number[] = []
    const uv: number[] = []
    const quad = (a: number[], b: number[], c: number[], d: number[], na?: number[], nb?: number[], nc?: number[], nd?: number[]) => {
      pos.push(...a, ...b, ...c, ...a, ...c, ...d)
      uv.push(a[0] / 1.9 + 0.5, a[1] / L, b[0] / 1.9 + 0.5, b[1] / L, c[0] / 1.9 + 0.5, c[1] / L)
      uv.push(a[0] / 1.9 + 0.5, a[1] / L, c[0] / 1.9 + 0.5, c[1] / L, d[0] / 1.9 + 0.5, d[1] / L)
      if (!na) {
        // flat face normal from the first triangle
        const e1 = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
        const e2 = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2])
        const n = e1.cross(e2).normalize()
        for (let i = 0; i < 6; i++) nor.push(n.x, n.y, n.z)
      } else nor.push(...na, ...nb!, ...nc!, ...na, ...nc!, ...nd!)
    }
    // The bottom pole's gap face looks up (+z); the top pole's looks down (−z).
    const facesUp = back < 0
    // smooth normals on the gap face from the profile slope (the knife tip is a round arc)
    const nAt = (x: number) => {
      const h = 1e-3
      const s = (zOf(Math.min(W, x + h)) - zOf(Math.max(-W, x - h))) / (Math.min(W, x + h) - Math.max(-W, x - h))
      const n = facesUp ? [-s, 0, 1] : [s, 0, -1]
      const l = Math.hypot(n[0], n[2])
      return [n[0] / l, 0, n[2] / l]
    }
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i]
      const x1 = xs[i + 1]
      const z0 = zOf(x0)
      const z1 = zOf(x1)
      const n0 = nAt(x0)
      const n1 = nAt(x1)
      // gap face
      if (facesUp) quad([x0, 0, z0], [x1, 0, z1], [x1, L, z1], [x0, L, z0], n0, n1, n1, n0)
      else quad([x0, 0, z0], [x0, L, z0], [x1, L, z1], [x1, 0, z1], n0, n0, n1, n1)
      // back face
      if (facesUp) quad([x0, 0, back], [x0, L, back], [x1, L, back], [x1, 0, back])
      else quad([x0, 0, back], [x1, 0, back], [x1, L, back], [x0, L, back])
      // end caps (entrance y = 0 faces −y, exit y = L faces +y)
      if (facesUp) {
        quad([x0, 0, z0], [x0, 0, back], [x1, 0, back], [x1, 0, z1])
        quad([x0, L, z0], [x1, L, z1], [x1, L, back], [x0, L, back])
      } else {
        quad([x0, 0, z0], [x1, 0, z1], [x1, 0, back], [x0, 0, back])
        quad([x0, L, z0], [x0, L, back], [x1, L, back], [x1, L, z1])
      }
    }
    // side walls x = ±W
    const zl = zOf(-W)
    const zr = zOf(W)
    if (facesUp) {
      quad([-W, 0, zl], [-W, L, zl], [-W, L, back], [-W, 0, back])
      quad([W, 0, zr], [W, 0, back], [W, L, back], [W, L, zr])
    } else {
      quad([-W, 0, zl], [-W, 0, back], [-W, L, back], [-W, L, zl])
      quad([W, 0, zr], [W, L, zr], [W, L, back], [W, 0, back])
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    return g
  }
  const g = build(prof)
  const f = build(() => flatZ)
  g.morphAttributes.position = [f.getAttribute('position') as THREE.BufferAttribute]
  g.morphAttributes.normal = [f.getAttribute('normal') as THREE.BufferAttribute]
  f.dispose()
  return g
}

export interface LabGeometry {
  knife: THREE.BufferGeometry
  groove: THREE.BufferGeometry
  /** C-frame yoke on the −x side (three boxes merged into one geometry). */
  yoke: THREE.BufferGeometry
  /** Gradient-axis arrow on the yoke's outer face (points along local +z = +n̂ after the tilt). */
  arrowShaft: THREE.BufferGeometry
  arrowHead: THREE.BufferGeometry
  box: THREE.BufferGeometry
  oven: THREE.BufferGeometry
  ovenRim: THREE.BufferGeometry
  ovenMouth: THREE.BufferGeometry
  slitJaw: THREE.BufferGeometry
  plateGlass: THREE.BufferGeometry
  plateFrame: THREE.BufferGeometry
  stop: THREE.BufferGeometry
  rail: THREE.BufferGeometry
  floor: THREE.BufferGeometry
  blob: THREE.BufferGeometry
  /** Protractor: ring + 15° ticks (tilt beats), in the module's untilted entrance plane. */
  ring: THREE.BufferGeometry
  ticks: THREE.BufferGeometry
  unitCircleSeg: THREE.BufferGeometry
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // minimal merge for non-indexed position/normal/uv geometries
  const nonIdx = parts.map((p) => (p.index ? p.toNonIndexed() : p))
  const count = nonIdx.reduce((s, p) => s + p.getAttribute('position').count, 0)
  const pos = new Float32Array(count * 3)
  const nor = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  let o = 0
  for (const p of nonIdx) {
    const n = p.getAttribute('position').count
    pos.set(p.getAttribute('position').array as Float32Array, o * 3)
    nor.set(p.getAttribute('normal').array as Float32Array, o * 3)
    const u = p.getAttribute('uv')
    if (u) uv.set(u.array as Float32Array, o * 2)
    o += n
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  nonIdx.forEach((p, i) => p !== parts[i] && p.dispose())
  parts.forEach((p) => p.dispose())
  return g
}

const boxAt = (w: number, d: number, h: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, d, h).translate(x, y, z)

export function buildLabGeometry(): LabGeometry {
  const L = LAB.L
  // yoke: back plate on −x plus top/bottom arms reaching over the poles
  const yoke = merge([
    boxAt(0.42, L, 3.9, -1.32, L / 2, 0),
    boxAt(2.3, L, 0.42, -0.38, L / 2, 1.78),
    boxAt(2.3, L, 0.42, -0.38, L / 2, -1.78),
  ])
  const arrowShaft = new THREE.CylinderGeometry(0.02, 0.02, 0.72, 10).rotateX(Math.PI / 2).translate(-1.555, L / 2, -0.09)
  const arrowHead = new THREE.ConeGeometry(0.06, 0.18, 14).rotateX(Math.PI / 2).translate(-1.555, L / 2, 0.36)
  const ring = new THREE.TorusGeometry(1.35, 0.008, 6, 96).rotateX(Math.PI / 2)
  const tickPos: number[] = []
  for (let d = 0; d < 360; d += 15) {
    const a = (d * Math.PI) / 180
    const r0 = d % 45 === 0 ? 1.25 : 1.29
    tickPos.push(r0 * Math.sin(a), 0, r0 * Math.cos(a), 1.35 * Math.sin(a), 0, 1.35 * Math.cos(a))
  }
  const ticks = new THREE.BufferGeometry()
  ticks.setAttribute('position', new THREE.Float32BufferAttribute(tickPos, 3))
  const frame = merge([
    boxAt(2.46, 0.07, 0.08, 0, 0, 1.19),
    boxAt(2.46, 0.07, 0.08, 0, 0, -1.19),
    boxAt(0.08, 0.07, 2.46, 1.19, 0, 0),
    boxAt(0.08, 0.07, 2.46, -1.19, 0, 0),
    boxAt(0.1, 0.1, 0.95, 0, 0.0, -1.19 - 0.47), // foot
  ])
  const seg = new THREE.BufferGeometry()
  seg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3))
  return {
    knife: poleGeometry(knifeZ, FLAT_TOP, TOP),
    groove: poleGeometry(grooveZ, FLAT_BOTTOM, BASE),
    yoke,
    arrowShaft,
    arrowHead,
    box: new THREE.BoxGeometry(1.9, L, 2.2).translate(0, L / 2, 0),
    oven: new THREE.CylinderGeometry(0.36, 0.4, 0.95, 40).translate(0, -0.5, 0),
    ovenRim: new THREE.TorusGeometry(0.11, 0.018, 8, 32).rotateX(Math.PI / 2),
    ovenMouth: new THREE.CircleGeometry(0.1, 32).rotateX(-Math.PI / 2).translate(0, 0.005, 0),
    slitJaw: new THREE.BoxGeometry(1.24, 0.04, 0.5),
    plateGlass: new THREE.BoxGeometry(2.3, 0.04, 2.3),
    plateFrame: frame,
    stop: new THREE.BoxGeometry(0.3, 0.12, 0.3),
    rail: new THREE.BoxGeometry(0.5, 1, 0.16),
    floor: new THREE.PlaneGeometry(1, 1),
    blob: new THREE.PlaneGeometry(1, 1),
    ring,
    ticks,
    unitCircleSeg: seg,
  }
}

export function disposeLabGeometry(g: LabGeometry): void {
  for (const v of Object.values(g)) (v as THREE.BufferGeometry).dispose()
}
