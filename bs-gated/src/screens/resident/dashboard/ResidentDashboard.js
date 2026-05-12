/**
 * ResidentDashboard.js — Redesigned
 *
 * Design direction: "Premium Society Living"
 *   – Deep teal header bleeds into a soft card-based body
 *   – Large hero stats section with real data
 *   – Categorised shortcut sections (not a flat 12-tile grid)
 *   – Animated SOS bar (compact, bottom of header — not a giant centred button)
 *   – Recent activity feed below shortcuts
 *   – Custom bottom tab bar (no new packages — pure RN TouchableOpacity)
 *
 * Bottom tabs: Home · Security · Services · Community · Profile
 * Each tab is a Stack screen root — tabs are rendered at the ResidentDashboard
 * level so they persist across the whole resident experience.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Animated, RefreshControl, Platform,
} from 'react-native';

import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import useAppStore from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useRoleGuard } from '../../../guards/RoleGuard';
import { useAuthGuard } from '../../../guards/AuthGuard';
import { useApprovalGuard } from '../../../guards/ApprovalGuard';

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  teal: '#1A7A7A',
  tealDark: '#0D6E6E',
  tealDeep: '#1A7A7A',
  tealSoft: '#E8F5F5',
  tealMid: '#D0EEEE',
  tealText: '#3D6E6E',
  bg: '#E8F5F5',
  surface: '#FFFFFF',
  text: '#1A2E2E',
  textMuted: '#7A9E9E',
  textSub: '#3D6E6E',
  border: '#D0EEEE',
  danger: '#C62828',
  dangerBg: '#FEE2E2',
  warning: '#E65100',
  warningBg: '#FEF3C7',
  success: '#1A7A7A',
  successBg: '#CCFBF1',


};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// ─── SOS PULSE BUTTON (original style — red, centred, pulsing) ──────────────
function SOSButton({ onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  return (
    <Animated.View style={[sos.wrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={sos.btn} onPress={onPress} activeOpacity={0.85}>
        <Text style={sos.text}>🚨 SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const sos = StyleSheet.create({
  wrap: { alignSelf: 'center', marginBottom: 20, marginTop: 4 },
  btn: {
    backgroundColor: '#C62828', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 50,
    shadowColor: '#C62828', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 8
  },
  text: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
});
function HeroStat({ value, label, color, bg, onPress }) {
  return (
    <TouchableOpacity style={[hs.pill, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[hs.value, { color }]}>{value}</Text>
      <Text style={hs.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const hs = StyleSheet.create({
  pill: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '700', color: P.textMuted, marginTop: 3, textAlign: 'center' },
});

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 13, fontWeight: '800', color: P.text, letterSpacing: 0.3 },
  seeAll: { fontSize: 12, fontWeight: '700', color: P.teal },
});

// ─── FEATURE CARD (wide, 2-column) ───────────────────────────────────────────
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
  card: { width: '48%', backgroundColor: P.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 3 },
  sub: { fontSize: 11, color: P.textMuted, lineHeight: 15 },
});

// ─── SMALL SHORTCUT (icon-only row for secondary features) ───────────────────
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { alignItems: 'center', flex: 1 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative' },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700', color: P.textSub, textAlign: 'center' },
});

// ─── ACTIVITY ROW ─────────────────────────────────────────────────────────────
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
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  border: { borderBottomWidth: 1, borderBottomColor: P.border },
  dot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: P.text },
  sub: { fontSize: 11, color: P.textMuted, marginTop: 2 },
  time: { fontSize: 10, color: P.textMuted, marginLeft: 8 },
});

// ─── CUSTOM BOTTOM TAB BAR ─────────────────────────────────────────────────────
const TABS = [
  { key: 'Home', emoji: '⊞', label: 'Home', route: 'ResidentDashboard' },
  { key: 'Shop', emoji: '🛒', label: 'Shop', route: 'MarketHome' },
  { key: 'Services', emoji: '🔧', label: 'Services', route: 'ResidentMaintenance' },
  { key: 'BuySell', emoji: '♻️', label: 'Buy/Sell', route: 'BuySell' },
  { key: 'Profile', emoji: '👤', label: 'Profile', route: 'Profile' },
];

function BottomTabBar({ activeTab, navigation, unreadCount, pendingVisitors, activeMaint, cartCount }) {
  const badges = {
    Shop: cartCount,
    Services: activeMaint,
    BuySell: 0,
  };

  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });
  const isVerified = verificationStatus === 'approved';

  return (
    <View style={tb.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        const badge = badges[tab.key] || 0;
        const isProfile = tab.key === 'Profile';
        const locked = !isVerified && !isProfile;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tb.tab}
            onPress={() => {
              if (locked) {
                Alert.alert('🔒 Verification Required', 'Please verify your account from Profile to unlock this section.', [
                  { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
                  { text: 'OK', style: 'cancel' },
                ]);
                return;
              }
              navigation.navigate(tab.route);
            }}
            activeOpacity={0.7}
          >
            <View style={[tb.iconWrap, isActive && tb.iconWrapActive, locked && tb.iconWrapLocked]}>
              <Text style={[tb.emoji, isActive && { fontSize: 22 }, locked && { opacity: 0.4 }]}>{tab.emoji}</Text>
              {locked && <Text style={tb.lockIcon}>🔒</Text>}
              {!locked && badge > 0 && (
                <View style={tb.badge}>
                  <Text style={tb.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tb.label, isActive && tb.labelActive, locked && { opacity: 0.4 }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  container: {
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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 12, position: 'relative' },
  iconWrapActive: { backgroundColor: P.tealSoft },
  emoji: { fontSize: 20 },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '600', color: P.textMuted, marginTop: 2 },
  labelActive: { color: P.teal, fontWeight: '800' },
  iconWrapLocked: { opacity: 0.6 },
  lockIcon: { position: 'absolute', top: -4, right: -4, fontSize: 10 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResidentDashboard({ navigation }) {
  // ALL hooks must be called before any early return (React rules of hooks)
  const { isLoggedIn } = useAuthGuard();
  const { hasRole } = useRoleGuard(['resident']);

  const user = useAuthStore(s => s.user);
  const triggerSOS = useSecurityStore(s => s.triggerSOS);

  // Live data
  const bills = useResidentStore(s => s.bills);
  const notifications = useResidentStore(s => s.notifications);
  const amenityBookings = useResidentStore(s => s.amenityBookings);
  const cart = useAppStore(s => s.cart);
  const maintenanceReqs = useAppStore(s => s.maintenanceRequests);
  const p2pListings = useAppStore(s => s.p2pListings);
  const visitors = useSecurityStore(s => s.visitors);
  const deliveries = useSecurityStore(s => s.deliveries);
  const sosAlerts = useSecurityStore(s => s.sosAlerts);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // Guard check AFTER all hooks — React rules of hooks require this
  if (!isLoggedIn || !hasRole) return null;

  const myId = user?.id || 'res1';

  // Computed
  const myBills = bills.filter(b => b.residentId === myId);
  const unpaidBills = myBills.filter(b => b.status === 'unpaid');
  const totalDues = unpaidBills.reduce((s, b) => s + (b.total || 0), 0);
  const myVisitors = visitors.filter(v => v.hostResidentId === myId);
  const pendingVisitors = myVisitors.filter(v => ['CREATED', 'APPROVED'].includes(v.status)).length;
  const insideVisitors = myVisitors.filter(v => v.status === 'CHECKED_IN').length;
  const myMaintenance = maintenanceReqs.filter(r => r.residentId === myId);
  const activeMaint = myMaintenance.filter(r => !['paid_to_vendor', 'quote_rejected'].includes(r.status)).length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const myBookings = amenityBookings.filter(b => b.residentId === myId && b.status === 'confirmed');
  const activeDeliveries = deliveries.filter(d => d.hostResidentId === myId && d.status === 'PENDING').length;
  const activeSOS = sosAlerts.filter(a => a.residentId === myId && a.status !== 'RESOLVED').length;

  const handleSOS = () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will immediately alert ALL security guards and admin.\n\nOnly use in a real emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🚨 SEND SOS NOW',
          style: 'destructive',
          onPress: () => {
            triggerSOS(myId, user?.name || 'Resident', user?.unit || '—', 'Emergency', 'Need immediate help');
            Alert.alert('🚨 SOS Sent!', 'Guards and admin notified. Help is on the way.', [
              { text: 'OK' },
              { text: 'Track Status', onPress: () => navigation.navigate('SOSTracking') },
            ]);
          },
        },
      ]
    );
  };

  // Build recent activity feed from all stores
  const recentActivity = [
    ...myVisitors.slice(0, 3).map(v => ({
      id: 'vis-' + v.id,
      emoji: { CHECKED_IN: '🚶', APPROVED: '✅', CREATED: '⏳', DENIED: '🚫', CHECKED_OUT: '🚪' }[v.status] || '👤',
      title: v.name,
      sub: `${v.purpose} · ${v.status}`,
      color: v.status === 'DENIED' ? P.danger : P.teal,
      time: fmt(v.createdAt),
      route: 'VisitorList',
    })),
    ...myMaintenance.slice(0, 2).map(r => ({
      id: 'mnt-' + r.id,
      emoji: '🔧',
      title: r.title || r.category || 'Maintenance',
      sub: r.status?.replace(/_/g, ' ') || 'Submitted',
      color: P.warning,
      time: fmt(r.createdAt),
      route: 'ResidentMaintenance',
    })),
    ...myBills.filter(b => b.status === 'unpaid').slice(0, 1).map(b => ({
      id: 'bill-' + b.id,
      emoji: '💳',
      title: b.month || 'Maintenance Bill',
      sub: `₹${(b.total || 0).toLocaleString('en-IN')} due`,
      color: P.danger,
      time: fmt(b.dueDate),
      route: 'BillingList',
    })),
  ]
    .sort((a, b) => 0) // maintain insertion order
    .slice(0, 5);

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
              <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Resident'} 👋</Text>
              <View style={s.unitRow}>
                <View style={s.unitPill}>
                  <Text style={s.unitText}>🏠  Unit {user?.unit || '—'}</Text>
                </View>
                {activeSOS > 0 && (
                  <View style={s.sosPill}>
                    <Text style={s.sosPillText}>🚨 SOS Active</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {/* Notification bell */}
              <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={s.avatarBadge}><Text style={s.avatarBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero stats row */}
          <View style={s.heroRow}>
            <HeroStat
              value={totalDues > 0 ? `₹${(totalDues / 1000).toFixed(1)}K` : '✓'}
              label={totalDues > 0 ? 'Dues Pending' : 'No Dues'}
              color={totalDues > 0 ? '#FFCDD2' : '#CCFBF1'}
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('BillingList')}
            />
            <View style={{ width: 10 }} />
            <HeroStat
              value={pendingVisitors + insideVisitors}
              label="Visitors Today"
              color="#CCFBF1"
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('VisitorList')}
            />
            <View style={{ width: 10 }} />
            <HeroStat
              value={activeMaint}
              label="Open Requests"
              color="#CCFBF1"
              bg="rgba(255,255,255,0.13)"
              onPress={() => navigation.navigate('ResidentMaintenance')}
            />
          </View>
        </View>

        {/* ═══ BODY ═══ */}
        <View style={s.body}>

          {/* SOS Button — centred red pulsing */}
          <SOSButton onPress={handleSOS} />

          {/* Dues alert */}
          {totalDues > 0 && (
            <TouchableOpacity style={s.duesAlert} onPress={() => navigation.navigate('BillingList')}>
              <Text style={s.duesAlertText}>⚠️  ₹{totalDues.toLocaleString('en-IN')} maintenance dues pending</Text>
              <Text style={s.duesAlertCta}>Pay Now →</Text>
            </TouchableOpacity>
          )}

          {/* ── SECTION 1: Security & Entry ── */}
          <SectionHead title="Security & Entry" />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="👥" label="Visitors" color={P.teal}
              sub={pendingVisitors > 0 ? `${pendingVisitors} pending approval` : insideVisitors > 0 ? `${insideVisitors} inside` : 'No active visitors'}
              badge={pendingVisitors}
              onPress={() => navigation.navigate('VisitorList')}
            />
            <FeatureCard
              emoji="📦" label="Deliveries" color="#F57F17"
              sub={activeDeliveries > 0 ? `${activeDeliveries} pass active` : 'Create gate pass'}
              badge={activeDeliveries}
              onPress={() => navigation.navigate('DeliveryPass')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '🚗', label: 'Parking', color: '#6A1B9A', route: 'GuestParking', badge: 0 },
                { emoji: '🚫', label: 'Blacklist', color: P.danger, route: 'BlacklistView', badge: 0 },
                { emoji: '🚨', label: 'My SOS', color: P.danger, route: 'SOSTracking', badge: activeSOS },
                { emoji: '👩‍🍳', label: 'Maid Track', color: '#0D9488', route: 'GPSDashboard', badge: 0 },
              ]}
            />
          </View>

          {/* ── SECTION 2: Home & Finances ── */}
          <SectionHead title="Home & Finances" />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="💳" label="Bills" color={P.danger}
              sub={unpaidBills.length > 0 ? `${unpaidBills.length} unpaid · ₹${totalDues.toLocaleString('en-IN')}` : 'All clear ✓'}
              badge={unpaidBills.length}
              onPress={() => navigation.navigate('BillingList')}
            />
            <FeatureCard
              emoji="🔧" label="Maintenance" color={P.warning}
              sub={activeMaint > 0 ? `${activeMaint} active request${activeMaint > 1 ? 's' : ''}` : 'No open requests'}
              badge={activeMaint}
              onPress={() => navigation.navigate('ResidentMaintenance')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '🏊', label: 'Amenities', color: '#7C3AED', route: 'Amenities', badge: myBookings.length },
                { emoji: '⚡', label: 'EV Charging', color: '#0D9488', route: 'EVCharging', badge: 0 },
                { emoji: '🏠', label: 'Real Estate', color: P.teal, route: 'RealEstate', badge: 0 },
                { emoji: '🛒', label: 'Shop', color: '#1565C0', route: 'MarketHome', badge: cartCount },
              ]}
            />
          </View>

          {/* ── SECTION 3: Community ── */}
          <SectionHead title="Community" />
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow
              navigation={navigation}
              items={[
                { emoji: '📋', label: 'Notice Board', color: P.teal, route: 'NoticeBoard', badge: 0 },
                { emoji: '🔔', label: 'Alerts', color: P.warning, route: 'Notifications', badge: unreadCount },
                { emoji: '♻️', label: 'Buy / Sell', color: '#7C3AED', route: 'BuySell', badge: 0 },
                { emoji: '📊', label: 'Reports', color: P.teal, route: 'ResidentReports', badge: 0 },
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

          {/* Upcoming amenity bookings */}
          {myBookings.length > 0 && (
            <>
              <SectionHead title="Upcoming Bookings" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {myBookings.slice(0, 4).map(b => (
                  <TouchableOpacity key={b.id} style={s.bookingChip} onPress={() => navigation.navigate('Amenities')} activeOpacity={0.8}>
                    <Text style={{ fontSize: 22, marginBottom: 6 }}>{b.amenityEmoji || '🏛️'}</Text>
                    <Text style={s.bookingChipTitle}>{b.amenityName}</Text>
                    <Text style={s.bookingChipSub}>{b.date}</Text>
                    <Text style={s.bookingChipSlot}>{b.slot}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      {/* ── CUSTOM BOTTOM TAB BAR ── */}
      <BottomTabBar
        activeTab="Home"
        navigation={navigation}
        unreadCount={unreadCount}
        pendingVisitors={pendingVisitors}
        activeMaint={activeMaint}
        cartCount={cartCount}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.tealDeep },
  safeTop: { backgroundColor: P.tealDeep },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: P.tealDeep,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  greetingText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  userName: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 2, marginBottom: 8 },
  unitRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  unitPill: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  unitText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  sosPill: { backgroundColor: 'rgba(198,40,40,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  sosPillText: { color: '#FF8A80', fontSize: 11, fontWeight: '800' },
  bellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarBtn: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center' },
  avatarBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Hero stats
  heroRow: { flexDirection: 'row', marginBottom: 16 },

  // SOS button styles are in sos.* above

  // Body
  body: {
    backgroundColor: P.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
    minHeight: 600,
  },

  // Dues alert
  duesAlert: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: P.warningBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
  duesAlertText: { fontSize: 12, fontWeight: '700', color: P.warning, flex: 1 },
  duesAlertCta: { fontSize: 12, fontWeight: '800', color: P.warning, marginLeft: 8 },

  // Feature grid
  featureGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 14 },

  // Activity card
  activityCard: { backgroundColor: P.surface, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: P.border, marginBottom: 20 },

  // Booking chips
  bookingChip: { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginRight: 10, width: 130, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  bookingChipTitle: { fontSize: 12, fontWeight: '800', color: P.text, textAlign: 'center' },
  bookingChipSub: { fontSize: 11, color: P.textMuted, marginTop: 2 },
  bookingChipSlot: { fontSize: 10, color: P.teal, fontWeight: '700', marginTop: 2 },
});