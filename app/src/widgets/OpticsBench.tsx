/**
 * Widget `optics-bench` (the Optics Lab platform): a GENERIC parameter-sweep bench. A preset (widgets/opticsBench/presets.ts) names the
 * sliders, the axes, up to four curves, optional markers and the live readouts; this component draws them and holds the slider state,
 * nothing else. The content builder adds a preset per picture ("how does the cooling force depend on the detuning?") and writes one line
 * of content; no component is written per picture.
 *
 *   - An SVG plot, no canvas: axes with round ticks and units, up to four curves told apart by dash pattern as well as colour, a legend,
 *     vertical markers. The vertical range follows the curves unless the preset fixes it.
 *   - Native range inputs inside labels (keyboard: arrows, Home, End, Page keys), each showing its value with its unit; a Reset button.
 *   - Readouts computed from the engine by the preset on every move (`aria-live="polite"`).
 *   - Motion: a short fade-in of the plot only under `prefers-reduced-motion: no-preference` (widgets/opticsBench.css); nothing else moves.
 *
 * The props gate (widgets/visualSpecs.test.tsx) reads `OpticsBenchProps` from this file; an unknown preset id fails there, and at run time
 * shows a plain message instead of a plot.
 */
import { useId, useMemo, useState } from 'react'
import { Slider, WidgetFrame } from '../ui/primitives'
import './opticsBench.css'
import { OPTICS_PRESETS, OPTICS_PRESET_IDS, defaultParams, hasPreset, type OpticsParams, type OpticsPreset } from './opticsBench/presets'
import { readoutRows, resetParams, setParam, sliderText } from './opticsBench/model'
import { decimalsOf, fixed, niceDomain, niceTicks, pathOf, sample, scale, yExtent } from './opticsBench/plot'

export interface OpticsBenchProps {
  /** The preset id in widgets/opticsBench/presets.ts, e.g. `lorentzian`. */
  preset: string
}

const W = 640
const H = 360
const M = { l: 64, r: 18, t: 18, b: 56 }
const SAMPLES = 240

/** The vertical domain: the preset's fixed range, else the curves' extent made round (always including zero for a non-negative curve). */
function yDomain(preset: OpticsPreset, sampled: Parameters<typeof yExtent>[0]): [number, number] {
  if (preset.y.from !== undefined && preset.y.to !== undefined) return [preset.y.from, preset.y.to]
  const e = yExtent(sampled)
  if (!e) return [0, 1]
  const lo = Math.min(0, e[0])
  const hi = Math.max(lo, e[1])
  return niceDomain(lo, hi + (hi - lo) * 0.05)
}

const withUnit = (text: string, unit: string) => (unit ? `${text} (${unit})` : text)
const tickDigits = (ticks: number[]) => (ticks.length > 1 ? decimalsOf(ticks[1] - ticks[0]) : 0)

