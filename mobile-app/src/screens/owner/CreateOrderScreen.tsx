import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Chip, Divider, HelperText, Snackbar } from 'react-native-paper';
import { api } from '../../services/api';

export default function CreateOrderScreen({ navigation }: any) {
  const [customerPhone, setCustomerPhone] = useState('+91');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [items, setItems] = useState<Array<{ name: string; qty: string; unit: string; price: string }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('piece');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([...items, {
      name: newItemName.trim(),
      qty: newItemQty || '1',
      unit: newItemUnit,
      price: newItemPrice || '0',
    }]);
    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Add at least one item');
      return;
    }
    if (!customerPhone || customerPhone === '+91') {
      setError('Customer phone is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        customerPhone,
        customerName: customerName || undefined,
        deliveryAddress: deliveryAddress || undefined,
        deliveryNotes: deliveryNotes || undefined,
        items: items.map((i) => ({
          name: i.name,
          qty: parseFloat(i.qty) || 1,
          unit: i.unit,
          price: parseFloat(i.price) || 0,
        })),
        subtotal: items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 1), 0),
        source: 'app',
      };

      await api.orders.create(orderData);
      setSuccess('Order created successfully!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.title}>Create Order</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Customer</Text>
          <TextInput label="Phone *" value={customerPhone} onChangeText={setCustomerPhone}
            mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input} keyboardType="phone-pad"
          />
          <TextInput label="Name" value={customerName} onChangeText={setCustomerName}
            mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input}
          />
          <TextInput label="Delivery Address" value={deliveryAddress} onChangeText={setDeliveryAddress}
            mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input} multiline
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Items</Text>

          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
              <Text style={styles.itemPrice}>₹{(parseFloat(item.price) * parseFloat(item.qty)).toFixed(2)}</Text>
              <Chip onPress={() => removeItem(idx)} style={{ backgroundColor: '#fee2e2' }}
                textStyle={{ color: '#ef4444', fontSize: 11 }}>✕</Chip>
            </View>
          ))}

          <Divider style={{ marginVertical: 12 }} />

          <TextInput label="Item Name" value={newItemName} onChangeText={setNewItemName}
            mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input}
          />
          <View style={styles.addRow}>
            <TextInput label="Qty" value={newItemQty} onChangeText={setNewItemQty}
              mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.smallInput} keyboardType="decimal"
            />
            <TextInput label="Unit" value={newItemUnit} onChangeText={setNewItemUnit}
              mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.smallInput}
            />
            <TextInput label="Price" value={newItemPrice} onChangeText={setNewItemPrice}
              mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.smallInput} keyboardType="decimal"
            />
          </View>
          <Button mode="outlined" onPress={addItem} style={{ borderRadius: 12 }} icon="plus">
            Add Item
          </Button>
        </Card.Content>
      </Card>

      <TextInput label="Delivery Notes" value={deliveryNotes} onChangeText={setDeliveryNotes}
        mode="outlined" outlineStyle={{ borderRadius: 12 }} style={styles.input} multiline
      />

      {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit} loading={loading}
        style={styles.submitBtn} contentStyle={{ height: 52 }}
        labelStyle={{ fontSize: 16, fontWeight: '700' }}
      >
        Create Order
      </Button>

      <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={2000}>
        {success}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { paddingTop: 40, marginBottom: 16 },
  backBtn: { fontSize: 16, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  input: { backgroundColor: '#ffffff', marginBottom: 8 },
  smallInput: { backgroundColor: '#ffffff', marginBottom: 8, flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  itemName: { flex: 1, fontSize: 14, color: '#0f172a' },
  itemQty: { fontSize: 13, color: '#64748b' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  addRow: { flexDirection: 'row', gap: 8 },
  submitBtn: { borderRadius: 16, backgroundColor: '#3b82f6', marginVertical: 20 },
});
