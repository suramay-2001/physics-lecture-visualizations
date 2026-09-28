# Design spec: Cryostat (Physics 709 identity)

Source of truth: `docs/roles/proposals/D-709-identity.md` (proposal + risks) and its approved mockup
`docs/roles/proposals/D-709-identity/mockup.html`; rulings `docs/roles/decisions/qc709-map.md` "Identity
approved"; implementation: `app/src/styles/{theme-cryostat.css,course709.css,chapter709.css}`. This spec is the
short reference; read the CSS files for exact rule bodies.

## 1. Idea

448 is a glass plate on a bench; 709 is the inside of a dilution refrigerator. The fridge is **always cold**, so
the chrome (top bar, home bands, return bar) is navy in both colour schemes. Only the reading surface flips
between frost paper (light) and vacuum navy (dark). Applies only under `:root[data-course='qc709']`, set from
the URL before first paint (`main.tsx`) — a 448 page never matches a Cryostat rule.

## 2. Tokens (`theme-cryostat.css`)

| Token | Hex | Role |
|---|---|---|
| `--shield` | `#0b1530` | chrome band (top bar bg) |
| `--can` | `#0e1934` | chrome panel bg (dropdowns) |
| `--vacuum` | `#070d20` | darkest ground / dark-scheme plate |
| `--frost` | `#eaf1fa` | primary text on navy |
| `--rime` / `--rime-dim` | `#a9b8d4` / `#8a9aba` | secondary/tertiary text on navy |
| `--hair` | `#26365e` | rules on navy |
| `--gilt` | `#f2e8c8` | **chrome only**: plates, rods, temperatures, wordmark |
| `--copper` | `#c4705f` | **chrome only, never text** (4.4:1 — fails text contrast on purpose) |
| `--plate` / `--plate-2` (light) | `#f2f5fa` / `#e7ecf4` | reading surface |
| `--ink` / `--ink-2` / `--ink-3` (light) | `#0b1733` / `#3d4a66` / `#56637d` | reading text, 3 weights |
| `--t300…--t10` | `#18223d → #070d20` | one tint per plate (300 K → 10 mK); colder = deeper, flat fills only |
| `--up-text` | `#8a5600` (light) / `#f0a93a` (dark) | `\|0⟩` in prose (amber darkened for light-mode text) |

`--up` / `--down` (amber/cobalt outcome colours) are **shared with 448**, unchanged — a bridge must never change
what a colour means. Gold and copper never reach the stage; amber still means `+`/`\|0⟩` there.

**ΔE00 (target ≥ 20, forced the champagne gilt over a yellower gold):** gilt vs amber 22.7 (light `--up` 30.4);
copper 28.0 (22.8). A yellower `#d9c690` only scores 15.4 — rejected. Worst-case WCAG contrast: dark frost 13.8,
rime 7.9, rime-dim 5.5; light ink 14.9, ink-2 7.5, ink-3 5.1; stage amber 8.7, cobalt 6.4 both schemes.

## 3. Faces per track (`--font-display` / `--font-body` / `--font-formal`)

| Face | Use |
|---|---|
| Archivo Expanded (108–125% width) | display: headings, labels, temperatures — the "engraved plate" feel |
| Atkinson Hyperlegible Next | Ground-up track body/UI |
| STIX Two Text | Formal track body/math — the physics-journal face |

The track toggle switches the beat body's typeface (`chapter709.css` `.lecture[data-track='formal']`), so the
face itself tells you which track you're reading. Self-hosted; KaTeX unchanged.

## 4. Plates and Parts (six plates, two Parts each, course order; `chapter709.css` descent gauge)

| Plate | Temp | Parts |
|---|---|---|
| Top flange | 300 K | F Foundations, I QM review (where 448 also "lives") |
| First pulse tube | 50 K | II Qubits and circuits, III Density matrix |
| Second pulse tube | 4 K | IV Entanglement, V Dynamics and measurement |
| Still | 800 mK | VI Cryptography, VII Algorithms |
| Cold plate | 100 mK | VIII Machines, IX Error correction |
| Mixing chamber | 10 mK | X Information, XI Hardware (ends on the chip) |

Openers descend: the copper line grows from 300 K to the chapter's own plate. No caption may say a topic
"happens" at a temperature — the plate mapping is a metaphor, stated once, never literalized.

## 5. Chrome, stage rules, and the rail's reading controls

- **Chrome:** top-bar layout, toggles, rail, unit card, step strip, fork and stage kinds are **shared** with 448
  (frame only — 448's own page stays exactly 448; the return bar is the only 709 material that ever appears on a
  448 page).
- **No gold or copper on stage, ever.** The stage keeps 448's reserved encodings: amber `\|0⟩`/`+`, cobalt
  `\|1⟩`/`−`, near-white the state, silver structure, orchid operators (now also gate boxes). `STAGE_THEME[course]`
  (`stage/tokens.ts`) sets only the stage *background*, never the reserved semantic colours.
- **The rail's reading controls** (`chapter709.css`, following the 6dfc2d9 pattern also used by 448): a compact
  Story/Read toggle and — for a two-track course only — an independent `TrackToggle`, both live in the sticky
  rail so a reader never has to scroll to the top to change either. Switching either control calls
  `flushReadingProbe()` synchronously in its own handler (not the once-per-frame probe) so the reading position
  it keeps is the position at the moment of the switch, not a stale one (`17-flake-hunt` documents why).
- **Signature element:** the chandelier index (table of contents as the refrigerator itself — gilt plates
  narrowing downward, copper coax with attenuators, the qubit chip at the bottom); temperature is the unit of
  progress ("Stage 4 K" in the top bar).
- **Closed motion list:** the opener descent (once), one microwave pulse down the home coax (9 s loop, home
  only), the return-bar highlight (once). Reduced motion and the app's Motion toggle turn all three off.

## 6. Known risks (carried from the proposal, still true)

Pale gilt can read as cream without the copper beside it; copper sits close to `--bad` (ΔE00 8.7) so it is drawn
cable only, never a status colour; two body faces risk feeling like two apps (mitigated by one shared layout and
shared stage); navy chrome makes light mode heavier than 448's, so titles must stay short (~24 characters at
390 px) for the expanded face.
