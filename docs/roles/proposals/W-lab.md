# W — Babylon `/lab` architecture proposal (Web Developer)

Read-only, 2026-09-27. **[npm]** = `npm view`; **[src]** = read in Babylon/Griffel sources or docs on GitHub (nothing installed); **[U]** = unverified until G-lab (§7).

## 0. Facts that shape the design
- **F1** core, gui and inspector are all 9.28.0 [npm]. Inspector 9 is "Inspector v2" (Fluent UI): `ShowInspector(scene, { containerElement, layoutMode })` returns a token; v1 APIs go through a compatibility layer [src]. ⇒ Pin exact versions.
- **F2** The Inspector's non-optional peers are Fluent ×6, usehooks-ts, loaders/materials/serializers/addons and five editors [npm]. npm installs them: ≈ 0.5 GB unpacked. React 19 fits every range. ⇒ Bigger `npm audit` scope.
- **F3** The Inspector loads the editors lazily, e.g. `lazy(() => import("@babylonjs/node-editor"))` [src, partial]. ⇒ Vite would emit multi-MB editor chunks.
- **F4** Griffel (Fluent's CSS-in-JS) creates `<style>` elements in `targetDocument.head` [src]. ⇒ Our `style-src-elem 'self'` blocks them (§3).
- **F5** `Misc/tools` holds `_DefaultCdnUrl = "https://cdn.babylonjs.com"`; `Tools.ScriptBaseUrl`/`AssetBaseUrl` rewrite it. `DefaultLoadingScreen` injects a `<style>` [src]. ⇒ `cdn.security.test.ts` (that host banned in every built file) would fail.
- **F6** Engine options `loseContextOnDispose` (default false), `doNotHandleContextLost`, `audioEngine`. Core ships `*.pure` modules plus side-effect registration files [src]. ⇒ Missing registrations fail at runtime, not at build.

The real CSP (`app/build/csp.ts`) is stricter than quoted: `default-src 'none'`, `style-src-elem 'self'`, `connect-src 'self'`.

## 1. Packages and chunks
`dependencies`: `@babylonjs/core`, `@babylonjs/gui`, `@babylonjs/inspector`, pinned to exact `9.28.0`, plus `overrides` so every `@babylonjs/*` resolves to one version. Subpath imports only (`@babylonjs/core/Engines/engine`, `…/Culling/ray`, `@babylonjs/gui/2D/controls/slider`). A test bans the `core` and `gui` barrels.

Chunks (estimated raw / gzip [U]):
- **`LabPage`**, loaded by route `/lab`: DOM shell, adapters, 2D fallback; no Babylon or three. 40–70 KB / 15 KB.
- **`mountLab`**, loaded at ≥ 900 px with WebGL: core subset, GUI 2D, `lab/babylon/**`. 0.9–1.4 MB / 250–400 KB.
- **Babylon's lazy shader chunks**, on first material use: many × 2–30 KB.
- **`inspector`**, on the sandbox click: Inspector, Fluent, extra core/loaders. 2–3.5 MB / 0.6–1 MB.

Only `lab/sandbox/inspector.ts` imports `@babylonjs/inspector`, and only a click handler in `lab/sandbox/openSandbox.ts` runs `import('./inspector')`. A Vite `resolve.alias` maps the five editor packages to `lab/sandbox/editorStub.ts`, which exports the names the Inspector calls [U] and says "not available in Spin Lab". G-lab numbers become chunk-test budgets.

## 2. Module layout, data flow, lifecycle
```
app/src/lab/
  LabPage.tsx      route /lab/:bench?: tabs, passport, panel, readouts, fallback, sandbox toggle
  labStore.ts      external store {bench, params, lost, epoch, sandbox} + actions
  lossPolicy.ts    pure: a 2nd context loss within 60 s ⇒ static for the session
  useLabEngine.ts  fresh canvas + import('./babylon/mountLab') + dispose
  benches/{operator,grapher,sg}/model.ts   pure adapters: params → BenchView via app/src/physics
  benches/{operator,grapher,sg}/Panel.tsx  DOM controls; benches/registry.ts
  readouts/        format.ts (withHbar → "0.250 ħ", |x| < 0.005 → 0), Readouts.tsx
  babylon/         mountLab, engine, axes, loop, labels, gui, instrument (window.__lab), views/*
  sandbox/         openSandbox, inspector, editorStub
```
```ts
export interface LabHandle {
  update(view: BenchView): void
  setMotion(on: boolean): void
  onGui(cb: (a: LabAction) => void): () => void   // GUI knob → same labStore action as the DOM
  inspect(container: HTMLElement): Promise<() => void>
  dispose(): void
}
```
**Flow.** `params` → `model(params)` (memoised) → `handle.update(view)` and `<Readouts view/>`. The adapters call the tested engine:
- **Operator Lab:** `parseMatrix2`, `decomposeHermitian`, `classify`, `eigen2`, `expm2`, `evolve`, `blochVector`, `expectation`.
- **Grapher:** `parse(src, {mode:'real', vars:['x','y'], limits: LIMITS.grapher})`, `sampleGrid` (≤ 128²), `sampleCurve`.
- **SG bench:** `benchTheory`, `fireMany`, `rng`.

`lab/rules.test.ts` enforces the boundaries: `babylon/**` imports no value from `physics/` and formats no numbers; `benches/**` never imports `@babylonjs`.

**Lifecycle.** Each effect run of `useLabEngine`:
- creates a NEW `<canvas>`. After `loseContext()` the same canvas returns the dead context, so StrictMode's second mount would otherwise draw nothing.
- awaits `mountLab` behind an `aborted` flag; cleanup disposes and removes the canvas.
- creates the engine with `{ antialias: true, audioEngine: false, loseContextOnDispose: true, doNotHandleContextLost: true, adaptToDeviceRatio: true }` and DPR ≤ 2.
- sets `scene.useRightHandedSystem = true`; `axes.physToBabylon` must equal `physToThree`.

The render loop is on demand: it draws when dirty (update, pointer, resize) or while an animation runs. It reads `useStageFlag('motion')` from the three-free `stage/store.ts`, so the topbar toggle, `prefers-reduced-motion` and `?motion=reduce` turn animations into cuts, and an idle lab draws zero frames. On context loss our listener calls `preventDefault()` and the DOM fallback offers "Restart 3D". A restore bumps `epoch` and remounts; `lossPolicy` gives up after a second loss.

**StageHost.** `/lab` never calls `requestStageHost()`. A host mounted by an earlier lecture stays mounted, hidden with `frameloop='demand'`: it draws nothing, but its context stays alive. Babylon owns a second context only while `/lab` is mounted. Leaving releases it at once, so live contexts go 2 → 1 (or 1 → 0), and back on a lecture the host resumes without a remount.
Rejected: sharing one context (three and Babylon fight over GL state); tearing the host down (a forced loss trips `ContextGuard`).
`__stage.contextsLost` counts every canvas, so a lab visit adds 1 there.

**< 900 px or no WebGL.** `mountLab` is never imported, so no Babylon bytes are fetched. The page shows the three-free 2D widgets (`OperatorBuilder`, `OperatorAction`, `SGLab`) and an SVG curve for the grapher.

**Sandbox truth.** Inspector edits can move meshes away from the physics, so while it is open the passport reads "SANDBOX · edited scene", readouts say they come from the controls, and closing re-applies `view`.

## 3. CSP and third party
- **Core/GUI rendering and lazy shaders** need nothing extra.
- **Never used** (they need `<style>`, a CDN or WASM): the loading screen, `SceneLoader`, `createDefaultEnvironment`, `debugLayer`, snippet parsers, `Tools.LoadScript`, WebGPU, Draco/KTX2/Basis, Havok. `rules.test.ts` greps `src/lab/**` for each.
- **CDN strings (F5):** at mount, set `Tools.ScriptBaseUrl` and `AssetBaseUrl` to `./babylon-off/`, so any load fails closed. The cdn test allows those origins only in chunks behind `mountLab`/`inspector`, and Playwright proves 0 non-self requests. Needs S sign-off.
- **GUI fonts:** self-hosted; await `document.fonts.load` before the first draw. No GUI text input: cells and expressions are DOM inputs.
- **Inspector extras** (glTF validator, extension feed, capture) [U]: they fail closed under `connect-src`; G-lab lists which ones fire.

**Inspector styles (F4):**
- **A (preferred: app CSP unchanged).** The toggle opens a same-origin window, `lab-sandbox.html` (a second Vite input). It runs no script and carries its own meta CSP, identical except `style-src-elem 'self' 'unsafe-inline'`. We call `ShowInspector(scene, { containerElement: popup.document.body })`, so Griffel writes into the popup's head under the popup's policy [U: the Inspector must take `targetDocument` from the container]. Costs: per-document `cspMeta`; per-path CSP in `_headers` (a `/*` policy would intersect); a second window.
- **B (fallback).** Add `'unsafe-inline'` to `style-src-elem` app-wide. `script-src` is unchanged. An attacker still needs an HTML-injection bug, and no fetch directive allows a remote host for exfiltration; but every route loses one defence layer.
- A static nonce is public, so it adds nothing over B.

## 4. Accessibility
The DOM panel is the source of truth. Every GUI knob has a DOM twin writing the same `labStore` action: range inputs with `aria-valuetext` ("θ 60°"), radio groups, buttons, and 2×2 matrix `<input>` cells with an error caret at the parser's `pos`. GUI controls are pointer conveniences.

The canvas is `role="img"` with an `aria-label` built from `view.readouts`; `tabIndex=0` gives arrow-key orbiting with a visible focus ring. Tab order: tabs → panel → readouts → sandbox → canvas. Readouts are DOM with `aria-live="polite"`, updated on commit, not per frame. Passport, labels and math (KaTeX) are DOM, positioned by projection.

## 5. Testing (installed Chrome only)
- **vitest:** `benches/*/model.test.ts` checks the adapters against direct engine calls (seed-448 tallies; non-Hermitian input gives no eigen-axis; NaN gaps drop triangles; the 128² cap; ħ strings). Also `axes.test.ts` (x̂ × ŷ = ẑ after mapping), `lossPolicy`, `labStore` and `rules`.
- **Chunk contract** (the report gains `bytes`):
  - (a′) every `@babylonjs` chunk becomes unreachable from the entries once the `mountLab`/`inspector` dynamic edges are cut. This dominator check covers lecture chunks and StageHost.
  - (e) no inspector or `@fluentui` module in `mountLab`'s static closure.
  - (f) no editor package anywhere.
  - (g) no three/r3f in the lab closure.
  - (h) sanity: Babylon and the Inspector are both found.
  - (i) gzip budgets.
- **Playwright `e2e/lab.spec.ts`,** both projects, run separately:
  - each bench: 0 console errors, 0 CSP violations, 0 non-self requests; `#/lab` joins `security.spec.ts` ROUTES.
  - lecture, lab, lecture: live contexts go from 2 to 1 and `__lab.alive()` is false; lab first: 0 after leaving.
  - dev only: StrictMode leaves exactly one live engine.
  - `__lab.bench(120)` (GPU-fenced like the gate): p95 ≤ 8 ms at 1440×900.
  - reduced motion and the Motion toggle: zero idle frames; 800 px: no canvas and no `mountLab` request.
  - Tab reaches every control, and a DOM slider moves the GUI knob.
  - a forced loss shows the fallback; a restore remounts.
  - sandbox: Inspector chunk fetched only after the click; 0 violations in both documents; popup closed on leaving.
  - `e2e/helpers.ts` declares `__lab` and counts losses.

## 6. Build order
Each commit: build, then vitest, then the preview and dev e2e projects, then `graphify update .`
1. Chunk-contract tests + `bytes` (sanity checks `todo` until Babylon lands).
2. `/lab` shell: route, `LabPage`, `labStore`, fallback, passports, ROUTES.
3. core + gui, `useLabEngine`, empty scene, `__lab`, lifecycle/StrictMode/loss e2e; sanity (h) on.
4. Axes, DOM labels, on-demand loop, Motion.
5. Operator Lab: model and tests, view, panel, GUI mirror.
6. Grapher.
7. SG bench.
8. Budgets + frame-time e2e.
9. Inspector: stub alias, option A (or B after S), (e)/(f), sandbox e2e.
10. S audit, P truth review of readouts, D visual QA, then the topbar "Lab" link.

## 7. Risks: the G-lab gate (throwaway worktree, ≈ 2 h)
- **Inspector styles vs CSP:** violations with the Inspector open on a production build; whether option A renders styled with 0 violations.
- **Bytes and peers:** gzip per chunk with and without the editor stub; `npm ls --all` count; `npm audit`.
- **CDN strings, `eval`, `new Function`:** a grep of the lab chunks.
- **Missing side-effect imports:** one scene per bench, 0 console errors.
- **Shader splitting:** the chunk count; group them with `advancedChunks` if there are more than 40.
- **Two contexts:** live count; r3f frames drawn on `/lab` must be 0.
- **Handedness (+i vs −i, rotation sense):** screen projection of the axis tips against the r3f Bloch scene.
- **GUI cost:** p95 with 3 GUI panels.

## 8. Questions for the user
1. **Inspector in its own window (app CSP unchanged), or an overlay that needs `'unsafe-inline'` styles app-wide?** *Recommend: own window; the overlay only if G-lab shows A failing, with S sign-off.*
2. **Stub the five editors inside the Inspector?** *Recommend: yes. They are large, and a physics sandbox does not need them.*
3. **v1 benches: Operator Lab (with Bloch rotations), Grapher, SG bench?** *Recommend: yes, in that order.*
4. **Accept two WebGL contexts while on `/lab` (lecture canvas idle)?** *Recommend: yes, measured; revisit if G-lab shows trouble.*
5. **Topbar "Lab" link now, or after the audits?** *Recommend: after step 10; the route works by URL before that.*
