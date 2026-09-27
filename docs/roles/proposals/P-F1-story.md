# P-F1-story — F1 "Numbers that turn" (role P, Physics 709 pilot chapter)

Proposal only. Nothing under `app/` is modified. Format: `P-L2-story.md`, extended for the two tracks of
`W-709-platform.md` §B (per-beat `formal`, `captionFormal`, `reveal.formal`, `derivation {result, ground[], formal[]}`)
and the bridges of §C (`<<id|shown>>` with a return bar). Map entry: `P-709-map.md` §1 F1; rulings:
`decisions/qc709-map.md`.

**Sources read.**
- Axler 4e: §1A pp. 2–4 (1.1 ℂ and its arithmetic, 1.2 re-deriving the product from $i^2 = -1$, 1.3 properties,
  1.5 inverses); Ch. 4 pp. 120–121 (4.1 Re/Im, 4.2 conjugate and absolute value, 4.3 example, 4.4 properties incl.
  $|wz| = |w||z|$ and the triangle inequality with proof); pp. 125–126 (4.12–4.13 the fundamental theorem of algebra).
  Axler printed = PDF − 14, checked on p. 2 (PDF 16), p. 120 (PDF 134) and p. 125 (PDF 139).
- Bergou 2e: §1.1 pp. 1–2 (Eq. 1.1 the qubit; Eq. 1.2 the Bloch parameterisation with $e^{i\varphi}$); §1.5 pp. 7–8
  (phase shifter, Eq. 1.18, Fig. 1.7). Ch. 1 printed = PDF − 15.
- 709 notes p. 7 ($|s_x = \pm\rangle = \alpha|{+z}\rangle + e^{i\delta_\pm}\beta|{-z}\rangle$, $\delta_+ = 0$, $\delta_- = \pi$) and p. 12
  (Eq. 1.4, $e^{i\phi}$ in $|{+n}\rangle$), text layer.
- What 448 already owns: `app/src/content/L2.story.ts` (`l2-complex`, `l2-plus-y`), `L2.review.ts`, `P-L2-story.md`.

**Evidence.** Every number below was computed twice: by an independent numpy script (`pilot-plan-f1.py`) and by the
app's own engine (`pilot-plan-engine.ts`, bundled with the repo's rolldown into the session scratchpad; read-only
imports of `physics/complex.ts` and the merged `physics/qc/complexExtra.ts`). They agree to 6 decimals everywhere.

**Conventions.**
- Beat id `<unit>:b<n>`. Phase tags: **[L]** the chapter's core ramp (an F chapter has no lecture; the `lecture`
  phase holds the chapter's own line, sourced from Axler and Bergou), **[B]** a second source adds, **[C]** clue.
  Order L → B → C.
- Every beat has **G** (Ground-up: 9th-grade start, ≤ 25 words per sentence) and **F** (Formal: full notation,
  ≤ 40 words per sentence). Captions are "cap G" / "cap F". Stage, terms, claims and bridges are shared by both tracks.
- Stage shorthand:
  - `cp{…}` = the proposed `{kind:'complex-plane', shot:'C-FLAT', …}` (state shape in §9.2);
  - `amp{…}` = the planned `{kind:'amplitudes', …}` (fields F1 needs, §9.2);
  - `top(φ)` = the 448 fallback `{kind:'bloch', state:{thetaDeg:90, phiDeg:φ}, shot:'B-POLE'}`: the Bloch equator seen
    from above, exact for numbers of size 1 only (448 L2 ruling Q1, fidelity `bloch-equator-unit-circle`);
  - `sweep(a,b)` = `{from:a, to:b}`.
- Claims: `key` — statement — `engine call` → value. Engine: `physics/complex.ts` (`c, I, ONE, add, sub, mul, scale,
  conj, neg, div, abs, abs2, arg, expi, polar, csqrt, cpow`), `physics/qc/complexExtra.ts` (`eulerLimit, eulerPath,
  phasorSum, phasorPath`), `physics/spin.ts` (`KET, samePhysicalState`), `physics/linalg.ts` (`inner, vscale`).
- Bridges: `<<unit-id|shown>>`, where the id is the target's unit id (proposal: `qc709/bridges.ts` keys equal target unit
  ids). 448 targets are exact ids from `meta.generated.ts`; F targets use the map's unit ids.
- Angles: degrees in both tracks until `f1-euler:b1` defines radians; after it, radians unless marked °.
- **Rosetta** (stated once, in `f1-plane:b4` cap F): Axler writes $\bar z$ where physics writes $z^*$; Axler's
  "absolute value" is our modulus (Ground: size); the notes' $\phi$ is our φ; the engine's `arg` returns the
  principal value in (−180°, 180°].

## 0. Chapter map

F1 answers the map's question: **"Why would anyone need a number whose square is −1, and what does it have to do with
spinning arrows?"** It stands alone (a 9th grader can start here) and doubles as the bridge target for every later
chapter that meets a complex amplitude. 448's `l2-complex` covers units 1–4 in lighter form, so each F1 unit offers it
as a side trip, never as a prerequisite.

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges offered |
|---|---|---|---|---|---|
| 1 | `f1-number-line` | The gap that $x^2 = -1$ leaves | Which equations can ordinary numbers not solve, and what new number fills the last gap? | Axler 1.1 p. 2; 4.12 p. 125; Bergou Eq. 1.1 p. 1 | `l2-complex` (ladder, $i$), `l2-plus-y` (why physics needs $i$) |
| 2 | `f1-plane` | Numbers as points and arrows | How do we draw, add, measure and mirror a complex number? | Axler 1.1 p. 2; 4.1–4.4 pp. 120–121 | `l2-complex` (parts, size, conjugate) |
| 3 | `f1-multiply` | Multiplying stretches and turns | What does multiplying two complex numbers do to their arrows? | Axler 1.1–1.5 pp. 2–4; 4.4 p. 121 | `l2-complex` (polar product) |
| 4 | `f1-euler` | $e^{i\varphi}$: walking round the unit circle | Why does $e$, the number of compound growth, raised to an imaginary power walk round a circle? | Bergou Eq. 1.2 p. 2; notes p. 12 Eq. 1.4 | `l2-complex` (Euler), `l7-full-turn` ($e^{i\pi} = -1$ as a sign) |
| 5 | `f1-phase` | Phases you can and cannot see | When arrows add, why does only the difference of their angles matter? | Bergou §1.5 pp. 7–8, Eq. 1.18; notes p. 7, p. 12 | `l6-equator` (relative phase = longitude), `l7-full-turn` (global −1), `l2-plus-y` |

Forward F bridge: `f1-phase:b7` → `f8-roots` (roots of unity sum to zero).

**Outcomes** (`Lecture.outcomes`, Ground wording):
- Explain why $x^2 = -1$ has no answer on the number line, and how $i$ fixes it.
- Draw a complex number, add two, find its size, and mirror it.
- Multiply complex numbers, and say why sizes multiply and angles add.
- Say what $e^{i\varphi}$ is and why $e^{i\pi} = -1$.
- Tell a global phase, which nothing can detect, from a relative phase, which interference shows.

**Prerequisites** (concept ids): none. The Ground ramp assumes the number line, fractions, Pythagoras, and sin/cos as
the coordinates of a point on a circle of radius 1.

**Openers and films.** The Part F Blender opener ("the ring and the helix", §10) plays before `f1-number-line`. Film
`qc-f1-quarter-turn` is the `Unit.opener` of `f1-multiply`; film `qc-f1-euler-limit` is the opener of `f1-euler`.

## 1. Story beats per unit

Stage kinds used: the proposed `complex-plane` (every unit), the planned `amplitudes` (`f1-number-line:b6`,
`f1-phase:b5`–`b6`). Fallback until `complex-plane` exists: `top(φ)`, which is exact only for numbers of size 1; beats
whose number has another size (`f1-plane`, most of `f1-multiply`, `f1-euler:b3`–`b4`, `b7`) then lose the picture of the
size and keep it in the caption (§9.2, §12 Q2).

### Unit `f1-number-line` — The gap that $x^2 = -1$ leaves

**`f1-number-line:b1` [L]** (the ladder)
- **G:** "Start with the counting numbers 1, 2, 3 and so on. Let $x$ stand for an unknown number. The equation $x + 5 = 3$ has no counting-number answer, so negative numbers were invented: $x = -2$. The equation $2x = 3$ needs fractions: $x = 3/2$."
- **F:** "Each extension $\mathbb N \subset \mathbb Z \subset \mathbb Q \subset \mathbb R$ (counting numbers, integers, fractions, the real line) makes one more operation always possible: subtraction, then division by a nonzero number, then limits of sequences."
- **Cap:** G "the number line: $-2$ sits two steps left of zero" · F "the root of $x + 5 = 3$ in $\mathbb Z$"
- **Stage:** `cp{ line:true, z:{re:-2, im:0} }` · fallback `top(180)` (direction only).
- **Claims:** `f1NegRoot` — $-2 + 5 = 3$ — `add(c(-2), c(5))` → (3, 0) · `f1Half3` — $2 \cdot \tfrac32 = 3$ — `div(c(3), c(2))` → 1.5.

**`f1-number-line:b2` [L]** (squares are never negative)
- **G:** "Squares open the next gap; $x^2$ means $x$ times $x$. The equation $x^2 = 2$ needs $\sqrt2 = 1.414\ldots$, which no fraction equals. Worse, a square is never negative: $3^2 = 9$ and $(-3)^2 = 9$. So $x^2 = -1$ has no answer on the line."
- **F:** "For $x \in \mathbb R$, $x^2 \ge 0$ with equality only at 0, since $(-x)^2 = x^2$. So $x^2 = 2$ forces the step to $\mathbb R$, while $x^2 + 1 = 0$ has no real root and needs a new number."
- **Cap:** G "3 and −3 both square to 9: no point on the line squares to −1" · F "$x \mapsto x^2$ maps $\mathbb R$ onto $[0, \infty)$"
- **Stage:** `cp{ line:true, z:{re:3, im:0}, w:{re:-3, im:0} }`.
- **Claims:** `f1Sqrt2` — $\sqrt2 = 1.414$ — `csqrt(c(2)).re` → 1.4142 · `f1SqNeg3` — $(-3)^2 = 9$ — `mul(c(-3), c(-3))` → (9, 0).

**`f1-number-line:b3` [L]** (×(−1) is a half turn)
- **G:** "Multiplying by $-1$ moves 2 to $-2$, the mirror spot across zero. Picture it as swinging the arrow from zero to 2 through half a circle. Two half turns make a full turn, so $(-1)(-1) = 1$."
- **F:** "On the line, multiplication by $-1$ is the reflection $x \mapsto -x$. Seen inside a plane it is the rotation by 180° about 0, whose square is the identity."
- **Cap:** G "×(−1): the arrow to 2 swings half a turn to −2" · F "rotation by 180° about 0"
- **Stage:** `cp{ z:{r:2, phiDeg:sweep(0,180)}, trail:true }` · fallback `top(sweep(0,180))`.
- **Claims:** `f1HalfTurn` — $(-1)\cdot 2 = -2$ — `mul(c(-1), c(2))` → (−2, 0) · `f1TwoHalf` — $(-1)(-1) = 1$ — `mul(c(-1), c(-1))` → (1, 0).

**`f1-number-line:b4` [L]** ($i$ is a quarter turn)
- **G:** "Look for a number whose square is $-1$, and call it [[qc-imaginary-unit|$i$]]. Multiplying by $i$ twice must equal one half turn. So multiplying by $i$ is a quarter turn, and $i$ sits one step straight up from zero, off the line. Spin Lab tells the same story: <<l2-complex|Spin Lab 2.3 Numbers that turn>>."
- **F:** "Adjoin $i$ with $i^2 = -1$ (Axler 1.1, p. 2): $\mathbb C = \{a + bi : a, b \in \mathbb R\}$, identified with $\mathbb R^2$ by $a + bi \leftrightarrow (a, b)$, the [[qc-complex-plane|complex plane]]. Multiplication by $i$ is the rotation by 90°, whose square is the rotation by 180°, that is $-1$."
- **Cap:** G "×$i$ turns 1 a quarter to $i$; ×$i$ again turns $i$ to −1" · F "multiplication by $i$ = rotation by 90°"
- **Stage:** `cp{ z:{r:1, phiDeg:sweep(0,180)}, trail:true, show:['arc'] }` · fallback `top(sweep(0,180))` (exact).
- **Claims:** `f1ITimesOne` — $i \cdot 1 = i$ — `mul(I, ONE)` → (0, 1) · `f1ISquared` — $i^2 = -1$ — `mul(I, I)` → (−1, 0).

**`f1-number-line:b5` [L]** (two square roots)
- **G:** "The opposite quarter turn, $-i$, also squares to $-1$, because $(-i)(-i) = i^2$. So $x^2 = -1$ has exactly two answers, $i$ and $-i$. In the same way, $x^2 = -9$ has the answers $3i$ and $-3i$."
- **F:** "$x^2 + 1 = (x - i)(x + i)$, so the roots are $\pm i$; likewise $x^2 + a = 0$ with $a > 0$ has roots $\pm i\sqrt a$. The engine's principal root halves the angle: $\sqrt{-9} = 3i$."
- **Cap:** G "$i$ and $-i$: the two square roots of −1" · F "the zeros of $x^2 + 1$ in $\mathbb C$"
- **Stage:** `cp{ z:{re:0, im:1}, w:{re:0, im:-1} }` · fallback `top(90)`.
- **Claims:** `f1NegISquared` — $(-i)^2 = -1$ — `mul(neg(I), neg(I))` → (−1, 0) · `f1SqrtM9` — $\sqrt{-9} = 3i$ — `csqrt(c(-9))` → (0, 3).

