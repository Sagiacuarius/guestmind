// Domain types for GuestMind — pure TypeScript, no framework dependencies

export interface Guest {
  id: string
  propertyId: string
  email: string
  document?: string
  name: string
  country?: string
  language: 'es' | 'en' | 'pt'
  phone?: string
  whatsappConsent: boolean
  createdAt: string
}

export interface Lead {
  id: string
  propertyId: string
  name: string
  email: string
  phone?: string
  checkedIn: boolean
  createdAt: string
}

export interface Stay {
  id: string
  guestId: string
  propertyId: string
  checkInDate: string
  checkOutDate?: string
  roomNumber?: string
  groupComposition?: string
  travelReason?: string
  enrichedProfile?: Record<string, unknown>
  emailContent?: string
  emailSentAt?: string
  itineraryContent?: string
  itineraryGeneratedAt?: string
  createdAt: string
}

export interface Preference {
  dietaryRestrictions: string[]
  interests: string[]
  allergies: string[]
}

export interface GuestWithPreferences extends Guest {
  preferences?: Preference
}

export type LookupResult =
  | { type: 'guest'; guest: Guest }
  | { type: 'lead'; lead: Lead }
  | { type: 'new' }
