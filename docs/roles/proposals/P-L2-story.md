# P-L2-story — Lecture 2 content plan (role P)

Proposal only. Nothing under `app/` is modified. Structure and depth follow `P2-L1-story.md`.

**Sources read.** `sources/L2/text.md` (all 11 pages) plus a full visual pass over `sources/L2/sheets/p01–p11.png`,
with zoomed crops of pages 7–9. The text layer misses these, and all of them are used below:
- p.1 sketch: 2D axes ⇒ 3D axes ⇒ "??" (Hilbert space generalizes both).
- p.1 sketch: $|\psi\rangle \Leftrightarrow \langle\psi|$ (ket–bra duality).
- p.3–4: a pasted "real number system" nesting diagram, a number-line sketch, and a hypotenuse sketch ($\sqrt2$).
- p.5: sketches of $A + 5 = B$ as a slide, $B = 2\cdot A$ as a stretch, and ×(−1) as a half-turn arc.
- p.6: a pasted polar/Cartesian figure (it uses φ for the angle).
- p.8: a pasted box saying that $|\psi\rangle$ is the state and that α, β and δ, ε are its coordinates in two bases.
- p.8–9: the pasted derivation of $c = \pm i$. It runs: $|c/\sqrt2|^2 = \tfrac12$, then $|c|^2 = 1$, then
  $|{+y}\rangle = \tfrac{1+c}{2}|{\to}\rangle + \tfrac{1-c}{2}|{\leftarrow}\rangle$, then $|1+c|^2 = |1-c|^2$, then
  $c + c^* = 0$, then $c^2 = -1$, then $c = \pm i$. The boxed results are $|{\pm y}\rangle = (|{\uparrow}\rangle \pm i|{\downarrow}\rangle)/\sqrt2$.
- p.10: the pasted payoff line $1 \to i \to -1 \to -i \leftrightarrow +x \to +y \to -x \to -y$.
- p.10: the boxed summary: $|\psi\rangle = \alpha|{\uparrow}\rangle + \beta|{\downarrow}\rangle$ with $\alpha, \beta \in \mathbb C$, and $\langle\psi|\psi\rangle = 1$.
- p.10: the handwritten answer "a vector living in a complex Hilbert space".
- p.10: the three-bases box, the definition of mutually unbiased bases, and $|\langle{\uparrow}|{+y}\rangle|^2 = \tfrac12$.
- p.11: the six-state table, and a note to draw a sphere with the six states at its cardinal points (Bloch preview).

