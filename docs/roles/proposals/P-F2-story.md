# P-F2-story — F2 "Vectors and inner products" (role P, Physics 709 Foundations)

Proposal only. Nothing under `app/` is modified. Format: `P-F1-story.md` (the Foundations style: an F chapter has
no lecture, so `[L]` holds the chapter's own ground-up line, sourced here from Axler, the 709 notes and N&C), with the
two standing gates of `P-Q8-story.md`: every derivation list, in **both** tracks, steps the stage through ≥ 2 distinct
views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one notation beat
(`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Design: `decisions/qc709-foundations.md` (F2 is the canonical
owner of ℂⁿ, ⟨·|·⟩, norm, orthonormality, Gram–Schmidt; it bridges back to F1 and does not re-teach complex numbers; the
Q chapters keep their inline teaching and gain Q→F bridges in a later wiring pass). Rulings: `qc709-remap.md` (no raw TeX;
engine-backed numbers with numpy twins), `qc709-nc.md` (N&C citing and names). Planned together with `P-F3-story.md`,
which takes this chapter's ℂⁿ, kets, inner products and bases to matrices and linear maps.

**Sources read.**
- Axler 4e §1A pp. 4–7 (ℝⁿ and ℂⁿ, lists, addition and scalar multiplication) and §1B pp. 12–13 (1.20, the vector-space
  definition); §6A pp. 182–190 (6.1 dot product, 6.2 inner product, 6.3 examples, 6.4 inner product space, 6.6 basic
  properties, 6.7 norm, 6.9 norm properties, 6.10 orthogonal, 6.12 Pythagorean theorem, 6.13 orthogonal decomposition,
  6.14 Cauchy–Schwarz, 6.17 triangle inequality); §6B pp. 197–201 (6.22 orthonormal, 6.24, 6.25, 6.27 orthonormal basis,
  6.28, 6.30 coefficients and Parseval, 6.32 Gram–Schmidt). Axler printed = PDF − 14, checked on p. 183 (PDF 197),
  p. 197 (PDF 211) and p. 201 (PDF 215).
- Nielsen & Chuang §2.1.1 pp. 62–63 (spanning sets, linear (in)dependence, basis, dimension; Fig. 2.1 Dirac notation),
  §2.1.4 pp. 65–67 (inner product, properties 2.13–2.15, ℂⁿ product 2.14, Hilbert space, orthonormal, Gram–Schmidt 2.17).
  N&C printed = PDF − 28 (`qc709-nc.md`).
- 709 notes `qc709-n1` pp. 3–5 (Dirac notation, the superposition principle, the vector-space axioms, the inner-product
  axioms, the norm, Fig. 3's projection ⟨α|β⟩/|α| = |β|cos θ) and `qc709-n2` pp. 6–7 (linear independence, basis,
  dimension, orthonormal ⟨αᵢ|αⱼ⟩ = δᵢⱼ, components cᵢ = ⟨eᵢ|ψ⟩, the Gram–Schmidt procedure, Fig. 4 in 3-D).
- What F1 already owns (bridge targets, not re-taught): `qc-complex-number`, `qc-modulus`, `qc-conjugate`, `qc-argument`,
  `qc-phase`, `qc-triangle-inequality` (the scalar case |z + w| ≤ |z| + |w|).

**Evidence.** Every number below was computed **twice**: by an independent numpy script
(`scratchpad/f23plan-verify.py`), each quantity along two routes (inner products by Σ conj·· and by matrix product;
Gram–Schmidt by the textbook formula and by numpy's QR; angles by arccos; components by projection), and by the app's
own engine — the exact call each claim's `F2.values.ts` entry will make. The two routes agree to 1e-9 on all 61 F2+F3
keys. **No new engine function is needed** (§9.1): `physics/linalg.ts` and `physics/qc/cmat.ts` already carry every
operation, with comments that name these very derivations (`projectOnto` "F2 shadow", `angleBetween` "F2 D2",
`components` "F2 D5", `isIndependent` "F2 independence", `weightedInner` "F2 Formal").

**Conventions** (F1's, plus these).
- Beat id `<unit>:b<n>`. Phase tags: **[L]** the chapter's core ramp (Axler + the notes); **[B]** a second source adds
  (N&C, or an Axler result beyond the ramp); **[C]** clue. Order L → B → C.
- Every beat has **G** (Ground-up: 9th-grade start, ≤ 25 words per sentence) and **F** (Formal: full notation,
  ≤ 40 words per sentence). Captions "cap G" / "cap F". Stage, terms, claims and bridges are shared by both tracks.
- **The inner product is conjugate-linear in the FIRST slot** (the physics/Dirac convention of the notes and N&C):
  ⟨α|β⟩ = Σ aᵢ* bᵢ, linear in |β⟩, antilinear in ⟨α|. This is the engine's `inner`.
- **Rosetta** (stated once, in `f2-inner-product:b2` cap F): Axler writes ⟨u, v⟩ **linear in the first slot**, so his
  ⟨u, v⟩ is our ⟨v|u⟩; his "absolute value" is F1's modulus; his GS coefficient ⟨vₖ, fⱼ⟩ is our ⟨fⱼ|vₖ⟩. N&C's (·,·)
  equals our ⟨·|·⟩ and is linear in the second slot, as here.
- **Real slice.** The `hilbert-plane` kind draws the real slice of ℂ² (axes |0⟩ = |+z⟩, |1⟩ = |−z⟩); it accepts only
  real kets (`+z`, `-z`, `+x`, `-x`, `{planeDeg}`), so complex amplitudes and phases are drawn on `amplitudes`
  (bars, hue = phase) and `complex-plane` (the scalar ⟨α|β⟩ as a point). The notes' Fig. 5 warning carries over: an
  angle in this plane is an angle in state space, not in the lab.
- Claims: `key` — statement — `engine call` → value, in `F2.values.ts` with `d(V.key, n)`; the plan prints the value
  for review only. No literal float in any G/F/caption string.
- Bridges `<<unit-id|shown>>`: F1 targets are its unit ids (`f1-plane`, `f1-euler`, …); 448 twin `l1-vectors` where a
  448 unit teaches the same idea. Q→F2 bridges are added by the later wiring pass, not here.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state; `split` is
for beat stages only).

| Shorthand | Expands to | Kind |
|---|---|---|
| `hp{…}` | `{kind:'hilbert-plane', course:'qc709', …}` (variant `plane709`; `psi`, `others`, `basis`, `shadows`, `rightAngle`, `arc`, `arcLabel`, `ticks`, `image`, `project`/`renormalize`, `sumOf`) | hilbert-plane |
| `amp(S, f)` | `{kind:'amplitudes', state:S, …f}` (S = `{ket}` or a 448 `{dir}`; `mode`, `dials`, `labels`, `sum`) | amplitudes |
| `cp{…}` | `{kind:'complex-plane', …}` (F1's kind: `z`, `w`, `spokes`, `chain`, `show`) | complex-plane |
| `bl(D, f)` | `{kind:'bloch', state:D, shot:'B-STD', …f}` | bloch |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` (the two kinds differ) | — |

PlaneKet forms: `+z`, `-z`, `+x`, `-x`, `{planeDeg:d}` (0° = |+z⟩ horizontal, 90° = |−z⟩ vertical), `{neg:k}`.

## 0. Chapter map

F2 answers the map's question: **"What is a quantum state, if you can add two of them and scale them like arrows, and
how do you measure the length of one and the angle between two?"** It stands alone (a 9th grader who has met F1's complex
numbers can start here) and is the bridge target for every later chapter that writes a ket, an inner product or a basis.

| # | id | Title (≤ 8 words) | Driving question | Sources | Bridges offered |
|---|---|---|---|---|---|
| 1 | `f2-vectors` | Lists you can add: ℂⁿ and kets | What is a state you can add and scale, and why complex entries? | Axler §1A pp. 4–7, §1B pp. 12–13; notes n1 pp. 3–4; N&C §2.1.1 p. 62 | `f1-plane` (complex entries), `l1-vectors` |
| 2 | `f2-inner-product` | Bra meets ket: ⟨α\|β⟩ | How do we multiply two states to get one number, and why conjugate the bra? | Axler §6A pp. 182–185 (6.1–6.6); notes n1 pp. 4–5; N&C §2.1.4 pp. 65–66 | `f1-plane` (conjugate), `l1-vectors` |
| 3 | `f2-norm-angle` | Length, right angles, and the law of cosines | How long is a state, when are two orthogonal, and what is the angle between them? | Axler §6A pp. 186–190 (6.7–6.17); notes n1 p. 5 Fig. 3 | `f1-plane` (modulus), `l1-vectors` |
| 4 | `f2-orthonormal` | A frame at right angles: components by inner products | What makes a basis the nicest kind, and how do we read a state's coordinates off it? | Axler §6B pp. 197–200 (6.22–6.31); notes n2 p. 6; N&C §2.1.1 p. 63 | `l1-vectors`, `f1-phase` (amplitudes) |
| 5 | `f2-gram-schmidt` | Straightening a skew frame: Gram–Schmidt | Given any independent set, how do we build a right-angled frame with the same span? | Axler §6B pp. 200–201 (6.32); notes n2 pp. 6–7 Fig. 4; N&C eq. 2.17 p. 66 | `l1-vectors` |

Forward F bridge: `f2-orthonormal:b5` → `f3-change-of-basis` (components in a new frame are a matrix times the old ones).

**Outcomes** (Ground wording):
- Say what ℂⁿ is: lists of complex numbers you can add and scale, and write a spin as a ket $\alpha|0\rangle + \beta|1\rangle$.
- Form the inner product $\langle\alpha|\beta\rangle$, and explain why the bra's numbers are conjugated.
- Find a state's length, tell when two states are orthogonal, and compute the angle between two real states.
- Read a state's coordinates off an orthonormal frame as inner products, and check them with Parseval's sum.
- Turn any independent set into an orthonormal frame by Gram–Schmidt, subtracting shadows and normalizing.

**Prerequisites** (concept ids): F1 `qc-complex-number`, `qc-modulus`, `qc-conjugate`, `qc-argument`. The Ground ramp
assumes the number line, Pythagoras, sin/cos, and F1's complex arithmetic (add, multiply, conjugate, modulus).

**Openers and films.** The Part F Blender opener ("the ring and the helix", F1 §10) already introduces the Part. F2's own
opener, film `qc-f2-shadow` (the Gram–Schmidt shadow subtraction, §10.2), is the `Unit.opener` of `f2-gram-schmidt`.

## 1. Story beats per unit

Kinds per unit (a derivation `view` may use only kinds the unit's beats show):
`f2-vectors` amplitudes, hilbert-plane · `f2-inner-product` amplitudes, complex-plane, hilbert-plane ·
`f2-norm-angle` hilbert-plane, bloch · `f2-orthonormal` hilbert-plane, amplitudes · `f2-gram-schmidt` hilbert-plane.
Fidelity items used: `qc-amp-engine`, `qc-amp-hue-is-phase`, `qc-amp-bars-not-places`, `qc-cplane-arithmetic`,
`qc-cplane-hue-is-angle`, the 709 `hilbert-plane` items (`hilbert-plane`, `qc-plane-vectors-not-states`), `bloch` (709
variant `bloch709`), `bloch-equator-unit-circle`.

### Unit `f2-vectors` — Lists you can add: ℂⁿ and kets

**`f2-vectors:b1` [L] · notation beat, `introduces: ['qc-ket', 'qc-complex-vector-space']`** (a state is a list)
- **G:** "A quantum state is written as a [[qc-ket|ket]], $|\psi\rangle$. In the simplest case it is a short list of complex numbers from F1. A spin can point up or down, so its ket is a list of two: $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$. The two numbers $\alpha$ and $\beta$ are complex."
- **F:** "A ket $|\psi\rangle$ is a vector in [[qc-complex-vector-space|$\mathbb C^n$]], the space of length-$n$ lists of complex numbers (Axler §1A; N&C Fig. 2.1). A qubit lives in $\mathbb C^2$: $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ with $\alpha, \beta \in \mathbb C$ and basis kets $|0\rangle = |{+}z\rangle$, $|1\rangle = |{-}z\rangle$ (notes n1 §I.B)."
- **Cap:** G "a qubit's two numbers written as a column" · F "$|\psi\rangle \in \mathbb C^2$: a column $(\alpha, \beta)^{\mathsf T}$"
- **Stage:** `amp({ket:'+x'}, {labels:'bits'})` — the two bars of $|{+}x\rangle$, each of size $1/\sqrt2$.
- **Claims:** `f2PlusXAmps` — the amplitudes of $|{+}x\rangle$ — `KET['+x']` → $(0.7071, 0.7071)$.
- **Terms:** `qc-complex-number` (F1, link-back).

**`f2-vectors:b2` [L]** (adding and scaling follow the usual rules)
- **G:** "Two states add by adding their lists, number by number, and you scale a state by multiplying every number by one scalar. These moves obey the rules you expect: order does not matter, there is a zero state, and every state has a negative. A set with these rules is a vector space."
- **F:** "$\mathbb C^n$ with componentwise addition and scalar multiplication is a vector space (Axler 1.20; notes n1 §I.B.2): addition is commutative and associative, with identity $0$ and inverse $-|\psi\rangle$, and scaling distributes over both sums. A superposition $c_1|\psi_1\rangle + c_2|\psi_2\rangle$ is again a state (the superposition principle)."
- **Cap:** G/F "tip to tail: $|\alpha\rangle + |\beta\rangle$ is the diagonal of the parallelogram"
- **Stage:** `hp{ sumOf:['+z', '+x'], ticks:true }` — the parallelogram of the notes' Fig. 2, sum at true length.
- **Refs:** notes n1 p. 3, Fig. 2 (addition is the parallelogram diagonal).
- **Claims:** `f2SumZX` — $|{+}z\rangle + |{+}x\rangle$ has length — `norm(vadd(KET['+z'], KET['+x']))` → $1.8478$.

**`f2-vectors:b3` [L]** (the spin-½ example)
- **G:** "The course's first space is the two complex numbers of a spin. In the z frame, $|{+}z\rangle$ is the list $(1, 0)$ and $|{-}z\rangle$ is $(0, 1)$. Then $|{+}x\rangle = (|{+}z\rangle + |{-}z\rangle)/\sqrt2$, the list $(1/\sqrt2,\ 1/\sqrt2)$."
- **F:** "In the $\{|{+}z\rangle, |{-}z\rangle\}$ frame, $|{+}z\rangle = (1, 0)$ and $|{-}z\rangle = (0, 1)$; the notes fix $|{\pm}x\rangle = (|{+}z\rangle \pm |{-}z\rangle)/\sqrt2$ (n2 eqs. 1.1–1.2). Each component is the complex amplitude F1 introduced; its size squared is a probability (Chapter Q1 owns that reading)."
- **Cap:** G "$|{+}x\rangle = (0.7071,\ 0.7071)$ in the z frame" · F "$|{+}x\rangle = \tfrac1{\sqrt2}(|{+}z\rangle + |{-}z\rangle)$"
- **Stage:** `split( hp{ psi:'+x', others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z' } / amp({ket:'+x'}, {labels:'bits'}) )`.
- **Claims:** `f2PlusXAmps` (reused) · `f2PlusZAmps` — `KET['+z']` → $(1, 0)$.
- **Bridge:** `<<l1-vectors|Spin Lab 1 Vectors for spin>>`.

**`f2-vectors:b4` [B]** (two spanning sets; N&C)
- **G:** "A set of states spans the space if every state is some combination of them. N&C gives two spanning sets for the spin space: the z pair $(1, 0), (0, 1)$, and the x pair $(1/\sqrt2, 1/\sqrt2), (1/\sqrt2, -1/\sqrt2)$. Either pair builds any state."
- **F:** "A list spans $V$ if every vector is a linear combination of it (N&C §2.1.1). For $\mathbb C^2$ both the computational pair and the $|{\pm}x\rangle$ pair span: any $(a_1, a_2) = a_1|0\rangle + a_2|1\rangle = \tfrac{a_1 + a_2}{\sqrt2}|{+}x\rangle + \tfrac{a_1 - a_2}{\sqrt2}|{-}x\rangle$ (N&C eq. 2.8)."
- **Cap:** G/F "the same state built from the z pair or the x pair"
- **Stage:** `split( hp{ psi:{planeDeg:30}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z' } / hp{ psi:{planeDeg:30}, others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x' } )`.
- **Refs:** N&C §2.1.1 p. 62 (two spanning sets for $\mathbb C^2$, eqs. 2.5–2.8).
- **Claims:** `f2PlusXAmps`, `f2MinusXAmps` — `KET['-x']` → $(0.7071, -0.7071)$.

**`f2-vectors:b5` [C]** (how many directions can a list have)
- **Q G:** "The three states $(1, 0)$, $(0, 1)$ and $(1, 1)$ all live in the spin space. Can all three be needed to build every state, or is one of them spare?"
- **Q F:** "Are $(1, 0)$, $(0, 1)$, $(1, 1)$ in $\mathbb C^2$ linearly independent?"
- **Reveal G:** "One is spare. The third is the first plus the second, so two already build everything. A space where two is the most you can have is called two-dimensional, which is why a spin needs exactly two numbers."
- **Reveal F:** "They are dependent: $(1,1) = (1,0) + (0,1)$, so $1\cdot(1,0) + 1\cdot(0,1) - 1\cdot(1,1) = 0$ with nonzero coefficients. The largest independent set in $\mathbb C^2$ has length 2 = $\dim \mathbb C^2$ (notes n2 §I.C.1); Chapter Q1's qubit is this $\dim = 2$."
- **Reveal cap:** G/F "$(1,1) = (1,0) + (0,1)$: three arrows, two directions"
- **Stage:** question `hp{ others:[{ket:'+z', role:'ghost', badge:'(1,0)'}, {ket:'-z', role:'ghost', badge:'(0,1)'}, {ket:'+x', role:'ghost', badge:'(1,1)'}] }`; reveal `hp{ sumOf:['+z', '-z'] }` (the sum lands on $(1,1)$ up to length).
- **Claims:** `f2DepThree` — `isIndependent([vec(1,0), vec(0,1), vec(1,1)])` → false (3 vectors, $\dim = 2$).
- **Note:** this is linear dependence by inspection, not N&C Exercise 2.1 (that exercise, (1,−1),(1,2),(2,1), is left for the `f2-orthonormal` challenge set, §4).

### Unit `f2-inner-product` — Bra meets ket: ⟨α|β⟩

**`f2-inner-product:b1` [L] · notation beat, `introduces: ['qc-bra', 'qc-inner-product']`** (the bra and the number it makes)
- **G:** "To every ket $|\alpha\rangle$ belongs a [[qc-bra|bra]] $\langle\alpha|$, its partner. Put a bra against a ket and you get one complex number, the [[qc-inner-product|inner product]] $\langle\alpha|\beta\rangle$. For lists, multiply matching numbers and add, but first mirror (conjugate) the bra's numbers: $\langle\alpha|\beta\rangle = a_1^* b_1 + a_2^* b_2$."
- **F:** "The inner product is a map $\mathbb C^n \times \mathbb C^n \to \mathbb C$, $\langle\alpha|\beta\rangle = \sum_i a_i^* b_i$ (notes n1 §I.B.3; N&C eq. 2.14). The bra $\langle\alpha|$ is the dual vector to $|\alpha\rangle$, a row of conjugated entries; $\langle\alpha|\beta\rangle = \langle\alpha|\,|\beta\rangle$ is the row-times-column product."
- **Cap:** G "$\langle\alpha|\beta\rangle$: mirror the bra, multiply, add" · F "$\langle\alpha|\beta\rangle = \sum_i a_i^* b_i$"
- **Stage:** `split( amp({ket:'+x'}, {dials:true}) / cp{ z:{re:0.7071, im:0.7071} } )` — the bars of one state and the scalar $\langle{+}z|{+}x\rangle$ as a point.
- **Claims:** `f2InnerZX` — $\langle{+}z|{+}x\rangle$ — `inner(KET['+z'], KET['+x'])` → $(0.7071, 0)$.
- **Terms:** `qc-conjugate` (F1, link-back: the star is F1's mirror).

**`f2-inner-product:b2` [L]** (the four rules an inner product obeys; Rosetta)
- **G:** "The inner product obeys four rules. A state with itself gives a number that is real and never negative; it is zero only for the zero state. Swapping the two states conjugates the answer: $\langle\beta|\alpha\rangle = \langle\alpha|\beta\rangle^*$. And it is linear in the ket on the right."
- **F:** "An inner product satisfies (Axler 6.2; N&C 2.13–2.15): positivity $\langle\alpha|\alpha\rangle \ge 0$ with equality iff $\alpha = 0$; conjugate symmetry $\langle\beta|\alpha\rangle = \langle\alpha|\beta\rangle^*$; linearity in the second slot $\langle\alpha|\,c_1\beta + c_2\gamma\rangle = c_1\langle\alpha|\beta\rangle + c_2\langle\alpha|\gamma\rangle$; hence conjugate-linearity in the first, $\langle c_1\beta + c_2\gamma|\alpha\rangle = c_1^*\langle\beta|\alpha\rangle + c_2^*\langle\gamma|\alpha\rangle$."
- **Cap:** G "swap the two states and the answer conjugates" · F "Rosetta: Axler's $\langle u, v\rangle$ is linear in the first slot, so Axler's $\langle u, v\rangle$ = our $\langle v|u\rangle$; N&C's $(\cdot,\cdot)$ = our $\langle\cdot|\cdot\rangle$"
- **Stage:** `split( cp{ z:{re:0.5, im:0.5}, show:['conj'] } / cp{ z:{re:0.5, im:-0.5} } )` — $\langle{+}x|{+}y\rangle$ and its conjugate $\langle{+}y|{+}x\rangle$.
- **Refs:** Axler 6.2 p. 183 (the definition and the first-slot convention); notes n1 p. 4.
- **Claims:** `f2InnerXY` — `inner(KET['+x'], KET['+y'])` → $(0.5, 0.5)$ · `f2InnerYX` — `inner(KET['+y'], KET['+x'])` → $(0.5, -0.5)$ = conjugate.

**`f2-inner-product:b3` [L]** (why mirror the bra; D1)
- **G:** "Why mirror the bra? So that a state with itself has an honest, non-negative size. Take $|{+}y\rangle = (1/\sqrt2,\ i/\sqrt2)$. With the mirror, $\langle{+}y|{+}y\rangle = 1$. Without it, the plain sum of squares is $\tfrac12 + \tfrac{i^2}2 = 0$: a nonzero state would have length zero."
- **F:** "Conjugation makes $\langle\alpha|\alpha\rangle = \sum_i |a_i|^2 \ge 0$ the squared length. The bare bilinear $\sum_i a_i b_i$ fails: for $|{+}y\rangle = (1/\sqrt2, i/\sqrt2)$ it gives $\tfrac12 + \tfrac{i^2}2 = 0$ (the engine's `bilinear`, the "forgot to conjugate" product), while $\langle{+}y|{+}y\rangle = \tfrac12 + \left|\tfrac{i}{\sqrt2}\right|^2 = 1$."
- **Cap:** G "$|{+}y\rangle$ with the mirror: 1; without: 0" · F "$\langle{+}y|{+}y\rangle = 1$, but $\sum a_i^2 = 0$"
- **Stage:** `amp({ket:'+y'}, {dials:true})` — the bars of $|{+}y\rangle$, the second with phase hue $90°$.
- **Derivation:** D1 (§2).
- **Claims:** `f2InnerYY` — `inner(KET['+y'], KET['+y'])` → $(1, 0)$ · `f2BilinearYY` — `bilinear(KET['+y'], KET['+y'])` → $(0, 0)$.
- **Fidelity:** `qc-amp-hue-is-phase`.

**`f2-inner-product:b4` [B]** (a weighted inner product; Axler 6.3, notes)
- **G:** "There is more than one inner product. Give each direction a positive weight and you get another honest inner product. Physics uses this when the natural units differ along different axes. The plain one, with all weights 1, is the default."
- **F:** "Any Hermitian positive-definite $M$ gives an inner product $\langle\alpha|\beta\rangle_M = \alpha^\dagger M \beta$ (Axler 6.3(b) for positive weights $c_i$; notes n1 p. 5 for $M$ Hermitian with positive eigenvalues; the engine's `weightedInner`). With $M = I$ this is the Euclidean product, the default for $\mathbb C^n$ (Axler 6.4)."
- **Cap:** G/F "weights $(2, 1)$: $\langle{+}x|{+}z\rangle_M = 1.4142$"
- **Stage:** `amp({ket:'+x'}, {labels:'bits'})` with a readout of the weighted product (caption carries the number).
- **Refs:** Axler 6.3 p. 184; notes n1 p. 5 (the $M$-weighted product).
- **Claims:** `f2WeightedXZ` — `weightedInner(diag2(2,1), KET['+x'], KET['+z'])` → $(1.4142, 0)$.

**`f2-inner-product:b5` [C]** (overlap of two different states)
- **Q G:** "The states $|{+}x\rangle$ and $|{+}y\rangle$ are both built from up and down in equal sizes. Is their inner product zero, or something else?"
- **Q F:** "Compute $\langle{+}x|{+}y\rangle$ and $|\langle{+}x|{+}y\rangle|^2$."
- **Reveal G:** "Not zero. It is $0.5 + 0.5i$, of size $1/\sqrt2$. Its size squared is $\tfrac12$: the chance an x-up spin passes a y-up test. Equal sizes along up and down do not make two states the same, because the phases differ."
- **Reveal F:** "$\langle{+}x|{+}y\rangle = \tfrac12 + \tfrac{i}2$, so $|\langle{+}x|{+}y\rangle|^2 = \tfrac12$ (Chapter Q1 reads this as a transition probability). The relative phase from F1, not just the sizes, fixes the overlap."
- **Reveal cap:** G/F "$|\langle{+}x|{+}y\rangle|^2 = 0.5$"
- **Stage:** question `split( amp({ket:'+x'}, {dials:true}) / amp({ket:'+y'}, {dials:true}) )`; reveal `cp{ z:{re:0.5, im:0.5}, show:['modulus'] }`.
- **Claims:** `f2InnerXY` (reused) · `f2InnerXYabs2` — `abs2(inner(KET['+x'], KET['+y']))` → $0.5$.
- **Bridge:** `<<f1-phase|F1.5 Phases you can and cannot see>>` (the phase inside $i/\sqrt2$).

### Unit `f2-norm-angle` — Length, right angles, and the law of cosines

**`f2-norm-angle:b1` [L] · notation beat, `introduces: ['qc-norm']`** (length is the root of the self inner product)
- **G:** "The length of a state, its [[qc-norm|norm]] $\|\psi\|$, is the square root of its inner product with itself: $\|\psi\| = \sqrt{\langle\psi|\psi\rangle}$. For $(a, b)$ with real parts this is Pythagoras, $\sqrt{a^2 + b^2}$. A state of length 1 is called a unit state; every physical spin is one."
- **F:** "The norm is $\|\psi\| = \sqrt{\langle\psi|\psi\rangle} = \sqrt{\sum_i |c_i|^2}$ (Axler 6.7; N&C 2.16). It vanishes only at $\psi = 0$ and scales as $\|\lambda\psi\| = |\lambda|\,\|\psi\|$ (Axler 6.9). A normalized (unit) state has $\|\psi\| = 1$; normalizing divides by the norm."
- **Cap:** G "$\|{+}x\| = 1$, a unit state" · F "$\|\psi\| = \sqrt{\langle\psi|\psi\rangle}$"
- **Stage:** `hp{ psi:{planeDeg:30}, ticks:true }` — one arrow of length 1 with its coordinates.
- **Claims:** `f2NormZplusX` — the length of $|{+}z\rangle + |{+}x\rangle$ — `norm(vadd(KET['+z'], KET['+x']))` → $1.8478$ · `f2NormPlusX` — `norm(KET['+x'])` → $1$.
- **Terms:** `qc-modulus` (F1, link-back: the norm of a one-number list is F1's modulus).

**`f2-norm-angle:b2` [L]** (orthogonal means the inner product is zero)
- **G:** "Two states are [[qc-orthogonal|orthogonal]] when their inner product is zero. For real arrows this means a right angle. Up and down are orthogonal: $\langle{+}z|{-}z\rangle = 0$. So are x-up and x-down: $\langle{+}x|{-}x\rangle = 0$, even though both mix up and down."
- **F:** "$|\alpha\rangle \perp |\beta\rangle$ iff $\langle\alpha|\beta\rangle = 0$ (Axler 6.10); the order does not matter, by conjugate symmetry. The computational basis is orthogonal, $\langle{+}z|{-}z\rangle = 0$, as is the x basis, $\langle{+}x|{-}x\rangle = 0$. Orthogonal in state space is not opposite in the lab (notes n2 Fig. 5)."
- **Cap:** G "$|{+}x\rangle \perp |{-}x\rangle$: a right angle in the plane" · F "$\langle{+}x|{-}x\rangle = 0$"
- **Stage:** `hp{ psi:'+x', others:[{ket:'-x', role:'second'}], rightAngle:true }`.
- **Claims:** `f2OrthXmX` — `inner(KET['+x'], KET['-x'])` → $(0, 0)$ · `f2OrthZmZ` — `inner(KET['+z'], KET['-z'])` → $(0, 0)$.
- **Fidelity:** `qc-plane-vectors-not-states`.

**`f2-norm-angle:b3` [L]** (Pythagoras for orthogonal states)
- **G:** "When two states are orthogonal, their lengths combine by Pythagoras. Add $|{+}x\rangle$ and $|{-}x\rangle$: the result has length squared $1 + 1 = 2$. Check it directly: the sum is $(\sqrt2,\ 0)$, whose length squared is 2."
- **F:** "For $\langle\alpha|\beta\rangle = 0$, $\|\alpha + \beta\|^2 = \|\alpha\|^2 + \|\beta\|^2$ (Pythagorean theorem, Axler 6.12). Here $\||{+}x\rangle + |{-}x\rangle\|^2 = 2 = \||{+}x\rangle\|^2 + \||{-}x\rangle\|^2$; the sum $(\sqrt2, 0) = \sqrt2\,|{+}z\rangle$."
- **Cap:** G "orthogonal: lengths² add, $1 + 1 = 2$" · F "$\|\alpha + \beta\|^2 = \|\alpha\|^2 + \|\beta\|^2$"
- **Stage:** `hp{ sumOf:['+x', '-x'], rightAngle:true }` — the right-angled sum, resultant length $\sqrt2$.
- **Claims:** `f2PythVal` — `norm2(vadd(KET['+x'], KET['-x']))` → $2$.

**`f2-norm-angle:b4` [L]** (the angle between two states; D2)
- **G:** "For real states the inner product measures the angle. Drop a perpendicular from one arrow onto the other, as the notes' Fig. 3 does: the shadow has length $\|\beta\|\cos\theta$, and $\langle\alpha|\beta\rangle = \|\alpha\|\,\|\beta\|\cos\theta$. For $|{+}z\rangle$ and $|{+}x\rangle$ this gives $\cos\theta = 1/\sqrt2$, so $\theta = 45°$."
- **F:** "For nonzero real vectors, $\operatorname{Re}\langle\alpha|\beta\rangle = \|\alpha\|\,\|\beta\|\cos\theta$ (Axler 6A Exercise 15; notes n1 Fig. 3), so $\theta = \arccos\!\big(\operatorname{Re}\langle\alpha|\beta\rangle / \|\alpha\|\|\beta\|\big) \in [0, \pi]$ (the engine's `angleBetween`). $\langle{+}z|{+}x\rangle = 1/\sqrt2 \Rightarrow \theta = 45°$, the notes' $|{\pm}x\rangle$-frame tilt."
- **Cap:** G "$|{+}z\rangle$ to $|{+}x\rangle$: $45°$" · F "$\cos\theta = \langle{+}z|{+}x\rangle = 1/\sqrt2$, $\theta = 45°$"
- **Stage:** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$\theta$', shadows:true }`.
- **Derivation:** D2 (§2).
- **Claims:** `f2AngleZX` — `angleBetween(KET['+z'], KET['+x'])` · 180/π → $45°$ · `f2InnerZX` (reused).
- **Note:** the state-space angle differs from the Bloch (lab) angle; the beat says so, and `bl` is offered as a contrast.

**`f2-norm-angle:b5` [B]** (Cauchy–Schwarz and the triangle inequality; D3)
- **G:** "A shadow is never longer than the arrow it came from. In symbols, $|\langle\alpha|\beta\rangle| \le \|\alpha\|\,\|\beta\|$. From it follows the triangle rule: two arrows laid end to end never reach farther than their lengths added, $\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|$."
- **F:** "Cauchy–Schwarz: $|\langle\alpha|\beta\rangle| \le \|\alpha\|\,\|\beta\|$, equality iff one is a scalar multiple of the other (Axler 6.14, from the orthogonal decomposition 6.13). The triangle inequality $\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|$ follows (Axler 6.17); it extends F1's $|z + w| \le |z| + |w|$ to vectors."
- **Cap:** G "the sum's arrow is no longer than the two lengths added" · F "$\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|$"
- **Stage:** `hp{ sumOf:['+z', '-z'] }` — the right-angle case, $\sqrt2 \le 2$.
- **Refs:** Axler 6.13–6.14 p. 188–189, 6.17 p. 190.
- **Claims:** `f2CS` — $|\langle{+}z|{+}x\rangle|$ — `abs(inner(KET['+z'], KET['+x']))` → $0.7071 \le 1$ · `f2TriStrict` — `norm(vadd(KET['+z'], KET['-z']))` → $1.4142 \le 2$ · `f2TriEqual` — `norm(vadd(vec(1,0), vec(2,0)))` → $3 = 1 + 2$.
- **Bridge:** `<<f1-plane|F1.2 Numbers as points and arrows>>` (the scalar triangle inequality).

**`f2-norm-angle:b6` [C]** (when is the triangle rule an equality)
- **Q G:** "When do two arrows laid end to end reach exactly as far as their lengths added? Try $(1, 0)$ with $(2, 0)$, and $(1, 0)$ with $(0, 1)$."
- **Q F:** "For which pairs is $\|\alpha + \beta\| = \|\alpha\| + \|\beta\|$?"
- **Reveal G:** "Only when they point the same way. $(1, 0)$ and $(2, 0)$ give $3 = 1 + 2$. But $(1, 0)$ and $(0, 1)$ give $\sqrt2 \approx 1.414$, short of $2$, because they turn a corner."
- **Reveal F:** "Equality holds iff one is a nonnegative real multiple of the other (Axler 6.17), the equality case of Cauchy–Schwarz. Parallel: $\|(3, 0)\| = 3 = 1 + 2$; orthogonal: $\|(1, 1)\| = \sqrt2 < 2$."
- **Reveal cap:** G/F "parallel: $3 = 1 + 2$; perpendicular: $1.414 < 2$"
- **Stage:** question `hp{ sumOf:['+z', '-z'] }`; reveal `hp{ sumOf:[{planeDeg:0}, {planeDeg:0}] }` (parallel) — the resultant lies along the arrows.
- **Claims:** `f2TriEqual` (reused) · `f2TriStrict` (reused).

### Unit `f2-orthonormal` — A frame at right angles: components by inner products

**`f2-orthonormal:b1` [L]** (independent, then a basis)
- **G:** "A set is [[qc-linear-independence|independent]] when the only way to combine them into the zero state is to use all-zero scalars. An independent set that also spans the space is a [[qc-basis|basis]]; its size is the space's [[qc-dimension|dimension]]. The spin space has dimension 2."
- **F:** "$\{|\alpha_i\rangle\}$ is linearly independent if $\sum_i c_i|\alpha_i\rangle = 0$ forces every $c_i = 0$ (notes n2 §I.C.1; N&C §2.1.1). An independent spanning set is a basis; all bases share one length, the dimension (N&C: $\dim \mathbb C^n = n$). The engine's `isIndependent` tests this by Gram–Schmidt residuals."
- **Cap:** G "two independent arrows: a basis for the plane" · F "$\dim \mathbb C^2 = 2$"
- **Stage:** `hp{ others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z' }`.
- **Claims:** `f2DepThree` (reused) · `f2IndepZmZ` — `isIndependent([KET['+z'], KET['-z']])` → true.

**`f2-orthonormal:b2` [L] · space beat, `introduces: ['qc-orthonormal-basis']`** (a frame at right angles)
- **G:** "The nicest basis is one where every vector has length 1 and any two are orthogonal: an [[qc-orthonormal-basis|orthonormal basis]], a right-angled frame. Written with the bracket, $\langle e_i|e_j\rangle = \delta_{ij}$, which is 1 when $i = j$ and 0 otherwise. The z pair and the x pair are both orthonormal frames."
- **F:** "An orthonormal basis has $\langle e_i|e_j\rangle = \delta_{ij}$ (Axler 6.27; N&C p. 66). Such a list is automatically independent (Axler 6.25), so any orthonormal list of length $\dim V$ is a basis (Axler 6.28). The standard basis of $\mathbb C^n$ is orthonormal; so is $\{|{+}x\rangle, |{-}x\rangle\}$."
- **Cap:** G "length 1, at right angles: $\langle e_i|e_j\rangle = \delta_{ij}$" · F "$\{|{+}x\rangle, |{-}x\rangle\}$: an orthonormal basis"
- **Stage:** `hp{ others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', rightAngle:true }`.
- **Claims:** `f2OrthXmX` (reused) · `f2NormPlusX` (reused: each frame vector has length 1).

**`f2-orthonormal:b3` [L]** (components are inner products; D5)
- **G:** "On an orthonormal frame the coordinates are easy: the $i$th coordinate of a state is just $\langle e_i|\psi\rangle$. No equations to solve. For $|\psi\rangle = 0.6|0\rangle + 0.8|1\rangle$, the z coordinates are $0.6$ and $0.8$, read straight off."
- **F:** "In an orthonormal basis, $|\psi\rangle = \sum_i \langle e_i|\psi\rangle\,|e_i\rangle$, so $c_i = \langle e_i|\psi\rangle$ (Axler 6.30(a); notes n2 §I.C.1). For $|\psi\rangle = 0.6|0\rangle + 0.8|1\rangle$: $c_0 = 0.6$, $c_1 = 0.8$ (the engine's `components`, which also handles a skew basis by inverting it)."
- **Cap:** G "coordinates are inner products: $c_i = \langle e_i|\psi\rangle$" · F "$c_0 = 0.6$, $c_1 = 0.8$"
- **Stage:** `split( hp{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z', shadows:true } / amp({dir:{thetaDeg:106.26, phiDeg:0}}, {mode:'amplitude'}) )`.
- **Derivation:** D5 (§2).
- **Claims:** `f2CompZ` — `[inner(KET['+z'], psi), inner(KET['-z'], psi)]` with $|\psi\rangle = (0.6, 0.8)$ → $0.6, 0.8$.
- **Note:** the plane angle $53.13°$ is the half-Bloch angle drawn for $|\psi\rangle = (0.6, 0.8)$; the `amp` pane shows the same two amplitudes as bars.

**`f2-orthonormal:b4` [L]** (the same state in another frame; Parseval; D5)
- **G:** "Change to the x frame and the coordinates change, but the total length does not. The same state $0.6|0\rangle + 0.8|1\rangle$ has x coordinates $0.9899$ and $-0.1414$. Their sizes squared still add to 1, because length is the same in every right-angled frame."
- **F:** "$c'_i = \langle e'_i|\psi\rangle$ in a second orthonormal basis; here $d_+ = \langle{+}x|\psi\rangle = 0.9899$, $d_- = \langle{-}x|\psi\rangle = -0.1414$. Parseval's identity $\|\psi\|^2 = \sum_i |c_i|^2$ (Axler 6.30(b)) holds in both: $0.6^2 + 0.8^2 = 0.9899^2 + 0.1414^2 = 1$. The components are frame-dependent; the length is not."
- **Cap:** G "x coordinates $0.9899$, $-0.1414$; lengths² still sum to 1" · F "Parseval: $\sum_i |c_i|^2 = 1$ in both frames"
- **Stage:** `split( hp{ psi:{planeDeg:53.13}, others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', shadows:true } / hp{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z', shadows:true } )`.
- **Derivation:** D5 (§2) continued.
- **Claims:** `f2CompX` — `[inner(KET['+x'], psi), inner(KET['-x'], psi)]` → $0.9899, -0.1414$ · `f2ParsevalX` — `abs2(d_+) + abs2(d_-)` → $1$.
- **Bridge:** `<<f3-change-of-basis|F3.5 The same map in a new frame>>` (the two coordinate lists are related by a matrix).

**`f2-orthonormal:b5` [B]** (completeness: the frame rebuilds the identity)
- **G:** "Add up, for each frame vector, its ket times its bra, and you get the do-nothing operation: $|e_1\rangle\langle e_1| + |e_2\rangle\langle e_2|$ leaves every state alone. This is why inserting the frame and reading off coordinates changes nothing."
- **F:** "Completeness: $\sum_i |e_i\rangle\langle e_i| = I$ for any orthonormal basis (notes n2 §I.C.4). For the z frame, $|0\rangle\langle 0| + |1\rangle\langle 1| = I$. Inserting $I = \sum_i |e_i\rangle\langle e_i|$ is the move behind $c_i = \langle e_i|\psi\rangle$ and behind every change of basis (Chapter F3)."
- **Cap:** G/F "$|0\rangle\langle 0| + |1\rangle\langle 1| = I$"
- **Stage:** `hp{ others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z', shadows:true }` — the two shadows of a state reassemble it.
- **Refs:** notes n2 p. 9 (completeness $\sum_k |\alpha_k\rangle\langle\alpha_k| = 1$).
- **Claims:** `f2Completeness` — `madd(outer(KET['+z'],KET['+z']), outer(KET['-z'],KET['-z']))` → $I$.
- **Terms:** `qc-outer-product` (the ket-bra $|e\rangle\langle e|$ is defined fully in F3; named here).

### Unit `f2-gram-schmidt` — Straightening a skew frame: Gram–Schmidt

Opener: film `qc-f2-shadow` (§10.2).

**`f2-gram-schmidt:b1` [L]** (the problem: a skew but independent pair)
- **G:** "Suppose you have two independent states that are not at right angles, say $|{+}x\rangle$ and $|{+}z\rangle$. They span the plane, but they are a skew frame: coordinates on them are awkward. Gram–Schmidt turns any such set into a right-angled frame with the same span."
- **F:** "Given a linearly independent list, the Gram–Schmidt procedure builds an orthonormal basis with the same span (Axler 6.32; notes n2 §I.C.2; N&C eq. 2.17). Start from $|{+}x\rangle$ (at $45°$) and $|{+}z\rangle$ (at $0°$): independent but not orthogonal, since $\langle{+}x|{+}z\rangle = 1/\sqrt2 \ne 0$."
- **Cap:** G "two independent arrows, not at a right angle" · F "$\langle{+}x|{+}z\rangle = 1/\sqrt2 \ne 0$: skew"
- **Stage:** `hp{ psi:'+x', others:[{ket:'+z', role:'second'}], arc:true, arcLabel:'$45°$' }`.
- **Claims:** `f2InnerZX` (reused) · `f2IndepXZ` — `isIndependent([KET['+x'], KET['+z']])` → true.

**`f2-gram-schmidt:b2` [L] · notation beat, `introduces: ['qc-projection']`** (subtract the shadow; D6)
- **G:** "Keep the first arrow and make it length 1: $e_1 = |{+}x\rangle$. Now take the second arrow's [[qc-projection|shadow]] on $e_1$ — the part that lies along it — and subtract it. What is left points at a right angle to $e_1$. The shadow's length here is $\langle e_1|{+}z\rangle = 0.7071$."
- **F:** "Set $e_1 = |{+}x\rangle$. The projection (shadow) of $|{+}z\rangle$ on $e_1$ is $|e_1\rangle\langle e_1|{+}z\rangle$; subtract it, leaving the residual $|{+}z\rangle - e_1\langle e_1|{+}z\rangle = (0.5, -0.5)$, orthogonal to $e_1$ (notes' orthogonal decomposition; the engine's `projectOnto`, "F2 shadow"). Here $\langle e_1|{+}z\rangle = 0.7071$."
- **Cap:** G "subtract the shadow; the leftover is at a right angle" · F "residual $= |{+}z\rangle - e_1\langle e_1|{+}z\rangle = (0.5, -0.5)$"
- **Stage:** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }` — $e_1$, the shadow of $|{+}z\rangle$ on it, and the residual at a right angle.
- **Derivation:** D6 (§2).
- **Claims:** `f2GsUnitShadow` — `inner(KET['+x'], KET['+z'])` → $0.7071$ · `f2GsUnitResid` — `vsub(KET['+z'], vscale(KET['+x'], inner(KET['+x'],KET['+z'])))` → $(0.5, -0.5)$.
- **Fidelity:** `hilbert-plane` (shadow at true length).

**`f2-gram-schmidt:b3` [L]** (normalize: the finished frame; D6)
- **G:** "Divide the leftover by its own length and you have the second frame vector, length 1 and at a right angle to the first. Starting from $|{+}x\rangle$ and $|{+}z\rangle$, Gram–Schmidt delivers exactly $|{+}x\rangle$ and $|{-}x\rangle$: the x frame, now right-angled."
- **F:** "Normalize the residual: $e_2 = (0.5, -0.5)/\|(0.5,-0.5)\| = |{-}x\rangle$. So $\{|{+}x\rangle, |{+}z\rangle\} \xrightarrow{\text{GS}} \{|{+}x\rangle, |{-}x\rangle\}$, an orthonormal basis with the same span (Axler 6.32; the engine's `orthonormalize` / `gramSchmidt`). Each new $e_k$ spans the same subspace as $v_1, \dots, v_k$."
- **Cap:** G "normalize the leftover: the frame $|{+}x\rangle$, $|{-}x\rangle$" · F "$e_2 = |{-}x\rangle$; $\operatorname{span}$ preserved"
- **Stage:** `hp{ others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', rightAngle:true }`.
- **Derivation:** D6 (§2), last steps.
- **Claims:** `f2GsUnitE1` — `orthonormalize([KET['+x'], KET['+z']])[0]` → $(0.7071, 0.7071)$ · `f2GsUnitE2` — `…[1]` → $(0.7071, -0.7071)$.

**`f2-gram-schmidt:b4` [B]** (it works over the complex numbers too)
- **G:** "The same recipe works when the numbers are complex. Take $(1, i)$ and $(1, 0)$. The first normalizes to $(1/\sqrt2,\ i/\sqrt2)$. Subtracting its shadow from the second and normalizing gives $(1/\sqrt2,\ -i/\sqrt2)$, at a right angle to the first."
- **F:** "Over $\mathbb C$: from $(1, i), (1, 0)$, Gram–Schmidt gives $e_1 = (1/\sqrt2, i/\sqrt2)$ and $e_2 = (1/\sqrt2, -i/\sqrt2)$, with $\langle e_1|e_2\rangle = 0$. The conjugation in $\langle e_1|v\rangle$ is exactly what keeps the shadow correct for complex entries (N&C eq. 2.17)."
- **Cap:** G/F "complex input $(1, i), (1, 0) \to (1/\sqrt2, \pm i/\sqrt2)$"
- **Stage:** `split( amp({ket:'+y'}, {dials:true}) / amp({ket:'-y'}, {dials:true}) )` — the two complex results shown as bars with phase hue (the plane is real-only).
- **Refs:** N&C eq. 2.17 p. 66.
- **Claims:** `f2GsCE1` — `orthonormalize([vec(1,I), vec(1,0)])[0]` → $(0.7071, 0.7071i)$ · `f2GsCE2` — `…[1]` → $(0.7071, -0.7071i)$ · `f2GsCOrtho` — `inner(e1, e2)` → $0$.
- **Note:** $(1/\sqrt2, \pm i/\sqrt2) = |{\pm}y\rangle$, so the complex GS output is the y frame; `amp` draws it because `hilbert-plane` is real-only.

**`f2-gram-schmidt:b5` [C]** (what if the vectors are dependent)
- **Q G:** "You feed Gram–Schmidt two arrows pointing the same way, $(1, 1)$ and $(2, 2)$. What happens at the second step?"
- **Q F:** "Run Gram–Schmidt on the dependent pair $(1, 1), (2, 2)$. What is the residual at step 2?"
- **Reveal G:** "The shadow of the second is the whole of it, so the leftover is zero. There is nothing to normalize. Gram–Schmidt reports only one frame vector: a dependent set cannot make a frame bigger than its span."
- **Reveal F:** "$(2, 2)$ is already a multiple of $(1, 1)$, so its residual after subtracting the shadow is $0$; the engine drops it (residual below tolerance). `orthonormalize` returns length 1, flagging dependence — this is the test behind `isIndependent`."
- **Reveal cap:** G/F "dependent: residual $0$, one frame vector only"
- **Stage:** question `hp{ others:[{ket:{planeDeg:45}, role:'ghost', badge:'(1,1)'}, {ket:{planeDeg:45}, role:'ghost', badge:'(2,2)'}] }`; reveal `hp{ others:[{ket:{planeDeg:45}, role:'basis'}] }`.
- **Claims:** `f2IndepFalse` — `isIndependent([vec(1,1), vec(2,2)])` → false · `f2GsDepLen` — `orthonormalize([vec(1,1), vec(2,2)]).length` → $1$.
- **Guard (HW1 P5):** 709 Homework 1 Problem 5 builds the spin-1 $S_x$ basis by Gram–Schmidt. F2 never uses that spin-1 construction; every GS example here is the spin-½ real pair, the complex y pair, or the dependent pair. See §12 Q1.

**Beat count:** 5 + 5 + 6 + 5 + 5 = **26 beats**, 4 of them clues with reveals. Phase mix: 18 [L] · 4 [B] · 4 [C].

## 2. Derivations

Each step is `tex` — `why` — **view** (the shorthand of the header) — *viewCaption*. A step without a view inherits the
latest earlier view in its own track's list. Every list has ≥ 2 distinct views whose kinds appear on the unit's stage;
Ground has at least as many steps as Formal; the last `tex` ends on the result.

**D1 · `f2-inner-product:b3` · result `\langle{+}y|{+}y\rangle = 1 \ne \textstyle\sum_i a_i^2 = 0`** (why conjugate the bra; notes n1 p. 4)
- Ground (3 views):
  1. `|{+}y\rangle = (1/\sqrt2,\ i/\sqrt2)` — The y-up spin needs an $i$ (F1): second amplitude of size $1/\sqrt2$ at $90°$. **view** `amp({ket:'+y'}, {dials:true})` · *two bars; the second's hue is $90°$*
  2. `\textstyle\sum_i a_i a_i = \tfrac12 + \tfrac{i^2}2 = 0` — Multiply matching numbers with no mirror: the second term is $i^2/2 = -\tfrac12$. **view** `cp{ z:{re:0, im:0} }` · *the bare product lands on $0$*
  3. `\langle{+}y|{+}y\rangle = \tfrac12 + \left|\tfrac{i}{\sqrt2}\right|^2 = 1` — Mirror the bra first: each term is a size squared, never negative. **view** `cp{ z:{re:1, im:0} }` · *with the mirror, the answer is $1$*
  4. `\langle{+}y|{+}y\rangle = 1 \ne \textstyle\sum_i a_i^2 = 0` — Only the mirrored product gives an honest length.
- Formal (2 views):
  1. `\textstyle\sum_i a_i^2 = \tfrac12 + \tfrac{i^2}2 = 0` — The bilinear form vanishes on $|{+}y\rangle$ (engine `bilinear`). **view** `cp{ z:{re:0, im:0} }`
  2. `\langle{+}y|{+}y\rangle = \sum_i |a_i|^2 = 1` — Conjugation makes the self-product the squared norm. **view** `cp{ z:{re:1, im:0} }`
- Check: `f2InnerYY`, `f2BilinearYY`. Kinds: amplitudes, complex-plane.

**D2 · `f2-norm-angle:b4` · result `\operatorname{Re}\langle\alpha|\beta\rangle = \|\alpha\|\,\|\beta\|\cos\theta`** (the law of cosines / angle; Axler 6A Ex. 15; notes n1 Fig. 3)
- Ground (3 views):
  1. `e = \alpha/\|\alpha\|` — Point a unit arrow $e$ along $\alpha$, so lengths are easy to read. **view** `hp{ psi:'+z', others:[{ket:'+x', role:'second'}] }` · *the two arrows from one origin*
  2. `\text{shadow of }\beta\text{ on }e = \langle e|\beta\rangle` — Drop a perpendicular from $\beta$'s tip onto $e$ (notes' Fig. 3); its signed length is $\langle e|\beta\rangle$. **view** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], shadows:true }` · *the shadow on $e$*
  3. `\langle e|\beta\rangle = \|\beta\|\cos\theta` — In the right triangle, the shadow is $\|\beta\|$ times $\cos$ of the angle $\theta$ between them. **view** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$\theta$' }` · *the angle $\theta$*
  4. `\operatorname{Re}\langle\alpha|\beta\rangle = \|\alpha\|\,\|\beta\|\cos\theta` — Multiply back by $\|\alpha\|$; the real part is all that survives for real arrows.
  5. `\theta = 45°\text{ for }|{+}z\rangle, |{+}x\rangle` — $\cos\theta = \langle{+}z|{+}x\rangle = 1/\sqrt2$. **view** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$45°$' }` · *$\theta = 45°$*
- Formal (2 views):
  1. `\operatorname{Re}\langle\alpha|\beta\rangle / (\|\alpha\|\|\beta\|) = \cos\theta` — Axler 6A Ex. 15; `angleBetween` returns $\arccos$ of this. **view** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], shadows:true }`
  2. `\theta = \arccos(1/\sqrt2) = 45°` — For $|{+}z\rangle, |{+}x\rangle$. **view** `hp{ psi:'+x', others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$45°$' }`
- Check: `f2AngleZX`, `f2InnerZX`. Kinds: hilbert-plane.

**D3 · `f2-norm-angle:b5` · result `\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|`** (Cauchy–Schwarz ⇒ triangle; Axler 6.13–6.17)
- Ground (3 views):
  1. `\alpha = c\beta + w,\ \ \langle w|\beta\rangle = 0,\ c = \langle\beta|\alpha\rangle/\|\beta\|^2` — Split $\alpha$ into a part along $\beta$ and a part at a right angle (the shadow and its leftover). **view** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }` · *shadow + leftover*
  2. `\|\alpha\|^2 = |c|^2\|\beta\|^2 + \|w\|^2 \ge |\langle\alpha|\beta\rangle|^2/\|\beta\|^2` — By Pythagoras the leftover only adds length, so dropping it can only shrink. **view** `hp{ sumOf:['+z', '-z'], rightAngle:true }` · *Pythagoras on the split*
  3. `|\langle\alpha|\beta\rangle| \le \|\alpha\|\,\|\beta\|` — Rearrange: the shadow is never longer than the arrow (Cauchy–Schwarz).
  4. `\|\alpha + \beta\|^2 = \|\alpha\|^2 + \|\beta\|^2 + 2\operatorname{Re}\langle\alpha|\beta\rangle \le (\|\alpha\| + \|\beta\|)^2` — Expand the squared length and bound the cross term by Cauchy–Schwarz. **view** `hp{ sumOf:['+z', '-z'] }` · *the sum's length vs the two lengths*
  5. `\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|` — Take square roots; lengths are never negative.
- Formal (2 views):
  1. `|\langle\alpha|\beta\rangle| \le \|\alpha\|\,\|\beta\|` — Cauchy–Schwarz from the orthogonal decomposition (Axler 6.13–6.14). **view** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }`
  2. `\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|` — Expand $\|\alpha + \beta\|^2$ and apply it (Axler 6.17). **view** `hp{ sumOf:['+z', '-z'] }`
