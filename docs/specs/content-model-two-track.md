# Design spec: content model and the two-track system

Source of truth: `app/src/content/schema.ts`, `content/stage.ts`, `content/walk.ts`, `content/track.ts`; the
interface-change rows W-709 #1–#3 in `docs/roles/interface-changes.md`; the working reference
`skills/course-builder/references/content-model.md` (read that first for the single-track / 448 base model —
this spec covers only what a **second, two-track** course adds).

## Base shape (single-track, unchanged by 709)

`Lecture { id, number, title, outcomes[], prerequisites[], units[], corrections?[], symbols? }` →
`Unit { id, title, question, lecture, books[], visual, clues[], insight, play, story?: Beat[], review? }` →
`Beat { id, phase, text, caption?, stage, terms?, claims?, fidelity?, reveal? }`.

## What two tracks add

| Field | Added to | Rule |
|---|---|---|
| `Beat.formal` | every beat | Formal-track text, parallel to `text` |
| `Beat.captionFormal` | every beat with a caption | Formal-track caption |
| `BeatReveal.formal` / `.captionFormal` | every clue reveal | same pairing for reveals |
| `Beat.derivation?: {result, ground: DerivStep[], formal: DerivStep[]}` | a beat with a derivation | see below |
| `Unit.insightFormal` | every unit | Formal-track insight line |
| `ReviewCard.formal` | every review card | Formal-track review block |
| `GlossEntry.formal` | every glossary term | Formal-track definition |
| `Lecture.symbolsFormal` | a chapter's symbol map | Formal-track symbol table |

`Beat.stage`, `terms`, `claims` and bridge targets are **shared** by both tracks: one stage per beat; a position
holds in either track (so switching tracks mid-scroll keeps the reader's place and the stage picture).

## Beat rules

- Ground-up: 9th-grade start, every step derived, ≤ 25 words per sentence.
- Formal: full notation and vocabulary, ≤ 40 words per sentence.
- Symbol-before-use and gloss-at-first-use are checked **per track independently** — a symbol defined only in
  Formal is still undefined in Ground-up.
- A beat's phase tag is one of `'lecture'` (what a course's own notes say), `'books'` (a second source adds,
  cited by § and printed page), `'clue'` (click-to-reveal), or **`'core'`** — new for 709: "The foundation", used
  only by chapters with no lecture notes of their own (the F chapters), never mixed with `'lecture'` in the same
  chapter (`content.test.tsx` `phaseProblems` lint).
- Every unit with a story shows at least one number, in every track.

## Derivation rule

`DerivStep = {tex, why, claims?}`. Both `ground` and `formal` lists' **last** `tex` ends on the result's
right-hand side. **Ground-up has at least as many steps as Formal** (never fewer — the whole point of the
Ground-up track is to not skip a step Formal can take for granted). Every step's `why` is one plain sentence,
never a bare citation. Stepped and animated by `components/Derivation.tsx`: all lines at rest by default, a
"step through" mode, keyboard-accessible, no animation under reduced motion.

## Bridge rule

Prose syntax `<<id|shown text>>`, parsed by `walk.ts` `INLINE_RE` / `bridgeRefs()`. `id` is the *target unit's
own id* — `qc709/bridges.ts` keys equal target unit ids, so one bridges table entry serves every chapter that
links to that unit. A gloss entry may carry `bridge: id` for its popover ("Learn it in Spin Lab 2.3"). Following
a bridge: probe the reading position → `replaceState` the current URL with `?at=&f=` (so Back still works) →
push the target URL with `?ret=<course>~<lecture>~<unit:beat>~<frac>~<track>#<anchor>`, holding **ids only**,
parsed field-by-field against the live registries (`ui/returnParam.ts`) — never a raw URL, so it cannot become an
open redirect. `ReturnBar` renders "Return to 709 · Chapter Q8 · Bell states, step 4", survives reload, a new
tab, and a chain of bridges, and restores focus + reading position on return.

- **Bridges only ever target a unit that is already built.** A reference to a not-yet-written chapter is written
  in words ("Chapter F2 builds this"), never as `<<…>>` — `bridges.test.ts` fails on an unresolved target.
- **Ownership, not re-teaching:** a concept the other course already teaches is bridged, not re-derived at
  length in the new chapter.
- `Concept.sameAs?: <448 concept id>` links a 709 concept station to its 448 twin, drawn as a dashed cross-course
  edge on the concept map.

## Gloss, review card, claim and phase rules together (the lints that enforce each)

| Rule | Enforced by |
|---|---|
| Symbol before use, both tracks | `symbols.test.ts`, run per course × track |
| Gloss term defined at first use | the same symbol/gloss lint, per track |
| Sentence caps: Ground ≤ 25, Formal ≤ 40 words | `content/*.test.ts` sentence-length checks, per track |
| Every displayed number ↔ a keyed claim ↔ a numpy twin | `claims.test.ts`, per course × track |
| `'core'` phase only in F chapters, never `'lecture'` there | `content.test.tsx` `phaseProblems` |
| Every beat/reveal has `formal` (709) | `content.test.tsx`, 709 only |
| Both derivation lists end on `result`; Ground-up ≥ Formal steps | `content.test.tsx`, 709 only |
| Every used bridge id exists; every unused id fails | `bridges.test.ts` |
| `ret` param: hostile/oversized/unknown values → `null` | `returnParam.security.test.ts` |
| Claim keys are course-prefixed and globally unique | `content/values.ts` `mergeValues` (throws on duplicate) |
| Homework in either course → `walkthrough: []` everywhere | reviewed manually per `04-chapter-rule`'s homework guard; no automated check crosses courses |
| No verbatim copying from a source | an 8-gram overlap test against every file in `sources/` |
| Beat ids run `b1, b2, …` in order within a unit | the phase-order / id lint in `content.test.tsx` |

## Reading position, track toggle and Story/Read

One `stage/readingPosition.ts` (`probeReadingPosition() → {beat, frac}`, `restoreReadingPosition(pos)`, and
`onStoryRefreshed(cb)` so a restore waits for the story's first layout refresh) serves **three** consumers: the
Story/Read swap, the `TrackToggle`, and a bridge's return. `ui/trackPref.ts` follows the same pattern as
`readModePref.ts`: a per-course stored preference (`qc709.track.v1`), a `?track=` URL override, validated on
read. The track toggle is independent of Story/Read and shown only for two-track courses.

## What stays single-track

448 runs Ground-up only: its lints, claim tests and beat/review shapes are byte-for-byte unchanged by any of the
above (every 709 addition is additive and optional on the shared schema types, per the `l1-freeze` interface
rule — a breaking change to a frozen export needs its own `interface-changes.md` row and a judge's approval).
