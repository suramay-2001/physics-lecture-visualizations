/**
 * The Operator Lab store: the DOM controls, drag handles and keyboard twins write the same parameters, and every
 * picture/readout is then the model's (engine) output.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { matEq } from '../../../physics/linalg'
import { SX, SZ } from '../../../physics/spin'
import { A_MAX, cellsOf, matrixOf, operatorModel, TAU_MAX, unitOf } from './model'
import {
  applyPreset,
  applySetup,
  dragHandle,
  nudgeHandle,
  opStore,
  reveal,
  setA0,
  setAk,
  setBasis,
  setCell,
  setPredict,
  setPsi0Named,
  setSn,
  setTau,
} from './store'

afterEach(() => opStore.reset())
const s = () => opStore.get()
const m = () => operatorModel(s())

describe('operator store', () => {
  it('presets set A from the engine and the unit; sliders move a₀ and a⃗ within range', () => {
    applyPreset('sz')
    expect(matEq(matrixOf(s()), SZ)).toBe(true)
    expect(unitOf(s())).toBe('hbar')
    applyPreset('proj-z')
    expect(unitOf(s())).toBe('none')
    setA0(9)
    expect(s().a0).toBe(3)
    setAk(0, 5)
    expect(Math.hypot(...s().a)).toBeLessThanOrEqual(A_MAX + 1e-12)
    expect(s().preset).toBeNull()
  })

  it('S_n follows its angles while it is the preset', () => {
    applyPreset('sn')
    setSn(90, 0)
    expect(matEq(matrixOf(s()), SX)).toBe(true)
  })

  it('typed cells: a good matrix is used at once; a bad cell keeps the last good matrix and reports the caret', () => {
    applyPreset('sx')
    setCell(0, 1, '-i')
    setCell(1, 0, 'i')
    expect(s().source).toBe('cells')
    expect(s().cellError).toBeNull()
    expect(m().hermitian).toBe(true)
    expect(m().a[1]).toBeCloseTo(1, 12) // [[0, −i], [i, 0]] = σ_y: a⃗ = ŷ
    const before = s().typed
    setCell(1, 1, '2 *')
    expect(s().cellError?.cell).toEqual([1, 1])
    expect(s().typed).toBe(before)
    // switching the basis rewrites the cells from the last good matrix and clears the error
    setBasis('x')
    expect(s().cellError).toBeNull()
    expect(s().cells[0][0]).toBe('0')
  })

  it('a drag of the tip, ψ₀ and the bead goes through the model; the tip scale is frozen for the drag', () => {
    applyPreset('sz')
    dragHandle('tip', 'start', [0, 0, 0.5])
    expect(s().frozenScale).toBe(1)
    dragHandle('tip', 'move', [2, 0, 0])
    expect(s().a).toEqual([2, 0, 0])
    expect(m().scale).toBe(1) // frozen, although |a⃗| = 2 > 1.5
    dragHandle('tip', 'end', null)
    expect(s().frozenScale).toBeNull()
    expect(m().scale).toBe(0.5)

    applyPreset('sz')
    dragHandle('psi0', 'move', [1, 0.01, 0])
    expect(s().psi0.named).toBe('+x')
    setTau(0)
    dragHandle('bead', 'move', [0, 1, 0])
    expect(s().tau).toBeCloseTo(Math.PI / 2, 12)
  })

  it('keyboard twins nudge the same parameters (Shift = fine)', () => {
    applyPreset('sz')
    nudgeHandle('tip', { axis: 0, dir: 1, fine: false })
    expect(s().a[0]).toBeCloseTo(0.05, 12)
    nudgeHandle('tip', { axis: 1, dir: -1, fine: true })
    expect(s().a[2]).toBeCloseTo(0.49, 12)
    setPsi0Named('+x')
    setTau(0)
    applyPreset('sz')
    nudgeHandle('bead', { axis: 0, dir: 1, fine: false })
    // S_z: |a⃗| = ½, so a 5° step of the turn is Δτ = 5°
    expect(s().tau).toBeCloseTo((5 * Math.PI) / 180, 12)
    nudgeHandle('psi0', { axis: 1, dir: 1, fine: false })
    expect(s().psi0.named).toBeNull()
    setTau(99)
    expect(s().tau).toBe(TAU_MAX)
  })

  it('Predict first: any change of A hides the results again', () => {
    setPredict(true)
    expect(m().pending).toBe(true)
    reveal()
    expect(m().pending).toBe(false)
    applyPreset('sy')
    expect(m().pending).toBe(true)
    reveal()
    dragHandle('tip', 'move', [0.3, 0, 0])
    expect(m().pending).toBe(true)
  })

  it('item 10: exact-form cells survive an edit of another cell (Hadamard: retype one entry, the class stays)', () => {
    applyPreset('hadamard')
    const H = matrixOf(s())
    // the cells show exact forms the parser reads back exactly
    expect(cellsOf(H, 'z')).toEqual([
      ['1/sqrt(2)', '1/sqrt(2)'],
      ['1/sqrt(2)', '-1/sqrt(2)'],
    ])
    setCell(1, 1, '-1/sqrt(2)')
    expect(s().source).toBe('cells')
    // the three untouched cells keep 1/√2 exactly; the retyped one reads 1/sqrt(2), one ulp from Math.SQRT1_2
    expect(matEq(matrixOf(s()), H, 1e-15)).toBe(true)
    expect(m().readouts.op.find((r) => r.key === 'class')!.text).toBe('Hermitian · unitary · squares to I')
    // a preset with no exact form (S_n at θ = 37°, in the y basis): an edit of one cell leaves the other three exact
    applyPreset('sn')
    setSn(37, 20)
    setBasis('y')
    const S = matrixOf(s())
    const shown = s().cells[0][0]
    setCell(1, 0, s().cells[1][0])
    expect(s().cells[0][0]).toBe(shown)
    // only the retyped cell is rounded (4 decimals): the matrix moves by < 1e-4, not by four rounded cells
    expect(matEq(matrixOf(s()), S, 1e-4)).toBe(true)
    expect(m().hermitian).toBe(false) // the retyped cell alone is rounded, so A is no longer exactly Hermitian…
    setCell(0, 1, s().cells[0][1])
    expect(m().hermitian).toBe(true) // …until its partner is retyped the same way
    // a bad cell elsewhere keeps the last good matrix; fixing it restores the exact values of the rest
    applyPreset('hadamard')
    setBasis('z')
    setCell(0, 0, '1/sqrt(')
    expect(s().cellError?.cell).toEqual([0, 0])
    setCell(0, 0, '1/sqrt(2)')
    expect(matEq(matrixOf(s()), H, 1e-15)).toBe(true)
  })

  it('item 7: the unit follows the operator: ħ for a spin preset, none after a drag, a slider or a typed cell', () => {
    applyPreset('sx')
    expect(unitOf(s())).toBe('hbar')
    dragHandle('tip', 'move', [0.3, 0.1, 0])
    expect(unitOf(s())).toBe('none')
    expect(JSON.stringify(m().readouts)).not.toMatch(/ħ/)
    applyPreset('sy')
    setAk(0, 0.2)
    expect(unitOf(s())).toBe('none')
    applyPreset('sz')
    setCell(0, 1, '2')
    expect(unitOf(s())).toBe('none')
    expect(JSON.stringify(m().readouts)).not.toMatch(/ħ/)
    applySetup('non-hermitian')
    expect(JSON.stringify(m().readouts)).not.toMatch(/ħ/)
    applyPreset('sz')
    expect(m().readouts.op.find((r) => r.key === 'lam+')!.text).toBe('λ₊ = +0.5 ħ')
  })

  it('item 6: while the results are hidden the display basis stays z (the eigenbasis would show A diagonal)', () => {
    applyPreset('sy')
    setBasis('y')
    expect(s().basis).toBe('y')
    setPredict(true)
    expect(s().basis).toBe('z')
    setBasis('y')
    expect(s().basis).toBe('z') // refused while pending
    reveal()
    setBasis('y')
    expect(s().basis).toBe('y')
    applyPreset('sy') // a new A under Predict first: hidden again, shown in z
    expect(m().pending).toBe(true)
    expect(s().basis).toBe('z')
    expect(m().readouts.op.find((r) => r.key === 'A-0')!.text).not.toMatch(/^\[ 1\/2/)
  })

  it('setups: sz-lap, commute-xy and the typed non-Hermitian matrix', () => {
    applySetup('sz-lap')
    expect(s()).toMatchObject({ preset: 'sz', tau: 0, B: null })
    expect(s().psi0.named).toBe('+x')
    applySetup('commute-xy')
    expect(s()).toMatchObject({ preset: 'sx', B: 'sy' })
    applySetup('non-hermitian')
    expect(s().source).toBe('cells')
    expect(m().hermitian).toBe(false)
  })
})
