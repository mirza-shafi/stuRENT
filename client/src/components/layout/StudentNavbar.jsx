import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Package, Plus, Settings, LogOut, LogIn, Menu, X, ShoppingBag } from 'lucide-react'
import { useCart } from '../CartWishlist'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import toast from 'react-hot-toast'

export default function StudentNavbar() {
  const { user, logout, openLoginModal, openRegisterModal } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const avatarUrl = user?.avatar_url || localStorage.getItem('user_avatar')
  const loginMethod = localStorage.getItem('login_method')

  const handleLogout = async () => { await logout(); toast.success('Logged out'); navigate('/') }

  const link = (to, icon, label) => {
    if (to === '/products/add-product' && !user) {
      return (
        <button
          key={label}
          className="student-nav__link"
          onClick={() => {
            toast.error('Please sign in to post a listing!')
            openLoginModal()
            setOpen(false)
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {icon} {label}
        </button>
      )
    }
    return (
      <NavLink to={to} className={({ isActive }) => `student-nav__link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
        {icon} {label}
      </NavLink>
    )
  }

  return (
    <header className="snav">
      <div className="snav__inner">
        <Link to="/" className="snav__logo">stu<span>RENT</span></Link>

        <nav className="snav__links">
          {link('/products', <Package size={15}/>, 'All Products')}
          {link('/products/add-product', <Plus size={15}/>, 'Be a Vendor')}
          {user && link('/my-products', <Package size={15}/>, 'My Products')}
        </nav>

        <div className="snav__right">
          <ThemeToggle />
          <Link to="/cart" className="snav__icon-btn" title="Shopping Cart" style={{ position: 'relative', color: 'var(--text-muted)' }}>
            <ShoppingBag size={15}/>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-2)'
              }}>{cartCount}</span>
            )}
          </Link>
          {user ? (
            <>
              {user.is_staff && <Link to="/dashboard" className="btn btn--ghost btn--sm">Admin Panel</Link>}
              <Link to="/profile" className="snav__avatar" title="My Profile" style={{ overflow: 'hidden', background: loginMethod === 'google' ? '#fff' : undefined, border: loginMethod === 'google' ? '1px solid var(--border)' : undefined }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : loginMethod === 'google' ? (
                  <svg width="20" height="20" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                ) : (
                  user.username?.[0]?.toUpperCase()
                )}
              </Link>
              <Link to="/profile" className="snav__icon-btn" title="Settings" style={{ color: 'var(--text-muted)' }}>
                <Settings size={15}/>
              </Link>
              <button onClick={handleLogout} className="snav__icon-btn" title="Logout"><LogOut size={16}/></button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="btn btn--ghost btn--sm"><LogIn size={14}/> Sign In</button>
              <button onClick={openRegisterModal} className="btn btn--primary btn--sm">Sign Up</button>
            </>
          )}
          <button className="snav__burger" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>

      {open && (
        <div className="snav__mobile">
          {link('/products', null, '📋 All Products')}
          {link('/products/add-product', null, '✨ Be a Vendor')}
          {user && link('/my-products', null, '📦 My Products')}
          {user && link('/profile',   null, '👤 Profile')}
          {!user && <button className="btn btn--ghost btn--full" onClick={() => { setOpen(false); openLoginModal() }}>Sign In</button>}
          {!user && <button className="btn btn--primary btn--full" onClick={() => { setOpen(false); openRegisterModal() }}>Sign Up</button>}
          {user  && <button className="btn btn--danger btn--full" onClick={handleLogout}>Logout</button>}
        </div>
      )}

      <style>{`
        .snav { position: sticky; top: 0; z-index: 100; background: var(--bg-2); border-bottom: 1px solid var(--border); }
        .snav__inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 24px; }
        .snav__logo { font-size: 20px; font-weight: 800; flex-shrink: 0; }
        .snav__logo span { background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .snav__links { display: flex; align-items: center; gap: 4px; flex: 1; }
        .student-nav__link, .snav__links a { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--text-muted); transition: all .2s; }
        .student-nav__link:hover, .snav__links a:hover { background: var(--surface-hov); color: var(--text); }
        .student-nav__link.active, .snav__links a.active { background: var(--primary-glow); color: var(--primary); }
        .snav__right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
        .snav__avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .snav__icon-btn { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); transition: all .2s; }
        .snav__icon-btn:hover { color: var(--danger); border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.1); }
        .snav__burger { display: none; width: 36px; height: 36px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); color: var(--text); align-items: center; justify-content: center; }
        .snav__mobile { display: flex; flex-direction: column; gap: 8px; padding: 16px 24px; border-top: 1px solid var(--border); background: var(--bg-2); }
        .snav__mobile a { padding: 12px 16px; border-radius: 10px; font-weight: 500; }
        @media (max-width: 768px) { .snav__links { display: none; } .snav__burger { display: flex; } }
      `}</style>
    </header>
  )
}
