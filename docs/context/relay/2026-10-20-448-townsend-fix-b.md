# 448 Townsend fix B (L5-L8, L11-L13)

Review B (`docs/roles/audits/P-448-townsend-B-review.md`) is fixed in full; the table is its "R fixes" section.
Keys removed: `l11TAmmFreqGHz`, `l11TAmmPeriodPs`, `l11TAmmEnergyUeV` (T4: the ammonia line is in words only). Added: `l7PEquatorRx/Ry`, `l13PrStepT/R`. Values changed with their twins: `l6PRyX`, `l6PChanceY`, `l7PEquatorProduct`.
Gotchas: a practice question must not reuse a beat's own number (T1); a hint or walkthrough that uses a new TeX symbol needs a `symbols` map entry in the lecture file (`\hat J_n` in `L7.ts`); a `townsend` practice question names its problem in `refs` (`l11-pr-eig` is Problem 2.23(b)); `g-factor` has one glossary entry.
Not done: N5 (vary the apparatus), the untracked generated packs.
