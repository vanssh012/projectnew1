import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { COLORS, SPACING, CATEGORY_LABELS, CATEGORY_SYMBOLS } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EventCardSmall } from '@/components/EventCardSmall';
import { AfterlyLogo } from '@/components/AfterlyLogo';
import { router } from 'expo-router';
import type { Category } from '@/constants/theme';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const { events, loading, error, refetch } = useEvents({
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
  });

  const categories: Category[] = ['farewell', 'freshers', 'house_party'];

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [loading]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.header}>
        <AfterlyLogo size={28} showText={false} />
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryPills}
        contentContainerStyle={styles.categoryPillsContent}
      >
        <TouchableOpacity
          style={[styles.pill, !selectedCategory && styles.pillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={!selectedCategory ? styles.pillTextActive : styles.pillText}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, selectedCategory === cat && styles.pillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={selectedCategory === cat ? styles.pillTextActive : styles.pillText}>
              {CATEGORY_SYMBOLS[cat]} {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <Text style={styles.sectionLabel}>featured tonight</Text>

        {loading ? (
          <>
            <Animated.View style={[styles.skeletonCard, { backgroundColor: '#1A1A1E', opacity: fadeAnim }]} />
            <Animated.View style={[styles.skeletonCard, { backgroundColor: '#1A1A1E', opacity: fadeAnim }]} />
          </>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>no events near you yet</Text>
          </View>
        ) : (
          <>
            <EventCard event={events[0]} onPress={() => router.push(`/event/${events[0].id}`)} />

            {events.length > 1 && (
              <>
                <Text style={styles.sectionLabel}>Near you</Text>
                {events.slice(1).map((event) => (
                  <EventCardSmall
                    key={event.id}
                    event={event}
                    onPress={() => router.push(`/event/${event.id}`)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerIcon: {
    fontSize: 20,
  },
  categoryPills: {
    maxHeight: 50,
  },
  categoryPillsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#1A1A1E',
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
  },
  pillActive: {
    backgroundColor: '#F0EEE8',
    borderColor: '#F0EEE8',
  },
  pillText: {
    fontSize: 13,
    color: '#888',
  },
  pillTextActive: {
    fontSize: 13,
    color: '#0E0E10',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  skeletonCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 18,
    height: 270,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
});