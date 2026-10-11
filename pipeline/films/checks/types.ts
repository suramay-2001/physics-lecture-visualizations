/** What every film's manifest check returns (pipeline/films/checks/<film>.ts): failures (empty = pass), a row per stage for the log, and how many checks ran. */
export interface CheckResult {
  failures: string[]
  rows: string[]
  count: number
}
