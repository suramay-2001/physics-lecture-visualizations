/**
 * Glossary: the "meeting it cold" layer (owner: P after the l1-freeze tag).
 *
 * Rich text uses `[[id]]` or `[[id|shown text]]` to attach a gloss (ui/Rich.tsx → components/Gloss.tsx).
 * Seeded by W from P2-L1-story §3; P added `uses` (glosses a gloss leans on; closure-tested), `symbols`
 * (TeX symbols a gloss tag defines for the symbol-before-use lint, content/symbols.test.ts), `first`
 * (the unit or beat where the tag first appears), and the notation fixes of P1 (|±z⟩, not arrows).
 * Each gloss is one plain sentence of ≤ 25 words (lint). Notation keys used in `symbols`:
 * '|\\cdot\\rangle' ket, '\\langle\\cdot|' bra, '\\langle\\cdot|\\cdot\\rangle' inner product,
 * '\\langle\\cdot\\rangle' average.
 */
import type { GlossEntry } from './stage'

const ENTRIES: GlossEntry[] = [
  /* the apparatus */
  { id: 'silver-atom', term: 'silver atom', gloss: 'A silver atom has one unpaired outer electron, and that electron gives the whole atom its spin and its magnetism.', first: 'l1-quantized:b1', uses: ['spin'] },
  { id: 'oven', term: 'oven', gloss: 'A heated box with a small hole: atoms stream out in a thin beam, each with a random, unknown spin state.', first: 'l1-quantized:b1', uses: ['beam', 'spin', 'state'] },
  { id: 'beam', term: 'beam', gloss: 'A stream of atoms all travelling the same way, one after another.', first: 'l1-quantized:b1' },
  { id: 'magnetic-moment', term: 'magnetic moment $\\vec\\mu$', gloss: 'How strongly, and in which direction, something acts like a tiny bar magnet.', first: 'l1-quantized:b1', symbols: ['\\vec\\mu'] },
  { id: 'magnetic-field', term: 'magnetic field $\\vec B$', gloss: 'The influence a magnet spreads through the space around it, with a strength and a direction at every point.', first: 'l1-quantized:b5a', symbols: ['\\vec B'] },
  { id: 'gradient', term: 'gradient $\\nabla$', gloss: 'How fast something, here the field strength, changes as you move from place to place.', first: 'l1-quantized:b5a', uses: ['magnetic-field'], symbols: ['\\nabla'] },
  { id: 'sg-magnet', term: 'Stern–Gerlach magnet, SG$_z$', gloss: 'A magnet whose field changes sharply across its gap, so it sorts atoms by their spin along one axis (the subscript names the axis).', first: 'l1-quantized:b1', uses: ['magnetic-field', 'gradient', 'spin'] },
  { id: 'deflection', term: 'deflection', gloss: 'How far an atom is pushed sideways from the straight path it would otherwise take.', first: 'l1-quantized:b3' },
  { id: 'plate', term: 'plate', gloss: 'A glass screen at the end of the beam where arriving atoms leave a visible deposit.', first: 'l1-quantized:b2', uses: ['beam'] },
  { id: 'precession', term: 'precession', gloss: 'The slow wobble of a spinning magnet’s axis around the field direction, like a tilted spinning top; the field’s twist (torque) drives it.', first: 'l1-quantized:b5a', uses: ['magnetic-field'] },
  { id: 'polarizer', term: 'polarizer', gloss: 'A filter that passes light vibrating along one direction and blocks light vibrating at right angles to it.', first: 'l1-average' },

  /* spin and its readings */
  { id: 'spin', term: 'spin', gloss: 'A built-in property of an atom that makes it act like a tiny magnet, and that always measures as $+\\hbar/2$ or $-\\hbar/2$ along any axis.', first: 'l1-quantized:b1', uses: ['hbar'] },
  { id: 'spin-half', term: 'spin ½', gloss: 'A spin that gives exactly two possible readings along any axis.', first: 'l1-quantized', uses: ['spin'] },
  { id: 'hbar', term: '$\\hbar$ (“h-bar”)', gloss: 'A fixed constant of nature, about $1.05\\times10^{-34}$ J·s, that sets the size of quantum effects; spin readings come in units of it.', first: 'l1-quantized:b3', symbols: ['\\hbar'] },
  { id: 's-z', term: '$S_z$', gloss: 'The spin measured along the z axis, which only ever reads $+\\hbar/2$ or $-\\hbar/2$.', first: 'l1-quantized:b3', uses: ['spin', 'hbar'], symbols: ['S_z'] },
  { id: 'sigma-reading', term: '$\\sigma$, $\\sigma_n$', gloss: 'The spin reading along an axis rescaled to +1 or −1, so $\\sigma = 2S/\\hbar$; the subscript names the axis.', first: 'l1-quantized:b5b', uses: ['spin', 'hbar'], symbols: ['\\sigma', '\\sigma_n', '\\sigma_x', '\\sigma_z'] },
  { id: 'quantized', term: 'quantized (discrete)', gloss: 'Allowed only certain separate values, like the steps of a staircase rather than a ramp.', first: 'l1-quantized:b3' },
  { id: 'classical', term: 'classical', gloss: 'Following the physics of everyday objects, where quantities can take any value and looking does not disturb anything.', first: 'l1-quantized:b2' },
  { id: 'qubit', term: 'qubit', gloss: 'Any quantum system whose measurements have exactly two possible results, like a spin-½ atom.', first: 'l1-quantized', uses: ['measurement', 'spin-half'] },

  /* measurement */
  { id: 'hidden-label', term: 'hidden label (hidden variable)', gloss: 'The idea that each atom secretly carries its answers in advance, and a measurement merely reads them off.', first: 'l1-quantized:b6', uses: ['measurement'] },
  { id: 'measurement', term: 'measurement', gloss: 'Sending an atom through a device that forces one definite result and records it.', first: 'l1-quantized', uses: ['outcome'] },
  { id: 'outcome', term: 'outcome', gloss: 'The single result one measurement gives, here + or −.', first: 'l1-quantized', uses: ['measurement'] },
  { id: 'state', term: 'state', gloss: 'Everything that can be known about how a system was prepared, which is enough to predict the odds of every measurement.', first: 'l1-quantized:b4', uses: ['prepare', 'measurement'] },
  { id: 'prepare', term: 'prepare', gloss: 'Put a system into a known state, for example by keeping only atoms that came out + along z.', first: 'l1-sequential:b5', uses: ['state'] },
  { id: 'unpolarized', term: 'unpolarized', gloss: 'Describes a beam whose atoms have random, unknown spin states, so a magnet along any axis splits it 50/50.', first: 'l1-sequential', uses: ['beam', 'spin', 'state', 'mixture'] },
  { id: 'mixture', term: 'mixture', gloss: 'A beam in which different atoms are in different states, like the oven beam; it records our uncertainty about which atom is which.', first: 'l1-vectors:b7', uses: ['beam', 'state', 'oven'] },

  /* probability and averages */
  { id: 'probability', term: 'probability $P$', gloss: 'The fraction of many identical trials that give a particular result, a number from 0 to 1.', first: 'l1-quantized', symbols: ['P'] },
  { id: 'conditional-probability', term: 'conditional probability $P(A\\mid B)$', gloss: 'The probability of result A when B is already known; $P(+x\\mid{+z})$ means + along x for an atom prepared + along z.', first: 'l1-sequential:b2', uses: ['probability', 'prepare'], symbols: ['P'] },
  { id: 'expectation', term: 'average (expectation value) $\\langle\\sigma_n\\rangle$', gloss: 'The mean of many readings, written with angle brackets; with readings of ±1 it equals $P(+) - P(-)$.', first: 'l1-average:b2', uses: ['probability', 'sigma-reading'], symbols: ['\\langle\\cdot\\rangle'] },
  { id: 'unit-vector', term: 'unit vector $\\hat n$', gloss: 'An arrow of length 1 that only marks a direction; the hat on the letter signals this.', first: 'l1-average:b2', symbols: ['\\hat n'] },
  { id: 'dot-product', term: 'dot product $\\hat n\\cdot\\hat m$', gloss: 'How much two directions agree: 1 if the same, 0 if perpendicular, −1 if opposite; for unit vectors, the cosine of their angle.', first: 'l1-average:b2', uses: ['unit-vector'] },
  { id: 'half-angle', term: 'half-angle identity', gloss: 'The trigonometry fact that $\\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}$.', first: 'l1-average:b3' },
  { id: 'scatter', term: 'scatter (standard deviation)', gloss: 'How far individual results typically land from their average.', first: 'l1-average:b4' },
  { id: 'errata', term: 'errata', gloss: 'Corrections to mistakes in published notes.', first: 'l1-average:b5' },

  /* logic */
  { id: 'proposition', term: 'proposition', gloss: 'A yes-or-no statement about a system, such as “the spin is up”.', first: 'l1-logic:b1' },
  { id: 'set', term: 'set', gloss: 'A collection of distinct things, such as the list of all possible classical states.', first: 'l1-logic:b1', uses: ['classical'] },
  { id: 'union', term: 'union $A\\cup B$', gloss: 'Everything that is in A, in B, or in both; it is the set version of “or”.', first: 'l1-logic:b4', uses: ['set'], symbols: ['A', 'B'] },
  { id: 'commutative', term: 'commutative', gloss: 'Order does not matter, as in $2+3 = 3+2$ or $A\\cup B = B\\cup A$.', first: 'l1-logic', uses: ['union'] },
  { id: 'boolean-logic', term: 'Boolean logic', gloss: 'The everyday rules for combining yes/no statements with and, or, not, in which the order of checking never matters.', first: 'l1-logic', uses: ['proposition'] },

  /* vectors */
  { id: 'vector', term: 'vector', gloss: 'Something you can add to others of its kind and rescale by numbers; arrows are one example but not the only one.', first: 'l1-vectors' },
  { id: 'vector-space', term: 'vector space', gloss: 'A collection of vectors in which every sum and every rescaling is again in the collection.', first: 'l1-vectors:b5', uses: ['vector'] },
  { id: 'inner-product', term: 'inner product $\\langle a|\\psi\\rangle$', gloss: 'A number measuring how much of $|\\psi\\rangle$ lies along $|a\\rangle$; zero means no overlap at all.', first: 'l1-vectors:b2', uses: ['ket'], symbols: ['\\langle\\cdot|\\cdot\\rangle'] },
  { id: 'hilbert-space', term: 'Hilbert space', gloss: 'A vector space that also has an inner product, so lengths and angles make sense; quantum states live in one.', first: 'l1-vectors', uses: ['vector-space', 'inner-product', 'state'] },
  { id: 'state-space', term: 'state space', gloss: 'The abstract space whose points are the possible states of a system; it is not a place in the lab.', first: 'l1-average:b6', uses: ['state'] },
  { id: 'ket', term: 'ket $|\\psi\\rangle$', gloss: 'Dirac’s notation for a state written as a vector; the label inside the bracket is just a name.', first: 'l1-quantized:b4', uses: ['state', 'vector'], symbols: ['|\\cdot\\rangle'] },
  { id: 'bra', term: 'bra $\\langle a|$', gloss: 'The partner of the ket $|a\\rangle$ used in inner products: $\\langle a|$ followed by $|\\psi\\rangle$ gives the number $\\langle a|\\psi\\rangle$.', first: 'l1-vectors', uses: ['ket', 'inner-product'], symbols: ['\\langle\\cdot|'] },
  { id: 'orthogonal', term: 'orthogonal', gloss: 'At right angles; for states it means their inner product is zero.', first: 'l1-vectors:b1', uses: ['inner-product', 'state'] },
  { id: 'distinguishable', term: 'perfectly distinguishable', gloss: 'Describes two states that one well-chosen measurement always tells apart without error.', first: 'l1-vectors:b1', uses: ['state', 'measurement'] },
  { id: 'basis', term: 'basis', gloss: 'A set of vectors from which every vector in the space can be built, in exactly one way, by rescaling and adding.', first: 'l1-vectors', uses: ['vector'] },
  { id: 'orthonormal-basis', term: 'orthonormal basis', gloss: 'A basis whose vectors all have length 1 and are all at right angles to each other.', first: 'l1-vectors', uses: ['basis', 'orthogonal'] },
  { id: 'amplitude', term: 'coefficient (amplitude) $\\alpha, \\beta$', gloss: 'The numbers that say how much of each basis vector goes into a state.', first: 'l1-vectors:b2', uses: ['basis', 'state'], symbols: ['\\alpha', '\\beta'] },
  { id: 'normalized', term: 'normalized', gloss: 'Having length 1; for a state this means $|\\alpha|^2 + |\\beta|^2 = 1$, so the probabilities add to 1.', first: 'l1-vectors:b2', uses: ['amplitude', 'probability'] },
  { id: 'born-rule', term: 'Born rule', gloss: 'The probability of an outcome is the squared size of the inner product between the outcome’s state and the system’s state: $P = |\\langle\\text{outcome}|\\psi\\rangle|^2$.', first: 'l1-sequential', uses: ['probability', 'inner-product', 'outcome', 'state'], symbols: ['\\langle\\cdot|\\cdot\\rangle'] },
  { id: 'superposition', term: 'superposition', gloss: 'A single state written as a sum of other states, such as $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$; it is one definite state, not a mixture.', first: 'l1-vectors:b2', uses: ['state', 'ket', 'mixture'] },
  { id: 'complex-number', term: 'complex number', gloss: 'A number $a + bi$ built from two ordinary numbers $a$ and $b$ and the special number $i$, which satisfies $i^2 = -1$.', first: 'l1-vectors', symbols: ['i'] },
  { id: 'magnitude', term: 'size $|c|$ of a number', gloss: 'How far the number $c$ sits from zero, ignoring its sign or direction; for $c = a + bi$ it is $\\sqrt{a^2+b^2}$.', first: 'l1-vectors', uses: ['complex-number'] },
  { id: 'global-phase', term: 'global phase (overall sign)', gloss: 'A common factor of size 1, such as −1, that multiplies a whole state; it changes no prediction, so $|\\psi\\rangle$ and $-|\\psi\\rangle$ are one state.', first: 'l1-vectors:b5', uses: ['state', 'ket'] },
  { id: 'relative-phase', term: 'relative sign (relative phase)', gloss: 'A factor between the terms of a superposition, such as the minus sign in $|{-x}\\rangle$; unlike an overall sign, it changes predictions.', first: 'l1-vectors:b5', uses: ['superposition', 'global-phase'] },
  { id: 'bloch-sphere', term: 'Bloch sphere', gloss: 'A picture in which every state of a qubit is a point on a ball’s surface (full treatment in Lecture 6).', first: 'l1-vectors', uses: ['state', 'qubit'] },
  { id: 'bloch-ball', term: 'Bloch ball', gloss: 'A solid ball of qubit states: pure states on the surface, mixtures inside, and the oven beam at the centre (Lecture 6).', first: 'l1-vectors:b7', uses: ['qubit', 'state', 'mixture', 'oven'] },

  /* Lecture 2: vector spaces, inner products, complex numbers */
  { id: 'axiom', term: 'axiom', gloss: 'A basic rule accepted without proof, from which the rest is built.', first: 'l2-vector-space' },
  { id: 'scalar', term: 'scalar $\\lambda$', gloss: 'A plain number, here possibly complex, used to rescale a vector.', first: 'l2-vector-space:b3', uses: ['complex-number', 'vector'], symbols: ['\\lambda'] },
  { id: 'zero-ket', term: 'zero ket $0$', gloss: 'The one vector that changes nothing when added; its length is zero, so it is not a state.', first: 'l2-vector-space:b2', uses: ['vector', 'state'] },
  { id: 'additive-inverse', term: 'opposite ket $-|A\\rangle$', gloss: 'The ket that cancels $|A\\rangle$ when the two are added, leaving the zero ket.', first: 'l2-vector-space:b2', uses: ['ket', 'zero-ket'] },
  { id: 'closed', term: 'closed (under an operation)', gloss: 'A set is closed when combining any of its members that way always gives another member.', first: 'l2-vector-space', uses: ['set'] },
  { id: 'completeness', term: 'completeness (of a Hilbert space)', gloss: 'A technical property that finite-dimensional spaces, like a spin’s, have automatically; the lecture sets it aside.', first: 'l2-vector-space', uses: ['hilbert-space', 'dimension'] },
  { id: 'dual', term: 'dual (bra partner)', gloss: 'The bra that belongs to each ket; all the bras together form the dual space.', first: 'l2-vector-space', uses: ['bra', 'ket'] },
  { id: 'linearity', term: 'linearity', gloss: 'An operation is linear when it passes through sums and multiples: acting on a sum gives the sum of the results.', first: 'l2-inner-product:b2' },
  { id: 'conjugate-symmetry', term: 'conjugate symmetry', gloss: 'Swapping the two sides of an inner product gives its complex conjugate: $\\langle B|A\\rangle = \\langle A|B\\rangle^*$.', first: 'l2-inner-product:b2', uses: ['inner-product', 'complex-conjugate'], symbols: ['\\langle\\cdot|\\cdot\\rangle'] },
  { id: 'column-vector', term: 'column vector', gloss: 'A ket written as a vertical stack of its components.', first: 'l2-inner-product:b3', uses: ['ket', 'component'] },
  { id: 'row-vector', term: 'row vector', gloss: 'A bra written as a horizontal list of the ket’s components, each complex-conjugated.', first: 'l2-inner-product:b3', uses: ['bra', 'ket', 'component', 'complex-conjugate'] },
  { id: 'component', term: 'component (coordinate)', gloss: 'One of the numbers saying how much of each basis vector a vector contains; for a state, an amplitude.', first: 'l2-inner-product:b3', uses: ['basis', 'vector', 'state', 'amplitude'] },
  { id: 'change-of-basis', term: 'change of basis', gloss: 'Rewriting the same vector in the coordinates of a different basis; the vector itself does not change.', first: 'l2-inner-product:b6', uses: ['vector', 'basis', 'component'] },
  { id: 'complex-conjugate', term: 'complex conjugate $z^*$', gloss: 'The number made by flipping the sign of the imaginary part: $(a + ib)^* = a - ib$.', first: 'l2-vector-space:b5', uses: ['complex-number', 'imaginary-part'] },
  { id: 'imaginary-unit', term: 'imaginary unit $i$', gloss: 'The number whose square is $-1$; multiplying by it turns a point a quarter turn about zero.', first: 'l2-complex:b3', symbols: ['i'] },
  { id: 'complex-plane', term: 'complex plane', gloss: 'A flat plane of complex numbers, with real parts measured across and imaginary parts measured up.', first: 'l2-complex:b3', uses: ['complex-number', 'real-part', 'imaginary-part'] },
  { id: 'real-part', term: 'real part', gloss: 'In $a + ib$, the ordinary number $a$: the across coordinate in the complex plane.', first: 'l2-complex:b4', uses: ['complex-plane'] },
  { id: 'imaginary-part', term: 'imaginary part', gloss: 'In $a + ib$, the real number $b$ that multiplies $i$: the up coordinate in the complex plane.', first: 'l2-complex:b4', uses: ['real-number', 'imaginary-unit', 'complex-plane'] },
  { id: 'argument', term: 'phase (argument) $\\varphi$', gloss: 'The angle of a complex number, measured counterclockwise from the positive real axis.', first: 'l2-complex:b4', uses: ['complex-number'], symbols: ['\\varphi'] },
  { id: 'polar-form', term: 'polar form', gloss: 'Writing a complex number by its size and angle, $re^{i\\varphi}$, instead of by its real and imaginary parts.', first: 'l2-complex:b4', uses: ['complex-number', 'magnitude', 'argument', 'real-part', 'imaginary-part'] },
  { id: 'euler-formula', term: 'Euler’s formula', gloss: 'The identity $e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$, which places $e^{i\\varphi}$ on the unit circle at angle $\\varphi$.', first: 'l2-complex:b5', uses: ['unit-circle'] },
  { id: 'unit-circle', term: 'unit circle', gloss: 'The circle of all complex numbers of size 1.', first: 'l2-complex:b2', uses: ['complex-number', 'magnitude'] },
  { id: 'phase-factor', term: 'phase factor', gloss: 'A complex number of size 1, such as $e^{i\\varphi}$; multiplying by it only turns, never stretches.', first: 'l2-complex:b7', uses: ['complex-number', 'magnitude'] },
  { id: 'integer', term: 'integer', gloss: 'A whole number: positive, negative or zero.', first: 'l2-complex' },
  { id: 'rational-number', term: 'rational number', gloss: 'A number equal to one integer divided by another, nonzero, integer.', first: 'l2-complex', uses: ['integer'] },
  { id: 'irrational-number', term: 'irrational number', gloss: 'A real number that is not a fraction of integers, such as $\\sqrt2$.', first: 'l2-complex', uses: ['real-number', 'integer'] },
  { id: 'real-number', term: 'real number', gloss: 'Any point on the number line: all rational and all irrational numbers together.', first: 'l2-complex:b2', uses: ['rational-number', 'irrational-number'] },
  { id: 'pure-imaginary', term: 'purely imaginary', gloss: 'Describes a complex number whose real part is zero, such as $3i$.', first: 'l2-plus-y:b7', uses: ['complex-number', 'real-part'] },
  { id: 'right-handed', term: 'right-handed axes', gloss: 'Axes where curling the right hand’s fingers from x toward y makes the thumb point along z.', first: 'l2-plus-y:b7' },
  { id: 'mutually-unbiased', term: 'mutually unbiased bases', gloss: 'Two bases such that any state of one gives equal odds for every outcome when measured in the other.', first: 'l2-three-bases:b3', uses: ['basis', 'state', 'outcome'] },
  { id: 'dimension', term: 'dimension', gloss: 'The largest number of mutually orthogonal vectors a space can hold; a spin ½ space has dimension 2.', first: 'l2-three-bases', uses: ['orthogonal', 'vector', 'spin-half'] },
]

export const GLOSSARY: ReadonlyMap<string, GlossEntry> = new Map(ENTRIES.map((e) => [e.id, e]))
