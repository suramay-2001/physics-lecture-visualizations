# P review: 709 Q11 "Using entanglement: dense coding, teleportation, swapping" (main 3e8be11, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 6 should-fix, 6 nits).
- Every displayed value and all 12 challenge keys are right.
- Φ⁺ is the resource for dense coding, teleportation and swapping, as ruled.
- All four teleportation branches and their corrections Z^{M₁}X^{M₂} check out.
- `C_CYCLE`'s Pauli on wire 0 agrees with `bellCycle()` and the prose.
- **Blocking:**
  - Three Try-it instructions are false or impossible on the widgets used (item 1).
  - One stage draws |ψ⟩|00⟩ under a "|ψ⟩|Φ⁺⟩" caption (item 2).
  - Three displayed teleportation identities are false as written: σ₁₁, the twirl and a prefactor (item 3).
- **Must-check outcomes:**
  - The Bell-basis-as-computational-bars captions match what is drawn, except `q11-teleport-algebra:b1` (item 2).
  - `qc-ebit` is right for qubits (nit 15).
  - `qc-teleportation.needs` lacks `qc-no-signalling`. Flagged in item 5.

## Evidence summary
- **`revQ10Q11-q11.py`** (scratchpad): 96 checks, 0 mismatches against the displayed values and `claims-qc709/q11.json`. All 35 keys were recomputed independently. The route is my own: explicit statevectors and gate matrices (q0 leftmost), the C_TELE and C_SWAP columns applied by hand, and branch projectors.
  - **Bell cycle and dense coding:**
    - (P⊗I)Φ⁺ for all four Paulis, with gate-on-wire-0 compared against wire 1.
    - C_DC readouts 00/10/01/11 for I/Z/X/Y, each with probability 1.
    - The sent qubit and Bob's half are both ½I.
  - **Teleportation:**
    - ψ = R_y(73.7°)|0⟩ = (0.8001, 0.5998), Bloch (0.960, 0, 0.281).
    - Every branch has p = ¼, a pre-correction state σ_xyψ, and fidelity 1 after Z^{M₁}X^{M₂}.
    - Alice's data qubit is |1⟩ when M₁ = 1.
    - ρ_B^pre = ½I, both before any measurement and averaged over Alice's outcomes.
  - **Swapping:** the identity with all + signs; every branch p = ¼ with A, C in the matching Bell state; the A–C average is ¼I.
  - **Weyl–Bell basis:** N = 2 gives the Bell basis and N = 3 gives 9 orthonormal states.
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files).
- **Sources read:**
  - Bergou printed pp. 37–40 (§3.4, Tables 3.1–3.2, Eqs. 3.20–3.21), pp. 60–61 (§3.10 P3.3) and pp. 260–261 (§14.3).
  - N&C pp. 25–28 (§1.3.6–1.3.7) and 97–98 (§2.3).
- **Not done (economy):** no screenshots and no Playwright. Widget behaviour was read from `widgets/AmplitudeBars.tsx` (one qubit, `state: [θ, φ]`) and `widgets/BlochSphere.tsx` (a pure point).

## Blocking
1. **Three Try-it instructions are false or cannot be done on the widget they sit on** (Q9 precedent: a false tryThis is Blocking).
   - **(a) `q11-bell-tools` (`Q11.ts:120`)** says "a half turn is like the $Z$ cycle, a quarter like $X$ or $Y$". This is false: X and Y are **half** turns about x and y, and a quarter turn is √X, √Y or S.
     - *Fix:* "Turn a half lap about z: that is $Z$; a half lap about x is $X$ — each Bell-cycle gate is a half turn".
   - **(b) `q11-dense-coding` (`Q11.ts:170`)** says "Try each gate on the shared pair: which one lands on which Bell state?". The widget is the one-qubit `amplitude-bars`, which has no pair, no gates and no Bell states.
     - *Fix:* "Set $|0\rangle$ and read the bars in z, then $|1\rangle$: an X swaps the bars, as it swaps 00↔10 in the pair."
   - **(c) `q11-teleport-circuit` (`Q11.ts:270`)** says "Before the call Bob's qubit is the centre; only the correction moves it". The widget draws the pure ψ on the sphere's surface at θ = 73.7° (P(+z) = 0.64), not the centre, and it has no correction control.
     - *Fix:* "This is $|\psi\rangle$, where Bob ends up after the correction; before the call his qubit has no point on the sphere at all — it is the centre of the ball (stage)."
