/**
 * OrderList.jsx — Phoenix-style admin order management
 */
import { useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, ShoppingCart, Download, ChevronRight, Filter } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import { useApi } from '../../hooks/useApi'
import OrderService from '../../services/orderService'
import CustomerService from '../../services/customerService'
import ProductService from '../../services/productService'
import toast from 'react-hot-toast'

const EMPTY_FORM = { customer_id: '', product_id: '', status: 'Pending', note: '' }

const STATUS_TABS = ['All', 'Pending', 'Out for delivery', 'Delivered', 'Refunded']

export default function OrderList() {
  const navigate = useNavigate()
  const { data, loading, execute: refetch }  = useApi(OrderService.getAll)
  const { data: customersData }              = useApi(CustomerService.getAll)
  const { data: productsData }               = useApi(ProductService.getAll)

  const [search, setSearch]       = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const allOrders = data?.results ?? data ?? []
  const orders = allOrders.filter(o => {
    const matchSearch = (o.customer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                        (o.product_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = activeStatus === 'All' || o.status === activeStatus
    return matchSearch && matchStatus
  })
  const customers = customersData?.results ?? customersData ?? []
  const products  = productsData?.results  ?? productsData  ?? []

  // Status counts for tabs
  const statusCounts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'All' ? allOrders.length : allOrders.filter(o => o.status === s).length
    return acc
  }, {})

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (o) => { setEditItem(o); setForm({ customer_id: o.customer, product_id: o.product, status: o.status, note: o.note || '' }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM) }
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) { await OrderService.update(editItem.id, form); toast.success('Order updated.') }
      else          { await OrderService.create(form);               toast.success('Order created.') }
      closeModal(); refetch()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save order.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return
    try { await OrderService.delete(id); toast.success('Order deleted.'); refetch() }
    catch { toast.error('Failed to delete order.') }
  }

  return (
    <div className="fade-in">
      {/* ── Breadcrumb ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text)' }}>Orders</span>
      </nav>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Orders</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {allOrders.length} total order{allOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--ghost btn--sm"><Download size={14} /> Export</button>
          <button id="add-order-btn" className="btn btn--primary" onClick={openCreate}>
            <Plus size={15} /> New Order
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        {/* Status tab strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              style={{
                padding: '13px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                border: 'none', background: 'transparent', color: activeStatus === s ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeStatus === s ? 'var(--primary)' : 'transparent'}`,
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {s}
              {statusCounts[s] > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: activeStatus === s ? 'var(--primary-glow)' : 'var(--surface)', color: activeStatus === s ? 'var(--primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {statusCounts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search row */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'var(--bg-3)', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--border)' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="search"
              placeholder="Search by customer or product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <ShoppingCart size={48} className="empty-state__icon" />
            <p className="empty-state__title">No orders found</p>
            <button className="btn btn--primary btn--sm" onClick={openCreate}><Plus size={14} /> Create First Order</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Order #', 'Date', 'Customer', 'Product', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 13 }}>#{o.id}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(o.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{o.customer_name}</div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{o.product_name}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>
                      {o.product_price ? `$${o.product_price}` : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/admin/orders/${o.id}`)} title="View Details"><Eye size={14} /></button>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(o)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(o.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing {orders.length} of {allOrders.length} orders
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Order' : 'New Order'}</h2>
              <button className="btn btn--ghost btn--sm" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select name="customer_id" className="form-select" value={form.customer_id} onChange={handleChange} required>
                  <option value="">— Select customer —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product *</label>
                <select name="product_id" className="form-select" value={form.product_id} onChange={handleChange} required>
                  <option value="">— Select product —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}{p.category === 'Housing' ? '/month' : '/day'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Out for delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <textarea name="note" className="form-textarea" value={form.note} onChange={handleChange} rows={2} placeholder="Optional note..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : (editItem ? 'Save Changes' : 'Create Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
