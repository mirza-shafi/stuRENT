/**
 * Cart.jsx — Dedicated Phoenix-style Shopping Cart & Checkout Page
 * Route: /cart
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../components/CartWishlist'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ShoppingCart, ArrowLeft, Trash2, ShieldCheck, Tag, Plus, Minus, CreditCard, MapPin, Truck } from 'lucide-react'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

export default function Cart() {
  const { cart, cartCount, cartTotal, removeFromCart, changeQty, confirmCheckout } = useCart()
  const { user, openLoginModal } = useAuth()
  const navigate = useNavigate()

  // Checkout states
  const [step, setStep] = useState('cart') // 'cart' | 'checkout'
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)

  // Form states
  const [shippingMethod, setShippingMethod] = useState('pickup') // 'pickup' | 'delivery'
  const [fullName, setFullName] = useState(user?.username || '')
  const [pickupTime, setPickupTime] = useState('')
  const [address, setAddress] = useState('')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('123')

  const deliveryCharge = shippingMethod === 'delivery' ? 2.99 : 0.0
  const discountAmount = cartTotal * appliedDiscount
  const finalTotal = cartTotal + deliveryCharge - discountAmount

  const handleApplyPromo = (e) => {
    e.preventDefault()
    if (promoCode.toUpperCase() === 'STUDENT10') {
      setAppliedDiscount(0.1)
      toast.success('10% student discount applied!')
    } else {
      toast.error('Invalid promo code. Try "STUDENT10"')
    }
  }

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please sign in to proceed to checkout')
      openLoginModal()
      return
    }
    if (cartCount === 0) {
      toast.error('Your cart is empty')
      return
    }
    setStep('checkout')
  }

  const handlePay = (e) => {
    e.preventDefault()
    if (shippingMethod === 'pickup' && !pickupTime) {
      toast.error('Please specify a preferred pickup time')
      return
    }
    if (shippingMethod === 'delivery' && !address) {
      toast.error('Please provide a delivery address')
      return
    }

    toast.loading('Processing escrow payment...', { duration: 1500 })
    setTimeout(() => {
      confirmCheckout()
      toast.success('Order placed successfully! Redirecting to orders...', { icon: '🎉' })
      navigate('/my-orders')
    }, 1500)
  }

  return (
    <div className="cart-page">
      {/* Breadcrumbs */}
      <div className="cart-breadcrumbs">
        <Link to="/" className="cart-bc-link">Home</Link>
        <span className="cart-bc-sep">/</span>
        <span className="cart-bc-current">Shopping Cart</span>
      </div>

      <h1 className="cart-title">
        <ShoppingCart size={28} style={{ color: 'var(--primary)' }} />
        Shopping Cart
        <span className="cart-count-badge">({cartCount} Item{cartCount !== 1 ? 's' : ''})</span>
      </h1>

      {cartCount === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Find study room essentials, outdoor gear, and housing rentals on the marketplace.</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: 20 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* LEFT COLUMN: Steps */}
          <div className="cart-main-col">
            {step === 'cart' ? (
              <div className="cart-card card">
                <div className="cart-card-header">
                  <h3>Items in your cart</h3>
                  <Link to="/products" className="cart-back-to-shop">
                    <ArrowLeft size={14} /> Continue shopping
                  </Link>
                </div>
                <div className="cart-items-list">
                  {Object.values(cart).map(({ product: p, qty }) => {
                    const priceNum = parseFloat(p.price)
                    const itemTotal = priceNum * qty
                    const imageSrc = p.image ? `${BASE}${p.image}` : null
                    const emojiFallback = p.category === 'Indoor' ? '🪑' : p.category === 'Housing' ? '🏠' : '🏕️'

                    return (
                      <div key={p.id} className="cart-item-row">
                        <div className="cart-item-img-container">
                          {imageSrc ? (
                            <img src={imageSrc} alt={p.name} className="cart-item-img" />
                          ) : (
                            <span className="cart-item-emoji">{emojiFallback}</span>
                          )}
                        </div>
                        <div className="cart-item-details">
                          <Link to={`/products/product-details/${p.id}`} className="cart-item-name">
                            {p.name}
                          </Link>
                          <div className="cart-item-meta">
                            <span className="cart-item-cat">{p.category}</span>
                            <span className="cart-item-dot">•</span>
                            <span className="cart-item-type">
                              {p.listing_type === 'Buy' ? 'Buy outright' : 'Rental listing'}
                            </span>
                          </div>
                        </div>
                        <div className="cart-item-price-unit">
                          ${priceNum.toFixed(2)}
                          {p.listing_type !== 'Buy' && <span className="cart-unit-label">/day</span>}
                        </div>
                        <div className="cart-item-quantity">
                          <div className="cart-qty-ctrl">
                            <button className="cart-qty-btn" onClick={() => changeQty(p.id, -1)} aria-label="Decrease quantity">
                              <Minus size={12} />
                            </button>
                            <span className="cart-qty-val">{qty}</span>
                            <button className="cart-qty-btn" onClick={() => changeQty(p.id, 1)} aria-label="Increase quantity">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="cart-item-total">
                          ${itemTotal.toFixed(2)}
                        </div>
                        <div className="cart-item-remove-cell">
                          <button className="cart-remove-btn" onClick={() => removeFromCart(p.id)} title="Remove item">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="cart-card card checkout-form-card">
                <div className="cart-card-header">
                  <h3>Billing & Handoff Info</h3>
                  <button className="cart-back-to-cart-btn" onClick={() => setStep('cart')}>
                    <ArrowLeft size={14} /> Back to cart
                  </button>
                </div>
                <form onSubmit={handlePay} className="checkout-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping / Handoff Method</label>
                    <div className="shipping-methods-grid">
                      <div 
                        className={`shipping-card ${shippingMethod === 'pickup' ? 'active' : ''}`}
                        onClick={() => setShippingMethod('pickup')}
                      >
                        <MapPin className="ship-icon" />
                        <div className="ship-info">
                          <span className="ship-title">On-Campus Pickup</span>
                          <span className="ship-sub">Free handoff at Campus Library lobby</span>
                        </div>
                        <span className="ship-price">Free</span>
                      </div>

                      <div 
                        className={`shipping-card ${shippingMethod === 'delivery' ? 'active' : ''}`}
                        onClick={() => setShippingMethod('delivery')}
                      >
                        <Truck className="ship-icon" />
                        <div className="ship-info">
                          <span className="ship-title">Dorm / Local Delivery</span>
                          <span className="ship-sub">Dropoff directly to your campus residence</span>
                        </div>
                        <span className="ship-price">$2.99</span>
                      </div>
                    </div>
                  </div>

                  {shippingMethod === 'pickup' ? (
                    <div className="form-group">
                      <label className="form-label">Preferred Pickup Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="form-control" 
                        value={pickupTime} 
                        onChange={e => setPickupTime(e.target.value)} 
                        required 
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Delivery Address / Dorm & Room #</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hillside Hall, Room 302" 
                        className="form-control" 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        required 
                      />
                    </div>
                  )}

                  <hr className="form-divider" />

                  <h4 className="payment-section-title">
                    <CreditCard size={18} /> Escrow Payment Method
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label className="form-label">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="form-control" 
                        value={expiry} 
                        onChange={e => setExpiry(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group col">
                      <label className="form-label">CVC</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        className="form-control" 
                        value={cvc} 
                        onChange={e => setCvc(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="checkout-submit-btn">
                    🔒 Authorize Secure Escrow & Pay ${finalTotal.toFixed(2)}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="cart-sidebar-col">
            <div className="summary-card card">
              <h3>Summary</h3>
              
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              {shippingMethod === 'delivery' && (
                <div className="summary-row">
                  <span>Dorm Delivery Charge</span>
                  <span>$2.99</span>
                </div>
              )}

              {appliedDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Student Promo Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <hr className="summary-divider" />

              <div className="summary-row total">
                <span>Estimated Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              {step === 'cart' && (
                <>
                  <button className="summary-checkout-btn" onClick={handleProceedToCheckout}>
                    Proceed to Checkout →
                  </button>

                  <form onSubmit={handleApplyPromo} className="promo-form">
                    <input 
                      type="text" 
                      placeholder="Discount code (e.g. STUDENT10)" 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value)} 
                      className="promo-input"
                    />
                    <button type="submit" className="promo-btn">
                      <Tag size={14} /> Apply
                    </button>
                  </form>
                </>
              )}

              <div className="escrow-shield">
                <ShieldCheck size={28} className="shield-icon" />
                <div className="shield-info">
                  <span className="shield-title">Student Escrow Protection</span>
                  <span className="shield-sub">Funds are held safely in escrow and only released to the owner after campus handoff.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cart-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 0;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        /* Breadcrumbs */
        .cart-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .cart-bc-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
        .cart-bc-link:hover {
          text-decoration: underline;
        }
        .cart-bc-sep {
          color: var(--text-muted);
        }
        .cart-bc-current {
          color: var(--text);
          font-weight: 600;
        }

        /* Title */
        .cart-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 32px;
        }
        .cart-count-badge {
          font-size: 16px;
          color: var(--text-muted);
          font-weight: 500;
          margin-left: 4px;
        }

        /* Empty State */
        .cart-empty-state {
          text-align: center;
          padding: 64px 24px;
          background: var(--bg-2);
          border-radius: 16px;
          border: 1px solid var(--border);
        }
        .cart-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .cart-empty-state h2 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .cart-empty-state p {
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Layout Grid */
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: flex-start;
        }

        /* Card stylings */
        .cart-page .card {
          background: var(--bg-2);
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 24px;
        }

        .cart-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .cart-card-header h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .cart-back-to-shop {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--primary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }
        .cart-back-to-shop:hover {
          text-decoration: underline;
        }

        /* Cart Items List */
        .cart-items-list {
          display: flex;
          flex-direction: column;
        }
        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .cart-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .cart-item-row:first-child {
          padding-top: 0;
        }

        .cart-item-img-container {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cart-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cart-item-emoji {
          font-size: 36px;
        }

        .cart-item-details {
          flex: 1;
          min-width: 0;
        }
        .cart-item-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          text-decoration: none;
          display: block;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .cart-item-name:hover {
          color: var(--primary);
        }
        .cart-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .cart-item-cat {
          font-weight: 500;
        }
        .cart-item-type {
          font-weight: 600;
          color: var(--primary-glow-text, var(--primary));
        }

        .cart-item-price-unit {
          width: 100px;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
          color: var(--text);
        }
        .cart-unit-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 400;
        }

        /* Quantity controls */
        .cart-qty-ctrl {
          display: inline-flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          padding: 2px;
        }
        .cart-qty-btn {
          width: 26px;
          height: 26px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 6px;
        }
        .cart-qty-btn:hover {
          background: var(--surface-hov);
          color: var(--text);
        }
        .cart-qty-val {
          font-size: 13px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .cart-item-total {
          width: 100px;
          font-size: 16px;
          font-weight: 700;
          text-align: right;
          color: var(--text);
        }

        .cart-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .cart-remove-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }

        /* Checkout Form inside main column */
        .checkout-form-card {
          background: var(--bg-2);
        }
        .cart-back-to-cart-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .cart-back-to-cart-btn:hover {
          color: var(--text);
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .col {
          flex: 1;
        }
        .form-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .form-control {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: var(--text);
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }
        .form-control:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* Shipping card selectors */
        .shipping-methods-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .shipping-card {
          border: 1.5px solid var(--border);
          background: var(--surface);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s;
        }
        .shipping-card:hover {
          border-color: var(--primary-glow-text, var(--primary));
          background: var(--surface-hov);
        }
        .shipping-card.active {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        .ship-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .shipping-card.active .ship-icon {
          color: var(--primary);
        }
        .ship-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .ship-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .ship-sub {
          font-size: 11px;
          color: var(--text-muted);
        }
        .ship-price {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .form-divider {
          border: 0;
          border-top: 1px solid var(--border);
          margin: 10px 0;
        }
        .payment-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .checkout-submit-btn {
          width: 100%;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .checkout-submit-btn:hover {
          background: var(--primary-hov, var(--primary));
          transform: translateY(-1px);
        }

        /* Sidebar Column */
        .cart-sidebar-col {
          position: sticky;
          top: 80px;
        }
        .summary-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px;
        }
        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .summary-row.discount {
          color: #10b981;
          font-weight: 600;
        }
        .summary-divider {
          border: 0;
          border-top: 1px solid var(--border);
          margin: 16px 0;
        }
        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 24px;
        }

        .summary-checkout-btn {
          width: 100%;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 20px;
        }
        .summary-checkout-btn:hover {
          background: var(--primary-hov, var(--primary));
        }

        /* Promo code form */
        .promo-form {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .promo-input {
          flex: 1;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--text);
          outline: none;
        }
        .promo-input:focus {
          border-color: var(--primary);
        }
        .promo-btn {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .promo-btn:hover {
          background: var(--surface-hov);
        }

        /* Escrow Shield info */
        .escrow-shield {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          padding: 14px;
        }
        .shield-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .shield-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .shield-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
        }
        .shield-sub {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Responsive styling */
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .cart-sidebar-col {
            position: static;
          }
        }
        @media (max-width: 600px) {
          .cart-item-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px 0;
          }
          .cart-item-price-unit, .cart-item-total {
            text-align: left;
            width: auto;
          }
          .shipping-methods-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
