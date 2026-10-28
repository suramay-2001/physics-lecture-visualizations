"""Independent numpy/scipy routes for Chapter Q24 (Physics 709: controlling a real qubit), used by make_q24_fixtures.py and claims_qc709/q24.py.

Nothing here imports or mirrors app/src/physics/qc/blocheq.ts or pulses.ts. Routes: the Lindbladian as a Kronecker superoperator and scipy's expm (checked against solve_ivp of a
hand-written right-hand side and against iterated Kraus steps); Eqs. 12.4 by solve_ivp and by a complex 3 x 3 linear solve; the lab-frame driven qubit by DOP853 over one drive
period (the fixed point of the one-period map by np.linalg.solve); Eq. 12.7 by solve_ivp of Eq. 12.6 as printed; composite pulses and Ramsey by matrix products with scipy's expm;
dM/dt = B x M by solve_ivp against density-matrix evolution; Gaussian, Ornstein-Uhlenbeck and echo phase variances by scipy.integrate.quad (double) against closed forms; the 1/e times
by brentq. hbar = 1; |g> = |0>, |e> = |1>.
"""
import numpy as np
from scipy.integrate import quad, solve_ivp
from scipy.linalg import expm
from scipy.optimize import brentq, minimize_scalar

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.diag([1, -1]).astype(complex)
LG = np.array([[0, 1], [0, 0]], dtype=complex)  # |g><e|


def R(n, theta):
    """e^{-i theta n/2} for a Pauli matrix n."""
    return expm(-0.5j * theta * n)


def rho_of(r):
    return 0.5 * (I2 + r[0] * X + r[1] * Y + r[2] * Z)


def bloch(rho):
    return np.array([2 * rho[0, 1].real, -2 * rho[0, 1].imag, (rho[0, 0] - rho[1, 1]).real])


def lind_rhs(rho, H, Ls):
    d = -1j * (H @ rho - rho @ H)
    for L in Ls:
        Ld = L.conj().T
        d = d + L @ rho @ Ld - 0.5 * (Ld @ L @ rho + rho @ Ld @ L)
    return d


def liouv(H, Ls):
    """Row-major vec: vec(A rho B) = kron(A, B^T) vec(rho)."""
    n = H.shape[0]
    Id = np.eye(n)
    S = -1j * (np.kron(H, Id) - np.kron(Id, H.T))
    for L in Ls:
        LdL = L.conj().T @ L
        S = S + np.kron(L, L.conj()) - 0.5 * (np.kron(LdL, Id) + np.kron(Id, LdL.T))
    return S


def lind_solve(rho0, H, Ls, t):
    return (expm(liouv(H, Ls) * t) @ rho0.reshape(-1)).reshape(rho0.shape)


def lind_solve_ode(rho0, H, Ls, t):
    f = lambda tt, y: lind_rhs(y.reshape(2, 2), H, Ls).reshape(-1)
    s = solve_ivp(f, [0, t], rho0.reshape(-1).astype(complex), rtol=1e-12, atol=1e-14, method='DOP853')
    return s.y[:, -1].reshape(2, 2)


def kraus_gap(rho, H, Ls, dt):
    """Largest entry of (Kraus step) - (Euler step) of the Lindblad equation, for a step dt."""
    L0 = -1j * H - 0.5 * sum(L.conj().T @ L for L in Ls)
    A = [I2 + L0 * dt] + [L * np.sqrt(dt) for L in Ls]
    kr = sum(a @ rho @ a.conj().T for a in A)
    eu = rho + dt * lind_rhs(rho, H, Ls)
    return float(np.abs(kr - eu).max())


def decay_times(H, Ls):
    S = liouv(H, Ls)
    return -1.0 / S[3, 3].real, -1.0 / S[1, 1].real


def relaxed_min_eig(t, T1, T2):
    rho = np.array([[1 - 0.5 * np.exp(-t / T1), 0.5 * np.exp(-t / T2)], [0.5 * np.exp(-t / T2), 0.5 * np.exp(-t / T1)]], dtype=complex)
    return float(np.linalg.eigvalsh(rho).min())


def positivity_min(T1, T2, tmax=12.0):
    ts = np.linspace(0, tmax, 24001)
    vals = [relaxed_min_eig(t, T1, T2) for t in ts]
    i = int(np.argmin(vals))
    r = minimize_scalar(lambda t: relaxed_min_eig(t, T1, T2), bounds=(ts[max(i - 1, 0)], ts[min(i + 1, len(ts) - 1)]), method='bounded', options={'xatol': 1e-12})
    return float(r.fun), float(r.x)


