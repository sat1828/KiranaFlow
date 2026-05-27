import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Surface, Button, Switch, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function DriverHomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.driver.getMyOrders();
      setMyOrders(data.orders || []);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch driver data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activeCount = myOrders.length;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0] || 'Driver'}! 🚀</Text>
        <Text style={styles.title}>Driver Dashboard</Text>
      </View>

      {/* Duty Toggle */}
      <Surface style={styles.dutyCard}>
        <View style={styles.dutyRow}>
          <View>
            <Text style={styles.dutyLabel}>
              {isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
            </Text>
            <Text style={styles.dutySub}>
              {isOnDuty ? 'You are accepting deliveries' : 'Tap to start receiving orders'}
            </Text>
          </View>
          <Switch
            value={isOnDuty}
            onValueChange={() => setIsOnDuty(!isOnDuty)}
            color="#3b82f6"
          />
        </View>
      </Surface>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.statValue}>{history.filter((o: any) => o.status === 'delivered').length}</Text>
          <Text style={styles.statLabel}>Delivered Today</Text>
        </Surface>
      </View>

      {/* Active Orders */}
      <Text style={styles.sectionTitle}>Active Deliveries</Text>
      {myOrders.map((order: any) => (
        <Card
          key={order.id}
          style={styles.orderCard}
          onPress={() => navigation.navigate('DeliveryScreen', { id: order.id })}
        >
          <Card.Content>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderStatus}>{order.status.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.customerName}>{order.customer?.name || 'Customer'}</Text>
            <Text style={styles.customerAddress}>{order.customer?.address || order.deliveryAddress || 'No address'}</Text>
            <View style={styles.orderFooter}>
              {order.totalAmount && (
                <Text style={styles.amount}>₹{Number(order.totalAmount).toFixed(2)}</Text>
              )}
              {order.paymentMethod === 'cod' && (
                <Text style={styles.codBadge}>COD</Text>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}

      {myOrders.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={{ alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🛵</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>No Active Orders</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>You'll see assigned orders here</Text>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="map-marker-path"
          onPress={() => navigation.navigate('BatchMap')}
          style={styles.actionBtn}
        >
          View Route Map
        </Button>
        <Button
          mode="outlined"
          icon="history"
          onPress={() => navigation.navigate('History')}
          style={styles.actionBtn}
        >
          History
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  dutyCard: { padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2 },
  dutyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dutyLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  dutySub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#475569', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  orderCard: { marginBottom: 8, borderRadius: 12, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderNumber: { fontSize: 14, fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' },
  orderStatus: { fontSize: 12, color: '#3b82f6', fontWeight: '600', textTransform: 'capitalize' },
  customerName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  customerAddress: { fontSize: 12, color: '#64748b', marginTop: 2 },
  orderFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  amount: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  codBadge: { fontSize: 11, fontWeight: '600', color: '#f59e0b', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  emptyCard: { borderRadius: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 40 },
  actionBtn: { flex: 1, borderRadius: 12 },
});
