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

export default function EVConfirmationScreen({ navigation, route }) {
  const theme = useTheme();
  const evBookings = useResidentStore(st => st.evBookings);
  const passedBooking = route.params && route.params.booking ? route.params.booking : null;
  const live = passedBooking ? (evBookings.find(b => b.id === passedBooking.id) || passedBooking) : null;

  if (!live) {
    return (
      <SafeAreaView style={s.screen}>
        <Hdr title="EV Booking" onBack={() => navigation.navigate('EVCharging')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={{ color: '#7A9E9E', fontSize: 16, marginTop: 12 }}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <Hdr title="Booking Confirmed" subtitle="EV slot reserved successfully" onBack={() => navigation.navigate('EVCharging')} />
      <ScrollView contentContainerStyle={{ padding:20 }} showsVerticalScrollIndicator={false}>

        <View style={[s.card, { alignItems:'center', paddingVertical:28, borderColor:C.success, borderWidth:2 }]}>
          <View style={{ width:72, height:72, borderRadius:36, backgroundColor:'#DCFCE7', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <Text style={{ fontSize:36 }}>✅</Text>
          </View>
          <Text style={{ fontSize:22, fontWeight:'900', color:C.success, marginBottom:4 }}>EV Slot Booked!</Text>
          <Text style={{ color:C.muted, fontSize:13, textAlign:'center' }}>Show the QR code or OTP to the guard before entering the charging area</Text>
        </View>

        <View style={[s.card, { marginTop:16 }]}>
          <Text style={s.sec}>Booking Details</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>EV Slot</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`⚡ ${live.slot}`}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Date</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{live.date}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Time</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`${live.startTime} – ${live.endTime}`}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Vehicle</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`${live.vehicleNumber} (${live.vehicleType})`}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Deposit</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`₹${live.depositAmount} paid`}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Booking ID</Text>
            <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{live.id}</Text>
          </View>
        </View>

        <View style={[s.card, { marginTop:12, alignItems:'center', paddingVertical:24 }]}>
          <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, marginBottom:16 }}>ENTRY QR CODE</Text>
          <View style={s.qrBox}>
            <View style={s.qrInner}>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center', fontWeight: '600' }}>{live.qrCode}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 8, justifyContent: 'center' }}>
                {Array.from({ length: 36 }).map((_, i) => {
                  const seed = String(live.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                  return <View key={i} style={{ width: 10, height: 10, backgroundColor: (seed * (i + 3) * 17) % 100 > 45 ? C.primary : 'transparent', borderRadius: 1 }} />;
                })}
              </View>
            </View>
          </View>
          <Text style={{ fontSize:13, color:C.muted, marginTop:16, marginBottom:8 }}>— OR USE OTP —</Text>
          <View style={s.otpBox}>
            {(live.otp || '------').split('').map((d,i) => (
              <View key={i} style={s.otpDigit}><Text style={s.otpDigitT}>{d}</Text></View>
            ))}
          </View>
          <Text style={{ fontSize:11, color:C.muted, marginTop:8 }}>Show to guard at EV charging entrance</Text>
        </View>

        <TouchableOpacity style={[s.btn,{marginTop:16}]} onPress={() => navigation.navigate('ResidentDashboard')}>
          <Text style={s.btnT}>🏠 Back to Home</Text>
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