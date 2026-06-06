import { useState } from 'react'
import type { Stay } from '../../domain/guest'

interface Props {
  stay: Stay
}

export function GuestCard({ stay }: Props) {
  const [expanded, setExpanded] = useState(false)

  const profile = stay.enrichedProfile as Record<string, unknown> | undefined

  return (
    <div className={`guest-card ${expanded ? 'expanded' : ''}`}>
      <div className="guest-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="guest-card-name">
          {profile?.guest_name as string || 'Huésped'}
        </div>
        <div className="guest-card-meta">
          {stay.roomNumber && <span>Habitación {stay.roomNumber}</span>}
          {stay.travelReason && <span className="badge">{stay.travelReason}</span>}
          {profile?.country && <span>{profile.country as string}</span>}
        </div>
        <div className="guest-card-arrow">{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div className="guest-card-body">
          <div className="guest-card-section">
            <h4>Perfil</h4>
            <ul>
              <li>Idioma: {profile?.language as string || 'es'}</li>
              {profile?.dietary_restrictions && (
                <li>Dieta: {(profile.dietary_restrictions as string[]).join(', ')}</li>
              )}
              {profile?.interests && (
                <li>Intereses: {(profile.interests as string[]).join(', ')}</li>
              )}
              {profile?.previous_visits !== undefined && (
                <li>Visitas previas: {profile.previous_visits as number}</li>
              )}
            </ul>
          </div>

          {stay.itineraryContent && (
            <div className="guest-card-section">
              <h4>Itinerario</h4>
              <p>{stay.itineraryContent}</p>
            </div>
          )}

          {!stay.itineraryContent && (
            <div className="guest-card-section empty">
              <p>Itinerario pendiente de generación</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
