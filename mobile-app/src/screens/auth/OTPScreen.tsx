import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { api, setTokens } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function OTPScreen({ navigation, route }: any) {
  const { phone, role } = route.params;
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.auth.verifyOtp(phone, otpCode, undefined, role);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user, data.accessToken, data.refreshToken);

      if (role === 'driver') {
        navigation.reset({ index: 0, routes: [{ name: 'DriverTabs' }] });
      } else if (!data.user.storeName || data.user.storeName === 'Store ' + phone.slice(-4)) {
        navigation.reset({ index: 0, routes: [{ name: 'StoreSetup' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'OwnerTabs' }] });
      }
    } catch (err: any) {
      if (err.message === 'Invalid OTP') {
        setError('Invalid OTP. Please try again.');
      } else {
        setError(err.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setCountdown(30);
    try {
      await api.auth.sendOtp(phone);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We've sent a 6-digit code to {phone}</Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? (
        <HelperText type="error" visible={!!error} style={{ textAlign: 'center' }}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={() => verifyOtp()}
        loading={loading}
        disabled={loading}
        style={styles.btn}
        contentStyle={{ height: 52 }}
        labelStyle={{ fontSize: 16, fontWeight: '700' }}
      >
        Verify OTP
      </Button>

      <View style={styles.resend}>
        {countdown > 0 ? (
          <Text style={styles.resendText}>Resend code in {countdown}s</Text>
        ) : (
          <Button mode="text" onPress={resendOTP} labelStyle={{ fontSize: 14, color: '#3b82f6' }}>
            Resend OTP
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { paddingTop: 40, marginBottom: 40 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 8 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 32 },
  otpInput: {
    width: 52, height: 58, borderRadius: 14, borderWidth: 2, borderColor: '#e2e8f0',
    backgroundColor: '#ffffff', textAlign: 'center', fontSize: 24, fontWeight: '700',
    color: '#0f172a',
  },
  otpInputFilled: { borderColor: '#3b82f6', backgroundColor: '#dbeafe' },
  btn: { borderRadius: 16, backgroundColor: '#3b82f6', marginBottom: 16 },
  resend: { alignItems: 'center' },
  resendText: { fontSize: 14, color: '#94a3b8' },
});
