/**
 * The Stern–Gerlach bench's picture (D-lab §2.1). Babylon only: it draws the page's SgLabView (hardware places, the pole
 * profile, field lines, the plate's marks and a volley's flight paths, all built on the page from the engine's fates in
 * physics coordinates) and reports gestures; it computes no physics and formats no number (lab/rules.test.ts).
 *
 *   - Everything hangs under one root node that turns physics (beam +y, z up) into render coordinates (lab/axes.ts), so
 *     every frame the page hands over is set as it is, and the Blender parts (lab.glb, physics-local coordinates) and the
 *     procedural poles (the POLE profile the page passes) drop into their module frames unchanged.
 *   - Hardware: yoke, coils and axis mount per magnet, oven, slit, plate frame, stops, rail, geometry only (the page reads
 *     lab.glb with lab/glb.ts; no loader). Box stand-ins until it arrives, and for good if it cannot be read.
 *   - Affordances (no text; every one has a DOM twin): a protractor ring with 15° ticks and a KNOB per magnet (drag it
 *     about the beam); ± PADS beside each stop's two beams (tap: that beam continues); a "+" pad at the rail end (add a
 *     magnet) and a "×" pad above each magnet (remove it: P review #12, so ± only ever names a beam). Taps and drags go
 *     to the page as LabGuiActions.
 *   - Atoms: thin instances of one small unlit sphere, a head and two fading trail samples each (≤ 2 000 atoms of a
 *     volley in flight); the plate's marks are thin instances of a flat disc on the glass (≤ 20 000). Outcome colours are
 *     the reserved amber / cobalt, unlit and untouched by tone mapping.
 *   - The plate inset: a second, orthographic camera looks along the beam at the plate (bottom-right viewport), over a
 *     backdrop only it sees. It draws the plate alone (glass, frame, marks): every other mesh is on the main view's layer
 *     (P review #3); the atoms fly only in the main view.
 * Motion (D-lab §5, the closed list): a volley flies ≤ 1.8 s (the page's schedule); adding or removing a magnet slides the
 * bench's parts to their new places in 300 ms; nothing else moves. With motion off both are cuts. On-demand rendering:
 * frames are drawn only while a volley flies, a slide runs or a gesture is in progress.
 */
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { Camera as CameraClass } from '@babylonjs/core/Cameras/camera'
import { TargetCamera } from '@babylonjs/core/Cameras/targetCamera'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import { Material } from '@babylonjs/core/Materials/material'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Frustum } from '@babylonjs/core/Maths/math.frustum'
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Viewport } from '@babylonjs/core/Maths/math.viewport'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder.pure'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder.pure'
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder.pure'
import { CreateLineSystem } from '@babylonjs/core/Meshes/Builders/linesBuilder.pure'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder.pure'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder.pure'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import '@babylonjs/core/Meshes/thinInstanceMesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { INK, LAB_MATERIAL, STAGE_BG } from '../../stage/tokens'
import { physToRender, type V3 } from '../axes'
import type { LabView, SgFrame, SgHardwareMesh, SgLabView, SgLayoutView } from '../handle'
import type { BenchScene, BenchSceneContext, ScenePoint } from './benchScene'
import { attachDragHandle, type DragHandle } from './drag'
import { createLook, LAYER, v3 } from './look'

const MAX_MODULES = 4
/** Per atom in flight: a head and two trail samples (seconds behind it), scale and brightness each. */
const TRAIL: readonly { dt: number; scale: number; fade: number }[] = [
  { dt: 0, scale: 0.13, fade: 1 },
  { dt: 0.03, scale: 0.095, fade: 0.55 },
  { dt: 0.06, scale: 0.07, fade: 0.3 },
]
const MAX_ATOMS = 2000
const MAX_MARKS = 20000
const MARK_R = 0.022
const SLIDE_MS = 300
/** The main shot: from the open (+x) side, a little upstream, looking across the bench (physics az / el, degrees). */
const SHOT = { az: -38, el: 21, fovDeg: 40 } as const
/** The plate inset camera: this far upstream of the plate; its half-width (the frame is 2.46 wide). */
const INSET = { back: 1.1, half: 1.45 } as const

/* ---------------- frames: physics column-vector transforms → Babylon nodes ---------------- */
const matOf = (f: SgFrame): Matrix => {
  const R = f.R
  return Matrix.FromArray([R[0], R[3], R[6], 0, R[1], R[4], R[7], 0, R[2], R[5], R[8], 0, f.o[0], f.o[1], f.o[2], 1])
}
/** parent⁻¹ · child (both physics frames). */
function rel(parent: SgFrame, child: SgFrame): SgFrame {
  const P = parent.R
  const C = child.R
  const d = [child.o[0] - parent.o[0], child.o[1] - parent.o[1], child.o[2] - parent.o[2]]
  const o: V3 = [P[0] * d[0] + P[3] * d[1] + P[6] * d[2], P[1] * d[0] + P[4] * d[1] + P[7] * d[2], P[2] * d[0] + P[5] * d[1] + P[8] * d[2]]
  const R = new Array<number>(9)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[i * 3 + j] = P[i] * C[j] + P[3 + i] * C[3 + j] + P[6 + i] * C[6 + j]
  return { o, R }
}
const localPoint = (f: SgFrame, p: V3): Vector3 => {
  const r = rel(f, { o: p, R: [1, 0, 0, 0, 1, 0, 0, 0, 1] }).o
  return new Vector3(r[0], r[1], r[2])
}
const _s = new Vector3()
function setNode(node: TransformNode, f: SgFrame): void {
  const q = node.rotationQuaternion ?? (node.rotationQuaternion = new Quaternion())
  matOf(f).decompose(_s, q, node.position)
}
interface Pose {
  p: Vector3
  q: Quaternion
}
const poseOf = (f: SgFrame): Pose => {
  const p = new Vector3()
  const q = new Quaternion()
  matOf(f).decompose(_s, q, p)
  return { p, q }
}

