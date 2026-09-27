import type { Ref, SourceId } from '../content/schema'
import { Rich } from '../ui/Rich'

export const SOURCE_NAMES: Record<SourceId, string> = {
  lecture: 'Lecture notes',
  susskind: 'Susskind & Friedman, The Theoretical Minimum',
  axler: 'Axler, Linear Algebra Done Right (4e)',
  bergou: 'Bergou, Hillery & Saffman, Quantum Information Processing (2e)',
  sets: 'Sets and Functions, Ch. 1',
  reif: 'Reif, Fundamentals of Statistical and Thermal Physics',
  mit805: 'MIT 8.05 (Zwiebach), video lectures',
  '3b1b': '3Blue1Brown',
  'tm-video': 'Susskind, Theoretical Minimum lectures (video)',
  townsend: 'Townsend, A Modern Approach to Quantum Mechanics (2e)',
  nc: 'Nielsen & Chuang, Quantum Computation and Quantum Information (10th anniversary ed.)',
}

const SHORT: Record<SourceId, string> = {
  lecture: 'Notes',
  susskind: 'Susskind',
  axler: 'Axler',
  bergou: 'Bergou et al.',
  sets: 'Sets & Functions',
  reif: 'Reif',
  mit805: 'MIT 8.05',
  '3b1b': '3Blue1Brown',
  'tm-video': 'TM video',
  townsend: 'Townsend',
  nc: 'Nielsen & Chuang',
}

export function RefList({ refs, compact = false }: { refs: Ref[]; compact?: boolean }) {
  return (
    <ul className={compact ? 'refs compact' : 'refs'}>
      {refs.map((r, i) => (
        <li key={i}>
          <span className="ref-source" title={SOURCE_NAMES[r.source]}>{SHORT[r.source]}</span>
          <span className="ref-where mono">{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.where}</a> : r.where}</span>
          {!compact && <Rich text={r.adds} className="ref-adds" />}
        </li>
      ))}
    </ul>
  )
}
