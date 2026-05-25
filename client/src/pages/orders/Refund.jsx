/**
 * Refund.jsx — Refund management page (Phoenix style)
 * Process and manage refunds for specific orders
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, AlertCircle, CheckCircle, DollarSign, Package } from 'lucide-react'
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
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
      <h2>Order not found</h2>
      <Link to="/admin/orders" className="btn btn--primary" style={{ marginTop: 12 }}>← Back to Orders</Link>
    </div>
  )

  const items = order.items || (order.product ? [{ product: order.product, quantity: order.quantity || 1, price: order.price }] : [])
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
  const tax = (subtotal * 0.15) || 0
  const total = subtotal + tax + (order.shipping_cost || 0)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate(`/admin/orders/${id}`)} className="btn btn--ghost" style={{ padding: 8 }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Refund Order #{order.id}</h1>
          <p className="page-subtitle">Customer ID: {order.customer?.id || order.customer_id || '—'}</p>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        
        {/* Left: Refund Form */}
        <div>
          {refunded && (
            <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>Refund Processed</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>The refund of ${refundAmount} has been successfully processed.</p>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Order Items</h2>
            </div>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>Product</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>Qty</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>Price</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {item.product?.image ? (
                          <img src={`${item.product.image?.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`}`} alt={item.product?.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                        )}
                        <span>{item.product?.name || 'Product'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity || 1}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)' }}>${item.price?.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>${(item.price * (item.quantity || 1))?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Refund Form */}
          {!refunded && (
            <form onSubmit={handleRefund}>
              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Refund Details</h2>

                {/* Refund Reason */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text)' }}>Reason for Refund</label>
                  <select
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select a reason...</option>
                    <option value="customer_request">Customer Request</option>
                    <option value="damaged_item">Damaged Item</option>
                    <option value="wrong_item">Wrong Item Sent</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Refund Amount */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text)' }}>Refund Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>$</span>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      step="0.01"
                      max={total}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 28px',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        fontSize: 14,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Maximum: ${total.toFixed(2)}
                  </p>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text)' }}>Internal Notes (Optional)</label>
                  <textarea
                    placeholder="Add any internal notes about this refund..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      minHeight: 100,
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn--primary btn--full"
                  style={{ marginBottom: 8 }}
                >
                  {processing ? <span className="spinner" style={{ marginRight: 8 }} /> : '✓'} Refund ${refundAmount || '0.00'}
                </button>
                <Link to={`/admin/orders/${id}`} className="btn btn--ghost btn--full">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Right: Summary */}
        <div>
          {/* Order Summary */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Order Summary</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Items subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Discount:</span>
                <span>-${(order.discount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <span>Shipping:</span>
                <span>${(order.shipping_cost || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Customer</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer?.name || order.customer_name || '—'}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Email</div>
                <a href={`mailto:${order.customer?.email}`} style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
                  {order.customer?.email || '—'}
                </a>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Phone</div>
                <a href={`tel:${order.customer?.phone}`} style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
                  {order.customer?.phone || '—'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
