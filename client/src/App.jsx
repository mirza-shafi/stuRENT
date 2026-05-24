import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Layout        from './components/layout/Layout'
import StudentLayout from './components/layout/StudentLayout'

import Home           from './pages/Home'
import AllProducts    from './pages/AllProducts'
import Storefront     from './pages/student/Storefront'
import ProductDetail  from './pages/student/ProductDetail'
import MyOrders       from './pages/student/MyOrders'
import Profile        from './pages/student/Profile'
import Chat           from './pages/student/Chat'

import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import AdminLogin     from './pages/auth/AdminLogin'
import AdminRegister  from './pages/auth/AdminRegister'

import Dashboard      from './pages/Dashboard'
import CustomerList   from './pages/customers/CustomerList'
import CustomerDetail from './pages/customers/CustomerDetail'
import ProductList    from './pages/products/ProductList'
import OrderList      from './pages/orders/OrderList'
import AdminSettings  from './pages/admin/AdminSettings'

function StudentRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  return user ? <StudentLayout>{children}</StudentLayout> : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  // Redirect to admin login (not student login) when unauthenticated
  return user ? <Layout>{children}</Layout> : <Navigate to="/admin/login" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/browse" replace /> : children
}

function PublicRoute({ children }) {
  return <StudentLayout>{children}</StudentLayout>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"           element={<Home />} />
            <Route path="/products"   element={<AllProducts />} />
            <Route path="/browse"     element={<PublicRoute><Storefront /></PublicRoute>} />
            <Route path="/browse/:id" element={<PublicRoute><ProductDetail /></PublicRoute>} />

            {/* Student protected */}
            <Route path="/my-orders" element={<StudentRoute><MyOrders /></StudentRoute>} />
            <Route path="/profile"   element={<StudentRoute><Profile /></StudentRoute>} />
            <Route path="/messages"  element={<StudentRoute><Chat /></StudentRoute>} />

            {/* Student auth — redirect to /browse if already logged in */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Admin auth — ALWAYS accessible (student may need to switch to admin) */}
            <Route path="/admin/login"    element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Admin panel */}
            <Route path="/dashboard"      element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/customers"      element={<AdminRoute><CustomerList /></AdminRoute>} />
            <Route path="/customers/:id"  element={<AdminRoute><CustomerDetail /></AdminRoute>} />
            <Route path="/admin/products"  element={<AdminRoute><ProductList /></AdminRoute>} />
            <Route path="/admin/orders"    element={<AdminRoute><OrderList /></AdminRoute>} />
            <Route path="/admin/settings"  element={<AdminRoute><AdminSettings /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'var(--font)', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#0f1117' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0f1117' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
