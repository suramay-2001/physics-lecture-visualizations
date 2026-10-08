# P-L8 — Lecture 8 story plan: the variance sum, photon polarization, BB84

Role P, proposal only (nothing under `app/` touched). One track (448), format of `P-L7-story.md` compressed to the
skill-03 section list. Chapter by topic (judge ruling 1): **L8 notes §§8.1–8.9 + L9 notes §§9.1–9.3** (all of BB84,
including "what Eve learns" and m = 100). L9's chapter is composite systems only.

**Sources read.** `sources/L8/text.md` (11 pp.; p.3 rendered: the "draw photon polarization" box is a board cue, no
figure), `sources/L9/text.md` pp. 1–6 (p.5 rendered: one boxed sentence, no figure), Townsend 2e §2.7 pp. 59–65 (PDF
75–81: eqs. 2.109–2.120, Example 2.8), Susskind not used here. Cross-checked against the built 709 Q2 `q2-photon` unit.

**Evidence.** Every number below was computed twice: `plan448-engine.ts` (imports `app/src/physics/{spin,linalg,
complex,random,density}.ts` and `physics/qc/*`, bundled with the app's rolldown into the scratchpad) and an independent
`plan448-numpy.py` (exact enumeration for BB84, random pure states for the sum). Both agree to 1e-12 (scratchpad
`plan448/`). Seeded Monte-Carlo runs are used only as picture checks (Q̂ within 3σ of ¼), never as prose numbers.

**Rosetta (one line each, at first use).**
- Notes' ϑ (linear-polarization angle from H) → **χ**, as in L1 (`photon45`) and the `optical` fidelity text; θ stays
  the Bloch polar angle (L7 ruling). Notes' ϕ (added physical turn) → φ, the app's turn letter: R_pol(φ).
- Basis names: L8's notes say Z and X, L9's say H−V and A−D. The app says **H/V basis** and **D/A basis** (bit-0 state
  first, physical names explicit, never confused with spin z/x). Stated once at `l8-bb84:b1`.
- One-time pad: notes' message bit m → **x** (m is the test-sample size from §8.8 on). c = x ⊕ k.
- H, V, D, A, C± are the spin kets +z, −z, +x, −x, ±y in the engine (|C₊⟩ = (1, i)/√2 = `KET['+y']`); the stage's photon
  label set shows the photon names.

## 0. Chapter map

| # | id | Title (≤ 8 words) | Question | Notes | Books / 709 chip |
|---|---|---|---|---|---|
| 1 | `l8-variance-sum` | Three variances that always add to two | If one spin component is certain, how random are the other two? | L8 p.2 §8.1 | — |
| 2 | `l8-polarization` | A second qubit: the polarization of light | How does one photon's polarization behave like a spin state? | p.3 §8.2 | Townsend §2.7 pp.59–62 |
| 3 | `l8-turning` | Turning a polarization: the rotation matrix | What matrix turns a polarization, and what does an analyzer pass? | p.4 §8.3 | Townsend p.62 eqs. 2.111–2.113 |
| 4 | `l8-photon-spin` | A photon turns the sphere twice as fast | Why does a 90° turn of light cross the whole Bloch sphere? | p.5 §8.3 | Townsend pp.62–65; chip → 709 Q2 `q2-photon` |
| 5 | `l8-key` | Why share a secret key | What problem does a quantum key solve? | p.6 §8.4 | chip → 709 Q13 `q13-no-cloning` |
| 6 | `l8-bb84` | BB84: prepare, measure, then compare bases | How do Alice and Bob end up with the same bits? | pp.7–8 §§8.5–8.6; L9 p.3 §9.1 | — |
| 7 | `l8-attack` | An eavesdropper who measures and resends | What does a measuring eavesdropper leave behind? | p.9 §8.7 = L9 pp.3–5 §9.2 | chip → 709 Q14 `q14-min-error` |
| 8 | `l8-test` | Catching the eavesdropper with a test sample | How many tested bits make the attack visible? | p.10 §8.8 = L9 p.6 §9.3; p.11 §8.9 | — |

**Class marker.** The L9 notes say §§9.2–9.3 were "imported" from L8 §§8.7–8.8: class 8 stopped before the attack.
So `l8-attack:b1` carries **"Class 9 starts here"** (L9's 3-minute protocol recap §9.1 is not a beat; its one new
fact, the basis renaming, sits in the Rosetta). The marker needs a schema field (§9.4 S1).
**Outcomes.** Show Σ(Δσ_i)² = 2 for a pure state · predict H/V and D/A analyzer results and cos²Δχ · derive R_pol(φ),
its generator σ_y and the circular eigenstates · explain why the photon's Bloch point turns 2φ · run and sift a BB84
exchange · derive Q = ¼ and (¾)^m for full intercept–resend, and say what Eve learns.
**Prerequisites (concept ids).** `bloch-spreads`, `mutually-unbiased`, `born-rule`, `rz`, `full-turn`, `ray-angle`.
**Ownership.** L7 owns spreads read off r and already states Σ(ΔS_j)² = ħ²/2 (`l7-spreads:b8` reveal, challenge
`l7-sp-sum`): unit 1 opens with a link-back and adds only the Pauli form, the "fixed budget" reading and the
certainty trade. L1 `l1-average` compared polarizers with magnets: one link-back beat. L6 owns the ball (Go-deeper
link). 709 Q2 already teaches photon frames: a "go further" chip, never re-taught there.
**Beats.** 6 + 6 + 5 + 7 + 6 + 7 + 7 + 6 = **50** (8 clues, 3 Go-deeper, 3 link-backs). Media: none new (§10).

## 1. Story beats

Stage helpers as in `L7.story.ts`: `bloch()`, `ball()`, `plane()`, `op()`, `sweep(a,b)`. New in this plan (§9.2):
`pol(s)` = `bloch({labels:'poincare', ...s})` with the revised photon label set; `hv(s)` = `plane({labels:'polarization', ...s})`;
`led(s)` = the `bb84` kind; `miss(s)` = `plot({curve:{fn:'bb84Miss'}, ...s})`. STAR = {θ 60°, φ 45°}. Claim keys `l8…`;
`at(θ,φ)` = `ketFromBloch`; `pk(χ)` = `polKet(χ)` (§9.1 E1). Phase tags: [L] notes · [B] book · [C] clue · [D] Go deeper.

### Unit `l8-variance-sum` (p.2)
- **b1 [L] link-back → `l7-spreads:b8`.** "Lecture 7 read each spread off the Bloch arrow. Now count in Pauli units:
  σ_x, σ_y and σ_z each read +1 or −1, and r_i = ⟨σ_i⟩. A pure state has r² = r_x² + r_y² + r_z² = 1." ·
  Stage `bloch({state:STAR, readouts:['budget']})` · Cap "r = (0.612, 0.612, 0.500)" · Claims `l8rStar` blochVector(at(60,45)); `l8rSq` = 1.
- **b2 [L].** "Every reading squared is 1, so σ_i² = I and ⟨σ_i²⟩ = 1. That leaves (Δσ_i)² = 1 − r_i². An average of ±1 is
  certainty; an average of 0 is a fair coin with variance 1." · Stage `bloch({state:STAR, measure:'z', readouts:['budget']})` ·
  Cap "variances 0.625, 0.625, 0.750" · Claims `l8VarsStar` variance(σ_i, STAR); `l8SigmaSqI` matEq(σ_i², I) ×3.
- **b3 [L] derivation D1.** "Add the three. The averaged squares give 3, the squared averages give r² = 1. So the variances
  total 3 − r² = 2, for every pure state." · Stage `bloch({state:{thetaDeg:sweep(0,90), phiDeg:45}, readouts:['budget']})` ·
  Cap "the bars trade places; the total stays 2.00" · Claims `l8VarSumWorst` worst gap over a 13×12 (θ,φ) grid = 0.
- **b4 [L].** "So a pure state can move uncertainty between components, never remove it. Make one component certain and
  the other two are fair coins: |+z⟩ gives (1, 1, 0)." · Stage `bloch({state:'+z', readouts:['budget'], dropLines:['x','y']})` ·
  Claims `l8VarsPlusZ` (1, 1, 0).
- **b5 [C].** Q: "Could some pure state make all three variances equal and small, say ⅓ each?" · Stage b2's · Reveal:
  "Equal, yes; small, no. Equal variances need r_x² = r_y² = r_z² = ⅓, so each variance is ⅔ and the total is still 2." ·
  Reveal stage `bloch({state:{thetaDeg:54.7356, phiDeg:45}, readouts:['budget']})` · Cap "θ = 54.7°: ⅔, ⅔, ⅔" ·
  Claims `l8VarsEqual` variance(σ_i, at(acos(1/√3), 45°)) = 0.6667 each; `l8MagicTheta` 54.7356°.
- **b6 [D] Go deeper (beyond the notes; link → `l6-mixture`).** "Inside the Bloch ball ⟨σ_i²⟩ is still 1, so (Δσ_i)² = 1 − r_i²
  survives. The total becomes 3 − r²: 2 on the surface, 3 at the centre." · Stage `ball({point:{r:[0,0,sweep(1,0)]},
  readouts:['budget'], purity:true})` · Cap "|r| = 0.6: total 2.64 · centre: 3.00" · Claims `l8MixSum06` 2.64, `l8MixSum0` 3
  (engine: Tr ρσ_i² − (Tr ρσ_i)² from `rhoFromBloch`).

### Unit `l8-polarization` (p.3)
- **b1 [L] link-back → `l1-average`.** "Lecture 1 set a polarizer beside a magnet. Now polarization is a qubit of its own.
  Light along a fixed line has its field swinging horizontally or vertically: two orthogonal states, |H⟩ and |V⟩." ·
  `introduces:['hv-basis']` · Stage `hv({psi:{planeDeg:0}, others:[{ket:{planeDeg:90}, role:'basis'}], rightAngle:true})` ·
  Cap "ordered basis: |H⟩ ↔ (1, 0), |V⟩ ↔ (0, 1)" · Claims `l8HV` ⟨H|V⟩ = 0.
- **b2 [L].** "Any polarization is |ψ⟩ = α|H⟩ + β|V⟩ with |α|² + |β|² = 1. A polarizing beam splitter sends H and V to two
  detectors. Each photon makes one click, H with probability |α|²." · Stage `hv({psi:{planeDeg:30}, basis:'z', shadows:true})` ·
  Cap "at χ = 30°: P(H) = 0.750, P(V) = 0.250" · Claims `l8PH30` prob(H, pk(30°)).
- **b3 [L].** "Turn the analyzer by 45°. Its outputs are diagonal |D⟩ = (|H⟩ + |V⟩)/√2 and antidiagonal |A⟩ = (|H⟩ − |V⟩)/√2,
  again orthogonal. A horizontal photon now leaves by either port with probability ½." · Stage `hv({psi:{planeDeg:0}, basis:'x',
  shadows:true})` · Cap "⟨D|H⟩ = ⟨A|H⟩ = 0.707" · Claims `l8DH`, `l8AH` 1/√2; `l8PDH` 0.5; `l8DA` ⟨D|A⟩ = 0.
- **b4 [L].** "Each state of one pair gives 50/50 in the other pair, so H/V and D/A are mutually unbiased, like |±z⟩ and |±x⟩
  in Lecture 2. Inside its own basis a state answers with certainty." · Stage `hv({psi:{planeDeg:45}, basis:'z', shadows:true})` ·
  Claims `l8MubPol` mutuallyUnbiased([H,V],[D,A]).
- **b5 [B] Townsend §2.7 pp.60–62, eqs. 2.109–2.110.** "Townsend takes the amplitudes from classical optics: a tilted field splits
  into cos and sin parts. Quantum mechanics adds the clicks: whole photons, with cos² as a probability. At 60°, one in four passes." ·
  Stage `hv({psi:{planeDeg:60}, basis:'z', shadows:true})` · Claims `l8Pal60` 0.25.
- **b6 [C] (notes' "check before moving on").** Q: "Prepare |D⟩. What does a D/A analyzer report? An H/V analyzer? Nothing
  happened to the photon in between." · Stage `hv({psi:{planeDeg:45}, basis:'x', shadows:true})` · Reveal: "D/A reads D every time.
  H/V is a fair coin. The state is the same; the question the analyzer asks changed." · Reveal stage `hv({psi:{planeDeg:45},
  basis:'z', shadows:true})` · Claims `l8PDD` 1, `l8PHD` 0.5.

### Unit `l8-turning` (p.4)
- **b1 [L].** "Here physics enters, not just algebra: polarization amplitudes turn like the transverse electric field. R_pol(φ)
  turns a polarization by φ about the beam; positive φ carries H toward V." · Stage `hv({psi:{planeDeg:sweep(0,30)},
  others:[{ket:{planeDeg:0}, role:'ghost'}]})` · Cap "beam out of the page; φ from horizontal" · Claims `l8RHv30` ⟨V|R_pol(30°)|H⟩ = +0.5.
- **b2 [L] derivation D2.** "Follow each basis state. H ends at angle φ and V at 90° + φ. Their coordinates are the columns of R_pol(φ)." ·
  Stage `hv({psi:{planeDeg:30}, others:[{ket:{planeDeg:120}, role:'second'}], rightAngle:true})` · Claims `l8RpolCols`
  (apply(Rpol(30°),H), apply(Rpol(30°),V)) = (cos, sin), (−sin, cos); `l8RpolUnitary`.
- **b3 [L].** "Write a linear polarization at angle χ from H as |p(χ)⟩ = cos χ|H⟩ + sin χ|V⟩. An analyzer set at χ_a passes it
  with amplitude ⟨p(χ_a)|p(χ)⟩." · Stage `hv({psi:{planeDeg:60}, basis:'z', shadows:true})` · Cap "the notes write ϑ; here χ, as in
  Lecture 1" · no number.
- **b4 [L] derivation D3.** "With real amplitudes the overlap reduces to a dot product, and the cosine-difference identity turns it into
  cos(χ − χ_a). Squaring: the aligned port gets cos²Δχ, the other sin²Δχ." · Stage `hv({psi:{planeDeg:60}, basis:'x',
  shadows:true})` · Cap "Δχ = 15°: 0.933 and 0.067" · Claims `l8OverlapCos` |⟨pk(10°)|pk(70°)⟩ − cos 60°| = 0; `l8Pal15` 0.9330.
- **b5 [C].** Q: "A magnet must turn 180° before the + spot stays empty. How far must an analyzer turn to stop a photon
  completely?" · Stage `hv({psi:{planeDeg:0}, basis:'z', shadows:true})` · Reveal: "Only 90°: cos²90° = 0. At 45° it is a fair coin.
  Light uses the whole angle where spin uses half." · Reveal stage `hv({psi:{planeDeg:90}, basis:'z', shadows:true})` · Claims
  `l8Pal90` 0, `l8Pal45` 0.5, `l8Spin180` probUpAlong at 180° = 0. Fidelity `optical-full-angle`.

### Unit `l8-photon-spin` (p.5) — signature visual "two spheres" at b3–b4
- **b1 [L] derivation D4.** "Which operator generates the turn? For a small φ, cos φ ≈ 1 and sin φ ≈ φ, so R_pol(φ) ≈ I − iφG.
  Matching terms gives G = σ_y, and in fact R_pol(φ) = cos φ I − i sin φ σ_y." · Stage `hv({psi:{planeDeg:sweep(0,5)}})` ·
  Claims `l8GenSy` i·dR/dφ at 0 = σ_y (h = 1e−6); `l8RpolForm` matEq. Glossary `generator` (L6) reused.
- **b2 [L].** "Physically G is J_z/ħ, the angular momentum about the beam, written in the H/V basis; y names the matrix, not
  the axis. Its eigenstates are circular: |C_±⟩ = (|H⟩ ± i|V⟩)/√2, with J_z/ħ = ±1, the helicities. So the photon has spin 1." ·
  `introduces:['circular-states']` · Stage `op({op:{named:'sy'}, eigen:true})` · Claims `l8EigSy` (1, −1); `l8CpEigen` eigvec(+1) ≅ |C₊⟩.
- **b3 [L] two spheres.** "A turn only gives the circular states phases: R_pol(φ)|C_±⟩ = e^{∓iφ}|C_±⟩. A free photon has no
  helicity-0 state, so two dimensions still suffice." · Stage `{layout:'split', top: hv({psi:{planeDeg:sweep(0,90)}}),
  bottom: pol({state:'+y', photonTurnDeg:sweep(0,90)})}` · Cap "|C₊⟩ sits on the turning axis: it never moves, it gains e^{−iφ}" ·
  Claims `l8PhaseCp40` arg⟨C₊|R(40°)|C₊⟩ = −40°, `l8PhaseCm40` +40°.
- **b4 [L] two spheres.** "Put H and V at the poles. Then |p(χ)⟩ sits at r = (sin 2χ, 0, cos 2χ), so a physical turn φ moves
  the point 2φ. H to V is 90° in the lab and 180° on the sphere." · Stage `{layout:'split', top: hv({psi:{planeDeg:sweep(0,90)}}),
  bottom: pol({state:'+z', photonTurnDeg:sweep(0,90), trail:true})}` · Cap "lab 45° → sphere 90° (D) · lab 90° → sphere 180° (V)" ·
  Claims `l8rP30` (0.866, 0, 0.500); `l8Turn45` blochAngle(H, R(45°)H) = 90°; `l8Turn90` 180°.
- **b5 [L] electron at 1×.** "Compare an electron. Its turn generator has eigenvalues ±½, so its phases are e^{∓iφ/2}.
  Turning it 180° takes |+z⟩ to |−z⟩: 180° in the lab, 180° on the sphere." · Stage `bloch({state:'+z', rotate:{axis:'y',
  angleDeg:sweep(0,180)}, trail:true})` · Cap "electron: lab 180° → sphere 180° · photon: lab 90° → sphere 180°" · Claims
  `l8ETurn45` 45°; `l8ETurn180` 180°; `l8RayHV` rayAngle(H,V) = 90° (half the sphere separation).
- **b6 [C].** Q: "The beam flies along z, yet on the sphere the photon turns about y. Is the sphere wrong?" · Stage
  `pol({state:'+z', photonTurnDeg:45})` · Reveal: "No. The sphere's axes are measurement averages, not lab directions. When H and V
  sit at the poles, a turn about the beam becomes a turn about y; with C± at the poles it would be about z. Either way it is twice the lab turn." ·
  Claims `l8JzCirc` B†σ_yB = σ_z in the (C₊, C₋) basis. Fidelity `poincare-double-angle`.
- **b7 [D] Go deeper (beyond the notes; link → `l7-full-turn`, belt opener).** "Since R_pol(180°) = −I, half a turn returns the
  same polarization with a sign, and R_pol(360°) = +I exactly. An electron needs 360° for the same ray and 720° for the same ket." ·
  Stage `{layout:'split', top: hv({psi:{planeDeg:sweep(0,180)}}), bottom: pol({state:'+z', photonTurnDeg:sweep(0,180), trail:true})}` ·
  Claims `l8R180` −I, `l8R360` I, `l8Ry360` −I, `l8Ry720` I, `l8Ray180` samePhysicalState(R(180°)p, p).
- **[B] folded into b2's refs:** Townsend pp.63–65, eqs. 2.116–2.120 and Example 2.8 (|R⟩ = our |C₊⟩ gains e^{−iφ}; J_z = ±ħ;
  no 0 value for a massless particle; J_z off-diagonal in x/y, diagonal in R/L). Note in the ref: optics books disagree on which
  circular state is "right-handed"; helicity ±1 is unambiguous.

### Unit `l8-key` (p.6)
- **b1 [L].** "One qubit at a time has taken seven lectures. It is enough to understand Bennett and Brassard's protocol, BB84,
  which gives Alice and Bob shared random bits that Eve cannot read." · Stage `led({rounds:{board:'notes-p8'}, show:['alice','bob']})` ·
  Refs: Bennett & Brassard (1984), cited by the notes p.11.
- **b2 [L].** "The key is used later. With a one-time pad, Alice sends each message bit x as c = x ⊕ k, where ⊕ adds bits and
  drops the carry. Bob recovers x = c ⊕ k." · Stage as b1 · Cap "x = 1011, k = 0110 → c = 1101 → 1011" · Claims `l8Otp`.
- **b3 [L].** "A random key that matches the message in length and is used once makes c worthless to Eve. Delivering that key unseen is the
  problem. BB84 sends key material, never the message itself." · Stage as b1 · no number.
- **b4 [L].** "Anyone can read and copy a classical bit unnoticed. An H/V analyzer reads H or V perfectly, while D or A get a
  coin toss, and D/A does the reverse. No single reading identifies all four states." · Stage `pol({state:'+x', measure:'z'})` · Cap "|D⟩ in
  H/V: ½ each" · Claims `l8PHD` 0.5; `l8HV`, `l8DA` 0.
- **b5 [L].** "Two links: a quantum channel of single photons that Eve may intercept, and a public channel Eve hears but cannot
  forge. That authentication must already exist. Our model is ideal: no losses and no noise." · Stage `led({rounds:{board:'notes-p8'},
  eve:'all', show:['alice','eve','bob']})`.
- **b6 [C].** Q: "Why not send only H and V, which Bob can read perfectly?" · Stage `pol({state:'+z', measure:'z'})` · Reveal: "Then
  Eve could read them perfectly too and resend exact copies. Two mutually unbiased bases force her to guess." · Claims `l8PHH` 1.
  Chip "go further in 709 → Q13 `q13-no-cloning`" (why no machine copies an unknown photon; the notes defer it).

### Unit `l8-bb84` (pp.7–8; L9 p.3) — signature visual "BB84 bench" (ledger)
- **b1 [L].** "Agree on a code first. In the H/V basis H means 0 and V means 1; in the D/A basis D means 0 and A means 1." ·
  `introduces:['bb84-code']` · Stage `led({rounds:{board:'notes-p8'}, show:['alice']})` · Cap "the L8 notes call the bases Z and X;
  the L9 notes, H−V and A−D".
- **b2 [L].** "Each round Alice picks a random bit a and, separately, a random basis B_A, and sends that photon. Bob picks his own
  basis B_B at random, measures and records b." · Stage `led({rounds:{board:'notes-p8'}, show:['alice','bob']})`.
- **b3 [L].** "Afterwards they announce bases, not bits, and keep rounds with B_A = B_B: the sifted key. Then they publish a random
  sample of it, estimate how often they disagree, and throw those public bits away." · Stage `led({... sift:true})`.
- **b4 [L].** "With no Eve, bases match half the time, matched rounds always agree, and mismatched rounds agree only half the time." ·
  Stage `led({rounds:{seed:84, count:sweep(8,400)}, sift:true, readouts:['kept','qber']})` · Claims `l8PMatch` ½; `l8ErrNoEve` 0;
  `l8MismatchRandom` ½.
- **b5 [L] (p.8 board).** "One eight-photon run with no Eve: rounds 1, 4, 5 and 6 used matching bases, so both sifted strings read
  0010. Rounds 2 and 8 agree only by luck and are dropped too." · Stage `led({rounds:{board:'notes-p8'}, sift:true, highlight:[2,8]})` ·
  Claims `l8BoardKept` [1,4,5,6]; `l8BoardSift` 0010/0010; `l8BoardLuck` [2,8]; `l8BoardOk` (`checkBoard`, §9.1 E3).
- **b6 [L].** "Say the sample is rounds 1 and 5. Both agree: 0 errors out of 2. Those bits are now public and leave the key, so
  rounds 4 and 6 remain, 00. Eve heard every basis and every tested value." · Stage `led({... sift:true, test:{rounds:[1,5]}})` ·
  Claims `l8BoardTest` 0/2; `l8BoardLeft` "00".
- **b7 [C].** Q: "Bob measures before he knows Alice's basis. Why not announce it first and waste no rounds?" · Reveal: "Eve still
  holds the photon then. Knowing the basis, she measures in it and resends a perfect copy, leaving no trace. Announced afterwards,
  a basis reveals no bit." · Stage b3's.

### Unit `l8-attack` (p.9 = L9 pp.3–5) — **"Class 9 starts here"** on b1
- **b1 [L].** "Now Eve intercepts every photon. She measures in a basis B_E of her own random choice, then sends Bob a fresh
  photon in the state she found." · Stage `led({rounds:{seed:9, count:12}, eve:'all', show:['alice','eve','bob']})`.
- **b2 [L].** "Follow a kept round: Alice sends |H⟩ and Bob uses H/V. If Eve picks D/A she finds D or A, ½ each, and resends it. Bob
  then reads V with probability ½ in both cases." · Stage `pol({state:'+z', measure:'x'})` · Cap "two separate histories, so their
  probabilities add; Bob receives D or A, never a blend" · Claims `l8ErrEveWrong` ½ (`bb84ErrorProb`).
- **b3 [L] derivation D5.** "If Eve picks H/V she reads H for sure and resends it: no error. Averaging over her two choices gives the
  error rate of the sifted key: Q = ½·0 + ½·½ = ¼." · Stage `led({rounds:{seed:9, count:sweep(12,2000)}, eve:'all', sift:true,
  readouts:['qber']})` · Claims `l8ErrEveRight` 0; `l8Q` ¼; `l8QfromDA` ¼ (same for a D/A round).
- **b4 [L].** "Q already assumes matching bases. The sifting factor ½ belongs to the rate per photon sent, ⅛, not to Q." · Stage b3's
  at count 2000 · Claims `l8PerPhoton` ⅛.
- **b5 [L] (L9 p.4).** "Once bases are public, Eve sorts her notes. In half the kept rounds she used Alice's basis and knows the bit.
  In the rest her result came from an unbiased basis and says nothing. This holds for this attack only." · Stage `led({..., eve:'all',
  sift:true, readouts:['eve-knows']})` · Claims `l8EveKnows` ½.
- **b6 [C] (notes' exit check, p.11).** Q: "Alice sends |D⟩, Bob uses D/A, Eve uses H/V. Is the round kept? How likely is Bob's bit
  wrong?" · Stage `pol({state:'+x', measure:'z'})` · Reveal: "Kept: Alice and Bob both used D/A. Eve resends H or V, and each gives
  D or A at random, so Bob errs half the time. Only the average over Eve's choice is ¼; had she used D/A, 0." · Claims `l8Exit` ½,
  `l8ExitDA` 0.
- **b7 [D] Go deeper (beyond the notes; L9 p.3 hints at it).** "If Eve intercepts only a fraction f of photons, both effects scale:
  Q = f/4, and she knows f/2 of the sifted bits. Snooping half the time gives Q = ⅛." · Stage `led({rounds:{seed:9, count:2000},
  eve:{fraction:sweep(0,1)}, sift:true, readouts:['qber','eve-knows']})` · Claims `l8Qf05` ⅛, `l8KnowF05` ¼ (exact enumeration).
  Chip "go further in 709 → Q14 `q14-min-error`" (the best possible guess between non-orthogonal states).

### Unit `l8-test` (p.10 = L9 p.6; p.11) — "BB84 bench" miss curve
- **b1 [L] derivation D6.** "Reveal m sifted bits and count disagreements n_err; the observed rate is Q̂ = n_err/m. Here each tested
  bit agrees with probability ¾, independently, so all m agree with probability (¾)^m." · Stage `miss({markers:[{x:20}]})` · Claims `l8Miss20` 0.0032.
- **b2 [L] (L9 adds m = 100).** "Twenty tested bits leave Eve a 0.32% chance of going unnoticed. A hundred leave about 3.2 × 10⁻¹³." ·
  Stage `miss({x:{from:0,to:100}, yScale:'log', markers:[{x:20},{x:100}]})` · Claims `l8Miss20Pct` 0.32; `l8Miss100` 3.2e−13.
- **b3 [L].** "One interception may cause no error at all, and a short test may miss her. An error does not prove Eve either: noise
  and imperfect devices also flip bits." · Stage `led({rounds:{seed:20, count:sweep(10,400)}, eve:'all', sift:true, test:{fraction:0.2},
  readouts:['qber']})`.
- **b4 [L].** "Three classical steps remain. Estimate the error rate, and abort if it is too high. Reconcile and check the strings.
  Then hash them into a shorter key that Eve knows almost nothing about." · Stage b3's · Glossary `parameter-estimation`,
  `error-correction`, `privacy-amplification`.
- **b5 [L].** "The ¼ belongs to this one attack. It is not the error of every attack, and not an acceptable error level. A full
  security proof goes far beyond today." · Stage `miss({markers:[{x:20}]})` · Claims `l8Q` ¼.
- **b6 [C].** Q: "How many sifted bits must they test to catch this Eve with at least 99% certainty?" · Reveal: "Solve (¾)^m ≤ 0.01.
  Sixteen bits still leave 1.002%, so seventeen are needed: (¾)^17 ≈ 0.0075." · Reveal stage `miss({markers:[{x:16},{x:17}],
  yLines:[{y:0.01, label:'1%'}]})` · Claims `l8M99` 17 (`minTestSize(¼, 0.01)`), `l8Miss16` 0.0100, `l8Miss17` 0.0075.

## 2. Derivations (448's first; one track: `ground` only — §9.4 S3)
| id | Result | Steps (`why` in one sentence each) | Views (kind already on the unit's stage) |
|---|---|---|---|
| D1 `l8-variance-sum:b3` | Σ(Δσ_i)² = 3 − r² = 2 | variance = ⟨σ_i²⟩ − ⟨σ_i⟩² · σ_i² = I so ⟨σ_i²⟩ = 1 · sum = 3 − (r_x² + r_y² + r_z²) · r² = 1 for a pure state | bloch STAR budget (0.625, 0.625, 0.75) → bloch +z budget (1, 1, 0) |
| D2 `l8-turning:b2` | R_pol(φ) = [[cos φ, −sin φ],[sin φ, cos φ]] | H goes to angle φ · V goes to 90° + φ · cos(90° + φ) = −sin φ, sin(90° + φ) = cos φ · columns are the images | hv psi 30° + H ghost → hv psi 120° + V ghost |
| D3 `l8-turning:b4` | P(aligned) = cos²(χ − χ_a) | overlap = cos χ_a cos χ + sin χ_a sin χ · = cos(χ − χ_a) · square it · the other port gets the rest | hv psi 60 basis z (Δχ = 60°: 0.25) → basis x (Δχ = 15°: 0.933) |
| D4 `l8-photon-spin:b1` | G = σ_y | small φ: R ≈ I + φ[[0,−1],[1,0]] · set equal to I − iφG · multiply by i · read off σ_y | hv psi sweep(0,5) → op σ_y eigen |
| D5 `l8-attack:b3` | Q = ¼ | wrong basis: ½·½ + ½·½ = ½ · right basis: 0 · each basis half the time · average | pol +z measure x → led qber at 2000 |
| D6 `l8-test:b1` | P(no error in m) = (¾)^m | one bit agrees with ¾ · bits are independent, so multiply · m = 20 gives 0.0032 | miss marker 1 → miss marker 20 |

## 3. Try-it per unit (widget props checked against `app/src/widgets/*`; new props/widgets in §9.3)
| Unit | `visual` | Try this |
|---|---|---|
| variance-sum | `{kind:'bloch', props:{theta:60, phi:45, landmarks:true, editable:true}}` (existing) | 1. Read ⟨S_x⟩, ⟨S_y⟩, ⟨S_z⟩; r_i = 2⟨S_i⟩/ħ; add the three 1 − r_i² (2). · 2. Drag to a pole: (1, 1, 0). · 3. Set θ = 55°, φ = 45° (the sliders move in whole degrees): all three are about 0.67, still totalling 2. |
| polarization | `{kind:'projector', props:{state:30, basis:0, editableBasis:true, labels:'polarization'}}` (**W1**) | 1. P(H) at χ = 30° (0.75). · 2. Set the analyzer to 45° (D/A): H gives ½. · 3. Put the state at 45°: D/A is certain, H/V a coin. |
| turning | same, `state:60, basis:45` (**W1**; basis slider 0–90° in 5° steps) | 1. Δχ = 15°: 0.933. · 2. Set the analyzer to 60°: the second port (at 150°) never fires. · 3. Drag the state round by 180°: same probabilities (same polarization). |
| photon-spin | `{kind:'polarization-dial', props:{chi:0, analyzer:0, carrier:'photon'}}` (**W2**) | 1. Turn 45°: the sphere point moves 90°. · 2. Switch to electron: 45° moves it 45°. · 3. Turn the photon 180°: the plane arrow flips but every probability returns. |
| key / bb84 / attack / test | `{kind:'bb84-bench', props:{eve:'off'|'all', seed:84, testSize:20}}` (**W3**) | key: send 10 with Eve off, look at mismatched rounds · bb84: sift, then test 20 · attack: Eve on, send 1000, watch Q̂ → ¼ · test: find the smallest m with miss ≤ 1% (17). |

## 4. Challenges (no homework exists for L8; in-class checks become challenges with walkthroughs)
Format: id · tier · kind · answer (engine call) — prompt / hints (nudge → idea → setup) / walkthrough in brief.
- `l8-vs-sum` · warm-up · numeric · **2** (varSum) — "Total of the three Pauli variances for any pure state?" / add them · σ_i² = I · r² = 1 / 3 − 1.
- `l8-vs-pole` · core · numeric · **1** (variance(σ_x, +z)) — "In |+z⟩, what is (Δσ_x)²?" / r_x = 0 · 1 − r_x² · certainty in z / 1 − 0 = 1.
- `l8-vs-mixed` · stretch · numeric · **2.64** (`l8MixSum06`) [D-badged] — "Total for a mixture with r = (0, 0, 0.6)?" / ⟨σ_i²⟩ still 1 · 3 − r² · r² = 0.36.
- `l8-po-d-in-hv` · warm-up · numeric · **0.5** — "|D⟩ in an H/V analyzer: P(H)?" (the notes' check) / walkthrough: ⟨H|D⟩ = 1/√2, squared.
- `l8-po-30` · core · numeric · **0.25** (prob(V, pk(30°))) — "χ = 30°: P(V)?" / sin²30°.
- `l8-po-mub` · core · choice — "Which pair is mutually unbiased?" ✓ H/V with D/A · ✗ H/V with V/H · ✗ D/A with A/D · ✗ H with D only.
- `l8-tu-15` · core · numeric · **0.933** (`l8Pal15`) — "χ = 60°, analyzer at 45°: aligned port?" / Δχ = 15° · cos²15°.
- `l8-tu-matrix` · core · order — steps: "Turn |H⟩: cos φ|H⟩ + sin φ|V⟩" · "Turn |V⟩ to 90° + φ" · "Use cos(90°+φ) = −sin φ" · "Place the images as columns".
- `l8-tu-block` · stretch · numeric · **150** (°, tol 0.5; `analyzerProb(60°, 150°)` = 0) — "An analyzer between 90° and 180° passes none of a χ = 60° beam. Its angle?" / Δχ = 90°.
- `l8-ps-sphere` · warm-up · numeric · **90** (`l8Turn45`) — "A 45° turn of light moves its Bloch point how far?"
- `l8-ps-phase` · core · numeric · **−40** (°; `l8PhaseCp40`) — "Phase of R_pol(40°)|C₊⟩ relative to |C₊⟩?"
- `l8-ps-electron` · stretch · choice — "Physical turn that takes the state to an orthogonal one: photon 90°, electron 180°" ✓ vs three wrong pairings.
- `l8-ke-otp` · warm-up · numeric · **1** — "x = 0, k = 1: c?" / ⊕ drops the carry.
- `l8-ke-why` · core · choice — "Why two bases?" ✓ Eve cannot read all four states perfectly · ✗ faster · ✗ fewer photons · ✗ hides the bases.
- `l8-bb-sift` · core · order/choice — the p.8 board (notes' 2-minute student work): kept rounds ✓ {1,4,5,6} (`checkBoard`).
- `l8-bb-kept` · warm-up · numeric · **0.5** — "Fraction of rounds surviving sifting?"
- `l8-bb-luck` · stretch · choice — "Rounds 2 and 8 agree; keep them?" ✓ No: agreement there is luck, and searching for it would reveal bits.
- `l8-at-exit` · core · numeric · **0.5** (`l8Exit`) — the notes' exit check (Alice D, Bob D/A, Eve H/V).
- `l8-at-q` · core · numeric · **0.25** (`l8Q`) — "Error rate of the sifted key under full intercept–resend?"
- `l8-at-photon` · stretch · numeric · **0.125** — "Kept-and-wrong rounds per photon sent?" / trap: putting ½ into Q.
- `l8-te-20` · core · numeric · **0.0032** (tol 0.0001) — "P(no error) with m = 20?"
- `l8-te-99` · stretch · numeric · **17** (`minTestSize`) — "Smallest m for ≥ 99% detection?"
- `l8-te-not-threshold` · core · choice — "What does Q = ¼ mean?" ✓ the average error rate of this one attack · ✗ the abort threshold · ✗ any attack's rate · ✗ noise level.

## 5. Glossary (448 `glossary.ts`; ids unprefixed; "twin" = a 709 entry exists → §12 R5 promotes it, no copy)
New: `variance-sum` "Σ(Δσ_i)²" (l8-variance-sum:b3; uses variance) · `photon` (l8-polarization:b1) · `hv-basis` "(|H⟩, |V⟩)"
introduces 'notation' (b1) · `linear-polarization` "|p(χ)⟩" (l8-turning:b3) · `polarizing-beam-splitter` (l8-polarization:b2) ·
`analyzer` (b3) · `da-basis` "|D⟩, |A⟩" (b3) · `rotation-pol` "R_pol(φ)" (l8-turning:b1; uses rotation-operator) ·
`circular-states` "|C_±⟩" introduces 'notation' (l8-photon-spin:b2) · `photon-spin` "spin 1 of the photon" (b2; uses helicity) ·
`qkd` "quantum key distribution" (l8-key:b1) · `bb84` (l8-key:b1) · `one-time-pad` (b2; uses xor) · `eavesdropper` (b1) ·
`authentication` (b5) · `bb84-code` introduces 'notation' (l8-bb84:b1) · `sifted-key` (b3) · `test-sample` (b3) · `qber` "Q, Q̂"
(l8-attack:b3) · `intercept-resend` (l8-attack:b1) · `parameter-estimation`, `error-correction`, `privacy-amplification` (l8-test:b4).
Twins (promote, R5): `polarization` (qc-polarization), `helicity` (qc-helicity), `circular-polarization` (qc-circular-polarization),
`xor` (qc-xor), `classical-channel` (qc-classical-channel). Reused: variance, uncertainty, bloch-vector, pure-state, bloch-ball,
mixture, purity, polarizer, mutually-unbiased, orthogonal, born-rule, generator, rotation-operator, infinitesimal, global-phase,
belt-trick, full-turn-sign, ray-angle, bloch-separation, conditional-probability, joint-probability, outcome, prepare, state-update.

## 6. Review cards (points ≤ 25 words; numbers are §1 claims)
- **variance-sum** — (Δσ_i)² = 1 − r_i² · pure: total 2, only redistributed · one certain ⇒ the other two are 1 · `$$\sum_i(\Delta\sigma_i)^2 = 3 - r^2 = 2$$` · Trap: "make all three small" — the total is fixed at 2.
- **polarization** — |ψ⟩ = α|H⟩ + β|V⟩ · one click per photon · D/A at 45°, unbiased to H/V · `$$P(H) = |\alpha|^2,\ |D\rangle,|A\rangle = (|H\rangle \pm |V\rangle)/\sqrt2$$` · Trap: half a photon at each detector.
- **turning** — R_pol(φ) from geometry (physics input) · P = cos²Δχ, full angle · crossed at 90° · Trap: using spin's half-angle for light.
- **photon-spin** — G = σ_y = J_z/ħ in H/V · C± helicity ±1, phases e^{∓iφ} · Bloch turn = 2φ · electron: φ · Trap: reading the sphere's y as the lab's y.
- **key** — one-time pad c = x ⊕ k · two unbiased bases stop perfect reading · authenticated public channel assumed · Trap: BB84 does not carry the message.
- **bb84** — prepare, measure, announce bases, sift, test · ideal: matched ⇒ equal · board 0010 · Trap: keeping lucky agreements.
- **attack** — wrong basis ⇒ ½ error, right ⇒ 0 · Q = ¼ · Eve knows ½ of sifted bits (this attack only) · Trap: Q = ⅛.
- **test** — (¾)^m · m = 20: 0.32% · m = 17 for 99% · abort / reconcile / amplify · Trap: ¼ as a universal threshold.

## 7. Symbols before use (one track)
σ_i, r_i, r² (variance-sum:b1) · I, (Δσ_i)² (b2) · |H⟩, |V⟩ (polarization:b1) · α, β (b2; L1) · |D⟩, |A⟩ (b3) · φ, R_pol (turning:b1) ·
χ, |p(χ)⟩, χ_a, Δχ (b3–b4) · G, J_z (photon-spin:b1–b2) · |C_±⟩ (b2) · x, k, c, ⊕ (key:b2) · a, b, B_A, B_B (bb84:b2) · B_E (attack:b1) ·
Q (attack:b3) · m, n_err, Q̂ (test:b1) · f (attack:b7, Go deeper only). **Flags:** ϑ → χ and m (message) → x (Rosetta); the
sphere's "y" is not the lab's y (photon-spin:b6 says so).

## 8. Errata and hazards
No mathematical error found in L8 or L9 pp.1–6 (all derivations re-done in both scripts). Notation fixes (not errata): ϑ/θ look-alike;
m used for both message bit and test size; Z/X vs H−V/A−D basis names between the two notes; L9 p.6 lists only two of L8's three
classical steps (the chapter keeps L8's three). The rounding "3e−13" (L9 p.6) is shown as 3.2 × 10⁻¹³ (engine value).
**Existing-code hazard:** the unused Bloch `labels:'poincare'` set names the axes S₁, S₂, S₃ with +z = S₃, but the notes put H/V on
z; in standard Stokes naming H/V is S₁ and circular is S₃. §9.2 G1 replaces the set before L8 uses it.

## 9. Gaps
**9.1 Engine** (448, pure, numpy twins in `make_fixtures.py` "lecture8", claims in `make_claim_fixtures.py` "L8"):
E1 `physics/polarization.ts`: `POL` = {H,V,D,A,Cp,Cm} (= KET ±z, ±x, ±y) · `polKet(χ)` · `Rpol(φ)` · `analyzerProb(χ, χa)` ·
`photonTurn(φ)` = `rotation([0,1,0], 2φ)` (test: equals `Rpol`). E2 `physics/density.ts`: `pauliVariances(r)` = 1 − r_i², 
`varianceTotal(r)` = 3 − |r|² (validates |r| ≤ 1). E3 `physics/bb84.ts`: `BB84_CODE`; `bb84ErrorProb({alice:{basis,bit}, bob, eve})`
(Born sum over Eve's outcomes); `bb84Q(f)` and `eveKnown(f)` by enumeration (not formula); `missProb(Q, m)`; `minTestSize(Q, risk)`
(search); `checkBoard(board)` (matched rows certain, mismatched outcomes P > 0); `bb84Rounds(n, seed, eve)` seeded with `random.ts rng`
(twin: a Python port of the same mulberry32, first 12 rows as a fixture; tallies within 3σ).
**9.2 Stage contracts**
- G1 `BlochState.labels:'poincare'` (revised; unused today): poles |H⟩/|V⟩ on ±z, |D⟩/|A⟩ on ±x, |C₊⟩/|C₋⟩ on ±y; passport "STATE SPACE ·
  polarization sphere (light)", axes ⟨σ_x⟩ ⟨σ_y⟩ ⟨σ_z⟩ "in the H/V basis"; fidelity `poincare-axes` rewritten (no S₁–S₃).
  New `photonTurnDeg?: Scrub`: the resolver applies `photonTurn(φ)` (Bloch y by 2φ; the doubling is computed, never authored);
  readout "lab turn 45° · sphere turn 90°"; requires `labels:'poincare'`; exclusive with `rotate`. In a split with `hv`, validateLayout
  checks the plane's angle equals the sphere state's χ plus the turn.
- G2 `HilbertPlaneState.labels:'polarization'`: arrows at 0°/90° read |H⟩/|V⟩, the 45° frame |D⟩/|A⟩; passport "STATE SPACE · linear
  polarizations (real slice)", note "here the arrow's angle is the polarizer's angle"; 448 fidelity key `plane-polarization`
  (exact: no halving; misleading: an arrow and its opposite are one polarization; schematic: circular states are not in this slice).
- G3 readout `'budget'` on `BlochState.readouts` and new `BallState.readouts?: ['budget']` — "variance budget": three bars (Δσ_i)² from
  `pauliVariances`, stacked into a total bar with ticks at 2 and 3, text "total = 3 − r² = 2.00". Fidelity `bloch-budget` (exact).
- G4 **new SVG kind `bb84`** (448-owned, lazy, prints as a table):
  `{kind:'bb84'; rounds:{board:'notes-p8'} | {seed:number; count:Scrub /*1–4000 whole*/}; eve?:'off'|'all'|{fraction:Scrub};
  show?:('alice'|'eve'|'bob')[]; sift?:boolean; test?:{rounds:number[]}|{fraction:number}; highlight?:number[];
  readouts?:('kept'|'qber'|'eve-knows')[]; shot?:'K-LEDGER'}`. Rows: the last ≤ 12 rounds (basis, bit, state glyph; Eve's basis,
  outcome, resent; Bob's basis, bit; kept ✓; error ✗); tallies cover all `count`. `qber` draws Q̂ with its ±1σ band and the exact Q from
  `bb84Q`. Anchors `row, alice, eve, bob, sift, test, qber, tally`. Passport "PROTOCOL LEDGER · BB84" note "not a place · each row is
  one photon; outcomes drawn from the Born rule (seeded)". Fidelity: exact (row probabilities); schematic (only the latest 12 rows);
  misleading (a finite run's Q̂ scatters; photons in flight, losses and noise are not drawn).
- G5 `plot` (shared SVG kind, ruling 5): `PlotCurveName` gains `'bb84Miss'` (y = `missProb(¼, m)`, x = m) and `PlotState.yScale?:'linear'|'log'`.
**9.3 Widgets** (each lazy; props are the whole contract — the visualSpecs gate reads them):
W1 `Projector` gains `labels?: 'spin'|'polarization'` (H/V, D/A names, "analyzer angle" slider, footnote "for light the plane angle is
the polarizer angle"). W2 **`polarization-dial`** (new, SVG): `{chi?, analyzer?, carrier?:'photon'|'electron', editable?}` — left the
transverse plane (line at χ, analyzer at χ_a), right the sphere's x–z great circle (point at 2χ or χ), P(aligned) cos²Δχ or cos²(Δχ/2),
buttons 45°/90°/180°. W3 **`bb84-bench`** (new; the ComplexPlaneQc pattern: a lazy pane drawing the `bb84` scene from controls):
`{eve?:'off'|'all', seed?, testSize?, editable?}` — Send 1/10/100, Eve toggle, m slider, Reset; readouts as G4.
**9.4 Platform** S1 class marker: `Beat.classMark?: {class:number; from?: string}` → a slim rule "Class 9 starts here" above the beat
in story, Read mode and print (lint: classes increase along the course). S2 Go-deeper: `BeatPhase` gains `'deeper'` (448), order
L → B → C → D, requires `beyondLecture` and a ref, rendered in a boxed "Go deeper · beyond the notes" frame. S3 `Derivation.formal`
optional for a one-track course; the view lint loops over `COURSES[course].tracks`. S4 bridges 448 → 709 (none exist; the system is
709 → 448 only): a 448 table (ids `sl-…`, registered by the lecture chunk, not the entry) with `BridgeTarget.course:'qc709'`;
`BridgeLink` variant "Go further in 709 · Chapter Q2"; `ReturnPlace.course` widened to `CourseId` and `parseReturnSyntax` accepting
`sl448~L8~l8-photon-spin:b2~0.42~ground` (448 chapter regex, track 'ground'); ReturnBar label "Return to Spin Lab · Lecture 8 · …";
`returnParam.security.test.ts` cases for 448. S5 chunk contract (ruling 5): `build/chunkGraph.ts` `is709` → `id.startsWith('/src/content/qc709/')`
only, plus `isSharedQc = /src/physics/qc/`; header (h) → "no 709 CONTENT module and no shared multi-qubit engine module in the entry
closure"; (i) → "no chunk holds both 709 content (content/qc709/) and a 448 lecture's content; physics/qc and stage/svg are shared";
(m) → drop "(448 never uses them)", keep "no lecture chunk statically imports a stage/svg module", bump `lectures448 ≥ 7` → `≥ 9`;
(d) sanity list adds L8, L9. Also `stage/svgRoute.test.ts` "every 448 kind is gl" → "every 448 GL kind" (bb84, pair-grid are SVG), and
the `plot` fidelity drawer moves out of `content/qc709/fidelity.ts` into a shared module (448's `fidelityOf` returns EMPTY for it today).
S6 entry budget: ~24 new eager gloss entries (≈ 2 KB gzip est.); re-measure rule (l) or make the 448 glossary lazy.

## 10. Media
None new. The belt opener stays at `l7-full-turn`; `l8-photon-spin:b7` links to it. No film, no Higgsfield clip.

## 11. Hooks
**Concepts** (`concepts.ts`): `variance-budget` (l8-variance-sum; needs bloch-spreads) · `photon-qubit` (l8-polarization; mutually-unbiased,
born-rule) · `photon-rotation` (l8-turning; photon-qubit, passive-active) · `photon-spin` (l8-photon-spin; photon-rotation, rz, ray-angle) ·
`key-distribution` (l8-key; photon-qubit) · `bb84` (l8-bb84; key-distribution, born-rule) · `intercept-resend` (l8-attack; bb84) ·
`error-test` (l8-test; intercept-resend, probability). 709 twin: Q2's photon station gets `sameAs:'photon-spin'` (W edit).
**Arcade.** New game kind **`catch-eve`** (skill 13; engine verdicts from E3): `ce-sift` tap the kept rounds of the p.8 board ({1,4,5,6})
→ trains l8-bb84 · `ce-one-round` Alice D, Bob D/A, Eve H/V: pick P(error) (½) → l8-attack · `ce-average` pick Q (¼) → l8-attack ·
`ce-test-size` smallest m with miss ≤ 1% (17) → l8-test · `ce-budget` 200 photons (seeded, ~100 sifted): choose m so that miss ≤ 1% AND
≥ 80 key bits remain (m ∈ [17, sifted − 80]) → l8-test. Spot-the-error rounds (existing kind): `sum-three-small` (all three variances
⅓; the total is 2) → l8-variance-sum · `light-half-angle` (cos²(Δχ/2) for light) → l8-turning · `sphere-45` (a 45° polarizer turn
moves the point 45°; it is 90°) → l8-photon-spin · `sift-halves-q` (Q = ⅛ "because half the rounds are dropped") → l8-attack.
**709 chips (R6):** l8-photon-spin → Q2 `q2-photon` · l8-key → Q13 `q13-no-cloning` · l8-attack → Q14 `q14-min-error`. When 709 Q15
(BB84, planned) is built, it bridges back to `l8-bb84` (existing 709 → 448 direction).

**Fidelity notes.** hv: angle = polarizer angle; an arrow and its negative are one polarization. pol sphere: axes are averages; lab turn
φ ↦ sphere 2φ (`poincare-double-angle`). bloch/ball budget: bars are 1 − r_i². bb84: Born probabilities exact, sample scatter, ideal
channel. plot: the curve is computed, the log axis is labelled.

## 12. Rulings requested
1. Class marker as `Beat.classMark {class, from?}` (S1), placed at `l8-attack:b1` ("Class 9 starts here")?
2. Go-deeper as a fourth phase `'deeper'` after clues (S2), or `beyondLecture` beats inside the [B] slot?
3. Rosetta: notes' ϑ → χ, message bit m → x, bases named "H/V" and "D/A" (L9's choice) throughout?
4. Revise the unused `poincare` label set to H/V/D/A/C± with ⟨σ⟩ axes (G1), not Stokes S₁–S₃?
5. Glossary twins (polarization, helicity, circular polarization, XOR, classical channel): promote to shared unprefixed ids (709
   re-points its links; `introduces` lint becomes "one introducing beat per course"), rather than duplicate?
6. 448 → 709 "go further" chips with a return bar (S4) — build now, or ship L8 with the chips as plain text until W lands S4?
7. New `bb84` SVG kind + `bb84-bench` widget + `catch-eve` game: approve all three, or the kind and widget only (spot-the-error rounds
   alone for the Arcade)?
8. 448's first stepped derivations (six, one track): approve S3 (`formal` optional for single-track courses)?
