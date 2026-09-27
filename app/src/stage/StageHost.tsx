/**
 * The ONE WebGL canvas of the session (W-L1 §2.1, §2.7; decision #14). Lazy chunk, mounted by App after
 * the first `requestStageHost()`, then kept across routes. When nothing is registered the frame loop goes
 * to 'demand' and the canvas is hidden; while the Babylon /lab is open (`pauseStageHost`, stage/demand.ts) it
 * goes to 'never': the host keeps its context but draws 0 frames (decisions/lab.md #6).
 *
 *   <Canvas> ─ Frame(−1000: clear, stats) ─ Driver(−100) ─ StagePort (scenes, 0) + IslandPort
 *            ─ ViewRenderer(1) ─ labels(500: useDomLabels, IslandLabels) ─ FrameEnd(1000) ─ Governor(1001)
 *
 * Stacking contract (stage/story.css): canvas `position: fixed; inset: 0; z-index: 1; pointer-events:
 * none`, transparent outside views; the sticky stage box is z 2 (labels above the canvas); the stage
 * column's dark backing is non-positioned (below).
 *
 * Robustness (W1): context loss → every story swaps to StaticStory; a restore remounts the Canvas once
 * (App keys this component by `stage.hostEpoch`); a second loss within 60 s keeps the static version for
 * the session. The DPR governor lowers the cap under sustained load (stage/governor.ts).
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { glKinds, type Beat, type StageKind } from '../content/stage'
import { useStageHostPaused } from './demand'
import { driveUnit, slotRect, storyKinds } from './drive'
import { GOVERNOR, governorFeed, hostGovernor as gov } from './governor'
import { frameEnd, frameStart, installStageInstrument, lastFrameMs, setHostGl, benching } from './instrument'
import { getHostIslands, hostIslandCount, IslandLabels, IslandPort } from './IslandPort'
import { useIslands } from './islands'
import { StagePort } from './StagePort'
import { bumpHostEpoch, giveUpHost, hostGivenUp, setContextLost, stage } from './store'
import { advanceUnit, REVEAL_SECONDS, SETTLE_SECONDS } from './timing'
import { STAGE_BG } from './tokens'
import { getViews, setPortalSize, useViews, type ViewEntry } from './views'

// Before the Canvas creates its context, so window.__stage counts it.
installStageInstrument()

export { REVEAL_SECONDS, SETTLE_SECONDS }
/** A second context loss within this window keeps the static version for the session (W-L1 §2.7). */
export const GIVE_UP_WINDOW_MS = 60_000

/** The kinds this canvas draws for a story: its WebGL kinds (SVG kinds draw in the stage box, stage/svg/SvgStage.tsx). */
const kindsCache = new WeakMap<readonly Beat[], StageKind[]>()
const kindsOf = (beats: readonly Beat[]) => {
  let k = kindsCache.get(beats)
  if (!k) kindsCache.set(beats, (k = glKinds(storyKinds(beats))))
  return k
}
const INSET_CLEAR = new THREE.Color(STAGE_BG.inset)

function Frame() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.info.autoReset = false
    setHostGl(gl)
    return () => setHostGl(null)
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
      // reveal mixes (decision #17: time-driven on click, a cut under reduced motion) and the reader-driven clock
      // (decision #22: stands still unless the reader is acting). A unit with a WebGL view is advanced here only; the
      // SVG route advances the units that have none (stage/timing.ts).
      advanceUnit(track, delta, now, stage.motion)

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
        if (kd.slot) {
          const [, , sw, sh] = slotRect(kd.slot, box.width, box.height)
          setPortalSize(v, sw, sh)
        }
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

/** Frames in which at least one view or island was drawn (the governor only counts those). */
let drewThisFrame = false

/** Priority 1: scissored render of every visible view (cleared to its stage colour) and island (transparent). */
function ViewRenderer() {
  useFrame(({ gl }) => {
    const H = gl.domElement.clientHeight
    const tracks = new Set<string>()
    drewThisFrame = false
    gl.setScissorTest(true)
    // insets draw last: their rect lies inside the main view's rect (registration order is first use)
    const views = getViews()
    const ordered = views.some((v) => v.frame?.slot === 'inset') ? [...views].sort((a, b) => Number(a.frame?.slot === 'inset') - Number(b.frame?.slot === 'inset')) : views
    for (const v of ordered) {
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
      drewThisFrame = true
      tracks.add(v.unitId)
    }
    for (const isl of getHostIslands()) {
      const r = isl.el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0 || r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) continue
      const a = r.width / r.height
      if (Math.abs(isl.camera.aspect - a) > 1e-4) {
        isl.camera.aspect = a
        isl.camera.updateProjectionMatrix()
      }
      const yGl = H - r.top - r.height
      gl.setViewport(r.left, yGl, r.width, r.height)
      gl.setScissor(r.left, yGl, r.width, r.height)
      gl.setClearColor(0x000000, 0)
      gl.clear(true, true, true)
      gl.render(isl.scene, isl.camera)
      isl.renders++
      drewThisFrame = true
    }
    gl.setScissorTest(false)
    for (const t of stage.units.values()) t.onScreen = tracks.has(t.unitId)
  }, 1)
  return null
}

/** Priority 1001 (after frame stats): the DPR governor over on-screen frames (W-L1 §2.7). */
function Governor() {
  const setDpr = useThree((s) => s.setDpr)
  useEffect(() => {
    gov.cap = Math.min(stage.dprCap, GOVERNOR.cap)
  }, [])
  useFrame(() => {
    if (!drewThisFrame || benching()) return
    const maxCap = Math.min(GOVERNOR.cap, Math.max(1, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1))
    const next = governorFeed(gov, lastFrameMs(), maxCap)
    if (next !== null) {
      stage.dprCap = next
      setDpr(Math.min(next, maxCap))
    }
  }, 1001)
  return null
}

const losses: number[] = []
/** webglcontextlost → static stories; webglcontextrestored → one remount; a second loss within 60 s → give up. */
function ContextGuard() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const onLost = (e: Event) => {
      e.preventDefault() // allow the browser to restore it
      const now = performance.now()
      losses.push(now)
      if (losses.filter((t) => now - t < GIVE_UP_WINDOW_MS).length >= 2) giveUpHost()
      else setContextLost(true)
    }
    const onRestored = () => {
      if (hostGivenUp()) return
      bumpHostEpoch() // App remounts <StageHost key={epoch}/>: fresh renderer, environment, resources
      setContextLost(false)
    }
    el.addEventListener('webglcontextlost', onLost)
    el.addEventListener('webglcontextrestored', onRestored)
    return () => {
      el.removeEventListener('webglcontextlost', onLost)
      el.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl])
  return null
}

export default function StageHost() {
  const views = useViews()
  const islands = useIslands()
  const paused = useStageHostPaused()
  const active = !paused && (views.length > 0 || islands.length > 0 || hostIslandCount() > 0)
  return (
    <Canvas
      className="stage-canvas"
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', visibility: active ? 'visible' : 'hidden' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: stage.measure }}
      dpr={[1, stage.dprCap]}
      frameloop={paused ? 'never' : active ? 'always' : 'demand'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
      }}
      aria-hidden
    >
      <Frame />
      <ContextGuard />
      <Driver />
      <StagePort />
      <IslandPort />
      <ViewRenderer />
      <IslandLabels />
      <Governor />
    </Canvas>
  )
}
