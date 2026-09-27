/**
 * The lab's benches (decisions/lab.md #3, #7). The route `#/lab/:bench` accepts only these ids (an allowlist;
 * nothing else from the URL reaches the lab). `#/lab` opens the frame check, the empty measuring bench of the
 * foundation (axes, the six pole labels, the state bead and three GUI affordances). The four teaching benches are
 * listed in build order and marked `built: false` until each ships with its passport, fidelity note, engine-only
 * readouts, "try this" and a P truth review.
 */
export type BenchId = 'frame' | 'operator' | 'grapher' | 'sg' | 'ball'

export interface BenchInfo {
  id: BenchId
  /** Tab title. */
  title: string
  /** One line under the title. */
  blurb: string
  built: boolean
}

export const BENCHES: readonly BenchInfo[] = [
  { id: 'frame', title: 'Frame check', blurb: 'The Bloch sphere’s axes and one state, turned about z by the engine.', built: true },
  { id: 'operator', title: 'Operator Lab', blurb: 'An operator as an arrow and a gauge, and what it does to a state.', built: true },
  { id: 'grapher', title: 'Grapher', blurb: 'Plot your own functions: a surface, a curve, or a path on the Bloch sphere.', built: true },
  { id: 'sg', title: 'Stern–Gerlach bench', blurb: 'Build a chain of magnets and fire atoms through it.', built: false },
  { id: 'ball', title: 'Bloch ball', blurb: 'Pure and mixed states, measurement along any axis.', built: false },
]

/** `#/lab` → the frame check; `#/lab/<id>` → that bench; anything else → null (the page says so). */
export function benchFromParam(param: string | undefined): BenchInfo | null {
  if (param === undefined || param === '') return BENCHES[0]
  return BENCHES.find((b) => b.id === param && b.id !== 'frame') ?? null
}
