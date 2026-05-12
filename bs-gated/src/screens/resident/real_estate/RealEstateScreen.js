/**
 * RealEstateScreen.js
 * Residents browse active sale/rent listings and create their own.
 * First listing requires admin approval; subsequent ones go live instantly.
 *
 * THEME: Matches visitor screen — teal (#1A7A7A) header, #E8F5F5 background,
 *        white cards, teal/amber accents.
 *
 * WORKFLOW:
 *   Browse → View Detail → Inquire / Schedule Visit
 *   My Listings → Track status, manage, mark sold/rented, withdraw
 *   New Listing → Form → Pending Approval (first) or Live Instantly
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, FlatList, Modal,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useAppStore from '../../../store/appStore';
import { useDemoStore } from '../../../store/demoStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const FURNISHED_OPTIONS = ['Unfurnished', 'Semi-furnished', 'Fully-furnished'];
const AVAILABILITY_OPTIONS = ['Immediate', '1 month', '2 months', '3 months'];
const AMENITY_OPTIONS = ['Gym', 'Swimming Pool', 'Covered Parking', 'Club House', 'Garden', 'CCTV', 'Power Backup', 'Lift'];

const STATUS_META = {
  ACTIVE:           { label: 'Active',         color: '#1A7A7A', bg: '#D1FAF0', icon: '✅' },
  PENDING_APPROVAL: { label: 'Pending Review',  color: '#B45309', bg: '#FEF3C7', icon: '⏳' },
  SOLD:             { label: 'Sold',            color: '#64748B', bg: '#F1F5F9', icon: '🏷' },
  RENTED:           { label: 'Rented',          color: '#1A7A7A', bg: '#DBEAFE', icon: '🔑' },
  REJECTED:         { label: 'Rejected',        color: '#B91C1C', bg: '#FEE2E2', icon: '🚫' },
  UNDER_NEGOTIATION:{ label: 'In Negotiation',  color: '#6D28D9', bg: '#EDE9FE', icon: '🤝' },
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Share Sheet ──────────────────────────────────────────────────────────────
function ShareSheet({ visible, onClose, listing }) {
  const [shared, setShared] = useState(false);
  const CHANNELS = [
    { icon: '💬', label: 'WhatsApp' },
    { icon: '📱', label: 'SMS' },
    { icon: '📧', label: 'Email' },
    { icon: '📋', label: 'Copy' },
  ];
  const message = listing
    ? `🏠 ${listing.title}\n📍 Unit ${listing.unit}\n💰 ${listing.priceLabel}\n📐 ${listing.area} sqft · ${listing.bedrooms}BHK · ${listing.furnished}\n📞 Contact: ${listing.ownerName} — ${listing.ownerPhone}`
    : '';

  const handleShare = (ch) => {
    setShared(true);
    setTimeout(() => { setShared(false); onClose(); Alert.alert('✅ Shared!', `Details sent via ${ch}.`); }, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ss.overlay}>
        <View style={ss.sheet}>
          <View style={ss.handle} />
          <Text style={ss.title}>Share Listing</Text>
          <View style={ss.bubble}>
            <Text style={ss.bubbleText}>{message}</Text>
          </View>
          {shared ? (
            <View style={ss.sentRow}><Text style={ss.sentText}>✅ Sending…</Text></View>
          ) : (
            <>
              <Text style={ss.chanLabel}>Send via</Text>
              <View style={ss.chanRow}>
                {CHANNELS.map(c => (
                  <TouchableOpacity key={c.label} style={ss.chanBtn} onPress={() => handleShare(c.label)}>
                    <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                    <Text style={ss.chanText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={ss.cancel} onPress={onClose}>
            <Text style={ss.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ss = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#1A7A7A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle:     { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:      { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  bubble:     { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  bubbleText: { fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 20, fontFamily: 'monospace' },
  chanLabel:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  chanRow:    { flexDirection: 'row', marginBottom: 16 },
  chanBtn:    { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
  chanText:   { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sentRow:    { alignItems: 'center', paddingVertical: 20 },
  sentText:   { fontSize: 16, fontWeight: '800', color: '#FFF' },
  cancel:     { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
});

// ─── Inquiry Modal ────────────────────────────────────────────────────────────
function InquiryModal({ visible, onClose, listing, myName, myPhone, myUnit }) {
  const [message, setMessage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) { Alert.alert('Required', 'Please add a message'); return; }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
      Alert.alert(
        '✅ Inquiry Sent!',
        `Your inquiry has been sent to ${listing?.ownerName}.\n\nThey will contact you at ${myPhone} shortly.`,
      );
      setMessage(''); setVisitDate('');
    }, 1000);
  };

  if (!listing) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={im.overlay}>
        <ScrollView>
          <View style={im.sheet}>
            <View style={im.header}>
              <Text style={im.title}>Send Inquiry</Text>
              <TouchableOpacity onPress={onClose}><Text style={im.close}>✕</Text></TouchableOpacity>
            </View>

            {/* Listing summary */}
            <View style={im.summaryCard}>
              <Text style={im.summaryTitle}>{listing.title}</Text>
              <Text style={im.summarySub}>Unit {listing.unit} · {listing.priceLabel}</Text>
            </View>

            <Text style={im.label}>Your Message *</Text>
            <TextInput
              style={im.input}
              placeholder="Hi, I'm interested in this property. Can we schedule a visit?"
              placeholderTextColor="#7A9E9E"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={im.label}>Preferred Visit Date (optional)</Text>
            <TextInput
              style={im.inputLine}
              placeholder="e.g. May 15, 2025 — Afternoon"
              placeholderTextColor="#7A9E9E"
              value={visitDate}
              onChangeText={setVisitDate}
            />

            <View style={im.fromRow}>
              <Text style={im.fromLabel}>From:</Text>
              <Text style={im.fromValue}>{myName} · Unit {myUnit} · {myPhone}</Text>
            </View>

            <TouchableOpacity
              style={[im.sendBtn, sent && { opacity: 0.7 }]}
              onPress={handleSend}
              disabled={sent}
            >
              <Text style={im.sendText}>{sent ? '📤 Sending…' : '📩 Send Inquiry'}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const im = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:       { backgroundColor: '#E8F5F5', minHeight: '100%', paddingBottom: 40 },
  header:      { backgroundColor: '#1A7A7A', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 20, fontWeight: '800', color: '#FFF' },
  close:       { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  summaryCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#D0EEEE' },
  summaryTitle:{ fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  summarySub:  { fontSize: 13, color: '#3D6E6E', marginTop: 4 },
  label:       { fontSize: 12, fontWeight: '700', color: '#3D6E6E', marginBottom: 6, marginTop: 4, marginHorizontal: 16 },
  input:       { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E', marginHorizontal: 16, marginBottom: 12, minHeight: 100 },
  inputLine:   { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E', marginHorizontal: 16, marginBottom: 16 },
  fromRow:     { marginHorizontal: 16, backgroundColor: '#F0FAFA', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#D0EEEE' },
  fromLabel:   { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginBottom: 2 },
  fromValue:   { fontSize: 13, fontWeight: '600', color: '#1A2E2E' },
  sendBtn:     { marginHorizontal: 16, backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  sendText:    { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Detail Sheet ─────────────────────────────────────────────────────────────
function DetailSheet({ visible, onClose, listing, isOwn, onInquire, onShare, onMarkSold, onMarkRented, onWithdraw }) {
  if (!listing) return null;
  const meta = STATUS_META[listing.status] || STATUS_META.ACTIVE;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ds.overlay}>
        <View style={ds.sheet}>
          {/* Pull handle */}
          <View style={ds.handle} />

          {/* Header */}
          <View style={ds.hdr}>
            <View style={{ flex: 1 }}>
              <View style={ds.typePill}>
                <Text style={ds.typeText}>{listing.type === 'SALE' ? '🏷 For Sale' : '🔑 For Rent'}</Text>
              </View>
              <Text style={ds.hdrTitle}>{listing.title}</Text>
              <Text style={ds.hdrSub}>Unit {listing.unit} · {listing.area} sqft</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={ds.closeBtn}>
              <Text style={ds.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={ds.body} showsVerticalScrollIndicator={false}>
            {/* Price + status */}
            <View style={ds.priceRow}>
              <Text style={ds.price}>{listing.priceLabel}</Text>
              <View style={[ds.badge, { backgroundColor: meta.bg }]}>
                <Text style={[ds.badgeText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
              </View>
            </View>

            {/* Key facts */}
            <View style={ds.factsGrid}>
              <View style={ds.factItem}><Text style={ds.factVal}>🛏 {listing.bedrooms}</Text><Text style={ds.factKey}>Beds</Text></View>
              <View style={ds.factItem}><Text style={ds.factVal}>🚿 {listing.bathrooms}</Text><Text style={ds.factKey}>Baths</Text></View>
              <View style={ds.factItem}><Text style={ds.factVal}>📐 {listing.area}</Text><Text style={ds.factKey}>sqft</Text></View>
              <View style={ds.factItem}><Text style={ds.factVal}>🛋 {listing.furnished?.split('-')[0]}</Text><Text style={ds.factKey}>Furnish</Text></View>
            </View>

            {/* Description */}
            {!!listing.description && (
              <View style={ds.section}>
                <Text style={ds.secLabel}>DESCRIPTION</Text>
                <Text style={ds.descText}>{listing.description}</Text>
              </View>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <View style={ds.section}>
                <Text style={ds.secLabel}>AMENITIES</Text>
                <View style={ds.amenRow}>
                  {listing.amenities.map(a => (
                    <View key={a} style={ds.amenChip}><Text style={ds.amenText}>{a}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {/* Availability */}
            <View style={ds.section}>
              <Text style={ds.secLabel}>AVAILABILITY</Text>
              <View style={ds.infoRow}>
                <Text style={ds.infoKey}>Available</Text>
                <Text style={ds.infoVal}>{listing.availability}</Text>
              </View>
              <View style={ds.infoRow}>
                <Text style={ds.infoKey}>Listed on</Text>
                <Text style={ds.infoVal}>{fmtDate(listing.createdAt)}</Text>
              </View>
              <View style={ds.infoRow}>
                <Text style={ds.infoKey}>Views</Text>
                <Text style={ds.infoVal}>👁 {listing.views}</Text>
              </View>
            </View>

            {/* Owner info */}
            <View style={ds.ownerCard}>
              <View style={ds.ownerAvatar}><Text style={{ fontSize: 22 }}>👤</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={ds.ownerName}>{listing.ownerName}</Text>
                <Text style={ds.ownerUnit}>Unit {listing.unit}</Text>
              </View>
              {!isOwn && listing.ownerPhone && (
                <TouchableOpacity
                  style={ds.callBtn}
                  onPress={() => Alert.alert('Call Owner', `Dial ${listing.ownerPhone}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => Alert.alert('Calling…', `Dialing ${listing.ownerPhone}`) },
                  ])}
                >
                  <Text style={ds.callText}>📞 Call</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Actions */}
            {!isOwn && listing.status === 'ACTIVE' && (
              <View style={ds.actionGroup}>
                <TouchableOpacity style={[ds.actionBtn, { backgroundColor: '#1A7A7A' }]} onPress={onInquire}>
                  <Text style={ds.actionBtnText}>📩 Send Inquiry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[ds.actionBtn, { backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#1A7A7A' }]} onPress={onShare}>
                  <Text style={[ds.actionBtnText, { color: '#1A7A7A' }]}>↗ Share</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Owner actions */}
            {isOwn && listing.status === 'ACTIVE' && (
              <View style={ds.actionGroup}>
                <TouchableOpacity
                  style={[ds.actionBtn, { backgroundColor: listing.type === 'SALE' ? '#1A7A7A' : '#0D6E6E' }]}
                  onPress={() => { onClose(); Alert.alert('Mark as ' + (listing.type === 'SALE' ? 'Sold' : 'Rented'), 'This will close the listing.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: () => listing.type === 'SALE' ? onMarkSold(listing.id) : onMarkRented(listing.id) },
                  ]); }}
                >
                  <Text style={ds.actionBtnText}>{listing.type === 'SALE' ? '✅ Mark as Sold' : '✅ Mark as Rented'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ds.actionBtn, { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECACA' }]}
                  onPress={() => { onClose(); Alert.alert('Withdraw Listing', 'Remove this listing?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Withdraw', style: 'destructive', onPress: () => onWithdraw(listing.id) },
                  ]); }}
                >
                  <Text style={[ds.actionBtnText, { color: '#B91C1C' }]}>🗑 Withdraw</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const ds = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#E8F5F5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  handle:     { width: 40, height: 4, backgroundColor: '#B0DEDE', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  hdr:        { backgroundColor: '#1A7A7A', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', alignItems: 'flex-start', paddingTop: 14 },
  hdrTitle:   { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 6, flexShrink: 1 },
  hdrSub:     { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  typePill:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  typeText:   { fontSize: 11, fontWeight: '700', color: '#FFF' },
  closeBtn:   { paddingLeft: 12, paddingBottom: 4 },
  closeText:  { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  body:       { padding: 16 },
  priceRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  price:      { fontSize: 22, fontWeight: '900', color: '#0D6E6E' },
  badge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:  { fontSize: 12, fontWeight: '800' },
  factsGrid:  { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#D0EEEE' },
  factItem:   { flex: 1, alignItems: 'center' },
  factVal:    { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  factKey:    { fontSize: 11, color: '#7A9E9E', marginTop: 2 },
  section:    { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  secLabel:   { fontSize: 10, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginBottom: 8 },
  descText:   { fontSize: 14, color: '#1A2E2E', lineHeight: 22 },
  amenRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenChip:   { backgroundColor: '#E8F5F5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#B0DEDE' },
  amenText:   { fontSize: 12, fontWeight: '600', color: '#1A7A7A' },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' },
  infoKey:    { fontSize: 13, color: '#7A9E9E' },
  infoVal:    { fontSize: 13, fontWeight: '700', color: '#1A2E2E' },
  ownerCard:  { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#D0EEEE', flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#B0DEDE' },
  ownerName:  { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  ownerUnit:  { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  callBtn:    { backgroundColor: '#1A7A7A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  callText:   { color: '#FFF', fontWeight: '800', fontSize: 13 },
  actionGroup:{ gap: 10, marginBottom: 8 },
  actionBtn:  { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  actionBtnText:{ fontSize: 14, fontWeight: '800', color: '#FFF' },
});

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ item, isOwn, onPress }) {
  const meta = STATUS_META[item.status] || STATUS_META.ACTIVE;
  return (
    <TouchableOpacity style={lc.card} activeOpacity={0.85} onPress={onPress}>
      {/* Type tag */}
      <View style={[lc.typeTag, { backgroundColor: item.type === 'SALE' ? '#E8F5F5' : '#EDE9FE' }]}>
        <Text style={[lc.typeTagText, { color: item.type === 'SALE' ? '#0D6E6E' : '#6D28D9' }]}>
          {item.type === 'SALE' ? '🏷 For Sale' : '🔑 For Rent'}
        </Text>
      </View>

      <View style={lc.row}>
        <View style={{ flex: 1 }}>
          <Text style={lc.title} numberOfLines={1}>{item.title}</Text>
          <Text style={lc.sub}>Unit {item.unit} · {item.area} sqft · {item.furnished}</Text>
        </View>
        <View style={[lc.badge, { backgroundColor: meta.bg }]}>
          <Text style={[lc.badgeText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
        </View>
      </View>

      <Text style={lc.price}>{item.priceLabel}</Text>

      <Text style={lc.desc} numberOfLines={2}>{item.description}</Text>

      <View style={lc.detailRow}>
        <Text style={lc.detailChip}>🛏 {item.bedrooms}BHK</Text>
        <Text style={lc.detailChip}>🚿 {item.bathrooms} Bath</Text>
        <Text style={lc.detailChip}>📅 {item.availability}</Text>
      </View>

      <View style={lc.footer}>
        <Text style={lc.ownerText}>👤 {item.ownerName}</Text>
        <Text style={lc.viewsText}>👁 {item.views} views</Text>
      </View>

      {/* Pending banner */}
      {item.status === 'PENDING_APPROVAL' && (
        <View style={lc.pendingBanner}>
          <Text style={lc.pendingText}>⏳ Awaiting admin approval before going live</Text>
        </View>
      )}

      {/* Tap hint */}
      <Text style={lc.tapHint}>Tap to view details →</Text>
    </TouchableOpacity>
  );
}

const lc = StyleSheet.create({
  card:        { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE', shadowColor: '#1A7A7A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  typeTag:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  typeTagText: { fontSize: 11, fontWeight: '800' },
  row:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  title:       { fontSize: 15, fontWeight: '800', color: '#1A2E2E', flex: 1 },
  sub:         { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  badge:       { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginLeft: 8, alignSelf: 'flex-start' },
  badgeText:   { fontSize: 11, fontWeight: '800' },
  price:       { fontSize: 20, fontWeight: '900', color: '#0D6E6E', marginBottom: 6 },
  desc:        { fontSize: 13, color: '#5A8E8E', lineHeight: 19, marginBottom: 10 },
  detailRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  detailChip:  { backgroundColor: '#F0FAFA', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, color: '#1A7A7A', fontWeight: '600', borderWidth: 1, borderColor: '#D0EEEE' },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ownerText:   { fontSize: 12, color: '#7A9E9E' },
  viewsText:   { fontSize: 12, color: '#7A9E9E' },
  pendingBanner:{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 6, borderWidth: 1, borderColor: '#FDE68A' },
  pendingText: { fontSize: 12, color: '#B45309', fontWeight: '600' },
  tapHint:     { fontSize: 11, color: '#B0DEDE', fontWeight: '600', textAlign: 'right', marginTop: 4 },
});

// ─── New Listing Form ─────────────────────────────────────────────────────────
function NewListingModal({ visible, onClose, onSubmit, myUnit }) {
  const [form, setForm] = useState({
    type: 'SALE', unit: myUnit || '', title: '', description: '',
    price: '', area: '', bedrooms: '2', bathrooms: '2',
    furnished: 'Semi-furnished', availability: 'Immediate',
    amenities: [],
  });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleAmenity = (a) => setForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a)
      ? prev.amenities.filter(x => x !== a)
      : [...prev.amenities, a],
  }));

  const handleSubmit = () => {
    if (!form.unit.trim())  { Alert.alert('Required', 'Enter unit number'); return; }
    if (!form.title.trim()) { Alert.alert('Required', 'Enter listing title'); return; }
    if (!form.price.trim()) { Alert.alert('Required', 'Enter price'); return; }
    onSubmit(form);
    setForm({ type: 'SALE', unit: myUnit || '', title: '', description: '', price: '', area: '', bedrooms: '2', bathrooms: '2', furnished: 'Semi-furnished', availability: 'Immediate', amenities: [] });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <ScrollView>
          <View style={nf.sheet}>
            {/* Header */}
            <View style={nf.header}>
              <Text style={nf.title}>New Listing</Text>
              <TouchableOpacity onPress={onClose}><Text style={nf.close}>✕</Text></TouchableOpacity>
            </View>

            <View style={nf.body}>
              {/* Info banner */}
              <View style={nf.infoBanner}>
                <Text style={nf.infoText}>ℹ️ First-time listings require admin approval. Future listings go live instantly.</Text>
              </View>

              {/* Type */}
              <Text style={nf.label}>Listing Type</Text>
              <View style={nf.chipRow}>
                {[{ k: 'SALE', l: '🏷 For Sale' }, { k: 'RENT', l: '🔑 For Rent' }].map(({ k, l }) => (
                  <TouchableOpacity key={k} style={[nf.chip, form.type === k && nf.chipActive]} onPress={() => f('type', k)}>
                    <Text style={[nf.chipText, form.type === k && nf.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Unit */}
              <Text style={nf.label}>Unit Number *</Text>
              <TextInput style={nf.input} placeholder="e.g. A-203" placeholderTextColor="#7A9E9E" value={form.unit} onChangeText={v => f('unit', v)} />

              {/* Title */}
              <Text style={nf.label}>Listing Title *</Text>
              <TextInput style={nf.input} placeholder="e.g. 2BHK for Sale in Tower A" placeholderTextColor="#7A9E9E" value={form.title} onChangeText={v => f('title', v)} />

              {/* Price */}
              <Text style={nf.label}>{form.type === 'SALE' ? 'Price (₹) *' : 'Monthly Rent (₹) *'}</Text>
              <TextInput style={nf.input} placeholder={form.type === 'SALE' ? '7500000' : '18000'} placeholderTextColor="#7A9E9E" value={form.price} onChangeText={v => f('price', v)} keyboardType="numeric" />

              {/* Area */}
              <Text style={nf.label}>Area (sqft)</Text>
              <TextInput style={nf.input} placeholder="1100" placeholderTextColor="#7A9E9E" value={form.area} onChangeText={v => f('area', v)} keyboardType="numeric" />

              {/* BHK */}
              <Text style={nf.label}>Bedrooms</Text>
              <View style={nf.chipRow}>
                {['1', '2', '3', '4'].map(n => (
                  <TouchableOpacity key={n} style={[nf.chip, form.bedrooms === n && nf.chipActive]} onPress={() => f('bedrooms', n)}>
                    <Text style={[nf.chipText, form.bedrooms === n && nf.chipTextActive]}>{n} BHK</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bathrooms */}
              <Text style={nf.label}>Bathrooms</Text>
              <View style={nf.chipRow}>
                {['1', '2', '3'].map(n => (
                  <TouchableOpacity key={n} style={[nf.chip, form.bathrooms === n && nf.chipActive]} onPress={() => f('bathrooms', n)}>
                    <Text style={[nf.chipText, form.bathrooms === n && nf.chipTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Furnished */}
              <Text style={nf.label}>Furnished Status</Text>
              <View style={nf.chipRow}>
                {FURNISHED_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt} style={[nf.chip, form.furnished === opt && nf.chipActive]} onPress={() => f('furnished', opt)}>
                    <Text style={[nf.chipText, form.furnished === opt && nf.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Availability */}
              <Text style={nf.label}>Availability</Text>
              <View style={nf.chipRow}>
                {AVAILABILITY_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt} style={[nf.chip, form.availability === opt && nf.chipActive]} onPress={() => f('availability', opt)}>
                    <Text style={[nf.chipText, form.availability === opt && nf.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amenities */}
              <Text style={nf.label}>Amenities Available</Text>
              <View style={nf.chipRow}>
                {AMENITY_OPTIONS.map(a => (
                  <TouchableOpacity key={a} style={[nf.chip, form.amenities.includes(a) && nf.chipActive]} onPress={() => toggleAmenity(a)}>
                    <Text style={[nf.chipText, form.amenities.includes(a) && nf.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={nf.label}>Description</Text>
              <TextInput style={[nf.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Describe the property, key highlights, nearby landmarks…" placeholderTextColor="#7A9E9E" value={form.description} onChangeText={v => f('description', v)} multiline />

              {/* Submit */}
              <TouchableOpacity style={nf.submitBtn} onPress={handleSubmit}>
                <Text style={nf.submitText}>🏠 Submit Listing</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const nf = StyleSheet.create({
  sheet:       { backgroundColor: '#E8F5F5', minHeight: '100%' },
  header:      { backgroundColor: '#1A7A7A', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 20, fontWeight: '800', color: '#FFF' },
  close:       { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  body:        { padding: 16 },
  infoBanner:  { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText:    { fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  label:       { fontSize: 12, fontWeight: '700', color: '#3D6E6E', marginBottom: 8, marginTop: 12 },
  input:       { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E', marginBottom: 4 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE' },
  chipActive:  { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText:    { fontSize: 13, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive:{ color: '#FFF' },
  submitBtn:   { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitText:  { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RealEstateScreen({ navigation }) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);
  const { demoResident } = useDemoStore();

  const activeUser = demoResident || user;
  const myId    = activeUser?.id    || 'res1';
  const myName  = activeUser?.name  || 'Resident';
  const myPhone = activeUser?.phone || '';
  const myUnit  = activeUser?.unit  || 'A-101';
  const isDemo  = !!demoResident;

  const realEstateListings       = useAppStore(s => s.realEstateListings);
  const createRealEstateListing  = useAppStore(s => s.createRealEstateListing);
  const incrementRealEstateViews = useAppStore(s => s.incrementRealEstateViews);
  const updateRealEstateListing  = useAppStore(s => s.updateRealEstateListing);

  const [tab, setTab]             = useState('browse');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showShare, setShowShare]   = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const activeListings = realEstateListings.filter(l => l.status === 'ACTIVE');
  const filtered = typeFilter === 'ALL'
    ? activeListings
    : activeListings.filter(l => l.type === typeFilter);
  const mine = realEstateListings.filter(l => l.ownerId === myId);

  const openDetail = (item) => {
    incrementRealEstateViews?.(item.id);
    setSelected(item);
    setShowDetail(true);
  };

  const handleCreate = (form) => {
    const price = parseInt(form.price.replace(/[^0-9]/g, ''));
    const priceLabel = form.type === 'SALE'
      ? `₹${(price / 100000).toFixed(0)} Lakhs`
      : `₹${price.toLocaleString('en-IN')}/month`;

    const newListing = createRealEstateListing({
      type: form.type,
      ownerId: myId, ownerName: myName, ownerPhone: myPhone,
      unit: form.unit, title: form.title, description: form.description,
      price, priceLabel,
      area: parseInt(form.area) || 0, areaUnit: 'sqft',
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      furnished: form.furnished,
      availability: form.availability,
      amenities: form.amenities || [],
      images: [],
    });

    setShowForm(false);
    setTab('mine');

    if (newListing?.isFirstListing) {
      Alert.alert('🔍 Under Review',
        `Your first listing "${newListing.title}" has been submitted for admin approval.\n\nOnce approved it will be visible to all residents.\n\nFuture listings will go live instantly.`);
    } else {
      Alert.alert('✅ Listed!', `"${newListing?.title}" is now live and visible to all residents.`);
    }
  };

  const handleMarkSold = (id) => {
    updateRealEstateListing?.(id, { status: 'SOLD' });
    Alert.alert('🏷 Marked as Sold', 'Your listing has been closed.');
  };

  const handleMarkRented = (id) => {
    updateRealEstateListing?.(id, { status: 'RENTED' });
    Alert.alert('🔑 Marked as Rented', 'Your listing has been closed.');
  };

  const handleWithdraw = (id) => {
    updateRealEstateListing?.(id, { status: 'WITHDRAWN' });
    Alert.alert('✅ Withdrawn', 'Your listing has been removed.');
  };

  const TABS = [
    { k: 'browse', l: `🔍 Browse (${activeListings.length})` },
    { k: 'mine',   l: `📋 My Listings (${mine.length})` },
  ];

  return (
    <SafeAreaView style={sc.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* ── Header ── */}
      <View style={sc.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={sc.backBtn}>
          <Text style={sc.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={sc.headerTitle}>🏠 Real Estate</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Buy · Sell · Rent in your society</Text>
          </View>
          <TouchableOpacity style={sc.addBtn} onPress={() => setShowForm(true)}>
            <Text style={sc.addBtnText}>+ List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo banner */}
      {isDemo && (
        <View style={sc.demoBanner}>
          <Text style={sc.demoText}>🎭 Demo Mode — Acting as {myName} ({myUnit})</Text>
        </View>
      )}

      {/* ── Tabs ── */}
      <View style={sc.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.k}
            style={[sc.tabItem, tab === t.k && sc.tabItemActive]}
            onPress={() => setTab(t.k)}
          >
            <Text style={[sc.tabText, tab === t.k && sc.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Type Filter (Browse tab) ── */}
      {tab === 'browse' && (
        <View style={sc.filterRow}>
          {[
            { k: 'ALL',  l: 'All' },
            { k: 'SALE', l: '🏷 Sale' },
            { k: 'RENT', l: '🔑 Rent' },
          ].map(({ k, l }) => (
            <TouchableOpacity
              key={k}
              style={[sc.filterChip, typeFilter === k && sc.filterChipActive]}
              onPress={() => setTypeFilter(k)}
            >
              <Text style={[sc.filterText, typeFilter === k && sc.filterTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={tab === 'browse' ? filtered : mine}
        keyExtractor={i => i.id}
        contentContainerStyle={sc.listPad}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            isOwn={item.ownerId === myId}
            onPress={() => openDetail(item)}
          />
        )}
        ListEmptyComponent={
          <View style={sc.empty}>
            <Text style={{ fontSize: 56 }}>🏠</Text>
            <Text style={sc.emptyTitle}>
              {tab === 'browse' ? 'No active listings' : 'No listings yet'}
            </Text>
            <Text style={sc.emptySub}>
              {tab === 'browse'
                ? 'Check back soon or be the first to list!'
                : 'Tap "+ List" to post your first listing.'}
            </Text>
            {tab === 'mine' && (
              <TouchableOpacity style={sc.emptyBtn} onPress={() => setShowForm(true)}>
                <Text style={sc.emptyBtnText}>+ Create Listing</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* ── Modals ── */}
      <NewListingModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        myUnit={myUnit}
      />

      <DetailSheet
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        listing={selected}
        isOwn={selected?.ownerId === myId}
        onInquire={() => { setShowDetail(false); setShowInquiry(true); }}
        onShare={() => { setShowDetail(false); setShowShare(true); }}
        onMarkSold={handleMarkSold}
        onMarkRented={handleMarkRented}
        onWithdraw={handleWithdraw}
      />

      <InquiryModal
        visible={showInquiry}
        onClose={() => setShowInquiry(false)}
        listing={selected}
        myName={myName}
        myPhone={myPhone}
        myUnit={myUnit}
      />

      <ShareSheet
        visible={showShare}
        onClose={() => setShowShare(false)}
        listing={selected}
      />
    </SafeAreaView>
  );
}

// ─── Screen-level Styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#E8F5F5' },

  // Header — matches visitor/maintenance screens
  header:          { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:         { marginBottom: 8 },
  backText:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:     { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  addBtn:          { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  addBtnText:      { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Demo banner
  demoBanner:      { backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#FDE68A' },
  demoText:        { fontSize: 12, fontWeight: '700', color: '#B45309' },

  // Tabs
  tabBar:          { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  tabItem:         { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabItemActive:   { borderBottomWidth: 3, borderBottomColor: '#1A7A7A' },
  tabText:         { fontSize: 13, fontWeight: '600', color: '#7A9E9E' },
  tabTextActive:   { color: '#1A7A7A', fontWeight: '800' },

  // Filter chips
  filterRow:       { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', gap: 8, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  filterChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#B0DEDE' },
  filterChipActive:{ backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  filterText:      { fontSize: 13, fontWeight: '600', color: '#3D6E6E' },
  filterTextActive:{ color: '#FFF' },

  // List
  listPad:         { padding: 14, paddingBottom: 40 },

  // Empty state
  empty:           { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyTitle:      { fontSize: 17, fontWeight: '800', color: '#1A2E2E' },
  emptySub:        { fontSize: 14, color: '#7A9E9E', textAlign: 'center', lineHeight: 20 },
  emptyBtn:        { marginTop: 8, backgroundColor: '#1A7A7A', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText:    { color: '#FFF', fontWeight: '800', fontSize: 14 },
});