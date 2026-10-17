# The context bus

A small, always-current set of short files that every agent reads INSTEAD of exploring the codebase. A chapter build should need about ten setup steps
and a small context, not forty exploratory reads. The bus is plain Markdown: nothing in it runs in the app.

```
docs/context/
  README.md          this file
  conventions.md     how to build a chapter end to end (709 chapters, Papers chapters and 709 lecture notes): files, minimal forms, house rules, commands, agent hygiene
  cards/*.md         one subsystem each, <= ~1.5k tokens: API surface, file paths, gotchas
                     qec-engine  qc-engine  stage-kinds  papers-platform  notes-platform  content-model  bridges-notation  tests-and-gate  pipeline
  relay/             one note per finished task: YYYY-MM-DD-<task>.md, <= 120 words
  generated/         (untracked) ids.json and packs/<ID>.md, built by the command below
pipeline/context/build_context.mjs    the generator
```

## Reading order for an agent

1. This README.
2. `generated/packs/<ID>.md` for your chapter: it already contains the conventions, the judge's rulings, the plan, the cards the plan needs, the ids the plan names
   and the newest relay notes. If your pack is missing, ask the orchestrator to run the command below, or read `conventions.md` yourself, then your plan and rulings,
   then only the cards `conventions.md` points to for your task.
3. Open a card that is NOT in your pack only when your task touches that subsystem. Read a source file only to change it.
4. `generated/ids.json` answers "does this unit, glossary id, bridge, recipe, stage kind or claim key exist?" without searching (`node -e` or `grep` it; do not print it).

## Build the packs (the judge, before launching builds)

```sh
node pipeline/context/build_context.mjs Q21 Q22 B1 B2 B3 B4 P1     # < 1 s, no network, deterministic
```

It writes `docs/context/generated/` (in `.gitignore`) and prints, per pack, its size in tokens (chars / 4) and every item the plan names that does not exist yet.
Exit status 1 means a plan names a unit id, beat, recipe or stage/widget kind that is not in the code (a prerequisite to build first, or a name to fix in the plan).
A ruling that a build creates an item itself is recorded in `WAIVED` at the top of the script so the waiver stays visible. `--verbose` also prints notes (unknown gloss and bridge ids).

## Freshness rules

1. **Generated parts are rebuilt by one command** (above): `ids.json` and the packs are never edited by hand and never committed. Rebuild after any change to a plan, ruling, card, relay note or the code.
2. **Whoever changes a subsystem's API updates that subsystem's card in the same commit** (new export, renamed field, new recipe or kind, changed limit). A card that disagrees with the code is a bug: fix the card.
3. **Every finished task adds a relay note** `relay/YYYY-MM-DD-<task>.md` (<= 120 words: what changed, new APIs, gotchas, files). Packs carry the newest eight.
4. Conventions change only with a ruling; say which in the commit.

## What is deliberately not here

No source text from `sources/` (copyrighted; the repo is public), no local paths, no per-chapter story content. History and decisions stay in `BUILD-LOG.md` and `docs/roles/`;
the long specs stay in `docs/specs/` and `docs/patterns/`. The bus points at them and says only what an agent needs to act.
