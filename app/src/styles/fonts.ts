/**
 * Self-hosted OFL fonts (owner: S; W-L1 §4.5, S-L1 §4c, decision #11). Replaces the Google Fonts <link>s, which
 * sent every visitor's IP and user agent to Google on each page load (finding S-03). Vite bundles the woff2
 * files into dist/assets, so every font request is same-origin and `font-src 'self' data:` holds.
 *
 * Weights mirror the old Google request exactly:
 *   Barlow Condensed 500/600/700 · Literata opsz 7..72 × wght (variable) + italic · Martian Mono 400/500.
 * Each CSS file declares every subset with a `unicode-range`, so the browser downloads only the subsets a page
 * uses (Latin, plus Greek for Literata: ψ θ φ ħ-adjacent text). Licences: public/licenses/fonts/.
 */
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource-variable/literata/opsz.css'
import '@fontsource-variable/literata/opsz-italic.css'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/500.css'
import './fonts.css'
