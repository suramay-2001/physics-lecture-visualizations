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
| D1 | 2026-09-25 | D | `stage/hooks.ts` `useDomLabels` (behaviour) | The collision-avoiding label layout (D §6.1: reserved zones, candidate offsets, leaders, gizmo) lives in D's `stage/scenes/labels.ts` as `useSceneLabels(items, root, extraReserved)`; D's scenes call it instead of `useDomLabels`. Same data path (`useStageLabels` → `stage.dom` → transforms at priority 500). It writes `data-hidden`, `data-leader`, `data-focus`, `data-look`, `data-label-name` and the CSS vars `--lead-len/-start/-ang` on label nodes. W may fold it into `useDomLabels` later without touching any scene. | `hooks.ts` is frozen and W1-owned; the gate defect needs the pass now. | pending |
| D2 | 2026-09-25 | D | `stage/overlay.css` load point | `overlay.css` is imported by `stage/tokens.ts` (so it loads with every stage box); W may move the import next to `story.css` in `main.tsx`. Its rules are scoped under `.stage-overlay` / `.stage-drawer` so load order does not matter. | D owns neither `main.tsx` nor `story.css`. | pending |
| D3 | 2026-09-25 | D | `app.css` `.stage-label` (v1) vs overlay `.stage-label` | Class-name collision: app.css's v1 unit heading (uppercase, 2 px ink underline, margin) leaks into every overlay label. overlay.css resets it (`.stage-overlay .stage-label { border: 0; margin: 0; text-transform: none }`); W should rename the v1 class (e.g. `.unit-stage-heading`). | Found while measuring the Workbench; W owns app.css and the overlay component. | pending |
| D4 | 2026-09-25 | D | `stage/types.ts` `ResolvedLab` (additive, optional) | Engine numbers the lab draws but the resolver does not give: `sigmaBand?: number` (l1-average:b4, √(var/N)), `tallies?: { true: number; false: number }[]` per bench (l1-logic truth table / tally bars), and optionally `centroid?: number` (today drawn as (plus − minus)/(plus + minus) from `theory`). | Scenes must not compute physics; without these the σ band and truth tallies are not drawn (scene spec §7). | pending |
| D5 | 2026-09-25 | D | `content/stage.ts` `LabState` (additive, optional) | `beamTo?: 'gap' \| 'plate'` for l1-quantized:b1 ("atoms stream into the gap"). Today D infers it with a "spoiler rule" (a lab beat followed by a `model: 'classical'` beat stops the beam at the magnet exit). | Makes the choreography explicit instead of inferred. | pending |
| D6 | 2026-09-25 | D | W1 overlay / drawer markup | overlay.css styles: passport `[data-slot]` (split panes + inset = title-only strips; the inset strip grows left), `[aria-expanded]` → ⓘ glyph, `[data-relevant='1']` → 6 px dot; drawer `.stage-drawer` with `h3`/`[data-group-title]`, `ul/li`, `[data-relevant='1']`. W1's StageOverlay/FidelityDrawer should emit these hooks. | D §2.2–2.4 visuals without owning the components. | pending |
| D7 | 2026-09-25 | D | `window.__stageD` (DEV / `?measure`) | D's measurement hooks (`bench`, `contrast`, `overlaps`, `audit`, `render`, `views`) mounted by the scenes until W1 ports the gate's `bench`/`contrastAll` into `window.__stage`. | Self-check numbers for this round. | pending |
