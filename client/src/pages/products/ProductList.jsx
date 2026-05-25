/**
 * ProductList.jsx — Phoenix-style admin product management
 */
import { useState, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, Package, X, ImageIcon, Eye, User, Mail, Phone, Tag, Calendar, DollarSign, Filter, Download, ChevronRight, Check, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import ProductService from '../../services/productService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const HOUSING_LOCATIONS = {
  Dhaka: ['Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Badda', 'Khilgaon'],
  Chittagong: ['Halishahar', 'GEC', 'Panchlaish', 'Nasirabad', 'Agrabad'],
  Sylhet: ['Zindabazar', 'Shibgonj', 'Uposhahar', 'Amberkhana']
}

const EMPTY_FORM = { 
  name: '', 
  price: '', 
  buy_price: '', 
  listing_type: 'Rent', 
  category: 'Indoor', 
  description: '', 
  is_available: true, 
  image: null,
  city: '',
  area: '',
  house_type: 'Flat',
  flat_size: '',
  rooms: 1,
  bathrooms: 1,
  ac_included: false,
  furnished: false
}
const BASE_URL   = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

const STATUS_MAP = {
  true:  { label: 'Available',   bg: 'rgba(16,185,129,.12)',  color: 'var(--success)' },
  false: { label: 'Unavailable', bg: 'rgba(239,68,68,.12)',   color: 'var(--danger)'  },
}
const TYPE_MAP = {
  Rent: { bg: 'rgba(99,102,241,.12)', color: 'var(--primary)' },
  Buy:  { bg: 'rgba(16,185,129,.12)', color: 'var(--success)' },
  Both: { bg: 'rgba(245,158,11,.12)', color: 'var(--warning)' },
}

