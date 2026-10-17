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
          text: 'The Einstein–Podolsky–Rosen argument of 1935 does not claim that quantum mechanics is inconsistent. It claims that the theory is incomplete. Let a singlet decay into two spin-½ particles, in the state $|S\\rangle = (|01\\rangle - |10\\rangle)/\\sqrt2$, written $\\Psi^-$ in Chapter Q10. Measuring the first spin fixes the second to be opposite, although no light signal could have carried the news in time. Einstein’s worry was locality: whatever settles the second outcome must already be in the second particle, so the theory must be completed by further variables (<<qc-q10-bell|Unit 10.4>>).',
        },
        {
          text: 'The proposed repair was that quantum mechanics describes only part of the state. The rest is a [[qc-hidden-label|hidden label]] $\\lambda$, fixed when the pair is created and drawn with a probability density $p(\\lambda)$. The density is non-negative and integrates to one, which is all that the later steps use. We write $p$ and not $\\rho$ so that $\\rho$ stays free for density matrices. Bell derived a bound that all theories of this kind satisfy and that the quantum predictions break (<<qc-q10-hidden|Unit 10.3>>).',
        },
        {
          text: 'Stern–Gerlach outcomes are plus or minus one, so a hidden-label theory must supply two functions, $A(a,\\lambda) = \\pm1$ for the analyzer along the direction $a$ and $B(b,\\lambda) = \\pm1$ for the analyzer along $b$ (Eq. 3.37). Locality is built into the notation: $A$ does not depend on $b$, nor $B$ on $a$. Perfect anticorrelation at equal settings adds $B(a,\\lambda) = -A(a,\\lambda)$ (Eq. 3.38), and eliminating $B$ in favor of $A$ the predicted correlation is $P(a,b) = -\\int d\\lambda\\,p(\\lambda)A(a,\\lambda)A(b,\\lambda)$ (Eq. 3.39). Here $P$ is a correlation in $[-1, 1]$, not a probability (<<qc-q10-hidden|Unit 10.3>>).',
        },
      ],
    },
    {
      id: 'n11-bell',
      label: '§III.E',
      title: 'Bell’s inequality',
      pages: 'p. 57',
      summary: 'Subtracting two correlations and inserting a square equal to one gives a bound that every hidden-label theory must obey, whatever its density and its answer functions.',
      body: [
        {
          text: 'Introduce a third direction $c$ and subtract two correlations (Eq. 3.40). Because $A(b,\\lambda)^2 = 1$, a factor of unity can be inserted into the second term, and the insertion is the key step, because it turns a difference of two products into one product times a bracket of known sign. The difference becomes $-\\int d\\lambda\\,p(\\lambda)\\,[1 - A(b,\\lambda)A(c,\\lambda)]\\,A(a,\\lambda)A(b,\\lambda)$ (Eq. 3.41). In Sakurai’s version the label is simply the triple of predetermined answers for the three directions, which leaves 8 cases to add up instead of an integral (<<qc-q10-bell|Unit 10.4>>).',
          figure: {
            stage: { kind: 'bits', grid: { rows: ['000', '001', '010', '011', '100', '101', '110', '111'] } },
            caption: 'The eight triples of predetermined answers for the three directions, with 0 standing for plus one and 1 for minus one.',
          },
          claims: [cBellAssignments],
        },
        {
          text: 'The bracket in Eq. 3.41 is never negative, and it equals twice the chance that the stored answers for $b$ and $c$ differ. The product $A(a,\\lambda)A(b,\\lambda)$ has size at most one, so bounding that factor by one gives Bell’s inequality $|P(a,b) - P(a,c)| \\le 1 + P(b,c)$ (Eq. 3.42). It holds for every density $p$ and every pair of answer functions. Because the argument never uses the form of $p$, it rules out the whole class of such theories at once and not one model at a time. Checking the eight triples one by one confirms that none of them breaks it (<<qc-q10-bell|Unit 10.4>>).',
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
          text: `Quantum mechanics does not obey the bound. Take three coplanar directions with $a$ at a right angle to $b$ and $c$ halfway between them, so that the angles are $\\pi/2$, $\\pi/4$ and $\\pi/4$. This triple is the standard test because every correlation in it is easy to evaluate. The singlet correlation $-\\cos\\theta$ gives $P(a,b) = ${d(Math.abs(V.q10SingletPerp), 0)}$ for the right angle, $P(a,c) = P(b,c) = -1/\\sqrt2$ for the two half angles (Eq. 3.43), and $-${d(Math.abs(V.q10SingletPar), 0)}$ for parallel directions (<<qc-q10-bell|Unit 10.4>>).`,
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
            caption: 'The singlet with the directions drawn on the two balls: one at the pole, one a right angle away on the other ball, and the middle one halfway on both.',
          },
          claims: [cSingletPerp, cSingletPar, cSingletBis],
        },
        {
          text: `The two sides of Eq. 3.42 then read ${d(V.q10BellLhs, 4)} on the left and ${d(V.q10BellRhs, 4)} on the right (Eq. 3.44). The left side is not below the right side, and it is larger by a factor of ${d(V.q10BellRatio, 3)}, more than two. A hidden-label theory therefore cannot reproduce the singlet correlations: they are too strong to be explained by answers decided at the source (<<qc-q10-bell|Unit 10.4>>).`,
          claims: [cBellLhs, cBellRhs, cBellRatio],
        },
      ],
    },
    {
      id: 'n11-chsh',
      label: '§III.E.1',
      title: 'The CHSH form',
      pages: 'pp. 57–58',
      summary: 'Two settings per side remove the third direction and the perfect anticorrelation, and bound the CHSH score between minus two and two for every hidden-label theory.',
      body: [
        {
          text: 'No real apparatus delivers the exact anticorrelation that Bell’s inequality assumes. Four authors, Clauser, Horne, Shimony and Holt, dropped it together with the third direction. Let each side choose between two settings, $a$ and $a\'$ for the first particle and $b$ and $b\'$ for the second, and keep the functions $A$ and $B$ and the density $p$. Each of the four correlations is then measured in its own run. Write $A = A(a,\\lambda)$, $A\' = A(a\',\\lambda)$, $B = B(b,\\lambda)$ and $B\' = B(b\',\\lambda)$ (<<qc-q10-chsh|Unit 10.5>>).',
        },
        {
          text: 'For every $\\lambda$ the combination $D = AB + AB\' + A\'B - A\'B\' = A(B + B\') + A\'(B - B\')$ equals plus or minus two (Eq. 3.45), because $B$ and $B\'$ are each plus or minus one: one bracket vanishes and the other is plus or minus two. Averaging with the density $p$ cannot leave that range, so $-2 \\le S \\le 2$ for the score $S = P(a,b) + P(a,b\') + P(a\',b) - P(a\',b\')$ (Eq. 3.46) (<<qc-q10-chsh|Unit 10.5>>).',
        },
        {
          text: `The CHSH inequality asks for neither a third direction nor perfect anticorrelation, and $p$ need only be a density, which is why experiments test it. Other settings give any size from zero up to the value found below. For the singlet $P(a,b) = -\\cos\\theta_{ab}$. Place $a$ at 0, $a\'$ at $\\pi/2$, $b$ at $\\pi/4$ and $b\'$ at $-\\pi/4$. Three angles between a pair are then $\\pi/4$ and the fourth is $3\\pi/4$, and the score is $S = -2\\sqrt2 \\approx -${d(V.q10Tsirelson, 2)}$ (Eq. 3.47), outside the allowed range by a factor $\\sqrt2$. Each of the four terms has size $1/\\sqrt2$, and four of them add up to $2\\sqrt2$ (<<qc-q10-violation|Unit 10.6>>).`,
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
          text: `The extra factor $\\sqrt2$ is no accident. The value $2\\sqrt2 \\approx ${d(V.q10Tsirelson, 2)}$ is Tsirelson’s bound, the largest size that $|S|$ can reach in quantum mechanics, so the singlet at these four settings sits at the top of the quantum range. Larger values are logically possible without signalling, as the [[qc-pr-box|PR box]] of Chapter Q10 shows, yet no quantum state reaches them (<<qc-q10-violation|Unit 10.6>>).`,
          claims: [cTsirelson],
        },
        {
          text: 'Experiments agree with the singlet formula (Eq. 3.36), among them Aspect and coworkers (Physical Review Letters, 1982) and Weihs and coworkers (Physical Review Letters, 1998). Such tests choose the settings late, so that no influence slower than light could carry the choice of one side to the other. The moral is that quantum correlations are stronger than any local hidden-label theory can produce. Cloud quantum computers let a reader try the violation directly (<<qc-q10-violation|Unit 10.6>>).',
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
          text: 'The no-communication theorem states this in general: the reduced state of one party does not depend on what the other party measures. Bell correlations are therefore non-local without being faster than light. Lecture 8 gave the reason, since the reduced state of $B$ is the same for the singlet and for a classical coin pair. The reduced state alone is therefore enough to see that nothing can be sent (<<qc-q10-no-signal|Unit 10.2>>).',
        },
      ],
    },
  ],
})
