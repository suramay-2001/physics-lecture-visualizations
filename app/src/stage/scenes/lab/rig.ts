/**
 * The lab's object graph, built once imperatively (pools sized for the largest bench a story can author:
 * 2 benches × 4 devices + a prep module each) and updated in place every frame by LabR3Scene. Everything is
 * authored in PHYSICS coordinates inside `root` (rotation PHYSICS_TO_THREE).
 */
import * as THREE from 'three'
import { streamlines } from '../../../physics/field'
import { INK, LAB_MATERIAL, LIGHT_RIG } from '../../tokens'
import { PHYSICS_TO_THREE } from '../../hooks'
import { hatchTexture, radialTexture } from '../common'
import { makeAtomMesh, makeSeeds, ATOMS, type AtomSeeds } from './atoms'
import { depositSeeds, makeDepositMesh, DEPOSIT_MAX, type DepositSeeds } from './deposit'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { buildLabGeometry, type LabGeometry } from './geometry'
import { LAB } from './layout'

export const MAX_BENCHES = 2
export const MAX_DEVICES = 4
/** Lateral offset (pattern-frame x) of the σ bracket from the n̂ axis, clear of the deposit's core. */
export const SIGMA_DX = 0.42

export interface ModuleRig {
  group: THREE.Group // matrixAutoUpdate off; matrix = tilted frame
  knife: THREE.Mesh
  groove: THREE.Mesh
  yoke: THREE.Mesh
  /** Blender hardware (hardware.ts), children of the yoke: hidden until lab.glb has loaded */
  coils: THREE.Mesh
  mount: THREE.Mesh
  arrow: THREE.Group
  box: THREE.Mesh
  fieldGrad: THREE.Group
  fieldUni: THREE.Group
  mats: { pole: THREE.MeshPhysicalMaterial; yoke: THREE.MeshStandardMaterial; coil: THREE.MeshStandardMaterial; arrow: THREE.MeshBasicMaterial; box: THREE.MeshStandardMaterial }
  shadow: THREE.Mesh
}

export interface PlateRig {
  group: THREE.Group // matrix = plate frame
  frame: THREE.Mesh
  pattern: THREE.Group // turned by the last tilt (deposit + ghost band + centroid)
  glassMat: THREE.MeshStandardMaterial
  frameMat: THREE.MeshStandardMaterial
  deposit: ReturnType<typeof makeDepositMesh>
  band: THREE.LineSegments
  bandMat: THREE.LineDashedMaterial
  shadow: THREE.Mesh
  /** plate-local points for the deposit (x, z, sign) */
  pts: Float32Array
  seeds: DepositSeeds
  centroid: {
    mArrow: THREE.Group
    nArrow: THREE.Group
    tick: THREE.Mesh
    sigma: { group: THREE.Group; bar: THREE.Mesh; capA: THREE.Mesh; capB: THREE.Mesh; link: THREE.Mesh }
    drop: THREE.Line
    mats: THREE.Material[]
  }
}

export interface StopRig {
  group: THREE.Group
  block: THREE.Mesh
  stem: THREE.Mesh
  mat: THREE.MeshStandardMaterial
  face: THREE.MeshBasicMaterial
  small: THREE.Group // side plate (openOther)
}

export interface BenchRig {
  group: THREE.Group
  oven: THREE.Group
  ovenBody: THREE.Mesh
  ovenShadow: THREE.Mesh
  slit: THREE.Group
  slitJaws: THREE.Mesh[]
  /** the Blender slit assembly (jaws + U-bracket + post): hidden until lab.glb has loaded */
  slitHw: THREE.Mesh
  rail: THREE.Mesh
  prep: ModuleRig
  prepStop: StopRig
  modules: ModuleRig[]
  stops: StopRig[]
  plate: PlateRig
  ghost: PlateRig
  protractor: THREE.Group
  protractorArc: THREE.Line
}

export interface LabRig {
  root: THREE.Group
  geo: LabGeometry
  benches: BenchRig[]
  atoms: ReturnType<typeof makeAtomMesh>
  seeds: AtomSeeds
  floor: THREE.Mesh
  capsules: THREE.InstancedMesh
  specimen: THREE.Group
  glints: THREE.InstancedMesh
  centroid: THREE.Group
  lights: THREE.Object3D[]
  textures: THREE.Texture[]
  /** true once the Blender hardware replaced the procedural stand-ins (hardware.ts) */
  hardware: boolean
}

