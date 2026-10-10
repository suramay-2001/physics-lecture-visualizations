/**
 * Widget `bit-table` (Chapter F7, rulings qc709-F7F8 R1): ordinary bits you can poke, drawn by the `bits` stage kind (and, for the cost
 * mode, the `plot` kind). It builds a stage state from its controls and draws it with the kinds' own resolvers and scenes
 * (stage/svg/bits.ts, stage/svg/plot.ts), which take every output, sum, syndrome, pivot and cost from physics/qc/bits.ts, so the Try-it and
 * the story cannot disagree. Lazy: it calls the engine and the SVG kinds.
 *
 *   gate     pick a gate and a view (truth table, or arrows from inputs to outputs); click an input to follow it to its output. AND merges
 *            three inputs onto the output 0; CNOT, SWAP, Toffoli and Fredkin give every input its own output.
 *   strings  two strings of bits you can flip place by place: the XOR row, or the AND row whose parity is the dot product a·b.
 *   reduce   a matrix over GF(2) with up to four rows you can flip; Step makes the next row swap or row XOR; at the end the rank and the
 *            null space are read off.
 *   cost     slide n: n², 2ⁿ and 2^(n/2) at that n, and two of the curves on a log axis.
 */
import { useMemo, useState } from 'react'
import type { BitsCombine, BitsState, PlotState } from '../content/stage'
import {
  BITS_GATES,
  type BitsGate,
  bitString,
  dotMod2,
  exponentialCost,
  gateTable,
  parseBits,
  quadraticCost,
  rootExponentialCost,
} from '../physics/qc/bits'
import { bitsFrom, bitsInputs, bitsReadouts } from '../stage/svg/bits'
import { BitsScene } from '../stage/svg/BitsScene'
import { sci } from '../stage/svg/draw'
import { plotReadouts, resolvePlotStage } from '../stage/svg/plot'
import { PlotScene } from '../stage/svg/PlotScene'
import '../stage/svg/svg.css'
import './bitTable.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'

const W = 560

export type BitTableMode = 'gate' | 'strings' | 'reduce' | 'cost'

export interface BitTableProps {
  /** 'gate' (default): a gate as a table or as arrows · 'strings': two strings you can flip · 'reduce': a matrix mod 2 you reduce move by move · 'cost': n², 2ⁿ and 2^(n/2). */
  mode?: BitTableMode
  /** gate: the gate the picture starts at (default 'AND'). */
  gate?: BitsGate
  /** gate: 'table' (default) or 'map' (arrows from inputs to outputs). */
  view?: 'table' | 'map'
  /** strings: the first and second string (default 1011 and 0110; equal widths, at most 8 bits). */
  a?: string
  b?: string
  /** strings: the computed row the picture starts with, 'xor' (default) or 'dot'. */
  combine?: BitsCombine
  /** reduce: the rows the matrix starts with (one to four strings of equal width, at most 8 bits; default 001 and 111). */
  rows?: string[]
  /** cost: the n the slider starts at (1 … 50, default 10). */
  n?: number
}

export const COST_RANGE = { min: 1, max: 50 } as const
/** The widest string and the longest matrix the widget allows (the kind's own limits, stage/svg/bits.ts BITS_LIMITS). */
export const STRING_WIDTH = 8
export const MAX_ROWS = 4

