# S-L1 — Security & privacy audit (role S)

Audit + propose only. No application code, config, or git history was modified.

## 1. Threat model

- **Assets:** (1) classmates' privacy: IP address, user agent, and referrer sent to third parties; (2) the user's privacy: local paths, the course name, filenames of textbooks in the repo; (3) copyrighted sources (instructor notes, textbooks) that must never reach `app/`, the build output, or git; (4) availability of the app and its per-browser `localStorage` progress.
- **Actors:** a classmate using the app (typing is the only untrusted input); a third-party CDN or font host (passive tracking, or a compromised script or asset); a compromised npm package (supply chain); a future host or operator (headers, logs).
- **Entry points:** answer inputs (`ChallengeCard.tsx:60`, `SGLab.tsx:255`), both passed to `parseNumber`; planned Operator Lab and grapher expressions plus `renderUserTex`; `localStorage['spinlab.progress.v1']` (`progress.ts:26`); hash-route params (`LecturePage.tsx:8`, rendered as escaped text); authored content passed through `Tex` into `dangerouslySetInnerHTML` (`Rich.tsx:11,13`); runtime third-party fetches (Google Fonts today; drei, Draco, troika, and Babylon Inspector defaults as the app grows).
- **Trust boundaries:** authored content (`app/src/content/**`) counts as trusted but gets reviewed. Anything a user types is untrusted. `localStorage` is semi-trusted: it can be corrupted by old schemas, extensions, or the user. The origins are the app's own origin versus any third-party origin. The repo is a boundary: `sources/` and personal paths stay on the left side (local only).
- **N/A (re-open if the scope changes):** A01 Access Control and A07 AuthN (no accounts, no server); A04 Crypto (no secrets or tokens; any HTTPS comes from the host); A09 Logging (no backend; a static host's access logs are the host's concern); server-side injection (no server). Sharing lab creations is out of scope per PLAN, so there is no stored or reflected XSS path between users today (see A06 in §2).
- **Current exposure:** no git remote is configured (`git remote -v` prints nothing), so nothing has been published yet. Every path finding below is a problem that happens *at first push*.

## 2. Findings

Severity is scaled to this app (static, no accounts, not yet published). "Latent" means the issue triggers only once a planned feature lands.

