/**
 * The lab gate (build/chunkGraph.ts LAB_GATE_MODULE): the ONLY module `useLabEngine` imports dynamically, and the
 * root of every Babylon chunk. Mounts one engine on a fresh canvas and returns the LabHandle (lab/handle.ts).
 *
 * Engine (decisions/lab.md #6, #9, #13; option names checked in the installed 9.28.0 .d.ts):
 *   audioEngine false · loseContextOnDispose true (dispose releases the WebGL context at once) ·
 *   doNotHandleContextLost true (a loss goes to the page: fallback + "Restart 3D" on a fresh canvas) ·
 *   adaptToDeviceRatio with limitDeviceRatio 2 (DPR ≤ 2) · renderEvenInBackground false · no offline manifests.
 * Scene: `useRightHandedSystem = true` and the lecture scenes' axis map (lab/axes.ts physToRender), ruling #1.
 * Rendering is ON DEMAND: a frame is drawn when the view changes, on resize, while a pointer or key is down, while the
 * camera's inertia settles, and until the scene's shaders are ready; an idle lab draws 0 frames. Motion off
 * (topbar toggle, prefers-reduced-motion) sets camera inertia to 0, so orbiting follows the input 1:1 with no glide.
 * Nothing here formats a number or imports a physics value: the page hands over engine values (lab/rules.test.ts).
 */
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import '@babylonjs/core/Culling/ray'
// The Engine WITHOUT `Engines/engine`'s blanket side effects: that entry also registers the texture-loader table
// (dynamic imports of the DDS/KTX/Basis/ENV/HDR/EXR/TGA/IES loaders) and the loading screen, which the lab never
// uses and the chunk contract bans (build/chunks.test.ts (e)). Only the extensions a lab scene needs are registered.
import { Engine } from '@babylonjs/core/Engines/engine.pure'
import '@babylonjs/core/Engines/Extensions/engine.alpha'
import '@babylonjs/core/Engines/Extensions/engine.dynamicBuffer'
import '@babylonjs/core/Engines/Extensions/engine.uniformBuffer'
import '@babylonjs/core/Engines/AbstractEngine/abstractEngine.dom'
import '@babylonjs/core/Engines/AbstractEngine/abstractEngine.states'
import '@babylonjs/core/Engines/AbstractEngine/abstractEngine.stencil'
import '@babylonjs/core/Engines/AbstractEngine/abstractEngine.renderPass'
import '@babylonjs/core/Engines/AbstractEngine/abstractEngine.texture'
import '@babylonjs/core/Engines/thinEngine.scissor'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Scene } from '@babylonjs/core/scene'
import { STAGE_BG } from '../../stage/tokens'
import { physToRender, shotPosition, type V3 } from '../axes'
import type { LabBench, LabGuiAction, LabHandle, LabMountOptions, LabProbe, LabView, Projector } from '../handle'
import { installTripwire } from './tripwire'

/** The lecture Bloch scene's standard shot (BlochScene.tsx B-STD) and lens: az 30°, el 22°, d 4.2, vertical fov 40°. */
export const LAB_SHOT = { az: 30, el: 22, d: 4.2, fov: 40 } as const
const DEG = Math.PI / 180

