# P-L6 — Lecture 6 story plan: basis changes, the Bloch sphere, rotations

Proposal only (role P). Nothing under `app/` is modified. Template: `P2-L1-story.md`.

**Conventions used below.**
- Beat id = `<unit>:b<n>`. Phase tag **[L]** lecture says, **[B]** books add, **[C]** clue. Order within a unit is L → B → C.
- Engine conventions (locked): ħ = 1 inside the engine, $S = \sigma/2$, the UI appends ħ. $|{+y}\rangle = (1, i)/\sqrt2$.
  $R_z(\varphi) = \mathrm{diag}(e^{-i\varphi/2}, e^{i\varphi/2})$. Eigenvectors: first component real ≥ 0. Bloch angles: θ polar from +z, φ azimuth from +x toward +y.
- **Notation rename (see §6 and Q1).** The notes call the equatorial angle θ and the rotation angle ϕ. θ is the app's *polar* angle, so the notes' equatorial θ becomes the azimuth **φ**. The rotation angle keeps the name **φ** in $R_z(\varphi)$, as in the notes, Townsend, the engine, the widgets and the concept map. When a state's starting azimuth and a rotation appear together, the start is written **φ₀**, and a turn by φ carries it to φ₀ + φ. The global phase is **χ** (as in `hopf.ts`).
- Basis sets used in claims: `X = [KET['+x'], KET['-x']]`, `Y = [KET['+y'], KET['-y']]`. `basisMatrix(X)` is $B_{z\leftarrow x}$ (columns = new kets in old coordinates). `toBasis(ψ, X)` is $B_{x\leftarrow z}\psi_z$, and `operatorInBasis(A, X)` is $B_{x\leftarrow z}AB_{z\leftarrow x}$.
- `D = Math.PI/180`. `diag(φ)` below means `mat([[1,0],[0,expi(φ)]])` (linalg `mat` + complex `expi`), and `maxDiff(A,B)` is the largest entry-wise |A − B| (engine gap G1, §8).
- **Every value quoted in this file was computed by running the real engine** (`app/src/physics/*.ts`, bundled in a scratch file). Values are rounded to 4 d.p. Claim keys are written `k:<name>`, ready for `L6.values.ts`, where `make_claim_fixtures.py` recomputes each key with numpy.
- **Scope rules applied.** (1) *Ownership (orchestrator note, 2026-09-27; P-L5 plan).* L5 owns everything L6 pp. 2–6 repeat: the coherence formulas, the basis-change matrix $B_{z\leftarrow x}$ with its arrow convention (`l5-coordinates:b3`), $A^{(x)} = B_{x\leftarrow z}A^{(z)}B_{z\leftarrow x}$, diagonalization, the $S_y$ check, Townsend's other phase, and invariance (`l5-coordinates`, `l5-operators`, `l5-invariance`). L6 gives this material **one link-back beat** (`l6-active:b1`) and then only what is new, namely passive vs active and the $B_{z\leftarrow x} = i\,R_{\hat m}(180^\circ)$ link (`l6-active:b8`, L5 E6). An earlier draft of this plan had a separate unit `l6-arrows`; it was removed, and its beats, Try-it, challenges and glossary entries now live in L5. (2) §6.3, "recognizing the generator", is planned in full here. L7 §7.3 only recaps it. (3) **The 360° sign is not planned anywhere in L6.** Every rotation on stage stays ≤ 180°. The one clue that brushes the topic (`l6-active:b7`) only slides the Hopf bead by −φ/2 with φ ≤ 180°. (4) The notes set no homework (no problems in L6), so nothing is marked *assigned*.
- Rosetta: lecture ↑/↓ = app $|{\pm z}\rangle$; Susskind $|u\rangle, |d\rangle, |r\rangle, |l\rangle, |i\rangle, |o\rangle$ = $|{+z}\rangle, |{-z}\rangle, |{+x}\rangle, |{-x}\rangle, |{+y}\rangle, |{-y}\rangle$. Susskind's $\sigma_n$ = $2S_n/\hbar$. Townsend's $\hat J_z$ (generator) = $S_z$ for spin ½.

## 0. Lecture map

Source: `Lecture_6.pdf`, 13 pages; the footers print "n / ??" (see §7 E6). Teaching plan p.1: recap 8 min · finish L5 25 min · Bloch sphere 10 min · rotations and generator 20 min · recap 2 min · buffer 10 min. Page 13 is marked as reference material, outside the 75 minutes. Townsend printed page = PDF page − 16.

| # | Unit id | Title (≤ 8 words) | Question | Source pages | Book refs |
|---|---|---|---|---|---|
| 1 | `l6-bloch` | Three averages make a point | How can one picture hold every pure spin state? | L6 p. 7 (+ scope note p. 1) | Susskind §2.5 (counting parameters), §3.8 (spin-polarization principle; the notes cite printed pp. 90–91; first met in `l5-averages:b7`); Townsend Problem 1.3, p. 26 |
| 2 | `l6-equator` | Relative phase sets the longitude | If $\lvert{\pm x}\rangle$ and $\lvert{\pm y}\rangle$ all give 50/50 along z, what tells them apart? | L6 pp. 7–8 | Townsend §1.5, pp. 18–20 ($\lvert{+y}\rangle$, handedness); §1.6, p. 25 (relative phase matters); Susskind §2.4 (Exercise 2.3) |
| 3 | `l6-active` | Turn the state, keep the axes | What matrix turns a spin state about z, and how is that different from changing basis? | L6 pp. 2–6 (one link-back to L5 pp. 8–14), 9–10, 12, 13 (reference page) | Townsend §2.2, pp. 33–35 and 37–41 (eqs. 2.25–2.28, Fig. 2.3, eqs. 2.41–2.42, Example 2.2); §2.5, pp. 52–54 (active vs passive, Fig. 2.9) and p. 57 (Ex. 2.5: S is not $R_y(90^\circ)$) |
| 4 | `l6-generator` | $S_z$ generates the turn | Why is $R_z(\varphi) = e^{-i\varphi S_z/\hbar}$, and what job does $S_z$ do in it? | L6 pp. 11–12 | Townsend §2.2, pp. 36–37 (eqs. 2.29–2.32, footnote 5); Susskind §4.5 (small-step evolution), §4.11 (spin in a field) |
| 5 | `l6-mixture` | Superposition or mixture? (beyond the lecture) | Can a beam of mixed atoms ever act like one pure state? | none (the notes say "pure states here", p. 7); follows the L1 teaser (decision L1 #6) | Townsend §5.7, pp. 171–178 (density operator, Example 5.5 and its caution, Fig. 5.11); Susskind §7.3 (density matrices) |

Lecture order vs notes order: the notes open with 25 minutes finishing L5 (pp. 2–6). Here that time is one link-back beat, and it sits at the head of `l6-active`, where the passive/active contrast needs it. A learner coming straight from L5 still meets the Bloch sphere first, as in the notes' teaching plan.

Concept ids (`concepts.ts`): `bloch-sphere` ← units 1–2 · `passive-active` ← unit 3 · `rz` ← units 3–4. Unit 5 carries the `beyondLecture` badge and adds no concept id (Q3).

Beat count: 8 + 8 + 8 + 8 + 6 = **38 beats** (19 lecture, 12 books, 7 clue beats with click-to-reveal; 6 of the books beats are the beyond-the-lecture `l6-mixture` unit and `l6-generator:b7`).

## 1. Story beats per unit

Format per beat: **Text** (core, ≤ 3 sentences) · **Stage** (kind + real `stage.ts` fields; a sweep is written `sweep(a,b)` as in `L1.story.ts`) · **Caption** · **Claims** (`k:key` — statement — engine call → value) · optional **Links** (term → `stageVocab` anchor), **Fidelity** ids (existing ids from `fidelity.ts`; new ones in §10) and **Refs**. Clue beats also give **Reveal** text and **Reveal stage** (absent means the picture stays).

Shared states: `ψ60 = ketFromBloch(60*D, 0)` = (0.8660, 0.5000), the real state of `l6-active` (the same as L5's `psi30`, so the link-back beat reuses L5's picture). `ψ★ = ketFromBloch(60*D, 45*D)` = (0.8660, 0.3536 + 0.3536i), the generic state of `l6-bloch` and the `AmplitudeBars` default. `ψ45 = ketFromBloch(90*D, 45*D)` = (0.7071, 0.5 + 0.5i), the notes' "halfway" state.

### Unit `l6-bloch` — Three averages make a point

**`l6-bloch:b1` [L]**
- Text: "From any state we can compute three averages, $\langle S_x\rangle$, $\langle S_y\rangle$ and $\langle S_z\rangle$. Multiply them by $2/\hbar$ and use them as coordinates: $\vec r = \tfrac{2}{\hbar}(\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle)$ is the [[bloch-vector|Bloch vector]]. For the state on stage, $\vec r = (0.612,\ 0.612,\ 0.500)$."
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 45 }, shot: 'B-STD' }`.
- Caption: "$\langle S_x\rangle = \langle S_y\rangle = 0.306\hbar$, $\langle S_z\rangle = 0.250\hbar$"
- Claims:
  - `k:rStar`: `blochVector(ψ★)` → (0.6124, 0.6124, 0.5000).
  - `k:avgStar`: `expectation(SX, ψ★)` → 0.3062, `expectation(SY, ψ★)` → 0.3062, `expectation(SZ, ψ★)` → 0.2500.
- Links: $\vec r$ → `point` · $\langle S_x\rangle$ → `x` · $\langle S_y\rangle$ → `y` · $\langle S_z\rangle$ → `z`.
- Fidelity: `bloch-one-point`, `bloch-axes-unitless`.

**`l6-bloch:b2` [L]**
- Text: "Lecture 5 found the averages from the amplitudes of $\psi_z = (\alpha, \beta)$: $\langle S_x\rangle = \hbar\,\mathrm{Re}\,\alpha^*\beta$, $\langle S_y\rangle = \hbar\,\mathrm{Im}\,\alpha^*\beta$ and $\langle S_z\rangle = \tfrac\hbar2(|\alpha|^2 - |\beta|^2)$. Scaled by $2/\hbar$ they give $\vec r = (2\,\mathrm{Re}\,\alpha^*\beta,\ 2\,\mathrm{Im}\,\alpha^*\beta,\ |\alpha|^2 - |\beta|^2)$. Here $\alpha^*\beta = 0.306 + 0.306i$ and $|\alpha|^2 - |\beta|^2 = 0.75 - 0.25$."
- Second pass: this is the one link-back to `l5-averages:b2–b4`, which own the coherence formulas. What is new here is only the scaling that turns them into coordinates.
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 45 } }`.
- Caption: "$2\alpha^*\beta = 0.612 + 0.612i$ → $(r_x, r_y)$ · $0.75 - 0.25 = r_z$"
- Claims:
  - `k:abStar`: `mul(conj(ψ★[0]), ψ★[1])` → 0.3062 + 0.3062i.
  - `k:pzStar`: `prob(KET['+z'], ψ★)` → 0.7500, and `prob(KET['-z'], ψ★)` → 0.2500.
- Links: $\alpha^*\beta$ → `equator` (its shadow on the equatorial plane) · $|\alpha|^2 - |\beta|^2$ → `z`.

**`l6-bloch:b3` [L]**
- Text: "Every pure state lands at distance 1 from the centre: $|\vec r|^2 = 4|\alpha|^2|\beta|^2 + (|\alpha|^2 - |\beta|^2)^2 = (|\alpha|^2 + |\beta|^2)^2 = 1$. So the states cover the surface of a unit sphere, the [[bloch-sphere|Bloch sphere]]. For our state, $0.75 + 0.25 = 1$."
- Stage: `bloch` `{ state: { thetaDeg: sweep(0, 180), phiDeg: 45 }, trail: true }`. The trail draws a half great circle that stays on the surface.
- Caption: "$4|\alpha|^2|\beta|^2 = 0.75$ and $(|\alpha|^2 - |\beta|^2)^2 = 0.25$"
- Claims:
  - `k:unitSphere`: `Math.hypot(...blochVector(ketFromBloch(θ, 45*D)))` → 1 for θ ∈ {0°, 30°, …, 180°}.
  - `k:unitParts`: `4*prob(KET['+z'],ψ★)*prob(KET['-z'],ψ★)` → 0.75 and `(0.75−0.25)²` → 0.25. Both come from `prob`.

**`l6-bloch:b4` [L]**
- Text: "Now place the six states we know. $|{\pm z}\rangle$ land on the poles $(0, 0, \pm1)$, $|{\pm x}\rangle$ at $(\pm1, 0, 0)$ and $|{\pm y}\rangle$ at $(0, \pm1, 0)$ on the equator. Each pair of opposite points is a pair of orthogonal states."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: sweep(0, 270) }, trail: true, shot: 'B-STD' }`. The point visits +x → +y → −x → −y; the poles are labelled by the axis anchors.
- Caption: "poles: $|{\pm z}\rangle$ · equator: $|{\pm x}\rangle$, $|{\pm y}\rangle$"
- Claims:
  - `k:sixPoints`: `blochVector(KET[k])` → (0,0,±1), (±1,0,0), (0,±1,0) for the six named kets.
- Links: $|{\pm z}\rangle$ → `z` · $|{\pm x}\rangle$ → `x` · $|{\pm y}\rangle$ → `y`.
- Fidelity: `bloch-double-angle`.

**`l6-bloch:b5` [L]**
- Text: "The three coordinates are averages over many atoms, not three readings of one atom. A single atom sent through any magnet still gives $+\hbar/2$ or $-\hbar/2$; for this state a z magnet sends 75 % of the atoms up. We treat [[pure-state|pure states]] only, so every point used here lies on the surface."
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 45 }, measure: 'z' }`.
- Caption: "along z: $P(+) = \tfrac{1 + r_z}{2} = 0.75$"
- Claims:
  - `k:pzRule`: `probUpAlong([0,0,1], blochVector(ψ★))` → 0.7500, equal to `prob(KET['+z'], ψ★)`.
- Links: "75 %" → `axis-n`.
- Fidelity: `bloch-born`.

**`l6-bloch:b6` [B]**
- Text: "Susskind (§2.5) counts. Two complex amplitudes are four real numbers. Normalization removes one and the unobservable overall phase removes another, which leaves two, exactly the two angles that fix a direction in space."
- Stage: `bloch` `{ state: { thetaDeg: sweep(20, 160), phiDeg: sweep(0, 300) }, trail: true }`. The trail spirals over the sphere.
- Caption: "2 numbers left: the polar angle θ and the azimuth φ"
- Claims:
  - `k:twoAngles`: `blochAngles(ψ★)` → { θ: 60°, φ: 45° }. Two numbers recover the state up to phase: `samePhysicalState(ketFromBloch(60*D,45*D), ψ★)` → true.
- Refs: Susskind §2.5 "Counting parameters".

