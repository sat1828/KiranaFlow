import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function RouteOptimizerScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, driversData] = await Promise.all([
        api.orders.getPending(),
        api.drivers.list(),
      ]);
      setOrders(ordersData.orders || []);
      setDrivers(driversData.drivers || []);
    } catch {} finally {}
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const toggleOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleOptimize = async () => {
    if (selectedOrders.length === 0) { setError('Select at least one order'); return; }
    if (!selectedDriver) { setError('Select a driver'); return; }
    setOptimizing(true);
    setError('');
    try {
      const data = await api.routes.optimize(selectedOrders, selectedDriver);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Optimization failed');
    } finally { setOptimizing(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>Route Optimizer</Text>
        <Text style={styles.subtitle}>Select orders and driver to optimize delivery route</Text>
      </View>

      {/* Driver Selection */}
      <Text style={styles.sectionTitle}>Select Driver</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.driverRow}>
        {drivers.filter((d) => d.isOnDuty).map((driver) => (
          <Chip
            key={driver.id}
            selected={selectedDriver === driver.id}
            onPress={() => setSelectedDriver(driver.id)}
            style={styles.driverChip}
            avatar={<Text>{driver.vehicleType === 'motorcycle' ? '🛵' : '🚲'}</Text>}
          >
            {driver.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Pending Orders */}
      <Text style={styles.sectionTitle}>Select Orders ({selectedOrders.length})</Text>
      {orders.map((order) => (
        <Card key={order.id} style={[styles.orderCard, selectedOrders.includes(order.id) && styles.selectedCard]}
          onPress={() => toggleOrder(order.id)}
        >
          <Card.Content style={styles.orderContent}>
            <View>
              <Text style={styles.orderNum}>{order.orderNumber}</Text>
              <Text style={styles.customer}>{order.customer?.name || 'Customer'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
              <Text style={styles.address} numberOfLines={1}>{order.deliveryAddress || 'No address'}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleOptimize} loading={optimizing}
        style={styles.optimizeBtn} contentStyle={{ height: 52 }}
        labelStyle={{ fontSize: 16, fontWeight: '700' }}
        icon="map-marker-path"
      >
        Optimize Route
      </Button>

      {result && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultTitle}>✅ Route Optimized!</Text>
            <Text style={styles.resultInfo}>📍 {result.batch.waypoints.length} stops</Text>
            <Text style={styles.resultInfo}>📏 {result.batch.totalDistanceKm} km total</Text>
            <Text style={styles.resultInfo}>⏱️ ~{result.batch.estimatedDurationMin} minutes</Text>
            <Button mode="contained" icon="play" style={{ borderRadius: 12, marginTop: 12 }}
              onPress={() => navigation.navigate('Orders')}
            >
              Start Delivery
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { paddingTop: 40, marginBottom: 16 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  driverRow: { marginBottom: 16 },
  driverChip: { marginRight: 8, borderRadius: 20 },
  orderCard: { marginBottom: 6, borderRadius: 12, elevation: 1 },
  selectedCard: { borderColor: '#3b82f6', borderWidth: 2, backgroundColor: '#dbeafe' },
  orderContent: { flexDirection: 'row', justifyContent: 'space-between' },
  orderNum: { fontSize: 14, fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' },
  customer: { fontSize: 13, color: '#64748b', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  address: { fontSize: 11, color: '#94a3b8', marginTop: 2, maxWidth: 150 },
  error: { color: '#ef4444', fontSize: 14, marginVertical: 8 },
  optimizeBtn: { borderRadius: 16, backgroundColor: '#8b5cf6', marginTop: 16 },
  resultCard: { marginTop: 16, borderRadius: 16, backgroundColor: '#d1fae5', elevation: 2 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#065f46', marginBottom: 8 },
  resultInfo: { fontSize: 14, color: '#065f46', marginBottom: 4 },
});
