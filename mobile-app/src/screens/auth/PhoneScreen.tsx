import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { api } from '../../services/api';

export default function PhoneScreen({ navigation, route }: any) {
  const role = route?.params?.role || 'owner';
  const [phone, setPhone] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (p: string) => /^\+\d{10,15}$/.test(p);

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number with country code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.auth.sendOtp(phone);
      navigation.navigate('OTP', { phone, role });
    } catch (err: any) {
      setError(err.message === 'NETWORK_ERROR' ? 'Network error. Please try again.' : err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>Your Phone Number</Text>
        <Text style={styles.subtitle}>
          {role === 'owner' ? 'Enter your WhatsApp number to get started' : 'Enter your phone number to login as driver'}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={(text) => { setPhone(text); setError(''); }}
          placeholder="+919876543210"
          keyboardType="phone-pad"
          mode="outlined"
          outlineStyle={{ borderRadius: 12 }}
          style={styles.input}
          left={<TextInput.Icon icon="phone" />}
        />
        {error ? (
          <HelperText type="error" visible={!!error}>{error}</HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSendOTP}
          loading={loading}
          disabled={loading}
          style={styles.btn}
          contentStyle={{ height: 52 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Send OTP
        </Button>
      </View>

      <Text style={styles.disclaimer}>
        We'll send a one-time password via WhatsApp. Standard rates may apply.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { paddingTop: 40, marginBottom: 32 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 8, lineHeight: 22 },
  form: { flex: 1 },
  input: { backgroundColor: '#ffffff', marginBottom: 8 },
  btn: { borderRadius: 16, marginTop: 16, backgroundColor: '#3b82f6' },
  disclaimer: { textAlign: 'center', fontSize: 12, color: '#94a3b8', paddingBottom: 32 },
});