**Conventions used below** (same as L1's P2 unless stated).
- Beat id `<unit>:b<n>`. Phase tag **[L]** lecture says, **[B]** books add, **[C]** clue (click-to-reveal). The order in a unit is always L → B → C.
- Stages use only `stage.ts` kinds and fields. `plane{…}`, `lab{…}`, `bloch{…}` are shorthand for
  `{kind:'hilbert-plane', shot:'H-FLAT', …}`, `{kind:'lab-r3', …}` and `{kind:'bloch', …}`. A `sweep(a,b)` is `{from:a,to:b}`.
- Every number is an engine call from `app/src/physics/`. Claims are written `key` — statement — `call` → value.
  The values were checked with an independent numpy script while drafting (see §7).
- Rosetta (said once, in `l2-inner-product:b5`):
  - lecture |up⟩, |down⟩, |right⟩, |left⟩ (also |↑⟩, |↓⟩, |→⟩, |←⟩) = app $|{+z}\rangle, |{-z}\rangle, |{+x}\rangle, |{-x}\rangle$;
  - lecture $|{\pm y}\rangle$ = app $|{\pm y}\rangle$;
  - Susskind $|u\rangle, |d\rangle, |r\rangle, |l\rangle, |i\rangle, |o\rangle$ = app $|{+z}\rangle, |{-z}\rangle, |{+x}\rangle, |{-x}\rangle, |{+y}\rangle, |{-y}\rangle$;
  - Townsend uses the app's names.
- Scalars that multiply kets are written $\lambda$ (Axler's letter), never $z$, because $z$ is also an axis. The letter
  $z$ names a complex number only inside `l2-complex` (§6 row "z").
- Susskind is an ebook without printed pages, so it is cited by § only, as in L1. Townsend: printed page = PDF page − 16.
  Axler: printed = PDF − 14.
- Core text: at most 3 sentences per beat, each ≤ 25 words, every symbol defined at or before first use (§6).

## 0. Lecture map

Lecture 2 (Mon 7 Sep 2026): **States as vectors in a complex space.** Order follows the notes. The one move is the
δ, ε basis change: the notes place it in the Stern–Gerlach recap on pp. 7–8, and here it sits in
`l2-inner-product`, the unit that supplies the tool it needs.

| # | id | Title (≤ 8 words) | Question (one sentence) | Notes pages | Book refs |
|---|---|---|---|---|---|
| 1 | `l2-vector-space` | Kets add and scale like vectors | Which rules make spin states a vector space, and what changes when the numbers may be complex? | L2 p.1 (axioms 1–7, bras), top of p.2 | Susskind §1.9.1 Axioms, §1.9.2 Functions and column vectors, §1.9.3 Bras and kets · Townsend §1.3 pp. 10–12 (kets as abstract vectors, the $\vec E = E_x\hat\imath + \dots$ analogy, bras and the dual space in footnote 7, p. 12) · Axler §1B Def. 1.20 (the page is not in our ingest; L1 cites it the same way) |
| 2 | `l2-inner-product` | Overlap: the inner product gives coordinates | How does a bra times a ket measure overlap, and give a state's coordinates in any basis? | L2 pp.1–2 (bracket, axioms, row × column, unit length, orthogonal); pp.7–8 (up/down from right/left, δ and ε) | Susskind §1.9.4 Inner products, §1.9.5 Orthonormal bases, §2.2 · Townsend §1.3 pp. 12–13 (eqs. 1.6–1.15), Ex. 1.1 p. 14, §2.1 pp. 29–31 · Axler §6A Def. 6.2 p. 183, margin note p. 184 |
| 3 | `l2-complex` | Numbers that turn | Why do the real numbers run out, and what does multiplying by $i$ do? | L2 pp.2–7 (number ladder, $i$, complex plane, polar form, Euler, conjugate) | Susskind §1.8 · Townsend §1.4 footnote 8, p. 15 |
| 4 | `l2-plus-y` | Real numbers cannot make +y | Which state reads + along $y$, and why must its amplitudes be complex? | L2 p.8 bottom – p.9 (the $c = \pm i$ derivation) | Townsend §1.5 pp. 18–20 (Experiment 5, eqs. 1.23–1.31, Fig. 1.10), Ex. 1.3 pp. 20–21, §2.1 pp. 31–32 (eqs. 2.16–2.19) · Susskind §2.3, §2.4 (Ex. 2.2, 2.3) |
| 5 | `l2-three-bases` | Three bases, each blind to the others | How are the $z$, $x$ and $y$ bases related, and what kind of object is a spin state? | L2 pp.10–11 (the $1\to i\to-1\to-i$ correspondence, the answer box, mutually unbiased bases, the six-state table, the sphere preview) | Susskind §2.5 Counting parameters, §2.7 · Townsend §1.3 p. 11 |

**Outcomes** (for `Lecture.outcomes`):
- List the rules a set must obey to be a vector space. Say why kets need complex scalars.
- Compute $\langle A|B\rangle$ from columns, conjugating the bra. Use it for lengths, orthogonality and coordinates.
- Move between Cartesian and polar forms. Multiply complex numbers by turning and stretching.
- Derive $|{\pm y}\rangle = (|{+z}\rangle \pm i|{-z}\rangle)/\sqrt2$, and explain why no real coefficient works.
- State what mutually unbiased bases are, and check it for $z$, $x$ and $y$.

**Prerequisites** (concept ids): `vectors`, `probability` (both L1).

## 1. Story beats per unit

Stage kinds used: `hilbert-plane` (units 1, 2, 3 b1, 4), `lab-r3` (unit 4), `bloch` (units 3, 4, 5). Not used:
- `bloch-ball`: mixed states are not in L2.
- `hopf`: global phase gets only one clue here, and the fiber picture belongs to L6.
- `operator-space`: operators start in L3.

Two build dependencies:
- The `bloch` kind still renders the W0 wireframe placeholder (`stage/scenes/index.ts`).
- There is no complex-plane stage.

See §8 (stage gaps) and §11 Q1.

### Unit `l2-vector-space` — Kets add and scale like vectors

**`l2-vector-space:b1` [L]**
- Text: "A [[hilbert-space|Hilbert space]] carries the geometry of flat 2D and 3D space into any number of dimensions. Quantum states live in one. It is a [[vector-space|vector space]] whose numbers may be complex, with an [[inner-product|inner product]] added (next unit)."
- Stage: `plane{ others:[{ket:'+z',role:'basis'},{ket:'-z',role:'basis'}], rightAngle:true }`.
- Caption: "the $|{+z}\rangle$, $|{-z}\rangle$ arrows of Lecture 1: two dimensions hold every spin state"
- Links: "vector space" → `basis-1`, `basis-2`.
- Claims: `l2-zz-orth` — the two basis arrows are at right angles — `inner(KET['+z'], KET['-z'])` → 0.
- Note: this beat echoes the p.1 sketch (2D axes ⇒ 3D axes ⇒ ??). "Completeness" is glossed only (§4). The notes say it comes for free in finite dimensions.

**`l2-vector-space:b2` [L]** (axioms 1–5)
- Text: "Kets can be added, and $|A\rangle + |B\rangle$ is again a [[ket]]. Order and grouping do not matter, and a [[zero-ket|zero ket]] changes nothing when added. Every ket $|A\rangle$ has an [[additive-inverse|opposite]] $-|A\rangle$, and the two add to zero."
- Stage: `plane{ psi:'+x', others:[{ket:'+z',role:'basis'},{ket:'-z',role:'basis'},{ket:{neg:'+x'},role:'ghost',badge:'−|A⟩'}] }`.
- Caption: "$|{+z}\rangle + |{-z}\rangle$, shrunk to length 1, is $|{+x}\rangle$. Its opposite $-|{+x}\rangle$ points the other way."
- Links: $-|A\rangle$ → `ghost` · $|A\rangle + |B\rangle$ → `psi`.
- Claims:
  - `l2-sum-is-x` — the rescaled sum is $|{+x}\rangle$ — `normalize(vadd(KET['+z'], KET['-z']))` → (0.7071, 0.7071), equal to `KET['+x']`.
  - `l2-inverse` — a ket plus its opposite is the zero ket — `norm(vadd(KET['+x'], vscale(KET['+x'], -1)))` → 0.

**`l2-vector-space:b3` [L]** (axioms 6–7)
- Text: "Any ket times any number $\lambda$ is a ket, and scaling spreads over sums: $\lambda(|A\rangle + |B\rangle) = \lambda|A\rangle + \lambda|B\rangle$. Arrows in 3D allow only real $\lambda$. For kets, $\lambda$ may be complex."
- Stage: `plane{ psi:'+x', others:[{ket:{neg:'+x'},role:'ghost',badge:'λ = −1'}] }`. Fidelity: `plane-real-slice`, `plane-no-complex-scalars` (new, §10).
- Caption: "a real λ only stretches or flips an arrow; a complex λ such as $i$ leaves this flat slice"
- Claims: `l2-ix-unit` — $i|{+x}\rangle$ still has length 1 — `norm(vscale(KET['+x'], I))` → 1.

**`l2-vector-space:b4` [L]** (bras)
- Text: "Each ket $|A\rangle$ has a partner, the [[bra]] $\langle A|$. Bras obey the same seven rules as kets. The bra of $|A\rangle + |B\rangle$ is $\langle A| + \langle B|$."
- Stage: `plane{ psi:'+x', others:[{ket:'+z',role:'basis'},{ket:'-z',role:'basis'}] }`.
- Caption: "kets and bras come in pairs. Next unit: a ket is a column, its bra a row."
- Claims: none. "Seven" counts rules, not a physics value; W should confirm the number lint exempts it, as it did for L1's rule counts.

**`l2-vector-space:b5` [B]** (conjugation rule)
- Text: "Susskind adds a rule the notes leave out: the bra of $\lambda|A\rangle$ is $\lambda^*\langle A|$. Here $\lambda^*$, the [[complex-conjugate|complex conjugate]], is $\lambda$ with the sign of its imaginary part flipped (unit 3). So the bra of $i|{+z}\rangle$ is $-i\langle{+z}|$."
- Stage: `plane{ psi:'+z', others:[{ket:'-z',role:'basis'}] }`.
- Caption: "the bra of $i|{+z}\rangle$, applied to $|{+z}\rangle$, gives $-i$"
- Refs: Susskind §1.9.3 (the two cautions about bras).
- Claims: `l2-bra-conj` — the bra of $i|{+z}\rangle$ applied to $|{+z}\rangle$ gives $-i$ — `inner(vscale(KET['+z'], I), KET['+z'])` → (0, −1), `fmt` "-i".
- Note: $i$ is glossed from L1 (`complex-number`). The notes omit this rule (§7 E7).

**`l2-vector-space:b6` [B]** (vectors need not be arrows)
- Text: "Susskind's vector spaces include columns of complex numbers and even continuous functions, so 'vector' does not mean 'arrow'. Townsend writes $|\psi\rangle = c_+|{+z}\rangle + c_-|{-z}\rangle$ (our α, β), as one writes a field by its components $E_x, E_y$. The coefficients are coordinates, but the space is not the lab."
- Stage: `plane{ psi:{planeDeg:sweep(0,90)}, shadows:true }`. Fidelity: `plane-shadow-born`, `plane-half-angles`.
- Caption: "the two shadows are coordinates; their squares add to 1 at every angle"
- Refs: Susskind §1.9.2 · Townsend §1.3 pp. 10–11 (Fig. 1.7, eq. 1.5).
- Claims: `l2-shadows-sum` — the squared shadows add to 1 — `prob(KET['+z'],ψ) + prob(KET['-z'],ψ)` → 1, for ψ = `ketFromBloch(θ,0)` with θ sampled over 0…180°.

**`l2-vector-space:b7` [C]**
- Question: "Is $2|{+z}\rangle$ a different spin state from $|{+z}\rangle$? What about $-|{+z}\rangle$?"
- Stage (question): `plane{ psi:'+z' }`.
- Reveal text: "Both are different vectors but the same state. A state is rescaled to length 1, which turns $2|{+z}\rangle$ back into $|{+z}\rangle$. And $-|{+z}\rangle$ gives the same probabilities for every measurement (Lecture 1), so the space holds more vectors than there are states."
- Reveal caption: "one state, two arrows"
- Reveal stage: `plane{ psi:'+z', others:[{ket:{neg:'+z'},role:'ghost',badge:'same state'}] }`. Fidelity: `plane-sign-twice`.
- Claims:
  - `l2-two-z` — `samePhysicalState(KET['+z'], vscale(KET['+z'], 2))` → true.
  - `l2-minus-z` — `samePhysicalState(KET['+z'], vscale(KET['+z'], -1))` → true.

### Unit `l2-inner-product` — Overlap: the inner product gives coordinates

Stage note: every state drawn in this unit has real coefficients, so the `hilbert-plane` is exact, as it was in L1.
Complex examples live in captions and readouts, and the passport already says the plane cannot hold them. Shorthand:
`xB = [KET['+x'], KET['-x']]` and `psiT = vec(0.5, c(0, Math.sqrt(3)/2))` (Townsend Ex. 1.1).

**`l2-inner-product:b1` [L]**
- Text: "The [[inner-product|inner product]] $\langle A|B\rangle$ joins a bra and a ket into one number, which may be complex. It extends the dot product to any dimension. It measures length, angle and overlap."
- Stage: `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`.
- Caption: "the shadow of ψ on $|{+z}\rangle$ is $\langle{+z}|\psi\rangle$ = 0.866"
- Links: $\langle{+z}|\psi\rangle$ → `shadow-1`.
- Claims: `l2-overlap-30` — the overlap of ψ at 30° with $|{+z}\rangle$ — `inner(KET['+z'], ketFromBloch(Math.PI/3, 0))` → 0.8660. Plane angle 30° is Bloch angle 60°.

**`l2-inner-product:b2` [L]** (the rules)
- Text: "It is linear in the ket: $\langle C|(|A\rangle + |B\rangle) = \langle C|A\rangle + \langle C|B\rangle$. Swapping bra and ket conjugates it: $\langle B|A\rangle = \langle A|B\rangle^*$. And $\langle A|A\rangle \ge 0$."
- Stage: `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`. Fidelity: `plane-real-slice`.
- Caption: "a complex example (not drawable here): for $|\psi\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}i|{-z}\rangle$, $\langle{-z}|\psi\rangle = 0.866i$ but $\langle\psi|{-z}\rangle = -0.866i$"
- Claims: `l2-swap-conj` — swapping conjugates — `inner(KET['-z'], psiT)` → (0, 0.8660) and `inner(psiT, KET['-z'])` → (0, −0.8660).
- Note: the notes' rule 3 lacks "= 0 only for the zero ket" (§7 E6). The full rule appears in b7.

**`l2-inner-product:b3` [L]** (row times column)
- Text: "Write $|A\rangle$ as a column of [[component|components]] $(a_1, a_2)$, and $|B\rangle$ as $(b_1, b_2)$. The bra $\langle B|$ is the row $(b_1^*, b_2^*)$. Then $\langle B|A\rangle = b_1^*a_1 + b_2^*a_2$."
- Stage: `plane{ psi:'+x', others:[{ket:'+z',role:'basis'},{ket:'-z',role:'basis'}], shadows:true }`.
- Caption: "$\langle{+z}|{+x}\rangle = 1\cdot\tfrac{1}{\sqrt2} + 0\cdot\tfrac{1}{\sqrt2}$ = 0.707"
- Claims: `l2-row-col` — `inner(KET['+z'], KET['+x'])` → 0.7071.

**`l2-inner-product:b4` [L]** (length and orthogonality)
- Text: "A state has unit length, $\langle\psi|\psi\rangle = 1$. Two states are [[orthogonal]] when $\langle A|B\rangle = 0$. That is the new meaning of 'at right angles'."
- Stage: `plane{ psi:'+x', others:[{ket:'-x',role:'second'}], rightAngle:true }`.
- Caption: "$\langle{+x}|{+x}\rangle = 1$ and $\langle{+x}|{-x}\rangle = 0$"
- Links: $\langle A|B\rangle = 0$ → `right-angle`.
- Claims:
  - `l2-unit-x` — `inner(KET['+x'], KET['+x'])` → 1.
  - `l2-orth-x` — `inner(KET['+x'], KET['-x'])` → 0.

**`l2-inner-product:b5` [L]** (up/down from right/left; Rosetta)
- Text: "The notes' up, down, right and left are our $|{+z}\rangle, |{-z}\rangle, |{+x}\rangle, |{-x}\rangle$, with $|{\pm x}\rangle = (|{+z}\rangle \pm |{-z}\rangle)/\sqrt2$ from Lecture 1. Adding and subtracting runs those formulas backwards: $|{\pm z}\rangle$ are $(|{+x}\rangle \pm |{-x}\rangle)/\sqrt2$. Either pair can serve as the basis."
- Stage: `plane{ psi:'+z', basis:'x', shadows:true, ticks:true }`.
- Caption: "$|{+z}\rangle$ casts equal shadows, $1/\sqrt2$, on $|{+x}\rangle$ and $|{-x}\rangle$"
- Claims:
  - `l2-z-in-x` — `toBasis(KET['+z'], xB)` → (0.7071, 0.7071).
  - `l2-mz-in-x` — `toBasis(KET['-z'], xB)` → (0.7071, −0.7071).
- Note: the notes then pose the inverse (express $|{\pm x}\rangle$ through $|{\pm z}\rangle$) as an open "??". It is the core challenge `l2-ip-right-left` in §3.

**`l2-inner-product:b6` [L]** (δ and ε)
- Text: "One state, two sets of coordinates: $|\psi\rangle = \alpha|{+z}\rangle + \beta|{-z}\rangle = \delta|{+x}\rangle + \varepsilon|{-x}\rangle$. Applying $\langle{+x}|$ and $\langle{-x}|$ to both sides gives $\delta = (\alpha+\beta)/\sqrt2$ and $\varepsilon = (\alpha-\beta)/\sqrt2$. The state stays put; only its numbers change with the basis."
- Stage: `plane{ psi:{planeDeg:30}, basis:'x', shadows:true }`.
- Caption: "ψ at 30°: δ = 0.966, ε = 0.259, and $\delta^2 + \varepsilon^2 = 1$"
- Links: δ → `shadow-1` · ε → `shadow-2`.
- Claims:
  - `l2-delta-eps` — `toBasis(ketFromBloch(Math.PI/3,0), xB)` → (0.9659, 0.2588).
  - `l2-xprob-sum` — the squares are 0.9330 and 0.0670, sum 1.

**`l2-inner-product:b7` [B]** (the convention clash)
- Text: "Axler builds the same inner product but makes it linear in the first slot, the bra's side. The notes, Susskind, Townsend and this app conjugate that slot instead. The two conventions differ by a conjugate, never in size."
- Stage: `plane{ psi:'+z', others:[{ket:'-z',role:'basis'}] }`.
- Caption: "physics: bra of $i|{+z}\rangle$ on $|{+z}\rangle$ gives $-i$; Axler's first-slot rule gives $+i$"
- Refs:
  - Axler §6A Def. 6.2, p. 183 (positivity, definiteness, first-slot linearity, conjugate symmetry) and the margin note on p. 184.
  - Townsend §2.1, pp. 30–31 (eqs. 2.10–2.11: a bra's row is the conjugate transpose of the ket's column).
- Claims: `l2-axler-clash` — physics value `inner(vscale(KET['+z'], I), KET['+z'])` → (0, −1). Axler's value `mul(I, inner(KET['+z'], KET['+z']))` → (0, 1). Both have `abs` 1.

**`l2-inner-product:b8` [C]**
- Question: "In the $x$ basis the probabilities are $|\delta|^2$ and $|\varepsilon|^2$. Must they add to 1 for every $\alpha$ and $\beta$, complex ones included?"
- Stage (question): `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`.
- Reveal text: "Yes. Expanding $\tfrac12(|\alpha+\beta|^2 + |\alpha-\beta|^2)$, the cross terms cancel and leave $|\alpha|^2 + |\beta|^2 = 1$. A state's length does not depend on the basis you measure in."
- Reveal caption: "same arrow, frame turned: the bars still add to 1"
- Reveal stage: `plane{ psi:{planeDeg:30}, basis:'x', shadows:true }`.
- Claims: `l2-len-basis-free` — for the complex `psiT`, `toBasis(psiT, xB)` gives squared sizes 0.5 and 0.5, sum 1. For ψ at 30°: 0.9330 + 0.0670 = 1.

### Unit `l2-complex` — Numbers that turn

Stage note: no stage kind is a complex plane (§11 Q1). This unit uses the `bloch` stage in top view (`B-POLE`),
where the equator is the unit circle. This is exact, not a metaphor: the state $(|{+z}\rangle + c|{-z}\rangle)/\sqrt2$ with
$|c| = 1$ sits on the equator at azimuth $\arg c$ (`ketFromBloch(Math.PI/2, arg c)`). That is the notes' own payoff
(p.10), and unit 5 cashes it in. Only numbers of size 1 appear, so stretching is left to the Try-it widget.

**`l2-complex:b1` [L]** (the choice)
- Text: "Should amplitudes be real or complex? In electromagnetism complex numbers are only a calculating aid, because the fields themselves are real. In quantum mechanics they are built in: even the equation for how a state changes in time contains $i$."
- Stage: `plane{ psi:'+x', others:[{ket:'+z',role:'basis'},{ket:'-z',role:'basis'},{ket:'-x',role:'second'}] }`. Fidelity: `plane-real-slice`.
- Caption: "with real amplitudes, every spin state lies on this one circle"
- Claims: none (no number). The time equation is only named, as in the notes (preview of later courses; no formula).

**`l2-complex:b2` [L]** (the number ladder)
- Text: "New operations keep forcing new numbers. Subtraction needs negatives and division needs fractions, and the diagonal of a unit square, $\sqrt2$, is not a fraction. Square roots open a worse gap: $\sqrt{-1}$ is nowhere on the real line."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:0}, shot:'B-POLE' }`. Fidelity: `bloch-equator-unit-circle` (new, §10).
- Caption: "seen from above, this circle is the unit circle of complex numbers; the dot is the number 1. Unit 5 shows why it is also a circle of spin states."
- Claims: none.
- Note: the p.3–4 diagrams and sketches become one line here. [[rational-number]], [[irrational-number]] and [[real-number]] are glossed (§4).

**`l2-complex:b3` [L]** (×i is a quarter turn)
- Text: "On the real line, multiplying by $-1$ is a half turn about zero. The number that makes a half turn when applied twice is a quarter turn, called $i$, so $i^2 = -1$. A quarter turn leaves the line, so $i$ lives off it, in the [[complex-plane|complex plane]]."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,90)}, trail:true, shot:'B-POLE' }`.
- Caption: "multiplying by $i$: the number 1 turns a quarter, to $i$"
- Claims:
  - `l2-i-squared` — `mul(I, I)` → (−1, 0).
  - `l2-times-i-turn` — `arg(mul(I, c(1)))` → π/2 (90°).

