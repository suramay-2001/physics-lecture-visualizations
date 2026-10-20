/**
 * `readingOrder`: every authored string of a lecture in reading order (the content walker's main entry, re-exported from ./walk.ts so
 * `import { readingOrder } from './walk'` keeps working). It sits in its own module because only the lints and the lazy notation key
 * call it; the first-paint chunk imports ./walk.ts for the rich-string tokenizer and must not carry this (build/chunks.test.ts rule (l)).
 */
import type { Track } from './courses'
import type { Lecture } from './schema'
import { derivationSteps, pickInsight, pickReview, pickTrack } from './track'
import type { TextSite } from './walk'

/**
 * Every authored string in reading order: outcomes → watch → corrections → per unit: story beats
 * (text, derivation, caption, reveal) → lecture → books → visual → clues → insight → pitfalls → review → play
 * (prompt, options, hints, walkthrough). Matches P2 §5. Units with a story still list lecture/books/clues:
 * they are authored text even when the story layout hides them.
 *
 * Per track (interface change W-709 #1): `track` picks each beat's, reveal's, insight's and review card's text for that
 * track (content/track.ts; Ground-up is the default and the only track of 448, whose sites are unchanged). A beat's
 * derivation lists its result (`<beat>.derivation`) and the track's steps (`<beat>.derivation.formal[2]`: `why`, then
 * the line's TeX as display TeX). Challenges, lecture blocks and glosses are shared by both tracks.
 */
export function readingOrder(l: Lecture, track: Track = 'ground'): TextSite[] {
  const out: TextSite[] = []
  const push = (where: string, field: string, text: string | undefined, tex?: 'display') => {
    if (text) out.push(tex ? { where, field, text, tex } : { where, field, text })
  }
  l.outcomes.forEach((o, i) => push(`${l.id}.outcomes[${i}]`, 'outcome', o))
  l.watch?.forEach((r, i) => push(`${l.id}.watch[${i}]`, 'adds', r.adds))
  l.corrections?.forEach((c, i) => {
    push(`${l.id}.corrections[${i}]`, 'says', c.says)
    push(`${l.id}.corrections[${i}]`, 'shouldSay', c.shouldSay)
  })
  for (const u of l.units) {
    push(`${u.id}.opener`, 'lede', u.opener?.lede)
    push(u.id, 'title', u.title)
    push(u.id, 'question', u.question)
    for (const raw of u.story ?? []) {
      const b = pickTrack(raw, track)
      push(b.id, 'text', b.text)
      if (b.derivation) {
        push(`${b.id}.derivation`, 'result', b.derivation.result, 'display')
        derivationSteps(b, track).forEach((s, i) => {
          push(`${b.id}.derivation.${track}[${i}]`, 'why', s.why)
          push(`${b.id}.derivation.${track}[${i}]`, 'tex', s.tex, 'display')
        })
      }
      push(b.id, 'caption', b.caption)
      push(b.id, 'reveal.text', b.reveal?.text)
      push(b.id, 'reveal.caption', b.reveal?.caption)
      b.refs?.forEach((r, i) => push(`${b.id}.refs[${i}]`, 'adds', r.adds))
      // Papers (W-papers #2, additive): the reference trail's reasons and the reported numbers' descriptions are authored prose
      b.trail?.forEach((t, i) => push(`${b.id}.trail[${i}]`, 'why', t.why))
      b.reported?.forEach((r, i) => push(`${b.id}.reported[${i}]`, 'reported', r.text))
    }
    push(`${u.id}.lecture`, 'summary', u.lecture.summary)
    u.lecture.equations?.forEach((e, i) => push(`${u.id}.lecture.equations[${i}]`, 'equation', e, 'display'))
    u.books.forEach((r, i) => push(`${u.id}.books[${i}]`, 'adds', r.adds))
    push(`${u.id}.visual`, 'caption', u.visual.caption)
    u.visual.tryThis.forEach((t, i) => push(`${u.id}.visual.tryThis[${i}]`, 'tryThis', t))
    u.clues.forEach((c, i) => {
      push(`${u.id}.clues[${i}]`, 'ask', c.ask)
      push(`${u.id}.clues[${i}]`, 'reveal', c.reveal)
    })
    push(u.id, 'insight', pickInsight(u, track))
    u.pitfalls?.forEach((p, i) => push(`${u.id}.pitfalls[${i}]`, 'pitfall', p))
    if (u.review) {
      const card = pickReview(u.review, track)
      card.points.forEach((p, i) => push(`${u.id}.review.points[${i}]`, 'point', p))
      push(`${u.id}.review`, 'equations', card.equations, 'display')
      push(`${u.id}.review`, 'trap', card.trap)
    }
    if (u.beyondLecture) push(`${u.id}.beyondLecture`, 'why', u.beyondLecture.why)
    for (const c of u.play) {
      const w = `${u.id}.play.${c.id}`
      push(w, 'title', c.title)
      push(w, 'prompt', c.prompt)
      if (c.kind === 'choice')
        c.options.forEach((o, i) => {
          push(`${w}.options[${i}]`, 'text', o.text)
          push(`${w}.options[${i}]`, 'why', o.why)
        })
      if (c.kind === 'order') c.steps.forEach((s, i) => push(`${w}.steps[${i}]`, 'step', s))
      if (c.kind === 'numeric') push(w, 'unit', c.unit)
      c.hints.forEach((h, i) => push(`${w}.hints[${i}]`, 'hint', h.text))
      c.walkthrough.forEach((s, i) => push(`${w}.walkthrough[${i}]`, 'step', s.text))
    }
  }
  return out
}
