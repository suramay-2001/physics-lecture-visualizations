/**
 * hilbert-plane — the real slice of ℂ² (decision #5; D-L1-scenes §3.2). FLAT, UNLIT, ORTHOGRAPHIC: the
 * grammar of "not physical" (physical space is lit and has depth; this is drawn like a diagram). No camera
 * motion, no lights, no shadows, no tone mapping (amber/cobalt stay exact).
 *
 * Draws `f.state` (ResolvedPlane): ψ's angle, the measurement frame, the engine's probabilities
 * (`planeProbs` → `prob()`), shadows, right-angle mark, θ/2 arc, 1/√2 ticks, other arrows (second, ghost).
 * Shadow LENGTHS are the geometric projections of the drawn arrow; their squares are the engine's numbers
 * shown in the readout and bars (the scene never computes a probability).
 *
 * Layout: the unit circle is fitted into the view around the reserved zones (passport, caption, readouts)
 * with the probability bars at the right edge (18 px wide, probability 1 = up to 160 px).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { PASSPORT } from '../../content/stage'
import type { Anchor } from '../../content/stageVocab'
import { stage, type StageLabel } from '../store'
import { useLabelKey, useStageCamera, useStageFrame, useStageLabels, useView, writeReadout } from '../hooks'
import { INK } from '../tokens'
import type { ResolvedPlane, SceneProps } from '../types'
import { disposeDeep, smooth } from './common'
import { DevMeasure } from './devtools'
import { reservedRects, useSceneLabels, type LabelItem, type Rect } from './labels'
import { makeArc, makeArrow, makeStroke, setArrow, setStroke, type Arrow } from './plane/draw'

const BAR_W = 18
const BAR_GAP = 6
const BAR_MAX = 160
const EDGE = 14

/**
 * Outcome kets of the measurement frame at plane angle `basis` (radians): z frame → +z/−z, x frame (45°) →
 * +x/−x, anything else → the frame's own vectors e₁/e₂. Used to name bars and readouts by their basis.
 */
export function basisKets(basis: number): [string, string] {
  const d = (((basis * 180) / Math.PI) % 180 + 180) % 180
  if (d < 0.5 || d > 179.5) return ['+z', '−z']
  if (Math.abs(d - 45) < 0.5) return ['+x', '−x']
  return ['e₁', 'e₂']
}

/**
 * Ket name of a plane angle (for labels only), in the app notation |±z⟩, |±x⟩ (round 3 #16). The axis
 * labels keep the bridge form "|↑⟩ = |+z⟩" from the passport; standalone labels never use arrow kets.
 */
export function ketAt(angle: number): string | null {
  const d = (((angle * 180) / Math.PI) % 360 + 360) % 360
  const near = (x: number) => Math.abs(d - x) < 0.5
  if (near(0)) return '$|{+z}\\rangle$'
  if (near(90)) return '$|{-z}\\rangle$'
  if (near(45)) return '$|{+x}\\rangle$'
  if (near(315)) return '$|{-x}\\rangle$'
  if (near(180)) return '$-|{+z}\\rangle$'
  if (near(225)) return '$-|{+x}\\rangle$'
  return null
}

const MAX_OTHERS = 3

function baseLabels(): Record<string, StageLabel> {
  const L: Record<string, StageLabel> = {
    e1: { text: PASSPORT['hilbert-plane'].axes[0], tier: 'axis', tone: 'plus' },
    e2: { text: PASSPORT['hilbert-plane'].axes[1], tier: 'axis', tone: 'minus' },
    one: { text: '1', tier: 'axis', tone: 'silver' },
    psi: { text: '$|\\psi\\rangle$', tier: 'chip', tone: 'state' },
    arc: { text: '$\\theta/2$', tier: 'axis', tone: 'silver' },
    tick1: { text: '$1/\\sqrt2$', tier: 'axis', tone: 'silver' },
    tick2: { text: '$1/\\sqrt2$', tier: 'axis', tone: 'silver' },
    barA: { text: '$|\\alpha|^2$', tier: 'axis', tone: 'plus' },
    barB: { text: '$|\\beta|^2$', tier: 'axis', tone: 'minus' },
    rA: { text: '', tier: 'readout', tone: 'plus' },
    rB: { text: '', tier: 'readout', tone: 'minus' },
  }
  for (let i = 0; i < MAX_OTHERS; i++) {
    L[`o${i}`] = { text: '', tier: 'axis', tone: 'state' }
    L[`badge${i}`] = { text: 'same physical state', tier: 'axis' }
  }
  return L
}