**`l2-complex:b4` [L]** (Cartesian and polar)
- Text: "A [[complex-number|complex number]] is a point $z = a + ib$, with [[real-part|real part]] $a$ and [[imaginary-part|imaginary part]] $b$. In [[polar-form|polar form]] $z = r(\cos\varphi + i\sin\varphi)$, where $r = |z| = \sqrt{a^2+b^2}$ is its [[magnitude|size]]. The angle $\varphi$ is its [[argument|phase]]."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:45}, shot:'B-POLE' }`.
- Caption: "the size-1 number at φ = 45° is $(1+i)/\sqrt2$; $1+i$ itself has size $\sqrt2$ = 1.414"
- Claims:
  - `l2-abs-1i` — `abs(c(1,1))` → 1.4142 and `arg(c(1,1))` → π/4.
  - `l2-abs-34` — `abs(c(3,4))` → 5.
- Note: the notes call $r$ the "amplitude" and switch between θ and φ. The app says size and φ (§7 E3–E4).

**`l2-complex:b5` [L]** (Euler)
- Text: "[[euler-formula|Euler's formula]], $\cos\varphi + i\sin\varphi = e^{i\varphi}$, shortens the polar form to $z = re^{i\varphi}$. Proving it, treating $i$ as an unknown whose square is $-1$, is homework. As φ runs from 0 to 360°, $e^{i\varphi}$ walks once round the unit circle."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,360)}, trail:true, shot:'B-POLE' }`.
- Caption: "$e^{i\varphi}$ for φ from 0 to 360°; halfway round, $e^{i\pi} = -1$"
- Claims:
  - `l2-euler-pi` — `expi(Math.PI)` → (−1, 0).
  - `l2-euler-half-pi` — `expi(Math.PI/2)` → (0, 1).
- Assigned: the proof is homework (L2 p.7). The app states the formula and never proves it (§3, `l2-c-euler`).

**`l2-complex:b6` [L]** (conjugate)
- Text: "The [[complex-conjugate|complex conjugate]] $z^* = a - ib$ flips the sign of the imaginary part: a mirror in the real axis, taking $re^{i\varphi}$ to $re^{-i\varphi}$. So $z^*z = r^2$ is always real and never negative."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(60,-60)}, trail:true, shot:'B-POLE' }`.
- Caption: "$e^{i60°}$ and its mirror $e^{-i60°}$; for $z = 3 + 4i$, $z^*z$ = 25"
- Claims:
  - `l2-conj-34` — `conj(c(3,4))` → (3, −4).
  - `l2-zstarz` — `mul(conj(c(3,4)), c(3,4))` → (25, 0).

**`l2-complex:b7` [B]**
- Text: "Susskind's shortcut: add complex numbers in components, but multiply them in polar form, multiplying sizes and adding angles. He calls a number of size 1, $e^{i\varphi}$, a [[phase-factor|phase factor]]. Multiplying by one only turns."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(30,90)}, trail:true, shot:'B-POLE' }`.
- Caption: "$2e^{i30°}\times 3e^{i60°} = 6e^{i90°} = 6i$; on the circle only the turn shows"
- Refs: Susskind §1.8 · Townsend §1.4 footnote 8, p. 15 (polar form, $z^*z = r^2$).
- Claims: `l2-polar-product` — `mul(polar(2,Math.PI/6), polar(3,Math.PI/3))` → (0, 6).

**`l2-complex:b8` [C]**
- Question: "The notes' last tip: when stuck, treat $i$ like any unknown and replace $i^2$ by $-1$. Using it, what are $i^3$ and $i^4$?"
- Stage (question): `bloch{ state:{thetaDeg:90, phiDeg:90}, shot:'B-POLE' }`.
- Reveal text: "$i^3 = i^2\cdot i = -i$ and $i^4 = (i^2)^2 = 1$. Four quarter turns make a full turn: $1 \to i \to -1 \to -i \to 1$. Unit 5 finds this same cycle among spin states."
- Reveal caption: "four quarter turns: 1, $i$, −1, $-i$, and back to 1"
- Reveal stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,360)}, trail:true, shot:'B-POLE' }`.
- Claims:
  - `l2-i-cubed` — `mul(mul(I,I),I)` → (0, −1).
  - `l2-i-fourth` — `mul(mul(I,I),mul(I,I))` → (1, 0).

### Unit `l2-plus-y` — Real numbers cannot make +y

Stage note: the lab beam flies along y, so no bench can hold an SG$_y$ magnet (`lab-beam-along-y`). The benches below
take a **ready-made** $|{\pm x}\rangle$ or $|{+y}\rangle$ beam, with `showPrep` off. The greyed prep module is always
an untilted z magnet, which would be wrong for these sources (§8 S3). The plate fractions are the experimental facts the
derivation starts from; Townsend gets them by renaming the axes of his Experiment 3 (§1.5, p. 18).

**`l2-plus-y:b1` [L]**
- Text: "Lecture 1 built $|{\pm z}\rangle$ and $|{\pm x}\rangle$ from real amplitudes, but a spin can also be prepared along $\pm y$. The $y$ axis is at right angles to $z$. So a $+y$ spin measured along $z$ must split 50/50, just as $|{+x}\rangle$ does."
- Stage: `lab{ benches:[{id:'main', source:'+y', devices:[{axis:'z'}]}], readouts:['fractions'], shot:'L-PLATE' }`. Fidelity: `lab-beam-along-y`, `lab-prepared-offstage` (new, §10).
- Caption: "a beam prepared along $+y$, by a magnet off this bench, meets SG$_z$: half in each spot"
- Claims: `l2-y-on-z` — `benchTheory({source:'+y',axes:['z'],keep:[]})` → plus 0.5, minus 0.5.

**`l2-plus-y:b2` [L]**
- Text: "So try the most general equal-weight state, $|{+y}\rangle = (|{+z}\rangle + c\,|{-z}\rangle)/\sqrt2$, with an unknown number $c$. The 50/50 split along $z$ needs $|c/\sqrt2|^2 = \tfrac12$. So $|c|^2 = 1$."
- Stage: `plane{ psi:'+x', basis:'z', shadows:true, ticks:true }`.
- Caption: "shown for $c = 1$: when $|c| = 1$, both $z$ shadows have size $1/\sqrt2$"
- Claims: `l2-c-unit-5050` — for c ∈ {1, −1, i, −i, $e^{i\pi/4}$}, `prob(KET['+z'], normalize(vec(1, c)))` → 0.5. This becomes `ketFromCoeff(c)` once the §8 helper exists.

**`l2-plus-y:b3` [L]**
- Text: "If $c$ were real, $|c| = 1$ would leave only $c = +1$ or $c = -1$. But $c = +1$ gives $|{+x}\rangle$ and $c = -1$ gives $|{-x}\rangle$. Those are right and left, not the missing $y$ direction."
- Stage: `plane{ psi:'+x', others:[{ket:'-x',role:'second'},{ket:'+z',role:'basis'},{ket:'-z',role:'basis'}], rightAngle:true }`. Fidelity: `plane-real-slice`.
- Caption: "a real $c$ reaches only $|{+x}\rangle$ or $|{-x}\rangle$"
- Claims: `l2-real-c-is-x` — `samePhysicalState(normalize(vec(1,1)), KET['+x'])` → true and `samePhysicalState(normalize(vec(1,-1)), KET['-x'])` → true.

**`l2-plus-y:b4` [L]**
- Text: "A $+y$ spin must also split 50/50 along $x$. In the $x$ basis the trial state is $\tfrac{1+c}{2}|{+x}\rangle + \tfrac{1-c}{2}|{-x}\rangle$. Equal odds need $|1+c|^2 = |1-c|^2$, and both real choices fail completely."
- Stage: `lab{ benches:[{id:'A', source:'+x', devices:[{axis:'x'}]},{id:'B', source:'-x', devices:[{axis:'x'}]}], readouts:['fractions'], shot:'L-3Q' }`. Fidelity: `lab-prepared-offstage`.
- Caption: "the real candidates along $x$: $c = 1$ puts 100 % in +, $c = -1$ puts 0 %"
- Claims:
  - `l2-x-coeffs` — `toBasis(normalize(vec(1,c)), xB)` → ((1+c)/2, (1−c)/2) for unit c. Example: c = $e^{i\pi/4}$ gives (0.8536 + 0.3536i, 0.1464 − 0.3536i).
  - `l2-real-fail` — `benchTheory({source:'+x',axes:['x'],keep:[]}).plus` → 1 and `benchTheory({source:'-x',axes:['x'],keep:[]}).plus` → 0.

**`l2-plus-y:b5` [L]** (the derivation, p.9)
- Text: "Write each size squared as a number times its conjugate: $(1+c)(1+c^*) = (1-c)(1-c^*)$. This leaves $c + c^* = 0$, so $c^* = -c$. With $cc^* = 1$ that gives $-c^2 = 1$, so $c^2 = -1$ and $c = \pm i$."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,90)}, measure:'x', trail:true, shot:'B-POLE' }`. Fidelity: `bloch-equator-unit-circle`.
- Caption: "slide $c$ round the unit circle: the $x$ split falls from 100 % to 50 % at $c = i$"
- Claims:
  - `l2-x-split-phi` — `prob(KET['+x'], ketFromBloch(Math.PI/2, φ))` → (1 + cos φ)/2. That is 1 at φ = 0 and 0.5 at φ = 90°.
  - `l2-i-conj` — `add(I, conj(I))` → 0 and `mul(I, conj(I))` → 1.

**`l2-plus-y:b6` [L]**
- Text: "Taking $c = +i$ gives $|{+y}\rangle = (|{+z}\rangle + i|{-z}\rangle)/\sqrt2$, and $c = -i$ gives its orthogonal partner $|{-y}\rangle = (|{+z}\rangle - i|{-z}\rangle)/\sqrt2$. No real $c$ passes both tests. Spin states need complex [[amplitude|amplitudes]]."
- Stage: `lab{ benches:[{id:'A', source:'+y', devices:[{axis:'z'}]},{id:'B', source:'+y', devices:[{axis:'x'}]}], readouts:['fractions'], shot:'L-3Q' }`. Fidelity: `lab-prepared-offstage`.
- Caption: "$|{+y}\rangle$: 50/50 along $z$ and 50/50 along $x$"
- Claims:
  - `l2-y-both-5050` — `benchTheory({source:'+y',axes:['z'],keep:[]}).plus` → 0.5 and `benchTheory({source:'+y',axes:['x'],keep:[]}).plus` → 0.5.
  - `l2-y-orth` — `inner(KET['+y'], KET['-y'])` → 0.

**`l2-plus-y:b7` [B]**
- Text: "Townsend reaches the same answer from his Experiment 5, which ends with an SG$_y$ magnet. He also explains the sign: with right-handed axes, $c = +i$ is spin up along $+y$. In a mirror-image, left-handed frame, the two answers swap."
- Stage: `bloch{ state:'+y', shot:'B-POLE' }`.
- Caption: "right-handed axes: $+i$ sits a quarter turn counterclockwise from $+x$, seen from $+z$"
- Refs:
  - Townsend §1.5, pp. 18–20. Eq. 1.28 is $|\langle{+y}|{+x}\rangle|^2 = \tfrac12[1 + \cos(\delta - \gamma)]$, where δ and γ are the relative phases. Eqs. 1.30–1.31 give $|{\pm y}\rangle$, and Fig. 1.10 shows the handedness.
  - Susskind §2.4: his $|i\rangle, |o\rangle$ are our $|{\pm y}\rangle$. Ex. 2.3 shows that $\alpha^*\beta$ must be purely imaginary.
- Claims:
  - `l2-y-bloch` — `blochVector(KET['+y'])` → (0, 1, 0).
  - `l2-y-eigen` — `eigenHermitian2(SIGMA_Y).vectors[0]` equals `KET['+y']`. This is a test only, and the forward link to L4's $\sigma_y$.
  - `l2-t128` — Townsend's 1.28 with δ = 0, γ = 90° → 0.5, which equals `prob(KET['+y'], KET['+x'])`.

**`l2-plus-y:b8` [C]**
- Question: "Someone finds the length of $|{+y}\rangle$ using the row $(1, i)/\sqrt2$, and gets $(1 + i^2)/2 = 0$. Is $|{+y}\rangle$ the zero vector?"
- Stage (question): same as b6.
- Reveal text: "No: a bra conjugates the entries, so the row is $(1, -i)/\sqrt2$ and $\langle{+y}|{+y}\rangle = (1 - i^2)/2 = 1$. Without the conjugate, a nonzero complex vector can seem to have no length. Probabilities would then stop adding to 1."
- Reveal caption: "conjugate the bra: length 1, not 0"
- Reveal stage: unchanged.
- Refs: Townsend §2.1, pp. 31–32 (eqs. 2.17–2.18: the $-i$ in the bra, and the unconjugated row giving zero).
- Claims:
  - `l2-y-norm` — `norm2(KET['+y'])` → 1.
  - `l2-y-bilinear` — $\sum_k a_k a_k$ for `KET['+y']` → 0. This needs the `bilinear` helper (§8).

### Unit `l2-three-bases` — Three bases, each blind to the others

