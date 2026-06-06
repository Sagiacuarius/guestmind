import { supabase } from './supabase'
import type { Guest, Lead, LookupResult } from '../domain/guest'

export async function lookupByEmail(email: string, propertyId: string): Promise<LookupResult> {
  // 1. Buscar en guests (ya hicieron check-in al menos una vez)
  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .select('*')
    .eq('property_id', propertyId)
    .eq('email', email)
    .single()

  if (!guestError && guest) {
    return { type: 'guest', guest }
  }

  // 2. Buscar en leads (contactos que consultaron, nunca check-in)
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('property_id', propertyId)
    .eq('email', email)
    .eq('checked_in', false)
    .single()

  if (!leadError && lead) {
    return { type: 'lead', lead }
  }

  // 3. No encontrado en ninguna tabla
  return { type: 'new' }
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

export async function markLeadCheckedIn(leadId: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ checked_in: true })
    .eq('id', leadId)

  if (error) throw error
}