/* ---------------- procedural poles (the page's POLE profile), module-local physics coordinates ---------------- */
type Pole = SgLabView['pole']
function knifeZ(P: Pole, x: number): number {
  const r = P.tipR
  const zc = P.tipZ + r
  const a = (35 * Math.PI) / 180
  const xt = r * Math.sin(a)
  const ax = Math.abs(x)
  if (ax <= xt) return zc - Math.sqrt(r * r - ax * ax)
  return zc - r * Math.cos(a) + (ax - xt) * Math.tan(a)
}
function grooveZ(P: Pole, x: number): number {
  const hw = P.grooveHalf
  const depth = P.grooveDepth
  const R = (hw * hw + depth * depth) / (2 * depth)
  const zc = P.shoulderZ - depth + R
  const ax = Math.abs(x)
  if (ax >= hw) return P.shoulderZ
  return zc - Math.sqrt(Math.max(0, R * R - ax * ax))
}
/** A pole as a closed height-field solid extruded along the beam (the lecture lab's construction). */
function poleData(P: Pole, top: boolean, L: number): VertexData {
  const W = P.halfWidth
  const back = top ? 1.55 : -1.55
  const zOf = (x: number) => (top ? knifeZ(P, x) : grooveZ(P, x))
  const xs: number[] = []
  for (let i = 0; i < 41; i++) {
    const t = (2 * i) / 40 - 1
    xs.push(W * Math.sign(t) * Math.abs(t) ** 1.7)
  }
  const pos: number[] = []
  const nor: number[] = []
  const facesUp = !top
  const quad = (a: number[], b: number[], c: number[], d: number[], na?: number[], nb?: number[], nc?: number[], nd?: number[]) => {
    pos.push(...a, ...b, ...c, ...a, ...c, ...d)
    if (!na) {
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
      const l = Math.hypot(n[0], n[1], n[2]) || 1
      for (let i = 0; i < 6; i++) nor.push(n[0] / l, n[1] / l, n[2] / l)
    } else nor.push(...na, ...nb!, ...nc!, ...na, ...nc!, ...nd!)
  }
  const nAt = (x: number) => {
    const h = 1e-3
    const x0 = Math.max(-W, x - h)
    const x1 = Math.min(W, x + h)
    const s = (zOf(x1) - zOf(x0)) / (x1 - x0)
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
    if (facesUp) quad([x0, 0, z0], [x1, 0, z1], [x1, L, z1], [x0, L, z0], n0, n1, n1, n0)
    else quad([x0, 0, z0], [x0, L, z0], [x1, L, z1], [x1, 0, z1], n0, n0, n1, n1)
    if (facesUp) quad([x0, 0, back], [x0, L, back], [x1, L, back], [x1, 0, back])
    else quad([x0, 0, back], [x1, 0, back], [x1, L, back], [x0, L, back])
    if (facesUp) {
      quad([x0, 0, z0], [x0, 0, back], [x1, 0, back], [x1, 0, z1])
      quad([x0, L, z0], [x1, L, z1], [x1, L, back], [x0, L, back])
    } else {
      quad([x0, 0, z0], [x1, 0, z1], [x1, 0, back], [x0, 0, back])
      quad([x0, L, z0], [x0, L, back], [x1, L, back], [x1, L, z1])
    }
  }
  const zl = zOf(-W)
  const zr = zOf(W)
  if (facesUp) {
    quad([-W, 0, zl], [-W, L, zl], [-W, L, back], [-W, 0, back])
    quad([W, 0, zr], [W, 0, back], [W, L, back], [W, L, zr])
  } else {
    quad([-W, 0, zl], [-W, 0, back], [-W, L, back], [-W, L, zl])
    quad([W, 0, zr], [W, L, zr], [W, L, back], [W, 0, back])
  }
  const vd = new VertexData()
  vd.positions = pos
  vd.normals = nor
  vd.indices = Array.from({ length: pos.length / 3 }, (_, i) => i)
  return vd
}

type PartName = 'sg_yoke' | 'sg_coils' | 'sg_axis_mount' | 'oven' | 'slit' | 'plate_frame' | 'beam_stop' | 'bench_rail'