**`f1-number-line:b6` [B]** (why physics wants $i$)
- **G:** "Why should a physicist care? Bergou describes a [[qc-qubit|qubit]], the quantum version of a bit, by two numbers $\alpha$ and $\beta$ (alpha and beta). They are allowed to be complex. The qubit state pointing along $y$ even needs $i$ itself: its second number is $i/\sqrt2$."
- **F:** "Bergou's qubit is $\alpha|0\rangle + \beta|1\rangle$ with basis states $|0\rangle, |1\rangle$ and $\alpha, \beta \in \mathbb C$ (§1.1, Eq. 1.1, p. 1). Real amplitudes cannot describe a spin along $y$: $|{+y}\rangle$ has $\beta = i/\sqrt2$ <<l2-plus-y|Spin Lab 2.4 Real numbers cannot make +y>>."
- **Cap:** G "a qubit's two numbers: 0.707 and 0.707$i$" · F "$|{+y}\rangle$: amplitudes $(0.707,\ 0.707i)$"
- **Stage:** `amp{ state:'+y', labels:'bits', dials:true }` · fallback `top(90)`.
- **Refs:** Bergou §1.1, p. 1 (Eq. 1.1: a qubit's amplitudes are complex).
- **Claims:** `f1YAmp` — the second amplitude of $|{+y}\rangle$ is $0.707i$ — `KET['+y'][1]` → (0, 0.7071).

**`f1-number-line:b7` [C]** (a root of $i$)
- **Q G:** "We invented $i$ to take a square root of $-1$. Will we need yet another new number to take a square root of $i$?"
- **Q F:** "Is $\mathbb C$ closed under square roots, or must $\sqrt i$ be adjoined as well?"
- **Reveal G:** "No new number is needed. Try $(1 + i)/\sqrt2$, about $0.707 + 0.707i$. Multiply out: $(1 + i)^2 = 1 + 2i + i^2 = 2i$, and dividing by $(\sqrt2)^2 = 2$ leaves exactly $i$."
- **Reveal F:** "$\mathbb C$ is algebraically closed: every nonconstant polynomial with complex coefficients has a complex zero (Axler 4.12, p. 125). Here $z^2 - i = 0$ has the roots $\pm(1 + i)/\sqrt2$, so the ladder of extensions stops at $\mathbb C$."
- **Reveal cap:** G "$(1+i)/\sqrt2$ squared lands on $i$" · F "$\pm(1+i)/\sqrt2$ solve $z^2 = i$"
- **Stage:** question `cp{ z:{re:0, im:1} }`; reveal `cp{ powers:{of:{r:1, phiDeg:45}, upTo:2} }` · fallback `top(45)` → `top(90)`.
- **Claims:** `f1SqrtI` — $\sqrt i = 0.707 + 0.707i$ — `csqrt(I)` → (0.7071, 0.7071) · `f1SqrtISq` — its square is $i$ — `mul(csqrt(I), csqrt(I))` → (0, 1).

### Unit `f1-plane` — Numbers as points and arrows

**`f1-plane:b1` [L]** (a point in the plane)
- **G:** "Every [[qc-complex-number|complex number]] can be written $z = a + bi$, where $a$ and $b$ are ordinary numbers. Draw it as the point $a$ steps across and $b$ steps up. The across part $a$ is the [[qc-real-part|real part]]; the up part $b$ is the [[qc-imaginary-part|imaginary part]]."
- **F:** "Write $z = a + bi$ with $\operatorname{Re} z = a$ and $\operatorname{Im} z = b$ (Axler 4.1, p. 120). The map $z \mapsto (\operatorname{Re} z, \operatorname{Im} z)$ identifies $\mathbb C$ with $\mathbb R^2$; $\mathbb R$ is its horizontal axis."
- **Cap:** G "$z = 3 + 4i$: 3 across, 4 up" · F "$\operatorname{Re} z = 3$, $\operatorname{Im} z = 4$"
- **Stage:** `cp{ z:{re:3, im:4}, show:['parts'] }` · fallback `top(53.13)` (direction only; the caption carries the size).
- **Claims:** `f1ReIm34` — the parts of $3 + 4i$ — `c(3,4).re`, `.im` → 3, 4.

**`f1-plane:b2` [L]** (adding is tip to tail)
- **G:** "Add complex numbers part by part: $(3 + 4i) + (1 - 2i) = 4 + 2i$. In the picture, put the second arrow's tail at the first arrow's tip. The sum is the arrow from zero to the new tip."
- **F:** "Addition is componentwise, $(a + bi) + (c + di) = (a + c) + (b + d)i$ (Axler 1.1): vector addition in $\mathbb R^2$, the parallelogram rule. It is commutative and associative, with identity 0 and inverse $-z$."
- **Cap:** G/F "$(3 + 4i) + (1 - 2i) = 4 + 2i$, tip to tail"
- **Stage:** `cp{ z:{re:3, im:4}, w:{re:1, im:-2}, show:['sum'] }`.
- **Claims:** `f1Sum` — `add(c(3,4), c(1,-2))` → (4, 2).

**`f1-plane:b3` [L]** (size by Pythagoras)
- **G:** "The size of $z$, written $|z|$, is its distance from zero. The two parts are the legs of a right triangle, so Pythagoras gives $|z| = \sqrt{a^2 + b^2}$. For $3 + 4i$ that is $\sqrt{9 + 16} = 5$."
- **F:** "The [[qc-modulus|modulus]] $|z| = \sqrt{(\operatorname{Re} z)^2 + (\operatorname{Im} z)^2}$ (Axler 4.2) is the Euclidean length of $(a, b)$. It vanishes only at $z = 0$, and $|\operatorname{Re} z|, |\operatorname{Im} z| \le |z|$ (Axler 4.4)."
- **Cap:** G "the right triangle 3, 4, 5" · F "$|3 + 4i| = 5$"
- **Stage:** `cp{ z:{re:3, im:4}, show:['parts','modulus'] }`.
- **Claims:** `f1Abs34` — `abs(c(3,4))` → 5.

**`f1-plane:b4` [L]** (the conjugate is a mirror)
- **G:** "The [[qc-conjugate|conjugate]] $z^*$ flips the sign of the imaginary part: $(3 + 4i)^* = 3 - 4i$. In the picture it is the mirror image of $z$ in the across axis. Mirroring keeps the size, so $|z^*| = |z|$."
- **F:** "The conjugate $z^* = \operatorname{Re} z - i\operatorname{Im} z$ is reflection in the real axis (Axler 4.2 writes $\bar z$). It satisfies $|z^*| = |z|$, $(z^*)^* = z$, $(z + w)^* = z^* + w^*$ and $(zw)^* = z^*w^*$ (Axler 4.4)."
- **Cap:** G "$z$ and its mirror $z^*$" · F "Rosetta: Axler $\bar z$ = physics $z^*$; Axler's absolute value = modulus"
- **Stage:** `cp{ z:{re:3, im:4}, show:['conj'] }`.
- **Claims:** `f1Conj34` — `conj(c(3,4))` → (3, −4); `abs(conj(c(3,4)))` → 5.
- **Note:** $(zw)^* = z^*w^*$ is the fact Q1's conjugate-linearity derivation (`q1-inner-product:b3`) bridges back to.

**`f1-plane:b5` [L]** ($zz^* = |z|^2$; derivation D0)
- **G:** "Multiply $z$ by its mirror, treating $i$ as a letter with $i^2 = -1$. $(3 + 4i)(3 - 4i) = 9 - 12i + 12i - 16i^2 = 9 + 16 = 25$. That is $|z|^2$ exactly, with no $i$ left."
- **F:** "For $z = a + bi$, $zz^* = a^2 + b^2 = |z|^2 \ge 0$ (Axler 4.4). Hence $\operatorname{Re} z = (z + z^*)/2$, $\operatorname{Im} z = (z - z^*)/2i$, and $z^{-1} = z^*/|z|^2$ for $z \ne 0$."
- **Cap:** G "$z$ times its mirror: 25, a plain positive number" · F "$zz^* = |z|^2 = 25$"
- **Stage:** `cp{ z:{re:3, im:4}, show:['conj','modulus'] }`.
- **Derivation:** D0 (§2).
- **Claims:** `f1ZZstar` — `mul(c(3,4), conj(c(3,4)))` → (25, 0).

**`f1-plane:b6` [B]** (the triangle inequality)
- **G:** "Axler proves a rule you can see in the picture. Two arrows tip to tail are never longer together than their two lengths added: $|z + w| \le |z| + |w|$. For our pair, $|4 + 2i| = 4.47$, while $5 + 2.24 = 7.24$."
- **F:** "[[qc-triangle-inequality|Triangle inequality]] (Axler 4.4, p. 121): $|w + z|^2 = |w|^2 + |z|^2 + 2\operatorname{Re}(wz^*) \le (|w| + |z|)^2$, because $\operatorname{Re}(wz^*) \le |w||z|$. Equality holds exactly when one number is a nonnegative real multiple of the other."
- **Cap:** G "the sum's arrow is shorter than the two arrows laid end to end" · F "$4.472 \le 7.236$"
- **Stage:** `cp{ z:{re:3, im:4}, w:{re:1, im:-2}, show:['sum','modulus'] }`.
- **Refs:** Axler 4.4, p. 121 (the list of properties and the proof of the triangle inequality).
- **Claims:** `f1AbsSum` — `abs(add(c(3,4), c(1,-2)))` → 4.4721 · `f1Abs1m2` — `abs(c(1,-2))` → 2.2361 · sum with `f1Abs34` → 7.2361.

**`f1-plane:b7` [C]** (fixed points of the mirror)
- **Q G:** "Which numbers equal their own mirror, $z^* = z$? And which are the negative of their mirror, $z^* = -z$?"
- **Q F:** "Characterise $\{z \in \mathbb C : z^* = z\}$ and $\{z \in \mathbb C : z^* = -z\}$."
- **Reveal G:** "$z^* = z$ means $b = -b$, so $b = 0$: exactly the ordinary numbers on the across axis. $z^* = -z$ means $a = -a$, so $a = 0$: the purely imaginary numbers on the up axis, such as $3i$."
- **Reveal F:** "$z^* = z \iff \operatorname{Im} z = 0 \iff z \in \mathbb R$, the fixed line of the reflection; $z^* = -z \iff z \in i\mathbb R$. Self-conjugate numbers return in F4 as the eigenvalues of Hermitian matrices."
- **Reveal cap:** G "the across axis stays put; the up axis flips" · F "$\mathbb R$ fixed, $i\mathbb R$ negated"
- **Stage:** question `cp{ z:{re:2, im:1}, show:['conj'] }`; reveal `cp{ z:{re:0, im:3}, show:['conj'] }`.
- **Claims:** `f1ConjReal` — `conj(c(2))` → (2, 0) · `f1ConjImag` — `conj(c(0,3))` → (0, −3) = `neg(c(0,3))`.

### Unit `f1-multiply` — Multiplying stretches and turns

Opener: film `qc-f1-quarter-turn` (§10.2).

**`f1-multiply:b1` [L]** (the product rule; D1)
- **G:** "Multiply complex numbers like brackets in algebra, then replace every $i^2$ by $-1$. So $(2 + i)(1 + 3i) = 2 + 6i + i + 3i^2 = -1 + 7i$."
- **F:** "$(a + bi)(c + di) = (ac - bd) + (ad + bc)i$, forced by distributivity and $i^2 = -1$ (Axler 1.1–1.2, pp. 2–3). With it $\mathbb C$ is a [[qc-field|field]]: every nonzero $z$ has an inverse (Axler 1.3, 1.5)."
- **Cap:** G/F "$(2 + i)(1 + 3i) = -1 + 7i$"
- **Stage:** `cp{ z:{re:2, im:1}, w:{re:1, im:3}, show:['product'] }`.
- **Derivation:** D1 (§2).
- **Claims:** `f1Prod` — `mul(c(2,1), c(1,3))` → (−1, 7).

**`f1-multiply:b2` [L]** (×$i$ is a quarter turn; D2)
- **G:** "Multiply any number $a + bi$ by $i$: $i(a + bi) = -b + ai$. So the point $(a, b)$ moves to $(-b, a)$. That is the same point turned a quarter turn about zero, at the same distance."
- **F:** "Multiplication by $i$ is the $\mathbb R$-linear map $(a, b) \mapsto (-b, a)$ with matrix $\begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix}$, the rotation by 90°: orthogonal, determinant 1, so it preserves $|z|$."
- **Cap:** G "$i \times (3 + 4i) = -4 + 3i$: same size 5, turned 90°" · F "$(3, 4) \mapsto (-4, 3)$"
- **Stage:** `cp{ z:{re:3, im:4}, w:{re:0, im:1}, show:['product','arc'] }`.
- **Derivation:** D2 (§2).
- **Claims:** `f1I34` — `mul(I, c(3,4))` → (−4, 3) · `f1AbsI34` — `abs(mul(I, c(3,4)))` → 5.

**`f1-multiply:b3` [L]** (sizes multiply; D3)
- **G:** "Sizes multiply: $|zw| = |z| \times |w|$. Check it on our pair. $|2 + i| = 2.236$ and $|1 + 3i| = 3.162$, whose product is 7.071, and $|-1 + 7i| = \sqrt{50} = 7.071$ as well."
- **F:** "$|zw| = |z||w|$ (Axler 4.4): $|zw|^2 = (ac - bd)^2 + (ad + bc)^2 = (a^2 + b^2)(c^2 + d^2)$ once the cross terms cancel. Equivalently $|zw|^2 = zw(zw)^* = zz^*\,ww^*$."
- **Cap:** G/F "$2.236 \times 3.162 = 7.071 = |-1 + 7i|$"
- **Stage:** `cp{ z:{re:2, im:1}, w:{re:1, im:3}, show:['product','modulus'] }`.
- **Derivation:** D3 (§2).
- **Claims:** `f1AbsProd` — `abs(c(2,1))` → 2.2361, `abs(c(1,3))` → 3.1623, `abs(mul(c(2,1), c(1,3)))` → 7.0711.

**`f1-multiply:b4` [L]** (polar form)
- **G:** "A point can also be named by its size $r$ and its angle $\varphi$ (the Greek letter phi), measured counterclockwise from the across axis. Then $a = r\cos\varphi$ and $b = r\sin\varphi$. So $z = r(\cos\varphi + i\sin\varphi)$, the [[qc-polar-form|polar form]]."
- **F:** "Polar form $z = r(\cos\varphi + i\sin\varphi)$ with $r = |z|$ and $\varphi = \arg z$, the [[qc-argument|argument]]. The engine returns the principal value in (−180°, 180°]; the argument is defined only up to multiples of 360°, and not at all for $z = 0$."
- **Cap:** G "$2 + i$: size 2.236 at 26.6°" · F "$\arg(2 + i) = 26.565°$, $\arg(1 + 3i) = 71.565°$"
- **Stage:** `cp{ z:{re:2, im:1}, show:['modulus','arg'] }`.
- **Claims:** `f1Arg21` — `arg(c(2,1))`·180/π → 26.565° · `f1Arg13` — `arg(c(1,3))`·180/π → 71.565°.

**`f1-multiply:b5` [L]** (angles add; D4)
- **G:** "Now the key fact: when you multiply, the angles add. The product of $2 + i$ (at 26.6°) and $1 + 3i$ (at 71.6°) sits at 98.1°. The proof below turns the axes through the first angle."
- **F:** "$(\cos\varphi_z + i\sin\varphi_z)(\cos\varphi_w + i\sin\varphi_w) = \cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)$ by the angle-addition identities. Hence $zw = |z||w|[\cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)]$: moduli multiply, arguments add modulo 360°."
- **Cap:** G "26.6° + 71.6° = 98.1°: the product's angle" · F "$\arg(zw) = \arg z + \arg w$ (mod 360°)"
- **Stage:** `cp{ z:{re:2, im:1}, w:{re:1, im:3}, show:['product','arg'] }`.
- **Derivation:** D4 (§2), with the angle-addition identities proved once, by turned axes (congruent triangles).
- **Claims:** `f1ArgProd` — `arg(mul(c(2,1), c(1,3)))`·180/π → 98.130°, equal to `f1Arg21 + f1Arg13` = 26.565° + 71.565°.

**`f1-multiply:b6` [B]** (division and de Moivre)
- **G:** "Dividing undoes multiplying: divide the sizes and subtract the angles. So $1/(3 + 4i)$ has size $1/5$ and the opposite angle: it is $0.12 - 0.16i$. Also, three turns of 30° make one turn of 90°, which lands on $i$."
- **F:** "For $w \ne 0$, $z/w = (|z|/|w|)[\cos(\varphi_z - \varphi_w) + i\sin(\varphi_z - \varphi_w)]$ and $z^{-1} = z^*/|z|^2$ (Axler 1.5, p. 4). Induction gives [[qc-de-moivre|de Moivre]]: $(\cos\varphi + i\sin\varphi)^n = \cos n\varphi + i\sin n\varphi$ for $n \in \mathbb Z$."
- **Cap:** G "$(\cos 30° + i\sin 30°)^3 = i$" · F "$1/(3 + 4i) = 0.12 - 0.16i$"
- **Stage:** `cp{ powers:{of:{r:1, phiDeg:30}, upTo:3} }` · fallback `top(sweep(30,90))`.
- **Claims:** `f1Inv34` — `div(ONE, c(3,4))` → (0.12, −0.16) · `f1DeMoivre` — `cpow(expi(Math.PI/6), 3)` → (0, 1).

**`f1-multiply:b7` [C]** (a power without brackets)
- **Q G:** "Without multiplying out eight brackets, what is $(1 + i)^8$?"
- **Q F:** "Evaluate $(1 + i)^8$ in polar form."
- **Reveal G:** "$1 + i$ has size $\sqrt2 = 1.414$ and angle 45°. Eight copies multiply the sizes to $(\sqrt2)^8 = 16$. They add the angles to 360°, one full turn, so $(1 + i)^8 = 16$."
- **Reveal F:** "$1 + i = \sqrt2(\cos 45° + i\sin 45°)$, so by de Moivre $(1 + i)^8 = 2^4(\cos 360° + i\sin 360°) = 16$. The powers $(1 + i)^k$ spiral outward by a factor $\sqrt2$ and 45° per step."
- **Reveal cap:** G/F "powers of $1 + i$: $1,\ 1+i,\ 2i,\ -2+2i,\ -4,\ \ldots,\ 16$"
- **Stage:** question `cp{ z:{re:1, im:1} }`; reveal `cp{ powers:{of:{re:1, im:1}, upTo:8} }`.
- **Claims:** `f1OnePlusI8` — `cpow(c(1,1), 8)` → (16, 0); `f1OnePlusI4` — `cpow(c(1,1), 4)` → (−4, 0) (the midpoint of the spiral).

### Unit `f1-euler` — $e^{i\varphi}$: walking round the unit circle

Opener: film `qc-f1-euler-limit` (§10.2).

**`f1-euler:b1` [L]** (radians)
- **G:** "Measure an angle by the length of arc it cuts from a circle of radius 1: that unit is the [[qc-radian|radian]]. A full turn is the whole circumference, $2\pi \approx 6.283$, where $\pi \approx 3.14159$. So 180° is $\pi$ radians and 90° is $\pi/2 \approx 1.571$."
- **F:** "Radian measure: an angle equals the arc length it subtends on the unit circle, so 360° = $2\pi$. From here on angles are in radians unless marked with °."
- **Cap:** G "half a turn: an arc of length $\pi$ = 3.14159" · F "$\arg(-1) = \pi$, $\arg i = \pi/2$"
- **Stage:** `cp{ z:{r:1, phiDeg:sweep(0,180)}, trail:true, show:['arc'] }` · fallback `top(sweep(0,180))`.
- **Claims:** `f1Pi` — `arg(c(-1))` → 3.14159 · `f1HalfPi` — `arg(I)` → 1.5708.

**`f1-euler:b2` [L]** (the unit circle)
- **G:** "The numbers of size 1 form the [[qc-unit-circle|unit circle]]. The one at angle $\varphi$ is $\cos\varphi + i\sin\varphi$. Multiplying by it turns a number by $\varphi$ and never stretches it, because its size is 1."
- **F:** "$S^1 = \{z : |z| = 1\} = \{\cos\varphi + i\sin\varphi : \varphi \in \mathbb R\}$. By D3–D4 it is closed under products and inverses: the group $U(1)$, and multiplying by an element rotates $\mathbb C$."
- **Cap:** G "every point here has size exactly 1" · F "$S^1 = U(1)$"
- **Stage:** `cp{ z:{r:1, phiDeg:sweep(0,360)}, circle:true, trail:true }` · fallback `top(sweep(0,360))` (exact).
- **Claims:** `f1UnitSize` — `abs(expi(1.0))` → 1.

**`f1-euler:b3` [L]** ($e$ from compound growth)
- **G:** "Grow 1 by 100 % in one step and you reach 2. Split it into two steps of 50 %: $1.5^2 = 2.25$. With $n$ tiny steps, $(1 + 1/n)^n$ settles near [[qc-e|$e$]] $\approx 2.718$ as $n$ grows."
- **F:** "$e = \lim_{n\to\infty}(1 + 1/n)^n \approx 2.71828$, and more generally $e^x = \lim_{n\to\infty}(1 + x/n)^n$. This definition uses only products, so it makes sense for complex $x$."
- **Cap:** G "$(1 + 1/n)^n$: 2, 2.25, …, 2.717 at $n$ = 1000" · F "$n = 10^6$: 2.71828"
- **Stage:** `cp{ line:true, euler:{rate:'real', x:1, n:sweep(1,64)} }` (the points $(1 + 1/n)^k$ on the line).
- **Claims:** `f1Grow2` — `cpow(c(1.5), 2)` → 2.25 · `f1E1000` — `cpow(c(1.001), 1000).re` → 2.7169 · `f1E` — `cpow(c(1 + 1e-6), 1e6).re` → 2.71828.

**`f1-euler:b4` [L]** (growth at an imaginary rate; D5)
- **G:** "Now grow at an imaginary rate: multiply 1 by $(1 + i\varphi/n)$, $n$ times over. Each step is a tiny turn of about $\varphi/n$ with almost no stretch. After $n$ steps the point has turned by about $\varphi$ and sits near the unit circle."
- **F:** "Define $e^{i\varphi} = \lim_{n\to\infty}(1 + i\varphi/n)^n$. Each factor has modulus $\sqrt{1 + \varphi^2/n^2}$ and argument $\arctan(\varphi/n)$, so the product has modulus $(1 + \varphi^2/n^2)^{n/2} \to 1$ and argument $n\arctan(\varphi/n) \to \varphi$."
- **Cap:** G "$(1 + i\pi/n)^n$ for $n$ = 1 … 64: the end point closes in on −1" · F "`eulerPath(π, n)`: modulus 3.297 at $n = 1$, 1.080 at $n = 64$, 1.005 at $n = 1000$"
- **Stage:** `cp{ euler:{rate:'imag', phiDeg:180, n:sweep(1,64)} }` (the polygon `eulerPath(π, n)`).
- **Derivation:** D5 (§2).
- **Claims:** `f1Euler1` — `eulerLimit(Math.PI, 1)` → (1, 3.1416), `abs` 3.2969 · `f1Euler4` — `eulerLimit(Math.PI, 4)` → (−2.3206, 1.2037), `abs` 2.6142 · `f1Euler64` — `eulerLimit(Math.PI, 64)` → (−1.0801, 0.0027), `abs` 1.0801 · `f1Euler1000` — `eulerLimit(Math.PI, 1000)` → (−1.0049, 0.0000), `abs` 1.0049.

**`f1-euler:b5` [L]** (Euler's formula)
- **G:** "So $e^{i\varphi} = \cos\varphi + i\sin\varphi$, [[qc-euler-formula|Euler's formula]]. It names the point of the unit circle at angle $\varphi$. Halfway round, $e^{i\pi} = -1$; a quarter of the way, $e^{i\pi/2} = i$. Spin Lab meets it too: <<l2-complex|Spin Lab 2.3 Numbers that turn>>."
- **F:** "Euler's formula $e^{i\varphi} = \cos\varphi + i\sin\varphi$ gives the exponential form $z = re^{i\varphi}$, and D4 becomes $e^{i\alpha}e^{i\beta} = e^{i(\alpha+\beta)}$. In particular $e^{i\pi} + 1 = 0$; Spin Lab reads $e^{i\pi} = -1$ as a sign <<l7-full-turn|Spin Lab 7.2 A full turn flips the sign>>."
- **Cap:** G "$e^{i\varphi}$ for $\varphi$ from 0 to $2\pi$; at $\pi$ it is −1" · F "$e^{i\pi} = -1$, $e^{i\pi/2} = i$"
- **Stage:** `cp{ z:{r:1, phiDeg:sweep(0,360)}, trail:true }` · fallback `top(sweep(0,360))` (exact).
- **Claims:** `f1ExpiPi` — `expi(Math.PI)` → (−1, 0) · `f1ExpiHalfPi` — `expi(Math.PI/2)` → (0, 1) · `f1LimitMatches` — `eulerLimit(Math.PI, 1e5)` is within 1e−4 of `expi(Math.PI)` (test only).
- **Note:** α and β are dummy angles here (F only); the Ground track never uses them as angles, because α, β are amplitudes elsewhere (§7).

**`f1-euler:b6` [B]** (why a circle: velocity at right angles)
- **G:** "A second reason it is a circle. As $\varphi$ grows, the point $e^{i\varphi}$ moves at speed 1, always at right angles to its arrow from zero. Moving always sideways to the arrow keeps the distance fixed, like a stone whirled on a string."
- **F:** "$f(\varphi) = e^{i\varphi}$ solves $f' = if$ with $f(0) = 1$: the velocity is the position turned by 90°. Hence $d|f|^2/d\varphi = 2\operatorname{Re}(f^*f') = 0$ and $|f'| = 1$, so $f$ runs round $S^1$ at unit speed. Bergou (Eq. 1.2, p. 2) and the notes (Eq. 1.4, p. 12) use this $e^{i\varphi}$ for a qubit's azimuth."
- **Cap:** G "the velocity arrow always points along the circle" · F "$f' = if$: velocity ⟂ position"
- **Stage:** `cp{ z:{r:1, phiDeg:sweep(0,360)}, show:['velocity'] }`.
- **Refs:** Bergou §1.1, Eq. 1.2, p. 2; notes p. 12, Eq. 1.4.
- **Claims:** `f1Velocity` — the finite-difference velocity over the position is $i$ — `div(scale(sub(expi(0.7 + 1e-6), expi(0.7)), 1e6), expi(0.7))` → (0.0000, 1.0000) (test only).
- **Note:** the power-series proof, $\sum_k (i\varphi)^k/k!$, is 448's assigned homework (`l2-c-euler`, L2 p. 7). F1 proves Euler by the limit (D5) and the velocity argument instead, and keeps the series as the hints-only challenge `f1-e-series` (§4, §12 Q1).

**`f1-euler:b7` [C]** (why the limit is needed)
- **Q G:** "Try a small $n$. Where does $(1 + i\pi/2)^2$ land? Is it on the unit circle?"
- **Q F:** "Compute $(1 + i\pi/2)^2$ and its modulus. Why does the definition need $n \to \infty$?"
- **Reveal G:** "$(1 + i\pi/2)^2 = 1 - \pi^2/4 + i\pi \approx -1.467 + 3.142i$. Its size is 3.467, far off the circle. Each big step stretches as well as turns; only tiny steps make the stretching fade."
- **Reveal F:** "$(1 + i\pi/2)^2 = (1 - \pi^2/4) + i\pi$, with modulus $1 + \pi^2/4 \approx 3.467$. The stretch per step compounds to $(1 + \varphi^2/n^2)^{n/2} \approx e^{\varphi^2/2n}$, which tends to 1 only as $n \to \infty$."
- **Reveal cap:** G "two big steps overshoot; 64 small steps nearly close on −1" · F "modulus 3.467 at $n = 2$, 1.080 at $n = 64$"
- **Stage:** question `cp{ euler:{rate:'imag', phiDeg:180, n:2} }`; reveal `cp{ euler:{rate:'imag', phiDeg:180, n:sweep(2,64)} }`.
- **Claims:** `f1Euler2` — `eulerLimit(Math.PI, 2)` → (−1.4674, 3.1416), `abs` 3.4674.

### Unit `f1-phase` — Phases you can and cannot see

**`f1-phase:b1` [L]** (phasors)
- **G:** "A [[qc-phasor|phasor]] is a complex number drawn as an arrow; its angle is called its [[qc-phase|phase]]. Waves use them: the size says how strong, the phase says where the wave is in its cycle. To combine two waves, add their arrows tip to tail."
- **F:** "A phasor is a complex amplitude $A = |A|e^{i\varphi}$. Superposed contributions add as complex numbers, and a detected intensity is $|\sum_k A_k|^2$, not $\sum_k |A_k|^2$."
- **Cap:** G "two arrows of size 1 at 0° and 60°, tip to tail: size 1.732" · F "$1 + e^{i\pi/3} = 1.5 + 0.866i$"
- **Stage:** `cp{ chain:{phasesDeg:[0, 60]} }`.
- **Claims:** `f1Phasor60` — `phasorSum([0, Math.PI/3])` → (1.5, 0.8660), `abs` 1.7321.

**`f1-phase:b2` [L]** (interference; D6)
- **G:** "Add two arrows of size 1 whose angles differ by $\varphi$: $1 + e^{i\varphi}$. Its size squared is $2 + 2\cos\varphi$. At $\varphi = 0$ that is 4, with the arrows lined up; at $\varphi = \pi$ it is 0, and they cancel."
- **F:** "$|1 + e^{i\varphi}|^2 = (1 + e^{i\varphi})(1 + e^{-i\varphi}) = 2 + 2\cos\varphi = 4\cos^2(\varphi/2)$: constructive [[qc-interference|interference]] at $\varphi = 0$, destructive at $\varphi = \pi$."
- **Cap:** G "turn the second arrow from 0 to 180°: the sum shrinks from 2 to 0" · F "$|1 + e^{i\varphi}|^2$ = 4, 3, 2, 1, 0 at 0°, 60°, 90°, 120°, 180°"
- **Stage:** `cp{ chain:{phasesDeg:[0, sweep(0,180)]} }`.
- **Derivation:** D6 (§2).
- **Claims:** `f1Interf` — `abs2(phasorSum([0, φ]))` for φ = 0°, 60°, 90°, 120°, 180° → 4, 3, 2, 1, 0.

**`f1-phase:b3` [B]** (Bergou's interferometer)
- **G:** "Bergou sends one photon along two paths and joins them again. One exit collects the number $\tfrac12(e^{i\varphi_0} + e^{i\varphi_1})$, where $\varphi_0$ and $\varphi_1$ are the phases picked up on the two paths. The chance the photon leaves there is that number's size squared."
- **F:** "In Bergou's Mach–Zehnder interferometer (§1.5, Eq. 1.18, p. 8) one output amplitude is $\tfrac12(e^{i\varphi_0} + e^{i\varphi_1})$, so $P = \tfrac12[1 + \cos(\varphi_1 - \varphi_0)]$. Only the phase difference matters: equal phases give 1, a difference of $\pi$ gives 0. Chapter Q5 builds the device."
- **Cap:** G/F "$\varphi_0 = 0$, $\varphi_1 = 60°$: probability 0.75 at this exit"
- **Stage:** `cp{ chain:{phasesDeg:[0, 60], sizes:[0.5, 0.5]} }`.
- **Refs:** Bergou §1.5, pp. 7–8 (phase shifter, beam splitter, Eq. 1.18, Fig. 1.7).
- **Claims:** `f1Mz60` — `abs2(phasorSum([0, Math.PI/3], [0.5, 0.5]))` → 0.75 · `f1MzEqual` — `abs2(phasorSum([0, 0], [0.5, 0.5]))` → 1 · `f1MzPi` — `abs2(phasorSum([0, Math.PI], [0.5, 0.5]))` → 0.
- **Note:** F1 names no output port. Which port carries which amplitude depends on Fig. 1.7's mirrors (map erratum B1), and Q5 owns that.

**`f1-phase:b4` [L]** (global phase)
- **G:** "Turn every arrow by the same angle $\gamma$ (gamma). The whole picture turns, but no size changes and no angle between arrows changes. So a common turn, a [[qc-global-phase|global phase]], can never be detected."
- **F:** "For every γ, $|\sum_k e^{i\gamma}A_k|^2 = |\sum_k A_k|^2$: a global phase factor $e^{i\gamma}$ leaves every intensity and probability unchanged. Quantum states are therefore [[qc-ray|rays]], vectors defined only up to such a factor."
- **Cap:** G "both arrows turn together: the exit probability stays 0.75" · F "γ from 0 to $2\pi$: $P = 0.75$ throughout"
- **Stage:** `cp{ chain:{phasesDeg:[sweep(0,360), sweep(60,420)], sizes:[0.5, 0.5]} }`.
- **Claims:** `f1Global` — `abs2(phasorSum([γ, γ + Math.PI/3], [0.5, 0.5]))` → 0.75 for γ ∈ {0, 1.0, 2.5, 4.0}.

**`f1-phase:b5` [L]** (relative phase)
- **G:** "In quantum physics a state is a list of complex numbers called [[qc-amplitude|amplitudes]], and each chance is an amplitude's size squared. Take the amplitudes $1/\sqrt2$ and $e^{i\varphi}/\sqrt2$. The chances are ½ and ½ for every $\varphi$. Yet $\varphi$ changes how the two arrows add, so this [[qc-relative-phase|relative phase]] is real physics."
- **F:** "In $(|0\rangle + e^{i\varphi}|1\rangle)/\sqrt2$ the relative phase φ leaves both probabilities at ½ but fixes the state's longitude on the Bloch sphere <<l6-equator|Spin Lab 6.2 Relative phase sets the longitude>>. The notes' $e^{i\phi}$ in $|{+n}\rangle$ (Eq. 1.4, p. 12) is this phase."
- **Cap:** G "turn one arrow: the chances stay ½ and ½, the sum of the arrows shrinks" · F "$|\alpha|^2 = |\beta|^2 = \tfrac12$ for every φ; $|\alpha + \beta|^2/2$ = 1, 0.75, 0.5, 0 at 0°, 60°, 90°, 180°"
- **Stage:** `amp{ state:{thetaDeg:90, phiDeg:sweep(0,180)}, dials:true, sum:[0,1] }` · fallback `top(sweep(0,180))` (exact: the longitude is φ).
- **Claims:** `f1RelProbs` — `abs2(scale(expi(φ), Math.SQRT1_2))` → 0.5 for φ = 0°, 60°, 90°, 180° · `f1RelSum` — `abs2(phasorSum([0, φ], [0.5, 0.5]))` → 1, 0.75, 0.5, 0.
- **Guard (HW1 P1a):** the sum is phrased as two arrows adding, never as "$P(S_x = +)$ for $|{+n}\rangle$", and no F1 string gives a probability as a function of both θ and φ.

**`f1-phase:b6` [B]** (the notes' phase δ: a sign is a phase)
- **G:** "The notes build two states by choosing a phase $\delta$ (delta) for the second amplitude. $\delta = 0$ gives the amplitudes $(1/\sqrt2, 1/\sqrt2)$; $\delta = \pi$ gives $(1/\sqrt2, -1/\sqrt2)$. A minus sign is simply the phase $e^{i\pi} = -1$."
- **F:** "The notes (p. 7) write $|s_x = \pm\rangle = \alpha|{+z}\rangle + e^{i\delta_\pm}\beta|{-z}\rangle$ and fix $\delta_+ = 0$, $\delta_- = \pi$. That relative phase π makes $|{+x}\rangle \perp |{-x}\rangle$, whereas a global −1 changes nothing <<l7-full-turn|Spin Lab 7.2 A full turn flips the sign>>."
- **Cap:** G "a relative phase of $\pi$ makes a different state" · F "$\langle{+x}|{-x}\rangle = 0$, but $-|{+x}\rangle$ is the state $|{+x}\rangle$"
- **Stage:** `amp{ state:{thetaDeg:90, phiDeg:sweep(0,180)}, dials:true }` · fallback `top(sweep(0,180))`.
- **Refs:** notes p. 7 (the phase choice for the $x$ states).
- **Claims:** `f1XOrth` — `inner(KET['+x'], KET['-x'])` → 0 · `f1GlobalMinus` — `samePhysicalState(KET['+x'], vscale(KET['+x'], -1))` → true · reuses `f1ExpiPi`.

**`f1-phase:b7` [C]** (three arrows)
- **Q G:** "Three arrows of size 1 point at 0°, 120° and 240°. What is their sum?"
- **Q F:** "Evaluate $S = 1 + e^{2\pi i/3} + e^{4\pi i/3}$ without computing a cosine."
- **Reveal G:** "Zero. Placed tip to tail they close an equal-sided triangle and return to the start. Also, turning the set by 120° gives the same set, so the sum equals itself turned; only zero does that."
- **Reveal F:** "With $\omega = e^{2\pi i/3}$, $\omega S = \omega + \omega^2 + \omega^3 = S$ because $\omega^3 = 1$; since $\omega \ne 1$, $S = 0$. Every full set of $N$-th roots of unity sums to zero the same way <<f8-roots|F8.2 roots of unity>>."
- **Reveal cap:** G "tip to tail, the three arrows close a triangle" · F "$1 + \omega + \omega^2 = 0$"
- **Stage:** question `cp{ spokes:{phasesDeg:[0, 120, 240]} }`; reveal `cp{ chain:{phasesDeg:[0, 120, 240]} }`.
- **Claims:** `f1Three` — `abs(phasorSum([0, 2*Math.PI/3, 4*Math.PI/3]))` → 0 (to 1e−12).

**Beat count:** 7 + 7 + 7 + 7 + 7 = **35 beats**, 5 of them clues with reveals. Phase mix: 25 [L] · 5 [B] · 5 [C].

## 2. Derivations

Each is a `Beat.derivation` on the beat named. Ground steps start from 9th-grade algebra; each step's `why` is one
sentence. Both lists end on `result`, and Ground always has at least as many steps as Formal.

**D0 · `f1-plane:b5` · result $zz^* = |z|^2$**
- Ground:
  1. `(a + bi)(a - bi) = a\cdot a - a\cdot bi + bi\cdot a - bi\cdot bi` — Multiply each part of the first bracket by each part of the second.
  2. `= a^2 - abi + abi - b^2 i^2` — Tidy each product; $a$ and $b$ are ordinary numbers, so their order does not matter.
  3. `= a^2 - b^2 i^2` — The two middle terms are equal and opposite, so they cancel.
  4. `= a^2 + b^2` — Replace $i^2$ by $-1$, which turns $-b^2 i^2$ into $+b^2$.
  5. `= |z|^2` — By Pythagoras, $a^2 + b^2$ is the squared distance of $z$ from zero.
- Formal:
  1. `zz^* = (a + bi)(a - bi) = a^2 + b^2` — Distributivity and $i^2 = -1$.
  2. `= |z|^2 \ge 0` — Axler 4.2, 4.4.

**D1 · `f1-multiply:b1` · result $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$**
- Ground:
  1. `(a + bi)(c + di) = a(c + di) + bi(c + di)` — Multiply the second bracket by each part of the first.
  2. `= ac + adi + bci + bd\,i^2` — Multiply out again, keeping $i$ as a letter.
  3. `= ac + adi + bci - bd` — Replace $i^2$ by $-1$, the one new rule.
  4. `= (ac - bd) + (ad + bc)i` — Collect the parts without $i$ and the parts with $i$.
- Formal:
  1. `(a + bi)(c + di) = ac + (ad + bc)i + bd\,i^2` — Distributivity and commutativity in $\mathbb C$ (Axler 1.3).
  2. `= (ac - bd) + (ad + bc)i` — $i^2 = -1$ (Axler 1.1–1.2).

**D2 · `f1-multiply:b2` · result $i(a + bi) = -b + ai$: the same point turned 90° counterclockwise**
- Ground:
  1. `i(a + bi) = ai + b\,i^2` — Multiply both parts by $i$.
  2. `= -b + ai` — Replace $i^2$ by $-1$ and put the part without $i$ first.
  3. `(a, b) \mapsto (-b, a)` — Read off the new across and up parts.
  4. `\text{legs } a \text{ (across)}, b \text{ (up)} \;\to\; b \text{ (left)}, a \text{ (up)}` — Turn the right triangle from 0 to $(a, b)$ a quarter turn counterclockwise: the across leg now points up and the up leg points left.
  5. `|-b + ai|^2 = b^2 + a^2 = |a + bi|^2` — The turned triangle has the same legs, so the same size.
- Formal:
  1. `i(a + bi) = -b + ai` — D1 with $c = 0$, $d = 1$.
  2. `\begin{pmatrix}0&-1\\1&0\end{pmatrix}\begin{pmatrix}a\\b\end{pmatrix} = \begin{pmatrix}-b\\a\end{pmatrix}` — The rotation by 90°, orthogonal with determinant 1.

**D3 · `f1-multiply:b3` · result $|zw| = |z||w|$**
- Ground:
  1. `zw = (ac - bd) + (ad + bc)i` — The product rule D1, with $z = a + bi$ and $w = c + di$.
  2. `|zw|^2 = (ac - bd)^2 + (ad + bc)^2` — Pythagoras on the product's two parts.
  3. `= a^2c^2 - 2abcd + b^2d^2 + a^2d^2 + 2abcd + b^2c^2` — Square each bracket.
  4. `= a^2c^2 + a^2d^2 + b^2c^2 + b^2d^2` — The two cross terms cancel.
  5. `= (a^2 + b^2)(c^2 + d^2)` — Factor: multiplying out the right side gives the same four terms.
  6. `= |z|^2|w|^2` — Pythagoras for $z$ and for $w$.
  7. `|zw| = |z||w|` — Take square roots; sizes are never negative.
- Formal:
  1. `|zw|^2 = zw\,(zw)^* = zz^*\,ww^*` — D0 and $(zw)^* = z^*w^*$ (Axler 4.4).
  2. `= |z|^2|w|^2` — D0 again; take nonnegative roots.

**D4 · `f1-multiply:b5` · result $(\cos\varphi_z + i\sin\varphi_z)(\cos\varphi_w + i\sin\varphi_w) = \cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)$, so angles add**
- Ground (the angle-addition identities, once, by turned axes):
  1. `u = \cos\varphi_z + i\sin\varphi_z` — The point of size 1 at angle $\varphi_z$, from the right triangle with hypotenuse 1.
  2. `v = iu = -\sin\varphi_z + i\cos\varphi_z` — Turn $u$ a quarter turn (D2): $u$ and $v$ are perpendicular arrows of size 1, the axes turned through $\varphi_z$.
  3. `P = \cos\varphi_w\,u + \sin\varphi_w\,v` — In the turned axes, the point at angle $\varphi_w$ is $\cos\varphi_w$ along $u$ and $\sin\varphi_w$ along $v$, as $\cos\varphi_w + i\sin\varphi_w$ is in the old axes.
  4. `P = \cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)` — $P$ is at angle $\varphi_w$ past $u$, so at $\varphi_z + \varphi_w$ from the across axis, and its size is 1.
  5. `P = (\cos\varphi_z\cos\varphi_w - \sin\varphi_z\sin\varphi_w) + i(\sin\varphi_z\cos\varphi_w + \cos\varphi_z\sin\varphi_w)` — Put $u$ and $v$ from steps 1–2 into step 3 and collect parts.
  6. `\cos(\varphi_z + \varphi_w) = \cos\varphi_z\cos\varphi_w - \sin\varphi_z\sin\varphi_w,\ \ \sin(\varphi_z + \varphi_w) = \sin\varphi_z\cos\varphi_w + \cos\varphi_z\sin\varphi_w` — Compare the parts of steps 4 and 5: the angle-addition identities.
  7. `(\cos\varphi_z + i\sin\varphi_z)(\cos\varphi_w + i\sin\varphi_w) = \cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)` — Multiply out with D1; the parts are exactly those of step 6.
  8. `zw = |z||w|\,[\cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)]` — Put the sizes back with D3.
- Formal:
  1. `R(\varphi_z)R(\varphi_w) = R(\varphi_z + \varphi_w)` — Rotations compose by adding angles; this is the angle-addition identity.
  2. `(\cos\varphi_z + i\sin\varphi_z)(\cos\varphi_w + i\sin\varphi_w) = \cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)` — D1 reproduces the matrix product.
  3. `zw = |z||w|\,[\cos(\varphi_z + \varphi_w) + i\sin(\varphi_z + \varphi_w)]` — With D3 for the moduli.

**D5 · `f1-euler:b4` · result $e^{i\varphi} := \lim_{n\to\infty}(1 + i\varphi/n)^n = \cos\varphi + i\sin\varphi$**
- Ground:
  1. `w = 1 + i\varphi/n` — One small step: one across, $\varphi/n$ up.
  2. `|w|^2 = 1 + \varphi^2/n^2` — Pythagoras on the step.
  3. `\tan\delta = \varphi/n` — The step's angle δ has opposite $\varphi/n$ over adjacent 1.
  4. `\delta \approx \varphi/n` — For a tiny angle in radians the arc and the tangent are almost equal (b1).
  5. `\arg(w^n) = n\delta \approx \varphi` — $n$ steps add their angles (D4).
  6. `|w^n| = (1 + \varphi^2/n^2)^{n/2}` — $n$ steps multiply their sizes (D3).
  7. `(1 + \varphi^2/n^2)^{n/2}:\ 1.601\ (n = 10),\ 1.051\ (n = 100),\ 1.005\ (n = 1000)` — With $\varphi = \pi$: each step's stretch is tiny (about $\varphi^2/n^2$) and there are only $n$ steps, so the total stretch fades.
  8. `w^n \to \cos\varphi + i\sin\varphi` — Size tending to 1 and angle tending to φ: the unit-circle point at angle φ.
- Formal:
  1. `|1 + i\varphi/n|^n = \exp\!\big[\tfrac n2\ln(1 + \varphi^2/n^2)\big] \to 1` — Since $\tfrac n2 \ln(1 + \varphi^2/n^2) \le \varphi^2/2n \to 0$.
  2. `n\arctan(\varphi/n) \to \varphi` — $\arctan x = x + O(x^3)$.
  3. `e^{i\varphi} = \cos\varphi + i\sin\varphi` — Modulus and argument converge; this agrees with $f' = if$, $f(0) = 1$ (b6).
- Engine for step 7: `abs(eulerLimit(Math.PI, n))` → 1.6010, 1.0506, 1.0049.

**D6 · `f1-phase:b2` · result $|1 + e^{i\varphi}|^2 = 2 + 2\cos\varphi$**
- Ground:
  1. `1 + e^{i\varphi} = (1 + \cos\varphi) + i\sin\varphi` — Euler's formula, then add the across parts.
  2. `|1 + e^{i\varphi}|^2 = (1 + \cos\varphi)^2 + \sin^2\varphi` — Pythagoras on the two parts.
  3. `= 1 + 2\cos\varphi + \cos^2\varphi + \sin^2\varphi` — Square the bracket.
  4. `\cos^2\varphi + \sin^2\varphi = 1` — A point of the unit circle is at distance 1 from zero.
  5. `= 2 + 2\cos\varphi` — Substitute step 4 into step 3.
  6. `\varphi = 0 \Rightarrow 4,\ \ \varphi = \pi \Rightarrow 0` — Lined-up arrows give size 2; opposite arrows give 0.
- Formal:
  1. `|1 + e^{i\varphi}|^2 = (1 + e^{i\varphi})(1 + e^{-i\varphi})` — D0 with $(e^{i\varphi})^* = e^{-i\varphi}$.
  2. `= 2 + 2\cos\varphi = 4\cos^2(\varphi/2)` — $e^{i\varphi} + e^{-i\varphi} = 2\cos\varphi$.

## 3. Try-it widget per unit

Existing widgets (`app/src/widgets/`); prop names are the real ones.

| Unit | Widget spec | Why this one |
|---|---|---|
| `f1-number-line` | `{kind:'complex-plane', props:{mode:'powers-of-i'}}` | Press ×$i$ and watch 1 → $i$ → −1 → −$i$ → 1: the quarter turn of b4. |
| `f1-plane` | `{kind:'complex-plane', props:{mode:'conjugate', z:[3, 4]}}` | Drag $z$; the mirror $z^*$ and the product $z^*z$ follow (b4–b5). |
| `f1-multiply` | `{kind:'complex-plane', props:{mode:'multiply', z:[2, 1], w:[1, 3]}}` | The product of b1; drag $w$ onto the unit circle to see pure turning. |
| `f1-euler` | proposed `{kind:'complex-plane', props:{mode:'euler', phi:180, n:4}}` (new mode, §9.3) · until then `{kind:'phase-dial', props:{theta:0, rotations:false}}` | The limit of D5 with an $n$ slider. The fallback shows $e^{i\varphi}$ walking the circle. |
| `f1-phase` | `{kind:'phase-dial', props:{theta:0, rotations:false}}` · secondary `{kind:'amplitude-bars', props:{state:[90, 0], basis:'z'}}` | The dial turns one amplitude (relative phase) or both (global phase): the point moves only for the first. |

**Try this** (both tracks share the steps; F wording in brackets where it differs):
- `f1-number-line`: (1) Press ×$i$ twice: where does 1 land? (2) Press it twice more: why are you back? (3) How many presses give $i^{2026}$? [Find $2026 \bmod 4$.]
- `f1-plane`: (1) Drag $z$ to $3 + 4i$ and read $z^*z$. (2) Drag $z$ onto the across axis: where is $z^*$? (3) Drag it onto the up axis. [Check $z^* = -z$ on $i\mathbb R$.]
- `f1-multiply`: (1) Set $w = i$ and watch $z$ turn 90° with its size kept. (2) Set $w = 2$: a pure stretch. (3) Set $w = (1 + i)/\sqrt2$ and multiply eight times. [Read off $\arg$ each time.]
- `f1-euler`: (1) With $\varphi = 180°$, raise $n$ from 1 to 64 and watch the end point. (2) Set $\varphi = 90°$: where does it close? (3) Why does $n = 2$ overshoot? (clue b7).
- `f1-phase`: (1) Turn both amplitudes together: the point stays. (2) Turn only the second: the point moves. (3) Stop the relative phase at 180°. [That is $|{-x}\rangle$ up to a global phase.]

## 4. Challenges per unit

Format: tier · kind · id. Numeric answers are computed in `F1.values.ts` with the named engine call; tolerance 0.005
unless stated, 0 for exact integers. Hints climb nudge → key idea → setup. Walkthroughs are shared unless a Formal
version (**F**) is given. **Homework:** none of F1 is assigned in 709. One item is hints-only because it would solve
448's assigned proof (§12 Q1).

### `f1-number-line`
1. **warm-up · numeric · `f1-n-power`** — "What is $i^{2026}$? (It is a real number.)"
   - Answer: **−1** = `cpow(I, 2026).re`.
   - Hints: (1) Powers of $i$ repeat. (2) $i^4 = 1$, so only the remainder of 2026 ÷ 4 matters. (3) $2026 = 4 \times 506 + 2$.
   - Walkthrough: $i^{2026} = (i^4)^{506}\, i^2 = 1 \cdot (-1) = -1$. **F:** $i$ has order 4 in $U(1)$ and $2026 \equiv 2 \pmod 4$.
2. **core · choice · `f1-n-roots4`** — "Which pair of numbers both square to −4?"
   - Options: 2 and −2 · 4$i$ and −4$i$ · **2$i$ and −2$i$** ✓ · there is no such number.
   - Check: `mul(c(0,2), c(0,2))` → (−4, 0); `mul(c(0,-2), c(0,-2))` → (−4, 0).
   - Hints: (1) Real squares are never negative. (2) Split −4 as 4 × (−1). (3) Take a square root of each factor.
   - Walkthrough: $(2i)^2 = 4i^2 = -4$, and $(-2i)^2$ is the same. $(4i)^2 = -16$ and $2^2 = +4$.
3. **core · numeric · `f1-n-quadratic`** — "$x^2 + 9 = 0$. What is the imaginary part of the root above the across axis?"
   - Answer: **3** = `csqrt(c(-9)).im`.
   - Hints: (1) Move 9 across. (2) $x^2 = -9 = 9 \times (-1)$. (3) The roots are $\pm 3i$.
   - Walkthrough: $x = \pm 3i$; the one above the axis is $3i$, with imaginary part 3.
4. **stretch · numeric · `f1-n-sqrt-i`** — "Find a number whose square is $i$. What is its real part (take the positive one)?"
   - Answer: **0.7071** = `csqrt(I).re`.
   - Hints: (1) Write the unknown as $a + bi$. (2) Square it and match parts: $a^2 - b^2 = 0$ and $2ab = 1$. (3) So $a = b$ and $2a^2 = 1$.
   - Walkthrough: $a = b = 1/\sqrt2 = 0.707$. **F:** $z^2 = i = e^{i\pi/2}$ gives $z = \pm e^{i\pi/4}$; ℂ is algebraically closed (Axler 4.12).

### `f1-plane`
1. **warm-up · numeric · `f1-p-modulus`** — "What is $|-5 + 12i|$?"
   - Answer: **13** = `abs(c(-5,12))`.
   - Hints: (1) Size is distance from zero. (2) Use $\sqrt{a^2 + b^2}$. (3) $25 + 144 = 169$.
   - Walkthrough: $\sqrt{169} = 13$; the minus sign does not matter.
2. **core · numeric · `f1-p-sum-size`** — "What is the size of $(3 + 4i) + (1 - 2i)$?"
   - Answer: **4.4721** = `abs(add(c(3,4), c(1,-2)))`.
   - Hints: (1) Add first, then measure. (2) The sum is $4 + 2i$. (3) $\sqrt{16 + 4}$.
   - Walkthrough: $\sqrt{20} = 4.472$, which is less than $5 + 2.236$ (triangle inequality, b6).
3. **core · numeric · `f1-p-zzstar`** — "Compute $(2 - 3i)(2 + 3i)$."
   - Answer: **13** = `mul(c(2,-3), c(2,3)).re` (imaginary part 0).
   - Hints: (1) These two are mirrors of each other. (2) A number times its mirror is its size squared. (3) $4 + 9$.
   - Walkthrough: $4 + 6i - 6i - 9i^2 = 4 + 9 = 13$.
4. **stretch · choice · `f1-p-triangle-equal`** — "For which pair is $|z + w| = |z| + |w|$?"
   - Options: 1 and $i$ · 1 and −1 · **$2 + 2i$ and $1 + i$** ✓ · $i$ and 1.
   - Check: `abs(c(3,3))` → 4.2426 = `abs(c(2,2)) + abs(c(1,1))` → 2.8284 + 1.4142.
   - Hints: (1) When are two arrows tip to tail as long as their lengths added? (2) They must point the same way. (3) Compare the angles.
   - Walkthrough: $2 + 2i$ and $1 + i$ both point at 45°, so the lengths add. For 1 and $i$: $|1 + i| = 1.414 < 2$.

### `f1-multiply`
1. **warm-up · numeric · `f1-m-product`** — "What is the imaginary part of $(2 + i)(1 + 3i)$?"
   - Answer: **7** = `mul(c(2,1), c(1,3)).im`.
   - Hints: (1) Multiply out all four pairs. (2) Replace $i^2$ by −1. (3) The $i$ terms are $6i$ and $i$.
   - Walkthrough: $2 + 6i + i + 3i^2 = -1 + 7i$.
2. **core · numeric · `f1-m-angle`** — "What is the angle of $(1 + i)(1 + \sqrt3\,i)$, in degrees?"
   - Answer: **105** = `arg(mul(c(1,1), c(1, Math.sqrt(3))))` × 180/π.
   - Hints: (1) Angles add when you multiply. (2) $1 + i$ is at 45°. (3) $1 + \sqrt3\,i$ is at 60° ($\tan 60° = \sqrt3$).
   - Walkthrough: 45° + 60° = 105°. Bonus: the size is $\sqrt2 \times 2 = 2.828$ (`abs(...)` → 2.8284).
3. **core · numeric · `f1-m-power4`** — "What is $(1 + i)^4$?"
   - Answer: **−4** = `cpow(c(1,1), 4).re` (imaginary part 0).
   - Hints: (1) Use size and angle. (2) Size $\sqrt2$, angle 45°. (3) Four copies: size 4, angle 180°.
   - Walkthrough: $(\sqrt2)^4 = 4$ at 180° is −4. Check: $(1 + i)^2 = 2i$ and $(2i)^2 = -4$.
4. **stretch · numeric · `f1-m-inverse`** — "What is the real part of $1/(3 + 4i)$?"
   - Answer: **0.12** = `div(ONE, c(3,4)).re`.
   - Hints: (1) Multiply top and bottom by the mirror of the bottom. (2) The bottom becomes $|3 + 4i|^2 = 25$. (3) The top becomes $3 - 4i$.
   - Walkthrough: $(3 - 4i)/25 = 0.12 - 0.16i$. **F:** $z^{-1} = z^*/|z|^2$.
5. **stretch · order · `f1-m-proof-order`** — "Put the proof that sizes multiply in order."
   - Steps (correct order): "Write $zw = (ac - bd) + (ad + bc)i$." · "Square both parts and add." · "The cross terms $\mp 2abcd$ cancel." · "Factor into $(a^2 + b^2)(c^2 + d^2)$." · "Take square roots: $|zw| = |z||w|$."
   - Hints: (1) Start from the product rule. (2) Pythagoras on the product. (3) Look for terms that cancel.
   - Walkthrough: D3, Ground steps 1–7.

### `f1-euler`
1. **warm-up · numeric · `f1-e-radians`** — "How many radians is 60°?"
   - Answer: **1.0472** = `arg(c(1, Math.sqrt(3)))`.
   - Hints: (1) 180° is π radians. (2) 60° is a third of 180°. (3) π/3.
   - Walkthrough: $3.14159/3 = 1.047$.
2. **core · numeric · `f1-e-euler-pi`** — "What is $e^{i\pi} + 1$?"
   - Answer: **0** = `add(expi(Math.PI), ONE).re` (tolerance 1e−9).
   - Hints: (1) Where is angle π on the unit circle? (2) Halfway round. (3) $e^{i\pi} = -1$.
   - Walkthrough: $\cos\pi + i\sin\pi = -1$, so the sum is 0.
3. **core · numeric · `f1-e-cos75`** — "Use $e^{i75°} = e^{i45°}\,e^{i30°}$ to find $\cos 75°$."
   - Answer: **0.2588** = `mul(expi(Math.PI/4), expi(Math.PI/6)).re`.
   - Hints: (1) Multiply out the two unit numbers. (2) The real part is $\cos45°\cos30° - \sin45°\sin30°$. (3) $\tfrac{\sqrt2}{2}\cdot\tfrac{\sqrt3}{2} - \tfrac{\sqrt2}{2}\cdot\tfrac12$.
   - Walkthrough: $(\sqrt6 - \sqrt2)/4 = 0.2588$. This is D4 read backwards.
4. **stretch · numeric · `f1-e-limit-size`** — "What is the size of $(1 + i\pi/100)^{100}$?"
   - Answer: **1.0506** = `abs(eulerLimit(Math.PI, 100))`.
   - Hints: (1) Sizes multiply. (2) One step has size $\sqrt{1 + \pi^2/10^4}$. (3) Raise it to the 100th power.
   - Walkthrough: $(1 + 0.000987)^{50} = 1.0506$: still 5 % off the circle, which is why $n \to \infty$ is needed.
5. **stretch · numeric · `f1-e-series` · `assigned: '448 L2 p.7'`** (hints only; §12 Q1) — "Show $e^{i\varphi} = \cos\varphi + i\sin\varphi$ from the power series of $e^x$. Then check: what real number is $e^{i\pi}$?"
   - Answer: **−1** = `expi(Math.PI).re`.
   - Hints only: (1) Which infinite sum defines $e^x$? (2) Put $x = i\varphi$ and simplify each power of $i$. (3) Group the terms with no $i$ and those with one $i$, and compare with sums you know.
   - Walkthrough: withheld while 448 L2 p.7 is assigned.

### `f1-phase`
1. **warm-up · numeric · `f1-ph-cancel`** — "What is $|1 + e^{i\pi}|$?"
   - Answer: **0** = `abs(phasorSum([0, Math.PI]))` (tolerance 1e−9).
   - Hints: (1) Where does $e^{i\pi}$ point? (2) Opposite to 1. (3) Opposite arrows of equal size cancel.
   - Walkthrough: $1 + (-1) = 0$.
2. **core · numeric · `f1-ph-quarter`** — "What is $|1 + e^{i\pi/2}|^2$?"
   - Answer: **2** = `abs2(phasorSum([0, Math.PI/2]))`.
   - Hints: (1) Use $2 + 2\cos\varphi$. (2) $\cos 90° = 0$. (3) Or: $|1 + i|^2$.
   - Walkthrough: $2 + 0 = 2$; the arrows are at right angles, so Pythagoras gives $1 + 1$.
3. **core · numeric · `f1-ph-size-one`** — "Two arrows of size 1 add to an arrow of size 1. What is the angle between them, in degrees from 0 to 180?"
   - Answer: **120** = `arg(expi(2*Math.PI/3))` × 180/π, with the check `abs(phasorSum([0, 2*Math.PI/3]))` → 1.
   - Hints: (1) Size squared is $2 + 2\cos\varphi$. (2) Set it equal to 1. (3) $\cos\varphi = -\tfrac12$.
   - Walkthrough: φ = 120°; the three arrows 1, $e^{i120°}$ and the sum make an equal-sided triangle.
4. **core · choice · `f1-ph-detect`** — "A qubit's amplitudes are $1/\sqrt2$ and $1/\sqrt2$. Which change could any measurement ever detect?"
   - Options: multiply both by $i$ · multiply both by −1 · **multiply only the second by −1** ✓ · multiply both by $e^{0.3i}$.
   - Check: `samePhysicalState(KET['+x'], vscale(KET['+x'], I))` → true; `inner(KET['+x'], KET['-x'])` → 0.
   - Hints: (1) Which changes turn every arrow together? (2) A common turn is a global phase. (3) Only a relative phase changes interference.
   - Walkthrough: the first, second and fourth are global phases. The third makes the orthogonal state (b6). **F:** only the ray matters.
5. **stretch · numeric · `f1-ph-mz`** — "In Bergou's interferometer the phases are $\varphi_0 = 0$ and $\varphi_1 = 90°$. What is the probability at the exit that collects $\tfrac12(e^{i\varphi_0} + e^{i\varphi_1})$?"
   - Answer: **0.5** = `abs2(phasorSum([0, Math.PI/2], [0.5, 0.5]))`.
   - Hints: (1) Add the two arrows of size ½. (2) Their angle difference is 90°. (3) Use $\tfrac12[1 + \cos(\varphi_1 - \varphi_0)]$.
   - Walkthrough: $\tfrac12(1 + 0) = 0.5$. **F:** Eq. 1.18 depends only on $\varphi_1 - \varphi_0$ (Bergou p. 8).

## 5. Glossary terms new in F1

Ids start `qc-` (709 namespace). Ground gloss: one sentence, ≤ 25 words. `bridge` = a 448 unit whose glossary teaches
the same idea (the popover offers "Learn it in Spin Lab").

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-number-line` | number line | The line of ordinary numbers: negatives to the left of zero, positives to the right. | ℝ with its order, drawn as a line. | `f1-number-line:b1` | — |
| `qc-real-number` | real number | Any point on the number line: whole numbers, fractions, and numbers like √2. | An element of ℝ, the complete ordered field. | `f1-number-line:b2` | `l2-complex` |
| `qc-imaginary-unit` | imaginary unit $i$ | The number whose square is −1; multiplying by it turns a point a quarter turn about zero. | $i \in \mathbb C$ with $i^2 = -1$; multiplication by $i$ is rotation by π/2. | `f1-number-line:b4` | `l2-complex` |
| `qc-complex-plane` | complex plane | The flat picture of complex numbers: real part measured across, imaginary part measured up. | ℂ identified with ℝ² by $z \mapsto (\operatorname{Re} z, \operatorname{Im} z)$ (Argand plane). | `f1-number-line:b4` | `l2-complex` |
| `qc-qubit` | qubit | The quantum version of a bit: a two-level system described by two complex numbers. | A system with state space ℂ²: $\alpha\vert0\rangle + \beta\vert1\rangle$, $\vert\alpha\vert^2 + \vert\beta\vert^2 = 1$ (Bergou Eq. 1.1). | `f1-number-line:b6` | `l1-vectors` |
| `qc-complex-number` | complex number | A number $a + bi$ built from two ordinary numbers; it can be drawn as a point in a plane. | An element of $\mathbb C = \{a + bi : a, b \in \mathbb R\}$ (Axler 1.1). | `f1-plane:b1` | `l2-complex` |
| `qc-real-part` | real part | In $a + bi$, the ordinary number $a$: how far across the point sits. | $\operatorname{Re} z$ (Axler 4.1). | `f1-plane:b1` | `l2-complex` |
| `qc-imaginary-part` | imaginary part | In $a + bi$, the ordinary number $b$ that multiplies $i$: how far up the point sits. | $\operatorname{Im} z \in \mathbb R$ (Axler 4.1). | `f1-plane:b1` | `l2-complex` |
| `qc-modulus` | modulus (size) $\vert z\vert$ | The size of a complex number: its distance from zero, found by Pythagoras. | $\vert z\vert = \sqrt{zz^*} = \sqrt{(\operatorname{Re} z)^2 + (\operatorname{Im} z)^2}$. | `f1-plane:b3` | `l2-complex` |
| `qc-conjugate` | complex conjugate $z^*$ | The mirror image of a complex number in the across axis: $a + bi$ becomes $a - bi$. | $z^* = \operatorname{Re} z - i\operatorname{Im} z$; Axler writes $\bar z$. | `f1-plane:b4` | `l2-complex` |
| `qc-triangle-inequality` | triangle inequality | Two arrows placed tip to tail never reach farther than their two lengths added. | $\vert z + w\vert \le \vert z\vert + \vert w\vert$, with equality iff one is a nonnegative multiple of the other. | `f1-plane:b6` | — |
| `qc-field` | field | A number system where adding, subtracting, multiplying and dividing (except by zero) follow the usual rules. | A commutative ring with $1 \ne 0$ in which every nonzero element is invertible. | `f1-multiply:b1` | — |
| `qc-argument` | argument (angle) | The angle of a complex number, measured counterclockwise from the positive across axis. | $\arg z$, defined modulo $2\pi$ for $z \ne 0$; principal value in $(-\pi, \pi]$. | `f1-multiply:b4` | `l2-complex` |
| `qc-polar-form` | polar form | Naming a complex number by its size and its angle instead of its two parts. | $z = r(\cos\varphi + i\sin\varphi) = re^{i\varphi}$, $r = \vert z\vert$, $\varphi = \arg z$. | `f1-multiply:b4` | `l2-complex` |
| `qc-de-moivre` | de Moivre's rule | Turning $n$ times by an angle is the same as turning once by $n$ times that angle. | $(\cos\varphi + i\sin\varphi)^n = \cos n\varphi + i\sin n\varphi$, $n \in \mathbb Z$. | `f1-multiply:b6` | — |
| `qc-algebraically-closed` | algebraically closed | Every polynomial equation built from these numbers has a solution among them; the complex numbers are like that. | Every nonconstant polynomial over the field has a zero in it (Axler 4.12 for ℂ). | `f1-number-line:b7` | — |
| `qc-radian` | radian | An angle measured by the arc it cuts from a circle of radius 1; a full turn is $2\pi$. | The angle subtending unit arc length on $S^1$; $2\pi$ rad = 360°. | `f1-euler:b1` | — |
| `qc-unit-circle` | unit circle | All the complex numbers of size exactly 1. | $S^1 = U(1) = \{z : \vert z\vert = 1\}$. | `f1-euler:b2` | `l2-complex` |
| `qc-e` | Euler's number $e$ | The number, about 2.718, that growth split into ever more tiny steps settles on. | $e = \lim_{n\to\infty}(1 + 1/n)^n = \sum_{k\ge0} 1/k!$. | `f1-euler:b3` | — |
| `qc-euler-formula` | Euler's formula | $e^{i\varphi} = \cos\varphi + i\sin\varphi$: the point of the unit circle at angle φ. | The identity $e^{i\varphi} = \cos\varphi + i\sin\varphi$ for $\varphi \in \mathbb R$. | `f1-euler:b5` | `l2-complex` |
| `qc-phasor` | phasor | A complex number drawn as an arrow, used to add waves by placing arrows tip to tail. | A complex amplitude $A = \vert A\vert e^{i\varphi}$ representing an oscillation. | `f1-phase:b1` | — |
| `qc-phase` | phase | The angle of a complex number or of an amplitude. | $\arg A$ of a phasor or amplitude. | `f1-phase:b1` | `l2-complex` |
| `qc-interference` | interference | What happens when arrows add: lined-up arrows reinforce and opposite arrows cancel. | $\vert\sum A_k\vert^2 = \sum\vert A_k\vert^2 + \sum_{j\ne k} A_j^*A_k$: the cross terms. | `f1-phase:b2` | — |
| `qc-global-phase` | global phase | One common turn applied to every amplitude; nothing can ever detect it. | A factor $e^{i\gamma}$ multiplying the whole state vector. | `f1-phase:b4` | `l7-full-turn` |
| `qc-ray` | ray (physical state) | All the vectors that differ only by an overall number; together they are one physical state. | $\{\lambda\vert\psi\rangle : \lambda \in \mathbb C \setminus \{0\}\}$, a point of projective space. | `f1-phase:b4` | `l2-vector-space` |
| `qc-amplitude` | amplitude | One of the complex numbers describing a quantum state; its size squared is a chance. | A coefficient $\langle k\vert\psi\rangle$ of $\vert\psi\rangle$ in a basis; $P(k) = \vert\langle k\vert\psi\rangle\vert^2$. | `f1-phase:b5` | `l1-vectors` |
| `qc-relative-phase` | relative phase | The turn of one amplitude compared with another; it changes how the amplitudes interfere. | $\arg(\beta/\alpha)$ in $\alpha\vert0\rangle + \beta\vert1\rangle$: the Bloch longitude. | `f1-phase:b5` | `l6-equator` |

Closure: every technical word in these glosses has its own entry here or is 9th-grade (square, fraction, arc, angle).

## 6. Review card per unit (both tracks)

Every number is an F1 claim from §1 or §4.

### `f1-number-line`
- **G points:** (1) Each new kind of equation forced new numbers: negatives, fractions, then numbers like √2. (2) No ordinary number squares to −1. (3) Multiplying by −1 is a half turn, so $i$ is a quarter turn. (4) $i^2 = -1$ and $(-i)^2 = -1$: two square roots.
- **F points:** (1) ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ, each closing one more operation. (2) $\mathbb C = \{a + bi\}$ with $i^2 = -1$ (Axler 1.1); ×$i$ is a rotation by 90°. (3) ℂ is algebraically closed, so $\sqrt i = \pm(1 + i)/\sqrt2$ needs nothing new.
- **Equations:** $i^2 = -1,\quad x^2 + 1 = (x - i)(x + i),\quad \sqrt i = \pm\tfrac{1 + i}{\sqrt2}$
- **Trap (both):** "$\sqrt{-4} = -2$". A real square is never negative: $(-2)^2 = +4$; the roots are $\pm 2i$.

### `f1-plane`
- **G points:** (1) $z = a + bi$ is the point $a$ across, $b$ up. (2) Add part by part: arrows tip to tail. (3) Size $|z| = \sqrt{a^2 + b^2}$; $|3 + 4i| = 5$. (4) The mirror $z^* = a - bi$, and $zz^* = |z|^2 = 25$.
- **F points:** (1) ℂ ≅ ℝ² as a real vector space. (2) Conjugation is reflection in ℝ; $(zw)^* = z^*w^*$. (3) $|z + w| \le |z| + |w|$.
- **Equations:** $|z| = \sqrt{a^2 + b^2},\quad z^* = a - bi,\quad zz^* = |z|^2$
- **Trap:** $|z|^2$ is $zz^*$, not $z^2$: for $z = 1 + i$, $zz^* = 2$ but $z^2 = 2i$ (`mul(conj(c(1,1)), c(1,1))` → 2; `mul(c(1,1), c(1,1))` → (0, 2)).

### `f1-multiply`
- **G points:** (1) Multiply like brackets, then use $i^2 = -1$. (2) ×$i$ turns a point 90° and keeps its size. (3) Sizes multiply: $2.236 \times 3.162 = 7.071$. (4) Angles add: 26.6° + 71.6° = 98.1°. (5) Dividing divides sizes and subtracts angles.
- **F points:** (1) $zw = |z||w|[\cos(\arg z + \arg w) + i\sin(\arg z + \arg w)]$. (2) De Moivre: $(\cos\varphi + i\sin\varphi)^n = \cos n\varphi + i\sin n\varphi$. (3) $z^{-1} = z^*/|z|^2$.
- **Equations:** $(a + bi)(c + di) = (ac - bd) + (ad + bc)i,\quad |zw| = |z||w|,\quad \arg(zw) = \arg z + \arg w$
- **Trap:** adding sizes when multiplying. $|(2 + i)(1 + 3i)| = 7.071$, not $2.236 + 3.162 = 5.398$.

### `f1-euler`
- **G points:** (1) A radian measures an angle by arc length; 180° = π. (2) $(1 + 1/n)^n$ settles on $e \approx 2.718$. (3) $(1 + i\varphi/n)^n$ turns without stretching as $n$ grows. (4) $e^{i\varphi} = \cos\varphi + i\sin\varphi$; $e^{i\pi} = -1$.
- **F points:** (1) $e^{i\varphi} = \lim(1 + i\varphi/n)^n$; modulus $(1 + \varphi^2/n^2)^{n/2} \to 1$. (2) $f' = if$: unit speed round $S^1$. (3) $e^{i\alpha}e^{i\beta} = e^{i(\alpha + \beta)}$.
- **Equations:** $e^{i\varphi} = \cos\varphi + i\sin\varphi,\quad e^{i\pi} + 1 = 0,\quad z = re^{i\varphi}$
- **Trap:** putting degrees into $e^{i\varphi}$. $e^{180i}$ is not −1: it is $-0.598 - 0.801i$ (`expi(180)`); half a turn is $e^{i\pi}$.

### `f1-phase`
- **G points:** (1) Arrows add tip to tail; the result depends on the angle between them. (2) $|1 + e^{i\varphi}|^2 = 2 + 2\cos\varphi$: 4 lined up, 0 opposite. (3) A common turn of all arrows changes nothing measurable. (4) A turn of one amplitude, a relative phase, changes interference.
- **F points:** (1) Intensities are $|\sum A_k|^2$. (2) Global phase: states are rays. (3) Relative phase = Bloch longitude; δ = π separates $|{\pm x}\rangle$.
- **Equations:** $|1 + e^{i\varphi}|^2 = 4\cos^2\tfrac{\varphi}{2},\quad P_{\text{MZ}} = \tfrac12[1 + \cos(\varphi_1 - \varphi_0)],\quad e^{i\gamma}|\psi\rangle \sim |\psi\rangle$
- **Trap:** calling a global phase "a phase you can measure later". Turning every arrow together leaves every sum's size, so every probability, unchanged (`f1Global` → 0.75 for all γ).

## 7. Symbol-before-use tables

Reading order: units in order; inside a unit, beats (L → B → C, reveals in place), then Try it, review, challenges.
Abbreviations nl, pl, mu, eu, ph for the five units. Status: OK · **FLAG** (clash or early use) · gloss.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $x$ | nl:b1 | nl:b1 ("stand for an unknown number") | OK | Used only as the unknown. D2 uses $a + bi$, not $x + iy$, so $x$ never means a coordinate. |
| $x^2$, $\sqrt{\ }$ | nl:b2 | nl:b2 | OK | School maths; $x^2$ defined inline. |
| $i$ | nl:b4 | nl:b4 | OK | Tag `qc-imaginary-unit`. |
| $\alpha, \beta$ | nl:b6 | nl:b6 ("alpha and beta") | **FLAG** (resolved) | Amplitudes only. D4's angles are written $\varphi_z, \varphi_w$ for that reason. |
| $a, b$ | pl:b1 | pl:b1 | OK | Real and imaginary parts; D1 adds $c, d$ for the second number. |
| $z$, $w$ | pl:b1, pl:b6 | pl:b1; pl:b6 ("our pair") | OK | $w$ is always a second complex number. |
| $\vert z\vert$ | pl:b3 | pl:b3 | OK | — |
| $z^*$ | pl:b4 | pl:b4 | OK | Axler's $\bar z$ appears only in F captions. |
| $\varphi$ | mu:b4 | mu:b4 ("the Greek letter phi") | OK | The same letter is the phase in ph and the Bloch longitude via bridges; always "an angle". |
| $\varphi_z, \varphi_w$ | mu:b5 derivation | D4 step 1 | OK | — |
| $\delta$ | D5 step 3; ph:b6 | D5 step 3 (step angle); ph:b6 ("delta") | **FLAG** (minor) | Two roles in two units. Keep: the D5 δ lives inside one derivation; ph:b6 re-introduces δ as the notes' phase. |
| $\pi$ | eu:b1 | eu:b1 | OK | Degrees are used everywhere before eu:b1 (nl:b3 says "half a turn", not π). |
| $e$ | eu:b3 | eu:b3 | OK | Tag `qc-e`. |
| $n$ | eu:b3 | eu:b3 ("$n$ tiny steps") | OK | — |
| $e^{i\varphi}$ | eu:b4 | eu:b4–b5 | OK | — |
| $\varphi_0, \varphi_1$ | ph:b3 | ph:b3 | OK | Bergou's letters. |
| $\gamma$ | ph:b4 | ph:b4 ("gamma") | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\mathbb N, \mathbb Z, \mathbb Q, \mathbb R$ | nl:b1 | nl:b1 (named in brackets) | OK | — |
| $\mathbb C$ | nl:b4 | nl:b4 | OK | — |
| $\vert0\rangle, \vert1\rangle$ | nl:b6 | nl:b6 ("basis states") | gloss | Full meaning in Q1; tag `qc-qubit`. |
| $\vert{+y}\rangle$ | nl:b6 | bridge target `l2-plus-y` | **FLAG** (forward) | The bridge carries it; keep the column in the caption. |
| $\operatorname{Re}, \operatorname{Im}$ | pl:b1 | pl:b1 | OK | — |
| $\bar z$ | pl:b4 cap | pl:b4 Rosetta | OK | Only in the Rosetta caption. |
| $\arg$ | mu:b4 | mu:b4 | OK | Principal value stated. |
| $S^1$, $U(1)$ | eu:b2 | eu:b2 | OK | — |
| $f, f'$ | eu:b6 | eu:b6 | OK | — |
| $\alpha, \beta$ as angles | eu:b5 | eu:b5 (dummy angles) | **FLAG** | Formal-only; stated as dummies. The Ground track never uses them as angles. |
| $\omega$ | ph:b7 reveal | ph:b7 | OK | — |
| $\vert s_x = \pm\rangle$, $\delta_\pm$ | ph:b6 | ph:b6 (quoting notes p. 7) | OK | — |
| $\vert{\pm x}\rangle$, $\vert{\pm z}\rangle$ | ph:b6 | notes p. 7 via the beat; bridge `l7-full-turn` | gloss | — |
| $A, A_k$ | ph:b1 | ph:b1 | OK | — |

**Counts:** 2 Ground FLAGs (both resolved by renaming or scoping) and 2 Formal FLAGs (a forward ket carried by its bridge;
dummy angles).

## 8. Errata

**No `Correction` in F1.** Every statement used from Axler 1A and 4.1–4.4, Bergou Eqs. 1.1, 1.2 and 1.18, and notes
pp. 7 and 12 was re-checked (§ Evidence) and holds. Items for the record:

| # | Where | Finding | Action |
|---|---|---|---|
| F1-E1 | Map F1 "Src" | "Axler 1A pp. 2–5": complex numbers occupy pp. 2–4 (1.1–1.5); p. 5 is lists. "Ch. 4 p. 124 (factorization over ℂ)": the fundamental theorem is 4.12 on p. 125, the factorization 4.13 on p. 126. | Cite as above (this plan does). |
| F1-E2 | Bergou Eq. 1.18, p. 8 | Correct only with Fig. 1.7's mirror port swap (map B1). | F1 uses only the amplitude $\tfrac12(e^{i\varphi_0} + e^{i\varphi_1})$ and names no port; Q5 carries the Correction. |
| F1-E3 | Notation | Axler $\bar z$ vs physics $z^*$; Axler's "absolute value" vs modulus; notes $\phi$ vs φ; engine `arg` principal value. | Rosetta caption in `f1-plane:b4`. |
| F1-E4 | Notes p. 7 | "We take $\vert\beta\vert = \vert\alpha\vert$ because … symmetry": fine as motivation; the phase choice δ₊ = 0, δ₋ = π is a convention. | `f1-phase:b6` calls it a choice. |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine (all numbers above already come from existing functions)
Existing and sufficient: `complex.ts` (incl. `csqrt`, `cpow`), `qc/complexExtra.ts` (`eulerLimit`, `eulerPath`,
`phasorSum`, `phasorPath`), `spin.ts` (`KET`, `samePhysicalState`), `linalg.ts` (`inner`, `vscale`).

| # | Function | Formula | Used by | numpy twin |
|---|---|---|---|---|
| G1 | `cexpSeries(z: C, K: number): C` in `qc/complexExtra.ts` | $\sum_{k<K} z^k/k!$ | `f1-e-series` check; an optional Formal caption ("20 terms at $i\pi$ give −1.0000") | `sum((1j*pi)**k/factorial(k) for k in range(K))`: K = 10 → −0.9760 + 0.0069i; K = 20 → −1.0000 |
| G2 | `rootsOfUnity(N: number): C[]` in `qc/complexExtra.ts` (move to `qft` later) | $e^{2\pi ik/N}$, k = 0…N−1 | the Part F opener data (§10.1); `f1-phase:b7` generalised | `np.exp(2j*pi*np.arange(N)/N)`; sums ≈ 0 for N = 3…12 |

### 9.2 Stage contract
| # | Gap | Proposal | Fallback |
|---|---|---|---|
| S1 | No `complex-plane` kind (the map's rank-9 kind; F1, F8, Q16). | New SVG kind (doubles as the print figure), state below. PASSPORT: title "NUMBER PLANE ℂ", note "not a place · a picture of numbers", axes `Re`, `Im`. | `top(φ)` (448's L2 route): exact for size-1 numbers; sizes go in captions. 15 of 35 beats lose their picture of size (pl:b1–b7, mu:b1–b3, mu:b7, eu:b3–b4, eu:b7). |
| S2 | `amplitudes` (planned) needs three fields for F1 | `dials?: boolean` (a phase dial beside each bar), `sum?: [number, number]` (the two amplitudes tip to tail, resultant computed), `labels?: 'bits' \| 'spin'` | `top(φ)` (exact for the equator states used). |
| S3 | Fidelity items for `complex-plane` | exact `cplane-arithmetic` ("positions, sizes and angles are the numbers themselves"); schematic `cplane-not-space` ("a picture of numbers, not of the lab"); misleading `cplane-arrows-not-forces` ("an arrow here is a number, not a push"). | — |
| S4 | Anchors for `complex-plane` | `z, w, sum, product, conj, modulus, arg-z, arg-w, arg-product, unit-circle, real-axis, imag-axis, chain, resultant, polygon, velocity` | — |

Proposed state (content writes inputs only; `resolve.ts` computes sums, products, conjugates, powers, paths and every
readout with `complex.ts` / `complexExtra.ts`, rule (c)):
```ts
type CNum = { re: Scrub; im: Scrub } | { r: Scrub; phiDeg: Scrub }
interface ComplexPlaneState {
  kind: 'complex-plane'
  z?: CNum
  w?: CNum
  /** derived marks: z+w tip to tail, zw with both angle arcs, z*, drop lines, |z| label, arg arc, e^{iφ} velocity */
  show?: ('sum' | 'product' | 'conj' | 'parts' | 'modulus' | 'arg' | 'arc' | 'velocity')[]
  powers?: { of: CNum; upTo: Scrub }                  // 1, z, z², … (cpow)
  euler?: { rate: 'imag'; phiDeg: Scrub; n: Scrub } | { rate: 'real'; x: number; n: Scrub }  // eulerPath / (1 + x/n)^k
  chain?: { phasesDeg: Scrub[]; sizes?: number[] }    // phasorPath and its resultant
  spokes?: { phasesDeg: Scrub[]; sizes?: number[] }   // arrows from 0, not chained
  circle?: boolean                                    // unit circle, default true
  line?: boolean                                      // number-line mode: only the real axis
  trail?: boolean
  shot?: 'C-FLAT'
}
```
Validation: `n` integer 1–1000; at most 12 chain arrows; `line:true` forbids a nonzero `im`.

### 9.3 Widget gaps
- `complex-plane` widget: a mode `'euler'` (sliders φ and n, draws `eulerPath`) and a mode `'phasor'` (two to three
  arrows, draggable phases, resultant). Both reuse the stage's engine calls.

## 10. Media

### 10.1 Blender opener, Part F (300 K top flange, shared with Part I)
"The ring and the helix": the $N$-th roots of unity for N = 3 … 12 (`rootsOfUnity`, G2) appear as rings of beads; the
ring for N = 12 lifts into the helix $(\cos\varphi, \sin\varphi, \varphi/2\pi)$ sampled from `expi` over two turns, so
the circle becomes a spiral staircase of turns. Data from `pipeline/blender/gen_opener_data.ts` (new key `qc709.partF`).
The film states nothing; its captions (course pack) carry claims: "12 points $e^{2\pi ik/12}$" (`rootsOfUnity(12)`
length 12, `abs(phasorSum(...))` → 0) and "$e^{i\varphi}$ climbs one level per turn".

### 10.2 Motion Canvas films (each drawn number named from the engine; the manifest lists them for `films.test.ts`)
**`qc-f1-quarter-turn` "Multiplying by $i$ is a quarter turn"** (opener of `f1-multiply`, ~20 s)
1. Number line: 2 swings to −2 through a half circle (`mul(c(-1), c(2))` → −2).
2. Plane: $z_0 = 3 + 4i$, label "|z| = 5" (`abs`), angle 53.13° (`arg`).
3. ×$i$ four times: $-4 + 3i$ (143.13°), $-3 - 4i$ (−126.87°), $4 - 3i$ (−36.87°), back to $3 + 4i$; the size label stays 5 (`mul(I, z)`, `abs`, `arg`).
4. Two quarter turns overlaid on the half turn of frame 1: $i \cdot i = -1$ (`mul(I, I)`).
Manifest: `f1FilmZ0..Z4`, `f1FilmAbs`, `f1FilmArg0..3`, `f1ISquared`.

**`qc-f1-euler-limit` "$(1 + i\varphi/n)^n$ winds onto the circle"** (opener of `f1-euler`, ~25 s)
1. φ = π. Polygons `eulerPath(π, n)` for n = 1, 2, 4, 8, 16, 64, 1000; the end-point label shows `abs(eulerLimit(π, n))` = 3.297, 3.467, 2.614, 1.775, 1.353, 1.080, 1.005.
2. The last frame lands on −1 (`expi(Math.PI)`); caption "$e^{i\pi} = -1$".
3. Replay with φ = π/2: n = 4, 64, 1000 give 1.332, 1.019, 1.001, ending on $i$.
Manifest: `f1FilmEuler[n]`, `f1FilmEulerHalf[n]`, `f1ExpiPi`, `f1ExpiHalfPi`.

**`qc-f1-interference` (optional) "Two arrows, one sum"** (a `f1-phase:b2` insert, ~12 s): `phasorPath([0, φ])` as φ
sweeps 0 → 180°, with the readout `abs2(phasorSum([0, φ]))` passing 4, 3, 2, 1, 0 at 0°, 60°, 90°, 120°, 180°.

### 10.3 Higgsfield decor (atmosphere only; no text, no numbers, no diagram; user approves credits)
- Part F plate: a sunlit brass optics bench, dust drifting in a light shaft (the map's shot).
- F1 moment (behind the chapter card): a slow, defocused turn of light across a polished brass ring on navy cloth. It
  must not read as a clock or a plotted circle, so no ticks and no labels.

## 11. Hooks

### 11.1 Concept-map stations (`qc709/concepts.ts`, `QcConcept`)
| id | label | chapter · unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-imaginary-unit` | The number $i$: a quarter turn | F1 · `f1-number-line` | — | twin of `complex-numbers` |
| `qc-complex-plane` | Complex numbers as points: sum, size, mirror | F1 · `f1-plane` | `qc-imaginary-unit` | twin of `complex-numbers` |
| `qc-complex-multiply` | Multiplying: sizes multiply, angles add | F1 · `f1-multiply` | `qc-complex-plane` | twin of `complex-numbers` |
| `qc-euler` | $e^{i\varphi}$ and the unit circle | F1 · `f1-euler` | `qc-complex-multiply` | twin of `complex-numbers` |
| `qc-phase` | Global and relative phase, interference | F1 · `f1-phase` | `qc-euler` | links `phase-longitude` (L6), `full-turn` (L7) |

Cross-course edges need a field the 709 schema lacks: proposed `twins448?: string[]` (same concept, bridged both ways)
and `links448?: string[]` (related 448 concept). Neither is a prerequisite, so 709 stays standalone and
`concepts.test.ts` keeps its no-later-chapter rule.

### 11.2 Arcade: one level per unit (formats of `arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const F1x = (unit, label) => ({ lecture: 'F1', unit, label })`.
1. **`f1-number-line` · Spot the error · `qc-root-minus-4`** — "The square root of −4"
   - Steps: "We want $x$ with $x^2 = -4$." · "Try $x = -2$: a negative number squared stays negative." · "So $(-2)^2 = -4$ and $x = -2$." · "The other root is $+2$."
   - `wrong: 1`. Why: $(-2)^2 = +4$; the roots are $\pm 2i$ (`mul(c(0,2), c(0,2))` → −4). `trains: F1x('f1-number-line', 'F1.1 The gap that x² = −1 leaves')`.
2. **`f1-plane` · Spot the error · `qc-size-by-adding`** — "How far is 3 + 4i from zero?"
   - Steps: "The real part is 3." · "The imaginary part is 4." · "The size adds the parts: $3 + 4 = 7$." · "So $3 + 4i$ is 7 units from zero."
   - `wrong: 2`. Why: the parts are legs of a right triangle, so $|3 + 4i| = 5$ (`abs(c(3,4))`).
3. **`f1-multiply` · Spot the error · `qc-sizes-add`** — "The size of a product"
   - Steps: "$|2 + i| = 2.236$ and $|1 + 3i| = 3.162$." · "Multiplying adds the angles." · "It adds the sizes too: $2.236 + 3.162 = 5.398$." · "So $|(2 + i)(1 + 3i)| = 5.398$."
   - `wrong: 2`. Why: sizes multiply: 7.071 (`abs(mul(c(2,1), c(1,3)))`).
4. **`f1-euler` · Spot the error · `qc-degrees-in-euler`** — "Half a turn in Euler's formula"
   - Steps: "$e^{i\varphi} = \cos\varphi + i\sin\varphi$." · "Half a turn is 180, so put $\varphi = 180$." · "So $e^{180i} = -1$." · "Hence $e^{180i}$ and $e^{i\pi}$ are equal."
   - `wrong: 1`. Why: φ is in radians; half a turn is π. $e^{180i} = -0.598 - 0.801i$ (`expi(180)`).
5. **`f1-phase` · Spot the error · `qc-global-phase-seen`** — "A phase nobody can see"
   - Steps: "Amplitudes $1/\sqrt2$ and $1/\sqrt2$ give chances ½ and ½." · "Multiply both by $i$: $i/\sqrt2$ and $i/\sqrt2$." · "The chances are still ½ and ½." · "But the state has turned by 90°, so a later interference will reveal it."
   - `wrong: 3`. Why: a global phase turns every arrow together, so every sum keeps its size (`f1Global` → 0.75 for all γ).

Game entries: the five rounds join `ERROR_ROUNDS` with 709 ids, or a 709 `GAMES` list if the course pack keeps its own
(W to choose; ids start `qc-` either way).

## 12. Questions for the judge

**Q1. Euler's power series is 448 homework.** 448 marks "prove Euler's formula" as assigned (L2 p. 7; `l2-c-euler`,
hints only). The map's F1 Formal names "power-series Euler", which would hand over that proof one click away. This
plan proves Euler by the limit (D5) and by $f' = if$ (b6), and keeps the series as the hints-only `f1-e-series`.
*Ask:* keep that gate until the user says 448's HW for L2 is past, then release the series as a Formal derivation?

**Q2. Build `complex-plane` before F1?** With the fallback, 15 of 35 beats lose their picture of size, and the Bloch
passport ("STATE SPACE · Bloch sphere") appears in a chapter about numbers. The kind is small (SVG, one resolver case,
engine calls that already exist) and F8 and Q16 reuse it. *Recommendation:* build it with or right after `amplitudes`
and `circuit`, ahead of the map's build order.

**Q3. Phase tag for F chapters.** F chapters have no lecture. This plan uses the `lecture` phase for the core ramp
(sources Axler and Bergou) and `books` for a second source. *Ask:* accept, or add a `core` phase to `BeatPhase`
(an interface change)?

**Q4. Cross-course concept edges.** §11.1 proposes `twins448` and `links448` on `QcConcept`. *Ask:* accept the fields,
or keep 448 links in the bridges only?
