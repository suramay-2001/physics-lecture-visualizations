/**
 * The shared description of a Physics 709 "plot film": what a film's data module (`scenes/<film>.data.ts`) hands to the shared scene
 * (`kitScene.tsx`). A film draws three kinds of thing, all in ENGINE units (u, v) that a view maps to canvas pixels:
 *   - guides: static polylines (an axis, a bound, the Bloch circle),
 *   - line series: a polyline of engine samples that is revealed up to a sample index, one stage after another, with a tip dot,
 *   - bar / tick series: bars (or short horizontal rungs) whose heights glide from one stage's engine values to the next.
 * The scene computes nothing physical: every point and height in a spec comes from the engine in the film's data module. Pure TS (no Motion Canvas import).
 */
export type Pt = readonly [number, number]

/** engine (u, v) → canvas (x, y): x = ox + sx·u, y = oy − sy·v (canvas y points down; the origin is the frame's centre) */
export interface View {
  ox: number
  oy: number
  sx: number
  sy: number
}

export interface Guide {
  id: string
  view: string
  pts: Pt[]
  dash?: boolean
  width?: number
  /** colour token name from the film's COLORS */
  color: string
}

export interface LineSeries {
  kind: 'line'
  id: string
  view: string
  color: string
  width: number
  dash?: boolean
  /** every engine sample, in order; a stage reveals a prefix of them */
  pts: Pt[]
  /** a dot at the revealed end (its radius in px) */
  tip?: number
}

export interface BarSeries {
  /** 'bars' stand on the baseline v = 0; 'ticks' are short horizontal rungs at height v */
  kind: 'bars' | 'ticks'
  id: string
  view: string
  color: string
  /** colour of a negative bar (default: the same) */
  negColor?: string
  /** bar width, or a rung's thickness (px) */
  width: number
  /** a rung's full length (px; ticks only) */
  length?: number
  opacity?: number
  /** the u of each bar */
  xs: number[]
}
export type Series = LineSeries | BarSeries

export interface FilmStage {
  id: string
  /** the one label on screen while the stage is current (words only: no number is lettered) */
  label: string
  kind: string
  from: number
  tween: number
  to: number
  /** per line series: the index of the last revealed sample at the end of the stage */
  upTo: Record<string, number>
  /** per bar series: the heights the stage ends on */
  heights: Record<string, number[]>
}

/** A named number read back from the drawn nodes at a stage (what a caption or a plan quotes). */
export interface FilmKey {
  name: string
  stage: string
  /** a line series: the drawn tip's v (comp 1, default) or u (comp 0) */
  line?: string
  comp?: 0 | 1
  /** a bar series: the drawn height of bar `index` */
  bars?: string
  index?: number
}

export interface FilmSpec {
  id: string
  format: { readonly width: number; readonly height: number; readonly frames: number; readonly fps: number }
  colors: Record<string, string> & { ground: string; label: string }
  views: Record<string, View>
  guides: Guide[]
  series: Series[]
  stages: FilmStage[]
  keys: FilmKey[]
  /** the stage name's place: left edge x and baseline y of the label (canvas px) */
  labelAt: { x: number; y: number }
}
