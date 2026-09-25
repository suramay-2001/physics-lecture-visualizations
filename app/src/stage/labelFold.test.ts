/**
 * Interface change D1: D's label layout pass (`useSceneLabels`, stage/scenes/labels.ts) folded into W's
 * `useDomLabels` (stage/hooks.ts). Two checks without a GPU:
 *   1. TYPE: `useDomLabels` accepts exactly what the scenes pass to `useSceneLabels` (items, root, extraReserved),
 *      so switching the import changes no call site (checked by `tsc -b`, which compiles this file).
 *   2. BEHAVIOUR: `placeItem` (the per-label candidate loop the hook runs) agrees with a verbatim copy of D's
 *      loop on random scenes: same accepted spot, same offset, same `placed` list.
 */
import type { RefObject } from 'react'
import type * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { rng } from '../physics/random'
import type { DomLabelAnchor, LabelItem, useDomLabels } from './hooks'
import { FIXED_SLIDE_STEPS, LABEL_EDGE, LABEL_MARGIN, LABEL_OFFSETS, RESERVE_MARGIN, placeItem, type LabelRect } from './labelLayout'
import type { LabelItem as SceneLabelItem, Rect as SceneRect, useSceneLabels } from './scenes/labels'

// 1. type compatibility (compile time): every useSceneLabels call is a valid useDomLabels call
type SceneArgs = Parameters<typeof useSceneLabels>
type DomArgs = Parameters<typeof useDomLabels>
const sceneCallIsDomCall = (a: SceneArgs): DomArgs => a
const itemsAreAnchors = (x: Readonly<Record<string, SceneLabelItem>>): Readonly<Record<string, DomLabelAnchor>> => x
const rectsAreRects = (r: SceneRect[]): LabelRect[] => r
const sameItem = (x: SceneLabelItem): LabelItem => x
void [sceneCallIsDomCall, itemsAreAnchors, rectsAreRects, sameItem]
type _Root = RefObject<THREE.Object3D | null>
const _rootOk: DomArgs[1] = undefined as _Root | undefined
void _rootOk

// 2. D's candidate loop, copied verbatim from stage/scenes/labels.ts (only wrapped in a function)
const D_OFFSETS: [number, number][] = [
  [0, 0],
  [0, -22],
  [22, 0],
  [0, 22],
  [-22, 0],
  [0, -38],
  [38, 0],
  [0, 38],
  [-38, 0],
  [30, -30],
  [-30, -30],
]
const D_RESERVE_MARGIN = 8
const D_LABEL_MARGIN = 4
const D_EDGE = 6
const hit = (a: LabelRect, b: LabelRect, m: number) => a[0] < b[0] + b[2] + m && a[0] + a[2] + m > b[0] && a[1] < b[1] + b[3] + m && a[1] + a[3] + m > b[1]
function dLoop(
  x: number,
  y: number,
  w: number,
  h: number,
  it: { fixed?: boolean; slide?: [number, number] },
  safe: LabelRect,
  reserved: LabelRect[],
  extra: LabelRect[],
  placed: LabelRect[],
) {
  if (it.fixed) {
    x = Math.min(safe[0] + safe[2] - w / 2, Math.max(safe[0] + w / 2, x))
    y = Math.min(safe[1] + safe[3] - h / 2, Math.max(safe[1] + h / 2, y))
  }
  let ok = false
  let ox = 0
  let oy = 0
  const d = it.slide ?? [0, 0]
  const cands: [number, number][] = it.fixed ? [0, 14, 28, 42].map((k): [number, number] => [d[0] * k, d[1] * k]).concat(D_OFFSETS.slice(1)) : D_OFFSETS
  for (const [dx, dy] of cands) {
    const r: LabelRect = [x + dx - w / 2, y + dy - h / 2, w, h]
    if (r[0] < safe[0] - 0.5 || r[1] < safe[1] - 0.5 || r[0] + w > safe[0] + safe[2] + 0.5 || r[1] + h > safe[1] + safe[3] + 0.5) continue
    if (reserved.some((q) => hit(r, q, D_RESERVE_MARGIN))) continue
    if (!it.fixed && extra.some((q) => hit(r, q, D_RESERVE_MARGIN))) continue
    if (placed.some((q) => hit(r, q, D_LABEL_MARGIN))) continue
    placed.push(r)
    ox = dx
    oy = dy
    ok = true
    break
  }
  return ok ? { x, y, ox, oy } : null
}

describe('D1: the folded layout pass is D’s pass', () => {
  it('uses D’s constants (offsets, margins, edge, slide steps)', () => {
    expect(LABEL_OFFSETS.map((o) => [...o])).toEqual(D_OFFSETS)
    expect([RESERVE_MARGIN, LABEL_MARGIN, LABEL_EDGE]).toEqual([D_RESERVE_MARGIN, D_LABEL_MARGIN, D_EDGE])
    expect(FIXED_SLIDE_STEPS).toEqual([0, 14, 28, 42])
  })

  it('placeItem agrees with D’s loop on 3000 random scenes (spot, offset and the placed list)', () => {
    const rand = rng(44807)
    const r = (a: number, b: number) => a + (b - a) * rand()
    const rect = (): LabelRect => [r(0, 600), r(0, 700), r(10, 220), r(10, 90)]
    let shown = 0
    let offset = 0
    let hidden = 0
    for (let k = 0; k < 3000; k++) {
      const safe: LabelRect = [r(0, 40) + LABEL_EDGE, r(0, 40) + LABEL_EDGE, r(300, 680), r(300, 740)]
      const reserved = Array.from({ length: Math.floor(r(0, 5)) }, rect)
      const extra = Array.from({ length: Math.floor(r(0, 2)) }, rect)
      const placedA = Array.from({ length: Math.floor(r(0, 6)) }, rect)
      const placedB = placedA.map((p) => [...p] as LabelRect)
      const it = rand() < 0.2 ? { fixed: true, slide: [Math.sign(r(-1, 1)), Math.sign(r(-1, 1))] as [number, number] } : {}
      const [x, y, w, h] = [r(-50, 750), r(-50, 850), r(12, 160), r(14, 28)]
      const want = dLoop(x, y, w, h, it, safe, reserved, extra, placedA)
      const got = placeItem(x, y, w, h, it, safe, reserved, extra, placedB)
      expect(got).toEqual(want)
      expect(placedB).toEqual(placedA)
      if (!want) hidden++
      else if (want.ox || want.oy) offset++
      else shown++
    }
    // every branch is exercised: on the anchor, moved to an offset, and hidden
    expect(Math.min(shown, offset, hidden)).toBeGreaterThan(100)
  })
})
