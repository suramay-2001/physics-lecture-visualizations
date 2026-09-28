# Pattern: a fix brief

Real example (trimmed), session scratchpad `brief-f1-fix.md` (see also `brief-q1-fix.md`, run in parallel on a
different chapter the same day):

```md
You are the content builder (roles P + W) for "Spin Lab" ... Your job: fix every item of the
independent review of 709 chapter F1. Commit on your worktree branch; report; stop.

## Setup (do first)
1. Read CLAUDE.md, BUILD-LOG.md (the 709 parts, Hard-won platform knowledge),
   skills/course-builder/references/chapter-agent-brief-709.md (the standing 709 rules), and
   THE REVIEW: docs/roles/audits/P-F1-review.md (20 items; your scope is all of them except
   item 19, which is ruled below).
...
5. Install nothing. Touch only: app/src/content/qc709/F1*.ts, pipeline/claims_qc709/f1.py
   (+ its regenerated JSON), app/src/content/content.test.tsx (the title lint only),
   app/src/stage/svg/ComplexPlaneScene.tsx (+ its tests; item 12 and the label collisions of
   item 13 only), and app/e2e/*.spec.ts only if a test names text you changed.
   Do NOT edit Q1's files (another review is running on them).

## Rulings (the judge)
- Item 19: the user confirmed 448's Euler homework is already submitted, so D5 stays as it is
  (docs/roles/decisions/qc709-pilots.md, amendment to ruling 1). f1-e-series stays hints-only.
- Item 1: plain Unicode titles ... ADD a lint in content.test.tsx, for BOTH courses: no `$` and
  no TeX command in any lecture title or unit title.
- Items 5–11, 13–18, 20: as the review says. Item 20: the twins must COMPUTE their values in
  numpy, not restate literals.
...

## Checks (from `app/`)
- npx tsc --noEmit → 0; npm run build && npx vitest run → all green; python3
  pipeline/claims_qc709/f1.py twice → byte-identical.
- Playwright PREVIEW project on port 5194: the whole suite, 0 CSP violations.
- Contact sheets of the changed beats in both tracks into the scratchpad f1fix-shots/.

## Report (under 350 words), then STOP
Branch and commit(s); one line per item (what changed, which test); anything you disagree with
(argue it). No push, no merge, no graphify update.
```

## The four things that make a fix brief work

1. **A hard touch-list, by exact path.** Not "fix F1" — a named, closed set of files. This is what makes two fix
   agents (F1 and Q1) provably safe to run in parallel on the same day: each one's touch-list is disjoint, and
   each brief explicitly says "do NOT edit the other chapter's files".
2. **The review file is the scope, not a summary of it.** "Your scope is all of them except item 19" points the
   agent at the actual numbered review (`docs/roles/audits/P-<ID>-review.md`) rather than re-explaining each
   item — the agent reads the primary evidence, same as the reviewer did.
3. **Every judgment call is pre-ruled, in the brief, not left to the fix agent.** A reviewer's item can be a
   straight "apply this fix" or a genuine disagreement the judge already resolved (item 19 above: the judge
   overrode the reviewer's flag because the user had separately confirmed a fact the reviewer didn't have). A
   fix agent never re-litigates a review item on its own judgment — it applies the ruling.
4. **A capped word-count report, one line per item.** This makes 20 fixes auditable at a glance: "item 3: gated
   the tally/Born readout behind `hidden-label`, per `sequences:b4`'s new test" — traceable straight back to the
   numbered review item.

## Why this differs from a build brief (`05-chapter-build`)

A build brief hands over an entire plan to transcribe; a fix brief hands over a *bounded diff* against something
that already exists and already passed most gates once. The touch-list is tighter, the report is shorter, and
every change traces to a specific, already-numbered finding rather than to a section of a story plan.
