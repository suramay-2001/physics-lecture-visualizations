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
