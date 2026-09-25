# Interface changes after `l1-freeze`

Frozen at the tag (W-L1 §7.1, decision #16): everything exported from `app/src/content/stage.ts`,
`content/schema.ts`, `content/walk.ts`, `stage/types.ts`, `stage/hooks.ts`, `stage/store.ts`, `ui/tex.ts`,
and the `physics/*` signatures of W-L1 §3.

- Additive, optional fields go through W (no note needed beyond the commit message).
- Anything else is an interface change: the requesting role adds an entry below, Claude judges, W applies
  it on `main`, and the other worktrees rebase.
- D's `content/stageVocab.ts` may grow at will; removing or renaming a name is a change.

| # | date | role | file / export | change requested | why | decision |
|---|---|---|---|---|---|---|
| 1 | 2026-09-25 | S | `ui/tex.ts` `renderAuthoredTexStrict` | Signature unchanged; now also **throws on any untrusted command** (`\href`, `\url`, `\includegraphics`, `\htmlId/Style/Data`, `\htmlClass` with an id failing `^term-[a-z0-9-]+$`). Applied in the S worktree (S owns tex.ts). | KaTeX renders an untrusted command as red text even with `throwOnError: true`, so the content gate would have shipped e.g. `\htmlClass{Term-spin}` as red "\htmlClass" instead of failing (W-L1 §4.1 says the content test must fail). L1 content passes unchanged. | pending (Claude) |
| 2 | 2026-09-25 | S | `ui/tex.ts` `renderUserTex` | Signature unchanged; returns the `tex-user-error` span "too large to typeset" when any length in the produced markup exceeds 40em. | KaTeX 0.18.7 clamps with `Math.min(size, maxSize)`, so negative sizes bypass `maxSize` (`\kern{-500em}`, `\raisebox{-900em}{x}`, `\rule[-500em]…`, also via `\def`). Verified; 19 cases in `tex.security.test.ts`. | pending (Claude) |
| 3 | 2026-09-25 | S | `progress.ts` (additive) | New exports `sanitize`, `PROGRESS_LIMITS`, `PROGRESS_ID`; stored state gains `v: 1`. Frozen API (`useProgress`, `progress.*`, `ChallengeRecord`) unchanged. Id rule is `^[A-Za-z0-9.:-][A-Za-z0-9._:-]{0,63}$` (no leading `_`). | S-L1 §4e's `ID` regex allowed `_`, so it did **not** reject `__proto__` as claimed; the maps are null-prototype as well. | pending (Claude) |
| 4 | 2026-09-25 | S → W1 | `App.tsx` `RouteFallback` | Add the **Reset progress** button (calls `progress.reset()`) that W-L1 §4.2 lists for the route boundary. | Last-resort recovery if a future bug crashes a render; `progress.ts` no longer can, but the button is the documented floor. | pending (Claude) |
| 5 | 2026-09-25 | S → W1/D | dist gate (`security/cdn.security.test.ts`) | Built JS may not contain any CDN host string. Importing drei `Environment`/`useEnvironment` (githack preset URL) or `useGLTF` (gstatic Draco URL) bundles such strings even when unused, so the test fails. Use `useSharedEnv()` / three's loaders directly (`useLoader(GLTFLoader, url)`), or ask S for a reasoned exception. | Brief: "no drei Environment presets / Draco CDN paths" in dist; stricter than W-L1 §4.7 ("JS hits advisory"). | pending (Claude) |
| 6 | 2026-09-25 | S → W | `package.json` (optional) | `"headers": "node build/headers.ts"` script. Not required: `node build/headers.ts` works as is; `build/csp.security.test.ts` fails on drift. | W-L1 §4.6 mentions `npm run headers`; S does not touch package.json. | pending (Claude) |
