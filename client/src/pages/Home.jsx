import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StudentService from '../services/studentService'
import { CartProvider, useCart, CartWishlistUI } from '../components/CartWishlist'
import '../styles/home.css'

const CATS = [
  { id:'all', emoji:'🏠', label:'Home' },
  { id:'Indoor', emoji:'🪑', label:'Indoor' },
  { id:'Outdoor', emoji:'🏕️', label:'Outdoor' },
]

const SLIDES = [
  { bg:'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#312e81 100%)', tag:'🎓 Student Marketplace', title:['Rent · Buy · Sell','Student Essentials'], sub:'Find houses, furniture, electronics and more — listed by fellow students.', price:['From $5/day','Browse Now'], emoji:'🏠' },
  { bg:'linear-gradient(135deg,#312e81 0%,#6366f1 100%)', tag:'🪑 Indoor Essentials', title:['Premium','Indoor Gear'], sub:'Desks, chairs, lamps, electronics — everything for your dorm room.', price:['Starting $3/day','Rent Today'], emoji:'🪑' },
  { bg:'linear-gradient(135deg,#064e3b 0%,#10b981 100%)', tag:'🏕️ Outdoor Adventures', title:['Explore More','Spend Less'], sub:'Camping gear, sports equipment, bikes — rent instead of buying!', price:['From $8/day','Get Started'], emoji:'🏕️' },
]

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

export default function HomePage() {
  return <CartProvider><HomePageInner /></CartProvider>
}

