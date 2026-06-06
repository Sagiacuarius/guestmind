import { useState } from 'react'
import { lookupByEmail } from '../../data/guests'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { LookupResult } from '../../domain/guest'

interface Props {
  onGuestFound: (result: LookupResult) => void
}

export function GuestLookup({ onGuestFound }: Props) {
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) return
    setSearching(true)
    setResult(null)

    try {
      const found = await lookupByEmail(email.trim(), CURRENT_PROPERTY_ID)
      setResult(found)
      onGuestFound(found)
    } catch (err) {
      console.error('Lookup failed:', err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="guest-lookup">
      <label>
        Email del huésped
        <div className="lookup-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="huésped@email.com"
            disabled={searching}
          />
          <button onClick={handleSearch} disabled={searching || !email.trim()}>
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </label>

      {result?.type === 'guest' && (
        <div className="lookup-result found">
          ✓ {result.guest.name} — {result.guest.country || 'País no especificado'} · {result.guest.language.toUpperCase()} · Ya alojado
        </div>
      )}

      {result?.type === 'lead' && (
        <div className="lookup-result lead">
          📋 {result.lead.name} — Ya nos contactó · Completá los datos para el check-in
        </div>
      )}

      {result?.type === 'new' && (
        <div className="lookup-result new">
          ✦ Huésped nuevo — completá el formulario para crear su perfil
        </div>
      )}
    </div>
  )
}