/** Geometries shared across rigs (the Blender hardware cache): disposeLabRig never disposes these. */
export const sharedGeometry = new WeakSet<THREE.BufferGeometry>()
/** Placeholder for a mesh that gets its geometry later (hidden until then). */
const later = () => new THREE.BufferGeometry()

const dirFrom = (azDeg: number, elDeg: number, r: number) => {
  const az = (azDeg * Math.PI) / 180
  const el = (elDeg * Math.PI) / 180
  return new THREE.Vector3(Math.cos(el) * Math.cos(az) * r, Math.cos(el) * Math.sin(az) * r, Math.sin(el) * r)
}

/** Streamline tubes (physics/field.ts `streamlines`) at the entrance and exit slices, merged: ONE draw call. */
function fieldGeometry(uniform: boolean): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  for (const y of [0.03, LAB.L - 0.03]) {
    for (const line of streamlines(y, { field: uniform ? 'uniform' : 'gradient', samples: 20 })) {
      const curve = new THREE.CatmullRomCurve3(line.map((p) => new THREE.Vector3(p[0], p[1], p[2])))
      parts.push(new THREE.TubeGeometry(curve, 20, 0.005, 4, false))
    }
  }
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

function fieldGroup(geo: THREE.BufferGeometry): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color: LAB_MATERIAL.streamline, transparent: true, opacity: 0, depthWrite: false })
  g.add(new THREE.Mesh(geo, mat))
  g.userData.mat = mat
  return g
}

function moduleRig(geo: LabGeometry, blob: THREE.Texture, greyed = false): ModuleRig {
  const group = new THREE.Group()
  group.matrixAutoUpdate = false
  const pole = new THREE.MeshPhysicalMaterial({
    color: greyed ? LAB_MATERIAL.prep : LAB_MATERIAL.pole,
    metalness: greyed ? 0.5 : 0.92,
    roughness: greyed ? 0.6 : 0.38,
    anisotropy: greyed ? 0 : 0.6,
    anisotropyRotation: Math.PI / 2, // brushed along the beam (uv v)
    // the Room environment's light boxes blow flat steel faces out to white: keep the env modest on poles
    envMapIntensity: greyed ? 1 : 0.32,
  })
  const yokeMat = new THREE.MeshStandardMaterial({ color: greyed ? '#2c323c' : LAB_MATERIAL.yoke, metalness: 0.7, roughness: 0.42 })
  const coilMat = new THREE.MeshStandardMaterial({ color: greyed ? '#171b22' : LAB_MATERIAL.coil, metalness: 0.1, roughness: 0.85 })
  const arrowMat = new THREE.MeshBasicMaterial({ color: INK.silver })
  const boxMat = new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.box, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0 })
  const knife = new THREE.Mesh(geo.knife, pole)
  const groove = new THREE.Mesh(geo.groove, pole)
  knife.morphTargetInfluences = [0]
  groove.morphTargetInfluences = [0]
  const yoke = new THREE.Mesh(geo.yoke, yokeMat)
  const coils = new THREE.Mesh(later(), coilMat)
  const mount = new THREE.Mesh(later(), yokeMat)
  coils.visible = mount.visible = false
  yoke.add(coils, mount) // they follow the yoke's visibility (hidden under the black box)
  const arrow = new THREE.Group()
  arrow.add(new THREE.Mesh(geo.arrowShaft, arrowMat), new THREE.Mesh(geo.arrowHead, arrowMat))
  arrow.visible = !greyed
  const box = new THREE.Mesh(geo.box, boxMat)
  box.visible = false
  // a matte box on a dark stage needs its silhouette: silver-3 edges (structure, no hue)
  const boxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(geo.box), new THREE.LineBasicMaterial({ color: INK.silver2, transparent: true, opacity: 0 }))
  box.add(boxEdges)
  box.userData.edges = boxEdges
  const fieldGrad = fieldGroup((geo.fieldGrad ??= fieldGeometry(false)))
  const fieldUni = fieldGroup((geo.fieldUni ??= fieldGeometry(true)))
  group.add(knife, groove, yoke, arrow, box, fieldGrad, fieldUni)
  const shadow = new THREE.Mesh(geo.blob, new THREE.MeshBasicMaterial({ color: LAB_MATERIAL.shadow, alphaMap: blob, transparent: true, opacity: 0.45, depthWrite: false }))
  return { group, knife, groove, yoke, coils, mount, arrow, box, fieldGrad, fieldUni, mats: { pole, yoke: yokeMat, coil: coilMat, arrow: arrowMat, box: boxMat }, shadow }
}

