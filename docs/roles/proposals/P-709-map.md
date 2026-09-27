# P-709-map: Physics 709 semester story map (P, 2026-09-27)

The map that every per-chapter plan (`P-Q{n}-story.md`, `P-F{n}-story.md`) and the QC engine/platform design build on.
Read-only survey of:
- notes L1–L3 (`qc709-n1..n3`, pp. 2–17), text, with 5 page images checked by eye;
- Bergou–Hillery–Saffman 2e, all 15 chapters in the text layer, with 15 suspect pages rendered from the PDF and checked
  by eye;
- Axler 4e (contents, 9D);
- HW1;
- `meta.generated.ts` (all 38 Physics 448 unit ids).

Every derivation named below was re-done by hand.

## 0. How to read this

**Block legend.** Q = the driving question. Units = 3–6 ids with their job. Src = sources. Ground = the Ground-up ramp
(the 9th-grade starting facts, then derivations D1… with their end results). Formal = notation used at full strength.
Terms = glossary seeds, grouped by the unit that first defines them. Bridges = 448 unit ids or F chapters, with the term
or step each one serves. Stages = existing kinds or ones proposed in (c). Engine = new pure functions beyond
`app/src/physics/` (see (b) for modules and numpy twins). Media = Motion Canvas films (every number drawn from engine data)
and decor; one Blender opener and one Higgsfield shot list per Part, in the Part header. HW = homework: hints only.

**Page citations.** Bergou pages are the *printed* numbers. The brief's rule "printed = PDF − 15" holds only in Ch. 1: the
e-book drops blank pages, so the offset drifts from 15 down to 5. The offset table is in (d)-E1. Axler is PDF − 14
throughout (checked on pp. 132 and 370). Notes pages are the PDF page numbers the notes print (2–17).

**⚑ = a derivation that is also a Bergou end-of-chapter problem.** Today only HW1 is assigned, but later sheets will likely
draw on Bergou's problems. A ⚑ step becomes hints-only as soon as a sheet assigns it: the story then states the result
from the book, with a citation, and leaves the working out.

**Conventions** used below (proposed locks; the reasons and clashes are in (d)): ħ = 1 in the engine and S = σ/2, as in
448. |0⟩ ≡ |+z⟩ is the north pole. The register is big-endian: qubit 0 is the leftmost tensor factor, the top wire and
the most significant bit. The Bloch vector is **r** (|r| ≤ 1) and n̂ is a unit axis. R_n(θ) = e^{−iθ n·σ/2}.
Fidelity is Bergou's root fidelity. Entropies are in bits. Bell states follow the standard names, Φ± = |00⟩±|11⟩ and
Ψ± = |01⟩±|10⟩ (normalized); **Bergou swaps these**, see (d)-C3.

