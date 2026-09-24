import type { Lecture } from './schema'
import { benchTheory, averageDeflection } from '../physics/sg'
import { KET, prob, probUpAlong, tiltXZ } from '../physics/spin'
import { URL } from './refs'

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

// Every number a learner sees in this lecture is computed here, then asserted in claims/tests.
const repeatZ = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
const zxz = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
const zMinusX = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '-'] })
const p45 = probUpAlong(tiltXZ(Math.PI / 4), [0, 0, 1])
const theta34 = (2 * Math.acos(Math.sqrt(0.75)) * 180) / Math.PI // P = cos²(θ/2) = 3/4
const avg45 = averageDeflection(45, 'z')

export const L1: Lecture = {
  id: 'L1',
  number: 1,
  title: 'Stern–Gerlach and the birth of the quantum state',
  date: 'Sep 2, 2026',
  outcomes: [
    'Predict what a chain of Stern–Gerlach magnets does to a beam of silver atoms.',
    'Explain why the results rule out little classical magnets, and why "revealing a hidden label" also fails.',
    'Say why the space of quantum states is a vector space, not a set.',
  ],
  prerequisites: [],
  watch: [
    { source: 'mit805', where: 'Lecture 3 (second half)', adds: 'Zwiebach walks through the real apparatus: why the field **gradient** deflects a magnetic moment, and what the two spots mean.', url: URL.mit805(3) },
    { source: 'tm-video', where: 'Lecture 1', adds: 'Susskind builds the same logic with an idealized box that only ever reads ±1.', url: URL.tmLecture1 },
    { source: '3b1b', where: 'Some light quantum mechanics', adds: 'Polarized light plays the role of spin here: filters instead of magnets, the same cos² rule.', url: URL.b3('light-quantum-mechanics') },
  ],
  corrections: [
    {
      where: 'L1 p.4',
      says: 'At 45°, 3/4 of the atoms go "up-right" and 1/4 "down-left".',
      shouldSay: `By the lecture's own N·M rule, P(+) = (1 + cos 45°)/2 = cos²(22.5°) ≈ ${p45.toFixed(3)}. A 3/4 : 1/4 split happens at 60°.`,
      check: () => close(p45, Math.cos(Math.PI / 8) ** 2) && close(theta34, 60, 1e-6),
    },
  ],
  units: [
    {
      id: 'l1-quantized',
      title: 'Two spots, not a smear',
      question: 'If spin is a tiny magnet, why does the beam split into exactly two spots?',
      lecture: {
        pages: 'L1 pp. 2–3',
        summary:
          'Silver atoms from an oven pass between shaped magnets whose field is stronger near one pole, so the force depends on which way each atom\'s magnetic moment points. Classically every orientation is possible, so the beam should spread into a continuous band. Instead only two deflections ever occur: one up, one down, by the same amount. Sending the up-beam through a second identical magnet gives "up" every time.',
        equations: ['S_z \\in \\{+\\tfrac{\\hbar}{2},\\; -\\tfrac{\\hbar}{2}\\}'],
      },
      books: [
        { source: 'susskind', where: '§1.2–1.3', adds: 'Replaces the magnet with an idealized apparatus that only ever displays $\\sigma = \\pm 1$, which strips the experiment down to its logic: two outcomes, and a repeated measurement gives the same answer.' },
        { source: 'bergou', where: '§1.1 The Qubit', adds: 'Names what you just found: a two-outcome quantum system is a **qubit**. The rest of the book builds quantum computing on exactly this object.' },
        { source: 'mit805', where: 'Lecture 3', adds: 'Derives the deflecting force $F = \\nabla(\\mu\\cdot B)$: a uniform field only twists the moment, and it takes a gradient to separate the beams.', url: URL.mit805(3) },
      ],
      visual: {
        kind: 'sg-lab',
        props: { axes: ['z'], editable: false },
        tryThis: [
          'Fire one atom at a time. Can you predict where the **next** one will land?',
          'Fire 1000. Where is the band that classical magnets would have painted?',
        ],
      },
      clues: [
        {
          ask: 'Suppose each atom is a little bar magnet pointing in a random direction. What does its vertical deflection depend on?',
          reveal: 'On the vertical component of its moment, $\\mu_z = \\mu\\cos\\theta$. Random directions give every value between $-\\mu$ and $+\\mu$, so the plate should show one continuous band.',
        },
        {
          ask: 'The plate shows two spots and nothing in between. Could the oven simply be making only "up" magnets and "down" magnets?',
          reveal: 'Test it: keep the up-beam and send it through a second z magnet. Every atom goes up again. So far a hidden "up/down label" explains everything.',
          show: { kind: 'sg-lab', props: { axes: ['z', 'z'], keep: ['+'], editable: false } },
        },
        {
          ask: 'A coin also has two outcomes. Is two-valuedness by itself proof of something quantum?',
          reveal: 'No, and the lecture makes this point. Discreteness is surprising for a magnet but not unheard of classically. The truly quantum surprise comes next, when we turn the magnet.',
        },
      ],
      insight:
        'A spin measurement along any axis has only two outcomes, $\\pm\\hbar/2$, and repeating the same measurement repeats the answer. So far that looks like reading a label. The next unit breaks the label picture.',
      pitfalls: ['Thinking two outcomes alone make it "quantum". A coin has two outcomes too.'],
      play: [
        {
          id: 'l1-q-classical',
          kind: 'choice',
          tier: 'warm-up',
          title: 'What would classical magnets do?',
          prompt: 'If the oven emitted tiny classical magnets pointing in uniformly random directions, what would the plate behind an SG$_z$ magnet show?',
          options: [
            { text: 'One continuous band from maximum-up to maximum-down deflection', correct: true, why: 'Right. The deflection tracks $\\mu\\cos\\theta$, which takes every value between $-\\mu$ and $+\\mu$.' },
            { text: 'Two spots, up and down', correct: false, why: 'That is what is actually observed, and it is exactly what classical physics cannot explain.' },
            { text: 'One spot in the middle, because random directions average out', correct: false, why: 'The **average** deflection is zero, but each atom is deflected by its own $\\mu_z$. You would see a band centred on zero, not a single spot.' },
          ],
          hints: [
            { text: 'Each atom is deflected by an amount proportional to its own $\\mu_z$.' },
            { text: 'If the direction is random, what values can $\\mu_z = \\mu\\cos\\theta$ take?' },
            { text: 'Every value between $-\\mu$ and $+\\mu$, so what does the plate collect?' },
          ],
          walkthrough: [
            { text: 'The force on a magnetic moment in a field gradient is proportional to the component of the moment along the gradient, here $\\mu_z = \\mu\\cos\\theta$.' },
            { text: 'Random orientations make $\\cos\\theta$ take every value in $[-1, 1]$, so the deflections fill a continuous range.' },
            { text: 'The classical prediction is therefore one smeared band. The experiment shows two spots, which is the first crack in the classical picture.', show: { kind: 'sg-lab', props: { axes: ['z'], editable: false } } },
          ],
        },
        {
          id: 'l1-q-repeat',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Measure twice',
          prompt: 'Oven → SG$_z$ (keep the + beam) → SG$_z$. Of the atoms that reach the plate, what fraction land in the **+** spot?',
          widget: { kind: 'sg-lab', props: { axes: ['z', 'z'], keep: ['+'], editable: false, predict: true } },
          answer: repeatZ.plus / (repeatZ.plus + repeatZ.minus),
          tolerance: 0.001,
          unit: 'fraction',
          hints: [
            { text: 'What state does the first magnet leave the kept atoms in?' },
            { text: 'After an $S_z = +\\hbar/2$ result the atom is in $|{+z}\\rangle$.' },
            { text: 'What is $|\\langle{+z}|{+z}\\rangle|^2$?' },
          ],
          walkthrough: [
            { text: 'The first SG$_z$ keeps only atoms that gave $+\\hbar/2$. After that result each atom is in $|{+z}\\rangle$.' },
            { text: 'The second SG$_z$ asks the same question again: $P(+) = |\\langle{+z}|{+z}\\rangle|^2 = 1$.' },
            { text: 'So **all** of them land in the + spot: fraction 1. Repeating a measurement repeats its result.' },
          ],
        },
      ],
      claims: [
        { text: 'z then z (keep +): every plate atom is +', holds: () => close(repeatZ.plus / (repeatZ.plus + repeatZ.minus), 1) },
      ],
    },
    {
      id: 'l1-sequential',
      title: 'A new axis erases the old answer',
      question: 'What happens when you measure along x an atom you already know is "up" along z?',
      lecture: {
        pages: 'L1 pp. 3–4',
        summary:
          'Route the up-beam into a magnet turned by 90°. If spin were a stored arrow pointing up, a left/right measurement should do nothing. Instead the atoms split left and right at random, 50/50. Keep the "right" beam and measure left/right again: all right. The atoms now behave as if they were "right", and a final z measurement is 50/50 again: the earlier "up" is gone.',
        equations: ['P(\\pm x \\mid {+z}) = \\tfrac12', 'P(\\pm z \\mid {+x}) = \\tfrac12'],
      },
      books: [
        { source: 'susskind', where: '§1.4 Experiments are never gentle', adds: 'The reset is a rule, not an accident: a measurement along x **prepares** an x state, so the z information cannot survive it.' },
        { source: 'mit805', where: 'Lecture 3', adds: 'Zwiebach runs the same three-magnet sequence and draws the conclusion you will formalize in Lecture 3: measurement changes the state.', url: URL.mit805(3) },
      ],
      visual: {
        kind: 'sg-lab',
        props: { axes: ['z', 'x', 'z'], keep: ['+', '+'], editable: true, showTheory: false },
        tryThis: [
          'With z → x → z, fire 1000 atoms. Does the last magnet remember that these atoms were once "up"?',
          'Remove the middle magnet. Now what does the last magnet see?',
          'Change the middle magnet to **tilt** and sweep the angle. When does the z memory survive best?',
        ],
      },
      clues: [
        {
          ask: 'An atom leaves the first magnet "up". If "up" were a stored arrow, what should an x measurement report?',
          reveal: 'An arrow pointing straight up has zero x component, so you might expect "no deflection". But there is no zero outcome: every atom goes left or right, 50/50.',
        },
        {
          ask: 'After the x magnet, keep the "right" atoms and measure x again. What happens?',
          reveal: 'All right, every time. The atoms now carry a definite x answer.',
          show: { kind: 'sg-lab', props: { axes: ['z', 'x', 'x'], keep: ['+', '+'], editable: false } },
        },
        {
          ask: 'Now measure z on those "right" atoms. Did they keep their original "up"?',
          reveal: 'No: 50/50 again. Acquiring a definite x answer destroyed the definite z answer. An atom cannot carry both labels at once.',
        },
      ],
      insight:
        'A measurement does two jobs: it reports a result and it **prepares** the state that matches that result. Measuring along a new axis therefore overwrites what the old axis told you. There is no hidden list of answers being read off.',
      pitfalls: [
        'Imagining the x measurement "reads" a pre-existing x value. The final z result shows it didn\'t just read; it rewrote.',
      ],
      play: [
        {
          id: 'l1-s-zxz',
          kind: 'numeric',
          tier: 'core',
          title: 'Follow the beam',
          prompt: 'Oven → SG$_z$ (keep +) → SG$_x$ (keep +) → SG$_z$. What fraction of **all atoms leaving the oven** end in the final + spot?',
          answer: zxz.plus,
          tolerance: 0.002,
          unit: 'of all atoms',
          hints: [
            { text: 'Multiply the probability of surviving each stage.' },
            { text: 'Oven → +z keeps 1/2. Then +z → +x keeps how much?' },
            { text: 'Then +x → +z at the last magnet is 50/50 again.' },
          ],
          walkthrough: [
            { text: 'The oven beam is unpolarized, so the first SG$_z$ passes half: $\\tfrac12$.' },
            { text: 'Those atoms are $|{+z}\\rangle$. The SG$_x$ passes $|\\langle{+x}|{+z}\\rangle|^2 = \\tfrac12$ of them, which leaves $\\tfrac14$ of the oven.' },
            { text: 'Now they are $|{+x}\\rangle$, and the last SG$_z$ sends $\\tfrac12$ to +. Total $\\tfrac12\\cdot\\tfrac12\\cdot\\tfrac12 = \\tfrac18$.', show: { kind: 'sg-lab', props: { axes: ['z', 'x', 'z'], keep: ['+', '+'], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-s-blocked',
          kind: 'numeric',
          tier: 'stretch',
          title: 'Where do they get stopped?',
          prompt: 'Oven → SG$_z$ (keep +) → SG$_x$ (keep **−**) → SG$_z$. What fraction of all oven atoms are stopped **at the second magnet**?',
          answer: zMinusX.blocked[1],
          tolerance: 0.002,
          unit: 'of all atoms',
          hints: [
            { text: 'First find what fraction even reaches the second magnet.' },
            { text: 'Half reach it, all in $|{+z}\\rangle$. Which of them does the second magnet block?' },
            { text: 'It keeps −x, so it blocks the +x outcome, which has probability $|\\langle{+x}|{+z}\\rangle|^2$.' },
          ],
          walkthrough: [
            { text: 'Half the oven atoms pass the first magnet as $|{+z}\\rangle$.' },
            { text: 'The second magnet lets −x through and blocks +x. $P(+x\\mid{+z}) = \\tfrac12$.' },
            { text: 'Stopped there: $\\tfrac12 \\times \\tfrac12 = \\tfrac14$ of the oven.' },
          ],
        },
        {
          id: 'l1-s-memory',
          kind: 'choice',
          tier: 'core',
          title: 'What does the atom remember?',
          prompt: 'An atom passes SG$_z$ (+), then SG$_x$ (+). What can you predict about a third, z, measurement?',
          options: [
            { text: 'It will give + again: the atom was up', correct: false, why: 'That is the classical "stored label" intuition. The x measurement prepared $|{+x}\\rangle$, which has no memory of z.' },
            { text: '+ or − with equal probability', correct: true, why: 'Right. The atom is now $|{+x}\\rangle$ and $|\\langle{\\pm z}|{+x}\\rangle|^2 = \\tfrac12$.' },
            { text: 'It will give 0, since up and right average out', correct: false, why: 'There is no 0 outcome. Every spin measurement gives $\\pm\\hbar/2$.' },
          ],
          hints: [
            { text: 'Which measurement happened **last** before the third one?' },
            { text: 'After an x result of +, what state is the atom in?' },
            { text: 'Expand $|{+x}\\rangle$ in the z basis and square the coefficients.' },
          ],
          walkthrough: [
            { text: 'The last measurement was x, with result +, so the atom is in $|{+x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + |{-z}\\rangle)$.' },
            { text: 'Both z coefficients have magnitude $1/\\sqrt2$, so each z outcome has probability $\\tfrac12$.' },
          ],
        },
      ],
      claims: [
        { text: 'z(+) → x(+) → z: 1/8 of oven atoms end in +', holds: () => close(zxz.plus, 1 / 8) },
        { text: 'z(+) → x(−): 1/4 of oven atoms stopped at magnet 2', holds: () => close(zMinusX.blocked[1], 1 / 4) },
        { text: '|+x⟩ is 50/50 along z', holds: () => close(prob(KET['+z'], KET['+x']), 0.5) },
      ],
    },
    {
      id: 'l1-average',
      title: 'Single atoms are random, averages are classical',
      question: 'If each atom is random, what does the tilt of the magnet actually control?',
      lecture: {
        pages: 'L1 p. 4',
        summary:
          'Tilt the second magnet to intermediate angles. Each atom still gives only + or −, but the split is no longer even. Repeating over many angles, the **average** deflection for atoms prepared along $\\hat m$ and measured along $\\hat n$ is $\\hat n\\cdot\\hat m$: exactly what a classical arrow would give, per atom. Individual results are random, and the randomness is tied to measurement: prepared "up" and measured along z you can predict every atom; measured along any other axis only the average.',
        equations: ['\\langle \\sigma_n \\rangle = \\hat n\\cdot\\hat m = \\cos\\theta', 'P(+) = \\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}'],
      },
      books: [
        { source: 'susskind', where: '§1.3', adds: 'Makes the same claim with his idealized apparatus: after preparing along $\\hat m$ and measuring along $\\hat n$, the average of many $\\pm1$ readings is $\\hat n\\cdot\\hat m$.' },
        { source: 'reif', where: '§1.2–1.4 (random walk, mean values)', adds: 'The statistics of many ±1 trials: the mean is predictable even though each trial is not, and the scatter shrinks like $1/\\sqrt N$.' },
        { source: '3b1b', where: 'Some light quantum mechanics', adds: 'The same $\\cos^2$ law for photons through tilted polarizers, with an animation of where the $\\cos^2$ comes from.', url: URL.b3('light-quantum-mechanics') },
      ],
      visual: {
        kind: 'sg-lab',
        props: { source: '+z', axes: [45], editable: true, predict: true },
        tryThis: [
          'Lock in a prediction for 45°, then fire 1000 atoms. Where does the plate settle?',
          'Find the tilt that gives a 3/4 : 1/4 split.',
          'At 90° the average is zero. Is any individual atom ever undeflected?',
        ],
      },
      clues: [
        {
          ask: 'If the outcomes are ±1 and the average must be $\\cos\\theta$, what must $P(+)$ be?',
          reveal: '$P(+)\\cdot(+1) + (1-P(+))\\cdot(-1) = \\cos\\theta$, so $P(+) = \\tfrac{1+\\cos\\theta}{2}$.',
        },
        {
          ask: 'Rewrite $\\tfrac{1+\\cos\\theta}{2}$ with a half-angle identity. What does it say?',
          reveal: '$\\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}$. The **half** angle will turn out to be the angle between state vectors in Hilbert space (Lecture 6).',
          show: { kind: 'bloch', props: { theta: 0, phi: 0, measure: 45, editable: true } },
        },
        {
          ask: 'The lecture says 3/4 of atoms go up-right at 45°. Check it with the formula.',
          reveal: `$\\cos^2(22.5^\\circ) \\approx ${p45.toFixed(3)}$, not $0.75$. A 3/4 split needs $\\cos\\theta = \\tfrac12$, which is $\\theta = 60^\\circ$. (See the errata note for this lecture.)`,
        },
      ],
      insight:
        'Quantum mechanics predicts **probabilities**, and their averages reproduce the classical projection $\\hat n\\cdot\\hat m$. What is classical is the average, not the individual atom. The rule $P(+) = \\cos^2(\\theta/2)$ carries a half-angle that points ahead to the geometry of state space.',
      pitfalls: ['Reading $\\langle\\sigma_n\\rangle = 0.7$ as "each atom is deflected by 0.7". No atom is; the average is.'],
      play: [
        {
          id: 'l1-a-45',
          kind: 'numeric',
          tier: 'core',
          title: 'The 45° magnet',
          prompt: 'Atoms prepared in $|{+z}\\rangle$ enter a magnet tilted 45° from z toward x. What is $P(+)$?',
          widget: { kind: 'sg-lab', props: { source: '+z', axes: [45], editable: false, predict: true } },
          answer: p45,
          tolerance: 0.005,
          unit: 'probability',
          hints: [
            { text: 'The average $\\langle\\sigma_n\\rangle$ is $\\hat n\\cdot\\hat m$.' },
            { text: 'Outcomes are ±1, so the average is $P(+) - P(-) = 2P(+) - 1$.' },
            { text: '$P(+) = (1 + \\cos 45^\\circ)/2$.' },
          ],
          walkthrough: [
            { text: 'Prepared along $\\hat z$, measured along $\\hat n$ at 45°: $\\hat n\\cdot\\hat z = \\cos 45^\\circ = 1/\\sqrt2$.' },
            { text: 'With outcomes ±1: $2P(+) - 1 = 1/\\sqrt2$, so $P(+) = \\tfrac12(1 + 1/\\sqrt2)$.' },
            { text: `That is $\\cos^2(22.5^\\circ) \\approx ${p45.toFixed(4)}$.`, show: { kind: 'sg-lab', props: { source: '+z', axes: [45], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-a-34',
          kind: 'numeric',
          tier: 'core',
          title: 'Dial in 3 : 1',
          prompt: 'At what tilt angle (degrees, from z) do atoms prepared in $|{+z}\\rangle$ split 3/4 : 1/4?',
          answer: theta34,
          tolerance: 0.6,
          unit: 'degrees',
          hints: [
            { text: 'Set $\\tfrac{1 + \\cos\\theta}{2} = \\tfrac34$.' },
            { text: 'So $\\cos\\theta = \\tfrac12$.' },
            { text: 'Which angle has cosine one half?' },
          ],
          walkthrough: [
            { text: '$\\tfrac{1+\\cos\\theta}{2} = \\tfrac34 \\Rightarrow \\cos\\theta = \\tfrac12 \\Rightarrow \\theta = 60^\\circ$.' },
            { text: 'Check on the bench: tilt the magnet to 60° and fire 1000 atoms.', show: { kind: 'sg-lab', props: { source: '+z', axes: [60], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-a-errata',
          kind: 'choice',
          tier: 'stretch',
          title: 'Spot the error',
          prompt: 'The notes say two things: (1) at 45°, 3/4 of the atoms go up-right; (2) the average deflection is $\\hat N\\cdot\\hat M$. Are they consistent?',
          options: [
            { text: 'Yes: $\\cos 45^\\circ \\approx 0.71$, which is close enough to 3/4', correct: false, why: 'That compares an **average** ($\\cos\\theta$) with a **probability**. They are different quantities: $P(+) = (1 + \\cos\\theta)/2$.' },
            { text: `No: (2) implies $P(+) = (1+\\cos 45^\\circ)/2 \\approx ${p45.toFixed(3)}$; 3/4 happens at 60°`, correct: true, why: 'Right. The averaging rule is the reliable one (it matches experiment and the theory you will build), and it fixes the 45° split at about 85 : 15.' },
            { text: 'No: at 45° it must be exactly 50/50', correct: false, why: '50/50 only happens at 90°, where $\\hat n\\cdot\\hat m = 0$.' },
          ],
          hints: [
            { text: 'Statement (2) is about an average; statement (1) is about a probability. Connect them.' },
            { text: 'With outcomes ±1, the average is $2P(+) - 1$.' },
            { text: 'Solve for $P(+)$ at $\\theta = 45^\\circ$ and compare with 0.75.' },
          ],
          walkthrough: [
            { text: 'Average of ±1 outcomes: $\\langle\\sigma\\rangle = P(+) - P(-) = 2P(+) - 1$.' },
            { text: `Set it equal to $\\cos 45^\\circ$: $P(+) = (1 + 0.7071)/2 \\approx ${p45.toFixed(4)}$.` },
            { text: 'That is not 0.75. The 3 : 1 split needs $\\cos\\theta = 1/2$, so $\\theta = 60^\\circ$. The likely slip: 60° and 45° swapped.' },
          ],
        },
        {
          id: 'l1-a-avg',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Average, not outcome',
          prompt: 'For the 45° magnet with $|{+z}\\rangle$ atoms, what is the **average** of the ±1 readings?',
          answer: avg45,
          tolerance: 0.005,
          hints: [
            { text: 'Use $\\langle\\sigma_n\\rangle = \\hat n\\cdot\\hat m$.' },
            { text: 'The angle between the axes is 45°.' },
            { text: '$\\cos 45^\\circ = ?$' },
          ],
          walkthrough: [
            { text: '$\\langle\\sigma_n\\rangle = \\hat n\\cdot\\hat z = \\cos 45^\\circ = 1/\\sqrt2 \\approx 0.707$. No single atom ever reads 0.707; each reads ±1.' },
          ],
        },
      ],
      claims: [
        { text: 'P(+) at 45° = cos²(22.5°)', holds: () => close(p45, Math.cos(Math.PI / 8) ** 2) },
        { text: '3/4 split at 60°', holds: () => close(theta34, 60, 1e-6) },
        { text: 'average at 45° = 1/√2', holds: () => close(avg45, Math.SQRT1_2) },
      ],
    },
    {
      id: 'l1-logic',
      title: 'When "or" depends on the order',
      question: 'Why can\'t quantum states be described by the Boolean logic of sets?',
      lecture: {
        pages: 'L1 pp. 4–5',
        summary:
          'Classical states form a set, and propositions about them combine with and, or, not: Boolean logic. Test the proposition "the spin is up **or** right" on atoms prepared up. Measure z first and the answer is always yes. Measure x first and then z: with probability 1/4 you get left and then down, and the proposition comes out false. The truth of "up or right" depends on the order of checking, which Boolean logic forbids.',
      },
      books: [
        { source: 'susskind', where: '§1.5–1.7 Propositions; testing classical and quantum propositions', adds: 'Susskind runs exactly this test with $\\sigma_z = +1$ and $\\sigma_x = +1$, and names the lesson: quantum propositions don\'t obey the rules of set logic.' },
        { source: 'sets', where: '§1.1–1.2', adds: 'The classical side made precise: union and intersection of sets are commutative ($A\\cup B = B\\cup A$). That symmetry is what fails here.' },
      ],
      visual: {
        kind: 'logic-order',
        tryThis: ['Test 1000 atoms each way. In which order is "up OR right" ever false?', 'Why can\'t order A ever produce "false"?'],
      },
      clues: [
        {
          ask: 'In order A (z first), what does the z measurement report for an atom prepared up?',
          reveal: 'Always "up". The proposition is already true, whatever x says afterwards.',
        },
        {
          ask: 'In order B (x first), what has to happen for "up OR right" to be false?',
          reveal: 'The x test must say "left" (probability 1/2), leaving the atom in $|{-x}\\rangle$; then the z test must say "down" (probability 1/2). Together: 1/4.',
        },
        {
          ask: 'Where exactly does the classical reasoning break?',
          reveal: 'Classically, checking a proposition doesn\'t change the system, so the order can\'t matter. Here the x measurement changes the state before z is checked.',
        },
      ],
      insight:
        'Propositions about a quantum system are tested by measurements, and measurements change the state. So "P or Q" is not a fixed fact to be read off. The state space can\'t be a set with Boolean logic, and that is what pushes us to vectors.',
      play: [
        {
          id: 'l1-l-false',
          kind: 'numeric',
          tier: 'core',
          title: 'How often is it false?',
          prompt: 'Atoms prepared in $|{+z}\\rangle$. Measure x first, then z. What fraction of atoms make "up OR right" **false**?',
          widget: { kind: 'logic-order' },
          answer: prob(KET['-x'], KET['+z']) * prob(KET['-z'], KET['-x']),
          tolerance: 0.002,
          unit: 'fraction',
          hints: [
            { text: 'False means "not right" AND "not up".' },
            { text: 'That is: x gives left, then z gives down.' },
            { text: 'Multiply $P(-x\\mid{+z})$ by $P(-z\\mid{-x})$.' },
          ],
          walkthrough: [
            { text: 'The proposition is false only if the atom is left on the x test and down on the z test.' },
            { text: '$P(-x\\mid{+z}) = \\tfrac12$, which leaves the atom in $|{-x}\\rangle$. Then $P(-z\\mid{-x}) = \\tfrac12$.' },
            { text: 'False with probability $\\tfrac14$, whereas in order A it is never false.' },
          ],
        },
        {
          id: 'l1-l-assumption',
          kind: 'choice',
          tier: 'warm-up',
          title: 'Which assumption failed?',
          prompt: 'Which classical assumption does this experiment break?',
          options: [
            { text: 'That a state is a list of answers that measurements merely reveal', correct: true, why: 'Right. If the answers were already there, checking order couldn\'t matter.' },
            { text: 'That "or" is commutative for numbers', correct: false, why: 'Arithmetic is fine. The failure is about what a measurement does to the system.' },
            { text: 'That the atoms are identical', correct: false, why: 'Every atom is prepared identically in $|{+z}\\rangle$, and the order effect still appears.' },
          ],
          hints: [
            { text: 'What would have to be true for order not to matter?' },
            { text: 'Classically, looking doesn\'t disturb.' },
            { text: 'Which option says "looking doesn\'t disturb"?' },
          ],
          walkthrough: [
            { text: 'Order can only matter if the first check changes what the second check sees. Classically a check just reads a stored value, so the "stored answers" picture is what fails.' },
          ],
        },
      ],
      claims: [
        { text: 'order B false 1/4', holds: () => close(prob(KET['-x'], KET['+z']) * prob(KET['-z'], KET['-x']), 0.25) },
      ],
    },
    {
      id: 'l1-vectors',
      title: 'States are vectors',
      question: 'What mathematical object can hold "up", "right", and the 50/50 relation between them?',
      lecture: {
        pages: 'L1 pp. 5–7',
        summary:
          'Quantum states live in a **vector space** (a Hilbert space), not a set. Up and down are two perfectly distinguishable states, so they form a basis. Right must contain equal parts of both, since $P(\\text{up}\\mid\\text{right}) = P(\\text{down}\\mid\\text{right}) = 1/2$, so $|\\text{right}\\rangle = (|\\text{up}\\rangle + |\\text{down}\\rangle)/\\sqrt2$, with probabilities given by squared coefficients. Left, perfectly distinguishable from right, is the orthogonal combination. The inner product extracts coordinates: $\\langle\\text{up}|\\psi\\rangle = \\alpha$.',
        equations: [
          '|\\psi\\rangle = \\alpha\\,|{\\uparrow}\\rangle + \\beta\\,|{\\downarrow}\\rangle,\\quad |\\alpha|^2 + |\\beta|^2 = 1',
          '|{\\to}\\rangle = \\tfrac{1}{\\sqrt2}(|{\\uparrow}\\rangle + |{\\downarrow}\\rangle),\\quad |{\\leftarrow}\\rangle = \\tfrac{1}{\\sqrt2}(|{\\uparrow}\\rangle - |{\\downarrow}\\rangle)',
          'P(\\text{outcome}) = |\\langle \\text{outcome}|\\psi\\rangle|^2',
        ],
      },
      books: [
        { source: 'susskind', where: '§2.2–2.3', adds: 'Derives $|r\\rangle$ and $|l\\rangle$ from the same two facts (50/50 along z, and orthogonal to each other), and points out the phase freedom that let us choose real coefficients.' },
        { source: 'axler', where: '§1B, Definition 1.20 (vector space)', adds: 'The axioms the notes list (closure, commutativity, zero, inverses, scalars) stated precisely. Nothing in them mentions arrows or 3D.' },
        { source: '3b1b', where: 'Linear combinations, span, and basis vectors', adds: 'Why two independent vectors are enough to reach every vector in a 2D space.', url: URL.b3('span') },
      ],
      visual: {
        kind: 'projector',
        props: { state: 45, basis: 0 },
        tryThis: [
          'Place ψ at 45°. Read off both probabilities: this is $|\\text{right}\\rangle$.',
          'Rotate the measurement basis to 45°. Why does ψ now give one outcome with certainty?',
        ],
      },
      clues: [
        {
          ask: 'Up and down are perfectly distinguishable. What geometric relation should their vectors have?',
          reveal: 'Orthogonal: $\\langle{\\uparrow}|{\\downarrow}\\rangle = 0$. No overlap means a z measurement can always tell them apart.',
        },
        {
          ask: 'Right gives up and down with probability 1/2 each. If probability is the squared coefficient, what are the coefficients?',
          reveal: 'Each has magnitude $1/\\sqrt2$. Choosing both positive gives $|{\\to}\\rangle = (|{\\uparrow}\\rangle + |{\\downarrow}\\rangle)/\\sqrt2$.',
        },
        {
          ask: 'Left must be perfectly distinguishable from right. Which combination of up and down is orthogonal to right?',
          reveal: '$(|{\\uparrow}\\rangle - |{\\downarrow}\\rangle)/\\sqrt2$: its inner product with right is $\\tfrac12(1 - 1) = 0$.',
        },
      ],
      insight:
        'A quantum state is a unit vector; a measurement picks an orthonormal basis; the probability of each outcome is the squared length of the state\'s shadow on that basis vector. "Perfectly distinguishable" means "orthogonal".',
      pitfalls: ['Treating the column $(\\alpha, \\beta)$ as the state itself. It is the state\'s coordinates in one particular basis (Lecture 5).'],
      play: [
        {
          id: 'l1-v-right',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Right, measured up/down',
          prompt: 'Compute $P(\\text{up}\\mid\\text{right}) = |\\langle{\\uparrow}|{\\to}\\rangle|^2$.',
          answer: prob(KET['+z'], KET['+x']),
          tolerance: 0.001,
          hints: [
            { text: 'Write $|{\\to}\\rangle$ in the up/down basis.' },
            { text: '$\\langle{\\uparrow}|{\\to}\\rangle$ picks out the up coefficient.' },
            { text: 'Square $1/\\sqrt2$.' },
          ],
          walkthrough: [
            { text: '$\\langle{\\uparrow}|{\\to}\\rangle = \\tfrac{1}{\\sqrt2}(\\langle{\\uparrow}|{\\uparrow}\\rangle + \\langle{\\uparrow}|{\\downarrow}\\rangle) = \\tfrac{1}{\\sqrt2}(1 + 0)$.' },
            { text: 'Square it: $P = \\tfrac12$.' },
          ],
        },
        {
          id: 'l1-v-left',
          kind: 'choice',
          tier: 'core',
          title: 'Why the minus sign?',
          prompt: 'Why is $|{\\leftarrow}\\rangle = (|{\\uparrow}\\rangle - |{\\downarrow}\\rangle)/\\sqrt2$ rather than another 50/50 combination?',
          options: [
            { text: 'Because left must be perfectly distinguishable from right, i.e. orthogonal to it', correct: true, why: 'Yes. $\\langle{\\to}|{\\leftarrow}\\rangle = \\tfrac12(1 - 1) = 0$, so an x measurement always tells them apart.' },
            { text: 'Because left points in the negative direction', correct: false, why: 'The minus sign is a relative sign between amplitudes, not a direction in space. (On the Bloch sphere $|{\\leftarrow}\\rangle$ is opposite $|{\\to}\\rangle$, but that comes later.)' },
            { text: 'It is just a convention; $+$ would work too', correct: false, why: 'With $+$ you would get $|{\\to}\\rangle$ again, the same state, which is not distinguishable from itself.' },
          ],
          hints: [
            { text: 'Left and right are both 50/50 in z. What else must be true of them?' },
            { text: 'Perfectly distinguishable ⇔ zero overlap.' },
            { text: 'Compute $\\langle{\\to}|{\\leftarrow}\\rangle$ with each sign choice.' },
          ],
          walkthrough: [
            { text: 'Any 50/50 state is $(|{\\uparrow}\\rangle + c|{\\downarrow}\\rangle)/\\sqrt2$ with $|c| = 1$.' },
            { text: 'Orthogonality to right: $\\tfrac12(1 + c) = 0 \\Rightarrow c = -1$.' },
          ],
        },
        {
          id: 'l1-v-norm',
          kind: 'numeric',
          tier: 'core',
          title: 'Missing probability',
          prompt: 'A state has $\\alpha = 0.6$ (real). What is $|\\beta|^2$?',
          answer: 1 - 0.36,
          tolerance: 0.001,
          hints: [
            { text: 'The probabilities of the two outcomes must add to 1.' },
            { text: '$|\\alpha|^2 + |\\beta|^2 = 1$.' },
            { text: '$1 - 0.6^2$.' },
          ],
          walkthrough: [{ text: '$|\\beta|^2 = 1 - 0.36 = 0.64$. Note $\\beta$ itself could be $0.8$, $-0.8$, $0.8i$, … (next lecture explains why that phase matters).' }],
        },
      ],
      claims: [
        { text: '⟨up|right⟩² = 1/2', holds: () => close(prob(KET['+z'], KET['+x']), 0.5) },
        { text: 'right ⟂ left', holds: () => close(prob(KET['+x'], KET['-x']), 0) },
      ],
    },
  ],
}
