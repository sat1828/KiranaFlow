import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, ActivityIndicator, Button } from 'react-native-paper';
import { api } from '../../services/api';

export default function DriverDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [historyData] = await Promise.all([api.drivers.getHistory(id)]);
        setData(historyData);
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (!data) return <View style={styles.centered}><Text>Driver not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Surface style={styles.avatar}>
          <Text style={styles.avatarText}>{data.driver.name?.charAt(0) || 'D'}</Text>
        </Surface>
        <Text style={styles.name}>{data.driver.name}</Text>
        <Text style={styles.phone}>{data.driver.phone}</Text>
        <Text style={styles.vehicle}>🛵 {data.driver.vehicleType}</Text>
      </View>

      <View style={styles.statsRow}>
        <Surface style={[styles.stat, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.statValue}>{data.stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Surface>
        <Surface style={[styles.stat, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.statValue}>{data.stats.totalDelivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </Surface>
        <Surface style={[styles.stat, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.statValue}>₹{data.stats.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </Surface>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 40, marginBottom: 24 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  phone: { fontSize: 14, color: '#64748b', marginTop: 4 },
  vehicle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 4 },
});
