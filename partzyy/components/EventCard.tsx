import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, CATEGORY_SYMBOLS } from '@/constants/theme';
import { Event } from '@/types';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const categoryColor = COLORS.category[event.category];
  const symbol = CATEGORY_SYMBOLS[event.category];
  const spotsLeft = (event.max_guests || 0) - (event.approved_count || 0);

  const initials = event.host_name
    ? event.host_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const formattedDate = format(new Date(event.event_date), 'd MMM');

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.topSection}>
        <View style={[styles.bgOverlay, { backgroundColor: categoryColor.bg }]} />
        <Text style={styles.symbol}>{symbol}</Text>
        {event.cover_image_url && (
          <Image source={{ uri: event.cover_image_url }} style={styles.coverImage} />
        )}
        <View style={styles.gradient} />
        <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              import('react-native').then(({ Share }) => {
                Share.share({
                  message: `Check out ${event.title} on Afterly!`,
                  url: `https://afterly.in/events/${event.id}`
                });
              });
            }}
            style={[styles.topRightBadge, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', position: 'relative', top: 0, right: 0 }]}
          >
            <Text style={styles.badgeText}>Share</Text>
          </TouchableOpacity>
          <View style={[styles.topRightBadge, { backgroundColor: categoryColor.badgeBg, borderColor: categoryColor.border, position: 'relative', top: 0, right: 0 }]}>
            <Text style={styles.badgeText}>
              {event.requires_approval ? '🔒' : '🌐'} {event.requires_approval ? 'Invite only' : 'Open'}
            </Text>
          </View>
        </View>
        {event.college && event.batch && (
          <Text style={styles.bottomLeftText}>
            {event.college} · {event.batch}
          </Text>
        )}
        <View style={styles.bottomRightBadge}>
          {spotsLeft > 0 ? (
            <View style={styles.spotsBadge}>
              <Text style={styles.spotsText}>{spotsLeft} spots left</Text>
            </View>
          ) : (
            <View style={[styles.spotsBadge, styles.fullBadge]}>
              <Text style={[styles.spotsText, styles.fullText]}>Full</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={[styles.price, { color: categoryColor.primary }]}>
            {event.ticket_price === 0 ? 'Free' : `₹${event.ticket_price}`}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>{event.city} · {formattedDate}</Text>
          </View>
          {event.avg_rating && event.avg_rating > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.metaIcon}>⭐</Text>
              <Text style={[styles.metaText, { color: categoryColor.primary }]}>{event.avg_rating}</Text>
            </View>
          )}
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.hostRow}>
            <View style={[styles.avatar, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.avatarText, { color: categoryColor.primary }]}>{initials}</Text>
            </View>
            <Text style={styles.hostName}>{event.host_name}</Text>
            {event.host_verified && <Text style={styles.verifiedIcon}>✓</Text>}
          </View>
          <View style={spotsLeft > 0 ? styles.smallSpotsBadge : styles.smallFullBadge}>
            <Text style={styles.smallSpotsText}>
              {spotsLeft > 0 ? `${spotsLeft}` : 'Full'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
  },
  topSection: {
    height: 190,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  symbol: {
    position: 'absolute',
    fontSize: 90,
    opacity: 0.12,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
    height: 60,
    backgroundColor: 'rgba(14, 14, 16, 0.98)',
  },
  topRightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 9,
    color: COLORS.text.primary,
  },
  bottomLeftText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    fontSize: 11,
    color: '#888',
  },
  bottomRightBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  spotsBadge: {
    backgroundColor: 'rgba(142, 207, 122, 0.2)',
    borderWidth: 0.5,
    borderColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  spotsText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.success,
  },
  fullBadge: {
    backgroundColor: 'rgba(207, 122, 122, 0.2)',
    borderColor: COLORS.danger,
  },
  fullText: {
    color: COLORS.danger,
  },
  bottomSection: {
    padding: 14,
    paddingTop: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  price: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '500',
  },
  hostName: {
    fontSize: 11,
    color: '#888',
  },
  verifiedIcon: {
    fontSize: 12,
    color: '#5ABFCF',
    marginLeft: 2,
  },
  smallSpotsBadge: {
    backgroundColor: 'rgba(142, 207, 122, 0.2)',
    borderWidth: 0.5,
    borderColor: COLORS.success,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallFullBadge: {
    backgroundColor: 'rgba(207, 122, 122, 0.2)',
    borderWidth: 0.5,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallSpotsText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.success,
  },
});