/**
 * Physics 709's faces (approved Cryostat identity, D-709-identity §3), self-hosted like 448's (styles/fonts.ts; the
 * CSP allows only same-origin fonts): Archivo with its width axis (display, labels, temperatures: 108–125 %),
 * Atkinson Hyperlegible Next (Ground-up body and UI) and STIX Two Text (the Formal track and its maths).
 *
 * Loaded by a dynamic import when the reader is in 709 (main.tsx / App.tsx), so their @font-face rules and files never
 * weigh on 448's first paint; the families are named in styles/theme-cryostat.css with system fallbacks, so text is
 * readable while they arrive (font-display: swap). Licences: public/licenses/fonts/.
 */
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource-variable/atkinson-hyperlegible-next/wght-italic.css'
import '@fontsource-variable/stix-two-text/wght.css'
import '@fontsource-variable/stix-two-text/wght-italic.css'

export const FONTS_709 = ['Archivo Variable', 'Atkinson Hyperlegible Next Variable', 'STIX Two Text Variable'] as const
