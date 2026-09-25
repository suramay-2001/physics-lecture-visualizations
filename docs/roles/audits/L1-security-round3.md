# L1 security diff audit — Round 3 (role S)

Scope: `git diff l1-freeze..6faffe2 -- app/` (W1, P, D merged since the freeze) + round-3 fix #1.
Method: greps + reads of the diff, the production bundle (`npm run build` in the S worktree), and the BUILT app
driven on installed Chrome (`channel: 'chrome'`, no browser download).

## 0. Summary

No High or Medium findings. The W1, P and D code merged since `l1-freeze` adds **no** new HTML sink, no drei helper
with CDN defaults, no remote asset, no eval-like code, no `postMessage`/`window.open`, and no storage write outside
the progress store. The built app stays at **0 CSP violations and 0 third-party requests** while scrolling all
31 L1 beats and opening all 7 reveals. Two Low findings, both about the measurement tooling that ships in
production behind `?measure`: D's `__stageD.audit()` injects a `<style>` that the CSP blocks (S-R3-01), and the
`?measure` switch itself (S-R3-02, accepted with conditions). Three Info items. Fix #1 is done: a missing or stale
`dist/` now fails one test with "run `npm run build` first" (§9).

Counts: 104 files changed under `app/` (+17,667 / −660). The production bundle has 14 JS chunks, and no new
third-party origin appears in `dist/` apart from `http://scripts.sil.org` inside the OFL licence text (§6). Verbatim
overlap is 0 (§8). `npm audit` reports 0 vulnerabilities in 168 packages.

## 1. Findings

Severity is scaled to this app: static, client-only, no accounts, no server, no sharing, and not yet hosted.
OWASP categories are from the Top 10:2025.

| id | sev | OWASP 2025 | location | evidence | owner | fix |
|---|---|---|---|---|---|---|
| S-R3-01 | **Low** | A02 Security Misconfiguration (CSP compatibility) | `app/src/stage/scenes/devtools.tsx:176-178` | `audit()` runs `document.createElement('style')` and appends it to `<head>` so label fades finish at once. On the BUILT app with `?measure`, one `__stageD.audit()` call gives **1** `securitypolicyviolation` of `style-src-elem ← inline (devtools-*.js:1)` plus a console CSP error. The freeze rule never applies in production, so a contrast audit on the preview build can measure labels mid-fade. Walking all 31 beats before the audit produces 0 violations. | D | Use CSSOM or a data attribute instead of a `<style>` element: `document.documentElement.dataset.measureFreeze = '1'` plus `[data-measure-freeze] .stage-overlay .stage-label { transition: none !important }` in `overlay.css`, or `el.style.transition = 'none'` on each label. Then S deletes the `KNOWN_INJECTIONS` entry in `security/noEval.security.test.ts`. The whole of `__stageD` goes away once W ports it into `__stage` (interface change D7). |
| S-R3-02 | **Low** (accepted with conditions) | A02 Security Misconfiguration (debug features in production) | `app/src/stage/store.ts:113` (`measure: q().has('measure')`), `stage/instrument.ts:93,338-342`, `stage/scenes/devtools.tsx:15,201,208`, `stage/StageHost.tsx:266` | In the production bundle, `?measure` (in the search or the hash query) installs `window.__stage` and `window.__stageD`, sets `preserveDrawingBuffer: true`, and wraps `HTMLCanvasElement.prototype.getContext`. Both globals were verified present with `?measure` and `undefined` without it. The instrumentation exposes drivers (`setU`, `reveal`, `scrollToBeat`), readbacks (`bench`, `contrast`), and `loseContext()`. It makes no network call, writes no storage, and has no `message` listener (grep). | W (`__stage`), D (`__stageD`) | **Accept.** The Playwright preview project needs it (W-L1 §2.10). The page holds no secrets and has no cross-origin channel, so a crafted `?measure` link can only make the visitor's own tab heavier, and same-origin script already has full power. Conditions: (1) instrumentation never writes storage, fetches, or listens for `message`/`storage` events; (2) `__stageD` is removed after D7; (3) if the app ever gains accounts, sharing or analytics, move `?measure` behind a build flag (`import.meta.env.VITE_MEASURE`) in a separate measure build. |
| S-R3-03 | Info | A02 Security Misconfiguration (surface) | `stage/scenes/LabR3Scene.tsx:24,656`, `stage/scenes/HilbertPlaneScene.tsx:23,422` | `DevMeasure` is imported statically, so the `devtools-*.js` chunk (9,275 B) is fetched on every L1 visit even without `?measure`. It stays inert because `enabled()` is false. | D | Load it only when enabled: `if (enabled()) import('./devtools').then((m) => m.install(gl))` (a literal `import()` passes the noEval gate). This can be folded into the D7 port. |
| S-R3-04 | Info (pre-freeze, outside this diff) | A02 Security Misconfiguration (debug features in production) | `app/src/gate/store.ts:558` | `window.__gate = api` runs at module scope, so every production visit to `#/gate` installs it, with no `DEV`/`?measure` check. | W | When the throwaway gate is retired, drop the `/gate` route from production builds (like the Workbench), or gate it the same way as `__stage`. |
| S-R3-05 | Info | A10 Mishandling of Exceptional Conditions (recovery path) | `app/src/resetProgress.ts:7,16` | The reset button duplicates the key literal `'spinlab.progress.v1'` instead of importing it from `progress.ts`, and it leaves `spinlab.progress.v1.corrupt` (≤ 1 KB) behind. If the key ever becomes `v2`, the fallback button would clear the wrong key (it still calls `progress.reset()` first). | W (+S: `progress.ts` export) | Export the key from `progress.ts` and remove `KEY + '.corrupt'` in `resetProgress()` too. |

