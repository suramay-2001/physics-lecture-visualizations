"""Independent numpy / scipy / mpmath routes for the Chapter Q27 engine (app/src/physics/qc/solid.ts), shared by pipeline/make_solid_fixtures.py and pipeline/claims_qc709/q27.py.

Nothing here imports or mirrors the TypeScript: every quantity is rebuilt from first principles by a different route than the engine's.
  * the charge qubit: scipy's `eigh_tridiagonal` (LAPACK) at double precision, and mpmath's `eigsy` at 50 digits for the dispersions (differences of two numbers near -E_J are
    noise below 1e-12 in double precision); the Mathieu characteristic values `scipy.special.mathieu_a/b` for the cross-check of the levels (q = -2 E_J/E_C);
  * the Cooper gap equation by `scipy.integrate.quad` and `brentq` (the engine solves it by Gauss-Legendre panels and bisection in ln b);
  * thermal chances by explicit Boltzmann sums (mpmath `nsum`), the truncated oscillator by `np.diag(sqrt(1..D-1), 1)`;
  * the exchange, iSWAP and half-swap evolutions by `scipy.linalg.expm` of explicit Kronecker Paulis; the two-site rates from the analytic derivative of the Schroedinger equation.
Constants are the exact SI values (h, e, c, k_B) and CODATA 2018 for m_e and mu_0, written as literals so that the twin and the engine read the same numbers.
Units: SI for circuits; hbar = 1 in the dimensionless blocks; angles in radians unless a name says degrees.
"""
import math

import mpmath as mp
import numpy as np
from scipy.integrate import quad
from scipy.linalg import eigh_tridiagonal, expm
from scipy.optimize import brentq
from scipy.special import mathieu_a, mathieu_b

H = 6.62607015e-34
E = 1.602176634e-19
CL = 299792458.0
KB = 1.380649e-23
ME = 9.1093837015e-31
MU0 = 1.25663706212e-6
HBAR = H / (2 * math.pi)
MUB = E * HBAR / (2 * ME)

I2 = np.eye(2, dtype=complex)
SX = np.array([[0, 1], [1, 0]], dtype=complex)
SY = np.array([[0, -1j], [1j, 0]], dtype=complex)
SZ = np.array([[1, 0], [0, -1]], dtype=complex)


def kr(*ms):
    out = np.array([[1.0 + 0j]])
    for m in ms:
        out = np.kron(out, m)
    return out


# ------------------------------------------------------------------------------------------ the LC circuit
def lc_omega(L, C):
    return (L * C) ** -0.5


def lc_freq(L, C):
    return lc_omega(L, C) / (2 * math.pi)


def lc_wavelength(f):
    return CL / f


def lc_impedance(L, C):
    return math.sqrt(L / C)


def hf_over_k(f):
    return H * f / KB


def thermal_n(f, T):
    """Mean photon number from the Boltzmann weights: sum n x^n (1 - x) with x = exp(-hf/kT), by mpmath (exact to 50 digits)."""
    mp.mp.dps = 50
    x = mp.exp(-mp.mpf(H) * f / (mp.mpf(KB) * T))
    return float(mp.nsum(lambda n: n * x**n * (1 - x), [0, mp.inf]))


def thermal_ground(f, T):
    mp.mp.dps = 50
    x = mp.exp(-mp.mpf(H) * f / (mp.mpf(KB) * T))
    z = mp.nsum(lambda n: x**n, [0, mp.inf])
    return float(1 / z)


def ground_temperature(f, p):
    """Solve P0(T) = p by brentq on the Boltzmann sum's closed geometric form."""
    return brentq(lambda T: 1 - math.exp(-hf_over_k(f) / T) - p, 1e-5, 5.0, xtol=1e-16, rtol=1e-15)


def osc_ops(D, Z0=1.0):
    a = np.diag(np.sqrt(np.arange(1, D)), 1).astype(complex)
    ad = a.conj().T
    return a, math.sqrt(Z0 / 2) * (a + ad), 1j * math.sqrt(1 / (2 * Z0)) * (ad - a)


