import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, TextInput,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import { useTheme } from '../../../hooks/useTheme';

const C = {
  primary: '#1A7A7A', accent: '#D4AF5A', success: '#1A7A7A',
  danger: '#DC2626', warn: '#D97706', bg: '#F0FAFA',
  card: '#FFFFFF', border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E',
};

function Hdr({ title, subtitle, onBack, right }) {
  return (
    <View style={s.hdr}>
      <TouchableOpacity onPress={onBack} style={s.back}>
        <Text style={s.backT}>← Back</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={s.hdrT}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
        {right || null}
      </View>
    </View>
  );
}

function Badge({ label, color, bg }) {
  return <View style={[s.badge, { backgroundColor: bg }]}><Text style={[s.badgeT, { color }]}>{label}</Text></View>;
}

// ─── EV List Screen ───────────────────────────────────────────────────────────

function EVCard({ b, onPress }) {
  const statusColor = b.status === 'active' ? '#1A7A7A' : b.status === 'completed' ? '#7A9E9E' : '#D97706';
  return (
    <TouchableOpacity
      style={[s.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}
      onPress={onPress} activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardT}>⚡ Slot {b.slot}</Text>
          <Text style={s.cardS}>📅 {b.date}  🕐 {b.startTime} – {b.endTime}</Text>
          <Text style={s.cardS}>🚗 {b.vehicleNumber} ({b.vehicleType})</Text>
          <Text style={[s.cardS, { color: b.paymentStatus === 'paid' ? '#1A7A7A' : '#D97706', fontWeight: '700', marginTop: 2 }]}>
            {b.paymentStatus === 'paid' ? '✅ Deposit Paid' : '⏳ Payment Pending'} · ₹{b.depositAmount}
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.badgeT, { color: statusColor }]}>{b.status.toUpperCase()}</Text>
        </View>
      </View>
      {b.status !== 'completed' && b.otp && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', borderRadius: 10, padding: 10, marginTop: 10 }}>
          <Text style={{ fontSize: 11, color: '#7A9E9E' }}>🔑 OTP: </Text>
          <Text style={{ fontWeight: '900', color: '#1A7A7A', letterSpacing: 4, fontSize: 16 }}>{b.otp}</Text>
        </View>
      )}
      {onPress && b.status !== 'completed' && (
        <Text style={{ textAlign: 'right', color: '#7A9E9E', fontSize: 11, marginTop: 6 }}>Tap to view QR →</Text>
      )}
    </TouchableOpacity>
  );
}

