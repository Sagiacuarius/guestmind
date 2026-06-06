import { supabase } from './supabase'
import type { Guest } from '../domain/guest'

export async function lookupGuestByEmail(email: string, propertyId: string): Promise<Guest | null> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('property_id', propertyId)
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createGuest(guest: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest> {
  const { data, error } = await supabase
    .from('guests')
    .insert(guest)
    .select()
    .single()

  if (error) throw error
  return data
}
