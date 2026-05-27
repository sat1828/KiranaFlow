import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Surface, Chip, Searchbar, FAB, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function InventoryScreen({ navigation }: any) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newItem, setNewItem] = useState({ name: '', category: '', unit: 'piece', currentStock: '0', sellingPrice: '' });
  const [adding, setAdding] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const params = filter === 'low' ? 'lowStock=true' : `search=${search}`;
      const data = await api.inventory.list(params);
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally { setLoading(false); }
  }, [search, filter]);

  useFocusEffect(useCallback(() => { fetchInventory(); }, [fetchInventory]));

  const addItem = async () => {
    if (!newItem.name) return;
    setAdding(true);
    try {
      await api.inventory.create({
        ...newItem,
        currentStock: parseFloat(newItem.currentStock) || 0,
        sellingPrice: parseFloat(newItem.sellingPrice) || 0,
      });
      setShowAdd(false);
      setNewItem({ name: '', category: '', unit: 'piece', currentStock: '0', sellingPrice: '' });
      fetchInventory();
    } catch { } finally { setAdding(false); }
  };

  const getStockColor = (item: any) => {
    if (item.stockStatus === 'out_of_stock') return '#ef4444';
    if (item.stockStatus === 'critical') return '#f59e0b';
    if (item.stockStatus === 'low') return '#f97316';
    return '#10b981';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.subtitle}>{inventory.length} items</Text>

      <Searchbar placeholder="Search items..." value={search} onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {['all', 'low'].map((f) => (
          <Chip key={f} selected={filter === f} onPress={() => setFilter(f)}
            style={{ marginRight: 8 }}>{f === 'all' ? 'All Items' : 'Low Stock'}</Chip>
        ))}
      </View>

      <ScrollView>
        {inventory.map((item) => (
          <Card key={item.id} style={styles.card}
            onPress={() => navigation.navigate('InventoryDetail', { id: item.id })}
          >
            <Card.Content>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.stockValue, { color: getStockColor(item) }]}>
                    {Number(item.currentStock).toFixed(1)} {item.unit}
                  </Text>
                  {item.sellingPrice && (
                    <Text style={styles.price}>₹{Number(item.sellingPrice).toFixed(2)}/{item.unit}</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowAdd(true)} color="#ffffff" />

      <Portal>
        <Dialog visible={showAdd} onDismiss={() => setShowAdd(false)}>
          <Dialog.Title>Add Item</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={newItem.name}
              onChangeText={(t) => setNewItem({ ...newItem, name: t })} mode="outlined" style={{ marginBottom: 8 }}
            />
            <TextInput label="Category" value={newItem.category}
              onChangeText={(t) => setNewItem({ ...newItem, category: t })} mode="outlined" style={{ marginBottom: 8 }}
            />
            <TextInput label="Stock" value={newItem.currentStock}
              onChangeText={(t) => setNewItem({ ...newItem, currentStock: t })}
              mode="outlined" keyboardType="decimal" style={{ marginBottom: 8 }}
            />
            <TextInput label="Price" value={newItem.sellingPrice}
              onChangeText={(t) => setNewItem({ ...newItem, sellingPrice: t })}
              mode="outlined" keyboardType="decimal"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAdd(false)}>Cancel</Button>
            <Button onPress={addItem} loading={adding}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 12, marginTop: 2 },
  search: { marginBottom: 12, borderRadius: 12, backgroundColor: '#ffffff', elevation: 1 },
  filterRow: { flexDirection: 'row', marginBottom: 12 },
  card: { marginBottom: 6, borderRadius: 12, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  itemCategory: { fontSize: 12, color: '#64748b', marginTop: 2 },
  stockValue: { fontSize: 16, fontWeight: '700' },
  price: { fontSize: 12, color: '#64748b', marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#3b82f6' },
});
