---
name: 05-chapter-build
description: Launch a worktree agent that builds one chapter's content files from an approved plan and rulings, following the chapter-agent-brief template. Trigger once 04-chapter-rule has produced rulings for a plan and the chapter is next in build order.
---

# Chapter build — the worktree agent

Template (two-track, second course): `skills/course-builder/references/chapter-agent-brief-709.md`. Single-track
template: `skills/course-builder/references/lecture-agent-brief.md`.

## When to use
A plan is ACCEPTED (`03-chapter-plan`) and ruled (`04-chapter-rule`). Launch one agent per chapter,
`isolation: "worktree"`, 2–3 running in parallel per `00-course-pipeline`.

## Inputs
- The approved plan file and the rulings file (fill `{PLAN}`, `{RULINGS}` in the template).
- `{ID}` / `{id}` (chapter id, e.g. `F1`/`f1`), `{MAIN_CHECKOUT}` (never a local path in a commit).
- The merged stage/engine API this chapter needs (check `docs/roles/interface-changes.md` — build against the
  *merged* field names, not the plan's original sketch, if they differ; report any meaning change).

## Steps
1. Fill the template's placeholders and save the brief to the session scratchpad (shared; name it
   `brief-<id>.md`, never overwrite another agent's brief or `gate.sh`/`gate-main.sh`).
2. Launch with `isolation: "worktree"`. The agent's own setup (in the brief): read `CLAUDE.md`, `BUILD-LOG.md`
   sections named in the template, link `app/node_modules` as **real per-package symlinks** and `sources` as one
   symlink (see `docs/patterns/worktree-agent-setup.md`) — never commit either.
3. The agent writes `{ID}.ts`, `.story.ts`, `.review.ts`, `.values.ts` (+ `.glossary.ts` for a two-track course),
   appends to shared registries (`concepts.ts`, `bridges.ts`, fidelity, e2e route lists) — **append only, never
   reorder or reformat existing entries** when another chapter builds in parallel.
4. The agent writes the numpy-twin script for every new claim key and runs it twice to confirm byte-identical
   output (`docs/patterns/claim-and-numpy-twin.md`).
5. The agent does NOT edit `app/src/physics/**` or `app/src/stage/**` — a needed change there is stopped and
   reported, not worked around.
6. The agent commits on its own branch (never pushes, never merges) with the evidence (test counts) in the
   message, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and reports under the template's
   word limit: branch/commit, test counts, undone plan items, needed engine/stage changes, uncertain wording.

## Gates
- `npx tsc -p tsconfig.app.json --noEmit` → 0.
- `npx vitest run src/content` (+ `src/arcade` if levels were added) → all green: symbols before use, claims ↔
  numpy, sentence caps, derivation shape, bridges, the verbatim 8-gram test, homework, raw-float ban — all per
  track if two-track.
- `npm run build && npx vitest run` → all green (build first; security/chunk tests read `dist/`).
- Every unit with a story shows at least one number; a link-back beat names its target in words and defines
  nothing new.

## Outputs
- A worktree branch with the chapter's commit(s), ready for `08-merge-gate`.
- The agent's report (word-capped), which `06-chapter-review` and the orchestrator read before merging.

## Pitfalls
- `{{key|shown}}` term syntax cannot wrap TeX containing `|` (kets) — use `\htmlClass{term-key}{…}` inside TeX.
- Avoid `\leftrightarrow` and `\mathbb` in TeX (symbol-lint fails on them).
- A single symlink to the whole `node_modules` folder (instead of per-package links) shares Vite's cache with
  the main checkout and corrupts both; always link per-package.
- A background agent can die mid-task on a usage limit with the worktree keeping partial files — resume it with
  SendMessage (context is kept); have it `git merge --ff-only main` first if main moved meanwhile.
- Subagents stall with zero commits when a brief bundles too much read-heavy work with no incremental saves;
  keep the brief to one chapter, and have the agent commit after real progress, not just at the very end.

## Next
`08-merge-gate` once the agent reports a green commit; `06-chapter-review` after the merge.
