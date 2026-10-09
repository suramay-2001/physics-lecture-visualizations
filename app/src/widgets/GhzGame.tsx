/**
 * Widget W2 `ghz-game` (448 Lecture 10; rulings 448-L8L11 L10 R7): the three-player game, ONE component for the Try-it and the Arcade.
 * Alice, Bob and Charlie agree a plan, then cannot talk; the referee names one of four instruction strings (ZZZ, ZXX, XZX, XXZ), each
 * player sees only their letter and answers ±1. They win when the product of the three answers is +1 for ZZZ and −1 for the other three.
 *
 *   mode 'table'    a classical plan: six ±1 toggles (A_Z, A_X, B_Z, B_X, C_Z, C_X). The four row products and the wins come from the
 *                   `matrix` kind's tableau (the "need" column, a ✓ or ✗ per input, "wins k of 4"), and the best any of the 64 plans can
 *                   do from `ghzGame()`. The referee plays rounds; `proof` shows the four row products multiplied against the targets.
 *   mode 'quantum'  the shared state |G⟩: each player measures the letter they are shown and reports the ±1 result (engine-sampled).
 *   mode 'both'     a plan and |G⟩ play the same referee inputs side by side.
 *   mode 'pair'     the two-player warm-up of Unit 4: a plan for ZZ = −1 and XX = −1 (the singlet's matched-axis correlations); hide
 *                   it behind a source that picks a matching plan at random and Alice's tally is 50/50.
 * Every verdict is the engine's (physics/qc/ghz.ts); the table's long-run rate is wins/4, so it never shows more than ¾.
 */
import { useMemo, useRef, useState } from 'react'
import type { MatrixTableauState } from '../content/stage'
import { GHZ_ROWS, GHZ_TARGET, GHZ_TERMS, type GhzRound, type GhzRow, type GhzTable, ghzGame, ghzReferee, ghzRound, ghzState, ghzTableResult, pairPlanResult, pairPlansThatMatch, pairRun, type PairPlan } from '../physics/qc/ghz'
import type { Sign } from '../physics/qc/bits'
import { rng } from '../physics/random'
import { matrixReadouts, resolveMatrixStage } from '../stage/svg/matrix'
import { MatrixScene } from '../stage/svg/MatrixScene'
import '../stage/svg/svg.css'
import './ghzGame.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, WidgetFrame } from '../ui/primitives'

const W = 480
const H = 178

export interface GhzGameProps {
  /** 'table' (default): a classical plan. 'quantum': the shared state |G⟩. 'both': a plan and |G⟩ side by side. 'pair': the two-player warm-up. */
  mode?: 'pair' | 'table' | 'quantum' | 'both'
  /** How many rounds (or pairs) one press of the big Play button runs. Default 20. */
  rounds?: number
  /** The seed of the referee and of the measurements (default 10). */
  seed?: number
  /** Table modes: show the four row products of the plan multiplied against the four targets multiplied. */
  proof?: boolean
  /** The plan the six toggles start at: 'minus' (every answer −1, the default), 'plus' (every answer +1) or 't1' (A_Z = +1, A_X = −1, Bob and Charlie −1). */
  start?: 'minus' | 'plus' | 't1'
  /** false locks the toggles (the Arcade shows a plan the player may not change). Default true. */
  editable?: boolean
  /** Called with the plan whenever it changes (the Arcade reads the player's plan this way; content does not pass it). */
  onTable?: (table: GhzTable) => void
}

const sg = (x: Sign) => (x > 0 ? '+1' : '−1')
const PLAYERS = ['Alice', 'Bob', 'Charlie'] as const

