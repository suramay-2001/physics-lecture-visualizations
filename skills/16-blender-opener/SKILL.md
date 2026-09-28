---
name: 16-blender-opener
description: Build a Blender chapter opener (or hardware asset) rendered from engine-generated JSON — Blender draws geometry only and never computes physics. Trigger when a Part plan's Media section names a Blender opener or a lab bench needs a hardware GLB.
---

# Blender opener — engine data to rendered frames

Reference: `skills/course-builder/references/media.md`; pipeline: `pipeline/blender/{common.py,
gen_opener_data.ts,opener_*.py,lab_assets.py,render_openers.sh}`; house rule: `CLAUDE.md` "Blender draws engine
data only; it never computes physics."

## When to use
A Part's identity design calls for a descending/looping opener film (e.g. a per-Part opener), or a lab bench
needs precise hardware geometry (a GLB) beyond what procedural fallback code draws.

## Inputs
- The engine module that computes the geometry driving the opener (a Hopf fibration, a belt-trick homotopy, a
  cryostat descent path — whatever the Part's identity needs), already built and tested (`11-engine-module`).
- The Part's identity spec (colours, camera path, plate/stage boundaries) from the approved design doc
  (`docs/specs/design-cryostat-709.md` or the course's equivalent).

## Steps
1. Write a **TS generator** (run with Node's native TS type-stripping) that imports the engine module and writes
   plain JSON — the generator is the only place engine math touches this pipeline; the JSON and any `.blend`
   files are build products, git-ignored, never the source of truth.
2. Write the Python script(s) that read that JSON and build the scene in Blender's own `common.scene` (never the
   user's scene or preferences) — camera, lighting, materials are all Blender's job; every position, angle or
   count comes from the JSON.
3. Headless render: `Blender -b --factory-startup --python-exit-code 1 -P script.py -- args`.
   `--factory-startup` keeps the user's own add-ons (e.g. an MCP server bound to a port) out of the process, and
   makes it safe to set Cycles GPU preferences (never persisted).
4. For a chapter-opener film: 120 frames at the course's chosen aspect, WebP q80, background exactly the stage
   colour (so camera rays composite correctly against the live stage), Cycles + denoise, and a poster frame
   chosen to carry the idea alone under reduced motion.
5. For lab hardware: export geometry only (no material — the app owns every material so no reserved colour ships
   inside a file), in the app's own axes convention, with **no compression that needs wasm** (the CSP has no
   `'wasm-unsafe-eval'`, so meshopt/Draco are unusable — keep GLBs uncompressed).
6. Run `sh pipeline/blender/render_openers.sh [id]` for a full render pass (expect tens of minutes per opener on
   a modern Mac with Metal).
7. Wire the frames into `openers/OpenerScrub.tsx` (2D canvas player, ≤ 9 decoded bitmaps, coarse-to-fine
   loading, the story's centre-line scroll mapping, poster under reduced motion or narrow screens).

## Gates
- A test audits the GLB (parts present, triangle/size budget, no disallowed extensions, no embedded local paths
  or URIs).
- Frame-size budget met (track an average KB/frame budget per opener; enforce it, don't eyeball it).
- Opener captions carry every claim the frames might suggest, and those captions are tested — the frames
  themselves state nothing (physics visuals that make a claim must be computed live in code, not implied by a
  rendered clip).
- Reduced motion fetches 0 frames (poster only); the live player never exceeds its decoded-bitmap budget.

## Outputs
- `pipeline/blender/<opener>.py` + its generator; rendered frames under `app/public/openers/<id>/`.
- For hardware: a `.glb` under `app/public/models/` and its loader wiring.

## Pitfalls
- Precise physics geometry (pole profiles, exact field shapes) belongs in code, not in hand-modelled Blender
  geometry — model only what is genuinely decorative/structural.
- Node's type-stripping generator needs erasable syntax (no `enum`, no experimental decorators) and explicit
  `.ts` import extensions; `pipeline/blender/package.json` needs `"type": "module"` to silence a stray warning.
- A camera or ring radius chosen from the spec sheet without checking it against the actual rendered geometry can
  clip through content that reaches further than expected — verify radii against the engine's own extents, not
  the spec's assumed range.

## Next
Wire the opener into a chapter's `Unit.opener` or a Part's landing page; `09-visual-qa` to confirm it plays.
