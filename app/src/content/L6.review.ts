/**
 * Lecture 6 review cards: the exam layer (owner: P; P-L6-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L6.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L6.values'

export const L6_REVIEW: Record<string, ReviewCard> = {
  'l6-bloch': {
    points: [
      'The Bloch vector is $\\vec r = \\tfrac{2}{\\hbar}(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle) = (2\\,\\mathrm{Re}\\,\\alpha^*\\beta,\\ 2\\,\\mathrm{Im}\\,\\alpha^*\\beta,\\ |\\alpha|^2 - |\\beta|^2)$.',
      'Every pure state has $|\\vec r| = 1$, so it lies on the surface of the unit sphere.',
      '$|{\\pm z}\\rangle$ sit at the poles; $|{\\pm x}\\rangle$ and $|{\\pm y}\\rangle$ sit on the equator.',
      `The coordinates are averages over many atoms. Each atom still reads $\\pm\\tfrac{\\hbar}{2}$; for the state of the story a $z$ magnet sends ${d(V.l6PzRule, 2)} of them up.`,
    ],
    equations: '\\vec r = \\tfrac{2}{\\hbar}\\big(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle\\big),\\qquad |\\vec r|^2 = (|\\alpha|^2 + |\\beta|^2)^2 = 1,\\qquad P(+\\hat n) = \\tfrac{1 + \\hat n\\cdot\\vec r}{2}',
    trap: 'Reading opposite points as opposite vectors. $|{-z}\\rangle$ is orthogonal to $|{+z}\\rangle$; the vector $-|{+z}\\rangle$ sits on the same pole as $|{+z}\\rangle$.',
    claims: [
      claim('l6UnitSphere', '|r| = 1 for every sampled state', () => close(V.l6UnitSphere, 1)),
      claim('l6SixPoints', 'the six named states land on the poles and the equator', () => V.l6SixPoints === 1),
      claim('l6PzRule', 'P(+z) = 0.75 for ψ★', () => close(V.l6PzRule, 0.75)),
      claim('l6ZOrth', '⟨+z|−z⟩ = 0', () => close(V.l6ZOrth, 0)),
      claim('l6NegSame', '−|+z⟩ is the same state as |+z⟩', () => V.l6NegSame === 1),
    ],
  },
  'l6-equator': {
    points: [
      'The four equatorial states all give 50/50 along $z$. They differ only in their relative phase: $1$, $i$, $-1$ or $-i$.',
      `$\\tfrac{1}{\\sqrt2}(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle)$ sits at longitude $\\varphi$. Halfway to $+y$, $\\langle S_x\\rangle = \\langle S_y\\rangle \\approx ${d(V.l6Avg45X)}\\,\\hbar$.`,
      'A common phase $e^{i\\chi}$ on both amplitudes moves nothing.',
      'An equatorial state is not an unpolarized beam: along its own axis every atom reads +.',
    ],
    equations: '|\\psi(\\varphi)\\rangle = \\tfrac{1}{\\sqrt2}\\big(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle\\big)\\;\\Rightarrow\\; \\vec r = (\\cos\\varphi, \\sin\\varphi, 0)',
    trap: 'Mixing up the notes’ letters with the app’s. The notes call the longitude θ; here θ is the polar angle, and the longitude is $\\varphi$.',
    claims: [
      claim('l6EqHalf', 'P(+z) = ½ for all four', () => close(V.l6EqHalf, 0.5)),
      claim('l6Avg45X', '⟨Sx⟩ = ⟨Sy⟩ = 0.354ħ halfway to +y', () => close(V.l6Avg45X, V.l6Avg45Y)),
      claim('l6GlobalSame', 'a common phase moves nothing', () => V.l6GlobalSame === 1),
      claim('l6PlusXAlongX', '|+x⟩ gives + along x every time', () => close(V.l6PlusXAlongX, 1)),
    ],
  },
  'l6-active': {
    points: [
      'A basis change rewrites coordinates (passive). $R_z(\\varphi)$ changes the state and keeps the basis (active).',
      'As a matrix, $B_{z\\leftarrow x}$ is $i$ times a half turn, but we use it passively.',
      '$R_z(\\varphi) = \\mathrm{diag}(e^{-i\\varphi/2}, e^{i\\varphi/2})$ turns the point by $\\varphi$, counterclockwise seen from $+z$ (for $\\varphi > 0$); $|{+x}\\rangle$ goes to $e^{-i\\pi/4}|{+y}\\rangle$ at $90^\\circ$.',
      '$R_z(0) = I$, $R_z$ is unitary, $R_z(-\\varphi) = R_z(\\varphi)^\\dagger$, and turns about one axis add.',
      `The averages turn like an ordinary arrow while $\\langle S_z\\rangle$ stays: along $y$, Lecture 4’s state goes from ${d(V.l6PyBefore, 2)} to ${d(V.l6PyAfter)} after $R_z(90^\\circ)$.`,
    ],
    equations: 'R_z(\\varphi) = \\begin{pmatrix}e^{-i\\varphi/2}&0\\\\0&e^{i\\varphi/2}\\end{pmatrix},\\quad \\begin{pmatrix}\\langle S_x\\rangle\'\\\\ \\langle S_y\\rangle\'\\end{pmatrix} = \\begin{pmatrix}\\cos\\varphi&-\\sin\\varphi\\\\ \\sin\\varphi&\\cos\\varphi\\end{pmatrix}\\begin{pmatrix}\\langle S_x\\rangle\\\\ \\langle S_y\\rangle\\end{pmatrix}',
    trap: 'Thinking the extra $e^{-i\\varphi/2}$ makes $R_z(\\varphi)|{+x}\\rangle$ a different state from $|\\psi(\\varphi)\\rangle$. It is an overall phase, so the physical state is the same.',
    claims: [
      claim('l6PassiveMeanX', 'a basis change moves no prediction', () => close(V.l6PassiveMeanX, V.l6PassiveMeanZ)),
      claim('l6BIsHalfTurn', 'B_{z←x} = i · (half turn about m̂)', () => V.l6BIsHalfTurn === 1),
      claim('l6Rz90xState', 'Rz(90°)|+x⟩ is |+y⟩ up to phase', () => V.l6Rz90xState === 1),
      claim('l6RzProps', 'the four properties of Rz', () => V.l6RzProps === 1),
      claim('l6PyBefore', 'P(+y) = 0.50 before …', () => close(V.l6PyBefore, 0.5)),
      claim('l6PyAfter', '… and 0.933 after Rz(90°)', () => close(V.l6PyAfter, (2 + Math.sqrt(3)) / 4)),
    ],
  },
  'l6-generator': {
    points: [
      'A matrix exponential is defined by its power series; for a diagonal matrix, exponentiate each diagonal entry.',
      '$R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$ exactly: $S_z$ is the generator of turns about $z$.',
      `For a small angle, $R_z(d\\varphi) \\approx I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi$; at a tenth of a radian the leftover is only ${d(V.l6LinErr01, 5)}.`,
      '$S_z$ says how the state starts to move, $\\tfrac{d\\psi_z}{d\\varphi} = -\\tfrac{i}{\\hbar}S_z\\psi_z$; $R_z(\\varphi)$ performs the whole turn.',
    ],
    equations: 'R_z(\\varphi) = \\exp\\!\\Big(-\\tfrac{i\\varphi}{\\hbar}S_z\\Big),\\qquad R_z(d\\varphi) = I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi + O(d\\varphi^2),\\qquad \\frac{d\\psi_z}{d\\varphi} = -\\tfrac{i}{\\hbar}S_z\\,\\psi_z',
    trap: `Dropping the $-i$. $I + S_z\\,d\\varphi/\\hbar$ changes lengths at first order: ${d(V.l6NoI, 2)} at a tenth of a radian. The $i$ keeps the small turn unitary to first order, with a Hermitian generator.`,
    claims: [
      claim('l6SeriesLimit', 'the series reaches Rz', () => V.l6SeriesLimit === 1),
      claim('l6ExpIsRz', 'e^{−iφSz} = Rz(φ)', () => V.l6ExpIsRz === 1),
      claim('l6LinErr01', 'leftover 0.00125 at dφ = 0.1', () => close(V.l6LinErr01, 0.0012499131968556475, 1e-12)),
      claim('l6NoI', 'without the i: length 1.05', () => close(V.l6NoI, 1.05)),
    ],
  },
  'l6-mixture': {
    points: [
      'A mixture is a point inside the Bloch ball: $\\vec r = \\sum_k w_k\\vec r_k$, where $w_k$ is the fraction of atoms prepared with Bloch vector $\\vec r_k$.',
      'The oven beam sits at the centre and gives ½ along every axis; $P(+) = \\tfrac{1 + \\hat n\\cdot\\vec r}{2}$ holds inside the ball too.',
      'Different recipes can give the same point, and then no experiment tells them apart.',
      `Mixing half $|{+z}\\rangle$ with half $|{+x}\\rangle$ gives $|\\vec r| = ${d(V.l6MixZXLen)}$ and a best $P(+)$ of ${d(V.l6ChCertain)}; their superposition reaches 1.`,
    ],
    equations: '\\vec r_{\\text{mix}} = \\sum_k w_k\\,\\vec r_k,\\qquad P(+\\hat n) = \\tfrac{1 + \\hat n\\cdot\\vec r}{2},\\qquad \\mathrm{tr}\\,\\rho^2 = \\tfrac{1 + |\\vec r|^2}{2}',
    trap: 'Calling $|{+x}\\rangle$ “half up, half down”. Along $z$ it looks that way, but along $x$ every atom reads +, while the half-and-half beam stays at 50/50.',
    claims: [
      claim('l6BallP60Oven', 'the oven gives ½', () => close(V.l6BallP60Oven, 0.5)),
      claim('l6RecipesP', '½ along every axis', () => close(V.l6RecipesP, 0.5)),
      claim('l6MixZXLen', '|r| = 0.707 for the mix', () => close(V.l6MixZXLen, Math.SQRT1_2)),
      claim('l6ChCertain', 'best P(+) = 0.854', () => close(V.l6ChCertain, (1 + Math.SQRT1_2) / 2)),
    ],
  },
}
