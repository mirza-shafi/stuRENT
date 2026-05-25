/**
 * OrderDetail.jsx — Comprehensive order details view (Phoenix style)
 * Shows billing, shipping, items, summary, and refund options
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Printer, MoreVertical, Package, User, Mail, Phone, MapPin, DollarSign, Calendar, Gift, Inbox, MessageSquare, AlertCircle } from 'lucide-react'
import OrderService from '../../services/orderService'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

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
        // Initialize refund with full order total
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
    <div className="page-header" style={{ marginBottom: 24 }}>
      <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: 12 }} />
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
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/admin/orders')} className="btn btn--ghost" style={{ padding: 8 }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Order #{order.id}</h1>
            <p className="page-subtitle" style={{ marginTop: 4 }}>Customer ID: {order.customer?.id || order.customer_id || '—'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm">
            <Printer size={16} /> Print
          </button>
          {order.status !== 'Refunded' && (
            <button onClick={() => navigate(`/admin/orders/${id}/refund`)} className="btn btn--primary btn--sm">
              Refund
            </button>
          )}
          <button className="btn btn--ghost btn--sm">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        
        {/* Left column: Order details */}
        <div>
          {/* Order Items */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 0 }}>Items</h2>
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
                          <img src={`${item.product.image?.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`}`} alt={item.product?.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>
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

          {/* Billing Details */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <User size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Billing Details</h2>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Customer</label>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer?.name || order.customer_name || '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email</label>
                <div style={{ fontSize: 14 }}>
                  <a href={`mailto:${order.customer?.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    {order.customer?.email || '—'}
                  </a>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phone</label>
                <div style={{ fontSize: 14 }}>
                  <a href={`tel:${order.customer?.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    {order.customer?.phone || '—'}
                  </a>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Address</label>
                <div style={{ fontSize: 14 }}>
                  {order.customer?.university_name || order.billing_address || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <MapPin size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Shipping Details</h2>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phone</label>
                <div style={{ fontSize: 14 }}>{order.customer?.phone || '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Address</label>
                <div style={{ fontSize: 14 }}>{order.shipping_address || order.customer?.university_name || '—'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Shipping Date</label>
                <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  {order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : 'Not shipped yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Order Status</h2>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Payment Status</label>
                <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: order.status === 'Completed' || order.status === 'Refunded' ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)', color: order.status === 'Completed' || order.status === 'Refunded' ? 'var(--success)' : 'var(--warning)' }}>
                  {order.status || 'Pending'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Fulfillment Status</label>
                <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: order.shipped_at ? 'rgba(16,185,129,.12)' : 'rgba(99,102,241,.12)', color: order.shipped_at ? 'var(--success)' : 'var(--primary)' }}>
                  {order.shipped_at ? 'Shipped' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Summary & Actions */}
        <div>
          {/* Order Summary */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Summary</h3>
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

          {/* Refund Section */}
          {order.status !== 'Refunded' && (
            <div className="card">
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Refund</h3>
              </div>
              <div style={{ padding: 20 }}>
                {!showRefund ? (
                  <button
                    onClick={() => setShowRefund(true)}
                    className="btn btn--ghost btn--full"
                    style={{ fontSize: 13, color: 'var(--primary)' }}
                  >
                    Initiate Refund
                  </button>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Amount</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={e => setRefundAmount(e.target.value)}
                        step="0.01"
                        max={total}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit' }}
                      />
                    </div>
                    <button
                      onClick={handleRefund}
                      className="btn btn--primary btn--full"
                      style={{ fontSize: 13, marginBottom: 8 }}
                    >
                      Refund ${refundAmount || '0.00'}
                    </button>
                    <button
                      onClick={() => setShowRefund(false)}
                      className="btn btn--ghost btn--full"
                      style={{ fontSize: 13 }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
