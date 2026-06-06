import { useState } from 'react'
import { CheckInForm } from '../components/CheckInForm'
import { createGuest } from '../../data/guests'
import { createStay } from '../../data/stays'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { CheckInFormData } from '../../domain/check-in'

export function CheckInPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (data: CheckInFormData) => {
    try {
      const guest = await createGuest({
        propertyId: CURRENT_PROPERTY_ID,
        email: data.email,
        name: data.name,
        country: data.country,
        language: data.language || 'es',
        phone: data.phone,
        whatsappConsent: data.whatsappConsent || false,
      })

      await createStay({
        guestId: guest.id,
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

  if (submitted) {
    return (
      <div className="check-in-success">
        <h2>✓ Check-in registrado</h2>
        <p>El perfil del huésped se está enriqueciendo.</p>
        <button onClick={() => setSubmitted(false)}>Nuevo check-in</button>
      </div>
    )
  }

  return <CheckInForm onSubmit={handleSubmit} />
}
