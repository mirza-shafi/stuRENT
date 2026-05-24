import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Check
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

  const orderDateObj = new Date(order.date_created)
  const orderDateFormatted = orderDateObj.toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const orderTimeFormatted = orderDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
  const fullOrderDate = `${orderDateFormatted}, ${orderTimeFormatted}`

  // Simulated meet estimation (e.g. 1 day after creation or show "Estimated" state)
  const estDateObj = new Date(orderDateObj)
  estDateObj.setDate(estDateObj.getDate() + 1)
  const estDateFormatted = estDateObj.toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
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
      <div className="to-header-wrap">
        <div className="to-header-left">
          <h2>Order #{order.id} Status</h2>
          <p>
            Secure Payment via <span>Credit Card</span> · Ordered on {fullOrderDate}
          </p>
        </div>
        <button className="to-call-btn" onClick={handleSupportCall}>
          <Phone size={14} /> Call Support
        </button>
      </div>

      {/* ── Content Grid ── */}
      <div className="to-grid">
        {/* Left Column — Handoff Map & Pickup Info */}
        <div className="col-map-wrap">
          <div className="to-map-card">
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
        <div className="col-timeline-wrap">
          <div className="to-timeline-vertical">
            {/* Step 1 */}
            <div className="to-timeline-item">
              <div className="to-timeline-item-date">
                <p>{orderDateFormatted}<br className="d-none d-md-block" /> {orderTimeFormatted}</p>
              </div>
              <div className="to-timeline-item-bar">
                <div className="to-icon-item bg-success">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="to-timeline-bar border-success"></span>
              </div>
              <div className="to-timeline-item-content">
                <h4>Order Placed</h4>
                <p>We received your request. Escrow hold is successfully initiated.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="to-timeline-item">
              <div className="to-timeline-item-date">
                <p>{orderDateFormatted}<br className="d-none d-md-block" /> {orderTimeFormatted}</p>
              </div>
              <div className="to-timeline-item-bar">
                <div className="to-icon-item bg-success">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className={`to-timeline-bar ${stepOutForHandoff ? 'border-success' : isPending ? 'border-warning' : 'border-dashed'}`}></span>
              </div>
              <div className="to-timeline-item-content">
                <h4>Confirmed by Owner</h4>
                <p>Owner approved the rental request and is preparing the item.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="to-timeline-item">
              <div className="to-timeline-item-date">
                {stepOutForHandoff ? (
                  <p>{orderDateFormatted}<br className="d-none d-md-block" /> {orderTimeFormatted}</p>
                ) : (
                  <p>Estimated meet<br className="d-none d-md-block" /> {estDateFormatted}</p>
                )}
              </div>
              <div className="to-timeline-item-bar">
                <div className={`to-icon-item ${stepOutForHandoff ? 'bg-success' : isPending ? 'bg-warning' : 'bg-quaternary'}`}>
                  {stepOutForHandoff ? <Check size={14} strokeWidth={3} /> : <Truck size={14} />}
                </div>
                <span className={`to-timeline-bar ${stepDelivered ? 'border-success' : isTransit ? 'border-warning' : 'border-dashed'}`}></span>
              </div>
              <div className="to-timeline-item-content">
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
            <div className="to-timeline-item">
              <div className="to-timeline-item-date">
                {stepDelivered ? (
                  <p>{orderDateFormatted}<br className="d-none d-md-block" /> {orderTimeFormatted}</p>
                ) : (
                  <p>Estimated meet<br className="d-none d-md-block" /> {estDateFormatted}</p>
                )}
              </div>
              <div className="to-timeline-item-bar">
                <div className={`to-icon-item ${stepDelivered ? 'bg-success' : isTransit ? 'bg-warning' : 'bg-quaternary'}`}>
                  {stepDelivered ? <Check size={14} strokeWidth={3} /> : <CheckCircle size={14} />}
                </div>
                <span className="to-timeline-bar"></span>
              </div>
              <div className="to-timeline-item-content">
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
          <div className="to-actions-row">
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
          max-width: 1140px;
          margin: 0 auto;
          padding: 40px 15px 80px;
          font-family: var(--font);
        }
        
        /* Breadcrumbs */
        .to-breadcrumb {
          margin-bottom: 24px;
        }
        .to-breadcrumb ol {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .to-breadcrumb li a {
          color: var(--primary);
          text-decoration: none;
          transition: color var(--transition);
        }
        .to-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .to-breadcrumb li:not(:last-child)::after {
          content: '/';
          margin-left: 8px;
          color: var(--text-dim);
        }
        .to-breadcrumb li.active {
          color: var(--text-muted);
        }

        /* Header */
        .to-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .to-header-left h2 {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        .to-header-left p {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0;
        }
        .to-header-left p span {
          color: var(--text);
          font-weight: 700;
        }
        .to-call-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--primary);
          color: var(--primary);
          background: transparent;
          font-weight: 600;
          font-size: 14px;
          transition: all var(--transition);
        }
        .to-call-btn:hover {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        /* Grid Layout */
        .to-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .to-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* Left column map */
        .to-map-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-2);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow);
        }
        .to-map-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }
        .to-map-visual {
          padding: 16px;
          background: var(--bg-3);
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }
        .to-svg-map {
          width: 100%;
          border-radius: var(--radius-md);
          background: #e2f0d9;
        }
        .to-map-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .to-md-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        .to-md-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
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
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-family: monospace;
          font-weight: 700;
          font-size: 13px;
        }
        .to-md-tip {
          font-size: 12.5px;
          color: var(--text-dim);
          line-height: 1.5;
          margin: 0;
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
        .to-timeline-vertical {
          display: flex;
          flex-direction: column;
        }
        .to-timeline-item {
          display: flex;
          flex-direction: row;
          position: relative;
        }
        
        .to-timeline-item-date {
          width: 120px;
          text-align: right;
          padding-right: 24px;
          padding-top: 4px;
          flex-shrink: 0;
        }
        .to-timeline-item-date p {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
        }

        .to-timeline-item-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
          position: relative;
        }
        .to-icon-item {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 0 0 4px var(--bg);
          transition: all var(--transition);
        }
        .to-icon-item.bg-success {
          background-color: var(--success);
        }
        .to-icon-item.bg-warning {
          background-color: var(--warning);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.35), 0 0 0 4px var(--bg);
        }
        .to-icon-item.bg-quaternary {
          background-color: var(--text-dim);
          color: var(--text-muted);
        }

        .to-timeline-bar {
          width: 2px;
          position: absolute;
          top: 28px;
          bottom: -28px;
          z-index: 1;
        }
        .to-timeline-bar.border-success {
          background-color: var(--success);
        }
        .to-timeline-bar.border-warning {
          background-color: var(--warning);
        }
        .to-timeline-bar.border-dashed {
          border-left: 2px dashed var(--border);
          background-color: transparent;
        }

        .to-timeline-item:last-child .to-timeline-bar {
          display: none;
        }

        .to-timeline-item-content {
          flex: 1;
          padding-left: 24px;
          padding-bottom: 48px;
        }
        .to-timeline-item:last-child .to-timeline-item-content {
          padding-bottom: 0;
        }
        .to-timeline-item-content h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 6px 0;
        }
        .to-timeline-item-content p {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        /* Action Buttons Row */
        .to-actions-row {
          display: flex;
          gap: 16px;
          margin-top: 32px;
          padding-left: 144px; /* Align with timeline content */
        }
        .to-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          background: var(--primary);
          color: #fff;
          transition: all var(--transition);
        }
        .to-btn-primary:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--primary-glow);
        }
        .to-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          border: 1px solid var(--border);
          color: var(--text);
          background: transparent;
          transition: all var(--transition);
        }
        .to-btn-outline:hover {
          border-color: var(--primary);
          background: var(--surface-hov);
        }

        /* Responsive styling */
        @media (max-width: 768px) {
          .to-header-wrap {
            flex-direction: column;
            align-items: flex-start;
          }
          .to-call-btn {
            width: 100%;
            justify-content: center;
          }
          .to-timeline-item-date {
            width: 90px;
            padding-right: 12px;
          }
          .to-actions-row {
            padding-left: 0;
          }
          .to-actions-row > * {
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}
