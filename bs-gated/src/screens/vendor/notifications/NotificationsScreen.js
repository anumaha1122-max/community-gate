import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Modal, Platform,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader } from '../../../vendor/components';
import useVendorStore from '../../../store/vendorStore';
import { useTheme } from '../../../hooks/useTheme';

const TYPE_CONFIG = {
  approved:    { color: Colors.green,  bg: Colors.greenLight,  icon: '✅' },
  rejected:    { color: '#E53E3E',     bg: '#FFF1F1',          icon: '❌' },
  new_request: { color: Colors.purple, bg: Colors.purpleLight, icon: '📋' },
  payment:     { color: Colors.amber,  bg: Colors.amberLight,  icon: '💰' },
  reminder:    { color: Colors.blue,   bg: Colors.blueLight,   icon: '⏰' },
  quote_update:{ color: Colors.teal,   bg: Colors.tealLight,   icon: '📨' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme();
  const notifications           = useVendorStore(s => s.notifications);
  const markNotificationRead    = useVendorStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useVendorStore(s => s.markAllNotificationsRead);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const handlePress = (item) => {
    markNotificationRead(item.id);
    setSelectedNotif(item);
  };

  const unreadCount = notifications.filter(n => !n.read).length;


  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.reminder;
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.8}
        onPress={() => handlePress(item)}
      >
        <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.read && { color: Colors.text }]}>{item.title}</Text>
            {!item.read && <View style={[styles.dot, { backgroundColor: cfg.color }]} />}
          </View>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{item.createdAt ? timeAgo(item.createdAt) : (item.time || '')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const modalCfg = selectedNotif ? (TYPE_CONFIG[selectedNotif.type] || TYPE_CONFIG.reminder) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightComponent={
          unreadCount > 0
            ? <TouchableOpacity onPress={markAllNotificationsRead}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>
            : null
        }
      />

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>🔔 {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔕</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />

      {/* Inline Message Bottom Sheet */}
      <Modal visible={!!selectedNotif} transparent animationType="slide" onRequestClose={() => setSelectedNotif(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedNotif(null)}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => {}}>
            {selectedNotif && modalCfg && (
              <>
                <View style={styles.modalHandle} />
                <View style={[styles.modalIconBox, { backgroundColor: modalCfg.bg }]}>
                  <Text style={{ fontSize: 30 }}>{modalCfg.icon}</Text>
                </View>
                <Text style={[styles.modalTitle, { color: modalCfg.color }]}>{selectedNotif.title}</Text>
                <Text style={styles.modalTime}>{selectedNotif.time}</Text>
                <View style={styles.modalDivider} />
                <Text style={styles.modalBody}>{selectedNotif.body}</Text>
                <TouchableOpacity
                  style={[styles.modalDismissBtn, { backgroundColor: modalCfg.bg }]}
                  onPress={() => setSelectedNotif(null)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalDismissText, { color: modalCfg.color }]}>Got it</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: 16, paddingBottom: 40 },
  unreadBanner: { backgroundColor: Colors.tealLight, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  unreadBannerText: { fontSize: 13, color: Colors.purple, fontWeight: Fonts.semiBold },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.teal, backgroundColor: '#FFFFFF' },
  iconBox:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  title:    { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, flex: 1, marginRight: 8 },
  body:     { fontSize: 12, color: Colors.text2, lineHeight: 17 },
  time:     { fontSize: 11, color: Colors.text3, marginTop: 5 },
  markAll:  { fontSize: 13, color: Colors.purple, fontWeight: Fonts.semiBold },
  empty:    { alignItems: 'center', paddingTop: 80 },
  emptyText:{ fontSize: 14, color: Colors.text2 },
  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 48 : 32, alignItems: 'center' },
  modalHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 20 },
  modalIconBox:    { width: 70, height: 70, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle:      { fontSize: 18, fontWeight: Fonts.extraBold, textAlign: 'center', marginBottom: 4 },
  modalTime:       { fontSize: 12, color: Colors.text3, marginBottom: 16 },
  modalDivider:    { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  modalBody:       { fontSize: 14, color: Colors.text, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalDismissBtn: { width: '100%', paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  modalDismissText:{ fontSize: 15, fontWeight: Fonts.bold },
});