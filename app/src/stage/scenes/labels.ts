/**
 * Label LAYOUT pass (D §6.1; gate defect "passport × magnet label"). Same data path as W's `useDomLabels`
 * (labels published with `useStageLabels`, DOM nodes in `stage.dom` under `labelKey(view.key, name)`,
 * transforms only, priority 500 after the render), plus what the gate lacked:
 *
 * - RESERVED ZONES: the passport(s), the readout box, the caption and the inset (each + 8 px), plus any
 *   zone the scene reserves (the lab's orientation gizmo). No label is ever placed inside one.
 * - COLLISIONS: labels are placed in priority order; each tries its anchor, then offsets up / right /
 *   down / left at 22 and 38 px, and takes the first spot that avoids reserved zones, already placed labels
 *   and the view's edges. An offset label gets a 1 px silver leader to its anchor. No spot → it fades out.
 * - No layout reads per frame: label sizes come from a ResizeObserver; reserved rects are re-read on a
 *   beat change and every 20 frames (four offset reads).
 *
 * It lives in D's scenes folder because `stage/hooks.ts` is frozen (interface-changes.md #1): W can fold it
 * into `useDomLabels` later without changing any scene.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'
import { INSET } from '../drive'
import { useView } from '../hooks'
import { labelKey, stage } from '../store'
import { getViews } from '../views'

export type Rect = [x: number, y: number, w: number, h: number]

export interface LabelItem {
  /** Anchor in the local frame of `root` (or world), or view px when `screen` is set. */
  anchor: THREE.Vector3
  /** 0 = hidden; fractional = fading (scene choreography). */
  alpha: number
  /** Lower = placed first. Gizmo 0 · callouts/chips 1 · spot labels 2 · axis/fraction labels 3. */
  priority: number
  /** Anchor is already in view px (x, y); z ignored. */
  screen?: boolean
  /** Never moved off its anchor (gizmo tips) except along `slide`: hidden when every spot collides. */
  fixed?: boolean
  /** Unit screen direction a fixed label may slide along to avoid a collision. */
  slide?: [number, number]
  /** Draw a leader from the label to this view-px point (gizmo axes), whatever the offset. */
  leaderTo?: [number, number] | null
  /** Draw a leader to this 3D point (same frame as `anchor`), e.g. a state chip → its beam. */
  leaderAnchor?: THREE.Vector3 | null
  /** Highlight (term focus): outline via CSS. */
  focus?: boolean
  /** Visual variant written once as data-look (overlay.css): badge · window · gizmo. */
  look?: 'badge' | 'window' | 'gizmo'
}

const OFFSETS: [number, number][] = [
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
const RESERVE_MARGIN = 8
const LABEL_MARGIN = 4
const EDGE = 6

const hit = (a: Rect, b: Rect, m: number) => a[0] < b[0] + b[2] + m && a[0] + a[2] + m > b[0] && a[1] < b[1] + b[3] + m && a[1] + a[3] + m > b[1]

/**
 * Reserved rects (box coordinates) of the overlay furniture around a unit's stage box: passports, the
 * readout column, the caption, plus any view of the unit that sits in the inset slot. Uses bounding rects
 * (so CSS translate on the inset title strip is honoured); called on beat changes and every 20 frames only.
 */
export function reservedRects(box: HTMLElement | null, unitId?: string): Rect[] {
  if (!box) return []
  const out: Rect[] = []
  const b = box.getBoundingClientRect()
  box.querySelectorAll<HTMLElement>('.stage-passport, .stage-readouts, .stage-caption, [data-reserve]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) out.push([r.left - b.left, r.top - b.top, r.width, r.height])
  })
  if (unitId)
    for (const o of getViews())
      if (o.unitId === unitId && o.weight > 0 && o.frame?.slot === 'inset') out.push([o.rect[0], o.rect[1], o.rect[2], o.rect[3]])
  return out
}

interface Cache {
  size: Map<string, [number, number]>
  ro: ResizeObserver | null
  observed: WeakSet<Element>
  reserved: Rect[]
  frame: number
  beat: number
  /** Frames of frequent re-reads left after a beat/reveal/slot change. */
  burst: number
}

