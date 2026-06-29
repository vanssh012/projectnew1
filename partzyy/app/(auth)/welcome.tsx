import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { AfterlyLogo } from '../../components/AfterlyLogo';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.content}>
        <AfterlyLogo size={48} showText={true} />
        <Text style={styles.tagline}>your people. your night.</Text>
        
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

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.skipButtonText}>Continue as Guest</Text>
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
  tagline: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    marginBottom: SPACING.xxl,
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
  skipButton: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});