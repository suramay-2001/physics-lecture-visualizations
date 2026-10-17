/**
 * Every notes lecture's engine values (`N8.values.ts` exports `V`), merged by file name like the lectures themselves: no shared
 * file changes when a lecture lands. Keys start with the lecture's lower-case id (`n8…`) and must be unique across ALL courses
 * (content/values.ts merges them and refuses a duplicate). Tests only: the claim ledger reads it.
 */
import { mergeValues } from '../../claimKit'

const tables = import.meta.glob<{ V: Readonly<Record<string, number>> }>('./N[0-9]*.values.ts', { eager: true })

/** lecture id → its value table ('./N8.values.ts' → 'N8'). */
export const NOTES_VALUE_TABLES: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.fromEntries(
  Object.entries(tables).map(([file, m]) => [/\/(N[1-9]\d*)\.values\.ts$/.exec(file)?.[1] ?? file, m.V]),
)

export const NOTES_VALUES = mergeValues(...Object.values(NOTES_VALUE_TABLES))
