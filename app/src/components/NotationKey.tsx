/**
 * "Notation in this chapter" (notation explainers, decisions/notation-explainers.md): at the end of every chapter, the
 * notation its text uses, in the order it first appears, each with its name, how to read it aloud and its plain meaning in
 * the reader's track. It is what stands in for the cards where there are no cards: in print, and in Read mode. On screen it
 * starts folded while cards are on and unfolded when they are off or in Read mode, and the reader can unfold or fold it;
 * in print it is always open and the button is gone (styles/notation.css). Loaded lazily with the dictionary
 * (components/LecturePage.tsx), and its own maths is not itself marked.
 */
import { useId, useMemo, useState } from 'react'
import { NOTATION_BY_ID, meaningOf } from '../content/notation'
import type { CourseId, Track } from '../content/courses'
import type { Lecture } from '../content/schema'
import { readingOrder, texSpans } from '../content/walk'
import { notationIds } from '../ui/notationMark'
import { NotationScopeContext, useNotationOn } from '../ui/notationPref'
import { useReadMode } from '../ui/readModePref'
import { Rich, Tex } from '../ui/Rich'

const OFF = { off: true } as const

/** The notation ids a chapter's text uses in a track, in order of first appearance. */
export function notationUsedIn(lecture: Lecture, track: Track, gates: boolean): string[] {
  const seen = new Set<string>()
  for (const s of readingOrder(lecture, track))
    for (const sp of texSpans(s.tex === 'display' ? `$$${s.text}$$` : s.text)) for (const id of notationIds(sp.tex, { gates })) seen.add(id)
  return [...seen]
}

export default function NotationKey({ lecture, track, course }: { lecture: Lecture; track: Track; course: CourseId }) {
  const cardsOn = useNotationOn()
  const read = useReadMode()
  const listId = useId()
  const [manual, setManual] = useState<boolean | null>(null)
  const entries = useMemo(
    () => notationUsedIn(lecture, track, course === 'qc709').flatMap((id) => NOTATION_BY_ID.get(id) ?? []),
    [lecture, track, course],
  )
  if (!entries.length) return null
  const open = manual ?? (!cardsOn || read)
  return (
    <NotationScopeContext.Provider value={OFF}>
      <section className="notation-key" id="notation-key" aria-labelledby={`${listId}-h`} data-count={entries.length}>
        <h2 id={`${listId}-h`}>Notation in this chapter</h2>
        <p className="nk-lede">
          The symbols this chapter uses, in the order they first appear, with what each one means.
          {cardsOn ? ' With “Explain notation” on, each also opens a card where it is used.' : ''}
        </p>
        <button type="button" className="nk-toggle" aria-expanded={open} aria-controls={listId} onClick={() => setManual(!open)}>
          {open ? 'Hide the list' : `Show the list (${entries.length})`}
        </button>
        <ul id={listId} hidden={!open}>
          {entries.map((e) => (
            <li key={e.id} data-notation-key={e.id}>
              <span className="nk-sym">
                <Tex>{e.tex}</Tex>
              </span>
              <span>
                <span className="nk-name">{e.name}</span> <span className="nk-say">— read “{e.say}”</span>
              </span>
              <span className="nk-meaning">
                <Rich as="span" text={meaningOf(e, track)} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </NotationScopeContext.Provider>
  )
}
