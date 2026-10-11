/**
 * Chapter Q18 review cards: the exam layer in both tracks (P-Q18-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q18.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q18.values'

export const Q18_REVIEW: Record<string, ReviewCard> = {
  'q18-simon': {
    points: [
      'Reading the answer wires leaves the inputs in a pair $z$ and $z \\oplus s$.',
      `Hadamards then keep only the strings $y$ with $y \\cdot s = 0$, each with chance $${d(V.q18SimonYChance, 2)}$.`,
      'Each run gives one check. Independent checks add up to $n - 1$, never $n$.',
      `Two runs are enough with chance $${d(V.q18SimonTwoRuns, 3)}$, and on average it takes $${d(V.q18SimonExpRuns, 2)}$ runs for $n = 3$.`,
    ],
    equations: '2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle',
    trap: 'Asking for $n$ independent checks: the strings $y$ span only $n - 1$ dimensions, and $n$ independent checks would force $s = 000$.',
    claims: [claim('q18SimonYChance', 'each of the four strings has chance $0.25$', () => close(V.q18SimonYChance, 0.25, 1e-9))],
    formal: {
      points: [
        'Eqs. 7.30–7.33 (corrected): reading the answer leaves $(|z\\rangle + |z \\oplus s\\rangle)/\\sqrt2$, and $H^{\\otimes n}$ turns it into $2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle$.',
        'The strings read are uniform on $s^\\perp$, and $s$ is the nonzero element of the null space of $n - 1$ independent ones over $\\mathrm{GF}(2)$.',
        `The chance that $n - 1$ runs suffice is $\\prod_{k=1}^{n-1}(1 - 2^{-k})$, which is $${d(V.q18SimonTwoRuns, 3)}$ for $n = 3$; the expected number of runs grows like $n$.`,
      ],
      trap: 'Copying Bergou’s “$n$ independent equations” or the prefactor $2^{-(n+1)/2}$ of Eq. 7.33’s last line: both are slips.',
    },
  },
  'q18-qft': {
    points: [
      'The quantum Fourier transform $U_F$ is the Fourier transform of the register’s amplitudes: a table $F_8$ for three wires.',
      `It sends $|a\\rangle$ to an even spread of size $${d(V.q18Qft101Bar, 4)}$ whose turns grow by $a$ times $45°$ per string.`,
      'The spread is a product: wire $l$ carries the binary fraction of the last $l$ digits of $a$.',
      `Hadamards and controlled turns build it with $m(m+1)/2$ gates, ${V.q18QftGates10} at $m = 10$.`,
    ],
    equations: 'U_F|a\\rangle = 2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle',
    trap: 'Copying Bergou’s prefactor $2^{-m}$ on p. 127: the squared sizes would add to less than 1.',
    claims: [claim('q18Qft101Bar', 'each amplitude of $U_F|101\\rangle$ has size $0.3536$', () => close(V.q18Qft101Bar, 1 / Math.sqrt(8), 1e-9))],
    formal: {
      points: [
        'N&C Eq. 5.2 and Eq. 5.4: $U_F|a\\rangle = 2^{-m/2}\\sum_y e^{2\\pi iay/2^m}|y\\rangle = \\bigotimes_l(|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle)/\\sqrt2$.',
        'Fig. 5.1: H, controlled $R_k = P(2\\pi/2^k)$ and SWAPs give $\\Theta(m^2)$ gates against $\\Theta(m2^m)$ for the FFT.',
        `$U_F|0\\rangle = H^{\\otimes m}|0\\rangle$, but $U_F$ is not $H^{\\otimes m}$: the outputs differ by up to $${d(V.q18Qft001VsH, 4)}$ in an entry already at $|001\\rangle$.`,
      ],
      trap: 'Taking $ay$ for the bit dot product: here it is the ordinary product of the integers $a$ and $y$.',
    },
  },
  'q18-kickback': {
    points: [
      'A gate $U$ multiplies its special state $|u\\rangle$ by $e^{i\\varphi}$; the angle $\\varphi$, counted in full turns, is $\\tau$.',
      'Controlled-$U$ on a control in $|+\\rangle$ leaves the target alone and turns the control’s $|1\\rangle$ part by $\\varphi$.',
      'The powers $U$, $U^2$, $U^4$ shift the binary digits of $\\tau$ left, so the controls hold a quantum Fourier transform.',
      `For $\\tau = ${d(V.q18Tau, 3)}$ the controls turn $180°$, $90°$ and $225°$.`,
    ],
    equations: '(|0\\rangle + e^{2\\pi i2^j\\tau}|1\\rangle)/\\sqrt2',
    trap: 'Thinking the target records the phase: it stays exactly as it was.',
    claims: [claim('q18Tau', 'the running eigenphase is $0.625$ of a turn', () => V.q18Tau === 0.625)],
    formal: {
      points: [
        'Eq. 7.37: $2^{-m/2}\\bigotimes_j(|0\\rangle + e^{2\\pi i2^j\\tau}|1\\rangle)\\otimes|u\\rangle = 2^{-m/2}\\sum_y e^{2\\pi i\\tau y}|y\\rangle\\otimes|u\\rangle$.',
        'For $\\tau = a/2^m$ that is $U_F|a\\rangle\\otimes|u\\rangle$; the target is unentangled and plays no further role.',
        'The eigenvalue is $e^{i\\varphi} = e^{2\\pi i\\tau}$: for $\\tau = ' + d(V.q18Tau, 3) + '$ the controls turn $180°$, $90°$ and $225°$.',
      ],
      trap: 'Letting the target absorb the phase: after controlled-$U$ on an eigenstate the target is exactly as before.',
    },
  },
  'q18-phase-est': {
    points: [
      'Phase estimation runs the QFT backwards on the controls and reads them.',
      `When $\\tau$ has $m$ binary digits the reading is exact: 101 for $\\tau = ${d(V.q18Tau, 3)}$.`,
      `Otherwise the nearest answer still has chance at least $4/\\pi^2$, about $${d(V.q18FourOverPi2, 4)}$.`,
      `For $\\tau = \\tfrac13$ on three wires the reading is 011 with chance $${d(V.q18Pe13Best, 4)}$.`,
    ],
    equations: 'P(a) \\ge 4/\\pi^2',
    trap: 'Expecting more wires to make the best answer certain: for a phase that never ends in binary it stays near $0.68$.',
    claims: [
      claim('q18FourOverPi2', 'the floor is $4/\\pi^2 = 0.4053$', () => close(V.q18FourOverPi2, 4 / Math.PI ** 2, 1e-12)),
      claim('q18Pe13Best', 'the best reading for one third has chance $0.6878$', () => close(V.q18Pe13Best, 0.6878, 5e-5)),
      claim('q18Pe13Limit', 'and the limit is $0.68$', () => close(V.q18Pe13Limit, 0.68, 0.005)),
      claim('q18TauThird', 'one third of a turn is $0.3333$', () => close(V.q18TauThird, 1 / 3, 1e-12)),
      claim('q18Tau', 'the exact case is $0.625$ of a turn', () => V.q18Tau === 0.625),
    ],
    formal: {
      points: [
        'Eqs. 7.38–7.43: with $\\tau = a/2^m + \\delta$ the coefficient of $|a\\rangle$ is $2^{-m}(1 - e^{2\\pi i\\delta2^m})/(1 - e^{2\\pi i\\delta})$, of squared size at least $4/\\pi^2$.',
        `The worst case $\\delta = 2^{-(m+1)}$ gives $${d(V.q18PeWorst3, 4)}$, $${d(V.q18PeWorst4, 4)}$, $${d(V.q18PeWorst5, 4)}$ for $m = 3, 4, 5$.`,
        `N&C Eq. 5.35: $t = n + \\lceil\\log_2(2 + 1/(2\\varepsilon))\\rceil$ wires give $n$ correct bits with failure at most $\\varepsilon$; $n = 3$, $\\varepsilon = ${d(V.q18NcEps, 1)}$ needs $t = ${V.q18NcT}$.`,
      ],
      trap: 'Reading “$P \\ge 4/\\pi^2$” as the typical chance: it is the worst case, reached when $\\tau$ lies midway between two answers.',
    },
  },
  'q18-counting': {
    points: [
      'One Grover step $Q$ turns the plane by $2\\alpha$; its two special complex states get $e^{\\pm2i\\alpha}$.',
      'The start state is an even mix of both, so phase estimation reads one of the two turns, half the time each.',
      'The reading $a$ gives $\\alpha$ back and $M = N\\sin^2(\\pi a/2^m)$.',
      `Nothing marked reads 000 for certain; one marked still reads 000 with chance $${d(V.q18CntFalseEmpty, 4)}$.`,
    ],
    equations: 'M = N\\sin^2(\\pi a/2^m)',
    trap: 'Reading the angle as $\\alpha/2\\pi$ of a turn: the eigenphases of $Q$ are $\\pm\\alpha/\\pi$.',
    claims: [claim('q18CntFalseEmpty', 'one marked item still reads 000 with chance $0.0469$', () => close(V.q18CntFalseEmpty, 0.0469, 5e-5))],
    formal: {
      points: [
        'Eq. 7.44: $Q = R(2\\alpha)$ on the plane, with eigenvalues $e^{\\pm2i\\alpha}$ and eigenvectors $|\\alpha_\\pm\\rangle = (|w_0\\rangle \\mp i|w_0^\\perp\\rangle)/\\sqrt2$.',
        '$|w_0\\rangle = (|\\alpha_+\\rangle + |\\alpha_-\\rangle)/\\sqrt2$, so the counting wires read $a_+/2^m \\approx \\alpha/\\pi$ or $a_-/2^m \\approx 1 - \\alpha/\\pi$ (the printed $\\alpha/2\\pi$ is a slip).',
        `For $N = 4$, $M = 2$ the readings are exactly 010 and 110, $${d(V.q18Cnt2, 1)}$ each.`,
      ],
      trap: 'Taking “zero means empty” as certain: with $M = 1$ it errs with chance $' + d(V.q18CntFalseEmpty, 4) + '$ at $m = 3$.',
    },
  },
  'q18-order': {
    points: [
      'The gate $U_x$ multiplies by $x$ mod $N$. Its eigenphases are $s/r$, with $r$ the order of $x$.',
      'The plain number $|1\\rangle$ is an even mix of all the eigenstates, so no special state is needed.',
      `Phase estimation reads some $s/r$; a continued fraction gives $r$ from the readings 5 and 27 of 32, with chance $${d(V.q18OrdSuccess5, 4)}$ per run.`,
      `Then $\\gcd(x^{r/2} \\pm 1, N)$ gives the factors ${V.q18OrdGcdMinus} and ${V.q18OrdGcdPlus} of 21.`,
    ],
    equations: 'U_x|u_s\\rangle = e^{2\\pi is/r}|u_s\\rangle',
    trap: 'Thinking you must first prepare an eigenstate $|u_s\\rangle$: preparing it would need $r$.',
    claims: [claim('q18OrdSuccess5', 'a run at five wires succeeds with chance $0.2295$', () => close(V.q18OrdSuccess5, 0.2295, 5e-5))],
    formal: {
      points: [
        'N&C Eqs. 5.36–5.39: $U_x|y\\rangle = |xy \\bmod N\\rangle$ has the eigenstates $|u_s\\rangle$ with eigenphases $s/r$; Eq. 5.44 gives $\\sum_s|u_s\\rangle/\\sqrt r = |1\\rangle$.',
        `With $t = 2L + 1 + \\lceil\\log_2(2 + 1/(2\\varepsilon))\\rceil$ wires each $s/r$ is read to $2L + 1$ bits; $t = 5$ succeeds with chance $${d(V.q18OrdSuccess5, 4)}$, $t = 11$ with $${d(V.q18OrdSuccess11, 4)}$.`,
        'Simon, period finding and order finding are hidden subgroup problems: a Fourier transform over $G$ samples labels $\\ell$ that satisfy a linear condition on $K$.',
      ],
      trap: 'Reading the order off one peak without the convergent test $x^q \\equiv 1$: a shared factor gives a divisor of $r$.',
    },
  },
}
