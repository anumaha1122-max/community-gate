/**
 * RequestListScreen.js — Vendor Job Requests
 * ✅ Teal #1A7A7A theme matching resident + admin screens
 * ✅ All workflow statuses visible with proper tabs
 * ✅ Gate OTP display, quick quote button, status hints
 */
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { BusinessTabBar } from '../../../vendor/components/TabBars';
import useSharedStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5', tealMid: '#D0EEEE',
  tealText: '#3D6E6E', bg: '#E8F5F5', surface: '#FFFFFF', text: '#1A2E2E',
  textMuted: '#7A9E9E', border: '#D0EEEE',
  amber: '#B45309', amberBg: '#FEF3C7',
  green: '#15803D', greenBg: '#DCFCE7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
  red: '#B91C1C', redBg: '#FEE2E2',
};

const TABS = [
  { key: 'quote_requested', label: '📤 Quote Req' },
  { key: 'quoted', label: '💬 Quoted' },
  { key: 'approved_to_start', label: '🚀 Approved & Active' },
  { key: 'completed', label: '✅ Done' },
];

const STATUS_BADGE = {
  quote_requested: { label: 'Quote Req', color: '#0891B2', bg: '#E0F7FA' },
  assigned: { label: 'Assigned', color: P.purple, bg: P.purpleBg },
  quoted: { label: 'Quoted', color: P.amber, bg: P.amberBg },
  quote_sent_to_resident: { label: 'Sent to Res.', color: '#0D9488', bg: '#CCFBF1' },
  quote_accepted: { label: '✅ Accepted', color: P.green, bg: P.greenBg },
  quote_rejected: { label: '❌ Rejected', color: P.red, bg: P.redBg },
  approved_to_start: { label: '🚀 Go to Gate', color: P.purple, bg: P.purpleBg },
  work_in_progress: { label: '🔧 Working', color: P.amber, bg: P.amberBg },
  work_completed: { label: '✅ Done', color: P.green, bg: P.greenBg },
  payment_requested_to_admin: { label: '💳 Pmt Req', color: '#EA580C', bg: '#FFEDD5' },
  paid_to_vendor: { label: '💰 Paid', color: P.green, bg: P.greenBg },
};

function Badge({ status }) {
  const b = STATUS_BADGE[status] || { label: status, color: P.textMuted, bg: '#F5F5F5' };
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: b.bg }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: b.color }}>{b.label}</Text>
    </View>
  );
}