- Check: `f2CS`, `f2TriStrict`, `f2TriEqual`. Kinds: hilbert-plane.

**D5 · `f2-orthonormal:b3`–`b4` · result `c_i = \langle e_i|\psi\rangle,\ \ \|\psi\|^2 = \textstyle\sum_i |c_i|^2`** (components and Parseval; Axler 6.30; notes n2 §I.C.1)
- Ground (4 views):
  1. `|\psi\rangle = c_0|e_0\rangle + c_1|e_1\rangle` — Write $\psi$ in the frame, with unknown coordinates $c_0, c_1$. **view** `hp{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z' }` · *$\psi$ and the z frame*
  2. `\langle e_i|\psi\rangle = c_0\langle e_i|e_0\rangle + c_1\langle e_i|e_1\rangle` — Take the inner product of both sides with one frame vector. **view** `hp{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z', shadows:true }` · *the shadows on each axis*
  3. `\langle e_i|\psi\rangle = c_i` — All cross terms vanish, since $\langle e_i|e_j\rangle = \delta_{ij}$. So each coordinate is one inner product.
  4. `c_0 = 0.6,\ c_1 = 0.8` — For $|\psi\rangle = 0.6|0\rangle + 0.8|1\rangle$. **view** `amp({dir:{thetaDeg:106.26, phiDeg:0}}, {mode:'amplitude'})` · *the two amplitudes as bars*
  5. `\|\psi\|^2 = |c_0|^2 + |c_1|^2 = 1` — The length squared is the sum of the coordinate sizes squared (Pythagoras again). **view** `hp{ psi:{planeDeg:53.13}, others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', shadows:true }` · *the same $\psi$ in the x frame: $0.9899, -0.1414$, still length 1*
  6. `c_i = \langle e_i|\psi\rangle,\ \ \|\psi\|^2 = \textstyle\sum_i |c_i|^2` — Coordinates are inner products; length is frame-free.
