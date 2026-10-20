# P-448-townsend-B review: Townsend pass, Lectures 5-8 and 11-13 (independent reviewer P)

Scope: `git diff 9df157d..HEAD` of `app/src/content/L{5,6,7,8,11,12,13}*`, the `spin-ladder` kind, the plot-curve tables, rulings T1-T11, plans G2 and G4. Read-only; no suites, no Playwright, no screenshots.

## Verdicts

| Lecture | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| L5 | PASS with fixes | 0 | 1 | 0 |
| L6 | PASS with fixes | 0 | 2 | 0 |
| L7 | FIX-FIRST | 1 | 4 | 3 |
| L8 | PASS with fixes | 0 | 2 | 3 |
| L11 | FIX-FIRST | 1 | 0 | 3 |
| L12 | PASS with fixes | 0 | 1 | 2 |
| L13 | PASS with fixes | 0 | 4 | 2 |

## Evidence
- Recomputed with my own numpy/scipy (explicit matrices, `expm`, `eigh`, `solve_ivp` for the full Rabi equation, `quad` overlaps, a 4x4 linear solve for the barrier; no repo engine, no planner script): 130+ values, every displayed digit, all 30 practice answers and the 5 integer/scan answers (N = 49, 240 deg, 315 deg). All agree. The one number I could not reproduce as "the real thing" is B1.
- Page images read (printed p. = PDF - 16): 60 pages, see the citation sample. Not re-read (cited, unverified): PDF 140-147 (Eqs. 4.34-4.43, 4.48-4.56), 229-237 (Eqs. 6.78-6.86, 6.99-6.110), 244-245 and 249-250 (Eqs. 6.117-6.136 on OCR-only PDF 244, Eqs. 6.147-6.149 on OCR-only PDF 249-250), 55-57 and 80 (Ex. 2.5, 2.116-2.120). Their numbers were recomputed independently (R + T = 1, matching conditions, thick-barrier ratio).
- p. 231 Correction (T5): re-read on the image (PDF 247): the page prints "the transmission probability is 0.68" for 5 eV, 10 eV, 0.53 A. My 4x4 solve gives 0.70610 (qa = 0.60715; Bohr radius 0.529177 A gives 0.70683). Correction row `L13.ts:39-44` is right, evidence real, `check()` tests the claim (T within 1e-3 of 0.7061 and more than 0.02 from 0.68). PASS.
- Copyright (T11): 6-word and 5-word overlap sweeps of every new text, caption, why, prompt, hint and walkthrough line against `sources/townsend/text.md` and `sources/L{5,6,7,8,11,12,13}/text.md`: no sentence-level tracking. Only stock runs ("is a constant of the motion", "the ground state of", "to the left of the step"). The digests share 6-grams in four places (planner prose, not source). PASS.
- Dangling ids: scripted check of every `lN-unit:bK` string in `app/src`, `app/e2e`, `pipeline`, `docs/context`, `docs/specs`, `skills`: no live reference to a renamed id. Stale only in two code comments (`L13.story.ts:8`, `L12.story.ts:12`) and the generated packs (N6).
- Counts (T1): L5 4, L6 5, L7 5, L8 5, L11 5, L12 4, L13 4, all with `practice`, 3 hints, walkthrough. T3: the four books-only units (`l7-ladder`, `l12-driven`, `l13-stationary`, `l13-flow`) open with the lede in `b1` and carry `lecture.pages` saying so. T4: digits only in B1.
- Plot curves: `polChain`, `stepR`, `stepT`, `barrierT`, `barrierThick`, `ammoniaLevel`, `ammoniaLevelWeak`, `spinFringe`, `spinFringeOther`, `rabiFlip`, `rabiFlipOff`, `rabiPeak`, `bellBisectGap` each appear exactly once in `PlotCurveName` (`stage.ts:770`) and once in `CURVE_FNS`, `DEFAULT_RANGE`, `CURVE_NAME` (`plot.ts:86-101, 121-133, 152-164`), once in `CURVE_X`; the optional `CURVE_BOUNDS` lacks the three ammonia/Bell curves (allowed). No duplicate key anywhere (the union-merge is clean).
- `spin-ladder`: `spinLadder.ts` takes every level, chance, weight, entry, length and cone from `angmom.ts`; `SpinLadderScene.tsx` draws exactly what the l7-ladder beats claim (levels, J+ arrow with the engine weight or a stop, bars of `zChances`, exact matrix, |J| against j with the cone caveat and `spin-ladder-cone` on b5). One label defect, S7.

