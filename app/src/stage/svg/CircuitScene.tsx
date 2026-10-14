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
  // the figure's text lines, then the cursor's label ("after 4") 14 above the first wire: 30 keeps that label off the last line (S4: they overlapped when the cursor sat mid-circuit)
  const padTop = own ? 30 + 13 * lines.length : 84
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
            <Glyph key={j} g={g} x={colX(k)} y={wireY} box={box} colW={colW} rowH={rowH} span={[xs, xs + span]} focus={focus} />
          ))}
        </g>
      ))}
      {/* B1: places a fault can happen (a slot on a wire just before a column), not computed faults */}
      {r.faults.length > 0 && (
        <g data-anchor="faults" className={f('faults')}>
          {r.faults.map((fl, i) => {
            const x = xs + colW * fl.col
            const yy = fl.wires.map(wireY)
            const name = `fault place${fl.wires.length > 1 ? 's' : ''} on ${fl.wires.map((w) => r.wires[w]).join(', ')}, before column ${fl.col + 1}${fl.label ? ` (${fl.label})` : ''}`
            return (
              <g key={i} role="img" aria-label={name} opacity={fl.col <= r.cursor + 1e-9 ? 1 : 0.42}>
                <title>{name}</title>
                {fl.wires.length > 1 && <line x1={x} y1={Math.min(...yy)} x2={x} y2={Math.max(...yy)} className="fg-plus" strokeWidth={1.2} />}
                {yy.map((y, j) => (
                  <polygon key={j} points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`} className="fg-plus-fill" stroke="var(--fg-halo, transparent)" strokeWidth={1.2} />
                ))}
                {fl.label && (
                  <Label at={{ x, y: Math.min(...yy) - Math.max(10, box / 2 + 4) }} anchor="middle" cls="fg-plus-t">
                    {fl.label}
                  </Label>
                )}
              </g>
            )
          })}
        </g>
      )}
      {/* B1: the hook: a fault on the check wire rides along it and spills through every CNOT still to come */}
      {r.hook &&
        (() => {
          const h = r.hook
          const x = xs + colW * h.slot
          const cy = wireY(h.check)
          const name = `hook: a fault on ${r.wires[h.check]} after ${h.after} CNOT column${h.after === 1 ? '' : 's'} reaches ${h.reach.map((t) => r.wires[t.wire]).join(', ')}`
          return (
            <g data-anchor="hook" className={f('hook')} role="img" aria-label={name}>
              <title>{name}</title>
              {h.reach.map((t, i) => (
                <g key={i}>
                  <path d={`M${x},${cy} H${colX(t.col)} V${wireY(t.wire)}`} fill="none" className="fg-minus" strokeWidth={1.8} strokeDasharray="5 3" />
                  <circle cx={colX(t.col)} cy={wireY(t.wire)} r={Math.max(12, box * 0.5 + 2)} fill="none" className="fg-minus" strokeWidth={1.6} strokeDasharray="2 2" />
                </g>
              ))}
              <circle cx={x} cy={cy} r={10} fill="none" className="fg-minus" strokeWidth={2.2} />
              <polygon points={`${x},${cy - 6} ${x + 6},${cy} ${x},${cy + 6} ${x - 6},${cy}`} className="fg-minus-fill" />
              <Label at={{ x, y: cy - 15 }} anchor="middle" cls="fg-minus-t">
                hook
              </Label>
            </g>
          )
        })()}
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

/**
 * The label inside a gate box. One line when it fits the box; a parameter gate whose name and angle do not ("Ry(106°)") is written on two lines, the name over the
 * angle, so the text never runs out of a narrow column over the wire's starting ket or the next gate; any other label that is too long shrinks to fit (never below 8 px).
 * Characters average 6.6 px at the 12 px of `fg-txt` (print 11 px).
 */
function boxLabel(label: string, x: number, cy: number, wide: number, box: number) {
  const plain = label.replace(/_/g, '')
  const room = wide - 6
  if (plain.length * 6.6 <= room) return <Label at={{ x, y: cy + 4 }} anchor="middle" cls="fg-txt">{scripted(label)}</Label>
  const m = /^([A-Za-z]+)\((.+)\)$/.exec(label)
  if (m) {
    const fs = Math.min(10.5, Math.max(8, box / 2.3))
    return (
      <g>
        <text x={x} y={cy - 1} textAnchor="middle" className="fg-txt" style={{ fontSize: fs }}>
          {m[1]}
        </text>
        <text x={x} y={cy + fs} textAnchor="middle" className="fg-txt" style={{ fontSize: fs }}>
          {m[2]}
        </text>
      </g>
    )
  }
  const size = Math.max(8, Math.min(12, (12 * room) / (plain.length * 6.6)))
  return (
    <text x={x} y={cy + 4} textAnchor="middle" className="fg-txt" style={{ fontSize: size }}>
      {scripted(label)}
    </text>
  )
}

function Glyph({ g, x, y, box, colW, rowH, span, focus }: { g: CircuitGlyph; x: number; y: (q: number) => number; box: number; colW: number; rowH: number; span: [number, number]; focus?: string | null }) {
  const all = [...g.targets, ...g.controls]
  const top = Math.min(...all)
  const bottom = Math.max(...all)
  const h = box / 2
  const cls = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const link = all.length > 1 && g.type !== 'oracle' && g.type !== 'unitary' ? <line x1={x} y1={y(top)} x2={x} y2={y(bottom)} className="fg-op" strokeWidth={1.6} /> : null
  const controls = g.controls.map((q) => <circle key={`c${q}`} cx={x} cy={y(q)} r={4.8} className="fg-op-fill" data-anchor="controls" />)
  // the classical condition above the gate: centred on its column, but pulled inside the circuit's span (hanging off the gate's own edge) when it would run past the
  // last column — under the cursor line and off the figure — or before the first (stage-code agent S4: "if c0,c1 = 10" over the conditioned X of the last column)
  // in a narrow column the condition drops the "if" and its spaces and commas: "c0c1=10" (stage-code agent S4: five wires of print at 320 px)
  const condText = g.cond && colW < 56 ? g.cond.replace(/^if /, '').replace(/,/g, '').replace(' = ', '=') : g.cond
  const condW = condText ? condText.length * 6.3 : 0
  const condAnchor = g.cond && x + condW / 2 > span[1] - 2 ? 'end' : g.cond && x - condW / 2 < span[0] ? 'start' : 'middle'
  const cond = g.cond ? (
    <text x={condAnchor === 'end' ? x + h : condAnchor === 'start' ? x - h : x} y={y(top) - h - 5} className="fg-lbl" textAnchor={condAnchor}>
      {condText}
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
          {/* the classical bit's name under the meter; beside it when the rows are too close for a line of text between two wires (print, five wires) */}
          {rowH - box >= 18 ? (
            <Label at={{ x, y: y(q) + h + 13 }} anchor="middle" cls="fg-lbl">
              {g.label}
            </Label>
          ) : (
            <Label at={{ x: x + h + 3, y: y(q) + 4 }} anchor="start" cls="fg-lbl">
              {g.label}
            </Label>
          )}
        </g>
      )
    }
    default: {
      // a box on the target wires (an oracle or unitary spans all of them); the label inside
      const t0 = Math.min(...g.targets)
      const t1 = Math.max(...g.targets)
      const tall = y(t1) - y(t0)
      // the label as drawn has no underscore (a subscript is one smaller glyph); a box never grows past its column, so two boxes of neighbouring columns never overlap (W-709 Q18)
      const shown = g.label.replace(/_/g, '').length
      const wide = Math.min(Math.max(box, Math.min(box * 2.2, shown * 7.5 + 10)), Math.max(box, colW * 0.94))
      // a controlled unitary: a line from each control dot to the edge of the box (the plain `link` only joins boxes that are one gate per wire)
      const above = g.controls.filter((q) => q < t0)
      const below = g.controls.filter((q) => q > t1)
      const feeds =
        g.type === 'unitary' && (above.length || below.length) ? (
          <>
            {above.length > 0 && <line x1={x} y1={y(Math.min(...above))} x2={x} y2={y(t0) - h} className="fg-op" strokeWidth={1.6} />}
            {below.length > 0 && <line x1={x} y1={y(t1) + h} x2={x} y2={y(Math.max(...below))} className="fg-op" strokeWidth={1.6} />}
          </>
        ) : null
      return (
        <g className={cls('gates')} data-anchor="gates">
          {link}
          {feeds}
          {controls}
          <rect x={x - wide / 2} y={y(t0) - h} width={wide} height={tall + box} rx={3} className="fg-op" fill="var(--fg-halo, transparent)" strokeWidth={1.6} />
          {boxLabel(g.label, x, (y(t0) + y(t1)) / 2, wide, box)}
          {cond}
        </g>
      )
    }
  }
}