export default function ProductList() {
  const { data, loading, execute: refetch } = useApi(ProductService.getAll)
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState('All')
  const [approvalTab, setApprovalTab] = useState('All') // 'All', 'pending', 'approved', 'rejected'
  const [showModal, setShowModal] = useState(false)
  const [viewItem, setViewItem]   = useState(null)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [preview, setPreview]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const fileRef = useRef()

  const allProducts = data?.results ?? data ?? []
  const products = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchType   = filterType === 'All' || p.listing_type === filterType
    const matchApproval = approvalTab === 'All' || p.approval_status === approvalTab
    return matchSearch && matchType && matchApproval
  })

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setPreview(null); setShowModal(true) }
  const openEdit   = (p) => {
    setEditItem(p)
    setForm({ 
      name: p.name, 
      price: p.price, 
      buy_price: p.buy_price || '', 
      listing_type: p.listing_type || 'Rent', 
      category: p.category, 
      description: p.description, 
      is_available: p.is_available, 
      image: null,
      city: p.city || '',
      area: p.area || '',
      house_type: p.house_type || 'Flat',
      flat_size: p.flat_size || '',
      rooms: p.rooms || 1,
      bathrooms: p.bathrooms || 1,
      ac_included: !!p.ac_included,
      furnished: !!p.furnished
    })
    setPreview(p.image ? `${p.image?.startsWith('http') ? p.image : `${BASE_URL}${p.image}`}` : null)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM); setPreview(null) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => {
      const next = { ...p, [name]: type === 'checkbox' ? checked : value }
      if (name === 'city') {
        const areas = HOUSING_LOCATIONS[value] || []
        next.area = areas[0] || ''
      }
      return next
    })
  }
  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return
    setForm(p => ({ ...p, image: file })); setPreview(URL.createObjectURL(file))
  }
  const removeImage = () => { setForm(p => ({ ...p, image: null })); setPreview(null); if (fileRef.current) fileRef.current.value = '' }

  const handleSave = async (e) => {
    e.preventDefault()

    // Listing Type Validation
    if (form.listing_type === 'Rent') {
      if (!form.price) { toast.error('Please enter a daily rental price.'); return }
    } else if (form.listing_type === 'Buy') {
      if (!form.buy_price) { toast.error('Please enter a purchase price.'); return }
    } else if (form.listing_type === 'Both') {
      if (!form.price) { toast.error('Please enter a daily rental price.'); return }
      if (!form.buy_price) { toast.error('Please enter a purchase price.'); return }
    }

    // Housing Validation
    if (form.category === 'Housing') {
      if (!form.city) { toast.error('Please select a location city.'); return }
      if (!form.area) { toast.error('Please select an area.'); return }
      if (!form.flat_size) { toast.error('Please specify the flat size.'); return }
    }

    setSaving(true)
    try {
      const payload = { ...form }
      if (editItem && !form.image) delete payload.image

      // Format pricing fields
      if (form.listing_type === 'Buy') {
        payload.price = null
      } else if (form.listing_type === 'Rent') {
        payload.buy_price = null
      }

      // Clear housing fields if not Housing category
      if (form.category !== 'Housing') {
        payload.city = null
        payload.area = null
        payload.house_type = null
        payload.flat_size = null
        payload.rooms = null
        payload.bathrooms = null
        payload.ac_included = false
        payload.furnished = false
      }

      if (editItem) { await ProductService.update(editItem.id, payload); toast.success('Product updated.') }
      else          { await ProductService.create(payload);               toast.success('Product created.') }
      closeModal(); refetch()
    } catch (err) {
      const data = err.response?.data
      let msg = 'Failed to save product.'
      if (data) {
        if (typeof data === 'object') {
          const errors = Object.entries(data).map(([key, val]) => {
            const displayVal = Array.isArray(val) ? val[0] : JSON.stringify(val)
            return `${key}: ${displayVal}`
          })
          msg = errors.join('\n')
        } else if (typeof data === 'string') {
          msg = data
        }
      }
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await ProductService.delete(id); toast.success('Deleted.'); refetch() }
    catch { toast.error('Failed to delete.') }
  }

  const handleApprove = async (id) => {
    try {
      await ProductService.approve(id)
      toast.success('Product approved and is now live!')
      refetch()
    } catch (err) {
      toast.error('Failed to approve product.')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this product?')) return
    try {
      await ProductService.reject(id)
      toast.success('Product rejected.')
      refetch()
    } catch (err) {
      toast.error('Failed to reject product.')
    }
  }

  return (
    <div className="fade-in">
      {/* ── Breadcrumb ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text)' }}>Products</span>
      </nav>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifySpaceBetween: 'space-between', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} in total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--ghost btn--sm" style={{ gap: 6 }}>
            <Download size={14} /> Export
          </button>
          <button id="add-product-btn" className="btn btn--primary" onClick={openCreate}>
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Approval Status Tabs ── */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'All', label: 'All Products', count: allProducts.length },
          { key: 'approved', label: 'Approved & Live', count: allProducts.filter(p => p.approval_status === 'approved').length },
          { key: 'pending', label: 'Pending Review', count: allProducts.filter(p => p.approval_status === 'pending').length, badge: true },
          { key: 'rejected', label: 'Rejected', count: allProducts.filter(p => p.approval_status === 'rejected').length }
        ].map(tab => {
          const isActive = approvalTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setApprovalTab(tab.key)}
              style={{
                padding: '12px 8px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 99,
                background: tab.badge && tab.count > 0 ? 'var(--danger)' : 'var(--border)',
                color: tab.badge && tab.count > 0 ? '#fff' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220, background: 'var(--bg-3)', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--border)' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Rent', 'Buy', 'Both'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${filterType === t ? 'var(--primary)' : 'var(--border)'}`,
                background: filterType === t ? 'var(--primary-glow)' : 'var(--surface)',
                color: filterType === t ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all .15s'
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <Package size={48} className="empty-state__icon" />
            <p className="empty-state__title">No products found</p>
            <button className="btn btn--primary btn--sm" onClick={openCreate}><Plus size={14} /> Add Product</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Product', 'Category', 'Listing Type', 'Rent Price', 'Buy Price', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap', background: 'var(--surface)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const typeStyle = TYPE_MAP[p.listing_type] || TYPE_MAP.Rent
                  const statusStyle = STATUS_MAP[String(p.is_available)] || STATUS_MAP.true
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Product col */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--surface)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            {p.image ? <img src={`${p.image?.startsWith('http') ? p.image : `${BASE_URL}${p.image}`}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: 20 }}>{p.category === 'Indoor' ? '🪑' : '🏕️'}</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>ID: #{p.id}</span>
                              {p.posted_by ? (
                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>• Posted by {p.posted_by.name}</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>• Admin</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{p.category}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: typeStyle.bg, color: typeStyle.color }}>
                          {p.listing_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>
                        {p.price ? `$${p.price}/day` : '—'}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--success)' }}>
                        {p.buy_price ? `$${p.buy_price}` : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {p.approval_status === 'pending' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,.12)', color: 'var(--warning)' }}>
                            Pending Review
                          </span>
                        ) : p.approval_status === 'rejected' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(239,68,68,.12)', color: 'var(--danger)' }}>
                            Rejected
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color }}>
                            {statusStyle.label}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {p.approval_status === 'pending' && (
                            <>
                              <button className="btn btn--success btn--sm" onClick={() => handleApprove(p.id)} title="Approve" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0 }}><Check size={14} /></button>
                              <button className="btn btn--danger btn--sm" onClick={() => handleReject(p.id)} title="Reject" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0 }}><XCircle size={14} /></button>
                            </>
                          )}
                          <button className="btn btn--ghost btn--sm" onClick={() => setViewItem(p)} title="View Details"><Eye size={13} /></button>
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)} title="Edit"><Pencil size={13} /></button>
                          <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Table footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {products.length} of {allProducts.length} products</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Product' : 'New Product'}</h2>
              <button className="btn btn--ghost btn--sm" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              {/* Image */}
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${preview ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: 'var(--surface)', transition: 'border-color .2s', position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = preview ? 'var(--primary)' : 'var(--border)'}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={e => { e.stopPropagation(); removeImage() }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
                      <p style={{ fontSize: 13 }}>Click to upload image</p>
                      <p style={{ fontSize: 11, opacity: .6 }}>JPG, PNG, WebP up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Folding Table" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
                {form.listing_type !== 'Buy' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price / Day ($) *</label>
                    <input name="price" type="number" step="0.01" min="0" className="form-input" value={form.price} onChange={handleChange} required placeholder="0.00" />
                  </div>
                )}
                {form.listing_type !== 'Rent' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Buy Price ($) *</label>
                    <input name="buy_price" type="number" step="0.01" min="0" className="form-input" value={form.buy_price} onChange={handleChange} required placeholder="0.00" />
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                    <option value="Indoor">🪑 Indoor</option>
                    <option value="Outdoor">🏕️ Outdoor</option>
                    <option value="Housing">🏠 Housing</option>
                  </select>
                </div>
              </div>

              {form.category === 'Housing' && (
                <div className="card" style={{ padding: '16px 20px', marginBottom: 16, background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)' }}>🏠 Housing Specifications</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">City *</label>
                      <select name="city" className="form-select" value={form.city} onChange={handleChange} required>
                        <option value="">Select City</option>
                        {Object.keys(HOUSING_LOCATIONS).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Area *</label>
                      <select name="area" className="form-select" value={form.area} onChange={handleChange} required disabled={!form.city}>
                        <option value="">Select Area</option>
                        {(HOUSING_LOCATIONS[form.city] || []).map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">House Type *</label>
                      <select name="house_type" className="form-select" value={form.house_type} onChange={handleChange} required>
                        <option value="Flat">Flat</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Sublet">Sublet</option>
                        <option value="Room">Room</option>
                        <option value="Apartment">Apartment</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Flat Size (sqft) *</label>
                      <input name="flat_size" type="number" min="0" className="form-input" value={form.flat_size} onChange={handleChange} required placeholder="e.g. 1200" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Rooms (Bedrooms) *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" className="btn btn--ghost btn--sm" style={{ padding: '2px 8px' }} onClick={() => setForm(p => ({ ...p, rooms: Math.max(1, (p.rooms || 1) - 1) }))}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{form.rooms}</span>
                        <button type="button" className="btn btn--ghost btn--sm" style={{ padding: '2px 8px' }} onClick={() => setForm(p => ({ ...p, rooms: (p.rooms || 1) + 1 }))}>+</button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Bathrooms *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" className="btn btn--ghost btn--sm" style={{ padding: '2px 8px' }} onClick={() => setForm(p => ({ ...p, bathrooms: Math.max(1, (p.bathrooms || 1) - 1) }))}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{form.bathrooms}</span>
                        <button type="button" className="btn btn--ghost btn--sm" style={{ padding: '2px 8px' }} onClick={() => setForm(p => ({ ...p, bathrooms: (p.bathrooms || 1) + 1 }))}>+</button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" name="ac_included" checked={form.ac_included} onChange={handleChange} style={{ width: 15, height: 15, accentColor: 'var(--primary)' }} />
                      <span>AC Included</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} style={{ width: 15, height: 15, accentColor: 'var(--primary)' }} />
                      <span>Fully Furnished</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[['Rent','📅 Rent Only','var(--primary)'],['Buy','🛒 Buy Only','var(--success)'],['Both','🔄 Rent & Buy','var(--warning)']].map(([val, lbl, clr]) => (
                    <button key={val} type="button" onClick={() => setForm(p => ({ ...p, listing_type: val }))}
                      style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: `2px solid ${form.listing_type === val ? clr : 'var(--border)'}`, background: form.listing_type === val ? `${clr}18` : 'var(--surface)', color: form.listing_type === val ? clr : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the rental item..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <input id="is_avail" name="is_available" type="checkbox" checked={form.is_available} onChange={handleChange} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                <label htmlFor="is_avail" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Available for rent</label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : (editItem ? '💾 Save Changes' : '✨ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product Detail Slide-over ── */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: 480, background: 'var(--bg-2)', borderLeft: '1px solid var(--border)', overflowY: 'auto', zIndex: 1000, animation: 'slideInRight .25s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Product Details</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{viewItem.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => { setViewItem(null); openEdit(viewItem) }}><Pencil size={13} /> Edit</button>
                <button onClick={() => setViewItem(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={15} /></button>
              </div>
            </div>

            <div style={{ height: 220, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, position: 'relative', overflow: 'hidden' }}>
              {viewItem.image ? <img src={`${viewItem.image?.startsWith('http') ? viewItem.image : `${BASE_URL}${viewItem.image}`}`} alt={viewItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{viewItem.category === 'Indoor' ? '🪑' : '🏕️'}</span>}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
                {(viewItem.listing_type === 'Rent' || viewItem.listing_type === 'Both' || !viewItem.listing_type) && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(99,102,241,.9)', color: '#fff' }}>📅 Rent</span>
                )}
                {(viewItem.listing_type === 'Buy' || viewItem.listing_type === 'Both') && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,.9)', color: '#fff' }}>🛒 Buy</span>
                )}
              </div>
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: viewItem.is_available ? 'rgba(16,185,129,.9)' : 'rgba(239,68,68,.9)', color: '#fff' }}>
                {viewItem.is_available ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{viewItem.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: viewItem.category === 'Indoor' ? 'rgba(99,102,241,.12)' : 'rgba(239,68,68,.12)', color: viewItem.category === 'Indoor' ? 'var(--primary)' : 'var(--danger)' }}>
                  {viewItem.category}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Rent Price</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>${viewItem.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/day</span></div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Buy Price</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{viewItem.buy_price ? `$${viewItem.buy_price}` : <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>N/A</span>}</div>
                </div>
              </div>

              {viewItem.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>{viewItem.description}</p>
                </div>
              )}

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                {[[<Calendar size={14} />, 'Posted On', new Date(viewItem.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                  [<Tag size={14} />, 'Category', viewItem.category],
                  [<User size={14} />, 'Posted By', viewItem.posted_by ? `${viewItem.posted_by.name} (Customer)` : 'Admin']].map(([icon, label, val], i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--primary)' }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              {viewItem.posted_by && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Vendor Contact Details</div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <User size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 600 }}>{viewItem.posted_by.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <Mail size={14} style={{ color: 'var(--primary)' }} />
                      <a href={`mailto:${viewItem.posted_by.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{viewItem.posted_by.email}</a>
                    </div>
                    {viewItem.posted_by.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <Phone size={14} style={{ color: 'var(--primary)' }} />
                        <a href={`tel:${viewItem.posted_by.phone}`} style={{ color: 'var(--text)' }}>{viewItem.posted_by.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  )
}
