/**
 * MyOrders.jsx — Student's personal order history
 */

import { Link } from 'react-router-dom'
import { ShoppingBag, Package, ArrowRight, Clock, CheckCircle, Truck } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { useApi } from '../../hooks/useApi'
import StudentService from '../../services/studentService'

const STATUS_ICON = {
  Pending:           <Clock    size={14} color="var(--clr-warning)" />,
  'Out for delivery': <Truck   size={14} color="var(--clr-accent)"  />,
  Delivered:         <CheckCircle size={14} color="var(--clr-success)" />,
}

export default function MyOrders() {
  const { data, loading, execute: refetch } = useApi(StudentService.getMyOrders)
  const orders = data?.results ?? data ?? []

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track the status of your rental orders</p>
        </div>
        <Link to="/products" className="btn btn--primary btn--sm">
          <Package size={14} /> Browse More
        </Link>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: '40vh' }}>
          <span className="spinner" />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 'var(--space-12)' }}>
          <ShoppingBag size={56} className="empty-state__icon" />
          <p className="empty-state__title">No orders yet</p>
          <p className="text-muted text-sm">Browse our catalog and rent your first item!</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Items <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }) {
  return (
    <div className="glass-card order-card slide-up">
      <div className="order-card__left">
        <div className="order-card__icon">
          <Package size={24} color="var(--clr-primary)" />
        </div>
        <div>
          <h3 className="order-card__product">{order.product_name}</h3>
          <p className="order-card__meta">
            Order #{order.id} &nbsp;·&nbsp;
            {new Date(order.date_created).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          {order.note && (
            <p className="order-card__note">Note: {order.note}</p>
          )}
        </div>
      </div>

      <div className="order-card__right">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          {STATUS_ICON[order.status]}
          <Badge status={order.status} />
        </div>
        {order.product_price && (
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--clr-accent)' }}>
            ${order.product_price}<span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--clr-text-muted)', fontWeight: 400 }}>/day</span>
          </span>
        )}
      </div>

      <style>{`
        .order-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          gap: var(--space-4);
        }

        .order-card__left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex: 1;
          min-width: 0;
        }

        .order-card__icon {
          width: 48px; height: 48px;
          border-radius: var(--radius-md);
          background: var(--clr-primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .order-card__product {
          font-weight: 700;
          font-size: var(--font-size-base);
          margin-bottom: var(--space-1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-card__meta {
          font-size: var(--font-size-xs);
          color: var(--clr-text-muted);
        }

        .order-card__note {
          font-size: var(--font-size-xs);
          color: var(--clr-text-dim);
          margin-top: var(--space-1);
          font-style: italic;
        }

        .order-card__right {
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
