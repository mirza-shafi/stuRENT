import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MessageCircle, ShoppingCart, Tag, Star } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import StudentService from '../../services/studentService'
import PaymentModal from '../../components/ui/PaymentModal'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: product, loading } = useApi(
    () => StudentService.getProduct(id).then(r => r.data), [id]
  )

  const [mode, setMode]         = useState('rent') // 'rent' | 'buy'
  const [days, setDays]         = useState(1)
  const [showPay, setShowPay]   = useState(false)

  const rentTotal = product ? (parseFloat(product.price) * days).toFixed(2) : '0.00'
  const buyPrice  = product?.buy_price || (parseFloat(product?.price || 0) * 30).toFixed(2)

  const handleAction = () => {
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return }
    setShowPay(true)
  }

  const handleMessage = () => {
    if (!user) { toast.error('Please sign in to message'); navigate('/login'); return }
    navigate('/messages')
    toast('Opening messages...', { icon: '💬' })
  }

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (!product) return (
    <div className="empty-state card" style={{ marginTop: 32 }}>
      <Package size={48} className="empty-state__icon" />
      <p className="empty-state__title">Product not found</p>
      <Link to="/browse" className="btn btn--primary">← Browse</Link>
    </div>
  )

  const catColor = product.category === 'Indoor' ? 'var(--primary)' : '#ef4444'

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <Link to="/browse" className="btn btn--ghost btn--sm"><ArrowLeft size={14}/> Back to Browse</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 32, alignItems: 'start' }}>
        {/* Left — Product visual */}
        <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 80 }}>
          <div style={{ height: 220, background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', fontSize: 72 }}>
            {product.category === 'Indoor' ? '🪑' : '🏕️'}
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s<=4?'var(--warning)':'none'} color="var(--warning)" />)}
              <span className="text-xs text-muted" style={{ marginLeft: 6 }}>4.0 (12 reviews)</span>
            </div>
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.tags.map(t => (
                  <span key={t.id} style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={9}/> {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Details + action */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: catColor, background: `${catColor}18`, padding: '3px 10px', borderRadius: 999, marginBottom: 10, display: 'inline-block' }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{product.name}</h1>
          {product.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          )}

          {/* Mode toggle: Rent / Buy */}
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid var(--border)', width: 'fit-content' }}>
            {['rent','buy'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, transition: 'all .2s', background: mode === m ? 'var(--primary)' : 'none', color: mode === m ? '#fff' : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                {m === 'rent' ? '📅 Rent' : '🛒 Buy'}
              </button>
            ))}
          </div>

          {/* Rent calculator */}
          {mode === 'rent' && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Rental Calculator</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <label style={{ fontSize: 14, color: 'var(--text-muted)', minWidth: 80 }}>Days: {days}</label>
                <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 8, padding: '12px 16px' }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>${product.price}/day × {days} day{days>1?'s':''}</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>${rentTotal}</span>
              </div>
            </div>
          )}

          {/* Buy price */}
          {mode === 'buy' && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Purchase Price</div>
              <div style={{ fontWeight: 800, fontSize: 32, color: 'var(--success)' }}>${buyPrice}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>One-time payment — item is yours</div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="action-btn" className="btn btn--primary btn--lg" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAction}>
              <ShoppingCart size={16}/> {mode === 'rent' ? `Rent for $${rentTotal}` : `Buy for $${buyPrice}`}
            </button>
            <button className="btn btn--ghost btn--lg" onClick={handleMessage} title="Message seller">
              <MessageCircle size={16}/> Chat
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, textAlign: 'center' }}>
            🔒 Secure payment · Cancel anytime
          </p>
        </div>
      </div>

      {/* Payment modal */}
      {showPay && (
        <PaymentModal
          product={{ ...product, buy_price: buyPrice }}
          rentDays={days}
          mode={mode}
          onClose={() => setShowPay(false)}
          onSuccess={() => { setTimeout(() => { setShowPay(false); navigate('/my-orders') }, 1500) }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.3fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
