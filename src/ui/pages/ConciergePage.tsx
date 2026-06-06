import { useTodayStays } from '../hooks/useTodayStays'
import { GuestCard } from '../components/GuestCard'

export function ConciergePage() {
  const { stays, loading, error } = useTodayStays()
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return <div className="page-loading">Cargando huéspedes del día...</div>
  }

  if (error) {
    return <div className="page-error">{error}</div>
  }

  return (
    <div className="concierge-page">
      <h1>Huéspedes del día</h1>
      <p className="concierge-date">{today}</p>

      {stays.length === 0 ? (
        <div className="concierge-empty">
          <p>Sin huéspedes hoy</p>
        </div>
      ) : (
        <div className="guest-list">
          {stays.map((stay) => (
            <GuestCard key={stay.id} stay={stay} />
          ))}
        </div>
      )}
    </div>
  )
}