function HomePageInner() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [clicks, setClicks] = useState(0)
  const [adminMenu, setAdminMenu] = useState(false)
  const [slide, setSlide] = useState(0)
  const [timer, setTimer] = useState({ h:4, m:23, s:47 })
  const intervalRef = useRef()
  const timerRef = useRef()

  useEffect(() => {
    StudentService.getProducts()
      .then(r => setProducts(r.data?.results ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Hero slider
  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s+1) % SLIDES.length), 4000)
    return () => clearInterval(intervalRef.current)
  }, [])

  // Countdown timer
  useEffect(() => {
    let total = 4*3600 + 23*60 + 47
    timerRef.current = setInterval(() => {
      if (total <= 0) total = 24*3600
      total--
      setTimer({ h: Math.floor(total/3600), m: Math.floor((total%3600)/60), s: total%60 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const handleLogo = () => { const n = clicks+1; setClicks(n); if(n>=3){setAdminMenu(true);setClicks(0)} }

  const filtered = products.filter(p =>
    (cat === 'all' || p.category === cat) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const goSlide = useCallback((i) => {
    clearInterval(intervalRef.current)
    setSlide(i)
    intervalRef.current = setInterval(() => setSlide(s => (s+1) % SLIDES.length), 4000)
  }, [])

  const s = SLIDES[slide]
  const pad = n => String(n).padStart(2,'0')

  return (
    <div className="hp">
      {/* TOPBAR */}
      <div className="hp-topbar">
        🎓 stuRENT — <span>The Student Marketplace</span> · Rent, Buy & Sell items from fellow students &nbsp;|&nbsp; <span>Join Free Today</span>
      </div>

      {/* HEADER */}
      <header className="hp-header">
        <div className="hp-header-inner">
          <button className="hp-logo" onClick={handleLogo}>
            stu<em>RENT</em>
          </button>

          {adminMenu && (
            <div className="hp-admin-drop">
              <div style={{ fontSize:10, color:'#94a3b8', padding:'4px 12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Admin Access</div>
              <Link to="/admin/login" onClick={()=>setAdminMenu(false)}>🔐 Admin Sign In</Link>
              <Link to="/admin/register" onClick={()=>setAdminMenu(false)}>📝 Request Admin</Link>
              <button onClick={()=>setAdminMenu(false)} style={{ width:'100%',textAlign:'left',padding:'8px 12px',fontSize:12,color:'#94a3b8',background:'none',border:'none',cursor:'pointer' }}>✕ Close</button>
            </div>
          )}

          <div className="hp-nav">
            <Link to="/" className="hp-nav-link" style={{color:'#fff'}}>Home</Link>
            <Link to="/browse" className="hp-nav-link">Browse</Link>
          </div>

          <div className="hp-search">
            <select>
              <option>All</option>
              <option>Indoor</option>
              <option>Outdoor</option>
              <option>Housing</option>
            </select>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, housing, rentals..."
              onKeyDown={e => e.key==='Enter' && navigate(`/browse?q=${encodeURIComponent(query)}`)}
            />
            <button className="hp-search-btn" onClick={() => navigate(`/browse?q=${encodeURIComponent(query)}`)}>🔍</button>
          </div>

          <div className="hp-actions">
            <HeaderCartButtons />
            {user ? (
              <Link to="/browse" className="hp-icon-btn" title="Listings" style={{ fontSize:12, fontWeight:600, width:'auto', padding:'0 14px', gap:6 }}>📦 Listings</Link>
            ) : (
              <>
                <Link to="/login" className="hp-icon-btn" title="Sign In" style={{ fontSize:12, fontWeight:600, width:'auto', padding:'0 14px' }}>Sign In</Link>
                <Link to="/register" className="hp-btn" style={{ padding:'9px 20px', fontSize:13 }}>Join Now</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <nav className="hp-cat-nav">
        <div className="hp-cat-nav-inner">
          {CATS.map(c => (
            <button key={c.id} className={`hp-cat-btn ${cat===c.id?'active':''}`} onClick={()=>setCat(c.id)}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
          <button className={`hp-cat-btn ${cat==='buy'?'active':''}`} onClick={()=>setCat('buy')}>🛒 For Sale</button>
          <button className="hp-cat-btn" onClick={()=>navigate('/browse')}>🏠 Housing</button>
          <button className="hp-cat-btn" onClick={()=>navigate('/browse')}>📦 Post Listing</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero-main" style={{ background: s.bg, transition:'opacity .4s' }}>
          <div className="hp-hero-content">
            <div className="hp-hero-tag">{s.tag}</div>
            <h1 className="hp-hero-title">
              {s.title[0]}<br/><span className="hl">{s.title[1]}</span>
            </h1>
            <p className="hp-hero-sub">{s.sub}</p>
            <div className="hp-hero-price">
              <span className="now">{s.price[0]}</span>
            </div>
            <Link to="/browse" className="hp-btn">{s.price[1]} →</Link>
          </div>
          <div className="hp-hero-emoji"><span>{s.emoji}</span></div>
          <div className="hp-hero-dots">
            {SLIDES.map((_,i) => (
              <button key={i} className={`hp-dot ${slide===i?'active':''}`} onClick={()=>goSlide(i)} />
            ))}
          </div>
        </div>
        <div className="hp-hero-side">
          <Link to="/browse" className="hp-side-card c1" style={{ textDecoration:'none' }}>
            <div>
              <div className="hp-sc-tag">Popular</div>
              <div className="hp-sc-title">Indoor<br/>Essentials</div>
              <div className="hp-sc-old">From $10/day</div>
              <div className="hp-sc-price">$3/day</div>
            </div>
            <div className="hp-sc-emoji">🪑</div>
          </Link>
          <Link to="/browse" className="hp-side-card c2" style={{ textDecoration:'none' }}>
            <div>
              <div className="hp-sc-tag">Trending</div>
              <div className="hp-sc-title">Outdoor<br/>Adventures</div>
              <div className="hp-sc-old">From $20/day</div>
              <div className="hp-sc-price">$8/day</div>
            </div>
            <div className="hp-sc-emoji">🏕️</div>
          </Link>
        </div>
      </section>

      {/* PROMO STRIP */}
      <div className="hp-promo">
        {[['🔒','Secure Payments','100% safe checkout'],['🔄','Easy Returns','30-day return policy'],['💬','Direct Chat','Message sellers directly'],['🎓','Students Only','Verified student community']].map(([icon,title,sub])=>(
          <div key={title} className="hp-promo-item">
            <span style={{ fontSize:26 }}>{icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--h-text)' }}>{title}</div>
              <div style={{ fontSize:11, color:'var(--h-muted)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Browse by Category</h2>
          <Link to="/browse" className="hp-see-all">See All →</Link>
        </div>
        <div className="hp-cats-grid">
          {[
            { emoji:'🪑', label:'Indoor', count:`${products.filter(p=>p.category==='Indoor').length} items` },
            { emoji:'🏕️', label:'Outdoor', count:`${products.filter(p=>p.category==='Outdoor').length} items` },
            { emoji:'🏠', label:'Housing', count:'Coming soon' },
            { emoji:'💻', label:'Electronics', count:'Laptops & more' },
            { emoji:'📦', label:'Furniture', count:'Desks & chairs' },
            { emoji:'🛒', label:'For Sale', count:'Buy outright' },
          ].map(c => (
            <Link key={c.label} to="/browse" className="hp-cat-card" onClick={()=>setCat(c.label)}>
              <span style={{ fontSize:30 }}>{c.emoji}</span>
              <span style={{ fontSize:12, fontWeight:500 }}>{c.label}</span>
              <span style={{ fontSize:10, color:'var(--h-muted)' }}>{c.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="hp-section" style={{ marginTop:40 }}>
        <div className="hp-flash-header">
          <h2 className="hp-section-title" style={{ color:'#fff' }}>⚡ Hot Rentals</h2>
          <div className="hp-timer">
            <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>Ends in:</span>
            <div className="hp-timer-block">{pad(timer.h)}<small>HRS</small></div>
            <div className="hp-timer-sep">:</div>
            <div className="hp-timer-block">{pad(timer.m)}<small>MIN</small></div>
            <div className="hp-timer-sep">:</div>
            <div className="hp-timer-block">{pad(timer.s)}<small>SEC</small></div>
          </div>
          <Link to="/browse" className="hp-see-all" style={{ color:'rgba(255,255,255,.7)', marginLeft:16 }}>See All →</Link>
        </div>
        <div className="hp-flash-body">
          {loading ? (
            <div className="hp-grid">
              {[1,2,3,4].map(i => <div key={i} style={{ height:240, borderRadius:12, background:'#f1f5f9', animation:'pulse 1.5s infinite' }} />)}
            </div>
          ) : (
            <div className="hp-grid">
              {filtered.slice(0,4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* BANNER STRIP */}
      <div className="hp-banners">
        <Link to="/browse" className="hp-banner b1">
          <div className="hp-banner-emoji">🪑</div>
          <div>
            <div className="hp-banner-tag">Top Rentals</div>
            <div className="hp-banner-title">Study Room<br/>Essentials</div>
            <div className="hp-banner-sub">Desks, chairs from $3/day</div>
            <span className="hp-btn-outline">Browse →</span>
          </div>
        </Link>
        <Link to="/browse" className="hp-banner b2">
          <div className="hp-banner-emoji">📦</div>
          <div>
            <div className="hp-banner-tag">Sell Your Items</div>
            <div className="hp-banner-title">Post &<br/>Earn</div>
            <div className="hp-banner-sub">List items you no longer need</div>
            <span className="hp-btn-outline">Start Selling →</span>
          </div>
        </Link>
        <Link to="/browse" className="hp-banner b3">
          <div className="hp-banner-emoji">🏠</div>
          <div>
            <div className="hp-banner-tag">Student Housing</div>
            <div className="hp-banner-title">Find Your<br/>Next Room</div>
            <div className="hp-banner-sub">Rooms near campus</div>
            <span className="hp-btn-outline">Explore →</span>
          </div>
        </Link>
      </div>

      {/* RECENT LISTINGS */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Recent Listings</h2>
          <Link to="/browse" className="hp-see-all">See All →</Link>
        </div>
        {loading ? (
          <div className="hp-grid">
            {[1,2,3,4].map(i => <div key={i} style={{ height:240, borderRadius:12, background:'#f1f5f9', animation:'pulse 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--h-muted)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ fontWeight:600, marginBottom:8 }}>No listings yet</p>
            <Link to="/register" className="hp-btn" style={{ marginTop:16 }}>Post a Listing</Link>
          </div>
        ) : (
          <div className="hp-grid">
            {filtered.slice(0,8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* MEMBERSHIP CTA */}
      <section className="hp-membership">
        <div className="hp-mem-inner">
          <div style={{ zIndex:2 }}>
            <div className="hp-mem-eyebrow">✦ Student Marketplace</div>
            <h2 className="hp-mem-title">Ready to <em>Rent</em>,<br/>Buy or Sell?</h2>
            <p className="hp-mem-sub">Join 1,200+ students already using stuRENT. Post your items, find what you need, and save money.</p>
          </div>
          <div className="hp-mem-actions">
            <Link to="/register" className="hp-btn" style={{ fontSize:15, padding:'15px 36px' }}>Join for Free →</Link>
            <Link to="/browse" className="hp-btn-secondary">Browse Listings</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-grid">
            <div className="hp-footer-brand">
              <button className="hp-logo" style={{ fontSize:24 }} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>stu<em>RENT</em></button>
              <p>The student marketplace for renting, buying and selling — built by students, for students.</p>
              <div className="hp-socials">
                {['📘','🐦','📸','▶️'].map(e => <span key={e} className="hp-social-btn">{e}</span>)}
              </div>
            </div>
            {[
              { title:'Platform', links:[['Browse','browse'],['Post Listing','register'],['How it Works','browse']] },
              { title:'Account', links:[['Sign In','login'],['Register','register'],['My Orders','my-orders']] },
              { title:'Support', links:[['FAQ','browse'],['Contact','browse'],['Privacy Policy','browse']] },
              { title:'Admin', links:[['Admin Login','admin/login'],['Request Access','admin/register']] },
            ].map(col => (
              <div key={col.title} className="hp-footer-col">
                <h4>{col.title}</h4>
                {col.links.map(([label, to]) => <Link key={label} to={`/${to}`}>{label}</Link>)}
              </div>
            ))}
          </div>
          <div className="hp-footer-bottom">
            <span>© {new Date().getFullYear()} stuRENT. All rights reserved. Built with Django + React.</span>
            <div className="hp-pay-icons">
              {['VISA','MC','PAYPAL','STRIPE'].map(p => <span key={p} className="hp-pay">{p}</span>)}
            </div>
          </div>
        </div>
      </footer>

      <CartWishlistUI allProducts={products} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

function HeaderCartButtons() {
  const { cartCount, wish, setCartOpen, setWishOpen } = useCart()
  return (
    <>
      <button className="hp-icon-btn" title="Wishlist" onClick={()=>setWishOpen(true)}>
        ♡{wish.size > 0 && <span className="hp-badge">{wish.size}</span>}
      </button>
      <button className="hp-icon-btn" title="Cart" onClick={()=>setCartOpen(true)}>
        🛒{cartCount > 0 && <span className="hp-badge">{cartCount}</span>}
      </button>
    </>
  )
}

function ProductCard({ product: p }) {
  const { addToCart, toggleWish, wish } = useCart()
  const badgeType = p.listing_type === 'Both' ? 'both' : p.listing_type === 'Buy' ? 'buy' : 'rent'
  const badgeText = p.listing_type === 'Both' ? 'RENT & BUY' : p.listing_type === 'Buy' ? 'FOR SALE' : 'FOR RENT'
  const inWish = wish.has(p.id)
  return (
    <Link to={`/browse/${p.id}`} className="hp-card">
      <span className={`hp-card-badge hp-badge-${badgeType}`}>{badgeText}</span>
      <div className="hp-card-img">
        {p.image
          ? <img src={`${BASE_URL}${p.image}`} alt={p.name} />
          : <span>{p.category === 'Indoor' ? '🪑' : '🏕️'}</span>
        }
        <div className="hp-card-actions">
          <button className="hp-action-btn accent" onClick={e=>{e.preventDefault();addToCart(p)}}>🛒 Cart</button>
          <button className={`hp-action-btn ${inWish?'in-wish':''}`} onClick={e=>{e.preventDefault();toggleWish(p)}}>{inWish?'♥':'♡'}</button>
        </div>
      </div>
      <div className="hp-card-body">
        <div className="hp-card-cat">{p.category}</div>
        <div className="hp-card-name">{p.name}</div>
        <div className="hp-card-price">
          <span className="hp-price-now">${p.price}</span>
          <span className="hp-price-unit">/day</span>
          {p.buy_price && <span className="hp-price-buy">Buy: ${p.buy_price}</span>}
        </div>
      </div>
    </Link>
  )
}
