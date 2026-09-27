/**
 * The Grapher's picture (D-lab §2.4). Babylon only: it draws the page's GrapherLabView (geometry built on the page from
 * the engine's samples, box coordinates, physics axes z up) and reports cursor drags as points; it computes no
 * physics and formats no number (lab/rules.test.ts).
 *
 * Graph space (a surface or a curve): the fitted box (nine faint edges, the three axis edges the default shot sees in
 * silver), the solid layer as an UNLIT mesh whose vertex colours are the page's luminance ramp (shade = height only,
 * no highlights; two-sided; pushed back a little so the wire and the cursor draw over it where they touch), the wire
 * layer as one-tone silver lines, a curve as a thin unlit tube shaded by t, a floor a shade above the background (what
 * lies under a surface reads as floor, not as a hole), the cursor as a silver handle with a dashed drop line to the
 * floor. Bloch path: the Bloch sphere (shell, equator and two meridians, axes), the path as a tube shaded by t, the
 * near-white state bead with its line from the centre, and a silver ring handle. Only finite numbers reach a vertex
 * buffer: the page's geometry is finite, and a tube whose frame came out non-finite falls back to a line.
 * Geometry is re-uploaded only when the page hands over a new geometry object (a re-sample, a layer, the scale);
 * cursor moves only move meshes. Each space clears to its own stage colour (tokens STAGE_BG).
 */
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Material } from '@babylonjs/core/Materials/material'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { CreateDashedLines, CreateLines, CreateLineSystem } from '@babylonjs/core/Meshes/Builders/linesBuilder.pure'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder.pure'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder.pure'
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder.pure'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import type { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { INK, STAGE_BG } from '../../stage/tokens'
import { shotPosition, type V3 } from '../axes'
import type { GrapherGeometry, GrapherLabView, LabView } from '../handle'
import type { BenchScene, BenchSceneContext, ScenePoint } from './benchScene'
import { attachDragHandle, type DragConstraint } from './drag'
import { createLook, v3 } from './look'

/** Content radius per space for the camera fit: the unit box and its labels; the sphere and its pole labels. */
const FIT = { graph: 2.0, bloch: 1.45 } as const
const FOV_DEG = 40
const AXIS_ST = 1.3
/** Paths are thin unlit tubes (a 1 px line hides the shade along t): radius in box / sphere units, sides. */
const TUBE = { graph: 0.011, bloch: 0.009, sides: 6 } as const
/** The box floor sits this far below the lowest sample, so a surface at its minimum never fights it for depth. */
const FLOOR_GAP = 0.004
/** The box floor: a shade above the stage background (the height ramp's dark end keeps 3:1 against it; review.test.ts
 *  reads these numbers). */
const FLOOR = { hex: '#262d39', alpha: 0.9 } as const
/**
 * The default shot per space (degrees). Graph space looks down more steeply than the lectures' Bloch shot (el 22°), so
 * a surface's top reads as its top and less floor shows under its arches (P review item 15); it equals model.ts
 * GRAPH_SHOT, which the < 900 px outline uses (review.test.ts). The Bloch path keeps B-STD.
 */
const GRAPH_EL = 34
const SHOT = { graph: { az: 30, el: GRAPH_EL }, bloch: { az: 30, el: 22 } } as const

const circlePts = (axis: 'x' | 'y' | 'z', n = 96): Vector3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    return v3(axis === 'z' ? [c, s, 0] : axis === 'x' ? [0, c, s] : [c, 0, s])
  })
