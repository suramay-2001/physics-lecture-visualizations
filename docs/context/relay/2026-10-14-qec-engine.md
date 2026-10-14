# 2026-10-14 QEC engine

`app/src/physics/qec/` landed: GF(2) matrices (`gf2.ts`), symplectic Paulis with exact phase (`pauli.ts`), stabilizer codes (`stabilizer.ts`), CSS codes, named codes, exhaustive distances, rotated surface code, lookup decoder (`codes.ts`), the drawable-code registry (`registry.ts`), dense code words, a Gottesman-Knill tableau, bivariate bicycle codes (`bb.ts`: gross [[144,12]], two-gross [[288,12]]), overhead arithmetic, failure rates.
Numpy twin `pipeline/qec_numpy.py`, fixture `qec.json`, 22 engine-vs-twin comparisons. Card: `cards/qec-engine.md`.
Gotchas: the bicycle distance is the paper's REPORTED number (weight-d operators are upper bounds only); `physics/qec` must stay pure (`purity.test.ts`); new functions need a twin block in `make_qec_fixtures.py`.
