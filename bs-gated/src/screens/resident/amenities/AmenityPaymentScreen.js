/**
 * AmenityPaymentScreen.js
 * Resident pays for a booked amenity slot.
 * Fixed: hooks not conditional, pushes confirmed booking to adminStore on payment.
 */
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, ActivityIndicator,
} from "react-native";
import useResidentStore from "../../../store/residentStore";
import { useTheme }     from "../../../hooks/useTheme";

const C = {
  primary: "#1A7A7A", success: "#1A7A7A", danger: "#DC2626",
  warn: "#D97706", accent: "#D4AF5A",
  bg: "#F0FAFA", card: "#FFFFFF", border: "#D0EEEE",
  text: "#1A2E2E", muted: "#7A9E9E",
};

const PAYMENT_METHODS = [
  { id: "upi",        label: "UPI / QR Code",        emoji: "📱", desc: "GPay, PhonePe, Paytm" },
  { id: "card",       label: "Credit / Debit Card",   emoji: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking",           emoji: "🏦", desc: "All major banks" },
  { id: "wallet",     label: "Community Wallet",      emoji: "👛", desc: "Use prepaid balance" },
];

export default function AmenityPaymentScreen({ navigation, route }) {
  const theme = useTheme();
  // ✅ All hooks at top level
  const payAmenityBooking = useResidentStore(s => s.payAmenityBooking);
  const amenityBookings   = useResidentStore(s => s.amenityBookings);

  const [method, setMethod] = useState("upi");
  const [paying,  setPaying]  = useState(false);

  const { booking: passedBooking } = route.params || {};
  // Get live booking in case store has updated version
  const booking = amenityBookings.find(b => b.id === passedBooking?.id) || passedBooking;

  if (!booking) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={{ color: C.muted, fontSize: 16, marginTop: 12 }}>Booking not found</Text>
          <TouchableOpacity style={[st.btn, { marginTop: 20, paddingHorizontal: 24 }]} onPress={() => navigation.navigate("Amenities")}>
            <Text style={st.btnT}>Go to Amenities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      // payAmenityBooking marks booking confirmed + pushes to adminStore
      const paid = payAmenityBooking(booking.id);
      setPaying(false);
      navigation.replace("AmenityConfirmation", {
        booking: { ...booking, status: "confirmed", paymentStatus: "paid" },
      });
    }, 1500);
  };

  const formattedDate = booking.date
    ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })
    : booking.date;

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>Complete Payment</Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
          Secure payment · Booking confirmed instantly
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* ── Order Summary ── */}
        <View style={[st.card, { borderColor: C.accent, borderWidth: 1.5 }]}>
          <Text style={{ fontWeight: "800", color: C.text, fontSize: 14, marginBottom: 12 }}>🧾 Order Summary</Text>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Amenity</Text>
            <Text style={st.summaryVal}>{booking.amenityEmoji || ""} {booking.amenityName}</Text>
          </View>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Date</Text>
            <Text style={st.summaryVal}>{formattedDate}</Text>
          </View>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Time Slot</Text>
            <Text style={st.summaryVal}>{booking.slot}</Text>
          </View>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Members</Text>
            <Text style={st.summaryVal}>{booking.members || 1}</Text>
          </View>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Booking ID</Text>
            <Text style={[st.summaryVal, { fontFamily: "monospace", fontSize: 11 }]}>{booking.id}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "900", color: C.text, fontSize: 16 }}>Total Amount</Text>
            <Text style={{ fontWeight: "900", color: C.accent, fontSize: 26 }}>₹{booking.amount}</Text>
          </View>
        </View>

        {/* ── Payment Method ── */}
        <Text style={st.sectionLabel}>SELECT PAYMENT METHOD</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[st.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8,
              borderColor: method === m.id ? C.primary : C.border,
              borderWidth: method === m.id ? 2 : 1,
              backgroundColor: method === m.id ? "#E8F5F5" : C.card,
            }]}
            onPress={() => setMethod(m.id)}
          >
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: method === m.id ? C.primary : "#F0FAFA", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: C.text, fontSize: 14 }}>{m.label}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{m.desc}</Text>
            </View>
            <View style={{
              width: 22, height: 22, borderRadius: 11, borderWidth: 2,
              borderColor: method === m.id ? C.primary : C.muted,
              backgroundColor: method === m.id ? C.primary : "transparent",
              alignItems: "center", justifyContent: "center",
            }}>
              {method === m.id && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" }} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Security Note ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, backgroundColor: "#E8F5F5", borderRadius: 12, marginTop: 4, marginBottom: 16 }}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text style={{ flex: 1, fontSize: 11, color: C.muted, lineHeight: 16 }}>
            Your payment is secure and encrypted. Booking will be confirmed instantly after payment and reflected to the admin dashboard.
          </Text>
        </View>

        {/* ── Pay Button ── */}
        <TouchableOpacity
          style={[st.btn, paying && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={paying}
        >
          {paying ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={st.btnT}>Processing Payment...</Text>
            </View>
          ) : (
            <Text style={st.btnT}>💳 Pay ₹{booking.amount} & Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 14, alignItems: "center", marginTop: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: C.muted, fontSize: 14, fontWeight: "600" }}>Cancel & Go Back</Text>
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
  backT:       { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  hdrT:        { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  sectionLabel:{ fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  summaryRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel:{ fontSize: 12, color: C.muted, fontWeight: "600" },
  summaryVal:  { fontSize: 13, color: C.text, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnT:        { color: "#FFF", fontSize: 16, fontWeight: "800" },
});