---
name: 00-course-pipeline
description: Index and per-Part recipe for the numbered pipeline skills (01–18) that plan, build, review and ship one Part of a course. Trigger when starting a new Part or batch of chapters, or when unsure which numbered skill to use next.
---

# Course pipeline — index

Complements `skills/course-builder/` (the big reference skill: phases, roles, gates, the four-role model). These
numbered skills break that loop into small, repeatable steps so several chapters can be planned, built and reviewed
in parallel without re-deriving the process each time. When in doubt about a rule's *reason*, read the matching
`course-builder/references/*.md` file this skill's step points to.

## The skills

| # | Skill | Does |
|---|---|---|
| 01 | `01-course-ingest` | Add a source PDF/EPUB: config entry, render/dpi, visual pass, verbatim coverage |
| 02 | `02-part-map` | Plan a Part's chapters from the semester map; ownership and bridge rulings |
| 03 | `03-chapter-plan` | P's two-track story plan for one chapter (the section list F1/Q1 used) |
| 04 | `04-chapter-rule` | Judge's rulings file on a plan; homework guard; parallel-build rules |
| 05 | `05-chapter-build` | Worktree build agent from the plan + rulings |
| 06 | `06-chapter-review` | Independent P truth review of a built chapter |
| 07 | `07-chapter-fix` | Fix pass from a review; touch-list discipline; parallel-safe split |
| 08 | `08-merge-gate` | Merge a worktree branch; conflict playbook; gate-main.sh; both e2e |
| 09 | `09-visual-qa` | Contact sheets, both tracks, reveals, print figures |
| 10 | `10-stage-kind` | Add an SVG or GL stage kind |
| 11 | `11-engine-module` | Add an engine function + numpy twin + fixtures + property tests |
| 12 | `12-lab-bench` | A Babylon lab bench, its budgets, its truth review |
| 13 | `13-arcade-level` | Add Arcade levels for a course |
| 14 | `14-decor-clip` | Higgsfield decor clips (atmosphere only) |
| 15 | `15-film` | A Motion Canvas film with the manifest check |
| 16 | `16-blender-opener` | A Blender opener from engine data |
| 17 | `17-flake-hunt` | Instrument + stress an e2e flake |
| 18 | `18-usage-budget` | Pace agents under a weekly usage cap |

## Per-Part recipe (chaining the skills for one Part)

A Part is a batch of 2–5 chapters (`docs/roles/proposals/P-709-map.md` groups them). Run:

1. **Plan the batch** — `02-part-map` on the Part's rows: confirm ownership, bridges, errata, stage-kind needs
   against what already exists. *Serial* (one judge decision set). Opus.
2. **Rule** — for each chapter, `03-chapter-plan` (P writes the story plan) then `04-chapter-rule` (judge rules,
   asks the user only real conflicts — e.g. "is this homework still open?"). *Serial per chapter, can overlap
   across chapters.* Plan-writing: Opus or Sonnet with a plan agent; ruling: Opus (judge).
3. **Build 2–3 in parallel** — `05-chapter-build`, one worktree agent per chapter, `isolation: "worktree"`.
   *Parallel.* Sonnet. Before this batch: any new engine function (`11-engine-module`) or stage kind
   (`10-stage-kind`) the chapters need must already be merged on main — plan chapter order so the first chapter
   that needs a kind is not the one building it.
4. **Merge-gate each** — `08-merge-gate` as each agent reports. *Serial* (one merge at a time; `gate-main.sh`
   is the orchestrator's own file, never a worktree's). Sonnet.
5. **Review batch** — `06-chapter-review`, one independent read-only agent per merged chapter. *Parallel.* Opus
   (truth review is a judging task).
6. **Fix batch** — `07-chapter-fix`, one agent per chapter (or two agents split by file, see that skill's
   parallel-safe rule). *Parallel across chapters, serial within a shared file.* Sonnet.
7. **Merge-gate** the fixes — `08-merge-gate` again. Serial. Sonnet.
8. **Visual QA** — `09-visual-qa` across the whole batch, both tracks. Serial (one browser). Sonnet, judged by
   Opus reading the contact sheets.
9. **BUILD-LOG** — Current state, Next action, Evidence, any new Hard-won lesson. Sonnet or the orchestrator
   directly.

## Usage-budget note

See `18-usage-budget` for the full policy. In short: Opus for planning and truth reviews (steps 1, 2, 5, 8's
judgment), Sonnet for builds, fixes, docs and wiring (steps 3, 4, 6, 7, 9), Haiku for mechanical sweeps only
(renumbering a beat list, regenerating a fixture file). Check usage before and after each batch; stop near 78%
of a cap and resume after reset.

## Adding engine functions or stage kinds before chapters need them

Order, always: **engine function + numpy twin** (`11-engine-module`) → **stage kind or field** that visualizes it
(`10-stage-kind`) → **chapter content** that uses both (`05-chapter-build`). Building a chapter's worktree brief
before its stage dependency merges forces the builder to write against a moving target (see `qc709-pilots.md`
ruling 2: `complex-plane` was built before F1 for exactly this reason). Do NOT edit `app/src/physics/**` or
`app/src/stage/**` from inside a chapter-build worktree — stop and report the gap instead (`05-chapter-build`
Gates).

## Next

Start a new Part with `02-part-map`. Add a chapter to an in-progress Part with `03-chapter-plan`.
