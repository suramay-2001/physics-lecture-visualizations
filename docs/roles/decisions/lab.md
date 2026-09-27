# Judge decisions — the Babylon `/lab` (2026-09-27)

Inputs: `proposals/D-lab.md` (experience), `proposals/W-lab.md` (architecture), `audits/S-lab-threats.md` (threats).
Nothing is installed or built yet. The user answered the two open questions on 2026-09-27 (end of file); everything else is ruled here.

## Rulings

| # | Ruling | Why |
|---|---|---|
| 1 | Babylon scenes are **right-handed** (`scene.useRightHandedSystem = true`) and use the lecture scenes' physics→render axis map; a test checks that R_z(+90°) takes \|+x⟩ to the +y label and that +y sits where the r3f Bloch scene puts it. | D and W both found it: Babylon's left-handed default mirrors the sphere, flips +i/−i and turns R_z backwards. |
| 2 | **Babylon GUI draws affordances only** (handles, rings, ticks, ± pads). Every word and number is DOM, and every in-scene control has a DOM twin (keyboard, screen reader). The DOM panel is the source of truth. | D §2, W §4; the lectures' rule that numbers come from the engine and live in the DOM. |
| 3 | Benches, built in this order: **Operator Lab** (operator space + Bloch sphere, linked cameras), **Grapher**, **SG bench** (`lab.glb`), **Bloch ball**. Each ships with passport, fidelity note, engine-only readouts, one "try this" prompt and a P truth review. | W's order (the Operator Lab reuses the most engine code); D's four benches. |
| 4 | SG magnets turn **only about the beam** (a real magnet); a \|±y⟩ source is a sealed "prepared elsewhere" box. | Physics: no engine change for a device that cannot exist (D Q1). |
| 5 | Engine additions, each with a numpy fixture: `unitaryAction(A, τ)` (axis, angle 2\|a⃗\|τ, phase −a₀τ), `uncertaintyFromBloch(r)` (mixed states), and in `expr.ts` asin/acos/atan/sinh/cosh/tanh, a parametric sampler and range validation (finite, ordered, capped), with fuzz tests. Only finite values ever reach a vertex buffer. | D §2.2–2.3, S §5. |
| 6 | The lecture canvas (`StageHost`) stays mounted but draws **0 frames** on `/lab`; Babylon holds a second WebGL context only while `/lab` is open and releases it on leaving (`loseContextOnDispose`); a fresh `<canvas>` per mount (StrictMode). Measured in e2e: live contexts 2 on `/lab`, 1 after. | W §2 (sharing one context rejected). |
| 7 | Deep links carry **allowlisted preset ids** only (`#/lab/sg?preset=l1-zxz`), never free state. | D §1; nothing untrusted in the URL. |
| 8 | Chunk contract rewritten: Babylon reachable only behind the lab's dynamic imports, nothing Babylon in the entry closure or any lecture chunk; remote-origin bans stay **absolute** for entry and lecture chunks and are scoped, not allowlisted, for lab chunks; a scan of every bundled third-party module for eval/`Function`/remote-URL sinks with a per-module allowlist; a runtime tripwire rejects cross-origin `Tools.LoadScript`/`LoadFile`. | S MUST 2–4; W §5. |
| 9 | CSP: never `'unsafe-eval'` or `'wasm-unsafe-eval'`; fetch directives stay `'self'`; Babylon's CDN defaults (environment helpers, loading screen, decoders, default font) are never called — base URLs point at a dead local path. | S MUST 1; W §3. |
| 10 | Exact version pins (one Babylon version for every `@babylonjs/*`), license and install-script checks, `npm audit` 0. | S MUST 6 (all Apache-2.0 / MIT; no install scripts found). |
| 11 | **G-lab gate first** (throwaway worktree, ≈ 2 h): chunk bytes, the CSP with a Babylon scene, contexts, handedness, GUI frame cost, and the chosen sandbox option. Kill or reshape before building. | W §7; the Phase-0 habit. |
| 12 | Entry points (topbar "Lab", lecture-fork "Take it to the lab", per-unit "Open in the lab") land **after** the S audit of the built lab; the route works by URL before that. | W Q5, D Q5. |
| 13 | Rendering is on demand and follows the Motion toggle and `prefers-reduced-motion`; < 900 px never downloads Babylon (2D widgets instead). | W §2, D §4. |

## For the user

**Q1 — the student sandbox.** The plan locked "Babylon Inspector as a student sandbox". The audits found the current
Inspector (v2, 9.28.0) is much heavier than planned: ≈ 470 MB of peer packages (Fluent UI, five editors), runtime
`<style>` injection our CSP blocks, a number field that falls back to `Function(...)` on typed text (blocked by our CSP,
live wherever the CSP is missing), a GIF tool that fetches a worker from jsDelivr, file imports (a sharing path), and
off-site links. Options:
- (a) **Recommended:** our own "Under the hood" panel for students, built on `@babylonjs/core` only: the bench's scene
  tree, which objects the engine owns (⚙, read-only) and which are decoration, safe toggles (hide, wireframe, recolour,
  light), triangle and frame counts. No Inspector in the app at all.
- (b) The real Inspector for students, in its own same-origin window with its own CSP (inline styles there only),
  editors stubbed, imports and tools off. Keeps the real tool; costs the install, a multi-MB chunk and ~10 controls.
- (c) The real Inspector in the page, with inline styles allowed on every route.

**Q2 — typed matrices in the Operator Lab.** It computes eigenvalues, eigenvectors and exponentials of any typed 2×2,
so it can finish assigned homework (e.g. the S_y eigenproblem, L5 p.1), which the course gives hints only.
- (a) **Recommended:** results appear at once, with an optional "Predict first" switch.
- (b) For typed matrices, the student commits a prediction before results appear; presets and dragging stay instant.
- (c) No typed matrices: presets and dragging only.

## User answers (2026-09-27)
- **Q1 → (a):** students get our own "Under the hood" panel on `@babylonjs/core`; the Babylon Inspector is **not** added
  to the app (not even as a dependency). This supersedes the locked "Babylon Inspector as a student sandbox".
  S's Inspector controls (window/CSP option, editor stubs, file intake, GIF worker, off-site links) are moot; the
  panel's own controls: read-only ⚙ engine objects, no file intake, no network, no downloads.
- **Q2 → (a):** typed-matrix results appear at once, with an optional "Predict first" switch.
