# Interface changes after `l1-freeze`

Frozen at the tag (W-L1 §7.1, decision #16): everything exported from `app/src/content/stage.ts`,
`content/schema.ts`, `content/walk.ts`, `stage/types.ts`, `stage/hooks.ts`, `stage/store.ts`, `ui/tex.ts`,
and the `physics/*` signatures of W-L1 §3.

- Additive, optional fields go through W (no note needed beyond the commit message).
- Anything else is an interface change: the requesting role adds an entry below, Claude judges, W applies
  it on `main`, and the other worktrees rebase.
- D's `content/stageVocab.ts` may grow at will; removing or renaming a name is a change.

| # | date | role | file / export | change requested | why | decision |
|---|---|---|---|---|---|---|
| 1 | 2026-09-25 | P | `content/walk.ts` `texSymbols` (behaviour, not signature) | Fix catastrophic backtracking in its bra-ket regex `\\langle([^\|\\]*(?:\\[a-zA-Z]+[^\|\\]*)*)\|…`. On an average with no bar and several control words, e.g. `\langle\sigma_n\rangle = \hat n\cdot\hat m = \cos\theta`, the nested `[a-zA-Z]+[^\|\\]*` quantifiers split letters exponentially: a vitest run over L1 hung > 120 s. Suggested: make the control word atomic, e.g. `\\langle((?:[^\|\\]\|\\[a-zA-Z]+(?![a-zA-Z]))*)\|`. | P's `symbols.test.ts` works around it (takes ⟨…⟩, kets and bras out before calling `texSymbols`), so nothing is blocked; any other caller of `texSymbols` on real text would hang. | pending |
| 2 | 2026-09-25 | P | `content/stage.ts` `LabBench` (additive, optional) | `fires?: boolean` per bench (default true), so `l1-logic:b2` fires only the z-first bench and `b3` only the x-first bench (D §4.4 "top bench fires" / "bottom bench fires"). Today `flow` is per stage, so both benches stream in b2 and b3. | D's one-change-per-beat rule for the logic unit. The story is valid without it; with it, b2 sets `fires: false` on bench B and b3 on bench A. | pending |
