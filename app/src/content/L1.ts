import type { Lecture } from './schema'
import { URL } from './refs'
import { V, claim, close, d, tf } from './L1.values'

// Every number a learner sees in this lecture is computed in L1.values.ts, then asserted in keyed claims
// (content.test.tsx runs `holds`; claims.test.ts compares each key with numpy).

export const L1: Lecture = {
  id: 'L1',
  number: 1,
  title: 'Stern–Gerlach and the birth of the quantum state',
  date: 'Sep 2, 2026',
  outcomes: [
    'Predict what a chain of Stern–Gerlach magnets does to a beam of silver atoms.',
    'Explain why the results rule out little classical magnets, and why a measurement cannot be a passive read-out of a hidden label.',
    'Say why quantum states are modelled as vectors rather than as members of a set.',
  ],
  prerequisites: [],
  watch: [
    { source: 'mit805', where: 'Lecture 3 (second half)', adds: 'Zwiebach walks through the real apparatus: why the field **gradient** deflects a magnetic moment, and what the two spots mean.', url: URL.mit805(3) },
    { source: 'tm-video', where: 'Lecture 1', adds: 'Susskind builds the same logic with an idealized box that only ever reads ±1.', url: URL.tmLecture1 },
    {
      source: '3b1b',
      where: 'Some light quantum mechanics',
      adds: `Polarized light plays the role of spin: filters instead of magnets. Careful: light follows cos² of the **full** polarizer angle, while spin follows cos² of **half** the magnet angle. At 45° that is ${d(V.photon45, 1)} versus ${d(V.p45)}.`,
      url: URL.b3('light-quantum-mechanics'),
    },
  ],
  corrections: [
    {
      where: 'L1 p.4',
      says: 'At 45°, 3/4 of the atoms go "up-right" and 1/4 "down-left".',
      shouldSay: `By the lecture's own N·M rule (the average ±1 reading equals the dot product of the two magnet axes), P(+) = (1 + cos 45°)/2 = cos²(22.5°) ≈ ${d(V.p45)}. A 3/4 : 1/4 split happens at 60°.`,
      check: () => close(V.p45, Math.cos(Math.PI / 8) ** 2) && close(V.theta34, 60, 1e-6),
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
          "Silver atoms from an oven fly between two shaped magnet poles. The field changes strongly across the gap, and that change (the gradient) pushes on each atom's magnetic moment. Classically every orientation is possible, so the beam should spread into a continuous band. Instead only two deflections occur, one up and one down, by the same amount. Sending the up beam through a second identical magnet gives up every time.",
        equations: ['S_z \\in \\{+\\tfrac{\\hbar}{2},\\; -\\tfrac{\\hbar}{2}\\}'],
      },
      books: [
        { source: 'townsend', where: '§1.1, pp. 1–5; §1.2 Exp. 1, pp. 5–6', adds: 'The real apparatus. Classical moments would paint a continuous smear (p. 4). The silver moment comes from one electron and points opposite its spin; the magnet is oriented so that spin-up atoms deflect up (p. 5).' },
        { source: 'susskind', where: '§1.2–1.3', adds: 'Replaces the magnet with an idealized apparatus that only ever displays $\\sigma = \\pm 1$. That strips the experiment down to its logic: two outcomes, and a repeated measurement gives the same answer.' },
        { source: 'bergou', where: '§1.1 The Qubit, p. 1', adds: 'Names what you just found: a two-outcome quantum system is a **qubit**. The rest of the book builds quantum computing on exactly this object.' },
        { source: 'mit805', where: 'Lecture 3', adds: 'Derives the deflecting force $\\vec F = \\nabla(\\vec\\mu\\cdot\\vec B)$: a uniform field only twists the moment, and it takes a gradient to separate the beams.', url: URL.mit805(3) },
      ],
      visual: {
        kind: 'sg-lab',
        props: { axes: ['z'], editable: false },
        tryThis: [
          'Fire one atom at a time. Can you predict where the **next** one will land?',
          'Fire 1000. Where is the band that classical magnets would have painted?',
        ],
      },
      clues: [],
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
            { text: 'One continuous band from maximum-up to maximum-down deflection', correct: true, why: 'Right. The deflection tracks $\\mu_z = \\mu\\cos\\theta_\\mu$, which takes every value between $-\\mu$ and $+\\mu$.' },
            { text: 'Two spots, up and down', correct: false, why: 'That is what is actually observed, and it is exactly what classical physics cannot explain.' },
            { text: 'One spot in the middle, because random directions average out', correct: false, why: 'The **average** deflection is zero, but each atom is deflected by its own $\\mu_z$. You would see a band centred on zero, not a single spot.' },
          ],
          hints: [
            { text: 'Each atom is deflected by an amount proportional to its own $\\mu_z$.' },
            { text: 'If the direction is random, what values can $\\mu_z = \\mu\\cos\\theta_\\mu$ take?' },
            { text: 'Every value between $-\\mu$ and $+\\mu$, so what does the plate collect?' },
          ],
          walkthrough: [
            { text: 'The force on a magnetic moment in a field gradient is proportional to the moment’s part along the gradient, $\\mu_z = \\mu\\cos\\theta_\\mu$. Here $\\theta_\\mu$ is the angle between the moment and the $z$ axis.' },
            { text: 'Random orientations make $\\cos\\theta_\\mu$ take every value in $[-1, 1]$, so the deflections fill a continuous range.' },
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
          answer: V.repeatZPlate,
          tolerance: 0.001,
          unit: 'fraction',
          hints: [
            { text: 'What state does the first magnet leave the kept atoms in?' },
            { text: 'After an $S_z = +\\hbar/2$ result the atom is in $|{+z}\\rangle$.' },
            { text: 'The second magnet asks the same question again. Can the answer change?' },
          ],
          walkthrough: [
            { text: 'The first SG$_z$ keeps only atoms that gave $+\\hbar/2$. After that result each atom is in $|{+z}\\rangle$.' },
            { text: `The second SG$_z$ asks the same question again, so the [[probability]] of + is $P(+) = ${tf(V.repeatZPlate)}$.` },
            { text: 'So **all** of them land in the + spot: fraction 1. Repeating a measurement repeats its result.' },
          ],
        },
      ],
      claims: [
        claim('ovenZPlus', 'oven → z: half the atoms land in +', () => close(V.ovenZPlus, 0.5) && close(V.ovenZMinus, 0.5)),
        claim('ovenZMinus', 'oven → z: half the atoms land in −', () => close(V.ovenZMinus, 0.5)),
        claim('repeatZPlate', 'z then z (keep +): every plate atom is +', () => close(V.repeatZPlate, 1) && close(V.repeatZMinus, 0)),
      ],
    },
    {
      id: 'l1-sequential',
      title: 'A new axis erases the old answer',
      question: 'What happens when you measure along x an atom you already know is "up" along z?',
      lecture: {
        pages: 'L1 pp. 3, 5, 8',
        summary:
          'Send the up beam into a magnet turned by 90°. If spin were a stored arrow pointing up, a left/right measurement should do nothing. Instead the atoms split left and right at random, 50/50. Keep the right beam and measure left/right again: every atom goes right. A final z measurement is then 50/50 again, so the earlier "up" is gone.',
        equations: [`P(\\pm x \\mid {+z}) = ${tf(V.pXgivenZ)}`, `P(\\pm z \\mid {+x}) = ${tf(V.pZgivenX)}`],
      },
      books: [
        { source: 'townsend', where: '§1.2 Exps. 2–4, pp. 5–9', adds: 'Runs these sequences as Experiments 2 and 3. His "modified" SG device, with one path blocked (Fig. 1.5, p. 8), is this bench\'s beam stop. In Experiment 4 both x beams are recombined without being recorded, and every atom comes out up again.' },
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
      clues: [],
      insight:
        'A measurement does two jobs: it reports a result, and it **prepares** the state that matches that result. Measuring along a new axis therefore overwrites what the old axis told you. Whatever the atom carries, a measurement is not a passive read-out.',
      pitfalls: ['Imagining the x measurement "reads" a pre-existing x value. The final z result shows it did not just read; it rewrote.'],
      play: [
        {
          id: 'l1-s-zxz',
          kind: 'numeric',
          tier: 'core',
          title: 'Follow the beam',
          prompt: 'Oven → SG$_z$ (keep +) → SG$_x$ (keep +) → SG$_z$. What fraction of **all atoms leaving the oven** end in the final + spot?',
          answer: V.zxzPlus,
          tolerance: 0.002,
          unit: 'of all atoms',
          hints: [
            { text: 'Multiply the probability of surviving each stage.' },
            { text: 'Oven → +z keeps 1/2. Then +z → +x keeps how much?' },
            { text: 'Then +x → +z at the last magnet is 50/50 again.' },
          ],
          walkthrough: [
            { text: `The oven beam is [[unpolarized]], so the first SG$_z$ passes half: $${tf(V.zxzAlive1)}$.` },
            { text: `Those atoms are $|{+z}\\rangle$. By the [[born-rule|Born rule]] (unit 5), the SG$_x$ passes $|\\langle{+x}|{+z}\\rangle|^2 = ${tf(V.pXgivenZ)}$ of them. That leaves $${tf(V.zxzAlive2)}$ of the oven.` },
            { text: `Now they are $|{+x}\\rangle$, and the last SG$_z$ sends $${tf(V.pZgivenX)}$ to +. Total $\\tfrac12\\cdot\\tfrac12\\cdot\\tfrac12 = ${tf(V.zxzPlus)}$.`, show: { kind: 'sg-lab', props: { axes: ['z', 'x', 'z'], keep: ['+', '+'], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-s-blocked',
          kind: 'numeric',
          tier: 'stretch',
          title: 'Where do they get stopped?',
          prompt: 'Oven → SG$_z$ (keep +) → SG$_x$ (keep **−**) → SG$_z$. What fraction of all oven atoms are stopped **at the second magnet**?',
          answer: V.zMinusXBlocked2,
          tolerance: 0.002,
          unit: 'of all atoms',
          hints: [
            { text: 'First find what fraction even reaches the second magnet.' },
            { text: 'Half reach it, all in $|{+z}\\rangle$. Which of them does the second magnet block?' },
            { text: 'It keeps −x, so it blocks the +x outcome, which has probability $|\\langle{+x}|{+z}\\rangle|^2$.' },
          ],
          walkthrough: [
            { text: 'Half the oven atoms pass the first magnet as $|{+z}\\rangle$.' },
            { text: `The second magnet lets −x through and blocks +x. $P(+x\\mid{+z}) = ${tf(V.pXgivenZ)}$.` },
            { text: `Stopped there: $\\tfrac12 \\times \\tfrac12 = ${tf(V.zMinusXBlocked2)}$ of the oven.` },
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
            { text: '+ or − with equal probability', correct: true, why: `Right. The atom is now $|{+x}\\rangle$ and $|\\langle{\\pm z}|{+x}\\rangle|^2 = ${tf(V.pZgivenX)}$.` },
            { text: 'It will give 0, since up and right average out', correct: false, why: 'There is no 0 outcome. Every spin measurement gives $\\pm\\hbar/2$.' },
          ],
          hints: [
            { text: 'Which measurement happened **last** before the third one?' },
            { text: 'After an x result of +, what state is the atom in?' },
            { text: 'Expand $|{+x}\\rangle$ in the z basis and square the coefficients.' },
          ],
          walkthrough: [
            { text: 'The last measurement was x, with result +, so the atom is in $|{+x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + |{-z}\\rangle)$ (unit 5 derives this).' },
            { text: `Both z coefficients have size $1/\\sqrt2$, so each z outcome has probability $${tf(V.pZgivenX)}$.` },
          ],
        },
      ],
      claims: [
        claim('zxzPlus', 'z(+) → x(+) → z: 1/8 of oven atoms end in +', () => close(V.zxzPlus, 1 / 8)),
        claim('zMinusXBlocked2', 'z(+) → x(−): 1/4 of oven atoms stopped at magnet 2', () => close(V.zMinusXBlocked2, 1 / 4)),
        claim('pXgivenZ', 'P(+x | +z) = 1/2', () => close(V.pXgivenZ, 0.5)),
        claim('pZgivenX', '|+x⟩ is 50/50 along z', () => close(V.pZgivenX, 0.5)),
        claim('zxzAlive1', 'half the oven passes the first z magnet', () => close(V.zxzAlive1, 0.5)),
        claim('zxzAlive2', 'a quarter of the oven passes the x magnet', () => close(V.zxzAlive2, 0.25)),
      ],
    },
    {
      id: 'l1-average',
      title: 'Single atoms are random, averages are classical',
      question: 'If each atom is random, what does the tilt of the magnet actually control?',
      lecture: {
        pages: 'L1 p. 4',
        summary:
          'Tilt the second magnet to an in-between angle. Each atom still gives only + or −, but the split is no longer even. Scale each spot to a reading of ±1. For atoms prepared along $\\hat m$ and measured along $\\hat n$, the **average reading** is $\\hat n\\cdot\\hat m = \\cos\\theta$. A classical arrow would give that value for every single atom. Prepared up and measured along z, every atom is predictable. Along any other axis only the probabilities, and hence the average, are predictable.',
        equations: ['\\langle \\sigma_n \\rangle = \\hat n\\cdot\\hat m = \\cos\\theta', 'P(+) = \\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}'],
      },
      books: [
        { source: 'townsend', where: '§1.4, pp. 15–16 (eqs. 1.20–1.22); Problem 1.3, p. 26', adds: 'Defines the expectation value of $S_z$ and the spread of single readings around it (the uncertainty). Problem 1.3 builds the state for any axis, with the same half angle as here.' },
        { source: 'susskind', where: '§1.3', adds: 'Makes the same claim with his idealized apparatus: after preparing along $\\hat m$ and measuring along $\\hat n$, the average of many $\\pm1$ readings is $\\hat n\\cdot\\hat m$.' },
        { source: 'reif', where: '§1.2–1.4 (random walk, mean values)', adds: 'The statistics of many ±1 trials: the mean is predictable even though each trial is not, and its scatter shrinks like $1/\\sqrt{N_{\\text{atoms}}}$.' },
        { source: '3b1b', where: 'Some light quantum mechanics', adds: 'Photons through tilted polarizers obey $\\cos^2$ of the **full** polarizer angle; spin obeys $\\cos^2$ of **half** the magnet angle. Both are $\\cos^2$ of the angle between state vectors. The half angle is a clue that the sphere of spin directions is not the space of states.', url: URL.b3('light-quantum-mechanics') },
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
      clues: [],
      insight:
        'Quantum mechanics predicts **probabilities**, and their average reproduces the classical projection $\\hat n\\cdot\\hat m$. What is classical is the average, not the individual atom. The rule $P(+) = \\cos^2(\\theta/2)$ carries a half angle that points ahead to the geometry of state space.',
      pitfalls: [`Reading $\\langle\\sigma_n\\rangle = ${d(V.avg45, 1)}$ as "each atom reads ${d(V.avg45, 1)}". No atom does; only the average does.`],
      play: [
        {
          id: 'l1-a-45',
          kind: 'numeric',
          tier: 'core',
          title: 'The 45° magnet',
          prompt: 'Atoms prepared in $|{+z}\\rangle$ enter a magnet tilted 45° from z toward x. What is $P(+)$?',
          widget: { kind: 'sg-lab', props: { source: '+z', axes: [45], editable: false, predict: true } },
          answer: V.p45,
          tolerance: 0.005,
          unit: 'probability',
          hints: [
            { text: 'The average $\\langle\\sigma_n\\rangle$ is $\\hat n\\cdot\\hat m$.' },
            { text: 'Readings are ±1, so the average is $P(+) - P(-) = 2P(+) - 1$.' },
            { text: '$P(+) = (1 + \\cos 45^\\circ)/2$.' },
          ],
          walkthrough: [
            { text: 'Prepared along $\\hat z$, measured along $\\hat n$ at 45°: $\\hat n\\cdot\\hat z = \\cos 45^\\circ = 1/\\sqrt2$.' },
            { text: 'With readings ±1: $2P(+) - 1 = 1/\\sqrt2$, so $P(+) = \\tfrac12(1 + 1/\\sqrt2)$.' },
            { text: `That is $\\cos^2(22.5^\\circ) \\approx ${d(V.p45, 4)}$.`, show: { kind: 'sg-lab', props: { source: '+z', axes: [45], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-a-34',
          kind: 'numeric',
          tier: 'core',
          title: 'Dial in 3 : 1',
          prompt: 'At what tilt angle (degrees, from z) do atoms prepared in $|{+z}\\rangle$ split 3/4 : 1/4?',
          answer: V.theta34,
          tolerance: 0.6,
          unit: 'degrees',
          hints: [
            { text: 'Set $\\tfrac{1 + \\cos\\theta}{2} = \\tfrac34$.' },
            { text: 'So $\\cos\\theta = \\tfrac12$.' },
            { text: 'Which angle has cosine one half?' },
          ],
          walkthrough: [
            { text: `$\\tfrac{1+\\cos\\theta}{2} = \\tfrac34 \\Rightarrow \\cos\\theta = \\tfrac12 \\Rightarrow \\theta = ${d(V.theta34, 0)}^\\circ$.` },
            { text: 'Check on the bench: tilt the magnet to 60° and fire 1000 atoms.', show: { kind: 'sg-lab', props: { source: '+z', axes: [60], editable: false, showTheory: true } } },
          ],
        },
        {
          id: 'l1-a-errata',
          kind: 'choice',
          tier: 'stretch',
          title: 'Spot the error',
          prompt: "The notes say two things: (1) at 45°, 3/4 of the atoms go up-right; (2) the average reading is N·M, the notes' names for our $\\hat n$ and $\\hat m$. Are they consistent?",
          options: [
            { text: 'Yes: $\\cos 45^\\circ \\approx 0.71$, which is close enough to 3/4', correct: false, why: 'That compares an **average** ($\\cos\\theta$) with a **probability**. They are different quantities: $P(+) = (1 + \\cos\\theta)/2$.' },
            { text: `No: (2) implies $P(+) = (1+\\cos 45^\\circ)/2 \\approx ${d(V.p45)}$; 3/4 happens at 60°`, correct: true, why: 'Right. The averaging rule is the reliable one (it matches experiment and the theory you will build), and it fixes the 45° split at about 85 : 15.' },
            { text: 'No: at 45° it must be exactly 50/50', correct: false, why: '50/50 only happens at 90°, where $\\hat n\\cdot\\hat m = 0$.' },
          ],
          hints: [
            { text: 'Statement (2) is about an average; statement (1) is about a probability. Connect them.' },
            { text: 'With readings ±1, the average is $2P(+) - 1$.' },
            { text: 'Solve for $P(+)$ at $\\theta = 45^\\circ$ and compare with 0.75.' },
          ],
          walkthrough: [
            { text: 'Average of ±1 readings: $\\langle\\sigma_n\\rangle = P(+) - P(-) = 2P(+) - 1$.' },
            { text: `Set it equal to $\\cos 45^\\circ$: $P(+) = (1 + ${d(V.avg45, 4)})/2 \\approx ${d(V.p45, 4)}$.` },
            { text: 'That is not 0.75. The 3 : 1 split needs $\\cos\\theta = 1/2$, so $\\theta = 60^\\circ$. One possible slip: 60° and 45° swapped.' },
          ],
        },
        {
          id: 'l1-a-avg',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Average, not outcome',
          prompt: 'For the 45° magnet with $|{+z}\\rangle$ atoms, what is the **average** of the ±1 readings $\\sigma_n$?',
          answer: V.avg45,
          tolerance: 0.005,
          unit: 'in units of ħ/2',
          hints: [
            { text: 'Use $\\langle\\sigma_n\\rangle = \\hat n\\cdot\\hat m$.' },
            { text: 'The angle between the axes is 45°.' },
            { text: '$\\cos 45^\\circ = ?$' },
          ],
          walkthrough: [
            { text: `$\\langle\\sigma_n\\rangle = \\hat n\\cdot\\hat z = \\cos 45^\\circ = 1/\\sqrt2 \\approx ${d(V.avg45)}$. No single atom ever reads ${d(V.avg45)}; each reads ±1.` },
          ],
        },
      ],
      claims: [
        claim('p45', 'P(+) at 45° = cos²(22.5°)', () => close(V.p45, Math.cos(Math.PI / 8) ** 2)),
        claim('theta34', '3/4 split at 60°', () => close(V.theta34, 60, 1e-6)),
        claim('p60', 'P(+) at 60° = 3/4', () => close(V.p60, 0.75)),
        claim('cos60', 'cos 60° = 1/2', () => close(V.cos60, 0.5)),
        claim('avg45', 'average at 45° = 1/√2', () => close(V.avg45, Math.SQRT1_2)),
        claim('p90', 'P(+) at 90° = 1/2', () => close(V.p90, 0.5)),
        claim('avg90', 'average at 90° = 0', () => close(V.avg90, 0)),
        claim('photon45', 'light at 45° passes 1/2 (Bloch angle 90°)', () => close(V.photon45, Math.cos(Math.PI / 4) ** 2)),
      ],
    },
    {
      id: 'l1-logic',
      title: 'When "or" depends on the order',
      question: 'Why can\'t quantum propositions be checked like facts about a set?',
      lecture: {
        pages: 'L1 pp. 4–5',
        summary:
          'Classical states form a set, and propositions about them combine with and, or, not: Boolean logic. Test the proposition "the spin is up **or** right" on atoms prepared up. Check z first and the answer is always yes. Check x first and then z: a quarter of the atoms read left and then down, so the proposition comes out false. The answer depends on the order of checking, so checking must disturb the atom.',
      },
      books: [
        { source: 'susskind', where: '§1.5–1.7 Propositions; testing classical and quantum propositions', adds: 'Susskind runs exactly this test with $\\sigma_z = +1$ and $\\sigma_x = +1$. He concludes that quantum propositions need a different logic from the logic of sets.' },
        { source: 'sets', where: '§1.1.3 Set operations', adds: 'Defines union and intersection. Classically, testing A and then B cannot change the system, so whether "A or B" holds does not depend on the testing order. Here the test changes the state.' },
      ],
      visual: {
        kind: 'logic-order',
        tryThis: ['Test 1000 atoms each way. In which order is "up OR right" ever false?', 'Why can\'t the z-first order ever produce "false"?'],
      },
      clues: [],
      insight:
        'Propositions about a quantum system are tested by measurements, and measurements change the state. So "P or Q" cannot be checked like a fact about a set: testing one part changes what the other test sees. That is the lecture\'s motivation for trying vectors instead. Ruling out every hidden-answer model needs more than this experiment; that comes later with Bell\'s theorem.',
      play: [
        {
          id: 'l1-l-false',
          kind: 'numeric',
          tier: 'core',
          title: 'How often is it false?',
          prompt: 'Atoms prepared in $|{+z}\\rangle$. Measure x first, then z. What fraction of atoms make "up OR right" **false**?',
          widget: { kind: 'logic-order' },
          answer: V.falseXFirst,
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
            { text: `False with probability $${tf(V.falseXFirst)}$, whereas in the z-first order it is never false.` },
          ],
        },
        {
          id: 'l1-l-assumption',
          kind: 'choice',
          tier: 'warm-up',
          title: 'Which assumption failed?',
          prompt: 'Which classical assumption does this experiment break?',
          options: [
            { text: 'That a state is a list of answers that measurements merely reveal', correct: true, why: 'Right. If checking only read stored answers without changing them, the order could not matter. This experiment shows checking disturbs; it does not yet rule out every hidden-answer model.' },
            { text: 'That "A or B" and "B or A" mean the same proposition', correct: false, why: 'They do, as sentences. The difference comes from what the tests do to the atom.' },
            { text: 'That the atoms are identical', correct: false, why: 'Every atom is prepared identically in $|{+z}\\rangle$, and the order effect still appears.' },
          ],
          hints: [
            { text: 'What would have to be true for order not to matter?' },
            { text: 'Classically, looking does not disturb.' },
            { text: 'Which option says "looking does not disturb"?' },
          ],
          walkthrough: [
            { text: 'Order can only matter if the first check changes what the second check sees. Classically a check just reads a stored value, so the "stored answers" picture is what fails.' },
          ],
        },
      ],
      claims: [
        claim('falseXFirst', 'x-first: false for 1/4', () => close(V.falseXFirst, 0.25)),
        claim('falseZFirst', 'z-first: never false', () => close(V.falseZFirst, 0)),
        claim('trueXFirst', 'x-first: true for 3/4', () => close(V.trueXFirst, 0.75)),
      ],
    },
    {
      id: 'l1-vectors',
      title: 'States are vectors',
      question: 'What mathematical object can hold "up", "right", and the 50/50 relation between them?',
      lecture: {
        pages: 'L1 pp. 5–7',
        summary:
          'Quantum states live in a **vector space** with an inner product (a Hilbert space), not in a set. A measurement with exactly two outcomes calls for a two-dimensional space. Perfectly distinguishable states are orthogonal, so $|{+z}\\rangle$ and $|{-z}\\rangle$ form an orthonormal basis. Right gives up and down half the time each, so both of its coefficients have size $1/\\sqrt2$. Equal probabilities fix only these sizes; choosing both positive is a convention that names the x direction. Left, perfectly distinguishable from right, is the orthogonal combination. The inner product reads off a coordinate: $\\langle{+z}|\\psi\\rangle = \\alpha$.',
        equations: [
          '|\\psi\\rangle = \\alpha\\,|{+z}\\rangle + \\beta\\,|{-z}\\rangle,\\quad |\\alpha|^2 + |\\beta|^2 = 1',
          '|{+x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + |{-z}\\rangle),\\quad |{-x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle - |{-z}\\rangle)',
          'P(\\text{outcome}) = |\\langle \\text{outcome}|\\psi\\rangle|^2',
        ],
      },
      books: [
        { source: 'townsend', where: '§1.3, pp. 10–13; §1.4, pp. 14–15', adds: 'Builds the same basis from Experiment 1, where $\\langle{-z}|{+z}\\rangle = 0$. He writes $|{+x}\\rangle$ with explicit phases before choosing real coefficients, and introduces bras and the Born rule.' },
        { source: 'susskind', where: '§1.9, §2.1–2.3', adds: 'Derives $|r\\rangle$ and $|l\\rangle$ from the same two facts (50/50 along z, and orthogonal to each other), and points out the phase freedom that lets us choose real coefficients.' },
        { source: 'axler', where: '§1B, Definition 1.20 (vector space)', adds: 'The axioms Lecture 2 lists (closure, commutativity, zero, inverses, scalars), stated precisely. Nothing in them mentions arrows or 3D.' },
        { source: '3b1b', where: 'Linear combinations, span, and basis vectors', adds: 'Why two independent vectors are enough to reach every vector in a 2D space.', url: URL.b3('span') },
      ],
      visual: {
        kind: 'projector',
        props: { state: 45, basis: 0 },
        caption: 'Angles in this widget are state-space angles: half of the lab angles.',
        tryThis: [
          "Place ψ at a state-space angle of 45° (the lab's 90°, the x axis). Read off both probabilities: this is $|{+x}\\rangle$.",
          'Rotate the measurement basis to 45°. Why does ψ now give one outcome with certainty?',
        ],
      },
      clues: [],
      insight:
        'A quantum state is a unit vector, and a measurement picks an orthonormal basis. The probability of each outcome is the squared length of the state\'s shadow on that basis vector. "Perfectly distinguishable" means "orthogonal".',
      pitfalls: ['Treating the column $(\\alpha, \\beta)$ as the state itself. It is the state\'s coordinates in one particular basis (Lecture 5).'],
      play: [
        {
          id: 'l1-v-right',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Right, measured up/down',
          prompt: 'Compute $P(+z\\mid{+x}) = |\\langle{+z}|{+x}\\rangle|^2$, the chance that an atom prepared right reads up.',
          answer: V.pUpRight,
          tolerance: 0.001,
          hints: [
            { text: 'Write $|{+x}\\rangle$ in the $|{\\pm z}\\rangle$ basis.' },
            { text: '$\\langle{+z}|{+x}\\rangle$ picks out the up coefficient.' },
            { text: 'Square $1/\\sqrt2$.' },
          ],
          walkthrough: [
            { text: '$\\langle{+z}|{+x}\\rangle = \\tfrac{1}{\\sqrt2}(\\langle{+z}|{+z}\\rangle + \\langle{+z}|{-z}\\rangle) = \\tfrac{1}{\\sqrt2}(1 + 0)$.' },
            { text: `Square it: $P = ${tf(V.pUpRight)}$.` },
          ],
        },
        {
          id: 'l1-v-left',
          kind: 'choice',
          tier: 'core',
          title: 'Why the minus sign?',
          prompt: 'Why is $|{-x}\\rangle = (|{+z}\\rangle - |{-z}\\rangle)/\\sqrt2$ rather than another 50/50 combination?',
          options: [
            { text: 'Because left must be perfectly distinguishable from right, i.e. orthogonal to it', correct: true, why: 'Yes. $\\langle{+x}|{-x}\\rangle = \\tfrac12(1 - 1) = 0$, so an x measurement always tells them apart.' },
            { text: 'Because left points in the negative direction', correct: false, why: 'The minus sign is a relative sign between amplitudes, not a direction in space. (On the Bloch sphere $|{-x}\\rangle$ is opposite $|{+x}\\rangle$, but that comes later.)' },
            { text: 'It is just a convention; $+$ would work too', correct: false, why: 'With $+$ you would get $|{+x}\\rangle$ again, the same state, which is not distinguishable from itself.' },
          ],
          hints: [
            { text: 'Left and right are both 50/50 in z. What else must be true of them?' },
            { text: 'Perfectly distinguishable ⇔ zero overlap.' },
            { text: 'Compute $\\langle{+x}|{-x}\\rangle$ with each sign choice.' },
          ],
          walkthrough: [
            { text: 'Any 50/50 state is $(|{+z}\\rangle + c|{-z}\\rangle)/\\sqrt2$ for a number $c$ of [[magnitude|size]] $|c| = 1$.' },
            { text: 'Orthogonality to right: $\\tfrac12(1 + c) = 0 \\Rightarrow c = -1$.' },
          ],
        },
        {
          id: 'l1-v-norm',
          kind: 'numeric',
          tier: 'core',
          title: 'Missing probability',
          prompt: 'A state has $\\alpha = 0.6$ (real). What is $|\\beta|^2$?',
          answer: V.betaSq,
          tolerance: 0.001,
          hints: [
            { text: 'The probabilities of the two outcomes must add to 1.' },
            { text: '$|\\alpha|^2 + |\\beta|^2 = 1$.' },
            { text: '$1 - 0.6^2$.' },
          ],
          walkthrough: [
            { text: `$|\\beta|^2 = 1 - 0.36 = ${d(V.betaSq, 2)}$. Note $\\beta$ itself could be $0.8$, $-0.8$, or even the [[complex-number|complex number]] $0.8i$. The next lecture explains why that phase matters.` },
          ],
        },
      ],
      claims: [
        claim('pUpRight', '|⟨+z|+x⟩|² = 1/2', () => close(V.pUpRight, 0.5)),
        claim('pRightLeft', '+x ⟂ −x', () => close(V.pRightLeft, 0)),
        claim('pRightRight', '+x measured along x: + every time', () => close(V.pRightRight, 1)),
        claim('betaSq', '|β|² = 0.64 when α = 0.6', () => close(V.betaSq, 0.64)),
      ],
    },
  ],
}
