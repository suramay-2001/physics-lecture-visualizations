# /lab (Babylon.js) threat review (role S, propose-only)

2026-09-27, before install. Method: `npm view`, Babylon docs, forum and source pages, repo gates, a throwaway benchmark.
✔ = verified; ⚠ = check after install (API names against the installed `.d.ts`).
The real CSP (`build/csp.ts`) is stricter than the brief (`default-src 'none'`, `connect-src 'self'`, `style-src-elem 'self'`);
every control assumes it stays so.

## 1. Headline
- Babylon 9.28.0 ships **Inspector v2** (React + Fluent UI). It has 20 peers, injects `<style>`, evaluates numbers
  with `Function()`, fetches a GIF worker from jsDelivr, and reads student files. That hits the S-L1 §5 re-open trigger.
- The current gates will go red on install, and rightly so: `cdn.security` bans `cdn.babylonjs.com` and `cdn.jsdelivr.net`,
  and chunk contract (a) bans Babylon everywhere. Scope them per §3; do not allowlist blindly.

## 2. Findings
**LAB-01, A05.** Inspector number fields fall back to `Function("return (" + text + ")")` for any non-numeric input ✔ (forum
#63504; PR #18491, merged 2026-05-21, keeps the fallback). With no CSP (dev server, or a host that strips the meta tag), typing
there runs JS. *Likelihood:* high. *Severity:* Low under the CSP, High without it. *Control:* never allow `'unsafe-eval'`; run
the gates on the build. *Test (preview build):* type `globalThis.__pwn=1` into a field. Pass: `__pwn` stays
undefined, exactly one `eval` violation, and `2` still works.

**LAB-02, A02.** Fluent's Griffel inserts `<style>` elements, and its only CSP hook is a nonce ✔. `style-src-elem 'self'`
blocks them, so the Inspector renders unstyled. Babylon's loading screen may do the same ⚠. *Likelihood:* near-certain.
*Severity:* functional. *Control:* Q1, plus `SceneLoaderFlags.ShowLoadingScreen = false` ⚠. *Test:* open the Inspector. Pass:
0 violations and a computed-style probe on its toolbar.

**LAB-03, A03/A08: remote code by default.**
- GIF capture fetches `cdn.jsdelivr.net/gh/terikon/gif.js.optimized@0.1.6/dist/gif.worker.js` (no SRI) and runs it as a
  `blob:` worker ✔.
- Babylon defaults ⚠: `DebugLayer.InspectorURL`, the Draco, KTX2, Basis and meshopt decoders, the glTF validator (a default
  Inspector service ✔), `NodeMaterial.edit()`, the snippet server, `createDefaultEnvironment()` (HDR from
  assets.babylonjs.com), CSG2 (wasm from unpkg), WebXR controllers, and WebGPU glslang.
- Havok calls `new Function` ✔.

All fail closed today; High if a fetch directive is ever relaxed. *Control:* lab code imports nothing on
the §3a list. A tripwire on `Tools.LoadScript`, `LoadScriptAsync`, `LoadFile` and `LoadFileAsync` rejects cross-origin URLs
with a clean error. *Test:* §3.

**LAB-04, A06/A10: file intake** ✔. Sources: `.babylonproj` zips (their asset maps re-fetch remote URLs), asset drag-drop,
Scene Replay delta JSON, and glTF animation import. Classmates swapping files is sharing. Risks: zip bombs,
parser throws, `__proto__` keys ⚠, and Draco glTFs. *Likelihood:* low. *Severity:* Medium (tab DoS, no secrets). *Control:*
Q2, with capture-phase guards on `drop` and on file-input `change`. *Test:* `setInputFiles` on every Inspector file input,
plus a synthetic drop. Pass: mesh count unchanged, 0 requests, 0 page errors.

**LAB-05, A01/privacy: egress.** Four paths:
- The feedback button calls `window.open` on forum.babylonjs.com ✔.
- A toolbar toggle connects a CLI bridge at `ws://127.0.0.1:<port>` ✔.
- The Reflector extension, from the always-added default feed, sends the scene to a bridge ✔.
- The editors can save to the snippet server ⚠.

*Likelihood/Severity:* click-only, Low. *Control:* the CSP blocks the sockets and fetches; `autoEnable` stays off;
`window.open` is Q3. *Test:* `context.route('**/*')`, `context.on('page')` and `page.on('websocket')` record every non-self
attempt. Pass: the CLI toggle opens 0 sockets.

**LAB-06, A03.** *Control:* exact pins, one Babylon version (npm `overrides`), `npm ci`, lockfile review. *Tests:*
- A vitest over `package-lock.json`: each `@babylonjs/*` matches the pin, and each license is in {MIT, ISC, BSD, Apache-2.0,
  0BSD, OFL-1.1}.
- A CI `npm query ':attr(scripts,[postinstall])'` (and pre/install) returns nothing.
- `npm audit` reports 0.

**LAB-07, A10 WebGL.** The lecture's r3f host stays mounted across routes ✔. Babylon adds a context, and each editor preview
may add one more ⚠. Past Chrome's limit (16 ⚠), the **oldest** context is lost, and that is the lecture stage. Undisposed
engines leak. *Control:*
- Engine options `audioEngine: false`, `loseContextOnDispose: true` ⚠.
- DPR ≤ 2, `renderEvenInBackground = false`, render on demand.
- On unmount, dispose the Inspector token, then the scene, then the engine.
- Show a static fallback on context loss; rebuild on restore.

*Test (`?measure`):* go L1 → /lab (all editors opened) → L1, five times. Pass: `EngineStore.Instances` is empty ⚠, live
contexts (`__stageCounters`) stay ≤ 2, no "Too many active WebGL contexts" warning, L1 still draws.
`loseContext()`/`restoreContext()` shows the fallback and then the scene, with 0 page errors.

**LAB-08, A09/privacy.** No telemetry found ⚠ (not exhaustive). Babylon logs a console banner; the Inspector saves its theme
and pane widths to localStorage ✔. *Test:* after an Inspector session, 0 non-self requests, localStorage keys ⊆ {`spinlab.*`,
the Inspector's prefix}, and progress still loads.

A04/A07: N/A.

## 3. Proving that no remote URL is reachable
A grep alone cannot: CDN defaults ship as dead strings. Four layers, each able to fail:

a. **Chunk contract.** `@babylonjs/*` loads only through the `/lab` `import()`. Inspector, `@fluentui`, `@griffel` and
   `*-editor` modules load only through the Inspector toggle's `import()`. None of these is in the lab's closure:
   `Debug/debugLayer`, `Meshes/Compression/*`, `Misc/khronosTextureContainer2`, `Misc/basis`, `Physics/v2/Plugins/havok*`,
   `XR/`, `Meshes/csg2`, `Helpers/environmentHelper`, `Loading/loadingScreen`, `Audio/`, `Engines/webgpuEngine` ⚠ (paths).
b. **Sink scan.** For each bundled `node_modules` module in `chunk-modules.json`, grep for `eval(`, `Function(`,
   `importScripts`, `WebAssembly.`, `createObjectURL`, `createElement("script"|"style")`, `WebSocket`, `window.open`,
   `sendBeacon` and `https?://`. Each hit needs an allowlist entry {module, pattern, control}; a new hit fails.
c. **Origins by scope.** `BANNED` stays absolute for the entry and lecture chunks. Lab chunks may carry listed defaults, each
   one naming its control.
d. **Runtime walk** (preview build): the CSP listener, `context.route`, a MutationObserver on inserted `<script>` and
   `<style>`, and the tripwire counter. Drag every GUI control, type in the grapher, open every Inspector pane, then click
   screenshot, both exports, GIF and each editor. Pass: 0 violations, 0 non-self requests, and the tripwire fires only for GIF.

WASM: unneeded; it fails closed.

## 4. Supply chain (✔ `npm view`)
- Licenses: all `@babylonjs/*` are Apache-2.0; Fluent is MIT.
- Core: 71.6 MB (10,028 files, 0 deps). GUI: 4.3 MB. Inspector: 7.9 MB, 0 deps, 21 peers, of which npm installs 20:
  - five editors (31–68 MB each);
  - loaders, materials, serializers and addons;
  - Fluent `react-components` (62 `@fluentui/*` deps) and `react-icons` (173.8 MB).
- Total: about 470 MB unpacked. The peer range `react <20` fits React 19.2.
- No install scripts in the 30 packages checked; the `babylon-inspector` bin is never run.
- Add gzip budgets from `chunkReport` ⚠.

## 5. Grapher
Holds ✔: caps of 200 characters, 128 tokens and depth 32; null-prototype tables; every node checked, with NaN as gaps; 1024
samples per curve and 128² per grid; fuzz under 1 ms per case.

Gaps:
1. **Ranges are unchecked.** `[NaN, ∞]` and `[-1e308, 1e308]` return all gaps (measured). Add `validRange` (finite, r0 < r1,
   |r| ≤ 1e6, span ≥ 1e-9). *Test:* a table of bad ranges, each rejected with a typed reason.
2. **NaN must never reach vertex buffers.** It poisons the bounds and the camera ⚠. *Test:* the `1/x`, `ln(x)` and `tan(x)`
   meshes are finite.
3. **Cost.** Worst case measured: 8.6 ms per 128² grid (170 characters of nested `exp(sin(cos(x*y)))`, M5). About 35 ms on a
   4× slower laptop: fine per debounced edit, not per frame. Animated `t` runs at ≤ 32² per frame, or in a module worker
   (`new URL(…)`) that `terminate()`s after 250 ms. *Tests:* vitest, worst case < 50 ms; Playwright, longest task < 100 ms and
   rAF p95 < 16.7 ms while animating.
4. **Input.** GUI `InputText` has no length cap ⚠. Use a DOM `<input maxLength=200>` and echo only via `renderUserTex`.
   *Test:* `\href{javascript:…}` produces no `<a>`.

New, with numpy fixtures and fuzz: `asin`, `acos`, `atan` (θ = 2 arccos|c₊|), `sinh`, `cosh`, `tanh`, `sampleParametric` (for
Bloch paths), and `sampleCurveComplex` (for |ψ(t)|²). Reject `i`, `e` and `pi` as variable names (variables shadow constants).

## 6. Controls
**MUST (build blockers):**
1. CSP: no `'unsafe-eval'` or `'wasm-unsafe-eval'`; fetch directives stay `'self'`; Q1 is the only change.
2. §3a–c.
3. §3d and LAB-01 green on the preview build.
4. The tripwire, and no §3a imports.
5. File intake off or capped (Q2), with its test.
6. Pins, licenses, install scripts, `npm audit` 0.
7. LAB-07.
8. Grapher gaps 1–3.

**SHOULD:**
- `worker-src 'self'` if §3d finds no `blob:` worker.
- An animation worker.
- A dev-server CSP header.
- Upstream reports for the `Function()` fallback and the jsDelivr worker.

## 7. Questions for the user
1. **Inspector styles vs the CSP.** (a) `'unsafe-inline'` on `style-src-elem` app-wide; (b) the sandbox on its own
   `sandbox.html` with its own CSP; (c) the Inspector DEV-only. **Recommend (a):** CSS cannot send anything out while images,
   fonts and connections stay `'self'`. Choose (b) if the lecture pages must keep today's exact policy.
2. **Files in the sandbox.** **Recommend:** no imports in v1. Keep screenshots and the glTF/.babylon exports (those downloads
   stay on the machine). GIF fails closed.
3. **Off-site links** (feedback, extension homepages) open only on a student's click. **Recommend:** accept them. They carry no
   data, and the referrer is only the origin.

Sources: Babylon forum t/63504, t/55326; PR 18491; `inspector-v2/src`; docs `inspector.v2/`; griffel.js.org.
