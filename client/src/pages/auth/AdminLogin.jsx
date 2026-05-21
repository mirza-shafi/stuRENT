import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield } from 'lucide-react'
import ThemeToggle from '../../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form); navigate('/dashboard') }
    catch { setError('Invalid admin credentials.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}><ThemeToggle /></div>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px', position: 'relative' }}>
        {/* Card */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Shield size={26} color="#6366f1" />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Admin Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            Administrator access only. <Link to="/login" style={{ color: 'var(--primary)' }}>Student login →</Link>
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Admin Username</label>
              <input name="username" className="form-input" placeholder="Enter admin username" value={form.username} onChange={handleChange} required style={{ borderRadius: 12 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="Enter password" value={form.password} onChange={handleChange} required style={{ borderRadius: 12 }} />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ padding: '13px', borderRadius: 12, fontSize: 15, marginTop: 4 }}>
              {loading ? <span className="spinner" /> : '🔐  Admin Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Need admin access? <Link to="/admin/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Request access</Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>
          <Link to="/" style={{ color: 'var(--text-dim)' }}>← Back to stuRENT</Link>
        </p>
      </div>
    </div>
  )
}
