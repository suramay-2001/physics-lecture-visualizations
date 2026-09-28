# Judge rulings on the pilot story plans F1 and Q1 (2026-09-28)

Inputs: `docs/roles/proposals/P-F1-story.md` and `P-Q1-story.md` (P). Both plans are ACCEPTED, including P's changes to
the map:
- F1 citations corrected (Axler pp. 2–4; FTA 4.12 on p. 125; factorization 4.13 on p. 126);
- Euler's formula proved by the (1 + iφ/n)ⁿ limit and the velocity argument;
- the Part I opener moved to the 300 K plate;
- Q1 errata N9–N18 added.

| # | Question | Ruling | Why |
|---|---|---|---|
| 1 | The Euler power-series proof is 448's assigned homework (L2 p. 7) | **Hints-only** in F1 as well. A problem assigned in EITHER course's homework never gets a walkthrough in the other course. | The same student may take both courses. |
| 2 | Build `complex-plane` before F1? | **Yes.** It is built with `amplitudes` and `circuit`, all SVG kinds, in the first stage-kind batch, before F1. | Without it, 15 of F1's 35 beats lose their picture of a number's size. |
| 3 | HW1 P2 (z–x–z through a tilted magnet) and the editable Try-it bench | **Keep the bench editable.** No preset at the optimum; no plot of transmission against θ; no stated maximum. | Exploring with a tool is the learner's own work. A worked answer or plot would do the homework. |
| 4 | Ground-up constructions of vector spaces | **Q1 keeps only the notes' axioms and conditions.** The constructions belong to F2, reached by a bridge (the ownership rule from 448). | One owner per concept. |
| 5 | Beat phase for F chapters (no lecture notes) | **A new phase `'core'`, labelled "The foundation",** allowed only in 709 F chapters. Platform B adds it with a lint. | "The lecture says" would be false for Axler-based foundations. |
| 6 | Link 709 concepts to their 448 twins | **Yes:** `Concept.sameAs?: <448 concept id>`, drawn on the map as a cross-course edge. It lands with the first chapter build. | The map should show where each idea was met first. |
| 7 | The notes write the zero vector as \|0⟩ | **Write it 0, with a one-line notation note on first use** ("the notes write the zero vector as \|0⟩; here it is 0, because \|0⟩ is the qubit state \|+z⟩"). Not a silent change. | The clash is real and the reader should see why the symbol differs. |
| 8 | The beyond-the-notes beat `q1-two-spots:b7` | **Keep it as a beat,** with the "beyond the notes" badge (`beyondLecture`), as in 448. | The idea belongs in the story. The badge keeps the source boundary honest. |

**Build consequences:**
- The stage-kind batch is `complex-plane` + `amplitudes` + `circuit`.
- The pilot chapters are built after platform part B and that batch have merged.

**Amendment to ruling 1 (2026-09-28, the user's answer).**
- **Question:** the F1 review (item 19) noted that 448 L2 p. 7 asks for cos θ + i sin θ = e^{iθ} and names no method, so F1's limit proof (D5) proves the assigned statement by another route.
- **The user's answer:** that 448 homework is **already submitted**.
- **Ruling:** F1 keeps D5 in full, in both tracks. The power-series walkthrough (`f1-e-series`) stays hints-only regardless.
- **Standing rule:** for any future overlap between a proof and an assigned statement, ask the user whether the assignment is still open, whatever the method.
