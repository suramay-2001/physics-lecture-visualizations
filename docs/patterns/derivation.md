# Pattern: a derivation (`{result, ground[], formal[]}`)

Real example, `app/src/content/qc709/F1.story.ts` (unit `f1-plane`, beat `f1-plane:b5`, proving $zz^* = |z|^2$):

```ts
derivation: {
  result: 'zz^* = |z|^2',
  ground: [
    { tex: '(a + bi)(a - bi) = a\\cdot a - a\\cdot bi + bi\\cdot a - bi\\cdot bi',
      why: 'Multiply each part of the first bracket by each part of the second.' },
    { tex: '= a^2 - abi + abi - b^2 i^2',
      why: 'Tidy each product; $a$ and $b$ are ordinary numbers, so their order does not matter.' },
    { tex: '= a^2 - b^2 i^2',
      why: 'The two middle terms are equal and opposite, so they cancel.' },
    { tex: '= a^2 + b^2',
      why: 'Replace $i^2$ by $-1$, which turns $-b^2 i^2$ into $+b^2$.' },
    { tex: 'zz^* = |z|^2',
      why: 'By Pythagoras, $a^2 + b^2$ is the squared distance of $z$ from zero.' },
  ],
  formal: [
    { tex: 'zz^* = (a + bi)(a - bi) = a^2 + b^2',
      why: 'Distributivity and $i^2 = -1$.' },
    { tex: 'a^2 + b^2 = |z|^2',
      why: 'The squared modulus (Axler, p. 121); so $zz^*$ is real and never negative.' },
  ],
},
```

## Rules this must satisfy (`content.test.tsx`; the Formal ones are 709 only)

- **`ground.length >= formal.length`** — here 5 vs 2. Ground-up never skips an algebra step Formal is allowed to
  take for granted (FOIL-then-tidy-then-substitute-then-interpret, four steps, vs. "distributivity and
  $i^2=-1$" in one).
- **The last `tex` of each list ends on `result`'s right-hand side** — both lists' final line is literally
  `zz^* = |z|^2` (or its RHS).
- **Every `why` is one plain sentence**, never a bare citation or a repeated formula. It answers "why is this
  step allowed", not "what does this step say" (the `tex` already says that).
- A step may carry its own `claims?: Claim[]` when it states a number that needs independent backing (see the
  Euler-limit derivation in `F1.story.ts` `f1-euler:b4`, where the size-shrinking step embeds three claims
  computing $(1+\pi^2/n^2)^{n/2}$ at $n=10,100,1000$ directly inside the `DerivStep`).

## Rendering

`components/Derivation.tsx` steps through `ground` or `formal` depending on the active track (`pickTrack`); all
lines render at rest by default with a "step through" control, is keyboard-accessible, and takes no animation
under reduced motion.

## Derivations drive the stage (W-709 #11)

Add `view?: StageState` (and `viewCaption?: string`) to a step when its line should move the picture. Real
example, `app/src/content/qc709/__fixtures__/demoChapter.ts` unit `q0-demo-sphere`, beat `q0-demo-sphere:b3`:

```ts
derivation: {
  result: 'P(0) = \\tfrac12',
  ground: [
    {
      why: 'Write the equator state as a column of two numbers. …',
      tex: '|{+x}\\rangle = \\begin{pmatrix} 1/\\sqrt2 \\\\ 1/\\sqrt2 \\end{pmatrix}',
      view: { kind: 'bloch', state: '+x', shot: 'B-STD' },
      viewCaption: 'The state, before any measurement axis is drawn.',
    },
    {
      why: 'The chance of reading 0 is the top number, squared.',
      tex: 'P(0) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2',
      view: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' },
      viewCaption: 'Measuring along z picks out the top number.',
    },
    // this line has no `view`: it inherits the one above (the "measure: z" picture)
    { why: 'A square root times itself gives back what was under it, so this is one over two.', tex: '…' },
  ],
  formal: [ /* its own two views, same idea — ground and formal each carry their own list */ ],
},
```

- **The view's kind must already be used elsewhere on this unit's stage** (here, `q0-demo-sphere`'s beats are all
  `bloch`) — `content.test.tsx` checks it, and it is also what lets the Driver draw it: the kind is already
  registered for the unit, so a derivation never needs its own view registration.
- **≥ 2 distinct views per track** (the lint): a derivation whose picture never changes does not need the
  structured `view` field at all — just leave it off every step.
- **Story mode:** stepping or (at rest) focusing/clicking a line moves the stage there; leaving the beat or
  pressing "Show all" returns it to the beat's own `stage`.
- **Read mode / print:** a `FigureFor` strip after the derivation, one per distinct view, lettered onto the
  beat's own figure number ("Fig. Q0.3a", "Fig. Q0.3b"), captioned with the lines it covers ("lines 2–3"). It
  replaces the beat's own single figure (`stage/figures/FigureFor.tsx` `totalFigureCount`), since the strip
  already shows every picture the beat has.

## Single-track (448) equivalent (W-448 #3)

A one-track course writes the structured form too, when a result is worth stepping through (Lectures 8-11 do):
`derivation: { result, ground: [...] }`, with **no `formal` list**. `Derivation.formal` is optional in the type;
`content.test.tsx` `derivationProblems` requires it in a two-track course (709, unchanged) and rejects it in a
one-track one (it would never be shown, and a copy of `ground` would only drift). What the one track keeps:

- the last `tex` of `ground` ends on `result`'s right-hand side, every `why` is one plain sentence (25 words);
- **at least two distinct `view`s** (`derivationViewProblems`, W-709 #11, brief item 7), each valid, each of a kind the
  unit's own stage already shows, the last usually matching the beat's resting stage;
- claims on any step that states a number, exactly as in 709.

Read `ground` or `formal` through `content/track.ts` `derivSteps(d, track)` / `derivationSteps(beat, track)`: a track
with no list of its own reads Ground-up's, as `pickTrack` does for text. Worked example:
`content/__fixtures__/demoPlatform.ts` `demo-platform:b3` (`#/dev/lecture/demo-platform`).
