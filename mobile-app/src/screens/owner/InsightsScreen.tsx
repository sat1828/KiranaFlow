import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function InsightsScreen({ navigation }: any) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    try {
      const data = await api.ai.getInsights();
      setInsights(data.insights);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchInsights(); }, [fetchInsights]));

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 AI Insights</Text>
        <Text style={styles.subtitle}>Weekly analysis powered by Claude AI</Text>
      </View>

      {insights ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📊 Weekly Summary</Text>
              <Text style={styles.insightText}>{insights.summary}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>⏰ Peak Hours</Text>
              <Text style={styles.insightText}>{insights.peakHourAnalysis}</Text>
            </Card.Content>
          </Card>

          {insights.revenueComparison && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>💰 Revenue Comparison</Text>
                <Text style={styles.insightText}>
                  Current: ₹{insights.revenueComparison.current?.toLocaleString() || 'N/A'}
                  {'\n'}Previous: ₹{insights.revenueComparison.previous?.toLocaleString() || 'N/A'}
                  {'\n'}Change: {insights.revenueComparison.change_percent?.toFixed(1) || 'N/A'}%
                </Text>
              </Card.Content>
            </Card>
          )}

          {insights.operationalSuggestions?.map((s: string, idx: number) => (
            <Card key={idx} style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>💡 Suggestion {idx + 1}</Text>
                <Text style={styles.insightText}>{s}</Text>
              </Card.Content>
            </Card>
          ))}
        </>
      ) : (
        <Card style={{ borderRadius: 16, padding: 24 }}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>💡</Text>
            <Text style={styles.centeredText}>No insights yet. They'll appear after you generate reports.</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  insightText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  centeredText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});
