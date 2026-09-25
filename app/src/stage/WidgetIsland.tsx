/**
 * DOM side of a widget island (W-L1 §2.9): renders the widget's view div and registers it, with its r3f
 * content, camera and label anchors, so the ONE stage canvas draws it (no second WebGL context).
 * THREE-FREE: `children` are r3f elements, but they are only rendered by the host (stage/IslandPort.tsx).
 * Labels are DOM children (`labels`), moved each frame by the host (drei <Html> cannot work on a
 * scissored sub-viewport of a shared canvas).
 */
import { useId, useLayoutEffect, useState, type ReactNode } from 'react'
import { removeIsland, setIsland, type Vec3Tuple } from './islands'

export interface WidgetIslandProps {
  className?: string
  ariaLabel: string
  camera: { position: Vec3Tuple; fov: number }
  /** Label name → three.js position. */
  anchors?: Readonly<Record<string, Vec3Tuple>>
  /** Label name → content (rendered in the DOM, positioned by the host). */
  labels?: Readonly<Record<string, ReactNode>>
  orbit?: boolean
  children: ReactNode
}

const NO_ANCHORS: Readonly<Record<string, Vec3Tuple>> = Object.freeze({})

export function WidgetIsland({ className, ariaLabel, camera, anchors = NO_ANCHORS, labels, orbit = true, children }: WidgetIslandProps) {
  const key = `island${useId()}`
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  // every render: publish the latest content (a slider move re-renders only this island's portal)
  useLayoutEffect(() => {
    if (el) setIsland({ key, el, content: children, camera, anchors, orbit })
  })
  useLayoutEffect(() => {
    if (!el) return
    return () => removeIsland(key, el)
  }, [key, el])
  return (
    <div ref={setEl} className={className ? `${className} widget-island` : 'widget-island'} role="img" aria-label={ariaLabel} data-island={key}>
      {labels &&
        Object.entries(labels).map(([name, node]) => (
          <span key={name} className="island-label" data-island-label={name} style={{ opacity: 0 }}>
            {node}
          </span>
        ))}
    </div>
  )
}
