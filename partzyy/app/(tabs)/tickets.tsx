import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { COLORS, CATEGORY_LABELS } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/constants/theme';
import QRCode from 'react-native-qrcode-svg';

interface TicketWithEvent {
  id: string;
  event_id: string;
  user_id: string;
  qr_uuid?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in';
  event_date: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    category: Category;
    event_date: string;
    venue: string;
    city: string;
    cover_image_url?: string;
    ticket_price: number;
    qr_code?: string;
  };
}

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const animatedHeights = useRef<{ [key: string]: Animated.Value }>({}).current;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', currentUser],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('user_id', currentUser)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TicketWithEvent[];
    },
    enabled: !!currentUser,
  });

  const upcomingTickets = tickets?.filter(t => 
    new Date(t.events?.event_date) >= new Date() && 
    t.status !== 'rejected' && 
    t.status !== 'cancelled'
  ) || [];

  const pastTickets = tickets?.filter(t => 
    new Date(t.events?.event_date) < new Date() || 
    t.status === 'rejected'
  ) || [];

  const displayedTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: 'rgba(201,160,80,0.15)', text: '#C9A050', border: '#C9A050', label: 'pending ⏳' },
      approved: { bg: 'rgba(142,207,122,0.15)', text: '#8ECF7A', border: '#8ECF7A', label: 'approved ✓' },
      rejected: { bg: 'rgba(207,122,122,0.15)', text: '#CF7A7A', border: '#CF7A7A', label: 'not approved' },
      checked_in: { bg: '#1A1A1E', text: '#555', border: '#555', label: 'attended' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const toggleExpand = (ticketId: string) => {
    if (!animatedHeights[ticketId]) {
      animatedHeights[ticketId] = new Animated.Value(0);
    }
    const toValue = expandedTicketId === ticketId ? 0 : 150;
    Animated.timing(animatedHeights[ticketId], {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bg.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.authPrompt}>sign in to see your tickets</Text>
        <TouchableOpacity style={styles.authButton} onPress={() => router.push('/(auth)/welcome')}>
          <Text style={styles.authButtonText}>sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if ((isLoading || !tickets?.length) && !displayedTickets.length) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bg.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyIcon}>🎟️</Text>
        <Text style={styles.emptyText}>no tickets yet</Text>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.exploreButtonText}>explore events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.tabContainer}>
        {(['upcoming', 'past'] as const).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <View style={[styles.tabIndicator, { backgroundColor: '#C9A050', left: activeTab === 'upcoming' ? 0 : 80 }]} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {displayedTickets.map((ticket) => {
          const categoryColor = COLORS.category[ticket.events?.category || 'farewell'];
          const statusConfig = getStatusBadge(ticket.status);
          const isExpanded = expandedTicketId === ticket.id;
          
          return (
            <TouchableOpacity 
              key={ticket.id} 
              style={styles.ticketCard}
              onPress={() => ticket.status === 'approved' && toggleExpand(ticket.id)}
            >
              <View style={[styles.colorStrip, { backgroundColor: categoryColor.primary }]} />
              <View style={styles.ticketContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {ticket.events?.title || 'Event'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.rowBetween}>
                  <Text style={styles.metaText}>
                    📅 {formatDate(ticket.events?.event_date || '')} 🕐 {formatTime(ticket.events?.event_date || '')}
                  </Text>
                </View>
                
                <View style={styles.rowBetween}>
                  <Text style={styles.metaText}>
                    📍 {ticket.events?.venue || ticket.events?.city || ''}
                  </Text>
                </View>

                {ticket.status === 'approved' && (
                  <Animated.View style={[styles.qrContainer, { maxHeight: isExpanded ? 200 : 0, opacity: isExpanded ? 1 : 0 }]}>
                    <View style={styles.qrBorder}>
                      <QRCode value={ticket.qr_uuid || ticket.id} size={130} backgroundColor="#F0EEE8" />
                    </View>
                    <Text style={styles.qrText}>show this at the door</Text>
                    <View style={styles.ticketDetails}>
                      <Text style={styles.ticketDetailText}>ticket · {CATEGORY_LABELS[ticket.events?.category || 'farewell']}</Text>
                    </View>
                  </Animated.View>
                )}

                {ticket.status === 'pending' && (
                  <Text style={styles.pendingText}>
                    your request is with the host. you'll be notified once approved.
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 16,
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    textTransform: 'lowercase',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    height: 2,
    width: 20,
  },
  scrollView: {
    flex: 1,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 4,
  },
  ticketContent: {
    flex: 1,
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  qrContainer: {
    marginTop: 10,
    paddingTop: 10,
    overflow: 'hidden',
  },
  qrBorder: {
    height: 150,
    width: 150,
    backgroundColor: '#F0EEE8',
    alignSelf: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
  ticketDetails: {
    marginTop: 6,
    alignItems: 'center',
  },
  ticketDetailText: {
    fontSize: 11,
    color: '#666',
  },
  pendingText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  authPrompt: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textTransform: 'lowercase',
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
  emptyIcon: {
    fontSize: 48,
    color: '#555',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textTransform: 'lowercase',
  },
  exploreButton: {
    backgroundColor: '#C9A050',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0E0E10',
  },
});