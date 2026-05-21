/**
 * ProductList.jsx — Card grid view with image upload + admin detail view
 */
import { useState, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, Package, X, ImageIcon, Eye, User, Mail, Phone, Tag, Calendar, DollarSign } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import ProductService from '../../services/productService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', price: '', buy_price: '', listing_type: 'Rent', category: 'Indoor', description: '', is_available: true, image: null }
const BASE_URL   = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

export default function ProductList() {
  const { data, loading, execute: refetch } = useApi(ProductService.getAll)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewItem, setViewItem]   = useState(null)   // detail panel
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [preview, setPreview]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const fileRef = useRef()

  const products = (data?.results ?? data ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setPreview(null); setShowModal(true) }
  const openEdit   = (p) => {
    setEditItem(p)
    setForm({ name: p.name, price: p.price, buy_price: p.buy_price || '', listing_type: p.listing_type || 'Rent', category: p.category, description: p.description, is_available: p.is_available, image: null })
    setPreview(p.image ? `${BASE_URL}${p.image}` : null)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM); setPreview(null) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => { setForm(p => ({ ...p, image: null })); setPreview(null); if (fileRef.current) fileRef.current.value = '' }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      // If no new image picked during edit, exclude image key so server keeps existing
      const payload = { ...form }
      if (editItem && !form.image) delete payload.image

      if (editItem) {
        await ProductService.update(editItem.id, payload)
        toast.success('Product updated.')
      } else {
        await ProductService.create(payload)
        toast.success('Product created.')
      }
      closeModal(); refetch()
    } catch (err) {
      toast.error(err.response?.data?.price?.[0] || 'Failed to save product.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await ProductService.delete(id); toast.success('Deleted.'); refetch() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage rental inventory · {products.length} item{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="add-product-btn" className="btn btn--primary" onClick={openCreate}>
          <Plus size={15}/> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', marginBottom: 24 }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, outline: 'none' }}
        />
      </div>

      {/* Card grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 300, borderRadius: 14, background: 'var(--surface)', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <Package size={48} className="empty-state__icon" />
          <p className="empty-state__title">No products yet</p>
          <button className="btn btn--primary" onClick={openCreate}><Plus size={14}/> Add First Product</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {/* Product image */}
              <div style={{ height: 160, overflow: 'hidden', background: p.category === 'Indoor' ? 'rgba(99,102,241,.08)' : 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {p.image ? (
                  <img src={`${BASE_URL}${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 56 }}>{p.category === 'Indoor' ? '🪑' : '🏕️'}</span>
                )}
                {/* Listing type badge */}
                <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 4 }}>
                  {(p.listing_type === 'Rent' || p.listing_type === 'Both') && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(99,102,241,.9)', color: '#fff' }}>📅 Rent</span>
                  )}
                  {(p.listing_type === 'Buy' || p.listing_type === 'Both') && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(16,185,129,.9)', color: '#fff' }}>🛒 Buy</span>
                  )}
                </div>
                {/* Availability dot */}
                <span style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%', background: p.is_available ? '#10b981' : '#ef4444', border: '2px solid rgba(255,255,255,.8)' }} title={p.is_available ? 'Available' : 'Unavailable'} />
              </div>

              {/* Body */}
              <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                {p.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>${p.price}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/day</span>
                    {p.buy_price && <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>Buy: ${p.buy_price}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => setViewItem(p)} title="View Details"><Eye size={13}/></button>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)} title="Edit"><Pencil size={13}/></button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Product' : 'New Product'}</h2>
              <button className="btn btn--ghost btn--sm" onClick={closeModal}><X size={16}/></button>
            </div>

            <form onSubmit={handleSave}>
              {/* Image upload area */}
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
                      <button type="button" onClick={e => { e.stopPropagation(); removeImage() }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14}/>
                      </button>
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
                <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Folding Table" style={{ borderRadius: 10 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price / Day ($) *</label>
                  <input name="price" type="number" step="0.01" min="0" className="form-input" value={form.price} onChange={handleChange} required placeholder="0.00" style={{ borderRadius: 10 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Buy Price ($)</label>
                  <input name="buy_price" type="number" step="0.01" min="0" className="form-input" value={form.buy_price} onChange={handleChange} placeholder="0.00" style={{ borderRadius: 10 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-select" value={form.category} onChange={handleChange} style={{ borderRadius: 10 }}>
                    <option value="Indoor">🪑 Indoor</option>
                    <option value="Outdoor">🏕️ Outdoor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['Rent','📅 Rent Only','#6366f1'],['Buy','🛒 Buy Only','#10b981'],['Both','🔄 Rent & Buy','#f59e0b']].map(([val, lbl, clr]) => (
                    <button key={val} type="button" onClick={() => setForm(p => ({ ...p, listing_type: val }))} style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: `2px solid ${form.listing_type === val ? clr : 'var(--border)'}`, background: form.listing_type === val ? `${clr}18` : 'var(--surface)', color: form.listing_type === val ? clr : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the rental item..." style={{ borderRadius: 10 }} />
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

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Product Details</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{viewItem.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => { setViewItem(null); openEdit(viewItem) }}><Pencil size={13}/> Edit</button>
                <button onClick={() => setViewItem(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={15}/></button>
              </div>
            </div>

            {/* Product image */}
            <div style={{ height: 220, background: viewItem.category === 'Indoor' ? 'rgba(99,102,241,.08)' : 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, position: 'relative', overflow: 'hidden' }}>
              {viewItem.image
                ? <img src={`${BASE_URL}${viewItem.image}`} alt={viewItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{viewItem.category === 'Indoor' ? '🪑' : '🏕️'}</span>
              }
              {/* Listing badges */}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
                {(viewItem.listing_type === 'Rent' || viewItem.listing_type === 'Both' || !viewItem.listing_type) && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(99,102,241,.9)', color: '#fff' }}>📅 Rent</span>
                )}
                {(viewItem.listing_type === 'Buy' || viewItem.listing_type === 'Both') && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,.9)', color: '#fff' }}>🛒 Buy</span>
                )}
              </div>
              {/* Avail status */}
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: viewItem.is_available ? 'rgba(16,185,129,.9)' : 'rgba(239,68,68,.9)', color: '#fff' }}>
                {viewItem.is_available ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              {/* Name & Category */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{viewItem.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: viewItem.category === 'Indoor' ? 'rgba(99,102,241,.12)' : 'rgba(239,68,68,.12)', color: viewItem.category === 'Indoor' ? '#6366f1' : '#ef4444', border: `1px solid ${viewItem.category === 'Indoor' ? 'rgba(99,102,241,.25)' : 'rgba(239,68,68,.25)'}` }}>
                  {viewItem.category}
                </span>
              </div>

              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={11}/> Rent Price</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>${viewItem.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/day</span></div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={11}/> Buy Price</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{viewItem.buy_price ? `$${viewItem.buy_price}` : <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>N/A</span>}</div>
                </div>
              </div>

              {/* Description */}
              {viewItem.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>{viewItem.description}</p>
                </div>
              )}

              {/* Meta info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Info</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  {[[
                    <Calendar size={14}/>, 'Posted On', new Date(viewItem.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  ],[
                    <Tag size={14}/>, 'Category', viewItem.category
                  ]].map(([icon, label, val], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: 'var(--primary)' }}>{icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted by */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Posted By</div>
                {viewItem.posted_by ? (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                        {viewItem.posted_by.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{viewItem.posted_by.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Student Customer</div>
                      </div>
                    </div>
                    {[[
                      <Mail size={13}/>, viewItem.posted_by.email
                    ],[
                      <Phone size={13}/>, viewItem.posted_by.phone || 'No phone'
                    ]].map(([icon, val], i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginTop: i > 0 ? 6 : 0 }}>
                        <span style={{ color: 'var(--primary)' }}>{icon}</span> {val}
                      </div>
                    ))}
                    <Link to={`/customers/${viewItem.posted_by.id}`} className="btn btn--ghost btn--sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                      <User size={13}/> View Customer Profile
                    </Link>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    <User size={24} style={{ margin: '0 auto 8px', opacity: .3 }} />
                    <p>Posted by admin — no customer linked</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  )
}
