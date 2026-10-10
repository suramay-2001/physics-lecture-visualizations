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
| keyboard | a formula with marks is a tab stop; focus shows the card of its first mark; arrows move between its marks; Enter or Space pins and moves into the card's link; Esc closes and returns to the formula; leaving the formula closes the card |
| screen reader | the focused formula's `aria-describedby` points at the open card, which is plain text; KaTeX's own MathML is untouched |
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
3. if the formula should be reachable by keyboard it already is (any formula with a mark); if it is school maths, add it to the
   `plain` set of the Formal-voice test.

Notation no built chapter teaches has no `taught`: ≈, ∝, ⇒, ⇔, ±, ·, √, ∂ are school maths; `mod`, `gcd` and `⌊ ⌋` wait for
chapter F8 ("Hidden rhythms": `f8-clock`, `f8-euclid`, `f8-roots`). **When F8 merges, give those three entries
`taught: { qc709: 'f8-clock' | 'f8-euclid' | 'f8-roots' }`** (the test then checks the ids exist).

## Chunks and tests

Entry chunk (budgeted): the pref, the toggle, the mount point, the vocabulary of a mark (`ui/notationKeys.ts`), the trust check,
the `Tex` changes and `Popover`. Lazy (rule (n) of `build/chunks.test.ts`): the pre-processor, the listener, the card, the key, the
dictionary. Tests: `ui/notationMark.test.ts` (rules, context, line breaking, trust), `ui/notationMark.corpus.test.ts` (every TeX span
of both courses renders with marks identically to without, apart from the wrappers and the lost line-break opportunities inside a
mark), `content/notation.test.ts` and `content/notation.context.test.ts` (dictionary, context sentences end to end),
`e2e/notation.spec.ts` (hover, pin, tap at 375 px, keyboard, toggle, tracks, link and return bar, print, CSP).

## Known limits

- Every formula with a mark is a tab stop (the toggle is the off switch; the chapter's notation list is the keyboard-friendly path).
- Heuristics, not parsing: a bar pair is an absolute value only when nothing relational sits between the bars, `[A, B]` is a
  commutator only when both sides look like operators, bare gate letters need a gate-like formula.
- Chapter-specific symbols (ρ, η₁, θ, c …) are a later phase (decision #3).
