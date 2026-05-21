import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form); toast.success('Welcome back!'); navigate('/browse') }
    catch (err) { setError(err.response?.data?.detail || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleGoogle = () => toast('🚀 Google Sign-In coming soon!', { icon: '⏳' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}><ThemeToggle /></div>

      {/* ── LEFT: Form (centered) ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800 }}>S</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>stu<span style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RENT</span></span>
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Access your student rental account</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} className="btn btn--google" style={{ marginBottom: 8, borderRadius: 12 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <div className="form-divider">or continue with username</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input name="username" className="form-input" placeholder="Enter your username" value={form.username} onChange={handleChange} required style={{ borderRadius: 12 }} />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <input name="password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={form.password} onChange={handleChange} required style={{ borderRadius: 12, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" id="login-submit" className="btn btn--primary btn--full" disabled={loading} style={{ padding: '13px', borderRadius: 12, fontSize: 15, marginTop: 4 }}>
              {loading ? <span className="spinner" /> : '→  Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up free</Link>
            <span style={{ margin: '0 8px' }}>·</span>
            <Link to="/admin/login" style={{ color: 'var(--text-dim)', fontSize: 12 }}>Admin</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Illustration panel ── */}
      <div style={{ width: '45%', background: 'linear-gradient(160deg,#1e1b4b 0%,#0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.2),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 340 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
            Manage your<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>student rentals</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
            Browse houses, furniture, electronics. Post your own listings. Earn while you study.
          </p>

          {/* Mock phone UI */}
          <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Your Wallet</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>$897.00</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => (
                <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', borderRadius: 4, background: i === 4 ? '#6366f1' : 'rgba(255,255,255,.15)', height: [40,55,35,60,80,45][i] }} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{m}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[['Orders','12'],['Rentals','5'],['Earnings','$340']].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* stuRENT tagline */}
        <div style={{ position: 'absolute', bottom: 24, fontSize: 12, color: 'rgba(255,255,255,.3)' }}>stuRENT · Student Marketplace</div>
      </div>
    </div>
  )
}
