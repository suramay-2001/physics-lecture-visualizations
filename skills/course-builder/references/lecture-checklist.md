# Per-lecture checklist (copy into the lecture's work log)

- [ ] `python3 pipeline/ingest.py --only L<n>`; visual pass of every contact sheet; note missing pages.
- [ ] Plan `docs/roles/proposals/P-L<n>-story.md` (L1 template): units, beats, stages, claims+functions,
      try-it widgets, challenges (hints ×3 + walkthrough; homework hints only), glossary, review cards,
      symbol table, errata+evidence, engine gaps, arcade + concept-map hooks, fidelity notes, questions.
- [ ] Judge: recompute every number; check notes ↔ books; resolve carry-over (content belongs to the lecture
      whose notes first contain it; the next lecture gets a one-beat recap); ask the user only real questions.
- [ ] Engine gaps: functions + numpy fixtures + tests.
- [ ] Content: `L<n>.ts`, `L<n>.story.ts`, `L<n>.values.ts`, `L<n>.review.ts`; register in `content/index.ts`;
      glossary, fidelity, stageVocab, concepts (`unit` links), arcade levels; errata box.
- [ ] Scenes: reuse kinds; a new kind = passport + fidelity + labels + contrast + frame-time check.
- [ ] Build → vitest → e2e (production preview + dev) → every-beat e2e passes for the lecture.
- [ ] Judge visual QA: every beat and reveal screenshotted; each number checked against its text;
      truth report `docs/roles/audits/L<n>-truth-report.md`.
- [ ] Security diff audit; npm audit; CSP e2e on the lecture route.
- [ ] Commit; `graphify update .` (graph free of sources/local paths); BUILD-LOG (state, evidence, next action).

## Lessons from building Lecture 2 (the first lecture built from this checklist)
- **Ownership rule** across lectures: a concept is introduced once, in the first lecture whose notes teach it. A
  later lecture whose notes repeat it keeps a unit, opens with one link-back beat and teaches only what is new.
  Tell every planner this before planning starts, and rule on overlaps before building.
- Claim keys are lecture-prefixed and alphanumeric (`l2SumLen`); every displayed number, including an input such
  as "½" in a caption, needs a claim in its beat or unit. Each unit with a story must display at least one number.
- Assigned homework: `walkthrough: []` in the content file (a hidden walkthrough would still ship in the bundle).
- Symbol lint is per lecture: map symbols carried from earlier lectures in `Lecture.symbols` (to the first unit
  id, as a recap) or define them by a gloss tag's `symbols`. Avoid `\leftrightarrow` and `\mathbb` in TeX.
- The term syntax `{{key|shown}}` cannot wrap TeX containing `|`; use `\htmlClass{term-key}{…}` inside the TeX.
- Register the lecture in `content/index.ts` and `content/values.ts`; add its route to the CSP e2e ROUTES and its id
  to the story e2e BUILT list; update e2e counts that grow with the course (topbar units, the fork's next-lecture
  link, Arcade level totals); give every Arcade item a `trains` unit of the lecture (a test checks it).
- Run the preview and dev e2e projects separately (one web server per run).
- Visual QA must open every clue's reveal ("Show me"), not only the question pictures; read the readouts too
  (a float residue printed "− 0.00i").
