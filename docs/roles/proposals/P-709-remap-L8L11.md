# P-709-remap-L8L11: Physics 709 re-mapped to the new notes edition, L7 §F.3 to L11 (P, 2026-10-17)

Proposal only (role P, skill `02-part-map`). It amends `P-709-remap-L1L7.md` (its chapter list, ownership rulings and Rosetta items stand where this file is silent) and
`P-709-map.md`. Notes pages are the printed page = the PDF page of the 58-page edition. Everything here is paraphrase; no source text is quoted.
Companion files: `P-709-remap-L8L11.citations.tsv` (machine-applicable) and the session numpy script `planL8L11-numpy.py` (output saved beside it; independent of the repo engine).

## 0. Summary

| Item | Content |
|---|---|
| Read | new notes pp. 35–58 in full (text) and page images pp. 52, 58; diff of new pp. 23–34 against old pp. 21–32; old pp. 33–40 for the migration; built `Q7–Q10`, `Q12` unit/beat/claim/glossary lists (`ids.json`); the context cards named in the brief; HW status |
| Citations | **384 edits on 361 lines in 41 files** under `app/src` (259 automatic +2, 125 content-mapped; 384 of 384 `old_text` strings verified unique on their line in the tree at plan time); 33 documents outside `app/` cite notes pages and are listed, not touched (§1.4); `meta.generated.ts` holds no cite |
| Sections | 25 sections from L7 §F.3 to L11 §E.1: **14 aligned, 7 partly, 4 new** (§2) |
| Deltas | **Q7: none. Q8: +2 beats, 1 derivation, 3 claims, 2 challenges, 2 glossary. Q9: +2 beats, 1 derivation, 5 claims, 2 challenges. Q10: +1 unit, +6 beats in all, 1 derivation, 11 claims, 5 challenges, 2 glossary. Q12: +2 units, +14 beats in all, 3 derivations, 29 claims, 8 challenges, 3 glossary. Sum: 24 beats, 6 derivations, 48 claims, 17 challenges, 7 glossary, 3 units** (§3) |
| Errata | **no physics slip in pp. 35–58** (every formula and number re-derived, §4.1). Two cross-reference slips (pp. 41, 54), no Correction box; one true claim that needs a caveat (degenerate Schmidt bases, p. 46) |
| New in the edition | a canonical form of ρ (p. 40); a worked unitary-freedom example, U = H (p. 41); a three-step purification proof with minimal ancilla and uniqueness (pp. 45–46); the whole of Lecture 10 (separable states, convexity, coherence criterion F, concurrence with the conjugation remark, partial transpose, entropy criteria, conditional entropy, the α-family) and Lecture 11 (EPR, Bell's three-direction inequality, CHSH, Tsirelson) |
| Engine gaps | 4 small functions (§7): `coherenceCriterion`, `conditionalEntropy`, `bellThreeDirections`, `purifyEnsemble`; no new stage kind |
| Rulings proposed | move nothing; link back (§2.2). Q12 gets two new units (`q12-coherence`, `q12-family`); Q10 gets one (`q10-bell`) |
| Notes section | content outlines for L1–L11 in §6 (L1–L7 short, L8–L11 full): 78 distinct claim keys (40 existing, 38 new), figures only from existing stage kinds |

## 1. Citations

### 1.1 Rules
| Old (OLD edition) | New | Basis |
|---|---|---|
| pp. 2–20 (L1–L4) | + 2 | page text unchanged (orchestrator's map; I did not re-diff pp. 4–22, the old file holds only pp. 21–40) |
| pp. 24–34 (L5 gates, L6, L7 §F.3 start) | + 2 | diffed: identical apart from the rewrites below |
| p. 21 | p. 23; the "2^N amplitudes, exponential" sentence is now on **p. 24** | a new first paragraph (the |0⟩ ≡ |+z⟩ remark) pushes text over |
| p. 22 | p. 24; the end of the Φ-cannot-factor argument is on **p. 25** | same drift |
| p. 23 | p. 25 | §A tensor product, (2.1) |
| old 33, 34 | 35, 36 (the L7 label stays) | §F.3, Mermin, (2.11)–(2.13) |
| old 34–35 (the GHZ box) | pp. 36–37 (§G) | |
| old 35 (ρ = \|ψ⟩⟨ψ\|, Tr ρ, Tr ρ² = ½) | p. 37; the entries ρ_ij and "coherences" are on p. 38 (§H) | |
| old 36 (⟨A⟩ = Tr(Aρ), von Neumann equation, mixtures) | p. 38; "Tr ρ² < 1", thermal example, \|0⟩/\|+x⟩ example on **p. 39**; label L8 | §H, §I |
| old 37 (Bloch ball (2.14)–(2.16); decomposition (2.17)–(2.20)) | p. 39; p. 40 (§I.1) | (2.14)–(2.20) keep their numbers |
| old 38, eq. (2.21) convexity | **p. 47, Eq. 3.3** (§III A); label L10 | Q8 keeps teaching it; only the cite moves |
| old 38 unique pure decomposition, "BHS p. 20" | p. 41 (a proof now stands there) | |
| old 38 unitary-freedom theorem (no number) | p. 41, **Eq. 2.22** | |
| old 38–39 reduced ρ, singlet, classical mixture (no numbers) | pp. 42–43 (§I.2); labels L8 | |
| old (2.22) general bipartite ρ | **(2.23)**, p. 43 | |
| old (2.23) S(ρ), p. 39 | **(3.28), p. 53**; label L10 | entropy moved after the criteria |
| old (2.24)–(2.28) Schmidt, p. 40 | same numbers, pp. 44–45; label L9 | §J.1 |
| old p. 40 "every ρ is a reduced pure state" | pp. 45–46, Eqs. 2.29–2.33 | §J.2 |

Rewrites on new pp. 23–25 and 28 (diffed against old pp. 21–23 and 26): **p. 23** gains the sentence fixing |0⟩ ≡ |+z⟩, |1⟩ ≡ |−z⟩ from here on; **p. 24**
the two-laboratory example reads |0⟩, |+x⟩ (it read |+z⟩, |+x⟩); the rest is re-flowed (page-break drift only, no new physics); **p. 28** now names the triplet and
singlet with the total-spin labels |S, M⟩ and explains why the spin letters |↑⟩, |↓⟩ appear there. Equation numbers (2.1)–(2.13) and (1.1)–(1.10) are unchanged.

### 1.2 Counts (TSV `P-709-remap-L8L11.citations.tsv`: `file  line  old_text  new_text`, every `old_text` occurs exactly once on its line, no two spans overlap)
| Class | Rows |
|---|---|
| L1–L4, pp. 2–20, +2 | 207 |
| L5–L7, pp. 24–34, +2 | 74 |
| old pp. 21–23 (the drift cases above) | 44 |
| old pp. 35–40 mapped by content (Q8, Q9, outline, values, review files) | 50 |
| equation-only changes (2.21 → 3.3, 2.22 → 2.23, 2.23 → 3.28) | 9 |
| **Total** | **384 rows, 361 lines, 41 files** (largest: `Q3.story.ts` 37, `Q2.story.ts` 30, `Q6.story.ts` 29, `Q1.story.ts` 27, `Q8.story.ts` 24, `Q4.story.ts` 23) |

Not rows, deliberately: bare equation cites whose number did not move ((2.9)–(2.20), (2.24)–(2.28)); section cites (§I.B, n2 §I.C.1 …, unchanged lettering);
448 cites that look alike ("448 L2 p. 7", "448 L3 p. 5", `schema.ts` doc examples) and Bergou, N&C and Axler pages. `physics/qc/bits.ts:228` is listed (2 rows) but is a file under `app/src/physics`.
Q2's three notes-Corrections (`where: 'p. 9, Eq. 1.3'`, `'p. 9'`, `'p. 10'`) move to p. 11, p. 11, p. 12; their wording is unchanged because pp. 8–12 are unchanged (open item 9).
Q3's comment "p. 15's Û†ÂÛ" is a stale pre-revision number; it maps to p. 19 (the L4 eigenproblem page, where the correction's own `where` now reads p. 19).
`outline.ts:91` becomes "notes L3–L4, pp. 13–22" (the L1L7 plan's §1.2 wording), and Q8/Q9's `src` strings become "L7 pp. 36–37, L8 pp. 38–41" and "L8 pp. 42–43, L9 pp. 44–46, L10 p. 53".
Apply with: for each row, `line = lines[n-1]`, assert `line.count(old_text) == 1`, replace once, write back (rows on one line do not overlap). After the TSV is applied, run `UPDATE_META=1 vitest run src/content/meta.test.ts` twice and `vitest run src/content`.

### 1.3 Stale statements that are not page cites (fix in the same pass)
| File:line | Says | Becomes |
|---|---|---|
| `Q12.ts:7` | "the notes stop at Lecture 7" | notes pp. 47–55 now cover coherence, concurrence, partial transpose, entropy (Q12's `lecture` phase gains beats, §3.5) |
| `Q16.ts:7`, `Q17.ts:7` | "the 709 notes do not reach it yet" | still true (L11 ends at CHSH); leave |
| `Q10.ts` unit `pages` | Bergou only | add "notes L10 p. 47; L11 pp. 56–58" to the matching units (§3.4) |
| `Q8.story.ts:532` | $E_Z = E_\downarrow - E_\uparrow$ | the notes now write E_1 − E_0 with |0⟩, |1⟩ (text sync, no new claim) |
| `Q9.story.ts` (i_1, i_2, \tilde v_{i_1}) | indices 1, 2 | the notes now index parties A, B (i_A, i_B): rename in both tracks, text only |

### 1.4 Documents outside `app/` that cite notes pages (historical; not migrated)
33 files: `docs/roles/proposals/` `P-709-map.md`, `P-709-NC.md`, `P-709-remap-L1L7.md`, `P-Q1`, `Q2`, `Q3`, `Q6`, `Q7`, `Q8`, `Q9-story.md`, `P-F1…F5-story.md` (15; the 448 files `P-L*-story.md` cite a different course and are out of scope);
`docs/roles/audits/` `P-F1…F6-review.md` and `P-Q1`, `Q3`–`Q9`, `Q12-review.md` (15); `docs/roles/decisions/qc709-nc.md`; `BUILD-LOG.md` (2 lines); `pipeline/claims_qc709/q7.py` (1 comment line).
Each keeps its old numbers; a reader maps them with §1.1. The brief does not ask for an edit of any of them.

## 2. Ownership of the new sections

### 2.1 Every section, L7 §F.3 to L11 §E.1 → chapter · unit
Tag **A** aligned (the chapter already teaches it; a cite change only), **P** partly (a delta in §3), **N** new (no home before).
| Notes § (page; equations) | Content | Owner · unit | Tag |
|---|---|---|---|
| L7 §F.3 (p. 35; 2.11–2.12) | Ô_XXX … products, eigenvalue equations, zero dispersion | Q7 `q7-observables` | A |
| L7 §F.3 (p. 36; 2.13) | Mermin contradiction, operator product keeps the sign | Q7 `q7-mermin` | A |
| L7 §G (pp. 36–37) | the GHZ box, mixture against superposition, ρ12 = Tr₃, ρ = \|ψ⟩⟨ψ\|, Tr ρ = 1, Tr ρ² = ½ | Q8 `q8-why`, `q8-pure-rho`, `q8-mixed` | A |
| L8 §H (p. 38) | ρ_ij, coherences, ⟨A⟩ = Tr(Aρ), iħρ̇ = [H, ρ] | Q8 `q8-pure-rho`, `q8-trace-rule` | A |
| L8 §I (pp. 38–39) | Σ p_n\|ψ_n⟩⟨ψ_n\|, Tr ρ² < 1, thermal tanh, \|0⟩/\|+x⟩ example | Q8 `q8-mixed` | A |
| L8 §I (p. 39; 2.14–2.16) | ρ = ½(I + n·σ), det ρ, n_j = Tr(ρσ_j) | Q8 `q8-ball` | A |
| L8 §I.1 (p. 40; 2.17–2.20) | one ρ, several ensembles; \|u±⟩ and weights | Q8 `q8-recipes` | A |
| L8 §I.1 (p. 40; 2.21) | **canonical form**: eigen-ensemble, distinguishable members, degenerate case | Q8 `q8-recipes` | **P** |
| L8 §I.1 (p. 41) | a pure state has one recipe, with proof; "corners" of the set | Q8 `q8-recipes` | **P** |
| L8 §I.1 (p. 41; 2.22) | unitary freedom, worked as U = H | Q8 `q8-recipes` | A |
| L8 §I.2 (pp. 42–43; 2.23) | ρ_A = Tr_B, singlet → ½I, classical twin, general ρ | Q9 `q9-partial-trace`, `q9-same-part` | A |
| L9 §J.1 (pp. 44–45; 2.24–2.28) | Schmidt form, rank, equal spectra, the Gram–Schmidt aside | Q9 `q9-schmidt` | A |
| L9 §J.2 (pp. 45–46; 2.29–2.30) | purification and its three-step proof; minimal ancilla = rank; pure needs none | Q9 `q9-purification` | **P** |
| L9 §J.2 (p. 46; 2.31–2.33) | purifications differ by U_B | Q9 `q9-purification` | **P** |
| L10 §III intro (p. 47; 3.1–3.2) | separable and entangled states, α\|01⟩ + β\|10⟩, mixed definition | Q10 `q10-separable` | **P** |
| L10 §III A (pp. 47–48; 3.3) | convexity of ρ, Bloch segment, extremal points, the separable subset | Q8 `q8-recipes` (convexity) + Q10 `q10-separable` (link-back, separable subset) | **P** |
| L10 §B.1 (pp. 48–50; 3.4–3.12) | coherence criterion, F ≤ ½, necessary only | Q12 **new `q12-coherence`** | **N** |
| L10 §B.1 (pp. 49–50; 3.12–3.15) | the α-family, both parts ½I, F = α | Q12 **new `q12-family`** | **N** |
| L10 §B.2 (pp. 50–51; 3.16–3.21) | Wootters concurrence, conjugation, E_f, C = 2\|det Λ\|, family C(α) | Q12 `q12-concurrence`, `q12-family` | **P** |
| L10 §B.3 (pp. 52–53; 3.22–3.27) | partial transpose, local-unitary invariance, σ(α), det σ, eigenvalues | Q12 `q12-ppt`, `q12-family` | A (σ(α) in the family unit) |
| L10 §C (p. 53; 3.28–3.30) | S(ρ), pure 0, ½I one bit, log₂ d, S(A) = S(B) | Q9 `q9-entropy` | A |
| L10 §C (pp. 53–54; 3.31–3.32) | rank one ⇔ product, maximum by relative entropy, S = h(λ) | Q9 `q9-entropy`, `q9-schmidt` | A |
| L10 §C.1 (pp. 54–55; 3.33–3.35) | conditional entropy S(A\|B), negative ⇒ entangled, the α-family gap | Q12 `q12-entropy` (+ `q12-family`) | **N** |
| L10 §D, L11 §E (pp. 55–57; 3.36–3.44) | singlet P(a,b) = −a·b; EPR, A(a,λ), Bell's three-direction inequality, 0.707 against 0.293 | Q10 **new `q10-bell`** | **N** |
| L11 §E.1 (pp. 57–58; 3.45–3.47) | CHSH, S = −2√2 at the stated angles, Tsirelson, no-communication | Q10 `q10-hidden`, `q10-chsh`, `q10-violation`, `q10-no-signal` | A |

Totals: 13 A (rows tagged A, counting the rows of Q7–Q9 and the CHSH row), 6 P, 4 N; no row is unowned.

### 2.2 Order differences and rulings (proposed; default is to move nothing)
| Difference | Ruling |
|---|---|
| Entropy now follows the entanglement criteria (L10 §C) | **Keep S in Q9** (`q9-entropy`): Schmidt and purification need it, and Q12 reads it. Q9 gets a Formal link-forward line; the notes pages explain it in the order printed |
| Convexity moved from the density-matrix lecture to L10 §III A | **Keep in Q8**; Q10 `q10-separable` adds a link-back beat that names the separable set as a convex subset (defines nothing new) |
| Conditional entropy sits with entropy in the notes | **Q12 `q12-entropy` owns it** (it is a detection criterion); Q9 forward-links |
| Schmidt and purification come after the bipartite ρ (L9), before entanglement | matches Q9's unit order; no change |
| Bell's three-direction inequality precedes CHSH in the notes | Q10 gains `q10-bell` before `q10-chsh`; Bergou's CHSH-first order stays for `q10-hidden` (instruction sets) |
| α-family used by four criteria on pp. 49–55 | one capstone unit `q12-family` after `q12-concurrence`; the criteria units cite it forward |
| |0⟩, |1⟩ and A, B labels replace |↑⟩, |↓⟩ and 1, 2 | notation sync only (§1.3); Rosetta in §4.2 |
| Concept owners unchanged | separable (Q10), ρ and convexity (Q8), S, Schmidt, purification (Q9), criteria and E_f (Q12), CHSH and Tsirelson (Q10), GHZ and Mermin (Q7, Q12 links back) |

## 3. Deltas per chapter

Rules for every delta: new notes content takes `phase: 'lecture'` (units that so far have only `books` beats keep the order lecture → books → clue → deeper); Ground-up ≤ 25 words a sentence, Formal ≤ 40;
a derivation has ≥ 2 distinct `view`s per track (Ground steps ≥ Formal steps); decimals use tolerance 0.005, integers 0; every claim key is chapter-prefixed, printed with `d`, `pct`, `tf` or `uf`, and has a numpy twin
in `pipeline/claims_qc709/qN.py` computed by a different route (the route is named after each value, and I ran it in `planL8L11-numpy.py`). Assigned homework: none open (§5), so walkthroughs may be full.

### 3.1 Q7 (GHZ and Mermin): no delta
Pages p. 35–36 re-cited by the TSV. The p. 37 remark that GHZ's three-party entanglement does not survive losing one qubit (unlike W) is already Q8 `q8-why`'s job; Q7 needs nothing.

### 3.2 Q8 (mixtures, ρ, Bloch ball): +2 beats in `q8-recipes`, 1 derivation, 3 claims, 2 challenges, 2 glossary
| Item | Content |
|---|---|
| `q8-recipes:b6` lecture, "The one recipe whose members can be told apart" (p. 40, Eq. 2.21) | Ground: the first recipe's members overlap (chance-like overlap 0.7071 between \|0⟩ and \|+x⟩), so one reading cannot sort them; diagonalizing ρ gives two orthogonal states \|u±⟩ with weights 0.854 and 0.146, alternatives a single reading can tell apart. For ½I every orthonormal pair works. Formal: ρ = Σ λ_i\|e_i⟩⟨e_i\| with ⟨e_i\|e_j⟩ = δ_ij, λ_i ≥ 0, Σλ_i = 1; unique for distinct eigenvalues, otherwise unique up to a basis inside each eigenspace; S (Q9) and the Schmidt weights (Q9) are built from the λ_i. Stage: `bloch-ball{recipe}` (chord of {\|0⟩, \|+x⟩} against the diameter through \|u±⟩) beside `matrix{spectrum:'bars'}` |
| `q8-recipes:b7` lecture + derivation, "Why a pure state has one recipe" (p. 41) | Steps: pure ρ = θρ₁ + (1−θ)ρ₂ ⇒ for \|ψ⊥⟩, 0 = θ⟨ψ⊥\|ρ₁\|ψ⊥⟩ + (1−θ)⟨ψ⊥\|ρ₂\|ψ⊥⟩ ⇒ both terms vanish ⇒ ρ₁, ρ₂ live on \|ψ⟩ ⇒ ρ₁ = ρ₂ = ρ (trace 1). Views (Ground): `bloch-ball{recipe}` chord through an interior point, then a surface point that no chord crosses; `matrix{rho, highlight}` on the ⟨ψ⊥\|ρ\|ψ⊥⟩ corner; Formal (3 steps, same two kinds) adds "extremal ⇔ pure" and points forward to Q10 (the separable set's extremal points are the pure products) |
| Claims (numpy route) | `q8CanonOverlap` = 0.7071 (\|⟨0\|+x⟩\| from kets); `q8CanonUOverlap` = 0 (\|⟨u₊\|u₋⟩\| from `eigh`); `q8PureEscape` = 0.25 (⟨1\|ρ\|1⟩ of ½(\|0⟩⟨0\| + \|+x⟩⟨+x\|), the weight a chord end leaks out of \|0⟩). Reuse `q8ZXRLen` (0.7071: the midpoint of two surface points is interior) |
| Challenges | `q8-r-canon` numeric warm-up, 0.7071 (overlap of the first recipe's members); `q8-r-pure` choice core: which state cannot be written as an equal mixture of two different states (the pure one), with `why` per option |
| Glossary | `qc-canonical-form` (first `q8-recipes:b6`; uses `qc-density-matrix`, `qc-spectral-representation`), `qc-extremal-point` (first `q8-recipes:b7`; uses `qc-convex-set`, `qc-bloch-ball`); no duplicates (`qc-convex-set`, `qc-unitary-freedom` exist) |
| Stage, engine | existing kinds only; no engine gap. Unitary freedom U = H (p. 41) is already `q8-recipes:b5` (`q8UHEigPlus`, `q8UHEigMinus`); my numpy gives U = [[1,1],[1,−1]]/√2 exactly, both rows true |
| Sync edits | thermal beat to E_1 − E_0, p_0, p_1; Rosetta line n ↔ r stays (open item 3) |

### 3.3 Q9 (reduced states, entropy, Schmidt, purification): +2 beats in `q9-purification`, 1 derivation, 5 claims, 2 challenges
| Item | Content |
|---|---|
| `q9-purification:b4` lecture + derivation, "The members need not be orthogonal" (p. 45; 2.29–2.30) | Ground: tie each member of {\|0⟩, \|+x⟩} (chance ½ each) to its own ancilla state; trace the ancilla out; the off-diagonal terms cancel since the ancilla states are an orthonormal set. N members need an ancilla of N states; the smallest is the rank (2 here); a pure state needs one. Derivation, three checks: a recipe exists (take the eigen-recipe); \|Φ⟩ is normalized (Σp_i = 1); Tr_B returns ρ. Views: `matrix{outer: Φ, blocks: 2}`, `{partialTrace:'B'}` → ρ, `bloch-ball` point of ρ_A; Formal merges checks 2–3 and keeps two kinds |
| `q9-purification:b5` lecture, "Two purifications, one turn of the ancilla" (p. 46; 2.31–2.33) | Ground: both purifications of one ρ_A carry the same weights and the same A basis; they differ by a unitary on B alone, Φ₂ = (I ⊗ U_B)Φ₁; ρ_A does not change; the vectors differ (overlap 0.5 for U_B = H). Formal caveat (our wording): with a degenerate eigenvalue the A basis is only fixed inside the eigenspace, so pick the same one for both. Stage: `matrix{outer, partialTrace}` before and after U_B |
| Claims | `q9PurNonOrthGap` = 0 (max entry of Tr_B\|Φ⟩⟨Φ\| − ρ, ρ from the outer products); `q9PurMinAncilla` = 2 and `q9PurPureAncilla` = 1 (`matrix_rank`); `q9PurOverlap` = 0.5 (\|⟨Φ\|(I⊗H)\|Φ⟩\|); `q9PurUBGap` = 0 (ρ_A unchanged by U_B) |
| Challenges | `q9-pu-anc` numeric core, integer 2 (smallest ancilla for ½(\|0⟩⟨0\| + \|+x⟩⟨+x\|)), tolerance 0; `q9-pu-nonorth` choice: why the cross terms vanish (orthonormal ancilla states, not orthogonal members) |
| Not added | Schmidt: aligned (the Gram–Schmidt aside is a `deeper` line at most); entropy: the notes' proofs (rank one ⇔ product; maximum by relative entropy; S = h(λ)) are already `q9-entropy`/`q9-schmidt` via S = h(½(1 + \|r\|)); add one Formal link-forward line to Q12 `q12-entropy` (S(A\|B)) |
| Sync edits | indices i_1, i_2, ṽ_{i_1} → i_A, i_B, ṽ_{i_A} in both tracks (text only); cites per the TSV |
| Engine | `purifyEnsemble(ps, kets)` (§7); `purify`, `schmidt`, `vonNeumann` exist |

### 3.4 Q10 (entanglement, no signalling, Bell): +1 unit, +2 beats, 1 derivation, 11 claims, 5 challenges, 2 glossary
| Item | Content |
|---|---|
| **new unit `q10-bell`**, after `q10-hidden` | Question: if the answers were fixed in advance by a hidden label, how far apart can two correlations be? `lecture.pages`: "notes L10 p. 55; L11 pp. 56–57, Eqs. 3.36–3.44". Books: Bergou §3.3 (as the unit's second source) |
| b1 lecture, "Opposite answers" (EPR, singlet; 3.36) | Ground: P(a, b) = −cos of the angle between analysers: −1 parallel, 0 perpendicular, −0.707 at 45°. EPR in words: reading one tells the other; the proposal is a label λ set at creation. Formal: P(a, b) = ⟨S\|(σ·a)⊗(σ·b)\|S⟩ = −a·b. Stage `plot{series}` (−cos θ, markers at 0°, 45°, 90°) + `two-qubit{axes}`. Claims `q10SingletPar` = −1, `q10SingletBis` = −0.7071, `q10SingletPerp` = 0 (`correlator` of the singlet; numpy kron of σ·a) |
| b2 lecture, "What a label must supply" (3.37–3.39) | A(a, λ) = ±1, B(b, λ) = ±1, A ignores b (locality), B(a, λ) = −A(a, λ); P(a, b) = ∫ p A B = −∫ p A(a)A(b). Rosetta: the notes write p(λ), not ρ. Sakurai's version: λ = (λ_a, λ_b, λ_c) ∈ {±1}³, so the integral is a sum over 8 rows. Stage `matrix{tableau, values}` (the 8 rows). Claim `q10BellAssignments` = 8 (`itertools.product`) |
| b3 lecture + derivation, "The inequality" (3.40–3.42) | P(a,b) − P(a,c) = −∫ p A(a)A(b)[1 − A(b)A(c)] ≤ ∫ p [1 − A(b)A(c)] = 1 + P(b,c). Ground 5 steps (write the difference; insert 1 = A(b)²; factor out the non-negative bracket; bound \|A(a)A(b)\| ≤ 1; read 1 + P(b,c)); Formal 3. Views: `matrix{tableau, values}` with the bracket column per row, and `plot{series}` of the two sides over the 8 rows. Claim `q10BellDetViol` = 0 (max over the 8 rows of \|P(a,b) − P(a,c)\| − (1 + P(b,c)), by enumeration) |
| b4 lecture, "Quantum mechanics says no" (3.43–3.44) | a ⊥ b, c the bisector: 0, −0.7071, −0.7071; left 0.7071, right 0.2929, ratio 2.414 ("more than a factor of two"). Stage `plot{series}` with the three markers. Claims `q10BellLhs` = 0.7071, `q10BellRhs` = 0.2929, `q10BellRatio` = 2.4142 |
| `q10-separable:b5` lecture + link-back, "Two terms, one condition" (p. 47; 3.1–3.2, 3.3) | α\|01⟩ + β\|10⟩ is entangled exactly when αβ ≠ 0 (det Λ = −αβ, Q6's test); a mixture of separable states is separable (the separable set is convex, Q8's convexity), its extremal points the pure products. Bridges `<<qc-q8-recipes|…>>`. Claims `q10FamDet` = 0.48 (\|det\| at α = 0.6, β = 0.8), `q10SepConvexGap` = 0 (T of a mixture against the mixture of T's, two fixed separable states) |
| `q10-no-signal:b5` lecture, "Non-local without being fast" (p. 58) | Bob alone sees fair coins; the pattern appears only when records are compared; no data moves. Reuses `q10Half` (no new number) |
| `q10-violation:b5` (edit) | add the notes' choice a = 0, a′ = π/2, b = π/4, b′ = −π/4 with three angles of π/4 and one of 3π/4: S = −2√2. Claim `q10NotesS` = −2.8284. Rosetta: the singlet gives −2√2, Q10's phase pair +2√2; both exceed 2 in size |
| Challenges | `q10-bl-lhs` numeric 0.7071; `q10-bl-det` numeric integer 0 (assignments that violate: none), tolerance 0; `q10-bl-which` choice (which assumption the proof uses: locality, ±1 answers, anticorrelation; not signalling); `q10-bl-rhs` numeric 0.2929; `q10-v-notes` numeric −2.8284 |
| Glossary | `qc-bell-inequality` (first `q10-bell:b3`), `qc-epr-paradox` (first `q10-bell:b1`); `qc-lhv-model`, `qc-local-realism`, `qc-tsirelson` exist |
| Bridges | rows `qc-l10-instructions` (448 `l10-instructions`), `qc-q8-recipes`; Q7's Mermin link-back already exists |
| Stage, engine | existing kinds; `bellThreeDirections()` (§7) |

### 3.5 Q12 (detecting and measuring entanglement): +2 units, +4 beats, 3 derivations, 29 claims, 8 challenges, 3 glossary
| Item | Content |
|---|---|
| **new unit `q12-coherence`**, first in the chapter | "Two numbers that betray entanglement": `lecture.pages` "notes L10 pp. 48–50, Eqs. 3.4–3.15"; four beats |
| b1 lecture (3.4–3.6) | a product pure state, the middle block of ρ: P₀₁ = \|a₀\|²\|b₁\|², P₁₀ = \|a₁\|²\|b₀\|², Q = a₀b₁a₁*b₀*, \|Q\| the product of four moduli. `matrix{rho, highlight}` |
| b2 lecture + derivation (3.7–3.10) | (\|a₀\|−\|b₁\|)² + (\|a₁\|−\|b₀\|)² + 2\|a₀\|\|b₁\| + 2\|a₁\|\|b₀\| = 2 ⇒ \|a₀\|\|b₁\| + \|a₁\|\|b₀\| ≤ 1 ⇒ P₀₁ + 2\|Q\| + P₁₀ ≤ 1 ⇒ F = (P₀₁+P₁₀)/2 + \|Q\| ≤ ½. Views: `amplitudes{ket: product}`, `matrix{rho, highlight}`; Formal adds `plot{series}` of F over a product-state sweep with a line at ½. Claims `q12CohProdA` = 0.32 (a = (1,0), b = (0.6,0.8)), `q12CohProdEq` = 0.5 (a = b = (1,1)/√2: equality) |
| b3 lecture (3.11) | mixtures: populations average, \|Q\| obeys the triangle inequality, so F ≤ ½ for every separable ρ; F > ½ ⇒ entangled, F ≤ ½ proves nothing; populations alone never show it (P₀₁+P₁₀ ≤ 1 ⇒ first term ≤ ½). Claims `q12CohPopMax` = 0.5, `q12CohSinglet` = 1 |
| b4 clue | "Is Φ⁺ caught?" F(Φ⁺) = 0 although maximally entangled: its coherence sits outside the {01, 10} block; a local flip X on qubit 2 gives Ψ⁺ with F = 1. Claims `q12CohPhiPlus` = 0, `q12CohFlip` = 1 (our observation; consistent with "necessary, not sufficient") |
| `q12-ppt:b6` lecture (pp. 52–53; 3.23–3.26) | local unitaries U_A ⊗ U_B send σ to (U_A* ⊗ U_B)σ(…)†, so its eigenvalues are basis-free; sufficient only for 2×2 and 2×3. Claim `q12PtLuGap` = 0 (fixed gates U_A = R_y(0.7)R_z(0.4), U_B = R_x(1.1), as literals in both languages) |
| `q12-concurrence:b6` lecture (p. 50) | the conjugation is not optional: ψ = (\|01⟩ − i\|10⟩)/√2 has C = 1 with σ_y⊗σ_y ψ*, 0 without; hidden when ρ is real. Claims `q12ConjC` = 1, `q12ConjCNo` = 0. Stage `amplitudes{ket}` of ψ and of ψ̃, `two-qubit{readouts:['concurrence']}` |
| `q12-concurrence:b7` lecture + derivation (p. 51; 3.18) | **pure-state C = 2\|det Λ\| in full** (HW3 submitted): ψ̃ = (−Λ₁₁*, Λ₁₀*, Λ₀₁*, −Λ₀₀*); ⟨ψ\|ψ̃⟩ = −2(Λ₀₀Λ₁₁ − Λ₀₁Λ₁₀)*; √ρ ρ̃ √ρ has one nonzero eigenvalue \|⟨ψ\|ψ̃⟩\|² ⇒ λ₁ = \|⟨ψ\|ψ̃⟩\|, the rest 0. Ground 5 steps, Formal 3; views `amplitudes{ket: ψ}` / `{ket: ψ̃}` and `matrix{coef: Λ, svd}` (s₁s₂ = \|det Λ\|). Claim `q12ConcLambda` = 0.96 (Λ = diag(0.6, 0.8)); product 0, Bell 1 by Q12's existing keys |
| `q12-entropy:b6` lecture (pp. 54–55; 3.33–3.34) | S(A\|B) = S(AB) − S(B): never negative classically, negative ⇒ entangled, only one way; pure pair: −S(B); Bell: −1 bit. `matrix{spectrum:'entropy'}`. Claims `q12CondBell` = −1, `q12CondPure30` = −0.8813 (= −h(0.3)), `q12CondCoin` = 0 (the coin pair ½(\|00⟩⟨00\| + \|11⟩⟨11\|): S(AB) = 1, S(B) = 1) |
| **new unit `q12-family`**, after `q12-concurrence` | "One family, four tests": the α-family ρ(α) = α\|S⟩⟨S\| + ((1−α)/2)(\|00⟩⟨00\| + \|11⟩⟨11\|) (3.12–3.13), pp. 49–55, Eqs. 3.14–3.15, 3.19–3.21, 3.27, 3.35; six beats |
| b1 lecture | the 4×4 matrix; both reduced states ½I whatever α (3.14), so single-qubit data hide α. `matrix{rho}` + `two-qubit{source:{rho}, arrows:'reduced', grid:'T'}`. Claim `q12FamRA` = 0 |
| b2 lecture (3.15, 3.27) | F = α; σ has eigenvalues α/2, α/2, ½, ½ − α; det σ = α²(1−2α)/16; both flip at ½. Claims `q12FamF06` = 0.6, `q12FamSigMin06` = −0.1, `q12FamSigMin08` = −0.3, `q12FamDet06` = −0.0045 |
| b3 lecture + derivation (3.19–3.21) | ρ real and spin-flip invariant ⇒ ρ̃ = ρ, R = ρ, λ's = spectrum {α, 0, (1−α)/2, (1−α)/2}; C = 2λ_max − 1; λ_max = α for α ≥ ⅓ and (1−α)/2 below (tie at ⅓) ⇒ C = max(0, 2α−1). Views: `matrix{spectrum:'bars'}` at α = 0.2, ⅓, 0.6; `plot{series}` of the four λ's against α. Claims `q12FamLamTie` = 0, `q12FamC02` = 0, `q12FamC06` = 0.2, `q12FamC08` = 0.6 |
| b4 lecture (3.35) | S(A\|B) = −α log₂α − (1−α)log₂((1−α)/2) − 1 turns negative only above 0.7729: the window ½ < α < 0.773 is entangled and missed. `plot{series}` of F, C, λ_min(σ), S(A\|B) with markers at ½ and 0.7729. Claims `q12FamSAB075` = 0.0613, `q12FamSAB08` = −0.0781, `q12FamSABThresh` = 0.7729, `q12FamSAB1` = −1 |
| b5 clue; b6 deeper | clue: which test is strongest here? (the criteria agree at ½; entropy is sufficient only); reveal E_f = 0.469 at α = 0.8 (C = 0.6). Deeper: CHSH max = 2√2·α exceeds 2 only above 1/√2, so ½ < α ≤ 0.7071 is entangled yet obeys CHSH (link Q10). Claims `q12FamEf08` = 0.4690, `q12FamChshThresh` = 0.7071, `q12FamChshAt08` = 2.2627 |
| Challenges (8) | `q12-ch-prod` numeric 0.32; `q12-ch-phi` choice (F(Φ⁺) = 0 means the test is silent); `q12-co-conj` numeric integer 0; `q12-co-det` numeric 0.96; `q12-en-cond` numeric integer −1 (tolerance 0); `q12-fa-c` numeric 0.2; `q12-fa-gap` numeric 0.7729; `q12-fa-which` choice (the entropy test) |
| Glossary | `qc-coherence-criterion` (first `q12-coherence:b2`; uses `qc-coherence`), `qc-conditional-entropy` (first `q12-entropy:b6`; uses `qc-von-neumann-entropy`), `qc-alpha-family` (first `q12-family:b1`) |
| Bridges | new rows `qc-q9-entropy`, `qc-q10-violation`, `qc-q8-ball` (all built units) |
| Stage, engine | existing kinds (`plot` series, `matrix`, `two-qubit`, `amplitudes`); `coherenceCriterion`, `conditionalEntropy` (§7). Rosetta in §4.2 |

### 3.6 Totals
| Chapter | Beats | Derivations | Claims | Challenges | Glossary | New units |
|---|---|---|---|---|---|---|
| Q7 | 0 | 0 | 0 | 0 | 0 | 0 |
| Q8 | 2 | 1 | 3 | 2 | 2 | 0 |
| Q9 | 2 | 1 | 5 | 2 | 0 | 0 |
| Q10 | 6 | 1 | 11 | 5 | 2 | 1 |
| Q12 | 14 | 3 | 29 | 8 | 3 | 2 |
| **Sum** | **24** | **6** | **48** | **17** | **7** | **3** |

## 4. Errata and Rosetta

### 4.1 Every formula and number of pp. 35–58, recomputed (`planL8L11-numpy.py`: numpy only, no repo code; page images opened for pp. 52 and 58)
| Page | Item | Result |
|---|---|---|
| 35–36 | (2.12) eigenvalues +1, −1, −1, −1; ⟨(Δσ_x1)²⟩ = 1 against 0 for each product; (2.13) product = −XXX | true |
| 37 | Tr ρ₁₂² = ½; ⟨XX⟩ 0 for the mixture, 1 for the superposition | true |
| 39 | Tr ρ² = ¾; ⟨S_z⟩ = ⟨S_x⟩ = ħ/4, ⟨S_y⟩ = 0 for \|0⟩, \|+x⟩; det ρ = (1 − \|n\|²)/4 = 0.125 at \|n\| = 0.7071; thermal ⟨S_z⟩/(ħ/2) = tanh(E_Z/2k_BT) = 0.7616 at E_Z/k_BT = 2 | true |
| 40 | (2.19) \|u±\> normalized (norms 1, overlap 0); (2.20) weights (2 ± √2)/4 = 0.8536, 0.1464 rebuild ρ; \|u±\> are eigenvectors of ρ **and** of the Hadamard gate (ρ = ½I + (√2/4)H) | true |
| 41 | unitary freedom: U_ij = √p_i⟨φ_j\|ψ_i⟩/√q_j = H exactly, both rows of the theorem hold | true |
| 42–43 | singlet ρ and ρ_A = ½I; the coin mixture has the same ρ_A (purity ½ against 1); ⟨XX⟩ −1 against 0 | true |
| 44–46 | Schmidt weights from SVD sum to 1, S(ρ_A) = S(ρ_B); purification works for a non-orthogonal ensemble; the two purifications differ by U_B (overlap 0.5, same ρ_A); smallest ancilla = rank | true |
| 48–49 | F ≤ ½ for product states: maximum over 20 000 random states 0.49999999; (3.7) identity and (3.8) | true |
| 50 | (3.13) matrix, (3.14) ρ_A = ρ_B = ½I, F = α for 11 values of α | true |
| 50–51 | ρ̃ = ρ for the family; σ_y⊗σ_y maps \|00⟩ → −\|11⟩, \|01⟩ → \|10⟩; **C(α) = max{0, 2α − 1}** on 41 values; λ ordering: α is largest for α ≥ ⅓ (spectrum ⅓, ⅓, ⅓, 0 at the tie), (1−α)/2 below, giving −α; **(\|01⟩ − i\|10⟩)/√2: C = 1 with the conjugation, 0 without**; C = 2\|det Λ\| against Wootters on 2000 random states, 0 mismatches; product 0, Bell 1 | true |
| 52–53 | (3.27) σ (page image agrees with the numpy matrix); **det σ = α²(1−2α)/16**; eigenvalues α/2, α/2, ½, ½ − α at four α; negative exactly above ½; eigenvalues invariant under U_A ⊗ U_B and σ → (U_A* ⊗ U_B)σ(…)† | true |
| 53–55 | S(½I) = 1, S(¼I₄) = 2, log₂ d; S(Bell) = 1, S(A\|B) = −1; **(3.35) crosses 0 at α = 0.7729 (≈ 0.773)**, equals S(ρ) − S(ρ_B) of the state; E_f(0.8) = 0.469 | true |
| 55–58 | P(a, b) = −cos θ; **0.7071 against 0.2929** (ratio 2.414); all 8 deterministic rows satisfy (3.42) (max excess 0); all 16 rows give −2 ≤ S ≤ 2; **S = −2√2 = −2.8284** at 0, π/2, π/4, −π/4 (angles π/4, π/4, π/4, 3π/4); CHSH operator spectrum ±2√2 (Tsirelson); (3.47) printed as −4/√2 on the image | true |
| extra | the α-family obeys CHSH for all settings up to α = 1/√2 = 0.7071 (Horodecki max 2√2·α); 2000 random separable mixtures never exceed ⟨C⟩ = 1.19 | for §3.5 |

**Result: no physics error in pp. 35–58, so no Correction box.** Slips with no physics content (no box, one Rosetta line each, so a tutor can say so):
1. p. 54 sends the reader to "Sec. II I 1" for the singlet's reduced state; it is §II I.2 (p. 42).
2. p. 41 says §III A is where mixtures become the definition of separability; the definition is Eq. 3.2 at the top of §III (p. 47), and §III A treats convexity.
3. A caveat, not a slip: p. 46 says two purifications share "the same local basis"; with a degenerate λ the A basis is free inside the eigenspace, so one chooses the same one (our Formal wording in `q9-purification:b5`).
The earlier Corrections stand unchanged: pp. 8–12 and 19 (Q2, Q3) are on the same text; Q2's three Corrections and Q3's Û†ÂÛ slip are re-cited only.

### 4.2 Rosetta lines (one short Formal line each, on first use in the chapter named)
| Notes | Course | Where |
|---|---|---|
| n (Bloch vector of ρ, 2.14–2.16) | r (C5) | Q8 `q8-ball`; Q8's notation stays |
| particles 1, 2 and i_1, i_2 become A, B and i_A, i_B from p. 42 | qubit 1, 2 in Q6–Q8; A, B (Alice, Bob) from Q9 on | Q9 `q9-partial-trace` |
| \|↑⟩, \|↓⟩ and E_↑, E_↓ become \|0⟩, \|1⟩ and E_0, E_1 (p. 39) | \|0⟩ = \|+z⟩ north; E_Z = E_1 − E_0 | Q8 `q8-mixed` |
| P(a, b) is a correlation, a number in [−1, 1] (3.36, 3.39) | the correlator ⟨ab⟩ (`qc-correlator`); not a probability | Q10 `q10-bell:b1` |
| bold a, b, c are analyser directions; Bergou's a₁, a₂, b₁, b₂ are ±1 observables | both appear; `q10-bell` uses directions, `q10-hidden` Bergou's | Q10 |
| p(λ), A(a, λ), B(b, λ); λ also names eigenvalues and Schmidt weights | the notes' p(λ) keeps ρ free for density matrices; the hidden label is λ only inside `q10-bell` | Q10 `q10-bell:b2` |
| S for the CHSH score (3.46), for entropy (3.28), for total spin | Q10 keeps S for the score; entropy is always S(ρ) with an argument | Q12 `q12-entropy:b6` |
| σ (3.23) is the partial transpose of the A indices; not a Pauli matrix | ρ^{T_B} in Q12 (same eigenvalues: (ρ^{T_A})^T = ρ^{T_B}) | Q12 `q12-ppt:b6` |
| Λ (3.18), the coefficient matrix | `coefMatrix` C; Q12 writes Λ in the derivation and says so | Q12 `q12-concurrence:b7` |
| F (3.10), the coherence figure | **F_coh** in Q12 (Q9's F is the fidelity) | Q12 `q12-coherence:b2` |
| E(x) and h(x) (3.17) | E_f = `eofFromC`, h = the binary entropy | Q12 `q12-concurrence` |
| α is an amplitude in (3.1) and a mixing weight in (3.12) | kept, with one line in each unit | Q10 `q10-separable:b5`, Q12 `q12-family:b1` |
| \|S⟩ (3.12), β₁₁ | Ψ⁻ (notes, N&C: β₁₁) | Q12 `q12-family:b1` |

## 5. Homework
`docs/roles/decisions/homework-status.md`: HW2 submitted; **HW3 submitted (2026-10-17)**, so the pure-state concurrence C = 2\|det Λ\| is derived in full in `q12-concurrence:b7` and on the L10 notes page; the new-edition L8–L11 has no problem set,
so its own examples (the thermal ensemble, the \|0⟩/\|+x⟩ mixture, U = H, the singlet and its coin twin, the α-family, the Bell and CHSH angles) are worked in full. No walkthrough is hints-only.

## 6. The "Lecture notes" section: content outline (one page per class lecture, L1–L11)

Voice and rules for every page: one voice at the notes' level, full sentences of at most 40 words, no bullet chunks; follows the notes' own order, section letters, equation numbers and printed pages (a margin tag "p. N, Eq. x.y" per paragraph);
every displayed number is a keyed claim (existing key unless marked **new**; each has a numpy twin in `pipeline/claims_qc709/`); each paragraph ends with a link into the chapter unit that teaches it;
figures are static states of existing stage kinds. Paraphrase only (an 8-word run matching `sources/` fails `verbatim.test.ts`; the builder writes fresh sentences).

### 6.1 L1–L7: short companions (≈ 150–300 words each)
| Lecture (date; pages; eqs) | Sections in order → link | Claims (existing keys) | Figures |
|---|---|---|---|
| **L1** (9/2; pp. 4–7) | §I.A Stern–Gerlach (p. 4): two spots, ħ → Q1 `q1-two-spots`, `q1-sequences` · §I.B.1 superposition (p. 5) → `q1-superposition` · §I.B.2 vector space (p. 5) → `q1-vector-space` · §I.B.3 inner product (pp. 5–6) → `q1-inner-product` | `q1SupZ`, `q1ZOrth`, `q1Zxz` | `lab-r3` (two spots), `amplitudes`, `hilbert-plane{project}` |
| **L2** (9/9; pp. 8–12; 1.1–1.3) | §I.C.1 basis, C.2 Gram–Schmidt (p. 8) → `q2-basis`, `q2-gram-schmidt` · C.3 spin-½ space (p. 9; 1.1–1.2) → `q2-spin-space` · C.4 change of basis (pp. 10–11; 1.3) → `q2-change` · C.5 photon polarization (p. 11) → `q2-photon` · §I.D.1 matrix representation (p. 12) → `q2-operators` | `q2ZXOverlap`, `q2URe01`, `q2Gs60` | `hilbert-plane{basis}`, `matrix{gate}`, `complex-plane` |
| **L3** (9/14; pp. 13–18; 1.4–1.8) | §I.E.1–E.2 projectors and completeness (p. 13) → `q3-born` · F.1 \|n⟩ and the sphere (p. 14; 1.4–1.5) → `q3-bloch` · F.2–F.3 S_z, S_x, Pauli, σ_n (pp. 14–16; 1.6–1.7) → `q3-spin-operators` · F.4 ⟨σ⟩ = n (p. 16; 1.8) → `q3-bloch` · §I.G observables, Hermitian (pp. 16–17) → `q3-observables` | `q3NVecXY` = 0.6124, `q3Pzx`, `q3PsiAlpha` | `bloch`, `matrix{pauli}`, `operator-space` |
| **L4** (9/16; pp. 19–22; 1.9–1.10) | §I.G.2 eigenproblem, G.3 products (p. 19) → `q3-spectral` · H.1 commutator (p. 20; 1.9), H.2 compatible → `q3-uncertainty` · H.3 Schwarz and Robertson (p. 21; 1.10) → `q3-uncertainty` | `q3RobXBound`, `q3CompatPxDiag`, `q3EigZeroVar` | `matrix{product}`, `hilbert-plane` |
| **L5** (9/21; pp. 23–28; 2.1–2.4) | §II intro: multiplicative composition, 2^N amplitudes, product states, 4 against 6 parameters (pp. 23–25) → Q6 `q6-many`, `q6-entangled` · §A tensor product (p. 25; 2.1) → `q6-tensor` · §B gates (pp. 26–27; 2.2) → Q4 `q4-one-qubit-gates`, `q4-cnot` · §C Bell basis (pp. 27–28; 2.3–2.4) → `q6-bell-basis` · §D Bell measurement circuit (p. 28) → `q6-bell-circuit` | `q6Param3Frac`, `q6Param10Frac` = 0.0098 (0.98 % at N = 10), `q4HHisX` | `amplitudes`, `matrix{kron}`, `circuit` |
| **L6** (9/23; pp. 29–34; 2.5–2.10) | §D.1–D.2 preparing and projecting on Bell states (p. 29; 2.5) → `q6-bell-circuit` · §E commuting stabilizers (pp. 29–31; 2.6–2.8) → `q6-parities` · §F GHZ, F.1 X and Y bases (pp. 31–32; 2.9) → Q7 `q7-ghz`, `q7-brackets` · F.2 bit-string probabilities (pp. 32–34; 2.10) → `q7-parity-table`, `q7-bit-strings` | `q6MEigBeta10`, `q7GhzP000` = 0.5, `q7Eighth` = 0.125 | `circuit`, `matrix{tableau}`, `amplitudes{ghz}` |
| **L7** (9/28; pp. 35–37; 2.11–2.13) | §F.3 the four Pauli-product observables, eigenvalues, zero dispersion (p. 35; 2.11–2.12) → `q7-observables` · Mermin's contradiction and where QM escapes (p. 36; 2.13) → `q7-mermin` · §G the box that forces ρ (pp. 36–37) → Q8 `q8-why`, `q8-pure-rho` | `q7EigXxx` = 1, `q7EigYyx` = −1, `q7VarX1` = 1, `q7MerminBest` = 3, `q8BoxXX` = 0, `q8BoxPur` = 0.5 | `matrix{tableau, values}`, `two-qubit{grid}` |

### 6.2 L8 (9/30; pp. 38–43; Eqs. 2.14–2.23): full companion, ≈ 1,100 words
| § (page; equations) | The companion paragraph must explain | Link |
|---|---|---|
| §H working with ρ (p. 38) | ρ_ij = c_ic_j*: diagonal = Born chances, off-diagonal "coherences" = the relative phases a mixture lacks; ⟨A⟩ = Tr(Aρ) survives when no ket exists; iħρ̇ = [H, ρ] has the sign opposite to Heisenberg's because ρ is a state | Q8 `q8-pure-rho`, `q8-trace-rule` |
| §I mixed state (pp. 38–39) | an ensemble Σ p_n\|ψ_n⟩⟨ψ_n\|, trace 1 from Σp_n = 1, same trace rule, Tr ρ² < 1; the thermal box ⟨S_z⟩ = (ħ/2)tanh(E_Z/2k_BT) = 0.7616 of ħ/2 at E_Z/k_BT = 2 | `q8-mixed` |
| the \|0⟩, \|+x⟩ example (p. 39) | ρ = [[¾, ¼], [¼, ¼]], Tr ρ² = ¾, ⟨S_z⟩ = ⟨S_x⟩ = ħ/4 | `q8-mixed` |
| Bloch ball (p. 39; 2.14–2.16) | ρ = ½(I + n·σ), n real from Hermiticity, det ρ = (1−\|n\|²)/4 ≥ 0 gives \|n\| ≤ 1, \|n\| = 1 is pure (eigenvalues 1, 0), n_j = Tr(ρσ_j); here n is our r | `q8-ball` |
| §I.1 pure-state decomposition (pp. 40–41; 2.17–2.22) | one ρ, many ensembles (½I as poles of z or x; the same ρ as \|u±⟩ with weights 0.854, 0.146, 2.19–2.20); the canonical form (2.21) is the one with orthogonal members and its degenerate case; a pure state has one recipe (the ψ⊥ argument; pure states are corners); unitary freedom, U = H, acts on the list of recipes not on the qubit (2.22) | `q8-recipes` |
| §I.2 bipartite ρ (pp. 42–43; 2.23) | ⟨S_Az⟩ = Tr(ρS_Az) defines ρ_A = Tr_B ρ; singlet ρ_A = ½I; the coin twin has the same ρ_A, so one party alone cannot tell them apart and Bell's argument will use the joint data; the general form (2.23) | Q9 `q9-partial-trace`, `q9-same-part` |

Claims: `q8ThermR` (0.7616), `q8ZXPur` (0.75), `q8ZXRLen` (0.7071), `q8ZXDet` (0.125), `q8UHEigPlus` (1), `q8UHEigMinus` (−1), **new** `q8CanonOverlap` (0.7071; numpy: \|k0·k+\|), `q8CanonUOverlap` (0; `eigh` vectors), `q8PureEscape` (0.25; ⟨1\|ρ\|1⟩),
`q9SingRA00` (0.5), `q9CoinPur` (0.5; Tr ρ² of the coin twin), `q9SingXX` (−1), `q9CoinXX` (0).
Figures: `matrix{rho}` (ρ_ij), `bloch-ball{point}` (the thermal ρ), `bloch-ball{recipe}` (poles, then the \|0⟩/\|+x⟩ chord and the \|u±⟩ diameter), `matrix{spectrum:'bars'}`, `two-qubit{source:{rho}, arrows:'reduced', grid:'T'}` (singlet against its coin twin).

### 6.3 L9 (10/5; pp. 44–46; Eqs. 2.24–2.33): full companion, ≈ 900 words
| § (page; equations) | The companion paragraph must explain | Link |
|---|---|---|
| §J opening (p. 44) | Schmidt form and purification are one fact seen from two ends | Q9 `q9-schmidt`, `q9-purification` |
| §J.1 Schmidt (pp. 44–45; 2.24–2.28) | expand in two bases and group by A; the grouped B-vectors are not orthonormal; choosing A's basis as ρ_A's eigenbasis forces them orthogonal with norm² λ (2.25–2.26), so normalizing gives √λ\|u⟩\|w⟩ (2.27); N ≤ min(dim); ρ_B has the same non-zero eigenvalues (2.28); the aside that Gram–Schmidt and Schmidt share a name and play opposite roles | `q9-schmidt` |
| §J.2 purification (pp. 45–46; 2.29–2.30) | every ρ_A is the reduced state of a pure state on A + ancilla; build Σ√p_i\|ψ_i⟩\|v_i⟩; three checks (a recipe exists, \|Φ⟩ is normalized, Tr_B returns ρ); the off-diagonal terms cancel since the ancilla states are an orthonormal set, so non-orthogonal recipes work; smallest ancilla = rank; a pure state needs none | `q9-purification` |
| non-uniqueness (p. 46; 2.31–2.33) | two purifications share the weights and A basis and differ by U_B on the ancilla alone | `q9-purification` |

Claims: **new** `q9PurNonOrthGap` (0), `q9PurMinAncilla` (2), `q9PurPureAncilla` (1), `q9PurOverlap` (0.5), `q9PurUBGap` (0); existing `q9RankBell` (2), `q9PurifyGap`, `q9CS225SchmidtLarge`/`Small` (the chapter's Schmidt example).
Figures: `matrix{coef, svd}` (rows ṽ, two bars), `matrix{partialTrace, spectrum}` (A and B spectra), `matrix{outer: Φ, partialTrace:'B'}` before and after U_B, `two-qubit{family:'cos-sin'}`.

### 6.4 L10 (10/7; pp. 47–55; Eqs. 3.1–3.36): full companion, ≈ 1,500 words
| § (page; equations) | The companion paragraph must explain | Link |
|---|---|---|
| §III separable and entangled (p. 47; 3.1–3.2) | a product ket is separable; α\|01⟩ + β\|10⟩ is entangled exactly when αβ ≠ 0 (singlet at α = −β = 1/√2); a mixed state is separable when it is a mixture of products (3.2); the two definitions agree for pure states; separable states obey Bell's inequality, the converse fails | Q10 `q10-separable` |
| §A mixtures and convexity (pp. 47–48; 3.3) | density matrices form a convex set (trace is linear, positivity survives); n(θ) is the straight segment, so the ball has no dents; extremal points are the surface, the pure states; the separable states are a smaller convex set whose extremal points are pure products, and every criterion asks which side of its boundary ρ lies | Q8 `q8-recipes`, Q10 `q10-separable:b5` |
| §B.1 coherence (pp. 48–50; 3.4–3.11) | for a product state, the middle block gives P₀₁, P₁₀ and Q; an identity of squares bounds F = (P₀₁+P₁₀)/2 + \|Q\| by ½ (3.7–3.10); mixtures keep the bound by the triangle inequality; F > ½ proves entanglement, F ≤ ½ proves nothing; populations alone never suffice | Q12 `q12-coherence` |
| the α-family (pp. 49–50; 3.12–3.15) | the 4×4 matrix, both reduced states ½I for every α, F = α, entangled for α > ½ | Q12 `q12-family:b1`–`b2` |
| §B.2 concurrence (pp. 50–51; 3.16–3.21) | R, ρ̃ = (σ_y⊗σ_y)ρ*(σ_y⊗σ_y), λ's in decreasing order, C = max{0, λ₁−λ₂−λ₃−λ₄}, E_f = E(C); the conjugation is essential ((\|01⟩ − i\|10⟩)/√2: C = 1 with, 0 without); pure states give C = 2\|det Λ\| (derived in HW3); for the family ρ̃ = ρ, R = ρ, C = 2λ_max − 1 = max{0, 2α−1} | Q12 `q12-concurrence:b6`–`b7`, `q12-family:b3` |
| §B.3 partial transpose (pp. 52–53; 3.22–3.27) | σ_{ab,a′b′} = ρ_{a′b,ab′}; local unitaries act as U_A* ⊗ U_B so the spectrum is basis-free; separable ⇒ σ = Σ p (ρ^A)ᵀ ⊗ ρ^B ≥ 0; exact test for 2×2 and 2×3; family: eigenvalues α/2, α/2, ½, ½−α, det = α²(1−2α)/16 | Q12 `q12-ppt:b6`, `q12-family:b2` |
| §C von Neumann entropy (pp. 53–54; 3.28–3.32) | S = −Σλ log₂λ; pure 0, ½I one bit, log₂ d the maximum; for a pure pair S(ρ_A) = S(ρ_B) (the entanglement entropy); rank one ⇔ S = 0 ⇔ product; equal λ give log₂ d (relative entropy); two qubits: S = h(λ) | Q9 `q9-entropy`, `q9-schmidt` |
| §C.1 conditional entropy (pp. 54–55; 3.33–3.35) | S(A\|B) = S(AB) − S(B); never negative classically; negative ⇒ entangled, one way only; Bell −1 bit; for the family it turns negative only above 0.773 although the state is entangled above ½ | Q12 `q12-entropy:b6`, `q12-family:b4` |
| §D two-spin correlations (p. 55; 3.36) | singlet correlation P(a, b) = −a·b depends only on the angle | Q10 `q10-bell:b1` |

The worked α-family example, side by side (engine numbers from `planL8L11-numpy.py`; the page shows this table as static text under one `plot{series}` figure):
| α | F = α | C = max(0, 2α−1) | λ_min(σ) = ½−α | S(A\|B) | E_f |
|---|---|---|---|---|---|
| 0.25 | 0.25 | 0 | +0.125 (σ ≥ 0) | +0.5613 | 0 |
| 0.50 | 0.50 | 0 | 0 | +0.5000 | 0 |
| 0.60 | 0.60 | 0.2 | −0.1 | +0.3710 | 0.0815 |
| 0.75 | 0.75 | 0.5 | −0.25 | +0.0613 | 0.3546 |
| 0.80 | 0.80 | 0.6 | −0.3 | −0.0781 | 0.4690 |
| 1.00 | 1.00 | 1 | −0.5 | −1.0000 | 1 |
Thresholds: F, C and σ agree at ½; S(A\|B) at 0.7729; CHSH (§3.5) at 0.7071. Claims shown: **new** `q12FamF06`, `q12FamC06`, `q12FamC08`, `q12FamSigMin06`, `q12FamSigMin08`, `q12FamDet06`, `q12FamLamTie`, `q12FamSAB075`, `q12FamSAB08`, `q12FamSABThresh`, `q12FamSAB1`, `q12FamEf08`, `q12CohProdA`, `q12CohProdEq`, `q12ConjC`, `q12ConjCNo`, `q12ConcLambda`, `q12CondBell`, `q12CondPure30`, `q10FamDet`; existing `q9S0707` (0.601 bit, S = h(λ) at \|r\| = 0.7071).
Figures: `matrix{rho}` (3.13), `two-qubit{source:{rho}, arrows:'reduced', grid:'T'}` (the ½I arrows), `matrix{spectrum:'bars'}` at three α, `matrix{ptranspose:'A'}` (cells move), `plot{series}` of F, C, λ_min, S(A\|B) against α with markers at ½ and 0.7729, `bloch-ball{recipe}` for convexity.

### 6.5 L11 (10/12; pp. 56–58; Eqs. 3.36–3.47): full companion, ≈ 1,000 words
| § (page; equations) | The companion paragraph must explain | Link |
|---|---|---|
| §E EPR and hidden variables (p. 56; 3.37–3.39) | EPR argued that quantum mechanics is incomplete, not inconsistent; the singlet fixes the partner's reading; a hidden label λ with density p(λ) would supply A(a, λ) = ±1 and B(b, λ) = ±1; locality means A ignores b; perfect anticorrelation at equal settings gives B = −A; P(a, b) = −∫ p A(a)A(b) (p, not ρ) | Q10 `q10-bell:b1`–`b2`, `q10-hidden` |
| Bell's inequality (p. 57; 3.40–3.42) | difference of two correlations; insert A(b)² = 1; the bracket 1 − A(b)A(c) can never drop below zero and a product of two ±1 values has size at most one, so \|P(a,b) − P(a,c)\| ≤ 1 + P(b,c) for every p, A, B (Sakurai's 8-row version) | `q10-bell:b3` |
| the quantum numbers (p. 57; 3.43–3.44) | a ⊥ b, c the bisector: 0 and −1/√2 twice, so 0.7071 is not ≤ 0.2929 (a factor above two) | `q10-bell:b4` |
| §E.1 CHSH (pp. 57–58; 3.45–3.47) | two settings per side; D = A(B+B′) + A′(B−B′) = ±2 since one bracket vanishes; so −2 ≤ S ≤ 2 with no third direction and no perfect anticorrelation, which is why experiments test CHSH; angles 0, π/2, π/4, −π/4 give three π/4's and one 3π/4, S = −2√2 = −2.83 | `q10-hidden`, `q10-chsh`, `q10-violation:b5` |
| closing (p. 58) | 2√2 is Tsirelson's bound; experiments (Aspect 1982, Weihs 1998, cited by name and page only) agree; the moral; the correlations defy locality yet carry no signal faster than light, because A's choice never reaches B (no-communication) | `q10-violation:b4`, `q10-no-signal:b5` |

Claims: **new** `q10SingletPar` (−1), `q10SingletBis` (−0.7071), `q10SingletPerp` (0), `q10BellAssignments` (8), `q10BellDetViol` (0), `q10BellLhs` (0.7071), `q10BellRhs` (0.2929), `q10BellRatio` (2.4142), `q10NotesS` (−2.8284); existing `q10Tsirelson` (2.8284), `q10Half`; **new** `q12FamChshThresh` (0.7071; the family stays Bell-satisfying up to it).
Figures: `plot{series}` (−cos θ with markers at 0°, 45°, 90°), `matrix{tableau, values}` (the 8 rows, the bracket column), `two-qubit{axes, readouts:['chsh']}` (a = 0°, a′ = 90°, b = 45°, b′ = −45°), `plot{curve:'chshVsPhase'}` with the classical line at 2.

## 7. Engine gaps and stage needs
| Module | Function (chapter) | numpy-twin route |
|---|---|---|
| `qc/entangle.ts` | `coherenceCriterion(rho)` → {P01, P10, Q, F} from the {01,10} block (Q12) | read the three entries of a numpy ρ; F = (P01+P10)/2 + \|Q\|; checked on 20 000 random product states (max 0.5) |
| `qc/density.ts` | `conditionalEntropy(rho, keep)` = S(ρ) − S(ρ_keep) (Q12) | `eigvalsh` entropies; the closed form (3.35) for the family |
| `qc/entangle.ts` | `bellThreeDirections()` → {assignments (8 rows), maxViolation: 0} beside `lhvChsh` (Q10) | `itertools.product([−1,1], repeat=3)` |
| `qc/density.ts` | `purifyEnsemble(ps, kets)` = Σ√p_i\|ψ_i⟩⊗\|i⟩ (Q9) | explicit `np.kron`, partial trace by reshape |
Already in the engine: `concurrence`, `concurrencePure`, `negativity`, `isPPT`, `ptranspose`, `eofFromC`, `chshMaxHorodecki`, `lhvChsh`, `correlator`, `correlationTensor`, `vonNeumann`, `schmidt`, `purify`, `partialTrace`, `coefMatrix`, `mixtureN`.
Values-file helpers (no engine): the α-family constructor, the singlet correlation at a pair of angles (`correlator` of the singlet with σ·a, σ·b). **Stage kinds**: none new. Used fields: `matrix` (`rho`, `spectrum`, `ptranspose`, `partialTrace`, `outer`, `coef`+`svd`, `tableau`+`values`, `highlight`), `bloch-ball` (`recipe`, `point`),
`two-qubit` (`source:{rho}`, `arrows`, `grid`, `axes`, `readouts`), `plot` (`series`, `markers`, `yLines`, `curve:'chshVsPhase'`), `amplitudes`, `circuit`. Twins: new keys go in `q8.py`, `q9.py`, `q10.py`, `q12.py`; run each twice, byte-identical.

## 8. Open questions for the judge (recommended answer first)
| # | Question | Recommendation |
|---|---|---|
| 1 | Apply the 384-row TSV in one scripted pass (assert uniqueness per line, then `vitest run src/content`)? | **Yes**; one fix agent, ≈ 1 point; it touches no logic |
| 2 | Keep S(ρ) in Q9 although the notes now teach it after the criteria? | **Yes** (§2.2); Schmidt and purification need it first; Q12 owns S(A\|B) |
| 3 | Keep r for the Bloch vector (notes: n)? | **Yes**, one Rosetta line (L1L7 §8 #10 stands) |
| 4 | Two new Q12 units (`q12-coherence`, `q12-family`) and one new Q10 unit (`q10-bell`), rather than folding into existing units? | **Yes**: the notes give them 7 pages; folding would hide the side-by-side comparison; cost ≈ 3 Sonnet builds of 1 point |
| 5 | `q12-coherence` placed first in Q12, ahead of `q12-ppt`? | **Yes**: it is the notes' first criterion and the cheapest to measure; PPT then reads as the exact test |
| 6 | The α-family uses the notes' name α and F; call the coherence figure F_coh and the family `qc-alpha-family`? | **Yes** (Rosetta §4.2): Q9 already owns F as fidelity |
| 7 | Include the Φ⁺ blind spot of F (F = 0) and the CHSH threshold 1/√2 of the family as extra beats? | **Yes**: both are one beat, engine-checked, and show "necessary, not sufficient" and "entangled yet Bell-satisfying"; drop them first if budget binds |
| 8 | Fix the two cross-reference slips with a Correction box? | **No**: no physics content (§4.1); a Rosetta line is enough |
| 9 | Q2/Q3 Corrections cite notes p. 9, p. 10, p. 17 (now 11, 12, 19); re-verify them on the new pages? | **Yes, once**: I took pp. 4–22 as unchanged from the orchestrator's map and did not re-diff them; check the three sign/side slips on pp. 11–12 and 19 when the TSV is applied |
| 10 | Notes section: pages built as read-only Markdown-like data with a margin tag per paragraph; builder reuses existing keys and may not add a number without a key? | **Yes**; a planner for the page machinery owns the format; I only fix the content and its claims |
| 11 | Q10/Q12 `phase`: new notes beats are `lecture`; existing `books` beats keep their place (lecture first in each unit)? | **Yes**; a unit's order is lecture → books → clue → deeper |
| 12 | Bergou ⚑ problems for the new units (3.5–3.9 problems) cited only? | **Yes**, as for Q10–Q12 today; no sheet assigns any |
