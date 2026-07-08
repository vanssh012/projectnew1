import { createClient } from '@supabase/supabase-js';

type EventRecord = {
  id: string;
  name: string;
  title?: string;
  category: string;
  college?: string;
  batch?: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
  city?: string;
  max_guests?: number;
  ticket_price?: number;
  host_name?: string;
  description?: string;
  status?: string;
  tags?: string[];
  spots_left?: number;
  date?: string;
  location?: string;
  hostInitial?: string;
  hostName?: string;
  price?: string;
};

type TicketRecord = {
  id: string;
  event_id: string;
  user_id?: string;
  status: string;
  payment_status?: string;
  qr_uuid?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at?: string;
  profiles?: {
    id?: string;
    full_name?: string;
    college?: string;
  };
};

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : '';
const supabaseAnonKey = rawKey && rawKey !== 'your_supabase_anon_key' && rawKey !== 'placeholder-anon-key' ? rawKey : '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const EVENTS_STORAGE_KEY = 'afterly_local_events';
const TICKETS_STORAGE_KEY = 'afterly_local_tickets';
const AUTH_STORAGE_KEY = 'afterly_local_auth';
const OTP_STORAGE_KEY = 'afterly_local_otp';

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const seedEvents: EventRecord[] = [
  {
    id: '083497be-7354-4234-a19b-5b77393c8d35',
    name: 'The Last Dance',
    category: 'farewell',
    event_date: '2026-07-14',
    event_time: '19:30',
    venue: 'Rooftop Lounge',
    city: 'Delhi NCR',
    max_guests: 120,
    ticket_price: 1500,
    host_name: 'Arjun',
    description: 'A farewell night with a live DJ and sunset rooftop vibes.',
    status: 'published',
    spots_left: 18,
    tags: ['DJ Night', 'Rooftop'],
  },
  {
    id: '6746a337-f4ba-4f75-ad2b-0dad62938b28',
    name: 'Neon Freshers Night',
    category: 'freshers',
    event_date: '2026-07-20',
    event_time: '20:00',
    venue: 'The Arena',
    city: 'Bangalore',
    max_guests: 220,
    ticket_price: 999,
    host_name: 'Sneha',
    description: 'A freshers mixer with neon decor and games.',
    status: 'published',
    spots_left: 42,
    tags: ['Neon Theme', 'Games'],
  },
  {
    id: '62dc2efd-84cd-43dd-b967-31da078164fe',
    name: 'Midnight Mirage',
    category: 'house_party',
    event_date: '2026-08-01',
    event_time: '22:00',
    venue: 'Private Villa',
    city: 'Mumbai',
    max_guests: 60,
    ticket_price: 2000,
    host_name: 'Kabir',
    description: 'An intimate house party with a late-night playlist and open bar.',
    status: 'published',
    spots_left: 7,
    tags: ['BYOB', 'Retro'],
  },
];

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const ensureDemoData = () => {
  const storedEvents = readStorage<EventRecord[]>(EVENTS_STORAGE_KEY, []);
  if (storedEvents.length === 0) {
    writeStorage(EVENTS_STORAGE_KEY, seedEvents);
  }
  const storedTickets = readStorage<TicketRecord[]>(TICKETS_STORAGE_KEY, []);
  if (storedTickets.length === 0) {
    writeStorage(TICKETS_STORAGE_KEY, []);
  }
};

const getLocalEvents = (): EventRecord[] => {
  ensureDemoData();
  return readStorage<EventRecord[]>(EVENTS_STORAGE_KEY, seedEvents);
};

const getLocalTickets = (): TicketRecord[] => {
  ensureDemoData();
  return readStorage<TicketRecord[]>(TICKETS_STORAGE_KEY, []);
};

class FallbackQueryBuilder {
  constructor(private table: string, private client: FallbackSupabaseClient) {}
  private filters: Array<{ column: string; value: unknown }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private operation: 'select' | 'update' | 'insert' | 'delete' = 'select';
  private updateValues: Record<string, unknown> = {};
  private insertValues: Record<string, unknown> | null = null;
  private singleResult = false;

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = 'update';
    this.updateValues = values;
    return this;
  }

  insert(values: Record<string, unknown>) {
    this.operation = 'insert';
    this.insertValues = values;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  async then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    const result = await this.execute();
    return onfulfilled ? onfulfilled(result) : (result as TResult1);
  }

  async execute() {
    return this.client.executeQuery(this.table, this);
  }
}

