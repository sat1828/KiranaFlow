import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { api, setTokens } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function StoreSetupScreen({ navigation, route }: any) {
  const { setUser } = useAuthStore();
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
  ];

  const handleSubmit = async () => {
    if (!storeName.trim()) {
      setError('Store name is required');
      return;
    }
    setLoading(true);
    try {
      const data = await api.store.updateProfile({
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        address: address.trim(),
        languagePreference: language,
      });
      navigation.reset({ index: 0, routes: [{ name: 'OwnerTabs' }] });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 2 of 2</Text>
        <Text style={styles.title}>Set Up Your Store</Text>
        <Text style={styles.subtitle}>Let's get your store ready for KiranaFlow</Text>
      </View>

      <TextInput label="Store Name *" value={storeName}
        onChangeText={(t) => { setStoreName(t); setError(''); }}
        mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input}
        placeholder="e.g. Rajesh Kirana Store"
      />

      <TextInput label="Your Name" value={ownerName} onChangeText={setOwnerName}
        mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input}
      />

      <TextInput label="Store Address" value={address} onChangeText={setAddress}
        mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input}
        multiline placeholder="Full address with landmark"
      />

      <Text style={styles.langLabel}>Preferred Language</Text>
      <View style={styles.langRow}>
        {languages.map((l) => (
          <Chip key={l.code} selected={language === l.code} onPress={() => setLanguage(l.code)}
            style={styles.langChip}
            showSelectedCheck={false}
          >
            {l.label}
          </Chip>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleSubmit} loading={loading}
        style={styles.btn} contentStyle={{ height: 52 }}
        labelStyle={{ fontSize: 16, fontWeight: '700' }}
      >
        Complete Setup
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { paddingTop: 40, marginBottom: 32 },
  step: { fontSize: 13, color: '#3b82f6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 8 },
  input: { backgroundColor: '#ffffff', marginBottom: 12 },
  langLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 8, marginTop: 8 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  langChip: { borderRadius: 20 },
  error: { color: '#ef4444', fontSize: 14, marginBottom: 12 },
  btn: { borderRadius: 16, backgroundColor: '#3b82f6', marginTop: 8 },
});
