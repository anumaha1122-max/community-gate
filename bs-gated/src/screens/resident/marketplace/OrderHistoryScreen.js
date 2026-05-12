/**
 * OrderHistoryScreen.js — Resident Order History
 *
 * Standalone screen. Accessible from ResidentNavigator.
 * Standard teal header matching all other resident screens.
 *
 * Real workflow per order:
 *   🛒 Order Placed → ✅ Confirmed by Vendor → 🚚 Out for Delivery
 *   → 🏘️ Arrived at Gate → 📦 Delivered
 *
 * Actions:
 *   - Share OTP with delivery person at gate
 *   - Accept / Reject when delivery partner arrives at door
 *   - Request Return on delivered orders
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, FlatList, Alert, Platform,
} from 'react-native';
import useAppStore      from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

// ─── Palette — matches all resident screens ──────────────────────────────────
const P = {
  teal:      '#1A7A7A',
  tealDark:  '#0D6E6E',
  tealSoft:  '#E8F5F5',
  bg:        '#E8F5F5',
  surface:   '#FFFFFF',
  text:      '#1A2E2E',
  textMuted: '#7A9E9E',
  textSub:   '#3D6E6E',
  border:    '#D0EEEE',
  success:   '#0F766E',
  successBg: '#D1FAE5',
  warning:   '#D97706',
  warningBg: '#FEF3C7',
  danger:    '#DC2626',
  dangerBg:  '#FEE2E2',
  purple:    '#7C3AED',
  purpleBg:  '#F5F3FF',
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
    + '  ' + new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

// ─── Status meta ─────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:           { label: 'Pending',           color: P.warning, bg: P.warningBg  },
  accepted:          { label: 'Confirmed',          color: P.teal,    bg: P.tealSoft   },
  assigned_delivery: { label: 'Out for Delivery',   color: '#1D4ED8', bg: '#EFF6FF'    },
  out_for_delivery:  { label: 'Arrived at Door!',   color: P.purple,  bg: P.purpleBg   },
  delivered:         { label: 'Delivered ✅',        color: P.success, bg: P.successBg  },
  rejected:          { label: 'Rejected',           color: P.danger,  bg: P.dangerBg   },
  returned:          { label: 'Return Requested',   color: '#EA580C', bg: '#FFF7ED'    },
};

// ─── Status Timeline ─────────────────────────────────────────────────────────
const STEPS = [
  { status: 'pending',           label: 'Order Placed',        icon: '🛒' },
  { status: 'accepted',          label: 'Confirmed by Vendor', icon: '✅' },
  { status: 'assigned_delivery', label: 'Out for Delivery',    icon: '🚚' },
  { status: 'out_for_delivery',  label: 'Arrived at Gate',     icon: '🏘️' },
  { status: 'delivered',         label: 'Delivered',           icon: '📦' },
];
const STEP_KEYS = STEPS.map(s => s.status);

function StatusTimeline({ status }) {
  const isRejected = status === 'rejected' || status === 'returned';

  if (isRejected) return (
    <View style={tl.rejected}>
      <Text style={{ fontSize: 16, marginRight: 8 }}>❌</Text>
      <Text style={tl.rejectedText}>
        {status === 'returned' ? 'Return Requested' : 'Order Rejected'}
      </Text>
    </View>
  );

  const currentIdx = STEP_KEYS.indexOf(status);

  return (
    <View style={tl.wrap}>
      {STEPS.map((step, i) => {
        const done   = i <= currentIdx;
        const active = i === currentIdx;
        const last   = i === STEPS.length - 1;
        return (
          <View key={step.status} style={tl.row}>
            <View style={tl.lineCol}>
              <View style={[tl.dot,
                done  && tl.dotDone,
                active && tl.dotActive,
              ]}>
                <Text style={{ fontSize: 10 }}>
                  {active ? step.icon : done ? '✓' : '○'}
                </Text>
              </View>
              {!last && (
                <View style={[tl.line, done && !active && tl.lineDone]} />
              )}
            </View>
            <Text style={[tl.stepLabel,
              active && { color: P.teal,     fontWeight: '800' },
              !done  && { color: P.textMuted, fontWeight: '500' },
              done && !active && { color: P.textSub },
            ]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const tl = StyleSheet.create({
  wrap:        { marginTop: 14, marginBottom: 4 },
  row:         { flexDirection: 'row', alignItems: 'flex-start' },
  lineCol:     { alignItems: 'center', width: 26, marginRight: 10 },
  dot:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: P.border, backgroundColor: '#F8FAFA', alignItems: 'center', justifyContent: 'center' },
  dotDone:     { borderColor: P.teal,     backgroundColor: '#CCFBF1' },
  dotActive:   { borderColor: P.teal,     backgroundColor: P.teal    },
  line:        { width: 2, height: 18, backgroundColor: P.border,  marginVertical: 2 },
  lineDone:    { backgroundColor: P.teal },
  stepLabel:   { fontSize: 12, fontWeight: '600', color: P.textSub, marginBottom: 16, marginTop: 2 },
  rejected:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.dangerBg, borderRadius: 10, padding: 10, marginTop: 12 },
  rejectedText:{ fontSize: 13, color: P.danger, fontWeight: '700' },
});

// ─── Order Card ──────────────────────────────────────────────────────────────
function OrderCard({ item, onAccept, onReject, onReturn }) {
  const meta          = STATUS_META[item.status] || STATUS_META.pending;
  const arrivedAtDoor = item.status === 'out_for_delivery' && item.otpVerified;

  return (
    <View style={[oc.card, arrivedAtDoor && { borderColor: P.purple, borderWidth: 2 }]}>

      {/* Top row: order ID + status badge */}
      <View style={oc.topRow}>
        <Text style={oc.orderId}>Order #{item.id}</Text>
        <View style={[oc.badge, { backgroundColor: meta.bg }]}>
          <Text style={[oc.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* Items */}
      <Text style={oc.items} numberOfLines={2}>
        {(item.items || []).map(i => `${i.emoji || '📦'} ${i.name} ×${i.qty}`).join('  ·  ')}
      </Text>

      {/* Timeline */}
      <StatusTimeline status={item.status} />

      {/* Footer: total + date */}
      <View style={oc.footer}>
        <Text style={oc.total}>₹{item.total + 20}</Text>
        <Text style={oc.date}>{fmt(item.placedAt)}</Text>
      </View>

      {/* OTP box — show when out for delivery, before guard scans */}
      {item.otp && item.status === 'assigned_delivery' && !item.otpVerified && (
        <View style={oc.otpBox}>
          <Text style={oc.otpLabel}>🔐 Share this OTP with the delivery person at the gate</Text>
          <Text style={oc.otpValue}>{item.otp}</Text>
        </View>
      )}

      {/* Arrived at door — Accept / Reject */}
      {arrivedAtDoor && (
        <View style={oc.arrivedBox}>
          <Text style={oc.arrivedTitle}>
            🚶 {item.deliveryPartnerName || 'Delivery partner'} has arrived!
          </Text>
          <Text style={oc.arrivedSub}>Please confirm you received your order.</Text>
          <View style={oc.arrivedBtns}>
            <TouchableOpacity
              style={[oc.arrivedBtn, { backgroundColor: P.dangerBg }]}
              onPress={() => onReject(item)} activeOpacity={0.8}
            >
              <Text style={[oc.arrivedBtnText, { color: P.danger }]}>✗  Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[oc.arrivedBtn, { backgroundColor: P.successBg, flex: 2 }]}
              onPress={() => onAccept(item)} activeOpacity={0.8}
            >
              <Text style={[oc.arrivedBtnText, { color: P.success }]}>✓  Accept Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Return button — only on delivered */}
      {item.status === 'delivered' && (
        <TouchableOpacity style={oc.returnBtn} onPress={() => onReturn(item)} activeOpacity={0.8}>
          <Text style={oc.returnBtnText}>📦  Request Return</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const oc = StyleSheet.create({
  card:         { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:      { fontSize: 14, fontWeight: '800', color: P.text },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  items:        { fontSize: 13, color: P.textSub, lineHeight: 19 },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: P.border },
  total:        { fontSize: 15, fontWeight: '900', color: P.teal },
  date:         { fontSize: 11, color: P.textMuted },
  otpBox:       { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#A5D6A7', alignItems: 'center' },
  otpLabel:     { fontSize: 12, color: '#2E7D32', fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  otpValue:     { fontSize: 32, fontWeight: '900', color: '#1A7A7A', letterSpacing: 8 },
  arrivedBox:   { backgroundColor: P.purpleBg, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#DDD6FE' },
  arrivedTitle: { fontSize: 14, fontWeight: '800', color: P.purple, marginBottom: 4 },
  arrivedSub:   { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  arrivedBtns:  { flexDirection: 'row', gap: 10 },
  arrivedBtn:   { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  arrivedBtnText:{ fontSize: 13, fontWeight: '800' },
  returnBtn:    { marginTop: 12, backgroundColor: P.warningBg, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' },
  returnBtnText:{ fontSize: 13, fontWeight: '700', color: P.warning },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function OrderHistoryScreen({ navigation }) {
  const user                   = useAuthStore(s => s.user);
  const orders                 = useAppStore(s => s.marketplaceOrders);
  const residentConfirmDelivery = useAppStore(s => s.residentConfirmDelivery);
  const residentRejectDelivery  = useAppStore(s => s.residentRejectDelivery);
  const residentRequestReturn   = useAppStore(s => s.residentRequestReturn);

  const myOrders = (orders || [])
    .filter(o => o.residentId === (user?.id || 'res1'))
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  const handleAccept = (order) => {
    Alert.alert(
      '✅ Confirm Delivery',
      `Confirm you received Order #${order.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Received!',
          onPress: () => {
            residentConfirmDelivery(order.id);
            Alert.alert('🎉 Thank you!', 'Order marked as delivered.');
          },
        },
      ]
    );
  };

  const handleReject = (order) => {
    Alert.alert(
      '❌ Reject Delivery',
      'Reject this delivery? (e.g. wrong item / damaged)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            residentRejectDelivery(order.id);
            Alert.alert('Rejected', 'The vendor has been notified.');
          },
        },
      ]
    );
  };

  const handleReturn = (order) => {
    Alert.alert(
      '📦 Request Return',
      `Request a return for Order #${order.id}? The vendor will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Return',
          style: 'destructive',
          onPress: () => {
            residentRequestReturn(order.id);
            Alert.alert('✅ Return Requested', 'Your return request has been sent to the vendor.');
          },
        },
      ]
    );
  };

  const activeCount    = myOrders.filter(o => !['delivered', 'rejected', 'returned'].includes(o.status)).length;
  const deliveredCount = myOrders.filter(o => o.status === 'delivered').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      {/* Header — standard resident layout */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={s.headerTitle}>My Orders</Text>
            <Text style={s.headerSub}>
              {activeCount > 0 ? `${activeCount} active · ` : ''}{deliveredCount} delivered
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={myOrders}
        keyExtractor={o => o.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onAccept={handleAccept}
            onReject={handleReject}
            onReturn={handleReturn}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>📦</Text>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptySub}>Your orders from the shop will appear here</Text>
            <TouchableOpacity
              style={s.shopBtn}
              onPress={() => navigation.navigate('MarketHome')}
            >
              <Text style={s.shopBtnText}>🛒  Go to Shop</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: P.tealDark },
  header:      { backgroundColor: P.tealDark, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  backBtn:     { marginBottom: 8 },
  backText:    { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  list:        { backgroundColor: P.bg, padding: 16, paddingBottom: 40, flexGrow: 1 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: P.text },
  emptySub:    { fontSize: 13, color: P.textMuted, textAlign: 'center' },
  shopBtn:     { marginTop: 16, backgroundColor: P.teal, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13 },
  shopBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