**Merges, splits, reorders** (the plan's ids F1–F8 and Q1–Q25 are all kept, and no id changes meaning):
1. **Q6/Q7 boundary.** The partial trace half of Bergou §2.1 moves from Q6 to Q7. Q6 stays single-system (ensembles,
   the ball), and Q7 opens with the partial trace, where the F6 tensor products are needed anyway.
2. **Entropy.** Q10 defines E = S(ρ_A) and uses it. The toolkit proofs (Klein's inequality, subadditivity, concavity:
   Bergou §3.7.2–3.7.3) move to Q21's Formal track, which Bergou Ch. 11 re-states anyway. F5 gains a ground-up
   Shannon-entropy unit, so Q10 has something 9th-grade to stand on.
3. **Codes.** Bergou §9.2 (classical linear codes, CSS, Steane) moves from Q19 to Q20, next to the stabilizer check
   matrix. Both need GF(2) linear algebra and parity-check matrices, and the stabilizer view makes CSS/Steane shorter.
   Q19 keeps the repetition, Shor and Knill–Laflamme material and decoherence-free subspaces.
4. **GF(2).** F7 gains GF(2) linear algebra (row reduction mod 2), needed by Simon (Q16), the codes (Q20) and the check
   matrices. F8 keeps mod N and Fourier.
5. **Q3 stays one chapter with 6 units**, although notes L3 (7 pp.) is dense. Every unit has a strong 448 bridge
   (l3–l7), so each 709 unit can teach only what the notes add, under the 448 ownership rule.
6. **Q16's Shor unit is Formal-only and flagged** "outside the book": Bergou deliberately omits Shor (preface, p. ix).
   Drop it if the notes never reach it.

---

## 1. Part F — Foundations (ground-up; reached as bridges too)

*Opener (Blender, 300 K plate): "the ring and the helix". The engine's roots of unity e^{2πik/N} (N = 3…12) rise into
the helix (cos φ, sin φ, φ). Geometry comes from `rootsOfUnity` and `expi` samples. Decor (Higgsfield): a sunlit brass
optics bench, dust in the light, the room-temperature top plate. No text, no results.*

#### F1 · Numbers that turn (complex numbers, e^{iφ})
**Q** "Why would anyone need a number whose square is −1, and what does it have to do with spinning arrows?"
- **Units** `f1-number-line`: the gap that x² = −1 leaves, and i. · `f1-plane`: a + bi as a point or arrow; sum,
  conjugate, |z|² = z z*. · `f1-multiply`: multiplying scales and turns; i is a quarter turn. · `f1-euler`: e^{iφ} on
  the unit circle; e^{iπ} = −1. · `f1-phase`: global versus relative phase; phasor sums and interference.
- **Src** Axler 1A pp. 2–5 and Ch. 4 p. 124 (factorization over C); Bergou Eq. (1.2) p. 2 and §1.5 pp. 7–8 (phase
  shifter); notes pp. 7, 12 (e^{iδ}, e^{iϕ}).
- **Ground** Starts from the number line, negatives, Pythagoras and sin/cos on the unit circle.
  - D1 (a+bi)(c+di) = (ac−bd) + (ad+bc)i.
  - D2 i·(x+iy) = −y + ix, a 90° turn.
  - D3 |zw| = |z||w|.
  - D4 In polar form the angles add. Ground derives the angle-addition identities once, by similar triangles, so the
    step is not assumed.
  - D5 (1 + iφ/n)^n spirals onto cos φ + i sin φ, drawn live on the stage.
  - D6 |1 + e^{iφ}|² = 2 + 2 cos φ: interference.
  - **Formal** C as a field, z̄, arg, polar and exponential forms, power-series Euler, de Moivre, U(1), states as rays
    (global phase).
- **Terms** imaginary unit (number-line) · complex number, conjugate, modulus (plane) · argument/phase (multiply) ·
  Euler's formula (euler) · phasor, global/relative phase, interference (phase).
- **Bridges** l2-complex (the whole unit), l6-equator (relative phase = longitude), l7-full-turn (e^{iπ} = −1 as a sign).
- **Stages** complex-plane (new; or 448's B-POLE top view, per the L2 ruling), amplitudes (phasor readout).
- **Engine** `eulerLimit(φ,n)`, `phasorSum(phases)`. complex.ts already has expi, polar, arg, csqrt and cpow.
- **Films** "Multiplying by i is a quarter turn"; "(1+iφ/n)^n winds onto the circle".
- **HW** —.

#### F2 · Arrows with many parts (vectors, inner products, Gram–Schmidt)
**Q** "How can a list of numbers be an arrow, and how do we measure how much two arrows point the same way?"
- **Units** `f2-lists`: add, scale, linear combination. · `f2-space`: the axioms; complex vectors; polynomials as
  vectors. · `f2-independence`: span, LI, basis, dimension, unique components. · `f2-dot`: length, angle and shadow; the
  complex inner product and *why the conjugate*. · `f2-orthonormal`: c_i = ⟨e_i|ψ⟩, completeness. · `f2-gram-schmidt`:
  subtract the shadows, then normalize.
- **Src** notes pp. 3–7 (Figs. 2–4); Axler 1B p. 12, 2A p. 28, 2B p. 39, 2C p. 44, 6A pp. 182–191 (6.14
  Cauchy–Schwarz), 6B p. 197 (6.32 Gram–Schmidt).
- **Ground** Starts from graph-paper arrows, Pythagoras and the law of cosines.
  - D1 |v| from Pythagoras, applied twice.
  - D2 The law of cosines gives a·b = Σ a_i b_i = |a||b| cos θ.
  - D3 The shadow length is a·b/|a| (notes Fig. 3).
  - D4 Without the conjugate, (1, i)·(1, i) = 0, so ⟨v|v⟩ must be Σ|v_i|².
  - D5 c_i = ⟨e_i|ψ⟩ and uniqueness (the notes' proof).
  - D6 The Gram–Schmidt step is orthogonal by construction.
  - D7 Cauchy–Schwarz by the λ trick (notes p. 17).
  - **Formal** V(F), sesquilinear inner product (conjugate-linear first slot), norm, δ_ij, bra/ket, dual space,
    weighted inner product β†Mα with M > 0.
- **Terms** vector, linear combination (lists) · vector space (space) · span, linear independence, basis, dimension
  (independence) · inner product, norm, orthogonal, projection, Cauchy–Schwarz (dot) · orthonormal, completeness
  (orthonormal) · Gram–Schmidt (gram-schmidt).
- **Bridges** l2-vector-space (the axioms), l2-inner-product (bra times ket), l1-vectors, l2-three-bases.
- **Stages** hilbert-plane (real slice), vector-3d (Gram–Schmidt in 3D, notes Fig. 4; see (c)), amplitudes (component
  bars).
- **Engine** `projectOnto`, `angleBetween`, `components(psi, basis)`, `isIndependent` (via Gram–Schmidt residuals),
  `weightedInner(M,a,b)`. inner, gramSchmidt and bilinear already exist.
- **Films** "Gram–Schmidt in three dimensions" (the notes' Fig. 4 made live).
- **HW** HW1 P5(b) (the Gram–Schmidt step for spin 1): hints only.

#### F3 · Machines that move arrows (matrices, linear maps, change of basis)
**Q** "What is a matrix really doing when it multiplies a vector?"
- **Units** `f3-linear`: respects sums and scaling; rotate, stretch and project; a shift is not linear. · `f3-matrix`:
  the columns are the images of the basis; A_ij = ⟨e_i|A|e_j⟩. · `f3-product`: composition; AB ≠ BA. · `f3-inverse`:
  undo; 2×2 det as signed area. · `f3-outer`: |a⟩⟨b|; A = Σ A_ij|e_i⟩⟨e_j|; I = Σ|i⟩⟨i|. · `f3-change`: the same arrow in
  new coordinates: U_ij = ⟨α'_i|α_j⟩, A' = UAU†, tr invariant.
- **Src** notes pp. 8–10 (§C.4, §D.1); Axler 3A p. 52, 3B p. 62 (3.21), 3C pp. 69–77, 3D p. 82 and p. 90 (change of
  basis), 8D p. 326 (trace), 9C p. 354.
- **Ground** Starts from f(x) = 2x, rotating a point on graph paper, two linear equations in two unknowns, and the area
  of a parallelogram.
  - D1 A(xe₁ + ye₂) = xAe₁ + yAe₂: the matrix–vector rule.
  - D2 A(Bv) gives the row-by-column rule.
  - D3 Rotate-then-reflect ≠ reflect-then-rotate.
  - D4 The 2×2 inverse from solving the equations; det = ad − bc.
  - D5 Insert the identity twice to get A = Σ A_ij|i⟩⟨j|.
  - D6 c' = Uc and A' = UAU† (notes pp. 8–9).
  - D7 tr(UAU†) = tr A.
  - **Formal** L(V,W), null space, range, rank–nullity, M(T), isomorphism, adjoint †, unitary, similarity, trace,
    determinant.
- **Terms** linear map (linear) · matrix element (matrix) · product, commutator preview (product) · inverse,
  determinant (inverse) · outer product, completeness relation (outer) · change-of-basis matrix, unitary, trace (change).
- **Bridges** l3-operators, l5-coordinates, l5-operators, l5-invariance, l6-active (turning a state versus changing the
  basis).
- **Stages** hilbert-plane (image field G1), operator-space.
- **Engine** `traceN`, `detN` (LU with pivoting), `invN`, `rankN`, `changeU(new, old)` (tested as `basisMatrix(new)†`).
- **Films** "A matrix is where the basis arrows land" (engine grid images).
- **HW** HW1 P5(d) (U and U†U = 1): hints only.

#### F4 · Special directions (eigen, Hermitian, unitary, spectral theorem)
**Q** "Which arrows does a machine only stretch, and why do they matter so much?"
- **Units** `f4-eigen`: Av = λv; det(A − λI) = 0 for 2×2. · `f4-hermitian`: A = A†; real λ; orthogonal eigenvectors. ·
  `f4-spectral`: A = Σ λ|a⟩⟨a|; U†AU diagonal; f(A). · `f4-unitary`: lengths and angles are kept; |λ| = 1; e^{−iHt}. ·
  `f4-commuting`: a shared eigenbasis. · `f4-positive`: A ≥ 0, √A, projectors, SVD and polar form (Formal).
- **Src** notes pp. 14–16; Axler 5A p. 133, 5D p. 163, 5E p. 175, 7A pp. 228–235, 7B pp. 243–247 (7.29, 7.31), 7C p. 251,
  7D pp. 258–260, 7E p. 270, 7F p. 285, 8C p. 319.
- **Ground** Starts from the quadratic formula and the F3 determinant.
  - D1 λ² − (tr A)λ + det A = 0.
  - D2 For [[a,b],[b*,d]] the discriminant (a−d)² + 4|b|² ≥ 0, so λ is real.
  - D3 The general real-λ proof and the orthogonality proof (notes p. 15).
  - D4 A = UDU† ⇒ Aⁿ = UDⁿU† ⇒ f(A).
  - D5 (n·σ)² = I ⇒ e^{−iθn·σ/2} = cos(θ/2) I − i sin(θ/2) n·σ.
  - D6 |Uv| = |v|.
  - D7 [A,B] = 0 makes B diagonal in A's eigenbasis (notes p. 16).
  - **Formal** spectrum, normal operators, the complex spectral theorem, U(n), positive semidefinite, functional
    calculus, simultaneous diagonalization, SVD, polar decomposition A = U|A|.
- **Terms** eigenvalue, eigenvector, characteristic equation, degenerate (eigen) · Hermitian (hermitian) · spectral
  decomposition, diagonalize (spectral) · unitary (unitary) · commuting, simultaneous eigenbasis (commuting) · positive
  operator, operator square root, SVD, polar decomposition (positive).
- **Bridges** l3-eigen, l4-eigen, l5-inverse, l5-operators, l6-generator (e^{−iφS_z}), l7-compatible.
- **Stages** operator-space (arrow = half the eigenvalue gap), hilbert-plane (image), bloch (a unitary as a rotation).
- **Engine** `eigh(H)` (n×n Jacobi; the backbone of everything below), `funcHermitian(H,f)`, `sqrtPSD`, `logPSD`,
  `expmHermitian(H,t)`, `svd`, `polar`, `simultaneousEigenbasis`.
- **Films** "Stretch directions: a 2×2 machine acting on a ring of arrows".
- **HW** HW1 P4(a) and P5(c) (why Gram–Schmidt must land on the Sx eigenvector): hints only.

#### F5 · Chance with numbers (probability, averages, spread, surprise)
**Q** "If each single atom is random, what can we still predict exactly?"
- **Units** `f5-probability`: frequencies; probabilities sum to 1; independent events multiply. · `f5-average`:
  ⟨M⟩ = Σ M_α P_α. · `f5-spread`: variance, standard deviation, σ/√N for the mean. · `f5-joint`: joint, marginal and
  conditional; the correlator ⟨ab⟩; the marginal problem behind Bell. · `f5-surprise`: bits, twenty questions, Shannon
  H, h(p), mutual information.
- **Src** notes pp. 14–16 (averages, ⟨Aⁿ⟩, dispersion); Bergou §3.3 pp. 34–37 (joint distributions, marginals), §3.7.1
  p. 47, §11.1 p. 190, §11.3 pp. 193–194; Reif §1.2–1.6 (reference only, as in 448).
- **Ground** Starts from percentages, coin flips and a class average.
  - D1 The mean of many readings → Σ M P.
  - D2 E[(M−μ)²] = E[M²] − μ².
  - D3 For a ±ħ/2 variable with P(+) = p: ⟨S⟩ = (ħ/2)(2p−1) and (ΔS)² = ħ²p(1−p).
  - D4 The spread of the mean of N readings is σ/√N (448 sigmaBand).
  - D5 N equal options need log₂N yes/no questions, so H = −Σ p log₂p and h(½) = 1.
  - D6 I(X:Y) = H(X) + H(Y) − H(X,Y).
  - **Formal** random variable, E, Var, covariance, independence, KL divergence, classical fidelity Σ√(pq), L1
    distance.
- **Terms** probability, frequency (probability) · expectation value (average) · variance, standard deviation (spread) ·
  joint, marginal, conditional, correlation (joint) · bit of information, Shannon entropy, binary entropy, mutual
  information (surprise).
- **Bridges** l1-average (the average is set by the tilt), l3-spread, l4-average, l7-spreads.
- **Stages** amplitudes in probability-bar mode; lab-r3 deposits (tallies).
- **Engine** `mean`, `variance`, `shannon`, `binaryEntropy`, `marginals(pxy)`, `mutualInfo`, `relEntropyC`,
  `fidelityC`, `l1Distance`, `multinomialSample`. random.ts already has rng, binomial and zScore.
- **Films** "A Galton board: averages sharpen as 1/√N" (seeded engine samples).
- **HW** HW1 P1 and P3 use these tools. The story never plugs in HW1's |+n⟩: hints only.

#### F6 · Many at once (tensor and Kronecker products)
**Q** "How do you describe two coins, or two atoms, at the same time?"
- **Units** `f6-pairs`: n bits have 2ⁿ outcomes. · `f6-kron`: every amplitude times every amplitude; |ab⟩ ordering. ·
  `f6-kron-matrix`: (A⊗B)(u⊗v) = Au⊗Bv; X ⊗ I. · `f6-product-or-not`: the factoring test. · `f6-inner`: inner products
  factor; the dimensions multiply. · `f6-growth`: the exponential memory wall.
- **Src** Axler 9D pp. 370–380 (9.72, 9.73; inner-product spaces p. 376; many factors p. 378); Bergou Eqs. (1.3)–(1.4)
  p. 2, §2.1 p. 16 (X_A ⊗ I_B), §3.1 p. 31.
- **Ground** Starts from multiplication grids, the outcomes of two dice, and binary numbers.
  - D1 n bits give 2ⁿ strings.
  - D2 (a₀|0⟩+a₁|1⟩)⊗(b₀|0⟩+b₁|1⟩), expanded by the distributive law, is (a₀b₀, a₀b₁, a₁b₀, a₁b₁).
  - D3 A two-qubit state is a product ⇔ a₀₀a₁₁ − a₀₁a₁₀ = 0, both directions (⚑ close to Bergou P3.6).
  - D4 (A⊗B)(u⊗v) = Au⊗Bv.
  - D5 A product of normalized states is normalized.
  - D6 Memory is 2ⁿ × 16 B: n = 30 → 16 GiB; n = 50 → 16 PiB.
  - **Formal** V⊗W, dim = product, basis e_j⊗f_k, bilinearity, Kronecker product, big-endian index
    i = Σ b_k 2^{n−1−k}, A⊗I.
- **Terms** Cartesian count (pairs) · tensor product, Kronecker product, computational basis, big-endian (kron) ·
  local operator A⊗I (kron-matrix) · product state, entangled (algebraic) (product-or-not) · register (growth).
- **Bridges** F2 (basis, inner product), F3, l1-vectors, l2-three-bases.
- **Stages** amplitudes (2ⁿ bars), two-qubit (product versus entangled), cityscape (A⊗B entries).
- **Engine** `kron`, `kronM`, `kronAll`, `indexOfBits`, `bitsOfIndex`, `coefMatrix(psi)`, `isProduct(psi)`,
  `embed(A, n, qubits)`.
- **Films** "The distributive law builds the four bars" (the kron of two engine kets).
- **HW** —.

#### F7 · Bits and logic that can run backwards (Boolean logic, reversibility, GF(2), cost)
**Q** "Why can't a quantum computer just use ordinary AND gates, and what does 'fast' even mean?"
- **Units** `f7-binary`: bit strings, place value. · `f7-boolean`: NOT, AND, OR, XOR; the four one-bit functions;
  constant versus balanced. · `f7-reversible`: AND loses information; |x,y⟩ → |x, y⊕f(x)⟩; CNOT, Toffoli; SWAP = 3
  CNOTs. · `f7-mod2`: XOR as + mod 2; x·z mod 2; parity. · `f7-gf2`: parity checks, Hamming weight and distance, row
  reduction mod 2. · `f7-cost`: counting queries; polynomial versus exponential; O(·).
- **Src** Bergou §1.2 p. 3, §1.4 p. 5, P1.3–1.4 p. 12, §7.1 pp. 117–120 (x·z; Eqs. 7.10–7.12), §7.4 p. 126, §9.2
  pp. 170–175, §10.1 p. 180, §8.4 p. 153 (Toffoli), preface p. ix.
- **Ground** Starts from binary counting, truth-table puzzles, clock arithmetic and counting the steps of a search.
  - D1 AND maps three inputs to 0, so it has no unitary version.
  - D2 y ⊕ f ⊕ f = y: the f-CNOT is its own inverse, a permutation matrix, so it is unitary.
  - D3 Three XORs swap a and b (⚑ P1.4a).
  - D4 Σ_x (−1)^{x·z} = 2ⁿ δ_{z,0}, by pairing inputs that differ in one bit.
  - D5 d ≥ 2t+1 corrects t flips.
  - D6 A deterministic Deutsch–Jozsa test needs 2^{n−1} + 1 queries in the worst case.
  - **Formal** f: {0,1}ⁿ → {0,1}, reversible circuits, F₂ⁿ, the parity-check matrix, rank over F₂, query complexity;
    P, BPP, BQP by name only.
- **Terms** bit, bit string (binary) · truth table, Boolean function, constant, balanced, XOR (boolean) · reversible
  gate, CNOT, Toffoli, SWAP (reversible) · parity, mod 2, bitwise dot product (mod2) · Hamming weight, Hamming distance,
  parity check (gf2) · query complexity, polynomial versus exponential (cost).
- **Bridges** l1-logic (the order of propositions), F6 (strings label basis states).
- **Stages** circuit (classical inputs), amplitudes (a permutation of the bars).
- **Engine** bits.ts: `xor`, `dotMod2`, `parity`, `hammingWeight`, `hammingDistance`, `truthTable`, `isConstant`,
  `isBalanced`, `reversibleOracle(f)`, `permutationMatrix`, `gf2RowReduce`, `gf2Rank`, `gf2Nullspace`,
  `hammingParity(r)`.
- **Films** "Three CNOTs swap two bits".
- **HW** — (Bergou P1.3–1.4 are ⚑).

#### F8 · Hidden rhythms (modular arithmetic, roots of unity, Fourier sums)
**Q** "How can a sum of spinning arrows reveal a hidden rhythm?"
- **Units** `f8-clock`: mod N, periodic f(x+r) = f(x). · `f8-roots`: zᴺ = 1 gives a regular N-gon whose points sum to
  0. · `f8-dft`: F_jk = ω^{jk}/√N is unitary; a period makes peaks. · `f8-binary-phase`: 0.a₁a₂…; doubling the phase;
  the product form. · `f8-geometric`: Σ rʸ; |1 − e^{iθ}| = 2|sin(θ/2)|; the 2|θ|/π bound.
- **Src** Bergou §7.5 pp. 127–129 (Eqs. 7.34–7.43), §7.4 p. 126, P3.3 p. 60 (mod N); Axler 1A pp. 2–5, Ch. 4 p. 124.
- **Ground** Starts from clocks, polygon angles 360°/N, the F1 phasors, and the S − rS trick.
  - D1 ω = e^{2πi/N}, ωᴺ = 1: an N-gon.
  - D2 Σ_k ω^{jk} = N δ_{j≡0}.
  - D3 F†F = I.
  - D4 A period r with r | N puts DFT peaks at multiples of N/r.
  - D5 e^{2πi2^j(0.a₁a₂…)} keeps only the digits after the j-th.
  - D6 The closed-form geometric sum → |Σ_y e^{2πiδy}|/2^m ≥ 2/π → P ≥ 4/π² ≈ 0.405.
  - **Formal** Z_N, the group of roots of unity, the DFT and QFT sign convention, shift → phase, binary fractions.
- **Terms** modulus, period (clock) · root of unity (roots) · DFT (dft) · binary fraction (binary-phase) · geometric
  series (geometric).
- **Bridges** F1, F7, F4 (unitary), l2-complex.
- **Stages** complex-plane (new), amplitudes (DFT output).
- **Engine** `rootsOfUnity`, `dftMatrix` (sign +), `dft`, `geometricSum`, `binaryFraction`, `peBound(δ,m)`.
- **Films** "Spinning arrows cancel except on the rhythm".
- **HW** —.

## 2. Part I — QM review (notes L1–L3, the print-ready Read mode)

*Opener (Blender, 50 K shield): the silver beam splits on the Stern–Gerlach bench. It reuses `lab.glb`, with deflections
from `sg.ts` and `field.ts`. Decor: furnace glow, silver vapour, frost starting on a vacuum flange.*

#### Q1 · Stern–Gerlach and the rules of the game (notes L1, pp. 2–5)
**Q** "Why does a beam of silver atoms split into exactly two spots, and what kind of math can describe that?"
- **Units** `q1-two-spots`: E = −μ·B, F_z = μ_z ∂B_z/∂z; two values only. · `q1-sequences`: z → x → z brings back
  both z outcomes; a second measurement can erase the first. · `q1-superposition`: kets |±z⟩; c₁|ψ₁⟩ + c₂|ψ₂⟩ is a
  state. · `q1-vector-space`: the axioms and examples (Rⁿ, Cⁿ, polynomials). · `q1-inner-product`: the dual space,
  bras, the axioms, the norm, weighted inner products, the shadow picture (Fig. 3).
- **Src** notes pp. 2–5 (Figs. 1–3); Bergou §1.1 p. 1 (Eq. 1.1); Axler 1B p. 12, 6A p. 182.
- **Ground** Starts from bar magnets in a lopsided field and force as the slope of energy.
  - D1 F_z = −∂E/∂z with E = −μ_zB_z → μ_z ∂B_z/∂z.
  - D2 A continuous μ_z would smear the beam; two values give two spots.
  - D3 z → x → z probabilities from |+x⟩ = (|+z⟩+|−z⟩)/√2: ½ and ½.
  - D4 ⟨cβ|α⟩ = c*⟨β|α⟩ follows from conjugate symmetry.
  - **Formal** Hilbert space, Dirac notation, dual correspondence, sesquilinear inner product (the notes' "bilinear",
    see (d)-N2), V^n(C), ⟨β|α⟩_M.
- **Terms** Stern–Gerlach, magnetic moment, quantization, Bohr magneton (two-spots) · sequential measurement
  (sequences) · ket, superposition principle (superposition) · vector space (vector-space) · bra, dual vector, inner
  product, norm, Hilbert space (inner-product).
- **Bridges** l1-quantized (two spots), l1-sequential (z–x–z), l1-vectors, l2-vector-space, l2-inner-product; F2.
- **Stages** lab-r3 (sequence benches), hilbert-plane.
- **Engine** nothing new beyond F2 (sg.ts already has benchTheory, sequenceOutcomes and fireMany).
- **Films** "z–x–z erases the memory" (engine sequenceOutcomes tallies).
- **HW** HW1 P2 (three filters) sits on this physics. No film or claim may show its fraction: hints only.

#### Q2 · Coordinates, bases and turning frames (notes L2, pp. 6–10)
**Q** "The same arrow can wear different coordinates: how do we translate between them without changing any
prediction?"
- **Units** `q2-basis`: LI, dimension, unique components, c_i = ⟨e_i|ψ⟩. · `q2-gram-schmidt`: the procedure (Fig. 4).
  · `q2-spin-space`: |ψ⟩ = α|+z⟩ + β|−z⟩; the phase choice for |±x⟩ (Eqs. 1.1–1.2); the inverse; Fig. 5's 45° real
  slice. · `q2-change`: U_ij = ⟨α'_i|α_j⟩, d = Uc; the z→x U *is* the Hadamard matrix; A' = UAU†; unitarity. ·
  `q2-photon`: |x⟩, |y⟩, a frame rotated by ϕ, |R⟩ and |L⟩, |R'⟩ = e^{−iϕ}|R⟩ ⇒ J_z = ±ħ. · `q2-operators`: linear
  operators, the outer product, f = Ac, A = Σ A_ij|e_i⟩⟨e_j| (Fig. 6).
- **Src** notes pp. 6–10 (Eqs. 1.1–1.3); Bergou Eq. (1.8) p. 4 (H), §14.2 p. 257 (polarization encoding); Axler 2B p. 39,
  6B p. 197, 3C p. 69, 3D p. 90.
- **Ground** Starts from rotated graph paper (x' = x cos ϕ + y sin ϕ) and polarizing sunglasses.
  - D1 Components are unique (the notes' proof).
  - D2 Adding Eqs. 1.1 and 1.2 gives |+z⟩ = (|+x⟩+|−x⟩)/√2.
  - D3 d₁ = (c₁+c₂)/√2 and d₂ = (c₁−c₂)/√2. **This corrects Eq. 1.3's sign**, (d)-N4.
  - D4 A' = UAU† by inserting identities.
  - D5 UU† = I from completeness.
  - D6 |R'⟩ = e^{−iϕ}|R⟩, line by line from |x'⟩ and |y'⟩.
  - **Formal** ON basis, Gram–Schmidt, U_ij, unitary, similarity, completeness, helicity basis, generator
    e^{−iJ_zϕ/ħ}.
- **Terms** basis, component (basis) · Gram–Schmidt (gram-schmidt) · probability amplitude (spin-space) ·
  change-of-basis matrix, unitary (change) · linear/circular polarization, helicity, generator (photon) · linear
  operator, matrix element, outer product (operators).
- **Bridges** l2-three-bases, l5-coordinates (448 writes B_{z←x}; U = B†, see (d)-C7), l5-operators, l5-invariance,
  l3-operators, l6-active and l6-generator (for e^{−iJϕ}), l7-two-angles (a photon angle ϕ is 2ϕ on the sphere).
- **Stages** hilbert-plane (turning frames), bloch (the Poincaré sphere for photons), vector-3d (Fig. 4).
- **Engine** `changeU` (F3), `polarizationKet(ϕ)`, `circularKets()`, `rotateFrame(ϕ)`.
- **Films** "One arrow, two grids" (the frame turns 45°); "Turning the photon frame gives R a phase".
- **HW** HW1 P5 (the spin-1 Gram–Schmidt and U) is the chapter's worked twin. Hints only: use a *different* example
  (spin ½ in the y basis) for the shown Gram–Schmidt.

#### Q3 · Measurement, the Bloch sphere and uncertainty (notes L3, pp. 11–17)
**Q** "What exactly happens, in numbers, when you measure, and why can't two spin components both be sharp?"
- **Units**
  - `q3-born`: P = |⟨α|β⟩|²; P_M = |M⟩⟨M|; p = ⟨ψ|P|ψ⟩; the resolution of the identity.
  - `q3-bloch`: |+n⟩ (1.4) and |−n⟩ (1.5).
  - `q3-spin-operators`: P_{±z} and P_{±x} matrices; S_z = (ħ/2)(P₊−P₋); |±y⟩; the Pauli matrices; σ_n = n·σ (1.7).
  - `q3-observables`: measurement statements; selective measurement; ⟨M⟩ = Σ M_αP_α; adjoint rules; why the operator
    is Hermitian.
  - `q3-spectral`: the eigenproblem proofs, the spectral form, f(A), ⟨Aⁿ⟩, dispersion.
  - `q3-uncertainty`: commutator algebra (1.8), compatibility, Schwarz → Robertson (1.9), the |+x⟩ and |+z⟩ examples.
- **Src** notes pp. 11–17 (Eqs. 1.4–1.9); Bergou Eq. (1.2) p. 2, §5.2 pp. 78–81 (postulates 1–6), Eq. (2.20) p. 19;
  Axler 6A (6.14), 7A p. 228, 7B p. 243, 5E p. 175.
- **Ground** Starts from shadows (F2), averages (F5) and eigen (F4).
  - D1 |⟨M|ψ⟩|² = ⟨ψ|P_M|ψ⟩.
  - D2 P̃_{+z} = UP_{+z}U† = ½[[1,1],[1,1]].
  - D3 S_z = (ħ/2)σ_z from its projectors.
  - D4 σ_n = n·σ, as the notes derive it.
  - D5 A Hermitian operator has real λ and orthogonal eigenvectors (notes p. 15).
  - D6 The dispersion (ΔA)² = ⟨A²⟩ − ⟨A⟩².
  - D7 Robertson ΔAΔB ≥ ½|⟨[A,B]⟩|, via Schwarz.
  - D8 |+x⟩: 0 ≥ 0 (not compatible nonetheless). |+z⟩: equality at ħ⁴/16.
  - ⟨+n|−n⟩ = 0 is *stated* from (1.5), not worked, because HW1 P4(b) asks for it.
  - **Formal** Born rule, projection postulate, P² = P, the Pauli algebra σ_iσ_j = δ_ij I + iε_ijkσ_k, adjoint,
    spectral theorem, functional calculus, [·,·] and {·,·}, the Jacobi identity, compatible observables, Robertson.
- **Terms** probability amplitude, Born rule, projector, completeness (born) · Bloch sphere, polar/azimuthal angle
  (bloch) · Pauli matrices, spin operator (spin-operators) · observable, selective measurement, expectation value,
  adjoint, Hermitian (observables) · eigenvalue problem, degenerate, spectral representation, dispersion (spectral) ·
  commutator, anticommutator, compatible, simultaneous eigenvector, Schwarz inequality, uncertainty relation
  (uncertainty).
- **Bridges** l3-projectors, l3-postulates, l3-spin-example, l3-spread, l4-projectors, l4-matrices, l4-eigen,
  l5-averages, l6-bloch, l6-equator, l7-order, l7-compatible, l7-spreads, l7-uncertainty; F4, F5.
- **Stages** bloch (spread and bound readouts exist), lab-r3, operator-space (σ_n), hilbert-plane (project and
  renormalize).
- **Engine** `robertsonBound(A,B,psi)` (n-dim), `moment(A,psi,k)`. Everything else exists: projector, nDotSigma,
  ketFromBloch, spreadsFromBloch, uncertaintyCheck, commutator, anticommutator.
- **Films** "A projector is a shadow, then a stretch" (P|ψ⟩, then renormalize); "Robertson touches its floor at |+z⟩".
- **HW** HW1 P1 (probabilities, averages and ΔS for |+n⟩), P3 (tomography), P4 (σ_n eigenvectors, antipodes,
  anticommutation) and P2. All hints only. The story's general-n claims stop where the notes stop. **Judge flag:** the
  bridge to l7-spreads shows (ΔS_i)² = (ħ²/4)(1−r_i²) in general, which answers P1(b). HW1 was due 2026-09-16, so the
  risk is low; rule on it anyway.

## 3. Part II — Qubits and circuits (Bergou Ch. 1)

*Opener (Blender, 4 K plate): gold traces of a serialized Deutsch circuit, with amplitude columns rising from
`runCircuit` states, column by column. Decor: gold-plated coax lines, clamps and frost in blue light.*

#### Q4 · The qubit, gates and circuits (Bergou §1.1–1.3, pp. 1–5)
**Q** "If a bit is a light switch, what is a qubit, and what does a 'gate' do to it?"
- **Units** `q4-qubit`: α|0⟩ + β|1⟩, |0⟩ ≡ |+z⟩, the Bloch point; spin and photon qubits. · `q4-one-qubit-gates`: X, Y,
  Z, H, S, T, R_x/R_y/R_z as sphere turns; H² = I; HXH = Z. · `q4-registers`: 2ⁿ basis strings, big-endian, bars. ·
  `q4-cnot`: the truth table (1.9), the matrix, unitarity; H then CNOT makes a Bell pair. · `q4-circuits`: wires run
  left→right while the matrices multiply right→left; CZ is symmetric; SWAP = 3 CNOTs; the universality claim. ·
  `q4-measure`: reading a register, or one qubit of two.
- **Src** Bergou §1.1–1.3 pp. 1–5 (Eqs. 1.1–1.9, Figs. 1.1–1.4), P1.1–1.2, P1.4 (⚑), §10.2 Eq. (10.9) p. 182, §12.4.1
  p. 209; notes p. 9 (the z→x U is H); Axler 7D p. 260, 9D p. 370.
- **Ground** Starts from a light switch, a coin, F1 phases, F6 and F7.
  - D1 X = σ_x from its action (1.5–1.7).
  - D2 The H matrix (1.8); H² = I; H = (X+Z)/√2 = i·R_{(x̂+ẑ)/√2}(π).
  - D3 R_z(φ) turns the arrow by φ; Z = iR_z(π).
  - D4 CNOT from its truth table; CNOT² = I.
  - D5 (H⊗I) then CNOT on |00⟩ gives (|00⟩+|11⟩)/√2, amplitude by amplitude.
  - D6 The order of a circuit is the reverse of the matrix product.
  - D7 SWAP from three XORs (⚑ P1.4a).
  - **Formal** C², the Pauli group, S = P(π/2), T = P(π/4), R_n(θ), SU(2) versus U(2), controlled-U =
    |0⟩⟨0|⊗I + |1⟩⟨1|⊗U, universality (Barenco et al.), the Clifford table.
- **Terms** qubit, computational basis (qubit) · gate, Pauli gates, Hadamard, phase gate S, T gate, rotation gate,
  global phase (one-qubit-gates) · register, bit-string label (registers) · control, target, CNOT (cnot) · circuit,
  CZ, SWAP, universal gate set (circuits) · readout (measure).
- **Bridges** l6-bloch, l6-active, l6-generator, l7-full-turn (R_z(2π) = −I), l4-matrices (Pauli), l2-three-bases; F6,
  F7.
- **Stages** bloch (a gate as a turn), circuit (new), amplitudes (new), two-qubit (new), hopf (Formal: a global phase is
  the fiber above one Bloch point).
- **Engine** gates.ts, state.ts, circuit.ts and measure.ts (see (b)).
- **Films** "Hadamard is a half-turn about x+z"; "Building a Bell pair, bar by bar".
- **HW** — (Bergou P1.1, 1.2 and 1.4 are ⚑).

#### Q5 · Deutsch's trick and interference (Bergou §1.4–1.7, pp. 5–10)
**Q** "Can a machine answer a question about a function by looking at it only once?"
- **Units** `q5-problem`: constant versus balanced; classically, two looks. · `q5-oracle`: the f-CNOT; phase kickback
  with a |−⟩ target (1.13). · `q5-deutsch`: the four-state walk (1.10–1.15). · `q5-interferometer`: a Mach–Zehnder with
  phase shifts of 0 or π (1.17–1.18); interference is the resource. · `q5-one-value`: a superposed query still yields
  only one f value (1.16). · `q5-other-models`: adiabatic H(s) = (1−s)H₀ + sH₁ and its gap; measurement-based
  computing with CPHASE, W(θ) and |±θ⟩ (1.20–1.21).
- **Src** Bergou §1.4–1.7 pp. 5–10 (Figs. 1.5–1.7), P1.3 and P1.5 (⚑, the SWAP test), §14.1 p. 254.
- **Ground** Starts from noise-cancelling headphones (arrows that cancel, F1) and F7's Boolean functions.
  - D1 |0⊕f⟩ − |1⊕f⟩ = (−1)^f(|0⟩−|1⟩), in two cases.
  - D2 The states (1.11), (1.12), (1.14) and (1.15), step by step.
  - D3 constant → |0⟩, balanced → |1⟩.
  - D4 The MZ outputs ½(e^{iφ₀}+e^{iφ₁}) and ½(e^{iφ₁}−e^{iφ₀}), *following Fig. 1.7's mirror geometry* ((d)-B1).
  - D5 One shot at (1.16) yields f(0) or f(1), not both.
  - **Formal** oracle and query, phase oracle, phase kickback, two-mode unitaries, the adiabatic theorem and the gap,
    cluster states, byproduct operators. W(θ)σ_x = σ_zW(−θ) holds only up to a phase e^{iθ}.
- **Terms** Deutsch problem, constant, balanced (problem) · oracle, query, phase kickback (oracle) · interference
  (deutsch) · Mach–Zehnder, beam splitter, phase shifter (interferometer) · adiabatic computing, spectral gap, cluster
  state, measurement-based computing (other-models).
- **Bridges** l1-sequential (which-path information versus recombining), F1, F7, Q4.
- **Stages** circuit, amplitudes, optics-bench (new), energy-ladder (the adiabatic gap versus s).
- **Engine** `oracleXor(f,n)`, `oraclePhase(f,n)`; optics `beamSplitter`, `phaseShifter`,
  `machZehnder(φ₀,φ₁,{mirrorSwap})`; `adiabaticGap(H₀,H₁,s)`; `mbqcStep(θ,psi,outcome)`.
- **Films** "Two paths, one photon" (the φ₁ sweep); "Deutsch: the answer lands on qubit 1".
- **HW** — (P1.3 and P1.5 are ⚑).

## 4. Part III — The density matrix (Bergou Ch. 2)

*Opener (Blender, 800 mK still): Bloch-ball mixtures. Weighted dots from two engine ensembles (`rhoFromMixture`) slide to
one shared centroid: two recipes, one point. Decor: fog inside a frosted glass sphere.*

#### Q6 · Ensembles, mixtures and the Bloch ball (Bergou §2.1 (ensembles), 2.2–2.4, pp. 15–24)
**Q** "How do you describe a beam when you don't know which state each atom is in?"
- **Units** `q6-ensemble`: Σ p_j⟨ψ_j|Q|ψ_j⟩ = Tr(Qρ) (2.1–2.2). · `q6-properties`: Tr ρ = 1, Hermitian, positive,
  0 ≤ λ ≤ 1; convexity. · `q6-purity`: Tr ρ² = 1 ⇔ pure (2.14–2.17). · `q6-ball`: ρ = ½(I + r·σ);
  det ρ = (1−|r|²)/4; r_j = Tr(ρσ_j). · `q6-recipes`: one ρ, many ensembles (2.22, 2.24 corrected); pure states are
  extreme points; the unitary-freedom theorem (Formal, 2.28). · `q6-measure-mixed`: postulates 4a–6a: Tr(Pρ), PρP/p,
  Σ PρP.
- **Src** Bergou §2.1 p. 15, §2.2–2.4 pp. 17–24, §5.2 p. 80; Axler 7C p. 251, 8D p. 326, 7B.
- **Ground** Starts from a bag of two colours of marbles (F5) and the 2×2 determinant.
  - D1 ⟨ψ|Q|ψ⟩ = Tr(Q|ψ⟩⟨ψ|), so the average is Tr(Qρ).
  - D2 ⟨ψ|ρ|ψ⟩ = Σ p|⟨ψ|ψ_j⟩|² ≥ 0.
  - D3 The matrix (2.19) and its det.
  - D4 Tr ρ² = (1+|r|²)/2.
  - D5 ½I in the z basis equals ½I in the x basis.
  - D6 ½(|0⟩⟨0| + |+x⟩⟨+x|) has r = (½, 0, ½), so λ = ½ ± √2/4 along the H axis.
  - **Formal** density operator, positive semidefinite, convex set, extreme points, purity, HJW unitary freedom with
    padding, non-selective measurement map.
- **Terms** ensemble, density matrix, trace (ensemble) · positive operator, convex combination (properties) · pure,
  mixed, purity, maximally mixed (purity) · Bloch ball, Bloch vector r (ball) · decomposition, ensemble interpretation
  (recipes) · selective/non-selective measurement (measure-mixed).
- **Bridges** l6-mixture (a superposition or a mixture), l6-bloch, l1-average (the unpolarized oven beam),
  l3-postulates; F4, F5.
- **Stages** bloch-ball (the recipe, measure and comparison fields exist), cityscape (ρ entries, Re/Im).
- **Engine** `isDensity(ρ)` (via eigh), `densityOf(ens)` n-dim, `ensembleUnitary(ens1, ens2)`, `postMeasureRho`. The
  qubit functions exist in density.ts.
- **Films** "Two recipes, one ρ" (ensemble dots with weights).
- **HW** HW1 P3 leans on this (can the data describe a mixture?): hints only.

#### Q7 · Parts of a whole: reduced states, Schmidt, purification, distance (Bergou §2.1 (subsystems), 2.5–2.7, pp. 16–28)
**Q** "If two particles share one state, what does each look like on its own, and how far apart are two states?"
- **Units** `q7-partial-trace`: X_A⊗I_B; ρ_A = Tr_B|Ψ⟩⟨Ψ| (2.3–2.5); (|01⟩+|10⟩)/√2 → ½I (2.8–2.10). · `q7-schmidt`:
  Σ√λ_i|u_i⟩|w_i⟩; the same nonzero spectrum for ρ_A and ρ_B (2.47–2.52). · `q7-purification`: Σ√p_i|ψ_i⟩|u_i⟩;
  purifications differ by U_B (2.53–2.56). · `q7-trace-distance`: ½‖ρ₁−ρ₂‖₁ = max_P Tr P(ρ₁−ρ₂) (2.58–2.60). ·
  `q7-fidelity`: Tr√(√ρ₁ρ₂√ρ₁); pure → |⟨ψ₁|ψ₂⟩|; the Fuchs–van de Graaf bounds (2.62).
- **Src** Bergou pp. 16–17, 24–28, P2.1–2.5 (⚑); Axler 7E p. 270 (SVD ↔ Schmidt), 7F p. 285, 8C p. 319, 9D p. 376.
- **Ground** Starts from the row sums of a 2×2 probability table (marginals, F5) and "rotate, stretch, rotate".
  - D1 Tr_B, entry by entry, for (2.8).
  - D2 ⟨X_A⟩ = Tr(ρ_AX_A).
  - D3 Schmidt from the eigenbasis of ρ_A.
  - D4 ρ_A and ρ_B share their nonzero λ.
  - D5 Tr_B of the purification returns ρ_A.
  - D6 For qubits, the trace distance is |r₁−r₂|/2: a distance inside the ball.
  - D7 For pure states D = √(1−F²) (⚑ P2.5).
  - **Formal** partial trace, reduced operator, Schmidt coefficients and rank, SVD, purification, trace norm,
    operational meaning, root fidelity, Uhlmann (named).
- **Terms** subsystem, partial trace, reduced density matrix (partial-trace) · Schmidt decomposition, coefficient,
  rank (schmidt) · purification (purification) · trace norm, trace distance (trace-distance) · fidelity (fidelity).
- **Bridges** F6, F4 (spectral, SVD), Q6, l6-mixture.
- **Stages** two-qubit (reduced Bloch arrows), bloch-ball (distance), cityscape (the 4×4 ρ_AB).
- **Engine** `partialTrace`, `reducedBloch(psi,q)`, `schmidt`, `purify`, `traceNorm`, `traceDistance`, `fidelity`,
  `fidelitySq`, `fvdg`.
- **Films** "Tracing out: the partner's arrow shrinks to the centre" (cos θ|00⟩ + sin θ|11⟩, θ: 0 → π/4).
- **HW** —.

## 5. Part IV — Entanglement (Bergou Ch. 3)

*Opener (Blender, 100 mK plate): two Bloch balls whose reduced arrows shrink to the centre as cos θ|00⟩ + sin θ|11⟩ runs
from a product state to a Bell state (`reducedBloch`), joined by a correlation ribbon whose width is the engine's
concurrence. Decor: two observatories under an aurora, a fibre glinting between them.*

#### Q8 · Entanglement, no signalling and Bell's inequality (Bergou §3.1–3.3, pp. 31–37)
**Q** "If two particles are linked, can they send a message faster than light, and can hidden instructions explain the
link?"
- **Units** `q8-define`: product versus entangled (pure); separable versus entangled (3.2); maximally entangled; the
  Bell states; LOCC cannot create it. · `q8-no-signal`: Bob's ρ_b = ½I with or without Alice's measurement (3.5–3.7). ·
  `q8-hidden`: instruction sets; the joint distribution P(a₁,a₂,b₁,b₂). · `q8-chsh`: S = ⟨a₁b₁⟩ + ⟨a₁b₂⟩ + ⟨a₂b₁⟩ −
  ⟨a₂b₂⟩ ≤ 2 (3.8–3.10). · `q8-violation`: 2√2 from σ_x,σ_y on (|00⟩ + e^{iπ/4}|11⟩)/√2 (3.11–3.13); product states obey
  (3.14–3.16); Tsirelson (3.17, corrected); the PR box (S = 4, no signalling).
- **Src** Bergou pp. 31–37, P3.1–3.2 (Wigner, Hardy; ⚑), §6.5 p. 110.
- **Ground** Starts from an instruction-card game, averages (F5) and phases (F1).
  - D1 The F6 det test fails for (|00⟩+|11⟩)/√2.
  - D2 Bob's ½I in both cases.
  - D3 X = a₁(b₁+b₂) + a₂(b₁−b₂) = ±2, from the 16-row table.
  - D4 ⟨XX⟩ = cos φ, ⟨XY⟩ = ⟨YX⟩ = sin φ, ⟨YY⟩ = −cos φ → S(π/4) = 2√2.
  - D5 A product state gives S = x₁(y₁+y₂) + x₂(y₁−y₂) ≤ 2.
  - D6 The sum-of-squares Tsirelson proof with **(b₁−b₂)** in the second square.
  - **Formal** convex hull of products, LOCC (preview), the no-signalling theorem, LHV models, correlators, CHSH,
    Tsirelson, PR boxes, the marginal problem, Fine's theorem (named).
- **Terms** entangled, separable, Bell state, maximally entangled (define) · no-signalling (no-signal) · local hidden
  variables, instruction set (hidden) · correlator, CHSH, Bell inequality (chsh) · Tsirelson bound, PR box (violation).
- **Bridges** l1-logic, l7-compatible (local observables on A and B commute), F5 (joint and marginal), F6, Q7.
- **Stages** two-qubit (new; correlation readouts), amplitudes.
- **Engine** `bell(content)`, `correlator(ρ,A,B)`, `chsh(ρ,a₁,a₂,b₁,b₂)`, `correlationTensor(ρ)`,
  `chshMaxHorodecki(ρ)`, `lhvEnumerate()`, `prBox()`.
- **Films** "The CHSH dial: S versus the measurement angle" (engine sweep).
- **HW** — (P3.1–3.2 are ⚑).

#### Q9 · Using entanglement: dense coding, teleportation, swapping (Bergou §3.4, pp. 37–40)
**Q** "Can a shared pair let you send two bits with one particle, or move a quantum state without moving the particle?"
- **Units** `q9-bell-basis`: an ON basis; local Paulis on one half cycle through it; a Bell measurement is CNOT, then
  H, then readout. · `q9-dense-coding`: Table 3.1 (its names follow Bergou's convention). · `q9-teleport-algebra`: the
  regrouping (3.20) and Table 3.2. · `q9-teleport-circuit`: two measurements and classically controlled X, Z; Bob holds
  ½I until the call; Alice's copy is gone. · `q9-swapping`: (3.21); repeaters. · `q9-qudit` (Formal):
  χ_{n,m} = N^{−1/2} Σ e^{2πijn/N}|j⟩|j+m⟩ (P3.3, ⚑: state only).
- **Src** Bergou pp. 37–40, P3.3; §14.3 pp. 260–262; §13.10 pp. 246–247.
- **Ground** Starts from four named vectors (F2) and the XOR table (F7).
  - D1 I, X, Z, XZ on Bob's half turn Φ⁺ into Φ⁺, Ψ⁺, Φ⁻, Ψ⁻.
  - D2 |00⟩, |01⟩, |10⟩, |11⟩ in the Bell basis.
  - D3 Regroup |ψ⟩|Bell⟩ as ½ Σ|Bell_k⟩ ⊗ σ_k|ψ⟩.
  - D4 Before the message, Bob's average is ½I.
  - D5 The swapping identity, by the same regrouping.
  - **Formal** Bell measurement, dense-coding capacity (the Holevo link in Q21), the teleportation identity with Pauli
    corrections, LOCC, repeaters, Weyl–Bell bases.
- **Terms** Bell basis, Bell measurement (bell-basis) · dense coding, ebit (dense-coding) · teleportation, correction
  (teleport-algebra) · classical communication (teleport-circuit) · entanglement swapping, quantum repeater (swapping).
- **Bridges** Q8, Q4, l3-postulates (collapse), F7.
- **Stages** circuit, two-qubit, amplitudes (eight bars).
- **Engine** `bellMeasure(psi,a,b)` (branches), `teleport(psi, resource, outcome)`, `denseCode(bits, resource)`,
  `swapIdentity`, `weylBell(N,n,m)`.
- **Films** "Teleportation: four branches, one state".
- **HW** — (P3.3 is ⚑).

#### Q10 · Detecting and measuring entanglement (Bergou §3.5–3.9, pp. 40–59)
**Q** "Given a messy two-particle state, how can we tell whether it is entangled, and by how much?"
- **Units** `q10-ppt`: ρ^{T_B} (3.22); PPT is exact for 2⊗2 and 2⊗3; the example (3.23–3.26) is entangled for all
  p > 0 while CHSH needs p > 1/√2. · `q10-witness`: (|η⟩⟨η|)^{T_B} (3.27–3.28). · `q10-locc`: the LOCC list; ebits;
  Procrustean distillation p_s = 2 sin²θ (**failure branch corrected**); formation by teleportation. · `q10-entropy`:
  E = S(ρ_A); additive; local unitaries leave it alone; the average does not grow under LOCC (Formal); E_F (3.60). ·
  `q10-concurrence`: C = |⟨ψ|ψ̃⟩| = 2√(λ₁λ₂); E(C) = h((1+√(1−C²))/2); Wootters (3.76); negativity (3.77–3.79). ·
  `q10-multipartite`: full versus biseparable; GHZ versus W; SLOCC; CKW with equality 8/9 for W; bound entanglement via
  a UPB (Formal).
- **Src** Bergou pp. 40–59, P3.4–3.8 (⚑); Axler 7C, 9D. The proofs of entropy properties are cited from Q21 (merge 2).
- **Ground** Starts from F6, F5 (h(p)) and F4.
  - D1 ρ^{T_B} by swapping indices ((3.24) → (3.25)).
  - D2 Block determinants give λ₄ < 0 for p > 0.
  - D3 Tr(ρ(|η⟩⟨η|)^{T_B}) = λ₋.
  - D4 The Procrustean algebra gives the success branch √2 sin θ|0⟩|Φ⁺⟩ and the failure branch |1⟩_{A'}|00⟩_{AB}.
  - D5 C = 2√(λ₁λ₂). C = 2|det A| is ⚑ P3.6.
  - D6 For W: C_AB = C_AC = 2/3 and C_A:BC = 2√2/3, so 4/9 + 4/9 = 8/9.
  - **Formal** PPT (Peres–Horodecki), witnesses, the CV criteria (Duan; Hillery–Zubairy), distillation, dilution, von
    Neumann entropy, E_F, the spin flip ψ̃ = σ_y⊗σ_y ψ*, monotones, the range criterion, UPB, SLOCC classes, CKW.
- **Terms** partial transpose, PPT criterion (ppt) · entanglement witness (witness) · LOCC, distillation, formation
  (locc) · entanglement entropy, von Neumann entropy, entanglement of formation (entropy) · concurrence, negativity,
  monotone (concurrence) · GHZ, W, SLOCC, monogamy, bound entanglement (multipartite).
- **Bridges** Q7, Q8, F5, F4.
- **Stages** cityscape (ρ and ρ^{T_B}; the negative tower flagged), two-qubit.
- **Engine** `ptranspose`, `isPPT`, `negativity`, `witnessFromPPT`, `vonNeumann`, `entanglementEntropy`,
  `concurrencePure`, `concurrence` (Wootters), `eofFromC`, `procrustean(θ)`, `ghz(n)`, `wState(n)`, `ckw(psi3)`,
  `tilesUPB()`.
- **Films** "The negative tower: PPT spots the entanglement CHSH misses" (eigenvalues versus p).
- **HW** — (P3.4–3.8 are ⚑).

## 6. Part V — Dynamics and measurement (Bergou Ch. 4–5)

*Opener (Blender, 100 mK): "the ball shrinks". A Bloch-ball mesh is deformed by `blochAffine` for the depolarizing,
phase-flip and amplitude-damping channels into three engine ellipsoids. Decor: condensation beads forming on a cold
plate in slow motion.*

#### Q11 · Open-system maps: Kraus operators and impossible machines (Bergou Ch. 4, pp. 65–75)
**Q** "What happens to a qubit that leaks information into its surroundings, and which machines are forbidden
outright?"
- **Units** `q11-from-unitary`: couple, evolve, trace out → Σ A_mρA_m†, with Σ A†A = I (4.1–4.5). · `q11-properties`:
  Hermiticity, trace and positivity preserved; *complete* positivity; the transpose is positive but not CP. ·
  `q11-stinespring`: every Kraus set comes from a unitary on a bigger space (4.6–4.8); the freedom D = UA (4.28); at
  most N² operators. · `q11-depolarizing`: the Kraus set; r' = (1 − 4p/3)r (4.29–4.34); bit-flip, phase-flip and
  amplitude damping as previews. · `q11-no-cloning`: linearity forbids U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ (4.35–4.37). · `q11-herbert`:
  a cloner would signal faster than light (§4.3.2).
- **Src** Bergou pp. 65–75, P4.1–4.5 (P4.5, amplitude damping, is ⚑); §9.1 pp. 165–166; §12.2 pp. 202–204; Axler 7C.
- **Ground** Starts from a ball losing sharpness and a photocopier.
  - D1 Σ A_m†A_m = I from unitarity.
  - D2 T(ρ) by tracing the environment.
  - D3 Transpose ⊗ I on a Bell state has eigenvalue −½ (links Q10).
  - D4 σ_jσ_kσ_j = −σ_k for j ≠ k (and +σ_k for j = k) gives the factor 1 − 4p/3.
  - D5 No-cloning in three lines: copy |0⟩, copy |1⟩, add.
  - D6 With a cloner, 2N copies tell Bob Alice's basis.
  - **Formal** CPTP map, superoperator, Kraus representation, Choi matrix (added for the CP check), Stinespring
    dilation, the unitary freedom of Kraus sets, the affine Bloch map r → Mr + c.
- **Terms** quantum channel, Kraus operator, environment (from-unitary) · trace-preserving, completely positive
  (properties) · Stinespring dilation (stinespring) · depolarizing channel, bit/phase flip, amplitude damping
  (depolarizing) · no-cloning theorem (no-cloning) · superluminal signalling (herbert).
- **Bridges** Q7 (partial trace), Q6, Q8 (no signalling), Q10 (partial transpose), l6-mixture.
- **Stages** bloch-ball (+ an `ellipsoid` field, see (c)), circuit (system + environment), cityscape (Choi).
- **Engine** `applyKraus`, `isCPTP`, `choi`, `isCP`, `depolarizing(p)`, `bitFlip`, `phaseFlip`,
  `amplitudeDamping(γ)`, `phaseDamping(λ)`, `blochAffine(Ks)`, `stinespring(Ks)`, `krausFromUnitary(U, env)`,
  `krausEquivalent`.
- **Films** "Depolarizing: the whole sphere contracts by 1 − 4p/3".
- **HW** — (P4.x are ⚑).

#### Q12 · Generalized measurements and telling states apart (Bergou Ch. 5, pp. 77–104)
**Q** "Can a smarter measurement have more outcomes than the space has dimensions, and how well can we tell two
look-alike states apart?"
- **Units** `q12-pointer`: the von Neumann model H = ħgXP; the pointer shift gtλ_j; the SQL resolution (5.1–5.8);
  postulates 1–6 and 4a–6a. · `q12-povm`: drop orthogonality, Π_j ≥ 0, Σ Π_j = I; A_j = U_j√Π_j (5.11); postulates
  1'–6'. · `q12-neumark`: an ancilla measurement realizes a POVM, and conversely (5.15–5.23); the trine with a qutrit
  (5.24–5.31); the direct-sum picture. · `q12-usd`: perfect USD is impossible (5.32–5.33); the inconclusive outcome;
  q₁q₂ ≥ |⟨ψ₁|ψ₂⟩|²; Q_POVM = 2√(η₁η₂) cos Θ versus the von Neumann Q₁ and Q₂ (5.45, Fig. 5.1). · `q12-min-error`:
  Helstrom P_E = ½(1 − ‖η₂ρ₂ − η₁ρ₁‖₁) (5.58); the pure form (5.59); P_E ≤ Q/2. · `q12-sequential`: information
  survives an unknown measurement, ρ_b = ⅓|ψ⟩⟨ψ| + ⅓I (5.63); sequential USD P_S = (1−√s)² (5.76).
- **Src** Bergou pp. 77–104, P5.1–5.6 (⚑); notes pp. 13–14 (the Hermitian-only statement this generalizes); Axler 7F
  p. 285 (polar), 8C, 7C.
- **Ground** Starts from a sorting machine with a "not sure" bin, guessing with priors (F5), and shadows.
  - D1 e^{−igtXP} shifts the pointer by gtλ_j.
  - D2 Σ A†A = I from unitarity.
  - D3 The trine: Σ ⅔|ψ_j⟩⟨ψ_j| = I; p_correct = ⅔, p_error = ⅙.
  - D4 Perfect USD forces ⟨ψ₁|ψ₂⟩ = 0.
  - D5 AM–GM: η₁q₁ + η₂cos²Θ/q₁ ≥ 2√(η₁η₂) cos Θ. No calculus needed.
  - D6 Two equiprobable pure states: P_E = ½(1 − √(1 − |⟨ψ₁|ψ₂⟩|²)).
  - **Formal** SQL, POVM and effects, detection (Kraus) operators, the polar decomposition, Neumark/Naimark dilation,
    tensor versus direct-sum extension, the IDP limit, Helstrom, sequential discrimination.
- **Terms** pointer, standard quantum limit (pointer) · POVM, POVM element, detection operator (povm) · Neumark's
  theorem, ancilla, trine (neumark) · unambiguous discrimination, inconclusive result, prior (usd) · minimum-error
  discrimination, Helstrom bound (min-error) · sequential measurement (sequential).
- **Bridges** l3-postulates, l4-projectors, Q3 (generalized here), Q11 (Kraus ↔ detection operators), Q7 (trace norm),
  F4 (√, positive).
- **Stages** bloch (states and POVM directions on a great circle), vector-3d (the Neumark lift), hilbert-plane (USD
  |ψ^⊥⟩), amplitudes.
- **Engine** `isPOVM`, `povmProbs`, `detectionOps`, `postPOVM`, `neumarkUnitary`, `trine()`, `tetrad()`,
  `usd(ψ₁,ψ₂,η₁)` (regime and elements), `helstrom(ρ₁,ρ₂,η₁)`, `pointerShift`, `sqlResolution`, `randomBasisChannel`,
  `sequentialUsd(s)`.
- **Films** "Three detectors, and one of them never lies" (the regimes versus η₁); "Lifting the trine into three
  dimensions".
- **HW** —.

## 7. Part VI — Cryptography (Bergou Ch. 6)

*Opener (Blender, 100 mK): a stream of photons, each an arrow in one of two bases, from a seeded engine BB84 run.
Orientation only, no counts on screen. Decor: a vault door, a fibre coil in the dark.*

#### Q13 · Secret keys from quantum rules (Bergou Ch. 6, pp. 105–114)
**Q** "How can two people share a secret key and know for certain that nobody listened?"
- **Units** `q13-otp`: the Caesar shift, the key, the one-time pad (XOR), the key-distribution problem. · `q13-b92`:
  |0⟩ and |+x⟩; Bob's USD succeeds with 1 − 1/√2; Eve's USD attack gives ≈ 35.4 % errors, her min-error attack ≈ 14.6 %.
  · `q13-bb84`: two bases, sifting, intercept-resend QBER 25 %; an entangling Eve who causes no errors learns nothing
  (6.1–6.5). · `q13-e91`: the singlet, anticorrelated same-basis results, a Bell test as the guard, device independence
  (6.6–6.7). · `q13-sharing`: splitting by XOR; cos θ|00⟩ ± sin θ|11⟩ with Charlie's USD success 1 − |cos 2θ|;
  cheating and the σ_z fix.
- **Src** Bergou pp. 105–114, P6.1 (⚑); §5.5 pp. 89–98; §4.3 p. 72.
- **Ground** Starts from Caesar codes, XOR (F7) and percentages.
  - D1 m ⊕ k ⊕ k = m.
  - D2 B92: 1 − |⟨0|+x⟩| = 1 − 1/√2 ≈ 29.3 %.
  - D3 BB84: ½ (wrong basis) × ½ (flip) = 25 %.
  - D4 USD-Eve: ½ × 1/√2 ≈ 35.4 %.
  - D5 Min-error Eve: ½(1 − 1/√2) ≈ 14.6 %.
  - D6 No errors ⇒ φ₀₁ = φ₁₀ = 0 and φ₀₀ = φ₁₁, so Eve's ancilla is untouched.
  - **Formal** QKD, sifting, raw key, QBER, intercept-resend, information–disturbance, CHSH security,
    device-independent QKD (6.7), privacy amplification (named), secret sharing.
- **Terms** cipher, key, one-time pad (otp) · QKD, raw key (b92) · basis sifting, QBER, intercept-resend (bb84) ·
  device-independent (e91) · secret sharing (sharing).
- **Bridges** F7, F5, Q11 (no-cloning), Q12 (USD, min-error), Q8 (CHSH), l1-sequential and l2-three-bases (a wrong
  basis randomizes; mutually unbiased bases).
- **Stages** bloch (the four BB84 states), amplitudes (QBER bars), optics-bench (the photon line).
- **Engine** crypto.ts: `otp`, `bb84(n,rng,{eve})`, `b92(n,rng,{eve:'usd'|'minerr'})`, `e91(n,rng)` (with a CHSH
  estimate), `qberInterceptResend()`, `secretShare(bit,θ,rng)`.
- **Films** "Eve raises the error rate to a quarter" (a seeded engine run, with its tolerance shown).
- **HW** —.

## 8. Part VII — Algorithms (Bergou Ch. 7)

*Opener (Blender, 20 mK): the Grover rotation. The state arrow steps by 2α in the plane while N amplitude columns
rearrange (`groverState`). Decor: the gold glow of the mixing chamber; one needle of frost in a haystack of ice.*

#### Q14 · One query, many answers: Deutsch–Jozsa and Bernstein–Vazirani (Bergou §7.1–7.2, pp. 117–120)
**Q** "How can one question to a black box reveal a pattern hidden across all of its inputs?"
- **Units** `q14-hadamard-n`: H^{⊗n}|x⟩ = 2^{−n/2} Σ(−1)^{x·z}|z⟩ (7.1–7.2). · `q14-dj`: the promise; Fig. 7.1;
  ⟨0|ψ_out⟩ = 2^{−n} Σ(−1)^{f(x)} (7.7). · `q14-classical-cost`: deterministic 2^{n−1}+1; randomized with a small error.
  · `q14-bv`: f = a·x + b → (−1)^b|a⟩ (7.8–7.12).
- **Src** Bergou pp. 117–120, P7.3 (⚑).
- **Ground** Starts from F7 (x·z, parity), F6 and Q5 (kickback).
  - D1 H|x_j⟩ = (|0⟩ + (−1)^{x_j}|1⟩)/√2, and the product expands into (7.1).
  - D2 n-qubit kickback (7.4–7.5).
  - D3 The all-zeros amplitude is ±1 or 0.
  - D4 Σ_x(−1)^{x·z} = 2ⁿ δ_{z0}.
  - D5 BV returns |a⟩.
  - **Formal** Walsh–Hadamard transform, promise problems, exact versus bounded-error separations, query model.
- **Terms** Walsh–Hadamard transform (hadamard-n) · promise problem (dj) · deterministic versus randomized query cost
  (classical-cost) · hidden string (bv).
- **Bridges** Q5, F7, F6, Q4.
- **Stages** circuit, amplitudes (signed bars).
- **Engine** `walshHadamard(n)`, `djRun(f)`, `bvRun(a,b)`, `randomBalanced(n,rng)`.
- **Films** "Balanced functions cancel the all-zeros bar".
- **HW** —.

#### Q15 · Searching an unsorted list: Grover (Bergou §7.3, pp. 120–125)
**Q** "How can you find the one marked item among N without checking them one by one?"
- **Units** `q15-oracle`: U_f = I − 2|x₀⟩⟨x₀|, U₀, H^{⊗n}. · `q15-plane`: everything happens in span{|w₀⟩, |x₀⟩}, a
  real plane. · `q15-two-reflections`: two mirrors make a rotation by twice the angle between them (Theorem 1). ·
  `q15-iterate`: Q^k|w₀⟩ = sin((2k+1)α)|x₀⟩ + cos((2k+1)α)|x₀^⊥⟩ with sin α = 1/√N; k ≈ (π/4)√N; overshoot. ·
  `q15-optimal` (Formal): the BBBV bound (7.19–7.29).
- **Src** Bergou pp. 120–125 (Figs. 7.2–7.5); §7.5 p. 129 (Q's eigenvalues); Axler 6B, 7D.
- **Ground** Starts from mirror geometry and sin x ≈ x for small x.
  - D1 U_f|w₀⟩ = |w₀⟩ − (2/√N)|x₀⟩, so the plane is invariant (**corrected (7.15)**).
  - D2 A picture proof of reflection ∘ reflection = rotation.
  - D3 sin α = 1/√N and cos α = √(1 − 1/N) (**corrected**).
  - D4 The k-th state.
  - D5 k* = round(π/(4α) − ½).
  - D6 P_fail ≤ sin²α = 1/N (**O(1/N), not O(1/N²)**).
  - **Formal** Q = −U_H U₀ U_H U_f, the diffusion 2|w⟩⟨w| − I, amplitude amplification, M marked items, the hybrid
    argument.
- **Terms** marking oracle (oracle) · invariant plane (plane) · reflection, rotation (two-reflections) · Grover
  iteration, inversion about the mean, overshoot (iterate) · optimality (optimal).
- **Bridges** F2, F3 (reflection matrices), Q14, l6-active; l7-two-angles *as a contrast* (this is a real slice, not the
  Bloch sphere).
- **Stages** grover-plane (new), amplitudes (inversion about the mean), circuit.
- **Engine** `groverOp(n,marked)`, `groverAngle(N,M)`, `groverOptimalK`, `groverState(N,M,k)`, `groverSuccess`,
  `reflect2D`, `bbbvBound(N)`.
- **Films** "Inversion about the mean, one iteration at a time".
- **HW** —.

#### Q16 · Hidden periods: Simon, the QFT and phase estimation (Bergou §7.4–7.5, pp. 126–130)
**Q** "How can a quantum computer find the rhythm hidden inside a function, or inside a gate?"
- **Units** `q16-simon`: f(x) = f(x⊕ξ); the post-measurement pair; y·ξ = 0; **n − 1** independent equations, solved
  over F₂ (7.30–7.33). · `q16-qft`: the definition (7.34) as the DFT; the product form; a circuit of H and controlled
  R_k. · `q16-kickback`: controlled-U^{2^j} on an eigenstate (7.36–7.37). · `q16-phase-est`: exact when φ = a/2^m,
  otherwise ≥ 4/π² (7.38–7.43). · `q16-counting`: Q's eigenphases ±2α (7.44) separate "empty" from "one marked" and
  count solutions. · `q16-shor-preview` (Formal only, outside the book): order finding → factoring.
- **Src** Bergou pp. 126–130 (Fig. 7.6); F8.
- **Ground** Starts from F8 (roots of unity, the geometric series, binary fractions) and F7 (GF(2)).
  - D1 (−1)^{x₀·y}(1 + (−1)^{ξ·y}) kills every y with y·ξ = 1.
  - D2 QFT = DFT.
  - D3 The product form |a⟩ → ⊗_j (|0⟩ + e^{2πi·0.a_j…a_m}|1⟩)/√2.
  - D4 Kickback: (|0⟩ + e^{2πi2^jφ}|1⟩)/√2.
  - D5 The exact case φ = a/2^m.
  - D6 The 4/π² bound.
  - **Formal** Simon's problem as a hidden subgroup, O(m²) QFT circuits, eigenphase estimation, success versus
    precision, quantum counting.
- **Terms** Simon's problem, period (simon) · QFT, controlled phase R_k (qft) · phase kickback, eigenphase (kickback) ·
  phase estimation (phase-est) · quantum counting (counting).
- **Bridges** F8, F7, Q14, Q15, F4 (|λ| = 1 for unitaries), l6-generator.
- **Stages** circuit, amplitudes (peaks), complex-plane (phasor sums), grover-plane (Q's eigenvectors).
- **Engine** `simonRun(ξ,n,rng)`, `gf2Solve`, `qftMatrix(m)`, `qftCircuit(m)`, `phaseEstimation(φ,m)` (the
  distribution), `pePeak(δ,m)`, `groverEigenphases`, `quantumCounting(N,M,m)`.
- **Films** "A peak sharpens as the precision grows" (m = 2…8); "The QFT circuit writes the digits one by one".
- **HW** —.

#### Q17 · Walks, simulation and hybrid algorithms (Bergou §7.6–7.8, pp. 130–142)
**Q** "Can a quantum particle wandering on a network find things faster, and can a quantum computer imitate nature?"
- **Units** `q17-random-walk`: walks on a line and on graphs; connectivity in 2N³ steps. · `q17-scattering`: edge
  states |v₁,v₂⟩; the vertex unitary with −r reflected and t transmitted, r = (n−2)/n, t = 2/n (7.46–7.48). ·
  `q17-star-search`: a 4-dimensional invariant subspace (7.50–7.53); λ ≈ ±(1 ± i/√N); the marked spoke is reached at
  n ≈ (π/2)√N; the extra-edge search succeeds with 2/3. · `q17-simulation`: the 2ᴺ-amplitude wall; Trotter (7.81–7.82);
  error ~ tΔt; the Heisenberg chain. · `q17-qaoa`: H_C for MaxCut (7.83); e^{−iγH_C} and e^{−iβH_B}; F(γ,β) tuned
  classically; NISQ.
- **Src** Bergou pp. 130–142 (Figs. 7.7–7.8), P7.1–7.2 (⚑); §1.6 p. 9.
- **Ground** Starts from coin-flip walks (F5), dots and lines, and e^{−iHt} (F4).
  - D1 Unitarity forces r = (n−2)/n and t = 2/n.
  - D2 M² on {ψ₁, ψ₃} is a rotation, so λ⁴ − 2rλ² + 1 = 0.
  - D3 δλ = ±i√(t/2) = ±i/√N, so the peak comes at (π/2)√N steps.
  - D4 e^{A}e^{B} = e^{A+B+[A,B]/2+…}.
  - D5 Each edge term ½(1 − Z_jZ_k) is 0 or 1.
  - **Formal** scattering versus coined walks, the Grover coin, perturbative spectra, element distinctness (named),
    Lie–Trotter, QAOA ansatz, variational loop.
- **Terms** random walk, graph, vertex, edge (random-walk) · quantum walk, scattering walk (scattering) · star graph,
  marked vertex (star-search) · quantum simulation, Trotter formula, Heisenberg chain (simulation) · QAOA, MaxCut, NISQ
  (qaoa).
- **Bridges** Q15, l6-generator, F4, F5.
- **Stages** graph (new: a star graph with edge amplitudes), amplitudes, circuit (Trotter layers).
- **Engine** `starWalk(N,steps,variant)` (the reduced 4×4 or 5×5, cross-checked against the full edge space for
  N ≤ 32), `scatteringVertex(n)`, `trotterError`, `heisenbergChain`, `qaoaMaxCut(graph,γ,β)`, `maxCut`.
- **Films** "A walker finds the marked spoke".
- **HW** —.

## 9. Part VIII — Machines (Bergou Ch. 8)

*Opener (Blender, 20 mK): three copies, three shortened arrows. The engine's reduced Bloch vectors of the cloner outputs
are shrunk by ⅔, ⅔ and flipped by ⅓. Decor: frost-covered clockwork.*

#### Q18 · Quantum machines: cloners, U-NOT, programmable processors (Bergou Ch. 8, pp. 145–158)
**Q** "If perfect copying is forbidden, how good can an imperfect quantum copier be, and can one quantum machine be
programmed to do anything?"
- **Units** `q18-cloner`: four CNOTs (Fig. 8.1); the program |Φ₀₀⟩ = (|00⟩+|11⟩)/√2 keeps the information on output 1, and
  |Φ₀ₓ⟩ = |0⟩|+x⟩ moves it to output 2 (8.1–8.2); a
  superposition splits it (8.3–8.5); fidelity 5/6, the same for every input. · `q18-unot`: output 3 plus −iσ_y is the
  best U-NOT, at ⅔ (8.6–8.8); measure-and-prepare does the same (8.9–8.12) but clones only to ⅔. · `q18-no-go`: distinct
  unitaries need orthogonal programs (8.13–8.19). · `q18-probabilistic`: a CNOT processor gives e^{iασ_z} with p = ½;
  repeat-until-success reaches ¾ and beyond; a phase flip in any basis with p = ⅓ (8.20–8.30). · `q18-discriminator`:
  programmable USD with antisymmetric projectors, P = ⅓(1 − |⟨ψ₁|ψ₂⟩|²) against 1 − |⟨ψ₁|ψ₂⟩| (8.31–8.47).
- **Src** Bergou pp. 145–158, P8.1–8.3 (⚑); §4.3, §5.5.1.
- **Ground** Starts from a photocopier losing quality, Q11, Q12 and the shrinking ball.
  - D1 Track the basis inputs through the four CNOTs.
  - D2 (5/6)|ψ⟩⟨ψ| + (1/6)|ψ^⊥⟩⟨ψ^⊥| is an arrow shrunk to ⅔.
  - D3 The U-NOT arrow is flipped and shrunk to ⅓.
  - D4 ⟨Π₂|Π₁⟩ = ⟨ψ|U₂⁻¹U₁|ψ⟩⟨Π'₂|Π'₁⟩ forces the programs to be orthogonal or the unitaries equal up to phase.
  - D5 A |0⟩ outcome on the program gives e^{iασ_z}|ψ⟩.
  - D6 The 2×2 block det 1 − c₁ − c₂ + ¾c₁c₂ = 0 (**corrected constant**) gives c = ⅔ and P = ⅓(1−s²).
  - **Formal** universal (Bužek–Hillery) cloner, shrinking factor, anti-unitarity, measure-and-prepare optimality,
    G on H_d ⊗ H_p, the Nielsen–Chuang no-go, repeat-until-success, Toffoli, symmetric/antisymmetric subspaces.
- **Terms** quantum cloner, universal, copy fidelity (cloner) · U-NOT, anti-unitary (unot) · programmable processor,
  program register (no-go) · probabilistic gate, repeat-until-success (probabilistic) · programmable discriminator
  (discriminator).
- **Bridges** Q11, Q12, Q9 (Bell states as programs), Q6 (the shrinking ball), Q7 (the fidelity convention clash,
  (d)-C8).
- **Stages** bloch-ball (three arrows), circuit, amplitudes.
- **Engine** `cloner(c₀,c₁,psi)` (three reduced ρ), `unotMeasurePrepare`, `cnotProcessor(α,psi)`,
  `phaseFlipProgram(φ)`, `programmableUsd(s)`.
- **Films** "Cloning splits the information" (the c₀/c₁ sweep of the two shrink factors).
- **HW** —.

## 10. Part IX — Error correction (Bergou Ch. 9–10)

*Opener (Blender, 10 mK mixing chamber): a 3×3 tile of the nine Shor-code qubits. Syndrome lamps light from the engine's
syndrome table as single errors walk across the tile. The plan's "surface-code lattice" is not in Bergou, see (d)-A3.
Decor: ice crystals growing into a lattice.*

#### Q19 · Protecting qubits from noise (Bergou §9.1, §9.3, pp. 161–170, 175–177)
**Q** "How can we fix an error in a qubit if looking at the qubit destroys it?"
- **Units** `q19-classical`: majority vote fails with probability p²(3 − 2p), which is less than p iff p < ½. ·
  `q19-bit-flip`: a|000⟩ + b|111⟩; measure Z₁Z₂ and Z₂Z₃ without learning a or b (Table 9.1); small errors are
  digitized (9.1–9.2). · `q19-phase-flip`: the same code in the |±⟩ basis, with X₁X₂ and X₂X₃. · `q19-shor`: nine qubits
  (9.3) and their two kinds of syndrome (**first-cluster case corrected**). · `q19-digitize`: any error is a combination
  of I, X, Y, Z (9.4–9.7); correcting a basis of errors corrects every combination; weight. · `q19-kl`: the
  Knill–Laflamme condition ⟨j|M_μ'†M_μ|k⟩ = C_μ'μ δ_jk (9.16) and the recovery (9.23–9.33); degenerate codes. ·
  `q19-dfs`: under collective dephasing a|01⟩ + b|10⟩ picks up only a global phase (9.55–9.59).
- **Src** Bergou pp. 161–170, 175–177, P9.1–9.3 (⚑); §12.5.1 p. 215 (echo as a temporal DFS).
- **Ground** Starts from binomial counting (F5), parity (F7) and Q4's CNOT.
  - D1 3p²(1−p) + p³ = p²(3 − 2p), and the break-even at p = ½.
  - D2 The ± signs of Table 9.1.
  - D3 Measuring Z₁Z₂ on (9.2) either restores the state or picks the flipped branch.
  - D4 HZH = X turns phase flips into bit flips.
  - D5 The Pauli expansion (9.5–9.6).
  - D6 R⊗R(a|01⟩ + b|10⟩) = e^{iφ}(…).
  - **Formal** [[n,k,d]], code space, error set, syndrome, recovery superoperator, Knill–Laflamme, degenerate codes, the
    quantum Hamming bound (P9.2, ⚑), collective noise.
- **Terms** repetition code, majority vote (classical) · syndrome, parity check, bit-flip code (bit-flip) · phase-flip
  code (phase-flip) · Shor code (shor) · digitization of errors, weight (digitize) · Knill–Laflamme condition,
  degenerate code (kl) · decoherence-free subspace (dfs).
- **Bridges** Q11 (errors as channels), Q4, F7, F5, l7-compatible (commuting checks leave each other's outcomes intact).
- **Stages** code-lattice (new), circuit (encoder and ancilla checks), amplitudes, bloch-ball (dephasing versus DFS).
- **Engine** `repetitionFail(p)`, `bitFlipCode`, `shorCodewords`, `syndrome(psi,checks)`, `recover`,
  `klCheck(codewords, errors)`, `paulisOfWeight(n,w)`, `quantumHammingBound`, `collectiveDephasing`.
- **Films** "Finding the flipped qubit without looking at the data".
- **HW** —.

#### Q20 · Stabilizers, CSS codes and Gottesman–Knill (Bergou §9.2 + Ch. 10, pp. 170–175, 179–187)
**Q** "Can we name a quantum state by the checks it passes instead of by its amplitudes, and when is a quantum computer
secretly easy to simulate?"
- **Units** `q20-linear-codes`: G, H with HG = 0, the syndrome He, distance, the dual code; the [6,2] and Hamming [7,4]
  codes (9.35–9.40, 9.53–9.54). · `q20-css`: cosets |x + C₂⟩ (9.41); H^{⊗n} moves the code to C₂^⊥ (9.43); bit flips
  are fixed through H₁ and phase flips through G₂ᵀ (9.44–9.52); Steane [[7,1,3]]. · `q20-stabilizer`: the Pauli group;
  a state named by its generators; −I ∉ S and S abelian; the check matrix and Theorem 1; dim V_S = 2^k (Theorem 2). ·
  `q20-clifford`: USU†; the H, S (Bergou's "F"), Pauli and CNOT tables (10.9–10.11); measurement updates
  (10.12–10.13). · `q20-gottesman-knill`: tableau simulation in O(mn²); T and Toffoli break it (P10.2, ⚑).
- **Src** Bergou pp. 170–175, 179–187, P10.1–10.3 (⚑); F7.
- **Ground** Starts from F7 (GF(2)) and Q19.
  - D1 HG = 0 for [6,2].
  - D2 Syndromes are unique when d ≥ 2t+1.
  - D3 Σ_{x∈C}(−1)^{x·y} = 2^k·[y ∈ C^⊥].
  - D4 H^{⊗n}|x + C₂⟩ = a sum over C₂^⊥.
  - D5 Z₁Z₂ and Z₂Z₃ fix exactly span{|000⟩, |111⟩}.
  - D6 HXH = Z, and CNOT(X⊗I)CNOT = X⊗X.
  - D7 Adding rows ⇔ multiplying Paulis; they commute ⇔ the symplectic product is 0.
  - **Formal** [n,k,d] linear codes, generator and parity-check matrices, (weakly) self-dual, cosets, CSS, the Pauli
    group G_n, stabilizer groups and generators, the check matrix, the symplectic form Λ, the normalizer (Clifford
    group), Gottesman–Knill, Aaronson–Gottesman tableaux.
- **Terms** linear code, generator matrix, parity-check matrix, distance, dual code (linear-codes) · coset, CSS code,
  Steane code (css) · Pauli group, stabilizer, generator, check matrix (stabilizer) · Clifford gate, normalizer
  (clifford) · Gottesman–Knill theorem (gottesman-knill).
- **Bridges** F7, Q19, Q4, l7-compatible, F4.
- **Stages** code-lattice (Steane tiles and a check-matrix grid), circuit, bloch (the 24 single-qubit Cliffords as turns
  of the octahedron).
- **Engine** pauli/stabilizer: `pauliMul` (with phase), `commutes`, `checkMatrix`, `symplectic`, `stabilizerOf(psi)`
  (small n), `stabilizerState(gens)`, `tableau` (h, s, cnot, measure), `cliffordConj`, `linearCode(G)`, `hamming(r)`,
  `cssCode(C₁,C₂)`, `steane()`.
- **Films** "Gates push Pauli labels around" (the conjugation table live).
- **HW** — (P10.x are ⚑; avoid the GHZ and H-CNOT-H examples in the story).

## 11. Part X — Information (Bergou Ch. 11, + §3.7.2–3.7.3)

*Opener (Blender, 10 mK): "the entropy ridge". A ribbon surface of h(p), with the Holevo χ curve versus overlap, from
engine samples. Decor: TV static resolving into a clean signal.*

#### Q21 · Measuring information: distances, entropies and Holevo (Bergou pp. 189–200, 48–51, 26–28)
**Q** "How much ordinary information can one quantum particle really carry?"
- **Units** `q21-classical-compare`: L1 distance; Σ√(pq) = cos θ; relative entropy (11.1–11.4). ·
  `q21-quantum-compare`: D, F, S(ρ‖σ), Klein (3.42–3.46, 11.5–11.9). · `q21-entropy-props`: 0 ≤ S ≤ log d; the block
  formula (3.48); subadditivity (3.50); concavity (3.54); strong subadditivity (11.18, stated). · `q21-two-variables`:
  joint, conditional, I(X:Y), channel capacity (11.10–11.16). · `q21-quantum-mutual`: S(A|B) (it can be negative) and
  S(A:B); discarding a system or a local operation cannot raise it. · `q21-holevo`: I(X:Y) ≤ χ (11.20–11.29); the
  bound on the USD failure (11.30–11.40).
- **Src** as in the heading; P11.x (⚑).
- **Ground** Starts from F5 entropy and angles between √p vectors.
  - D1 Σ√(pq) is the cosine between unit vectors.
  - D2 ln x ≤ x − 1 ⇒ H(p‖q) ≥ 0 (then the quantum Klein inequality).
  - D3 S(I/d) = log d.
  - D4 H(X,Y) = H(X) + H(Y|X).
  - D5 I = H(X) + H(Y) − H(X,Y).
  - D6 For two equiprobable pure states χ = h((1+|⟨ψ₁|ψ₂⟩|)/2) < 1 bit.
  - **Formal** Kolmogorov distance, Bhattacharyya coefficient, KL and quantum relative entropy, strong subadditivity
    (Lieb–Ruskai), quantum conditional entropy, data processing, Holevo χ, accessible information, capacity (HSW named).
- **Terms** classical fidelity, relative entropy (classical-compare) · Klein inequality (quantum-compare) ·
  subadditivity, concavity, strong subadditivity (entropy-props) · conditional entropy, mutual information, channel
  capacity (two-variables) · quantum mutual information (quantum-mutual) · Holevo χ, accessible information (holevo).
- **Bridges** F5, Q7, Q10, Q12, Q9 (dense coding against the Holevo bound).
- **Stages** amplitudes (distributions with entropy readouts), bloch-ball (an ensemble's points and χ).
- **Engine** info.ts: `relEntropyQ`, `condEntropyQ`, `mutualInfoQ`, `holevoChi(ens)`, `accessibleInfo(ens,povm)`,
  `usdFailureBound(ens)`, `logPSD` (F4).
- **Films** "The Holevo gap for two states" (χ against the best POVM's I(X:Y)).
- **HW** —.

## 12. Part XI — Hardware (Bergou Ch. 12–15)

*Opener (Blender): the cryostat descent from 300 K to 10 mK, as geometry only. It ends on a Rabi trajectory computed by
`integrateBloch`. Decor: the dilution-refrigerator "chandelier" in gold, a slow downward camera move; violet atoms in
tweezers; an ion string; waveguides glowing on a photonic chip; a qubit chip on the cold finger. Every shot is
atmosphere only, with no readouts.*

#### Q22 · Controlling a real qubit: Lindblad, Bloch equations, Rabi and Ramsey (Bergou Ch. 12, pp. 201–218)
**Q** "How do physicists actually flip a qubit with a pulse of light or microwaves, and why does it slowly forget?"
- **Units** `q22-divincenzo`: the seven criteria (§12.1). · `q22-lindblad`: from a short-time Kraus map; L = √γ|g⟩⟨e|;
  T₁ and T₂ ≤ 2T₁ (12.1–12.2). · `q22-bloch-eq`: drive, RWA, inversion w and coherence, the steady state (12.3–12.5). ·
  `q22-rabi`: (12.6–12.8); π and 2π pulses; R_x and R_y from the pulse phase (**sign corrected**); composite pulses. ·
  `q22-precession`: H = (ħ/2)B·σ ⇒ dM/dt = B×M (12.9–12.10); the qubit as a spinning top. · `q22-ramsey`: π/2–wait–π/2;
  P(1) = cos²(φ/2); Gaussian noise gives e^{−σ²/2} and T₂* (12.11–12.12); echo and dynamical decoupling.
- **Src** Bergou pp. 201–218, P12.1–12.6 (⚑; P12.2 builds the T₁/T_φ Kraus set); Ch. 4; §9.3.
- **Ground** Starts from a swing pushed in rhythm, gyroscopes, half-life decay and the right-hand rule.
  - D1 A₀ = I + L₀δt and A_j = L_j√δt give the Lindblad form, with L₀' fixed by the trace.
  - D2 ρ_ee ∝ e^{−γt} and coherence ∝ e^{−γt/2}, so T₂ = 2T₁.
  - D3 On resonance cos(Ωt/2) and sin(Ωt/2): a π pulse takes t = π/Ω.
  - D4 A 2π pulse gives −I (l7-full-turn).
  - D5 R_y(π/2)(1, e^{iφ})/√2 → P(1) = cos²(φ/2).
  - D6 ⟨e^{iχ}⟩ = e^{−σ²/2}.
  - D7 An echo subtracts the two halves' phases.
  - **Formal** Lindblad equation, jump operators, T₁/T₂/T₂*, optical Bloch equations, RWA, detuning, generalized Rabi
    frequency Ω' = √(|Ω|²+Δ²), rotating frame, BB1 (named), noise spectrum and Wiener–Khinchin (named), dynamical
    decoupling.
- **Terms** DiVincenzo criteria (divincenzo) · master equation, Lindblad operator, T₁, T₂ (lindblad) · Bloch
  equations, RWA, detuning (bloch-eq) · Rabi frequency, Rabi oscillation, π pulse, composite pulse (rabi) · precession
  (precession) · Ramsey interferometry, T₂*, dephasing, spin echo, dynamical decoupling (ramsey).
- **Bridges** l1-quantized (a moment in a field), l6-generator, l6-active, l7-full-turn, Q11, Q6, Q19.
- **Stages** bloch-ball (a trajectory spiralling inward), bloch, energy-ladder (two levels, drive and detuning).
- **Engine** bloch-eq: `rabiU(Ω,Δ,t)`, `rabiPe`, `precess(M,B,t)`, `blochRhs`, `integrateBloch(M₀,{Ω,Δ,T₁,T₂},t)` (RK4),
  `blochSteady`, `lindbladRhs(ρ,H,Ls)`, `ramsey(Δ,t,{T2star})`, `gaussianDephasing(σ)`, `echo`,
  `compositePulseError(ε)`.
- **Films** "Rabi flopping, and the decay, inside the ball"; "Ramsey fringes blur under noise".
- **HW** —.

#### Q23 · Qubits made of atoms: neutral atoms and trapped ions (Bergou Ch. 13, pp. 221–249)
**Q** "How do you hold a single atom still, and make two atoms talk to each other?"
- **Units** `q23-cooling`: recoil bookkeeping (13.1–13.4); molasses; k_BT_D = ħγ/2; the MOT; tweezers and
  rearrangement. · `q23-readout`: fluorescence counts, a Poisson model, a threshold n_c (13.5–13.6). · `q23-atom-gates`:
  microwave and Raman gates Ω₁Ω₂*/(2Δ), P_scat ~ γ/Δ; the Rydberg blockade π–2π–π → diag(1,−1,−1,−1). ·
  `q23-ion-trap`: Earnshaw; the Paul trap as a Mathieu equation with q̃ < 0.908; micromotion; the two-ion spacing. ·
  `q23-phonons`: carrier and red/blue sidebands; the Lamb–Dicke η; sideband cooling. · `q23-ion-gates`: the Cirac–Zoller
  Bell sequence; Mølmer–Sørensen with an n-independent Ω̃ = −(ηΩ)²/(ω_z − δ); GHZ of 14 ions.
- **Src** Bergou pp. 221–249, P13.1–13.4 (⚑).
- **Ground** Starts from recoil (balls thrown at a cart), a Doppler siren, springs, Coulomb repulsion and Poisson counts
  (F5).
  - D1 Momentum and energy bookkeeping.
  - D2 Minimizing ¼mω²Z² + q²/(4πε₀Z) gives Z³ = q²/(2πε₀mω²).
  - D3 Be⁺ numbers: q̃ ≈ 0.54 and ω_z/2π ≈ 1.9 MHz.
  - D4 The blockade phases for |00⟩, |01⟩, |10⟩ and |11⟩.
  - D5 A sideband changes n by ±1, and |g,0⟩ has no red sideband.
  - D6 The Cirac–Zoller states, step by step.
  - **Formal** hyperfine qubits, optical pumping, dipole traps, incomplete-Γ error, AC Stark shift, C₆ ~ n¹¹, Paul and
    Penning traps, normal modes, the Lamb–Dicke regime, the MS second-order amplitude, √N collective enhancement.
- **Terms** laser cooling, Doppler limit, optical molasses, MOT, optical tweezer (cooling) · fluorescence readout
  (readout) · Raman transition, Rydberg blockade (atom-gates) · Paul trap, Earnshaw's theorem, micromotion (ion-trap) ·
  phonon, sideband, Lamb–Dicke parameter (phonons) · Cirac–Zoller gate, Mølmer–Sørensen gate (ion-gates).
- **Bridges** Q22, Q4, Q9 (swapping for remote links), F5, l1-quantized.
- **Stages** energy-ladder (|g,n⟩/|e,n⟩ sidebands; the blockade shift), amplitudes (count histograms), bloch.
- **Engine** atoms.ts: `dopplerT(γ)`, `readoutError(n_c,r_b,r_s,t)`, `ramanRabi`, `rydbergGate()`, `paulTrap(q,V₀,m,z_c,ω_rf)`,
  `twoIonSpacing`, `lambDicke`, `sidebandRabi(η,n,Ω)`, `msRate`, and `ionCircuit` (a spin ⊗ truncated oscillator).
- **Films** "Blockade: the second atom stays down"; "Sideband ladder".
- **HW** —.

#### Q24 · Qubits made of light: photons and linear optics (Bergou Ch. 14 + §1.5, pp. 253–267, 7–8)
**Q** "Photons are great messengers, but how can particles of light that never collide perform a two-qubit gate?"
- **Units** `q24-encodings`: polarization |H⟩,|V⟩; dual rail; waveplates (the Bloch angle is **2θ**, (d)-C12). ·
  `q24-beamsplitter`: the Stokes and unitarity relations (14.1), phase conventions, one photon in. · `q24-hom`: two
  photons in give |20⟩ + e^{iφ}|02⟩ because t't + r'r = 0. · `q24-ns-gate`: the nonlinear sign by heralding (≈ 22.7 %),
  CZ from two of them (≈ 5 %), the 2/27 bound. · `q24-klm`: gate teleportation with the resource |r⟩; linear-optics Bell
  measurement ≤ ½; KLM's n/(n+1); resource count. · `q24-nonlinear`: a cross-Kerr phase n₁n₂φ; the Jaynes–Cummings
  dispersive χ = Ω₀²/(4Δ); cat-state encoding.
- **Src** Bergou pp. 253–267, 7–8; notes p. 9; P14.1 (⚑).
- **Ground** Starts from polarizing sunglasses, half-silvered mirrors and F1 wave addition.
  - D1 SS† = I gives the Stokes relations.
  - D2 One photon becomes t'|10⟩ + r'|01⟩.
  - D3 Expanding the two-photon product gives √2t'r|20⟩ + √2r't|02⟩ + (t't + r'r)|11⟩, and the last term vanishes at
    50:50.
  - D4 The CZ sign bookkeeping on |10⟩.
  - D5 (n/(n+1))² ≥ 0.99 needs n ≈ 199.
  - D6 The dispersive expansion of E±(n) gives χ.
  - **Formal** mode operators, Fock states, the Heisenberg-picture beam splitter, HOM, heralding, KLM, gate
    teleportation, cross-Kerr, JC dressed states, cat codes.
- **Terms** polarization qubit, dual rail (encodings) · beam splitter (beamsplitter) · Hong–Ou–Mandel effect (hom) ·
  heralded gate, nonlinear sign gate (ns-gate) · KLM, gate teleportation (klm) · cross-Kerr, Jaynes–Cummings,
  dispersive shift, cat state (nonlinear).
- **Bridges** Q5 (MZ), Q9 (Bell measurement), Q2 (photon frames), l7-two-angles, F1, F6.
- **Stages** optics-bench (new), bloch (Poincaré), amplitudes (Fock bars), energy-ladder (the JC ladder).
- **Engine** optics.ts: `bsMatrix(t,r)`, `fockTransform(U,n₀,n₁)` (via permanents, ≤ 3 photons), `hom`, `waveplate`,
  `nsGateSuccess`, `klmSuccess(n)`, `crossKerr`, `jcDressed`, `dispersiveChi`.
- **Films** "Two photons, one exit".
- **HW** —.

#### Q25 · Qubits in chips: transmons and quantum dots (Bergou Ch. 15, pp. 269–298)
**Q** "How can a chip with trillions of electrons behave like one quantum two-level system?"
- **Units** `q25-lc`: flux as position and charge as momentum (Table 15.1); ω = 1/√(LC) ≈ 2π·5.3 GHz; the rungs are
  evenly spaced; why millikelvin. · `q25-superconductivity`: Cooper pairs (the toy calculation), Meissner, London,
  Φ₀ = h/2e. · `q25-josephson`: I = I₀ sin θ, dθ/dt = 2eV/ħ, L_J, the SQUID. · `q25-transmon`:
  H = E_C(n − n_g)² − E_J cos θ; the two-level cut (**sign note**); the Mathieu levels; E_J/E_C and anharmonicity. ·
  `q25-cqed`: Rabi and JC coupling, cooperativity, the dispersive g²/Δ readout, iSWAP. · `q25-dots`: spin qubits,
  Zeeman splitting, spin-to-charge readout, exchange J s₁·s₂ → SWAP and √SWAP → CZ (15.13–15.14), silicon.
- **Src** Bergou pp. 269–298, P15.1–15.3 (⚑); §14.4.
- **Ground** Starts from springs and swings, ½CV² and ½LI², and the kelvin scale.
  - D1 d²I/dt² = −I/(LC); 0.3 pF and 3 nH give 5.3 GHz; λ ≈ 5.7 cm, much larger than the chip.
  - D2 hf/k_B ≈ 0.25 K, so the circuit needs T ≪ 0.25 K.
  - D3 A single-valued phase forces Φ = pΦ₀.
  - D4 The Josephson relations from the two-sided tunnelling model; L_J = Φ₀/(2πI₀ cos θ).
  - D5 Reduce to two charge states at n_g ≈ ½.
  - D6 σ₁·σ₂ = 2 SWAP − I ⇒ e^{i(π/4)σ₁·σ₂} = e^{iπ/4} SWAP.
  - **Formal** circuit quantization [Φ,Q] = iħ, BCS (toy), London, flux quantization, SQUID, Cooper-pair box, charge
    dispersion, the quantum Rabi model, JC, cooperativity, iSWAP, 0–π qubits, Loss–DiVincenzo, singlet–triplet,
    EDSR, isotopic purification, Kane donors.
- **Terms** LC oscillator, lumped element (lc) · Cooper pair, Meissner effect, flux quantum (superconductivity) ·
  Josephson junction, Josephson inductance, SQUID (josephson) · charge qubit, transmon, charging energy, Josephson
  energy, anharmonicity (transmon) · circuit QED, resonator, dispersive readout, cooperativity (cqed) · quantum dot,
  exchange interaction, √SWAP, spin-to-charge conversion (dots).
- **Bridges** Q22, Q24 (JC), Q4 (SWAP, CZ), l1-quantized (Zeeman), F4 (the eigenvalues of the charge matrix).
- **Stages** energy-ladder (LC versus transmon rungs over a cos well), bloch, circuit.
- **Engine** solid.ts: `lcOmega`, `thermalN(ω,T)`, `phi0()`, `josephsonL`, `squidIc(Φ)`,
  `transmonLevels(E_C,E_J,n_g,n_max)` (eigh in the charge basis), `anharmonicity`, `chargeDispersion`,
  `cooperativity`, `exchangeU(Jt)`, `sqrtSwapCZ()` (checks 15.14).
- **Films** "From evenly spaced rungs to a usable qubit" (as E_J/E_C grows).
- **HW** —.

---

## (a) Concept dependency graph (edges "A → B" read "B needs A")

- **F spine.**
  - F1 → F2 (complex components) → F3 → F4.
  - F3 → F6.
  - F1 → F8, and F7 → F8 (mod 2, then mod N).
  - F5 stands alone and feeds Q1, Q3, Q6, Q10, Q13, Q19, Q21 and Q23.
- **448 ⇄ F (the same concept, bridged both ways).**
  - l2-complex ⇄ F1.
  - l2-vector-space and l2-inner-product ⇄ F2.
  - l3-operators, l5-coordinates and l5-operators ⇄ F3.
  - l3-eigen, l4-eigen, l5-inverse, l6-generator and l7-compatible ⇄ F4.
  - l1-average, l3-spread and l7-spreads ⇄ F5.
- **Review.**
  - F2, F5 and l1-quantized/l1-sequential → Q1.
  - Q1, F2, F3 and l5-coordinates → Q2.
  - Q2, F4, F5, l3-postulates, l6-bloch and l7-uncertainty → Q3.
- **Circuits.**
  - Q3, F6, F7, l6-active and l7-full-turn → Q4.
  - Q4, F1 and F7 → Q5.
- **States.**
  - Q3, F5 and l6-mixture → Q6.
  - Q6, F6 and F4 → Q7.
- **Entanglement.**
  - Q7 and Q4 → Q8 → Q9.
  - Q7, Q8 and F5 → Q10.
- **Dynamics.**
  - Q6 and Q7 → Q11.
  - Q11 and Q3 → Q12.
  - Q8, Q11, Q12 and F7 → Q13.
- **Algorithms.**
  - Q5 and F7 → Q14.
  - Q14 and F2 → Q15.
  - Q14, Q15, F7 and F8 → Q16.
  - Q15, F4 and l6-generator → Q17.
- **Machines.** Q9, Q11 and Q12 → Q18.
- **Codes.**
  - Q4, Q11, F5 and F7 → Q19 → Q20.
  - F7 → Q20.
- **Information.** F5, Q7, Q10 and Q12 → Q21. Q9 → Q21 (dense coding against Holevo).
- **Hardware.**
  - Q6, Q11, Q19 and l6-generator → Q22.
  - Q22 → Q23, Q24 and Q25.
  - Q9 → Q23 and Q24 (swapping, Bell measurement).
  - Q5 → Q24 (Mach–Zehnder).
  - Q24 → Q25 (Jaynes–Cummings).
  - F4 → Q25 (the Mathieu spectrum).
- **Longest chain:** F1 → F2 → F3 → F4 → Q3 → Q6 → Q7 → Q11 → Q12 → Q18. Parts II and VII can be read after Q4 alone.

## (b) New engine functions, by module (all in `app/src/physics/qc/`), with the numpy twin that checks each one

The twins go in `pipeline/make_qc_fixtures.py` (seed 709) and use numpy/scipy only. Property tests run in vitest.

**Performance rule.** Gates act on state vectors in place, in O(2ⁿ) strided loops. Dense unitaries are built only for
n ≤ 6. Density-matrix features stop at 5 qubits (32×32), and eigh at 64×64. This keeps the UI's 10-qubit cap cheap.

| Module | New functions (chapters) | numpy twin |
|---|---|---|
| **linalg-n** (extends linalg.ts) | traceN, detN, invN, rankN, **eigh** (Jacobi), funcHermitian, sqrtPSD, logPSD, expmHermitian, svd, polar, simultaneousEigenbasis, projectOnto, angleBetween, components, isIndependent, weightedInner, changeU (F2–F4, Q2 and everything after) | np.linalg.eigh/svd/det/inv/matrix_rank; scipy.linalg.expm/sqrtm/logm/polar. Eigenvectors are compared as projectors (their phase is free). changeU(new) = basisMatrix(new)† |
| **state** | ket(bits), kron, kronM, kronAll, indexOfBits, bitsOfIndex, coefMatrix, isProduct, embed, bell(content), ghz, wState, randomState(n,rng) (F6, Q4, Q8, Q10) | np.kron; the Schmidt rank from np.linalg.svd of the coefficient matrix; Haar states in property tests only (the RNG streams differ) |
| **gates** | X, Y, Z, H, S, T, P(φ), Rx, Ry (Rz and rotation exist), controlled(U,ctrls,t,n), cnot, cz, swap, toffoli, cswap, oracleXor, oraclePhase, walshHadamard, applyGate, cliffordConj (Q4, Q5, Q14, Q20) | explicit matrices, np.kron with identities plus permutation matrices; applyGate against a full-matrix product for random targets, n ≤ 6 |
| **circuit** | Circuit (the one versioned JSON used by content, stage and films), runCircuit (a state per column), circuitUnitary, branches (mid-circuit measurement and classical control), toFilmManifest (Q4–Q5, Q9, Q14–Q17) | column-by-column matrix products; fixtures for Deutsch (all 4 f), Bell, the 4 teleport branches, DJ n = 3, QFT m = 3 |
| **measure** | probs, marginal, measureQubit, measureInBasis, postMeasure, sampleCounts (multinomial), bellMeasure, expectationN (complex), varianceN, robertsonBound, moment (Q3, Q4, Q9) | abs(ψ)²; reshape/sum marginals; P ψ / norm; binomial and multinomial moments for sampleCounts |
| **density** | densityOf, isDensity, purityN, partialTrace, reducedBloch, ptranspose, schmidt, purify, traceNorm, traceDistance, fidelity (root), fidelitySq, fvdg, postMeasureRho, ensembleUnitary (Q6, Q7) | np.einsum partial trace; reshape/transpose for T_B; svd for Schmidt; eigvalsh for norms; sqrtm for F |
| **entangle** | vonNeumann, entanglementEntropy, concurrencePure, concurrence (Wootters), eofFromC, negativity, isPPT, witnessFromPPT, correlationTensor, correlator, chsh, chshMaxHorodecki, lhvEnumerate, prBox, procrustean, ckw, tilesUPB, teleport, denseCode, swapIdentity, weylBell (Q8–Q10) | Wootters via np.linalg.eigvals(ρρ̃), then sqrt and sort; eigvalsh of ρ^{T_B}; the Horodecki bound from eigvalsh(TᵀT) cross-checked by a dense angle scan; explicit 3- and 4-qubit vectors for the teleport and swap identities |
| **channels** | applyKraus, isCPTP, choi, isCP, depolarizing, bitFlip, phaseFlip, amplitudeDamping, phaseDamping, blochAffine, stinespring, krausFromUnitary, krausEquivalent, collectiveDephasing, randomBasisChannel, cloner, unotMeasurePrepare (Q11, Q18, Q19) | Σ KρK†; Choi via vec and kron with eigvalsh ≥ −1e−12; blochAffine read off by applying the map to I and σᵢ; Stinespring V†V = I; the cloner's reduced states from an explicit 3-qubit circuit |
| **povm** | isPOVM, povmProbs, detectionOps, postPOVM, neumarkUnitary, trine, tetrad, usd, helstrom, sequentialUsd, pointerShift, sqlResolution, programmableUsd (Q12, Q13, Q18) | closed forms plus a brute-force (c₁,c₂) scan with Π₀ ⪰ 0 (it reproduces Fig. 5.1's boundaries 0.0909 and 0.909); eigvalsh(η₂ρ₂−η₁ρ₁); Neumark U unitary with ⟨m\|U\|ψ,0⟩ = A_m\|ψ⟩ |
| **stabilizer** | pauliMul, commutes, checkMatrix, symplectic, stabilizerOf, stabilizerState, tableau (h, s, cnot, measure), linearCode, hamming, cssCode, steane, repetitionFail, bitFlipCode, shorCodewords, syndrome, recover, klCheck, paulisOfWeight, quantumHammingBound (Q19, Q20) | random Clifford circuits (seed 709, n ≤ 5, depth 40): every tableau generator g satisfies g\|ψ⟩ = \|ψ⟩ for the matrix-built ψ; KL through codeword inner products; Steane codewords enumerated |
| **qft** | rootsOfUnity, qftMatrix, dft, qftCircuit, geometricSum, binaryFraction, peBound, phaseEstimation, pePeak, simonRun, quantumCounting (F8, Q16) | np.fft.ifft(np.eye(N), axis=0, norm="ortho") is the QFT (+ sign); circuitUnitary(qftCircuit) against it; PE distributions by direct sums |
| **grover** | groverOp, groverAngle, groverOptimalK, groverState, groverSuccess, reflect2D, bbbvBound, groverEigenphases, starWalk, scatteringVertex (Q15–Q17) | matrix_power of the full 2ⁿ operator (n ≤ 8); the star walk as a full edge-space unitary for N = 8, 16, 32 against the reduced 4×4 and 5×5 |
| **bloch-eq** | rabiU, rabiPe, precess, blochRhs, integrateBloch (RK4), blochSteady, lindbladRhs, ramsey, gaussianDephasing, echo, compositePulseError (Q22) | scipy.linalg.expm(−iHt); solve_ivp (rtol 1e−10) against RK4 at a matched dt; (12.5) steady state; the Lindblad RHS by explicit matrices |
| **other: bits** | xor, dotMod2, parity, hammingWeight, hammingDistance, truthTable, isConstant, isBalanced, reversibleOracle, permutationMatrix, gf2RowReduce, gf2Rank, gf2Nullspace, gf2Solve, hammingParity, randomBalanced (F7, Q14, Q16, Q20) | integer arrays mod 2 with our own row reduction; exhaustive checks for n ≤ 4 |
| **other: info/prob** | mean, variance, shannon, binaryEntropy, marginals, mutualInfo, relEntropyC, fidelityC, l1Distance, multinomialSample, relEntropyQ, condEntropyQ, mutualInfoQ, holevoChi, accessibleInfo, usdFailureBound (F5, Q21) | np.log2 with 0·log 0 = 0; logm for the quantum versions |
| **other: complex** | eulerLimit, phasorSum (F1) | direct |
| **other: optics** | bsMatrix, phaseShifter, machZehnder (with the mirror swap), fockTransform (permanents), hom, waveplate, polarizationKet, circularKets, rotateFrame, nsGateSuccess, klmSuccess, crossKerr, jcDressed, dispersiveChi (Q2, Q5, Q24) | permanents by itertools.permutations; eigvalsh of the JC 2×2 blocks |
| **other: crypto** | otp, bb84, b92, e91, qberInterceptResend, secretShare (Q13) | closed-form expectations (25 %, 35.36 %, 14.64 %, 1 − 1/√2); the TS simulators are tested statistically (\|z\| ≤ 4 over 10⁴ seeded trials) |
| **other: algorithms/machines** | djRun, bvRun, trotterError, heisenbergChain, qaoaMaxCut, maxCut, adiabaticGap, mbqcStep, cnotProcessor, phaseFlipProgram (Q5, Q14, Q17, Q18) | state-vector matrices and expm |
| **other: atoms/solid** | dopplerT, readoutError, ramanRabi, rydbergGate, paulTrap, twoIonSpacing, lambDicke, sidebandRabi, msRate, ionCircuit; lcOmega, thermalN, phi0, josephsonL, squidIc, transmonLevels, anharmonicity, chargeDispersion, cooperativity, exchangeU, sqrtSwapCZ (Q23, Q25) | scipy.special.gammaincc (readout); scipy.constants (CODATA, also a TS `constants.ts`); eigvalsh of the charge-basis matrix cross-checked with scipy.special.mathieu_a. **Unsure:** the map to Mathieu parameters under Bergou's E_C = (2e)²/2C_Σ must be derived before the twin is written |

## (c) New stage kinds, ranked by the number of chapters that use them

| Rank | Kind | Status | Chapters |
|---|---|---|---|
| 1 | **amplitudes** (SVG bars with phase colour, 1–10 qubits; a probability mode for F5 and QBER) | new | F1 F2 F5 F6 F7 F8 Q4 Q5 Q8 Q9 Q12 Q13 Q14 Q15 Q16 Q17 Q18 Q19 Q21 Q23 Q24 (21) |
| 2 | **circuit** (SVG; state flowing along the wires; classical-control lines) | new | F7 Q4 Q5 Q9 Q11 Q14 Q15 Q16 Q17 Q18 Q19 Q20 Q25 (13) |
| 3 | bloch | exists | F4 Q2 Q3 Q4 Q12 Q13 Q20 Q22 Q23 Q24 Q25 (11) |
| 4 | bloch-ball (+ new fields `ellipsoid` for a channel's image and `trajectory` for decay spirals) | exists | Q6 Q7 Q11 Q18 Q19 Q21 Q22 (7) |
| 4 | hilbert-plane | exists | F2 F3 F4 Q1 Q2 Q3 Q12 (7) |
| 6 | **two-qubit** (two balls plus correlations, GL) | new | F6 Q4 Q7 Q8 Q9 Q10 (6) |
| 7 | **cityscape** (ρ towers, Re/Im; negative towers flagged) | new | F6 Q6 Q7 Q10 Q11 (5) |
| 7 | **energy-ladder** (levels, drives, sidebands, `upper: 0 \| 1` flag) | new | Q5 Q22 Q23 Q24 Q25 (5) |
| 9 | operator-space | exists | F3 F4 Q3 (3) |
| 9 | lab-r3 | exists | F5 Q1 Q3 (3) |
| 9 | **optics-bench** (beam splitters, mirrors with the port swap, phase plates) | new | Q5 Q13 Q24 (3) |
| 9 | **complex-plane** (SVG unit circle, polygons, phasor chains) | *proposed here* | F1 F8 Q16 (3) |
| 9 | **vector-3d** (real 3-vectors: Gram–Schmidt, the Neumark lift) | *proposed; better as a 3D mode of hilbert-plane* | F2 Q2 Q12 (3) |
| 14 | **grover-plane** | new; *could be a hilbert-plane preset* (a real plane, custom axis labels, mirror lines) | Q15 Q16 (2) |
| 14 | **code-lattice** (qubit tiles, syndrome lamps, check-matrix grid; the Part IX opener's data) | *proposed here* | Q19 Q20 (2) |
| 16 | **graph** (star graph, edge-state glow) | *proposed here* | Q17 (1) |
| 16 | hopf | exists | Q4, Formal track (1) |

**Build order:**
1. amplitudes and circuit together (Q4 needs both; both are SVG, so they double as print figures).
2. two-qubit.
3. cityscape.
4. energy-ladder, then optics-bench.
5. complex-plane.
6. grover-plane or its preset.
7. code-lattice.
8. graph (last: only Q17 uses it).

## (d) Errata, ambiguities, notation clashes, proposed conventions

"img" = checked on the rendered page. "txt" = seen in the text layer only (verify on the page before shipping). "math"
= the derivation itself shows the problem.

**A. Course-level notes**
- **A1. HW1 was due 2026-09-16, so it is already past.** The hints-only rule still holds. The one live conflict is the
  Q3 bridge to l7-spreads.
- **A2. The notes follow the plan's Q1–Q3 split exactly:** L1 is pp. 2–5, L2 pp. 6–10, L3 pp. 11–17. L3 already
  reaches spectral theory and the uncertainty relation, which is why Q3 has 6 units.
- **A3. No surface code in Bergou.** It appears only as a threshold remark on p. 287. The Part IX opener therefore uses
  the Shor/Steane tiles. A surface-code lattice may appear only as captionless decor.
- **A4. Shor is out of scope in Bergou** (preface p. ix), hence the flag on `q16-shor-preview`.
- **A5. `sources/bergou-full/pages/` is empty.** The checks here rendered pages from the PDF into the scratchpad. The
  ingest should render Bergou pages as it does for the notes (git-ignored), so later P reviews can do the visual pass.

**N. Lecture notes (709)**
- **N1** p. 2 (img). μ_z = gμ_B L_z/ħ with L_z = ±ħ/2 is spin S_z, not orbital L_z. For an electron, μ is antiparallel
  to S (μ_z = −gμ_BS_z/ħ, g ≈ 2) unless g is taken as negative. Also, μ_B = eħ/2m_ec is in Gaussian units while ħ is
  quoted in J·s. **App:** S_z, SI units, and a note on the sign of the moment.
- **N2** p. 4 (txt). The inner product is called "bilinear". Over C it is sesquilinear, as the notes' own last axiom
  shows.
- **N3** p. 6 (img). The basis theorem needs n LI vectors in Vⁿ. "V^N", "Σc_i|α_i⟩" and "{α_i} not LI" should read Vⁿ,
  |e_i⟩ and {e_i}.
- **N4** p. 9, Eq. (1.3) (img). The |−x⟩ coefficient is (c₁ − c₂)/√2, not (c₂ − c₁)/√2. The matrix just below it is
  correct.
- **N5** p. 9 (img). [Û†]_ij = U*_ji = ⟨α_j|α'_i⟩ should be ⟨α_i|α'_j⟩. The boxed proof already uses the right form.
- **N6** p. 12 (img). "Right/left states" there means |±x⟩ (the → and ← of p. 7). It collides with the circular |R⟩ and
  |L⟩ of p. 9.
- **N7** p. 14. "A measurement can only be represented by a Hermitian operator" is true of projective observables. Q12
  generalizes it: POVM detection operators need not be Hermitian. This is a scope note, not an error.
- **N8** Two minor points.
  - p. 5, Fig. 3: ⟨α|β⟩/|α| = |β| cos θ holds for real vectors only.
  - p. 15: the second proof uses a₂ ∈ R, taken silently from the first.

**B. Bergou 2e** (printed pages)
- **B1** p. 8, Eq. (1.18) (img + math). The equation is correct *only with Fig. 1.7's mirrors*: the arms enter BS2
  through swapped ports, and a†, b† in (1.18) label outputs 1 and 2. Applying (1.17) naively to the same a/b modes swaps
  the ports. `machZehnder` models the swap and has a test for it.
- **B2** p. 17, (2.9): Tr → Tr_B (txt).
- **B3** p. 20, (2.24) (img): the bracket is misplaced. It should read (½+√2/4)|u₊⟩⟨u₊| + (½−√2/4)|u₋⟩⟨u₋|.
- **B4** p. 26 (img): ‖A‖₁ is Σ√λ_j, where λ_j are the eigenvalues of A†A (the singular values), not Σ|λ_j|.
- **B5** p. 26, (2.56): U_B|u_k⟩ → U_B|v_k⟩ (txt).
- **B6** pp. 32, 38–39, 46, 152 (img): the Bell names are swapped relative to the standard (see C3). P6.1 on p. 113
  writes the singlet as φ₋.
- **B7** p. 36, (3.17) (img): the second square must contain (b₁ − b₂)/√2. As printed, the identity is false.
- **B8** p. 41: "all Bell inequalities hold for p ≤ 1/√2" is established only for CHSH (the Horodecki bound
  2√(M₁+M₂) ≤ 2 ⇔ p ≤ 1/√2, math). Say "CHSH".
- **B9** p. 46 (img): the Procrustean failure branch is |1⟩_{A'}|00⟩_{AB}, not |10⟩_{AB}. Bergou also calls
  (|00⟩+|11⟩)/√2 "Ψ₊" there (B6).
- **B10** p. 50, (3.52): the LHS should be Tr[ρ_AB log(ρ_A⊗ρ_B)] (txt). p. 52 cites "subadditivity" where concavity
  (3.54) is what is used.
- **B11** p. 52, (3.59)–(3.60): p_k is missing, and (3.60) should read inf Σ p_k E(|ψ^{(k)}⟩) (txt).
- **B12** p. 59, (3.86): the second |v₀⟩ → |v₁⟩ (txt).
- **B13** Two typos (txt).
  - p. 69, (4.21): the LHS should be T(|j_A⟩⟨k_A|).
  - p. 72: β|0⟩ → β|1⟩.
- **B14** p. 77: the §5.1 outline promises B92 at the end of Ch. 5, but B92 is §6.3 (txt).
- **B15** p. 93, (5.46): Π₂ ∝ |ψ₁^⊥⟩⟨ψ₁^⊥|, not ⟨ψ₂^⊥| (txt).
- **B16** p. 107: 1/(2√2) = 35.36 %, printed as "35.3 %".
- **B17** p. 111, (6.6): the x = y case must say P = ½ δ_ab (txt; **unsure**, possibly lost in the text layer).
- **B18** p. 121, (7.15) (img): the factor is (2c₁/√N + c₂), and the last ket is |w₀⟩.
- **B19** pp. 121–122 (img).
  - |x₀^⊥⟩ and |w₀^⊥⟩ need minus signs (Gram–Schmidt).
  - "−U_f = −(I − 2|w₀⟩⟨w₀|)" should be −U_{w₀}.
- **B20** p. 123.
  - cos α = (1 − 1/√N)^{1/2} should be (1 − 1/N)^{1/2} (img).
  - The total failure probability is O(1/N), not O(1/N²); O(1/N²) is the probability of each wrong item (math).
- **B21** p. 126 (math): n independent equations y·ξ = 0 would force ξ = 0. Simon needs n − 1.
- **B22** p. 127 (txt).
  - The second term of a is 2^{m−2}a₂.
  - The QFT prefactor must be 2^{−m/2} (verify on the page).
  - a·y there is an integer product, not §7.1's bitwise dot (C11).
- **B23** pp. 129–130 (math): Q's eigenphases are ±2α, so a₊/2^m estimates α/π, not α/2π. **Unsure:** the tail bound
  1/(2k−1) on p. 129; Nielsen–Chuang §5.2.1 gives 1/(2(k−1)). Check Cleve et al. before quoting.
- **B24** pp. 147–148 (math).
  - −iσ_y sends |0⟩ → +|1⟩ and |1⟩ → −|0⟩, the opposite signs from the book. This is harmless for ρ.
  - The measure-and-prepare cloner's "⅔" is the *single-copy* fidelity. The two-copy fidelity to |ψ⟩|ψ⟩ is ½.
- **B25** pp. 156–157, (8.42)–(8.43): the constant term is 1 − c₁ − c₂ + ¾c₁c₂ (math). (8.44) and c = ⅔ then follow.
- **B26** Two slips in the Ch. 9 syndromes.
  - p. 163: "obtained 1 for both" should be −1 for both (txt).
  - p. 164 (img): the phase syndrome of the first cluster is (−1, +1); the book prints (+1, −1) twice.
- **B27** p. 173: d₁ ≥ 2t_f + 1, and "weight at most t" (txt).
- **B28** p. 176, (9.56): the last projector is |0⟩⟨1| (txt).
- **B29** Two points in Ch. 10.
  - p. 182, (10.9): the third right-hand entry is FZF† = Z (txt).
  - p. 184, (10.14): the example generator contains −iY₂ and squares to −I, so it cannot belong to a stabilizer (math).
- **B30** Two typos in Ch. 11 (txt).
  - p. 190: the classical relative entropy compares *distributions*, not quantum states.
  - p. 195: S(ρ_AB) = S(ρ_B) should be S(ρ_BC) = S(ρ_B).
- **B31** p. 209 (img): with Ω real and positive, the Δ = 0 U(t) is R_x(−θ). The book prints −i and calls it R_x(θ).
  The R_y case is consistent.
- **B32** p. 214: σ² = ⟨χ²⟩ (txt).
- **B33** p. 257 (math): in cos θ|0⟩ + sin θ e^{iφ}|1⟩ the Bloch polar angle is 2θ.
- **B34** pp. 281, 285. **Unsure.**
  - (15.9)'s σ_z sign depends on the basis order. With n = 1 listed first, the coefficient is −E_C(n_g − ½).
  - "E_J/E_C ~ 10–50" is probably quoted in Koch's convention E_C = e²/2C_Σ. Bergou's own E_C is 4× larger.

**C. Notation clashes and the proposed conventions** (each gets a one-line Rosetta note in the chapter that meets it)
- **C1** |0⟩ ≡ |+z⟩ ≡ north. The notes, Bergou and 448 all agree. Lock it, with a test tying it to `spin.ts` (the plan).
- **C2 Qubit order.**
  - Bergou numbers qubits from 1, top-down (Chs. 1 and 9).
  - Bergou writes x = x_{n−1}…x₀ with x₀ rightmost (§7.1), and a₁ as the *most* significant digit (§7.5).
  - Qiskit is little-endian.
  - **Proposal:** engine index q0 = the leftmost factor = the top wire = the MSB. The UI shows "qubit 1" for q0
    wherever the source numbers from 1. Bit strings are always printed left to right.
- **C3 Bell names.** Bergou has Φ± = |01⟩±|10⟩ and Ψ± = |00⟩±|11⟩, the reverse of Nielsen–Chuang and Preskill.
  **Proposal:** use the standard names, tagged "(Bergou: Ψ₊)" on first use in each chapter. The engine names Bell
  states by content (`bell('00+11')`), so following the 709 notes, once they choose, is a course-pack edit. **Judge
  decision.**
- **C4 |±⟩.** Use |±x⟩ in prose (as in 448). |+⟩ and |−⟩ are allowed on circuit diagrams. Never call them
  "right/left": R and L are circular polarization.
- **C5 Bloch-vector letters.** r is the state (|r| ≤ 1) and n̂ an axis. Bergou's n (Ch. 2) and M (Ch. 12) map to r.
- **C6 Phase gate.** Bergou's "F" is S = P(π/2). T = P(π/4). P(φ) is 448's `phaseShift`.
- **C7 Change of basis.** U_notes = B_448†, so d = Uc is 448's c_new = B†c_old. The notes' z→x U is H.
- **C8 Fidelity.** `fidelity` is the root fidelity (Bergou 2.61). Bergou Ch. 8's "fidelity" ⟨ψ|ρ|ψ⟩ is its square.
  Q18 labels 5/6 and 2/3 as "overlap fidelity (= F²)".
- **C9 Axler.** Axler is linear in the *first* slot and writes T* for the adjoint. Every Axler citation carries
  "⟨u,v⟩_Axler = ⟨v|u⟩, T* = T†".
- **C10 Overloaded symbols in Bergou.**
  - H is the Hadamard, a Hamiltonian, the parity-check matrix and the Shannon entropy.
  - S is entropy, the stabilizer group, the CHSH value, SWAP (P4.4) and spin.
  - C is concurrence, capacitance, code, capacity, cooperativity and the KL matrix.
  - F is fidelity and the phase gate.
  - **Proposal:** the gate H in roman; Ĥ for a Hamiltonian; 𝖧 for the parity check; H(·) and S(·) always with an
    argument; 𝒮 for the stabilizer; S_CHSH; the SWAP gate spelled "SWAP"; 𝒞 for concurrence; C_coop for cooperativity.
- **C11** x·z means only the bitwise dot product mod 2. An integer product is written ay.
- **C12 Angles double on the sphere.** A polarization frame turned by ϕ is 2ϕ on the Poincaré sphere (notes p. 9;
  Bergou p. 257), the same doubling as 448's photon cos²θ against spin cos²(θ/2). State it every time.
- **C13 Which level is |0⟩ is a per-platform choice.**
  - Bergou §12.5 and §13.8 use H = +(ħω_q/2)σ_z, which makes |0⟩ the *upper* level.
  - §15.11 has |0⟩ = |↑⟩, also upper for electrons.
  - The transmon (§15.8) and P4.5 make |0⟩ the ground state.
  - §12.3 uses |g⟩ and |e⟩.
  - **Proposal:** keep the geometric lock. The energy-ladder stage carries an `upper` flag and prints |g⟩/|e⟩ (or
    ↑/↓) next to |0⟩/|1⟩. bloch-eq works with dM/dt = B×M, which does not depend on the convention.
- **C14 Rotations.** R_n(θ) = e^{−iθ n·σ/2} everywhere, consistent between 448 and Bergou §12.4.1 (but see B31).
- **C15 Units.** ħ = 1 in the engine. Physical constants in SI with CODATA values: `constants.ts` against
  scipy.constants. The notes' Gaussian μ_B (N1) and Bergou's cgs Φ₀ (p. 277) get a Rosetta line.
- **C16 Entropy base.** Entropies are in bits. Bergou (3.42) leaves the base unstated; the app uses log₂.
- **C17 Teleportation resource.** Bergou teleports with the singlet; most courses use Φ⁺. `teleport(psi, resource)`
  takes either; Q9 shows Bergou's table under Bergou's resource.

**E. Source handling**
- **E1 Bergou printed ↔ PDF page offsets.**

  | Chapter | Printed pages | PDF = printed + |
  |---|---|---|
  | 1 | 1–13 | 15 |
  | 2 | 15–29 | 14 |
  | 3 | 31–63 | 13 |
  | 4 | 65–75 | 12 |
  | 5–6 | 77–115 | 11 |
  | 7 | 117–143 | 10 |
  | 8 | 145–159 | 9 |
  | 9–10 | 161–187 | 8 |
  | 11–13 | 189–251 | 7 |
  | 14–15 | 253–300 | 6 |
  | index | 303– | 5 |

  BUILD-LOG's KT point 7 should record this table in place of "−15".
- **E2** Axler: printed = PDF − 14 throughout, confirmed.
- **E3** Only notes p. 6 was flagged NEEDS VISION. The page render shows highlights only, and nothing is missing from
  the text layer.

**Open questions for the judge:**
1. The Bell naming (C3).
2. The per-platform |0⟩/|1⟩ energy flag (C13).
3. The Q3 → l7-spreads bridge while HW1 P1 exists (A1).
4. Whether to keep q16-shor-preview.
5. grover-plane and vector-3d as hilbert-plane presets or as new kinds.
6. Ingesting Bergou's page renders (A5).
