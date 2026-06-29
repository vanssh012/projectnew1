import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, CATEGORY_SYMBOLS } from '@/constants/theme';
import { Event } from '@/types';

interface EventCardSmallProps {
  event: Event;
  onPress: () => void;
}

export function EventCardSmall({ event, onPress }: EventCardSmallProps) {
  const categoryColor = COLORS.category[event.category];
  const symbol = CATEGORY_SYMBOLS[event.category];

  const initials = event.host_name
    ? event.host_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={[styles.leftSection, { backgroundColor: categoryColor.bg }]}>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.meta}>{event.city} · {event.ticket_price === 0 ? 'Free' : `₹${event.ticket_price}`}</Text>
        <View style={styles.footer}>
          <View style={styles.hostRow}>
            <View style={[styles.avatar, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.avatarText, { color: categoryColor.primary }]}>{initials}</Text>
            </View>
            <Text style={styles.hostName}>{event.host_name?.split(' ')[0] || 'Host'}</Text>
          </View>
          <View style={[styles.priceBadge, { backgroundColor: categoryColor.badgeBg, borderColor: categoryColor.primary }]}>
            <Text style={[styles.priceBadgeText, { color: categoryColor.primary }]}>
              {event.ticket_price === 0 ? 'Free' : `₹${event.ticket_price}`}
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
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#1A1A1E',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
  },
  leftSection: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 28,
    opacity: 0.3,
  },
  rightSection: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    paddingRight: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  meta: {
    fontSize: 11,
    color: '#777',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '500',
  },
  hostName: {
    fontSize: 10,
    color: '#777',
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});