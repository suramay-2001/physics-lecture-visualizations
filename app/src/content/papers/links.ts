/**
 * The Papers section's reading links (like the books' links in content/refs.ts: content, rendered as ordinary
 * `<a rel="noopener noreferrer">`, never fetched by the page): a paper's or a reference's arXiv abstract page and its DOI
 * resolver. Each URL is BUILT from an identifier that matches its closed pattern (papers/validate.ts checks the specs too),
 * never taken from data, so a spec cannot point a link anywhere else. Lazy: the papers pages import it.
 */
const ARXIV_ID = /^(?:\d{4}\.\d{4,5}|[a-z]+(?:-[a-z]+)*\/\d{7})$/
const DOI = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/

/** 'https://arxiv.org/abs/2506.03094v1', or undefined for an id that is not an arXiv identifier. */
export const arxivHref = (id: string, version?: number): string | undefined =>
  ARXIV_ID.test(id) && (version === undefined || (Number.isInteger(version) && version >= 1)) ? `https://arxiv.org/abs/${id}${version ? `v${version}` : ''}` : undefined

/** 'https://doi.org/10.1038/…', or undefined for a string that is not a DOI. */
export const doiHref = (doi: string): string | undefined => (DOI.test(doi) ? `https://doi.org/${doi}` : undefined)