/** The six answers of a named starting plan. */
export function startTable(start: 'minus' | 'plus' | 't1'): GhzTable {
  if (start === 'plus') return [{ Z: 1, X: 1 }, { Z: 1, X: 1 }, { Z: 1, X: 1 }]
  if (start === 't1') return [{ Z: 1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
  return [{ Z: -1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
}

/** The `matrix` tableau of a plan (its four row products as the card, the targets as the need column) or of |G⟩ (its four eigenvalues). */
export function ghzTableau(of: { table: GhzTable } | { state: true }): MatrixTableauState {
  const targets = { ...GHZ_TARGET }
  if ('table' in of) return { kind: 'matrix', tableau: [...GHZ_ROWS], targets, values: { ...ghzTableResult(of.table).values } }
  return { kind: 'matrix', tableau: [...GHZ_ROWS], targets, state: { terms: GHZ_TERMS } }
}

/** What the plan does, in words that come from `ghzTableResult` and `ghzGame` (pure). */
export function planVerdict(table: GhzTable): { wins: number; loses: GhzRow[]; best: number; longRun: number; rowsProduct: Sign; targetsProduct: Sign; values: Record<GhzRow, Sign> } {
  const r = ghzTableResult(table)
  const g = ghzGame()
  const rowsProduct = GHZ_ROWS.reduce((p, row) => (p * r.values[row]) as Sign, 1 as Sign)
  return { wins: r.wins, loses: GHZ_ROWS.filter((row) => !r.win[row]), best: g.maxWins, longRun: r.wins / GHZ_ROWS.length, rowsProduct, targetsProduct: g.targetsProduct, values: r.values }
}

type Ledger = { table: GhzRound[]; quantum: GhzRound[] }
const EMPTY: Ledger = { table: [], quantum: [] }

function Toggles({ table, setTable, editable }: { table: GhzTable; setTable: (t: GhzTable) => void; editable: boolean }) {
  return (
    <div className="ghz-plan" role="group" aria-label="The plan: six fixed answers">
      {PLAYERS.map((name, p) => (
        <div className="ghz-player" key={name}>
          <span className="ghz-name">{name}</span>
          {(['Z', 'X'] as const).map((ch) => (
            <button
              key={ch}
              className={`ghz-toggle ${table[p][ch] > 0 ? 'plus' : 'minus'}`}
              disabled={!editable}
              aria-label={`${name}'s answer to ${ch}: ${sg(table[p][ch])}`}
              aria-pressed={table[p][ch] > 0}
              onClick={() => {
                const next = table.map((s) => ({ ...s })) as GhzTable
                next[p][ch] = (-next[p][ch]) as Sign
                setTable(next)
              }}
            >
              <span className="ghz-letter">
                {name[0]}
                <sub>{ch}</sub>
              </span>{' '}
              = {sg(table[p][ch])}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function Tableau({ st }: { st: MatrixTableauState }) {
  const r = useMemo(() => resolveMatrixStage(st, 1), [st])
  const lines = matrixReadouts(r).map((x) => x.text)
  return (
    <svg className="svgk svgk-stage ghz-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('matrix') as React.CSSProperties} role="img" aria-label={lines.join('; ') || 'the four inputs'}>
      <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.matrix} rx={6} />
      <MatrixScene state={r} mode="stage" width={W} height={H} bare />
    </svg>
  )
}

function RoundTable({ title, rounds, who }: { title: string; rounds: GhzRound[]; who: 'plan' | 'state' }) {
  const n = rounds.length
  const wins = rounds.filter((r) => r.win).length
  const aliceMinus = rounds.filter((r) => r.answers[0] === -1).length
  const shown = rounds.slice(-6)
  return (
    <div className="ghz-ledger" data-who={who}>
      <p className="ghz-stats mono" role="status">
        {title}: {n === 0 ? 'no rounds yet' : `${wins} of ${n} rounds won`}
        {n > 0 && ` · Alice answered −1 in ${aliceMinus} of ${n}`}
      </p>
      {n > 0 && (
        <table className="ghz-rounds" aria-label={`${title}: the last rounds`}>
          <thead>
            <tr>
              <th scope="col">round</th>
              <th scope="col">input</th>
              <th scope="col">Alice</th>
              <th scope="col">Bob</th>
              <th scope="col">Charlie</th>
              <th scope="col">product</th>
              <th scope="col">result</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={n - shown.length + i} className={r.win ? 'win' : 'lose'}>
                <td className="mono">{n - shown.length + i + 1}</td>
                <td className="mono">{r.row}</td>
                {r.answers.map((a, k) => (
                  <td className="mono" key={k}>
                    {sg(a)}
                  </td>
                ))}
                <td className="mono">{sg(r.product)}</td>
                <td>{r.win ? 'win' : 'lose'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function PairMode({ rounds, seed, start, editable, onTable }: Required<Pick<GhzGameProps, 'rounds' | 'seed' | 'start' | 'editable'>> & Pick<GhzGameProps, 'onTable'>) {
  const [plan, setPlan] = useState<PairPlan>(() => {
    const t = startTable(start)
    return [t[0], t[1]]
  })
  const [setting, setSetting] = useState<'Z' | 'X'>('Z')
  const [tally, setTally] = useState<{ n: number; alicePlus: number; opposite: number }>({ n: 0, alicePlus: 0, opposite: 0 })
  const R = useRef<(() => number) | null>(null)
  const res = pairPlanResult(plan)
  const matching = useMemo(() => pairPlansThatMatch(), [])
  const st = useMemo<MatrixTableauState>(() => ({ kind: 'matrix', tableau: ['ZZ', 'XX'], values: { ...res.values }, state: { bell: '01-10' } }), [res.values.ZZ, res.values.XX])
  const change = (p: 0 | 1, ch: 'Z' | 'X') => {
    const next = plan.map((s) => ({ ...s })) as PairPlan
    next[p][ch] = (-next[p][ch]) as Sign
    setPlan(next)
    setTally({ n: 0, alicePlus: 0, opposite: 0 })
    onTable?.([next[0], next[1], { Z: 1, X: 1 }])
  }
  const run = (n: number) => {
    if (!R.current) R.current = rng(seed)
    const out = pairRun(setting, n, R.current)
    setTally((t) => ({ n: t.n + out.length, alicePlus: t.alicePlus + out.filter((o) => o.alice === 1).length, opposite: t.opposite + out.filter((o) => o.bob === -o.alice).length }))
  }
  const both = res.matches === 2
  return (
    <WidgetFrame title="A plan for two: answers fixed in advance">
      <Tableau st={st} />
      <div className="ghz-plan" role="group" aria-label="The plan: four fixed answers">
        {(['Alice', 'Bob'] as const).map((name, p) => (
          <div className="ghz-player" key={name}>
            <span className="ghz-name">{name}</span>
            {(['Z', 'X'] as const).map((ch) => (
              <button
                key={ch}
                className={`ghz-toggle ${plan[p][ch] > 0 ? 'plus' : 'minus'}`}
                disabled={!editable}
                aria-label={`${name}'s answer to ${ch}: ${sg(plan[p][ch])}`}
                aria-pressed={plan[p][ch] > 0}
                onClick={() => change(p as 0 | 1, ch)}
              >
                <span className="ghz-letter">
                  {name[0]}
                  <sub>{ch}</sub>
                </span>{' '}
                = {sg(plan[p][ch])}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="ghz-verdict" role="status">
        {both
          ? `This plan matches both rows: ZZ gives ${sg(res.values.ZZ)} and XX gives ${sg(res.values.XX)}. ${matching.plans.length} of the ${matching.of} possible plans do.`
          : `This plan matches ${res.matches} of the 2 rows (ZZ needs −1 and gets ${sg(res.values.ZZ)}; XX needs −1 and gets ${sg(res.values.XX)}). ${matching.plans.length} of the ${matching.of} possible plans match both.`}
      </p>
      <Segmented label="Both measure" value={setting} onChange={setSetting} options={[{ value: 'Z', label: 'both measure Z' }, { value: 'X', label: 'both measure X' }]} />
      <div className="ghz-buttons">
        <button className="btn" disabled={!both} onClick={() => run(rounds)}>
          Hide the plan: {rounds} pairs
        </button>
        <button className="btn ghost" onClick={() => setTally({ n: 0, alicePlus: 0, opposite: 0 })}>
          Reset
        </button>
      </div>
      <p className="ghz-stats mono" role="status">
        {tally.n === 0
          ? both
            ? 'The source will pick one of the matching plans at random for every pair, and nobody sees which.'
            : 'Make the plan match both rows, then hide it.'
          : `${tally.n} pairs: Alice answered +1 in ${tally.alicePlus} (${Math.round((100 * tally.alicePlus) / tally.n)}%) · Bob answered the opposite in ${tally.opposite} of ${tally.n}`}
      </p>
    </WidgetFrame>
  )
}

export default function GhzGame(props: GhzGameProps) {
  const mode = props.mode ?? 'table'
  if (mode === 'pair') return <PairMode rounds={props.rounds ?? 20} seed={props.seed ?? 10} start={props.start ?? 'plus'} editable={props.editable ?? true} onTable={props.onTable} />
  return <GhzThree {...props} mode={mode} />
}

function GhzThree({ mode, rounds = 20, seed = 10, proof = false, start = 'minus', editable = true, onTable }: GhzGameProps & { mode: 'table' | 'quantum' | 'both' }) {
  const [table, setTableState] = useState<GhzTable>(() => startTable(start))
  const [input, setInput] = useState<'random' | GhzRow>('random')
  const [ledger, setLedger] = useState<Ledger>(EMPTY)
  const R = useRef<(() => number) | null>(null)
  const G = useMemo(() => ghzState(), [])
  const usesTable = mode === 'table' || mode === 'both'
  const usesState = mode === 'quantum' || mode === 'both'
  const v = useMemo(() => planVerdict(table), [table])

  const setTable = (t: GhzTable) => {
    setTableState(t)
    setLedger(EMPTY)
    R.current = rng(seed)
    onTable?.(t)
  }
  const play = (n: number) => {
    if (!R.current) R.current = rng(seed)
    const rand = R.current
    const nextTable: GhzRound[] = []
    const nextState: GhzRound[] = []
    for (let k = 0; k < n; k++) {
      const row = input === 'random' ? ghzReferee(rand) : input
      if (usesTable) nextTable.push(ghzRound({ table }, row, rand))
      if (usesState) nextState.push(ghzRound({ state: G }, row, rand))
    }
    setLedger((l) => ({ table: [...l.table, ...nextTable], quantum: [...l.quantum, ...nextState] }))
  }
  const reset = () => {
    R.current = rng(seed)
    setLedger(EMPTY)
  }

  const planSt = useMemo(() => ghzTableau({ table }), [table])
  const stateSt = useMemo(() => ghzTableau({ state: true }), [])

  return (
    <WidgetFrame title={mode === 'quantum' ? 'The GHZ game: share the state |G⟩' : mode === 'both' ? 'The GHZ game: the best plan against |G⟩' : 'The GHZ game: write a plan'}>
      {usesTable && (
        <>
          <Tableau st={planSt} />
          <p className="ghz-caption">Each row is one input: the three letters are what Alice, Bob and Charlie are asked to measure.</p>
          <Toggles table={table} setTable={setTable} editable={editable} />
          <p className="ghz-verdict" role="status">
            {v.wins === 4
              ? 'This plan wins all four inputs.'
              : `This plan wins ${v.wins} of the 4 inputs${v.loses.length ? ` and loses ${v.loses.join(', ')}` : ''}. Its long-run rate is ${v.wins}/4 = ${Math.round(v.longRun * 100)}%.`}{' '}
            The best any of the 64 plans does is {v.best} of 4.
          </p>
          {proof && (
            <p className="ghz-proof mono" role="status">
              Your four row products: {GHZ_ROWS.map((r) => sg(v.values[r])).join(', ')}; multiplied: {sg(v.rowsProduct)}. The four needs: {GHZ_ROWS.map((r) => sg(GHZ_TARGET[r])).join(', ')}; multiplied: {sg(v.targetsProduct)}.
            </p>
          )}
        </>
      )}
      {usesState && (
        <>
          <Tableau st={stateSt} />
          <p className="ghz-caption">
            The shared state is |G⟩ = ½(|000⟩ − |011⟩ − |101⟩ − |110⟩). Each player measures their letter on their own spin; the table shows the product each input is certain to give.
          </p>
        </>
      )}
      <Segmented
        label="The referee's input"
        value={input}
        onChange={setInput}
        options={[{ value: 'random' as const, label: 'random' }, ...GHZ_ROWS.map((r) => ({ value: r as 'random' | GhzRow, label: r }))]}
      />
      <div className="ghz-buttons">
        <button className="btn" onClick={() => play(1)}>
          Play 1 round
        </button>
        <button className="btn" onClick={() => play(rounds)}>
          Play {rounds} rounds
        </button>
        <button className="btn ghost" onClick={reset}>
          Reset
        </button>
      </div>
      {usesTable && <RoundTable title="Your plan" rounds={ledger.table} who="plan" />}
      {usesState && <RoundTable title="Shared state |G⟩" rounds={ledger.quantum} who="state" />}
      {mode === 'both' && ledger.table.length > 0 && <p className="widget-note">Both teams see the same referee inputs, round by round.</p>}
    </WidgetFrame>
  )
}

