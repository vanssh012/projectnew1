import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, CATEGORY_LABELS } from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { EventCardSmall } from '@/components/EventCardSmall';

interface ProfileData {
  id: string;
  phone: string;
  full_name: string;
  college?: string;
  batch_year?: number;
  avatar_url?: string;
  verified: boolean;
  trust_score: number;
  total_hosted: number;
  total_attended: number;
}

interface HostedEvent {
  id: string;
  title: string;
  category: 'farewell' | 'freshers' | 'house_party';
  event_date: string;
  venue: string;
  city: string;
  max_guests: number;
  ticket_price: number;
  host_name?: string;
}

export default function ProfileScreen() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser)
        .single();
      if (error) return null;
      return data as ProfileData;
    },
    enabled: !!currentUser,
  });

  const { data: hostedEvents } = useQuery({
    queryKey: ['hostedEvents', currentUser],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', currentUser)
        .eq('status', 'published');
      if (error) return [];
      return data as HostedEvent[];
    },
    enabled: !!currentUser,
  });

  const { data: attendedEvents } = useQuery({
    queryKey: ['attendedEvents', currentUser],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('user_id', currentUser)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) return [];
      return data as any[];
    },
    enabled: !!currentUser,
  });

  if (!currentUser || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bg.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.authText}>sign in to see your profile</Text>
        <TouchableOpacity style={styles.authButton} onPress={() => router.replace('/(auth)/welcome')}>
          <Text style={styles.authButtonText}>sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const categoryColors = [COLORS.category.farewell.primary, COLORS.category.freshers.primary, COLORS.category.house_party.primary];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  };

  const getCategoryColor = (cat?: string) => {
    const safeCat = cat && (cat === 'farewell' || cat === 'freshers' || cat === 'house_party') ? cat : 'farewell';
    return COLORS.category[safeCat as 'farewell' | 'freshers' | 'house_party'].primary;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.bg.primary }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.college}>
          {profile.college}{profile.batch_year ? ` · ${profile.batch_year}` : ''}
        </Text>
        {profile.verified && (
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={styles.verifiedText}>verified</Text>
          </View>
        )}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>edit profile →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <Text style={[styles.statNumber, { color: categoryColors[0] }]}>{profile.total_attended}</Text>
          <Text style={styles.statLabel}>attended</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statColumn}>
          <Text style={[styles.statNumber, { color: categoryColors[1] }]}>{profile.total_hosted}</Text>
          <Text style={styles.statLabel}>hosted</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statColumn}>
          <Text style={[styles.statNumber, { color: categoryColors[2] }]}>
            {profile.trust_score ? `${profile.trust_score.toFixed(1)} ⭐` : '—'}
          </Text>
          <Text style={styles.statLabel}>trust score</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>my events</Text>
        {(!hostedEvents || hostedEvents.length === 0) && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/create')}>
            <Text style={styles.sectionAction}>create your first event →</Text>
          </TouchableOpacity>
        )}
      </View>

      {hostedEvents && hostedEvents.length > 0 ? (
        hostedEvents.map((event) => (
          <EventCardSmall
            key={event.id}
            event={event as any}
            onPress={() => router.push(`/event/${event.id}`)}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>you haven't hosted any events yet</Text>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>attended</Text>
      </View>

      {attendedEvents && attendedEvents.length > 0 ? (
        attendedEvents.map((ticket: any, index) => (
          <View key={ticket.id} style={styles.attendedRow}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(ticket.events?.category) }]} />
            <View style={styles.attendedInfo}>
              <Text style={styles.attendedTitle}>{ticket.events?.title}</Text>
              <Text style={styles.attendedMeta}>
                {new Date(ticket.events?.event_date || '').toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>no attended events yet</Text>
      )}

      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>Edit profile</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>Notification preferences</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>Help & support</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut}>
          <Text style={[styles.settingsText, { color: '#CF7A7A' }]}>Sign out</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  headerSection: {
    backgroundColor: COLORS.bg.surface,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginTop: 10,
  },
  college: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  verifiedIcon: {
    fontSize: 12,
    color: '#5ABFCF',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#5ABFCF',
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
  },
  editButtonText: {
    fontSize: 11,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    padding: 14,
    margin: 16,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: {
    width: 0.5,
    backgroundColor: '#2A2A2E',
    marginHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontSize: 11,
    color: '#C9A050',
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  attendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: COLORS.bg.surface,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  attendedInfo: {
    flex: 1,
  },
  attendedTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  attendedMeta: {
    fontSize: 11,
    color: '#666',
  },
  settingsSection: {
    margin: 16,
    marginTop: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2E',
  },
  settingsText: {
    fontSize: 13,
    color: COLORS.text.primary,
  },
  settingsArrow: {
    fontSize: 14,
    color: '#555',
  },
  authText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#C9A050',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0E0E10',
  },
});