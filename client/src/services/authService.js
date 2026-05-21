/**
 * authService.js — Authentication API calls
 * Controller layer: bridges UI to the /api/v1/auth/ endpoints
 */

import api from './api'

const AuthService = {
  /**
   * Register a new user account.
   * @param {{ username, email, password, password_confirm }} data
   */
  register: (data) => api.post('/auth/register/', data),

  /**
   * Login and receive JWT tokens.
   * @param {{ username, password }} credentials
   * @returns {{ access, refresh }}
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials)
    const { access, refresh } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    return response
  },

  /**
   * Logout — blacklist refresh token and clear local storage.
   */
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await api.post('/auth/logout/', { refresh })
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  /**
   * Fetch the authenticated user's profile.
   */
  getMe: () => api.get('/auth/me/'),

  /** Check if user is currently authenticated (token exists). */
  isAuthenticated: () => Boolean(localStorage.getItem('access_token')),
}

export default AuthService
