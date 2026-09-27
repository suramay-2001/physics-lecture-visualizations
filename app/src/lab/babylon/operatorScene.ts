/**
 * The Operator Lab's picture (D-lab §2.2). Babylon only: it draws the page's OperatorLabView (engine values in physics
 * coordinates) and reports drags as points; it computes no physics and formats no number (lab/rules.test.ts).
 *
 * One engine, two LINKED views (same camera orientation; each view fitted to its own content):
 *   OPERATOR SPACE (layer a, left or top): silver axes a_x a_y a_z, a ghost Bloch sphere (three silver great circles),
 *     the orchid arrow a⃗ (a silver outline when A is not Hermitian), the dashed orchid eigen-axis ±â with unlit
 *     amber/cobalt eigen dots on the ghost sphere, a camera-facing a₀ gauge beside it (orchid a₀ mark, amber/cobalt
 *     eigenvalue ticks), and in commutator mode a faint b⃗ and the dashed orchid a⃗ × b⃗.
 *   STATE SPACE (layer b, right or bottom): the Bloch sphere (shell, great circles, axes), the dashed orchid turn axis
 *     â with the eigenstate dots, ψ₀ as a hollow near-white ring, its orbit about â (silver), the arc travelled
 *     (near-white) and the bead U(τ)ψ₀ with its line from the centre.
 * Handles (drag.ts): the a⃗ tip (a free point, silver ring), ψ₀ (on the sphere), the bead (on the orbit's plane).
 * Each view is cleared to its space's stage colour (tokens STAGE_BG), so the two spaces never look like one.
 */
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Viewport } from '@babylonjs/core/Maths/math.viewport'
import type { Material } from '@babylonjs/core/Materials/material'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder.pure'
import { CreateDashedLines, CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder.pure'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder.pure'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder.pure'
import type { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import '@babylonjs/core/Rendering/outlineRenderer'
import { INK, STAGE_BG } from '../../stage/tokens'
import type { V3 } from '../axes'
import type { LabView, OperatorHandle, OperatorLabView } from '../handle'
import type { BenchScene, BenchSceneContext, ScenePoint } from './benchScene'
import { attachDragHandle, type DragConstraint, type DragHandle } from './drag'
import { createLook, LAYER, v3 } from './look'

const OP = LAYER.a
const ST = LAYER.b
const AXIS_OP = 1.6
const AXIS_ST = 1.3
const EIGEN_LEN = 1.25
/** Gauge: beside the operator axes along the camera's right, ±GAUGE_MAX in steps of 1, GAUGE_UNIT world units each. */
const GAUGE_X = 1.8
const GAUGE_MAX = 4
const GAUGE_UNIT = 0.22
/** Content radius of each view for the camera fit (axes + gauge; sphere + pole labels). */
const FIT = { op: 2.05, state: 1.42 } as const
const FOV_DEG = 40
const ARC_N = 74
const ORBIT_N = 96

const circlePts = (axis: 'x' | 'y' | 'z', r = 1, n = 96): Vector3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a) * r
    const s = Math.sin(a) * r
    return v3(axis === 'z' ? [c, s, 0] : axis === 'x' ? [0, c, s] : [c, 0, s])
  })
const scale3 = (p: V3, k: number): V3 => [p[0] * k, p[1] * k, p[2] * k]
const len3 = (p: V3) => Math.hypot(p[0], p[1], p[2])

