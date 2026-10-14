# Rulings: the Papers section and the paper-lecture pipeline (judge, 2026-10-14)

First paper: Yoder et al., *Tour de gross* (IBM, arXiv:2506.03094v1, 2025; a modular architecture on bivariate
bicycle codes), source id `paper-tdg` (`pipeline/course.papers.json`; the PDF the user supplied, ingested to
the git-ignored `sources/paper-tdg/`, 68 pp., 17 figures, 10 tables, ~137 references).

## User decisions (2026-10-14)
- **Home:** a Papers section inside Spin Lab, a third entry in the course switcher.
- **The smart tool:** offline now — a pipeline that ingests a paper, follows its references and builds a lecture as
  static pages. Its UI framework is prepared now so a later "smart tool" (design discussed later) plugs in, and the
  visualizations must be executable from what ingestion produces.
- **References:** followed only as far as a step requires.
- **Prerequisites:** built out in full and linked, not summarized.
- **Budget:** up to 75 % weekly usage before the Friday 2026-10-16 reset.
- Not objected to, so taken as approved: two kinds of number (R3); two reading tracks (R1).

## Rulings
- **R1 Format.** A paper lecture uses the 709 content model: units and beats in two tracks (Ground-up ≤ 25 words a
  sentence, Formal ≤ 40), derivations with ≥ 2 views, claims with numpy twins, challenges, glossary, bridges with the
  return bar, notation cards, print/Read mode. The Papers section is lazy (its own pack; nothing in the entry closure).
- **R2 Where prerequisites live.** Course-textbook material belongs to its course: 709 gains its error-correction
  chapters from Bergou Ch 9 (codes, CSS, decoherence-free subspaces) and Ch 10 (stabilizers, Gottesman–Knill) as
  Q19 and Q20. Material no course textbook teaches (the surface code, logical measurement and lattice surgery, magic
  states, Pauli-based computation, quantum LDPC codes) becomes reusable **background chapters** inside Papers
  (`B1`, `B2`, …), shared by every later paper that needs them. Every node of a paper's prerequisite graph links to
  exactly one teaching unit (448, 709, a background chapter or the paper lecture itself).
- **R3 Two kinds of number.** *Computed* claims come from the engine with a numpy twin, as everywhere in the app.
  *Reported* claims are the paper's own simulation or table results: a new `reported` claim type carries the source id,
  the exact location (table, figure, section, page) and the value as printed, renders in a visibly distinct style, and
  the review re-reads each one against the page image. A reported value never feeds a displayed computation unless
  that computation says it uses the paper's number.
- **R4 Smart-tool-ready: a paper lecture is data.** Ingestion and planning produce a typed **paper spec**: metadata,
  the references used, the prerequisite graph, the units and beats, and **visualization recipes**. A recipe names an
  entry in an allow-listed **recipe registry** (an engine computation with typed, validated parameters, e.g. "a
  bivariate bicycle code from polynomials A, B on an l × m torus") and a stage kind with its props. The site executes
  only registered recipes; nothing generated is ever evaluated as code, and the CSP is unchanged. A later smart tool
  only has to emit specs that validate to get working, interactive visualizations.
- **R5 Reference trail.** Each beat can carry trail entries (reference, the section/page relied on, why the step needs
  it). Each paper gets a "References used" page that shows the depth each reference was followed to (1 or 2), what was
  read versus only cited, and where each idea is taught.
- **R6 Sources and downloads.** The paper is the user's own PDF. References are read online (arXiv abstract and HTML
  pages) without saving files. Any reference PDF saved to `sources/` needs the user's approval first, per batch, listed
  with file names, sources and sizes.
- **R7 Copyright.** arXiv's non-exclusive licence: paraphrase and cite; never republish text or figures; every figure is
  redrawn from engine data. `content/verbatim.test.ts` covers `sources/paper-tdg` like every other source. Cite papers by
  short title + arXiv id: a full title of 12+ words trips the verbatim guard (it did on this file).
- **R8 Pacing.** Opus for the reference crawl, plans, the platform design and reviews; Sonnet for builds, fixes and the
  engine. At most two machine-heavy agents (builds/e2e) at once; research and planning agents are light.
- **R9 Order.** Now: the reference crawl and prerequisite graph, the QEC engine, the Papers platform with the spec and
  recipe registry, and the Q19/Q20 plan. Then: background-chapter and paper-lecture plans (scoped by the crawl), new
  stage kinds, builds, one review per batch, fixes, merge gate.
