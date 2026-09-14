import { supabase } from './supabase'
import { FALLBACK_EVENTS } from './fallback'

export async function fetchEvents(category?: string, city?: string) {
  try {
    let query = supabase
      .from('event_with_stats')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (city && city !== 'all') {
      query = query.eq('city', city)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) return FALLBACK_EVENTS
    return data
  } catch {
    return FALLBACK_EVENTS
  }
}

export async function fetchEventById(id: string) {
  try {
    const { data, error } = await supabase
      .from('event_with_stats')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) {
      return FALLBACK_EVENTS.find(e => e.id === id) || null
    }
    return data
  } catch {
    return FALLBACK_EVENTS.find(e => e.id === id) || null
  }
}
