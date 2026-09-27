/**
 * The Operator Lab's fidelity note (D-lab §2.2 "Fidelity"), one click from either passport. Paraphrased, no source
 * text. Checked by model.test.ts (every item typesets; ids unique and distinct from the lecture fidelity ids).
 * D's line "a unitary is never an arrow" is worded as what the picture does: a unitary is not drawn as an arrow,
 * because in general it is not Hermitian (it can be: e^{−iπσ_x/2} times the phase i is σ_x).
 */
import type { Fidelity } from '../../../content/stage'

export const OPERATOR_FIDELITY: Fidelity = {
  exact: [
    {
      id: 'lab-op-arrow',
      text: 'The orchid arrow is $\\vec a$ of $A = a_0 I + \\vec a\\cdot\\vec\\sigma$, drawn to scale (a readout says when the scale is reduced). Its length $|\\vec a|$ is half the gap between the two eigenvalues.',
    },
    {
      id: 'lab-op-axis',
      text: 'The dashed line is the eigen-axis $\\pm\\hat a$. Its two ends, on the ghost sphere and on the Bloch sphere, are the eigenstates $|\\lambda_\\pm\\rangle$.',
    },
    {
      id: 'lab-op-gauge',
      text: 'The gauge shows $a_0$, the midpoint of the eigenvalues $a_0 \\pm |\\vec a|$ (amber and cobalt ticks). Changing $a_0$ moves both ticks and no eigenstate.',
    },
    {
      id: 'lab-op-turn',
      text: 'The bead is the engine’s $U(\\tau)\\psi_0$ with $U = e^{-i\\tau A/\\hbar}$. It turns about $\\hat a$ by exactly $2|\\vec a|\\tau/\\hbar$, right-handed, on the orbit shown.',
    },
    {
      id: 'lab-op-commutator',
      text: 'In commutator mode the dashed orchid arrow is $\\vec a\\times\\vec b$, the arrow of $[A, B]/2i$. It vanishes exactly when the arrows lie on one line: then $A$ and $B$ are compatible.',
    },
  ],
  schematic: [
    {
      id: 'lab-op-two-spaces',
      text: '**The two views share an orientation, not a space.** The left arrow is an operator and the right point is a state; one camera turns both so you can compare directions.',
    },
    {
      id: 'lab-op-four-d',
      text: 'Operator space has four dimensions: $\\vec a$ in 3D, and $a_0$ on a separate gauge.',
    },
    {
      id: 'lab-op-outline',
      text: 'A non-Hermitian $A$ has complex $\\vec a$ or $a_0$. The silver outline shows only the real part of $\\vec a$; the eigenvalues in the readouts are exact.',
    },
  ],
  misleading: [
    {
      id: 'lab-op-global-phase',
      text: '**The sphere hides the global phase.** After one full turn the point is home, but the ket may have changed sign: read the ket in the readouts.',
    },
    {
      id: 'lab-op-unitary',
      text: 'A unitary is never drawn as an arrow here. In general $U$ is not Hermitian, so operator space has no point for it; the picture shows what $U$ does, a turn.',
    },
  ],
}
