/**
 * VendorHomeScreen.js — Rebuilt to match ResidentDashboard design language
 *
 * Design: Deep teal header → soft rounded body (same as resident)
 * Stats: active jobs, pending quotes, earnings
 * Quick actions: 2-col feature cards + shortcut row
 * Recent activity feed
 * BusinessTabBar at bottom
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, RefreshControl, Platform,
} from 'react-native';
import { useAuthStore }   from '../../../store/AuthStore';
import useAppStore        from '../../../store/appStore';
import useVendorStore     from '../../../store/vendorStore';
import { BusinessTabBar } from '../../../vendor/components/TabBars';

// ─── Palette (mirrors ResidentDashboard exactly) ──────────────────────────────
const P = {
  teal:      '#1A7A7A', tealDark:  '#0D6E6E', tealDeep:  '#1A7A7A',
  tealSoft:  '#E8F5F5', tealMid:   '#D0EEEE', tealText:  '#3D6E6E',
  bg:        '#E8F5F5', surface:   '#FFFFFF',
  text:      '#1A2E2E', textMuted: '#7A9E9E', textSub:   '#3D6E6E',
  border:    '#D0EEEE',
  danger:    '#C62828', dangerBg:  '#FEE2E2',
  warning:   '#E65100', warningBg: '#FEF3C7',
  purple:    '#6D28D9', purpleBg:  '#EDE9FE',
  amber:     '#B45309', amberBg:   '#FEF3C7',
  green:     '#15803D', greenBg:   '#DCFCE7',
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};
const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// ─── Hero Stat Pill ───────────────────────────────────────────────────────────
function HeroStat({ value, label, onPress }) {
  return (
    <TouchableOpacity style={hs.pill} onPress={onPress} activeOpacity={0.8}>
      <Text style={hs.value}>{value}</Text>
      <Text style={hs.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const hs = StyleSheet.create({
  pill:  { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  value: { fontSize: 22, fontWeight: '900', color: '#CCFBF1' },
  label: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center' },
});

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, onSeeAll }) {
  return (
    <View style={sec.row}>
      <Text style={sec.title}>{title}</Text>
      {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={sec.seeAll}>See all ›</Text></TouchableOpacity>}
    </View>
  );
}
const sec = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:  { fontSize: 13, fontWeight: '800', color: P.text, letterSpacing: 0.3 },
  seeAll: { fontSize: 12, fontWeight: '700', color: P.teal },
});

// ─── Feature Card (2-column grid) ────────────────────────────────────────────
function FeatureCard({ emoji, label, sub, badge, color, onPress }) {
  return (
    <TouchableOpacity style={fc.card} onPress={onPress} activeOpacity={0.82}>
      <View style={[fc.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        {badge > 0 && (
          <View style={[fc.badge, { backgroundColor: color }]}>
            <Text style={fc.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={fc.label}>{label}</Text>
      <Text style={fc.sub}>{sub}</Text>
    </TouchableOpacity>
  );
}
const fc = StyleSheet.create({
  card:     { width: '48%', backgroundColor: P.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  badge:    { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText:{ color: '#FFF', fontSize: 9, fontWeight: '800' },
  label:    { fontSize: 13, fontWeight: '800', color: P.text, marginBottom: 3 },
  sub:      { fontSize: 11, color: P.textMuted, lineHeight: 15 },
});

// ─── Shortcut Row ─────────────────────────────────────────────────────────────
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

// ─── Activity Row ─────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function VendorHomeScreen({ navigation }) {
  const user          = useAuthStore(s => s.user);
  const allUsers      = useAppStore(s => s.users);
  const requests      = useAppStore(s => s.maintenanceRequests);
  const notifications = useVendorStore(s => s.notifications);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const vendorUser = allUsers.find(u => u.role === 'vendor' && u.id === user?.id)
    || allUsers.find(u => u.role === 'vendor');

  const myJobs = requests.filter(r =>
    r.assignedVendorId === vendorUser?.id || r.invitedVendorIds?.includes(vendorUser?.id)
  );

  const pendingQuotes    = myJobs.filter(r => ['quote_requested','assigned'].includes(r.status)).length;
  const activeJobs       = myJobs.filter(r => r.status === 'work_in_progress').length;
  const approvedJobs     = myJobs.filter(r => ['quote_accepted','approved_to_start'].includes(r.status)).length;
  const awaitingApproval = myJobs.filter(r => r.pendingStepApproval === true).length;
  const totalEarnings    = myJobs
    .filter(r => r.status === 'paid_to_vendor')
    .reduce((s, r) => s + (r.quote?.amount || 0), 0);
  const unreadNotifs     = notifications.filter(n => !n.read).length;

  const recentActivity = [
    ...myJobs.filter(r => ['quote_requested','assigned'].includes(r.status)).slice(0, 2).map(r => ({
      id: 'q-' + r.id, emoji: '📋',
      title: r.title || r.category,
      sub: `Quote requested · Unit ${r.unit}`,
      color: P.purple, time: fmt(r.createdAt), route: 'RequestList',
    })),
    ...myJobs.filter(r => r.status === 'work_in_progress').slice(0, 2).map(r => ({
      id: 'w-' + r.id, emoji: '🔧',
      title: r.title || r.category,
      sub: `Stage ${r._workStep || 0}/12 · ${r.pendingStepApproval ? '⏳ Awaiting approval' : 'In progress'}`,
      color: P.amber, time: fmt(r.createdAt), route: 'JobsList',
    })),
    ...myJobs.filter(r => r.status === 'approved_to_start').slice(0, 1).map(r => ({
      id: 'a-' + r.id, emoji: '🚀',
      title: r.title || r.category,
      sub: `Approved — show OTP at gate · Unit ${r.unit}`,
      color: P.green, time: fmt(r.createdAt), route: 'RequestList',
    })),
  ].slice(0, 5);

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={P.teal} />}
      >
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.greetingText}>{greeting()},</Text>
              <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Vendor'} 👋</Text>
              <View style={s.pillRow}>
                <View style={s.pill}>
                  <Text style={s.pillText}>🔧  {vendorUser?.company || 'Service Provider'}</Text>
                </View>
                {awaitingApproval > 0 && (
                  <View style={[s.pill, { backgroundColor: 'rgba(255,200,0,0.25)' }]}>
                    <Text style={[s.pillText, { color: '#FCD34D' }]}>⏳ {awaitingApproval} Awaiting</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('VendorNotifications')}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              {unreadNotifs > 0 && (
                <View style={s.bellBadge}>
                  <Text style={s.bellBadgeText}>{unreadNotifs > 9 ? '9+' : unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={s.heroRow}>
            <HeroStat value={activeJobs}   label="Active Jobs"    onPress={() => navigation.navigate('JobsList')} />
            <View style={{ width: 10 }} />
            <HeroStat value={pendingQuotes} label="Quote Requests" onPress={() => navigation.navigate('RequestList')} />
            <View style={{ width: 10 }} />
            <HeroStat
              value={totalEarnings > 0 ? `₹${(totalEarnings / 1000).toFixed(1)}K` : '₹0'}
              label="Total Earned"
              onPress={() => navigation.navigate('Earnings')}
            />
          </View>
        </View>

        {/* ═══ BODY ═══ */}
        <View style={s.body}>

          {/* Alert banners */}
          {pendingQuotes > 0 && (
            <TouchableOpacity style={s.alertBanner} onPress={() => navigation.navigate('RequestList')} activeOpacity={0.85}>
              <Text style={s.alertBannerText}>📋  {pendingQuotes} new quote request{pendingQuotes > 1 ? 's' : ''} waiting</Text>
              <Text style={s.alertBannerCta}>Submit →</Text>
            </TouchableOpacity>
          )}
          {approvedJobs > 0 && (
            <TouchableOpacity
              style={[s.alertBanner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
              onPress={() => navigation.navigate('RequestList')} activeOpacity={0.85}
            >
              <Text style={[s.alertBannerText, { color: P.purple }]}>🚀  {approvedJobs} job{approvedJobs > 1 ? 's' : ''} approved — proceed to gate with OTP</Text>
              <Text style={[s.alertBannerCta, { color: P.purple }]}>View →</Text>
            </TouchableOpacity>
          )}

          {/* ── My Work ── */}
          <SectionHead title="My Work" />
          <View style={s.featureGrid}>
            <FeatureCard
              emoji="📋" label="Requests" color={P.purple}
              sub={pendingQuotes > 0 ? `${pendingQuotes} need your quote` : 'No new requests'}
              badge={pendingQuotes}
              onPress={() => navigation.navigate('RequestList')}
            />
            <FeatureCard
              emoji="🔧" label="Active Jobs" color={P.amber}
              sub={activeJobs > 0 ? `${activeJobs} job${activeJobs > 1 ? 's' : ''} in progress` : 'No active work'}
              badge={activeJobs}
              onPress={() => navigation.navigate('JobsList')}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow navigation={navigation} items={[
              { emoji: '🚀', label: 'Approved',  color: P.green,  route: 'RequestList',      badge: approvedJobs },
              { emoji: '✅', label: 'Completed', color: P.teal,   route: 'JobsList',         badge: 0 },
              { emoji: '⏳', label: 'Awaiting',  color: P.amber,  route: 'JobsList',         badge: awaitingApproval },
              { emoji: '💰', label: 'Earnings',  color: P.green,  route: 'Earnings',         badge: 0 },
            ]} />
          </View>

          {/* ── Business ── */}
          <SectionHead title="Business" />
          <View style={{ marginBottom: 20 }}>
            <ShortcutRow navigation={navigation} items={[
              { emoji: '💳', label: 'Payments',    color: P.teal,   route: 'Earnings',            badge: 0 },
              { emoji: '📄', label: 'AMC',         color: P.purple, route: 'AMCContracts',        badge: 0 },
              { emoji: '🔔', label: 'Alerts',      color: P.amber,  route: 'VendorNotifications', badge: unreadNotifs },
              { emoji: '👤', label: 'Profile',     color: P.teal,   route: 'VendorProfile',       badge: 0 },
            ]} />
          </View>

          {/* ── Recent Activity ── */}
          {recentActivity.length > 0 && (
            <>
              <SectionHead title="Recent Activity" onSeeAll={() => navigation.navigate('RequestList')} />
              <View style={s.activityCard}>
                {recentActivity.map((item, i) => (
                  <ActivityRow
                    key={item.id} {...item}
                    last={i === recentActivity.length - 1}
                    onPress={() => navigation.navigate(item.route)}
                  />
                ))}
              </View>
            </>
          )}

          {recentActivity.length === 0 && myJobs.length === 0 && (
            <View style={s.emptyState}>
              <Text style={{ fontSize: 52 }}>🔧</Text>
              <Text style={s.emptyTitle}>No Jobs Yet</Text>
              <Text style={s.emptySub}>Admin will assign you jobs when maintenance requests come in. Keep your profile verified!</Text>
            </View>
          )}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      <BusinessTabBar
        activeTab="Home"
        onTabPress={(tab) => {
          if (tab === 'Requests') navigation.navigate('RequestList');
          if (tab === 'Jobs')     navigation.navigate('JobsList');
          if (tab === 'Earnings') navigation.navigate('Earnings');
          if (tab === 'Profile')  navigation.navigate('VendorProfile');
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: P.tealDeep },
  safeTop:      { backgroundColor: P.tealDeep },
  scroll:       { flex: 1 },
  scrollContent:{ paddingBottom: 0 },

  header:       { backgroundColor: P.tealDeep, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  greetingText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  userName:     { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 2, marginBottom: 8 },
  pillRow:      { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  pill:         { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  pillText:     { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  bellBtn:      { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellBadge:    { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center' },
  bellBadgeText:{ color: '#FFF', fontSize: 9, fontWeight: '800' },
  heroRow:      { flexDirection: 'row' },

  body:         { backgroundColor: P.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 24, minHeight: 600 },

  alertBanner:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: P.warningBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
  alertBannerText:{ fontSize: 12, fontWeight: '700', color: P.warning, flex: 1 },
  alertBannerCta: { fontSize: 12, fontWeight: '800', color: P.warning, marginLeft: 8 },

  featureGrid:  { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  activityCard: { backgroundColor: P.surface, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: P.border, marginBottom: 20 },

  emptyState:   { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle:   { fontSize: 17, fontWeight: '800', color: P.text },
  emptySub:     { fontSize: 14, color: P.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
});