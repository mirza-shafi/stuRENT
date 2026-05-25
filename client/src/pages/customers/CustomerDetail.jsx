/**
 * CustomerDetail.jsx — Phoenix-style customer profile + order history
 */
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, ShoppingCart, ChevronRight, MapPin, Calendar, ExternalLink, Pencil } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { useApi } from '../../hooks/useApi'
import CustomerService from '../../services/customerService'

function Avatar({ name, size = 72 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.38, flexShrink: 0, boxShadow: `0 4px 16px ${color}44` }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customer, loading: cLoading } = useApi(
    () => CustomerService.getById(id).then(r => r.data), [id]
  )
  const { data: ordersData, loading: oLoading } = useApi(
    () => CustomerService.getOrders(id).then(r => r.data), [id]
  )

  const orders = ordersData?.results ?? ordersData ?? []

  if (cLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
      <span className="spinner" /> Loading customer...
    </div>
  )

  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.product_price || 0), 0)

  return (
    <div className="fade-in">
      {/* ── Breadcrumb ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={13} />
        <Link to="/admin/customers" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Customers</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text)' }}>{customer?.name || `Customer #${id}`}</span>
      </nav>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/admin/customers')} className="btn btn--ghost btn--sm" style={{ padding: '8px 10px' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{customer?.name}</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Customer profile &amp; order history</p>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm"><Pencil size={14} /> Edit Customer</button>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: Stats + Order History */}
        <div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={20} />, color: 'var(--primary)', bg: 'rgba(99,102,241,.1)' },
              { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: '💳', color: 'var(--success)', bg: 'rgba(16,185,129,.1)' },
              { label: 'Member Since', value: customer?.date_created ? new Date(customer.date_created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', icon: <Calendar size={20} />, color: 'var(--warning)', bg: 'rgba(245,158,11,.1)' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{stat.label}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: 18 }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Order History Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Order History</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 999 }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {oLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12, color: 'var(--text-muted)' }}>
                  <span className="spinner" /> Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state" style={{ padding: 48 }}>
                  <ShoppingCart size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No orders yet</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      {['Order #', 'Product', 'Price', 'Status', 'Note', 'Date'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>#{o.id}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>{o.product_name}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                          {o.product_price ? `$${o.product_price}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}><Badge status={o.status} /></td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{o.note || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                          {new Date(o.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Customer Info Sidebar */}
        <div>
          {/* Profile Card */}
          <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Avatar name={customer?.name} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{customer?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Student Customer</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(16,185,129,.12)', color: 'var(--success)' }}>
              ● Active
            </div>
          </div>

          {/* Contact Details */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Contact Information</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { icon: <Mail size={14} color="var(--primary)" />, label: 'Email', value: customer?.email, href: `mailto:${customer?.email}` },
                { icon: <Phone size={14} color="var(--success)" />, label: 'Phone', value: customer?.phone || '—', href: customer?.phone ? `tel:${customer.phone}` : null },
                { icon: <MapPin size={14} color="var(--warning)" />, label: 'University', value: customer?.university_name || '—', href: null },
                { icon: <Calendar size={14} color="var(--text-muted)" />, label: 'Joined', value: customer?.date_created ? new Date(customer.date_created).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—', href: null },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 14 : 0 }}>
                  <div style={{ marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{item.value}</a>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 16 }}>
            <Link to="/admin/orders" className="btn btn--ghost" style={{ width: '100%', marginBottom: 8, justifyContent: 'center', fontSize: 13 }}>
              <ShoppingCart size={14} /> View All Orders
            </Link>
            <Link to="/admin/customers" className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
              <ExternalLink size={14} /> Back to Customers
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cd-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
