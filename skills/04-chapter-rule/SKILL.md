---
name: 04-chapter-rule
description: Judge a chapter's story plan against the sources — recompute every number, resolve ownership overlaps, rule on the plan's open questions, and produce the rulings file a build agent will follow. Trigger right after 03-chapter-plan produces a plan, before any worktree build agent starts.
---

# Chapter rule — the judge's rulings file

Worked examples: `docs/roles/decisions/qc709-pilots.md`, `docs/roles/decisions/qc709-nc.md`.

## When to use
Immediately after a chapter plan (`03-chapter-plan`) is written, and before `05-chapter-build` launches an agent.

## Inputs
- The chapter plan (`docs/roles/proposals/P-<ID>-story.md`), especially its §12 "Questions for the judge".
- The rendered source pages it cites (to check page numbers and read errata "img" items yourself).
- Standing rulings that may already answer a question (`docs/roles/decisions/*.md`) — do not re-derive one.

## Steps
1. **Recompute every claimed number** independently (by hand or a throwaway script) — this is what makes a
   plan's numbers trustworthy before a builder ever transcribes them.
2. **Check every citation** against the rendered page: § and printed page, using the offset table from
   `01-course-ingest`/`02-part-map`.
3. **Walk the plan's §12 questions** one by one; for each, either rule directly (with a one-sentence reason) or,
   if it is a genuine conflict of intent (not a fact you can check), ask the user.
4. **Homework guard.** For any plan item that proves, derives or answers something also assigned as homework —
   in *either* course — ask the user whether that assignment is still open, whatever proof route the plan uses.
   Do not assume "a different method makes it fine": `qc709-pilots.md`'s ruling-1 amendment exists because a
   *different route* to the *same result* still counts. If the assignment is open, the plan item ships
   hints-only (`walkthrough: []`); if the user confirms it is submitted, the plan may keep a full walkthrough.
5. **Approve the plan's map changes**, if any (citation fixes, unit reorders, a moved chapter) — list them in the
   ruling so the build agent applies exactly them, nothing improvised.
6. **Set parallel-build rules** if two chapters build at once: which shared files each may *append to* only
   (never reorder or reformat existing entries — `concepts.ts`, `bridges.ts`, the fidelity registry, Arcade
   `games.ts`, e2e route lists), and confirm neither chapter bridges to the other (a bridge can only target an
   already-built unit).

## Gates
- Every plan number the judge recomputed matches, to the precision the prose states.
- Every §12 question has either a ruling with a reason or a recorded answer from the user — none left open.
- Every homework overlap has an explicit open/closed answer from the user, not an inference.
- If beats were renumbered by a ruling, the ruling states the exact old → new id map (a builder must not
  improvise it): `content.test.tsx`'s phase-order lint rejects out-of-order ids, so a reorder must renumber
  from `b1`.

## Outputs
- `docs/roles/decisions/<part>-pilots.md` or `<part>-rulings.md`: one row per question (#, question, ruling,
  why), plus a "Build consequences" list and any parallel-build rules.
- The plan itself annotated ACCEPTED, with its approved changes listed.

## Pitfalls
- A judge ruling that silently contradicts an existing standing rule (e.g. Bell-state naming, |0⟩ convention)
  without saying so creates a chapter that a later review will flag as inconsistent — always check
  `docs/roles/decisions/` for the standing answer first.
- Rulings written after the build starts arrive too late to prevent rework; this step is strictly *before*
  `05-chapter-build`.

## Next
`05-chapter-build` (fill the worktree brief template with this plan + these rulings).
