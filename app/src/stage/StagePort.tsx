/**
 * One r3f portal per registered view (W-L1 §2.3–2.4). Each portal's root is the view's own THREE.Scene;
 * the scene component for its kind (stage/scenes/index.ts `SCENES`, D-owned) mounts inside an
 * IslandBoundary, so a scene error turns that view off instead of blanking the canvas.
 * Events are disabled: L1 stages are not pointer-interactive (controls are DOM).
 *
 * W1: the portal state carries the view's slot size (drei helpers such as Line measure the right viewport),
 * and a `Warmup` sibling runs `gl.compile` once the scene has mounted — views mount one viewport early
 * (`near`), so the first on-screen frame neither misses nor stalls on shader compilation.
 */
import { createPortal, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import { stateOfKind, type StageKind } from '../content/stage'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { ViewContext } from './hooks'
import { SCENES } from './scenes'
import { stage, useUnitsVersion } from './store'
import type { SceneComponent } from './types'
import { usePortalSize, useViews, type ViewEntry } from './views'

/** Compile every material of the freshly mounted scene (async where the driver supports it). */
function Warmup({ entry }: { entry: ViewEntry }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const cam = entry.camera ?? entry.fallbackCamera
    let alive = true
    // one frame later: scenes register their camera and environment in their own effects
    const id = requestAnimationFrame(() => {
      if (!alive) return
      try {
        const r = gl as unknown as { compileAsync?: (s: unknown, c: unknown) => Promise<unknown> }
        if (r.compileAsync) void r.compileAsync(entry.scene, cam).catch(() => {})
        else gl.compile(entry.scene, cam)
        entry.warmups++
      } catch {
        /* a failed warm-up only costs the first frame */
      }
    })
    return () => {
      alive = false
      cancelAnimationFrame(id)
    }
  }, [gl, entry])
  return null
}

function ViewPortal({ entry }: { entry: ViewEntry }) {
  useUnitsVersion()
  const size = usePortalSize(entry)
  const track = stage.units.get(entry.unitId)
  const beats = track?.beats
  const keyframes = useMemo(() => (beats ?? []).map((b) => stateOfKind(b.stage, entry.kind)), [beats, entry.kind])
  const reveals = useMemo(
    () => (beats ?? []).map((b) => (b.reveal?.stage ? stateOfKind(b.reveal.stage, entry.kind) : null)),
    [beats, entry.kind],
  )
  const portalSize = useMemo(() => ({ width: size.width || 1, height: size.height || 1, top: 0, left: 0 }), [size])
  const Scene = SCENES[entry.kind] as SceneComponent<StageKind> | undefined
  if (!beats) return null
  return createPortal(
    <ViewContext.Provider value={entry}>
      <IslandBoundary
        name="scene"
        fallback={null}
        onError={() => {
          entry.failed = true
        }}
      >
        <Suspense fallback={null}>
          {Scene ? <Scene unitId={entry.unitId} kind={entry.kind} keyframes={keyframes} reveals={reveals} /> : null}
          <Warmup entry={entry} />
        </Suspense>
      </IslandBoundary>
    </ViewContext.Provider>,
    entry.scene,
    { events: { enabled: false }, size: portalSize },
  )
}

export function StagePort() {
  const views = useViews()
  return (
    <>
      {views.map((v) => (
        <ViewPortal key={v.key} entry={v} />
      ))}
    </>
  )
}
