/**
 * The SG bench's fidelity note (D-lab §2.1 "Fidelity"), one click from the passport. Paraphrased, no source text.
 * ✓ Born fractions and honest samples · ≈ magnet, deflection and glow · ! magnets turn only about the beam, so there is
 * no y magnet (a |±y⟩ source is a sealed box, and on this bench it counts exactly like the oven). Checked by
 * model.test.ts (every group filled, ids unique and distinct from the lecture notes, TeX typesets) and review.test.ts
 * (the P review's items: p defined where the scatter is first given, the colour line, the |±y⟩ line, the moment line,
 * sentences ≤ 25 words).
 */
import type { Fidelity } from '../../../content/stage'
import { MIXTURE_UNIT } from './model'

export const SG_FIDELITY: Fidelity = {
  exact: [
    {
      id: 'lab-sg-born',
      text: 'Every Born fraction is the engine’s. Each magnet measures $S$ along its own direction $\\hat n$ and leaves the atom in $|{\\pm}\\hat n\\rangle$, the state of its outcome. “Passes” is the fraction of the atoms reaching a magnet that go on in its kept beam.',
    },
    {
      id: 'lab-sg-samples',
      text: 'Every count is an honest sample: the engine draws each atom’s fate with a seeded random number, a new seed per volley. So small volleys scatter. The counted line gives the scatter to expect, $\\sqrt{p(1-p)/N}$, in percentage points (pt). Here $p$ is the spot’s Born fraction and $N$ the number of atoms fired so far.',
    },
    {
      id: 'lab-sg-plate',
      text: 'Each mark on the plate is one atom, in the spot of its last outcome. Counts are for the bench as it is now: changing the bench starts a fresh plate.',
    },
  ],
  schematic: [
    {
      id: 'lab-sg-deflection',
      text: 'Magnets, gaps and deflections are schematic and not to scale: real deflections are far smaller than drawn. The spots’ lip shape follows the gradient across the pole; their size is decoration.',
    },
    {
      id: 'lab-sg-flight',
      text: 'The atoms’ flight, their speed spread and their glow are decoration. A volley of 10 000 draws 2 000 atoms in flight; every atom lands and is counted. The plate draws at most 20 000 marks; the counts go on.',
    },
    {
      id: 'lab-sg-colour',
      text: 'An atom’s colour is the outcome of the last magnet it passed: amber $+$, cobalt $-$. The oven’s atoms are grey until they meet a magnet. A sealed box’s atoms leave in the colour of their sign, the outcome of the magnet that prepared them elsewhere.',
    },
    {
      id: 'lab-sg-prep',
      text: 'A $|{\\pm}z\\rangle$ or $|{\\pm}x\\rangle$ source is the oven and a grey magnet that prepares it. Only the atoms it lets through are fired and counted.',
    },
  ],
  misleading: [
    {
      id: 'lab-sg-about-beam',
      text: '**Magnets turn only about the beam**, like real ones, so every $\\hat n$ lies in the $x$–$z$ plane and no magnet here measures $S_y$. A $|{\\pm}y\\rangle$ source is a sealed box: those atoms were prepared elsewhere.',
    },
    {
      id: 'lab-sg-y-like-oven',
      text: `**On this bench a $|{\\pm}y\\rangle$ box gives exactly the oven’s counts.** Every $\\hat n$ here is at right angles to $\\pm\\hat y$, so the first magnet splits the atoms half and half. After it, the atom is in the state of its outcome either way. The box’s amber or cobalt atoms mark a difference no count here can show. This is the mixture point of ${MIXTURE_UNIT}: no $x$–$z$ measurement tells this pure state from the oven’s mixture.`,
    },
    {
      id: 'lab-sg-moment',
      text: 'For silver the magnetic moment points opposite to the spin, and which spot means $+\\tfrac{\\hbar}{2}$ depends on the sign of the field gradient. So “up” is a labelling choice. Here the $+$ outcome is always amber and lands along $+\\hat n$.',
    },
    {
      id: 'lab-sg-classical',
      text: 'Nothing here is a classical magnet: an atom never lands between the two spots, whatever the tilt.',
    },
  ],
}
