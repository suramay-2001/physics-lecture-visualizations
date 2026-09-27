/**
 * The lab's shared look (D-lab §2 "shared grammar"; the lecture scenes' D-L1 §1.7), for every bench after the frame
 * check. Babylon only; no numbers, no physics.
 *   - Palette: stage/tokens.ts only (amber +, cobalt −, near-white state, silver structure, orchid operators).
 *   - Tone mapping: KHR PBR Neutral, in core (ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL), the same
 *     curve as three's NeutralToneMapping on the lecture canvas.
 *   - Lights: LIGHT_RIG (hemispheric fill, warm key, cool rim).
 *   - Environment: a PROCEDURAL ROOM (three's RoomEnvironment idea) built from a few boxes and emissive panels on
 *     their own layer, rendered ONCE into a reflection probe, prefiltered once (HDRFiltering) and used as
 *     `scene.environmentTexture`. No environment helper, no CDN, no .env/.hdr file, nothing fetched.
 *   - Outcome dots are UNLIT (their colour is the reserved encoding, never shaded).
 */
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Constants } from '@babylonjs/core/Engines/constants'
// the probe's cube render target and its mip chain (side-effect registrations the Engine.pure does not carry)
import '@babylonjs/core/Engines/Extensions/engine.renderTarget'
import '@babylonjs/core/Engines/Extensions/engine.renderTargetCube'
import '@babylonjs/core/Engines/Extensions/engine.renderTargetTexture'
// the PBR environment-BRDF lookup is an embedded data: image (no fetch; CSP img-src allows data:)
import '@babylonjs/core/Misc/fileTools'
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { HDRFiltering } from '@babylonjs/core/Materials/Textures/Filtering/hdrFiltering'
import { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder.pure'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { ReflectionProbe } from '@babylonjs/core/Probes/reflectionProbe'
import type { Scene } from '@babylonjs/core/scene'
import { INK, LIGHT_RIG } from '../../stage/tokens'
import { physToRender, type V3 } from '../axes'

/** Layer bits: each view's camera sees only its own layer; the room is seen by no camera (only the probe). */
export const LAYER = { a: 0x1, b: 0x2, all: 0x0fffffff, room: 0x10000000 } as const

export const v3 = (p: V3): Vector3 => {
  const [x, y, z] = physToRender(p)
  return new Vector3(x, y, z)
}
/** Direction a DirectionalLight shines along, from a light at physics azimuth/elevation (degrees) toward the origin. */
const lightDir = (azDeg: number, elDeg: number) => {
  const az = (azDeg * Math.PI) / 180
  const el = (elDeg * Math.PI) / 180
  return v3([-Math.cos(el) * Math.cos(az), -Math.cos(el) * Math.sin(az), -Math.sin(el)])
}

export interface PbrOpts {
  metallic?: number
  roughness?: number
  /** Emissive share of the base colour (the reserved encodings read at a glance). */
  glow?: number
  alpha?: number
}

export interface Look {
  /** A PBR material in a token colour. */
  pbr(name: string, hex: string, o?: PbrOpts): PBRMaterial
  /** An unlit material (outcome dots, gauge ticks): the colour is the encoding. */
  unlit(name: string, hex: string, alpha?: number): StandardMaterial
  /** True once the environment is prefiltered and in use. */
  envReady(): boolean
  dispose(): void
}

export function createLook(scene: Scene, requestRender: () => void, opts: { layerMask?: number } = {}): Look {
  const ip = scene.imageProcessingConfiguration
  ip.toneMappingEnabled = true
  ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL

  const fill = new HemisphericLight('fill', v3([0, 0, 1]), scene)
  fill.diffuse = Color3.FromHexString(LIGHT_RIG.fill.sky)
  fill.groundColor = Color3.FromHexString(LIGHT_RIG.fill.ground)
  fill.specular = Color3.Black()
  fill.intensity = LIGHT_RIG.fill.intensity
  const key = new DirectionalLight('key', lightDir(LIGHT_RIG.key.az, LIGHT_RIG.key.el), scene)
  key.diffuse = Color3.FromHexString(LIGHT_RIG.key.color)
  key.intensity = LIGHT_RIG.key.intensity
  const rim = new DirectionalLight('rim', lightDir(LIGHT_RIG.rim.az, LIGHT_RIG.rim.el), scene)
  rim.diffuse = Color3.FromHexString(LIGHT_RIG.rim.color)
  rim.intensity = LIGHT_RIG.rim.intensity.other
  if (opts.layerMask !== undefined) for (const l of [fill, key, rim]) l.includeOnlyWithLayerMask = opts.layerMask

  /* ---------------- procedural room → reflection probe → prefilter (once) ---------------- */
  const roomMats: StandardMaterial[] = []
  const roomMeshes: AbstractMesh[] = []
  const roomMat = (name: string, g: number) => {
    const m = new StandardMaterial(name, scene)
    m.disableLighting = true
    m.emissiveColor = new Color3(g, g, g * 1.04)
    m.backFaceCulling = false
    // the room is not a picture: no tone mapping or exposure of its own (the probe stores it as it is)
    m.imageProcessingConfiguration = new ImageProcessingConfiguration()
    m.imageProcessingConfiguration.isEnabled = false
    roomMats.push(m)
    return m
  }
  const box = (name: string, size: [number, number, number], at: V3, mat: StandardMaterial, inside = false) => {
    const [w, d, h] = physToRender(size).map(Math.abs)
    const b = CreateBox(name, { width: w, height: d, depth: h, sideOrientation: inside ? Mesh.BACKSIDE : Mesh.DEFAULTSIDE }, scene)
    b.position = v3(at)
    b.material = mat
    b.layerMask = LAYER.room
    b.isPickable = false
    roomMeshes.push(b)
    return b
  }
  // a dim room, a large soft ceiling panel and three smaller wall panels (low-frequency: no filtering artefacts)
  box('room', [14, 14, 9], [0, 0, 1.5], roomMat('room-walls', 0.06), true)
  const panel = roomMat('room-panel', 1)
  const panelDim = roomMat('room-panel-dim', 0.55)
  box('panel-top', [6, 6, 0.1], [0, 0, 5.8], panel)
  box('panel-key', [0.1, 3, 2.2], [6.5, 0.6, 2.4], panel)
  box('panel-rim', [3, 0.1, 1.6], [-2.5, 6.5, 1.2], panelDim)
  box('panel-low', [2.4, 0.1, 1.2], [1.5, -6.5, -1.5], panelDim)

  const probe = new ReflectionProbe('lab-room', 128, scene, true, true, true)
  probe.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
  probe.position = Vector3.Zero()
  for (const m of roomMeshes) probe.renderList!.push(m)
  let ready = false
  let disposed = false
  const rtt = probe.cubeTexture
  const done = rtt.onAfterRenderObservable.addOnce(() => {
    // after the probe's single render: prefilter the mip chain for roughness, then light the scene with it
    const filter = new HDRFiltering(scene.getEngine(), { hdrScale: 2.2, quality: Constants.TEXTURE_FILTERING_QUALITY_HIGH })
    filter
      .prefilter(rtt)
      .then(() => {
        if (disposed) return
        scene.environmentTexture = rtt
        scene.environmentIntensity = LIGHT_RIG.env.state
        for (const m of roomMeshes) m.setEnabled(false)
        ready = true
        requestRender()
      })
      .catch((err: unknown) => console.warn('[lab] environment prefilter failed; lights only', err))
  })

  return {
    pbr(name, hex, o = {}) {
      const m = new PBRMaterial(name, scene)
      const c = Color3.FromHexString(hex)
      m.albedoColor = c.toLinearSpace()
      m.metallic = o.metallic ?? 0
      m.roughness = o.roughness ?? 0.45
      if (o.glow) m.emissiveColor = c.toLinearSpace().scale(o.glow)
      if (o.alpha !== undefined && o.alpha < 1) {
        m.alpha = o.alpha
        m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND
      }
      return m
    },
    unlit(name, hex, alpha = 1) {
      const m = new StandardMaterial(name, scene)
      m.disableLighting = true
      m.emissiveColor = Color3.FromHexString(hex)
      m.alpha = alpha
      return m
    },
    envReady: () => ready,
    dispose() {
      disposed = true
      rtt.onAfterRenderObservable.remove(done)
      // meshes, materials, lights and the probe go with scene.dispose()
    },
  }
}

/** Near-white / orchid / silver / outcome hexes, re-exported for the scenes (tokens stay the only copy). */
export { INK }
