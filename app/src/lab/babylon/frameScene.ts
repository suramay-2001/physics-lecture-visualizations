/**
 * The frame check's picture (the lab foundation's measuring scene). Babylon only; draws what the page hands over.
 *
 * Grammar (D-lab §2, the lecture Bloch scene's look): silver structure (shell, equator and two meridians, the three
 * axes), the near-white state (bead and its line from the centre), stage/tokens.ts colours and LIGHT_RIG lights
 * (hemispheric fill, key, rim; no environment helper, no texture, no CDN), KHR PBR Neutral tone mapping (three's
 * NeutralToneMapping). Words are DOM (the page places the pole labels by projection).
 *
 * Babylon GUI draws three AFFORDANCES and no text (ruling #2): a ring on the bead (a marker for the drag handle the
 * benches will add), a slider track for φ and a ± pad. The slider and the pad report gestures as LabGuiActions; their
 * DOM twins on the page are canonical, and the GUI mirrors the store through `update`.
 */
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder.pure'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder.pure'
import type { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture'
import { Control } from '@babylonjs/gui/2D/controls/control'
import { Ellipse } from '@babylonjs/gui/2D/controls/ellipse'
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle'
import { Slider } from '@babylonjs/gui/2D/controls/sliders/slider'
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel'
import { INK, LABEL_BACKING, LIGHT_RIG } from '../../stage/tokens'
import { physToRender, type V3 } from '../axes'
import type { BenchScene, BenchSceneContext } from './benchScene'

const AXIS_LEN = 1.3
const SHELL = '#a7b6cf'
/** The slider covers the control's two turns (lab/frameBench.ts PHI_TURN), in whole degrees. */
const SLIDER_MAX = 719

const v3 = (p: V3) => {
  const [x, y, z] = physToRender(p)
  return new Vector3(x, y, z)
}
/** Direction a DirectionalLight shines along, from a light at physics azimuth/elevation (degrees) toward the origin. */
const lightDir = (azDeg: number, elDeg: number) => {
  const az = (azDeg * Math.PI) / 180
  const el = (elDeg * Math.PI) / 180
  return v3([-Math.cos(el) * Math.cos(az), -Math.cos(el) * Math.sin(az), -Math.sin(el)])
}
const circle = (axis: 'x' | 'y' | 'z', n = 96): Vector3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    return v3(axis === 'z' ? [c, s, 0] : axis === 'x' ? [0, c, s] : [c, 0, s])
  })

