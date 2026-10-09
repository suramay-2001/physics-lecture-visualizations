/**
 * Widget W2 `polarization-dial` (448 Lecture 8): turn light, or an electron, by a lab angle and watch the lab and the Bloch sphere
 * side by side. Left: the lab (a photon's field line at the polarization angle; an electron's spin arrow in the x–z plane) with
 * the analyzer drawn over it. Right: the sphere's x–z great circle with the state's point and the analyzer's axis. The chances are
 * the engine's: the state is `Rpol(φ)` (a photon) or `electronTurn(φ)` (a spin) applied to the starting ket, the chance of the
 * aligned port is `prob()` of the analyzer's ket, and the point is the ket's own Bloch vector, so the doubling for light
 * (lab 45° → sphere 90°) and its absence for a spin are computed here, never drawn by hand (physics/polarization.ts).
 */
import { useMemo, useState } from 'react'
import { apply } from '../physics/linalg'
import { analyzerPorts, Rpol, electronTurn, polKet, photonSphereAngle } from '../physics/polarization'
import { blochVector, ketAlong, ketFromBloch, prob, tiltXZ } from '../physics/spin'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'
import { stageCssVars, STAGE_BG } from '../stage/tokens'
import '../stage/svg/svg.css'
import './polarizationDial.css'

export interface PolarizationDialProps {
  /** The starting angle in degrees: a photon's polarization from horizontal, or an electron's spin direction from +z toward +x (default 0). */
  chi?: number
  /** The analyzer's angle in degrees (default 0): a polarizer's angle, or a magnet's tilt. */
  analyzer?: number
  /** What is turned: 'photon' (default) or 'electron'. */
  carrier?: 'photon' | 'electron'
  /** false draws the picture only (no sliders, buttons or carrier switch). Default true. */
  editable?: boolean
}

const W = 540
const H = 296
const R = 92
const CL = { x: 135, y: 144 }
const CR = { x: 405, y: 144 }
const DEG = Math.PI / 180

/** Everything the picture and the readout show, from the engine (pure; the component only draws). */
export function dialModel(carrier: 'photon' | 'electron', chi0Deg: number, turnDeg: number, analyzerDeg: number) {
  const chi0 = chi0Deg * DEG
  const phi = turnDeg * DEG
  const ket0 = carrier === 'photon' ? polKet(chi0) : ketFromBloch(chi0, 0)
  const ket = apply(carrier === 'photon' ? Rpol(phi) : electronTurn(phi), ket0)
  const r = blochVector(ket)
  const r0 = blochVector(ket0)
  const chiA = analyzerDeg * DEG
  const aligned = carrier === 'photon' ? prob(polKet(chiA), ket) : prob(ketAlong(tiltXZ(chiA)), ket)
  const other = carrier === 'photon' ? analyzerPorts(chi0 + phi, chiA)[1] : prob(ketAlong(tiltXZ(chiA + Math.PI)), ket)
  // the angle the point has gone round the sphere: the engine's doubling for light, the turn itself for a spin (unwrapped)
  const sphereDeg = ((carrier === 'photon' ? photonSphereAngle(phi) : phi) * 180) / Math.PI
  // the analyzer's point on the sphere (its aligned port): a Bloch direction
  const aDir = carrier === 'photon' ? blochVector(polKet(chiA)) : tiltXZ(chiA)
  return { r, r0, aligned, other, sphereDeg, aDir, ket }
}

const f0 = (x: number): string => String(Math.round(x))
const pct = (p: number): string => `${(100 * p).toFixed(1)}%`

