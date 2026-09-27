# P-L5 — Lecture 5 story plan: spin operators, expectation values and basis changes

## 0. Lecture map

Proposal only (role P). Nothing under `app/` is modified. Template: `P2-L1-story.md`. Every number below was
recomputed with an independent numpy script while drafting (seed 448 for the random invariance checks); the
engine call that must reproduce it in the app is named next to it.

**Conventions (same as L1).**
- Beat id `<unit>:b<n>`. Phase tag **[L]** lecture says, **[B]** books add, **[C]** clue (click-to-reveal).
  Order inside a unit is always L → B → C.
- ħ = 1 inside the engine, $S_k = \sigma_k/2$; the UI appends ħ. So an engine value 0.25 is shown as "ħ/4",
  0.4330 as "$\sqrt3\,\hbar/4 \approx 0.433\,\hbar$".
- Kets: app names $|{\pm z}\rangle, |{\pm x}\rangle, |{\pm y}\rangle$, with $|{+y}\rangle = (1, i)/\sqrt2$ and
  $|{-y}\rangle = (1, -i)/\sqrt2$. Eigenvector phase: first entry real and ≥ 0 (`canonicalPhase`).
  Rosetta: notes ↑/↓ = $|{\pm z}\rangle$; Susskind $|u\rangle, |d\rangle, |r\rangle, |l\rangle, |i\rangle, |o\rangle$
  = $|{+z}\rangle, |{-z}\rangle, |{+x}\rangle, |{-x}\rangle, |{+y}\rangle, |{-y}\rangle$.
- **Basis-change direction (said once in `l5-coordinates:b3`, then used everywhere).** The L5 notes write $B_x$
  for the matrix whose columns are $|{+x}\rangle, |{-x}\rangle$ written in z coordinates; it turns x coordinates
  into z coordinates, $c_z = B_x c_x$. The app writes the same matrix with an arrow, output ← input:
  $B_{z\leftarrow x} \equiv B_x$ (the arrow labels are the L6 notes' own, and `BasisTranslator` already uses
  them). Its inverse is $B_{x\leftarrow z} = B_{z\leftarrow x}^{\dagger} \equiv B_x^{\dagger}$, so
  $c_x = B_{x\leftarrow z}\,c_z$ and $A^{(x)} = B_{x\leftarrow z}\,A^{(z)}\,B_{z\leftarrow x}$ (notes:
  $A_{\text{new}} = B^\dagger A_{\text{old}} B$). Engine: `basisMatrix(newBasis)` = $B_{\text{old}\leftarrow\text{new}}$,
  `toBasis` = $B^\dagger c_{\text{old}}$, `operatorInBasis` = $B^\dagger A B$.
- Superscripts in parentheses name the **basis** of a matrix, subscripts name the **component**:
  $S_z^{(x)}$ = the z-spin operator written in x coordinates.
