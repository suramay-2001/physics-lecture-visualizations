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

## Rules this must satisfy (`content.test.tsx`, 709 only)

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

## Single-track (448) equivalent

448 beats generally state a derivation inline in `text`/`caption` rather than as a structured `derivation`
object — the structured form exists specifically to support Formal's more compressed, notation-heavy steps
alongside Ground-up's fully spelled-out ones. A single-track course has no `formal` list to keep in sync, so it
rarely needs the structured type at all.
