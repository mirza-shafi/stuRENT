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
import './ProductDetail.css'

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
    const isPoster = product?.posted_by 
      ? user.email === product.posted_by.email 
      : user.is_staff;
      
    if (isPoster) {
      toast.error('You cannot chat with yourself');
      return;
    }

    const recipient = product?.posted_by ? {
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
          id: product?.id,
          name: product?.name,
          price: product?.price
        }
      }
    })
    toast('Opening chat with owner...', { icon: '💬' })
  }

  // Auto start chat if redirected back from login
  useEffect(() => {
    if (location.state?.startChat && user && product) {
      navigate(location.pathname, { replace: true, state: {} })
      handleMessage()
    }
  }, [location.state, user, product])

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

  const depositMultiplier = product.category === 'Housing' ? 2 : 5
  const depositAmount   = currentMode === 'rent' ? (basePrice * depositMultiplier) : 0
  const overallTotalWithDeposit = currentMode === 'rent' ? (parseFloat(rentTotal) + depositAmount).toFixed(2) : buyTotal

  const toggleWishlist = () => {
    setInWish(prev => {
      const next = !prev
      return next
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Product link copied to clipboard!')
  }

  const handlePaymentSuccess = async () => {
    const toastId = toast.loading('Recording order on server...')
    try {
      await StudentService.rent({
        product_id: product.id,
        note: currentMode === 'rent'
          ? `Direct rent for ${days} ${product.category === 'Housing' ? 'month' : 'day'}(s) from details page.`
          : `Direct purchase from details page.`
      })
      toast.dismiss(toastId)
      toast.success('Order placed successfully!', { icon: '🎉' })
      setTimeout(() => {
        setShowPay(false)
        navigate('/my-orders')
      }, 1500)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err.response?.data?.error || 'Failed to place order on server.')
    }
  }

  // Get emoji based on category
  const categoryEmoji = product.category === 'Indoor' ? '🪑' : product.category === 'Housing' ? '🏠' : '🏕️'
  const catColor = product.category === 'Indoor' ? 'var(--primary)' : '#ef4444'

  if (product.category === 'Housing') {
    return (
      <div className="pd-container fade-in">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="pd-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to={`/products?category=Housing`}>Housing</Link></li>
            <li className="active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* ── Main Details Layout ── */}
        <div className="pd-layout">
          {/* Left Column — Visuals */}
          <div className="pd-visual-col">
            <div className="pd-image-box card">
              {product.image ? (
                <img src={`${product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}`} alt={product.name} className="pd-main-img" />
              ) : (
                <div className="pd-emoji-placeholder">
                  <span className="pd-emoji">🏠</span>
                </div>
              )}
              <span className={`pd-status-badge ${product.is_available ? 'avail' : 'booked'}`}>
                {product.is_available ? 'Available' : 'Booked'}
              </span>
            </div>

            {/* Real Estate thumbnails */}
            <div className="pd-thumbs">
              <div className="pd-thumb active">
                {product.image ? <img src={`${product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}`} alt="" /> : <span>🏠</span>}
              </div>
              <div className="pd-thumb">
                <span>🛏️ Rooms</span>
              </div>
              <div className="pd-thumb">
                <span>🚿 Baths</span>
              </div>
              <div className="pd-thumb">
                <span>📐 Plan</span>
              </div>
            </div>

            {/* Action Row Below Image */}
            <div className="pd-visual-actions" style={{ justifyContent: 'center' }}>
              <button className={`pd-wishlist-btn ${inWish ? 'active' : ''}`} onClick={toggleWishlist} style={{ width: '100%', justifyContent: 'center' }}>
                <Heart size={16} fill={inWish ? 'var(--danger)' : 'none'} color={inWish ? 'var(--danger)' : 'currentColor'} />
                {inWish ? 'Shortlisted' : 'Save to Shortlist'}
              </button>
            </div>
          </div>

          {/* Right Column — Details & Selection */}
          <div className="pd-details-col">
            {/* Header Block */}
            <div className="pd-header-block">
              <div className="pd-meta-row">
                <span className="pd-category-badge" style={{ color: catColor, background: `${catColor}15` }}>
                  🏠 Campus Housing
                </span>
                <span className="pd-sb-name-small">
                  👤 Landlord: <strong>{product.posted_by?.name || 'Admin'}</strong>
                </span>
              </div>
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-rating-box">
                <div className="pd-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={13} fill={s <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                  ))}
                </div>
                <span className="pd-rating-text">4.8 (5 reviews)</span>
                <span className={`pd-status-badge-inline ${product.is_available ? 'avail' : 'booked'}`}>
                  {product.is_available ? '● Available' : '● Booked'}
                </span>
              </div>
            </div>

            {/* Prominent Housing Specifications Grid */}
            <div className="housing-specs-panel">
              <h3 className="housing-specs-title">📋 Property Details</h3>
              <div className="housing-specs-grid">
                <div className="housing-spec-item">
                  <span className="hsi-icon">📍</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Location / Area</span>
                    <strong className="hsi-val">{product.area || 'N/A'}, {product.city || 'N/A'}</strong>
                  </div>
                </div>
                <div className="housing-spec-item">
                  <span className="hsi-icon">🏢</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Property Type</span>
                    <strong className="hsi-val">{product.house_type || 'Apartment'}</strong>
                  </div>
                </div>
                <div className="housing-spec-item">
                  <span className="hsi-icon">📐</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Flat Size</span>
                    <strong className="hsi-val">{product.flat_size ? `${product.flat_size} sqft` : 'N/A'}</strong>
                  </div>
                </div>
                <div className="housing-spec-item">
                  <span className="hsi-icon">🛏️</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Rooms / Bedrooms</span>
                    <strong className="hsi-val">{product.rooms || 0} Bed{product.rooms !== 1 ? 's' : ''}</strong>
                  </div>
                </div>
                <div className="housing-spec-item">
                  <span className="hsi-icon">🚿</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Bathrooms</span>
                    <strong className="hsi-val">{product.bathrooms || 0} Bath{product.bathrooms !== 1 ? 's' : ''}</strong>
                  </div>
                </div>
                <div className="housing-spec-item">
                  <span className="hsi-icon">❄️</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Air Conditioning</span>
                    <strong className="hsi-val">{product.ac_included ? 'AC Included' : 'No AC'}</strong>
                  </div>
                </div>
                <div className="housing-spec-item" style={{ gridColumn: 'span 2' }}>
                  <span className="hsi-icon">🛋️</span>
                  <div className="hsi-info">
                    <span className="hsi-label">Furnishing Status</span>
                    <strong className="hsi-val">{product.furnished ? 'Fully Furnished (Ready to move)' : 'Unfurnished / Empty'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Block */}
            <div className="pd-price-row-compact" style={{ marginTop: '16px' }}>
              <div className="pd-current-price">
                ${currentPrice.toFixed(2)}
                <span className="pd-price-unit">
                  {currentMode === 'rent' ? '/month' : ' outright'}
                </span>
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
                  📅 Rent Monthly
                </button>
                <button 
                  className={`pd-segment-btn ${currentMode === 'buy' ? 'active' : ''}`}
                  onClick={() => setMode('buy')}
                >
                  🛒 Purchase House
                </button>
              </div>
            )}

            {/* Combined Configuration & Calculator Card */}
            <div className="pd-config-card card housing-config-card">
              {/* Rent Duration Slider (Only if Rent mode) */}
              {currentMode === 'rent' && (
                <div className="pd-duration-row">
                  <div className="pd-duration-label-row">
                    <span className="pd-config-label">Lease Duration</span>
                    <span className="pd-duration-val">
                      <strong>{days} month{days !== 1 ? 's' : ''}</strong>
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={12} 
                    value={days} 
                    onChange={e => setDays(Number(e.target.value))} 
                    className="pd-range" 
                  />
                </div>
              )}

              {/* Compact Breakdown */}
              <div className="pd-breakdown-compact">
                <div className="pd-bd-row">
                  <span>{currentMode === 'rent' ? 'Lease Subtotal' : 'Purchase Price'}</span>
                  <span>${currentMode === 'rent' ? rentTotal : buyTotal}</span>
                </div>
                {currentMode === 'rent' && (
                  <div className="pd-bd-row deposit">
                    <span>Security Deposit (Refundable - 2 months)</span>
                    <span>+${depositAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pd-bd-row total">
                  <span>Initial Due Payment</span>
                  <span>${overallTotalWithDeposit}</span>
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
                {currentMode === 'rent' ? 'Rent Property Now' : 'Buy Property Now'}
              </button>

              <button className="pd-btn-chat" onClick={handleMessage} style={{ flex: 1.2 }}>
                <MessageCircle size={16} />
                Chat with Landlord
              </button>
            </div>

            {/* Specific Housing Badges */}
            <div className="pd-mini-specs housing-mini-specs">
              <span>🛡️ Verified Landlord</span>
              <span>•</span>
              <span>📄 Signed Lease Agreement</span>
              <span>•</span>
              <span>🔑 Physical Key Exchange</span>
            </div>
          </div>
        </div>

        {/* Bottom Property Sections */}
        <div className="housing-details-sections">
          <div className="housing-detail-section">
            <h3>🏠 About This Property</h3>
            <p className="pd-desc-text">
              {product.description || 'No description provided for this listing.'}
            </p>
            <div className="pd-desc-info-block housing-info-block">
              <h4>Property Viewing & Verification</h4>
              <p>
                To schedule a physical walk-through or request video tours, please message the owner via live chat. 
                All housing contracts and key exchanges are documented and escrowed through the stuRENT platform for student protection.
              </p>
            </div>
          </div>

          <div className="housing-detail-section">
            <h3>📐 Full Specifications & Amenities</h3>
            <table className="pd-spec-table">
              <tbody>
                <tr>
                  <th>City</th>
                  <td>{product.city || 'N/A'}</td>
                  <th>Area</th>
                  <td>{product.area || 'N/A'}</td>
                </tr>
                <tr>
                  <th>House Type</th>
                  <td>{product.house_type || 'N/A'}</td>
                  <th>Flat Size</th>
                  <td>{product.flat_size ? `${product.flat_size} sqft` : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Bedrooms</th>
                  <td>{product.rooms || 'N/A'}</td>
                  <th>Bathrooms</th>
                  <td>{product.bathrooms || 'N/A'}</td>
                </tr>
                <tr>
                  <th>AC Included</th>
                  <td>{product.ac_included ? 'Yes' : 'No'}</td>
                  <th>Furnished Status</th>
                  <td>{product.furnished ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <th>Listing Type</th>
                  <td>{product.listing_type || 'Rent only'}</td>
                  <th>Refundable Security Deposit</th>
                  <td>{currentMode === 'rent' ? `$${depositAmount.toFixed(2)} (2 months rent)` : 'None (Purchased house)'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="housing-detail-section">
            <h3>⭐ Tenant Reviews & Ratings</h3>
            <div className="pd-reviews-summary">
              <div className="pd-rs-score">
                <h2>4.8</h2>
                <div className="pd-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill={s <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />
                  ))}
                </div>
                <span>5 Ratings</span>
              </div>
              <div className="pd-rs-bars">
                <div className="pd-rs-bar-row">
                  <span>5 stars</span>
                  <div className="pd-rs-bar-fill"><div style={{ width: '80%', background: 'var(--warning)' }} /></div>
                  <span>80%</span>
                </div>
                <div className="pd-rs-bar-row">
                  <span>4 stars</span>
                  <div className="pd-rs-bar-fill"><div style={{ width: '20%', background: 'var(--warning)' }} /></div>
                  <span>20%</span>
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
                  Excellent house, clean rooms and very close to the campus shuttle station. The landlord was extremely responsive and helpful.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPay && (
          <PaymentModal
            product={{
              ...product,
              price: basePrice.toFixed(2),
              buy_price: parseFloat(buyPrice).toFixed(2)
            }}
            rentDays={days}
            mode={currentMode}
            onClose={() => setShowPay(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    )
  }

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

          {/* Housing details grid (Only if category is Housing) */}
          {product.category === 'Housing' && (
            <div className="pd-housing-specs-grid" style={{ padding: '16px', marginBottom: '20px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>🏠 Housing Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 20px', fontSize: '13px', color: 'var(--text)' }}>
                <div>📍 <strong>Location:</strong> {product.area || 'N/A'}, {product.city || 'N/A'}</div>
                <div>🏢 <strong>House Type:</strong> {product.house_type || 'N/A'}</div>
                <div>📐 <strong>Flat Size:</strong> {product.flat_size ? `${product.flat_size} sqft` : 'N/A'}</div>
                <div>🛏️ <strong>Rooms:</strong> {product.rooms || 0} Bed{product.rooms !== 1 ? 's' : ''}</div>
                <div>🚿 <strong>Baths:</strong> {product.bathrooms || 0} Bath{product.bathrooms !== 1 ? 's' : ''}</div>
                <div>❄️ <strong>AC Included:</strong> {product.ac_included ? 'Yes' : 'No'}</div>
                <div style={{ gridColumn: 'span 2' }}>🛋️ <strong>Furnished:</strong> {product.furnished ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          {/* Price Block */}
          <div className="pd-price-row-compact">
            <div className="pd-current-price">
              ${currentPrice.toFixed(2)}
              <span className="pd-price-unit">
                {currentMode === 'rent' ? (product.category === 'Housing' ? '/month' : '/day') : ' outright'}
              </span>
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
                  <span className="pd-duration-val">
                    <strong>
                      {days} {product.category === 'Housing' 
                        ? `month${days !== 1 ? 's' : ''}` 
                        : `day${days !== 1 ? 's' : ''}`}
                    </strong>
                  </span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={product.category === 'Housing' ? 12 : 30} 
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
                  <span>+${depositAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pd-bd-row total">
                <span>Total Cost</span>
                <span>${overallTotalWithDeposit}</span>
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
                {product.category === 'Housing' ? (
                  <>
                    <h4>Property Viewing & Key Handoff</h4>
                    <p>
                      This property is located in {product.area || 'N/A'}, {product.city || 'N/A'}. Please message the landlord/student via chat to schedule a physical viewing or to negotiate key handoff details.
                    </p>
                  </>
                ) : (
                  <>
                    <h4>Handoff & Location details</h4>
                    <p>
                      This item is listed for local student exchange. Standard exchange happens at the campus library lobby or student union hall. Please message the seller to confirm a meeting time and place.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="pd-tab-panel">
              {product.category === 'Housing' ? (
                <table className="pd-spec-table">
                  <tbody>
                    <tr>
                      <th>City</th>
                      <td>{product.city || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Area</th>
                      <td>{product.area || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>House Type</th>
                      <td>{product.house_type || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Flat Size</th>
                      <td>{product.flat_size ? `${product.flat_size} sqft` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Bedrooms</th>
                      <td>{product.rooms || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Bathrooms</th>
                      <td>{product.bathrooms || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>AC Included</th>
                      <td>{product.ac_included ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <th>Furnished</th>
                      <td>{product.furnished ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <th>Listing Type</th>
                      <td>{product.listing_type || 'Rent only'}</td>
                    </tr>
                    <tr>
                      <th>Refundable Security Deposit</th>
                      <td>{currentMode === 'rent' ? `$${depositAmount.toFixed(2)} (${depositMultiplier} months rent)` : 'None (Purchased house)'}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
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
              )}
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

      {/* Payment Modal */}
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
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
