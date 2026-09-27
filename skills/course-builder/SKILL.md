---
name: course-builder
description: Turn a course's lecture notes and textbooks into an interactive, story-driven study site — scroll-linked 3D stages, verified numbers, games, a help section with walkthroughs, a concept map and cinematic navigation — through a repeatable loop of four roles (physics/subject verifier, 3D designer, web developer, security auditor) with Claude as orchestrator and judge. Use this whenever someone wants to "make an app/site from my lecture notes", "add a new lecture/chapter/subject to the course app", "turn these slides and books into interactive lessons", "build it like lecture 1", or brings new notes/books to an existing Spin-Lab-style course. Also use it to add a lecture to an existing course built this way, because the per-lecture loop and its gates are what keep every lecture at the same standard.
---

# Course builder

Built and proven on "Spin Lab" (Physics 448, spin-½ quantum mechanics): lecture notes are the basis, the books
add depth, visuals and clues build intuition, games and walkthroughs make it stick. The reference implementation
is the repo this skill ships with; read its `BUILD-LOG.md` before changing anything there.

## The one rule that makes it trustworthy

**Every number a learner sees is computed by a tested engine, and every visual that makes a claim is drawn from
that engine.** Media (Blender films, generated art) illustrate; the text beside them carries the claim and the
claim has a test. Numbers are cross-checked against an independent implementation (numpy fixtures). This is what
lets a learner trust the site more than a slide deck — protect it above everything else.

## Phases (a new course)

1. **Brainstorm with the user**, then lock decisions in a plan (engines, look, readers, devices, sharing).
   Ask conceptual questions; never "just agree". See `references/roles-and-gates.md`.
2. **Ingest** notes and books (`references/pipeline.md`): text + page renders + contact sheets, a mandatory
   visual pass (handwriting and screenshots never reach the text layer), paths kept out of git, sources git-ignored.
3. **Engine + fixtures**: the subject's math as pure functions, checked against numpy.
4. **Gate** (throwaway prototype): prove the hardest visual idea on the target machine (frame time, contrast,
   one WebGL context, scroll hygiene) before building content.
5. **First lecture vertical slice** through the per-lecture loop below. Judge visual QA of every beat.
6. **Navigation layer** (`references/navigation.md`): opener, beamline route rail, chapter cards + step strip,
   "Where next" fork, Read mode, Arcade, Concept map, Help back-routes.
7. **Remaining lectures**, one at a time, through the same loop.
8. Media, extra labs, publishing — only with the user's go-ahead.

## The per-lecture loop (use this for every lecture)

`references/lecture-checklist.md` is the checklist. In short:

1. `ingest.py --only L<n>`; read the text AND every contact sheet.
2. **Plan (role P)**: `docs/roles/proposals/P-L<n>-story.md` from the L1 template — units, beats
   (lecture → books → clue, clues click-to-reveal), stages, claims with the engine function that computes each,
   challenges with 3 hint rungs + walkthroughs (homework: hints only), glossary, review cards, symbol-before-use
   table, errata with evidence, engine gaps, fidelity notes. Planners may run in parallel as subagents
   (docs only; skeleton first, then one section at a time — see the anti-stall method).
3. **Judge the plan** against the notes and books; compute every claimed number yourself.
4. **Engine gaps** → functions + numpy fixtures + tests.
5. **Author content** (`app/src/content/L<n>*.ts`): lecture, story, values (every number via `claim()`),
   review cards; glossary/fidelity/concepts/arcade entries.
6. **Stages**: reuse scene kinds; a new kind needs a passport, fidelity contract and label-collision pass.
7. **Verify**: build → unit tests → e2e both projects → judge visual QA of every beat and reveal (throwaway
   screenshot specs + contact sheets) → truth report → security diff audit → commit → `graphify update .` →
   BUILD-LOG.

## Hard-won rules (each cost real time once)

- A zero-height text layer is not "no content": run the visual pass on every page.
- Build before unit tests when tests read `dist/`.
- Never replace a code/CSS region "from marker A to marker B" without asserting what lies between.
- Visual QA finds bugs tests cannot see (offsets, collapsed boxes, style collisions); tests find what eyes miss
  (a view that never warms up, a trigger leak). Do both.
- Subagents stall when every tool call waits on a slow safety check; if that happens, do the work in the main
  context in small steps and say so.
- Quote at most a phrase from copyrighted sources; paraphrase and cite § + printed page. A verbatim n-gram test
  guards the app text.

## References

- `references/pipeline.md` — config, ingest, visual pass, fixtures, claims.
- `references/content-model.md` — schema, beats, stages, claims, layers (core / gloss / review), language rules.
- `references/navigation.md` — the story-navigation pattern and its closed motion list.
- `references/roles-and-gates.md` — role briefs, judge rubric, gates, subagent method.
- `references/media.md` — Blender films and assets from engine data; generated media rules.
- `references/lecture-checklist.md` — the per-lecture checklist to copy into each lecture's work.
- `references/lecture-agent-brief.md` — the worktree brief for one lecture of a single-track course (448).
- `references/chapter-agent-brief-709.md` — the worktree brief for one chapter of a second, two-track course
  (bridges back to the first course, per-track lints, per-chapter files found by glob).
