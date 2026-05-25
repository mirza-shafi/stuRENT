import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Package,
  MessageCircle,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Calendar,
  ThumbsUp,
  CreditCard
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../components/CartWishlist'
import StudentService from '../../services/studentService'
import PaymentModal from '../../components/ui/PaymentModal'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const { data: product, loading } = useApi(
    () => StudentService.getProduct(id), [id]
  )

  const [mode, setMode]             = useState(null) // 'rent' | 'buy' (resolved dynamically)
  const [days, setDays]             = useState(3)
  const [quantity, setQuantity]     = useState(1)
  const [showPay, setShowPay]       = useState(false)
  const [inWish, setInWish]         = useState(false)
  const [activeTab, setActiveTab]   = useState('description') // 'description' | 'specifications' | 'reviews'

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (!product) return (
    <div className="empty-state card" style={{ marginTop: 32 }}>
      <Package size={48} className="empty-state__icon" />
      <p className="empty-state__title">Product not found</p>
      <Link to="/products" className="btn btn--primary">← All Products</Link>
    </div>
  )

  // Resolve pricing & availability details
  const isRentAvailable = product.listing_type === 'Rent' || product.listing_type === 'Both' || !product.listing_type
  const isBuyAvailable  = product.listing_type === 'Buy' || product.listing_type === 'Both'
  const currentMode     = mode || (isRentAvailable ? 'rent' : 'buy')

  const basePrice       = parseFloat(product.price)
  const rentOriginal    = (basePrice * 1.25).toFixed(2)
  const rentDiscount    = 20 // 20% off mock

  const buyPrice        = product.buy_price || (basePrice * 30).toFixed(2)
  const buyOriginal     = (parseFloat(buyPrice) * 1.15).toFixed(2)
  const buyDiscount     = 15 // 15% off mock

  const currentPrice    = currentMode === 'rent' ? basePrice : parseFloat(buyPrice)
  const currentOriginal = currentMode === 'rent' ? rentOriginal : buyOriginal
  const currentDiscount = currentMode === 'rent' ? rentDiscount : buyDiscount

  const rentTotal       = (basePrice * days * quantity).toFixed(2)
  const buyTotal        = (parseFloat(buyPrice) * quantity).toFixed(2)
  const overallTotal    = currentMode === 'rent' ? rentTotal : buyTotal

  // Auto start chat if redirected back from login
  useEffect(() => {
    if (location.state?.startChat && user && product) {
      navigate(location.pathname, { replace: true, state: {} })
      handleMessage()
    }
  }, [location.state, user, product])

  const handleAction = () => {
    if (!user) {
      toast.error('Please sign in first')
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    setShowPay(true)
  }

  const handleMessage = () => {
    if (!user) {
      toast.error('Please sign in to message')
      navigate('/login', { state: { from: window.location.pathname, startChat: true } })
      return
    }
    
    // Check if current user is the poster of the product
    const isPoster = product.posted_by 
      ? user.email === product.posted_by.email 
      : user.is_staff;
      
    if (isPoster) {
      toast.error('You cannot chat with yourself');
      return;
    }

    const recipient = product.posted_by ? {
      email: product.posted_by.email,
      name: product.posted_by.name,
      id: product.posted_by.id,
      type: 'customer'
    } : {
      email: 'admin@sturent.com',
      name: 'Admin',
      id: 'admin',
      type: 'admin'
    };

    navigate(user.is_staff ? '/admin/messages' : '/messages', {
      state: {
        recipient,
        product: {
          id: product.id,
          name: product.name,
          price: product.price
        }
      }
    })
    toast('Opening chat with owner...', { icon: '💬' })
  }

  const toggleWishlist = () => {
    setInWish(prev => {
      const next = !prev
      toast(next ? 'Added to Wishlist' : 'Removed from Wishlist', { icon: next ? '❤️' : '💔' })
      return next
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Product link copied to clipboard!')
  }

  // Get emoji based on category
  const categoryEmoji = product.category === 'Indoor' ? '🪑' : product.category === 'Housing' ? '🏠' : '🏕️'
  const catColor = product.category === 'Indoor' ? 'var(--primary)' : '#ef4444'

  return (
    <div className="pd-container fade-in">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="pd-breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to={`/products?category=${product.category}`}>{product.category}</Link></li>
          <li className="active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* ── Main Details Layout ── */}
      <div className="pd-layout">
        {/* Left Column — Visuals */}
        <div className="pd-visual-col">
          <div className="pd-image-box card">
            {product.image ? (
              <img src={`${product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}`} alt={product.name} className="pd-main-img" />
            ) : (
              <div className="pd-emoji-placeholder">
                <span className="pd-emoji">{categoryEmoji}</span>
              </div>
            )}
            <span className={`pd-status-badge ${product.is_available ? 'avail' : 'booked'}`}>
              {product.is_available ? 'Available' : 'Booked'}
            </span>
          </div>

          {/* Gallery Thumbnails (Decorative fallback styles matching Phoenix) */}
          <div className="pd-thumbs">
            <div className="pd-thumb active">
              {product.image ? <img src={`${product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}`} alt="" /> : <span>{categoryEmoji}</span>}
            </div>
            <div className="pd-thumb">
              <span>🌟</span>
            </div>
            <div className="pd-thumb">
              <span>📸</span>
            </div>
            <div className="pd-thumb">
              <span>📐</span>
            </div>
          </div>

          {/* Action Row Below Image */}
          <div className="pd-visual-actions" style={{ justifyContent: 'center' }}>
            <button className={`pd-wishlist-btn ${inWish ? 'active' : ''}`} onClick={toggleWishlist} style={{ width: '100%', justifyContent: 'center' }}>
              <Heart size={16} fill={inWish ? 'var(--danger)' : 'none'} color={inWish ? 'var(--danger)' : 'currentColor'} />
              {inWish ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>
        </div>

        {/* Right Column — Details & Selection */}
        <div className="pd-details-col">
          {/* Header Block */}
          <div className="pd-header-block">
            <div className="pd-meta-row">
              <span className="pd-category-badge" style={{ color: catColor, background: `${catColor}15` }}>
                {product.category}
              </span>
              <span className="pd-sb-name-small">
                👤 Listed by <strong>{product.posted_by?.name || 'Admin'}</strong>
              </span>
            </div>
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-rating-box">
              <div className="pd-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={13} fill={s <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                ))}
              </div>
              <span className="pd-rating-text">4.2 (18 reviews)</span>
              <span className={`pd-status-badge-inline ${product.is_available ? 'avail' : 'booked'}`}>
                {product.is_available ? '● Available' : '● Booked'}
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="pd-price-row-compact">
            <div className="pd-current-price">
              ${currentPrice.toFixed(2)}
              <span className="pd-price-unit">{currentMode === 'rent' ? '/day' : ' outright'}</span>
            </div>
            <div className="pd-old-price">${currentOriginal}</div>
            <div className="pd-discount-tag">{currentDiscount}% off</div>
          </div>

          {/* Rent/Buy Segment Control */}
          {(isRentAvailable && isBuyAvailable) && (
            <div className="pd-segment-control-compact">
              <button 
                className={`pd-segment-btn ${currentMode === 'rent' ? 'active' : ''}`}
                onClick={() => setMode('rent')}
              >
                📅 Rent Listing
              </button>
              <button 
                className={`pd-segment-btn ${currentMode === 'buy' ? 'active' : ''}`}
                onClick={() => setMode('buy')}
              >
                🛒 Purchase Item
              </button>
            </div>
          )}

          {/* Combined Configuration & Calculator Card */}
          <div className="pd-config-card card">
            {/* Quantity Selector */}
            <div className="pd-config-row">
              <span className="pd-config-label">Quantity</span>
              <div className="pd-qty-picker-compact">
                <button 
                  className="pd-qty-btn-compact" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  className="pd-qty-input-compact" 
                  value={quantity} 
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                />
                <button 
                  className="pd-qty-btn-compact" 
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Rent Duration Slider (Only if Rent mode) */}
            {currentMode === 'rent' && (
              <div className="pd-duration-row">
                <div className="pd-duration-label-row">
                  <span className="pd-config-label">Duration</span>
                  <span className="pd-duration-val"><strong>{days} day{days > 1 ? 's' : ''}</strong></span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={30} 
                  value={days} 
                  onChange={e => setDays(Number(e.target.value))} 
                  className="pd-range" 
                />
              </div>
            )}

            {/* Compact Breakdown */}
            <div className="pd-breakdown-compact">
              <div className="pd-bd-row">
                <span>{currentMode === 'rent' ? 'Rental Subtotal' : 'Item Subtotal'}</span>
                <span>${currentMode === 'rent' ? rentTotal : buyTotal}</span>
              </div>
              {currentMode === 'rent' && (
                <div className="pd-bd-row deposit">
                  <span>Refundable Deposit</span>
                  <span>+${(basePrice * 5).toFixed(2)}</span>
                </div>
              )}
              <div className="pd-bd-row total">
                <span>Total Cost</span>
                <span>${currentMode === 'rent' ? (parseFloat(rentTotal) + basePrice * 5).toFixed(2) : buyTotal}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pd-action-buttons">
            <button 
              id="action-btn" 
              className="pd-btn-checkout" 
              onClick={handleAction}
              disabled={!product.is_available}
            >
              <CreditCard size={16} />
              {currentMode === 'rent' ? 'Rent Now' : 'Buy Now'}
            </button>

            <button 
              className="pd-btn-add-cart" 
              onClick={() => addToCart(product, quantity)}
              disabled={!product.is_available}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <button className="pd-btn-chat" onClick={handleMessage}>
              <MessageCircle size={16} />
              Chat
            </button>
          </div>

          {/* Unified mini specs */}
          <div className="pd-mini-specs">
            <span>🛡️ Campus Escrow Protection</span>
            <span>•</span>
            <span>🤝 Free Pickup</span>
            <span>•</span>
            <span>🔄 24h Free Cancel</span>
          </div>
        </div>
      </div>

      {/* ── Tabs Content Block (Description, Specifications, Reviews) ── */}
      <div className="pd-tabs-section">
        <ul className="pd-tabs-header">
          <li>
            <button 
              className={activeTab === 'description' ? 'active' : ''} 
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'specifications' ? 'active' : ''} 
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''} 
              onClick={() => setActiveTab('reviews')}
            >
              Ratings & Reviews (18)
            </button>
          </li>
        </ul>

        <div className="pd-tabs-content card">
          {activeTab === 'description' && (
            <div className="pd-tab-panel">
              <h3>Product Description</h3>
              <p className="pd-desc-text">
                {product.description || 'No description provided for this listing.'}
              </p>
              <div className="pd-desc-info-block">
                <h4>Handoff & Location details</h4>
                <p>
                  This item is listed for local student exchange. Standard exchange happens at the campus library lobby or student union hall. Please message the seller to confirm a meeting time and place.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="pd-tab-panel">
              <table className="pd-spec-table">
                <tbody>
                  <tr>
                    <th>Category</th>
                    <td>{product.category}</td>
                  </tr>
                  <tr>
                    <th>Listing Type</th>
                    <td>{product.listing_type || 'Rent only'}</td>
                  </tr>
                  <tr>
                    <th>Refundable Security Deposit</th>
                    <td>{currentMode === 'rent' ? `$${(basePrice * 5).toFixed(2)}` : 'None (Purchased item)'}</td>
                  </tr>
                  <tr>
                    <th>Condition</th>
                    <td>Excellent (Verified gently used)</td>
                  </tr>
                  <tr>
                    <th>Campus Handoff</th>
                    <td>Available (Free at main campus library/quad)</td>
                  </tr>
                  <tr>
                    <th>Available to</th>
                    <td>All verified university students</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pd-tab-panel">
              <div className="pd-reviews-summary">
                <div className="pd-rs-score">
                  <h2>4.2</h2>
                  <div className="pd-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                    ))}
                  </div>
                  <span>18 Ratings</span>
                </div>
                <div className="pd-rs-bars">
                  <div className="pd-rs-bar-row">
                    <span>5 stars</span>
                    <div className="pd-rs-bar-fill"><div style={{ width: '70%', background: 'var(--warning)' }} /></div>
                    <span>70%</span>
                  </div>
                  <div className="pd-rs-bar-row">
                    <span>4 stars</span>
                    <div className="pd-rs-bar-fill"><div style={{ width: '15%', background: 'var(--warning)' }} /></div>
                    <span>15%</span>
                  </div>
                  <div className="pd-rs-bar-row">
                    <span>3 stars</span>
                    <div className="pd-rs-bar-fill"><div style={{ width: '10%', background: 'var(--warning)' }} /></div>
                    <span>10%</span>
                  </div>
                  <div className="pd-rs-bar-row">
                    <span>2 stars</span>
                    <div className="pd-rs-bar-fill"><div style={{ width: '5%', background: 'var(--warning)' }} /></div>
                    <span>5%</span>
                  </div>
                </div>
              </div>

              <div className="pd-reviews-list">
                <div className="pd-review-card">
                  <div className="pd-rc-header">
                    <span className="pd-rc-avatar">RJ</span>
                    <div>
                      <div className="pd-rc-name">Ryan Jones</div>
                      <div className="pd-rc-date">May 14, 2026</div>
                    </div>
                    <div className="pd-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={11} fill={s <= 5 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                      ))}
                    </div>
                  </div>
                  <p className="pd-rc-comment">
                    Excellent item, very clean and exactly as described. The owner met me right at the quad and made the whole process smooth. Definitely renting again!
                  </p>
                  <button className="pd-rc-helpful"><ThumbsUp size={11} /> Helpful (4)</button>
                </div>

                <div className="pd-review-card">
                  <div className="pd-rc-header">
                    <span className="pd-rc-avatar">AL</span>
                    <div>
                      <div className="pd-rc-name">Ashley Lopez</div>
                      <div className="pd-rc-date">May 02, 2026</div>
                    </div>
                    <div className="pd-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={11} fill={s <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                      ))}
                    </div>
                  </div>
                  <p className="pd-rc-comment">
                    Worked perfectly for my weekend camping trip. Small wear and tear but doesn't affect functionality at all. Very reasonable price.
                  </p>
                  <button className="pd-rc-helpful"><ThumbsUp size={11} /> Helpful (2)</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Payment modal ── */}
      {showPay && (
        <PaymentModal
          product={{
            ...product,
            price: (basePrice * quantity).toFixed(2),
            buy_price: (parseFloat(buyPrice) * quantity).toFixed(2)
          }}
          rentDays={days}
          mode={currentMode}
          onClose={() => setShowPay(false)}
          onSuccess={() => { setTimeout(() => { setShowPay(false); navigate('/my-orders') }, 1500) }}
        />
      )}

      {/* ── Scoped Styling ── */}
      <style>{`
        /* Page container */
        .pd-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 10px 80px;
          font-family: 'DM Sans', var(--font);
        }

        /* Breadcrumbs styling matching Phoenix */
        .pd-breadcrumb {
          margin-bottom: 24px;
        }
        .pd-breadcrumb ol {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          gap: 6px;
          align-items: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .pd-breadcrumb li a {
          color: var(--primary);
          transition: color 0.15s;
        }
        .pd-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .pd-breadcrumb li::after {
          content: '/';
          margin-left: 6px;
          color: var(--text-dim);
        }
        .pd-breadcrumb li.active::after {
          content: '';
        }
        .pd-breadcrumb li.active {
          color: var(--text);
          font-weight: 500;
        }

        /* Layout columns grid */
        .pd-layout {
          display: grid;
          grid-template-columns: 1.1fr 1.2fr;
          gap: 40px;
          align-items: start;
        }

        /* Visuals left column styling */
        .pd-visual-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pd-image-box {
          height: 380px;
          position: relative;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pd-emoji-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, var(--primary-glow) 0%, transparent 70%);
        }
        .pd-emoji {
          font-size: 110px;
          transition: transform 0.3s;
        }
        .pd-image-box:hover .pd-emoji {
          transform: scale(1.08) rotate(2deg);
        }
        .pd-status-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          z-index: 10;
        }
        .pd-status-badge.avail {
          background: rgba(16, 185, 129, 0.9);
          color: #fff;
        }
        .pd-status-badge.booked {
          background: rgba(239, 68, 68, 0.9);
          color: #fff;
        }

        /* Thumbnails row */
        .pd-thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .pd-thumb {
          aspect-ratio: 1.2;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          overflow: hidden;
        }
        .pd-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pd-thumb:hover, .pd-thumb.active {
          border-color: var(--primary);
          box-shadow: 0 0 10px var(--primary-glow);
        }

        /* Wishlist and share */
        .pd-visual-actions {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 12px;
        }
        .pd-wishlist-btn, .pd-share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          background: var(--bg-2);
          color: var(--text);
        }
        .pd-wishlist-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--danger);
        }
        .pd-wishlist-btn.active {
          background: rgba(239, 68, 68, 0.12);
          border-color: var(--danger);
          color: var(--danger);
        }
        .pd-share-btn:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Details column styling */
        .pd-details-col {
          display: flex;
          flex-direction: column;
        }
        .pd-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .pd-category-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .pd-bestseller-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--warning);
          background: rgba(245, 158, 11, 0.1);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .pd-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.25;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }
        .pd-rating-box {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .pd-stars {
          display: flex;
          gap: 2px;
        }
        .pd-rating-text {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Pricing Card */
        .pd-price-card {
          padding: 16px 20px;
          margin-bottom: 20px;
          background: var(--bg-2);
          border: 1px solid var(--border);
        }
        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .pd-current-price {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: baseline;
        }
        .pd-price-unit {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
          margin-left: 2px;
        }
        .pd-old-price {
          font-size: 16px;
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .pd-discount-tag {
          font-size: 11px;
          font-weight: 700;
          color: var(--success);
          background: rgba(16, 185, 129, 0.12);
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .pd-price-sub {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Specs list */
        .pd-specs-short {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .pd-spec-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text-muted);
        }
        .pd-spec-icon {
          flex-shrink: 0;
        }
        .pd-spec-icon.green { color: var(--success); }
        .pd-spec-icon.blue { color: var(--accent); }
        .pd-spec-icon.orange { color: var(--warning); }

        /* Segment Section */
        .pd-segment-section {
          margin-bottom: 20px;
        }
        .pd-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .pd-segment-control {
          display: flex;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px;
          gap: 4px;
        }
        .pd-segment-btn {
          flex: 1;
          padding: 10px;
          text-align: center;
          font-weight: 700;
          font-size: 13.5px;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .pd-segment-btn:hover {
          color: var(--text);
        }
        .pd-segment-btn.active {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 2px 8px var(--primary-glow);
        }

        /* Quantity & Seller layout */
        .pd-options-row {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .pd-qty-picker {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-2);
          overflow: hidden;
          height: 44px;
        }
        .pd-qty-btn {
          width: 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .pd-qty-btn:hover:not(:disabled) {
          background: var(--surface-hov);
          color: var(--text);
        }
        .pd-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .pd-qty-input {
          flex: 1;
          width: 40px;
          text-align: center;
          border: none;
          background: transparent;
          color: var(--text);
          font-weight: 700;
          font-size: 15px;
        }
        
        /* Seller badge */
        .pd-seller-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          height: 44px;
        }
        .pd-sb-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-sb-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .pd-sb-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .pd-sb-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        /* Calculator cards */
        .pd-calc-card {
          padding: 16px;
          margin-bottom: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
        }
        .pd-calc-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          color: var(--text);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .pd-slider-row {
          display: flex;
          justify-content: justify;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .pd-slider-hint {
          color: var(--text-muted);
        }
        .pd-range {
          width: 100%;
          accent-color: var(--primary);
          margin-bottom: 16px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--bg-3);
          outline: none;
        }
        .pd-calc-breakdown {
          background: var(--bg-3);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pd-breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }
        .pd-breakdown-total {
          border-top: 1px dashed var(--border);
          margin-top: 6px;
          padding-top: 6px;
          font-weight: 800;
          font-size: 16px;
          color: var(--text);
        }
        .pd-breakdown-total span:last-child {
          color: var(--primary);
        }

        /* Action buttons row */
        .pd-action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .pd-btn-checkout {
          flex: 1.8;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--primary);
          color: #fff;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 14px var(--primary-glow);
          transition: all 0.2s;
        }
        .pd-btn-checkout:hover:not(:disabled) {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px var(--primary-glow);
        }
        .pd-btn-checkout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pd-btn-add-cart {
          flex: 1.5;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--bg-2);
          border: 2px solid var(--primary);
          color: var(--primary);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          cursor: pointer;
        }
        .pd-btn-add-cart:hover:not(:disabled) {
          background: var(--primary-glow);
          transform: translateY(-1px);
        }
        .pd-btn-add-cart:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pd-btn-chat {
          flex: 1;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .pd-btn-chat:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
        }
        .pd-security-note {
          font-size: 11px;
          color: var(--text-dim);
          text-align: center;
        }

        /* Bottom tabs layout */
        .pd-tabs-section {
          margin-top: 50px;
        }
        .pd-tabs-header {
          display: flex;
          list-style: none;
          border-bottom: 1px solid var(--border);
          gap: 20px;
          margin-bottom: 16px;
        }
        .pd-tabs-header button {
          padding: 12px 6px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .pd-tabs-header button:hover {
          color: var(--text);
        }
        .pd-tabs-header button.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          font-weight: 700;
        }
        .pd-tabs-content {
          padding: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        
        /* Tabs panel */
        .pd-tab-panel h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }
        .pd-desc-text {
          font-size: 14.5px;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .pd-desc-info-block {
          background: var(--bg-3);
          border-left: 3px solid var(--primary);
          padding: 14px 18px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
        .pd-desc-info-block h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .pd-desc-info-block p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Specifications table */
        .pd-spec-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pd-spec-table th, .pd-spec-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          text-align: left;
        }
        .pd-spec-table th {
          font-weight: 600;
          color: var(--text);
          width: 30%;
        }
        .pd-spec-table td {
          color: var(--text-muted);
        }

        /* Reviews Panel */
        .pd-reviews-summary {
          display: flex;
          align-items: center;
          gap: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .pd-rs-score {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .pd-rs-score h2 {
          font-size: 44px;
          font-weight: 800;
          line-height: 1;
          color: var(--text);
        }
        .pd-rs-score span {
          font-size: 12px;
          color: var(--text-muted);
        }
        .pd-rs-bars {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pd-rs-bar-row {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
          gap: 10px;
        }
        .pd-rs-bar-row span:first-child { width: 50px; text-align: right; }
        .pd-rs-bar-row span:last-child { width: 30px; }
        .pd-rs-bar-fill {
          flex: 1;
          height: 6px;
          background: var(--bg-3);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .pd-rs-bar-fill div {
          height: 100%;
          border-radius: var(--radius-full);
        }

        /* Reviews comments list */
        .pd-reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pd-review-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-2);
        }
        .pd-rc-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .pd-rc-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-3);
          color: var(--text);
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-rc-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
        }
        .pd-rc-date {
          font-size: 11px;
          color: var(--text-muted);
        }
        .pd-rc-comment {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 10px;
        }
        .pd-rc-helpful {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .pd-rc-helpful:hover {
          color: var(--primary);
          border-color: var(--primary-glow);
          background: var(--primary-glow);
        }

        /* Compact Right Column Styles */
        .pd-header-block {
          margin-bottom: 16px;
        }
        .pd-sb-name-small {
          font-size: 13px;
          color: var(--text-muted);
          margin-left: 12px;
        }
        .pd-status-badge-inline {
          font-size: 11px;
          font-weight: 700;
          margin-left: 12px;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .pd-status-badge-inline.avail {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }
        .pd-status-badge-inline.booked {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }
        .pd-price-row-compact {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 16px;
        }
        .pd-segment-control-compact {
          display: flex;
          gap: 8px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 3px;
          margin-bottom: 16px;
        }
        .pd-segment-btn {
          flex: 1;
          border: none;
          background: none;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }
        .pd-segment-btn.active {
          background: var(--surface);
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .pd-config-card {
          padding: 16px !important;
          margin-bottom: 16px !important;
          background: var(--bg-2);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pd-config-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pd-config-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .pd-qty-picker-compact {
          display: flex;
          align-items: center;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          height: 32px;
          overflow: hidden;
        }
        .pd-qty-btn-compact {
          width: 32px;
          height: 100%;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 15px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .pd-qty-btn-compact:hover:not(:disabled) {
          background: var(--surface-hov);
          color: var(--text);
        }
        .pd-qty-btn-compact:disabled {
          opacity: 0.3;
        }
        .pd-qty-input-compact {
          width: 36px;
          border: none;
          background: none;
          text-align: center;
          color: var(--text);
          font-weight: 700;
          font-size: 14px;
        }
        .pd-duration-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pd-duration-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .pd-breakdown-compact {
          background: var(--bg-3);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pd-bd-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }
        .pd-bd-row.deposit {
          color: var(--warning);
        }
        .pd-bd-row.total {
          border-top: 1px dashed var(--border);
          margin-top: 4px;
          padding-top: 4px;
          font-weight: 700;
          font-size: 15px;
          color: var(--text);
        }
        .pd-bd-row.total span:last-child {
          color: var(--primary);
        }
        .pd-mini-specs {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: 12px;
          padding: 8px;
          background: var(--bg-3);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .pd-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .pd-image-box {
            height: 320px;
          }
        }
      `}</style>
    </div>
  )
}
