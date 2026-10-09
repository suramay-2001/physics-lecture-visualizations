/**
 * The `circuit` scene: ONE component for the live stage and the print figure. Wires left to right (q0 on top, each
 * labelled with its starting ket), gates column by column: boxes (orchid: operators), control dots, ⊕ targets, SWAP
 * crosses, measurement meters; the cursor (the state's colour) sits after column `cursor`, and the columns still ahead
 * of it are dimmed. Everything drawn is in the resolved state (stage/svg/circuit.ts).
 */
import type { SvgSceneProps } from '../svgKinds'
import type { CircuitGlyph } from '../types'
import { circuitReadouts } from './circuit'
import { Label, scripted } from './draw'

const KET: Record<string, string> = { '0': '|0⟩', '1': '|1⟩', '+': '|+⟩', '-': '|−⟩' }

export function CircuitScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'circuit'>) {
  const own = mode === 'print' || !!bare
  const lines = own ? circuitReadouts(r).map((x) => x.text) : []
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  // room for the passport and readout column (stage), the caption under a full or lower view, the figure's text line
  const padTop = own ? 18 + 13 * lines.length : 84
  // the time axis (6 below the last wire) and its label (20 below) must fit inside the figure
  const padBottom = own ? 26 : slot === 'top' ? 18 : 92
  const labelW = 64
  const x0 = (own ? 12 : 24) + labelW
  const x1 = width - (own ? 14 : 24)
  const K = Math.max(1, r.columns.length)
  const colW = Math.min(84, (x1 - x0) / K)
  const span = colW * K
  const xs = x0 + (x1 - x0 - span) / 2
  const colX = (k: number) => xs + colW * (k + 0.5)
  const availH = Math.max(40, height - padTop - padBottom)
  const rowH = Math.min(64, availH / Math.max(1, r.n))
  const ys = padTop + (availH - rowH * r.n) / 2
  const wireY = (q: number) => ys + rowH * (q + 0.5)
  const box = Math.max(18, Math.min(34, colW * 0.62, rowH * 0.62))
  const cursorX = xs + colW * r.cursor
  return (
    <g className="svgk-scene" data-kind="circuit">
      {/* wires and their starting kets */}
      <g data-anchor="wires" className={f('wires')}>
        {r.wires.map((w, q) => (
          <g key={q}>
            <line x1={xs - 8} y1={wireY(q)} x2={xs + span + 8} y2={wireY(q)} className="fg-sil2" strokeWidth={1.4} />
            <Label at={{ x: xs - 12, y: wireY(q) + 4 }} anchor="end" cls="fg-txt">
              {`${w} ${KET[r.init[q]] ?? r.init[q]}`}
            </Label>
          </g>
        ))}
      </g>
      <g data-anchor="time-axis" className={f('time-axis')}>
        <line x1={xs} y1={ys + rowH * r.n + 6} x2={xs + span} y2={ys + rowH * r.n + 6} className="fg-sil3" strokeWidth={1} />
        {/* at the axis's start, so the cursor (often at the far end) and the meters' labels never cover it */}
        <Label at={{ x: xs, y: ys + rowH * r.n + 20 }} anchor="start" cls="fg-lbl">
          time →
        </Label>
      </g>
      {/* the columns: those the cursor has passed are applied; the rest are dimmed */}
      {r.columns.map((col, k) => (
        <g key={k} opacity={k < r.cursor - 1e-9 ? 1 : 0.42}>
          {col.map((g, j) => (
            <Glyph key={j} g={g} x={colX(k)} y={wireY} box={box} focus={focus} />
          ))}
        </g>
      ))}
      {/* the cursor: the state after column `cursor` (an amplitudes view beside it shows that state) */}
      <g data-anchor="cursor" className={f('cursor')}>
        <line x1={cursorX} y1={ys - 10} x2={cursorX} y2={ys + rowH * r.n + 2} className="fg-state" strokeWidth={2} strokeDasharray="5 3" />
        {/* near the last column the label hangs to the left of the cursor, inside the figure */}
        <Label at={{ x: cursorX > xs + span - colW / 2 ? cursorX - 4 : cursorX, y: ys - 14 }} anchor={cursorX > xs + span - colW / 2 ? 'end' : 'middle'} cls="fg-txt">
          {`after ${Math.round(r.cursor)}`}
        </Label>
      </g>
      {/* matrix v2 (W-709 #15): the measured Pauli string, a bracket across the wires after column `at` */}
      {r.observable &&
        (() => {
          const obsX = xs + colW * r.observable!.at
          const tick = Math.min(10, colW * 0.3)
          const top = ys - 6
          const bottom = ys + rowH * r.n + 6
          return (
            <g data-anchor="observable" className={f('observable')}>
              <line x1={obsX} y1={top} x2={obsX} y2={bottom} className="fg-op" strokeWidth={1.6} />
              <line x1={obsX} y1={top} x2={obsX + tick} y2={top} className="fg-op" strokeWidth={1.6} />
              <line x1={obsX} y1={bottom} x2={obsX + tick} y2={bottom} className="fg-op" strokeWidth={1.6} />
              <Label at={{ x: obsX + tick + 4, y: (top + bottom) / 2 + 4 }} anchor="start" cls="fg-txt">
                {r.observable!.pauli}
              </Label>
            </g>
          )
        })()}
      {lines.map((t, i) => (
        <Label key={`rl${i}`} at={{ x: 8, y: 14 + 13 * i }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}

function Glyph({ g, x, y, box, focus }: { g: CircuitGlyph; x: number; y: (q: number) => number; box: number; focus?: string | null }) {
  const all = [...g.targets, ...g.controls]
  const top = Math.min(...all)
  const bottom = Math.max(...all)
  const h = box / 2
  const cls = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const link = all.length > 1 && g.type !== 'oracle' && g.type !== 'unitary' ? <line x1={x} y1={y(top)} x2={x} y2={y(bottom)} className="fg-op" strokeWidth={1.6} /> : null
  const controls = g.controls.map((q) => <circle key={`c${q}`} cx={x} cy={y(q)} r={4.8} className="fg-op-fill" data-anchor="controls" />)
  const cond = g.cond ? (
    <text x={x} y={y(top) - h - 5} className="fg-lbl" textAnchor="middle">
      {g.cond}
    </text>
  ) : null
  switch (g.type) {
    case 'not':
      return (
        <g className={cls('targets')} data-anchor="targets">
          {link}
          {controls}
          {g.targets.map((q) => (
            <g key={q}>
              <circle cx={x} cy={y(q)} r={11} className="fg-op" fill="none" strokeWidth={1.8} />
              <line x1={x - 11} y1={y(q)} x2={x + 11} y2={y(q)} className="fg-op" strokeWidth={1.8} />
              <line x1={x} y1={y(q) - 11} x2={x} y2={y(q) + 11} className="fg-op" strokeWidth={1.8} />
            </g>
          ))}
          {cond}
        </g>
      )
    case 'swap':
      return (
        <g className={cls('swap')} data-anchor="swap">
          {link}
          {controls}
          {g.targets.map((q) => (
            <g key={q}>
              <line x1={x - 7} y1={y(q) - 7} x2={x + 7} y2={y(q) + 7} className="fg-op" strokeWidth={2} />
              <line x1={x - 7} y1={y(q) + 7} x2={x + 7} y2={y(q) - 7} className="fg-op" strokeWidth={2} />
            </g>
          ))}
          {cond}
        </g>
      )
    case 'measure': {
      const q = g.targets[0]
      return (
        <g className={cls('measure')} data-anchor="measure">
          <rect x={x - h} y={y(q) - h} width={box} height={box} rx={3} className="fg-sil" fill="var(--fg-halo, transparent)" strokeWidth={1.4} />
          <path d={`M${x - h * 0.62},${y(q) + h * 0.35} A${h * 0.7},${h * 0.7} 0 0 1 ${x + h * 0.62},${y(q) + h * 0.35}`} className="fg-sil" fill="none" strokeWidth={1.3} />
          <line x1={x} y1={y(q) + h * 0.35} x2={x + h * 0.5} y2={y(q) - h * 0.45} className="fg-sil" strokeWidth={1.3} />
          <Label at={{ x, y: y(q) + h + 13 }} anchor="middle" cls="fg-lbl">
            {g.label}
          </Label>
        </g>
      )
    }
    default: {
      // a box on the target wires (an oracle or unitary spans all of them); the label inside
      const t0 = Math.min(...g.targets)
      const t1 = Math.max(...g.targets)
      const tall = y(t1) - y(t0)
      const wide = Math.max(box, Math.min(box * 2.2, g.label.length * 7.5 + 10))
      return (
        <g className={cls('gates')} data-anchor="gates">
          {link}
          {controls}
          <rect x={x - wide / 2} y={y(t0) - h} width={wide} height={tall + box} rx={3} className="fg-op" fill="var(--fg-halo, transparent)" strokeWidth={1.6} />
          <Label at={{ x, y: (y(t0) + y(t1)) / 2 + 4 }} anchor="middle" cls="fg-txt">
            {scripted(g.label)}
          </Label>
          {cond}
        </g>
      )
    }
  }
}
