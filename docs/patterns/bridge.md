# Pattern: a bridge (with return)

Real example, `app/src/content/qc709/bridges.ts`:

```ts
import type { BridgeTarget } from '../bridgeRegistry'

export const BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  'qc-l2-complex': {
    course: 'sl448',
    lecture: 'L2',
    unit: 'l2-complex',
    label: 'complex numbers as turns in the plane',
  },
  // ...
}
```

And the prose that uses it, `F1.story.ts` (`f1-number-line:b4`, Ground-up text):

```ts
text: `Look for a number whose square is $-1$, and call it [[qc-imaginary-unit|$i$]]. ` +
  `Multiplying by $i$ twice must equal one half turn. So multiplying by $i$ is a quarter turn... ` +
  `Spin Lab tells the same story: <<l2-complex|Spin Lab 2.3 Numbers that turn>>.`,
```

## The three pieces

1. **`<<id|shown text>>`** in prose — `id` is the *target unit's own id* (here `l2-complex`, the 448 unit id,
   not the `qc-` bridges-table key — the table is keyed by the id used inside chapters that reference it via a
   gloss's `bridge` field, while inline `<<…>>` refs use the target unit id directly). Rendered as
   `.bridge`/`.bridge-shown` (a swatch of the target course's own chrome and typeface, e.g. "↑ Spin Lab 2.3" —
   `chapter709.css` `.bridge-chip`).
2. **`BRIDGES` registry** (`bridges.ts`) — every id a chapter or a gloss entry's `bridge:` field uses must have
   an entry here; `bridges.test.ts` fails on an id that's used but missing, a target that doesn't resolve in its
   own course, or an entry that's present but never referenced (dead weight).
3. **The return trip** (`components/BridgeLink.tsx`, `ui/returnParam.ts`, `components/ReturnBar.tsx`):
   - Before leaving: `probeReadingPosition()` then `history.replaceState` the *current* 709 URL with
     `?at=<beat>&f=<frac>` (so the browser's own Back button also works).
   - The link itself pushes the target URL with
     `?ret=qc709~Q3~q3-bell:b4~0.42~formal#<anchor>` — ids and numbers only, **never a URL**, so it cannot be an
     open-redirect vector; `returnParam.ts` parses every field and validates each id against the live registries,
     returning `null` on anything hostile, oversized or unrecognized.
   - On the 448 page, `ReturnBar` renders a sticky `<nav aria-label="Return to Physics 709">`, survives reload, a
     new tab, and a chain of bridges (the `ret` param is carried forward through each hop).
   - On return, the reading position is restored (`restoreReadingPosition`, which waits for the story's first
     refresh via `onStoryRefreshed`) and focus moves to the beat.

## Rules

- **A bridge only ever targets an already-built unit.** A reference to a chapter not yet written is prose in
  words ("Chapter F2 builds this"), never `<<…>>`.
- **Ownership, not re-teaching**: bridge to a concept the target course already teaches well; don't re-derive it
  at length in the new chapter.
- A gloss entry may carry `bridge: '<id>'` to offer the same trip from its term popover ("Learn it in Spin Lab
  2.3") instead of (or in addition to) an inline `<<…>>` in prose.

## Spin Lab → 709: "Go further in 709" (W-448 #4)

The same trip in the other direction, for a 448 lecture that wants to point at a 709 unit. Optional reading, never part of
the notes' line; the chip says so ("↓ Go further in 709 · Chapter Q14", navy and gilt like the fridge, `styles/bridge.css`).

1. **Table**: `app/src/content/bridges448.ts` `BRIDGES_448`, ids `sl-` + the target unit id (`sl-q14-min-error`,
   `BRIDGE_ID_448`), `course: 'qc709'`, `lecture` the 709 chapter, `unit` its unit id, optional `beat`, a `label` of 1-80
   characters. `courseOfId` sends `sl-` to 448 and `qc-` to 709, so the two tables never collide.
2. **Prose**: `<<sl-q14-min-error|the shown words>>` in a beat (or `bridge: 'sl-…'` on a gloss entry).
3. **Registration**: the lecture's own file (`content/L8.ts`) does `import './bridges448'`, so the table registers when
   the LECTURE'S chunk loads, never in the entry. `bridges448.test.tsx` scans every `L*.ts` that uses a bridge for the
   import, resolves every entry to a WRITTEN 709 chapter / unit / beat, and fails on an unused entry.
4. **Return**: `?ret=sl448~L8~l8-attack:b2~0.42~ground#q14-min-error` (`ui/returnParam.ts` now takes either course, each
   field against its own course's pattern and tracks; 448 has only `ground`). `ReturnBar` shows Spin Lab's bar on the 709
   page ("↑ Return to Spin Lab · Lecture 8 · …, step 2": the glass plate with an amber edge, `data-to='sl448'`), and
   Return puts the same 448 beat under the centre line with focus on it. A chain carries the original `ret` forward.
5. **Testing before a real chip exists**: `content/__fixtures__/devBridge448.ts` adds a temporary chip to Lecture 5 in DEV
   when the page sets `window.__devChip448` (e2e/bridge.spec.ts does); delete it when Lecture 8 lands a real chip.

Only a 709 unit that is already WRITTEN can be a target (a chip to an unwritten chapter is prose in words).
