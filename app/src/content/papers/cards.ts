/**
 * A paper's card on the shelf (the light registry, meta.generated.ts): enough to list it and link its pages, without its
 * spec. Generated from the specs by content/meta.test.ts (UPDATE_META=1).
 */
export interface PaperCard {
  id: string
  kind: 'paper' | 'background'
  title: string
  /** kind 'paper' only */
  shortTitle?: string
  authors?: string[]
  arxiv?: { id: string; version: number }
  date?: string
  institution?: string
  licence?: string
  /** How many references the lecture used, and how many prerequisite ideas it lists. */
  references: number
  prerequisites: number
}
