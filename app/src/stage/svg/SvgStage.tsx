/**
 * The SVG route's live layer (W-709-platform §E; content/stage.ts KIND_RENDER): the SVG kinds of one unit's story,
 * drawn as DOM in the sticky stage box, in the SAME slot rects as a WebGL view (stage/drive.ts `slotRect`), under the
 * same overlay (passports, readouts, caption) and driven by the same pipeline: `driveUnit` (resolve → interpolate at
 * the unit's beat position u, the reveal mix and the hold progress) on every animation frame the inputs change. So
 * scrubs, beat transitions, clue reveals and reduced motion (cuts; sweeps at three stops) behave exactly as on the
 * canvas. No WebGL is involved: an SVG kind draws live without it.
 *
 * One owner per unit per frame advances the reveal mixes and the reader-driven clock (stage/timing.ts): the WebGL
 * Driver when the unit also has a WebGL kind, else this layer. Readouts go to the overlay's readout column through the
 * same label store a WebGL scene publishes to (stage/store.ts `publishLabels`). The instrument sees these views
 * (stage/svgViews.ts), so the story e2e checks an SVG beat exactly as a WebGL one. Lazy chunk (with the kinds).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { type StageKind } from '../../content/stage'
import { type KindDrive, driveUnit } from '../drive'
import { publishLabels, stage, useFocusTerm, viewKey } from '../store'
import { requireSvgKind, type SvgStageProps } from '../svgKinds'
import { registerSvgFlush, registerSvgView, type SvgViewEntry } from '../svgViews'
import { advanceUnit } from '../timing'
import type { UnitTrack } from '../store'
import { STAGE_BG } from '../tokens'
import type { AnyResolved } from '../types'
import './kinds'

const e0Beat = (t: UnitTrack, i: number) => t.beats[Math.min(Math.max(0, i), t.beats.length - 1)]

interface Drawn {
  kinds: Map<StageKind, KindDrive>
  beat: number
  revealed: boolean
}

/** The instrument (window.__stage) in DEV or with ?measure, also on a page that never asks for the WebGL host. */
function useInstrument() {
  useEffect(() => {
    if (!(import.meta.env.DEV || stage.measure)) return
    void import('../instrument').then((m) => m.installStageInstrument())
  }, [])
}

