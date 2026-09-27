# films: Motion Canvas films for Physics 709

These films are drawn from the app's physics engine and scrubbed by `app/src/openers/OpenerScrub.tsx`.
The package is separate: `app/` never imports it, and Motion Canvas never enters the app bundle (W-709-platform §E).

## The rule
- A scene imports the engine directly: `app/src/physics/**` by relative path, and the palette from
  `app/src/stage/tokens.ts`. The scene types no physics number by hand.
- The scene records every number it draws in a manifest, read back from the drawn nodes (`src/manifest.ts`).
- `pipeline/films/check_manifest.ts` recomputes each of those numbers with the engine and fails on a mismatch.
- A film states no result. Its captions (added later, in the course pack) carry the claims.

## Commands (from the repo root)
```sh
npm --prefix films ci --ignore-scripts                 # install (scripts are never run)
node pipeline/films/render.ts                          # PNGs → films/output/png/f1-euler-limit/, manifest, timings
node pipeline/films/check_manifest.ts --self-test      # recompute every drawn number with the engine
sh pipeline/films/encode.sh f1-euler-limit [poster|last] # → films/output/webp/f1-euler-limit/0000–0119.webp + poster.webp
```
`films/output/` is git-ignored: everything in it can be regenerated.

## How rendering is driven
Motion Canvas 3.17.2 has no command-line renderer (`@motion-canvas/cli` does not exist), so rendering goes through
a browser:
1. `render.ts` starts this package's Vite server in-process.
2. It opens `/` in the installed Chrome, using Playwright with `channel: 'chrome'`, headless. Playwright is borrowed
   from `app/node_modules`; no browser is ever downloaded.
3. The vite plugin's `editor` option points at `render/driver.ts` instead of `@motion-canvas/ui`. The driver runs
   Motion Canvas's own `Renderer` with its PNG image-sequence exporter.
4. The exporter sends each frame over Vite's HMR socket to the plugin, which writes the file.
5. When the render finishes, the driver sends the manifest to a small plugin (`films:manifest`, in `vite.config.ts`),
   which writes it to `output/<film>/manifest.json`.
6. `makeScene2D` asks the editor to load the 2D inspector (`@motion-canvas/2d/editor`). That inspector is editor UI
   and needs `@motion-canvas/ui`, so it is aliased to `render/no-editor-plugin.ts`, which returns null.

## Pinned dependencies (exact)
| package | version | license |
|---|---|---|
| @motion-canvas/core | 3.17.2 | MIT |
| @motion-canvas/2d | 3.17.2 | MIT |
| @motion-canvas/vite-plugin | 3.17.2 | MIT |
| vite | 8.3.1 | MIT |

Not installed:
- `@motion-canvas/ui`: the render driver replaces the editor.
- `@motion-canvas/ffmpeg`: the output is image frames, not video.
- Playwright: borrowed from the app, as above.

## Overrides and why (approved by the judge, 2026-09-28)
1. **`"@motion-canvas/vite-plugin": { "vite": "$vite" }`: Vite 8 outside the plugin's declared peer range.**
   - The plugin declares `vite: 4.x || 5.x`.
   - Vite 5 pulls in esbuild 0.21.5, which has a real `postinstall` script (`node install.js`). It also carries
     esbuild's dev-server advisory GHSA-67mh-4wv8-2f99 (moderate), which has no fix on Vite 5.
   - Vite 8.3.1 needs no esbuild, and it matches the app's Vite (8.3.0).
   - Under Vite 8 the spike verified: `?project` / `?scene` loading, `.meta` files, the HMR exporter socket, and
     120 frames rendered deterministically.
   - Two Vite 8 gaps had to be covered in `vite.config.ts`:
     - The plugin's `esbuild` JSX option is ignored (Vite prints a warning), so `oxc.jsx` is set in its place.
     - The dependency scanner does not follow `?scene` imports. On a cold cache, 2d was bundled in a second pass,
       which gave the scene its own copy of core and the render failed. `optimizeDeps.include` lists core and 2d
       so both are bundled in one pass.
2. **`"@xmldom/xmldom": "0.9.12"`.**
   - The chain is `@motion-canvas/2d` → mathjax-full 3.2.2 → speech-rule-engine 4.1.4, which pins
     `@xmldom/xmldom` 0.9.10 exactly.
   - 0.9.10 has 13 advisories: high-severity XML injection through serialization, plus several ReDoS and
     quadratic-time parsing issues (GHSA-6gmq-8vp8-gcm6 and others). All are fixed in the 0.9.12 patch release.
   - The films never render LaTeX, but the code is installed, so it is patched.

## Install audit (2026-09-28, installed tree)
- Installed with `npm install --ignore-scripts` (which created the lockfile), then `npm ci --ignore-scripts`.
- 70 packages installed. The lockfile has 94 entries, including optional platform binaries for other platforms,
  which are not installed.
- Install scripts: `npm query ':attr(scripts, [postinstall]), :attr(scripts, [install]), :attr(scripts, [preinstall])'`
  returns `[]`, and a scan of every installed `package.json` finds none. There is no `binding.gyp` anywhere.
- The lockfile's `hasInstallScript` flag on fsevents 2.3.3 comes from registry metadata. The published
  `package.json` has no install script, and the package ships a prebuilt `fsevents.node` (identical to the copy in
  `app/node_modules`).
- `npm audit`: 0 vulnerabilities.
- Licenses:

  | license | packages |
  |---|---|
  | MIT | 57 |
  | Apache-2.0 | 5: mathjax-full, mhchemparser, mj-context-menu, speech-rule-engine, detect-libc |
  | ISC | 3 |
  | BSD-3-Clause | 2: source-map, source-map-js |
  | BSD-3-Clause AND Apache-2.0 | 1: chroma-js |
  | MPL-2.0 | 2: lightningcss and lightningcss-darwin-arm64, Vite 8's CSS tooling, the same as in the app's Vite 8 |

  The MPL-2.0 packages are build tools only: used unmodified and never shipped.

## Frame format
The same as the Blender openers:
- 1080 × 1350, RGB WebP at quality 80, named `0000.webp` … `0119.webp`, plus `poster.webp` (a copy of one frame).
- `encode.sh` uses `cwebp` (Homebrew libwebp) with `-noalpha -metadata none` and also copies `manifest.json` next
  to the frames.

The frame rate (32) is nominal, because the film is scrubbed by scroll. A power of two keeps every frame time exact
in binary, so each beat starts on its planned frame. The manifest check tests this.
