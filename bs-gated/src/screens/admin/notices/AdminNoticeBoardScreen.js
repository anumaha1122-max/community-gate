/**
 * AdminNoticeBoardScreen.js — Module 12: Admin side of Notice Board
 *
 * Admin can:
 *  - View all announcements
 *  - Post new notice / event / emergency / payment reminder
 *  - Pin/unpin notices
 *  - Delete expired notices
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Modal, Switch,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useAppStore      from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const TYPES = [
  { key: 'notice',           label: '📋 Notice',           color: '#0277BD' },
  { key: 'event',            label: '🎉 Event',            color: '#1A7A7A' },
  { key: 'payment_reminder', label: '💰 Payment Reminder', color: '#E8A020' },
  { key: 'emergency',        label: '🚨 Emergency',        color: '#C62828' },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminNoticeBoardScreen({ navigation }) {
  const theme = useTheme();
  const user  = useAuthStore(s => s.user);
  const announcements    = useAppStore(s => s.announcements);
  const addAnnouncement  = useAppStore(s => s.addAnnouncement);
  const deleteAnnouncement = useAppStore(s => s.deleteAnnouncement);

  const [showCompose, setShowCompose] = useState(false);

  // Compose state
  const [title,        setTitle]        = useState('');
  const [body,         setBody]         = useState('');
  const [type,         setType]         = useState('notice');
  const [pinned,       setPinned]       = useState(false);
  const [targetRole,   setTargetRole]   = useState('all');
  const [expiryDays,   setExpiryDays]   = useState('7');
  const [isEvent,      setIsEvent]      = useState(false);
  const [eventDate,    setEventDate]    = useState('');
  const [eventTime,    setEventTime]    = useState('');
  const [eventVenue,   setEventVenue]   = useState('');
  const [rsvpEnabled,  setRsvpEnabled]  = useState(false);

  const resetForm = () => {
    setTitle(''); setBody(''); setType('notice'); setPinned(false);
    setTargetRole('all'); setExpiryDays('7'); setIsEvent(false);
    setEventDate(''); setEventTime(''); setEventVenue(''); setRsvpEnabled(false);
  };

  const handlePost = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing', 'Please fill title and message.');
      return;
    }
    const data = {
      title:        title.trim(),
      body:         body.trim(),
      type,
      targetRole,
      pinned,
      expiresAt:    new Date(Date.now() + parseInt(expiryDays || 7) * 86400000).toISOString(),
      ...(isEvent ? { eventDate, eventTime, eventVenue, rsvpEnabled, rsvpCount: 0 } : {}),
    };
    addAnnouncement(data, user?.id, user?.name || 'Admin');
    resetForm();
    setShowCompose(false);
    Alert.alert('✅ Posted!', 'Your announcement has been published to all residents.');
  };

  const handleDelete = (id, title) => {
    Alert.alert('Delete?', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAnnouncement(id) },
    ]);
  };

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Notice Board</Text>
            <Text style={styles.headerSub}>{announcements.length} total announcements</Text>
          </View>
          <TouchableOpacity
            style={[styles.composeBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => setShowCompose(true)}
          >
            <Text style={styles.composeBtnText}>+ Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {sorted.map(ann => {
          const cfg = TYPES.find(t => t.key === ann.type) || TYPES[0];
          const isExpired = new Date(ann.expiresAt) < new Date();
          return (
            <View
              key={ann.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: ann.pinned ? cfg.color : theme.cardBorder, borderWidth: ann.pinned ? 2 : 1, opacity: isExpired ? 0.6 : 1 }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.typeTag, { backgroundColor: cfg.color + '20' }]}>
                  <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <View style={styles.cardActions}>
                  {ann.pinned && <Text style={styles.pinnedIcon}>📌</Text>}
                  <TouchableOpacity onPress={() => handleDelete(ann.id, ann.title)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{ann.title}</Text>
              <Text style={[styles.cardBody, { color: theme.textSecondary }]} numberOfLines={2}>{ann.body}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {timeAgo(ann.postedAt)} · {ann.targetRole === 'all' ? 'Everyone' : ann.targetRole}
                </Text>
                <Text style={[styles.meta, { color: isExpired ? theme.danger : theme.textMuted }]}>
                  {isExpired ? '⛔ Expired' : `Expires ${new Date(ann.expiresAt).toLocaleDateString('en-IN')}`}
                </Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Compose Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showCompose} transparent animationType="slide" onRequestClose={() => setShowCompose(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>📝 New Announcement</Text>
              <TouchableOpacity onPress={() => setShowCompose(false)}>
                <Text style={[styles.closeX, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type selector */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Type</Text>
              <View style={styles.typeRow}>
                {TYPES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeChip, { backgroundColor: type === t.key ? t.color : theme.inputBg, borderColor: t.color }]}
                    onPress={() => { setType(t.key); setIsEvent(t.key === 'event'); }}
                  >
                    <Text style={[styles.typeChipText, { color: type === t.key ? '#FFF' : t.color }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                value={title} onChangeText={setTitle} placeholder="Announcement title"
                placeholderTextColor={theme.placeholder}
              />

              {/* Body */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                value={body} onChangeText={setBody} placeholder="Write your message..."
                placeholderTextColor={theme.placeholder} multiline numberOfLines={4}
              />

              {/* Target audience */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Target Audience</Text>
              <View style={styles.typeRow}>
                {['all', 'resident', 'vendor', 'security'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.audienceChip, { backgroundColor: targetRole === r ? theme.primary : theme.inputBg, borderColor: theme.inputBorder }]}
                    onPress={() => setTargetRole(r)}
                  >
                    <Text style={[styles.audienceText, { color: targetRole === r ? '#FFF' : theme.textMuted }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Expiry */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Expires in (days)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                value={expiryDays} onChangeText={setExpiryDays} placeholder="7"
                placeholderTextColor={theme.placeholder} keyboardType="numeric"
              />

              {/* Pin toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>📌 Pin this notice</Text>
                <Switch
                  value={pinned} onValueChange={setPinned}
                  trackColor={{ true: theme.primary }} thumbColor={pinned ? theme.primary : '#ccc'}
                />
              </View>

              {/* Event-specific fields */}
              {isEvent && (
                <>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Event Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                    value={eventDate} onChangeText={setEventDate} placeholder="2026-05-15"
                    placeholderTextColor={theme.placeholder}
                  />
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Event Time</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                    value={eventTime} onChangeText={setEventTime} placeholder="6:00 PM"
                    placeholderTextColor={theme.placeholder}
                  />
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Venue</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
                    value={eventVenue} onChangeText={setEventVenue} placeholder="Clubhouse / Community Hall"
                    placeholderTextColor={theme.placeholder}
                  />
                  <View style={styles.toggleRow}>
                    <Text style={[styles.toggleLabel, { color: theme.text }]}>🎟️ Enable RSVP</Text>
                    <Switch
                      value={rsvpEnabled} onValueChange={setRsvpEnabled}
                      trackColor={{ true: theme.primary }} thumbColor={rsvpEnabled ? theme.primary : '#ccc'}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity style={[styles.postBtn, { backgroundColor: theme.primary }]} onPress={handlePost}>
                <Text style={styles.postBtnText}>🚀 Post Announcement</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1 },
  header:         { padding: 20, paddingTop: 40 },
  backBtn:        { marginBottom: 8 },
  backText:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:    { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  composeBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  composeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  card:           { borderRadius: 16, padding: 14, marginBottom: 12 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeTag:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText:       { fontSize: 12, fontWeight: '700' },
  cardActions:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pinnedIcon:     { fontSize: 14 },
  deleteBtn:      { padding: 4 },
  deleteBtnText:  { fontSize: 16 },
  cardTitle:      { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardBody:       { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between' },
  meta:           { fontSize: 11 },
  // Modal
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:     { fontSize: 18, fontWeight: '800' },
  closeX:         { fontSize: 20, fontWeight: '600' },
  formLabel:      { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input:          { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 4 },
  textArea:       { minHeight: 80, textAlignVertical: 'top' },
  typeRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  typeChipText:   { fontSize: 12, fontWeight: '700' },
  audienceChip:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  audienceText:   { fontSize: 12, fontWeight: '600' },
  toggleRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  toggleLabel:    { fontSize: 15, fontWeight: '600' },
  postBtn:        { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  postBtnText:    { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
