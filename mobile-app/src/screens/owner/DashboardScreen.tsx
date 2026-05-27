import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Surface, Button, Chip, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface DashboardMetrics {
  todayOrders: number;
  activeDrivers: number;
  pendingOrders: number;
  totalCustomers: number;
  todayRevenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  customer: { name: string; phone: string };
  totalAmount: number;
  createdAt: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayOrders: 0, activeDrivers: 0, pendingOrders: 0,
    totalCustomers: 0, todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.store.getDashboard();
      setMetrics(data.metrics);
      setRecentOrders(data.recentOrders || []);
    } catch (error: any) {
      if (error.message === 'SESSION_EXPIRED') {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in_transit': case 'picked_up': return '#3b82f6';
      case 'confirmed': case 'assigned': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning! 👋</Text>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsRow}>
        <Surface style={[styles.metricCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.metricValue}>{metrics.todayOrders}</Text>
          <Text style={styles.metricLabel}>Today's Orders</Text>
        </Surface>
        <Surface style={[styles.metricCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.metricValue}>₹{metrics.todayRevenue.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </Surface>
      </View>

      <View style={styles.metricsRow}>
        <Surface style={[styles.metricCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.metricValue}>{metrics.activeDrivers}</Text>
          <Text style={styles.metricLabel}>Active Drivers</Text>
        </Surface>
        <Surface style={[styles.metricCard, { backgroundColor: '#ede9fe' }]}>
          <Text style={styles.metricValue}>{metrics.pendingOrders}</Text>
          <Text style={styles.metricLabel}>Pending Orders</Text>
        </Surface>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus-circle"
          onPress={() => navigation.navigate('CreateOrder')}
          style={styles.actionBtn}
          labelStyle={{ fontSize: 13 }}
        >
          New Order
        </Button>
        <Button
          mode="contained"
          icon="truck-delivery"
          onPress={() => navigation.navigate('RouteOptimizer')}
          style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
          labelStyle={{ fontSize: 13 }}
        >
          Optimize Route
        </Button>
      </View>

      {/* Recent Orders */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {recentOrders.map((order) => (
        <Card
          key={order.id}
          style={styles.orderCard}
          onPress={() => navigation.navigate('OrderDetail', { id: order.id })}
        >
          <Card.Content style={styles.orderContent}>
            <View style={styles.orderLeft}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderCustomer}>{order.customer?.name || 'Unknown'}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
                textStyle={{ color: getStatusColor(order.status), fontSize: 11, fontWeight: '600' }}
              >
                {order.status}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  orderCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusChip: {
    height: 24,
    marginTop: 4,
  },
});
