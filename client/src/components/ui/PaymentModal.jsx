/**
 * PaymentModal.jsx — 4-step fake payment gateway
 * Steps: 1-Summary  2-Card Details  3-Processing  4-Success
 */
import { useState, useEffect } from 'react'
import { X, CreditCard, CheckCircle, Lock } from 'lucide-react'

export default function PaymentModal({ product, rentDays = 1, mode = 'rent', onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })

  const price     = mode === 'rent'
    ? (parseFloat(product?.price || 0) * rentDays).toFixed(2)
    : parseFloat(product?.buy_price || product?.price || 0).toFixed(2)

  const handleCardChange = (e) => setCard(p => ({ ...p, [e.target.name]: e.target.value }))

  const handlePay = () => {
    setStep(3)
    setTimeout(() => { setStep(4); onSuccess?.() }, 2200)
  }

  // Format card number with spaces
  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const fmtExp  = (v) => v.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d)/,'$1/$2')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Steps bar */}
        <div className="payment-steps">
          {[1,2,3,4].map(s => (
            <div key={s} className={`payment-step ${step > s ? 'payment-step--done' : step === s ? 'payment-step--active' : ''}`} />
          ))}
        </div>

        {/* Step 1 — Summary */}
        {step === 1 && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Order Summary</h2>
              <button className="btn btn--ghost btn--sm" onClick={onClose}><X size={16} /></button>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{product?.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>{mode === 'rent' ? `Rent × ${rentDays} day${rentDays > 1 ? 's' : ''}` : 'Purchase price'}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>${mode === 'rent' ? product?.price : product?.buy_price || product?.price}/{ mode === 'rent' ? 'day' : 'unit'}</span>
              </div>
              {mode === 'rent' && (
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>${price}</span>
                </div>
              )}
            </div>
            <button className="btn btn--primary btn--full btn--lg" onClick={() => setStep(2)}>
              <CreditCard size={16} /> Proceed to Payment
            </button>
          </>
        )}

        {/* Step 2 — Card Details */}
        {step === 2 && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Card Details</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Lock size={12} /> Secure Payment
              </div>
            </div>
            {/* Mini card preview */}
            <div className="wallet-card" style={{ marginBottom: '20px', minHeight: '120px' }}>
              <div className="wallet-card__label">Card Number</div>
              <div className="wallet-card__number">{card.number || '•••• •••• •••• ••••'}</div>
              <div className="wallet-card__footer">
                <span>{card.name || 'YOUR NAME'}</span>
                <span>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input name="number" className="form-input" placeholder="1234 5678 9012 3456" value={fmtCard(card.number)} onChange={e => setCard(p => ({ ...p, number: e.target.value.replace(/\D/g,'') }))} maxLength={19} />
            </div>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input name="name" className="form-input" placeholder="John Doe" value={card.name} onChange={handleCardChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Expiry</label>
                <input name="expiry" className="form-input" placeholder="MM/YY" value={fmtExp(card.expiry)} onChange={e => setCard(p => ({ ...p, expiry: e.target.value.replace(/\D/g,'') }))} maxLength={5} />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input name="cvv" className="form-input" placeholder="•••" type="password" maxLength={3} value={card.cvv} onChange={handleCardChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn--ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn--primary btn--full btn--lg" onClick={handlePay} disabled={card.number.length < 16 || !card.name || card.expiry.length < 4 || card.cvv.length < 3}>
                Pay ${price}
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Processing */}
        {step === 3 && (
          <div className="payment-success" style={{ padding: '48px 0' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', position: 'relative' }}>
              <span className="spinner" style={{ width: 64, height: 64, border: '4px solid var(--border)', borderTopColor: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Processing Payment...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please wait, do not close this window.</p>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="payment-success">
            <div className="payment-success__icon">
              <CheckCircle size={32} color="var(--success)" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Payment Successful! 🎉</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              {mode === 'rent' ? `Your rental for ${rentDays} day(s) is confirmed.` : 'Your purchase is confirmed.'}
            </p>
            <p style={{ fontWeight: 800, fontSize: '24px', color: 'var(--primary)', marginBottom: '24px' }}>${price} paid</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn--primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
