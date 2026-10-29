#!/usr/bin/env python3
"""Independent numpy/scipy routes for Chapter Q25 (Physics 709, atoms and ions): the reference for app/src/physics/qc/atoms.ts and iontrap.ts.

Routes the engine does NOT use: scipy.stats Poisson and binomial laws and scipy.special.gammaincc for the loading and the readout; brentq on the envelopes for the 1/e times; scipy
expm and eigendecompositions of dense three-level and nine-level atoms (the pi time of the Raman transition from the unwrapped bright-dark phase of a sampled evolution, the Rydberg gate
as a Hermitian eigenproblem for B -> infinity and expm for the leaky case, minimize_scalar for the best Omega); scipy solve_ivp for the Floquet monodromy of the Mathieu equation
with brentq for its edge; an analytic Hessian for the two ions; an 81-level oscillator with expm for the light kicks; expm of dense 4(n+1)-level pulses for Cirac-Zoller; DOP853 over
the force Hamiltonian for Molmer-Sorensen (the engine uses the closed Magnus form); expm of S^2 for the GHZ scan. Deterministic, no randomness, no clock.
"""
import numpy as np
from scipy import special
from scipy.integrate import solve_ivp
from scipy.linalg import expm
from scipy.optimize import brentq, minimize_scalar
from scipy.stats import binom, poisson

KB, H, C0, U_AMU, QE, EPS0, G0 = 1.380649e-23, 6.62607015e-34, 299792458.0, 1.6605390666e-27, 1.602176634e-19, 8.8541878128e-12, 9.80665
HB = H / (2 * np.pi)

# --------------------------------------------------------------------------- Table 13.1 (stated inputs)
COLS = {
    'Rb': (780.2e-9, 6.07e6, 86.909180527 * U_AMU),
    'Cs': (852.3e-9, 5.23e6, 132.905451961 * U_AMU),
    'Sr461': (461e-9, 30.5e6, 87.62 * U_AMU),
    'Sr689': (689e-9, 0.0074e6, 87.62 * U_AMU),
}


def col(name):
    lam, g2pi, m = COLS[name]
    return lam, 2 * np.pi * g2pi, m, 2 * np.pi / lam


def v_rec(name):
    lam, g, m, k = col(name)
    return HB * k / m


def t_doppler(name):
    lam, g, m, k = col(name)
    return HB * g / (2 * KB)


def t_recoil(name):
    lam, g, m, k = col(name)
    return (HB * k) ** 2 / (m * KB)


def stop_numbers(name, T):
    """Photons N = v/v_rec, time N/(gamma/2), distance v t / 2 for an atom of speed sqrt(3kT/m)."""
    lam, g, m, k = col(name)
    v = np.sqrt(3 * KB * T / m)
    N = v / v_rec(name)
    t = N / (g / 2)
    return v, N, t, 0.5 * v * t


def accel_over_g(name):
    lam, g, m, k = col(name)
    return v_rec(name) * (g / 2) / G0


def nbar(nu, T):
    return 1.0 / np.expm1(H * nu / (KB * T))


# --------------------------------------------------------------------------- loading and readout
def parity_load(mu):
    return 0.5 * (1 - np.exp(-2 * mu))  # P(N odd) = sinh(mu) e^{-mu}


def parity_load_series(mu):
    return float(sum(poisson.pmf(n, mu) for n in range(1, 120, 2)))


def sites_for(k, conf, p=0.5):
    N = k
    while binom.sf(k - 1, N, p) < conf:
        N += 1
    return N


def read_err(nc, m0, m1, c0=0.5, c1=0.5):
    return c0 * poisson.sf(nc - 1, m0) + c1 * poisson.cdf(nc - 1, m1)


def best_cut(m0, m1, c0=0.5, c1=0.5):
    errs = [read_err(n, m0, m1, c0, c1) for n in range(1, 61)]
    i = int(np.argmin(errs))
    return i + 1, errs[i]


def scale_for(target, m0, m1):
    for k in range(10, 1000):
        t = k / 100.0
        nc, e = best_cut(m0 * t, m1 * t)
        if e < target:
            return t, nc
    raise RuntimeError('no scale')


def gamma_gap(nc, mean):
    return abs(special.gammaincc(nc, mean) - poisson.cdf(nc - 1, mean))


# --------------------------------------------------------------------------- thermal dephasing
def t0_thermal(T, eta):
    return 2 * HB / (eta * KB * T)


def semi_env(t, T, eta):
    return (1 + (t / t0_thermal(T, eta)) ** 2) ** -1.5


