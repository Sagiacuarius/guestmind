import { useState } from 'react'
import { lookupGuestByEmail } from '../../data/guests'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { Guest } from '../../domain/guest'

interface Props {
  onGuestFound: (guest: Guest | null) => void
}

export function GuestLookup({ onGuestFound }: Props) {
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<'found' | 'new' | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) return
    setSearching(true)
    setResult(null)

    try {
      const found = await lookupGuestByEmail(email.trim(), CURRENT_PROPERTY_ID)
      if (found) {
        setGuest(found)
        setResult('found')
        onGuestFound(found)
      } else {
        setGuest(null)
        setResult('new')
        onGuestFound(null)
      }
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

      {result === 'found' && guest && (
        <div className="lookup-result found">
          ✓ {guest.name} — {guest.country || 'País no especificado'} · {guest.language.toUpperCase()}
        </div>
      )}

      {result === 'new' && (
        <div className="lookup-result new">
          ✦ Huésped nuevo — completá el formulario para crear su perfil
        </div>
      )}
    </div>
  )
}
