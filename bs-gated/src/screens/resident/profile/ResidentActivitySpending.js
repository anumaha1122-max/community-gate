/**
 * ResidentActivitySpending.js
 * MyActivitiesScreen — unified timeline of all resident activities
 * MySpendingsScreen  — all money spent across the platform with breakdown
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, FlatList,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import useResidentStore     from '../../../store/residentStore';
import useAppStore          from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const C = {
  primary: '#1A2E4A', accent: '#D4AF5A', success: '#0F766E',
  danger: '#DC2626', warn: '#D97706', purple: '#7C3AED',
  bg: '#F5F7FA', card: '#FFF', border: '#E2E8F0', text: '#1E293B', muted: '#64748B',
};

function Hdr({ title, onBack }) {
  return (
    <View style={s.hdr}>
      <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>‹</Text></TouchableOpacity>
      <Text style={s.hdrT}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

function timeAgo(d) {
  if (!d) return '—';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ─── MY ACTIVITIES SCREEN ──────────────────────────────────────────────────────
export function MyActivitiesScreen({ navigation }) {
  const theme = useTheme();
  const user        = useAuthStore(s => s.user);
  const myId        = user?.id || 'res1';

  // Sources
  const visitors        = useSecurityStore(s => s.visitors);
  const amenityBookings = useResidentStore(s => s.amenityBookings);
  const evBookings      = useResidentStore(s => s.evBookings);
  const bills           = useResidentStore(s => s.bills);
  const maintenance     = useAppStore(s => s.maintenanceRequests);
  const notifications   = useResidentStore(s => s.notifications);

  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all',       label: 'All' },
    { id: 'visitor',   label: 'Visitors' },
    { id: 'amenity',   label: 'Amenities' },
    { id: 'ev',        label: 'EV' },
    { id: 'billing',   label: 'Billing' },
    { id: 'maint',     label: 'Maintenance' },
  ];

  const activities = useMemo(() => {
    const list = [];

    // Visitors
    const myVisitors = visitors.filter(v => v.hostResidentId === myId);
    myVisitors.forEach(v => {
      list.push({
        id: 'vis-' + v.id,
        type: 'visitor',
        emoji: v.status === 'CHECKED_IN' ? '🏠' : v.status === 'CHECKED_OUT' ? '🚪' : v.status === 'DENIED' ? '🚫' : '👤',
        title: `${v.status === 'CHECKED_IN' ? 'Visitor Entered' : v.status === 'CHECKED_OUT' ? 'Visitor Left' : v.status === 'DENIED' ? 'Visitor Denied' : 'Visitor Pass Created'}`,
        sub: `${v.name} · ${v.purpose}`,
        detail: v.status === 'CHECKED_IN' ? `Entered at ${v.entryGate || 'gate'}` : v.status === 'CHECKED_OUT' ? `Checked out` : `Status: ${v.status}`,
        color: v.status === 'CHECKED_IN' ? C.success : v.status === 'DENIED' ? C.danger : C.muted,
        at: v.checkedInAt || v.createdAt,
      });
    });

    // Amenity Bookings
    const myAmenity = amenityBookings.filter(b => b.residentId === myId);
    myAmenity.forEach(b => {
      list.push({
        id: 'amn-' + b.id,
        type: 'amenity',
        emoji: b.checkedIn ? '✅' : b.status === 'cancelled' ? '❌' : b.status === 'confirmed' ? '🏊' : '⏳',
        title: b.checkedIn ? 'Amenity Entry Verified' : b.status === 'confirmed' ? 'Amenity Booked' : b.status === 'cancelled' ? 'Booking Cancelled' : 'Amenity Booking Pending',
        sub: `${b.amenityEmoji || '🏊'} ${b.amenityName} · ${b.slot}`,
        detail: `📅 ${b.date}${b.amount > 0 ? ` · ₹${b.amount} paid` : ' · Free'}${b.checkedIn ? ` · Verified by ${b.verifiedByName || 'Guard'}` : ''}`,
        color: b.checkedIn ? C.success : b.status === 'confirmed' ? C.purple : b.status === 'cancelled' ? C.danger : C.warn,
        at: b.checkedInAt || b.paidAt || b.bookedAt,
      });
    });

    // EV Bookings
    const myEV = evBookings.filter(b => b.residentId === myId);
    myEV.forEach(b => {
      list.push({
        id: 'ev-' + b.id,
        type: 'ev',
        emoji: b.checkedIn ? '⚡' : b.status === 'booked' ? '🔌' : b.status === 'payment_pending' ? '⏳' : '⚡',
        title: b.checkedIn ? 'EV Charging Started' : b.status === 'booked' ? 'EV Slot Booked' : b.status === 'completed' ? 'EV Charging Completed' : 'EV Booking Pending',
        sub: `Slot ${b.slot} · ${b.vehicleNumber}`,
        detail: `📅 ${b.date} · ${b.startTime}–${b.endTime} · ₹${b.depositAmount} deposit`,
        color: b.checkedIn ? C.success : '#0D9488',
        at: b.checkedInAt || b.paidAt || b.bookedAt,
      });
    });

    // Billing (paid bills)
    const myBills = bills.filter(b => b.residentId === myId && b.status === 'paid');
    myBills.forEach(b => {
      list.push({
        id: 'bill-' + b.id,
        type: 'billing',
        emoji: '💳',
        title: 'Bill Paid',
        sub: `${b.month || b.type || 'Invoice'} · ₹${b.total || b.amount}`,
        detail: `TXN: ${b.transactionId || 'N/A'} · ${fmtDate(b.paidAt)}`,
        color: C.success,
        at: b.paidAt,
      });
    });

    // Maintenance
    const myMaint = maintenance.filter(r => r.residentId === myId);
    myMaint.forEach(r => {
      list.push({
        id: 'mnt-' + r.id,
        type: 'maint',
        emoji: r.status === 'paid_to_vendor' ? '✅' : r.status === 'in_progress' ? '🔧' : r.status === 'submitted' ? '📝' : '🔧',
        title: r.status === 'paid_to_vendor' ? 'Maintenance Completed' : r.status === 'in_progress' ? 'Maintenance In Progress' : 'Maintenance Submitted',
        sub: `${r.category} · ${r.title}`,
        detail: `Status: ${r.status?.replace(/_/g, ' ')}`,
        color: r.status === 'paid_to_vendor' ? C.success : r.status === 'in_progress' ? C.warn : C.muted,
        at: r.updatedAt || r.createdAt,
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [visitors, amenityBookings, evBookings, bills, maintenance, myId]);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
      <Hdr title="📋 My Activities" onBack={() => navigation.navigate('ResidentDashboard')} />

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row' }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.id} style={[s.chip, filter === f.id && s.chipA]} onPress={() => setFilter(f.id)}>
            <Text style={[s.chipT, filter === f.id && s.chipTA]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Total count */}
      <View style={s.countRow}>
        <Text style={s.countT}>{filtered.length} activities{filter !== 'all' ? ` in ${filter}` : ''}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={s.emptyT}>No activities yet</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={s.timelineItem}>
            {/* Timeline line */}
            <View style={s.timelineLeft}>
              <View style={[s.timelineDot, { backgroundColor: item.color }]}>
                <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
              </View>
              {index < filtered.length - 1 && <View style={s.timelineLine} />}
            </View>
            {/* Content */}
            <View style={[s.card, { flex: 1, marginLeft: 12, marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[s.cardT, { color: item.color }]}>{item.title}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{timeAgo(item.at)}</Text>
              </View>
              <Text style={s.cardS}>{item.sub}</Text>
              <Text style={[s.cardS, { marginTop: 4, color: C.muted }]}>{item.detail}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ─── MY SPENDINGS SCREEN ───────────────────────────────────────────────────────
export function MySpendingsScreen({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const myId   = user?.id || 'res1';
  const theme  = useTheme();

  const bills           = useResidentStore(s => s.bills);
  const amenityBookings = useResidentStore(s => s.amenityBookings);
  const evBookings      = useResidentStore(s => s.evBookings);
  const orders          = useAppStore(s => s.marketplaceOrders) || [];
  const maintenance     = useAppStore(s => s.maintenanceRequests) || [];

  const [filter, setFilter] = useState('all');

  const CATS = [
    { id: 'all',         label: 'All',          emoji: '💰', color: C.accent },
    { id: 'billing',     label: 'Bills',         emoji: '💳', color: C.danger },
    { id: 'maintenance', label: 'Maintenance',   emoji: '🔧', color: '#7C3AED' },
    { id: 'amenity',     label: 'Amenities',     emoji: '🏊', color: C.purple },
    { id: 'ev',          label: 'EV Charging',   emoji: '⚡', color: '#0D9488' },
    { id: 'market',      label: 'Marketplace',   emoji: '🛒', color: theme.primary || '#1A7A7A' },
  ];

  const transactions = useMemo(() => {
    const list = [];

    // Bills paid
    bills.filter(b => b.residentId === myId && b.status === 'paid').forEach(b => {
      list.push({
        id: 'bill-' + b.id,
        category: 'billing',
        emoji: '💳',
        title: `${b.month || b.type || 'Maintenance'} Bill`,
        sub: `Invoice ${b.id}`,
        amount: b.total || b.amount || 0,
        color: C.danger,
        at: b.paidAt,
        txn: b.transactionId,
      });
    });

    // Maintenance — paid jobs (payment_received or paid_to_vendor)
    maintenance
      .filter(r => r.residentId === myId && ['payment_received', 'paid_to_vendor'].includes(r.status) && r.quote?.amount)
      .forEach(r => {
        list.push({
          id: 'mnt-' + r.id,
          category: 'maintenance',
          emoji: '🔧',
          title: `${r.category} — ${r.title}`,
          sub: `${r.assignedVendorName || 'Vendor'} · ${r.id}`,
          amount: r.quote.amount || 0,
          color: '#7C3AED',
          at: r.workCompletedAt || r.createdAt,
          txn: r.id,
        });
      });

    // Amenity payments
    amenityBookings
      .filter(b => b.residentId === myId && b.paymentStatus === 'paid' && (b.amount || 0) > 0)
      .forEach(b => {
        list.push({
          id: 'amn-' + b.id,
          category: 'amenity',
          emoji: b.amenityEmoji || '🏊',
          title: `${b.amenityName} Booking`,
          sub: `${b.date} · ${b.slot}`,
          amount: b.amount,
          color: C.purple,
          at: b.paidAt || b.bookedAt,
          txn: b.id,
        });
      });

    // EV deposits
    evBookings
      .filter(b => b.residentId === myId && b.paymentStatus === 'paid')
      .forEach(b => {
        list.push({
          id: 'ev-' + b.id,
          category: 'ev',
          emoji: '⚡',
          title: `EV Slot ${b.slot} Deposit`,
          sub: `${b.date} · ${b.vehicleNumber}`,
          amount: b.depositAmount || 0,
          color: '#0D9488',
          at: b.paidAt || b.bookedAt,
          txn: b.id,
        });
      });

    // Marketplace orders — count as spent when delivered (payment was at order placement)
    const myOrders = orders.filter(o =>
      (o.residentId === myId || o.buyerId === myId) &&
      ['delivered', 'return_requested', 'return_accepted', 'return_picked_up'].includes(o.status)
    );
    myOrders.forEach(o => {
      list.push({
        id: 'ord-' + o.id,
        category: 'market',
        emoji: '🛒',
        title: `Shop Order #${o.id}`,
        sub: (o.items || []).slice(0,2).map(i => i.name).join(', ') || 'Marketplace Order',
        amount: o.total || o.subtotal || 0,
        color: theme.primary || '#1A7A7A',
        at: o.placedAt || o.createdAt,
        txn: o.id,
      });
    });

    return list.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [bills, amenityBookings, evBookings, orders, maintenance, myId]);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.category === filter);

  const totalByCategory = useMemo(() => {
    const totals = {};
    CATS.slice(1).forEach(c => {
      totals[c.id] = transactions.filter(t => t.category === c.id).reduce((sum, t) => sum + (t.amount || 0), 0);
    });
    return totals;
  }, [transactions]);

  const grandTotal = Object.values(totalByCategory).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
      <Hdr title="💰 My Spendings" onBack={() => navigation.navigate('ResidentDashboard')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Grand Total Hero */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>TOTAL SPENT ON PLATFORM</Text>
          <Text style={s.heroAmount}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          <Text style={s.heroSub}>{transactions.length} transactions</Text>
        </View>

        {/* Category Breakdown */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={[s.sec, { marginBottom: 10 }]}>BY CATEGORY</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CATS.slice(1).map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.catCard, { borderColor: filter === c.id ? c.color : C.border, borderWidth: filter === c.id ? 2 : 1 }]}
                onPress={() => setFilter(filter === c.id ? 'all' : c.id)}
              >
                <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: c.color, marginTop: 4 }}>₹{(totalByCategory[c.id] || 0).toLocaleString('en-IN')}</Text>
                <Text style={{ fontSize: 11, color: C.muted, fontWeight: '600' }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row' }}>
          {CATS.map(f => (
            <TouchableOpacity key={f.id} style={[s.chip, filter === f.id && s.chipA]} onPress={() => setFilter(f.id)}>
              <Text style={[s.chipT, filter === f.id && s.chipTA]}>{f.emoji} {f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List */}
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Text style={[s.sec, { marginBottom: 10 }]}>{filter === 'all' ? 'ALL TRANSACTIONS' : filter.toUpperCase() + ' TRANSACTIONS'} ({filtered.length})</Text>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>💸</Text>
              <Text style={s.emptyT}>No spending in this category</Text>
            </View>
          ) : filtered.map(t => (
            <View key={t.id} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }]}>
              <View style={[s.txnIcon, { backgroundColor: t.color + '18' }]}>
                <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardT}>{t.title}</Text>
                <Text style={s.cardS}>{t.sub}</Text>
                <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{fmtDate(t.at)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: t.color }}>₹{(t.amount || 0).toLocaleString('en-IN')}</Text>
                <Text style={{ fontSize: 10, color: C.muted }}>PAID</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: C.bg },
  hdr:          { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  back:         { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backT:        { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
  hdrT:         { flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  filterRow:    { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 10, maxHeight: 52 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border },
  chipA:        { backgroundColor: C.primary, borderColor: C.primary },
  chipT:        { fontSize: 12, fontWeight: '700', color: C.muted },
  chipTA:       { color: '#FFFFFF' },
  countRow:     { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: C.border },
  countT:       { fontSize: 12, color: C.muted, fontWeight: '600' },
  card:         { backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  cardT:        { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS:        { fontSize: 12, color: C.muted, marginTop: 2 },
  sec:          { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 0.8 },
  empty:        { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyT:       { fontSize: 15, fontWeight: '700', color: C.muted },
  // Timeline
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 48 },
  timelineDot:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineLine: { flex: 1, width: 2, backgroundColor: C.border, marginTop: 4 },
  // Spendings
  heroCard:     { backgroundColor: C.primary, margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  heroLabel:    { color: '#7A9E9E', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  heroAmount:   { color: '#FFFFFF', fontSize: 38, fontWeight: '900' },
  heroSub:      { color: '#7A9E9E', fontSize: 13, marginTop: 4 },
  catCard:      { width: '47%', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center' },
  txnIcon:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

export default MyActivitiesScreen;
