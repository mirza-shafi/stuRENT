import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import StudentService from '../../services/studentService'

export default function MyOrders() {
  const { data, loading } = useApi(StudentService.getMyOrders)
  const orders = data?.results ?? data ?? []

  // Statistics
  const activeOrders = orders.filter(o => o.status !== 'Delivered').length
  const completedOrders = orders.filter(o => o.status === 'Delivered').length

  return (
    <div className="mo-container fade-in">
      {/* Page Header */}
      <div className="mo-header">
        <div>
          <h1 className="mo-title">My Orders</h1>
          <p className="mo-subtitle">Track the status of your campus rentals and purchases</p>
        </div>
        <Link to="/products" className="mo-browse-btn">
          <ShoppingBag size={15} /> Browse Products
        </Link>
      </div>

      {/* Stats Cards */}
      {orders.length > 0 && (
        <div className="mo-stats-grid">
          <div className="mo-stat-card card">
            <span className="mo-stat-val text-warning">{activeOrders}</span>
            <span className="mo-stat-lbl">Active Handoffs</span>
          </div>
          <div className="mo-stat-card card">
            <span className="mo-stat-val text-success">{completedOrders}</span>
            <span className="mo-stat-lbl">Completed Orders</span>
          </div>
          <div className="mo-stat-card card">
            <span className="mo-stat-val">{orders.length}</span>
            <span className="mo-stat-lbl">Total Orders</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="mo-loading">
          <span className="mo-spinner" />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mo-empty-state card">
          <ShoppingBag size={48} className="mo-empty-icon" />
          <h3>No orders yet</h3>
          <p>Browse our catalog to rent study room essentials, outdoor gear, and more!</p>
          <Link to="/products" className="mo-btn-primary">
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mo-orders-list">
          {orders.map((order, idx) => (
            <Link
              key={order.id}
              to={`/track-order/${order.id}`}
              className="mo-order-link"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="mo-order-card card">
                {/* Left section: Product info */}
                <div className="mo-card-left">
                  <div className="mo-icon-wrapper">
                    <Package size={22} className="mo-package-icon" />
                  </div>
                  <div className="mo-info-block">
                    <h3>{order.product_name}</h3>
                    <div className="mo-meta-row">
                      <span className="mo-meta-item">Order #{order.id}</span>
                      <span className="mo-meta-dot">•</span>
                      <span className="mo-meta-item">
                        <Calendar size={12} style={{ marginRight: 4 }} />
                        {new Date(order.date_created).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    {order.note && (
                      <div className="mo-note-preview">
                        <MessageSquare size={12} />
                        <span>{order.note.slice(0, 80)}{order.note.length > 80 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right section: Price, status, actions */}
                <div className="mo-card-right">
                  <div className="mo-status-info">
                    {order.status === 'Pending' && (
                      <span className="mo-status-badge badge-warning">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {order.status === 'Out for delivery' && (
                      <span className="mo-status-badge badge-info">
                        <Truck size={12} /> In Transit
                      </span>
                    )}
                    {order.status === 'Delivered' && (
                      <span className="mo-status-badge badge-success">
                        <CheckCircle size={12} /> Completed
                      </span>
                    )}

                    {order.product_price && (
                      <span className="mo-price-text">
                        ${parseFloat(order.product_price).toFixed(2)}
                        <span className="mo-price-unit">{order.product_category === 'Housing' ? '/month' : '/day'}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="mo-track-btn">
                    <span>Track Status</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Scoped Styles */}
      <style>{`
        .mo-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 0 80px;
        }

        /* Header */
        .mo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .mo-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .mo-subtitle {
          font-size: 14.5px;
          color: var(--text-muted);
        }
        .mo-browse-btn {
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
        }
        .mo-browse-btn:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        /* Stats Grid */
        .mo-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }
        .mo-stat-card {
          padding: 18px 24px;
          display: flex;
          flex-direction: column;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: border-color var(--transition);
        }
        .mo-stat-card:hover {
          border-color: var(--primary);
        }
        .mo-stat-val {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .mo-stat-val.text-warning {
          color: var(--warning);
        }
        .mo-stat-val.text-success {
          color: var(--success);
        }
        .mo-stat-lbl {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Orders list */
        .mo-orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .mo-order-link {
          text-decoration: none;
          color: inherit;
          opacity: 0;
          transform: translateY(16px);
          animation: moSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes moSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mo-order-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all var(--transition);
          cursor: pointer;
          gap: 24px;
        }
        
        .mo-order-link:hover .mo-order-card {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        /* Card Left */
        .mo-card-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 0;
        }
        .mo-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--bg-3);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition);
        }
        .mo-order-link:hover .mo-icon-wrapper {
          background: var(--primary-glow);
          transform: scale(1.05);
        }
        .mo-info-block {
          flex: 1;
          min-width: 0;
        }
        .mo-info-block h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .mo-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .mo-meta-item {
          display: inline-flex;
          align-items: center;
        }
        .mo-meta-dot {
          color: var(--text-dim);
        }
        .mo-note-preview {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-dim);
          background: var(--surface);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-style: italic;
          max-width: 100%;
        }
        .mo-note-preview span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Card Right */
        .mo-card-right {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-shrink: 0;
        }
        
        .mo-status-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        
        .mo-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }
        
        .badge-warning {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }
        .badge-info {
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent);
        }
        .badge-success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }
        
        .mo-price-text {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
        }
        .mo-price-unit {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-muted);
        }
        
        .mo-track-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--primary);
          transition: all var(--transition);
        }
        .mo-order-link:hover .mo-track-btn {
          color: var(--primary-hov);
        }
        .mo-order-link:hover .mo-track-btn svg {
          transform: translateX(4px);
        }
        .mo-track-btn svg {
          transition: transform var(--transition);
        }

        /* Loading */
        .mo-loading {
          height: 40vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-muted);
        }
        .mo-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .mo-empty-state {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 500px;
          margin: 40px auto 0;
        }
        .mo-empty-icon {
          color: var(--text-dim);
          margin-bottom: 20px;
        }
        .mo-empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .mo-empty-state p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .mo-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          background: var(--primary);
          color: #fff;
          transition: all var(--transition);
        }
        .mo-btn-primary:hover {
          background: var(--primary-hov);
          transform: translateY(-1px);
        }

        /* Responsive styling */
        @media (max-width: 768px) {
          .mo-order-card {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 16px 20px;
          }
          .mo-card-right {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--border);
            padding-top: 16px;
            gap: 16px;
          }
          .mo-status-info {
            flex-direction: row-reverse;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }
          .mo-track-btn {
            display: none; /* Hide button text link on mobile */
          }
        }
      `}</style>
    </div>
  )
}
