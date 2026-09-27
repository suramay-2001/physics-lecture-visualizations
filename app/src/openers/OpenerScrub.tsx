/**
 * A Blender chapter opener, scrubbed by scroll on a 2D canvas (D-L1-scenes §5.3; decision P3 #9). The one
 * WebGL context stays free: frames are WebP images drawn with drawImage.
 *
 * Layout = the story's (prose 45 % / stage 55 %, sticky stage box). Scroll → frame uses the story's own
 * mapping (`beatPosition`: the caption under the viewport centre line, and how far through it you are), so
 * each caption is on screen exactly while its frame range plays. One ScrollTrigger (`opener:<name>`), killed
 * with the component (useGSAP context).
 *
 * Memory (frameRing.ts): every frame kept as a compressed Blob, at most 9 decoded ImageBitmaps (+ the one on
 * screen), evicted with bitmap.close(); frames load coarse-to-fine after the page is idle; a frame not
 * decoded yet is never blank — the nearest decoded one stands in.
 * Reduced motion or < 900 px: the poster and the captions as a list, no frames fetched (OpenerStill).
 * The canvas exposes `data-frame` / `data-decoded` for the e2e check.
 */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { beatPosition } from '../stage/useStoryScroll'
import { useStageFlag } from '../stage/store'
import { STAGE_BG } from '../stage/tokens'
import { useMedia, WIDE_QUERY } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import { frameAt, loadOrder, nearestDecoded, ringFrames } from './frameRing'
import { frameFile, frameUrl, type OpenerSpec } from './openerCopy'
import './opener.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export const OPENER_TRIGGER_PREFIX = 'opener:'
/** vh of scroll per frame (D §5.3: 120 frames over 264 vh) */
const VH_PER_FRAME = 2.2
const FETCH_WORKERS = 4

export default function OpenerScrub({ spec }: { spec: OpenerSpec }) {
  const wide = useMedia(WIDE_QUERY)
  const motion = useStageFlag('motion')
  return wide && motion ? <OpenerFilm spec={spec} /> : <OpenerStill spec={spec} />
}

