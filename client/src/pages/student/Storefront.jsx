/**
 * Storefront.jsx — Student product browsing page (ShopNest-style)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Package, ArrowRight, ShoppingCart, Heart } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import StudentService from '../../services/studentService'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')
const CATS = ['All', 'Indoor', 'Outdoor']

export default function Storefront() {
  const { data, loading } = useApi(StudentService.getProducts)
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All')
  const [wish, setWish]       = useState(new Set())
  const [cartMsg, setCartMsg] = useState('')

  const all = data?.results ?? data ?? []
  const filtered = all.filter(p =>
    (cat === 'All' || p.category === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.description?.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleWish = (id) => setWish(w => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toast = (msg) => { setCartMsg(msg); setTimeout(() => setCartMsg(''), 2500) }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Toast */}
      {cartMsg && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'#1a1a2e', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:500, boxShadow:'0 8px 24px rgba(0,0,0,.2)', borderLeft:'3px solid #6366f1', zIndex:9999, animation:'slideIn .3s ease' }}>
          🛒 {cartMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:'#1a1a2e', padding:'32px 24px 24px', marginBottom:0 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <Link to="/" style={{ color:'rgba(255,255,255,.5)', fontSize:13, textDecoration:'none' }}>← Back to Home</Link>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'#fff', marginTop:6 }}>Browse Listings</h1>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:14, marginTop:4 }}>
                {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <Link to="/" style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none' }}>
              Post a Listing →
            </Link>
          </div>

          {/* Search + filters */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'0 14px', height:44 }}>
              <Search size={16} color="rgba(255,255,255,.4)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:14, fontFamily:'inherit' }}
              />
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <Filter size={14} color="rgba(255,255,255,.4)" />
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{ padding:'8px 16px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', background: cat===c ? '#6366f1' : 'rgba(255,255,255,.08)', color: cat===c ? '#fff' : 'rgba(255,255,255,.6)', transition:'all .2s', fontFamily:'inherit' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height:320, borderRadius:14, background:'#e2e8f0', animation:'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#64748b' }}>
            <Package size={56} style={{ margin:'0 auto 16px', opacity:.3 }} />
            <p style={{ fontSize:18, fontWeight:700, color:'#334155', marginBottom:8 }}>No items found</p>
            <p style={{ fontSize:14 }}>Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {filtered.map(p => (
              <BrowseCard key={p.id} product={p} inWish={wish.has(p.id)} onWish={toggleWish} onCart={toast} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideIn { from{transform:translateX(80px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>
    </div>
  )
}

function BrowseCard({ product: p, inWish, onWish, onCart }) {
  const isRent  = p.listing_type === 'Rent'  || p.listing_type === 'Both' || !p.listing_type
  const isBuy   = p.listing_type === 'Buy'   || p.listing_type === 'Both'
  const isBoth  = p.listing_type === 'Both'

  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', transition:'all .25s', cursor:'pointer', position:'relative' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor='transparent' }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#e2e8f0' }}>

      {/* Image area */}
      <div style={{ height:180, background: p.category==='Indoor' ? '#eef2ff' : '#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, position:'relative', overflow:'hidden' }}>
        {p.image
          ? <img src={`${BASE}${p.image}`} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span>{p.category === 'Indoor' ? '🪑' : '🏕️'}</span>
        }

        {/* Badges */}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:4 }}>
          {isBoth ? (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999, background:'rgba(245,158,11,.9)', color:'#fff' }}>RENT & BUY</span>
          ) : isRent ? (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999, background:'rgba(99,102,241,.9)', color:'#fff' }}>📅 FOR RENT</span>
          ) : (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:999, background:'rgba(16,185,129,.9)', color:'#fff' }}>🛒 FOR SALE</span>
          )}
        </div>

        {/* Availability dot */}
        <span style={{ position:'absolute', top:10, right:10, width:10, height:10, borderRadius:'50%', background: p.is_available ? '#10b981' : '#ef4444', border:'2px solid #fff', display:'block' }} title={p.is_available ? 'Available' : 'Unavailable'} />

        {/* Wishlist btn */}
        <button onClick={e => { e.preventDefault(); onWish(p.id) }}
          style={{ position:'absolute', bottom:10, right:10, width:32, height:32, borderRadius:'50%', background: inWish ? '#ef4444' : 'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'all .2s', boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>
          {inWish ? '♥' : '♡'}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>{p.category}</div>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.4 }}>{p.name}</h3>
        {p.description && (
          <p style={{ fontSize:12, color:'#64748b', marginBottom:10, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.5 }}>{p.description}</p>
        )}

        {/* Pricing */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          {isRent && (
            <div>
              <span style={{ fontSize:20, fontWeight:800, color:'#6366f1' }}>${p.price}</span>
              <span style={{ fontSize:11, color:'#94a3b8' }}>/day</span>
            </div>
          )}
          {isBuy && p.buy_price && (
            <div style={{ fontSize:13, fontWeight:700, color:'#10b981', background:'#ecfdf5', padding:'2px 10px', borderRadius:6 }}>
              Buy: ${p.buy_price}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:8 }}>
          <Link to={`/products/product-details/${p.id}`} style={{ flex:1, background:'#6366f1', color:'#fff', padding:'9px 0', borderRadius:8, fontSize:12, fontWeight:700, textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:4, transition:'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background='#6366f1'}>
            View Details <ArrowRight size={12} />
          </Link>
          <button onClick={() => onCart(`"${p.name.slice(0,20)}..." added!`)}
            style={{ width:38, height:38, borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#6366f1'; e.currentTarget.style.borderColor='#6366f1' }}
            onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0' }}>
            🛒
          </button>
        </div>
      </div>
    </div>
  )
}
