<!-- Brief as used for the 448 L19–L20 batch (2026-11-16/17); copy, then replace the lecture ids, commits and counts. -->

You are the Arcade builder for Physics 448 Lectures 14–20 in a git worktree of the "Spin Lab" repo. Follow `skills/13-arcade-level/SKILL.md`. Lean: ≤ 140 steps, batch reads, quiet outputs, no Playwright, no push.

Setup: `git merge --ff-only main` (main is at b2b371d, L19–L20 built); node_modules symlinks and the `sources/` link per `docs/patterns/worktree-agent-setup.md`; `graphify query` before grepping. Model: the existing 448 Spot-the-error rounds for L12–L13 in `app/src/arcade/games.ts` (the `L12x`/`L13x` Trains helpers, `ERROR_ROUNDS`, ~lines 112–122 and 960–1024) and their tests (`games.test.ts`, `games8–11.test.ts`).

## What to build (judge's rulings)
Only the existing game type `spot-the-error` fits wave mechanics; no new game type (the plans' "Squeeze", "Detector" games stay deferred).
- One round per unit that has a real trap, at least 3 and at most 5 rounds per lecture, about 25 in all. Start from each plan's §11 **Arcade** line (`docs/roles/proposals/P-L14-story.md` … `P-L20-story.md`), then fill from the units' review cards (`app/src/content/L*.review.ts`: each card's trap is a misconception the lecture itself corrects).
- Do not duplicate an error across lectures: L19's plan repeats L18's "a tail means the particle gets through" — L18 keeps it; L19 takes `l19-match` ("T = |τ|² even when the two outer regions have different V") instead.
- L14's plan says to re-home the L13 rounds `SC13`/`TI13`: do it only if `l13-schrodinger` / `l13-time` no longer teach that point (check the built L13/L14 units); otherwise leave them in L13.
- Every round: 4–5 steps, exactly one wrong, the `why` explains it in one or two sentences and names the unit ("Unit 17.3"); `trains` is a real built unit (helpers `L14x` … `L20x` with labels from the built unit titles and their "14.2"-style numbers). Any number in a step or a `why` comes from the lecture's values (`L*.values.ts` / the engine), never typed by hand, and a test checks it against the engine. One voice, sentence cap 25 words, TeX as the existing rounds. Errors must be the kind a learner actually makes, and the right steps must be genuinely right (re-check signs and factors).
- Arcade counts that grow with the course (Arcade list, topbar/fork totals, e2e count assertions in `app/e2e/*.spec.ts`): update them exactly; never loosen an assertion.

## Chunk rule (l) — check this first
`arcade/games.ts` is data in the entry closure (the entry is ~490 KB of the 497 500-byte raw / 170 000 gzip budget; the budget is never raised). ~25 rounds of text may not fit. Build after the first few rounds and run `npx vitest run build/chunks.test.ts`. If the entry would exceed the budget, move the round bodies (steps, why) of the L14–L20 rounds — or all Spot-the-error round bodies — into a module loaded with the game page (as `catchEve.ts` is), leaving in the entry only what the list and `TrainsLink` need (id, title, trains). Record the measured entry size in the chunks history comment (one line, the existing format).

## Rules
Paraphrase; nothing from `sources/`; 7-word overlap sweep of new prose against `sources/L14`–`L20` `text.md`; commit per lecture group with explicit paths and the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; a relay note `docs/context/relay/2026-11-17-448-arcade-L14L20.md` (≤ 6 lines).

## Acceptance
`npx tsc -b` 0 errors; `npx vitest run src/arcade src/content` green; `npm run build` + `build/chunks.test.ts` green with the entry size; `UPDATE_META=1` twice clean if meta changes. Report under 100 words: rounds per lecture, any re-homing, chunk measures, e2e numbers changed, commits, branch name.