interface Rig {
  root: THREE.Group
  grid: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
  circle: ReturnType<typeof makeArc>
  axis1: ReturnType<typeof makeStroke>
  axis2: ReturnType<typeof makeStroke>
  e1: Arrow
  e2: Arrow
  e2flip: Arrow
  psi: Arrow
  bead: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  halo: THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>
  others: Arrow[]
  drop1: ReturnType<typeof makeStroke>
  drop2: ReturnType<typeof makeStroke>
  sh1: ReturnType<typeof makeStroke>
  sh2: ReturnType<typeof makeStroke>
  arc: ReturnType<typeof makeArc>
  ra1: ReturnType<typeof makeStroke>
  ra2: ReturnType<typeof makeStroke>
  ticks: ReturnType<typeof makeStroke>[]
  barTrackA: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  barTrackB: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  barA: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  barB: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
}

const basic = (color: string, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false, toneMapped: false })

function buildRig(): Rig {
  const root = new THREE.Group()
  // dot grid 0.25 u pitch (silver-3 at 0.25)
  const pts: number[] = []
  for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) pts.push(i * 0.25, j * 0.25, 0)
  const gg = new THREE.BufferGeometry()
  gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  const grid = new THREE.Points(gg, new THREE.PointsMaterial({ color: INK.silver3, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.25, depthWrite: false, depthTest: false, toneMapped: false }))
  const circle = makeArc(INK.silver2)
  const axis1 = makeStroke(INK.silver2)
  const axis2 = makeStroke(INK.silver2)
  const e1 = makeArrow(INK.plus, 5, 16, 13)
  const e2 = makeArrow(INK.minus, 5, 16, 13)
  const e2flip = makeArrow(INK.minus, 5, 16, 13)
  const psi = makeArrow(INK.state, 7, 26, 18)
  const bead = new THREE.Mesh(new THREE.CircleGeometry(1, 24), basic(INK.state))
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      uniforms: { uColor: { value: new THREE.Color(INK.state) }, uA: { value: 0.35 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 uColor; uniform float uA; varying vec2 vP; void main(){ float d = length(vP); float a = uA * pow(max(0.0, 1.0 - d), 2.0); if (a < 0.004) discard; gl_FragColor = vec4(uColor, a); }',
    }),
  )
  const others = Array.from({ length: MAX_OTHERS }, () => makeArrow(INK.state, 7, 24, 18, [6, 4]))
  const drop1 = makeStroke(INK.silver, 1, [6, 4])
  const drop2 = makeStroke(INK.silver, 1, [6, 4])
  const sh1 = makeStroke(INK.plus, 0.6)
  const sh2 = makeStroke(INK.minus, 0.6)
  const arc = makeArc(INK.silver)
  const ra1 = makeStroke(INK.silver)
  const ra2 = makeStroke(INK.silver)
  const ticks = Array.from({ length: 2 }, () => makeStroke(INK.silver))
  const barTrackA = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0), basic(INK.silver3, 0.45))
  const barTrackB = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0), basic(INK.silver3, 0.45))
  const barA = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0), basic(INK.plus))
  const barB = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0), basic(INK.minus))
  // draw order = add order (depthTest off): structure → drop-lines → other states → ψ → shadows → marks →
  // basis arrows ON TOP. When ψ lies along a basis vector (l1-vectors:b4), the wider near-white ψ then shows
  // as an outline around the amber arrow: "the state IS this basis vector", and neither hides the other.
  let order = 0
  for (const o of [grid, circle, axis1, axis2, drop1, drop2, ...others.map((x) => x.group), psi.group, halo, bead, sh1, sh2, arc, ra1, ra2, ...ticks, e1.group, e2.group, e2flip.group, barTrackA, barTrackB, barA, barB]) {
    o.renderOrder = order++
    o.traverse((c) => (c.renderOrder = o.renderOrder))
    root.add(o)
  }
  return { root, grid, circle, axis1, axis2, e1, e2, e2flip, psi, bead, halo, others, drop1, drop2, sh1, sh2, arc, ra1, ra2, ticks, barTrackA, barTrackB, barA, barB }
}

