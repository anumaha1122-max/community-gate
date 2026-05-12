/**
 * GuardDashboard.js — Guard Home
 *
 * - Live stats from securityStore
 * - SOS pulsing banner
 * - Quick action grid
 * - Bottom tab bar: Home | Notifications | Profile
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Animated, Alert,
} from 'react-native';
import { Ionicons }         from '@expo/vector-icons';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme }         from '../../../hooks/useTheme';

const TEAL     = '#1A7A7A';
const TEAL_DK  = '#0D6E6E';
const BG       = '#E8F5F5';

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function GuardTabBar({ active, navigation }) {
  const TABS = [
    { key: 'Home',          icon: 'home',              label: 'Home'          },
    { key: 'EntryLogs',     icon: 'list',              label: 'Logs'          },
    { key: 'GuardNotifications', icon: 'notifications', label: 'Alerts'       },
    { key: 'GuardProfile',  icon: 'person',            label: 'Profile'       },
  ];
  return (
    <View style={tb.bar}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={tb.tab}
            onPress={() => t.key !== active && navigation.navigate(t.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? t.icon : `${t.icon}-outline`}
              size={24}
              color={isActive ? TEAL : '#94A3B8'}
            />
            <Text style={[tb.label, isActive && tb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const tb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingBottom: 8, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 3 },
  label:       { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  labelActive: { color: TEAL, fontWeight: '800' },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, emoji }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderLeftColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Action Tile ──────────────────────────────────────────────────────────────
function ActionTile({ emoji, title, sub, color, bg, badge, onPress }) {
  return (
    <TouchableOpacity style={[styles.tile, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.tileTop}>
        <Text style={styles.tileEmoji}>{emoji}</Text>
        {badge > 0 && (
          <View style={[styles.tileBadge, { backgroundColor: color }]}>
            <Text style={styles.tileBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tileTitle, { color }]}>{title}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ─── SOS Banner ───────────────────────────────────────────────────────────────
function SOSBanner({ activeSOS, onPress }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (activeSOS.length === 0) return null;
  const latest = activeSOS[0];

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity style={styles.sosBanner} onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.sosBannerIcon}>🚨</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sosBannerTitle}>ACTIVE SOS — {activeSOS.length} Alert{activeSOS.length > 1 ? 's' : ''}</Text>
          <Text style={styles.sosBannerSub}>
            {latest.residentName} · Unit {latest.unit} · {latest.type}
          </Text>
        </View>
        <Text style={styles.sosBannerArrow}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GuardDashboard({ navigation }) {
  const user    = useAuthStore(s => s.user);

  const visitors       = useSecurityStore(s => s.visitors);
  const deliveries     = useSecurityStore(s => s.deliveries);
  const sosAlerts      = useSecurityStore(s => s.sosAlerts);
  const liveQueue      = useSecurityStore(s => s.liveQueue);
  const blacklist      = useSecurityStore(s => s.blacklist);
  const incidents      = useSecurityStore(s => s.incidents || []);
  const guardNotifications = useSecurityStore(s => s.guardNotifications || []);

  const activeSOS         = sosAlerts.filter(a => a.status !== 'RESOLVED');
  const pendingQueue      = liveQueue.filter(q => q.status === 'WAITING' || q.status === 'RESIDENT_CALLED');
  const insideVisitors    = visitors.filter(v => v.status === 'CHECKED_IN');
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');
  const activeBlacklist   = blacklist.filter(b => b.active);
  const openIncidents     = incidents.filter(i => i.status === 'open');
  const unreadNotifs      = guardNotifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL_DK} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>🛡️ {user?.name?.split(' ')[0] || 'Guard'}</Text>
          <Text style={styles.shift}>Main Gate · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('GuardProfile')}
          style={styles.profileBtn}
          activeOpacity={0.8}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {(user?.name || 'G').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileBtnLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* SOS Banner */}
        <SOSBanner activeSOS={activeSOS} onPress={() => navigation.navigate('GuardSOS')} />

        {/* Live Stats */}
        <Text style={styles.sectionLabel}>LIVE STATUS</Text>
        <View style={styles.statsGrid}>
          <StatCard label="At Gate"    value={pendingQueue.length}      color="#DC2626" bg="#FEF2F2" emoji="🚶" />
          <StatCard label="Inside"     value={insideVisitors.length}    color={TEAL}    bg="#F0FDFA" emoji="🏠" />
          <StatCard label="Deliveries" value={pendingDeliveries.length} color="#D97706" bg="#FFFBEB" emoji="📦" />
          <StatCard label="Open Incidents" value={openIncidents.length} color="#7C3AED" bg="#F5F3FF" emoji="⚠️" />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <ActionTile emoji="🚶" title="Visitor Queue"  sub="Walk-ins at gate"    color="#1D4ED8" bg="#EFF6FF"
            badge={pendingQueue.length}      onPress={() => navigation.navigate('WalkInEntry')} />
          <ActionTile emoji="✅" title="Verify Visitor" sub="OTP / QR scan"       color={TEAL}    bg="#F0FDFA"
            onPress={() => navigation.navigate('VisitorVerification')} />
          <ActionTile emoji="📦" title="Delivery"       sub="Verify OTP/QR"       color="#D97706" bg="#FFFBEB"
            badge={pendingDeliveries.length} onPress={() => navigation.navigate('DeliveryVerification')} />
          <ActionTile emoji="🔧" title="Vendor Entry"   sub="OTP gate entry"      color="#7C3AED" bg="#F5F3FF"
            onPress={() => navigation.navigate('VendorVerification')} />
          <ActionTile emoji="🚫" title="Blacklist"      sub="Blocked persons"     color="#DC2626" bg="#FEF2F2"
            badge={activeBlacklist.length}   onPress={() => navigation.navigate('BlacklistAlert')} />
          <ActionTile emoji="📋" title="Entry Logs"     sub="Today's activity"    color="#475569" bg="#F8FAFC"
            onPress={() => navigation.navigate('EntryLogs')} />
          <ActionTile emoji="🏊" title="Amenity/EV"     sub="Verify OTP entry"    color="#0F766E" bg="#F0FDFA"
            onPress={() => navigation.navigate('AmenityVerification')} />
          <ActionTile emoji="⚠️" title="Incidents"      sub="Report / manage"     color="#DC2626" bg="#FEE2E2"
            badge={openIncidents.length}     onPress={() => navigation.navigate('SecurityIncident')} />
          <ActionTile emoji="🔄" title="Shift Handover" sub="End-of-shift report" color="#7C3AED" bg="#F3E8FF"
            onPress={() => navigation.navigate('ShiftHandover')} />
          <ActionTile emoji="🚶" title="Patrol Log"     sub="Start patrol round"  color="#0D9488" bg="#CCFBF1"
            onPress={() => navigation.navigate('PatrolLog')} />
          <ActionTile emoji="👁️" title="Biometric"      sub="Guard check-in"      color="#1D4ED8" bg="#EFF6FF"
            onPress={() => navigation.navigate('GuardBiometric')} />
          <ActionTile emoji="🚗" title="Vehicle Log"    sub="Vehicle entry/exit"  color="#475569" bg="#F8FAFC"
            onPress={() => navigation.navigate('VehicleEntry')} />
        </View>

        {/* Pending Queue Preview */}
        {pendingQueue.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>AT GATE NOW</Text>
            {pendingQueue.slice(0, 3).map(q => (
              <TouchableOpacity
                key={q.id}
                style={styles.queueCard}
                onPress={() => navigation.navigate('WalkInEntry')}
                activeOpacity={0.85}
              >
                <View style={styles.queueLeft}>
                  <View style={styles.queueAvatar}>
                    <Text style={{ fontSize: 18 }}>👤</Text>
                  </View>
                  <View>
                    <Text style={styles.queueName}>{q.name}</Text>
                    <Text style={styles.queueSub}>{q.purpose} · For {q.hostUnit}</Text>
                  </View>
                </View>
                <View style={[styles.queueBadge,
                  q.status === 'RESIDENT_CALLED' ? styles.badgeCalled : styles.badgeWaiting]}>
                  <Text style={styles.queueBadgeText}>
                    {q.status === 'RESIDENT_CALLED' ? 'Called' : 'Waiting'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {pendingQueue.length > 3 && (
              <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('WalkInEntry')}>
                <Text style={styles.viewAllText}>View all {pendingQueue.length} →</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <GuardTabBar active="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BG },

  // Header
  header:       { backgroundColor: TEAL_DK, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:     { fontSize: 20, fontWeight: '900', color: '#FFF' },
  shift:        { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  profileBtn:   { alignItems: 'center', gap: 4 },
  profileAvatar:{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  profileAvatarText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  profileBtnLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },

  body:         { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginTop: 18, marginBottom: 10 },

  // SOS Banner
  sosBanner:      { backgroundColor: '#C62828', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  sosBannerIcon:  { fontSize: 24 },
  sosBannerTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  sosBannerSub:   { fontSize: 12, color: '#FCA5A5', marginTop: 2 },
  sosBannerArrow: { color: '#FFF', fontSize: 24, fontWeight: '300' },

  // Stats
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:     { flex: 1, minWidth: '45%', borderRadius: 14, padding: 14, borderLeftWidth: 4 },
  statEmoji:    { fontSize: 20, marginBottom: 6 },
  statValue:    { fontSize: 28, fontWeight: '900' },
  statLabel:    { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },

  // Action Tiles
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile:         { width: '30.5%', borderRadius: 14, padding: 12 },
  tileTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  tileEmoji:    { fontSize: 22 },
  tileBadge:    { marginLeft: 4, marginTop: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tileBadgeText:{ color: '#FFF', fontSize: 9, fontWeight: '800' },
  tileTitle:    { fontSize: 12, fontWeight: '800' },
  tileSub:      { fontSize: 10, color: '#64748B', marginTop: 2 },

  // Queue Preview
  queueCard:     { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D0EEEE' },
  queueLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  queueAvatar:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' },
  queueName:     { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  queueSub:      { fontSize: 12, color: '#64748B', marginTop: 2 },
  queueBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeWaiting:  { backgroundColor: '#FEF3C7' },
  badgeCalled:   { backgroundColor: '#DCFCE7' },
  queueBadgeText:{ fontSize: 11, fontWeight: '700', color: '#1A2E2E' },
  viewAllBtn:    { padding: 12, alignItems: 'center' },
  viewAllText:   { color: TEAL, fontSize: 13, fontWeight: '700' },
});