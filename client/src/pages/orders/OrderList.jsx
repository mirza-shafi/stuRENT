/**
 * OrderList.jsx — Orders CRUD page (View)
 */

import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, ShoppingCart } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { useApi } from '../../hooks/useApi'
import OrderService from '../../services/orderService'
import CustomerService from '../../services/customerService'
import ProductService from '../../services/productService'
import toast from 'react-hot-toast'

const EMPTY_FORM = { customer_id: '', product_id: '', status: 'Pending', note: '' }

export default function OrderList() {
  const { data, loading, execute: refetch }      = useApi(OrderService.getAll)
  const { data: customersData }                  = useApi(CustomerService.getAll)
  const { data: productsData }                   = useApi(ProductService.getAll)

  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const orders    = (data?.results ?? data ?? []).filter((o) =>
    (o.customer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (o.product_name  ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const customers = customersData?.results ?? customersData ?? []
  const products  = productsData?.results  ?? productsData  ?? []

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (o) => {
    setEditItem(o)
    setForm({ customer_id: o.customer, product_id: o.product, status: o.status, note: o.note || '' })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM) }

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await OrderService.update(editItem.id, form)
        toast.success('Order updated.')
      } else {
        await OrderService.create(form)
        toast.success('Order created.')
      }
      closeModal()
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save order.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return
    try {
      await OrderService.delete(id)
      toast.success('Order deleted.')
      refetch()
    } catch {
      toast.error('Failed to delete order.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Track all rental orders</p>
        </div>
        <button id="add-order-btn" className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Search size={16} color="var(--clr-text-muted)" />
        <input
          type="search"
          placeholder="Search by customer or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', color: 'var(--clr-text)', fontSize: 'var(--font-size-sm)' }}
        />
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="table-wrapper">
          {loading ? (
            <div className="flex-center" style={{ padding: 'var(--space-12)' }}>
              <span className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={48} className="empty-state__icon" />
              <p className="empty-state__title">No orders yet</p>
              <button className="btn btn--primary" onClick={openCreate}>
                <Plus size={14} /> Create First Order
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Price/Day</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-muted text-sm">#{o.id}</td>
                    <td className="font-semi">{o.customer_name}</td>
                    <td>{o.product_name}</td>
                    <td style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>
                      {o.product_price ? `$${o.product_price}` : '—'}
                    </td>
                    <td><Badge status={o.status} /></td>
                    <td className="text-muted text-sm">
                      {new Date(o.date_created).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(o)}><Pencil size={14} /></button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(o.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="glass-card modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Order' : 'New Order'}</h2>
              <button className="btn btn--ghost btn--sm" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select name="customer_id" className="form-select" value={form.customer_id} onChange={handleChange} required>
                  <option value="">— Select customer —</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product *</label>
                <select name="product_id" className="form-select" value={form.product_id} onChange={handleChange} required>
                  <option value="">— Select product —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.price}/day)</option>)}
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
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
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
