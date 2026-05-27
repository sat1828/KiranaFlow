import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, Divider, Portal, Dialog, RadioButton } from 'react-native-paper';
import { api } from '../../services/api';

const STATUS_ACTIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['picked_up', 'cancelled'],
  picked_up: ['in_transit'],
  in_transit: ['delivered'],
};

export default function OrderDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await api.orders.get(id);
      setOrder(data.order);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setUpdating(true);
    try {
      const data = await api.orders.updateStatus(id, selectedStatus);
      setOrder(data.order);
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Order not found</Text>
      </View>
    );
  }

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  const availableActions = STATUS_ACTIONS[order.status] || [];
  const statusColor: Record<string, string> = {
    pending: '#94a3b8', confirmed: '#f59e0b', assigned: '#f59e0b',
    picked_up: '#3b82f6', in_transit: '#3b82f6', delivered: '#10b981', cancelled: '#ef4444',
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
          <Text style={styles.title}>Order {order.orderNumber}</Text>
          <Chip
            style={{ backgroundColor: (statusColor[order.status] || '#94a3b8') + '20', alignSelf: 'flex-start' }}
            textStyle={{ color: statusColor[order.status] || '#94a3b8', fontWeight: '600' }}
          >
            {order.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>

        {/* Customer Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Customer Details</Text>
            <Text style={styles.label}>Name: {order.customer?.name || 'Unknown'}</Text>
            <Text style={styles.label}>Phone: {order.customer?.phone || '-'}</Text>
            <Text style={styles.label}>Address: {order.deliveryAddress || order.customer?.address || '-'}</Text>
          </Card.Content>
        </Card>

        {/* Items */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Order Items</Text>
            {items.map((item: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.qty} {item.unit || ''}</Text>
                {item.price && <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>}
              </View>
            ))}
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
            </View>
            <Text style={styles.paymentLabel}>Payment: {order.paymentMethod?.toUpperCase() || 'COD'}</Text>
          </Card.Content>
        </Card>

        {/* Driver Info */}
        {order.driver && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Assigned Driver</Text>
              <Text style={styles.label}>Name: {order.driver.name}</Text>
              <Text style={styles.label}>Phone: {order.driver.phone || '-'}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        {availableActions.length > 0 && (
          <View style={styles.actions}>
            {availableActions.map((action) => (
              <Button
                key={action}
                mode="contained"
                onPress={() => {
                  if (action === 'cancelled') {
                    setSelectedStatus(action);
                    setShowStatusDialog(true);
                  } else {
                    setSelectedStatus(action);
                    handleStatusUpdate();
                  }
                }}
                style={[
                  styles.actionBtn,
                  action === 'cancelled' ? { backgroundColor: '#ef4444' } : null,
                  action === 'delivered' ? { backgroundColor: '#10b981' } : null,
                ]}
                loading={updating}
              >
                Mark as {action.replace('_', ' ')}
              </Button>
            ))}
          </View>
        )}

        {/* Timeline */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Timeline</Text>
            <Text style={styles.timelineItem}>Created: {new Date(order.createdAt).toLocaleString()}</Text>
            {order.deliveredAt && (
              <Text style={styles.timelineItem}>Delivered: {new Date(order.deliveredAt).toLocaleString()}</Text>
            )}
            {order.cancellationReason && (
              <Text style={styles.timelineItem}>Reason: {order.cancellationReason}</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={showStatusDialog} onDismiss={() => setShowStatusDialog(false)}>
          <Dialog.Title>Cancel Order</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to cancel this order? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowStatusDialog(false)}>No</Button>
            <Button onPress={handleStatusUpdate} textColor="#ef4444" loading={updating}>Yes, Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { marginBottom: 20, paddingTop: 40 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  label: { fontSize: 14, color: '#475569', marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 14, color: '#0f172a', flex: 1 },
  itemQty: { fontSize: 14, color: '#64748b', marginHorizontal: 12 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  totalAmount: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  paymentLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  actionBtn: { flex: 1, borderRadius: 12, minWidth: '45%' },
  timelineItem: { fontSize: 13, color: '#64748b', marginBottom: 4 },
});
