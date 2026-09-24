/**
 * Glossary: the "meeting it cold" layer (owner: P after the l1-freeze tag).
 *
 * Rich text uses `[[id]]` or `[[id|shown text]]` to attach a gloss (ui/Rich.tsx → components/Gloss.tsx).
 * Seeded by W from P2-L1-story §3, pasted as data. `first` maps P2's "First" column to a unit or beat id.
 * `uses` and `symbols` are left for P (closure test: every `uses` id exists; symbols seed the
 * symbol-before-use lint).
 */
import type { GlossEntry } from './stage'

const ENTRIES: GlossEntry[] = [
  { id: 'silver-atom', term: 'silver atom', gloss: 'A silver atom has one unpaired outer electron, and that electron gives the whole atom its spin and its magnetism.', first: 'l1-quantized' },
  { id: 'oven', term: 'oven', gloss: 'A heated box with a small hole, so atoms stream out in a thin beam with no preferred spin direction.', first: 'l1-quantized' },
  { id: 'beam', term: 'beam', gloss: 'A stream of atoms all travelling the same way, one after another.', first: 'l1-quantized' },
  { id: 'magnetic-moment', term: 'magnetic moment $\\vec\\mu$', gloss: 'How strongly, and in which direction, something acts like a tiny bar magnet.', first: 'l1-quantized' },
  { id: 'magnetic-field', term: 'magnetic field $\\vec B$', gloss: 'The influence a magnet spreads through the space around it, with a strength and a direction at every point.', first: 'l1-quantized' },
  { id: 'gradient', term: 'gradient $\\nabla$', gloss: 'How fast something, here the field strength, changes as you move from place to place.', first: 'l1-quantized' },
  { id: 'sg-magnet', term: 'Stern–Gerlach magnet, SG$_z$', gloss: 'A magnet whose field is much stronger near one pole, so it sorts atoms by their spin along one axis (the subscript names the axis).', first: 'l1-quantized' },
  { id: 'deflection', term: 'deflection', gloss: 'How far an atom is pushed sideways from the straight path it would otherwise take.', first: 'l1-quantized' },
  { id: 'plate', term: 'plate', gloss: 'A glass screen at the end of the beam where arriving atoms leave a visible deposit.', first: 'l1-quantized' },
  { id: 'spin', term: 'spin', gloss: 'A built-in property of an atom that makes it act like a tiny magnet, and that always measures as $+\\hbar/2$ or $-\\hbar/2$ along any axis.', first: 'l1-quantized' },
  { id: 'spin-half', term: 'spin ½', gloss: 'A spin that gives exactly two possible readings along any axis.', first: 'l1-quantized' },
  { id: 'hbar', term: '$\\hbar$ (“h-bar”)', gloss: 'A fixed constant of nature, about $1.05\\times10^{-34}$ J·s, that sets the size of quantum effects; spin readings come in units of it.', first: 'l1-quantized' },
  { id: 's-z', term: '$S_z$', gloss: 'The spin measured along the z axis, which only ever reads $+\\hbar/2$ or $-\\hbar/2$.', first: 'l1-quantized' },
  { id: 'sigma-reading', term: '$\\sigma$, $\\sigma_n$', gloss: 'The spin reading along an axis rescaled to +1 or −1, so $\\sigma = 2S/\\hbar$.', first: 'l1-quantized' },
  { id: 'quantized', term: 'quantized (discrete)', gloss: 'Allowed only certain separate values, like the steps of a staircase rather than a ramp.', first: 'l1-quantized' },
  { id: 'classical', term: 'classical', gloss: 'Following the physics of everyday objects, where quantities can take any value and looking does not disturb anything.', first: 'l1-quantized' },
  { id: 'precession', term: 'precession', gloss: 'The slow wobble of a spinning magnet’s axis around the field direction, like a tilted spinning top.', first: 'l1-quantized:b5a' },
  { id: 'qubit', term: 'qubit', gloss: 'Any quantum system whose measurements have exactly two possible results, like a spin-½ atom.', first: 'l1-quantized' },
  { id: 'hidden-label', term: 'hidden label (hidden variable)', gloss: 'The idea that each atom secretly carries its answers in advance, and a measurement merely reads them off.', first: 'l1-quantized' },
  { id: 'measurement', term: 'measurement', gloss: 'Sending an atom through a device that forces one definite result and records it.', first: 'l1-quantized' },
  { id: 'outcome', term: 'outcome', gloss: 'The single result one measurement gives, here + or −.', first: 'l1-quantized' },
  { id: 'state', term: 'state', gloss: 'Everything that can be known about how a system was prepared, which is enough to predict the odds of every measurement.', first: 'l1-quantized' },
  { id: 'prepare', term: 'prepare', gloss: 'Put a system into a known state, for example by keeping only atoms that came out + along z.', first: 'l1-sequential' },
  { id: 'unpolarized', term: 'unpolarized', gloss: 'Describes a beam with no preferred spin direction, so a magnet along any axis splits it 50/50.', first: 'l1-sequential' },
  { id: 'probability', term: 'probability $P$', gloss: 'The fraction of many identical trials that give a particular result, a number from 0 to 1.', first: 'l1-sequential' },
  { id: 'conditional-probability', term: 'conditional probability $P(A\\mid B)$', gloss: 'The probability of result A when B is already known; $P(+x\\mid{+z})$ reads “chance of + along x, for an atom prepared + along z”.', first: 'l1-sequential' },
  { id: 'expectation', term: 'average (expectation value) $\\langle\\sigma_n\\rangle$', gloss: 'The mean of many readings; with readings of ±1 it equals $P(+) - P(-)$.', first: 'l1-average' },
  { id: 'unit-vector', term: 'unit vector $\\hat n$', gloss: 'An arrow of length 1 that only marks a direction; the hat on the letter signals this.', first: 'l1-average' },
  { id: 'dot-product', term: 'dot product $\\hat n\\cdot\\hat m$', gloss: 'A number saying how much two directions agree (1 if the same, 0 if perpendicular, −1 if opposite); for unit vectors it is the cosine of the angle between them.', first: 'l1-average' },
  { id: 'half-angle', term: 'half-angle identity', gloss: 'The trigonometry fact that $\\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}$.', first: 'l1-average' },
  { id: 'scatter', term: 'scatter (standard deviation)', gloss: 'How far individual results typically land from their average.', first: 'l1-average' },
  { id: 'proposition', term: 'proposition', gloss: 'A yes-or-no statement about a system, such as “the spin is up”.', first: 'l1-logic' },
  { id: 'set', term: 'set', gloss: 'A collection of distinct things, such as the list of all possible classical states.', first: 'l1-logic' },
  { id: 'union', term: 'union $A\\cup B$', gloss: 'Everything that is in A, in B, or in both; it is the set version of “or”.', first: 'l1-logic' },
  { id: 'commutative', term: 'commutative', gloss: 'Order does not matter, as in $2+3 = 3+2$ or $A\\cup B = B\\cup A$.', first: 'l1-logic' },
  { id: 'boolean-logic', term: 'Boolean logic', gloss: 'The everyday rules for combining yes/no statements with and, or, not, in which the order of checking never matters.', first: 'l1-logic' },
  { id: 'vector', term: 'vector', gloss: 'Something you can add to others of its kind and rescale by numbers; arrows are one example but not the only one.', first: 'l1-vectors' },
  { id: 'vector-space', term: 'vector space', gloss: 'A collection of vectors in which every sum and every rescaling is again in the collection.', first: 'l1-vectors' },
  { id: 'inner-product', term: 'inner product $\\langle a|\\psi\\rangle$', gloss: 'A number measuring how much of $|\\psi\\rangle$ lies along $|a\\rangle$; zero means no overlap at all.', first: 'l1-vectors' },
  { id: 'hilbert-space', term: 'Hilbert space', gloss: 'A vector space that also has an inner product, so lengths and angles make sense; quantum states live in one.', first: 'l1-average' },
  { id: 'state-space', term: 'state space', gloss: 'The abstract space whose points are the possible states of a system; it is not a place in the lab.', first: 'l1-vectors' },
  { id: 'ket', term: 'ket $|\\psi\\rangle$', gloss: 'Dirac’s notation for a state written as a vector; the label inside the bracket is just a name.', first: 'l1-quantized' },
  { id: 'bra', term: 'bra $\\langle a|$', gloss: 'The partner of the ket $|a\\rangle$, used to take inner products: $\\langle a|$ followed by $|\\psi\\rangle$ gives the number $\\langle a|\\psi\\rangle$.', first: 'l1-quantized' },
  { id: 'orthogonal', term: 'orthogonal', gloss: 'At right angles; for states it means their inner product is zero.', first: 'l1-vectors' },
  { id: 'distinguishable', term: 'perfectly distinguishable', gloss: 'Describes two states that one well-chosen measurement always tells apart without error.', first: 'l1-vectors' },
  { id: 'basis', term: 'basis', gloss: 'A set of vectors from which every vector in the space can be built, in exactly one way, by rescaling and adding.', first: 'l1-vectors' },
  { id: 'orthonormal-basis', term: 'orthonormal basis', gloss: 'A basis whose vectors all have length 1 and are all at right angles to each other.', first: 'l1-vectors' },
  { id: 'amplitude', term: 'coefficient (amplitude) $\\alpha, \\beta$', gloss: 'The numbers that say how much of each basis vector goes into a state.', first: 'l1-vectors' },
  { id: 'normalized', term: 'normalized', gloss: 'Having length 1; for a state this means $|\\alpha|^2 + |\\beta|^2 = 1$, so the probabilities add to 1.', first: 'l1-vectors' },
  { id: 'born-rule', term: 'Born rule', gloss: 'The probability of an outcome is the squared size of the inner product between the outcome’s state and the system’s state: $P = |\\langle\\text{outcome}|\\psi\\rangle|^2$.', first: 'l1-vectors' },
  { id: 'superposition', term: 'superposition', gloss: 'A single state written as a sum of other states, such as $|{\\to}\\rangle = (|{\\uparrow}\\rangle + |{\\downarrow}\\rangle)/\\sqrt2$; it is one definite state, not a mixture.', first: 'l1-vectors' },
  { id: 'mixture', term: 'mixture', gloss: 'A beam in which different atoms are in different states, like the oven beam, so it records our uncertainty about which atom is which.', first: 'l1-vectors:b7' },
  { id: 'complex-number', term: 'complex number', gloss: 'A number $a + bi$ built from two ordinary numbers $a$ and $b$ and the special number $i$, which satisfies $i^2 = -1$.', first: 'l1-vectors' },
  { id: 'magnitude', term: 'size $|c|$ of a number', gloss: 'How far the number $c$ sits from zero, ignoring its sign or direction; for $c = a + bi$ it is $\\sqrt{a^2+b^2}$.', first: 'l1-vectors' },
  { id: 'global-phase', term: 'global phase', gloss: 'A common factor of size 1 (such as −1) that multiplies a whole state; it changes no prediction, so $|\\psi\\rangle$ and $-|\\psi\\rangle$ are the same state.', first: 'l1-vectors:b5' },
  { id: 'bloch-sphere', term: 'Bloch sphere', gloss: 'A picture in which every state of a qubit is a point on a ball’s surface (full treatment in Lecture 6).', first: 'l1-average' },
  { id: 'polarizer', term: 'polarizer', gloss: 'A filter that passes light vibrating along one direction and blocks light vibrating at right angles to it.', first: 'l1-average' },
  { id: 'errata', term: 'errata', gloss: 'Corrections to mistakes in published notes.', first: 'l1-average' },
]

export const GLOSSARY: ReadonlyMap<string, GlossEntry> = new Map(ENTRIES.map((e) => [e.id, e]))
