/**
 * GuardNotificationsScreen.js
 *
 * Shows the guard their notifications — primarily resident approve/deny
 * decisions on walk-in visitors. Tapping marks as read.
 * Unread badge is shown on the guard tab bar.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityStore }  from '../../../store/securityStore';
import { useAuthStore }      from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_CONFIG = {
  walkin_approved: { emoji: '✅', label: 'Approved', borderColor: '#1A7A7A', bg: '#F0FDF4', iconBg: '#D1FAE5', textColor: '#0F766E' },
  walkin_denied:   { emoji: '🚫', label: 'Denied',   borderColor: '#C62828', bg: '#FFF5F5', iconBg: '#FEE2E2', textColor: '#DC2626' },
  default:         { emoji: '🔔', label: 'Info',     borderColor: '#D0EEEE', bg: '#FFFFFF', iconBg: '#F1F5F9', textColor: '#475569' },
};

// ─── Notification Card ───────────────────────────────────────────────────────
function NotifCard({ n, onPress }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cfg.bg, borderColor: !n.read ? cfg.borderColor : '#E2E8F0', borderWidth: !n.read ? 2 : 1 },
      ]}
      onPress={() => onPress(n.id)}
      activeOpacity={0.85}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: cfg.iconBg }]}>
        <Text style={{ fontSize: 22 }}>{cfg.emoji}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={styles.cardRow}>
          <Text style={[styles.cardTitle, { color: cfg.textColor }]} numberOfLines={2}>
            {n.title}
          </Text>
          <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
        </View>

        <Text style={styles.cardBody}>{n.body}</Text>

        {/* Visitor detail chip */}
        {(n.visitorName || n.hostUnit) ? (
          <View style={[styles.detailRow, { backgroundColor: cfg.iconBg }]}>
            {n.visitorName ? <Text style={styles.detailChip}>👤 {n.visitorName}</Text> : null}
            {n.hostUnit    ? <Text style={styles.detailChip}>🏠 Unit {n.hostUnit}</Text> : null}
            {n.purpose     ? <Text style={styles.detailChip}>📋 {n.purpose}</Text> : null}
          </View>
        ) : null}

        {/* Action banner */}
        <View style={[styles.actionBanner, { backgroundColor: cfg.iconBg }]}>
          <Text style={[styles.actionBannerText, { color: cfg.textColor }]}>
            {n.type === 'walkin_approved'
              ? '→ Allow this visitor through the gate'
              : n.type === 'walkin_denied'
              ? '→ Turn this visitor away'
              : ''}
          </Text>
        </View>
      </View>

      {/* Unread dot */}
      {!n.read && <View style={[styles.unreadDot, { backgroundColor: cfg.textColor }]} />}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

// ─── Guard Tab Bar ─────────────────────────────────────────────────────────────
function GuardTabBar({ active, navigation }) {
  const TABS = [
    { key: 'GuardDashboard',      icon: 'home',          label: 'Home'    },
    { key: 'EntryLogs',           icon: 'list',          label: 'Logs'    },
    { key: 'GuardNotifications',  icon: 'notifications', label: 'Alerts'  },
    { key: 'GuardProfile',        icon: 'person',        label: 'Profile' },
  ];
  return (
    <View style={gtb.bar}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity key={t.key} style={gtb.tab}
            onPress={() => t.key !== active && navigation.navigate(t.key)}
            activeOpacity={0.7}>
            <Ionicons name={isActive ? t.icon : `${t.icon}-outline`} size={24}
              color={isActive ? '#1A7A7A' : '#94A3B8'} />
            <Text style={[gtb.label, isActive && gtb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gtb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingBottom: 8, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 3 },
  label:       { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  labelActive: { color: '#1A7A7A', fontWeight: '800' },
});

export default function GuardNotificationsScreen({ navigation }) {
  const theme = useTheme();
  const guardNotifications          = useSecurityStore(s => s.guardNotifications);
  const markGuardNotificationRead   = useSecurityStore(s => s.markGuardNotificationRead);
  const markAllGuardNotificationsRead = useSecurityStore(s => s.markAllGuardNotificationsRead);

  const unread = guardNotifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#E8F5F5' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && (
            <Text style={styles.headerSub}>{unread} unread</Text>
          )}
        </View>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllGuardNotificationsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all{'\n'}read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 68 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {guardNotifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              When a resident approves or denies a walk-in visitor, you will be notified here instantly.
            </Text>
          </View>
        ) : (
          guardNotifications.map(n => (
            <NotifCard
              key={n.id}
              n={n}
              onPress={markGuardNotificationRead}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <GuardTabBar active="GuardNotifications" navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:          { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  backBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText:        { color: '#FFF', fontSize: 28, fontWeight: '300' },
  headerTitle:     { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:       { color: '#D4AF5A', fontSize: 11, fontWeight: '700', marginTop: 2 },
  markAllBtn:      { width: 68, alignItems: 'flex-end' },
  markAllText:     { color: '#D4AF5A', fontSize: 11, fontWeight: '700', textAlign: 'right', lineHeight: 15 },
  body:            { padding: 16 },

  // Empty state
  empty:           { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle:      { fontSize: 20, fontWeight: '800', color: '#1A2E2E', marginBottom: 8 },
  emptySub:        { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  // Card
  card:            { flexDirection: 'row', gap: 12, borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'flex-start' },
  iconBox:         { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle:       { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8, lineHeight: 20 },
  cardTime:        { fontSize: 11, color: '#7A9E9E', flexShrink: 0 },
  cardBody:        { fontSize: 13, color: '#3D6E6E', lineHeight: 19, marginBottom: 8 },
  detailRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, borderRadius: 10, padding: 8, marginBottom: 8 },
  detailChip:      { fontSize: 12, fontWeight: '600', color: '#3D6E6E' },
  actionBanner:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  actionBannerText:{ fontSize: 12, fontWeight: '800' },
  unreadDot:       { width: 9, height: 9, borderRadius: 5, marginTop: 4, flexShrink: 0 },
});