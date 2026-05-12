/**
 * MarketHomeScreen.js — Shop (Grocery / Vendor Marketplace)
 *
 * This is the SHOP screen — browse and buy new items from vendors/grocery.
 * ✅ Purpose: Vendor-based product browsing, cart, and order tracking.
 * ❌ Does NOT include Buy/Sell (P2P). That is BuySellScreen.js.
 *
 * Tabs: Shop | Cart | Orders
 * Navigation route: "MarketHome" / "ResidentMarketHome"
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, Modal,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
import useAppStore          from '../../../store/appStore'; // ← replaces useStore
import { useAuthStore }     from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const ORDER_STATUS_META = {
  pending:           { label: 'Pending',              color: Colors.amber,  bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',             color: Colors.teal,   bg: Colors.tealLight   },
  assigned_delivery: { label: 'Out for Delivery',      color: Colors.blue,   bg: Colors.blueLight   },
  out_for_delivery:  { label: '🚶 Arrived at Door!',   color: '#1A7A7A',     bg: '#F5F3FF'          },
  delivered:         { label: 'Delivered ✅',           color: Colors.green,  bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',              color: '#C62828',     bg: '#FEE2E2'          },
  return_requested:  { label: 'Return Requested',      color: '#D97706',     bg: '#FEF3C7'          },
  return_accepted:   { label: 'Return Accepted',       color: '#7C3AED',     bg: '#F3E8FF'          },
  return_picked_up:  { label: 'Picked Up by Vendor',   color: '#0D9488',     bg: '#CCFBF1'          },
  return_rejected:   { label: 'Return Rejected',       color: '#C62828',     bg: '#FEE2E2'          },
  returned:          { label: 'Refund Processed',      color: Colors.green,  bg: Colors.greenLight  },
};

// ─── 3-Tab Bar (Shop only — Buy/Sell is a separate screen) ───────────────────
function MarketTabBar({ activeTab, onTabPress }) {
  const cart = useAppStore(s => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const tabs = [
    { key: 'Shop',     icon: '🛒', label: 'Shop',     badge: 0 },
    { key: 'Cart',     icon: '🛍️', label: 'Cart',     badge: cartCount },
    { key: 'Orders',   icon: '📦', label: 'Orders',   badge: 0 },
    { key: 'Wishlist', icon: '🤍', label: 'Wishlist',  badge: 0 },
  ];

  return (
    <View style={tb.bar}>
      {tabs.map(t => {
        const active = activeTab === t.key;
        return (
          <TouchableOpacity key={t.key} onPress={() => onTabPress(t.key)} activeOpacity={0.7} style={[tb.item, active && { backgroundColor: Colors.tealLight }]}>
            <View style={{ position: 'relative' }}>
              <Text style={tb.icon}>{t.icon}</Text>
              {t.badge > 0 && (
                <View style={tb.badge}>
                  <Text style={tb.badgeText}>{t.badge > 9 ? '9+' : t.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tb.label, active && { color: Colors.teal, fontWeight: Fonts.bold }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar:       { height: 68, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingBottom: 8 },
  item:      { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md },
  icon:      { fontSize: 20 },
  label:     { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  badge:     { position: 'absolute', top: -5, right: -10, backgroundColor: '#C62828', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
});

// ─── NOTE: P2P Buy/Sell has been moved to BuySellScreen.js ───────────────────
// The P2P marketplace (resident-to-resident listings) is now a standalone screen.
// Route: navigation.navigate('BuySell')
// File:  src/screens/resident/marketplace/BuySellScreen.js
// ─────────────────────────────────────────────────────────────────────────────


// ─── Market Home StyleSheet ───────────────────────────────────────────────────
const ms = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#F0FAFA' },
  header:          { padding: 20, paddingTop: 40, backgroundColor: '#1A7A7A' },
  backBtn:         { marginBottom: 8 },
  backText:        { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:     { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 4 },
  search:          { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1A7A7A', marginBottom: 16 },
  grid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  productCard:     { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 4 },
  productEmoji:    { fontSize: 36, marginBottom: 6 },
  productName:     { fontSize: 13, fontWeight: '800', color: '#1A7A7A', marginBottom: 2 },
  productCategory: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  productPrice:    { fontSize: 16, fontWeight: '900', color: '#1A7A7A', marginBottom: 4 },
  stock:           { fontSize: 11, color: '#1A7A7A', fontWeight: '600', marginBottom: 8 },
  stockLow:        { color: '#C62828' },
  addBtn:          { backgroundColor: '#1A7A7A', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  addBtnText:      { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

// ─── Cart Inline ──────────────────────────────────────────────────────────────
function ResidentCartInline({ navigation }) {
  const cart         = useAppStore(s => s.cart);
  const removeFromCart = useAppStore(s => s.removeFromCart);
  const updateCartQty  = useAppStore(s => s.updateCartQty);
  const placeOrder     = useAppStore(s => s.placeOrder);
  const user         = useAuthStore(s => s.user);
  const total        = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [payMethod,  setPayMethod]  = useState('upi');
  const [placing,    setPlacing]    = useState(false);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    Alert.alert(
      'Confirm Order',
      `Pay ₹${(total + 20).toLocaleString('en-IN')} via ${payMethod.toUpperCase()}?\n\nDelivery to Unit ${user?.unit || 'your unit'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => {
            setPlacing(true);
            setTimeout(() => {
              const order = placeOrder(
                user?.id   || 'res1',
                user?.name || 'Resident',
                user?.unit || 'A-101',
                cart
              );
              setPlacing(false);
              Alert.alert(
                '🎉 Order Placed!',
                `Order #${order.id} confirmed.\n\nYou'll receive a 6-digit OTP to share with the delivery person at the gate.`,
                [{ text: 'View Orders', onPress: () => {} }]
              );
            }, 800);
          },
        },
      ]
    );
  };

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 48 }}>🛍️</Text>
        <Text style={{ fontSize: 16, color: '#7A9E9E', fontWeight: '600' }}>Your cart is empty</Text>
        <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 30 }}>
          Add products from the Shop tab to start an order
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
      {/* Cart items */}
      {cart.map(item => (
        <View key={item.productId} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A7A7A' }}>{item.name}</Text>
            <Text style={{ fontSize: 13, color: '#7A9E9E' }}>₹{item.price} × {item.qty}</Text>
          </View>
          {/* Qty controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => item.qty <= 1 ? removeFromCart(item.productId) : updateCartQty(item.productId, item.qty - 1)}
              style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#1A7A7A', fontSize: 18, fontWeight: '700' }}>{item.qty <= 1 ? '✕' : '−'}</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A2E2E', minWidth: 20, textAlign: 'center' }}>{item.qty}</Text>
            <TouchableOpacity
              onPress={() => updateCartQty(item.productId, item.qty + 1)}
              style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A7A7A', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Delivery address */}
      <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE' }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#7A9E9E', marginBottom: 6 }}>📍 DELIVERY TO</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A2E2E' }}>Unit {user?.unit || 'A-101'}</Text>
        <Text style={{ fontSize: 12, color: '#7A9E9E', marginTop: 2 }}>Society Gate entry with OTP verification</Text>
      </View>

      {/* Payment method */}
      <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE' }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#7A9E9E', marginBottom: 10 }}>💳 PAYMENT METHOD</Text>
        {[
          { id: 'upi',  label: 'UPI (GPay / PhonePe / Paytm)', emoji: '📱' },
          { id: 'card', label: 'Credit / Debit Card',           emoji: '💳' },
          { id: 'cod',  label: 'Cash on Delivery',              emoji: '💵' },
        ].map(m => (
          <TouchableOpacity
            key={m.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: m.id !== 'cod' ? 1 : 0, borderBottomColor: '#E8F5F5' }}
            onPress={() => setPayMethod(m.id)}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: payMethod === m.id ? '#1A7A7A' : '#D0EEEE', backgroundColor: payMethod === m.id ? '#1A7A7A' : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
              {payMethod === m.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' }} />}
            </View>
            <Text style={{ fontSize: 14 }}>{m.emoji}</Text>
            <Text style={{ fontSize: 13, fontWeight: payMethod === m.id ? '700' : '500', color: payMethod === m.id ? '#1A7A7A' : '#3D6E6E' }}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bill summary */}
      <View style={{ backgroundColor: '#1A7A7A', borderRadius: 16, padding: 16 }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', marginBottom: 10 }}>BILL SUMMARY</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Subtotal ({cart.reduce((s,i)=>s+i.qty,0)} items)</Text>
          <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Delivery charge</Text>
          <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>₹20</Text>
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>Total</Text>
          <Text style={{ color: '#D4AF5A', fontSize: 20, fontWeight: '900' }}>₹{(total + 20).toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: placing ? '#94A3B8' : '#D4AF5A', borderRadius: 12, paddingVertical: 15, alignItems: 'center' }}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#1A2E2E', fontSize: 15, fontWeight: '900' }}>
            {placing ? '⏳ Placing Order…' : '🛒 Place Order'}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          You'll receive an OTP to share at the gate for delivery
        </Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ─── Order Status Timeline ───────────────────────────────────────────────────
const ORDER_STEPS = [
  { status: 'pending',           label: 'Order Placed',        icon: '🛒' },
  { status: 'accepted',          label: 'Confirmed by Vendor', icon: '✅' },
  { status: 'assigned_delivery', label: 'Out for Delivery',    icon: '🚚' },
  { status: 'out_for_delivery',  label: 'Arrived at Gate',     icon: '🏘️' },
  { status: 'delivered',         label: 'Delivered',           icon: '📦' },
];
const RETURN_STEPS = [
  { status: 'return_requested',  label: 'Return Requested',    icon: '↩️' },
  { status: 'return_accepted',   label: 'Return Accepted by Vendor', icon: '✅' },
  { status: 'return_picked_up',  label: 'Item Picked Up',      icon: '🏍️' },
  { status: 'returned',          label: 'Refund Processed',    icon: '💰' },
];
const STEP_KEYS = ORDER_STEPS.map(s => s.status);

function StatusTimeline({ status }) {
  const isRejected   = status === 'rejected';
  const isReturnFlow = ['return_requested','return_accepted','return_picked_up','return_rejected','returned'].includes(status);

  if (isRejected) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginTop: 12 }}>
      <Text style={{ fontSize: 16, marginRight: 8 }}>❌</Text>
      <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '700' }}>Order Rejected by Vendor</Text>
    </View>
  );

  if (isReturnFlow) {
    const steps = status === 'return_rejected'
      ? [RETURN_STEPS[0], { status: 'return_rejected', label: 'Return Rejected', icon: '❌' }]
      : RETURN_STEPS;
    const currentIdx = steps.findIndex(s => s.status === status);
    return (
      <View style={{ marginTop: 14, marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: '#D97706', fontWeight: '700', marginBottom: 8 }}>↩️ RETURN IN PROGRESS</Text>
        {steps.map((step, i) => {
          const done = i <= currentIdx; const active = i === currentIdx; const last = i === steps.length - 1;
          return (
            <View key={step.status} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 26, marginRight: 10 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                  borderColor: done ? '#D97706' : '#D0EEEE', backgroundColor: active ? '#D97706' : done ? '#FEF3C7' : '#F8FAFA',
                  alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 10 }}>{active ? step.icon : done ? '✓' : '○'}</Text>
                </View>
                {!last && <View style={{ width: 2, height: 18, backgroundColor: done && !active ? '#D97706' : '#D0EEEE', marginVertical: 2 }} />}
              </View>
              <Text style={{ fontSize: 12, marginBottom: last ? 0 : 16, marginTop: 2,
                fontWeight: active ? '800' : '600', color: active ? '#D97706' : done ? '#92400E' : '#7A9E9E' }}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  const currentIdx = STEP_KEYS.indexOf(status);
  return (
    <View style={{ marginTop: 14, marginBottom: 4 }}>
      {ORDER_STEPS.map((step, i) => {
        const done   = i <= currentIdx;
        const active = i === currentIdx;
        const last   = i === ORDER_STEPS.length - 1;
        return (
          <View key={step.status} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: 26, marginRight: 10 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: done ? '#1A7A7A' : '#D0EEEE', backgroundColor: active ? '#1A7A7A' : done ? '#CCFBF1' : '#F8FAFA',
                alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10 }}>{active ? step.icon : done ? '✓' : '○'}</Text>
              </View>
              {!last && <View style={{ width: 2, height: 18, backgroundColor: done && !active ? '#1A7A7A' : '#D0EEEE', marginVertical: 2 }} />}
            </View>
            <Text style={{ fontSize: 12, marginBottom: last ? 0 : 16, marginTop: 2,
              fontWeight: active ? '800' : '600', color: active ? '#1A7A7A' : done ? '#3D6E6E' : '#7A9E9E' }}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Orders Inline ────────────────────────────────────────────────────────────
function ResidentOrdersInline({ navigation }) {
  const orders                  = useAppStore(s => s.marketplaceOrders);
  const residentConfirmDelivery = useAppStore(s => s.residentConfirmDelivery);
  const residentRejectDelivery  = useAppStore(s => s.residentRejectDelivery);
  const residentRequestReturn   = useAppStore(s => s.residentRequestReturn);
  const user     = useAuthStore(s => s.user);
  const myOrders = (orders || [])
    .filter(o => o.residentId === (user?.id || 'res1'))
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  const handleAccept = (order) => {
    Alert.alert('✅ Confirm Delivery', `Confirm you received Order #${order.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Received!', onPress: () => { residentConfirmDelivery(order.id); Alert.alert('🎉 Done!', 'Order marked as delivered.'); } },
    ]);
  };

  const handleReject = (order) => {
    Alert.alert('❌ Reject Delivery', 'Reject this delivery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => { residentRejectDelivery(order.id); Alert.alert('Rejected', 'Vendor notified.'); } },
    ]);
  };

  const handleReturn = (order) => {
    Alert.alert('📦 Request Return', `Request return for Order #${order.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Request Return', style: 'destructive', onPress: () => { residentRequestReturn(order.id); Alert.alert('✅ Done', 'Return request sent to vendor.'); } },
    ]);
  };

  if (myOrders.length === 0) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 }}>
      <Text style={{ fontSize: 48 }}>📦</Text>
      <Text style={{ fontSize: 16, color: '#7A9E9E', fontWeight: '700' }}>No orders yet</Text>
      <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>Items you order from the Shop will appear here</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {myOrders.map(order => {
        const meta          = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending;
        const arrivedAtDoor = order.status === 'out_for_delivery' && order.otpVerified;
        return (
          <View key={order.id} style={[
            { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#D0EEEE', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
            arrivedAtDoor && { borderColor: '#7C3AED', borderWidth: 2 },
          ]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A2E2E' }}>Order #{order.id}</Text>
              <View style={{ backgroundColor: meta.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: meta.color }}>{meta.label}</Text>
              </View>
            </View>

            {/* Items */}
            <Text style={{ fontSize: 13, color: '#3D6E6E', lineHeight: 19 }} numberOfLines={2}>
              {(order.items || []).map(i => `${i.emoji || '📦'} ${i.name} ×${i.qty}`).join('  ·  ')}
            </Text>

            {/* Timeline */}
            <StatusTimeline status={order.status} />

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#D0EEEE' }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#1A7A7A' }}>₹{(order.total || 0) + 20}</Text>
              <Text style={{ fontSize: 11, color: '#7A9E9E' }}>
                {order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
              </Text>
            </View>

            {/* OTP */}
            {order.otp && order.status === 'assigned_delivery' && !order.otpVerified && (
              <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#A5D6A7', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#2E7D32', fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>🔐 Share this OTP with delivery person at the gate</Text>
                <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A7A7A', letterSpacing: 8 }}>{order.otp}</Text>
              </View>
            )}

            {/* Arrived at door */}
            {arrivedAtDoor && (
              <View style={{ backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#DDD6FE' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#7C3AED', marginBottom: 4 }}>
                  🚶 {order.deliveryPartnerName || 'Delivery partner'} has arrived!
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>Please confirm you received your order.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 11, alignItems: 'center' }} onPress={() => handleReject(order)}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626' }}>✗  Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 2, backgroundColor: '#D1FAE5', borderRadius: 10, paddingVertical: 11, alignItems: 'center' }} onPress={() => handleAccept(order)}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#064E3B' }}>✓  Accept Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Return button — only for delivered, within 7 days */}
            {order.status === 'delivered' && (
              <TouchableOpacity
                style={{ marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' }}
                onPress={() => handleReturn(order)}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>↩️  Request Return / Refund</Text>
              </TouchableOpacity>
            )}
            {/* Return status info */}
            {order.status === 'return_requested' && (
              <View style={{ marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>↩️ Return requested</Text>
                <Text style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>Waiting for vendor to accept. You'll be notified once accepted.</Text>
              </View>
            )}
            {order.status === 'return_accepted' && (
              <View style={{ marginTop: 12, backgroundColor: '#F3E8FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#DDD6FE' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED' }}>✅ Return accepted</Text>
                <Text style={{ fontSize: 12, color: '#6B21A8', marginTop: 4 }}>Vendor will arrange pickup. Please keep the item ready.</Text>
              </View>
            )}
            {order.status === 'return_picked_up' && (
              <View style={{ marginTop: 12, backgroundColor: '#CCFBF1', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#99F6E4' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0D9488' }}>🏍️ Item picked up</Text>
                <Text style={{ fontSize: 12, color: '#134E4A', marginTop: 4 }}>Vendor has collected the item. Refund will be processed shortly.</Text>
              </View>
            )}
            {order.status === 'returned' && (
              <View style={{ marginTop: 12, backgroundColor: '#DCFCE7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#A5D6A7' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#16A34A' }}>💰 Refund processed</Text>
                <Text style={{ fontSize: 12, color: '#14532D', marginTop: 4 }}>₹{order.total} refund has been initiated. Allow 3-5 business days.</Text>
              </View>
            )}
            {order.status === 'return_rejected' && (
              <View style={{ marginTop: 12, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>❌ Return rejected</Text>
                {order.returnRejectionReason ? <Text style={{ fontSize: 12, color: '#991B1B', marginTop: 4 }}>Reason: {order.returnRejectionReason}</Text> : null}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKET HOME — MIGRATED (useStore → appStore), 4-tab layout
// ═══════════════════════════════════════════════════════════════════════════════

export default function ResidentMarketHomeScreen({ navigation }) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);
  const products       = useAppStore(s => s.marketplaceProducts);
  const addToCart      = useAppStore(s => s.addToCart);
  const toggleWishlist = useAppStore(s => s.toggleWishlist);
  const isWishlisted   = useAppStore(s => s.isWishlisted);
  const userId = user?.id || 'res1';

  const [activeTab, setActiveTab] = useState('Shop');
  const [search, setSearch]       = useState('');

  const active = products.filter(p => p.active && p.stock > 0);
  const filtered = search
    ? active.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : active;

  const handleAdd = (product) => {
    addToCart(product, 1);
    Alert.alert('Added to cart', `${product.name} added!`);
  };

  return (
    <SafeAreaView style={ms.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <View style={ms.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ms.backBtn}>
          <Text style={ms.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={ms.headerTitle}>🛒 Shop</Text>
        <Text style={ms.headerSub}>Browse products from vendors</Text>
        <View style={{ width: 44 }} />
      </View>

      <MarketTabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {activeTab === 'Shop' && (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <TextInput
            style={ms.search}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <View style={ms.grid}>
            {filtered.map(p => (
              <TouchableOpacity
                key={p.id}
                style={ms.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
              >
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                  onPress={() => toggleWishlist(userId, p.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 18 }}>{isWishlisted(userId, p.id) ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                <Text style={ms.productEmoji}>{p.emoji}</Text>
                <Text style={ms.productName}>{p.name}</Text>
                <Text style={ms.productCategory}>{p.category}</Text>
                <Text style={ms.productPrice}>₹{p.price}</Text>
                <Text style={[ms.stock, p.stock < 10 && ms.stockLow]}>
                  {p.stock < 10 ? `Only ${p.stock} left!` : `In stock`}
                </Text>
                <TouchableOpacity style={ms.addBtn} onPress={() => handleAdd(p)}>
                  <Text style={ms.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {activeTab === 'Cart' && <ResidentCartInline navigation={navigation} />}

      {activeTab === 'Orders' && <ResidentOrdersInline navigation={navigation} />}

      {activeTab === 'Wishlist' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🤍</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A2E2E', marginBottom: 8 }}>Your Wishlist</Text>
          <Text style={{ fontSize: 13, color: '#7A9E9E', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            Save products you love and find them here anytime.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#1A7A7A', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>Open Wishlist →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}