**`l6-bloch:b7` [B]**
- Text: "Lecture 5 met Susskind's principle (§3.8): every spin state gives + with certainty along some axis, its [[spin-polarization|polarization]] direction. On the sphere that axis has a picture: it is $\vec r$ itself, so a magnet along $\vec r$ passes every atom. Townsend (Problem 1.3) writes the state along $\hat n(\theta, \varphi)$ as $\cos\tfrac\theta2|{+z}\rangle + e^{i\varphi}\sin\tfrac\theta2|{-z}\rangle$."
- Second pass: `l5-averages:b7` owns the principle and its sum of squares. New here: the axis is the point's own direction, and Townsend's general $|{+n}\rangle$.
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 45 }, measure: { thetaDeg: 60, phiDeg: 45 } }`.
- Caption: "magnet along $\vec r$: $P(+) = 1$"
- Claims:
  - `k:polarization`: `prob(ketAlong(blochVector(ψ★)), ψ★)` → 1, and `expectation(spinAlong(blochVector(ψ★)), ψ★)` → 0.5 (= ħ/2).
  - `k:townsendN`: `ketFromBloch(60*D, 45*D)` → (0.8660, 0.3536 + 0.3536i) = (cos 30°, e^{i45°} sin 30°).
- Refs: Susskind §3.8 (the notes give printed pp. 90–91); Townsend Problem 1.3, p. 26, Fig. 1.11. This is a book exercise, not course homework.

**`l6-bloch:b8` [C]**
- Question (text): "$|{+z}\rangle$ and $|{-z}\rangle$ sit at opposite poles. Is $|{-z}\rangle$ just the vector $-|{+z}\rangle$?"
- Stage: `bloch` `{ state: '-z', path: 'geodesic' }`, arriving from the north pole.
- Reveal: "No. $-|{+z}\rangle$ is $|{+z}\rangle$ times an overall sign, so it sits on the north pole too. $|{-z}\rangle$ is orthogonal to $|{+z}\rangle$: 90° apart as vectors, 180° apart on the sphere. Angles on the sphere are twice the angles between state vectors."
- Reveal stage: `{ layout: 'split', top: { kind: 'bloch', state: '-z' }, bottom: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '-z', role: 'second' }, { ket: { neg: '+z' }, role: 'ghost', badge: 'same state as |+z⟩' }], rightAngle: true } }`.
- Claims:
  - `k:zOrth`: `inner(KET['+z'], KET['-z'])` → 0.
  - `k:negSame`: `samePhysicalState(KET['+z'], vscale(KET['+z'], -1))` → true, and `blochVector(vscale(KET['+z'], -1))` → (0, 0, 1).
- Fidelity: `bloch-double-angle`, `plane-bloch-doubles`, `plane-sign-twice`.

### Unit `l6-equator` — Relative phase sets the longitude

**`l6-equator:b1` [L]**
- Text: "In z coordinates the four equatorial states are $|{\pm x}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle \pm |{-z}\rangle)$ and $|{\pm y}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle \pm i|{-z}\rangle)$. A z magnet splits every one of them 50/50. The only difference is the factor on $|{-z}\rangle$ relative to $|{+z}\rangle$: $1$, $i$, $-1$ or $-i$, its [[relative-phase|relative phase]]."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: sweep(0, 270) }, measure: 'z', trail: true, shot: 'B-STD' }`.
- Caption: "along z: $P(+) = 0.5$ at every stop"
- Claims:
  - `k:equatorHalf`: `prob(KET['+z'], KET[k])` → 0.5 for k ∈ {+x, +y, −x, −y}.
  - `k:relPhases`: `blochAngles(KET[k]).phi / D` → 0, 90, 180, −90 for +x, +y, −x, −y.
- Links: relative phase → `equator` · 50/50 → `axis-n`.

**`l6-equator:b2` [L]**
- Text: "Halfway from +x to +y the Bloch vector is $\vec r = (\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}, 0)$. Its state is $\tfrac{1}{\sqrt2}|{+z}\rangle + \tfrac{1+i}{2}|{-z}\rangle$, so compared with $|{+x}\rangle$ the $|{-z}\rangle$ part carries an extra factor $\tfrac{1+i}{\sqrt2}$. That factor has size 1, so the z outcomes stay 50/50."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: 45 }, shot: 'B-POLE' }`.
- Caption: "$\beta = 0.5 + 0.5i$, $|\beta|^2 = 0.5$"
- Claims:
  - `k:psi45`: `ketFromBloch(90*D, 45*D)` → (0.7071, 0.5000 + 0.5000i).
  - `k:psi45r`: `blochVector(ψ45)` → (0.7071, 0.7071, 0).
  - `k:unitFactor`: `abs(c(Math.SQRT1_2, Math.SQRT1_2))` → 1, and `prob(KET['+z'], ψ45)` → 0.5.

**`l6-equator:b3` [L]**
- Text: "Check the position with the averages. Here $\alpha^*\beta = \tfrac{1+i}{2\sqrt2}$, so $\langle S_x\rangle = \langle S_y\rangle = \tfrac{\hbar}{2\sqrt2} \approx 0.354\hbar$ and $\langle S_z\rangle = 0$. Equal x and y parts put the point at 45° on the equator."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: 45 }, shot: 'B-POLE' }`.
- Caption: "$\langle S_x\rangle = \langle S_y\rangle = 0.354\hbar$, $\langle S_z\rangle = 0$"
- Claims:
  - `k:avg45`: `expectation(SX, ψ45)` → 0.3536, `expectation(SY, ψ45)` → 0.3536, `expectation(SZ, ψ45)` → 0.
  - `k:ab45`: `mul(conj(ψ45[0]), ψ45[1])` → 0.3536 + 0.3536i.

**`l6-equator:b4` [L]**
- Text: "Now take any angle φ, measured from +x toward +y. We need $\vec r = (\cos\varphi, \sin\varphi, 0)$, which forces $\alpha^*\beta = \tfrac12 e^{i\varphi}$ and $|\alpha|^2 = |\beta|^2 = \tfrac12$. Choosing $\alpha = \tfrac{1}{\sqrt2}$ gives $|\psi(\varphi)\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\varphi}|{-z}\rangle)$: the relative phase *is* the longitude."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: sweep(0, 360) }, trail: true, shot: 'B-POLE' }`. This sweeps the *state formula*, not a rotation: at 360° the formula returns the very same vector, and nothing here uses $R_z$.
- Caption: "the notes call this angle θ; in this app it is the azimuth φ"
- Claims:
  - `k:equatorAny`: `blochVector(ketFromBloch(90*D, 120*D))` → (−0.5000, 0.8660, 0).
  - `k:azimuthIsPhase`: `blochAngles(ketFromBloch(90*D, φ)).phi` = φ for φ ∈ {0°, 45°, …, 180°}; `arg(β/α)` = φ.
- Fidelity: `bloch-double-angle` (the equator is still a doubled picture: $|{+x}\rangle$ and $|{-x}\rangle$ are 180° apart here, 90° apart as vectors).

**`l6-equator:b5` [B]**
- Text: "Townsend (§1.5) derives $|{+y}\rangle$ from 50/50 data alone. The data fix its relative phase against $|{+x}\rangle$ only as $\pm 90^\circ$, and picking $+i$ amounts to picking right-handed axes. Shifting the relative phase of $|{+x}\rangle$ by 90° gives $|{+y}\rangle$ (his §1.6)."
- Stage: `bloch` `{ state: '+y', path: { about: 'z' } }`, arriving from +x along the equator.
- Caption: "$|{+x}\rangle \to |{+y}\rangle$: relative phase $0 \to 90^\circ$"
- Claims:
  - `k:yFromPhase`: `samePhysicalState(ketFromBloch(90*D, 90*D), KET['+y'])` → true.
  - `k:yx`: `prob(KET['+y'], KET['+x'])` → 0.5.
- Refs: Townsend §1.5, pp. 18–20 (eqs. 1.23–1.31, Fig. 1.10); §1.6, p. 25 (footnote 13).

**`l6-equator:b6` [B]**
- Text: "Susskind (§2.4, Exercise 2.3) shows that for $|{+y}\rangle$ the product $\alpha^*\beta$ must be purely imaginary. On the sphere that is simply $r_x = 2\,\mathrm{Re}\,\alpha^*\beta = 0$: the point sits on the y axis. Real α and β can never do that with 50/50 odds, so complex amplitudes are forced."
- Stage: `bloch` `{ state: '+y', shot: 'B-POLE' }`.
- Caption: "$|{+y}\rangle$: $\alpha^*\beta = 0.5i$, so $r_x = 0$ and $r_y = 1$"
- Claims:
  - `k:abY`: `mul(conj(KET['+y'][0]), KET['+y'][1])` → 0.5i, and `blochVector(KET['+y'])` → (0, 1, 0).
- Refs: Susskind §2.4 ("Along the y axis"), Exercise 2.3. Rosetta: his $|i\rangle$ = our $|{+y}\rangle$.

**`l6-equator:b7` [C]**
- Question (text): "The derivation chose $\alpha = \tfrac{1}{\sqrt2}$, real and positive. Did that choice leave any states out?"
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: 120 }, globalPhaseDeg: sweep(0, 180) }`. The point must not move (readout only).
- Reveal: "No. Any other choice multiplies both amplitudes by one common factor $e^{i\chi}$. That changes the vector but not $\alpha^*\beta$ or the sizes, so the point and every prediction stay put. The Hopf picture shows the hidden circle of vectors that sits over each point."
- Reveal stage: `hopf` `{ fibers: 'one', marked: { state: { thetaDeg: 90, phiDeg: 120 }, globalPhaseDeg: sweep(0, 360) }, mini: true, shot: 'HF-FIBER' }`. The bead makes one lap of its fiber, and χ = 0° and 360° are the same vector (decision #15).
- Claims:
  - `k:globalSame`: `blochVector(vscale(ketFromBloch(90*D,120*D), c(0,1)))` → (−0.5000, 0.8660, 0), the same point as `k:equatorAny`.
  - `k:globalSameState`: `samePhysicalState(vscale(ψ(120°), expi(χ)), ψ(120°))` → true for any χ.
- Fidelity: `bloch-global-phase-hidden`, `hopf-fiber-state`, `hopf-brightness`.

**`l6-equator:b8` [C]**
- Question (text): "All four equatorial states give 50/50 along z, and so does the unpolarized oven beam. Could $|{+x}\rangle$ be an oven beam in disguise?"
- Stage: `lab-r3` `{ benches: [{ id: 'A', source: '+x', showPrep: true, devices: [{ axis: 'z' }] }, { id: 'B', source: 'oven', devices: [{ axis: 'z' }] }], shot: 'L-3Q' }`. Both plates fill 50/50.
- Reveal: "No. Turn both magnets to x: the $|{+x}\rangle$ beam goes 100 % into +, while the oven beam still splits 50/50. A state on the equator is one definite state with its own direction, and the oven beam is a [[mixture]]. The last chapter, beyond the lecture, puts both on one picture."
- Reveal stage: `lab-r3` `{ benches: [{ id: 'A', source: '+x', showPrep: true, devices: [{ axis: 'x' }] }, { id: 'B', source: 'oven', devices: [{ axis: 'x' }] }], shot: 'L-3Q' }`.
- Claims:
  - `k:plusXalongZ`: `benchTheory({source:'+x', axes:['z'], keep:[]}).plus` → 0.5, and the same bench with `source:'oven'` → 0.5.
  - `k:plusXalongX`: `benchTheory({source:'+x', axes:['x'], keep:[]}).plus` → 1.
  - `k:ovenAlongX`: `benchTheory({source:'oven', axes:['x'], keep:[]}).plus` → 0.5.
- Fidelity: `lab-born-fractions`, `lab-chips-captions`.
- Second pass: `l5-averages:b8` asked the same question for $|{+y}\rangle$, where the bench cannot answer (no magnet along the beam axis y). For $|{+x}\rangle$ the bench *can* answer, and that is what this clue adds. The full answer is `l6-mixture`.

### Unit `l6-active` — Turn the state, keep the axes

**`l6-active:b1` [L] — the one link-back to Lecture 5 (L6 pp. 2–6 ↔ `l5-coordinates`, `l5-operators`, `l5-invariance`)**
- Text: "Lecture 5 rewrote one state in new coordinates, $\psi_x = B_{x\leftarrow z}\,\psi_z$, let every operator follow as $A^{(x)} = B_{x\leftarrow z}A^{(z)}B_{z\leftarrow x}$, and found that no prediction changed. That is a [[passive-change|passive]] change: the atom is untouched and only our description moves. Today's new move is [[active-rotation|active]]: keep the z basis and change the state itself, so its point moves on the sphere."
- Stage: `{ layout: 'split', top: { kind: 'hilbert-plane', psi: { blochDeg: 60 }, basis: 'x', shadows: true }, bottom: { kind: 'bloch', state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true } }`. The top reuses L5's picture: frame turned, arrow fixed.
- Caption: "top, passive: the same arrow read in the x frame, $(0.966, 0.259)$ · bottom, active: $|{+x}\rangle$ turned 90° to $|{+y}\rangle$"
- Claims:
  - `k:passiveKeeps`: `toBasis(ψ60, X)` → (0.9659, 0.2588), and `expectation(operatorInBasis(SZ, X), toBasis(ψ60, X))` = `expectation(SZ, ψ60)` → 0.2500 (no prediction moves).
  - `k:activeMoves`: `blochVector(apply(Rz(90*D), KET['+x']))` → (0, 1, 0).
- Links: "passive" → `psi` (top) · "its point moves" → `point` (bottom).
- Fidelity: `plane-angles-true` (top), `bloch-one-point` (bottom).
- Second-pass rule: nothing from L5 is re-derived here. A "Lecture 5" chip links to `l5-coordinates:b3` (the arrow convention), `l5-operators:b5` (diagonalization) and `l5-invariance:b3` (why predictions agree). The notes' new arrow labels on pp. 2–6 are exactly the convention L5's plan already fixed.

**`l6-active:b2` [L]**
- Text: "The previous chapter showed that raising the relative phase by φ turns the point by φ around the equator, and $\mathrm{diag}(1, e^{i\varphi})$ does exactly that. An overall phase on a matrix changes no physical state, so the standard choice pulls out $e^{-i\varphi/2}$ and splits the phase evenly: $R_z(\varphi) = e^{-i\varphi/2}\begin{pmatrix}1&0\\0&e^{i\varphi}\end{pmatrix} = \begin{pmatrix}e^{-i\varphi/2}&0\\0&e^{i\varphi/2}\end{pmatrix}$. A state at longitude $\varphi_0$ goes to longitude $\varphi_0 + \varphi$."
- Stage: `bloch` `{ state: { thetaDeg: 90, phiDeg: 30 }, rotate: { axis: 'z', angleDeg: sweep(0, 60) }, trail: true, shot: 'B-POLE' }`.
- Caption: "$\varphi_0 = 30^\circ$, turn by $\varphi = 60^\circ$ → longitude $90^\circ$; the two matrices differ only by the phase $e^{-i\varphi/2}$"
- Claims:
  - `k:diagTurns`: `blochAngles(apply(diag(60*D), ketFromBloch(90*D, 30*D))).phi / D` → 90.
  - `k:RzEven`: `matEq(Rz(1), mscale(diag(1), expi(-0.5)))` → true.
  - `k:RzSameState`: `samePhysicalState(apply(Rz(60*D), ψ(30°)), apply(diag(60*D), ψ(30°)))` → true.
- Links: $\varphi_0$ → `point` (start) · $\varphi$ → `equator`.

**`l6-active:b3` [L]**
- Text: "On a state on the equator, $R_z(\varphi)\,\psi_z(\varphi_0) = e^{-i\varphi/2}\,\psi_z(\varphi_0 + \varphi)$. The point moves by φ, and an extra overall phase comes along that no measurement can see. For $|{+x}\rangle$ and $\varphi = 90^\circ$ the result is $e^{-i\pi/4}|{+y}\rangle$, physically just $|{+y}\rangle$."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true, shot: 'B-POLE' }`.
- Caption: "$\langle{+y}|R_z(90^\circ)|{+x}\rangle = e^{-i\pi/4} = 0.707 - 0.707i$"
- Claims:
  - `k:rz90x`: `inner(KET['+y'], apply(Rz(90*D), KET['+x']))` → 0.7071 − 0.7071i (argument −45°).
  - `k:rz90xState`: `samePhysicalState(apply(Rz(90*D), KET['+x']), KET['+y'])` → true.
- Fidelity: `bloch-global-phase-hidden`.

**`l6-active:b4` [L]**
- Text: "Four checks can be read straight off the diagonal. $R_z(0) = I$, and $R_z(\varphi)^\dagger R_z(\varphi) = I$, so lengths and probabilities survive the turn. $R_z(-\varphi) = R_z(\varphi)^\dagger$ undoes it, and $R_z(\varphi_2)R_z(\varphi_1) = R_z(\varphi_1 + \varphi_2)$, so turns about one axis add."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true }`. The caption marks the 30° stop.
- Caption: "30° and then 60° lands where one 90° turn does"
- Claims:
  - `k:rzProps`: `matEq(Rz(0), identity(2))` → true; `isUnitary(Rz(1.3))` → true; `matEq(Rz(-1.3), dagger(Rz(1.3)))` → true; `matEq(matmul(Rz(60*D), Rz(30*D)), Rz(90*D))` → true.

