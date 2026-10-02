# P-709-remap-L1L7: Physics 709 re-mapped to notes L1–L7, Parts II–V planned (P, 2026-10-02)

Proposal only (role P, skill `02-part-map`). It amends `P-709-map.md` and its rulings (`qc709-map.md`, `qc709-nc.md`,
`qc709-Q4Q5.md`); where this file is silent, they stand.

## 0. Summary

| Item | Content |
|---|---|
| Read | notes L3–L7 in full (text; renders p. 31, p. 32 by eye), L1–L2 headings (unrevised); HW2; built 709 meta (F1, Q1–Q5); `physics/qc/*` exports; `docs/specs/stage-kinds.md`; the `matrix` and W-709 #7/#8 briefs; Bergou Ch. 2–5 headings (offsets per map (d)-E1); N&C pages as cited |
| Re-checked in numpy (`remap-check.py`, session scratchpad), all true | (2.6); Fig. 7's \|β_xy⟩ → \|xy⟩; CNOT = (I⊗H)CZ(I⊗H); HW2 P3(a); (2.12), (2.13); (1+s)/4 for all 64 runs; instruction sets meet ≤ 3 of Mermin's 4; (2.20); Tr₃\|GHZ⟩⟨GHZ\| = ½(\|00⟩⟨00\| + \|11⟩⟨11\|); Tr₂ singlet = ½I; 0.98 % at N = 10; the p. 36 tanh; HW2 P2(a) ¼ ×4, P2(c) 0.933/0.067, P4 Tr ρ² = 1 − p + p², P5 9/4 against 3/4; the p. 37 mixture S = 0.601 bit |
| Errata | none in L3–L7's math; Rosetta items in §1.4 |
| D1 Order | **the course's order wins**: the notes teach two-qubit states, the Bell basis, stabilizer parities and GHZ/Mermin (L5–L7 p. 34) *before* ρ (L7 pp. 34–40); Bergou does ρ (Ch. 2) before entanglement (Ch. 3) |
| D2 L6 split | Bell measurement + commuting stabilizers join the Bell-basis chapter, new **Q6**; GHZ, X/Y bit strings and Mermin form new **Q7**. Not the Bell-inequality chapter: the notes teach them before ρ, and Mermin needs neither ρ nor statistics |
| D3 Renumber | old Q6–Q12 → **Q8–Q14**; old Q13–Q25 → **Q15–Q27** (titles kept). Q6 joins Part II; Part III is retitled **"Correlations and the density matrix"** (Q7–Q9); Parts IV (Q10–Q12) and V (Q13–Q14) keep their titles |
| D4 Foundations | **F2, F3, F4, F6 folded** into chapters that already teach them (§3); old F5 kept, trimmed, renumbered **F2**; F7/F8 → F3/F4 (judge Q4). Saves ≈ 18 points |
| D5 Q3 | Q3 now spans **notes L3–L4** (pp. 11–20): one chapter, re-aligned, two new derivations (§1.2) |

## 1. Ownership of the notes, L1–L7

### 1.1 Every notes section → chapter · unit
| Notes § (pages) | Content | Owner |
|---|---|---|
| L1 §I.A–B (pp. 2–5) | SG, superposition, vector space, inner product | Q1 (built, aligned): two-spots, sequences, superposition, vector-space, inner-product |
| L2 §C.1–C.5, §D.1 (pp. 6–10) | basis, Gram–Schmidt, spin-½ space, change of basis, photon, operators | Q2 (built, aligned): q2-basis … q2-operators |
| L3 §E, E.1–E.2 (p. 11) | P = \|⟨α\|β⟩\|², P_M, completeness | Q3 `q3-born` |
| L3 §F.1 (p. 12) | **new:** 4 real → 2 (global phase, normalization, half angle); (1.4), (1.5) | Q3 `q3-bloch` |
| L3 §F.2–F.3 (pp. 12–14) | P_{±z}, P̃ = UPU⁻¹, S_z, P_{±x}, \|±y⟩, Pauli (1.6), S_n, σ_n (1.7) | Q3 `q3-spin-operators` |
| L3 §F.4 (p. 14) | **new:** ⟨+n\|σ\|+n⟩ = n (1.8); zero dispersion along n | Q3 `q3-bloch` (new beat) |
| L3 §G, G.1 (pp. 14–16) | measurement statements, ⟨M⟩, adjoint, "only Hermitian" theorem | Q3 `q3-observables` |
| L4 §G.2–G.3 (pp. 17–18) | eigenproblem, both proofs, U†AU, spectral form, f(A), AB, ⟨Aⁿ⟩, dispersion | Q3 `q3-spectral` |
| L4 §H.1–H.3 (pp. 18–20) | commutators (1.9), compatible, ΔA, Schwarz, Robertson (1.10), \|+x⟩/\|+z⟩ | Q3 `q3-uncertainty` |
| L5 §II intro (pp. 21–22) | composition multiplies; 2^N amplitudes; product state; ⟨A⊗B⟩ = ⟨A⟩⟨B⟩ | Q6 `q6-many` |
| L5 §II intro (p. 22) | 6 vs 4 parameters, 2N/(2^{N+1}−2); \|Φ⟩ cannot factor | Q6 `q6-entangled` |
| L5 §A (p. 23) | \|i₁,i₂⟩ = \|i₁⟩⊗\|i₂⟩ (kets: Q4 link-back); A₁ → A⊗I; block rule (2.1); σ_{1x}⊗σ_{2z} | Q6 `q6-tensor` |
| L5 §B (pp. 23–25) | U†U = 1 (2.2); X, Z, H = (σx+σz)/√2, S, T; CNOT = \|0⟩⟨0\|⊗1 + \|1⟩⟨1\|⊗σx; U_n(θ) series; CZ; CNOT = (1⊗H)CZ(1⊗H) | Q4 (built): one-qubit-gates, cnot, circuits (§1.2) |
| L5 §C (pp. 25–26) | Bell basis (2.3)–(2.4), orthonormal, no product, perfect correlation; triplet/singlet | Q6 `q6-bell-basis` |
| L5 §D (p. 26) | Bell measurement circuit, Fig. 7, \|β_xy⟩ → \|xy⟩ | Q6 `q6-bell-circuit` |
| L6 §D.1–D.2 (p. 27) | preparing by reversal U†; Bell projectors Π_xy (2.5) | Q6 `q6-bell-circuit` |
| L6 §E (pp. 27–29) | U†(σz⊗1)U = σxσx, U†(1⊗σz)U = σzσz (2.6); they commute; (2.7); Π_xy factorizes; M̂ and 2n̂₁+n̂₂ (2.8) | Q6 `q6-parities` |
| L6 §F intro, F.1 (p. 29) | GHZ_N; X and Y bases | Q7 `q7-ghz` |
| L6 §F.2 (pp. 29–30) | P(000) = P(111) = ½; the eight brackets, ζ_k (2.9) | Q7 `q7-ghz`, `q7-brackets` |
| L6 §F.2 (pp. 30–31) | s = (−i)^{n_y}Π (2.10), (1+s)/4, the table | Q7 `q7-parity-table` |
| L6 §F.2 (pp. 31–32) | even/odd surviving strings; Π is a measured product (p. 32: two lines, render checked) | Q7 `q7-bit-strings` |
| L7 §F.3 (p. 33) | Ô_XXX, Ô_YYX, Ô_YXY, Ô_XYY (2.11), commute, (2.12), zero dispersion | Q7 `q7-observables` |
| L7 §F.3 (pp. 33–34) | predetermined x_i, y_i ⇒ contradiction; operator product (2.13) | Q7 `q7-mermin` |
| L7 §G (pp. 34–35) | GHZ box with qubit 1 read → mixture; ⟨σx1σx2⟩ = 0 versus +1 | Q8 `q8-why` |
| L7 §G–H (pp. 35–36) | ρ = \|ψ⟩⟨ψ\|, ρ² = ρ, Hermitian, Tr ρ = 1; ρ_ij, coherences | Q8 `q8-pure-rho` |
| L7 §H (p. 36) | ⟨A⟩ = Tr(Aρ); iħρ̇ = [H, ρ] | Q8 `q8-trace-rule` |
| L7 §I (pp. 36–37) | Σ p_n\|ψ_n⟩⟨ψ_n\|, Tr ρ² < 1; thermal ⟨S_z⟩ = (ħ/2)tanh(E_Z/2k_BT); the \|+z⟩,\|+x⟩ mixture | Q8 `q8-mixed` |
| L7 §I (p. 37) | ρ = ½(I + n·σ) (2.14)–(2.15), det ρ, n_j = Tr(ρσ_j) (2.16) | Q8 `q8-ball` |
| L7 §I.1 (pp. 37–38) | decompositions (2.17)–(2.20), convexity (2.21), unitary-freedom theorem | Q8 `q8-recipes` |
| L7 §I.2 (pp. 38–39) | ⟨S₁z⟩ = Tr(ρS₁z) ⇒ ρ(1) = Tr₂ρ; singlet ρ → ½I | Q9 `q9-partial-trace` |
| L7 §I.2 (p. 39) | the classical anti-aligned mixture has the same ρ(1); general ρ (2.22) | Q9 `q9-same-part` |
| L7 §I.3 (p. 39) | S(ρ) = −Σλ log₂λ (2.23); pure 0, ½I one bit, log₂d max | Q9 `q9-entropy` |
| L7 §I.4 (p. 40) | Schmidt (2.24)–(2.28); rank; ρ_A and ρ_B share nonzero λ; "every ρ is a reduced pure state" | Q9 `q9-schmidt`, `q9-purification` |