export default function EVListScreen({ navigation }) {
  const theme = useTheme();
  const user = useAuthStore(st => st.user);
  const evBookings = useResidentStore(st => st.evBookings);
  const [tab, setTab] = useState('browse');

  const myId = user?.id || 'res1';
  const mine = evBookings.filter(b => b.residentId === myId);
  const pending = mine.filter(b => b.status === 'payment_pending');
  const upcoming = mine.filter(b => b.paymentStatus === 'paid' && !b.checkedIn && b.status !== 'completed');
  const past = mine.filter(b => b.checkedIn || b.status === 'completed');

  const EV_SLOTS = ['EV-01','EV-02','EV-03','EV-04','EV-05','EV-06'];
  const bookedSlots = evBookings.filter(b => ['booked','active'].includes(b.status)).map(b => b.slot);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <Hdr
        title="⚡ EV Charging"
        subtitle={`${EV_SLOTS.length - bookedSlots.length} of ${EV_SLOTS.length} slots available`}
        onBack={() => navigation.goBack()}
      />

      <View style={s.tabRow}>
        {['browse','upcoming','history'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabA]} onPress={() => setTab(t)}>
            <Text style={[s.tabT, tab===t && s.tabTA]}>
              {t==='browse' ? 'Book Slot' : t==='upcoming' ? ('Upcoming' + (upcoming.length > 0 ? ' (' + upcoming.length + ')' : '')) : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }} showsVerticalScrollIndicator={false}>

        {tab === 'browse' && (
          <>
            {pending.length > 0 && (
              <View style={[s.card, { borderColor:C.warn, borderWidth:2, marginBottom:12 }]}>
                <Text style={{ color:C.warn, fontWeight:'800', fontSize:13 }}>⏳ Pending Payment ({pending.length})</Text>
                {pending.map(b => (
                  <TouchableOpacity key={b.id} style={{ marginTop:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}
                    onPress={() => navigation.navigate('EVPayment', { booking: b })}>
                    <Text style={{ color:C.text, fontWeight:'700' }}>⚡ {b.slot} · {b.date}</Text>
                    <Text style={{ color:C.warn, fontWeight:'800', fontSize:12 }}>Pay ₹{b.depositAmount} →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[s.card, { marginBottom:12 }]}>
              <Text style={s.sec}>Slot Availability</Text>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                {EV_SLOTS.map(slot => {
                  const occupied = bookedSlots.includes(slot);
                  return (
                    <View key={slot} style={[s.slotChip, occupied && s.slotOcc]}>
                      <Text style={[s.slotT, occupied && { color:C.danger }]}>{slot}</Text>
                      <Text style={{ fontSize:10, color: occupied ? C.danger : C.success }}>{occupied?'●':'○'}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={[s.cardS,{marginTop:8}]}>{EV_SLOTS.length - bookedSlots.length} of {EV_SLOTS.length} slots free · ₹200 deposit · ₹12/kWh</Text>
            </View>

            <TouchableOpacity
              style={s.btn}
              onPress={() => {
                if (EV_SLOTS.length === bookedSlots.length) {
                  Alert.alert('No Slots','All EV slots are occupied. Try again later.'); return;
                }
                navigation.navigate('EVBookSlot');
              }}>
              <Text style={s.btnT}>⚡ Book EV Slot</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'upcoming' && (
          upcoming.length === 0
            ? <View style={s.empty}><Text style={{ fontSize:48 }}>⚡</Text><Text style={s.emptyT}>No upcoming bookings</Text></View>
            : upcoming.map(b => <EVCard key={b.id} b={b} onPress={() => navigation.navigate('EVConfirmation', { booking:b })} />)
        )}

        {tab === 'history' && (
          past.length === 0
            ? <View style={s.empty}><Text style={{ fontSize:48 }}>📋</Text><Text style={s.emptyT}>No history yet</Text></View>
            : past.map(b => <EVCard key={b.id} b={b} />)
        )}
        <View style={{ height:40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: C.bg },
  hdr:       { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:      { marginBottom: 8 },
  backT:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:      { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  tabRow:    { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: C.border },
  tab:       { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabA:      { borderBottomWidth: 3, borderBottomColor: C.primary },
  tabT:      { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTA:     { color: C.primary, fontWeight: '800' },
  card:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  cardT:     { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS:     { fontSize: 12, color: C.muted, marginTop: 2 },
  sec:       { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  label:     { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  badge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeT:    { fontSize: 10, fontWeight: '800' },
  chip:      { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
  chipA:     { backgroundColor: C.primary, borderColor: C.primary },
  chipT:     { fontSize: 13, fontWeight: '600', color: C.text },
  chipTA:    { color: '#FFF' },
  dateChip:  { width: 56, paddingVertical: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  dateChipA: { backgroundColor: C.primary, borderColor: C.primary },
  slotChip:  { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', flexDirection: 'row', gap: 4, alignItems: 'center' },
  slotOcc:   { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  slotT:     { fontSize: 12, fontWeight: '700', color: C.primary },
  input:     { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, marginBottom: 16 },
  btn:       { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnT:      { color: '#FFF', fontSize: 16, fontWeight: '800' },
  empty:     { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyT:    { fontSize: 16, fontWeight: '700', color: C.muted },
  qrBox:     { width: 180, height: 180, borderRadius: 16, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primary },
  qrInner:   { padding: 16, alignItems: 'center' },
  otpBox:    { flexDirection: 'row', gap: 8 },
  otpDigit:  { width: 44, height: 56, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  otpDigitT: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel:{ fontSize: 13, color: C.muted, fontWeight: '600' },
  detailValue:{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
});