import { useState } from 'react'
import { type Vec, apply, dagger, matEq } from '../physics/linalg'
import { KET, SX, SY, SZ, basisMatrix, operatorInBasis, expectation, ketFromBloch } from '../physics/spin'
import { Segmented, Slider, WidgetFrame, num } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { texCol, texMat } from '../ui/texfmt'

export interface BasisTranslatorProps {
  target?: 'x' | 'y'
  mode?: 'state' | 'operator'
  operator?: 'Sx' | 'Sy' | 'Sz'
  theta?: number
  phi?: number
}

const OPS = { Sx: SX, Sy: SY, Sz: SZ }

/**
 * Lectures 5–6: the same state (and the same operator) written in two bases.
 * ψ_z = B_{z←x} ψ_x, ψ_x = B_{x←z} ψ_z = B_{z←x}† ψ_z, A^{(x)} = B_{x←z} A^{(z)} B_{z←x}.
 */
export function BasisTranslator({ target: t0 = 'x', mode: m0 = 'state', operator = 'Sz', theta = 60, phi = 0 }: BasisTranslatorProps) {
  const [target, setTarget] = useState(t0)
  const [mode, setMode] = useState(m0)
  const [op, setOp] = useState<keyof typeof OPS>(operator)
  const [th, setTh] = useState(theta)
  const [ph, setPh] = useState(phi)
  const basis: Vec[] = target === 'x' ? [KET['+x'], KET['-x']] : [KET['+y'], KET['-y']]
  const B = basisMatrix(basis) // B_{z←target}
  const Bd = dagger(B) // B_{target←z}
  const psiZ = ketFromBloch((th * Math.PI) / 180, (ph * Math.PI) / 180)
  const psiT = apply(Bd, psiZ)
  const A = OPS[op]
  const At = operatorInBasis(A, basis)
  const diagonal = Math.abs(At[0][1].re) + Math.abs(At[0][1].im) < 1e-9
  const same = matEq(B, Bd)
  const tt = target

  return (
    <WidgetFrame
      title="Same physics, new coordinates"
      wide
      readout={
        mode === 'state' ? (
          <div>
            <p className="small">Each entry of a column is an amplitude for one outcome of <em>that</em> basis's measurement.</p>
            <table className="readout-table mono">
              <tbody>
                <tr><th>P(±z)</th><td>{num(Math.hypot(psiZ[0].re, psiZ[0].im) ** 2)}, {num(Math.hypot(psiZ[1].re, psiZ[1].im) ** 2)}</td></tr>
                <tr><th>P(±{tt})</th><td>{num(Math.hypot(psiT[0].re, psiT[0].im) ** 2)}, {num(Math.hypot(psiT[1].re, psiT[1].im) ** 2)}</td></tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p className={diagonal ? 'ok' : ''}>
              {diagonal
                ? `Diagonal: the ${tt} basis is ${op}'s own eigenbasis, so the eigenvalues sit on the diagonal.`
                : `Not diagonal: the ${tt} basis is not ${op}'s eigenbasis.`}
            </p>
            <p className="mono small">⟨{op}⟩ in z coords = {num(expectation(A, psiZ))} ħ<br />⟨{op}⟩ in {tt} coords = {num(expectation(At, psiT))} ħ</p>
          </div>
        )
      }
    >
      <div className="preset-row">
        <Segmented label="What to translate" value={mode} onChange={setMode}
          options={[{ value: 'state', label: 'a state' }, { value: 'operator', label: 'an operator' }]} />
        <Segmented label="New basis" value={target} onChange={setTarget}
          options={[{ value: 'x', label: 'x basis' }, { value: 'y', label: 'y basis' }]} />
        {mode === 'operator' && (
          <Segmented label="Operator" value={op} onChange={setOp}
            options={[{ value: 'Sx', label: 'Sx' }, { value: 'Sy', label: 'Sy' }, { value: 'Sz', label: 'Sz' }]} />
        )}
      </div>
      <div className="translator">
        <Tex display>{`B_{z\\leftarrow ${tt}} = \\big(\\,|{+${tt}}\\rangle\\;\\; |{-${tt}}\\rangle\\,\\big)_z = ${texMat(B)}`}</Tex>
        <Tex display>{`B_{${tt}\\leftarrow z} = B_{z\\leftarrow ${tt}}^{\\dagger} = ${texMat(Bd)}`}</Tex>
        {mode === 'state' ? (
          <Tex display>{`\\psi_{${tt}} = B_{${tt}\\leftarrow z}\\,\\psi_z = ${texMat(Bd)}${texCol(psiZ)} = ${texCol(psiT)}`}</Tex>
        ) : (
          <Tex display>{`${op[0]}_{${op[1]}}^{(${tt})} = B_{${tt}\\leftarrow z}\\,${op[0]}_{${op[1]}}^{(z)}\\,B_{z\\leftarrow ${tt}} = \\tfrac{\\hbar}{2}${texMat(At.map((r) => r.map((z) => ({ re: 2 * z.re, im: 2 * z.im }))))}`}</Tex>
        )}
      </div>
      {mode === 'state' && (
        <div className="matrix-sliders">
          <Slider label={<Tex>{'\\theta'}</Tex>} value={th} min={0} max={180} step={5} onChange={setTh} format={(v) => `${v}°`} />
          <Slider label={<Tex>{'\\phi'}</Tex>} value={ph} min={-180} max={180} step={5} onChange={setPh} format={(v) => `${v}°`} />
        </div>
      )}
      {same && (
        <p className="widget-note">
          Here <Tex>{`B_{z\\leftarrow x}`}</Tex> and <Tex>{`B_{x\\leftarrow z}`}</Tex> happen to have the same entries. That's a coincidence of this basis, and switching to the y basis breaks it. Keep the arrows.
        </p>
      )}
    </WidgetFrame>
  )
}