function stopRig(geo: LabGeometry, hatch: THREE.Texture): StopRig {
  const group = new THREE.Group()
  group.matrixAutoUpdate = false
  const mat = new THREE.MeshStandardMaterial({ color: INK.silver3, metalness: 0.4, roughness: 0.6, transparent: true })
  const face = new THREE.MeshBasicMaterial({ map: hatch, transparent: true })
  const block = new THREE.Mesh(geo.stop, mat)
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3).rotateX(Math.PI / 2), face)
  faceMesh.position.y = -0.061
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8).rotateX(Math.PI / 2).translate(0, 0, -0.65), mat)
  const small = new THREE.Group()
  const sGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.8), new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.glass, transparent: true, opacity: 0.16, roughness: 0.08, depthWrite: false }))
  small.add(sGlass)
  small.visible = false
  group.add(block, faceMesh, stem, small)
  return { group, block, stem, mat, face, small }
}

function plateRig(geo: LabGeometry, blob: THREE.Texture, seed: number): PlateRig {
  const group = new THREE.Group()
  group.matrixAutoUpdate = false
  const glassMat = new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.glass, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.16, depthWrite: false })
  const frameMat = new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.frame, metalness: 0.9, roughness: 0.3, transparent: true })
  const frame = new THREE.Mesh(geo.plateFrame, frameMat)
  group.add(new THREE.Mesh(geo.plateGlass, glassMat), frame)
  const pattern = new THREE.Group()
  const deposit = makeDepositMesh()
  pattern.add(deposit.mesh)
  // dashed classical ghost band: −0.9 … +0.9 along n̂, ±0.32 across (plate-local x–z, on the upstream face)
  const bx = 0.32
  const bz = 0.95
  const bandGeo = new THREE.BufferGeometry().setFromPoints(
    [
      [-bx, -bz, bx, -bz],
      [bx, -bz, bx, bz],
      [bx, bz, -bx, bz],
      [-bx, bz, -bx, -bz],
    ].flatMap(([x0, z0, x1, z1]) => [new THREE.Vector3(x0, -0.03, z0), new THREE.Vector3(x1, -0.03, z1)]),
  )
  const bandMat = new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0 })
  const band = new THREE.LineSegments(bandGeo, bandMat)
  band.computeLineDistances()
  pattern.add(band)
  group.add(pattern)
  // centroid overlay (l1-average:b2, readouts 'centroid'): silver m̂ (plate +z) and n̂ (pattern +z) arrows,
  // dashed drop-line m̂ → n̂, and the centroid tick on n̂ — all structure silver, no hue
  const silver = () => new THREE.MeshBasicMaterial({ color: INK.silver, transparent: true, opacity: 0, depthWrite: false })
  const arrow = () => {
    const g = new THREE.Group()
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8).rotateX(Math.PI / 2).translate(0, 0, 0.5), silver())
    shaft.scale.set(1, 1, 0.8)
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 12).rotateX(Math.PI / 2).translate(0, 0, 0.86), silver())
    g.add(shaft, head)
    g.position.y = -0.06
    return g
  }
  const mArrow = arrow()
  const nArrow = arrow()
  const tick = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.01, 0.022), silver())
  tick.position.y = -0.06
  // σ band (l1-average:b4, readouts 'sigma-band'): the scatter of the MEAN reading, centroid ± sigmaBand
  // (engine value, round 3 #11). An I-beam bracket BESIDE the n̂ axis (x = SIGMA_DX), so the deposit never
  // hides it: a unit-length bar along n̂ plus two caps; the scene sets the bar length 2·sigmaBand·SPOT and
  // moves the caps to its ends. Opaque silver (structure), so even the N = 1000 band reads as a mark.
  const sigma = new THREE.Group()
  const sigmaBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 1), silver())
  const sigmaCapA = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.006, 0.022), silver())
  const sigmaCapB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.006, 0.022), silver())
  const sigmaLink = new THREE.Mesh(new THREE.BoxGeometry(1, 0.004, 0.012), silver()) // tick → bracket
  sigma.add(sigmaBar, sigmaCapA, sigmaCapB, sigmaLink)
  sigma.position.set(SIGMA_DX, -0.058, 0)
  const dropMat = new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0 })
  const drop = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]), dropMat)
  drop.frustumCulled = false
  group.add(mArrow, drop)
  pattern.add(nArrow, tick, sigma)
  const centroid = {
    mArrow,
    nArrow,
    tick,
    sigma: { group: sigma, bar: sigmaBar, capA: sigmaCapA, capB: sigmaCapB, link: sigmaLink },
    drop,
    mats: [...mArrow.children, ...nArrow.children, tick].map((m) => (m as THREE.Mesh).material as THREE.Material).concat(dropMat),
  }
  const shadow = new THREE.Mesh(geo.blob, new THREE.MeshBasicMaterial({ color: LAB_MATERIAL.shadow, alphaMap: blob, transparent: true, opacity: 0.35, depthWrite: false }))
  return { group, frame, pattern, glassMat, frameMat, deposit, band, bandMat, shadow, pts: new Float32Array(DEPOSIT_MAX * 3), seeds: depositSeeds(seed), centroid }
}

