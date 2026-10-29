# P review: 709 Q26 "Qubits made of light" and Q27 "Qubits in chips" (main at 766a82b, 2026-10-29)

**Verdicts. Q26: FIX-FIRST** (one wrong-as-worded sentence, B1, plus 6 should-fix). **Q27: PASS with fixes** (0 blocking, Correction K1 to reword, 5 should-fix).
Every displayed number in both chapters recomputed and right. All three Corrections are real on the page image (K1 of Q27 needs rewording). Lean pass per the brief: no Playwright, no screenshots, no suites.

Evidence (scratchpad `rv/`, own code, never the repo engine or the planners' scripts):
- Q26: sympy polynomial expansion of the sign-gate circuit (A_n, both roots, 150.49°/61.58°, 0.2265, 0.657); a Fock-space simulation of the CZ network (diag(i,1,−1,i) and diag(i,1,1,i)); permanents for the HOM table at R = 0.2, 0.25, 0.3, 0.5; a 6-qubit state vector for gate teleportation (|r⟩ equals the printed state, all 16 outcomes 1/16, a Pauli pair per outcome returns CNOT, random input); KLM, JC levels by `eigvalsh`, χ, cat and coherent overlaps. About 60 displayed numbers, 0 mismatches.
- Q27: `scipy.constants` for the 35 SI numbers; charge-basis diagonalisation in double precision and at 50-digit mpmath (gaps, slope, ladder, α, ε_0, Mathieu a_0/4 = E_0(n_g=0)); Eq. 15.14 by matrices; exchange and iSWAP algebra. About 70 displayed numbers, 0 mismatches.
- 62 (Q26) and 68 (Q27) claim sentences read against the key they print (state, parameter, units, sign). Sentence caps by script (math = 1 word): 0 over (Ground ≤ 25, Formal ≤ 40) in both chapters.
- Copyright: all prose and glossary strings against the whole Bergou text layer. Longest shared run is 6 words (generic phrases: pole of the sphere; photon numbers in two modes), 7 inside Q27's Correction `says` (a printed-text quote, fine). No sentence-by-sentence tracking.
- Citations: 31 (Q26) and 40 (Q27) page / equation / figure cites against the offset table and the page headers; page IMAGES opened for PDF pp. 263, 264, 266, 267, 268, 287, 290, 300. Bridges: 11 + 6 `<<id|Unit x.y>>` chips all land, numbers equal the unit index. Glossary: 35 entries, 0 duplicate ids or terms across the course. Prerequisites all exist. Try-it tests cover all 12 units.

## Corrections (Z3)

| Box | Page image (PDF p.) | Printed | Own recompute | Verdict |
|---|---|---|---|---|
| Q26 K1, p. 257 | 263 | U has i e^{∓iφ} sin θ off the diagonal, but the product line gives cos θ|0⟩ + sin θ e^{iφ}|1⟩ with no i | U|0⟩ = (cos θ, i e^{iφ} sin θ): relative phase φ+90° = 130° at θ=30°, φ=40°; chances 0.75/0.25 unchanged; Bloch polar 60°, azimuth 130° | **SHIP** as built. The check tests the phase, not an unrelated number. |
| Q27 K1, p. 281, Eq. 15.9 | 287 | σ_z coefficient +E_C(n_g−½), basis stated as "n = 1, 0" | With |+⟩ = n=1: (E(1)−E(0))/2 = −E_C(n_g−½); +0.2 at n_g=0.3, printed form −0.2. Printed sign is right only if |+⟩ is n=0 | **REWORD** (below). Gap, U, sweet spot unchanged, so Z3's "harmless" clause could make it a Rosetta line; keep the box, since P15.3 asks the reader to derive Eq. 15.9. |
| Q27 K2, p. 284 | 290 | e^{−√(2E_J/E_C)}, prefactor 2^{4k+3}/k!·√(2/π)·(2E_J/E_C)^{k/2+3/4} | 50-digit exact ε_0: 9.759e-7 (r=10), 1.0094e-9 (r=20); printed form 0.690 E_C; exponent √(32r): +5.3 %, +3.7 %. Prefactor and power match Koch et al. with E_C(book) = 4 E_C(usual); the page's own α = −1/√(32E_J/E_C) agrees | **SHIP** as built. |

K1 exact fix, `Q27.ts:636`: `shouldSay` becomes "Our calculation finds the coefficient of σ_z to be −E_C(n_g − 1/2) when |+⟩ is the state n = 1, as the page lists them: at E_C = 1, E_J = 0.2 and n_g = 0.3 it is +0.2, where the printed form gives −0.2. With the printed sign the state n = 1 would lie below n = 0 for n_g < 1/2, but E_C(n − n_g)² puts it above. The gap, the sweet spot and every number in this chapter are unchanged." The old last sentence, "|0⟩ would be the upper state", collides with the book's qubit |0⟩, which is always the upper eigenstate. Same words in `Q27.story.ts:447` (add "with |+⟩ = n = 1").

## Blocking

| # | Where | Problem | Exact fix |
|---|---|---|---|
| B1 | `Q26.story.ts:597` (Ground), `:600`, claim `:607` | "a limit for any linear-optics CNOT with extra photons: 2/27" is false as worded. The page's bound is for CNOTs from independent ancilla photons, and it says so. Unit 26.5 then reaches 0.9 and 0.99, and b7 (`:956`) names a 25 % CNOT with two entangled ancillas (p. 263). Contradicts itself | Ground: "a limit for a linear-optics CNOT built from independent extra photons, with no teleportation: $2/27 = …$". Formal `:600`: append "It does not bind the teleported gates of Unit 26.5." Claim text `:607`: same qualifier. |

## Should-fix (Q26)

| # | Where | Problem | Exact fix |
|---|---|---|---|
| S1 | `Q26.story.ts:124`, `:127` | θ and φ never named in b2 (Ground or Formal); first words come in b3 | Ground: "Wave plates, set by two angles $\theta$ (how far the light turns) and $\varphi$ (the axis), give the table …". Formal: "for plate angles $\theta$, $\varphi$". |
| S2 | `:297` (beamsplitter:b4 Formal) | $a_0^\dagger$, $a_j^\dagger$, $|\mathrm{vac}\rangle$ used with no introduction; Eq. 14.2 is never displayed | Insert first: "With $a_j^\dagger$ adding a photon to mode $j$ and $|\mathrm{vac}\rangle$ the empty field, one photon in port 0 is $a_0^\dagger|\mathrm{vac}\rangle$ (p. 256)." |
| S3 | `:707–712`; `Q26.glossary.ts:84–89` | n in $n/(n+1)$ and $P_n$ is never defined until the derivation | Ground: "KLM's trick uses $n$ extra photons per teleportation and raises it to …". Formal: "KLM, with $n$ photons per teleportation: $P_n$ …". Glossary gloss: "using $n$ extra photons". |
| S4 | `:829–833` (nonlinear:b2) | Ground uses $|e,n\rangle$, $|g,n+1\rangle$, $\Omega_n$, $\Omega_0$, Δ with no meaning; Formal never says what $\Omega_0$ is | Ground: "$g$ is the atom's lower level, $e$ its upper level; $|e,n\rangle$ is atom up with $n$ photons. $\Omega_0$ is the coupling to one photon, $\Omega_n = \Omega_0\sqrt{n+1}$, and $\Delta$ the detuning of the light from the atom." Formal: add "$\Omega_0$ the one-photon coupling". |
| S5 | `:830`, `:833` | "mixing angle only 5.7°" reads as a Hilbert-space angle. The page's φ_n = arctan(Ω_n/Δ) is a Bloch-type angle; the state holds cos(φ_n/2), sin(φ_n/2) (page 264), so the admixture angle is half of it | Ground: "the angle $\varphi_0 = \tan^{-1}(\Omega_0/\Delta)$ is only 5.7°, and the dressed state itself turns by half of that." Formal: write $\cos(\varphi_n/2)|e,n\rangle + \sin(\varphi_n/2)|g,n+1\rangle$. |
| S6 | `:848`, `Q26.ts:473`, `Q26.review.ts:104` | $E_-(n) - E_-(0) \simeq -\hbar\chi n$ is false if $E_n = (n+\tfrac12)\hbar\omega$ as on the page: the bare nħω is left in. $E_n$ is also undefined in Ground (`:868`) | State: "$E_n$ is the bare energy of the block, $(n+\tfrac12)\hbar\omega$; apart from $n\hbar\omega$, $E_-(n) - E_-(0) \simeq -\hbar\chi n$". Same qualifier in the insight and review card. |

## Should-fix (Q27)

| # | Where | Problem | Exact fix |
|---|---|---|---|
| S1 | `Q27.story.ts:278–283`, `:336–339` | $I_0$ used in I = I₀ sin θ and $L_J$ with no definition in either track | b1 Ground: "$I = I_0\sin\theta$, where $I_0$, the critical current, is the largest current the junction carries"; Formal: same words once. |
| S2 | `:691–694` (cqed:b1 Ground) | g is never named ("splits by 2g√(n+1)") | "…the coupling $g$ between qubit and resonator: at resonance the dressed levels split by …". |
| S3 | `:892–895` (dots:b4 Ground) | D and K never defined; Formal gives them only in a bracket | "…energies $D + K$ and $D - K$, where $D$ is the Coulomb energy of the pair and $K$ the exchange energy". |
| S4 | `:187–188`, `:190–191` | "the book's pair density": the page calls n the charge density and uses m, with 2e. With pairs of mass 2m the same n would give a different λ (37.6 nm) | "For the book's charge density $n = 10^{28}\,{\rm m}^{-3}$ and the electron mass $m$, $\lambda = 26.6$ nm"; Formal: define $n$, $m$. |
| S5 | `Q27.glossary.ts:92` | Mathieu equation is on p. 284, not 283 (p. 283 opens §15.7) | "(p. 284)". |

## Nits

| # | Where | Note and fix |
|---|---|---|
| N1 | `Q26.story.ts:426` | The page's intermediate state on p. 260 (PDF 266: |02⟩ + i|20⟩) disagrees with its own p. 256 formula, which gives equal phases for Fig. 14.5's table (our b3 is right). Harmless; add Rosetta: "the page prints a relative i here; its Eq. on p. 256 gives equal phases". |
| N2 | `:796–798` | Caption "Φ⁺ and Φ⁻ look the same" sits on scalar HOM bars that cannot show it. Caption: "bunching at 50:50; polarization separates Ψ⁺ from Φ±". |
| N3 | `:260–273` | Formal derivation of b2 ends on the SS† step, not the stated result. Add a closing step "together: …". |
| N4 | `:646`, `:599` | "1/0.2265 = 4.414" is 4.415 as written: use $3 + \sqrt2$. b5 also gives P14.1(a)'s answer ("same for each input"); label it ours. |
| N5 | `Q26.review.ts:87` | "(Fig. 14.7)" for |r⟩ and fix-ups: "Figs. 14.6–14.8". |
| N6 | `:849` | Rosetta on Δ: add "the atom stays in $|g\rangle$ in the lower dressed level for light below the atomic frequency" (page's Δ = ω−ω_a, E+ ≈ |e,n⟩ only for Δ<0). |
| N7 | `Q27.story.ts:395`, `:656`, `:863` | Digits typed in `captionFormal` (0.25/0.4196, 966.8/1.520, 2.7992), correct but not from `V`: use `d(V.q27…)`. |
| N8 | `:837`, `:874–876` | "close to the circuit's 5 GHz" for 2.80: "of the same order". Ground b3: Ω/2π = 10 MHz needs "(model)" and "$B_x$, the strength of the oscillating field". |
| N9 | `:925–927`, `Q27.glossary.ts:157` | e^{iπσ·σ/8} is e^{iπ/8} times the inverse of the usual √SWAP; the usual matrix makes Eq. 15.14 false. Rosetta: "this is the root with the opposite turn". Our check: only U = e^{iπσσ/8} gives exactly CZ. |
| N10 | `Q27.ts:455`, `Q27.review.ts:82` | Exponent √(32E_J/E_C) stated without "(Correction K2)". `Q27.story.ts:714` T₁ undefined (point to Chapter Q24). `:225` "sum of the potential" → "vector potential". `:750–783` cqed:b3 re-derives Q26's χ (Z4): acceptable, one word "as in Chapter Q26". |

## Checked and right
- Q26: every Stokes relation and convention (real, symmetric Fig. 14.5, Q5); HOM chances and phases (180°, 0°, 180°); (1−2R)² and (1−R)²+R²; entropy 0.8813, concurrence 0.9165; A_n and the printed conditions, other root cosθ = 3.04; P_CZ = 0.0513, 19.49, 7398; Fig. 14.5 tables; KLM 0.25 … 0.990, n = 199, 19; JC levels, χ, 125.7/Ω₀; cat P(0) 0.0366, ⟨n⟩ 3.997. Z2 kept: the 22.7 %, 5 % and 2/27 are theory. Z4 kept: Q5, Q9, Q11 links, no re-teaching.
- Q27: Eq. 15.14 exact with √SWAP = e^{iπσσ/8}; the page's slip in U(t) sign convention (p. 294) is real and harmless; α formula consistent in the book's E_C; Cooper b, London, Φ₀, I₀, L_J, E_J/h, SQUID 0.4196; cooperativity 6.283e7, χ, iSWAP 250 ns; Zeeman, Rabi B_x; box levels. Z2 kept: cQED and Rabi inputs are labelled model.
