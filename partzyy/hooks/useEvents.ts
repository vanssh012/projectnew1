import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import type { Category } from '@/constants/theme';

export type { Category };

interface UseEventsParams {
  category?: Category;
  city?: string;
}

export function useEvents({ category, city }: UseEventsParams = {}) {
  const { data: events, isLoading: loading, refetch, ...rest } = useQuery({
    queryKey: ['events', category, city],
    queryFn: async () => {
      let query = supabase
        .from('event_with_stats')
        .select('*')
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Event[];
    },
  });

  return { events: events || [], loading, refetch, ...rest };
}