- Shorthand in claims: `psiEx` = `ketFromBloch(60°, 90°)` = $(\sqrt3/2,\ i/2)$ (the notes' p. 5 state);
  `psi30` = the real state $(\cos30^\circ, \sin30^\circ) = (\sqrt3/2, 1/2)$ (L4's worked state);
  `Bx` = `basisMatrix([KET['+x'], KET['-x']])`, `By` = `basisMatrix([KET['+y'], KET['-y']])`,
  `XB` = `[KET['+x'], KET['-x']]`, `YB` = `[KET['+y'], KET['-y']]`. Angles in degrees are converted with DEG.

**Coordination with L4 and L6 (who owns what).**
- *First in L4's notes → one recap beat each in L5.* L4 §4.2–4.3 (pp. 14–16) already builds $S_y$ from its
  projectors, lists the three matrices and checks Hermiticity; L4 §3 (pp. 10–12) derives
  $\langle A\rangle = \langle\psi|A|\psi\rangle$ with the real example $\langle S_z\rangle = \hbar/4$; L4 §5
  (pp. 17–19) solves the $S_x$ eigenvalue problem and even writes $\langle\pm x|\psi\rangle = (\alpha\pm\beta)/\sqrt2$.
  L5 pp. 2–3 and pp. 6–7 repeat that material almost line for line. So: **`l5-averages:b1`** recaps the spin
  matrices and **`l5-inverse:b1`** recaps the $S_x$ eigenproblem. Nothing else re-teaches them.
- *First in L5's notes → owned here.* The coherence formulas $\langle S_x\rangle = \hbar\,\mathrm{Re}(\alpha^*\beta)$,
  $\langle S_y\rangle = \hbar\,\mathrm{Im}(\alpha^*\beta)$ and the complex example (pp. 4–5); the $S_y$
  eigenproblem (assigned homework, p. 1); the basis matrix and $c_{\text{new}} = B^\dagger c_{\text{old}}$
  (pp. 8–10); $A_{\text{new}} = B^\dagger A B$, the operator example and the diagonalization proof (pp. 11–13);
  the invariance check (p. 14). The L6 notes open by "finishing Lecture 5" (L6 pp. 1–5) and add the arrow
  labels; since this material is **first in L5's notes**, L5 owns it and the L6 plan should recap it in one beat.
- *Left to later lectures.* Variance and uncertainty: L5 p. 1 moves them out, L6 p. 1 defers them again,
  L7 §7.7 teaches them. The p. 14 check $\Delta S_z = 0$ is therefore replaced by an equivalent projector check
  (`l5-invariance:b2`); see §7 E2 and Q2. The Bloch sphere as a picture, passive vs active, and $R_z$ are L6's.

| # | id | Title (≤ 8 words) | Question | Source pages | Book refs (§ + printed page) |
|---|---|---|---|---|---|
| 1 | `l5-averages` | Three averages from one column | Given a state's two z amplitudes, what are the average spin readings along x, y and z? | L5 pp. 2–5 (pp. 2–3 recap L4 pp. 14–16) | Townsend §2.6 pp. 58–59 (eq. 2.105, Ex. 2.7); Townsend §3.6 pp. 94–96 (Pauli matrices, eq. 3.90); Susskind §3.4 (printed pp. 75–80 per the L4 notes), §3.8 (pp. 90–91 per the L6 notes) |
| 2 | `l5-inverse` | Matrix in, outcomes and states out | Handed only a matrix, how do we find its possible readings and the states that give them for sure? | L5 pp. 6–7 (recap of L4 pp. 17–19); p. 1 scope box (the $S_y$ homework) | Susskind §3.7 (Ex. 3.3–3.4); Townsend §2.4 p. 50 (Hermitian = its transpose conjugate); Townsend §3.6 p. 96 |
| 3 | `l5-coordinates` | Same state, new coordinates | How do we rewrite a state's column so that its entries are the amplitudes for an x measurement? | L5 pp. 8–10 | Townsend §2.5 pp. 54–55 (eqs. 2.94–2.95, footnote 10) |
| 4 | `l5-operators` | Operators change coordinates too | How must an operator's matrix change with the basis, and why is it diagonal in its own eigenbasis? | L5 pp. 11–13 | Townsend §2.4 pp. 48–49 (eq. 2.70); §2.5 pp. 55–57 (eqs. 2.98–2.100, Ex. 2.5) |
| 5 | `l5-invariance` | Predictions ignore the coordinates | Why does every average and every probability come out the same in any basis? | L5 p. 14 (and the p. 15 board reference) | Townsend §2.5 p. 56 (eq. 2.102); §2.6 pp. 58–59 (eq. 2.107, Ex. 2.6) |

Beat count: 8 + 6 + 8 + 8 + 6 = **36 beats** (22 lecture, 7 books, 7 clues; 2 of the lecture beats are the
L4 recaps). Stage kinds used: `operator-space`, `bloch`, `hilbert-plane`, `lab-r3` (one clue); no `bloch-ball`, no `hopf`.

## 1. Story beats per unit

Format per beat: **Text** (core prose; `[[id]]` = glossary tag, `{{anchor|words}}` = stage term link) ·
**Stage** (a literal `StageState` from `stage.ts`, only real fields) · **Caption** · **Claims** (statement →
engine call → expected value, 4 d.p.) · **Links** (term → `ANCHORS[kind]` entry). Clue beats add **Reveal**.
Stage states carry inputs only (kets, degrees, matrices); every probability or average in a caption is
recomputed by `stage/resolve.ts` or backed by the listed claim.

### Unit `l5-averages` — Three averages from one column

Stage plan: `operator-space` for the recap, then `bloch` for the averages. The `bloch` stage is used here *as a
plot of the three averages*: its axes are literally $\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle$
(the passport already says so). Lecture 6 names and explains the sphere; b2's caption says that in one line.
The notes' example state is complex, so `hilbert-plane` cannot show it (fidelity `plane-real-slice`).

**`l5-averages:b1` [L] — recap of L4 §4.2–4.3 (the only recap beat for the spin matrices)**
- Text: "Lecture 4 built each spin matrix from its outcomes and their [[projector|projectors]]:
  $S_y = \tfrac{\hbar}{2}(P_{+y} - P_{-y})$, with $P_{\pm y} = |{\pm y}\rangle\langle{\pm y}|$. The bra
  $\langle{+y}|$ carries $-i$, the [[complex-conjugate|conjugate]] of the ket's $i$. In the z basis all three read
  $S_k = \tfrac{\hbar}{2}\sigma_k$ for $k = x, y, z$, with $\sigma_k$ the [[pauli-matrices|Pauli matrices]], and all three are [[hermitian|Hermitian]]."
- Stage: `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: true, shot: 'O-STD' }`
- Caption: "$S_y = \tfrac{\hbar}{2}\begin{pmatrix}0&-i\\ i&0\end{pmatrix}$ · its arrow lies along $a_y$; its two
  definite-outcome states sit at the ends of that axis"
- Claims:
  - $S_y$ from its spectrum equals the matrix → `matEq(fromSpectrum([0.5, -0.5], [KET['+y'], KET['-y']]), SY)` → `true`
  - lower-right entry of $P_{+y}$ is ½ → `projector(KET['+y'])[1][1]` → `0.5 + 0i`; without the conjugate
    the notes' checkpoint gets the wrong sign → `mul(KET['+y'][1], KET['+y'][1])` → `−0.5`
  - all three Hermitian → `[SX, SY, SZ].every((m) => isHermitian(m))` → `true`
  - arrow length ½ along $a_y$ → `decomposeHermitian(SY)` → `{ a0: 0, a: [0, 0.5, 0] }`
- Links: `S_y` → `arrow-a` · `|{\pm y}\rangle` → `eigen-plus`, `eigen-minus`.

**`l5-averages:b2` [L] — L5 p. 4, the z component**
- Text: "Write a normalized state as the column $c_z = (\alpha, \beta)$, meaning
  $|\psi\rangle = \alpha|{+z}\rangle + \beta|{-z}\rangle$ with $|\alpha|^2 + |\beta|^2 = 1$. Its z average is
  $\langle S_z\rangle = \langle\psi|S_z|\psi\rangle = \tfrac{\hbar}{2}(|\alpha|^2 - |\beta|^2)$. Only the
  [[population|populations]] $|\alpha|^2$ and $|\beta|^2$ enter."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 60, phiDeg: { from: 0, to: 360 } }, measure: 'z', trail: true, shot: 'B-STD' }`
- Caption: "each state is drawn as the point $(\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle)$
  (Lecture 6 names this the Bloch sphere) · we turn the phase of $\beta$: the height stays, $\langle S_z\rangle = \hbar/4$"
- Claims: populations fix $\langle S_z\rangle$ → for φ ∈ {0°, 90°, 180°, 270°}:
  `expectation(SZ, ketFromBloch(60*DEG, φ*DEG))` → `0.25` each.
- Links: `\langle S_z\rangle` → `z` · `|\alpha|^2, |\beta|^2` → `point`.

**`l5-averages:b3` [L] — L5 p. 4, the x component**
- Text: "$S_x$ swaps the two entries of the column. So
  $\langle S_x\rangle = \tfrac{\hbar}{2}(\alpha^*\beta + \beta^*\alpha) = \hbar\,\mathrm{Re}(\alpha^*\beta)$, where
  $\alpha^*$ is the conjugate of $\alpha$. The product $\alpha^*\beta$ is the [[coherence]]; its [[real-part|real part]]
  sets the x average."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 60, phiDeg: { from: 0, to: 360 } }, measure: 'x', trail: true, shot: 'B-STD' }`
- Caption: "same circle · the x coordinate swings, so $\langle S_x\rangle$ runs between $+0.433\,\hbar$ and $-0.433\,\hbar$"
- Claims:
  - `expectation(SX, ketFromBloch(60*DEG, 0))` → `0.4330` ($=\sqrt3/4$); at φ = 180° → `−0.4330`
  - coherence rule, seeded random normalized ψ (3 states, seed 448):
    `expectation(SX, psi)` equals `mul(conj(psi[0]), psi[1]).re` to 1e-12
- Links: `\mathrm{Re}(\alpha^*\beta)` → `x` · `\langle S_x\rangle` → `axis-n`.

**`l5-averages:b4` [L] — L5 p. 4, the y component**
- Text: "$S_y$ also swaps the entries, and puts $-i$ on the top one and $+i$ on the bottom one. That gives
  $\langle S_y\rangle = \tfrac{\hbar}{2}(-i\alpha^*\beta + i\beta^*\alpha) = \hbar\,\mathrm{Im}(\alpha^*\beta)$, the
  [[imaginary-part|imaginary part]]. It is a real number, although $S_y$ has imaginary entries."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 60, phiDeg: { from: 0, to: 360 } }, measure: 'y', trail: true, shot: 'B-STD' }`
- Caption: "the y coordinate peaks when $\alpha^*\beta$ is purely imaginary"
- Claims:
  - `expectation(SY, ketFromBloch(60*DEG, 90*DEG))` → `0.4330`; at φ = 270° → `−0.4330`
  - seeded random ψ as in b3: `expectation(SY, psi)` equals `mul(conj(psi[0]), psi[1]).im` to 1e-12
  - always real: `Math.abs(inner(psi, apply(SY, psi)).im) < 1e-12` → `true`
- Links: `\mathrm{Im}(\alpha^*\beta)` → `y` · `\langle S_y\rangle` → `axis-n`.

**`l5-averages:b5` [L] — L5 p. 5, one state, three averages**
- Text: "Take $\alpha = \tfrac{\sqrt3}{2}$ and $\beta = \tfrac{i}{2}$: populations $\tfrac34$ and $\tfrac14$, coherence
  $\alpha^*\beta = \tfrac{i\sqrt3}{4}$. So $\langle S_z\rangle = \tfrac{\hbar}{4}$, $\langle S_x\rangle = 0$ and
  $\langle S_y\rangle = \tfrac{\sqrt3}{4}\hbar \approx 0.433\,\hbar$. Each average comes from its own batch of freshly
  prepared atoms; no single atom carries all three."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 60, phiDeg: 90 }, shot: 'B-STD' }`
- Caption: "$c_z = (\sqrt3/2,\ i/2)$ · the point sits at $(0,\ 0.866,\ 0.5)$ in units of $\hbar/2$"
- Claims:
  - `ketFromBloch(60*DEG, 90*DEG)` equals `vec(Math.sqrt(3)/2, c(0, 0.5))` (psiEx is the notes' state)
  - `expectation(SZ, psiEx)` → `0.25` · `expectation(SX, psiEx)` → `0` · `expectation(SY, psiEx)` → `0.4330`
  - the notes' direct check → `apply(SY, psiEx)` → `(0.25, 0.4330i)` (their $\tfrac{\hbar}{2}(1/2,\ i\sqrt3/2)$)
  - `mul(conj(psiEx[0]), psiEx[1])` → `0 + 0.4330i`; `blochVector(psiEx)` → `[0, 0.8660, 0.5]`
- Links: `\langle S_z\rangle` → `z` · `\langle S_y\rangle` → `y` · `\langle S_x\rangle = 0` → `x`.

**`l5-averages:b6` [B] — Townsend**
- Text: "Townsend (§2.6) writes the same average as a row, times a matrix, times a column. His Example 2.7 swaps our
  populations: $\alpha = \tfrac12$, $\beta = \tfrac{i\sqrt3}{2}$. He gets $\langle S_z\rangle = -\tfrac{\hbar}{4}$,
  and reaches the same Pauli matrices by a different road (§3.6)."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 120, phiDeg: 90 }, measure: 'z', shot: 'B-STD' }`
- Caption: "Townsend's state sits below the equator: $\langle S_z\rangle = -\hbar/4$"
- Claims: `ketFromBloch(120*DEG, 90*DEG)` equals `vec(0.5, c(0, Math.sqrt(3)/2))`;
  `expectation(SZ, ketFromBloch(120*DEG, 90*DEG))` → `−0.25`.
- Refs: `{ source: 'townsend', where: '§2.6, pp. 58–59 (eq. 2.105, Ex. 2.7)', adds: 'The average as row × matrix × column, and a worked complex example with the populations swapped.' }`,
  `{ source: 'townsend', where: '§3.6, pp. 94–96 (eqs. 3.77–3.90)', adds: 'Builds $S_x$ and $S_y$ from raising and lowering operators instead of projectors, and lands on the same Pauli matrices.' }`
- Links: `\langle S_z\rangle` → `z`.

**`l5-averages:b7` [B] — Susskind, spin-polarization principle**
- Text: "Susskind shows that every spin state reads + for certain along some axis (§3.8). So the three averages can
  never all be zero. In fact $\langle\sigma_x\rangle^2 + \langle\sigma_y\rangle^2 + \langle\sigma_z\rangle^2 = 1$
  for every state; here $0 + 0.75 + 0.25 = 1$."
- Stage: `{ kind: 'bloch', state: { thetaDeg: 60, phiDeg: 90 }, measure: { thetaDeg: 60, phiDeg: 90 }, shot: 'B-STD' }`
- Caption: "magnet along the state's own axis: every atom reads +"
- Claims:
  - sum of squares → `blochVector(psiEx).reduce((s, x) => s + x * x, 0)` → `1`
  - certain + along that axis → `prob(ketAlong(blochVector(psiEx)), psiEx)` → `1`
- Refs: `{ source: 'susskind', where: '§3.8 (printed pp. 90–91, as cited by the L6 notes)', adds: 'The spin-polarization principle: every pure spin state is the + eigenstate of some component, so the squared averages of σx, σy, σz add to 1.' }`,
  `{ source: 'susskind', where: '§3.4', adds: 'The same three matrices, built from the eigenvector conditions for |u⟩|d⟩, |r⟩|l⟩, |i⟩|o⟩ (our ±z, ±x, ±y).' }`
- Links: `\langle\sigma_x\rangle^2 + \dots = 1` → `point` · "some axis" → `axis-n`.

**`l5-averages:b8` [C] — is $|{+y}\rangle$ unpolarized?**
- Text (question): "Prepare $|{+y}\rangle$. A z magnet splits it 50/50, and so does an x magnet, just like the oven's
  [[unpolarized]] beam. Are the two beams the same?"
- Stage: `{ kind: 'lab-r3', benches: [ { id: 'A', source: '+y', devices: [{ axis: 'z' }] }, { id: 'B', source: '+y', devices: [{ axis: 'x' }] } ], readouts: ['fill-bar'], shot: 'L-3Q' }`
- Caption: "$|{+y}\rangle$ into a z magnet (top) and an x magnet (bottom): both 50/50"
- Claims: `benchTheory({ source: '+y', axes: ['z'], keep: [] }).plus` → `0.5`; same with `['x']` → `0.5`;
  oven along z → `0.5`.
- Reveal text: "No: for $|{+y}\rangle$ the coherence $\alpha^*\beta = \tfrac{i}{2}$ is purely imaginary, so
  $\langle S_x\rangle = 0$ but $\langle S_y\rangle = +\tfrac{\hbar}{2}$, and every atom reads + along y. The oven's beam
  averages zero along every axis. Our bench cannot show the difference, because a magnet cannot point along the
  beam's own direction, y."
- Reveal stage: `{ kind: 'bloch', state: '+y', measure: 'y', shot: 'B-EQUATOR' }`
- Reveal caption: "$|{+y}\rangle$: $(\langle S_x\rangle, \langle S_y\rangle, \langle S_z\rangle) = (0,\ \tfrac{\hbar}{2},\ 0)$"
- Reveal claims: `expectation(SX, KET['+y'])` → `0`, `expectation(SY, KET['+y'])` → `0.5`,
  `expectation(SZ, KET['+y'])` → `0`; `mul(conj(KET['+y'][0]), KET['+y'][1])` → `0 + 0.5i`;
  oven average zero along tilts 0°, 45°, 90°: `2*benchTheory({ source: 'oven', axes: [t], keep: [] }).plus - 1` → `0`.
- Fidelity: `lab-beam-along-y`.
- Links: `|{+y}\rangle` → `point` (reveal) · "y" → `y` (reveal) · "50/50" → `fill-bar` (question).

### Unit `l5-inverse` — Matrix in, outcomes and states out

Stage plan: `operator-space` (the matrix as an object, its eigen-axis) and `hilbert-plane` (the eigenvectors as a
new frame). L5 pp. 6–7 repeat L4 pp. 17–19 almost verbatim, so the whole $S_x$ solution is **one** recap beat;
the rest of the unit is what L5 adds (the bridge to coordinates, the assigned $S_y$ problem) and what the books add.
The $S_y$ eigenproblem is **assigned homework** (L5 p. 1): no beat, reveal or claim works it out.

**`l5-inverse:b1` [L] — recap of L4 §5 (the only recap beat for the $S_x$ eigenproblem)**
- Text: "Lecture 4 asked which numbers $\lambda$ allow a nonzero column $w = (a, b)$ with $S_x w = \lambda w$. That
  needs the [[determinant]] $\det(S_x - \lambda I) = \lambda^2 - \tfrac{\hbar^2}{4}$ to vanish, so
  $\lambda = \pm\tfrac{\hbar}{2}$. Putting each $\lambda$ back gives $b = \pm a$, hence
  $|{\pm x}\rangle = (1, \pm1)/\sqrt2$."
- Stage: `{ kind: 'operator-space', op: { named: 'Sx' }, eigen: true, shot: 'O-STD' }`
- Caption: "the [[characteristic-equation|characteristic equation]] gives the outcomes; back-substitution gives the states"
- Claims:
  - `det2(msub(SX, mscale(identity(2), 0.5)))` → `0`; same with `−0.5` → `0`; at `λ = 0.3` → `−0.16` (≠ 0)
  - `eigenHermitian2(SX)` → values `[0.5, −0.5]`, vectors `KET['+x']`, `KET['-x']` (each to 1e-12)
- Links: `\lambda = \pm\tfrac{\hbar}{2}` → `eigen-plus`, `eigen-minus` · `S_x` → `arrow-a`.
- Note: $I$ (identity matrix) and $\lambda$ (eigenvalue) are L3/L4 symbols; §6 lists the forward gloss tags.

**`l5-inverse:b2` [L] — L5 p. 7 (last box), the bridge**
- Text: "The answer delivers two things. The eigenvalues are the possible readings, and the unit eigenvectors are the
  states that give them for sure. Because those eigenvectors are orthonormal, they can also serve as new coordinate
  axes, where $S_x$ will look simplest."
- Stage: `{ kind: 'hilbert-plane', basis: 'x', rightAngle: true, shot: 'H-FLAT' }`
- Caption: "the x frame: $|{+x}\rangle \perp |{-x}\rangle$, both of length 1"
- Claims: `inner(KET['+x'], KET['-x'])` → `0`; `norm(KET['+x'])` → `1`, `norm(KET['-x'])` → `1`;
  completeness → `matEq(madd(projector(KET['+x']), projector(KET['-x'])), identity(2))` → `true`.
- Links: "coordinate axes" → `basis-1`, `basis-2` · "orthonormal" → `right-angle`.

**`l5-inverse:b3` [L] — L5 p. 1 scope box: the $S_y$ problem is homework**
- Text: "The same recipe applied to $S_y$ is assigned homework (L5 p. 1). Its entries $\mp i\hbar/2$ make the algebra
  complex, but the steps do not change: determinant, back-substitution, normalization, phase choice."
- Stage: `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: false, shot: 'O-STD' }` (eigen-axis hidden on purpose)
- Caption: "$S_y = \tfrac{\hbar}{2}\begin{pmatrix}0&-i\\ i&0\end{pmatrix}$ · assigned: the app gives hints, not the working"
- Claims: `isHermitian(SY)` → `true` (nothing that solves the problem).
- Links: `S_y` → `arrow-a`.

**`l5-inverse:b4` [B] — Susskind, any direction**
- Text: "Susskind turns the apparatus to any unit vector $\hat n$ in the x–z plane and solves for
  $\sigma_n = \hat n\cdot\vec\sigma = n_x\sigma_x + n_y\sigma_y + n_z\sigma_z$ (his Exercise 3.3). The eigenvalues
  come out $\pm1$ for every direction, with orthogonal eigenvectors. However the magnet is turned, it only ever reads $\pm1$."
- Stage: `{ kind: 'operator-space', op: { matrix: [['cos(pi/3)', 'sin(pi/3)'], ['sin(pi/3)', '-cos(pi/3)']] }, eigen: true, shot: 'O-STD' }`
  ($\sigma_n$ at 60° from z toward x)
- Caption: "$\sigma_n$ at $60^\circ$: readings $\pm1$, eigen-axis along $\hat n$"
- Claims: for θ ∈ {30°, 60°, 137°}: `eigenHermitian2(nDotSigma(tiltXZ(θ*DEG))).values` → `[1, −1]`;
  orthogonal → `inner(E.vectors[0], E.vectors[1])` with `E = eigenHermitian2(nDotSigma(tiltXZ(θ*DEG)))` → `0`.
- Refs: `{ source: 'susskind', where: '§3.7, Ex. 3.3–3.4', adds: 'The eigenvalue problem for a spin component along any direction: always ±1, always orthogonal eigenvectors; Ex. 3.4 extends it off the x–z plane.' }`
- Links: `\hat n` → `arrow-a` · `\pm1` → `eigen-plus`, `eigen-minus`.

**`l5-inverse:b5` [B] — Townsend on Hermitian matrices, plus the stage's general form (beyond the lecture)**
- Text: "Townsend (§2.4, p. 50) shows that a Hermitian operator's matrix satisfies $A_{jk} = A_{kj}^*$, so complex
  entries are allowed. Every Hermitian 2×2 matrix can be written $a_0 I + \vec a\cdot\vec\sigma$ with real numbers
  $a_0$ and $\vec a = (a_x, a_y, a_z)$. Its readings are $a_0 \pm |\vec a|$: always real."
- Stage: `{ kind: 'operator-space', op: { matrix: [['2', '1-i'], ['1+i', '0']] }, eigen: true, gauge: true, shot: 'O-GAUGE' }`
- Caption: "$A = \begin{pmatrix}2&1-i\\ 1+i&0\end{pmatrix}$: $a_0 = 1$, $\vec a = (1, 1, 1)$, readings $1 \pm \sqrt3$"
- Claims: `decomposeHermitian(A)` → `{ a0: 1, a: [1, 1, 1] }`; `eigenHermitian2(A).values` → `[2.7321, −0.7321]`;
  `isHermitian(A)` → `true`.
- `beyondLecture: true` (the $a_0 I + \vec a\cdot\vec\sigma$ form is the stage's, not the notes').
- Refs: `{ source: 'townsend', where: '§2.4, p. 50 (eqs. 2.79–2.80)', adds: 'The matrix of the adjoint is the transpose conjugate, so a Hermitian operator has $A_{jk} = A_{kj}^*$.' }`
- Links: `a_0` → `gauge-a0` · `\vec a` → `arrow-a` · `a_0 \pm |\vec a|` → `eigen-plus`, `eigen-minus`.

**`l5-inverse:b6` [C] — which vector is $|{+x}\rangle$?**
- Text (question): "The recipe fixes $|{+x}\rangle$ only up to a factor: $(1,1)/\sqrt2$, $-(1,1)/\sqrt2$ and
  $i(1,1)/\sqrt2$ all solve it. Which one is $|{+x}\rangle$?"
- Stage: `{ kind: 'hilbert-plane', psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: 'same state' }], basis: 'z', shot: 'H-FLAT' }`
- Reveal text: "All of them: a common factor of size 1 is a [[global-phase|global phase]], and it changes no prediction.
  The course picks the first entry real and positive. That choice does change how matrices look later: Townsend flips
  the sign of $|{-x}\rangle$ and gets different entries for the same operator (`l5-operators:b7`)."
- Reveal stage: none (picture stays).
- Reveal claims: `samePhysicalState(KET['+x'], vscale(KET['+x'], -1))` → `true`;
  `samePhysicalState(KET['+x'], vscale(KET['+x'], c(0, 1)))` → `true`;
  `canonicalPhase(vscale(KET['+x'], c(0, 1)))` equals `KET['+x']`.
- Fidelity: `plane-sign-twice`.
- Links: `-(1,1)/\sqrt2` → `ghost` · `(1,1)/\sqrt2` → `psi`.

### Unit `l5-coordinates` — Same state, new coordinates

Stage plan: `hilbert-plane` throughout. It is **exact** here: every state in this unit has real amplitudes, and
the plane's `basis: 'x'` frame *is* the x basis. One arrow (the state) stays put while the frame turns, which is
exactly what a coordinate change is. Worked state: `psi30` = $(\sqrt3/2,\ 1/2)$, Lecture 4's example, drawn at 30°.

**`l5-coordinates:b1` [L] — L5 p. 8**
- Text: "Our column $(\alpha, \beta)$ holds the [[amplitude|amplitudes]] for the two z outcomes. To predict an x
  measurement, write the same ket as $|\psi\rangle = u|{+x}\rangle + v|{-x}\rangle$. Here $u = \langle{+x}|\psi\rangle$
  and $v = \langle{-x}|\psi\rangle$ are the x amplitudes."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'z', shadows: true, shot: 'H-FLAT' }`
- Caption: "$|\psi\rangle = \tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$, Lecture 4's state · z bars 0.75 / 0.25"
- Claims: `prob(KET['+z'], psi30)` → `0.75`; `prob(KET['-z'], psi30)` → `0.25`.
- Links: `\alpha` → `shadow-1` · `\beta` → `shadow-2` · `|\psi\rangle` → `psi`.

**`l5-coordinates:b2` [L] — L5 p. 8**
- Text: "Substitute $|{\pm x}\rangle = (|{+z}\rangle \pm |{-z}\rangle)/\sqrt2$ and collect terms. A ket has only one
  set of coefficients in a basis, so $\alpha = \tfrac{u+v}{\sqrt2}$ and $\beta = \tfrac{u-v}{\sqrt2}$."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "the frame turns to x; the arrow does not move · x bars 0.933 / 0.067"
- Claims: `toBasis(psi30, XB)` → `(0.9659, 0.2588)`; squared → `0.9330`, `0.0670` (= $\cos^2 15^\circ$, $\sin^2 15^\circ$);
  `(u + v)/√2` → `0.8660` = α, `(u − v)/√2` → `0.5` = β.
- Links: `u` → `shadow-1` · `v` → `shadow-2` · `|{\pm x}\rangle` → `basis-1`, `basis-2`.

**`l5-coordinates:b3` [L] — L5 pp. 8–9: the matrix (the direction convention is fixed here)**
- Text: "A matrix acting on a column returns a blend of the matrix's own columns, weighted by that column's entries. So both equations are one:
  $c_z = B_{z\leftarrow x}\,c_x$, where $B_{z\leftarrow x} = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ has
  $|{+x}\rangle$ and $|{-x}\rangle$, written in z coordinates, as its columns. The notes call it $B_x$; read the arrow
  as 'into z, from x'."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "[[basis-change-matrix|basis-change matrix]]: columns = new basis vectors in old coordinates; weights = new coordinates"
- Claims: `matEq(Bx, mscale(mat([[1, 1], [1, -1]]), Math.SQRT1_2))` → `true`;
  rebuild the old column → `apply(Bx, toBasis(psi30, XB))` → `psi30` = `(0.8660, 0.5)`.
- Links: "columns" → `basis-1`, `basis-2` · `c_x` → `shadow-1`, `shadow-2`.

**`l5-coordinates:b4` [L] — L5 p. 10**
- Text: "To go the other way we need the [[inverse-matrix|inverse]], $c_x = B_{z\leftarrow x}^{-1}c_z$. The columns are
  orthonormal, so $B^\dagger B = I$ (with $B$ short for $B_{z\leftarrow x}$) and the inverse is the [[conjugate-transpose|conjugate transpose]]:
  $B_{x\leftarrow z} = B_{z\leftarrow x}^\dagger$. Each row of $B^\dagger$ is a bra, so
  $c_x = (\langle{+x}|\psi\rangle,\ \langle{-x}|\psi\rangle)$."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "$c_x = (0.966,\ 0.259)$ · squares add to 1"
- Claims: `isUnitary(Bx)` → `true`; `toBasis(psi30, XB)[0]` equals `inner(KET['+x'], psi30)` → `0.9659`;
  `norm(toBasis(psi30, XB))` → `1`.
- Links: `\langle{+x}|\psi\rangle` → `shadow-1` · `\langle{-x}|\psi\rangle` → `shadow-2` · $|c_x|^2$ → `bar-1`, `bar-2`.

**`l5-coordinates:b5` [L] — L5 p. 10, two quick checks**
- Text: "$|{+z}\rangle$ has $c_z = (1, 0)$ and $c_x = (1, 1)/\sqrt2$. $|{+x}\rangle$ has $c_z = (1, 1)/\sqrt2$ and
  $c_x = (1, 0)$. So the column $(1, 0)$ names a state only once you say which basis it is in."
- Stage: `{ kind: 'hilbert-plane', psi: '+z', basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "$|{+z}\rangle$ read in the x frame: two equal shadows, 0.5 / 0.5"
- Claims: `toBasis(KET['+z'], XB)` → `(0.7071, 0.7071)`; `toBasis(KET['+x'], XB)` → `(1, 0)`.
- Links: `(1, 1)/\sqrt2` → `shadow-1`, `shadow-2`.

**`l5-coordinates:b6` [B] — Townsend**
- Text: "Townsend (§2.5) builds the same matrix by slipping the identity
  $|{+z}\rangle\langle{+z}| + |{-z}\rangle\langle{-z}|$ between a bra and a ket. Its entries are overlaps such as
  $\langle{-z}|{+x}\rangle$. His advice: rederive the matrix this way each time instead of memorizing it."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "each entry of $B_{z\leftarrow x}$ is an overlap: row = a z bra, column = an x ket, e.g. top-right $\langle{+z}|{-x}\rangle$"
- Claims: `Bx[1][0]` equals `inner(KET['-z'], KET['+x'])` → `0.7071`; `Bx[1][1]` equals `inner(KET['-z'], KET['-x'])` → `−0.7071`.
- Refs: `{ source: 'townsend', where: '§2.5, pp. 54–55 (eqs. 2.94–2.95, footnote 10)', adds: 'Gets the change-of-basis matrix from overlaps by inserting the identity operator, and recommends rederiving it that way. (He calls it S; his rotation reading of it is Lecture 6 material.)' }`
- Links: "overlaps" → `basis-1`, `basis-2`.

**`l5-coordinates:b7` [C] — does the arrow's direction matter?**
- Text (question): "Here $B_{z\leftarrow x}$ and $B_{x\leftarrow z}$ have exactly the same entries. So does the direction
  of the arrow not matter?"
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Reveal text: "It matters. The x columns are real and the matrix is symmetric, so it equals its own conjugate transpose
  by luck. For the y basis, $B_{z\leftarrow y} = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\ i&-i\end{pmatrix}$ but
  $B_{y\leftarrow z} = \tfrac{1}{\sqrt2}\begin{pmatrix}1&-i\\ 1&i\end{pmatrix}$: keep the arrow."
- Reveal stage: none; reveal caption: "the y columns are complex, so this flat plane cannot draw them"
- Reveal claims: `matEq(Bx, dagger(Bx))` → `true`; `matEq(By, dagger(By))` → `false`;
  `By[1][0]` → `0.7071i`, `dagger(By)[0][1]` → `−0.7071i`.
- Fidelity: `plane-real-slice`.
- Links: none (matrices only).

**`l5-coordinates:b8` [C] — why is the inverse just the dagger?**
- Text (question): "Undoing $B_{z\leftarrow x}$ took no algebra: we flipped it and conjugated it. Would that shortcut
  work for any pair of basis arrows?"
- Stage: `{ kind: 'hilbert-plane', psi: '+z', basis: 'x', rightAngle: true, shot: 'H-FLAT' }`
- Reveal text: "Only for orthonormal ones. Entry $(j, k)$ of $B^\dagger B$ is the inner product of columns $j$ and $k$,
  which is 1 or 0 exactly when the columns are orthonormal. With arrows $|{+z}\rangle$ and $|{+x}\rangle$, only
  45° apart, the dagger gives $(1,\ 0.707)$ for $|{+z}\rangle$, but the true coordinates are $(1, 0)$."
- Reveal stage: `{ kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+z', role: 'basis', badge: 'column 1' }, { ket: '+x', role: 'basis', badge: 'column 2' }], shot: 'H-FLAT' }`
- Reveal claims: with `N = fromColumns([KET['+z'], KET['+x']])`: `matEq(matmul(dagger(N), N), identity(2))` → `false`;
  `apply(dagger(N), KET['+z'])` → `(1, 0.7071)`; `apply(inv2(N), KET['+z'])` → `(1, 0)` (**needs `inv2`, §8 G1**).
- Links: "$|{+z}\rangle$ and $|{+x}\rangle$" → `basis-1`, `basis-2` (reveal) · "orthonormal" → `right-angle` (question).
- Note: the notes' p. 10 "Two details" box makes this point in words; the reveal only puts numbers on it.

### Unit `l5-operators` — Operators change coordinates too

Stage plan: `operator-space` shows the operator as one fixed object (its arrow never moves when coordinates change);
a `split` with `hilbert-plane` shows the new frame lying along the operator's eigenvectors. **Caution for W/D:**
the operator-space arrow is computed from **z-basis** entries. Content must always feed it $A^{(z)}$, never
$A^{(x)}$; feeding it the numbers of $S_z^{(x)}$ would draw $S_x$'s arrow (see §10 and b6).

**`l5-operators:b1` [L] — L5 p. 11**
- Text: "Let an operator act: $|\chi\rangle = A|\psi\rangle$. Writing $\psi_z$ for the z column of $|\psi\rangle$ (our
  $c_z$), this reads $\chi_z = A^{(z)}\psi_z$, where the superscript names the basis. Which matrix $A^{(x)}$ does the
  same job on x columns?" (The notes call the output $|\phi\rangle$; renamed because $\phi$ is the Bloch azimuth and the
  rotation angle elsewhere in the app, §6.)
- Stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, shot: 'O-STD' }`
- Caption: "example operator $A = S_z$ · the arrow is the operator itself, not a matrix of numbers"
- Claims: `decomposeHermitian(SZ)` → `{ a0: 0, a: [0, 0, 0.5] }`.
- Links: `A` → `arrow-a`.

**`l5-operators:b2` [L] — L5 p. 11, the rule**
- Text: "Put $\psi_z = B_{z\leftarrow x}\psi_x$ and $\chi_z = B_{z\leftarrow x}\chi_x$ into $\chi_z = A^{(z)}\psi_z$, then
  multiply on the left by $B_{x\leftarrow z}$. That leaves $\chi_x = B_{x\leftarrow z}A^{(z)}B_{z\leftarrow x}\,\psi_x$.
  So $A^{(x)} = B_{x\leftarrow z}\,A^{(z)}\,B_{z\leftarrow x}$, which the notes write $A_{\text{new}} = B^\dagger A_{\text{old}}B$."
- Stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, shot: 'O-STD' }`
- Caption: "same arrow; only its table of numbers will change"
- Claims (seeded, seed 448, 3 random Hermitian `H` and states `v`): acting then converting equals converting then
  acting → `toBasis(apply(H, v), XB)` equals `apply(operatorInBasis(H, XB), toBasis(v, XB))` to 1e-12; same for `YB`.
- Links: `A^{(x)}` → `arrow-a`.

**`l5-operators:b3` [L] — L5 p. 11, reading right to left**
- Text: "Read the product from right to left. $B_{z\leftarrow x}$ turns the input into z coordinates, $A^{(z)}$ acts
  there, and $B_{x\leftarrow z}$ turns the output back into x coordinates. The rule holds for any linear operator,
  Hermitian or not."
- Stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, shot: 'O-STD' }`
- Caption: "x in → z → act → z → x out"
- Claims: non-Hermitian case, seeded random complex `M` (not Hermitian): same identity as b2 holds to 1e-12.
- Links: none. (This beat's order is the `order` challenge in §3.)

**`l5-operators:b4` [L] — L5 p. 12, the operator example**
- Text: "Try $A = S_x$ with the basis made of $S_x$'s own eigenvectors:
  $B_{x\leftarrow z}S_x^{(z)}B_{z\leftarrow x} = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix}$. The off-diagonal
  entries vanish and the eigenvalues $\pm\tfrac{\hbar}{2}$ sit down the diagonal: the matrix is [[diagonal-matrix|diagonal]]."
- Stage: `{ layout: 'split', top: { kind: 'operator-space', op: { named: 'Sx' }, eigen: true, shot: 'O-STD' }, bottom: { kind: 'hilbert-plane', basis: 'x', rightAngle: true, shot: 'H-FLAT' } }`
- Caption: "$S_x^{(x)} = \tfrac{\hbar}{2}\,\mathrm{diag}(1, -1)$ · the new frame is $S_x$'s [[eigenbasis]]"
- Claims: `operatorInBasis(SX, XB)` → `[[0.5, 0], [0, −0.5]]`.
- Links: `\pm\tfrac{\hbar}{2}` → `eigen-plus`, `eigen-minus` (top) · "own eigenvectors" → `basis-1`, `basis-2` (bottom).
- Fidelity: `plane-bloch-doubles` (the eigen-axis is 180° across the ghost sphere, the frame arrows 90° apart).

**`l5-operators:b5` [L] — L5 pp. 12–13, why diagonal**
- Text: "Let $B$'s columns be unit eigenvectors $v_1, v_2$ of $A$, with $Av_1 = \lambda_1v_1$ and $Av_2 = \lambda_2v_2$. Then $AB$ has columns
  $\lambda_1v_1, \lambda_2v_2$, and so does $BD$ with $D = \mathrm{diag}(\lambda_1, \lambda_2)$. So $AB = BD$, and
  $B^\dagger B = I$ turns it into $B^\dagger AB = D$: [[diagonalization]]."
- Stage: same split as b4.
- Caption: "$AB = BD$ column by column"
- Claims: `matEq(matmul(SX, Bx), matmul(Bx, mat([[0.5, 0], [0, -0.5]])))` → `true`; general: for 3 seeded random
  Hermitian `H`, with `E = eigenHermitian2(H)`, `operatorInBasis(H, E.vectors)` equals `mat([[E.values[0], 0], [0, E.values[1]]])` to 1e-12.
- Links: `v_1, v_2` → `basis-1`, `basis-2` (bottom) · `\lambda_1, \lambda_2` → `eigen-plus`, `eigen-minus` (top).

**`l5-operators:b6` [L] — L5 p. 13, component label vs representation label**
- Text: "The same $B$ turns $S_z$ into $S_z^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$. Those are the
  numbers of $S_x^{(z)}$, but this is still the z-spin, written in x coordinates. A basis change never changes which
  component is measured."
- Stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, shot: 'O-STD' }`
- Caption: "the arrow stays on $a_z$: $S_z$ is still $S_z$ (this stage always reads z-basis entries)"
- Claims: `operatorInBasis(SZ, XB)` → `[[0, 0.5], [0.5, 0]]`; same numbers as $S_x^{(z)}$ →
  `matEq(operatorInBasis(SZ, XB), SX)` → `true`; and $S_x^{(x)}$ has the numbers of $S_z^{(z)}$ →
  `matEq(operatorInBasis(SX, XB), SZ)` → `true`.
