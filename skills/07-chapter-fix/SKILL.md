---
name: 07-chapter-fix
description: Fix every item from a chapter's independent truth review in a scoped worktree agent, with a strict touch-list and evidence per item. Trigger right after 06-chapter-review returns a FIX-FIRST verdict.
---

# Chapter fix — the fix pass

Worked examples: `/private/tmp/.../scratchpad/brief-f1-fix.md`, `brief-q1-fix.md` (session scratchpad; copy their
shape, not their paths, into a new brief per fix pass).

## When to use
Immediately after a FIX-FIRST verdict (`06-chapter-review`). One agent per reviewed chapter; if two chapters
were reviewed together, run two agents in parallel (see "parallel-safe split" below).

## Inputs
- The review file (`docs/roles/audits/P-<ID>-review.md`) — the agent's scope is **every** item except any the
  judge explicitly rules to keep as-is (state that ruling in the brief so the agent doesn't re-litigate it).
- Any judge ruling made on a review item (e.g. "item 19: D5 stays, the homework is already submitted").

## Steps
1. Write the fix brief: touch-list of exactly the files this pass may edit (chapter content files, its numpy
   twin script, and — only if the review names a shared-file item — the *specific* shared file and the *exact*
   change allowed there, e.g. one clause in a 448 beat).
2. State the judge's ruling on every item that isn't a straight "apply the reviewer's fix" (a disagreement, an
   ambiguous wording call, a scope boundary against a parallel fix pass).
3. The agent fixes items **one at a time**, in review order, and can reference the item number in commit-worthy
   comments — this keeps the report auditable line-by-line.
4. Any new lint the review implies (e.g. "no `$` or TeX command in a title") gets added to the relevant test
   file *by this pass*, not deferred.
5. Regenerate anything the fixes touch: numpy twins (run twice, byte-identical), generated meta
   (`UPDATE_META=1 npx vitest run src/content/meta.test.ts`) if titles changed.
6. Report one line per item: what changed, which test proves it; flag anything the agent disagrees with instead
   of silently overriding the review.

## Gates
- `npx tsc --noEmit` → 0; `npm run build && npx vitest run` → all green; numpy twins byte-identical across two
  runs; Playwright preview project → 0 CSP violations, whole suite green.
- Every Blocking item from the review has a corresponding code change *and* a test that would have caught it.
- No touch-list violation: `git status` in the fix worktree shows only the files the brief allowed.

## Outputs
- A worktree branch with the fix commit(s), evidence (test counts) in the message.
- Contact sheets of the changed beats in both tracks, into the scratchpad.

## Parallel-safe split (two fix agents on chapters that share files)
When two chapters were reviewed together and both need fixes, give each agent an **exclusive** file set (its own
`<ID>*.ts` and numpy script) and forbid the other chapter's files explicitly in the brief. A platform-level fix
that both chapters' beats depend on (e.g. a shared widget bug) goes to whichever agent's scope already includes
that file, named explicitly, with the other agent's brief stating "do NOT touch this — another agent owns it".

## Pitfalls
- Silently reformatting or "improving" text the review didn't flag inflates the diff and makes the next review
  harder to trust — touch only what the review or judge ruling names.
- A fix that changes a title or unit id without regenerating `meta.generated.ts` breaks the topbar/map/fork
  silently (visible only in `09-visual-qa`, not in unit tests).
- A fix to a 448 beat requested by a 709 review (e.g. the moment-opposite sign note) must stay minimal and keep
  448's own e2e and claims green — treat it as an edit into someone else's territory, not a rewrite.

## Next
`08-merge-gate` for the fix commit; then `09-visual-qa` to re-confirm the changed beats read correctly.
