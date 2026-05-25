/**
 * Dashboard.jsx — Premium Admin Dashboard Redesign (Phoenix Style)
 */
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Package, ShoppingCart, DollarSign,
  ArrowUpRight, Eye, Plus, CheckCircle,
  XCircle, Clock, ShieldCheck, Bell, TrendingUp,
  Percent, ChevronRight, Activity, Award
} from 'lucide-react'
import api from '../services/api'
import ProductService from '../services/productService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats]             = useState(null)
  const [orders, setOrders]           = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [adminReqs, setAdminReqs]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [actioning, setActioning]     = useState(null) // id of req being processed
  const [hoveredIdx, setHoveredIdx]   = useState(null)

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard mounted. User:', user, 'isAdmin:', user?.is_staff)
  }, [user])

  const fetchAdminReqs = useCallback(async () => {
    try {
      const res = await api.get('/auth/admin-request/')
      setAdminReqs(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    console.log('📊 Fetching dashboard stats...')
    Promise.all([
      api.get('/dashboard/'),
      ProductService.getAll({ limit: 4 })
    ]).then(([d, p]) => {
      console.log('✅ Dashboard stats received:', d.data)
      setStats(d.data.stats)
      setOrders(d.data.recent_orders ?? [])
      setTopProducts(p.data?.results ?? p.data ?? [])
      setLoading(false)
    }).catch((err) => {
      console.error('❌ Dashboard API error:', err)
      setError(err.message || 'Failed to load dashboard')
      setLoading(false)
    })

    fetchAdminReqs()
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 12, color: 'var(--text-muted)', flexDirection: 'column' }}>
      <span className="spinner" style={{ width: 40, height: 40 }} /> 
      <p>Loading Dashboard Stats...</p>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 12, color: 'var(--danger)', flexDirection: 'column', textAlign: 'center' }}>
      <p style={{ fontSize: 16, fontWeight: 700 }}>⚠️ Error loading dashboard</p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{error}</p>
      <button onClick={() => window.location.reload()} className="btn btn--primary btn--sm">Retry</button>
    </div>
  )

  // Get default empty stats object for rendering structure while loading
  const displayStats = stats || {
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    total_revenue: 0,
    delivered: 0,
    pending: 0,
    out_for_delivery: 0,
    pending_products: 0,
  }

  const statCards = [
    { label: 'Total Customers', value: displayStats?.total_customers ?? '—',       change: '+0%',  icon: Users,        color: 'var(--primary)', bg: 'var(--primary-glow)' },
    { label: 'Active Products',  value: displayStats?.total_products  ?? '—',       change: '+0%', icon: Package,      color: 'var(--accent)',  bg: 'rgba(6,182,212,.12)'  },
    { label: 'Total Orders',    value: displayStats?.total_orders    ?? '—',       change: '+0%', icon: ShoppingCart, color: 'var(--success)', bg: 'rgba(16,185,129,.12)' },
    { label: 'Revenue (est.)',  value: displayStats?.total_revenue ? `$${(displayStats.total_revenue).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00', change: '+0%',  icon: DollarSign,   color: 'var(--warning)', bg: 'rgba(245,158,11,.12)'  },
    { label: 'Pending Products', value: displayStats?.pending_products ?? 0,       change: '', icon: Clock, color: 'var(--warning)', bg: 'rgba(245,158,11,.12)', isLink: true, linkTo: '/admin/products' },
  ]

  const STATUS_STYLE = {
    'Pending':            { color: 'var(--warning)', bg: 'rgba(245,158,11,.12)' },
    'Out for delivery':   { color: 'var(--accent)',  bg: 'rgba(6,182,212,.12)'  },
    'Delivered':          { color: 'var(--success)', bg: 'rgba(16,185,129,.12)' },
  }

  // Interactive SVG graph values
  const chartData = [
    { day: 'Mon', count: 25, rev: 125, x: 40, y: 130 },
    { day: 'Tue', count: 42, rev: 210, x: 115, y: 90 },
    { day: 'Wed', count: 35, rev: 175, x: 190, y: 105 },
    { day: 'Thu', count: 68, rev: 340, x: 265, y: 40 },
    { day: 'Fri', count: 50, rev: 250, x: 340, y: 80 },
    { day: 'Sat', count: 75, rev: 375, x: 415, y: 25 },
    { day: 'Sun', count: 62, rev: 310, x: 490, y: 55 }
  ]

  // Math for circular progress loaders
  const renderProgressCircle = (count, label, color) => {
    const total = displayStats?.total_orders || 1
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (pct / 100) * circumference

    return (
      <div className="db-progress-item">
        <svg width="72" height="72" viewBox="0 0 76 76" style={{ overflow: 'visible' }}>
          <circle cx="38" cy="38" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="38" cy="38" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 38 38)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="13" fontWeight="800" fill="var(--text)" style={{ userSelect: 'none' }}>
            {pct}%
          </text>
        </svg>
        <div className="db-progress-info">
          <span className="db-progress-label">{label}</span>
          <span className="db-progress-count">{count} orders</span>
        </div>
      </div>
    )
  }

  return (
    <div className="db-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* ── Welcome Hero Banner ── */}
      <div className="db-hero">
        <div className="db-hero-content">
          <h1 className="db-hero-title">Welcome back, {user?.username || 'Admin'}!</h1>
          <p className="db-hero-desc">
            Monitor listings, approve pending administrative requests, and track marketplace rental analytics.
          </p>
          <div className="db-hero-meta">
            <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="db-hero-badge">⚡ Live</span>
          </div>
        </div>
        <div className="db-hero-aside">
          <Link to="/admin/products" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '10px 18px' }}>
            <Plus size={15}/> Add New Product
          </Link>
        </div>
      </div>

      {/* ── Pending Admin Requests Approval Banner ── */}
      {adminReqs.length > 0 && (
        <div className="db-reqs-banner">
          <div className="db-reqs-header">
            <div className="db-reqs-bell">
              <Bell size={18} color="var(--warning)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Pending Admin Privileges</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Review request letters from students wishing to join the admin platform
              </p>
            </div>
          </div>
          <div className="db-reqs-list">
            {adminReqs.map(r => (
              <div key={r.id} className="db-req-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                  <div className="db-req-avatar">
                    {r.user__username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user__username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.user__email}</div>
                  </div>
                </div>
                <div className="db-req-actions">
                  <button
                    onClick={() => handleAction(r.id, 'approve')}
                    disabled={actioning === r.id}
                    className="db-action-btn db-action-btn--approve"
                  >
                    {actioning === r.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <CheckCircle size={14}/>}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    disabled={actioning === r.id}
                    className="db-action-btn db-action-btn--reject"
                  >
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI Statistics Cards ── */}
      <div className="db-grid-stats">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div 
              key={s.label} 
              className="db-stat-card"
              onClick={() => s.linkTo && navigate(s.linkTo)}
              style={s.linkTo ? { cursor: 'pointer' } : {}}
            >
              <div className="db-stat-left" style={{ borderColor: s.color }}>
                <span className="db-stat-label">{s.label}</span>
                <span className="db-stat-value">{s.value}</span>
                <span className="db-stat-trend">
                  {s.isLink ? (
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                      Review now <ArrowUpRight size={12} style={{ marginLeft: 2 }} />
                    </span>
                  ) : (
                    <>
                      <TrendingUp size={12} color="var(--success)" style={{ marginRight: 4 }} />
                      {s.change} vs last month
                    </>
                  )}
                </span>
              </div>
              <div className="db-stat-icon-wrap" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Analytics Visualization & Circular Progress ── */}
      <div className="db-analytics-grid">
        <div className="card db-chart-card">
          <div className="db-card-header">
            <div>
              <h3 className="db-card-title">Rental Analytics</h3>
              <p className="db-card-subtitle">Marketplace transaction volume trend</p>
            </div>
            <span className="db-badge-tag"><Activity size={12} style={{ marginRight: 4 }} /> Active Trend</span>
          </div>

          <div className="db-chart-body" style={{ position: 'relative', marginTop: 16 }}>
            <svg viewBox="0 0 530 180" width="100%" height="180" style={{ overflow: 'visible' }}>
              <line x1="40" y1="25" x2="490" y2="25" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="490" y2="80" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="490" y2="130" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="40" y1="165" x2="490" y2="165" stroke="var(--border)" />

              {/* Area fill */}
              <path
                d="M 40 165 L 40 130 L 115 90 L 190 105 L 265 40 L 340 80 L 415 25 L 490 55 L 490 165 Z"
                fill="url(#chartGrad)"
                style={{ opacity: 0.12, transition: 'all 0.3s ease' }}
              />

              {/* Stroke line */}
              <path
                d="M 40 130 L 115 90 L 190 105 L 265 40 L 340 80 L 415 25 L 490 55"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X Axis Labels */}
              {chartData.map((d, idx) => (
                <text key={idx} x={d.x} y="180" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600" style={{ userSelect: 'none' }}>
                  {d.day}
                </text>
              ))}

              {/* Hover circles */}
              {chartData.map((d, idx) => (
                <g key={idx}
                   onMouseEnter={() => setHoveredIdx(idx)}
                   onMouseLeave={() => setHoveredIdx(null)}
                   style={{ cursor: 'pointer' }}
                >
                  <circle cx={d.x} cy={d.y} r="5" fill="var(--bg-2)" stroke="var(--primary)" strokeWidth="3" />
                  {hoveredIdx === idx && (
                    <circle cx={d.x} cy={d.y} r="9" fill="var(--primary)" style={{ opacity: 0.25 }} />
                  )}
                </g>
              ))}

              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Interactive Tooltip overlay */}
            {hoveredIdx !== null && (
              <div className="db-chart-tooltip" style={{
                position: 'absolute',
                top: chartData[hoveredIdx].y - 65,
                left: `${(chartData[hoveredIdx].x / 530) * 100}%`,
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: 'var(--shadow)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: '100px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{chartData[hoveredIdx].day}day Stats</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>📦 {chartData[hoveredIdx].count} Rentals</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)' }}>💰 ${chartData[hoveredIdx].rev} Revenue</span>
              </div>
            )}
          </div>
        </div>

        <div className="card db-progress-card">
          <div className="db-card-header">
            <div>
              <h3 className="db-card-title">Order Status</h3>
              <p className="db-card-subtitle">Escrow handoff completion metrics</p>
            </div>
          </div>
          <div className="db-progress-indicators" style={{ marginTop: 24 }}>
            {renderProgressCircle(displayStats?.pending ?? 0, 'Pending Validation', 'var(--warning)')}
            {renderProgressCircle(displayStats?.out_for_delivery ?? 0, 'Out for Handoff', 'var(--accent)')}
            {renderProgressCircle(displayStats?.delivered ?? 0, 'Delivered Escrow', 'var(--success)')}
          </div>
        </div>
      </div>

      {/* ── Table lists, listings, and quick actions ── */}
      <div className="db-bottom-grid">
        {/* Recent orders */}
        <div className="card db-orders-card">
          <div className="db-card-header-row">
            <h3 className="db-card-title">Recent Orders</h3>
            <Link to="/admin/orders" className="db-view-link">
              View all orders <ChevronRight size={14}/>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <ShoppingCart size={36} className="empty-state__icon" />
              <p className="empty-state__title">No orders placed yet</p>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Est. Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS_STYLE[o.status] ?? STATUS_STYLE['Pending']
                    return (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>#{o.id}</td>
                        <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{o.product_name}</td>
                        <td style={{ fontWeight: 600 }}>${parseFloat(o.product_price ?? 0).toFixed(2)}</td>
                        <td>
                          <span className="db-status-badge" style={{ background: st.bg, color: st.color }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Columns: Top Products & Quick Actions */}
        <div className="db-aside-column">
          {/* Top Listings */}
          <div className="card">
            <div className="db-card-header-row">
              <h3 className="db-card-title">Recent Listings</h3>
              <Link to="/admin/products" className="db-view-link">Manage <ChevronRight size={14}/></Link>
            </div>
            <div className="db-products-list" style={{ marginTop: 14 }}>
              {topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>No active listings</div>
              ) : (
                topProducts.map(p => (
                  <div key={p.id} className="db-product-row">
                    <div className="db-product-thumb">
                      {p.image ? (
                        <img src={p.image?.startsWith('http') ? p.image : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${p.image}`.replace('/api/v1', '')} alt={p.name} />
                      ) : (
                        <span>🪑</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="db-product-name">{p.name}</h4>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                        <span className="db-product-badge" style={{
                          background: p.listing_type === 'Buy' ? 'rgba(16,185,129,.1)' : 'rgba(99,102,241,.1)',
                          color: p.listing_type === 'Buy' ? 'var(--success)' : 'var(--primary)'
                        }}>
                          {p.listing_type}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>${parseFloat(p.price).toFixed(2)}{p.category === 'Housing' ? '/month' : '/day'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 className="db-card-title" style={{ marginBottom: 12 }}>Platform Navigation</h3>
            <div className="db-quick-grid">
              {[
                { to: '/admin/products', label: 'Manage Products', sub: 'Add & edit active listings', color: 'var(--primary)' },
                { to: '/customers',      label: 'Platform Users', sub: 'Manage registered students', color: 'var(--accent)' },
                { to: '/admin/orders',   label: 'Escrow Orders',   sub: 'Track status progressions', color: 'var(--success)' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="db-quick-item">
                  <div style={{ flex: 1 }}>
                    <div className="db-quick-label">{a.label}</div>
                    <div className="db-quick-sub">{a.sub}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" className="db-quick-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Hero Banner */
        .db-hero {
          background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.06));
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color var(--transition);
        }
        .db-hero:hover {
          border-color: var(--primary-glow);
        }
        .db-hero-content {
          flex: 1;
        }
        .db-hero-title {
          font-size: 26px;
          fontWeight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .db-hero-desc {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0 0 16px 0;
          max-width: 600px;
          line-height: 1.5;
        }
        .db-hero-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: var(--text-dim);
          font-weight: 600;
        }
        .db-hero-badge {
          background: rgba(16,185,129,0.12);
          color: var(--success);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(16,185,129,0.15);
        }

        /* Requests Banner */
        .db-reqs-banner {
          background: rgba(245,158,11,0.04);
          border: 1px solid rgba(245,158,11,0.22);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .db-reqs-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .db-reqs-bell {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(245,158,11,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .db-reqs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-req-row {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          transition: border-color var(--transition);
        }
        .db-req-row:hover {
          border-color: rgba(245,158,11,0.3);
        }
        .db-req-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .db-req-actions {
          display: flex;
          gap: 8px;
        }
        .db-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all var(--transition);
        }
        .db-action-btn--approve {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: var(--success);
        }
        .db-action-btn--approve:hover {
          background: rgba(16,185,129,0.18);
        }
        .db-action-btn--reject {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.18);
          color: var(--danger);
        }
        .db-action-btn--reject:hover {
          background: rgba(239,68,68,0.12);
        }

        /* KPI stats */
        .db-grid-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
        }
        .db-stat-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s ease, border-color var(--transition), box-shadow 0.2s ease;
        }
        .db-stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary-glow);
          box-shadow: var(--shadow);
        }
        .db-stat-left {
          border-left: 3px solid var(--border);
          padding-left: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .db-stat-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }
        .db-stat-value {
          font-size: 24px;
          font-weight: 850;
          color: var(--text);
        }
        .db-stat-trend {
          font-size: 11px;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          font-weight: 600;
        }
        .db-stat-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Analytics Grid */
        .db-analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .db-chart-card {
          padding: 24px;
        }
        .db-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .db-card-title {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
        }
        .db-card-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }
        .db-badge-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          color: var(--text-muted);
        }

        /* Progress meters */
        .db-progress-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .db-progress-indicators {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          justify-content: center;
        }
        .db-progress-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .db-progress-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-progress-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }
        .db-progress-count {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Bottom Grid Layout */
        .db-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: start;
        }
        .db-orders-card {
          padding: 24px 0;
        }
        .db-card-header-row {
          padding: 0 24px 14px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .db-view-link {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .db-view-link:hover {
          text-decoration: underline;
        }

        /* Table */
        .db-table-wrap {
          overflow-x: auto;
        }
        .db-table {
          width: 100%;
          border-collapse: collapse;
        }
        .db-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--text-muted);
          padding: 12px 24px;
          border-bottom: 1px solid var(--border);
        }
        .db-table td {
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
        }
        .db-table tbody tr:last-child td {
          border-bottom: none;
        }
        .db-table tbody tr:hover {
          background: var(--surface);
        }
        .db-status-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* Product Rows */
        .db-aside-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .db-products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .db-product-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: border-color var(--transition), background var(--transition);
        }
        .db-product-row:hover {
          background: var(--surface);
          border-color: var(--border);
        }
        .db-product-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .db-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .db-product-name {
          font-size: 13px;
          font-weight: 700;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .db-product-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* Quick Navigation Actions */
        .db-quick-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-quick-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: var(--surface);
          border: 1px solid var(--border);
          text-decoration: none;
          transition: all var(--transition);
        }
        .db-quick-item:hover {
          border-color: var(--primary-glow);
          background: var(--surface-hov);
        }
        .db-quick-item:hover .db-quick-arrow {
          transform: translateX(3px);
          color: var(--primary);
        }
        .db-quick-label {
          font-weight: 750;
          font-size: 13px;
          color: var(--text);
        }
        .db-quick-sub {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 1px;
        }
        .db-quick-arrow {
          transition: transform var(--transition), color var(--transition);
        }

        /* Responsive Layouts */
        @media (max-width: 990px) {
          .db-analytics-grid { grid-template-columns: 1fr; }
          .db-bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .db-hero { flex-direction: column; align-items: flex-start; padding: 22px 24px; }
          .db-hero-aside { width: 100%; }
          .db-hero-aside .btn { width: 100%; justify-content: center; }
          .db-hero-graphic { display: none; }
        }
      `}</style>
    </div>
  )
}
