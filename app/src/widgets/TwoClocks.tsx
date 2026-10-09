/**
 * Widget W3 `two-clocks` (448 Lecture 11; rulings 448-L8L11 L11 R1): a two-level system as two phase clocks beside its energy ladder.
 * It builds a `clocks` stage state from its controls and draws it with the kind's own resolver and scene (stage/svg/clocks.ts
 * `resolveClocksStage` → ClocksScene), which take every hand angle, hand length, gap and chance from the one engine
 * (physics/dynamics.ts) the story and the Arcade share, so the Try-it and the story cannot disagree. Lazy: it calls the engine and
 * the SVG kind.
 *
 * Controls: the mean energy Ē and the splitting ħω (the two levels are Ē ± ħω/2, always at least 0), the time εt/ħ with Play and
 * Pause, and the starting state (|+x⟩, an equal superposition; |+z⟩, an energy eigenstate; or θ = 60°). Raising Ē moves both levels
 * up and speeds both hands; only ħω changes the gap, the arrow on the equator and P(+x). The readouts are the kind's own text lines.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClocksState } from '../content/stage'
import type { ResolvedClocks } from '../stage/types'
import { clocksReadouts, resolveClocksStage } from '../stage/svg/clocks'
import { ClocksScene } from '../stage/svg/ClocksScene'
import '../stage/svg/svg.css'
import './twoClocks.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'

const W = 560
const H = 480

export type ClocksStart = '+x' | '+z' | 'tilt'

export interface TwoClocksProps {
  /** The upper energy E₊ in units of ε (default 3, the lecture's example). With `lower` it sets the starting Ē and ħω; the sliders reach Ē ≤ 8ε and ħω ≤ 4ε. */
  upper?: number
  /** The lower energy E₋ in units of ε (default 1). */
  lower?: number
  /** The starting state: '+x' (default; both energies present), '+z' (an energy eigenstate: one clock only) or 'tilt' (θ = 60°, φ = 0). */
  start?: ClocksStart
  /** false locks the levels and the start state to the props (the time slider and Play remain). Default true. */
  editable?: boolean
}

/** An energy in units of ε, as the picture writes it: ε, 2ε, 0.5ε. */
export const fmtE = (E: number): string => (E === 1 ? 'ε' : E === 0 ? '0' : `${E}ε`)

export const MEAN_RANGE = { min: 0.5, max: 8, step: 0.5 } as const
export const SPLIT_RANGE = { min: 0.5, max: 4, step: 0.5 } as const
/** Play turns the time through this many degrees of εt/ħ per second (a full lap of the arrow, 180°, in four seconds). */
export const PLAY_RATE = 45

/** The levels the controls ask for: Ē ± ħω/2, with Ē raised if needed so the lower level is at least 0. */
export function levelsOf(mean: number, hbarOmega: number): { upper: number; lower: number; mean: number } {
  const m = Math.max(mean, hbarOmega / 2)
  return { upper: m + hbarOmega / 2, lower: m - hbarOmega / 2, mean: m }
}

/** The state the controls ask for (pure; the component only draws it). */
export function clocksModel(c: { mean: number; hbarOmega: number; start: ClocksStart; timeDeg: number }): { state: ClocksState; r: ResolvedClocks; lines: string[] } {
  const lv = levelsOf(c.mean, c.hbarOmega)
  const state: ClocksState = {
    kind: 'clocks',
    levels: { upper: lv.upper, lower: lv.lower },
    start: c.start === 'tilt' ? { thetaDeg: 60, phiDeg: 0 } : c.start,
    timeDeg: c.timeDeg,
    readouts: ['phases', 'gap', 'px'],
  }
  const r = resolveClocksStage(state, 1)
  return { state, r, lines: clocksReadouts(r).map((x) => x.text) }
}

export default function TwoClocks({ upper = 3, lower = 1, start: start0 = '+x', editable = true }: TwoClocksProps) {
  const [mean, setMean] = useState(() => levelsOf((upper + lower) / 2, upper - lower).mean)
  const [hw, setHw] = useState(upper - lower)
  const [start, setStart] = useState<ClocksStart>(start0)
  const [timeDeg, setTimeDeg] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Play: the time runs round 0 … 360° and starts again; Pause (or the slider) stops it
  const last = useRef(0)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000)
      last.current = now
      setTimeDeg((t) => (t + PLAY_RATE * dt) % 360)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const { r, lines } = useMemo(() => clocksModel({ mean, hbarOmega: hw, start, timeDeg }), [mean, hw, start, timeDeg])
  const lv = levelsOf(mean, hw)
  const shownTime = Math.round(timeDeg)

  return (
    <WidgetFrame title="Two phase clocks: one for each energy">
      <svg className="svgk svgk-stage two-clocks-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('clocks') as React.CSSProperties} role="img" aria-label={lines.join('; ')}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.clocks} rx={6} />
        <ClocksScene state={r} mode="stage" width={W} height={H} bare />
      </svg>
      <div className="two-clocks-play">
        <button className="btn" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            setPlaying(false)
            setTimeDeg(0)
          }}
        >
          Back to t = 0
        </button>
      </div>
      <Slider
        label="time εt/ħ"
        value={shownTime}
        min={0}
        max={360}
        step={1}
        onChange={(v) => {
          setPlaying(false)
          setTimeDeg(v)
        }}
        format={(v) => `${v}°`}
      />
      {editable && (
        <>
          <Slider label="mean energy Ē" value={lv.mean} min={MEAN_RANGE.min} max={MEAN_RANGE.max} step={MEAN_RANGE.step} onChange={setMean} format={(v) => `${v}ε`} />
          <Slider label="splitting ħω" value={hw} min={SPLIT_RANGE.min} max={SPLIT_RANGE.max} step={SPLIT_RANGE.step} onChange={setHw} format={(v) => `${v}ε`} />
          <Segmented
            label="Starting state"
            value={start}
            onChange={setStart}
            options={[
              { value: '+x', label: '|+x⟩' },
              { value: '+z', label: '|+z⟩' },
              { value: 'tilt', label: 'θ = 60°' },
            ]}
          />
        </>
      )}
      <p className="widget-note">
        Levels E₊ = {fmtE(lv.upper)} and E₋ = {fmtE(lv.lower)}. Both hands turn clockwise; only the angle between them is the azimuth the arrow turns through. Ē alone moves both hands together.
      </p>
    </WidgetFrame>
  )
}