function benchRig(geo: LabGeometry, blob: THREE.Texture, hatch: THREE.Texture, b: number): BenchRig {
  const group = new THREE.Group()
  const oven = new THREE.Group()
  const ovenMat = new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.oven, metalness: 0.85, roughness: 0.33 })
  const body = new THREE.Mesh(geo.oven, ovenMat)
  const rim = new THREE.Mesh(geo.ovenRim, new THREE.MeshStandardMaterial({ color: INK.silver, metalness: 0.9, roughness: 0.3 }))
  const mouth = new THREE.Mesh(geo.ovenMouth, new THREE.MeshBasicMaterial({ color: LAB_MATERIAL.ovenMouth }))
  // oven authored with its axis along three-y in the geometry; turn so its axis is the beam (+y physics)
  oven.add(body, rim, mouth)
  const ovenShadow = new THREE.Mesh(geo.blob, new THREE.MeshBasicMaterial({ color: LAB_MATERIAL.shadow, alphaMap: blob, transparent: true, opacity: 0.45, depthWrite: false }))
  const slit = new THREE.Group()
  const jawMat = new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.slit, metalness: 0.8, roughness: 0.35 })
  const j1 = new THREE.Mesh(geo.slitJaw, jawMat)
  const j2 = new THREE.Mesh(geo.slitJaw, jawMat)
  j1.position.set(0, 0, 0.33)
  j2.position.set(0, 0, -0.33)
  const slitHw = new THREE.Mesh(later(), jawMat)
  slitHw.visible = false
  slit.add(j1, j2, slitHw)
  const rail = new THREE.Mesh(geo.rail, new THREE.MeshStandardMaterial({ color: LAB_MATERIAL.rail, metalness: 0.6, roughness: 0.5 }))
  const prep = moduleRig(geo, blob, true)
  const prepStop = stopRig(geo, hatch)
  const modules = Array.from({ length: MAX_DEVICES }, () => moduleRig(geo, blob))
  const stops = Array.from({ length: MAX_DEVICES - 1 }, () => stopRig(geo, hatch))
  const plate = plateRig(geo, blob, 1000 + b * 17)
  const ghost = plateRig(geo, blob, 2000 + b * 17)
  // protractor: ring + ticks around the beam at a module entrance (untilted frame) + silver arc z → n̂
  const protractor = new THREE.Group()
  protractor.matrixAutoUpdate = false
  const pm = new THREE.MeshBasicMaterial({ color: INK.silver2, transparent: true, opacity: 0 })
  const ring = new THREE.Mesh(geo.ring, pm)
  const tickMat = new THREE.LineBasicMaterial({ color: INK.silver2, transparent: true, opacity: 0 })
  const ticks = new THREE.LineSegments(geo.ticks, tickMat)
  const arcGeo = new THREE.BufferGeometry()
  arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(65 * 3), 3))
  const protractorArc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: INK.silver, transparent: true, opacity: 0 }))
  protractorArc.frustumCulled = false
  protractor.add(ring, ticks, protractorArc)
  protractor.userData.mats = [pm, tickMat, protractorArc.material]
  group.add(oven, ovenShadow, slit, rail, prep.group, prep.shadow, prepStop.group, plate.group, plate.shadow, ghost.group, ghost.shadow, protractor)
  for (const m of modules) group.add(m.group, m.shadow)
  for (const s of stops) group.add(s.group)
  return { group, oven, ovenBody: body, ovenShadow, slit, slitJaws: [j1, j2], slitHw, rail, prep, prepStop, modules, stops, plate, ghost, protractor, protractorArc }
}

