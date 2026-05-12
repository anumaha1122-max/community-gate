/**
 * AdminHomeScreen.js — REDESIGNED
 *
 * Design direction: "Premium Society Admin"
 *   – Exact same teal palette, padding, border-radius, and card style as ResidentDashboard
 *   – Deep teal header with admin-specific hero stats
 *   – Categorised shortcut sections (People · Operations · Finance · Reports)
 *   – SOS widget if active alerts exist
 *   – Recent activity feed
 *   – Same custom bottom tab bar style (admin tabs)
 *   – NO new packages — pure RN TouchableOpacity / Animated
 *
 * Bottom tabs: Dashboard · Residents · Maintenance · Billing · More
 * Navigation routes match exactly what AdminNavigator.js registers.
 * Stores used: AuthStore, adminStore, appStore, securityStore
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Animated, RefreshControl, Platform, Alert,
} from 'react-native';

import { useAuthStore }     from '../../../store/AuthStore';
import useAdminStore        from '../../../store/adminStore';
import useAppStore          from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useRoleGuard }     from '../../../guards/RoleGuard';
import { useAuthGuard }     from '../../../guards/AuthGuard';

// ─── Palette — exact copy from ResidentDashboard ─────────────────────────────
const P = {
  teal:        '#1A7A7A',
  tealDark:    '#0D6E6E',
  tealDeep:    '#1A7A7A',
  tealSoft:    '#E8F5F5',
  tealMid:     '#D0EEEE',
  tealText:    '#3D6E6E',
  bg:          '#E8F5F5',
  surface:     '#FFFFFF',
  text:        '#1A2E2E',
  textMuted:   '#7A9E9E',
  textSub:     '#3D6E6E',
  border:      '#D0EEEE',
  danger:      '#C62828',
  dangerBg:    '#FEE2E2',
  warning:     '#E65100',
  warningBg:   '#FEF3C7',
  success:     '#1A7A7A',
  successBg:   '#CCFBF1',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};
const fmt = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
  catch { return '—'; }
};

// ─── HERO STAT PILL — same as ResidentDashboard ──────────────────────────────
function HeroStat({ value, label, color, bg, onPress }) {
  return (
    <TouchableOpacity style={[hs.pill, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[hs.value, { color }]}>{value}</Text>
      <Text style={hs.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const hs = StyleSheet.create({
  pill:  { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 3, textAlign: 'center' },
});

// ─── SECTION HEADER — same as ResidentDashboard ──────────────────────────────
function SectionHead({ title, onSeeAll }) {
  return (
    <View style={sec.row}>
      <Text style={sec.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={sec.seeAll}>See all ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const sec = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:  { fontSize: 13, fontWeight: '800', color: P.text, letterSpacing: 0.3 },
  seeAll: { fontSize: 12, fontWeight: '700', color: P.teal },
});

// ─── FEATURE CARD (2-column wide) — same as ResidentDashboard ────────────────
function FeatureCard({ emoji, label, sub, badge, color, bg, onPress }) {
  return (
    <TouchableOpacity style={[fc.card, { backgroundColor: bg || P.surface }]} onPress={onPress} activeOpacity={0.82}>
      <View style={[fc.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        {badge > 0 && (
          <View style={[fc.badge, { backgroundColor: color }]}>
            <Text style={fc.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[fc.label, { color: P.text }]}>{label}</Text>
      <Text style={fc.sub}>{sub}</Text>
    </TouchableOpacity>
  );
}
const fc = StyleSheet.create({
  card:     { width: '48%', backgroundColor: P.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  badge:    { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText:{ color: '#FFF', fontSize: 9, fontWeight: '800' },
  label:    { fontSize: 13, fontWeight: '800', marginBottom: 3 },
  sub:      { fontSize: 11, color: P.textMuted, lineHeight: 15 },
});

// ─── SHORTCUT ROW (icon-only) — same as ResidentDashboard ────────────────────
function ShortcutRow({ items, navigation }) {
  return (
    <View style={sr.row}>
      {items.map((item, i) => (
        <TouchableOpacity key={i} style={sr.item} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
          <View style={[sr.icon, { backgroundColor: item.color + '15' }]}>
            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
            {item.badge > 0 && (
              <View style={[sr.badge, { backgroundColor: item.color }]}>
                <Text style={sr.badgeText}>{item.badge > 9 ? '9+' : item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={sr.label} numberOfLines={1}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const sr = StyleSheet.create({
  row:      { flexDirection: 'row', justifyContent: 'space-between' },
  item:     { alignItems: 'center', flex: 1 },
  icon:     { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative' },
  badge:    { position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:{ color: '#FFF', fontSize: 8, fontWeight: '800' },
  label:    { fontSize: 10, fontWeight: '700', color: P.textSub, textAlign: 'center' },
});

// ─── ACTIVITY ROW — same as ResidentDashboard ────────────────────────────────
function ActivityRow({ emoji, title, sub, time, color, onPress, last }) {
  return (
    <TouchableOpacity style={[ar.row, !last && ar.border]} onPress={onPress} activeOpacity={0.75}>
      <View style={[ar.dot, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={ar.title} numberOfLines={1}>{title}</Text>
        <Text style={ar.sub} numberOfLines={1}>{sub}</Text>
      </View>
      <Text style={ar.time}>{time}</Text>
    </TouchableOpacity>
  );
}
const ar = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  border:{ borderBottomWidth: 1, borderBottomColor: P.border },
  dot:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: P.text },
  sub:   { fontSize: 11, color: P.textMuted, marginTop: 2 },
  time:  { fontSize: 10, color: P.textMuted, marginLeft: 8 },
});

// ─── SOS ALERT BANNER (admin view — no pulsing button, just banner) ───────────
function SOSAlertBanner({ count, latest, onPress }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);
  return (
    <TouchableOpacity style={sb.wrap} onPress={onPress} activeOpacity={0.85}>
      <Animated.Text style={[sb.icon, { opacity: fadeAnim }]}>🚨</Animated.Text>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={sb.title}>{count} Active SOS Alert{count > 1 ? 's' : ''}</Text>
        {latest && (
          <Text style={sb.sub} numberOfLines={1}>
            {latest.residentName} · Unit {latest.unit} · {latest.type}
          </Text>
        )}
      </View>
      <Text style={sb.arrow}>›</Text>
    </TouchableOpacity>
  );
}
const sb = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C62828', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 20 },
  icon:  { fontSize: 22 },
  title: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  sub:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  arrow: { color: '#FFFFFF', fontSize: 22, fontWeight: '300' },
});

// ─── CUSTOM BOTTOM TAB BAR — same style as ResidentDashboard ─────────────────
const ADMIN_TABS = [
  { key: 'home',        emoji: '⊞',  label: 'Dashboard',  route: 'AdminDashboard' },
  { key: 'residents',   emoji: '👥', label: 'Residents',  route: 'ResidentList' },
  { key: 'maintenance', emoji: '🔧', label: 'Maintenance',route: 'AdminMaintenanceTab' },
  { key: 'billing',     emoji: '💰', label: 'Billing',    route: 'BillingDashboard' },
  { key: 'more',        emoji: '☰',  label: 'More',       route: 'AdminMore' },
];

function BottomTabBar({ activeTab, navigation, badges }) {
  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });
  const isVerified = verificationStatus === 'approved';

  return (
    <View style={tb.container}>
      {ADMIN_TABS.map(tab => {
        const isActive  = activeTab === tab.key;
        const badge     = badges[tab.key] || 0;
        const isHome    = tab.key === 'home';
        const locked    = !isVerified && !isHome;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tb.tab}
            onPress={() => {
              if (locked) {
                Alert.alert('🔒 Verification Required', 'Please verify your account to access this section.', [
                  { text: 'OK', style: 'cancel' },
                ]);
                return;
              }
              navigation.navigate(tab.route);
            }}
            activeOpacity={0.7}
          >
            <View style={[tb.iconWrap, isActive && tb.iconWrapActive]}>
              <Text style={[tb.emoji, isActive && { fontSize: 22 }, locked && { opacity: 0.35 }]}>{tab.emoji}</Text>
              {locked && <Text style={{ position: 'absolute', top: -4, right: -4, fontSize: 10 }}>🔒</Text>}
              {!locked && badge > 0 && (
                <View style={tb.badge}><Text style={tb.badgeText}>{badge > 9 ? '9+' : badge}</Text></View>
              )}
            </View>
            <Text style={[tb.label, isActive && tb.labelActive, locked && { opacity: 0.35 }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const tb = StyleSheet.create({
  container:     {
    flexDirection: 'row',
    backgroundColor: P.surface,
    borderTopWidth: 1,
    borderTopColor: P.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tab:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap:      { width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 12, position: 'relative' },
  iconWrapActive:{ backgroundColor: P.tealSoft },
  emoji:         { fontSize: 20 },
  badge:         { position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:     { color: '#FFF', fontSize: 8, fontWeight: '800' },
  label:         { fontSize: 10, fontWeight: '600', color: P.textMuted, marginTop: 2 },
  labelActive:   { color: P.teal, fontWeight: '800' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminHomeScreen({ navigation }) {
  const { isLoggedIn } = useAuthGuard();
  const { hasRole }    = useRoleGuard(['admin']);
  if (!isLoggedIn || !hasRole) return null;

  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  // ── Store data ──────────────────────────────────────────────────────────────
  const residents      = useAdminStore(s => s.residents);
  const guards         = useAdminStore(s => s.guards);
  const visitors       = useAdminStore(s => s.visitors);
  const blacklist      = useAdminStore(s => s.blacklist);
  const notifications  = useAdminStore(s => s.notifications);

  const maintenanceReqs  = useAppStore(s => s.maintenanceRequests);
  const bills            = useAppStore(s => s.bills);
  const p2pListings      = useAppStore(s => s.p2pListings);
  const amenityBookings  = useAppStore(s => s.amenityBookings);

  const sosAlerts  = useSecurityStore(s => s.sosAlerts);
  const deliveries = useSecurityStore(s => s.deliveries);

  // ── Sync with AuthStore for Resident Approvals ──
  const registeredUsers   = useAuthStore(s => s.registeredUsers);
  const pendingApprovals  = registeredUsers.filter(
    u => ['resident', 'vendor', 'security'].includes(u.role) &&
         (u.status === 'pending' || u.kycStatus === 'pending')
  ).length;

  const [refreshing, setRefreshing] = useState(false);
  const fetchUsers       = useAuthStore(s => s.fetchUsers);
  const fetchMaintenance = useAppStore(s => s.fetchMaintenance);

  useEffect(() => {
    fetchUsers();
    fetchMaintenance('admin', user?.id);
  }, []);

  // ── Computed values ─────────────────────────────────────────────────────────
  const totalResidents      = registeredUsers?.length ?? 0;
  const activeResidents     = registeredUsers?.filter(r => r.active)?.length ?? 0;
  const approvedResidents   = registeredUsers?.filter(r => r.kycStatus === 'approved')?.length ?? 0;
  const pendingKYC          = registeredUsers?.filter(r => r.kycStatus === 'pending')?.length ?? 0;

  const openMaintenance     = maintenanceReqs?.filter(r => !['paid_to_vendor','quote_rejected'].includes(r.status))?.length ?? 0;
  const urgentMaintenance   = maintenanceReqs?.filter(r => r.priority === 'high' || r.priority === 'urgent')?.length ?? 0;

  const unpaidBills         = bills?.filter(b => b.status === 'unpaid') ?? [];
  const totalOutstanding    = unpaidBills.reduce((s, b) => s + (b.total || 0), 0);
  const overdueCount        = bills?.filter(b => b.status === 'overdue')?.length ?? 0;

  const visitorsInside      = visitors?.filter(v => v.status === 'inside')?.length ?? 0;
  const activeGuards        = guards?.filter(g => g.active)?.length ?? 0;

  const activeSOS           = sosAlerts?.filter(a => a.status !== 'RESOLVED') ?? [];
  const latestSOS           = activeSOS[0];

  const unreadNotifs        = notifications?.filter(n => !n.read)?.length ?? 0;
  const pendingP2P          = p2pListings?.filter(l => l.status === 'pending')?.length ?? 0;
  const pendingDeliveries   = deliveries?.filter(d => d.status === 'PENDING')?.length ?? 0;
  const todayAmenityBookings = amenityBookings?.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today && b.status === 'confirmed';
  })?.length ?? 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // ── Recent activity feed ────────────────────────────────────────────────────
  const recentActivity = [
    ...(maintenanceReqs ?? []).slice(0, 2).map(r => ({
      id:    'mnt-' + r.id,
      emoji: '🔧',
      title: r.title || r.category || 'Maintenance Request',
      sub:   `Unit ${r.unit || '—'} · ${(r.status || '').replace(/_/g, ' ')}`,
      color: P.warning,
      time:  fmt(r.createdAt),
      route: 'AdminMaintenanceTab',
    })),
    ...(visitors ?? []).slice(0, 2).map(v => ({
      id:    'vis-' + v.id,
      emoji: v.status === 'inside' ? '🚶' : v.status === 'checked_out' ? '🚪' : '👤',
      title: v.name,
      sub:   `${v.purpose} · Unit ${v.unit}`,
      color: P.teal,
      time:  fmt(v.checkIn),
      route: 'VisitorLogs',
    })),
    ...(activeSOS).slice(0, 1).map(a => ({
      id:    'sos-' + a.id,
      emoji: '🚨',
      title: `SOS — ${a.residentName}`,
      sub:   `Unit ${a.unit} · ${a.type} · ${a.status}`,
      color: P.danger,
      time:  fmt(a.triggeredAt),
      route: 'VisitorLogs',
    })),
    ...(unpaidBills).slice(0, 1).map(b => ({
      id:    'bill-' + b.id,
      emoji: '💳',
      title: `Unpaid — ${b.residentName || b.unit || 'Resident'}`,
      sub:   `₹${(b.total || 0).toLocaleString('en-IN')} pending`,
      color: P.danger,
      time:  fmt(b.dueDate),
      route: 'BillingDashboard',
    })),
  ].slice(0, 5);

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* ── SCROLLABLE CONTENT ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={P.teal} />}
      >
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          {/* Top row */}
          <View style={s.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.greetingText}>{greeting()},</Text>
              <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Admin'} 👋</Text>
              <View style={s.unitRow}>
                <View style={s.unitPill}>
                  <Text style={s.unitText}>🛡️  Administrator</Text>
                </View>
                {activeSOS.length > 0 && (
                  <View style={s.sosPill}>
                    <Text style={s.sosPillText}>🚨 {activeSOS.length} SOS</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {/* Notification bell */}
              <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('AdminNotifications')}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                {unreadNotifs > 0 && (
                  <View style={s.avatarBadge}>
                    <Text style={s.avatarBadgeText}>{unreadNotifs > 9 ? '9+' : unreadNotifs}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Profile avatar */}
              <TouchableOpacity style={s.avatarBtn} onPress={() => navigation.navigate('AdminProfile')}>
                <View style={s.avatar}>
                  <Text style={{ fontSize: 22 }}>👤</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero stats row */}
          <View style={s.heroRow}>
            <HeroStat
              value={totalResidents}
              label="Residents"
              color="#CCFBF1"
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('ResidentList')}
            />
            <View style={{ width: 10 }} />
            <HeroStat
              value={openMaintenance}
              label="Open Requests"
              color={openMaintenance > 0 ? '#FECDD3' : '#CCFBF1'}
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('AdminMaintenanceTab')}
            />
            <View style={{ width: 10 }} />
            <HeroStat
              value={totalOutstanding > 0 ? `₹${(totalOutstanding / 1000).toFixed(1)}K` : '✓'}
              label={totalOutstanding > 0 ? 'Outstanding' : 'No Dues'}
              color={totalOutstanding > 0 ? '#FECDD3' : '#CCFBF1'}
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('BillingDashboard')}
            />
          </View>
        </View>

        {/* ═══ BODY ═══ */}
        <View style={s.body}>

          {/* SOS Alert Banner */}
          {activeSOS.length > 0 && (
            <SOSAlertBanner
              count={activeSOS.length}
              latest={latestSOS}
              onPress={() => navigation.navigate('VisitorLogs')}
            />
          )}

          {/* Pending Approvals alert */}
          {(pendingKYC > 0 || pendingP2P > 0) && (
            <TouchableOpacity style={s.duesAlert} onPress={() => navigation.navigate('UserApprovals')}>
              <Text style={s.duesAlertText}>
                ⚠️  {pendingKYC > 0 ? `${pendingKYC} registration${pendingKYC > 1 ? 's' : ''} pending approval` : ''}{pendingKYC > 0 && pendingP2P > 0 ? ' · ' : ''}{pendingP2P > 0 ? `${pendingP2P} P2P approvals` : ''}
              </Text>
              <Text style={s.duesAlertCta}>Review →</Text>
            </TouchableOpacity>
          )}

          {/* ── SECTION 1: People & Security ── */}
          <SectionHead title="People & Security" onSeeAll={() => navigation.navigate('ResidentList')} />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="👥" label="Residents" color={P.teal}
              sub={`${totalResidents} total · ${activeResidents} active`}
              badge={0}
              onPress={() => navigation.navigate('ResidentList')}
            />
            <FeatureCard
              emoji="✅" label="User Approvals" color={P.warning}
              sub={
                pendingKYC > 0
                  ? `${pendingKYC} pending approval`
                  : 'No pending requests'
              }
              badge={pendingKYC}
              onPress={() => navigation.navigate('UserApprovals')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '🚶', label: 'Visitors',   color: '#F57F17', route: 'VisitorLogs',      badge: visitorsInside },
                { emoji: '🛡️', label: 'Guards',     color: P.teal,    route: 'GuardManagement',  badge: 0 },
                { emoji: '👔', label: 'Staff',       color: '#6A1B9A', route: 'StaffManagement',  badge: 0 },
                { emoji: '🚫', label: 'Blacklist',   color: P.danger,  route: 'AdminBlacklist',   badge: blacklist?.length ?? 0 },
                { emoji: '📦', label: 'Deliveries',  color: '#0D9488', route: 'VisitorLogs',      badge: pendingDeliveries },
              ]}
            />
          </View>

          {/* ── SECTION 2: Operations ── */}
          <SectionHead title="Operations" onSeeAll={() => navigation.navigate('AdminMaintenanceTab')} />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="🔧" label="Maintenance" color={P.warning}
              sub={openMaintenance > 0 ? `${openMaintenance} open · ${urgentMaintenance} urgent` : 'All clear ✓'}
              badge={openMaintenance}
              onPress={() => navigation.navigate('AdminMaintenanceTab')}
            />
            <FeatureCard
              emoji="🏊" label="Amenities" color="#7C3AED"
              sub={`${todayAmenityBookings} bookings today`}
              badge={0}
              onPress={() => navigation.navigate('AmenitiesAdmin')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '📋', label: 'Notice Board', color: P.teal,    route: 'AdminNoticeBoard',  badge: 0 },
                { emoji: '📢', label: 'Announce',     color: '#F57F17', route: 'Announcements',     badge: 0 },
                { emoji: '🔩', label: 'AMC',          color: '#0D9488', route: 'AMC',               badge: 0 },
                { emoji: '🏠', label: 'Real Estate',  color: '#1565C0', route: 'RealEstateAdmin',   badge: pendingP2P },
                { emoji: '🅿️', label: 'Parking',      color: P.teal,    route: 'VisitorParkingAdmin', badge: 0 },
              ]}
            />
          </View>

          {/* ── SECTION 3: Finance ── */}
          <SectionHead title="Finance" onSeeAll={() => navigation.navigate('BillingDashboard')} />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="💰" label="Billing" color={P.danger}
              sub={unpaidBills.length > 0 ? `${unpaidBills.length} unpaid · ₹${totalOutstanding.toLocaleString('en-IN')}` : 'All collected ✓'}
              badge={overdueCount}
              onPress={() => navigation.navigate('BillingDashboard')}
            />
            <FeatureCard
              emoji="🧾" label="Invoices" color="#1565C0"
              sub="Generate & send bills"
              badge={0}
              onPress={() => navigation.navigate('GenerateInvoice')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '💸', label: 'Expenses',  color: P.warning, route: 'AdminExpenses',    badge: 0 },
                { emoji: '📊', label: 'Reports',   color: P.teal,    route: 'Reports',          badge: 0 },
                { emoji: '📈', label: 'Activity',  color: '#0D9488', route: 'AdminPlatformActivity', badge: 0 },
                { emoji: '🔔', label: 'Alerts',    color: P.warning, route: 'AdminNotifications', badge: unreadNotifs },
                { emoji: '☰',  label: 'More',      color: P.teal,    route: 'AdminMore',        badge: 0 },
              ]}
            />
          </View>

          {/* ── SECTION 4: Settings & Config ── */}
          <SectionHead title="Settings & Configuration" onSeeAll={() => navigation.navigate('AdminMore')} />
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '🏢', label: 'Society',    color: P.teal,    route: 'SocietyConfig' },
                { emoji: '💳', label: 'Billing Cfg',color: '#1565C0', route: 'BillingConfig' },
                { emoji: '🔧', label: 'Vendors',    color: '#E8A020', route: 'VendorManagement' },
                { emoji: '⚙️', label: 'Modules',    color: '#7C3AED', route: 'ModuleToggles' },
                { emoji: '📋', label: 'Audit Logs', color: '#0369A1', route: 'AuditLogs' },
              ]}
            />
          </View>

          {/* ── RECENT ACTIVITY ── */}
          {recentActivity.length > 0 && (
            <>
              <SectionHead title="Recent Activity" />
              <View style={s.activityCard}>
                {recentActivity.map((item, i) => (
                  <ActivityRow
                    key={item.id}
                    {...item}
                    last={i === recentActivity.length - 1}
                    onPress={() => navigation.navigate(item.route)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Quick stats summary row */}
          <SectionHead title="Society Overview" />
          <View style={s.overviewRow}>
            <View style={s.overviewCard}>
              <Text style={s.overviewEmoji}>👥</Text>
              <Text style={s.overviewValue}>{totalResidents}</Text>
              <Text style={s.overviewLabel}>Residents</Text>
            </View>
            <View style={s.overviewCard}>
              <Text style={s.overviewEmoji}>🛡️</Text>
              <Text style={s.overviewValue}>{activeGuards}</Text>
              <Text style={s.overviewLabel}>Guards On Duty</Text>
            </View>
            <View style={s.overviewCard}>
              <Text style={s.overviewEmoji}>🚶</Text>
              <Text style={s.overviewValue}>{visitorsInside}</Text>
              <Text style={s.overviewLabel}>Visitors Inside</Text>
            </View>
            <View style={[s.overviewCard, pendingKYC > 0 && { borderColor: '#F59E0B', borderWidth: 1.5 }]}>
              <Text style={s.overviewEmoji}>⏳</Text>
              <Text style={[s.overviewValue, { color: pendingKYC > 0 ? '#D97706' : P.teal }]}>{pendingKYC}</Text>
              <Text style={s.overviewLabel}>Pending{'\n'}Approvals</Text>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      {/* ── CUSTOM BOTTOM TAB BAR ── */}
      <BottomTabBar
        activeTab="home"
        navigation={navigation}
        badges={{ more: unreadNotifs }}
      />
    </View>
  );
}

// ─── Styles — exact mirror of ResidentDashboard ───────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: P.tealDeep },
  safeTop:      { backgroundColor: P.tealDeep },
  scroll:       { flex: 1 },
  scrollContent:{ paddingBottom: 0 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: P.tealDeep,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  greetingText:{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  userName:    { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 2, marginBottom: 8 },
  unitRow:     { flexDirection: 'row', gap: 8, alignItems: 'center' },
  unitPill:    { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  unitText:    { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  sosPill:     { backgroundColor: 'rgba(198,40,40,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  sosPillText: { color: '#FF8A80', fontSize: 11, fontWeight: '800' },
  bellBtn:     { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarBtn:   { position: 'relative' },
  avatar:      { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center' },
  avatarBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Hero stats
  heroRow: { flexDirection: 'row', marginBottom: 16 },

  // Body
  body: {
    backgroundColor: P.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
    minHeight: 600,
  },

  // Dues / approval alert banner
  duesAlert:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: P.warningBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
  duesAlertText:{ fontSize: 12, fontWeight: '700', color: P.warning, flex: 1 },
  duesAlertCta: { fontSize: 12, fontWeight: '800', color: P.warning, marginLeft: 8 },

  // Feature grid
  featureGrid:  { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 14 },

  // Activity card
  activityCard: { backgroundColor: P.surface, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: P.border, marginBottom: 20 },

  // Society overview row
  overviewRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  overviewCard: { flex: 1, backgroundColor: P.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: P.border },
  overviewEmoji:{ fontSize: 20, marginBottom: 4 },
  overviewValue:{ fontSize: 18, fontWeight: '900', color: P.teal },
  overviewLabel:{ fontSize: 9, fontWeight: '700', color: P.textMuted, textAlign: 'center', marginTop: 2 },
});