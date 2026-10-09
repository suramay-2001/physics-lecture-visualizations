/**
 * The `grover-plane` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved plane only
 * (stage/svg/groverPlane.ts took every angle, arrow and chance from physics/qc/grover.ts):
 *   axes     |x₀⊥⟩ across (the unmarked strings, evenly) and |x₀⟩ up (the marked strings), with the unit circle
 *   arrow    the search state after k steps, from the origin to the circle at (2k+1)α, with its vertical shadow: a dashed line to the
 *            vertical axis and a thick bar on it (the amplitude of |x₀⟩, whose square is the chance of a marked string)
 *   trail    faint arrows of the earlier steps
 *   ghost    the marking oracle's image of the arrow: mirrored in the horizontal axis, dashed
 *   mirrors  the two mirror lines through the origin: the horizontal axis (the mark) and the line through |w₀⟩ at α (the diffusion)
 *   arcs     α (from the horizontal to |w₀⟩) and 2α (the last step)
 *   proof    Theorem 1's picture: a test vector on one mirror, its image after the first reflection and after the second
 * The state arrow is white, the operations (mirrors, the ghost, the proof's images) orchid, structure silver; the amber / cobalt outcome hues
 * are never used. The text is plain Unicode (no TeX inside SVG).
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedGroverPlane } from '../types'
import { groverPlaneReadouts } from './groverPlane'
import { Arrow, Label, type Pt, arcPath, beyond, fix } from './draw'

const DEG = Math.PI / 180

export interface GroverPlaneLayout {
  padX: number
  /** Text lines the figure carries itself (print and bare), at the top. */
  lines: string[]
  /** The unit circle: centre and radius. */
  cx: number
  cy: number
  R: number
  /** The drawing area the circle (and the room for its labels) lives in. */
  area: { x: number; y: number; w: number; h: number }
}

/** Where the plane goes, for a drawing box and a resolved state (pure, so a test can check nothing leaves the box). */
export function groverPlaneLayout(r: ResolvedGroverPlane, width: number, height: number, own: boolean, slot?: string | null): GroverPlaneLayout {
  const lines = own ? groverPlaneReadouts(r).map((x) => x.text) : []
  const padX = own ? 14 : 28
  const nReadouts = groverPlaneReadouts(r).length
  const paneTitle = slot === 'top' || slot === 'bottom'
  // the live stage keeps room for the passport (a 4-line note, or a one-line title strip in a split pane) and the readout column at the top-right
  // (the plane is left-aligned, so in a wide pane the readout column sits beside it and takes no height; a narrow pane keeps room under it)
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : paneTitle ? (width < 480 ? Math.max(34, 18 + 17 * nReadouts) : 34) : Math.max(104, 24 + 17 * nReadouts)
  const bottom = own ? 8 : slot === 'top' ? 12 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(80, height - top - bottom) }
  // room beside the circle for the horizontal axis's label (right), for an arrow's label when the arrow points left (left), above it for the
  // vertical axis's label, below it for a ghost label
  const labelRight = 92
  const labelLeft = 50
  const labelTop = 20
  const labelBottom = 14
  const R = Math.max(24, Math.min((area.w - labelRight - labelLeft) / 2, (area.h - labelTop - labelBottom) / 2, 190))
  // a box roomier than the circle needs centres the picture in what is left (the labels beside and above it come along)
  const spareX = Math.max(0, area.w - (2 * R + labelRight + labelLeft))
  const spareY = Math.max(0, area.h - (2 * R + labelTop + labelBottom))
  const cx = area.x + labelLeft + R + spareX / 2
  const cy = area.y + labelTop + R + spareY / 2
  return { padX, lines, cx, cy, R, area }
}

/** A point at direction `deg` (counter-clockwise from the right, y up) and distance `d` from `c`. */
const at = (c: Pt, deg: number, d: number): Pt => ({ x: c.x + d * Math.cos(deg * DEG), y: c.y - d * Math.sin(deg * DEG) })

