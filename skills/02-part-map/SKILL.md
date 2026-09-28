---
name: 02-part-map
description: Plan one Part's chapters from the course's semester map — chapter list, dependency graph, ownership and bridge rulings, engine/stage-kind unions, and errata review. Trigger when starting a new Part of a course or when the semester map needs re-ordering after new notes arrive.
---

# Part map — plan a Part's chapters

Worked example: `docs/roles/proposals/P-709-map.md` (33 chapters across 11 Parts) and its ruling
`docs/roles/decisions/qc709-map.md`.

## When to use
Before any chapter in a Part is planned in detail (`03-chapter-plan`). Also re-run (partially) when new lecture
notes arrive and the pace or chapter boundaries shift.

## Inputs
- Ingested sources for the Part (`01-course-ingest`), including every book chapter the Part draws on.
- The existing map, if one exists, and any chapters already built.
- The other course's map, to plan bridges (a concept the first course already teaches should be bridged, not
  re-taught).

## Steps
1. **Read every source page for the Part**, not just the table of contents; note errata as you go
   (`P-709-map.md` (d): tag each `img` — checked on the rendered page — vs `txt` — text-layer only, needs a
   page check — vs `math` — the derivation itself shows the problem — and mark any you are not sure of
   **unsure**, to stay out of chapters until re-checked).
2. **List chapters** for the Part: id, title, driving question, sources, and the other course's units it could
   bridge to (`P-709-map.md` §1–§12 format).
3. **Draw the dependency graph** ("A → B" reads "B needs A") for the whole Part, so build order is provable, not
   guessed.
4. **List the engine-function and stage-kind unions** the Part's chapters will need in total ((b) and (c) in the
   map). This tells `00-course-pipeline` step 3 which `11-engine-module` / `10-stage-kind` work must land before
   the first chapter that needs it.
5. **Rule on ownership**: a concept is introduced once, in the first chapter whose sources teach it; a later
   chapter that repeats it keeps a unit but opens with one link-back beat and teaches only what its own sources
   add. Write this down per concept, not left to each chapter planner's judgment later.
6. **Rule on bridges**: which concepts the *other* course already teaches (bridge, do not re-teach), and which
   belong to a not-yet-built chapter of *this* course (write the reference in words — "Chapter F2 builds
   this" — never as a live `<<…>>` link, since the bridge test fails on an unresolved target).
7. Take real conflicts to the user (e.g. Bell-state naming convention, which level is |0⟩) — see
   `qc709-map.md` for the pattern of one-line rulings with a one-sentence "why".

## Gates
- Every chapter in the Part has a source, a driving question, and a place in the dependency graph before any
  `03-chapter-plan` starts.
- Every ownership and bridge question the map raises is *ruled*, not left open, before build agents start (an
  unruled ownership question causes duplicate teaching that a later review must catch and undo).
- Errata marked **unsure** are excluded from chapter content until re-checked on the page.

## Outputs
- `docs/roles/proposals/P-<part>-map.md` (or an addition to the whole-course map).
- `docs/roles/decisions/<part>-map.md`: the judge's rulings, one row per question, with a reason.
- A build order for the Part's chapters (which 2–3 build in parallel first).

## Pitfalls
- An e-book's printed-page offset is not always constant across a book (see `01-course-ingest`); the map is the
  right place to record a per-chapter offset table once, rather than rediscovering it per chapter.
- A chapter map question answered by guessing "what the user probably wants" instead of asking wastes a full
  chapter build; `qc709-pilots.md`'s amendment ("ask the user whether the assignment is still open") is the
  standing rule for any future homework/proof overlap.
- Don't re-derive a ruling already in `docs/roles/decisions/`; read it before asking the user again.

## Next
`03-chapter-plan` for the first 2–3 chapters in the Part's build order.