## Blocking

| # | Where | Problem | Exact fix |
|---|---|---|---|
| B1 | `L11.story.ts` `l11-two-level:b7c` text (the "23.98 billion", "41.7 picoseconds", "99.2 micro-electron-volts" sentence), claims `l11TAmmFreqGHz`, `l11TAmmPeriodPs`, `l11TAmmEnergyUeV` | T4 breach and a displayed-number error. Townsend p. 130 gives only "1 1/4 cm" and "10^-4 eV" and p. 131/134 say "24 GHz". The beat turns the rounded wavelength into four-digit values as if they were the molecule's own; the real inversion line is 23.87 GHz (period 41.9 ps), so 23.98 and 41.7 are wrong in the third digit. | Replace the sentence by words with no digits: "that rounded wavelength puts the oscillation near twenty-four billion times a second and the gap near a ten-thousandth of an electron-volt, as Townsend says". Keep the three keys only as engine checks (not printed), or drop them with their twin rows. |
| B2 | `L7.story.ts` `l7-ladder:b6` text (sentence "Townsend's Ex. 3.5 takes the S_y = 0 beam instead: 0.5 up, 0.5 down and 0 in the middle") and its claims `l7TSgY0up`, `l7TSgY0mid` | Spoils the clue `l7-ladder:b7` that follows ("S_y = 0 beam, any atoms through the S_z = 0 exit?"): the answer is printed one beat earlier. | Delete the sentence and the two claims from `b6` (keep them on the clue reveal); leave Ex. 3.5 in `b6`'s `refs`. |

## Should-fix

