/**
 * The vocabulary of a notation mark (notation explainers): the keys its `data-*` attributes may carry, the shape of an id and
 * of an encoded value. The trusted renderer (ui/tex.ts, in the entry chunk) needs only this; the encoder and decoder
 * (ui/notationCodec.ts) are lazy.
 */

/** The data keys a mark may carry besides `notation` (the id). The trusted renderer allows exactly these. */
export const NOTATION_KEYS = ['lo', 'hi', 'of', 'a', 'm', 'b'] as const
export type NotationKey = (typeof NOTATION_KEYS)[number]
export type NotationCtx = Partial<Record<NotationKey, string>>

/** A notation id: lowercase words joined by hyphens. */
export const NOTATION_ID = /^[a-z][a-z0-9-]{0,23}$/
/** An encoded value: letters, digits and `.`, at most this long (≈ 60 characters of TeX before escapes). */
export const NOTATION_VALUE = /^[A-Za-z0-9.]{0,320}$/
