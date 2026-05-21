/**
 * studentService.js — Student-facing API calls
 * Students browse products and manage their own orders.
 */

import api from './api'

const StudentService = {
  /** GET /api/v1/student/products/ — public product catalog */
  getProducts: (params = {}) => api.get('/student/products/', { params }),

  /** GET /api/v1/student/products/:id/ — product detail */
  getProduct: (id) => api.get(`/student/products/${id}/`),

  /** POST /api/v1/student/rent/ — place a rental order */
  rent: (data) => api.post('/student/rent/', data),

  /** GET /api/v1/student/my-orders/ — student's own orders */
  getMyOrders: () => api.get('/student/my-orders/'),
}

export default StudentService
