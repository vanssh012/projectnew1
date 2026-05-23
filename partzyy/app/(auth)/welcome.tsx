import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.content}>
        <Text style={styles.logo}>partzyy</Text>
        <Text style={styles.tagline}>Your next unforgettable night, one tap away</Text>
        
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryCard, { borderColor: COLORS.category.farewell.primary }]}>
            <Text style={[styles.categorySymbol, { color: COLORS.category.farewell.primary }]}>✦</Text>
            <Text style={styles.categoryName}>Farewell</Text>
          </View>
          <View style={[styles.categoryCard, { borderColor: COLORS.category.freshers.primary }]}>
            <Text style={[styles.categorySymbol, { color: COLORS.category.freshers.primary }]}>◈</Text>
            <Text style={styles.categoryName}>Freshers</Text>
          </View>
          <View style={[styles.categoryCard, { borderColor: COLORS.category.house_party.primary }]}>
            <Text style={[styles.categorySymbol, { color: COLORS.category.house_party.primary }]}>◉</Text>
            <Text style={styles.categoryName}>House Party</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: COLORS.text.primary }]}
        onPress={() => router.push('/(auth)/phone')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 48,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 24,
  },
  categoryContainer: {
    gap: SPACING.md,
    width: '100%',
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.bg.surface,
  },
  categorySymbol: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  button: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.bg.primary,
  },
});