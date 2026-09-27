# D + W proposal — story navigation and a cinematic feel for every lecture (Phase 4a)

Status: **PROPOSAL — awaiting the user's answers (§6) before any build.** Judge: Claude. Date 2026-09-27.
User brief: "for all lectures make the UI intuitive for all the features to be navigable like a story within
themselves; use awwwards.com for inspiration on how to make a cinematic feel … the earlier animations were also
beautiful". Whatever is decided here goes into the course skill (Phase 4b), so L2–L7 get it by construction.

## 1. What the references do (patterns only, paraphrased)
| Reference (awwwards) | Pattern worth taking | How it maps here |
|---|---|---|
| The Shape of Intelligence (Storytelling / Education nominee) — an exhibition of ideas with working experiments | A **chapter rail** in the chrome ("01 … 08"); every chapter = meta line (n / N · era) + display title + **one hands-on instrument** + a **one-sentence takeaway card** + a link into a **long-form Read mode**; three routes through the same content (Read · Timeline · Sources); **Motion and Sound toggles** in the chrome; the hero is itself an instrument; the last chapter **forks** into the archive instead of just ending | unit = chapter; the widget/stage = instrument; ReviewCard = takeaway; StaticStory = Read mode; Concept map = Timeline; RefList = Sources; SGLab hero already is an instrument |
| Whiteout · An Ascent (Storytelling nominee) — scroll-driven climb | **Progress expressed in the subject's own quantity** (an altimeter), a compact **route nav** of abbreviated stations you can jump between, two-part chapter titles ("Icefall · The Moving Labyrinth"), a single "back down" control | our home page already is a **beamline with stations**; a lecture can be a route of stations (units) with a travelling marker |
Rejected on purpose (common on awwwards, wrong here): scroll-jacking/smooth-scroll hijack (breaks the story's
native-scroll contract and reduced motion), custom cursors (accessibility), preloader counters (the app loads
fast; a fake wait is theatre), sound (lecture notes are read in libraries).

## 2. Audit of today's navigation (1440 × 900, dev build)
1. **Arcade and Concept map are empty stubs** (title only, since v1) while the home page advertises "route beams,
   steer a state around the Bloch sphere, find the error in a derivation" and "how each idea depends on the ones
   before it". The games of the original brief do not exist as a place; challenges live only inside lectures.
2. A lecture is one long page: head → outcomes → unit rail (left) → units → pager. Each unit already runs
   story → Try it → intuition → pitfalls → takeaway card → Play (challenges) — a good order, but nothing on the
   page marks those as the steps of one chapter, and the rail lists units without position, progress or
   "you are here". (Judge correction: an earlier draft of this audit said challenges sat at the lecture's end;
   they are per unit.)
3. The topbar has no way back to the lecture list except the logo, no course progress, and no motion control
   (reduced motion only via the OS or `?motion=reduce`).
