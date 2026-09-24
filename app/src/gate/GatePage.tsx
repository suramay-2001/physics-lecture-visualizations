/**
 * Phase-0 GATE (throwaway). Three scroll-linked story sections sharing ONE WebGL context:
 * a single fixed full-viewport r3f <Canvas> renders every stage through drei <View>s that track
 * sticky stage <div>s. ScrollTrigger (native scroll, scrub) writes progress into `store`; scenes
 * read it in useFrame. See store.ts for `window.__gate` instrumentation.
 */
import { useGSAP } from '@gsap/react'
import { View } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { Rich } from '../ui/Rich'
import { SECTIONS, type GateSection } from './content'
import { BlochBallScene } from './scenes/BlochBallScene'
import { HopfScene, MiniBlochScene } from './scenes/HopfScene'
import { LabScene } from './scenes/LabScene'
import { frameEnd, frameStart, store, type StageId } from './store'
import './gate.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** Ref callback that registers a DOM node for scenes to write into (store.dom). */
function useReg(key: string) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      store.dom.set(key, el)
      return () => {
        if (store.dom.get(key) === el) store.dom.delete(key)
      }
    },
    [key],
  )
}

/** Keep store.stageSize[key] equal to an element's CSS size (for projecting DOM labels). */
function useStageSize(key: string) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const set = () => (store.stageSize[key] = { w: el.clientWidth, h: el.clientHeight })
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      delete store.stageSize[key]
    }
  }, [key])
  return ref
}

const LABELS: Record<StageId, { key: string; text: string }[]> = {
  lab: [
    { key: 'x', text: 'x' },
    { key: 'y', text: 'y · beam' },
    { key: 'z', text: 'z · gradient' },
    { key: 'oven', text: 'oven' },
    { key: 'magnet', text: 'magnet' },
    { key: 'plate', text: 'plate' },
  ],
  hopf: [
    { key: 'p1', text: 'p₁' },
    { key: 'p2', text: 'p₂' },
    { key: 'p3', text: 'p₃' },
  ],
  bloch: [
    { key: 'x', text: '⟨σx⟩' },
    { key: 'y', text: '⟨σy⟩' },
    { key: 'z', text: '⟨σz⟩' },
  ],
}
const VIEW_INDEX: Record<string, number> = { lab: 1, hopf: 2, 'hopf-mini': 3, bloch: 4 }

function DomLabel({ stage, k, children }: { stage: string; k: string; children: ReactNode }) {
  const reg = useReg(`${stage}:${k}`)
  return (
    <span className="gate-axis" data-contrast="axis" data-cid={`${stage}/axis-${k}`} data-hidden="1" ref={reg}>
      {children}
    </span>
  )
}

function Passport({ id, cid, title, note }: { id: string; cid: string; title: string; note?: string }) {
  return (
    <div className={`gate-passport${id === 'hopf-mini' ? ' gate-passport-mini' : ''}`} data-contrast="passport" data-cid={cid}>
      <span className="gate-passport-title">{title}</span>
      {note && <span className="gate-passport-note">{note}</span>}
    </div>
  )
}

/** The linked mini Bloch sphere inside the Hopf stage: a second <View> on the same canvas. */
function HopfMini({ fibers }: { fibers: 64 | 128 }) {
  const ref = useStageSize('hopf-mini')
  return (
    <div className="gate-mini" data-stage="hopf-mini" ref={ref}>
      <View className="gate-view" data-view="hopf-mini" index={VIEW_INDEX['hopf-mini']}>
        <MiniBlochScene fibers={fibers} />
      </View>
      <Passport id="hopf-mini" cid="hopf/mini-passport" title="STATE SPACE · Bloch sphere" />
      <DomLabel stage="hopf-mini" k="z">
        ⟨σz⟩
      </DomLabel>
    </div>
  )
}

/** Live |r| / purity readout; its text is written by the Bloch-ball scene each frame, not by React. */
function BlochReadout() {
  const reg = useReg('bloch:readout')
  return <p className="gate-readout" data-contrast="readout" data-cid="bloch/readout" ref={reg} />
}

function Stage({ s, beat, fibers }: { s: GateSection; beat: number; fibers: 64 | 128 }) {
  const stageRef = useStageSize(s.id)
  const scene = s.id === 'lab' ? <LabScene /> : s.id === 'hopf' ? <HopfScene fibers={fibers} /> : <BlochBallScene />
  return (
    <div className="gate-stage" data-stage={s.id} ref={stageRef}>
      <View className="gate-view" data-view={s.id} index={VIEW_INDEX[s.id]}>
        {scene}
      </View>
      <Passport id={s.id} cid={`${s.id}/passport`} title={s.passport} note={s.passportNote} />
      {LABELS[s.id].map((l) => (
        <DomLabel key={l.key} stage={s.id} k={l.key}>
          {l.text}
        </DomLabel>
      ))}
      {s.id === 'hopf' && <HopfMini fibers={fibers} />}
      {s.id === 'bloch' && <BlochReadout />}
      <p className={`gate-caption${s.id === 'hopf' ? ' gate-caption-hopf' : ''}`} data-contrast="caption" data-cid={`${s.id}/caption`}>
        <span className="gate-caption-beat">
          {beat + 1}/{s.beats.length}
        </span>{' '}
        {s.beats[beat].caption}
      </p>
    </div>
  )
}

