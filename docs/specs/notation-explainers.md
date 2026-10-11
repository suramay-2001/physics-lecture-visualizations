# Notation explainers (spec)

Decision: `docs/roles/decisions/notation-explainers.md` (user + judge, 2026-10-10). Built by one agent as W (platform) and
P (dictionary). This file says how it works and how to extend it.

## What the reader gets

Click, tap, hover or keyboard-focus a piece of notation in any rendered maths (both courses) and a plain-English card
opens. On by default; the topbar toggle **Explain notation** turns it off (remembered per viewer, `spinlab.notation.v1`,
only the OFF choice is stored). Marked notation has a subtle dotted underline.

| Input | Behaviour |
|---|---|
| mouse | hover 300 ms opens; click pins (close button, Esc, a second click, or a press elsewhere close it); the card can be entered |
| touch | a tap pins; a tap elsewhere or the close button closes (hover does not apply) |
| keyboard | one Tab stop per **reading group** (a story beat with its derivation, a review card, one Play challenge, the intuition with its pitfalls, a Try-it block, the chapter head), not per formula; focus shows an outline and a hint, never a card; arrows move between the marks of the whole group (carrying the stop to the next formula), Home and End jump to its first and last mark; Enter or Space opens and pins the current mark's card and moves into its link; Esc closes (and is kept from other widgets only while a card is open) and returns to the formula; Tab and Shift+Tab inside the card go to its next control or back to the formula, never out of the document; × returns focus to the formula; leaving the formula and the card closes it |
| screen reader | one visually hidden polite live region (`.notation-live`) says the card's name, how to read it and its plain meaning when the keyboard opens a card or moves it to another mark, and the mark's name and reading when the arrows move with no card open; the formula's `aria-describedby` points at the hint, or at the card while it is open, for a reread; KaTeX's own MathML is untouched |
| print | no cards, no underline; "Notation in this chapter" is printed, open |

A card says, in order: the symbol, its name and how to read it aloud; what it means (709 follows the reader's track,
Ground-up or Formal; 448 has one voice); a tiny worked example (its numbers are computed by `physics/`, never typed in);
"In this spot": what the formula it was met in says (from the captured limits and pieces) and what the notation means in
physics; a link to where it is taught, with the usual return bar. The chapter ends with **Notation in this chapter**: every
notation the chapter's text uses, in order of first appearance, with its plain meaning (folded while cards are on, open
when they are off, in Read mode and in print).

Not explained: maths inside a glossary popover, a card, a stage label or passport, or inside a control (button, link,
summary, label, field): a press there is the control's own action. `UNEXPLAINED` in `ui/Rich.tsx` and
`components/NotationRuntime.tsx` list them.

## How it works

```
authored TeX ──markNotation──▶ TeX with \htmlData{notation=<id>,lo=…}{…} ──KaTeX (trusted)──▶ <span class="enclosing" data-notation data-lo …>
                                                                                                     │ one delegated listener (document)
                                                                                                     ▼
                                                                    card (NotationCard) ◀── dictionary entry (content/notation.entries.ts)
```

