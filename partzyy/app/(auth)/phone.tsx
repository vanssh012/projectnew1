import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { COLORS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      });

      if (error) throw error;

      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>We'll send you an OTP to verify</Text>

        <View style={styles.phoneInputContainer}>
          <Text style={styles.countryCode}>🇮🇳 +91</Text>
          <TextInput
            style={styles.input}
            placeholder="9876543210"
            placeholderTextColor={COLORS.text.muted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: phone.length === 10 ? COLORS.text.primary : COLORS.bg.border },
        ]}
        onPress={handleSendOTP}
        disabled={loading || phone.length < 10}
      >
        <Text style={[styles.buttonText, { opacity: loading ? 0.6 : 1 }]}>
          {loading ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.skipText}>Skip authentication</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  countryCode: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
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
  skipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});