export default function RequestListScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('quote_requested');

  const authUser = useAuthStore(s => s.user);
  const requests = useSharedStore(s => s.maintenanceRequests);
  const users = useSharedStore(s => s.users);

  const vendorUser = users.find(u => u.role === 'vendor' && u.id === authUser?.id)
    || users.find(u => u.role === 'vendor');

  const myRequests = requests.filter(r => {
    if (r.assignedVendorId === vendorUser?.id) return true;
    if (r.invitedVendorIds?.includes(vendorUser?.id)) return true;
    return false;
  });

  const tabCount = (key) => myRequests.filter(r => {
    if (key === 'quote_requested') return r.status === 'quote_requested' || r.status === 'assigned';
    if (key === 'quoted') return ['quoted', 'quote_sent_to_resident', 'quote_rejected'].includes(r.status);
    if (key === 'approved_to_start') return ['quote_accepted', 'approved_to_start', 'work_in_progress'].includes(r.status);
    if (key === 'completed') return ['work_completed', 'payment_requested_to_admin', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor'].includes(r.status);
    return false;
  }).length;

  const filteredRequests = myRequests.filter(r => {
    if (activeTab === 'quote_requested') return r.status === 'quote_requested' || r.status === 'assigned';
    if (activeTab === 'quoted') return ['quoted', 'quote_sent_to_resident', 'quote_rejected'].includes(r.status);
    if (activeTab === 'approved_to_start') return ['quote_accepted', 'approved_to_start', 'work_in_progress'].includes(r.status);
    if (activeTab === 'completed') return ['work_completed', 'payment_requested_to_admin', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor'].includes(r.status);
    return false;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
      activeOpacity={0.85}
      style={s.card}
    >
      {/* Avatar */}
      <View style={s.avatar}>
        <Text style={{ fontSize: 20 }}>
          {{ Plumbing: '🚿', Electrical: '⚡', Painting: '🎨', Carpentry: '🪵', HVAC: '❄️' }[item.category] || '🔧'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={s.topRow}>
          <Text style={s.name} numberOfLines={1}>{item.title}</Text>
          <Badge status={item.status} />
        </View>
        <Text style={s.sub}>{item.category} · Unit {item.unit} · {item.residentName}</Text>
        <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {item.id}</Text>

        {/* Status hints */}
        {item.status === 'quote_requested' && (
          <Text style={[s.hint, { color: P.teal }]}>📤 You've been invited — tap to submit quote</Text>
        )}
        {item.status === 'assigned' && (
          <Text style={[s.hint, { color: P.teal }]}>👷 Assigned to you — tap to submit quote</Text>
        )}
        {item.status === 'quoted' && (
          <Text style={[s.hint, { color: P.amber }]}>💬 Quote ₹{item.quote?.amount?.toLocaleString('en-IN')} sent — awaiting admin review</Text>
        )}
        {item.status === 'quote_sent_to_resident' && (
          <Text style={[s.hint, { color: '#0D9488' }]}>📨 Quote forwarded to resident — awaiting their decision</Text>
        )}
        {item.status === 'quote_accepted' && (
          <Text style={[s.hint, { color: P.green }]}>✅ Resident accepted — admin must approve work start</Text>
        )}
        {item.status === 'approved_to_start' && (
          <Text style={[s.hint, { color: P.purple, fontWeight: '800' }]}>🚀 Approved! Proceed to gate with your OTP below</Text>
        )}
        {item.status === 'work_in_progress' && (
          <Text style={[s.hint, { color: P.amber }]}>
            🔧 {item.pendingStepApproval ? 'Arrival Pending — Waiting for resident to confirm arrival' : 'In Progress — Working at unit'}
          </Text>
        )}

        {/* Gate OTP */}
        {item.status === 'approved_to_start' && item.vendorGateOtp && (
          <View style={s.otpBox}>
            <Text style={s.otpLabel}>🔐 Gate Entry OTP</Text>
            <Text style={s.otpCode}>{item.vendorGateOtp}</Text>
            <Text style={s.otpSub}>Show to security guard at the gate</Text>
          </View>
        )}

        {/* Quote amount chip */}
        {item.quote?.amount && (
          <View style={s.quoteChip}>
            <Text style={s.quoteChipText}>₹{item.quote.amount.toLocaleString('en-IN')} quoted</Text>
          </View>
        )}

        {/* Quick actions */}
        {(item.status === 'quote_requested' || item.status === 'assigned') && (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('SendQuote', { requestId: item.id })}
          >
            <Text style={s.actionBtnText}>💰 Submit Quote</Text>
          </TouchableOpacity>
        )}
        {item.status === 'approved_to_start' && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.teal }]}
            onPress={() => navigation.navigate('ActiveWork', { jobId: item.id })}
          >
            <Text style={s.actionBtnText}>🔧 Start Work</Text>
          </TouchableOpacity>
        )}
        {item.status === 'work_in_progress' && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.amber }]}
            onPress={() => navigation.navigate('ActiveWork', { jobId: item.id })}
          >
            <Text style={s.actionBtnText}>🏁 Finish Work</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={P.teal} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <TouchableOpacity style={s.backBtnCircle} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backBtnArrow}>‹</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={s.headerTitle}>My Requests</Text>
            <Text style={s.headerSub}>{myRequests.length} total · {tabCount('quote_requested')} need quote</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('VendorNotifications')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(t => {
          const cnt = tabCount(t.key);
          return (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, activeTab === t.key && s.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>
                {t.label}{cnt > 0 ? ` (${cnt})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={s.emptyTitle}>No requests here</Text>
            <Text style={s.emptySub}>
              {activeTab === 'quote_requested'
                ? 'Admin will invite you when a quote is needed.'
                : 'Nothing in this category yet.'}
            </Text>
          </View>
        }
      />

      <BusinessTabBar
        activeTab="Requests"
        onTabPress={(tab) => {
          if (tab === 'Home') navigation.navigate('BusinessHome');
          if (tab === 'Jobs') navigation.navigate('JobsList');
          if (tab === 'Earnings') navigation.navigate('Earnings');
          if (tab === 'Profile') navigation.navigate('VendorProfile');
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.teal, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtnCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtnArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  bellBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: P.teal },
  tabText: { fontSize: 10, fontWeight: '600', color: P.textMuted },
  tabTextActive: { color: P.teal, fontWeight: '800' },
  list: { padding: 14, paddingBottom: 100 },
  card: {
    backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: P.border,
    shadowColor: P.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 8 },
  name: { fontSize: 14, fontWeight: '800', color: P.text, flex: 1 },
  sub: { fontSize: 12, color: P.textMuted, marginTop: 1 },
  date: { fontSize: 11, color: P.tealMid, marginTop: 3 },
  hint: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  otpBox: { marginTop: 10, backgroundColor: '#EDE9FE', borderRadius: 12, padding: 12, borderWidth: 2, borderColor: '#7C3AED', alignItems: 'center' },
  otpLabel: { fontSize: 11, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  otpCode: { fontSize: 28, fontWeight: '900', color: '#4C1D95', letterSpacing: 6 },
  otpSub: { fontSize: 10, color: '#7C3AED', marginTop: 4 },
  quoteChip: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: P.greenBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#BBF7D0' },
  quoteChipText: { fontSize: 11, fontWeight: '700', color: P.green },
  actionBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: P.teal, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: P.text },
  emptySub: { fontSize: 14, color: P.textMuted, textAlign: 'center', lineHeight: 20 },
});