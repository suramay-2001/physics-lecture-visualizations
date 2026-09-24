import katex from 'katex'
import { Fragment, useMemo, type ReactNode } from 'react'

/** Render a TeX string. `display` gives a centered block equation. */
export function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: display, throwOnError: false, strict: 'ignore' }),
    [children, display],
  )
  return display ? (
    <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Inline formatting: $tex$, **bold**, *italic*. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\$([^$]+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyBase}-${k++}`
    if (m[1] !== undefined) out.push(<Tex key={key}>{m[1]}</Tex>)
    else if (m[2] !== undefined) out.push(<strong key={key}>{inline(m[2], key)}</strong>)
    else out.push(<em key={key}>{inline(m[3], key)}</em>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * Rich string → paragraphs. Blank line separates paragraphs; `$$…$$` is a display equation;
 * lines starting with "- " form a list.
 */
export function Rich({ text, as = 'div', className }: { text: string; as?: 'div' | 'span'; className?: string }) {
  const blocks = useMemo(() => text.trim().split(/\n\s*\n/), [text])
  if (as === 'span') return <span className={className}>{inline(text, 's')}</span>
  return (
    <div className={className ? `rich ${className}` : 'rich'}>
      {blocks.map((block, i) => {
        const parts = block.split(/\$\$([\s\S]+?)\$\$/g)
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