/**
 * Lay out this view's labels every frame. `items` is a mutable record the scene updates in its
 * `useStageFrame` callback; `extraReserved` returns view-px rects the scene keeps clear (the gizmo).
 */
export function useSceneLabels(
  items: Readonly<Record<string, LabelItem>>,
  root?: RefObject<THREE.Object3D | null>,
  extraReserved?: () => Rect[],
): void {
  const view = useView()
  const cache = useMemo<Cache>(() => ({ size: new Map(), ro: null, observed: new WeakSet(), reserved: [], frame: 0, beat: -1, burst: 0 }), [])
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        const name = el.dataset.labelName
        const b = e.borderBoxSize?.[0]
        if (name) cache.size.set(name, b ? [b.inlineSize, b.blockSize] : [el.offsetWidth, el.offsetHeight])
      }
    })
    cache.ro = ro
    return () => {
      ro.disconnect()
      cache.ro = null
      cache.observed = new WeakSet()
    }
  }, [cache])

  const v = useMemo(() => new THREE.Vector3(), [])
  const order = useMemo(() => Object.keys(items).sort((a, b) => items[a].priority - items[b].priority), [items])

  useFrame(() => {
    const cam = view.camera ?? view.fallbackCamera
    const [rx, ry, rw, rh] = view.rect
    const track = stage.units.get(view.unitId)
    const box = track?.box ?? null
    const f = view.frame
    // re-read the furniture on a beat change, a reveal (the layout may split) or a slot change, else every 20 frames
    const sig = f ? f.beat * 16 + (f.revealed ? 8 : 0) + ['full', 'top', 'bottom', 'main', 'inset'].indexOf(f.slot ?? 'full') : -1
    // React re-renders the caption/passports a little AFTER the beat changes: re-read every 3rd frame for a
    // while after a change, then every 20 frames
    if (sig !== cache.beat) {
      cache.beat = sig
      cache.burst = 30
    }
    if (cache.burst > 0) cache.burst--
    if (cache.frame++ % 20 === 0 || (cache.burst > 0 && cache.frame % 3 === 0)) cache.reserved = reservedRects(box)
    const reserved = cache.reserved.slice()
    // the scene's own zones (the gizmo) keep OTHER labels away; fixed labels (the gizmo's own) ignore them
    const extra: Rect[] = extraReserved ? extraReserved().map((r): Rect => [rx + r[0], ry + r[1], r[2], r[3]]) : []
    // an inset view (another kind of this unit) and its title strip are reserved for the main view
    if (f?.slot !== 'inset')
      for (const o of getViews())
        if (o !== view && o.unitId === view.unitId && o.weight > 0 && o.frame?.slot === 'inset')
          reserved.push([o.rect[0], o.rect[1] - INSET.strip, o.rect[2], o.rect[3] + INSET.strip])
    const placed: Rect[] = []
    const safe: Rect = [rx + EDGE, ry + EDGE, rw - 2 * EDGE, rh - 2 * EDGE]
    for (const name of order) {
      const it = items[name]
      const el = stage.dom.get(labelKey(view.key, name))
      if (!el) continue
      if (!cache.observed.has(el) && cache.ro) {
        el.dataset.labelName = name
        if (it.look) el.dataset.look = it.look
        cache.ro.observe(el)
        cache.observed.add(el)
        cache.size.set(name, [el.offsetWidth, el.offsetHeight])
      }
      let show = view.weight > 0 && it.alpha > 0.01
      let x = 0
      let y = 0
      if (show) {
        if (it.screen) {
          x = rx + it.anchor.x
          y = ry + it.anchor.y
        } else {
          v.copy(it.anchor)
          if (root?.current) v.applyMatrix4(root.current.matrixWorld)
          v.project(cam)
          if (v.z >= 1 || v.z <= -1 || Math.abs(v.x) > 1.02 || Math.abs(v.y) > 1.02) show = false
          x = rx + ((v.x + 1) / 2) * rw
          y = ry + ((1 - v.y) / 2) * rh
        }
      }
      let ox = 0
      let oy = 0
      if (show) {
        const [w, h] = cache.size.get(name) ?? [el.offsetWidth, el.offsetHeight]
        if (it.fixed) {
          // fixed labels are clamped into the view instead of being moved around
          x = Math.min(safe[0] + safe[2] - w / 2, Math.max(safe[0] + w / 2, x))
          y = Math.min(safe[1] + safe[3] - h / 2, Math.max(safe[1] + h / 2, y))
        }
        let ok = false
        // fixed labels may only slide outward along their own direction (gizmo tips)
        const d = it.slide ?? [0, 0]
        const cands: [number, number][] = it.fixed ? [0, 14, 28, 42].map((k): [number, number] => [d[0] * k, d[1] * k]) : OFFSETS
        for (const [dx, dy] of cands) {
          const r: Rect = [x + dx - w / 2, y + dy - h / 2, w, h]
          if (r[0] < safe[0] - 0.5 || r[1] < safe[1] - 0.5 || r[0] + w > safe[0] + safe[2] + 0.5 || r[1] + h > safe[1] + safe[3] + 0.5) continue
          if (reserved.some((q) => hit(r, q, RESERVE_MARGIN))) continue
          if (!it.fixed && extra.some((q) => hit(r, q, RESERVE_MARGIN))) continue
          if (placed.some((q) => hit(r, q, LABEL_MARGIN))) continue
          placed.push(r)
          ox = dx
          oy = dy
          ok = true
          break
        }
        show = ok
      }
      const hidden = show ? '0' : '1'
      if (el.dataset.hidden !== hidden) el.dataset.hidden = hidden
      const op = show ? (it.alpha >= 0.99 ? '' : it.alpha.toFixed(3)) : '0'
      if (el.style.opacity !== op) el.style.opacity = op
      const foc = it.focus ? '1' : '0'
      if (el.dataset.focus !== foc) el.dataset.focus = foc
      if (!show) continue
      el.style.transform = `translate(${(x + ox).toFixed(1)}px, ${(y + oy).toFixed(1)}px) translate(-50%, -50%)`
      // leader: from the label's edge to its anchor (or to leaderTo / leaderAnchor)
      let lt: number[] | null = it.leaderTo ? [rx + it.leaderTo[0], ry + it.leaderTo[1]] : ox || oy ? [x, y] : null
      if (it.leaderAnchor) {
        v.copy(it.leaderAnchor)
        if (root?.current) v.applyMatrix4(root.current.matrixWorld)
        v.project(cam)
        if (v.z < 1) lt = [rx + ((v.x + 1) / 2) * rw, ry + ((1 - v.y) / 2) * rh]
      }
      if (lt) {
        const [w, h] = cache.size.get(name) ?? [0, 0]
        const dx = lt[0] - (x + ox)
        const dy = lt[1] - (y + oy)
        const len = Math.hypot(dx, dy)
        // distance from the label centre to its border along the leader direction
        const ux = Math.abs(dx) / (len || 1)
        const uy = Math.abs(dy) / (len || 1)
        const start = Math.min(ux > 1e-6 ? w / 2 / ux : 1e9, uy > 1e-6 ? h / 2 / uy : 1e9)
        const visible = len - start > 2
        el.dataset.leader = visible ? '1' : '0'
        if (visible) {
          el.style.setProperty('--lead-len', `${(len - start).toFixed(1)}px`)
          el.style.setProperty('--lead-start', `${start.toFixed(1)}px`)
          el.style.setProperty('--lead-ang', `${Math.atan2(dy, dx).toFixed(4)}rad`)
        }
      } else if (el.dataset.leader !== '0') el.dataset.leader = '0'
    }
  }, 500)
}

/** Reset every label of a view to hidden (scene unmount). */
export function hideLabels(viewKey: string, names: readonly string[]): void {
  for (const n of names) {
    const el = stage.dom.get(labelKey(viewKey, n))
    if (el) {
      el.dataset.hidden = '1'
      el.style.opacity = '0'
    }
  }
}
