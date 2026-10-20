# Entry trim after the 448 Townsend pass (rule (l))

The first-paint closure measured 499,635 raw / 170,267 gzip against the budget 497,500 / 170,000. Now 496,026 / 168,838; the budget is unchanged.
Cause: a shared chunk keeps every export any chunk imports. Lecture-only helpers added to modules the entry imports (`spin.ts`, `polarization.ts`) rode in the entry.
Moved (no behaviour change, every function keeps its tests and numpy twin): `pathLedger`, `portProbs`, `schwarzParts`, `chainTransmission`, `plateDelta`, `circularChance`, `quarterWaveThickness`, `photonJz` to `physics/townsend448.ts` (importers: `L3/L6/L7/L8.values.ts`, `stage/svg/plot.ts`, tests); `readingOrder` to `content/readingOrder.ts` (still re-exported by `walk.ts`); `hopfRampHex`, `LAB_MATERIAL` to `stage/sceneTokens.ts`.
Rule for the next lecture agent: engine helpers that only `L*.values.ts` call go in `physics/townsend448.ts` (or a sibling), not in `spin.ts`/`sg.ts`/`polarization.ts` (the entry imports them). `Bench.merge` stays in `sg.ts` (the lab and `stage/resolve.ts` need it).