def comm_gap(D=8):
    _, P, Q = osc_ops(D)
    d = P @ Q - Q @ P - 1j * np.eye(D)
    return float(np.abs(d[: D - 1, : D - 1]).max())


def osc_h_gap(L, C, D=8):
    Z0 = math.sqrt(L / C)
    w = 1 / math.sqrt(L * C)
    _, P, Q = osc_ops(D, Z0)
    Hm = Q @ Q / (2 * C) + P @ P / (2 * L)
    return float(max(abs(Hm[n, n].real - w * (n + 0.5)) / w for n in range(D - 2)))


def leak_ratio():
    _, _, Q = osc_ops(6)
    return float(abs(Q[1, 2]) / abs(Q[0, 1]))


# ------------------------------------------------------------------------------------------ Cooper pairs, flux, London
def cooper_b(NV, Ec):
    """The binding energy from 1 = N_F V * integral_0^{Ec} d eps/(2 eps + b): the integral by scipy `quad`, the root by `brentq` (no closed form)."""

    def resid(lb):
        b = math.exp(lb)
        val, _ = quad(lambda t: 1.0 / (2 * t + b), 0, Ec, limit=400, points=[b, 10 * b, 100 * b])
        return NV * val - 1

    return math.exp(brentq(resid, math.log(Ec * 1e-30), math.log(Ec * 10), xtol=1e-15, rtol=1e-15))


def cooper_closed(NV, Ec):
    return 2 * Ec / (math.exp(2 / NV) - 1)


def cooper_exp(NV, Ec):
    return 2 * Ec * math.exp(-2 / NV)


def phi0():
    return math.pi * HBAR / E


def london_length(n):
    return math.sqrt(ME / (MU0 * n * 4 * E * E))


def josephson_i0(lj0):
    return phi0() / (2 * math.pi * lj0)


def josephson_l(i0, theta):
    return phi0() / (2 * math.pi * i0 * math.cos(theta))


# ------------------------------------------------------------------------------------------ the charge qubit
def charge_levels(ec, ej, ng, k=5, nmax=40):
    """The lowest k levels by LAPACK's tridiagonal solver."""
    n = np.arange(-nmax, nmax + 1)
    d = ec * (n - ng) ** 2
    e = -ej / 2 * np.ones(2 * nmax)
    return eigh_tridiagonal(d, e, select='i', select_range=(0, k - 1), eigvals_only=True)


def charge_level_mp(r, ng, k=3, nmax=24, dps=50):
    """The lowest k levels at E_C = 1 and E_J = r in 50-digit arithmetic."""
    mp.mp.dps = dps
    n = 2 * nmax + 1
    Hm = mp.zeros(n, n)
    ngm = mp.mpf(ng)
    for i in range(n):
        Hm[i, i] = (i - nmax - ngm) ** 2
        if i + 1 < n:
            Hm[i, i + 1] = Hm[i + 1, i] = -mp.mpf(r) / 2
    ev = sorted(mp.eigsy(Hm, eigvals_only=True))
    return ev[:k]


def dispersion_exact(r, k=0):
    """E_k(1/2) - E_k(0) from the 50-digit levels (a float)."""
    a = charge_level_mp(r, mp.mpf(1) / 2, k + 1)[k]
    b = charge_level_mp(r, 0, k + 1)[k]
    return float(a - b)


def mathieu_levels(ratio, ng, k=4):
    """The lowest k levels E_C a_nu(q)/4, q = -2 E_J/E_C, from scipy's Mathieu characteristic values.
    n_g = 0: periodic solutions of period pi (orders 2m): a_{2m}(q), b_{2m}(q); n_g = 1/2: orders 2m+1. With q < 0, scipy's a_nu(-q) and b_nu(-q) are mapped by the
    standard relations a_{2m}(-q) = a_{2m}(q), b_{2m}(-q) = b_{2m}(q), a_{2m+1}(-q) = b_{2m+1}(q), b_{2m+1}(-q) = a_{2m+1}(q), so the table is built at q = +2 E_J/E_C."""
    q = 2 * ratio
    vals = []
    if ng == 0:
        for m in range(k + 2):
            vals.append(mathieu_a(2 * m, q))
            if m >= 1:
                vals.append(mathieu_b(2 * m, q))
    else:
        for m in range(k + 2):
            vals.append(mathieu_a(2 * m + 1, q))
            vals.append(mathieu_b(2 * m + 1, q))
    return sorted(x / 4 for x in vals)[:k]


