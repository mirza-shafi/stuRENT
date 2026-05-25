import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ui/ThemeToggle'
import toast from 'react-hot-toast'
import { auth, googleProvider } from '../../firebase'
import { signInWithPopup } from 'firebase/auth'


function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="form-group" style={{ flex: 1, minWidth: 0, marginBottom: 10 }}>
      <label className="form-label" style={{ marginBottom: 4, fontSize: 11, fontWeight: 700 }}>{label}</label>
      <input name={name} type={type} className="form-input" placeholder={placeholder} value={value} onChange={onChange} style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13, height: 38 }} />
      {error && <p className="form-error" style={{ fontSize: 11, marginTop: 2, color: 'var(--danger)' }}>{error[0] ?? error}</p>}
    </div>
  )
}

const INIT = { username: '', email: '', password: '', password_confirm: '', university_name: '', student_id: '' }

export default function Register() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm]       = useState(INIT)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrors(p => ({ ...p, [e.target.name]: undefined })) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login', { state: location.state })
    }
    catch (err) { if (err.response?.data) setErrors(err.response.data); else toast.error('Registration failed.') }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      if (result.user.photoURL) {
        localStorage.setItem('user_avatar', result.user.photoURL)
      }
      localStorage.setItem('login_method', 'google')
      await googleLogin(idToken)
      toast.success('Welcome to stuRENT!')
      navigate(location.state?.from || '/products', { state: location.state })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Google Sign-In failed.')
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background glows */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      {/* Theme toggle */}
      <div className="auth-theme-toggle"><ThemeToggle /></div>

      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-box">S</div>
          <span className="auth-logo-text">stu<span>RENT</span></span>
        </Link>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join thousands of students today</p>

        {/* Google */}
        <button onClick={handleGoogle} className="btn btn--google auth-google-btn">
          <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 8 }}><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div className="form-divider" style={{ margin: '12px 0' }}>or continue with details</div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <Field name="username" label="Username" placeholder="Choose a username" value={form.username} onChange={handleChange} error={errors.username} />
            <Field name="email" label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={handleChange} error={errors.email} />
          </div>

          <div className="form-grid">
            <Field name="university_name" label="University Name" placeholder="Your University" value={form.university_name} onChange={handleChange} error={errors.university_name} />
            <Field name="student_id" label="Student ID" placeholder="Student ID #" value={form.student_id} onChange={handleChange} error={errors.student_id} />
          </div>

          <div className="form-grid">
            <Field name="password" label="Password" type="password" placeholder="Min 8 chars" value={form.password} onChange={handleChange} error={errors.password} />
            <Field name="password_confirm" label="Confirm Password" type="password" placeholder="Repeat" value={form.password_confirm} onChange={handleChange} error={errors.password_confirm} />
          </div>

          <button id="register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ padding: '11px', borderRadius: 10, fontSize: 14, marginTop: 8, height: 42 }}>
            {loading ? <span className="spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, var(--bg-3) 0%, var(--bg) 100%);
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        .auth-theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }

        .auth-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        .auth-glow-1 {
          background: var(--primary);
          top: 10%;
          left: 15%;
          animation: floatGlow1 8s ease-in-out infinite alternate;
        }
        .auth-glow-2 {
          background: var(--accent);
          bottom: 10%;
          right: 15%;
          animation: floatGlow2 8s ease-in-out infinite alternate;
        }

        @keyframes floatGlow1 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(40px, 40px, 0); }
        }
        @keyframes floatGlow2 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-40px, -40px, 0); }
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          position: relative;
          z-index: 2;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          text-decoration: none;
        }
        .auth-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #fff;
          font-weight: 800;
        }
        .auth-logo-text {
          font-weight: 800;
          font-size: 16px;
          color: var(--text);
        }
        .auth-logo-text span {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 4px;
          color: var(--text);
        }
        .auth-subtitle {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 20px;
        }

        .auth-google-btn {
          width: 100%;
          border-radius: 10px !important;
          padding: 8px 16px !important;
          font-size: 13px !important;
          height: 38px !important;
          margin-bottom: 8px !important;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 520px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .auth-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  )
}