export function buildSgScene(ctx: BenchSceneContext): BenchScene {
  const { scene, camera, canvas } = ctx
  const engine = scene.getEngine()
  const look = createLook(scene, ctx.requestRender)
  scene.doNotHandleCursors = true
  scene.clearColor = Color4.FromHexString(`${STAGE_BG['lab-r3']}ff`)
  camera.layerMask = LAYER.a
  scene.cameraToUseForPointers = camera
  // P review #3: every mesh is drawn in the main view only (LAYER.a) unless it is the plate itself. The plate inset's
  // camera sees LAYER.b: the plate's glass, frame and marks and its own backdrop, never the rail, the floor, a pad or a
  // magnet, however low the chain runs. (The procedural room keeps its own layer: createLook made it before this.)
  // (Babylon announces a new mesh a tick later, so only a mesh still on the default mask is moved: the plate's parts set
  // theirs when they are made.)
  const mainOnly = scene.onNewMeshAddedObservable.add((m) => {
    if (m.layerMask === LAYER.all) m.layerMask = LAYER.a
  })
  const PLATE_LAYERS = LAYER.a | LAYER.b

  /* ---------------- the physics root ---------------- */
  const root = new TransformNode('sg-root', scene)
  root.rotationQuaternion = new Quaternion()
  Matrix.FromArray([1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1]).decompose(_s, root.rotationQuaternion, root.position)

  /* ---------------- materials ---------------- */
  const noTone = (m: StandardMaterial) => {
    m.imageProcessingConfiguration = new ImageProcessingConfiguration()
    m.imageProcessingConfiguration.isEnabled = false
    return m
  }
  const unlit = (name: string, hex: string, alpha = 1) => {
    const m = look.unlit(name, hex, alpha)
    m.backFaceCulling = false
    return m
  }
  const mat = {
    // brushed steel and painted iron, kept mostly dielectric so the key and fill lights read on a dark stage (a mirror-like
    // metal only reflects the dim procedural room). P review #5: the yoke is painted in the plate frame's light grey (was
    // #39414f, 1.6 : 1 as a token), so a magnet reads as an object: about half of each magnet's footprint measures ≥ 3 : 1
    // on the stage (lab.spec.ts review #5); the greyed preparation magnet keeps its dark paint and reads as inactive.
    pole: look.pbr('sg-pole', LAB_MATERIAL.pole, { metallic: 0.45, roughness: 0.34 }),
    polePrep: look.pbr('sg-pole-prep', LAB_MATERIAL.prep, { metallic: 0.2, roughness: 0.6 }),
    yoke: look.pbr('sg-yoke', LAB_MATERIAL.frame, { metallic: 0.05, roughness: 0.6 }),
    yokePrep: look.pbr('sg-yoke-prep', '#2c323c', { metallic: 0.1, roughness: 0.6 }),
    coil: look.pbr('sg-coil', LAB_MATERIAL.coil, { metallic: 0.05, roughness: 0.85 }),
    oven: look.pbr('sg-oven', LAB_MATERIAL.oven, { metallic: 0.4, roughness: 0.35 }),
    slit: look.pbr('sg-slit', LAB_MATERIAL.slit, { metallic: 0.35, roughness: 0.4 }),
    frame: look.pbr('sg-frame', LAB_MATERIAL.frame, { metallic: 0.45, roughness: 0.3 }),
    glass: look.pbr('sg-glass', LAB_MATERIAL.glass, { roughness: 0.08, alpha: 0.16 }),
    stop: look.pbr('sg-stop', INK.silver3, { metallic: 0.2, roughness: 0.6 }),
    rail: look.pbr('sg-rail', LAB_MATERIAL.rail, { metallic: 0.3, roughness: 0.55 }),
    box: look.pbr('sg-box', LAB_MATERIAL.box, { roughness: 0.9, metallic: 0.05 }),
    floor: look.pbr('sg-floor', '#161c27', { metallic: 0, roughness: 0.9 }),
    // the protractor ring is a control's track: silver2 at full opacity, untouched by tone mapping, 3.7 : 1 on the stage
    // (was α 0.7, 2.7–2.8 : 1 measured; P review #5)
    ring: noTone(unlit('sg-ring', INK.silver2)),
    knob: look.pbr('sg-knob', INK.silver, { roughness: 0.3, metallic: 0.6, glow: 0.25 }),
    knobHot: look.pbr('sg-knob-hot', INK.text, { roughness: 0.3, metallic: 0.4, glow: 0.7 }),
    padBack: unlit('sg-pad-back', '#20262f'),
    padGlyph: unlit('sg-pad-glyph', INK.silver),
    padOn: unlit('sg-pad-on', INK.text),
    proxy: new StandardMaterial('sg-proxy', scene),
    backdrop: unlit('sg-backdrop', STAGE_BG.inset),
  }
  // the glass must not hide the marks behind it from the inset, nor write depth over them
  mat.glass.backFaceCulling = false
  // outcome colours stay the reserved hexes: unlit, no tone mapping (the lecture's toneMapped: false)
  const dotMat = noTone(new StandardMaterial('sg-dot', scene))
  dotMat.disableLighting = true
  dotMat.emissiveColor = Color3.White()
  dotMat.backFaceCulling = false

  const quiet = <T extends AbstractMesh>(m: T): T => {
    m.isPickable = false
    return m
  }
  /**
   * Geometry this file writes itself (lab.glb's parts, the procedural poles, the floor) winds its front faces counter-
   * clockwise, glTF's convention. A `new Mesh` in a right-handed Babylon scene defaults to clockwise, which culled the
   * FRONT faces: the bench drew the insides of its magnets, lit from behind, 1.0–1.2 : 1 on the stage (P review #5).
   * Babylon's own builders (stand-ins, knobs, pads) keep their default.
   */
  const ccw = <T extends Mesh>(m: T): T => {
    m.sideOrientation = Material.CounterClockWiseSideOrientation
    return m
  }

  /* ---------------- rigs: pools for the largest bench (4 magnets + a preparation magnet) ---------------- */
  interface PadRig {
    node: TransformNode
    back: Mesh
    glyph: Mesh[]
    id: string
  }
  /** A pad: "+" keeps + or adds a magnet, "−" keeps −, "×" removes a magnet (P review #12: one glyph, one job). */
  const pad = (id: string, glyph: '+' | '-' | '×', parent: TransformNode): PadRig => {
    const node = new TransformNode(`sg-pad-${id}`, scene)
    node.parent = parent
    const holder = new TransformNode(`sg-pad-bb-${id}`, scene)
    holder.parent = node
    holder.billboardMode = TransformNode.BILLBOARDMODE_ALL
    const back = CreateDisc(`sg-pad-disc-${id}`, { radius: 0.3, tessellation: 28, sideOrientation: Mesh.DOUBLESIDE }, scene)
    back.parent = holder
    back.material = mat.padBack
    back.metadata = { pad: id }
    // pads are controls: drawn over the hardware (a later rendering group), so a pad behind a magnet stays reachable
    const rim = quiet(CreateTorus(`sg-pad-rim-${id}`, { diameter: 0.6, thickness: 0.035, tessellation: 28 }, scene))
    rim.rotation.x = Math.PI / 2
    rim.parent = holder
    rim.material = mat.padGlyph
    // the glyph bars poke through both faces of the disc (a billboard's facing side depends on the handedness)
    const bar = (w: number, h: number, turn = 0) => {
      const b = quiet(CreateBox(`sg-pad-bar-${id}`, { width: w, height: h, depth: 0.07 }, scene))
      b.parent = holder
      b.material = mat.padGlyph
      b.rotation.z = turn
      return b
    }
    const glyphs = glyph === '+' ? [bar(0.3, 0.065), bar(0.065, 0.3)] : glyph === '×' ? [bar(0.32, 0.065, Math.PI / 4), bar(0.32, 0.065, -Math.PI / 4)] : [bar(0.3, 0.065)]
    for (const m of [back, rim, ...glyphs]) m.renderingGroupId = 1
    return { node, back, glyph: [rim, ...glyphs], id }
  }

  interface ModuleRig {
    base: TransformNode
    tilted: TransformNode
    knife: Mesh
    groove: Mesh
    parts: TransformNode
    field: Mesh | null
    ring: Mesh | null
    ticks: Mesh | null
    knob: TransformNode | null
    knobDot: Mesh | null
    knobRing: Mesh | null
    proxy: Mesh | null
    remove: PadRig | null
    drag: DragHandle | null
    prep: boolean
    pose: Pose | null
  }
  const poleVD: { top: VertexData | null; bottom: VertexData | null; key: string } = { top: null, bottom: null, key: '' }
  const L = 3.2
  const modules: ModuleRig[] = []
  const makeModule = (i: number, prep: boolean): ModuleRig => {
    const base = new TransformNode(`sg-base-${i}`, scene)
    base.parent = root
    base.rotationQuaternion = new Quaternion()
    const tilted = new TransformNode(`sg-tilted-${i}`, scene)
    tilted.parent = base
    tilted.rotationQuaternion = new Quaternion()
    const knife = ccw(quiet(new Mesh(`sg-knife-${i}`, scene)))
    knife.parent = tilted
    knife.material = prep ? mat.polePrep : mat.pole
    const groove = ccw(quiet(new Mesh(`sg-groove-${i}`, scene)))
    groove.parent = tilted
    groove.material = knife.material
    const parts = new TransformNode(`sg-parts-${i}`, scene)
    parts.parent = tilted
    const r: ModuleRig = { base, tilted, knife, groove, parts, field: null, ring: null, ticks: null, knob: null, knobDot: null, knobRing: null, proxy: null, remove: null, drag: null, prep, pose: null }
    if (!prep) {
      const knob = new TransformNode(`sg-knob-${i}`, scene)
      knob.parent = base
      const dot = quiet(CreateSphere(`sg-knob-dot-${i}`, { diameter: 0.26, segments: 16 }, scene))
      dot.parent = knob
      dot.material = mat.knob
      const kr = quiet(CreateTorus(`sg-knob-ring-${i}`, { diameter: 0.52, thickness: 0.04, tessellation: 32 }, scene))
      kr.rotation.x = Math.PI / 2
      kr.bakeCurrentTransformIntoVertices()
      kr.billboardMode = TransformNode.BILLBOARDMODE_ALL
      kr.parent = knob
      kr.material = mat.knob
      const proxy = CreateSphere(`sg-knob-proxy-${i}`, { diameter: 0.75, segments: 8 }, scene)
      proxy.parent = knob
      proxy.material = mat.proxy
      proxy.visibility = 0
      proxy.metadata = { handle: `knob-${i}` }
      r.knob = knob
      r.knobDot = dot
      r.knobRing = kr
      r.proxy = proxy
      r.remove = pad(`remove-${i}`, '×', base)
      r.drag = attachDragHandle(scene, {
        id: `knob-${i}`,
        mesh: proxy,
        camera: camera as Camera,
        orbit: camera,
        constraint: () => {
          const ring = view?.layout.rings[i]
          return ring ? { kind: 'plane', point: ring.center, normal: ring.axis } : null
        },
        onDrag: (phase, p) => {
          canvas.style.cursor = phase === 'end' ? '' : 'grabbing'
          ctx.emit({ type: 'drag', handle: `knob-${i}`, phase, p })
          paintKnobs()
          ctx.requestRender()
        },
      })
    }
    return r
  }
  for (let i = 0; i < MAX_MODULES; i++) modules.push(makeModule(i, false))
  const prepRig = makeModule(MAX_MODULES, true)

  interface StopRig {
    node: TransformNode
    parts: TransformNode
    plus: PadRig | null
    minus: PadRig | null
  }
  /** Stop k hangs under its magnet's base frame (it slides with it); so do its two pads. */
  const makeStop = (i: number, parent: TransformNode, withPads = true): StopRig => {
    const node = new TransformNode(`sg-stop-${i}`, scene)
    node.parent = parent
    node.rotationQuaternion = new Quaternion()
    const parts = new TransformNode(`sg-stop-parts-${i}`, scene)
    parts.parent = node
    return { node, parts, plus: withPads ? pad(`keep-${i}-plus`, '+', parent) : null, minus: withPads ? pad(`keep-${i}-minus`, '-', parent) : null }
  }
  const stops: StopRig[] = Array.from({ length: MAX_MODULES - 1 }, (_, i) => makeStop(i, modules[i].base))
  const prepStop = makeStop(MAX_MODULES, prepRig.base, false)

  const plateNode = new TransformNode('sg-plate', scene)
  plateNode.parent = root
  plateNode.rotationQuaternion = new Quaternion()
  const plateParts = new TransformNode('sg-plate-parts', scene)
  plateParts.parent = plateNode
  const glass = quiet(CreateBox('sg-glass', { width: 2.3, height: 0.04, depth: 2.3 }, scene))
  glass.parent = plateNode
  glass.material = mat.glass
  glass.layerMask = PLATE_LAYERS
  const backdrop = quiet(CreateBox('sg-backdrop', { width: 3.6, height: 0.02, depth: 3.6 }, scene))
  backdrop.parent = plateNode
  backdrop.position.y = 0.35
  backdrop.material = mat.backdrop
  backdrop.layerMask = LAYER.b
  const addPad = pad('add', '+', plateNode)

  const sourceNode = new TransformNode('sg-source', scene)
  sourceNode.parent = root
  sourceNode.rotationQuaternion = new Quaternion()
  const ovenParts = new TransformNode('sg-oven-parts', scene)
  ovenParts.parent = sourceNode
  const box = quiet(CreateBox('sg-sealed', { width: 1.3, height: 1.6, depth: 1.3 }, scene))
  box.parent = sourceNode
  box.position.y = -0.8
  box.material = mat.box
  const boxEdges = quiet(
    CreateLineSystem(
      'sg-sealed-edges',
      {
        lines: (() => {
          const x = 0.66
          const y0 = -1.61
          const y1 = 0.01
          const z = 0.66
          const c = (a: number, b: number, cz: number) => new Vector3(a, b, cz)
          return [
            [c(-x, y0, -z), c(x, y0, -z), c(x, y0, z), c(-x, y0, z), c(-x, y0, -z)],
            [c(-x, y1, -z), c(x, y1, -z), c(x, y1, z), c(-x, y1, z), c(-x, y1, -z)],
            [c(-x, y0, -z), c(-x, y1, -z)],
            [c(x, y0, -z), c(x, y1, -z)],
            [c(x, y0, z), c(x, y1, z)],
            [c(-x, y0, z), c(-x, y1, z)],
          ]
        })(),
      },
      scene,
    ),
  )
  boxEdges.parent = sourceNode
  boxEdges.color = Color3.FromHexString(INK.silver2)
  const boxStand = quiet(CreateBox('sg-sealed-stand', { width: 0.3, height: 0.3, depth: 1 }, scene))
  boxStand.parent = sourceNode
  boxStand.material = mat.stop
  // the box's exit aperture: the beam's colour (a source prepared elsewhere sends its atoms out as its sign)
  const aperture = quiet(CreateDisc('sg-sealed-aperture', { radius: 0.13, tessellation: 24, sideOrientation: Mesh.DOUBLESIDE }, scene))
  aperture.parent = sourceNode
  aperture.rotation.x = Math.PI / 2
  aperture.position.y = 0.012
  const apertureMat = noTone(new StandardMaterial('sg-aperture', scene))
  apertureMat.disableLighting = true
  apertureMat.backFaceCulling = false
  aperture.material = apertureMat

  const slitNode = new TransformNode('sg-slit', scene)
  slitNode.parent = root
  slitNode.rotationQuaternion = new Quaternion()
  const railNode = new TransformNode('sg-rail', scene)
  railNode.parent = root

  // the floor (physics z = floorZ), a shade above the stage background
  const floor = quiet(new Mesh('sg-floor', scene))
  floor.parent = root
  floor.material = mat.floor
  let floorZ = NaN
  const setFloor = (z: number, mid: V3) => {
    const fd = new VertexData()
    const x0 = mid[0] - 40
    const x1 = mid[0] + 40
    const y0 = mid[1] - 60
    const y1 = mid[1] + 60
    fd.positions = [x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z]
    fd.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
    fd.indices = [0, 1, 2, 0, 2, 3]
    fd.applyToMesh(floor)
    floorZ = z
  }

  /* ---------------- hardware: Blender parts, or box stand-ins ---------------- */
  const templates = new Map<PartName, Mesh>()
  const standIn = (name: PartName): Mesh => {
    const b = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const m = CreateBox(`sg-standin-${name}`, { width: w, height: h, depth: d }, scene)
      m.position.set(x, y, z)
      m.bakeCurrentTransformIntoVertices()
      return m
    }
    const merge = (ms: Mesh[]) => Mesh.MergeMeshes(ms, true) as Mesh
    switch (name) {
      case 'sg_yoke':
        return merge([b(0.42, L, 3.9, -1.32, L / 2, 0), b(2.3, L, 0.42, -0.38, L / 2, 1.78), b(2.3, L, 0.42, -0.38, L / 2, -1.78)])
      case 'oven': {
        const c = CreateCylinder('sg-standin-oven', { diameter: 0.8, height: 0.95, tessellation: 32 }, scene)
        c.position.y = -0.5
        c.bakeCurrentTransformIntoVertices()
        return c
      }
      case 'slit':
        return merge([b(1.24, 0.04, 0.5, 0, 0, 0.33), b(1.24, 0.04, 0.5, 0, 0, -0.33)])
      case 'plate_frame':
        return merge([b(2.46, 0.07, 0.08, 0, 0, 1.19), b(2.46, 0.07, 0.08, 0, 0, -1.19), b(0.08, 0.07, 2.46, 1.19, 0, 0), b(0.08, 0.07, 2.46, -1.19, 0, 0)])
      case 'beam_stop':
        return b(0.3, 0.12, 0.3, 0, 0, 0)
      case 'bench_rail':
        return b(0.5, 1, 0.16, 0, 0, 0)
      default:
        return b(0.01, 0.01, 0.01, 0, 0, 0)
    }
  }
  const fromGlb = (m: SgHardwareMesh): Mesh => {
    const mesh = ccw(new Mesh(`sg-hw-${m.name}`, scene))
    const vd = new VertexData()
    vd.positions = m.positions
    vd.normals = m.normals
    vd.indices = m.indices
    vd.applyToMesh(mesh)
    return mesh
  }
  const placed: Mesh[] = []
  let hardwareObj: SgHardwareMesh[] | null | undefined
  const place = (name: PartName, parent: TransformNode, material: Material) => {
    const t = templates.get(name)
    if (!t) return
    const m = t.clone(`sg-${name}`, parent) as Mesh
    m.sideOrientation = t.sideOrientation
    m.setEnabled(true)
    m.material = material
    m.isPickable = false
    // the plate's own frame is the only hardware the inset draws (P review #3)
    m.layerMask = parent === plateParts ? PLATE_LAYERS : LAYER.a
    placed.push(m)
  }
  const buildParts = (hw: SgHardwareMesh[] | null) => {
    for (const m of placed) m.dispose()
    placed.length = 0
    for (const t of templates.values()) t.dispose()
    templates.clear()
    const names: PartName[] = ['sg_yoke', 'sg_coils', 'sg_axis_mount', 'oven', 'slit', 'plate_frame', 'beam_stop', 'bench_rail']
    for (const n of names) {
      const g = hw?.find((m) => m.name === n)
      if (!hw && (n === 'sg_coils' || n === 'sg_axis_mount')) continue
      const t = g ? fromGlb(g) : standIn(n)
      t.setEnabled(false)
      t.isPickable = false
      templates.set(n, t)
    }
    for (const r of [...modules, prepRig]) {
      place('sg_yoke', r.parts, r.prep ? mat.yokePrep : mat.yoke)
      place('sg_coils', r.parts, mat.coil)
      place('sg_axis_mount', r.parts, r.prep ? mat.yokePrep : mat.yoke)
    }
    for (const s of [...stops, prepStop]) place('beam_stop', s.parts, mat.stop)
    place('oven', ovenParts, mat.oven)
    place('slit', slitNode, mat.slit)
    place('plate_frame', plateParts, mat.frame)
    place('bench_rail', railNode, mat.rail)
  }

  /* ---------------- atoms in flight and the plate's marks (thin instances) ---------------- */
  const atoms = quiet(CreateSphere('sg-atoms', { diameter: 1, segments: 4 }, scene))
  atoms.parent = root
  atoms.material = dotMat
  atoms.layerMask = LAYER.a
  atoms.alwaysSelectAsActiveMesh = true
  const atomM = new Float32Array(MAX_ATOMS * TRAIL.length * 16)
  const atomC = new Float32Array(MAX_ATOMS * TRAIL.length * 4)
  atoms.thinInstanceSetBuffer('matrix', atomM, 16, false)
  atoms.thinInstanceSetBuffer('color', atomC, 4, false)
  // a thin-instance mesh keeps ≥ 1 instance (a zero-scale one when empty) and is hidden instead: with 0 instances Babylon
  // draws the base mesh itself, and a material first compiled without instances never picks up their colours
  atoms.thinInstanceCount = 1
  atoms.isVisible = false

  const marks = quiet(new Mesh('sg-marks', scene))
  {
    const md = new VertexData()
    const p: number[] = [0, 0, 0]
    const idx: number[] = []
    const T = 10
    for (let i = 0; i <= T; i++) {
      const a = (i / T) * Math.PI * 2
      p.push(Math.cos(a), 0, Math.sin(a))
      if (i > 0) idx.push(0, i, i + 1 > T ? 1 : i + 1)
    }
    md.positions = p
    md.indices = idx
    md.normals = p.map((_, i) => (i % 3 === 1 ? -1 : 0))
    md.applyToMesh(marks)
  }
  marks.parent = plateNode
  marks.material = dotMat
  marks.layerMask = PLATE_LAYERS
  marks.alwaysSelectAsActiveMesh = true
  const markM = new Float32Array(MAX_MARKS * 16)
  const markC = new Float32Array(MAX_MARKS * 4)
  marks.thinInstanceSetBuffer('matrix', markM, 16, false)
  marks.thinInstanceSetBuffer('color', markC, 4, false)
  marks.thinInstanceCount = 1
  marks.isVisible = false
  const setMarksShown = (n: number) => {
    marks.isVisible = n > 0
    marks.thinInstanceCount = Math.max(1, n)
  }

  const hexRgb = (h: string) => Color3.FromHexString(h)
  const TONES = [hexRgb(INK.unpol), hexRgb(INK.plus), hexRgb(INK.minus)]

  /* ---------------- the plate inset camera ---------------- */
  const plateCam = new TargetCamera('sg-plate-cam', new Vector3(0, 0, -1), scene)
  plateCam.mode = CameraClass.ORTHOGRAPHIC_CAMERA
  // the layer mask keeps the hardware out; the depth range is the plate's own slab as well (frame ± 0.18 about the glass)
  plateCam.minZ = INSET.back - 0.4
  plateCam.maxZ = INSET.back + 0.7
  plateCam.layerMask = LAYER.b
  plateCam.viewport = new Viewport(0.7, 0.02, 0.28, 0.3)
  let insetOn = false
  const placeInsetCamera = () => {
    const lay = view?.layout
    if (!lay) return
    const f = lay.plate
    const n: V3 = [f.R[1], f.R[4], f.R[7]]
    const up: V3 = [f.R[2], f.R[5], f.R[8]]
    plateCam.position = v3([f.o[0] - n[0] * INSET.back, f.o[1] - n[1] * INSET.back, f.o[2] - n[2] * INSET.back])
    const u = physToRender(up)
    plateCam.upVector = new Vector3(u[0], u[1], u[2])
    plateCam.setTarget(v3(f.o))
  }
  const fitInset = () => {
    const r = view?.inset
    insetOn = !!r && r.w > 0 && r.h > 0
    scene.activeCameras = insetOn ? [camera, plateCam] : [camera]
    if (!r || !insetOn) return
    plateCam.viewport = new Viewport(r.x, 1 - r.y - r.h, r.w, r.h)
    const aspect = (r.w * engine.getRenderWidth()) / Math.max(1, r.h * engine.getRenderHeight())
    const hx = INSET.half * Math.max(1, aspect)
    const hy = INSET.half * Math.max(1, 1 / aspect)
    plateCam.orthoLeft = -hx
    plateCam.orthoRight = hx
    plateCam.orthoTop = hy
    plateCam.orthoBottom = -hy
  }

  /* ---------------- field lines (the page's streamlines, a magnet's tilted frame) ---------------- */
  let fieldObj: V3[][] | null = null
  const buildField = (lines: V3[][] | null) => {
    for (const r of [...modules, prepRig]) {
      r.field?.dispose()
      r.field = null
      if (!lines) continue
      const ls = quiet(CreateLineSystem(`sg-field`, { lines: lines.map((l) => l.map((p) => new Vector3(p[0], p[1], p[2]))) }, scene))
      ls.parent = r.tilted
      ls.color = Color3.FromHexString(LAB_MATERIAL.streamline)
      ls.alpha = r.prep ? 0.25 : 0.55
      r.field = ls
    }
  }

  /* ---------------- hover, taps and knob highlight ---------------- */
  const pickable = (m: AbstractMesh) => {
    const md = m.metadata as { handle?: string; pad?: string } | null
    return !!(md?.handle || md?.pad) && m.isEnabled() && m.isPickable
  }
  scene.pointerDownPredicate = pickable
  scene.pointerUpPredicate = pickable
  scene.pointerMovePredicate = pickable
  let hover: string | null = null
  const padRigs = (): PadRig[] => [...modules.map((m) => m.remove), ...stops.flatMap((s) => [s.plus, s.minus]), addPad].filter((p): p is PadRig => !!p)
  const paintPads = () => {
    const lay = view?.layout
    for (const p of padRigs()) {
      const kept = !!lay && /^keep-(\d)-(plus|minus)$/.test(p.id) && (() => {
        const [, k, s] = /^keep-(\d)-(plus|minus)$/.exec(p.id)!
        return lay.stops[Number(k)]?.pads.kept === (s === 'plus' ? '+' : '-')
      })()
      const on = kept || hover === p.id
      for (const g of p.glyph) g.material = on ? mat.padOn : mat.padGlyph
      p.node.scaling.setAll(hover === p.id ? 1.18 : 1)
    }
  }
  const paintKnobs = () => {
    modules.forEach((r, i) => {
      if (!r.knobDot || !r.knobRing) return
      const on = hover === `knob-${i}` || view?.focus === i || !!r.drag?.dragging()
      r.knobDot.material = on ? mat.knobHot : mat.knob
      r.knobRing.material = on ? mat.knobHot : mat.knob
      r.knobRing.scaling.setAll(on ? 1.3 : 1)
    })
  }
  const hoverObs = scene.onPointerObservable.add((pi) => {
    if (pi.type === PointerEventTypes.POINTERMOVE) {
      if (modules.some((m) => m.drag?.dragging())) return
      const hit = scene.pick(scene.pointerX, scene.pointerY, pickable, false, camera)
      const md = hit?.pickedMesh?.metadata as { handle?: string; pad?: string } | null | undefined
      const id = md?.pad ?? md?.handle ?? null
      if (id !== hover) {
        hover = id
        canvas.style.cursor = id ? (id.startsWith('knob') ? 'grab' : 'pointer') : ''
        paintPads()
        paintKnobs()
        ctx.requestRender()
      }
    } else if (pi.type === PointerEventTypes.POINTERTAP) {
      const hit = scene.pick(scene.pointerX, scene.pointerY, pickable, false, camera)
      const id = (hit?.pickedMesh?.metadata as { pad?: string } | null | undefined)?.pad
      if (id) ctx.emit({ type: 'pick', handle: id })
    }
  })

  /* ---------------- layout (and the 300 ms slide when magnets are added or removed) ---------------- */
  let view: SgLabView | null = null
  let layoutObj: SgLayoutView | null = null
  let motion = true
  const slide: { t0: number; items: { node: TransformNode; from: Pose; to: Pose }[] } = { t0: -1, items: [] }
  const setPose = (node: TransformNode, p: Pose) => {
    node.position.copyFrom(p.p)
    ;(node.rotationQuaternion ??= new Quaternion()).copyFrom(p.q)
  }
  let fitted = { n: -1, length: -1 }
  const applyLayout = (lay: SgLayoutView, prev: SgLayoutView | null) => {
    const animate = motion && !!prev && prev.modules.length !== lay.modules.length
    const items: { node: TransformNode; from: Pose; to: Pose }[] = []
    const target = (node: TransformNode, f: SgFrame, from: Pose | null) => {
      const to = poseOf(f)
      if (animate && from) items.push({ node, from, to })
      else setPose(node, to)
    }
    const poseNow = (node: TransformNode): Pose => ({ p: node.position.clone(), q: (node.rotationQuaternion ?? new Quaternion()).clone() })
    const oldPlate = prev ? poseOf(prev.plate) : null
    modules.forEach((r, i) => {
      const m = lay.modules[i]
      const was = r.base.isEnabled()
      r.base.setEnabled(!!m)
      if (!m) return
      // a new magnet slides in from where the plate was
      target(r.base, m.base, was ? poseNow(r.base) : oldPlate)
      setNode(r.tilted, rel(m.base, m.tilted))
      const ring = lay.rings[i]
      if (r.knob && ring) r.knob.position.copyFrom(localPoint(m.base, ring.knob))
      if (!r.ring || r.ring.metadata?.radius !== lay.ring.radius) {
        r.ring?.dispose()
        r.ticks?.dispose()
        const R = lay.ring.radius
        // a little thicker than a hairline (0.035), so the stroke reaches its full colour when antialiased
        const ringM = quiet(CreateTorus(`sg-ring-${i}`, { diameter: 2 * R, thickness: 0.035, tessellation: 96 }, scene))
        ringM.parent = r.base
        ringM.material = mat.ring
        ringM.metadata = { radius: R }
        const tl: Vector3[][] = []
        for (let d = 0; d < 360; d += 15) {
          const a = (d * Math.PI) / 180
          const r0 = d % 90 === 0 ? R - 0.32 : d % 45 === 0 ? R - 0.22 : R - 0.13
          tl.push([new Vector3(r0 * Math.sin(a), 0, r0 * Math.cos(a)), new Vector3(R * Math.sin(a), 0, R * Math.cos(a))])
        }
        const ticks = quiet(CreateLineSystem(`sg-ticks-${i}`, { lines: tl }, scene))
        ticks.parent = r.base
        ticks.color = Color3.FromHexString(INK.silver2)
        r.ring = ringM
        r.ticks = ticks
      }
      if (ring) {
        const c = localPoint(m.base, ring.center)
        r.ring.position.copyFrom(c)
        r.ticks!.position.copyFrom(c)
      }
      const rp = lay.removePads[i]
      if (r.remove) {
        r.remove.node.setEnabled(!!rp)
        if (rp) r.remove.node.position.copyFrom(localPoint(m.base, rp))
      }
    })
    prepRig.base.setEnabled(!!lay.prep)
    if (lay.prep) {
      setNode(prepRig.base, lay.prep.base)
      setNode(prepRig.tilted, rel(lay.prep.base, lay.prep.tilted))
    }
    stops.forEach((s, k) => {
      const st = lay.stops[k]
      const m = lay.modules[k]
      s.node.setEnabled(!!st)
      s.plus?.node.setEnabled(!!st)
      s.minus?.node.setEnabled(!!st)
      if (!st || !m) return
      setNode(s.node, rel(m.base, st.frame))
      s.plus?.node.position.copyFrom(localPoint(m.base, st.pads.plus))
      s.minus?.node.position.copyFrom(localPoint(m.base, st.pads.minus))
    })
    prepStop.node.setEnabled(!!lay.prepStop && !!lay.prep)
    if (lay.prepStop && lay.prep) setNode(prepStop.node, rel(lay.prep.base, lay.prepStop))
    target(plateNode, lay.plate, animate ? poseNow(plateNode) : null)
    addPad.node.setEnabled(!!lay.addPad)
    if (lay.addPad) addPad.node.position.copyFrom(localPoint(lay.plate, lay.addPad))
    setNode(sourceNode, lay.source.frame)
    ovenParts.setEnabled(lay.source.kind === 'oven')
    for (const m of [box, boxEdges, boxStand, aperture]) m.setEnabled(lay.source.kind === 'sealed')
    // the box's stand: from its underside (local z −0.65) down to the floor
    const floorLocal = lay.floorZ - lay.source.frame.o[2]
    boxStand.position.set(0, -0.8, (-0.65 + floorLocal) / 2)
    boxStand.scaling.z = Math.max(0.1, -0.65 - floorLocal)
    slitNode.setEnabled(!!lay.slit)
    if (lay.slit) setNode(slitNode, lay.slit)
    const [a, b] = [lay.rail.from, lay.rail.to]
    railNode.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
    railNode.scaling.set(1, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), 1)
    if (floorZ !== lay.floorZ || !prev) setFloor(lay.floorZ, lay.mid)
    slide.items = items
    slide.t0 = items.length ? performance.now() : -1
    // the camera re-frames when the bench grows or shrinks (a cut), never on a tilt or a kept sign
    if (fitted.n !== lay.modules.length + (lay.prep ? 1 : 0) || Math.abs(fitted.length - lay.length) > 1) {
      fitted = { n: lay.modules.length + (lay.prep ? 1 : 0), length: lay.length }
      frameCamera(lay)
    }
    placeInsetCamera()
    paintPads()
  }
  const stepSlide = () => {
    if (slide.t0 < 0) return
    const t = Math.min(1, (performance.now() - slide.t0) / SLIDE_MS)
    const e = t * t * (3 - 2 * t)
    for (const it of slide.items) {
      Vector3.LerpToRef(it.from.p, it.to.p, e, it.node.position)
      Quaternion.SlerpToRef(it.from.q, it.to.q, e, it.node.rotationQuaternion!)
    }
    if (t >= 1) {
      slide.t0 = -1
      slide.items = []
    }
  }

  /* ---------------- camera fit ---------------- */
  const fitDistance = (lay: SgLayoutView) => {
    const w = engine.getRenderWidth()
    const h = engine.getRenderHeight()
    const cssPerPx = canvas.clientWidth / Math.max(1, w)
    // the right strip holds the readouts (wide stage): the bench fits in what is left of the width
    const reserve = Math.min(0.42 * w, Math.max(40, view?.rightStrip ?? 0) / cssPerPx)
    const vfov = (SHOT.fovDeg * Math.PI) / 180
    const aspect = Math.max(0.3, (w - reserve) / Math.max(1, h))
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect)
    // the bench seen from the side at SHOT.az: its projected half-length, plus the magnets' own size
    // (the near, oven end looks larger in perspective: a margin of a magnet's size on each side)
    const half = 0.5 * lay.length * 0.9 + 3.2
    return { d: Math.max(15, half / Math.tan(Math.min(hfov, vfov * 1.8) / 2)), reserve, w, h, cssPerPx }
  }
  const frameCamera = (lay: SgLayoutView) => {
    const { d, reserve, w, h, cssPerPx } = fitDistance(lay)
    camera.fov = (SHOT.fovDeg * Math.PI) / 180
    camera.lowerRadiusLimit = d * 0.3
    camera.upperRadiusLimit = d * 2
    camera.maxZ = d * 2 + 60
    const tgt = v3([lay.mid[0], lay.mid[1], lay.mid[2] - 0.4])
    camera.setTarget(tgt)
    const az = (SHOT.az * Math.PI) / 180
    const el = (SHOT.el * Math.PI) / 180
    const off = v3([d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)])
    camera.setPosition(tgt.add(off))
    camera.inertialAlphaOffset = camera.inertialBetaOffset = camera.inertialRadiusOffset = 0
    // content left of the right strip (readouts and inset), a little up (the caption sits bottom-left)
    const worldPerPx = (2 * d * Math.tan(camera.fov / 2)) / h
    camera.targetScreenOffset.set(-(reserve / 2.6) * worldPerPx, (36 / cssPerPx) * worldPerPx)
    void w
  }

  /* ---------------- flight and marks ---------------- */
  let flightId = -1
  let flightStart = 0
  let flightTime = 0
  let marksKey = ''
  let marksWritten = 0
  let marksPos: Float32Array | null = null
  const writeMarks = (from: number, to: number) => {
    const mk = view!.marks
    const up = TONES[1]
    const dn = TONES[2]
    for (let i = from; i < to; i++) {
      const o = 16 * i
      markM.fill(0, o, o + 16)
      markM[o] = MARK_R
      markM[o + 5] = MARK_R
      markM[o + 10] = MARK_R
      markM[o + 12] = mk.pos[3 * i]
      markM[o + 13] = mk.pos[3 * i + 1] - 0.006
      markM[o + 14] = mk.pos[3 * i + 2]
      markM[o + 15] = 1
      const c = mk.sign[i] === 1 ? up : dn
      markC[4 * i] = c.r
      markC[4 * i + 1] = c.g
      markC[4 * i + 2] = c.b
      markC[4 * i + 3] = 1
    }
    if (to > from) {
      marks.thinInstancePartialBufferUpdate('matrix', to - from, from)
      marks.thinInstancePartialBufferUpdate('color', to - from, from)
    }
  }
  const shownMarks = (t: number): number => {
    const mk = view!.marks
    if (!mk.arrive || !view!.flight) return mk.count
    // arrivals are ascending: count those at or before t
    let lo = 0
    let hi = mk.arrive.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (mk.arrive[mid] <= t) lo = mid + 1
      else hi = mid
    }
    return Math.min(mk.count, mk.start + lo)
  }
  const flightClock = (): number => (view?.clock ?? (performance.now() - flightStart) / 1000)
  const drawFlight = () => {
    const f = view?.flight
    if (!f) {
      atoms.isVisible = false
      syncMarks()
      return
    }
    const t = flightClock()
    flightTime = t
    let m = 0
    const P = f.points.length / (3 * f.n)
    for (let i = 0; i < f.n && m < atomM.length / 16; i++) {
      const t0 = f.t0[i]
      const dur = f.dur[i]
      if (t < t0 || t > t0 + dur) continue
      for (const tr of TRAIL) {
        const u = (t - tr.dt - t0) / dur
        if (u < 0) break
        const x = Math.min(1, u) * (P - 1)
        const j = Math.min(P - 2, Math.floor(x))
        const a = x - j
        const b = 3 * (i * P + j)
        const o = 16 * m
        atomM[o] = tr.scale
        atomM[o + 1] = atomM[o + 2] = atomM[o + 3] = atomM[o + 4] = 0
        atomM[o + 5] = tr.scale
        atomM[o + 6] = atomM[o + 7] = atomM[o + 8] = atomM[o + 9] = 0
        atomM[o + 10] = tr.scale
        atomM[o + 11] = 0
        atomM[o + 12] = f.points[b] + (f.points[b + 3] - f.points[b]) * a
        atomM[o + 13] = f.points[b + 1] + (f.points[b + 4] - f.points[b + 1]) * a
        atomM[o + 14] = f.points[b + 2] + (f.points[b + 5] - f.points[b + 2]) * a
        atomM[o + 15] = 1
        const c = TONES[f.tones[i * P + (a < 0.5 ? j : j + 1)]] ?? TONES[0]
        const q = 4 * m
        atomC[q] = c.r * tr.fade
        atomC[q + 1] = c.g * tr.fade
        atomC[q + 2] = c.b * tr.fade
        atomC[q + 3] = 1
        m++
      }
    }
    atoms.isVisible = m > 0
    if (m > 0) {
      atoms.thinInstanceCount = m
      atoms.thinInstanceBufferUpdated('matrix')
      atoms.thinInstanceBufferUpdated('color')
    }
    setMarksShown(shownMarks(t))
  }
  const syncMarks = () => {
    if (!view) return
    setMarksShown(view.flight ? shownMarks(flightClock()) : Math.min(MAX_MARKS, view.marks.count))
  }
  const flying = () => !!view?.flight && view.clock === null && flightTime <= view.flight.end + 0.05

  /* ---------------- update ---------------- */
  const update = (vw: LabView) => {
    if (vw.bench !== 'sg') return
    const prev = view
    view = vw
    if (vw.hardware !== hardwareObj) {
      hardwareObj = vw.hardware
      buildParts(vw.hardware)
    }
    const pk = `${vw.pole.tipZ},${vw.pole.tipR},${vw.pole.shoulderZ},${vw.pole.grooveHalf},${vw.pole.grooveDepth},${vw.pole.halfWidth}`
    if (poleVD.key !== pk) {
      poleVD.key = pk
      poleVD.top = poleData(vw.pole, true, L)
      poleVD.bottom = poleData(vw.pole, false, L)
      for (const r of [...modules, prepRig]) {
        poleVD.top.applyToMesh(r.knife)
        poleVD.bottom.applyToMesh(r.groove)
      }
    }
    if (vw.layout !== layoutObj) {
      const old = layoutObj
      layoutObj = vw.layout
      applyLayout(vw.layout, old)
    }
    if (vw.field !== fieldObj) {
      fieldObj = vw.field
      buildField(vw.field)
    }
    if (!prev || prev.inset !== vw.inset) fitInset()
    if (prev && prev.rightStrip !== vw.rightStrip && layoutObj) frameCamera(layoutObj)
    // the aperture of a sealed box takes its atoms' colour
    apertureMat.emissiveColor = TONES[vw.sourceTone] ?? TONES[0]
    // marks: a new plate rewrites from 0; a new volley appends
    const mk = vw.marks
    if (mk.key !== marksKey || mk.pos !== marksPos || mk.count < marksWritten) {
      if (mk.key !== marksKey || mk.count < marksWritten) marksWritten = 0
      marksKey = mk.key
      marksPos = mk.pos
    }
    if (mk.count > marksWritten) {
      writeMarks(marksWritten, Math.min(MAX_MARKS, mk.count))
      marksWritten = Math.min(MAX_MARKS, mk.count)
    }
    if (vw.flight && vw.flight.id !== flightId) {
      flightId = vw.flight.id
      flightStart = performance.now()
      flightTime = 0
    }
    motion = vw.motion
    drawFlight()
    paintKnobs()
    paintPads()
  }

  const pt = (n: TransformNode | null | undefined): ScenePoint | null => (n && n.isEnabled() ? { world: n.getAbsolutePosition().clone() } : null)
  const handlePoint = (id: string): ScenePoint | null => {
    let m = /^knob-(\d)$/.exec(id)
    if (m) return pt(modules[Number(m[1])]?.knob)
    m = /^remove-(\d)$/.exec(id)
    if (m) return pt(modules[Number(m[1])]?.remove?.node)
    m = /^keep-(\d)-(plus|minus)$/.exec(id)
    if (m) return pt(m[2] === 'plus' ? stops[Number(m[1])]?.plus?.node : stops[Number(m[1])]?.minus?.node)
    if (id === 'add') return pt(addPad.node)
    return null
  }

  return {
    update,
    cameraOf: (id) => (id === 'plate' ? plateCam : camera),
    anchor: () => null,
    handle: handlePoint,
    beforeFrame: () => {
      stepSlide()
      if (view?.flight) drawFlight()
    },
    active: () => slide.t0 >= 0 || flying() || modules.some((m) => m.drag?.dragging()),
    resize: () => {
      fitInset()
      if (layoutObj) frameCamera(layoutObj)
    },
    setGuiMode: () => {},
    seen: (id) => {
      const cam = id === 'plate' ? plateCam : camera
      if (id === 'plate' && !insetOn) return []
      cam.getViewMatrix(true)
      cam.getProjectionMatrix(true)
      const planes = Frustum.GetPlanes(cam.getTransformationMatrix())
      return scene.meshes
        .filter((m) => {
          if (!m.isEnabled() || !m.isVisible || m.visibility <= 0 || (m.layerMask & cam.layerMask) === 0 || m.getTotalVertices() === 0) return false
          m.computeWorldMatrix(true)
          return m.isInFrustum(planes)
        })
        .map((m) => m.name)
    },
    dispose() {
      for (const r of modules) r.drag?.dispose()
      scene.onPointerObservable.remove(hoverObs)
      scene.onNewMeshAddedObservable.remove(mainOnly)
      look.dispose()
      canvas.style.cursor = ''
      // meshes, materials, cameras and lights go with scene.dispose()
    },
  }
}

