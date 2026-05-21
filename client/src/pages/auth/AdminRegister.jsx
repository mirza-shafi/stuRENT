import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { ShieldCheck, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const INIT = { username: '', email: '', password: '', password_confirm: '' }

export default function AdminRegister() {
  const [form, setForm]       = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({})
    try {
      await api.post('/auth/admin-request/', form)
      setPending(true)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
      else toast.error('Submission failed. Please try again.')
    } finally { setLoading(false) }
  }

  const fields = [
    { name: 'username',         label: 'Username',         type: 'text',     placeholder: 'Choose admin username' },
    { name: 'email',            label: 'Email Address',    type: 'email',    placeholder: 'admin@university.edu'  },
    { name: 'password',         label: 'Password',         type: 'password', placeholder: 'Min 8 characters'      },
    { name: 'password_confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password'       },
  ]

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', padding: '32px 24px' }}>
        <div style={{ position: 'absolute', top: 20, right: 20 }}><ThemeToggle /></div>

        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.07),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
          {/* Card */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' }}>

            {/* Icon + heading */}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShieldCheck size={26} color="#6366f1" />
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Request Admin Access</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Submit a request to become an admin. An existing administrator must approve your access before you can sign in.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {fields.map(f => (
                <div className="form-group" key={f.name}>
                  <label className="form-label">{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type}
                    className="form-input"
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: 12 }}
                  />
                  {errors[f.name] && <p className="form-error">{errors[f.name][0] ?? errors[f.name]}</p>}
                </div>
              ))}

              <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ padding: '13px', borderRadius: 12, fontSize: 15, marginTop: 4 }}>
                {loading ? <span className="spinner" /> : '📝  Submit Request'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              Already approved? <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin Sign In</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>← Back to stuRENT</Link>
            <span style={{ margin: '0 8px' }}>·</span>
            <Link to="/login" style={{ color: 'var(--text-dim)' }}>Student Login</Link>
          </p>
        </div>
      </div>

      {/* Pending approval popup */}
      {pending && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ maxWidth: 400, width: '90%', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '44px 36px', textAlign: 'center', animation: 'slideUp .3s ease', boxShadow: 'var(--shadow-lg)' }}>

            {/* Animated clock icon */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Clock size={32} color="#f59e0b" />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Request Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your admin registration request has been sent. A current administrator will review and approve your access. You'll be able to sign in once approved.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '12px 20px', marginBottom: 24 }}>
              <Clock size={15} color="#f59e0b" />
              <span style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>Waiting for Admin Approval</span>
            </div>

            <Link to="/" className="btn btn--ghost btn--full" style={{ justifyContent: 'center', borderRadius: 12 }}>
              Return to Home
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