/** Largest content half-size around the best of a few centres that keeps clear of the reserved rects. */
function fitPlane(w: number, h: number, reserved: Rect[]): { cx: number; cy: number; R: number } {
  const l = 10
  const r = w - EDGE - 2 * BAR_W - BAR_GAP - 12
  const t = 10
  const b = h - 10
  let best = { cx: (l + r) / 2, cy: h / 2, s: 0 }
  // grid search (≈ 200 candidates × a handful of rects): the free area moves with inset, caption and panes
  for (let fx = 0.2; fx <= 0.801; fx += 0.05)
    for (let fy = 0.15; fy <= 0.851; fy += 0.05) {
      const cx = l + fx * (r - l)
      const cy = t + fy * (b - t)
      let s = Math.min(cx - l, r - cx, cy - t, b - cy)
      for (const q of reserved) {
        const x0 = q[0] - 8
        const y0 = q[1] - 8
        const x1 = q[0] + q[2] + 8
        const y1 = q[1] + q[3] + 8
        const dx = Math.max(x0 - cx, 0, cx - x1)
        const dy = Math.max(y0 - cy, 0, cy - y1)
        s = Math.min(s, Math.hypot(dx, dy))
      }
      // prefer centred layouts: a small bias toward the middle breaks ties
      const bias = 6 * (Math.abs(fx - 0.5) + Math.abs(fy - 0.5))
      if (s - bias > best.s + 0.5) best = { cx, cy, s: s - bias }
    }
  // content: axes to ±1.25 plus room for the tip labels
  const R = Math.max(24, Math.min(best.s / 1.5, 0.36 * Math.min(w, h)))
  return { cx: best.cx, cy: best.cy, R }
}

