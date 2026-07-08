export type FallbackEvent = {
  id: string;
  category: 'farewell' | 'freshers' | 'house_party';
  title: string;
  college: string | null;
  batch: string | null;
  venue: string;
  city: string;
  event_date: string;
  max_guests: number;
  ticket_price: number;
  approved_count: number;
  spots_remaining: number;
  access_type: string;
  requires_approval: boolean;
  status: string;
  host_name: string;
  host_verified: boolean;
  host_total_events: number;
  avg_rating: number;
  theme_tags: string[];
  theme_description: string;
};

export const FALLBACK_EVENTS: FallbackEvent[] = [
  {
    id: '083497be-7354-4234-a19b-5b77393c8d35',
    category: 'farewell',
    title: 'Golden Memories Farewell Night',
    college: 'DTU Delhi',
    batch: 'Batch of 2025',
    venue: 'Rohini, New Delhi',
    city: 'Delhi NCR',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_guests: 40,
    ticket_price: 59900,
    approved_count: 28,
    spots_remaining: 12,
    access_type: 'application',
    requires_approval: true,
    status: 'published',
    host_name: 'Rohan Kumar',
    host_verified: true,
    host_total_events: 6,
    avg_rating: 4.9,
    theme_tags: ['DJ Night', 'Bollywood', 'Photo Booth', 'Dinner Included'],
    theme_description: 'Retro Bollywood night — mandatory ethnic outfit, photo booth, dinner.',
  },
  {
    id: '6746a337-f4ba-4f75-ad2b-0dad62938b28',
    category: 'freshers',
    title: 'Welcome to the Jungle — Freshers Night 2025',
    college: 'IIT Delhi',
    batch: 'Batch of 2029',
    venue: 'Hauz Khas, New Delhi',
    city: 'Delhi NCR',
    event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    max_guests: 80,
    ticket_price: 0,
    approved_count: 45,
    spots_remaining: 35,
    access_type: 'open',
    requires_approval: false,
    status: 'published',
    host_name: 'Sneha Verma',
    host_verified: true,
    host_total_events: 3,
    avg_rating: 0,
    theme_tags: ['Neon Theme', 'DJ Night', 'Games', 'Introductions'],
    theme_description: 'Neon jungle theme — wear neon or animal print. DJ, games, dinner.',
  },
  {
    id: '62dc2efd-84cd-43dd-b967-31da078164fe',
    category: 'house_party',
    title: 'Retro Neon House Party',
    college: null,
    batch: null,
    venue: 'Lajpat Nagar, New Delhi',
    city: 'Delhi NCR',
    event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    max_guests: 30,
    ticket_price: 49900,
    approved_count: 18,
    spots_remaining: 12,
    access_type: 'invite_only',
    requires_approval: true,
    status: 'published',
    host_name: 'Arjun Mehta',
    host_verified: true,
    host_total_events: 4,
    avg_rating: 0,
    theme_tags: ['Neon Theme', 'Retro', 'BYOB', 'Rooftop'],
    theme_description: '90s retro meets neon rave. BYOB, rooftop after midnight.',
  },
];