export function mountLab(canvas: HTMLCanvasElement, opts: LabMountOptions): LabHandle {
  installTripwire(opts.hooks.trip)

  const engine = new Engine(
    canvas,
    true,
    {
      audioEngine: false,
      loseContextOnDispose: true,
      doNotHandleContextLost: true,
      adaptToDeviceRatio: true,
      limitDeviceRatio: 2,
      antialias: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    },
    true,
  )
  engine.renderEvenInBackground = false
  engine.enableOfflineSupport = false
  engine.disableManifestCheck = true

  const scene = new Scene(engine)
  scene.useRightHandedSystem = true
  scene.clearColor = Color4.FromHexString(`${STAGE_BG.bloch}ff`)
  scene.skipPointerMovePicking = true

  const camera = new ArcRotateCamera('lab-camera', 0, 1, LAB_SHOT.d, Vector3.Zero(), scene)
  camera.minZ = 0.1
  camera.maxZ = 50
  camera.lowerRadiusLimit = 2.4
  camera.upperRadiusLimit = 9
  camera.wheelDeltaPercentage = 0.01
  camera.panningSensibility = 0
  camera.attachControl()

  const setShot = (az: number, el: number, d: number, fovDeg: number) => {
    camera.fov = fovDeg * DEG
    const [x, y, z] = shotPosition(az, el, d)
    camera.setPosition(new Vector3(x, y, z))
    camera.inertialAlphaOffset = camera.inertialBetaOffset = camera.inertialRadiusOffset = 0
  }
  setShot(LAB_SHOT.az, LAB_SHOT.el, LAB_SHOT.d, LAB_SHOT.fov)
  const setMotion = (on: boolean) => {
    camera.inertia = on ? 0.6 : 0
  }
  setMotion(opts.motion)

  /* ---------------- projection (DOM labels, __lab) ---------------- */
  const tmp = new Vector3()
  /** Render-buffer px of a render-space point through the current camera; null when behind it. */
  const projectRender = (r: Vector3): [number, number] | null => {
    const w = engine.getRenderWidth()
    const h = engine.getRenderHeight()
    camera.getViewMatrix(true)
    const out = Vector3.Project(r, Matrix.IdentityReadOnly, camera.getTransformationMatrix(), camera.viewport.toGlobal(w, h))
    if (!(out.z > 0 && out.z < 1)) return null
    return [out.x, out.y]
  }
  const cssPerPx = () => canvas.clientWidth / Math.max(1, engine.getRenderWidth())
  const projectLocal: Projector = (p: V3) => {
    const [x, y, z] = physToRender(p)
    const q = projectRender(tmp.set(x, y, z))
    if (!q) return null
    const s = cssPerPx()
    return [q[0] * s, q[1] * s]
  }
  const toPage = (q: [number, number] | null): [number, number] | null => {
    if (!q) return null
    const b = canvas.getBoundingClientRect()
    return [b.left + q[0], b.top + q[1]]
  }

  /* ---------------- on-demand frame loop ---------------- */
  const renderCbs = new Set<(project: Projector) => void>()
  const guiCbs = new Set<(a: LabGuiAction) => void>()
  let raf = 0
  let disposed = false
  let lost = false
  let pointers = 0
  let keys = 0
  const settling = () => camera.inertialAlphaOffset !== 0 || camera.inertialBetaOffset !== 0 || camera.inertialRadiusOffset !== 0
  const renderNow = () => {
    scene.render()
    opts.hooks.frame()
    for (const cb of renderCbs) cb(projectLocal)
  }
  const tick = () => {
    raf = 0
    if (disposed || lost) return
    renderNow()
    if (pointers > 0 || keys > 0 || settling() || !scene.isReady()) request()
  }
  const request = () => {
    if (!raf && !disposed && !lost) raf = requestAnimationFrame(tick)
  }

  const onPointerDown = () => {
    pointers++
    request()
  }
  const onPointerUp = () => {
    pointers = Math.max(0, pointers - 1)
    request()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return
    keys++
    request()
  }
  const onKeyUp = () => {
    keys = Math.max(0, keys - 1)
    request()
  }
  const onBlur = () => {
    keys = 0
    pointers = 0
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('pointermove', request)
  canvas.addEventListener('wheel', request, { passive: true })
  canvas.addEventListener('keydown', onKeyDown)
  canvas.addEventListener('keyup', onKeyUp)
  canvas.addEventListener('blur', onBlur)
  const ro = new ResizeObserver(() => {
    engine.resize()
    request()
  })
  ro.observe(canvas)

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    opts.onContextLost()
  }
  const onRestored = () => opts.onContextRestored()
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  /* ---------------- __lab probe (DEV / ?measure) ---------------- */
  const gl = () => (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
  const probe: LabProbe = {
    project: (p) => toPage(projectLocal(p)),
    shot: (az, el, d, fov) => {
      setShot(az, el, d, fov)
      renderNow()
    },
    beadScreen: () => null,
    bench: async ({ frames = 120, gui = true } = {}) => {
      void gui
      const ctx = gl()
      const px = new Uint8Array(4)
      const fence = () => ctx?.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
      const alpha0 = camera.alpha
      for (let i = 0; i < 5; i++) {
        renderNow()
        fence()
      }
      const times: number[] = []
      for (let i = 0; i < frames; i++) {
        camera.alpha = alpha0 + (2 * Math.PI * (i + 1)) / frames
        const t = performance.now()
        renderNow()
        fence()
        times.push(performance.now() - t)
      }
      camera.alpha = alpha0
      renderNow()
      const s = [...times].sort((a, b) => a - b)
      const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]
      const r = (x: number) => Math.round(x * 1000) / 1000
      const result: LabBench = {
        frames,
        gui,
        p50: r(q(0.5)),
        p95: r(q(0.95)),
        max: r(s[s.length - 1]),
        canvas: [canvas.width, canvas.height],
        viewport: [innerWidth, innerHeight],
        hardwareScaling: engine.getHardwareScalingLevel(),
        activeMeshes: scene.getActiveMeshes().length,
      }
      return result
    },
    loseContext: () => {
      const ext = gl()?.getExtension('WEBGL_lose_context')
      ext?.loseContext()
      return !!ext
    },
  }
  const unregister = opts.hooks.mounted(probe, () => EngineStore.Instances.length)

  engine.resize()
  request()
  scene.executeWhenReady(request)

  return {
    update(_view: LabView) {
      request()
    },
    setMotion(on) {
      setMotion(on)
    },
    onRender(cb) {
      renderCbs.add(cb)
      request()
      return () => renderCbs.delete(cb)
    },
    onGui(cb) {
      guiCbs.add(cb)
      return () => guiCbs.delete(cb)
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointermove', request)
      canvas.removeEventListener('wheel', request)
      canvas.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('blur', onBlur)
      // our loss listener goes first: the context loss that dispose causes is not a failure
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      renderCbs.clear()
      guiCbs.clear()
      camera.detachControl()
      scene.dispose()
      engine.dispose()
      unregister()
    },
  }
}