/** Classical bar-magnet capsule (N half silver, S half dark silver; no red/blue, D §3.1 overlays). */
function capsuleGeometry(): THREE.BufferGeometry {
  const g = new THREE.CapsuleGeometry(0.012, 0.066, 2, 6) // ≈ 6 px on screen: 2000 of them stay cheap
  const pos = g.getAttribute('position')
  const col = new Float32Array(pos.count * 3)
  const n = new THREE.Color(INK.silver)
  const s = new THREE.Color(INK.silver3)
  for (let i = 0; i < pos.count; i++) (pos.getY(i) >= 0 ? n : s).toArray(col, i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

export function buildLabRig(): LabRig {
  const geo = buildLabGeometry()
  const blob = radialTexture([
    [0, 1],
    [0.55, 0.55],
    [1, 0],
  ])
  const glow = radialTexture([
    [0, 1],
    [0.3, 0.45],
    [1, 0],
  ])
  const hatch = hatchTexture()
  const root = new THREE.Group()
  root.rotation.set(...PHYSICS_TO_THREE)
  // lights (D §1.7), directions in physics coordinates relative to the establishing shot's azimuth
  const key = new THREE.DirectionalLight(LIGHT_RIG.key.color, LIGHT_RIG.key.intensity)
  key.position.copy(dirFrom(LIGHT_RIG.key.az, LIGHT_RIG.key.el, 20))
  const rim = new THREE.DirectionalLight(LIGHT_RIG.rim.color, LIGHT_RIG.rim.intensity.lab)
  rim.position.copy(dirFrom(LIGHT_RIG.rim.az, LIGHT_RIG.rim.el, 20))
  const hemi = new THREE.HemisphereLight(LIGHT_RIG.fill.sky, LIGHT_RIG.fill.ground, LIGHT_RIG.fill.intensity)
  hemi.position.set(0, 0, 1) // hemisphere "up" = physics z (the group rotation maps it to three y)
  root.add(key, rim, hemi)
  const floor = new THREE.Mesh(geo.floor, new THREE.MeshStandardMaterial({ color: '#121824', metalness: 0.2, roughness: 0.85 }))
  root.add(floor)
  const benches = Array.from({ length: MAX_BENCHES }, (_, b) => benchRig(geo, blob, hatch, b))
  for (const b of benches) root.add(b.group)
  const atoms = makeAtomMesh(ATOMS)
  root.add(atoms.mesh)
  const capsules = new THREE.InstancedMesh(capsuleGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.5, transparent: true }), ATOMS)
  capsules.frustumCulled = false
  capsules.count = 0
  root.add(capsules)
  // the frozen specimen (b2): one enlarged capsule + angle arc (z → moment) + dashed drop-line to the z axis
  const specimen = new THREE.Group()
  const specCaps = new THREE.Mesh(capsuleGeometry().scale(4, 4, 4), new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.45, transparent: true }))
  const arc = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: INK.silver, transparent: true }))
  const drop = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.04, gapSize: 0.03, transparent: true }))
  const zAxis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.34), new THREE.Vector3(0, 0, 0.34)]), new THREE.LineBasicMaterial({ color: INK.silver2, transparent: true }))
  specimen.add(specCaps, arc, drop, zAxis)
  specimen.userData = { caps: specCaps, arc, drop, zAxis }
  specimen.visible = false
  root.add(specimen)
  // precession glints (uniform field, b5a): 24 silver rings
  const glints = new THREE.InstancedMesh(new THREE.TorusGeometry(0.05, 0.004, 4, 24), new THREE.MeshBasicMaterial({ color: INK.silver, transparent: true, opacity: 0 }), 24)
  glints.frustumCulled = false
  glints.count = 0
  root.add(glints)
  // centroid overlay (l1-average:b2): m̂ and n̂ arrows + drop-line + tick at the plate centre (plate pattern frame)
  const centroid = new THREE.Group()
  centroid.visible = false
  root.add(centroid)
  const seeds = makeSeeds()
  void glow
  return { root, geo, benches, atoms, seeds, floor, capsules, specimen, glints, centroid, lights: [key, rim, hemi], textures: [blob, glow, hatch], hardware: false }
}

export function disposeLabRig(r: LabRig): void {
  r.root.traverse((o) => {
    const m = o as THREE.Mesh
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else mat?.dispose()
    if (m.geometry && !Object.values(r.geo).includes(m.geometry) && !sharedGeometry.has(m.geometry)) m.geometry.dispose()
  })
  for (const g of Object.values(r.geo)) (g as THREE.BufferGeometry).dispose()
  for (const t of r.textures) t.dispose()
}

export { DEPOSIT_MAX }