class FallbackSupabaseClient {
  auth = {
    getSession: async () => {
      const storedUser = readStorage<{ phone: string; name: string } | null>(AUTH_STORAGE_KEY, null);
      if (!storedUser) {
        return { data: { session: null }, error: null };
      }

      return {
        data: {
          session: {
            user: {
              id: `local_${storedUser.phone}`,
              phone: storedUser.phone,
              user_metadata: {
                full_name: storedUser.name || storedUser.phone,
                phone: storedUser.phone,
              },
            },
          },
        },
        error: null,
      };
    },
    getUser: async () => {
      const storedUser = readStorage<{ phone: string; name: string } | null>(AUTH_STORAGE_KEY, null);
      return {
        data: { user: storedUser ? { id: `local_${storedUser.phone}`, phone: storedUser.phone } : null },
        error: null,
      };
    },
    signInWithOtp: async () => ({ data: {}, error: null }),
    verifyOtp: async () => ({ data: {}, error: null }),
    signOut: async () => {
      writeStorage(AUTH_STORAGE_KEY, null);
      return { error: null };
    },
  };

  from(table: string) {
    return new FallbackQueryBuilder(table, this);
  }

  channel() {
    return {
      on: () => this,
      subscribe: () => this,
    };
  }

  removeChannel() {
    return undefined;
  }

  async executeQuery(table: string, query: FallbackQueryBuilder) {
    if (table === 'event_with_stats' || table === 'events') {
      const events = getLocalEvents();
      let data = [...events];

      for (const filter of query['filters']) {
        const { column, value } = filter;
        data = data.filter((item) => {
          const currentValue = item[column as keyof EventRecord];
          return currentValue === value;
        });
      }

      if (query['orderBy']) {
        const { column, ascending } = query['orderBy'];
        data.sort((a, b) => {
          const left = a[column as keyof EventRecord] as string | number | undefined;
          const right = b[column as keyof EventRecord] as string | number | undefined;
          if (left === undefined || right === undefined) return 0;
          return ascending ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left));
        });
      }

      if (query['operation'] === 'insert') {
        const inserted = {
          ...(query['insertValues'] || {}),
          id: generateId(),
          created_at: new Date().toISOString(),
        } as EventRecord & { created_at?: string };
        const next = [inserted, ...events];
        writeStorage(EVENTS_STORAGE_KEY, next);
        return { data: query['singleResult'] ? inserted : [inserted], error: null };
      }

      if (query['singleResult']) {
        data = data.slice(0, 1);
      }

      return { data, error: null };
    }

    if (table === 'tickets') {
      const tickets = getLocalTickets();
      let data = [...tickets];

      for (const filter of query['filters']) {
        const { column, value } = filter;
        data = data.filter((item) => {
          const currentValue = item[column as keyof TicketRecord];
          return currentValue === value;
        });
      }

      if (query['operation'] === 'insert') {
        const inserted = {
          ...(query['insertValues'] || {}),
          id: (query['insertValues'] as any)?.id || `ticket_${Math.random().toString(36).slice(2, 9)}`,
          qr_uuid: (query['insertValues'] as any)?.qr_uuid || `qr_${Math.random().toString(36).slice(2, 10)}`,
          status: (query['insertValues'] as any)?.status || 'approved',
          payment_status: (query['insertValues'] as any)?.payment_status || 'free',
          created_at: new Date().toISOString(),
        } as TicketRecord;
        const next = [inserted, ...tickets];
        writeStorage(TICKETS_STORAGE_KEY, next);
        return { data: query['singleResult'] ? inserted : [inserted], error: null };
      }

      if (query['operation'] === 'update') {
        const next = tickets.map((entry) => {
          const shouldUpdate = query['filters'].some((filter) => entry[filter.column as keyof TicketRecord] === filter.value);
          if (!shouldUpdate) return entry;
          return { ...entry, ...query['updateValues'] };
        });
        writeStorage(TICKETS_STORAGE_KEY, next);
        return { data: next, error: null };
      }

      if (query['singleResult']) {
        data = data.slice(0, 1);
      }

      const events = getLocalEvents();
      const eventMap = Object.fromEntries(events.map((event) => [event.id, event]));

      data = data.map((entry) => ({
        ...entry,
        events: eventMap[entry.event_id] ? { ...eventMap[entry.event_id], id: eventMap[entry.event_id].id } : null,
        profiles: entry.profiles || {
          id: entry.id,
          full_name: 'Guest',
          college: 'Unknown College',
        },
      }));

      return { data, error: null };
    }

    return { data: null, error: null };
  }
}

