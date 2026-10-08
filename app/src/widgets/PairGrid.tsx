/**
 * Widget W4 `pair-grid` (448 Lecture 9; rulings 448-L8L11 L9 R1): the table of boxes of two systems, drawn by the `matrix` stage
 * kind itself (stage/svg/matrix.ts resolveMatrixStage → MatrixScene, the pair view), lazy because it calls physics/qc: the widget
 * builds a stage state from its controls and draws it with the kind's own resolver and scene, so the Try-it and the story cannot
 * disagree. Four tables:
 *   quantum, spin frame      two spins: Alice's and Bob's directions (a column times a row) or the family cos t|ud⟩ − sin t|du⟩
 *   quantum, coin-die frame  only the labels of photon ⊗ die (2 × 6 boxes)
 *   classical                two coins scored ±1: one dealer's penny and dime, or two separate dealers (chances, not amplitudes)
 * The determinant ψ_uuψ_dd − ψ_udψ_du and the product verdict are an opt-in "Go deeper" box, off unless the learner turns it on.
 */
import { useMemo, useState } from 'react'
import type { MatrixGridState, PairReadout } from '../content/stage'
import { matrixReadouts, resolveMatrixStage } from '../stage/svg/matrix'
import { MatrixScene } from '../stage/svg/MatrixScene'
import '../stage/svg/svg.css'
import './pairGrid.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'

const W = 460
const H = 300