**`l6-active:b5` [L] — reference page 13, outside the 75 minutes**
- Text: "For any state, the turn multiplies α by $e^{-i\varphi/2}$ and β by $e^{i\varphi/2}$, so both sizes stay and $\alpha^*\beta$ gains the factor $e^{i\varphi}$. So $(\langle S_x\rangle, \langle S_y\rangle)$ turns counterclockwise by φ while $\langle S_z\rangle$ stays, which is a right-handed rotation about z of the whole average arrow. Because $p_\pm = \tfrac12 \pm \langle S_n\rangle/\hbar$ along any axis $\hat n$, every prediction turns with it."
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 0 }, rotate: { axis: 'z', angleDeg: sweep(0, 90) }, measure: 'y', trail: true }`.
- Caption: "$\langle S_z\rangle = 0.25\hbar$ throughout · along y, $P(+)$ goes $0.500 \to 0.933$"
- Claims:
  - `k:anyTurn`: `blochVector(ψ60)` → (0.8660, 0, 0.5000), and `blochVector(apply(Rz(90*D), ψ60))` → (0, 0.8660, 0.5000).
  - `k:szKept`: `expectation(SZ, ψ60)` = `expectation(SZ, apply(Rz(90*D), ψ60))` → 0.2500.
  - `k:pRule`: `prob(KET['+y'], apply(Rz(90*D), ψ60))` → 0.9330 = 0.5 + `expectation(SY, apply(Rz(90*D), ψ60))` (0.4330).
  - `k:so3`: "the average arrow turns like an ordinary 3-vector". `qrotate(axisAngle([0,0,1], φ), blochVector(ψ))` (belt.ts, an independent quaternion route) = `blochVector(apply(Rz(φ), ψ))` → (0, 0.8660, 0.5000) for ψ60 at 90°. Also checked for `rotation(n, φ)` about arbitrary axes (e.g. n = (0.3, 0.5, 0.8), φ = 2.2 → (−0.0830, 0.8770, 0.4733) both ways).
- Links: $\langle S_z\rangle$ → `z` · $p_\pm$ → `axis-n`.

**`l6-active:b6` [B]**
- Text: "Townsend (§2.2) builds the same operator for a counterclockwise turn about z, seen from +z. His results match ours: 90° takes $|{+x}\rangle$ to $e^{-i\pi/4}|{+y}\rangle$, and 180° takes it to $|{-x}\rangle$ up to a phase (Example 2.2). In §2.5 he adds that turning the state one way is equivalent to turning the axes the other way (Fig. 2.9)."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 180) }, trail: true, shot: 'B-POLE' }`.
- Caption: "$R_z(180^\circ)|{+x}\rangle = -i\,|{-x}\rangle$"
- Claims:
  - `k:rz180x`: `inner(KET['-x'], apply(Rz(Math.PI), KET['+x']))` → −i, and `samePhysicalState(apply(Rz(Math.PI), KET['+x']), KET['-x'])` → true.
- Refs: Townsend §2.2, pp. 33–35 (eqs. 2.25–2.28, unitarity), pp. 39–41 (eqs. 2.41–2.42, Example 2.2); §2.5, pp. 52–54 (active vs passive, Fig. 2.9). His $\hat R(\varphi\mathbf k)$ is our $R_z(\varphi)$.

**`l6-active:b7` [C]**
- Question (text): "Turn $|{+z}\rangle$ about z by φ. Where does its point go?"
- Stage: `bloch` `{ state: '+z', rotate: { axis: 'z', angleDeg: sweep(0, 180) }, shot: 'B-STD' }`.
- Reveal: "Nowhere. $R_z(\varphi)|{+z}\rangle = e^{-i\varphi/2}|{+z}\rangle$ is only an overall phase, because $|{+z}\rangle$ lies on the turning axis, like a top spun about its own axis (Townsend, Fig. 2.3). In the Hopf picture the point stays and the vector slides back along its circle by φ/2. Any superposition picks up two *different* phases, so its relative phase changes and its point moves."
- Reveal stage: `hopf` `{ fibers: 'pair', marked: { state: '+z', rotate: { axis: 'z', angleDeg: sweep(0, 180) } }, mini: true, shot: 'HF-PAIR' }`. The bead slides at most 90° along the +z fiber, and the mini-Bloch point stays on the pole.
- Claims:
  - `k:rzPlusZ`: `apply(Rz(90*D), KET['+z'])` → (0.7071 − 0.7071i, 0), phase −45°; `samePhysicalState(apply(Rz(φ), KET['+z']), KET['+z'])` → true.
  - `k:superMoves`: `samePhysicalState(apply(Rz(90*D), ψ60), ψ60)` → false, with overlap `prob(ψ60, apply(Rz(90*D), ψ60))` → 0.6250.
- Fidelity: `hopf-fiber-state`, `hopf-mini-exact`, `bloch-global-phase-hidden`.
- Scope guard: the sweep stops at φ = 180°, so the bead moves at most a quarter of its fiber (χ = −90°). The half lap at φ = 360°, where the vector becomes $-|{+z}\rangle$, belongs to L7 §7.2.

**`l6-active:b8` [C] — L5 E6, handed to L6**
- Question (text): "Lecture 5's matrix $B_{z\leftarrow x}$ is unitary, just like $R_z(\varphi)$. Is a change of basis secretly a rotation of the atom?"
- Stage: `operator-space` `{ op: { matrix: [['1/sqrt(2)', '1/sqrt(2)'], ['1/sqrt(2)', '-1/sqrt(2)']] }, eigen: true, gauge: false, shot: 'O-STD' }`. $B_{z\leftarrow x}$ happens to be Hermitian as well as unitary, so the stage can draw it. Its arrow points along $\hat m = (\hat x + \hat z)/\sqrt2$.
- Reveal: "As a matrix, almost. $B_{z\leftarrow x}$ is $i$ times a half turn about the axis $\hat m$ halfway between x and z, which swaps the x and z directions. Its determinant is −1, while every $R$ has +1, and the factor $i$ accounts for the difference. So a state's x coordinates match, up to that phase, the z coordinates of the state turned 180° about $\hat m$. We *use* it passively: the atom is never turned; we only rename which axis is 'z'."
- Reveal stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 45 }, measure: { thetaDeg: 45, phiDeg: 0 } }`. The measurement axis marks $\hat m$. The `bloch` stage can rotate only about x, y or z, so the half turn itself is not animated (gap W5, §8).
- Claims:
  - `k:detB`: `det2(basisMatrix(X))` → −1, and `det2(Rz(1.2))` → 1.
  - `k:BisHalfTurn`: `matEq(basisMatrix(X), mscale(rotation([1,0,1], Math.PI), c(0,1)))` → true; `decomposeHermitian(basisMatrix(X)).a` → (0.7071, 0, 0.7071).
  - `k:passiveEqualsActive`: `samePhysicalState(toBasis(ψ★, X), apply(rotation([1,0,1], Math.PI), ψ★))` → true, i.e. same column up to a phase. The half turn sends +z to +x and +y to −y: `blochVector(apply(rotation([1,0,1],Math.PI), KET['+z']))` → (1, 0, 0), and for `KET['+y']` → (0, −1, 0).
- Refs: Townsend §2.5, p. 57, Example 2.5. With the standard phases, Townsend's $\mathbb S$ (our $B_{z\leftarrow x}$) is not the rotation $R_y(90^\circ)$ that his §2.5 started from, which is the same phase issue. Townsend §2.5, pp. 53–54, Fig. 2.9: turning the state one way equals turning the axes the other way.
- Wording rule (from L5 E6): never write "a basis change is never a rotation". Write "we use it passively".
- Fidelity: `op-length-not-size`, `bloch-not-lab-space`.

### Unit `l6-generator` — $S_z$ generates the turn

**`l6-generator:b1` [L]**
- Text: "What could $e^M$ mean when $M$ is a matrix? Use the same [[power-series|power series]] as for numbers: $e^M = I + M + \tfrac{M^2}{2!} + \tfrac{M^3}{3!} + \cdots$. For $M = -\tfrac{i\pi}{2\hbar}S_z$, stopping at $M^{10}/10!$ already matches the exact answer to about $10^{-9}$."
- Stage: `operator-space` `{ op: { named: 'Sz' }, eigen: true, gauge: false, shot: 'O-STD' }`.
- Caption: "stop after $M^1, M^2, M^3, M^5, M^{10}$: error 0.30 · 0.080 · 0.016 · 0.0003 · 2 × 10⁻⁹"
- Claims:
  - `k:seriesErr`: partial sums of $M^k/k!$, built with `matmul`, `mscale` and `madd`, against `expm2(M)` for `M = mscale(SZ, c(0, -Math.PI/2))`. `maxDiff` → 3.03e-1, 7.98e-2, 1.57e-2, 3.24e-4, 1.75e-9 (gap G2 `expmSeries`).
  - `k:seriesLimit`: `maxDiff(expm2(M), Rz(Math.PI/2))` → 0.
- Links: $S_z$ → `arrow-a`.

**`l6-generator:b2` [L]**
- Text: "Every power of a diagonal matrix is diagonal, so $\exp\begin{pmatrix}a&0\\0&b\end{pmatrix} = \begin{pmatrix}e^a&0\\0&e^b\end{pmatrix}$. Since $S_z = \tfrac\hbar2\,\mathrm{diag}(1, -1)$, the exponent $-\tfrac{i\varphi}{\hbar}S_z$ is $\mathrm{diag}(-\tfrac{i\varphi}{2}, \tfrac{i\varphi}{2})$. Its exponential is exactly the $R_z(\varphi)$ built by hand in the last unit."
- Stage: `operator-space` `{ op: { named: 'Sz' }, eigen: true, gauge: false }`.
- Caption: "at $\varphi = 1.2$: $-\tfrac{i\varphi}{\hbar}S_z = \mathrm{diag}(-0.6i,\ 0.6i)$"
- Claims:
  - `k:expDiag`: `mscale(SZ, c(0, -1.2))` → diag(−0.6i, 0.6i).
  - `k:expIsRz`: `maxDiff(expm2(mscale(SZ, c(0, -1.2))), Rz(1.2))` → 1.1e-16, below the 1e-12 tolerance.

**`l6-generator:b3` [L]**
- Text: "So $R_z(\varphi) = \exp(-i\varphi S_z/\hbar)$. The angle has no units and neither has $S_z/\hbar$, so the exponent is a plain number times a matrix. In operator space the arrow of $S_z$ points along the turning axis, and its eigenstates $|{\pm z}\rangle$ are the two points the turn leaves in place."
- Stage: `{ layout: 'split', top: { kind: 'operator-space', op: { named: 'Sz' }, eigen: true, gauge: false }, bottom: { kind: 'bloch', state: { thetaDeg: 60, phiDeg: 0 }, rotate: { axis: 'z', angleDeg: sweep(0, 180) }, trail: true } }`.
- Caption: "the [[generator]] $S_z$: eigenvalues $\pm\tfrac\hbar2$, eigenstates on the turning axis"
- Claims:
  - `k:szEigen`: `eigenHermitian2(SZ).values` → [0.5, −0.5] with vectors `KET['+z']`, `KET['-z']`.
  - `k:polesFixed`: `samePhysicalState(apply(Rz(1.2), KET['-z']), KET['-z'])` → true, and the same for `'+z'`.
- Links: $|{\pm z}\rangle$ → `eigen-plus`, `eigen-minus` (top) and `z` (bottom).
- Fidelity: `op-length-not-size` (for a spin component, the arrow does point along the lab axis).

**`l6-generator:b4` [L]**
- Text: "For a tiny angle $d\varphi$, keep only the first two terms: $R_z(d\varphi) = I - \tfrac{i}{\hbar}S_z\,d\varphi + O(d\varphi^2)$. Here [[big-o|$O(d\varphi^2)$]] stands for leftovers no bigger than a fixed multiple of $d\varphi^2$. At $d\varphi = 0.1$ the leftover is about 0.00125, and at 0.01 about 0.0000125."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 5.73) }, trail: true, shot: 'B-POLE' }` (0.1 rad = 5.73°).
- Caption: "ten times smaller angle → a hundred times smaller leftover"
- Claims:
  - `k:linErr`: `maxDiff(Rz(0.1), msub(identity(2), mscale(SZ, c(0, 0.1))))` → 1.2499e-3 (≈ dφ²/8 = 1.25e-3); at 0.01 → 1.2500e-5.

