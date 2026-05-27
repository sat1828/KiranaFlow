import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, RefreshControl, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function DriverHistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api.driver.getMyOrders();
      setHistory(data.history || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchHistory(); }, [fetchHistory]));

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  const delivered = history.filter((o: any) => o.status === 'delivered');
  const totalEarnings = delivered.reduce((s: number, o: any) => s + Number(o.totalAmount || 0), 0);
  const onTimeRate = history.length > 0 ? delivered.length / history.length : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery History</Text>

      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.statValue}>{delivered.length}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.statValue}>₹{totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.statValue}>{(onTimeRate * 100).toFixed(0)}%</Text>
          <Text style={styles.statLabel}>On-Time Rate</Text>
        </Surface>
      </View>

      <ScrollView>
        {history.map((order: any) => (
          <Card key={order.id} style={styles.card}>
            <Card.Content>
              <View style={styles.historyRow}>
                <View>
                  <Text style={styles.orderNum}>{order.orderNumber}</Text>
                  <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.status, { color: order.status === 'delivered' ? '#10b981' : '#ef4444' }]}>
                    {order.status}
                  </Text>
                  <Text style={styles.amount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', paddingTop: 40, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 4 },
  card: { marginBottom: 6, borderRadius: 12, elevation: 1 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderNum: { fontSize: 14, fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' },
  date: { fontSize: 12, color: '#64748b', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  amount: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 4 },
});
