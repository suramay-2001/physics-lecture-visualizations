/**
 * Rich strings → React (W-L1 §1.3, §4.1). Syntax (tokenizer shared with content/walk.ts):
 *   $…$ inline TeX · $$…$$ display TeX · **bold** · *italic* · blank line = paragraph · "- " lines = list
 *   [[id]] / [[id|shown]]  gloss button + popover (components/Gloss.tsx)
 *   {{id|shown}}           prose term link (class `term term-${id}`)
 *   <<id|shown>>           bridge into Spin Lab with a way back (components/BridgeLink.tsx)
 *   \htmlClass{term-id}{…} TeX term link (trusted renderer only)
 * Ids failing /^[a-z0-9-]+$/ render as plain text (and the content test fails).
 *
 * All authored TeX goes through `renderAuthoredTex` (ui/tex.ts). `<UserTex>` is the ONLY component that
 * may receive <input>-derived strings. Term links: hover/focus → `setFocusTerm` (event delegation on the
 * container; no handlers injected into KaTeX HTML); KaTeX term spans get tabIndex 0 in a layout effect.
 * Every Rich block sits in an IslandBoundary: a failure shows the source text, never a blank page.
 */
import { Fragment, useLayoutEffect, useMemo, useRef, type FocusEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { BridgeLink } from '../components/BridgeLink'
import { Gloss } from '../components/Gloss'
import { inlineTokens, splitDisplay } from '../content/walk'
import { setFocusTerm } from '../stage/store'
import { IslandBoundary } from './ErrorBoundary'
import { renderAuthoredTex, renderUserTex } from './tex'

/** Render an authored TeX string. `display` gives a centered block equation. */
export function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = useMemo(() => renderAuthoredTex(children, display), [children, display])
  return display ? <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Render TeX a student typed (trust off, size caps). The only sink for <input>-derived strings. */
export function UserTex({ src, display = false }: { src: string; display?: boolean }) {
  const html = useMemo(() => renderUserTex(src, display), [src, display])
  return display ? <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Inline formatting of one paragraph / span. */
function inline(text: string, keyBase: string): ReactNode[] {
  return inlineTokens(text).map((tok, k) => {
    const key = `${keyBase}-${k}`
    switch (tok.t) {
      case 'text':
        return tok.v
      case 'tex':
        return <Tex key={key}>{tok.v}</Tex>
      case 'bold':
        return <strong key={key}>{inline(tok.v, key)}</strong>
      case 'italic':
        return <em key={key}>{inline(tok.v, key)}</em>
      case 'gloss':
        return tok.valid ? (
          <Gloss key={key} id={tok.id}>
            {inline(tok.shown, key)}
          </Gloss>
        ) : (
          <Fragment key={key}>{tok.shown}</Fragment>
        )
      case 'term':
        return tok.valid ? (
          <span key={key} className={`term term-${tok.id}`} data-term={tok.id} tabIndex={0}>
            {inline(tok.shown, key)}
          </span>
        ) : (
          <Fragment key={key}>{tok.shown}</Fragment>
        )
      case 'bridge':
        return tok.valid ? (
          <BridgeLink key={key} id={tok.id}>
            {tok.shown}
          </BridgeLink>
        ) : (
          <Fragment key={key}>{tok.shown}</Fragment>
        )
    }
  })
}

/** The term id of the nearest term link around a node (prose `.term` or KaTeX `.enclosing.term-…`). */
function termOf(node: EventTarget | null): string | null {
  if (typeof Element === 'undefined' || !(node instanceof Element)) return null
  const el = node.closest<HTMLElement>('.term, .enclosing[class*="term-"], .katex[data-term]')
  if (!el) return null
  if (el.dataset.term) return el.dataset.term
  for (const c of el.classList) if (c.startsWith('term-')) return c.slice(5)
  return null
}

const onOver = (e: PointerEvent) => {
  const id = termOf(e.target)
  if (id) setFocusTerm(id)
}
const onOut = (e: PointerEvent) => {
  if (termOf(e.target) && termOf(e.relatedTarget) !== termOf(e.target)) setFocusTerm(termOf(e.relatedTarget))
}
const onFocus = (e: FocusEvent) => {
  const id = termOf(e.target)
  if (id) setFocusTerm(id)
}
const onBlur = (e: FocusEvent) => {
  if (termOf(e.target)) setFocusTerm(termOf(e.relatedTarget))
}

/**
 * TeX term links become keyboard-focusable (the renderer cannot add attributes). KaTeX's visual HTML is
 * `aria-hidden` (screen readers get the MathML), so the focus target is the enclosing `.katex` element,
 * tagged `data-term` with the FIRST term of that formula; hover still resolves each inner term.
 */
function useFocusableTerms(ref: RefObject<HTMLElement | null>, text: string) {
  useLayoutEffect(() => {
    if (!text.includes('\\htmlClass')) return
    ref.current?.querySelectorAll<HTMLElement>('.enclosing[class*="term-"]').forEach((el) => {
      const katexEl = el.closest<HTMLElement>('.katex')
      const id = [...el.classList].find((c) => c.startsWith('term-'))?.slice(5)
      if (katexEl && id && !katexEl.hasAttribute('tabindex')) {
        katexEl.tabIndex = 0
        katexEl.dataset.term = id
      }
    })
  }, [ref, text])
}

const handlers = { onPointerOver: onOver, onPointerOut: onOut, onFocus, onBlur }

function RichBody({ text, as, className }: { text: string; as: 'div' | 'span'; className?: string }) {
  const ref = useRef<HTMLDivElement & HTMLSpanElement>(null)
  useFocusableTerms(ref, text)
  const blocks = useMemo(() => text.trim().split(/\n\s*\n/), [text])
  if (as === 'span')
    return (
      <span ref={ref} className={className} {...handlers}>
        {inline(text, 's')}
      </span>
    )
  return (
    <div ref={ref} className={className ? `rich ${className}` : 'rich'} {...handlers}>
      {blocks.map((block, i) => {
        const parts = splitDisplay(block)
        if (parts.length > 1) {
          return (
            <Fragment key={i}>
              {parts.map((p, j) =>
                j % 2 === 1 ? (
                  <Tex key={j} display>
                    {p.trim()}
                  </Tex>
                ) : p.trim() ? (
                  <p key={j}>{inline(p.trim(), `${i}-${j}`)}</p>
                ) : null,
              )}
            </Fragment>
          )
        }
        const lines = block.split('\n')
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2), `${i}-${j}`)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inline(block.replace(/\n/g, ' '), String(i))}</p>
      })}
    </div>
  )
}

/**
 * Rich string → paragraphs. Blank line separates paragraphs; `$$…$$` is a display equation;
 * lines starting with "- " form a list.
 */
export function Rich({ text, as = 'div', className }: { text: string; as?: 'div' | 'span'; className?: string }) {
  return (
    <IslandBoundary
      name="rich"
      resetKeys={[text]}
      fallback={
        <span className="rich-fallback" title="couldn't typeset">
          {text}
        </span>
      }
    >
      <RichBody text={text} as={as} className={className} />
    </IslandBoundary>
  )
}
