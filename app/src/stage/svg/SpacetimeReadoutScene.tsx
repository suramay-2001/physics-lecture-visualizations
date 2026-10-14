/**
 * The `spacetime` scene's READOUT mode (B3, P-B3 S-b): the repeated product readout of a seam, drawn from the resolved numbers only (stage/svg/spacetime.ts took every flip, product reading, vote and
 * chance from physics/qec/timelike.ts). Columns are the m seam checks, rows are the R rounds going DOWN; a thin line joins one check's readings through time (a time link), a hollow node is a
 * reading that was right and a filled cobalt dot a reading that flipped. With `product` a right-hand column shows each round's product reading (the product of the m readings: wrong when an odd number
 * flipped, an orchid mark with the word); with `vote` a bottom row writes the majority-vote verdict. A position is a drawing choice; text is plain Unicode; every flipped reading, every product
 * reading and the vote carry an accessible name. One component for the live stage, the reading version and the print figure.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedSpacetime } from '../types'
import { packLines } from './CodeScene'
import { Label } from './draw'
import { spacetimeReadouts } from './spacetime'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))

export interface ReadoutGeometry {
  area: { x: number; y: number; w: number; h: number }
  /** x of the centre of check column i (0-based) and y of the centre of round row t (0-based, the first round at the top). */
  colX: (i: number) => number
  rowY: (t: number) => number
  dx: number
  dy: number
  disc: number
  /** x of the product column's box centre (null when it is not shown), and the half side of the box. */
  prodX: number | null
  box: number
  /** y of the rule above the vote row (null when the vote is not shown). */
  voteY: number | null
  /** y of the header row (the check numbers) and of the legend line. */
  headY: number
  legendY: number
  lines: string[]
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function readoutGeometry(r: ResolvedSpacetime, width: number, height: number, own: boolean, slot?: string | null): ReadoutGeometry {
  const o = r.readout!
  const readouts = spacetimeReadouts(r)
  const title = `repeated readout · ${o.m} check${o.m === 1 ? '' : 's'} · ${o.R} round${o.R === 1 ? '' : 's'}`
  const lines = own ? [title, ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const showProduct = r.show.includes('product')
  const showVote = r.show.includes('vote')
  const labelW = 52
  const prodW = showProduct ? 78 : 0
  const head = 22
  const legend = 22
  const voteH = showVote ? 34 : 0
  const dx = clamp((area.w - labelW - prodW - 6) / o.m, 14, 52)
  const dy = clamp((area.h - head - legend - voteH - 10) / o.R, 12, 40)
  const gridW = dx * o.m
  const left = area.x + labelW + Math.max(0, (area.w - labelW - prodW - gridW) / 2)
  const y0 = area.y + head + Math.max(0, (area.h - head - legend - voteH - 10 - dy * o.R) / 2) + dy / 2
  const box = clamp(Math.min(dx, dy) * 0.42, 5, 9)
  const gridBottom = y0 + dy * (o.R - 1) + dy / 2
  return {
    area,
    colX: (i) => left + dx * (i + 0.5),
    rowY: (t) => y0 + dy * t,
    dx,
    dy,
    disc: clamp(Math.min(dx, dy) * 0.3, 3.5, 8),
    prodX: showProduct ? left + gridW + 22 : null,
    box,
    voteY: showVote ? gridBottom + 8 : null,
    headY: area.y + 12,
    legendY: area.y + area.h - 4,
    lines,
  }
}

interface Ctx {
  r: ResolvedSpacetime
  g: ReadoutGeometry
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

function Grid({ c }: { c: Ctx }) {
  const { r, g } = c
  const o = r.readout!
  const showReadings = r.show.includes('readings')
  const showProduct = r.show.includes('product')
  return (
    <g>
      {/* the axes: check numbers above, round labels at the left */}
      <g>
        <Label at={{ x: g.colX(0) - g.dx / 2 - 8, y: g.headY }} anchor="end" cls="fg-lbl">
          check
        </Label>
        {Array.from({ length: o.m }, (_, i) => (
          <Label key={i} at={{ x: g.colX(i), y: g.headY }} anchor="middle" cls="fg-lbl">
            {String(i + 1)}
          </Label>
        ))}
        {Array.from({ length: o.R }, (_, t) => (
          <Label key={t} at={{ x: g.colX(0) - g.dx / 2 - 8, y: g.rowY(t) + 4 }} anchor="end" cls="fg-lbl">
            {`round ${t + 1}`}
          </Label>
        ))}
      </g>
      {/* the time links: one thin line through each check's readings */}
      <g>
        {Array.from({ length: o.m }, (_, i) => (
          <line key={i} x1={g.colX(i)} y1={g.rowY(0)} x2={g.colX(i)} y2={g.rowY(o.R - 1)} className="fg-sil3" strokeWidth={1.2} />
        ))}
      </g>
      {/* the readings: hollow where right, a filled cobalt dot where it flipped */}
      <g data-anchor="reading" className={fcls(c, 'reading')}>
        {o.flips.flatMap((row, t) =>
          row.map((flip, i) => {
            const x = g.colX(i)
            const y = g.rowY(t)
            if (flip && showReadings) {
              const name = `flipped reading: check ${i + 1}, round ${t + 1}`
              return (
                <g key={`${t}-${i}`} role="img" aria-label={name} data-flipped="1">
                  <title>{name}</title>
                  <circle cx={x} cy={y} r={g.disc} className="fg-minus-fill" stroke="var(--fg-halo, transparent)" strokeWidth={1.4} />
                </g>
              )
            }
            return <circle key={`${t}-${i}`} cx={x} cy={y} r={2.6} fill="var(--fg-halo, transparent)" className="fg-sil2" strokeWidth={1.2} aria-hidden="true" />
          }),
        )}
      </g>
      {/* each round's product reading */}
      {showProduct && g.prodX !== null && (
        <g data-anchor="product" className={fcls(c, 'product')}>
          <Label at={{ x: g.prodX, y: g.headY }} anchor="middle" cls="fg-lbl">
            product
          </Label>
          {o.wrong.map((w, t) => {
            const y = g.rowY(t)
            const flips = o.flips[t].reduce<number>((a, b) => a + b, 0)
            const name = `round ${t + 1}: product reading ${w ? 'wrong' : 'right'} (${flips} flipped reading${flips === 1 ? '' : 's'})`
            return (
              <g key={t} role="img" aria-label={name} data-wrong={w}>
                <title>{name}</title>
                <line x1={g.colX(o.m - 1) + g.disc + 3} y1={y} x2={g.prodX! - g.box - 2} y2={y} className="fg-sil3" strokeWidth={1} strokeDasharray="2 3" />
                <rect x={g.prodX! - g.box} y={y - g.box} width={2 * g.box} height={2 * g.box} rx={2} className={w ? 'fg-op-fill' : 'fg-sil2'} fill={w ? undefined : 'var(--fg-halo, transparent)'} strokeWidth={w ? 0 : 1.2} />
                <text x={g.prodX! + g.box + 4} y={y + 4} className={w ? 'fg-txt' : 'fg-lbl'} style={{ fontSize: 11, fontWeight: w ? 700 : 400 }}>
                  {w ? 'wrong' : 'ok'}
                </text>
              </g>
            )
          })}
        </g>
      )}
    </g>
  )
}

function Vote({ c }: { c: Ctx }) {
  const { r, g } = c
  const o = r.readout!
  if (g.voteY === null) return null
  const text = `vote: ${o.voteWrong ? 'wrong' : 'right'} · ${o.wrongRounds} of ${o.R} round${o.R === 1 ? '' : 's'} wrong`
  return (
    <g data-anchor="vote" className={fcls(c, 'vote')} role="img" aria-label={text}>
      <title>{text}</title>
      <line x1={g.area.x} y1={g.voteY} x2={g.area.x + g.area.w} y2={g.voteY} className="fg-sil3" strokeWidth={1} strokeDasharray="4 3" />
      <text x={g.area.x} y={g.voteY + 20} className="fg-txt" style={{ fontWeight: 700, fontSize: 12 }}>
        {text}
      </text>
    </g>
  )
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  const y = g.legendY
  const items: { w: number; node: React.ReactNode }[] = []
  items.push({ w: 82, node: <><circle cx={5} cy={y - 4} r={2.8} fill="var(--fg-halo, transparent)" className="fg-sil2" strokeWidth={1.2} /><text x={15} y={y} className="fg-lbl">right</text></> })
  if (r.show.includes('readings')) items.push({ w: 96, node: <><circle cx={5} cy={y - 4} r={4.5} className="fg-minus-fill" /><text x={15} y={y} className="fg-lbl">flipped</text></> })
  if (r.show.includes('product')) items.push({ w: 120, node: <><rect x={0} y={y - 9} width={10} height={10} rx={2} className="fg-op-fill" /><text x={15} y={y} className="fg-lbl">wrong product</text></> })
  let x = g.area.x
  return (
    <g data-legend="spacetime">
      {items.map((it, i) => {
        const at = x
        x += it.w
        return <g key={i} transform={`translate(${at},0)`}>{it.node}</g>
      })}
    </g>
  )
}

/** The readout mode's picture, inside the `spacetime` scene's group. */
export function ReadoutScene({ state: r, mode: _mode, width, height, focus, bare, slot }: SvgSceneProps<'spacetime'>) {
  void _mode
  const own = _mode === 'print' || !!bare
  const g = readoutGeometry(r, width, height, own, slot)
  const o = r.readout!
  const c: Ctx = { r, g, focus }
  return (
    <g className="svgk-scene" data-kind="spacetime" data-view="readout">
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {`${o.m} check${o.m === 1 ? '' : 's'} · ${o.R} round${o.R === 1 ? '' : 's'}`}
        </text>
      )}
      <Grid c={c} />
      <Vote c={c} />
      <Legend c={c} />
    </g>
  )
}
