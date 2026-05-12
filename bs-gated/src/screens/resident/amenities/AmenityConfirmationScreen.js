/**
 * AmenityConfirmationScreen.js
 * Booking confirmed — shows OTP, QR, booking details.
 */
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView,
} from 'react-native';
import useResidentStore from '../../../store/residentStore';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

function DetailRow({ label, value }) {
  return (
    <View style={st.detailRow}>
      <Text style={st.detailLabel}>{label}</Text>
      <Text style={st.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function QRPattern({ seed }) {
  const cells = useMemo(() => {
    const hash = String(seed || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 49 }, (_, i) => (hash * (i + 7) * 31) % 100 > 45);
  }, [seed]);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 154, gap: 2 }}>
      {cells.map((on, i) => (
        <View
          key={i}
          style={{ width: 20, height: 20, backgroundColor: on ? C.primary : 'transparent', borderRadius: 2 }}
        />
      ))}
    </View>
  );
}

export default function AmenityConfirmationScreen({ navigation, route }) {
  // All hooks at top — never conditional
  const amenityBookings = useResidentStore(s => s.amenityBookings);

  const passedBooking = route.params && route.params.booking ? route.params.booking : null;
  const live = passedBooking
    ? (amenityBookings.find(b => b.id === passedBooking.id) || passedBooking)
    : null;

  if (!live) {
    return (
      <SafeAreaView style={st.screen}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={st.hdr}>
          <TouchableOpacity onPress={() => navigation.navigate('Amenities')} style={st.back}>
            <Text style={st.backT}>← Back</Text>
          </TouchableOpacity>
          <Text style={st.hdrT}>Booking Confirmed</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={{ color: C.muted, fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            Booking details not found
          </Text>
          <TouchableOpacity
            style={[st.btn, { marginTop: 20 }]}
            onPress={() => navigation.navigate('Amenities')}
          >
            <Text style={st.btnT}>Go to Amenities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = live.date
    ? (() => {
        try {
          return new Date(live.date + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
          });
        } catch (e) { return live.date; }
      })()
    : '—';

  const otp = live.otp || '------';

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.navigate('Amenities')} style={st.back}>
          <Text style={st.backT}>← Back to Amenities</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>Booking Confirmed</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Success banner */}
        <View style={[st.card, { alignItems: 'center', paddingVertical: 28, borderColor: C.success, borderWidth: 2 }]}>
          <View style={st.successIcon}>
            <Text style={{ fontSize: 42 }}>✅</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.success, marginBottom: 4 }}>
            Booking Confirmed!
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
            Show the OTP or QR code to the guard at the amenity entrance
          </Text>
        </View>

        {/* OTP + QR */}
        <View style={[st.card, { alignItems: 'center', paddingVertical: 24, marginTop: 4 }]}>
          <Text style={st.sectionLabel}>YOUR ENTRY OTP</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {otp.split('').map((d, i) => (
              <View key={i} style={st.otpDigit}>
                <Text style={st.otpDigitT}>{d}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>
            Valid for booking date only — do not share
          </Text>
          <Text style={st.sectionLabel}>— OR SCAN QR CODE —</Text>
          <View style={st.qrBox}>
            <QRPattern seed={live.id} />
          </View>
          <Text style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{live.qrCode || ''}</Text>
        </View>

        {/* Booking details */}
        <View style={[st.card, { marginTop: 4 }]}>
          <Text style={[st.sectionLabel, { marginBottom: 12 }]}>BOOKING DETAILS</Text>
          <DetailRow label="Booking ID"  value={live.id || '—'} />
          <DetailRow label="Amenity"     value={((live.amenityEmoji || '') + ' ' + (live.amenityName || '')).trim()} />
          <DetailRow label="Date"        value={formattedDate} />
          <DetailRow label="Time Slot"   value={live.slot || '—'} />
          <DetailRow label="Members"     value={String(live.members || 1) + ' person(s)'} />
          <DetailRow label="Status"      value={live.status === 'confirmed' ? '✅ Confirmed' : (live.status || '—')} />
          <DetailRow
            label="Amount"
            value={
              live.amount > 0
                ? (live.paymentStatus === 'paid' ? '✅ ₹' + live.amount + ' Paid' : '⏳ ₹' + live.amount + ' Pending')
                : '🆓 Free'
            }
          />
        </View>

        {/* Reminders */}
        <View style={[st.card, { backgroundColor: '#E8F5F5', marginTop: 4 }]}>
          <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 8 }}>
            📋 Reminders
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
            {'• Arrive 5 minutes before your slot\n• Show OTP or QR code to security guard\n• Slot is non-transferable\n• Cancel at least 2 hours before to avoid penalty\n• Maintain cleanliness and follow community rules'}
          </Text>
        </View>

        <TouchableOpacity
          style={[st.btn, { marginTop: 16 }]}
          onPress={() => navigation.navigate('Amenities')}
        >
          <Text style={st.btnT}>📅 View All Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.btn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.primary, marginTop: 10 }]}
          onPress={() => navigation.navigate('ResidentDashboard')}
        >
          <Text style={[st.btnT, { color: C.primary }]}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  hdr:         { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:        { marginBottom: 8 },
  backT:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:        { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  sectionLabel:{ fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel: { fontSize: 13, color: C.muted, fontWeight: '600', flex: 1 },
  detailValue: { fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  qrBox:       { width: 168, height: 168, borderRadius: 16, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primary, padding: 8 },
  otpDigit:    { width: 44, height: 56, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  otpDigitT:   { color: '#FFF', fontSize: 22, fontWeight: '900' },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnT:        { color: '#FFF', fontSize: 16, fontWeight: '800' },
});