/** A cost as the picture writes it: thin-spaced groups up to a million millions, a power of ten above that. */
export function fmtCost(x: number): string {
  if (x >= 1e12) return sci(x, 1)
  const s = String(Math.round(x))
  return x < 10000 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** The state the gate controls ask for: the gate, the view, and the selected input (if any) marked. */
export function gateModel(c: { gate: BitsGate; view: 'table' | 'map'; pick: string | null }): { state: BitsState; lines: string[]; note: string } {
  const t = gateTable(c.gate)
  const pick = c.pick !== null && c.pick.length === t.n ? c.pick : null
  const state: BitsState = { kind: 'bits', fn: { source: { gate: c.gate }, view: c.view, mark: pick ? [pick] : undefined }, shot: 'B-BITS' }
  const r = bitsFrom(bitsInputs(state, 1))
  const base = pick ? `${c.gate}(${[...pick].join(' ')}) = ${[...bitString(t.out[parseBits(pick)], t.m)].join(' ')}` : `Click an input to follow it to its output.`
  const note = c.gate === 'Fredkin' ? `${base} (control first; N&C Fig. 3.15 puts it last)` : base
  return { state, lines: bitsReadouts(r).map((x) => x.text), note }
}

/** The state the string controls ask for. */
export function stringsModel(c: { a: string; b: string; combine: BitsCombine }): { state: BitsState; lines: string[]; xor: string; dot: number } {
  const state: BitsState = { kind: 'bits', rows: { strings: [c.a, c.b], combine: c.combine, names: ['a', 'b'] }, shot: 'B-BITS' }
  const both = bitsFrom({ rows: { strings: [c.a, c.b], combine: 'xor' } }).rows!
  const dot = dotMod2(parseBits(c.a), parseBits(c.b))
  return { state, lines: bitsReadouts(bitsFrom(bitsInputs(state, 1))).map((x) => x.text), xor: both.computed!, dot }
}

/** The state the matrix controls ask for: the rows and the number of moves done. */
export function reduceModel(c: { rows: string[]; step: number }): { state: BitsState; lines: string[]; total: number } {
  const state: BitsState = { kind: 'bits', reduce: { strings: c.rows, upTo: c.step }, shot: 'B-BITS' }
  const r = bitsFrom(bitsInputs(state, 1))
  return { state, lines: bitsReadouts(r).map((x) => x.text), total: r.reduce!.total }
}

/** The three costs at n, from the engine, and the plot state with a marker at n. */
export function costModel(c: { n: number; vs: 'nSquared' | 'sqrtTwoToN' }): { state: PlotState; costs: { sq: number; exp: number; root: number } } {
  return {
    state: { kind: 'plot', curve: { fn: 'twoToN', vs: c.vs, x: { from: COST_RANGE.min, to: COST_RANGE.max }, samples: 49 }, yScale: 'log', markers: [{ x: c.n, label: `n = ${c.n}` }], shot: 'P-CURVE' },
    costs: { sq: quadraticCost(c.n), exp: exponentialCost(c.n), root: rootExponentialCost(c.n) },
  }
}

const clampN = (n: number): number => Math.max(COST_RANGE.min, Math.min(COST_RANGE.max, Math.round(n)))
const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`

/** A row of bit buttons: pressing one flips it. */
function BitRow({ label, value, onFlip }: { label: string; value: string; onFlip: (k: number) => void }) {
  return (
    <div className="bt-row" role="group" aria-label={label}>
      <span className="bt-name">{label}</span>
      {[...value].map((b, k) => (
        <button key={k} className={`bt-bit${b === '1' ? ' one' : ''}`} aria-pressed={b === '1'} aria-label={`${label}, place ${k + 1}: ${b}`} onClick={() => onFlip(k)}>
          {b}
        </button>
      ))}
    </div>
  )
}

function Picture({ state, lines, h, label }: { state: BitsState; lines: string[]; h: number; label: string }) {
  const r = useMemo(() => bitsFrom(bitsInputs(state, 1)), [state])
  return (
    <svg className="svgk svgk-stage bit-table-svg" viewBox={`0 0 ${W} ${h}`} style={stageCssVars('bits') as React.CSSProperties} role="img" aria-label={`${label}: ${lines.join('; ')}`}>
      <rect x={0} y={0} width={W} height={h} fill={STAGE_BG.bits} rx={6} />
      <BitsScene state={r} mode="stage" width={W} height={h} bare />
    </svg>
  )
}

function GateMode({ gate: g0, view: v0 }: { gate: BitsGate; view: 'table' | 'map' }) {
  const [gate, setGate] = useState<BitsGate>(g0)
  const [view, setView] = useState<'table' | 'map'>(v0)
  const [pick, setPick] = useState<string | null>(null)
  const { state, lines, note } = gateModel({ gate, view, pick })
  const t = gateTable(gate)
  return (
    <WidgetFrame title="A gate on bits: inputs in, outputs out">
      <Picture state={state} lines={lines} h={view === 'map' ? 400 : 330} label={`${gate} as a ${view}`} />
      <Segmented label="Gate" value={gate} onChange={(g) => (setGate(g), setPick(null))} options={BITS_GATES.map((x) => ({ value: x, label: x }))} />
      <Segmented
        label="View"
        value={view}
        onChange={setView}
        options={[
          { value: 'table', label: 'Truth table' },
          { value: 'map', label: 'Arrows' },
        ]}
      />
      <div className="bt-row" role="group" aria-label="Inputs">
        <span className="bt-name">input</span>
        {Array.from({ length: 2 ** t.n }, (_, x) => bitString(x, t.n)).map((s) => (
          <button key={s} className={`bt-pick${pick === s ? ' on' : ''}`} aria-pressed={pick === s} onClick={() => setPick(pick === s ? null : s)}>
            {s}
          </button>
        ))}
      </div>
      <p className="widget-note" role="status">
        {note}
      </p>
    </WidgetFrame>
  )
}

function StringsMode({ a: a0, b: b0, combine: c0 }: { a: string; b: string; combine: BitsCombine }) {
  const [a, setA] = useState(a0)
  const [b, setB] = useState(b0)
  const [combine, setCombine] = useState<BitsCombine>(c0)
  const m = stringsModel({ a, b, combine })
  return (
    <WidgetFrame title="Two strings of bits: add and dot">
      <Picture state={m.state} lines={m.lines} h={250} label="two strings" />
      <BitRow label="a" value={a} onFlip={(k) => setA(flip(a, k))} />
      <BitRow label="b" value={b} onFlip={(k) => setB(flip(b, k))} />
      <Segmented
        label="Computed row"
        value={combine}
        onChange={setCombine}
        options={[
          { value: 'xor', label: 'a ⊕ b' },
          { value: 'dot', label: 'a·b' },
        ]}
      />
      <p className="widget-note" role="status">
        a ⊕ b = {m.xor} and a·b = {m.dot}.
      </p>
    </WidgetFrame>
  )
}

function ReduceMode({ rows: r0 }: { rows: string[] }) {
  const [rows, setRows] = useState(r0)
  const [step, setStep] = useState(0)
  const m = reduceModel({ rows, step })
  const edit = (next: string[]) => (setRows(next), setStep(0))
  const width = rows[0].length
  return (
    <WidgetFrame title="Row reduction with bits">
      <Picture state={m.state} lines={m.lines} h={150 + 46 * rows.length} label="a matrix over bits" />
      {rows.map((s, i) => (
        <BitRow key={i} label={`row ${i + 1}`} value={s} onFlip={(k) => edit(rows.map((x, j) => (j === i ? flip(x, k) : x)))} />
      ))}
      <div className="bt-buttons">
        <button className="btn" disabled={step <= 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button className="btn" disabled={step >= m.total} onClick={() => setStep(step + 1)}>
          Step
        </button>
        <button className="btn ghost" disabled={step === 0} onClick={() => setStep(0)}>
          Start over
        </button>
        <button className="btn ghost" disabled={rows.length >= MAX_ROWS} onClick={() => edit([...rows, '0'.repeat(width)])}>
          Add a row
        </button>
        <button className="btn ghost" disabled={rows.length <= 1} onClick={() => edit(rows.slice(0, -1))}>
          Remove a row
        </button>
      </div>
      <p className="widget-note" role="status">
        {step >= m.total ? 'The elimination is done: the pivots are ringed and the null space is listed.' : `Press Step: ${m.total - step} ${m.total - step === 1 ? 'move' : 'moves'} to go.`}
      </p>
    </WidgetFrame>
  )
}

function CostMode({ n: n0 }: { n: number }) {
  const [n, setN] = useState(clampN(n0))
  const [vs, setVs] = useState<'nSquared' | 'sqrtTwoToN'>('nSquared')
  const m = costModel({ n, vs })
  const r = useMemo(() => resolvePlotStage(m.state, 1), [m.state])
  const H = 300
  return (
    <WidgetFrame title="Counting the cost: n², 2ⁿ and 2^(n/2)">
      <svg className="svgk svgk-stage bit-table-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('plot') as React.CSSProperties} role="img" aria-label={plotReadouts(r).map((x) => x.text).join('; ')}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.plot} rx={6} />
        <PlotScene state={r} mode="stage" width={W} height={H} bare />
      </svg>
      <Slider label="n (bits of input)" value={n} min={COST_RANGE.min} max={COST_RANGE.max} step={1} onChange={(v) => setN(clampN(v))} />
      <Segmented
        label="Compare 2ⁿ with"
        value={vs}
        onChange={setVs}
        options={[
          { value: 'nSquared', label: 'n²' },
          { value: 'sqrtTwoToN', label: '2^(n/2)' },
        ]}
      />
      <p className="widget-note" role="status">
        n = {n}: n² = {fmtCost(m.costs.sq)}, 2ⁿ = {fmtCost(m.costs.exp)}, 2^(n/2) = {fmtCost(m.costs.root)}.
      </p>
    </WidgetFrame>
  )
}

export default function BitTable({ mode = 'gate', gate = 'AND', view = 'table', a = '1011', b = '0110', combine = 'xor', rows = ['001', '111'], n = 10 }: BitTableProps) {
  if (mode === 'strings') {
    // the two strings share one width (the kind's own limit); a longer one is cut to the shorter
    const w = Math.min(a.length, b.length, STRING_WIDTH)
    return <StringsMode a={a.slice(0, w)} b={b.slice(0, w)} combine={combine} />
  }
  if (mode === 'reduce') {
    const w = Math.min(...rows.map((r) => r.length), STRING_WIDTH)
    return <ReduceMode rows={rows.slice(0, MAX_ROWS).map((r) => r.slice(0, w))} />
  }
  if (mode === 'cost') return <CostMode n={n} />
  return <GateMode gate={gate} view={view} />
}
