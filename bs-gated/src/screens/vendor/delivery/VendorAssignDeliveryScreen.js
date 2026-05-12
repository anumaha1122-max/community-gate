/**
 * VendorDeliveryWorkflow.js
 * ──────────────────────────────────────────────────────────────────────────────
 * TEMPORARY / TESTING ONLY — Dummy delivery partner workflow inside Vendor.
 * This file can be removed once a real third-party delivery integration is added.
 *
 * Screens exported:
 *   VendorOrdersWithDeliveryScreen — enhanced orders list (replaces OrdersListScreen)
 *   VendorAssignDeliveryScreen     — pick a dummy delivery partner + see OTP
 *   VendorDeliveryStatusScreen     — live status of a specific order, mark delivered
 *
 * All screens read/write the global Zustand store (useStore).
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, TextInput,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Dummy delivery partners ──────────────────────────────────────────────────
const DUMMY_PARTNERS = [
  { id: 'dp1', name: 'Rajesh Kumar',  phone: '98765 43210', vehicle: 'Bike · UP16 AB 1234', emoji: '🏍️' },
  { id: 'dp2', name: 'Suresh Singh',  phone: '87654 32109', vehicle: 'Bike · UP14 CD 5678', emoji: '🏍️' },
  { id: 'dp3', name: 'Anil Sharma',   phone: '76543 21098', vehicle: 'Cycle · N/A',          emoji: '🚲' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const STATUS_META = {
  pending:           { label: 'New',              color: Colors.amber,   bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',         color: Colors.teal,    bg: Colors.tealLight   },
  assigned_delivery: { label: 'Delivery Assigned', color: Colors.blue,    bg: Colors.blueLight   },
  out_for_delivery:  { label: 'Out for Delivery',  color: Colors.blue,    bg: Colors.blueLight   },
  delivered:         { label: 'Delivered ✅',       color: Colors.green,   bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',          color: '#C62828',      bg: '#FEE2E2'          },
  returned:          { label: 'Returned 📦',        color: '#E8A020',      bg: '#FFF7ED'          },
};

// ─── 1. VendorOrdersWithDeliveryScreen ───────────────────────────────────────
// Enhanced version of the original OrdersListScreen that includes delivery management

export default function VendorAssignDeliveryScreen({ navigation, route }) {
  const theme = useTheme();
  const orderId             = route?.params?.orderId;
  const orders              = useAppStore(s => s.marketplaceOrders);
  const assignDeliveryPartner = useAppStore(s => s.assignDeliveryPartner);
  const [selected, setSelected] = useState(null);
  const order = orders.find(o => o.id === orderId);

  if (!order) return null;

  const handleAssign = () => {
    if (!selected) { Alert.alert('Select a delivery partner first'); return; }
    Alert.alert(
      'Assign Delivery',
      `Assign ${selected.name} to deliver order #${orderId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            assignDeliveryPartner(orderId, selected.id, selected.name);
            navigation.goBack();
            Alert.alert('✅ Assigned', `${selected.name} has been assigned.\nShare OTP ${order.otp} with them to show the guard.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
      <AppHeader title="Assign Delivery Partner" subtitle={`Order #${orderId}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>

        {/* Test mode notice */}
        <Card style={{ backgroundColor: Colors.amberLight, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 20 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.amber }}>Dummy Workflow (Testing Only)</Text>
            <Text style={{ fontSize: 12, color: Colors.amber, marginTop: 3, lineHeight: 17 }}>
              These are test delivery partners. In production, replace with your third-party delivery API integration.
            </Text>
          </View>
        </Card>

        {/* OTP Card */}
        <Card style={{ backgroundColor: Colors.tealLight, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.teal, marginBottom: 6 }}>Order OTP — Share with Delivery Partner</Text>
          <Text style={s.otpLarge}>{order.otp}</Text>
          <Text style={{ fontSize: 11, color: Colors.teal, textAlign: 'center', marginTop: 6 }}>
            Guard will ask delivery partner for this OTP to allow community entry.
          </Text>
        </Card>

        {/* Select Partner */}
        <Text style={[s.sectionLabel, { paddingHorizontal: 0, marginTop: 4 }]}>Select Delivery Partner</Text>
        {DUMMY_PARTNERS.map(partner => (
          <TouchableOpacity
            key={partner.id}
            style={[s.partnerCard, selected?.id === partner.id && { borderColor: Colors.teal, backgroundColor: Colors.tealLight }]}
            onPress={() => setSelected(partner)}
            activeOpacity={0.85}
          >
            <View style={[s.partnerEmoji, selected?.id === partner.id && { backgroundColor: Colors.teal }]}>
              <Text style={{ fontSize: 26 }}>{partner.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.partnerName, selected?.id === partner.id && { color: Colors.teal }]}>{partner.name}</Text>
              <Text style={s.partnerSub}>{partner.vehicle}</Text>
              <Text style={s.partnerSub}>📞 {partner.phone}</Text>
            </View>
            <View style={[s.radioOuter, selected?.id === partner.id && { borderColor: Colors.teal }]}>
              {selected?.id === partner.id && <View style={s.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Order summary */}
        <Card>
          <Text style={s.sectionLabel}>Order Summary</Text>
          {[
            ['Customer',  `${order.residentName} · Unit ${order.unit}`],
            ['Items',     `${order.items.length} item${order.items.length > 1 ? 's' : ''}`],
            ['Total',     `₹${order.total}`],
            ['Placed At', fmt(order.placedAt)],
          ].map(([k, v], i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: Colors.border }}>
              <Text style={{ fontSize: 12, color: Colors.text2 }}>{k}</Text>
              <Text style={{ fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text }}>{v}</Text>
            </View>
          ))}
        </Card>

      </ScrollView>

      <View style={s.footer}>
        <PrimaryButton
          title={selected ? `Assign ${selected.name}` : 'Select a Partner to Assign'}
          onPress={handleAssign}
          color={Colors.teal}
          style={{ opacity: selected ? 1 : 0.5 }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  listHeader:    { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow:     { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
  heading:       { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
  dummyBadge:    { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.amberLight, borderRadius: Radius.md },
  dummyBadgeText:{ fontSize: 10, color: Colors.amber, fontWeight: Fonts.bold },

  catChip:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  catChipText:{ fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

  orderCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  orderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:    { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
  orderName:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  orderMeta:  { fontSize: 11, color: Colors.text3, marginTop: 1 },
  actionBtn:  { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: Fonts.bold },

  otpChip:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, flexWrap: 'wrap' },
  otpChipLabel: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },
  otpChipValue: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 4 },
  otpChipSub:   { fontSize: 11, color: Colors.teal },
  otpLarge:     { fontSize: 42, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 12, textAlign: 'center' },

  sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

  partnerCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
  partnerEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  partnerName:  { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
  partnerSub:   { fontSize: 12, color: Colors.text2, marginTop: 2 },
  radioOuter:   { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioInner:   { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.teal },

  trackCircle:  { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  trackLine:    { width: 2, height: 28, marginTop: 2 },

  emptyContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:    { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 6 },
});
