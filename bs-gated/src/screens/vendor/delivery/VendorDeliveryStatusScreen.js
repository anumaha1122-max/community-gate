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

const DELIVERY_STAGES = [
  { key: 'pending',           label: 'Order Placed'              },
  { key: 'accepted',          label: 'Confirmed by Vendor'       },
  { key: 'assigned_delivery', label: 'Delivery Partner Assigned' },
  { key: 'out_for_delivery',  label: 'Out for Delivery'          },
  { key: 'delivered',         label: 'Delivered'                 },
];

const STAGE_IDX = {
  pending:           0,
  accepted:          1,
  assigned_delivery: 2,
  out_for_delivery:  3,
  delivered:         4,
  rejected:          0,
  returned:          4,
};

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

export default function VendorDeliveryStatusScreen({ navigation, route }) {
  const theme = useTheme();
  const orderId         = route?.params?.orderId;
  const orders          = useAppStore(s => s.marketplaceOrders);
  const markDelivered   = useAppStore(s => s.markOrderDelivered);
  const order           = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={s.safe}>
        <AppHeader title="Delivery Status" onBack={() => navigation.goBack()} />
        <View style={s.emptyContainer}><Text style={s.emptyTitle}>Order not found</Text></View>
      </SafeAreaView>
    );
  }

  const meta         = STATUS_META[order.status] || STATUS_META.pending;
  const currentStage = STAGE_IDX[order.status] ?? 0;

  const handleMarkDelivered = () => {
    Alert.alert(
      'Mark as Delivered',
      'Confirm that the order has been successfully delivered to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Delivered',
          onPress: () => {
            markDelivered(orderId);
            Alert.alert('✅ Order Delivered', 'Earnings have been updated in your account.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
      <AppHeader
        title="Delivery Status"
        subtitle={`#${order.id}`}
        onBack={() => navigation.goBack()}
        rightComponent={<Badge label={meta.label} color={meta.color} bg={meta.bg} />}
      />
      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>

        {/* Delivery Partner Info */}
        {order.deliveryPartnerName ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.partnerEmoji, { backgroundColor: Colors.tealLight }]}>
              <Text style={{ fontSize: 26 }}>🏍️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.partnerName}>{order.deliveryPartnerName}</Text>
              <Text style={s.partnerSub}>Delivery Partner</Text>
            </View>
            <Badge
              label={order.otpVerified ? '✓ Inside Community' : '⏳ Waiting Entry'}
              color={order.otpVerified ? Colors.green : Colors.amber}
              bg={order.otpVerified ? Colors.greenLight : Colors.amberLight}
            />
          </Card>
        ) : (
          <Card style={{ backgroundColor: Colors.amberLight }}>
            <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.amber }}>⚠️ No delivery partner assigned yet</Text>
          </Card>
        )}

        {/* OTP */}
        {order.status !== 'delivered' && order.status !== 'rejected' && (
          <Card style={{ backgroundColor: Colors.tealLight, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.teal, marginBottom: 4 }}>🔑 Entry OTP</Text>
            <Text style={s.otpLarge}>{order.otp}</Text>
            <Badge
              label={order.otpVerified ? '✅ OTP Verified by Guard' : '⏳ Guard scan pending'}
              color={order.otpVerified ? Colors.green : Colors.amber}
              bg={order.otpVerified ? Colors.greenLight : Colors.amberLight}
              style={{ marginTop: 8 }}
            />
          </Card>
        )}

        {/* Progress */}
        <Card>
          <Text style={s.sectionLabel}>Delivery Progress</Text>
          {DELIVERY_STAGES.map((stage, i) => {
            const done   = i < currentStage;
            const active = i === currentStage;
            return (
              <View key={stage.key} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[s.trackCircle, (done || active) ? { backgroundColor: Colors.teal, borderColor: Colors.teal } : { backgroundColor: Colors.bg, borderColor: Colors.border }]}>
                    {done
                      ? <Text style={{ color: theme.card, fontSize: 10, fontWeight: Fonts.bold }}>✓</Text>
                      : active
                        ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.card }} />
                        : null}
                  </View>
                  {i < DELIVERY_STAGES.length - 1 && (
                    <View style={[s.trackLine, { backgroundColor: done ? Colors.teal : Colors.border }]} />
                  )}
                </View>
                <View style={{ paddingTop: 3, paddingBottom: 18, flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: (done || active) ? Fonts.bold : Fonts.medium, color: (done || active) ? Colors.teal : Colors.text3 }}>{stage.label}</Text>
                  <Text style={{ fontSize: 11, color: Colors.text3, marginTop: 2 }}>
                    {order.timeline[i] ? fmt(order.timeline[i]?.at) : active ? 'In progress...' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Customer info */}
        <Card>
          <Text style={s.sectionLabel}>Customer</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Avatar name={order.residentName} size={44} color={Colors.teal} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.text }}>{order.residentName}</Text>
              <Text style={{ fontSize: 12, color: Colors.text2 }}>Unit {order.unit} · BS Gated Community</Text>
            </View>
          </View>
        </Card>

        {/* Items */}
        <Card>
          <Text style={s.sectionLabel}>Items</Text>
          {order.items.map((item, i) => (
            <View key={i} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, i < order.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
              <Text style={{ fontSize: 13, color: Colors.text2 }}>{item.emoji} {item.name} × {item.qty}</Text>
              <Text style={{ fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text }}>₹{item.price * item.qty}</Text>
            </View>
          ))}
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.text }}>Total</Text>
            <Text style={{ fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.teal }}>₹{order.total}</Text>
          </View>
        </Card>

        {/* Delivered success */}
        {order.status === 'delivered' && (
          <Card style={{ backgroundColor: Colors.greenLight, alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: Fonts.bold, color: Colors.green }}>Order Delivered Successfully!</Text>
            <Text style={{ fontSize: 12, color: Colors.green, marginTop: 4 }}>₹{order.total} added to earnings</Text>
          </Card>
        )}

      </ScrollView>

      {/* Resident must confirm — vendor just waits */}
      {order.status === 'out_for_delivery' && order.otpVerified && (
        <View style={[s.footer, { backgroundColor: theme.surface }]}>
          <Text style={{ textAlign: 'center', color: theme.primary, fontWeight: '800', fontSize: 13 }}>
            🚶 Delivery partner is at the door
          </Text>
          <Text style={{ textAlign: 'center', color: theme.primary, fontSize: 12, marginTop: 4 }}>
            Waiting for resident to accept the order...
          </Text>
        </View>
      )}
      {order.status === 'out_for_delivery' && !order.otpVerified && (
        <View style={[s.footer, { backgroundColor: Colors.amberLight }]}>
          <Text style={{ textAlign: 'center', color: Colors.amber, fontWeight: Fonts.bold, fontSize: 13 }}>
            ⏳ Waiting for guard to verify OTP before delivery partner can enter
          </Text>
        </View>
      )}
      {order.status === 'assigned_delivery' && (
        <View style={s.footer}>
          <PrimaryButton title="🚚 View Delivery Partner Info" onPress={() => {}} outline color={Colors.teal} />
        </View>
      )}
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
