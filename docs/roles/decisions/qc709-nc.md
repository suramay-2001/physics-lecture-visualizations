# Judge's rulings on the Nielsen & Chuang addendum (2026-09-28)

**Input:** `docs/roles/proposals/P-709-NC.md` (P). The user added N&C as a 709 source for its simpler explanations.

**Outcome:**
- The chapter map (§1), the conventions table (§2), the homework table (§5) and the errata (§6) are ACCEPTED as the
  standing reference for every 709 plan.
- The F1 and Q1 addenda (§3, §4) are ACCEPTED into the two pilot builds, with the rulings below.

**Judge's checks (numpy or by hand):**
- `f1-phase:b4` cap: ½·|1 + e^{iπ/3}| = 0.866.
- `f1Dir34`: (3 + 4i)/5 = 0.6 + 0.8i, size 1.
- `f1-ph-pi8`: 22.5°, and T = e^{iπ/8}·R_z(π/4), since R_z(π/4) = diag(e^{−iπ/8}, e^{iπ/8}).
- `q1-p-not-unit`: (|+z⟩ + |+x⟩)/√2 = (1.2071, 0.5), length 1.3066.
- 709 HW1 P1–P5, re-read: no addendum item works any of them.

| # | Question | Ruling | Why |
|---|---|---|---|
| 1 | 448 assigns "Hermitian ⇒ real eigenvalues" (L3 p. 5; N&C Ex. 2.17). The 709 notes prove it (p. 15), and the map plans it in F4 D3 and Q3 D5. | **Hints only in both 709 chapters while that 448 homework stands.** F4 and Q3 state the result, give three hints, and cite "the notes prove this on p. 15" by page, with no derivation in the app. F4 D3 keeps only the orthogonality half (distinct eigenvalues ⇒ orthogonal eigenvectors). Carry this into the F4 and Q3 plans. | Ruling 1 of `qc709-pilots.md`: a problem assigned in either course's homework never gets a walkthrough in the other. The student can read the notes' own proof; the app does not re-derive it. |
| 2 | Open-circle (control-on-0) controls | **Yes: an additive, optional `controls0?: number[]`** in the circuit format, with a numpy twin, drawn ○ by the `circuit` kind. It goes in the second stage/engine batch, before Q14. | N&C's Grover and QEC circuits need it; rewriting them with X-sandwiches would add gates the sources don't have. |
| 3 | The teleportation resource | **Q9's main line uses Φ⁺** (N&C Fig. 1.13), named "Φ⁺ (N&C: β₀₀; Bergou: Ψ₊)" on first use. Bergou's singlet table is a [B] beat. | Φ⁺ is the standard resource and gives the cleanest Z^{M₁}X^{M₂} correction; the singlet version is a worthwhile second look, not the first. |
| 4 | Reorders in the accepted plans (§3.5, §4.4) | **Approved.** Beat ids must run from `b1` in order (`content.test.tsx`), so a reorder or an inserted beat RENUMBERS the unit. The builder uses the new ids everywhere (beats, cross-references, claims, captions) and lists the old → new map in the commit message. | The phase-order lint would reject the plans as written; the builder must not improvise. |
| 5 | Shor now has a source (N&C §5.3, App. 4) | **Accepted:** Shor's algorithm is Formal-only in Q16, cited to N&C and badged "beyond Bergou"; continued fractions join F8 (N&C App. 4.4). The F8 and Q16 plans absorb this when P plans them. | One owner per concept: the classical number theory lives in F8 and Q16 bridges to it. |

**Standing N&C rules** (added to the 709 brief template):
- **Citing.**
  - The source id is `'nc'`; `where` gives § and printed page (PDF − 28).
  - An N&C exercise used as a derivation carries the "N&C ⚑" mark and turns hints-only if any sheet assigns it.
- **Names.** Use the course's names and give N&C's on first use:
  - "Φ⁺ (N&C: β₀₀)";
  - "T (N&C: π/8 gate)";
  - "2α (N&C: θ)" for Grover's angle;
  - "m qubits (N&C: t)" for phase estimation;
  - "N&C's ±1 is our ±ħ/2".
- **Energy levels.** N&C §7.5's prose calls |0⟩ the ground state while its own Hamiltonian makes |0⟩ the upper level
  (E8). The hardware chapters follow each Hamiltonian, never that prose.
- **Q1.** The hydrogen beat (`q1-two-spots`, new [B]) says plainly that the bench draws silver; its fidelity line names
  the difference.
