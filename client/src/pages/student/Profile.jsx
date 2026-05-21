/**
 * Profile.jsx — Student profile with wallet card and settings
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, User, Settings, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Settings']

export default function Profile() {
  const { user } = useAuth()
  const [tab, setTab]         = useState('Overview')
  const [balance, setBalance] = useState(0.00)
  const [addAmt, setAddAmt]   = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleAddMoney = () => {
    const amt = parseFloat(addAmt)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')
    setBalance(b => b + amt)
    setAddAmt(''); setShowAdd(false)
    toast.success(`$${amt.toFixed(2)} added to wallet!`)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account and wallet</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="wallet-card" style={{ maxWidth: '380px', marginBottom: '32px' }}>
        <div className="wallet-card__label">stuRENT Wallet</div>
        <div className="wallet-card__balance">${balance.toFixed(2)}</div>
        <div className="wallet-card__number">
          •••• •••• •••• {String(user?.id || '0000').padStart(4,'0')}
        </div>
        <div className="wallet-card__footer">
          <span>{user?.username?.toUpperCase()}</span>
          <span>STUDENT</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Money
        </button>
        <Link to="/my-orders" className="btn btn--ghost">
          <ShoppingBag size={15} /> My Orders
        </Link>
        <Link to="/messages" className="btn btn--ghost">
          💬 Messages
        </Link>
      </div>

      {/* Add Money Form */}
      {showAdd && (
        <div className="card" style={{ padding: '20px', maxWidth: '340px', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '14px' }}>Add Money to Wallet</h3>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input className="form-input" type="number" min="1" placeholder="0.00" value={addAmt} onChange={e => setAddAmt(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAddMoney}>Add Funds</button>
          </div>
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontWeight: 600, fontSize: '14px', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', transition: 'all .2s' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: '24px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', align: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{user?.username}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email}</div>
              <div style={{ background: 'rgba(99,102,241,.12)', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', display: 'inline-block', marginTop: '6px' }}>Student</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[['Wallet Balance', `$${balance.toFixed(2)}`],['Member Since', new Date().getFullYear()]].map(([k,v]) => (
              <div key={k} style={{ background: 'var(--surface)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Settings' && (
        <div className="card" style={{ padding: '24px', maxWidth: '480px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '18px' }}>Account Settings</h3>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" defaultValue={user?.username} placeholder="Display name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" defaultValue={user?.email} type="email" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Leave blank to keep current" />
          </div>
          <button className="btn btn--primary" onClick={() => toast.success('Settings saved!')}>Save Changes</button>
        </div>
      )}
    </div>
  )
}