def t2star_semi(T, eta):
    return brentq(lambda t: semi_env(t, T, eta) - np.exp(-1), 0, 20 * t0_thermal(T, eta), xtol=1e-18, rtol=1e-14)


def quant_env(t, T, eta, omegas):
    x = np.exp(-HB * np.asarray(omegas) / (KB * T))
    ph = eta * np.asarray(omegas) * t / 2
    return abs(np.prod((1 - x) / (1 - x * np.exp(1j * ph))))


def t2star_quant(T, eta, omegas):
    return brentq(lambda t: quant_env(t, T, eta, omegas) - np.exp(-1), 1e-9, 4 * t2star_semi(T, eta), xtol=1e-18, rtol=1e-14)


# --------------------------------------------------------------------------- rotations and Raman
X = np.array([[0, 1], [1, 0]], complex)
Y = np.array([[0, -1j], [1j, 0]], complex)
Z = np.array([[1, 0], [0, -1]], complex)


def Rn(n, th):
    return expm(-1j * th * n / 2)


def sandwich_gaps(th):
    gx = np.abs(Rn(Y, np.pi / 2) @ Rn(Z, th) @ Rn(Y, -np.pi / 2) - Rn(X, th)).max()
    gy = np.abs(Rn(X, -np.pi / 2) @ Rn(Z, th) @ Rn(X, np.pi / 2) - Rn(Y, th)).max()
    return float(gx), float(gy)


def lam_H(Delta, gam):
    Hm = np.zeros((3, 3), complex)
    Hm[2, 2] = Delta - 0.5j * gam
    Hm[2, 0] = Hm[0, 2] = Hm[2, 1] = Hm[1, 2] = 0.5
    return Hm


def raman_pi_time(Delta):
    """The time at which the bright (|0>+|1>)/sqrt2 has gained a phase pi on the dark (|0>-|1>)/sqrt2, from a sampled eigen-evolution with the phase unwrapped."""
    E, V = np.linalg.eigh(lam_H(Delta, 0.0))
    c0 = V.conj().T[:, 0]
    t0 = 2 * np.pi * abs(Delta)
    ts = np.arange(0, 1.4 * t0, 0.004)
    amps = np.einsum('ik,tk,k->ti', V, np.exp(-1j * np.outer(ts, E)), c0)
    aB = (amps[:, 0] + amps[:, 1]) / np.sqrt(2)
    aD = (amps[:, 0] - amps[:, 1]) / np.sqrt(2)
    ph = np.unwrap(np.angle(aB * np.conj(aD)))
    i = int(np.argmax(ph >= np.pi))

    def g(t):
        psi = V @ (np.exp(-1j * E * t) * c0)
        return np.angle(-(psi[0] + psi[1]) * np.conj(psi[0] - psi[1]) / 2)

    return brentq(g, ts[i - 1], ts[i], xtol=1e-12)


def raman_loss(Delta, gam):
    t = raman_pi_time(Delta)
    psi = expm(-1j * lam_H(Delta, gam) * t)[:, 0]
    return 1 - float(np.sum(np.abs(psi) ** 2)), t


# --------------------------------------------------------------------------- Rydberg
R3 = np.zeros((3, 3), complex)
R3[2, 1] = R3[1, 2] = 1
N3 = np.diag([0, 0, 1.0]).astype(complex)
IDEAL = np.diag([1, -1, -1, -1]).astype(complex)
IDX = [0, 1, 3, 4]


def _on(M, which):
    return np.kron(M, np.eye(3)) if which == 1 else np.kron(np.eye(3), M)


def _pulse(which, area, Om, B, gam):
    Hm = 0.5 * Om * _on(R3, which) + B * np.diag([0] * 8 + [1.0]) - 0.5j * gam * (_on(N3, 1) + _on(N3, 2))
    t = area / Om
    if gam == 0:
        E, V = np.linalg.eigh(Hm.real if np.allclose(Hm.imag, 0) else Hm)
        return (V * np.exp(-1j * E * t)) @ V.conj().T
    return expm(-1j * Hm * t)


def ryd_block(Om, B, gam):
    U = _pulse(1, np.pi, Om, B, gam) @ _pulse(2, 2 * np.pi, Om, B, gam) @ _pulse(1, np.pi, Om, B, gam)
    return U[np.ix_(IDX, IDX)]


def ryd_err(M):
    return 1 - (np.trace(M.conj().T @ M).real + abs(np.trace(IDEAL.conj().T @ M)) ** 2) / 20


