import { Category } from '../constants/theme';

export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  college?: string;
  batch_year?: number;
  avatar_url?: string;
  bio?: string;
  verified: boolean;
  trust_score: number;
  total_hosted: number;
  total_attended: number;
  created_at?: string;
}

export interface Event {
  id: string;
  host_id: string;
  category: Category;
  title: string;
  description?: string;
  theme_description?: string;
  theme_tags: string[];
  college?: string;
  batch?: string;
  venue: string;
  city: string;
  event_date: string;
  max_guests: number;
  ticket_price: number;
  cover_image_url?: string;
  access_type: 'open' | 'invite_only' | 'application';
  requires_approval: boolean;
  college_email_only: boolean;
  show_guest_list: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  host_name?: string;
  host_avatar?: string;
  host_verified?: boolean;
  host_trust_score?: number;
  host_total_events?: number;
  approved_count?: number;
  avg_rating?: number;
  created_at?: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  razorpay_order_id?: string;
  qr_code?: string;
  message_to_host?: string;
  amount_paid?: number;
  created_at: string;
}

export interface CreateEventForm {
  category: Category;
  title: string;
  description: string;
  theme_description: string;
  theme_tags: string[];
  college: string;
  batch: string;
  venue: string;
  city: string;
  event_date: Date;
  max_guests: number;
  ticket_price: number;
  requires_approval: boolean;
  college_email_only: boolean;
  show_guest_list: boolean;
  cover_image_url: string;
  access_type: 'open' | 'invite_only' | 'application';
}
