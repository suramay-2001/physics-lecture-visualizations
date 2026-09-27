# Story navigation (Phase 4a pattern; every lecture gets it from the templates)

Signature: **the beamline** — the course is a line of stations (lectures), each lecture a line of units, the
reader is the atom travelling it. Silver structure only; physics colours stay reserved.

- **Topbar**: Lectures ▾ (course beamline panel: every lecture and unit), Arcade, Concept map, Formula sheet,
  Help, **Motion on/off** (reader choice > OS; `?motion=reduce` wins for tests; stored per viewer, guarded).
- **Lecture opener**: eyebrow, title words rising once, counted stats "5 units · 31 beats · 14 challenges"
  (counted, never estimated), Story / Read toggle.
- **Route rail** (sticky left): stations = units; a silver atom at the viewport centre line; stations keep fixed
  spacing (the atom must never move back while the reader moves forward — test it over many scroll positions);
  the gap between stations is split by the unit's steps; "In 1.x" step list with the current step lit;
  `[` / `]` jump units (at a unit's start `[` goes back one), announced politely.
- **Chapter card** per unit: "02 / 05", unit index, title, question, step strip = the unit's own order made
  visible (Story · Try it · Intuition · Pitfalls · Takeaway · Play). Anchors `unitId--step`.
- **End of lecture = fork**: next lecture (or "in preparation", never a dead link), Arcade games that train it,
  its formula board, its line on the concept map, previous lecture.
- **Read mode**: the static reading column on any screen; the live/static decision lives in one hook so every
  consumer agrees; the reading position is kept across the swap.
- **Arcade**: games grouped by the lecture they train; each level names its chapter; verdicts from the engine;
  levels solvable and not pre-solved (tests), pars minimal (search), corrections equal the engine's number.
- **Concept map**: concepts per lecture with `needs`; built ones link to chapters; tests: no cycle, nothing
  builds on a later lecture, every built unit on the map; relations drawn AND said in words on focus.
- **Closed motion list** (nothing else moves): title word rise, rail atom, chapter-card settle, stage beat
  transitions, scroll-scrubbed opener films, page fade. Reduced motion: cuts and posters. Never: scroll-jacking,
  custom cursor, parallax on prose, looping idle motion outside the home hero.
