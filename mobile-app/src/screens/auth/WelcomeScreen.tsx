import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Surface style={styles.logoContainer}>
          <Text style={styles.logoText}>KF</Text>
        </Surface>
        <Text style={styles.appName}>KiranaFlow</Text>
        <Text style={styles.tagline}>Your Store, Delivered Smarter</Text>
      </View>

      <View style={styles.featureSection}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📱</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>WhatsApp Orders</Text>
            <Text style={styles.featureDesc}>Auto-capture orders from WhatsApp</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🛵</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Route Optimization</Text>
            <Text style={styles.featureDesc}>AI-powered delivery routes</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📊</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Analytics & Insights</Text>
            <Text style={styles.featureDesc}>Understand your business better</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🤖</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>AI Forecasting</Text>
            <Text style={styles.featureDesc}>Predict demand with Claude AI</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Phone', { role: 'owner' })}
          style={styles.primaryBtn}
          contentStyle={{ height: 52 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Continue as Store Owner
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Phone', { role: 'driver' })}
          style={styles.secondaryBtn}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 15, fontWeight: '600' }}
        >
          I'm a Delivery Driver
        </Button>
        <Text style={styles.footer}>Powering 14M+ kirana stores across India</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'space-between' },
  topSection: { alignItems: 'center', paddingTop: 60 },
  logoContainer: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center',
    elevation: 8, marginBottom: 16,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: '#ffffff' },
  appName: { fontSize: 34, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: '#64748b', marginTop: 8 },
  featureSection: { paddingVertical: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  featureIcon: { fontSize: 28, marginRight: 16, width: 40 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  featureDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  buttonSection: { paddingBottom: 32 },
  primaryBtn: { borderRadius: 16, marginBottom: 12, backgroundColor: '#3b82f6' },
  secondaryBtn: { borderRadius: 16, borderColor: '#3b82f6', marginBottom: 16 },
  footer: { textAlign: 'center', fontSize: 12, color: '#94a3b8' },
});
