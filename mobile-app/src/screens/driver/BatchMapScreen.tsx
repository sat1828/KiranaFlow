import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { api } from '../../services/api';

export default function BatchMapScreen({ navigation }: any) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBatch, setActiveBatch] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.routes.getBatches();
        setBatches(data.batches || []);
        const active = (data.batches || []).find((b: any) => b.status !== 'completed');
        if (active) setActiveBatch(active);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Route</Text>
      <Text style={styles.subtitle}>Map view with optimized stops</Text>

      {/* Placeholder for Map */}
      <Card style={styles.mapPlaceholder}>
        <Card.Content style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🗺️</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Route Map</Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
            {activeBatch
              ? `${activeBatch.orders?.length || 0} stops • ${activeBatch.totalDistanceKm || '?'} km`
              : 'No active batch'}
          </Text>
        </Card.Content>
      </Card>

      {activeBatch?.orders?.map((oib: any) => (
        <Card key={oib.orderId} style={styles.stopCard}>
          <Card.Content style={styles.stopContent}>
            <View style={styles.stopNum}>
              <Text style={styles.stopNumText}>{oib.stopSequence}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopName}>{oib.order?.customer?.name || 'Customer'}</Text>
              <Text style={styles.stopAddress}>{oib.order?.deliveryAddress || 'Address'}</Text>
            </View>
            <Button mode="outlined" compact style={{ borderRadius: 8 }}
              onPress={() => navigation.navigate('DeliveryScreen', { id: oib.orderId })}
            >
              Deliver
            </Button>
          </Card.Content>
        </Card>
      ))}

      {(!activeBatch || activeBatch.orders?.length === 0) && (
        <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 24 }}>No stops assigned yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', paddingTop: 40 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: 4 },
  mapPlaceholder: { borderRadius: 20, marginBottom: 16, elevation: 2 },
  stopCard: { marginBottom: 8, borderRadius: 12, elevation: 1 },
  stopContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stopNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  stopNumText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  stopName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  stopAddress: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
