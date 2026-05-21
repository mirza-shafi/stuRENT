import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

const INIT = { username: '', email: '', password: '', password_confirm: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState(INIT)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrors(p => ({ ...p, [e.target.name]: undefined })) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true)
    try { await register(form); toast.success('Account created! Please sign in.'); navigate('/login') }
    catch (err) { if (err.response?.data) setErrors(err.response.data); else toast.error('Registration failed.') }
    finally { setLoading(false) }
  }

  const handleGoogle = () => toast('🚀 Google Sign-Up coming soon!', { icon: '⏳' })

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input name={name} type={type} className="form-input" placeholder={placeholder} value={form[name]} onChange={handleChange} style={{ borderRadius: 12 }} />
      {errors[name] && <p className="form-error">{errors[name][0] ?? errors[name]}</p>}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}><ThemeToggle /></div>

      {/* ── LEFT: Illustration panel ── */}
      <div style={{ width: '45%', background: 'linear-gradient(160deg,#0c4a6e 0%,#0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.25),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎓</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 14 }}>
            Join the student<br />
            <span style={{ background: 'linear-gradient(135deg,#38bdf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>rental community</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Rent, buy, and sell items with students near you. Post your listings and earn money while you study.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {[
              { icon: '🏠', text: 'Find student housing & rooms' },
              { icon: '📦', text: 'Post and manage your listings' },
              { icon: '💳', text: 'Built-in wallet & secure payments' },
              { icon: '💬', text: 'Chat directly with buyers/sellers' },
              { icon: '⭐', text: 'Trusted student community' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.07)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 24, fontSize: 12, color: 'rgba(255,255,255,.3)' }}>stuRENT · Student Marketplace</div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800 }}>S</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>stu<span style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RENT</span></span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Join thousands of students today</p>

          <button onClick={handleGoogle} className="btn btn--google" style={{ marginBottom: 8, borderRadius: 12 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <div className="form-divider">or</div>

          <form onSubmit={handleSubmit} noValidate>
            <Field name="username"         label="Username"         placeholder="Choose a username" />
            <Field name="email"            label="Email"            type="email"    placeholder="you@university.edu" />
            <Field name="password"         label="Password"         type="password" placeholder="Min 8 characters" />
            <Field name="password_confirm" label="Confirm Password" type="password" placeholder="Repeat password" />
            <button id="register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ padding: '13px', borderRadius: 12, fontSize: 15 }}>
              {loading ? <span className="spinner" /> : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
