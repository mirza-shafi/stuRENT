/**
 * Sidebar.jsx — Admin nav with avatar dropdown (Settings + Logout confirmation)
 */
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Package, ShoppingCart, Plus, RefreshCw, LogOut, Settings, Menu, X, ChevronUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ProductService from '../../services/productService'

const NAV_ITEMS = [
  { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/customers',     icon: Users,           label: 'Customers'  },
  { to: '/admin/products',      icon: Package,         label: 'Products'   },
  { to: '/admin/add-product',   icon: Plus,            label: 'Add Product' },
  { to: '/admin/orders',        icon: ShoppingCart,    label: 'Orders'     },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [dropOpen, setDropOpen]         = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const dropRef = useRef(null)

  useEffect(() => {
    if (!user?.is_staff) return

    const checkPending = async () => {
      try {
        const res = await ProductService.getPending()
        const count = res.data?.results?.length ?? res.data?.length ?? 0
        setPendingCount(count)
      } catch (err) {
        console.error('Failed to fetch pending products for sidebar badge', err)
      }
    }

    checkPending()
    const interval = setInterval(checkPending, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const confirmLogout = async () => {
    setShowLogoutModal(false)
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        className="sb-toggle"
        style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 200, width: 40, height: 40, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }} />}

      <aside style={{ position: 'fixed', top: 0, left: 0, width: 'var(--sidebar-w)', height: '100vh', background: 'var(--bg-2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 100, transition: 'transform .25s ease' }} className={mobileOpen ? 'sb-open' : ''}>

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
                stu<span style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RENT</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/dashboard'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10,
                fontSize: 14, fontWeight: 500, transition: 'all .15s',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-glow)' : 'none',
                borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                textDecoration: 'none',
              })}
            >
              <Icon size={18}/><span>{label}</span>
              {label === 'Products' && pendingCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 999,
                  lineHeight: 1
                }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Avatar footer with dropdown ── */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', position: 'relative' }} ref={dropRef}>

          {/* Avatar popup dropdown */}
          {dropOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% - 8px)', left: 12, right: 12,
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: '0 -8px 32px rgba(0,0,0,.25)',
              overflow: 'hidden', zIndex: 200,
              animation: 'slideUp .15s ease'
            }}>
              {/* User info header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'Administrator'}</div>
                </div>
              </div>

              {/* Settings */}
              <Link
                to="/admin/settings"
                onClick={() => setDropOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'background .15s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hov)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={15} color="var(--text-muted)"/>
                </div>
                Settings
              </Link>

              {/* Logout */}
              <button
                onClick={() => { setDropOpen(false); setShowLogoutModal(true) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--danger)', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={15} color="var(--danger)"/>
                </div>
                Logout
              </button>
            </div>
          )}

          {/* Avatar button */}
          <button
            onClick={() => setDropOpen(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: dropOpen ? 'var(--primary-glow)' : 'var(--surface)', border: `1px solid ${dropOpen ? 'rgba(99,102,241,.3)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { if (!dropOpen) { e.currentTarget.style.background = 'var(--surface-hov)' } }}
            onMouseLeave={e => { if (!dropOpen) { e.currentTarget.style.background = 'var(--surface)' } }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</div>
            </div>
            <ChevronUp size={14} color="var(--text-muted)" style={{ transform: dropOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform .2s', flexShrink: 0 }} />
          </button>
        </div>
      </aside>

      {/* ── Logout confirmation modal ── */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 18, padding: '36px 32px', maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)', animation: 'slideUp .2s ease' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <LogOut size={26} color="var(--danger)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Sign Out?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Are you sure you want to sign out of the admin panel?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn btn--ghost"
                style={{ flex: 1, justifyContent: 'center', borderRadius: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'var(--danger)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @media (max-width: 768px) {
          .sb-toggle { display: flex !important; }
          aside { transform: translateX(-100%); }
          .sb-open { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  )
}