4. A lecture ends at the pager; nothing says "you finished 1.x — here is what to do with it" (formulas for this
   lecture, games that train it, the next lecture's question).
5. Help ("Getting unstuck") holds every walkthrough in one list, disconnected from the challenge you were on
   (a challenge links to its walkthrough, but Help cannot send you back).

## 3. Proposal: the beamline, at three scales
Signature: **the beamline**. The course is a beam line of stations (already the home page's lecture list); each
lecture is a beam line of units; the reader is the atom travelling it. A thin silver line with station ticks is
the one navigation device used everywhere, so a reader learns it once. Silver only (structure colour): amber,
cobalt and near-white stay reserved for physics.

### 3.1 Course scale (home + topbar)
```
 SPIN LAB · Physics 448      Lectures ▾   Arcade   Concept map   Formulas   Help      ◐ Motion
 ─────────────────────────────────────────────────────────────────────────────────────────────
 hero: Two spots. Nothing in between.  [SGLab instrument]
 THE LECTURES  ●━━━━━○━━━━━○━━━━━○━━━━━○━━━━━○━━━━━○   (station = lecture; filled = visited; x/y solved)
 WHERE THIS IS HEADING  [Hopf film, scroll-scrubbed]
 Arcade · Concept map · Help cards
```
- "Lectures ▾" opens the course beamline as a panel from any page (jump to any lecture and unit).
- Motion toggle in the chrome (writes the same flag as `?motion=reduce`; the OS setting stays the default).

### 3.2 Lecture scale (every lecture, built by the skill)
```
 ┌ lecture opener (one screen, no pin) ─────────────────────────────────────────────┐
 │ LECTURE 1 · 5 units · 31 beats · ~25 min                                           │
 │ Stern–Gerlach and the birth of the quantum state      (display type, word reveal) │
 │ the question this lecture answers, one line                                        │
 └───────────────────────────────────────────────────────────────────────────────────┘
 route rail (sticky, left edge; replaces today's unit list):
   SG ●━━━━━━ SEQ ○━━━━━━ AVG ○━━━━━━ LOGIC ○━━━━━━ VEC ○        silver atom = your scroll position
 each unit = a chapter:
   chapter card   "02 / 05 · Sequential magnets · a new axis erases the old answer"
   story beats    (today's pinned stage + text; unchanged)
   step strip     Story · Try it · Intuition · Pitfalls · Takeaway · Play — today's order, now visible as the
                  chapter's own mini route (the current step lit), so a reader knows what comes next
 end of lecture = a fork, not a pager:
   ▸ Next: L2's opening question   ▸ Games that train L1   ▸ L1 formula board   ▸ Where L1 sits on the map
```
- Keyboard: `[` / `]` previous/next unit, `j` / `k` previous/next beat (announced to screen readers).
- **Read mode** toggle on every lecture: the static reading column (today's < 900 px version) for anyone who
  prefers it — the same content, no pinned stage.

### 3.3 Feature scale (Arcade, Concept map, Help)
- **Arcade = games per lecture station**, built from the engine and existing widgets (route a beam through
  magnets to hit a target split; steer a state on the Bloch sphere to a target with limited rotations; spot the
  error in a worked derivation — the errata already found make real rounds). Every game names the lecture and
  unit it trains and links back into that chapter.
- **Concept map** = the content graph (units, prerequisites, formulas) drawn as the same beamline language:
  lectures as lines, concepts as stations, dependencies as branch lines; clicking a station opens that chapter.
- **Help** keeps "four questions", and every walkthrough gets "back to the challenge" + "back to the chapter".

## 4. Motion: the closed list (nothing else moves)
1. Lecture opener: title words rise in once on load (GSAP, 600 ms, no loop).
2. Route-rail atom glides with scroll (native scroll, scroll-linked, no smoothing lag > 0.3 s).
3. Chapter card: the "02 / 05" counter and title reveal as the card crosses 60 % of the viewport (once).
4. Stage transitions between beats — **unchanged** (the ones the user liked).
5. Opener films (Hopf on home; belt at L7 §7.2) — unchanged.
6. Page-to-page: a 250 ms fade of the main column (no slide, no wipe of the stage).
Reduced motion: 1–3 and 6 become instant; 4 cuts (as today); films show posters.
Not allowed: parallax on prose, marquee text, custom cursor, scroll-jacking, looping idle motion outside the
home hero.

## 5. Build cost and order (if approved)
1. Topbar + motion toggle + "Lectures" panel (W) · 2. lecture opener + route rail + chapter cards + step
strip (W/D) · 3. end-of-lecture fork (W/P copy) · 4. Read-mode toggle (W) ·
5. Arcade v1 (3 games, engine-backed, P claims) · 6. Concept map v1 (D/W) · 7. e2e + visual QA + security pass.
Items 1–4 go into the skill templates; 5–6 grow with every lecture.

## 6. Questions for the user (decide before building)
Q1 Lecture navigation device: beamline route rail (units as stations, travelling atom) · numbered chapter index
   ("01 / 05" list, Shape-of-Intelligence style) · both (rail on the left, numbers on the chapter cards).
Q2 Arcade and Concept map are empty but advertised: build them now in this phase · hide the links until they
   exist and build after L2–L7 · build Arcade now, Concept map later.
Q3 Read mode toggle for every reader (not only < 900 px): yes · no.