function Fidelity({ spec }: { spec: OpenerSpec }) {
  return (
    <details className="opener-fidelity">
      <summary>What this picture gets right, and what it distorts</summary>
      <p className="opener-fidelity-h">Exact</p>
      <ul>
        {spec.fidelity.exact.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="opener-fidelity-h">Distorted</p>
      <ul>
        {spec.fidelity.distorted.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </details>
  )
}

export function OpenerStill({ spec }: { spec: OpenerSpec }) {
  return (
    <section className="opener-still" aria-label={spec.title}>
      <h2 className="opener-title">{spec.title}</h2>
      <figure className="opener-still-fig" style={{ background: STAGE_BG.hopf }}>
        <img src={frameUrl(spec.name, spec.poster)} alt={spec.alt} width={1080} height={1350} loading="lazy" decoding="async" />
      </figure>
      <ol className="opener-still-beats">
        {spec.beats.map((b) => (
          <li key={b.from}>
            <Rich text={b.text} />
          </li>
        ))}
      </ol>
      <Fidelity spec={spec} />
    </section>
  )
}

interface Player {
  show(frame: number, dir: 1 | -1): void
}

/** Fetch, decode and draw frames (no React state: the canvas is written directly). */
function startPlayer(spec: OpenerSpec, cv: HTMLCanvasElement): { player: Player; stop: () => void } {
  const ctx = cv.getContext('2d')
  const total = spec.frames
  const blobs: (Blob | null)[] = new Array(total).fill(null)
  const bitmaps = new Map<number, ImageBitmap>()
  const pending = new Set<number>()
  const ctrl = new AbortController()
  let disposed = false
  let current = 0
  let dir: 1 | -1 = 1
  let drawn = -1

  const nearestBlob = (f: number): number | null => {
    for (let k = 0; k < total; k++) {
      if (f - k >= 0 && blobs[f - k]) return f - k
      if (f + k < total && blobs[f + k]) return f + k
    }
    return null
  }
  const wanted = (): Set<number> => {
    const w = new Set(ringFrames(current, dir, total))
    const stand = nearestBlob(current)
    if (stand !== null) w.add(stand)
    return w
  }
  const draw = () => {
    const f = nearestDecoded(current, new Set(bitmaps.keys()))
    if (f === null || !ctx) return
    if (f !== drawn) {
      ctx.drawImage(bitmaps.get(f)!, 0, 0, cv.width, cv.height)
      drawn = f
    }
    cv.dataset.frame = String(drawn)
    cv.dataset.decoded = String(bitmaps.size)
  }
  const evict = () => {
    const keep = wanted()
    for (const [f, b] of bitmaps) {
      if (keep.has(f) || f === drawn) continue
      b.close()
      bitmaps.delete(f)
    }
  }
  const decode = (f: number) => {
    const blob = blobs[f]
    if (disposed || !blob || bitmaps.has(f) || pending.has(f)) return
    pending.add(f)
    createImageBitmap(blob).then(
      (bmp) => {
        pending.delete(f)
        if (disposed || !wanted().has(f)) return bmp.close()
        bitmaps.set(f, bmp)
        evict()
        draw()
      },
      () => pending.delete(f),
    )
  }
  const refill = () => wanted().forEach(decode)

  const order = loadOrder(total)
  let next = 0
  const worker = async () => {
    while (!disposed && next < order.length) {
      const f = order[next++]
      try {
        const r = await fetch(frameUrl(spec.name, frameFile(f)), { signal: ctrl.signal })
        if (!r.ok) continue
        blobs[f] = await r.blob()
        if (wanted().has(f)) decode(f)
      } catch {
        return // aborted on unmount (or offline: the nearest frame already on screen stays)
      }
    }
  }
  // start after the page is idle: the frames never compete with the first paint
  const kick = () => {
    for (let i = 0; i < FETCH_WORKERS; i++) void worker()
  }
  const hasIdle = typeof window.requestIdleCallback === 'function' // Safari has none
  const idle = hasIdle ? window.requestIdleCallback(kick, { timeout: 1200 }) : window.setTimeout(kick, 300)

  return {
    player: {
      show(frame, d) {
        if (frame === current) return
        dir = d
        current = frame
        refill()
        evict()
        draw()
      },
    },
    stop() {
      disposed = true
      ctrl.abort()
      if (hasIdle) window.cancelIdleCallback(idle)
      else clearTimeout(idle)
      bitmaps.forEach((b) => b.close())
      bitmaps.clear()
    },
  }
}

function OpenerFilm({ spec }: { spec: OpenerSpec }) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const player = useRef<Player | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const p = startPlayer(spec, cv)
    player.current = p.player
    return () => {
      player.current = null
      p.stop()
    }
  }, [spec])

  useGSAP(
    () => {
      const col = root.current?.querySelector<HTMLElement>('.opener-beats')
      if (!col) return
      let tops: number[] = []
      let heights: number[] = []
      let last = -1
      const measure = () => {
        const y = window.scrollY
        tops = []
        heights = []
        col.querySelectorAll<HTMLElement>('[data-opener-beat]').forEach((a) => {
          const r = a.getBoundingClientRect()
          tops.push(r.top + y)
          heights.push(r.height)
        })
      }
      const update = (direction: number) => {
        const u = beatPosition(window.scrollY + innerHeight / 2, tops, heights)
        const n = spec.beats.length
        const k = Math.min(n - 1, Math.floor(u))
        const b = spec.beats[k]
        const frac = u >= n ? 1 : u - k
        const frame = frameAt((b.from + frac * (b.to - b.from)) / (spec.frames - 1), spec.frames)
        if (k !== last) {
          last = k
          setActive(k)
        }
        player.current?.show(frame, direction < 0 ? -1 : 1)
      }
      ScrollTrigger.create({
        id: `${OPENER_TRIGGER_PREFIX}${spec.name}`,
        trigger: col,
        start: 'top center',
        end: 'bottom center',
        onRefresh: () => {
          measure()
          update(1)
        },
        onUpdate: (self) => update(self.direction),
      })
    },
    { scope: root, dependencies: [spec], revertOnUpdate: true },
  )

  return (
    <section ref={root} className="opener" aria-label={spec.title}>
      <div className="opener-beats">
        <h2 className="opener-title">{spec.title}</h2>
        {spec.beats.map((b, i) => (
          <article
            key={b.from}
            className="opener-beat"
            data-opener-beat={i}
            data-active={i === active}
            style={{ minHeight: `${(b.to - b.from + 1) * VH_PER_FRAME}vh` }}
          >
            <Rich text={b.text} className="opener-beat-body" />
          </article>
        ))}
        <Fidelity spec={spec} />
      </div>
      <div className="opener-stage-col" style={{ background: STAGE_BG.hopf }}>
        <div className="opener-stage">
          <canvas ref={canvas} className="opener-canvas" width={1080} height={1350} aria-hidden="true" data-frame="-1" data-decoded="0" />
          <p className="visually-hidden">{spec.alt}</p>
        </div>
      </div>
    </section>
  )
}