const Section = memo(function Section({ s, reduced, canvas, fibers }: { s: GateSection; reduced: boolean; canvas: boolean; fibers: 64 | 128 }) {
  store.renders[s.id]++
  const ref = useRef<HTMLElement>(null)
  const [beat, setBeat] = useState(0)
  const n = s.beats.length

  useGSAP(
    () => {
      const st = store.sections[s.id]
      st.beats = n
      if (reduced || !canvas) {
        st.progress = 1
        st.raw = 1
        st.beat = n - 1
        return
      }
      st.progress = 0
      st.raw = 0
      st.beat = 0
      const sync = (p: number) => {
        st.raw = p
        const b = Math.min(n - 1, Math.floor(p * n))
        if (b !== st.beat) {
          st.beat = b
          setBeat(b)
        }
      }
      const tween = gsap.to(st, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current!.querySelector('.gate-beats'),
          start: 'top center',
          end: 'bottom center',
          scrub: 0.6,
          onUpdate: (self) => sync(self.progress),
        },
      })
      sync(tween.scrollTrigger?.progress ?? 0)
      setBeat(st.beat)
    },
    { scope: ref, dependencies: [reduced, canvas], revertOnUpdate: true },
  )

  const shown = reduced || !canvas ? n - 1 : beat
  return (
    <section className="gate-section" data-section={s.id} ref={ref} aria-labelledby={`gate-h-${s.id}`}>
      <div className="gate-prose">
        <header className="gate-section-head">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id={`gate-h-${s.id}`}>{s.title}</h2>
        </header>
        <div className="gate-beats">
          {s.beats.map((b, i) => (
            <article key={i} className="gate-beat" data-beat={i} data-active={!reduced && canvas && i === shown ? 'true' : 'false'}>
              <Rich text={b.text} />
            </article>
          ))}
        </div>
      </div>
      {canvas && (
        <div className="gate-stage-col" style={{ background: STAGE_COL_BG[s.id] }}>
          <Stage s={s} beat={shown} fibers={fibers} />
        </div>
      )}
    </section>
  )
})
const STAGE_COL_BG: Record<StageId, string> = { lab: '#182030', hopf: '#161d2c', bloch: '#1a2131' }

/** Lives inside the Canvas: exposes the renderer, clears once per frame, times the frame. */
function Instrument() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    store.gl = gl
    gl.info.autoReset = false
    return () => {
      if (store.gl === gl) store.gl = null
      store.env?.dispose()
      store.env = null
    }
  }, [gl])
  useFrame(() => {
    frameStart()
    gl.info.reset()
    // preserveDrawingBuffer keeps last frame's pixels: clear the whole canvas before the views draw.
    gl.setScissorTest(false)
    gl.setClearColor(0x000000, 0)
    gl.clear(true, true, true)
  }, -1000)
  useFrame(() => frameEnd(), 1000)
  return null
}

export default function GatePage() {
  store.renders.page++
  const [search] = useSearchParams()
  const prefersReduced = useMedia('(prefers-reduced-motion: reduce)')
  const reduced = prefersReduced || search.get('motion') === 'reduce'
  const wide = useMedia('(min-width: 900px)')
  const [fibers, setFibers] = useState<64 | 128>(() => (search.get('fibers') === '128' ? 128 : 64))
  const rootRef = useRef<HTMLDivElement>(null)

  // Paper prose is light regardless of the OS theme; the stage is always dark.
  useLayoutEffect(() => {
    const el = document.documentElement
    const prev = el.dataset.theme
    el.dataset.theme = 'light'
    return () => {
      if (prev === undefined) delete el.dataset.theme
      else el.dataset.theme = prev
    }
  }, [])

  useLayoutEffect(() => {
    store.motion = !reduced
  }, [reduced])

  useEffect(() => {
    if (performance.now() - store.lastUnmountAt > 200) store.visits++ // StrictMode remounts within a tick
    store.setFibers = setFibers
    return () => {
      store.lastUnmountAt = performance.now()
      store.setFibers = null
    }
  }, [])

  // Sticky offset under the app's top bar.
  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>('.topbar')
    const root = rootRef.current
    if (!bar || !root) return
    const set = () => root.style.setProperty('--gate-top', `${bar.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  // Late layout shifts (fonts, KaTeX) move trigger positions: refresh when the page height changes.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0
    let lastH = root.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = root.offsetHeight
      if (Math.abs(h - lastH) < 1) return
      lastH = h
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    ro.observe(root)
    let alive = true
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
    return () => {
      alive = false
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // Which section's area crosses the viewport's center line (for per-stage frame stats).
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>('[data-section]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.section as StageId
          if (e.isIntersecting) store.active = id
          else if (store.active === id) store.active = null
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els?.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      store.active = null
    }
  }, [wide])

  return (
    <div className="gate-root" ref={rootRef} data-motion={reduced ? 'reduced' : 'full'}>
      {wide && (
        <Canvas
          className="gate-canvas"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
          gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping
          }}
          aria-hidden
        >
          <Instrument />
          <View.Port />
        </Canvas>
      )}
      <header className="gate-intro">
        <p className="eyebrow">Phase-0 gate · throwaway</p>
        <h1>Three spaces</h1>
        <p className="gate-lede">
          The same spin-½ story lives in three different spaces: the laboratory, the sphere of unit spinors, and the ball of density operators. Scroll to move
          through each; the dark stage on the right tells you which space you are looking at.
        </p>
        {reduced && <p className="small">Reduced motion is on: each stage shows its final state and nothing animates.</p>}
      </header>
      {!wide && (
        <p className="gate-narrow" role="note">
          The 3D stages need a laptop-width window (at least 900 px). Below that, this page shows the text only.
        </p>
      )}
      {SECTIONS.map((s) => (
        <Section key={s.id} s={s} reduced={reduced} canvas={wide} fibers={fibers} />
      ))}
      <footer className="gate-outro small">End of the gate. Instrumentation: open the console and use <code>window.__gate</code>.</footer>
    </div>
  )
}
