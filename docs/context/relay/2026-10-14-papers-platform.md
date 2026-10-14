# 2026-10-14 Papers platform

Third course `papers` (`#/papers`): shelf, chapter route (shared `LecturePage`), References-used page, prerequisite map, lazy pack. A paper lecture is a data-only `PaperSpec` (`app/src/papers/spec.ts`) checked by `validatePaperSpec` and compiled by `compilePaper` into an ordinary `Lecture`. Pictures and computed claims come from the allow-listed recipe registry (`papers/recipes.ts`: `bell-amplitudes`, `grover-plane`, `circuit-gates` so far); the paper's own numbers are `reported` claims; steps carry `trail` entries. Placeholder `P1` exercises everything. Chunk rule (q) in `build/chunks.test.ts`.
Gotchas: spec files hold literals only (AST gate); cite papers by short title; ids `P1/B1`, `p1-...`, `pp-...`, keys `p1Name`. Card: `cards/papers-platform.md`.
