import { useState } from 'react'
import { GuestLookup } from '../components/GuestLookup'
import { CheckInForm } from '../components/CheckInForm'
import { createGuest, markLeadCheckedIn } from '../../data/guests'
import { createStay } from '../../data/stays'
import { CURRENT_PROPERTY_ID } from '../../config/constants'
import type { LookupResult } from '../../domain/guest'
import type { CheckInFormData } from '../../domain/check-in'

export function CheckInPage() {
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleGuestFound = (result: LookupResult) => {
    setLookupResult(result)
  }

  const handleSubmit = async (data: CheckInFormData) => {
    try {
      let guestId: string

      if (lookupResult?.type === 'guest') {
        // Huésped recurrente: usar su ID existente
        guestId = lookupResult.guest.id
      } else if (lookupResult?.type === 'lead') {
        // Lead que se aloja por primera vez: crear guest y marcar lead como checked_in
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
        await markLeadCheckedIn(lookupResult.lead.id)
      } else {
        // Huésped completamente nuevo
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
    setLookupResult(null)
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

  let initialData: Partial<CheckInFormData> | undefined

  if (lookupResult?.type === 'guest') {
    initialData = {
      name: lookupResult.guest.name,
      email: lookupResult.guest.email,
      country: lookupResult.guest.country,
      language: lookupResult.guest.language,
      phone: lookupResult.guest.phone,
    }
  } else if (lookupResult?.type === 'lead') {
    initialData = {
      name: lookupResult.lead.name,
      email: lookupResult.lead.email,
      phone: lookupResult.lead.phone,
    }
  }

  return (
    <div>
      <GuestLookup onGuestFound={handleGuestFound} />
      <CheckInForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  )
}
