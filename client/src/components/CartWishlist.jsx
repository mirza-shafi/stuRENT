import { useState, useCallback, createContext, useContext } from 'react'
import { Link } from 'react-router-dom'
import { default as hotToast } from 'react-hot-toast'
import StudentService from '../services/studentService'
import { useAuth } from '../context/AuthContext'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')
const Ctx = createContext()
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({})
  const [wish, setWish] = useState(new Set())
  const [cartOpen, setCartOpen] = useState(false)
  const [wishOpen, setWishOpen] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [toasts, setToasts] = useState([])
  const { user, openLoginModal } = useAuth()

  const toast = useCallback((icon, msg) => {
    const id = Date.now()
    setToasts(t => [...t, { id, icon, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const addToCart = useCallback((p, qty = 1) => {
    setCart(c => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + qty } }))
    toast('🛒', `"${p.name.slice(0,25)}..." added!`)
  }, [toast])

  const removeFromCart = useCallback((id) => setCart(c => { const n = {...c}; delete n[id]; return n }), [])
  const changeQty = useCallback((id, d) => setCart(c => {
    const n = {...c}; if (!n[id]) return n
    n[id] = { ...n[id], qty: n[id].qty + d }
    if (n[id].qty <= 0) delete n[id]
    return n
  }), [])

  const toggleWish = useCallback((p) => {
    setWish(w => { const n = new Set(w); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n })
    toast(wish.has(p.id) ? '💔' : '♥', wish.has(p.id) ? 'Removed from wishlist' : `"${p.name.slice(0,25)}..." saved!`)
  }, [wish, toast])

  const cartCount = Object.values(cart).reduce((a, c) => a + c.qty, 0)
  const cartTotal = Object.values(cart).reduce((a, c) => a + c.product.price * c.qty, 0)

  const checkout = useCallback(() => {
    if (!user) {
      hotToast.error('Please sign in to proceed to checkout')
      openLoginModal()
      setCartOpen(false)
      return
    }
    if (!cartCount) { toast('⚠️', 'Cart is empty!'); return }
    setCartOpen(false)
    setCheckoutModal(true)
  }, [user, cartCount, toast, openLoginModal])

  const confirmCheckout = useCallback(async (note = '') => {
    const noteStr = typeof note === 'string' ? note : ''
    const toastId = hotToast.loading('Processing escrow payment...')
    try {
      const items = Object.values(cart)
      if (items.length === 0) {
        hotToast.dismiss(toastId)
        hotToast.error('Your cart is empty')
        return false
      }
      for (const item of items) {
        for (let i = 0; i < item.qty; i++) {
          await StudentService.rent({
            product_id: item.product.id,
            note: noteStr
          })
        }
      }
      setCart({})
      setCheckoutModal(false)
      hotToast.dismiss(toastId)
      hotToast.success('Order placed successfully!', { icon: '🎉' })
      return true
    } catch (err) {
      hotToast.dismiss(toastId)
      hotToast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
      console.error(err)
      return false
    }
  }, [cart])

  const val = { cart, wish, cartCount, cartTotal, addToCart, removeFromCart, changeQty, toggleWish, cartOpen, setCartOpen, wishOpen, setWishOpen, checkout, checkoutModal, setCheckoutModal, confirmCheckout, toasts }

  return <Ctx.Provider value={val}>{children}</Ctx.Provider>
}

export function CartWishlistUI({ allProducts }) {
  const { cart, wish, cartCount, cartTotal, removeFromCart, changeQty, addToCart, toggleWish, cartOpen, setCartOpen, wishOpen, setWishOpen, checkout, checkoutModal, setCheckoutModal, confirmCheckout, toasts } = useCart()

  return (
    <>
      {/* Toasts */}
      <div className="hp-toast-container">
        {toasts.map(t => <div key={t.id} className="hp-toast show"><span>{t.icon}</span><span>{t.msg}</span></div>)}
      </div>

      {/* Cart overlay */}
      <div className={`hp-overlay ${cartOpen?'open':''}`} onClick={()=>setCartOpen(false)} />
      {/* Cart drawer */}
      <div className={`hp-drawer ${cartOpen?'open':''}`}>
        <div className="hp-drawer-header cart-h">
          <h3>🛒 Cart ({cartCount})</h3>
          <button className="hp-drawer-close" onClick={()=>setCartOpen(false)}>✕</button>
        </div>
        <div className="hp-drawer-body">
          {!cartCount ? (
            <div className="hp-drawer-empty"><span style={{fontSize:60}}>🛒</span><p>Your cart is empty</p></div>
          ) : Object.values(cart).map(({product:p, qty}) => (
            <div key={p.id} className="hp-drawer-item">
              <div className="hp-di-img">{p.image ? <img src={`${BASE}${p.image}`} alt="" /> : p.category==='Indoor'?'🪑':'🏕️'}</div>
              <div className="hp-di-info">
                <div className="hp-di-name">{p.name}</div>
                <div className="hp-di-price">${(p.price*qty).toFixed(2)}</div>
                <div className="hp-di-qty">
                  <button className="hp-qty-btn" onClick={()=>changeQty(p.id,-1)}>−</button>
                  <span style={{fontSize:13,fontWeight:600,minWidth:20,textAlign:'center'}}>{qty}</span>
                  <button className="hp-qty-btn" onClick={()=>changeQty(p.id,1)}>+</button>
                </div>
              </div>
              <button className="hp-di-remove" onClick={()=>removeFromCart(p.id)}>🗑</button>
            </div>
          ))}
        </div>
        <div className="hp-drawer-footer">
          <div className="hp-drawer-total"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
          <button className="hp-checkout-btn" onClick={checkout}>Proceed to Checkout →</button>
          <button className="hp-continue-btn" onClick={()=>setCartOpen(false)}>Continue Shopping</button>
        </div>
      </div>

      {/* Wishlist overlay */}
      <div className={`hp-overlay ${wishOpen?'open':''}`} onClick={()=>setWishOpen(false)} />
      {/* Wishlist drawer */}
      <div className={`hp-drawer ${wishOpen?'open':''}`}>
        <div className="hp-drawer-header wish-h">
          <h3>♡ Wishlist ({wish.size})</h3>
          <button className="hp-drawer-close" onClick={()=>setWishOpen(false)}>✕</button>
        </div>
        <div className="hp-drawer-body">
          {!wish.size ? (
            <div className="hp-drawer-empty"><span style={{fontSize:60}}>♡</span><p>Your wishlist is empty</p></div>
          ) : [...wish].map(id => {
            const p = allProducts.find(x=>x.id===id)
            if (!p) return null
            return (
              <div key={id} className="hp-drawer-item">
                <div className="hp-di-img">{p.image ? <img src={`${BASE}${p.image}`} alt="" /> : p.category==='Indoor'?'🪑':'🏕️'}</div>
                <div className="hp-di-info">
                  <div className="hp-di-name">{p.name}</div>
                  <div className="hp-di-price">${p.price}/day</div>
                  <button onClick={()=>{addToCart(p)}} style={{marginTop:6,background:'#1a1a2e',color:'#fff',border:'none',borderRadius:6,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer'}}>🛒 Add to Cart</button>
                </div>
                <button className="hp-di-remove" onClick={()=>toggleWish(p)}>🗑</button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Checkout modal */}
      <div className={`hp-modal-overlay ${checkoutModal?'open':''}`} onClick={()=>setCheckoutModal(false)}>
        <div className="hp-modal" onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:56,marginBottom:16}}>💳</div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:700,marginBottom:10}}>Secure Checkout</h2>
          <p style={{fontSize:14,color:'#6b6b7b',marginBottom:20}}>Total: <strong style={{fontSize:22,color:'#6366f1'}}>${cartTotal.toFixed(2)}</strong></p>
          <input placeholder="Card Number" style={{width:'100%',border:'1.5px solid #e8e6e1',borderRadius:8,padding:'12px 16px',fontSize:14,outline:'none',marginBottom:8}} defaultValue="4242 4242 4242 4242" />
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input placeholder="MM/YY" defaultValue="12/28" style={{flex:1,border:'1.5px solid #e8e6e1',borderRadius:8,padding:'12px 16px',fontSize:14,outline:'none'}} />
            <input placeholder="CVC" defaultValue="123" style={{flex:1,border:'1.5px solid #e8e6e1',borderRadius:8,padding:'12px 16px',fontSize:14,outline:'none'}} />
          </div>
          <button onClick={confirmCheckout} style={{width:'100%',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,padding:14,fontSize:15,fontWeight:600,cursor:'pointer',marginBottom:8}}>Pay ${cartTotal.toFixed(2)} →</button>
          <button onClick={()=>setCheckoutModal(false)} style={{background:'none',border:'none',color:'#6b6b7b',fontSize:13,cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </>
  )
}
