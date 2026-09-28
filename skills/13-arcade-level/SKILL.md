---
name: 13-arcade-level
description: Add Arcade levels that train a course's chapters — engine-verdict games grouped by chapter, describing the pattern generically since a second course's Arcade is being wired up separately. Trigger when a chapter plan's Hooks section (03-chapter-plan §11.2) lists Arcade levels to add.
---

# Arcade level — add a level for a course

Existing implementation (448, the worked pattern): `app/src/arcade/{GamePage.tsx,TrainsLink.tsx,games.ts,
games.test.ts,golf.ts}`. **Note:** a second course's (709) Arcade is being made to work correctly by another
agent as of this writing — this skill describes the *pattern* generically; once that work lands, 709 levels will
live in the same `games.ts` registry with `qc-` ids and a 709-aware `GamePage`, following the shape below.

## When to use
A chapter plan's §11.2 names one Arcade level per unit (e.g. "route the beam", "spot the error", "Bloch golf").
Add levels after the chapter itself is merged, so `trains` can point at real, built unit ids.

## Inputs
- The chapter's built units (a level's `trains` field needs a real `{lecture, unit}` pair from
  `content/meta.generated.ts` or the course's own generated meta).
- The plan's §11.2 level list: format (route/spot-the-error/golf/other), the correct answer, and (for
  spot-the-error) the wrong step index.

## Steps
1. Add each level to `app/src/arcade/games.ts` with an id in the course's namespace (`qc-` prefix for a second
   course, so `courseOfId` routes it to that course's Arcade page).
2. Set `trains: {lecture, unit}` to a real, already-built unit — never a planned-but-unbuilt one.
3. For a "spot the error" level, back its correction with the engine — the level's stated correct value must be
   an engine call, checked in `games.test.ts`, not a hand-typed number.
4. For a golf-style level (minimal move sequence to a target), confirm the par is genuinely minimal (searched,
   not guessed) and that the move set cannot trivially undo itself in pairs (a known planning trap — see
   BUILD-LOG "Open issues": a planned "truly home" golf level needed a move set audit before it could ship, and
   the pilot instead shipped a spot-the-error round as its safe fallback).
5. Add one engine check per new "spot the error" correction to `games.test.ts`.
6. Confirm the level is solvable and not pre-solved: a test plays it and checks the win condition is reachable
   but not trivially already met.

## Gates
- Every level's `trains` unit exists and is built (a test checks this).
- Every level is solvable (a test can win it) and not pre-solved (a test confirms the initial state is not
  already the win state).
- Every spot-the-error correction matches the engine's number, tested.
- Pars for golf-style levels are minimal, established by search, not intuition.
- The topbar/fork/Arcade level-total counts that grow with the course are updated (an e2e count that isn't
  bumped fails loudly, which is intentional — don't silence it by loosening the assertion).

## Outputs
- New entries in `games.ts` (+ `games.test.ts` coverage).
- If the plan's level format doesn't exist yet on the target course's Arcade page, list it as **deferred** in
  the chapter build report rather than inventing a new page feature mid-chapter-build (`05-chapter-build`'s
  brief pattern: "Arcade and media: out of scope unless the rulings say otherwise").

## Pitfalls
- Building a level against a chapter's *planned* unit ids before the chapter merges means the level ships
  broken or gets silently dropped; always sequence this after `08-merge-gate` for the chapter.
- A "par" set by feel rather than a real search is exactly the kind of unverifiable claim this whole project's
  house rule (every number tested) exists to prevent — treat a golf par as a number needing a claim, same as any
  physics value.
- Two chapters' levels landing in the same PR can collide on shared `games.ts` regions — append only, per
  `05-chapter-build`'s parallel-build rule.

## Next
`09-visual-qa` to confirm the level plays and reads correctly; `08-merge-gate` to land it.