export function buildOperatorScene(ctx: BenchSceneContext): BenchScene {
  const { scene, camera: opCam, canvas } = ctx
  const engine = scene.getEngine()
  const look = createLook(scene, ctx.requestRender)
  scene.doNotHandleCursors = true

  /* ---------------- cameras and viewports ---------------- */
  opCam.layerMask = OP
  const stCam = new ArcRotateCamera('lab-state-camera', opCam.alpha, opCam.beta, opCam.radius, Vector3.Zero(), scene)
  stCam.layerMask = ST
  stCam.minZ = opCam.minZ
  stCam.maxZ = opCam.maxZ
  scene.activeCameras = [opCam, stCam]
  scene.activeCamera = opCam
  let split: 'lr' | 'tb' = 'lr'
  let ratio = FIT.state / FIT.op
  const bg = { op: Color4.FromHexString(`${STAGE_BG['operator-space']}ff`), state: Color4.FromHexString(`${STAGE_BG.bloch}ff`) }
  scene.autoClear = false
  const clearObs = scene.onBeforeCameraRenderObservable.add((cam) => {
    const vp = cam.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
    engine.enableScissor(vp.x, vp.y, vp.width, vp.height)
    engine.clear(cam === stCam ? bg.state : bg.op, true, true, false)
    engine.disableScissor()
  })

  const fitDistance = (vpW: number, vpH: number, fit: number) => {
    const half = (FOV_DEG * Math.PI) / 360
    const aspect = vpW / Math.max(1, vpH)
    const halfMin = Math.min(half, Math.atan(Math.tan(half) * aspect))
    return fit / Math.sin(halfMin)
  }
  const resize = () => {
    opCam.viewport = split === 'lr' ? new Viewport(0, 0, 0.5, 1) : new Viewport(0, 0.5, 1, 0.5)
    stCam.viewport = split === 'lr' ? new Viewport(0.5, 0, 0.5, 1) : new Viewport(0, 0, 1, 0.5)
    const w = engine.getRenderWidth()
    const h = engine.getRenderHeight()
    const [vw, vh] = split === 'lr' ? [w / 2, h] : [w, h / 2]
    const dOp = fitDistance(vw, vh, FIT.op)
    const dSt = fitDistance(vw, vh, FIT.state)
    ratio = dSt / dOp
    opCam.fov = stCam.fov = (FOV_DEG * Math.PI) / 180
    opCam.lowerRadiusLimit = dOp * 0.55
    opCam.upperRadiusLimit = dOp * 1.8
    opCam.radius = dOp
    // keep the content clear of the overlays: a tall, narrow view (left/right) moves it down, below the readout column;
    // a wide, short view (top/bottom; its readouts sit in the paper column) moves it a little right of the passport.
    // The offset is in view-space units (a pure screen shift, no change of angle).
    const cssPerPx = canvas.clientWidth / Math.max(1, w)
    const [sx, sy] = split === 'tb' ? [Math.min(40 / cssPerPx, vw * 0.07), 0] : [0, -Math.min(110 / cssPerPx, vh * 0.13)]
    const worldPerPx = (d: number) => (2 * d * Math.tan((FOV_DEG * Math.PI) / 360)) / vh
    opCam.targetScreenOffset.set(sx * worldPerPx(dOp), sy * worldPerPx(dOp))
    stCam.targetScreenOffset.set(sx * worldPerPx(dSt), sy * worldPerPx(dSt))
  }

  /* ---------------- materials ---------------- */
  const mat = {
    op: look.pbr('op', INK.op, { roughness: 0.38, metallic: 0.05, glow: 0.35 }),
    opFaint: look.pbr('op-faint', INK.op, { roughness: 0.45, glow: 0.2, alpha: 0.45 }),
    ghost: look.pbr('op-outline', INK.silver, { roughness: 0.6, alpha: 0.3 }),
    state: look.pbr('state', INK.state, { roughness: 0.3, glow: 0.55 }),
    stateRing: look.pbr('state-ring', INK.state, { roughness: 0.35, glow: 0.45 }),
    handle: look.pbr('handle', INK.silver, { roughness: 0.3, metallic: 0.6, glow: 0.15 }),
    handleHot: look.pbr('handle-hot', INK.text, { roughness: 0.3, metallic: 0.4, glow: 0.6 }),
    plus: look.unlit('plus', INK.plus),
    minus: look.unlit('minus', INK.minus),
    opMark: look.unlit('op-mark', INK.op),
    shell: new StandardMaterial('shell', scene),
    proxy: new StandardMaterial('proxy', scene),
  }
  mat.shell.diffuseColor = Color3.FromHexString('#a7b6cf')
  mat.shell.specularColor = new Color3(0.12, 0.12, 0.12)
  mat.shell.alpha = 0.08
  mat.shell.disableDepthWrite = true

  const tag = <T extends AbstractMesh | TransformNode>(n: T, layer: number): T => {
    if ('layerMask' in n) (n as AbstractMesh).layerMask = layer
    if ('isPickable' in n) (n as AbstractMesh).isPickable = false
    return n
  }
  const lines = (name: string, points: Vector3[], hex: string, alpha: number, layer: number, updatable = false) => {
    const l = CreateLines(name, { points, updatable }, scene)
    l.color = Color3.FromHexString(hex)
    l.alpha = alpha
    return tag(l, layer)
  }
  // dashed lines keep their dash pattern (set at creation) when updated through `instance` with new points only
  const dashed = (name: string, hex: string, layer: number) => {
    const l = CreateDashedLines(name, { points: [Vector3.Zero(), new Vector3(0, 1, 0)], dashSize: 3, gapSize: 2, dashNb: 26, updatable: true }, scene)
    l.color = Color3.FromHexString(hex)
    return tag(l, layer)
  }
  const updateDashed = (l: LinesMesh, pts: Vector3[]) => CreateDashedLines(l.name, { points: pts, instance: l }, scene)
  const sphere = (name: string, d: number, m: Material, layer: number) => {
    const s = CreateSphere(name, { diameter: d, segments: 20 }, scene)
    s.material = m
    return tag(s, layer)
  }
  /** A ring facing the camera (torus baked into the view plane, then billboarded). */
  const ring = (name: string, d: number, t: number, m: Material, layer: number) => {
    const r = CreateTorus(name, { diameter: d, thickness: t, tessellation: 40 }, scene)
    r.rotation.x = Math.PI / 2
    r.bakeCurrentTransformIntoVertices()
    r.billboardMode = TransformNode.BILLBOARDMODE_ALL
    r.material = m
    return tag(r, layer)
  }
  /** A pickable, invisible proxy around a handle (easier to grab than the visible mark). */
  const proxy = (name: string, d: number, layer: number, id: OperatorHandle) => {
    const p = CreateSphere(name, { diameter: d, segments: 8 }, scene)
    p.material = mat.proxy
    p.visibility = 0
    p.layerMask = layer
    p.isPickable = true
    p.metadata = { handle: id }
    return p
  }

  /** An arrow built along render +y: shaft and cone, re-aimed without new geometry. */
  const UP = new Vector3(0, 1, 0)
  const arrow = (name: string, m: Material, shaftD: number, headD: number, headLen: number, layer: number) => {
    const root = new TransformNode(name, scene)
    root.rotationQuaternion = new Quaternion()
    const shaft = tag(CreateCylinder(`${name}-shaft`, { height: 1, diameter: shaftD, tessellation: 16 }, scene), layer)
    const head = tag(CreateCylinder(`${name}-head`, { height: 1, diameterTop: 0, diameterBottom: headD, tessellation: 24 }, scene), layer)
    shaft.parent = head.parent = root
    shaft.material = head.material = m
    const dir = new Vector3()
    return {
      root,
      meshes: [shaft, head] as Mesh[],
      set(from: Vector3, vec: Vector3) {
        const len = vec.length()
        root.setEnabled(len > 1e-6)
        if (len <= 1e-6) return
        root.position.copyFrom(from)
        Quaternion.FromUnitVectorsToRef(UP, dir.copyFrom(vec).scaleInPlace(1 / len), root.rotationQuaternion!)
        const h = Math.min(headLen, len * 0.45)
        shaft.scaling.set(1, Math.max(1e-4, len - h), 1)
        shaft.position.set(0, (len - h) / 2, 0)
        const k = h / headLen
        head.scaling.set(k, h, k)
        head.position.set(0, len - h / 2, 0)
      },
      material(m2: Material) {
        shaft.material = head.material = m2
      },
    }
  }

  /* ---------------- operator space ---------------- */
  for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) lines('op-axis', [v3(scale3(a, -AXIS_OP)), v3(scale3(a, AXIS_OP))], INK.silver, 0.75, OP)
  for (const ax of ['z', 'x', 'y'] as const) lines('op-ghost', circlePts(ax), INK.silver2, 0.5, OP)
  const aArrow = arrow('a', mat.op, 0.044, 0.12, 0.17, OP)
  const bArrow = arrow('b', mat.opFaint, 0.034, 0.1, 0.14, OP)
  const crossLine = dashed('cross', INK.op, OP)
  const crossHead = arrow('cross-head', mat.op, 0.001, 0.1, 0.14, OP)
  const tipRing = ring('tip-ring', 0.2, 0.018, mat.handle, OP)
  const tipProxy = proxy('tip-proxy', 0.32, OP, 'tip')
  const opEigen = dashed('op-eigen', INK.op, OP)
  const opPlus = sphere('op-plus', 0.09, mat.plus, OP)
  const opMinus = sphere('op-minus', 0.09, mat.minus, OP)

  // the a₀ gauge: a camera-facing panel beside the axes (built in its own frame: x right, y up)
  const gauge = new TransformNode('gauge', scene)
  gauge.rotationQuaternion = new Quaternion()
  const G = GAUGE_MAX * GAUGE_UNIT
  const gLine = (name: string, pts: [number, number][], hex: string, alpha: number) => {
    const l = lines(name, pts.map(([x, y]) => new Vector3(x, y, 0)), hex, alpha, OP)
    l.parent = gauge
  }
  gLine('gauge-bar', [[0, -G], [0, G]], INK.silver, 0.9)
  for (let k = -GAUGE_MAX; k <= GAUGE_MAX; k++) {
    const w = k === 0 ? 0.07 : 0.035
    gLine('gauge-tick', [[-w, k * GAUGE_UNIT], [w, k * GAUGE_UNIT]], INK.silver, k === 0 ? 0.9 : 0.55)
  }
  const gMark = (name: string, w: number, h: number, m: Material) => {
    const b = CreateCylinder(name, { height: w, diameter: h, tessellation: 12 }, scene)
    b.rotation.z = Math.PI / 2
    b.material = m
    b.parent = gauge
    return tag(b, OP)
  }
  const gA0 = gMark('gauge-a0', 0.22, 0.04, mat.opMark)
  const gPlus = gMark('gauge-plus', 0.14, 0.026, mat.plus)
  const gMinus = gMark('gauge-minus', 0.14, 0.026, mat.minus)
  const gaugeY = (x: number) => Math.max(-GAUGE_MAX, Math.min(GAUGE_MAX, x)) * GAUGE_UNIT

  /* ---------------- state space ---------------- */
  sphere('shell', 2, mat.shell, ST)
  lines('st-equator', circlePts('z'), INK.silver2, 0.9, ST)
  lines('st-meridian', circlePts('y'), INK.silver2, 0.45, ST)
  lines('st-meridian', circlePts('x'), INK.silver2, 0.45, ST)
  for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) lines('st-axis', [v3(scale3(a, -AXIS_ST)), v3(scale3(a, AXIS_ST))], INK.silver, 0.7, ST)
  const stEigen = dashed('st-eigen', INK.op, ST)
  const stPlus = sphere('st-plus', 0.08, mat.plus, ST)
  const stMinus = sphere('st-minus', 0.08, mat.minus, ST)
  const zeros = (n: number) => Array.from({ length: n }, () => Vector3.Zero())
  let orbitLine = lines('orbit', zeros(ORBIT_N + 1), INK.silver2, 0.95, ST, true)
  let arcLine = lines('arc', zeros(ARC_N), INK.state, 0.85, ST, true)
  const psiRing = ring('psi0-ring', 0.17, 0.02, mat.stateRing, ST)
  const psiProxy = proxy('psi0-proxy', 0.26, ST, 'psi0')
  const bead = sphere('bead', 0.12, mat.state, ST)
  const beadRing = ring('bead-ring', 0.24, 0.014, mat.handle, ST)
  const beadProxy = proxy('bead-proxy', 0.28, ST, 'bead')
  let stateLine = lines('state-line', [Vector3.Zero(), v3([0, 0, 1])], INK.state, 0.8, ST, true)

  /* ---------------- handles ---------------- */
  let view: OperatorLabView | null = null
  const hot: Record<OperatorHandle, boolean> = { tip: false, psi0: false, bead: false }
  const onlyHandles = (m: AbstractMesh) =>
    !!(m.metadata as { handle?: string } | null)?.handle && m.isEnabled() && m.isPickable && (m.layerMask & (scene.cameraToUseForPointers?.layerMask ?? LAYER.all)) !== 0
  scene.pointerDownPredicate = onlyHandles
  scene.pointerMovePredicate = onlyHandles

  const constraint = (id: OperatorHandle) => (): DragConstraint | null => {
    if (!view || !view.draggable[id]) return null
    if (id === 'tip') return { kind: 'screen' }
    if (id === 'psi0') return { kind: 'sphere', center: [0, 0, 0], radius: 1 }
    return view.orbit ? { kind: 'plane', point: view.orbit.center, normal: view.orbit.axis } : null
  }
  const handles: DragHandle[] = (
    [
      ['tip', tipProxy, opCam],
      ['psi0', psiProxy, stCam],
      ['bead', beadProxy, stCam],
    ] as [OperatorHandle, Mesh, Camera][]
  ).map(([id, mesh, cam]) =>
    attachDragHandle(scene, {
      id,
      mesh,
      camera: cam,
      orbit: opCam,
      constraint: constraint(id),
      onDrag: (phase, p) => {
        canvas.style.cursor = phase === 'end' ? (hot[id] ? 'grab' : '') : 'grabbing'
        ctx.emit({ type: 'drag', handle: id, phase, p })
        ctx.requestRender()
      },
      onHover: (on) => {
        if (hot[id] === on) return
        hot[id] = on
        canvas.style.cursor = Object.values(hot).some(Boolean) ? 'grab' : ''
        paintHandles()
        ctx.requestRender()
      },
    }),
  )
  const dragging = () => handles.some((h) => h.dragging())

  // pointer routing: picks and drag rays use the camera of the view under the pointer (not while a drag runs)
  const route = (e: PointerEvent) => {
    if (dragging()) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) / Math.max(1, r.width)
    const y = (e.clientY - r.top) / Math.max(1, r.height)
    const inState = split === 'lr' ? x >= 0.5 : y >= 0.5
    scene.cameraToUseForPointers = inState ? stCam : opCam
  }
  window.addEventListener('pointermove', route, true)
  window.addEventListener('pointerdown', route, true)

  const paintHandles = () => {
    const f = view?.focus ?? null
    const on = (id: OperatorHandle) => hot[id] || f === id || handles.find((h) => h.id === id)!.dragging()
    tipRing.material = on('tip') ? mat.handleHot : mat.handle
    tipRing.scaling.setAll(on('tip') ? 1.3 : 1)
    psiRing.scaling.setAll(on('psi0') ? 1.3 : 1)
    beadRing.setEnabled(!!view?.showBead && !!view.draggable.bead)
    beadRing.material = on('bead') ? mat.handleHot : mat.handle
    beadRing.scaling.setAll(on('bead') ? 1.25 : 1)
  }

  /* ---------------- update from the view ---------------- */
  const O = Vector3.Zero()
  const setAxis = (l: LinesMesh, plus: Mesh, minus: Mesh, axis: V3 | null, r: number) => {
    const on = !!axis
    l.setEnabled(on)
    plus.setEnabled(on)
    minus.setEnabled(on)
    if (!axis) return
    updateDashed(l, [v3(scale3(axis, -EIGEN_LEN)), v3(scale3(axis, EIGEN_LEN))])
    plus.position.copyFrom(v3(scale3(axis, r)))
    minus.position.copyFrom(v3(scale3(axis, -r)))
  }
  const update = (vw: LabView) => {
    if (vw.bench !== 'operator') return
    if (vw.split !== split) {
      split = vw.split
      resize()
    }
    view = vw
    const k = vw.scale
    // operator space
    const tip = scale3(vw.a, k)
    aArrow.set(O, v3(tip))
    aArrow.root.setEnabled(vw.showArrow && len3(tip) > 1e-6)
    aArrow.material(vw.outline ? mat.ghost : mat.op)
    for (const m of aArrow.meshes) {
      m.renderOutline = vw.outline
      m.outlineColor = Color3.FromHexString(INK.silver)
      m.outlineWidth = 0.022
    }
    tipRing.position.copyFrom(v3(tip))
    tipProxy.position.copyFrom(v3(tip))
    tipRing.setEnabled(vw.showArrow)
    tipProxy.isPickable = vw.draggable.tip
    setAxis(opEigen, opPlus, opMinus, vw.axis, 1)
    gA0.setEnabled(vw.gauge.a0 !== null)
    gA0.position.set(0, gaugeY(vw.gauge.a0 ?? 0), 0)
    gPlus.setEnabled(vw.gauge.plus !== null)
    gPlus.position.set(0.02, gaugeY(vw.gauge.plus ?? 0), 0)
    gMinus.setEnabled(vw.gauge.minus !== null)
    gMinus.position.set(0.02, gaugeY(vw.gauge.minus ?? 0), 0)
    if (vw.b) bArrow.set(O, v3(scale3(vw.b, k)))
    bArrow.root.setEnabled(!!vw.b && len3(vw.b) > 1e-6)
    const cr = vw.cross && len3(vw.cross) > 1e-6 ? scale3(vw.cross, k) : null
    crossLine.setEnabled(!!cr)
    crossHead.root.setEnabled(!!cr)
    if (cr) {
      // a dashed shaft and a solid head (the head part of an arrow whose shaft is a hair)
      const l = len3(cr)
      const h = Math.min(0.14, l * 0.45)
      updateDashed(crossLine, [O, v3(scale3(cr, (l - h) / l))])
      crossHead.set(O, v3(cr))
    }
    // state space
    setAxis(stEigen, stPlus, stMinus, vw.axis, 1)
    psiRing.position.copyFrom(v3(vw.psi0))
    psiProxy.position.copyFrom(v3(vw.psi0))
    psiProxy.isPickable = vw.draggable.psi0
    bead.setEnabled(vw.showBead)
    bead.position.copyFrom(v3(vw.bead))
    beadRing.position.copyFrom(v3(vw.bead))
    beadProxy.position.copyFrom(v3(vw.bead))
    beadProxy.isPickable = vw.draggable.bead && vw.showBead
    stateLine = CreateLines('state-line', { points: [O, v3(vw.showBead ? vw.bead : vw.psi0)], instance: stateLine })
    const o = vw.orbit
    orbitLine.setEnabled(!!o)
    if (o) {
      // a circle of radius r about the axis through the centre (drawing geometry only)
      const n = v3(o.axis).normalize()
      const u = Vector3.Cross(n, Math.abs(n.y) < 0.9 ? Vector3.Up() : Vector3.Right()).normalize()
      const w = Vector3.Cross(n, u)
      const c = v3(o.center)
      const pts = Array.from({ length: ORBIT_N + 1 }, (_, i) => {
        const t = (i / ORBIT_N) * Math.PI * 2
        return c.add(u.scale(Math.cos(t) * o.radius)).add(w.scale(Math.sin(t) * o.radius))
      })
      orbitLine = CreateLines('orbit', { points: pts, instance: orbitLine })
    }
    arcLine.setEnabled(vw.arc.length > 1)
    if (vw.arc.length > 1) {
      const pts = Array.from({ length: ARC_N }, (_, i) => v3(vw.arc[Math.min(i, vw.arc.length - 1)]))
      arcLine = CreateLines('arc', { points: pts, instance: arcLine })
    }
    paintHandles()
  }

  /* ---------------- per frame: link the cameras, face the gauge ---------------- */
  const right = new Vector3()
  const beforeFrame = () => {
    stCam.alpha = opCam.alpha
    stCam.beta = opCam.beta
    stCam.radius = opCam.radius * ratio
    // gauge beside the axes along the camera's right, facing the camera
    opCam.getDirectionToRef(Vector3.Right(), right)
    gauge.position.copyFrom(right.scale(GAUGE_X))
    opCam.absoluteRotation && gauge.rotationQuaternion!.copyFrom(opCam.absoluteRotation)
  }

  const pt = (m: TransformNode | AbstractMesh, id: string): ScenePoint | null => (m.isEnabled() ? { world: m.getAbsolutePosition().clone(), view: id } : null)

  resize()
  return {
    update,
    cameraOf: (id) => (id === 'state' ? stCam : opCam),
    anchor(name) {
      if (name === 'gauge-a0') return pt(gA0, 'op')
      if (name === 'gauge-top') {
        gauge.computeWorldMatrix(true)
        return { world: Vector3.TransformCoordinates(new Vector3(0, G + 0.12, 0), gauge.getWorldMatrix()), view: 'op' }
      }
      if (name === 'gauge-plus') return pt(gPlus, 'op')
      if (name === 'gauge-minus') return pt(gMinus, 'op')
      return null
    },
    handle(id) {
      if (id === 'tip') return tipProxy.isPickable && tipRing.isEnabled() ? pt(tipProxy, 'op') : null
      if (id === 'psi0') return pt(psiProxy, 'state')
      if (id === 'bead') return bead.isEnabled() ? pt(bead, 'state') : null
      return null
    },
    beforeFrame,
    active: () => dragging(),
    resize,
    setGuiMode: () => {},
    dispose() {
      window.removeEventListener('pointermove', route, true)
      window.removeEventListener('pointerdown', route, true)
      scene.onBeforeCameraRenderObservable.remove(clearObs)
      for (const h of handles) h.dispose()
      look.dispose()
      canvas.style.cursor = ''
      // meshes, materials, lights, the probe and the second camera go with scene.dispose()
    },
  }
}
