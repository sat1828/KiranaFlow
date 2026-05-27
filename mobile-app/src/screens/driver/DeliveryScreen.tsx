import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function DeliveryScreen({ navigation, route }: any) {
  const { id } = route.params;
  const { user } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.orders.get(id);
        setOrder(data.order);
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  const handleDelivered = async () => {
    setMarking(true);
    try {
      await api.driver.markDelivered(user?.id || '', id);
      navigation.goBack();
    } catch {} finally { setMarking(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (!order) return <View style={styles.centered}><Text>Order not found</Text></View>;

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>Delivery</Text>
        <Text style={styles.orderNum}>{order.orderNumber}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>📍 Customer</Text>
          <Text style={styles.customerName}>{order.customer?.name || 'Customer'}</Text>
          <Text style={styles.customerPhone}>{order.customer?.phone || ''}</Text>
          <Text style={styles.address}>{order.deliveryAddress || order.customer?.address || 'No address'}</Text>
          <View style={styles.actionRow}>
            <Button icon="phone" mode="contained" compact style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${order.customer?.phone || ''}`)}
            >
              Call
            </Button>
            <Button icon="whatsapp" mode="contained" compact style={[styles.callBtn, { backgroundColor: '#25D366' }]}
              onPress={() => Linking.openURL(`https://wa.me/${order.customer?.phone?.replace('+', '') || ''}`)}
            >
              WhatsApp
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>📋 Items</Text>
          {items.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.qty} {item.unit || ''}</Text>
            </View>
          ))}
          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmt}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
          </View>
          {order.paymentMethod === 'cod' && (
            <Chip style={{ backgroundColor: '#fef3c7', marginTop: 8 }}
              textStyle={{ color: '#f59e0b', fontWeight: '600' }}>
              Collect ₹{Number(order.totalAmount || 0).toFixed(2)} COD
            </Chip>
          )}
        </Card.Content>
      </Card>

      {/* Delivery Notes */}
      {order.deliveryNotes && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📝 Notes</Text>
            <Text style={styles.notes}>{order.deliveryNotes}</Text>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleDelivered}
        loading={marking}
        style={styles.deliverBtn}
        contentStyle={{ height: 56 }}
        labelStyle={{ fontSize: 18, fontWeight: '700' }}
        icon="check-circle"
      >
        Mark as Delivered
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 40, marginBottom: 16 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  orderNum: { fontSize: 14, color: '#64748b', fontFamily: 'monospace', marginTop: 4 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  customerName: { fontSize: 18, fontWeight: '600', color: '#0f172a' },
  customerPhone: { fontSize: 14, color: '#3b82f6', marginTop: 2 },
  address: { fontSize: 14, color: '#64748b', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  callBtn: { flex: 1, borderRadius: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 14, color: '#0f172a' },
  itemQty: { fontSize: 14, color: '#64748b' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  totalAmt: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  notes: { fontSize: 14, color: '#475569', fontStyle: 'italic' },
  deliverBtn: { borderRadius: 16, backgroundColor: '#10b981', marginTop: 8, marginBottom: 32 },
});
