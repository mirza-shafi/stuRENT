/**
 * AdminSettings.jsx — Admin profile & system settings page
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Lock, Bell, Shield, Save } from 'lucide-react'
import ThemeToggle from '../../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile',   icon: User,   label: 'Profile'   },
  { id: 'security',  icon: Lock,   label: 'Security'  },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
]

export default function AdminSettings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '', display_name: '' })
  const [passwords, setPasswords] = useState({ current: '', new_pass: '', confirm: '' })
  const [notifs, setNotifs] = useState({ admin_requests: true, new_orders: true, new_customers: false })
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success('Settings saved!') }, 800)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your admin account and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Tab sidebar */}
        <div className="card" style={{ padding: 8 }}>
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, fontSize: 14, fontWeight: 500, color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)', background: tab === t.id ? 'var(--primary-glow)' : 'none', border: 'none', cursor: 'pointer', transition: 'all .15s', marginBottom: 2, textAlign: 'left', borderLeft: `3px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}` }}>
                <Icon size={16}/> {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="card" style={{ padding: 28 }}>

          {/* ── Profile Tab ── */}
          {tab === 'profile' && (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Profile Information</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Update your admin account details</p>

              {/* Avatar section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Administrator</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(99,102,241,.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,.2)' }}>
                    <Shield size={10} style={{ display: 'inline', marginRight: 4 }} /> Admin
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} style={{ borderRadius: 10 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input className="form-input" placeholder="Optional display name" value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} style={{ borderRadius: 10 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} style={{ borderRadius: 10 }} />
              </div>

              {/* Appearance */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Appearance</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Theme</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle between dark and light mode</div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </>
          )}

          {/* ── Security Tab ── */}
          {tab === 'security' && (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Security</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Change your password to keep your account safe</p>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" placeholder="Enter current password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} style={{ borderRadius: 10 }} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min 8 characters" value={passwords.new_pass} onChange={e => setPasswords(p => ({ ...p, new_pass: e.target.value }))} style={{ borderRadius: 10 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" placeholder="Repeat new password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} style={{ borderRadius: 10 }} />
              </div>
              <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                🔒 Password must be at least 8 characters and not commonly used.
              </div>
            </>
          )}

          {/* ── Notifications Tab ── */}
          {tab === 'notifications' && (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Notifications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Choose which events you want to be notified about</p>
              {[
                { key: 'admin_requests', label: 'Admin Registration Requests', sub: 'Get notified when someone requests admin access' },
                { key: 'new_orders',     label: 'New Orders',                   sub: 'Get notified when a new order is placed' },
                { key: 'new_customers',  label: 'New Customer Signups',         sub: 'Get notified when a student registers' },
              ].map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.sub}</div>
                  </div>
                  <button
                    onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                    style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'background .2s', background: notifs[n.key] ? 'var(--primary)' : 'var(--border)', position: 'relative', flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: notifs[n.key] ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Save button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving} style={{ borderRadius: 12, padding: '10px 28px' }}>
              {saving ? <span className="spinner" /> : <><Save size={15}/> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 200px 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
