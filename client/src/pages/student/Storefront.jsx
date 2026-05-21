/**
 * Storefront.jsx — Student product browsing page
 * Students browse available rental items, filter by category, and click to rent.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Package, Tag, ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import StudentService from '../../services/studentService'

const CATEGORIES = ['All', 'Indoor', 'Outdoor']

export default function Storefront() {
  const { data, loading } = useApi(StudentService.getProducts)

  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')

  const allProducts = data?.results ?? data ?? []

  const filtered = allProducts.filter((p) => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="page-title">Browse Rentals</h1>
        <p className="page-subtitle">Find the perfect item for your needs. All available for student rental.</p>
      </div>

      {/* Search + filter bar */}
      <div className="storefront-toolbar glass-card">
        <div className="storefront-search">
          <Search size={16} color="var(--clr-text-muted)" />
          <input
            type="search"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="storefront-search__input"
          />
        </div>

        <div className="storefront-filters">
          <Filter size={14} color="var(--clr-text-muted)" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? 'filter-chip--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-5)' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} available
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="product-card product-card--skeleton glass-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <Package size={48} className="empty-state__icon" />
          <p className="empty-state__title">No items found</p>
          <p className="text-muted text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <style>{`
        .storefront-toolbar {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }

        .storefront-search {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
          min-width: 200px;
        }

        .storefront-search__input {
          flex: 1;
          background: none;
          border: none;
          color: var(--clr-text);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
        }

        .storefront-filters {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: var(--space-1) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 600;
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          color: var(--clr-text-muted);
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .filter-chip:hover { border-color: var(--clr-primary); color: var(--clr-primary); }

        .filter-chip--active {
          background: var(--clr-primary-glow);
          border-color: rgba(108,99,255,0.4);
          color: var(--clr-primary);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
        }

        .product-card--skeleton {
          height: 320px;
          background: linear-gradient(
            90deg, var(--clr-surface) 25%,
            var(--clr-surface-hov) 50%,
            var(--clr-surface) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

function ProductCard({ product }) {
  const categoryColor = product.category === 'Indoor' ? 'var(--clr-primary)' : 'var(--clr-danger)'

  return (
    <div className="product-card glass-card slide-up">
      {/* Top color bar */}
      <div className="product-card__bar" style={{ background: categoryColor }} />

      {/* Icon placeholder */}
      <div className="product-card__icon" style={{ background: `${categoryColor}22` }}>
        <Package size={32} color={categoryColor} />
      </div>

      {/* Info */}
      <div className="product-card__body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <h3 className="product-card__name">{product.name}</h3>
          <span className="product-card__category" style={{ color: categoryColor, background: `${categoryColor}22` }}>
            {product.category}
          </span>
        </div>

        <p className="product-card__desc">
          {product.description || 'Quality rental item available for students.'}
        </p>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="product-card__tags">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="product-card__tag">
                <Tag size={10} /> {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="product-card__footer">
        <div>
          <span className="product-card__price">${product.price}</span>
          <span className="product-card__per"> / day</span>
        </div>
        <Link to={`/browse/${product.id}`} className="btn btn--primary btn--sm">
          View & Rent <ArrowRight size={13} />
        </Link>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card), var(--shadow-glow);
        }

        .product-card__bar {
          height: 3px;
          width: 100%;
        }

        .product-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          border-bottom: 1px solid var(--clr-border);
        }

        .product-card__body {
          padding: var(--space-5);
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .product-card__name {
          font-size: var(--font-size-base);
          font-weight: 700;
          line-height: 1.3;
        }

        .product-card__category {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          white-space: nowrap;
          flex-shrink: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .product-card__desc {
          font-size: var(--font-size-sm);
          color: var(--clr-text-muted);
          line-height: 1.6;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__tags {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .product-card__tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: var(--clr-text-dim);
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }

        .product-card__footer {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--clr-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .product-card__price {
          font-size: var(--font-size-xl);
          font-weight: 800;
          color: var(--clr-accent);
        }

        .product-card__per {
          font-size: var(--font-size-xs);
          color: var(--clr-text-muted);
        }
      `}</style>
    </div>
  )
}
