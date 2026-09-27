/**
 * Instanced atoms (D §3.1 "Beam and atoms"): 2000 camera-facing billboards with a baked glow (core disc +
 * soft halo in one draw, no post-processing). Positions are computed on the CPU each frame along the bench
 * chain (lab/layout.ts), so multi-module benches, stops, a tracked atom and topology changes all follow
 * the same geometry the apparatus is drawn with.
 *
 * Fates are NOT decided here: each atom's seeded uniform number is compared with the engine's exact
 * fractions from the resolved state (theory.blocked[k], plus, minus) — a seeded random draw, like fireMany.
 * The classical overlay replaces the ± outcome with a continuous cos θ_μ (isotropic moments), labelled
 * "classical model — not what happens".
 */
import * as THREE from 'three'
import { gradientFalloff } from '../../../physics/field'
import type { BenchTheory } from '../../../physics/sg'
import { INK } from '../../tokens'
import { defl, LAB, type BenchLayout, type ModuleFrame } from './layout'

export const ATOMS = 2000

/** Seeded LCG + Box–Muller (identical picture on every load). */
export function rng(seed: number) {
  let s = seed >>> 0
  const u = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) + 0.5) / 4294967296
  const g = () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u())
  return { u, g }
}

export interface AtomSeeds {
  fate: Float32Array // uniform 0..1: compared with the exact fractions
  sign: Float32Array // uniform 0..1: + / − at an unkept first split (oven source)
  x: Float32Array // ribbon coordinate −1..1 across the pole
  z: Float32Array // gaussian thickness
  v: Float32Array // speed factor 0.75..1.25
  phase: Float32Array // 0..1 position along the flow
  cos: Float32Array // classical cos θ_μ ∈ [−1, 1] (isotropic moment)
  az: Float32Array // classical azimuth of the moment
}

export function makeSeeds(n = ATOMS, seed = 448): AtomSeeds {
  const r = rng(seed)
  const s: AtomSeeds = {
    fate: new Float32Array(n),
    sign: new Float32Array(n),
    x: new Float32Array(n),
    z: new Float32Array(n),
    v: new Float32Array(n),
    phase: new Float32Array(n),
    cos: new Float32Array(n),
    az: new Float32Array(n),
  }
  for (let i = 0; i < n; i++) {
    s.fate[i] = r.u()
    s.sign[i] = r.u()
    s.x[i] = r.u() * 2 - 1
    s.z[i] = Math.max(-2.5, Math.min(2.5, r.g()))
    s.v[i] = 0.75 + 0.5 * r.u()
    s.phase[i] = r.u()
    s.cos[i] = r.u() * 2 - 1
    s.az[i] = r.u() * Math.PI * 2
  }
  return s
}

/** Where an atom's path ends: blocked at module k (index into modules), or the plate with a sign. */
export interface Fate {
  end: number // −1 = plate
  /** Outcome sign at each module passed (±1). */
  signs: number[]
}

/**
 * The fate of an atom with uniform number u against the exact fractions (engine numbers from the state):
 * blocked at device k with probability theory.blocked[k], else plus / minus. `keep` = kept signs.
 */
export function fateOf(u: number, theory: BenchTheory, keep: readonly number[], n: number, out: Fate): Fate {
  out.signs.length = 0
  let acc = 0
  for (let k = 0; k < theory.blocked.length; k++) {
    acc += theory.blocked[k]
    if (u < acc) {
      for (let j = 0; j < k; j++) out.signs.push(keep[j])
      out.signs.push(-keep[k])
      out.end = k
      return out
    }
  }
  for (let j = 0; j < n - 1; j++) out.signs.push(keep[j])
  acc += theory.plus
  out.signs.push(u < acc ? 1 : -1)
  out.end = -1
  return out
}

/* ------------------------------------------------------------------------------------------------ */
/* Material: billboard core + halo; screen-size clamp; near fade                                     */
/* ------------------------------------------------------------------------------------------------ */

