/**
 * customerService.js — Customer CRUD API calls
 */

import api from './api'

const CustomerService = {
  /** GET /api/v1/customers/ */
  getAll: (params = {}) => api.get('/customers/', { params }),

  /** GET /api/v1/customers/:id/ */
  getById: (id) => api.get(`/customers/${id}/`),

  /** GET /api/v1/customers/:id/orders/ */
  getOrders: (id) => api.get(`/customers/${id}/orders/`),

  /** POST /api/v1/customers/ */
  create: (data) => api.post('/customers/', data),

  /** PATCH /api/v1/customers/:id/ */
  update: (id, data) => api.patch(`/customers/${id}/`, data),

  /** DELETE /api/v1/customers/:id/ */
  delete: (id) => api.delete(`/customers/${id}/`),
}

export default CustomerService
