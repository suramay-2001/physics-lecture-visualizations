/**
 * The films the pipeline knows (one Motion Canvas project each: films/src/projects/<film>.ts), shared by render.ts,
 * check_manifest.ts and publish.sh. The Vite-side list the render driver reads is films/src/registry.ts.
 *
 *   publish: where `sh pipeline/films/encode.sh` puts the encoded frames for a film the app plays (a chapter's
 *            `Unit.opener`, captions in app/src/openers/openerCopy.ts), under app/public; null for a film that is
 *            rendered and checked but not wired into the app yet.
 *   poster:  the frame that carries the idea alone (shown under reduced motion and on narrow screens).
 */
export interface FilmEntry {
  id: string
  poster: number | 'last'
  publish: string | null
}

export const FILMS: readonly FilmEntry[] = [
  { id: 'f1-euler-limit', poster: 'last', publish: null },
  // Q16 unit 16.2: after the last Hadamards on the balanced f, the all-zeros column is empty (the signs cancelled)
  { id: 'qc-q16-cancel', poster: 79, publish: 'app/public/films/qc709/qc-q16-cancel' },
  // Q17 unit 17.4: after the first inversion about the mean, each bar has crossed the dashed line along its link
  { id: 'qc-q17-mean', poster: 71, publish: 'app/public/films/qc709/qc-q17-mean' },
  // Q19 unit 19.5: after four steps of the star walk the marked spoke holds the chance two Grover steps give
  { id: 'qc-q19-walker', poster: 79, publish: 'app/public/films/qc709/qc-q19-walker' },
  // Q20 unit 20.2: at 30° of program angle the two copies are equally good
  { id: 'qc-q20-cloner', poster: 79, publish: 'app/public/films/qc709/qc-q20-cloner' },
  // Q23 unit 23.6: the Holevo quantity stays above what the best reading gets for every overlap between 0 and 1
  { id: 'qc-q23-holevo-gap', poster: 79, publish: 'app/public/films/qc709/qc-q23-holevo-gap' },
  // Q26 unit 26.3: at a balanced splitter two photons that cannot be told apart never leave by different exits
  { id: 'qc-q26-hom', poster: 79, publish: 'app/public/films/qc709/qc-q26-hom' },
  // Q25 unit 25.3: with a strong blockade the three-pulse gate is nearly ideal
  { id: 'qc-q25-blockade', poster: 119, publish: 'app/public/films/qc709/qc-q25-blockade' },
]
export const FILM_IDS: readonly string[] = FILMS.map((f) => f.id)
