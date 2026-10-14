# Downloads to request — *Tour de gross* references

Role P, 2026-10-14. **A request list only** (ruling R6): nothing below has been downloaded. Each PDF needs the user's
approval, per batch, before it is saved to the git-ignored `sources/`. Every reference here was read online for the crawl
(`references.md`); the PDFs are for later re-verification by the reviews (re-reading a value against a page image) and
for references whose body is not readable online.

Sizes are the arXiv submission sizes shown on each abstract page (the source upload; the PDF can differ). Proposed
location: `sources/ref-<key>/` with the file name given, ingested later as `role: 'reference'` entries in
`pipeline/course.papers.json` (render only the pages a review needs).

## Batch 1 — needed to re-verify reported values and C←R inputs (recommended)

| # | Key | arXiv (version) | Proposed file | Size shown | Why |
|---|---|---|---|---|---|
| 1 | Fow+12 | 1208.0928 (v2) | `ref-fow12/fow12-1208.0928v2.pdf` | 2,493 KB | Body not readable online (no HTML, no ar5iv). Source of the per-cycle surface-code formula used in §2.6, A.10 and recipe R-B1-6 (note N12) |
| 2 | Lit19b | 1905.06903 (v3) | `ref-lit19b/lit19b-1905.06903v3.pdf` | 684 KB | Table 1 is the input of Table 3's distillation factories; settles note N8 (18.1 cycles vs τ̄ = 73) against the page image |
| 3 | GSJ24 | 2409.17595 (v1) | `ref-gsj24/gsj24-2409.17595v1.pdf` | 12,020 KB | Fig. 2 is copied into Table 5 (inputs of R-B4-5, R-P-21); review needs the figure page |
| 4 | Bra+24 | 2308.07915 (v2) | `ref-bra24/bra24-2308.07915v2.pdf` | 237 KB | Table 3 (code list, distances shown as reported), Table 5 (the depth-8 schedule authored into R-B2-7), Lemma 1 |
| 5 | Bev+25 (identified) | 2511.15177 (v1) | `ref-bev25/bev25-2511.15177v1.pdf` | 6,037 KB | The failure-spectrum ansatz (Eq. 10) behind Table 6; confirms the identification (open item O3) |
| 6 | Bev+22 | 2211.07629 (v1) | `ref-bev22/bev22-2211.07629v1.pdf` | 3,578 KB | App. B formula and Table 5 constants of the surface-code baseline (note N12) |

## Batch 2 — main sources of the background chapters (recommended before B1–B4 plans)

| # | Key | arXiv (version) | Proposed file | Size shown | Why |
|---|---|---|---|---|---|
| 7 | Cro+24 | 2407.18393 (v4) | `ref-cro24/cro24-2407.18393v4.pdf` | 392 KB | B3 bridges (§3.6, §3.8, Thm 24), paper §3.2 native set (§4.3) |
| 8 | WY24 | 2410.02213 (v2) | `ref-wy24/wy24-2410.02213v2.pdf` | 275 KB | B3 gauging measurement (Algorithm 1, Thms 1–4) |
| 9 | SJY24 | 2410.03628 (v4) | `ref-sjy24/sjy24-2410.03628v4.pdf` | 3,600 KB | B3 adapters and relative expansion; only the first half was read online |
| 10 | Lit19a | 1808.02892 (v3) | `ref-lit19a/lit19a-1808.02892v3.pdf` | 1,369 KB | B4 Pauli-based computation; B1/B3 tile and surgery rules |
| 11 | Hor+12 | 1111.4022 (v3) | `ref-hor12/hor12-1111.4022v3.pdf` | 3,195 KB | B3 lattice surgery (merge, split, CNOT) |
| 12 | BK05 | quant-ph/0403025 (v2) | `ref-bk05/bk05-quant-ph-0403025v2.pdf` | 35 KB | B4 magic states and 15-to-1 distillation (Eqs. 35–38) |

## Optional (read online in full or as abstracts; only if a review asks)

| # | Key | arXiv | Proposed file | Size shown | Why |
|---|---|---|---|---|---|
| 13 | Mül+25 | 2506.01779 (v2) | `ref-mul25/mul25-2506.01779v2.pdf` | 859 KB | Relay-BP internals (only the abstract was read) |
| 14 | RS16 | 1403.2975 | `ref-rs16/rs16-1403.2975.pdf` | not checked | T-count law (abstract read) |
| 15 | Kit03 | quant-ph/9707021 | `ref-kit03/kit03-quant-ph-9707021.pdf` | not checked | B1 toric code (§1 read on ar5iv) |
| 16 | Den+02 | quant-ph/0110143 | `ref-den02/den02-quant-ph-0110143.pdf` | not checked | B1 space-time picture (read on ar5iv) |
| 17 | BE21 | 2103.06309 | `ref-be21/be21-2103.06309v2.pdf` | not checked | B2 LDPC review (read in HTML) |
| 18 | Rof+20 | 2005.07016 | `ref-rof20/rof20-2005.07016v2.pdf` | not checked | B2 BP+OSD (read in HTML) |

Request count: **12 recommended** (batches 1 and 2), 6 optional.
