/**
 * AmenitiesAdminScreen.js — REBUILT
 * Tabs: Amenities | Bookings | EV Charging | Logs
 * Shows revenue, booking details, guard-verified entries.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert, StatusBar,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { useTheme } from '../../../hooks/useTheme';

const C = { primary: '#1A7A7A', accent: '#D4AF5A', success: '#1A7A7A', danger: '#DC2626', warn: '#D97706', bg: '#E8F5F5', card: '#FFF', border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E' };

function Badge({ label, color, bg }) {
  return <View style={[st.badge, { backgroundColor: bg }]}><Text style={[st.badgeT, { color }]}>{label}</Text></View>;
}

function StatCard({ emoji, label, value, color }) {
  return (
    <View style={[st.stat, { borderTopColor: color }]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 22, fontWeight: '900', color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function timeAgo(d) {
  if (!d) return '—';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AmenitiesAdminScreen({ navigation }) {
  const theme = useTheme();
  const amenities     = useAdminStore(s => s.amenities) || [];
  const bookings      = useAdminStore(s => s.amenityBookings) || [];
  const evBookings    = useAdminStore(s => s.evBookings) || [];
  const amenityLogs   = useAdminStore(s => s.amenityLogs) || [];
  const evLogs        = useAdminStore(s => s.evLogs) || [];
  const toggleActive  = useAdminStore(s => s.toggleAmenityActive);
  const [tab, setTab] = useState('bookings');

  // Revenue
  const amenityRevenue = bookings.filter(b => b.paymentStatus === 'paid' && b.amount > 0).reduce((a, b) => a + (b.amount || 0), 0);
  const evRevenue = evBookings.filter(b => b.paymentStatus === 'paid').reduce((a, b) => a + (b.depositAmount || 0), 0);
  const totalRevenue = amenityRevenue + evRevenue;
  const totalBookings = bookings.length + evBookings.length;
  const checkedIn = bookings.filter(b => b.checkedIn).length + evBookings.filter(b => b.checkedIn).length;

  const TABS = [
    { id: 'bookings', label: `Bookings (${bookings.length})` },
    { id: 'ev',       label: `EV (${evBookings.length})` },
    { id: 'evlogs',   label: `EV Logs (${evLogs.length})` },
    { id: 'logs',     label: `Amenity Logs (${amenityLogs.length})` },
    { id: 'manage',   label: 'Manage' },
  ];

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.headerTitle}>🏊 Amenities & EV</Text>
        <Text style={st.headerSub}>Bookings, slots & verifications</Text>
      </View>

      {/* Revenue Summary */}
      <View style={st.summary}>
        <StatCard emoji="💰" label="Total Revenue" value={`₹${totalRevenue}`} color={C.accent} />
        <StatCard emoji="📅" label="Total Bookings" value={totalBookings} color="#1D4ED8" />
        <StatCard emoji="✅" label="Checked In" value={checkedIn} color={C.success} />
        <StatCard emoji="🏊" label="Amenities" value={amenities.filter(a => a.active).length} color={C.muted} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabScroll}>
        <View style={{ flexDirection: 'row' }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} style={[st.tab, tab === t.id && st.tabA]} onPress={() => setTab(t.id)}>
              <Text style={[st.tabT, tab === t.id && st.tabTA]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <>
            {bookings.length === 0 ? (
              <View style={st.empty}><Text style={{ fontSize: 40 }}>📅</Text><Text style={st.emptyT}>No bookings yet</Text></View>
            ) : bookings.map(b => {
              const paid = b.paymentStatus === 'paid';
              const statusColor = b.status === 'confirmed' ? C.success : b.status === 'cancelled' ? C.danger : C.warn;
              return (
                <View key={b.id} style={[st.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardT}>{b.amenityEmoji || '🏛️'} {b.amenityName}</Text>
                      <Text style={st.cardS}>👤 {b.residentName} · {b.unit}</Text>
                      <Text style={st.cardS}>📅 {b.date} · ⏰ {b.slot}</Text>
                      {b.members > 1 && <Text style={st.cardS}>👥 {b.members} members</Text>}
                      {b.amount > 0 && (
                        <Text style={{ color: paid ? C.success : C.warn, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                          {paid ? '✅ Paid' : '⏳ Unpaid'} · ₹{b.amount}
                        </Text>
                      )}
                    </View>
                    <View style={{ gap: 4, alignItems: 'flex-end' }}>
                      <Badge label={b.status.toUpperCase()} color={statusColor} bg={statusColor + '20'} />
                      {b.checkedIn && <Badge label="✓ USED" color={C.success} bg="#DCFCE7" />}
                      <Text style={{ fontSize: 10, color: C.muted }}>{timeAgo(b.bookedAt)}</Text>
                    </View>
                  </View>
                  {b.otp && (
                    <View style={{ marginTop: 8, backgroundColor: theme.background, borderRadius: 8, padding: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: C.muted }}>OTP: <Text style={{ fontWeight: '800', color: C.text, letterSpacing: 2 }}>{b.otp}</Text></Text>
                      <Text style={{ fontSize: 11, color: C.muted }}>ID: {b.id}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* ── EV TAB ── */}
        {tab === 'ev' && (
          <>
            {evBookings.length === 0 ? (
              <View style={st.empty}><Text style={{ fontSize: 40 }}>⚡</Text><Text style={st.emptyT}>No EV bookings yet</Text></View>
            ) : evBookings.map(b => {
              const statusColor = b.status === 'active' ? C.success : b.status === 'booked' ? '#1D4ED8' : b.status === 'completed' ? C.muted : C.warn;
              return (
                <View key={b.id} style={[st.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardT}>⚡ Slot {b.slot}</Text>
                      <Text style={st.cardS}>👤 {b.residentName} · {b.unit}</Text>
                      <Text style={st.cardS}>🚗 {b.vehicleNumber} ({b.vehicleType})</Text>
                      <Text style={st.cardS}>📅 {b.date} · {b.startTime}–{b.endTime}</Text>
                      <Text style={{ color: C.success, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                        ₹{b.depositAmount} deposit {b.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                      </Text>
                    </View>
                    <View style={{ gap: 4, alignItems: 'flex-end' }}>
                      <Badge label={b.status.toUpperCase()} color={statusColor} bg={statusColor + '20'} />
                      {b.checkedIn && <Badge label="✓ IN" color={C.success} bg="#DCFCE7" />}
                    </View>
                  </View>
                  {b.otp && (
                    <View style={{ marginTop: 8, backgroundColor: theme.background, borderRadius: 8, padding: 8 }}>
                      <Text style={{ fontSize: 11, color: C.muted }}>OTP: <Text style={{ fontWeight: '800', color: C.text, letterSpacing: 2 }}>{b.otp}</Text></Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* ── EV LOGS TAB ── */}
        {tab === 'evlogs' && (
          evLogs.length === 0 ? (
            <View style={st.empty}><Text style={{ fontSize: 40 }}>⚡</Text><Text style={st.emptyT}>No EV entries logged yet</Text></View>
          ) : evLogs.map(log => (
            <View key={log.id} style={[st.card, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={st.cardT}>⚡ Slot {log.slot}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{timeAgo(log.at)}</Text>
              </View>
              <Text style={st.cardS}>👤 {log.residentName} · {log.unit}</Text>
              <Text style={st.cardS}>🚗 {log.vehicleNumber}</Text>
              <Text style={st.cardS}>🛡️ Verified by {log.verifiedByName || log.verifiedBy}</Text>
              <Text style={st.cardS}>🕐 {new Date(log.at).toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}

        {/* ── LOGS TAB ── */}
        {tab === 'logs' && (
          amenityLogs.length === 0 ? (
            <View style={st.empty}><Text style={{ fontSize: 40 }}>📋</Text><Text style={st.emptyT}>No entries logged yet</Text></View>
          ) : amenityLogs.map(log => (
            <View key={log.id} style={[st.card, { borderLeftWidth: 4, borderLeftColor: C.success }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={st.cardT}>✅ {log.amenityName}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{timeAgo(log.at)}</Text>
              </View>
              <Text style={st.cardS}>👤 {log.residentName} · {log.unit}</Text>
              <Text style={st.cardS}>🛡️ Verified by {log.verifiedByName || log.verifiedBy}</Text>
              <Text style={st.cardS}>🕐 {new Date(log.at).toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}

        {/* ── MANAGE TAB ── */}
        {tab === 'manage' && (
          <>
            <TouchableOpacity style={[st.card, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, borderColor: C.accent, borderWidth: 1.5 }]}
              onPress={() => navigation.navigate('AddAmenity')}>
              <Text style={{ fontSize: 24 }}>➕</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.cardT}>Add New Amenity</Text>
                <Text style={st.cardS}>Configure slots, pricing, capacity</Text>
              </View>
              <Text style={{ color: C.accent, fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            {amenities.map(a => (
              <View key={a.id} style={[st.card, !a.active && { opacity: 0.6 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{a.icon || a.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardT}>{a.name}</Text>
                    <Text style={st.cardS}>{a.slots?.length || 0} slots · {a.pricePerSlot > 0 ? `₹${a.pricePerSlot}/slot` : 'Free'}</Text>
                    <Text style={{ fontSize: 11, color: a.active ? C.success : C.danger, fontWeight: '700', marginTop: 2 }}>
                      {a.active ? '● Active' : '● Disabled'}
                    </Text>
                  </View>
                  <TouchableOpacity style={[st.toggleBtn, { backgroundColor: (a.active ? C.danger : C.success) + '15' }]}
                    onPress={() => Alert.alert(a.active ? 'Disable' : 'Enable', `${a.active ? 'Disable' : 'Enable'} ${a.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Confirm', onPress: () => toggleActive(a.id) },
                    ])}>
                    <Text style={{ color: a.active ? C.danger : C.success, fontSize: 12, fontWeight: '700' }}>
                      {a.active ? 'Disable' : 'Enable'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#E8F5F5' },
  summary:  { flexDirection: 'row', backgroundColor: '#1A7A7A', paddingVertical: 12, paddingHorizontal: 8 },
  stat:     { flex: 1, alignItems: 'center', borderTopWidth: 3, paddingTop: 8 },
  tabScroll:{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE', maxHeight: 50 },
  tab:      { paddingHorizontal: 16, paddingVertical: 14 },
  tabA:     { borderBottomWidth: 3, borderBottomColor: '#1A7A7A' },
  tabT:     { fontSize: 13, fontWeight: '600', color: '#7A9E9E' },
  tabTA:    { color: '#1A7A7A', fontWeight: '800' },
  card:     { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
  cardT:    { fontSize: 14, fontWeight: '800', color: '#1A2E2E', marginBottom: 2 },
  cardS:    { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeT:   { fontSize: 10, fontWeight: '800' },
  toggleBtn:{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  empty:    { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyT:   { fontSize: 15, color: '#7A9E9E', fontWeight: '700' },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
});