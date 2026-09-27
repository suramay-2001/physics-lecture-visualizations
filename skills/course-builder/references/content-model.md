# Content model

## Schema (`app/src/content/schema.ts`, `stage.ts`)
Lecture { id, number, title, date?, outcomes[], prerequisites[], units[], corrections?[], watch?[], symbols? }
Unit { id, title (≤ 8 words), question (one sentence), lecture {summary, pages, equations?}, books[], visual
(widget spec + tryThis[]), clues[], insight, play (challenges), pitfalls?, story?: Beat[], review?, beyondLecture? }
Beat { id, phase: 'lecture'|'books'|'clue', text, caption?, stage: StageState | layout, terms?, claims?,
fidelity?, reveal?: { text, caption?, stage, claims? } }  — clue beats reveal on click.
Stage kinds (each with a passport naming its space): lab-r3 (physical space), hilbert-plane (real slice of
state space), bloch (pure states), bloch-ball (pure + mixed), hopf (S³ by stereographic projection),
operator-space (A = a₀I + a·σ). A layout can stack two kinds or inset one.

## Beats: the story grammar
- **lecture** beat: what the notes say, paraphrased, with the page.
- **books** beat: what Townsend / Susskind / Axler add (§ + printed page).
- **clue** beat: a question with the stage frozen on the question picture; "Show me" reveals the answer and
  moves the stage. Clues build intuition; they never introduce a symbol first.
- Interpolate inputs, recompute outputs: scenes draw only what the resolver computed from the engine.

## Three reader layers from one source
- **Core text** for "stuck after the reading": short sentences, plain words.
- **Glosses** (`[[term]]`, `glossary.ts`) for "meeting it cold".
- **Review card** per unit for "exam review": 3–4 points + one trap.

## Language rules (tested where possible)
- Symbol before use: every TeX symbol is defined in the unit, a prerequisite or the glossary (lint test).
- Summary sentences ≤ 25 words. Paraphrase sources; a verbatim 8-gram test compares app text with `sources/`.
- Name distortions: every stage kind has a fidelity contract (exact / schematic / misleading), one click away.
- Homework problems from the notes: hints only, no walkthrough (`assigned`).
- Errata go in the lecture's `corrections` box, respectfully, with the evidence.

## Challenges and help
Challenge { id, tier: warm-up|core|stretch, prompt, answer (number parsed without eval, or choice), hints[3],
walkthrough steps }. Help lists every walkthrough with routes back to the challenge and to its chapter.

## A second course (Physics 709, 2026-09-28)
- **Registry.** `content/courses.ts` lists the courses (id, tracks, sentence caps, theme). A course's chapters live in
  their own folder (`content/qc709/`) and are found by glob. Their files are `{ID}.ts`, `.story`, `.review`, `.values`
  and `.glossary`, so a new chapter touches no shared file.
- **Ids are prefixed** (`Q4`, `q4-…`, claim keys `q4…`, `qc-…`), and a namespace test keeps the two courses apart.
- **Two tracks over one stage.**
  - Every text has a Ground-up form and a Formal form: `text`/`formal`, `caption`/`captionFormal`,
    `insight`/`insightFormal`, and the review card's and gloss's `formal`.
  - `derivation {result, ground[], formal[]}` is stepped by `components/Derivation.tsx`.
  - Lints run per track: ≤ 25 and ≤ 40 words; symbols and claims in both.
- **Phase `'core'`** ("The foundation") is for chapters with no lecture notes (the F chapters).
- **Bridges.**
  - `<<id|shown>>` links to a first-course unit and carries `?ret=`, which holds ids only and is validated field by
    field.
  - The `ReturnBar` brings the reader back to the exact beat.
  - A concept the first course teaches is bridged, not re-taught.
- **Print notes.** Read mode in the active track, with one numbered figure per stage change (`stage/figures/`). An SVG
  stage kind draws its own print figure.
