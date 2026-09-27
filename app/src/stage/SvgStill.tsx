/**
 * The reading version's picture of an SVG kind (content/stage.ts KIND_RENDER 'svg'): the same scene component the live
 * stage draws, in the stage palette, at the end of the beat's hold (s = 1, as the print figure). StaticStory shows it
 * under a beat whose picture changed, so a narrow screen, Read mode or a page without WebGL still sees the SVG kinds
 * drawn from the engine: no 2D-widget fallback is needed (stage/staticWidgets.ts). Hidden in print, where the numbered
 * figure (the same scene in print ink) takes its place. Three-free; the kinds must have loaded (LecturePage waits).
 */
import type { StageLayout } from '../content/stage'
import { isSvgKind, layoutStates, passportOf } from '../content/stage'
import type { CourseId } from '../content/courses'
import { resolve } from './resolve'
import { svgKindDef } from './svgKinds'
import { STAGE_BG, stageCssVars } from './tokens'

export function SvgStill({ layout, course }: { layout: StageLayout; course?: CourseId }) {
  const states = layoutStates(layout).filter((s) => isSvgKind(s.kind))
  if (!states.length || states.some((s) => !svgKindDef(s.kind))) return null
  return (
    <div className="svg-still" style={stageCssVars(states[0].kind) as React.CSSProperties} data-kinds={states.map((s) => s.kind).join(' ')}>
      <div className="svg-still-row">
        {states.map((st, i) => {
          const def = svgKindDef(st.kind)!
          const r = resolve(st, 1)
          const { w, h } = def.print
          const text = def.readouts(r as never).map((x) => x.text)
          const title = passportOf(st, course).title.replace(/\$([^$]*)\$/g, '$1')
          return (
            <svg key={i} className="svgk svgk-stage" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={[title, ...text].join('; ')}>
              <rect x={0} y={0} width={w} height={h} fill={STAGE_BG[st.kind]} />
              <def.Scene state={r as never} mode="stage" width={w} height={h} />
            </svg>
          )
        })}
      </div>
    </div>
  )
}