- Formal (2 views):
  1. `|\psi\rangle = \sum_i\langle e_i|\psi\rangle|e_i\rangle` — Take $\langle e_i|\cdot\rangle$ of a general expansion; orthonormality collapses the sum (Axler 6.30(a)). **view** `hp{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], basis:'z', shadows:true }`
  2. `\|\psi\|^2 = \sum_i|\langle e_i|\psi\rangle|^2` — Parseval (Axler 6.30(b)); $0.6^2 + 0.8^2 = 0.9899^2 + 0.1414^2 = 1$. **view** `hp{ psi:{planeDeg:53.13}, others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', shadows:true }`
- Check: `f2CompZ`, `f2CompX`, `f2ParsevalX`. Kinds: hilbert-plane, amplitudes.

**D6 · `f2-gram-schmidt:b2`–`b3` · result `\{|{+}x\rangle, |{+}z\rangle\} \xrightarrow{\text{GS}} \{|{+}x\rangle, |{-}x\rangle\}`** (Gram–Schmidt; Axler 6.32; notes n2 §I.C.2)
- Ground (4 views):
  1. `e_1 = |{+}x\rangle / \||{+}x\rangle\| = |{+}x\rangle` — Keep the first vector, make it length 1 (it already is). **view** `hp{ psi:'+x', others:[{ket:'+z', role:'second'}] }` · *$e_1$ and the skew $|{+}z\rangle$*
  2. `\langle e_1|{+}z\rangle = 1/\sqrt2` — Measure how much of $|{+}z\rangle$ lies along $e_1$. **view** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], shadows:true }` · *the shadow coefficient $0.7071$*
  3. `w = |{+}z\rangle - e_1\langle e_1|{+}z\rangle = (0.5, -0.5)` — Subtract that shadow; the leftover is at a right angle to $e_1$. **view** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }` · *shadow subtracted; residual at $90°$*
  4. `e_2 = w/\|w\| = |{-}x\rangle` — Normalize the leftover: the second frame vector. **view** `hp{ others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', rightAngle:true }` · *the finished x frame*
  5. `\{|{+}x\rangle, |{+}z\rangle\} \to \{|{+}x\rangle, |{-}x\rangle\}` — A skew pair becomes an orthonormal frame with the same span.
