# Rulings: the 709 re-map against notes L1–L7 (2026-10-02)

Judge rulings on `docs/roles/proposals/P-709-remap-L1L7.md` §8. Scope set by the user on 2026-10-02: notes L1–L7, plus
the chapters through Part V, plus Foundations F2–F6. Usage cap for the week: aim for 82%, stop by 85%.

1. **New chapters Q6** ("Two qubits: products, entanglement and the Bell basis") **and Q7** ("GHZ and Mermin"): YES. They
   follow the notes' order.
2. **Renumbering:** YES. Old Q6–Q12 become Q8–Q14 and old Q13–Q25 become Q15–Q27. Q6 joins Part II. Part III is retitled
   "Correlations and the density matrix". Update `outline.ts` and the four mentions in built text.
3. **Fold F2, F3, F4 and F6: YES (the user chose this on 2026-10-02).**
   - Q2, Q3, Q4 and Q6 own that math in their Ground-up tracks; each fix or plan brief checks the §3 gap list.
   - Old F5 (probability) is built, trimmed, as the new F2.
4. **F ids:** renumber, as the plan recommends: old F5 → F2, F7 → F3, F8 → F4. None of them is built yet.
5. **Q3 stays one chapter over L3–L4:** YES. Its re-alignment is in its fix brief.
6. **`two-qubit` is SVG:** YES. It prints, so W-709 #7 figure strips work, and it adds no WebGL context. The fields are as in
   §6.1.
7. **An SVG `plot` kind:** YES, in batch 3 or 4, so that curve-shaped derivations get a real view.
8. **The Pauli `tableau` lives inside `matrix` (v2):** YES, together with the other §6.2 `matrix` v2 fields.
9. **Bell names: amended.**
   - β_xy is a NEW NOTATION with its own notation beat in Q6 (W-709 #8).
   - The Bell-measurement derivation, and HW2 P2-type material, use β_xy, because the measurement circuit outputs exactly
     x and y.
   - Everywhere else, Φ/Ψ stay primary, tagged "(notes, N&C: β₀₀)" on first use per chapter.
10. **The Bloch vector of ρ is r:** keep it, with one Rosetta line in Q8 ("the notes write n").
11. **Trace distance and fidelity in Q9,** as a Bergou-only unit: YES.
12. **HW2 walkthroughs:** FULL, as mapped, since HW2 is submitted. Ask the user before using any HW3 item.
13. **Bergou ⚑ P10.1(a) as a cited aside in Q7:** allowed. Re-check when HW3 is ingested.
14. **The cut line:** adopt the user's cap. Check usage after every batch; Part V builds slip to next week if the cap would
    be crossed.

**From the Q2–Q5 reviews (applies to every fix and build brief):**
- **A new content lint: no TeX command outside `$…$`** in learner-visible text. All six Formal insights in Q3 and Q5 render
  raw TeX.
- **Engine-backed answers:** an answer, readout or caption number must come from an engine call whose numpy twin computes
  it by an independent route. A literal typed into both the content and the twin proves nothing; both Q4 and Q5 did this.
