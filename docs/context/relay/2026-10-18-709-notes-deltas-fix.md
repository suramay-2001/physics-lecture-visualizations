# 2026-10-18: fix pass for the 709 notes deltas (Q8, Q9, Q10, Q12; plus one Q1 cite)

Applied all 32 items of `docs/roles/audits/P-709-notes-deltas-review.md` (table "R fixes" in that file). Content only; no platform change.

- Q12: CHSH now ranks between the first three tests and the entropy test; PPT and C are exact on two qubits. concurrence:b2 no longer uses Wootters symbols before b6.
- Q10: Formal states the anticorrelation premise; bell:b3 views show the four labels where the bracket is 2.
- New claim keys with twins: `q10FamAlpha/Beta`, `q12ProdAAmp0/1`, `q12LamDiag0/1`. Meaning changed with twin: `q10SepConvexGap`, `q12FamLamTie`.
- Gotcha: every printed decimal needs a claim value, and `p_n`, `\theta` and `F_{\text{coh}}` fail the symbol lint in outcomes and unseen beats.