2. **`q11-teleport-algebra:b1` draws the wrong state** (`Q11.story.ts:75, 233`).
   - The stage is `amp(PSI_SRC)` with `PSI_SRC = {circuit: C_TELE, upTo: 1}`. After column 1 only R_y has acted, so the bars show |ψ⟩|00⟩: two bars, 0.80 at 000 and 0.60 at 100.
   - The caption says "|ψ⟩ and a shared Bell pair: three qubits" (Formal: |ψ⟩|Φ⁺⟩). The plan has `upTo: 3` (`P-Q11-story.md`, b1 Stage), which is ψ⊗Φ⁺ with four bars (numpy checked).
   - *Fix:* `stage: amp({ circuit: C_TELE, upTo: 3, outcomes: '00' })`.
3. **Three displayed teleportation identities are false as written.** The protocol and the corrections themselves are right.
   - **(a) σ₁₁ = ZX makes the regrouping identity false.**
     - After CNOT + H, the 11 term is |11⟩(α|1⟩ − β|0⟩) = |11⟩ **XZ**|ψ⟩ (N&C Eq. 1.32). ZX|ψ⟩ is minus that.
     - A relative sign on one branch of a superposition is not a global phase. numpy: ½Σ|xy⟩σ_xy|ψ⟩ reproduces the state with σ₁₁ = XZ (= −iY) and fails with ZX.
     - **Sites:**
       - `Q11.story.ts:241` (b2 formal "$I$, $X$, $Z$ or $ZX$") and `:258` (Ground D step 4 `\sigma_{11} = ZX`);
       - `Q11.review.ts:60`;
       - the `Q11.values.ts:155` comment.
     - *Fix:* σ₁₁ = XZ (= −iY). The correction stays Z^{M₁}X^{M₂} = ZX = (XZ)⁻¹. Add a line: "Bob's twist is XZ; undoing it takes ZX, X first."
   - **(b) The twirl is missing its dagger.**
     - `\tfrac14\sum\sigma_{xy}|\psi\rangle\langle\psi|\sigma_{xy} = \tfrac12I` (`:350, :355`) is false with σ₁₁ = ZX (and with XZ): it gives ½I − ½YρY.
     - *Fix:* write `\sigma_{xy}|\psi\rangle\langle\psi|\sigma_{xy}^\dagger`.
   - **(c) Ground D step 1 has the wrong prefactor and an unlabelled trace** (`:345`). It reads `\mathrm{Tr}(\tfrac12\sum_{xy}|\beta_{xy}\rangle\langle\beta_{xy}|\otimes\ldots)`. The dephased state has weight ¼ per branch; ½ gives trace 2 (numpy).
     - *Fix:* `\mathrm{Tr}_{A_1A_2}\big(\tfrac14\sum_{xy}|\beta_{xy}\rangle\langle\beta_{xy}|\otimes\sigma_{xy}|\psi\rangle\langle\psi|\sigma_{xy}^\dagger\big)`.

## Should-fix
4. **Two Bergou citations point at the wrong section or page.**
   - **Bergou §14.3 (pp. 260–262) is "Gate Teleportation", not repeaters.** The 100 km limit and quantum repeaters are in §3.4.3, p. 39. Affected: `Q11.ts` swapping `books[1]`, `qc-quantum-repeater.formal`, and the plan (`P-Q11-story.md:16, 115, 305, 506`).
     - *Fix:* cite "Bergou §3.4.3 p. 39" for repeaters and 100 km. Keep §14.3 only as "teleporting a CNOT gate with entanglement" if it is wanted at all.
   - **Bergou Problem 3.3 is in §3.10, pp. 60–61, not "§3.4 … p. 40".** Affected: `Q11.ts` qudit `lecture` and `books`.
