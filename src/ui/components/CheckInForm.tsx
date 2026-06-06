import type { CheckInFormData } from '../../domain/check-in'
import { validateCheckInForm } from '../../domain/check-in'

interface Props {
  onSubmit: (data: CheckInFormData) => void
  initialData?: Partial<CheckInFormData>
}

export function CheckInForm({ onSubmit, initialData }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data: Partial<CheckInFormData> = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      country: form.get('country') as string || undefined,
      language: (form.get('language') as 'es' | 'en' | 'pt') || 'es',
      checkInDate: form.get('checkInDate') as string,
      roomNumber: form.get('roomNumber') as string || undefined,
      groupComposition: form.get('groupComposition') as string || undefined,
      travelReason: form.get('travelReason') as string || undefined,
    }

    const validation = validateCheckInForm(data)
    if (!validation.valid) return

    onSubmit(data as CheckInFormData)
  }

  return (
    <form onSubmit={handleSubmit} className="check-in-form">
      <h1>Check-in</h1>

      <label>
        Nombre *
        <input name="name" type="text" required defaultValue={initialData?.name} />
      </label>

      <label>
        Email *
        <input name="email" type="email" required defaultValue={initialData?.email} />
      </label>

      <label>
        País
        <input name="country" type="text" defaultValue={initialData?.country} />
      </label>

      <label>
        Idioma
        <select name="language" defaultValue={initialData?.language || 'es'}>
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
      </label>

      <label>
        Fecha de check-in *
        <input name="checkInDate" type="date" required defaultValue={initialData?.checkInDate} />
      </label>

      <label>
        N° Habitación
        <input name="roomNumber" type="text" defaultValue={initialData?.roomNumber} />
      </label>

      <label>
        Composición del grupo
        <select name="groupComposition" defaultValue={initialData?.groupComposition || ''}>
          <option value="">Seleccionar...</option>
          <option value="solo">Solo</option>
          <option value="couple">Pareja</option>
          <option value="family">Familia</option>
          <option value="group">Grupo</option>
        </select>
      </label>

      <label>
        Motivo de viaje
        <select name="travelReason" defaultValue={initialData?.travelReason || ''}>
          <option value="">Seleccionar...</option>
          <option value="leisure">Ocio / Vacaciones</option>
          <option value="honeymoon">Luna de miel</option>
          <option value="business">Negocios</option>
          <option value="adventure">Aventura</option>
          <option value="family">Visita familiar</option>
        </select>
      </label>

      <button type="submit">Registrar check-in</button>
    </form>
  )
}