| # | Where | Problem | Exact fix |
|---|---|---|---|
| S1 | `L7.ts` `l7-p-eqproduct` (key `l7PEquatorProduct`) | New numbers rule (T1): it is the beat's own example. `l7-uncertainty:b6b` step 5 (`L7.story.ts:900`) shows the equator at phi = 60 deg with spreads on screen and prints 0.011719 = (DeltaS_x DeltaS_y)^2; the answer 0.1083 is its square root. | Use phi = 20 deg: product sin(40 deg)/8 = 0.0803; update prompt, walkthrough ("r_x = 0.9397, r_y = 0.3420"), key, twin, fixture. |
| S2 | `L13.ts:1065` `l13-pr-step` | Answer printed in the same unit: `l13-flow:b2` text states "At E = 3V_0 they are 0.0102 and 0.9898" and plots the marker at 3. | Use E = 1.5 V_0: k_0/k = 1/sqrt3, T = 4kk_0/(k+k_0)^2 = 0.9282 (R = 0.0718); update hint 3, walkthrough, key. |
| S3 | `L6.ts` `l6-p-ryx` (theta = 100 deg) and `l6-p-chancey` (70 deg, 200 deg) | Same numbers as the beats' worked examples: `l6-generator:b6d` (R_y(100 deg), polar angle 100 deg) and `l6-bloch:b7b` (70 deg, 200 deg). | Change to theta = 70 deg for `l6-p-ryx` ((1 + sin70)/2 = 0.9698) and phi = 130 deg for `l6-p-chancey` (0.8599); recompute keys. |
| S4 | `L6.story.ts` `l6-active:b6b`, derivation g1 and result: `|{\pm x}\rangle = R_y(90^\circ)|{\pm z}\rangle` | True only in Townsend's phase for |-x> (p. 53, Eq. 2.90, "differs from (2.15) by an overall minus sign"). With the lecture's |-x> = (1, -1)/sqrt2 (Unit 5.4), R_y(90 deg)|-z> = -|-x>; I confirmed it numerically. The amplitude <-x|psi> then flips sign; chances do not. | Add to the text and to g1's `why`: "for $|{-x}\rangle$ in his phase, which is minus ours (Unit 5.4); only an overall sign changes". |
| S5 | `L5.story.ts` `l5-inverse:b4b` text "p. 96, Eq. 3.91 and Eq. 3.93" | Eq. 3.91 is on p. 96, Eqs. 3.92-3.94 are on p. 97 (page images). | "pp. 96-97, Eq. 3.91 and Eq. 3.93". |
| S6 | `L8.story.ts` `l8-polarization:b5b` (stage, view 1, caption, text) | The view caption "the photon, then a polarizer a small angle away" is not drawn: the hilbert-plane has one arrow (no `others`). The beat caption "the photon (arrow) at 45 deg" has nothing to do with the chain, whose photon is polarized along the reference and whose first polarizer is phi/N away. Text: "its axis is crossed with the first" is wrong for N = 1 (there is no first). | Add `others:[{ket:{planeDeg:<phi/N>}, role:'basis'}]` or reword to "the photon's polarization; the curve counts the polarizers"; set the arrow to the reference (0 deg); text: "crossed with the photon's polarization". |
| S7 | `app/src/stage/svg/SpinLadderScene.tsx:124` | Matrix title reads "J^2 in hbar, z basis"; the entries (3/4, 2) are in hbar^2. | Title `J² in ħ², z basis` for `J2` (others stay "in ħ"). |
| S8 | `L7.ts` `l7-p-spin1chain` hints 1-2 and walkthrough | The unit teaches only the S_y = hbar column (theta = 90 deg). The two factors ((1 + cos t)/2)^2 and sin^2 t / 2 are stated, never derived; the solver cannot check them. | Add the eigenvector of S_n (J_n = cos t J_z + sin t J_x): ((1 + cos t)/2, sin t/sqrt2, (1 - cos t)/2) in the z basis, so the two factors are the squares of its first and middle entries (0.6747, 0.2934). |
| S9 | `L13.ts` `l13-pr-wall` walkthrough step 3 | "Check the method on the case of Ex. 6.6 with one wall moved to 2L: 0.360" is wrong: Ex. 6.6 moves both walls (0.7205, `l13-stationary:b4`); one wall to 2L is Problem 6.16(a) (32/(9 pi^2) = 0.3603, my quad agrees). | "the book's own Problem 6.16(a), one wall moved to 2L, gives 0.360 with the same steps". |
| S10 | `L13.ts` refs of `l13-pr-step`, `l13-pr-tunnel`; `L8.ts` refs of `l8-p-plate`, `l8-p-torque`; `L12.ts` refs "pp. 138-140" | Problem 6.22 asks to show Eq. 6.135 also holds for incidence from the right and 6.23 to derive Eq. 6.144 (p. 243); neither "asks for R and T" or "a numerical case". Problem 2.21 and 2.22 are on p. 74 (not p. 73), 2.12 on pp. 71-72. Problems 4.4-4.9 are on p. 139. | Say "the book's problem is a derivation; this one evaluates numbers", and fix the pages. |
| S11 | `glossary.ts:25` and `:330` | Duplicate id and term `g-factor` (L1 `l1-quantized:b5c` from G1; L12 `l12-driven:b1` from G4a). `GLOSSARY` is `new Map(...)`, so the later entry silently replaces the L1 definition and `first`. | Delete `:330`; add `'precession'` to the `uses` of `:25`; `l12-driven:b1` keeps `[[g-factor]]`. |
| S12 | `L13.story.ts` `l13-stationary:b2` text | "A solution that stays finite fits only at special energies, so the energies are quantised": true for bound states only (a free E > V never quantises). | "For a particle held between walls or in a well, a solution that stays finite fits only at special energies." |
| S13 | `L7.story.ts` `l7-ladder:b5` text and ref "p. 89, Fig. 3.4" | Fig. 3.4 is on p. 87; p. 89 carries Fig. 3.6 and the sqrt(j(j+1)) hbar lines (page images). | "p. 87, Fig. 3.4, and p. 89". |

## Nits

