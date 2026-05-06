import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(name, email, password);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Too short', color: '#E24B4A', width: '25%' };
    if (password.length < 8) return { label: 'Weak', color: '#D85A30', width: '50%' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: '#BA7517', width: '75%' };
    return { label: 'Strong', color: '#1D9E75', width: '100%' };
  };

  const strength = passwordStrength();
  const passwordsMatch = confirmPassword && password === confirmPassword;

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
        .submit-btn:hover:not(:disabled) { background: #2A72C7 !important; }
        .submit-btn { transition: background 0.15s; }
        .link-hover:hover { color: #378ADD !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .left-panel { display: none !important; } }
      `}</style>

      {/* Left decorative panel */}
      <div className="left-panel" style={{
        flex: 1,
        background: 'linear-gradient(145deg, #1C1B19 0%, #2D3748 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: '#1D9E7514' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: '#378ADD14' }} />
        <div style={{ position: 'absolute', top: '35%', right: '12%', width: 80, height: 80, borderRadius: '50%', background: '#BA751718' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📊</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>SmartSalesAI</span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Start your journey<br />today.
          </h2>
          <p style={{ fontSize: 15, color: '#A0A8B8', lineHeight: 1.7, margin: '0 0 3rem', maxWidth: 340 }}>
            Join thousands of businesses using SmartSalesAI to grow revenue and understand their customers better.
          </p>

          {[
            { icon: '⚡', text: 'Set up in under 2 minutes' },
            { icon: '🔒', text: 'Your data is always secure' },
            { icon: '📈', text: 'Insights from day one' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#ffffff12', border: '1px solid #ffffff20',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>{item.icon}</div>
              <span style={{ fontSize: 13, color: '#C8CFD9', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{
        width: '100%',
        maxWidth: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.06)',
        overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📊</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1B19', letterSpacing: '-0.01em' }}>SmartSalesAI</span>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C1B19', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: '#888780', margin: 0 }}>Get started — it's free</p>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
            padding: '10px 14px', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: '#B91C1C',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="input-field"
              style={{
                width: '100%', padding: '11px 14px',
                border: '1px solid #E4E2DA', borderRadius: 10,
                fontSize: 14, color: '#1C1B19', outline: 'none',
                background: '#FAFAF8', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
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
                width: '100%', padding: '11px 14px',
                border: '1px solid #E4E2DA', borderRadius: 10,
                fontSize: 14, color: '#1C1B19', outline: 'none',
                background: '#FAFAF8', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '0.6rem' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength="6"
                className="input-field"
                style={{
                  width: '100%', padding: '11px 42px 11px 14px',
                  border: '1px solid #E4E2DA', borderRadius: 10,
                  fontSize: 14, color: '#1C1B19', outline: 'none',
                  background: '#FAFAF8', fontFamily: 'inherit',
                }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#B4B2A9', padding: 0,
              }}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {/* Password strength bar */}
          {strength && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ height: 3, background: '#EEECEA', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 4, transition: 'width 0.3s, background 0.3s' }} />
              </div>
              <p style={{ fontSize: 11, color: strength.color, margin: '4px 0 0', fontWeight: 600 }}>{strength.label}</p>
            </div>
          )}

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                minLength="6"
                className="input-field"
                style={{
                  width: '100%', padding: '11px 42px 11px 14px',
                  border: `1px solid ${confirmPassword ? (passwordsMatch ? '#1D9E75' : '#E24B4A') : '#E4E2DA'}`,
                  borderRadius: 10, fontSize: 14, color: '#1C1B19', outline: 'none',
                  background: '#FAFAF8', fontFamily: 'inherit',
                }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#B4B2A9', padding: 0,
              }}>{showConfirm ? '🙈' : '👁️'}</button>
            </div>
            {confirmPassword && (
              <p style={{ fontSize: 11, margin: '4px 0 0', fontWeight: 600, color: passwordsMatch ? '#1D9E75' : '#E24B4A' }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#93C5FD' : '#1C1B19',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid #ffffff50',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Creating account…
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: '#888780' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#378ADD', fontWeight: 600, textDecoration: 'none' }} className="link-hover">
            Sign in
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: 11, color: '#C4C2B9' }}>
          © {new Date().getFullYear()} SmartSalesAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}