**`l2-three-bases:b1` [L]** (the payoff, p.10)
- Text: "Here the complex plane pays off. As $c$ steps $1 \to i \to -1 \to -i$, the state $(|{+z}\rangle + c|{-z}\rangle)/\sqrt2$ steps $|{+x}\rangle \to |{+y}\rangle \to |{-x}\rangle \to |{-y}\rangle$. Each quarter turn of $c$ is a quarter turn around the lab's $x$–$y$ plane."
- Stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,270)}, trail:true, shot:'B-POLE' }`.
- Caption: "$c = 1, i, -1, -i$ ↔ $+x, +y, -x, -y$"
- Links: $x$ → `x` · $y$ → `y`.
- Claims: `l2-cycle` — for k = 0…3, `samePhysicalState(normalize(vec(1, i^k)), KET[['+x','+y','-x','-y'][k]])` → true, and the same for `ketFromBloch(Math.PI/2, k*Math.PI/2)`. Multiplying c by i here is `Rz(π/2)` up to a global phase: `samePhysicalState(apply(Rz(Math.PI/2), KET['+x']), KET['+y'])` → true. This is a test only; Rz belongs to L6.

**`l2-three-bases:b2` [L]** (the six states)
- Text: "That gives three [[basis|bases]], each a pair of orthogonal states. $z$ is $|{\pm z}\rangle$, $x$ is $|{\pm x}\rangle = (|{+z}\rangle \pm |{-z}\rangle)/\sqrt2$, and $y$ is $|{\pm y}\rangle = (|{+z}\rangle \pm i|{-z}\rangle)/\sqrt2$."
- Stage: `bloch{ state:{thetaDeg:sweep(90,0), phiDeg:90}, trail:true, shot:'B-STD' }`. The camera tilts from the top view, the circle becomes the equator, and the $z$ pair sits at the poles. With the proposed `landmarks:true` (§8 S2) all six points would show at once. Fidelity: `bloch-double-angle`.
- Caption: "tilt the view: the $z$ pair sits at the poles, the $x$ and $y$ pairs on the equator"
- Links: $z$, $x$, $y$ → anchors `z`, `x`, `y`.
- Claims: `l2-pairs-orth` — `inner(KET['+z'],KET['-z'])`, `inner(KET['+x'],KET['-x'])`, `inner(KET['+y'],KET['-y'])` → 0, 0, 0.

**`l2-three-bases:b3` [L]** (mutually unbiased)
- Text: "Prepare any state of one basis and measure in another: the two outcomes are always 50/50. Such bases are [[mutually-unbiased|mutually unbiased]]. Knowing the answer along one axis tells you nothing about the other two."
- Stage: `bloch{ state:'+x', measure:'y', shot:'B-STD' }`. Fidelity: `bloch-born`.
- Caption: "$|{+x}\rangle$ measured along $y$: 50 % each"
- Claims:
  - `l2-mub` — all 24 ordered cross-basis pairs, `prob(KET[a], KET[b])` → 0.5 (helper `mutuallyUnbiased`, §8).
  - `l2-x-on-y` — `prob(KET['+y'], KET['+x'])` → 0.5.

**`l2-three-bases:b4` [L]** (the answer)
- Text: "The space is only two-dimensional, yet it holds three mutually unbiased bases. So a spin state is a unit vector $|\psi\rangle = \alpha|{+z}\rangle + \beta|{-z}\rangle$, with complex $\alpha, \beta$ and $\langle\psi|\psi\rangle = 1$. In one phrase: a vector in a complex Hilbert space."
- Stage: `bloch{ state:{thetaDeg:60, phiDeg:45}, shot:'B-STD' }`.
- Caption: "a general state: complex α, β with $|\alpha|^2 + |\beta|^2 = 1$"
- Claims: `l2-general-unit` — `norm(ketFromBloch(Math.PI/3, Math.PI/4))` → 1.

**`l2-three-bases:b5` [L]** (the sphere preview, p.11)
- Text: "The notes close with a picture: a sphere with the six states at its six poles, $\pm z$, $\pm x$ and $\pm y$. It is the [[bloch-sphere|Bloch sphere]]. It returns in Lecture 6, once measurement has been made precise."
- Stage: `bloch{ state:'+z', shot:'B-STD' }`, plus the proposed `landmarks:true`. Until that field exists, the three axis anchors carry the pair labels. Fidelity: `bloch-double-angle`, `bloch-not-lab-space`.
- Caption: "preview: six states, six directions. Opposite points are orthogonal states."
- Claims: `l2-six-points` — `blochVector(KET[k])` → the ± unit axes for all six named kets.

**`l2-three-bases:b6` [B]**
- Text: "Susskind counts. Two complex numbers hold four real ones; normalizing removes one, and the unobservable overall phase removes another. Two remain, exactly the two angles that fix a direction in space."
- Stage: `bloch{ state:{thetaDeg:sweep(0,120), phiDeg:sweep(0,60)}, trail:true, shot:'B-STD' }`.
- Caption: "two angles, polar and azimuth, pin one point per state"
- Refs: Susskind §2.5, §2.7 · Townsend §1.3 p. 11 (two basis kets span the space).
- Claims: `l2-two-params` — `blochAngles(ketFromBloch(2*Math.PI/3, Math.PI/3))` → θ = 120°, φ = 60°: the two angles give back the state. The "4 − 1 − 1 = 2" in the prose is a count.

**`l2-three-bases:b7` [C]** (beyond the lecture)
- Question: "Could a fourth basis be unbiased with respect to $z$, $x$ and $y$ all at once?"
- Stage (question): `bloch{ state:'+y', shot:'B-STD' }`.
- Reveal text: "No. Lecture 1's rule $P(+) = (1 + \hat n\cdot\hat m)/2$ gives 50/50 exactly when the two directions are at right angles. No direction is at right angles to $x$, $y$ and $z$ at once, so a spin ½ has at most three."
- `beyondLecture: true`. The notes never say that three is the maximum.
- Reveal caption: "every point on the equator is 50/50 along $z$"
- Reveal stage: `bloch{ state:{thetaDeg:90, phiDeg:sweep(0,360)}, measure:'z', trail:true, shot:'B-STD' }`.
- Claims: `l2-perp-5050` — `probUpAlong([0,0,1], [Math.cos(φ), Math.sin(φ), 0])` → 0.5 for φ sampled over 0…360°.

**Beat count:** 7 + 8 + 8 + 8 + 7 = **38 beats**, of which **5 are clues with reveals**. L1 had 31 beats and 7 reveals.
Phase mix: 27 [L] · 6 [B] · 5 [C].

## 2. Try-it widget per unit

Props are the real prop names of each widget (`app/src/widgets/*.tsx`, kinds from `schema.ts`).

| Unit | Widget spec | Why this one |
|---|---|---|
| `l2-vector-space` | `{kind:'phase-dial', props:{theta:0}}` | Multiplying a whole ket by a number of size 1 is scalar multiplication (axiom 6) and changes nothing physical. This is the unit's clue, made hands-on. |
| `l2-inner-product` | `{kind:'basis-translator', props:{target:'x', mode:'state', theta:60, phi:0}}` | This is the δ, ε calculation of b6: one state with its $z$ column and its $x$ column. Fallback: `{kind:'projector', props:{state:30, basis:45}}` (real states only). |
| `l2-complex` | `{kind:'complex-plane', props:{mode:'multiply', z:[1,1], w:[0,1]}}` | This covers stretching and general sizes, which the top-view stage cannot show. It has three modes: multiply, powers of $i$, conjugate. |
| `l2-plus-y` | `{kind:'real-vs-complex', props:{realOnly:true, angle:0}}` | This is the unit's derivation as a search. Its right panel is already the equator top view the stage uses, so the pictures agree. |
| `l2-three-bases` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, landmarks:true, measure:'y'}}` | It shows all six states and a y magnet. The lab stage cannot measure along y. Secondary: `{kind:'sg-lab', props:{source:'+y', axes:['z'], editable:true}}`, whose y axis choice is allowed. |

**Try this** (2–3 per unit):

- `l2-vector-space` (phase-dial)
  1. Press "multiply both by $e^{i\pi/2}$". Both arrows turn together, but the dot stays put. A whole ket times a number of size 1 is the same state.
  2. Now drag the slider. The widget labels this angle θ; this course writes it φ (§6). The dot moves: changing one amplitude *relative* to the other makes a new state.
  3. Stop the slider at 90°. Which named state is this? Unit 4 answers.
- `l2-inner-product` (basis-translator)
  1. With θ = 60°, φ = 0, read the $x$ column: about (0.966, 0.259). Square both entries and add.
  2. Set θ = 90° (the state $|{+x}\rangle$). The $x$ column becomes (1, 0). What does a magnet along $x$ do to it?
  3. Set φ = 90°. The $x$ entries turn complex, but their squared sizes stay ½ and ½.
- `l2-complex` (complex-plane)
  1. Keep $w = i$ and watch $z = 1 + i$ turn 90° to $-1 + i$. Its size stays $\sqrt2$.
  2. Switch to "powers of i" and press "Multiply by i" four times. Where do you end up?
  3. Switch to "conjugate" and drag $z$. Watch $z^*$ mirror it in the real axis, and read $z^*z$.
- `l2-plus-y` (real-vs-complex)
  1. With "only real numbers allowed" ticked, flip $c$ between +1 and −1. The $z$ split stays 50/50, but the $x$ split is 100/0 or 0/100.
  2. Untick it and drag $c$ round the circle. Where exactly is the $x$ split 50/50?
  3. Watch the top view on the right. Where does the state sit at $c = i$, and where at $c = -i$?
- `l2-three-bases` (bloch)
  1. Start at $|{+x}\rangle$ with the magnet along $y$: 50/50. Drag the state to $|{+y}\rangle$: 100/0.
  2. Set the magnet along $z$. All four equator states now give 50/50.
  3. Look for a point that is 50/50 along $x$, $y$ and $z$ at once. Why is there none? (Clue b7.)

## 3. Challenges per unit

Format: tier · kind · id. Numeric answers are computed in the content file with the named engine call. The default
tolerance is 0.005, and 0 for exact integers. Hint rungs follow the rule nudge → key idea → setup.

**Assigned homework.** The notes mark exactly one item: proving Euler's formula (p.7, "in your homework"). It is
`l2-c-euler`, with `assigned: 'L2 p.7'`: hints only, and the walkthrough is withheld. The notes also pose four live
"??" exercises on p.8 ($|{\pm x}\rangle$ from $|{\pm z}\rangle$; δ and ε). They are not marked as homework, so they get
walkthroughs here. §11 Q2 asks the user to confirm.

### `l2-vector-space`
1. **warm-up · choice · `l2-vs-rules`** — "Which of these do the vector-space rules *not* give you?"
   - Options:
     - $|{+z}\rangle + |{+x}\rangle$ is a ket (rule 1).
     - $i|{+x}\rangle$ is a ket (rule 6).
     - **Two kets multiply to give a ket** ✓ (no rule).
     - $|A\rangle + (-|A\rangle)$ is the zero ket (rule 5).
   - Hints: (1) The seven rules talk about only two operations. (2) They are adding kets and scaling a ket by a number. (3) Check which option uses neither operation.
   - Walkthrough: map each true option to its rule. No rule multiplies two kets. The inner product multiplies a *bra* by a ket, and it gives a number, not a ket.
2. **core · numeric · `l2-vs-sum-prob`** — "Add $|{+z}\rangle$ and $|{+x}\rangle$, then rescale to length 1. What is the probability that this state reads + along $z$?"
   - Answer: **0.8536** = `prob(KET['+z'], normalize(vadd(KET['+z'], KET['+x'])))`.
   - Hints: (1) Write both as columns and add them. (2) The probability is the squared first entry after rescaling. (3) The sum is $(1 + \tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$, with squared length $2 + \sqrt2$.
   - Walkthrough:
     1. The sum is $(1.707, 0.707)$.
     2. Its squared length is $2.914 + 0.5 = 3.414$.
     3. $P(+z) = 2.914/3.414 = 0.854$.
     4. Callback: this is $\cos^2 22.5°$, the Lecture 1 value for a 45° magnet. The rescaled sum sits halfway between $z$ and $x$.
3. **core · choice · `l2-vs-bra-scale`** — "What is the bra of $(2 + i)|{+z}\rangle$?"
   - Options: $(2+i)\langle{+z}|$ · **$(2-i)\langle{+z}|$** ✓ · $\langle{+z}|$ · $(-2+i)\langle{+z}|$.
   - Check: `inner(vscale(KET['+z'], c(2,1)), KET['+z'])` → (2, −1).
   - Hints: (1) Kets and bras are partners, but numbers do not cross over unchanged. (2) The bra of $\lambda|A\rangle$ is $\lambda^*\langle A|$. (3) Flip the sign of the imaginary part of $2 + i$.
   - Walkthrough: apply Susskind's rule; conjugating $2 + i$ gives $2 - i$. Check by applying the bra to $|{+z}\rangle$: the result is $2 - i$.
4. **stretch · choice · `l2-vs-real-closed`** — "Keep only kets whose two components are real. Is that set a vector space when the scaling numbers may be complex?"
   - Options:
     - Yes, sums of real columns are real.
     - **No: $i|{+z}\rangle = (i, 0)$ is not in the set** ✓.
     - No, because sums can be complex.
     - Yes, because the length stays 1.
   - Check: `vscale(KET['+z'], I)` → (i, 0).
   - Hints: (1) A vector space must be closed under every allowed operation. (2) Scaling must work for every allowed λ. (3) Try λ = $i$ on $|{+z}\rangle$.
   - Walkthrough: $(i, 0)$ has a non-real entry, so the set is not closed under complex scaling. It *is* a vector space over the reals, which is exactly the "real Hilbert space" that unit 4 shows is too small.

### `l2-inner-product`
1. **warm-up · numeric · `l2-ip-overlap`** — "Compute $\langle{+x}|{+z}\rangle$."
   - Answer: **0.7071** = `inner(KET['+x'], KET['+z'])`.
   - Hints: (1) Turn the bra into a row. (2) Conjugating real entries changes nothing, so the row is $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$. (3) Multiply it with the column $(1, 0)$.
   - Walkthrough: $\tfrac{1}{\sqrt2}\cdot 1 + \tfrac{1}{\sqrt2}\cdot 0 = 0.707$.
2. **core · numeric · `l2-ip-right-left`** (the notes' "|left⟩ = ??", p.8) — "Start from $|{\pm z}\rangle = (|{+x}\rangle \pm |{-x}\rangle)/\sqrt2$ and solve for $|{-x}\rangle$ in terms of $|{\pm z}\rangle$. What is the coefficient of $|{-z}\rangle$?"
   - Answer: **−0.7071** = `toBasis(KET['-x'], [KET['+z'], KET['-z']])[1].re`.
   - Hints: (1) You have two equations and two unknowns. (2) Subtract the second equation from the first. (3) $|{+z}\rangle - |{-z}\rangle = \tfrac{2}{\sqrt2}|{-x}\rangle$.
   - Walkthrough: dividing by $\sqrt2$ gives $|{-x}\rangle = (|{+z}\rangle - |{-z}\rangle)/\sqrt2$, which is Lecture 1's formula again. Adding the equations instead gives $|{+x}\rangle$.
3. **core · numeric · `l2-ip-townsend`** (Townsend Ex. 1.1, p. 14) — "$|\psi\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}i|{-z}\rangle$. What is the probability of $S_z = -\hbar/2$?"
   - Answer: **0.75** = `prob(KET['-z'], psiT)`.
   - Hints: (1) The amplitude you need is $\beta = \langle{-z}|\psi\rangle$. (2) The probability is $|\beta|^2 = \beta^*\beta$. (3) $(-\tfrac{\sqrt3}{2}i)(\tfrac{\sqrt3}{2}i) = \tfrac34$.
   - Walkthrough: $\beta = \tfrac{\sqrt3}{2}i$ and $|\beta|^2 = \tfrac34$. Check that $\tfrac14 + \tfrac34 = 1$. Trap: squaring without the conjugate gives $-\tfrac34$, which is not a probability.
4. **stretch · numeric · `l2-ip-delta`** — "$|\psi\rangle = \cos30°|{+z}\rangle + \sin30°|{-z}\rangle$. What is the probability that it reads + along $x$, i.e. $|\delta|^2$?"
   - Answer: **0.9330** = `abs2(toBasis(ketFromBloch(Math.PI/3,0), xB)[0])`.
   - Hints: (1) δ is the $|{+x}\rangle$ coordinate. (2) $\delta = \langle{+x}|\psi\rangle = (\alpha + \beta)/\sqrt2$. (3) Use α = 0.866 and β = 0.5.
   - Walkthrough:
     1. $\delta = 1.366/1.414 = 0.966$, so $|\delta|^2 = 0.933$.
     2. Cross-check with Lecture 1: this state is the + state of a magnet 60° from $z$, which is 30° from $x$. That gives $\cos^2 15° = 0.933$ (`probUpAlong([1,0,0], tiltXZ(Math.PI/3))`).

### `l2-complex`
1. **warm-up · numeric · `l2-c-modulus`** — "What is $|3 - 4i|$?"
   - Answer: **5** = `abs(c(3,-4))`.
   - Hints: (1) Size means distance from 0. (2) Use $\sqrt{a^2 + b^2}$. (3) $9 + 16 = 25$.
   - Walkthrough: $\sqrt{25} = 5$. The sign of $b$ does not matter.
2. **core · numeric · `l2-c-turn`** — "Multiply $1 + i$ by $i$. What is the phase of the result, in degrees between 0 and 360?"
   - Answer: **135** = `arg(mul(I, c(1,1)))` × 180/π.
   - Hints: (1) Multiplying adds phases. (2) $1 + i$ has phase 45°, and $i$ has phase 90°. (3) Or expand $i(1+i)$ using $i^2 = -1$.
   - Walkthrough: $45° + 90° = 135°$. Check: $i + i^2 = -1 + i$, which lies in the upper-left quadrant at 135°.
3. **core · choice · `l2-c-sqrt`** (the notes' example, p.5) — "$\sqrt{-2}$ = ?"
   - Options: $-\sqrt2$ · **$\sqrt2\,i$** ✓ · $2i$ · not a number at all.
   - Check: `mul(polar(Math.SQRT2, Math.PI/2), polar(Math.SQRT2, Math.PI/2))` → (−2, 0).
   - Hints: (1) Split off $\sqrt{-1}$. (2) $\sqrt{-2} = \sqrt2\cdot\sqrt{-1}$. (3) $\sqrt{-1} = i$.
   - Walkthrough: $(\sqrt2 i)^2 = 2i^2 = -2$. Note that $-\sqrt2$ squares to +2.
4. **stretch · numeric · `l2-c-euler` · `assigned: 'L2 p.7'`** — "Homework: show that $\cos\varphi + i\sin\varphi = e^{i\varphi}$, treating $i$ as an unknown with $i^2 = -1$. Then check your result: what real number is $e^{i\pi}$?"
   - Answer: **−1** = `expi(Math.PI).re`.
   - Hints only: (1) What infinite sum defines $e^x$? (2) Put $x = i\varphi$ and simplify each power of $i$ using $i^2 = -1$. (3) Collect the terms with no $i$ and the terms with one $i$, and compare each group with a series you know.
   - Walkthrough: withheld (assigned).

### `l2-plus-y`
1. **warm-up · numeric · `l2-y-zsplit`** — "A spin in $|{+y}\rangle$ meets SG$_z$. What is the probability of +?"
   - Answer: **0.5** = `prob(KET['+z'], KET['+y'])`.
   - Hints: (1) Read off α. (2) $\alpha = 1/\sqrt2$. (3) Square its size.
   - Walkthrough: $|1/\sqrt2|^2 = 0.5$. The $i$ sits on the other amplitude and changes only its phase.
2. **core · choice · `l2-y-why-complex`** — "Why can't $c$ in $(|{+z}\rangle + c|{-z}\rangle)/\sqrt2$ be real for $|{+y}\rangle$?"
   - Options:
     - A real $c$ cannot be normalized.
     - **A real $c = \pm1$ gives $|{\pm x}\rangle$, which reads 100 % or 0 % along $x$, not 50/50** ✓.
     - A real $c$ makes the $z$ split unequal.
     - The axioms forbid real coefficients.
   - Hints: (1) Which real values does $|c| = 1$ allow? (2) Name the states they make. (3) Measure those states along $x$.
   - Walkthrough: use b3 and b4, with `benchTheory({source:'+x',axes:['x'],keep:[]}).plus` = 1. The $z$ test passes for any $|c| = 1$; only the $x$ test fails.
3. **core · numeric · `l2-y-townsend`** (Townsend Ex. 1.3, pp. 20–21) — "$|\psi\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}i|{-z}\rangle$. What is the probability of $S_y = +\hbar/2$?"
   - Answer: **0.9330** = `prob(KET['+y'], psiT)`.
   - Hints: (1) Write the bra $\langle{+y}|$, conjugating. (2) $\langle{+y}| = (1, -i)/\sqrt2$. (3) $\langle{+y}|\psi\rangle = \tfrac{1}{\sqrt2}(\tfrac12) + \tfrac{-i}{\sqrt2}(\tfrac{\sqrt3}{2}i)$.
   - Walkthrough:
     1. $-i\cdot i = +1$, so the amplitude is $\tfrac{1}{\sqrt2}(\tfrac12 + \tfrac{\sqrt3}{2})$.
     2. Squared: $\tfrac12 + \tfrac{\sqrt3}{4} = 0.933$.
     3. Townsend's $\langle S_y\rangle = \tfrac{\sqrt3}{4}\hbar$ = `expectation(SY, psiT)` → 0.4330 (ħ).
4. **stretch · numeric · `l2-y-35`** — "$|\psi\rangle = \tfrac35|{+z}\rangle + \tfrac45 i|{-z}\rangle$. What is $P(S_y = +\hbar/2)$?"
   - Answer: **0.98** = `prob(KET['+y'], vec(0.6, c(0,0.8)))`.
   - Hints: (1) Conjugate the bra. (2) Both terms of the amplitude come out real and positive. (3) The amplitude is $\tfrac{1}{\sqrt2}(\tfrac35 + \tfrac45)$.
   - Walkthrough:
     1. The amplitude is $\tfrac{7}{5\sqrt2}$; squared, $\tfrac{49}{50} = 0.98$.
     2. Bonus: $P(+x)$ = 0.5 (`prob(KET['+x'], vec(0.6, c(0,0.8)))`). The state lies in the $y$–$z$ plane, at right angles to $x$.

### `l2-three-bases`
1. **warm-up · numeric · `l2-mub-xy`** — "A spin in $|{+x}\rangle$ is measured along $y$. What is the probability of +?"
   - Answer: **0.5** = `prob(KET['+y'], KET['+x'])`.
   - Hints: (1) Use the bra of $|{+y}\rangle$. (2) The amplitude is $(1 - i)/2$. (3) Its squared size is $(1 + 1)/4$.
   - Walkthrough: $|1 - i|^2/4 = 2/4 = 0.5$.
2. **core · choice · `l2-mub-which`** — "Which pair of bases is **not** mutually unbiased?"
   - Options: $z$ and $x$ · $x$ and $y$ · $z$ and $y$ · **$z$ and the basis of a magnet tilted 45° from $z$ toward $x$** ✓.
   - Check: `probUpAlong(tiltXZ(Math.PI/4), [0,0,1])` → 0.8536, which is not 0.5.
   - Hints: (1) Unbiased means every cross probability is ½. (2) Use Lecture 1's $P(+) = (1 + \hat n\cdot\hat m)/2$. (3) Which pair of axes is not at 90°?
   - Walkthrough: the three coordinate pairs are at 90°, so each gives ½. The 45° pair gives $\cos^2 22.5° = 0.854$.
3. **core · numeric · `l2-mub-phase`** — "Write $|{-y}\rangle = (|{+z}\rangle + c|{-z}\rangle)/\sqrt2$ with $c = e^{i\varphi}$. What is φ, in degrees between 0 and 360?"
   - Answer: **270** = `(blochAngles(KET['-y']).phi + 2*Math.PI) % (2*Math.PI)` × 180/π.
   - Hints: (1) Here $c = -i$. (2) Where does $-i$ sit on the unit circle? (3) Three quarter turns from 1.
   - Walkthrough: $-i = e^{i\,270°}$, and $-90°$ names the same point. On the cycle $1 \to i \to -1 \to -i$ it is the fourth stop.
4. **stretch · numeric · `l2-mub-count`** (Susskind §2.5) — "How many real numbers pin down a spin state, once normalization and the overall phase are used up?"
   - Answer: **2**. `blochAngles` returns exactly the pair (θ, φ), and `ketFromBloch(θ, φ)` rebuilds the state up to a phase.
   - Hints: (1) Count the real numbers in two complex amplitudes. (2) Normalization is one real equation. (3) An overall phase can be removed.
   - Walkthrough: $4 - 1 - 1 = 2$, the same as the number of angles that fix a direction in 3D. This is why a sphere can hold every state.

## 4. Glossary terms new in L2

These ids are checked against `app/src/content/glossary.ts`, and none exists yet. L2 reuses these L1 entries unchanged:
- `vector`, `vector-space`, `inner-product`, `hilbert-space`, `state-space`;
- `ket`, `bra`, `orthogonal`, `basis`, `orthonormal-basis`;
- `amplitude`, `normalized`, `born-rule`, `superposition`;
- `complex-number`, `magnitude`, `global-phase`, `relative-phase`, `bloch-sphere`.

Each gloss is one plain sentence of at most 25 words. Any technical word inside a gloss has its own entry.

| id | Term | Gloss | First |
|---|---|---|---|
| `axiom` | axiom | A basic rule accepted without proof, from which the rest is built. | `l2-vector-space` (summary) |
| `scalar` | scalar $\lambda$ | A plain number, here possibly complex, used to rescale a vector. | `l2-vector-space:b3` |
| `zero-ket` | zero ket $0$ | The one vector that changes nothing when added; its length is zero, so it is not a state. | `l2-vector-space:b2` |
| `additive-inverse` | opposite ket $-\vert A\rangle$ | The ket that cancels $\vert A\rangle$ when the two are added, leaving the zero ket. | `l2-vector-space:b2` |
| `closed` | closed (under an operation) | A set is closed when combining any of its members that way always gives another member. | `l2-complex:b2` |
| `completeness` | completeness (of a Hilbert space) | A technical property that finite-dimensional spaces, like a spin's, have automatically; the lecture sets it aside. | `l2-vector-space:b1` |
| `dual` | dual (bra partner) | The bra $\langle A\vert$ that belongs to each ket $\vert A\rangle$; all the bras together form the dual space. | `l2-vector-space:b4` |
| `linearity` | linearity | An operation is linear when it passes through sums and multiples: acting on a sum gives the sum of the results. | `l2-inner-product:b2` |
| `conjugate-symmetry` | conjugate symmetry | Swapping the two sides of an inner product gives its complex conjugate: $\langle B\vert A\rangle = \langle A\vert B\rangle^*$. | `l2-inner-product:b2` |
| `column-vector` | column vector | A ket written as a vertical stack of its components. | `l2-inner-product:b3` |
| `row-vector` | row vector | A bra written as a horizontal list of the ket's components, each complex-conjugated. | `l2-inner-product:b3` |
| `component` | component (coordinate) | One of the numbers saying how much of each basis vector a vector contains; for a state, an amplitude. | `l2-inner-product:b3` |
| `change-of-basis` | change of basis | Rewriting the same vector in the coordinates of a different basis; the vector itself does not change. | `l2-inner-product:b6` |
| `complex-conjugate` | complex conjugate $z^*$ | The number made by flipping the sign of the imaginary part: $(a + ib)^* = a - ib$. | `l2-vector-space:b5` |
| `imaginary-unit` | imaginary unit $i$ | The number whose square is $-1$; multiplying by it turns a point a quarter turn about zero. | `l2-complex:b3` |
| `complex-plane` | complex plane | A flat plane of complex numbers, with real parts measured across and imaginary parts measured up. | `l2-complex:b3` |
| `real-part` | real part $a$ | In $z = a + ib$, the ordinary number $a$: the across coordinate in the complex plane. | `l2-complex:b4` |
| `imaginary-part` | imaginary part $b$ | In $z = a + ib$, the real number $b$ that multiplies $i$: the up coordinate in the complex plane. | `l2-complex:b4` |
| `argument` | phase (argument) $\varphi$ | The angle of a complex number, measured counterclockwise from the positive real axis. | `l2-complex:b4` |
| `polar-form` | polar form | Writing a complex number by its size and angle, $z = re^{i\varphi}$, instead of by its real and imaginary parts. | `l2-complex:b4` |
| `euler-formula` | Euler's formula | The identity $e^{i\varphi} = \cos\varphi + i\sin\varphi$, which places $e^{i\varphi}$ on the unit circle at angle φ. | `l2-complex:b5` |
| `unit-circle` | unit circle | The circle of all complex numbers of size 1. | `l2-complex:b2` |
| `phase-factor` | phase factor | A complex number of size 1, $e^{i\varphi}$; multiplying by it only turns, never stretches. | `l2-complex:b7` |
| `integer` | integer | A whole number: positive, negative or zero. | `l2-complex:b2` |
| `rational-number` | rational number | A number equal to one integer divided by another, nonzero, integer. | `l2-complex:b2` |
| `irrational-number` | irrational number | A real number that is not a fraction of integers, such as $\sqrt2$. | `l2-complex:b2` |
| `real-number` | real number | Any point on the number line: all rational and all irrational numbers together. | `l2-complex:b2` |
| `pure-imaginary` | purely imaginary | Describes a complex number whose real part is zero, such as $3i$. | `l2-plus-y:b7` |
| `right-handed` | right-handed axes | Axes where curling the right hand's fingers from $x$ toward $y$ makes the thumb point along $z$. | `l2-plus-y:b7` |
| `mutually-unbiased` | mutually unbiased bases | Two bases such that any state of one gives equal odds for every outcome when measured in the other. | `l2-three-bases:b3` |
| `dimension` | dimension | The largest number of mutually orthogonal vectors a space can hold; a spin ½ space has dimension 2. | `l2-three-bases:b4` |

Closure: every technical word in these glosses has its own entry here or in L1: vector, basis, state, amplitude,
inner product, complex number, imaginary part, orthogonal, measurement, outcome.

## 5. Review card per unit

Every number on a card is an L2 claim from §1 or §3, or an engine call given in brackets.

### `l2-vector-space` — Kets add and scale like vectors
- Kets add, and they scale by numbers; sums and multiples are again kets. Seven rules fix how.
- The numbers may be complex. That single change turns 3D arrows into kets.
- Every ket has a bra. The bra of $\lambda|A\rangle$ is $\lambda^*\langle A|$.
- Many vectors, one state: $2|{+z}\rangle$ and $-|{+z}\rangle$ describe the same spin as $|{+z}\rangle$ (`samePhysicalState` → true).

$$|A\rangle + |B\rangle = |C\rangle,\qquad \lambda(|A\rangle + |B\rangle) = \lambda|A\rangle + \lambda|B\rangle,\qquad \lambda|A\rangle \;\leftrightarrow\; \lambda^*\langle A|$$

**The one trap:** writing the bra of $\lambda|A\rangle$ as $\lambda\langle A|$. Conjugate the number: the bra of $i|{+z}\rangle$ is $-i\langle{+z}|$.

### `l2-inner-product` — Overlap: the inner product gives coordinates
- $\langle B|A\rangle = b_1^*a_1 + b_2^*a_2$: multiply matching entries, conjugating the bra's side.
- Swapping sides conjugates the result, so $\langle A|A\rangle$ is real, and it is never negative.
- Coordinates are overlaps. With $\alpha = \langle{+z}|\psi\rangle$, the $x$ coordinates are $\delta = (\alpha+\beta)/\sqrt2$ and $\varepsilon = (\alpha-\beta)/\sqrt2$.
- Values: $\langle{+z}|{+x}\rangle = 0.707$. For ψ at 30°, δ = 0.966 and ε = 0.259, and their squares add to 1 in either basis.

$$\langle B|A\rangle = b_1^*a_1 + b_2^*a_2,\qquad \langle B|A\rangle = \langle A|B\rangle^*,\qquad \delta = \tfrac{\alpha+\beta}{\sqrt2},\ \ \varepsilon = \tfrac{\alpha-\beta}{\sqrt2}$$

**The one trap:** mixing conventions. Axler's product is linear in the first slot, so it gives the conjugate of ours. In this course, the bra is the one that gets conjugated.

### `l2-complex` — Numbers that turn
- $i^2 = -1$. Multiplying by $i$ is a quarter turn, and multiplying by $-1$ a half turn.
- $z = a + ib = re^{i\varphi}$, with size $r = \sqrt{a^2+b^2}$. For example, $|3 + 4i| = 5$.
- To multiply, multiply the sizes and add the phases. $z^*z = r^2$ is real and never negative.
- Four quarter turns: $1 \to i \to -1 \to -i \to 1$, so $i^4 = 1$.

$$z = a + ib = re^{i\varphi},\qquad e^{i\varphi} = \cos\varphi + i\sin\varphi,\qquad z^*z = r^2 = a^2 + b^2$$

**The one trap:** $|z|^2$ is $z^*z$, not $z^2$. For $z = 1 + i$, $z^*z = 2$ but $z^2 = 2i$ [`mul(conj(c(1,1)), c(1,1))` → (2, 0); `mul(c(1,1), c(1,1))` → (0, 2)].

### `l2-plus-y` — Real numbers cannot make +y
- A $+y$ spin must be 50/50 along $z$, which forces $|c| = 1$. It must also be 50/50 along $x$, which forces $c + c^* = 0$.
- A real $c = \pm1$ gives $|{\pm x}\rangle$, which reads 100 % or 0 % along $x$. So it fails.
- So $c = \pm i$, and $|{\pm y}\rangle = (|{+z}\rangle \pm i|{-z}\rangle)/\sqrt2$. Right-handed axes pick $+i$ for $+y$.
- A real Hilbert space is too small for spin: its amplitudes must be complex.

$$|{\pm y}\rangle = \tfrac{1}{\sqrt2}\big(|{+z}\rangle \pm i|{-z}\rangle\big),\qquad |c|^2 = 1,\ \ c + c^* = 0\ \Rightarrow\ c = \pm i$$

**The one trap:** forgetting to conjugate the bra of $|{+y}\rangle$. The row $(1, i)/\sqrt2$ gives length 0; the correct row $(1, -i)/\sqrt2$ gives 1.

### `l2-three-bases` — Three bases, each blind to the others
- There are three bases, $z$, $x$ and $y$, and within each pair the states are orthogonal.
- They are mutually unbiased: every cross-basis measurement is 50/50, as all 24 ordered checks confirm.
- $c = 1, i, -1, -i$ gives $|{+x}\rangle, |{+y}\rangle, |{-x}\rangle, |{-y}\rangle$: quarter turns of $c$ are quarter turns in the lab.
- A spin state is a unit vector in a complex 2D space. That leaves two real parameters, the two angles of a direction.

$$|\langle a|b\rangle|^2 = \tfrac12\ \ (a, b \text{ from different bases}),\qquad |\psi\rangle = \alpha|{+z}\rangle + \beta|{-z}\rangle,\ \ \alpha,\beta\in\mathbb C,\ \ \langle\psi|\psi\rangle = 1$$

**The one trap:** reading "two-dimensional" as "two directions". The space has two dimensions, yet a spin can be prepared along any direction, including three mutually unbiased axes.

## 6. Symbol-before-use table

**Reading order assumed.** Units in array order. Within a unit: story beats (L → B → C), then Try-it, pitfalls, review,
and challenges. Abbreviations: vs = `l2-vector-space`, ip = `l2-inner-product`, cx = `l2-complex`, py = `l2-plus-y`, tb = `l2-three-bases`.

**Status key.**
- OK = defined at or before first use.
- **FLAG** = used before it is defined, or clashes with another meaning.
- gloss = a glossary tag (§4, or L1's glossary) is enough.

| Symbol | First use | First definition | Status | Fix / note |
|---|---|---|---|---|
| $\vert A\rangle, \vert B\rangle, \vert C\rangle$ | vs:b2 | vs:b2 ("kets") | OK | The notes write lowercase $\vert a\rangle, \vert b\rangle$, then reuse $a, b$ as real and imaginary parts (p.5). The app uses capitals, as Susskind does. |
| $0$ (zero ket) | vs:b2 | vs:b2 | gloss | Tag `zero-ket`. It is the vector 0, not the number 0. |
| $-\vert A\rangle$ | vs:b2 | vs:b2 | OK | Tag `additive-inverse`. |
| $\lambda$ (scalar) | vs:b3 | vs:b3 | OK | **The notes use $z, w$** (p.1, following Susskind). That clashes with the $z$ axis and $\vert{\pm z}\rangle$ on the same page, so the app writes λ. |
| $\langle A\vert$ | vs:b4 | vs:b4 | OK | — |
| $^*$ (conjugate) | vs:b5 | vs:b5, inline; fully in cx:b6 | gloss | Tag `complex-conjugate` at vs:b5 with a forward link. The notes' text layer also uses `*` for multiplication (p.2, "(b1*, …)*(column …)"). The app uses $^*$ only for conjugation. |
| $i$ | vs:b3 caption | L1 gloss `complex-number`; cx:b3 | gloss | Tag `imaginary-unit`. It is a planned forward reference, as in L1. |
| $c_\pm$, $E_x$, $E_y$ | vs:b6 | inline | OK | Townsend's letters, glossed "(our α, β)" and "a field's components". They are used only in that books beat, so they never meet py's $c$. |
| $\langle A\vert B\rangle$ | ip:b1 | ip:b1 | OK | Tag `inner-product` (L1 gloss). |
| $a_1, a_2, b_1, b_2$ | ip:b3 | ip:b3 | OK (minor clash) | cx:b4 reuses plain $a, b$ for real and imaginary parts. The subscripts keep them apart, and cx:b4 says "here $a$ and $b$ are ordinary numbers". |
| $\delta, \varepsilon$ | ip:b6 | ip:b6 | **FLAG** (books clash) | Townsend uses δ± and δ, γ for **phases** (eqs. 1.17, 1.27). Susskind uses $\delta_{ij}$ (§1.9.5) and δ as an entry of $\vert o\rangle$ (Ex. 2.3). Books beats describe Townsend's phases in words and never write δ. |
| $\vert{\pm x}\rangle$ as right and left | ip:b5 | Rosetta line in ip:b5, from L1 | OK | That is the only place the Rosetta is stated. |
| $z$ (complex number) | cx:b4 | cx:b4 | **FLAG** (clash) | It collides with the axis $z$ and with $\vert{\pm z}\rangle$. Keep $z$ only inside `l2-complex`, where no axis is named in the prose. Units 4–5 call the number $c$. |
| $a, b$ (real and imaginary parts) | cx:b4 | cx:b4 | OK | See the $a_1$ row. The notes' "B is the imaginary part of B" is a typo (§7 E2). |
| $r = \vert z\vert$ | cx:b4 | cx:b4 | **FLAG** (terminology) | The notes call $r$ the "amplitude" (p.6). That clashes with probability amplitude, so the app says "size" (`magnitude`). $r$ is also the Bloch vector $\vec r$ in L1's fidelity notes, so prose near Bloch content writes $\vert z\vert$. |
| $\varphi$ (phase of $z$) | cx:b4 | cx:b4 | **FLAG** (notes switch) | The notes use θ on p.6, then $e^{i\varphi}$ and $e^{i\theta}$ on p.7. The pasted figure uses φ. The app uses **φ** throughout: it is the Bloch azimuth when the number is $c$, and θ stays the polar angle. **The `phase-dial` widget labels the relative phase θ**, so W should relabel it φ, or the L2 caption must gloss it. |
| $e^{i\varphi}$ | cx:b5 | cx:b5 | OK | Tag `euler-formula`. |
| $z^*$ | cx:b6 | cx:b6 | OK | — |
| $\sqrt2$, $\sqrt{-1}$ | cx:b2 | — | OK | Ordinary school maths. $\sqrt{-1}$ is named $i$ in cx:b3. |
| $c$ (coefficient) | py:b2 | py:b2 | OK | — |
| $\vert{+y}\rangle$ | py:b1 as the chip on a `'+y'` source; py:b2 as a ket | py:b1 in words ("prepared along $+y$"); py:b2 (trial form); py:b6 (result) | OK (checked) | `LabR3Scene.tsx` chip text prints only the name $\vert{+y}\rangle$, never the column, so b1 does not give away the $i$. Keep it that way: a column on the chip would spoil b2–b6. |
| SG$_y$ | py:b7 | L1 gloss `sg-magnet` | gloss | — |
| $\theta, \varphi$ (Bloch angles) | tb:b6 caption; `l2-mub-count` | tb:b6 ("polar and azimuth") | OK | Define in the challenge prompt as well: "θ from $+z$, φ from $+x$ toward $+y$". |
| $\hat n, \hat m$ | tb:b7 reveal | L1 `l1-average` | OK | — |
| $\mathbb C$ | tb:b4 review equation | not defined | **FLAG** (minor) | Add "$\mathbb C$, the set of complex numbers" to the `complex-number` gloss's `symbols`. |
| $\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle$ | cx:b2, from the `bloch` passport axes | L1 gloss `sigma-reading` | gloss | Passports cannot be authored per beat. The cx:b2 caption says that unit 5 explains the sphere. |

**Counts:** 5 FLAG rows: $\delta/\varepsilon$, $z$, $r$, $\varphi$ (which also covers the `phase-dial` θ label), and $\mathbb C$. The $\vert{+y}\rangle$ chip was checked and is fine. Of the notes' own
notation problems, three are fixed by renaming ($z, w \to \lambda$; $\vert a\rangle \to \vert A\rangle$; θ/φ → φ) and one by
rewording ("amplitude" → size).

## 7. Errata

**Method.** Every equation in the notes was recomputed, including the ones found only in the images of pp.8–11. So was
every value quoted from Townsend. The check used an independent numpy script (`np.vdot` for ⟨a|b⟩; the kets
exactly as in `spin.ts`). The script ran in the session scratchpad and is not committed; its cases become fixtures (§8).
**The notes, Townsend, Susskind and the engine agree on every physics result in L2.** Every item below is a slip,
an omission, a wording problem, or a convention clash between books.

| # | Where | The source says (paraphrased) | It should say | Evidence | Severity | App action |
|---|---|---|---|---|---|---|
| E1 | L2 p.5 | Once a quarter turn is allowed, "the real numbers" are found off the number line. | The *imaginary* numbers lie off the line, in the complex plane. | The passage is about $\sqrt{-1}$. `I` has `im` = 1 and `arg(I)` = π/2, while every real number has arg 0 or π. | medium (a conceptual slip students may copy) | `Correction` box. `check: () => I.im === 1 && Math.abs(arg(I) - Math.PI/2) < 1e-12 && Math.abs(arg(c(-2))) === Math.PI` |
| E2 | L2 p.5 | "B is the imaginary part of B." | $b$ is the imaginary part of $z$. | Typo: in $z = a + ib$ the imaginary part belongs to $z$. | low | Silent fix. |
| E3 | L2 pp.6–7 | The polar angle is θ, then $z = re^{i\phi}$, then $re^{i\theta}$ again; the pasted figure uses φ. | One letter throughout. | Notation only. | low | The app uses φ (§6). |
| E4 | L2 p.6 | $r$ is called the "amplitude" of the complex number. | The size, or modulus, $\vert z\vert$. | On p.8 the same lecture calls α, β *probability amplitudes*. Keeping both would make $\vert\alpha\vert$ "the amplitude of an amplitude". | low–medium (terminology) | Reword. Gloss `magnitude` (L1). |
| E5 | L2 p.1, rule 3 | Associativity is written as $(a+b)+c = a+b+c$. | $(\vert A\rangle + \vert B\rangle) + \vert C\rangle = \vert A\rangle + (\vert B\rangle + \vert C\rangle)$. | The right-hand grouping is missing. | low | Silent fix in the summary equations. |
| E6 | L2 p.2, inner-product rule 3 | $\langle a\vert a\rangle \ge 0$. | It is also 0 **only** for the zero ket (definiteness). | Axler §6A Def. 6.2, p. 183, lists positivity *and* definiteness. Without conjugation, $\sum_k a_k a_k$ is **0** for the nonzero $\vert{+y}\rangle$ (numpy `np.dot(y, y)` = 0), while the true length is `norm2(KET['+y'])` = 1. Definiteness plus conjugation is what makes length meaningful. | medium (omission) | State the full rule. The clue `l2-plus-y:b8` shows the failure; `l2-inner-product:b7` cites Axler. No Correction box, because nothing stated is false. |
| E7 | L2 pp.1–2 | Bras obey the same rules; linearity is shown only for sums. | The bra of $\lambda\vert A\rangle$ is $\lambda^*\langle A\vert$, and $\langle C\vert(\lambda\vert A\rangle) = \lambda\langle C\vert A\rangle$. | Susskind §1.9.3 gives the rule. Engine: `inner(vscale(KET['+z'], I), KET['+z'])` → $-i$, not $+i$. | medium (omission) | Books beat `l2-vector-space:b5`; challenge `l2-vs-bra-scale`. |
| E8 | L2 p.7 | Atoms are detected with a phosphorescent screen. | A silver deposit builds up on a glass plate. | Townsend §1.1, p. 3. L1's stage and its `lab-not-to-scale` note already say "plate". | low | Keep "plate". An optional Correction box, since it contradicts L1. |
| E9 | L2 p.9 | Picks $c = +i$ for $\vert{+y}\rangle$ with no reason given. | Both $\pm i$ pass every test in the notes. Right-handed axes pick $+i$. | Townsend §1.5, p. 20, Fig. 1.10. Engine: `blochVector(KET['+y'])` → (0, 1, 0); `eigenHermitian2(SIGMA_Y).vectors[0]` = `KET['+y']`. | low (omission) | Books beat `l2-plus-y:b7`. |
| E10 | L2 p.2 | A row with four entries $(b_1^*, \dots, b_4^*)$ times a column $(a_1, a_2)$; `*` also used for multiplication. | Matching lengths; `*` only for conjugation. | Dimensions do not match. | low | Silent fix (§6 row "*"). |
| E11 | L2 p.1 | A Hilbert space is defined "over the complex plane". | Over the complex *numbers*: the plane is only a picture of them. | Wording. | low | Silent fix. |
| E12 | L2 p.4 | The reals are closed under division. | Except division by zero. | Standard. | low | The `closed` gloss says it. |
| E13 | L2 p.7 | Atoms fly through "a pair of magnets". | One Stern–Gerlach magnet, with a pair of shaped poles, per device. | L1 `sg-magnet` gloss; Townsend §1.1. | low | Silent ("a magnet"). |
| E14 | Axler vs notes, Susskind, Townsend, engine | Axler's inner product is linear in the **first** slot. | Not an error: a convention clash. | Axler §6A Def. 6.2, p. 183, and margin note p. 184. Physics value `inner(vscale(KET['+z'], I), KET['+z'])` = $-i$; Axler's $\lambda\langle u, v\rangle$ = $+i$. Same size, conjugate phase. | — | Books beat `l2-inner-product:b7`; review-card trap. |
| E15 | L2 p.4 | "The Greeks realized…", followed at once by π and e as examples. | Wording caution only: the notes' own Greek example is the unit-square diagonal, $\sqrt2$. | No source in the repo dates the proofs for π and e, so no correction is claimed. | — | The app credits the Greeks with $\sqrt2$ only (`l2-complex:b2`). |

**Checked and correct** (these become claims or fixtures):
- The whole $c = \pm i$ chain on pp.8–9 holds for every unit $c$:
  - $\vert c/\sqrt2\vert^2 = \tfrac12 \Rightarrow \vert c\vert = 1$;
  - $\tfrac{1+c}{2}, \tfrac{1-c}{2}$ as $x$ coordinates (`toBasis`; c = $e^{i\pi/4}$ → 0.8536 + 0.3536i, 0.1464 − 0.3536i);
  - $c + c^* = 0$, then $c^2 = -1$.
- Both boxed $\vert{\pm y}\rangle$ are unit length, orthogonal, and 50/50 along $z$ and $x$.
- The p.10 correspondence $1, i, -1, -i \leftrightarrow +x, +y, -x, -y$ holds exactly (`samePhysicalState` true, all four).
- All 24 ordered cross-basis probabilities are 0.5, which is the p.10 claim that the bases are pairwise mutually unbiased.
- $\vert{\pm z}\rangle = (\vert{+x}\rangle \pm \vert{-x}\rangle)/\sqrt2$ (p.8), and $z^*z = r^2$ (p.7).
- Townsend: Ex. 1.1 (0.25 and 0.75); Ex. 1.3 ($P(+y) = \tfrac12 + \tfrac{\sqrt3}{4}$ = 0.9330, $\langle S_y\rangle = \tfrac{\sqrt3}{4}\hbar$ = 0.4330ħ); eq. 1.28 at δ − γ = −90° → 0.5; eqs. 2.17–2.18 (the bra has $-i$, and the unconjugated row gives 0).

**For the user** (not errata; see §11 Q3): the pasted blocks on pp.8–11 read like drafting advice written to the
instructor, e.g. "I would explicitly say something like…" and "Lecture 2 can end with something like…". This plan treats
their physics content (the $c = \pm i$ derivation, mutually unbiased bases, the six-state table, the sphere preview) as
lecture content, because it first appears in these notes.

## 8. Engine gaps

The existing engine covers almost everything L2 needs:
- `inner`, `norm`, `norm2`, `normalize`, `vadd`, `vscale`, `apply` from `linalg.ts`;
- `prob`, `toBasis`, `samePhysicalState`, `blochVector`, `blochAngles`, `ketFromBloch`, `probUpAlong`, `expectation`, `eigenHermitian2` from `spin.ts`;
- `benchTheory` from `sg.ts`;
- `c`, `I`, `add`, `mul`, `conj`, `abs`, `abs2`, `arg`, `expi`, `polar` from `complex.ts`.

The gaps are small helpers, so no claim has to hand-roll arithmetic in content files.

### 8.1 Engine functions (physics/)

| # | Name and signature | Formula | Used by | numpy check (`pipeline/make_fixtures.py`) |
|---|---|---|---|---|
| G1 | `bilinear(a: Vec, b: Vec): C` in `linalg.ts` (and/or `vconj(v: Vec): Vec`) | $\sum_k a_k b_k$ with **no** conjugate; `inner(vconj(a), b)` is equivalent. | `l2-y-bilinear` (py:b8); Arcade "forgot the conjugate" | `np.dot(a, b)` (no conjugation) vs `np.vdot(a, b)`. Fixtures: `bilinear(+y,+y)` = 0; `inner(+y,+y)` = 1; `bilinear(+x,+x)` = 1 (real kets agree). |
| G2 | `ketFromCoeff(c: C): Vec` in `spin.ts` | normalize$(1, c)$, i.e. $(\vert{+z}\rangle + c\vert{-z}\rangle)/\sqrt{1+\vert c\vert^2}$, the notes' trial family | `l2-c-unit-5050`, `l2-real-c-is-x`, `l2-x-coeffs`, `l2-cycle`; `real-vs-complex` can reuse it | `v = np.array([1, c]); v / np.linalg.norm(v)`. Fixtures for c ∈ {1, −1, i, −i, $e^{i\pi/4}$}: P(+z) = 0.5; P(+x) = (1 + cos φ)/2 → 1, 0, 0.5, 0.5, 0.8536. |
| G3 | `relativeCoeff(psi: Vec): C \| null` in `spin.ts` | $\psi_1/\psi_0$, or null when $\psi_0 = 0$ | the inverse of G2; challenge `l2-mub-phase` (arg c for $\vert{-y}\rangle$ → −π/2) | `psi[1]/psi[0]`; fixture `np.angle(relcoeff(-y))` = −π/2. |
| G4 | `mutuallyUnbiased(A: Vec[], B: Vec[], eps = 1e-9): boolean` in `spin.ts` | every $\vert\langle a\vert b\rangle\vert^2 = 1/\dim$ | `l2-mub` (tb:b3); `l2-mub-which` | `np.allclose(abs(A.conj().T @ B)**2, 1/d)`. Fixtures: (z,x), (x,y), (z,y) → True; (z, tilt 45°) → False, max 0.8536. |
| G5 (optional) | `csqrt(z: C): C` in `complex.ts` | principal root: `polar(Math.sqrt(abs(z)), arg(z)/2)` | `l2-c-sqrt` ($\sqrt{-2} = 1.414i$) | `np.sqrt(-2+0j)` = 1.4142j. |
| G6 (optional) | `cpow(z: C, n: number): C` in `complex.ts` (integer n) | repeated `mul`, or `polar(abs(z)**n, n*arg(z))` | `l2-i-cubed`, `l2-i-fourth`; the Arcade idea $i^{2026}$ | `(1j)**n`. Fixtures n = 2, 3, 4, 2026 → −1, −i, 1, −1. |

Everything else is composed in `L2.values.ts`, as L1 does.

### 8.2 Stage-contract gaps (content/stage.ts, stage/) — not engine, but blocking or near-blocking

| # | Gap | Why L2 needs it | Proposal |
|---|---|---|---|
| S1 | **The `bloch` kind has no real scene.** It is the W0 wireframe `PlaceholderSphere` (`stage/scenes/index.ts`). | 16 of 38 beats use `bloch` (units 3–5). | D ports the Bloch scene from the gate (as was done for `bloch-ball`) **before** the L2 build. It needs the `B-POLE` and `B-STD` shots, the `trail`, the `measure` readout, and the `x`/`y`/`z` anchors. |
| S2 | `BlochState` has no way to show the six named states at once. | tb:b2 and tb:b5 (the notes' closing picture). | An additive optional field `landmarks?: boolean`, mirroring the `bloch` widget's `landmarks` prop, as interface change #n via W. Fallback: the axis anchors carry the pair labels. |
| S3 | `LabBench.showPrep` always draws an **untilted z** prep module (`scenes/lab/layout.ts`). | L2 benches use `'+x'`, `'-x'` and `'+y'` sources. A z prep for them would be physically wrong, and a y prep cannot exist on this bench. | A validation error in `resolve.ts`'s validator: `showPrep` is only allowed with source `'+z'`/`'-z'`. All L2 benches keep `showPrep` off. |
| S4 (optional) | No complex-plane stage. | Unit 3 uses the `bloch` top view as a stand-in: exact for numbers of size 1, silent on stretching. | A light 2D `argand` kind (points $z$, $w$, product, conjugate, unit circle, phase arc; engine `complex.ts`), like L1's `hilbert-plane` proposal. See §11 Q1. |
| S5 | New fidelity items (§10): `plane-no-complex-scalars`, `bloch-equator-unit-circle`, `lab-prepared-offstage`. | They are referenced by beats above. | Add them to `content/fidelity.ts` (P-owned wording). |

**Fixtures to add** (`pipeline/make_fixtures.py`, seed unchanged):
- `bilinear` and `inner` of +y with itself: 0 and 1.
- The G2 table.
- The 24 cross-basis probabilities, all 0.5.
- `toBasis` of ψ at 30° in the x basis: (0.9659, 0.2588).
- `toBasis(psiT, x)`: squared sizes 0.5 and 0.5.
- Townsend Ex. 1.3: 0.9330, and ⟨Sy⟩ = 0.4330.
- $(3/5, 4i/5)$: P(+y) = 0.98, P(+x) = 0.5.
- The 3/8 Arcade level (§9): 0.375.

## 9. Hooks

### 9.1 Concept map (`content/concepts.ts`)
| Concept id | Set `unit` to | Also covered in |
|---|---|---|
| `vector-space` | `l2-vector-space` | — |
| `inner-product` | `l2-inner-product` | `l2-plus-y:b8` (why the bra is conjugated) |
| `complex-amplitudes` | `l2-plus-y` | `l2-complex` (the numbers), `l2-three-bases` (the six states, mutually unbiased bases) |

Optional additions, if the map should mirror the units one to one. Both are L2 and create no cycle:
- `complex-numbers` ("Complex numbers as turns"), `needs: []`, unit `l2-complex`; add it to `complex-amplitudes.needs`.
- `mutually-unbiased` ("Three mutually unbiased bases"), `needs: ['complex-amplitudes']`, unit `l2-three-bases`.

Existing later concepts already build on L2 correctly: `spin-matrices` and `bloch-sphere` need `complex-amplitudes`.

### 9.2 Arcade: one level per unit (formats from `arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const L2x = (unit, label) => ({ lecture:'L2', unit, label })`.

1. **`l2-vector-space` · Spot the error · `minus-is-down`** — "Minus up is down?"
   - Steps:
     1. "$-\vert{+z}\rangle$ is a ket: rule 6 with $\lambda = -1$."
     2. "It has length 1."
     3. "It points opposite to $\vert{+z}\rangle$, so it is the state $\vert{-z}\rangle$."
     4. "So $-\vert{+z}\rangle$ is orthogonal to $\vert{+z}\rangle$."
   - `wrong: 2` (step 3).
   - Why: $-\vert{+z}\rangle$ is the *same* state as $\vert{+z}\rangle$. $\langle{+z}\vert(-\vert{+z}\rangle) = -1$, not 0 (`inner(KET['+z'], vscale(KET['+z'],-1))` → −1; `samePhysicalState` → true).
2. **`l2-inner-product` · Spot the error · `x-probs-add`** — "Probabilities in the new basis"
   - Steps:
     1. "Take $\alpha = 0.866$ and $\beta = 0.5$ in the $z$ basis."
     2. "The $x$ coordinate is $\delta = (\alpha+\beta)/\sqrt2 = 0.966$."
     3. "The other is $\varepsilon = (\alpha-\beta)/\sqrt2 = 0.259$."
     4. "So the $x$-basis probabilities add to $0.966 + 0.259 = 1.225$."
   - `wrong: 3` (step 4).
   - Why: probabilities are squared sizes, 0.933 + 0.067 = 1 (`toBasis`, §1 `l2-delta-eps`).
3. **`l2-complex` · Spot the error · `modulus-square`** — "The size of 1 + i"
   - Steps:
     1. "Take $z = 1 + i$."
     2. "Its size squared is $\vert z\vert^2 = z^2$."
     3. "$z^2 = 1 + 2i + i^2 = 2i$."
     4. "So $\vert z\vert = \sqrt{2i}$."
   - `wrong: 1` (step 2).
   - Why: $\vert z\vert^2 = z^*z = (1-i)(1+i) = 2$ (`mul(conj(c(1,1)), c(1,1))` → 2). A size is a real number.
4. **`l2-plus-y` · Spot the error · `forgot-conjugate`** — "A state of length zero?"
   - Steps:
     1. "In the $z$ basis, $\vert{+y}\rangle = (1, i)/\sqrt2$."
     2. "Its bra is the row $(1, i)/\sqrt2$."
     3. "So $\langle{+y}\vert{+y}\rangle = (1 + i^2)/2 = 0$."
     4. "A state of length 0 is impossible, so this $\vert{+y}\rangle$ is wrong."
   - `wrong: 1` (step 2).
   - Why: the bra conjugates, so it is $(1, -i)/\sqrt2$ and the length is 1 (Townsend §2.1, p. 32; `norm2(KET['+y'])` → 1, G1 `bilinear` → 0).
5. **`l2-three-bases` · Route the beam · `three-eighths-y`** — "Three eighths of a +y beam"
   - Level: `source:'+y'`, `target:{spot:'plus', fraction:3/8, label:'⅜'}`, `maxDevices:2`, `start:{axes:['z'], keep:[]}`. The start gives 0.5, so it does not reach the target.
   - Hint: "Every magnet in the x–z plane splits a +y beam 50/50. What can a second magnet do with what the first one keeps?"
   - Why: $y$ is at right angles to every x–z axis, so the first magnet passes ½. A 30° magnet then leaves atoms that an $x$ magnet passes with $(1 + \sin 30°)/2 = ¾$, and ½ × ¾ = ⅜.
   - `solution:{axes:[30,'x'], keep:['+']}`: `benchTheory` → plus 0.375.
   - `trains: L2x('l2-three-bases', '2.5 Three bases, each blind to the others')`.
   - Optional Bloch-golf companion, labelled ahead of the course like the existing ROT levels: `c-times-minus-i`, start `'+x'`, target `'-y'`, par 1, solution `[{axis:'z', sign:-1}]`. Its hint: multiplying $c$ by $-i$ is a quarter turn clockwise, seen from $+z$.

## 10. Fidelity notes per stage kind

L2 uses three kinds. The L1 contracts in `content/fidelity.ts` stay as they are. Below: what each picture gets right
**for L2's claims**, what it distorts, and three new items (ready to paste into `fidelity.ts`).

### `hilbert-plane` (units 1, 2, 3 b1, 4 b2–b3)
- **Right:**
  - For real states, arrows, right angles and shadows are exact. δ and ε really are the shadows on the 45°-turned $x$ frame (`plane-angles-true`, `plane-shadow-born`).
  - The "real $c$ gives only $\vert{\pm x}\rangle$" beat (py:b3) is the plane telling the truth about its own limit.
- **Distorts:**
  - It cannot show complex states or complex scalars. $\vert{+y}\rangle$ and $i\vert{+x}\rangle$ are absent by construction (`plane-real-slice`).
  - It shows $-\vert\psi\rangle$ as a second arrow (`plane-sign-twice`), and its angles are half of lab angles (`plane-half-angles`).
- **New:** `plane-no-complex-scalars` (schematic): "A real number stretches or flips an arrow here. A complex number such as $i$ turns the vector into directions this flat slice does not contain, though the state itself is unchanged."

### `lab-r3` (unit 4 b1, b4, b6, b8)
- **Right:**
  - Every plate fraction is the exact `benchTheory` prediction, including for the $\vert{+y}\rangle$ source (`lab-born-fractions`).
  - The two-bench layout lets the $z$ test and the $x$ test sit side by side.
- **Distorts:**
  - The beam flies along y, so no bench can show the SG$_y$ magnet that prepares or measures $\pm y$ (`lab-beam-along-y`).
  - Atoms appear to pick a beam inside the magnet (`lab-both-paths`), and chips are captions, not places (`lab-chips-captions`).
- **New:** `lab-prepared-offstage` (misleading on purpose): "Some benches start with a beam already prepared along $x$ or $y$. Preparing a $y$ beam needs a magnet pointing along the beam itself, which this bench cannot hold, so the beam arrives ready-made."

### `bloch` (unit 3 b2–b8, unit 4 b5 and b7, unit 5)
- **Right:**
  - The equator azimuth *is* $\arg c$ for $(\vert{+z}\rangle + c\vert{-z}\rangle)/\sqrt2$ with $\vert c\vert = 1$. So the top view is an exact unit circle for the notes' payoff $1 \to i \to -1 \to -i$.
  - $P(+) = (1 + \hat n\cdot\vec r)/2$ holds exactly, which gives the 50/50 readouts of mutually unbiased bases (`bloch-born`).
  - Each of the six states is one point on an axis (`bloch-one-point`).
- **Distorts:**
  - Orthogonal states sit at *opposite* points. The mutually unbiased pairs, which are 45° apart as vectors, sit 90° apart here (`bloch-double-angle`). This is the main thing to say in tb:b2.
  - Global phase is invisible (`bloch-global-phase-hidden`). That is why the "same state" clue in unit 1 uses the plane, not the sphere.
  - Its passport says "state space" even in the numbers unit; the cx:b2 caption owns that.
  - The notes defer the sphere until after measurement, so every L2 use is a labelled preview. The full treatment is L6.
- **New:** `bloch-equator-unit-circle` (schematic): "In the complex-numbers unit, the equator seen from above is the unit circle of complex numbers. That is exact for numbers of size 1, because the state $(\vert{+z}\rangle + c\vert{-z}\rangle)/\sqrt2$ sits at the angle of $c$. Numbers of other sizes, and stretching, are not shown here."

## 11. Questions for the user

**Q1. A complex-plane stage, or the Bloch top view?**
None of the six stage kinds is a complex plane. As written, unit 3 (and py:b5) uses the `bloch` stage seen from above:
- **For:** it is exact for numbers of size 1, and it is the notes' own payoff picture.
- **Against:** it shows the Bloch sphere before the notes introduce it, and it cannot show stretching (the Try-it widget covers that).

The alternative is a light 2D `argand` stage kind (§8 S4), built like L1's `hilbert-plane`.
*Recommendation:* keep the top view for L2, because it pays off in unit 5. Either way the `bloch` scene must be ported
from the gate before L2 (§8 S1).

**Q2. Are the p.8 "??" exercises homework?**
The notes pose four open questions: $\vert\text{right}\rangle = ??$, $\vert\text{left}\rangle = ??$, δ = ??, ε = ??. They are
not marked as homework; only Euler's formula (p.7) is. The plan gives `l2-ip-right-left` and `l2-ip-delta` full walkthroughs.
*If they are assigned*, both become `assigned: 'L2 p.8'` (hints only), and beats `l2-inner-product:b5`–`b6` keep the results
but drop the derivation lines.

**Q3. Do the pasted blocks count as lecture content?**
The pasted blocks on pp.8–11 read like drafting advice written to the instructor ("I would explicitly say…", "Lecture 2 can end with…").
They carry the $c = \pm i$ derivation, the mutually unbiased bases, the six-state table and the Bloch-sphere preview. The plan
treats all of it as **[L] lecture content**. If some of it was not delivered in class, those beats should become
[B]-style "beyond the lecture" beats instead. That would mostly be tb:b5 (the sphere preview), and possibly the mutually-unbiased definition.