def bloch_rhs_complex(w, rt, Om, De, T1, T2):
    """Eqs. 12.4 in complex form (Omega may be complex)."""
    dw = -(1 + w) / T1 + 1j * (Om * np.conj(rt) - np.conj(Om) * rt)
    drt = (1j * De - 1 / T2) * rt - 0.5j * Om * w
    return dw.real, drt


def bloch_ode(Om, De, T1, T2, t, y0=(-1.0, 0.0, 0.0)):
    def f(tt, y):
        dw, drt = bloch_rhs_complex(y[0], y[1] + 1j * y[2], Om, De, T1, T2)
        return [dw, drt.real, drt.imag]

    s = solve_ivp(f, [0, t], list(y0), rtol=1e-12, atol=1e-14, method='DOP853', dense_output=True)
    return s


def bloch_steady(Om, De, T1, T2):
    """Steady state of Eqs. 12.4 by a complex linear solve on (w, rho~, rho~*), the trace-conservation form."""
    # unknowns x = (w, rt, conj rt); equations from dw = 0, drt = 0 and its conjugate
    A = np.array([
        [1 / T1, 1j * np.conj(Om), -1j * Om],
        [-0.5j * Om, 1j * De - 1 / T2, 0],
        [0.5j * np.conj(Om), 0, -1j * De - 1 / T2],
    ], dtype=complex)
    b = np.array([-1 / T1, 0, 0], dtype=complex)
    x = np.linalg.solve(A, b)
    return float(x[0].real), complex(x[1])


def bloch_average_excited(Om, De, T1, T2, t0, t1):
    s = bloch_ode(Om, De, T1, T2, t1)
    val, _ = quad(lambda t: 0.5 * (1 + s.sol(t)[0]), t0, t1, limit=2000, epsabs=1e-14, epsrel=1e-12)
    return val / (t1 - t0)


def lab_steady(wq, Om, De, T1, T2):
    """Periodic steady state of the lab-frame qubit with H = diag(-wq/2, wq/2) - Om cos(w t) X and Lindblad jumps of rates 1/T1 and 1/T2 - 1/(2 T1):
    DOP853 over one period gives the one-period map of the full 2 x 2 density matrix; the fixed point by np.linalg.solve. Returns (<w>, <rho~_eg>) over one period."""
    w = wq + De
    T = 2 * np.pi / w
    gam = 1 / T1
    gphi = 1 / T2 - 0.5 / T1
    Ls = [np.sqrt(gam) * LG, np.sqrt(gphi / 2) * Z]

    def H(t):
        return np.diag([-wq / 2, wq / 2]).astype(complex) + (-Om * np.cos(w * t)) * X

    def f(t, y):
        return lind_rhs(y.reshape(2, 2), H(t), Ls).reshape(-1)

    def flow(y0):
        return solve_ivp(f, [0, T], y0.astype(complex), rtol=1e-12, atol=1e-14, method='DOP853').y[:, -1]

    # affine map on (rho_gg, rho_ee, rho_ge, rho_eg) is linear in rho: build the 4 x 4 matrix, trace fixes the fixed point
    cols = [flow(np.eye(4, dtype=complex)[:, k]) for k in range(4)]
    P = np.array(cols).T
    # fixed point of P with unit trace: solve (P - I) y = 0 with sum of diagonal = 1
    A = P - np.eye(4)
    A = np.vstack([A, [1, 0, 0, 1]])
    b = np.zeros(5, dtype=complex)
    b[-1] = 1
    y0 = np.linalg.lstsq(A, b, rcond=None)[0]
    s = solve_ivp(f, [0, T], y0, rtol=1e-12, atol=1e-14, method='DOP853', dense_output=True)
    wavg, _ = quad(lambda t: (s.sol(t)[3].real - s.sol(t)[0].real), 0, T, limit=400, epsabs=1e-14, epsrel=1e-12)
    # rho~_eg = rho_eg e^{i w t}; rho_eg is the (1,0) entry = index 2 of the row-major vec
    re, _ = quad(lambda t: (s.sol(t)[2] * np.exp(1j * w * t)).real, 0, T, limit=400, epsabs=1e-14, epsrel=1e-12)
    im, _ = quad(lambda t: (s.sol(t)[2] * np.exp(1j * w * t)).imag, 0, T, limit=400, epsabs=1e-14, epsrel=1e-12)
    return wavg / T, complex(re / T, im / T)


def rabi_u_ode(Om, De, t):
    """Eq. 12.6 as printed, integrated for the two basis states; columns are the evolved |g> and |e>."""
    def f(tt, y):
        cg, ce = y[0], y[1]
        return [0.5j * np.conj(Om) * ce * np.exp(1j * De * tt), 0.5j * Om * cg * np.exp(-1j * De * tt)]

    cols = []
    for e in ([1, 0], [0, 1]):
        s = solve_ivp(f, [0, t], np.array(e, dtype=complex), rtol=1e-12, atol=1e-14, method='DOP853')
        cols.append(s.y[:, -1])
    return np.array(cols).T


