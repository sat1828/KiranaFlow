import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Surface, Chip, FAB, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function DriversScreen({ navigation }: any) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '+91', vehicleType: 'motorcycle' });
  const [adding, setAdding] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await api.drivers.list();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDrivers(); }, [fetchDrivers]));

  const toggleDuty = async (id: string) => {
    try { await api.drivers.toggleDuty(id); fetchDrivers(); }
    catch {}
  };

  const addDriver = async () => {
    if (!newDriver.name || !newDriver.phone) return;
    setAdding(true);
    try {
      await api.drivers.create(newDriver);
      setShowAdd(false);
      setNewDriver({ name: '', phone: '+91', vehicleType: 'motorcycle' });
      fetchDrivers();
    } catch (error: any) {
      console.error(error.message);
    } finally { setAdding(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drivers</Text>
      <Text style={styles.subtitle}>{drivers.length} total drivers</Text>

      <ScrollView>
        {drivers.map((driver) => (
          <Card key={driver.id} style={styles.card}
            onPress={() => navigation.navigate('DriverDetail', { id: driver.id })}
          >
            <Card.Content>
              <View style={styles.driverHeader}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <Text style={styles.driverPhone}>{driver.phone}</Text>
                  <Text style={styles.driverVehicle}>🛵 {driver.vehicleType}</Text>
                </View>
                <View style={styles.driverStatus}>
                  <Chip
                    style={{ backgroundColor: driver.isOnDuty ? '#d1fae5' : '#f1f5f9' }}
                    textStyle={{ color: driver.isOnDuty ? '#10b981' : '#94a3b8', fontSize: 11, fontWeight: '600' }}
                  >
                    {driver.isOnDuty ? 'On Duty' : 'Off Duty'}
                  </Chip>
                  {driver._count?.orders > 0 && (
                    <Text style={styles.orderCount}>{driver._count.orders} active</Text>
                  )}
                </View>
              </View>
              <Button
                mode={driver.isOnDuty ? 'outlined' : 'contained'}
                onPress={() => toggleDuty(driver.id)}
                style={{ borderRadius: 8, marginTop: 8 }}
                compact
                textColor={driver.isOnDuty ? '#f59e0b' : undefined}
              >
                {driver.isOnDuty ? 'Mark Off Duty' : 'Mark On Duty'}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowAdd(true)}
        color="#ffffff" />

      <Portal>
        <Dialog visible={showAdd} onDismiss={() => setShowAdd(false)}>
          <Dialog.Title>Add Driver</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={newDriver.name}
              onChangeText={(t) => setNewDriver({ ...newDriver, name: t })}
              mode="outlined" style={{ marginBottom: 8 }}
            />
            <TextInput label="Phone" value={newDriver.phone}
              onChangeText={(t) => setNewDriver({ ...newDriver, phone: t })}
              mode="outlined" keyboardType="phone-pad" style={{ marginBottom: 8 }}
            />
            <TextInput label="Vehicle Type" value={newDriver.vehicleType}
              onChangeText={(t) => setNewDriver({ ...newDriver, vehicleType: t })}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAdd(false)}>Cancel</Button>
            <Button onPress={addDriver} loading={adding}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  card: { marginBottom: 8, borderRadius: 12, elevation: 1 },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  driverPhone: { fontSize: 13, color: '#64748b', marginTop: 2 },
  driverVehicle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  driverStatus: { alignItems: 'flex-end' },
  orderCount: { fontSize: 11, color: '#64748b', marginTop: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#3b82f6' },
});
