/**
 * One Arcade game (route #/arcade/:gameId, Phase 4a item 5). Every verdict comes from the engine: the beam puzzle
 * reads SGLab's exact theory, Bloch golf applies spin.ts rotations to the ket, Spot the error compares with the
 * round's marked step (whose correction games.test.ts checks). Cleared levels go to progress.gameLevel.
 */
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fmt } from '../physics/complex'
import type { BenchTheory } from '../physics/sg'
import { AXIS, KET, blochVector, type NamedKet, type Vec3 } from '../physics/spin'
import type { Vec } from '../physics/linalg'
import { progress, useProgress } from '../progress'
import { Rich } from '../ui/Rich'
import { SGLab } from '../widgets/SGLab'
import { ERROR_ROUNDS, GAMES, GOLF_LEVELS, SG_LEVELS, type GameEntry, type Move, type Trains } from './games'
import { applyMoves, phaseOf, reached } from './golf'
import { TrainsLink } from './TrainsLink'

const pctText = (x: number) => `${(100 * x).toFixed(1)}%`
const KET_TEX: Record<NamedKet, string> = { '+z': '|{+z}\\rangle', '-z': '|{-z}\\rangle', '+x': '|{+x}\\rangle', '-x': '|{-x}\\rangle', '+y': '|{+y}\\rangle', '-y': '|{-y}\\rangle' }

function LevelBar({ game, level, setLevel }: { game: GameEntry; level: number; setLevel: (k: number) => void }) {
  const best = useProgress().games[game.id] ?? 0
  return (
    <ol className="level-bar" aria-label="Levels">
      {Array.from({ length: game.levels }, (_, k) => (
        <li key={k}>
          <button type="button" aria-current={k === level ? 'step' : undefined} data-cleared={k < best} onClick={() => setLevel(k)}>
            <span className="visually-hidden">Level </span>
            {k + 1}
            {k < best && <span className="visually-hidden"> (cleared)</span>}
          </button>
        </li>
      ))}
    </ol>
  )
}

function Solved({ why, trains, onNext, last }: { why: string; trains: Trains; onNext: () => void; last: boolean }) {
  return (
    <div className="game-solved" role="status">
      <p className="game-solved-title">Solved.</p>
      <Rich text={why} />
      <p className="game-solved-trains">
        Trains <TrainsLink t={trains} />
      </p>
      {!last && (
        <button type="button" className="btn" onClick={onNext}>
          Next level
        </button>
      )}
    </div>
  )
}

// ── Route the beam ─────────────────────────────────────────────────────────────────────────────────────────
function RouteTheBeam({ game, level, setLevel }: { game: GameEntry; level: number; setLevel: (k: number) => void }) {
  const l = SG_LEVELS[level]
  const [value, setValue] = useState<number | null>(null)
  const solved = value !== null && Math.abs(value - l.target.fraction) < 1e-9
  const onChange = (_: unknown, t: BenchTheory) => {
    const v = t[l.target.spot]
    setValue(v)
    if (Math.abs(v - l.target.fraction) < 1e-9) progress.gameLevel(game.id, level + 1)
  }
  const source = l.source === 'oven' ? 'the oven (unpolarized)' : `a $${KET_TEX[l.source as NamedKet]}$ beam`
  return (
    <section className="game-level" aria-labelledby="level-title">
      <h2 id="level-title">
        Level {level + 1} of {SG_LEVELS.length} · {l.title}
      </h2>
      <Rich
        className="goal"
        text={`Source: ${source}. Land exactly **${l.target.label}** of the source's atoms on the **${l.target.spot === 'plus' ? '+' : '−'} spot**, with at most ${l.maxDevices} magnets.`}
      />
      <SGLab key={l.id} source={l.source} axes={l.start.axes} keep={l.start.keep} editable maxDevices={l.maxDevices} onChange={onChange} />
      <p className="game-verdict mono" aria-live="polite">
        {l.target.spot === 'plus' ? '+' : '−'} spot now: {value === null ? '…' : pctText(value)} · target {pctText(l.target.fraction)}
        {solved ? ' · solved' : ''}
      </p>
      {solved ? (
        <Solved why={l.why} trains={l.trains} last={level + 1 >= SG_LEVELS.length} onNext={() => setLevel(level + 1)} />
      ) : (
        <details className="hint">
          <summary>Hint</summary>
          <Rich text={l.hint} />
        </details>
      )}
    </section>
  )
}

