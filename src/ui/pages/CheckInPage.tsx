import { useState } from 'react'
import { GuestLookup } from '../components/GuestLookup'
import { CheckInForm } from '../components/CheckInForm'
import { createGuest } from '../../data/guests'
import { createStay } from '../../data/stays'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { Guest } from '../../domain/guest'
import type { CheckInFormData } from '../../domain/check-in'

export function CheckInPage() {
  const [foundGuest, setFoundGuest] = useState<Guest | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleGuestFound = (guest: Guest | null) => {
    setFoundGuest(guest)
  }

  const handleSubmit = async (data: CheckInFormData) => {
    try {
      let guestId: string

      if (foundGuest) {
        // Huésped recurrente: usar su ID existente
        guestId = foundGuest.id
      } else {
        // Huésped nuevo: crear en Supabase
        const guest = await createGuest({
          propertyId: CURRENT_PROPERTY_ID,
          email: data.email,
          name: data.name,
          country: data.country,
          language: data.language || 'es',
          phone: data.phone,
          whatsappConsent: data.whatsappConsent || false,
        })
        guestId = guest.id
      }

      await createStay({
        guestId,
        propertyId: CURRENT_PROPERTY_ID,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        roomNumber: data.roomNumber,
        groupComposition: data.groupComposition,
        travelReason: data.travelReason,
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  const handleNewCheckIn = () => {
    setSubmitted(false)
    setFoundGuest(null)
  }

  if (submitted) {
    return (
      <div className="check-in-success">
        <h2>✓ Check-in registrado</h2>
        <p>El perfil del huésped se está enriqueciendo.</p>
        <button onClick={handleNewCheckIn}>Nuevo check-in</button>
      </div>
    )
  }

  const initialData = foundGuest
    ? {
        name: foundGuest.name,
        email: foundGuest.email,
        country: foundGuest.country,
        language: foundGuest.language,
        phone: foundGuest.phone,
      }
    : undefined

  return (
    <div>
      <GuestLookup onGuestFound={handleGuestFound} />
      <CheckInForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  )
}
