import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="form-group" style={{ marginBottom: 10, flex: 1 }}>
      <label className="form-label" style={{ marginBottom: 4, fontSize: 11, fontWeight: 700 }}>{label}</label>
      <input 
        name={name} 
        type={type} 
        className="form-input" 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13, height: 38 }} 
      />
      {error && <p className="form-error" style={{ fontSize: 11, marginTop: 2, color: 'var(--danger)' }}>{error[0] ?? error}</p>}
    </div>
  )
}

export default function AuthModal() {
  const { showAuthModal, authModalView, setAuthModalView, closeAuthModal, login, register } = useAuth()
  const navigate = useNavigate()

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Register form state
  const INIT_REG = { username: '', email: '', password: '', password_confirm: '', university_name: '', student_id: '' }
  const [regForm, setRegForm] = useState(INIT_REG)
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)

  // Reset forms on view switch or open
  useEffect(() => {
    setLoginForm({ username: '', password: '' })
    setRegForm(INIT_REG)
    setLoginError('')
    setRegErrors({})
  }, [authModalView, showAuthModal])

  if (!showAuthModal) return null

  const handleLoginChange = (e) => setLoginForm(p => ({ ...p, [e.target.name]: e.target.value }))
  
  const handleRegChange = (e) => {
    setRegForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setRegErrors(p => ({ ...p, [e.target.name]: undefined }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true)
    try {
      await login(loginForm)
      toast.success('Welcome back!')
      closeAuthModal()
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        navigate('/products')
      }
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault(); setRegErrors({}); setRegLoading(true)
    try {
      await register(regForm)
      toast.success('Account created! Please sign in.')
      setAuthModalView('login')
    } catch (err) {
      if (err.response?.data) setRegErrors(err.response.data)
      else toast.error('Registration failed.')
    } finally {
      setRegLoading(false)
    }
  }

  const handleGoogle = () => toast('🚀 Google Sign-Up coming soon!', { icon: '⏳' })

  return (
    <div className="am-overlay" onClick={closeAuthModal}>
      <div className="am-card card" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className="am-close" onClick={closeAuthModal}>
          <X size={16} />
        </button>

        {/* Animated background glows inside the modal */}
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />

        {/* Theme toggle */}
        <div className="am-theme-toggle"><ThemeToggle /></div>

        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: 16 }}>
          <div className="auth-logo-box">S</div>
          <span className="auth-logo-text">stu<span>RENT</span></span>
        </div>

        {authModalView === 'login' ? (
          /* ── LOGIN VIEW ── */
          <div className="am-view-fade">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Access your student rental account</p>

            {loginError && (
              <div className="auth-error">
                {loginError}
              </div>
            )}

            <button onClick={handleGoogle} className="btn btn--google auth-google-btn">
              <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 8 }}><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>

            <div className="form-divider" style={{ margin: '14px 0' }}>or continue with username</div>

            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ marginBottom: 4, fontSize: 11, fontWeight: 700 }}>Username</label>
                <input 
                  name="username" 
                  className="form-input" 
                  placeholder="Enter username" 
                  value={loginForm.username} 
                  onChange={handleLoginChange} 
                  required 
                  style={{ borderRadius: 10, height: 38, fontSize: 13, padding: '10px 14px' }} 
                />
              </div>
              <div className="form-group" style={{ position: 'relative', marginBottom: 16 }}>
                <label className="form-label" style={{ marginBottom: 4, fontSize: 11, fontWeight: 700 }}>Password</label>
                <input 
                  name="password" 
                  type={showPass ? 'text' : 'password'} 
                  className="form-input" 
                  placeholder="Enter password" 
                  value={loginForm.password} 
                  onChange={handleLoginChange} 
                  required 
                  style={{ borderRadius: 10, height: 38, fontSize: 13, padding: '10px 14px', paddingRight: 44 }} 
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>

              <button type="submit" className="btn btn--primary btn--full" disabled={loginLoading} style={{ padding: '11px', borderRadius: 10, fontSize: 14, height: 42 }}>
                {loginLoading ? <span className="spinner" /> : '→  Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              No account? <button onClick={() => setAuthModalView('register')} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Sign up free</button>
            </p>
          </div>
        ) : (
          /* ── REGISTER VIEW ── */
          <div className="am-view-fade">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join thousands of students today</p>

            <button onClick={handleGoogle} className="btn btn--google auth-google-btn">
              <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 8 }}><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>

            <div className="form-divider" style={{ margin: '10px 0' }}>or continue with details</div>

            <form onSubmit={handleRegSubmit} noValidate>
              <div className="form-grid">
                <Field name="username" label="Username" placeholder="Choose a username" value={regForm.username} onChange={handleRegChange} error={regErrors.username} />
                <Field name="email" label="Email" type="email" placeholder="you@university.edu" value={regForm.email} onChange={handleRegChange} error={regErrors.email} />
              </div>

              <div className="form-grid">
                <Field name="university_name" label="University Name" placeholder="Your University" value={regForm.university_name} onChange={handleRegChange} error={regErrors.university_name} />
                <Field name="student_id" label="Student ID" placeholder="Student ID #" value={regForm.student_id} onChange={handleRegChange} error={regErrors.student_id} />
              </div>

              <div className="form-grid">
                <Field name="password" label="Password" type="password" placeholder="Min 8 chars" value={regForm.password} onChange={handleRegChange} error={regErrors.password} />
                <Field name="password_confirm" label="Confirm Password" type="password" placeholder="Repeat" value={regForm.password_confirm} onChange={handleRegChange} error={regErrors.password_confirm} />
              </div>

              <button type="submit" className="btn btn--primary btn--full" disabled={regLoading} style={{ padding: '11px', borderRadius: 10, fontSize: 14, marginTop: 8, height: 42 }}>
                {regLoading ? <span className="spinner" /> : 'Create Account →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
              Already have an account? <button onClick={() => setAuthModalView('login')} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Sign in</button>
            </p>
          </div>
        )}
      </div>

      <style>{`
        .am-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 11, 15, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
          animation: amFadeIn 0.3s ease both;
        }

        .am-card {
          width: 100%;
          max-width: 480px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          box-shadow: var(--shadow-lg);
          position: relative;
          z-index: 2;
          overflow: hidden;
          animation: amScaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          will-change: transform, opacity;
        }

        .am-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .am-close:hover {
          color: var(--text);
          background: var(--surface-hov);
          transform: rotate(90deg);
        }

        .am-theme-toggle {
          position: absolute;
          top: 16px;
          right: 56px;
          z-index: 10;
        }

        .am-view-fade {
          animation: amViewFadeIn 0.3s ease both;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Float background glows inside modal container */
        .am-card .auth-glow {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.1;
          pointer-events: none;
          z-index: 1;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        .am-card .auth-glow-1 {
          background: var(--primary);
          top: -10%;
          left: -10%;
          animation: amGlow1 8s ease-in-out infinite alternate;
        }
        .am-card .auth-glow-2 {
          background: var(--accent);
          bottom: -10%;
          right: -10%;
          animation: amGlow2 8s ease-in-out infinite alternate;
        }

        @keyframes amGlow1 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(30px, 30px, 0); }
        }
        @keyframes amGlow2 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-30px, -30px, 0); }
        }

        @keyframes amFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes amScaleUp {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes amViewFadeIn {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (max-width: 520px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .am-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  )
}
