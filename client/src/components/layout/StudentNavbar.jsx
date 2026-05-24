import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Package, Plus, Settings, LogOut, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import toast from 'react-hot-toast'

export default function StudentNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await logout(); toast.success('Logged out'); navigate('/') }

  const link = (to, icon, label) => (
    <NavLink to={to} className={({ isActive }) => `student-nav__link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
      {icon} {label}
    </NavLink>
  )

  return (
    <header className="snav">
      <div className="snav__inner">
        <Link to="/" className="snav__logo">stu<span>RENT</span></Link>

        <nav className="snav__links">
          {link('/products', <Package size={15}/>, 'All Products')}
          {link('/products/add-product', <Plus size={15}/>, 'Be a Vendor')}
        </nav>

        <div className="snav__right">
          <ThemeToggle />
          {user ? (
            <>
              {user.is_staff && <Link to="/dashboard" className="btn btn--ghost btn--sm">Admin Panel</Link>}
              <Link to="/profile" className="snav__avatar" title="My Profile">{user.username?.[0]?.toUpperCase()}</Link>
              <Link to="/profile" className="snav__icon-btn" title="Settings" style={{ color: 'var(--text-muted)' }}>
                <Settings size={15}/>
              </Link>
              <button onClick={handleLogout} className="snav__icon-btn" title="Logout"><LogOut size={16}/></button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn--ghost btn--sm"><LogIn size={14}/> Sign In</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Sign Up</Link>
            </>
          )}
          <button className="snav__burger" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>

      {open && (
        <div className="snav__mobile">
          {link('/products', null, '📋 All Products')}
          {link('/products/add-product', null, '✨ Be a Vendor')}
          {user && link('/profile',   null, '👤 Profile')}
          {!user && <Link to="/login"    className="btn btn--ghost btn--full" onClick={()=>setOpen(false)}>Sign In</Link>}
          {!user && <Link to="/register" className="btn btn--primary btn--full" onClick={()=>setOpen(false)}>Sign Up</Link>}
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
