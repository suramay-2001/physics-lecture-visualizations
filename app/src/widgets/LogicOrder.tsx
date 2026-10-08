import { useRef, useState } from 'react'
import { rng } from '../physics/random'
import { fireAtom } from '../physics/sg'
import { WidgetFrame, pct } from '../ui/primitives'

/**
 * Lecture 1 / Susskind §1.5–1.7: prepare |+z⟩ and test "up OR right" two ways.
 * Order A (z then x): the z test says "up" every time → the OR is always true.
 * Order B (x then z): false exactly when the atom gives left and then down → 1/4 of the time.
 */
export interface LogicOrderProps {
  seed?: number
}

export function LogicOrder({ seed = 11 }: LogicOrderProps) {
  const rand = useRef(rng(seed))
  const [tallies, setTallies] = useState({ A: { t: 0, f: 0 }, B: { t: 0, f: 0 } })

  const run = (n: number) => {
    const next = { A: { ...tallies.A }, B: { ...tallies.B } }
    for (let i = 0; i < n; i++) {
      // Order A: measure z, then x. Proposition: z gave + OR x gave +.
      const a = fireAtom({ source: '+z', axes: ['z', 'x'], keep: ['+'] }, rand.current)
      const aTrue = a.path[0] === '+' || a.path[1] === '+'
      next.A[aTrue ? 't' : 'f']++
      // Order B: measure x, then z. Keep both branches: route whichever x result into the z device.
      const x = fireAtom({ source: '+z', axes: ['x'], keep: [] }, rand.current).path[0]
      const z = fireAtom({ source: x === '+' ? '+x' : '-x', axes: ['z'], keep: [] }, rand.current).path[0]
      next.B[x === '+' || z === '+' ? 't' : 'f']++
    }
    setTallies(next)
  }

  const row = (label: string, order: string, t: { t: number; f: number }) => {
    const n = t.t + t.f
    return (
      <div className="logic-row">
        <div>
          <span className="eyebrow">{label}</span>
          <p>{order}</p>
        </div>
        <div className="logic-bar" aria-label={`${label}: proposition true ${t.t} times, false ${t.f} times`}>
          <div className="bar ok-bar" style={{ flexBasis: n ? `${(t.t / n) * 100}%` : '50%' }}>true {n ? pct(t.t / n) : ''}</div>
          <div className="bar bad-bar" style={{ flexBasis: n ? `${(t.f / n) * 100}%` : '50%' }}>false {n ? pct(t.f / n) : ''}</div>
        </div>
      </div>
    )
  }

  return (
    <WidgetFrame title={'Is the spin "up OR right"?'}>
      <p>Every atom starts in |+z⟩. We check the proposition <strong>“the spin is up (along z) OR right (along x)”</strong> by doing both measurements, in one of two orders.</p>
      {row('Order A', 'Measure z first, then x', tallies.A)}
      {row('Order B', 'Measure x first, then z', tallies.B)}
      <div className="preset-row">
        <button className="btn" onClick={() => run(1)}>Test 1 atom each way</button>
        <button className="btn ghost" onClick={() => run(100)}>×100</button>
        <button className="btn ghost" onClick={() => run(1000)}>×1000</button>
        <button className="btn ghost" onClick={() => setTallies({ A: { t: 0, f: 0 }, B: { t: 0, f: 0 } })}>Clear</button>
      </div>
      <p className="widget-note">In Boolean logic, "P or Q" can't depend on which one you check first. Here it does, because the first measurement changes the state the second one sees.</p>
    </WidgetFrame>
  )
}
