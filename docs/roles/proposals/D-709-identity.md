# D proposal: Physics 709 identity "Cryostat"

Status: **PROPOSED 2026-09-27**. Mockup: `D-709-identity/mockup.html`.

## 1. Idea
448 is a glass plate on a bench; 709 is the inside of a dilution refrigerator. The fridge is always cold, so the chrome
(top bar, home, opener, return bar) is navy in **both** schemes. Only the reading surface flips: frost paper or vacuum
navy.

## 2. Palette
| Name | Hex | Role |
|---|---|---|
| Shield / can / vacuum navy | #0b1530 / #0e1934 / #070d20 | chrome bands / dark surface / dark ground |
| Frost, rime, rime dim | #eaf1fa, #a9b8d4, #8a9aba | type on navy |
| Hairline | #26365e | rules on navy |
| **Gilt** | #f2e8c8 | plates, rods, temperatures, wordmark (chrome only) |
| **Rose copper** | #c4705f | coax, attenuators (chrome only, never text) |
| Frost paper, paper 2 | #f2f5fa, #e7ecf4 | light reading surface |
| Navy ink 1/2/3 | #0b1733, #3d4a66, #56637d | light text |
| Plate tints, 300 K→10 mK | #18223d #141e38 #111a33 #0d162d #0a1227 #070d20 | colder = deeper |
| Stage ground | #101830 | proposed `STAGE_THEME.qc709` |

**ΔE00 (target ≥ 20):** gilt vs amber #f0a93a **22.7** (vs light `--up` #c9820c 30.4); copper **28.0** (22.8). This
forces a champagne gold: a yellower #d9c690 scores only 15.4. For the same reason plates are flat fills, never gradients.
Kets in prose: dark #f0a93a / #7f95ff; light #8a5600 (|0⟩, amber darkened for text) / #3552d0 (|1⟩).

**Contrast (WCAG, computed, worst case):**
- Dark: frost 13.8, rime 7.9, rime dim 5.5, gilt 12.9 (lightest tint); amber 8.7, cobalt 6.3; navy on gilt 14.7.
- Light (#e7ecf4): ink 14.9, ink 2 7.5, ink 3 5.1, |0⟩ 5.2, |1⟩ 5.4.
- Stage: amber 8.7, cobalt 6.4, orchid 7.5, silver 7.0. Print: 6.1 or better.

Copper measures 4.4:1, so it is never text.

## 3. Type
- **Archivo Expanded** (width 108–125 %): display, labels, temperatures; engraved-plate feel, opposite to 448's
  condensed Barlow.
- **Atkinson Hyperlegible Next**: Ground-up body and UI.
- **STIX Two Text**: Formal body and math, the physics-journal face.

The track toggle switches the beat's typeface, so the face tells you the track. Self-hosted in the app; KaTeX stays.

## 4. Layout
- **Home:** hero plus a "Where you stopped" card, then the descent index (temperature, chandelier, Parts).
- **Chapter:** navy opener (toggles, outcomes, descent gauge), then 448's anatomy: rail, unit card, beats 45 / stage 55.
- **Bridge:** a chip carrying a swatch of 448's glass and its typeface, "↑ Spin Lab 2.5". Up means out of the fridge.
- **Return bar:** on the 448 page, navy with a gilt edge: "↓ Return to 709 · Chapter Q8 · Bell states, step 4". The
  beat is re-centred and outlined once.
- **Print:** Read mode in the active track; bridges become footnotes; figures redrawn in print colours.
- **390 px:** plates stack left-aligned; the coax runs down the gutter.

## 5. Signature: the chandelier index
The table of contents is the refrigerator: gilt plates narrowing downward, rods, copper coax with attenuators, the
qubit chip at the bottom. Temperature is the unit of progress: the top bar reads "Stage 4 K"; each opener's gauge
shows the plates passed.

## 6. Parts → plates
| Plate | Parts |
|---|---|
| 300 K top flange (steel; room temperature, where 448 lives) | F Foundations, I QM review |
| 50 K first pulse tube | II Qubits and circuits, III Density matrix |
| 4 K second pulse tube | IV Entanglement, V Dynamics and measurement |
| 800 mK still | VI Cryptography, VII Algorithms |
| 100 mK cold plate | VIII Machines, IX Error correction |
| 10 mK mixing chamber | X Information, XI Hardware, ending on the chip |

Two Parts per plate, in course order. Openers descend: the copper line grows from 300 K to the chapter's plate.

## 7. Shared with 448
- **Frame:** top-bar layout (switcher beside the wordmark), toggles, rail, unit card, step strip, fork, stage kinds.
- **Meaning:** amber |0⟩ ≡ |+z⟩, cobalt |1⟩ ≡ |−z⟩, near-white state, silver structure, orchid operators (now also
  gate boxes).
- A 448 page stays exactly 448; the return bar is the only 709 material on it.

**Motion (closed list):** the opener descent (once), one microwave pulse down the home coax (9 s loop, home only), the
return highlight (once). Reduced motion and the Motion toggle turn all three off.

## 8. Risks
- Pale gilt can read as cream; the copper beside it carries the "metal".
- Copper sits near `--bad` #f07a63 (ΔE00 8.7): drawn cable only.
- Two body faces could feel like two apps (mitigated by one layout, one stage).
- Navy chrome makes light mode heavier than 448's; expanded type needs short titles (about 24 characters at 390 px).
- The plate mapping is a metaphor: no caption may say a topic "happens" at a temperature.
- **Found in 448:** as text on #e4eaee, light `--up` #c9820c is 2.59:1 and `--ink-3` is 3.57:1. The mockup uses
  #8a5600 and `--ink-2`; I propose 448 does the same.

## 9. For the user to decide
1. Champagne gilt #f2e8c8, or a different gold-to-copper balance.
2. Two Parts per plate, or Foundations alone at 300 K.
3. A typeface per track, or one body face.
4. Navy chrome in light mode, or a lighter chrome.
