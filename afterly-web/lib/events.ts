import { supabase } from './supabase';
import { FALLBACK_EVENTS, type FallbackEvent } from './fallback';

export type EventCardData = {
  id: string;
  title: string;
  date: string;
  location: string;
  hostInitial: string;
  hostName: string;
  category: 'farewell' | 'freshers' | 'house_party';
  spots: number;
  price: string;
  city?: string;
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function mapToEventCard(ev: FallbackEvent): EventCardData {
  return {
    id: ev.id,
    title: ev.title,
    date: formatDate(ev.event_date),
    location: ev.city || ev.venue,
    hostInitial: (ev.host_name || 'H')[0],
    hostName: ev.host_name || 'Host',
    category: ev.category,
    spots: ev.spots_remaining ?? 0,
    price: ev.ticket_price > 0 ? `₹${(ev.ticket_price / 100).toLocaleString('en-IN')}` : 'Free',
    city: ev.city,
  };
}

export function getFallbackCards(category?: string, city?: string): EventCardData[] {
  let events = [...FALLBACK_EVENTS];
  if (category && category !== 'all') {
    events = events.filter((e) => e.category === category);
  }
  if (city && city !== 'All Cities') {
    events = events.filter((e) => e.city === city);
  }
  return events.map(mapToEventCard);
}

export async function fetchEvents(category?: string, city?: string): Promise<EventCardData[]> {
  try {
    let query = supabase
      .from('event_with_stats')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (city && city !== 'All Cities') {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((ev: Record<string, unknown>) => ({
      id: String(ev.id),
      title: String(ev.name || ev.title || 'Untitled'),
      date: formatDate(String(ev.event_date || ev.date || '')),
      location: String(ev.city || ev.venue || ''),
      hostInitial: String(ev.host_name || 'H')[0],
      hostName: String(ev.host_name || 'Host'),
      category: ev.category as EventCardData['category'],
      spots: Number(ev.spots_remaining ?? ev.spots_left ?? 0),
      price:
        ev.ticket_price && Number(ev.ticket_price) > 0
          ? `₹${(Number(ev.ticket_price) / 100).toLocaleString('en-IN')}`
          : 'Free',
      city: ev.city ? String(ev.city) : undefined,
    }));
  } catch {
    return [];
  }
}
