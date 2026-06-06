import { supabase } from './supabase'
import type { Stay } from '../domain/guest'

export async function createStay(stay: Omit<Stay, 'id' | 'createdAt'>): Promise<Stay> {
  const { data, error } = await supabase
    .from('stays')
    .insert(stay)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTodayStays(propertyId: string): Promise<Stay[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('stays')
    .select('*, guests(*)')
    .eq('property_id', propertyId)
    .eq('check_in_date', today)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
