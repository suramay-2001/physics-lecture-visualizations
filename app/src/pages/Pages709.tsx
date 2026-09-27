/**
 * Physics 709's Map, Arcade, Formulas and Help (W-709-platform §A "Pages"). No 709 chapter is written yet, so each
 * page says what it will hold and points back to the course home; the real pages grow out of the course pack
 * (content/qc709/pack.ts) as chapters land. Lazy chunk (App.tsx): nothing here reaches 448's first paint.
 */
import { Link } from 'react-router-dom'
import { COURSES } from '../content/courses'
import { coursePath } from '../paths'

function Coming709({ eyebrow, title, lede, holds }: { eyebrow: string; title: string; lede: string; holds: string }) {
  return (
    <div className="page page-709">
      <p className="eyebrow">
        {COURSES.qc709.code} · {eyebrow}
      </p>
      <h1>{title}</h1>
      <p className="section-lede">{lede}</p>
      <div className="coming-709" role="note">
        <p className="eyebrow">Coming with the first chapters</p>
        <p>{holds}</p>
        <p>
          <Link to={coursePath('qc709')}>See the chapter plan on the course home</Link>
        </p>
      </div>
    </div>
  )
}

export function Map709() {
  return (
    <Coming709
      eyebrow="Map"
      title="Concept map"
      lede="How each chapter depends on the ones above it, drawn as the same stack of plates as the course home."
      holds="Each written chapter adds its ideas here, with lines to what they build on (including the Spin Lab units they bridge to) and to what builds on them."
    />
  )
}

export function Arcade709() {
  return (
    <Coming709
      eyebrow="Arcade"
      title="Arcade"
      lede="Short rounds on the same engine as the chapters: circuits to complete, states to prepare, derivations with one wrong step."
      holds="Every game names the chapter it trains. The first games arrive with the qubit and circuit chapters."
    />
  )
}

export function Formulas709() {
  return (
    <Coming709
      eyebrow="Formulas"
      title="The boards"
      lede="Every equation the chapters leave on the board, in order and in both tracks, ready to print."
      holds="Each written chapter adds its board here, linked back to the step it comes from."
    />
  )
}

export function Help709() {
  return (
    <Coming709
      eyebrow="Help"
      title="Getting unstuck"
      lede="Worked walkthroughs for every challenge, and a way back to the step you were on."
      holds="Homework problems assigned in the course get hints only, never a walkthrough."
    />
  )
}
