/**
 * CustomerList.jsx — Full CRUD customer management page (View)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import CustomerService from '../../services/customerService'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', email: '', phone: '' }

export default function CustomerList() {
  const navigate = useNavigate()
  const { data, loading, execute: refetch } = useApi(CustomerService.getAll)

  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const customers = (data?.results ?? data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (c) => { setEditItem(c);   setForm({ name: c.name, email: c.email, phone: c.phone }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM) }

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await CustomerService.update(editItem.id, form)
        toast.success('Customer updated.')
      } else {
        await CustomerService.create(form)
        toast.success('Customer created.')
      }
      closeModal()
      refetch()
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || 'Failed to save customer.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return
    try {
      await CustomerService.delete(id)
      toast.success('Customer deleted.')
      refetch()
    } catch {
      toast.error('Failed to delete customer.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage student renters</p>
        </div>
        <button id="add-customer-btn" className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Search size={16} color="var(--clr-text-muted)" />
        <input
          type="search"
          placeholder="Search by name or email..."
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
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-state__icon" />
              <p className="empty-state__title">No customers found</p>
              <button className="btn btn--primary" onClick={openCreate}>
                <Plus size={14} /> Add First Customer
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semi">{c.name}</td>
                    <td className="text-muted">{c.email}</td>
                    <td className="text-muted">{c.phone || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>
                        {c.total_orders ?? c.order_count ?? 0}
                      </span>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(c.date_created).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => navigate(`/customers/${c.id}`)}
                          title="View orders"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEdit(c)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="glass-card modal-box" onClick={(e) => e.stopPropagation()}>
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
                <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
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
