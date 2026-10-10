/**
 * The complex-plane Try-it widget's 709 modes (P-F1-story §3 `euler`, §9.3 `phasor`; P-F8-story §9.3 `roots`), lazy: they
 * call physics/qc, which never reaches the main chunk. All are the `complex-plane` stage kind itself: the widget builds a
 * stage state from its sliders and draws it with the kind's own resolver (stage/svg/complexPlane.ts: eulerPath, phasorPath,
 * phasorSum, the same engine calls as the story) and its one scene component, so the widget and the stage cannot disagree.
 *   euler   sliders φ and n: the polygon (1 + iφ/n)^k closing on e^{iφ} as n grows.
 *   phasor  two or three unit arrows with turnable phases, tip to tail, and their resultant.
 *   roots   sliders N and j: the N arrows ω^{jk} (ω = e^{2πi/N}, k = 0 … N − 1) from the centre and tip to tail, with their sum.
 *           j = 1 is the regular N-gon that closes; N | j points every arrow at 1 (sum N); one line says how many corners are used.
 */
import { useMemo, useState } from 'react'
import type { ComplexPlaneState } from '../content/stage'
import { gcd, mod } from '../physics/qc/numtheory'
import { complexReadouts, resolveComplexPlane } from '../stage/svg/complexPlane'
import { ComplexPlaneScene } from '../stage/svg/ComplexPlaneScene'
import '../stage/svg/svg.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Slider } from '../ui/primitives'

const W = 340
const H = 300

/** The roots sliders' ranges: at most 12 arrows (the stage kind's cap), j up to a full lap of the largest N. */
export const ROOTS_RANGE = { nMin: 2, nMax: 12, jMin: 0, jMax: 12 } as const

export interface ComplexPlaneQcProps {
  mode: 'euler' | 'phasor' | 'roots'
  /** euler: the angle φ in degrees (default 180) and the number of steps n (default 4). */
  phi?: number
  n?: number
  /** phasor: the arrows' phases in degrees (two or three; default 0° and 60°). */
  phases?: number[]
  /** roots: the number of equal turns N, 2–12 (default 8); the arrows are ω^{jk}, ω = e^{2πi/N}. */
  N?: number
  /** roots: how many corners each arrow steps on from the last, j = 0–12 (default 1). */
  j?: number
}

/** The stage state the roots mode draws: the N arrows ω^{jk} (angle 360·(jk mod N)/N degrees), from the centre and tip to tail, on a clock face of N numbered marks. */
export function rootsState(N: number, j: number): ComplexPlaneState {
  const phasesDeg = Array.from({ length: N }, (_, k) => (360 * mod(j * k, N)) / N)
  return { kind: 'complex-plane', spokes: { phasesDeg }, chain: { phasesDeg }, circle: true, clock: N }
}
/** The corners the arrows ω^{jk} land on, k = 0 … N − 1, as numbers 0 … N − 1 (jk mod N): the clock the arrows walk round. */
export const rootsCorners = (N: number, j: number): number[] => Array.from({ length: N }, (_, k) => mod(j * k, N))
/** How many different corners are used (N / gcd(j, N)) and how often each is visited (gcd(j, N)); j = 0 uses the corner 0 only. */
export function rootsUse(N: number, j: number): { corners: number; each: number } {
  const g = gcd(j, N)
  return { corners: N / g, each: g }
}

const clampInt = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, Math.round(x)))

export default function ComplexPlaneQc({ mode, phi: phi0 = 180, n: n0 = 4, phases: ph0 = [0, 60], N: N0 = 8, j: j0 = 1 }: ComplexPlaneQcProps) {
  const [phi, setPhi] = useState(phi0)
  const [n, setN] = useState(Math.max(1, Math.min(64, Math.round(n0))))
  const [phases, setPhases] = useState(ph0.slice(0, 3))
  const [N, setBigN] = useState(clampInt(N0, ROOTS_RANGE.nMin, ROOTS_RANGE.nMax))
  const [j, setJ] = useState(clampInt(j0, ROOTS_RANGE.jMin, ROOTS_RANGE.jMax))
  const st = useMemo<ComplexPlaneState>(
    () => (mode === 'euler' ? { kind: 'complex-plane', euler: { rate: 'imag', phiDeg: phi, n }, circle: true } : mode === 'roots' ? rootsState(N, j) : { kind: 'complex-plane', chain: { phasesDeg: phases } }),
    [mode, phi, n, phases, N, j],
  )
  const r = useMemo(() => resolveComplexPlane(st, 1), [st])
  const use = rootsUse(N, j)
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
      ) : mode === 'roots' ? (
        <>
          <Slider label="N (equal turns)" value={N} min={ROOTS_RANGE.nMin} max={ROOTS_RANGE.nMax} step={1} onChange={setBigN} />
          <Slider label="step (corners per arrow)" value={j} min={ROOTS_RANGE.jMin} max={ROOTS_RANGE.jMax} step={1} onChange={setJ} format={(v) => `${v} (${fixDeg((360 * v) / N)}° each)`} />
          <p className="small mono roots-use" data-roots-use>
            {`corners used: ${use.corners} of ${N}, each ${use.each} time${use.each === 1 ? '' : 's'}`}
          </p>
        </>
      ) : (
        phases.map((p, k) => (
          <Slider key={k} label={`phase of arrow ${k + 1}`} value={p} min={0} max={360} step={5} onChange={(v) => setPhases((xs) => xs.map((x, i) => (i === k ? v : x)))} format={(v) => `${v}°`} />
        ))
      )}
    </div>
  )
}

/** A degree count with up to two decimals and no trailing zeros (45, 22.5, 128.57). */
const fixDeg = (x: number): string => String(Math.round(x * 100) / 100)
