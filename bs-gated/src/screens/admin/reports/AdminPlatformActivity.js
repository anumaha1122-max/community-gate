/**
 * AdminPlatformActivity.js
 * AdminPlatformActivityScreen — all guard-verified entries + bookings timeline
 * AdminRevenueScreen          — full financial overview: revenue vs expenses breakdown
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, FlatList,
} from 'react-native';
import useAdminStore        from '../../../store/adminStore';
import { useSecurityStore } from '../../../store/securityStore';
import useAppStore          from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const C = {
  primary: '#0D6E6E', accent: '#D4AF5A', success: '#0F766E',
  danger: '#DC2626', warn: '#D97706', purple: '#7C3AED', blue: '#1D4ED8',
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

// ─── ADMIN PLATFORM ACTIVITY SCREEN ───────────────────────────────────────────
export function AdminPlatformActivityScreen({ navigation }) {
  const theme = useTheme();
  const entryLogs       = useSecurityStore(s => s.entryLogs);
  const visitors        = useSecurityStore(s => s.visitors);
  const deliveries      = useSecurityStore(s => s.deliveries);
  const amenityLogs     = useAdminStore(s => s.amenityLogs) || [];
  const evLogs          = useAdminStore(s => s.evLogs) || [];
  const amenityBookings = useAdminStore(s => s.amenityBookings) || [];
  const evBookings      = useAdminStore(s => s.evBookings) || [];
  const sosAlerts       = useSecurityStore(s => s.sosAlerts);

  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all',      label: 'All' },
    { id: 'entry',    label: 'Gate Entries' },
    { id: 'amenity',  label: 'Amenities' },
    { id: 'ev',       label: 'EV Charging' },
    { id: 'sos',      label: 'SOS Alerts' },
    { id: 'delivery', label: 'Deliveries' },
  ];

  const activities = useMemo(() => {
    const list = [];

    // Gate entry logs
    entryLogs.forEach(log => {
      list.push({
        id: 'log-' + log.id,
        type: 'entry',
        emoji: log.type === 'VISITOR' ? '🚶' : log.type === 'DELIVERY' ? '📦' : log.type === 'VENDOR' ? '🔧' : log.type === 'EV' ? '⚡' : '🚗',
        title: `${log.type === 'VISITOR' ? 'Visitor' : log.type === 'DELIVERY' ? 'Delivery' : log.type === 'VENDOR' ? 'Vendor' : log.type === 'EV' ? 'EV Check-in' : 'Entry'} — ${log.action?.replace(/_/g, ' ')}`,
        sub: `${log.name || '—'} · Unit ${log.unit || '—'}`,
        detail: `Gate: ${log.gate || 'Main Gate'} · Guard: ${log.guardName || log.guardId || 'Guard'}`,
        color: log.type === 'VISITOR' ? C.success : log.type === 'DELIVERY' ? C.warn : log.type === 'EV' ? '#0D9488' : C.blue,
        at: log.at,
      });
    });

    // Amenity check-ins
    amenityLogs.forEach(log => {
      list.push({
        id: 'al-' + log.id,
        type: 'amenity',
        emoji: '🏊',
        title: `Amenity Entry — ${log.amenityName}`,
        sub: `${log.residentName} · ${log.unit}`,
        detail: `Verified by ${log.verifiedByName || log.verifiedBy}`,
        color: C.purple,
        at: log.at,
      });
    });

    // EV check-ins
    evLogs.forEach(log => {
      list.push({
        id: 'el-' + log.id,
        type: 'ev',
        emoji: '⚡',
        title: `EV Check-In — Slot ${log.slot}`,
        sub: `${log.residentName} · ${log.vehicleNumber}`,
        detail: `Verified by ${log.verifiedByName || log.verifiedBy}`,
        color: '#0D9488',
        at: log.at,
      });
    });

    // SOS Alerts
    sosAlerts.forEach(a => {
      list.push({
        id: 'sos-' + a.id,
        type: 'sos',
        emoji: a.status === 'RESOLVED' ? '✅' : '🚨',
        title: `SOS Alert — ${a.type} (${a.status})`,
        sub: `${a.residentName} · Unit ${a.unit}`,
        detail: a.resolution ? `Resolved: ${a.resolution}` : `Location: ${a.location}`,
        color: a.status === 'RESOLVED' ? C.success : C.danger,
        at: a.resolvedAt || a.triggeredAt,
      });
    });

    // Deliveries
    deliveries.filter(d => d.status !== 'PENDING').forEach(d => {
      list.push({
        id: 'del-' + d.id,
        type: 'delivery',
        emoji: d.status === 'DELIVERED' ? '📦✅' : '📦',
        title: `Delivery — ${d.status?.replace(/_/g, ' ')}`,
        sub: `${d.deliveryPersonName} → Unit ${d.hostUnit}`,
        detail: `${d.deliveryType || 'Package'} · ${d.platform || ''}`,
        color: d.status === 'DELIVERED' ? C.success : C.warn,
        at: d.deliveredAt || d.otpVerifiedAt || d.createdAt,
      });
    });

    return list.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [entryLogs, amenityLogs, evLogs, sosAlerts, deliveries]);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  const todayCount = activities.filter(a => {
    const today = new Date().toDateString();
    return a.at && new Date(a.at).toDateString() === today;
  }).length;

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <Hdr title="📋 Platform Activity" onBack={() => navigation.goBack()} />

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryChip}>
          <Text style={s.summaryV}>{activities.length}</Text>
          <Text style={s.summaryL}>Total</Text>
        </View>
        <View style={s.summaryChip}>
          <Text style={[s.summaryV, { color: C.success }]}>{todayCount}</Text>
          <Text style={s.summaryL}>Today</Text>
        </View>
        <View style={s.summaryChip}>
          <Text style={[s.summaryV, { color: C.danger }]}>{sosAlerts.filter(a => a.status !== 'RESOLVED').length}</Text>
          <Text style={s.summaryL}>Active SOS</Text>
        </View>
        <View style={s.summaryChip}>
          <Text style={[s.summaryV, { color: '#0D9488' }]}>{evLogs.length}</Text>
          <Text style={s.summaryL}>EV Entries</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row' }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.id} style={[s.chip, filter === f.id && s.chipA]} onPress={() => setFilter(f.id)}>
            <Text style={[s.chipT, filter === f.id && s.chipTA]}>{f.label} {filter === f.id ? `(${filtered.length})` : ''}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={s.emptyT}>No activities</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={s.timelineItem}>
            <View style={s.timelineLeft}>
              <View style={[s.timelineDot, { backgroundColor: item.color + '20', borderWidth: 2, borderColor: item.color }]}>
                <Text style={{ fontSize: 13 }}>{item.emoji}</Text>
              </View>
              {index < filtered.length - 1 && <View style={s.timelineLine} />}
            </View>
            <View style={[s.card, { flex: 1, marginLeft: 12, marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[s.cardT, { color: item.color, flex: 1 }]} numberOfLines={1}>{item.title}</Text>
                <Text style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{timeAgo(item.at)}</Text>
              </View>
              <Text style={s.cardS}>{item.sub}</Text>
              <Text style={[s.cardS, { color: C.muted }]}>{item.detail}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ─── ADMIN REVENUE SCREEN ──────────────────────────────────────────────────────
export function AdminRevenueScreen({ navigation }) {
  const billing         = useAdminStore(s => s.billing) || [];
  const amenityBookings = useAdminStore(s => s.amenityBookings) || [];
  const evBookings      = useAdminStore(s => s.evBookings) || [];
  const expenses        = useAdminStore(s => s.expenses) || [];
  const maintenanceReqs = useAppStore(s => s.maintenanceRequests) || [];

  const [tab, setTab] = useState('revenue');

  // Revenue streams
  const maintenanceRevenue = billing.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0);
  const amenityRevenue     = amenityBookings.filter(b => b.paymentStatus === 'paid' && b.amount > 0).reduce((sum, b) => sum + (b.amount || 0), 0);
  const evRevenue          = evBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.depositAmount || 0), 0);
  const totalRevenue       = maintenanceRevenue + amenityRevenue + evRevenue;

  // Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit     = totalRevenue - totalExpenses;

  // Pending
  const pendingBilling = billing.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + (b.amount || 0), 0);

  const REVENUE_CATS = [
    { label: 'Maintenance Dues', amount: maintenanceRevenue, color: C.blue,    emoji: '🏠', count: billing.filter(b => b.status === 'paid').length },
    { label: 'Amenity Bookings', amount: amenityRevenue,     color: C.purple,  emoji: '🏊', count: amenityBookings.filter(b => b.paymentStatus === 'paid' && b.amount > 0).length },
    { label: 'EV Deposits',      amount: evRevenue,          color: '#0D9488', emoji: '⚡', count: evBookings.filter(b => b.paymentStatus === 'paid').length },
  ];

  const EXP_CATS = {};
  expenses.forEach(e => {
    EXP_CATS[e.category] = (EXP_CATS[e.category] || 0) + e.amount;
  });

  const pendingMaintenanceJobs = maintenanceReqs.filter(r => r.status === 'quote_approved').length;

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <Hdr title="📊 Revenue & Finance" onBack={() => navigation.goBack()} />

      {/* Hero */}
      <View style={s.revenueHero}>
        <View style={{ flex: 1 }}>
          <Text style={s.heroL}>TOTAL COLLECTED</Text>
          <Text style={s.heroV}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={s.heroDivider} />
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={s.heroL}>NET PROFIT</Text>
          <Text style={[s.heroV, { color: netProfit >= 0 ? '#4ADE80' : '#F87171' }]}>₹{netProfit.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[{id:'revenue',label:'Revenue'},{id:'expenses',label:'Expenses'},{id:'pending',label:'Pending'}].map(t => (
          <TouchableOpacity key={t.id} style={[s.tabBtn, tab === t.id && s.tabBtnA]} onPress={() => setTab(t.id)}>
            <Text style={[s.tabBtnT, tab === t.id && s.tabBtnTA]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {tab === 'revenue' && (
          <>
            <Text style={[s.sec, { marginBottom: 12 }]}>REVENUE BY SOURCE</Text>
            {REVENUE_CATS.map(cat => (
              <View key={cat.label} style={[s.card, { marginBottom: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={[s.catIcon, { backgroundColor: cat.color + '18' }]}>
                    <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardT}>{cat.label}</Text>
                    <Text style={s.cardS}>{cat.count} paid transaction{cat.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: cat.color }}>₹{cat.amount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[s.bar, { marginTop: 12 }]}>
                  <View style={[s.barFill, { width: `${totalRevenue > 0 ? Math.round((cat.amount / totalRevenue) * 100) : 0}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={[s.cardS, { marginTop: 4 }]}>{totalRevenue > 0 ? Math.round((cat.amount / totalRevenue) * 100) : 0}% of total revenue</Text>
              </View>
            ))}

            <View style={[s.card, { backgroundColor: theme.surface, borderColor: C.warn, borderWidth: 1.5, marginTop: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: C.warn }}>⏳ Pending / Overdue</Text>
                <Text style={{ fontWeight: '900', color: C.warn, fontSize: 18 }}>₹{pendingBilling.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={s.cardS}>{billing.filter(b => b.status === 'pending' || b.status === 'overdue').length} invoices awaiting payment</Text>
            </View>
          </>
        )}

        {tab === 'expenses' && (
          <>
            <Text style={[s.sec, { marginBottom: 12 }]}>EXPENSES BY CATEGORY</Text>
            {Object.entries(EXP_CATS).map(([cat, amt]) => (
              <View key={cat} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }]}>
                <View style={[s.catIcon, { backgroundColor: theme.surface }]}>
                  <Text style={{ fontSize: 22 }}>💸</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardT}>{cat}</Text>
                  <Text style={s.cardS}>{expenses.filter(e => e.category === cat).length} entries</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: C.danger }}>₹{amt.toLocaleString('en-IN')}</Text>
              </View>
            ))}
            {expenses.map(e => (
              <View key={e.id} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, backgroundColor: theme.surface }]}>
                <Text style={{ fontSize: 18 }}>📝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardT, { fontSize: 13 }]}>{e.title}</Text>
                  <Text style={s.cardS}>{e.category} · {e.date}</Text>
                </View>
                <Text style={{ fontWeight: '800', color: C.danger }}>-₹{e.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: C.danger, borderWidth: 1.5, marginTop: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: C.danger }}>Total Expenses</Text>
                <Text style={{ fontWeight: '900', color: C.danger, fontSize: 18 }}>₹{totalExpenses.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </>
        )}

        {tab === 'pending' && (
          <>
            <Text style={[s.sec, { marginBottom: 12 }]}>PENDING COLLECTIONS</Text>
            {billing.filter(b => b.status === 'pending' || b.status === 'overdue').map(b => (
              <View key={b.id} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                <View style={[s.catIcon, { backgroundColor: b.status === 'overdue' ? '#FEF2F2' : '#FFFBEB' }]}>
                  <Text style={{ fontSize: 20 }}>{b.status === 'overdue' ? '🔴' : '🟡'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardT}>{b.residentName} · {b.unit}</Text>
                  <Text style={s.cardS}>{b.month || b.type} · Due: {b.dueDate}</Text>
                  <Text style={{ fontSize: 11, color: b.status === 'overdue' ? C.danger : C.warn, fontWeight: '700', marginTop: 2 }}>
                    {b.status === 'overdue' ? '⚠️ OVERDUE' : '⏳ Pending'}
                  </Text>
                </View>
                <Text style={{ fontWeight: '900', color: b.status === 'overdue' ? C.danger : C.warn, fontSize: 16 }}>₹{b.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
            {billing.filter(b => b.status === 'pending' || b.status === 'overdue').length === 0 && (
              <View style={s.empty}>
                <Text style={{ fontSize: 48 }}>✅</Text>
                <Text style={s.emptyT}>All dues cleared!</Text>
              </View>
            )}
            {pendingMaintenanceJobs > 0 && (
              <View style={[s.card, { backgroundColor: theme.surface, borderColor: C.warn, borderWidth: 1.5, marginTop: 8 }]}>
                <Text style={{ fontWeight: '800', color: C.warn }}>🔧 {pendingMaintenanceJobs} maintenance jobs awaiting payment</Text>
                <Text style={s.cardS}>Quote approved — vendor payment pending</Text>
              </View>
            )}
          </>
        )}

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
  summaryRow:   { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 8 },
  summaryChip:  { flex: 1, alignItems: 'center' },
  summaryV:     { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  summaryL:     { fontSize: 10, color: '#7A9E9E', fontWeight: '600', marginTop: 2 },
  card:         { backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  cardT:        { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS:        { fontSize: 12, color: C.muted, marginTop: 2 },
  sec:          { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 0.8 },
  empty:        { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyT:       { fontSize: 15, fontWeight: '700', color: C.muted },
  tabRow:       { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: C.border },
  tabBtn:       { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabBtnA:      { borderBottomWidth: 3, borderBottomColor: C.primary },
  tabBtnT:      { fontSize: 13, fontWeight: '600', color: C.muted },
  tabBtnTA:     { color: C.primary, fontWeight: '800' },
  // Timeline
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 48 },
  timelineDot:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineLine: { flex: 1, width: 2, backgroundColor: C.border, marginTop: 4 },
  // Revenue
  revenueHero:  { backgroundColor: C.primary, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  heroL:        { color: '#7A9E9E', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  heroV:        { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  heroDivider:  { width: 1, height: 50, backgroundColor: '#2D3F5A', marginHorizontal: 16 },
  catIcon:      { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bar:          { height: 6, backgroundColor: '#FFFFFF', borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: 6, borderRadius: 4 },
});

export default AdminPlatformActivityScreen;
