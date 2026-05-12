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

export default function EVPaymentScreen({ navigation, route }) {
  const theme = useTheme();
  const payEVBooking = useResidentStore(st => st.payEVBooking);
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  const booking = route.params && route.params.booking ? route.params.booking : null;

  if (!booking) {
    return (
      <SafeAreaView style={s.screen}>
        <Hdr title="EV Payment" subtitle="Secure · Instant confirmation" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#7A9E9E', fontSize: 16 }}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      payEVBooking(booking.id);
      setPaying(false);
      navigation.replace('EVConfirmation', { booking: { ...booking, status:'booked', paymentStatus:'paid' } });
    }, 1500);
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <Hdr title="EV Payment" subtitle="Secure · Instant confirmation" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding:20 }} showsVerticalScrollIndicator={false}>

        <View style={[s.card, { borderColor:C.accent, borderWidth:2 }]}>
          <Text style={{ fontWeight:'800', color:C.text, fontSize:15, marginBottom:8 }}>Order Summary</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={s.cardS}>⚡ Slot {booking.slot}</Text>
            <Text style={{ fontWeight:'700', color:C.text }}>₹{booking.depositAmount}</Text>
          </View>
          <Text style={s.cardS}>📅 {booking.date} · 🕐 {booking.startTime}–{booking.endTime}</Text>
          <Text style={s.cardS}>🚗 {booking.vehicleNumber} ({booking.vehicleType})</Text>
          <View style={{ height:1, backgroundColor:C.border, marginVertical:12 }} />
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ fontWeight:'800', color:C.text, fontSize:16 }}>Deposit Total</Text>
            <Text style={{ fontWeight:'900', color:C.accent, fontSize:20 }}>₹{booking.depositAmount}</Text>
          </View>
          <Text style={{ fontSize:11, color:C.muted, marginTop:4 }}>Actual usage billed at ₹12/kWh after charging</Text>
        </View>

        <Text style={[s.label,{marginTop:20}]}>Select Payment Method</Text>
        {[
          { id:'upi',        label:'UPI / QR',            emoji:'📱' },
          { id:'card',       label:'Credit / Debit Card',  emoji:'💳' },
          { id:'netbanking', label:'Net Banking',           emoji:'🏦' },
        ].map(m => (
          <TouchableOpacity key={m.id} style={[s.card, { flexDirection:'row', alignItems:'center', gap:12, marginBottom:8,
            borderColor:method===m.id?C.primary:C.border, borderWidth:method===m.id?2:1 }]}
            onPress={() => setMethod(m.id)}>
            <Text style={{ fontSize:22 }}>{m.emoji}</Text>
            <Text style={{ fontWeight:'700', color:C.text, flex:1 }}>{m.label}</Text>
            <View style={[{ width:20, height:20, borderRadius:10, borderWidth:2,
              borderColor:method===m.id?C.primary:C.muted,
              backgroundColor:method===m.id?C.primary:'transparent' }]} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[s.btn,{marginTop:24, opacity:paying?0.7:1}]} onPress={handlePay} disabled={paying}>
          <Text style={s.btnT}>{paying ? 'Processing...' : `💳 Pay ₹${booking.depositAmount}`}</Text>
        </TouchableOpacity>
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