// Check-in form validation — pure functions, no side effects

export interface CheckInFormData {
  name: string
  email: string
  country?: string
  language?: 'es' | 'en' | 'pt'
  phone?: string
  checkInDate: string
  checkOutDate?: string
  roomNumber?: string
  groupComposition?: string
  travelReason?: string
  dietaryRestrictions?: string[]
  interests?: string[]
  allergies?: string[]
  whatsappConsent: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: Partial<Record<keyof CheckInFormData, string>>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCheckInForm(data: Partial<CheckInFormData>): ValidationResult {
  const errors: Partial<Record<keyof CheckInFormData, string>> = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'required'
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'required'
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'invalid'
  }

  if (!data.checkInDate) {
    errors.checkInDate = 'required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
