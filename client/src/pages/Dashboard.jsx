/**
 * Dashboard.jsx — Production admin panel with inline admin request approvals
 */
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Package, ShoppingCart, DollarSign,
  ArrowUpRight, Eye, Plus, CheckCircle,
  XCircle, Clock, ShieldCheck, Bell
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats]             = useState(null)
  const [orders, setOrders]           = useState([])
  const [adminReqs, setAdminReqs]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [actioning, setActioning]     = useState(null) // id of req being processed

  const fetchAdminReqs = useCallback(async () => {
    try {
      const res = await api.get('/auth/admin-request/')
      setAdminReqs(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/'),
      api.get('/orders/?limit=6'),
    ]).then(([s, o]) => {
      setStats(s.data)
      setOrders(o.data?.results ?? o.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))

    fetchAdminReqs()
    // Poll for new admin requests every 20s
    const iv = setInterval(fetchAdminReqs, 20000)
    return () => clearInterval(iv)
  }, [fetchAdminReqs])

  const handleAction = async (id, action) => {
    setActioning(id)
    try {
      const res = await api.post(`/auth/admin-request/${id}/${action}/`)
      toast.success(res.data.message)
      fetchAdminReqs()
    } catch {
      toast.error('Action failed. Please try again.')
    } finally { setActioning(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
      <span className="spinner" /> Loading...
    </div>
  )

  const statCards = [
    { label: 'Total Customers', value: stats?.total_customers ?? 0,       icon: Users,        color: '#6366f1', bg: 'rgba(99,102,241,.12)'  },
    { label: 'Total Products',  value: stats?.total_products  ?? 0,       icon: Package,      color: '#06b6d4', bg: 'rgba(6,182,212,.12)'   },
    { label: 'Total Orders',    value: stats?.total_orders    ?? 0,       icon: ShoppingCart, color: '#10b981', bg: 'rgba(16,185,129,.12)'  },
    { label: 'Revenue (est.)',  value: `$${stats?.total_revenue ?? '0'}`, icon: DollarSign,   color: '#f59e0b', bg: 'rgba(245,158,11,.12)'  },
  ]

  const STATUS_STYLE = {
    'Pending':            { color: '#f59e0b', bg: 'rgba(245,158,11,.12)'  },
    'Out for delivery':   { color: '#06b6d4', bg: 'rgba(6,182,212,.12)'   },
    'Delivered':          { color: '#10b981', bg: 'rgba(16,185,129,.12)'  },
  }

  return (
    <div className="fade-in">
      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 2 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link to="/admin/products" className="btn btn--primary btn--sm"><Plus size={14}/> Add Product</Link>
      </div>

      {/* ── Admin Request Approvals ── */}
      {adminReqs.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Pending Admin Requests</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {adminReqs.length} person{adminReqs.length > 1 ? 's' : ''} waiting for approval
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {adminReqs.map(r => (
              <div key={r.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.user__username?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.user__username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.user__email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10}/> Requested {new Date(r.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11}/> Pending
                </span>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAction(r.id, 'approve')}
                    disabled={actioning === r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,.12)'}
                  >
                    {actioning === r.id ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <CheckCircle size={14}/>}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    disabled={actioning === r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}
                  >
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.color} />
                </div>
                <ArrowUpRight size={14} color="var(--success)" />
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* ── Lower grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        {/* Recent orders */}
        <div className="card">
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Orders</div>
            <Link to="/admin/orders" className="btn btn--ghost btn--sm"><Eye size={13}/> View all</Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <ShoppingCart size={36} className="empty-state__icon" />
              <p className="empty-state__title">No orders yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Customer</th><th>Product</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS_STYLE[o.status] ?? STATUS_STYLE['Pending']
                    return (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{o.id}</td>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{o.customer_name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{o.product_name}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(o.date_created).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick actions */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Quick Actions</div>
            {[
              { to: '/admin/products', icon: '📦', label: 'Manage Products',   sub: 'Add, edit, delete'        },
              { to: '/customers',      icon: '👥', label: 'Manage Customers',  sub: 'View accounts'            },
              { to: '/admin/orders',   icon: '📋', label: 'Manage Orders',     sub: 'Update statuses'          },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8, transition: 'all .15s', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.3)'; e.currentTarget.style.background = 'var(--primary-glow)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
              >
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.sub}</div>
                </div>
                <ArrowUpRight size={13} color="var(--text-muted)" />
              </Link>
            ))}
          </div>

          {/* Order breakdown */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Order Status</div>
            {[
              ['Pending',          stats?.pending_orders   ?? 0, '#f59e0b'],
              ['Out for Delivery', stats?.active_orders    ?? 0, '#06b6d4'],
              ['Delivered',        stats?.delivered_orders ?? 0, '#10b981'],
            ].map(([label, count, color]) => {
              const pct = Math.round((count / (stats?.total_orders || 1)) * 100)
              return (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 280px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
