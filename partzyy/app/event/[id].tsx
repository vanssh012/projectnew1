import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Share } from 'react-native';
import { COLORS, SPACING, CATEGORY_LABELS, CATEGORY_SYMBOLS } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event, Ticket } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';

interface GuestPreview {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_with_stats')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Event;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const { data: ticket } = useQuery({
    queryKey: ['ticket', id, currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', currentUser)
        .single();
      if (error) return null;
      return data as Ticket;
    },
    enabled: !!currentUser,
  });

  const { data: guests } = useQuery({
    queryKey: ['guests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id, 
          user_id, 
          profiles!inner(full_name, avatar_url)
        `)
        .eq('event_id', id)
        .eq('status', 'approved')
        .limit(5);
      if (error) throw error;
      return data.map((g: any) => ({
        id: g.id,
        user_id: g.user_id,
        profiles: g.profiles,
      })) as GuestPreview[];
    },
    enabled: !!event?.show_guest_list,
  });

  const requestTicket = useMutation({
    mutationFn: async (messageText: string) => {
      if (!currentUser) return;
      const { error } = await supabase.from('tickets').insert({
        event_id: id,
        user_id: currentUser,
        status: 'pending',
        message_to_host: messageText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id, currentUser] });
      setShowMessageModal(false);
      setMessage('');
    },
  });

  if (!event) return null;

  const categoryColor = COLORS.category[event.category];
  const symbol = CATEGORY_SYMBOLS[event.category];

  const hostInitials = event.host_name
    ? event.host_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const formattedDate = format(new Date(event.event_date), 'EEEE, d MMMM');
  const formattedTime = format(new Date(event.event_date), 'h:mm a');

  const handleJoinPress = async () => {
    if (!currentUser) {
      router.push('/(auth)/welcome');
      return;
    }
    
    // Free event handling (e.g. invite only or application)
    if (!event.ticket_price || event.ticket_price === 0) {
      if (event.access_type === 'application' || event.requires_approval) {
        setShowMessageModal(true);
      } else {
        // Direct join
        await supabase.from('tickets').insert({
          event_id: id,
          user_id: currentUser,
          status: 'approved',
          payment_status: 'free',
        });
        queryClient.invalidateQueries({ queryKey: ['ticket', id, currentUser] });
      }
      return;
    }

    // Paid event handling
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { amount: event.ticket_price, eventId: event.id }
      });

      if (orderError || !orderData) throw new Error("Failed to create order");

      const RazorpayCheckout = require('react-native-razorpay').default;
      
      const options = {
        description: event.title || event.name,
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_123',
        amount: event.ticket_price,
        name: 'Afterly',
        order_id: orderData.id,
        theme: { color: '#C9A050' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // Success
        await supabase.from('tickets').insert({
          event_id: id,
          user_id: currentUser,
          payment_status: 'paid',
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          status: event.requires_approval ? 'pending' : 'approved'
        });
        queryClient.invalidateQueries({ queryKey: ['ticket', id, currentUser] });
        Alert.alert("Success", "Payment successful!");
      }).catch((error: any) => {
        Alert.alert("Error", "Payment failed or cancelled");
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || "Payment initiation failed");
    }
  };

  const getAccessInfo = () => {
    if (event.access_type === 'invite_only') {
      return { icon: '🔒', text: 'invite only — host approves all requests' };
    }
    if (event.access_type === 'open') {
      return { icon: '🌐', text: 'open event — anyone can join instantly' };
    }
    return { icon: '📄', text: 'send a request to join — host reviews it' };
  };

  const accessInfo = getAccessInfo();

  const getCTAText = () => {
    if (!ticket) {
      return event.ticket_price === 0 ? 'request to join' : 'get tickets';
    }
    if (ticket.status === 'pending') return 'request sent ⏳';
    if (ticket.status === 'approved') return "you're in ✓";
    return 'not approved';
  };

  const isCTADisabled = !!ticket;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: categoryColor.bg }]}>
        <Text style={styles.headerSymbol}>{symbol}</Text>
        {event.cover_image_url && (
          <Image source={{ uri: event.cover_image_url }} style={styles.coverImage} />
        )}
        <View style={styles.headerGradient} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            Share.share({
              message: `Check out ${event.title} on Afterly! https://afterly.in/events/${event.id}`,
            });
          }}
        >
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor.badgeBg, borderColor: categoryColor.border }]}>
          <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[event.category]}</Text>
        </View>
        {event.college && (
          <Text style={styles.headerLocation}>{event.college} · {event.city}</Text>
        )}
      </View>

      <ScrollView stickyHeaderIndices={[1]} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{formattedDate}</Text>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>{formattedTime}</Text>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{event.max_guests} max</Text>
          </View>

          <View style={styles.hostBlock}>
            <View style={[styles.hostAvatar, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.avatarText, { color: categoryColor.primary }]}>{hostInitials}</Text>
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{event.host_name}</Text>
              <Text style={styles.hostMeta}>
                Hosted {event.host_total_events || 0} events · ⭐ {(event.host_trust_score || 0).toFixed(1)}
              </Text>
            </View>
            {event.host_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
            {event.theme_tags?.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: categoryColor.bg, borderColor: categoryColor.primary }]}>
                <Text style={[styles.tagText, { color: categoryColor.primary }]}>{tag}</Text>
              </View>
            ))}
          </ScrollView>

          {event.theme_description && (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>about this night</Text>
              <View style={[styles.descriptionBorder, { borderLeftColor: categoryColor.primary }]}>
                <Text style={styles.descriptionText}>{event.theme_description}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {event.show_guest_list && guests && (
            <View style={styles.guestsSection}>
              <Text style={styles.guestsLabel}>
                attending · {event.approved_count || 0} confirmed
              </Text>
              <View style={styles.avatarStack}>
                {guests.map((guest, index) => {
                  const guestInitials = guest.profiles?.full_name
                    ? guest.profiles.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : '??';
                  return (
                    <View
                      key={guest.id}
                      style={[styles.guestAvatar, index > 0 && { marginLeft: -8 }]}
                    >
                      <Text style={styles.guestAvatarText}>{guestInitials}</Text>
                    </View>
                  );
                })}
                {(event.approved_count || 0) > 5 && (
                  <Text style={styles.moreGuests}>+{((event.approved_count || 0) - 5)} more</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.accessBanner}>
          <Text style={styles.accessIcon}>{accessInfo.icon}</Text>
          <Text style={styles.accessText}>{accessInfo.text}</Text>
        </View>

        <View style={styles.stickyFooter}>
          <Text style={[styles.priceText, event.ticket_price === 0 && { color: COLORS.success }]}>
            {event.ticket_price === 0 ? 'Free' : `₹${event.ticket_price / 100}`}
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: categoryColor.primary }]}
            onPress={handleJoinPress}
            disabled={isCTADisabled}
          >
            <Text style={styles.ctaText}>{getCTAText()}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>message to host (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="why do you want to join?"
              placeholderTextColor="#555"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => requestTicket.mutate(message)}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    height: 150,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSymbol: {
    position: 'absolute',
    fontSize: 100,
    opacity: 0.12,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
    height: 50,
    backgroundColor: 'rgba(14, 14, 16, 0.98)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 14, 16, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 50,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 14, 16, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  categoryBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  categoryBadgeText: {
    fontSize: 9,
    color: COLORS.text.primary,
  },
  headerLocation: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    fontSize: 10,
    color: '#888',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  metaIcon: {
    fontSize: 11,
    color: '#777',
  },
  metaText: {
    fontSize: 11,
    color: '#777',
  },
  hostBlock: {
    backgroundColor: '#1A1A1E',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '500',
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  hostMeta: {
    fontSize: 10,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 9,
    color: '#5ABFCF',
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
  },
  descriptionBlock: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  descriptionBorder: {
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 1.7,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#1E1E22',
    marginVertical: 14,
  },
  guestsSection: {},
  guestsLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1A0E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
  },
  guestAvatarText: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  moreGuests: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  accessBanner: {
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  accessText: {
    fontSize: 11,
    color: '#888',
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E22',
    padding: 16,
    marginTop: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '500',
  },
  ctaButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E0E10',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'lowercase',
  },
  modalInput: {
    backgroundColor: '#1A1A1E',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#5ABFCF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E0E10',
  },
});