- Links: `S_z^{(x)}` → `arrow-a`.

**`l5-operators:b7` [B] — Townsend's other phase**
- Text: "Townsend (§2.5) runs the same example with $|{-x}\rangle$ multiplied by $-1$. He gets
  $S_z^{(x)} = -\tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$, then redoes it with our phases in Example 2.5 and
  gets $+$. Both are right: a basis vector's phase changes matrix entries, never predictions."
- Stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, shot: 'O-STD' }`
- Caption: "Townsend's main text: off-diagonal $-\hbar/2$ · his Example 2.5 and our notes: $+\hbar/2$"
- Claims (with `XT = [KET['+x'], vscale(KET['-x'], -1)]`): `operatorInBasis(SZ, XT)` → `[[0, −0.5], [−0.5, 0]]`;
  `toBasis(KET['+z'], XT)` → `(0.7071, −0.7071)` (his eq. 2.101); predictions agree →
  `expectation(operatorInBasis(SZ, XT), toBasis(KET['+z'], XT))` → `0.5` = `expectation(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))`.
- Refs: `{ source: 'townsend', where: '§2.4, pp. 48–49 (eq. 2.70)', adds: 'An operator written in its own eigenbasis is diagonal, with the eigenvalues on the diagonal.' }`,
  `{ source: 'townsend', where: '§2.5, pp. 55–57 (eqs. 2.98–2.101, Ex. 2.5)', adds: 'The rule $S^\dagger A S$ for operators, worked for $S_z$ in the x basis with two different phase choices for $|{-x}\rangle$.' }`
- Links: `S_z^{(x)}` → `arrow-a`.

**`l5-operators:b8` [C] — the complex check (optional in the notes)**
- Text (question): "The y basis has complex columns. Does $B_{y\leftarrow z}\,S_y^{(z)}\,B_{z\leftarrow y}$ still come out
  diagonal?"
- Stage: `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: false, shot: 'O-STD' }`
- Reveal text: "Yes, $\tfrac{\hbar}{2}\,\mathrm{diag}(1, -1)$, because the columns of $B_{z\leftarrow y}$ are $S_y$'s
  eigenvectors $|{\pm y}\rangle$ from Lecture 2. The argument never used real entries. It needed only
  $Av_k = \lambda_kv_k$ for each column and $B^\dagger B = I$."
- Reveal stage: `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: true, shot: 'O-STD' }`
- Reveal claims: `operatorInBasis(SY, YB)` → `[[0.5, 0], [0, −0.5]]`; `isUnitary(By)` → `true`.
- Links: `|{\pm y}\rangle` → `eigen-plus`, `eigen-minus` (reveal).
- Note: this uses $|{\pm y}\rangle$ as known from L2 and shown on the notes' own p. 13. It does not work the assigned
  eigenproblem (no determinant, no back-substitution).

### Unit `l5-invariance` — Predictions ignore the coordinates

Stage plan: `hilbert-plane` (exact: all states here are real). The notes' p. 14 check uses $\Delta S_z$; variance is
taught in L7 (§0), so b2 makes the same point with the transformed **projector** from the same page (see §7 E2).

**`l5-invariance:b1` [L] — L5 p. 14**
- Text: "Prepare $|{+z}\rangle$ and work in x coordinates: $c_x = (1, 1)/\sqrt2$ and
  $S_z^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$. Then
  $\langle S_z\rangle = c_x^\dagger S_z^{(x)} c_x = \tfrac{\hbar}{2}$, exactly the z-coordinate answer."
- Stage: `{ kind: 'hilbert-plane', psi: '+z', basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "two equal x amplitudes, yet $\langle S_z\rangle = \hbar/2$"
- Claims: `expectation(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))` → `0.5`; `expectation(SZ, KET['+z'])` → `0.5`.
- Links: `c_x` → `shadow-1`, `shadow-2`.

**`l5-invariance:b2` [L] — L5 p. 14, the projector version of the notes' uncertainty check**
- Text: "Two nonzero entries in $c_x$ do not make the z reading uncertain: they are amplitudes for x outcomes. Transform
  the outcome projector too, $P_{+z}^{(x)} = B_{x\leftarrow z}P_{+z}B_{z\leftarrow x}$. Then the chance of reading
  $+\tfrac{\hbar}{2}$ is $c_x^\dagger P_{+z}^{(x)}c_x = 1$."
- Stage: `{ kind: 'hilbert-plane', psi: '+z', basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "$P_{+z}^{(x)} = \tfrac12\begin{pmatrix}1&1\\1&1\end{pmatrix}$ · probability of $+z$: 1"
- Claims: `operatorInBasis(projector(KET['+z']), XB)` → `[[0.5, 0.5], [0.5, 0.5]]`;
  `expectation(operatorInBasis(projector(KET['+z']), XB), toBasis(KET['+z'], XB))` → `1`.
- Links: $c_x$ → `shadow-1`, `shadow-2` · "1" → `bar-1` is **not** used (the bars show x probabilities, 0.5 / 0.5; the
  caption says so to avoid a mismatch).

**`l5-invariance:b3` [L] — L5 p. 14, why it always works**
- Text: "For any old and new basis, $c_{\text{new}}^\dagger A^{(\text{new})}c_{\text{new}} = (c_{\text{old}}^\dagger B)(B^\dagger A^{(\text{old})}B)(B^\dagger c_{\text{old}})$.
  Each inner pair $BB^\dagger$ equals $I$; for a square $B$ this follows from $B^\dagger B = I$. What remains is
  $c_{\text{old}}^\dagger A^{(\text{old})}c_{\text{old}}$, so every average and every Born probability is unchanged."
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "Lecture 4's state, either frame: $\langle S_z\rangle = \hbar/4$"
- Claims: `expectation(SZ, psi30)` → `0.25` = `expectation(operatorInBasis(SZ, XB), toBasis(psi30, XB))`;
  `matEq(matmul(Bx, dagger(Bx)), identity(2))` → `true`; seeded (448) random Hermitian `H`, random states `v`, both
  `XB` and `YB`: `expectation(H, v)` equals `expectation(operatorInBasis(H, basis), toBasis(v, basis))` to 1e-12.
- Links: $c_{\text{new}}$ → `shadow-1`, `shadow-2` · "unchanged" → `psi`.

**`l5-invariance:b4` [B] — Townsend, both routes**
- Text: "Townsend (§2.5, §2.6) makes the same point twice. The eigenvalue equation
  $S_z|{+z}\rangle = \tfrac{\hbar}{2}|{+z}\rangle$ holds in x coordinates too. And $\langle S_z\rangle$ for $|{+x}\rangle$
  is 0 in either basis: in z the matrix is simple, in x the column is."
- Stage: `{ kind: 'hilbert-plane', psi: '+x', basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Caption: "$|{+x}\rangle$ in x coordinates is $(1, 0)$ · $\langle S_z\rangle = 0$ both ways"
- Claims: `apply(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))` equals `vscale(toBasis(KET['+z'], XB), 0.5)`;
  `expectation(operatorInBasis(SZ, XB), vec(1, 0))` → `0`; `expectation(SZ, KET['+x'])` → `0`.
- Refs: `{ source: 'townsend', where: '§2.5, p. 56 (eq. 2.102)', adds: 'An eigenvalue equation is a statement about the operator and the state, so it holds in every representation.' }`,
  `{ source: 'townsend', where: '§2.6, pp. 58–59 (eq. 2.107, Ex. 2.6)', adds: 'The same expectation value computed in two bases; one makes the operator simple, the other the state.' }`
- Links: `(1, 0)` → `shadow-1`.

**`l5-invariance:b5` [C] — mixing bases**
- Text (question): "A friend converts $|{+z}\rangle$ to x coordinates but keeps the z-basis matrix
  $S_z^{(z)} = \tfrac{\hbar}{2}\,\mathrm{diag}(1, -1)$. What does she get for $\langle S_z\rangle$?"
- Stage: `{ kind: 'hilbert-plane', psi: '+z', basis: 'x', shadows: true, shot: 'H-FLAT' }`
- Reveal text: "She gets $c_x^\dagger S_z^{(z)}c_x = 0$, which is wrong: the right answer is $\tfrac{\hbar}{2}$. A column from
  one basis and a matrix from another describe nothing at all. Transform both, or neither."
- Reveal stage: none.
- Reveal claims: `expectation(SZ, toBasis(KET['+z'], XB))` → `0` (the mixed-up number);
  `expectation(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))` → `0.5` (the right one).
- Links: $c_x$ → `shadow-1`, `shadow-2`.

**`l5-invariance:b6` [C] — relabel or rotate?**
- Text (question): "A basis-change matrix is [[unitary]], and so is Lecture 6's rotation $R_z(\phi) = e^{-i\phi S_z/\hbar}$,
  which turns a state by an angle $\phi$ about z. Is a change of basis the same as rotating the atoms?"
- Stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'z', shadows: true, shot: 'H-FLAT' }`
- Reveal text: "No: a change of basis keeps the state and relabels it, so every prediction stays, as b3 proved. A rotation
  changes the state inside fixed coordinates, so predictions change: $R_z(90^\circ)$ takes $|{+x}\rangle$ to
  $|{+y}\rangle$, and $P(+x)$ drops from 1 to $\tfrac12$. Lecture 6 builds rotations, with $S_z$ as their generator."
- Reveal stage: `{ kind: 'hilbert-plane', psi: { planeDeg: 30 }, basis: 'x', shadows: true, shot: 'H-FLAT' }`
  (the frame turns, the arrow does not: the passive picture only)
- Reveal caption: "passive: the frame moved, the state did not"
- Reveal claims: `isUnitary(Bx)` → `true`, `isUnitary(Rz(Math.PI/2))` → `true`;
  `samePhysicalState(apply(Rz(Math.PI/2), KET['+x']), KET['+y'])` → `true`;
  `prob(KET['+x'], apply(Rz(Math.PI/2), KET['+x']))` → `0.5`; `prob(KET['+x'], KET['+x'])` → `1`.
- Links: "relabels" → `basis-1`, `basis-2` (reveal) · "the state" → `psi`.
- Note: the active rotation itself is not drawn (it leaves the real plane); L6 shows it on the `bloch` stage.

## 2. Try-it widget per unit

All five are existing widgets with their real props (`app/src/widgets/*.tsx`). Every number a prompt promises is
listed with the engine call that backs it (to become a unit `Claim`).

**`l5-averages`** → `{ kind: 'bloch', props: { theta: 60, phi: 90, editable: true, measure: 'y', landmarks: true } }`
(its readout table already shows ⟨Sx⟩, ⟨Sy⟩, ⟨Sz⟩ in ħ, from `blochVector`/2).
- "Start at the notes' state. Read the three averages: $0$, $0.433\,\hbar$, $0.25\,\hbar$. Now drag only around the
  vertical axis. Which average never changes, and why?" → `expectation(SZ, ketFromBloch(60°, φ))` = 0.25 for all φ.
- "Drag to $|{+y}\rangle$ and then to $|{+x}\rangle$. Check the notes' familiar-state table: $(0, \tfrac{\hbar}{2}, 0)$
  and $(\tfrac{\hbar}{2}, 0, 0)$." → `expectation` of SX/SY/SZ on `KET['+y']`, `KET['+x']`.
- "Try to make all three averages zero at once. You cannot: the squares of $2\langle S_k\rangle/\hbar$ always add to 1
  (Susskind §3.8)." → `blochVector(ψ)` has length 1 for every ψ (property test over a grid of θ, φ).

**`l5-inverse`** → `{ kind: 'operator-action', props: { preset: 'σx' } }` (real symmetric matrices; eigen-directions
stand still while every other arrow turns).
- "With $\sigma_x$, find the two directions that only stretch or flip. Compare them with $(1, \pm1)/\sqrt2$." →
  `eigenHermitian2(SIGMA_X).vectors` = `KET['+x']`, `KET['-x']`.
- "Pick the preset $\begin{pmatrix}2&1\\1&2\end{pmatrix}$. The special directions are the same as for $\sigma_x$, but the
  stretch factors are now 3 and 1. What changed, and what did not?" → `eigenHermitian2(mat([[2, 1], [1, 2]]))` →
  values `[3, 1]`, vectors `KET['+x']`, `KET['-x']` (adding $2I$ shifts both readings, keeps the states).
- "Set the off-diagonal entry to 0. Why are the special directions now the axes themselves?" →
  `eigenHermitian2(mat([[a, 0], [0, d]]))` vectors = `KET['+z']`, `KET['-z']` for a > d (a diagonal matrix is already
  in its eigenbasis; this previews `l5-operators`).

**`l5-coordinates`** → `{ kind: 'basis-translator', props: { target: 'x', mode: 'state', theta: 60, phi: 0 } }`
(θ = 60°, φ = 0 is `psi30`, the unit's worked state).
- "Read $\psi_x$ and square its entries. Do you get $P(\pm x) = 0.933$ and $0.067$?" → `toBasis(psi30, XB)` squared.
- "Slide θ, which sets the populations, to 90° (with φ = 0 this is $|{+x}\rangle$). Which column does it get in x coordinates?" → `toBasis(KET['+x'], XB)` = (1, 0).
- "Switch the new basis to y. The note saying the two matrices look alike disappears. Compare $B_{z\leftarrow y}$ with
  $B_{y\leftarrow z}$ entry by entry." → `matEq(By, dagger(By))` = false.

**`l5-operators`** → `{ kind: 'basis-translator', props: { target: 'x', mode: 'operator', operator: 'Sx' } }`
- "With $S_x$ in the x basis the widget says 'diagonal'. Switch the operator to $S_z$: which numbers appear, and which
  spin component is it still?" → `operatorInBasis(SZ, XB)` = [[0, 0.5], [0.5, 0]].
- "Switch to the y basis. Which of the three operators is diagonal there, and what sits on its diagonal?" →
  `operatorInBasis(SY, YB)` = diag(0.5, −0.5); `operatorInBasis(SX, YB)`, `operatorInBasis(SZ, YB)` not diagonal.
- "Still in the y basis, look at $S_x^{(y)}$. Whose z-basis numbers does it copy?" → `matEq(operatorInBasis(SX, YB), SY)`
  = true (and $S_z^{(y)}$ copies $S_x^{(z)}$: `matEq(operatorInBasis(SZ, YB), SX)` = true).

**`l5-invariance`** → `{ kind: 'amplitude-bars', props: { state: '+z', basis: 'x', editable: true } }`
- "The x amplitudes of $|{+z}\rangle$ are both $0.707$. Switch the basis to z. Is the z reading uncertain?" →
  `toBasis(KET['+z'], XB)` = (0.7071, 0.7071); `prob(KET['+z'], KET['+z'])` = 1.
- "Set the sliders to θ = 60°, φ = 90°: θ fixes the populations ($|\alpha|^2 = \cos^2\tfrac{\theta}{2}$) and φ is the phase
  of $\beta$ relative to $\alpha$, so this is the notes' p. 5 state. From the z bars compute $\langle S_z\rangle$; from the y bars
  compute $\langle S_y\rangle = \tfrac{\hbar}{2}(P_+ - P_-)$. Match the answers from unit 1." → `prob(KET['+z'], psiEx)`
  = 0.75; `prob(KET['+y'], psiEx)` = 0.9330; ½(0.9330 − 0.0670) = 0.4330.
- "Change only φ. The z bars stay put while the x and y bars move: populations vs coherence, seen from the other side."
  → `prob(KET['+z'], ketFromBloch(60°, φ))` = 0.75 for all φ.

## 3. Challenges per unit

Answers are engine calls evaluated inside the content file (never typed in). Numeric answers are in units of ħ where a
unit is shown; tolerance 0.002 unless stated. Hints climb nudge → key idea → setup. Challenge ids: `l5-<unit>-<slug>`.

### `l5-averages`
1. **`l5-av-pop` · warm-up · numeric** — "A state has $c_z = (0.6,\ 0.8)$. Find $\langle S_z\rangle$."
   Answer `expectation(SZ, vec(0.6, 0.8))` = **−0.14** (unit ħ).
   Hints: (1) Which parts of the column does the z average depend on? (2) Only the populations:
   $\langle S_z\rangle = \tfrac{\hbar}{2}(|\alpha|^2 - |\beta|^2)$. (3) $|\alpha|^2 = 0.36$, $|\beta|^2 = 0.64$.
   Walkthrough: populations 0.36 and 0.64 → difference −0.28 → times ħ/2 → −0.14 ħ. Negative: the − outcome is likelier.
2. **`l5-av-coh` · core · numeric** — "Now $c_z = (0.6,\ 0.8i)$. Find $\langle S_y\rangle$."
   Answer `expectation(SY, vec(0.6, c(0, 0.8)))` = **0.48** (unit ħ).
   Hints: (1) The y average is set by the coherence, not the populations. (2) $\langle S_y\rangle = \hbar\,\mathrm{Im}(\alpha^*\beta)$.
   (3) $\alpha^* = 0.6$, $\beta = 0.8i$, so $\alpha^*\beta = 0.48i$.
   Walkthrough: coherence $0.48i$ → its imaginary part 0.48 → $\langle S_y\rangle = 0.48\,\hbar$; its real part is 0, so
   $\langle S_x\rangle = 0$ (`expectation(SX, …)` = 0); $\langle S_z\rangle = -0.14\,\hbar$ as before.
3. **`l5-av-phase` · core · choice** — "Which change can alter $\langle S_x\rangle$ without altering $\langle S_z\rangle$?"
   - Multiply only $\beta$ by a phase $e^{i\gamma}$ — **correct**; why: populations keep their sizes, the coherence turns
     (`expectation(SX, vec(0.6, 0.8))` = 0.48 vs `expectation(SX, vec(0.6, c(0, 0.8)))` = 0).
   - Multiply the whole column by $e^{i\gamma}$ — why not: a global phase leaves $\alpha^*\beta$ unchanged
     (`expectation(SX, vscale(vec(0.6, 0.8), expi(1)))` = 0.48).
   - Swap $\alpha$ and $\beta$ — why not: it flips the sign of $\langle S_z\rangle$ (−0.14 → +0.14).
   - Nothing: the two averages are locked together — why not: see the first option.
   Hints: (1) Which quantity does each average read? (2) $\langle S_z\rangle$ reads populations, $\langle S_x\rangle$ reads
   $\mathrm{Re}(\alpha^*\beta)$. (3) Try each change on $\alpha^*\beta$ and on $|\alpha|^2$.
   Walkthrough: classify each change by what it does to $|\alpha|^2$ and to $\alpha^*\beta$; only the relative phase keeps
   the first and changes the second.
4. **`l5-av-missing` · stretch · numeric** — "A state has $\langle S_z\rangle = 0$, $\langle S_x\rangle = \hbar/4$ and
   $\langle S_y\rangle > 0$. Find $\langle S_y\rangle$."
   Answer `expectation(SY, ketFromBloch(90*DEG, 60*DEG))` = **0.4330** (unit ħ).
   Hints: (1) $\langle S_z\rangle = 0$ fixes the populations. (2) Then $|\alpha| = |\beta| = 1/\sqrt2$, so
   $|\alpha^*\beta| = \tfrac12$. (3) $\mathrm{Re}(\alpha^*\beta) = \tfrac14$; find the imaginary part from the size.
   Walkthrough: $|\alpha^*\beta|^2 = \mathrm{Re}^2 + \mathrm{Im}^2$ → $\mathrm{Im} = \sqrt{1/4 - 1/16} = \sqrt3/4$ →
   $\langle S_y\rangle = \sqrt3\,\hbar/4 \approx 0.433\,\hbar$. Check with Susskind's rule: $0.5^2 + 0.866^2 + 0^2 = 1$.

### `l5-inverse`
1. **`l5-inv-values` · warm-up · numeric** — "$A = \begin{pmatrix}1&2\\2&1\end{pmatrix}$ (units of ħ). What is the largest
   possible reading?" Answer `eigenHermitian2(mat([[1, 2], [2, 1]])).values[0]` = **3**.
   Hints: (1) Readings are eigenvalues. (2) Set $\det(A - \lambda I) = 0$. (3) $(1-\lambda)^2 - 4 = 0$.
   Walkthrough: $1 - \lambda = \pm2$ → λ = 3 or −1 → the largest is 3 (ħ). Aside: $A = I + 2\sigma_x$, so it shares $\sigma_x$'s eigenvectors.
2. **`l5-inv-vector` · core · choice** — "Which unit column is $A$'s eigenvector for $\lambda = -1$?"
   Options: $(1, 1)/\sqrt2$ (why not: that one gives 3) · **$(1, -1)/\sqrt2$** (correct:
   `eigenHermitian2(mat([[1, 2], [2, 1]])).vectors[1]` = (0.7071, −0.7071)) · $(1, 0)$ (why not: $A(1,0) = (1, 2)$, not a
   multiple) · $(1, i)/\sqrt2$ (why not: $A$ maps it to $(1+2i,\ 2+i)/\sqrt2$, not a multiple).
   Hints: (1) Put λ = −1 back into $(A - \lambda I)w = 0$. (2) The top row reads $2a + 2b = 0$. (3) So $b = -a$; normalize.
   Walkthrough: $A + I = \begin{pmatrix}2&2\\2&2\end{pmatrix}$ → $b = -a$ → $a = 1/\sqrt2$ real and positive → $(1, -1)/\sqrt2$.
3. **`l5-inv-sy` · core · choice · `assigned: 'L5 p.1'`** — "Solve the $S_y$ eigenvalue problem. Which column is the
   normalized eigenvector for $+\tfrac{\hbar}{2}$, first entry real and positive?"
   Options: $(1, i)/\sqrt2$ (correct) · $(1, -i)/\sqrt2$ · $(1, 1)/\sqrt2$ · $(i, 1)/\sqrt2$. Option `why` texts must not
   solve it (e.g. "check it by applying $S_y$") — see Q4.
   Hints only (walkthrough withheld): (1) Same three steps as for $S_x$: determinant, back-substitution, normalization.
   (2) In the determinant, $(-i\tfrac{\hbar}{2})(i\tfrac{\hbar}{2})$ is a positive number, so the outcomes are real.
   (3) Back-substitution gives $b$ as an imaginary multiple of $a$; remember $|i|^2 = 1$ when you normalize, then compare
   with Lecture 2's $|{\pm y}\rangle$.
   Answer key for the test only: `eigenHermitian2(SY).vectors[0]` equals `KET['+y']`.
4. **`l5-inv-complex` · stretch · numeric** — "$A = \begin{pmatrix}2&1-i\\1+i&0\end{pmatrix}$ (units of ħ) has complex
   entries. What is its largest reading?" Answer `eigenHermitian2(mat([[2, c(1, -1)], [c(1, 1), 0]])).values[0]` = **2.7321**.
   Hints: (1) Check that $A$ is Hermitian first. (2) $\det(A - \lambda I) = (2-\lambda)(-\lambda) - (1-i)(1+i)$.
   (3) $(1-i)(1+i) = 2$, so $\lambda^2 - 2\lambda - 2 = 0$.
   Walkthrough: $\lambda = 1 \pm \sqrt3$ → largest $1 + \sqrt3 \approx 2.732$ → same as $a_0 + |\vec a|$ with $a_0 = 1$,
   $\vec a = (1, 1, 1)$ (`decomposeHermitian`), the operator-space reading of `l5-inverse:b5`.

### `l5-coordinates`
1. **`l5-co-u` · warm-up · numeric** — "$c_z = (0.6,\ 0.8)$. Find the x amplitude $u = \langle{+x}|\psi\rangle$."
   Answer `toBasis(vec(0.6, 0.8), XB)[0].re` = **0.9899**.
   Hints: (1) Use the top row of $B_{x\leftarrow z}$. (2) That row is the bra $\langle{+x}| = (1, 1)/\sqrt2$.
   (3) $u = (\alpha + \beta)/\sqrt2$.
   Walkthrough: $(0.6 + 0.8)/\sqrt2 = 1.4/1.4142 = 0.9899$.
2. **`l5-co-prob` · core · numeric** — "Same state. What is the probability of reading $-\tfrac{\hbar}{2}$ along x?"
   Answer `prob(KET['-x'], vec(0.6, 0.8))` = **0.02** (tolerance 0.001).
   Hints: (1) It is the squared size of an x amplitude. (2) Which row of $B_{x\leftarrow z}$ gives $v$? (3) $v = (\alpha - \beta)/\sqrt2$.
   Walkthrough: $v = (0.6 - 0.8)/\sqrt2 = -0.1414$ → $v^2 = 0.02$ → check $u^2 + v^2 = 0.98 + 0.02 = 1$.
3. **`l5-co-arrow` · core · choice** — "Which matrix turns z coordinates into y coordinates?"
   Options: $\tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\ i&-i\end{pmatrix}$ (why not: that is $B_{z\leftarrow y}$, the other
   direction) · **$\tfrac{1}{\sqrt2}\begin{pmatrix}1&-i\\1&i\end{pmatrix}$** (correct: `dagger(By)`) ·
   $\tfrac{1}{\sqrt2}\begin{pmatrix}1&i\\1&-i\end{pmatrix}$ (why not: transposed but not conjugated) ·
   $\tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ (why not: that is the x basis).
   Hints: (1) Start from the matrix whose columns are $|{\pm y}\rangle$ in z coordinates. (2) Which way does that one go?
   (3) Undo it with the conjugate transpose.
   Walkthrough: columns $(1, \pm i)/\sqrt2$ give $B_{z\leftarrow y}$ → transpose and conjugate → rows are the bras
   $\langle{\pm y}| = (1, \mp i)/\sqrt2$.
4. **`l5-co-skew` · stretch · numeric** — "Use the non-orthogonal pair $|{+z}\rangle$, $|{+x}\rangle$ as a basis. Write
   $|{-z}\rangle = p\,|{+z}\rangle + q\,|{+x}\rangle$. Find $q$."
   Answer `apply(inv2(fromColumns([KET['+z'], KET['+x']])), KET['-z'])[1].re` = **1.4142** (needs `inv2`, §8 G1).
   Hints: (1) The dagger shortcut fails here; say why. (2) Match components: $(0, 1) = p(1, 0) + q(1, 1)/\sqrt2$.
   (3) The bottom entry gives $q$ at once.
   Walkthrough: bottom row $1 = q/\sqrt2$ → $q = \sqrt2$; top row $0 = p + q/\sqrt2$ → $p = -1$. The dagger would give
   $(0,\ 0.707)$, which is wrong: $B^\dagger B \ne I$ for this pair.

### `l5-operators`
1. **`l5-op-label` · warm-up · choice** — "$S_z^{(x)}$ has the same numbers as $S_x^{(z)}$. Which observable does
   $S_z^{(x)}$ describe?" Options: **the z component of spin** (correct: the subscript names the component, the superscript
   the coordinates) · the x component (why not: that mixes the two labels) · both (why not: one matrix in one stated
   basis is one operator) · neither (why not: see the first option).
   Claim: `matEq(operatorInBasis(SZ, XB), SX)` = true.
   Hints: (1) What does the subscript name? (2) What does the superscript name? (3) Changing coordinates cannot change
   which magnet you use.
   Walkthrough: subscript z → the z magnet; superscript (x) → numbers written in x coordinates; same numbers as a
   different pair of labels is a coincidence of this basis.
2. **`l5-op-order` · core · order** — "Order the steps of computing $\chi_x = B_{x\leftarrow z}A^{(z)}B_{z\leftarrow x}\,\psi_x$."
   Steps (correct order): "Start from the x column $\psi_x$." → "$B_{z\leftarrow x}$ turns it into the z column $\psi_z$." →
   "$A^{(z)}$ acts on the z column, giving $\chi_z$." → "$B_{x\leftarrow z}$ turns $\chi_z$ back into the x column $\chi_x$."
   Claim (b2): `toBasis(apply(SZ, v), XB)` equals `apply(operatorInBasis(SZ, XB), toBasis(v, XB))`.
   Hints: (1) Matrices act on the column to their right. (2) Read the product right to left. (3) The matrix next to
   $\psi_x$ must accept x coordinates.
   Walkthrough: the four steps above, each with its column shown for $v = $ `psi30`.
3. **`l5-op-eigenbasis` · core · numeric** — "$A = \begin{pmatrix}1&2\\2&1\end{pmatrix}$ (units of ħ). Find the top-left
   entry of $A^{(x)}$." Answer `operatorInBasis(mat([[1, 2], [2, 1]]), XB)[0][0].re` = **3**.
   Hints: (1) Are $|{\pm x}\rangle$ eigenvectors of $A$? (2) If so, $A^{(x)}$ is diagonal. (3) The top-left entry is the
   eigenvalue of the first column, $|{+x}\rangle$.
   Walkthrough: $A|{+x}\rangle = 3|{+x}\rangle$, $A|{-x}\rangle = -|{-x}\rangle$ → $A^{(x)} = \mathrm{diag}(3, -1)$ → 3.
4. **`l5-op-sy-in-x` · stretch · choice** — "What is $S_y$ in the x basis?"
   Options: $\tfrac{\hbar}{2}\begin{pmatrix}0&-i\\ i&0\end{pmatrix}$ (why not: that is $S_y^{(z)}$; the matrix must change) ·
   **$\tfrac{\hbar}{2}\begin{pmatrix}0&i\\ -i&0\end{pmatrix}$** (correct: `operatorInBasis(SY, XB)` = [[0, 0.5i], [−0.5i, 0]]) ·
   $\tfrac{\hbar}{2}\,\mathrm{diag}(1, -1)$ (why not: the x basis is not $S_y$'s eigenbasis) ·
   $\tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$ (why not: that is $S_z^{(x)}$).
   Hints: (1) Use $B_{x\leftarrow z}S_yB_{z\leftarrow x}$ with $B_{z\leftarrow x} = B_{x\leftarrow z}$ here. (2) Compute
   $S_yB$ first: $\tfrac{\hbar}{2\sqrt2}\begin{pmatrix}-i&i\\ i&i\end{pmatrix}$. (3) Now multiply by $B^\dagger$ on the left.
   Walkthrough: $S_yB$ as in hint 3 → $B^\dagger(S_yB)$ → off-diagonal $+i$ on top, $-i$ below → it is $-S_y^{(z)}$'s numbers.
   (Claim: `apply`-free check `matEq(operatorInBasis(SY, XB), mscale(SY, -1))` = true.)

### `l5-invariance`
1. **`l5-in-plusx` · warm-up · numeric** — "$|{+x}\rangle$ in x coordinates is $(1, 0)$, and
   $S_z^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$. Find $\langle S_z\rangle$."
   Answer `expectation(operatorInBasis(SZ, XB), vec(1, 0))` = **0** (tolerance 0.001).
   Hints: (1) $\langle S_z\rangle = c^\dagger S_z c$ in any one basis. (2) $S_z^{(x)}(1, 0) = \tfrac{\hbar}{2}(0, 1)$.
   (3) Take the inner product with $(1, 0)$.
   Walkthrough: $(1, 0)\cdot\tfrac{\hbar}{2}(0, 1) = 0$ → matches $\langle S_z\rangle = 0$ for $|{+x}\rangle$ in z coordinates
   (`expectation(SZ, KET['+x'])` = 0).
2. **`l5-in-sx` · core · numeric** — "For $c_z = (\sqrt3/2,\ 1/2)$, compute $\langle S_x\rangle$ in x coordinates, where
   $S_x$ is diagonal." Answer `expectation(operatorInBasis(SX, XB), toBasis(psi30, XB))` = **0.4330**.
   Hints: (1) Convert the column first. (2) $c_x = (0.966,\ 0.259)$ and $S_x^{(x)} = \tfrac{\hbar}{2}\mathrm{diag}(1, -1)$.
   (3) $\langle S_x\rangle = \tfrac{\hbar}{2}(|u|^2 - |v|^2)$.
   Walkthrough: $\tfrac12(0.933 - 0.067) = 0.433$ → check in z coordinates: $\hbar\,\mathrm{Re}(\alpha^*\beta) = \hbar\sqrt3/4$
   (`expectation(SX, psi30)` = 0.4330).
3. **`l5-in-proof` · core · choice** — "The invariance proof collapses $(c^\dagger B)(B^\dagger AB)(B^\dagger c)$. Which fact
   does it use?" Options: **$BB^\dagger = I$** (correct: `matEq(matmul(By, dagger(By)), identity(2))` = true; for a square
   $B$ it follows from $B^\dagger B = I$) · $B = B^\dagger$ (why not: true for the x basis only, false for y) · $B^2 = I$
   (why not: `matmul(By, By)` ≠ I) · $AB = BA$ (why not: the proof never swaps $A$ and $B$).
   Hints: (1) Look at the two places where $B$ meets $B^\dagger$. (2) In which order do they meet? (3) Which identity
   turns that order into $I$?
   Walkthrough: regroup as $c^\dagger(BB^\dagger)A(BB^\dagger)c$ → $BB^\dagger = I$ → $c^\dagger Ac$.
4. **`l5-in-ybasis` · stretch · numeric** — "For the notes' state $c_z = (\sqrt3/2,\ i/2)$, compute the probability of
   $+\tfrac{\hbar}{2}$ along x **entirely in y coordinates**: transform both the state and the projector $P_{+x}$."
   Answer `expectation(operatorInBasis(projector(KET['+x']), YB), toBasis(psiEx, YB))` = **0.5**.
   Hints: (1) $P^{(y)} = B_{y\leftarrow z}P_{+x}B_{z\leftarrow y}$ and $c_y = B_{y\leftarrow z}c_z$. (2) The answer must
   equal the z-coordinate one. (3) In z coordinates, $P(+x) = \tfrac12|\alpha + \beta|^2$.
   Walkthrough: $c_y$ = `toBasis(psiEx, YB)` → $P^{(y)}$ = `operatorInBasis(projector(KET['+x']), YB)` → $c_y^\dagger P^{(y)}c_y = 0.5$
   → check: $\tfrac12|\sqrt3/2 + i/2|^2 = \tfrac12$ (`prob(KET['+x'], psiEx)` = 0.5).

## 4. Glossary terms new in L5

Checked against the 60 ids already in `glossary.ts` (none of the ids below exists yet). Each gloss is one plain
sentence ≤ 25 words; words inside a gloss are either in `glossary.ts`, in this table, or in table 4b.

**4a. New in L5**

| id | Term | Gloss | First | uses / symbols |
|---|---|---|---|---|
| `population` | population $\vert\alpha\vert^2$, $\vert\beta\vert^2$ | The squared size of one amplitude in a basis: the probability of that basis outcome. | `l5-averages:b2` | uses `amplitude`, `probability` · symbols `\|\alpha\|^2` |
| `coherence` | coherence $\alpha^*\beta$ | The product of one amplitude's conjugate with the other; it carries their relative phase and sets the x and y averages. | `l5-averages:b3` | uses `amplitude`, `complex-conjugate`, `relative-phase` · symbols `\alpha^*\beta` |
| `ensemble` | ensemble | Many systems prepared in the same state; an average refers to one measurement on each of them, not to one system. | `l5-averages:b5` | uses `state`, `measurement` |
| `spin-polarization` | spin-polarization principle | Susskind's result that every spin state reads + for certain along some direction, so its three spin averages are never all zero. | `l5-averages:b7` | uses `state`, `expectation` |
| `inverse-problem` | inverse problem | Starting from an operator's matrix and working back to its possible readings and the states that give each reading for sure. | `l5-inverse:b2` | uses `eigenvalue`, `eigenvector` |
| `coordinates` | coordinates (of a state) | The numbers in a state's column; they are its amplitudes in one chosen basis, and change when the basis changes. | `l5-coordinates:b1` | uses `amplitude`, `basis` |
| `representation` | representation, $A^{(x)}$ | The column or matrix that describes a state or operator in one named basis; the superscript names that basis. | `l5-operators:b1` | uses `basis`, `operator` · symbols `A^{(x)}`, `A^{(z)}` |
| `basis-change-matrix` | basis-change matrix $B_{z\leftarrow x}$ | Its columns list each new basis vector in old coordinates, so it turns new coordinates into old ones (the notes' $B_x$). | `l5-coordinates:b3` | uses `basis`, `coordinates` · symbols `B_{z\leftarrow x}`, `B_x`, `B_{x\leftarrow z}` |
| `inverse-matrix` | inverse $B^{-1}$ | The matrix that undoes $B$: applying $B$ and then $B^{-1}$ leaves every column unchanged. | `l5-coordinates:b4` | symbols `B^{-1}` |
| `unitary` | unitary matrix | A matrix whose conjugate transpose is its inverse, $B^\dagger B = I$; its columns are orthonormal, so it keeps lengths and inner products. | `l5-coordinates:b4` | uses `conjugate-transpose`, `orthonormal-basis`, `inner-product` |
| `kronecker-delta` | Kronecker delta $\delta_{jk}$ | Shorthand that equals 1 when $j = k$ and 0 otherwise; orthonormal columns satisfy $v_j^\dagger v_k = \delta_{jk}$. | `l5-coordinates` review card (equations line) | symbols `\delta_{jk}` (the notes write $\delta_{ij}$) |
| `diagonal-matrix` | diagonal matrix, $\mathrm{diag}(\lambda_1, \lambda_2)$ | A matrix whose only nonzero entries run from top-left to bottom-right; it just rescales each basis vector. | `l5-operators:b4` | symbols `\mathrm{diag}`, `D` |
| `eigenbasis` | eigenbasis | A basis made of an operator's eigenvectors; written in it, the operator's matrix has zeros off the diagonal and its eigenvalues down it. | `l5-operators:b4` | uses `basis`, `eigenvector`, `diagonal-matrix` |
| `diagonalization` | diagonalization | Rewriting an operator in its own eigenbasis, $B^\dagger AB = D$, so its matrix becomes diagonal. | `l5-operators:b5` | uses `eigenbasis`, `diagonal-matrix` |
| `invariance` | basis independence | The fact that averages and probabilities come out the same in every basis, as long as state and operator are converted together. | `l5-invariance:b3` | uses `expectation`, `probability`, `basis` |
| `passive-change` | passive change (relabelling) | Changing only the coordinates used to describe a state; nothing physical happens, unlike a rotation, which changes the state (Lecture 6). | `l5-invariance:b6` | uses `coordinates`, `state` |

**4b. Terms L5 uses that L2–L4 should define first (proposed glosses, in case their plans do not)**

| id | Term | Gloss | Expected owner |
|---|---|---|---|
| `complex-conjugate` | conjugate $z^*$ | The complex number with the sign of its imaginary part flipped: $(a + bi)^* = a - bi$. | L2 |
| `real-part` / `imaginary-part` | $\mathrm{Re}\,z$, $\mathrm{Im}\,z$ | For $z = a + bi$, the real part is $a$ and the imaginary part is $b$ (a real number). | L2 |
| `operator` | operator $A$ | A rule that turns every state vector into another vector, written as a matrix once a basis is chosen. | L3 |
| `eigenvector` / `eigenvalue` | eigenvector, eigenvalue $\lambda$ | A nonzero vector that an operator only rescales, $Av = \lambda v$; the factor $\lambda$ is its eigenvalue. | L3 |
| `conjugate-transpose` | conjugate transpose $A^\dagger$ | Swap rows with columns and conjugate every entry; for a column this gives the matching bra. | L3 |
| `hermitian` | Hermitian | Equal to its own conjugate transpose, $A_{jk} = A_{kj}^*$; observables are Hermitian, so their readings are real. | L3 |
| `projector` | projector $P = \vert a\rangle\langle a\vert$ | The operator that keeps only the part of a state along $\vert a\rangle$; its average is the probability of that outcome. | L3/L4 |
| `identity-matrix` | identity $I$ | The matrix that leaves every column unchanged: ones on the diagonal, zeros elsewhere. | L3 |
| `pauli-matrices` | Pauli matrices $\sigma_x, \sigma_y, \sigma_z$ | The three 2×2 matrices with $S_k = \tfrac{\hbar}{2}\sigma_k$; their eigenvalues are $\pm1$. | L4 |
| `determinant` | determinant $\det$ | For a 2×2 matrix, top-left times bottom-right minus top-right times bottom-left; it is zero exactly when some nonzero column is sent to zero. | L4 |
| `characteristic-equation` | characteristic equation | $\det(A - \lambda I) = 0$: the equation whose solutions $\lambda$ are an operator's eigenvalues. | L4 |

## 5. Review card per unit

Shape = `ReviewCard` (`points` ≤ 5 sentences of ≤ 25 words, one display-TeX `equations` line, one `trap`). Every
number is a §1 claim or the engine call in brackets.

### `l5-averages` — Three averages from one column
- The same rule gives every average: $\langle S_k\rangle = \langle\psi|S_k|\psi\rangle$ for $k = x, y, z$, one matrix product each.
- $\langle S_z\rangle$ depends only on the populations; $\langle S_x\rangle$ and $\langle S_y\rangle$ depend on the coherence $\alpha^*\beta$.
- For $c_z = (\sqrt3/2,\ i/2)$: $\langle S_z\rangle = \hbar/4$, $\langle S_x\rangle = 0$, $\langle S_y\rangle \approx 0.433\,\hbar$.
- Each average is taken over its own ensemble; no single atom has all three values.

$$\langle S_z\rangle = \tfrac{\hbar}{2}(|\alpha|^2 - |\beta|^2),\qquad \langle S_x\rangle = \hbar\,\mathrm{Re}(\alpha^*\beta),\qquad \langle S_y\rangle = \hbar\,\mathrm{Im}(\alpha^*\beta)$$

**The one trap:** forgetting to conjugate in the bra. With $\langle\psi| = (\alpha, \beta)$ instead of $(\alpha^*, \beta^*)$,
the notes' state would give $\langle S_y\rangle = 0$ [`inner`-free check: `vec(Math.sqrt(3)/2, c(0,0.5))` row without
conjugation times `apply(SY, psiEx)` → $\tfrac{\sqrt3}{2}\cdot\tfrac14 + \tfrac{i}{2}\cdot\tfrac{i\sqrt3}{4} = 0$], and in
general complex answers. A real observable always has a real average.

### `l5-inverse` — Matrix in, outcomes and states out
- Eigenvalues are the possible readings; normalized eigenvectors are the states that give each reading for sure.
- Recipe: $\det(A - \lambda I) = 0$, then $(A - \lambda I)w = 0$, then $w^\dagger w = 1$ and a phase choice.
- Hermitian matrices, even with complex entries, always give real readings and orthogonal eigenvectors.
- The eigenvectors form an orthonormal basis: the natural coordinates for that observable.

$$\det(S_x - \lambda I) = \lambda^2 - \tfrac{\hbar^2}{4} = 0 \;\Rightarrow\; \lambda = \pm\tfrac{\hbar}{2},\qquad |{\pm x}\rangle = \tfrac{1}{\sqrt2}\begin{pmatrix}1\\ \pm1\end{pmatrix}$$

**The one trap:** thinking $-(1,1)/\sqrt2$ is a different answer from $(1,1)/\sqrt2$. It is the same state; the course
just fixes the phase so the first entry is real and positive [`samePhysicalState(KET['+x'], vscale(KET['+x'], -1))`].

### `l5-coordinates` — Same state, new coordinates
- A column means nothing until its basis is named: $(1, 0)$ is $|{+z}\rangle$ in z coordinates and $|{+x}\rangle$ in x coordinates.
- $B_{z\leftarrow x}$ has the new basis vectors, in old coordinates, as columns; it turns x coordinates into z coordinates.
- Orthonormal columns make it unitary, so the way back is its conjugate transpose, $B_{x\leftarrow z} = B_{z\leftarrow x}^\dagger$.
- The new coordinates are Born amplitudes: $c_x = (\langle{+x}|\psi\rangle, \langle{-x}|\psi\rangle)$.
- Nothing physical happens; only the description changes.

$$c_z = B_{z\leftarrow x}\,c_x,\qquad c_x = B_{z\leftarrow x}^\dagger\,c_z,\qquad (B^\dagger B)_{jk} = v_j^\dagger v_k = \delta_{jk},\qquad B_{z\leftarrow x} = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$$

**The one trap:** trusting that $B = B^\dagger$. It holds for the x basis by luck; for the y basis the two differ
[`matEq(By, dagger(By))` = false], so always keep track of the arrow's direction.

### `l5-operators` — Operators change coordinates too
- An operator's matrix changes with the basis; the operator itself does not.
- Read $B_{x\leftarrow z}A^{(z)}B_{z\leftarrow x}$ right to left: into z, act, back to x.
- Written in its own eigenbasis, an operator's matrix keeps only its eigenvalues, placed down the diagonal ($AB = BD$).
- Townsend's opposite sign for $|{-x}\rangle$ flips entries of $S_z^{(x)}$ but no prediction.

$$A^{(x)} = B_{x\leftarrow z}\,A^{(z)}\,B_{z\leftarrow x},\qquad S_x^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix},\qquad S_z^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$$

**The one trap:** reading $S_z^{(x)}$ as "the x-spin" because its numbers match $S_x^{(z)}$. The subscript names the
component measured; the superscript names the coordinates [`matEq(operatorInBasis(SZ, XB), SX)` = true, yet it is $S_z$].

### `l5-invariance` — Predictions ignore the coordinates
- Convert state and operator together and every average is unchanged: $|{+z}\rangle$ gives $\langle S_z\rangle = \hbar/2$ in x coordinates too.
- Two nonzero entries in $c_x$ are x amplitudes; they say nothing about uncertainty in z.
- Probabilities survive too, using the converted projector $B^\dagger P B$.
- A basis change relabels; a rotation (Lecture 6) changes the state.

$$c_{\text{new}}^\dagger A^{(\text{new})}c_{\text{new}} = (c_{\text{old}}^\dagger B)(B^\dagger A^{(\text{old})}B)(B^\dagger c_{\text{old}}) = c_{\text{old}}^\dagger A^{(\text{old})}c_{\text{old}}$$

**The one trap:** mixing bases. A column in x coordinates with a matrix in z coordinates gives $\langle S_z\rangle = 0$
for $|{+z}\rangle$ [`expectation(SZ, toBasis(KET['+z'], XB))` = 0] instead of $\hbar/2$.

## 6. Symbol-before-use table

**Reading order assumed:** units in array order; inside a unit: story beats (L → B → C, reveal after its question) →
Try it → insight → pitfalls → review → challenges. Earlier lectures count as defined (L1 from `glossary.ts`; L2–L4
from the gloss ids in §4b). **Status:** OK = defined at or before first use · **FLAG** = clash or use-before-definition,
with the fix already applied in §1–§5 of this plan · gloss = a glossary tag is enough.

| Symbol | First use in L5 | First definition | Status | Fix / note |
|---|---|---|---|---|
| $\hbar$ | `l5-averages:b1` | L1 (`hbar`) | OK | — |
| $S_x, S_y, S_z$ | `l5-averages:b1` | L1 (`s-z`), L4 (all three) | gloss | Tag `pauli-matrices` on first $\sigma_k$. |
| $P_{\pm y}$ | `l5-averages:b1` | same sentence | OK | Tag `projector`. |
| $\vert{\pm y}\rangle$, $\langle{+y}\vert$ | `l5-averages:b1` | L2 (kets), L1 (`bra`) | OK | — |
| $i$ (imaginary unit) | `l5-averages:b1` | L1/L2 (`complex-number`) | OK | — |
| $\sigma_k$, index $k$ | `l5-averages:b1` | same sentence | **FLAG (fixed)** | The notes write $S_i = \tfrac{\hbar}{2}\sigma_i$ on a page full of imaginary $i$'s. The app uses $k = x, y, z$; likewise $A_{jk}$ and $\delta_{jk}$ below. |
| $c_z$, $\alpha$, $\beta$ | `l5-averages:b2` | same beat | OK | — |
| $\vert\alpha\vert^2, \vert\beta\vert^2$ (populations) | `l5-averages:b2` | same beat | OK | Tag `population`. |
| $\langle S_z\rangle$ and $\langle\psi\vert S_z\vert\psi\rangle$ | `l5-averages:b2` | L1 (`expectation`), L4 §3 | OK | L1's gloss sentence on ⟨·⟩ (average) vs ⟨a\|ψ⟩ (inner product) covers the two bracket uses in one line. |
| $\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle$ | `l5-averages:b2` caption | L1 (`sigma-reading`) | OK | Caption says "in units of ħ/2" once. |
| $\alpha^*$ | `l5-averages:b3` | same beat ("the conjugate of α") | OK | Tag `complex-conjugate`. |
| $\mathrm{Re}$, $\mathrm{Im}$ | `l5-averages:b3`, `b4` | L2 (proposed `real-part`, `imaginary-part`) | gloss | — |
| $\alpha^*\beta$ (coherence) | `l5-averages:b3` | same beat | OK | Tag `coherence`. |
| $\hat n$, $\vec\sigma$, $\sigma_n$, $n_x, n_y, n_z$ | `l5-inverse:b4` | $\hat n$: L1 (`unit-vector`); rest inline | OK | — |
| $\lambda$ | `l5-inverse:b1` | L3/L4 (`eigenvalue`) | gloss | — |
| $w = (a, b)$ | `l5-inverse:b1` | same beat | **FLAG (fixed)** | L4/L5 notes call the unknown column $v$, but $v$ is also the −x amplitude from `l5-coordinates:b1` on. Renamed $w$ here and in the recipe line of the review card. $v_1, v_2$ (subscripted) stay as the notes' eigenvector columns. |
| $I$, $\det$ | `l5-inverse:b1` | L3/L4 (`identity-matrix`, `determinant`) | gloss | — |
| $a_0$, $\vec a$, $a_x, a_y, a_z$ | `l5-inverse:b5` | same beat | OK | Different letters from $(a, b)$ of b1 only by form; the stage gauge labels $a_0$ explicitly. |
| $A_{jk}$, $A_{kj}^*$ | `l5-inverse:b5` | same beat | **FLAG (fixed)** | Townsend and the notes write $A_{ij}$; see the $k$ row. |
| $u$, $v$ | `l5-coordinates:b1` | same beat ($u = \langle{+x}\vert\psi\rangle$, …) | OK | Notes' letters kept. |
| $B_{z\leftarrow x}$ (= notes' $B_x$) | `l5-coordinates:b3` | same beat, with the Rosetta sentence | OK | The arrow convention is stated once here (§0). |
| $B$ (bare), $B^\dagger$, $B^{-1}$, $B_{x\leftarrow z}$ | `l5-coordinates:b4` | same beat ("$B$ short for $B_{z\leftarrow x}$") | **FLAG (fixed)** | The notes switch from $B_x$ to bare $B$ without saying so; b4 now says it. Tags `inverse-matrix`, `conjugate-transpose`. |
| $\delta_{jk}$ | `l5-coordinates` review card | glossary `kronecker-delta` | gloss | — |
| $B_{z\leftarrow y}$, $B_{y\leftarrow z}$ | `l5-coordinates:b7` reveal | b3 convention, entries given | OK | — |
| $\psi_z, \psi_x, \chi_z, \chi_x$ | `l5-operators:b1`–`b2` | same beats ("$\psi_z$ … our $c_z$") | **FLAG (fixed)** | The notes' output ket is $\vert\phi\rangle$, but $\phi$ is the Bloch azimuth (Try-it sliders) and the rotation angle of $R_z(\phi)$ (`l5-invariance:b6`). Renamed $\vert\chi\rangle$. The challenge's phase letter moved from χ to γ (L1's global-phase letter). |
| $A^{(z)}, A^{(x)}$ (basis superscript) | `l5-operators:b1` | same beat | OK | Tag `representation`. |
| $A_{\text{new}}, A_{\text{old}}$ | `l5-operators:b2` | same beat (quoting the notes' form) | OK | — |
| $\mathrm{diag}(\cdot)$ | `l5-operators:b4` caption | b5 ($D = \mathrm{diag}(\lambda_1, \lambda_2)$); gloss `diagonal-matrix` | gloss | Tag the caption's first $\mathrm{diag}$. |
| $v_1, v_2$, $\lambda_1, \lambda_2$, $D$ | `l5-operators:b5` | same beat | OK | — |
| $S_z^{(x)}$ | `l5-operators:b6` | superscript rule of b1 | OK | Also used in `l5-invariance:b1`, after b6. |
| $P_{+z}^{(x)}$ | `l5-invariance:b2` | same beat | OK | — |
| $c_{\text{new}}, c_{\text{old}}$, $A^{(\text{new})}$ | `l5-invariance:b3` | same beat ("for any old and new basis") | **FLAG (fixed)** | Added the phrase; the notes use the labels without introducing them. |
| $R_z(\phi) = e^{-i\phi S_z/\hbar}$ | `l5-invariance:b6` | in words in the same beat; exponential of a matrix: L6 | gloss (forward) | Forward reference by design, as on the notes' p. 14. |
| $\theta$, $\phi$ (widget sliders) | `l5-averages` Try it; `l5-invariance` Try it | the `l5-invariance` prompt defines them via $\vert\alpha\vert^2 = \cos^2\tfrac{\theta}{2}$ and "φ = phase of β relative to α" | **FLAG (fixed)** | The `l5-averages` prompts avoid the letters ("drag around the vertical axis"); the `l5-coordinates` prompt now says "θ, which sets the populations". |
| $\gamma$ | `l5-av-phase` challenge | same prompt | OK | — |
| $p$, $q$ | `l5-co-skew` challenge | same prompt | OK | — |
| $\Delta S_z$ | — | — | not used | The notes' p. 14 uses it before any L5–L6 definition; replaced by the projector check (§7 E2). |

**Counts:** 7 FLAG rows, all fixed inside this plan (index $i$ vs imaginary $i$ ×2 rows, $v$ reused, bare $B$, $\vert\phi\rangle$
vs angle $\phi$, old/new labels, slider letters). No beat introduces a symbol after it is used.

## 7. Errata

Every derivation on L5 pp. 2–15 was redone against the engine conventions (numpy, independent of `app/`). **No physics
error was found in the L5 notes**: every boxed result checks out (spin matrices, projectors, the three averages of the
p. 5 state, the $S_x$ eigen-solution, $B_x$, $c_x = B_x^\dagger c_z$, $S_x^{(x)}$, $S_z^{(x)}$, the $B_y$ check, the p. 14
invariance example). What follows are **disagreements between sources** and **scope inconsistencies**, ranked by how
much a learner could be misled.

**E1 · Townsend's phase for $|{-x}\rangle$ flips the sign of $S_z^{(x)}$ (source disagreement; teach it, no correction box).**
- Notes (p. 13) and engine: $|{-x}\rangle = (1, -1)/\sqrt2$, so $B_x = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$,
  $S_z^{(x)} = +\tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$, and $|{+z}\rangle \to c_x = (1, 1)/\sqrt2$.
- Townsend §2.5 main text (eq. 2.90, p. 53) redefines $|{-x}\rangle = (-1, 1)/\sqrt2$ so that $|{\pm x}\rangle = R_y(90^\circ)|{\pm z}\rangle$.
  Then his $S$ (eq. 2.99) is $\tfrac{1}{\sqrt2}\begin{pmatrix}1&-1\\1&1\end{pmatrix}$, his $J_z$ in the $S_x$ basis (eq. 2.100) has
  off-diagonal entries $-\hbar/2$, and $|{+z}\rangle \to (1, -1)/\sqrt2$ (eq. 2.101). His Example 2.5 (p. 57) returns to the
  notes' phases and gets $+\hbar/2$.
- Evidence: `operatorInBasis(SZ, [KET['+x'], vscale(KET['-x'], -1)])` = [[0, −0.5], [−0.5, 0]] vs
  `operatorInBasis(SZ, XB)` = [[0, 0.5], [0.5, 0]]; numpy agrees; both give $\langle S_z\rangle = 0.5$ for $|{+z}\rangle$.
  numpy also confirms Townsend's $S$ equals $e^{-i(\pi/2)\sigma_y/2}$ exactly.
- Handling: `l5-operators:b7` (books beat), Rosetta line "Townsend §2.5 uses $-|{-x}\rangle$", challenge trap options.

**E2 · Variance and uncertainty: moved out, but still used (scope inconsistency).**
- p. 1 says variance and uncertainty move to Lecture 6. Yet p. 5 is subtitled as an example to reuse for uncertainty and
  ends with a transition into fluctuations; p. 6 says we can already predict "averages and uncertainties"; p. 14 computes
  $\Delta S_z = 0$ in x coordinates; p. 15's board reference and plan still list the variance formula and a "Part 3".
- L6 p. 1 defers variance again; L7 §7.7 is where the spreads are taught (BUILD-LOG, Lecture 7).
- Evidence the p. 14 result itself is right: `variance(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))` = 0 and
  $(S_z^{(x)})^2 = \tfrac{\hbar^2}{4}I$ (numpy).
- Handling: L5 does not define $\Delta$. `l5-invariance:b2` makes the same point with the transformed projector from the same
  page ($P(+z) = 1$). Question Q2 asks whether the user wants the $\Delta S_z$ line kept as a forward-linked aside.

**E3 · The "Lecture 6 handoff" (p. 14) promises commutators and the general uncertainty relation next time.**
- The L6 notes cover the Bloch sphere, passive vs active and $R_z$, and defer uncertainty; commutators and uncertainty are
  L7 §7.5–7.9. The app's "Where next" fork from L5 should therefore point to L6 for rotations and to L7 for commutators.

**E4 · Unstated step in the invariance proof (p. 14).**
- The proof collapses $(c^\dagger B)(B^\dagger AB)(B^\dagger c)$ using $BB^\dagger = I$, while p. 10 derived only $B^\dagger B = I$.
  For a square matrix one implies the other, so the proof is right; for a non-square $B$ with orthonormal columns it would
  fail (numpy: a 3×2 example gives $B^\dagger B = I$ but $BB^\dagger = \mathrm{diag}(1, 1, 0)$).
- Handling: `l5-invariance:b3` says the square-matrix step aloud; challenge `l5-in-proof` asks for it.

**E5 · Duplicate material with L4 (coordination, not an error).**
- L5 pp. 2–3 repeat L4 pp. 14–16 ($S_y$ from projectors, the three matrices, Hermiticity, the "which basis?" question);
  L5 pp. 6–7 repeat L4 pp. 17–18 (the $S_x$ eigenproblem); L5 p. 8's $u, v$ were already written by L4 p. 19.
- Handling: one recap beat each (`l5-averages:b1`, `l5-inverse:b1`); `concepts.ts` maps `eigen-problem` to L5 although
  L4's notes solve it first (Q1).

**E6 · Basis-change matrix is not a rotation matrix, but is one up to a phase (note for the L6 planner).**
- Townsend (Ex. 2.5, p. 57) warns that with the standard phases the S-matrix is not the rotation $R_y(90^\circ)$. Evidence:
  `det2(Bx)` = −1, while every $R_{\hat n}(\phi)$ has determinant +1. But numpy confirms
  $B_x = i\,R_{\hat m}(180^\circ)$ with $\hat m = (\hat x + \hat z)/\sqrt2$, i.e. a rotation times a global phase.
- Handling in L5: none (the passive/active distinction is L6's). The L6 plan should avoid saying "a basis change is never a
  rotation" and say "we use it passively".

**E7 · Timing tables disagree (not shown to learners).**
- p. 1: Part 4 = 12 min, Part 5 = 38 min, no Part 3. p. 6: Part 4 = 15 min. p. 8: Part 5 = 20 min. p. 15: Parts 1–5 =
  10/10/15/15/20 plus 5 (a Part 3 that no longer exists). Section numbers jump from 2 to 4. No app action.

**E8 · Reading citation (minor).** p. 15 cites Townsend §2.5 as pp. 52–58; §2.5 ends on p. 57 and p. 58 begins §2.6
(expectation values), which is also relevant. The app cites §2.5 pp. 52–57 and §2.6 pp. 58–59 separately.

**Agreements checked (no action):** Susskind's $|i\rangle, |o\rangle$ equal the engine's `KET['+y']`, `KET['-y']`;
Townsend Ex. 2.7 ($\langle S_z\rangle = -\hbar/4$) matches `expectation(SZ, ketFromBloch(120°, 90°))` = −0.25; the notes'
$R_z(\phi) = e^{-i\phi S_z/\hbar}$ (p. 14) equals the engine's `Rz(φ)` (numpy `expm`); Townsend eq. 2.88,
$R_z(90^\circ)|{+x}\rangle = e^{-i\pi/4}|{+y}\rangle$, matches `apply(Rz(Math.PI/2), KET['+x'])`.

## 8. Engine gaps

The engine already covers almost all of L5: `expectation`, `eigenHermitian2`, `projector`, `fromSpectrum`,
`basisMatrix`, `toBasis`, `operatorInBasis`, `det2`, `isUnitary`, `isHermitian`, `decomposeHermitian`, `canonicalPhase`,
`samePhysicalState`, `Rz`. The "seeded random" property claims in §1 should read their states and matrices from the
existing numpy fixture set (`pipeline/make_fixtures.py` → `physics/__fixtures__/numpy.json`, seed 448, which already
holds random `basis_changes` with `A_new`, `psi_new`, `expectation`) rather than from a new TypeScript RNG. L5's keyed
values (`psiEx` averages, `psi30` coordinates, the challenge answers) go through `make_claim_fixtures.py` as L1's do.

| # | Name and signature | Formula | Needed by | numpy check | Priority |
|---|---|---|---|---|---|
| G1 | `inv2(M: Mat, eps = 1e-12): Mat \| null` (linalg.ts) | $M^{-1} = \tfrac{1}{\det M}\begin{pmatrix}m_{22}&-m_{12}\\-m_{21}&m_{11}\end{pmatrix}$; `null` when $\lvert\det M\rvert <$ eps | `l5-coordinates:b8` reveal, challenge `l5-co-skew` (non-orthonormal basis: the dagger is not the inverse) | `np.linalg.inv` on the fixture $N = \begin{pmatrix}1&1/\sqrt2\\0&1/\sqrt2\end{pmatrix}$ → $\begin{pmatrix}1&-1\\0&\sqrt2\end{pmatrix}$; property `M @ inv2(M) ≈ I` on 5 seeded random invertible complex matrices; `null` on a rank-1 matrix | **must** (two learner-visible numbers) |
| G2 | `trace2(M: Mat): C` (export the private `trace` in operators.ts) and `charPoly2(M: Mat): [C, C, C]` | $\det(M - \lambda I) = \lambda^2 - (\mathrm{tr}\,M)\lambda + \det M$ → `[1, −tr M, det M]` | `l5-inverse:b1` (the displayed $\lambda^2 - \hbar^2/4$), hints of `l5-inv-values` ($(1-\lambda)^2 - 4$) and `l5-inv-complex` ($\lambda^2 - 2\lambda - 2$) | `np.poly(M)` equals `[1, −tr, det]` for `SX` (→ [1, 0, −0.25]), `[[1,2],[2,1]]` (→ [1, −2, −3]) and the complex $A$ (→ [1, −2, −2]) | should (otherwise the polynomial is hand-typed) |
| G3 | `eigenvectorFor(M: Mat, lambda: number): Vec` (spin.ts) | the lecture's back-substitution: from the first nonzero row $(m_{11}-\lambda,\ m_{12})$ of $M - \lambda I$ take $w \propto (m_{12},\ \lambda - m_{11})$ (else use row 2), then `canonicalPhase(normalize(w))` | `l5-inverse:b1` step replay; walkthrough of `l5-inv-vector`; a second, independent route to cross-check `eigenHermitian2` (which uses the $\vec a\cdot\vec\sigma$ geometry instead) | `scipy.linalg.null_space(M − λI)` with the same phase rule, for `SX`, `SY`, `[[1,2],[2,1]]`, the complex $A$ and 5 random Hermitian fixtures | nice to have |
| G4 | `basisChange(from: 'z'\|'x'\|'y', to: 'z'\|'x'\|'y'): Mat` (spin.ts) | $B_{\text{to}\leftarrow\text{from}} = B_{z\leftarrow\text{to}}^\dagger\,B_{z\leftarrow\text{from}}$, with $B_{z\leftarrow b}$ = `basisMatrix` of $\lvert{\pm b}\rangle$ | every claim written with arrows (§1 uses `Bx`, `dagger(By)` by hand); makes the direction convention a tested function, since the direction is this lecture's main trap | $B_{b\leftarrow a}B_{a\leftarrow b} = I$ for all 6 ordered pairs; `basisChange('x','z')` equals `Bx`; `basisChange('z','y')` equals $\tfrac{1}{\sqrt2}\begin{pmatrix}1&-i\\1&i\end{pmatrix}$ | should |
| G5 | `diag2(a: C \| number, b: C \| number): Mat` and `isDiagonal(M: Mat, eps = 1e-9): boolean` (linalg.ts) | $\mathrm{diag}(a, b)$; off-diagonal sizes below eps | `l5-operators:b4`, `b5`, `b8` claims ("is diagonal"); `BasisTranslator` currently inlines the same test | trivial; `np.diag` | nice to have |

Not an engine gap but a **stage question for D/W**: `l5-averages:b8` puts `source: '+y'` on a lab bench. `benchTheory`
supports it (the type allows any `NamedKet`), but a $|{+y}\rangle$ beam cannot be prepared on this bench by an SG
magnet, so `showPrep` must stay off and the source needs a labelled box. See §10 `lab-r3` and Q5.

## 9. Hooks

**Concept ids (existing, `concepts.ts`).**
- `eigen-problem` (L5) → `unit: 'l5-inverse'`. Caveat: L4's notes solve the $S_x$ case first (E5, Q1); L5's own share is
  the bridge to coordinates, the assigned $S_y$ problem and the book generalizations.
- `basis-change` (L5) → `unit: 'l5-coordinates'` (also taught by `l5-operators` and `l5-invariance`).
- Prerequisites to list in `Lecture.prerequisites`: `spin-matrices`, `expectation`, `projectors` (L4), `inner-product`,
  `complex-amplitudes` (L2).
- Downstream already in the map: `passive-active` (L6) needs `basis-change`; `bloch-sphere` (L6) needs `expectation`.

**Proposed additions for W (concept map v2; proposal only):**
- `spin-averages` — "Averages of all three spin components", L5, `unit: 'l5-averages'`, needs
  `['expectation', 'spin-matrices', 'complex-amplitudes']`; and add it to the needs of `bloch-sphere` (L6), whose
  coordinates are exactly these averages.
- `diagonalization` — "Diagonalizing an operator", L5, `unit: 'l5-operators'`, needs
  `['basis-change', 'eigen-problem']`.
- `COURSE_LECTURES` title for L5 already matches ("Spin matrices, expectation values and basis changes").

**Where-next fork (Phase 4a pattern).** From the end of L5: "Rotate the state instead of the coordinates" → L6
(`passive-active`, `rz`); "Watch the three averages as a point" → L6 (`bloch-sphere`); "When two measurements
disagree" → L7 (`commutators`). Not "L6 for commutators", despite the notes' p. 14 handoff (E3).

**Arcade levels (one per unit; data shapes from `arcade/games.ts`).**

| Unit | Game | Level |
|---|---|---|
| `l5-averages` | **Bloch golf** | `id: 'l5-aim-by-averages'`, title "Aim by averages". The target is announced only by its averages, $(0, 0, -\tfrac{\hbar}{2})$. `start: '+x'`, `target: '-z'`, `par: 1`, `solution: [{ axis: 'y', sign: 1 }]`. Hint: "Only the z average is nonzero, and it is negative. Which named state is that?" Why: "$(0, 0, -\hbar/2)$ is $\lvert{-z}\rangle$; a quarter turn about y carries $+x$ to $-z$." Check: `samePhysicalState(apply(rotation([0, 1, 0], Math.PI/2), KET['+x']), KET['-z'])` = true. `trains: { lecture: 'L5', unit: 'l5-averages', label: '5.1 Three averages from one column' }`. (Alternative, Route the beam: `source: '+y'`, target + fraction ¼ with 2 devices, e.g. z(+) → x; teaches that $\lvert{+y}\rangle$ splits 50/50 on both bench axes, `l5-averages:b8`.) |
| `l5-inverse` | **Spot the error** | `id: 'l5-eigen-sign'`, "The second eigenvector". Steps: (0) "$A = \begin{pmatrix}1&2\\2&1\end{pmatrix}$ gives $\det(A - \lambda I) = (1-\lambda)^2 - 4$." (1) "So the readings are $\lambda = 3$ and $\lambda = -1$." (2) "For $\lambda = 3$ the top row reads $-2a + 2b = 0$, so $b = a$." (3) "For $\lambda = -1$ the top row reads $2a + 2b = 0$, so again $b = a$." `wrong: 3`. Why: "$2a + 2b = 0$ means $b = -a$: the eigenvector is $(1, -1)/\sqrt2$, orthogonal to $(1, 1)/\sqrt2$, as a Hermitian matrix requires." Check: `eigenHermitian2(mat([[1, 2], [2, 1]])).vectors[1]` = (0.7071, −0.7071). |
| `l5-coordinates` | **Spot the error** | `id: 'l5-arrow'`, "Which way does B go?". Steps: (0) "$B_{z\leftarrow y} = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\ i&-i\end{pmatrix}$ has $\lvert{\pm y}\rangle$ as columns." (1) "To get y coordinates, multiply the z column by $B_{z\leftarrow y}$." (2) "For $\lvert{+y}\rangle$ this gives $c_y = \tfrac12(1+i,\ 1+i)$." (3) "So $\lvert{+y}\rangle$ reads + along y only half the time." `wrong: 1`. Why: "$B_{z\leftarrow y}$ turns y coordinates into z coordinates. The way back is $B_{y\leftarrow z} = B_{z\leftarrow y}^\dagger$, which gives $c_y = (1, 0)$." Check: `apply(By, KET['+y'])` = (0.5+0.5i, 0.5+0.5i); `toBasis(KET['+y'], YB)` = (1, 0). (The x basis would hide this error, since $B_x = B_x^\dagger$.) |
| `l5-operators` | **Spot the error** | `id: 'l5-label'`, "Same numbers, same spin?". Steps: (0) "In x coordinates, $S_z^{(x)} = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$." (1) "Those are exactly the numbers of $S_x$ in z coordinates." (2) "So in the x basis, $S_z$ has turned into the x-spin." (3) "Hence $\lvert{+z}\rangle$ has $\langle S_x\rangle = \tfrac{\hbar}{2}$." `wrong: 2`. Why: "The subscript names the magnet and never changes; only the numbers do. $\langle S_x\rangle$ for $\lvert{+z}\rangle$ is 0 in every basis." Check: `matEq(operatorInBasis(SZ, XB), SX)` = true; `expectation(SX, KET['+z'])` = 0. |
| `l5-invariance` | **Spot the error** | `id: 'l5-mixed-bases'`, "Half a translation". Steps: (0) "$\lvert{+z}\rangle$ in x coordinates is $c_x = (1, 1)/\sqrt2$." (1) "$S_z$ in z coordinates is $\tfrac{\hbar}{2}\,\mathrm{diag}(1, -1)$." (2) "So $\langle S_z\rangle = c_x^\dagger\,\tfrac{\hbar}{2}\mathrm{diag}(1, -1)\,c_x = 0$." (3) "So a z magnet sends these atoms up and down equally often." `wrong: 2`. Why: "The column and the matrix must be in the same basis: $c_x^\dagger S_z^{(x)}c_x = \hbar/2$, so every atom goes up. Step 3 only repeats the mixed-up result." Check: `expectation(SZ, toBasis(KET['+z'], XB))` = 0 (the error) vs `expectation(operatorInBasis(SZ, XB), toBasis(KET['+z'], XB))` = 0.5. |

Note for W: `schema.ts` `GameSpec.kind` already lists `'basis-sprint'`, but `arcade/games.ts` `GameKind` does not. A
"basis sprint" (translate a column or matrix against the clock) would fit L5 exactly; it is out of scope here (Q6).

## 10. Fidelity notes per stage kind

Existing items in `content/fidelity.ts` still apply; below are only the **L5-specific** additions (new ids, ready for
`fidelity.ts`, student-facing sentences) plus which existing items L5 beats should flag.

### `hilbert-plane` — used in `l5-inverse:b2, b6`, all of `l5-coordinates`, `l5-operators:b4–b5` (bottom), all of `l5-invariance`
**Gets right (exact)**
- `plane-frame-is-basis` (new): "When the frame turns to x, the shadows of the arrow on the new axes are exactly the x
  coordinates $c_x = B_{x\leftarrow z}c_z$. The two frame arrows are the columns of $B_{z\leftarrow x}$."
- Existing `plane-shadow-born`: squared shadows are Born probabilities and add to 1 in either frame (the invariance of
  total probability, `l5-invariance`).
- Existing `plane-angles-true`: every L5 state on this stage is real, so all its angles are true Hilbert angles.

**Distorts (schematic)**
- `plane-passport-z` (new): "The passport's axis labels always name $|{+z}\rangle$ and $|{-z}\rangle$, the fixed reference.
  The amber and cobalt frame is the basis being read, which may be x."
- Existing `plane-real-slice`: the y basis has complex columns, so $B_{z\leftarrow y}$ and the $S_y$ check stay in text
  (`l5-coordinates:b7`, `l5-operators:b8`).

**Misleading on purpose**
- `plane-frame-turn-passive` (new): "The frame turning looks like a rotation, but nothing moved: a change of basis only
  relabels the same state. Lecture 6's rotations move the arrow and keep the frame."
- Existing `plane-half-angles`: the x frame sits at 45°, although x and z magnets are 90° apart in the lab.

### `operator-space` — used in `l5-averages:b1`, `l5-inverse:b1, b3–b5`, `l5-operators:b1–b8`
**Gets right (exact)**
- `op-arrow-basis-free` (new): "The arrow is the operator itself. Changing coordinates changes its table of numbers, never
  the arrow: $S_z$ stays on the $a_z$ axis whether you write it in z or in x coordinates."
- Existing `op-one-point`: readings $a_0 \pm |\vec a|$ and eigenstates along $\pm\hat a$ (`l5-inverse:b4–b5`).

**Distorts (schematic)**
- `op-z-basis-entries` (new): "The axes $a_x, a_y, a_z$ are read from the operator's entries in z coordinates. A matrix
  written in another basis must be converted back first: the numbers of $S_z^{(x)}$, read as if they were z-basis entries,
  would draw $S_x$'s arrow."
- Existing `op-four-dimensions`, `op-a0-gauge` (`l5-inverse:b5` uses the gauge).

**Misleading on purpose**
- Existing `op-ghost-sphere` together with `plane-bloch-doubles`: the two eigenstates sit at opposite ends of the eigen-axis,
  180° apart, but as vectors they are only 90° apart (the split beats `l5-operators:b4–b5` show both at once).

### `bloch` — used in `l5-averages:b2–b8` (as a plot of the three averages)
**Gets right (exact)**
- `bloch-height-populations` (new): "The point's height is $\langle\sigma_z\rangle = |\alpha|^2 - |\beta|^2$, set by the
  populations alone. Its direction around the vertical axis is the phase of the coherence $\alpha^*\beta$."
- Existing `bloch-one-point`: coordinates are exactly $(\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle) = 2\langle S\rangle/\hbar$.

**Distorts (schematic)**
- `bloch-preview` (new): "In Lecture 5 this stage is only a plot of the three averages. Why every state lands on a sphere,
  and why the phase becomes an angle, is Lecture 6."

**Misleading on purpose**
- `bloch-three-ensembles` (new): "One point shows three averages, but no atom carries three values. Each coordinate is the
  average of a separate batch of atoms measured along that one axis."
- Existing `bloch-double-angle`, `bloch-global-phase-hidden` (flag on `l5-averages:b2–b4`, where only the relative phase turns).

### `lab-r3` — used once, in `l5-averages:b8` (question stage)
**Gets right (exact)**
- Existing `lab-born-fractions`: the 50/50 splits of $|{+y}\rangle$ along z and along x are exact (`benchTheory`).

**Distorts (schematic)**
- `lab-y-source` (new): "The $|{+y}\rangle$ beam comes from a labelled source box. No magnet on this bench can prepare it,
  because that would need a magnet along the beam's own direction; a real experiment would turn the beam line instead."

**Misleading on purpose**
- Existing `lab-beam-along-y`: magnets cannot point along y here, so $\langle S_y\rangle$ is invisible on this bench. Equal
  splits along z and x do **not** mean a beam is unpolarized.

## 11. Questions for the user

**Q1. Who owns the $S_x$ eigenvalue problem, L4 or L5?**
L4's notes solve it in full (pp. 17–19), and L5 pp. 6–7 teach it again for 12–15 minutes, which suggests the L4 lecture
may not have reached it in class. `concepts.ts` puts `eigen-problem` at L5. This plan follows the brief: L4 owns it,
L5 recaps it in one beat (`l5-inverse:b1`).
*Recommendation:* keep that split, and ask W to point `eigen-problem` at L4's unit (or rename L5's concept to "Using
eigenvectors as a basis"). If the class actually first met the method in L5, say so, and `l5-inverse:b1` becomes
three beats (determinant, back-substitution, normalization) while the L4 plan recaps instead.

**Q2. Keep the notes' $\Delta S_z = 0$ check?**
L5 p. 14 checks that $S_z$ stays certain in x coordinates by computing $\Delta S_z$, but variance is formally taught only in
L7 §7.7 (E2). The plan makes the same point with the transformed projector ($P(+z) = 1$, `l5-invariance:b2`).
*Recommendation:* leave $\Delta$ out of L5's core text; optionally add one "beyond this lecture" line linking forward to L7.

**Q3. May L5 use the Bloch stage before L6 introduces it?**
The three averages are exactly the Bloch-stage coordinates, and the notes' key example is complex, so the real plane cannot
show it. The plan uses `bloch` in `l5-averages` as a plot of averages, with the caption "Lecture 6 names this the Bloch
sphere" and the fidelity note `bloch-preview`. The cost: L6 loses the moment of first showing the sphere.
*Recommendation:* use it. The alternative is a text-only unit with no stage for its central example.

**Q4. Assigned homework as a multiple-choice item.**
`l5-inv-sy` (the $S_y$ eigenproblem, assigned on L5 p. 1) shows hints and withholds the walkthrough, as the schema does.
With four options, correctness feedback still lets a student find the answer by elimination, although $|{\pm y}\rangle$ is
already public from L2 and the notes' p. 13.
*Recommendation:* keep feedback on (the homework is the method, not the answer). Say if you want assigned items to hide
right/wrong as well.

**Q5. A $|{+y}\rangle$ beam on the Stern–Gerlach bench.**
`l5-averages:b8` shows a $|{+y}\rangle$ source feeding z and x magnets. The engine handles it, but no magnet on this bench can
prepare that beam, so the source would be a labelled box (fidelity `lab-y-source`).
*Recommendation:* accept the labelled box; it makes the clue ("equal splits on z and x, yet not unpolarized") land in the lab.

**Q6. Build the "basis sprint" game?**
`schema.ts` already reserves `GameSpec.kind: 'basis-sprint'` (translate columns and matrices against the clock), but the
Arcade does not implement it. It would suit L5 better than Bloch golf.
*Recommendation:* not now; L5 ships with the four Spot-the-error rounds and one golf level in §9. Revisit after L6.