def ryd_best(gam):
    """The best value of a 200-point scan of Omega, evenly spaced in log10 from -3.2 to -0.3 (B = 1); the curve wiggles, so the grid value is the answer."""
    oms = 10 ** np.linspace(-3.2, -0.3, 200)
    errs = [ryd_err(ryd_block(o, 1.0, gam)) for o in oms]
    i = int(np.argmin(errs))
    return float(oms[i]), float(errs[i])


def log_slope(xs, ys):
    return float(np.polyfit(np.log(xs), np.log(ys), 1)[0])


def w_coupling(N):
    Hm = np.zeros((N + 1, N + 1))
    Hm[0, 1:] = Hm[1:, 0] = 0.5
    return float(2 * np.linalg.eigvalsh(Hm)[-1])


# --------------------------------------------------------------------------- ion trap
BE = dict(m=1.5e-26, V0=100.0, wrf=2 * np.pi * 10e6, zc=1e-3)


def trap_numbers(p=BE):
    q = 2 * QE * p['V0'] / (p['m'] * p['zc'] ** 2 * p['wrf'] ** 2)
    wz = q * p['wrf'] / 2 ** 1.5
    ucoef = 0.5 * p['m'] * wz ** 2 / KB
    return dict(q=q, wz=wz, wxy=wz / 2, zeta_over_Z=q / 2, ucoef=ucoef, depth=ucoef * (p['zc'] / 10) ** 2)


def mono_trace(q):
    f = lambda t, y: [y[1], 2 * q * np.cos(2 * t) * y[0], y[3], 2 * q * np.cos(2 * t) * y[2]]
    s = solve_ivp(f, [0, np.pi], [1, 0, 0, 1], method='DOP853', rtol=1e-12, atol=1e-14)
    return s.y[0, -1] + s.y[3, -1]


def mathieu_beta(q):
    return float(np.arccos(np.clip(mono_trace(q) / 2, -1, 1)) / np.pi)


def mathieu_edge():
    return brentq(lambda q: mono_trace(q) + 2, 0.5, 1.5, xtol=1e-13)


def two_ion(m, wz):
    K = QE ** 2 / (4 * np.pi * EPS0)
    Zeq = (QE ** 2 / (2 * np.pi * EPS0 * m * wz ** 2)) ** (1 / 3)
    d3 = Zeq ** 3
    Hs = np.array([[m * wz ** 2 + 2 * K / d3, -2 * K / d3], [-2 * K / d3, m * wz ** 2 + 2 * K / d3]])  # analytic Hessian of U(z1, z2)
    w = np.sqrt(np.linalg.eigvalsh(Hs) / m)
    return Zeq, w[0], w[1], w[1] / w[0]


def lamb_dicke(lam, m, wz):
    z0 = np.sqrt(HB / (2 * m * wz))
    return z0, 2 * np.pi * z0 / lam


def osc(nmax):
    a = np.diag(np.sqrt(np.arange(1, nmax + 1)), 1).astype(complex)
    return a, a.conj().T


def kick(eta, nmax):
    a, ad = osc(nmax)
    return expm(1j * eta * (a + ad))


def bch_gap(eta, nmax=40):
    a, ad = osc(nmax)
    A, B = 1j * eta * ad, 1j * eta * a
    return float(np.abs(expm(A + B)[:10, :10] - (np.exp(-eta ** 2 / 2) * expm(A) @ expm(B))[:10, :10]).max())


def cool_time(n):
    return float(np.pi * sum(k ** -0.5 for k in range(1, n + 1)))


# --------------------------------------------------------------------------- Cirac-Zoller
SPm = np.array([[0, 0], [1, 0]], complex)  # |e><g|


def cz_ops(nm):
    a, ad = osc(nm)
    I2, Im = np.eye(2), np.eye(nm + 1)
    s1 = np.kron(np.kron(SPm, I2), Im)
    s2 = np.kron(np.kron(I2, SPm), Im)
    A = np.kron(np.kron(I2, I2), a)
    return s1, s2, A


def cz_pulse(nm, ion, kind, th):
    s1, s2, A = cz_ops(nm)
    s = s1 if ion == 1 else s2
    G = (s + s.conj().T) if kind == 'carrier' else (s @ A.conj().T + s.conj().T @ A)
    return expm(-0.5j * th * G)


def cz_state(nm, n0):
    psi = np.zeros(4 * (nm + 1), complex)
    psi[n0] = 1
    for ion, kind, th in [(1, 'blue', np.pi / 2), (2, 'carrier', np.pi), (2, 'blue', np.pi)]:
        psi = cz_pulse(nm, ion, kind, th) @ psi
    return psi.reshape(2, 2, nm + 1)