export default function PolarizationDial({ chi = 0, analyzer = 0, carrier: carrier0 = 'photon', editable = true }: PolarizationDialProps) {
  const [carrier, setCarrier] = useState<'photon' | 'electron'>(carrier0)
  const [turn, setTurn] = useState(0)
  const [chiA, setChiA] = useState(analyzer)
  const m = useMemo(() => dialModel(carrier, chi, turn, chiA), [carrier, chi, turn, chiA])
  const photon = carrier === 'photon'

  // lab pane: the field line (a photon) at the polarization angle from horizontal, or the spin arrow in the x–z plane
  const labAngle = (photon ? chi + turn : 90 - (chi + turn)) * DEG // screen angle, counter-clockwise from the right
  const labA = (photon ? chiA : 90 - chiA) * DEG
  const lab0 = (photon ? chi : 90 - chi) * DEG
  const at = (c: { x: number; y: number }, ang: number, len: number) => ({ x: c.x + len * Math.cos(ang), y: c.y - len * Math.sin(ang) })
  const pLab = at(CL, labAngle, R)
  const pLabNeg = at(CL, labAngle + Math.PI, R)
  // sphere pane: z up, x right; the point at Bloch (x, z)
  const sp = (v: readonly number[], len = R) => ({ x: CR.x + len * v[0], y: CR.y - len * v[2] })
  const pS = sp(m.r)
  const pS0 = sp(m.r0)
  const pA = sp(m.aDir)
  const pAneg = sp(m.aDir.map((x) => -x))
  // the arc round the sphere from the start to the state, the unwrapped way round (angle from +z toward +x)
  const b0 = Math.atan2(m.r0[0], m.r0[2])
  const arcEnd = b0 + (m.sphereDeg * DEG)
  const arcPts = Array.from({ length: 49 }, (_, i) => {
    const b = b0 + ((arcEnd - b0) * i) / 48
    return `${i ? 'L' : 'M'}${(CR.x + (R + 7) * Math.sin(b)).toFixed(1)},${(CR.y - (R + 7) * Math.cos(b)).toFixed(1)}`
  }).join(' ')
  const labs = photon ? ['H', 'V', 'D', 'A'] : ['+z', '−z', '+x', '−x']
  const flips = photon && Math.abs(turn % 360) > 0 && Math.abs(((turn % 360) + 360) % 360 - 180) < 1e-9

  return (
    <WidgetFrame
      title={photon ? 'Turn the light: lab and sphere' : 'Turn an electron: lab and sphere'}
      readout={
        <div className="pdial-readout">
          <p className="mono">
            lab turn {f0(turn)}° → sphere turn {f0(m.sphereDeg)}°
          </p>
          <table className="readout-table mono">
            <tbody>
              <tr><th>aligned port</th><td>P = {pct(m.aligned)}</td></tr>
              <tr><th>other port</th><td>P = {pct(m.other)}</td></tr>
            </tbody>
          </table>
          {flips && <p className="small">The arrow now points the other way, yet every chance is as before: {`|p(χ + 180°)⟩ = −|p(χ)⟩`} is the same polarization.</p>}
        </div>
      }
    >
      <svg className="svgk svgk-stage pdial-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('bloch') as React.CSSProperties} role="img"
        aria-label={`${photon ? 'Light' : 'An electron'} turned by ${f0(turn)} degrees in the lab; its point on the sphere has turned ${f0(m.sphereDeg)} degrees.`}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.bloch} rx={6} />
        {/* ----- lab ----- */}
        <text x={CL.x} y={20} textAnchor="middle" className="fg-lbl">{photon ? 'lab: the field line, beam out of the page' : 'lab: the spin direction'}</text>
        <circle cx={CL.x} cy={CL.y} r={R} fill="none" className="fg-sil2" strokeWidth={1.2} />
        <line x1={CL.x - R} y1={CL.y} x2={CL.x + R} y2={CL.y} className="fg-sil3" strokeWidth={0.8} strokeDasharray="2 4" />
        <line x1={CL.x} y1={CL.y - R} x2={CL.x} y2={CL.y + R} className="fg-sil3" strokeWidth={0.8} strokeDasharray="2 4" />
        {(() => {
          const a = at(CL, labA, R + 6)
          const b = at(CL, labA + Math.PI, R + 6)
          return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-sil" strokeWidth={2} strokeDasharray="6 4" data-part="analyzer" />
        })()}
        {(() => {
          const g = at(CL, lab0, R * 0.8)
          const gn = at(CL, lab0 + (photon ? Math.PI : 0), photon ? R * 0.8 : 0)
          return <line x1={gn.x} y1={gn.y} x2={g.x} y2={g.y} className="fg-sil" strokeWidth={1.4} strokeOpacity={0.6} data-part="start" />
        })()}
        {photon ? (
          <>
            <line x1={pLabNeg.x} y1={pLabNeg.y} x2={pLab.x} y2={pLab.y} className="fg-state" strokeWidth={3} strokeLinecap="round" data-part="state" />
            {/* the line itself has no direction; the head shows the sign of the state vector (it flips at 180°, the polarization does not) */}
            <polygon
              points={`${pLab.x},${pLab.y} ${at(pLab, labAngle + Math.PI - 0.32, 14).x},${at(pLab, labAngle + Math.PI - 0.32, 14).y} ${at(pLab, labAngle + Math.PI + 0.32, 14).x},${at(pLab, labAngle + Math.PI + 0.32, 14).y}`}
              className="fg-state-fill"
              data-part="head"
            />
            <circle cx={pLabNeg.x} cy={pLabNeg.y} r={3} className="fg-state-fill" />
          </>
        ) : (
          <>
            <line x1={CL.x} y1={CL.y} x2={pLab.x} y2={pLab.y} className="fg-state" strokeWidth={3} strokeLinecap="round" data-part="state" />
            <circle cx={pLab.x} cy={pLab.y} r={5} className="fg-state-fill" />
          </>
        )}
        <text x={CL.x} y={H - 8} textAnchor="middle" className="fg-lbl">{`lab turn ${f0(turn)}°`}</text>
        {/* ----- sphere ----- */}
        <text x={CR.x} y={20} textAnchor="middle" className="fg-lbl">sphere: the x–z great circle</text>
        <circle cx={CR.x} cy={CR.y} r={R} fill="none" className="fg-sil2" strokeWidth={1.2} />
        <line x1={CR.x - R} y1={CR.y} x2={CR.x + R} y2={CR.y} className="fg-sil3" strokeWidth={0.8} strokeDasharray="2 4" />
        <line x1={CR.x} y1={CR.y - R} x2={CR.x} y2={CR.y + R} className="fg-sil3" strokeWidth={0.8} strokeDasharray="2 4" />
        <text x={CR.x} y={CR.y - R - 6} textAnchor="middle" className="fg-lbl">{labs[0]}</text>
        <text x={CR.x} y={CR.y + R + 16} textAnchor="middle" className="fg-lbl">{labs[1]}</text>
        <text x={CR.x + R + 8} y={CR.y + 4} className="fg-lbl">{labs[2]}</text>
        <text x={CR.x - R - 8} y={CR.y + 4} textAnchor="end" className="fg-lbl">{labs[3]}</text>
        <line x1={pAneg.x} y1={pAneg.y} x2={pA.x} y2={pA.y} className="fg-sil" strokeWidth={1.4} strokeDasharray="5 4" data-part="analyzer-axis" />
        <circle cx={pA.x} cy={pA.y} r={3.5} className="fg-sil-fill" />
        <circle cx={pAneg.x} cy={pAneg.y} r={3.5} className="fg-sil-fill" />
        {Math.abs(m.sphereDeg) > 0.5 && <path d={arcPts} fill="none" className="fg-sil" strokeWidth={1.4} data-part="arc" />}
        <circle cx={pS0.x} cy={pS0.y} r={4} fill="none" className="fg-sil" strokeWidth={1.2} />
        <line x1={CR.x} y1={CR.y} x2={pS.x} y2={pS.y} className="fg-state" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={pS.x} cy={pS.y} r={5.5} className="fg-state-fill" data-part="point" />
        <text x={CR.x} y={H - 8} textAnchor="middle" className="fg-lbl">{`sphere turn ${f0(m.sphereDeg)}°`}</text>
      </svg>
      {editable && (
        <>
          <Segmented
            label="What is turned"
            value={carrier}
            onChange={(v) => {
              setCarrier(v)
              setTurn(0)
            }}
            options={[
              { value: 'photon', label: 'photon' },
              { value: 'electron', label: 'electron' },
            ]}
          />
          <div className="pdial-buttons">
            {[45, 90, 180].map((d) => (
              <button key={d} className="btn" onClick={() => setTurn(d)}>
                Turn {d}°
              </button>
            ))}
            <button className="btn ghost" onClick={() => setTurn(0)}>
              Back to 0°
            </button>
          </div>
          <Slider label="lab turn φ" value={turn} min={0} max={360} step={5} onChange={setTurn} format={(v) => `${v}°`} />
          <Slider label="analyzer angle" value={chiA} min={0} max={175} step={5} onChange={setChiA} format={(v) => `${v}°`} />
        </>
      )}
      <p className="widget-note">
        {photon
          ? 'For light the sphere turns twice as far as the lab: a turn of the light by φ moves its Bloch point by 2φ. An electron’s point moves by φ.'
          : 'For an electron the sphere turns exactly as far as the lab. Light turns it twice as far.'}
      </p>
    </WidgetFrame>
  )
}
