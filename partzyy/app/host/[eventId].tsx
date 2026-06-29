import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Alert } from 'react-native';
import { COLORS, CATEGORY_LABELS } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface EventDetails {
  id: string;
  host_id: string;
  category: 'farewell' | 'freshers' | 'house_party';
  title: string;
  event_date: string;
  venue: string;
  city: string;
  max_guests: number;
  ticket_price: number;
}

interface TicketWithProfile {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in';
  message_to_host?: string;
  qr_code?: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    college?: string;
    total_attended?: number;
  } | null;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default function HostControlPanel() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'requests' | 'approved' | 'scan' | 'info'>('requests');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const { data: event } = useQuery({
    queryKey: ['hostEvent', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) throw error;
      return data as EventDetails;
    },
    enabled: !!currentUser,
  });

  const { data: tickets } = useQuery({
    queryKey: ['hostTickets', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, profiles(*)')
        .eq('event_id', eventId)
        .order('created_at');
      if (error) throw error;
      return data as TicketWithProfile[];
    },
    enabled: !!currentUser && !!event,
  });

  const isHost = event && currentUser && event.host_id === currentUser;

  const approveTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const qrCode = generateUUID();
      const { error } = await supabase.from('tickets').update({ status: 'approved', qr_code: qrCode }).eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostTickets', eventId] });
      Alert.alert('approved!', 'they\'ll be notified');
    },
  });

  const rejectTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase.from('tickets').update({ status: 'rejected' }).eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostTickets', eventId] });
    },
  });

  const checkInTicket = useMutation({
    mutationFn: async (qrCode: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'checked_in' })
        .eq('qr_code', qrCode)
        .eq('event_id', eventId)
        .select()
        .single();
      
      if (error || !data) throw new Error('Invalid or already scanned ticket');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostTickets', eventId] });
      Alert.alert('Success', 'Guest checked in!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message);
    }
  });

  if (!currentUser || !event || !isHost) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.bg.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.notHostText}>not your event</Text>
      </View>
    );
  }

  const pendingTickets = tickets?.filter(t => t.status === 'pending') || [];
  const approvedTickets = tickets?.filter(t => t.status === 'approved') || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    return hours > 0 ? `${hours} hours ago` : 'just now';
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  };

  const HeaderSection = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: COLORS.category[event.category].badgeBg, borderColor: COLORS.category[event.category].primary }]}>
          <Text style={[styles.categoryBadgeText, { color: COLORS.category[event.category].primary }]}>
            {CATEGORY_LABELS[event.category]}
          </Text>
        </View>
      </View>
      <Text style={styles.eventMeta}>
        {new Date(event.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {event.venue}
      </Text>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {approvedTickets.length}/{event.max_guests} spots filled
        </Text>
        <Text style={styles.statText}>|</Text>
        <Text style={styles.statText}>{pendingTickets.length} pending</Text>
        <Text style={styles.statText}>|</Text>
        <Text style={styles.statText}>
          ₹{(approvedTickets.length * event.ticket_price / 100)} revenue
        </Text>
      </View>
    </View>
  );

  const RequestsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {pendingTickets.map((ticket) => (
        <View key={ticket.id} style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={[styles.avatar, { backgroundColor: COLORS.category[event.category].bg }]}>
              <Text style={styles.avatarText}>{getInitials(ticket.profiles?.full_name)}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.guestName}>{ticket.profiles?.full_name}</Text>
              <Text style={styles.guestCollege}>{ticket.profiles?.college || 'college not set'}</Text>
            </View>
          </View>
          {ticket.message_to_host && (
            <Text style={styles.messageText}>"{ticket.message_to_host}"</Text>
          )}
          <Text style={styles.timeText}>{formatTimeAgo(ticket.created_at)}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.approveBtn, { backgroundColor: 'rgba(142,207,122,0.15)', borderColor: '#8ECF7A' }]}
              onPress={() => approveTicket.mutate(ticket.id)}
            >
              <Text style={styles.approveText}>✓ approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: '#CF7A7A' }]}
              onPress={() => {
                Alert.alert('confirm', 'this will notify the guest', [
                  { text: 'cancel', style: 'cancel' },
                  { text: 'reject', onPress: () => rejectTicket.mutate(ticket.id), style: 'destructive' },
                ]);
              }}
            >
              <Text style={styles.rejectText}>✗ reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const ApprovedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {approvedTickets.map((ticket) => (
        <View key={ticket.id} style={styles.approvedCard}>
          <View style={styles.requestHeader}>
            <View style={[styles.avatar, { backgroundColor: COLORS.category[event.category].bg }]}>
              <Text style={styles.avatarText}>{getInitials(ticket.profiles?.full_name)}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.guestName}>{ticket.profiles?.full_name}</Text>
              {ticket.qr_code && (
                <Text style={styles.qrCodeText}>{ticket.qr_code}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.scanBtn}>
            <Text style={styles.scanText}>scan at door</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const InfoTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>title</Text>
        <Text style={styles.infoValue}>{event.title}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>venue</Text>
        <Text style={styles.infoValue}>{event.venue}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>date</Text>
        <Text style={styles.infoValue}>{new Date(event.event_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>price</Text>
        <Text style={styles.infoValue}>₹{event.ticket_price / 100}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>edit event</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    checkInTicket.mutate(data);
    setTimeout(() => setScanned(false), 3000); // Reset after 3s
  };

  const ScanTab = () => {
    if (hasPermission === null) {
      return <Text style={styles.infoValue}>Requesting for camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text style={styles.infoValue}>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 20 }}>
        <Text style={styles.infoLabel}>Point camera at ticket QR Code</Text>
        <View style={{ height: 300, width: 300, overflow: 'hidden', borderRadius: 20, marginTop: 20 }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        {scanned && (
          <TouchableOpacity style={styles.scanBtn} onPress={() => setScanned(false)}>
            <Text style={styles.scanText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <HeaderSection />
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('requests')}>
          <Text style={[styles.tabText, activeTab === 'requests' && { color: COLORS.category[event.category].primary, borderBottomWidth: 2, borderBottomColor: COLORS.category[event.category].primary }]}>
            requests ({pendingTickets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('approved')}>
          <Text style={[styles.tabText, activeTab === 'approved' && { color: COLORS.category[event.category].primary, borderBottomWidth: 2, borderBottomColor: COLORS.category[event.category].primary }]}>
            approved ({approvedTickets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('info')}>
          <Text style={[styles.tabText, activeTab === 'info' && { color: COLORS.category[event.category].primary, borderBottomWidth: 2, borderBottomColor: COLORS.category[event.category].primary }]}>
            event info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('scan')}>
          <Text style={[styles.tabText, activeTab === 'scan' && { color: COLORS.category[event.category].primary, borderBottomWidth: 2, borderBottomColor: COLORS.category[event.category].primary }]}>
            scan
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'requests' && <RequestsTab />}
      {activeTab === 'approved' && <ApprovedTab />}
      {activeTab === 'info' && <InfoTab />}
      {activeTab === 'scan' && <ScanTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  categoryBadgeText: {
    fontSize: 10,
  },
  eventMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    textTransform: 'lowercase',
    paddingBottom: 4,
  },
  tabContent: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    padding: 14,
    marginBottom: 8,
  },
  approvedCard: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    padding: 14,
    marginBottom: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  nameContainer: {
    flex: 1,
  },
  guestName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  guestCollege: {
    fontSize: 11,
    color: '#666',
  },
  messageText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#555',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  approveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8ECF7A',
  },
  rejectBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CF7A7A',
  },
  qrCodeText: {
    fontSize: 10,
    color: '#555',
  },
  scanBtn: {
    backgroundColor: '#1A1A1E',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  scanText: {
    fontSize: 11,
    color: '#888',
  },
  infoCard: {
    backgroundColor: '#1A1A1E',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text.primary,
  },
  editBtn: {
    backgroundColor: COLORS.category.farewell.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E0E10',
  },
  notHostText: {
    fontSize: 16,
    color: '#888',
  },
});