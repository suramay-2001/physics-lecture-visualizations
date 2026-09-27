/**
 * The SG bench's fidelity note (D-lab §2.1 "Fidelity"), one click from the passport. Paraphrased, no source text.
 * ✓ Born fractions and honest samples · ≈ magnet, deflection and glow · ! magnets turn only about the beam, so there is
 * no y magnet (a |±y⟩ source is a sealed box). Checked by model.test.ts (every group filled, ids unique and distinct from
 * the lecture notes, TeX typesets).
 */
import type { Fidelity } from '../../../content/stage'

export const SG_FIDELITY: Fidelity = {
  exact: [
    {
      id: 'lab-sg-born',
      text: 'Every Born fraction is the engine’s: each magnet measures $S$ along its own direction $\\hat n$ and leaves the atom in $|{\\pm}\\hat n\\rangle$, the state of its outcome. “Passes” is the fraction of the atoms reaching a magnet that go on in its kept beam.',
    },
    {
      id: 'lab-sg-samples',
      text: 'Every count is an honest sample: each atom’s fate is drawn by the engine with a seeded random number, a new seed per volley, so small volleys scatter. The ± after a Born fraction is the scatter to expect in the fraction you saw, $\\sqrt{p(1-p)/N}$ for the $N$ atoms fired so far.',
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
      text: 'An atom’s colour is its last outcome (amber $+$, cobalt $-$; grey before the first magnet), not a label it carries for ever.',
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
      id: 'lab-sg-classical',
      text: 'Nothing here is a classical magnet: an atom never lands between the two spots, whatever the tilt.',
    },
  ],
}
