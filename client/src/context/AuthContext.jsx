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
        } catch {
          // Token is stale — clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
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
  }, [])

  const logout = useCallback(async () => {
    await AuthService.logout()
    setUser(null)
  }, [])

  const register = useCallback(async (formData) => {
    return AuthService.register(formData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
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
