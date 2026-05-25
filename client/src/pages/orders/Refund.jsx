/**
 * Refund.jsx — Premium Admin Refund Management Page (Phoenix Style)
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, AlertCircle, CheckCircle, DollarSign,
  Package, ChevronRight, User, Mail, Phone, RefreshCcw
} from 'lucide-react'
import OrderService from '../../services/orderService'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

export default function Refund() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [refunded, setRefunded] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await OrderService.getById(id)
        setOrder(res.data)
        const total = res.data.total || res.data.price || 0
        setRefundAmount(total.toFixed(2))
      } catch {
        toast.error('Failed to load order details.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleRefund = async (e) => {
    e.preventDefault()
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Enter a valid refund amount.')
      return
    }
    if (!refundReason.trim()) {
      toast.error('Please provide a refund reason.')
      return
    }

    setProcessing(true)
    try {
      await OrderService.refund(id, { 
        amount: refundAmount,
        reason: refundReason 
      })
      toast.success(`$${refundAmount} refunded successfully`)
      setRefunded(true)
      setOrder(p => ({ ...p, status: 'Refunded', refund_amount: refundAmount, refund_reason: refundReason }))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Refund failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
      <span className="spinner" /> Loading refund details...
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

  return (
    <div className="ref-container fade-in">
      {/* ── Breadcrumb ── */}
      <nav className="ref-breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><Link to="/admin/dashboard">Home</Link></li>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          <li><Link to="/admin/orders">Orders</Link></li>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          <li><Link to={`/admin/orders/${order.id}`}>Order #{order.id}</Link></li>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          <li className="active" aria-current="page">Refund</li>
        </ol>
      </nav>

      {/* ── Header ── */}
      <div className="ref-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="ref-btn-back" title="Back to order">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="ref-title">Refund Order #{order.id}</h1>
            <p className="ref-subtitle">Process transaction reversals for students</p>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid ── */}
      <div className="ref-grid">
        {/* Left Column: Form / Status & Line Items */}
        <div className="ref-col-main">
          {/* Refund success alert banner */}
          {refunded && (
            <div className="ref-alert-banner">
              <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--success)' }}>Refund Processed Successfully</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  A refund of <strong>${parseFloat(refundAmount).toFixed(2)}</strong> has been credited. The order status is now updated.
                </p>
              </div>
            </div>
          )}

          {/* Refund Details Form */}
          {!refunded && (
            <form onSubmit={handleRefund} className="ref-card card" style={{ padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                Refund Request Form
              </h2>

              {/* Reason */}
              <div className="ref-form-group">
                <label className="ref-field-label">Reason for Refund *</label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="ref-select"
                  required
                >
                  <option value="">Select a verified reason...</option>
                  <option value="customer_request">🤝 Customer Request / Friendly Cancellation</option>
                  <option value="damaged_item">🪑 Damaged Item / Condition Issue</option>
                  <option value="wrong_item">❌ Wrong Item Handed Over</option>
                  <option value="not_as_described">⚠️ Item Not as Described</option>
                  <option value="late_delivery">⏰ Handoff Timeout / Seller Absent</option>
                  <option value="other">💬 Other (Please specify in notes)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="ref-form-group">
                <label className="ref-field-label">Refund Amount ($) *</label>
                <div style={{ position: 'relative' }}>
                  <span className="ref-currency-symbol">$</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    step="0.01"
                    max={total}
                    className="ref-input"
                    required
                  />
                </div>
                <span className="ref-input-hint">Maximum refundable amount is <strong>${total.toFixed(2)}</strong></span>
              </div>

              {/* Internal Notes */}
              <div className="ref-form-group">
                <label className="ref-field-label">Internal Handoff Notes</label>
                <textarea
                  placeholder="Describe resolution details, meeting info, or bank cash return details..."
                  className="ref-textarea"
                  rows={4}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                <Link to={`/admin/orders/${order.id}`} className="ref-btn-discard">
                  Cancel
                </Link>
                <button type="submit" className="ref-btn-submit" disabled={processing}>
                  {processing ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : <><RefreshCcw size={14} style={{ marginRight: 6 }} /> Process Refund</>}
                </button>
              </div>
            </form>
          )}

          {/* Table: Order Items */}
          <div className="ref-card card">
            <div className="ref-card-header">
              <Package size={16} />
              <span>Items in this Order</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ref-table">
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
                        <div className="ref-product-cell">
                          <div className="ref-product-thumb">
                            {item.product?.image ? (
                              <img src={`${item.product.image?.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`}`} alt={item.product?.name} />
                            ) : (
                              <span>{item.product?.category === 'Indoor' ? '🪑' : '🏕️'}</span>
                            )}
                          </div>
                          <div>
                            <div className="ref-product-name">{item.product?.name || 'Product'}</div>
                            <div className="ref-product-cat">{item.product?.category || 'Category'}</div>
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
        </div>

        {/* Right Column: Financial Summary & Profile */}
        <div className="ref-col-side">
          {/* Card: Financial Summary */}
          <div className="ref-card card">
            <div className="ref-card-header">
              <DollarSign size={16} />
              <span>Original Order Summary</span>
            </div>
            <div className="ref-card-body">
              <div className="ref-summary-row">
                <span>Items Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="ref-summary-row">
                <span>Tax & Fee:</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>
              <div className="ref-summary-row" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <span>Delivery / Logistics:</span>
                <strong>${(order.shipping_cost || 0).toFixed(2)}</strong>
              </div>
              <div className="ref-summary-total">
                <span>Total Value:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card: Handoff Customer Profile */}
          <div className="ref-card card">
            <div className="ref-card-header">
              <User size={16} />
              <span>Customer Details</span>
            </div>
            <div className="ref-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="ref-avatar">
                  {order.customer?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{order.customer?.name || order.customer_name || 'Verified Student'}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: #{order.customer?.id || '—'}</span>
                </div>
              </div>

              <div className="ref-profile-info-row">
                <Mail size={13} color="var(--text-dim)" />
                <a href={`mailto:${order.customer?.email}`} className="ref-link">{order.customer?.email || '—'}</a>
              </div>
              <div className="ref-profile-info-row" style={{ marginTop: 8 }}>
                <Phone size={13} color="var(--text-dim)" />
                <a href={`tel:${order.customer?.phone}`} className="ref-link">{order.customer?.phone || '—'}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Custom Scoped CSS ── */}
      <style>{`
        .ref-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 10px 80px;
          font-family: 'DM Sans', var(--font);
        }

        /* Breadcrumb navigation */
        .ref-breadcrumb {
          margin-bottom: 24px;
        }
        .ref-breadcrumb ol {
          display: flex;
          align-items: center;
          list-style: none;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .ref-breadcrumb li a {
          color: var(--primary);
          transition: color 0.15s;
        }
        .ref-breadcrumb li a:hover {
          color: var(--primary-hov);
          text-decoration: underline;
        }
        .ref-breadcrumb li.active {
          color: var(--text);
          font-weight: 500;
        }

        /* Header block */
        .ref-header {
          margin-bottom: 28px;
        }
        .ref-btn-back {
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
        .ref-btn-back:hover {
          background: var(--surface-hov);
          border-color: var(--primary);
          color: var(--primary);
        }
        .ref-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          margin: 0;
        }
        .ref-subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* Grid layout */
        .ref-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Alert success banner */
        .ref-alert-banner {
          background: rgba(16,185,129,.12);
          border: 1px solid rgba(16,185,129,.22);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        /* Card styles */
        .ref-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .ref-card-header {
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
        .ref-card-body {
          padding: 20px;
        }

        /* Form elements */
        .ref-form-group {
          margin-bottom: 20px;
        }
        .ref-field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .ref-select, .ref-input, .ref-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-3);
          color: var(--text);
          font-size: 14px;
          padding: 10px 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .ref-select:focus, .ref-input:focus, .ref-textarea:focus {
          border-color: var(--primary);
        }
        .ref-currency-symbol {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 14px;
          pointer-events: none;
        }
        .ref-input {
          padding-left: 28px;
        }
        .ref-input-hint {
          display: block;
          font-size: 11.5px;
          color: var(--text-dim);
          margin-top: 5px;
        }
        .ref-btn-discard {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid var(--border);
          background: var(--bg-2);
          transition: all 0.2s;
          text-decoration: none;
        }
        .ref-btn-discard:hover {
          background: var(--surface-hov);
          color: var(--text);
        }
        .ref-btn-submit {
          padding: 10px 22px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 700;
          color: #fff;
          background: var(--danger);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .ref-btn-submit:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        /* Order items table */
        .ref-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .ref-table th {
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
        .ref-table td {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .ref-table tr:last-child td {
          border-bottom: none;
        }
        .ref-product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ref-product-thumb {
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
        .ref-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ref-product-name {
          font-weight: 700;
          color: var(--text);
        }
        .ref-product-cat {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Summaries */
        .ref-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .ref-summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 17px;
          font-weight: 850;
          color: var(--primary);
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed var(--border);
        }

        /* Profile details */
        .ref-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ref-profile-info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .ref-link {
          color: var(--primary);
          text-decoration: none;
        }
        .ref-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .ref-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