- Formal (2 views):
  1. `f_k = v_k - \sum_{j<k}\dfrac{\langle f_j|v_k\rangle}{\|f_j\|^2}f_j,\quad e_k = f_k/\|f_k\|` — The Gram–Schmidt formula (Axler 6.32; N&C 2.17); here $f_2 = |{+}z\rangle - |{+}x\rangle\langle{+}x|{+}z\rangle = (0.5, -0.5)$. **view** `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }`
  2. `\{|{+}x\rangle, |{+}z\rangle\} \to \{|{+}x\rangle, |{-}x\rangle\}` — Orthonormal, same span (engine `orthonormalize`). **view** `hp{ others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', rightAngle:true }`
- Check: `f2GsUnitShadow`, `f2GsUnitResid`, `f2GsUnitE1`, `f2GsUnitE2`. Kinds: hilbert-plane.

**View counts** (distinct views, Ground / Formal): D1 3/2 · D2 4/2 · D3 4/2 · D5 4/2 · D6 4/2. Ground steps ≥ Formal
steps in every pair. Every view's kind is on its unit's stage. No derivation needs a kind this chapter does not already
show; none needs a new engine function.

## 3. Try-it widget per unit

Existing widgets (`app/src/widgets/`; prop names are the real ones, reused from 448 L1/L3 and F1).

