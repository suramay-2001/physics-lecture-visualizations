# Pattern: a two-track beat

Real example, `app/src/content/qc709/F1.story.ts` (chapter F1, unit `f1-euler`), lightly trimmed:

```ts
{
  id: 'f1-euler:b3',
  phase: 'core',
  text: `Grow 1 by ${pct(V.f1Rate1)} in one step: 2. By ${pct(V.f1Rate2)} twice: ` +
    `$${d(V.f1Step2, 1)}^2 = ${d(V.f1Grow2, 2)}$. With $n$ steps of $1/n$ each, ` +
    `$(1 + 1/n)^n$ settles near [[qc-e|$e$]] $\\approx ${d(V.f1E)}$ as $n$ grows.`,
  formal:
    'Define [[qc-e|$e$]] $= \\lim_{n\\to\\infty}(1 + 1/n)^n \\approx ' +
    `${d(V.f1E, 5)}$, and more generally $e^x = \\lim_{n\\to\\infty}(1 + x/n)^n$. ` +
    'This definition uses only products, so it makes sense for complex $x$.',
  caption: `$(1 + 1/n)^n$: 2, ${d(V.f1Grow2, 2)}, …, ${d(V.f1E1000)} at $n$ = 1000`,
  captionFormal: `$n = 1000$: ${d(V.f1E1000, 4)}; the limit is ${d(V.f1E, 5)}`,
  stage: cp({ line: true, euler: { rate: 'real', x: 1, n: sweep(1, 64) } }),
  claims: [
    claim('f1Rate1', 'one step of 1/1 grows by 100 %', () => close(V.f1Rate1, 1)),
    claim('f1Grow2', '1.5² = 2.25', () => close(V.f1Grow2, 2.25)),
    C.e, // a claim shared across beats — see claim-and-numpy-twin.md
  ],
},
```

## What to notice

- **`phase: 'core'`** — this is an F (Foundations) chapter with no lecture notes of its own, so it uses `'core'`
  ("The foundation") instead of `'lecture'`. A Q chapter (real 709 lecture notes) uses `'lecture'` here instead.
- **`text` (Ground-up) vs `formal` (Formal)** are two independent strings, not a template of one derived from the
  other. Ground-up interpolates the same `V` values but explains the arithmetic in words ("grow 1 by 100% in one
  step"); Formal states the definition directly with full notation.
- **`caption` / `captionFormal`** are two more independent strings — a caption in one track must never
  contradict the *other* track's stage or text (`P-F1-review.md` item 7 caught exactly this: a Formal caption
  describing a different calculation than what the shared stage actually drew).
- **Every number is `${…}` from `V`, formatted by `d()`/`pct()`/`tf()`/`uf()`, never a bare literal.** A raw
  `${V.f1E1000}` would print with 15+ decimal digits and fail a raw-float test; `d(V.f1E1000)` rounds to the
  content's display precision.
- **`stage` is shared** — one `cp({...})` (complex-plane state) drives both tracks' pictures. Tracks never get
  their own stage state.
- **`claims`** back every number that appears in *either* track's `text`/`formal`/`caption`/`captionFormal` for
  this beat — one claim list serves both tracks, checked per track by `claims.test.ts`.
- **`[[qc-e|$e$]]`** is the gloss-term syntax; it must be introduced in *both* tracks before or at this beat (a
  per-track symbol-before-use lint checks this independently for Ground-up and Formal).

## Single-track (448) equivalent

A 448 beat (`L2.story.ts`, `L3.story.ts`, …) has no `formal`/`captionFormal`/`derivation.formal` — just `text`,
`caption`, `stage`, `claims`, and `phase: 'lecture' | 'books' | 'clue'` (no `'core'`, since every 448 lecture has
real lecture notes behind it).
