/**
 * Layout.jsx — Admin shell: sidebar + top header with theme toggle,
 * settings button, and notification bell for pending admin requests.
 */
import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import ThemeToggle from '../ui/ThemeToggle'
import { Bell, Settings, X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Layout({ children }) {
  const [pendingRequests, setPendingRequests] = useState([])
  const [showNotif, setShowNotif]             = useState(false)
  const [loading, setLoading]                 = useState(false)

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/auth/admin-request/')
      setPendingRequests(res.data)
    } catch {}
  }, [])

  // Poll every 30 seconds for new admin requests
  useEffect(() => {
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [fetchPending])

  const handleAction = async (id, action) => {
    setLoading(true)
    try {
      const res = await api.post(`/auth/admin-request/${id}/${action}/`)
      toast.success(res.data.message)
      fetchPending()
    } catch (err) {
      toast.error('Action failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <div className="admin-main-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* ── Top header ── */}
        <header className="admin-header">

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Link to="/admin/settings" style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all .15s' }}
             onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
             onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = '' }}
            title="Admin Settings"
          >
            <Settings size={16}/>
          </Link>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(v => !v)}
              style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pendingRequests.length > 0 ? 'rgba(245,158,11,.12)' : 'var(--surface)', border: `1px solid ${pendingRequests.length > 0 ? 'rgba(245,158,11,.3)' : 'var(--border)'}`, color: pendingRequests.length > 0 ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s', position: 'relative' }}
            >
              <Bell size={16}/>
              {pendingRequests.length > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-2)' }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotif && (
              <div style={{ position: 'absolute', top: 44, right: 0, width: 340, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Admin Requests</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16}/></button>
                </div>

                {pendingRequests.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={28} style={{ margin: '0 auto 8px', opacity: .3 }} />
                    <p style={{ fontSize: 14 }}>No pending requests</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {pendingRequests.map(r => (
                      <div key={r.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                            {r.user__username?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user__username}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.user__email}</div>
                          </div>
                          <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.2)', padding: '2px 8px', borderRadius: 999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10}/> Pending
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                          Requested: {new Date(r.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={loading}
                            style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
                          >
                            <CheckCircle size={13}/> Approve
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'reject')}
                            disabled={loading}
                            style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
                          >
                            <XCircle size={13}/> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content fade-in">
          {children}
        </main>
      </div>

      <style>{`
        .admin-main-wrapper {
          flex: 1;
          margin-left: var(--sidebar-w);
          transition: margin-left .25s ease;
        }
        .admin-header {
          height: 60px;
          background: var(--bg-2);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 28px;
          gap: 10px;
          position: sticky;
          top: 0;
          z-index: 90;
        }
        .admin-content {
          flex: 1;
          padding: 28px 32px;
          min-height: 100%;
          background: var(--bg);
          overflow: auto;
        }
        @media (max-width: 768px) {
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
          .admin-header {
            padding: 0 16px 0 72px !important;
          }
          .admin-content {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
