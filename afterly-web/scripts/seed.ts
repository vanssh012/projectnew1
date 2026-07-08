import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  console.error('   URL:', supabaseUrl ? '✓ present' : '✗ missing');
  console.error('   Key:', supabaseKey ? '✓ present' : '✗ missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding Supabase events table...');
  console.log('   URL:', supabaseUrl);

  // Check if events already exist
  const { data: existing, error: checkError } = await supabase
    .from('events')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('❌ Cannot read events table. Check RLS policies or table existence.');
    console.error('   Error:', checkError.message);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log('⚠️  Events table already has data. Skipping seed to avoid duplicates.');
    console.log("   Run: DELETE FROM events WHERE host_id = '083497be-7354-4234-a19b-5b77393c8d35' OR host_id = '6746a337-f4ba-4f75-ad2b-0dad62938b28' OR host_id = '62dc2efd-84cd-43dd-b967-31da078164fe'; to reset.");
    process.exit(0);
  }

  const { error } = await supabase
    .from('events')
    .insert([
      {
        host_id: '083497be-7354-4234-a19b-5b77393c8d35',
        category: 'farewell',
        title: 'Golden Memories Farewell Night',
        theme_description: 'Retro Bollywood night — mandatory ethnic outfit, photo booth, dinner.',
        theme_tags: ['DJ Night', 'Bollywood', 'Photo Booth', 'Dinner Included'],
        college: 'DTU Delhi',
        batch: 'Batch of 2025',
        venue: 'Rohini, New Delhi',
        city: 'Delhi NCR',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_guests: 40,
        ticket_price: 59900,
        access_type: 'application',
        requires_approval: true,
        college_email_only: true,
        show_guest_list: true,
        status: 'published',
      },
      {
        host_id: '6746a337-f4ba-4f75-ad2b-0dad62938b28',
        category: 'freshers',
        title: 'Welcome to the Jungle — Freshers Night 2025',
        theme_description: 'Neon jungle theme — neon or animal print, games, DJ, free dinner.',
        theme_tags: ['Neon Theme', 'DJ Night', 'Games', 'Introductions'],
        college: 'IIT Delhi',
        batch: 'Batch of 2029',
        venue: 'Hauz Khas, New Delhi',
        city: 'Delhi NCR',
        event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        max_guests: 80,
        ticket_price: 0,
        access_type: 'open',
        requires_approval: false,
        college_email_only: true,
        show_guest_list: true,
        status: 'published',
      },
      {
        host_id: '62dc2efd-84cd-43dd-b967-31da078164fe',
        category: 'house_party',
        title: 'Retro Neon House Party',
        theme_description: '90s retro meets neon rave. BYOB, rooftop after midnight.',
        theme_tags: ['Neon Theme', 'Retro', 'BYOB', 'Rooftop'],
        venue: 'Lajpat Nagar, New Delhi',
        city: 'Delhi NCR',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        max_guests: 30,
        ticket_price: 49900,
        access_type: 'invite_only',
        requires_approval: true,
        college_email_only: false,
        show_guest_list: false,
        status: 'published',
      },
    ]);

  if (error) {
    console.error('❌ Seed error:', error.message);
    console.error('   Details:', JSON.stringify(error, null, 2));
    process.exit(1);
  } else {
    console.log('✅ Seeded successfully! 3 events inserted.');
  }
}

seed();