// ── Spot the error ─────────────────────────────────────────────────────────────────────────────────────────
function SpotTheError({ game, level, setLevel }: { game: GameEntry; level: number; setLevel: (k: number) => void }) {
  const r = ERROR_ROUNDS[level]
  const [picked, setPicked] = useState<number[]>([])
  const found = picked.includes(r.wrong)
  const pick = (i: number) => {
    if (found || picked.includes(i)) return
    setPicked((p) => [...p, i])
    if (i === r.wrong) progress.gameLevel(game.id, level + 1)
  }
  return (
    <section className="game-level" aria-labelledby="level-title">
      <h2 id="level-title">
        Round {level + 1} of {ERROR_ROUNDS.length} · {r.title}
      </h2>
      <p className="goal">One step below is where the argument first goes wrong. Pick it.</p>
      <ol className="error-steps">
        {r.steps.map((s, i) => {
          const state = picked.includes(i) ? (i === r.wrong ? 'wrong-step' : 'fine-step') : found ? 'idle' : 'open'
          return (
            <li key={i} data-state={state}>
              <button type="button" onClick={() => pick(i)} disabled={found || picked.includes(i)} aria-label={`Step ${i + 1}${state === 'fine-step' ? ' (holds)' : state === 'wrong-step' ? ' (the error)' : ''}`}>
                <span className="step-n mono">{i + 1}</span>
                <Rich text={s} as="span" />
              </button>
              {state === 'fine-step' && <p className="step-note">This step holds. Look again.</p>}
            </li>
          )
        })}
      </ol>
      {found && <Solved why={r.why} trains={r.trains} last={level + 1 >= ERROR_ROUNDS.length} onNext={() => setLevel(level + 1)} />}
    </section>
  )
}

// ── Bloch golf ─────────────────────────────────────────────────────────────────────────────────────────────
const AZ = (35 * Math.PI) / 180
const EL = (20 * Math.PI) / 180
function project(v: Vec3, R: number): { x: number; y: number; depth: number } {
  const [x, y, z] = v
  const u = -x * Math.sin(AZ) + y * Math.cos(AZ)
  const w = x * Math.cos(AZ) + y * Math.sin(AZ)
  return { x: R * u, y: -R * (z * Math.cos(EL) - w * Math.sin(EL)), depth: w * Math.cos(EL) + z * Math.sin(EL) }
}