/** A polyline's xyz (box coordinates, physics axes) as render-space points (physics (x, y, z) → render (x, z, −y)). */
const toPoints = (p: Float32Array): Vector3[] => {
  const out: Vector3[] = new Array(p.length / 3)
  for (let k = 0; k < out.length; k++) out[k] = new Vector3(p[3 * k], p[3 * k + 2], -p[3 * k + 1])
  return out
}
/** Drop consecutive points closer than `eps` (a tube's frame is undefined along a zero-length step); keep colours paired. */
function distinct(p: Float32Array, eps = 1e-6): { pts: Vector3[]; cols: number[] } {
  const pts: Vector3[] = []
  const cols: number[] = []
  for (let k = 0; k < p.length / 3; k++) {
    const v = new Vector3(p[3 * k], p[3 * k + 2], -p[3 * k + 1])
    if (pts.length && Vector3.DistanceSquared(v, pts[pts.length - 1]) < eps * eps) continue
    pts.push(v)
    cols.push(k)
  }
  return { pts, cols }
}
const allFinite = (a: ArrayLike<number> | null) => {
  if (!a) return false
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false
  return true
}

export function buildGrapherScene(ctx: BenchSceneContext): BenchScene {
  const { scene, camera, canvas } = ctx
  const engine = scene.getEngine()
  const look = createLook(scene, ctx.requestRender)
  scene.doNotHandleCursors = true
  const bg = { graph: Color4.FromHexString(`${STAGE_BG['lab-r3']}ff`), bloch: Color4.FromHexString(`${STAGE_BG.bloch}ff`) }

  /* ---------------- materials ---------------- */
  const surfMat = new StandardMaterial('gr-surface', scene)
  surfMat.disableLighting = true
  surfMat.emissiveColor = Color3.White()
  surfMat.backFaceCulling = false
  // lines and the cursor where they touch the surface stay in front of it: a slope term and a constant term, so a wire
  // lying on a face seen head-on (no slope) does not fight it either (P review item 15)
  surfMat.zOffset = 2
  surfMat.zOffsetUnits = 4
  // paths: unlit, the vertex colour (the shade along t) is the whole colour
  const pathMat = new StandardMaterial('gr-path', scene)
  pathMat.disableLighting = true
  pathMat.emissiveColor = Color3.White()
  // the box floor: a shade above the stage background, so what lies under a surface reads as floor, not as a hole
  const floorMat = new StandardMaterial('gr-floor', scene)
  floorMat.disableLighting = true
  floorMat.emissiveColor = Color3.FromHexString(FLOOR.hex)
  floorMat.alpha = FLOOR.alpha
  floorMat.backFaceCulling = false
  const mat = {
    handle: look.pbr('gr-handle', INK.silver, { roughness: 0.3, metallic: 0.6, glow: 0.2 }),
    handleHot: look.pbr('gr-handle-hot', INK.text, { roughness: 0.3, metallic: 0.4, glow: 0.6 }),
    state: look.pbr('gr-state', INK.state, { roughness: 0.3, glow: 0.55 }),
    shell: new StandardMaterial('gr-shell', scene),
    proxy: new StandardMaterial('gr-proxy', scene),
  }
  mat.shell.diffuseColor = Color3.FromHexString('#a7b6cf')
  mat.shell.specularColor = new Color3(0.12, 0.12, 0.12)
  mat.shell.alpha = 0.08
  mat.shell.disableDepthWrite = true

  const quiet = <T extends AbstractMesh>(m: T): T => {
    m.isPickable = false
    return m
  }
  const lines = (name: string, points: Vector3[], hex: string, alpha: number) => {
    const l = quiet(CreateLines(name, { points }, scene))
    l.color = Color3.FromHexString(hex)
    l.alpha = alpha
    return l
  }
  const sphere = (name: string, d: number, m: Material) => {
    const s = quiet(CreateSphere(name, { diameter: d, segments: 20 }, scene))
    s.material = m
    return s
  }
  const ring = (name: string, d: number, t: number, m: Material) => {
    const r = quiet(CreateTorus(name, { diameter: d, thickness: t, tessellation: 40 }, scene))
    r.rotation.x = Math.PI / 2
    r.bakeCurrentTransformIntoVertices()
    r.billboardMode = TransformNode.BILLBOARDMODE_ALL
    r.material = m
    return r
  }

  /* ---------------- the Bloch sphere (Bloch path only) ---------------- */
  const blochRoot = new TransformNode('gr-bloch', scene)
  const blochParts: AbstractMesh[] = [
    sphere('gr-shell', 2, mat.shell),
    lines('gr-equator', circlePts('z'), INK.silver2, 0.9),
    lines('gr-meridian', circlePts('y'), INK.silver2, 0.45),
    lines('gr-meridian', circlePts('x'), INK.silver2, 0.45),
    ...([[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]).map((a) =>
      lines('gr-axis', [v3([-a[0] * AXIS_ST, -a[1] * AXIS_ST, -a[2] * AXIS_ST]), v3([a[0] * AXIS_ST, a[1] * AXIS_ST, a[2] * AXIS_ST])], INK.silver, 0.7),
    ),
  ]
  for (const p of blochParts) p.parent = blochRoot

  /* ---------------- the cursor ---------------- */
  const cursorDot = sphere('gr-cursor', 0.07, mat.handle)
  const cursorRing = ring('gr-cursor-ring', 0.2, 0.016, mat.handle)
  const bead = sphere('gr-bead', 0.12, mat.state)
  let beadLine = quiet(CreateLines('gr-bead-line', { points: [Vector3.Zero(), new Vector3(0, 1, 0)], updatable: true }, scene))
  beadLine.color = Color3.FromHexString(INK.state)
  beadLine.alpha = 0.8
  const drop = quiet(CreateDashedLines('gr-drop', { points: [Vector3.Zero(), new Vector3(0, 1, 0)], dashSize: 3, gapSize: 2, dashNb: 18, updatable: true }, scene))
  drop.color = Color3.FromHexString(INK.silver)
  drop.alpha = 0.8
  const proxy = CreateSphere('gr-cursor-proxy', { diameter: 0.28, segments: 8 }, scene)
  proxy.material = mat.proxy
  proxy.visibility = 0
  proxy.metadata = { handle: 'cursor' }

  /* ---------------- geometry (rebuilt only when the page hands over a new one) ---------------- */
  let space: 'graph' | 'bloch' = 'graph'
  let geometry: GrapherGeometry | null = null
  let built: AbstractMesh[] = []
  const rebuild = (g: GrapherGeometry) => {
    for (const m of built) m.dispose()
    built = []
    if (g.box) {
      const [x0, y0, z0] = g.box.min
      const [x1, y1, z1] = g.box.max
      const P = (x: number, y: number, z: number) => v3([x, y, z])
      // the three axis edges seen in front at the default shot (x along y = max, y along x = max, height at x = max, y = min)
      const axes = [
        [P(x0, y1, z0), P(x1, y1, z0)],
        [P(x1, y0, z0), P(x1, y1, z0)],
        [P(x1, y0, z0), P(x1, y0, z1)],
      ]
      const rest = [
        [P(x0, y0, z0), P(x1, y0, z0)],
        [P(x0, y0, z0), P(x0, y1, z0)],
        [P(x0, y0, z0), P(x0, y0, z1)],
        [P(x0, y1, z0), P(x0, y1, z1)],
        [P(x1, y1, z0), P(x1, y1, z1)],
        [P(x0, y0, z1), P(x1, y0, z1)],
        [P(x0, y0, z1), P(x0, y1, z1)],
        [P(x1, y0, z1), P(x1, y1, z1)],
        [P(x0, y1, z1), P(x1, y1, z1)],
      ]
      const a = quiet(CreateLineSystem('gr-axes', { lines: axes }, scene))
      a.color = Color3.FromHexString(INK.silver)
      a.alpha = 0.9
      const r = quiet(CreateLineSystem('gr-box', { lines: rest }, scene))
      r.color = Color3.FromHexString(INK.silver2)
      r.alpha = 0.45
      const zf = z0 - FLOOR_GAP
      const floor = quiet(new Mesh('gr-floor', scene))
      const fd = new VertexData()
      fd.positions = [P(x0, y0, zf), P(x1, y0, zf), P(x1, y1, zf), P(x0, y1, zf)].flatMap((v) => [v.x, v.y, v.z])
      fd.indices = [0, 1, 2, 0, 2, 3]
      fd.applyToMesh(floor)
      floor.material = floorMat
      // a faint grid on the floor (eighths of each range): it reads as a floor, not as a hole, under a surface
      const grid: Vector3[][] = []
      for (let k = 1; k < 8; k++) {
        const fx = x0 + ((x1 - x0) * k) / 8
        const fy = y0 + ((y1 - y0) * k) / 8
        grid.push([P(fx, y0, zf), P(fx, y1, zf)], [P(x0, fy, zf), P(x1, fy, zf)])
      }
      const gl = quiet(CreateLineSystem('gr-floor-grid', { lines: grid }, scene))
      gl.color = Color3.FromHexString(INK.silver3)
      gl.alpha = 0.8
      built.push(a, r, floor, gl)
    }
    if (g.surface && g.surface.indices.length > 0) {
      const src = g.surface.positions
      const pos = new Float32Array(src.length)
      for (let k = 0; k < src.length; k += 3) {
        pos[k] = src[k]
        pos[k + 1] = src[k + 2]
        pos[k + 2] = -src[k + 1]
      }
      const m = quiet(new Mesh('gr-solid', scene))
      const vd = new VertexData()
      vd.positions = pos
      vd.colors = g.surface.colors
      vd.indices = g.surface.indices
      vd.applyToMesh(m)
      m.material = surfMat
      built.push(m)
    }
    if (g.wire.length) {
      const w = quiet(CreateLineSystem('gr-wire', { lines: g.wire.map(toPoints) }, scene)) as LinesMesh
      w.color = Color3.FromHexString(INK.silver)
      w.alpha = 0.95
      built.push(w)
    }
    for (const piece of g.path) {
      const { pts, cols } = distinct(piece.points)
      if (pts.length < 2) continue
      const t = quiet(CreateTube('gr-path', { path: pts, radius: g.space === 'bloch' ? TUBE.bloch : TUBE.graph, tessellation: TUBE.sides }, scene))
      // the tube's vertices: one ring of (sides + 1) per path point, in path order; each ring takes its point's shade
      const n = t.getTotalVertices()
      const ring = TUBE.sides + 1
      if (n === pts.length * ring) {
        const rgba = new Float32Array(4 * n)
        for (let i = 0; i < pts.length; i++) for (let j = 0; j < ring; j++) rgba.set(piece.colors.subarray(4 * cols[i], 4 * cols[i] + 4), 4 * (i * ring + j))
        t.setVerticesData(VertexBuffer.ColorKind, rgba)
      }
      // only finite numbers in a vertex buffer: a tube whose frame came out non-finite is drawn as a plain line instead
      if (!allFinite(t.getVerticesData(VertexBuffer.PositionKind))) {
        t.dispose()
        const l = quiet(CreateLines('gr-path-line', { points: pts }, scene))
        l.color = Color3.FromHexString(INK.silver)
        built.push(l)
        continue
      }
      t.material = pathMat
      built.push(t)
    }
    if (g.space !== space) {
      space = g.space
      aim()
      resize()
    }
    blochRoot.setEnabled(space === 'bloch')
    scene.clearColor = bg[space]
  }

  /* ---------------- the handle ---------------- */
  let view: GrapherLabView | null = null
  let hot = false
  const onlyHandles = (m: AbstractMesh) => !!(m.metadata as { handle?: string } | null)?.handle && m.isEnabled() && m.isPickable
  scene.pointerDownPredicate = onlyHandles
  scene.pointerMovePredicate = onlyHandles
  const handle = attachDragHandle(scene, {
    id: 'cursor',
    mesh: proxy,
    camera: camera as Camera,
    orbit: camera,
    constraint: (): DragConstraint | null => (view?.drag ? (view.drag as DragConstraint) : null),
    onDrag: (phase, p) => {
      canvas.style.cursor = phase === 'end' ? (hot ? 'grab' : '') : 'grabbing'
      ctx.emit({ type: 'drag', handle: 'cursor', phase, p })
      ctx.requestRender()
    },
    onHover: (on) => {
      if (hot === on) return
      hot = on
      canvas.style.cursor = on ? 'grab' : ''
      paint()
      ctx.requestRender()
    },
  })
  const paint = () => {
    const on = hot || !!view?.focus || handle.dragging()
    cursorRing.material = on ? mat.handleHot : mat.handle
    cursorRing.scaling.setAll(on ? 1.3 : 1)
  }

  const O = Vector3.Zero()
  const update = (vw: LabView) => {
    if (vw.bench !== 'grapher') return
    view = vw
    if (vw.geometry !== geometry) {
      geometry = vw.geometry
      rebuild(vw.geometry)
    }
    const c = vw.cursor
    const at = c.at ? v3(c.at) : null
    const graphCursor = !!at && !c.state
    const stateCursor = !!at && c.state
    cursorDot.setEnabled(graphCursor)
    bead.setEnabled(stateCursor)
    beadLine.setEnabled(stateCursor)
    cursorRing.setEnabled(!!at)
    proxy.setEnabled(!!at)
    proxy.isPickable = !!at && !!vw.drag
    drop.setEnabled(graphCursor && !!c.floor)
    if (at) {
      cursorDot.position.copyFrom(at)
      bead.position.copyFrom(at)
      cursorRing.position.copyFrom(at)
      proxy.position.copyFrom(at)
      if (stateCursor) beadLine = CreateLines('gr-bead-line', { points: [O, at], instance: beadLine })
      if (graphCursor && c.floor) CreateDashedLines('gr-drop', { points: [v3(c.floor), at], instance: drop }, scene)
    }
    paint()
  }

  /* ---------------- camera fit ---------------- */
  const fitDistance = (vpW: number, vpH: number, fit: number) => {
    const half = (FOV_DEG * Math.PI) / 360
    const halfMin = Math.min(half, Math.atan(Math.tan(half) * (vpW / Math.max(1, vpH))))
    return fit / Math.sin(halfMin)
  }
  /** The space's default shot (a new space is a new picture; re-sampling the same space keeps the student's orbit). */
  function aim() {
    const [x, y, z] = shotPosition(SHOT[space].az, SHOT[space].el, camera.radius)
    camera.setPosition(new Vector3(x, y, z))
    camera.inertialAlphaOffset = camera.inertialBetaOffset = camera.inertialRadiusOffset = 0
  }
  function resize() {
    const w = engine.getRenderWidth()
    const h = engine.getRenderHeight()
    const d = fitDistance(w, h, FIT[space])
    camera.fov = (FOV_DEG * Math.PI) / 180
    camera.lowerRadiusLimit = d * 0.5
    camera.upperRadiusLimit = d * 1.8
    camera.radius = d
    // keep the content clear of the overlays: a little down (below the readout column) and left of it
    const cssPerPx = canvas.clientWidth / Math.max(1, w)
    const sx = Math.min(110 / cssPerPx, w * 0.09)
    const sy = -Math.min(50 / cssPerPx, h * 0.06)
    const worldPerPx = (2 * d * Math.tan((FOV_DEG * Math.PI) / 360)) / h
    camera.targetScreenOffset.set(sx * worldPerPx, sy * worldPerPx)
  }

  const pt = (m: AbstractMesh): ScenePoint | null => (m.isEnabled() ? { world: m.getAbsolutePosition().clone() } : null)
  aim()
  resize()
  scene.clearColor = bg[space]
  blochRoot.setEnabled(false)
  return {
    update,
    cameraOf: () => camera,
    anchor: () => null,
    handle: (id) => (id === 'cursor' || id === 'bead' ? pt(proxy) : null),
    beforeFrame: () => {},
    active: () => handle.dragging(),
    resize,
    setGuiMode: () => {},
    dispose() {
      handle.dispose()
      look.dispose()
      canvas.style.cursor = ''
      // meshes, materials, lights and the probe go with scene.dispose()
    },
  }
}
