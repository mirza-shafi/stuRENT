import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Plus,
  Package,
  Eye,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  ArrowRight,
  ImageIcon,
  X
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import ProductService from '../../services/productService'
import toast from 'react-hot-toast'

export default function MyProducts() {
  const { data, loading, execute: refetch } = useApi(ProductService.getMyProducts)
  const [filterTab, setFilterTab] = useState('All') // 'All' | 'approved' | 'pending' | 'rejected'
  const [viewItem, setViewItem] = useState(null)
  
  const allProducts = data?.results ?? data ?? []

  // Stats
  const approvedCount = allProducts.filter(p => p.approval_status === 'approved').length
  const pendingCount = allProducts.filter(p => p.approval_status === 'pending').length
  const rejectedCount = allProducts.filter(p => p.approval_status === 'rejected').length

  const filteredProducts = allProducts.filter(p => {
    if (filterTab === 'All') return true
    return p.approval_status === filterTab
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await ProductService.delete(id)
      toast.success('Listing deleted successfully!')
      refetch()
    } catch {
      toast.error('Failed to delete listing.')
    }
  }

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

  return (
    <div className="mp-container fade-in">
      {/* Page Header */}
      <div className="mp-header">
        <div>
          <h1 className="mp-title">My Products</h1>
          <p className="mp-subtitle">Manage and track the approval status of your marketplace listings</p>
        </div>
        <Link to="/products/add-product" className="mp-btn-primary">
          <Plus size={15} /> Add a Product
        </Link>
      </div>

      {/* Stats Cards */}
      {allProducts.length > 0 && (
        <div className="mp-stats-grid">
          <div className="mp-stat-card card">
            <span className="mp-stat-val text-success">{approvedCount}</span>
            <span className="mp-stat-lbl">Approved & Live</span>
          </div>
          <div className="mp-stat-card card">
            <span className="mp-stat-val text-warning">{pendingCount}</span>
            <span className="mp-stat-lbl">Pending Review</span>
          </div>
          <div className="mp-stat-card card">
            <span className="mp-stat-val text-danger">{rejectedCount}</span>
            <span className="mp-stat-lbl">Rejected / Action</span>
          </div>
          <div className="mp-stat-card card">
            <span className="mp-stat-val">{allProducts.length}</span>
            <span className="mp-stat-lbl">Total Submitted</span>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { key: 'All', label: 'All Listings', count: allProducts.length },
          { key: 'approved', label: 'Approved', count: approvedCount, clr: 'var(--success)' },
          { key: 'pending', label: 'Pending Review', count: pendingCount, clr: 'var(--warning)' },
          { key: 'rejected', label: 'Rejected', count: rejectedCount, clr: 'var(--danger)' }
        ].map(t => {
          const isActive = filterTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              style={{
                padding: '10px 14px',
                fontWeight: 600,
                fontSize: '14px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '99px',
                background: isActive ? 'var(--primary-glow)' : 'var(--surface)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mp-loading">
          <span className="mp-spinner" />
          <p>Loading your products...</p>
        </div>
      ) : allProducts.length === 0 ? (
        <div className="mp-empty-state card">
          <Package size={48} className="mp-empty-icon" />
          <h3>No products submitted</h3>
          <p>Be a vendor by posting your indoor essentials, housing, or outdoor gear for rent/sale!</p>
          <Link to="/products/add-product" className="mp-btn-primary" style={{ marginTop: '16px' }}>
            Post a Listing <ArrowRight size={14} />
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No listings found in this tab.
        </div>
      ) : (
        <div className="mp-list">
          {filteredProducts.map((p, idx) => (
            <div
              key={p.id}
              className="mp-item-card card"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Product Info */}
              <div className="mp-card-left">
                <div className="mp-img-wrapper">
                  {p.image ? (
                    <img src={p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`} alt={p.name} />
                  ) : (
                    <span>{p.category === 'Indoor' ? '🪑' : p.category === 'Housing' ? '🏠' : '🏕️'}</span>
                  )}
                </div>
                <div className="mp-info-block">
                  <h3>{p.name}</h3>
                  <div className="mp-meta-row">
                    <span className="mp-category-badge">{p.category}</span>
                    <span className="mp-meta-dot">•</span>
                    <span className="mp-meta-item">
                      <Calendar size={12} style={{ marginRight: 4 }} />
                      {new Date(p.date_created).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price, Status, Actions */}
              <div className="mp-card-right">
                <div className="mp-price-info">
                  {p.listing_type !== 'Buy' && (
                    <span className="mp-price-text">
                      ${parseFloat(p.price).toFixed(2)}
                      <span className="mp-price-unit">/day</span>
                    </span>
                  )}
                  {p.listing_type === 'Both' && <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>or</span>}
                  {p.listing_type !== 'Rent' && p.buy_price && (
                    <span className="mp-price-text text-success">
                      ${parseFloat(p.buy_price).toFixed(2)}
                      <span className="mp-price-unit"> Buy</span>
                    </span>
                  )}
                </div>

                <div className="mp-status-wrapper">
                  {p.approval_status === 'approved' && (
                    <span className="mp-status-badge badge-success">
                      <CheckCircle size={12} /> Approved
                    </span>
                  )}
                  {p.approval_status === 'pending' && (
                    <span className="mp-status-badge badge-warning">
                      <Clock size={12} /> Pending Review
                    </span>
                  )}
                  {p.approval_status === 'rejected' && (
                    <span className="mp-status-badge badge-danger">
                      <XCircle size={12} /> Rejected
                    </span>
                  )}
                </div>

                <div className="mp-actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => setViewItem(p)} title="View Detail">
                    <Eye size={14} />
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: 480, background: 'var(--bg-2)', borderLeft: '1px solid var(--border)', overflowY: 'auto', zIndex: 1000, animation: 'mpSlideInRight .25s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 10 }}>
              <div>
                <div style={{ fontWeight: 850, fontSize: 18 }}>Listing details</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: #{viewItem.id}</div>
              </div>
              <button onClick={() => setViewItem(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={15} /></button>
            </div>

            <div style={{ height: 220, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, position: 'relative', overflow: 'hidden' }}>
              {viewItem.image ? (
                <img src={viewItem.image.startsWith('http') ? viewItem.image : `${BASE_URL}${viewItem.image}`} alt={viewItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{viewItem.category === 'Indoor' ? '🪑' : viewItem.category === 'Housing' ? '🏠' : '🏕️'}</span>
              )}
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: viewItem.approval_status === 'approved' ? 'rgba(16,185,129,.95)' : viewItem.approval_status === 'pending' ? 'rgba(245,158,11,.95)' : 'rgba(239,68,68,.95)', color: '#fff' }}>
                {viewItem.approval_status === 'approved' ? 'Live on Marketplace' : viewItem.approval_status === 'pending' ? 'Pending Review' : 'Rejected'}
              </span>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{viewItem.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: 'rgba(99,102,241,.12)', color: 'var(--primary)' }}>
                  {viewItem.category}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {viewItem.listing_type !== 'Buy' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Rent Price</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>${viewItem.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/day</span></div>
                  </div>
                )}
                {viewItem.listing_type !== 'Rent' && viewItem.buy_price && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Buy Price</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>${viewItem.buy_price}</div>
                  </div>
                )}
              </div>

              {/* Status Explanation Alerts */}
              <div style={{ marginBottom: 20 }}>
                {viewItem.approval_status === 'pending' && (
                  <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--warning)', lineHeight: 1.5 }}>
                    <strong>⏳ Under Review:</strong> This listing is currently being reviewed by campus moderators. It will appear on the public browse catalog once approved.
                  </div>
                )}
                {viewItem.approval_status === 'rejected' && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--danger)', lineHeight: 1.5 }}>
                    <strong>❌ Rejected:</strong> This listing did not meet our community posting guidelines. Please make sure the photo is clear and description details comply with code of conduct.
                  </div>
                )}
                {viewItem.approval_status === 'approved' && (
                  <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--success)', lineHeight: 1.5 }}>
                    <strong>✓ Published:</strong> Your listing is live! Other students can view and request to rent or purchase it now.
                  </div>
                )}
              </div>

              {viewItem.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>{viewItem.description}</p>
                </div>
              )}

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                  <Calendar size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Submitted on</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {new Date(viewItem.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
                  <Tag size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Listing type</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{viewItem.listing_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .mp-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 0 80px;
        }
        .mp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .mp-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .mp-subtitle {
          font-size: 14.5px;
          color: var(--text-muted);
        }
        .mp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          background: var(--primary);
          transition: all var(--transition);
          text-decoration: none;
        }
        .mp-btn-primary:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .mp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }
        .mp-stat-card {
          padding: 18px 24px;
          display: flex;
          flex-direction: column;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .mp-stat-val {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .mp-stat-val.text-success { color: var(--success); }
        .mp-stat-val.text-warning { color: var(--warning); }
        .mp-stat-val.text-danger { color: var(--danger); }
        .mp-stat-lbl {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mp-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mp-item-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all var(--transition);
          gap: 24px;
          opacity: 0;
          transform: translateY(16px);
          animation: mpSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mp-item-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: var(--shadow-lg);
        }
        @keyframes mpSlideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-card-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 0;
        }
        .mp-img-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--bg-3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid var(--border);
          flex-shrink: 0;
          font-size: 24px;
        }
        .mp-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mp-info-block {
          flex: 1;
          min-width: 0;
        }
        .mp-info-block h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mp-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .mp-category-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--surface);
          color: var(--text-muted);
        }
        .mp-meta-dot {
          color: var(--text-dim);
        }

        .mp-card-right {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }
        .mp-price-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 100px;
        }
        .mp-price-text {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
        }
        .mp-price-unit {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-muted);
        }

        .mp-status-wrapper {
          min-width: 130px;
          display: flex;
          justify-content: flex-end;
        }
        .mp-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-success { background: rgba(16, 185, 129, 0.12); color: var(--success); }
        .badge-warning { background: rgba(245, 158, 11, 0.12); color: var(--warning); }
        .badge-danger { background: rgba(239, 68, 68, 0.12); color: var(--danger); }

        .mp-actions {
          display: flex;
          gap: 8px;
        }

        .mp-loading {
          height: 40vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-muted);
        }
        .mp-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: mpSpin 1s infinite linear;
        }
        @keyframes mpSpin {
          to { transform: rotate(360deg); }
        }

        .mp-empty-state {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 500px;
          margin: 40px auto 0;
        }
        .mp-empty-icon {
          color: var(--text-dim);
          margin-bottom: 20px;
        }
        .mp-empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .mp-empty-state p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        @keyframes mpSlideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }

        @media (max-width: 768px) {
          .mp-item-card {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 16px 20px;
          }
          .mp-card-right {
            border-top: 1px solid var(--border);
            padding-top: 16px;
            justify-content: space-between;
          }
          .mp-price-info {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
