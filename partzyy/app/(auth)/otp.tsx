import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { COLORS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${params.phone}`,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We sent a code to +91{params.phone}</Text>

        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={COLORS.text.muted}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.resendText}>Didn't receive? Resend OTP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: otp.length === 6 ? COLORS.text.primary : COLORS.bg.border },
        ]}
        onPress={handleVerifyOTP}
        disabled={loading || otp.length < 6}
      >
        <Text style={[styles.buttonText, { opacity: loading ? 0.6 : 1 }]}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </Text>
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
  input: {
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: COLORS.bg.border,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 20,
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: SPACING.lg,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.category.freshers.primary,
    textAlign: 'center',
    fontWeight: '500',
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