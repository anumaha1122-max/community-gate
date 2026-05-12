/**
 * AmenitiesScreen.js — Resident Amenity Booking
 * Tabs: Browse | Upcoming | History
 * Real-world: slot availability, capacity check, cancellation, OTP display, rules
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert,
} from 'react-native';
import { useAuthStore }    from '../../../store/AuthStore';
import useResidentStore    from '../../../store/residentStore';
import { useTheme }        from '../../../hooks/useTheme';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

function Badge({ label, color, bg }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color }}>{label}</Text>
    </View>
  );
}

function BookingCard({ b, onPress, onCancel }) {
  const statusColor = b.status === 'confirmed' ? C.success : b.status === 'cancelled' ? C.danger : C.warn;
  const today = new Date().toISOString().split('T')[0];
  const canCancel = b.status === 'confirmed' && b.date >= today;
  return (
    <TouchableOpacity
      style={[st.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}
      onPress={onPress} activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={st.cardT}>{b.amenityEmoji || "🏛️"} {b.amenityName}</Text>
          <Text style={st.cardS}>📅 {new Date(b.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</Text>
          <Text style={st.cardS}>⏰ {b.slot}  👥 {b.members || 1} member(s)</Text>
          {b.amount > 0 ? (
            <Text style={[st.cardS, { color: b.paymentStatus === "paid" ? C.success : C.warn, fontWeight: "700", marginTop: 2 }]}>
              {b.paymentStatus === "paid" ? "✅ Paid" : "⏳ Payment Pending"} · ₹{b.amount}
            </Text>
          ) : (
            <Text style={[st.cardS, { color: C.success, fontWeight: "700", marginTop: 2 }]}>✅ Free</Text>
          )}
        </View>
        <Badge
          label={b.status.replace("_", " ").toUpperCase()}
          color={statusColor} bg={statusColor + "20"}
        />
      </View>

      {b.status === "confirmed" && b.otp && (
        <View style={st.otpRow}>
          <Text style={{ fontSize: 11, color: C.muted }}>🔑 OTP: </Text>
          <Text style={{ fontWeight: "900", color: C.primary, letterSpacing: 4, fontSize: 18 }}>{b.otp}</Text>
          <Text style={{ fontSize: 10, color: C.muted, marginLeft: 8 }}>Show to guard at entry</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        {onPress && b.status === "confirmed" ? (
          <Text style={{ color: C.primary, fontSize: 12, fontWeight: "700" }}>Tap to view full QR →</Text>
        ) : <View />}
        {canCancel && onCancel && (
          <TouchableOpacity
            style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
            onPress={onCancel}
          >
            <Text style={{ color: C.danger, fontSize: 12, fontWeight: "700" }}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AmenitiesScreen({ navigation }) {
  const theme = useTheme();
  const amenities       = useResidentStore(s => s.amenities) ?? [];
  const amenityBookings = useResidentStore(s => s.amenityBookings) ?? [];
  const cancelBooking   = useResidentStore(s => s.cancelBooking);
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState("browse");

  const myId  = user?.id || "res1";
  const today = new Date().toISOString().split("T")[0];

  const myBookings = amenityBookings.filter(b => b.residentId === myId);
  const upcoming   = myBookings.filter(b => b.status === "confirmed" && !b.checkedIn && b.date >= today)
                                .sort((a, b) => a.date.localeCompare(b.date));
  const pending    = myBookings.filter(b => b.status === "payment_pending");
  const history    = myBookings.filter(b => b.checkedIn || b.status === "cancelled" || b.date < today)
                                .sort((a, b) => b.date.localeCompare(a.date));

  const handleCancel = (booking) => {
    Alert.alert(
      "Cancel Booking",
      `Cancel ${booking.amenityName} on ${booking.date} at ${booking.slot}?\n\nFree bookings are cancelled immediately. Paid bookings may be refunded per policy.`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel", style: "destructive",
          onPress: () => {
            cancelBooking(booking.id);
            Alert.alert("Cancelled", "Your booking has been cancelled successfully.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={st.hdrT}>Amenities</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {amenities.filter(a => a.available !== false && a.active !== false).length} open · {upcoming.length} upcoming
            </Text>
          </View>
        </View>
      </View>

      <View style={st.tabRow}>
        {[
          { key: "browse",   label: "Browse" },
          { key: "upcoming", label: upcoming.length > 0 ? `Upcoming (${upcoming.length + pending.length})` : "Upcoming" },
          { key: "history",  label: "History" },
        ].map(t => (
          <TouchableOpacity key={t.key} style={[st.tab, tab === t.key && st.tabA]} onPress={() => setTab(t.key)}>
            <Text style={[st.tabT, tab === t.key && st.tabTA]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {tab === "browse" && (
          <>
            {pending.length > 0 && (
              <View style={[st.card, { borderColor: C.warn, borderWidth: 2, marginBottom: 16 }]}>
                <Text style={{ color: C.warn, fontWeight: "800", fontSize: 13, marginBottom: 8 }}>
                  ⏳ {pending.length} Pending Payment{pending.length > 1 ? "s" : ""} — Complete to confirm
                </Text>
                {pending.map(b => (
                  <TouchableOpacity key={b.id}
                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#FEF3C7" }}
                    onPress={() => navigation.navigate("AmenityPayment", { booking: b })}>
                    <View>
                      <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>{b.amenityEmoji} {b.amenityName}</Text>
                      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{b.date} · {b.slot}</Text>
                    </View>
                    <Text style={{ color: C.warn, fontWeight: "800", fontSize: 14 }}>Pay ₹{b.amount} →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={st.sec}>AVAILABLE AMENITIES</Text>

            {amenities.length === 0 ? (
              <View style={st.empty}>
                <Text style={{ fontSize: 48 }}>🏊</Text>
                <Text style={st.emptyT}>No amenities configured</Text>
                <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 4 }}>Contact admin to add amenities</Text>
              </View>
            ) : amenities.map(a => {
              const isOpen = a.available !== false && a.active !== false;
              const todayCount = amenityBookings.filter(b =>
                b.amenityId === a.id && b.date === today && b.status === "confirmed"
              ).length;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[st.amenityCard, !isOpen && { opacity: 0.5 }]}
                  onPress={() => {
                    if (!isOpen) {
                      Alert.alert("Not Available", `${a.name} is currently closed for bookings.`);
                      return;
                    }
                    navigation.navigate("AmenityBooking", { amenity: a });
                  }}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View style={[st.iconBox, { backgroundColor: isOpen ? "#E8F5F5" : "#F1F5F9" }]}>
                      <Text style={{ fontSize: 30 }}>{a.emoji || a.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardT}>{a.name}</Text>
                      <Text style={st.cardS}>{(a.slots || []).length} time slots · Max {a.maxSlots || "—"} per slot</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                        {(a.pricePerSlot || 0) > 0
                          ? <Text style={{ color: C.accent, fontSize: 12, fontWeight: "800" }}>₹{a.pricePerSlot}/slot</Text>
                          : <Text style={{ color: C.success, fontSize: 12, fontWeight: "800" }}>🆓 Free</Text>
                        }
                        {todayCount > 0 && (
                          <Text style={{ color: C.muted, fontSize: 11 }}>· {todayCount} booked today</Text>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      <Badge label={isOpen ? "OPEN" : "CLOSED"} color={isOpen ? C.success : C.muted} bg={isOpen ? "#DCFCE7" : "#F1F5F9"} />
                      {isOpen && <Text style={{ color: C.primary, fontSize: 20 }}>›</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={[st.card, { backgroundColor: "#E8F5F5", marginTop: 8 }]}>
              <Text style={{ fontWeight: "800", color: C.primary, fontSize: 13, marginBottom: 8 }}>📋 Booking Rules</Text>
              <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
                {"• Book up to 7 days in advance\n• Carry OTP/QR code for guard entry\n• Cancellation: at least 2 hrs before slot\n• Max 1 booking per amenity per day\n• Children under 12 must be accompanied\n• Maintain cleanliness — no food inside gyms/pools"}
              </Text>
            </View>
          </>
        )}

        {tab === "upcoming" && (
          <>
            {pending.length > 0 && (
              <View style={[st.card, { borderColor: C.warn, borderWidth: 2, marginBottom: 12 }]}>
                <Text style={{ color: C.warn, fontWeight: "800", fontSize: 13, marginBottom: 4 }}>⏳ Complete Payment to Confirm</Text>
                {pending.map(b => (
                  <TouchableOpacity key={b.id}
                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}
                    onPress={() => navigation.navigate("AmenityPayment", { booking: b })}>
                    <Text style={{ color: C.text, fontWeight: "700" }}>{b.amenityEmoji} {b.amenityName} · {b.slot}</Text>
                    <Text style={{ color: C.warn, fontWeight: "800" }}>Pay ₹{b.amount} →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {upcoming.length === 0 && pending.length === 0 ? (
              <View style={st.empty}>
                <Text style={{ fontSize: 48 }}>📅</Text>
                <Text style={st.emptyT}>No upcoming bookings</Text>
                <TouchableOpacity style={[st.btn, { marginTop: 16, paddingHorizontal: 24 }]} onPress={() => setTab("browse")}>
                  <Text style={st.btnT}>Browse Amenities</Text>
                </TouchableOpacity>
              </View>
            ) : upcoming.map(b => (
              <BookingCard
                key={b.id} b={b}
                onPress={() => navigation.navigate("AmenityConfirmation", { booking: b })}
                onCancel={() => handleCancel(b)}
              />
            ))}
          </>
        )}

        {tab === "history" && (
          history.length === 0 ? (
            <View style={st.empty}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={st.emptyT}>No booking history</Text>
            </View>
          ) : history.map(b => <BookingCard key={b.id} b={b} />)
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  hdr:         { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:        { marginBottom: 8 },
  backT:       { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  hdrT:        { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  tabRow:      { flexDirection: "row", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: C.border },
  tab:         { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabA:        { borderBottomWidth: 3, borderBottomColor: C.primary },
  tabT:        { fontSize: 13, fontWeight: "600", color: C.muted },
  tabTA:       { color: C.primary, fontWeight: "800" },
  card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  amenityCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  cardT:       { fontSize: 15, fontWeight: "800", color: C.text, marginBottom: 2 },
  cardS:       { fontSize: 12, color: C.muted, marginTop: 2 },
  sec:         { fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  iconBox:     { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  otpRow:      { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5F5", borderRadius: 10, padding: 10, marginTop: 10 },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnT:        { color: "#FFF", fontSize: 15, fontWeight: "800" },
  empty:       { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyT:      { fontSize: 16, fontWeight: "700", color: C.muted },
});