export function buildFrameScene(ctx: BenchSceneContext): BenchScene {
  const { scene } = ctx
  const onGui = ctx.emit
  const requestRender = ctx.requestRender
  // tone mapping = three's NeutralToneMapping (the lecture host's)
  const ip = scene.imageProcessingConfiguration
  ip.toneMappingEnabled = true
  ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL

  // lights (LIGHT_RIG): hemispheric fill, warm key, cool rim
  const fill = new HemisphericLight('fill', v3([0, 0, 1]), scene)
  fill.diffuse = Color3.FromHexString(LIGHT_RIG.fill.sky)
  fill.groundColor = Color3.FromHexString(LIGHT_RIG.fill.ground)
  fill.specular = Color3.Black()
  fill.intensity = LIGHT_RIG.fill.intensity * 2
  const key = new DirectionalLight('key', lightDir(LIGHT_RIG.key.az, LIGHT_RIG.key.el), scene)
  key.diffuse = Color3.FromHexString(LIGHT_RIG.key.color)
  key.intensity = LIGHT_RIG.key.intensity * 0.45
  const rim = new DirectionalLight('rim', lightDir(LIGHT_RIG.rim.az, LIGHT_RIG.rim.el), scene)
  rim.diffuse = Color3.FromHexString(LIGHT_RIG.rim.color)
  rim.intensity = LIGHT_RIG.rim.intensity.other * 0.45

  // structure: faint shell, equator + two meridians, three axes (silver)
  const shellMat = new StandardMaterial('shell', scene)
  shellMat.diffuseColor = Color3.FromHexString(SHELL)
  shellMat.specularColor = new Color3(0.15, 0.15, 0.15)
  shellMat.alpha = 0.09
  shellMat.disableDepthWrite = true
  const shell = CreateSphere('shell', { diameter: 2, segments: 48 }, scene)
  shell.material = shellMat
  shell.isPickable = false

  const lines: LinesMesh[] = []
  const line = (name: string, points: Vector3[], hex: string, alpha: number) => {
    const l = CreateLines(name, { points }, scene)
    l.color = Color3.FromHexString(hex)
    l.alpha = alpha
    l.isPickable = false
    lines.push(l)
    return l
  }
  line('equator', circle('z'), INK.silver2, 0.9)
  line('meridian-xz', circle('y'), INK.silver2, 0.45)
  line('meridian-yz', circle('x'), INK.silver2, 0.45)
  for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[])
    line('axis', [v3([-a[0] * AXIS_LEN, -a[1] * AXIS_LEN, -a[2] * AXIS_LEN]), v3([a[0] * AXIS_LEN, a[1] * AXIS_LEN, a[2] * AXIS_LEN])], INK.silver, 0.7)

  // the state: near-white bead and its line from the centre (positions from the page's engine values)
  const beadMat = new StandardMaterial('state', scene)
  beadMat.diffuseColor = Color3.FromHexString(INK.state)
  beadMat.emissiveColor = Color3.FromHexString(INK.state).scale(0.55)
  beadMat.specularColor = new Color3(0.3, 0.3, 0.3)
  const bead = CreateSphere('bead', { diameter: 0.12, segments: 24 }, scene)
  bead.material = beadMat
  bead.isPickable = false
  let stateLine = CreateLines('state-line', { points: [Vector3.Zero(), v3([1, 0, 0])], updatable: true }, scene)
  stateLine.color = Color3.FromHexString(INK.state)
  stateLine.isPickable = false

  // GUI affordances (no text): ring on the bead, φ slider track, ± pad
  // The GUI texture stays at device resolution and sizes are given in CSS px × DPR (`px`). Measured (G-lab, 1440×900
  // @2×): `adjustToEngineHardwareScalingLevel` (a CSS-size texture scaled up) made orbit frames SLOWER (p95 3.0 vs
  // 1.8–2.2 ms), because the scaled root defeats the GUI's invalidate-rect redraw of the moving ring.
  const ui = AdvancedDynamicTexture.CreateFullscreenUI('lab-affordances', true, scene)
  const dpr = 1 / scene.getEngine().getHardwareScalingLevel()
  const px = (cssPx: number) => Math.round(cssPx * dpr)
  const ring = new Ellipse('ring')
  ring.widthInPixels = ring.heightInPixels = px(34)
  ring.thickness = px(2)
  ring.color = INK.silver
  ring.isPointerBlocker = false
  ring.isHitTestVisible = false
  ui.addControl(ring)
  ring.linkWithMesh(bead)

  const slider = new Slider('phi-slider')
  slider.minimum = 0
  slider.maximum = SLIDER_MAX
  slider.step = 1
  slider.value = 0
  slider.widthInPixels = px(220)
  slider.heightInPixels = px(26)
  slider.color = INK.silver
  slider.background = INK.silver3
  slider.borderColor = INK.silver2
  slider.thumbColor = INK.silver
  slider.isThumbCircle = true
  slider.isPointerBlocker = true
  slider.thumbWidth = `${px(18)}px`
  slider.barOffset = `${px(10)}px`
  slider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
  slider.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
  slider.leftInPixels = -px(20)
  slider.topInPixels = -px(20)
  let mirroring = false
  slider.onValueChangedObservable.add((value) => {
    if (!mirroring) onGui({ type: 'phi', deg: Math.round(value) })
  })
  ui.addControl(slider)

  const pad = new StackPanel('pm-pad')
  pad.isVertical = false
  pad.heightInPixels = px(36)
  pad.widthInPixels = px(84)
  pad.spacing = px(12)
  pad.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
  pad.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
  pad.leftInPixels = -px(20)
  pad.topInPixels = -px(58)
  const glyph = (w: number, h: number) => {
    const g = new Rectangle()
    g.widthInPixels = px(w)
    g.heightInPixels = px(h)
    g.thickness = 0
    g.background = INK.silver
    g.isHitTestVisible = false
    return g
  }
  const padButton = (name: string, dir: 1 | -1) => {
    const b = new Rectangle(name)
    b.widthInPixels = b.heightInPixels = px(36)
    b.cornerRadius = px(4)
    b.thickness = px(1)
    b.color = INK.silver2
    b.background = LABEL_BACKING
    b.hoverCursor = 'pointer'
    b.isPointerBlocker = true
    b.addControl(glyph(14, 2))
    if (dir > 0) b.addControl(glyph(2, 14))
    b.onPointerEnterObservable.add(() => (b.color = INK.silver))
    b.onPointerOutObservable.add(() => (b.color = INK.silver2))
    b.onPointerClickObservable.add(() => onGui({ type: 'step', dir }))
    return b
  }
  pad.addControl(padButton('minus', -1))
  pad.addControl(padButton('plus', 1))
  ui.addControl(pad)
  // GUI hover/drag states change the texture: draw them
  ui.onControlPickedObservable.add(requestRender)

  return {
    update(view) {
      if (view.bench !== 'frame') return
      const p = v3(view.bead)
      bead.position.copyFrom(p)
      stateLine = CreateLines('state-line', { points: [Vector3.Zero(), p], instance: stateLine })
      mirroring = true
      slider.value = view.phi
      mirroring = false
    },
    cameraOf: () => ctx.camera,
    anchor: () => null,
    handle: (id) => (id === 'bead' ? { world: bead.getAbsolutePosition().clone() } : null),
    beforeFrame: () => {},
    active: () => false,
    resize: () => {},
    setGuiMode(mode) {
      // a layer mask of 0 skips both the GUI's texture update and its composite (no camera shares a bit with it)
      ui.layer!.layerMask = mode === 'off' ? 0 : 0x0fffffff
      ring.isVisible = mode === 'on'
    },
    dispose() {
      ui.dispose()
      // meshes, materials and lights go with scene.dispose()
    },
  }
}
