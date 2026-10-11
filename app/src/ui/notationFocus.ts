/**
 * Which formulas the keyboard can reach, and where Tab stops (notation explainers; review #1).
 *
 * A formula with notation marks is a focus target, but not a Tab stop of its own: a chapter has hundreds of them, and the
 * review counted 282 stops in L4 alone. Formulas are gathered into READING GROUPS (a story beat with its derivation, a
 * review card, one Play challenge, the intuition with its pitfalls, a Try-it block, the chapter head). Each group has ONE
 * Tab stop, its formula `tabindex="0"`; the others are `tabindex="-1"`. The arrow keys walk every mark of the group across
 * its formulas (components/NotationRuntime.tsx), and moving to another formula moves the stop with it (a roving
 * tabindex): Tab and Shift+Tab then go to the next or previous GROUP. Enter opens the card; focus alone never does.
 *
 * Entry chunk, a few hundred bytes: `Tex` (ui/Rich.tsx) asks for a group to be settled after it renders, and the lazy
 * listener uses the same helpers to move the stop.
 */

/** The elements that gather formulas into one reading group (the nearest ancestor wins). */
export const NOTATION_GROUP = '.story-beat, .static-beat, .review-card, .challenge, .stage, .unit-head, .lecture-head'

/**
 * Where a mark is not explained: in a popover or a card, in a stage label or passport, and inside a control (a button, a
 * link, a summary, a field), where a press means the control's own action.
 */
export const NOTATION_UNEXPLAINED = '.notation-card, .notation-hint, .gloss-pop, .stage-label, .stage-passport, button, a, summary, label, input, select, textarea, [role="button"]'

/** The group a formula (a `.katex` box) belongs to: its nearest reading group, else the wrapper `Tex` put around it. */
export const groupOf = (host: Element): Element => host.closest(NOTATION_GROUP) ?? host.parentElement ?? host

/** The formulas of a group that have marks and are explained, in reading order (KaTeX's `.katex` boxes). */
export function explainedFormulas(group: ParentNode): HTMLElement[] {
  return [...group.querySelectorAll<HTMLElement>('.katex')].filter((k) => k.querySelector('[data-notation]') && !k.closest(NOTATION_UNEXPLAINED))
}

/** A formula that is on the page now (a hidden hint or a closed fold has no boxes). */
const shown = (el: HTMLElement) => el.getClientRects().length > 0

const pending = new Set<Element>()
let scheduled = false

/** Give each queued group exactly one Tab stop: its remembered formula (`data-nfocus`) if still shown, else its first shown one. */
function settle() {
  scheduled = false
  const groups = [...pending]
  pending.clear()
  const plan = groups
    .filter((g) => g.isConnected)
    .map((g) => {
      const hosts = explainedFormulas(g)
      const vis = hosts.map(shown) // all the reads first
      const keep = hosts.find((h, i) => vis[i] && h.hasAttribute('data-nfocus')) ?? hosts.find((_, i) => vis[i])
      return { hosts, keep }
    })
  for (const { hosts, keep } of plan)
    for (const h of hosts) {
      // a formula that also holds term links is already a Tab stop of the glossary's (ui/Rich.tsx `useFocusableTerms`)
      if (h.hasAttribute('data-term')) continue
      h.tabIndex = h === keep ? 0 : -1
    }
}

/** After a `Tex` renders marks: settle the Tab stop of the group it sits in (once per frame, however many formulas render). */
export function rovingMarks(root: Element | null): void {
  if (!root) return
  pending.add(root.closest(NOTATION_GROUP) ?? root)
  if (scheduled) return
  scheduled = true
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(settle)
  else queueMicrotask(settle)
}

/** The keyboard moves to `host`: it becomes the group's one Tab stop, and the others give theirs up. */
export function setStop(host: HTMLElement): void {
  for (const h of explainedFormulas(groupOf(host))) {
    if (h === host) {
      h.tabIndex = 0
      h.setAttribute('data-nfocus', '')
    } else {
      h.removeAttribute('data-nfocus')
      if (!h.hasAttribute('data-term')) h.tabIndex = -1
    }
  }
}
