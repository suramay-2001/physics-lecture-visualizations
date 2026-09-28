---
name: 17-flake-hunt
description: Diagnose a flaky e2e test by instrumenting real events on window and stress-running with repeat-each and multiple workers, rather than guessing at the cause. Trigger whenever an e2e test fails intermittently instead of consistently.
---

# Flake hunt — instrument, then stress

Worked example: BUILD-LOG "The place a swap keeps is read at the moment of the switch (2026-09-28)" — the
readingPosition lesson.

## When to use
An e2e test fails sometimes, not every time — especially anything involving scroll position, a reading-position
restore, a race between a control's own side effect and a probe that runs "once per frame".

## Inputs
- The flaky spec and its failure rate so far (e.g. "5/12 at 6 workers" — a real measured rate, not "sometimes").
- Any suspicion about the cause — but treat it as a hypothesis to test, not the starting fix.

## Steps
1. **Instrument first.** Record real apply/stop/probe events on `window` (a small dev-only hook) rather than
   inferring timing from outside. The goal is to see the actual order of events when it fails, not to reason
   about it in the abstract.
2. **Stress-run** with `--repeat-each=12 --workers=6` (or similar) to get a real failure rate and enough failing
   traces to compare against passing ones.
3. Compare the instrumented event order on a failing run vs a passing run — the difference is the actual bug,
   not the first plausible-sounding theory.
4. **Do not guess-and-fix.** BUILD-LOG's own example: the first guess for a scroll-restore flake was "scroll
   anchoring" — wrong. The instrumented traces showed the real cause: a control that scrolls the page as a side
   effect of being reached (a header toggle at the top) raced against a reading-position probe that only ran
   "once per frame after a scroll", so a frame race decided between the reader's actual position and the page
   top.
5. Fix the *measured* cause. In that example: any control that swaps the page state calls a synchronous
   `flushReadingProbe()` in its own event handler, instead of relying on the once-per-frame probe; and
   place-keeping tests use controls that are actually in reach at test time (e.g. the sticky rail's copy of a
   toggle), not a control that requires scrolling to reach.
6. Re-run the stress command until the failure rate is 0/N at the same worker count that originally reproduced it.

## Gates
- The fix is justified by an instrumented trace showing the actual race, not by "this seems like it should help".
- The stress command that originally reproduced the flake (same `--repeat-each`/`--workers`) now passes cleanly.
- A regression test exists that would fail again if the race were reintroduced (not just "it doesn't flake right
  now" — a structural test of the event order, where practical).

## Outputs
- A BUILD-LOG "Hard-won platform knowledge" entry describing the real cause and the fix, so the next similar
  flake is recognized immediately instead of re-diagnosed from scratch.
- The instrumentation itself, if cheap to keep, gated behind a dev-only flag.

## Pitfalls
- Fixing the first plausible theory without instrumenting wastes a cycle when it's wrong (as it was here) and
  can even mask the real bug if the "fix" happens to reduce the failure rate by accident.
- A multi-hour or oddly-slow single e2e run is more often a sign the machine slept mid-run than a real
  regression — rule that out (rerun) before spending time chasing a timing bug that never happened.
- A flake that only reproduces above a certain worker count needs that worker count in the reproduction command;
  testing at `--workers=1` can hide a real race entirely.

## Next
`08-merge-gate` to land the fix; note the lesson in BUILD-LOG's "Hard-won platform knowledge" either way.
