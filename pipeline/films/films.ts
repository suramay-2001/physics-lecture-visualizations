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
]
export const FILM_IDS: readonly string[] = FILMS.map((f) => f.id)
