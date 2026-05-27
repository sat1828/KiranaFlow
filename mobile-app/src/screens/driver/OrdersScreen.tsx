import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, RefreshControl, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function DriverOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.driver.getMyOrders();
      setOrders(data.orders || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <Text style={styles.subtitle}>{orders.length} active deliveries</Text>

      <ScrollView>
        {orders.map((order) => (
          <Card key={order.id} style={styles.card}
            onPress={() => navigation.navigate('DeliveryScreen', { id: order.id })}
          >
            <Card.Content>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNum}>{order.orderNumber}</Text>
                <Chip style={{ backgroundColor: '#dbeafe' }}
                  textStyle={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}
                >
                  {order.status.replace('_', ' ')}
                </Chip>
              </View>
              <Text style={styles.customer}>{order.customer?.name || 'Customer'}</Text>
              <Text style={styles.address} numberOfLines={1}>
                {order.deliveryAddress || order.customer?.address || 'Address not set'}
              </Text>
              <Text style={styles.amount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
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
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', paddingTop: 40 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  card: { marginBottom: 8, borderRadius: 12, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderNum: { fontSize: 14, fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' },
  customer: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  address: { fontSize: 13, color: '#64748b', marginTop: 4 },
  amount: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 8 },
});
