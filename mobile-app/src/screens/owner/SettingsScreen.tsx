import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, Button, Switch, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { api, clearTokens } from '../../services/api';

export default function SettingsScreen({ navigation }: any) {
  const { user, theme, toggleTheme, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    try {
      if (user) {
        await api.auth.logout('');
      }
    } catch {}
    clearTokens();
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Surface style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </Text>
        </View>
        <Text style={styles.storeName}>{user?.storeName || 'Your Store'}</Text>
        <Text style={styles.ownerName}>{user?.name || 'Owner'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} color="#3b82f6" />
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} color="#3b82f6" />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button mode="outlined" icon="account-edit" style={styles.menuBtn}>
            Edit Profile
          </Button>
          <Button mode="outlined" icon="translate" style={styles.menuBtn}>
            Language (हिन्दी)
          </Button>
          <Button mode="outlined" icon="crown" style={styles.menuBtn}>
            Subscription Plan
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Support</Text>
          <Button mode="outlined" icon="help-circle" style={styles.menuBtn}>
            Help & Support
          </Button>
          <Button mode="outlined" icon="information" style={styles.menuBtn}>
            About KiranaFlow v1.0.0
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutBtn}
        contentStyle={{ height: 48 }}
        buttonColor="#ef4444"
      >
        Logout
      </Button>

      <Text style={styles.footer}>KiranaFlow v1.0.0 • Made for India 🇮🇳</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 16, elevation: 2 },
  avatar: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  storeName: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  ownerName: { fontSize: 14, color: '#64748b', marginTop: 4 },
  phone: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingLabel: { fontSize: 15, color: '#0f172a' },
  menuBtn: { marginBottom: 8, borderRadius: 12, borderColor: '#e2e8f0' },
  logoutBtn: { borderRadius: 16, marginTop: 8, marginBottom: 16 },
  footer: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 32 },
});
