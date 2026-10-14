/**
 * "Notation in this chapter" (notation explainers, decisions/notation-explainers.md): at the end of every chapter, the
 * notation its text uses, in the order it first appears, each with its name, how to read it aloud and its plain meaning in
 * the reader's track. It is what stands in for the cards where there are no cards: in print, and in Read mode. On screen it
 * starts folded while cards are on and unfolded when they are off or in Read mode, and the reader can unfold or fold it;
 * in print it is always open and the button is gone (styles/notation.css). Loaded lazily with the dictionary, when its slot
 * (components/NotationKeySlot.tsx) nears the viewport or a print starts, and its own maths is not itself marked.
 */
import { useId, useMemo, useState } from 'react'
import { NOTATION_BY_ID, meaningOf } from '../content/notation'
import type { CourseId, Track } from '../content/courses'
import type { Lecture } from '../content/schema'
import { inlineTokens, readingOrder, splitDisplay } from '../content/walk'
import { notationIds } from '../ui/notationMark'
import { NotationScopeContext, useNotationOn } from '../ui/notationPref'
import { useReadMode } from '../ui/readModePref'
import { Rich, Tex } from '../ui/Rich'

const OFF = { off: true } as const

/**
 * Every TeX span of a rich string, in order, the way ui/Rich.tsx renders it: also inside **bold**, *italic* and the shown text
 * of a gloss or term link (`texSpans` in content/walk.ts stops at those, which left their notation out of the key).
 */
export function allTexSpans(text: string): { tex: string; display: boolean }[] {
  const out: { tex: string; display: boolean }[] = []
  const inline = (t: string) => {
    for (const tok of inlineTokens(t)) {
      if (tok.t === 'tex') out.push({ tex: tok.v, display: false })
      else if (tok.t === 'bold' || tok.t === 'italic') inline(tok.v)
      else if (tok.t === 'gloss' || tok.t === 'term') inline(tok.shown)
    }
  }
  splitDisplay(text).forEach((part, j) => (j % 2 === 1 ? out.push({ tex: part.trim(), display: true }) : inline(part)))
  return out
}

/** Text that starts hidden (a hint before it is asked for, a walkthrough step before it is shown) is not on the page to be read. */
const HIDDEN = /\.(?:hints|walkthrough)\[/

/** The notation ids a chapter's text uses in a track, in order of first appearance. */
export function notationUsedIn(lecture: Lecture, track: Track, gates: boolean): string[] {
  const seen = new Set<string>()
  for (const s of readingOrder(lecture, track)) {
    if (HIDDEN.test(s.where)) continue
    for (const sp of allTexSpans(s.tex === 'display' ? `$$${s.text}$$` : s.text)) for (const id of notationIds(sp.tex, { gates })) seen.add(id)
  }
  return [...seen]
}

export default function NotationKey({ lecture, track, course }: { lecture: Lecture; track: Track; course: CourseId }) {
  const read = useReadMode()
  const cardsOn = useNotationOn() && !read // Read mode has no cards
  const listId = useId()
  const [manual, setManual] = useState<boolean | null>(null)
  const entries = useMemo(
    () => notationUsedIn(lecture, track, course !== 'sl448').flatMap((id) => NOTATION_BY_ID.get(id) ?? []),
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
