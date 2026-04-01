import { useState, useEffect } from 'react'

/**
 * Custom hook for making API calls with loading/error state management.
 * @param {Function} apiCall - The API function to call
 * @param {Array} deps - Dependency array for useEffect
 * @param {boolean} immediate - Whether to call immediately on mount
 */
export function useApi(apiCall, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, execute }
}

export default useApi