**`l6-generator:b5` [L]**
- Text: "Divide the small change by $d\varphi$ to get a rate: $\tfrac{d\psi_z}{d\varphi} = -\tfrac{i}{\hbar}S_z\,\psi_z$. Starting from $|{+x}\rangle$, this sends the Bloch arrow toward +y at one radian of turn per radian of φ. $S_z$ says how the state starts to move, and $R_z(\varphi)$ carries out the whole turn."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 30) }, trail: true, shot: 'B-POLE' }`.
- Caption: "$-\tfrac{i}{\hbar}S_z|{+x}\rangle = (-0.354i,\ 0.354i)$"
- Claims:
  - `k:rate`: `vscale(vsub(apply(Rz(h), KET['+x']), KET['+x']), 1/h)` with h = 1e-6 → (−0.3536i, 0.3536i) = `apply(mscale(SZ, c(0, -1)), KET['+x'])` (gap G3 `generatorOf`).
  - `k:blochVel`: `(blochVector(apply(Rz(h), KET['+x'])) − [1,0,0]) / h` → (0, 1.0000, 0).

**`l6-generator:b6` [B]**
- Text: "Townsend (§2.2) runs the argument the other way round, and writes $\hat J_z$ for our $S_z$. He starts from the small turn $1 - \tfrac{i}{\hbar}\hat J_z\,d\varphi$ and builds a finite turn from N equal small turns, $(1 - \tfrac{i}{\hbar}\hat J_z\tfrac{\varphi}{N})^N \to e^{-i\hat J_z\varphi/\hbar}$. For a 90° turn the gap to $R_z$ shrinks like $1/N$: 0.031 at N = 10 and 0.0003 at N = 1000."
- Stage: `bloch` `{ state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true, shot: 'B-POLE' }`.
- Caption: "N = 1, 10, 100, 1000 → gap 0.30, 0.031, 0.0031, 0.00031"
- Claims:
  - `k:compound`: the N-fold `matmul` of `msub(identity(2), mscale(SZ, c(0, (Math.PI/2)/N)))` against `Rz(Math.PI/2)`: `maxDiff` → 3.032e-1, 3.127e-2, 3.089e-3, 3.085e-4 (gap G4 `mpow`).
- Refs: Townsend §2.2, pp. 36–37 (eqs. 2.29–2.32). Rosetta: his $\hat J_z$ is our $S_z$ for spin ½; he fixes that eigenvalue on pp. 38–39.

**`l6-generator:b7` [B] — beyond the lecture**
- Text: "Susskind (§4.5) builds change in *time* the same way: over a short time ε the step is $I - i\varepsilon H/\hbar$, with the [[hamiltonian|Hamiltonian]] $H$ as its generator. Keeping lengths fixed forces $H$ to be Hermitian, and for a spin in a field along z, $H$ is proportional to $S_z$ (§4.11). So waiting in that field turns the spin about z, with time playing the part of the angle."
- Stage: `bloch` `{ state: { thetaDeg: 60, phiDeg: 0 }, rotate: { axis: 'z', angleDeg: sweep(0, 180) }, trail: true }`.
- Caption: "with $H = S_z$ in suitable units, evolving for time $t$ is exactly $R_z(t)$"
- Claims:
  - `k:evolveIsRz`: `maxDiff(evolve(SZ, 1.2), Rz(1.2))` → 1.1e-16.
- `beyondLecture: true`. Time evolution is not in the L6 notes; it is here only to show that the same generator idea returns.
- Refs: Susskind §4.5 "The Hamiltonian", §4.11 "Spin in a magnetic field". Rosetta: his $H \propto \sigma_z$ = our $\omega S_z$.

**`l6-generator:b8` [C]**
- Question (text): "Why the $-i$? Would $R_z(d\varphi) = I + S_z\,d\varphi/\hbar$ do the same job?"
- Stage: `operator-space` `{ op: { named: 'Sz' }, eigen: true, gauge: false }`.
- Reveal: "No. $I + 0.1\,S_z/\hbar$ stretches $|{+z}\rangle$ to length 1.05, a first-order change, so the probabilities would stop adding up to 1. With the $-i$ and a small number ε, $(I - i\varepsilon S)^\dagger(I - i\varepsilon S) = I + \varepsilon^2S^2$ for any Hermitian $S$, so the length is off only at second order (1.00125). Townsend's footnote 5 makes the same point: the $i$ is what lets the generator be Hermitian."
- Reveal stage: absent.
- Claims:
  - `k:noI`: `norm(apply(madd(identity(2), mscale(SZ, 0.1)), KET['+z']))` → 1.05000.
  - `k:withI`: `norm(apply(msub(identity(2), mscale(SZ, c(0, 0.1))), KET['+z']))` → 1.00125.
- Refs: Townsend §2.2, p. 37, footnote 5.

### Unit `l6-mixture` — Superposition or mixture? (beyond the lecture)

Unit-level `beyondLecture: { why: "The notes treat pure states only (p. 7). Decision L1 #6 places the full superposition-vs-mixture story here, after the L1 teaser.", source: Townsend §5.7 }`. Every beat is **[B]** except the closing clue. No density-matrix algebra appears in the core text: the ball, the weighted average of Bloch vectors, and the $P(+)$ rule carry the unit. $\mathrm{tr}\,\rho^2$ shows up only as the ball's purity readout.

**`l6-mixture:b1` [B]**
- Text: "The notes stop at pure states, the surface. Townsend (§5.7) adds [[mixture|mixtures]]: beams in which different atoms were prepared in different states, like the oven beam. A mixture is a point *inside* the sphere, at the weighted average of its ingredients' Bloch vectors, and the oven beam sits at the centre."
- Stage: `bloch-ball` `{ point: '+x', compare: 'oven', shot: 'B-STD' }`. The purity readout stays off until b4, where the term is glossed.
- Caption: "$|{+x}\rangle$: $|\vec r| = 1$ · oven: $|\vec r| = 0$"
- Claims:
  - `k:ballPlusX`: `blochVector(KET['+x'])` → (1, 0, 0).
  - `k:ballOven`: `blochOfMixture([{w:0.5, r:[0,0,1]}, {w:0.5, r:[0,0,-1]}])` → (0, 0, 0).
- Links: $|{+x}\rangle$ → `point` · oven → `center`.
- Fidelity: `ball-surface-pure`, `ball-inside-not-partly-up`.
- Refs: Townsend §5.7, pp. 171–174 (pure vs mixed, eqs. 5.70–5.86).

**`l6-mixture:b2` [B]**
- Text: "Inside the ball the same rule gives the odds: along a magnet axis $\hat n$, $P(+) = \tfrac{1 + \hat n\cdot\vec r}{2}$. Sweep the magnet through the x–z plane. For $|{+x}\rangle$ the chance rises and falls with the angle, but for the oven beam it never leaves ½."
- Stage: `bloch-ball` `{ point: '+x', compare: 'oven', measure: { tiltDeg: sweep(0, 180) } }`.
- Caption: "at a 60° tilt: $|{+x}\rangle$ 0.933 · oven 0.500"
- Claims:
  - `k:ballP60`: `pPlus([1,0,0], tiltXZ(60*D))` → 0.9330, and `pPlus([0,0,0], tiltXZ(60*D))` → 0.5000.
- Links: $\hat n$ → `axis-n`.
- Fidelity: `ball-born-inside`.

**`l6-mixture:b3` [B]**
- Text: "Different recipes can land on the same point. Half $|{+z}\rangle$ with half $|{-z}\rangle$ sits at the centre, and so does half $|{+x}\rangle$ with half $|{-x}\rangle$. No measurement can tell those two beams apart, so the ball keeps only the point."
- Stage: `bloch-ball` `{ point: { mix: [{ of: '+z', w: 0.5 }, { of: '-z', w: 0.5 }] }, compare: { mix: [{ of: '+x', w: 0.5 }, { of: '-x', w: 0.5 }] }, recipe: true }`.
- Caption: "two recipes, one point: $\vec r = 0$"
- Claims:
  - `k:recipes`: both `blochOfMixture` calls → (0, 0, 0), so `pPlus(0, n̂)` → 0.5 for every axis.
- Fidelity: `ball-many-recipes`.
- Refs: Townsend Example 5.5(a), p. 175, and the caution that follows it, p. 176. There he rewrites the ±x mixture in the z basis and gets exactly the oven's density operator.

**`l6-mixture:b4` [B]**
- Text: "Mix half $|{+z}\rangle$ atoms with half $|{+x}\rangle$ atoms and the point sits inside, at $(0.5, 0, 0.5)$, length 0.707. Add the amplitudes instead, $|{+z}\rangle + |{+x}\rangle$ normalized, and you get a new pure state on the surface at $(0.707, 0, 0.707)$. Adding amplitudes makes a new state, while mixing beams only averages probabilities."
- Stage: `bloch-ball` `{ point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, compare: { thetaDeg: 45, phiDeg: 0 }, recipe: true, purity: true }`.
- Caption: "mixture: $|\vec r| = 0.707$, [[purity]] 0.75 · superposition: $|\vec r| = 1$"
- Claims:
  - `k:mixZX`: `blochOfMixture([{w:.5, r:[0,0,1]}, {w:.5, r:[1,0,0]}])` → (0.5, 0, 0.5); its length is 0.7071, and `purityOfNorm(0.7071)` → 0.75.
  - `k:supZX`: `blochVector(normalize(vadd(KET['+z'], KET['+x'])))` → (0.7071, 0, 0.7071).
- Links: mixture → `point` · superposition → `compare` · purity → `purity`.

**`l6-mixture:b5` [B]**
- Text: "Townsend's Example 5.5 fills a chamber from two magnets, one giving $|{+z}\rangle$ atoms and one giving $|{-x}\rangle$ atoms, half each (his Fig. 5.11). The mixture sits at $(-0.5, 0, 0.5)$, so $\langle S_x\rangle = -\hbar/4$ and a magnet along x sends only a quarter of the atoms to +. Its purity is 0.75, below 1: the mark of a mixture."
- Stage: `bloch-ball` `{ point: { mix: [{ of: '+z', w: 0.5 }, { of: '-x', w: 0.5 }] }, recipe: true, purity: true, measure: 'x' }`.
- Caption: "along x: $P(+) = 0.25$"
- Claims:
  - `k:t55b`: `blochOfMixture([{w:.5, r:[0,0,1]}, {w:.5, r:[-1,0,0]}])` → (−0.5, 0, 0.5), so ⟨S_x⟩ = r_x/2 → −0.2500 (ħ).
  - `k:t55bPurity`: `purity(rhoFromMixture([{w:.5, psi:KET['+z']}, {w:.5, psi:KET['-x']}]))` → 0.7500; the oven's `purity(...)` → 0.5000.
  - `k:t55bPx`: `pPlus([-0.5,0,0.5], [1,0,0])` → 0.2500.
- Refs: Townsend §5.7, Example 5.5(b), pp. 175–176, Fig. 5.11.

**`l6-mixture:b6` [C]**
- Question (text): "Rotations carry pure states around the sphere. What does $R_z(90^\circ)$ do to the oven beam, and to the half-$|{+z}\rangle$, half-$|{+x}\rangle$ mix?"
- Stage: `bloch-ball` `{ point: 'oven', compare: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, recipe: true }`.
- Reveal: "Turn every ingredient, then average again. The $|{+z}\rangle$ atoms stay put and the $|{+x}\rangle$ atoms become $|{+y}\rangle$ atoms. So the mix moves to $(0, 0.5, 0.5)$ at the same length, 0.707: a turn never changes purity. The oven beam is the one point that every rotation leaves fixed."
- Reveal stage: `bloch-ball` `{ point: 'oven', compare: { mix: [{ of: '+z', w: 0.5 }, { of: '+y', w: 0.5 }] }, recipe: true, purity: true }`.
- Claims:
  - `k:mixTurn`: `blochOfMixture([{w:.5, r: blochVector(apply(Rz(90*D), KET['+z']))}, {w:.5, r: blochVector(apply(Rz(90*D), KET['+x']))}])` → (0, 0.5, 0.5), with length 0.7071.
  - `k:ovenFixed`: the oven is `blochOfMixture` of ±z (or ±x) → (0, 0, 0) before and after any turn.
- Fidelity: `ball-direction-average`.

## 2. Try-it widget per unit

All widgets already exist (`widgets/registry.tsx`). Props are the real prop interfaces. Every number in a prompt has an engine claim; claims not already in §1 are listed after each prompt.

| Unit | Widget (`kind`) | Props | Why this one |
|---|---|---|---|
| `l6-bloch` | `bloch` | `{ theta: 60, phi: 45, editable: true, landmarks: true, measure: 'z' }` | Six landmark buttons, α/β phasors, and the $P(+)$ bars along a measurement axis. |
| `l6-equator` | `phase-dial` | `{ theta: 0 }` (the prop is the relative phase; see widget gap W1) | Relative phase ↔ azimuth, with a global-phase button that leaves the point still. |
| `l6-active` | `bloch` | `{ theta: 60, phi: 0, editable: true, rotations: true, measure: 'y' }` | The $R_z$ buttons physically turn the state while the y magnet stays fixed. Requires widget gap W2 (hide the 360° button in L6). |
| `l6-generator` | `complex-plane` | `{ mode: 'multiply', z: [0.7, 0], w: [1, -0.05] }` | $w = 1 - 0.05i$ is the first-order factor $1 - \tfrac{i}{2}d\varphi$ that $R_z(d\varphi)$ applies to α at $d\varphi = 0.1$. The widget shows it turning *and* stretching slightly. |
| `l6-mixture` | `sg-lab` | `{ source: 'oven', axes: ['x'], editable: true, predict: true, showTheory: true }` | Whatever axis you pick, the oven beam gives 50/50, and one filter turns it into a pure beam. |

**`l6-bloch` — try this**
1. "Press each landmark button in turn. For which states is the $|{-z}\rangle$ amplitude β zero, and for which does it have the same size as α?" → β = 0 only for $|{+z}\rangle$ (α = 0 for $|{-z}\rangle$), and $|\beta| = |\alpha|$ for the four equatorial states [`k:sixPoints`, `k:equatorHalf`].
2. "Find a state that a z magnet sends up 90 % of the time. What θ does it need? Does φ matter?" → θ ≈ 37° (exactly 36.87°), and φ does not matter. New claim `k:theta90`: `2*Math.acos(Math.sqrt(0.9))/D` → 36.87, and `prob(KET['+z'], ketFromBloch(36.87*D, φ))` → 0.9000 for any φ.
3. "Move φ with θ held at 60°. Which of the three coordinates change?" → only $r_x$ and $r_y$; $r_z$ stays at 0.5 [`k:rStar`, plus `blochVector(ketFromBloch(60*D, φ))[2]` → 0.5].

**`l6-equator` — try this**
1. "Drag the relative phase to 90°. Where is the point, and what is β?" → at +y, with β = i/√2 [`k:yFromPhase`, `k:abY`].
2. "Press 'multiply both by $e^{i\pi/2}$'. What happens to the phasors, and to the point?" → both phasors turn by 90° together and the point does not move [`k:globalSameState`].
3. "Set the relative phase to 180°. Which named state is this, and what does a z magnet do with it?" → $|{-x}\rangle$, 50/50 [`k:relPhases`, `k:equatorHalf`]. The dial's $R_z$ buttons come before $R_z$ is defined, so the widget caption should say "the $R_z$ buttons are explained in the next chapter" (§6). No prompt uses them here.

**`l6-active` — try this**
1. "Press $R_z(90^\circ)$ once. Watch the y-magnet bars. What is $P(+)$ along y now?" → 0.500 → 0.933 [`k:pRule`].
2. "Press $R_z(90^\circ)$ and then $R_z(-90^\circ)$. Where are you?" → back at the start, because $R_z(-\varphi) = R_z(\varphi)^\dagger$ [`k:rzProps`].
3. "Set θ = 0 (the state $|{+z}\rangle$) and press $R_z(45^\circ)$ a few times. Why does nothing move, though the phasors do?" → only an overall phase [`k:rzPlusZ`].

**`l6-generator` — try this**
1. "Read the size of $w = 1 - 0.05i$. Is it exactly 1?" → 1.00125, slightly off the unit circle. That is the second-order error of the two-term formula [`k:withI`; new claim `k:wSize`: `abs(c(1, -0.05))` → 1.00125].
2. "What angle does $w$ turn $z$ by? Compare with $-d\varphi/2$ for $d\varphi = 0.1$ rad." → −2.862° against −2.865°. New claim `k:wAngle`: `arg(c(1, -0.05))/D` → −2.862, and `-0.05/D` → −2.865.
3. "Switch to 'powers of i'. Multiplying by $i = e^{i\pi/2}$ is a quarter turn. Which $R_z$ angle multiplies β by exactly $i$?" → 180°, since $R_z(\varphi)$ multiplies β by $e^{i\varphi/2}$ (and α by $e^{-i\varphi/2} = -i$ at that angle). New claim `k:betaByI`: `Rz(Math.PI)[1][1]` → i.

**`l6-mixture` — try this**
1. "Set the magnet to any axis you like. Can you ever get anything but 50/50 from the oven?" → no [`k:ovenAlongX`, `k:recipes`].
2. "Add a first magnet along x that keeps +, then point the second magnet along x. What changed?" → 100 % of the atoms that reach the plate go +: the filter turned a mixture into a pure beam. New claim `k:filterX`: `benchTheory({source:'oven', axes:['x','x'], keep:['+']})` → plus 0.5 (of oven atoms), minus 0.
3. "Keep the x filter and tilt the last magnet to 60°. Compare with the Bloch-ball rule." → 0.933 of the plate atoms [`k:ballP60`]. New claim `k:filterTilt`: `benchTheory({source:'oven', axes:['x', 60], keep:['+']})` → plus 0.4665 = 0.5 × 0.9330.

## 3. Challenges per unit

The L6 notes set no homework, so nothing here is `assigned`, and every challenge gets a full walkthrough. Numeric answers are engine calls placed in the content file. Hints run nudge → key idea → setup. Ids follow `l6-<unit-short>-<slug>`.

### `l6-bloch`
**`l6-b-theta`** · warm-up · numeric · "How far down?"
- Prompt: "A state has $\psi_z = (0.6,\ 0.8)$. What is the polar angle θ of its Bloch point, in degrees?"
- Answer: **106.26**, from `blochAngles(vec(0.6, 0.8)).theta / D`. Tolerance 0.1.
- Hints: (1) Lecture 5 gave the z average of this state (`l5-av-pop`), so turn it into a height. (2) $r_z = \cos\theta$. (3) $r_z = 0.36 - 0.64$.
- Walkthrough: ① $r_z = -0.28$. ② $\theta = \arccos(-0.28) = 106.26^\circ$, a little below the equator. ③ Check: $|\alpha| = \cos\tfrac\theta2 = \cos 53.13^\circ = 0.6$ ✓ (Townsend's $|{+n}\rangle$ form).

**`l6-b-phi`** · core · numeric · "Which longitude?"
- Prompt: "Now $\psi_z = (0.6,\ 0.8i)$. What is the azimuth φ of its point, in degrees?"
- Answer: **90**, from `blochAngles(vec(0.6, c(0, 0.8))).phi / D`. θ is unchanged at 106.26°. Tolerance 0.5.
- Hints: (1) Only the relative phase changed. (2) φ is the phase of $\alpha^*\beta$. (3) $\alpha^*\beta = 0.48i$.
- Walkthrough: ① $\alpha^*\beta = 0.48i$ has phase 90°. ② The point sits over the +y side, at the same height as before. ③ Lecture 5's `l5-av-coh` computed $\langle S_y\rangle = 0.48\hbar$ for this state; on the sphere that is $r_y = 0.96$.

**`l6-b-average`** · core · choice · "What does $r_y = 0.96$ mean?"
- Prompt: "For $\vec r = (0, 0.96, -0.28)$, which statement is true?"
- Options: "Along y, 98 % of the atoms read +" ✔ ($\tfrac{1 + 0.96}{2}$, `prob(KET['+y'], vec(0.6, c(0,0.8)))` → 0.98) · "Each atom reads $S_y = 0.96\cdot\tfrac\hbar2$" ✘ (single readings are only ±ħ/2) · "Each atom has $S_y$ and $S_z$ values at the same time" ✘ (the coordinates are averages from separate experiments) · "The state is mixed because $r_y < 1$" ✘ ($|\vec r| = 1$, so it is pure).
- Hints: (1) What can one atom ever read? (2) The coordinates are averages. (3) Use $P(+) = \tfrac{1 + \hat n\cdot\vec r}{2}$ with $\hat n = \hat y$.
- Walkthrough: ① A single reading is ±ħ/2. ② The average along y is $0.96\cdot\tfrac\hbar2$. ③ So $P(+y) = 0.98$.

**`l6-b-opposite`** · stretch · numeric · "The antipode"
- Prompt: "χ is the pure state whose Bloch point is diametrically opposite that of $\psi_\star = \cos30^\circ|{+z}\rangle + e^{i\pi/4}\sin30^\circ|{-z}\rangle$. What is $|\langle\chi|\psi_\star\rangle|^2$?"
- Answer: **0**, from `prob(ketAlong(neg3(blochVector(ψ★))), ψ★)` (→ 3e-33). Tolerance 0.001.
- Hints: (1) What do opposite points on the sphere mean? (2) Use $P = \tfrac{1 + \vec r_\chi\cdot\vec r_\star}{2}$ with $\vec r_\chi = -\vec r_\star$. (3) $\vec r_\star\cdot\vec r_\star = 1$.
- Walkthrough: ① Opposite points are orthogonal states. ② $P = \tfrac{1 - 1}{2} = 0$. ③ The trap is 1: that would be $-\psi_\star$, which sits on the *same* point [`k:negSame`]. ④ For χ, $P(+z) = \tfrac{1 - 0.5}{2} = 0.25$ (`prob(KET['+z'], χ)` → 0.25).

### `l6-equator`
**`l6-e-rx`** · warm-up · numeric · "Read the longitude"
- Prompt: "$|\psi\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{2\pi i/3}|{-z}\rangle)$. What is $r_x$?"
- Answer: **−0.5**, from `blochVector(ketFromBloch(90*D, 120*D))[0]`. Tolerance 0.005.
- Hints: (1) The relative phase is the azimuth. (2) $2\pi/3 = 120^\circ$. (3) $r_x = \cos\varphi$.
- Walkthrough: ① φ = 120°. ② $r_x = \cos 120^\circ = -0.5$. ③ $r_y = 0.866$ [`k:equatorAny`].

**`l6-e-disguise`** · core · choice · "Which one is $|{-y}\rangle$ in disguise?"
- Prompt: "Which state is physically the same as $|{-y}\rangle$?"
- Options: $\tfrac{1}{\sqrt2}(i|{+z}\rangle + |{-z}\rangle)$ ✔ (it equals $i\,|{-y}\rangle$; `samePhysicalState(vscale(vec(c(0,1),1), Math.SQRT1_2), KET['-y'])` → true) · $\tfrac{1}{\sqrt2}(-i|{+z}\rangle + |{-z}\rangle)$ ✘ (it is $-i\,|{+y}\rangle$) · $\tfrac{1}{\sqrt2}(|{+z}\rangle + i|{-z}\rangle)$ ✘ ($|{+y}\rangle$) · $\tfrac{1}{\sqrt2}(|{+z}\rangle - |{-z}\rangle)$ ✘ ($|{-x}\rangle$).
- Hints: (1) Only the relative phase, β/α, matters. (2) Divide β by α for each option. (3) $|{-y}\rangle$ has $\beta/\alpha = -i$.
- Walkthrough: ① Option 1: $1/i = -i$ ✔. ② Option 2: $1/(-i) = i$, which is $|{+y}\rangle$. ③ The global factor $i$ does not matter [`k:globalSameState`].

**`l6-e-phase`** · stretch · numeric · "Not on the equator"
- Prompt: "$\psi_z \propto (1 + i,\ 2)$. What is its azimuth φ in degrees, between −180 and 180?"
- Answer: **−45**, from `blochAngles(normalize(vec(c(1,1), 2))).phi / D`. Tolerance 0.5.
- Hints: (1) The azimuth is the phase of $\alpha^*\beta$, not of α or β alone. (2) $\alpha^* = 1 - i$. (3) $\alpha^*\beta = 2 - 2i$.
- Walkthrough: ① $\alpha^*\beta = 2 - 2i$. ② $\arg = -45^\circ$. ③ The point is not on the equator: $r_z = -\tfrac13$ (`blochVector` → (0.667, −0.667, −0.333)). The longitude rule still holds. Trap: +45°, from reading the phase of α.

**`l6-e-px`** · core · numeric · "Equator odds"
- Prompt: "For $|\psi(60^\circ)\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\pi/3}|{-z}\rangle)$, what is $P(+x)$?"
- Answer: **0.75**, from `prob(KET['+x'], ketFromBloch(90*D, 60*D))`. Tolerance 0.005.
- Hints: (1) Use the Bloch vector. (2) $\vec r = (\cos 60^\circ, \sin 60^\circ, 0)$. (3) $P(+x) = \tfrac{1 + r_x}{2}$.
- Walkthrough: ① $r_x = 0.5$. ② $P = 0.75$. ③ The same number comes from $|\langle{+x}|\psi\rangle|^2$.

### `l6-active`
**`l6-ac-which`** · warm-up · choice · "Which one changes the state?"
- Prompt: "Which operation changes the physical state?"
- Options: $\psi' = R_z(90^\circ)\psi_z$, with the z basis kept ✔ · $\psi_x = B_{x\leftarrow z}\psi_z$ ✘ (new coordinates, same state) · $S_z^{(x)} = B_{x\leftarrow z}S_zB_{z\leftarrow x}$ ✘ (new matrix, same observable) · $\psi \to e^{i\pi/3}\psi$ ✘ (global phase).
- Hints: (1) Ask whether the point on the sphere moves. (2) A basis change only relabels. (3) Only one option keeps the basis and alters the column.
- Walkthrough: ① Basis changes: no motion [`k:passiveKeeps`]. ② Global phase: no motion [`k:globalSameState`]. ③ $R_z(90^\circ)$ moves $|{+x}\rangle$ to $|{+y}\rangle$ [`k:activeMoves`].

**`l6-ac-px`** · core · numeric · "Turn, then measure"
- Prompt: "Apply $R_z(60^\circ)$ to $\psi_{60} = (\cos 30^\circ, \sin 30^\circ)$. What is $P(+x)$ afterwards?"
- Answer: **0.7165**, from `prob(KET['+x'], apply(Rz(60*D), ψ60))`. Tolerance 0.002.
- Hints: (1) Rotate the Bloch vector, not the amplitudes one by one. (2) $\vec r = (0.866, 0, 0.5)$ turns by 60° about z. (3) $P(+x) = \tfrac{1 + r_x'}{2}$.
- Walkthrough: ① $\vec r' = (0.866\cos 60^\circ,\ 0.866\sin 60^\circ,\ 0.5) = (0.433, 0.750, 0.5)$. ② $P(+x) = \tfrac{1.433}{2} = 0.7165$. ③ Before the turn it was 0.933 [`k:pRule` pattern].

**`l6-ac-to-minus-y`** · core · numeric · "The long way round"
- Prompt: "What is the smallest *positive* angle φ, in degrees, for which $R_z(\varphi)|{+x}\rangle$ is physically $|{-y}\rangle$?"
- Answer: **270**. Check: `samePhysicalState(apply(Rz(270*D), KET['+x']), KET['-y'])` → true; 90° gives $|{+y}\rangle$. Tolerance 0.5.
- Hints: (1) $R_z$ turns counterclockwise, seen from +z. (2) Going from +x to +y is +90°. (3) −y lies three quarter turns counterclockwise.
- Walkthrough: ① +x → +y → −x → −y. ② That is 270°. ③ $R_z(-90^\circ)$ also works, but it is not positive. Trap: 90.

**`l6-ac-rotate-avg`** · stretch · numeric · "Rotate the averages"
- Prompt: "Before a turn $R_z(90^\circ)$, $\langle S_x\rangle = 0.3\hbar$ and $\langle S_y\rangle = 0.4\hbar$. What is $\langle S_x\rangle$ afterwards, in ħ?"
- Answer: **−0.4**, from `expectation(SX, apply(Rz(90*D), ketFromBloch(90*D, Math.atan2(0.8, 0.6))))`. Tolerance 0.005.
- Hints: (1) Reference page 13: the averages turn like an ordinary vector. (2) $\langle S_x\rangle' = \cos\varphi\,\langle S_x\rangle - \sin\varphi\,\langle S_y\rangle$. (3) φ = 90°.
- Walkthrough: ① cos 90° = 0 and sin 90° = 1. ② $\langle S_x\rangle' = -0.4\hbar$. ③ $\langle S_y\rangle' = +0.3\hbar$ (engine → 0.3000).

### `l6-generator`
**`l6-g-exp-diag`** · warm-up · numeric · "Exponential of a diagonal"
- Prompt: "Let $M = \mathrm{diag}(0, i\pi)$. What is the bottom-right entry of $e^M$ (a real number)?"
- Answer: **−1**, from `expm2(mat([[0,0],[0,c(0,Math.PI)]]))[1][1].re`. Tolerance 0.001.
- Hints: (1) Diagonal in, diagonal out. (2) Exponentiate each diagonal entry. (3) Euler: $e^{i\pi}$.
- Walkthrough: ① $e^M = \mathrm{diag}(e^0, e^{i\pi})$. ② $e^{i\pi} = -1$.

**`l6-g-small-form`** · core · choice · "The small turn"
- Prompt: "Which is the first-order form of $R_z(d\varphi)$?"
- Options: $I - \tfrac{i}{\hbar}S_z\,d\varphi$ ✔ · $I + \tfrac{i}{\hbar}S_z\,d\varphi$ ✘ (that is $R_z(-d\varphi)$, the turn the other way) · $I - \tfrac{1}{\hbar}S_z\,d\varphi$ ✘ (it changes lengths at first order [`k:noI`]) · $I - \tfrac{i}{\hbar}S_x\,d\varphi$ ✘ (a turn about x).
- Hints: (1) Expand $e^{-i\varphi S_z/\hbar}$. (2) Keep terms up to $d\varphi^1$. (3) Watch the sign of the $i$.
- Walkthrough: ① $e^M \approx I + M$. ② $M = -\tfrac{i}{\hbar}S_z\,d\varphi$. ③ The length check: `k:withI`.

**`l6-g-leftover`** · stretch · numeric · "How good is two terms?"
- Prompt: "At $d\varphi = 0.2$ rad, what is the largest entry of $|R_z(d\varphi) - (I - \tfrac{i}{\hbar}S_z\,d\varphi)|$? Give three significant figures."
- Answer: **0.00500**, from `maxDiff(Rz(0.2), msub(identity(2), mscale(SZ, c(0, 0.2))))` → 4.999e-3. Tolerance 5e-5.
- Hints: (1) Compare the (1,1) entries. (2) $e^{-i\,0.1}$ against $1 - 0.1i$. (3) The difference is about $\tfrac12(0.1)^2$.
- Walkthrough: ① Exact: $0.99500 - 0.09983i$. ② Two terms: $1 - 0.1i$. ③ Difference ≈ 0.00500 = $d\varphi^2/8$.

**`l6-g-velocity`** · stretch · numeric · "Which way does $|{+y}\rangle$ start to move?"
- Prompt: "Under $R_z(\varphi)$, the Bloch point of $|{+y}\rangle$ starts to move with velocity $d\vec r/d\varphi$. What is its x component?"
- Answer: **−1**, the finite-difference Bloch velocity of `apply(Rz(h), KET['+y'])` → (−1, 0, 0) (gap G3). Tolerance 0.01.
- Hints: (1) A counterclockwise turn about z. (2) The velocity is $\hat z\times\vec r$. (3) $\hat z\times\hat y$.
- Walkthrough: ① $\hat z\times\hat y = -\hat x$. ② So $+y$ heads toward $-x$, as it should: +x → +y → −x.

### `l6-mixture`
**`l6-m-certain`** · core · numeric · "Can a mixture ever be certain?" (the decision-#6 highlight)
- Prompt: "A beam is half $|{+z}\rangle$ atoms and half $|{+x}\rangle$ atoms. What is the largest $P(+)$ that any magnet in the x–z plane can give?"
- Answer: **0.8536**, from `maxPPlus(blochOfMixture([{w:.5,r:[0,0,1]},{w:.5,r:[1,0,0]}]))`, i.e. $(1 + 1/\sqrt2)/2$. Tolerance 0.002.
- Hints: (1) Place the beam in the Bloch ball. (2) $\vec r = (0.5, 0, 0.5)$. (3) The best axis is along $\vec r$, which gives $P = \tfrac{1 + |\vec r|}{2}$.
- Walkthrough: ① $|\vec r| = 0.7071$. ② The best tilt is 45°. ③ $P = 0.8536$. Trap: 1, which belongs to the superposition [`k:supZX`].

**`l6-m-one-magnet`** · warm-up · numeric · "One magnet, two beams"
- Prompt: "Along x, how much larger is $P(+)$ for a pure $|{+x}\rangle$ beam than for the oven beam?"
- Answer: **0.5** = `benchTheory({source:'+x',axes:['x'],keep:[]}).plus − benchTheory({source:'oven',axes:['x'],keep:[]}).plus`. Tolerance 0.001.
- Hints: (1) The pure beam lies along x. (2) The oven sits at the centre. (3) 1 − ½.
- Walkthrough: ① $|{+x}\rangle$ gives 1 [`k:plusXalongX`]. ② The oven gives ½ [`k:ovenAlongX`]. ③ The difference is 0.5.

**`l6-m-best-tilt`** · stretch · numeric · "Townsend's chamber"
- Prompt: "Townsend's beam is half $|{+z}\rangle$ and half $|{-x}\rangle$. At what tilt, in degrees from +z toward +x (negative means toward −x), is $P(+)$ largest?"
- Answer: **−45**, from `Math.atan2(r[0], r[2]) / D` with `r = blochOfMixture(...)` → (−0.5, 0, 0.5). There, $P = 0.8536$ (`pPlus(r, tiltXZ(-45*D))`). Tolerance 1.
- Hints: (1) Find $\vec r$. (2) Point the magnet along $\vec r$. (3) $\vec r$ lies halfway between +z and −x.
- Walkthrough: ① $\vec r = (-0.5, 0, 0.5)$. ② Its direction is 45° from +z toward −x. ③ So the tilt is −45°.

**`l6-m-lookalike`** · core · choice · "A perfect lookalike"
- Prompt: "A beam is half $|{+x}\rangle$ and half $|{-x}\rangle$. Which experiment can tell it apart from the oven beam?"
- Options: "None" ✔ (both sit at $\vec r = 0$ [`k:recipes`]) · "A z magnet" ✘ (both give 50/50) · "An x magnet" ✘ (both give 50/50) · "A magnet at 45°" ✘ (both give 50/50).
- Hints: (1) Place both in the ball. (2) What does $P(+)$ depend on? (3) Only on $\vec r$.
- Walkthrough: ① Both have $\vec r = 0$. ② $P(+) = \tfrac12$ for every axis. ③ Different recipes, same physics [`l6-mixture:b3`].

## 4. Glossary (new in L6)

Already in `glossary.ts` and reused as is: `bloch-sphere`, `bloch-ball`, `global-phase`, `relative-phase`, `mixture`, `unpolarized`, `basis`, `orthonormal-basis`, `orthogonal`, `amplitude`, `expectation`, `superposition`, `complex-number`, `magnitude`, `precession`. Two small edits: the `bloch-sphere` gloss ends "(full treatment in Lecture 6)", which should drop the pointer once L6 exists, and `mixture` can gain a "see the Bloch ball" link. Terms that L2–L5 introduce (operator, eigenvalue, eigenvector, Hermitian, projector, Euler's formula) are assumed from those lectures' glossaries. So are the basis-change terms that the P-L5 plan owns (`coordinates`, `basis-change-matrix`, `conjugate-transpose`, `unitary`, `eigenbasis`, `diagonal-matrix`, `diagonalization`, `determinant`, `coherence`, `identity-matrix`, `inverse-matrix`) and the L2 plan's `real-part`, `imaginary-part`, `complex-conjugate`. L6 tags them and never redefines them. §6 marks where L6 leans on them.

| id | Term | Gloss (one plain sentence) | First use |
|---|---|---|---|
| `bloch-vector` | Bloch vector $\vec r$ | The three spin averages $\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle$, each multiplied by $2/\hbar$, used as the coordinates of a point. | `l6-bloch:b1` |
| `pure-state` | pure state | A state described by a single ket, so some magnet axis gives + every time; its Bloch point lies on the surface. | `l6-bloch:b5` |
| `polar-angle` | polar angle θ | On the Bloch sphere, how far a point lies down from the north pole (+z), from 0° to 180°. | `l6-bloch:b6` |
| `azimuth` | azimuth (longitude) φ | On the Bloch sphere, the angle around the equator, measured from +x toward +y; it equals the relative phase. | `l6-bloch:b6` |
| `spin-polarization` | polarization direction | The axis along which a given spin state reads + with certainty; for a pure state it is the Bloch vector. | `l6-bloch:b7` |
| `hopf-fiber` | Hopf fiber | The circle of state vectors $e^{i\chi}\lvert\psi\rangle$ that all describe one physical state and sit over one Bloch point. | `l6-equator:b7` |
| `right-handed` | right-handed axes | Axes arranged so that when the fingers of your right hand curl from x toward y, the thumb points along z. | `l6-equator:b5` |
| `passive-change` | passive transformation (basis change) | Describing the same state in new coordinates; nothing happens to the atom. | `l6-active:b1` |
| `active-rotation` | active rotation | An operation that changes the state itself while the basis stays fixed, so its Bloch point moves. | `l6-active:b1` |
| `rotation-operator` | rotation operator $R_z(\varphi)$ | The unitary matrix $\mathrm{diag}(e^{-i\varphi/2}, e^{i\varphi/2})$ that turns a spin state by angle φ about the z axis. | `l6-active:b2` |
| `counterclockwise-turn` | right-handed (counterclockwise) turn | A turn that looks counterclockwise when the turning axis points toward you. | `l6-active:b5` |
| `power-series` | power series | An endless sum of higher and higher powers, each divided by a factorial, such as $1 + x + x^2/2! + \cdots = e^x$. | `l6-generator:b1` |
| `factorial` | factorial $n!$ | The product $1\times2\times\cdots\times n$; for example $3! = 6$. | `l6-generator:b1` |
| `matrix-exponential` | matrix exponential $e^M$ | The matrix given by the series $I + M + M^2/2! + \cdots$; for a diagonal matrix, exponentiate each diagonal entry. | `l6-generator:b1` |
| `generator` | generator | The Hermitian operator in the exponent of a rotation; it fixes which way, and how fast, the state starts to turn. | `l6-generator:b3` |
| `infinitesimal` | infinitesimal angle $d\varphi$ | An angle so small that terms in its square can be dropped. | `l6-generator:b4` |
| `big-o` | $O(d\varphi^2)$ | Shorthand for leftover terms no bigger than a fixed number times $d\varphi^2$. | `l6-generator:b4` |
| `hamiltonian` | Hamiltonian $H$ | The energy operator; as a generator, it moves a state forward in time. | `l6-generator:b7` (beyond the lecture) |
| `density-operator` | density operator ρ | The operator that describes a whole beam, pure or mixed: the weighted sum of $\lvert\psi\rangle\langle\psi\rvert$ over its ingredients. | `l6-mixture:b4` |
| `purity` | purity $\mathrm{tr}\,\rho^2$ | A number that is 1 for a pure state and ½ for the oven beam; for spin ½ it equals $(1 + \lvert\vec r\rvert^2)/2$. | `l6-mixture:b4` |

Closure: every gloss uses only ordinary words, earlier glossary ids (L1 and the L2–L5 plans), or ids in this table (`uses`: `bloch-vector` → `expectation`; `rotation-operator` → `unitary` (L5); `generator` → `rotation-operator`; `purity` → `density-operator`, `pure-state`, `bloch-vector`; `hopf-fiber` → `global-phase`).

## 5. Review cards

Every number on the cards is a claim from §1–§3; the key is given in brackets.

### `l6-bloch` — Three averages make a point
- $\vec r = \tfrac2\hbar(\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle) = (2\,\mathrm{Re}\,\alpha^*\beta,\ 2\,\mathrm{Im}\,\alpha^*\beta,\ |\alpha|^2 - |\beta|^2)$.
- Every pure state has $|\vec r| = 1$, so it lies on the unit sphere [`k:unitSphere`].
- $|{\pm z}\rangle$ sit at the poles; $|{\pm x}\rangle$ and $|{\pm y}\rangle$ sit on the equator [`k:sixPoints`].
- The coordinates are averages over many atoms. Each atom still reads ±ħ/2, with $P(+) = \tfrac{1 + \hat n\cdot\vec r}{2}$ [`k:pzRule`].

$$\vec r = \tfrac{2}{\hbar}\big(\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle\big),\qquad |\vec r|^2 = (|\alpha|^2 + |\beta|^2)^2 = 1,\qquad P(+\hat n) = \tfrac{1 + \hat n\cdot\vec r}{2}$$

**The one trap:** reading opposite points as opposite vectors. $|{-z}\rangle$ is orthogonal to $|{+z}\rangle$, not $-|{+z}\rangle$, which sits on the same pole as $|{+z}\rangle$ [`k:zOrth`, `k:negSame`].

### `l6-equator` — Relative phase sets the longitude
- The four equatorial states all give 50/50 along z. They differ only in the relative phase: $1, i, -1, -i$ [`k:equatorHalf`, `k:relPhases`].
- $|\psi(\varphi)\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\varphi}|{-z}\rangle)$ sits at longitude φ. Halfway to +y, $\beta = \tfrac{1+i}{2}$ and $\langle S_x\rangle = \langle S_y\rangle = 0.354\hbar$ [`k:psi45`, `k:avg45`].
- A common phase $e^{i\chi}$ on both amplitudes moves nothing [`k:globalSameState`].
- An equatorial state is not an unpolarized beam: along its own axis it gives + every time [`k:plusXalongX`].

$$|\psi(\varphi)\rangle = \tfrac{1}{\sqrt2}\big(|{+z}\rangle + e^{i\varphi}|{-z}\rangle\big)\ \Longrightarrow\ \vec r = (\cos\varphi, \sin\varphi, 0)$$

**The one trap:** mixing up the notes' letters with the app's. The notes call the longitude θ. Here θ is the polar angle, and the longitude is φ.

### `l6-active` — Turn the state, keep the axes
- A basis change rewrites coordinates (passive). $R_z(\varphi)$ changes the state and keeps the basis (active). As a matrix, $B_{z\leftarrow x}$ is $i$ times a half turn, but we use it passively [`k:passiveKeeps`, `k:activeMoves`, `k:BisHalfTurn`].
- $R_z(\varphi) = \mathrm{diag}(e^{-i\varphi/2}, e^{i\varphi/2})$ turns the point by φ counterclockwise about z. Example: $|{+x}\rangle \to e^{-i\pi/4}|{+y}\rangle$ at 90° [`k:rz90x`].
- $R_z(0) = I$, it is unitary, $R_z(-\varphi) = R_z(\varphi)^\dagger$, and angles about one axis add [`k:rzProps`].
- The averages turn like a 3-vector while $\langle S_z\rangle$ stays. $|{\pm z}\rangle$ only pick up a phase [`k:anyTurn`, `k:rzPlusZ`].

$$R_z(\varphi) = \begin{pmatrix}e^{-i\varphi/2}&0\\0&e^{i\varphi/2}\end{pmatrix},\quad R_z(\varphi)\psi_z(\varphi_0) = e^{-i\varphi/2}\psi_z(\varphi_0 + \varphi),\quad \begin{pmatrix}\langle S_x\rangle'\\ \langle S_y\rangle'\end{pmatrix} = \begin{pmatrix}\cos\varphi&-\sin\varphi\\ \sin\varphi&\cos\varphi\end{pmatrix}\begin{pmatrix}\langle S_x\rangle\\ \langle S_y\rangle\end{pmatrix}$$

**The one trap:** thinking the extra $e^{-i\varphi/2}$ makes $R_z(\varphi)|{+x}\rangle$ a different state from $|\psi(\varphi)\rangle$. It is an overall phase, so it is the same physical state [`k:rz90xState`].

### `l6-generator` — $S_z$ generates the turn
- A matrix exponential is defined by its power series. For a diagonal matrix, exponentiate each entry [`k:seriesErr`].
- $R_z(\varphi) = e^{-i\varphi S_z/\hbar}$ exactly [`k:expIsRz`].
- For a small angle, $R_z(d\varphi) = I - \tfrac{i}{\hbar}S_z\,d\varphi$; the leftover is about $d\varphi^2/8$, so 0.00125 at 0.1 rad [`k:linErr`].
- $S_z$ generates the turn and $R_z(\varphi)$ performs it: $\tfrac{d\psi}{d\varphi} = -\tfrac{i}{\hbar}S_z\psi$ [`k:rate`].

$$R_z(\varphi) = \exp\!\Big(-\tfrac{i\varphi}{\hbar}S_z\Big),\qquad R_z(d\varphi) = I - \tfrac{i}{\hbar}S_z\,d\varphi + O(d\varphi^2),\qquad \frac{d\psi_z}{d\varphi} = -\tfrac{i}{\hbar}S_z\,\psi_z$$

**The one trap:** dropping the $-i$. $I + S_z\,d\varphi/\hbar$ changes lengths at first order (1.05 at 0.1) [`k:noI`]. The $i$ is what keeps the small turn unitary with a Hermitian generator.

### `l6-mixture` — Superposition or mixture? (beyond the lecture)
- A mixture is a point inside the Bloch ball: $\sum_k w_k\vec r_k$, where each weight $w_k$ is the fraction of atoms prepared with Bloch vector $\vec r_k$. The oven sits at the centre [`k:ballOven`].
- $P(+) = \tfrac{1 + \hat n\cdot\vec r}{2}$ holds inside the ball too. The oven gives ½ along every axis [`k:ballP60`].
- Different recipes can give the same point, and then no experiment tells them apart [`k:recipes`].
- Mixing ½ $|{+z}\rangle$ with ½ $|{+x}\rangle$ gives $|\vec r| = 0.707$ and a best $P(+)$ of 0.854. The superposition of the same two gives 1 [`k:mixZX`, `l6-m-certain`].

$$\vec r_{\text{mix}} = \sum_k w_k\,\vec r_k,\qquad P(+\hat n) = \tfrac{1 + \hat n\cdot\vec r}{2},\qquad \mathrm{tr}\,\rho^2 = \tfrac{1 + |\vec r|^2}{2}$$

**The one trap:** calling $|{+x}\rangle$ "half up, half down". Along z it looks that way. Along x it is 100 % +, while the half-and-half beam stays at 50 %.

## 6. Symbol-before-use table

**Reading order assumed:** units in array order. Within a unit: story beats (L → B → C, each reveal right after its question), then Try it, insight, pitfalls, review, challenges. Symbols known from L1 (`|ψ⟩`, α, β, $\hat n$, ħ, $S_z$, ⟨·⟩, $P(+)$) and from L2–L5 (complex conjugate $z^*$, Re/Im, $e^{i\varphi}$, $S_x, S_y$, $I$, eigenvalue/eigenvector, Hermitian) are assumed. Each gets a gloss tag at its first L6 use.

**Status key:** OK = defined at or before first use · **FLAG** = used before definition, or a clash · **fixed** = the problem was found and fixed while drafting §1–§3 · gloss = a glossary tag is enough.

| Symbol | First use in L6 | First definition | Status | Fix / note |
|---|---|---|---|---|
| $\psi_z = (\alpha, \beta)$ (z column) | `l6-bloch:b2` | L5 (`l5-operators:b1` introduces $\psi_z$ as the notes' alias of $c_z$) | gloss | Tag `coordinates` (L5 glossary). L6 keeps the L6 notes' $\psi_z$ spelling throughout. |
| $\psi_x$, $B_{x\leftarrow z}$, $B_{z\leftarrow x}$, $A^{(z)}$, $A^{(x)}$ | `l6-active:b1` (the link-back) | L5 (`l5-coordinates:b3`, `l5-operators:b1–b2`) | OK (second pass) | Tags `basis-change-matrix`, `coordinates` from the L5 glossary. The beat's "Lecture 5" chip links to the owning beats. |
| $M^\dagger$ (dagger) | `l6-active:b4` ($R_z^\dagger$) | L5 (`l5-coordinates:b4`) | gloss | Tag `conjugate-transpose` (L5 glossary). |
| $\mathbb S$ (Townsend) | `l6-active:b8` refs | same line | **fixed** | The refs line now reads "Townsend's $\mathbb S$ (our $B_{z\leftarrow x}$)". |
| $\hat m$, $\det$ | `l6-active:b8` reveal | same sentence / L4–L5 (`determinant`) | OK | $\hat m = (\hat x + \hat z)/\sqrt2$ is defined inline; tag `determinant` (L5 glossary). |
| $\vec r$, $r_x, r_y, r_z$ | `l6-bloch:b1`, b2 caption | b1 text; the components at b2 | OK | Tag `bloch-vector`. |
| Re, Im, $\alpha^*$, $\alpha^*\beta$ | `l6-bloch:b2` | L2 (`real-part`, `imaginary-part`, `complex-conjugate`); L5 (`coherence`) | gloss | Tag at first use; b2 is the link-back to `l5-averages`. |
| θ (polar), φ (azimuth) | `l6-bloch:b6` caption, b7 text | b6 caption | OK | Tags `polar-angle`, `azimuth`. |
| **θ in the notes (equatorial angle)** | notes pp. 8–9 | — | **FLAG (clash)** | The notes' θ is the app's φ. Rename everywhere in L6 and gloss once ("the notes call this θ", `l6-equator:b4` caption). See Q1. The same clash is logged for L7. |
| **ϕ in the notes (rotation angle) vs φ (azimuth)** | `l6-active:b2` | same beat | **FLAG (design)** | Same letter for two roles. Kept deliberately: rotating from longitude $\varphi_0$ by φ lands at $\varphi_0 + \varphi$, and the start is always written $\varphi_0$. See Q1. |
| $\lvert{+n}\rangle$, $\hat n(\theta,\varphi)$ | `l6-bloch:b7` | same beat | OK | — |
| "+1" (Susskind's σ units) | `l6-bloch:b7` | — | **fixed** | The draft said "read +1", which clashes with L1's σ = 2S/ħ. It now says "gives +". |
| χ (global phase) | `l6-equator:b7` reveal | same sentence | OK | P2 §6.2 used γ; L6 uses χ to match `hopf.ts`. |
| $\varphi_0$ | `l6-active:b2` | same beat | OK | — |
| $R_z(\varphi)$ | `l6-active:b2` (text); `l6-equator` Try-it (PhaseDial buttons) | `l6-active:b2` | **FLAG → fixed** | The PhaseDial shows $R_z(90^\circ)$ and $R_z(-45^\circ)$ buttons in `l6-equator`. Its prompts no longer use them, and the widget caption points forward. W1 in §8 offers the cleaner fix. |
| $I$ (identity) | `l6-active:b4` | L5 | gloss | Tag `identity-matrix` (L5 glossary). |
| $p_\pm$, $\langle S_n\rangle$ | `l6-active:b5` | same beat / L4 | OK | $S_n$ = spin along $\hat n$ (tag `expectation`). |
| $e^M$, $M$, $n!$ | `l6-generator:b1` | same beat | OK | Tags `matrix-exponential`, `factorial`, `power-series`. |
| $d\varphi$, $O(d\varphi^2)$ | `l6-generator:b4` | same beat | OK | Tags `infinitesimal`, `big-o`. |
| $\hat J_z$ | `l6-generator:b6` | same beat | **fixed** | Townsend's name for $S_z$, now stated in the beat. |
| $N$ (number of small turns) | `l6-generator:b6` | same beat | OK | No clash in L6 (L1's $\hat N$ axis does not appear). |
| $H$, ε | `l6-generator:b7` | same beat | **fixed** | The draft used $H$ before naming it and had an undefined ω in the caption. Both are fixed. |
| ε, $S$ in the −i clue | `l6-generator:b8` reveal | same sentence | **fixed** | "a small number ε" and "any Hermitian $S$" are now defined inline. |
| ρ, $\mathrm{tr}\,\rho^2$ | `l6-mixture:b4` (purity readout) | b4 gloss `purity` / `density-operator` | **fixed** | The b1 stage had the purity readout on. It is now off until b4. |
| $w_k$ | `l6-mixture` review card | same bullet | **fixed** | The weights are now defined in the review point. |
| $B$ (matrix) vs $\vec B$ (field) | L6 uses only the matrix | — | OK | $\vec B$ never appears in L6 (`l6-generator:b7` says "field" in words). |

**Counts:** 2 flags remain open, both design choices that the user must confirm (Q1): the notes' θ → φ rename, and φ serving as both rotation angle and azimuth. 8 problems were found and fixed while drafting: $\mathbb S$, "+1", $R_z$ in the PhaseDial, $\hat J_z$, $H$/ω, ε/$S$, the purity readout, and $w_k$. Nothing else is used before it is defined. Every symbol L5 owns reaches L6 through its L5 glossary tag, never through a re-definition.

## 7. Errata

**Headline: the L6 notes contain no physics error.** Every displayed equation on pp. 2–13 was re-derived and checked against the engine: the $B$ matrices (p. 2), $B_{x\leftarrow z} = B_{z\leftarrow x}^\dagger$ (p. 3), $S_x^{(x)}$ and $S_z^{(x)}$ (p. 5), the $S_y$ check (p. 5), $\langle S_z\rangle = \hbar/2$ in x coordinates (p. 6), the invariance identity (p. 6), $\vec r$ in terms of α, β and $|\vec r| = 1$ (p. 7), the six-state table (p. 7), the 45° state with its averages (pp. 7–8), $|\psi(\theta)\rangle$ (p. 8), $R_z$, its action and its four properties (p. 9), the exponential and the generator (p. 11), and the page-13 reference rotation with $p_\pm$. What remains are convention clashes, a notation clash, and cosmetic or scheduling issues. None needs a `Correction` box. E2 needs a learner-facing note, which §1 already contains; E1 is L5's to show.

| # | Where | What disagrees | Evidence (engine, run while drafting) | Resolution |
|---|---|---|---|---|
| E1 | Notes p. 5 (and L5 p. 13) vs **Townsend §2.5**, eqs. 2.90, 2.99–2.101, pp. 53–56 | Townsend's §2.5 takes $\lvert{-x}\rangle = \tfrac{1}{\sqrt2}(-\lvert{+z}\rangle + \lvert{-z}\rangle)$, the notes' vector times −1. His $\mathbb S = \tfrac{1}{\sqrt2}\begin{pmatrix}1&-1\\1&1\end{pmatrix}$, his $\hat J_z$ in the x basis is $\tfrac\hbar2\begin{pmatrix}0&-1\\-1&0\end{pmatrix}$, and his $\lvert{+z}\rangle$ in x coordinates is $\tfrac{1}{\sqrt2}(1, -1)$. The notes have $+1$ off-diagonals and $(1, 1)/\sqrt2$. His $\mathbb S$ is also **not** equal to its own dagger, so the notes' "coincidence" (p. 3) depends on the phase convention. | `operatorInBasis(SZ, X)` → [[0, 0.5], [0.5, 0]]; `operatorInBasis(SZ, [KET['+x'], vscale(KET['-x'],-1)])` → [[0, −0.5], [−0.5, 0]]; `toBasis(KET['+z'], that basis)` → (0.7071, −0.7071); `matEq(dagger(B_T), B_T)` → false. The same physical state: `samePhysicalState` → true. Townsend page image checked (PDF p. 71–72). | A convention difference, not an error; both are right. **Owned by L5** (`l5-operators:b7`, which also cites his Ex. 2.5 with our phases). L6 does not repeat it. `l6-active:b8` touches the same phase issue from the rotation side. The app keeps the notes' convention (locked: first component real ≥ 0). |
| E2 | Notes pp. 8–9 (and L7) vs **the app** | The notes use θ for the equatorial angle, measured from +x toward +y, and ϕ for the rotation angle. The app's θ is the *polar* angle; the azimuth is φ. The `PhaseDial` widget also labels the relative phase "θ" (widget code, not content). | `blochAngles(ketFromBloch(Math.PI/2, 1.1))` → { θ: 1.5708, φ: 1.1 }: the notes' θ comes out as the app's φ, and the app's θ is always 90° on the equator. | Rename the notes' θ to φ in all L6 prose, with one gloss (`l6-equator:b4` caption). Relabel the PhaseDial slider (W1, §8). User confirms in Q1. |
| E3 | Notes p. 1 (scope) vs **L5 notes p. 14–15** (handoff) | L5's handoff promises that Lecture 6 will explain why turns about different axes can fail to commute, and will reach the commutators of the spin components and the general uncertainty principle. L6 p. 1 defers variance and the uncertainty relation, and L6 never treats non-commuting rotations. Those topics are in L7 §§7.5–7.9. | Text check: in `sources/L6/text.md`, "commut" gives 0 hits and "uncertainty" appears only in the deferral sentence. | A scheduling note, not physics. L6 plans no commutator content, and `concepts.ts` already places `commutators` and `uncertainty` in L7. |
| E4 | Notes headings | The numbering runs "5.3" (a section of L5 inside L6), then "6.0", "6.2", "6.3". There is no 6.1; the teaching plan's "active rotation (5 min)" has no heading of its own. | Visual check of sheets p05–p11. | Cosmetic. The unit titles do not reuse the notes' numbers, and the `l6-active` refs cite pages. |
| E5 | Every footer | Pages print "n / ??": the page-count reference never resolved. The PDF has 13 pages. | Sheets p01–p13. | Cosmetic, and unlike L7 ("n / 14" on 13 pages) nothing is missing. Page 13 ends with the reference box, as its content requires. |
| E6 | Notes p. 2, matrix $B_{z\leftarrow x}$ | The entries are typeset "⟨+z∣ + x⟩" with a stray space, which could be read as a sum. | Sheet p01, right page. | Cosmetic. The L5 plan's overlap caption (`l5-coordinates:b6`) typesets $\langle{+z}\vert{+x}\rangle$ correctly; L6 has no beat on it. |
| E7 | **Susskind §4.5** vs **Townsend §2.2, footnote 5** | This looks like a disagreement, but is not one. Susskind calls the $-i$ in $U(\varepsilon) = I - i\varepsilon H$ a convention with no content. Townsend says that without the $i$ the generator would not be Hermitian. Both hold: *given* a Hermitian generator the $i$ is required, and *given* the $i$ the generator must be Hermitian. A learner reading both may think they conflict. | `norm(apply(I + 0.1·SZ, KET['+z']))` → 1.05000 (first-order stretch); `norm(apply(I − 0.1i·SZ, KET['+z']))` → 1.00125 (second order). | Framed in `l6-generator:b8`: "the $i$ is what lets the generator be Hermitian". No correction needed. |
| E8 | Notes p. 1 reading list | Checked. Townsend §2.2 (rotation operators) is printed pp. 33–41, as cited. §2.5 runs pp. 52–57, and p. 58 starts §2.6 (the same one-page slip as L5's E8). Susskind §3.8 is the spin-polarization principle in our epub, which has no page numbers, so "pp. 90–91" cannot be checked. | Townsend OCR headers (PDF − 16); Susskind `chapter003.md` headings. | Cite Townsend §2.5 as pp. 52–57, and Susskind §3.8 plus "(the notes' pp. 90–91)". |
| E9 | Townsend §5.7, Example 5.5 (OCR only) | The OCR of `sources/townsend/text.md` reads "tr ρ² = 1, signifying a mixed state" for part (a). The printed page says ½. | Page image PDF p. 191 checked; `purity(rhoFromMixture(±z))` → 0.5000; part (b): `rhoFromMixture` → [[0.75, −0.25], [−0.25, 0.25]] = his $\tfrac14\begin{pmatrix}3&-1\\-1&1\end{pmatrix}$, purity 0.75. | An ingestion (OCR) artefact, not a book error. Never quote OCR numbers from `text.md` without the page image (a note for the course-builder skill). |

Also checked and consistent (no entry needed): the engine's `rotation([0,0,1], φ)` equals `Rz(φ)`, equal to the notes' $e^{-i\varphi/2}\mathrm{diag}(1, e^{i\varphi})$ and Townsend eq. 2.41 [`matEq` → true]. Townsend eq. 2.42 and Example 2.2 match `k:rz90x` and `k:rz180x`. $|{+y}\rangle$ agrees across the notes, Townsend eq. 1.30 and Susskind eq. 2.10 ($|i\rangle$).

## 8. Engine gaps

The engine already covers nearly all of L6: `basisMatrix`, `toBasis`, `operatorInBasis`, `blochVector`, `blochAngles`, `ketFromBloch`, `Rz`, `rotation`, `expm2`, `evolve`, the `density.ts` ball functions, and `belt.ts` `axisAngle`/`qrotate`, which give an independent SO(3) route for the page-13 check. The gaps below are small helpers, so claims need not inline loops. Each carries a numpy route for `make_claim_fixtures.py`.

| # | Name and signature (file) | Formula | Needed by | numpy check |
|---|---|---|---|---|
| G1 | `maxDiff(A: Mat, B: Mat): number` (`linalg.ts`) | $\max_{ij} \lvert A_{ij} - B_{ij}\rvert$. Today there is only the boolean `matEq`. | `k:seriesErr`, `k:expIsRz`, `k:linErr`, `k:compound`, `k:evolveIsRz`, `l6-g-leftover` | `np.max(np.abs(A - B))` |
| G2 | `expmSeries(M: Mat, K: number): Mat` (`operators.ts`) | $\sum_{k=0}^{K} M^k/k!$ (partial sum), built term by term: $T_k = T_{k-1}M/k$. | `k:seriesErr` (`l6-generator:b1`) | the same loop in numpy vs `scipy.linalg.expm(M)`; errors 3.03e-1, 7.98e-2, 1.57e-2, 3.24e-4, 1.75e-9 for K = 1, 2, 3, 5, 10 at $M = -i\tfrac\pi2 S_z$ |
| G3 | `generatorOf(U: (phi: number) => Mat, h = 1e-5): Mat` (`operators.ts`) | $G \approx i\,\dfrac{U(h) - U(-h)}{2h}$ (central difference, error $O(h^2)$). It recovers $G$ from $U(\varphi) = e^{-i\varphi G}$. | `k:rate`, `k:blochVel`, `l6-g-velocity`; also listed for L7 ("derivative of Rz at 0") | `1j*(Rz(h) - Rz(-h))/(2*h)` vs `np.diag([0.5, -0.5])`, max error < 1e-9 at h = 1e-5 |
| G4 | `mpow(M: Mat, n: number): Mat` (`linalg.ts`) | $M^n$ by repeated squaring (n ≥ 0 integer). | `k:compound` (`l6-generator:b6`) | `np.linalg.matrix_power(I - 1j*Sz*(np.pi/2)/N, N)` vs `Rz(np.pi/2)`: gaps 3.032e-1, 3.127e-2, 3.089e-3, 3.085e-4 for N = 1, 10, 100, 1000 |
| G5 | `rotateBloch(n: Vec3, phi: number, r: Vec3): Vec3` (`spin.ts`, optional re-export) | Rodrigues: $r\cos\varphi + (\hat n\times r)\sin\varphi + \hat n(\hat n\cdot r)(1-\cos\varphi)$. It already exists as `qrotate(axisAngle(n, φ), r)` in `belt.ts`. | `k:so3` (`l6-active:b5`), `l6-ac-rotate-avg` | `scipy.spatial.transform.Rotation.from_rotvec(phi*n).apply(r)` |
| G6 | `phaseShift(phi: number): Mat` (`spin.ts`, convenience) | $\mathrm{diag}(1, e^{i\varphi})$, the notes' first matrix before the phase split (p. 9). Today it is inlined as `mat([[1,0],[0,expi(φ)]])`. | `k:diagTurns`, `k:RzEven` | `np.diag([1, np.exp(1j*phi)])` |

Not gaps (checked): the relative phase is `blochAngles(ψ).phi` (= arg α*β); the mixture Bloch vector is `blochOfMixture`; purity is `purity` / `purityOfNorm`; the best $P(+)$ is `maxPPlus`; the Hopf bead phase is `hopf.ts` `fiberPoint`. Named basis lists (`X`, `Y`) could become `BASIS.x`, `BASIS.y` in `spin.ts`, but that is only a convenience.

**Widget / stage gaps (W's lane, not engine; listed so P's plan can be built as written):**
- **W1** `PhaseDial` labels the relative phase θ, which clashes with the app's polar θ (E2). Relabel it φ; keep the `theta` prop as an alias or rename it to `phi`. Add `rotations?: boolean` (default true) so `l6-equator` can hide the $R_z$ buttons that come before $R_z$ is defined.
- **W2** `BlochSphere` `rotations` offers a fixed set [45, 90, −90, 180, **360**]. Its α/β phasor readout would show the 360° sign flip, which is L7 §7.2 content. Add `rotationAngles?: number[]`; L6 passes [45, 90, −90, 180] and L7 adds 360 and 720.
- **W3** (optional, D) The `bloch` stage has no drop-lines from the point to the three axes. `l6-bloch:b1–b2` would read better with an additive `projections?: boolean` on `BlochState`, drawing $r_x, r_y, r_z$. Without it the beats still work: the caption carries the numbers.
- **W4** (optional) `ComplexPlane` shows $|w|$ to 3 d.p. (1.001). The `l6-generator` Try-it quotes 1.00125, so it wants 5 d.p. in `multiply` mode, or the prompt should say "just above 1".
- **W5** (optional, D/W) `BlochState.rotate.axis` accepts only `'x' | 'y' | 'z'`. `l6-active:b8` would like to animate the half turn about $\hat m = (\hat x + \hat z)/\sqrt2$. An additive `axis: { thetaDeg, phiDeg }` form, resolved with the existing `rotation(n, φ)`, would allow it; until then the reveal shows $\hat m$ as a measurement axis and says the rest in words.

## 9. Hooks

**Concept map (`concepts.ts`).** L6 covers all three of its concept ids. Suggested `unit` fields: `bloch-sphere` → `l6-bloch` (continued in `l6-equator`), `passive-active` → `l6-active`, `rz` → `l6-generator` (built in `l6-active`). The existing `needs` fit: `bloch-sphere` ← `expectation`, `complex-amplitudes`; `passive-active` ← `basis-change`; `rz` ← `passive-active`, `bloch-sphere`. `Lecture.prerequisites` for L6: `['basis-change', 'expectation', 'complex-amplitudes', 'eigen-problem']`. The optional new concept for the beyond-lecture unit is Q3.

**Cross-lecture links.** `l6-active:b1` has a "Lecture 5" chip to `l5-coordinates:b3`, `l5-operators:b5` and `l5-invariance:b3`. `l6-bloch:b2` and `l6-bloch:b7` link back to `l5-averages:b2–b4` and `b7`. `l6-equator:b8` links back to `l5-averages:b8`. L7 §7.1 (Bloch recap) should link to `l6-bloch`, and L7 §7.3 (generator recap) to `l6-generator:b3–b5`. The belt-trick opener stays at L7 §7.2. The home-page Hopf film can be offered from the `l6-equator:b7` reveal caption ("the same fibers, rendered: home page"), since it is decoration and states no result.

**Arcade: one level idea per unit.** Each level is checked with the engine or with `arcade/golf.ts`, as the existing `games.test.ts` does. `wrong` indices are 0-based, as in `ERROR_ROUNDS`.

| Unit | Game | Level |
|---|---|---|
| `l6-bloch` | **Spot the error** | `id: 'opposite-is-minus'`, "Opposite means minus?" Steps: (0) "$\|{+z}\rangle$ sits at the north pole, $(0, 0, 1)$." (1) "$\|{-z}\rangle$ sits at the south pole, $(0, 0, -1)$." (2) "Opposite points are negatives of each other, so $\|{-z}\rangle = -\|{+z}\rangle$." (3) "Then $\langle{+z}\|{-z}\rangle = -1$." `wrong: 2`. Why: "Opposite points are *orthogonal* states; $-\|{+z}\rangle$ sits on the north pole with $\|{+z}\rangle$." Checks: `k:zOrth`, `k:negSame`. |
| `l6-equator` | **Spot the error** | `id: 'phase-in-disguise'`, "A phase that doesn't count". Steps: (0) "$\|{+y}\rangle = \tfrac{1}{\sqrt2}(\|{+z}\rangle + i\|{-z}\rangle)$." (1) "Multiply the whole state by $i$: $\tfrac{1}{\sqrt2}(i\|{+z}\rangle - \|{-z}\rangle)$." (2) "Its $\|{-z}\rangle$ amplitude is now $-\tfrac{1}{\sqrt2}$, just as in $\|{-x}\rangle$." (3) "So multiplying by $i$ turned $\|{+y}\rangle$ into $\|{-x}\rangle$." `wrong: 3`. Why: "Only $\beta/\alpha$ matters, and $(-1)/i = i$: still $\|{+y}\rangle$." Check: `samePhysicalState(vscale(KET['+y'], c(0,1)), KET['+y'])` → true. |
| `l6-active` | **Bloch golf** | `id: 'x-to-minus-y'`, "The other way round". `start: '+x'`, `target: '-y'`, `par: 1`, `solution: [{ axis: 'z', sign: -1 }]`. Hint: "Which way does a positive turn about z carry +x?" Why: "$R_z(-90^\circ)$ turns clockwise seen from +z." Checked: `reached(applyMoves('+x', [{axis:'z', sign:-1}]), '-y')` → true. Also re-point the existing `z-to-x`, `x-to-y`, `z-to-minus-y` and `flip` levels' `trains` from L7 `rotations` to `l6-active`. `full-turn` stays with L7 §7.2. |
| `l6-generator` | **Spot the error** | `id: 'small-turn-sign'`, "A sign slip in the small turn". Steps: (0) "$R_z(\varphi) = e^{-i\varphi S_z/\hbar}$." (1) "Keep two terms: $R_z(d\varphi) \approx I + \tfrac{i}{\hbar}S_z\,d\varphi$." (2) "Apply it to $\|{+x}\rangle$ with $d\varphi = 0.001$." (3) "The point moves toward +y, a counterclockwise turn." `wrong: 1`. Why: "$e^{-iM} \approx I - iM$. With the + sign the point would move toward −y." Check: `blochVector(apply(madd(identity(2), mscale(SZ, c(0, 0.001))), KET['+x']))` → (1, −0.001, 0). |
| `l6-mixture` | **Route the beam** | `id: 'purify-then-tilt'`, "Purify, then tilt". `source: 'oven'`, `target: { spot: 'plus', fraction: 3/8, label: '⅜' }`, `maxDevices: 2`, `start: { axes: ['z'], keep: [] }`, `solution: { axes: ['z', 60], keep: ['+'] }`. Hint: "One magnet alone gives ½ from the oven at any angle, so filter first." Why: "Keeping + makes a pure $\|{+z}\rangle$ beam of ½; a 60° magnet passes $\cos^2 30^\circ = \tfrac34$ of it: $\tfrac12\cdot\tfrac34 = \tfrac38$." Checks: `benchTheory({source:'oven', axes:['z',60], keep:['+']}).plus` → 0.375; `benchTheory({source:'oven', axes:[60], keep:[]}).plus` → 0.5, so the start position does not win. |

## 10. Fidelity notes per stage kind

The contracts in `fidelity.ts` (from P2 §2) stay in force. Below, per stage kind L6 uses: where it is used, which existing items light up, and the **new** items L6 needs, each with a proposed id and a student-facing sentence.

### `bloch` — the workhorse (`l6-bloch`, `l6-equator`, `l6-active`, `l6-generator`)
- Existing items lit: `bloch-one-point`, `bloch-born`, `bloch-axes-unitless`, `bloch-double-angle` (the six-state tour, the equator), `bloch-global-phase-hidden` (every $R_z$ beat), `bloch-not-lab-space` (`l6-active:b8`).
- **What it gets right (new, exact):**
  - `bloch-rotation-exact`: "A turn $R_z(\varphi)$ moves the point by exactly φ about the z axis, counterclockwise seen from +z. The three averages turn like an ordinary arrow, and the height $\langle S_z\rangle$ never changes." (`k:anyTurn`, `k:so3`)
  - `bloch-phase-is-longitude`: "On the equator the longitude *is* the relative phase of the $|{-z}\rangle$ amplitude against the $|{+z}\rangle$ amplitude." (`k:azimuthIsPhase`)
- **What it distorts (new):**
  - `bloch-averages` (schematic): "The coordinates are averages over many atoms, each measured along one axis only. No single atom has three spin values at once."
  - `bloch-sweep-speed` (schematic): "The animated turn only shows the in-between angles. $R_z(\varphi)$ takes a state straight from before to after, and the speed you see means nothing (turning in time is a later lecture)."
  - `bloch-rotate-xyz-only` (schematic, stage limit): "This stage animates turns about x, y and z only. The half turn about the in-between axis in `l6-active:b8` is described, not animated."
- Scope guard: no L6 beat sweeps a rotation past 180°. The sphere cannot show the sign $R_z(360^\circ) = -I$ anyway (`bloch-global-phase-hidden`), and L7 §7.2 teaches it with the belt.

### `hilbert-plane` (`l6-active:b1` top pane, `l6-bloch:b8` reveal)
- Existing items lit: `plane-angles-true`, `plane-shadow-born`, `plane-half-angles`, `plane-bloch-doubles`, `plane-sign-twice`.
- **Gets right (new, exact):** `plane-passive-frame`: "Turning the frame while the arrow stays put is exactly a change of basis: the new shadows are the new coordinates, and the state has not moved."
- **Distorts:** only real states fit (`plane-real-slice`), so no L6 beat puts a complex state or the y basis here.

### `hopf` (`l6-equator:b7` reveal, `l6-active:b7` reveal)
- Existing items lit: `hopf-fiber-state`, `hopf-mini-exact`, `hopf-flattened`, `hopf-distances-distorted`, `hopf-brightness`.
- **Gets right (new, exact):** `hopf-rotation-slides`: "Turning $|{+z}\rangle$ by φ about z slides its bead back along its own circle by φ/2, and the mini-sphere point never moves. Any other state is also carried to a different circle."
- **Distorts:** the bead's lap is drawn in the flattened space, so equal phase steps do not look equally long (`hopf-distances-distorted`). No L6 beat takes the bead past a quarter lap from a rotation, so the half-lap sign fact stays in L7.

### `operator-space` (`l6-generator:b1–b3, b8`, `l6-active:b8`)
- Existing items lit: `op-one-point`, `op-length-not-size`, `op-ghost-sphere`, `op-a0-gauge` (the gauge is off in L6 beats, since $a_0 = 0$ throughout).
- **Gets right (new, exact):** `op-generator-axis`: "For a spin component, the arrow points along the axis of the turn it generates. Its two eigenstates, at the ends of that axis, are the only states the turn leaves in place."
- **Distorts (new, misleading on purpose):** `op-unitary-not-drawn`: "Operator space draws Hermitian matrices only. The rotation $R_z(\varphi)$ is unitary, not Hermitian, so it has no arrow here; you see its generator $S_z$ instead. $B_{z\leftarrow x}$ appears in `l6-active:b8` only because it happens to be both."

### `bloch-ball` (`l6-mixture`)
- Existing items lit: `ball-surface-pure`, `ball-born-inside`, `ball-many-recipes`, `ball-inside-not-partly-up`, `ball-direction-average`.
- **Gets right (new, exact):** `ball-rotation-rigid`: "A rotation turns the whole ball rigidly. Every point keeps its distance from the centre, so purity never changes, and the centre (the oven beam) never moves." (`k:mixTurn`)
- **Distorts:** nothing beyond P2 §2. The purity readout shows $\mathrm{tr}\,\rho^2$, which is glossed at `l6-mixture:b4` before it is switched on.

### `lab-r3` (`l6-equator:b8`)
- Existing items lit: `lab-born-fractions`, `lab-chips-captions`, `lab-beam-along-y`. The last one is why the clue uses $|{+x}\rangle$ and x magnets: the bench cannot point a magnet along y, the beam's own axis, which is the limit L5's $|{+y}\rangle$ clue ran into.
- No new items.

## 11. Questions for the user

### Ownership notes (from the orchestrator, 2026-09-27; recorded, not questions)
1. **L5 owns** the coherence formulas ($\langle S_x\rangle = \hbar\,\mathrm{Re}\,\alpha^*\beta$, $\langle S_y\rangle = \hbar\,\mathrm{Im}\,\alpha^*\beta$), the basis-change matrix $B$ written $B_{z\leftarrow x}$ (output ← input) with $c_{\text{new}} = B^\dagger c_{\text{old}}$ and $A_{\text{new}} = B^\dagger AB$, diagonalization, and "predictions don't change with the basis". Where the L6 notes repeat these (pp. 2–6), this plan links back to `l5-coordinates`, `l5-operators` and `l5-invariance` (`l6-active:b1`), `l5-averages` (`l6-bloch:b2`, `b7`) and `l5-averages:b8` (`l6-equator:b8`) instead of re-teaching. The earlier unit `l6-arrows` was dropped for this reason (§0).
2. **L5's E6 is handled here.** $B_x$ has determinant −1, so it is not itself a rotation, but it equals $i$ times a 180° rotation about $(\hat x + \hat z)/\sqrt2$. This is `l6-active:b8` (claims `k:detB`, `k:BisHalfTurn`, `k:passiveEqualsActive`), worded as "we use it passively", never "a basis change is never a rotation".
3. **Variance** is introduced in L3 (`l3-spread`) and treated in full in L7. L6 does not define it: no beat, claim or glossary entry mentions it, and E3 records only that the notes defer it.
4. **L6 owns the full Bloch-sphere treatment.** L2 and L5 use the sphere only as labelled previews. `l6-bloch` is where it is named, derived ($|\vec r| = 1$ from the amplitudes) and read (six states, averages not readings, opposite = orthogonal).

### Genuine questions

**Q1. Notation for angles (affects L6 and L7).** The notes use θ for the angle around the equator and ϕ for the rotation angle. The app uses θ for the polar angle and φ for the azimuth, and that is locked, since stage fields `thetaDeg`/`phiDeg` and every widget follow it.
*Recommendation:* in L6 prose the notes' equatorial θ becomes **φ** (glossed once: "the notes call this θ"). The rotation angle stays **φ** in $R_z(\varphi)$, as in the notes, Townsend, the engine and the concept map, and a starting longitude is written **φ₀**, so a turn by φ lands at φ₀ + φ. The same letter does double duty on purpose: turning $|{+x}\rangle$ by φ lands exactly at longitude φ. L7 would adopt the same scheme.
*Alternative:* give the rotation angle its own letter (for example $R_z(\gamma)$). That is cleaner on paper, but then every source the learner opens disagrees with the app.

**Q2. Keep the one time-evolution beat?** `l6-generator:b7` (badged "beyond the lecture") uses Susskind §4.5/§4.11 to show that time evolution in a field along z is $R_z(\omega t)$, the same generator idea. Lectures 1–7 never cover time evolution.
*Recommendation:* keep it. It is one beat, clearly badged, it makes "generator" feel less arbitrary, and the engine checks it (`evolve(SZ, t)` = `Rz(t)`). Cut it if you would rather L6 not preview material outside the course.

**Q3. Should the beyond-the-lecture unit appear on the concept map?** `l6-mixture` (decision L1 #6) has no concept id. The map's rule is "real course topics, paraphrased from each lecture's own overview", and mixtures are not in the notes.
*Recommendation:* add no concept id, and show the unit only inside L6 with its badge. Alternatively, add `{ id: 'mixed-states', label: 'Mixtures and the Bloch ball (beyond the lecture)', lecture: 'L6', unit: 'l6-mixture', needs: ['bloch-sphere', 'prepares'] }`, which `concepts.test.ts` would accept since it builds only on earlier concepts.