| # | Where | Note |
|---|---|---|
| N1 | sentence caps | `l8-polarization:b5b` first sentence 28 words; `l7-ladder:b6`, `l11-two-level:b7c/b7d`, `l13-momentum-space:b5a`, `l13-flow:b2` 26-27 counting citations. Two `why`s hold two sentences: `l7-uncertainty:b6b` g4, `l12-driven:b3` g5. |
| N2 | claim wording | `l8TQuarterUm` "of that crystal" (give delta n = 0.0091, 633 nm); `l7TCommDiag` omits "-i" (the beat prints -i 0.004996). |
| N3 | `l8-p-plate` prompt | "right-circular" for |C+> one beat after `b5b` warns that Townsend's right-hand naming is the opposite of optics usage: write "leaves in the state |C+>". |
| N4 | `l11-pr-eig` | Proof ordering, no numbers, tagged `homework` (plan: "HW3 type 4b"); it is Townsend Problem 2.23(b) (p. 74: eigenvalues of a unitary are e^{i theta}). Tag `townsend` with `refs`, or confirm with the owner that HW3 4b is not this problem. |
| N5 | `l7-p-spin1chain`, `l12-pr-sg-field`, `l12-pr-field-angle`, `l13-pr-wall`, `l7-p-spreadz/x` | Same statements as Townsend 3.20 (S_z = 0 variant), 4.4, 4.5, 6.16 (2L -> 3L), 1.3(c)/1.4 with new numbers: allowed by T1, closest to copying; vary the apparatus if cheap. |
| N6 | stale references | `L13.story.ts:8` comment `l13-momentum-space:b5` -> `b5a`; `L12.story.ts:12` comment `l12-law:b7`; `docs/context/generated/packs/L12.md:247`, `L13.md:207,352,356` (regenerate). Renaming old LECTURE beats `l8-turning:b4`, `l8-photon-spin:b5` to `b4a`, `b5a` only to free a slot breaks saved `ret=` links; harmless. |
| N7 | `l11-two-level:b7b` | "His H has zero mean energy, so the overall phase of our U(t) ~ R_z(omega t) is absent" is obscure: "his H = omega_0 S_z has no constant part, so U is exactly R_z". |
| N8 | `l12-pr-muon` | Prompt rounds the mass to 1.8835e-28; the key uses 1.883531627e-28 (1.98945 vs 1.98943). Inside tolerance. |

## Checked and right
Derivations (every step recomputed): `l5-inverse:b4b`, `l5-operators:b7b`, `l6-bloch:b7b`, `l6-generator:b6b-b6d`, `l7-compatible:b5b` (Rx Ry - Ry Rx = -(e^2/hbar^2)[Jx, Jy], vector entry 0.009967, spin entry -i 0.004996), `l7-uncertainty:b6b` (0.008789 + 0.015625 = 0.024414; Schwarz is an equality for a qubit), all six `l7-ladder` derivations (J^2 diagonal 3/4, 2, 15/4; weights sqrt2, 2, sqrt3; lean 54.74, 45, 39.23 deg; spin-1 S_y column (1, i sqrt2, -1)/2; spin-3/2 chances .375/.125/.125/.375), `l8-polarization:b5b` (N = 4, 10, 1000: .5308, .7805, .9975), `l8-photon-spin:b5b-b5c`, `l11-generator:b5b`, `l11-two-level:b7c-b7d` (flip at 90 deg, period 180 deg, 1.0440/1.0450, 1.4142/1.5), `l12-law:b7b`, `l12-motion:b5b-b5c`, `l12-driven:b3` (full equation: 1 - P = 3.9e-5), `b4`, `l13-momentum-space:b5b` (c = i|c|, 1.118 at t = 4), `l13-time:b6b`, `l13-stationary:b3-b4` (8/3pi, 0.7205, 0.2594), `l13-flow:b1-b4, b6` (0.9979). Photon naming, Eq. 4.44b typo and Ex. 5.1 stay out of the beats (T5).

