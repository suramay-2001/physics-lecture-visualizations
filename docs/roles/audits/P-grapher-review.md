# P truth review — the Grapher bench (2026-09-28)

Independent, read-only review of the merged Grapher (merge 5a5620b). **Verdict: FIX-FIRST.**

**What is right:**
- All readouts in the four screenshot states (recomputed in numpy from kets and Pauli matrices).
- The Try-this physics: ΔSxΔSy = ¼√((1−rx²)(1−ry²)), the bound |cos θ|/4, and f² − g² = rx²ry²/16. So f = g exactly on the xz and yz great circles, and the solid is never below the wire (20 000 random states, smallest gap −6e-17).
- The Bloch-path map and probabilities, the gap fuzz, no throw into React, and the preset allowlist.

Paths are under `app/src/lab/benches/grapher/` unless stated.

## Blocking
1. **The parser grammar vs the help text (GrapherBench.tsx:386–387): typed input silently becomes a different graph.**
   - `x^2 3` reads as x²³: at 0.3 it gives 9.4e-13, not 0.27.
   - `2 3` reads as 23.
   - `sin 2x` reads as sin(2)·x, and `cos pi t` as −t.

   The cause: `physics/expr.ts` deletes whitespace between digits (l.223), and a function takes the next atom only
   (l.308–312).
   **Fix, in grapher mode only (answers keep their exact old semantics):**
   - Separate numbers on whitespace, or make "number space number" an error.
   - Make a function whose bare argument is a number or constant followed by an implicit product an error at that
     caret: "Write sin(2x) or sin(2)·x". `sin x cos y` must still work.
   - Correct the help text and add tests.
2. **The count shows grid coincidences only (model.ts:822; saddle note l.950).** The note says "they meet where
   x² − y² = a", yet at a = 0.51 the readout says "f = g at no sample". **Fix:** `touchStats` also counts cells where
   f − g changes sign, worded "f = g exactly at K samples; the layers cross in C cells". The 445 in the Try-this
   answer stays.

## Should-fix
3. **The equality tolerance is effectively absolute (model.ts:387, 393).**
   - f = 1e-13·x against g = 0 shows "f = g at 2401 of 2401".
   - f = 1e-50·x underflows in float32 and shows "f is constant: 0".

   **Fix:** use EQUAL_REL·max(|f|, |g|, S), with S the largest drawn |value| in either layer; take min/max from float64.
4. **P(+z) = 0 is printed for 4e-4 (model.ts:797, 855).** Print "< 0.001" / "> 0.999" at the ends.
5. **The θ-outside-range note is incomplete (model.ts:854, fidelity.ts:65).**
   - It gives only the polar angle: at θ = 3π/2, φ = 0 the bead is at |−x⟩, so its azimuth is φ + 180°.
   - θ = t/13 on [0, 13π] ends at π + 4e-16 and wrongly shows "outside".

   **Fix:** print the point's own (acos r_z, atan2(r_y, r_x)) with a 1e-12 tolerance, and at a pole say φ has no
   effect.
6. **fidelity.ts:30:** "Each axis is fitted to the box separately" is false with "equal scale" ticked. Say "Unless
   'equal scale' is ticked, …".
7. **Curve ranges skip the float-residue rule (model.ts:838).**
   - sin t on [π, 2π] reads "to 1.225e-16"; the born preset prints 3.749e-33.
   - At 200 samples t = π is never sampled (l.970), so P(+z) reads "from 0.00006231".

   **Fix:** apply labels.ts:29–32; use 201 samples; say that from…to is taken over the samples.
8. **A stale preset note (GrapherBench.tsx:198, 279–283).** After `?preset=uncertainty`, clicking Helix still shows
   the uncertainty note above a helix. **Fix:** show the note only while `p.preset === presetId`.
9. **Predict-first leak: the bench opens on the Try-this (model.ts:995).** The readouts already say "f < g at no
   sample" and "f = g at 445 of 4225", answering the question before the student starts. **Fix:** hide the touch and
   below lines until the student opens "compare layers", or ask only "where do they touch?".
10. **Labels on the bead (labels.ts:37–38; Bloch shots).** "ψ(t)" and "|−x⟩" overlap. **Fix:** within 10° of a pole,
    hide the pole label and write "ψ(t) = |−x⟩".
11. **Ramp contrast (model.ts:506).** Its low end (L* 36) is 1.85:1 on the box floor and about 2.3:1 on the Bloch
    stage; WCAG 1.4.11 asks 3:1. **Fix:** use L* 50–88.

## Nits
12. **Live regions (GrapherBench.tsx:210, 423).**
    - `role="alert"` re-announces on every keystroke.
    - Paper readouts stay polite during drags; mirror the stage's `dragging ? 'off'`.
13. **GrapherBench.tsx:520:** "Shade is height" shows even when only the wire is drawn.
14. **model.ts:1006:** "as the uncertainty relation says". The relation gives ≥, and strict inequality comes from
    rx·ry ≠ 0. Add "saturated on the xz and yz great circles".
15. **Default shot (grapherScene.ts:90–92).**
    - At elevation 22° the underside reads as the top.
    - Dark "spikes" are the floor seen under the arches.
    - The wire z-fights on the back wall.

    **Fix:** raise the elevation or darken back faces, and note "the wire is drawn on top where the layers are within
    a hair".
16. **1440 surface shot:** the "each axis fitted…" chip wraps over the box's top-right corner.
17. **model.ts:116:** the range's unknown-name reason should mention functions (`sqrt(2)` works).
