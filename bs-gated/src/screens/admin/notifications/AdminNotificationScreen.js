import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const TYPE_ICON  = { maintenance: '🔧', billing: '💰', visitor: '🚶', amenity: '🏊', general: '📢', sos: '🚨' };
const TYPE_COLOR = { maintenance: COLORS.warning, billing: COLORS.danger, visitor: COLORS.info, amenity: '#7B1FA2', general: COLORS.primary, sos: '#DC2626' };

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminNotificationScreen({ navigation }) {
  const theme = useTheme();
  // Theme tokens
  const _bg = theme.background; // ensures theme reactive
  const notifications       = useAdminStore((s) => s.notifications);
  const markNotificationRead = useAdminStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAdminStore((s) => s.markAllNotificationsRead);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handlePress = (item) => {
    markNotificationRead(item.id);
    // Navigate to relevant screen
    if (item.type === 'sos' && navigation) {
      navigation.navigate('Reports');
    } else if (item.type === 'maintenance' && item.requestId && navigation) {
      navigation.navigate('MaintenanceDetail', { requestId: item.requestId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[globalStyles.card, styles.notifCard, !item.read && styles.unreadCard]}
      onPress={() => handlePress(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: (TYPE_COLOR[item.type] || COLORS.primary) + '20' }]}>
        <Text style={{ fontSize: 20 }}>{TYPE_ICON[item.type] || '📢'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={globalStyles.screen}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        <Text style={styles.headerSub}>System alerts & activity</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 36 }}>🔔</Text>
            <Text style={globalStyles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  markAllText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  unreadCard: { backgroundColor: COLORS.primary + '08', borderColor: COLORS.primary + '40' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  notifBody: { fontSize: 13, color: COLORS.textLight, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 6 },
});
