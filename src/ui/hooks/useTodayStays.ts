import { useState, useEffect } from 'react'
import { getTodayStays } from '../../data/stays'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { Stay } from '../../domain/guest'

export function useTodayStays() {
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        setLoading(true)
        const data = await getTodayStays(CURRENT_PROPERTY_ID)
        if (!cancelled) {
          setStays(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError('Error al cargar huéspedes del día')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { stays, loading, error }
}