| id | sev | OWASP 2025 | location | evidence | fix |
|---|---|---|---|---|---|
| S-01 | **High** (at first push) | A02 Misconfig / privacy | `pipeline/course.config.json:8-41` (committed in `2c0e5ec`) | `grep -n "~/" pipeline/course.config.json` finds 10 home-relative paths (`[redacted local path]`, `[redacted local path]`). One textbook filename starts with `[redacted: book filename showing download source] which names the site the file came from. `git log -- pipeline/course.config.json` shows it has been in history since the scaffold commit. | Move the paths to git-ignored `course.config.local.json` (§4h). Because this is already in history and there is **no remote yet** (`git remote -v` is empty), the cheapest fix is to scrub history *before* the first push. That is a user decision (§6 Q1) and is not done here. |
| S-02 | **High** (at first push) | A02 Misconfig | `.gitignore:8` (`*.local`) | `git check-ignore -v pipeline/course.config.local.json` gives exit 1 (**not ignored**). The `*.local` pattern matches only names that *end* in `.local`. | Add explicit `course.config.local.json` / `**/*.local.json` lines (§4h). Add a test that asserts `git check-ignore` succeeds. |
| S-03 | **Medium** | A03 Supply chain / privacy | `app/index.html:9-14`, also in `app/dist/index.html` | `<link … href="https://fonts.googleapis.com/css2?family=Barlow+Condensed…Literata…Martian+Mono…">` plus preconnects to `fonts.googleapis.com` and `fonts.gstatic.com`. Every page load sends the visitor's IP and UA to Google (German courts have ruled this a GDPR violation, LG München I, 3 O 17493/20). | Self-host with `@fontsource/*` (§4c) and remove all three `<link>` tags. Then the CSP can be `font-src 'self' data:`. |
| S-04 | **Medium** | A02 Misconfig | `app/index.html` (no CSP), `app/vite.config.ts` | `grep -c Content-Security-Policy app/index.html` returns `0`. The app has no defense-in-depth for the `dangerouslySetInnerHTML` sink. | Add the build-only meta CSP from §4b, plus a `_headers` template. |
| S-05 | **Medium** (latent) | A05 Injection / A10 | `app/src/ui/Rich.tsx:7` | Options are `{throwOnError:false, strict:'ignore'}`: trust is off by default (verified §3), but there is **no `maxSize`** (default `Infinity`) and no try/catch. Empirical test on katex 0.18.7: `\rule{500em}{500em}` renders `height:500em`. Nesting `x^{`×800 (also `\sqrt`, `\frac`) throws an uncaught **`RangeError`** (`throwOnError` covers only `ParseError`). A flat 10k-char input yields 1.6 MB of HTML. There are no error boundaries (`grep -rn ErrorBoundary src` finds nothing), so one bad string blanks the page. Today only authored content reaches it: `grep` shows no user string reaching `Tex`. | Keep `Tex` for authored content only, and wrap it in try/catch. Add a separate `renderUserTex` with caps (§4a). Add a route-level error boundary. |
| S-06 | Low | A10 Exceptional | `app/src/progress.ts:27`, readers `pages/Home.tsx:30`, `components/ChallengeCard.tsx:128` | `{ ...empty(), ...JSON.parse(raw) }` has no shape check. Stored `{"challenges":null}` makes `p.challenges[id]` throw `TypeError` during render. Without an error boundary this is a **persistent** white screen, fixable only by clearing site data. The value has no size cap either. | Validate the shape and cap the size (§4e); on failure fall back to `empty()` and keep the raw value under a `.corrupt` key. |
| S-07 | Low | A05 Injection (hygiene) | `app/src/ui/parseNumber.ts:109,111` | `tok.v in CONSTS` and `FUNCS[tok.v]` walk the prototype chain, so `constructor` resolves to `Object`. A Node run of a copy shows `parseNumber("constructor")` returns `null` **only because** the final `Number.isFinite` check rejects the function. It is safe by accident. The fuzz was otherwise fine: 10⁵ nested parens gives `null` in 14 ms (stack overflow caught), 200k chars parse in 21 ms, and neither input has a `maxLength`. | Use `Object.hasOwn` or `Object.create(null)` maps, add a 200-char cap, and a depth counter. The same rules apply to the planned evaluator (§4f). |
| S-08 | Medium (latent) | A03 Supply chain / A08 Integrity | `node_modules/@react-three/drei/core/{Gltf,useEnvironment,Ktx2,MatcapTexture,NormalTexture,Cloud}.js`, `web/FaceLandmarker.js`, `troika-three-text…esm.js:453` | Default remote URLs, verified in §3. The app currently imports only `Html, Line, OrbitControls` (`BlochSphere.tsx:2`), which make no remote calls. The planned GLB, Draco, and label work would start fetching from gstatic, githack, or jsdelivr. | Patterns in §4d, enforced by CSP `connect-src 'self'`. |
| S-09 | Medium (latent) | A03 Supply chain | planned `@babylonjs/*` | Not installed. Per Babylon forum and docs (§3), `scene.debugLayer.show()` loads the Inspector from `cdn.babylonjs.com` unless `@babylonjs/inspector` is imported. | Dev-only dynamic import (§4d). CSP blocks it in production. |
| S-10 | Medium | A06 Insecure design (copyright) | `app/src/content/**` vs `sources/**/*.md` (local, ignored by `.gitignore:3`) | A baseline run of the §4g algorithm on 177 literals of ≥8 words against all 37 source `.md` files (~154k words) gives **0 shared 6-, 8- or 12-grams**, 9 shared 5-grams (0.44%), and 43 shared 4-grams (1.96%). Clean today, but no test prevents regressions. **Note:** a `text.md`-only glob misses the entire Susskind book, which `ingest.py:109` writes as `sources/susskind/chapterNNN.md` (28 files, ~61.5k words). `app/src/assets/` is empty. `git ls-files` shows no `sources/` or `dist/`. | Add the vitest gate in §4g, globbing `**/*.md`. |
| S-11 | Low | A02 Misconfig | `.gitignore` | `git status` shows `?? .claude/worktrees/` (nested repos could be picked up by `git add -A`). `graphify-out/` is not ignored (only `graphify-out/cache/` is, at `.gitignore:9`). A graph built over `sources/` could commit excerpts. | Ignore `.claude/worktrees/`, and either ignore `graphify-out/` or exclude `sources/` from graphify runs. |
| S-12 | Low | A10 Exceptional | `app/src/widgets/BlochSphere.tsx:180` | `grep -rn webglcontextlost src` finds nothing. `dpr={[1,2]}` is capped, which is good. | Add a `webglcontextlost` handler that shows a fallback (a static SVG) and `preventDefault()` so the context can be restored. |
| S-13 | Info | A03 Supply chain | `app/package-lock.json` | `npm audit`: `{'info':0,'low':0,'moderate':0,'high':0,'critical':0,'total':0}` across 160 deps (73 prod). All 160 `"resolved"` entries point at `registry.npmjs.org` (grep for other hosts finds nothing). Ranges use `^`, and there is no CI. | §4i. |
| S-14 | Pass | — | `RefList.tsx:34`, `LecturePage.tsx:13`, git identity | External links are authored https URLs to 4 origins (ocw.mit.edu, theoreticalminimum.com, 3blue1brown.com, youtube.com) with `rel="noreferrer"`, which implies noopener. The route param is rendered as escaped React text. `git log --format='%ae'` gives only `…@users.noreply.github.com`. No iframes or embeds. | None. Keep `Referrer-Policy` in headers. |

## 3. Verified library facts

**KaTeX 0.18.7** (`app/node_modules/katex/dist/katex.mjs`):
- `trust` is typed `["boolean","function"]` with no explicit default (l.207-211). `getDefaultValue` takes `type[0]`, which is `'boolean'`, and `getImplicitDefault('boolean')` returns `false` (l.233-256). **Trust defaults to false.**
- `isTrusted(context)` (l.365-374) calls `this.trust(context)` when trust is a function and coerces the result with `Boolean`. For URL commands it first adds a `protocol` to the context and rejects when the protocol can't be parsed.
- `\htmlClass` builds the context `{ command: "\\htmlClass", class: value }` (l.11116-11121). `\htmlId`, `\htmlStyle`, and `\htmlData` have their own contexts (l.11123-11170). An untrusted command goes to `formatUnsupportedCmd` (l.11176), which renders red text rather than throwing. `\href`, `\url`, and `\includegraphics` also pass through `isTrusted` (l.11003, 11038, 11312).
- `maxSize`: number, **default `Infinity`**, processor `Math.max(0,s)` (l.212-219). `maxExpand`: number, **default 1000** (l.220-227). The limit is enforced in `MacroExpander` (l.14551): "Too many expansions" is a `ParseError`, so `throwOnError:false` renders it.
- Empirical checks (Node, scratch copy): the untrusted `\href{javascript:…}` produces no `<a`. The `term-` callback lets `\htmlClass{term-spin}` through and rejects `\htmlClass{term-x" onclick}`, `\htmlClass{evil}`, and `\htmlStyle{…}`. `maxSize:10` caps `\rule{500em}` to `10em`. The macro bomb `\def\a{\a\a}\a` stops in 1 ms. **Nesting depth ≥ 800 throws `RangeError`**, which `throwOnError` does not catch. Depth 400 passed.

**drei 10.7.8 remote-fetch defaults** (`grep -rnoE "https?://…(githack|jsdelivr|unpkg|gstatic|googleapis|cdn\.)"`):

| helper | default remote | file |
|---|---|---|
| `useGLTF` / `<Gltf>` (`useDraco` **defaults to `true`**) | `https://www.gstatic.com/draco/versioned/decoders/1.5.5/` | `core/Gltf.js:8-18`; override via `useGLTF.setDecoderPath` (l.29) or a string `useDraco` |
| `useGLTF` `useMeshopt` (default `true`) | none; it calls `WebAssembly.instantiate` on embedded wasm (`three-stdlib/libs/MeshoptDecoder.js:132`), which needs CSP `'wasm-unsafe-eval'` | `core/Gltf.js:21-22` |
| `<Environment preset=…>` / `useEnvironment` | `https://raw.githack.com/pmndrs/drei-assets/…/hdri/` | `core/useEnvironment.js:8` |
| `useKTX2` | `https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/` (unpinned `@master`) | `core/Ktx2.js:7-8` |
| `useMatcapTexture`, `useNormalTexture` | jsdelivr `@master` JSON + rawcdn.githack | `core/MatcapTexture.js:19-20`, `core/NormalTexture.js:6-7` |
| `<Cloud>` | rawcdn.githack `cloud.png` | `core/Cloud.js:8` |
| `<FaceLandmarker>` | jsdelivr mediapipe wasm + storage.googleapis model | `web/FaceLandmarker.js:8-11` |
| `<Text>` (troika-three-text 0.52.5) | glyph coverage and fonts from `https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data` for **every character not covered by the `font` prop** (the whole string if `font` is unset). A failed custom `unicodeFontsURL` **falls back to the default CDN** ("trying default CDN") | `troika-three-text.esm.js:453, 571-673` |

`<Text>` also runs its typesetting in a `blob:` worker that calls `importScripts(blob:)` (`troika-worker-utils.esm.js:91-104, 221`). Under `script-src 'self'` the worker starts but rehydration fails. The capability check only tests `new Worker`, and the source has a TODO for this case. `Html`, `Line`, and `OrbitControls`, the only drei imports today, make no remote calls.

**Babylon Inspector** (not installed, one web search): `scene.debugLayer.show()` pulls the Inspector bundle from the Babylon CDN unless both `@babylonjs/core/Debug/debugLayer` and `@babylonjs/inspector` are imported ([forum: can't invoke inspector without CDN](https://forum.babylonjs.com/t/cant-invoke-inspector-without-cdn/28733), [Babylon docs: Inspector](https://doc.babylonjs.com/toolsAndResources/inspector)). Babylon's own Draco, Basis, and KTX2 decoders also default to `cdn.babylonjs.com`. **Re-verify with `grep -rn "cdn.babylonjs.com" node_modules/@babylonjs/core` at install time.**

**Build output:** `app/dist/assets/*.css` contains one KaTeX `@font-face` inlined as `url(data:font/woff…)`, from Vite's 4 KB `assetsInlineLimit`. So `font-src` needs `data:` or a changed inline limit. There are no inline `<script>` or `<style>` blocks in `dist/index.html`. Vite dev *does* inject an inline React-refresh preamble, so the CSP must be build-only.

## 4. Control specs for the build round

### 4a. `renderUserTex` (untrusted) and the trusted renderer — `app/src/ui/tex.ts`

```ts
import katex, { type KatexOptions, type TrustContext } from 'katex' // katex ships its own types (types/katex.d.ts)

export const USER_TEX_MAX_LEN = 300      // chars; at 3 chars per level, nesting stays ≤ 100 (RangeError starts ≥ 800)
export const USER_TEX_MAX_BRACE_DEPTH = 24
const USER_OPTS: KatexOptions = {
  trust: false,          // explicit even though it is the default; blocks \href \url \includegraphics \html*
  strict: 'ignore',      // no console spam from student typos
  throwOnError: false,   // ParseError → red inline error, not an exception
  maxSize: 10,           // em cap for \rule, \kern, \raisebox… (default is Infinity)
  maxExpand: 50,         // user input needs no macros (default is 1000)
  output: 'htmlAndMathml',
  // NEVER pass a shared `macros` object: KaTeX mutates it on \gdef (verified: a shared {} gains key '\\yy'
  // after '\gdef\yy{1}'). Without one, \gdef does not persist between calls (verified).
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const fail = (msg: string) => `<span class="tex-user-error">${esc(msg)}</span>`

export function renderUserTex(src: string, displayMode = false): string {
  if (typeof src !== 'string') return fail('not text')
  if (src.length > USER_TEX_MAX_LEN) return fail(`too long (max ${USER_TEX_MAX_LEN} characters)`)
  let d = 0, max = 0
  for (const ch of src) { if (ch === '{') max = Math.max(max, ++d); else if (ch === '}') d-- }
  if (max > USER_TEX_MAX_BRACE_DEPTH) return fail('nested too deeply')
  try { return katex.renderToString(src, { ...USER_OPTS, displayMode }) }
  catch { return fail("couldn't typeset that") } // RangeError / anything non-ParseError
}

// Trusted renderer for authored content only: allows exactly \htmlClass{term-…}{…}
const TERM_CLASS = /^term-[a-z0-9-]+$/
const trustTerms = (ctx: TrustContext) => ctx.command === '\\htmlClass' && TERM_CLASS.test(ctx.class)
export function renderAuthoredTex(src: string, displayMode = false): string {
  try {
    return katex.renderToString(src, { displayMode, trust: trustTerms, strict: authoredStrict, throwOnError: false, maxSize: 20, maxExpand: 1000 })
  } catch { return fail('typeset error') } // surfaced by a content test, see below
}
// plain strict:'warn' logs "HTML extension is disabled on strict mode [htmlExtension]" on every \htmlClass (observed)
const authoredStrict = (code: string) => (code === 'htmlExtension' ? 'ignore' : 'warn')
```
- `Rich.tsx:7` switches to `renderAuthoredTex`. Its `strict` function exposes authoring mistakes in dev without noise from `\htmlClass`. A content test renders every authored string with `throwOnError:true` and fails on any `ParseError`. With `throwOnError:false`, an undefined command such as `\zz` renders silently as red `<mtext>` rather than a `katex-error` span (observed), so the check must use `throwOnError:true`.
- Lint or grep gate: `renderUserTex` is the **only** function allowed to receive state that came from an `<input>`. A test asserts that `Rich`/`Tex` are never passed a value derived from `useState` in lab components. That check is a code-review rule; the automated part is the test list below.
- Tests (vitest, node env): `\href{javascript:alert(1)}{x}` has no `<a`; `\htmlClass{term-x}{a}` in the user renderer has no `class="enclosing term-x"`; in the trusted renderer `\htmlClass{term-spin}{a}` has `class="enclosing term-spin"`; `\htmlClass{evil}`, `\htmlClass{term-X}`, `\htmlClass{term-x" onclick}`, `\htmlId`, `\htmlStyle`, and `\htmlData` are all rejected; `\rule{500em}{500em}` in user output contains no `500em`; `x^{`×800 does not throw; a 301-char input gives `too long`; `\def\a{\a\a}\a` finishes in under 50 ms; `\gdef\x{1}` in call 1 leaves `\x` undefined in call 2 (compare the outputs of `\x` before and after, which must be equal); 60 bare `\sqrt` (300 chars) renders without throwing (verified).

### 4b. CSP and headers

**Meta CSP (injected at build only).** The dev server needs an inline React-refresh preamble (`@vitejs/plugin-react/dist/index.js:140-146`), so the meta tag must not be in the source `index.html`. Add a tiny Vite plugin with `apply: 'build'` and `transformIndexHtml` that prepends the tag as the **first child of `<head>`**:

```
default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; media-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'
```

| directive | why |
|---|---|
| `default-src 'none'` | Deny by default. Everything needed is listed explicitly. |
| `script-src 'self'` | Vite emits only external module scripts (verified in `dist/index.html`); no eval anywhere (grep of drei, fiber, KaTeX, and troika finds no `eval(` or `new Function(`). Add `'wasm-unsafe-eval'` **only if** Draco, Meshopt, or Havok is used (§4d). Add `blob:` **only if** drei `<Text>` is used (troika `importScripts(blob:)`). |
| `style-src 'self' 'unsafe-inline'` | Fallback for browsers without CSP3 `-elem`/`-attr` support. |
| `style-src-elem 'self'` | Allows only bundled `<link rel=stylesheet>`; no injected `<style>` blocks. |
| `style-src-attr 'unsafe-inline'` | KaTeX `renderToString` output carries `style="height:…"` attributes parsed through `innerHTML`. React `style={}`, GSAP, and drei `<Html>` write through CSSOM, which CSP does not govern. |
| `img-src 'self' data: blob:` | three and drei textures from canvas or blob URLs; data-URI icons. |
| `font-src 'self' data:` | Self-hosted @fontsource files. One KaTeX woff is inlined as `data:` by Vite (§3). |
| `connect-src 'self'` | GLB and HDR fetches from the same origin. **This line enforces "no runtime third party"**: drei, troika, and Babylon CDN defaults fail closed. |
| `worker-src 'self' blob:` | three and drei loaders and troika build workers from `blob:` URLs (`DRACOLoader`, `troika-worker-utils.esm.js:221`). |
| `media-src`, `manifest-src 'self'` | Future audio or video and a web manifest. |
| `object-src 'none'; base-uri 'none'; form-action 'none'` | No plugins, no `<base>` hijack, no form posts (the app has no forms that submit). |

**Limits of meta CSP:** `frame-ancestors`, `report-uri`/`report-to`, and `sandbox` are ignored in `<meta>`. The tag only governs content parsed after it (so it goes first in `<head>`). It cannot set HSTS or other headers. **Test:** a Playwright smoke run on `vite preview` loads every route and opens every widget with `page.on('console')` / `securitypolicyviolation` listeners. It fails on any violation or any request to a non-self origin (`page.on('request')`).

**`app/public/_headers`** (Netlify or Cloudflare Pages syntax; GitHub Pages ignores it, so the meta tag stays as the floor):
```
/*
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; media-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
`frame-ancestors`/`X-Frame-Options` stop clickjacking and embedding. HSTS applies only on HTTPS custom domains (hosts on `*.pages.dev` or `*.netlify.app` already set it). COEP is deliberately omitted: it would require CORP on every asset and brings no benefit without SharedArrayBuffer.

### 4c. Self-hosted fonts (all SIL **OFL-1.1**, confirmed with `npm view … license`)
- `@fontsource/barlow-condensed` 5.3.0: `import '@fontsource/barlow-condensed/500.css'`, then `600.css` and `700.css`.
- `@fontsource-variable/literata` 5.3.0: needs the opsz axis (7..72) plus italic, as used in `index.html:12`. Import the opsz files (expected names `opsz.css` and `opsz-italic.css`; **confirm with `ls node_modules/@fontsource-variable/literata/*.css` after install**). The family name becomes `'Literata Variable'`, so update the CSS `font-family` stacks. The static fallback is `@fontsource/literata` (400, 500, 600, 400-italic) with no optical sizing.
- `@fontsource/martian-mono` 5.3.0: `400.css`, `500.css` (a `-variable` package also exists).
- Import them in `main.tsx`. Load latin subsets only if size matters (`latin-500.css`), but **check Greek coverage**: ψ, θ, φ, and ħ must render in the text face or fall back cleanly to KaTeX. Remove `index.html:9-14`. Ship each package's `LICENSE` (OFL requires the license to travel with the font files); the Vite build copies only the woff2 files, so add a `/licenses/fonts/` copy or a credits page.

### 4d. Remote-fetch mitigations
- **GLB:** export without Draco and use `KHR_mesh_quantization`, which three's GLTFLoader decodes natively with no wasm. Load with `useGLTF(url, false, false)` (useDraco=false, useMeshopt=false). The meshopt default otherwise runs `WebAssembly.instantiate`, which needs `'wasm-unsafe-eval'`. If Draco is unavoidable: copy `node_modules/three/examples/jsm/libs/draco/gltf/*` (verified present) to `app/public/draco/`, call `useGLTF.setDecoderPath('./draco/')` once at module scope, and add `'wasm-unsafe-eval'` to `script-src`. Pin the decoder by recopying on three upgrades.
- **Environment/HDRI:** never use `preset=`. Put the file in `public/hdri/` and use `<Environment files="./hdri/studio_1k.hdr" />`, keeping it small (1k). The same applies to matcap and normal textures: pass local URLs or textures, never an id or number.
- **Text:** prefer drei `<Html>` or SVG labels (already used) so KaTeX renders the math. If `<Text>` is required, pass `font="./fonts/…woff"` covering every glyph used and add `blob:` to `script-src`. `connect-src 'self'` blocks the troika fallback to jsdelivr (`troika-three-text.esm.js:453`), and the Playwright request check catches it.
- **KTX2/Basis:** avoid it. If needed, copy `three/examples/jsm/libs/basis/*` (verified present) and pass `useKTX2(url, './basis/')`.
- **Babylon Inspector:** dev-only dynamic import, never in production:
  ```ts
  if (import.meta.env.DEV) { await import('@babylonjs/core/Debug/debugLayer'); await import('@babylonjs/inspector'); scene.debugLayer.show() }
  ```
  Put `@babylonjs/inspector` in devDependencies. At install, verify `grep -rn "cdn.babylonjs.com" node_modules/@babylonjs/core | head`. Set `SceneLoader.ShowLoadingScreen = false`, or use a custom loading screen, and pass local decoder URLs for any Babylon Draco or KTX2 use. A build-time test fails if `dist/assets/*.js` contains `cdn.babylonjs.com` inside the entry chunk. This is advisory, since dead default strings may remain in the code.

### 4e. `progress.ts` validation and size cap (sketch)
```ts
const MAX_RAW = 64 * 1024, MAX_ENTRIES = 500
const isInt = (v: unknown, hi: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= hi
const ID = /^[A-Za-z0-9._:-]{1,64}$/
function sanitize(x: unknown): State {
  const out = empty()
  if (!x || typeof x !== 'object' || Array.isArray(x)) return out
  const { challenges, games } = x as Record<string, unknown>
  if (challenges && typeof challenges === 'object' && !Array.isArray(challenges))
    for (const [id, r] of Object.entries(challenges).slice(0, MAX_ENTRIES)) {
      if (!ID.test(id) || !r || typeof r !== 'object') continue
      const c = r as Record<string, unknown>
      out.challenges[id] = { solved: c.solved === true, peeked: c.peeked === true,
        attempts: isInt(c.attempts, 1e6) ? (c.attempts as number) : 0, hintsUsed: isInt(c.hintsUsed, 10) ? (c.hintsUsed as number) : 0 }
    }
  if (games && typeof games === 'object' && !Array.isArray(games))
    for (const [id, lvl] of Object.entries(games).slice(0, MAX_ENTRIES)) if (ID.test(id) && isInt(lvl, 1000)) out.games[id] = lvl as number
  return out
}
function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    if (raw.length > MAX_RAW) { localStorage.setItem(KEY + '.corrupt', raw.slice(0, 1024)); return empty() }
    return sanitize(JSON.parse(raw))
  } catch { return empty() }
}
```
`out.challenges` should be `Object.create(null)`, or ids must be checked with `Object.hasOwn` when reading. The `ID` regex already rejects `__proto__`. Tests: `null`, `[]`, `"x"`, `{"challenges":null}`, `{"challenges":{"__proto__":{"solved":true}}}`, `{"games":{"g":"9"}}`, and a 70 KB blob all yield a working `Home` render. Also add a route-level React error boundary with a "reset progress" button. Add a `v` field now so a future `v2` migration is explicit.

### 4f. Expression-evaluator hardening (Operator Lab, grapher, `parseNumber`)
Requirements:
1. **Length cap:** 200 chars for answers and the grapher, 64 per matrix cell. Enforce with `maxLength` on `<input>` **and** in the parser, since the parser must not trust the DOM.
2. **Tokenizer allowlist:** digits, `.`, `e±`, `+-*/^()`, `,`, whitespace, `π ħ √ × · ÷ −`, and ASCII letters. Any other char rejects with its position.
3. **Identifier lookup:** only through `Map` or `Object.create(null)` tables plus `Object.hasOwn`. Replace `in CONSTS` and `FUNCS[…]` (`parseNumber.ts:109,111`). Only listed variables are allowed (`x`, `t`, `θ`…), per widget.
4. **Structure caps:** at most 64 tokens (answers) or 128 (grapher), and **AST depth ≤ 32**, counted in `atom` for `(`, in `unary` for chained signs, and in `power` for right-assoc `^` chains. On overflow return `{ok:false, reason:'too-deep'}` instead of relying on `RangeError`.
5. **No `eval`, `Function`, `with`, or string `setTimeout`.** Enforce with oxlint rules `no-eval`, `no-new-func`, `no-implied-eval` in `.oxlintrc.json`, plus a vitest grep test over `app/src/**/*.{ts,tsx}`.
6. **Parse once, evaluate many:** compile to an AST, and have `evaluate(ast, env)` be a pure switch. Complex mode uses a `{re, im}` type, never strings.
7. **Finite guards:** check every node result. Grapher samples that are non-finite or have |y| > 1e6 become gaps (NaN), not throws. Operator Lab matrix entries need |z| ≤ 1e6, and eigen-solvers get an iteration cap (≤ 100) and an `ε` for degeneracy. Answers reject non-finite values, as today.
8. **Grid and work caps:** at most 1024 samples per 1D curve and 128×128 per 2D field (16,384 evaluations). Debounce edits by 150 ms. Keep an evaluation budget of about 8 ms per frame (measure with `performance.now()`, halve the resolution if exceeded). Canvas `dpr` stays at `[1,2]`.
9. **Errors are values:** `parse()` returns `{ok:true, ast} | {ok:false, pos, reason}` and never throws into React.

Test cases (expected result):

| input | expect |
|---|---|
| `''`, `'   '` | reject empty |
| `'1+'.repeat(101)+'1'` (203 chars) | reject length |
| `'('.repeat(33)+'1'+')'.repeat(33)` | reject too-deep (not RangeError) |
| `'-'.repeat(40)+'1'` | reject too-deep |
| `constructor`, `toString`, `hasOwnProperty(1)`, `valueOf` | reject unknown identifier |
| `alert(1)`, `window`, `this`, `x=>x`, `1;2`, `` `1` ``, `[1]`, `{}`, `'a'` | reject char or identifier |
| `1/0`, `0/0`, `9^9^9`, `1e309`, `ln(0)` | reject non-finite (answers) or gap (grapher) |
| `sqrt(-1)` | real mode: reject; complex mode: `{re:0, im:1}` |
| `2pi`, `√3/2`, `cos(pi/8)^2`, `1/sqrt2`, `ħ/4` | 6.2832, 0.8660, 0.853553, 0.7071, 0.25 (regression of the existing tests) |
| `-2^2`, `2^-1`, `2^3^2` | −4, 0.5, 512 (documented precedence) |
| grapher `sin(x)` on 10⁶ requested samples | clamped to 1024 |

### 4g. Verbatim-overlap test (`app/src/content/verbatim.test.ts`)
- **Locate sources:** `const SRC = path.resolve(__dirname, '../../../sources')`. If it is missing, or `globSync(SRC + '/**/*.md')` is empty, use `describe.skip` and print "sources/ absent, verbatim check skipped". CI never has sources, so this gate runs **locally**; add it to the phase checklist ("`npm test` with sources present before commit"). **Glob `**/*.md`, not `text.md`**, or the Susskind chapters are missed (S-10).
- **Extract literals** with the TypeScript compiler API, since `typescript` is already a devDependency. Walk `StringLiteral`, `NoSubstitutionTemplateLiteral`, and `TemplateExpression` head and spans in `app/src/content/**/*.ts`. Keep literals with ≥ 8 words, and record file:line.
- **Normalize both sides:** NFKC, lowercase, drop `$$…$$` and `$…$` TeX and `\commands`, drop markdown `*`/`_`, then words `= /[a-z]+(?:'[a-z]+)?/g`.
- **Shingles:** n = **8** word n-grams. Build a `Set` of source 8-grams (~154k words gives ~154k entries, well under 1 s).
- **Fail if:** (a) any literal shares **≥ 2** 8-grams with the sources, or (b) any literal shares a **12-gram** (a verbatim run of ≥ 12 words), or (c) the corpus-wide share of 8-grams exceeds **0.5%**. The measured baseline is 0/0/0.00% (§2 S-10), so these thresholds leave room for stock phrases without letting copied sentences through.
- **Allowlist:** `verbatim-allow.json` holds `{sha1(gram): "reason + citation"}` for deliberate short quotes. Keep it empty by default.
- **Output:** on failure print `file:line` and only the shared 8 words, never longer source excerpts.
- **Companion check:** the same function runs against `dist/assets/*.js` after `vite build`, which catches text placed outside `content/`. Also fail if any `*.pdf`, `*.epub`, or `*.djvu` exists under `app/` (`git ls-files app | grep -E '\.(pdf|epub|djvu)$'` must be empty).

### 4h. Local paths out of `pipeline/course.config.json`
- New tracked file `pipeline/course.config.example.json`: identical structure, with paths like `"~/path/to/Lecture 1.pdf"` and generic filenames (`"textbook-susskind.epub"`).
- New untracked file `pipeline/course.config.local.json`: the real paths.
- `pipeline/course.config.json` keeps only non-personal fields (ids, titles, citation keys), or is deleted in favor of example plus local.
- `ingest.py` loads `course.config.local.json` if present, else exits with "copy course.config.example.json to course.config.local.json". It **never** falls back to the example silently.
- `.gitignore` additions:
  ```
  course.config.local.json
  **/*.local.json
  .claude/worktrees/
  graphify-out/        # or ensure graphify excludes sources/
  ```
- Test: `git check-ignore -q pipeline/course.config.local.json` exits 0. A pre-commit or CI grep over `git ls-files` for `/Users/|~/` (and no `path` keys in the tracked config) returns nothing.
- History: the old paths remain in commit `2c0e5ec`. See §6 Q1.

### 4i. Dependency hygiene and a minimal CI outline (do not create yet)
- `npm ci` only, from the committed lockfile. Add `"engines": {"node": ">=24"}` and an `.nvmrc`.
- Remove `@types/katex`: katex 0.18 ships `types/katex.d.ts`, so the extra package is dead weight and can drift.
- New dependencies (GSAP, `@babylonjs/*`, @fontsource) require a lockfile diff review: registry host `registry.npmjs.org` only, no install scripts (`npm install --ignore-scripts` then `npm rebuild` for any that need it), and a license check (MIT, BSD, Apache, OFL).
- Consider `npm config set ignore-scripts true` for the project (`app/.npmrc`: `ignore-scripts=true`) plus explicit rebuilds. Verify oxlint and Vite's native bindings still install.
- Renovate or Dependabot with grouped weekly minors; security patches immediately.
- CI (GitHub Actions, `permissions: contents: read`, actions pinned by SHA):
  1. `actions/checkout` and `actions/setup-node` (node from `.nvmrc`, npm cache)
  2. `npm ci --ignore-scripts && npm rebuild` in `app/`
  3. `npm audit --audit-level=high --omit=dev` (fail), and a full `npm audit` (report only)
  4. `npx oxlint` (with no-eval rules), `tsc -b`, `vitest run` (the verbatim test self-skips)
  5. `vite build`, then grep `dist/` for `fonts.googleapis|gstatic|githack|jsdelivr|unpkg|cdn.babylonjs` in HTML and CSS (fail), and for `/Users/` (fail)
  6. Playwright CSP smoke on `vite preview` (4b)
  7. Grep `git ls-files` for personal paths and source files (4g, 4h)

## 5. Prioritized fix list

| pri | item (finding → spec) | phase | owner | done when |
|---|---|---|---|---|
| **P0** | S-01/S-02: move paths to `course.config.local.json`, fix `.gitignore`, and decide on history scrub (§4h, Q1) | **Before any `git remote add` or push**; now (Phase 1) | S spec, W implements, user decides on history | `git check-ignore` passes; `git ls-files` grep for paths is empty; history decision recorded in `decisions/` |
| **P0** | S-10: verbatim-overlap vitest over `sources/**/*.md` plus the dist check (§4g) | Phase 2 (L1 slice), before the first new content lands | S | Test runs locally and reports 0 violations; it skips cleanly without `sources/` |
| **P1** | S-03: self-host fonts (§4c) | Phase 0 gate or early Phase 2 (touches typography, so W and D check the look) | W | No `googleapis`/`gstatic` in `dist/`; the Playwright request check passes |
| **P1** | S-04: build-only meta CSP plus the `_headers` template, and the Playwright CSP smoke (§4b) | Phase 2, right after fonts (CSP presumes no remote fonts) | W builds, S verifies | Zero `securitypolicyviolation` events across all routes and widgets |
| **P1** | S-05: `renderUserTex` / `renderAuthoredTex` split with try/catch, plus a route error boundary (§4a) | Phase 2 (W infra), required before Operator Lab (Phase 3) | W | §4a tests green |
| **P1** | S-08/S-09: remote-fetch patterns (`useGLTF(url,false,false)`, local HDRI, no `<Text>`, dev-only Inspector) (§4d) | Phase 2 for drei scenes; Phase 3 for Blender GLBs and Babylon | D and W | CSP smoke and dist grep are clean after each scene lands |
| **P1** | §4f evaluator hardening, and `parseNumber` identifier lookup, caps, and depth (S-07) | `parseNumber`: Phase 2; Operator Lab and grapher: Phase 3 (a spec gate before building) | W | §4f table green; oxlint no-eval rules on |
| **P2** | S-06: `progress.ts` sanitize and size cap (§4e) | Phase 2 | W | §4e tests green |
| **P2** | S-12: `webglcontextlost` fallback | Phase 2 (D scenes) | D | Forced `WEBGL_lose_context` shows the fallback and restores |
| **P2** | S-11: ignore `.claude/worktrees/` and `graphify-out/` | Now | W | `git status` clean of both |
| **P2** | §4i: dependency hygiene (drop `@types/katex`, `.nvmrc`, `ignore-scripts`) and the CI outline | Phase 4 (skill extraction bakes it in); CI when hosting is decided | W | CI file reviewed by S |

**Re-open triggers (A01/A06/A07):** any sharing, import or export of lab creations, URL-encoded state, accounts, or analytics sends the design back to S *before* building. Minimum requirements then: schema validation, size caps, and no `dangerouslySetInnerHTML` on shared data.

## 6. Questions for the user

1. **Should the scaffold commit's history be scrubbed before the first push?** Commit `2c0e5ec` contains `pipeline/course.config.json` with your home-folder layout and textbook filenames (one names the site it was downloaded from). No remote exists yet, so a rewrite now affects nobody else. **Recommendation: yes.** Before adding any remote, rewrite that one file out of history (for example `git filter-repo --path pipeline/course.config.json --invert-paths`, then re-add the sanitized example). Keep a backup branch. Claude does this only with your explicit go-ahead.
2. **Will the repo itself be public, or only the built site?** **Recommendation:** keep the repo private and publish only `app/dist`. This limits exposure of the pipeline, the configs, and the docs/roles material that quotes course structure. If the repo must be public, P0 items are blocking.
3. **Hosting preference, when you decide?** **Recommendation:** Cloudflare Pages or Netlify, which honour `_headers` (real CSP with `frame-ancestors`, plus HSTS, COOP, and Permissions-Policy). GitHub Pages works but only gets the meta CSP, and its access logs belong to GitHub. Keep "no analytics" either way.

Sources (web search, 1 of 3 used): [Babylon forum: can't invoke inspector without CDN](https://forum.babylonjs.com/t/cant-invoke-inspector-without-cdn/28733), [Babylon docs: Inspector](https://doc.babylonjs.com/toolsAndResources/inspector).