export default function SvgStage({ unitId, kinds, ownsClock }: SvgStageProps) {
  const [drawn, setDrawn] = useState<Drawn | null>(null)
  const focusTerm = useFocusTerm()
  const entries = useRef(new Map<StageKind, SvgViewEntry>())
  useInstrument()

  useEffect(() => {
    const regs = kinds.map((k) => registerSvgView(unitId, k))
    entries.current = new Map(regs.map(([e]) => [e.kind, e]))
    let raf = 0
    let last = performance.now()
    let sig = ''
    const step = (now: number) => {
      const t = stage.units.get(unitId)
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
      last = now
      if (!t || !t.box || !t.near || !t.beats.length) {
        for (const [e] of regs) {
          e.weight = 0
          e.screen = null
        }
        return
      }
      if (ownsClock) advanceUnit(t, dt, now, stage.motion)
      const box = t.box.getBoundingClientRect()
      // the inputs of driveUnit: when none changed, the picture has not either (no resolve, no React work)
      const next = `${t.u.toFixed(5)}|${t.revealMix.map((m) => m.toFixed(4)).join(',')}|${Math.round(box.width)}x${Math.round(box.height)}|${stage.motion}`
      if (next !== sig) {
        sig = next
        const d = driveUnit(t.beats, t.u, stage.motion, (i) => t.revealMix[i] ?? 0, { w: box.width, h: box.height }, kinds)
        setDrawn({ kinds: d.kinds, beat: d.sample.beat, revealed: d.revealed })
        for (const [e] of regs) {
          const kd = d.kinds.get(e.kind)
          e.weight = kd?.weight ?? 0
          e.rect = kd ? kd.rect : [0, 0, 0, 0]
          e.frame = kd
            ? {
                unitId,
                kind: e.kind,
                slot: kd.slot,
                state: kd.state,
                from: kd.from,
                to: kd.to,
                t: kd.t,
                beat: d.sample.beat,
                hold: d.sample.hold,
                revealed: d.revealed,
                u: t.u,
                clock: t.clock,
                motion: stage.motion,
                focus: null,
                weight: kd.weight,
                size: { w: kd.rect[2], h: kd.rect[3] },
              }
            : null
        }
      }
      // the hovered term's anchor, when it targets this kind (the instrument reports it as a WebGL frame does)
      const b = e0Beat(t, regs[0]?.[0].frame?.beat ?? t.beat)
      for (const [e] of regs) {
        const [rx, ry, rw, rh] = e.rect
        const sx = box.left + rx
        const sy = box.top + ry
        const visible = e.weight > 0 && rw > 0 && rh > 0 && sx < innerWidth && sy < innerHeight && sx + rw > 0 && sy + rh > 0
        e.screen = visible ? [sx, sy, rw, rh] : null
        if (e.frame) {
          e.frame.clock = t.clock
          const terms = e.frame.revealed ? { ...b?.terms, ...b?.reveal?.terms } : b?.terms
          const target = stage.focusTerm && terms ? terms[stage.focusTerm] : undefined
          e.frame.focus = target && target.kind === e.kind ? target.anchor : null
        }
      }
    }
    const loop = (now: number) => {
      step(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const off = registerSvgFlush(() => step(performance.now()))
    return () => {
      cancelAnimationFrame(raf)
      off()
      for (const [, un] of regs) un()
    }
  }, [unitId, kinds, ownsClock])

  // readouts of every drawn view, into the overlay's readout column (a view that is absent publishes none)
  const readouts = useMemo(() => {
    const out = new Map<StageKind, Record<string, { text: string; tone?: 'text' | 'plus' | 'minus' | 'state' | 'silver' | 'op'; tier: 'readout' }>>()
    for (const k of kinds) {
      const kd = drawn?.kinds.get(k)
      const rec: Record<string, { text: string; tone?: 'text' | 'plus' | 'minus' | 'state' | 'silver' | 'op'; tier: 'readout' }> = {}
      if (kd && kd.weight > 0.5) for (const r of requireSvgKind(k).readouts(kd.state as never)) rec[r.name] = { text: r.text, tone: r.tone, tier: 'readout' }
      out.set(k, rec)
    }
    return out
  }, [drawn, kinds])
  useEffect(() => {
    for (const [k, rec] of readouts) publishLabels(viewKey(unitId, k), rec)
  }, [readouts, unitId])
  useEffect(() => () => kinds.forEach((k) => publishLabels(viewKey(unitId, k), {})), [unitId, kinds])

  // commits of each view's scene (the instrument's `renders`; `warmups` = 1 once the first picture is up)
  useEffect(() => {
    if (!drawn) return
    for (const [k, e] of entries.current) {
      if ((drawn.kinds.get(k)?.weight ?? 0) <= 0) continue
      e.renders++
      e.warmups = 1
    }
  }, [drawn])
  const beats = stage.units.get(unitId)?.beats
  const beat = drawn ? beats?.[drawn.beat] : undefined
  const terms = drawn?.revealed ? { ...beat?.terms, ...beat?.reveal?.terms } : beat?.terms
  const target = focusTerm && terms ? terms[focusTerm] : undefined

  if (!drawn) return null
  return (
    <div className="svg-stage-layer" aria-hidden="true" data-unit={unitId}>
      {kinds.map((k) => {
        const kd = drawn.kinds.get(k)
        if (!kd || kd.weight <= 0) return null
        const [x, y, w, h] = kd.rect
        if (w <= 0 || h <= 0) return null
        const def = requireSvgKind(k)
        const Scene = def.Scene
        // the view's ground, exactly as a WebGL view clears its rect (stage/views.ts): the kind's token, or the inset's
        const bg = kd.slot === 'inset' ? STAGE_BG.inset : STAGE_BG[k]
        return (
          <svg
            key={k}
            className="svgk svgk-stage"
            data-kind={k}
            data-slot={kd.slot ?? ''}
            viewBox={`0 0 ${w} ${h}`}
            width={w}
            height={h}
            style={{ left: x, top: y, opacity: kd.weight }}
          >
            <rect x={0} y={0} width={w} height={h} fill={bg} />
            <Scene state={kd.state as AnyResolved as never} mode="stage" width={w} height={h} focus={target && target.kind === k ? target.anchor : null} />
          </svg>
        )
      })}
    </div>
  )
}
