/**
 * BookingScreen.js — Book an amenity slot
 * Real-world features:
 *  - 7-day date picker
 *  - Slot availability (greys out already-full slots)
 *  - Capacity check (max members per slot)
 *  - Duplicate booking guard (1 booking per amenity per day per resident)
 *  - Rules acknowledgement before confirm
 *  - Member count with validation
 */
import React, { useState, useMemo } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, TextInput,
} from "react-native";
import { useAuthStore }    from "../../../store/AuthStore";
import useResidentStore    from "../../../store/residentStore";
import { useTheme }        from "../../../hooks/useTheme";

const C = {
  primary: "#1A7A7A", success: "#1A7A7A", danger: "#DC2626",
  warn: "#D97706", accent: "#D4AF5A",
  bg: "#F0FAFA", card: "#FFFFFF", border: "#D0EEEE",
  text: "#1A2E2E", muted: "#7A9E9E",
};

export default function BookingScreen({ navigation, route }) {
  const theme = useTheme();
  const { amenity } = route.params || {};
  const user                 = useAuthStore(s => s.user);
  const amenityBookings      = useResidentStore(s => s.amenityBookings);
  const createAmenityBooking = useResidentStore(s => s.createAmenityBooking);

  // Generate next 7 days (excluding today)
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + (i + 1) * 86400000);
    return d.toISOString().split("T")[0];
  }), []);

  const [date, setDate]         = useState(dates[0]);
  const [slot, setSlot]         = useState(null);
  const [members, setMembers]   = useState("1");
  const [rulesOk, setRulesOk]   = useState(false);
  const [loading, setLoading]   = useState(false);

  if (!amenity) return null;

  const myId = user?.id || "res1";
  const maxSlots = amenity.maxSlots || 20;

  // For a given slot on the selected date, count confirmed bookings and total members
  const getSlotInfo = (sl) => {
    const bookings = amenityBookings.filter(b =>
      b.amenityId === amenity.id &&
      b.date === date &&
      b.slot === sl &&
      (b.status === "confirmed" || b.status === "payment_pending")
    );
    const totalMembers = bookings.reduce((sum, b) => sum + (b.members || 1), 0);
    const isFull = totalMembers >= maxSlots;
    const myBooking = bookings.find(b => b.residentId === myId);
    return { totalMembers, isFull, myBooking, spotsLeft: maxSlots - totalMembers };
  };

  // Check if resident already has a booking for this amenity on selected date
  const alreadyBooked = amenityBookings.some(b =>
    b.residentId === myId &&
    b.amenityId === amenity.id &&
    b.date === date &&
    (b.status === "confirmed" || b.status === "payment_pending")
  );

  const membersNum = parseInt(members) || 1;
  const selectedSlotInfo = slot ? getSlotInfo(slot) : null;
  const spotsLeft = selectedSlotInfo ? selectedSlotInfo.spotsLeft : maxSlots;
  const overCapacity = membersNum > spotsLeft;

  const handleBook = () => {
    if (!slot) { Alert.alert("Select Slot", "Please choose a time slot."); return; }
    if (membersNum < 1 || membersNum > 10) { Alert.alert("Invalid", "Members must be between 1 and 10."); return; }
    if (overCapacity) { Alert.alert("Slot Full", `Only ${spotsLeft} spot(s) left for this slot.`); return; }
    if (alreadyBooked) { Alert.alert("Already Booked", `You already have a booking for ${amenity.name} on this date.`); return; }
    if (!rulesOk) { Alert.alert("Please Agree", "Please acknowledge the booking rules before proceeding."); return; }

    setLoading(true);
    setTimeout(() => {
      const booking = createAmenityBooking({
        residentId:   myId,
        residentName: user?.name || "Resident",
        unit:         user?.unit || "A-101",
        amenityId:    amenity.id,
        amenityName:  amenity.name,
        amenityEmoji: amenity.emoji || amenity.icon,
        slot, date,
        members: membersNum,
        amount: amenity.pricePerSlot || 0,
      });
      setLoading(false);
      if (booking.amount > 0) {
        navigation.replace("AmenityPayment", { booking });
      } else {
        navigation.replace("AmenityConfirmation", { booking });
      }
    }, 500);
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={st.hdrT}>Book {amenity.name}</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {amenity.emoji || amenity.icon}  {(amenity.pricePerSlot || 0) > 0 ? `₹${amenity.pricePerSlot}/slot` : "Free Access"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Already booked warning */}
        {alreadyBooked && (
          <View style={[st.card, { backgroundColor: "#FEF3C7", borderColor: C.warn, borderWidth: 1.5, marginBottom: 4 }]}>
            <Text style={{ color: C.warn, fontWeight: "800", fontSize: 13 }}>⚠️ Already Booked</Text>
            <Text style={{ color: C.warn, fontSize: 12, marginTop: 4 }}>You have an existing booking for {amenity.name} on this date. Select a different date.</Text>
          </View>
        )}

        {/* Date picker */}
        <Text style={st.label}>SELECT DATE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {dates.map(d => {
              const dt = new Date(d + "T00:00:00");
              const day = dt.toLocaleDateString("en-IN", { weekday: "short" });
              const num = dt.getDate();
              const mon = dt.toLocaleDateString("en-IN", { month: "short" });
              const isSelected = date === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[st.dateChip, isSelected && st.dateChipA]}
                  onPress={() => { setDate(d); setSlot(null); }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "600", color: isSelected ? "#FFF" : C.muted }}>{day}</Text>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: isSelected ? "#FFF" : C.text }}>{num}</Text>
                  <Text style={{ fontSize: 9, fontWeight: "600", color: isSelected ? "rgba(255,255,255,0.8)" : C.muted }}>{mon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Slot picker */}
        <Text style={st.label}>SELECT TIME SLOT</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          {(amenity.slots || []).map(sl => {
            const info = getSlotInfo(sl);
            const isSelected = slot === sl;
            return (
              <TouchableOpacity
                key={sl}
                style={[
                  st.slotChip,
                  isSelected && st.slotChipA,
                  info.isFull && st.slotChipFull,
                ]}
                onPress={() => {
                  if (info.isFull) { Alert.alert("Slot Full", `This slot is at full capacity (${maxSlots} members).`); return; }
                  setSlot(sl);
                }}
                disabled={info.isFull}
              >
                <Text style={[st.slotChipT, isSelected && { color: "#FFF" }, info.isFull && { color: "#CBD5E1" }]}>
                  ⏰ {sl}
                </Text>
                <Text style={[
                  { fontSize: 10, fontWeight: "600", marginTop: 2 },
                  isSelected && { color: "rgba(255,255,255,0.85)" },
                  info.isFull && { color: "#CBD5E1" },
                  !isSelected && !info.isFull && { color: C.muted },
                ]}>
                  {info.isFull ? "FULL" : `${info.spotsLeft} left`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Members */}
        <Text style={st.label}>NUMBER OF MEMBERS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <TouchableOpacity
            style={[st.counterBtn, membersNum <= 1 && { opacity: 0.4 }]}
            onPress={() => membersNum > 1 && setMembers(String(membersNum - 1))}
          >
            <Text style={{ fontSize: 22, color: C.primary, fontWeight: "800" }}>−</Text>
          </TouchableOpacity>
          <View style={st.counterVal}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: C.text }}>{membersNum}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>member{membersNum > 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity
            style={[st.counterBtn, membersNum >= Math.min(10, spotsLeft) && { opacity: 0.4 }]}
            onPress={() => membersNum < Math.min(10, spotsLeft) && setMembers(String(membersNum + 1))}
          >
            <Text style={{ fontSize: 22, color: C.primary, fontWeight: "800" }}>+</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: C.muted, flex: 1 }}>
            {slot ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available` : "Select a slot first"}
          </Text>
        </View>
        {overCapacity && (
          <Text style={{ color: C.danger, fontSize: 12, fontWeight: "700", marginBottom: 12, marginTop: -12 }}>
            ⚠️ Only {spotsLeft} spots left in this slot
          </Text>
        )}

        {/* Booking summary */}
        {slot && !overCapacity && !alreadyBooked && (
          <View style={[st.card, { backgroundColor: "#E8F5F5", borderColor: C.primary, borderWidth: 1.5, marginBottom: 16 }]}>
            <Text style={{ fontWeight: "800", color: C.primary, fontSize: 14, marginBottom: 10 }}>📋 Booking Summary</Text>
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Amenity</Text>
              <Text style={st.summaryVal}>{amenity.emoji || amenity.icon} {amenity.name}</Text>
            </View>
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Date</Text>
              <Text style={st.summaryVal}>{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</Text>
            </View>
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Time Slot</Text>
              <Text style={st.summaryVal}>{slot}</Text>
            </View>
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Members</Text>
              <Text style={st.summaryVal}>{membersNum}</Text>
            </View>
            <View style={[st.summaryRow, { borderBottomWidth: 0, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }]}>
              <Text style={[st.summaryLabel, { fontWeight: "800", color: C.text }]}>Total</Text>
              <Text style={[st.summaryVal, { fontSize: 18, fontWeight: "900", color: (amenity.pricePerSlot || 0) > 0 ? C.accent : C.success }]}>
                {(amenity.pricePerSlot || 0) > 0 ? `₹${amenity.pricePerSlot}` : "FREE"}
              </Text>
            </View>
          </View>
        )}

        {/* Rules acknowledgement */}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20, padding: 14, backgroundColor: rulesOk ? "#E8F5F5" : "#FAFAFA", borderRadius: 12, borderWidth: 1.5, borderColor: rulesOk ? C.primary : C.border }}
          onPress={() => setRulesOk(!rulesOk)}
        >
          <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: rulesOk ? C.primary : C.border, backgroundColor: rulesOk ? C.primary : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
            {rulesOk && <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "900" }}>✓</Text>}
          </View>
          <Text style={{ flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 }}>
            I agree to the booking rules. I will bring my OTP/QR code for entry, arrive on time, maintain cleanliness, and cancel at least 2 hours in advance if unable to attend.
          </Text>
        </TouchableOpacity>

        {/* Confirm button */}
        <TouchableOpacity
          style={[st.btn, (loading || !slot || !rulesOk || alreadyBooked || overCapacity) && { opacity: 0.5 }]}
          onPress={handleBook}
          disabled={loading || !slot || !rulesOk || alreadyBooked || overCapacity}
        >
          <Text style={st.btnT}>
            {loading ? "Processing..." : (amenity.pricePerSlot || 0) > 0 ? `→ Proceed to Pay ₹${amenity.pricePerSlot}` : "✓ Confirm Booking"}
          </Text>
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
  label:       { fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, marginBottom: 12 },
  card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  dateChip:    { width: 56, paddingVertical: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: "center" },
  dateChipA:   { backgroundColor: C.primary, borderColor: C.primary },
  slotChip:    { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: "center", minWidth: 100 },
  slotChipA:   { backgroundColor: C.primary, borderColor: C.primary },
  slotChipFull:{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" },
  slotChipT:   { fontSize: 13, fontWeight: "700", color: C.text },
  counterBtn:  { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E8F5F5", borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  counterVal:  { alignItems: "center", minWidth: 60 },
  summaryRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel:{ fontSize: 12, color: C.muted, fontWeight: "600" },
  summaryVal:  { fontSize: 13, color: C.text, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnT:        { color: "#FFF", fontSize: 16, fontWeight: "800" },
});