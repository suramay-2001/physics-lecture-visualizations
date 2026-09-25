/**
 * Flat, unlit drawing primitives for the hilbert-plane (D §3.2: "drawn like an engineering diagram").
 * Everything is MeshBasic-like (no lights, no shadows, no tone mapping so the reserved hues stay exact) and
 * sized in CSS PIXELS through a shared `pxPerUnit` so strokes keep their weight on any stage size.
 *
 *  - Arc: a ring segment (radius in units, width in px, start/end angles, draw-on progress) in one quad.
 *  - Stroke: a straight segment (length in units, width in px), optionally dashed (on/off in px).
 *  - Head: an arrowhead triangle (length/width in px).
 */
import * as THREE from 'three'

const common = { transparent: true, depthWrite: false, depthTest: false, toneMapped: false }

/** Ring segment from a0 to a0 + sweep·progress (radians, CCW). Quad of half-size r + w. */
export function makeArc(color: string, opacity = 1): THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  const mat = new THREE.ShaderMaterial({
    ...common,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uR: { value: 1 },
      uW: { value: 0.01 }, // stroke width in units (= px / pxPerUnit)
      uA0: { value: 0 },
      uSweep: { value: Math.PI * 2 },
      uProgress: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uR, uW;
      varying vec2 vP;
      void main() {
        vP = position.xy * 2.0 * (uR + uW);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(vP, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity, uR, uW, uA0, uSweep, uProgress;
      varying vec2 vP;
      void main() {
        float rho = length(vP);
        float d = abs(rho - uR) - uW * 0.5;
        float aa = fwidth(rho);
        float a = 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
        float phi = atan(vP.y, vP.x) - uA0;
        float s = sign(uSweep);
        phi = mod(phi * s, 6.28318530718);
        float len = abs(uSweep) * uProgress;
        if (len < 6.2831 && phi > len) discard;
        if (a * uOpacity < 0.004) discard;
        gl_FragColor = vec4(uColor, a * uOpacity);
      }`,
  })
  return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
}

/**
 * A straight stroke from the origin along +x of its object (length via `setStroke`). Dashed when
 * `dash` = [on, off] px. The mesh is a unit quad x ∈ [0, 1], y ∈ [−½, ½] scaled to (length, width).
 */
export function makeStroke(color: string, opacity = 1, dash: [number, number] | null = null): THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  const geo = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0)
  const mat = new THREE.ShaderMaterial({
    ...common,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uLenPx: { value: 100 },
      uOn: { value: dash ? dash[0] : 0 },
      uOff: { value: dash ? dash[1] : 0 },
    },
    vertexShader: /* glsl */ `
      varying float vX;
      void main() {
        vX = position.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity, uLenPx, uOn, uOff;
      varying float vX;
      void main() {
        if (uOn > 0.0 && mod(vX * uLenPx, uOn + uOff) > uOn) discard;
        if (uOpacity < 0.004) discard;
        gl_FragColor = vec4(uColor, uOpacity);
      }`,
  })
  return new THREE.Mesh(geo, mat)
}

/** Arrowhead: tip at the origin pointing +x, base at x = −1, half-width ½ (scale to px/unit). */
export function makeHead(color: string, opacity = 1): THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -1, 0.5, 0, -1, -0.5, 0], 3))
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false, toneMapped: false }))
}

/** Place a stroke from p to q with a width in px. `ppu` = CSS px per unit. */
export function setStroke(m: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>, px: number, py: number, qx: number, qy: number, widthPx: number, ppu: number): void {
  const dx = qx - px
  const dy = qy - py
  const len = Math.hypot(dx, dy)
  m.visible = len > 1e-6
  m.position.set(px, py, 0)
  m.rotation.set(0, 0, Math.atan2(dy, dx))
  m.scale.set(Math.max(1e-6, len), widthPx / ppu, 1)
  m.material.uniforms.uLenPx.value = len * ppu
}

export interface Arrow {
  group: THREE.Group
  shaft: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  head: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
  shaftPx: number
  headLenPx: number
  headWPx: number
}
export function makeArrow(color: string, shaftPx: number, headLenPx: number, headWPx: number, dash: [number, number] | null = null): Arrow {
  const group = new THREE.Group()
  const shaft = makeStroke(color, 1, dash)
  const head = makeHead(color)
  group.add(shaft, head)
  return { group, shaft, head, shaftPx, headLenPx, headWPx }
}
/** Arrow from the origin at `angle`, `length` units long (head included), opacity `a`. */
export function setArrow(ar: Arrow, angle: number, length: number, a: number, ppu: number): void {
  ar.group.visible = a > 0.004 && length > 1e-4
  if (!ar.group.visible) return
  const hl = Math.min(length * 0.45, ar.headLenPx / ppu)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  setStroke(ar.shaft, 0, 0, c * (length - hl * 0.9), s * (length - hl * 0.9), ar.shaftPx, ppu)
  ar.head.position.set(c * length, s * length, 0)
  ar.head.rotation.set(0, 0, angle)
  ar.head.scale.set(hl, ar.headWPx / ppu, 1)
  ar.shaft.material.uniforms.uOpacity.value = a
  ar.head.material.opacity = a
}
