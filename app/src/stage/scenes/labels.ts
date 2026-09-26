/**
 * Interface change D1 (done in round 3b): the collision-avoiding label layout now lives in W's `useDomLabels`
 * (stage/hooks.ts). This module keeps the scene-facing names so no scene call site changed.
 */
export { useDomLabels as useSceneLabels, hideLabels, domReservedRects as reservedRects, type LabelItem, type LabelRect as Rect } from '../hooks'