- `ui/notationMark.ts` (lazy) is the pre-processor: a token scanner, lossless, balanced. It marks a self-contained run of
  tokens; it never marks inside `\text`/`\mathrm`/`\operatorname`/…, never between a command and its unbraced argument, and
  returns the source untouched on unbalanced TeX. A `\htmlData` group is an `.enclosing` span, which KaTeX's spacing looks
  through, so a mark does not change the typesetting. Four consequences are handled on purpose:
  1. a script after a mark goes **inside** it (otherwise the wrapper, not the last atom, would be the script's base);
  2. a mark in an unbraced script gets braces (`^\dagger` → `^{\htmlData{…}{\dagger}}`; a function cannot be an unbraced argument);
  3. a mark that is one relation or binary-operator symbol is wrapped `\mathrel{…}` / `\mathbin{…}` so KaTeX still allows an
     inline line break after it (it reads the top-level node's own class);
  4. `\iff` and `\implies` are macros that add their own spaces and are not marked.
- Context capture (decision rule 3): the limits and summand of `\sum`/`\prod`, the pieces of `⟨a|b⟩`, `⟨a|M|b⟩`, `|a⟩⟨b|`, the
  shape of a matrix, the exponent of `e^{i…}`, … are captured at pre-processing time as data attributes `lo hi of a m b`. KaTeX
  reads the `\htmlData` argument raw (spaces and `%` do not survive), so the TeX travels encoded: ASCII letters and digits stay,
  every other byte is `.` + two hex digits (`ui/notationCodec.ts`).
- `ui/tex.ts` `renderAuthoredTex(src, display, notation)` accepts marks only with `notation` on, and only `\htmlData` whose keys
  are `notation` (id `^[a-z][a-z0-9-]{0,23}$`) plus `lo hi of a m b`, every value in `[A-Za-z0-9.]{0,320}`. No `\href`, `\htmlId`,
  `\htmlStyle`, no other key: the CSP is unchanged (no inline script or style is added).
- `ui/notationPref.ts` holds the choice and loads the pre-processor on the first `<Tex>` rendered with the choice on: until it
  arrives, maths is typeset plain; then every `<Tex>` re-renders with marks (no size change, nothing moves).
- `components/NotationHost.tsx` (entry) mounts `NotationRuntime` (lazy: the one listener, the open-card state), which loads
  `NotationCard` and the dictionary on first use. `components/Popover.tsx` is the glossary popover's portal and positioning,
  shared: fixed under its anchor, flipped above it when there is no room, clamped to the viewport on both axes (it stays on a
  375 px phone), following scroll, resize and its own size.
- Physics 709 only (`NotationScope.gates`, set by `LecturePage`): bare `X Y Z H I` are marked as gates, but only in a formula
  where at least one of them stands in a plainly gate-like place (next to a ket, `⊗`, `·` or another gate letter; as `X²`,
  `H^{⊗n}`, `X†`; or as `X = (matrix)`), and never after `\Delta` or with a subscript. `⟨X⟩` and `(ΔX)²` stay variables.

## The dictionary (`content/notation.entries.ts`)

One entry per id in `MARK_IDS` (`ui/notationMark.ts`); `content/notation.test.ts` keeps the two lists equal. An entry has:
`id`, `tex`, `name`, `say` (read aloud), `ground` (sentences ≤ 25 words), `formal` (≤ 40; missing = same as ground), `physics`,
`example()` (computed; `{tex, says, values}`), `here(ctx, track)` (sentences about THIS use), `taught` (`{sl448?, qc709?}`, a unit
id that must exist). To add one:

1. emit the id from the pre-processor (a case in `recognise`) and add it to `MARK_IDS`;
2. add the entry (use engine functions in `example()`, never typed numbers) and a `SAMPLE` TeX and a `HAND` row in
   `content/notation.test.ts`; run it (it checks word caps, that every piece of TeX renders, every taught id, the example against
   its hand value);
3. if the formula should be reachable by keyboard it already is (any formula with a mark, as a member of its reading group); if it is
   school maths, add it to the `plain` set of the Formal-voice test;
4. write the example's numbers with the helper `N(x)` from a computed value (a chosen constant goes in the example's `inputs`):
   `content/notation.numbers.test.ts` fails on any digit typed into a caption; point `taught` at a unit that writes the symbol (or add
   it to the words-only list in `content/notation.taught.test.ts` with the phrase that defines it).

Notation no built chapter teaches has no `taught`: ≈, ∝, ⇒, ⇔, ±, ·, √, ∂ are school maths. `mod`, `gcd` and `⌊ ⌋` are taught in
chapter F8 ("Hidden rhythms") and link there (F8 merged 2026-10-11): `mod` to `f8-clock`, `gcd` to `f8-euclid` and `⌊ ⌋` to
`f8-fractions` (the whole part of a binary fraction; the quotients of a continued fraction). The test checks the ids exist.

## Chunks and tests

Entry chunk (budgeted): the pref, the toggle, the mount point, the vocabulary of a mark (`ui/notationKeys.ts`), the trust check,
the `Tex` changes and `Popover`. Lazy (rule (o) of `build/chunks.test.ts`): the pre-processor, the listener, the card, the key, the
dictionary. Tests: `ui/notationMark.test.ts` (rules, context, line breaking, trust), `ui/notationMark.corpus.test.ts` (every TeX span
of both courses renders with marks identically to without, apart from the wrappers and the lost line-break opportunities inside a
mark), `content/notation.test.ts` and `content/notation.context.test.ts` (dictionary, context sentences end to end),
`content/notation.classes.test.ts` (the review's failure classes over the whole course), `content/notation.taught.test.ts` (every "learn it" unit
writes or defines the notation), `content/notation.numbers.test.ts` (no typed digit on a card), `components/NotationKey.test.ts`,
`e2e/notation.spec.ts` (hover, pin, tap at 375 px, keyboard model, live region, Tab-stop count, toggle, tracks, link and return bar, print, CSP).

## Keyboard model (review #1-#3)

`ui/notationFocus.ts` (entry chunk) gathers formulas into reading groups, `NOTATION_GROUP`: `.story-beat`, `.static-beat`, `.review-card`,
`.challenge`, `.stage` (lecture, books, Try it, intuition and pitfalls, clues, Play), `.unit-head`, `.lecture-head`; the nearest ancestor
wins, and a formula outside every group is its own group. After a `Tex` renders marks, `rovingMarks` gives its group exactly one Tab stop
(`tabindex="0"` on the formula remembered in `data-nfocus`, else the first one on the page; the others `-1`). A formula that also holds
glossary term links keeps its own stop (`ui/Rich.tsx`). The lazy listener (`components/NotationRuntime.tsx`) walks `groupMarks` with the
arrows and calls `setStop` so the stop travels with the focus. L4 went from one stop per formula (282) to 83 stops for 246 formulas in
86 groups (the e2e test counts them: `e2e/notation.spec.ts`).

## Known limits

- A chapter still has one Tab stop per reading group (L4: 83). The toggle is the off switch; the chapter's notation list is the other
  keyboard-friendly path.
- Heuristics, not parsing: a bar pair is an absolute value only when nothing relational sits between the bars, `[A, B]` is a
  commutator only when both sides look like operators, bare gate letters need a gate-like formula.
- Chapter-specific symbols (ρ, η₁, θ, c …) are a later phase (decision #3). So are S_x, S_y, S_z, ΔA, R_n, ×, ≠, ≤, ≥, bold-face vectors
  (`\mathbf r`, `\boldsymbol\sigma`) and `\binom` columns (review #22, deferred).
- A mark's dotted underline is a `border-bottom` on an inline span; around tall content (a display Σ with limits, a pmatrix) it may need
  a look in the visual QA (review #24, deferred).
