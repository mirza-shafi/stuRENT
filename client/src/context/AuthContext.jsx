/**
 * AuthContext.jsx — Global authentication state (Model layer for auth)
 * Wraps the app and provides user + auth actions to all components.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AuthService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /** Fetch current user on mount if token exists */
  useEffect(() => {
    const init = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const { data } = await AuthService.getMe()
          setUser(data)
          // Sync localStorage with user.is_staff
          if (data.is_staff) {
            localStorage.setItem('is_admin', 'true')
          } else {
            localStorage.removeItem('is_admin')
          }
        } catch {
          // Token is stale — clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('is_admin')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (credentials) => {
    await AuthService.login(credentials)
    const { data } = await AuthService.getMe()
    setUser(data)
    // Sync admin status
    if (data.is_staff) {
      localStorage.setItem('is_admin', 'true')
    } else {
      localStorage.removeItem('is_admin')
    }
  }, [])

  const googleLogin = useCallback(async (idToken) => {
    await AuthService.googleLogin(idToken)
    const { data } = await AuthService.getMe()
    setUser(data)
    // Sync admin status
    if (data.is_staff) {
      localStorage.setItem('is_admin', 'true')
    } else {
      localStorage.removeItem('is_admin')
    }
  }, [])

  const adminLogin = useCallback(async (credentials) => {
    await AuthService.adminLogin(credentials)
    const { data } = await AuthService.getMe()
    setUser(data)
    // Sync admin status
    if (data.is_staff) {
      localStorage.setItem('is_admin', 'true')
    } else {
      localStorage.removeItem('is_admin')
    }
  }, [])

  const logout = useCallback(async () => {
    await AuthService.logout()
    setUser(null)
  }, [])

  const register = useCallback(async (formData) => {
    return AuthService.register(formData)
  }, [])

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalView, setAuthModalView] = useState('login')

  const openLoginModal = useCallback(() => {
    setAuthModalView('login')
    setShowAuthModal(true)
  }, [])

  const openRegisterModal = useCallback(() => {
    setAuthModalView('register')
    setShowAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, login, googleLogin, logout, register, adminLogin,
      showAuthModal, setShowAuthModal,
      authModalView, setAuthModalView,
      openLoginModal, openRegisterModal, closeAuthModal,
      isAdmin: user?.is_staff || false
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook: useAuth — access auth context from any component */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
