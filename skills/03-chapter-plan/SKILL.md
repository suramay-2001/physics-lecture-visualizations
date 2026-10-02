---
name: 03-chapter-plan
description: Write role P's two-track story plan for one chapter — units, beats in both Ground-up and Formal tracks, derivations, claims, challenges, glossary, bridges and stage contracts. Trigger when a chapter's place in the Part map is settled and it is next in build order.
---

# Chapter plan — P's two-track story

Worked examples (this exact section list): `docs/roles/proposals/P-F1-story.md`, `P-Q1-story.md`. Single-track
(one course, no Formal track) courses use `docs/roles/proposals/P-L2-story.md` and skip the Formal columns.

## When to use
A chapter's sources are ingested and its place in the Part map is ruled. Plan it before any build agent starts.

## Inputs
- The Part map's row for this chapter (id, sources, driving question, bridge targets).
- Existing units this chapter's sources overlap (ownership rule from `02-part-map`).
- The demo chapter `app/src/content/qc709/__fixtures__/demoChapter.ts` and a built chapter's `.story.ts`, for
  exact field shapes to plan against (never invent a field the platform doesn't have — check
  `docs/roles/interface-changes.md` for what merged).

## Steps (the section list; keep every plan in this order)
0. **Chapter map** — id, title (≤ 8 words), driving question, sources with page numbers, bridges offered, per
   unit; outcomes; prerequisites; openers/films planned.
1. **Story beats per unit** — beat id `<unit>:b<n>`, phase tag (`[L]` core ramp / `[B]` a second source adds /
   `[C]` clue), **G** (Ground-up, ≤ 25 words/sentence) and **F** (Formal, ≤ 40 words/sentence) text, captions for
   both, stage shorthand, claims with their engine call and expected value.
2. **Derivations** — `{result, ground: DerivStep[], formal: DerivStep[]}`; Ground-up has *at least* as many
   steps as Formal; every step's `why` is one plain sentence; the last `tex` of each list ends on the result.
   Plan each step's `view?: StageState` (W-709 #11, "derivations drive the stage"): which lines share a picture
   and which change it, using a kind already on this unit's stage; **every track needs ≥ 2 distinct views**
   (`content.test.tsx`'s lint; a new chapter is never added to `DERIV_VIEW_LEGACY`). Name each view's `viewCaption`
   too — this is what prints in the Read-mode figure strip after the derivation.
3. **Try-it widget** per unit.
4. **Challenges** per unit — tier, prompt, answer, 3 hints, walkthrough (`[]` if the source problem is assigned
   homework in *either* course).
5. **Glossary terms** new in this chapter, both tracks. Mark a term `introduces: 'space' | 'notation'` (W-709 #12)
   when it names a new space or a new piece of notation the learner has not seen before; name the ONE beat that
   introduces it (`Beat.introduces`), at or before the term's first use, with a stage view and a caption in both
   tracks — that beat gets the "New space" / "New notation" eyebrow.
6. **Review card** per unit, both tracks.
7. **Symbol-before-use tables**, one per track (7.1 Ground, 7.2 Formal) — every symbol's first beat.
8. **Errata** confirmed for this chapter (carried from `02-part-map`, or found while planning).
9. **Engine gaps and stage-contract gaps** — 9.1 engine functions not yet written, 9.2 exact stage-state shape
   needed (this is what a `10-stage-kind` build reads), 9.3 widget gaps.
10. **Media** — 10.1 Blender opener, 10.2 Motion Canvas films (each drawn number named from the engine, for the
    manifest test), 10.3 Higgsfield decor (atmosphere only).
11. **Hooks** — 11.1 concept-map stations (`sameAs` where a twin concept exists in the other course), 11.2
    Arcade levels, one per unit.
12. **Questions for the judge** — anything genuinely ambiguous; do not guess and do not silently resolve a
    homework/proof overlap (ask; see `02-part-map` pitfalls).

Compute every claimed number **twice**, independently (the app's engine plus a throwaway numpy/TS script), before
writing it into a beat.

## Gates
- Every displayed number has a claim id and an engine call that produces it (no literal float in prose).
- Every TeX symbol used is defined earlier in the unit, a prerequisite, or the glossary, in *both* tracks.
- Ground-up ≤ 25 words/sentence, Formal ≤ 40, checked by re-reading, not assumed.
- A problem assigned in either course's homework has `walkthrough: []` everywhere, whatever the derivation route.
- Every derivation's Ground-up list AND Formal list each show ≥ 2 distinct `view`s, every view validates, and each
  view's kind is already used somewhere else on that unit's stage (W-709 #11; `content.test.tsx`).
- Every `introduces`-marked gloss entry is introduced by exactly one beat in its own chapter, with a stage view and
  captions in both tracks, at or before the term's first use (W-709 #12; `content.test.tsx`).

## Outputs
- `docs/roles/proposals/P-<ID>-story.md` (proposal only — nothing under `app/` is touched).

## Pitfalls
- A concept your chapter's sources also cover, taught earlier in *this* course or the *other* course, gets one
  link-back beat, never a second full derivation (ownership rule).
- The stage shorthand in §1 and the "stage contract" in §9.2 must describe the *same* fields the merged API
  actually has — check `interface-changes.md` before planning, or the build agent will silently rename things.
- A forward reference inside a re-ordered unit (renumbered beats) is a real defect class: `P-F1-review.md` item 8
  caught "chances" used before its defining beat after a beat reorder.

## Next
`04-chapter-rule` (the judge rules on this plan before any build agent starts).