5. **Q10 is merged, but Q11 still treats no-signalling as unbuilt.**
   - `concepts.ts:145` has `qc-teleportation.needs: ['qc-bell-cycle']`, with **no `qc-no-signalling`** (the brief's flag), and the comment at `concepts.ts:141–142` says to add it "once Q10 merges".
   - `q11-teleport-circuit:b2/b3`, `q11-swapping:b4` and `qc-classical-channel.formal` ("Chapter Q10") name it in words only, and the comment at `Q11.story.ts:33–34` is stale.
   - *Fix:*
     - Set `needs: ['qc-bell-cycle', 'qc-no-signalling']`, and give `qc-teleport-circuit` and `qc-swapping` the same edge.
     - Link `[[qc-no-signalling|no-signalling]]` in b2's formal text, b3's formal text, b4's formal reveal and the glossary entry.
     - Add `qc-no-signalling` to `Q11.ts` `prerequisites`.
6. **Two answer keys are typed literals, and two challenges are keyed to the wrong quantity.**
   - `q11DCbits: 2` and `q11WeylCount3: 9` are literals in both TS and numpy (`q11.py:292, 309`). The remap ruling's "engine-backed answers" rule forbids this, and both are challenge keys.
     - *Fix:* `Math.log2(new Set([DC_I, DC_Z, DC_X, DC_Y].map((r) => r.readout)).size)` and the length of the orthonormal `weylBell(3, ·, ·)` set, with numpy computing the same by rank.
   - **Matching slips:** the values agree only by coincidence.
     - `q11-ta-prob` asks for outcome **01** but is keyed to `TELE_00.prob`.
       - *Fix:* key it to `TELE_01.prob`.
     - `q11-tc-pre` asks for **⟨Z⟩** but is keyed to `bobPreLen = |r|`.
       - *Fix:* key it to `reducedBloch(TELE_00.bobPre, 0)[2]`.
7. **The qudit review card shows builder notes to learners as traps** (`Q11.review.ts:112, 123`).
   - The Ground trap reads "No trap is shipped here: Bergou Problem 3.3 is flagged, state only, with no graded challenge". It is plan-speak, and it is false: `q11-qd-count` is graded.
   - The Formal trap reads "the stage kinds here are built for qubit registers only".
   - *Fix:*
     - Ground trap: "Expecting $N$ generalized Bell states: there are $N^2$, one per $(n, m)$."
     - Formal trap: "Reading $j\oplus m$ as plain addition: it is addition mod $N$."
     - Give `q11-qd-count` a one-line walkthrough ("$n$ and $m$ each take $N$ values: $N^2 = 9$"). Counting is not P3.3's task (orthonormality is), so the ruling allows it.
8. **The other Try-it lines do not match their widgets.**
   - `q11-teleport-algebra` (`Q11.ts:216`): "the right correction always restores it on Bob's side". This one-qubit sphere has no Bob and no correction.
   - `q11-swapping` (`:316`): "Picture Bob's own Bell measurement" sits on a one-qubit bar chart.
   - *Fix:*
     - Add `rotations: true, rotationAngles: [180]` and say "apply X twice, or Z twice: each Pauli undoes itself, which is why Bob's correction works".
     - For swapping, give the tryThis a one-qubit point or drop the visual.
9. **The phase of (Y⊗I)Φ⁺ has the wrong sign** (`Q11.story.ts:117`). It reads `= i\,\Psi^-`, but (i/√2)(|10⟩ − |01⟩) = **−i**Ψ⁻ with Ψ⁻ = (|01⟩ − |10⟩)/√2 (numpy).
   - *Fix:* `= -i\,\Psi^-`. The `why` already says the phase is global.

## Nits
10. **Page citations.**
    - N&C Fig. 1.12 is on p. 26 (`Q11.ts:117` says p. 25); write "pp. 25–26".
    - Bergou's singlet cycle is Table 3.1, p. 38 (`:118` says p. 37).
11. "About a hundred kilometres" / "near 100 km" (`Q11.story.ts:440, 442`) is a hand-typed physical figure with no source at the sentence. Add "(Bergou p. 39)".
12. One letter, two names: the unit asks about "$d$-level systems" but works in $N$ (`Q11.ts:369` says "For $d$-level systems … at $N = 3$"; b1's formal text says "$N = d$"). Use $N$ (Bergou's letter) throughout and say once "a $d$-level qudit ($N = d$)".
13. **`q11-swapping:b4` reveal.**
    - It says "Averaged over his outcomes, each of A and C alone is still ½I". This holds for every branch, not only on average.
    - The sharper fact is that the averaged A–C **pair** is ¼I, which is not entangled at all.
    - *Fix:* add that clause.
14. Unused V keys (`q11One`, `q11BobPostRx/Rz`, `q11TeleProbsEqual`, `q11TeleBranchProbGap`, `q11SwapProbGap`, `q11SwapAcFidMin`, `q11SwapCircuitAlgebraGap`, `q11WeylMatchesBell2`) are twinned but back no learner text. That is harmless; either attach them or drop them.
15. **`qc-ebit` is correct for qubits.** It is one maximally entangled two-qubit pair, and dense coding and teleportation each spend one.
    - The qudit beat that follows sends "log₂N² bits per qudit", and a maximally entangled qudit pair is log₂N ebits. Q12 then measures in ebits through S(ρ_A).
    - *Fix:* formal: "the entanglement of one maximally entangled **two-qubit** pair ($S(\rho_A) = 1$)".
    - (Outside Q11: `Q12.story.ts:300, 302` bold "**ebit**" without `[[qc-ebit|ebit]]`, so Q12 does not actually reuse the id. That is for the Q12 owner.)

## Builder's-language questions
- The `amplitudes` 'amplitude' mode shows sign as hue and as the "−0.71" label. "two bars, opposite sign" (`Q11.story.ts:114`) would read more literally with `mode: 'signed'`.
- In Ground-up, `q11-ta-corr`'s hints use $M_1, M_2$ before any Ground text defines them; Ground defines them only at `q11-teleport-circuit:b2`. Also, the teleport-algebra Ground D step 3 uses σ_xy before step 4 lists them. Swap those two steps.

## Checked and right
- **The resource is Φ⁺ throughout,** named "Φ⁺ (N&C: β₀₀; Bergou: Ψ₊)" on first use, with Bergou's singlet versions (Tables 3.1/3.2, Eqs. 3.20–3.21, all checked) cited only as book notes. Erratum B6 was confirmed on the p. 32 render.
- **`C_CYCLE`:**
  - H then CNOT builds Φ⁺. The Pauli on wire 0 equals `bellCycle(op) = (op⊗I)Φ⁺` and the prose ("Alice does one gate on her qubit").
  - The plan's wire 1 would give the same images except Y, whose phase would flip to +iΨ⁻.
  - All four images are orthonormal, and the tq view after Y shows Ψ⁻'s grid −I₃.
- **Dense coding:** I/Z/X/Y read back 00/10/01/11 with certainty. Each sent qubit alone is ½I (Eve learns nothing), and Bob's half is ½I.
- **Teleportation:**
  - All four branches have p = ¼ and pre-correction states I, X, Z, XZ applied to ψ.
  - C_TELE applies X on bit 1 then Z on bit 0, which is Z^{M₁}X^{M₂} with X first, as N&C p. 28. Fidelity is 1 in all branches, and the `q11-ta-corr` key (10 → Z) is right.
  - The no-clone claim holds: Alice's qubit is |1⟩ for M₁ = 1.
- **Swapping:** Φ⁺Φ⁺ = ½Σβ_xy(B₁B₂)β_xy(AC) with all + signs. The C_SWAP decode maps 00/01/10/11 to Φ⁺/Ψ⁺/Φ⁻/Ψ⁻, so the `q11-sw-ac` key (Ψ⁺ → Ψ⁺) is right.
- **Weyl–Bell:** N = 2 gives exactly (Φ⁺, Φ⁻, Ψ⁺, Ψ⁻) at (n,m) = (0,0), (1,0), (0,1), (1,1), and N = 3 gives 9 orthonormal states.
- **Bell-basis captions on computational bars:**
  - `bell-tools` D: "two bars at 00 and 11", "opposite sign", "move to 01, 10".
  - `dense-coding` D: "the two bars of her chosen Bell state".
  - Teleport views at upTo 3, 5, 6 and 8, with their outcomes, all match what is drawn. The one exception is b1 (item 2).
- **General checks:**
  - Amplitudes are never shown as percentages ('amplitude' mode).
  - No raw TeX outside `$…$`, and no plan ids in learner text.
  - The 448 bridge `qc-l3-postulates` resolves.
  - No glossary id is duplicated, and `qc-ebit` is defined once (Q11, `first: q11-dense-coding:b1`, notation beat present).
