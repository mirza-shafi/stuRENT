/**
 * useApi.js — Generic data-fetching hook
 * Handles loading, error, and data state for any service call.
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * @param {Function} fetchFn   - The service function to call
 * @param {Array}    deps      - Dependencies array (like useEffect)
 * @param {boolean}  immediate - Whether to fetch on mount
 */
export function useApi(fetchFn, deps = [], immediate = true) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute()
  }, [execute]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, setData }
}
