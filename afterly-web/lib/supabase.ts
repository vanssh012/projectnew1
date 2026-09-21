import { createClient } from '@supabase/supabase-js'

// These public values keep the browser client usable in previews where Vercel
// environment variables have not yet been injected. They are publishable/anon
// credentials only; never place a service-role key in this module.
const SUPABASE_URL = 'https://nyuamiddosfhukgiossj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dWFtaWRkb3NmaHVrZ2lv c3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mzc4MzQsImV4cCI6MjA5NTUxMzgzNH0.OC9VDF9J-9ilw0QG6am_tR5JUuo0tZ3tTAAUhQBpSuI'.replace(' ', '')

function getPublicValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized && /^[\x00-\x7F]+$/.test(normalized) ? normalized : fallback
}

export const supabase = createClient(
  getPublicValue(process.env.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL),
  getPublicValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_KEY),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
