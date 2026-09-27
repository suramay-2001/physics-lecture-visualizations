# Phase 3 — Blender assets: judge rulings

Claude as orchestrator/judge, roles run directly (user decision after the subagent stalls). Source spec:
`docs/roles/proposals/D-L1-scenes.md` §5. Each ruling says what changed from the spec and why.

| # | Ruling | Why |
|---|---|---|
| 1 | **No meshopt / Draco / any wasm decoder.** Lab GLBs ship uncompressed geometry (host gzip/brotli does the rest). | The CSP is `script-src 'self'` with no `'wasm-unsafe-eval'`; the meshopt decoder the spec named instantiates WebAssembly and would be blocked. Loosening the CSP for a few hundred KB is the wrong trade. |
| 2 | **Pole pieces stay procedural** (`stage/scenes/lab/geometry.ts`); Blender builds only the surrounding hardware (yoke with bolts, coils, axis mount, oven, slit bracket, plate frame and foot, beam stop, rail carriage). | The knife/groove profile is what the field streamlines and the flying atoms are drawn against, and it morphs to flat poles (uniform-field beat) with one morph target. Keeping it in code keeps it exact and testable. |
| 3 | GLBs are authored in **app units** (1 Blender unit = 1 u), in the module-local frame of `geometry.ts` (entrance at y = 0). No `scale = 100`, no metres. | The app has no metre anywhere; one frame convention means no transform to get wrong. |
| 4 | **Blender computes no physics.** Openers draw JSON written by `pipeline/blender/gen_opener_data.ts` from `app/src/openers/openerData.ts` (engine: `physics/hopf.ts`, `physics/belt.ts`). The JSON and any `.blend` are git-ignored build products; the scripts are the source of truth. | CLAUDE.md: physics visuals are computed in code. A `.blend` can also carry absolute local paths (PII rule). |
| 5 | Belt-trick homotopy: `R_u(s) = Rot_n(u)(2πs) · Rot_z(2πs)`, `n(u) = (sin πu, 0, cos πu)`, frames as unit quaternions (= SU(2)). Belt path = frame tangent integrated with slack 2, then sheared so the block end stays put. | Starts exactly at the 720° twist as SU(2) elements, keeps both ends at +1, ends flat (belt.test.ts). Slack 2 keeps the drawn tangent ≥ the gap, so no cusp and no collapsed width (tested). The drawn length is not constant — named in the fidelity note. |
| 6 | Hopf opener rings = D §3.5's (θ 30°/55°/80°/105°/130°), counts doubled to 128 (12/20/28/32/36). Colours from `hopfRampHex` (tokens.ts), which reproduces the tabled ramp within one step. | §5.3 said "5 rings, θ = 80° torus" while `hopf.ts` still has the gate rings (20°…120°); §3.5 is D's latest. |
| 7 | Hopf camera re-keyed: r 6.5 → 6.5 → 10 → 18 → 22 u (frames 0/29/59/89/119). | The spec's r 9 → 7 u puts the camera inside the θ = 130° fibers (they reach \|p\| = 4.5); its own "unit circle ≈ 22 % of stage width" needs r ≈ 18 u. First preview confirmed (camera inside the fibration). |
| 8 | Outer two rings leave out whole fibers whose base-point φ lies within ±0.95 / ±1.15 rad of φ = 0; no fiber is clipped. DOF f/2.8 (spec) instead of the f/1.2 tried first. | Nested tori are the point of the picture and the θ = 130° shell hid them. Four gap centres compared at frames 89/119; φ = 0 opens toward the camera in both. f/1.2 turned the foreground into haze. |
| 9 | Openers live in `app/src/openers/` (copy, data, player). The DOM captions carry every claim (tested in `openerCopy.test.ts`); frames carry none. Player = 2D canvas, story's centre-line mapping, ≤ 9 decoded bitmaps. Placement in the course: **the user's call** (preview at `#/dev/openers`, DEV-only). | Neither opener's subject is in L1 (L1's teaser is the Bloch ball). |
| 10 | Posters: Hopf frame 89 (all rings), belt frame 98 (the loop), not frame 60. | The poster is the whole story for reduced-motion and narrow screens; frame 60 of the Hopf film is a half-built torus. |
| 11 | Belt opener: ribbon half-width 0.08 u (spec 0.06), camera r 5 u (spec 6), belt metallic 0.15. | Twist readable at 1080 px; the subject filled a third of the frame at 6 u; at metallic 0.3 the flat belt reflected the dark sky and lost its front/back luminance. |

Render settings (all set by `pipeline/blender/common.py`): Cycles 128 samples + OIDN, filter 1.5 px, no motion
blur, Standard view transform, 1080 × 1350, WebP q80, dither 1.0, background exactly `#161d2c` for camera rays
(measured on a rendered frame: (23, 30, 43) vs (22, 29, 44), WebP chroma rounding), key/rim suns + sky/ground fill.
Headless runs use `--factory-startup` so the user's add-ons (the MCP server on :9876) and preferences stay out.
