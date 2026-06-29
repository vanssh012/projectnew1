import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Avoid crashing on startup if credentials are placeholder values or invalid URLs
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey && rawKey !== 'your_supabase_anon_key' ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

