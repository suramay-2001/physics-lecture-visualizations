/**
 * Paper spec validation (docs/specs/papers-platform.md §4). `validatePaperSpec(x)` reads an UNTRUSTED value (a spec a tool
 * wrote) and returns every problem at once, each a plain sentence that starts with where it is ("P1 p1-why-codes:b2
 * trail[0].ref: …"). It runs in the tests on every spec (with the registries, `PaperContext`) and again on the chapter
 * page before a spec is compiled (without them: the structural and recipe checks only).
 *
 * What it checks: the spec's shape and version; ids (the chapter, its units, beats in order, claim keys, references,
 * reported claims, prerequisite nodes); the paper's metadata (arXiv id and version, date, source); both tracks' text on
 * every beat, reveal, review card and derivation; every recipe reference (papers/recipes.ts: allow-listed id, typed and
 * ranged params, the rules between them, the engine's own refusal); every computed claim's recipe output; reported claims
 * (plain words, value as printed, the paper's own source, an exact location); the reference trail and recipe `uses`
 * against the spec's own references and reported claims; the references (depth, via, read vs cited); the prerequisite
 * graph (known needs, no cycle, one teaching place each). With a `PaperContext`, teaching places must resolve to a written
 * unit (or an unwritten chapter of the course's plan).
 */
import { COURSES, courseOfId, isCourseId } from '../content/courses'
import { BEAT_ID_RE, REPORTED_AT_KINDS, STAGE_KINDS, checkBeatIds } from '../content/stage'
import { isPlainObject, shown } from './params'
import { isRecipeRef, runRecipe } from './recipes'
import { CORRECTION_CHECKS } from './corrections'
import { PAPER_SPEC_VERSION, type PaperSpec } from './spec'

/** The registries a full check reads (tests): which chapters and units are written, which chapters are planned. */
export interface PaperContext {
  /** The units of a written chapter, or undefined when the chapter is not written. */
  unitsOf: (chapter: string) => readonly string[] | undefined
  /** Is this chapter on its course's plan (709's outline, the Papers shelf's planned background chapters)? */
  planned: (chapter: string) => boolean
}

