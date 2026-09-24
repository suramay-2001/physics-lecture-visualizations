/** Verified public links (checked 2026-09-23). Book refs are by section/result number. */
export const URL = {
  mit805: (n: 3 | 4 | 5 | 6) =>
    `https://ocw.mit.edu/courses/8-05-quantum-physics-ii-fall-2013/resources/${
      {
        3: 'lecture-3-wave-mechanics-cont',
        4: 'lecture-4-spin-one-half-bras-kets-and-operators',
        5: 'lecture-5-linear-algebra-vector-spaces-and-operators',
        6: 'lecture-6-linear-algebra-vector-spaces-and-operators-cont',
      }[n]
    }/`,
  b3: (slug: 'change-of-basis' | 'eigenvalues' | 'dot-products' | 'linear-transformations' | 'span' | 'inverse-matrices' | 'determinant' | 'grover' | 'light-quantum-mechanics') =>
    `https://www.3blue1brown.com/lessons/${slug}`,
  tmLecture1: 'https://www.youtube.com/watch?v=iJfw6lDlTuA',
  tmCourse: 'https://theoreticalminimum.com/courses/quantum-mechanics/2012/winter',
}
