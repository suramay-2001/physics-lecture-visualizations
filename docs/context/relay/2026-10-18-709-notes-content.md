# 709 notes content N1–N11 (builder C)

N1–N7 are short, N8–N11 full companions in `app/src/content/qc709/notes/`. Only N1 keeps an own key (`n1UpAfterX`, twin `n1.py`): the mutation tests in `notes.test.ts` name it. Every other number cites a chapter key (W12).
Lint gotchas: the number reader skips a decimal that ends a sentence and drops signs (cite `q10Tsirelson`, `q12E30`, not negative keys); an open `$…$` span fails TeX; `verbatim.test.ts` catches echoed source runs; words like qubit, mixture, orthogonal need a `[[gloss]]` at first use.
`e2e/notes.spec.ts` N1 asserts the new sections. No `plot` series fits the α-family, so N10 uses matrix and two-qubit figures.
