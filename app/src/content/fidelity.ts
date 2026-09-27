/**
 * Fidelity contracts: what each stage picture gets right, simplifies, or distorts on purpose
 * (owner: P after the l1-freeze tag). The passport's ⓘ opens `FIDELITY[passportOf(state).fidelityKey]`.
 *
 * Seeded by W from P2-L1-story §2, pasted as data. Edits by W: `code` references in parentheses were
 * removed (students do not read function names); `|+z⟩` became TeX. Ids are /^[a-z0-9-]+$/ and globally
 * unique (content test); a beat flags an item as "relevant now" with `Beat.fidelity: [id]`.
 * P edits: P1 §1 #14–#15 (gradient sign, 1922 lobes), D §4.0 (exaggerated deflections), decision #7
 * ("both paths" lives here, not in the core text), plane ↔ Bloch angle doubling, and the optical /
 * Poincaré variants from P2 §6.3. Every item is ≤ 25 words per sentence (content/symbols.test.ts).
 */
import type { Fidelity, FidelityKey } from './stage'

export const FIDELITY: { readonly [K in Exclude<FidelityKey, 'optical' | 'poincare'>]: Fidelity } = {
  'lab-r3': {
    exact: [
      {
        id: 'lab-born-fractions',
        text: 'The fraction of atoms reaching each spot, and each blocked fraction, is the exact quantum prediction. The counts come from genuinely random draws, so small runs scatter the way real ones do.',
      },
      {
        id: 'lab-tilt-real',
        text: 'A magnet’s tilt is the real angle used in the calculation. For spin ½, the magnet axis is also the direction of the state on the Bloch sphere.',
      },
      {
        id: 'lab-beam-along-y',
        text: 'The beam flies along y, so real magnets can point anywhere in the x–z plane. Measuring along y would mean turning the whole beam.',
      },
    ],
    schematic: [
      {
        id: 'lab-field-qualitative',
        text: 'The field lines are qualitative. A real field that varies along z must also vary sideways ($\\nabla\\cdot\\vec B = 0$), and we leave that out.',
      },
      {
        id: 'lab-not-to-scale',
        text: 'Distances, speeds and spot sizes are not to scale. Real atoms fly at hundreds of metres per second. The 1922 plate showed two smeared, lip-shaped marks, not round dots.',
      },
      {
        id: 'lab-deflections-exaggerated',
        text: 'Deflections are exaggerated, and each magnet is drawn sitting on the beam it receives. Real magnets are lined up with the beam.',
      },
      {
        id: 'lab-moment-opposite',
        text: 'For silver, the magnetic moment points opposite to the spin. Which spot means $S_z = +\\hbar/2$ depends on the sign of the field gradient, so “up” is a labelling choice. We always paint the + outcome amber.',
      },
    ],
    misleading: [
      {
        id: 'lab-glow-not-light',
        text: '**The beam glow is not light.** Silver atoms are neutral and invisible in flight. The glow only marks where atoms are, and nothing on stage shines on them.',
      },
      {
        id: 'lab-both-paths',
        text: 'We show each atom picking a beam inside the magnet. Strictly, until a plate or a beam stop records it, the atom’s state has amplitude in both beams at once.',
      },
      {
        id: 'lab-chips-captions',
        text: 'State chips like $|{+z}\\rangle$ float beside a beam as captions. The state is not located in the lab; it lives in state space.',
      },
      {
        id: 'lab-prepared-offstage',
        text: 'Some benches start with a beam already prepared along $x$ or $y$. Preparing a $y$ beam needs a magnet pointing along the beam itself, which this bench cannot hold, so the beam arrives ready-made.',
      },
      {
        id: 'lab-bar-magnets',
        text: 'Bar-magnet arrows appear only in the labelled “classical model” overlay. Real atoms have no arrow you could draw.',
      },
    ],
  },
  'hilbert-plane': {
    exact: [
      {
        id: 'plane-angles-true',
        text: 'For states with real coefficients, the angle between arrows is the true angle between state vectors. At right angles means perfectly distinguishable.',
      },
      {
        id: 'plane-shadow-born',
        text: 'The squared length of a state’s shadow on a basis arrow is exactly that outcome’s probability.',
      },
    ],
    schematic: [
      {
        id: 'plane-real-slice',
        text: 'This is a flat slice of a space with four real dimensions. States with complex coefficients, like $|{+y}\\rangle$, cannot appear here.',
      },
      {
        id: 'plane-no-complex-scalars',
        text: 'A real number stretches or flips an arrow here. A complex number such as $i$ turns the vector into directions this flat slice does not contain, though the state is unchanged.',
      },
      {
        id: 'plane-bloch-doubles',
        text: 'The Bloch sphere of Lecture 6 doubles these angles: arrows at right angles here become opposite points there.',
      },
    ],
    misleading: [
      {
        id: 'plane-sign-twice',
        text: '$|\\psi\\rangle$ and $-|\\psi\\rangle$ show up as two different arrows, but they are one physical state. Every state appears twice on the circle.',
      },
      {
        id: 'plane-half-angles',
        text: 'The arrows are not directions in the lab. “Right” sits at 45° here but at 90° in the lab: state-space angles are **half** of lab angles.',
      },
    ],
  },
  bloch: {
    exact: [
      {
        id: 'bloch-one-point',
        text: 'Every pure state is exactly one point on the sphere, and every point is a state. The point’s coordinates are the averages $(\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle)$.',
      },
      {
        id: 'bloch-born',
        text: 'For a state at $\\vec r$ and a magnet along $\\hat n$, $P(+) = \\tfrac{1+\\hat n\\cdot\\vec r}{2}$ holds exactly.',
      },
    ],
    schematic: [
      {
        id: 'bloch-equator-unit-circle',
        text: 'In Lecture 2’s top views, the equator seen from above is the unit circle of complex numbers. The state $(|{+z}\\rangle + c|{-z}\\rangle)/\\sqrt2$ sits at the angle of $c$, which is exact for numbers of size 1. Stretching is not shown.',
      },
      {
        id: 'bloch-axes-unitless',
        text: 'The axes are labelled $\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle$. They run from −1 to +1 and have no units.',
      },
    ],
    misleading: [
      {
        id: 'bloch-double-angle',
        text: '**Bloch angles are twice Hilbert-space angles.** Orthogonal states, like up and down, sit at opposite poles, 180° apart. As vectors they are only 90° apart.',
      },
      {
        id: 'bloch-global-phase-hidden',
        text: 'Global phase is invisible here by design: $|\\psi\\rangle$ and $e^{i\\gamma}|\\psi\\rangle$ land on the same point. The Hopf stage shows where that phase went.',
      },
      {
        id: 'bloch-not-lab-space',
        text: 'For spin ½, the sphere’s directions happen to match lab directions. For photon polarization they do not, so the sphere is not physical space in general.',
      },
    ],
  },
  'bloch-ball': {
    exact: [
      {
        id: 'ball-surface-pure',
        text: 'Points on the surface are pure states. Points inside are mixtures, and the centre is the completely unpolarized beam from the oven.',
      },
      {
        id: 'ball-born-inside',
        text: 'The distance $|\\vec r|$ from the centre measures how pure the state is. $P(+) = \\tfrac{1+\\hat n\\cdot\\vec r}{2}$ still holds exactly inside the ball.',
      },
    ],
    schematic: [
      {
        id: 'ball-many-recipes',
        text: 'An inside point can be made from many different recipes, for example half up plus half down, or half right plus half left. The ball shows only the point, because no measurement can tell those recipes apart.',
      },
    ],
    misleading: [
      {
        id: 'ball-inside-not-partly-up',
        text: '**Inside does not mean “partly up”.** A point halfway to the north pole is a beam, for example ¾ up and ¼ down. Every single atom still reads exactly $\\pm\\hbar/2$.',
      },
      {
        id: 'ball-direction-average',
        text: 'The direction of an inside point is not a direction any atom points. It is the average over the beam.',
      },
    ],
  },
  hopf: {
    exact: [
      {
        id: 'hopf-fiber-state',
        text: 'Each circle (fiber) is one physical state together with all its global phases $e^{i\\gamma}$. Different states give different circles that never touch, and any two circles link exactly once.',
      },
      {
        id: 'hopf-mini-exact',
        text: 'The small linked Bloch sphere is exact: each fiber sits over exactly one Bloch point.',
      },
    ],
    schematic: [
      {
        id: 'hopf-flattened',
        text: 'The true space $S^3$ is three-dimensional but curves through four dimensions. We flatten it into ordinary space by stereographic projection.',
      },
      {
        id: 'hopf-distances-distorted',
        text: '**That projection keeps circles as circles but distorts distances.** Fibers near the projection point look huge, and one fiber becomes a straight line. That fiber is not special: the choice of projection point is arbitrary.',
      },
    ],
    misleading: [
      {
        id: 'hopf-brightness',
        text: 'Brightness along the fibers only helps you tell them apart. Sliding along a fiber changes the global phase, and **no measurement can detect that change**.',
      },
    ],
  },
  'operator-space': {
    exact: [
      {
        id: 'op-one-point',
        text: 'Every 2×2 Hermitian matrix is exactly one choice of $(a_0, \\vec a)$. Its eigenvalues are $a_0 \\pm |\\vec a|$, and its eigenstates are the spin states along $\\pm\\hat a$.',
      },
      {
        id: 'op-sum',
        text: 'Adding two operators adds their arrows and adds their $a_0$ values.',
      },
    ],
    schematic: [
      {
        id: 'op-four-dimensions',
        text: '**The space has four dimensions.** We draw $\\vec a$ as a 3D arrow and show $a_0$ separately as a gauge, which is the fourth dimension.',
      },
      {
        id: 'op-ghost-sphere',
        text: 'The ghost Bloch sphere around the arrow belongs to state space. It is overlaid only so you can see the eigenstates.',
      },
    ],
    misleading: [
      {
        id: 'op-length-not-size',
        text: 'The arrow’s length $|\\vec a|$ is half the gap between the eigenvalues, not a physical size. For a spin component $S_n = \\tfrac{\\hbar}{2}\\hat n\\cdot\\vec\\sigma$, the arrow does point along the lab axis $\\hat n$. For a general operator it is not a lab direction.',
      },
      {
        id: 'op-a0-gauge',
        text: 'Changing $a_0$ shifts both eigenvalues together and leaves the eigenstates alone. That is why it gets a gauge rather than a direction.',
      },
    ],
  },
}

