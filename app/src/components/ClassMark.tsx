/**
 * The class marker (interface change W-448 #1; rulings 448-L8L11 P1): a slim rule above a beat where a class of the
 * course notes begins or resumes inside a chapter ("Class 9 starts here", or "Class 9 · from minute 23" when the
 * chapter takes up part-way through the class). Drawn the same way in Story mode (StoryStage), Read mode and print
 * (stage/StaticStory.tsx, styles/print.css), so a reader of the printed notes sees where the lecture breaks.
 * Plain text from `Beat.classMark`; it adds no step and no stage change.
 */
import type { ClassMark as ClassMarkSpec } from '../content/stage'

/** The words on the rule. */
export const classMarkText = (m: ClassMarkSpec): string => (m.from ? `Class ${m.class} · from ${m.from}` : `Class ${m.class} starts here`)

export function ClassMark({ mark }: { mark: ClassMarkSpec }) {
  return (
    <p className="class-mark" data-class-mark={mark.class}>
      <span className="class-mark-text">{classMarkText(mark)}</span>
    </p>
  )
}
