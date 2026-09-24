import type { StageId } from './store'

/** Gate prose (original text; paraphrases no source). Rich syntax: $tex$, $$display$$, **bold**. */
export interface GateBeat {
  text: string
  caption: string
}
export interface GateSection {
  id: StageId
  eyebrow: string
  title: string
  passport: string
  passportNote: string
  beats: GateBeat[]
}

export const SECTIONS: GateSection[] = [
  {
    id: 'lab',
    eyebrow: 'Space 1 · the laboratory',
    title: 'A beam, a magnet, a plate',
    passport: 'PHYSICAL SPACE ℝ³ · metres',
    passportNote: 'schematic · not to scale',
    beats: [
      {
        text: `Silver atoms boil out of a hot oven and pass through a narrow slit, which trims them into a thin ribbon of a beam. Each atom carries one unpaired electron, so it behaves like a tiny bar magnet with moment $\\vec\\mu$. In a magnetic field its energy is
$$U = -\\vec\\mu\\cdot\\vec B .$$
Nothing about the oven picks a direction for $\\vec\\mu$: the atoms leave with their magnets pointing every which way.`,
        caption: 'The oven emits an unpolarized beam; the slit shapes it into a ribbon.',
      },
      {
        text: `The magnet is the clever part. Its upper pole is ground to a knife-edge and its lower pole carries a groove, so the field lines crowd together near the edge and spread out toward the groove. A uniform field would only twist the atoms; a field that **changes with height** pushes them:
$$\\vec F = \\nabla(\\vec\\mu\\cdot\\vec B) \\approx \\mu_z\\,\\frac{\\partial B_z}{\\partial z}\\,\\hat z .$$
The force is along $z$ and proportional to $\\mu_z$, the component of the moment along the gradient.`,
        caption: 'Looking down the beam line: knife-edge over groove, field lines crowding at the edge.',
      },
      {
        text: `Switch the gradient on. If $\\mu_z$ could take any value between $-|\\vec\\mu|$ and $+|\\vec\\mu|$, the beam would fan out into a continuous smear. It does not. It splits into exactly two beams, as if $\\mu_z$ — and with it the spin component $S_z$ — could take only two values:
$$S_z \\in \\left\\{+\\tfrac{\\hbar}{2},\\ -\\tfrac{\\hbar}{2}\\right\\}.$$
Amber marks the atoms recorded as $+$, cobalt those recorded as $-$.`,
        caption: 'Gradient on: one beam becomes two. Amber = + outcome, cobalt = − outcome.',
      },
      {
        text: `The plate keeps score. An atom that spends time $L/v$ in the magnet and then drifts a distance $D$ lands displaced by
$$\\Delta z = \\frac{\\mu_z}{2m}\\,\\frac{\\partial B_z}{\\partial z}\\left(\\frac{L}{v}\\right)^{2}\\left(1+\\frac{2D}{L}\\right).$$
Slow atoms deflect more than fast ones, so each spot is smeared vertically; atoms far from the knife-edge feel a weaker gradient, which bends each spot into a lip.`,
        caption: 'The deposit builds up as two separated lips, never a continuous band.',
      },
      {
        text: `Everything in this picture is a place. Its coordinates are lengths, measured in metres, and the arrows at the corner point along directions you could walk. The **state** of an atom is not in this picture. For the unpolarized oven beam each outcome is equally likely,
$$P(\\pm) = |\\langle \\pm z|\\psi\\rangle|^2 \\;\\to\\; \\tfrac12 ,$$
and where that $\\tfrac12$ lives is the subject of the next two spaces.`,
        caption: 'Two spots, equal weight: P(+) = P(−) = ½ for the oven beam.',
      },
    ],
  },
  {
    id: 'hopf',
    eyebrow: 'Space 2 · the state sphere, one dimension up',
    title: 'Global phase is a circle',
    passport: 'S³ · stereographic projection · not a place',
    passportNote: 'circles stay circles · distances distorted',
    beats: [
      {
        text: `A spin state is a pair of complex amplitudes $\\psi = (\\alpha, \\beta)$ with $|\\alpha|^2 + |\\beta|^2 = 1$. Writing $\\alpha = x_1 + i x_2$ and $\\beta = x_3 + i x_4$ turns that into
$$x_1^2 + x_2^2 + x_3^2 + x_4^2 = 1,$$
the unit sphere $S^3$ in four real dimensions. To see it we project stereographically from the point $(0,0,0,1)$:
$$\\vec p = \\frac{(x_1, x_2, x_3)}{1 - x_4}.$$
The states $e^{i\\chi}|{+z}\\rangle$ form the unit circle. The states $e^{i\\chi}|{-z}\\rangle$ pass through the projection point, so they become the vertical axis, a circle through infinity (drawn clipped at $|\\vec p| = 6$).`,
        caption: 'Two fibers: e^iχ|+z⟩ is the ring; e^iχ|−z⟩ is the vertical line through it.',
      },
      {
        text: `Multiply a state by a global phase and every probability stays the same. On the Bloch sphere nothing moves. In $S^3$ the point slides around a great circle, the **fiber** over that Bloch point:
$$\\psi(\\chi) = e^{i\\chi}\\left(\\cos\\tfrac{\\theta}{2},\\; e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\right),\\qquad 0 \\le \\chi < 2\\pi .$$
Scroll and watch the bright bead travel along its fiber while its point on the small sphere stays put.`,
        caption: 'The bead is e^iχ ψ: it moves along the fiber; its Bloch point (inset) does not.',
      },
      {
        text: `Now take every state with the same polar angle $\\theta$, a latitude circle on the Bloch sphere. Their fibers sweep out a torus. Each fiber is a round circle, and any two of them pass through each other like links of a chain. The latitude is fixed by
$$\\langle\\sigma_z\\rangle = \\cos\\theta = |\\alpha|^2 - |\\beta|^2 .$$`,
        caption: 'One latitude (θ = 70°) → a torus of linked circles.',
      },
      {
        text: `Add more latitudes and the tori nest inside one another, filling space around the vertical axis. The map that sends each fiber to its Bloch point is the Hopf map:
$$\\vec r = \\bigl(2\\,\\mathrm{Re}\\,\\alpha^*\\beta,\\; 2\\,\\mathrm{Im}\\,\\alpha^*\\beta,\\; |\\alpha|^2 - |\\beta|^2\\bigr).$$
Shading follows latitude, from white near $|{+z}\\rangle$ to silver near $|{-z}\\rangle$; hue is kept for measurement outcomes.`,
        caption: 'Five latitudes → nested tori. Brighter fibers lie nearer |+z⟩.',
      },
      {
        text: `What the picture gets right: stereographic projection sends circles to circles (or to a line, for the fiber through the projection point), so every fiber is drawn as a true circle and every pair still links exactly once. What it gets wrong: distances. In $S^3$ all fibers have the same length $2\\pi$; here fibers near the projection point look huge. None of this is a place in the laboratory.`,
        caption: 'Two highlighted fibers link exactly once — true for every pair.',
      },
    ],
  },
  {
    id: 'bloch',
    eyebrow: 'Space 3 · states, pure and mixed',
    title: 'Inside the Bloch ball',
    passport: 'STATE SPACE · Bloch ball · not a place',
    passportNote: 'axes: expectation values, not lab directions',
    beats: [
      {
        text: `Forget the phase and each pure state becomes one point on the surface of a ball. Its density operator is
$$\\rho = |\\psi\\rangle\\langle\\psi| = \\tfrac12\\bigl(I + \\vec r\\cdot\\vec\\sigma\\bigr),\\qquad |\\vec r| = 1 .$$
The arrow is $\\vec r$. Its components are the expectation values $\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle$ — numbers, not lengths.`,
        caption: 'A pure state: the arrow reaches the surface, |r| = 1.',
      },
      {
        text: `The oven does not prepare a pure state. Think of a mixture as a recipe: prepare $|{+n}\\rangle$ with probability $w_+$ and $|{-n}\\rangle$ with probability $w_-$. Then
$$\\rho = w_+|{+n}\\rangle\\langle{+n}| + w_-|{-n}\\rangle\\langle{-n}| = \\tfrac12\\bigl(I + (w_+ - w_-)\\,\\hat n\\cdot\\vec\\sigma\\bigr).$$
The two faint arrows are the ingredients; their brightness is their weight.`,
        caption: 'A recipe: |+n⟩ with weight w₊, |−n⟩ with weight w₋ (faint arrows).',
      },
      {
        text: `As the recipe grows less certain the point sinks inside the ball: $|\\vec r| = w_+ - w_-$. The purity tracks the same number,
$$\\mathrm{Tr}\\,\\rho^2 = \\tfrac12\\bigl(1 + |\\vec r|^2\\bigr),$$
equal to 1 on the surface and $\\tfrac12$ at the centre.`,
        caption: 'Less certain recipe → shorter arrow → lower purity.',
      },
      {
        text: `The oven beam sits at the very centre: $\\vec r = 0$ and $\\rho = I/2$. Every Stern–Gerlach axis then gives
$$P(\\pm \\hat m) = \\tfrac12\\bigl(1 \\pm \\hat m\\cdot\\vec r\\bigr) = \\tfrac12 ,$$
which is the 50/50 split on the plate in the first space.`,
        caption: 'The oven beam: r = 0, ρ = I/2, every axis gives ½ and ½.',
      },
      {
        text: `Many recipes, one state. Equal mixtures of $\\pm x$, of $\\pm y$, or of $\\pm n$ all give $\\rho = I/2$, and no measurement can tell them apart. The ball is a space of states, not a place: its centre is not a position in the magnet, and its radius is not a length.`,
        caption: 'Equal mixtures of ±x, ±y or ±n: the same ρ = I/2.',
      },
    ],
  },
]