## Citation sample (printed p., equations on it; all match the image unless marked)
p.26 Problem 1.3, Fig. 1.11 | p.36 Eqs. 2.29-2.30 | p.38 Eqs. 2.33-2.34, Fig. 2.3 | p.47 Eqs. 2.58-2.66 | p.51 Eqs. 2.81-2.82, Fig. 2.8 | p.53 Eqs. 2.90-2.93, fn 9 (S4) | p.54 Eqs. 2.94-2.95, Fig. 2.9 | p.55 Eqs. 2.96-2.99, fn 10 | p.61 Eq. 2.110 | p.62 Eqs. 2.111-2.114 | p.63 Eq. 2.115, Fig. 2.12 | p.65 Ex. 2.8, Eq. 2.121 | p.71-72 Problem 2.12 | p.72-73 Problem 2.13, Fig. 2.13 | p.74 Problems 2.21-2.23 (S10) | p.75 Sec. 3.1, Fig. 3.1 | p.81 Ex. 3.1 | p.82 Eqs. 3.22-3.24 | p.85 Eqs. 3.33-3.39 | p.86 Eqs. 3.40-3.44 | p.87 Fig. 3.4, Eqs. 3.45-3.50 (S13) | p.89 Fig. 3.6 | p.90 Eqs. 3.55-3.62 | p.92 Eqs. 3.64-3.71 | p.93 Eqs. 3.72-3.75, fn 7 | p.96 Eqs. 3.86-3.91 (S5) | p.97 Eqs. 3.92-3.97, Fig. 3.7 | p.98 Eqs. 3.98-3.103 | p.101 Eqs. 3.104-3.109 | p.102 Eqs. 3.110-3.115 | p.103 Fig. 3.10, Ex. 3.5 | p.106 Problems 3.1-3.5 | p.107 Problem 3.5(a-b) | p.109 Problems 3.20-3.23, Fig. 3.11 | p.111 Eqs. 4.1-4.2, fn 1 | p.112 Eqs. 4.3-4.8 | p.113 Eqs. 4.9-4.15 | p.114 Eq. 4.16 | p.115 Eqs. 4.17-4.19 | p.118 Eqs. 4.29-4.31, Ex. 4.1 | p.119 muon text | p.120 Fig. 4.2 | p.123 Ex. 4.2 | p.127 Figs. 4.5-4.6 | p.128 Eqs. 4.46-4.47 | p.130-131 text "1 1/4 cm", "24 GHz" (text.md; B1) | p.132 Eqs. 4.57-4.60 | p.133 Eq. 4.61, Figs. 4.10-4.11 | p.134 Eqs. 4.62-4.64 | p.139 Problems 4.3-4.12 | p.208 Ex. 6.2 | p.210-211 Sec. 6.7, fn 11-12 | p.212 Ex. 6.5 | p.218 Eqs. 6.97-6.98 | p.222 Ex. 6.6, Fig. 6.11 | p.230 Eqs. 6.137-6.143 | p.231 Eq. 6.144 (0.68), Ex. 6.7 | p.238-239, 241-243 Problems 6.1-6.24 (6.13, 6.16, 6.18, 6.22, 6.23).


## R fixes (fix pass, 2026-10-20; commits `8dba4e8` blocking, `fe58517` L5-L6, `0b348a4` L7-L8, `a64a009` L13, `f2e2e74` L11-L12, `f76807f` glossary and spin-ladder title)

Gates: `npx tsc -b` 0 errors; `npx vitest run src/content src/physics --reporter=dot` green, 123 files, 9881 passed and 1 skipped (the built-JS check; the verbatim test read `sources/`); `UPDATE_META=1` twice on `src/content`, no diff on the second run and no meta file changed; `pipeline/claims_448/g2a.py`, `g2b.py`, `g4a.py`, `g4b.py` twice, byte-identical. No Playwright, no screenshots, no full suite (lean run).