| Unit | Widget spec | Why this one |
|---|---|---|
| `f2-vectors` | `{kind:'hilbert-plane', props:{mode:'add', a:'+z', b:'+x'}}` | Drag two arrows; the parallelogram sum follows (b2). |
| `f2-inner-product` | `{kind:'amplitude-bars', props:{state:[90, 90], basis:'z'}}` · secondary `{kind:'complex-plane', props:{mode:'point'}}` | The bars carry the phase; the scalar $\langle\alpha|\beta\rangle$ lands as a point (b1, b5). |
| `f2-norm-angle` | `{kind:'hilbert-plane', props:{mode:'angle', a:'+z', b:{planeDeg:45}}}` | Drag the second arrow; read $\theta$ and $\langle\alpha|\beta\rangle$ live (b4). |
| `f2-orthonormal` | `{kind:'hilbert-plane', props:{mode:'components', basis:'x'}}` | Switch frames; the shadows and coordinates update, length fixed (b3–b4). |
| `f2-gram-schmidt` | proposed `{kind:'hilbert-plane', props:{mode:'gram-schmidt', v1:'+x', v2:'+z'}}` (new mode, §9.3) · until then `{kind:'hilbert-plane', props:{mode:'components', basis:'x'}}` | Watch the shadow subtracted and the leftover normalized (b2–b3). |

**Try this** (both tracks share the steps; F wording in brackets where it differs):
- `f2-vectors`: (1) Drag $|{+}z\rangle$ and $|{+}x\rangle$: where is the sum? (2) Scale one by 2. (3) Make the sum land on $(1,1)$. [Which scalars?]
- `f2-inner-product`: (1) Set both to $|{+}z\rangle$: $\langle\alpha|\beta\rangle = 1$. (2) Set them to $|{+}z\rangle$, $|{-}z\rangle$: $0$. (3) Set $|{+}x\rangle$, $|{+}y\rangle$. [Read the phase of the answer.]
- `f2-norm-angle`: (1) Put the arrows at $0°$ and $45°$: read $\theta$. (2) At $0°$ and $90°$: $\langle\alpha|\beta\rangle = 0$. (3) Make them parallel: triangle equality.
- `f2-orthonormal`: (1) Read a state's z coordinates. (2) Switch to the x frame: coordinates change. (3) Check the lengths² still sum to 1.
- `f2-gram-schmidt`: (1) Start with $|{+}x\rangle$, $|{+}z\rangle$. (2) Subtract the shadow: where does the leftover point? (3) Normalize it: name the frame.