const ID = /^[a-z0-9-]+$/
/** `p1BellAmp`: the chapter's lower-case id, then a capital (content/courses.ts courseOfId sends it to the Papers section). */
const CLAIM_KEY = /^[pb][1-9]\d*[A-Z][A-Za-z0-9]*$/
const ARXIV = /^\d{4}\.\d{4,5}$/
const DATE = /^\d{4}-(0[1-9]|1[0-2])$/
/** Reported text and trail fields are plain words: no TeX, gloss, term or bridge markup. */
const MARKUP = /[$]|\[\[|\{\{|<<|\\/
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

type Obj = Record<string, unknown>
const str = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0

class Problems {
  readonly list: string[] = []
  readonly prefix: string
  constructor(prefix: string) {
    this.prefix = prefix
  }
  add(where: string, msg: string): void {
    this.list.push(`${this.prefix}${where ? ` ${where}` : ''}: ${msg}`)
  }
  text(o: Obj, key: string, where: string, opts: { max?: number; optional?: boolean; plain?: boolean } = {}): string | undefined {
    const v = o[key]
    if (v === undefined && opts.optional) return undefined
    const at = where ? `${where}.${key}` : key
    if (!str(v)) {
      this.add(at, `expected non-empty text, got ${shown(v)}`)
      return undefined
    }
    if (opts.max !== undefined && v.length > opts.max) this.add(at, `at most ${opts.max} characters (has ${v.length})`)
    if (opts.plain && MARKUP.test(v)) this.add(at, 'plain words only (no TeX, [[gloss]], {{term}} or <<bridge>> markup)')
    return v
  }
  only(o: Obj, allowed: readonly string[], where: string): void {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) this.add(where ? `${where}.${k}` : k, `unknown field (allowed: ${allowed.join(', ')})`)
  }
}

const SPEC_KEYS = ['specVersion', 'id', 'kind', 'title', 'paper', 'outcomes', 'references', 'prerequisites', 'symbols', 'symbolsFormal', 'units', 'corrections']
const PAPER_KEYS = ['shortTitle', 'authors', 'arxiv', 'date', 'institution', 'source', 'licence']
const REF_KEYS = ['id', 'label', 'arxiv', 'doi', 'depth', 'via', 'status', 'reliedOn', 'why', 'taughtIn']
const NODE_KEYS = ['id', 'label', 'teach', 'needs', 'ref']
const UNIT_KEYS = ['id', 'title', 'question', 'source', 'tryIt', 'insight', 'insightFormal', 'story', 'review', 'play', 'claims', 'pitfalls']
const BEAT_KEYS = ['id', 'phase', 'text', 'formal', 'caption', 'captionFormal', 'derivation', 'stage', 'reveal', 'terms', 'fidelity', 'claims', 'introduces', 'trail', 'reported']
const PHASES = ['lecture', 'books', 'clue', 'deeper', 'core']

/** Is this a valid teaching place's shape (course, chapter of that course, unit of that chapter)? */
function teachProblems(t: unknown, where: string, p: Problems, ctx?: PaperContext): void {
  if (!isPlainObject(t)) return p.add(where, `expected {course, chapter, unit?}, got ${shown(t)}`)
  p.only(t, ['course', 'chapter', 'unit'], where)
  const { course, chapter, unit } = t
  if (!isCourseId(course)) return p.add(`${where}.course`, `expected one of sl448, qc709, papers, got ${shown(course)}`)
  if (typeof chapter !== 'string' || !COURSES[course].chapterId.test(chapter) || courseOfId(chapter) !== course)
    return p.add(`${where}.chapter`, `expected a ${COURSES[course].code} chapter id, got ${shown(chapter)}`)
  if (unit !== undefined && (typeof unit !== 'string' || !ID.test(unit) || !unit.startsWith(`${chapter.toLowerCase()}-`)))
    return p.add(`${where}.unit`, `expected a unit id of ${chapter} (${chapter.toLowerCase()}-…), got ${shown(unit)}`)
  if (!ctx) return
  const units = ctx.unitsOf(chapter)
  if (unit === undefined) {
    if (units) p.add(`${where}`, `${chapter} is written: name the unit that teaches this`)
    else if (!ctx.planned(chapter)) p.add(`${where}.chapter`, `${chapter} is neither written nor on ${COURSES[course].code}'s plan`)
  } else if (!units) p.add(`${where}.unit`, `${chapter} is not written yet (leave out the unit to mark it planned)`)
  else if (!units.includes(unit as string)) p.add(`${where}.unit`, `${chapter} has no unit ${unit}`)
}

/**
 * Every problem of a paper spec, all at once ([] = valid). `x` may be anything: a spec is untrusted data. With `ctx`,
 * teaching places are checked against the real registries too.
 */
export function validatePaperSpec(x: unknown, ctx?: PaperContext): string[] {
  const id0 = isPlainObject(x) && typeof x.id === 'string' && /^[PB][1-9]\d*$/.test(x.id) ? x.id : 'spec'
  const p = new Problems(id0)
  if (!isPlainObject(x)) {
    p.add('', `expected a paper spec object, got ${shown(x)}`)
    return p.list
  }
  p.only(x, SPEC_KEYS, '')
  if (x.specVersion !== PAPER_SPEC_VERSION) p.add('specVersion', `expected ${PAPER_SPEC_VERSION}, got ${shown(x.specVersion)}`)
  if (id0 === 'spec') p.add('id', `expected a chapter id P<n> (a paper lecture) or B<n> (a background chapter), got ${shown(x.id)}`)
  const id = id0
  const low = id.toLowerCase()
  const kind = x.kind
  if (kind !== 'paper' && kind !== 'background') p.add('kind', `expected 'paper' or 'background', got ${shown(kind)}`)
  else if ((kind === 'paper') !== id.startsWith('P')) p.add('kind', `a P chapter is kind 'paper' and a B chapter kind 'background' (${id} is '${kind}')`)
  p.text(x, 'title', '', { max: 80 })

  // the paper's metadata
  let source: string | undefined
  if (kind === 'paper') {
    const m = x.paper
    if (!isPlainObject(m)) p.add('paper', `a paper lecture needs its metadata {${PAPER_KEYS.join(', ')}}, got ${shown(m)}`)
    else {
      p.only(m, PAPER_KEYS, 'paper')
      const short = p.text(m, 'shortTitle', 'paper', { max: 40, plain: true })
      if (short && words(short) > 8) p.add('paper.shortTitle', 'at most 8 words (a long title trips the verbatim guard: cite by short title + arXiv id)')
      if (!Array.isArray(m.authors) || m.authors.length === 0 || !m.authors.every((a) => str(a) && a.length <= 40))
        p.add('paper.authors', `expected a list of family names, got ${shown(m.authors)}`)
      const ax = m.arxiv
      if (!isPlainObject(ax) || typeof ax.id !== 'string' || !ARXIV.test(ax.id) || !Number.isInteger(ax.version) || (ax.version as number) < 1)
        p.add('paper.arxiv', `expected {id: 'NNNN.NNNNN', version: 1 or more}, got ${shown(ax)}`)
      else p.only(ax, ['id', 'version'], 'paper.arxiv')
      if (typeof m.date !== 'string' || !DATE.test(m.date)) p.add('paper.date', `expected 'YYYY-MM', got ${shown(m.date)}`)
      p.text(m, 'institution', 'paper', { optional: true, max: 60, plain: true })
      source = p.text(m, 'source', 'paper', { max: 40 })
      if (source && !ID.test(source)) p.add('paper.source', `expected an ingest source id (lower-case letters, digits, -), got ${shown(source)}`)
      p.text(m, 'licence', 'paper', { max: 240 })
    }
  } else if (x.paper !== undefined) p.add('paper', 'only a paper lecture (kind paper) carries paper metadata')

  if (!Array.isArray(x.outcomes) || x.outcomes.length === 0 || x.outcomes.length > 8 || !x.outcomes.every(str))
    p.add('outcomes', `expected 1 to 8 outcomes (non-empty text), got ${shown(x.outcomes)}`)

  // references (R5)
  const refs = new Map<string, Obj>()
  if (!Array.isArray(x.references)) p.add('references', `expected a list (may be empty), got ${shown(x.references)}`)
  else
    x.references.forEach((r, i) => {
      const w = `references[${i}]`
      if (!isPlainObject(r)) return p.add(w, `expected a reference object, got ${shown(r)}`)
      p.only(r, REF_KEYS, w)
      if (typeof r.id !== 'string' || !ID.test(r.id)) return p.add(`${w}.id`, `expected an id (lower-case letters, digits, -), got ${shown(r.id)}`)
      if (refs.has(r.id)) p.add(`${w}.id`, `${r.id} is listed twice`)
      refs.set(r.id, r)
      const label = p.text(r, 'label', w, { max: 80, plain: true })
      if (label && words(label) > 11) p.add(`${w}.label`, 'at most 11 words: cite by author and year (a 12+ word title trips the verbatim guard)')
      if (r.arxiv !== undefined) {
        const ax = r.arxiv
        if (!isPlainObject(ax) || typeof ax.id !== 'string' || !ARXIV.test(ax.id) || (ax.version !== undefined && (!Number.isInteger(ax.version) || (ax.version as number) < 1)))
          p.add(`${w}.arxiv`, `expected {id: 'NNNN.NNNNN', version?}, got ${shown(ax)}`)
      }
      if (r.doi !== undefined && (typeof r.doi !== 'string' || !/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(r.doi))) p.add(`${w}.doi`, `expected a DOI (10.xxxx/…), got ${shown(r.doi)}`)
      if (r.depth !== 1 && r.depth !== 2) p.add(`${w}.depth`, `expected 1 (the paper cites it) or 2 (a reference cites it), got ${shown(r.depth)}`)
      if (r.status !== 'read' && r.status !== 'cited') p.add(`${w}.status`, `expected 'read' or 'cited', got ${shown(r.status)}`)
      if (r.status === 'read') p.text(r, 'reliedOn', w, { max: 60, plain: true })
      else if (r.reliedOn !== undefined) p.add(`${w}.reliedOn`, 'only a reference that was read names the part relied on')
      p.text(r, 'why', w, { max: 240, plain: true })
      if (r.taughtIn !== undefined) teachProblems(r.taughtIn, `${w}.taughtIn`, p, ctx)
    })
  for (const [rid, r] of refs) {
    if (r.depth === 2) {
      const via = typeof r.via === 'string' ? refs.get(r.via) : undefined
      if (!via || via.depth !== 1) p.add(`references.${rid}.via`, `a depth-2 reference names the depth-1 reference it was reached through, got ${shown(r.via)}`)
    } else if (r.via !== undefined) p.add(`references.${rid}.via`, 'only a depth-2 reference has via')
  }

  // the prerequisite graph (R2)
  const nodes = new Map<string, string[]>()
  if (!Array.isArray(x.prerequisites)) p.add('prerequisites', `expected a list of nodes, got ${shown(x.prerequisites)}`)
  else
    x.prerequisites.forEach((n, i) => {
      const w = `prerequisites[${i}]`
      if (!isPlainObject(n)) return p.add(w, `expected a node {${NODE_KEYS.join(', ')}}, got ${shown(n)}`)
      p.only(n, NODE_KEYS, w)
      if (typeof n.id !== 'string' || !ID.test(n.id)) return p.add(`${w}.id`, `expected an id, got ${shown(n.id)}`)
      if (nodes.has(n.id)) p.add(`${w}.id`, `${n.id} is listed twice`)
      p.text(n, 'label', w, { max: 60, plain: true })
      teachProblems(n.teach, `${w}.teach`, p, ctx)
      if (!Array.isArray(n.needs) || !n.needs.every((d) => typeof d === 'string')) p.add(`${w}.needs`, `expected a list of node ids, got ${shown(n.needs)}`)
      if (n.ref !== undefined && !(typeof n.ref === 'string' && refs.has(n.ref))) p.add(`${w}.ref`, `no reference ${shown(n.ref)} in references`)
      nodes.set(n.id, Array.isArray(n.needs) ? n.needs.filter((d): d is string => typeof d === 'string') : [])
    })
  for (const [nid, needs] of nodes)
    for (const d of needs) {
      if (d === nid) p.add(`prerequisites.${nid}.needs`, 'a node cannot need itself')
      else if (!nodes.has(d)) p.add(`prerequisites.${nid}.needs`, `no node ${d}`)
    }
  // no cycle: a depth-first walk that meets a node still on its path has found one
  const state = new Map<string, 'open' | 'done'>()
  const visit = (n: string, path: string[]): void => {
    if (state.get(n) === 'done') return
    if (state.get(n) === 'open') return p.add('prerequisites', `the graph has a cycle: ${[...path.slice(path.indexOf(n)), n].join(' → ')}`)
    state.set(n, 'open')
    for (const d of nodes.get(n) ?? []) if (nodes.has(d)) visit(d, [...path, n])
    state.set(n, 'done')
  }
  for (const n of nodes.keys()) visit(n, [])

  // units and beats
  const claimKeys = new Set<string>()
  const reported = new Set<string>()
  const uses: { where: string; id: string }[] = []

  const stageState = (s: unknown, where: string): void => {
    if (isRecipeRef(s)) {
      const r = runRecipe(s, `${id} ${where}`)
      if (!r.ok) p.list.push(...r.problems)
      else for (const u of ((s as Obj).uses as string[] | undefined) ?? []) uses.push({ where: `${where}.uses`, id: u })
      return
    }
    if (!isPlainObject(s) || typeof s.kind !== 'string' || !(STAGE_KINDS as readonly string[]).includes(s.kind))
      p.add(where, `expected a stage state of a known kind or a recipe reference {recipe, params}, got ${shown(s)}`)
  }
  const stage = (s: unknown, where: string): void => {
    if (isPlainObject(s) && s.layout === 'split') {
      p.only(s, ['layout', 'top', 'bottom'], where)
      stageState(s.top, `${where}.top`)
      stageState(s.bottom, `${where}.bottom`)
    } else if (isPlainObject(s) && s.layout === 'inset') {
      p.only(s, ['layout', 'main', 'inset'], where)
      stageState(s.main, `${where}.main`)
      stageState(s.inset, `${where}.inset`)
    } else stageState(s, where)
  }
  const claims = (list: unknown, where: string): void => {
    if (list === undefined) return
    if (!Array.isArray(list)) return p.add(where, `expected a list of claims, got ${shown(list)}`)
    list.forEach((c, i) => {
      const w = `${where}[${i}]`
      if (!isPlainObject(c)) return p.add(w, `expected a claim {key, text, from, value}, got ${shown(c)}`)
      p.only(c, ['key', 'text', 'from', 'value'], w)
      if (typeof c.key !== 'string' || !CLAIM_KEY.test(c.key) || !new RegExp(`^${low}[A-Z]`).test(c.key))
        p.add(`${w}.key`, `expected a claim key ${low}<Name> (a capital, then letters and digits), got ${shown(c.key)}`)
      else if (claimKeys.has(c.key)) p.add(`${w}.key`, `${c.key} is used twice`)
      else claimKeys.add(c.key)
      p.text(c, 'text', w, { max: 200 })
      const r = runRecipe(c.from, `${id} ${w}.from`)
      if (!r.ok) return void p.list.push(...r.problems)
      if (typeof c.value !== 'string' || !Object.hasOwn(r.values, c.value))
        p.add(`${w}.value`, `${r.recipe} has no output ${shown(c.value)} (it has ${Object.keys(r.values).join(', ')})`)
    })
  }
  const twoTrack = (o: Obj, where: string, ground: string, formal: string): void => {
    p.text(o, ground, where)
    p.text(o, formal, where)
  }

  if (!Array.isArray(x.units) || x.units.length === 0) p.add('units', `expected at least one unit, got ${shown(x.units)}`)
  const unitIds = new Set<string>()
  const beatIds = new Set<string>()
  if (Array.isArray(x.units))
    x.units.forEach((u, ui) => {
      const uw = `units[${ui}]`
      if (!isPlainObject(u)) return p.add(uw, `expected a unit, got ${shown(u)}`)
      p.only(u, UNIT_KEYS, uw)
      if (typeof u.id !== 'string' || !ID.test(u.id) || !u.id.startsWith(`${low}-`)) return p.add(`${uw}.id`, `expected a unit id ${low}-…, got ${shown(u.id)}`)
      if (unitIds.has(u.id)) p.add(u.id, 'unit id is used twice')
      unitIds.add(u.id)
      const w = u.id
      p.text(u, 'title', w, { max: 80 })
      p.text(u, 'question', w)
      twoTrack(u, w, 'insight', 'insightFormal')
      if (!isPlainObject(u.source)) p.add(`${w}.source`, `expected {summary, where}, got ${shown(u.source)}`)
      else {
        p.only(u.source, ['summary', 'where', 'equations'], `${w}.source`)
        p.text(u.source, 'summary', `${w}.source`)
        p.text(u.source, 'where', `${w}.source`, { max: 60 })
      }
      if (!isPlainObject(u.tryIt) || !str(u.tryIt.kind) || !Array.isArray(u.tryIt.tryThis) || !u.tryIt.tryThis.every(str) || u.tryIt.tryThis.length === 0)
        p.add(`${w}.tryIt`, `expected a widget {kind, props?, tryThis: [one or more]}, got ${shown(u.tryIt)}`)
      claims(u.claims, `${w}.claims`)
      if (u.review !== undefined) {
        const r = u.review
        if (!isPlainObject(r)) p.add(`${w}.review`, `expected a review card, got ${shown(r)}`)
        else {
          if (!Array.isArray(r.points) || !r.points.every(str)) p.add(`${w}.review.points`, 'expected a list of points')
          p.text(r, 'equations', `${w}.review`)
          p.text(r, 'trap', `${w}.review`)
          claims(r.claims, `${w}.review.claims`)
          if (!isPlainObject(r.formal) || !Array.isArray(r.formal.points) || !r.formal.points.every(str) || !str(r.formal.trap))
            p.add(`${w}.review.formal`, 'a two-track review card has its Formal points and trap')
        }
      }
      if (u.play !== undefined) {
        if (!Array.isArray(u.play)) p.add(`${w}.play`, 'expected a list of challenges')
        else
          u.play.forEach((c, ci) => {
            const cw = `${w}.play[${ci}]`
            if (!isPlainObject(c)) return p.add(cw, 'expected a challenge')
            if (typeof c.id !== 'string' || !ID.test(c.id) || !c.id.startsWith(`${low}-`)) p.add(`${cw}.id`, `expected a challenge id ${low}-…, got ${shown(c.id)}`)
            if (c.kind === 'numeric') {
              const a = c.answerFrom
              if (!isPlainObject(a)) return p.add(`${cw}.answerFrom`, 'a numeric answer comes from a recipe output {from, value}')
              const r = runRecipe(a.from, `${id} ${cw}.answerFrom.from`)
              if (!r.ok) p.list.push(...r.problems)
              else if (typeof a.value !== 'string' || !Object.hasOwn(r.values, a.value)) p.add(`${cw}.answerFrom.value`, `${r.recipe} has no output ${shown(a.value)}`)
              if (typeof c.tolerance !== 'number' || !(c.tolerance > 0)) p.add(`${cw}.tolerance`, 'expected a positive number')
            } else if (c.kind !== 'choice' && c.kind !== 'order') p.add(`${cw}.kind`, `expected 'choice', 'order' or 'numeric', got ${shown(c.kind)}`)
          })
      }
      if (!Array.isArray(u.story) || u.story.length === 0) return p.add(`${w}.story`, 'expected at least one beat')
      const ids = u.story.map((b) => (isPlainObject(b) && typeof b.id === 'string' ? b.id : ''))
      for (const e of checkBeatIds(u.id, ids)) p.add(`${w}.story`, e)
      u.story.forEach((b, bi) => {
        if (!isPlainObject(b)) return p.add(`${w}.story[${bi}]`, `expected a beat, got ${shown(b)}`)
        const bw = typeof b.id === 'string' && BEAT_ID_RE.test(b.id) ? b.id : `${w}.story[${bi}]`
        if (beatIds.has(bw)) p.add(bw, 'beat id is used twice')
        beatIds.add(bw)
        p.only(b, BEAT_KEYS, bw)
        if (typeof b.phase !== 'string' || !PHASES.includes(b.phase)) p.add(`${bw}.phase`, `expected one of ${PHASES.join(', ')}, got ${shown(b.phase)}`)
        twoTrack(b, bw, 'text', 'formal')
        if (b.caption !== undefined) twoTrack(b, bw, 'caption', 'captionFormal')
        else if (b.captionFormal !== undefined) p.add(`${bw}.captionFormal`, 'a Formal caption needs a Ground-up caption')
        stage(b.stage, `${bw}.stage`)
        claims(b.claims, `${bw}.claims`)
        if (b.reveal !== undefined) {
          const r = b.reveal
          if (!isPlainObject(r)) p.add(`${bw}.reveal`, 'expected a reveal')
          else {
            twoTrack(r, `${bw}.reveal`, 'text', 'formal')
            if (r.caption !== undefined) twoTrack(r, `${bw}.reveal`, 'caption', 'captionFormal')
            if (r.stage !== undefined) stage(r.stage, `${bw}.reveal.stage`)
            claims(r.claims, `${bw}.reveal.claims`)
          }
        }
        if (b.derivation !== undefined) {
          const d = b.derivation
          if (!isPlainObject(d) || !str(d.result) || !Array.isArray(d.ground) || !Array.isArray(d.formal) || !d.ground.length || !d.formal.length)
            p.add(`${bw}.derivation`, 'expected {result, ground: [steps], formal: [steps]} (both tracks)')
          else {
            if (d.ground.length < d.formal.length) p.add(`${bw}.derivation`, `Ground-up has fewer steps (${d.ground.length}) than Formal (${d.formal.length})`)
            for (const t of ['ground', 'formal'] as const)
              (d[t] as unknown[]).forEach((s, si) => {
                const sw = `${bw}.derivation.${t}[${si}]`
                if (!isPlainObject(s) || !str(s.tex) || !str(s.why)) return p.add(sw, 'expected a step {tex, why}')
                if (s.view !== undefined) stageState(s.view, `${sw}.view`)
                claims(s.claims, `${sw}.claims`)
              })
          }
        }
        if (b.trail !== undefined) {
          if (!Array.isArray(b.trail)) p.add(`${bw}.trail`, 'expected a list of trail entries')
          else
            b.trail.forEach((t, ti) => {
              const tw = `${bw}.trail[${ti}]`
              if (!isPlainObject(t)) return p.add(tw, 'expected {ref, at, why}')
              p.only(t, ['ref', 'at', 'why'], tw)
              if (typeof t.ref !== 'string' || !refs.has(t.ref)) p.add(`${tw}.ref`, `no reference ${shown(t.ref)} in this spec's references`)
              p.text(t, 'at', tw, { max: 80, plain: true })
              p.text(t, 'why', tw, { max: 240 })
            })
        }
        if (b.reported !== undefined) {
          if (!Array.isArray(b.reported)) p.add(`${bw}.reported`, 'expected a list of reported claims')
          else
            b.reported.forEach((r, ri) => {
              const rw = `${bw}.reported[${ri}]`
              if (!isPlainObject(r)) return p.add(rw, 'expected {id, text, value, source, at}')
              p.only(r, ['id', 'text', 'value', 'source', 'at'], rw)
              if (typeof r.id !== 'string' || !ID.test(r.id)) p.add(`${rw}.id`, `expected an id, got ${shown(r.id)}`)
              else if (reported.has(r.id)) p.add(`${rw}.id`, `${r.id} is used twice`)
              else reported.add(r.id)
              p.text(r, 'text', rw, { max: 120, plain: true })
              // the value as printed: plain characters (it is drawn as text, never through the rich renderer), so the
              // double brackets of a code's parameters are fine, but no TeX or markup delimiters
              const value = p.text(r, 'value', rw, { max: 40 })
              if (value && /[$\\<>{}`]/.test(value)) p.add(`${rw}.value`, 'the value as printed, in plain characters (write 10⁻⁷ or 1e-7, not TeX)')
              // the source is the paper's own ingest id (printed page required) or a key of THIS spec's reference list (rulings papers-B3B4.md R1;
              // a reference read online has no printed pages, so its location is a label alone)
              const ofReference = typeof r.source === 'string' && refs.has(r.source)
              if (typeof r.source !== 'string' || !ID.test(r.source)) p.add(`${rw}.source`, `expected an ingest source id or a reference key, got ${shown(r.source)}`)
              else if (!ofReference && source && r.source !== source) p.add(`${rw}.source`, `a paper lecture reports its own paper's numbers (${source}) or a reference's (one of ${[...refs.keys()].join(', ') || 'no references'}), got ${r.source}`)
              else if (!ofReference && !source && !/^paper-[a-z0-9]+$/.test(r.source))
                p.add(`${rw}.source`, `a background chapter reports a paper's numbers (an ingest id 'paper-…') or a reference's (one of ${[...refs.keys()].join(', ') || 'no references'}), got ${r.source}`)
              const at = r.at
              if (!isPlainObject(at)) return p.add(`${rw}.at`, `expected {kind, label?, page}, got ${shown(at)}`)
              p.only(at, ['kind', 'label', 'page'], `${rw}.at`)
              if (typeof at.kind !== 'string' || !(REPORTED_AT_KINDS as readonly string[]).includes(at.kind))
                p.add(`${rw}.at.kind`, `expected one of ${REPORTED_AT_KINDS.join(', ')}, got ${shown(at.kind)}`)
              else if (at.kind !== 'text' && !(typeof at.label === 'string' && /^[A-Za-z0-9.()-]{1,12}$/.test(at.label)))
                p.add(`${rw}.at.label`, `a ${at.kind} is named by its label ('3', '3b', '2.1'), got ${shown(at.label)}`)
              if (at.page !== undefined || !ofReference) {
                if (!Number.isInteger(at.page) || (at.page as number) < 1 || (at.page as number) > 2000) p.add(`${rw}.at.page`, `expected the printed page (a whole number)${ofReference ? ' or none' : ''}, got ${shown(at.page)}`)
              } else if (at.kind === 'text' || !at.label) p.add(`${rw}.at`, 'a reference without printed pages is located by a section, table, figure or equation label')
            })
        }
      })
    })
  // corrections (rulings papers-P1.md R2, R4): data naming a computed claim; the check is code in papers/corrections.ts, found by that key
  if (x.corrections !== undefined) {
    if (kind !== 'paper') p.add('corrections', 'only a paper lecture corrects the paper')
    else if (!Array.isArray(x.corrections)) p.add('corrections', `expected a list, got ${shown(x.corrections)}`)
    else {
      const seen = new Set<string>()
      x.corrections.forEach((c, ci) => {
        const cw = `corrections[${ci}]`
        if (!isPlainObject(c)) return p.add(cw, 'expected {claim, printed, location, says, shouldSay}')
        p.only(c, ['claim', 'printed', 'location', 'says', 'shouldSay'], cw)
        if (typeof c.claim !== 'string' || !claimKeys.has(c.claim)) p.add(`${cw}.claim`, `no computed claim ${shown(c.claim)} in this spec`)
        else if (!Object.hasOwn(CORRECTION_CHECKS, c.claim)) p.add(`${cw}.claim`, `${c.claim} has no check in papers/corrections.ts (a correction without an engine check is cut)`)
        else if (seen.has(c.claim)) p.add(`${cw}.claim`, `${c.claim} is corrected twice`)
        else seen.add(c.claim)
        if (typeof c.printed !== 'number' || !Number.isFinite(c.printed)) p.add(`${cw}.printed`, `expected the printed number, got ${shown(c.printed)}`)
        const at = c.location
        if (!isPlainObject(at)) p.add(`${cw}.location`, `expected {kind, label?, page}, got ${shown(at)}`)
        else {
          p.only(at, ['kind', 'label', 'page'], `${cw}.location`)
          if (typeof at.kind !== 'string' || !(REPORTED_AT_KINDS as readonly string[]).includes(at.kind)) p.add(`${cw}.location.kind`, `expected one of ${REPORTED_AT_KINDS.join(', ')}, got ${shown(at.kind)}`)
          if (!Number.isInteger(at.page) || (at.page as number) < 1 || (at.page as number) > 2000) p.add(`${cw}.location.page`, `expected the printed page, got ${shown(at.page)}`)
        }
        p.text(c, 'says', cw, { max: 300 })
        const sd = p.text(c, 'shouldSay', cw, { max: 500 })
        if (sd && !/^Our calculation finds/.test(sd)) p.add(`${cw}.shouldSay`, 'worded "Our calculation finds ..." (rulings papers-P1.md R2)')
      })
    }
  }
  for (const u of uses) if (!reported.has(u.id)) p.add(u.where, `no reported claim ${u.id} in this spec`)
  return p.list
}

/** A spec that failed validation: its problems, one per line. */
export class PaperSpecError extends Error {
  readonly problems: readonly string[]
  constructor(problems: readonly string[]) {
    super(`paper spec: ${problems.length} problem${problems.length === 1 ? '' : 's'}\n${problems.join('\n')}`)
    this.name = 'PaperSpecError'
    this.problems = problems
  }
}

/** The spec, typed, or a PaperSpecError with every problem. */
export function checkedPaperSpec(x: unknown, ctx?: PaperContext): PaperSpec {
  const problems = validatePaperSpec(x, ctx)
  if (problems.length) throw new PaperSpecError(problems)
  return x as PaperSpec
}
