/**
 * Every 709 chapter's engine values (`Q4.values.ts` exports `V`), merged by file name like the chapters themselves:
 * no shared file changes when a chapter lands. Keys start with the chapter's lower-case id (`q4…`, `f2…`;
 * content/courses.test.ts) and must be unique across BOTH courses (content/values.ts merges them and refuses a
 * duplicate). Tests only: the claim ledger reads it.
 */
import { mergeValues } from '../claimKit'

const tables = import.meta.glob<{ V: Readonly<Record<string, number>> }>('./[QF]*.values.ts', { eager: true })

/** chapter id → its value table ('./Q4.values.ts' → 'Q4'). */
export const QC_VALUE_TABLES: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.fromEntries(
  Object.entries(tables).map(([file, m]) => [/\/([QF]\d+)\.values\.ts$/.exec(file)?.[1] ?? file, m.V]),
)

export const QC_VALUES = mergeValues(...Object.values(QC_VALUE_TABLES))
