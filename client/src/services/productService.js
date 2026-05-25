/**
 * productService.js — Product CRUD API calls (supports image upload via FormData)
 */

import api from './api'

/** Convert a plain object to FormData (handles File objects correctly) */
function toFormData(data) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v)
  })
  return fd
}

const ProductService = {
  /** GET /api/v1/products/ */
  getAll: (params = {}) => api.get('/products/', { params }),

  /** GET /api/v1/products/:id/ */
  getById: (id) => api.get(`/products/${id}/`),

  /** POST /api/v1/products/ — multipart/form-data to support image */
  create: (data) => api.post('/products/', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /** PATCH /api/v1/products/:id/ — multipart/form-data */
  update: (id, data) => api.patch(`/products/${id}/`, toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /** DELETE /api/v1/products/:id/ */
  delete: (id) => api.delete(`/products/${id}/`),

  /** POST /api/v1/products/:id/approve/ — admin only */
  approve: (id) => api.post(`/products/${id}/approve/`),

  /** POST /api/v1/products/:id/reject/ — admin only */
  reject: (id) => api.post(`/products/${id}/reject/`),

  /** GET /api/v1/products/?approval_status=pending — admin pending list */
  getPending: () => api.get('/products/', { params: { approval_status: 'pending' } }),
}

export default ProductService