function GolfSphere({ psi, target }: { psi: Vec; target: NamedKet }) {
  const R = 110
  const r = blochVector(psi)
  const t = blochVector(KET[target])
  const eq = Array.from({ length: 65 }, (_, k) => project([Math.cos((k / 64) * 2 * Math.PI), Math.sin((k / 64) * 2 * Math.PI), 0], R))
  // front / back halves of the equator as contiguous runs (a run restarts with M, so no chord across the sphere)
  const eqPath = (front: boolean) =>
    eq
      .map((p, k) => {
        if (p.depth >= 0 !== front) return ''
        const prevIn = k > 0 && eq[k - 1].depth >= 0 === front
        return `${prevIn ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
      })
      .join('')
  const tip = project(r, R)
  const tgt = project(t, R)
  return (
    <svg className="golf-sphere" viewBox="-150 -150 300 300" role="img" aria-label={`State at Bloch point (${r.map((v) => v.toFixed(2)).join(', ')}); target ${target}`}>
      <circle r={R} className="gs-outline" />
      <path d={eqPath(false)} className="gs-back" />
      <path d={eqPath(true)} className="gs-front" />
      {(['x', 'y', 'z'] as const).map((a) => {
        const p = project(AXIS[a], R + 18)
        const q = project(AXIS[a], R)
        const m = project(AXIS[a].map((v) => -v) as Vec3, R)
        return (
          <g key={a}>
            <line x1={m.x} y1={m.y} x2={q.x} y2={q.y} className="gs-axis" />
            <text x={p.x} y={p.y} className="gs-label" textAnchor="middle" dominantBaseline="middle">
              {a}
            </text>
          </g>
        )
      })}
      <circle cx={tgt.x} cy={tgt.y} r={11} className="gs-target" />
      <line x1={0} y1={0} x2={tip.x} y2={tip.y} className="gs-state" />
      <circle cx={tip.x} cy={tip.y} r={6} className="gs-state-dot" />
    </svg>
  )
}

const MOVES: Move[] = (['x', 'y', 'z'] as const).flatMap((axis) => [
  { axis, sign: 1 as const },
  { axis, sign: -1 as const },
])

function BlochGolf({ game, level, setLevel }: { game: GameEntry; level: number; setLevel: (k: number) => void }) {
  const l = GOLF_LEVELS[level]
  const [moves, setMoves] = useState<Move[]>([])
  const psi = useMemo(() => applyMoves(l.start, moves), [l.start, moves])
  const done = moves.length > 0 && reached(psi, l.target) && moves.length >= (l.minMoves ?? 1)
  const play = (m: Move) => {
    if (done) return
    const next = [...moves, m]
    setMoves(next)
    if (reached(applyMoves(l.start, next), l.target) && next.length >= (l.minMoves ?? 1)) progress.gameLevel(game.id, level + 1)
  }
  const ph = done ? phaseOf(psi, l.target) : null
  const sign = ph && Math.abs(ph.im) < 1e-9 && Math.abs(Math.abs(ph.re) - 1) < 1e-9 ? (ph.re > 0 ? '+' : '−') : null
  return (
    <section className="game-level" aria-labelledby="level-title">
      <h2 id="level-title">
        Hole {level + 1} of {GOLF_LEVELS.length} · {l.title}
      </h2>
      <Rich className="goal" text={`From $${KET_TEX[l.start]}$ to $${KET_TEX[l.target]}$ in ${l.par} quarter-turn${l.par === 1 ? '' : 's'} (par).${l.minMoves ? ` Use at least ${l.minMoves}.` : ''}`} />
      <div className="golf">
        <GolfSphere psi={psi} target={l.target} />
        <div className="golf-controls">
          <div className="golf-moves" role="group" aria-label="Quarter turns">
            {MOVES.map((m) => (
              <button key={`${m.axis}${m.sign}`} type="button" className="btn ghost" disabled={done} onClick={() => play(m)}>
                {m.axis} {m.sign > 0 ? '+90°' : '−90°'}
              </button>
            ))}
          </div>
          <p className="game-verdict mono" aria-live="polite">
            strokes {moves.length} · par {l.par}
            {done ? (moves.length <= l.par ? ' · on par' : ' · over par') : ''}
          </p>
          <p className="ket mono">
            ψ = ({fmt(psi[0])}, {fmt(psi[1])})
          </p>
          <div className="golf-edit">
            <button type="button" className="btn ghost" disabled={!moves.length || done} onClick={() => setMoves((m) => m.slice(0, -1))}>
              Undo
            </button>
            <button type="button" className="btn ghost" disabled={!moves.length} onClick={() => setMoves([])}>
              Start over
            </button>
          </div>
        </div>
      </div>
      {done && (
        <>
          {sign && <Rich className="phase-note" text={`Your ket is $${sign}${KET_TEX[l.target]}$${sign === '−' ? ': the same physical state with the opposite sign.' : '.'}`} />}
          <Solved why={l.why} trains={l.trains} last={level + 1 >= GOLF_LEVELS.length} onNext={() => setLevel(level + 1)} />
        </>
      )}
      {!done && (
        <details className="hint">
          <summary>Hint</summary>
          <Rich text={l.hint} />
        </details>
      )}
    </section>
  )
}

export default function GamePage() {
  const { gameId } = useParams()
  const game = GAMES.find((g) => g.id === gameId)
  const best = useProgress().games[gameId ?? ''] ?? 0
  const [level, setLevel] = useState(() => Math.min(best, (game?.levels ?? 1) - 1))
  if (!game) {
    return (
      <div className="page">
        <h1>No game called “{gameId}”</h1>
        <p>
          <Link to="/arcade">Back to the Arcade</Link>
        </p>
      </div>
    )
  }
  const Game = game.kind === 'sg-puzzle' ? RouteTheBeam : game.kind === 'spot-the-error' ? SpotTheError : BlochGolf
  return (
    <div className="page game-page">
      <p className="eyebrow">
        <Link to="/arcade">Arcade</Link> · {game.title}
      </p>
      <h1>{game.title}</h1>
      <p className="section-lede">{game.blurb}</p>
      <LevelBar game={game} level={level} setLevel={setLevel} />
      <Game key={`${game.id}-${level}`} game={game} level={level} setLevel={setLevel} />
    </div>
  )
}
