# Rulings: Papers B3 "Measuring logical operators: from lattice surgery to gauging" and B4 "Magic states and Pauli-based computation" (judge, 2026-10-14)

Plans: `docs/roles/proposals/P-B3-story.md` (5 units, 25 beats, 8 recipes), `P-B4-story.md` (6 units, 33 beats, 11
recipes); numpy 157 checks, 0 failed; no numeric source errors.

- R1 **`reported` may cite a reference**, not only the paper: `source` is the paper id or a key from that paper's
  reference list, and the validator rejects a key the list does not have (same as `papers-P1.md` R5). The platform change
  lands with the first build that needs it (B1).
- R2 **Notation clashes** go into Rosetta lines, once each: Litinski's "π/4" and "π/8" rotations are the paper's
  P(−π/2) and P(−π/4) (B4 `b4-pbc`); Bravyi–Kitaev's "T-type" magic state is not T|+⟩, which they call H-type
  (B4 `b4-injection`). P1 uses the paper's own convention throughout and links to those lines.
- R3 **Teaching examples of our own** (the patch–Steane adapter with n′ = 23, k 2 → 1, d = 3; the CNOT from three
  measurements with chance 1/8 per outcome triple; the deformed-distance family against the Cheeger constant; the
  15-gate Toffoli compiling to 7 commuting rotations) are allowed, labelled as our examples (never attributed to a
  reference), computed by the engine with numpy twins. Each states only what it shows: e.g. "on this small family the
  bound is met", never a general theorem. The review checks that framing.
- R4 **Bloch marks** for the Clifford orbit of T|+⟩: use what `bloch` already draws; if it cannot show up to 24 marked
  points, the stage-kind agent adds a minimal `marks` list (engine positions, no labels beyond an index); if that is too
  heavy, B4 falls back to the `plot` kind as a scatter of Bloch coordinates with the caption saying so.
- R5 **Bridges inside Papers** (B↔B, B↔P1) use the same bridge + return-bar mechanism as 448/709; the B1 build adds the
  Papers bridge registry if it is missing.
- R6 **Order.** B3 and B4 are built after Q22 (their bridge targets) and after B1/B2; each build verifies every bridge id.
  Stage contracts (`surgery-graph`, `pauli-program`, the `spacetime` readout mode, the `code`/`bloch`/`plot` extensions) go
  to the same stage-kind agent as `papers-B1B2.md` R8. Engine additions are built inside the B3/B4 builds with numpy twins.
