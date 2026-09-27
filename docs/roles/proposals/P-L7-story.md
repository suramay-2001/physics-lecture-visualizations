# P-L7 — Lecture 7 story plan: rotations, compatible measurements, uncertainty

Role P, proposal only. Nothing under `app/` is modified. Template: `P2-L1-story.md`.

**Sources read.** `sources/L7/text.md` (13 pages; contact sheets p01, p13 checked by eye: boxed equations and
two tables, no figures, p.13 ends half-empty after Reference B). Townsend §1.4 pp.15–17, Problem 1.3 p.26,
§2.2 pp.33–40, §3.1 pp.75–79, §3.2 pp.80–81, §3.5 pp.91–93 (printed page = PDF page − 16; the Example 1.2
page was also rendered from the PDF to confirm an erratum, §7). Susskind Lecture 5 §5.1–5.7 and Lecture 3 §3.8.
Zwiebach MIT 8.05 Notes 5 §2 and §7 are cited because L7 itself cites them; I did not re-read them (no local
copy), so no claim below rests on their wording.

**Evidence.** Every number in this file was computed with the app's engine: a scratch script imported
`app/src/physics/{spin,linalg,complex,operators,sg,belt}.ts` directly (bundled to the scratchpad, nothing in the
repo touched) and a second, independent numpy pass re-did the key values (commutator, products and bounds for
six states, projector-order joint probabilities, the 10°/350° ray angle, Townsend Example 1.2). All agree.

**Conventions below.**
- Beat id `<unit>:b<n>`; phase **[L]** lecture says · **[B]** books add · **[C]** clue (click to reveal). Order L → B → C.
- Stage fields are the real ones in `content/stage.ts`; shots and anchors are from `content/stageVocab.ts`.
- ħ = 1 in every engine call; the text appends ħ. `sd(A,ψ)` abbreviates `Math.sqrt(variance(A,ψ))`;
  `eq(φ)` abbreviates `ketFromBloch(Math.PI/2, φ)`; `comm(A,B)` = `msub(matmul(A,B), matmul(B,A))` until the
  engine has `commutator` (§8); `P(ψ)` abbreviates `projector(ψ)`.