const fallbackClient = new FallbackSupabaseClient();
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : (fallbackClient as any);

export const requestOtp = async (phone: string) => {
  if (!isSupabaseConfigured) {
    const code = phone === "+919999999999" ? "123456" : String(Math.floor(100000 + Math.random() * 900000));
    writeStorage(OTP_STORAGE_KEY, { phone, code });
    return { success: true, message: `Demo OTP sent to ${phone}. Use ${code}` };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("twilio") || msg.includes("sms") || msg.includes("provider") || msg.includes("phone")) {
        return { success: false, message: "OTP service is being set up. contact us at hello@afterly.in to get early access." };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: "OTP sent successfully." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to send OTP";
    return { success: false, message };
  }
};

export const verifyOtp = async (phone: string, otp: string) => {
  if (!isSupabaseConfigured) {
    if (phone === "+919999999999" && otp === "123456") {
      writeStorage(AUTH_STORAGE_KEY, { phone: "9999999999", name: "9999" });
      return { success: true, message: "Signed in successfully." };
    }
    const stored = readStorage<{ phone: string; code: string } | null>(OTP_STORAGE_KEY, null);
    const success = Boolean(stored && stored.phone === phone && stored.code === otp);
    if (success) {
      writeStorage(AUTH_STORAGE_KEY, { phone: phone.replace("+91", ""), name: phone.slice(-4) });
      return { success: true, message: "Signed in successfully." };
    }
    return { success: false, message: "That code did not match. Try again." };
  }

  try {
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' as const });
    if (!error) {
      writeStorage(AUTH_STORAGE_KEY, { phone, name: phone.slice(-4) });
    }
    return { success: !error, message: error ? error.message : 'Signed in successfully.' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Unable to verify OTP' };
  }
};

export const getStoredUser = () => readStorage<{ phone: string; name: string } | null>(AUTH_STORAGE_KEY, null);
export const clearStoredUser = () => writeStorage(AUTH_STORAGE_KEY, null);

export const createEvent = async (eventData: Partial<EventRecord>) => {
  const event: EventRecord = {
    id: eventData.id || generateId(),
    name: eventData.name || 'Untitled Event',
    title: eventData.name || 'Untitled Event',
    category: eventData.category || 'farewell',
    college: eventData.college,
    batch: eventData.batch,
    event_date: eventData.event_date || eventData.date,
    event_time: eventData.event_time || eventData.date,
    venue: eventData.venue,
    city: eventData.city,
    max_guests: eventData.max_guests || 0,
    ticket_price: eventData.ticket_price || 0,
    host_name: eventData.host_name || 'You',
    description: eventData.description,
    status: eventData.status || 'published',
    tags: eventData.tags || [],
    spots_left: Math.max((eventData.max_guests || 0) - 1, 0),
    date: eventData.event_date || eventData.date,
    location: eventData.city,
    hostInitial: (eventData.host_name || 'Y')[0],
    hostName: eventData.host_name || 'You',
    price: eventData.ticket_price && eventData.ticket_price > 0 ? `₹${eventData.ticket_price / 100}` : 'Free',
  };

  const existing = getLocalEvents();
  writeStorage(EVENTS_STORAGE_KEY, [event, ...existing]);

  return { event, error: null };
};

export const getEventById = (eventId: string) => getLocalEvents().find((event) => event.id === eventId) || null;

export const getDashboardData = (eventId: string) => {
  const event = getEventById(eventId);
  const tickets = getLocalTickets().filter((ticket) => ticket.event_id === eventId);
  return { event, tickets, requests: tickets.filter((ticket) => ticket.status === 'pending'), approved: tickets.filter((ticket) => ticket.status === 'approved' || ticket.status === 'checked-in') };
};

export const updateTicketStatus = (ticketId: string, status: string) => {
  const tickets = getLocalTickets().map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket));
  writeStorage(TICKETS_STORAGE_KEY, tickets);
  return { error: null };
};

export const checkInTicket = (qrUuid: string, eventId: string) => {
  const tickets = getLocalTickets().map((ticket) => (ticket.qr_uuid === qrUuid && ticket.event_id === eventId ? { ...ticket, status: 'checked-in' } : ticket));
  writeStorage(TICKETS_STORAGE_KEY, tickets);
  return { error: null };
};
