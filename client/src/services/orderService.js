/**
 * orderService.js — Order CRUD API calls
 */

import api from './api'

const OrderService = {
  /** GET /api/v1/orders/ */
  getAll: (params = {}) => api.get('/orders/', { params }),

  /** GET /api/v1/orders/:id/ */
  getById: (id) => api.get(`/orders/${id}/`),

  /** POST /api/v1/orders/ */
  create: (data) => api.post('/orders/', data),

  /** PATCH /api/v1/orders/:id/ */
  update: (id, data) => api.patch(`/orders/${id}/`, data),

  /** DELETE /api/v1/orders/:id/ */
  delete: (id) => api.delete(`/orders/${id}/`),

  /** GET /api/v1/dashboard/ */
  getDashboardStats: () => api.get('/dashboard/'),
}

export default OrderService
