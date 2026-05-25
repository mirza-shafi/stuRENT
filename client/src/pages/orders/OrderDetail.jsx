/**
 * OrderDetail.jsx — Premium Admin Order Detail Redesign (Phoenix Style)
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Printer, Trash2, Package, User,
  Mail, Phone, MapPin, DollarSign, Calendar,
  Gift, Inbox, MessageSquare, AlertCircle, ChevronRight,
  ShieldCheck, RefreshCcw, Truck
} from 'lucide-react'
import OrderService from '../../services/orderService'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

const STATUS_BADGE = {
  'Pending':          { label: 'Pending Handoff', bg: 'rgba(245,158,11,.12)', color: 'var(--warning)' },
  'Out for delivery': { label: 'Out for Handoff', bg: 'rgba(6,182,212,.12)',  color: 'var(--accent)'  },
  'Delivered':        { label: 'Completed',       bg: 'rgba(16,185,129,.12)', color: 'var(--success)' },
  'Refunded':         { label: 'Refunded',        bg: 'rgba(239,68,68,.12)',  color: 'var(--danger)'  },
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRefund, setShowRefund] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await OrderService.getById(id)
        setOrder(res.data)
        const total = res.data.total || res.data.price || 0
        setRefundAmount(total.toFixed(2))
      } catch (err) {
        toast.error('Failed to load order details.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Enter a valid refund amount.')
      return
    }
    try {
      await OrderService.refund(id, { amount: refundAmount })
      toast.success(`$${refundAmount} refunded successfully`)
      setShowRefund(false)
      setOrder(p => ({ ...p, status: 'Refunded', refund_amount: refundAmount }))
    } catch {
      toast.error('Refund failed. Please try again.')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
      <span className="spinner" /> Loading order details...
    </div>
  )

  if (!order) return (
    <div className="empty-state card" style={{ padding: 60, marginTop: 40 }}>
      <AlertCircle size={48} className="empty-state__icon" style={{ color: 'var(--danger)' }} />
      <h2 className="empty-state__title">Order not found</h2>
      <Link to="/admin/orders" className="btn btn--primary" style={{ marginTop: 12 }}>← Back to Orders</Link>
    </div>
  )

  const items = order.items || (order.product ? [{ product: order.product, quantity: order.quantity || 1, price: order.price }] : [])
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
  const tax = (subtotal * 0.15) || 0
  const total = subtotal + tax + (order.shipping_cost || 0)
  
  const statusStyle = STATUS_BADGE[order.status] || STATUS_BADGE.Pending

  return (
    <div className="od-container fade-in">
      {/* ── Breadcrumb ── */}
      <nav className="od-breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><Link to="/admin/dashboard">Home</Link></li>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          <li><Link to="/admin/orders">Orders</Link></li>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          <li className="active" aria-current="page">Order #{order.id}</li>
        </ol>
      </nav>

      {/* ── Header ── */}
      <div className="od-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/admin/orders')} className="od-btn-back" title="Back to orders">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="od-title">Order #{order.id}</h1>
              <span className="od-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {statusStyle.label}
              </span>
            </div>
            <p className="od-subtitle">Placed on {new Date(order.date_created).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        <div className="od-header-actions">
          <button className="btn btn--ghost btn--sm" style={{ gap: 6 }}>
            <Printer size={15} /> Print Invoice
          </button>
          {order.status !== 'Refunded' && (
            <button onClick={() => navigate(`/admin/orders/${order.id}/refund`)} className="btn btn--primary btn--sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none', boxShadow: 'none' }}>
              <RefreshCcw size={14} style={{ marginRight: 4 }} /> Refund Order
            </button>
          )}
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="od-grid">
        {/* Left Column: Line Items & Customer Details */}
        <div className="od-col-main">
          {/* Card: Order Items */}
          <div className="od-card card">
            <div className="od-card-header">
              <Package size={16} />
              <span>Line Items</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="od-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="od-product-cell">
                          <div className="od-product-thumb">
                            {item.product?.image ? (
                              <img src={`${item.product.image?.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`}`} alt={item.product?.name} />
                            ) : (
                              <span>{item.product?.category === 'Indoor' ? '🪑' : '🏕️'}</span>
                            )}
                          </div>
                          <div>
                            <div className="od-product-name">{item.product?.name || 'Deleted Product'}</div>
                            <div className="od-product-cat">{item.product?.category || 'Category'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                        {item.quantity || 1}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                        ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Customer Handoff Details */}
          <div className="od-card card">
            <div className="od-card-header">
              <User size={16} />
              <span>Handoff Partner Profile</span>
            </div>
            <div className="od-card-body od-info-grid">
              <div>
                <label className="od-field-label">Student Name</label>
                <div className="od-field-value" style={{ fontWeight: 700 }}>
                  {order.customer?.name || order.customer_name || 'Verified Student'}
                </div>
              </div>
              <div>
                <label className="od-field-label">Email Address</label>
                <div className="od-field-value">
                  <a href={`mailto:${order.customer?.email}`} className="od-link">
                    {order.customer?.email || '—'}
                  </a>
                </div>
              </div>
              <div>
                <label className="od-field-label">Phone Number</label>
                <div className="od-field-value">
                  <a href={`tel:${order.customer?.phone}`} className="od-link">
                    {order.customer?.phone || '—'}
                  </a>
                </div>
              </div>
              <div>
                <label className="od-field-label">University / Student ID</label>
                <div className="od-field-value">
                  {order.customer?.university_name || 'stuRENT'} • {order.customer?.student_id || 'Verified'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes or Handoff Instructions */}
          {order.note && (
            <div className="od-card card">
              <div className="od-card-header">
                <MessageSquare size={16} />
                <span>Special Instructions / Handoff Note</span>
              </div>
              <div className="od-card-body">
                <blockquote className="od-note-quote">
                  "{order.note}"
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summaries & Handoff Locations */}
        <div className="od-col-side">
          {/* Card: Order Financial Summary */}
          <div className="od-card card">
            <div className="od-card-header">
              <DollarSign size={16} />
              <span>Order Summary</span>
            </div>
            <div className="od-card-body">
              <div className="od-summary-row">
                <span>Items Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="od-summary-row">
                <span>Escrow Fee / Tax (15%):</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>
              <div className="od-summary-row" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <span>Delivery/Handoff Fee:</span>
                <strong>${(order.shipping_cost || 0).toFixed(2)}</strong>
              </div>
              {order.refund_amount && (
                <div className="od-summary-row" style={{ color: 'var(--danger)', marginTop: 8 }}>
                  <span>Refunded Amount:</span>
                  <strong>-${parseFloat(order.refund_amount).toFixed(2)}</strong>
                </div>
              )}
              <div className="od-summary-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card: Handoff Location & Fulfillment */}
          <div className="od-card card">
            <div className="od-card-header">
              <MapPin size={16} />
              <span>Handoff Logistics</span>
            </div>
            <div className="od-card-body">
              <div style={{ marginBottom: 16 }}>
                <label className="od-field-label">Scheduled Address / Location</label>
                <div className="od-field-value" style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                  <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{order.shipping_address || order.customer?.university_name || 'Main Campus Quad'}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <label className="od-field-label">Status Progression</label>
                <div className="od-timeline" style={{ marginTop: 8 }}>
                  <div className="od-timeline-item active">
                    <span className="od-timeline-dot success" />
                    <div className="od-timeline-content">
                      <strong>Order Created</strong>
                      <span>{new Date(order.date_created).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`od-timeline-item ${order.shipped_at ? 'active' : ''}`}>
                    <span className={`od-timeline-dot ${order.shipped_at ? 'success' : 'pending'}`} />
                    <div className="od-timeline-content">
                      <strong>Handoff Shipped / Scheduled</strong>
                      <span>{order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : 'Pending action'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Custom Scoped CSS ── */}
      <style>{`
        .od-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 10px 80px;
          font-family: 'DM Sans', var(--font);
        }

        /* Breadcrumb navigation */
        .od-breadcrumb {
          margin-bottom: 24px;
        }
        .od-breadcrumb ol {
          display: flex;
          align-items: center;
          list-style: none;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .od-breadcrumb li a {
          color: var(--primary);
          transition: color 0.15s;
        }
        .od-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .od-breadcrumb li.active {
          color: var(--text);
          font-weight: 500;
        }

        /* Header block */
        .od-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .od-btn-back {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-2);
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .od-btn-back:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
          color: var(--primary);
        }
        .od-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          margin: 0;
        }
        .od-subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .od-status {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 11px;
          border-radius: var(--radius-full);
        }
        .od-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Grid */
        .od-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Card stylings */
        .od-card {
          margin-bottom: 24px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .od-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          font-weight: 700;
          font-size: 14px;
          color: var(--text);
          background: var(--bg-3);
        }
        .od-card-body {
          padding: 20px;
        }

        /* Line items table */
        .od-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .od-table th {
          padding: 12px 20px;
          background: var(--bg-3);
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .od-table td {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .od-table tr:last-child td {
          border-bottom: none;
        }
        .od-product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .od-product-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .od-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .od-product-name {
          font-weight: 700;
          color: var(--text);
        }
        .od-product-cat {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Info Grid */
        .od-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .od-field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.03em;
          margin-bottom: 5px;
        }
        .od-field-value {
          font-size: 13.5px;
          color: var(--text);
        }
        .od-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
        .od-link:hover {
          text-decoration: underline;
        }

        /* Instructions blockquote */
        .od-note-quote {
          margin: 0;
          padding: 12px 16px;
          border-left: 3px solid var(--primary);
          background: var(--bg-3);
          font-style: italic;
          color: var(--text);
          font-size: 13.5px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        /* Summary rows */
        .od-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .od-summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 17px;
          font-weight: 850;
          color: var(--primary);
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed var(--border);
        }

        /* Timeline */
        .od-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          padding-left: 8px;
        }
        .od-timeline-item {
          display: flex;
          gap: 14px;
          position: relative;
        }
        .od-timeline-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px var(--bg-2);
          z-index: 2;
        }
        .od-timeline-dot.success {
          background: var(--success);
        }
        .od-timeline-dot.pending {
          background: var(--border);
        }
        .od-timeline-content {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }
        .od-timeline-content strong {
          font-size: 13px;
          color: var(--text);
        }
        .od-timeline-content span {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 900px) {
          .od-grid {
            grid-template-columns: 1fr;
          }
          .od-info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}
