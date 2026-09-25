# Round 3 — targeted fixes found while judging Round 2

Each item goes back to its owning role after all Round-2 branches are merged.

| # | Owner | Fix | Evidence |
|---|---|---|---|
| 1 | S | `cdn.security` / `csp.security` read the built `dist/`; detect a stale build (dist older than src or missing CSP meta) and fail with "run `npm run build` first" instead of a misleading assertion. | Right after merging S, 6 tests failed on a stale `dist/` and passed after `vite build` (2026-09-25). |
| 2 | P | `L1.ts` `l1-quantized.books` MIT 8.05 ref says Zwiebach explains "a uniform field only twists the moment". His notes (Ch. "Spin one-half, bras, kets, and operators", §1) give F ≃ ∇(μ·B) ≈ μ_z ∂B_z/∂z but never mention torque or a uniform field. Keep the physics sentence in our own voice, attribute only the force formula to MIT. | Judge read the MIT notes PDF: "torque" 0 hits, "uniform" 0 hits; "∇(µzBz) = µz∇Bz" present. |
| 3 | P | P1 #19 is resolved: the MIT notes do run SG machines in series incl. z → x(−) → z (L1.ts `l1-sequential.books` claim is supported). No change needed; close the item. | Same PDF, "SG apparatus in series … third configuration". |
| 4 | W1 | `content/walk.ts` `texSymbols` ReDoS (exponential backtracking on ⟨σₙ⟩…) — approved interface change, sent to W1 mid-build; verify fix + adversarial-input timing test at merge. | P's interface-change entry; vitest over L1 hung > 120 s. |