export default function HilbertPlaneScene(_: SceneProps<'hilbert-plane'>) {
  const view = useView()
  const cam = useMemo(() => {
    const c = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    c.position.set(0, 0, 5)
    return c
  }, [])
  useStageCamera(cam)
  const rig = useMemo(buildRig, [])
  // free GPU buffers on unmount (a StrictMode remount re-uploads them lazily: the objects stay valid)
  useEffect(() => () => disposeDeep(rig.root), [rig])
  const root = useRef<THREE.Group>(null)

  const [texts, setTexts] = useState<Record<string, string>>({})
  const textsRef = useRef(texts)
  const labels = useMemo(() => {
    const L = baseLabels()
    for (const [k, t] of Object.entries(texts)) if (L[k]) L[k] = { ...L[k], text: t }
    return L
  }, [texts])
  useStageLabels(labels)
  const items = useMemo(() => {
    const out: Record<string, LabelItem> = {}
    const pr: Record<string, number> = { psi: 0, e1: 1, e2: 1, arc: 1, badge0: 1, badge1: 1, badge2: 1, o0: 2, o1: 2, o2: 2, one: 3, tick1: 3, tick2: 3, barA: 2, barB: 2 }
    for (const name of Object.keys(baseLabels())) {
      if (name.startsWith('r')) continue
      out[name] = { anchor: new THREE.Vector3(), alpha: 0, priority: pr[name] ?? 3, look: name.startsWith('badge') ? 'badge' : undefined }
    }
    return out
  }, [])
  useSceneLabels(items, root)
  const rA = useLabelKey('rA')
  const rB = useLabelKey('rB')
  const S = useMemo(() => ({ reserved: [] as Rect[], frame: 0, beat: -1, key: '', fitKey: '', fit: { cx: 0, cy: 0, R: 40 } }), [])

  useStageFrame<'hilbert-plane'>((f) => {
    const s: ResolvedPlane = f.state
    const { w, h } = f.size
    if (w <= 0 || h <= 0) return
    // reserved rects of this view (box coords → view coords), refreshed on beat change and every 20 frames
    const sig = f.beat * 16 + (f.revealed ? 8 : 0) + ['full', 'top', 'bottom', 'main', 'inset'].indexOf(f.slot ?? 'full')
    if (S.frame++ % 20 === 0 || sig !== S.beat) {
      const box = stage.units.get(f.unitId)?.box ?? null
      const [rx, ry, rw, rh] = view.rect
      S.reserved = reservedRects(box, f.unitId)
        .filter((q) => !(f.slot === 'inset' && Math.abs(q[0] - rx) < 1 && Math.abs(q[1] - ry) < 1))
        .map((q): Rect => [q[0] - rx, q[1] - ry, q[2], q[3]])
        .filter((q) => q[0] < rw && q[1] < rh && q[0] + q[2] > 0 && q[1] + q[3] > 0)
      S.beat = sig
    }
    const inset = f.slot === 'inset'
    const fitKey = `${w.toFixed(0)}|${h.toFixed(0)}|${inset ? '' : JSON.stringify(S.reserved)}`
    if (fitKey !== S.fitKey) {
      S.fit = fitPlane(w, h, inset ? [] : S.reserved)
      S.fitKey = fitKey
    }
    const { cx, cy, R } = S.fit
    const ppu = R
    cam.left = -cx / R
    cam.right = (w - cx) / R
    cam.top = cy / R
    cam.bottom = -(h - cy) / R
    cam.updateProjectionMatrix()

    // draw-on as the view enters (weight 0 → 1 across the beat window; a cut under reduced motion)
    const draw = smooth(f.weight)
    const focus: Anchor | null = f.focus

    ;(rig.grid.material as THREE.PointsMaterial).opacity = 0.25 * draw
    const C = rig.circle.material.uniforms
    C.uR.value = 1
    C.uW.value = 1 / ppu
    C.uA0.value = 0
    C.uSweep.value = Math.PI * 2
    C.uProgress.value = draw
    rig.circle.scale.setScalar(1)

    // measurement frame: amber on the first vector, cobalt on the second (flips to −45° for |←⟩, D §3.2)
    const b = s.basis
    const e1a = b
    const flip = smooth((b - (3 * Math.PI) / 16) / (Math.PI / 16))
    const e2a = b + Math.PI / 2
    const e2b = b - Math.PI / 2
    const L = 1.25 * draw
    setStroke(rig.axis1, -L * Math.cos(b), -L * Math.sin(b), L * Math.cos(b), L * Math.sin(b), 1, ppu)
    setStroke(rig.axis2, -L * Math.cos(e2a), -L * Math.sin(e2a), L * Math.cos(e2a), L * Math.sin(e2a), 1, ppu)
    rig.axis1.material.uniforms.uOpacity.value = rig.axis2.material.uniforms.uOpacity.value = 0.9
    setArrow(rig.e1, e1a, draw, 1, ppu)
    setArrow(rig.e2, e2a, draw, 1 - flip, ppu)
    setArrow(rig.e2flip, e2b, draw, flip, ppu)
    const e2disp = flip > 0.5 ? e2b : e2a

    // right-angle mark (14 px, 1.5 px strokes) between the two basis vectors
    const m = 14 / ppu
    const ra = s.rightAngle * draw
    const u1: [number, number] = [Math.cos(e1a), Math.sin(e1a)]
    const u2: [number, number] = [Math.cos(e2disp), Math.sin(e2disp)]
    setStroke(rig.ra1, u1[0] * m, u1[1] * m, (u1[0] + u2[0]) * m, (u1[1] + u2[1]) * m, 1.5, ppu)
    setStroke(rig.ra2, u2[0] * m, u2[1] * m, (u1[0] + u2[0]) * m, (u1[1] + u2[1]) * m, 1.5, ppu)
    rig.ra1.material.uniforms.uOpacity.value = rig.ra2.material.uniforms.uOpacity.value = ra * (focus === 'right-angle' ? 1 : 0.85)
    rig.ra1.visible = rig.ra2.visible = ra > 0.01

    // ψ, its bead + glow
    const hasPsi = s.psi !== null && s.psiAlpha > 0.01
    const pa = s.psi ?? 0
    const psiA = hasPsi ? s.psiAlpha * draw : 0
    setArrow(rig.psi, pa, 1, psiA, ppu)
    rig.bead.visible = rig.halo.visible = psiA > 0.01
    rig.bead.position.set(Math.cos(pa), Math.sin(pa), 0)
    rig.bead.scale.setScalar(5 / ppu)
    rig.bead.material.opacity = psiA
    rig.halo.position.copy(rig.bead.position)
    rig.halo.scale.setScalar(15 / ppu)
    rig.halo.material.uniforms.uA.value = 0.35 * psiA

    // shadows: dashed drop-lines from ψ's tip, signed shadow segments on the two basis axes
    const sh = hasPsi ? s.shadows * psiA : 0
    const c1 = Math.cos(pa - e1a)
    const c2 = Math.cos(pa - e2disp)
    const tip: [number, number] = [Math.cos(pa), Math.sin(pa)]
    setStroke(rig.drop1, tip[0], tip[1], c1 * u1[0], c1 * u1[1], 1.5, ppu)
    setStroke(rig.drop2, tip[0], tip[1], c2 * u2[0], c2 * u2[1], 1.5, ppu)
    setStroke(rig.sh1, 0, 0, c1 * u1[0], c1 * u1[1], 5, ppu)
    setStroke(rig.sh2, 0, 0, c2 * u2[0], c2 * u2[1], 5, ppu)
    rig.drop1.material.uniforms.uOpacity.value = rig.drop2.material.uniforms.uOpacity.value = 0.9 * sh
    rig.sh1.material.uniforms.uOpacity.value = (focus === 'shadow-1' ? 0.95 : 0.6) * sh
    rig.sh2.material.uniforms.uOpacity.value = (focus === 'shadow-2' ? 0.95 : 0.6) * sh
    for (const x of [rig.drop1, rig.drop2, rig.sh1, rig.sh2]) x.visible = x.visible && sh > 0.01

    // θ/2 arc from the first basis vector to ψ
    const arcA = hasPsi ? s.arc * psiA : 0
    const A = rig.arc.material.uniforms
    const ar = Math.max(0.28, 24 / ppu)
    A.uR.value = ar
    A.uW.value = 1.5 / ppu
    A.uA0.value = e1a
    A.uSweep.value = pa - e1a
    A.uProgress.value = 1
    A.uOpacity.value = arcA
    rig.arc.visible = arcA > 0.01 && Math.abs(pa - e1a) > 1e-3

    // 1/√2 ticks on both axes (l1-vectors:b3)
    const tk = s.ticks * draw
    const r2 = Math.SQRT1_2
    const tl = 5 / ppu
    ;[u1, u2].forEach((u, i) => {
      const px = -u[1]
      const py = u[0]
      setStroke(rig.ticks[i], u[0] * r2 - px * tl, u[1] * r2 - py * tl, u[0] * r2 + px * tl, u[1] * r2 + py * tl, 1.5, ppu)
      rig.ticks[i].material.uniforms.uOpacity.value = tk
      rig.ticks[i].visible = tk > 0.01
    })

    // other arrows: second (near-white 70 %), ghost (near-white 35 %, dashed), basis (silver)
    s.others.slice(0, MAX_OTHERS).forEach((o, i) => {
      const ar2 = rig.others[i]
      const a = o.alpha * draw * (o.role === 'ghost' ? 0.35 : o.role === 'second' ? 0.75 : 0.9)
      ar2.shaft.material.uniforms.uOn.value = o.role === 'ghost' ? 6 : 0
      const col = o.role === 'basis' ? INK.silver : INK.state
      ar2.shaft.material.uniforms.uColor.value.set(col)
      ar2.head.material.color.set(col)
      setArrow(ar2, o.angle, 1, a, ppu)
    })
    for (let i = s.others.length; i < MAX_OTHERS; i++) rig.others[i].group.visible = false

    // probability bars at the right edge: 18 px wide, probability 1 = BAR_MAX px (engine numbers)
    const H = Math.min(BAR_MAX, Math.max(60, h - 120))
    const bottomPx = h / 2 + H / 2 + 6
    const xB = w - EDGE - BAR_W
    const xA = xB - BAR_GAP - BAR_W
    const toX = (px: number) => (px - cx) / R
    const toY = (py: number) => (cy - py) / R
    // bars and their numbers belong to the shadows (HilbertPlaneState.shadows: "projections + bars")
    const barsOn = s.probs && !inset ? psiA * s.shadows : 0
    const pA = s.probs?.[0] ?? 0
    const pB = s.probs?.[1] ?? 0
    for (const [mesh, x, hh, a] of [
      [rig.barTrackA, xA, H, 0.45],
      [rig.barTrackB, xB, H, 0.45],
      [rig.barA, xA, H * pA, 1],
      [rig.barB, xB, H * pB, 1],
    ] as const) {
      mesh.position.set(toX(x), toY(bottomPx), 0)
      mesh.scale.set(BAR_W / R, Math.max(1e-4, hh / R), 1)
      mesh.material.opacity = a * barsOn
      mesh.visible = barsOn > 0.01
    }
    // name the basis (round 3 #17): α, β are the z-basis coefficients in the text, so an x-basis bar is
    // |⟨+x|ψ⟩|², never "|α|²"
    const [nA, nB] = basisKets(b)
    writeReadout(rA, barsOn > 0.01 ? `|⟨${nA}|ψ⟩|² = ${pA.toFixed(3)}` : '')
    writeReadout(rB, barsOn > 0.01 ? `|⟨${nB}|ψ⟩|² = ${pB.toFixed(3)}` : '')

    /* ---------------- labels ---------------- */
    const at = (it: LabelItem, x: number, y: number, a: number, foc = false) => {
      it.anchor.set(x, y, 0)
      it.alpha = inset ? 0 : a
      it.focus = foc
    }
    const off = (px: number) => 1 + px / ppu
    at(items.e1, u1[0] * off(34), u1[1] * off(20) + (Math.abs(u1[1]) < 0.3 ? -18 / ppu : 0), draw, focus === 'basis-1')
    at(items.e2, u2[0] * off(20) + (Math.abs(u2[0]) < 0.3 ? 30 / ppu : 0), u2[1] * off(14), draw * (flip > 0.02 && flip < 0.98 ? 0 : 1), focus === 'basis-2')
    at(items.one, Math.cos(Math.PI / 6) * off(12), Math.sin(Math.PI / 6) * off(12), draw * 0.95)
    at(items.psi, tip[0] * off(20), tip[1] * off(20), psiA, focus === 'psi')
    const mid = (e1a + pa) / 2
    at(items.arc, Math.cos(mid) * (ar + 18 / ppu), Math.sin(mid) * (ar + 18 / ppu), rig.arc.visible ? arcA : 0, focus === 'angle-arc')
    at(items.tick1, u1[0] * r2 + 0 / ppu, u1[1] * r2 - 16 / ppu, tk)
    at(items.tick2, u2[0] * r2 - 26 / ppu, u2[1] * r2, tk)
    // the bars' numbers live in the readout column right above them (same hues); a bar's own tag shows
    // only while its term is focused (the two tags would not fit side by side under 18 px bars)
    at(items.barA, toX(xA + BAR_W / 2), toY(bottomPx + 14), focus === 'bar-1' ? barsOn : 0, true)
    at(items.barB, toX(xB + BAR_W / 2), toY(bottomPx + 14), focus === 'bar-2' ? barsOn : 0, true)
    for (let i = 0; i < MAX_OTHERS; i++) {
      const o = s.others[i]
      const lab = o ? ketAt(o.angle) : null
      // an arrow lying on a basis vector is already named by that axis label
      const onAxis = !!o && [e1a, e2disp].some((a) => Math.abs(Math.sin(o.angle - a)) < 1e-3 && Math.cos(o.angle - a) > 0)
      at(items[`o${i}`], o ? Math.cos(o.angle) * off(22) : 0, o ? Math.sin(o.angle) * off(22) : 0, o && lab && o.role !== 'ghost' && !onAxis ? o.alpha * draw : 0)
      at(items[`badge${i}`], o ? Math.cos(o.angle) * off(16) : 0, o ? Math.sin(o.angle) * off(16) - 22 / ppu : 0, o && o.badge ? o.alpha * draw : 0, focus === 'ghost')
    }

    // discrete label texts (frame names follow the basis; other arrows' kets; badges) → one React publish
    const zFrame = Math.abs(b) < Math.PI / 8
    const next: Record<string, string> = {
      e1: zFrame ? PASSPORT['hilbert-plane'].axes[0] : '$|{\\to}\\rangle = |{+x}\\rangle$',
      e2: zFrame ? PASSPORT['hilbert-plane'].axes[1] : '$|{\\leftarrow}\\rangle = |{-x}\\rangle$',
      // bar labels name their basis like the readouts (round 3 #17)
      barA: `$|\\langle{${basisKets(b)[0].replace('−', '-')}}|\\psi\\rangle|^2$`,
      barB: `$|\\langle{${basisKets(b)[1].replace('−', '-')}}|\\psi\\rangle|^2$`,
    }
    s.others.slice(0, MAX_OTHERS).forEach((o, i) => {
      next[`o${i}`] = ketAt(o.angle) ?? ''
      if (o.badge) next[`badge${i}`] = o.badge
    })
    const key = JSON.stringify(next)
    if (key !== S.key) {
      S.key = key
      if (JSON.stringify(textsRef.current) !== key) {
        textsRef.current = next
        setTexts(next)
      }
    }
  })

  return (
    <group>
      <primitive object={rig.root} ref={root} />
      <DevMeasure />
    </group>
  )
}
