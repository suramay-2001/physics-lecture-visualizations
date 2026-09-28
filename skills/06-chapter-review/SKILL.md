---
name: 06-chapter-review
description: Run an independent, read-only P truth review of a merged chapter — re-derive every number and answer key, check every citation and bridge, and produce a verdict with blocking/should-fix/nit items. Trigger right after a chapter merges and both e2e projects are green.
---

# Chapter review — the independent P truth review

Worked examples: `docs/roles/audits/P-F1-review.md`, `P-Q1-review.md`.

## When to use
After `08-merge-gate` lands a chapter on main and both e2e projects pass. The reviewer must be a **separate**
agent/pass from the one that built the chapter, and must not simply trust the builder's own claim tests — it
re-derives answers independently.

## Inputs
- The merged chapter files, contact sheets of every beat and reveal in **both** tracks (`09-visual-qa`).
- The source pages the chapter cites (read them again — do not trust the builder's paraphrase).
- The plan and rulings (to check the builder followed them, including any beat renumbering).

## Steps
1. Screenshot every beat and reveal in both tracks (or reuse `09-visual-qa`'s contact sheets); note console
   errors (target: 0).
2. **Recompute** every displayed decimal, every challenge answer and every hint, independently (numpy or a
   throwaway script, seeded the same way as any random tallies in the content).
3. **Read the source pages** in `sources/*/text.md` and the page renders for every citation; check § and printed
   page against the offset table.
4. **Follow every bridge** out and back, in both tracks, and confirm it lands on the exact beat the `ret` param
   should restore.
5. Check derivations: every step true, every `why` a fair one-sentence reason, both tracks' last step ending on
   the stated result.
6. Check the errata box: every item is an actual error (not something already correctly mapped by the Rosetta),
   with real evidence, and its `check()` tests something about the claim, not just re-derives an unrelated
   number (a review catches "checks nothing about its claim" as a defect class, `P-Q1-review.md` items 5).
7. Sort every finding into **Blocking** (physics or displayed-number errors, a false statement, a spoiled
   answer), **Should-fix** (real but non-blocking: an undefined symbol in Ground-up, a weak derivation step, an
   uncredited exercise), and **Nits** (label collisions, wording).
8. Write the verdict: **PASS** or **FIX-FIRST** (never silently PASS with unresolved Blocking items).

## Gates
- Every displayed number in the chapter has been independently recomputed, not merely re-read from its own
  claim test (a claim test only proves engine ↔ numpy agreement, not that the *prose* states the right thing).
- Every citation's § and page is checked against a rendered page, not assumed from the plan.
- A Blocking item list of zero is required for PASS; anything else is FIX-FIRST.

## Outputs
- `docs/roles/audits/P-<ID>-review.md`: verdict, evidence summary (contact sheets, recompute count, vitest
  count), then Blocking / Should-fix / Nits / Builder's-language-questions / Checked-and-right sections.

## Pitfalls
- A near-copy that shares only 6–7 words with the source slips past an 8-gram verbatim test; a reviewer scans
  for shorter shared runs by hand on suspicious sentences (`P-Q1-review.md` item 7).
- A hand-typed physical constant with no `V` key and no claim (e.g. ħ, μ_B written as text) looks harmless but
  has no numpy twin — flag it for removal until the engine constant lands (`P-Q1-review.md` item 12).
- A stage/caption mismatch a unit test cannot see (a readout that contradicts or spoils the prose) only shows up
  by actually reading the rendered beat, not by reading source files.

## Next
`07-chapter-fix` on every Blocking and Should-fix item (a FIX-FIRST verdict always leads here).
