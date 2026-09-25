/**
 * Shared scene helpers (D). Pure maths + tiny three.js utilities used by LabR3Scene and HilbertPlaneScene.
 * Nothing here decides physics: scenes read `f.state` (engine-resolved) and only draw it.
 */
import * as THREE from 'three'

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
/** 3t² − 2t³ (= power1.inOut in the D spec). */
export const smooth = (x: number): number => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
/** Map x from [a, b] to [0, 1], clamped. */
export const ramp = (x: number, a: number, b: number): number => clamp01((x - a) / (b - a))

/**
 * Lens ladder (D §1.6): 36 mm-wide full-frame equivalents → HORIZONTAL fov in degrees.
 * Focal length may change inside one beat window by at most two adjacent rows; a bigger jump is a cut.
 */
export const LENSES = [28, 35, 40, 50, 65, 85] as const
export type Lens = (typeof LENSES)[number]
export const lensHfov = (mm: number): number => (2 * Math.atan(18 / mm) * 180) / Math.PI
export const lensRow = (mm: number): number => {
  let best = 0
  for (let i = 1; i < LENSES.length; i++) if (Math.abs(LENSES[i] - mm) < Math.abs(LENSES[best] - mm)) best = i
  return best
}
/** True when a lens change is too big to dolly through (D §1.6: > 2 rows ⇒ cut). */
export const lensNeedsCut = (a: number, b: number): boolean => Math.abs(lensRow(a) - lensRow(b)) > 2

/** A 64² radial gradient generated on a canvas at load (no file): glow sprites and soft blob shadows. */
export function radialTexture(stops: [number, number][], size = 64): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [at, a] of stops) grad.addColorStop(at, `rgba(255,255,255,${a})`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

/** Hatched stripes (beam-stop face, D §3.1): 6 dark stripes on a 32² canvas; no normal map. */
export function hatchTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')!
  g.fillStyle = '#5a6473'
  g.fillRect(0, 0, 32, 32)
  g.strokeStyle = '#2a303a'
  g.lineWidth = 2.2
  for (let i = -6; i < 12; i++) {
    g.beginPath()
    g.moveTo(i * 5.4, 32)
    g.lineTo(i * 5.4 + 32, 0)
    g.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** A polyline as a flat BufferGeometry (for THREE.Line / LineSegments). */
export function polylineGeometry(points: readonly (readonly [number, number, number])[]): THREE.BufferGeometry {
  const arr = new Float32Array(points.length * 3)
  points.forEach((p, i) => arr.set(p, i * 3))
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  return g
}

/** Dispose every geometry/material/texture below an object (scene unmount). */
export function disposeDeep(o: THREE.Object3D): void {
  o.traverse((x) => {
    const m = x as THREE.Mesh
    m.geometry?.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    const mats = Array.isArray(mat) ? mat : mat ? [mat] : []
    for (const mm of mats) {
      for (const v of Object.values(mm)) if (v instanceof THREE.Texture) v.dispose()
      mm.dispose()
    }
  })
}
