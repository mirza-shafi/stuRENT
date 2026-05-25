/**
 * AllProducts.jsx — Phoenix-style products filter page
 * Route: /products
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import StudentService from '../services/studentService'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')

const CATEGORIES = ['All', 'Indoor', 'Outdoor', 'Housing']
const LISTING_TYPES = ['All', 'Rent', 'Buy', 'Both']
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc',  label: 'Name: A → Z' },
]

export default function AllProducts() {
  const { data, loading } = useApi(StudentService.getProducts)
  const all = data?.results ?? data ?? []

  // ── Filter state ──────────────────────────────
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('All')
  const [listingType, setListingType] = useState('All')
  const [maxPrice,    setMaxPrice]    = useState(500)
  const [sortBy,      setSortBy]      = useState('newest')
  const [available,   setAvailable]   = useState(false)
  const [view,        setView]        = useState('grid') // 'grid' | 'list'

  // ── Derived ───────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...all]
    if (search)
      arr = arr.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.description?.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All')
      arr = arr.filter(p => p.category === category)
    if (listingType !== 'All')
      arr = arr.filter(p => p.listing_type === listingType)
    if (available)
      arr = arr.filter(p => p.is_available)
    arr = arr.filter(p => Number(p.price) <= maxPrice)

    if (sortBy === 'price_asc')  arr.sort((a,b) => a.price - b.price)
    if (sortBy === 'price_desc') arr.sort((a,b) => b.price - a.price)
    if (sortBy === 'name_asc')   arr.sort((a,b) => a.name.localeCompare(b.name))
    return arr
  }, [all, search, category, listingType, available, maxPrice, sortBy])

  const resetFilters = () => {
    setSearch(''); setCategory('All'); setListingType('All')
    setMaxPrice(500); setAvailable(false); setSortBy('newest')
  }

  return (
    <div className="ap-page">
      {/* ── Top bar ── */}
      <div className="ap-topbar">
        <div className="ap-topbar-inner">
          <div className="ap-breadcrumb">
            <Link to="/" className="ap-bc-link">🏠 Home</Link>
            <span className="ap-bc-sep">/</span>
            <span className="ap-bc-current">All Products</span>
          </div>
          <div className="ap-topbar-right">
            <span className="ap-count">{loading ? '...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}</span>
            <select className="ap-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="ap-view-toggle">
              <button className={`ap-view-btn ${view==='grid'?'active':''}`} onClick={() => setView('grid')} title="Grid view">⊞</button>
              <button className={`ap-view-btn ${view==='list'?'active':''}`} onClick={() => setView('list')} title="List view">☰</button>
            </div>
          </div>
        </div>
      </div>

      <div className="ap-body">
        {/* ── SIDEBAR ── */}
        <aside className="ap-sidebar">
          <div className="ap-sidebar-header">
            <span className="ap-sidebar-title">🔍 Filters</span>
            <button className="ap-reset-btn" onClick={resetFilters}>Reset</button>
          </div>

          {/* Search */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">Search</label>
            <div className="ap-search-wrap">
              <span className="ap-search-icon">🔍</span>
              <input
                className="ap-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
              />
              {search && <button className="ap-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
          </div>

          {/* Category */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">Category</label>
            {CATEGORIES.map(c => (
              <label key={c} className="ap-checkbox-row">
                <input
                  type="radio"
                  name="category"
                  checked={category === c}
                  onChange={() => setCategory(c)}
                  className="ap-radio"
                />
                <span className="ap-checkbox-label">
                  {c === 'All' ? '🗂 All Categories' : c === 'Indoor' ? '🪑 Indoor' : c === 'Outdoor' ? '🏕️ Outdoor' : '🏠 Housing'}
                </span>
                <span className="ap-filter-count">
                  {c === 'All' ? all.length : all.filter(p => p.category === c).length}
                </span>
              </label>
            ))}
          </div>

          {/* Listing Type */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">Listing Type</label>
            {LISTING_TYPES.map(t => (
              <label key={t} className="ap-checkbox-row">
                <input
                  type="radio"
                  name="listingType"
                  checked={listingType === t}
                  onChange={() => setListingType(t)}
                  className="ap-radio"
                />
                <span className="ap-checkbox-label">
                  {t === 'All' ? '📋 All Types' :
                   t === 'Rent' ? '📅 For Rent' :
                   t === 'Buy'  ? '🛒 For Sale' : '🔄 Rent & Buy'}
                </span>
                <span className="ap-filter-count">
                  {t === 'All' ? all.length : all.filter(p => p.listing_type === t).length}
                </span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">
              Max Price/day: <strong style={{ color:'#6366f1' }}>${maxPrice}</strong>
            </label>
            <input
              type="range"
              min={0}
              max={500}
              step={5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="ap-range"
            />
            <div className="ap-range-labels">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          {/* Availability */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">Availability</label>
            <label className="ap-toggle-row">
              <span className="ap-checkbox-label">Available Only</span>
              <div
                className={`ap-toggle ${available ? 'on' : ''}`}
                onClick={() => setAvailable(v => !v)}
              >
                <div className="ap-toggle-thumb" />
              </div>
            </label>
          </div>

          {/* Category Quick Stats */}
          <div className="ap-filter-group">
            <label className="ap-filter-label">Quick Stats</label>
            <div className="ap-stat-pills">
              <div className="ap-stat-pill">
                <span>🪑 Indoor</span>
                <strong>{all.filter(p=>p.category==='Indoor').length}</strong>
              </div>
              <div className="ap-stat-pill">
                <span>🏕️ Outdoor</span>
                <strong>{all.filter(p=>p.category==='Outdoor').length}</strong>
              </div>
              <div className="ap-stat-pill">
                <span>🏠 Housing</span>
                <strong>{all.filter(p=>p.category==='Housing').length}</strong>
              </div>
              <div className="ap-stat-pill">
                <span>✅ Available</span>
                <strong>{all.filter(p=>p.is_available).length}</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <main className="ap-main">
          {loading ? (
            <div className={view === 'grid' ? 'ap-grid' : 'ap-list'}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="ap-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">📭</div>
              <h3 className="ap-empty-title">No products found</h3>
              <p className="ap-empty-sub">Try adjusting your filters or search query</p>
              <button className="ap-empty-reset" onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : view === 'grid' ? (
            <div className="ap-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="ap-list">
              {filtered.map(p => <ProductRow key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── Page layout ── */
        .ap-page { min-height:100vh; background:#f8f7f4; font-family:'DM Sans',sans-serif; color:#1a1a2e; }

        /* ── Top bar ── */
        .ap-topbar { background:#fff; border-bottom:1px solid #e8e6e1; position:sticky; top:0; z-index:50; }
        .ap-topbar-inner { max-width:1400px; margin:0 auto; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ap-breadcrumb { display:flex; align-items:center; gap:8px; font-size:13px; }
        .ap-bc-link { color:#6366f1; text-decoration:none; font-weight:500; }
        .ap-bc-link:hover { text-decoration:underline; }
        .ap-bc-sep { color:#94a3b8; }
        .ap-bc-current { color:#1a1a2e; font-weight:600; }
        .ap-topbar-right { display:flex; align-items:center; gap:12px; }
        .ap-count { font-size:13px; color:#64748b; white-space:nowrap; }
        .ap-sort-select { border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:13px; background:#fff; color:#1a1a2e; font-family:inherit; cursor:pointer; outline:none; }
        .ap-sort-select:focus { border-color:#6366f1; }
        .ap-view-toggle { display:flex; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
        .ap-view-btn { padding:6px 10px; font-size:15px; background:#fff; border:none; cursor:pointer; color:#94a3b8; transition:all .2s; }
        .ap-view-btn.active { background:#6366f1; color:#fff; }

        /* ── Body ── */
        .ap-body { max-width:1400px; margin:0 auto; padding:24px; display:flex; gap:24px; align-items:flex-start; }

        /* ── Sidebar ── */
        .ap-sidebar { width:256px; flex-shrink:0; background:#fff; border-radius:14px; border:1px solid #e8e6e1; padding:20px; position:sticky; top:57px; max-height:calc(100vh - 80px); overflow-y:auto; }
        .ap-sidebar::-webkit-scrollbar { width:3px; }
        .ap-sidebar::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
        .ap-sidebar-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid #f1f5f9; }
        .ap-sidebar-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#1a1a2e; }
        .ap-reset-btn { font-size:12px; color:#6366f1; background:none; border:none; cursor:pointer; font-weight:600; font-family:inherit; padding:4px 8px; border-radius:6px; transition:background .2s; }
        .ap-reset-btn:hover { background:#eef2ff; }

        .ap-filter-group { margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #f1f5f9; }
        .ap-filter-group:last-child { border-bottom:none; margin-bottom:0; }
        .ap-filter-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; margin-bottom:10px; }

        .ap-search-wrap { position:relative; display:flex; align-items:center; }
        .ap-search-icon { position:absolute; left:10px; font-size:12px; color:#94a3b8; }
        .ap-search-input { width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:8px 32px 8px 30px; font-size:13px; background:#f8f7f4; color:#1a1a2e; font-family:inherit; outline:none; transition:border-color .2s; }
        .ap-search-input:focus { border-color:#6366f1; background:#fff; }
        .ap-search-clear { position:absolute; right:8px; background:none; border:none; cursor:pointer; color:#94a3b8; font-size:12px; }

        .ap-checkbox-row { display:flex; align-items:center; gap:8px; padding:5px 0; cursor:pointer; }
        .ap-radio { width:14px; height:14px; accent-color:#6366f1; cursor:pointer; flex-shrink:0; }
        .ap-checkbox-label { flex:1; font-size:13px; color:#374151; }
        .ap-filter-count { font-size:11px; background:#f1f5f9; color:#64748b; border-radius:99px; padding:1px 7px; font-weight:600; }

        .ap-range { width:100%; accent-color:#6366f1; cursor:pointer; margin:8px 0 4px; }
        .ap-range-labels { display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; }

        .ap-toggle-row { display:flex; align-items:center; justify-content:space-between; }
        .ap-toggle { width:38px; height:22px; border-radius:99px; background:#e2e8f0; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; }
        .ap-toggle.on { background:#6366f1; }
        .ap-toggle-thumb { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .ap-toggle.on .ap-toggle-thumb { left:19px; }

        .ap-stat-pills { display:flex; flex-direction:column; gap:6px; }
        .ap-stat-pill { display:flex; align-items:center; justify-content:space-between; background:#f8f7f4; border-radius:8px; padding:8px 12px; font-size:12px; color:#64748b; }
        .ap-stat-pill strong { color:#1a1a2e; font-weight:700; }

        /* ── Main ── */
        .ap-main { flex:1; min-width:0; }

        /* ── Grid ── */
        .ap-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:18px; }
        .ap-skeleton { height:300px; border-radius:14px; background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:400% 100%; animation:shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }

        /* ── Product Card ── */
        .ap-card { background:#fff; border-radius:14px; border:1px solid #e8e6e1; overflow:hidden; transition:all .25s; position:relative; text-decoration:none; color:inherit; display:block; }
        .ap-card:hover { box-shadow:0 10px 32px rgba(0,0,0,.1); transform:translateY(-4px); border-color:transparent; }
        .ap-card:hover .ap-card-overlay { opacity:1; }
        .ap-card-img { aspect-ratio:1; background:#f5f4f0; display:flex; align-items:center; justify-content:center; font-size:60px; position:relative; overflow:hidden; }
        .ap-card-img img { width:100%; height:100%; object-fit:cover; }
        .ap-card-badge { position:absolute; top:10px; left:10px; font-size:10px; font-weight:700; padding:3px 9px; border-radius:999px; text-transform:uppercase; letter-spacing:.05em; z-index:2; }
        .badge-rent { background:rgba(99,102,241,.9); color:#fff; }
        .badge-buy  { background:rgba(16,185,129,.9); color:#fff; }
        .badge-both { background:rgba(245,158,11,.9); color:#fff; }
        .ap-avail-dot { position:absolute; top:10px; right:10px; width:10px; height:10px; border-radius:50%; border:2px solid #fff; z-index:2; }
        .ap-card-overlay { position:absolute; inset:0; background:rgba(26,26,46,.35); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
        .ap-quick-view { background:#fff; color:#1a1a2e; font-size:12px; font-weight:700; padding:8px 18px; border-radius:20px; border:none; cursor:pointer; font-family:inherit; }
        .ap-card-body { padding:14px; }
        .ap-card-cat { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#94a3b8; margin-bottom:4px; }
        .ap-card-name { font-size:14px; font-weight:600; color:#1a1a2e; margin-bottom:8px; line-height:1.4; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
        .ap-card-price { display:flex; align-items:baseline; gap:6px; margin-bottom:12px; flex-wrap:wrap; }
        .ap-price-main { font-size:18px; font-weight:800; color:#6366f1; }
        .ap-price-unit { font-size:11px; color:#94a3b8; }
        .ap-price-buy { font-size:12px; color:#10b981; font-weight:700; background:#ecfdf5; padding:2px 8px; border-radius:6px; }
        .ap-card-btn { display:block; width:100%; background:#6366f1; color:#fff; border:none; border-radius:8px; padding:9px; font-size:12px; font-weight:700; text-align:center; cursor:pointer; font-family:inherit; transition:background .2s; text-decoration:none; }
        .ap-card-btn:hover { background:#4f46e5; }

        /* ── List view ── */
        .ap-list { display:flex; flex-direction:column; gap:12px; }
        .ap-row { background:#fff; border-radius:12px; border:1px solid #e8e6e1; padding:16px; display:flex; gap:16px; align-items:center; transition:all .2s; text-decoration:none; color:inherit; }
        .ap-row:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); border-color:#6366f1; }
        .ap-row-img { width:80px; height:80px; border-radius:10px; background:#f5f4f0; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:36px; overflow:hidden; }
        .ap-row-img img { width:100%; height:100%; object-fit:cover; }
        .ap-row-info { flex:1; min-width:0; }
        .ap-row-name { font-size:15px; font-weight:600; color:#1a1a2e; margin-bottom:4px; }
        .ap-row-cat  { font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
        .ap-row-desc { font-size:12px; color:#64748b; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-height:1.5; }
        .ap-row-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; flex-shrink:0; }
        .ap-row-price { font-size:20px; font-weight:800; color:#6366f1; }
        .ap-row-price-unit { font-size:11px; color:#94a3b8; font-weight:400; }
        .ap-row-btn { background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .2s; text-decoration:none; display:inline-block; }
        .ap-row-btn:hover { background:#4f46e5; }

        /* ── Empty ── */
        .ap-empty { text-align:center; padding:80px 24px; }
        .ap-empty-icon { font-size:64px; margin-bottom:16px; }
        .ap-empty-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:#1a1a2e; margin-bottom:8px; }
        .ap-empty-sub { font-size:14px; color:#64748b; margin-bottom:24px; }
        .ap-empty-reset { background:#6366f1; color:#fff; border:none; border-radius:8px; padding:10px 24px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }

        /* ── Responsive ── */
        @media (max-width:900px) {
          .ap-body { flex-direction:column; padding:16px; }
          .ap-sidebar { width:100%; position:static; max-height:none; }
          .ap-grid { grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
        }
        @media (max-width:480px) {
          .ap-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>
    </div>
  )
}

/* ── Grid Card ── */
function ProductCard({ product: p }) {
  const isRent = p.listing_type === 'Rent' || p.listing_type === 'Both' || !p.listing_type
  const isBuy  = p.listing_type === 'Buy'  || p.listing_type === 'Both'
  const isBoth = p.listing_type === 'Both'
  const badgeClass = isBoth ? 'badge-both' : isBuy ? 'badge-buy' : 'badge-rent'
  const badgeText  = isBoth ? 'RENT & BUY' : isBuy ? 'FOR SALE' : 'FOR RENT'

  return (
    <Link to={`/products/product-details/${p.id}`} className="ap-card">
      <div className="ap-card-img">
        {p.image
          ? <img src={`${p.image?.startsWith('http') ? p.image : `${BASE_URL}${p.image}`}`} alt={p.name} />
          : <span>{p.category === 'Indoor' ? '🪑' : p.category === 'Housing' ? '🏠' : '🏕️'}</span>
        }
        <span className={`ap-card-badge ${badgeClass}`}>{badgeText}</span>
        <span className="ap-avail-dot" style={{ background: p.is_available ? '#10b981' : '#ef4444' }} />
        <div className="ap-card-overlay">
          <span className="ap-quick-view">Quick View</span>
        </div>
      </div>
      <div className="ap-card-body">
        <div className="ap-card-cat">{p.category}</div>
        <div className="ap-card-name">{p.name}</div>
        <div className="ap-card-price">
          {isRent && <><span className="ap-price-main">${p.price}</span><span className="ap-price-unit">/day</span></>}
          {isBuy && p.buy_price && <span className="ap-price-buy">Buy: ${p.buy_price}</span>}
        </div>
        <span className="ap-card-btn">View Details →</span>
      </div>
    </Link>
  )
}

/* ── List Row ── */
function ProductRow({ product: p }) {
  const isRent = p.listing_type === 'Rent' || p.listing_type === 'Both' || !p.listing_type
  const isBuy  = p.listing_type === 'Buy'  || p.listing_type === 'Both'
  return (
    <Link to={`/products/product-details/${p.id}`} className="ap-row">
      <div className="ap-row-img">
        {p.image
          ? <img src={`${p.image?.startsWith('http') ? p.image : `${BASE_URL}${p.image}`}`} alt={p.name} />
          : <span>{p.category === 'Indoor' ? '🪑' : p.category === 'Housing' ? '🏠' : '🏕️'}</span>
        }
      </div>
      <div className="ap-row-info">
        <div className="ap-row-cat">{p.category}</div>
        <div className="ap-row-name">{p.name}</div>
        {p.description && <div className="ap-row-desc">{p.description}</div>}
      </div>
      <div className="ap-row-right">
        <div>
          {isRent && <div className="ap-row-price">${p.price}<span className="ap-row-price-unit">/day</span></div>}
          {isBuy && p.buy_price && <div style={{ fontSize:12, color:'#10b981', fontWeight:700 }}>Buy: ${p.buy_price}</div>}
        </div>
        <span className="ap-row-btn">Details →</span>
      </div>
    </Link>
  )
}