| Item | What changed | Proof |
|---|---|---|
| B1 | `l11-two-level:b7c` says the line is "about one and a quarter centimetres (pp. 130-131)", that the rounded figure puts the oscillation near twenty-four billion times a second and the gap near a ten-thousandth of an electron-volt, in words. `l11TAmmFreqGHz`, `l11TAmmPeriodPs`, `l11TAmmEnergyUeV` dropped with their values, claims, twin rows, fixture rows and the unused `constants` import | `L11.test.ts` T4 now forbids 23.9, 41.6/41.7, 99.1/99.2, "picosecond", "micro-electron-volt" and the three keys |
| B2 | the Ex. 3.5 sentence and the two claims `l7TSgY0up/mid` deleted from `l7-ladder:b6`; both stay on the `b7` reveal; Ex. 3.5 stays in `b6`'s refs | read; `content.test.tsx` claim lints |
| S1 | `l7-p-eqproduct` at phi = 20 deg: 0.0803; new keys `l7PEquatorRx` (0.9397), `l7PEquatorRy` (0.3420) for the walkthrough, `l7PEquatorProduct` and `l7PEquatorBound` keep their keys; twin `ket(90, 20)` | `L7.test` via `claims` fixtures |
| S2 | `l13-pr-step` at E = 1.5 V0: T = 4 sqrt3 - 6 = 0.9282, R = 7 - 4 sqrt3 = 0.0718; new keys `l13PrStepT/R` with claims on the unit; `l13TStepT3/R3` stay on `l13-flow:b2` | `L13.test.ts` key/claim closure |
| S3 | `l6-p-ryx` theta = 70 deg (0.9698, `l6PRyX`), `l6-p-chancey` phi = 130 deg (0.8599, `l6PChanceY`); hint 3 now "above one half"; twin changed with the values | fixtures |
| S4 | `l6-active:b6b` text and derivation g1 `why`: for $\|-x\rangle$ the relation holds in his phase, minus ours (Unit 5.4); only an overall sign changes | `symbols.test.ts` |
| S5 | `l5-inverse:b4b`: "pp. 96-97, Eq. 3.91 and Eq. 3.93" | read (page images p. 96-97) |
| S6 | `l8-polarization:b5b`: photon arrow on the reference (0 deg), captions say the photon's polarization and that the curve counts the polarizers, "crossed with the photon's polarization" | `L8.test.ts` |
| S7 | `SpinLadderScene.tsx`: the `J2` matrix title reads "J^2 in hbar^2, z basis" | `tsc`, the other matrices unchanged |
| S8 | `l7-p-spin1chain`: hints 1-2 and walkthrough 1 give the eigenvector ((1+cos t)/2, sin t/sqrt2, (1-cos t)/2) and say the factors are the squares of its first and middle entries; `\hat J_n` defined in the symbol map | `symbols.test.ts` |
| S9 | `l13-pr-wall` walkthrough: "the book's own Problem 6.16(a), one wall moved to 2L" | read |
| S10 | refs: `l13-pr-step` 6.22 and `l13-pr-tunnel` 6.23 say the book's problem is a derivation and give p. 243 (page image PDF 259); `l8-p-plate` 2.21 p. 74, `l8-p-torque` 2.12 pp. 71-72 and 2.22 p. 74 (PDF 90); `l12-pr-*` 4.4, 4.5, 4.7, 4.9 p. 139 (PDF 155). The `^Problem 6.\d+, end of Ch. 6` pattern of `L13.test.ts` kept | page images |
| S11 | the second `g-factor` entry deleted; `precession` added to the L1 entry's `uses`; `l12-driven:b1` keeps `[[g-factor]]` | `content.test.tsx` glossary lint |
| S12 | `l13-stationary:b2`: "For a particle held between walls or in a well, a solution that stays finite fits only at special energies, which are therefore quantised." | read |
| S13 | `l7-ladder:b5` text and ref: "p. 87, Fig. 3.4, and p. 89" | read |
| N1 | shortened: `l8-polarization:b5b`, `l7-ladder:b6`, `l11-two-level:b7c` (two sentences), `b7d`, `l13-momentum-space:b5a` (test regex for the beat opening updated), `l13-flow:b2`; `l7-uncertainty:b6b` g4 and `l12-driven:b3` g5 each one sentence under 25 words | `symbols.test.ts` |
| N2 | `l8TQuarterUm` claim gives delta n = 0.0091 and 633 nm; `l7TCommDiag` claim says "-i times 0.004996" | read |
| N3 | `l8-p-plate` prompt: "leaves in the state C+" | read |
| N4 | `l11-pr-eig` tagged `townsend` with a ref to Problem 2.23(b), p. 74 (PDF 90 confirms the problem); `L11.test.ts` expects that one tag | `L11.test.ts` |
| N5 | not applied: T1 allows these statements with new numbers, and a changed apparatus would rewrite hints and keyed answers for no review defect | none |
| N6 | the two header comments fixed (`L13.story.ts` `b5a`, `L12.story.ts` `b7a`); `docs/context/generated/packs/*` are untracked and rebuilt by the judge | none |
| N7 | `l11-two-level:b7b`: "His H = omega_0 S_z has no constant part, so his U is exactly R_z, with no overall phase" | `L11.test.ts` Rosetta test |
| N8 | `l12-pr-muon` prompt mass 1.88353e-28 kg (key unchanged, 1.883531627e-28) | read |

Claim keys: removed `l11TAmmFreqGHz`, `l11TAmmPeriodPs`, `l11TAmmEnergyUeV`; added `l7PEquatorRx`, `l7PEquatorRy`, `l13PrStepT`, `l13PrStepR`. `l6PRyX`, `l6PChanceY`, `l7PEquatorProduct`, `l7PEquatorBound` keep their keys; sentence/value and twin changed together. No disagreements with the review.