function Plot({ preset, params }: { preset: OpticsPreset; params: OpticsParams }) {
  const uid = useId().replace(/:/g, '')
  const curves = preset.curves(params)
  const sampled = curves.map((c) => sample(c.f, preset.x.from, preset.x.to, SAMPLES))
  const [y0, y1] = yDomain(preset, sampled)
  const sx = scale(preset.x.from, preset.x.to, M.l, W - M.r)
  const sy = scale(y0, y1, H - M.b, M.t)
  const xt = niceTicks(preset.x.from, preset.x.to, 6)
  const yt = niceTicks(y0, y1, 5)
  const xd = tickDigits(xt)
  const yd = tickDigits(yt)
  const markers = (preset.markers?.(params) ?? []).filter((m) => Number.isFinite(m.x) && m.x >= preset.x.from && m.x <= preset.x.to)
  const clip = `ob-clip-${uid}`
  const desc = `${preset.y.label} against ${preset.x.label}: ${curves.map((c) => c.label).join('; ')}.`
  return (
    <figure className="ob-figure">
      <svg className="ob-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`ob-t-${uid} ob-d-${uid}`} focusable="false">
        <title id={`ob-t-${uid}`}>{preset.title}</title>
        <desc id={`ob-d-${uid}`}>{desc}</desc>
        <defs>
          <clipPath id={clip}>
            <rect x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} />
          </clipPath>
        </defs>
        <rect className="ob-bg" x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} />
        {xt.map((t) => (
          <g key={`x${t}`}>
            <line className="ob-grid" x1={sx(t)} x2={sx(t)} y1={M.t} y2={H - M.b} />
            <line className="ob-tick" x1={sx(t)} x2={sx(t)} y1={H - M.b} y2={H - M.b + 5} />
            <text className="ob-tick-label" x={sx(t)} y={H - M.b + 19} textAnchor="middle">
              {fixed(t, xd)}
            </text>
          </g>
        ))}
        {yt.map((t) => (
          <g key={`y${t}`}>
            <line className="ob-grid" x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} />
            <line className="ob-tick" x1={M.l - 5} x2={M.l} y1={sy(t)} y2={sy(t)} />
            <text className="ob-tick-label" x={M.l - 9} y={sy(t) + 4} textAnchor="end">
              {fixed(t, yd)}
            </text>
          </g>
        ))}
        <rect className="ob-frame" x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} />
        <g clipPath={`url(#${clip})`}>
          {sampled.map((pts, i) => (
            <path key={i} className={`ob-curve ob-curve-${i}`} d={pathOf(pts, sx, sy)} fill="none" />
          ))}
        </g>
        {markers.map((m, i) => (
          <g key={i} className="ob-marker">
            <line x1={sx(m.x)} x2={sx(m.x)} y1={M.t} y2={H - M.b} />
            <text x={Math.min(Math.max(sx(m.x), M.l + 8), W - M.r - 8)} y={M.t + 13} textAnchor="middle">
              {m.label}
            </text>
          </g>
        ))}
        <text className="ob-axis-label" x={(M.l + W - M.r) / 2} y={H - 10} textAnchor="middle">
          {withUnit(preset.x.label, preset.x.unit)}
        </text>
        <text className="ob-axis-label" transform={`translate(15 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle">
          {withUnit(preset.y.label, preset.y.unit)}
        </text>
      </svg>
      <ul className="ob-legend" aria-label="Curves">
        {curves.map((c, i) => (
          <li key={i}>
            <svg className="ob-swatch" viewBox="0 0 28 10" aria-hidden="true" focusable="false">
              <path className={`ob-curve ob-curve-${i}`} d="M0 5H28" fill="none" />
            </svg>
            {c.label}
          </li>
        ))}
      </ul>
    </figure>
  )
}

function Bench({ id, preset }: { id: string; preset: OpticsPreset }) {
  const [params, setParams] = useState<Record<string, number>>(() => defaultParams(preset))
  const readouts = useMemo(() => readoutRows(preset, params), [preset, params])
  return (
    <WidgetFrame
      title={preset.title}
      wide
      readout={
        <dl className="ob-readouts" aria-live="polite" aria-label="Readouts">
          {readouts.map((r, i) => (
            <div key={i} className="ob-readout">
              <dt>{r.label}</dt>
              <dd className="mono" data-readout={i}>
                {r.text}
              </dd>
            </div>
          ))}
        </dl>
      }
    >
      <div className="ob-bench" data-optics-preset={id}>
        <p className="ob-question">{preset.question}</p>
        <Plot preset={preset} params={params} />
        <div className="ob-sliders">
          {preset.sliders.map((s) => (
            <Slider
              key={s.key}
              label={s.label}
              value={params[s.key]}
              min={s.min}
              max={s.max}
              step={s.step}
              onChange={(v) => setParams((p) => setParam(preset, p, s.key, v))}
              format={(v) => sliderText(preset, s.key, v)}
            />
          ))}
        </div>
        <div className="ob-actions">
          <button type="button" className="btn ghost" onClick={() => setParams(resetParams(preset))}>
            Reset sliders
          </button>
        </div>
      </div>
    </WidgetFrame>
  )
}

export default function OpticsBench({ preset }: OpticsBenchProps) {
  if (!hasPreset(preset))
    return (
      <WidgetFrame title="Optics bench">
        <p className="widget-note" role="alert">
          The optics bench has no preset called “{String(preset).slice(0, 40)}”. Known presets: {OPTICS_PRESET_IDS.join(', ')}.
        </p>
      </WidgetFrame>
    )
  return <Bench key={preset} id={preset} preset={OPTICS_PRESETS[preset]} />
}
