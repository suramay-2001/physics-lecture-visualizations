/**
 * One r3f portal per registered view (W-L1 §2.3–2.4). Each portal's root is the view's own THREE.Scene;
 * the scene component for its kind (stage/scenes/index.ts `SCENES`, D-owned) mounts inside an
 * IslandBoundary, so a scene error turns that view off instead of blanking the canvas.
 * Events are disabled: L1 stages are not pointer-interactive (controls are DOM).
 */
import { createPortal } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { stateOfKind, type StageKind } from '../content/stage'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { ViewContext } from './hooks'
import { SCENES } from './scenes'
import { stage, useUnitsVersion } from './store'
import type { SceneComponent } from './types'
import { useViews, type ViewEntry } from './views'

function ViewPortal({ entry }: { entry: ViewEntry }) {
  useUnitsVersion()
  const track = stage.units.get(entry.unitId)
  const beats = track?.beats
  const keyframes = useMemo(() => (beats ?? []).map((b) => stateOfKind(b.stage, entry.kind)), [beats, entry.kind])
  const reveals = useMemo(
    () => (beats ?? []).map((b) => (b.reveal?.stage ? stateOfKind(b.reveal.stage, entry.kind) : null)),
    [beats, entry.kind],
  )
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
        <Suspense fallback={null}>{Scene ? <Scene unitId={entry.unitId} kind={entry.kind} keyframes={keyframes} reveals={reveals} /> : null}</Suspense>
      </IslandBoundary>
    </ViewContext.Provider>,
    entry.scene,
    { events: { enabled: false } },
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
