/**
 * The complex-plane Try-it widget's 709 modes (P-F1-story §3 `euler`, §9.3 `phasor`), lazy: they call physics/qc, which
 * never reaches the main chunk. Both are the `complex-plane` stage kind itself: the widget builds a stage state from its
 * sliders and draws it with the kind's own resolver (stage/svg/complexPlane.ts: eulerPath, phasorPath, phasorSum, the
 * same engine calls as the story) and its one scene component, so the widget and the stage cannot disagree.
 *   euler   sliders φ and n: the polygon (1 + iφ/n)^k closing on e^{iφ} as n grows.
 *   phasor  two or three unit arrows with turnable phases, tip to tail, and their resultant.
 */
import { useMemo, useState } from 'react'
import type { ComplexPlaneState } from '../content/stage'
import { complexReadouts, resolveComplexPlane } from '../stage/svg/complexPlane'
import { ComplexPlaneScene } from '../stage/svg/ComplexPlaneScene'
import '../stage/svg/svg.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Slider } from '../ui/primitives'

const W = 340
const H = 300

export interface ComplexPlaneQcProps {
  mode: 'euler' | 'phasor'
  /** euler: the angle φ in degrees (default 180) and the number of steps n (default 4). */
  phi?: number
  n?: number
  /** phasor: the arrows' phases in degrees (two or three; default 0° and 60°). */
  phases?: number[]
}

export default function ComplexPlaneQc({ mode, phi: phi0 = 180, n: n0 = 4, phases: ph0 = [0, 60] }: ComplexPlaneQcProps) {
  const [phi, setPhi] = useState(phi0)
  const [n, setN] = useState(Math.max(1, Math.min(64, Math.round(n0))))
  const [phases, setPhases] = useState(ph0.slice(0, 3))
  const st = useMemo<ComplexPlaneState>(
    () => (mode === 'euler' ? { kind: 'complex-plane', euler: { rate: 'imag', phiDeg: phi, n }, circle: true } : { kind: 'complex-plane', chain: { phasesDeg: phases } }),
    [mode, phi, n, phases],
  )
  const r = useMemo(() => resolveComplexPlane(st, 1), [st])
  return (
    <div className="cplane-qc">
      <svg className="svgk svgk-stage plane" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('complex-plane') as React.CSSProperties} role="img" aria-label={complexReadouts(r).map((x) => x.text).join('; ')}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG['complex-plane']} rx={6} />
        <ComplexPlaneScene state={r} mode="stage" width={W} height={H} bare />
      </svg>
      {mode === 'euler' ? (
        <>
          <Slider label="φ" value={phi} min={-360} max={360} step={15} onChange={setPhi} format={(v) => `${v}°`} />
          <Slider label="n (steps)" value={n} min={1} max={64} step={1} onChange={setN} />
        </>
      ) : (
        phases.map((p, k) => (
          <Slider key={k} label={`phase of arrow ${k + 1}`} value={p} min={0} max={360} step={5} onChange={(v) => setPhases((xs) => xs.map((x, i) => (i === k ? v : x)))} format={(v) => `${v}°`} />
        ))
      )}
    </div>
  )
}