def rabi_u_frame(Om, De, t):
    """The constant-coefficient frame: (a, b)' = K (a, b), c_g = e^{i De t/2} a, c_e = e^{-i De t/2} b."""
    K = 0.5j * np.array([[-De, np.conj(Om)], [Om, De]])
    return np.diag([np.exp(0.5j * De * t), np.exp(-0.5j * De * t)]) @ expm(K * t)


def rabi_pe_town(w0, w1, w, t):
    """Townsend Eq. 4.45 with w1 = 2 Omega."""
    q2 = (w0 - w) ** 2 + w1 ** 2 / 4
    return (w1 ** 2 / 4 / q2) * np.sin(np.sqrt(q2) * t / 2) ** 2


def comp(eps, mode='scale'):
    a = (lambda x: x * (1 + eps)) if mode == 'scale' else (lambda x: x + eps)
    return R(Z, -a(np.pi)) @ R(X, a(np.pi / 2)) @ R(Y, a(np.pi)) @ R(X, a(np.pi / 2))


def op_norm(M):
    return float(np.linalg.norm(M, 2))


def err_plain(eps, mode='scale'):
    a = eps * np.pi if mode == 'scale' else eps
    return op_norm(R(X, np.pi + a) - R(X, np.pi))


def err_comp(eps, mode='scale'):
    return op_norm(comp(eps, mode) - R(X, np.pi))


def ramsey_p1(phi):
    psi = R(Y, np.pi / 2) @ np.diag([1, np.exp(1j * phi)]) @ R(Y, np.pi / 2) @ np.array([1, 0], dtype=complex)
    return float(abs(psi[1]) ** 2)


def precess_ode(B, M0, t):
    s = solve_ivp(lambda tt, m: np.cross(B, m), [0, t], M0, rtol=1e-12, atol=1e-14, method='DOP853')
    return s.y[:, -1]


def precess_density(B, M0, t):
    H = 0.5 * (B[0] * X + B[1] * Y + B[2] * Z)
    U = expm(-1j * H * t)
    return bloch(U @ rho_of(M0) @ U.conj().T)


def gauss_coherence(sig):
    v, _ = quad(lambda x: np.cos(x) * np.exp(-x * x / (2 * sig * sig)) / np.sqrt(2 * np.pi * sig * sig), -14 * sig, 14 * sig, epsabs=1e-15, epsrel=1e-13, limit=400)
    return float(v)


def ou_var_closed(t, sig, tc):
    return 2 * sig ** 2 * tc ** 2 * (t / tc - 1 + np.exp(-t / tc))


def ou_var_quad(t, sig, tc):
    inner = lambda s: quad(lambda u: np.exp(-abs(u - s) / tc), 0, t, points=[s], epsabs=1e-15, epsrel=1e-13, limit=200)[0]
    return float(sig ** 2 * quad(inner, 0, t, epsabs=1e-15, epsrel=1e-13, limit=200)[0])


def echo_var_closed(tau, sig, tc):
    e = np.exp(-tau / tc)
    return float(sig ** 2 * (4 * tc ** 2 * (tau / tc - 1 + e) - 2 * tc ** 2 * (1 - e) ** 2))


def echo_var_quad(tau, sig, tc):
    f = lambda t: -1.0 if t < tau else 1.0
    inner = lambda s: quad(lambda u: f(u) * np.exp(-abs(u - s) / tc), 0, 2 * tau, points=[s, tau], epsabs=1e-15, epsrel=1e-13, limit=200)[0]
    return float(sig ** 2 * quad(lambda s: f(s) * inner(s), 0, 2 * tau, points=[tau], epsabs=1e-15, epsrel=1e-13, limit=200)[0])


def t2star(sig, tc):
    g = lambda t: ou_var_closed(t, sig, tc) / 2 - 1
    hi = 1.0
    while g(hi) < 0:
        hi *= 2
    return float(brentq(g, 1e-9, hi, xtol=1e-15, rtol=4 * np.finfo(float).eps, maxiter=500))


def echo_unitary(delta, tau):
    W = R(Z, delta * tau)
    return R(X, np.pi) @ W @ R(X, np.pi) @ W


def pulse_train_p0(eps, N, alternate):
    U = np.eye(2, dtype=complex)
    for k in range(2 * N):
        sgn = -1 if (alternate and k % 2) else 1
        U = R(X, sgn * np.pi * (1 + eps)) @ U
    return float(abs(U[0, 0]) ** 2)
