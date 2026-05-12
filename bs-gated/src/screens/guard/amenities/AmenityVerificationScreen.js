/**
 * AmenityVerificationScreen.js — Guard screen
 * Guard enters OTP or scans QR to let resident into amenity.
 * Entry is logged in adminStore + residentStore (checkedIn flag).
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, TextInput, Alert, ScrollView,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const C = { primary: '#1A7A7A', accent: '#D4AF5A', success: '#1A7A7A', danger: '#DC2626', bg: '#F0FAFA', card: '#FFF', border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E' };

export default function AmenityVerificationScreen({ navigation }) {
  const theme = useTheme();
  const user               = useAuthStore(s => s.user);
  const verifyAmenityOTP   = useSecurityStore(s => s.verifyAmenityOTP);
  const verifyAmenityQR    = useSecurityStore(s => s.verifyAmenityQR);
  const verifyEVOTP        = useSecurityStore(s => s.verifyEVOTP);

  const guardId   = user?.id   || 'sec1';
  const guardName = user?.name || 'Guard';

  const [mode, setMode]       = useState('amenity'); // 'amenity' | 'ev'
  const [otp, setOtp]         = useState('');
  const [result, setResult]   = useState(null); // { ok, booking, reason }
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (otp.trim().length < 4) { Alert.alert('Enter OTP', 'Please enter the 6-digit OTP'); return; }
    const fn = mode === 'ev' ? verifyEVOTP : verifyAmenityOTP;
    const res = fn(otp.trim(), guardId, guardName);
    setResult(res);
    setVerified(res.ok);
    if (!res.ok) Alert.alert('❌ Invalid', res.reason || 'OTP not found or already used');
  };

  const handleReset = () => { setOtp(''); setResult(null); setVerified(false); };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.hdrT}>Amenity Verification</Text>
          <Text style={s.hdrSub}>OTP entry for pool / gym</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Mode selector */}
        <View style={s.modeRow}>
          {[{id:'amenity',label:'🏊 Amenity'},{id:'ev',label:'⚡ EV Charging'}].map(m => (
            <TouchableOpacity key={m.id} style={[s.modeBtn, mode===m.id && s.modeBtnA]} onPress={() => { setMode(m.id); handleReset(); }}>
              <Text style={[s.modeBtnT, mode===m.id && s.modeBtnTA]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!verified ? (
          <View style={s.card}>
            <Text style={s.sec}>{mode === 'ev' ? '⚡ EV Slot' : '🏊 Amenity'} Entry Verification</Text>
            <Text style={s.sub}>Ask the resident for their {mode === 'ev' ? 'EV booking' : 'amenity booking'} OTP</Text>

            <Text style={s.label}>Enter OTP</Text>
            <TextInput
              style={s.otpInput}
              value={otp}
              onChangeText={t => setOtp(t.replace(/[^0-9]/g,'').slice(0,6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="------"
              placeholderTextColor="#CBD5E1"
            />

            <TouchableOpacity style={s.btn} onPress={handleVerify}>
              <Text style={s.btnT}>🔍 Verify OTP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Success state */
          <View style={[s.card, { borderColor: C.success, borderWidth: 2 }]}>
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 36 }}>✅</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: C.success }}>Entry Approved!</Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Allow resident to enter</Text>
            </View>

            {result?.booking && (
              <View style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 14, marginTop: 8 }}>
                <Row label="Resident"   value={result.booking.residentName || '—'} />
                <Row label="Unit"       value={result.booking.unit || '—'} />
                {mode === 'amenity' ? (
                  <>
                    <Row label="Amenity"  value={`${result.booking.amenityEmoji||''} ${result.booking.amenityName}`} />
                    <Row label="Slot"     value={result.booking.slot} />
                    <Row label="Date"     value={result.booking.date} />
                    <Row label="Members"  value={`${result.booking.members || 1}`} />
                  </>
                ) : (
                  <>
                    <Row label="EV Slot"  value={result.booking.slot} />
                    <Row label="Vehicle"  value={result.booking.vehicleNumber} />
                    <Row label="Time"     value={`${result.booking.startTime} – ${result.booking.endTime}`} />
                    <Row label="Date"     value={result.booking.date} />
                  </>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: C.success }]} onPress={handleReset}>
                <Text style={s.btnT}>✓ Next Visitor</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info banner */}
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: C.primary, marginTop: 8 }]}>
          <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 4 }}>📋 How to verify</Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
            1. Ask the resident to open their booking in the app{'\n'}
            2. They will see a 6-digit OTP or QR code{'\n'}
            3. Enter the OTP here to grant entry{'\n'}
            4. Entry is automatically logged
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.surface }}>
      <Text style={{ color: '#64748B', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#E8F5F5' },
  hdr:       { backgroundColor: '#0D6E6E', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  back:      { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backT:     { color: '#FFF', fontSize: 28, fontWeight: '300' },
  hdrT:      { color: '#FFF', fontSize: 18, fontWeight: '900' },
  hdrSub:    { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  modeRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeBtn:   { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D0EEEE', alignItems: 'center' },
  modeBtnA:  { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  modeBtnT:  { fontSize: 13, fontWeight: '700', color: '#64748B' },
  modeBtnTA: { color: '#FFFFFF' },
  card:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  sec:       { fontSize: 15, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  sub:       { fontSize: 12, color: '#64748B', marginBottom: 16 },
  label:     { fontSize: 12, fontWeight: '700', color: '#7A9E9E', marginBottom: 8 },
  otpInput:  { backgroundColor: '#E8F5F5', borderWidth: 2, borderColor: '#1A7A7A', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontSize: 32, color: '#1A2E2E', textAlign: 'center', fontWeight: '900', letterSpacing: 8, marginBottom: 16 },
  btn:       { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnT:      { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});