/**
 * Physics 709 Lecture 11 notes (N11), a full companion: section III.E (EPR and hidden labels, Bell's three-direction inequality and its
 * quantum numbers, Eqs. 3.37 to 3.44) and III.E.1 (the CHSH form, Tsirelson's bound, the experiments and the no-communication theorem,
 * Eqs. 3.45 to 3.47), printed pages 56 to 58 of the new edition. The prose paraphrases the notes in their Formal register and links the
 * Chapter Q10 units that teach each section. Every number is a claim under Chapter Q10's own key (ruling W12). The experiments are cited
 * by name, journal and year only.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, d, cBellAssignments, cBellDetViol, cBellLhs, cBellRatio, cBellRhs, cNotesS, cSingletBis, cSingletPar, cSingletPerp, cTsirelson } from '../Q10.values'

/** Bell's three directions on the two balls: a along +z, b along +x (a right angle from a), c halfway between (45 degrees from +z). */
const C_DIR = { thetaDeg: 45, phiDeg: 0 } as const
const SINGLET = { bell: 'Psi-' } as const

export const N11: Lecture = notesLecture({
  number: 11,
  title: 'EPR, Bell and CHSH',
  date: '2026-10-12',
  topics: [
    'the EPR argument and hidden labels',
    'Bell’s three-direction inequality',
    'the singlet against the bound',
    'the CHSH inequality and the notes’ angles',
    'Tsirelson’s bound and the experiments',
    'no communication',
  ],
  length: 'full',
  symbols: {
    '|\\cdot\\rangle': 'n11-epr:b1',
    '|S\\rangle': 'n11-epr:b1',
    '|01\\rangle': 'n11-epr:b1',
    '|10\\rangle': 'n11-epr:b1',
    '\\Psi': 'n11-epr:b1',
    '\\lambda': 'n11-epr:b2',
    'p': 'n11-epr:b2',
    '\\rho': 'n11-epr:b2',
    'A': 'n11-epr:b3',
    'a': 'n11-epr:b3',
    'B': 'n11-epr:b3',
    'b': 'n11-epr:b3',
    'P': 'n11-epr:b3',
    'd': 'n11-epr:b3',
    'c': 'n11-bell:b1',
    '\\pi': 'n11-numbers:b1',
    '\\theta': 'n11-numbers:b1',
    'D': 'n11-chsh:b2',
    'S': 'n11-chsh:b2',
    '\\theta_ab': 'n11-chsh:b3',
  },
  sections: [
    {
      id: 'n11-epr',
      label: '§III.E',
      title: 'EPR and hidden labels',
      pages: 'p. 56',
      summary: 'The EPR argument says quantum mechanics is incomplete, and a hidden label with a probability density would supply definite plus or minus one answers to each analyzer.',
      body: [
        {
          text: 'The Einstein–Podolsky–Rosen argument of 1935 does not claim that quantum mechanics is inconsistent. It claims that the theory is incomplete. Let a singlet decay into two spin-½ particles, in the state $|S\\rangle = (|01\\rangle - |10\\rangle)/\\sqrt2$, written $\\Psi^-$ in Chapter Q10; on p. 56 the notes spell it with spin-up and spin-down kets, as up-down minus down-up over the square root of two. Measuring the first spin fixes the second to be opposite, although no light signal could have carried the news in time. Einstein’s worry was locality: whatever settles the second outcome must already be in the second particle, so the theory must be completed by further variables (<<qc-q10-bell|Unit 10.4>>).',
        },
        {
          text: 'Bell’s plan starts from the proposed repair: let quantum mechanics describe only part of the state, with the rest stored in a [[qc-hidden-label|hidden label]] $\\lambda$ that is fixed at the moment the pair is made. Its values follow a probability density $p(\\lambda)$, non-negative and integrating to one, which is all the later steps need. The letter $p$ rather than $\\rho$ keeps the density matrices apart. The theories in question are local hidden-label theories, and the bound derived next holds for all of them; non-local ones, in which a label may respond to the distant setting, are not excluded (<<qc-q10-hidden|Unit 10.3>>).',
        },
        {
          text: 'Each outcome is plus or minus one, as in the Stern–Gerlach experiment, so such a theory supplies two answer functions, $A(a,\\lambda) = \\pm1$ for the analyzer along $a$ and $B(b,\\lambda) = \\pm1$ for the analyzer along $b$ (Eq. 3.37). In this notation $A$ cannot see $b$ and $B$ cannot see $a$, which is exactly what locality means. The singlet is perfectly anticorrelated at equal settings, so we also need $B(a,\\lambda) = -A(a,\\lambda)$ (Eq. 3.38). Eliminating $B$ then gives the predicted correlation $P(a,b) = -\\int d\\lambda\\,p(\\lambda)A(a,\\lambda)A(b,\\lambda)$ (Eq. 3.39), where $P$ is a correlation in $[-1, 1]$, not a probability (<<qc-q10-hidden|Unit 10.3>>).',
        },
      ],
    },
    {
      id: 'n11-bell',
      label: '§III.E',
      title: 'Bell’s inequality',
      pages: 'p. 57',
      summary: 'Subtracting two correlations and inserting a square equal to one gives a bound that every local hidden-label theory must obey, whatever its density and its answer functions.',
      body: [
        {
          text: 'The aim is a bound on how much two correlations can differ. Bring in a third direction $c$ and subtract $P(a,c)$ from $P(a,b)$ (Eq. 3.40). Both terms contain $A(a,\\lambda)$ times an answer for $b$ or $c$, and since $A(b,\\lambda)^2 = 1$ the second term may be multiplied by that square. This single insertion turns the difference into one product times a bracket of known sign, $-\\int d\\lambda\\,p(\\lambda)\\,[1 - A(b,\\lambda)A(c,\\lambda)]\\,A(a,\\lambda)A(b,\\lambda)$ (Eq. 3.41). In Sakurai’s version the label is simply the triple of predetermined answers for the three directions, which leaves 8 cases to add up instead of an integral (<<qc-q10-bell|Unit 10.4>>).',
          figure: {
            stage: { kind: 'bits', grid: { rows: ['000', '001', '010', '011', '100', '101', '110', '111'] } },
            caption: 'The eight triples of predetermined answers for the three directions, with 0 standing for plus one and 1 for minus one.',
          },
          claims: [cBellAssignments],
        },
        {
          text: 'Two facts finish the argument. The bracket $1 - A(b,\\lambda)A(c,\\lambda)$ is never negative, being 0 when the stored answers for $b$ and $c$ agree and 2 when they differ, and the product $A(a,\\lambda)A(b,\\lambda)$ has size at most one. Dropping that product gives Bell’s inequality $|P(a,b) - P(a,c)| \\le 1 + P(b,c)$ (Eq. 3.42). Its right side is the average of the bracket, because Eq. 3.39 applied to $b$ and $c$ gives $\\int d\\lambda\\,p(\\lambda)[1 - A(b,\\lambda)A(c,\\lambda)] = 1 + P(b,c)$, twice the chance that the answers differ. Nothing about $p$ was used, so every local hidden-label theory obeys the bound, and the eight triples confirm that none breaks it (<<qc-q10-bell|Unit 10.4>>).',
          claims: [cBellDetViol],
        },
      ],
    },
    {
      id: 'n11-numbers',
      label: '§III.E',
      title: 'The singlet against the bound',
      pages: 'p. 57',
      summary: 'For three coplanar directions with a right angle between the first two, the singlet gives a left side more than twice the allowed right side.',
      body: [
        {
          text: `Is the bound respected by the singlet? Place the directions in a plane, with $b$ a quarter turn from $a$ and $c$ halfway between them, so that the angles are $\\pi/2$, $\\pi/4$ and $\\pi/4$. The notes pick this triple, and it is enough to break the bound. For the singlet $P = -\\cos\\theta$, so the right angle gives $P(a,b) = ${d(Math.abs(V.q10SingletPerp), 0)}$, the two half angles give $P(a,c) = P(b,c) = -1/\\sqrt2$ (Eq. 3.43), and parallel directions give $-${d(Math.abs(V.q10SingletPar), 0)}$ (<<qc-q10-bell|Unit 10.4>>).`,
          figure: {
            stage: {
              kind: 'two-qubit',
              source: { ket: SINGLET },
              labels: 'A-B',
              arrows: 'reduced',
              grid: 'T',
              axes: { a: ['+z', C_DIR], b: ['+x', C_DIR] },
              shot: 'TQ-PAIR',
            },
            caption: 'The singlet with the three directions drawn on the two balls: $a$ at the pole of the first ball, $b$ a right angle away on the second, and $c$ halfway between them on both.',
          },
          claims: [cSingletPerp, cSingletPar, cSingletBis],
        },
        {
          text: `The two sides of Eq. 3.42 then read ${d(V.q10BellLhs, 4)} on the left and ${d(V.q10BellRhs, 4)} on the right (Eq. 3.44). The left side is not below the right side, and it is larger by a factor of ${d(V.q10BellRatio, 3)}, more than two. No local hidden-label theory can therefore reproduce the singlet correlations: they are too strong to be explained by answers decided at the source. Hidden labels that respond to the distant setting are not excluded by this argument (<<qc-q10-bell|Unit 10.4>>).`,
          claims: [cBellLhs, cBellRhs, cBellRatio],
        },
      ],
    },
    {
      id: 'n11-chsh',
      label: '§III.E.1',
      title: 'The CHSH form',
      pages: 'pp. 57–58',
      summary: 'Two settings per side remove the third direction and the perfect anticorrelation, and bound the CHSH score between minus two and two for every local hidden-label theory.',
      body: [
        {
          text: 'Real apparatus never delivers the exact anticorrelation that Bell’s inequality assumes. Clauser, Horne, Shimony and Holt therefore dropped it together with the third direction. Give each side a choice of two settings: $a$ and $a\'$ for the first particle, $b$ and $b\'$ for the second, with the same functions $A$ and $B$ and density $p$. Each of the four correlations is measured in its own run. Abbreviate $A = A(a,\\lambda)$, $A\' = A(a\',\\lambda)$, $B = B(b,\\lambda)$ and $B\' = B(b\',\\lambda)$ (<<qc-q10-chsh|Unit 10.5>>).',
        },
        {
          text: 'Look at one value of $\\lambda$. Since $B$ and $B\'$ are each plus or minus one, either they are equal, and then $B - B\'$ is zero, or they are opposite, and then $B + B\'$ is zero. The combination $D = AB + AB\' + A\'B - A\'B\' = A(B + B\') + A\'(B - B\')$ therefore reduces to a single term of size two, so $D = \\pm2$ (Eq. 3.45). Averaging $D$ with the density $p$ cannot leave that range, so $-2 \\le S \\le 2$ for the score $S = P(a,b) + P(a,b\') + P(a\',b) - P(a\',b\')$ (Eq. 3.46) (<<qc-q10-chsh|Unit 10.5>>).',
        },
        {
          text: `Neither a third direction nor perfect anticorrelation is needed, and $p$ only has to be a density, which is why experiments test the CHSH form. Now compute the singlet score, using $P(a,b) = -\\cos\\theta_{ab}$ for coplanar directions. Put $a$ at 0, $a\'$ at $\\pi/2$, $b$ at $\\pi/4$ and $b\'$ at $-\\pi/4$. Three of the four angles are $\\pi/4$, the fourth is $3\\pi/4$, each term has size $1/\\sqrt2$, and the four add up to $S = -2\\sqrt2 \\approx -${d(V.q10Tsirelson, 2)}$ (Eq. 3.47). This lies outside the allowed range by a factor $\\sqrt2$, and other settings give any size from zero up to it (<<qc-q10-violation|Unit 10.6>>).`,
          figure: {
            stage: {
              kind: 'two-qubit',
              source: { ket: SINGLET },
              labels: 'A-B',
              arrows: 'reduced',
              grid: 'T',
              axes: { a: ['+z', '+x'], b: [C_DIR, { thetaDeg: 45, phiDeg: 180 }] },
              readouts: ['chsh'],
              shot: 'TQ-PAIR',
            },
            caption: 'The singlet with the four settings of the notes on its two balls, and the CHSH score the engine reads at those settings.',
          },
          claims: [cNotesS, cTsirelson],
        },
      ],
    },
    {
      id: 'n11-tsirelson',
      label: '§III.E.1',
      title: 'Tsirelson’s bound and the experiments',
      pages: 'p. 58',
      summary: 'The factor of the square root of two is the largest that quantum mechanics allows, and the measured correlations agree with the singlet formula.',
      body: [
        {
          text: `Can any state do better? Stronger correlations are logically possible without signalling, as the [[qc-pr-box|PR box]] of Chapter Q10 shows, but quantum mechanics stops at $|S| \\le 2\\sqrt2 \\approx ${d(V.q10Tsirelson, 2)}$, Tsirelson’s bound. The singlet at the four settings above therefore sits at the top of the quantum range, and the factor $\\sqrt2$ is no accident (<<qc-q10-violation|Unit 10.6>>).`,
          claims: [cTsirelson],
        },
        {
          text: 'The singlet formula of Eq. 3.36 has been confirmed in experiments, among them Aspect and coworkers (Physical Review Letters, 1982) and Weihs and coworkers (Physical Review Letters, 1998). Those tests choose the settings late, so that no influence travelling at or below the speed of light could carry the choice of one side to the other. The lesson is that no local hidden-label theory can produce correlations as strong as the quantum ones. Cloud quantum computers let a reader try the violation directly (<<qc-q10-violation|Unit 10.6>>).',
        },
      ],
    },
    {
      id: 'n11-no-signal',
      label: '§III.E.1',
      title: 'No communication',
      pages: 'p. 58',
      summary: 'The violation does not break the speed limit of relativity, because neither party can send a message through the correlations.',
      body: [
        {
          text: 'The violation does not contradict the speed limit of special relativity. Bob’s readings, taken alone, look like fair coin flips whatever Alice does, so no choice of hers can carry a message, and Alice’s own record shows nothing of Bob’s choice either. Only when the two logbooks are laid side by side does the correlation appear (<<qc-q10-no-signal|Unit 10.2>>).',
        },
        {
          text: 'In general, what one party measures cannot change the reduced state of the other, and this is the no-communication theorem. For the singlet, the reduced state of $B$ is the maximally mixed state whatever $A$ measures, because tracing out $A$ removes the choice of $A$ from it; a classical coin pair has the same reduced state, as Lecture 8 showed. So Bell correlations span the gap between the parties without carrying a message (<<qc-q10-no-signal|Unit 10.2>>).',
        },
      ],
    },
  ],
})