export function makeAtomMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uRadius: { value: 0.019 },
      uHalo: { value: 2.5 },
      uMaxPx: { value: 3.0 }, // ≤ 6 px diameter on screen (D §3.1)
      uPxPerUnit: { value: 500 }, // viewport height px / (2 tan(vfov/2)): set per frame
      uNear: { value: new THREE.Vector2(1.2, 3.0) }, // fade atoms closer than 3.0 → 1.2 u
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aPos;
      attribute vec4 aCol; // rgb + alpha
      attribute float aGlow;
      uniform float uRadius, uHalo, uMaxPx, uPxPerUnit, uOpacity;
      uniform vec2 uNear;
      varying vec2 vUv;
      varying vec4 vCol;
      varying float vGlow;
      varying float vCoreFrac;
      void main() {
        vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
        float depth = max(0.05, -mv.z);
        float rMaxPx = uMaxPx * depth / uPxPerUnit;
        float r = min(uRadius, rMaxPx);
        float halo = mix(1.0, uHalo, step(0.01, aGlow));
        mv.xy += position.xy * r * halo * 2.0;
        gl_Position = projectionMatrix * mv;
        vUv = position.xy * 2.0; // −1..1
        vCoreFrac = 1.0 / halo;
        float a = aCol.a * uOpacity * smoothstep(uNear.x, uNear.y, depth);
        vCol = vec4(aCol.rgb, a);
        vGlow = aGlow;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec4 vCol;
      varying float vGlow;
      varying float vCoreFrac;
      void main() {
        float d = length(vUv);            // 0 centre … 1 edge of the halo quad
        float rc = vCoreFrac;             // core radius as a fraction of the quad
        float core = 1.0 - smoothstep(rc * 0.78, rc, d);
        float shade = 1.0 + 0.25 * (1.0 - d / rc); // brighter centre: reads as a lit bead
        float halo = vGlow * pow(max(0.0, 1.0 - (d - rc) / (1.0 - rc)), 2.0) * step(rc, d);
        float a = max(core, halo) * vCol.a;
        if (a < 0.004) discard;
        vec3 c = vCol.rgb * mix(1.0, shade, core);
        gl_FragColor = vec4(c, a);
      }`,
  })
}

export function makeAtomMesh(n = ATOMS): {
  mesh: THREE.Mesh
  pos: THREE.InstancedBufferAttribute
  col: THREE.InstancedBufferAttribute
  glow: THREE.InstancedBufferAttribute
  material: THREE.ShaderMaterial
} {
  const quad = new THREE.PlaneGeometry(1, 1)
  const g = new THREE.InstancedBufferGeometry()
  g.index = quad.index
  g.setAttribute('position', quad.getAttribute('position'))
  const pos = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage)
  const col = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4).setUsage(THREE.DynamicDrawUsage)
  const glow = new THREE.InstancedBufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage)
  g.setAttribute('aPos', pos)
  g.setAttribute('aCol', col)
  g.setAttribute('aGlow', glow)
  g.instanceCount = n
  const material = makeAtomMaterial()
  const mesh = new THREE.Mesh(g, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 10
  return { mesh, pos, col, glow, material }
}

/* ------------------------------------------------------------------------------------------------ */
/* Per-frame update                                                                                  */
/* ------------------------------------------------------------------------------------------------ */

const C_UNPOL = new THREE.Color(INK.unpol)
const C_PLUS = new THREE.Color(INK.plus)
const C_MINUS = new THREE.Color(INK.minus)
const signColor = (s: number) => (s > 0 ? C_PLUS : C_MINUS)

/** Everything the atom update needs about one bench this frame (built by the scene from f.state). */
export interface BenchFlow {
  layout: BenchLayout
  theory: BenchTheory
  keep: number[] // ±1 per module but the last
  /** Source ket sign (+1 amber / −1 cobalt) or 0 = oven (unpolarized). */
  sourceSign: number
  /** Atom index range [i0, i1) owned by this bench. */
  i0: number
  i1: number
  /** 0…1: how far along the bench the beam has been revealed (unit entry; spoiler rule). */
  front: number
  /** Beam reaches the plate (false = the front stops at the last magnet's exit, D spoiler rule). */
  toPlate: boolean
  alpha: number
}

export interface FlowParams {
  clock: number
  /** 0 = quantum ±, 1 = classical continuous cos θ_μ. */
  classical: number
  /** Gradient strength 1 = split, 0 = uniform field (no push). */
  gradient: number
  /** Index of a tracked atom (flow 'single') or −1; others fade to `others`. */
  tracked: number
  others: number
  /** Atoms per second along the path (u/s). */
  speed: number
}

const _v = new THREE.Vector3()
const fate: Fate = { end: -1, signs: [] }

/** Path lengths of one bench: approach, then per module the length it is flown for (feed / plate / stop). */
function passLength(k: number, n: number, end: number, open = false): number {
  if (k === end) return LAB.L + (open ? LAB.sideGap : LAB.stopGap)
  if (k === n - 1) return LAB.L + LAB.plateGap
  return LAB.L + (LAB.spacing - LAB.L)
}

/** Position of an atom at module-local y′ with offset (ox, oz) and deflection coefficient a. */
function local(m: ModuleFrame, y: number, ox: number, oz: number, a: number, into: THREE.Vector3) {
  const sn = Math.sin(m.tilt)
  const cs = Math.cos(m.tilt)
  const d = a * defl(y)
  // offsets live in the TILTED module frame (the ribbon turns with the magnet, D §3.1)
  const lx = ox * cs + oz * sn
  const lz = -ox * sn + oz * cs
  return into.set(lx + d * sn, y, lz + d * cs).applyMatrix4(m.base)
}

/**
 * Write positions/colours for every atom of every bench. Returns, per bench, the number of atoms that are
 * at the plate end this frame (unused by the deposit, which is scroll-driven; handy for debugging).
 */
export function updateAtoms(
  seeds: AtomSeeds,
  benches: readonly BenchFlow[],
  p: FlowParams,
  pos: Float32Array,
  col: Float32Array,
  glow: Float32Array,
): void {
  // hide everything by default
  col.fill(0)
  for (const b of benches) {
    const mods = b.layout.prep ? [b.layout.prep, ...b.layout.modules] : b.layout.modules
    const nMain = b.layout.modules.length
    const off = b.layout.prep ? 1 : 0
    const nAll = mods.length
    const keepAll = b.layout.prep ? [b.layout.prepSign, ...b.keep] : b.keep
    for (let i = b.i0; i < b.i1; i++) {
      // fate from the exact fractions; the prep module keeps only the source's beam (greyed context)
      fateOf(seeds.fate[i], b.theory, b.keep, nMain, fate)
      const end = fate.end === -1 ? -1 : fate.end + off
      const signs = b.layout.prep ? [b.layout.prepSign, ...fate.signs] : fate.signs
      // an atom stopped at an OPEN output flies on to that output's small plate (LabDevice.openOther)
      const open = fate.end >= 0 && !!b.layout.stops[fate.end]?.open
      // total path length for this atom
      let total = LAB.ovenGap
      for (let k = 0; k < nAll; k++) {
        total += passLength(k, nAll, end, open)
        if (k === end) break
      }
      const flow = LAB.ovenGap + (LAB.L + (LAB.spacing - LAB.L)) * (nAll - 1) + LAB.L + LAB.plateGap
      let d = ((seeds.phase[i] + (p.clock * p.speed * seeds.v[i]) / flow) % 1) * flow
      if (d > total) continue // this atom's path is over (stopped / landed): wait for the next lap
      // reveal front (unit entry): nothing beyond it
      const frontD = b.front * (b.toPlate ? flow : LAB.ovenGap + (LAB.L + (LAB.spacing - LAB.L)) * (nAll - 1) + LAB.L + 0.15)
      if (d > frontD) continue
      let alpha = b.alpha
      // fade out just before a stop (120 ms ≈ 0.12 u) or the plate
      alpha *= Math.min(1, (total - d) / 0.12)
      const ribbon = seeds.x[i]
      const g = gradientFalloff(ribbon)
      const v2 = seeds.v[i] * seeds.v[i]
      let ox = ribbon * LAB.halfWidth
      let oz = seeds.z[i] * 0.022
      // the oven emits unpolarized atoms; a prepared source without a drawn prep arrives already coloured
      const approach = b.layout.prep || b.sourceSign === 0 ? C_UNPOL : signColor(b.sourceSign)
      let c = approach
      let prev = approach
      let cMix = 0
      if (d < LAB.ovenGap) {
        // oven → first entrance: the beam narrows to the slit, then stays collimated
        const y = d - LAB.ovenGap
        const spread = 1 + 1.6 * Math.min(1, Math.max(0, (-y - LAB.slitGap) / (LAB.ovenGap - LAB.slitGap)))
        local(mods[0], y, ox * spread, oz * spread, 0, _v)
      } else {
        d -= LAB.ovenGap
        let k = 0
        for (; k < nAll; k++) {
          const len = passLength(k, nAll, end, open)
          if (d <= len || k === end || k === nAll - 1) break
          // carry the atom to the next module: its offset from the kept centreline at the next entrance
          const m = mods[k]
          const a = (p.gradient * m.k * (signs[k] ?? 1) * g) / v2
          const aKeep = m.k * (keepAll[k] ?? 1)
          const oz2 = oz + (a - aKeep) * defl(len)
          // tilted frame of module k → module-local x/z → tilted frame of module k+1
          const sn = Math.sin(m.tilt)
          const cs = Math.cos(m.tilt)
          const lx = ox * cs + oz2 * sn
          const lz = -ox * sn + oz2 * cs
          const nt = mods[k + 1].tilt
          ox = lx * Math.cos(nt) - lz * Math.sin(nt)
          oz = lx * Math.sin(nt) + lz * Math.cos(nt)
          d -= len
        }
        const m = mods[k]
        const s = signs[k] ?? 1
        // classical: continuous cos θ_μ instead of ±1 (first module only; the overlay is single-module)
        const q = p.gradient * s
        const cl = p.gradient * seeds.cos[i]
        const first = k === 0 && !b.layout.prep
        const coef = first ? q + (cl - q) * p.classical : q
        local(m, d, ox, oz, (m.k * coef * g) / v2, _v)
        // colour: previous outcome → this magnet's outcome as the split develops (most recent magnet rule)
        prev = k === 0 ? approach : signColor(signs[k - 1] ?? 1)
        c = signColor(s)
        cMix = Math.min(1, Math.max(0, (d - 0.2) / 1.1)) * p.gradient * (first ? 1 - p.classical : 1)
      }
      if (p.tracked >= 0) alpha *= i === p.tracked ? 1 : p.others
      pos[i * 3] = _v.x
      pos[i * 3 + 1] = _v.y
      pos[i * 3 + 2] = _v.z
      col[i * 4] = prev.r + (c.r - prev.r) * cMix
      col[i * 4 + 1] = prev.g + (c.g - prev.g) * cMix
      col[i * 4 + 2] = prev.b + (c.b - prev.b) * cMix
      col[i * 4 + 3] = alpha
      // only outcome atoms glow (unpolarized atoms never do, D §1.3)
      glow[i] = cMix > 0.5 || prev !== C_UNPOL ? 0.3 : 0
    }
  }
}