## 4. Challenges per unit

Tolerance 0.005 unless stated, 0 for exact integers. Hints climb nudge → key idea → setup. **Homework:** 709 HW1 P5
(spin-1 $S_x$ Gram–Schmidt and the change-of-basis matrix $U$) overlaps `f2-gram-schmidt` and F3; its status is §12 Q1.
While it is unresolved, the one challenge that reproduces its construction (`f2-gs-spin1`) is **hints only**
(`walkthrough: []`); every other challenge is original with a full walkthrough.

### `f2-vectors`
1. **warm-up · numeric · `f2-v-amp`** — "Write $|{-}x\rangle$ in the z frame. What is its second number?"
   - Answer: **−0.7071** = `KET['-x'][1]`.
   - Hints: (1) $|{-}x\rangle = (|{+}z\rangle - |{-}z\rangle)/\sqrt2$. (2) The second number multiplies $|{-}z\rangle$. (3) $-1/\sqrt2$.
   - Walkthrough: $|{-}x\rangle = (1/\sqrt2,\ -1/\sqrt2)$, so the second number is $-0.7071$.
2. **core · choice · `f2-v-dependent`** — "Which set is linearly dependent in $\mathbb C^2$?"
   - Options: $(1,0), (0,1)$ · $(1,0), (1,1)$ · **$(1,0), (0,1), (1,1)$** ✓ · $(1,i), (1,0)$. Check: `isIndependent([vec(1,0),vec(0,1),vec(1,1)])` → false; the others → true.
   - Hints: (1) How many directions does $\mathbb C^2$ have? (2) Two. (3) A third vector must be spare.
   - Walkthrough: $(1,1) = (1,0) + (0,1)$; three vectors in a 2-D space are always dependent.
3. **core · numeric · `f2-v-super`** — "In $0.6|0\rangle + 0.8|1\rangle$, what is the coefficient of $|1\rangle$?"
   - Answer: **0.8** = `components(psi, [KET['+z'], KET['-z']])[1]` with $|\psi\rangle = (0.6, 0.8)$.
   - Hints: (1) It is the second entry. (2) Read it off. (3) $0.8$.
   - Walkthrough: $0.8$; its square, $0.64$, is the chance of reading $1$ (Chapter Q1).

### `f2-inner-product`
1. **warm-up · numeric · `f2-i-zx`** — "What is $\langle{+}z|{+}x\rangle$?"
   - Answer: **0.7071** = `inner(KET['+z'], KET['+x']).re`.
   - Hints: (1) Mirror the bra, multiply, add. (2) $1\cdot\tfrac1{\sqrt2} + 0\cdot\tfrac1{\sqrt2}$. (3) $1/\sqrt2$.
   - Walkthrough: $0.7071$.
2. **core · numeric · `f2-i-yy`** — "What is $\langle{+}y|{+}y\rangle$?"
   - Answer: **1** = `inner(KET['+y'], KET['+y']).re` (tolerance 1e−9).
   - Hints: (1) Mirror the bra: $i$ becomes $-i$. (2) $\tfrac12 + (-i)(i)/2$. (3) $(-i)(i) = 1$.
   - Walkthrough: $\tfrac12 + \tfrac12 = 1$; without the mirror you get $0$, a false length.
3. **core · numeric · `f2-i-overlap`** — "What is $|\langle{+}x|{+}y\rangle|^2$?"
   - Answer: **0.5** = `abs2(inner(KET['+x'], KET['+y']))`.
   - Hints: (1) $\langle{+}x|{+}y\rangle = \tfrac12 + \tfrac{i}2$. (2) Its size squared. (3) $\tfrac14 + \tfrac14$.
   - Walkthrough: $0.5$; equal sizes along up and down, but the phase makes the overlap less than 1.
4. **stretch · numeric · `f2-i-weighted`** — "With weights $(2, 1)$, what is $\langle{+}x|{+}z\rangle_M$?"
   - Answer: **1.4142** = `weightedInner(diag2(2,1), KET['+x'], KET['+z']).re`.
   - Hints: (1) $\alpha^\dagger M\beta$. (2) $M = \operatorname{diag}(2, 1)$. (3) $\tfrac1{\sqrt2}\cdot 2\cdot 1$.
   - Walkthrough: $2/\sqrt2 = \sqrt2 = 1.4142$.

### `f2-norm-angle`
1. **warm-up · numeric · `f2-n-len`** — "What is the length of $|{+}z\rangle + |{+}x\rangle$?"
   - Answer: **1.8478** = `norm(vadd(KET['+z'], KET['+x']))`.
   - Hints: (1) Add the lists. (2) $(1.7071,\ 0.7071)$. (3) $\sqrt{1.7071^2 + 0.7071^2}$.
   - Walkthrough: $\sqrt{3.4142} = 1.8478$, less than $1 + 1$ (triangle inequality).
2. **core · numeric · `f2-n-angle`** — "What is the angle between $|{+}z\rangle$ and $|{+}x\rangle$, in degrees?"
   - Answer: **45** = `angleBetween(KET['+z'], KET['+x'])` × 180/π.
   - Hints: (1) $\cos\theta = \langle{+}z|{+}x\rangle$. (2) $1/\sqrt2$. (3) $\arccos(1/\sqrt2)$.
   - Walkthrough: $45°$; the x frame is the z frame tilted $45°$ in state space.
3. **core · numeric · `f2-n-orth`** — "The states $|{+}x\rangle$ and $|{-}x\rangle$ are orthogonal. What is the angle between them, in degrees?"
   - Answer: **90** = `angleBetween(KET['+x'], KET['-x'])` × 180/π.
   - Hints: (1) $\langle{+}x|{-}x\rangle = 0$. (2) $\cos\theta = 0$. (3) $\arccos 0$.
   - Walkthrough: $90°$: orthogonal states sit at a right angle in the real slice, though they are opposite spins.
4. **stretch · choice · `f2-n-triangle`** — "For which pair is $\|\alpha + \beta\| = \|\alpha\| + \|\beta\|$?"
   - Options: $(1,0), (0,1)$ · **$(1,0), (2,0)$** ✓ · $(1,0), (-1,0)$ · $(1,1), (1,-1)$. Check: `norm(vadd(vec(1,0),vec(2,0)))` → 3 = `norm(vec(1,0)) + norm(vec(2,0))` → 1 + 2.
   - Hints: (1) Equality needs the same direction. (2) A nonnegative multiple. (3) $(2,0) = 2(1,0)$.
   - Walkthrough: $(1,0), (2,0)$ are parallel, so $3 = 1 + 2$. For $(1,0),(0,1)$: $\sqrt2 < 2$.

### `f2-orthonormal`
1. **warm-up · numeric · `f2-o-comp`** — "For $0.6|0\rangle + 0.8|1\rangle$, what is $\langle 0|\psi\rangle$?"
   - Answer: **0.6** = `inner(KET['+z'], psi).re`.
   - Hints: (1) The coordinate is an inner product. (2) $\langle 0|\psi\rangle = c_0$. (3) $0.6$.
   - Walkthrough: $0.6$.
2. **core · numeric · `f2-o-xframe`** — "The same state in the x frame: what is $\langle{+}x|\psi\rangle$?"
   - Answer: **0.9899** = `inner(KET['+x'], psi).re`.
   - Hints: (1) $\langle{+}x|\psi\rangle = (c_0 + c_1)/\sqrt2$. (2) $(0.6 + 0.8)/\sqrt2$. (3) $1.4/\sqrt2$.
   - Walkthrough: $0.9899$; check Parseval: $0.9899^2 + 0.1414^2 = 1$.
3. **core · choice · `f2-o-dependent` (N&C Ex. 2.1)** — "Which triple in $\mathbb C^2$ is linearly dependent?"
   - Options: **$(1,-1), (1,2), (2,1)$** ✓ · $(1,0), (0,1)$ · $(1,i)$ · $(1,1), (1,-1)$. Check: `isIndependent([vec(1,-1),vec(1,2),vec(2,1)])` → false.
   - Hints: (1) Three vectors in a 2-D space. (2) One is a combination of the others. (3) $(2,1) = (1,-1) + (1,2)$.
   - Walkthrough: $(1,-1) + (1,2) = (2,1)$, so the triple is dependent (this is N&C Exercise 2.1, not a homework item).
4. **stretch · numeric · `f2-o-parseval`** — "For $\langle{+}x|\psi\rangle = 0.9899$ and $\langle{-}x|\psi\rangle = -0.1414$, what is $\sum |c'|^2$?"
   - Answer: **1** = `abs2(dx[0]) + abs2(dx[1])` (tolerance 1e−6).
   - Hints: (1) Parseval. (2) Add the squares. (3) $0.98 + 0.02$.
   - Walkthrough: $1$: the length is the same in every orthonormal frame.

### `f2-gram-schmidt`
1. **warm-up · numeric · `f2-gs-shadow`** — "Gram–Schmidt on $|{+}x\rangle$ then $|{+}z\rangle$: what is the shadow coefficient $\langle{+}x|{+}z\rangle$?"
   - Answer: **0.7071** = `inner(KET['+x'], KET['+z']).re`.
   - Hints: (1) Keep $e_1 = |{+}x\rangle$. (2) The shadow of $|{+}z\rangle$ on it. (3) $\langle{+}x|{+}z\rangle$.
   - Walkthrough: $0.7071$; subtracting $0.7071\,e_1$ from $|{+}z\rangle$ leaves $(0.5, -0.5)$.
2. **core · numeric · `f2-gs-second`** — "After Gram–Schmidt on $|{+}x\rangle, |{+}z\rangle$, what is the first entry of $e_2$?"
   - Answer: **0.7071** = `orthonormalize([KET['+x'], KET['+z']])[1][0].re`.
   - Hints: (1) The leftover is $(0.5, -0.5)$. (2) Normalize it. (3) Divide by $\sqrt{0.5}$.
   - Walkthrough: $e_2 = (0.7071, -0.7071) = |{-}x\rangle$.
3. **core · numeric · `f2-gs-complex`** — "Gram–Schmidt on $(1, i)$ then $(1, 0)$: the second entry of $e_1$ has what size?"
   - Answer: **0.7071** = `abs(orthonormalize([vec(1,I), vec(1,0)])[0][1])`.
   - Hints: (1) Normalize $(1, i)$. (2) Its length is $\sqrt2$. (3) $|i|/\sqrt2$.
   - Walkthrough: $e_1 = (1/\sqrt2,\ i/\sqrt2)$, so the second entry has size $0.7071$.
4. **stretch · numeric · `f2-gs-spin1` · `assigned: '709 HW1 P5'`** (hints only; §12 Q1) — "A spin-1 particle: adjoin $|{+1}z\rangle$ to the orthonormal pair $\{|{+1}x\rangle, |{-1}x\rangle\}$ and Gram–Schmidt it. The result $|0x\rangle$ satisfies $\hat S_x|0x\rangle = 0$. What eigenvalue of $S_x$ does it carry, in units of $\hbar$?"
   - Answer: **0** = the middle $S_x$ eigenvalue.
   - Hints only: (1) Which vectors are you orthogonalizing against? (2) Subtract both shadows from $|{+1}z\rangle$. (3) The leftover is the missing $S_x$ eigenstate.
   - Walkthrough: withheld while 709 HW1 P5 is assigned (§12 Q1).

## 5. Glossary terms new in F2