export interface PairGridProps {
  /** 'quantum' (default): two spins, or the label table of photon ⊗ die. 'classical': two coins whose boxes are chances. */
  mode?: 'quantum' | 'classical'
  /** Quantum: 'spin' (default, the 2 × 2 table of two spins) or 'coin-die' (the 2 × 6 table of labels). */
  frame?: 'spin' | 'coin-die'
  /** Two spins: Alice's and Bob's directions as [θ, φ] in degrees (default Alice [60, 0], Bob [90, 0]). */
  alice?: [number, number]
  bob?: [number, number]
  /** Two spins: 'product' (separate preparations; the sliders set both directions) or 'family' (cos t|ud⟩ − sin t|du⟩, one slider). */
  preset?: 'product' | 'family'
  /** The family's angle t, in degrees (default 0). */
  t?: number
  /** Classical: 'dealer' (one dealer hands a penny and a dime to two people) or 'independent' (two separate dealers, one coin each). */
  coins?: 'dealer' | 'independent'
  /** Independent coins: the chance each shows +1 (default 0.5). */
  pA?: number
  pB?: number
  /** Start with the Go-deeper factoring test (determinant and product verdict) switched on. */
  showDet?: boolean
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export default function PairGrid({ mode = 'quantum', frame: frame0 = 'spin', alice = [60, 0], bob = [90, 0], preset: preset0 = 'product', t: t0 = 0, coins: coins0 = 'dealer', pA: pA0 = 0.5, pB: pB0 = 0.5, showDet: showDet0 = false }: PairGridProps) {
  const [frame, setFrame] = useState<'spin' | 'coin-die'>(frame0)
  const [preset, setPreset] = useState<'product' | 'family'>(preset0)
  const [a, setA] = useState<[number, number]>(alice)
  const [b, setB] = useState<[number, number]>(bob)
  const [t, setT] = useState(t0)
  const [boxes, setBoxes] = useState<'amplitudes' | 'chances'>('amplitudes')
  const [coins, setCoins] = useState<'dealer' | 'independent'>(coins0)
  const [pA, setPA] = useState(clamp(pA0, 0, 1))
  const [pB, setPB] = useState(clamp(pB0, 0, 1))
  const [deeper, setDeeper] = useState(showDet0)

  const st = useMemo<MatrixGridState>(() => {
    if (mode === 'classical')
      return { kind: 'matrix', source: { table: coins === 'dealer' ? { classical: 'dealer' } : { classical: 'independent', pA, pB } }, readouts: ['marginals', 'means'], values: 'exact' }
    if (frame === 'coin-die') return { kind: 'matrix', source: { table: { frame: 'photon-die' } }, readouts: ['dims'] }
    const readouts: PairReadout[] = ['norm', 'marginals', ...(deeper ? (['det', 'product'] as PairReadout[]) : [])]
    if (preset === 'family') return { kind: 'matrix', source: { coef: { family: 'ud-du', tDeg: t } }, cells: boxes, readouts, values: 'exact' }
    return {
      kind: 'matrix',
      source: { coef: { pair: [{ thetaDeg: a[0], phiDeg: a[1] }, { thetaDeg: b[0], phiDeg: b[1] }] } },
      cells: boxes,
      factors: true,
      readouts,
      values: 'exact',
    }
  }, [mode, frame, preset, a, b, t, boxes, coins, pA, pB, deeper])
  const r = useMemo(() => resolveMatrixStage(st, 1), [st])
  const lines = matrixReadouts(r).map((x) => x.text)

  return (
    <WidgetFrame title={mode === 'classical' ? 'Two coins: a table of chances' : 'Two systems: a table of boxes'}>
      <svg className="svgk svgk-stage pair-grid-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('matrix') as React.CSSProperties} role="img" aria-label={lines.join('; ')}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.matrix} rx={6} />
        <MatrixScene state={r} mode="stage" width={W} height={H} bare />
      </svg>
      {mode === 'classical' ? (
        <>
          <Segmented
            label="Coins"
            value={coins}
            onChange={setCoins}
            options={[
              { value: 'dealer', label: 'one dealer, two coins' },
              { value: 'independent', label: 'two separate dealers' },
            ]}
          />
          {coins === 'independent' && (
            <>
              <Slider label="P(+1) for coin A" value={pA} min={0} max={1} step={0.05} onChange={setPA} format={(v) => v.toFixed(2)} />
              <Slider label="P(+1) for coin B" value={pB} min={0} max={1} step={0.05} onChange={setPB} format={(v) => v.toFixed(2)} />
            </>
          )}
        </>
      ) : (
        <>
          <Segmented
            label="Table"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'spin', label: 'two spins' },
              { value: 'coin-die', label: 'photon ⊗ die' },
            ]}
          />
          {frame === 'spin' && (
            <>
              <Segmented
                label="State"
                value={preset}
                onChange={setPreset}
                options={[
                  { value: 'product', label: 'two separate spins' },
                  { value: 'family', label: 'the ud–du family' },
                ]}
              />
              {preset === 'product' ? (
                <>
                  <Slider label="Alice θ" value={a[0]} min={0} max={180} step={5} onChange={(v) => setA([v, a[1]])} format={(v) => `${v}°`} />
                  <Slider label="Alice φ" value={a[1]} min={-180} max={180} step={15} onChange={(v) => setA([a[0], v])} format={(v) => `${v}°`} />
                  <Slider label="Bob θ" value={b[0]} min={0} max={180} step={5} onChange={(v) => setB([v, b[1]])} format={(v) => `${v}°`} />
                  <Slider label="Bob φ" value={b[1]} min={-180} max={180} step={15} onChange={(v) => setB([b[0], v])} format={(v) => `${v}°`} />
                </>
              ) : (
                <Slider label="t" value={t} min={0} max={90} step={5} onChange={setT} format={(v) => `${v}°`} />
              )}
              <Segmented
                label="Boxes show"
                value={boxes}
                onChange={setBoxes}
                options={[
                  { value: 'amplitudes', label: 'amplitudes' },
                  { value: 'chances', label: 'chances' },
                ]}
              />
              <label className="pair-deeper">
                <input type="checkbox" checked={deeper} onChange={(e) => setDeeper(e.target.checked)} /> Go deeper (beyond the notes): show the factoring test
              </label>
            </>
          )}
        </>
      )}
    </WidgetFrame>
  )
}
