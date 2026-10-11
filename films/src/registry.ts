/**
 * What the render driver needs to know about each film before it renders one: its id, frame format and stage ground.
 * Each film's data module (`scenes/<film>.data.ts`) owns these; this file only gathers them. The film ids that exist are
 * also listed in `pipeline/films/films.ts` (the pipeline scripts run in Node and cannot import this Vite-side file).
 */
import * as euler from './scenes/f1-euler-limit.data'
import * as cancel from './scenes/qc-q16-cancel.data'
import * as mean from './scenes/qc-q17-mean.data'

export interface FilmInfo {
  id: string
  format: { readonly width: number; readonly height: number; readonly frames: number; readonly fps: number }
  ground: string
}

export const FILM_INFO: Record<string, FilmInfo> = Object.fromEntries(
  [
    { id: euler.FILM_ID, format: euler.FORMAT, ground: euler.COLORS.ground },
    { id: cancel.FILM_ID, format: cancel.FORMAT, ground: cancel.COLORS.ground },
    { id: mean.FILM_ID, format: mean.FORMAT, ground: mean.COLORS.ground },
  ].map((f) => [f.id, f]),
)
