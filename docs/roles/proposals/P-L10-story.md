# P-L10 — Lecture 10 story plan: entanglement and the GHZ game

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use.
Format: `P-L7-story.md`, compressed (one table row per beat). Skill: `skills/03-chapter-plan`.

**Sources read.** `sources/L10/text.md` (17 pages; the footers say "n / 18", so **page 18 is missing**, as L7's p.14 was)
and `sources/L11/text.md` pp. 1–9 (§§11.1–11.3, which this chapter owns by ruling 1). Contact sheets p01–p17 checked:
boxed equations and tables only, no figures. Books: Susskind & Friedman Lecture 6 §6.1–6.9 (L10 cites §6.8–6.9),
Lecture 7 §7.9–7.10 (locality, the "quantum sim"); Townsend 2e §5.7, pp. 179–180 (reduced state of one entangled
particle). Townsend §5.4–5.5 (EPR, Bell) are not ingested (PDF pp. 176–186 absent), so they are not cited.

**Evidence.** Every number below was computed twice: (1) the app's engine, bundled read-only to the scratchpad
(`plan448-engine.ts`, `plan448-extra*.ts`: `physics/qc/{state,gates,measure,density,entangle,bits,complexExtra}`,
`physics/spin`); (2) an independent numpy script (`plan448-L10L11-numpy.py`). All agree to 1e−12. Judge facts re-checked:
singlet averages 0, XX = YY = ZZ = −1, the X_A and Y_A images, the four |G⟩ eigenvalue equations, classical optimum ¾.

**Conventions.** |0⟩ ≡ |u⟩ ≡ |+z⟩ (709 lock C1; the notes' own relabel on p.10). q0 = Alice (the left factor).
Stage helpers for W: `amp(src,o)` = `{kind:'amplitudes', state:src, shot:'A-BARS', ...o}`; `tq(src,o)` =
`{kind:'two-qubit', source:src, arrows:'reduced', labels:'A-B', ...o}`; `tab(rows,o)` = `{kind:'matrix', tableau:rows,
shot:'M-GRID', ...o}`; `ball(p,o)` = bloch-ball; `on(k, gates)` = a circuit AmpSource that starts in ket/state `k` and
applies the listed one-qubit gates (`Z0` = Z on Alice), so a view shows "operator acting on state" from the engine
(a circuit starts from a bit string, so `on(SING,…)` prefixes C_SING = X on both, H on q0, CX 0→1, which gives
(\|01⟩ − \|10⟩)/√2; `on(G,…)` prefixes C_G below).
`SING` = `{ket:{bell:'01-10'}}` · `UD` = `{ket:{ket:'01'}}` · `PATH(θ)` = `{family:'cos-sin', pair:'01-10', thetaDeg:θ}`
(new field A1) · `G` = `{terms:'000-011-101-110'}` (new source A2; fallback `{circuit: C_G}`: H on q0, CX 0→1, CX 0→2,
H on all, S on all, which the engine confirms equals |G⟩ exactly) · `GAME` = the four rows `['ZZZ','ZXX','XZX','XXZ']` ·
`TGT` = `targets:{ZZZ:+1, ZXX:-1, XZX:-1, XXZ:-1}` (new field A3) · `CARD(t)` = tableau `values` = the row products of
table t from `ghzGame()` (E2). Claim keys start `l10`; "→" names the engine call and its value.

**Rosetta (one beat each).** (R1) The notes write X, Y, Z for σ_x, σ_y, σ_z (L4's Pauli matrices): `l10-local:b2`.
(R2) Lecture 10 names inputs by bits (0, 1) and answers A₀, A₁; Lecture 11 names them by the measurement (Z, X) and
A_Z, A_X. The app uses Lecture 11's names throughout and states the map once (`l10-no-table:b1`). The notes' input bits
"x, y, z" are never used (they clash with the axes). (R3) Players are Alice, Bob, Charlie and "the referee" (ruling 7;
Lecture 11's "Davie" and "referee Charlie" are a naming slip, §8).

## 0. Lecture map

| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l10-local` | Alice's operators touch only Alice's spin | How does one player measure one part of a two-spin state? | L10 pp.2–3 (§10.1–10.2) | Susskind §6.8 |
| 2 | `l10-empty-centre` | A known pair with unknown parts | How can a complete state predict nothing about either spin? | pp.4–6 (§10.3) | Susskind end §6.8; Townsend §5.7 pp.179–180 |
| 3 | `l10-correlations` | The information lives in the correlations | What does knowing the singlet tell Alice and Bob? | pp.7–8 (§10.4) | Susskind §6.9 |
| 4 | `l10-instructions` | Could the answers be written in advance? | Could hidden instruction tables explain the correlations? | p.9 (§10.5) | Susskind §7.10 |
| 5 | `l10-ghz-game` | Three spins and a three-player game | Can three players who cannot talk always win? | pp.10–11 (§10.6–10.7) | — |
| 6 | `l10-no-table` | No instruction table wins every round | Why is ¾ the best any classical team can do? | pp.12–13 (§10.8); L11 pp.3–4 (§11.1) | — |
| 7 | `l10-quantum-wins` | Sharing one state wins every round | Which three-spin state wins all four inputs, and how? | pp.14–16 (§10.9); L11 pp.5–6 (§11.2) | — |
| 8 | `l10-what-ghz-proves` | What the game proves about nature | What exactly has the GHZ argument ruled out, and what not? | p.17 (§10.10); L11 pp.7–9 (§11.3) | Susskind §7.9–7.10 |

**Class marker (ruling 1).** Class 11 began with §11.1 (a recap of the proof) and §11.2 (the quantum strategy). §11.1 is
folded into unit 6 as a second pass; the visible marker "Class 11 starts here" sits above unit 7's chapter card, with
the note "Lecture 11 opened by re-running Unit 10.6's proof with measurement names." Content model: W adds
`Unit.classStart?: { lecture: number; note: string }` (rendered as a slim divider in Story, Read and print; lint: the
note obeys the sentence cap; `lecture` differs from the chapter's own number). See §9.2 A7.

**Ownership.** L9 owns the tensor product, two-spin basis, product vs general states, the singlet and its
non-factorability, and the penny-and-dime correlation (Charlie). L10 links back to them (`l10-local:b1`,
`l10-correlations:b2`) and owns: local operators, the singlet's zero local averages, the ball interior *as taught by
the notes* (L6's `l6-mixture` was beyond the lecture: one link-back beat), perfect correlations, instruction tables,
three spins, the GHZ game, its classical bound, the quantum strategy, λ, the Bell remark, no-signalling. L11 opens
with one recap beat linking to unit 8.

**Counts.** 8 units, **50 beats** (6 + 8 + 7 + 5 + 5 + 6 + 7 + 6), 9 clues, 4 books beats, 5 beats that link back (L9 ×2, L7, L6, L1), 6 derivations, 2 Go-deeper boxes.
Outcomes: (1) write a one-spin measurement as X⊗I and say why local operators commute; (2) explain why the singlet's
parts sit at the ball's centre; (3) compute ZZ, XX, YY on the singlet; (4) state the instruction-table question;
(5) prove no table wins all four GHZ inputs; (6) show |G⟩ wins every round; (7) say what was ruled out and what was not.

## 1. Story beats

Columns: beat · phase · notes page · text (paraphrase gist; the build agent writes the final sentences) · stage ·
claims. [L] notes, [B] books, [C] clue (question → reveal).

### Unit 1 `l10-local` — Alice's operators touch only Alice's spin
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back to L9** (chip): a product state factors; the general two-spin state has four amplitudes and usually does not; the singlet. Two claims sound incompatible: the state says everything about the pair, yet nothing about either spin. Today we make both precise. | `amp(SING,{dials:true, labels:'ud'})` | `l10SingAmp`: amplitude of \|ud⟩ = 1/√2 → `bell('01-10')[1].re` = 0.7071 |
| b2 | L | p.3 | **Rosetta R1** (introduces `pauli-letters`): write X, Y, Z for σ_x, σ_y, σ_z; outcomes ±1. Z\|u⟩ = \|u⟩, Z\|d⟩ = −\|d⟩, X swaps them, Y\|u⟩ = i\|d⟩, Y\|d⟩ = −i\|u⟩. | `{kind:'bloch', state:'+z', measure:'z', shot:'B-STD'}` | `l10YonU`: Y\|u⟩ = i\|d⟩ → `apply(SIGMA_Y, KET['+z'])` = (0, i) |
| b3 | L | p.3 | Alice's operators act on her factor only: Z_A ≡ Z⊗I, X_B ≡ I⊗X. The identity keeps the other spin untouched. **Derivation D1.** | `{kind:'matrix', source:{kron:[{pauli:'Z'},{gate:{name:'I'}}]}, values:'exact', blocks:2}` | `l10ZAdu`: Z_A\|du⟩ = −\|du⟩ → `pauliEigenvalue(ket('10'),'ZI')` = −1 · `l10XBdu`: X_B\|du⟩ = \|dd⟩ → `applyGate(ket('10'), X, [1])` = `ket('11')` |
| b4 | L | p.3 | (A⊗I)(I⊗B) = A⊗B = (I⊗B)(A⊗I), so [A_A, B_B] = 0: Alice's and Bob's observables are compatible; **link back to L7** `l7-compatible`. | `tab(['ZI','IX'],{product:true})` | `l10LocalCommute`: commutator zero → `paulisCommute('ZI','IX')` = true; and for non-Pauli A = H, B = S: `matEq(kronM(H,I2)·kronM(I2,S), kronM(I2,S)·kronM(H,I2))` |
| b5 | B | — | Susskind (§6.8) calls Alice's spin σ and Bob's τ; the notes keep X, Y, Z with labels because the same notation carries into the game. | same | — |
| b6 | C | p.3 | Q: Alice measures Z and Bob X. Does it matter who goes first? → R: No. The operators commute, so the four joint chances are the same in either order: ¼ each on the singlet. | `tab(['ZI','IX'])` → reveal `tq(SING,{axes:{a:['+z'], b:['+x']}, grid:'none'})` | `l10ZXjoint`: `localBasisProbs(sing,['z','x'])` = [0.25 ×4] |

### Unit 2 `l10-empty-centre` — A known pair with unknown parts
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.4 | Ask what the singlet predicts for Alice alone. **Derivation D2**: Z_A\|sing⟩ = (\|ud⟩ + \|du⟩)/√2, so ⟨Z_A⟩ = 0. | `amp(SING,{dials:true, labels:'ud'})` | `l10ZAavg` → `expectationN(sing, Z, [0]).re` = 0 |
| b2 | L | p.4 | X_A\|sing⟩ = (\|dd⟩ − \|uu⟩)/√2 is orthogonal to the singlet, so ⟨X_A⟩ = 0; Y_A\|sing⟩ = i(\|dd⟩ + \|uu⟩)/√2, so ⟨Y_A⟩ = 0. The same holds for Bob. | `amp(on(SING,['X0']),{dials:true})` | `l10XAoverlap`: `abs(inner(sing, applyGate(sing,X,[0])))` = 0 · `l10YAavg` = 0 · Bob's three = 0 (`reducedBloch(sing,1)`) |
| b3 | L | pp.4–5 | Any axis n̂: ⟨σ_n̂,A⟩ = n_x⟨X_A⟩ + n_y⟨Y_A⟩ + n_z⟨Z_A⟩ = 0. With outcomes ±1, P(+1) − P(−1) = 0, so each is ½ for every axis. **Signature "empty centre", first view.** | `tq(SING,{grid:'none', axes:{a:[{thetaDeg:60,phiDeg:30}]}})` | `l10RA`: r_A = (0,0,0) → `reducedBloch(sing,0)` · `l10Phalf`: P(+1) along (60°, 30°) = 0.5 → `measureInBasis(sing,0,[n̂ kets])` |
| b4 | L | p.5 | **Link back to L6** `l6-mixture` (met there beyond the notes; the notes teach it now): averaging surface points lands inside the ball, r_avg = Σ p_i r_i. Half \|+z⟩, half \|−z⟩ gives the centre. | `ball({mix:[{of:'+z',w:0.5},{of:'-z',w:0.5}]},{recipe:true})` | `l10MixCentre`: r_avg = (0,0,0) · `l10Mix3to1`: ¾/¼ gives r_z = 0.5 |
| b5 | L | p.6 | Two kinds of uncertainty. A surface point is a known pure state, yet X and Y can still be 50/50 (quantum). An inside point records ignorance of which pure state was made. At the centre every axis is 50/50. | `ball('+z',{compare:'oven', measure:'x'})` | `l10PlusZx`: P(+x) for \|+z⟩ = 0.5 → `prob(KET['+x'],KET['+z'])` · centre: `probUpAlong` = 0.5 |
| b6 | L | p.6 | Alice's half of the singlet sits at the centre, but nobody is ignorant of the pair: it is one known pure state (introduces gloss `maximally-entangled`). Alice alone looks exactly like a spin in an unknown direction. **Signature view.** | `{layout:'split', top: ball('oven'), bottom: tq(SING,{grid:'T', readouts:['purity','rLength']})}` | `l10PairPure`: pair purity 1 → `purityN(densityOf(sing))` · `l10RhoA`: ρ_A = I/2 → `reducedDensity(sing,[0])` diag 0.5, 0.5 |
| b7 | B | — | Townsend (§5.7, pp. 179–180) traces out one particle of an entangled pair and finds the matrix of a completely unpolarized beam; Susskind (end §6.8) calls such a pair maximally entangled. | same | `l10RhoAPurity`: tr ρ_A² = 0.5 → `purityN(reducedDensity(sing,[0]))` |
| b8 | C | p.6 | Q: Alice's statistics match a beam that is half \|+z⟩, half \|−z⟩. So is her spin secretly up or down? → R: No one-spin test can tell, but the pair can. A half-and-half mix of \|ud⟩ and \|du⟩ gives XX = 0 on average; the singlet gives XX = −1 every time (next unit). | `tq(SING,{grid:'none'})` → reveal `{layout:'split', top: tq(SING,{grid:'T', highlight:['xx']}), bottom: tq({rho:{mixture:[{w:0.5,ket:{ket:'01'}},{w:0.5,ket:{ket:'10'}}]}},{grid:'T', highlight:['xx']})}` | `l10MixXX`: `correlationTensor(mixtureN(½ ud, ½ du))[0][0]` = 0 · `l10SingXX` = −1 |

### Unit 3 `l10-correlations` — The information lives in the correlations
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.7 | Both measure Z and multiply: the observable is Z_AZ_B = Z⊗Z (gloss `product-observable`). **Derivation D3**: Z_AZ_B\|sing⟩ = −\|sing⟩, so z_A z_B = −1 with certainty. | `amp(SING,{dials:true, labels:'ud'})` | `l10ZZ` → `pauliEigenvalue(sing,'ZZ')` = −1 |
| b2 | L | p.7 | Each result alone is a coin toss; the relation is certain. **Link back to L9**: Charlie's penny and dime behave the same way, so this part still looks classical. | `tq(SING,{grid:'T', highlight:['zz']})` | `l10ZZprobs`: `localBasisProbs(sing,['z','z'])` = [0, 0.5, 0.5, 0] |
| b3 | L | p.7 | Now both measure X: X_AX_B\|sing⟩ = −\|sing⟩. The same for Y. Every matched axis gives opposite results. | `tq(SING,{grid:'T', highlight:['xx','yy','zz']})` | `l10XX`, `l10YY` → −1 each · `l10Tgrid`: `correlationTensor(sing)` = −I |
| b4 | L | p.8 | The key sentence, paraphrased: no individual answer is predictable, yet the correlations are exact. **Signature: morph from \|ud⟩ to the singlet**: the arrows shrink to the centre while the grid fills in to −I (gloss `correlation-grid`). | `tq(PATH(sweep(0,45)),{grid:'T'})` | `l10PathR`: \|r_A\| = 1, 0.5, 0 at θ = 0°, 30°, 45° → `reducedBloch` · `l10PathXX`: T_xx = 0, −0.866, −1 |
| b5 | B | — | Susskind (§6.9) adds σ·τ = XX + YY + ZZ, an observable no pair of separate detectors can read; the singlet is its eigenvector with eigenvalue −3. | `tq(SING,{grid:'T'})` | `l10DotST`: `apply(XX+YY+ZZ, sing)` = −3·sing |
| b6 | C | — | Q: Alice measures Z and Bob X. Is their product certain too? → R: No: ⟨Z_AX_B⟩ = 0 and all four outcome pairs have chance ¼. Certainty needs matched axes. | `tq(SING,{grid:'T', highlight:['zx']})` | `l10ZX`: `correlationTensor(sing)[2][0]` = 0 · ¼ each (b6 of unit 1's key reused) |
| b7 | C | — | Q: \|ud⟩ also gives z_A z_B = −1 every time. What does the singlet have that \|ud⟩ lacks? → R: \|ud⟩ has definite single answers (arrows on the surface) and no XX or YY correlation; the singlet has no single answers and all three. | `{layout:'split', top: tq(UD,{grid:'T'}), bottom: tq(SING,{grid:'T'})}` | `l10UDT`: `correlationTensor(ket('01'))` = diag(0,0,−1) · `l10UDR`: r_A = (0,0,1) |

**Go deeper 1 (beyond the notes; unit end).** For the singlet, ⟨σ_n̂ ⊗ σ_m̂⟩ = −n̂·m̂. Axes 60° apart: −0.5, so the
results are opposite with chance 0.75; at 90°: 0; at 120°: +0.5. Bell's inequality combines four such settings: any
instruction table keeps |S| ≤ 2, while the singlet reaches 2√2 ≈ 2.83 (go further: 709 Q10 `q10-chsh`). Stage:
`tq(SING,{axes:{a:['+z'], b:[{thetaDeg:sweep(0,180),phiDeg:0}]}, grid:'T'})`, then the four CHSH axes of unit 8 b4 with
`readouts:['chsh']` (score 2.83 at the drawn axes, `chshFromAxes`). Claims: `correlator(sing, Z, σ_m)` =
−1, −0.5, 0, +0.5, +1 at 0°, 60°, 90°, 120°, 180°; P(opposite) = (1 − E)/2 = 0.75 at 60°; `lhvChsh().maxS` = 2;
`chshMaxHorodecki(sing)` = 2.828.

### Unit 4 `l10-instructions` — Could the answers be written in advance?
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.9 | **Link back to L1** `l1-logic` (hidden labels). Perhaps the source hands each particle an instruction table (gloss `instruction-table`): e.g. A_Z = +1, A_X = −1 for Alice and the opposite for Bob. | `tab(['ZZ','XX'],{values:{ZZ:-1,XX:-1}, state:SING})` | `l10TableRows`: card products −1, −1 (from the table) match `pauliEigenvalue(sing,'ZZ'/'XX')` = −1, −1 |
| b2 | L | p.9 | Alice's result looks random only because she does not know which table came. If the source picks among the four tables with B = −A, Alice gets +1 half the time. | same | `l10Tables2`: 4 of 16 two-setting tables match ZZ = XX = −1; A_Z = +1 in 2 of 4 → 0.5 |
| b3 | L | p.9 | Bell's question, operationally: can every quantum correlation come from tables fixed before the measurement? For these two settings, no contradiction yet. | same | — |
| b4 | L | p.9 | What "local" means (gloss `locality`): an answer may use the player's own setting and anything agreed in advance, never a partner's later choice. Shared randomness is allowed; talking after the inputs arrive is not. | `tq(SING,{grid:'none', axes:{a:['+z','+x'], b:['+z','+x']}})` | — |
| b5 | C | — | Q: Give each particle answers for X, Y and Z. Can a table match all three singlet correlations? → R: Yes: 8 of the 64 tables do (Bob = −Alice on each axis). Matched axes alone can never refute tables; we need a sharper test. | `tab(['XX','YY','ZZ'],{values:{XX:-1,YY:-1,ZZ:-1}, state:SING})` | `l10Tables3`: 8 of 64 (enumeration in `ghzGame`'s sibling `instructionSets`, E2) |

### Unit 5 `l10-ghz-game` — Three spins and a three-player game
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.10 | A third spin: H_ABC = H_A⊗H_B⊗H_C has dimension 2·2·2 = 8. Relabel \|0⟩ ≡ \|u⟩, \|1⟩ ≡ \|d⟩ (introduces gloss `bit-labels`); the basis runs \|000⟩ … \|111⟩. | `amp({ket:'000'})` (8 bars) | `l10Dim3`: `2 ** nQubits(ket('000'))` = 8 |
| b2 | L | p.10 | Local operators as before: Z_A = Z⊗I⊗I, X_B, X_C. If all three measure and multiply, the observable is Z⊗X⊗X, written ZXX. Nothing new but one more label. | `{kind:'matrix', source:{pauli:'ZXX'}, values:'exact', blocks:2}` | `l10ZXXsize`: `pauliString('ZXX').length` = 8 |
| b3 | L | p.11 | The game (gloss `ghz-game`): Alice, Bob, Charlie agree a plan, then cannot talk. The referee picks one of four instruction strings, ZZZ, ZXX, XZX, XXZ (the notes' bits 000, 011, 101, 110), and each player sees only their letter and answers ±1. Win: an even number of −1 answers for ZZZ, odd for the other three (gloss `parity`). | `tab(GAME,{TGT})` | — (rules; integers only) |
| b4 | L | p.11 | "Always answer −1" (the notes' "always output 1") wins three inputs and loses ZZZ. Can a cleverer plan reach 100%? | `tab(GAME,{TGT, values:CARD(all −1)})` | `l10AllMinus`: wins 3 of 4, loses ZZZ → `ghzGame()` row check |
| b5 | C | p.11 | Q (the notes' class challenge): plan anything, share coins, assign roles. Can you guarantee a win? → R: Every one of the 64 tables fails an odd number of inputs: 32 fail one, 32 fail three, none fail zero. Unit 6 shows why. | `tab(GAME,{TGT, values:CARD(T1)})` (T1 = A_Z +1, A_X −1, B and C −1 always) | `l10Wins3`: 32 tables win 3 · `l10Wins1`: 32 win 1 · max 3 |

### Unit 6 `l10-no-table` — No instruction table wins every round
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.12; L11 p.3 | **Rosetta R2.** Write each answer as a sign, s = (−1)^bit; an even count of −1s means the product is +1. A plan is six fixed answers A_Z, A_X, B_Z, B_X, C_Z, C_X ∈ {±1} (the notes' A₀, A₁ …; Lecture 11's "Davie" is our Charlie). | `tab(GAME,{TGT, values:CARD(T1)})` | — |
| b2 | L | p.12; L11 p.3 | **Derivation D4**: winning every input needs A_ZB_ZC_Z = +1 and the three others = −1. Multiply all four: the left side is a product of squares, +1; the right side is −1. | `tab(GAME,{TGT})` | `l10ProdCard`: product of any card's four rows = +1 (all 64) · `l10ProdTarget` = −1 |
| b3 | L | p.12; L11 p.4 | So no table wins all four. Each table fails at least one of four equally likely inputs, so P_win ≤ ¾; "always −1" reaches it. Shared randomness only picks a table at random, so it cannot beat ¾. | `tab(GAME,{TGT, values:CARD(all −1)})` | `l10Classical`: max over 64 tables = 3/4 = 0.75 |
| b4 | L | p.13 | What failed is not cleverness or coordination; it is the assumption that each answer is fixed in advance by the player's own instruction alone. | same | — |
| b5 | C | — | Q: Alice answers +1 to Z and −1 to X; Bob and Charlie always −1. Which input loses? → R: ZXX: (+1)(−1)(−1) = +1, but it needs −1. The other three win. | `tab(GAME,{TGT, values:CARD(T1)})` | `l10T1`: wins ZZZ, XZX, XXZ, loses ZXX → `ghzGame()` |
| b6 | C | p.12 | Q: Pick a table at random each round. Can the average beat ¾? → R: An average of numbers that are each at most ¾ is at most ¾; a table picked uniformly from all 64 wins half the time. | same | `l10RandomTable`: mean of wins/4 over 64 tables = 0.5 |

### Unit 7 `l10-quantum-wins` — Sharing one state wins every round   *(Class 11 starts here)*
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.14; L11 p.5 | The quantum rule: told Z, measure Z; told X, measure X; report the ±1 result. We need a state where ZZZ is certainly +1 and ZXX, XZX, XXZ are certainly −1. The three local measurements commute (unit 1), so the product of the three results is the value of the product observable. | `tab(GAME,{TGT})` | — |
| b2 | L | p.14 | The shared state (gloss `ghz-state`): \|G⟩ = ½(\|000⟩ − \|011⟩ − \|101⟩ − \|110⟩). | `amp(G,{dials:true})` | `l10Gamp`: amplitudes ±0.5 → `superpose('000-011-101-110')` (E1); norm 1 |
| b3 | L | p.15 | **Derivation D5**: each \|1⟩ picks up −1 under Z; every term of \|G⟩ has an even number of 1s; so ZZZ\|G⟩ = +\|G⟩. | `amp(G,{dials:true})` | `l10ZZZ` → `pauliEigenvalue(G,'ZZZ')` = +1 |
| b4 | L | p.15 | The product is certain, the single results are not: (+1, −1, −1) also multiplies to +1. Under ZZZ the strings 000, 011, 101, 110 each come up with chance ¼. | `amp(G,{mode:'probability'})` | `l10GzzzProbs`: `localBasisProbs(G,['z','z','z'])` = ¼ on each of the four · `l10AliceHalf` = 0.5 |
| b5 | L | p.15 | **Derivation D6**: X_B X_C flips the last two bits; then Z_A flips the sign of terms starting with 1; the result is −\|G⟩. | `amp(G,{dials:true})` | `l10ZXX` → `pauliEigenvalue(G,'ZXX')` = −1 · `l10ZXXvec`: vector equals ½(\|011⟩ − \|000⟩ + \|110⟩ + \|101⟩) |
| b6 | L | p.16 | \|G⟩ is symmetric among the players, so XZX and XXZ also give −1. All four conditions hold: P_win = 1. **Signature: the four rows all match.** | `tab(GAME,{TGT, state:G})` | `l10XZX`, `l10XXZ` → −1 · `l10QWin`: (1 + target·⟨P⟩)/2 = 1 for each input → `ghzQuantumWin(G)` (E2) |
| b7 | C | p.15 | Q: Every round is a win. Can Alice predict her own answer? → R: No: for every input her answer is +1 with chance ½. Only the product of the three is fixed. | `amp(G,{mode:'probability', inBasis:['z','x','x']})` (A4: the ZXX outcome chances) | `l10AliceZXX`: P(Alice +1) under ZXX = 0.5 (and under XZX, XXZ) |

**Go deeper 2 (beyond the notes; unit end).** Is \|G⟩ "the" GHZ state? Turn each spin on its own by the same fixed
one-spin operation (Hadamard then phase, in 709's language) and the textbook (\|000⟩ + \|111⟩)/√2 becomes exactly
\|G⟩. The same turns carry Mermin's XXX, XYY, YXY, YYX into ZZZ, ZXX, XZX, XXZ (go further: 709 Q7 `q7-observables`).
Claims: `applyGate`×6 on `ghz(3)` equals `superpose('000-011-101-110')` entrywise (1e−12); `cliffordConj(S·H,'X')` = +Z,
`cliffordConj(S·H,'Y')` = +X; `merminInstructionSets().maxMatches` = 3, the same ceiling.

### Unit 8 `l10-what-ghz-proves` — What the game proves about nature
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | L11 p.7 | Suppose hidden information λ fixes the answers (gloss `local-hidden-variables`); randomness would then be ordinary ignorance. Any extra local coin can be folded into λ, so λ sets one answer per possible measurement. | `tab(GAME,{TGT, values:CARD(T1)})` | — |
| b2 | L | L11 p.7 | Locality: for each λ, Alice has A_Z(λ), A_X(λ), and so on. λ may change from round to round, but Alice's entry never depends on what Bob or Charlie measure. That is the game's no-talking rule. | `tab(GAME,{TGT, values:CARD(T2)})` (another λ) | — |
| b3 | L | L11 p.8 | Every λ that ever occurs would need all four GHZ equations: the same contradiction. Local hidden variables give one table per λ; no table fits; quantum mechanics fits all four with certainty (gloss `bell-theorem`). | `tab(GAME,{TGT, state:G, product:true})` | `l10OpProduct`: ZZZ·ZXX·XZX·XXZ = −III → `pauliMul` chain (phase −1) while every card multiplies to +1 |
| b4 | L | L11 p.8 | Bell's own argument used a statistical bound (gloss `bell-inequality`) that experiments can test. They violate it as quantum mechanics predicts; the 2022 Nobel Prize went to Clauser, Aspect and Zeilinger for entangled-photon tests. | `tq(SING,{grid:'T', axes:{a:['+z','+x'], b:[{thetaDeg:135,phiDeg:180},{thetaDeg:135,phiDeg:0}]}})` (no `chsh` readout here) | numbers stay in Go deeper 1 (the notes give none) |
| b5 | L | L11 p.9 | What it does not imply: no message travels (gloss `no-signalling`). Alice cannot choose her ±1, and her chances stay ½ whatever Bob and Charlie measure; the correlation shows only when results are compared. | `{layout:'split', top: amp(G,{mode:'probability'}), bottom: amp(G,{mode:'probability', inBasis:['z','x','x']})}` | `l10NoSignal`: Alice's Z marginal = 0.5 under ZZZ and under ZXX |
| b6 | B | — | Susskind (§7.9) shows Bob's local operations leave Alice's statistics unchanged; his "quantum sim" (§7.10) cannot fake entangled correlations on two unconnected computers. Exit (p.17): the 1935 locality argument; quantum randomness is not ignorance of local properties. | `tq(SING,{grid:'T'})` | `l10RAstill`: r_A = 0 after a local gate on Bob → `reducedBloch(sing with H on q1, 0)` = (0,0,0) |

## 2. Derivations (one track; `formal` = the same list until W lets the lint skip absent tracks, §9.2 A8)
Every view uses a kind already on the unit's stage; each list has ≥ 2 distinct views.

- **D1 `l10-local:b3`** result `Z_A|du\rangle = -|du\rangle`: (1) `Z_A|du\rangle = (Z\otimes I)(|d\rangle\otimes|u\rangle)` — "Z_A is Z on the first slot, I on the second." view `amp(on('10',[]))`; (2) `= (Z|d\rangle)\otimes(I|u\rangle)` — "Each factor acts on its own spin." same view; (3) `= (-|d\rangle)\otimes|u\rangle = -|du\rangle` — "Z gives −1 on d; I changes nothing." view `amp(on('10',['Z0']),{dials:true})`. viewCaptions: "before" / "after Z on Alice".
- **D2 `l10-empty-centre:b1`** result `\langle Z_A\rangle = 0`: (1) `Z_A|sing\rangle = \tfrac{1}{\sqrt2}(Z_A|ud\rangle - Z_A|du\rangle)` view `amp(SING)`; (2) `= \tfrac{1}{\sqrt2}(|ud\rangle + |du\rangle)` view `amp(on(SING,['Z0']))`; (3) `\langle Z_A\rangle = \tfrac12(\langle ud| - \langle du|)(|ud\rangle + |du\rangle)` same; (4) `= \tfrac12(1 - 1) = 0` view `tq(SING,{grid:'none'})` ("Alice's arrow has length 0").
- **D3 `l10-correlations:b1`** result `Z_AZ_B|sing\rangle = -|sing\rangle`: (1) split over the two terms, view `amp(SING)`; (2) `Z_AZ_B|ud\rangle = (Z|u\rangle)\otimes(Z|d\rangle) = -|ud\rangle`, likewise `|du\rangle`; (3) `= \tfrac{1}{\sqrt2}(-|ud\rangle + |du\rangle)` view `amp(on(SING,['Z0','Z1']))`; (4) `= -|sing\rangle` view `tq(SING,{grid:'T', highlight:['zz']})`.
- **D4 `l10-no-table:b2`** result `+1 = -1`: (1) the four requirements, view `tab(GAME,{TGT})`; (2) multiply the left sides: each of A_Z … C_X appears exactly twice, view `tab(GAME,{TGT, product:true})` ("each column holds each letter twice"); (3) `= A_Z^2A_X^2B_Z^2B_X^2C_Z^2C_X^2 = +1` same; (4) right sides `(+1)(-1)(-1)(-1) = -1` view `tab(GAME,{TGT})`; (5) `+1 = -1`.
- **D5 `l10-quantum-wins:b3`** result `ZZZ|G\rangle = +|G\rangle`: (1) `Z|1\rangle = -|1\rangle`, view `amp(G)`; (2) every term has zero or two 1s, view `amp(G,{mode:'probability'})`; (3) so each term gains `(+1)`, `ZZZ|G\rangle = +|G\rangle`, view `amp(on(G,['Z0','Z1','Z2']))`.
- **D6 `l10-quantum-wins:b5`** result `ZXX|G\rangle = -|G\rangle`: (1) `X_BX_C|G\rangle = \tfrac12(|011\rangle - |000\rangle - |110\rangle - |101\rangle)` view `amp(on(G,['X1','X2']))`; (2) then `Z_A`: `\tfrac12(|011\rangle - |000\rangle + |110\rangle + |101\rangle)` view `amp(on(G,['X1','X2','Z0']))`; (3) `= -\tfrac12(|000\rangle - |011\rangle - |101\rangle - |110\rangle) = -|G\rangle` view `amp(G)`.

## 3. Try-it per unit (props checked against the widget code; two widgets are new, §9.3)
| unit | widget spec | try this |
|---|---|---|
| local | `{kind:'two-spin', props:{state:'ud', axisA:'z', axisB:'x'}}` (W1) | 1. Measure 100 pairs of \|ud⟩ with Z on Alice: always +1. · 2. Swap the order (Bob first): same tallies. · 3. Switch to the singlet. |
| empty-centre | `{kind:'two-spin', props:{state:'singlet', axisA:'z', axisB:'z'}}` | 1. Set Alice to x, then y: her +1 share stays near ½. · 2. Bob's too. · 3. Find any axis where Alice's arrow leaves the centre (none). |
| correlations | `{kind:'two-spin', props:{state:'path', theta:0}}` | 1. Slide θ from 0° to 45°: the arrows shrink to 0 while the XX cell reaches −1. · 2. At 30° read \|r_A\| = 0.5. · 3. Set Alice z, Bob x on the singlet: the product is ±1 at random. |
| instructions | `{kind:'ghz-game', props:{mode:'pair'}}` (W2, two-player table mode) | 1. Write a two-setting table that matches ZZ = XX = −1. · 2. Hide it: Alice's tally is 50/50. |
| ghz-game | `{kind:'ghz-game', props:{mode:'table', seed:10}}` | 1. Try "always −1": which input loses? · 2. Find a table that loses only XZX. · 3. Find one that wins all four (you cannot). |
| no-table | `{kind:'ghz-game', props:{mode:'table', proof:true}}` | 1. Change any one answer: the count of failed inputs stays odd. · 2. Multiply your four row products: always +1. |
| quantum-wins | `{kind:'ghz-game', props:{mode:'quantum', rounds:20, seed:7}}` | 1. Play 20 rounds: all wins. · 2. Check Alice's answers: about half are −1. |
| what-ghz-proves | `{kind:'ghz-game', props:{mode:'both'}}` | 1. Run the best table and \|G⟩ side by side for 40 rounds: ≈ 75% vs 100%. |

## 4. Challenges (no 448 homework covers L10/L11; nothing is `assigned`; keys from the engine)
- **local**: `l10-lo-act` warm-up numeric: the sign in Z_A\|du⟩ = s\|du⟩ → −1 (`pauliEigenvalue(ket('10'),'ZI')`) · `l10-lo-xb` core choice: X_B\|ud⟩ = ? options \|uu⟩ ✓ (`applyGate(ket('01'),X,[1])` = ket('00')), \|dd⟩, \|du⟩, −\|ud⟩ · `l10-lo-commute` core choice: which pair can fail to commute? X_A and Y_A ✓; X_A, Y_B; Z_A, Z_B; X_A, X_B (`paulisCommute('XI','YI')` false) · `l10-lo-joint` stretch numeric: on the singlet, P(Alice +1 along z and Bob +1 along x) → 0.25.
- **empty-centre**: `l10-ec-avg` warm-up numeric ⟨Y_B⟩ → 0 · `l10-ec-prob` core numeric P(Alice +1 along an axis 70° from z) → 0.5 · `l10-ec-mix` core numeric \|r_avg\| for ½\|+z⟩ + ½\|+x⟩ → 0.707 · `l10-ec-two` stretch choice: which is true of Alice's half of the singlet? "its statistics match the oven beam, but the pair is pure" ✓ (`reducedBloch` 0, `purityN` 1).
- **correlations**: `l10-co-yy` warm-up numeric y_A y_B → −1 · `l10-co-zx` core numeric ⟨Z_AX_B⟩ → 0 · `l10-co-path` core numeric \|r_A\| at θ = 30° → 0.5 · `l10-co-dot` stretch numeric eigenvalue of XX + YY + ZZ on the singlet → −3.
- **instructions**: `l10-in-count` core numeric: how many two-setting tables match ZZ = XX = −1? → 4 · `l10-in-local` core choice: which plan breaks locality? "Bob's answer depends on Alice's setting" ✓ · `l10-in-three` stretch numeric: three-setting tables matching all three → 8.
- **ghz-game**: `l10-gg-dim` warm-up numeric dim H_ABC → 8 · `l10-gg-always` core choice: which input does "always −1" lose? ZZZ ✓ · `l10-gg-wins` stretch numeric: how many of the 64 tables win exactly 3 inputs? → 32.
- **no-table**: `l10-nt-order` core order: the four requirements → multiply left sides → squares give +1 → right sides give −1 → contradiction · `l10-nt-bound` core numeric best classical win chance → 0.75 · `l10-nt-random` stretch numeric uniform random table → 0.5.
- **quantum-wins**: `l10-qw-zzz` warm-up numeric eigenvalue of ZZZ on \|G⟩ → +1 · `l10-qw-xzx` core numeric XZX → −1 · `l10-qw-alice` core numeric P(Alice +1) under XXZ → 0.5 · `l10-qw-string` stretch choice: which outcome string can appear under ZXX? 001 ✓ (`localBasisProbs(G,['z','x','x'])` nonzero only on 001, 010, 100, 111).
- **what-ghz-proves**: `l10-wp-signal` core choice: can Alice signal by choosing X or Z? no, her marginal stays ½ ✓ · `l10-wp-lambda` stretch choice: which assumption does GHZ refute? "answers fixed by λ and the own setting only" ✓.
Hints: nudge → key idea → setup (three rungs each; the build agent writes them from the walkthroughs above).

## 5. Glossary (new 448 ids; each checked against both glossaries: no 448 duplicate; the 709 twin is named for `sameAs`/bridges)
| id | term | gloss (≤ 25 words) | first | 709 twin |
|---|---|---|---|---|
| `pauli-letters` | X, Y, Z | Short names for the Pauli matrices σ_x, σ_y, σ_z; each reads +1 or −1. `introduces:'notation'` | l10-local:b2 | qc-pauli-matrices |
| `local-operator` | local operator X_A | An operator that acts on one part of a system and leaves the others alone, like X⊗I for Alice. | l10-local:b3 | qc-tensor-operator |
| `maximally-entangled` | maximally entangled | A known pure pair state whose parts each give 50/50 along every axis. | l10-empty-centre:b6 | qc-maximally-entangled |
| `product-observable` | product observable Z_AZ_B | Measure each part, then multiply the ±1 results; its operator is the tensor product, e.g. Z⊗Z. | l10-correlations:b1 | qc-pauli-string |
| `correlation-grid` | correlation grid | The 3×3 table of averages ⟨σ_i⊗σ_j⟩; the singlet's is −1 on the diagonal. | l10-correlations:b4 | qc-correlation-grid |
| `instruction-table` | instruction table | A list, fixed in advance, of the answer a particle gives to each measurement it might meet. | l10-instructions:b1 | qc-hidden-values |
| `locality` | locality | A player's answer may use their own input and earlier plans, never a distant partner's choice. | l10-instructions:b4 | qc-local-realism |
| `bit-labels` | \|0⟩, \|1⟩ labels | Names \|0⟩ ≡ \|u⟩ and \|1⟩ ≡ \|d⟩, so three spins read \|000⟩ … \|111⟩. `introduces:'notation'` | l10-ghz-game:b1 | qc-computational-basis |
| `ghz-game` | GHZ game | A three-player game whose four inputs need parities that no instruction table delivers together. | l10-ghz-game:b3 | (none; Q7 is Mermin's form) |
| `parity` | parity | Whether a count is even or odd; here, the number of −1 answers. | l10-ghz-game:b3 | qc-parity |
| `ghz-state` | \|G⟩ | The three-spin state ½(\|000⟩ − \|011⟩ − \|101⟩ − \|110⟩) that wins every GHZ round. | l10-quantum-wins:b2 | qc-ghz |
| `local-hidden-variables` | local hidden variables λ | Hidden information set at the source that fixes each player's answer from their own setting alone. | l10-what-ghz-proves:b1 | qc-lhv-model |
| `bell-theorem` | Bell's theorem | No local hidden-variable theory reproduces every prediction quantum mechanics makes for entangled systems. | l10-what-ghz-proves:b3 | — |
| `bell-inequality` | Bell inequality | A bound on combined correlations that every local hidden-variable theory obeys and entangled states can break. | l10-what-ghz-proves:b4 | (Q10 CHSH) |
| `no-signalling` | no signalling | A distant choice never changes one's own statistics, so entanglement cannot carry a message. | l10-what-ghz-proves:b5 | qc-no-signalling |

**Must exist first (L9, per P-L9):** tensor product ⊗, two-spin basis \|uu⟩…, product state, entangled state,
singlet, composite system, the penny-and-dime correlation. Reused from L1–L7: `hidden-label`, `mixture`, `bloch-ball`,
`expectation`, `pauli-matrices`, `compatible`, `commutator`, `identity-operator`, `purity`, `density-operator`.

## 6. Review cards (≤ 5 points; each number is a unit claim)
- **local**: local operators act on one slot; they commute across parts · eq `Z_A = Z\otimes I,\ [A_A, B_B] = 0` · trap: applying Z_A to Bob's label.
- **empty-centre**: ⟨X_A⟩ = ⟨Y_A⟩ = ⟨Z_A⟩ = 0; P = ½ on every axis; centre without ignorance · eq `\vec r_A = (0,0,0)` · trap: "centre means we don't know the pair's state".
- **correlations**: XX = YY = ZZ = −1 with certainty; mismatched axes give 0 · eq `Z_AZ_B|sing\rangle = -|sing\rangle` · trap: ZZ = −1 alone is classical-looking.
- **instructions**: tables reproduce matched-axis data; locality defined · eq `A_Z = -B_Z,\ A_X = -B_X` · trap: shared randomness is not communication.
- **ghz-game**: four inputs, parity rules, "always −1" wins 3 · eq `\text{ZZZ: even};\ \text{ZXX, XZX, XXZ: odd}` · trap: bits vs signs.
- **no-table**: product of the four conditions: +1 = −1; P ≤ ¾ · eq `(A_ZB_ZC_Z)(A_ZB_XC_X)(A_XB_ZC_X)(A_XB_XC_Z) = +1` · trap: "randomizing helps".
- **quantum-wins**: \|G⟩ is an eigenstate of all four products; single answers stay random · eq `ZZZ|G\rangle = +|G\rangle,\ ZXX|G\rangle = -|G\rangle` · trap: product +1 ≠ all +1.
- **what-ghz-proves**: no λ-table fits; Bell inequality tested; no signalling · eq `P_{\rm win}^{\rm LHV} \le \tfrac34 < 1 = P_{\rm win}^{\rm QM}` · trap: "Alice's choice changes Bob's spin".

## 7. Symbol-before-use (first beat)
⊗, \|ud⟩ family, \|sing⟩: L9 (mapped in `Lecture.symbols` to `l10-local:b1` as recap) · X, Y, Z: l10-local:b2 · Z_A, X_B, I: b3 ·
[A_A, B_B]: b4 · σ, τ (Susskind): b5 (named, not reused) · ⟨Z_A⟩: l10-empty-centre:b1 · n̂, σ_n̂, r⃗_A: b3 · r⃗_avg, p_i: b4 ·
ρ_A: b6 · z_A z_B: l10-correlations:b1 · T, θ (path): b4 · A_Z, A_X, B_Z, B_X: l10-instructions:b1 · H_ABC, \|0⟩, \|1⟩,
\|000⟩: l10-ghz-game:b1 · ZXX: b2 · C_Z, C_X, s: l10-no-table:b1 · P_win: b3 · \|G⟩: l10-quantum-wins:b2 · λ, A_Z(λ):
l10-what-ghz-proves:b1–b2. (Never used: the notes' input bits x, y, z and output bits a, b, c.)

## 8. Errata and consistency fixes (no physics error found in L10 or L11 §§11.1–11.3)
1. **Missing page:** footers read "n / 18", the PDF has 17 pages. Ask the user for p.18 (it may hold exercises).
2. **Count:** p.17 announces four ideas to retain and lists three. The app says three (consistency fix, not an erratum).
3. **Names (ruling 7):** L11 pp.3–8 call the third player "Davie" and the referee "Charlie", while L10 makes Charlie the
   third player. The app: Alice, Bob, Charlie and "the referee"; D_Z, D_X become C_Z, C_X.
4. **Recommendation:** §10.5 has "Charlie" prepare the two-particle instruction tables; Charlie is a game player two
   units later. Say "the source" in unit 4 (Charlie keeps his L9 penny-and-dime role in the link-back only).
5. **Labels:** L10 writes A₀/A₁ (by input bit), L11 A_Z/A_X (by measurement); the app uses A_Z/A_X (Rosetta R2).
6. p.12 says the classical optimum "is" ¾, L11 p.4 "≤ ¾": consistent (the bound is reached). Not an erratum.
7. p.1's plan puts the no-signalling point in class 10; its text is L11 p.9. Covered in unit 8.
8. Teaching-plan timestamps overlap (p.12 "57–64", p.14 "57–71"); not shown in the app.

## 9. Engine, stage and widget gaps
**9.1 Engine (skill 11; numpy twins in `pipeline/make_fixtures.py`):**
- **E1** `physics/qc/state.ts superpose(content)`: equal-weight signed sum of distinct basis strings, e.g.
  `'000-011-101-110'` → ½(…); `bell` is its two-term case. Twin: the four amplitudes and the norm.
- **E2** `physics/qc/bits.ts`: generalize `merminInstructionSets` to `instructionSets(rows, targets)` (any rows of
  1–3 letters over two settings per player); `ghzGame()` = rows GAME, targets TGT → 64 tables with row products, wins,
  `maxWins` 3, win histogram {1: 32, 3: 32}; `ghzQuantumWin(psi)` → per input (1 + t·⟨P⟩)/2 via `expectationN`;
  `ghzRound(strategy, input, rand)` → three ±1 answers (table lookup, or a sample of `localBasisProbs` with the
  input's bases via `sampleCounts`). Mermin becomes `instructionSets(['XXX','XYY','YXY','YYX'], MERMIN_TARGET)`, so
  both courses share one function. Twins: histogram, the T1 and all-(−1) tables, quantum win 1 per input.
- **Hazard (found while planning):** `qc/gates.ts applyGate` works IN PLACE (documented). A values file that applies a
  gate to a shared constant (the singlet, \|G⟩) silently changes it for every later claim; my first scratch run read a
  CHSH score of 0 that way. L10.values.ts must copy (`applyGate(psi.slice(), …)`) or use `on(…)` circuit sources.
**9.2 Stage contracts (all additive to existing SVG kinds; no new kind for L10):**
- **A1** `TwoQubitSource.family`: `{family:'cos-sin'; thetaDeg; pair?: '00+11' | '01-10'}`; '01-10' is cos θ\|01⟩ −
  sin θ\|10⟩ (θ = 0: \|ud⟩; 45°: singlet). Draws the signature morph; \|r_A\| = cos 2θ. Fallback: two beats (UD, SING).
- **A2** `AmpSource` `{terms: string}` (E1), valid wherever AmpSource is (amplitudes, tableau `state`, rho, `reduce`).
- **A3** `MatrixTableauState.targets?: Record<string, 1 | -1>`: a "needed" column; with `values`, a ✓/✗ per row and
  "wins k of 4"; with `state`, ✓ when the eigenvalue equals the target. Validate keys against rows.
- **A4** `AmplitudesState.inBasis` also takes one local basis per spin, e.g. `['z','x','x']` (bars = outcome chances,
  labelled ±; engine `localBasisProbs`), and `labels: 'ud'` for two-spin bars (\|uu⟩ … \|dd⟩) before the 0/1 relabel
  (`labels:'ud'` is optional: a Rosetta caption can replace it).
- **A5** 448 pages use SVG kinds (ruling 5): the SVG kinds' FIDELITY entries live in `content/qc709/fidelity.ts`
  (registered with the lazy 709 pack); move them to a shared module the stage chunk loads, or the 448 drawer is
  empty. 448 passports for amplitudes/matrix/two-qubit: keep 709's text (it names \|0⟩ = \|+z⟩, as 448 now does).
- **A6** Chunk contract (`app/build/chunks.test.ts`, ruling 5): (h) "no Physics 709 module (content/qc709/,
  physics/qc/) in the entry closure" → keep physics/qc out of the entry, but reword it as "709 content or the shared
  qc engine" since physics/qc is shared; (i) "no chunk holds both 709 modules and a 448 lecture's content" → "no chunk
  holds both 709 *content* (content/qc709/) and a 448 lecture's content", with `is709` split into `is709Content`;
  (m) "no 448 lecture chunk holds or statically imports one (448 never uses them)" → "no 448 lecture chunk statically
  imports an SVG kind module (lectures name kinds by data; the kinds' chunk stays lazy)".
- **A7** `Unit.classStart?: { lecture: number; note: string }` (class marker, ruling 1).
- **A8** Derivation lint: `content.test.tsx` requires `formal.length > 0` for every chapter; 448 has one track. Either
  W checks only `COURSES[course].tracks`, or 448 authors copy `ground` into `formal`. Plan assumes the copy.
- **A9** Go-deeper boxes: `Unit.deeper?: { title; text; stage?: StageLayout; claims: Claim[]; refs?: Ref[];
  bridge?: string }[]`, drawn after the review card as a collapsed "Go deeper · beyond the notes" box (Read and print
  too; claims ledger covers it). Alternative: `beyondLecture` beats, but phase order L → B → C would put them inside
  the notes' argument.
- **A10** 448 → 709 bridges: `BridgeTarget` already allows `course:'qc709'`, but the table lives in the lazy 709 pack,
  `ReturnPlace.course` is fixed to 'qc709', and `parseReturn` checks only the 709 registry. W adds a 448 bridge table
  registered by the lecture chunk (ids like `to-q7-observables`; courses.test needs a 448 bridge-id rule) and a
  `ret` for 448 places ("↑ Back to Spin Lab 10.7"), validated against `LECTURE_META`.
**9.3 Widgets:**
- **W1** `two-spin` (new, lazy, physics/qc): draws the `two-qubit` scene from controls, as `ComplexPlaneQc` does for
  `complex-plane`. Props: `state: 'singlet' | 'ud' | 'path'`, `theta?`, `axisA?`, `axisB?: 'x'|'y'|'z'`, `seed?`.
  "Measure N pairs" samples `localBasisProbs`; tallies: Alice +1 share, Bob +1 share, product −1 share.
- **W2** `ghz-game` (new; ONE component shared with the Arcade kind): props `mode: 'pair' | 'table' | 'quantum' |
  'both'`, `rounds?`, `seed?`, `proof?` (shows the four row products and their product). Six ±1 toggles, a referee
  button (uniform input), a ledger, per-input wins; quantum answers from `ghzRound(G, …)`. Never reports a win rate
  above ¾ for a table: the verdict comes from `ghzGame()`.

## 10. Media
No Blender or film in this chapter. Optional Higgsfield decor (atmosphere only, user approval needed): none proposed.

## 11. Hooks
**Concept map (448 `concepts.ts`):** `local-operators` (l10-local; needs L9's tensor-product station, `commutators`) ·
`empty-centre` "A known pair, unknown parts" (l10-empty-centre; needs `mixtures`, L9 entanglement) · `correlations`
(l10-correlations; needs `empty-centre`) · `instruction-tables` (l10-instructions; needs `correlations`) ·
`ghz-classical` "No table wins the GHZ game" (l10-no-table; needs `instruction-tables`) · `ghz-quantum` (l10-quantum-wins;
needs `ghz-classical`, `local-operators`) · `bell-ghz` "No local hidden variables" (l10-what-ghz-proves; needs
`ghz-quantum`). 709 `sameAs` edges W may add: `qc-mermin-observables` → `ghz-quantum`, `qc-lhv` → `instruction-tables`,
`qc-no-signalling` → `bell-ghz`.
**Arcade (skill 13):** new game **"GHZ game"** (kind `'ghz-game'`, `GameKind` union + `GamePage` branch, component W2):
L1 "Three of four" (submit any table winning 3; verdict `ghzGame()`), L2 "Four of four?" (attempt, then choose the
reason: the four products multiply to +1, the targets to −1), L3 "Share \|G⟩" (20 engine-sampled rounds, all wins,
Alice's −1 share between 0.3 and 0.7 shown), L4 "Call the loss" (predict which input a given table loses). Spot the
error rounds: `l10-local` (Z_A applied to Bob's label), `l10-empty-centre` ("⟨Z_A⟩ = 0, so Alice holds \|+x⟩"),
`l10-correlations` ("after Alice reads +1 on z, Bob's x is certainly −1": engine P = ½), `l10-what-ghz-proves`
("Alice signals by choosing X or Z": marginal ½).
**Go further in 709 (A10):** l10-local → F6 `f6-operator`; l10-empty-centre → Q9 `q9-partial-trace`; l10-correlations →
Q6 `q6-parities`, Q10 `q10-chsh` (Go deeper 1); l10-instructions → Q10 `q10-hidden`; l10-quantum-wins → Q7
`q7-observables` (Go deeper 2); l10-what-ghz-proves → Q10 `q10-no-signal`.

## 12. Fidelity notes
`two-qubit`: the arrows are reduced Bloch vectors (exact); a length-0 arrow is drawn as a dot "at the centre", never
hidden. The grid is exact. `matrix` tableau: row products and eigenvalues exact; the ✓/✗ marks are engine verdicts.
`amplitudes` (default mode with dials, never 'signed': its mean line means nothing here) with `on(…)` sources: the bars are the state after the operator, not after a measurement (caption says
"applied", never "measured"). `bloch-ball` (b4–b6): reused L6 fidelity items `ball-centre`, `ball-recipe`.

## Rulings requested
1. Class marker as `Unit.classStart` on `l10-quantum-wins` (Class 11 opened with the quantum strategy), §11.1 folded into unit 6?
2. Use Lecture 11's names throughout (A_Z/A_X, ±1 answers, instruction strings), with one Rosetta beat for L10's bits?
3. Unit 4: call the instruction-table preparer "the source" instead of Charlie (§8 item 4)?
4. Go-deeper boxes as a new `Unit.deeper[]` (A9), not `beyondLecture` beats?
5. Additive stage fields A1–A4 (singlet path, `{terms}` source, tableau `targets`, `labels:'ud'`); A4 may be dropped?
6. Chunk-contract rewording (A6) and moving the SVG kinds' fidelity to a shared module (A5)?
7. One `ghz-game` component for the Try-it and the Arcade (W2), plus `instructionSets` shared with 709's Mermin (E2)?
8. Ask the user for L10 p.18 before the build?
