/**
 * The Operator Lab's fidelity note (D-lab §2.2 "Fidelity"), one click from either passport. Paraphrased, no source
 * text. Checked by model.test.ts (every item typesets; ids unique and distinct from the lecture fidelity ids).
 * P review (2026-09-27): D's "a unitary is never drawn as an arrow" was false (the Hermitian unitary (σx+σz)/√2 is a
 * preset and is drawn), so the item now says what is true: the turn U(τ) is not drawn in operator space (item 4).
 * The turn item carries ħ only for the spin presets (item 7); the gauge and the sphere items name what they leave out
 * (item 16: the gauge shows Re a₀; a lap can change the ket's sign and, with a₀, its phase).
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
      text: 'The bead is the engine’s $U(\\tau)\\psi_0$ with $U = e^{-i\\tau A}$. It turns about $\\hat a$ by exactly $2|\\vec a|\\tau$, right-handed, on the orbit shown. For the spin presets, which carry $\\hbar$, read $\\tau A/\\hbar$ and $2|\\vec a|\\tau/\\hbar$.',
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
      text: 'A non-Hermitian $A$ has complex $\\vec a$ or $a_0$. The silver outline shows only the real part of $\\vec a$, and the gauge only the real part of $a_0$; the readouts give the complex values and the exact eigenvalues.',
    },
  ],
  misleading: [
    {
      id: 'lab-op-global-phase',
      text: '**The sphere hides the global phase.** After one full turn the point is home, but the ket may have changed sign (and phase $e^{-ia_0\\tau}$): read the ket in the readouts.',
    },
    {
      id: 'lab-op-unitary',
      text: 'The turn $U(\\tau) = e^{-i\\tau A}$ is not drawn in operator space: in general its $\\vec a$ is complex, so it has no point there; the picture shows what it does. (A unitary that is also Hermitian, like $(\\sigma_x+\\sigma_z)/\\sqrt2$, is drawn like any operator.)',
    },
  ],
}
