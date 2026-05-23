import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.header}>
        <Text style={styles.appName}>partzyy</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.icon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryPills}
        contentContainerStyle={styles.categoryPillsContent}
      >
        <TouchableOpacity style={[styles.pill, styles.pillActive]}>
          <Text style={styles.pillTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>✦ Farewell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>◈ Freshers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>◉ House Party</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Featured tonight</Text>
        
        <View style={[styles.featuredCard, { backgroundColor: COLORS.bg.surface }]}>
          <View style={[styles.cardImage, { backgroundColor: COLORS.category.farewell.bg }]} />
          <View style={styles.cardContent}>
            <Text style={styles.eventTitle}>Golden Memories Farewell</Text>
            <Text style={[styles.eventPrice, { color: COLORS.category.farewell.primary }]}>₹299</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>📍 IIT Delhi • 23 May</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>⭐ 4.8 (124 reviews)</Text>
            </View>
            <View style={styles.hostRow}>
              <View style={[styles.hostAvatar, { backgroundColor: COLORS.category.farewell.primary }]}>
                <Text style={styles.avatarText}>AB</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hostName}>Arjun Bhat ✓</Text>
                <Text style={styles.hostMeta}>Hosted 8 events • 4.9★</Text>
              </View>
              <Text style={styles.spotsText}>12 spots</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Near you</Text>
        
        {[1, 2].map((i) => (
          <View key={i} style={[styles.compactCard, { backgroundColor: COLORS.bg.surface }]}>
            <View style={[styles.compactImage, { backgroundColor: COLORS.category.freshers.bg }]} />
            <View style={styles.compactContent}>
              <Text style={styles.eventTitle}>Freshers Welcome 2024</Text>
              <Text style={styles.meta}>📍 DTU • 25 May</Text>
              <View style={styles.hostRow}>
                <View style={[styles.smallAvatar, { backgroundColor: COLORS.category.freshers.primary }]}>
                  <Text style={[styles.avatarText, { fontSize: 10 }]}>CD</Text>
                </View>
                <Text style={[styles.hostName, { fontSize: 12 }]}>Chloe Davis</Text>
              </View>
            </View>
            <Text style={[styles.eventPrice, { color: COLORS.category.freshers.primary }]}>Free</Text>
          </View>
        ))}
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
  appName: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  icon: {
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
    backgroundColor: COLORS.bg.elevated,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  pillActive: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  pillText: {
    fontSize: 13,
    color: '#BBB',
  },
  pillTextActive: {
    fontSize: 13,
    color: COLORS.bg.primary,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  featuredCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
  },
  cardImage: {
    height: 190,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  eventPrice: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  metaRow: {
    marginBottom: SPACING.sm,
  },
  meta: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.bg.primary,
  },
  hostName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  hostMeta: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  spotsText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text.muted,
  },
  compactCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
  },
  compactImage: {
    width: 72,
    height: 72,
  },
  compactContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
});