Ids start `qc-` (709 namespace). `introduces` marks the notation and space beats (W-709 #8). Inline math is TeX inside
`$…$`. Ground gloss ≤ 25 words. `bridge` = a 448 or F1 unit whose glossary teaches the same idea.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-ket` | ket $\|\psi\rangle$ | notation | A quantum state written as a column of complex numbers. | A vector $\|\psi\rangle \in \mathbb C^n$; a qubit's is $(\alpha, \beta)^{\mathsf T}$. | `f2-vectors:b1` | `l1-vectors` |
| `qc-complex-vector-space` | complex vector space $\mathbb C^n$ | space | The space of length-$n$ lists of complex numbers you can add and scale. | $\mathbb C^n$ with componentwise $+$ and scalar $\cdot$ (Axler 1.20); $\dim = n$. | `f2-vectors:b1` | `l2-vector-space` |
| `qc-superposition` | superposition | — | Any sum of states, scaled by complex numbers, is again a state. | $c_1\|\psi_1\rangle + c_2\|\psi_2\rangle \in V$ (the superposition principle, notes n1). | `f2-vectors:b2` | `l1-vectors` |
| `qc-bra` | bra $\langle\alpha\|$ | notation | The partner of a ket: a row of its conjugated numbers. | The dual vector to $\|\alpha\rangle$; $\langle\alpha\|\beta\rangle = \langle\alpha\|\,\|\beta\rangle$ (N&C). | `f2-inner-product:b1` | — |
| `qc-inner-product` | inner product $\langle\alpha\|\beta\rangle$ | notation | One complex number from a bra and a ket: mirror the bra, multiply, add. | $\langle\alpha\|\beta\rangle = \sum_i a_i^* b_i$; linear in the ket, conjugate-linear in the bra (Axler 6.2; notes n1). | `f2-inner-product:b1` | `l1-vectors` |
| `qc-norm` | norm (length) $\|\psi\|$ | notation | The length of a state: the square root of its inner product with itself. | $\|\psi\| = \sqrt{\langle\psi\|\psi\rangle} = \sqrt{\sum_i\|c_i\|^2}$ (Axler 6.7). | `f2-norm-angle:b1` | `qc-modulus` (F1) |
| `qc-orthogonal` | orthogonal | — | Two states whose inner product is zero; for real arrows, a right angle. | $\langle\alpha\|\beta\rangle = 0$ (Axler 6.10). | `f2-norm-angle:b2` | — |
| `qc-linear-independence` | linear independence | — | A set where no state is a combination of the others. | $\sum_i c_i\|\alpha_i\rangle = 0 \Rightarrow$ all $c_i = 0$ (notes n2; N&C). | `f2-orthonormal:b1` | — |
| `qc-basis` | basis | — | An independent set that builds every state in the space. | An independent spanning list; all bases share one length. | `f2-orthonormal:b1` | `l2-vector-space` |
| `qc-dimension` | dimension | — | How many numbers a state needs: the size of any basis. | The common length of every basis of $V$; $\dim \mathbb C^n = n$. | `f2-orthonormal:b1` | — |
| `qc-orthonormal-basis` | orthonormal basis | space | A basis of unit states, each at right angles to the others. | $\langle e_i\|e_j\rangle = \delta_{ij}$ and spanning (Axler 6.27); coordinates $c_i = \langle e_i\|\psi\rangle$. | `f2-orthonormal:b2` | `l1-vectors` |
| `qc-projection` | projection (shadow) | notation | The part of one state that lies along another: its shadow. | $\|e\rangle\langle e\|\psi\rangle$ onto a unit $\|e\rangle$ (engine `projectOnto`). | `f2-gram-schmidt:b2` | — |

Reused from F1 (link-back, not re-introduced): `qc-complex-number`, `qc-modulus`, `qc-conjugate`, `qc-argument`,
`qc-phase`, `qc-triangle-inequality` (the vector form $\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|$ extends F1's scalar
case; `f2-norm-angle:b5` links back, no new gloss). `qc-outer-product` is named in `f2-orthonormal:b5` and owned/defined
by F3 (`f3-matrix-of-map`). Closure: every technical word in these glosses has its own entry here, in F1, or is 9th-grade.

**Notation and space beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-ket` | notation | `f2-vectors:b1` | `amp({ket:'+x'}, {labels:'bits'})` |
| `qc-complex-vector-space` | space | `f2-vectors:b1` | `amp({ket:'+x'}, {labels:'bits'})` (same beat; the eyebrow reads "New space") |
| `qc-bra` | notation | `f2-inner-product:b1` | `split( amp({ket:'+x'}, {dials:true}) / cp{ z:{re:0.7071, im:0.7071} } )` |
| `qc-inner-product` | notation | `f2-inner-product:b1` | as above (same beat) |
| `qc-norm` | notation | `f2-norm-angle:b1` | `hp{ psi:{planeDeg:30}, ticks:true }` |
| `qc-orthonormal-basis` | space | `f2-orthonormal:b2` | `hp{ others:[{ket:'+x', role:'basis'}, {ket:'-x', role:'basis'}], basis:'x', rightAngle:true }` |
| `qc-projection` | notation | `f2-gram-schmidt:b2` | `hp{ psi:'+z', others:[{ket:'+x', role:'basis'}], project:1, shadows:true }` |

Two gloss ids share one beat (`f2-vectors:b1` introduces both `qc-ket` and `qc-complex-vector-space`; `f2-inner-product:b1`
introduces both `qc-bra` and `qc-inner-product`). `content.test.tsx` checks exactly one *beat* per gloss id; a beat
introducing two ids via `Beat.introduces: ['a','b']` is allowed (as `q8-pure-rho:b1` and others do). §12 Q3 confirms.

## 6. Review card per unit (both tracks)

Every number is an F2 claim from §1 or §4.

### `f2-vectors`
- **G points:** (1) A state is a ket: a list of complex numbers. (2) Add lists entry by entry; scale by one number. (3) A spin lives in $\mathbb C^2$: $\alpha|0\rangle + \beta|1\rangle$. (4) Three vectors in a 2-D space are always dependent.
- **F points:** (1) $\mathbb C^n$ is a vector space (Axler 1.20). (2) A spanning set builds every vector; an independent spanning set is a basis. (3) $\dim \mathbb C^2 = 2$.
- **Equations:** $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\quad |{+}x\rangle = (|{+}z\rangle + |{-}z\rangle)/\sqrt2$
- **Trap (both):** "more arrows means more directions". $(1,1) = (1,0) + (0,1)$: the third adds nothing.

### `f2-inner-product`
- **G points:** (1) A bra against a ket gives one number. (2) Mirror the bra: $\langle\alpha|\beta\rangle = \sum a_i^* b_i$. (3) Swapping conjugates the answer. (4) Without the mirror, $|{+}y\rangle$ would have length zero.
- **F points:** (1) Positivity, conjugate symmetry, linearity in the ket. (2) $\langle{+}y|{+}y\rangle = 1$ but the bilinear sum is $0$. (3) A weighted $\langle\cdot|\cdot\rangle_M$ with Hermitian positive-definite $M$ is also an inner product.
- **Equations:** $\langle\alpha|\beta\rangle = \sum_i a_i^* b_i,\quad \langle\beta|\alpha\rangle = \langle\alpha|\beta\rangle^*$
- **Trap:** forgetting the conjugate. For $|{+}y\rangle$, $\sum a_i^2 = 0$ while $\langle{+}y|{+}y\rangle = 1$.

### `f2-norm-angle`
- **G points:** (1) Length is $\sqrt{\langle\psi|\psi\rangle}$. (2) Orthogonal means the inner product is zero. (3) Orthogonal lengths² add (Pythagoras). (4) $\langle\alpha|\beta\rangle = \|\alpha\|\|\beta\|\cos\theta$ for real arrows.
- **F points:** (1) $\|\lambda\psi\| = |\lambda|\|\psi\|$. (2) Cauchy–Schwarz $|\langle\alpha|\beta\rangle| \le \|\alpha\|\|\beta\|$. (3) Triangle $\|\alpha + \beta\| \le \|\alpha\| + \|\beta\|$, equal iff parallel.
- **Equations:** $\|\psi\| = \sqrt{\langle\psi|\psi\rangle},\quad \cos\theta = \operatorname{Re}\langle\alpha|\beta\rangle / \|\alpha\|\|\beta\|$
- **Trap:** reading the state-space angle as a lab angle. $|{+}x\rangle \perp |{-}x\rangle$ at $90°$ in the slice, yet they are opposite spins.

### `f2-orthonormal`
- **G points:** (1) Independent + spanning = a basis; its size is the dimension. (2) An orthonormal frame has unit, right-angled vectors. (3) Coordinates are inner products: $c_i = \langle e_i|\psi\rangle$. (4) The length is the same in every frame.
- **F points:** (1) $\langle e_i|e_j\rangle = \delta_{ij}$. (2) $|\psi\rangle = \sum_i\langle e_i|\psi\rangle|e_i\rangle$. (3) Parseval $\|\psi\|^2 = \sum_i|c_i|^2$; completeness $\sum_i|e_i\rangle\langle e_i| = I$.
- **Equations:** $c_i = \langle e_i|\psi\rangle,\quad \sum_i|e_i\rangle\langle e_i| = I$
- **Trap:** thinking coordinates are properties of the state. They change with the frame; the length does not.

### `f2-gram-schmidt`
- **G points:** (1) Keep the first vector, normalize it. (2) Subtract each later vector's shadow on the ones kept. (3) Normalize the leftover. (4) A dependent vector leaves a zero leftover and is dropped.
- **F points:** (1) $f_k = v_k - \sum_{j<k}\langle f_j|v_k\rangle f_j/\|f_j\|^2$, $e_k = f_k/\|f_k\|$. (2) The result is orthonormal with the same span (Axler 6.32). (3) It works over $\mathbb C$ because $\langle f_j|v_k\rangle$ conjugates.
- **Equations:** $e_1 = v_1/\|v_1\|,\quad w = v_2 - e_1\langle e_1|v_2\rangle,\quad e_2 = w/\|w\|$
- **Trap:** using the bare product $\sum f_j v_k$ instead of $\langle f_j|v_k\rangle$: the shadow comes out wrong for complex vectors.

## 7. Symbol-before-use tables

Reading order: units in order; inside a unit, beats (L → B → C, reveals in place), then Try it, review, challenges.
Abbreviations ve, ip, na, on, gs for the five units. Status: OK · **FLAG** (clash or early use) · gloss.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\|\psi\rangle$, $\|0\rangle$, $\|1\rangle$ | ve:b1 | ve:b1 | OK | Tag `qc-ket`; $\|0\rangle = \|{+}z\rangle$ said in place. |
| $\alpha, \beta$ | ve:b1 | ve:b1 | OK | Amplitudes (F1's letters); never angles in F2. |
| $\mathbb C^2$, $\mathbb C^n$ | ve:b1 | ve:b1 | OK | Tag `qc-complex-vector-space`. |
| $\|{\pm}x\rangle$, $\|{\pm}z\rangle$ | ve:b3 | ve:b3 | OK | The notes' frame vectors. |
| $\langle\alpha\|$, $\langle\alpha\|\beta\rangle$ | ip:b1 | ip:b1 | OK | Tags `qc-bra`, `qc-inner-product`. |
| $a_i^*$ | ip:b1 | ip:b1; F1 (mirror) | OK | F1's conjugate. |
| $\|{\pm}y\rangle$ | ip:b3 | ip:b3 | OK | Needs F1's $i$; drawn on `amplitudes`. |
| $\|\psi\|$ | na:b1 | na:b1 | OK | Tag `qc-norm`. |
| $\theta$ | na:b4 | na:b4 | OK | A state-space angle; not a lab angle (said in place). |
| $\delta_{ij}$ | on:b2 | on:b2 | OK | "1 if $i = j$, else 0" said in place. |
| $e_1, e_2, e_i$ | on:b2 | on:b2 | OK | Frame vectors. |
| $c_i$ | on:b3 | on:b3 | OK | Coordinates. |
| $I$ | on:b5 | on:b5 | OK | The do-nothing operation; full in F3. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\mathbb C^n$, $(\alpha, \beta)^{\mathsf T}$ | ve:b1 | ve:b1 | OK | — |
| $\langle u, v\rangle$ (Axler) | ip:b2 cap | ip:b2 Rosetta | OK | First-slot-linear; equals our $\langle v\|u\rangle$. |
| $(\cdot,\cdot)$ (N&C) | ip:b2 | ip:b2 Rosetta | OK | Equals our $\langle\cdot\|\cdot\rangle$. |
| $\langle\cdot\|\cdot\rangle_M$ | ip:b4 | ip:b4 | OK | Weighted; $M$ Hermitian positive-definite. |
| $\perp$ | na:b2 | na:b2 | OK | "orthogonal to". |
| $\dim V$ | on:b1 | on:b1 | OK | — |
| $\sum_i\|e_i\rangle\langle e_i\|$ | on:b5 | on:b5 | OK | Completeness; $\|e\rangle\langle e\|$ is F3's outer product, named here. |
| $f_k$, $\|f_k\|$ | gs:b3 (D6) | gs:b3 | OK | Gram–Schmidt intermediates. |

**Counts:** 0 Ground FLAGs, 0 Formal FLAGs. The Axler/N&C/physics slot conventions are reconciled once, in the
`f2-inner-product:b2` Rosetta caption, before any inner product is computed.

## 8. Errata

**No `Correction` in F2.** Every statement from Axler §1A, §1B, §6A, §6B, N&C §2.1.1/§2.1.4, and notes n1 pp. 3–5 and
n2 pp. 6–7 was re-checked (§ Evidence) and holds. Items for the record:

| # | Where | Finding | Action |
|---|---|---|---|
| F2-E1 | Inner-product slot | Axler is linear in the FIRST slot; the notes, N&C and this course are linear in the SECOND (conjugate-linear in the first). | Rosetta caption in `f2-inner-product:b2`; the engine `inner` is conjugate-linear in the first slot. |
| F2-E2 | Gram–Schmidt formula | Axler 6.32 writes the coefficient $\langle v_k, f_j\rangle$ (his first-slot product); in our convention it is $\langle f_j|v_k\rangle$. | D6 and the notes (n2 eq.) use $\langle f_j|v_k\rangle$; the engine `orthonormalize` matches. |
| F2-E3 | Notation | Axler's "absolute value" / $\bar z$ vs F1's modulus / $z^*$. | Carried from F1 (F1-E3); no new Rosetta needed. |
| F2-E4 | Notes n2 Fig. 5 | The drawing is the real slice; the state-space angle is not the lab angle, and $\langle{+}x|{-}x\rangle = 0$ despite opposite spins. | `f2-norm-angle:b2`, b4 say so; `qc-plane-vectors-not-states` fidelity. |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine — **no new functions**
Every F2 number comes from existing functions, which the comments in `physics/linalg.ts` and `physics/qc/cmat.ts`
already tie to these units. The numpy twin route for each is `scratchpad/f23plan-verify.py` (and the repo's
`pipeline/make_qc_fixtures.py` block "cmat").

| Operation | Function (module) | Used by | numpy twin |
|---|---|---|---|
| $\langle\alpha\|\beta\rangle = \sum a_i^* b_i$ | `inner` (linalg) | ip, na, on, gs | `np.vdot` and explicit $\sum \bar a_i b_i$ |
| $\sum a_i b_i$ (no conjugate) | `bilinear` (linalg) | ip:b3, D1 | $\sum a_i b_i$ |
| $\alpha^\dagger M\beta$ | `weightedInner` (cmat, "F2 Formal") | ip:b4 | $\bar\alpha\,(M\beta)$ |
| $\|\psi\| = \sqrt{\langle\psi\|\psi\rangle}$ | `norm`, `norm2` (linalg) | na, on | $\sqrt{\sum\|c_i\|^2}$ |
| angle $\arccos(\operatorname{Re}\langle\alpha\|\beta\rangle/\|\alpha\|\|\beta\|)$ | `angleBetween` (cmat, "F2 D2") | na:b4, D2 | `np.arccos` |
| $c_i = \langle e_i\|\psi\rangle$ (any basis) | `components` (cmat, "F2 D5") | on:b3–b4, D5 | projection; $B^{-1}\psi$ for a skew basis |
| orthonormal test | `isIndependent` (cmat, "F2 independence") | ve:b5, on:b1, gs:b5 | `matrix_rank` |
| projection (shadow) | `projectOnto` (cmat, "F2 shadow") | gs:b2, D6 | $\sum\|e_k\rangle\langle e_k\|\psi\rangle$ |
| Gram–Schmidt | `orthonormalize`, `gramSchmidt` (cmat/linalg) | gs:b2–b5, D6 | textbook formula and numpy QR |
| completeness $\sum\|e_i\rangle\langle e_i\|$ | `outer`, `madd` (linalg) | on:b5 | $\sum$ outer products |

### 9.2 Stage contract — existing fields suffice, with one small gap
F2 uses the **merged** kinds only. `hilbert-plane` (709 variant `plane709`): `psi`, `others[]` with roles
`basis`/`second`/`ghost` and `badge`, `basis: 'z'|'x'`, `shadows`, `rightAngle`, `arc`, `arcLabel`, `ticks`, `sumOf`,
`project`/`renormalize`. `amplitudes`: `{ket}`/`{dir}` sources, `mode`, `dials`, `labels:'bits'`. `complex-plane`:
`z` with `show:['conj','modulus']`. `bloch` (709 variant) for the lab-angle contrast in `f2-norm-angle`.

| # | Gap | Proposal | Fallback |
|---|---|---|---|
| S1 | `hilbert-plane` draws `project` only for a frame vector (1 or 2) and `shadows` for the current `basis`. Gram–Schmidt needs the shadow of one *arbitrary* kept vector and the residual (gs:b2, D6). | Additive `shadow?: { of: PlaneKet; onto: PlaneKet }` (draw $\|onto\rangle\langle onto\|of\rangle$ and the dashed residual), resolver-computed by `projectOnto`. | Use `sumOf:[shadow, residual]` with the two PlaneKets precomputed as directions, plus the `project:1` of the kept vector; the shadow length goes in the caption. 2 beats (gs:b2, D6) use the fallback until S1 lands. |
| S2 | `others[].role` has no "input vector" role distinct from `basis`. | Reuse `role:'second'` for a skew input (gs:b1); no change needed. | — |

### 9.3 Widget gaps
- `hilbert-plane` widget mode `'gram-schmidt'` (two draggable inputs; shows the shadow, the residual and the normalized
  frame) — §3. Until then the `'components'` mode carries `f2-gram-schmidt`. Reuses the stage's engine calls.

## 10. Media

### 10.1 Blender opener
None new for F2; the Part F opener (F1 §10.1, "the ring and the helix") stands for the Part.

### 10.2 Motion Canvas film (each drawn number named from the engine; the manifest lists them for `films.test.ts`)
**`qc-f2-shadow` "Gram–Schmidt: subtract the shadow"** (opener of `f2-gram-schmidt`, ~20 s)
1. Two skew arrows, $|{+}x\rangle$ at $45°$ and $|{+}z\rangle$ at $0°$; label the angle $45°$ (`angleBetween`).
2. The shadow of $|{+}z\rangle$ on $e_1 = |{+}x\rangle$ grows to length $0.7071$ (`inner(KET['+x'], KET['+z'])`).
3. Subtract it: the residual $(0.5, -0.5)$ swings out to a right angle (`projectOnto`).
4. Normalize the residual to $|{-}x\rangle$; the finished frame snaps to right angles (`orthonormalize`).
Manifest: `f2FilmAngle`, `f2GsUnitShadow`, `f2GsUnitResid`, `f2GsUnitE1`, `f2GsUnitE2`.

### 10.3 Higgsfield decor (atmosphere only; no text, no numbers, no diagram; user approves credits)
- F2 moment (behind the chapter card): slow light across two polished rods leaning at an angle on dark felt, one easing
  upright — a wordless echo of straightening a skew frame. No ticks, no grid, no labels.

## 11. Hooks

### 11.1 Concept-map stations (`qc709/concepts.ts`, `QcConcept`)
| id | label | chapter · unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-ket` | States as kets in $\mathbb C^n$ | F2 · `f2-vectors` | — | twin of `l1-vectors` |
| `qc-inner-product` | The inner product $\langle\alpha\|\beta\rangle$ | F2 · `f2-inner-product` | `qc-ket` | links `l1-vectors` |
| `qc-norm` | Length, right angles, angle | F2 · `f2-norm-angle` | `qc-inner-product` | links `l1-vectors` |
| `qc-orthonormal-basis` | Frames and components | F2 · `f2-orthonormal` | `qc-norm` | twin of `l1-vectors` |
| `qc-gram-schmidt` | Straightening a skew frame | F2 · `f2-gram-schmidt` | `qc-orthonormal-basis` | — |

Cross-course edges use the `twins448?`/`links448?` fields proposed in F1 §11.1 (not prerequisites, so 709 stays
standalone). Forward edge `qc-orthonormal-basis` → F3 `qc-change-of-basis`.

### 11.2 Arcade: one level per unit (formats of `arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const F2x = (unit, label) => ({ lecture: 'F2', unit, label })`.
1. **`f2-vectors` · Spot the error · `qc-third-direction`** — "A third direction?"
   - Steps: "$(1,0)$ and $(0,1)$ span the plane." · "Add $(1,1)$ for a third direction." · "Now three directions span more." · "So the space is three-dimensional."
   - `wrong: 2`. Why: $(1,1) = (1,0) + (0,1)$; three vectors in $\mathbb C^2$ are dependent (`isIndependent` → false). `trains: F2x('f2-vectors', 'F2.1 Lists you can add')`.
2. **`f2-inner-product` · Spot the error · `qc-forgot-conjugate`** — "The length of $|{+}y\rangle$"
   - Steps: "$|{+}y\rangle = (1/\sqrt2,\ i/\sqrt2)$." · "Length² is $\sum a_i^2$." · "$= \tfrac12 + \tfrac{i^2}2 = 0$." · "So $|{+}y\rangle$ has length 0."
   - `wrong: 1`. Why: length² is $\sum |a_i|^2$, with the conjugate; $\langle{+}y|{+}y\rangle = 1$ (`inner`).
3. **`f2-norm-angle` · Spot the error · `qc-add-then-measure`** — "A triangle shortcut"
   - Steps: "$\||{+}z\rangle\| = 1$ and $\||{+}x\rangle\| = 1$." · "So $\||{+}z\rangle + |{+}x\rangle\| = 1 + 1 = 2$." · "Lengths add when you add vectors." · "The sum has length 2."
   - `wrong: 1`. Why: the length is $1.8478$, not $2$ (`norm(vadd(...))`); equality needs parallel vectors.
4. **`f2-orthonormal` · Spot the error · `qc-coords-are-the-state`** — "Coordinates everywhere"
   - Steps: "In the z frame $|\psi\rangle = (0.6, 0.8)$." · "Switch to the x frame." · "The coordinates stay $(0.6, 0.8)$." · "Coordinates are a property of the state."
   - `wrong: 2`. Why: in the x frame they are $(0.9899, -0.1414)$ (`inner(KET['+x'], psi)`); only the length is frame-free.
5. **`f2-gram-schmidt` · Spot the error · `qc-skip-the-shadow`** — "A faster Gram–Schmidt"
   - Steps: "Keep $e_1 = |{+}x\rangle$." · "For $e_2$, just normalize $|{+}z\rangle$." · "Now $e_1, e_2$ are a frame." · "Done, no subtraction needed."
   - `wrong: 1`. Why: $|{+}z\rangle$ is not orthogonal to $e_1$ ($\langle{+}x|{+}z\rangle = 0.7071$); you must subtract the shadow first (`projectOnto`).

## 12. Questions for the judge

**Q1. Gram–Schmidt and the change-of-basis matrix are 709 HW1 P5.** 709 Homework 1 Problem 5 builds the spin-1 $S_x$
basis by Gram–Schmidt (parts a–c) and the change-of-basis matrix $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ with
$U^\dagger U = I$ (parts d–e). This is exactly F2's `f2-gram-schmidt` and F3's `f3-change-of-basis`. Per
`qc709-nc.md` ruling 1 / the pilots rule, a problem assigned in either course is hints-only. This plan therefore
(a) uses only generic examples in the app (spin-½ real pair, the complex y pair, the dependent pair — never the spin-1
$S_x$ construction), and (b) keeps the one spin-1 challenge `f2-gs-spin1` hints-only. *Ask:* `qc709-remap.md` ruling 12
says HW2 is submitted, so its items get full walkthroughs. **Is HW1 likewise submitted?** *Recommendation:* treat HW1 as
submitted (it is the first sheet, dated 2026-09-08, and the course is at L7; HW2 is already submitted). If so, release
`f2-gs-spin1`'s walkthrough and allow an F3 change-of-basis challenge to show $U^\dagger U = I$ fully; if not, keep both
hints-only. Either way the ramp's derivations stay on the generic examples.

**Q2. Build `hilbert-plane`'s `shadow` field (S1) before F2?** Gram–Schmidt's picture (gs:b2, D6) wants the shadow of an
arbitrary kept vector and its residual; the merged `project`/`shadows` draw a frame vector's projection only. The field
is small (one resolver branch, `projectOnto` already exists) and only `f2-gram-schmidt` needs it. *Recommendation:* add
`shadow?` with or right after the F2 build; until then the `sumOf` fallback (§9.2 S1) carries the two beats.

**Q3. Two gloss ids introduced by one beat.** `f2-vectors:b1` introduces both `qc-ket` and `qc-complex-vector-space`
(you cannot write a ket without naming the space it lives in); `f2-inner-product:b1` introduces both `qc-bra` and
`qc-inner-product`. `content.test.tsx` checks one *beat* per gloss id, so `Beat.introduces: ['a','b']` is allowed.
*Ask:* accept the paired notation beats, or split each into two beats (one eyebrow each)? *Recommendation:* accept the
pairing; splitting would make a beat whose only content is naming a space with no new move.

**Q4. Bridge targets to 448 and Q.** §0 and the glossary offer 448 twins (`l1-vectors`, `l2-vector-space`). I have not
re-read 448's 709-side unit ids; F1 used `l1-vectors`/`l2-vector-space`, which I reuse. The Q→F2 bridges (Q1/Q2 →
`f2-*`) are added by the later wiring pass, not here. *Ask:* confirm `l1-vectors` and `l2-vector-space` are the right
448 twin ids, or supply the correct ones.
