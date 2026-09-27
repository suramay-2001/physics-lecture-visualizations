# Judge rulings on the Physics 709 semester map (2026-09-27)

Input: `docs/roles/proposals/P-709-map.md` (P; 33 chapters, dependency graph, engine and stage-kind unions,
errata). The map is ACCEPTED with P's chapter moves:
- partial trace → Q7;
- entropy proofs → Q21, and F5 gains a Shannon-entropy unit;
- Bergou §9.2 (codes) → Q20;
- F7 gains GF(2).

| # | Question | Ruling | Why |
|---|---|---|---|
| 1 | Bell-state names (Bergou swaps Φ and Ψ against the standard) | **Standard names** (Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2), with "(Bergou: Ψ₊)" on first use in each chapter. The engine names Bell states by content (`bell('00+11')`). If the 709 notes pick Bergou's names, switching is a course-pack edit. | Readers meet the standard names everywhere else; content-named engine states make the choice cheap to reverse. |
| 2 | Which level is \|0⟩ in hardware chapters | Lock **\|0⟩ ≡ \|+z⟩ ≡ north** for the whole course. The `energy-ladder` stage takes a per-platform `upper: 0 \| 1` flag, stated in its passport. | One convention across bridges and all 33 chapters; the physical level is a property of the platform, not of the notation. |
| 3 | Q3's bridge to `l7-spreads` answers HW1 P1(b) in general | **Keep the bridge**, framed as the general idea, never as "the answer to P1(b)". No 709 challenge reproduces P1(b); HW1 items stay hints only. | The 448 unit is independent course material; hints-only governs 709 challenges and walkthroughs, not links to existing theory. HW1 was due 2026-09-16. |
| 4 | Shor preview (Bergou leaves Shor out) | **Keep `q16-shor-preview`**, badged "beyond the book". Numbers come from the engine only (factoring 15, the period of 7^x mod 15), with no source text to paraphrase. | A quantum-computing course without Shor's idea leaves a hole; the badge keeps the source boundary honest. |
| 5 | grover-plane and vector-3d | **grover-plane:** a `hilbert-plane` preset (a real 2D plane spanned by \|w⟩ and \|s⊥⟩) if the existing kind carries its labels; otherwise a new kind. **vector-3d:** deferred until a chapter needs it. | Fewer stage kinds; hilbert-plane already draws a real 2D state plane with the reserved colours. |
| 6 | Bergou page renders | **Yes:** ingest Bergou with `render_all` at 80 dpi (git-ignored), so later P reviews can do the visual pass without re-rendering. | P had to render pages ad hoc; renders belong to the ingest. |
| 7 | Bergou page offsets | The per-chapter offset table in the map's (d)-E1 **replaces** "printed = PDF − 15" (the e-book drops blank pages; the offset drifts from 15 to 5). Record it in BUILD-LOG. Axler stays −14. | Citations must name the printed page. |
| 8 | Notation (map §C1–C10) | Adopted as written:<br>- q0 = the leftmost factor = the top wire = the MSB, with "qubit 1" shown where a source numbers from 1<br>- \|±x⟩ in prose, \|±⟩ on circuits<br>- r for the state, n̂ for an axis<br>- S = P(π/2), T = P(π/4)<br>- U_notes = B_448†<br>- root fidelity, with Bergou Ch. 8's labelled "(= F²)"<br>- Axler translated in one line per citation | Each clash gets a one-line Rosetta note in the chapter that meets it. |
| 9 | Errata (map §N1–N8, §B1–B34) | Each confirmed item becomes a `Correction` in the chapter that meets it:<br>- source `notes` for N, `book` for B<br>- paraphrased, never quoted<br>- items marked **unsure** stay out until P re-checks them on the rendered page | As in 448 (L1, L3, L4). |

**Build consequences:**
- The first stage kinds are `amplitudes` and `circuit`, built together.
- The first engine gaps are n×n `eigh`, `kron` and `partialTrace` (existing helpers are 2×2).
- Gates act on state vectors in place; dense unitaries are allowed up to 6 qubits.

## Identity approved (user, 2026-09-27)
The Cryostat mockup (`docs/roles/proposals/D-709-identity/mockup.html`, published privately) is approved with D's
recommendations:
- pale gilt #f2e8c8 + rose copper #c4705f in chrome only (never text, never on stage);
- six plates with two Parts each (Foundations and the QM review share 300 K);
- a typeface per track (Ground-up: Atkinson Hyperlegible Next; Formal: STIX Two Text);
- navy chrome in both colour schemes (only the reading surface turns light).
