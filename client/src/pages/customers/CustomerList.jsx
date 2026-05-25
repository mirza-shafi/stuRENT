/**
 * CustomerList.jsx — Phoenix-style admin customer management
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, Users, Download, ChevronRight, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import CustomerService from '../../services/customerService'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', email: '', phone: '' }

function Avatar({ name, avatarUrl, size = 36 }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    )
  }
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function CustomerList() {
  const navigate = useNavigate()
  const { data, loading, execute: refetch } = useApi(CustomerService.getAll)

  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const allCustomers = data?.results ?? data ?? []
  const customers = allCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (c) => { setEditItem(c); setForm({ name: c.name, email: c.email, phone: c.phone }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM) }
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) { await CustomerService.update(editItem.id, form); toast.success('Customer updated.') }
      else          { await CustomerService.create(form);               toast.success('Customer created.') }
      closeModal(); refetch()
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Failed to save customer.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return
    try { await CustomerService.delete(id); toast.success('Customer deleted.'); refetch() }
    catch { toast.error('Failed to delete customer.') }
  }

  return (
    <div className="fade-in">
      {/* ── Breadcrumb ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text)' }}>Customers</span>
      </nav>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {allCustomers.length} registered student{allCustomers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--ghost btn--sm"><Download size={14} /> Export</button>
          <button id="add-customer-btn" className="btn btn--primary" onClick={openCreate}>
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'var(--bg-3)', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--border)' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <Users size={48} className="empty-state__icon" />
            <p className="empty-state__title">No customers found</p>
            <button className="btn btn--primary btn--sm" onClick={openCreate}><Plus size={14} /> Add Customer</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Customer', 'Email', 'Phone', 'Orders', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Customer col */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={c.name} avatarUrl={c.avatar_url} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="var(--text-muted)" />
                        <a href={`mailto:${c.email}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 13 }}>{c.email}</a>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <Phone size={13} />
                        <span style={{ fontSize: 13 }}>{c.phone || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>
                        {c.total_orders ?? c.order_count ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(c.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/admin/customers/${c.id}`)} title="View details"><Eye size={14} /></button>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(c)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing {customers.length} of {allCustomers.length} customers
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Customer' : 'New Customer'}</h2>
              <button className="btn btn--ghost btn--sm" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="jane@university.edu" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : (editItem ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
