/**
 * NoticeBoardScreen.js — Module 12: Communication & Notifications
 *
 * Covers:
 *  - Notice Board (society-wide announcements, pinned notices, read receipts)
 *  - Event Management (festivals, meetings, RSVP, calendar)
 *  - Announcement types: notice | event | payment_reminder | emergency
 *
 * Reads from appStore.announcements
 */
 
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Modal,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useAppStore      from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';
 
const TYPE_CONFIG = {
  notice:           { emoji: '📋', label: 'Notice',           color: '#0277BD' },
  event:            { emoji: '🎉', label: 'Event',            color: '#1A7A7A' },
  payment_reminder: { emoji: '💰', label: 'Payment Reminder', color: '#E8A020' },
  emergency:        { emoji: '🚨', label: 'Emergency',        color: '#C62828' },
};
 
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
 
function timeUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
 
// ─── Single Announcement Card ────────────────────────────────────────────────
function AnnouncementCard({ ann, theme, onPress }) {
  const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.notice;
  const isExpired = new Date(ann.expiresAt) < new Date();
  const isEvent   = ann.type === 'event';
 
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: '#FFFFFF', borderColor: ann.pinned ? cfg.color : '#D0EEEE' },
        ann.pinned && { borderWidth: 2 },
        isExpired && { opacity: 0.6 },
      ]}
      onPress={() => onPress(ann)}
      activeOpacity={0.85}
    >
      {/* Pin badge */}
      {ann.pinned && (
        <View style={[styles.pinBadge, { backgroundColor: cfg.color }]}>
          <Text style={styles.pinText}>📌 PINNED</Text>
        </View>
      )}
 
      <View style={styles.cardHeader}>
        <View style={[styles.typeTag, { backgroundColor: cfg.color + '20' }]}>
          <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.timeAgo, { color: '#7A9E9E' }]}>{timeAgo(ann.postedAt)}</Text>
      </View>
 
      <Text style={[styles.title, { color: '#1A2E2E' }]}>{ann.title}</Text>
      <Text style={[styles.body, { color: '#3D6E6E' }]} numberOfLines={2}>{ann.body}</Text>
 
      {isEvent && ann.eventDate && (
        <View style={[styles.eventRow, { borderTopColor: '#D0EEEE' }]}>
          <Text style={[styles.eventDate, { color: '#1A7A7A' }]}>
            📅 {new Date(ann.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
          {ann.eventVenue && (
            <Text style={[styles.eventVenue, { color: '#7A9E9E' }]}>📍 {ann.eventVenue}</Text>
          )}
          {ann.rsvpEnabled && (
            <View style={[styles.rsvpBadge, { backgroundColor: '#1A7A7A' + '20' }]}>
              <Text style={[styles.rsvpText, { color: '#1A7A7A' }]}>
                RSVP • {ann.rsvpCount || 0} going
              </Text>
            </View>
          )}
        </View>
      )}
 
      <View style={styles.cardFooter}>
        <Text style={[styles.postedBy, { color: '#7A9E9E' }]}>By {ann.postedByName}</Text>
        {ann.expiresAt && (
          <Text style={[styles.expires, { color: isExpired ? '#C62828' : '#7A9E9E' }]}>
            {isExpired ? '⛔ Expired' : `⏳ ${timeUntil(ann.expiresAt)}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
 
// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ ann, visible, onClose, theme, onRSVP, userId }) {
  if (!ann) return null;
  const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.notice;
  const hasRSVPd = ann.rsvpList?.includes(userId);
 
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalEmoji}>{cfg.emoji}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: '#7A9E9E' }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalTitle, { color: '#1A2E2E' }]}>{ann.title}</Text>
          <Text style={[styles.modalMeta, { color: '#7A9E9E' }]}>
            By {ann.postedByName} · {timeAgo(ann.postedAt)}
          </Text>
          <Text style={[styles.modalBody, { color: '#3D6E6E' }]}>{ann.body}</Text>
 
          {ann.type === 'event' && ann.eventDate && (
            <View style={[styles.eventDetail, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}>
              <Text style={[styles.eventDetailRow, { color: '#1A2E2E' }]}>
                📅 {new Date(ann.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              {ann.eventTime && <Text style={[styles.eventDetailRow, { color: '#1A2E2E' }]}>⏰ {ann.eventTime}</Text>}
              {ann.eventVenue && <Text style={[styles.eventDetailRow, { color: '#1A2E2E' }]}>📍 {ann.eventVenue}</Text>}
              {ann.rsvpEnabled && (
                <Text style={[styles.eventDetailRow, { color: '#1A7A7A' }]}>
                  👥 {ann.rsvpCount || 0} residents going
                </Text>
              )}
            </View>
          )}
 
          {ann.rsvpEnabled && (
            <TouchableOpacity
              style={[styles.rsvpBtn, { backgroundColor: hasRSVPd ? '#2E7D32' : '#1A7A7A' }]}
              onPress={() => { onRSVP(ann.id); onClose(); }}
            >
              <Text style={styles.rsvpBtnText}>
                {hasRSVPd ? '✓ You\'re Going' : '🎉 RSVP — I\'m Going!'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.closeModalBtn, { borderColor: '#D0EEEE' }]} onPress={onClose}>
            <Text style={[styles.closeModalBtnText, { color: '#7A9E9E' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
 
// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NoticeBoardScreen({ navigation }) {
  const theme = useTheme();
  const user          = useAuthStore(s => s.user);
  const announcements = useAppStore(s => s.announcements);
  const addAnnouncement = useAppStore(s => s.addAnnouncement);
 
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [rsvpList,     setRsvpList]     = useState({});
 
  const userId = user?.id || 'res1';
 
  // Filter
  const now = new Date();
  let filtered = announcements.filter(a => {
    if (filter === 'pinned') return a.pinned;
    if (filter === 'event')  return a.type === 'event';
    if (filter === 'notice') return a.type === 'notice' || a.type === 'payment_reminder';
    if (filter === 'emergency') return a.type === 'emergency';
    return true;
  });
  // Sort: pinned first, then newest
  filtered = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });
 
  const handleRSVP = (annId) => {
    setRsvpList(prev => ({ ...prev, [annId]: !prev[annId] }));
    Alert.alert('🎉 RSVP Confirmed!', 'You\'ve been added to the guest list. See you there!');
  };
 
  const FILTERS = [
    { key: 'all',       label: `All (${announcements.length})` },
    { key: 'pinned',    label: `📌 Pinned` },
    { key: 'event',     label: `🎉 Events` },
    { key: 'notice',    label: `📋 Notices` },
    { key: 'emergency', label: `🚨 Alerts` },
  ];
 
  // Upcoming events section
  const upcomingEvents = announcements
    .filter(a => a.type === 'event' && a.eventDate && new Date(a.eventDate) > now)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 3);
 
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice Board</Text>
        <Text style={styles.headerSub}>Society announcements & events</Text>
      </View>
 
      {/* Filter Tabs */}
      <View style={[styles.filterWrap, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f.key ? theme.primary : theme.inputBg, borderColor: filter === f.key ? theme.primary : theme.inputBorder },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? '#FFF' : theme.textMuted }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
 
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Upcoming Events Banner */}
        {filter === 'all' && upcomingEvents.length > 0 && (
          <View style={[styles.eventBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
            <Text style={[styles.eventBannerTitle, { color: theme.primary }]}>🎉 Upcoming Events</Text>
            {upcomingEvents.map(e => (
              <TouchableOpacity key={e.id} style={styles.eventBannerRow} onPress={() => { setSelected(e); setShowModal(true); }}>
                <Text style={[styles.eventBannerName, { color: theme.text }]}>{e.title}</Text>
                <Text style={[styles.eventBannerDate, { color: theme.textMuted }]}>
                  {new Date(e.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {timeUntil(e.eventDate)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
 
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No {filter} posts yet.</Text>
          </View>
        ) : (
          filtered.map(ann => (
            <AnnouncementCard
              key={ann.id}
              ann={{ ...ann, rsvpList: rsvpList[ann.id] ? [userId] : [] }}
              theme={theme}
              onPress={a => { setSelected(a); setShowModal(true); }}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
 
      <DetailModal
        ann={selected}
        visible={showModal}
        onClose={() => { setShowModal(false); setSelected(null); }}
        theme={theme}
        onRSVP={handleRSVP}
        userId={userId}
      />
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe:           { flex: 1 },
  header:         { padding: 20, paddingTop: 40 },
  backBtn:        { marginBottom: 6 },
  backText:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  filterWrap:     { borderBottomWidth: 1 },
  filterChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterText:     { fontSize: 13, fontWeight: '600' },
  // Event banner
  eventBanner:    { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  eventBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  eventBannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  eventBannerName: { fontSize: 14, fontWeight: '600' },
  eventBannerDate: { fontSize: 12 },
  // Card
  card:           { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  pinBadge:       { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10 },
  pinText:        { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeTag:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  typeEmoji:      { fontSize: 12 },
  typeLabel:      { fontSize: 11, fontWeight: '700' },
  timeAgo:        { fontSize: 11 },
  title:          { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body:           { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  eventRow:       { borderTopWidth: 1, paddingTop: 10, gap: 4 },
  eventDate:      { fontSize: 13, fontWeight: '600' },
  eventVenue:     { fontSize: 12 },
  rsvpBadge:      { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  rsvpText:       { fontSize: 11, fontWeight: '700' },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  postedBy:       { fontSize: 11 },
  expires:        { fontSize: 11 },
  // Modal
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalEmoji:     { fontSize: 32 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText:   { fontSize: 18, fontWeight: '600' },
  modalTitle:     { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  modalMeta:      { fontSize: 12, marginBottom: 16 },
  modalBody:      { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  eventDetail:    { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 16, gap: 6 },
  eventDetailRow: { fontSize: 14 },
  rsvpBtn:        { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  rsvpBtnText:    { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  closeModalBtn:  { paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  closeModalBtnText: { fontSize: 14, fontWeight: '600' },
  // Empty
  empty:          { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyText:      { fontSize: 15 },
});
 
 