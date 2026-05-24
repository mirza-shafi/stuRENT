import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  User,
  ShieldAlert
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import StudentService from '../../services/studentService'
import toast from 'react-hot-toast'

export default function TrackOrder() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch all orders and find the matching one
  const { data, loading } = useApi(StudentService.getMyOrders)
  const orders = data?.results ?? data ?? []
  const order = orders.find(o => String(o.id) === String(id))

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (!order) return (
    <div className="empty-state card" style={{ marginTop: 32 }}>
      <Package size={48} className="empty-state__icon" />
      <p className="empty-state__title">Order #{id} not found</p>
      <Link to="/my-orders" className="btn btn--primary">← Back to My Orders</Link>
    </div>
  )

  // Determine timeline progress based on actual order status
  // Statuses: 'Pending', 'Out for delivery', 'Delivered'
  const isPending = order.status === 'Pending'
  const isTransit = order.status === 'Out for delivery'
  const isDelivered = order.status === 'Delivered'

  // Map progress indices
  const stepConfirmed = true // Always confirmed if ordered
  const stepProcessing = true // Processing starts immediately
  const stepOutForHandoff = isTransit || isDelivered
  const stepDelivered = isDelivered

  const handleSupportCall = () => {
    toast.success('Calling student support helpline: (555) 019-RENT')
  }

  const orderDate = new Date(order.date_created).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="to-container fade-in">
      {/* ── Breadcrumbs ── */}
      <nav className="to-breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/my-orders">My Orders</Link></li>
          <li className="active" aria-current="page">Track Order #{order.id}</li>
        </ol>
      </nav>

      {/* ── Header ── */}
      <div className="to-header">
        <div>
          <h1 className="to-title">Order #{order.id} Status</h1>
          <p className="to-subtitle">
            Secure Payment via <span className="to-highlight">Credit Card</span> · Ordered on {orderDate}
          </p>
        </div>
        <button className="to-support-btn" onClick={handleSupportCall}>
          <Phone size={14} /> Call Support
        </button>
      </div>

      {/* ── Content Grid ── */}
      <div className="to-grid">
        {/* Left Column — Handoff Map & Pickup Info */}
        <div className="to-col-map">
          <div className="to-map-card card">
            <div className="to-map-header">
              <MapPin size={16} />
              <span>Campus Handoff Map</span>
            </div>
            
            {/* Visual simulated vector map of campus quad */}
            <div className="to-map-visual">
              <svg viewBox="0 0 400 240" className="to-svg-map">
                {/* Background Quad Grass */}
                <rect width="400" height="240" fill="#e2f0d9" rx="8" />
                
                {/* Pathways */}
                <path d="M 50,0 Q 150,120 350,240" stroke="#f2efe9" strokeWidth="24" fill="none" />
                <path d="M 0,180 Q 200,120 400,60" stroke="#f2efe9" strokeWidth="24" fill="none" />
                
                {/* Buildings */}
                <rect x="30" y="20" width="80" height="60" fill="#d5e8d4" stroke="#82b366" strokeWidth="2" rx="4" />
                <text x="70" y="52" fontSize="10" fontWeight="bold" fill="#274e13" textAnchor="middle">Library</text>
                
                <rect x="290" y="140" width="80" height="60" fill="#f8cecc" stroke="#b85450" strokeWidth="2" rx="4" />
                <text x="330" y="172" fontSize="10" fontWeight="bold" fill="#660000" textAnchor="middle">Union</text>
                
                {/* Quad Center Ring */}
                <circle cx="200" cy="120" r="32" fill="#fff2cc" stroke="#d6b656" strokeWidth="2" />
                <text x="200" y="123" fontSize="10" fontWeight="bold" fill="#7f6000" textAnchor="middle">Main Quad</text>
                
                {/* Handoff Marker */}
                <g className="to-marker-pulse">
                  <circle cx="90" cy="70" r="16" fill="rgba(99,102,241,0.25)" />
                  <circle cx="90" cy="70" r="6" fill="var(--primary)" />
                </g>
                <text x="90" y="94" fontSize="9" fontWeight="bold" fill="var(--primary)" textAnchor="middle">Handoff Point</text>
              </svg>
            </div>

            {/* Location Address & Code */}
            <div className="to-map-details">
              <div className="to-md-row">
                <strong>Exchange Location:</strong>
                <span>Main Campus Library (Lobby Lounge)</span>
              </div>
              <div className="to-md-row">
                <strong>Handoff Code:</strong>
                <span className="to-badge-code">STU-{order.id}59-RENT</span>
              </div>
              <p className="to-md-tip">
                💡 Show this Handoff Code to the seller/renter upon meeting to confirm item receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Vertical Tracking Timeline */}
        <div className="to-col-timeline">
          <div className="to-timeline card">
            {/* Step 1 */}
            <div className={`to-timeline-item ${stepConfirmed ? 'done' : ''}`}>
              <div className="to-t-left">
                <span className="to-t-time">Step 1</span>
              </div>
              <div className="to-t-middle">
                <span className="to-t-icon">
                  <CheckCircle size={14} />
                </span>
                <span className="to-t-line"></span>
              </div>
              <div className="to-t-right">
                <h4>Order Placed</h4>
                <p>We received your request. Escrow hold is successfully initiated.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`to-timeline-item ${stepProcessing ? 'done' : ''}`}>
              <div className="to-t-left">
                <span className="to-t-time">Step 2</span>
              </div>
              <div className="to-t-middle">
                <span className="to-t-icon">
                  <CheckCircle size={14} />
                </span>
                <span className="to-t-line"></span>
              </div>
              <div className="to-t-right">
                <h4>Confirmed by Owner</h4>
                <p>Owner approved the rental request and is preparing the item.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`to-timeline-item ${stepOutForHandoff ? 'done' : isPending ? 'active' : ''}`}>
              <div className="to-t-left">
                <span className="to-t-time">Step 3</span>
              </div>
              <div className="to-t-middle">
                <span className="to-t-icon">
                  {stepOutForHandoff ? <CheckCircle size={14} /> : <Truck size={14} />}
                </span>
                <span className="to-t-line"></span>
              </div>
              <div className="to-t-right">
                <h4>Ready for Campus Handoff</h4>
                <p>
                  {stepOutForHandoff 
                    ? 'Owner has arrived at the handoff point.' 
                    : 'Awaiting handoff schedule. Contact owner to arrange quad handoff.'
                  }
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`to-timeline-item ${stepDelivered ? 'done' : isTransit ? 'active' : 'pending'}`}>
              <div className="to-t-left">
                <span className="to-t-time">Step 4</span>
              </div>
              <div className="to-t-middle">
                <span className="to-t-icon">
                  <CheckCircle size={14} />
                </span>
              </div>
              <div className="to-t-right">
                <h4>Item Handoff Completed</h4>
                <p>
                  {isDelivered 
                    ? 'Successfully received! Rental period is now officially active.' 
                    : 'Awaiting handoff code exchange.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="to-buttons-row">
            <Link to={`/products/product-details/${order.product_id || 2}`} className="to-btn-outline">
              <Package size={14} /> View Product
            </Link>
            <button className="to-btn-primary" onClick={() => navigate('/messages')}>
              <MessageCircle size={14} /> Chat with Owner
            </button>
          </div>
        </div>
      </div>

      {/* ── Scoped Styling ── */}
      <style>{`
        .to-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 10px 80px;
          font-family: 'DM Sans', var(--font);
        }
        
        /* Breadcrumbs */
        .to-breadcrumb {
          margin-bottom: 24px;
        }
        .to-breadcrumb ol {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          gap: 6px;
          align-items: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .to-breadcrumb li a {
          color: var(--primary);
          transition: color 0.15s;
        }
        .to-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .to-breadcrumb li::after {
          content: '/';
          margin-left: 6px;
          color: var(--text-dim);
        }
        .to-breadcrumb li.active::after {
          content: '';
        }
        .to-breadcrumb li.active {
          color: var(--text);
          font-weight: 500;
        }

        /* Header */
        .to-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .to-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .to-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }
        .to-highlight {
          color: var(--primary);
          font-weight: 600;
        }
        .to-support-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          background: var(--bg-2);
          color: var(--text);
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .to-support-btn:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Layout Grid */
        .to-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        /* Left column map */
        .to-map-card {
          overflow: hidden;
          background: var(--bg-2);
          border: 1px solid var(--border);
        }
        .to-map-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14.5px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }
        .to-map-visual {
          padding: 12px;
          background: var(--bg-3);
        }
        .to-svg-map {
          width: 100%;
          border-radius: var(--radius-md);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        .to-map-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .to-md-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
        .to-md-row strong {
          color: var(--text);
        }
        .to-md-row span {
          color: var(--text-muted);
          font-weight: 500;
        }
        .to-badge-code {
          color: var(--primary) !important;
          background: var(--primary-glow);
          padding: 2px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700 !important;
          font-size: 13px;
        }
        .to-md-tip {
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
          margin-top: 4px;
        }

        /* Marker pulse animation */
        .to-marker-pulse circle:first-child {
          animation: mapPulse 2s infinite ease-out;
          transform-origin: 90px 70px;
        }
        @keyframes mapPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Right column Timeline */
        .to-timeline {
          padding: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .to-timeline-item {
          display: flex;
          gap: 0;
        }
        .to-t-left {
          width: 60px;
          text-align: right;
          padding-right: 16px;
          padding-top: 2px;
        }
        .to-t-time {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .to-t-middle {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          position: relative;
        }
        .to-t-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          background: var(--bg-3);
          border: 2px solid var(--border);
          color: var(--text-dim);
          transition: all 0.25s;
        }
        .to-t-line {
          width: 2px;
          flex: 1;
          background: var(--border);
          margin: 4px 0;
          z-index: 1;
        }
        .to-t-right {
          flex: 1;
          padding-left: 16px;
          padding-bottom: 32px;
        }
        .to-t-right h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 4px;
          transition: color 0.25s;
        }
        .to-t-right p {
          font-size: 12.5px;
          color: var(--text-dim);
          line-height: 1.5;
        }

        /* Timeline States */
        .to-timeline-item.done .to-t-icon {
          background: var(--success);
          border-color: var(--success);
          color: #fff;
        }
        .to-timeline-item.done .to-t-line {
          background: var(--success);
        }
        .to-timeline-item.done .to-t-right h4 {
          color: var(--text);
        }
        .to-timeline-item.done .to-t-right p {
          color: var(--text-muted);
        }

        .to-timeline-item.active .to-t-icon {
          background: var(--warning);
          border-color: var(--warning);
          color: #fff;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        }
        .to-timeline-item.active .to-t-line {
          border-right: 2px dashed var(--border);
          background: none;
        }
        .to-timeline-item.active .to-t-right h4 {
          color: var(--warning);
        }

        .to-timeline-item.pending .to-t-icon {
          background: var(--bg-3);
          border-color: var(--border);
          color: var(--text-dim);
        }
        .to-timeline-item.pending .to-t-line {
          background: var(--border);
        }

        /* Timeline last element fix */
        .to-timeline-item:last-child .to-t-right {
          padding-bottom: 0;
        }

        /* Buttons row */
        .to-buttons-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .to-btn-primary {
          flex: 1.5;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--primary);
          color: #fff;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 12px var(--primary-glow);
          transition: all 0.2s;
        }
        .to-btn-primary:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--primary-glow);
        }
        .to-btn-outline {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          text-decoration: none;
        }
        .to-btn-outline:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .to-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  )
}
