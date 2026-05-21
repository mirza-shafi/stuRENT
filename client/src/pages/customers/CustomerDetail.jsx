/**
 * CustomerDetail.jsx — Single customer detail + their orders (View)
 */

import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, ShoppingCart } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { useApi } from '../../hooks/useApi'
import CustomerService from '../../services/customerService'

export default function CustomerDetail() {
  const { id } = useParams()

  const { data: customer, loading: cLoading } = useApi(
    () => CustomerService.getById(id).then((r) => r.data), [id]
  )
  const { data: ordersData, loading: oLoading } = useApi(
    () => CustomerService.getOrders(id).then((r) => r.data), [id]
  )

  const orders = ordersData?.results ?? ordersData ?? []

  if (cLoading) {
    return (
      <div className="loading-screen">
        <span className="spinner" />
        <p>Loading customer...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link to="/customers" className="btn btn--ghost btn--sm">
            <ArrowLeft size={14} /> Back
          </Link>
          <div>
            <h1 className="page-title">{customer?.name}</h1>
            <p className="page-subtitle">Customer profile & order history</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-2)' }}>
            <Mail size={16} /> <span className="text-sm">Email</span>
          </div>
          <p className="font-semi">{customer?.email}</p>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-2)' }}>
            <Phone size={16} /> <span className="text-sm">Phone</span>
          </div>
          <p className="font-semi">{customer?.phone || '—'}</p>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-2)' }}>
            <ShoppingCart size={16} /> <span className="text-sm">Total Orders</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--clr-primary)' }}>
            {orders.length}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="glass-card">
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--clr-border)' }}>
          <h2 style={{ fontWeight: 600 }}>Order History</h2>
        </div>
        <div className="table-wrapper">
          {oLoading ? (
            <div className="flex-center" style={{ padding: 'var(--space-10)' }}>
              <span className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} className="empty-state__icon" />
              <p className="empty-state__title">No orders yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-muted text-sm">#{o.id}</td>
                    <td className="font-semi">{o.product_name}</td>
                    <td><Badge status={o.status} /></td>
                    <td className="text-muted">{o.note || '—'}</td>
                    <td className="text-muted text-sm">
                      {new Date(o.date_created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
