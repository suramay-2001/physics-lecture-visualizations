# P-448-townsend-G3: Townsend Chapter 5 for Lectures 9 and 10 (formalism, visuals, formulas, practice)

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, phases `lecture | books | clue | deeper`, conventions of
`448-L8L11.md` and `448-L12L13.md` carried (Rosetta lines for notation clashes; one teaching home per concept; ħ = 1 in the engine, the UI appends ħ).
**Source.** Townsend 2e Ch. 5 "A System of Two Spin-1/2 Particles", printed pp. 141–190 (printed = PDF − 16), read from the page images; all equations,
figures and problems are transcribed in the git-ignored digest `sources/townsend/digest-G3.md`. Everything below is paraphrase plus equation numbers and page cites.
**Evidence.** Every new number has a numpy route in the planner's script `plan-G3-numpy.py` (82 values, 70 of them claim keys; independent of the repo; 41 asserts all pass, 36 of them on Townsend's own
equations and examples). The orchestrator copies it next to the claim twins at build time. **Homework.** `homework-status.md`: HW1–HW6 submitted, practice may carry walkthroughs;
problem TYPES only are used ("H6-1b" = HW6 problem 1b's type); every practice prompt is new and uses fresh numbers.

## L9 Composite quantum systems (6 units, 39 beats today; Townsend cited nowhere yet)

### L9.1 Map
| unit | Townsend | already in the lecture / ownership |
|---|---|---|
| `l9-tensor` | §5.1 pp. 141–143 (Eqs. 5.1, 5.7, 5.8); §5.8 p. 181 (5.102–5.104) | Susskind §6.1 only. L9 owns the composite space and notation; this plan adds ONE notation beat. |
| `l9-classical` | §5.4 p. 152 (red and green balls) | the dealer's coins. Ref only (no beat): `books[]` gains `§5.4, p. 152` and the existing beat `l9-classical:b5` lists it in its `refs`: the balls story, which Townsend also says fails once the colours may be chosen. |
| `l9-two-spins` | §5.1 pp. 141–142 (5.1–5.4) | the four z-basis kets. New: the pair basis may mix axes (x for one spin, z for the other). |
| `l9-product` | §5.8 p. 181 (5.102–5.104) | the Rosetta of beat `l9-tensor:b5a` covers it (c_ij = ψ_ab); no new beat. |
| `l9-counting` | §5.6 p. 167 (5.63); §5.8 p. 183 | entanglement as "cannot be factored" is already the unit's point. Ref only. |
| `l9-singlet` | §5.3 pp. 147–152 (5.21–5.22, 5.30–5.31, 5.37–5.39); §5.8 p. 182 | the no-factor proof. New: the singlet's three symmetric partners, exchange symmetry, and the x basis. |
Ownership: L9 owns STATES of the pair (basis, product, singlet, triplet names, exchange). Operators on the pair (S = S₁ + S₂, S², σ·τ, density matrices) belong to L10 (its local-operator unit is
where operators first appear). Townsend's S² and hyperfine energies are therefore planned in L10, not here. Nothing from Townsend §5.4–5.7 is taught in L9.

### L9.2 Formalism: four new `books` beats (after each unit's existing books beat, before its clues), two derivations
Glosses: none new (Townsend's "direct product" is the existing `tensor-product`, named in a Rosetta). New refs in `L9.ts` `books[]` per unit as in the map.
- `l9-tensor:b5a` books, stage `{kind:'matrix', source:{table:{frame:'spins'}}, cells:'labels'}` (existing; a table source carries its own labels). Text: "Townsend builds the pair's basis ket $|{+z},{-z}\rangle$ as $|{+z}\rangle_1 \otimes |{-z}\rangle_2$ (§5.1, p. 142, Eq. 5.7).
  The sign $\otimes$ joins kets of different spaces, unlike an inner or outer product. He later drops it (p. 143, Eq. 5.8). His general pair is $\sum c_{ij}|a_i\rangle_1|b_j\rangle_2$ with a basis of its own for each particle (§5.8, p. 181, Eq. 5.102)."
  Rosetta line: his $|{\pm z},{\pm z}\rangle$ are our $|uu\rangle,|ud\rangle,|du\rangle,|dd\rangle$ (his $|1\rangle … |4\rangle$ in the same order, Eq. 5.8), his $c_{ij}$ is our $\psi_{ab}$. No new number.
- `l9-two-spins:b5a` books + **derivation D9.1** (Townsend §5.1 pp. 141–142, Eqs. 5.3–5.4). Text: "The z basis is not the only one. Townsend also lists $|{+x},{+z}\rangle, |{+x},{-z}\rangle, |{-x},{+z}\rangle, |{-x},{-z}\rangle$, with $x$ for the first spin and $z$ for the second (Eq. 5.3).
  Each is a product, so each is the first spin's $x$ state times the second's $z$ state." Result `|{+x},{+z}\rangle = \tfrac1{\sqrt2}(|uu\rangle + |du\rangle)`.
  Steps (ground, 4): `|{+x}\rangle = (|u\rangle+|d\rangle)/\sqrt2` · `|{+x},{+z}\rangle = |{+x}\rangle\otimes|u\rangle` · `= \tfrac1{\sqrt2}(|u\rangle+|d\rangle)\otimes|u\rangle` · `= \tfrac1{\sqrt2}|uu\rangle+\tfrac1{\sqrt2}|du\rangle` (Eq. 5.4).
  Views (matrix kind, already used by the unit): V1 `{coef:{pair:['+x','+z']}, labels:'ud', cells:'amplitudes', factors:true}` (a column times a row); V2 same source with `cells:'chances'` (two boxes of one half, the other two empty).
  Claims `l9TwXZamp`, `l9TwXZorth`.
- `l9-singlet:b5a` books (no derivation). Text: "Townsend calls the three symmetric states the triplet and the singlet the fourth (Eqs. 5.30–5.31, p. 149): $|1,1\rangle = |uu\rangle$, $|1,0\rangle = (|ud\rangle + |du\rangle)/\sqrt2$, $|1,-1\rangle = |dd\rangle$, $|0,0\rangle$ the singlet.
  Swap the two spins: each triplet state is unchanged, the singlet changes sign (summary, p. 182). In the box table a swap reflects the table across its diagonal." Rosetta: his $|s,m\rangle$ is not a bit string; $|1,0\rangle$ means total spin one, $m = 0$.
  Stage (existing): `{kind:'matrix', source:{coef:{bell:'01+10'}}, labels:'ud', cells:'amplitudes', highlight:[[0,1],[1,0]], readouts:['norm']}`; the two highlighted boxes share one hue (triplet), the singlet grid two opposite hues. Claims `l9TwSymDim`, `l9TwAntiDim`, `l9TwSwapTrip`, `l9TwSwapSingMag`.
- `l9-singlet:b5b` books + **derivation D9.2** (Townsend §5.3 p. 151, Eqs. 5.37–5.39; the H6-1d skill). Text: "Write each spin in the $x$ basis using $|u\rangle = (|{+x}\rangle + |{-x}\rangle)/\sqrt2$ and $|d\rangle = (|{+x}\rangle - |{-x}\rangle)/\sqrt2$ (Eq. 5.37).
  The triplet $|1,0\rangle$ becomes $(|{+x},{+x}\rangle - |{-x},{-x}\rangle)/\sqrt2$: the spins agree along $x$. The singlet becomes $-(|{+x},{-x}\rangle - |{-x},{+x}\rangle)/\sqrt2$: they still disagree. One sign decides which."
  Result `|\mathrm{sing}\rangle = -\tfrac1{\sqrt2}(|{+x},{-x}\rangle - |{-x},{+x}\rangle)`. Steps (ground, 5): Eq. 5.37 pair · `|ud\rangle = \tfrac12(|{+}{+}\rangle - |{+}{-}\rangle + |{-}{+}\rangle - |{-}{-}\rangle)` · `|du\rangle = \tfrac12(|{+}{+}\rangle + |{+}{-}\rangle - |{-}{+}\rangle - |{-}{-}\rangle)` ·
  `|ud\rangle - |du\rangle = -|{+}{-}\rangle + |{-}{+}\rangle` · divide by $\sqrt2$ (a Rosetta aside: ± inside kets means $\pm x$ here).
  Views: V1 (the beat's own stage) amplitudes with the new `inBasis:{local:'xx'}` (§L9.3) on `{bell:'01-10'}`; V2 `{coef:{bell:'01-10'}}` (the z-basis box table, a kind the unit already uses). Claims `l9TwXXsingPM`, `l9TwXXsingPP`, `l9TwXXtripPP`, `l9TwXXtripPM`, `l9TwXXtripAmpMag`.

### L9.3 Visualizations (2; both draw ENGINE amplitudes; neither copies a Townsend figure)
1. **Swap picture** (`l9-singlet:b5a`): existing `matrix` pair view, fields above. No code.
2. **The same pair read along x** (`l9-singlet:b5b`): `amplitudes` with a NEW field. Contract (smallest addition, additive, default absent so every 709 stage is byte-identical):
   `AmplitudesState.inBasis?: 'bell' | { local: string }` where `local` has one letter `x | y | z` per wire (2–3 wires; `z` leaves the wire alone). Bar k is the engine overlap of the state with the product ket of per-wire eigenstates
   (`|±x⟩ = (|0⟩ ± |1⟩)/√2`, `|±y⟩ = (|0⟩ ± i|1⟩)/√2`), labelled by one sign per wire with its axis letter (`x+ x−`); the chances still add to 1; refused with `dft`, `sum`, `keep`, mode `'signed'`, and `labels`. Readout "read along x, x".
   Passport/fidelity: reuse `amplitudes`' own; one new note `exact`. Print figure unchanged. L10 reuses it (§L10.3). Test: the four chances of |1,0⟩ (½, 0, 0, ½) and of the singlet (0, ½, ½, 0).

### L9.4 Formulas (append to each unit's `lecture.equations`, TeX)
- `l9-tensor`: `|{+z},{-z}\rangle = |{+z}\rangle_1\otimes|{-z}\rangle_2` (Eq. 5.7) · `|\psi\rangle = \sum_{i,j} c_{ij}\,|a_i\rangle_1|b_j\rangle_2` (Eq. 5.102).
- `l9-two-spins`: `|{+x},{+z}\rangle = \tfrac1{\sqrt2}\big(|uu\rangle + |du\rangle\big)` (Eq. 5.4).
- `l9-singlet`: `|1,0\rangle = \tfrac1{\sqrt2}(|ud\rangle+|du\rangle),\quad |0,0\rangle = \tfrac1{\sqrt2}(|ud\rangle-|du\rangle)` (Eqs. 5.30b, 5.31) · `|1,0\rangle = \tfrac1{\sqrt2}\big(|{+x},{+x}\rangle - |{-x},{-x}\rangle\big)` (5.38) ·
  `|0,0\rangle = -\tfrac1{\sqrt2}\big(|{+x},{-x}\rangle - |{-x},{+x}\rangle\big)` (5.39) · `\langle\mathrm{SWAP}\rangle = +1\ (\text{triplet}),\ -1\ (\text{singlet})` (p. 182) · entangled means `|\Psi\rangle \ne |a\rangle_1\otimes|b\rangle_2` (p. 183).

### L9.5 Practice questions (5; new field `practice`, §S; each with a full walkthrough because HW6 is submitted)
| id | tier, kind, mirrors | prompt (fresh numbers) and answer |
|---|---|---|
| `l9-pq-expand` | warm-up, numeric (tol .005); H6-1a type | Alice's spin is prepared along $+x$, Bob's at polar angle $60^\circ$ from $z$ ($\cos30^\circ\|u\rangle + \sin30^\circ\|d\rangle$). Chance of "Alice down, Bob up"? **0.375**, key `l9PrQ1`, numpy `\|kron(a,b)[du]\|²`. |
| `l9-pq-swap` | warm-up, choice; H6-1b type | Which pair state changes sign when the spins are swapped? Options $(\|ud\rangle \mp \|du\rangle)/\sqrt2$, $(\|uu\rangle \pm \|dd\rangle)/\sqrt2$; correct: the singlet; numpy `⟨ψ\|SWAP\|ψ⟩` = −1 (`l9TwSwapSingMag`). Each `why` names the swap value. |
| `l9-pq-product-c` | core, numeric (integer, tol 0); H6-1b type | $(\|uu\rangle + 2\|ud\rangle + 3\|du\rangle + c\|dd\rangle)/N$ is a product state. Find $c$. **6**, key `l9PrQ2`, numpy `matrix_rank([[1,2],[3,c]]) == 1` over integers c (unique). |
| `l9-pq-x-basis` | core, numeric (tol .005); H6-2a / H6-1d type | Pair state $(\|ud\rangle + 2\|du\rangle)/\sqrt5$, both spins measured along $x$. Chance of $(+x,+x)$? **0.45**, key `l9PrQ3` (the walkthrough also prints `l9PrQ3b` = 0.05 for $(+x,-x)$), numpy `\|⟨+x+x\|ψ⟩\|²`. |
| `l9-pq-phase-x` | stretch, numeric (tol .005); H6-5c type | Pair $(\|uu\rangle + e^{i\varphi}\|dd\rangle)/\sqrt2$, $\varphi = 70^\circ$. Chance of $(+x,+x)$? Is the phase visible when both spins are measured along $z$? **0.3355**, keys `l9PrQ4`, `l9PrQ4z` (ZZ = 1), numpy `\|⟨+x+x\|ψ⟩\|² = (1+cos φ)/4`. |
Hints (three each, nudge / key idea / setup), walkthrough outlines:
- `l9-pq-expand`: ① "The pair is a product: multiply each of Alice's two amplitudes by each of Bob's." ② "Alice's are $1/\sqrt2, 1/\sqrt2$; Bob's are $\cos30^\circ, \sin30^\circ$." ③ "Down for Alice, up for Bob: amplitude $\tfrac1{\sqrt2}\cos30^\circ$; square it." Walk: four amplitudes, four chances ($3/8, 1/8, 3/8, 1/8$, sum 1), read the $du$ box.
- `l9-pq-swap`: ① "Swapping the letters in a ket changes $|ud\rangle$ into $|du\rangle$." ② "A state is unchanged by a swap if its two terms enter with the same sign." ③ "Check $|uu\rangle \pm |dd\rangle$ first: both are unchanged." Walk: swap each option; only $|ud\rangle - |du\rangle$ flips (the singlet).
- `l9-pq-product-c`: ① "A product has $\psi_{ab} = \alpha_a\beta_b$." ② "Top row $\psi_{uu}:\psi_{ud}$ and bottom row $\psi_{du}:\psi_{dd}$ must have the same ratio." ③ "Top ratio $1:2$, bottom $3:c$." Walk: ratio test, $c = 6$, factor as $(|u\rangle + 3|d\rangle)\otimes(|u\rangle + 2|d\rangle)$, why the singlet fails the same test.
- `l9-pq-x-basis`: ① "Write the $x$ kets with $|u\rangle, |d\rangle$." ② "$\langle{+x},{+x}|$ is $\tfrac12$ times the sum of the four z-basis bras." ③ "Here the sum is $3/\sqrt5$; square $\tfrac12\cdot 3/\sqrt5$." Walk: bra expansion, all four chances ($0.45, 0.05, 0.05, 0.45$), total check.
- `l9-pq-phase-x`: ① "Use the same four-bra expansion." ② "Only $uu$ and $dd$ are in the state." ③ "$|1 + e^{i\varphi}|^2 = 2 + 2\cos\varphi$." Walk: $(1+\cos\varphi)/4$; the z chances are $\tfrac12, 0, 0, \tfrac12$ for every $\varphi$, so the phase hides in z and shows in x.

### L9.6 Claims (every new number: key, value, independent route in `plan-G3-numpy.py`; twin file `pipeline/make_claim_fixtures.py` block "L9 Townsend")
| key | value | route |
|---|---|---|
| `l9TwXZamp` | 0.7071 | `\|kron(+x,u)·uu\|`; Eq. 5.4 asserted as a vector identity |
| `l9TwXZorth` | 0 | max overlap among the four x⊗z kets (`itertools.combinations`) |
| `l9TwXXtripPP`, `l9TwXXtripPM` | 0.5, 0 | `\|⟨+x+x\|1,0⟩\|²`, `\|⟨+x−x\|1,0⟩\|²`; Eq. 5.38 asserted |
| `l9TwXXsingPM`, `l9TwXXsingPP` | 0.5, 0 | same overlaps on the singlet; Eq. 5.39 asserted |
| `l9TwXXtripAmpMag` | 0.7071 | `\|⟨−x−x\|1,0⟩\|` (its sign is −1: the number reader sees only magnitudes) |
| `l9TwSymDim`, `l9TwAntiDim` | 3, 1 | eigenvalues of the 4×4 SWAP matrix |
| `l9TwSwapTrip`, `l9TwSwapSingMag` | 1, 1 | `⟨ψ\|SWAP\|ψ⟩` = +1 for the triplet state (1,0), −1 for the singlet (shown as "sign flips") |
| `l9PrQ1` … `l9PrQ4`, `l9PrQ3b`, `l9PrQ4z` | 0.375, 6, 0.45, 0.3355, 0.05, 1 | see §L9.5; `l9PrQ4 = (1+cos70°)/4` also asserted in closed form |

## L10 Entanglement and the GHZ argument (8 units, 56 beats today; Townsend cited once: `l10-empty-centre:b7`, §5.7 pp. 179–180)

### L10.1 Map
| unit | Townsend | already in the lecture / ownership |
|---|---|---|
| `l10-local` | §5.1 p. 142 (5.5–5.6); §5.3 pp. 147–148 (5.23–5.25) | X_A = X⊗I, [A_A, B_B] = 0. L10 owns operators on the pair; adds total spin S = S₁ + S₂ (one beat). |
| `l10-empty-centre` | §5.7 pp. 171–181 (5.70–5.101, Ex. 5.4–5.5) | reduced Bloch ball, ρ_A, purity ½, books b7 (Townsend §5.7 pp. 179–180). L6 owns ρ and recipes (link back, no re-teaching). New: the 4×4 ρ of the pair against a mixture. |
| `l10-correlations` | §5.2 pp. 143–147 (5.9–5.20); §5.3 pp. 147–149 (5.21–5.22, 5.26–5.31); Problems 5.8–5.9 | Z_AZ_B = −1, X_AX_B = −1, Susskind's σ·τ with eigenvalue −3 (b5). New: the whole 4×4 and its energies. |
| `l10-instructions` | §5.5 pp. 156–162 (5.40–5.60) | tables for X, Y, Z (orthogonal axes); ends "we need a sharper test". New: Townsend's counting test with three axes and Bell's inequality. |
| `l10-ghz-game`, `-no-table`, `-quantum-wins` | none (GHZ is not in Townsend) | untouched (Susskind/notes only). |
| `l10-what-ghz-proves` | §5.4 pp. 152–156 (EPR, Ex. 5.1); §5.5 pp. 162–165 (experiments); §5.6 pp. 165–171 (teleportation, no-cloning) | no signalling (b5), Susskind b7. New: Townsend's tilted-analyser calculation and teleportation as a link-out. |
Cross-course: teleportation is owned by 709 Q11 and no-cloning by Q13; L10 links out only (bridge ids in §S).

### L10.2 Formalism: eight new `books` beats, four derivations (all after the unit's existing books beat; in `l10-instructions` after b4, which has none)
Glosses new: `total-spin` (the operator sum S = S₁ + S₂ and its quantum number s), `hyperfine` (the weak spin–spin coupling of electron and proton in hydrogen). Rosetta used throughout: Townsend's $\hat S_{1x} = \tfrac\hbar2 X_A$ (ħ = 1 here), $2\hat{\mathbf S}_1\cdot\hat{\mathbf S}_2/\hbar^2 = \tfrac12(XX+YY+ZZ) = \tfrac12\vec\sigma\cdot\vec\tau$; his $|\Psi^{(-)}_{12}\rangle$ is the singlet; his $\hat\rho^{(1)}$ is our $\rho_A$.
- `l10-local:b5a` books + **D10.1** (§5.3 pp. 147–148, Eqs. 5.6, 5.24–5.25). Text: "Townsend turns a pair by turning each spin the same amount, so the generator is the sum $\hat{\mathbf S} = \hat{\mathbf S}_1\otimes 1 + 1\otimes\hat{\mathbf S}_2$ (Eq. 5.24).
  The two spins' generators commute (Eq. 5.6), so the sum obeys the same commutators as one spin (Eq. 5.25)." Result `[S_x, S_y] = i S_z` (ħ = 1). Steps (ground 4): `S_x = \tfrac12(X_A + X_B),\ S_y = \tfrac12(Y_A+Y_B)` · `[S_x,S_y] = \tfrac14\big([X_A,Y_A] + [X_B,Y_B]\big)` (cross terms commute, Eq. 5.6) · `[X_A,Y_A] = 2iZ_A` · `= \tfrac i2(Z_A+Z_B) = iS_z`.
  Views: V1 `matrix` tableau `tab(['XI','YI'], {product:true})` (X·Y = iZ, the phase shown); V2 `matrix` grid `{lin:[{c:'+1/2',src:{pauli:'ZI'}},{c:'+1/2',src:{pauli:'IZ'}}], spectrum:'bars', values:'exact'}` (S_z total: bars 1, 0, 0, −1). Claims `l10TwCommRes`, `l10TwSzMax`, `l10TwSzZeros`.
- `l10-empty-centre:b7a` books + **D10.2** (§5.7 pp. 171–174, 179–180, Eqs. 5.70, 5.75, 5.85, 5.90, 5.94–5.97). Text: "Townsend writes the pair's state as a matrix, $\hat\rho = |\psi\rangle\langle\psi|$ (Eq. 5.70). For the singlet it has four nonzero entries, two of them off the diagonal (Eq. 5.94).
  A fifty-fifty mixture of $|ud\rangle$ and $|du\rangle$ has the same diagonal but no off-diagonal entries (Eq. 5.96). Those entries tell an entangled pair from a mixture. Trace out one spin and both give $\tfrac12 I$ (Eq. 5.97)."
  Result `\rho^{(1)} = \tfrac12\big(|u\rangle\langle u| + |d\rangle\langle d|\big)`. Steps (ground 3): `\rho = |\mathrm{sing}\rangle\langle\mathrm{sing}|` · `\rho^{(1)} = \sum_j \langle j|_B\,\rho\,|j\rangle_B` (Eq. 5.90) · `= \tfrac12|u\rangle\langle u| + \tfrac12|d\rangle\langle d|`.
  Views: V1 `{kind:'matrix', source:{rho:{ket:{bell:'01-10'}}}, partialTrace:'B', spectrum:'bars'}`, then the same with `{rho:{mixture:[{w:½,ket:{ket:'01'}},{w:½,ket:{ket:'10'}}]}}` (weights computed in code); V2 `tq(SING_TQ, {grid:'none', readouts:['purity','rLength']})` (the existing helper). Claims `l10TwPurPair`, `l10TwPurMix`, `l10TwCohPure`, `l10TwCohMix`, `l10TwXXmix`, `l10TwXXpureMag`, `l10TwRedGap`; reuses `l10RhoAPurity`.
- `l10-correlations:b5a` books + **D10.3** (§5.2 pp. 143–147, Eqs. 5.9–5.20; §5.3 Eqs. 5.21–5.22). Text: "In hydrogen the electron's and proton's spins couple with $\hat H = (2A/\hbar^2)\,\hat{\mathbf S}_1\cdot\hat{\mathbf S}_2$ (Eq. 5.9, $A > 0$). In the pair basis it is a four-by-four matrix (Eq. 5.14).
  Three states share the energy $A/2$, the triplet; the singlet has $-3A/2$ (Eqs. 5.16–5.20). The gap $2A$ is the 21 cm line. In our letters this is $\tfrac A2(XX+YY+ZZ)$: Susskind's $\vec\sigma\cdot\vec\tau$ has $+1$ on the triplet and $-3$ on the singlet."
  Result `E_{\text{triplet}} = +\tfrac A2,\quad E_{\text{singlet}} = -\tfrac{3A}2`. Steps (ground 4): `H = \tfrac A2(XX+YY+ZZ)` · `XX|ud\rangle = YY|ud\rangle = |du\rangle,\ ZZ|ud\rangle = -|ud\rangle` · the matrix `\tfrac A2\begin{pmatrix}1&&&\\&-1&2&\\&2&-1&\\&&&1\end{pmatrix}` (Eq. 5.14) · diagonal in the total-spin basis: `\mathrm{diag}(\tfrac A2,\tfrac A2,\tfrac A2,-\tfrac{3A}2)`.
  Views (A = 1, energies in units of A): V1 `{kind:'matrix', source:{lin:[{c:'+1/2',src:{pauli:'XX'}},{c:'+1/2',src:{pauli:'YY'}},{c:'+1/2',src:{pauli:'ZZ'}}]}, values:'exact', spectrum:'bars'}`; V2 the same source with `basis:[{ket:'00'},{bell:'01+10'},{ket:'11'},{bell:'01-10'}]` (diagonal).
  Claims `l10TwH11`, `l10TwH22Mag`, `l10TwH23`, `l10TwEUp`, `l10TwEDownMag`, `l10TwEUpDeg`, `l10TwGap`, `l10TwSigTauTrip`, `l10TwSigTauSingMag` (agrees with existing `l10DotST` = −3), `l10TwS2Trip`, `l10TwS2Sing`, `l10TwSdotTrip`, `l10TwSdotSingMag`. A second statement (no derivation): $\hat{\mathbf S}^2 = 2\hbar^2$ on the triplet, $0$ on the singlet (Eqs. 5.26a, 5.27a, p. 149), so the singlet has no total spin.
- `l10-instructions:b4a` books. Text: "Townsend's simplest instruction model gives each particle a type such as $\{{+z},{+x}\}$: the answer to a $z$ or an $x$ reading, never both at once (Eq. 5.40, p. 157). The partner has every sign reversed.
  Four equal groups reproduce the $z$–$z$ and $x$–$x$ anticorrelation and the independence of a $z$ and an $x$ reading." Stage `tab(['ZZ','XX'], {values:{ZZ:-1,XX:-1}, state:{bell:'01-10'}})` (existing). No new number.
- `l10-instructions:b4b` books + **D10.4** (§5.5 pp. 157–160, Eqs. 5.41–5.49; Figs. 5.5–5.6). Text: "Now let each player pick one of three flat axes $120^\circ$ apart. A type becomes three signs, giving eight kinds of pair (Eq. 5.41, p. 158). Two kinds always give opposite signs when the axes differ; the other six do so in a third of the pairings.
  So any mixture of tables gives opposite signs at least a third of the time. The singlet gives $\cos^2 60^\circ = \tfrac14$ (Eqs. 5.48–5.49, p. 160)." Result `P_{\text{opposite}}^{\text{tables}} \ge \tfrac13 > \tfrac14 = P_{\text{opposite}}^{\text{quantum}}`.
  Steps (ground 5): the eight tables (`\pm\pm\pm`, partner negated) · `\text{table }+++\ \text{and}\ ---:\ 1` · `\text{the other six}:\ \tfrac13` (two of six ordered axis pairs) · `\tfrac13\cdot\tfrac34 + \tfrac14 = \tfrac12` for equal groups, never below `\tfrac13`; then `\cos^2(120^\circ/2) = \tfrac14`.
  Views: V1 `{kind:'plot', points:[8 points x = 1…8, y = V.l10TwTableSame for tables 1 and 8, V.l10TwTableMixed for 2–7], yLines:[{y:1/3,label:'tables'},{y:1/4,label:'singlet'}], xLabel:'kind of pair', yLabel:'chance results differ'}` (existing points mode, y from `V`); V2 the unit's `tab(['ZZ','XX'])` view; V1 is the beat's own stage. Claims `l10TwTablesCount`, `l10TwTableSame`, `l10TwTableMixed`, `l10TwTablesMixedCount`, `l10TwDeckFloor`, `l10TwDeckUniform`, `l10TwQuant120`, `l10TwBelow`.
- `l10-instructions:b4c` books (no derivation). Text: "From the same eight kinds Townsend gets Bell's inequality: $P({+a};{+b}) \le P({+a};{+c}) + P({+c};{+b})$ (Eq. 5.54, p. 161).
  The singlet gives $P({+a};{+b}) = \tfrac12\sin^2(\theta_{ab}/2)$ (Eq. 5.57). Put $c$ halfway between $a$ and $b$ at $\Theta$ each: the rule demands $\sin^2\Theta \le 2\sin^2(\Theta/2)$ (Eq. 5.59). At $60^\circ$ that reads $\tfrac34 \le \tfrac12$, false (Eq. 5.60, p. 162).
  Our calculation finds the rule fails for every $\Theta$ below $90^\circ$ and fails worst at $60^\circ$." Visual V10-B below. Claims `l10TwBellLeft`, `l10TwBellRight`, `l10TwBell60Left`, `l10TwBell60Right`, `l10TwBellGapMaxAt`, `l10TwBellGapMax`, `l10TwBellCross`. Experiments (Aspect's photon test, p. 164) in words only, no digits (open question 1).
- `l10-what-ghz-proves:b7a` books. Text: "Townsend tilts Alice's analyser by $\theta$ in the $x$–$z$ plane while Bob keeps $z$ (Example 5.1, pp. 155–156, Fig. 5.4). The four amplitudes give Bob $+\tfrac\hbar2$ with chance $\tfrac12\sin^2\tfrac\theta2 + \tfrac12\cos^2\tfrac\theta2 = \tfrac12$ for every $\theta$.
  Alice's choice leaves Bob's own data unchanged. Given Alice's $+n$, Bob's chance of $+z$ is $\sin^2\tfrac\theta2$." Stage existing: `tq(SING_TQ, {grid:'none', axes:{a:[{thetaDeg:60, phiDeg:0}], b:['+z']}})`. Claims `l10TwEprMargDev`, `l10TwEprCond60`, `l10TwEprJoint60`.
- `l10-what-ghz-proves:b7b` books. Text: "Townsend uses a singlet as a resource: Alice holds spin 1 in $a|{+z}\rangle + b|{-z}\rangle$ and shares a singlet of spins 2 and 3 with Bob (§5.6, pp. 166–168, Eqs. 5.62–5.66). Her joint measurement of spins 1 and 2 has four outcomes, each with chance $\tfrac14$ (Eq. 5.69).
  Each leaves Bob's spin in $|\psi\rangle$ up to a known turn (Example 5.3, pp. 170–171). Without her message Bob holds the unpolarized state, so no signal passed (Eq. 5.101, p. 181)." Notation: "Townsend's $|\Psi^{(-)}\rangle$ is the singlet." Links `<<sl-q11-teleport-circuit|Go further in 709: teleportation>>` and `<<sl-q13-no-cloning|Go further in 709: no cloning>>` (the second exists). Stage `amp({circuit: Q11's teleportation prefix (physics/qc/teleport.ts), upTo: end}, {mode:'probability', keep:[0,1]})` (existing). Claims `l10TwTeleP`, `l10TwTeleFid`, `l10TwTeleMixDev`, `l10TwTeleRawAvg`.

### L10.3 Visualizations (2 new, plus existing kinds reused)
- **V10-A, the pair's energy matrix** (`l10-correlations:b5a`, D10.3): existing `matrix` grid, fields in the beat; Townsend's Fig. 5.1 (levels E₁ + A/2, E₁, E₁ − 3A/2) is drawn by `spectrum:'bars'` (bars +½ ×3 and −3/2 from the engine's `eigh`). No code.
- **V10-B, the Bell margin** (`l10-instructions:b4c`): `plot` with ONE new curve name. Contract: `PlotCurveName` gains `'bellBisectGap'`: for Θ in [0°, 180°] the engine value `P(+a;+b) − P(+a;+c) − P(+c;+b)` of the singlet with c halfway (≥ 0 means the inequality fails). Fields: `{kind:'plot', curve:{fn:'bellBisectGap', x:{from:0,to:180}}, markers:[{x:60,label:'worst'},{x:90,label:'no violation'}], yLines:[{y:0,label:'inequality holds below'}]}`. Max 1/8 at 60°, zero at 90° (claims above). Fidelity note `exact`. Replaces Townsend's Fig. 5.8 chord proof (not copied).
- Also reused: V1/V2 of D10.1–D10.4 (existing kinds); the x-basis amplitudes of §L9.3 serve L10's practice and a `deeper` option: `{kind:'amplitudes', state:onG(...), inBasis:{local:'zxx'}}` for the GHZ game rows (≤ 3 wires), not planned as a beat.

### L10.4 Formulas (append to `lecture.equations`)
- `l10-local`: `\hat{\mathbf S} = \hat{\mathbf S}_1\otimes 1 + 1\otimes\hat{\mathbf S}_2` (5.24) · `[\hat{\mathbf S}_1,\hat{\mathbf S}_2] = 0` (5.6) · `[S_x,S_y] = iS_z\ (\hbar=1)` (5.25).
- `l10-empty-centre`: `\hat\rho = |\psi\rangle\langle\psi|,\quad \operatorname{tr}\hat\rho^2 = 1` (5.70, 5.75) · `\hat\rho = \sum_k p_k|\psi^{(k)}\rangle\langle\psi^{(k)}|,\quad \operatorname{tr}\hat\rho^2 = \sum_k p_k^2 \le 1` (5.81, 5.85) · `\langle A\rangle = \operatorname{tr}(A\hat\rho)` (5.78, 5.86) · `\hat\rho^{(1)} = \sum_j \langle j|_B\,\hat\rho\,|j\rangle_B` (5.90) · `\hat\rho_{\text{sing}} = \tfrac12\begin{pmatrix}0&0&0&0\\0&1&-1&0\\0&-1&1&0\\0&0&0&0\end{pmatrix}` (5.94).
- `l10-correlations`: `\hat H = \tfrac{2A}{\hbar^2}\hat{\mathbf S}_1\!\cdot\!\hat{\mathbf S}_2 = \tfrac A2(XX+YY+ZZ)` (5.9) · `E_{\text{triplet}} = \tfrac A2,\ E_{\text{singlet}} = -\tfrac{3A}2,\ \Delta E = 2A` (5.16–5.20) · `\hat{\mathbf S}^2|s,m\rangle = s(s+1)\hbar^2|s,m\rangle,\ s = 1,0` (5.27a, 5.30–5.31) · `E(a,b) = -\cos\theta_{ab}` (Problem 5.8, p. 184) · `\langle S_{1a}S_{2b}\rangle = -\tfrac{\hbar^2}4\cos\theta_{ab}` (Problem 5.9).
- `l10-instructions`: `P_{\text{opposite}}(\theta) = \cos^2\tfrac\theta2` (5.48) · `P({+a};{+b}) \le P({+a};{+c}) + P({+c};{+b})` (5.54) · `P({+a};{+b}) = \tfrac12\sin^2\tfrac{\theta_{ab}}2` (5.57) · `\sin^2\Theta \le 2\sin^2\tfrac\Theta2\ \text{(fails for } 0<\Theta<90^\circ)` (5.59).
- `l10-what-ghz-proves`: `P(B=+z) = \tfrac12\sin^2\tfrac\theta2+\tfrac12\cos^2\tfrac\theta2 = \tfrac12` (Ex. 5.1) · `|\psi_{123}\rangle = \tfrac12\sum_{\text{4 Bell outcomes}}|B_k\rangle_{12}\,|\phi_k\rangle_3` (5.69) · `\hat\rho^{(3)} = \tfrac12 I` (5.101).

### L10.5 Practice questions (5; `practice` tag; full walkthroughs)
| id | tier, kind, mirrors | prompt (fresh numbers) and answer |
|---|---|---|
| `l10-pq-alice-z` | warm-up, numeric (tol .005); H6-1c / H6-1e type | A pair is in $\cos30^\circ\|ud\rangle - \sin30^\circ\|du\rangle$. Alice measures $Z$: chance of up? **0.75**, `l10PrQ1`, numpy `\|⟨u·\|ψ⟩\|²` summed over Bob. Walk: Born rule on one factor; Bob's conditional $d$ is certain. |
| `l10-pq-x-conditional` | core, numeric (tol .005); H6-1d type | Same state; Alice measures $X$ and gets $+x$. Chance that Bob then gets $+x$? **0.0670**, `l10PrQ2`, numpy: project Alice, renormalise Bob, overlap, closed form $(\cos t-\sin t)^2/2$. |
| `l10-pq-stray-ghz` | stretch, numeric (tol .005); H6-2b / H6-2c type | The GHZ team's state is turned for Alice only by $40^\circ$ about $z$ before the game. Chance the team still wins on input $XZX$? **0.8830**, `l10PrQ3` (the row $ZXX$ still wins every time: `l10PrQ3rows` = 1), numpy: `Rz(40°)⊗I⊗I` on $\|G\rangle$, projector on product −1 $= \cos^2 20^\circ$. |
| `l10-pq-biased-referee` | core, numeric (tol .005); H6-3c type | The referee draws $ZZZ$ with chance ½ and each other input with chance ⅙. Best chance any classical plan wins? **0.8333**, `l10PrQ4`; mixing plans gives no more (`l10PrQ4mix` = 0.5 for the uniform mixture); numpy: all 64 deterministic plans. |
| `l10-pq-phase-corr` | core, numeric (tol .005); H6-5b / H6-5d type | The pair $(\|uu\rangle + e^{i\varphi}\|dd\rangle)/\sqrt2$ has $\varphi = 50^\circ$. Find $\langle X_AX_B\rangle$. **0.6428**, `l10PrQ5` (`l10PrQ5z`: $\langle Z_AZ_B\rangle$ = 1), numpy `ψ†(X⊗X)ψ = cos φ`. |
Hints and walkthrough outlines:
- `l10-pq-alice-z`: ① "Alice's up outcome means the pair's $|u\cdot\rangle$ part." ② "Add the chances of $|ud\rangle$ and $|uu\rangle$ (here zero)." ③ "The chance of $|ud\rangle$ is $\cos^2 30^\circ$." Walk as above.
- `l10-pq-x-conditional`: ① "Write Alice's $|{+x}\rangle$ as a sum and keep what she leaves for Bob." ② "Bob is left with $\cos t\,|d\rangle - \sin t\,|u\rangle$ (normalised already)." ③ "Overlap with $|{+x}\rangle = (|u\rangle + |d\rangle)/\sqrt2$, then square." Walk: chance of Alice's $+x$ is ½ whatever $t$; then $(\cos t - \sin t)^2/2$.
- `l10-pq-stray-ghz`: ① "Turning Alice about $z$ rotates her $X$ into a mix of $X$ and $Y$." ② "The game state's $XZX$ average becomes $-\cos\varphi$." ③ "Win chance is $(1 - \langle XZX\rangle)/2$ because the needed product is $-1$." Walk: $\cos^2(\varphi/2)$; the row $ZXX$ uses Alice's $Z$, which a $z$ turn does not change.
- `l10-pq-biased-referee`: ① "A plan must lose at least one input (the lecture's four-needs argument)." ② "Which input is cheapest to lose?" ③ "A shared random choice among plans is an average of plans, so it cannot beat the best one." Walk: lose a $\tfrac16$ input: $1 - \tfrac16$; the quantum plan wins 1.
- `l10-pq-phase-corr`: ① "Write $X\otimes X$ as flipping both letters." ② "Only $|uu\rangle \leftrightarrow |dd\rangle$ survive: the cross terms are $e^{\pm i\varphi}/2$." ③ "$\tfrac12(e^{i\varphi} + e^{-i\varphi}) = \cos\varphi$." Walk: $\langle ZZ\rangle = 1$ for every $\varphi$; phase shows only in $X$ (and $Y$: $-\cos\varphi$).

### L10.6 Claims (key, value, numpy route; twin block "L10 Townsend")
| key(s) | value | route |
|---|---|---|
| `l10TwCommRes`, `l10TwSzMax`, `l10TwSzZeros` | 0, 1, 2 | `‖[Sx,Sy] − iSz‖` for S = Σ(σ/2 ⊗ I + I ⊗ σ/2); eigvalsh of S_z |
| `l10TwS2Trip`, `l10TwS2Sing`, `l10TwSdotTrip`, `l10TwSdotSingMag` | 2, 0, ½, 3/2 | eigvalsh(S²); ⟨2S₁·S₂⟩ on the triplet and singlet (Eqs. 5.21–5.22 asserted) |
| `l10TwH11`, `l10TwH22Mag`, `l10TwH23` | ½, ½, 1 | entries of A/2(XX+YY+ZZ), A = 1 (5.12–5.14 asserted as a matrix identity) |
| `l10TwEUp`, `l10TwEDownMag`, `l10TwEUpDeg`, `l10TwGap` | ½, 3/2, 3, 2 | eigvalsh of that matrix (5.16–5.20 asserted) |
| `l10TwSigTauTrip`, `l10TwSigTauSingMag` | 1, 3 | eigvalsh(XX+YY+ZZ) |
| `l10TwPurPair`, `l10TwPurMix`, `l10TwCohPure`, `l10TwCohMix` | 1, ½, ½, 0 | tr ρ² and the size of entry ρ₂₃ of the 4×4 matrices (5.94, 5.96 asserted) |
| `l10TwXXmix`, `l10TwXXpureMag`, `l10TwRedGap` | 0, 1, 0 | tr(ρ X⊗X); ‖Tr_B ρ − I/2‖ (5.97 asserted) |
| `l10TwEprMargDev`, `l10TwEprCond60`, `l10TwEprJoint60` | 0, ¼, ⅛ | worst deviation of P(B=+z) from ½ over θ = 0…180° step 15°; amplitudes of Example 5.1 at 60° |
| `l10TwTablesCount`, `l10TwTablesMixedCount`, `l10TwTableSame`, `l10TwTableMixed`, `l10TwDeckFloor`, `l10TwDeckUniform` | 8, 6, 1, ⅓, ⅓, ½ | `itertools.product` over eight tables, ordered axis pairs with unequal signs |
| `l10TwQuant120`, `l10TwBelow` | ¼, 1/12 | amplitudes for A along a, B at 120° in the plane; ⅓ − ¼ |
| `l10TwBellLeft`, `l10TwBellRight`, `l10TwBell60Left`, `l10TwBell60Right` | 3/8, ¼, ¾, ½ | `\|⟨+a+b\|sing⟩\|²` etc. at Θ = 60° (5.57; printed 5.60 fractions are twice these) |
| `l10TwBellGapMaxAt`, `l10TwBellGapMax`, `l10TwBellCross` | 60°, ⅛, 90° | grid argmax; bisection on the gap |
| `l10TwTeleP`, `l10TwTeleFid`, `l10TwTeleMixDev`, `l10TwTeleRawAvg` | ¼, 1, 0, ½ | (5.69) rebuilt from its four terms and asserted; rotations of Example 5.3; ρ³ = ¼ΣΨ_kΨ_k† |
| `l10PrQ1` … `l10PrQ5`, `l10PrQ3rows`, `l10PrQ4mix`, `l10PrQ5z` | 0.75, 0.0670, 0.8830, 0.8333, 0.6428, 1, 0.5, 1 | see §L10.5 (closed forms asserted) |

## S. Shared: errata, engine and stage gaps, schema addition, bridges
**Errata** (checked on the page image and with numpy). One slip, no Correction box: Example 5.1 (p. 156) prints the third amplitude as $-\tfrac1{\sqrt2}\cos\tfrac\theta2$; with the page's own $|{-n}\rangle$ it is $+\tfrac1{\sqrt2}\cos\tfrac\theta2$ (numpy at 60°: +0.6124).
Every probability and the result ½ are right, so there is no physics to correct (ruling R8 of `448-L12L13.md`: slips without physics get no box). Everything else checked matches (digest, "Errata and checks"). The violation margin peaking at 60° is OUR finding, stated as ours.
**Engine gaps** (each with a numpy twin; none edits existing functions):
1. `physics/qc/measure.ts localBasisAmplitudes(psi, bases: ('x'|'y'|'z')[]): C[]` (needs `localBasisProbs`' basis kets). Twin: `kron_k(Bᵏ) @ psi` with Bˣ = H, Bʸ = [[1,−i],[1,i]]/√2, Bᶻ = I.
2. `physics/qc/entangle.ts singletJoint(thetaA, thetaB): number` = `|⟨+a,+b|sing⟩|²` (via `correlator` + local means, `(1 + E)/4`) and `bellBisectGap(Θ)`. Twin: amplitude method as in the script.
3. `physics/qc/bits.ts threeAxisTables(): {signs, differFraction}[]` and `differChance(angleDeg)` for the eight tables and the singlet. Twin: `itertools.product`.
4. The matrix sources, `eigh`, `reducedDensity`, `teleport.ts`, `ghz.ts` and `ghzAnswerProbs` already exist; claims use them.
**Stage/schema additions (3, all additive):** (a) `amplitudes.inBasis: { local }` (§L9.3); (b) `PlotCurveName 'bellBisectGap'` (§L10.3); (c) `Challenge.practice?: true`, a tag "Homework-style practice" on the challenge card; lint: needs a non-empty `walkthrough`, excludes `assigned`, 3–5 per lecture.
It carries no homework id (the type mapping stays in this plan and the judge's notes, never in `app/`).
**Symbol lint:** `L10.symbols` / `L9.symbols` gain what the test lists (expected: $\hat{\mathbf S}$ → `l10-local:b5a`, $A$ → `l10-correlations:b5a`, $\Theta$ and $P({+a};{+b})$ → `l10-instructions:b4c`, $E(a,b)$ → `l10-correlations` formula only; $c_{ij}$ → `l9-tensor:b5a`); the two new glosses carry no `introduces`.
**Bridges:** new row `sl-q11-teleport-circuit` in `bridges448.ts` (→ Q11 unit `q11-teleport-circuit`); `sl-q13-no-cloning` exists. Gloss rows: `total-spin`, `hyperfine` (L10 `first`: `l10-local:b5a`, `l10-correlations:b5a`).

## Totals
| | new beats | derivations | new visuals | formulas | practice | claims (new keys) |
|---|---|---|---|---|---|---|
| L9 | 4 books | 2 (D9.1, D9.2) | 2 (swap picture, x-basis amplitudes) | 8 | 5 | 17 |
| L10 | 8 books | 4 (D10.1–D10.4) | 2 (energy matrix, Bell margin) | 20 | 5 | 53 |
Engine: 3 small functions; stage: 2 additive fields; schema: 1 field; bridges: 1 row; glosses: 2.

## Open questions for the judge (recommended answers)
1. **Reported numbers** (S = 2.697 ± 0.015, Aspect's nine standard deviations, 242 standard deviations, 13 m, ν = 1,420,405,751.768 Hz, 5.9 µeV): 448 has no "reported" channel. Recommend words only without digits (e.g. "far beyond two standard deviations"), citing Townsend pp. 164, 146; computed numbers only.
2. **Home of the hyperfine matrix**: L10 (operators first appear there) or L11 (energy levels)? Recommend L10, with L11 untouched (its two-level example is a different system); no forward link in the beat.
3. **Teleportation and no-cloning in a 448 lecture**: one link-out beat (`l10-what-ghz-proves:b7b`) or none? Recommend keep it: it is Townsend's only application of the singlet, and 709 owns the algebra.
4. **`amplitudes.inBasis:{local}`** versus teaching the x basis with a circuit source (H columns, bars still labelled by bits)? Recommend the field: bits labelled |00⟩ would read as z kets and invite exactly the confusion the beat removes.
5. **Plot points mode in 448**: `plot.points` is documented for Papers recipes. Recommend allowing it with y values taken from `V` keys (no guard found in `resolve.ts`); fallback is a tiny `matrix` table source for the eight kinds.
6. **`practice` tag on a challenge** (schema) or only a title prefix "Practice: "? Recommend the field (testable: 3–5 per lecture, walkthrough required).
7. **EPR tilt visual** (`two-qubit.condition` taking a direction, sweepable, so B's conditional arrow follows A's axis while B's unconditional arrow stays at the centre): not planned. Recommend defer; `axes` already draws A's tilted analyser and the claims carry the numbers.
8. **Bell names**: Townsend's Ψ(±), Φ(±) appear once (b7b). Recommend name only the singlet's Ψ(−) with a "(Townsend: Ψ(−))" tag; leave the full Bell-basis Rosetta to Q11.
9. **GHZ in the x basis** (the HW6 problem 2a skill): use `inBasis:{local:'zxx'}` in a `deeper` beat of `l10-quantum-wins`? Recommend yes, one `deeper` beat after the L10 build lands (not planned here, no claim keys reserved).