- **Rosetta (applies to every L7 string).** The notes write θ for the angle *around the equator* and ϕ for an
  applied turn. The app's sphere uses θ = polar angle from +z and φ = azimuth from +x toward +y, and so do
  Townsend (Problem 1.3, p.26) and `ketFromBloch(θ, φ)`. L7 content therefore writes the **azimuth** as φ with a
  subscript for a *position* (φ₀ start, φ₁ and φ₂ two states), writes the **turn** as the bare argument of
  $R_z(\varphi)$, and keeps θ strictly polar. Since a turn by φ about z adds φ to the azimuth, the shared letter
  never lies: $R_z(\varphi)|\psi(\varphi_0)\rangle = e^{-i\varphi/2}|\psi(\varphi_0+\varphi)\rangle$. The notes' Δθ becomes Δφ. A one-line
  gloss states this at first use (`l7-two-angles:b1` caption). Rejected alternative: a new letter (α) for the turn,
  because α and β are already the amplitudes of $|\psi\rangle$ (L1, and L7's own Reference B).

## 0. Lecture map

Six units, in the order of the notes. The **belt-trick chapter-opener film** (`app/src/openers/openerCopy.ts`
`OPENERS.belt`, frames from `physics/belt.ts`) plays **between unit 1 and unit 2**, i.e. immediately before the
chapter card "02 / 06 · A full turn flips the sign", which is where §7.2 (Rz(2π) = −I, Rz(4π) = I) is taught.
Its three captions already carry the claims ($R_z(2\pi)|{+z}\rangle = -|{+z}\rangle$, $R_z(4\pi)|{+z}\rangle = +|{+z}\rangle$), and
`l7-full-turn` repeats them with engine claims, so the film only illustrates.

| # | id | Title (≤ 8 words) | Question (one sentence) | Notes pages | Books (§ + printed page) |
|---|---|---|---|---|---|
| 1 | `l7-two-angles` | Sphere angles are twice state angles | How does the angle between two Bloch arrows relate to the angle between the two states? | p.2 (§7.1); overview p.1 | Townsend Problem 1.3, p.26 (\|+n⟩ with θ polar, φ azimuth); §2.2, p.40 eq. (2.42) |
| — | opener | *Belt film: "Why spin ½ needs 720°"* | — | — | — |
| 2 | `l7-full-turn` | A full turn flips the sign | If a rotation brings the Bloch arrow all the way round, is the state vector back where it started? | p.3 (§7.2); p.4 (§7.3, one-beat recap, owned by L6 §6.3); p.13 (Ref. B = L6 p.13, recap) | Townsend §2.2, pp.36–40, eqs. (2.29)–(2.43), Example 2.2 |
| 3 | `l7-order` | Swapping the order of two measurements | When does measuring z then x predict something different from x then z? | p.5 (§7.4) | Susskind Lecture 5 §5.1.1–5.2 |
| 4 | `l7-compatible` | Compatible measurements share a basis and commute | What property of two observables guarantees that their order never matters? | pp.6–7 (§7.5–7.6) | Townsend §3.1, pp.75–79; §3.2, pp.80–81; Susskind §5.1.1, §5.2; Zwiebach Notes 5 §7 |
| 5 | `l7-spreads` | Spreads you can read off the sphere | How uncertain is each spin component in one prepared state? | p.8 (§7.7); p.13 (Ref. B p± line = L6 p.13, recap) | Townsend §1.4, pp.15–17, Example 1.2; Susskind §3.8, §5.4 |
| 6 | `l7-uncertainty` | A floor under the product of spreads | How small can the spreads of Sx and Sy be at the same time? | pp.9–11 (§7.8–7.9); p.12 (Ref. A) | Townsend §3.5, pp.91–93; Susskind §5.5–5.7; Zwiebach Notes 5 §2 |

**Carry-over.** §7.3 (the generator) is a verbatim carry-forward of L6 §6.3 (`sources/L6/text.md` has the same
section). Rule: content belongs to the lecture whose notes contain it first, so L6 owns it and L7 gets one recap
beat (`l7-full-turn:b4`) that links back to L6. L6 never takes the full turn (no 2π anywhere in its text), so
the sign, the belt film and the 720° story are L7's.

**Ownership (orchestrator rule: a concept is introduced once, by the first lecture whose notes teach it; later
lectures do a second pass).** What L7's notes teach first: the formal state-ray angle η and the "smaller
separation" rule; the full-turn sign $R_z(2\pi) = -I$ and 720°; compatibility, the common-eigenbasis theorem,
projector order and commutators (first taught here: L3 p.15 defers them, L6 p.1 defers the uncertainty relation,
and L5 p.14's handoff that places them in L6 is wrong, §7.4); the spin spreads read off $\vec r$; preparation
spread vs disturbance vs error of an average; the spin uncertainty bound, Robertson, Reference A. What L7
only revisits, with a link-back beat: Reference B (L6's last page verbatim → `l7-full-turn:b5`, `l7-spreads:b5`), the Bloch sphere and equatorial states (L6 → `l7-two-angles:b1`), the
half-angle (L1 → `l7-two-angles:b3`), $R_z$ and its generator (L6 → `l7-full-turn:b1`, `b4`), the update rule and
projectors (L3–L4 → `l7-order:b1`), ⟨A⟩ and the variance (L3 `l3-spread` → `l7-spreads:b1`). `l7-two-angles`
and `l7-order` are therefore second-pass units whose new material is the η formalism and the "randomness is not
order dependence" point respectively.

**Beat count.** 6 + 8 + 6 + 8 + 8 + 8 = **44 beats**, of which 11 are clues (each with a reveal) and 8 open with a
link back to an earlier lecture (two-angles:b1, b3; full-turn:b1, b4, b5; order:b1; spreads:b1, b5).

## 1. Story beats per unit

Format per beat: **Text** (≤ 3 sentences, rich TeX) · **Stage** (a real `StageLayout`) · **Caption** ·
**Claims** (statement → engine call → value; every number in text or caption has one) · for clues the
**Question** is the text, then **Reveal** (text, caption, stage, claims). Term links name an anchor from
`ANCHORS[kind]`. Stage literals use `sweep(a,b)` for `{from:a,to:b}` as in `L1.story.ts`.

### Unit `l7-two-angles` — Sphere angles are twice state angles

**`l7-two-angles:b1` [L]** (notes p.2, "opening recap") — **link-back beat to Lecture 6** (the Bloch sphere and the equatorial states are L6's; this beat recalls, it does not re-define)
- Text: "Recall from Lecture 6: the [[bloch-vector|Bloch arrow]] $\vec r = \tfrac{2}{\hbar}(\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle)$ lists the three spin averages. On the equator both $z$ outcomes have probability ½, and the [[relative-phase|relative phase]] $\varphi$ in $|\psi(\varphi)\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\varphi}|{-z}\rangle)$ sets the direction, $\vec r = (\cos\varphi, \sin\varphi, 0)$. Today's question: how far apart are two such states?"
- Link: "back to Lecture 6" chip → the L6 unit that teaches equatorial states (id from P-L6).
- Stage: `{kind:'bloch', state:{thetaDeg:90, phiDeg:sweep(0,360)}, measure:'z', trail:true, shot:'B-EQUATOR'}`
- Caption: "the notes call this angle θ; on our sphere it is the [[azimuth]] φ, and θ always means the angle from +z"
- Terms: `\vec r` → `point` · `\varphi` → `equator`.
- Claims: $\vec r$ at φ = 60° is (0.500, 0.866, 0) → `blochVector(eq(60°))` · $p(+z) = ½$ anywhere on the equator → `prob(KET['+z'], eq(φ))` = 0.5 for φ ∈ {0°, 60°, 200°}.

**`l7-two-angles:b2` [L]** (p.2, "two different angles")
- Text: "Take two equatorial states $|\psi_1\rangle = |\psi(\varphi_1)\rangle$ and $|\psi_2\rangle = |\psi(\varphi_2)\rangle$, and let $\Delta\varphi$ be the smaller angle between their arrows, from 0° to 180°. Their overlap is $\langle\psi_1|\psi_2\rangle = e^{i\Delta\varphi/2}\cos\tfrac{\Delta\varphi}{2}$. So the chance of finding one in the other is $\cos^2\tfrac{\Delta\varphi}{2}$."
- Stage: `{kind:'bloch', state:{thetaDeg:90, phiDeg:sweep(0,180)}, measure:'x', shot:'B-EQUATOR'}` — $|{+x}\rangle = |\psi(0)\rangle$, so the P(+x) readout *is* the overlap probability with the starting state.
- Caption: "a magnet along x asks 'is it |ψ(0)⟩?': P(+x) = cos²(Δφ/2)"
- Terms: `\Delta\varphi` → `equator` · `\cos^2` → `axis-n`.
- Claims: $\langle\psi(0)|\psi(120°)\rangle = \tfrac14 + \tfrac{\sqrt3}{4}i = e^{i60°}\cos 60°$ → `inner(eq(0), eq(120°))` (arg 60°, modulus 0.5) · $|\cdot|^2 = 0.25$ → `prob(KET['+x'], eq(120°))` = 0.25 · at 90°: 0.5 → `prob(KET['+x'], eq(90°))`.

**`l7-two-angles:b3` [L]** (p.2, boxed η = Δθ/2 and the table)
- Text: "Lecture 1 met this half-angle with real states. Now define the angle between two [[state-ray|state rays]], $\eta = \arccos|\langle\psi_1|\psi_2\rangle|$, which ignores every phase: it equals $\Delta\varphi/2$, half the angle between the Bloch arrows. Opposite arrows, like $|{+x}\rangle$ and $|{-x}\rangle$, are orthogonal; perpendicular ones, like $|{+x}\rangle$ and $|{+y}\rangle$, overlap with probability ½."
- Link: "back to Lecture 1" chip → `l1-vectors:b6` (state-space angles are half of lab angles).
- Stage: `{kind:'bloch', state:'+y', measure:'x', path:'geodesic', shot:'B-EQUATOR'}`
- Caption: "|+x⟩, |−x⟩: 180° on the sphere, η = 90° · |+x⟩, |+y⟩: 90° on the sphere, η = 45°"
- Terms: `\eta` → `axis-n` · `|{+y}\rangle` → `point`.
- Claims: η(+x, −x) = 90° → `Math.acos(abs(inner(KET['+x'], KET['-x'])))` · η(+x, +y) = 45° → same with `KET['+y']` · overlap probability ½ → `prob(KET['+x'], KET['+y'])` = 0.5.

**`l7-two-angles:b4` [B]**
- Text: "Townsend writes any state as $|{+\hat n}\rangle = \cos\tfrac{\theta}{2}|{+z}\rangle + e^{i\varphi}\sin\tfrac{\theta}{2}|{-z}\rangle$, with θ from +z and φ around from +x: the same letters as our sphere. With both angles free, the half-angle rule holds for any two pure states. For $|{+z}\rangle$ and a state at θ = 120°, the arrows are 120° apart and the probability is $\cos^2 60^\circ = \tfrac14$."
- Stage: `{kind:'bloch', state:{thetaDeg:120, phiDeg:0}, measure:'z', shot:'B-STD'}`
- Caption: "P(+z) = ¼ = cos²(120°/2)"
- Refs: Townsend Problem 1.3, p.26 (the formula for $|{+\hat n}\rangle$ in polar and azimuthal angles; cited for notation only) · Townsend §2.2, p.40, eq. (2.42) (a 90° turn about z takes $|{+x}\rangle$ to $|{+y}\rangle$, overlap ½).
- Claims: ¼ → `prob(KET['+z'], ketFromBloch(120°, 0))` = 0.25 = `probUpAlong(tiltXZ(120°), [0,0,1])`.

**`l7-two-angles:b5` [C]**
- Question: "The notes advise against picturing state vectors directly. Could a flat picture still show the rays of $|{+x}\rangle$ and $|{+y}\rangle$ at 45°?"
- Stage: `{layout:'split', top:{kind:'bloch', state:'+y', measure:'x', shot:'B-EQUATOR'}, bottom:{kind:'hilbert-plane', shot:'H-FLAT', psi:'+x', others:[{ket:'-x', role:'second'}], rightAngle:true}}`
- Reveal text: "Only for real coefficients. $|{+x}\rangle$ and $|{-x}\rangle$ are real, so the flat slice shows them at a right angle. $|{+y}\rangle$ needs the coefficient $i$ and has no arrow there; the sphere holds every state, at the price of doubling each angle."
- Reveal caption: "the real pair |+z⟩, |+x⟩ is also 90° apart on the sphere, and in the slice it sits at 45°"
- Reveal stage: `{layout:'split', top:{kind:'bloch', state:'+x', measure:'z', shot:'B-EQUATOR'}, bottom:{kind:'hilbert-plane', shot:'H-FLAT', psi:'+x', basis:'z', arc:true}}` (the arc runs from the $|{+z}\rangle$ axis to ψ; its θ/2 label is 45°, the polar-angle half of $|{+x}\rangle$: consistent with the Rosetta).
- Reveal claims: η(+z, +x) = 45° → `Math.acos(abs(inner(KET['+z'], KET['+x'])))` · probability ½ → `prob(KET['+z'], KET['+x'])` = 0.5.
- Fidelity: `plane-real-slice`, `bloch-double-angle`.

**`l7-two-angles:b6` [C]**
- Question: "Two equatorial states sit at $\varphi_1 = 10^\circ$ and $\varphi_2 = 350^\circ$. Subtracting gives 340°, so is $\eta = 170^\circ$?"
- Stage: `{kind:'bloch', state:{thetaDeg:90, phiDeg:350}, measure:{thetaDeg:90, phiDeg:10}, shot:'B-EQUATOR'}`
- Reveal text: "No. Go the short way round: the arrows are 20° apart, so $\eta = 10^\circ$ and $|\langle\psi_1|\psi_2\rangle| = \cos 10^\circ \approx 0.985$. A ray angle never exceeds 90°; with 340° you would need $\cos 170^\circ$, which is negative."
- Reveal caption: "probability cos² 10° ≈ 0.970"
- Reveal stage: none (picture stays).
- Reveal claims: η = 10° → `Math.acos(abs(inner(eq(10°), eq(350°))))` · 0.985 → `abs(inner(eq(10°), eq(350°)))` = 0.9848 · 0.970 → `prob(eq(10°), eq(350°))` = 0.9698 · cos 170° < 0 → `Math.cos(170°)` = −0.9848.

### Chapter opener — belt film (between units 1 and 2)
`OPENERS.belt` as built (captions and fidelity unchanged; `openerCopy.test.ts` already checks
$R_z(2\pi)|{+z}\rangle = -|{+z}\rangle$ and $R_z(4\pi)|{+z}\rangle = |{+z}\rangle$). The bridge sentence for the unit-1 fork is the
notes' own closing question of §7.1, paraphrased: "The sphere cannot see an overall phase. So after a full turn,
is the ket really the same?" (P-owned copy for W).

### Unit `l7-full-turn` — A full turn flips the sign

**`l7-full-turn:b1` [L]** (p.3, "instructor language" and the column-vector calculation)
- Text: "Lecture 6 built the turn about z: $R_z(\varphi) = \begin{pmatrix} e^{-i\varphi/2} & 0\\ 0 & e^{i\varphi/2}\end{pmatrix}$. On the equatorial state at azimuth $\varphi_0$ it gives $R_z(\varphi)|\psi(\varphi_0)\rangle = e^{-i\varphi/2}|\psi(\varphi_0+\varphi)\rangle$. The arrow moves on by φ, and a common phase $e^{-i\varphi/2}$ rides along that no probability can see."
- Stage: `{kind:'bloch', state:'+x', rotate:{axis:'z', angleDeg:sweep(0,90)}, trail:true, shot:'B-EQUATOR'}`
- Caption: "$R_z(90^\circ)|{+x}\rangle = e^{-i\pi/4}|{+y}\rangle$"
- Terms: `R_z(\varphi)` → `z` · `\varphi_0+\varphi` → `point`.
- Claims: the identity at φ₀ = 30°, φ = 100° → `apply(Rz(100°), eq(30°))` equals `eq(130°)` × `expi(−50°)` entrywise (|Δ| < 1e−12) · same physical state as $|{+y}\rangle$ → `samePhysicalState(apply(Rz(π/2), KET['+x']), KET['+y'])` · phase $e^{-i\pi/4}$ → `inner(KET['+y'], apply(Rz(π/2), KET['+x']))` = 0.7071 − 0.7071i.

**`l7-full-turn:b2` [L]** (p.3, "what happens after 360°?")
- Text: "Keep turning to φ = 360°. The arrow makes one full lap and lands exactly where it began. But each diagonal entry becomes $e^{\mp i\pi} = -1$, so $R_z(2\pi) = -I$ and the ket comes back as $-|\psi\rangle$."
- Stage: `{kind:'bloch', state:'+x', rotate:{axis:'z', angleDeg:sweep(0,360)}, trail:true, shot:'B-EQUATOR'}`
- Caption: "after one lap: same point, P(+x) = 1, but ⟨+x|R_z(2π)|+x⟩ = −1"
- Terms: `I` → gloss `identity` · `-|\psi\rangle` → `point`.
- Claims: $R_z(2\pi) = -I$ → `matEq(Rz(2π), mscale(identity(2), −1))` · −1 → `expectation(Rz(2π), KET['+x'])` = −1 (the value is real, so `expectation`'s real part is the whole answer) · same point → `blochVector(apply(Rz(2π), KET['+x']))` = (1, 0, 0) · P(+x) = 1 → `prob(KET['+x'], apply(Rz(2π), KET['+x']))`.

**`l7-full-turn:b3` [L]** (p.3, "a second full turn restores the original vector")
- Text: "The minus sign is a [[global-phase|global phase]]: the ray, the Bloch arrow and every probability are back. A second full turn removes it as well, $R_z(4\pi) = +I$. Only 720° returns the ket itself."
- Stage: `{kind:'hopf', fibers:'one', marked:{state:'+x', rotate:{axis:'z', angleDeg:sweep(0,720)}}, mini:true, shot:'HF-FIBER'}`
- Caption: "the bead is on the far side of its circle after 360° and home after 720°; the small sphere's point laps twice"
- Terms: `-|\psi\rangle` → `marker` · "Bloch arrow" → `mini-point`.
- Claims: $R_z(4\pi) = I$ → `matEq(Rz(4π), identity(2))` · +1 → `expectation(Rz(4π), KET['+x'])` = 1 · same ray after 360° → `samePhysicalState(KET['+x'], apply(Rz(2π), KET['+x']))`.
- Fidelity: `hopf-fiber-state`, `hopf-brightness`.

**`l7-full-turn:b4` [L]** (p.4, §7.3; **one-beat recap — L6 §6.3 owns this**)
- Text: "Recap of Lecture 6: $R_z(\varphi) = e^{-i\varphi S_z/\hbar}$, where the [[matrix-exponential|exponential of a matrix]] means its power series. For a tiny turn $d\varphi$, $R_z(d\varphi) \approx I - \tfrac{i}{\hbar}S_z\,d\varphi$. So $S_z$ [[generator|generates]] turns about z, and $R_z$ performs them."
- Stage: `{kind:'operator-space', op:{named:'Sz'}, eigen:true, gauge:false, shot:'O-STD'}`
- Caption: "the generator's arrow is the turning axis; its eigenstates |±z⟩ only pick up phases"
- Terms: `S_z` → `arrow-a` · "eigenstates" → `eigen-plus`.
- Refs: `{source:'lecture', where:'L6 §6.3 (L7 p.4 repeats it)', adds:'The full derivation; L7 only recalls it.'}` · Townsend §2.2, pp.36–37, eqs. (2.29)–(2.32) (builds the finite turn from many tiny ones).
- Claims: exponential form → `matEq(expm2(mscale(SZ, c(0, −1.234))), Rz(1.234))` · derivative at 0 → `mscale(msub(Rz(h), Rz(−h)), c(0, 1/(2h)))` equals `SZ` (h = 1e−6, tol 1e−8) · $|{+z}\rangle$ only gains a phase → `samePhysicalState(apply(Rz(1.234), KET['+z']), KET['+z'])`.

**`l7-full-turn:b5` [L]** (p.13, Reference B, outside the 75-minute plan) — **link-back beat to Lecture 6**: L7's Reference B is L6's last page, word for word, and L7 p.1 says it "carries over"
- Text: "Lecture 6's reference check, carried over: take any state $\begin{pmatrix}\alpha\\ \beta\end{pmatrix}$. The turn multiplies $\alpha$ by $e^{-i\varphi/2}$ and $\beta$ by $e^{i\varphi/2}$, so $|\alpha|^2$ and $|\beta|^2$ stay and $\alpha^*\beta$ turns by φ. Hence $(\langle S_x\rangle, \langle S_y\rangle)$ rotates like an ordinary arrow about z, and $\langle S_z\rangle$ does not change."
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:30}, rotate:{axis:'z', angleDeg:sweep(0,90)}, trail:true, shot:'B-STD'}`
- Caption: "$\vec r$: (0.750, 0.433, 0.500) → (−0.433, 0.750, 0.500)"
- Terms: `\alpha^*\beta` → `equator` · `\langle S_z\rangle` → `z`.
- Claims: start vector → `blochVector(ketFromBloch(60°, 30°))` = (0.750, 0.433, 0.500) · after the turn → `blochVector(apply(Rz(90°), ketFromBloch(60°,30°)))` = (−0.433, 0.750, 0.500) = `qrotate(axisAngle([0,0,1], 90°), r0)` (belt.ts: the SO(3) image of the same SU(2) turn).

**`l7-full-turn:b6` [B]**
- Text: "Townsend builds $R_z$ from many tiny turns and checks that 90° takes $|{+x}\rangle$ to $e^{-i\pi/4}|{+y}\rangle$. His Example 2.2 turns $|{+x}\rangle$ by 180° into $-i|{-x}\rangle$, which is the state $|{-x}\rangle$. He also flags the 360° minus sign and saves its experimental test for his Chapter 4."
- Stage: `{kind:'bloch', state:'+x', rotate:{axis:'z', angleDeg:180}, trail:true, shot:'B-EQUATOR'}`
- Caption: "$R_z(180^\circ)|{+x}\rangle = -i|{-x}\rangle$"
- Refs: Townsend §2.2, pp.36–40, eqs. (2.29), (2.32), (2.42), (2.43); Example 2.2, p.40.
- Claims: → `samePhysicalState(apply(Rz(π), KET['+x']), KET['-x'])` · phase −i → `inner(KET['-x'], apply(Rz(π), KET['+x']))` = −i · 90° case → `inner(KET['+y'], apply(Rz(π/2), KET['+x']))` = 0.7071 − 0.7071i.

**`l7-full-turn:b7` [C]** (p.3, "why does our equatorial formula instead give…")
- Question: "The formula $|\psi(\varphi_0)\rangle$ repeats every 360°: $|\psi(\varphi_0 + 360^\circ)\rangle = |\psi(\varphi_0)\rangle$ exactly. So why does a 360° turn give $-|\psi\rangle$?"
- Stage: `{kind:'bloch', state:'+x', shot:'B-EQUATOR'}`
- Reveal text: "The formula always makes the first entry real and positive, so it never shows an overall phase. The turn carries the extra factor $e^{-i\varphi/2}$, which is $-1$ at φ = 360°. Same ray and same point; only the phase bookkeeping differs."
- Reveal caption: "$e^{-i\pi} = -1$: a global phase, so the point does not move"
- Reveal stage: `{kind:'bloch', state:'+x', globalPhaseDeg:sweep(0,180), shot:'B-EQUATOR'}`
- Reveal claims: `eq(360°)` = (0.7071, 0.7071) = `eq(0)` (first entry real, positive) · `apply(Rz(2π), KET['+x'])` = (−0.7071, −0.7071) · `expi(−π)` = −1.

**`l7-full-turn:b8` [C]** (p.3, "state-ray angle versus accumulated rotation")
- Question: "After one full turn, is the angle between the starting and final rays $\eta = 360^\circ/2 = 180^\circ$?"
- Stage: `{kind:'bloch', state:'+x', rotate:{axis:'z', angleDeg:360}, trail:true, shot:'B-EQUATOR'}`
- Reveal text: "No. η compares where two rays end up, not how far you turned. Both ends are the same ray, so $\eta = \arccos|\langle\psi|(-\psi)\rangle| = 0$. The turn survives only as the sign, and that sign comes from the spin-½ matrix, not from the closed loop the arrow drew."
- Reveal caption: "same circle (same ray), opposite side of it (−|ψ⟩)"
- Reveal stage: `{kind:'hopf', fibers:'one', marked:{state:'+x', rotate:{axis:'z', angleDeg:360}}, mini:true, shot:'HF-FIBER'}`
- Reveal claims: η = 0 → `Math.acos(Math.min(1, abs(inner(KET['+x'], apply(Rz(2π), KET['+x'])))))` = 0.
- Note for the judge: the notes' last warning on p.3 (a closed path on the sphere does not by itself fix the phase) is carried by this reveal and by challenge `l7-ft-still` (§3), where $|{+z}\rangle$ keeps its point fixed and still flips sign.

### Unit `l7-order` — Swapping the order of two measurements

L1's `l1-logic` already ran z-first / x-first benches on $|{+z}\rangle$ for the "up OR right" claim. This unit
reuses that rig but asks the notes' question (what happens to the *z* prediction) and adds the update rule in
symbols, which L1 did not have.

**`l7-order:b1` [L]** (p.5, "outcome and conditional state") — **link-back beat to Lectures 3–4** (the update rule is L3's, the projector form L4's; the notes' own heading says "return to")
- Text: "Recall the update rule from Lectures 3 and 4, with $P_a$ the [[projector]] onto outcome $a$ of $A = \sum_a a\,P_a$. The outcome $a$ comes with probability $p(a) = \langle\psi|P_a|\psi\rangle$ and leaves the [[conditional-state|conditional state]] $P_a|\psi\rangle/\sqrt{p(a)}$. The new question: what does that update do to the *next* measurement?"
- Link: "back to Lecture 3" chip → the L3 update-rule unit; "Lecture 4" → the projector unit (ids from P-L3, P-L4).
- Stage: `{kind:'bloch-ball', point:'+z', measure:'x', update:'selective', shot:'B-STD'}` (the next beat's cut to $|{+x}\rangle$ is the selective update; only surface points are used in this unit).
- Caption: "p(+x) = ⟨+z|P₊ₓ|+z⟩ = ½; the kept atom is now |+x⟩ · lower-case p is a probability, capital $P_a$ a projector"
- Terms: `P_a` → `axis-n` · `P_a|\psi\rangle/\sqrt{p(a)}` → `point`.
- Claims: ½ → `expectation(projector(KET['+x']), KET['+z'])` = 0.5 · length of the unnormalized branch → `norm(apply(projector(KET['+x']), KET['+z']))` = 0.7071 · normalized branch is $|{+x}\rangle$ → `samePhysicalState(normalize(apply(projector(KET['+x']), KET['+z'])), KET['+x'])` · engine route → `measure(SX, KET['+z'], u).probs` = [0.5, 0.5].

**`l7-order:b2` [L]** (p.5, worked example, first order)
- Text: "Prepare $|{+z}\rangle$ and measure $S_z$ first. The result is certainly $+\hbar/2$, and the state stays $|{+z}\rangle$. Then $S_x$ gives $\pm\hbar/2$, half each."
- Stage: `{kind:'lab-r3', benches:[{id:'A', source:'+z', showPrep:true, devices:[{axis:'z', keep:'+'}, {axis:'x'}]}, {id:'B', source:'+z', showPrep:true, devices:[{axis:'x', keep:'+'}, {axis:'z'}], fires:false}], readouts:['blocked'], shot:'L-3Q'}` (no truth readouts, so `benchName` tags the benches "z → x" and "x → z", not L1's "z-first/x-first").
- Caption: "z → x: nothing is stopped at z; ½ and ½ at x"
- Terms: `S_z` → `magnet-1` · `\pm\hbar/2` → `spot-plus`.
- Claims: → `benchTheory({source:'+z', axes:['z','x'], keep:['+']})` = {blocked [0], plus 0.5, minus 0.5}.

**`l7-order:b3` [L]** (p.5, worked example, second order)
- Text: "Swap the order. $S_x$ first leaves $|{+x}\rangle$ or $|{-x}\rangle$, half each, and either way $S_z$ then splits 50/50: $p(-z) = \tfrac12\cdot\tfrac12 + \tfrac12\cdot\tfrac12 = \tfrac12$. The certain $z$ answer has become a coin toss."
- Stage: same benches, `B` now fires (`fires` omitted).
- Caption: "x → z keeps the +x branch here; the −x branch behaves the same way. Either way, half of the atoms that reach z land −z"
- Terms: `|{+x}\rangle` → `chip-1` · `p(-z)` → `spot-minus`.
- Claims: kept +x branch → `benchTheory({source:'+z', axes:['x','z'], keep:['+']})` = {blocked [0.5], plus 0.25, minus 0.25} · kept −x branch → same with `keep:['-']` = {blocked [0.5], plus 0.25, minus 0.25} · ½ overall → sum of the two `.minus` values = 0.5.

**`l7-order:b4` [L]** (p.5, "interpretation and checkpoint")
- Text: "Checkpoint: after the $x$ step, measure $S_z$ twice in a row. The second reading always repeats the first. The first $S_z$ measurement has prepared a $z$ eigenstate."
- Stage: `{kind:'lab-r3', benches:[{id:'main', source:'+z', showPrep:true, devices:[{axis:'x', keep:'+'}, {axis:'z', keep:'+'}, {axis:'z'}]}], readouts:['fractions'], shot:'L-WIDE'}`
- Caption: "¼ of the atoms get past both kept outputs, and every one of them lands + at the last z"
- Terms: "twice in a row" → `magnet-3` · "prepared" → `chip-2`.
- Claims: → `benchTheory({source:'+z', axes:['x','z','z'], keep:['+','+']})` = {blocked [0.5, 0.25], plus 0.25, minus 0}.

**`l7-order:b5` [B]**
- Text: "Susskind asks for a state that is an eigenvector of both observables at once. Measuring either one then gives a definite value and leaves the state alone, in any order. For spin components along two different, non-parallel axes, no such state exists."
- Stage: `{kind:'bloch-ball', point:'+z', measure:'z', shot:'B-STD'}`
- Caption: "along z, |+z⟩ is certain: p(+z) = 1; along x it is not: p(+x) = ½"
- Refs: Susskind Lecture 5, §5.1.1–5.2 (simultaneous eigenvectors; which spin components can be measured together).
- Claims: → `prob(KET['+z'], KET['+z'])` = 1 · → `prob(KET['+x'], KET['+z'])` = 0.5.

**`l7-order:b6` [C]** (p.5, "degeneracy and randomness" box)
- Question: "Randomness alone is not the problem: a $|{+x}\rangle$ beam through two $z$ magnets gives a random first reading, yet the order of the two magnets cannot matter. So what makes x-then-z differ from z-then-x?"
- Stage: `{kind:'lab-r3', benches:[{id:'main', source:'+x', showPrep:true, devices:[{axis:'z', keep:'+'}, {axis:'z'}]}], readouts:['fractions'], shot:'L-WIDE'}`
- Reveal text: "Whether the first measurement leaves the second one's states intact. A $z$ magnet leaves $|{\pm z}\rangle$ as they are, so a second $z$ reading cannot change. An $x$ magnet turns $|{+z}\rangle$ into $|{\pm x}\rangle$, which are not $z$ states, so the $z$ answer is lost."
- Reveal caption: "after x, the atom is |+x⟩: p(+z) = ½"
- Reveal stage: `{kind:'bloch-ball', point:'+x', measure:'z', shot:'B-STD'}`
- Claims (question picture): → `benchTheory({source:'+x', axes:['z','z'], keep:['+']})` = {blocked [0.5], plus 0.5, minus 0}. Reveal claims: → `prob(KET['+z'], KET['+x'])` = 0.5.

### Unit `l7-compatible` — Compatible measurements share a basis and commute

Rename for the app: the notes' common-eigenbasis label $|n\rangle$ (with $a_n, b_n, c_n$) becomes $|k\rangle$ (with
$a_k, b_k, c_k$), because $\hat n$ is the measurement axis everywhere else in the course (§6).

**`l7-compatible:b1` [L]** (p.6, "suppose…")
- Text: "Suppose one state is an eigenstate of both observables: $A|k\rangle = a_k|k\rangle$ and $B|k\rangle = b_k|k\rangle$. Then either order returns the pair $(a_k, b_k)$ and leaves $|k\rangle$ unchanged. That is a fact about this one state."
- Stage: `{kind:'operator-space', op:{named:'Sz'}, add:{a0:1, a:[0,0,2]}, eigen:true, shot:'O-STD'}` ($B = I + 4S_z$ in ħ = 1 units, eigenvalues 3 and −1; any $B$ built on the same eigenstates would do).
- Caption: "S_z and B = I + 4S_z: both arrows lie on the z axis, so both have eigenstates |±z⟩ (the third arrow is their sum)"
- Terms: `A` → `arrow-a` · `|k\rangle` → `eigen-plus`.
- Claims: B's spectrum → `eigenHermitian2(fromSpectrum([3,−1],[KET['+z'],KET['-z']])).values` = [3, −1] with vectors $|{\pm z}\rangle$ · `fromSpectrum(...)` equals `madd(identity(2), mscale(SZ, 4))`.
- Fidelity: `op-sum`, `op-length-not-size`.

**`l7-compatible:b2` [L]** (p.6, "what if there is a complete common eigenbasis?")
- Text: "If a whole basis is shared, $AB|k\rangle = a_kb_k|k\rangle = BA|k\rangle$ for every basis state, and hence for every state. So the [[commutator]] $[A,B] = AB - BA$ is the zero operator. For Hermitian matrices the converse holds too: $[A,B] = 0$ guarantees a shared eigenbasis."
- Stage: same as b1 with `gauge:true, shot:'O-GAUGE'`.
- Caption: "[S_z, B] = 0"
- Terms: `[A,B]` → `arrow-a`.
- Claims: → `matEq(comm(SZ, B), mscale(identity(2), 0))`.

**`l7-compatible:b3` [L]** (p.7, "connect back to actual measurements")
- Text: "Multiplying by $A$ is not measuring $A$. With $P_a$ projecting onto outcome $a$ of $A$ and $Q_b$ onto outcome $b$ of $B$, the two orders leave $Q_bP_a|\psi\rangle$ and $P_aQ_b|\psi\rangle$, whose squared lengths are the [[joint-probability|joint probabilities]]. Commuting observables have commuting projectors, so the two orders then agree."
- Stage: `{kind:'lab-r3', benches:[{id:'A', source:'+z', showPrep:true, devices:[{axis:'z', keep:'+'}, {axis:'x'}]}, {id:'B', source:'+z', showPrep:true, devices:[{axis:'x', keep:'+'}, {axis:'z'}]}], readouts:['fractions'], shot:'L-3Q'}`
- Caption: "from |+z⟩: (+z then +x) ½ · (+x then +z) ¼, because $P_{+x}P_{+z} \ne P_{+z}P_{+x}$"
- Terms: `Q_bP_a|\psi\rangle` → `spot-plus` · `P_a` → `magnet-1`.
- Claims: ½ → `norm(apply(P(+x), apply(P(+z), KET['+z'])))**2` = 0.5 = `benchTheory({source:'+z', axes:['z','x'], keep:['+']}).plus` · ¼ → `norm(apply(P(+z), apply(P(+x), KET['+z'])))**2` = 0.25 = `benchTheory({source:'+z', axes:['x','z'], keep:['+']}).plus` · projectors do not commute → `matEq(matmul(P(+x),P(+z)), matmul(P(+z),P(+x)))` = false.

**`l7-compatible:b4` [L]** (p.7, "calculate [Sx, Sy]")
- Text: "Now the spin case: $S_xS_y = \tfrac{\hbar^2}{4}\begin{pmatrix} i&0\\0&-i\end{pmatrix}$ and $S_yS_x = \tfrac{\hbar^2}{4}\begin{pmatrix} -i&0\\0&i\end{pmatrix}$. Subtracting gives $[S_x, S_y] = i\hbar S_z$. The same steps give $[S_y,S_z] = i\hbar S_x$ and $[S_z,S_x] = i\hbar S_y$, and reversing an order flips the sign."
- Stage: `{kind:'operator-space', op:{named:'Sx'}, add:{named:'Sy'}, eigen:false, shot:'O-STD'}`
- Caption: "S_x and S_y are perpendicular arrows; their commutator, divided by iħ, is S_z along the third axis (the drawn third arrow is the sum S_x + S_y, not the commutator)"
- Terms: `S_x` → `arrow-a`.
- Claims: → `matmul(SX,SY)` = [[0.25i, 0],[0, −0.25i]] · → `matmul(SY,SX)` = [[−0.25i, 0],[0, 0.25i]] · → `matEq(comm(SX,SY), mscale(SZ, c(0,1)))` · cyclic → `comm(SY,SZ)` = i·SX, `comm(SZ,SX)` = i·SY · reversed → `comm(SY,SX)` = −i·SZ.

**`l7-compatible:b5` [B]**
- Text: "Townsend starts with a book: turn it 90° about x and then about y, repeat in the other order, and it ends up facing differently. For small turns the two orders differ by a tiny turn about z, and that mismatch is exactly where $[S_x, S_y] = i\hbar S_z$ comes from. (He writes $J$ for the generators.)"
- Stage: `{kind:'bloch', state:'+z', rotate:{axis:'x', angleDeg:sweep(0,90)}, trail:true, shot:'B-STD'}` (shows the first quarter turn; the second, about y, leaves −y where it is).
- Caption: "|+z⟩: x then y ends at −y; y then x ends at +x"
- Refs: Townsend §3.1, pp.75–79, Fig. 3.1, eqs. (3.12)–(3.14).
- Claims: x then y → `blochVector(apply(rotation([0,1,0],π/2), apply(rotation([1,0,0],π/2), KET['+z'])))` = (0, −1, 0) · y then x → the other order = (1, 0, 0) · small turns → `msub(matmul(Rx(ε),Ry(ε)), matmul(Ry(ε),Rx(ε)))` ≈ `mscale(SZ, c(0, −ε²))` for ε = 0.01 (tol 1e−6), with `Rx(ε) = rotation([1,0,0], ε)`.

**`l7-compatible:b6` [B]**
- Text: "Townsend proves the converse for one eigenvalue: if $[A,B] = 0$ and only one state gives $a$, that state is also an eigenstate of $B$. When an eigenvalue repeats you must pick combinations, and a definite energy need not fix the momentum (his free particle moving either way). Zwiebach's Notes 5 §7, which the notes cite, proves the full shared-basis theorem."
- Stage: `{kind:'operator-space', op:{a0:1, a:[0,0,0]}, gauge:true, eigen:true, shot:'O-GAUGE'}`
- Caption: "$\vec a = 0$: both eigenvalues equal, so every spin state is an eigenstate. For spin ½ this is the only way an eigenvalue can repeat"
- Refs: Townsend §3.2, pp.80–81 (eqs. 3.17–3.21, Fig. 3.3) · Zwiebach MIT 8.05 Notes 5 §7 (URL to verify, §8) · Susskind §5.1.1.
- Claims: → `eigenHermitian2(identity(2)).values` = [1, 1] · → `matEq(comm(identity(2), SX), mscale(identity(2), 0))`.

**`l7-compatible:b7` [C]** (p.7, "meaning and limits")
- Question: "$[S_z, S_x] \ne 0$, so the order can matter. Must every starting state show a difference?"
- Stage: `{kind:'bloch-ball', point:'+y', measure:'z', shot:'B-STD'}`
- Reveal text: "Not in every number. From $|{+y}\rangle$ the chance of getting + then + is ¼ in both orders. But the atom ends in $|{+x}\rangle$ after z-then-x and in $|{+z}\rangle$ after x-then-z, so the final states still differ."
- Reveal caption: "same joint probability ¼, different final states"
- Reveal stage: `{kind:'bloch-ball', point:'+x', compare:'+z', shot:'B-STD'}`
- Reveal claims: → `norm(apply(P(+x), apply(P(+z), KET['+y'])))**2` = 0.25 = `norm(apply(P(+z), apply(P(+x), KET['+y'])))**2` · final states → `samePhysicalState(normalize(apply(P(+x), apply(P(+z), KET['+y']))), KET['+x'])` and the other order gives `KET['+z']`.

**`l7-compatible:b8` [C]**
- Question: "For spin ½, can spin components along two different axes ever be measured compatibly?"
- Stage: `{kind:'operator-space', op:{named:'Sz'}, add:{a0:0, a:[0,0,-0.5]}, eigen:true, shot:'O-STD'}` (the second arrow is $S_{-\hat z} = -S_z$; they sum to zero).
- Reveal text: "Only if the axes are parallel or opposite. For the spins $S_{\hat n}$ and $S_{\hat m}$ along unit vectors $\hat n$ and $\hat m$, $[S_{\hat n}, S_{\hat m}] = i\hbar(\hat n\times\hat m)\cdot\vec S$ with $\vec S = (S_x, S_y, S_z)$, which vanishes only when the [[cross-product|cross product]] $\hat n\times\hat m$ is zero. A z magnet and an upside-down z magnet are compatible; tilt one of them and they are not."
- Reveal caption: "tilted by 60°: $|\hat n\times\hat m| = \sin 60^\circ \approx 0.866$, so the commutator is not zero"
- Reveal stage: `{kind:'operator-space', op:{named:'Sz'}, add:{a0:0, a:[0.433,0,0.25]}, eigen:true, shot:'O-STD'}` (spin along 60° from z toward x; ħ = 1, so $|\vec a| = ½$).
- Claims: opposite axes commute → `matEq(comm(SX, mscale(SX,−1)), mscale(identity(2),0))`. Reveal claims: the cross-product rule → `matEq(comm(spinAlong(n), spinAlong(m)), mscale(spinAlong(cross(n,m)), c(0,1)))` for n = (sin30°, 0, cos30°), m = (0, sin50°, cos50°) (`cross` is an engine gap, §8; the check ran with an inline cross product) · 0.866 → `|cross([0,0,1], tiltXZ(60°))|` = 0.8660.

### Unit `l7-spreads` — Spreads you can read off the sphere

**`l7-spreads:b1` [L]** (p.8, "average the squared deviations") — **link-back beat to `l3-spread`** (L3 pp.15–17 introduce ⟨A⟩, the variance and ΔA; L7 does not re-define them)
- Text: "Recall from Lecture 3: on many copies of one state, the [[spread]] of the readings of $A$ is $\Delta A$, with $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$, and it is zero exactly in an eigenstate of $A$. Lecture 3 found $\Delta S_z$ for one state at a time. Now we ask for all three spin components of any state at once."
- Link: "back to Lecture 3" chip → `l3-spread`.
- Stage: `{kind:'lab-r3', benches:[{id:'main', source:'+z', showPrep:true, devices:[{axis:{tiltDeg:60}}]}], readouts:['centroid','fill-bar'], shot:'L-PLATE'}`
- Caption: "|+z⟩ into a magnet tilted 60°: p(+) = ¾, ⟨S_n⟩ = +ħ/4, ΔS_n ≈ 0.433ħ"
- Terms: `\langle A\rangle` → `centroid` · `\Delta A` → `fill-bar`.
- Claims: ¾ → `probUpAlong(tiltXZ(60°), [0,0,1])` = 0.75 · ħ/4 → `expectation(spinAlong(tiltXZ(60°)), KET['+z'])` = 0.25 · 0.433 → `sd(spinAlong(tiltXZ(60°)), KET['+z'])` = 0.4330 · the variance, 0.75·0.25² + 0.25·0.75² = 0.1875 (L3's definition, worked by hand) → `variance(spinAlong(tiltXZ(60°)), KET['+z'])` = 0.1875.

**`l7-spreads:b2` [L]** (p.8, "for spin, the Bloch vector determines the spreads")
- Text: "Every spin reading is $\pm\hbar/2$, so $S_j^2 = \tfrac{\hbar^2}{4}I$ for each axis $j = x, y, z$. With $\langle S_j\rangle = \tfrac{\hbar}{2}r_j$ this gives $(\Delta S_j)^2 = \tfrac{\hbar^2}{4}(1 - r_j^2)$. The Bloch arrow fixes all three spreads."
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:0}, measure:'z', shot:'B-STD'}`
- Caption: "$\vec r$ = (0.866, 0, 0.500): ΔS_x = 0.250ħ, ΔS_y = 0.500ħ, ΔS_z ≈ 0.433ħ"
- Terms: `r_j` → `point` · `\Delta S_z` → `z`.
- Claims: → `matEq(matmul(SX,SX), mscale(identity(2), 0.25))` (and SY, SZ) · formula → `variance(S_j, ψ)` = (1 − r_j²)/4 for all three j at ψ = `ketFromBloch(60°, 0)` · values → `sd(SX,ψ)` = 0.25, `sd(SY,ψ)` = 0.5, `sd(SZ,ψ)` = 0.4330.

**`l7-spreads:b3` [L]** (p.8, the $|{+z}\rangle$ example)
- Text: "In $|{+z}\rangle$, $\vec r = (0, 0, 1)$, so $\Delta S_z = 0$ while $\Delta S_x = \Delta S_y = \hbar/2$. The z value is definite, and each sideways component is a fair coin."
- Stage: `{kind:'bloch', state:'+z', measure:'x', shot:'B-STD'}`
- Caption: "p(±x) = ½ each, so ΔS_x = ħ/2"
- Terms: `\Delta S_x` → `axis-n`.
- Claims: → `sd(SZ, KET['+z'])` = 0 · `sd(SX, KET['+z'])` = `sd(SY, KET['+z'])` = 0.5.

**`l7-spreads:b4` [L]** (p.8, "preparation uncertainty versus measurement disturbance")
- Text: "These spreads belong to one prepared state, measured on fresh copies. They are not instrument error, not the kick from an earlier measurement, and not the error of an average. That error shrinks like $\Delta A/\sqrt N$ over $N$ trials, while $\Delta A$ stays put."
- Stage: `{kind:'lab-r3', benches:[{id:'main', source:'+z', showPrep:true, devices:[{axis:'x'}]}], batches:[10,100,1000], readouts:['sigma-band'], shot:'L-PLATE'}`
- Caption: "each atom: ΔS_x = ħ/2, always · the average of 100 atoms: ±0.05ħ"
- Terms: `\Delta A/\sqrt N` → `sigma-band` · `\Delta A` → `spot-plus`.
- Claims: → `sd(SX, KET['+z'])` = 0.5 · → `sd(SX, KET['+z'])/Math.sqrt(100)` = 0.05 (the L1 `sigma-band` is in σ = 2S/ħ units, 2√(p(1−p)/N) = 0.1 at N = 100, the same band).
- Fidelity: `lab-born-fractions`.

**`l7-spreads:b5` [L]** (p.13, Reference B, last line) — **link-back to Lecture 6's reference page** (same text)
- Text: "For spin ½, the average along any axis $\hat n$ fixes both probabilities: $p_\pm = \tfrac12 \pm \langle S_{\hat n}\rangle/\hbar$, where $S_{\hat n}$ is the spin along $\hat n$. At θ = 60° measured along z, $\langle S_z\rangle = \hbar/4$, so $p_+ = \tfrac34$ and $p_- = \tfrac14$."
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:0}, measure:'z', shot:'B-STD'}`
- Caption: "p₊ = ½ + ¼ = ¾"
- Terms: `\hat n` → `axis-n` · `p_\pm` → `axis-n`.
- Claims: → `0.5 + expectation(SZ, ketFromBloch(60°,0))` = 0.75 = `prob(KET['+z'], ketFromBloch(60°,0))`.

**`l7-spreads:b6` [B]**
- Text: "Townsend computes the same spread for $|\psi\rangle = \tfrac12|{+z}\rangle + \tfrac{i\sqrt3}{2}|{-z}\rangle$: $\langle S_z\rangle = -\hbar/4$ and $\Delta S_z = \tfrac{\sqrt3}{4}\hbar \approx 0.43\hbar$. His follow-up sentence credits the 75 % to $+\hbar/2$; the 75 % belongs to $-\hbar/2$ (errata box)."
- Stage: `{kind:'bloch', state:{thetaDeg:120, phiDeg:90}, measure:'z', shot:'B-STD'}` (exactly Townsend's state: `ketFromBloch(120°, 90°)` = (½, i√3/2)).
- Caption: "p(+z) = ¼, ⟨S_z⟩ = −ħ/4, ΔS_z ≈ 0.433ħ: the same spread as θ = 60°, mirrored"
- Refs: Townsend §1.4, pp.15–17, eq. (1.21) and Example 1.2 · Susskind §5.4 (the same definition through the shifted operator $A - \langle A\rangle I$).
- Claims: → `prob(KET['+z'], ψT)` = 0.25 with ψT = `vec(0.5, c(0, Math.sqrt(3)/2))` · → `expectation(SZ, ψT)` = −0.25 · → `sd(SZ, ψT)` = 0.4330 · ψT is the sphere point → entrywise equal to `ketFromBloch(120°, 90°)`.

**`l7-spreads:b7` [C]**
- Question: "Is there always an axis along which a pure state has zero spread?"
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:45}, measure:'x', shot:'B-STD'}`
- Reveal text: "Yes: the direction $\hat r$ of its own Bloch arrow. Along $\hat r$ the state is an eigenstate, so $\Delta S_{\hat r} = 0$; Susskind calls this the spin-polarization principle. A spread describes a state *and* an axis, not a fuzzy state."
- Reveal caption: "measured along its own arrow: p(+) = 1"
- Reveal stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:45}, measure:{thetaDeg:60, phiDeg:45}, shot:'B-STD'}`
- Refs (beat): Susskind Lecture 3, §3.8.
- Reveal claims: → `variance(spinAlong(blochVector(ψ)), ψ)` = 0 for ψ = `ketFromBloch(60°,45°)` · → `probUpAlong(blochVector(ψ), blochVector(ψ))` = 1.

**`l7-spreads:b8` [C]**
- Question: "$\Delta S_x = \tfrac{\hbar}{2}\sqrt{1 - r_x^2}$. Where is that length on the sphere?"
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:45}, measure:'x', shot:'B-STD'}`
- Reveal text: "Because $r_x^2 + r_y^2 + r_z^2 = 1$, $\sqrt{1 - r_x^2} = \sqrt{r_y^2 + r_z^2}$ is the distance from the Bloch point to the x axis. So $\Delta S_x$ is ħ/2 times that distance: zero on the axis, largest on the circle around it. The three squared spreads always add to $\hbar^2/2$."
- Reveal caption: "here: distance 0.791, ΔS_x ≈ 0.395ħ; (ΔS_x)² + (ΔS_y)² + (ΔS_z)² = 0.5ħ²"
- Reveal stage: none (picture stays).
- Reveal claims: → `sd(SX, ψ)` = 0.3953 = `0.5*Math.hypot(r[1], r[2])` at ψ = `ketFromBloch(60°,45°)` · sum rule → `variance(SX,ψ)+variance(SY,ψ)+variance(SZ,ψ)` = 0.5 for ψ at (θ, φ) ∈ {(60°,0), (60°,45°), (90°,45°), (120°,200°), (33°,77°)}.

