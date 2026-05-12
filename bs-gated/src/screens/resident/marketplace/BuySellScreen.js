/**
 * BuySellScreen.js — Resident P2P Buy/Sell Marketplace
 *
 * This is the standalone P2P (peer-to-peer) marketplace where residents
 * can post and browse used items (furniture, appliances, etc.).
 *
 * ❌ This screen does NOT show vendor/grocery/shop products.
 * ✅ This screen ONLY shows resident-to-resident listings.
 *
 * Accessible from:
 *   - Community section in ResidentDashboard
 *   - ResidentNavigator route: "BuySell"
 *
 * Design: Matches Resident teal palette (same as ResidentDashboard & VisitorScreen)
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, FlatList, TextInput, Alert, Modal, Platform,
} from 'react-native';
import useAppStore      from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import { useDemoStore } from '../../../store/demoStore';

// ─── Palette (mirrors ResidentDashboard exactly) ──────────────────────────────
const P = {
  teal:      '#1A7A7A',
  tealDark:  '#0D6E6E',
  tealDeep:  '#1A7A7A',
  tealSoft:  '#E8F5F5',
  tealMid:   '#D0EEEE',
  bg:        '#E8F5F5',
  surface:   '#FFFFFF',
  text:      '#1A2E2E',
  textMuted: '#7A9E9E',
  textSub:   '#3D6E6E',
  border:    '#D0EEEE',
  danger:    '#C62828',
  warning:   '#E65100',
  gold:      '#D4AF5A',
};

const CATEGORIES = [
  'Electronics', 'Furniture', 'Clothing', 'Books',
  'Appliances', 'Sports', 'Toys', 'Other',
];

const LISTING_STATUS_META = {
  ACTIVE:           { label: 'Available',    color: P.teal,    bg: '#CCFBF1' },
  PENDING_APPROVAL: { label: 'Under Review', color: P.warning, bg: '#FEF3C7' },
  SOLD:             { label: 'Sold',         color: P.textMuted, bg: '#F1F5F9' },
  REJECTED:         { label: 'Rejected',     color: P.danger,  bg: '#FEE2E2' },
};

// ─── Header ───────────────────────────────────────────────────────────────────
function ScreenHeader({ navigation, activeCount }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={s.headerContent}>
        <Text style={s.headerTitle}>♻️ Buy / Sell</Text>
        <Text style={s.headerSub}>
          {activeCount} item{activeCount !== 1 ? 's' : ''} listed by residents
        </Text>
      </View>
    </View>
  );
}

// ─── Mode Tab Bar ─────────────────────────────────────────────────────────────
function ModeBar({ mode, onMode, onSell }) {
  return (
    <View style={s.modeBar}>
      {[['browse', '🔍 Browse'], ['mine', '📋 My Listings']].map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[s.modeBtn, mode === key && s.modeBtnActive]}
          onPress={() => onMode(key)}
          activeOpacity={0.8}
        >
          <Text style={[s.modeBtnText, mode === key && s.modeBtnTextActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={s.sellBtn} onPress={onSell} activeOpacity={0.85}>
        <Text style={s.sellBtnText}>+ Sell Item</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ item, myId, onContact, onMarkSold }) {
  const isMine = item.sellerId === myId;
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardSub}>{item.category} · {item.negotiable ? 'Negotiable' : 'Fixed Price'}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: '#CCFBF1' }]}>
          <Text style={[s.badgeText, { color: P.teal }]}>Available</Text>
        </View>
      </View>
      <Text style={s.price}>₹{item.price.toLocaleString('en-IN')}</Text>
      {!!item.description && (
        <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={s.sellerRow}>
        <Text style={s.sellerText}>👤 {item.sellerName} · {item.sellerUnit}</Text>
        <Text style={s.interestedText}>💬 {item.interestedCount || 0} interested</Text>
      </View>
      {!isMine && (
        <TouchableOpacity style={s.actionBtn} onPress={() => onContact(item)} activeOpacity={0.85}>
          <Text style={s.actionBtnText}>💬 I'm Interested</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── My Listing Card ──────────────────────────────────────────────────────────
function MyListingCard({ item, onMarkSold }) {
  const meta = LISTING_STATUS_META[item.status] || LISTING_STATUS_META.ACTIVE;
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardSub}>{item.category} · ₹{item.price.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: meta.bg }]}>
          <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
      <Text style={s.cardSub}>💬 {item.interestedCount || 0} interested buyers</Text>
      {item.status === 'ACTIVE' && (
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: P.textMuted, marginTop: 10 }]}
          onPress={() => onMarkSold(item)}
          activeOpacity={0.85}
        >
          <Text style={s.actionBtnText}>✓ Mark as Sold</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Sell Form Modal ──────────────────────────────────────────────────────────
function SellFormModal({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '', category: 'Electronics', description: '', price: '', negotiable: true,
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Please enter an item title'); return; }
    if (!form.price.trim())  { Alert.alert('Required', 'Please enter a price'); return; }
    onSubmit({ ...form, price: parseInt(form.price.replace(/[^0-9]/g, '')) || 0 });
    setForm({ title: '', category: 'Electronics', description: '', price: '', negotiable: true });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={sf.overlay}>
        <View style={sf.sheet}>
          {/* Handle */}
          <View style={sf.handle} />
          {/* Title row */}
          <View style={sf.titleRow}>
            <Text style={sf.title}>Sell an Item</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
              <Text style={sf.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={sf.label}>Item Title *</Text>
            <TextInput
              style={sf.input}
              placeholder="e.g. Samsung TV 32 inch"
              placeholderTextColor={P.textMuted}
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
            />

            <Text style={sf.label}>Asking Price (₹) *</Text>
            <TextInput
              style={sf.input}
              placeholder="e.g. 5000"
              placeholderTextColor={P.textMuted}
              value={form.price}
              onChangeText={v => setForm(f => ({ ...f, price: v }))}
              keyboardType="numeric"
            />

            <Text style={sf.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[sf.chip, form.category === c && sf.chipActive]}
                    onPress={() => setForm(f => ({ ...f, category: c }))}
                  >
                    <Text style={[sf.chipText, form.category === c && sf.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={sf.label}>Description</Text>
            <TextInput
              style={[sf.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Condition, age, what's included..."
              placeholderTextColor={P.textMuted}
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
              multiline
            />

            {/* Negotiable toggle */}
            <View style={sf.toggleRow}>
              <TouchableOpacity
                style={[sf.toggle, form.negotiable ? sf.toggleOn : sf.toggleOff]}
                onPress={() => setForm(f => ({ ...f, negotiable: !f.negotiable }))}
              >
                <View style={[sf.thumb, form.negotiable ? sf.thumbOn : sf.thumbOff]} />
              </TouchableOpacity>
              <Text style={sf.toggleLabel}>Price is Negotiable</Text>
            </View>

            <TouchableOpacity style={sf.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={sf.submitBtnText}>♻️ Submit Listing</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sf = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: P.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  handle:     { width: 40, height: 4, backgroundColor: P.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:      { fontSize: 18, fontWeight: '800', color: P.text },
  close:      { fontSize: 20, color: P.textMuted, fontWeight: '600' },
  label:      { fontSize: 12, fontWeight: '700', color: P.textMuted, marginBottom: 6, marginTop: 10 },
  input:      { backgroundColor: P.tealSoft, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: P.text, marginBottom: 4 },
  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: P.tealSoft, borderWidth: 1, borderColor: P.border },
  chipActive: { backgroundColor: P.teal, borderColor: P.teal },
  chipText:   { fontSize: 12, fontWeight: '600', color: P.textMuted },
  chipTextActive: { color: '#FFFFFF' },
  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 20 },
  toggle:     { width: 44, height: 24, borderRadius: 12, padding: 2 },
  toggleOn:   { backgroundColor: P.teal },
  toggleOff:  { backgroundColor: P.border },
  thumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  thumbOn:    { marginLeft: 20 },
  thumbOff:   { marginLeft: 0 },
  toggleLabel:{ fontSize: 13, color: P.textMuted },
  submitBtn:  { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function BuySellScreen({ navigation }) {
  const user          = useAuthStore(s => s.user);
  const { demoResident } = useDemoStore();

  const activeUser = demoResident || user;
  const myId       = activeUser?.id   || 'res1';
  const myName     = activeUser?.name || 'Resident';
  const myUnit     = activeUser?.unit || 'A-101';
  const isDemo     = !!demoResident;

  const p2pListings      = useAppStore(s => s.p2pListings);
  const createP2PListing = useAppStore(s => s.createP2PListing);
  const markP2PSold      = useAppStore(s => s.markP2PSold);
  const sendP2PMessage   = useAppStore(s => s.sendP2PMessage);

  const [mode, setMode]         = useState('browse'); // 'browse' | 'mine'
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');

  // Only ACTIVE listings visible in browse
  const activeListings = p2pListings.filter(l => l.status === 'ACTIVE');
  const filteredListings = search
    ? activeListings.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase())
      )
    : activeListings;

  const myListings = p2pListings.filter(l => l.sellerId === myId);

  const handleContact = (listing) => {
    navigation.navigate('ResidentChat', {
      contextId:    listing.id,
      contextTitle: listing.title,
      contextType:  'p2p',
      buyerId:      myId,
      buyerName:    myName,
      buyerUnit:    myUnit,
      sellerId:     listing.sellerId,
      sellerName:   listing.sellerName,
      sellerUnit:   listing.sellerUnit,
      myId, myName, myUnit,
    });
  };

  const handleMarkSold = (item) => {
    Alert.alert(
      'Mark as Sold',
      `Mark "${item.title}" as sold? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Sold', style: 'destructive', onPress: () => markP2PSold(item.id) },
      ]
    );
  };

  const handleSubmitListing = (formData) => {
    const newListing = createP2PListing({
      sellerId:   myId,
      sellerName: myName,
      sellerUnit: myUnit,
      ...formData,
    });
    setShowForm(false);
    if (newListing?.isFirstListing) {
      Alert.alert(
        '🔍 Under Review',
        `Your first listing "${newListing.title}" has been submitted for admin approval.\n\nOnce approved, it will be visible to all residents.\n\nFuture listings will go live instantly.`
      );
    } else {
      Alert.alert('✅ Listed!', `"${newListing?.title || 'Item'}" is now live and visible to all residents.`);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* Header */}
      <ScreenHeader navigation={navigation} activeCount={activeListings.length} />

      {/* Demo banner */}
      {isDemo && (
        <View style={s.demoBanner}>
          <Text style={{ fontSize: 14 }}>🎭</Text>
          <Text style={s.demoBannerText}>
            Demo Mode: Viewing as {myName} ({myUnit})
          </Text>
        </View>
      )}

      {/* Mode bar */}
      <ModeBar mode={mode} onMode={setMode} onSell={() => setShowForm(true)} />

      {/* Body */}
      <View style={s.body}>
        {mode === 'browse' && (
          <>
            {/* Search */}
            <View style={s.searchWrap}>
              <TextInput
                style={s.search}
                placeholder="Search items (TV, sofa, books...)"
                placeholderTextColor={P.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredListings}
              keyExtractor={item => item.id}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ListingCard
                  item={item}
                  myId={myId}
                  onContact={handleContact}
                  onMarkSold={handleMarkSold}
                />
              )}
              ListEmptyComponent={
                <View style={s.emptyState}>
                  <Text style={{ fontSize: 52 }}>♻️</Text>
                  <Text style={s.emptyTitle}>No listings yet</Text>
                  <Text style={s.emptySub}>Be the first to post an item for sale!</Text>
                  <TouchableOpacity
                    style={s.emptyBtn}
                    onPress={() => setShowForm(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={s.emptyBtnText}>+ Sell an Item</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </>
        )}

        {mode === 'mine' && (
          <FlatList
            data={myListings}
            keyExtractor={item => item.id}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MyListingCard item={item} onMarkSold={handleMarkSold} />
            )}
            ListEmptyComponent={
              <View style={s.emptyState}>
                <Text style={{ fontSize: 52 }}>📋</Text>
                <Text style={s.emptyTitle}>No listings posted yet</Text>
                <Text style={s.emptySub}>Start selling your unused items to neighbours</Text>
                <TouchableOpacity
                  style={s.emptyBtn}
                  onPress={() => setShowForm(true)}
                  activeOpacity={0.85}
                >
                  <Text style={s.emptyBtnText}>+ Sell an Item</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Sell Form Modal */}
      <SellFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmitListing}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.tealDeep },

  // Header
  header: {
    backgroundColor: P.tealDeep,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backBtn:      { marginBottom: 8 },
  backText:     { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' },
  headerContent:{ },
  headerTitle:  { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

  // Demo banner
  demoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF3C7', borderBottomWidth: 1.5, borderBottomColor: P.warning,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  demoBannerText: { fontSize: 12, fontWeight: '700', color: P.warning, flex: 1 },

  // Mode bar
  modeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: P.surface,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: P.border,
  },
  modeBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: P.tealSoft, borderWidth: 1, borderColor: P.border },
  modeBtnActive:    { backgroundColor: P.teal, borderColor: P.teal },
  modeBtnText:      { fontSize: 12, fontWeight: '600', color: P.textMuted },
  modeBtnTextActive:{ color: '#FFFFFF' },
  sellBtn:          { marginLeft: 'auto', backgroundColor: P.gold, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  sellBtnText:      { fontSize: 12, fontWeight: '800', color: P.teal },

  // Body
  body:       { flex: 1, backgroundColor: P.bg },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  search: {
    backgroundColor: P.surface, borderWidth: 1.5, borderColor: P.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: P.text,
  },
  listContent: { padding: 16, gap: 12, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: P.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: P.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  cardTitle:  { fontSize: 15, fontWeight: '800', color: P.text },
  cardSub:    { fontSize: 12, color: P.textMuted, marginTop: 3 },
  price:      { fontSize: 20, fontWeight: '900', color: P.teal, marginBottom: 6 },
  desc:       { fontSize: 13, color: P.textMuted, marginBottom: 10, lineHeight: 18 },
  badge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText:  { fontSize: 11, fontWeight: '800' },
  sellerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sellerText: { fontSize: 12, color: P.textMuted },
  interestedText: { fontSize: 12, color: P.teal, fontWeight: '700' },
  actionBtn: {
    backgroundColor: P.teal, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: P.text, marginTop: 8 },
  emptySub:   { fontSize: 13, color: P.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyBtn:   { marginTop: 16, backgroundColor: P.teal, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});