// Property and related domain types

export type ServiceType = 'spa' | 'restaurant' | 'sommelier'

export interface PropertyServices {
  spa: boolean
  restaurant: boolean
  sommelier: boolean
}

export interface Property {
  id: string
  name: string
  services: PropertyServices
  whatsappEnabled: boolean
  createdAt: string
}

export type Segment = 'honeymoon' | 'family' | 'business' | 'adventure'

export interface MemoryPack {
  id: string
  propertyId: string
  segment: Segment
  baselineRecommendations: Record<string, unknown>
  promptAdditions?: string
}
