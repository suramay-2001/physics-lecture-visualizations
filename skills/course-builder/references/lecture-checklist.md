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
