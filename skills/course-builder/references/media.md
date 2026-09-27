# Media: Blender and generated assets

- **Blender draws engine data, never computes physics.** A TS generator (run with Node type stripping) writes
  JSON from the engine; Python scripts read it. The JSON and `.blend` files are build products (git-ignored);
  the scripts are the source of truth.
- Headless renders: `Blender -b --factory-startup --python-exit-code 1 -P script.py -- args` (keeps the user's
  add-ons, e.g. an MCP server, out; safe to set GPU prefs). Look-dev in the GUI only in the script's own scene.
- Chapter-opener films: 120 frames, 1080 × 1350 WebP q80 (≤ 70 KB/frame avg), Standard view transform,
  background exactly the stage colour for camera rays, Cycles + denoise; a poster frame chosen to carry the
  idea alone. Player: 2D canvas, ≤ 9 decoded bitmaps, coarse-to-fine loading, the story's centre-line mapping,
  poster under reduced motion / narrow screens; captions carry every claim (tested).
- Lab/apparatus GLB: geometry only (the app owns every material so no reserved colour arrives in a file),
  exported in the app's axes, no compression that needs wasm under the CSP, a test auditing parts, envelopes,
  budgets, extensions, URIs and local paths. Precise physics geometry (e.g. pole profiles) stays in code.
- Generated media (Higgsfield etc.) is decoration only, never states a result, and spending credits needs the
  user's go-ahead. Connectors that need OAuth (Canva) wait for the user.