def cz_bell(nm, n0):
    P = cz_state(nm, n0)
    f = lambda al: -sum(abs((P[0, 1, n] + np.exp(-1j * al) * P[1, 0, n]) / np.sqrt(2)) ** 2 for n in range(nm + 1))
    grid = np.linspace(0, 2 * np.pi, 361)
    i = int(np.argmin([f(a) for a in grid]))
    r = minimize_scalar(f, bounds=(grid[i] - 0.02, grid[i] + 0.02), method='bounded', options={'xatol': 1e-12})
    return float(-r.fun), float(np.sum(abs(P[:, :, 0]) ** 2))


def sideband_pulse_prob(kind):
    """Chance that a pi pulse (red from |g,0>, blue from |e,0>) moves the ion, on 4 oscillator levels."""
    a, ad = osc(3)
    I2, Im = np.eye(2), np.eye(4)
    s = np.kron(SPm, Im)
    G = (s @ np.kron(np.eye(2), a) + s.conj().T @ np.kron(np.eye(2), ad)) if kind == 'red' else (s @ np.kron(np.eye(2), ad) + s.conj().T @ np.kron(np.eye(2), a))
    U = expm(-0.5j * np.pi * G)
    start = 0 if kind == 'red' else 4
    return float(1 - abs(U[start, start]) ** 2)


# --------------------------------------------------------------------------- Molmer-Sorensen
SY = np.array([[0, -1j], [1j, 0]], complex)


def spin_S(N):
    out = np.zeros((2 ** N, 2 ** N), complex)
    for j in range(N):
        ops = [SY if k == j else np.eye(2) for k in range(N)]
        m = ops[0]
        for o in ops[1:]:
            m = np.kron(m, o)
        out = out + m
    return out


def ms_final(n0, eta_om, delta, N, nm, t):
    """DOP853 over H(t) = g S (a e^{-i delta t} + a^dag e^{i delta t}), g = eta Omega / 2, from |g..g; n0>."""
    g = eta_om / 2
    S = spin_S(N)
    a, ad = osc(nm)
    A = np.kron(np.eye(2 ** N), a)
    Ad = A.conj().T
    SA = np.kron(S, np.eye(nm + 1))
    d = 2 ** N * (nm + 1)
    psi0 = np.zeros(d, complex)
    psi0[n0] = 1

    def rhs(tt, y):
        return -1j * g * (SA @ ((A * np.exp(-1j * delta * tt) + Ad * np.exp(1j * delta * tt)) @ y))

    sol = solve_ivp(rhs, [0, t], psi0, method='DOP853', rtol=1e-11, atol=1e-13)
    return sol.y[:, -1].reshape(2 ** N, nm + 1)


def ms_ghz(P):
    nm1 = P.shape[1]
    f = lambda al: -sum(abs((P[0, n] + np.exp(-1j * al) * P[-1, n]) / np.sqrt(2)) ** 2 for n in range(nm1))
    grid = np.linspace(0, 2 * np.pi, 361)
    i = int(np.argmin([f(a) for a in grid]))
    r = minimize_scalar(f, bounds=(grid[i] - 0.02, grid[i] + 0.02), method='bounded', options={'xatol': 1e-12})
    return float(-r.fun)


def ms_bell(n0, eta_om, delta, N, nm, t):
    return ms_ghz(ms_final(n0, eta_om, delta, N, nm, t))


def ghz_scan(N):
    S2 = spin_S(N) @ spin_S(N)
    e0 = np.zeros(2 ** N, complex)
    e0[0] = 1

    def fid(th):
        psi = expm(-1j * th * S2) @ e0
        f = lambda al: -abs((psi[0] + np.exp(-1j * al) * psi[-1]) / np.sqrt(2)) ** 2
        grid = np.linspace(0, 2 * np.pi, 73)
        i = int(np.argmin([f(a) for a in grid]))
        r = minimize_scalar(f, bounds=(grid[i] - 0.1, grid[i] + 0.1), method='bounded', options={'xatol': 1e-12})
        return float(-r.fun)

    ths = np.linspace(0, np.pi, 801)
    vals = [fid(t) for t in ths]
    top = max(vals)
    i = next(k for k, v in enumerate(vals) if v > top - 1e-9)
    r = minimize_scalar(lambda th: -fid(th), bounds=(ths[max(i - 1, 0)], ths[min(i + 1, len(ths) - 1)]), method='bounded', options={'xatol': 1e-12})
    return max(float(-r.fun), top), float(r.x)
