---
name: 18-usage-budget
description: Pace parallel and sequential agents under a weekly usage cap — which model tier each pipeline step should use, when to check usage, when to stop, and how to resume a stalled agent. Trigger before launching any batch of agents, and whenever usage is getting close to a cap.
---

# Usage budget — pacing agents under a cap

Reference: BUILD-LOG "KT points" #1, "Hard-won platform knowledge" (subagent stall entries).

## When to use
Before starting a batch (`00-course-pipeline`'s per-Part recipe), and periodically during a long multi-agent
session — not just when something already feels slow.

## Inputs
- The current usage level against the cap (check before starting a batch).
- The step about to run and its natural model tier (below).

## Steps
1. **Check usage before the batch.** If already near the stop threshold, do a smaller batch (fewer parallel
   agents, or split a step into two sessions either side of a reset) rather than starting a large one you can't
   finish.
2. **Pick the model tier per step:**
   - **Opus** — P planning (`03-chapter-plan`), judge rulings (`04-chapter-rule`, `02-part-map`), and truth
     reviews (`06-chapter-review`, lab-bench truth review) — anything that is fundamentally *judgment*: catching
     a wrong number, a weak derivation, an unfair citation.
   - **Sonnet** — builds, fixes, docs and wiring (`05-chapter-build`, `07-chapter-fix`, `08-merge-gate`,
     `10-stage-kind`, `11-engine-module`, platform commits) — well-specified execution against a brief.
   - **Haiku** — mechanical sweeps only: a scripted renumbering, regenerating a fixture file, a pure
     find-and-append across files with an unambiguous rule. Do not use Haiku for anything requiring judgment
     about correctness or wording.
3. **Check usage after the batch**, not just before — a batch that ran longer than expected can leave less
   headroom than planned for the next one.
4. **Stop at about 78% of a cap.** Don't run the last agent of a batch "to see if it fits" — leave headroom for
   the merge-gate and visual-QA steps that must follow a build before the batch can be called done.
5. **Resume after the reset**, picking up exactly where "Next action" in BUILD-LOG says.
6. **A stalled agent needs resuming with SendMessage**, not a fresh relaunch — it keeps its context, and a fresh
   agent would re-read everything from scratch at real cost. If main moved while it was stalled, have it
   `git merge --ff-only main` in its worktree first.
7. **Commit early (a WIP commit)** inside any agent whose task is long enough to risk hitting a limit mid-task —
   a worktree with an uncommitted partial state is much harder to resume than one with a WIP commit to build on.

## Gates
- No batch is started without a usage check first.
- No step runs on a model tier below what its judgment requirement calls for (a mechanical sweep on Opus wastes
  budget; a truth review on Haiku is a quality risk, not a savings).
- Every long-running worktree agent has committed at least once before the point it might stall.

## Outputs
- A paced sequence of batches that completes a Part without an agent dying uncommitted mid-task.
- BUILD-LOG's "Next action" kept current enough that a resume after a reset needs no re-derivation.

## Pitfalls
- The actual root cause of some past stalls was an unrelated safety-classifier timeout making *every* tool call
  slow, not brief size — if tool calls are generally slow, stop spawning subagents and do the work directly in
  small steps instead of retrying the same launch.
- A subagent brief that bundles heavy reading with many deliverables and no incremental saves stalls at the
  watchdog with nothing written; keep briefs to one deliverable, first action = skeleton, then fill section by
  section with saves — see `05-chapter-build`.

## Next
`00-course-pipeline`'s per-Part recipe for how these tiers map onto each pipeline step.