Checks that passed (details in §2–§8): HTML sinks, inline `<style>`/`<script>` in HTML, drei CDN helpers, remote
assets, eval-like code, `postMessage`/`window.open`, storage writes, new origins, the Workbench/DevLecture
tree-shake, runtime CSP/network on all 31 beats, verbatim overlap, and `npm audit`.

## 2. HTML sinks, inline style/script, injected stylesheets

- **HTML sinks: none new.** Searches of the diff's added lines and of the whole tree for `dangerouslySetInnerHTML`,
  `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `createContextualFragment`, `DOMParser`/`parseFromString` and
  `document.write` find only `ui/Rich.tsx:24,30`, which predate the freeze (`Tex` → `renderAuthoredTex`,
  `UserTex` → `renderUserTex`). The AST gate `security/noEval.security.test.ts` reports 0 hits across the tree.
- **New `Rich`/`Tex` callers carry authored text only:** `StageOverlay.tsx:45,122,152` (labels, passport titles,
  captions from `content/stage.ts` and `L1.story.ts`), `FidelityDrawer.tsx:101,119` (`content/fidelity.ts`),
  `Gloss.tsx:50` (`content/glossary.ts`), `ReviewCard.tsx:18,23,27` (`L1.review.ts`), `StoryStage.tsx:47,72`,
  `UnitView.tsx`, and `BeyondBadge.tsx:20`. No `<input>`-derived value reaches `Tex`/`Rich`. `UserTex` still has no
  caller.
- **Engine readouts and labels are written as text:** the one non-React DOM write path is `stage/store.ts:397`
  (`el.textContent = text`). D's label layout writes only `data-*` attributes and CSS variables through CSSOM.
- **Inline `<style>`/`<script>`:** the source `index.html` has none, and neither does the built `dist/index.html`
  (`csp.security` + `cdn.security` build rules, green). No component renders a JSX `<style>`/`<script>`/`<iframe>`.
- **Injected stylesheets: one.** `devtools.tsx:176` (S-R3-01). A new source rule in `noEval.security.test.ts`
  catches this class from now on: `createElement('style'|'script'|'iframe'|'object'|'embed'|'frame')` and lowercase
  JSX of those tags outside tests. It has one listed exception, S-R3-01. A mutation check (exception removed) fails
  with `/src/stage/scenes/devtools.tsx:176 createElement("style")`.
- **Style attributes:** 41 added lines write styles through React `style={}` or `el.style.*`. Both go through
  CSSOM, which CSP does not govern. KaTeX `style="…"` attributes stay covered by `style-src-attr 'unsafe-inline'`.

## 3. drei imports and CDN strings; remote assets

- **drei in the new code: none.** Every `@react-three/drei` import in the tree predates the freeze:
  `PerspectiveCamera` and `View` in `gate/`, and `Html`, `Line`, `OrbitControls` in `widgets/BlochSphere.tsx:2`. None
  of them fetches anything. W1/D use three's addons instead: `stage/IslandPort.tsx:11` `OrbitControls`,
  `stage/scenes/lab/rig.ts:13` `mergeGeometries`, `stage/hooks.ts:13` `RoomEnvironment` (procedural, no HDRI
  file).
- **`Environment`/`useEnvironment`/`useGLTF`/`Text`: not imported.** The `cdn.security` source rule is green, and
  the built JS holds none of the githack, gstatic Draco, jsdelivr or unicode-font-resolver strings (build rule
  green), so interface change #5 holds.
- **`Html` usage:** `BlochSphere` keeps drei `<Html>` for its standalone widget. In island mode (the shared stage
  canvas) the diff turns it off (`html={false}`) and the host positions DOM labels instead. `<Html>` styles through
  CSSOM, and the runtime pass shows 0 violations.
- **Remote assets: none.** The added lines contain no loader (`useLoader`, `TextureLoader`, `GLTFLoader`,
  `RGBELoader`), no `new Image`/`.src =`, no `fetch`/XHR/WebSocket/EventSource/`sendBeacon`, no `new Worker`, and no
  `url(`/`@import` in the new CSS (`stage/overlay.css`, `stage/story.css`). The only `@import` in the tree is
  KaTeX's bundled CSS (`index.css:1`). The only remote URLs in `src/` are the 4 reading-link origins in
  `content/refs.ts`, all https and unchanged. `public/` gained only `_headers` and the OFL licences.

## 4. eval-like code, postMessage / window.open, storage writes

- **eval-like code: none.** The AST gate (`eval`, `Function`, string timers, `importScripts`, `.constructor(string)`,
  non-literal `import()`, `new Worker` without a static URL, `with`, `javascript:` URLs) reports 0 hits over all of
  `src/`. The only dynamic `import()` calls are the literal lazy routes in `App.tsx:16-22`. W1's evaluator
  (`physics/expr.ts`, 591 lines) is a tokenizer + AST walker with null-prototype tables, no eval, and it passes
  S's `expr.security.test.ts` spec. oxlint's `no-eval`/`no-new-func`/`no-script-url`/`react/no-danger` rules report
  0 errors; the 81 oxlint warnings are all non-security (React hooks immutability etc.).
- **WebGL shaders** (D's GLSL strings in `scenes/lab/*`, `scenes/plane/draw.ts`) compile on the GPU, not in JS.
  CSP does not govern them and they need no `'unsafe-eval'`.
- **`postMessage` / `window.open` / `message` listeners: none** in the diff or in the tree.
- **Storage:** the only writes are `progress.ts:87,122` (S, sanitized and size-capped) and
  `resetProgress.ts:16` (`removeItem` of the same key, W, approved interface change #4; see S-R3-05). There is no
  `sessionStorage`, IndexedDB, cookies, Cache API or service worker. The `?measure` instrumentation stores
  nothing.
- **URL parameters read by the app:** only `measure` (S-R3-02) and `motion=reduce` (`store.ts:332`, harmless).
  Both are parsed with `URLSearchParams` and only switch features on or off; neither value is rendered.

## 5. DEV-only tools in the production bundle (`__stage`, `__stageD`, Workbench, `?measure`)

String search of the 14 built JS chunks (`npm run build` at 6faffe2 + S commits):

| tool | in `dist/`? | gate | verdict |
|---|---|---|---|
| Workbench route (`/dev/stage/…`) | **no**: 0 hits for `Workbench`/`workbench` | `App.tsx:20` `import.meta.env.DEV ? lazy(…) : null` → constant-folded, chunk dropped | tree-shaken ✔ |
| DevLecture + demo story fixture (`/dev/lecture/…`) | **no**: 0 hits for `DevLecture`/`demoStory` | `App.tsx:22`, same pattern | tree-shaken ✔ |
| `window.__stage` | yes, `StageHost-*.js` (40 KB chunk, instrumentation inline) | runtime: `instrument.ts:93` `DEV \|\| stage.measure` | shipped, inert unless `?measure` (S-R3-02) |
| `window.__stageD` | yes, `devtools-*.js` (9,275 B), fetched with the L1 scenes | runtime: `devtools.tsx:15`, same condition | shipped, inert unless `?measure` (S-R3-02/-03) |
| `window.__gate` | yes, `GatePage-*.js` | **none**: set at module load on `#/gate` | pre-freeze (S-R3-04) |

**Verified on the built app:** without `?measure`, `window.__stage` and `window.__stageD` are `undefined` after a
full L1 walk. With `?measure#/lecture/L1`, both are installed and every driver works (31 `scrollToBeat` + 7
`reveal` + 1 `audit`).

**Risk of `?measure` in production** (risk accepted, S-R3-02): an attacker's only lever is a link. That turns on
`preserveDrawingBuffer` (more GPU memory, a bit slower) and puts test drivers on `window`. They matter only to
same-origin script, which could already do everything (there is no cross-origin channel: no `postMessage`, no
`message` listener). No secret, token or personal data exists to read. Progress lives in `localStorage` under the
same origin, and the drivers neither read nor write it. `loseContext()` can blank only the caller's own tab. The
contrast/readback functions read the page's own canvas. The one CSP-visible effect is S-R3-01.

## 6. Origins in the built `dist/`

Method: `l1-freeze` was built from `git archive` in a scratch folder (same `node_modules`), then every
`https?://host` was extracted from the html/css/js/json/svg/txt/`_headers` files of both builds and diffed.

| origin | freeze | now | where (now) |
|---|---|---|---|
| `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | index.html | **gone** | (fonts self-hosted, S round 2) |
| `http://scripts.sil.org` | — | **new** | `licenses/fonts/*-OFL.txt` only (inert licence text, never requested) |
| `http://www.w3.org`, `https://react.dev`, `https://reactrouter.com`, `http://localhost`, `https://github.com`, `https://opencollective.com`, `https://jcgt.org`, `https://docs.pmnd.rs`, `https://gsap.com` | JS | unchanged | inert library strings, all on the `INERT_JS_ORIGINS` list |
| `https://ocw.mit.edu`, `https://theoreticalminimum.com`, `https://www.3blue1brown.com`, `https://www.youtube.com` | JS | unchanged | reading links (`content/refs.ts`) |

W1, P and D added **no origin** to the JS. The `cdn.security` build rules pass on the current build: no CDN or
tracker host in any file, HTML/CSS reference no third-party origin, the JS origins are all documented, and no
`/Users/…` path appears in any built file. There are no source maps in `dist/` (0 `*.map`). `chunkReport` writes
`node_modules/.tmp/chunk-modules.json`, never `dist/`.

## 7. Runtime: CSP violations and third-party requests on the built app (31 L1 beats)

Setup: `npm run build`, then `npx vite preview --port 5192 --strictPort`. Playwright's library ran the installed
Google Chrome (`channel: 'chrome'`, headless, 1000×640). An init script collected `securitypolicyviolation`
events from the first byte. Every request was logged (data:/blob: count as local), along with console CSP errors
and page errors. The script lives in the S scratchpad and is not committed. The server was stopped afterwards.

| pass | what | beats | reveals | CSP violations | CSP console errors | third-party requests | requests | page errors |
|---|---|---|---|---|---|---|---|---|
| A (production default) | `#/lecture/L1`, real scroll in 90 px steps (70 ms), clicking every visible "Show me" of the active beat | **31/31** activated (`[data-beat][data-active=true]`) | **7/7** clicked | **0** | 0 | **0** | 26 | 0 |
| B (`?measure`) | `__stage.scrollToBeat` on each beat (wait), `__stage.reveal` + `settle` on each clue beat | 31/31 | 7/7 | **0** | 0 | 0 | 26 | 0 |
| B, then `__stageD.audit(unit, [0, 1], 0)` | D's contrast/overlap audit | — | — | **+1** `style-src-elem ← inline (devtools-*.js:1)` | +1 | 0 | — | 0 |

Pass A: 1 canvas (one WebGL host), and `__stage`/`__stageD` are `undefined`.

The committed Playwright spec `e2e/security.spec.ts` (preview project, port 5192) also passes **10/10**: the new
dist-current check, then 7 routes (`#/`, `#/lecture/L1`, `#/gate`, `#/arcade`, `#/map`, `#/formulas`, `#/help`)
with 0 CSP violations and 0 third-party requests each (L1 loads 12 font files, all from `/assets/`), the harness
self-check (an injected `<style>` and a remote image ARE reported), and fonts (Literata, Barlow Condensed and
Martian Mono render as web fonts; no glyph of the physics alphabet falls back to LastResort).

## 8. Verbatim overlap (new L1 content) and `npm audit`

**Verbatim gate** (`content/verbatim.test.ts`). It found the main checkout's git-ignored `sources/` through the
ancestor lookup and ran 7/7 green:
- `src`: 466 literals (≥ 8 words), 5,628 8-grams vs 38 source files / 172,566 words → **0 shared 8-grams
  (0.00 %)**, 0 offending literals.
- `dist` JS: 892 literals, 24,710 8-grams → **0 shared**.

Per new L1 file (same normalisation; counts only, no source text printed):

| file | literals ≥ 8 words | words | shared 12-grams | shared 8-grams | shared 6-grams | shared 5-grams |
|---|---|---|---|---|---|---|
| `content/L1.story.ts` | 64 | 1,334 | 0 | **0** | 0 | 1 |
| `content/L1.review.ts` | 32 | 481 | 0 | **0** | 0 | 0 |
| `content/glossary.ts` | 57 | 965 | 0 | **0** | 0 | 9 |
| `content/fidelity.ts` | 47 | 1,044 | 0 | **0** | 0 | 2 |

The 12 shared 5-grams are stock phrases (0 shared 6-grams), which is expected: the gate's threshold is 8.

**`npm audit`** (`app/`, lockfile unchanged since S's round 2): `{info 0, low 0, moderate 0, high 0, critical 0}`
across 168 packages (78 prod, 91 dev, 46 optional). With `--omit=dev` it is also 0. All 168 `resolved` entries point
at `registry.npmjs.org`.

## 9. Round-3 fix #1 (stale-dist guard) — evidence

What changed:
- **`app/src/security/distState.ts`** (new, test-only) gives one verdict on `dist/`: *missing*
  (`dist/index.html` absent), *stale* (older than the newest build input: every non-test file under `src/`,
  `build/`, `public/`, plus `index.html`, `vite.config.ts`, `package.json`, `package-lock.json`; `*.test.*` and
  `*.spec.*` never change `dist/` and are ignored), or *no CSP meta* (no `<meta http-equiv=CSP>` first in `<head>`).
  Every message ends with "run `npm run build` first, then re-run the tests." The no-CSP case adds: "If it persists
  right after `npm run build`, cspMeta() in vite.config.ts stopped injecting the policy." That way a real cspMeta
  regression is not mistaken for a stale build.
- `security/cdn.security.test.ts`, `build/csp.security.test.ts` and `e2e/security.spec.ts` each fail **one**
  test ("app/dist is a current production build of this tree") with that message and skip their dist assertions.
  They no longer skip silently on a missing dist or fail on a stale one.
- `security/distState.security.test.ts` pins the guard on a throwaway tree with fixed mtimes (5 tests: missing,
  fresh, each input kind edited, test files ignored, no CSP meta).

Proof (S worktree, 2026-09-25; commands from `app/`):

| state | `vitest run cdn.security csp.security` | message |
|---|---|---|
| no `dist/` (fresh worktree) | 2 failed · 13 passed · 8 skipped | `dist/index.html does not exist — run \`npm run build\` first, then re-run the tests.` |
| after `npm run build` | **23/23 passed** | — |
| `touch src/content/L1.story.ts` | 2 failed · 13 passed · 8 skipped | `src/content/L1.story.ts changed 9 s after dist/ was built — run \`npm run build\` first …` |
| after `vite build` | **23/23 passed** | — |
| CSP `<meta>` stripped from `dist/index.html` | 2 failed · 13 passed · 8 skipped | `dist/index.html has no CSP <meta> first in <head> … run \`npm run build\` first … cspMeta() …` |
| rebuild, then `touch` a test file only | **23/23 passed** | (test files are not build inputs) |
| Playwright preview, `touch src/main.tsx` | 1 failed · 9 skipped | `src/main.tsx changed 45 s after dist/ was built — run \`npm run build\` first …` |
| Playwright preview after `npm run build` | **10/10 passed** | — |

Whole suite after `npm run build`: `tsc -b` 0 errors; **vitest 745/745** (32 files); oxlint 0 errors.
