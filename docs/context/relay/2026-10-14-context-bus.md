# 2026-10-14 the context bus

`docs/context/` (README, conventions, 8 cards, relay notes) plus `pipeline/context/build_context.mjs`, which writes the untracked `docs/context/generated/` (`ids.json`, `packs/<ID>.md`) and exits 1 when a plan names a unit, beat, recipe or kind that does not exist. Run `node pipeline/context/build_context.mjs Q21 Q22 B1 B2 B3 B4 P1` before launching builds; an agent reads its pack instead of exploring.
Gotchas: regenerate packs after any card, plan, ruling or relay change; `WAIVED` in the script records items a ruling says a build creates; a changed subsystem API means a card edit in the same commit.
