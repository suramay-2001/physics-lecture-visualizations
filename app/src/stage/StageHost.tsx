/**
 * The ONE WebGL canvas of the session (W-L1 §2.1, §2.7; decision #14). Lazy chunk, mounted by App after
 * the first `requestStageHost()`, then kept across routes. When no view is registered the frame loop goes
 * to 'demand' and the canvas is hidden.
 *
 *   <Canvas> ─ Frame(−1000: clear, stats) ─ Driver(−100) ─ StagePort (scenes, 0) ─ ViewRenderer(1)
 *            ─ scene labels (500, useDomLabels) ─ FrameEnd(1000)
 *
 * Stacking contract (stage/story.css): canvas `position: fixed; inset: 0; z-index: 1; pointer-events:
 * none`, transparent outside views; the sticky stage box is z 2 (labels above the canvas); the stage
 * column's dark backing is non-positioned (below). W0 scope: no dpr governor or context-restore remount yet
 * (W1); a lost context flips `stage.contextLost`, which turns every view off.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import type { Beat, StageKind } from '../content/stage'
import { driveUnit, storyKinds } from './drive'
import { frameEnd, frameStart, installStageInstrument } from './instrument'
import { StagePort } from './StagePort'
import { setContextLost, stage } from './store'
import { STAGE_BG } from './tokens'
import { getViews, useViews, type ViewEntry } from './views'

// Before the Canvas creates its context, so window.__stage counts it.
installStageInstrument()

/** Seconds for a clue reveal to move the stage from question to answer (full motion). */
export const REVEAL_SECONDS = 0.6
/** Decision #22: the reader-driven clock keeps running this long after the last scroll/click. */
export const SETTLE_SECONDS = 1.2

const kindsCache = new WeakMap<readonly Beat[], StageKind[]>()
const kindsOf = (beats: readonly Beat[]) => {
  let k = kindsCache.get(beats)
  if (!k) kindsCache.set(beats, (k = storyKinds(beats)))
  return k
}
const INSET_CLEAR = new THREE.Color(STAGE_BG.inset)

function Frame() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.info.autoReset = false
  }, [gl])
  useFrame(() => {
    frameStart()
    gl.info.reset()
    gl.setScissorTest(false)
    gl.setClearColor(0x000000, 0)
    gl.clear(true, true, true)
  }, -1000)
  useFrame(() => frameEnd(), 1000)
  return null
}

/** Priority −100: per near unit, one getBoundingClientRect of the stage box, then the pure driveUnit. */
function Driver() {
  useFrame((_, dt) => {
    const now = performance.now()
    const delta = Math.min(dt, 0.1)
    const byUnit = new Map<string, ViewEntry[]>()
    for (const v of getViews()) {
      const list = byUnit.get(v.unitId)
      if (list) list.push(v)
      else byUnit.set(v.unitId, [v])
    }
    for (const [unitId, list] of byUnit) {
      const track = stage.units.get(unitId)
      if (!track || !track.near || !track.box || stage.contextLost || !track.beats.length) {
        for (const v of list) {
          v.weight = 0
          v.screen = null
        }
        continue
      }
      // reveal mixes (decision #17): time-driven on click, a cut under reduced motion
      let revealing = false
      for (let i = 0; i < track.beatCount; i++) {
        const target = track.revealed.has(i) ? 1 : 0
        let m = track.revealMix[i] ?? 0
        if (!stage.motion) m = target
        else if (m !== target) {
          m = Math.min(1, Math.max(0, m + (Math.sign(target - m) * delta) / REVEAL_SECONDS))
          revealing = true
        }
        track.revealMix[i] = m
      }
      // reader-driven clock (decision #22): stands still unless the reader is acting
      const active = revealing || now - track.lastInput < SETTLE_SECONDS * 1000
      track.delta = stage.motion && active ? delta : 0
      track.clock += track.delta

      const box = track.box.getBoundingClientRect()
      const d = driveUnit(track.beats, track.u, stage.motion, (i) => track.revealMix[i] ?? 0, { w: box.width, h: box.height }, kindsOf(track.beats))
      const beat = track.beats[d.sample.beat]
      const terms = d.revealed ? { ...beat?.terms, ...beat?.reveal?.terms } : beat?.terms
      const target = stage.focusTerm && terms ? terms[stage.focusTerm] : undefined
      for (const v of list) {
        const kd = d.kinds.get(v.kind)
        if (!kd || v.failed) {
          v.weight = 0
          v.screen = null
          continue
        }
        const [rx, ry, rw, rh] = kd.rect
        v.rect = kd.rect
        v.weight = kd.weight
        const sx = box.left + rx
        const sy = box.top + ry
        const visible = kd.weight > 0 && rw > 0 && rh > 0 && sx < innerWidth && sy < innerHeight && sx + rw > 0 && sy + rh > 0
        v.screen = visible ? [sx, sy, rw, rh] : null
        v.frame = {
          unitId,
          kind: v.kind,
          slot: kd.slot,
          state: kd.state,
          from: kd.from,
          to: kd.to,
          t: kd.t,
          beat: d.sample.beat,
          hold: d.sample.hold,
          revealed: d.revealed,
          u: track.u,
          clock: track.clock,
          delta: track.delta,
          motion: stage.motion,
          focus: target && target.kind === v.kind ? target.anchor : null,
          weight: kd.weight,
          size: { w: rw, h: rh },
        }
      }
    }
  }, -100)
  return null
}

/** Priority 1: scissored render of every visible view, cleared to its stage colour (same as its DOM backing). */
function ViewRenderer() {
  useFrame(({ gl }) => {
    const H = gl.domElement.clientHeight
    const tracks = new Set<string>()
    gl.setScissorTest(true)
    for (const v of getViews()) {
      if (!v.screen || v.weight <= 0) continue
      const [x, y, w, h] = v.screen
      const cam = v.camera ?? v.fallbackCamera
      if (cam instanceof THREE.PerspectiveCamera) {
        const a = w / h
        if (Math.abs(cam.aspect - a) > 1e-4) {
          cam.aspect = a
          cam.updateProjectionMatrix()
        }
      }
      const yGl = H - y - h
      gl.setViewport(x, yGl, w, h)
      gl.setScissor(x, yGl, w, h)
      gl.setClearColor(v.frame?.slot === 'inset' ? INSET_CLEAR : v.clear, 1)
      gl.clear(true, true, true)
      gl.render(v.scene, cam)
      v.renders++
      tracks.add(v.unitId)
    }
    gl.setScissorTest(false)
    for (const t of stage.units.values()) t.onScreen = tracks.has(t.unitId)
  }, 1)
  return null
}

export default function StageHost() {
  const views = useViews()
  const active = views.length > 0
  return (
    <Canvas
      className="stage-canvas"
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', visibility: active ? 'visible' : 'hidden' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: stage.measure }}
      dpr={[1, stage.dprCap]}
      frameloop={active ? 'always' : 'demand'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          setContextLost(true)
        })
      }}
      aria-hidden
    >
      <Frame />
      <Driver />
      <StagePort />
      <ViewRenderer />
    </Canvas>
  )
}