def two_level_cut(ec, ej, ng):
    """The block of the charge Hamiltonian on |1>, |0> and its Pauli decomposition (zco coefficient of sigma_z, xco of sigma_x)."""
    blk = np.array([[ec * (1 - ng) ** 2, -ej / 2], [-ej / 2, ec * ng**2]])
    zco = (blk[0, 0] - blk[1, 1]) / 2
    xco = blk[0, 1]
    return zco, xco, math.hypot(zco, xco)


def full_gap(ec, ej, ng):
    ev = charge_levels(ec, ej, ng, 2)
    return float(ev[1] - ev[0])


def gap_slope(ec, ej, ng, h=1e-5):
    return (full_gap(ec, ej, ng + h) - full_gap(ec, ej, ng - h)) / (2 * h)


def anharmonicity(r):
    ev = charge_levels(1.0, r, 0.5, 3)
    return float(((ev[2] - ev[1]) - (ev[1] - ev[0])) / (ev[1] - ev[0]))


def ladder(r):
    ev = charge_levels(1.0, r, 0.5, 5)
    return [float((x - ev[0]) / (ev[1] - ev[0])) for x in ev]


def disp_printed(r, k=0):
    return (-1) ** k * 2 ** (4 * k + 3) / math.factorial(k) * math.sqrt(2 / math.pi) * (2 * r) ** (k / 2 + 0.75) * math.exp(-math.sqrt(2 * r))


def disp_koch(r, k=0):
    """The page's prefactor and power with the exponent -sqrt(32 r), obtained here by rewriting Koch et al.'s result (E_C -> E_C/4): 2^{4k+5}/k! sqrt(2/pi) (E_J/2E_C')^{k/2+3/4} e^{-sqrt(8 E_J/E_C')} E_C'."""
    ecp = 0.25
    ej = r
    return (-1) ** k * ecp * 2 ** (4 * k + 5) / math.factorial(k) * math.sqrt(2 / math.pi) * (ej / (2 * ecp)) ** (k / 2 + 0.75) * math.exp(-math.sqrt(8 * ej / ecp))


# ------------------------------------------------------------------------------------------ circuit QED
def jc_levels(delta, g, n):
    m = np.array([[delta / 2, g * math.sqrt(n + 1)], [g * math.sqrt(n + 1), -delta / 2]])
    return np.linalg.eigvalsh(m)


def exchange_evolution(tau):
    hx = np.zeros((4, 4), dtype=complex)
    hx[1, 2] = hx[2, 1] = 1
    return expm(-1j * tau * hx)


# ------------------------------------------------------------------------------------------ spin qubit and dot
def zeeman_freq(B):
    return 2 * MUB * B / H


def s1s2():
    return (kr(SX, SX) + kr(SY, SY) + kr(SZ, SZ)) / 4


SWAP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], dtype=complex)


def heisenberg_u(phi):
    return expm(1j * phi * (kr(SX, SX) + kr(SY, SY) + kr(SZ, SZ)) / 4)


def zturn(a):
    return np.diag([np.exp(1j * a), np.exp(-1j * a)])


def cz_product():
    s = heisenberg_u(math.pi / 2)
    before = kr(zturn(math.pi / 2), I2)
    after = kr(zturn(math.pi / 4), zturn(-math.pi / 4))
    return np.exp(-3j * math.pi / 4) * after @ s @ before @ s


def dot_box(L, mass_ratio):
    m = mass_ratio * ME
    e1 = H * H / (8 * m * L * L) / E
    e2 = 4 * e1
    return e1 * 1e3, (e2 - e1) * 1e3, (e2 - e1) * E / KB