### 1.2 Built chapters that need re-alignment (exact beats)
| Chapter · beat | Change (fix agent, §7) |
|---|---|
| Q3 header, `outline.ts` | source "notes L3–L4, pp. 11–20"; every Formal cite of pp. 17–20 names L4; rule Q3-2 (erratum N21, Û†ÂÛ) now cites p. 17 (R2) |
| `q3-spin-operators` b1–b3; b6 | → p. 13 (P_{±z} matrices, P̃, S_z); b6 (σ_n, 1.7) → p. 14 |
| `q3-observables` b1; b2, b4; b5 | → pp. 14–15; → p. 15; → p. 16 |
| `q3-spectral` b1–b4; b5 | → p. 17 (L4); → p. 18 |
| `q3-uncertainty` b1; b2; b3–b4; b5 | → p. 18, **eq. 1.9** (was 1.8); → pp. 18–19; → p. 19, **eq. 1.10** (was 1.9); → pp. 19–20 |
| `q3-bloch:b1` | becomes a two-track derivation "four real numbers leave two angles" (p. 12; §4) |
| **new `q3-bloch:b3`** | "⟨σ⟩ is the arrow" (p. 14, eq. 1.8; §4); reuses `N_STATE` (θ = 60°, φ = 45°), q3NVecXY = 0.612, q3NVecZ = 0.5; old b3, b4 → b4, b5 (`qc709-nc` #4; old → new map in the commit) |
| `q4-one-qubit-gates` b2, b4, b6 | notes L5 Rosetta + derivation views (§4): unitarity from norm preservation (eq. 2.2, p. 24); H = (σx+σz)/√2 (p. 24); U_n(θ) series (pp. 24–25) (R3) |
| `q4-cnot` b3–b4; `q4-circuits` | CNOT, CZ as projector sums (pp. 24–25); CNOT = (I⊗H)CZ(I⊗H) (p. 25); new challenges **HW2 P3(a)** and **P3(b)**, full walkthroughs |
| `q4-registers` b1–b3; b5; `q4-circuits:b2` | cite notes p. 21, p. 23; b5's reveal and the Bell-pair beat say "Chapter Q6 builds this" (replaces header Q4-5's "TODO bridge to Q8"); first Bell name "Φ⁺ (notes, N&C: β₀₀; Bergou: Ψ₊)" |
| `Q4.glossary.ts`, Q4 header | F6 no longer exists: Q4 keeps `qc-tensor-product` for good; F3 (old F7) takes `qc-xor` when built |
| Q1 glossary (mixture), Q1 header | "Chapter Q6" → "Chapter Q8" (R1) |
| F1 | "Chapter F4" (Hermitian) → "Chapter Q3"; "Chapter F8" → "Chapter F4"; "Chapter Q17" → "Chapter Q19" (R1) |
| `outline.ts`, `outline.test.ts` | the Part/chapter list of §2; `placeOf('Q8')` → Part III, 50 K; last id Q27; F2–F4 renumbered |
| Q2, Q5 | no notes moves; derivation views and notation beats only (W-709 #7/#8 retrofit) |

### 1.3 HW2 → chapters (SUBMITTED, full walkthroughs allowed)
| Problem | Chapter · unit |
|---|---|
| P1(a)–(d) spin-1 x states from two spin-½; the singlet part of \|+x⟩⊗\|−x⟩ | Q6 `q6-bell-basis` (notes p. 26 names triplet/singlet); Q2 adds one forward line from its HW1 P5 twin |
| P1(e) S_x^tot = S_x⊗1 + 1⊗S_x, block-diagonal on triplet ⊕ singlet | Q6 `q6-tensor` |
| P2(a)–(c) Bell-basis expansion, parities | Q6 `q6-bell-circuit`, `q6-parities` |
| P2(d) Tr₂ of each Bell state = ½I | Q9 `q9-partial-trace` |
| P3(a)–(b) CZ from three exponentials; CNOT = H CZ H | Q4 `q4-circuits` (retrofit) |
| P4 ρ = p\|1⟩⟨1\| + (1−p)\|+⟩⟨+\|, Tr ρ², ⟨σ⟩ | Q8 `q8-mixed` |
| P5(a) N-qubit binomial counts; variance 0 at \|c₀\|² ∈ {0,1}, N/4 at ½ | F2 `f2-counts` (Q7 links back) |
| P5(b)–(c) GHZ against \|+⟩^{⊗3}: mean 3/2, variance 9/4 against 3/4 | Q7 `q7-ghz` |
| P6 ρ = ½(1 + a·σ) | Q8 `q8-ball` |
| P7(a)–(d) GHZ eigenvalues, symmetry, Mermin, XXX/YYX patterns | Q7 `q7-observables`, `q7-mermin`, `q7-parity-table` |
| P7(e) ρ₁₂ = Tr₃\|GHZ⟩⟨GHZ\| | Q9 `q9-partial-trace`; Q8 `q8-why` states it and points forward |

### 1.4 Rosetta items (not errata)
| Item | Course line |
|---|---|
| Bell names: notes use β_xy, as N&C (Φ⁺ = β₀₀, Ψ⁺ = β₀₁, Φ⁻ = β₁₀, Ψ⁻ = β₁₁) | ruling 1 stands; "Φ⁺ (notes, N&C: β₀₀; Bergou: Ψ₊)" on first use per chapter; only Bergou differs |
| Notes number qubits from 1 (qubit 1 = control = leftmost); σ̂_{1x} = σ_x⊗1 | our q0, shown "qubit 1" (ruling 8); Ground-up writes X₁ |
| Notes' Bloch vector of ρ is n (2.14)–(2.16) | course r (C5); one line in Q8 |
| Notes' "separable" (p. 22) means a pure product | Q10 adds the mixed definition and says so |
| Pauli products give ±1 (p. 33), S keeps ħ (p. 18) | "a ±1 of σ is ±ħ/2 of S" (N&C rule) |
| Equations restart at (2.1) in L5; eq. 1.8 is now ⟨σ⟩ = n | commutators are 1.9, Robertson 1.10 |
| p. 38 "BHS" = Bergou–Hillery–Saffman; "p. 20" | printed p. 20 (§2.4) |

## 2. The chapter list for Parts II–V

| Part (plate) | Chapters |
|---|---|
| I QM review (300 K) | Q1 (L1), Q2 (L2), Q3 (L3–L4) |
| II Qubits and circuits (50 K) | Q4, Q5, **Q6** |
| III Correlations and the density matrix (50 K) | **Q7**, Q8, Q9 |
| IV Entanglement (4 K) | Q10, Q11, Q12 |
| V Dynamics and measurement (4 K) | Q13, Q14 |
| VI–XI | old Q13–Q25 → Q15–Q27, titles unchanged |

Bergou pages are printed pages; N&C pages are printed (PDF − 28). ⚑ = a Bergou problem; no sheet assigns any.

#### Q6 · Two qubits: products, entanglement and the Bell basis
**Q** "Two qubits hold four amplitudes, not two pairs: what fits in the extra room, and how do we read it?"

| Field | Content |
|---|---|
| Src | notes L5 pp. 21–23, 25–26, L6 pp. 27–29; Bergou Eqs. 1.3–1.4 p. 2, §3.1 p. 31 (B6 names), §3.4 p. 37; N&C §1.3.6 p. 25 (Fig. 1.12), §2.1.7 pp. 71–74, §10.5.1 p. 454 (XX, ZZ stabilize Φ⁺); Axler 9D p. 370; HW2 P1–P2(c) |
| `q6-many` | dimensions multiply; N bits against 2^N amplitudes; product states; ⟨A⊗B⟩ = ⟨A⟩⟨B⟩; the memory wall (old F6 D6) |
| `q6-tensor` | A⊗B as a block matrix (2.1); A₁ → A⊗I; σ_x⊗σ_z; an operator product is not a state product; S_x^tot (HW2 P1(e)) |
| `q6-entangled` | 6 against 4 parameters; 2N/(2^{N+1}−2) → 0; Φ cannot factor; the det test a₀₀a₁₁ − a₀₁a₁₀ (old F6 D3) |
| `q6-bell-basis` | (2.3)–(2.4); orthonormal; none a product; random singles, perfect pairs; triplet and singlet; HW2 P1(a)–(d) |
| `q6-bell-circuit` | (H⊗I)CNOT: β_xy → \|xy⟩; run backwards it prepares them; Π_xy (2.5); HW2 P2(a), (c) |
| `q6-parities` | U†ZU → XX, ZZ (2.6); they commute; joint eigenvectors (2.7); Π factorizes; M̂ → 2n̂₁ + n̂₂ (2.8); "stabilizer" named; HW2 P2(b) |
| Prereq | Q4 (gates, CNOT, registers); Q3 (projectors; compatible observables, L4 pp. 18–19) |
| Bridges | 448 l7-compatible, l4-projectors, l2-three-bases; 709 Q4 `q4-registers`, `q4-cnot`, `q4-circuits`, Q3 `q3-uncertainty`; in words: Q11, Q12, Part IX codes |

#### Q7 · GHZ and Mermin: certainty without instructions
**Q** "Three qubits give random single readings but a certain product: could hidden instructions explain that?"

| Field | Content |
|---|---|
| Src | notes L6 pp. 29–32, L7 pp. 33–34; Bergou §3.9 p. 57 (GHZ, GHZ against W, losing a qubit), P10.1(a) p. 186 (⚑ GHZ stabilizers, aside only); HW2 P5(b)–(c), P7(a)–(d). Mermin's argument: notes only (no Bergou or N&C passage) |
| `q7-ghz` | GHZ_N; P(000) = P(111) = ½; counting zeros: variance 9/4 against 3/4 for \|+⟩^{⊗3} (HW2 P5) |
| `q7-brackets` | X and Y bases; the eight brackets; ⟨εb\|1⟩ = ζ/√2 with ζ = ε or −iε (2.9) |
| `q7-parity-table` | a run's bracket is (1+s)/4, s = (−i)^{n_y}Π (2.10); the p. 31 table |
| `q7-bit-strings` | XXX keeps even strings, two y's keep odd ones, an odd n_y keeps all eight; Π is a reading |
| `q7-observables` | the four products (2.11) commute; GHZ is their eigenstate (2.12); zero dispersion against ⟨(Δσ_{x1})²⟩ = 1 |
| `q7-mermin` | x₁x₂x₃ forced to −1 against +1, one run each; (2.13) σ_yσ_xσ_y = −σ_x keeps the sign; the best instruction set meets 3 of 4 |
| Prereq | Q6 (Pauli products, parities); Q4 (S, H give the Y basis); F2 (counts; soft) |
| Bridges | 448 l1-logic, l7-order, l3-spread; 709 Q6 `q6-parities`; in words: Q8 (Tr₃ GHZ), Q10 (CHSH, the statistical version) |

#### Q8 · Mixtures, the density matrix and the Bloch ball
**Q** "How do you describe a box of qubits when nobody wrote down which state each one is in?"

| Field | Content |
|---|---|
| Src | notes L7 pp. 34–38; Bergou §2.1 p. 15, §2.2–2.4 pp. 17–24 (2.19, 2.22, 2.24 corrected, 2.28), §5.2 p. 80 (postulates 4a–6a); N&C §2.4.1–2.4.2 pp. 99–105 (Thm 2.6, Ex. 2.72); HW2 P4, P6 |
| `q8-why` | read qubit 1 of GHZ, lose the record → ½(\|00⟩⟨00\| + \|11⟩⟨11\|): a coin, not a superposition (⟨XX⟩ 0 against 1) |
| `q8-pure-rho` | ρ = \|ψ⟩⟨ψ\|; ρ² = ρ; Hermitian; Tr ρ = 1; ρ_ij = c_ic_j*; coherences |
| `q8-trace-rule` | ⟨A⟩ = Tr(Aρ); iħρ̇ = [H, ρ]; Formal: measuring a mixture, Tr(Pρ), PρP/p (postulates 4a–6a) |
| `q8-mixed` | Σ p_n\|ψ_n⟩⟨ψ_n\|; Tr ρ² < 1; the thermal tanh; the \|+z⟩,\|+x⟩ mixture (Tr ρ² = ¾); HW2 P4 |
| `q8-ball` | ρ = ½(I + r·σ) (2.14–2.15); det ρ = (1−\|r\|²)/4 ≥ 0 ⇒ \|r\| ≤ 1; r_j = Tr(ρσ_j); HW2 P6 |
| `q8-recipes` | one ρ, many ensembles (2.17)–(2.20); convexity (2.21); a pure state has one recipe (Bergou p. 20); Formal: unitary freedom with padding |
| Prereq | Q7 (the GHZ box); Q3 (projectors, the sphere); Q2 (outer products) |
| Bridges | 448 l6-mixture, l1-average, l6-bloch, l3-postulates; 709 Q1 (mixture entry), Q3 `q3-bloch`, Q7 `q7-ghz`; in words: Part XI (Lindblad) |

#### Q9 · Parts of a whole: reduced states, entropy, Schmidt
**Q** "If two particles share one pure state, what does each look like alone, and how much is hidden in the link?"

| Field | Content |
|---|---|
| Src | notes L7 pp. 38–40; Bergou §2.1 pp. 15–17 (2.3–2.10), §2.5 p. 24 (2.47–2.56), §2.6–2.7 pp. 25–28, §3.7.1 p. 47; N&C §2.4.3 pp. 105–107, §2.5 pp. 109–111, §9.2 pp. 403–416, §11.3 p. 510; Axler 7E p. 270; HW2 P2(d), P7(e) |
| `q9-partial-trace` | ⟨S₁z⟩ = Tr(ρS₁z) defines ρ(1) = Tr₂ρ; entry by entry; Bell states → ½I; Tr₃ GHZ |
| `q9-same-part` | singlet and anti-aligned coin mixture: same ρ(1) = ½I, different joint ρ; the general form (2.22) |
| `q9-entropy` | S(ρ) (2.23); pure 0, ½I one bit, log₂d max; the p. 37 mixture 0.601 bit; E = S(ρ_A) named |
| `q9-schmidt` | (2.24)–(2.28): ρ_A's eigenbasis forces orthogonal ṽ ⇒ Σ√λ\|u⟩\|w⟩; rank; equal spectra; SVD (Formal) |
| `q9-purification` | every ρ is a reduced pure state (p. 40); Σ√p\|ψ⟩\|u⟩; purifications differ by U_B |
| `q9-distance` [B] | D = \|r₁−r₂\|/2; root fidelity; pure D = √(1−F²) (⚑ P2.5) |
| Prereq | Q8, Q6; F2 (Shannon; soft) |
| Bridges | 448 l6-mixture; 709 Q6 `q6-bell-basis`, Q7 `q7-ghz`, Q8 `q8-ball`; in words: Q12 (E as a measure), Q14 (trace norm), Q23 (old Q21, entropy proofs) |

#### Q10–Q14 (old Q8–Q12; questions and unit jobs as in `P-709-map.md` unless noted)
| Chapter | Src | Units (changes) | Prereq |
|---|---|---|---|
| **Q10** Entanglement, no signalling and Bell's inequality | Bergou §3.1–3.3 pp. 31–37, P3.1–3.2 ⚑; N&C §2.6 pp. 111–117 | `q10-separable` (one link-back to Q6; teaches only ρ = Σp ρ_A⊗ρ_B (3.2), LOCC cannot create) · `q10-no-signal` · `q10-hidden` (links back to Q7's Mermin) · `q10-chsh` · `q10-violation` | Q9, Q7, F2 |
| **Q11** Using entanglement: dense coding, teleportation, swapping | Bergou §3.4 pp. 37–40, P3.3 ⚑, §14.3 pp. 260–262; N&C §1.3.7 pp. 26–28, §2.3 pp. 97–98 | `q11-bell-tools` (old `q9-bell-basis` shrinks to a Q6 link-back + the I, X, Z, XZ cycle) · `q11-dense-coding` · `q11-teleport-algebra` · `q11-teleport-circuit` (Φ⁺, `qc709-nc` #3) · `q11-swapping` · `q11-qudit` (Formal) | Q6, Q10, Q4 |
| **Q12** Detecting and measuring entanglement | Bergou §3.5–3.9 pp. 40–59, P3.4–3.8 ⚑; N&C §12.5 pp. 571–582 | `q12-ppt` · `q12-witness` · `q12-locc` · `q12-entropy` (links back to Q9 for S; adds additivity, LU invariance, E_F) · `q12-concurrence` · `q12-multipartite` (links back to Q7 for GHZ; adds W, SLOCC, CKW 8/9, UPB) | Q9, Q10, F2 |
| **Q13** Open-system maps: Kraus operators and impossible machines | Bergou Ch. 4 pp. 65–75, P4.1–4.5 ⚑; N&C Ch. 8 pp. 353–398, Box 12.1 p. 532 | `q13-from-unitary` · `q13-properties` · `q13-stinespring` · `q13-depolarizing` · `q13-no-cloning` · `q13-herbert`; bridge Q8 `q8-trace-rule` | Q9, Q8, Q10, Q12 |
| **Q14** Generalized measurements and telling states apart | Bergou Ch. 5 pp. 77–104, P5.1–5.6 ⚑; N&C §2.2.4–2.2.8 pp. 86–95 | `q14-pointer` · `q14-povm` · `q14-neumark` · `q14-usd` · `q14-min-error` · `q14-sequential` | Q13, Q3, Q9 |

### 2.1 Dependency graph ("A → B" reads "B needs A")
| Kind | Edges |
|---|---|
| Hard | Q3 → Q4 → Q5; Q3, Q4 → Q6 → Q7 → Q8 → Q9; Q6, Q7, Q9 → Q10 → Q11; Q9, Q10 → Q12; Q8, Q9, Q10 → Q13 → Q14; Q3, Q9 → Q14 |
| Soft (named bridge, either build order) | F2 → Q7, Q9, Q10, Q12 |
| Longest chain | Q4 → Q6 → Q7 → Q8 → Q9 → Q10 → Q13 → Q14 |
| Parallel builds | Q6∥Q7, Q8∥Q9∥F2, Q10∥Q11∥Q12, Q13∥Q14: one planner writes each group's plans together, so ownership is fixed before either build; each names the other in words until both merge |

### 2.2 Ownership rulings (one owner per concept)
| Concept | Owner (others link back) |
|---|---|
| kets ⊗, ℂ²⊗ℂ², 2ⁿ registers | Q4 (built; keeps `qc-tensor-product`); Q6 adds operator ⊗, d₁d₂ and the block rule |
| product/entangled (pure), parameter count, factoring test, Bell basis, Bell measurement and Π_xy | Q6 (was F6, Q8, Q9) |
| stabilizer notation, Pauli parities | Q6; Q7 uses it; Part IX (old Q20 → Q22) builds the formalism |
| GHZ, Mermin | Q7; Q12 links back for GHZ; CHSH and LHV statistics stay in Q10 |
| ρ, Tr, mixtures, Bloch ball, von Neumann equation | Q8 |
| partial trace, S(ρ), Schmidt, purification, distance, fidelity | Q9 (S's definition moves from old Q10; proofs stay in Part X) |
| binomial counts, Shannon H, joint/marginal/correlators | F2 (old F5) |
| positive operators · √A, SVD · polar · unitarity, U_n(θ) | Q8 · Q9 Formal · Q14 Formal · Q4 (folded from F4) |

## 3. F2–F6: the scope Parts II–V need

Parts II–V lean on Foundations only through the built Q1–Q4, the notes themselves, and probability. Four of the five
planned chapters would re-teach built units in both tracks.

| Old F | Verdict | Where its content lives now (gap check) |
|---|---|---|
| F2 Arrows with many parts | **fold** | Q1 `q1-vector-space`, `q1-inner-product`; Q2 `q2-basis`, `q2-gram-schmidt` (built, both tracks); Cauchy–Schwarz: Q3 (L4 p. 19). The 3-D Gram–Schmidt film is dropped |
| F3 Machines that move arrows | **fold** | Q2 `q2-operators`, `q2-change` (A_ij, \|a⟩⟨b\|, U, UAU†); AB ≠ BA: Q3 (p. 17), Q4; 2×2 det: Q3; trace: Q8's notation beat. Null space, rank–nullity, isomorphism: used by nothing through Part V |
| F4 Special directions | **fold** | eigen, Hermitian, spectral, f(A), commuting: Q3 (L4); unitary: Q4 (eq. 2.2); positive: Q8; √A, SVD: Q9 Formal; polar: Q14 Formal; e^{−iθn·σ/2}: Q4 |
| F5 Chance with numbers | **keep, trim → new F2** | needed by Q7 (HW2 P5 counts), Q9 (Shannon under S), Q10 (joint distributions, correlators), Q14 (priors) |
| F6 Many at once | **fold into Q6** | its Ground-up ramp becomes Q6's: multiplication grid, two dice, the distributive law (D2), the det test (D3), the memory wall (D6) |
| F7, F8 | untouched (Parts VII+) | renumbered F3, F4 (judge Q4) |

| New F2 · Chance with numbers | Content |
|---|---|
| `f2-probability` | frequencies; probabilities sum to 1; independent events multiply |
| `f2-average-spread` | Σ M P; variance; σ/√N |
| `f2-counts` | the binomial count of N independent trials, mean Np, variance Np(1−p): the coin twin of HW2 P5(a) (the qubit version is Q7's) |
| `f2-joint` | joint, marginal, conditional; independence; the correlator ⟨ab⟩; the marginal problem as a Bell preview |
| `f2-surprise` | bits; twenty questions; Shannon H; h(p) |
| Moved to Part X (old Q21 → Q23) | mutual information, KL, classical fidelity, L1 distance |
| Src | notes p. 15 (⟨M⟩ = Σ M_αP_α), p. 18 (⟨Aⁿ⟩); N&C App. 1 p. 608, §11.1 pp. 500–503; Bergou §3.3 pp. 34–37, §3.7.1 p. 47; Reif §1.2–1.6 (reference only, as in 448) |
| Bridges | 448 l1-average, l3-spread, l7-spreads; reuses `binomialPmf` and the `sigmaBand` readout |
| Saving / loss | four chapters × ≈ 4.5 points ≈ **18 points**; lost: Foundations-level Formal extras (dual spaces, rank–nullity, Jordan form) and three planned films. No Part II–V derivation needs them |

## 4. Derivations and their visuals

Each row: a derivation (source) and its views in order as `kind{fields}`, separated by ·. Both tracks step the same
views unless the row says otherwise; a Formal list may merge lines but keeps ≥ 2 distinct views (W-709 #7). Fields
beyond `matrix` v1 are defined in §6. The retrofit of the derivations already in F1 and Q1–Q5 is the fix agents'
work; only *new* Q3/Q4 derivations are listed.

| Ch | Derivation (source) | Views |
|---|---|---|
| Q3 | four real numbers leave two angles (p. 12) | `amplitudes{ket, dials}` · a's hue turned to 0 (global phase gone) · `probability` (sum 1) · `bloch{θ, φ}` |
| Q3 | ⟨σ⟩ = n (p. 14, 1.8) | `bloch{readouts: averages, dropLines: z}` (c² − s² = cos θ) · `dropLines: x` · `dropLines: y` · `{averages, spreads}` (zero spread along n̂); Formal adds `matrix{product: [σ_y, ket]}` |
| Q4 | unitarity (p. 24, 2.2) | `amplitudes{probability}` before · after (same total) · `matrix{product: [U†, U]}` = I |
| Q4 | U_n(θ) by the series (pp. 24–25) | `matrix{product: [n·σ, n·σ]}` = I · `matrix{lin: cos(θ/2)I − i sin(θ/2)n·σ}` at θ steps · `bloch{rotate: n}` |
| Q4 | controlled gates as projector sums (pp. 24–25) | `matrix{kron: [\|0⟩⟨0\|, I], blocks: 2}` · `{kron: [\|1⟩⟨1\|, X]}` · their `lin` sum = CNOT · same for CZ |
| Q4 | CNOT = (I⊗H)CZ(I⊗H) (p. 25; HW2 P3(b)) | `circuit` (H, CZ, H) · `matrix{product}` = CNOT |
| Q4 | HW2 P3(a), CZ from three exponentials | `matrix{gate: e^{iπ/4 Z₂}}` · `e^{iπ/4 Z₁}` · `e^{−iπ/4 Z₁Z₂}` (phase cells) · product × e^{−iπ/4} = CZ |
| Q6 | D1 dimensions multiply (p. 21) | `amplitudes` 1 qubit · 2 qubits · 3 qubits (Ground-up caption: a multiplication grid) |
| Q6 | D2 ⟨A⊗B⟩ = ⟨A⟩⟨B⟩ (p. 22) | `matrix{kron: [A, B], blocks: 2}` · `amplitudes{ket: ψ₁⊗ψ₂}` · `two-qubit{grid: T}` (cells r_A,i r_B,j) |
| Q6 | D3 6 against 4 parameters (p. 22) | `amplitudes` (4 complex bars = 8 numbers, −2) · `two-qubit` (2 + 2 angles); Formal: 2·2^N − 2 against 2N, 0.98 % at N = 10 (`paramCount`) |
| Q6 | D4 Φ cannot factor (p. 22) | `amplitudes{(a,b)⊗(c,d)}` (ad, bc lit) · `amplitudes{bell: Φ⁺}` (01, 10 empty) · `matrix{coef: Φ⁺, svd}` (two equal bars) · `matrix{coef: product, svd}` (one bar) |
| Q6 | D5 block rule (2.1), σ_x⊗σ_z (p. 23) | `matrix{pauli: X}` · `matrix{kron: [X, Z], blocks: 2, highlight}` · values shown |
| Q6 | D6 S_x^tot (HW2 P1(e)) | `matrix{kron: [S_x, I]}` · `{kron: [I, S_x]}` · `lin` sum · `matrix{basis: [\|00⟩, β₀₁, \|11⟩, β₁₁]}` (3 + 1 blocks) |
| Q6 | D7 Bell orthonormality (p. 25) | `amplitudes{bell: Φ⁺}` against `{bell: Φ⁻}` (sign flip) · `matrix{product: [B†, B]}` = I |
| Q6 | D8 Bell measurement (p. 26) | `circuit` Fig. 7 + `amplitudes` split at upTo 0 · 1 (CNOT folds the target) · 2 (each bar collapses to \|xy⟩) |
| Q6 | D9 preparation by reversal (p. 27) | `circuit` (H, then CNOT) + `amplitudes` at upTo 0 · 1 · 2 |
| Q6 | D10 U†(Z⊗I)U = XX, U†(I⊗Z)U = ZZ (2.6) | `circuit{observable: ZI at the end}` · moved to col 0, reads XX · `matrix{product: [U†, ZI, U]}` = XX · same for IZ → ZZ; Ground-up first steps HZH = X on `bloch` |
| Q6 | D11 [XX, ZZ] = 0 (p. 28) | `matrix{tableau: [XX, ZZ]}` (two anticommuting columns, signs cancel) · `matrix{product: [XX, ZZ]}` = `{product: [ZZ, XX]}` |
| Q6 | D12 (2.7) and Π factorization (p. 28) | `two-qubit{bell: β_xy, grid, highlight: xx, zz}` per xy · `matrix{lin: ½(I ± XX)}` · `matrix{product}` = Π_xy |
| Q6 | D13 M̂ → 2n̂₁ + n̂₂ (2.8) | `matrix{M̂, basis: bell}` = diag(0,1,2,3) · `matrix{product: [U, M̂, U†]}` (computational) = diag(0,1,2,3) |
| Q6 | HW2 P2(a), (c) | `amplitudes{ket, inBasis: bell}` · `two-qubit{grid, highlight: xx, zz}` (parities as averages) |
| Q7 | D1 GHZ bits and counts (p. 29; HW2 P5) | `amplitudes{ghz 3}` · `{probability, stats: zeros}` (3/2, 9/4) · `{ket: \|+⟩^{⊗3}, stats: zeros}` (9/4 → 3/4) |
| Q7 | D2 the eight brackets (2.9) | `complex-plane{marks: ζ for (x,±), (y,±)}` · `amplitudes{ket: \|±x⟩/\|±y⟩, bases}` |
| Q7 | D3 (1+s)/4 (2.10) | `complex-plane{z: 1, w: s, sum}` at s = 1, −1, ±i · `amplitudes{ghz, bases: xxx}` (P = \|1+s\|²/16) |
| Q7 | D4 the p. 31 table | `amplitudes{ghz, bases: xxx, parity}` (even ¼, odd 0) · `{bases: yyx}` (odd) · `{bases: xxy}` (all ⅛) |
| Q7 | D5 (2.12), zero dispersion (p. 33) | `matrix{pauli: XXX}` (8×8 anti-diagonal) · `amplitudes{ghz, signed}` under XXX (unchanged) · under YYX (flipped) · `amplitudes{bases: xxx, stats: product}` against σ_x1's spread |
| Q7 | D6 Mermin's contradiction (p. 34) | `matrix{tableau: [YYX, YXY, XYY], values}` · each y twice ⇒ x₁x₂x₃ = −1 · `{tableau: [XXX]}` = +1; Ground-up tries two instruction cards (3 of 4 each) |
| Q7 | D7 (2.13) (p. 34) | `matrix{tableau: [YYX, YXY, XYY], product}` (qubit 2: σ_yσ_xσ_y = −σ_x) · `matrix{product}` = −XXX |
| Q8 | D1 the GHZ box (pp. 34–35) | `amplitudes{ghz}` · two branches \|00⟩, \|11⟩ · `matrix{rho: mixture}` against `{rho: Φ⁺}` (coherences) · `two-qubit{grid}` (xx 0 against 1) |
| Q8 | D2 ρ_ij = c_ic_j* (p. 35) | `amplitudes{ket}` · `matrix{outer, highlight: diagonal}` · `highlight: off-diagonal` (coherences) |
| Q8 | D3 Tr ρ = 1 (p. 35) | `matrix{outer, trace}` · `amplitudes{probability}` (same sum) |
| Q8 | D4 ⟨A⟩ = Tr(Aρ) (p. 36) | `matrix A` · `matrix ρ` · `matrix{product: [A, ρ], trace}` |
| Q8 | D5 iħρ̇ = [H, ρ] (p. 36) | `bloch{rotate: z}` over t · `matrix{rho(t)}` (off-diagonal hue turns); Formal adds `{lin: Hρ − ρH}` |
| Q8 | D6 thermal mixture (p. 36) | `matrix{rho: diag(p↑, p↓)}` · `bloch-ball` point at tanh(E_Z/2k_BT), swept in T |
| Q8 | D7 \|+z⟩,\|+x⟩ mixture (pp. 36–37) | `bloch-ball{recipe}` (chord midpoint) · `matrix` [[¾,¼],[¼,¼]], Tr ρ² = ¾ · `bloch-ball{readouts}` (⟨S_z⟩ = ⟨S_x⟩ = ħ/4) |
| Q8 | D8 ρ = ½(I + r·σ), det ρ (2.14–2.15) | `operator-space{a₀ = ½, a = r/2}` · `matrix{lin: ½I + ½r·σ}` · `bloch-ball` (inside mixed, surface det = 0) |
| Q8 | D9 r_j = Tr(ρσ_j) (2.16) | `matrix{product: [ρ, σ_x], trace}` · `bloch-ball{dropLines}` |
| Q8 | D10–11 decompositions (2.18–2.20) | `bloch-ball{recipe: z-poles}` · `{x-poles}` (same centre) · `{\|0⟩, \|+x⟩}` · `{\|u±⟩}` (same point) · `matrix{spectrum}` |
| Q8 | D12 convexity (2.21) | `bloch-ball{chord}` swept in θ · `matrix{lin}` at one θ |
| Q8 | D13 unitary freedom (Formal; Bergou 2.28) | `matrix{U_ij}` · `bloch-ball{recipe}` (dots move, centroid fixed) |
| Q8 | HW2 P4, P6 | `bloch-ball` p swept along the \|+⟩–\|1⟩ chord · `matrix{rho}` |
| Q9 | D1 Tr₂ from ⟨S₁z⟩ (p. 38) | `matrix{rho, blocks: 2}` · `{partialTrace: B}` overlay · reduced 2×2 · `bloch-ball` point |
| Q9 | D2 singlet → ½I (pp. 38–39) | `matrix{outer: Ψ⁻}` (−½ coherences) · `{partialTrace: B}` · `two-qubit{grid}` (arrows 0, diag(−1,−1,−1)) |
| Q9 | D3 coin mixture, same part (p. 39) | `matrix{rho: diag(0,½,½,0), partialTrace: B}` · `two-qubit{grid}` (only zz = −1) |
| Q9 | D4 Tr₃ GHZ (HW2 P7(e)) | `matrix{outer: ghz 3, blocks: 2}` · `{partialTrace: {keep: [0,1]}}` · `two-qubit{reduce: ghz}` (zz = 1, xx = yy = 0) |
| Q9 | D5 Bell states → ½I (HW2 P2(d)) | `two-qubit{bell}` ×4 · `matrix{partialTrace}` (all ½I) |
| Q9 | D6–7 S(ρ) (2.23) | `matrix{spectrum: entropy}` pure · ½I · ¼I₄ (2 bits) · `plot{S against \|r\|}` (fallback: `bloch-ball` radius sweep + S readout) |
| Q9 | D8 Schmidt (2.24–2.28) | `matrix{coef, highlightRow}` (ṽ rows) · `matrix{rho: Tr_B, spectrum}` · `matrix{coef, svd}` · `two-qubit{family: cos-sin}` |
| Q9 | D9 equal spectra | `matrix{partialTrace: B, spectrum}` · `{partialTrace: A, spectrum}` |
| Q9 | D10 purification | `bloch-ball` (mixed point) · `matrix{outer: purify(ρ)}` · `{partialTrace: B}` → ρ |
| Q9 | D11 D = \|r₁ − r₂\|/2 | `bloch-ball` (two points, segment) · `matrix{lin: ρ₁ − ρ₂, spectrum}` (±D) |
| Q9 | D12 pure D = √(1−F²) (⚑ P2.5) | `hilbert-plane` (two kets) · `bloch` (two points, chord) |
| Q10 | D1–D6 (old map's list) | **D1 separable against Φ⁺**: `two-qubit{grid}` coin mixture · Φ⁺; **D2 no signalling**: `two-qubit{condition: A measures z}` (Bob's ± arrows) · their average 0 · `matrix{partialTrace}`; **D3 X = ±2**: `matrix{tableau, values}` one assignment · four assignments; **D4 2√2**: `two-qubit{axes, readouts: chsh}` swept in φ · `plot{S against φ}`; **D5 product ≤ 2**: `two-qubit{product}` (grid = outer product of arrows) · `plot` marker; **D6 Tsirelson**: `matrix{product: [C, C]}` = 4I + [A₁,A₂]⊗[B₁,B₂] · `{spectrum}` (max 8) |
| Q11 | D1–D5 (old map's list) | **D1 Pauli cycle**: `two-qubit{bell, local: X/Z on B, grid}` · `amplitudes{inBasis: bell}`; **D2 dense coding**: `circuit` (encode, decode) + `amplitudes` at upTo steps; **D3 teleport regrouping**: `amplitudes` (8 bars) · `{inBasis: bell on q0, q1}` · `circuit{branches}`; **D4 Bob before the call**: `bloch-ball` (centre) · after correction (ψ); **D5 swapping**: `circuit` (4 qubits) · `two-qubit` on the far pair |
| Q12 | D1–D6 (old map's list) | **D1 ρ^{T_B}**: `matrix{rho}` · `{ptranspose: B}` (cells move); **D2 λ₄ < 0**: `matrix{spectrum}` swept in p (negative flagged) · `plot{λ_min against p}`; **D3 witness**: `matrix W` · `matrix{product: [ρ, W], trace}`; **D4 Procrustean**: `amplitudes` (success/failure branches) · `circuit`; **D5 C = 2√(λ₁λ₂)**: `matrix{coef, svd}` · `two-qubit{readouts: concurrence}`; **D6 W, CKW**: `amplitudes{W}` · `two-qubit` per pair (C_AB = C_AC = ⅔) |
| Q13 | D1–D6 (old map's list) | **D1 Σ A†A = I**: `circuit` (system + environment) · `matrix{lin: Σ A†A}`; **D2 T(ρ)**: `matrix{U(ρ⊗\|0⟩⟨0\|)U†, partialTrace}` · `bloch-ball{ellipsoid}`; **D3 transpose ⊗ I**: `matrix{outer: Φ⁺}` · `{ptranspose: B, spectrum}` (−½); **D4 1 − 4p/3**: `bloch-ball{ellipsoid}` swept in p · `plot{\|r'\| against p}`; **D5 no-cloning**: `amplitudes` U\|0⟩\|0⟩, U\|1⟩\|0⟩ · their sum against \|ψ⟩\|ψ⟩; **D6 Herbert**: `bloch-ball` (copies tell the basis) · `two-qubit` |
| Q14 | D1–D6 (old map's list) | **D1 pointer shift**: `lab-r3` (the SG spot is the pointer) · `{tallies}`; **D2 Σ A†A = I**: `circuit` (system + ancilla) · `matrix{lin: Σ A†A}` = I; **D3 trine**: `bloch` (three states) · `matrix{lin: Σ ⅔\|ψ⟩⟨ψ\|}` = I; **D4 USD needs orthogonality**: `hilbert-plane{ψ₁, ψ₂}` · `{project onto ψ₂^⊥}`; **D5 AM–GM, Fig. 5.1**: `plot{Q against η₁}` · `hilbert-plane`; **D6 Helstrom**: `bloch-ball` (two states) · `matrix{lin: η₂ρ₂ − η₁ρ₁, spectrum}` |
| F2 | D1–D4 (old map's list) | **D1–D2 mean, variance**: `lab-r3{tallies}` · `amplitudes{probability}`; **D3 binomial counts**: `amplitudes{product of N, probability, stats: zeros}` at N = 1 · 2 · 3; **D4 σ/√N**: `lab-r3{sigmaBand}` swept in N · `amplitudes`; **D5–D6 H, h(p)**: `amplitudes{probability}` 2 · 4 · 8 equal bars (1, 2, 3 bits) · `plot{h(p)}` |

## 5. New spaces and notations

One notation beat per term (W-709 #8: `GlossEntry.introduces`, `Beat.introduces`), with a stage view and captions in
both tracks. **R** marks a built chapter: the retrofit agent tags an existing beat and adds a view where it lacks one.

| Term | Type | Introduced in (unit) | Visual |
|---|---|---|---|
| ℂ, the number plane | space | F1 `f1-plane` **R** | complex-plane |
| ket \|ψ⟩; ℂ² (Vⁿ(ℂ)) | space | Q1 `q1-superposition`, `q1-vector-space` **R** | amplitudes (2 bars) + hilbert-plane real slice |
| bra ⟨φ\|, ⟨φ\|ψ⟩ | notation | Q1 `q1-inner-product` **R** | hilbert-plane shadow |
| c_i = ⟨e_i\|ψ⟩ · \|a⟩⟨b\|, A_ij = ⟨i\|A\|j⟩ · change-of-basis U | notation | Q2 `q2-basis` · `q2-operators` · `q2-change` **R** | hilbert-plane + amplitudes · matrix{outer}, matrix{gate, highlight cell} · hilbert-plane frames + matrix |
| projector P_M | notation | Q3 `q3-born` **R** | hilbert-plane project + matrix{outer} |
| Bloch sphere S² | space | Q3 `q3-bloch` **R** | bloch |
| Pauli σ, σ_n = n·σ; operator space a₀I + a·σ | notation; space | Q3 `q3-spin-operators` **R** | matrix{pauli} + operator-space |
| A† · Σ a\|a⟩⟨a\|, f(A) · [A, B], {A, B} | notation | Q3 `q3-observables` · `q3-spectral` · `q3-uncertainty` **R** | matrix (mirrored cells, conjugated hue) · matrix{basis: eigenbasis} · matrix{product} AB against BA |
| \|0⟩, \|1⟩ · gate as a matrix · circuit wire | notation | Q4 `q4-qubit` · `q4-one-qubit-gates` · `q4-circuits` **R** | bloch709 + amplitudes · matrix{gate} · circuit |
| ℂ²⊗ℂ², (ℂ²)^{⊗n}, \|ab⟩ | space | Q4 `q4-registers` **R** | amplitudes (4 and 8 bars) + matrix{kron: [ket, ket]} column |
| ⊕; controlled-U | notation | Q4 `q4-cnot` **R** | circuit; matrix{kron, blocks: 2} |
| ℂ^{d₁}⊗ℂ^{d₂}, dimensions multiply | space | Q6 `q6-many` | amplitudes 2 → 4 → 8 + matrix block grid |
| A⊗B, A₁ = A⊗I (notes σ̂_{1x}) | notation | Q6 `q6-tensor` | matrix{kron, blocks: 2} |
| ⟨A⊗B⟩ = ⟨A⟩⟨B⟩; the correlation grid ⟨σ_i⊗σ_j⟩ and reduced arrows | notation; space | Q6 `q6-many` | two-qubit{grid} |
| \|β_xy⟩, Φ±, Ψ±; (−1)^x, 1⊕y | notation | Q6 `q6-bell-basis` | amplitudes{bell} + matrix{basis: bell} |
| the Bell basis as a second ON basis of ℂ⁴ | space | Q6 `q6-bell-basis` | amplitudes{inBasis: bell} |
| Π_xy | notation | Q6 `q6-bell-circuit` | matrix{basis: bell} (one diagonal 1) |
| Pauli strings XX, ZZ; stabilizer g\|ψ⟩ = +\|ψ⟩, ⟨XX, ZZ⟩ | notation | Q6 `q6-parities` | matrix{tableau} + two-qubit{highlight} |
| n̂_i = \|1⟩⟨1\|_i | notation | Q6 `q6-parities` | matrix (diagonal 0, 1) |
| GHZ_N | notation | Q7 `q7-ghz` | amplitudes |
| a run (b_k, ε_k); ζ_k; n_y; Π | notation | Q7 `q7-brackets` | complex-plane (ζ marks) + amplitudes{bases} |
| Ô_XXX … (Pauli-product observables) | notation | Q7 `q7-observables` | matrix{tableau}; matrix{pauli: XXX} |
| hidden values x_i, y_i | notation | Q7 `q7-mermin` | matrix{tableau, values} |
| ρ = \|ψ⟩⟨ψ\|; Tr; coherences ρ_ij (i ≠ j) — three beats | notation | Q8 `q8-pure-rho` | matrix{outer} · {trace} · {highlight off-diagonal} |
| [H, ρ], iħρ̇ | notation | Q8 `q8-trace-rule` | bloch{rotate} + matrix (hue turning) |
| Σ p_n\|ψ_n⟩⟨ψ_n\|; Tr ρ² | notation | Q8 `q8-mixed` | bloch-ball{recipe} + matrix |
| Bloch ball, ρ = ½(I + r·σ) | space | Q8 `q8-ball` (448 l6-mixture bridge) | bloch-ball + operator-space |
| the convex set of ρ | space | Q8 `q8-recipes` | bloch-ball{chord} |
| ρ_AB, Tr_B, ρ(1) | notation | Q9 `q9-partial-trace` | matrix{partialTrace} + two-qubit |
| S(ρ) | notation | Q9 `q9-entropy` | matrix{spectrum: entropy} |
| Schmidt form Σ√λ\|u⟩\|w⟩; rank | notation | Q9 `q9-schmidt` | matrix{coef, svd} + two-qubit{family} |
| purification \|Ψ⟩_{AR} | notation | Q9 `q9-purification` | matrix{outer, partialTrace} |
| D(ρ, σ), F(ρ, σ), ‖·‖₁ | notation | Q9 `q9-distance` | bloch-ball (two points) + matrix{spectrum} |
| separable Σp ρ_A⊗ρ_B | notation | Q10 `q10-separable` | two-qubit + matrix |
| correlator ⟨ab⟩, CHSH S | notation | Q10 `q10-chsh` | two-qubit{axes, readouts: chsh} |
| ρ^{T_B} | notation | Q12 `q12-ppt` | matrix{ptranspose} |
| ψ̃ = σ_y⊗σ_y ψ*, C | notation | Q12 `q12-concurrence` | matrix{coef, svd} + two-qubit |
| 𝓔(ρ) = Σ AρA† · Choi matrix | notation | Q13 `q13-from-unitary` · `q13-properties` | circuit + bloch-ball{ellipsoid} · matrix |
| {Π_j}, A_j = U_j√Π_j | notation | Q14 `q14-povm` | bloch (directions) + matrix{lin} |


## 6. Engine gaps and stage-kind needs

**Already in the engine (no work):** `state` ghz, wState, bell, BELL_BASIS, coefMatrix, isProduct, schmidtRank ·
`measure` bellMeasure, measureInBasis (one qubit), expectationN, varianceN · `gates` pauliString(s), cliffordConj
(UPU†) · `cmat` kronM, eigh, sqrtPSD, logPSD, svd, polar, expmHermitian · `density` densityOf, mixtureN, isDensity,
purityN, partialTrace (any qubit set), reducedDensity, reducedBloch, ptranspose, schmidt, purify, traceDistance,
fidelity, fvdg, postMeasureRho · `random` binomialPmf.

**Gaps.** Twins go in `pipeline/make_qc_fixtures.py` (seed 709, numpy/scipy only); every learner-visible number gets a
property test.

| Module | Function (chapters) | numpy-twin route |
|---|---|---|
| **E1** `state` | `paramCount(n)` → {general 2·2ⁿ−2, product 2n} (Q6); `bellAmplitudes(ψ)` = ⟨β_xy\|ψ⟩ (Q6, Q11) | the formula; an explicit Bell matrix @ ψ |
| E1 `gates` (Pauli) | `pauliMul(a,b)` → {phase ∈ {±1, ±i}, string}; `paulisCommute(a,b)`; `pauliEigenvalue(ψ, s)` → ±1 or null; `heisenberg(U, s)` = U†PU via `cliffordConj(U†)` (Q6, Q7) | matrix products, ‖[P,Q]‖; Pψ ∓ ψ; all strings n ≤ 3 |
| E1 `measure` | `localBasisProbs(ψ, bases)` (one x/y/z basis per qubit, 2ⁿ outcome probabilities); `runBracket(ψ, bases, eps)`; `weightStats(ψ, bit)` (mean, variance of the count) (Q7, F2) | kron of B† then \|·\|²; probabilities × Hamming weight |
| E1 `bits` | `merminInstructionSets()` → 64 assignments, constraints met, max = 3 (Q7) | itertools.product |
| E1 `density` | `vonNeumann(ρ)` (log₂, 0·log 0 = 0); `entanglementEntropy(ψ, A)`; `spectrum(ρ)`; `evolveRho(H, ρ, t)`; `thermalPolarization(x)` = tanh(x/2); `eigenEnsemble(ρ)` ((2.19)–(2.20)); `ensembleUnitary(e₁, e₂)` (Q8, Q9) | eigvalsh; expm; closed form; U by least squares from the √p-weighted ket matrices, checked unitary |
| E1 `info` (new) | `mean`, `variance`, `binomialMoments(N, p)`, `shannon`, `binaryEntropy`, `marginals`, `correlatorC(pxy)` (F2, Q10) | numpy; scipy.stats.binom |
| **E2** `entangle` | `correlator`, `correlationTensor`, `chsh`, `chshOperator`, `chshMaxHorodecki`, `lhvChsh`, `prBox`, `isPPT`, `negativity`, `witnessFromPPT`, `concurrencePure`, `concurrence` (Wootters), `eofFromC`, `procrustean`, `ckw` (Q10, Q12) | as map (b) "entangle" |
| E2 `teleport` | `teleport`, `denseCode`, `swapIdentity`, `weylBell` (Q11) | explicit 3- and 4-qubit vectors |
| **E3** `channels`, `povm` | as map (b), old Q11 → **Q13**, old Q12 → **Q14** | as map (b) |

### 6.1 `two-qubit`: exact fields (proposed as SVG; judge Q6)
```ts
type TQSource =
  | { ket: AmpKetSource }                                  // any two-qubit ket `amplitudes` accepts (bell, circuit output…)
  | { family: 'cos-sin'; thetaDeg: number }                // cos θ|00⟩ + sin θ|11⟩, sweepable
  | { rho: MatrixRhoSource }                               // the matrix kind's ρ sources
  | { reduce: { ket: AmpKetSource; keep: [number, number] } }  // 3 qubits, one traced out (Tr₃ GHZ)
interface TwoQubitState {
  kind: 'two-qubit'
  source: TQSource
  local?: { qubit: 0 | 1; gate: GateName }[]               // local gates before drawing (Q11)
  condition?: { qubit: 0 | 1; basis: 'x' | 'y' | 'z'; outcome: 0 | 1 }   // partner's arrow after a reading (Q10)
  arrows?: 'reduced' | 'none'                              // r_A, r_B = reducedBloch; |r| < 1 drawn as mixed
  grid?: 'none' | 'T' | 'T-minus-rr'                       // 3×3 ⟨σ_i⊗σ_j⟩, or T − r_A r_Bᵀ
  highlight?: Array<`${'x' | 'y' | 'z'}${'x' | 'y' | 'z'}`> // e.g. ['xx', 'zz'] (Bell stabilizers)
  axes?: { a?: Dir[]; b?: Dir[] }                          // ≤ 2 measurement directions per ball (CHSH)
  readouts?: ('purity' | 'rLength' | 'entropy' | 'concurrence' | 'chsh')[]
  labels?: 'A-B' | 'q1-q2'                                 // Alice/Bob, or the notes' qubit 1/2
}
```
| Aspect | Rule |
|---|---|
| Resolve | engine only: T from `expectationN(pauliString(ij))` until E2's `correlationTensor`; entropy from E1; concurrence, chsh from E2 (validator rejects a readout whose function has not landed) |
| Validation | 2 qubits (3 with `reduce`); ≤ 2 axes per side; `condition` only on a pure `ket` source |
| Passport / fidelity | "STATE · two qubits", note "not a place · arrows are local averages · cells are correlations"; keys `qc-tq-local-arrows` (a short arrow is a mixed part, not a weaker spin), `qc-tq-grid-signed`, `qc-tq-not-two-places` |
| Print | the SVG is its own figure (W-709 #7 strips work) |

### 6.2 Field needs on other kinds
| Kind | Needs (beyond what is built or in build) | First user |
|---|---|---|
| `matrix` v2 | Pauli strings n ≤ 3 (`{pauli: 'XYY'}`, 8×8, `blocks: 2 \| 4`) | Q6, Q7 |
| `matrix` v2 | `{product: Src[]}`, `{adjoint: Src}`, `{lin: [{c, src}]}`, c from a fixed exact set (±1, ±½, ±i, ±1/√2, cos/sin of a named angle): U†(Z⊗I)U, Π_xy, M̂, Tr(Aρ), Σ A†A, r·σ/2 | Q4 retrofit, Q6 |
| `matrix` v2 | `partialTrace: {keep: number[]}` beside 'A' \| 'B' (Tr₃ GHZ; the engine already takes any set) | Q9 |
| `matrix` v2 | `basis?: 'bell' \| KetSource[]` (shows B†MB, row labels from the kets) | Q6 |
| `matrix` v2 | `spectrum?: 'bars' \| 'entropy'` (eigenvalue bars, negatives flagged; entropy adds −λlog₂λ and an S readout) | Q8, Q9, Q12 |
| `matrix` v2 | `ptranspose?: 'B'` (moved cells highlighted) | Q12, Q13 |
| `matrix` v2 | `{tableau: string[], product?: true, values?: {x, y}}`: Pauli-string table, letters coloured, column products and phase from `pauliMul`; with `values`, the four ±1 products of an instruction set | Q6, Q7, Q10 |
| `amplitudes` | `bases?: ('x'\|'y'\|'z')[]` (bars = `localBasisProbs`, bit labels with + ↔ 0); `inBasis?: 'bell'` (named pair); `parity?: true`; `stats?: 'zeros' \| 'product'` | Q6, Q7, F2 |
| `bloch-ball` | `ellipsoid` (Q13), `trajectory` (Q8 [H, ρ]), as map (c) | Q8, Q13 |
| `circuit` | optional `observable?: {pauli, col}`, a Pauli string on the wires moved by `heisenberg` | Q6 |
| `plot` (new SVG; judge Q7) | `{fn: EngineCurveKey, x: {min, max}, at?}`: an engine-sampled curve plus a marker | Q9, Q10, Q12–Q14, F2 |

## 7. Build batches

Costs in weekly points: an Opus planner ≈ 1.5 per two chapters, a Sonnet build ≈ 2 per chapter, an Opus review ≈ 1 per
chapter, a Sonnet fix, engine or stage agent ≈ 1–2. Opus plans and reviews; Sonnet builds and fixes. The judge (main
session) rules each plan (`04`) and merges each branch (`08`, `09`) between steps; check usage after every batch (`18`).

| Batch | Steps (skill · model · points) | Parallel | Points |
|---|---|---|---|
| 1 (in flight) | re-map (this); W-709 #7/#8; `matrix` v1; reviews Q2+Q3, Q4+Q5 | yes | spent |
| 2 | **E1** (`11` · Sonnet · 1) · **two-qubit** (`10` · Sonnet · 2) · **matrix v2 + amplitudes/circuit fields** (`10` · Sonnet · 1.5) · **plan Q6+Q7** (`03` · Opus · 1.5) · retrofit **R1** F1+Q1, **R2** Q2+Q3 (`07` · Sonnet · 1.5 each: review items, §1.2 moves, derivation views, notation beats) | 6 agents | 9 |
| 3 | **build Q6, Q7** (`05` · Sonnet · 2 each) · retrofit **R3** Q4+Q5 (`07` · Sonnet · 1.5; needs matrix v2) · **plan Q8+Q9+F2** (`03` · Opus · 2) · **E2** (`11` · Sonnet · 1.5) | 5 | 9 |
| 4 | **review Q6, Q7** (`06` · Opus · 2) → **fix** (`07` · Sonnet · 2) · **build Q8, Q9, F2** (Sonnet · 6) · **plan Q10+Q11+Q12** (Opus · 2) · **plot** kind if ruled (Sonnet · 1) | 6 | 13 |
| 5 | **review Q8, Q9, F2** (3) → **fix** (3) · **build Q10, Q11, Q12** (6) · **E3** (1.5) · **plan Q13+Q14** (1.5) | 6 | 15 |
| 6 | **review Q10–Q12** (3) → **fix** (3) · **build Q13, Q14** (4) | 4 | 10 |
| 7 | **review Q13, Q14** (2) → **fix** (2) · BUILD-LOG, `graphify update .` | 2 | 4 |

| Topic | Note |
|---|---|
| Total | ≈ 60 points for batches 2–7, plus ≈ 6–10 for the judge's turns (rulings, merges, visual QA); fits the 82 % aim only if batch 1 cost ≤ 10 |
| Cut line | usage > **55 % after batch 4** → batches 6–7 (Part V builds) move to next week, plans kept; > **70 % after batch 5** → the Q10–Q12 reviews become one Opus agent (≈ −1) |
| Order | E1 and the kinds land before the first build that needs them (Q6); R1/R2 run while Q6+Q7 are planned; R3 waits for matrix v2 (Q4's new views use `product`/`lin`); each planner covers the next group while the current group builds |

## 8. Questions for the judge

| # | Question | Recommendation |
|---|---|---|
| 1 | New chapters Q6 (two qubits, Bell basis, parities) and Q7 (GHZ, Mermin), rather than folding L6 into the Bell-inequality chapter? | **Yes**: the notes' order; Mermin needs no ρ; L5–L7 p. 34 is ≈ 14 pages, too much for one chapter |
| 2 | Renumber old Q6–Q12 → Q8–Q14 and Q13–Q25 → Q15–Q27; Q6 joins Part II; Part III retitled "Correlations and the density matrix"? | **Yes**: only `outline.ts`/`outline.test.ts` and four built-text mentions change (R1, R3) |
| 3 | Fold F2, F3, F4, F6; keep a trimmed F5? | **Yes**: ≈ 18 points saved; gap check in §3 |
| 4 | F ids: renumber F5 → F2, F7 → F3, F8 → F4, or keep stable ids with gaps? | **Renumber**: none is built, readers see a gap-free sequence; record the map in the ruling |
| 5 | Q3 stays one chapter over L3–L4 (6 units, one new beat) rather than splitting L4 off? | **Keep one**: its units already match L4's sections; a split costs a whole build |
| 6 | `two-qubit` render path: SVG (oblique balls + grid) or GL? | **SVG**: prints (so W-709 #7 figure strips work), no new WebGL context, and the 3×3 grid is 2-D anyway |
| 7 | Add a small SVG `plot` kind for curve-shaped derivations (S against \|r\|, CHSH S against φ, λ_min against p, Fig. 5.1)? | **Yes, batch 4, ≈ 1 point**; otherwise those rows step parameter sweeps with readouts only |
| 8 | Put the Pauli `tableau` inside `matrix` rather than a new kind? | **Yes**: stabilizer and Mermin notation share the cell renderer and passport |
| 9 | Bell names: the notes use β_xy (= N&C) | **Keep ruling 1** (Φ/Ψ) with "notes, N&C: β₀₀"; only Bergou differs |
| 10 | Bloch-vector letter: the notes write n for ρ's vector (2.14) | **Keep r** (C5), one Rosetta line in `q8-ball` |
| 11 | Keep trace distance and fidelity in Q9 as a Bergou-only unit, though the notes have not reached them? | **Yes**: Q14's Helstrom bound needs the trace norm before Part X |
| 12 | HW2 walkthroughs: P1–P2(c) in Q6, P3 in Q4 (retrofit), P4 and P6 in Q8, P5 in F2/Q7, P7 in Q7/Q9, P2(d) in Q9 | **Full walkthroughs** (submitted 2026-10-02); ask the user before using any HW3 item |
| 13 | Bergou ⚑ P10.1(a) (GHZ stabilizer generators) as a cited aside in Q7 | **Allowed** (no sheet assigns it); re-check when HW3 is ingested |
| 14 | The §7 cut line (Part V builds slip a week if usage > 55 % after batch 4) | **Adopt**: plans and engine work still land this week |