### Unit `l7-uncertainty` — A floor under the product of spreads

**`l7-uncertainty:b1` [L]** (p.9, first display)
- Text: "For a pure state the Bloch arrow has length 1: $r_x^2 + r_y^2 + r_z^2 = 1$. Multiplying two of the spreads gives $(\Delta S_x\Delta S_y)^2 = \tfrac{\hbar^4}{16}(1-r_x^2)(1-r_y^2) = \tfrac{\hbar^4}{16}(r_z^2 + r_x^2r_y^2)$."
- Stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:45}, measure:'z', shot:'B-STD'}`
- Caption: "θ = 60°, φ = 45°: ΔS_xΔS_y ≈ 0.156ħ²"
- Terms: `r_z^2` → `z` · `r_x^2r_y^2` → `point`.
- Claims: → `sd(SX,ψ)*sd(SY,ψ)` = 0.15625 at ψ = `ketFromBloch(60°,45°)` · identity → `(1−rx²)(1−ry²)` = `rz² + rx²ry²` = 0.390625 from `blochVector(ψ)`.

**`l7-uncertainty:b2` [L]** (p.9, boxed result)
- Text: "The term $r_x^2r_y^2$ is never negative, so dropping it leaves $\Delta S_x\Delta S_y \ge \tfrac{\hbar^2}{4}|r_z| = \tfrac{\hbar}{2}|\langle S_z\rangle|$. Because $[S_x,S_y] = i\hbar S_z$, the same line reads $\Delta S_x\Delta S_y \ge \tfrac12|\langle[S_x,S_y]\rangle|$."
- Stage: same as b1.
- Caption: "0.156ħ² ≥ 0.125ħ²"
- Terms: `\langle S_z\rangle` → `z` · `[S_x,S_y]` → `point`.
- Claims: bound → `0.5*Math.abs(expectation(SZ,ψ))` = 0.125 · the same bound from the commutator → `0.5*abs(expectationC(comm(SX,SY), ψ))` = 0.125 (complex expectation, §8; `expectation` would return 0 here) · inequality → 0.15625 ≥ 0.125.

**`l7-uncertainty:b3` [L]** (p.9 "check two familiar states", p.11 example)
- Text: "Along the x–z circle $r_y = 0$, so the bound is met exactly, from $\hbar^2/4$ at $|{+z}\rangle$ down to 0 at $|{+x}\rangle$. At $|{+x}\rangle$ the floor is zero although $[S_x,S_y] \ne 0$: only its average $i\hbar\langle S_z\rangle$ vanishes. And $\Delta S_y$ is still $\hbar/2$, so a zero product does not make both values definite."
- Stage: `{kind:'bloch', state:{thetaDeg:sweep(0,90), phiDeg:0}, measure:'y', trail:true, shot:'B-STD'}`
- Caption: "θ from 0° to 90° at φ = 0: product = bound all the way (0.250 at 0°, 0.125 at 60°, 0 at 90°)"
- Terms: `|{+x}\rangle` → `x` · `\Delta S_y` → `axis-n`.
- Claims: product = bound → at θ ∈ {0°, 60°, 90°}, φ = 0: `sd(SX,ψ)*sd(SY,ψ)` = `0.5*Math.abs(expectation(SZ,ψ))` = 0.25, 0.125, 0 · commutator not zero → `matEq(comm(SX,SY), 0)` = false · its average at $|{+x}\rangle$ → `expectationC(comm(SX,SY), KET['+x'])` = 0 · → `sd(SY, KET['+x'])` = 0.5.

**`l7-uncertainty:b4` [L]** (p.10, "general Robertson relation" and the x–p preview)
- Text: "For any two observables in one prepared state, the [[robertson-relation|Robertson relation]] says $\Delta A\,\Delta B \ge \tfrac12|\langle[A,B]\rangle|$. Its floor depends on the state unless the commutator is a multiple of $I$. Preview, not derived here: position and momentum will obey $[x, p_x] = i\hbar I$, which gives $\Delta x\,\Delta p_x \ge \hbar/2$ in every state."
- Stage: `{kind:'bloch', state:'+y', measure:{tiltDeg:45}, shot:'B-STD'}`
- Caption: "A = S_x, B = spin along 45° in the x–z plane, state |+y⟩: 0.250ħ² ≥ 0.177ħ²"
- Terms: `\Delta A\,\Delta B` → `axis-n` · `x`, `p_x` → gloss `position`, `momentum` (no stage anchor).
- Claims: → `sd(SX, KET['+y'])*sd(spinAlong(tiltXZ(45°)), KET['+y'])` = 0.25 · → `0.5*abs(expectationC(comm(SX, spinAlong(tiltXZ(45°))), KET['+y']))` = 0.1768 · ħ/2 → `0.5*abs(c(0,1))` = 0.5 (bookkeeping only; the engine has no position operator).

**`l7-uncertainty:b5` [L]** (p.12, Reference A — in the notes, outside the plan)
- Text: "Reference A proves the general rule without Cauchy–Schwarz. Shift each observable by its average, $\delta A = A - \langle A\rangle I$; then the vector $\big(\tfrac{\delta A}{\Delta A} \pm i\tfrac{\delta B}{\Delta B}\big)|\psi\rangle$ has squared length $2 \pm i\langle[A,B]\rangle/(\Delta A\,\Delta B)$. A squared length is never negative, and using both signs gives the bound."
- Stage: `{kind:'bloch', state:'+z', measure:'x', shot:'B-STD'}`
- Caption: "|+z⟩, A = S_x, B = S_y: the two squared lengths are 0 and 4; the + vector vanishes, so the bound is met exactly"
- Terms: `\delta A` → `axis-n`.
- Claims: 0 → `norm(apply(madd(mscale(SX,2), mscale(SY,c(0,2))), KET['+z']))**2` = 0 · 4 → the same with `c(0,−2)` = 4 · $i\langle[S_x,S_y]\rangle$ at $|{+z}\rangle$ → `mul(c(0,1), expectationC(comm(SX,SY), KET['+z']))` = −0.5, and 2 + (−0.5)/(0.5·0.5) = 0.

**`l7-uncertainty:b6` [B]**
- Text: "Townsend (§3.5) and Susskind (§5.5–5.7) reach the same general rule through the Schwarz inequality, and Susskind's Exercise 5.2 uses the notes' shifted operators. Townsend applies it to spin: when $S_z$ has a definite nonzero value, neither $S_x$ nor $S_y$ can be definite. Zwiebach's Notes 5 §2, which the notes cite, gives the standard proof."
- Stage: `{kind:'bloch', state:'+z', measure:'y', shot:'B-STD'}`
- Caption: "|+z⟩: ΔS_x = ΔS_y = ħ/2, both above zero"
- Refs: Townsend §3.5, pp.91–93, eqs. (3.63)–(3.75) · Susskind Lecture 5, §5.4–5.7 · Zwiebach MIT 8.05 Notes 5 §2 (URL to verify).
- Claims: → `sd(SX, KET['+z'])` = `sd(SY, KET['+z'])` = 0.5.

**`l7-uncertainty:b7` [C]** (tension between Townsend p.93 and the notes' p.8 box)
- Question: "Townsend reads this bound as the reason an $S_z$ measurement spoils a later $S_x$ measurement. Is that what the inequality says?"
- Stage: `{kind:'lab-r3', benches:[{id:'main', source:'+z', showPrep:true, devices:[{axis:'z', keep:'+'}, {axis:'x'}]}], shot:'L-WIDE'}`
- Reveal text: "Not quite. Both spreads in it belong to one prepared state, each measured on fresh copies, with no measurement before the other. The kick one measurement gives the next is the update rule from the order unit; the bound only limits what a single preparation can have."
- Reveal caption: "fresh copies of |+z⟩: ΔS_z = 0 and ΔS_x = ħ/2, with no earlier measurement involved"
- Reveal stage: `{kind:'bloch', state:'+z', measure:'x', shot:'B-STD'}`
- Refs (beat): Townsend §3.5, p.93 · the notes p.8 ("preparation uncertainty versus measurement disturbance").
- Reveal claims: → `sd(SZ, KET['+z'])` = 0 · → `sd(SX, KET['+z'])` = 0.5.

**`l7-uncertainty:b8` [C]**
- Question: "The derivation dropped $r_x^2r_y^2$. What is that term, and when is the bound met exactly?"
- Stage: `{kind:'bloch', state:{thetaDeg:90, phiDeg:45}, measure:'z', shot:'B-STD'}`
- Reveal text: "It is $\tfrac{16}{\hbar^4}\langle S_x\rangle^2\langle S_y\rangle^2$, so the notes' own line before the '≥' is an exact equation: $(\Delta S_x\Delta S_y)^2 = \tfrac{\hbar^2}{4}\langle S_z\rangle^2 + \langle S_x\rangle^2\langle S_y\rangle^2$. The bound is met exactly whenever $r_xr_y = 0$. The gap is largest, $\hbar^2/8$, on the equator halfway between x and y, shown here."
- Reveal caption: "here: product 0.125ħ², bound 0 · at θ = 60°, φ = 0: product = bound = 0.125ħ²"
- Reveal stage: `{kind:'bloch', state:{thetaDeg:60, phiDeg:0}, measure:'z', shot:'B-STD'}`
- Reveal claims: equation → `prod² − bound²` = `(expectation(SX,ψ)*expectation(SY,ψ))²` (|Δ| < 1e−12) for ψ at +z, +x, +y, (60°,0), (60°,45°), (90°,45°), (30°,90°), (45°,30°) · largest gap → a 1° grid over the sphere gives max(`sd(SX)·sd(SY) − ½|⟨S_z⟩|`) = 0.125 at θ = 90°, φ = 45° (and 135°, 225°, 315°) · saturated → at (60°, 0) product = bound = 0.125.

## 2. Try-it widget per unit

All props are real fields of the widget's props interface (`app/src/widgets/*.tsx`). Numbers in the prompts
were computed with the engine (script in the evidence note at the top).

| Unit | Widget spec (`visual`) | Try this (2–3) |
|---|---|---|
| `l7-two-angles` | `{kind:'bloch', props:{theta:90, phi:120, measure:'x', landmarks:true, editable:true}}` · caption "the magnet along x asks: is it $\|\psi(0)\rangle = \|{+x}\rangle$?" | 1. Keep θ at 90° and drag φ. The P(+x) bar is $\cos^2(\varphi/2)$, the overlap probability with $\|{+x}\rangle$. Where does it reach ½, and where 0? (90° and 180°.) · 2. Set φ = −10°. The bar reads 0.992 = cos² 5°: always use the short way round. · 3. Leave the equator: θ = 60°, φ = 0. The arrows are now 30° apart, so η = 15° and P(+x) = cos² 15° ≈ 0.933. |
| `l7-full-turn` | `{kind:'bloch', props:{theta:90, phi:0, rotations:true, landmarks:true, editable:true}}` · caption "the phasors α and β show the ket; the point shows only the ray" | 1. Press $R_z(360^\circ)$ once. The point comes back, but both phasors α and β now point the other way: the ket is $-\|{+x}\rangle$. · 2. Press it again. Which total angle brought the phasors home? (720°.) · 3. Drag θ to 0 (the state $\|{+z}\rangle$) and press $R_z(360^\circ)$: the point never moves, yet α still flips. |
| `l7-order` | `{kind:'sg-lab', props:{source:'+z', axes:['x','z'], keep:['+'], editable:true, maxDevices:3, predict:true}}` | 1. Predict the − share at the last magnet, then fire. Now swap the magnets to z then x: which order keeps the z answer certain? · 2. With x then z, add a third magnet along z. Of the atoms that reach it, what fraction lands +? (All of them.) · 3. Make the first magnet a 60° tilt, keep −, end with z. Predict the − spot's share of the source (3/16 = 0.1875), then fire 1000. |
| `l7-compatible` | `{kind:'basis-translator', props:{mode:'operator', target:'x', operator:'Sz'}}` · caption "commuting observables are the ones some basis makes diagonal together" | 1. $S_z$ written in the x basis: is it diagonal? Switch the operator to $S_x$: now? · 2. Try the y basis with $S_z$ and with $S_x$. Is there any basis here in which $S_x$ and $S_z$ are both diagonal? (No; they do not commute.) · 3. Two diagonal matrices always commute. Explain in one sentence why "diagonal in the same basis" forces $[A,B] = 0$. |
| `l7-spreads` | `{kind:'deposit-stats', props:{state:[60,0], axis:'z', seed:7}}` · caption "the band is the error of the average; each atom still reads ±ħ/2" | 1. Predict first: P(+z) = ¾, so $\langle S_z\rangle = \hbar/4$ and $\Delta S_z \approx 0.433\hbar$. · 2. Fire 10, then 100, then 1000 atoms. The band around the count narrows, but no atom ever lands between the spots: the spread of single readings has not changed. · 3. From the final counts, estimate $\Delta S_z = \hbar\sqrt{p_+p_-}$ and compare with 0.433ħ. |
| `l7-uncertainty` | `{kind:'bloch', props:{theta:60, phi:45, measure:'z', landmarks:true, editable:true}}` · caption "the readout gives ⟨Sx⟩, ⟨Sy⟩, ⟨Sz⟩; each spread is $\sqrt{\hbar^2/4 - \langle S_j\rangle^2}$" | 1. Use the readout to get $\Delta S_x$ and $\Delta S_y$, then compare their product (0.156ħ²) with $\tfrac{\hbar}{2}\|\langle S_z\rangle\|$ (0.125ħ²). · 2. Set φ = 0, so $\langle S_y\rangle = 0$. Is the bound now met exactly? · 3. Find the state with the largest product (0.25ħ², at a pole) and the one with the largest gap (ħ²/8, on the equator at φ = 45°). |

Widget notes for W/D: (a) `PhaseDial` is not used in L7 (the equatorial angle is taught on the sphere); its
slider is being relabelled from θ to φ in the working tree, consistent with the Rosetta (§7.5 A3). (b) Three units use `bloch`; each page still has one WebGL
context (the widget draws into the stage host as an island, `BlochSphere.tsx`).

## 3. Challenges per unit

L7's 13 pages contain **no homework problems**, so nothing below is marked `assigned`. If the missing page 14
carries a problem set (§11 Q1), those items get hints only (`assigned: 'L7 p.14'`). Answers are numbers the engine
computes, or a choice checked by an engine claim. Hints are nudge → key idea → setup.

### `l7-two-angles`
1. **`l7-ta-overlap`** · warm-up · numeric · answer **0.25** (tol 0.005, unit "probability") → `prob(eq(0), eq(120°))`
   - Prompt: "Two equatorial states have Bloch arrows 120° apart. What is the probability of finding one of them in the other?"
   - Hints: (1) State-space angles are half of sphere angles. (2) The probability is $\cos^2\tfrac{\Delta\varphi}{2}$. (3) $\Delta\varphi/2 = 60^\circ$ and $\cos 60^\circ = \tfrac12$.
   - Walkthrough: Δφ = 120° · η = Δφ/2 = 60° · $|\langle\psi_1|\psi_2\rangle| = \cos 60^\circ = 0.5$ · square it: 0.25.
2. **`l7-ta-short-way`** · core · numeric · answer **10** (tol 0.1, unit "°") → `Math.acos(abs(inner(eq(10°), eq(350°))))`
   - Prompt: "Equatorial states sit at $\varphi_1 = 10^\circ$ and $\varphi_2 = 350^\circ$. What is the state-ray angle η, in degrees?"
   - Hints: (1) The Bloch separation is always between 0° and 180°. (2) 350° is the same direction as −10°. (3) Δφ = 20°; halve it.
   - Walkthrough: the short way round is 20° · η = 10° · check: $|\langle\psi_1|\psi_2\rangle| = \cos 10^\circ = 0.985$ · the trap, 170°, would need $\cos 170^\circ < 0$, impossible for a modulus.
3. **`l7-ta-orthogonal`** · core · choice
   - Prompt: "Which pair of states is orthogonal?"
   - Options: $|{+x}\rangle, |{+y}\rangle$ ✗ (90° on the sphere, overlap ½) · $|\psi(30^\circ)\rangle, |\psi(210^\circ)\rangle$ ✓ (opposite on the sphere; `prob(eq(30°), eq(210°))` = 0) · $|{+z}\rangle, |{+x}\rangle$ ✗ (overlap ½) · $|{+x}\rangle, -|{+x}\rangle$ ✗ (the same state).
   - Hints: (1) Orthogonal means probability 0. (2) That needs η = 90°. (3) So the Bloch arrows must be 180° apart.
   - Walkthrough: find the pair whose arrows are opposite · 30° and 210° differ by 180° · η = 90°, overlap 0.
4. **`l7-ta-offaxis`** · stretch · numeric · answer **15** (tol 0.1, unit "°") → `Math.acos(abs(inner(KET['+y'], ketFromBloch(60°, 90°))))`
   - Prompt: "A state has θ = 60°, φ = 90°. What is its state-ray angle η to $|{+y}\rangle$, in degrees?"
   - Hints: (1) The half-angle rule works off the equator too. (2) Both arrows lie in the y–z plane. (3) $|{+y}\rangle$ is at θ = 90°, so the arrows are 30° apart.
   - Walkthrough: angle between arrows = 90° − 60° = 30° · η = 15° · check: P = cos² 15° ≈ 0.933 = `prob(KET['+y'], ketFromBloch(60°,90°))`.

### `l7-full-turn`
1. **`l7-ft-what-changes`** · warm-up · choice
   - Prompt: "$R_z(360^\circ)$ acts on $|{+x}\rangle$. What has changed?"
   - Options: the Bloch point ✗ (`blochVector` = (1,0,0) again) · P(+x) ✗ (still 1) · the sign of the ket ✓ (`expectation(Rz(2π), KET['+x'])` = −1) · nothing at all ✗ (the column vector is negated).
   - Hints: (1) Look at the diagonal of $R_z(2\pi)$. (2) $e^{\mp i\pi} = -1$. (3) An overall −1 is a global phase.
   - Walkthrough: $R_z(2\pi) = -I$ · so $R_z(2\pi)|{+x}\rangle = -|{+x}\rangle$ · a global phase changes no probability and no Bloch point · only the sign changed.
2. **`l7-ft-sandwich`** · core · numeric · answer **−1** (tol 1e−6) → `expectation(Rz(2π), KET['+x'])`
   - Prompt: "Compute $\langle{+x}|R_z(2\pi)|{+x}\rangle$."
   - Hints: (1) Write $R_z(2\pi)$ as a matrix. (2) It is $-I$. (3) $\langle{+x}|{+x}\rangle = 1$.
   - Walkthrough: $R_z(2\pi) = \mathrm{diag}(e^{-i\pi}, e^{i\pi}) = -I$ · $\langle{+x}|(-I)|{+x}\rangle = -1$ · the trap is to read "−1" as "a different state".
3. **`l7-ft-still`** · core · numeric · answer **−1** (tol 1e−6) → `expectation(Rz(2π), KET['+z'])`
   - Prompt: "$|{+z}\rangle$ sits on the turning axis, so $R_z(360^\circ)$ never moves its Bloch point. What is $\langle{+z}|R_z(2\pi)|{+z}\rangle$?"
   - Hints: (1) Did the point have to move for the sign to appear? (2) $R_z(2\pi)$ is the same matrix for every state. (3) It is $-I$.
   - Walkthrough: $R_z(\varphi)|{+z}\rangle = e^{-i\varphi/2}|{+z}\rangle$ (Reference B's checkpoint) · at 2π the factor is −1 · the sign belongs to the turn, not to a loop drawn by the point.
4. **`l7-ft-720`** · stretch · numeric · answer **720** (tol 0.5, unit "°") → `expectation(Rz(4π), KET['+x'])` = 1 while `Rz(2π)` gives −1
   - Prompt: "What is the smallest positive turn angle φ, in degrees, with $R_z(\varphi)|{+x}\rangle = |{+x}\rangle$ exactly, sign included?"
   - Hints: (1) Compute $\langle{+x}|R_z(\varphi)|{+x}\rangle$ as a function of φ. (2) It is $\cos(\varphi/2)$. (3) When is $\cos(\varphi/2) = 1$ again?
   - Walkthrough: $\langle{+x}|R_z(\varphi)|{+x}\rangle = \tfrac12(e^{-i\varphi/2} + e^{i\varphi/2}) = \cos\tfrac{\varphi}{2}$ · it is 1 at φ = 0 and next at φ = 720° · at 360° it is −1 (engine: 0.707 at 90°, 0 at 180°, −1 at 360°, 1 at 720°).

### `l7-order`
1. **`l7-or-swap`** · warm-up · numeric · answer **0.5** (tol 0.005) → sum of `benchTheory({source:'+z', axes:['x','z'], keep:[s]}).minus` over s = +, −
   - Prompt: "Prepare $|{+z}\rangle$. Measure $S_x$, then $S_z$, keeping every atom. What is the probability that $S_z$ reads $-\hbar/2$?"
   - Hints: (1) Split into the two x results. (2) Each happens half the time. (3) From $|{\pm x}\rangle$, $p(-z) = \tfrac12$.
   - Walkthrough: $p(-z) = p(+x)p(-z|{+x}) + p(-x)p(-z|{-x})$ · $= \tfrac12\cdot\tfrac12 + \tfrac12\cdot\tfrac12 = \tfrac12$ · with z first it would be 0.
2. **`l7-or-steps`** · core · order
   - Prompt: "Put the steps of an ideal measurement of $A$ on $|\psi\rangle$ in order."
   - Steps (correct order): "Find the projector $P_a$ for each outcome $a$" · "Compute $p(a) = \langle\psi|P_a|\psi\rangle$" · "One outcome $a$ occurs, with probability $p(a)$" · "Apply $P_a$ to $|\psi\rangle$" · "Divide by $\sqrt{p(a)}$ to get the conditional state".
   - Hints: (1) Probabilities come before the outcome. (2) The update uses the outcome that happened. (3) The last step restores length 1.
   - Walkthrough: the order above, with the $|{+z}\rangle$, $S_x$ example: $p(+x) = \tfrac12$, $P_{+x}|{+z}\rangle$ has length 0.707, dividing gives $|{+x}\rangle$ (`l7-order:b1` claims).
3. **`l7-or-repeat`** · core · choice
   - Prompt: "After the x step and a first z reading, you measure $S_z$ again straight away. What happens?"
   - Options: it repeats the first z reading ✓ (`benchTheory({source:'+z', axes:['x','z','z'], keep:['+','+']}).minus` = 0) · 50/50 again ✗ · always + ✗ · it depends on the x result ✗.
   - Hints: (1) What state does a z reading leave? (2) A z eigenstate. (3) A z eigenstate gives its own value with certainty.
   - Walkthrough: the first z prepared $|{+z}\rangle$ or $|{-z}\rangle$ · a second z finds the same value · randomness came from the x step, not from z.
4. **`l7-or-tilt`** · stretch · numeric · answer **0.375** (tol 0.005) → `benchTheory({source:'+z', axes:[60,'z'], keep:['+']}).minus + benchTheory({source:'+z', axes:[60,'z'], keep:['-']}).minus` = 0.1875 + 0.1875
   - Prompt: "Prepare $|{+z}\rangle$. First measure with a magnet tilted 60° from z toward x, keeping every atom, then measure $S_z$. What is $p(-z)$?"
   - Hints: (1) Two branches, $|{+\hat n}\rangle$ and $|{-\hat n}\rangle$. (2) $p(+\hat n) = \cos^2 30^\circ = \tfrac34$. (3) From $|{\pm\hat n}\rangle$, $p(-z)$ is $\sin^2 30^\circ$ or $\cos^2 30^\circ$.
   - Walkthrough: $\tfrac34\cdot\tfrac14 + \tfrac14\cdot\tfrac34 = \tfrac38 = 0.375$ · with z first, $p(-z) = 0$ · the tilted step made the z answer uncertain.

### `l7-compatible`
1. **`l7-co-which`** · warm-up · choice
   - Prompt: "Which pair of observables can share a complete eigenbasis?"
   - Options: $S_x$ and $S_y$ ✗ · $S_z$ and $I + 4S_z$ ✓ (`comm` = 0) · $S_x$ and $S_z$ ✗ · $S_z$ and the spin along an axis 60° from z ✗.
   - Hints: (1) Shared basis ⇔ zero commutator. (2) Functions of $S_z$ commute with $S_z$. (3) Spin components along different axes never commute.
   - Walkthrough: $I + 4S_z$ has eigenstates $|{\pm z}\rangle$, so it shares the z basis · the others have $[A,B] \ne 0$.
2. **`l7-co-joint`** · core · numeric · answer **0.25** (tol 0.005) → `0.5 − 0.25` from the two projector products on `KET['+z']`
   - Prompt: "Start in $|{+z}\rangle$. Find the probability of + then + for 'z then x', minus the probability of + then + for 'x then z'."
   - Hints: (1) Use the squared length $\|Q_bP_a|\psi\rangle\|^2$ of the branch that survives both steps. (2) z first: $1\cdot\tfrac12$. (3) x first: $\tfrac12\cdot\tfrac12$.
   - Walkthrough: z then x: $\tfrac12$ · x then z: $\tfrac14$ · difference ¼, because $P_{+x}P_{+z} \ne P_{+z}P_{+x}$.
3. **`l7-co-yplus`** · core · choice
   - Prompt: "From $|{+y}\rangle$, both orders of $S_z$ and $S_x$ give probability ¼ for + then +. What does this show?"
   - Options: $S_z$ and $S_x$ commute ✗ · order never matters for $|{+y}\rangle$ ✗ (the final states differ: $|{+x}\rangle$ vs $|{+z}\rangle$) · one statistic can hide an order effect ✓ · the projectors commute ✗ (`matEq` false).
   - Hints: (1) Compare the final states, not only the numbers. (2) After z then x, the state is $|{+x}\rangle$. (3) After x then z, it is $|{+z}\rangle$.
   - Walkthrough: both joint probabilities are ¼ (`l7-compatible:b7`) · but the conditional states differ · the notes: a nonzero commutator says order *can* matter, not that every statistic shows it.
4. **`l7-co-tilt`** · stretch · numeric · answer **0.866** (tol 0.002) → `matEq(comm(SZ, spinAlong(tiltXZ(60°))), mscale(SY, c(0, Math.sin(60°))))`
   - Prompt: "Let $S_{\hat n}$ be the spin along an axis tilted 60° from z toward x. Then $[S_z, S_{\hat n}] = i\hbar\,c\,S_y$. Find $c$."
   - Hints: (1) Use $[S_{\hat a}, S_{\hat b}] = i\hbar(\hat a\times\hat b)\cdot\vec S$. (2) $\hat n = (\sin 60^\circ, 0, \cos 60^\circ)$. (3) $\hat z\times\hat n = (0, \sin 60^\circ, 0)$.
   - Walkthrough: the cross product points along y with length $\sin 60^\circ$ · so $c = \sin 60^\circ \approx 0.866$ · it is zero only for a tilt of 0° or 180°.

### `l7-spreads`
1. **`l7-sp-plusz`** · warm-up · numeric · answer **0.5** (tol 0.005, unit "ħ") → `sd(SX, KET['+z'])`
   - Prompt: "What is $\Delta S_x$ in the state $|{+z}\rangle$?"
   - Hints: (1) Use $(\Delta S_j)^2 = \tfrac{\hbar^2}{4}(1 - r_j^2)$. (2) $r_x = 0$ for $|{+z}\rangle$. (3) Take the square root.
   - Walkthrough: $(\Delta S_x)^2 = \hbar^2/4$ · $\Delta S_x = \hbar/2$ · a fair coin between ±ħ/2.
2. **`l7-sp-sixty`** · core · numeric · answer **0.433** (tol 0.002, unit "ħ") → `sd(SZ, ketFromBloch(60°, 0))`
   - Prompt: "A state has θ = 60°, φ = 0. What is $\Delta S_z$?"
   - Hints: (1) $r_z = \cos\theta$. (2) $r_z = \tfrac12$. (3) $\Delta S_z = \tfrac{\hbar}{2}\sqrt{1 - \tfrac14}$.
   - Walkthrough: $\sqrt{3/4} = 0.866$ · half of it: 0.433ħ · the same as Townsend's Example 1.2.
3. **`l7-sp-sum`** · core · numeric · answer **0.5** (tol 0.005, unit "ħ²") → sum of `variance(S_j, ψ)` over j for five states
   - Prompt: "For any pure state, what is $(\Delta S_x)^2 + (\Delta S_y)^2 + (\Delta S_z)^2$?"
   - Hints: (1) Add the three formulas. (2) $r_x^2 + r_y^2 + r_z^2 = 1$. (3) $\tfrac{\hbar^2}{4}(3 - 1)$.
   - Walkthrough: $\tfrac{\hbar^2}{4}(3 - |\vec r|^2) = \tfrac{\hbar^2}{2}$ · the same for every pure state.
4. **`l7-sp-ninety`** · stretch · numeric · answer **0.3** (tol 0.002, unit "ħ") → `sd(SZ, ketFromBloch(2*acos(√0.9), 0))`
   - Prompt: "A magnet along $\hat n$ gives + with probability 0.9. What is $\Delta S_{\hat n}$?"
   - Hints: (1) $p_+ = \tfrac12 + \langle S_{\hat n}\rangle/\hbar$. (2) So $\langle S_{\hat n}\rangle = 0.4\hbar$. (3) $(\Delta S)^2 = \tfrac{\hbar^2}{4} - \langle S\rangle^2$.
   - Walkthrough: $0.25 - 0.16 = 0.09$ · $\Delta S_{\hat n} = 0.3\hbar$ · equivalently $\hbar\sqrt{p_+p_-} = \hbar\sqrt{0.09}$.

### `l7-uncertainty`
1. **`l7-un-zero`** · warm-up · choice
   - Prompt: "In $|{+x}\rangle$, $\Delta S_x\Delta S_y = 0$. Which statement is true?"
   - Options: $S_x$ and $S_y$ commute ✗ · $S_x$ is definite and $S_y$ is a fair coin ✓ (`sd(SX,+x)` = 0, `sd(SY,+x)` = 0.5) · both values are definite ✗ · the bound is broken ✗ (0 ≥ 0).
   - Hints: (1) Which factor is zero? (2) $\Delta S_x = 0$ because $r_x = 1$. (3) $r_y = 0$, so $\Delta S_y = \hbar/2$.
   - Walkthrough: the product is 0 because one factor is 0 · the bound is $\tfrac{\hbar}{2}|\langle S_z\rangle| = 0$ · the commutator is still $i\hbar S_z \ne 0$.
2. **`l7-un-product`** · core · numeric · answer **0.156** (tol 0.002, unit "ħ²") → `sd(SX,ψ)*sd(SY,ψ)` at `ketFromBloch(60°,45°)`
   - Prompt: "A state has θ = 60°, φ = 45°. Find $\Delta S_x\Delta S_y$."
   - Hints: (1) $r_x = r_y = \sin 60^\circ\cos 45^\circ$. (2) $r_x^2 = r_y^2 = 0.375$. (3) Each spread is $\tfrac{\hbar}{2}\sqrt{0.625}$.
   - Walkthrough: $\tfrac{\hbar^2}{4}\times 0.625 = 0.156\hbar^2$ · the bound is $\tfrac{\hbar}{2}\cdot\tfrac{\hbar}{4} = 0.125\hbar^2$ · it holds with room to spare.
3. **`l7-un-max`** · core · numeric · answer **0.25** (tol 0.002, unit "ħ²") → 1° grid maximum of `sd(SX)*sd(SY)`
   - Prompt: "What is the largest value $\Delta S_x\Delta S_y$ can take in any pure state?"
   - Hints: (1) The product is $\tfrac{\hbar^2}{4}\sqrt{(1-r_x^2)(1-r_y^2)}$. (2) Make $r_x$ and $r_y$ both zero. (3) That is a pole.
   - Walkthrough: at $|{\pm z}\rangle$ both factors are 1 · product $\hbar^2/4$ · there the bound is met exactly too.
4. **`l7-un-gap`** · stretch · numeric · answer **0.125** (tol 0.002, unit "ħ²") → 1° grid maximum of `sd(SX)*sd(SY) − 0.5*|expectation(SZ)|`
   - Prompt: "Over all pure states, what is the largest gap $\Delta S_x\Delta S_y - \tfrac{\hbar}{2}|\langle S_z\rangle|$?"
   - Hints: (1) The gap comes from the dropped $r_x^2r_y^2$ term. (2) Put the state on the equator, $r_z = 0$. (3) Then maximize $\sqrt{(1-r_x^2)(1-r_y^2)}$ with $r_x^2 + r_y^2 = 1$.
   - Walkthrough: on the equator the bound is 0 and the product is $\tfrac{\hbar^2}{4}|r_xr_y|$ · largest at $r_x = r_y = 1/\sqrt2$ (φ = 45°) · gap $\hbar^2/8 = 0.125\hbar^2$.

## 4. Glossary terms new in L7

Ready for `glossary.ts` (one plain sentence each, ≤ 25 words). "Uses" lists glossary ids inside the gloss, for the
closure test. Ids already in `glossary.ts` (`relative-phase`, `global-phase`, `bloch-sphere`, `scatter`,
`expectation`, `commutative`, `unit-vector`, `dot-product`, …) are reused, not redefined. **Ownership rule
(orchestrator):** a term is glossed by the first lecture whose notes teach it, so only terms L7's notes introduce
are listed here; terms L7 recalls are in the "must exist" list below with their owning lecture.

| id | Term | Gloss | First | Uses |
|---|---|---|---|---|
| `azimuth` | azimuth φ | The angle around the z axis, measured from +x toward +y; the notes call it θ on the equator. | `l7-two-angles:b1` | — |
| `polar-angle` | polar angle θ | The angle of a Bloch arrow down from +z, from 0° at the north pole to 180° at the south pole. | `l7-two-angles:b4` | bloch-vector |
| `state-ray` | state ray | A state vector together with all its multiples by a phase; every vector on the ray gives the same predictions. | `l7-two-angles:b3` | global-phase |
| `ray-angle` | state-ray angle η | The angle between two state rays, $\eta = \arccos\lvert\langle\psi_1\vert\psi_2\rangle\rvert$, from 0° (same state) to 90° (orthogonal). | `l7-two-angles:b3` | state-ray, orthogonal, inner-product |
| `bloch-separation` | Bloch separation Δφ | The smaller angle between two Bloch arrows, always between 0° and 180°; it is twice the state-ray angle. | `l7-two-angles:b2` | bloch-vector, ray-angle |
| `full-turn-sign` | full-turn sign | The −1 a spin-½ ket picks up after a 360° turn; it is a global phase, and a second turn removes it. | `l7-full-turn:b2` | global-phase, ket |
| `belt-trick` | belt trick | A demonstration with a twisted belt: one full turn leaves a twist that cannot be undone, two turns leave none. | `l7-full-turn` (the opener before it) | — |
| `joint-probability` | joint probability | The probability that two measurements, done in a stated order, give a stated pair of outcomes. | `l7-compatible:b3` | probability, outcome |
| `compatible` | compatible observables | Two observables that can both have definite values in every state of some shared basis, so their measuring order never matters. | `l7-compatible:b2` | observable, basis |
| `common-eigenbasis` | common eigenbasis | A basis whose every vector is an eigenstate of two observables at once. | `l7-compatible:b2` | basis, eigenstate |
| `commutator` | commutator $[A,B]$ | The operator $AB - BA$; it is zero exactly when the order of multiplying $A$ and $B$ never matters. | `l7-compatible:b2` | commutative |
| `degenerate` | degenerate eigenvalue | An eigenvalue shared by more than one independent eigenstate, so the outcome alone does not fix the state. | `l7-compatible:b6` | eigenstate, outcome |
| `cross-product` | cross product $\hat n\times\hat m$ | An arrow perpendicular to both $\hat n$ and $\hat m$, with length $\sin$ of the angle between them. | `l7-compatible:b8` | unit-vector |
| `preparation-uncertainty` | preparation uncertainty | The spread built into one prepared state; it is not caused by the instrument or by an earlier measurement. | `l7-spreads:b4` | spread, prepare |
| `sample-mean-error` | error of the average | How far the average of $N$ readings typically misses the true mean; it shrinks like $1/\sqrt N$, unlike the spread. | `l7-spreads:b4` | spread, expectation |
| `spin-polarization` | spin-polarization principle | Every pure spin-½ state is the + state of the spin along its own Bloch arrow (Susskind). | `l7-spreads:b7` | bloch-vector, spin |
| `uncertainty-relation` | uncertainty relation | A lower limit on the product of two spreads in one prepared state. | `l7-uncertainty:b2` | spread |
| `robertson-relation` | Robertson relation | The general uncertainty relation $\Delta A\,\Delta B \ge \tfrac12\lvert\langle[A,B]\rangle\rvert$ for any two observables in one state. | `l7-uncertainty:b4` | uncertainty-relation, commutator |
| `saturated` | saturated (bound met exactly) | Said of an inequality that holds as an equality for a particular state. | `l7-uncertainty:b3` | — |
| `shifted-operator` | shifted operator $\delta A$ | The observable minus its average, $A - \langle A\rangle I$; its readings are the deviations from the mean. | `l7-uncertainty:b5` | expectation, identity |
| `position` | position $x$ | Where a particle is along a line; in the preview it is an operator, not the x axis of the lab. | `l7-uncertainty:b4` | — |
| `momentum` | momentum $p_x$ | Mass times velocity along x; quantum mechanics treats it as an operator that does not commute with position. | `l7-uncertainty:b4` | position, commutator |

**Must exist before L7 ships (owned by earlier lectures, tagged in L7 without redefinition):**

| id | Owner | Used in L7 at |
|---|---|---|
| `bloch-vector` (Bloch arrow $\vec r$) | L6 | two-angles:b1 |
| `rotation-operator` ($R_z(\varphi)$), `generator`, `matrix-exponential` | L6 §6.3 | full-turn:b1, b4 |
| `identity` ($I$) | L4 (projectors sum to $I$) | full-turn:b2 |
| `projector` ($P_a$), `conditional-state`, `update-rule` | L3 (update) and L4 (projector form) | order:b1 |
| `expectation` (exists), `spread` ($\Delta A$), `variance` | L3 `l3-spread` (pp.15–17) | spreads:b1 |
| `eigenstate`, `eigenvalue`, `observable`, `hermitian`, `operator` | L3 | throughout |

If one is missing when L7 is built, the glossary closure test fails, which is the intended signal. If L6's plan
already glosses `azimuth` and `polar-angle`, drop those two rows above.

## 5. Review card per unit

Every number on a card is a claim from §1 or an engine call given in brackets.

### `l7-two-angles` — Sphere angles are twice state angles
- On the equator, the relative phase φ is the azimuth of the Bloch arrow: $\vec r = (\cos\varphi, \sin\varphi, 0)$.
- Two states whose arrows are Δφ apart overlap with probability $\cos^2\tfrac{\Delta\varphi}{2}$.
- The state-ray angle is half the Bloch angle: $\eta = \Delta\varphi/2$. Opposite arrows are orthogonal states; perpendicular arrows overlap ½.
- Always use the smaller separation, 0°–180°: 10° and 350° are 20° apart, so η = 10°.

$$|\langle\psi_1|\psi_2\rangle|^2 = \cos^2\tfrac{\Delta\varphi}{2},\qquad \eta = \arccos|\langle\psi_1|\psi_2\rangle| = \tfrac{\Delta\varphi}{2}$$

**The one trap:** reading the notes' θ as our polar angle. On the equator the notes' θ is our azimuth φ.

### `l7-full-turn` — A full turn flips the sign
- $R_z(\varphi)$ moves the arrow by φ about z and adds a common phase $e^{-i\varphi/2}$.
- At 360°, $R_z(2\pi) = -I$: the arrow and all probabilities return, but the ket is $-|\psi\rangle$ [`expectation(Rz(2π), KET['+x'])` = −1].
- At 720°, $R_z(4\pi) = +I$: only then is the ket itself back.
- $S_z$ generates the turn: $R_z(\varphi) = e^{-i\varphi S_z/\hbar}$ (Lecture 6).

$$R_z(2\pi) = -I,\qquad R_z(4\pi) = I,\qquad R_z(\varphi) = e^{-i\varphi S_z/\hbar}$$

**The one trap:** putting the turn into the half-angle rule. After 360° the rays coincide, so η = 0, not 180°.

### `l7-order` — Swapping the order of two measurements
- Recall (L3–L4): a measurement gives $a$ with $p(a) = \langle\psi|P_a|\psi\rangle$ and leaves $P_a|\psi\rangle/\sqrt{p(a)}$.
- From $|{+z}\rangle$: z first gives + for certain; x first makes $p(-z) = \tfrac12$.
- A repeated z measurement repeats its result: the first one prepared a z eigenstate.
- Randomness alone does not make order matter; disturbing the other observable's states does.

$$p(a) = \langle\psi|P_a|\psi\rangle,\qquad |\psi\rangle \to \frac{P_a|\psi\rangle}{\sqrt{p(a)}},\qquad p(-z) = \tfrac12\cdot\tfrac12 + \tfrac12\cdot\tfrac12 = \tfrac12$$

**The one trap:** blaming randomness. $|{+x}\rangle$ through two z magnets is random, yet their order cannot matter.

### `l7-compatible` — Compatible measurements share a basis and commute
- A complete shared eigenbasis ⇔ $[A,B] = 0$ (for Hermitian matrices).
- Measurement order is set by projectors: joint probabilities are $\|Q_bP_a|\psi\rangle\|^2$ vs $\|P_aQ_b|\psi\rangle\|^2$.
- $[S_x,S_y] = i\hbar S_z$ and cyclic; two spin components commute only for parallel or opposite axes.
- A nonzero commutator says order *can* matter; from $|{+y}\rangle$ both orders give ¼ for (+, +), yet the final states differ.

$$[A,B] = AB - BA,\qquad [S_x,S_y] = i\hbar S_z,\quad [S_y,S_z] = i\hbar S_x,\quad [S_z,S_x] = i\hbar S_y$$

**The one trap:** thinking $[A,B] = 0$ makes every outcome certain. Commuting observables can still be random in a superposition of their shared eigenstates.

### `l7-spreads` — Spreads you can read off the sphere
- Recall (L3): $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$, measured on fresh copies of one state.
- For spin, $(\Delta S_j)^2 = \tfrac{\hbar^2}{4}(1 - r_j^2)$: $\Delta S_j$ is ħ/2 times the distance from the Bloch point to the j axis.
- In $|{+z}\rangle$: $\Delta S_z = 0$, $\Delta S_x = \Delta S_y = \hbar/2$.
- The three squared spreads always add to $\hbar^2/2$ [sum of `variance`, 0.5].

$$(\Delta S_j)^2 = \tfrac{\hbar^2}{4}\,(1 - r_j^2),\qquad p_\pm = \tfrac12 \pm \frac{\langle S_{\hat n}\rangle}{\hbar}$$

**The one trap:** confusing the spread with the error of an average. The average's error shrinks like $1/\sqrt N$; the spread of single readings does not.

### `l7-uncertainty` — A floor under the product of spreads
- For spin, $\Delta S_x\Delta S_y \ge \tfrac{\hbar}{2}|\langle S_z\rangle| = \tfrac12|\langle[S_x,S_y]\rangle|$, from $|\vec r| = 1$ alone.
- The bound is met exactly when $r_xr_y = 0$; the largest gap is $\hbar^2/8$, on the equator at 45°.
- In general, $\Delta A\,\Delta B \ge \tfrac12|\langle[A,B]\rangle|$ (Robertson); $[x,p_x] = i\hbar I$ will give $\Delta x\,\Delta p_x \ge \hbar/2$.
- The spreads belong to one preparation; the bound is not a statement about one measurement disturbing the next.

$$(\Delta S_x\Delta S_y)^2 = \tfrac{\hbar^4}{16}\,(r_z^2 + r_x^2r_y^2) \;\ge\; \tfrac{\hbar^2}{4}\langle S_z\rangle^2$$

**The one trap:** reading a zero floor as "they commute". In $|{+x}\rangle$ the floor is 0, but $[S_x,S_y] = i\hbar S_z \ne 0$.

## 6. Symbol-before-use table

**Reading order assumed:** units in order; inside a unit, story beats (L → B → C, reveals after their question)
→ Try it → insight → pitfalls → review → challenges. "Prereq" means defined by an earlier lecture's glossary or
content (L1 exists; L2–L6 are assumed to define their own symbols first). Status: OK · gloss (a glossary tag is
enough) · **FLAG** (clash or use-before-definition, with the fix; fixes marked "done" are already in §1–§5).

| Symbol | First use in L7 | Defined | Status | Fix / note |
|---|---|---|---|---|
| ħ | two-angles:b1 | L1 gloss `hbar` | OK | — |
| $\vec r$, $r_x, r_y, r_z$ | two-angles:b1 | prereq L6, recalled in the same beat | OK | gloss `bloch-vector` (L6) |
| $\langle S_x\rangle$ etc. | two-angles:b1 | prereq (L3 `l3-spread`, gloss `expectation`) | gloss | — |
| φ (azimuth) | two-angles:b1 | same beat + caption | **FLAG** (notes write θ) | Rosetta at first use (done); gloss `azimuth`. Rule for learners: φ inside $\lvert\psi(\cdot)\rangle$ is a *position*, φ inside $R_z(\cdot)$ is a *turn*; the two add. |
| θ (polar) | two-angles:b4 | same beat | **FLAG** (notes use θ for the equator; L6 notes too) | Keep θ polar everywhere in the app; never write θ for the azimuth. `PhaseDial` is being relabelled to φ in the working tree (§7.5 A3). |
| $\lvert\psi(\varphi)\rangle$, $\lvert\psi_1\rangle$, $\lvert\psi_2\rangle$, $\varphi_1, \varphi_2$ | two-angles:b1–b2 | same beats | OK | — |
| Δφ | two-angles:b2 | same beat | **FLAG** (Δ also means a spread from `l7-spreads` on) | Always say "Bloch separation Δφ" and "spread ΔA" in words at first use of each; glossary keeps two entries. Never write a bare Δ. |
| η | two-angles:b3 | same beat | OK | gloss `ray-angle` |
| $\lvert{+\hat n}\rangle$ | two-angles:b4 | same beat (Townsend's formula) | OK | — |
| $R_z(\varphi)$ | full-turn:b1 | L6 + recalled as a matrix in the same beat | OK | — |
| $\varphi_0$ | full-turn:b1 | same beat | OK | — |
| $I$, $-I$ | full-turn:b2 | prereq L4 (gloss `identity`) | gloss | — |
| $e^{M}$ | full-turn:b4 | prereq L6 §6.3, recalled in the same beat | gloss | `matrix-exponential` (L6) |
| $d\varphi$ | full-turn:b4 | same beat ("a tiny turn") | OK | — |
| α, β, $\alpha^*$ | full-turn:b5 | same beat (entries of the column); * = complex conjugate, prereq L2 | OK | This is why the turn angle is *not* renamed α (see Rosetta). |
| $A$, $B$ (observables) | order:b1 | same beat | OK | L1 used A, B for sets but renamed its orders "z-first/x-first", so no live clash. |
| $P_a$ (projector), $p(a)$ (probability) | order:b1 | prereq L3–L4, recalled in the same beat | **FLAG** (L1 writes $P(+)$ for a probability) | One gloss line in order:b1's caption: "lower-case p is a probability; capital $P_a$ is a projector" (from L3 on the notes use this split). |
| $\lvert a\rangle\langle a\rvert$ | order:b1 | prereq (L3/L4 outer product) | gloss | `projector` |
| $\lvert k\rangle$, $a_k$, $b_k$, $c_k$ | compatible:b1 | same beat | **FLAG** (notes write $\lvert n\rangle$, $a_n$, while $\hat n$ and $S_{\hat n}$ are the axis) | Renamed to k (done). |
| $[A,B]$ | compatible:b2 | same beat | OK | gloss `commutator` |
| $Q_b$ | compatible:b3 | same beat | OK | — |
| $\lVert v\rVert$ (length) | challenge `l7-co-joint` hint 1 | not in L7 prose | **FLAG** | Beats say "squared length" in words; the hint should read "the squared length $\lVert Q_bP_a\lvert\psi\rangle\rVert^2$" (tag L2 `norm` if it exists). |
| $S_{\hat n}$, $\vec S$ | compatible:b8 reveal | same reveal | OK (was FLAG) | Defined inline (done); re-defined in spreads:b5 for readers who skip clues. |
| $\hat n\times\hat m$ | compatible:b8 reveal | same reveal | gloss | `cross-product` |
| $\Delta A$, $(\Delta A)^2$ | spreads:b1 | prereq L3 `l3-spread`, recalled in the same beat | OK | gloss `spread`, `variance` (L3) |
| $S_j$, $r_j$ (axis index) | spreads:b2 | same beat | OK (was FLAG) | The notes write $S_i$; with $i$ also the imaginary unit in $i\hbar S_z$, the app uses $j$ (done). |
| $N$ | spreads:b4 | same beat | OK | Not L1's $N_{\text{atoms}}$ clash: here it is defined inline as the number of trials. |
| $p_\pm$ | spreads:b5 | same beat | OK | — |
| $\hat r$ | spreads:b7 reveal | same reveal | OK | — |
| $\delta A$ | uncertainty:b5 | same beat | OK | gloss `shifted-operator` (Susskind writes $\bar A$) |
| $x$, $p_x$ | uncertainty:b4 | same beat, marked preview | **FLAG** (x is also the lab axis and the Bloch axis) | Gloss `position`/`momentum`; the caption keeps the spin example so no x axis is on screen while $x$ means position. |
| $J_x, J_y, J_z$ | not used | — | OK | Townsend's letters appear only as "(he writes J)". |
| $\chi_z(\varphi)$ (notes §7.3) | not used | — | OK | The recap beat skips the notes' rotated-coordinates notation. |

**Counts:** 9 FLAG rows. 8 are resolved in this plan's copy (Rosetta caption on two-angles:b1, Δφ and ΔA each
introduced in words, the p/P line on order:b1's caption, the k-rename, $S_{\hat n}$ and $\vec S$ inline, the norm
hint, index j, x glossed as position). 1 needed code, the θ label in `PhaseDial`, which another role is already changing to φ (§7.5 A3).

## 7. Errata

### 7.1 The L7 notes: no mathematical error found
Every derivation was redone against the engine; all agree (this confirms the judge/P check logged in BUILD-LOG):

| Notes | Claim | Engine / numpy evidence |
|---|---|---|
| p.2 | overlap $= e^{i\Delta\theta/2}\cos\tfrac{\Delta\theta}{2}$, η = Δθ/2, table 180°→90°, 90°→45° | `inner(eq(0), eq(120°))` = 0.25 + 0.433i (arg 60°, modulus 0.5); η(+x,−x) = 90°, η(+x,+y) = 45° |
| p.3 | $R_z(\varphi)\psi(\theta) = e^{-i\varphi/2}\psi(\theta+\varphi)$; $R_z(2\pi) = -I$, $R_z(4\pi) = I$; η after a full turn = 0 | φ₀ = 30°, φ = 100°: entrywise equal to 1e−12; `matEq` both true; η = 0 |
| p.4 | $R_z = e^{-i\varphi S_z/\hbar}$; derivative at 0 is $-iS_z/\hbar$ | `expm2(−iφSZ)` = `Rz(φ)`; central difference ×i = `SZ` (tol 1e−8) |
| p.5 | $p(-z) = ½$ after $S_x$; repeated $S_z$ repeats | `benchTheory` sums 0.25 + 0.25; x,z,z bench minus = 0 |
| p.7 | $S_xS_y$, $S_yS_x$, $[S_x,S_y] = i\hbar S_z$ and cyclic | matrices [[0.25i,0],[0,−0.25i]] and its negative; all three `matEq` true |
| p.8 | $(\Delta S_i)^2 = \tfrac{\hbar^2}{4}(1 - r_i^2)$; $\lvert{+z}\rangle$ spreads 0, ½, ½ | formula holds for 5 random states to 1e−12 |
| p.9 | $(1-r_x^2)(1-r_y^2) = r_z^2 + r_x^2r_y^2 \ge r_z^2$; both checks | 0.390625 = 0.390625 at (60°,45°); +z: 0.25 = 0.25; +x: 0 = 0 |
| p.11 | in $\lvert{+x}\rangle$, $\langle[S_x,S_y]\rangle = 0$, $\Delta S_x = 0$, $\Delta S_y = \hbar/2$ | complex expectation 0; `sd` 0 and 0.5 |
| p.12 | squared length $= 2 \pm i\langle[A,B]\rangle/(\Delta A\Delta B)$ | at $\lvert{+z}\rangle$, A = S_x, B = S_y: $\lVert 2(S_x \pm iS_y)\lvert{+z}\rangle\rVert^2$ = 0 and 4 = 2 ± (−2) |
| p.13 | $\langle S\rangle$ rotates as a vector; $p_\pm = ½ \pm \langle S_n\rangle/\hbar$ | `blochVector` after `Rz(90°)` = `qrotate(axisAngle(z,90°), r0)`; 0.5 + 0.25 = 0.75 = `prob` |

### 7.2 Corrections for the errata box (with `check()`)

| # | Where | Says (paraphrased) | Should say | Evidence | Where it shows |
|---|---|---|---|---|---|
| E1 | Townsend Example 1.2, p.17 (the sentence after the solution) | For $\lvert\psi\rangle = \tfrac12\lvert{+z}\rangle + \tfrac{i\sqrt3}{2}\lvert{-z}\rangle$ there is a 75 % chance of $+\hbar/2$ | 75 % for $-\hbar/2$; 25 % for $+\hbar/2$ | `prob(KET['+z'], vec(0.5, c(0, Math.sqrt(3)/2)))` = 0.25; the book's own solution just above gives $\langle S_z\rangle = -\hbar/4$, which needs $p(-) = ¾$. Checked on the rendered printed page (the OCR text layer could have dropped a sign; the print has none). `check: () => close(prob(KET['+z'], ψT), 0.25)` | `l7-spreads:b6` and the lecture's corrections box. The ΔSz = 0.43ħ result itself is right. |

### 7.3 Cross-source tensions (not errors; handled in the story)

| # | Sources | Tension | Evidence | Handling |
|---|---|---|---|---|
| T1 | Townsend §3.5, p.93 vs notes p.8 box | Townsend presents $\Delta J_x\Delta J_y \ge \tfrac{\hbar}{2}\lvert\langle J_z\rangle\rvert$ as the reason an $S_z$ measurement modifies later $S_x$ results; the notes insist the spreads belong to one preparation and are not measurement disturbance | Both spreads are computed on fresh copies of one state (`sd(SZ,+z)` = 0, `sd(SX,+z)` = 0.5) with no prior measurement; the disturbance is the update rule (`l7-order`) | Clue `l7-uncertainty:b7` |
| T2 | Townsend §3.5, p.93 vs Susskind §3.8 | Townsend: angular momentum "never really points" in a definite direction; Susskind: every spin state is the + state along some axis | `variance(spinAlong(blochVector(ψ)), ψ)` = 0 for 5 states: each pure state has zero spread along its own arrow. Townsend means that no two *different* components are definite together, which is true | Clue `l7-spreads:b7`; the Townsend ref's `adds` should say "two components" |
| T3 | Susskind §5.2 | No two spin components "along any axes" can be measured together | True for non-parallel axes only: `comm(SX, mscale(SX,−1))` = 0 (a z magnet and an upside-down z magnet are compatible) | Paraphrased as "two different, non-parallel axes" in `l7-order:b5`; clue `l7-compatible:b8` |
| T4 | Susskind §5.3 vs notes p.6 box | Susskind: an eigenvector of $A$ is (as a rule) not an eigenvector of an operator that fails to commute with $A$; the notes warn that non-commuting observables can share some eigenvectors | True in two dimensions (a shared eigenvector of two 2×2 Hermitian matrices forces a shared basis). False in general: numpy, spin-0 ⊕ spin-1 (4 dimensions): $\lVert[L_x,L_y]\rVert$ = 1.414 yet $L_x v = L_y v = 0$ for the spin-0 vector $v$ | Judge note only; L7's spin examples never meet the exception. Susskind's own "as a rule" covers it. |
| T5 | notes p.10 vs Townsend (3.72) | The notes (and Townsend) drop the $r_x^2r_y^2$ / anticommutator term; for pure spin-½ states the notes' own p.9 line is already an equality | prod² − bound² = $(\langle S_x\rangle\langle S_y\rangle)^2$ for 8 states (1e−12); `{S_x,S_y}` = 0 | Clue `l7-uncertainty:b8` (no badge needed: the equation is the notes' own line) |

### 7.4 Notation hazards in the notes (not errors)
θ for the equatorial angle (Rosetta); $\lvert n\rangle$ as a basis label next to $S_{\mathbf n}$ as an axis (renamed k);
$S_i$ with $i$ also the imaginary unit (renamed j); Δ for both a separation and a spread; $p(a)$ vs L1's $P(+)$.
All handled in §6. The footers read "n / 14" but the file has 13 pages (§11 Q1).

**Across lectures:** L5 p.14 ("Lecture 6 handoff") says the next lecture leads to the spin commutators and the
general uncertainty relation, and L5 p.15 assigns them to Lecture 6. L6's notes contain no commutator and p.1
defers variance and the uncertainty relation; they are taught in L7 §7.5–7.9 (text search of `sources/L5`,
`sources/L6`, `sources/L7`). The app should follow the notes' actual content: commutators live in L7 (the P-L5
plan records the same). L3 p.15 likewise defers commutators ("not yet"), consistent with L7 owning them.
L7's Reference B (p.13) is L6's last page word for word (183 of 183 eight-word runs shared; L6's footer reads
"13 / ??"), and L7 §7.3 repeats L6 §6.3; both are L6's by the ownership rule and appear in L7 only as recaps.

### 7.5 Engine and app issues found while planning
| # | Issue | Evidence | Action |
|---|---|---|---|
| A1 | **`expectation(A, ψ)` returns only the real part.** $\langle[A,B]\rangle$ is purely imaginary, so a Robertson-bound claim written with `expectation` silently gets bound 0 and passes vacuously. | `expectation(comm(SX,SY), KET['+z'])` = 0, but `inner(KET['+z'], apply(comm(SX,SY), KET['+z']))` = 0.5i | Add `expectationC` (§8); a content lint that forbids `expectation(comm(…))`. |
| A2 | Arcade Bloch-golf levels train `{lecture:'L7', unit:'rotations'}`, a placeholder unit id. | `app/src/arcade/games.ts` `ROT` | Retarget to `l7-full-turn` when L7 ships (and `l7-compatible` for the new order level, §9). |
| A3 | `PhaseDial` labelled the relative phase θ (the notes' letter) while `BlochSphere` uses θ for the polar angle. | `PhaseDial.tsx` slider label | Being fixed: the working tree (uncommitted, another role, 2026-09-27) already relabels the slider and formula to φ and keeps the prop name `theta`. That matches this plan's Rosetta; verify it lands. |
| A4 | BUILD-LOG's L7 content map lists §7.3 (the generator) as L7 content; `sources/L6/text.md` has the identical §6.3. | both texts | Ownership: L6 (carry-over rule); L7 recap beat only. |

## 8. Engine gaps

Each function needs a numpy fixture in `pipeline/make_fixtures.py` (seed 448) and a vitest case, like the
existing engine. ħ = 1 throughout. "numpy" gives the reference expression the fixture should store.

| # | Name · file · signature | Formula | numpy check | Used by |
|---|---|---|---|---|
| G1 | `commutator` · linalg.ts · `(A: Mat, B: Mat) => Mat` | $AB - BA$ | `A@B - B@A`; fixtures: $[S_x,S_y] = iS_z$ and cyclic, $[S_y,S_x] = -iS_z$, $[S_z, I+4S_z] = 0$, $[S_x,-S_x] = 0$ | compatible:b2–b8, uncertainty:b2–b5, challenges |
| G2 | `anticommutator` · linalg.ts · `(A, B) => Mat` | $AB + BA$ | `A@B + B@A`; $\{S_x,S_y\} = 0$, $\{S_x,S_x\} = \tfrac12 I$ | uncertainty:b8 claims |
| G3 | `expectationC` · spin.ts · `(A: Mat, psi: Vec) => C` | $\langle\psi\lvert A\rvert\psi\rangle$, complex, ψ normalized first | `np.vdot(psi, A@psi)`; $\langle{+z}\lvert[S_x,S_y]\rvert{+z}\rangle = 0.5i$; for Hermitian A, imag < 1e−12 and real = `expectation` | every Robertson claim (fixes hazard A1) |
| G4 | `spread` · spin.ts · `(A: Mat, psi: Vec) => number` | $\sqrt{\max(0, \langle A^2\rangle - \langle A\rangle^2)}$ | `np.sqrt(max(0, (vdot(p,A@A@p) - vdot(p,A@p)**2).real))` | all spread claims (replaces the `sd` shorthand) |
| G5 | `spreadsFromBloch` · spin.ts · `(r: Vec3) => Vec3` | $\tfrac12\sqrt{\max(0, 1 - r_j^2)}$ per axis | `0.5*np.sqrt(1 - r**2)` vs G4 on (Sx,Sy,Sz) for 20 random states; also sum of squares = 0.5 for pure states | spreads:b2, b8; uncertainty:b1 |
| G6 | `uncertaintyCheck` · spin.ts · `(A, B, psi, eps = 1e-9) => { product: number; bound: number; slack: number; saturated: boolean }` | product = spread(A)·spread(B); bound = ½·\|G3(G1(A,B), ψ)\|; slack = product − bound; saturated = \|slack\| < eps | 20 random states × pairs (Sx,Sy), (Sx, S at 45° in x–z), (Sz, S at 60°): slack ≥ −1e−12; spin identity product² − bound² = (⟨Sx⟩⟨Sy⟩)²; saturated at (60°,0) and +z | uncertainty unit, challenges `l7-un-*`, Arcade |
| G7 | `rayAngle` · spin.ts · `(a: Vec, b: Vec) => number` (radians, 0…π/2) | $\eta = \arccos\min(1, \lvert\langle a\vert b\rangle\rvert/(\lVert a\rVert\lVert b\rVert))$ | `np.arccos(min(1, abs(np.vdot(a,b))/(norm(a)*norm(b))))`; η(eq 10°, eq 350°) = 10°, η(+x,+y) = 45°, η(ψ, −ψ) = 0 | two-angles unit, full-turn:b8 |
| G8 | `blochAngle` · spin.ts · `(a: Vec, b: Vec) => number` (radians, 0…π) | $\arccos(\mathrm{clamp}(\vec r_a\cdot\vec r_b))$ | fixture: `rayAngle = blochAngle/2` for 20 random pairs (1e−9) | two-angles unit |
| G9 | `cross` · spin.ts · `(a: Vec3, b: Vec3) => Vec3` | $\vec a\times\vec b$ | `np.cross`; identity $[S_{\hat n},S_{\hat m}] = i(\hat n\times\hat m)\cdot\vec S$ via `spinAlong` for 10 random pairs | compatible:b8, `l7-co-tilt` |
| G10 | `updateState` · spin.ts · `(P: Mat, psi: Vec) => { p: number; post: Vec \| null }` | $p = \langle\psi\lvert P\rvert\psi\rangle$; post $= P\psi/\sqrt p$ (null if p = 0) | `p = vdot(psi,P@psi).real; post = P@psi/np.sqrt(p)`; $\lvert{+z}\rangle$, $P_{+x}$: p = 0.5, post = $\lvert{+x}\rangle$ | order:b1, `l7-or-steps` |
| G11 | `jointProb` · spin.ts · `(projectors: Mat[], psi: Vec) => number` (applied in array order) | $\lVert P_k\cdots P_1\psi\rVert^2$ | `np.linalg.norm(P2@P1@psi)**2`; +z: [P+z,P+x] 0.5, [P+x,P+z] 0.25; +y: 0.25 both | compatible:b3, b7; `l7-co-joint` |
| G12 | `sequenceOutcomes` · sg.ts · `(b: { source: Bench['source']; axes: Axis[] }) => Record<string, number>` | probability of every sign path with **no** blocking, e.g. `'+-'`; oven source = ½ at the first device | product of Born probabilities along each path; `+z`, [x, z]: four paths of 0.25; `+z`, [60°, z]: p(path ends −) = 0.375 | order:b3 (p(−z) = ½ without two benches), `l7-or-tilt`, Arcade |
| G13 | `generatorAt0` · operators.ts · `(R: (phi: number) => Mat, h = 1e-6) => Mat` | $i\,\frac{R(h) - R(-h)}{2h}$ | central difference in numpy; = $S_z$ for `Rz`, = $S_x$ for `φ ↦ rotation([1,0,0], φ)` (tol 1e−8) | full-turn:b4 |
| G14 | `relativeSign` · spin.ts · `(a: Vec, b: Vec) => C` | the phase $\langle a\vert b\rangle/\lvert\langle a\vert b\rangle\rvert$ of two kets on one ray (throws if not the same ray) | $\lvert{+x}\rangle$ vs $R_z(2\pi)\lvert{+x}\rangle$ → −1; vs $R_z(4\pi)\lvert{+x}\rangle$ → +1; 8 quarter turns about x on +z → +1 | Arcade golf "truly home" verdict, full-turn claims |

**Not needed (already in the engine):** the SO(3) image of a turn is `belt.ts` `qrotate(axisAngle(n, φ), r)`
(Reference B check); `expm2` covers the exponential; `benchTheory` covers kept-path sequences; `measure` covers
2×2 eigenbasis measurements.

**Stage-contract wishes (via W as additive fields; no beat above depends on them):**
- `BlochState.readouts?: ('averages' | 'spreads' | 'bound')[]`: DOM readouts of ⟨S_j⟩, ΔS_j and product vs bound,
  computed by the resolver with G4–G6. Today the captions carry these numbers.
- `BlochState.dropLines?: ('x' | 'y' | 'z')[]`: the segment from the point to an axis, whose length × ħ/2 is ΔS_j
  (the `l7-spreads:b8` picture). An anchor id `drop-x` etc. would go with it.
- `OperatorState.commutator?: boolean`: draw $-i[A,B]$ (Hermitian; arrow $2\,\vec a\times\vec b$) instead of the sum
  $A + B$ that `add` draws now, so `l7-compatible:b4` can show $S_z$ appearing from $S_x$ and $S_y$.
- `lab-r3` two-bench tags: include the kept sign ("x(+) → z" vs "x(−) → z") when two benches differ only in
  `keep`; today `benchName` would show "x → z" twice.

## 9. Hooks

### 9.1 Lecture fields (`L7.ts`)
- `title`: "Rotations, compatible measurements and uncertainty" (already in `COURSE_LECTURES`).
- `prerequisites` (concept ids): `bloch-sphere`, `rz`, `born-rule`, `projectors`, `expectation`, `spin-matrices`, `order`.
- `outcomes` (learner's words):
  1. I can explain why opposite points on the Bloch sphere are orthogonal states, and compute the angle between two state rays.
  2. I can say why a 360° turn returns $-|\psi\rangle$ and why only 720° returns $|\psi\rangle$.
  3. I can predict how swapping two measurements changes the results, and when it cannot.
  4. I can test two observables for compatibility with a commutator, and compute $[S_x, S_y]$.
  5. I can read all three spin spreads off the Bloch vector.
  6. I can derive and check $\Delta S_x\Delta S_y \ge \tfrac{\hbar}{2}|\langle S_z\rangle|$, and say what it does not mean.
- `corrections`: E1 (Townsend Example 1.2) if the user agrees that book errata go in the lecture's box (§11 Q3);
  otherwise it stays as the note on `l7-spreads:b6`.
- `symbols`: seed the lint with every "same beat" row of §6.

### 9.2 Concept map (`concepts.ts`)
- Covered, with their chapter links: `full-turn` → `unit: 'l7-full-turn'` · `commutators` → `unit: 'l7-compatible'` ·
  `uncertainty` → `unit: 'l7-uncertainty'`.
- Proposed additions (both first taught in L7's notes; no cycle, nothing builds on a later lecture):
  - `{ id: 'ray-angle', label: 'State rays: half the Bloch angle', lecture: 'L7', unit: 'l7-two-angles', needs: ['bloch-sphere', 'inner-product'] }`
  - `{ id: 'bloch-spreads', label: 'Spin spreads from the Bloch vector', lecture: 'L7', unit: 'l7-spreads', needs: ['expectation', 'bloch-sphere'] }`
  - and `uncertainty.needs` gains `'bloch-spreads'`.
- `l7-order` gets no concept of its own: it is a second pass over `order` (L1) and `born-rule` (L3).
- Judge note: `concepts.ts` places `expectation` in L4, but L3 pp.15–16 teach ⟨A⟩ = ⟨ψ|A|ψ⟩ and the variance
  (the L3 plan's `l3-spread`). If the judge adopts the L3 plan, move `expectation` to L3 (the "nothing builds on a
  later lecture" test still passes).

### 9.3 Arcade: one level per unit (all verdicts from the engine; values checked with the scratch script)

| Unit | Game | Level |
|---|---|---|
| `l7-two-angles` | Spot the error | **"The long way round"**. Steps: (1) Two equatorial states sit at φ₁ = 10° and φ₂ = 350°. (2) Their Bloch separation is 350° − 10° = 340°. (3) So η = Δφ/2 = 170°. (4) So the two states are nearly orthogonal. `wrong: 1`. Why: the separation is the smaller angle, 20°, so η = 10° and the overlap probability is cos² 10° ≈ 0.970 (`prob(eq(10°), eq(350°))`). |
| `l7-full-turn` | Bloch golf | **"Truly home"**: start `+z`, target `+z`, par 8, `minMoves: 8`, solution eight quarter turns about +x. Needs one game change: a `sign: 1` target checked with G14 `relativeSign(start, final)` (+1 after 8 quarter turns, −1 after 4: `expectation` of the product = +1 and −1). Hint: "Four quarter turns bring the arrow back. Do they bring the ket back?" Why: 360° gives −|ψ⟩; 720° gives +|ψ⟩. Also retarget the existing `full-turn` level (4 moves) from `unit:'rotations'` to `l7-full-turn`; the other four `ROT` levels train L6's rotation unit. Fallback without a game change: a Spot-the-error round "the arrow is back, so the ket is back". |
| `l7-order` | Route the beam | **"Three sixteenths"**: source `+z`, target `{spot:'minus', fraction:3/16, label:'3/16'}`, `maxDevices: 2`, start `{axes:['z'], keep:[]}` (gives 0), solution `{axes:[60,'z'], keep:['+']}` (`benchTheory` minus = 0.1875; a 120° tilt keeping − also works). Hint: "With z first, no $\|{+z}\rangle$ atom ever lands −. What first magnet makes the z answer uncertain without halving it?" Why: ¾ pass the 60° magnet as $\|{+\hat n}\rangle$, and ¼ of those land −z. |
| `l7-compatible` | Spot the error | **"Commuting means certain?"** Steps: (1) $S_z$ and $I + 4S_z$ commute. (2) So they share the eigenbasis $\|{\pm z}\rangle$. (3) So measuring either one on $\|{+x}\rangle$ gives a certain result. (4) So $\|{+x}\rangle$ has zero spread in both. `wrong: 2`. Why: $\|{+x}\rangle$ is a superposition of the shared eigenstates, so both are 50/50 (`sd(SZ, KET['+x'])` = 0.5); commuting means the order cannot matter, not that the results are certain. |
| `l7-spreads` | Spot the error | **"The shrinking spread"**. Steps: (1) Prepare $\|{+z}\rangle$ and measure $S_x$ on many copies. (2) Each reading is ±ħ/2, half the time each. (3) With 10 000 atoms, $\Delta S_x$ shrinks to ħ/200. (4) So with enough atoms $S_x$ becomes definite. `wrong: 2`. Why: ħ/(2√N) = 0.005ħ is the error of the average; the spread of single readings stays ħ/2 (`sd(SX, KET['+z'])` = 0.5). |
| `l7-uncertainty` | Spot the error | **"A zero floor"**. Steps: (1) In $\|{+x}\rangle$, $\langle S_z\rangle = 0$. (2) So $\langle[S_x,S_y]\rangle = i\hbar\langle S_z\rangle = 0$. (3) A zero average commutator means $S_x$ and $S_y$ commute. (4) So both have definite values in $\|{+x}\rangle$. `wrong: 2`. Why: $[S_x,S_y] = i\hbar S_z$ is a nonzero operator; only its average vanishes here. $S_x$ is definite but $S_y$ is a fair coin (`sd(SY, KET['+x'])` = 0.5). |

### 9.4 Navigation copy (P-owned strings for W)
- Chapter cards: "01 / 06 · Sphere angles are twice state angles" … "06 / 06 · A floor under the product of spreads".
- Opener placement: belt film between card 01 and card 02 (§0).
- End-of-lecture fork (L7 is the last lecture): "Play the L7 levels in the Arcade" · "See how the course fits
  together on the Concept map" · "Back to Lecture 1: where the order of measurements first mattered" (→ `l1-logic`).
- Help: every L7 walkthrough routes back to its challenge and chapter by construction (Phase 4a).

## 10. Fidelity notes per stage kind

Existing items in `content/fidelity.ts` are reused by id; new items (L7 needs) are proposed with an id, a class
(exact / schematic / misleading on purpose) and a student-facing sentence. Every beat above that relies on one
lists it in `fidelity`.

### `bloch` (used in all six units)
- Gets right: every pure state is one point (`bloch-one-point`); $P(+) = \tfrac{1+\hat n\cdot\vec r}{2}$ along any
  measure axis (`bloch-born`); a turn $R_z(\varphi)$ moves the point by exactly φ, because the resolver applies the
  engine's matrix.
- Distorts: angles are doubled (`bloch-double-angle`); a global phase is invisible (`bloch-global-phase-hidden`).
- New:
  - `bloch-sign-hidden` (misleading on purpose): "After a 360° turn the point is back where it started, but the ket is $-|\psi\rangle$. The sphere cannot show that sign; the Hopf view can."
  - `bloch-trail-not-phase` (misleading on purpose): "The trail shows where the point went, not what happened to the phase. A closed trail does not mean the ket is back."
  - `bloch-spread-distance` (exact): "Each spread is geometry: $\Delta S_j$ is ħ/2 times the distance from the point to the j axis."
  - `bloch-fresh-copies` (schematic): "A spread or a probability here refers to many fresh copies of the state. The sphere never shows one atom being measured twice."

### `hopf` (`l7-full-turn:b3`, `b8` reveal)
- Gets right: each circle is one ray, i.e. one physical state with all its phases (`hopf-fiber-state`); the small
  sphere is exact (`hopf-mini-exact`).
- Distorts: $S^3$ is flattened by stereographic projection (`hopf-flattened`, `hopf-distances-distorted`);
  brightness only separates circles (`hopf-brightness`).
- New: `hopf-turn-half` (exact): "Under $R_z(\varphi)$ the bead moves along its circle by half the turn. After 360° it sits on the opposite side ($-|\psi\rangle$); after 720° it is home." (Consistent with the `HopfState.marked` contract in `stage.ts`.)

### `hilbert-plane` (`l7-two-angles:b5`)
- Gets right: for real states the drawn angle is the true ray angle (`plane-angles-true`); squared shadows are
  probabilities (`plane-shadow-born`).
- Distorts: only the real slice exists, so $|{+y}\rangle$ has no arrow (`plane-real-slice`, the clue's point); each
  state appears twice, as $\pm$ (`plane-sign-twice`); angles are half of lab and sphere angles (`plane-half-angles`).

### `bloch-ball` (`l7-order:b1`, `b5`, `b6` reveal; `l7-compatible:b7`)
- Gets right: surface points are pure states (`ball-surface-pure`); probabilities along a measure axis
  (`ball-born-inside`).
- L7 uses only surface points; the ball is chosen because its `update: 'selective'` transition exists.
- New: `ball-update-cut` (schematic): "The jump from one point to another after a measurement is the update rule, not a motion. Nothing travels between the two points."

### `lab-r3` (`l7-order:b2`–`b4`, `b6`; `l7-compatible:b3`; `l7-spreads:b1`, `b4`; `l7-uncertainty:b7`)
- Gets right: every fraction and blocked share is the exact Born prediction (`lab-born-fractions`); magnet tilts
  are the real angles (`lab-tilt-real`).
- Distorts: state chips are captions, not places (`lab-chips-captions`); an atom is drawn choosing a beam
  (`lab-both-paths`).
- New: `lab-kept-branch` (misleading on purpose): "A beam stop hides one branch. When the text adds both branches (for example $p(-z) = ½$ after an x measurement), the bench shows one kept branch and the caption supplies the other." (Retire it if engine gap G12 and an unblocked bench land.)

### `operator-space` (`l7-full-turn:b4`; `l7-compatible:b1`, `b2`, `b4`, `b6`, `b8`)
- Gets right: each Hermitian 2×2 matrix is one arrow plus a gauge (`op-one-point`); eigenstates along ±$\hat a$;
  $\vec a = 0$ is the fully degenerate case.
- Distorts: four dimensions drawn as arrow + gauge (`op-four-dimensions`); arrow length is half the eigenvalue gap
  (`op-length-not-size`).
- New:
  - `op-sum-not-commutator` (misleading on purpose): "With two operators on stage, the third arrow is their sum $A + B$. The commutator of $S_x$ and $S_y$ points along z and is not drawn."
  - `op-parallel-commute` (exact): "Two arrows on one line (same or opposite direction) are commuting observables. Any angle between them makes the commutator nonzero, in proportion to the sine of that angle."

### Chapter opener: belt film
Its fidelity lives in `OPENERS.belt.fidelity` (exact: the frame of every belt piece, twist counts; distorted: the
belt's path and length). Nothing to add; the unit's beats carry the claims, as the film states none.

## 11. Questions for the user

**Q1. What is on page 14 of `Lecture_7.pdf`?** The footers read "n / 14", but the file has 13 pages. Page 13 ends
half-empty after Reference B's checkpoint box, and nothing in pages 1–13 points past Reference B (the overview
names only References A and B; p.11 closes with the instructor's source note). The other lectures' last pages are
instructor material: L3 and L4 end with "source alignment" pages, L5 with a board reference, and L6 with the very
Reference B that L7 repeats. So page 14 is most likely an instructor reference page, but it could be a problem set.
*Why it matters:* if it has homework, those items must be marked `assigned: 'L7 p.14'` (hints only, no
walkthrough), and none of the L7 notes' 13 pages has any. Nothing else in this plan depends on it.
*Recommendation:* please share page 14 (or confirm it is instructor-only); L7 can be built without it and patched later.

**Q2. References A and B are "outside the 75-minute plan". Should the story include them?** The notes say neither
adds board work. This plan keeps Reference A as one lecture beat (`l7-uncertainty:b5`, the proof without
Cauchy–Schwarz) and Reference B as two short recap beats (it is L6's page anyway).
*Recommendation:* keep them, captioned "Reference A/B — outside the class plan", so a student can skip them.
The alternative is to show them only in Read mode.

**Q3. Book errata: in the lecture's corrections box, or only beside the book beat?** Townsend Example 1.2 credits
the 75 % to the wrong outcome (§7.2 E1). The corrections box was designed for errors in the course notes.
*Recommendation:* one "In the textbook" line in the same box, worded as respectfully as the L1 entries, plus the
note on `l7-spreads:b6`.

### Notes recorded for the orchestrator (not user questions)

- **Ownership rule (orchestrator, 2026-09-27), applied.** A concept is introduced once, in the first lecture whose
  notes teach it; later lectures do a second pass, not a re-definition. Hence: `l7-spreads` opens with a link-back
  beat to `l3-spread` (L3 pp.15–17 introduce ⟨A⟩ and the variance) and does not re-define them; L7 teaches what
  its notes add (spin spreads read off $\vec r$, preparation spread vs disturbance vs error of an average, the
  uncertainty relation). Commutators stay in L7: L5 p.14's handoff places them in L6, but L6's notes contain none
  and defer the uncertainty relation (§7.4). The same rule turned seven more beats into link-backs (L6 Bloch sphere
  and $R_z$ + generator, L6's Reference B, L1's half-angle, L3–L4's update rule) and moved ten glossary terms to
  their owning lectures (§4).
- **Rosetta must match P-L6.** L6's notes also write θ for the equatorial angle and $R_z(\phi)$ for the turn. This
  plan keeps θ polar, φ as the azimuth (subscripted for a position) and $R_z(\varphi)$ for a turn. If P-L6 chooses
  differently, one of the two plans must change so the course uses one convention. The uncommitted `PhaseDial`
  change (θ → φ for the relative phase) already follows this plan's choice (§7.5 A3).
- **Judge checks worth repeating:** the engine hazard A1 (`expectation` drops imaginary parts, so Robertson claims
  must use a complex expectation, G3); the `expectation` concept sits in L4 in `concepts.ts` but L3 teaches it;
  the Arcade `ROT` placeholder unit id (A2).
