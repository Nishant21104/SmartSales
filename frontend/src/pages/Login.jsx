import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.login(email, password);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F6F3',
      display: 'flex',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .input-field:focus { border-color: #378ADD !important; box-shadow: 0 0 0 3px #378ADD22 !important; }
        .input-field { transition: border-color 0.15s, box-shadow 0.15s; }
        .signin-btn:hover:not(:disabled) { background: #2A72C7 !important; }
        .signin-btn { transition: background 0.15s; }
        .link-hover:hover { color: #378ADD !important; }
      `}</style>

      {/* Left decorative panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #1C1B19 0%, #2D3748 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }} className="left-panel">
        <style>{`
          @media (max-width: 768px) { .left-panel { display: none !important; } }
        `}</style>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: '#378ADD14' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: '#1D9E7514' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 80, height: 80, borderRadius: '50%', background: '#7F77DD18' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>📊</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>SmartSalesAI</span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Your sales,<br />smarter.
          </h2>
          <p style={{ fontSize: 15, color: '#A0A8B8', lineHeight: 1.7, margin: '0 0 3rem', maxWidth: 340 }}>
            Track performance, analyse trends, and make data-driven decisions — all in one place.
          </p>

          {/* Feature pills */}
          {['Real-time dashboard', 'Regional analytics', 'AI-powered insights'].map((feat, i) => (
            <div key={feat} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: ['#378ADD', '#1D9E75', '#7F77DD'][i] + '30',
                border: `1px solid ${['#378ADD', '#1D9E75', '#7F77DD'][i]}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
              }}>✓</div>
              <span style={{ fontSize: 13, color: '#C8CFD9', fontWeight: 500 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.06)',
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📊</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1B19', letterSpacing: '-0.01em' }}>SmartSalesAI</span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C1B19', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#888780', margin: 0 }}>Sign in to continue to your dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#B91C1C',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-field"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #E4E2DA',
                borderRadius: 10,
                fontSize: 14,
                color: '#1C1B19',
                outline: 'none',
                background: '#FAFAF8',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Password
              </label>
              <a href="#" style={{ fontSize: 12, color: '#888780', textDecoration: 'none', fontWeight: 500 }}
                className="link-hover">Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 14px',
                  border: '1px solid #E4E2DA',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#1C1B19',
                  outline: 'none',
                  background: '#FAFAF8',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#B4B2A9',
                  padding: 0, lineHeight: 1,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="signin-btn"
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#93C5FD' : '#1C1B19',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid #ffffff50',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Signing in…
              </>
            ) : 'Sign In →'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: '#888780' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#378ADD', fontWeight: 600, textDecoration: 'none' }}
            className="link-hover">
            Create one
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: 11, color: '#C4C2B9' }}>
          © {new Date().getFullYear()} SmartSalesAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}