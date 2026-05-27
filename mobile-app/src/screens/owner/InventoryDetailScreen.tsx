import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { api } from '../../services/api';

export default function InventoryDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.inventory.list();
        const found = (data.inventory || []).find((i: any) => i.id === id);
        if (found) {
          setItem(found);
          setStock(String(found.currentStock));
          setPrice(String(found.sellingPrice || ''));
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.inventory.update(id, {
        currentStock: parseFloat(stock) || 0,
        sellingPrice: parseFloat(price) || 0,
      });
      setSaved(true);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (!item) return <View style={styles.centered}><Text>Item not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Stock Management</Text>
          <TextInput label="Current Stock ({item.unit})" value={stock}
            onChangeText={setStock} mode="outlined" keyboardType="decimal"
            outlineStyle={{ borderRadius: 12 }} style={styles.input}
          />
          <TextInput label="Selling Price (₹)" value={price}
            onChangeText={setPrice} mode="outlined" keyboardType="decimal"
            outlineStyle={{ borderRadius: 12 }} style={styles.input}
          />
          <Button mode="contained" onPress={handleSave} loading={saving}
            style={{ borderRadius: 12, marginTop: 8 }}>
            Save Changes
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Demand Forecast</Text>
          <Text style={styles.forecastText}>Loading forecast data...</Text>
        </Card.Content>
      </Card>

      <Snackbar visible={saved} onDismiss={() => setSaved(false)} duration={2000}>
        Stock updated successfully!
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 40, marginBottom: 16 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  category: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  input: { backgroundColor: '#ffffff', marginBottom: 8 },
  forecastText: { fontSize: 14, color: '#64748b' },
});