/**
 * Variants that change what the space is (L6 §6.3). Empty until P writes them (P2 §6.3); the content
 * test requires ≥ 1 item per list for any variant a beat actually uses.
 */
export const FIDELITY_VARIANT: { readonly optical: Fidelity; readonly poincare: Fidelity } = {
  optical: {
    exact: [
      {
        id: 'optical-full-angle',
        text: 'A polarizer at angle $\\chi$ to the light’s polarization passes the fraction $\\cos^2\\chi$. That is the full angle, not half of it as for spin.',
      },
      {
        id: 'optical-crossed',
        text: 'Crossed polarizers, 90° apart, block everything. A spin needs a magnet turned by 180° before the + spot stays empty.',
      },
    ],
    schematic: [
      {
        id: 'optical-not-to-scale',
        text: 'Beam widths, distances and filter sizes are not to scale.',
      },
    ],
    misleading: [
      {
        id: 'optical-steady-beam',
        text: 'We draw a steady glowing beam, but light arrives as photons. Each photon passes or is blocked whole; the fraction is a probability.',
      },
    ],
  },
  poincare: {
    exact: [
      {
        id: 'poincare-points',
        text: 'Every polarization of light is one point. Horizontal and vertical sit at the poles; diagonal and circular polarizations sit on the equator.',
      },
      {
        id: 'poincare-born',
        text: 'For light at $\\vec r$ and a polarizer state along $\\hat n$, the passing fraction is $\\tfrac{1+\\hat n\\cdot\\vec r}{2}$, as for spin.',
      },
    ],
    schematic: [
      {
        id: 'poincare-axes',
        text: 'The axes $S_1$, $S_2$, $S_3$ run from −1 to +1 and have no units. They are not directions in the lab.',
      },
    ],
    misleading: [
      {
        id: 'poincare-double-angle',
        text: '**A polarizer turned by $\\chi$ in the lab moves the point by $2\\chi$ on the sphere.** So the sphere maps states, not space.',
      },
    ],
  },
}

/** The drawer contents for a passport's fidelity key. */
export function fidelityOf(key: FidelityKey): Fidelity {
  return key === 'optical' || key === 'poincare' ? FIDELITY_VARIANT[key] : FIDELITY[key]
}
