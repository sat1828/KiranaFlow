import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function AnalyticsScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');

  const fetchAnalytics = useCallback(async () => {
    try {
      const start = new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000).toISOString();
      const result = await api.store.getAnalytics(start, new Date().toISOString());
      setData(result);
    } catch {} finally { setLoading(false); }
  }, [range]);

  useFocusEffect(useCallback(() => { fetchAnalytics(); }, [fetchAnalytics]));

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.rangeRow}>
          {['7', '30', '90'].map((d) => (
            <Button key={d} mode={range === d ? 'contained' : 'outlined'}
              onPress={() => setRange(d)} compact style={{ borderRadius: 20, marginRight: 8 }}>
              {d}{d === '7' ? '' : ''}d
            </Button>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.statValue}>{data?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.statValue}>{data?.deliveredOrders || 0}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.statValue}>{data?.cancelledOrders || 0}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.statValue}>₹{(data?.totalRevenue || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </Surface>
      </View>

      {data?.topProducts?.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🏆 Top Products</Text>
            {data.topProducts.slice(0, 5).map((p: any, idx: number) => (
              <View key={idx} style={styles.productRow}>
                <Text style={styles.rank}>{idx + 1}.</Text>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.productQty}>{p.quantity} sold</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {data?.metrics?.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📈 Daily Metrics</Text>
            {data.metrics.slice(-7).reverse().map((m: any, idx: number) => (
              <View key={idx} style={styles.metricRow}>
                <Text style={styles.metricDate}>{new Date(m.metricDate).toLocaleDateString()}</Text>
                <Text style={styles.metricOrders}>{m.totalOrders} orders</Text>
                <Text style={styles.metricRevenue}>₹{Number(m.totalRevenue).toLocaleString()}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" icon="chart-bar" style={styles.reportBtn}
        onPress={() => {}}
      >
        Download Full Report
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 40, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  rangeRow: { flexDirection: 'row', marginTop: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#475569', marginTop: 4 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rank: { fontSize: 14, fontWeight: '600', color: '#64748b', width: 24 },
  productName: { flex: 1, fontSize: 14, color: '#0f172a' },
  productQty: { fontSize: 13, color: '#64748b' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  metricDate: { fontSize: 13, color: '#64748b', flex: 1 },
  metricOrders: { fontSize: 13, color: '#0f172a', fontWeight: '500', flex: 1, textAlign: 'center' },
  metricRevenue: { fontSize: 13, color: '#0f172a', fontWeight: '600', flex: 1, textAlign: 'right' },
  reportBtn: { borderRadius: 16, marginTop: 8, marginBottom: 32 },
});