export function GroverPlaneScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'grover-plane'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = groverPlaneLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const c: Pt = { x: L.cx, y: L.cy }
  const R = L.R
  const head = Math.min(11, R * 0.12)
  const tip = at(c, r.angleDeg, R)
  const whole = Math.abs(r.k - Math.round(r.k)) < 1e-9
  const sin = r.arrow[1]
  const hasMirror = (n: 'x0perp' | 'w0') => r.mirrors.some((m) => m.name === n)
  const proof = r.proof
  // a mirror line runs a little beyond the circle on both sides
  const mirrorLine = (deg: number, extra = 12) => ({ a: at(c, deg + 180, R + extra), b: at(c, deg, R + extra) })

  return (
    <g className="svgk-scene" data-kind="grover-plane">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}

      {/* the unit circle: every state of the plane has length 1 */}
      <circle cx={c.x} cy={c.y} r={R} fill="none" className="fg-sil3" strokeWidth={1.2} data-anchor="circle" />

      {/* the two axes: |x₀⊥⟩ across, |x₀⟩ up */}
      <g data-anchor="rest-axis" className={f('rest-axis')}>
        <Arrow a={{ x: c.x - R - 10, y: c.y }} b={{ x: c.x + R + 12, y: c.y }} cls="fg-sil2" width={1.3} head={7} />
        <Label at={{ x: c.x + R + 18, y: c.y - 4 }} cls="fg-txt">
          |x₀⊥⟩
        </Label>
        <Label at={{ x: c.x + R + 18, y: c.y + 11 }} cls="fg-lbl">
          the rest
        </Label>
      </g>
      <g data-anchor="marked-axis" className={f('marked-axis')}>
        <Arrow a={{ x: c.x, y: c.y + R + 8 }} b={{ x: c.x, y: c.y - R - 12 }} cls="fg-sil2" width={1.3} head={7} />
        <Label at={{ x: c.x + 8, y: c.y - R - 6 }} cls="fg-txt">
          |x₀⟩ marked
        </Label>
      </g>

      {/* mirror lines */}
      {hasMirror('x0perp') && (
        <g data-anchor="mirror-x0perp" className={f('mirror-x0perp')}>
          <line x1={c.x - R - 12} y1={c.y} x2={c.x + R + 12} y2={c.y} className="fg-op" strokeWidth={2.4} opacity={0.75} />
          <Label at={{ x: c.x - R - 10, y: c.y + 15 }} cls="fg-lbl" color="var(--fg-op)">
            {proof ? 'M₁ the mark' : 'the mark'}
          </Label>
        </g>
      )}
      {hasMirror('w0') && (
        <g data-anchor="mirror-w0" className={f('mirror-w0')}>
          {(() => {
            const m = mirrorLine(r.alphaDeg)
            const lbl = at(c, r.alphaDeg + 180, R + 10)
            return (
              <>
                <line x1={m.a.x} y1={m.a.y} x2={m.b.x} y2={m.b.y} className="fg-op" strokeWidth={2.2} strokeDasharray="7 4" opacity={0.85} />
                <Label at={{ x: lbl.x + 6, y: lbl.y + 14 }} cls="fg-lbl" color="var(--fg-op)">
                  {proof ? 'M₂ through |w₀⟩' : 'through |w₀⟩'}
                </Label>
              </>
            )
          })()}
        </g>
      )}

      {/* arcs: α from the horizontal to |w₀⟩, and the last step's 2α */}
      {r.arcs.includes('alpha') && (
        <g data-anchor="arc-alpha" className={f('arc-alpha')}>
          <path d={arcPath(c, R * 0.3, 0, r.alphaDeg * DEG)} fill="none" className="fg-sil" strokeWidth={1.8} />
          <Label at={{ x: c.x + R * 0.3 + 8, y: c.y - Math.max(5, R * 0.3 * Math.sin((r.alphaDeg * DEG) / 2)) - 3 }} cls="fg-lbl">
            {`α = ${fix(r.alphaDeg, 1)}°`}
          </Label>
        </g>
      )}
      {r.arcs.includes('step') && r.k >= 1 - 1e-9 && (
        <g data-anchor="arc-step" className={f('arc-step')}>
          {(() => {
            const a0 = r.angleDeg - r.stepDeg
            const mid = at(c, (a0 + r.angleDeg) / 2, R * 0.56 + 14)
            return (
              <>
                <path d={arcPath(c, R * 0.56, a0 * DEG, r.angleDeg * DEG)} fill="none" className="fg-sil" strokeWidth={1.8} />
                <Label at={mid} cls="fg-lbl" anchor="middle">
                  {`2α = ${fix(r.stepDeg, 1)}°`}
                </Label>
              </>
            )
          })()}
        </g>
      )}

      {/* the arrows of the earlier steps */}
      {r.trail.length > 0 && (
        <g data-anchor="trail" className={f('trail')}>
          {r.trail.map((a, j) => (
            <Arrow key={j} a={c} b={at(c, a, R)} cls="fg-state" width={1.4} head={6} dashed={false} />
          ))}
        </g>
      )}

      {/* the marking oracle's image of the arrow: mirrored in the horizontal axis */}
      {r.ghost && (
        <g data-anchor="ghost" className={f('ghost')}>
          <line x1={tip.x} y1={tip.y} x2={c.x + R * r.ghost[0]} y2={c.y - R * r.ghost[1]} className="fg-sil3" strokeWidth={1} strokeDasharray="2 4" />
          <Arrow a={c} b={{ x: c.x + R * r.ghost[0], y: c.y - R * r.ghost[1] }} cls="fg-op" width={2.2} head={head} dashed />
          <Label at={beyond({ x: c.x + R * r.ghost[0], y: c.y - R * r.ghost[1] }, { x: r.ghost[0], y: -r.ghost[1] }, 8).at} cls="fg-lbl" color="var(--fg-op)">
            after the mark
          </Label>
        </g>
      )}

      {/* Theorem 1's picture: a test vector, its image after mirror 1 and after mirror 2 */}
      {proof && (
        <g data-anchor="proof" className={f('proof')}>
          {(() => {
            const sub = proof.which === 'v1' ? '₁' : '₂'
            const same = Math.abs(proof.startDeg - proof.firstDeg) < 1e-9
            const P0 = at(c, proof.startDeg, R * 0.9)
            const P1 = at(c, proof.firstDeg, R * 0.9)
            const P2 = at(c, proof.secondDeg, R * 0.9)
            const lab = (p: Pt, deg: number, text: string) => {
              // a vector lying along the across axis would put its label on the axis's own; it goes just below the line, inside the circle
              const flat = Math.abs(Math.sin(deg * DEG)) < 0.14
              const b = flat ? { at: { x: c.x + R * 0.5, y: c.y + 16 }, anchor: 'start' as const } : beyond(p, { x: Math.cos(deg * DEG), y: -Math.sin(deg * DEG) }, 8)
              return (
                <Label at={b.at} anchor={b.anchor} cls="fg-lbl">
                  {text}
                </Label>
              )
            }
            return (
              <>
                <path d={arcPath(c, R * 0.42, proof.startDeg * DEG, proof.secondDeg * DEG)} fill="none" className="fg-sil" strokeWidth={1.8} />
                <Label at={at(c, (proof.startDeg + proof.secondDeg) / 2, R * 0.42 + 14)} anchor="middle" cls="fg-lbl">
                  {`2α = ${fix(r.stepDeg, 1)}°`}
                </Label>
                {!same && <Arrow a={c} b={P1} cls="fg-op" width={1.8} head={7} dashed />}
                <Arrow a={c} b={P0} cls="fg-state" width={2} head={8} />
                <Arrow a={c} b={P2} cls="fg-op" width={2.6} head={9} />
                {lab(P0, proof.startDeg, same ? `v${sub} = R₁v${sub}` : `v${sub}`)}
                {!same && lab(P1, proof.firstDeg, `R₁v${sub}`)}
                {lab(P2, proof.secondDeg, `R₂R₁v${sub}`)}
              </>
            )
          })()}
        </g>
      )}

      {/* the best whole number of steps: the arrow nearest straight up, and the target */}
      {r.readouts.includes('kopt') && (
        <g data-anchor="kopt">
          <line x1={c.x - 5} y1={c.y - R} x2={c.x + 5} y2={c.y - R} className="fg-sil" strokeWidth={2.4} />
          <circle cx={at(c, r.kopt.angleDeg, R).x} cy={at(c, r.kopt.angleDeg, R).y} r={5} fill="none" className="fg-sil" strokeWidth={1.8} />
          {/* where the arrow is the best arrow, its own label says so; otherwise the ring is named */}
          {Math.abs(r.kopt.angleDeg - r.angleDeg) > 0.5 && (
            <Label at={beyond(at(c, r.kopt.angleDeg, R), { x: Math.cos(r.kopt.angleDeg * DEG), y: -Math.sin(r.kopt.angleDeg * DEG) }, 12).at} cls="fg-lbl">
              {`k* = ${r.kopt.k}`}
            </Label>
          )}
        </g>
      )}

      {/* the state arrow and its vertical shadow (Theorem 1's picture is about test vectors, so it shows only those) */}
      {!proof && (
        <>
          <g data-anchor="shadow" className={f('shadow')}>
            <line x1={tip.x} y1={tip.y} x2={c.x} y2={tip.y} className="fg-sil" strokeWidth={1.1} strokeDasharray="3 3" />
            <line x1={c.x} y1={c.y} x2={c.x} y2={tip.y} className="fg-state" strokeWidth={5} opacity={0.55} strokeLinecap="round" />
            {Math.abs(sin) > 0.04 && (
              // on the side of the vertical axis away from the arrow, so the text never sits on the arrow
              <Label at={{ x: c.x + (r.arrow[0] >= 0 ? -7 : 7), y: (c.y + tip.y) / 2 + 4 }} anchor={r.arrow[0] >= 0 ? 'end' : 'start'} cls="fg-lbl">
                {`shadow ${fix(sin, 4)}`}
              </Label>
            )}
          </g>
          <g data-anchor="arrow" className={f('arrow')}>
            <Arrow a={c} b={tip} cls="fg-state" width={3.2} head={head + 2} />
            {(() => {
              const ux = Math.cos(r.angleDeg * DEG)
              const uy = -Math.sin(r.angleDeg * DEG)
              // near vertical the label goes to the left of the tip, clear of the up axis's own label on the right
              const near = Math.abs(ux) < 0.35 && uy < 0
              const b = near ? { at: { x: tip.x - 10, y: tip.y + 4 }, anchor: 'end' as const } : beyond(tip, { x: ux, y: uy }, 12)
              return (
                <Label at={b.at} anchor={b.anchor} cls="fg-txt">
                  {whole ? (r.k === 0 ? '|w₀⟩' : `k = ${Math.round(r.k)}${r.readouts.includes('kopt') && Math.abs(r.kopt.angleDeg - r.angleDeg) <= 0.5 ? ' = k*' : ''}`) : `k = ${fix(r.k, 2)}`}
                </Label>
              )
            })()}
          </g>
        </>
      )}
    </g>
  )
}
