import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

const TABS = ['pending', 'in_progress', 'completed', 'cancelled'];

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: { name: string; phone: string };
  driver: { name: string } | null;
  totalAmount: number;
  createdAt: string;
}

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const statusFilter = tab === 'in_progress'
        ? 'status=assigned&status=picked_up&status=in_transit'
        : tab === 'completed'
        ? 'status=delivered'
        : tab === 'cancelled'
        ? 'status=cancelled'
        : 'status=pending&status=confirmed';
      const data = await api.orders.list(statusFilter);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customer?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in_transit': case 'picked_up': return '#3b82f6';
      case 'assigned': case 'confirmed': return '#f59e0b';
      case 'pending': return '#94a3b8';
      case 'cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.subtitle}>{total} total orders</Text>

      <Searchbar
        placeholder="Search orders or customer..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'Active' },
          { value: 'completed', label: 'Done' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        style={styles.tabs}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { id: order.id })}
            >
              <Card.Content>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Chip
                    style={{ backgroundColor: getStatusColor(order.status) + '20' }}
                    textStyle={{ color: getStatusColor(order.status), fontSize: 11, fontWeight: '600' }}
                  >
                    {order.status.replace('_', ' ')}
                  </Chip>
                </View>
                <View style={styles.orderBody}>
                  <View>
                    <Text style={styles.customerName}>{order.customer?.name || 'Unknown'}</Text>
                    <Text style={styles.customerPhone}>{order.customer?.phone || ''}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.amount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
                    {order.driver && (
                      <Text style={styles.driverName}>Driver: {order.driver.name}</Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <Text style={styles.empty}>No orders found</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  search: { marginBottom: 12, borderRadius: 12, backgroundColor: '#ffffff', elevation: 1 },
  tabs: { marginBottom: 16 },
  orderCard: { marginBottom: 8, borderRadius: 12, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 14, fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  customerName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  customerPhone: { fontSize: 12, color: '#64748b', marginTop: 2 },
  orderMeta: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  driverName: { fontSize: 11, color: '#64748b', marginTop: 2 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15 },
});
