/**
 * Background chapter B2 of the Papers section: quantum LDPC codes and bivariate bicycle codes (rulings papers-B1B2.md; plan P-B2-story). It teaches what
 * sparse means and why the surface code wastes qubits, what a flat layout forbids, how two polynomials on a torus make commuting checks, the gross code
 * and its depth-8 syndrome cycle, the shifts of the torus as logical gates, and belief propagation with ordered-statistics decoding, in two tracks, for the
 * paper lecture P1 and every later paper that needs them.
 * Sources were read online and are paraphrased and cited by section: Bravyi et al. (Sections 4, 5, 9), Breuckmann and Eberhardt, Roffe et al.;
 * Bravyi, Poulin and Terhal and Müller et al. are cited from their abstracts only. Every number is either computed by a registered recipe (numpy twin:
 * pipeline/claims_papers/b2.py) or reported from a source with its location.
 *
 * DATA ONLY: papers/specData.test.ts proves this file holds nothing but literals; papers/validate.ts checks it; papers/compile.ts
 * turns it into a Lecture.
 */
import type { PaperSpec } from '../../papers/spec'

export const B2: PaperSpec = {
  specVersion: 1,
  id: 'B2',
  kind: 'background',
  title: 'Quantum LDPC codes and bivariate bicycle codes',
  outcomes: [
    'Tell a sparse code from a dense one, and compute rates and the ratio of logical qubits times distance squared to qubits.',
    'Build a bivariate bicycle code from two polynomials on a torus, check that its checks commute and count its logical qubits two ways.',
    'Read the gross code as a toric code with long edges, and show that two ways of writing it are one code.',
    'Judge the depth-8 syndrome cycle for clashes and for the order of the readouts.',
    'Compute what a shift of the torus does to the logical qubits: its table, its order and the group they form.',
    'Watch belief propagation converge, stall on a degenerate error and be repaired by ordered-statistics decoding.',
  ],
  references: [
    {
      id: 'bra24',
      label: 'Bravyi et al. 2024',
      arxiv: { id: '2308.07915' },
      depth: 1,
      status: 'read',
      reliedOn: 'Secs. 4, 5, 9.1-9.2; Def. 1; Lemmas 1, 2, 4; Tables 3, 5',
      why: 'Develops the bivariate bicycle codes (the paper’s section 2.1 credits it together with two earlier works), lists the seven codes of Table 3, gives the depth-8 syndrome cycle and shows how shifts act as logical gates.',
      taughtIn: { course: 'papers', chapter: 'B2', unit: 'b2-polynomials' },
    },
    {
      id: 'be21',
      label: 'Breuckmann and Eberhardt 2021',
      arxiv: { id: '2103.06309' },
      depth: 1,
      status: 'read',
      reliedOn: 'Sections II.1.2, II.2.2, III.4, IV.1 and VI.3 to VI.4',
      why: 'A review of quantum LDPC codes: sparse checks, the rate and distance a family should reach, the limit on flat layouts, and decoding.',
      taughtIn: { course: 'papers', chapter: 'B2', unit: 'b2-ldpc' },
    },
    {
      id: 'bpt10',
      label: 'Bravyi, Poulin and Terhal 2010',
      arxiv: { id: '0909.5200' },
      depth: 1,
      status: 'cited',
      why: 'Proves that local commuting checks on a flat lattice cannot reach a large distance together with many logical qubits; only its abstract was read.',
      taughtIn: { course: 'papers', chapter: 'B2', unit: 'b2-bpt' },
    },
    {
      id: 'rof20',
      label: 'Roffe et al. 2020',
      arxiv: { id: '2005.07016' },
      depth: 1,
      status: 'read',
      reliedOn: 'Section V, Eqs. 6 and 7; Appendix C, Algorithm 1',
      why: 'Decodes quantum LDPC codes with belief propagation and, when that stalls, ordered-statistics decoding; its Appendix C scales the messages, which we leave out.',
      taughtIn: { course: 'papers', chapter: 'B2', unit: 'b2-decoding' },
    },
    {
      id: 'mul25',
      label: 'Müller et al. 2025',
      arxiv: { id: '2506.01779' },
      depth: 1,
      status: 'cited',
      why: 'Introduces Relay-BP, the decoder the paper relies on; only its abstract was read.',
      taughtIn: { course: 'papers', chapter: 'B2', unit: 'b2-decoding' },
    },
  ],
  prerequisites: [
    {
      id: 'gf2-linear-algebra',
      label: 'Linear algebra over bits',
      teach: { course: 'qc709', chapter: 'F7', unit: 'f7-gf2' },
      needs: [],
    },
    {
      id: 'clock-arithmetic',
      label: 'Clock arithmetic',
      teach: { course: 'qc709', chapter: 'F8', unit: 'f8-clock' },
      needs: [],
    },
    {
      id: 'check-matrix',
      label: 'Generators and the check matrix',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-check-matrix' },
      needs: [],
    },
    {
      id: 'css-stabilizer',
      label: 'CSS codes as stabilizer codes',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-css' },
      needs: [],
    },
    {
      id: 'toric-code',
      label: 'The toric code',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-toric' },
      needs: ['css-stabilizer'],
    },
    {
      id: 'surface-code-patch',
      label: 'The rotated surface-code patch',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-planar' },
      needs: ['toric-code'],
    },
    {
      id: 'syndrome-cycle',
      label: 'Syndrome cycles',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-cycle' },
      needs: ['toric-code'],
    },
    {
      id: 'detector',
      label: 'Detectors in space-time',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-spacetime' },
      needs: ['syndrome-cycle'],
    },
    {
      id: 'qldpc-code',
      label: 'Quantum LDPC codes',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-ldpc' },
      needs: ['css-stabilizer', 'toric-code'],
      ref: 'be21',
    },
    {
      id: 'code-rate',
      label: 'Rate and its limit',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-ldpc' },
      needs: ['qldpc-code', 'surface-code-patch'],
      ref: 'be21',
    },
    {
      id: 'bpt-bound',
      label: 'The Bravyi-Poulin-Terhal bound',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-bpt' },
      needs: ['code-rate'],
      ref: 'bpt10',
    },
    {
      id: 'long-range-connectivity',
      label: 'Long-range connectivity and layers',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-bpt' },
      needs: ['bpt-bound'],
      ref: 'bra24',
    },
    {
      id: 'polynomial-ring',
      label: 'Polynomials on a torus',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-polynomials' },
      needs: ['clock-arithmetic', 'gf2-linear-algebra'],
      ref: 'bra24',
    },
    {
      id: 'bb-code',
      label: 'Bivariate bicycle codes',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-polynomials' },
      needs: ['polynomial-ring', 'check-matrix', 'long-range-connectivity'],
      ref: 'bra24',
    },
    {
      id: 'bb-k-formula',
      label: 'Counting logical qubits',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-polynomials' },
      needs: ['bb-code'],
      ref: 'bra24',
    },
    {
      id: 'bb-torus-layout',
      label: 'The torus layout of a BB code',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-gross' },
      needs: ['bb-code', 'toric-code'],
      ref: 'bra24',
    },
    {
      id: 'gross-code',
      label: 'The gross code',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-gross' },
      needs: ['bb-torus-layout'],
      ref: 'bra24',
    },
    {
      id: 'syndrome-cycle-bb',
      label: 'The depth-8 cycle',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-gross' },
      needs: ['gross-code', 'syndrome-cycle'],
      ref: 'bra24',
    },
    {
      id: 'code-automorphism',
      label: 'Code automorphisms',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-automorphisms' },
      needs: ['bb-code', 'check-matrix'],
      ref: 'bra24',
    },
    {
      id: 'shift-automorphism',
      label: 'Shifts as logical gates',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-automorphisms' },
      needs: ['code-automorphism', 'gross-code'],
      ref: 'bra24',
    },
    {
      id: 'bp-decoding',
      label: 'Belief propagation',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-decoding' },
      needs: ['detector', 'qldpc-code'],
      ref: 'rof20',
    },
    {
      id: 'relay-bp',
      label: 'Relay-BP',
      teach: { course: 'papers', chapter: 'B2', unit: 'b2-decoding' },
      needs: ['bp-decoding'],
      ref: 'mul25',
    },
  ],
  symbols: {
    n: 'b2-ldpc:b2',
    k: 'b2-ldpc:b2',
    d: 'b2-ldpc:b2',
    H_X: 'b2-bpt:b4',
    H_Z: 'b2-bpt:b4',
    i: 'b2-polynomials:b1',
    j: 'b2-polynomials:b1',
    A: 'b2-polynomials:b1',
    B: 'b2-polynomials:b1',
    '\\dim': 'b2-polynomials:b3',
    '\\ker': 'b2-polynomials:b3',
    '\\ell': 'b2-polynomials:b1',
    m: 'b2-polynomials:b1',
    T: 'b2-polynomials:b6',
    C: 'b2-gross:b4',
    A_1: 'b2-gross:b5',
    A_2: 'b2-gross:b5',
    a: 'b2-automorphisms:b1',
    b: 'b2-automorphisms:b1',
    M_x: 'b2-automorphisms:b2',
    M_y: 'b2-automorphisms:b2',
    G: 'b2-automorphisms:b3',
    I: 'b2-automorphisms:b3',
    'M_x^6': 'b2-automorphisms:b3',
    '\\lambda': 'b2-decoding:b1',
    w_1: 'b2-decoding:b2',
    w_2: 'b2-decoding:b2',
    w_3: 'b2-decoding:b2',
    w_4: 'b2-decoding:b2',
    p: 'b2-decoding:b5',
  },
  symbolsFormal: {
    n: 'b2-ldpc:b1',
    k: 'b2-ldpc:b2',
    d: 'b2-ldpc:b2',
    L: 'b2-ldpc:b2',
    r: 'b2-ldpc:b4',
    H_X: 'b2-ldpc:b4',
    H_Z: 'b2-ldpc:b4',
    O: 'b2-bpt:b1',
    D: 'b2-bpt:b1',
    '\\ell': 'b2-polynomials:b1',
    m: 'b2-polynomials:b1',
    a: 'b2-polynomials:b1',
    b: 'b2-polynomials:b1',
    A: 'b2-polynomials:b1',
    B: 'b2-polynomials:b1',
    T: 'b2-polynomials:b2',
    '\\dim': 'b2-polynomials:b3',
    '\\ker': 'b2-polynomials:b3',
    i: 'b2-gross:b1',
    j: 'b2-gross:b1',
    R: 'b2-gross:b1',
    h: 'b2-gross:b1',
    v: 'b2-gross:b1',
    A_2: 'b2-gross:b4',
    A_1: 'b2-gross:b4',
    A_3: 'b2-gross:b4',
    B_2: 'b2-gross:b4',
    B_1: 'b2-gross:b4',
    B_3: 'b2-gross:b4',
    C: 'b2-gross:b6',
    X: 'b2-automorphisms:b2',
    M: 'b2-automorphisms:b2',
    M_x: 'b2-automorphisms:b2',
    M_y: 'b2-automorphisms:b2',
    G: 'b2-automorphisms:b3',
    'M_x^6': 'b2-automorphisms:b3',
    I: 'b2-automorphisms:b3',
    '\\lambda': 'b2-decoding:b1',
    p: 'b2-decoding:b1',
    w_1: 'b2-decoding:b2',
    w_2: 'b2-decoding:b2',
    w_3: 'b2-decoding:b2',
    w_4: 'b2-decoding:b2',
    w_t: 'b2-decoding:b2',
    S: 'b2-decoding:b3',
    H_S: 'b2-decoding:b3',
    e_S: 'b2-decoding:b3',
    s: 'b2-decoding:b3',
  },
  units: [
    {
      id: 'b2-ldpc',
      title: 'Sparse checks and the rate problem',
      question: 'What does sparse mean, and why does the surface code waste qubits?',
      source: {
        summary: 'Breuckmann and Eberhardt define sparse by bounded check weight and qubit degree. They name rate and distance as the aims. Bravyi and coauthors list codes that reach them for small sizes.',
        where: 'BE21 §II.1.2, §IV.1; Bra+24 Table 3',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '0001111', b: '0110011' },
        tryThis: [
          'The strings are two rows of the length-7 Hamming matrix, checks of weight four. The readout says “a ⊕ b = 0111100” and “differ in 4 places”.',
          'Press a·b: it says “a AND b = 0000011” and “a·b = 0”. The checks overlap in two places, an even number, so they commute. Now imagine weight-32 checks at length 63: no chip could wire them.',
        ],
      },
      insight: 'A code is sparse when checks stay small as it grows. The surface code is sparse but spends $d^2$ qubits on each logical qubit; dense codes have high rate but unwireable checks.',
      insightFormal: 'LDPC means bounded check weight and qubit degree as $n$ grows. The surface patch has $k/n = 1/d^2$; the CSS Hamming codes have rate near 1 but check weight $(n+1)/2$. The aim is constant rate and linear distance at constant weight.',
      story: [
        {
          id: 'b2-ldpc:b1',
          phase: 'books',
          text: 'Meet the [[pp-qldpc-code|quantum LDPC code]]. Every check touches few [[qubit|qubits]], and every qubit sits in few checks, however big the code grows. The toric code is like that.',
          formal: 'A family of [[pp-qldpc-code|quantum LDPC codes]] has bounded check weight and [[qubit|qubit]] degree as $n \\to \\infty$ (BE21 §II.1.2). The toric code keeps check weight 4 from $n = 18$ to $n = 128$. The CSS codes of the Hamming codes have check weights 4, 8, 16 and 32 at $n = 7, 15, 31, 63$: they are not sparse.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'check-weight',
              hammingR: [3, 4, 5, 6],
              toricL: [3, 4, 5, 6, 8],
            },
          },
          caption: 'check weight against code size: flat for the toric code, climbing for the Hamming family',
          captionFormal: 'check weight against $n$: flat for the toric code, growing like $(n+1)/2$ for the CSS Hamming codes',
          introduces: ['pp-qldpc-code'],
          claims: [
            {
              key: 'b2ToricWeight',
              text: 'every check of the toric code touches 4 qubits',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'check-weight',
                  hammingR: [3, 4, 5, 6],
                  toricL: [3, 4, 5, 6, 8],
                },
              },
              value: 'toricW',
            },
            {
              key: 'b2HammingW7',
              text: 'the length-7 Hamming code gives checks of weight 4',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'check-weight',
                  hammingR: [3, 4, 5, 6],
                  toricL: [3, 4, 5, 6, 8],
                },
              },
              value: 'hammingW7',
            },
            {
              key: 'b2HammingW15',
              text: 'the length-15 Hamming code gives checks of weight 8',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'check-weight',
                  hammingR: [3, 4, 5, 6],
                  toricL: [3, 4, 5, 6, 8],
                },
              },
              value: 'hammingW15',
            },
            {
              key: 'b2HammingW31',
              text: 'the length-31 Hamming code gives checks of weight 16',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'check-weight',
                  hammingR: [3, 4, 5, 6],
                  toricL: [3, 4, 5, 6, 8],
                },
              },
              value: 'hammingW31',
            },
            {
              key: 'b2HammingW63',
              text: 'the length-63 Hamming code gives checks of weight 32',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'check-weight',
                  hammingR: [3, 4, 5, 6],
                  toricL: [3, 4, 5, 6, 8],
                },
              },
              value: 'hammingW63',
            },
          ],
          trail: [
            {
              ref: 'be21',
              at: 'Section II.1.2',
              why: 'Sparse means bounded check weight and bounded qubit degree.',
            },
          ],
        },
        {
          id: 'b2-ldpc:b2',
          phase: 'books',
          text: 'A code with $n$ data qubits, $k$ logical qubits and distance $d$ has [[pp-code-rate|rate]] $k/n$: the share of qubits that carry data. A surface patch has rate $1/d^2$: $1/9$ at distance 3, and $1/289$ at distance 17, which costs 289 data qubits for each logical qubit.',
          formal: 'The [[pp-code-rate|rate]] is $k/n$. The rotated patch has rate $1/d^2$: $1/9$ at $d = 3$ and $1/289$ at $d = 17$. The toric code has $2/(2L^2) = 1/L^2$ (<<pp-b1-toric|Chapter B1>>). A good family keeps both $k/n$ and $d/n$ above a fixed positive number. BE21 §II.1.2 called a sparse one open, and later work answered it; the paper cites Panteleev and Kalachev’s asymptotically good codes only as outlook.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'rate',
              d: [3, 5, 7, 9, 11, 13, 15, 17],
            },
          },
          caption: 'rate against distance for the surface code: one over $d^2$',
          captionFormal: 'rate $k/n = 1/d^2$ of the rotated patch against $d$',
          introduces: ['pp-code-rate'],
          claims: [
            {
              key: 'b2SurfaceRate3',
              text: 'a distance-3 surface patch has rate 1/9',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'rate',
                  d: [3, 5, 7, 9, 11, 13, 15, 17],
                },
              },
              value: 'surfaceRate3',
            },
            {
              key: 'b2SurfaceRate17',
              text: 'a distance-17 surface patch has rate 1/289, about 0.00346',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'rate',
                  d: [3, 5, 7, 9, 11, 13, 15, 17],
                },
              },
              value: 'surfaceRate17',
            },
            {
              key: 'b2SurfaceData17',
              text: 'a distance-17 patch has 289 data qubits',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'rate',
                  d: [3, 5, 7, 9, 11, 13, 15, 17],
                },
              },
              value: 'surfaceData17',
            },
          ],
          trail: [
            {
              ref: 'be21',
              at: 'Section II.1.2',
              why: 'Constant rate and linear distance are the aim, and a sparse family with both was then open.',
            },
          ],
        },
        {
          id: 'b2-ldpc:b3',
          phase: 'books',
          text: 'The [[pp-gross-code|gross code]] stores 12 logical qubits with distance 12 in 144 data qubits. Twelve surface patches of distance 13 need $12\\times169 = 2028$ data qubits, about fourteen times more.',
          formal: 'The [[pp-gross-code|gross code]] has $[\\![144, 12, 12]\\!]$ (Bra+24 Table 3; $d$ is reported, and we compute $n$ and $k$). A rotated patch of distance 13, the nearest odd distance at or above 12, has $d^2 = 169$ data qubits and one logical qubit. Twelve patches take 2028 against 144: a ratio of 14.08. In $kd^2/n$ terms that is 12 for the gross code against 1 for a patch.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'kd2n',
              codes: ['surface-d13', 'gross'],
            },
          },
          caption: '144 data qubits for 12 logical qubits, against 2028 for patches',
          captionFormal: '$[\\![144,12,12]\\!]$ against twelve patches of distance 13 in $kd^2/n$',
          fidelity: ['qc-plot-points-printed'],
          claims: [
            {
              key: 'b2K144',
              text: 'the gross code stores 12 logical qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'k',
            },
            {
              key: 'b2N144',
              text: 'the gross code has 144 data qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'n',
            },
            {
              key: 'b2SurfaceData13',
              text: 'a distance-13 patch has 169 data qubits',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['surface-d13', 'gross'],
                },
              },
              value: 'surfaceData13',
            },
            {
              key: 'b2SurfaceDataFor12',
              text: 'twelve distance-13 patches have 2028 data qubits',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['surface-d13', 'gross'],
                },
              },
              value: 'surfaceDataFor12',
            },
            {
              key: 'b2SurfaceRatio13',
              text: 'twelve patches cost 14.08 times the data qubits of the gross code',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['surface-d13', 'gross'],
                },
              },
              value: 'surfaceRatio13',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Table 3',
              why: 'The list of codes with their parameters, among them the gross code.',
            },
          ],
          reported: [
            {
              id: 'bra24-d144',
              text: 'the gross code has distance 12',
              value: '12',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
          ],
        },
        {
          id: 'b2-ldpc:b4',
          phase: 'clue',
          text: 'A quantum Hamming-style code on 63 qubits stores 51 logical qubits. How big are its checks?',
          formal: 'For $r = 6$ the check matrices $H_X$ and $H_Z$ are both the Hamming matrix of length 63. Find $k$ and the check weight.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'check-weight',
              hammingR: [6],
            },
          },
          caption: 'the CSS code of the length-63 Hamming code',
          captionFormal: 'the length-63 Hamming code, $H_X = H_Z$',
          reveal: {
            text: 'Thirty-two qubits per check. High rate, but each check touches half the code, so no chip could wire it.',
            formal: '$k = 51$, a rate of 0.81; check weight $2^{r-1} = 32$; qubit degree 12. Dense, not LDPC.',
            caption: 'rate near 1, checks of weight 32',
            captionFormal: 'rate 0.81 with check weight 32',
            claims: [
              {
                key: 'b2HammingK63',
                text: 'the length-63 Hamming code gives 51 logical qubits',
                from: {
                  recipe: 'qldpc-family',
                  params: {
                    view: 'check-weight',
                    hammingR: [3, 4, 5, 6],
                    toricL: [3, 4, 5, 6, 8],
                  },
                },
                value: 'hammingK63',
              },
              {
                key: 'b2HammingRate63',
                text: 'the length-63 Hamming code has rate about 0.81',
                from: {
                  recipe: 'qldpc-family',
                  params: {
                    view: 'check-weight',
                    hammingR: [3, 4, 5, 6],
                    toricL: [3, 4, 5, 6, 8],
                  },
                },
                value: 'hammingRate63',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'A sparse code has checks that touch few qubits, however large the code is.',
          'The rate $k/n$ is the share of qubits that carry data.',
          'A surface patch of distance $d$ has rate $1/d^2$, which falls quickly.',
          'Dense codes can have high rate, but their checks grow with the code.',
        ],
        equations: 'k/n = 1/d^2',
        trap: 'Thinking that a high rate makes a code good: a code with checks on half its qubits cannot be built.',
        formal: {
          points: [
            'A quantum LDPC family has check weight and qubit degree bounded as $n \\to \\infty$ (BE21 §II.1.2).',
            'The rotated patch has $k/n = 1/d^2$ and the toric code $1/L^2$.',
            'The CSS Hamming codes have $k/n \\to 1$ and check weight $(n+1)/2$.',
          ],
          equations: 'k/n = 1/d^2 \\quad\\text{(rotated patch)}',
          trap: 'Reading a high rate as a good code: both the weight and the distance matter.',
        },
      },
      play: [
        {
          id: 'b2-l-w',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Checks of a long Hamming code',
          prompt: 'The CSS code of the Hamming code of length 127 uses the Hamming matrix for both kinds of check. How many qubits does one check touch?',
          answerFrom: {
            from: {
              recipe: 'qldpc-family',
              params: {
                view: 'check-weight',
                hammingR: [3, 4, 5, 6, 7],
              },
            },
            value: 'hammingW127',
          },
          tolerance: 0,
          hints: [
            { text: 'Use the pattern 4, 8, 16, 32 for lengths 7, 15, 31, 63.' },
            { text: 'Each doubling of the length doubles the check weight.' },
            { text: 'A check of the length-$n$ Hamming code touches $(n+1)/2$ qubits.' },
          ],
          walkthrough: [
            { text: 'The weights 4, 8, 16, 32 double each time the length doubles.' },
            { text: 'For length 127 the weight is $(127+1)/2 = 64$.' },
          ],
        },
        {
          id: 'b2-l-rate',
          kind: 'numeric',
          tier: 'core',
          title: 'The rate of a dense code',
          prompt: 'A quantum Hamming-style code on 63 qubits stores 51 logical qubits. What is its rate $k/n$? Give a decimal.',
          answerFrom: {
            from: {
              recipe: 'qldpc-family',
              params: {
                view: 'check-weight',
                hammingR: [3, 4, 5, 6],
                toricL: [3, 4, 5, 6, 8],
              },
            },
            value: 'hammingRate63',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The rate is the share of qubits that carry data.' },
            { text: 'Divide the number of logical qubits by the number of qubits.' },
            { text: 'Compute $51/63$.' },
          ],
          walkthrough: [
            { text: 'The rate is $k/n = 51/63$.' },
            { text: 'That is about 0.8095.' },
          ],
        },
        {
          id: 'b2-l-kd2n',
          kind: 'numeric',
          tier: 'core',
          title: 'A ratio for a printed code',
          prompt: 'The code $[\\![90, 8, 10]\\!]$ has $n = 90$, $k = 8$ and, as printed, $d = 10$. Compute $kd^2/n$.',
          answerFrom: {
            from: {
              recipe: 'qldpc-family',
              params: {
                view: 'kd2n',
                codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                logX: true,
              },
            },
            value: 'kd2n90',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The ratio is $k$ times the square of $d$, divided by $n$.' },
            { text: 'The square of 10 is 100.' },
            { text: 'Compute $8\\times100/90$.' },
          ],
          walkthrough: [
            { text: '$kd^2 = 8\\times100 = 800$.' },
            { text: 'Divided by $n = 90$ that is about 8.889.' },
          ],
        },
      ],
    },
    {
      id: 'b2-bpt',
      title: 'Why the plane is not enough',
      question: 'What does a flat layout forbid?',
      source: {
        summary: 'Bravyi, Poulin and Terhal bound kd² for local checks in a plane. Bravyi and coauthors show their codes have thickness 2: two flat layers of edges.',
        where: 'BPT10 abstract; BE21 §III.4; Bra+24 Lemma 2',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '11111100', b: '00001110' },
        tryThis: [
          'The strings are an X check and a Z check that share two qubits. The readout says “a ⊕ b = 11110010” and “differ in 5 places”.',
          'Press a·b: it says “a AND b = 00001100” and “a·b = 0”. Two shared qubits is an even number, so they commute. In the codes of this chapter the six qubits of a check lie far apart on the torus.',
        ],
      },
      insight: 'In a plane, short checks cap how many logical qubits fit at a given distance. Codes whose checks reach across the torus pass the cap, yet the reach needs only two flat layers.',
      insightFormal: 'For local commuting checks in two dimensions, $kd^2 = O(n)$; the toric code and the rotated patch have $kd^2/n = 1$. The codes met below reach 6 to 13.5 because their checks are non-local, with a Tanner graph of thickness 2.',
      story: [
        {
          id: 'b2-bpt:b1',
          phase: 'books',
          text: 'A flat layout with short checks cannot have many logical qubits and a large distance together. This is the [[pp-bpt-bound|Bravyi–Poulin–Terhal bound]]: the product $kd^2$ stays below a constant times $n$.',
          formal: 'The [[pp-bpt-bound|Bravyi–Poulin–Terhal bound]]: commuting checks that are local on a two-dimensional lattice obey $kd^2 = O(n)$ (BPT10, abstract); in $D$ dimensions $kd^{2/(D-1)} \\le O(n)$ (BE21 §III.4). The constant depends on how far a check reaches. The toric code and the rotated patch sit at $kd^2/n = 1$.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'kd2n',
              codes: ['surface-d3', 'surface-d5', 'surface-d7', 'toric-L4'],
            },
          },
          caption: '$kd^2/n$ for the toric code and the surface patch: both 1',
          captionFormal: '$kd^2/n$ for the rotated patches and the $L = 4$ torus, against the line at 1',
          introduces: ['pp-bpt-bound'],
          claims: [
            {
              key: 'b2Kd2nSurface',
              text: 'a rotated patch has k d squared over n equal to 1',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['surface-d3', 'surface-d5', 'surface-d7', 'toric-L4'],
                },
              },
              value: 'kd2nSurface',
            },
            {
              key: 'b2Kd2nToric',
              text: 'the toric code has k d squared over n equal to 1',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['surface-d3', 'surface-d5', 'surface-d7', 'toric-L4'],
                },
              },
              value: 'kd2nToric',
            },
          ],
          trail: [
            {
              ref: 'bpt10',
              at: 'Abstract',
              why: 'States the bound for local commuting checks in two dimensions.',
            },
            { ref: 'be21', at: 'Section III.4', why: 'Gives the bound in D dimensions.' },
          ],
          reported: [
            {
              id: 'bpt10-bound',
              text: 'local commuting checks on a flat lattice obey k d squared at most a constant times n',
              value: 'kd^2 = O(n)',
              source: 'bpt10',
              at: { kind: 'section', label: 'abstract' },
            },
          ],
        },
        {
          id: 'b2-bpt:b2',
          phase: 'books',
          text: 'The [[pp-bb-code|BB codes]] of this chapter sit far above 1: from 6 up to 13.5, as the dots show. That does not break the theorem, whose constant depends on how far a check reaches. It shows what long reach buys.',
          formal: 'With the printed distances, $kd^2/n$ is $6$, $8.89$, $7.41$, $12$ and $13.5$ for $n = 72, 90, 108, 144, 288$. We compute $n$ and $k$; $d$ is proved for $n = 72$ in the polynomials unit and reported for the rest. The checks of a [[pp-bb-code|BB code]] are not local in the plane, so the theorem’s hypothesis fails and the theorem says nothing about them.',
          stage: {
            recipe: 'qldpc-family',
            params: {
              view: 'kd2n',
              codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
              logX: true,
            },
          },
          caption: '$kd^2/n$ for five BB codes against the planar line at 1',
          captionFormal: '$kd^2/n$ of five BB codes ($n$ on a log axis) against the planar line at 1',
          fidelity: ['qc-plot-points-printed'],
          claims: [
            {
              key: 'b2Kd2n72',
              text: 'the 72-qubit BB code has k d squared over n equal to 6',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                  logX: true,
                },
              },
              value: 'kd2n72',
            },
            {
              key: 'b2Kd2n90',
              text: 'the 90-qubit BB code has k d squared over n about 8.889',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                  logX: true,
                },
              },
              value: 'kd2n90',
            },
            {
              key: 'b2Kd2n108',
              text: 'the 108-qubit BB code has k d squared over n about 7.407',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                  logX: true,
                },
              },
              value: 'kd2n108',
            },
            {
              key: 'b2Kd2n144',
              text: 'the 144-qubit BB code has k d squared over n equal to 12',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                  logX: true,
                },
              },
              value: 'kd2n144',
            },
            {
              key: 'b2Kd2n288',
              text: 'the 288-qubit BB code has k d squared over n equal to 13.5',
              from: {
                recipe: 'qldpc-family',
                params: {
                  view: 'kd2n',
                  codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'],
                  logX: true,
                },
              },
              value: 'kd2n288',
            },
          ],
          trail: [
            { ref: 'bra24', at: 'Table 3', why: 'The printed distances of the codes.' },
          ],
          reported: [
            {
              id: 'bra24-d90',
              text: 'the 90-qubit code has distance 10',
              value: '10',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
            {
              id: 'bra24-d108',
              text: 'the 108-qubit code has distance 10',
              value: '10',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
            {
              id: 'bra24-d288',
              text: 'the 288-qubit code has distance 18',
              value: '18',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
          ],
        },
        {
          id: 'b2-bpt:b3',
          phase: 'books',
          text: 'The long edges are not wild. Split the edges of the BB graph by the term they belong to, and you get two layers. Each layer has three links at every node and 432 edges.',
          formal: 'Bra+24 Lemma 2: the Tanner graph has thickness 2. Splitting its edges by the monomial they come from puts half in each of two layers of 432 edges, 864 in all, each of maximum degree 3 (computed). That each layer is planar is the lemma’s claim, confirmed offline by a planarity routine kept in the repository’s pipeline folder (check_bb_planarity.py) and not recomputed here.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross', view: 'layers' },
          },
          caption: 'one X check and one Z check, their edges coloured by layer',
          captionFormal: 'the edges of one X check and one Z check, coloured by layer; totals in the readout',
          claims: [
            {
              key: 'b2LayerDegree',
              text: 'each layer has maximum degree 3',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross', view: 'layers' },
              },
              value: 'layerDegree',
            },
            {
              key: 'b2LayerEdges',
              text: 'the two layers together hold 864 edges',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross', view: 'layers' },
              },
              value: 'layerEdges',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 4, Lemma 2',
              why: 'The wheel-graph construction that splits the edges into two flat layers.',
            },
          ],
          reported: [
            {
              id: 'bra24-lemma2',
              text: 'the Tanner graph of a BB code has thickness at most 2',
              value: 'thickness 2',
              source: 'bra24',
              at: { kind: 'section', label: '4' },
            },
          ],
        },
        {
          id: 'b2-bpt:b4',
          phase: 'clue',
          text: 'In a BB code, in how many checks does each qubit sit?',
          formal: 'Count the ones in a column of $H_X$ and $H_Z$ together.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross' },
          },
          caption: 'the gross code on its torus',
          captionFormal: 'the gross code on its $12\\times6$ torus',
          reveal: {
            text: 'Six: three X checks and three Z checks, matching the six qubits in each check.',
            formal: 'Column weight 3 in each of $H_X$ and $H_Z$: qubit degree 6, check weight 6.',
            caption: 'qubit degree 6, check weight 6',
            captionFormal: 'qubit degree 6 and check weight 6',
            claims: [
              {
                key: 'b2QubitDegree',
                text: 'each qubit of a BB code sits in 6 checks',
                from: {
                  recipe: 'bb-code',
                  params: { preset: 'gross' },
                },
                value: 'qubitDegree',
              },
              {
                key: 'b2CheckWeight',
                text: 'each check of a BB code touches 6 qubits',
                from: {
                  recipe: 'bb-code',
                  params: { preset: 'gross' },
                },
                value: 'checkWeight',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'Short checks on a flat lattice cap the product $kd^2$ at a constant times $n$.',
          'Toric and surface codes sit at $kd^2/n = 1$.',
          'BB codes sit far above 1 because their checks reach across the torus.',
          'Their Tanner graph still splits into two flat layers.',
        ],
        equations: 'kd^2/n',
        trap: 'Reading a ratio above 1 as a broken theorem: the theorem only covers local checks.',
        formal: {
          points: [
            'BPT10: commuting local checks in 2D obey $kd^2 = O(n)$, and BE21 §III.4 generalizes it to $D$ dimensions.',
            'The constant depends on the reach of the checks.',
            'Bra+24 Lemma 2: the Tanner graph of a BB code has thickness at most 2.',
          ],
          equations: 'kd^2 = O(n)',
          trap: 'Assuming checks of weight 6 are local: the weight says nothing about how far apart the qubits are.',
        },
      },
      play: [
        {
          id: 'b2-b-surface',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'A flat code',
          prompt: 'What is $kd^2/n$ for a rotated surface-code patch of distance 9?',
          answerFrom: {
            from: {
              recipe: 'qldpc-family',
              params: {
                view: 'kd2n',
                codes: ['surface-d3'],
              },
            },
            value: 'kd2nSurface',
          },
          tolerance: 0,
          hints: [
            { text: 'A patch of distance $d$ has $d^2$ data qubits and one logical qubit.' },
            { text: 'Put $k = 1$, $n = d^2$ into $kd^2/n$.' },
            { text: 'Compute $1\\times81/81$.' },
          ],
          walkthrough: [
            { text: 'A distance-9 patch has $n = 81$ and $k = 1$.' },
            { text: 'So $kd^2/n = 81/81 = 1$.' },
          ],
        },
        {
          id: 'b2-b-degree',
          kind: 'numeric',
          tier: 'core',
          title: 'Qubit degree',
          prompt: 'In how many checks does each qubit of a BB code sit? Count the X and the Z checks together.',
          answerFrom: {
            from: {
              recipe: 'bb-code',
              params: { preset: 'gross' },
            },
            value: 'qubitDegree',
          },
          tolerance: 0,
          hints: [
            { text: 'Count the ones in one column of $H_X$, then of $H_Z$.' },
            { text: 'Each column of $H_X$ has three ones, and so does each of $H_Z$.' },
            { text: 'Add the two counts.' },
          ],
          walkthrough: [
            { text: 'A column of $H_X$ has 3 ones and a column of $H_Z$ has 3.' },
            { text: 'Together that is 6.' },
          ],
        },
        {
          id: 'b2-b-layers',
          kind: 'numeric',
          tier: 'core',
          title: 'Edges per layer',
          prompt: 'How many edges does each of the two layers of the gross code’s Tanner graph hold?',
          answerFrom: {
            from: {
              recipe: 'bb-code',
              params: { preset: 'gross', view: 'layers' },
            },
            value: 'layerEdgesEach',
          },
          tolerance: 0,
          hints: [
            { text: 'Count all the edges first: every one of 144 checks has 6 edges.' },
            { text: 'The two layers hold the same number.' },
            { text: 'Divide the total by 2.' },
          ],
          walkthrough: [
            { text: 'There are $144\\times6 = 864$ edges in all.' },
            { text: 'Each layer holds half: 432.' },
          ],
        },
      ],
    },
    {
      id: 'b2-polynomials',
      title: 'Codes from polynomials on a torus',
      question: 'How do two polynomials make checks that commute?',
      source: {
        summary: 'Bravyi and coauthors build a code from two polynomials on a torus, prove the count of logical qubits and list seven codes. We recompute the sizes and the first distance.',
        where: 'Bra+24 §4 (Eqs. 1-3, Lemma 1, Table 3)',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '11111100', b: '00001110' },
        tryThis: [
          'The strings are an X check and a Z check that share two qubits. The readout says “a ⊕ b = 11110010” and “differ in 5 places”.',
          'Press a·b: it says “a AND b = 00001100” and “a·b = 0”. Because $AB = BA$, every X check of a BB code meets every Z check in an even number of qubits, as here.',
        ],
      },
      insight: 'Two patterns $A$ and $B$ on a wrapped grid make all the X checks and, transposed and swapped, all the Z checks. They commute because $AB = BA$, and $k$ is twice the common kernel.',
      insightFormal: '$H_X = [A \\mid B]$ and $H_Z = [B^T \\mid A^T]$ commute because the ring is commutative. Lemma 1 gives $k = 2\\dim(\\ker A \\cap \\ker B)$; Table 3 lists seven codes with weight 6, of which only $[\\![72,12,6]\\!]$ has a distance proved here.',
      story: [
        {
          id: 'b2-polynomials:b1',
          phase: 'books',
          text: 'Take an $\\ell$-by-$m$ grid wrapped into a torus; here $\\ell = 12$ and $m = 6$. A monomial $x^iy^j$ is the cell $i$ steps east and $j$ steps north, and twelve steps east is home again (<<pp-f8-clock|Chapter F8>>). A sum of monomials is a [[pp-torus-polynomial|polynomial]]: a set of cells. The code uses two of them, $A$ and $B$.',
          formal: 'A [[pp-torus-polynomial|polynomial]] in $\\mathrm{GF}(2)[x,y]/(x^\\ell-1,\\ y^m-1)$ is a pattern of 0s and 1s on $\\ell m$ cells. Multiplying by $x^ay^b$ shifts it, and the transpose $x^ay^b \\mapsto x^{-a}y^{-b}$ reverses it. Let $A = 1 + y + x^3y^{-1}$ and $B = 1 + x + x^{-1}y^{-3}$. Then $A$ from $(0,0)$ marks the cells $(0,0)$, $(0,1)$ and $(3,5)$, and the product $AB$ has 9 terms and equals $BA$.',
          stage: {
            recipe: 'bb-code',
            params: {
              preset: 'gross',
              pattern: {
                poly: 'A',
                anchor: { i: 0, j: 0 },
              },
            },
          },
          caption: 'the cells of $A$ from the cell $(0,0)$ on the 12-by-6 torus',
          captionFormal: 'the cells of $A$ anchored at $(0,0)$ on the $12\\times6$ torus',
          introduces: ['pp-torus-polynomial'],
          fidelity: ['qc-code-bb-layout'],
          claims: [
            {
              key: 'b2AWeight',
              text: 'the polynomial A has 3 terms',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'aWeight',
            },
            {
              key: 'b2ABweight',
              text: 'the product AB has 9 terms',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'abWeight',
            },
            {
              key: 'b2ABcommute',
              text: 'AB equals BA',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'abCommute',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 4, Eqs. 1 to 3',
              why: 'Shift matrices and the commuting ring of polynomials on the torus.',
            },
          ],
        },
        {
          id: 'b2-polynomials:b2',
          phase: 'books',
          text: 'A BB code sets the stripes of $A$ and $B$ side by side for the X checks, and their transposes, swapped, for the Z checks. Because $AB = BA$, an X check and a Z check overlap in an even number of qubits (<<pp-q22-css|Chapter Q22>>).',
          formal: '$H_X = [A \\mid B]$ and $H_Z = [B^T \\mid A^T]$ (Bra+24 Eqs. 1–2) have $n = 2\\ell m$ columns and row weight 6, and $H_XH_Z^T = AB + BA = 0$ over GF(2), the condition of <<pp-q22-css|Chapter Q22>>. For the gross code both ranks are 66. An X check meets 9 Z checks in exactly 2 qubits and 63 in none.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross', view: 'matrix', which: 'both' },
          },
          caption: '$H_X$ above $H_Z$ for the gross code, as stripes',
          captionFormal: '$H_X$ and $H_Z$ of the gross code as $72\\times144$ pictures of stripes',
          fidelity: ['qc-bits-bitmap'],
          claims: [
            {
              key: 'b2GrossRankX',
              text: 'the X checks of the gross code have rank 66',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'rankX',
            },
            {
              key: 'b2OverlapChecks',
              text: 'an X check meets 9 Z checks in exactly 2 qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'overlap2',
            },
            {
              key: 'b2ZeroOverlapChecks',
              text: 'an X check meets 63 Z checks in no qubit',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'overlap0',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 4, Eqs. 1 and 2',
              why: 'The matrices of a BB code and why they commute.',
            },
          ],
        },
        {
          id: 'b2-polynomials:b3',
          phase: 'books',
          text: 'Count: $k = 144 - 66 - 66 = 12$. A shortcut: $k$ is twice the number of patterns that both $A$ and $B$ send to zero. For the gross code that number is 6.',
          formal: 'Lemma 1 (Bra+24): $k = 2\\dim(\\ker A \\cap \\ker B)$, where $\\ker$ is the set of patterns that a polynomial multiplies to zero. For the gross code the dimension is 6, so $k = 12$. The toric code ($A = 1+x$, $B = 1+y$) has dimension 1, the constant pattern, and $k = 2$ as in <<pp-b1-toric|Chapter B1>>. We checked all seven rows of Table 3: each time it equals $n - \\mathrm{rank}\\,H_X - \\mathrm{rank}\\,H_Z$.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross', view: 'matrix', which: 'HX' },
          },
          caption: '$H_X$ of the gross code: 66 independent rows of 72',
          captionFormal: '$H_X$ of the gross code, with the common kernel of dimension 6 behind $k = 12$',
          derivation: {
            result: 'k = 2\\dim(\\ker A \\cap \\ker B)',
            ground: [
              {
                tex: 'k = n - \\mathrm{rk}\\,H_X - \\mathrm{rk}\\,H_Z',
                why: 'The stored qubits are the data qubits minus one for each independent check of either kind.',
                view: {
                  recipe: 'bb-code',
                  params: { preset: 'gross', view: 'matrix', which: 'both' },
                },
                viewCaption: 'the stripes of $H_X$ and $H_Z$',
              },
              {
                tex: '\\mathrm{rk}\\,H_X = \\mathrm{rk}\\,H_Z',
                why: 'Turning a pattern into its transpose reverses it without changing how many independent rows there are, so the two ranks are equal.',
                view: {
                  recipe: 'bb-code',
                  params: { preset: 'gross', view: 'matrix', which: 'HZ' },
                },
                viewCaption: 'equal ranks',
              },
              {
                tex: '\\mathrm{rk}[A \\mid B] = \\ell m - \\dim(\\ker A \\cap \\ker B)',
                why: 'The rows of the block $[A \\mid B]$ are independent except for the patterns that $A$ and $B$ both send to zero, as on this small torus.',
                view: {
                  recipe: 'bb-code',
                  params: {
                    preset: 'toric-3x3',
                    pattern: {
                      poly: 'A',
                      anchor: { i: 0, j: 0 },
                    },
                  },
                },
                viewCaption: 'a small torus: common kernel of dimension 1',
              },
              {
                tex: 'k = 2\\dim(\\ker A \\cap \\ker B)',
                why: 'So $k$ is $2\\ell m$ minus twice $\\ell m - \\dim$, which is twice the dimension: 6 for the gross torus, so $k = 12$.',
                view: {
                  recipe: 'bb-code',
                  params: {
                    preset: 'gross',
                    pattern: {
                      poly: 'A',
                      anchor: { i: 0, j: 0 },
                    },
                  },
                },
                viewCaption: 'the gross torus',
              },
            ],
            formal: [
              {
                tex: 'k = n - \\mathrm{rk}\\,H_X - \\mathrm{rk}\\,H_Z',
                why: 'The number of logical qubits of a CSS code is $n$ minus the two ranks.',
                view: {
                  recipe: 'bb-code',
                  params: { preset: 'gross', view: 'matrix', which: 'both' },
                },
                viewCaption: 'the stripes of $H_X$ and $H_Z$',
              },
              {
                tex: '\\mathrm{rk}[A \\mid B] = \\ell m - \\dim(\\ker A^{T} \\cap \\ker B^{T})',
                why: 'The rank of the block is $\\ell m$ minus the dimension of the common left kernel, and transposing is a ring automorphism, so that dimension equals the one for $A$ and $B$.',
                view: {
                  recipe: 'bb-code',
                  params: {
                    preset: 'toric-3x3',
                    pattern: {
                      poly: 'A',
                      anchor: { i: 0, j: 0 },
                    },
                  },
                },
                viewCaption: 'a small torus: kernel of dimension 1',
              },
              {
                tex: 'k = 2\\dim(\\ker A \\cap \\ker B)',
                why: 'Both ranks are $\\ell m$ minus that dimension, so $k = 2\\ell m - 2(\\ell m - \\dim)$: 12 for the gross code.',
                view: {
                  recipe: 'bb-code',
                  params: { preset: 'gross', view: 'matrix', which: 'HX' },
                },
                viewCaption: 'the rows of $H_X$ behind the count',
              },
            ],
          },
          claims: [
            {
              key: 'b2GrossKer',
              text: 'the common kernel of A and B has dimension 6 for the gross code',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'ker',
            },
            {
              key: 'b2ToricKer',
              text: 'the common kernel has dimension 1 for the toric code',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toric-3x3' },
              },
              value: 'ker',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 4, Lemma 1',
              why: 'The count of logical qubits from the common kernel of A and B.',
            },
          ],
        },
        {
          id: 'b2-polynomials:b4',
          phase: 'books',
          text: 'Seven codes, all with checks of size six, from 72 to 756 qubits and 8 to 16 logical qubits. Only for 72 qubits can we prove the distance here: it is 6.',
          formal: 'Table 3 of Bra+24 lists $[\\![72,12,6]\\!]$, $[\\![90,8,10]\\!]$, $[\\![108,8,10]\\!]$, $[\\![144,12,12]\\!]$, $[\\![288,12,18]\\!]$, $[\\![360,12,\\le 24]\\!]$ and $[\\![756,16,\\le 34]\\!]$. We compute every $n$ and $k$. For $n = 72$ an offline meet-in-the-middle search over syndromes finds no logical operator of weight 5 or less, of either type, and finds weight-6 ones. The other distances are reported.',
          stage: {
            recipe: 'qldpc-family',
            params: { view: 'table3' },
          },
          caption: '$k$ against $n$ for the seven codes: filled dots computed or proved, hollow dots printed',
          captionFormal: '$k$ against $n$ for the seven codes of Table 3, with the distance beside each dot',
          fidelity: ['qc-plot-points-printed'],
          claims: [
            {
              key: 'b2N72',
              text: 'the first code has 72 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n72',
            },
            {
              key: 'b2N90',
              text: 'the second code has 90 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n90',
            },
            {
              key: 'b2N108',
              text: 'the third code has 108 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n108',
            },
            {
              key: 'b2N288',
              text: 'the fifth code has 288 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n288',
            },
            {
              key: 'b2N360',
              text: 'the sixth code has 360 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n360',
            },
            {
              key: 'b2N756',
              text: 'the seventh code has 756 qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'n756',
            },
            {
              key: 'b2K72',
              text: 'the first code stores 12 logical qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'k72',
            },
            {
              key: 'b2K90',
              text: 'the second code stores 8 logical qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'k90',
            },
            {
              key: 'b2K108',
              text: 'the third code stores 8 logical qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'k108',
            },
            {
              key: 'b2K360',
              text: 'the sixth code stores 12 logical qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'k360',
            },
            {
              key: 'b2K756',
              text: 'the seventh code stores 16 logical qubits',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'k756',
            },
            {
              key: 'b2D72',
              text: 'the 72-qubit code has X-type distance 6, from the offline search',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'd72',
            },
            {
              key: 'b2D72Z',
              text: 'the 72-qubit code has Z-type distance 6, from the offline search',
              from: {
                recipe: 'qldpc-family',
                params: { view: 'table3' },
              },
              value: 'd72Z',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Table 3',
              why: 'The list of seven codes with their parameters.',
            },
          ],
          reported: [
            {
              id: 'bra24-d360',
              text: 'the 360-qubit code has distance at most 24',
              value: '24 (upper bound)',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
            {
              id: 'bra24-d756',
              text: 'the 756-qubit code has distance at most 34',
              value: '34 (upper bound)',
              source: 'bra24',
              at: { kind: 'table', label: '3' },
            },
          ],
        },
        {
          id: 'b2-polynomials:b5',
          phase: 'books',
          text: 'A tiny BB code on a 2-by-6 torus has 24 qubits, 4 logical qubits and distance 4. A toric code of the same size has 2 logical qubits and distance 3. So the toy code scores $kd^2/n = 2.667$ against 0.75 for the toric code. This toy code is our own example, not from a paper.',
          formal: 'Let $A = 1 + y + y^2$ and $B = 1 + y + xy^2$ on $2\\times6$. An exhaustive search gives $[\\![24, 4, 4]\\!]$, while the toric code on $3\\times4$ gives $[\\![24, 2, 3]\\!]$. So $kd^2/n$ is 2.667 against 0.75, at the price of check weight 6 against 4. This is our own example, found by a search; it is not from a paper.',
          stage: {
            recipe: 'bb-code',
            params: {
              preset: 'toy-24',
              check: {
                kind: 'X',
                cell: { i: 0, j: 0 },
              },
              longEdges: true,
            },
          },
          caption: 'the checks of the toy code on the 2-by-6 torus',
          captionFormal: 'one X check of the toy code on the $2\\times6$ torus',
          claims: [
            {
              key: 'b2ToyN',
              text: 'the toy code has 24 qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toy-24', distance: true },
              },
              value: 'n',
            },
            {
              key: 'b2ToyK',
              text: 'the toy code stores 4 logical qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toy-24', distance: true },
              },
              value: 'k',
            },
            {
              key: 'b2ToyD',
              text: 'the toy code has distance 4',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toy-24', distance: true },
              },
              value: 'd',
            },
            {
              key: 'b2ToricSameK',
              text: 'the 24-qubit toric code stores 2 logical qubits',
              from: {
                recipe: 'bb-code',
                params: {
                  spec: {
                    l: 3,
                    m: 4,
                    A: [
                      { dx: 0, dy: 0 },
                      { dx: 1, dy: 0 },
                    ],
                    B: [
                      { dx: 0, dy: 0 },
                      { dx: 0, dy: 1 },
                    ],
                  },
                  distance: true,
                },
              },
              value: 'k',
            },
            {
              key: 'b2ToricSameD',
              text: 'the 24-qubit toric code has distance 3',
              from: {
                recipe: 'bb-code',
                params: {
                  spec: {
                    l: 3,
                    m: 4,
                    A: [
                      { dx: 0, dy: 0 },
                      { dx: 1, dy: 0 },
                    ],
                    B: [
                      { dx: 0, dy: 0 },
                      { dx: 0, dy: 1 },
                    ],
                  },
                  distance: true,
                },
              },
              value: 'd',
            },
            {
              key: 'b2ToyKd2n',
              text: 'the toy code has k d squared over n of about 2.667',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toy-24', distance: true },
              },
              value: 'kd2n',
            },
            {
              key: 'b2ToricSameKd2n',
              text: 'the 24-qubit toric code has k d squared over n equal to 0.75',
              from: {
                recipe: 'bb-code',
                params: {
                  spec: {
                    l: 3,
                    m: 4,
                    A: [
                      { dx: 0, dy: 0 },
                      { dx: 1, dy: 0 },
                    ],
                    B: [
                      { dx: 0, dy: 0 },
                      { dx: 0, dy: 1 },
                    ],
                  },
                  distance: true,
                },
              },
              value: 'kd2n',
            },
          ],
        },
        {
          id: 'b2-polynomials:b6',
          phase: 'clue',
          text: 'The gross code has 12 logical qubits in 288 physical qubits, check qubits included. What is the rate?',
          formal: 'Compute $k/(2n)$ for $[\\![144,12,12]\\!]$.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross' },
          },
          caption: 'the gross code on its torus',
          captionFormal: 'the gross code: 144 data qubits and 144 check qubits',
          reveal: {
            text: 'One in twenty-four, about 0.042.',
            formal: '$12/288 = 1/24 \\approx 0.0417$, the rate column of Bra+24 Table 3.',
            caption: 'rate one in twenty-four',
            captionFormal: 'rate $12/288 = 1/24$',
            claims: [
              {
                key: 'b2Rate144',
                text: 'the gross code has rate 12/288, about 0.0417',
                from: {
                  recipe: 'bb-code',
                  params: { preset: 'gross' },
                },
                value: 'rate',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'A polynomial on the torus is a set of cells; multiplying by a monomial shifts it.',
          'The X checks use $A$ and $B$ side by side, the Z checks their transposes, swapped.',
          'The checks commute because $AB = BA$.',
          'The number of logical qubits is twice the dimension of the common kernel of $A$ and $B$.',
        ],
        equations: 'AB = BA',
        trap: 'Calling a weight-6 code local: the six qubits of a check lie far apart on the torus.',
        formal: {
          points: [
            '$H_X = [A \\mid B]$ and $H_Z = [B^T \\mid A^T]$ with $H_XH_Z^T = AB + BA = 0$ (Bra+24 Eqs. 1–2).',
            'Lemma 1: $k = 2\\dim(\\ker A \\cap \\ker B)$.',
            'Of the seven codes of Table 3 we compute $n$ and $k$ and prove $d = 6$ only for $n = 72$.',
          ],
          equations: 'k = 2\\dim(\\ker A \\cap \\ker B)',
          trap: 'Taking a printed distance as computed: only the 72-qubit code has a distance proved here.',
        },
      },
      play: [
        {
          id: 'b2-p-k',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'The toric code as a BB code',
          prompt: 'Take $A = 1 + x$ and $B = 1 + y$ on any torus. How many logical qubits does the code store?',
          answerFrom: {
            from: {
              recipe: 'bb-code',
              params: { preset: 'toric-3x3' },
            },
            value: 'k',
          },
          tolerance: 0,
          hints: [
            { text: 'This choice of $A$ and $B$ is the toric code of <<pp-b1-toric|Chapter B1>>.' },
            { text: 'The common kernel is the constant pattern.' },
            { text: 'Twice the dimension of the common kernel.' },
          ],
          walkthrough: [
            { text: 'Only the constant pattern is sent to zero by both $1+x$ and $1+y$.' },
            { text: 'So the dimension is 1 and $k = 2$.' },
          ],
        },
        {
          id: 'b2-p-ker',
          kind: 'numeric',
          tier: 'core',
          title: 'The common kernel',
          prompt: 'What is $\\dim(\\ker A \\cap \\ker B)$ for the gross code?',
          answerFrom: {
            from: {
              recipe: 'bb-code',
              params: { preset: 'gross' },
            },
            value: 'ker',
          },
          tolerance: 0,
          hints: [
            { text: 'Use Lemma 1: $k$ is twice this dimension.' },
            { text: 'The gross code stores 12 logical qubits.' },
            { text: 'Half of 12.' },
          ],
          walkthrough: [
            { text: 'Lemma 1 says $k = 2\\dim(\\ker A \\cap \\ker B)$.' },
            { text: 'With $k = 12$ the dimension is 6.' },
          ],
        },
        {
          id: 'b2-p-comm',
          kind: 'choice',
          tier: 'core',
          title: 'Why checks commute',
          prompt: 'Why do the X checks and the Z checks of a BB code commute?',
          options: [
            {
              text: 'The product of the two polynomials does not depend on their order: $AB = BA$.',
              correct: true,
              why: 'Then $H_XH_Z^T = AB + BA = 0$ over GF(2), so every X check and Z check overlap evenly.',
            },
            {
              text: 'Every check has weight six.',
              correct: false,
              why: 'The weight alone says nothing about overlaps.',
            },
            {
              text: 'The code lives on a torus.',
              correct: false,
              why: 'A torus is where the polynomials live, but commuting needs the algebra, not the shape.',
            },
            {
              text: 'The Z checks use the transposes.',
              correct: false,
              why: 'Transposes alone do not make them commute; the commuting ring does.',
            },
          ],
          hints: [
            {
              text: 'Write the overlap of an X check and a Z check as a sum of two products of polynomials.',
            },
            { text: 'The two products are $AB$ and $BA$.' },
            { text: 'Over GF(2), two equal terms add to zero.' },
          ],
          walkthrough: [
            { text: 'The overlap is $AB + BA$.' },
            { text: 'The ring is commutative, so $AB = BA$ and the sum is zero.' },
          ],
        },
      ],
    },
    {
      id: 'b2-gross',
      title: 'The gross code family',
      question: 'What is the gross code, and how is it measured?',
      source: {
        summary: 'The paper lays the gross code out as a toric code with long edges and measures it with a depth-8 cycle. Bravyi and coauthors print the order of the cycle and the polynomials. We test the order and match the two forms.',
        where: 'Bra+24 §4, §5 (Table 5); paper §2.1-2.2, A.1',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '11111100', b: '00001110' },
        tryThis: [
          'The strings are an X check and a Z check that share two qubits. The readout says “a ⊕ b = 11110010” and “differ in 5 places”.',
          'Press a·b: it says “a AND b = 00001100” and “a·b = 0”. Flip place 7 of b: the overlap drops to one qubit and the readout says “a·b = 1”, the sign of checks that would not commute.',
        ],
      },
      insight: 'The gross code is a toric code whose checks gain two long edges. One cycle of 8 rounds measures every check, and the order of the rounds, not the code, decides whether the readouts are right.',
      insightFormal: 'The gross code is $\\ell = 12$, $m = 6$, $[\\![144,12,12]\\!]$. The printed and torus polynomials differ by $(A\', B\') = (yA, xB)$. The depth-8 cycle is clash-free and sequentially equivalent, and $C$ cycles take $8C+1$ steps.',
      story: [
        {
          id: 'b2-gross:b1',
          phase: 'books',
          text: 'Give each cell two qubits and two checks. With $A = 1 + x$ and $B = 1 + y$ this is exactly the toric code of <<pp-b1-toric|Chapter B1>>: four short edges per check. The gross code adds two long edges per check, so $1/3$ of all its edges are long.',
          formal: 'Cell $(i,j)$ holds the qubits $L$ and $R$, an X check and a Z check (paper Fig. 3a). With $A = 1+x$ and $B = 1+y$ this is Kitaev’s lattice, under $L(i,j) = h(i,j)$ and $R(i,j) = v(i+1,j-1)$ in the edge names of <<pp-b1-toric|Chapter B1>> (computed). The gross code’s $A$ and $B$ give each check 4 local and 2 long edges: 288 long edges and 864 in all, so $1/3$ of the edges are long.',
          stage: {
            recipe: 'bb-code',
            params: {
              preset: 'gross',
              check: {
                kind: 'X',
                cell: { i: 0, j: 0 },
              },
              longEdges: true,
            },
          },
          caption: 'one X check of the gross code: four short edges and two long ones that wrap',
          captionFormal: 'one X check: 4 near edges and 2 long edges, labelled by their offsets',
          fidelity: ['qc-code-bb-layout'],
          claims: [
            {
              key: 'b2ToricIsBB',
              text: 'with A = 1 + x and B = 1 + y the code is the toric code',
              from: {
                recipe: 'bb-code',
                params: { preset: 'toric-3x3' },
              },
              value: 'toricIsBB',
            },
            {
              key: 'b2LocalEdges',
              text: 'each check has 4 local edges',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'localEdges',
            },
            {
              key: 'b2LongEdges',
              text: 'each check has 2 long edges',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'longEdges',
            },
            {
              key: 'b2LongTotal',
              text: 'the gross code has 288 long edges',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'longTotal',
            },
            {
              key: 'b2EdgeTotal',
              text: 'the gross code has 864 edges in all',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'edgeTotal',
            },
            {
              key: 'b2LongShare',
              text: 'a third of the edges of the gross code are long',
              from: {
                recipe: 'bb-code',
                params: { preset: 'gross' },
              },
              value: 'longShare',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Definition 1 and Lemma 4',
              why: 'The toric layout of a BB code.',
            },
          ],
        },
        {
          id: 'b2-gross:b2',
          phase: 'books',
          text: 'On a 12-by-6 torus there are 144 qubits and 144 checks, so 288 in all, storing 12 logical qubits with distance 12. The two-gross code is 12-by-12, with 288 data qubits and distance 18.',
          formal: 'The gross code has $\\ell = 12$, $m = 6$ and $[\\![144,12,12]\\!]$; the two-gross code has $\\ell = m = 12$ and $[\\![288,12,18]\\!]$ (Bra+24 Table 3). We compute $n$ and $k$ and report $d$. Each check has 6 edges, and each qubit sits in 6 checks.',
          stage: {
            recipe: 'bb-code',
            params: { preset: 'gross' },
          },
          caption: 'the gross code on its torus: 72 cells',
          captionFormal: 'the gross code on its $12\\times6$ torus: 72 cells of 4 marks',
          claims: [
            {
              key: 'b2K288',
              text: 'the two-gross code stores 12 logical qubits',
              from: {
                recipe: 'bb-code',
                params: { preset: 'two-gross' },
              },
              value: 'k',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Table 3',
              why: 'The parameters of the gross and two-gross codes.',
            },
          ],
        },
        {
          id: 'b2-gross:b3',
          phase: 'books',
          text: 'Bravyi et al. write $A = x^3 + y + y^2$. The torus picture writes $A = 1 + y + x^3y^{-1}$. Shift every L qubit up one step and every R qubit east one step, and the two are the same code.',
          formal: 'Take $(A, B)$ to $(A\', B\') = (yA, xB)$; since $y^3 = y^{-3}$ on $m = 6$, this turns the torus form into the printed form. The relabelling shifts the $L$ qubits by $y$ and the $R$ qubits by $x$, and then the rows of $H_X$ and $H_Z$ match as sets (computed). The two-gross code also needs $y \\mapsto y^7$, a relabelling of the rows of the torus. Without the shifts the two forms are different matrices.',
          stage: {
            recipe: 'bb-presentations',
            params: { code: 'gross' },
          },
          caption: 'the gross code in both forms, matched by the shifts',
          captionFormal: 'the gross code in both forms, matched by the shifts of the $L$ and $R$ qubits',
          derivation: {
            result: '(A\', B\') = (yA, xB)',
            ground: [
              {
                tex: 'A = x^3 + y + y^2',
                why: 'Bravyi and coauthors write $A$ as these three monomials.',
                view: {
                  recipe: 'bb-presentations',
                  params: { code: 'gross', step: 1 },
                },
                viewCaption: 'their $A$',
              },
              {
                tex: 'y(1 + y + x^3y^{-1}) = y + y^2 + x^3',
                why: 'Shifting every L qubit up one step multiplies the torus form of $A$ by $y$ and gives their form.',
                view: {
                  recipe: 'bb-presentations',
                  params: { code: 'gross', step: 2 },
                },
                viewCaption: 'after the shift',
              },
              {
                tex: '(A\', B\') = (yA, xB)',
                why: 'Shifting every R qubit east multiplies $B$ by $x$, and the rows of $H_X$ and $H_Z$ then match as sets.',
                view: {
                  recipe: 'bb-presentations',
                  params: { code: 'gross', step: 3 },
                },
                viewCaption: 'the other family',
              },
            ],
            formal: [
              {
                tex: 'A\' = yA',
                why: 'The $L$ qubits shift by $y$, which turns the torus form of $A$ into the printed form.',
                view: {
                  recipe: 'bb-presentations',
                  params: { code: 'gross', step: 2 },
                },
                viewCaption: 'after the shift',
              },
              {
                tex: '(A\', B\') = (yA, xB)',
                why: 'The $R$ qubits shift by $x$; since $y^3 = y^{-3}$ on $m = 6$ the printed $B$ appears, and the rows match as sets.',
                view: {
                  recipe: 'bb-presentations',
                  params: { code: 'gross', step: 3 },
                },
                viewCaption: 'the other family',
              },
            ],
          },
          claims: [
            {
              key: 'b2IsoGross',
              text: 'the two forms of the gross code match under the shifts',
              from: {
                recipe: 'bb-presentations',
                params: { code: 'gross' },
              },
              value: 'iso',
            },
            {
              key: 'b2IsoGrossNoShift',
              text: 'without the shifts the two forms of the gross code do not match',
              from: {
                recipe: 'bb-presentations',
                params: { code: 'gross' },
              },
              value: 'isoNoShift',
            },
            {
              key: 'b2IsoTwoGross',
              text: 'the two forms of the two-gross code match under the shifts and the row map',
              from: {
                recipe: 'bb-presentations',
                params: { code: 'two-gross' },
              },
              value: 'iso',
            },
            {
              key: 'b2IsoTwoGrossNoMap',
              text: 'without the row map the two forms of the two-gross code do not match',
              from: {
                recipe: 'bb-presentations',
                params: { code: 'two-gross' },
              },
              value: 'isoNoMap',
            },
          ],
          trail: [
            { ref: 'bra24', at: 'Table 3', why: 'The polynomials of the printed form.' },
          ],
        },
        {
          id: 'b2-gross:b4',
          phase: 'books',
          text: 'One cycle measures every check in 8 rounds. No qubit is asked twice in a round, and neighbouring checks agree on their order. $C$ cycles take $8C+1$ steps: the $+1$ is the extra step 0 that prepares the Z check qubits.',
          formal: 'Bra+24 §5, Table 5: X acts on $L$ through the monomials of $A$ in the order $A_2, A_1, A_3$ (rounds 2, 6, 7) and on $R$ through $B_2, B_1, B_3$ (rounds 3 to 5). Z reads $R$ through $A_1^T, A_3^T, A_2^T$ (rounds 1, 2, 6) and $L$ through $B_1^T, B_2^T, B_3^T$ (rounds 3 to 5); Z is read in round 7 and X in round 8. For the gross code in Bravyi’s form there are no clashes, 0 bad pairs of 5184 and overlaps of at most 2 qubits, and two cycles on a stabilizer tableau give silent detectors. A lone cycle takes 9 steps: the 8 rounds and, at step 0, the initialisation of the Z check qubits (paper p. 10).',
          stage: {
            recipe: 'bb-schedule',
            params: { preset: 'gross', variant: 'printed', round: 3 },
          },
          caption: 'round 3 of the cycle on the gross code: the active edges',
          captionFormal: 'round 3 of the depth-8 cycle: the edges in use, from each check toward its qubit',
          fidelity: ['qc-code-bb-cycle'],
          claims: [
            {
              key: 'b2T5Conflict',
              text: 'no qubit is used twice in one round',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed' },
              },
              value: 'conflict',
            },
            {
              key: 'b2T5BadPairs',
              text: 'no X and Z pair is read out of order',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed' },
              },
              value: 'badPairs',
            },
            {
              key: 'b2T5Pairs',
              text: 'there are 5184 pairs of an X check and a Z check',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed' },
              },
              value: 'pairs',
            },
            {
              key: 'b2T5MaxOverlap',
              text: 'two checks share at most 2 qubits',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed' },
              },
              value: 'maxOverlap',
            },
            {
              key: 'b2T5TableauClean',
              text: 'two cycles on a tableau give silent detectors',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed', tableau: true },
              },
              value: 'tableauClean',
            },
            {
              key: 'b2Cycles1',
              text: 'a lone cycle takes 9 steps, which is 8C+1 at C = 1',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed', cycles: 1 },
              },
              value: 'steps',
            },
            {
              key: 'b2Cycles10',
              text: 'ten cycles take 81 steps',
              from: {
                recipe: 'bb-schedule',
                params: { preset: 'gross', variant: 'printed', cycles: 10 },
              },
              value: 'steps',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 5, Table 5',
              why: 'The order in which the X and Z checks touch their qubits in each of the 8 rounds.',
            },
          ],
        },
        {
          id: 'b2-gross:b5',
          phase: 'clue',
          text: 'Let the Z checks read their qubits of types $A_1^T$ and $A_2^T$ in each other’s rounds. Is the cycle still correct?',
          formal: 'Swap the rounds of $A_1^T$ and $A_2^T$ for the Z reads. Count the clashing X and Z pairs, and run two cycles on a tableau.',
          stage: {
            recipe: 'bb-schedule',
            params: { preset: 'gross', variant: 'printed', round: 1 },
          },
          caption: 'the printed cycle, round 1',
          captionFormal: 'the printed cycle, round 1',
          reveal: {
            text: 'No. 432 of the 5184 pairs now read in clashing order, and a simulation fires detectors that should stay silent.',
            formal: '432 bad pairs of 5184, and two cycles on the 288-qubit tableau give non-zero detectors. Sequential equivalence is a property of the schedule, not of the code.',
            caption: 'the swapped cycle, round 1',
            captionFormal: 'the swapped cycle, round 1',
            stage: {
              recipe: 'bb-schedule',
              params: { preset: 'gross', variant: 'swap-z-reads', round: 1 },
            },
            claims: [
              {
                key: 'b2T5SwapBad',
                text: 'swapping the two Z reads leaves 432 pairs out of order',
                from: {
                  recipe: 'bb-schedule',
                  params: { preset: 'gross', variant: 'swap-z-reads' },
                },
                value: 'badPairs',
              },
              {
                key: 'b2T5SwapTableauBad',
                text: 'the swapped cycle fires detectors on a tableau',
                from: {
                  recipe: 'bb-schedule',
                  params: { preset: 'gross', variant: 'swap-z-reads', tableau: true },
                },
                value: 'tableauBad',
              },
            ],
          },
        },
        {
          id: 'b2-gross:b6',
          phase: 'clue',
          text: 'How many steps do 12 cycles take?',
          formal: 'Evaluate $8C+1$ at $C = 12$.',
          stage: {
            recipe: 'bb-schedule',
            params: { preset: 'gross', variant: 'printed', cycles: 12, round: 8 },
          },
          caption: 'the last round of a cycle',
          captionFormal: 'the last round of a cycle',
          reveal: {
            text: '97.',
            formal: '$8\\cdot12 + 1 = 97$, the count the paper states as $8C+1$ timesteps for $C$ cycles.',
            caption: 'twelve cycles, 97 steps',
            captionFormal: '$C = 12$ gives 97 steps',
            claims: [
              {
                key: 'b2Cycles12',
                text: 'twelve cycles take 97 steps',
                from: {
                  recipe: 'bb-schedule',
                  params: { preset: 'gross', variant: 'printed', cycles: 12 },
                },
                value: 'steps',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'The gross code is a toric code with two extra long edges on each check.',
          'It has 144 qubits, 144 checks and 12 logical qubits.',
          'The two ways of writing its polynomials are the same code after a shift.',
          'A cycle of 8 rounds measures every check, and the order of the rounds matters.',
        ],
        equations: '8C + 1',
        trap: 'Calling the two polynomial forms two codes: they differ only by a relabelling.',
        formal: {
          points: [
            'With $A = 1+x$, $B = 1+y$ the lattice is Kitaev’s; the gross code adds 2 long edges per check (288 in all).',
            '$(A\', B\') = (yA, xB)$ relates the torus form to the printed one.',
            'Table 5 gives a clash-free, sequentially equivalent cycle; $C$ cycles take $8C+1$ steps.',
          ],
          equations: '(A\', B\') = (yA, xB)',
          trap: 'Treating a swapped schedule as harmless: it fails the parity rule even though the code is unchanged.',
        },
      },
      play: [
        {
          id: 'b2-g-edges',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Edges of a check',
          prompt: 'How many edges does one check of a BB code have?',
          answerFrom: {
            from: {
              recipe: 'bb-code',
              params: { preset: 'gross' },
            },
            value: 'checkWeight',
          },
          tolerance: 0,
          hints: [
            { text: 'Each edge joins the check to one qubit it acts on.' },
            { text: 'The check weight counts the qubits.' },
            { text: 'A BB code has check weight 6.' },
          ],
          walkthrough: [
            { text: 'An edge joins a check to each qubit it acts on.' },
            { text: 'Every check acts on 6 qubits, so it has 6 edges.' },
          ],
        },
        {
          id: 'b2-g-steps',
          kind: 'numeric',
          tier: 'core',
          title: 'Steps for ten cycles',
          prompt: 'How many steps do 10 cycles take?',
          answerFrom: {
            from: {
              recipe: 'bb-schedule',
              params: { preset: 'gross', variant: 'printed', cycles: 10 },
            },
            value: 'steps',
          },
          tolerance: 0,
          hints: [
            { text: 'A cycle has 8 rounds.' },
            { text: 'The paper counts $8C+1$ steps for $C$ cycles.' },
            { text: 'Put $C = 10$.' },
          ],
          walkthrough: [
            { text: 'The step count is $8C+1$.' },
            { text: 'With $C = 10$ that is 81.' },
          ],
        },
        {
          id: 'b2-g-form',
          kind: 'choice',
          tier: 'core',
          title: 'Two forms',
          prompt: 'Do $x^3+y+y^2$ and $1+y+x^3y^{-1}$ give the same matrices?',
          options: [
            {
              text: 'No: they differ by a relabelling of the qubits.',
              correct: true,
              why: 'Shifting the L qubits by $y$ turns one into the other, but as plain matrices they are different.',
            },
            {
              text: 'Yes: the polynomials are equal.',
              correct: false,
              why: 'They are different polynomials, since one is $y$ times the other.',
            },
            {
              text: 'Yes: a shift never changes a code.',
              correct: false,
              why: 'A shift changes the matrices; it only maps one code onto the other.',
            },
            {
              text: 'No: they are two different codes.',
              correct: false,
              why: 'After the relabelling the checks match one for one, so it is the same code.',
            },
          ],
          hints: [
            { text: 'Multiply the torus form by $y$.' },
            { text: 'The result is the printed form.' },
            { text: 'A relabelling of the qubits leaves the code as it was.' },
          ],
          walkthrough: [
            { text: '$y(1 + y + x^3y^{-1}) = y + y^2 + x^3$.' },
            { text: 'So the forms differ by the shift $y$: different matrices, one code.' },
          ],
        },
      ],
    },
    {
      id: 'b2-automorphisms',
      title: 'Shifts as logical gates',
      question: 'What do symmetries of the code do to the data?',
      source: {
        summary: 'Bravyi and coauthors show that each shift of the torus acts on the logical qubits as a circuit of CNOT gates. The paper uses the 36 resulting actions. We compute the tables and their group.',
        where: 'Bra+24 §9.2; paper A.2',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '10110000', b: '01011000' },
        tryThis: [
          'The second string is the first one slid by one place. The readout says “a ⊕ b = 11101000” and “differ in 4 places”.',
          'Press a·b: it says “a AND b = 00010000” and “a·b = 1”. A slide changes where a pattern overlaps; a symmetry of a code is a slide that maps every check to a check.',
        ],
      },
      insight: 'Slides of the torus are symmetries of the gross code. Each acts on the 12 logical qubits as a fixed table, and the 72 slides make 36 different tables.',
      insightFormal: 'The 72 shifts are code automorphisms; each acts on the logical $X$ classes by an invertible $12\\times12$ matrix over GF(2), a CNOT circuit. They generate a group of order 36, with $M_x$ and $M_y$ of order 6.',
      story: [
        {
          id: 'b2-automorphisms:b1',
          phase: 'books',
          text: 'A [[pp-code-automorphism|code automorphism]] reshuffles the qubits so that every check lands on a check of its own kind. Slide every qubit of the gross code $a$ steps east and $b$ steps north: all 72 slides are symmetries. Swapping two qubits is not.',
          formal: 'A permutation of the qubits is a [[pp-code-automorphism|code automorphism]] if it permutes the rows of $H_X$ among themselves and those of $H_Z$ among themselves. All 72 shifts $x^ay^b$ of the gross code are (computed); a swap of two qubits is not. Bra+24 §9.2: these shifts form a group isomorphic to the monomials of the ring, of order $\\ell m = 72$.',
          stage: {
            recipe: 'bb-shift',
            params: {
              preset: 'gross',
              shift: { a: 1, b: 0 },
            },
          },
          caption: 'a shift of the gross code: every check lands on a check',
          captionFormal: 'the shift $x$ as arrows on the torus; the readout says it keeps the checks',
          introduces: ['pp-code-automorphism'],
          fidelity: ['qc-code-bb-layout'],
          claims: [
            {
              key: 'b2ShiftsPreserve',
              text: 'all 72 shifts keep the checks',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'preservedAll',
            },
            {
              key: 'b2SwapPreserves',
              text: 'swapping two qubits does not keep the checks',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'swapPreserves',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 9.2',
              why: 'The shifts of the torus are symmetries of the code.',
            },
          ],
        },
        {
          id: 'b2-automorphisms:b2',
          phase: 'books',
          text: 'A shift moves the X-logicals among themselves. A 12-by-12 table of 0s and 1s, written $M_x$ for the slide $x$ and $M_y$ for $y$, says which. The table is invertible, and a circuit of CNOT gates on the logical qubits does exactly this. The paper prints the same half of the table twice along the diagonal; ours has the mirror image there (see <<pp-p1-idle-shift|Lecture P1>>).',
          formal: 'A check-preserving permutation acts on the 12 logical $X$ classes as an invertible $12\\times12$ matrix $M$ over GF(2). On the logical qubits it acts as a circuit of CNOT gates that sends the bit string $v$ to $Mv$, up to a Pauli (Bra+24 §9.2). In the paper’s basis $M_x$ has 34 ones; $M_x$ and $M_y$ both have order 6. The count of ones depends on the basis, the orders do not. The paper prints the same block twice; our table has its transpose below (see <<pp-p1-idle-shift|Lecture P1>>).',
          stage: {
            recipe: 'bb-shift',
            params: {
              preset: 'gross',
              shift: { a: 1, b: 0 },
              matrix: true,
            },
          },
          caption: 'the shift $x$ and its table of 12 by 12',
          captionFormal: 'the shift $x$ and its $12\\times12$ table in the paper’s logical basis (its lower block is the transpose of the printed one)',
          fidelity: ['qc-bits-basis-dependent'],
          claims: [
            {
              key: 'b2OrderMx',
              text: 'the table of the shift x has order 6',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'orderMx',
            },
            {
              key: 'b2OrderMy',
              text: 'the table of the shift y has order 6',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'orderMy',
            },
            {
              key: 'b2MxOnes',
              text: 'the table of the shift x has 34 ones in the paper basis',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'onesX',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 9.2',
              why: 'Automorphisms act as CNOT circuits on the logical qubits.',
            },
          ],
        },
        {
          id: 'b2-automorphisms:b3',
          phase: 'books',
          text: 'There are 72 shifts but only $72/2 = 36$ different effects: the shift $x^6$ does nothing to the logical qubits (the paper’s A.2, p. 47). The tables of $x$ and $y$ generate a group $G$ with 36 elements. The table of $x^6$ is the identity $I$.',
          formal: 'Among the 72 shifts there are 36 distinct logical actions, and the identity is reached by $1$ and by $x^6$ (the paper’s A.2, p. 47). Bra+24 §9.2 says otherwise: the paper and our computation find $x^6$ trivial. The group $G$ generated by $M_x$ and $M_y$ has $72/2 = 36$ elements, whatever the basis. Since $y^6 = 1$ on this torus, the shifts that act trivially form the group generated by $x^6$.',
          stage: {
            recipe: 'bb-shift',
            params: {
              preset: 'gross',
              shift: { a: 0, b: 1 },
              group: true,
            },
          },
          caption: 'the 72 shifts: a 1 marks a shift that does nothing',
          captionFormal: 'the 72 shifts as a $6\\times12$ table; the ones mark the trivial shifts',
          derivation: {
            result: '\\#G = 72 \\div 2 = 36',
            ground: [
              {
                tex: '12 \\times 6 = 72',
                why: 'The torus gives 72 shifts $x^ay^b$.',
                view: {
                  recipe: 'bb-shift',
                  params: {
                    preset: 'gross',
                    shift: { a: 1, b: 0 },
                  },
                },
                viewCaption: 'one shift',
              },
              {
                tex: 'M_{x^6} = I',
                why: 'Sliding half way round the 12-cell direction gives the identity table: the logical qubits do not notice.',
                view: {
                  recipe: 'bb-shift',
                  params: {
                    preset: 'gross',
                    shift: { a: 6, b: 0 },
                  },
                },
                viewCaption: 'half way round: nothing happens',
              },
              {
                tex: '\\#G = 72 \\div 2 = 36',
                why: 'Two shifts act as the identity, so 72 shifts make 36 different effects.',
                view: {
                  recipe: 'bb-shift',
                  params: {
                    preset: 'gross',
                    shift: { a: 0, b: 1 },
                    group: true,
                  },
                },
                viewCaption: 'the 36 classes',
              },
            ],
            formal: [
              {
                tex: 'M_{x^6} = I',
                why: 'The table of $x^6$ is the identity (computed): one of the two trivial shifts.',
                view: {
                  recipe: 'bb-shift',
                  params: {
                    preset: 'gross',
                    shift: { a: 6, b: 0 },
                  },
                },
                viewCaption: 'half way round: nothing happens',
              },
              {
                tex: '\\#G = 72 \\div 2 = 36',
                why: 'The shifts act through the quotient by the group generated by $x^6$, which has order 2, so $G$ has 36 elements.',
                view: {
                  recipe: 'bb-shift',
                  params: {
                    preset: 'gross',
                    shift: { a: 0, b: 1 },
                    group: true,
                  },
                },
                viewCaption: 'the 36 classes',
              },
            ],
          },
          claims: [
            {
              key: 'b2DistinctShifts',
              text: 'the 72 shifts have 36 distinct logical actions',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'distinct',
            },
            {
              key: 'b2TrivialShifts',
              text: 'two of the shifts act as the identity',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'trivial',
            },
            {
              key: 'b2GroupOrder',
              text: 'the group of logical actions has 36 elements',
              from: {
                recipe: 'bb-shift',
                params: {
                  preset: 'gross',
                  shift: { a: 1, b: 0 },
                },
              },
              value: 'groupOrder',
            },
          ],
          trail: [
            {
              ref: 'bra24',
              at: 'Section 9.2',
              why: 'The group of automorphisms and its action on the logical qubits; this section calls every non-identity shift a nontrivial gate, but the paper’s appendix A.2 and our computation find the shift by x^6 trivial.',
            },
          ],
        },
        {
          id: 'b2-automorphisms:b4',
          phase: 'clue',
          text: 'Does shifting the gross code by $x^6$ change the logical qubits?',
          formal: 'Is $M_{x^6}$ the identity?',
          stage: {
            recipe: 'bb-shift',
            params: {
              preset: 'gross',
              shift: { a: 6, b: 0 },
              matrix: true,
            },
          },
          caption: 'the shift $x^6$',
          captionFormal: 'the shift $x^6$ and its table',
          reveal: {
            text: 'It does not. $x^6$ slides every qubit half way round the 12-cell direction, and the logical table is the identity.',
            formal: '$M_{x^6} = I$ (computed): one of the two trivial shifts.',
            caption: 'the table of $x^6$ is the identity',
            captionFormal: 'the table of $x^6$ is $I$',
          },
        },
      ],
      review: {
        points: [
          'A code automorphism reshuffles the qubits and sends every check to a check.',
          'All 72 slides of the gross torus are symmetries; swapping two qubits is not.',
          'A slide acts on the logical qubits as a table of 0s and 1s.',
          'The 72 slides make 36 different tables.',
        ],
        equations: '\\#G = 36',
        trap: 'Swapping two qubits and hoping for a gate: only symmetries of the code act on the logical qubits.',
        formal: {
          points: [
            'An automorphism permutes the rows of $H_X$ and of $H_Z$ (Bra+24 §9.2).',
            'It acts on the logical $X$ classes as an invertible $M$ over GF(2), a CNOT circuit.',
            '$M_x$ and $M_y$ have order 6 and generate a group of order 36; $x^6$ acts trivially.',
          ],
          equations: '\\#G = 36',
          trap: 'Reading the number of ones of a table as basis-free: it depends on the basis, the orders and the group do not.',
        },
      },
      play: [
        {
          id: 'b2-a-count',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Counting the slides',
          prompt: 'How many shifts $x^ay^b$ does the gross torus have, all of which keep the code?',
          answerFrom: {
            from: {
              recipe: 'bb-shift',
              params: {
                preset: 'gross',
                shift: { a: 1, b: 0 },
              },
            },
            value: 'preservedAll',
          },
          tolerance: 0,
          hints: [
            { text: 'The torus has 12 cells in one direction and 6 in the other.' },
            { text: 'Each pair $(a, b)$ is one shift.' },
            { text: 'Multiply 12 by 6.' },
          ],
          walkthrough: [
            { text: '$a$ runs over 12 values and $b$ over 6.' },
            { text: 'So there are $12\\times6 = 72$ shifts.' },
          ],
        },
        {
          id: 'b2-a-order',
          kind: 'numeric',
          tier: 'core',
          title: 'The order of a table',
          prompt: 'What is the order of the table $M_x$ of the shift $x$: the least power of $M_x$ that equals the identity?',
          answerFrom: {
            from: {
              recipe: 'bb-shift',
              params: {
                preset: 'gross',
                shift: { a: 1, b: 0 },
              },
            },
            value: 'orderMx',
          },
          tolerance: 0,
          hints: [
            { text: 'The shift $x$ itself has order 12 on the torus.' },
            { text: 'The table can have a smaller order because $x^6$ acts as the identity.' },
            { text: 'The order divides 6.' },
          ],
          walkthrough: [
            { text: '$x^6$ acts as the identity, so $M_x^6 = I$.' },
            { text: 'The computation finds no smaller power: the order is 6.' },
          ],
        },
        {
          id: 'b2-a-group',
          kind: 'numeric',
          tier: 'core',
          title: 'The size of the group',
          prompt: 'How many different tables do the 72 shifts produce?',
          answerFrom: {
            from: {
              recipe: 'bb-shift',
              params: {
                preset: 'gross',
                shift: { a: 1, b: 0 },
              },
            },
            value: 'groupOrder',
          },
          tolerance: 0,
          hints: [
            { text: 'Two shifts act as the identity.' },
            { text: 'Shifts that differ by $x^6$ give the same table.' },
            { text: 'Divide 72 by 2.' },
          ],
          walkthrough: [
            { text: 'Pairs of shifts that differ by $x^6$ give the same table.' },
            { text: 'So $72/2 = 36$ different tables.' },
          ],
        },
      ],
    },
    {
      id: 'b2-decoding',
      title: 'Decoding sparse codes: BP, OSD, Relay-BP',
      question: 'How does a decoder find the flips, and when does it stall?',
      source: {
        summary: 'Roffe and coauthors pass beliefs along the Tanner graph and, when that stalls, solve exactly on the most suspected bits. Müller and coauthors rerun BP as a relay. We run the first two on small codes.',
        where: 'Rof+20 §V; BE21 §VI.3; Mül+25 abstract',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '0001000', b: '0010000' },
        tryThis: [
          'Read a as the true flip and b as a wrong guess one place along. The readout says “a ⊕ b = 0011000” and “differ in 2 places”.',
          'Press a·b: it says “a AND b = 0000000” and “a·b = 0”. A decoder is right when its guess differs from the error by nothing, or by a stabilizer.',
        ],
      },
      insight: 'Belief propagation lets checks and bits trade beliefs until the syndrome is met. It stalls when two equal errors give one syndrome, and a last exact solve on the most suspected bits repairs it.',
      insightFormal: 'Min-sum BP starts at $\\lambda = \\ln\\frac{1-p}{p}$ and stops when the hard decision meets the syndrome. A degenerate error splits the beliefs and BP cycles; OSD-0 solves $H_Se_S = s$ on the first independent columns in the order of the totals.',
      story: [
        {
          id: 'b2-decoding:b1',
          phase: 'books',
          text: 'Every check tells its bits what it believes about them, and every bit tells its checks. After a few rounds each bit says flipped or fine. Each bit starts from a belief $\\lambda$ set by how likely a flip is: about 2.944 for one flip in twenty. With [[pp-bp-decoding|belief propagation]] on a repetition code with one flip, one round is enough.',
          formal: '[[pp-bp-decoding|Belief propagation]] on the Tanner graph (Rof+20 §V, Eqs. 6–7) starts every bit at the channel ratio $\\lambda = \\ln\\frac{1-p}{p}$, which is 2.944 for a flip chance of one in twenty and 4.595 for one in a hundred. Checks and bits pass min-sum messages (the product of signs and the least size). A bit is decided as flipped when its total is at most 0, and the run stops when the syndrome matches or after $n$ rounds. On seven bits with one flip at bit 3 it stops after round 1, with total $-\\lambda$ at bit 3. This is plain min-sum with no scaling; Algorithm 1 of Rof+20’s Appendix C scales the messages by a factor that grows with the round, which we leave out.',
          stage: {
            recipe: 'bp-decode',
            params: {
              code: 'rep7',
              error: [3],
              p: 0.05,
              iter: 1,
            },
          },
          caption: 'BP on a repetition code: round 1 already names bit 3',
          captionFormal: 'min-sum BP on seven bits with one flip: round 1',
          introduces: ['pp-bp-decoding'],
          fidelity: ['qc-code-bp-plain'],
          claims: [
            {
              key: 'b2Llr',
              text: 'the channel ratio at flip chance one in twenty is about 2.944',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'rep7',
                  error: [3],
                  p: 0.05,
                  iter: 1,
                },
              },
              value: 'llr',
            },
            {
              key: 'b2Llr001',
              text: 'the channel ratio at flip chance one in a hundred is about 4.595',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'rep7',
                  error: [3],
                  p: 0.01,
                  iter: 1,
                },
              },
              value: 'llr',
            },
            {
              key: 'b2BpRepIters',
              text: 'BP finds the single flip in 1 round',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'rep7',
                  error: [3],
                  p: 0.05,
                  iter: 7,
                },
              },
              value: 'iterations',
            },
          ],
          trail: [
            {
              ref: 'rof20',
              at: 'Section V, Eqs. 6 and 7',
              why: 'Marginals, the hard decision and the stopping rule.',
            },
            {
              ref: 'be21',
              at: 'Section VI.3',
              why: 'Belief propagation among the decoders for quantum LDPC codes.',
            },
          ],
        },
        {
          id: 'b2-decoding:b2',
          phase: 'books',
          text: 'Two flips at one corner of the toric code, east and north, have a twin: west and south, with the same lit checks. BP cannot choose. It flags all four edges, and four flips light nothing.',
          formal: 'On the $3\\times3$ torus, X errors on $h(0,0)$ and $v(0,0)$ light two Z checks. The other two edges of the star light the same two, and the two errors differ by the star, a stabilizer. Min-sum at a flip chance of one in twenty gives all four star edges the total $-\\lambda$, so the estimate has weight 4 and syndrome 0. The hard weight runs 0, 4, 6, 0, 0, 4, 6, 0 and 18 rounds never converge. $H_Z$ has no four-cycles, so degeneracy is the cause (Rof+20 §V).',
          stage: {
            recipe: 'bp-decode',
            params: {
              code: 'toric3',
              error: [0, 9],
              p: 0.05,
              iter: 2,
            },
          },
          caption: 'round 2: all four edges of the star flagged',
          captionFormal: 'min-sum BP on the $3\\times3$ torus, round 2: the four star edges flagged',
          fidelity: ['qc-code-bp-engine'],
          derivation: {
            result: 'w_1, w_2, w_3, w_4 = 0, 4, 6, 0',
            ground: [
              {
                tex: 'w_1 = 0',
                why: 'In round 1 nobody is flagged: every bit still trusts the channel.',
                view: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [0, 9],
                    p: 0.05,
                    iter: 1,
                  },
                },
                viewCaption: 'round 1',
              },
              {
                tex: 'w_2 = 4',
                why: 'In round 2 the four star edges are flagged, each believing the error is its own.',
                view: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [0, 9],
                    p: 0.05,
                    iter: 2,
                  },
                },
                viewCaption: 'round 2',
              },
              {
                tex: 'w_1, w_2, w_3, w_4 = 0, 4, 6, 0',
                why: 'In round 3 six edges are flagged and in round 4 none: the flags cycle and the syndrome is never met.',
                view: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [0, 9],
                    p: 0.05,
                    iter: 3,
                  },
                },
                viewCaption: 'round 3',
              },
            ],
            formal: [
              {
                tex: 'w_2 = 4',
                why: 'By symmetry the messages from the lit checks to the star edges are equal, so all four edges are flagged together.',
                view: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [0, 9],
                    p: 0.05,
                    iter: 2,
                  },
                },
                viewCaption: 'round 2',
              },
              {
                tex: 'w_1, w_2, w_3, w_4 = 0, 4, 6, 0',
                why: 'The hard weight $w_t$ cycles with period 4 and the syndrome is never met.',
                view: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [0, 9],
                    p: 0.05,
                    iter: 3,
                  },
                },
                viewCaption: 'round 3',
              },
            ],
          },
          claims: [
            {
              key: 'b2BpToricConverged',
              text: 'BP does not converge on the star pair',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 18,
                },
              },
              value: 'converged',
            },
            {
              key: 'b2BpToricHardWeight',
              text: 'in round 2 the estimate has weight 4',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 2,
                },
              },
              value: 'hardWeight',
            },
            {
              key: 'b2BpStarLlr',
              text: 'after 18 rounds each star edge has the total minus the channel ratio',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 18,
                },
              },
              value: 'starLlr',
            },
            {
              key: 'b2AltWeight',
              text: 'the twin error has weight 2',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 2,
                },
              },
              value: 'altWeight',
            },
            {
              key: 'b2FourCycles',
              text: 'the Z check matrix has no four-cycles',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 2,
                },
              },
              value: 'fourCycles',
            },
          ],
          trail: [
            {
              ref: 'rof20',
              at: 'Section V',
              why: 'Degenerate errors split the beliefs and BP stalls.',
            },
          ],
        },
        {
          id: 'b2-decoding:b3',
          phase: 'books',
          text: 'Sort the bits by how strongly BP suspects them. Take the most suspected ones that are independent as far as the checks go, and solve exactly for them, taking the rest to be fine. This is [[pp-osd|ordered-statistics decoding]]. The answer always has the right syndrome.',
          formal: '[[pp-osd|OSD-0]] (Rof+20 §V) orders the bits by total, takes the first $\\mathrm{rank}\\,H_Z = 8$ independent columns $S$, solves $H_Se_S = s$ and sets every other bit to 0. Here it returns weight 2 with the syndrome met. The answer differs from the true error by nothing (ties broken low) or by the whole star (ties broken high), a stabilizer either way. OSD-CS, a wider search, is reported.',
          stage: {
            recipe: 'bp-decode',
            params: {
              code: 'toric3',
              error: [0, 9],
              p: 0.05,
              iter: 18,
              osd: true,
            },
          },
          caption: 'OSD-0 after BP: two edges, the right checks lit',
          captionFormal: 'OSD-0 after 18 rounds of BP on the $3\\times3$ torus',
          introduces: ['pp-osd'],
          fidelity: ['qc-code-bp-engine'],
          claims: [
            {
              key: 'b2OsdWeight',
              text: 'OSD-0 returns an error of weight 2',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 18,
                  osd: true,
                },
              },
              value: 'osdWeight',
            },
            {
              key: 'b2OsdValid',
              text: 'the OSD-0 answer has the right syndrome',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 18,
                  osd: true,
                },
              },
              value: 'osdValid',
            },
            {
              key: 'b2OsdHighStab',
              text: 'with ties broken high the answer differs from the error by a stabilizer',
              from: {
                recipe: 'bp-decode',
                params: {
                  code: 'toric3',
                  error: [0, 9],
                  p: 0.05,
                  iter: 18,
                  osd: true,
                  tie: 'high',
                },
              },
              value: 'osdDiffStabilizer',
            },
          ],
          trail: [
            { ref: 'rof20', at: 'Section V', why: 'OSD-0 and OSD-CS.' },
          ],
          reported: [
            {
              id: 'rof20-osdcs',
              text: 'the OSD-CS variant searches further, with its search depth set to 60',
              value: '60',
              source: 'rof20',
              at: { kind: 'section', label: 'V' },
            },
          ],
        },
        {
          id: 'b2-decoding:b4',
          phase: 'books',
          text: 'The paper uses a newer decoder, Relay-BP. It reruns BP in a relay with different memory strengths, some of them negative. It is a lightweight message-passing decoder, like BP.',
          formal: 'Reported, from the abstract of Müller et al. only: BP with disordered memory strengths, some negative, run as a relay of reruns. It is reported to beat BP with OSD-CS on BB codes and to be comparable to minimum-weight matching on surface codes. The abstract calls it lightweight and mentions FPGA or ASIC implementations. We give no internals and no numbers.',
          stage: {
            recipe: 'bp-decode',
            params: {
              code: 'toric3',
              error: [0, 9],
              p: 0.05,
              iter: 3,
            },
          },
          caption: 'the stall of plain BP that a relay is meant to escape',
          captionFormal: 'plain BP on the star pair, round 3: the stall a relay is meant to escape',
          trail: [
            {
              ref: 'mul25',
              at: 'Abstract',
              why: 'Why the paper’s error rates rest on this decoder.',
            },
          ],
          reported: [
            {
              id: 'mul25-relay',
              text: 'Relay-BP is reported to beat BP with OSD-CS on BB codes and be comparable to matching on surface codes',
              value: 'abstract, no numbers',
              source: 'mul25',
              at: { kind: 'section', label: 'abstract' },
            },
          ],
        },
        {
          id: 'b2-decoding:b5',
          phase: 'clue',
          text: 'Does BP also stall on a single flipped edge of the same torus?',
          formal: 'Run min-sum for one edge error on the $3\\times3$ torus.',
          stage: {
            recipe: 'bp-decode',
            params: {
              code: 'toric3',
              error: [4],
              p: 0.05,
              iter: 1,
            },
          },
          caption: 'one flipped edge',
          captionFormal: 'min-sum BP for one edge error, round 1',
          reveal: {
            text: 'No. It converges in one round and names the edge. A lone flip has no twin.',
            formal: 'It converges after round 1 with the estimate equal to the flipped edge; the stall needs degeneracy.',
            caption: 'round 1 names the edge',
            captionFormal: 'round 1: the estimate is the flipped edge',
            claims: [
              {
                key: 'b2BpSingleIters',
                text: 'BP finds a single flipped edge in 1 round',
                from: {
                  recipe: 'bp-decode',
                  params: {
                    code: 'toric3',
                    error: [4],
                    p: 0.05,
                    iter: 18,
                  },
                },
                value: 'iterations',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'Belief propagation passes beliefs between checks and bits until the syndrome is met.',
          'It names a single flip in one round.',
          'Two equal errors with one syndrome split its beliefs, and it cycles.',
          'OSD-0 solves exactly on the most suspected independent bits and always meets the syndrome.',
        ],
        equations: '\\lambda',
        trap: 'Blaming short loops for the stall: the check matrix has no four-cycles, and degeneracy is the cause.',
        formal: {
          points: [
            'Min-sum BP starts at $\\lambda = \\ln\\frac{1-p}{p}$ and decides a bit as flipped when its total is at most 0 (Rof+20 Eqs. 6–7).',
            'On the star pair the hard weight cycles 0, 4, 6, 0 and the syndrome is never met.',
            'OSD-0 returns weight 2, differing from the true error by a stabilizer.',
          ],
          equations: '\\lambda = \\ln\\frac{1-p}{p}',
          trap: 'Treating this plain min-sum as the paper’s decoder: Relay-BP is a different, reported method.',
        },
      },
      play: [
        {
          id: 'b2-d-llr',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'The channel ratio',
          prompt: 'What is $\\lambda = \\ln\\frac{1-p}{p}$ at a flip chance $p = 0.01$? Give a decimal.',
          answerFrom: {
            from: {
              recipe: 'bp-decode',
              params: {
                code: 'rep7',
                error: [3],
                p: 0.01,
                iter: 1,
              },
            },
            value: 'llr',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Put $p = 0.01$ into $(1-p)/p$ first.' },
            { text: '$(1-p)/p = 0.99/0.01 = 99$.' },
            { text: 'Take the natural logarithm of 99.' },
          ],
          walkthrough: [
            { text: '$(1-p)/p = 99$.' },
            { text: '$\\ln 99$ is about 4.595.' },
          ],
        },
        {
          id: 'b2-d-split',
          kind: 'choice',
          tier: 'core',
          title: 'Why BP stalls',
          prompt: 'Why does BP stall on the star pair of the toric code?',
          options: [
            {
              text: 'Two errors of equal weight give the same syndrome.',
              correct: true,
              why: 'The star is a stabilizer, so the error and its twin look the same to every check, and BP splits its belief over all four edges.',
            },
            {
              text: 'The check matrix has many short loops.',
              correct: false,
              why: 'It has no four-cycles; loops are not the cause here.',
            },
            {
              text: 'The flip chance is too small.',
              correct: false,
              why: 'A different chance changes the numbers, not the tie between the two errors.',
            },
            {
              text: 'BP needs more than 18 rounds.',
              correct: false,
              why: 'The flags cycle with period 4, so more rounds do not help.',
            },
          ],
          hints: [
            { text: 'Find another error with the same lit checks.' },
            { text: 'The other half of the star has the same weight.' },
            {
              text: 'A tie between equally likely errors cannot be broken by messages that are symmetric.',
            },
          ],
          walkthrough: [
            { text: 'The twin error has the same syndrome and the same weight.' },
            { text: 'The messages are symmetric between the two, so BP cannot choose.' },
          ],
        },
        {
          id: 'b2-d-osd',
          kind: 'numeric',
          tier: 'core',
          title: 'The OSD-0 answer',
          prompt: 'What is the weight of the error OSD-0 returns for the star pair?',
          answerFrom: {
            from: {
              recipe: 'bp-decode',
              params: {
                code: 'toric3',
                error: [0, 9],
                p: 0.05,
                iter: 18,
                osd: true,
              },
            },
            value: 'osdWeight',
          },
          tolerance: 0,
          hints: [
            { text: 'OSD-0 solves exactly for the syndrome on the most suspected independent bits.' },
            { text: 'The true error and its twin both have the smallest possible weight.' },
            { text: 'Count the edges the two errors use.' },
          ],
          walkthrough: [
            { text: 'The syndrome has a solution of weight 2.' },
            { text: 'OSD-0 returns one: its weight is 2.' },
          ],
        },
      ],
    },
  ],
}
