import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  X,
  ImageIcon,
  Tag,
  DollarSign,
  Calendar,
  MapPin,
  Info,
  Layers,
  Upload,
  BookOpen
} from 'lucide-react'
import ProductService from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
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

export default function AddProduct() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [form, setForm]             = useState(EMPTY_FORM)
  const [preview, setPreview]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [activeTab, setActiveTab]   = useState('pricing') // 'pricing' | 'details'

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
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setForm(p => ({ ...p, image: null }))
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handlePublish = async (e) => {
    if (e) e.preventDefault()

    if (!form.name) { toast.error('Please write a product title.'); return }
    
    // Listing Type Validation
    if (form.listing_type === 'Rent') {
      if (!form.price) { toast.error(form.category === 'Housing' ? 'Please enter a monthly rental price.' : 'Please enter a daily rental price.'); return }
    } else if (form.listing_type === 'Buy') {
      if (!form.buy_price) { toast.error('Please enter a purchase price.'); return }
    } else if (form.listing_type === 'Both') {
      if (!form.price) { toast.error(form.category === 'Housing' ? 'Please enter a monthly rental price.' : 'Please enter a daily rental price.'); return }
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
      
      // If Buy Only, set rent price to null (not 0 or required)
      if (form.listing_type === 'Buy') {
        payload.price = null
      } else if (form.listing_type === 'Rent') {
        payload.buy_price = null
      }

      // If category is not Housing, clear housing specifications
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

      await ProductService.create(payload)
      if (user?.is_staff) {
        toast.success('Your listing was published successfully! 🎉')
      } else {
        toast.success('Listing submitted successfully and is pending admin approval! ⏳')
      }
      navigate('/products')
    } catch (err) {
      const data = err.response?.data
      let msg = 'Failed to publish listing.'
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ap-container fade-in">
      {/* ── Breadcrumbs ── */}
      <nav className="ap-breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li className="active" aria-current="page">Add a Product</li>
        </ol>
      </nav>

      {/* ── Form Header ── */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Add a product</h1>
          <p className="ap-subtitle">Post a new listing to the student-to-student marketplace</p>
        </div>
        <div className="ap-header-actions">
          <button className="ap-btn-discard" onClick={() => navigate('/products')} disabled={saving}>
            Discard
          </button>
          <button className="ap-btn-publish" onClick={handlePublish} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Publish Listing'}
          </button>
        </div>
      </div>

      {/* ── Main Form Layout Grid ── */}
      <form onSubmit={handlePublish} className="ap-grid">
        {/* Left Column — Detailed Inputs */}
        <div className="ap-col-main">
          {/* Section 1: Title & Description */}
          <div className="ap-form-card card">
            <div className="ap-card-body">
              <div className="ap-group">
                <label className="ap-field-label">Product Title *</label>
                <input 
                  name="name" 
                  type="text" 
                  className="ap-input" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Vintage Leather Jacket, Camping Tent..." 
                />
              </div>
              <div className="ap-group" style={{ marginBottom: 0 }}>
                <label className="ap-field-label">Product Description</label>
                <textarea 
                  name="description" 
                  className="ap-textarea" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={6} 
                  placeholder="Describe your item's condition, rules, and any details for other students..." 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Display Images */}
          <div className="ap-form-card card">
            <div className="ap-card-header">
              <Layers size={15} />
              <span>Display Images</span>
            </div>
            <div className="ap-card-body">
              <div 
                className={`ap-upload-zone ${preview ? 'has-preview' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div className="ap-preview-wrapper">
                    <img src={preview} alt="upload preview" className="ap-img-preview" />
                    <button type="button" onClick={e => { e.stopPropagation(); removeImage() }} className="ap-btn-remove-img">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="ap-upload-placeholder">
                    <Upload size={32} className="ap-upload-icon" />
                    <p className="ap-upload-title">Drag your photo here or <span className="ap-link-text">Browse files</span></p>
                    <p className="ap-upload-subtitle">JPG, PNG, WebP up to 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </div>
          </div>

          {form.category === 'Housing' && (
            <div className="ap-form-card card fade-in">
              <div className="ap-card-header">
                <Layers size={15} />
                <span>Housing Specifications</span>
              </div>
              <div className="ap-card-body">
                <div className="ap-pricing-row">
                  <div className="ap-group">
                    <label className="ap-field-label">Location (City) *</label>
                    <select 
                      name="city" 
                      className="ap-select" 
                      value={form.city} 
                      onChange={handleChange}
                      required={form.category === 'Housing'}
                    >
                      <option value="">Select City</option>
                      {Object.keys(HOUSING_LOCATIONS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ap-group">
                    <label className="ap-field-label">Area *</label>
                    <select 
                      name="area" 
                      className="ap-select" 
                      value={form.area} 
                      onChange={handleChange}
                      required={form.category === 'Housing'}
                      disabled={!form.city}
                    >
                      <option value="">Select Area</option>
                      {(HOUSING_LOCATIONS[form.city] || []).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ap-pricing-row">
                  <div className="ap-group">
                    <label className="ap-field-label">House Type *</label>
                    <select 
                      name="house_type" 
                      className="ap-select" 
                      value={form.house_type} 
                      onChange={handleChange}
                      required={form.category === 'Housing'}
                    >
                      <option value="Flat">Flat</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Sublet">Sublet</option>
                      <option value="Room">Room</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                  <div className="ap-group">
                    <label className="ap-field-label">Flat Size (sqft) *</label>
                    <input 
                      name="flat_size" 
                      type="number" 
                      min="0"
                      className="ap-input" 
                      value={form.flat_size} 
                      onChange={handleChange}
                      required={form.category === 'Housing'}
                      placeholder="e.g. 1200" 
                    />
                  </div>
                </div>

                <div className="ap-pricing-row" style={{ alignItems: 'center' }}>
                  <div className="ap-group">
                    <label className="ap-field-label">Rooms (Bedrooms) *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button 
                        type="button" 
                        className="ap-counter-btn"
                        onClick={() => setForm(p => ({ ...p, rooms: Math.max(1, (p.rooms || 1) - 1) }))}
                      >-</button>
                      <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{form.rooms}</span>
                      <button 
                        type="button" 
                        className="ap-counter-btn"
                        onClick={() => setForm(p => ({ ...p, rooms: (p.rooms || 1) + 1 }))}
                      >+</button>
                    </div>
                  </div>
                  <div className="ap-group">
                    <label className="ap-field-label">Bathrooms *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button 
                        type="button" 
                        className="ap-counter-btn"
                        onClick={() => setForm(p => ({ ...p, bathrooms: Math.max(1, (p.bathrooms || 1) - 1) }))}
                      >-</button>
                      <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{form.bathrooms}</span>
                      <button 
                        type="button" 
                        className="ap-counter-btn"
                        onClick={() => setForm(p => ({ ...p, bathrooms: (p.bathrooms || 1) + 1 }))}
                      >+</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      name="ac_included" 
                      checked={form.ac_included} 
                      onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span>AC Included</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      name="furnished" 
                      checked={form.furnished} 
                      onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span>Fully Furnished</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Pricing & Specifications Tabs */}
          <div className="ap-form-card card">
            <div className="ap-tabs-header">
              <button 
                type="button"
                className={`ap-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                <DollarSign size={14} /> Pricing Setup
              </button>
              <button 
                type="button"
                className={`ap-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <Info size={14} /> Exchange Details
              </button>
            </div>
            
            <div className="ap-card-body">
              {activeTab === 'pricing' && (
                <div className="ap-tab-pane fade-in">
                  <div className="ap-pricing-row">
                    {form.listing_type !== 'Buy' && (
                      <div className="ap-group">
                        <label className="ap-field-label">
                          {form.category === 'Housing' ? 'Monthly Rental Price ($) *' : 'Daily Rental Price ($) *'}
                        </label>
                        <input 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="ap-input" 
                          value={form.price} 
                          onChange={handleChange} 
                          required={form.listing_type !== 'Buy'} 
                          placeholder={form.category === 'Housing' ? "e.g. 500.00" : "e.g. 5.00"} 
                        />
                        <span className="ap-input-hint">
                          {form.category === 'Housing' ? 'Price charged per month for rentals' : 'Price charged per day for rentals'}
                        </span>
                      </div>
                    )}
                    {form.listing_type !== 'Rent' && (
                      <div className="ap-group">
                        <label className="ap-field-label">Full Purchase Price ($) *</label>
                        <input 
                          name="buy_price" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="ap-input" 
                          value={form.buy_price} 
                          onChange={handleChange} 
                          required={form.listing_type !== 'Rent'} 
                          placeholder="e.g. 150.00" 
                        />
                        <span className="ap-input-hint">One-time buyout price</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="ap-tab-pane fade-in">
                  <div className="ap-details-pane">
                    <div className="ap-group">
                      <label className="ap-field-label">Preferred Exchange Location</label>
                      <select className="ap-select" defaultValue="quad">
                        <option value="quad">🏫 Main Campus Quad</option>
                        <option value="library">📚 Library Lobby</option>
                        <option value="dorms">🏢 Student Dormitories</option>
                        <option value="custom">💬 Custom (Negotiated in chat)</option>
                      </select>
                    </div>
                    <div className="ap-group" style={{ marginBottom: 0 }}>
                      <label className="ap-field-label">Handoff Instructions</label>
                      <input 
                        type="text" 
                        className="ap-input" 
                        placeholder="e.g. Available Mon-Wed evenings, quad library" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Sidebar Organization */}
        <div className="ap-col-side">
          <div className="ap-side-card card">
            <div className="ap-card-header">
              <Layers size={15} />
              <span>Organize & List</span>
            </div>
            
            <div className="ap-card-body">
              {/* Category */}
              <div className="ap-group">
                <label className="ap-field-label">Category</label>
                <select 
                  name="category" 
                  className="ap-select" 
                  value={form.category} 
                  onChange={handleChange}
                >
                  <option value="Indoor">🪑 Indoor Essentials</option>
                  <option value="Outdoor">🏕️ Outdoor Gear</option>
                  <option value="Housing">🏠 Campus Housing</option>
                </select>
              </div>

              {/* Listing Type Option */}
              <div className="ap-group">
                <label className="ap-field-label">Listing Option</label>
                <div className="ap-listing-types-vertical">
                  {[
                    ['Rent', '📅 Rent listing', 'Earn daily on your item'],
                    ['Buy', '🛒 Sell permanently', 'One-time sale'],
                    ['Both', '🔄 Rent & Sell both', 'Offer both options']
                  ].map(([val, label, sub]) => (
                    <label key={val} className={`ap-type-radio-card ${form.listing_type === val ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="listing_type" 
                        value={val} 
                        checked={form.listing_type === val} 
                        onChange={handleChange}
                        className="ap-radio-input"
                      />
                      <div className="ap-tr-body">
                        <span className="ap-tr-title">{label}</span>
                        <span className="ap-tr-sub">{sub}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seller Account Indicator */}
              <div className="ap-group">
                <label className="ap-field-label">Listed Under Account</label>
                <div className="ap-seller-badge card">
                  <div className="ap-avatar">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="ap-info">
                    <span className="ap-seller-name">{user?.username || 'Verified Student'}</span>
                    <span className="ap-seller-label">Vendor Account Active</span>
                  </div>
                </div>
              </div>

              {/* Availability Switch */}
              <div className="ap-availability-switch">
                <input 
                  id="ap_is_avail" 
                  name="is_available" 
                  type="checkbox" 
                  checked={form.is_available} 
                  onChange={handleChange}
                  className="ap-checkbox-switch" 
                />
                <label htmlFor="ap_is_avail">
                  <strong>Listing is Active</strong>
                  <span>Visible to student community immediately</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Scoped CSS ── */}
      <style>{`
        .ap-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 10px 80px;
          font-family: 'DM Sans', var(--font);
        }

        /* Breadcrumbs */
        .ap-breadcrumb {
          margin-bottom: 24px;
        }
        .ap-breadcrumb ol {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          gap: 6px;
          align-items: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .ap-breadcrumb li a {
          color: var(--primary);
          transition: color 0.15s;
        }
        .ap-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .ap-breadcrumb li::after {
          content: '/';
          margin-left: 6px;
          color: var(--text-dim);
        }
        .ap-breadcrumb li.active::after {
          content: '';
        }
        .ap-breadcrumb li.active {
          color: var(--text);
          font-weight: 500;
        }

        /* Header */
        .ap-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .ap-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .ap-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }
        .ap-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ap-btn-discard {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid var(--border);
          background: var(--bg-2);
          transition: all 0.2s;
        }
        .ap-btn-discard:hover {
          background: var(--surface-hov);
          color: var(--text);
        }
        .ap-btn-publish {
          padding: 10px 22px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 700;
          color: #fff;
          background: var(--primary);
          box-shadow: 0 4px 12px var(--primary-glow);
          transition: all 0.2s;
        }
        .ap-btn-publish:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--primary-glow);
        }

        /* Grid Layout */
        .ap-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 28px;
          align-items: start;
        }

        /* Form elements */
        .ap-form-card {
          margin-bottom: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .ap-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          font-weight: 700;
          font-size: 14.5px;
          color: var(--text);
        }
        .ap-card-body {
          padding: 20px;
        }
        .ap-group {
          margin-bottom: 20px;
        }
        .ap-field-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .ap-input {
          width: 100%;
          height: 44px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0 14px;
          background: var(--bg-3);
          color: var(--text);
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .ap-input:focus {
          border-color: var(--primary);
        }
        .ap-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          background: var(--bg-3);
          color: var(--text);
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .ap-textarea:focus {
          border-color: var(--primary);
        }
        .ap-select {
          width: 100%;
          height: 44px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0 14px;
          background: var(--bg-3);
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
        }

        /* Upload zone */
        .ap-upload-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          background: var(--bg-3);
          transition: all 0.2s;
        }
        .ap-upload-zone:hover {
          border-color: var(--primary);
        }
        .ap-upload-zone.has-preview {
          padding: 0;
          border: none;
          height: 240px;
        }
        .ap-preview-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .ap-img-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--radius-lg);
        }
        .ap-btn-remove-img {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .ap-btn-remove-img:hover {
          background: var(--danger);
        }
        .ap-upload-icon {
          color: var(--text-dim);
          margin-bottom: 12px;
        }
        .ap-upload-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }
        .ap-link-text {
          color: var(--primary);
          text-decoration: underline;
        }
        .ap-upload-subtitle {
          font-size: 11px;
          color: var(--text-dim);
        }

        /* Tabs Card */
        .ap-tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border);
          background: var(--bg-2);
        }
        .ap-tab-btn {
          padding: 14px 20px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ap-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Pricing row */
        .ap-pricing-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ap-input-hint {
          display: block;
          font-size: 11.5px;
          color: var(--text-dim);
          margin-top: 4px;
        }

        /* Sidebar card style */
        .ap-side-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
        }
        .ap-listing-types-vertical {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ap-type-radio-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .ap-type-radio-card:hover {
          border-color: var(--primary-glow);
        }
        .ap-type-radio-card.selected {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        .ap-radio-input {
          accent-color: var(--primary);
          width: 16px;
          height: 16px;
        }
        .ap-tr-body {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .ap-tr-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }
        .ap-tr-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Seller badge */
        .ap-seller-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          height: 48px;
        }
        .ap-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ap-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .ap-seller-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }
        .ap-seller-label {
          font-size: 9.5px;
          font-weight: 600;
          color: var(--success);
        }

        /* Availability switch button style */
        .ap-availability-switch {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-3);
          border: 1px dashed var(--border);
        }
        .ap-checkbox-switch {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .ap-availability-switch label {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
          cursor: pointer;
        }
        .ap-availability-switch label strong {
          font-size: 12.5px;
          color: var(--text);
        }
        .ap-availability-switch label span {
          font-size: 11px;
          color: var(--text-muted);
        }

        .ap-counter-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-2);
          color: var(--text);
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ap-counter-btn:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Responsive layout */
        @media (max-width: 900px) {
          .ap-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  )
}
