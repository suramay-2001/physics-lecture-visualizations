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

`DerivStep = {tex, why, claims?, view?: StageState, viewCaption?: string}`. Both `ground` and `formal` lists'
**last** `tex` ends on the result's right-hand side. **Ground-up has at least as many steps as Formal** (never
fewer — the whole point of the Ground-up track is to not skip a step Formal can take for granted). Every step's
`why` is one plain sentence, never a bare citation. Stepped and animated by `components/Derivation.tsx`: all
lines at rest by default, a "step through" mode, keyboard-accessible, no animation under reduced motion.

### Derivations drive the stage (W-709 #11)

`view` is a single stage state (never a split/inset layout), using a kind already shown somewhere else on the
unit's stage (`content.test.tsx` checks this). A step without `view` inherits the **latest earlier step's**
view, within the SAME track's list — ground and formal carry their own, since they have different numbers of
steps. Before any step of the list carries a view, the beat's own `stage` applies. `viewCaption` is the stage
caption while that view is the one showing (defaults to the beat's own `caption`).

- **Story mode:** stepping (Step through, Next/Back, ← / →), or — at rest — focusing or clicking a line, selects
  it and moves the beat's stage to its effective view (`content/track.ts` `derivViewAt`, `stage/store.ts`
  `setDerivOverride`, `stage/drive.ts` `driveUnit`'s `derivOverride` parameter): the SAME resolve/interpolate path
  as a beat-to-beat change, so passports, drawn views and readouts stay in sync. Leaving the beat, or pressing
  "Show all", returns the stage to the beat-driven state. No tween under reduced motion.
- **Read mode and print:** a figure strip after the derivation, one numbered `FigureFor` per DISTINCT view
  (`content/track.ts` `derivFigureGroups`), lettered onto the beat's own figure number (`Q0.3a`, `Q0.3b`, …),
  labelled with the line numbers it covers ("lines 3–5"). It takes the beat's single figure's place, not beside
  it (`stage/figures/FigureFor.tsx` `totalFigureCount` accounts for the expansion). Zero canvases, as ever.
- **Lint:** every derivation's Ground-up AND Formal list has **≥ 2 distinct views**, and every view validates
  (`content.test.tsx`). `DERIV_VIEW_LEGACY` exempts chapters awaiting their retrofit; a new chapter is never
  added to it.

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
| Each derivation track has ≥ 2 distinct `view`s that validate, kinds already on the unit's stage | `content.test.tsx`, 709 only; `DERIV_VIEW_LEGACY` exempts chapters awaiting retrofit |
| Each `introduces`-marked gloss has exactly one introducing beat (own chapter, both captions, at/before first use) | `content.test.tsx`, 709 only; same `DERIV_VIEW_LEGACY` allowlist |
| Every used bridge id exists; every unused id fails | `bridges.test.ts` |
| `ret` param: hostile/oversized/unknown values → `null` | `returnParam.security.test.ts` |
| Claim keys are course-prefixed and globally unique | `content/values.ts` `mergeValues` (throws on duplicate) |
| Homework in either course → `walkthrough: []` everywhere | reviewed manually per `04-chapter-rule`'s homework guard; no automated check crosses courses |
| No verbatim copying from a source | an 8-gram overlap test against every file in `sources/` |
| Beat ids run `b1, b2, …` in order within a unit | the phase-order / id lint in `content.test.tsx` |

## Notation beats (W-709 #12)

`GlossEntry.introduces?: 'space' | 'notation'` names a term as a new space (e.g. the complex plane, the Bloch
sphere) or a new piece of notation (e.g. an amplitude, a ket). `Beat.introduces?: string[]` names the gloss ids
a beat introduces; that beat shows a small "New space" / "New notation" eyebrow above its text, in both tracks
and in Read mode (`content/glossRegistry.ts` `introducesLabel`, read by `components/StoryStage.tsx` and
`stage/StaticStory.tsx`).

- Exactly one beat, in the chapter that owns the gloss entry, introduces it.
- That beat has captions in both tracks, and sits at or before the term's `first` use (by unit order, then beat
  order within a unit).
- The same `DERIV_VIEW_LEGACY` allowlist exempts chapters awaiting retrofit.

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

## 448 platform additions (W-448 #1-#5; rulings `docs/roles/decisions/448-L8L11.md` P1-P6)

Added before Lectures 8-11 so four lectures can be built in parallel. All additive; Lectures 1-7 are unchanged.

### Class marker (W-448 #1)

`Beat.classMark?: {class: number; from?: string}`. A 448 chapter is cut by topic, not by class time, so a class of the
notes can begin or resume inside one. The beat that opens it carries the marker: a slim rule above the beat reading
"Class 9 starts here", or "Class 9 · from minute 23" when `from` (a short plain phrase) says where in the class the
chapter takes up. Drawn in Story mode, Read mode and print (`components/ClassMark.tsx`); it adds no step and changes no
stage. Lint (`content.test.tsx` `classMarkProblems`): `class` a whole number >= 1; `from` 1-40 characters of letters,
digits, spaces and `. , : ; ' -` (no TeX, no markup); strictly increasing along one chapter; never decreasing along
the course (class 9 may close one chapter and resume in the next, never come after class 10).

### Go deeper (W-448 #2)

`BeatPhase` gains `'deeper'`, a fourth phase after the clues (L -> B -> C -> D): optional material BEYOND the notes, shown
under the eyebrow "Go deeper · beyond the notes" in its own dashed frame, in Story mode, Read mode and print. Use it for
a derivation the notes skip or a live demonstration of something they only state. It is not a `beyondLecture` beat
(that badge sits inside the notes' line) and not a unit-level box. The lint `deeperProblems` (`content.test.tsx`) keeps
Go-deeper beats out of the notes' own line, the notes' line being every other phase plus the unit's Try-it, insight,
review card and challenges: a reader who skips every deeper beat loses nothing the line relies on. So a deeper beat
comes after every clue and is never a unit's first; it carries no `introduces` and no `classMark`; and a glossary
entry whose `first` is a deeper beat is used only inside deeper beats of its chapter. A deeper beat may use anything
the notes' line introduced. Lecture-specific rules (for example "the determinant test appears only in Go-deeper
beats") are the lecture's own tests.

### One-track derivations (W-448 #3)

`Derivation.formal` is optional. A one-track course (448) writes `{result, ground}`; a two-track course (709) still
gives both lists, and the 709 lints are unchanged. The lints now run per track over each chapter's own
`COURSES[course].tracks` (`derivationProblems`, `derivationViewProblems`): the Ground-up list ends on the result and
shows at least two distinct, valid views (W-709 #11); a one-track derivation carrying a `formal` list is rejected (it
would never be shown). A track without its own list reads Ground-up's (`content/track.ts` `derivSteps`).

