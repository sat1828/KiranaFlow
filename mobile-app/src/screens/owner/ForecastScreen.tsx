import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function ForecastScreen({ navigation }: any) {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchForecasts = useCallback(async () => {
    try {
      const data = await api.ai.getForecast();
      setForecasts(data.forecasts || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchForecasts(); }, [fetchForecasts]));

  const generateForecast = async () => {
    setGenerating(true);
    try {
      await api.ai.runForecast();
      setTimeout(() => fetchForecasts(), 3000);
    } catch {} finally { setGenerating(false); }
  };

  const getUrgencyColor = (u: string) => {
    switch (u) {
      case 'critical': return { bg: '#fee2e2', text: '#ef4444' };
      case 'high': return { bg: '#fef3c7', text: '#f59e0b' };
      case 'medium': return { bg: '#dbeafe', text: '#3b82f6' };
      default: return { bg: '#d1fae5', text: '#10b981' };
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Demand Forecast</Text>
        <Text style={styles.subtitle}>7-day prediction powered by Claude AI</Text>
        <Button mode="contained" icon="refresh" onPress={generateForecast} loading={generating}
          style={{ borderRadius: 12, marginTop: 12 }}>
          Generate Forecast
        </Button>
      </View>

      {forecasts.map((f, idx) => {
        const uc = getUrgencyColor(f.urgency);
        return (
          <Card key={idx} style={styles.card}>
            <Card.Content>
              <View style={styles.forecastHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{f.productName}</Text>
                  <Text style={styles.category}>{f.category}</Text>
                </View>
                <Chip style={{ backgroundColor: uc.bg }}
                  textStyle={{ color: uc.text, fontWeight: '600', fontSize: 11 }}>
                  {f.urgency}
                </Chip>
              </View>

              <View style={styles.stockRow}>
                <Surface style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Current</Text>
                  <Text style={styles.stockValue}>{Number(f.currentStock).toFixed(1)}</Text>
                </Surface>
                <Surface style={[styles.stockBox, { backgroundColor: '#fef3c7' }]}>
                  <Text style={styles.stockLabel}>Predicted 7d</Text>
                  <Text style={[styles.stockValue, { color: '#f59e0b' }]}>{f.totalPredicted}</Text>
                </Surface>
                <Surface style={[styles.stockBox, { backgroundColor: '#dbeafe' }]}>
                  <Text style={styles.stockLabel}>Confidence</Text>
                  <Text style={[styles.stockValue, { color: '#3b82f6' }]}>
                    {f.confidence ? `${(f.confidence * 100).toFixed(0)}%` : '-'}
                  </Text>
                </Surface>
              </View>

              {f.reasoning && (
                <Text style={styles.reasoning}>🤖 {f.reasoning}</Text>
              )}

              <Button mode="outlined" icon="whatsapp" style={{ borderRadius: 12, marginTop: 8 }}>
                Order from Supplier
              </Button>
            </Card.Content>
          </Card>
        );
      })}

      {forecasts.length === 0 && (
        <Card style={{ borderRadius: 16, padding: 24, marginTop: 20 }}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🤖</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>No forecasts yet</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
              Tap "Generate Forecast" to get AI-powered demand predictions for the next 7 days
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 40, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  forecastHeader: { flexDirection: 'row', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  category: { fontSize: 12, color: '#64748b', marginTop: 2 },
  stockRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stockBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', elevation: 1 },
  stockLabel: { fontSize: 11, color: '#64748b' },
  stockValue: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  reasoning: { fontSize: 13, color: '#475569', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, fontStyle: 'italic' },
});
