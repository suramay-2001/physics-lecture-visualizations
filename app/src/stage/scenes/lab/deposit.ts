/**
 * Plate deposit (D §3.1 "Plate deposit"). `depositPoints` is the ONE point generator for the 3D deposit;
 * the 2D `Plate` (ui/primitives.tsx, W) can adopt it so both show the same lip-shaped marks.
 *
 * Which spot an atom lands in is a seeded uniform draw against the engine's exact fraction pPlus from the
 * resolved state (theory.plus / (plus + minus)), exactly like fireMany: small counts scatter. Positions
 * are plate-local: x across the ribbon, z along the magnet's n̂ (the scene turns the pattern with the tilt).
 */
import * as THREE from 'three'
import { gradientFalloff } from '../../../physics/field'
import { rng } from './atoms'
import { LAB } from './layout'

export const DEPOSIT_MAX = 1400
/** Spot centres at ±0.9 on the 2.3 u plate (= 30 % / 70 % of plate height in the 2D Plate). */
export const SPOT = 0.9

export interface DepositSeeds {
  u: Float32Array
  x: Float32Array
  v: Float32Array
  j: Float32Array
  cos: Float32Array
}
export function depositSeeds(seed: number, n = DEPOSIT_MAX): DepositSeeds {
  const r = rng(seed)
  const s: DepositSeeds = { u: new Float32Array(n), x: new Float32Array(n), v: new Float32Array(n), j: new Float32Array(n), cos: new Float32Array(n) }
  for (let i = 0; i < n; i++) {
    s.u[i] = r.u()
    s.x[i] = r.u() * 2 - 1
    s.v[i] = 0.75 + 0.5 * r.u()
    s.j[i] = r.g()
    s.cos[i] = r.u() * 2 - 1
  }
  return s
}

/**
 * Fill `out` (x, z, sign per point; sign 0 = classical/unmeasured) for the first `count` seeds.
 * Returns the number of + points (the sample, shown next to the exact Born value).
 */
export function depositPoints(
  s: DepositSeeds,
  count: number,
  opts: { pPlus: number; gradient: number; classical: number; spot?: number },
  out: Float32Array,
): number {
  const spot = opts.spot ?? SPOT
  let plus = 0
  for (let i = 0; i < count; i++) {
    const sign = s.u[i] < opts.pPlus ? 1 : -1
    if (sign > 0) plus++
    const g = gradientFalloff(s.x[i])
    const k = (spot * opts.gradient * g) / (s.v[i] * s.v[i])
    const q = sign * k
    const cl = s.cos[i] * k
    out[i * 3] = s.x[i] * LAB.halfWidth
    out[i * 3 + 1] = q + (cl - q) * opts.classical + s.j[i] * 0.022
    out[i * 3 + 2] = opts.classical > 0.5 ? 0 : sign
  }
  return plus
}

/** Flat instanced discs lying on the plate (local x–z plane), unlit so amber/cobalt stay exact. */
export function makeDepositMesh(n = DEPOSIT_MAX): { mesh: THREE.Mesh; off: THREE.InstancedBufferAttribute; col: THREE.InstancedBufferAttribute; material: THREE.ShaderMaterial } {
  const quad = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2) // in the x–z plane… of THREE; plate-local is physics
  const g = new THREE.InstancedBufferGeometry()
  g.index = quad.index
  g.setAttribute('position', quad.getAttribute('position'))
  const off = new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2).setUsage(THREE.DynamicDrawUsage)
  const col = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage)
  g.setAttribute('aOff', off)
  g.setAttribute('aCol', col)
  g.instanceCount = 0
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    uniforms: { uR: { value: 0.02 }, uGlow: { value: 1.8 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aOff;
      attribute vec3 aCol;
      uniform float uR, uGlow;
      varying vec2 vUv;
      varying vec3 vCol;
      void main() {
        // quad lies in three's x–z; plate-local physics x–z is three x–(−y)… the parent frame handles it:
        // the plate frame is authored in physics coords, so place the disc in physics x–z (y = normal).
        vec3 p = vec3(aOff.x + position.x * uR * uGlow * 2.0, -0.026, aOff.y - position.z * uR * uGlow * 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vUv = vec2(position.x, -position.z) * 2.0;
        vCol = aCol;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGlow, uOpacity;
      varying vec2 vUv;
      varying vec3 vCol;
      void main() {
        float d = length(vUv) * uGlow;          // core radius = 1
        float core = 1.0 - smoothstep(0.75, 1.0, d);
        float halo = 0.18 * pow(max(0.0, 1.0 - (d - 1.0) / (uGlow - 1.0)), 2.0) * step(1.0, d);
        float a = max(core, halo) * uOpacity;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vCol, a);
      }`,
  })
  const mesh = new THREE.Mesh(g, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 5
  return { mesh, off, col, material }
}
