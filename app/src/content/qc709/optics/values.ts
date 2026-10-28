/**
 * Every optics page's engine values (`O3.values.ts` exports `V`), merged by file name like the pages themselves: no shared file
 * changes when a page lands. Keys start with the page's lower-case id (`o3…`) and must be unique across ALL courses (content/values.ts
 * merges them and refuses a duplicate). Tests only: the claim ledger reads it.
 */
import { mergeValues } from '../../claimKit'

const tables = import.meta.glob<{ V: Readonly<Record<string, number>> }>('./O[0-9]*.values.ts', { eager: true })

/** page id → its value table ('./O3.values.ts' → 'O3'). */
export const OPTICS_VALUE_TABLES: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.fromEntries(
  Object.entries(tables).map(([file, m]) => [/\/(O[1-9]\d*)\.values\.ts$/.exec(file)?.[1] ?? file, m.V]),
)

export const OPTICS_VALUES = mergeValues(...Object.values(OPTICS_VALUE_TABLES))
