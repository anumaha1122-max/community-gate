/**
 * NotificationScreen.js — Resident Notifications
 *
 * Full real-world workflow:
 *  - Tap any notification → opens detail modal with full message
 *  - Reply field for messages that support replies (maintenance, announcements)
 *  - Quick reply chips for common responses
 *  - Reply thread view (bubble chat style)
 *  - Delivery confirm / reject action buttons
 *  - Walk-in allow / deny with confirmation
 *  - Navigate shortcuts (billing, SOS, maintenance, orders)
 *  - Mark read on open, mark-all-read from header
 *
 * Theme: teal #1A7A7A — matches Visitor screens exactly
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import useResidentStore     from '../../../store/residentStore';
import useAppStore          from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';

// ─── Teal theme (matches Visitor screens) ─────────────────────────────────────
const T = {
  primary:     '#1A7A7A',
  primaryDark: '#146060',
  primaryBg:   '#E8F5F5',
  primaryMid:  '#D0EEEE',
  text:        '#1A2E2E',
  textSub:     '#3D6E6E',
  textMuted:   '#7A9E9E',
  bg:          '#E8F5F5',
  card:        '#FFFFFF',
  border:      '#D0EEEE',
  danger:      '#C62828',
  dangerBg:    '#FEE2E2',
  warning:     '#E8A020',
  warningBg:   '#FEF3C7',
  success:     '#2E7D32',
  successBg:   '#DCFCE7',
  info:        '#0277BD',
};

const TYPE_CONFIG = {
  visitor:      { emoji: '👤', label: 'Visitor',      color: T.primary,  bg: T.primaryBg,  canReply: false },
  walkin:       { emoji: '🚶', label: 'Walk-in',      color: T.primary,  bg: T.primaryBg,  canReply: false },
  maintenance:  { emoji: '🔧', label: 'Maintenance',  color: T.primary,  bg: T.primaryBg,  canReply: true  },
  billing:      { emoji: '💰', label: 'Billing',      color: T.warning,  bg: T.warningBg,  canReply: false },
  announcement: { emoji: '📢', label: 'Announcement', color: T.info,     bg: '#E8F4FF',    canReply: true  },
  order:        { emoji: '📦', label: 'Order',        color: T.success,  bg: T.successBg,  canReply: false },
  sos:          { emoji: '🚨', label: 'Emergency',    color: T.danger,   bg: T.dangerBg,   canReply: false },
  amenity:      { emoji: '🏊', label: 'Amenity',      color: T.primary,  bg: T.primaryBg,  canReply: false },
};

const QUICK_REPLIES = {
  maintenance:  ['Thanks, please proceed', 'Please reschedule', 'Need more details', 'Come ASAP — urgent'],
  announcement: ['Thank you for informing', 'Noted', 'Please share more details', 'When will this be resolved?'],
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

function fullDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Info row inside modal ────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Notification Detail Modal ────────────────────────────────────────────────
function NotifDetailModal({
  notif, visible, onClose,
  onAcceptDelivery, onRejectDelivery,
  onAllowWalkIn, onDenyWalkIn,
  onSendReply, navigation,
}) {
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent]  = useState(false);

  if (!notif) return null;

  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.announcement;
  const isDeliveryPending = notif.actionType === 'delivery_arrived' && notif.orderId && !notif.deliveryResolved;
  const isWalkInPending   = notif.type === 'walkin' && notif.queueId && !notif.walkinStatus;
  const walkinApproved    = notif.type === 'walkin' && notif.walkinStatus === 'APPROVED';
  const walkinDenied      = notif.type === 'walkin' && notif.walkinStatus === 'DENIED';
  const replies           = notif.replies || [];

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(notif.id, replyText.trim());
    setReplyText('');
    setReplySent(true);
    setTimeout(() => setReplySent(false), 3000);
  };

  const handleQuickReply = (text) => {
    onSendReply(notif.id, text);
    setReplySent(true);
    setTimeout(() => setReplySent(false), 3000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>
            <View style={styles.modalHandle} />

            {/* Modal header row */}
            <View style={styles.modalHdr}>
              <View style={[styles.modalTypeTag, { backgroundColor: cfg.bg }]}>
                <Text style={styles.modalTypeEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.modalTypeLabel, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Title + timestamp */}
              <Text style={styles.modalTitle}>{notif.title}</Text>
              <Text style={styles.modalTime}>{fullDate(notif.createdAt)}</Text>

              {/* Full message */}
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{notif.body}</Text>
              </View>

              {/* Visitor / walk-in detail rows */}
              {(notif.visitorName || notif.hostUnit || notif.visitorPhone || notif.purpose) && (
                <View style={styles.infoBox}>
                  {notif.visitorName  && <InfoRow label="Name"    value={notif.visitorName} />}
                  {notif.purpose      && <InfoRow label="Purpose" value={notif.purpose} />}
                  {notif.hostUnit     && <InfoRow label="Unit"    value={notif.hostUnit} />}
                  {notif.visitorPhone && <InfoRow label="Mobile"  value={`📱 ${notif.visitorPhone}`} />}
                </View>
              )}

              {/* ── Walk-in action buttons ── */}
              {isWalkInPending && (
                <View style={styles.actionSection}>
                  <Text style={styles.actionSectionLabel}>Waiting for your decision</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnOutline]}
                      onPress={() => { onDenyWalkIn(notif); onClose(); }}
                    >
                      <Text style={[styles.actionBtnText, { color: T.danger }]}>🚫  Deny Entry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary, { flex: 2 }]}
                      onPress={() => { onAllowWalkIn(notif); onClose(); }}
                    >
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>✓  Allow Entry</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {walkinApproved && (
                <View style={[styles.resolvedBanner, { backgroundColor: T.successBg, borderColor: T.success }]}>
                  <Text style={{ color: T.success, fontWeight: '700', fontSize: 14 }}>✅ You allowed this visitor in</Text>
                </View>
              )}
              {walkinDenied && (
                <View style={[styles.resolvedBanner, { backgroundColor: T.dangerBg, borderColor: T.danger }]}>
                  <Text style={{ color: T.danger, fontWeight: '700', fontSize: 14 }}>🚫 You denied this visitor</Text>
                </View>
              )}

              {/* ── Delivery action buttons ── */}
              {isDeliveryPending && (
                <View style={styles.actionSection}>
                  <Text style={styles.actionSectionLabel}>Confirm your delivery</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnOutline]}
                      onPress={() => { onRejectDelivery(notif); onClose(); }}
                    >
                      <Text style={[styles.actionBtnText, { color: T.danger }]}>✗  Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary, { flex: 2 }]}
                      onPress={() => { onAcceptDelivery(notif); onClose(); }}
                    >
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>✓  Accept Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {notif.deliveryResolved && !notif.deliveryRejected && (
                <View style={[styles.resolvedBanner, { backgroundColor: T.successBg, borderColor: T.success }]}>
                  <Text style={{ color: T.success, fontWeight: '700', fontSize: 14 }}>✅ Delivery accepted</Text>
                </View>
              )}
              {notif.deliveryRejected && (
                <View style={[styles.resolvedBanner, { backgroundColor: T.dangerBg, borderColor: T.danger }]}>
                  <Text style={{ color: T.danger, fontWeight: '700', fontSize: 14 }}>✗ Delivery rejected</Text>
                </View>
              )}

              {/* ── Navigation shortcuts ── */}
              {notif.type === 'billing' && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => { onClose(); navigation.navigate('BillingList'); }}
                >
                  <Text style={styles.navBtnText}>💰  View Invoice →</Text>
                </TouchableOpacity>
              )}
              {notif.type === 'sos' && (
                <TouchableOpacity
                  style={[styles.navBtn, { borderColor: T.danger }]}
                  onPress={() => { onClose(); navigation.navigate('SOSTracking'); }}
                >
                  <Text style={[styles.navBtnText, { color: T.danger }]}>🚨  Track SOS Alert →</Text>
                </TouchableOpacity>
              )}
              {notif.type === 'maintenance' && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => { onClose(); navigation.navigate('ResidentMaintenance'); }}
                >
                  <Text style={styles.navBtnText}>🔧  View Maintenance Request →</Text>
                </TouchableOpacity>
              )}
              {notif.type === 'order' && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => { onClose(); navigation.navigate('OrderTracking'); }}
                >
                  <Text style={styles.navBtnText}>📦  Track Order →</Text>
                </TouchableOpacity>
              )}

              {/* ── Reply thread ── */}
              {replies.length > 0 && (
                <View style={styles.replyThread}>
                  <Text style={styles.replyThreadLabel}>Replies ({replies.length})</Text>
                  {replies.map((r, i) => (
                    <View
                      key={i}
                      style={[
                        styles.replyBubble,
                        r.from === 'me' ? styles.replyBubbleMe : styles.replyBubbleThem,
                      ]}
                    >
                      <Text style={[
                        styles.replyBubbleText,
                        r.from === 'me' ? { color: '#FFF' } : { color: T.text },
                      ]}>
                        {r.text}
                      </Text>
                      <Text style={[
                        styles.replyTime,
                        r.from === 'me'
                          ? { color: 'rgba(255,255,255,0.65)', textAlign: 'right' }
                          : { color: T.textMuted },
                      ]}>
                        {timeAgo(r.at)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Reply sent confirmation */}
              {replySent && (
                <View style={styles.replySentBanner}>
                  <Text style={{ color: T.success, fontWeight: '700', fontSize: 13 }}>✅ Reply sent successfully</Text>
                </View>
              )}

              {/* Quick replies */}
              {cfg.canReply && !replySent && (QUICK_REPLIES[notif.type] || []).length > 0 && (
                <View style={styles.quickReplies}>
                  <Text style={styles.quickRepliesLabel}>Quick Reply</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(QUICK_REPLIES[notif.type] || []).map((qr, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.quickChip}
                        onPress={() => handleQuickReply(qr)}
                      >
                        <Text style={styles.quickChipText}>{qr}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={{ height: 12 }} />
            </ScrollView>

            {/* Reply input bar — only for reply-enabled types */}
            {cfg.canReply && (
              <View style={styles.replyBar}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write a reply..."
                  placeholderTextColor={T.textMuted}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  maxLength={300}
                  returnKeyType="default"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !replyText.trim() && { opacity: 0.4 }]}
                  onPress={handleSend}
                  disabled={!replyText.trim()}
                >
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotificationScreen({ navigation }) {
  const notifications            = useResidentStore(s => s.notifications);
  const markNotificationRead     = useResidentStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useResidentStore(s => s.markAllNotificationsRead);
  const updateNotification       = useResidentStore(s => s.updateNotification);
  const residentConfirmDelivery  = useAppStore(s => s.residentConfirmDelivery);
  const residentRejectDelivery   = useAppStore(s => s.residentRejectDelivery);
  const approveQueueEntry        = useSecurityStore(s => s.approveQueueEntry);
  const denyQueueEntry           = useSecurityStore(s => s.denyQueueEntry);
  const user                     = useAuthStore(s => s.user);

  const residentId = user?.id || 'res1';
  const unread     = notifications.filter(n => !n.read).length;

  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openNotif = (n) => {
    setSelected(n);
    setShowModal(true);
    if (!n.read) markNotificationRead(n.id);
  };

  const closeModal = () => {
    setShowModal(false);
    // Re-sync selected with latest store state so replies show up
    setSelected(null);
  };

  // ── Delivery ────────────────────────────────────────────────────────────────
  const handleAcceptDelivery = (n) => {
    Alert.alert(
      '✅ Confirm Delivery',
      'Confirm that you have received your order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Received!',
          onPress: () => {
            residentConfirmDelivery(n.orderId);
            updateNotification(n.id, { deliveryResolved: true, read: true });
            Alert.alert('🎉 Order Confirmed!', 'Your order has been marked as delivered.');
          },
        },
      ]
    );
  };

  const handleRejectDelivery = (n) => {
    Alert.alert(
      '❌ Reject Delivery',
      'Reject this delivery? (e.g. wrong order / damaged items)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            residentRejectDelivery(n.orderId);
            updateNotification(n.id, { deliveryResolved: true, deliveryRejected: true, read: true });
            Alert.alert('Delivery Rejected', 'The vendor has been notified.');
          },
        },
      ]
    );
  };

  // ── Walk-in ─────────────────────────────────────────────────────────────────
  const handleAllowWalkIn = (n) => {
    Alert.alert(
      'Allow Entry?',
      `${n.visitorName || 'Visitor'}${n.hostUnit ? ' wants to visit unit ' + n.hostUnit : ''}. Allow entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Allow Entry',
          onPress: () => {
            approveQueueEntry(n.queueId, residentId);
            updateNotification(n.id, { walkinStatus: 'APPROVED', read: true });
            Alert.alert('✅ Approved', `${n.visitorName || 'Visitor'} approved. Guard will let them in.`);
          },
        },
      ]
    );
  };

  const handleDenyWalkIn = (n) => {
    Alert.alert(
      'Deny Entry?',
      `Deny entry for ${n.visitorName || 'Visitor'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: () => {
            denyQueueEntry(n.queueId, residentId);
            updateNotification(n.id, { walkinStatus: 'DENIED', read: true });
            Alert.alert('🚫 Denied', `${n.visitorName || 'Visitor'} has been turned away.`);
          },
        },
      ]
    );
  };

  // ── Reply ────────────────────────────────────────────────────────────────────
  const handleSendReply = (notifId, text) => {
    const reply  = { from: 'me', text, at: new Date().toISOString() };
    const target = notifications.find(x => x.id === notifId);
    const prev   = target?.replies || [];
    updateNotification(notifId, { replies: [...prev, reply] });
    // Keep modal in sync with latest replies
    setSelected(s => s ? { ...s, replies: [...(s.replies || []), reply] } : s);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </Text>
          </View>
          {unread > 0 ? (
            <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.allReadBadge}>
              <Text style={styles.allReadText}>✓ All read</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              Visitor approvals, deliveries and society alerts will appear here.
            </Text>
          </View>
        ) : (
          notifications.map(n => {
            const cfg               = TYPE_CONFIG[n.type] || TYPE_CONFIG.announcement;
            const isDeliveryPending = n.actionType === 'delivery_arrived' && n.orderId && !n.deliveryResolved;
            const isWalkInPending   = n.type === 'walkin' && n.queueId && !n.walkinStatus;
            const walkinApproved    = n.type === 'walkin' && n.walkinStatus === 'APPROVED';
            const walkinDenied      = n.type === 'walkin' && n.walkinStatus === 'DENIED';
            const hasReplies        = (n.replies || []).length > 0;

            return (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.card,
                  !n.read && styles.cardUnread,
                  isDeliveryPending && styles.cardDelivery,
                  n.type === 'sos' && styles.cardSOS,
                  (isWalkInPending || walkinApproved || walkinDenied) && styles.cardWalkIn,
                ]}
                onPress={() => openNotif(n)}
                activeOpacity={0.85}
              >
                {/* Icon */}
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Text style={styles.iconEmoji}>{cfg.emoji}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
                  </View>

                  <Text style={styles.cardBody} numberOfLines={2}>{n.body}</Text>

                  {/* Quick action chips on list row */}
                  {isWalkInPending && (
                    <View style={styles.listActionRow}>
                      <TouchableOpacity
                        style={[styles.listBtn, styles.listBtnDeny]}
                        onPress={() => handleDenyWalkIn(n)}
                      >
                        <Text style={[styles.listBtnText, { color: T.danger }]}>🚫 Deny</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.listBtn, styles.listBtnAllow]}
                        onPress={() => handleAllowWalkIn(n)}
                      >
                        <Text style={[styles.listBtnText, { color: '#FFF' }]}>✓ Allow</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isDeliveryPending && (
                    <View style={styles.listActionRow}>
                      <TouchableOpacity
                        style={[styles.listBtn, styles.listBtnDeny]}
                        onPress={() => handleRejectDelivery(n)}
                      >
                        <Text style={[styles.listBtnText, { color: T.danger }]}>✗ Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.listBtn, styles.listBtnAllow]}
                        onPress={() => handleAcceptDelivery(n)}
                      >
                        <Text style={[styles.listBtnText, { color: '#FFF' }]}>✓ Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Resolved state pills */}
                  {walkinApproved && (
                    <View style={[styles.resolvedPill, { backgroundColor: T.successBg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: T.success }}>✅ Entry allowed</Text>
                    </View>
                  )}
                  {walkinDenied && (
                    <View style={[styles.resolvedPill, { backgroundColor: T.dangerBg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: T.danger }}>🚫 Entry denied</Text>
                    </View>
                  )}
                  {n.deliveryResolved && !n.deliveryRejected && (
                    <View style={[styles.resolvedPill, { backgroundColor: T.successBg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: T.success }}>✅ Delivery accepted</Text>
                    </View>
                  )}
                  {n.deliveryRejected && (
                    <View style={[styles.resolvedPill, { backgroundColor: T.dangerBg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: T.danger }}>✗ Delivery rejected</Text>
                    </View>
                  )}

                  {/* Reply count */}
                  {hasReplies && (
                    <View style={styles.replyCountBadge}>
                      <Text style={styles.replyCountText}>
                        💬 {n.replies.length} repl{n.replies.length === 1 ? 'y' : 'ies'}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.tapHint}>Tap to open full message</Text>
                </View>

                {!n.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Detail Modal ── */}
      <NotifDetailModal
        notif={selected}
        visible={showModal}
        onClose={closeModal}
        onAcceptDelivery={handleAcceptDelivery}
        onRejectDelivery={handleRejectDelivery}
        onAllowWalkIn={handleAllowWalkIn}
        onDenyWalkIn={handleDenyWalkIn}
        onSendReply={handleSendReply}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  // ── Header ────────────────────────────────────────────────────────────────
  header: { backgroundColor: T.primary, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  markAllText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  allReadBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  allReadText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  // ── Notification card ─────────────────────────────────────────────────────
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: T.card,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: T.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardUnread:   { borderColor: T.primary, backgroundColor: T.primaryBg },
  cardDelivery: { borderColor: T.primary, borderWidth: 2 },
  cardSOS:      { borderColor: T.danger,  borderWidth: 2, backgroundColor: T.dangerBg },
  cardWalkIn:   { borderColor: T.primary, borderWidth: 2 },

  iconWrap:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: 20 },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: T.text, flex: 1, marginRight: 8 },
  cardTitleUnread: { fontWeight: '800', color: T.primaryDark },
  cardBody:  { fontSize: 12, color: T.textMuted, lineHeight: 18, marginBottom: 4 },
  cardTime:  { fontSize: 11, color: T.textMuted, flexShrink: 0 },
  tapHint:   { fontSize: 10, color: T.textMuted, marginTop: 5, fontStyle: 'italic' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary, marginTop: 4, flexShrink: 0 },

  listActionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  listBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  listBtnDeny:  { backgroundColor: T.primaryBg, borderWidth: 1, borderColor: T.border },
  listBtnAllow: { backgroundColor: T.primary, flex: 2 },
  listBtnText:  { fontSize: 12, fontWeight: '700' },

  resolvedPill: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  replyCountBadge: {
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: T.primaryBg, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: T.border,
  },
  replyCountText: { fontSize: 11, color: T.primary, fontWeight: '600' },

  // ── Empty ─────────────────────────────────────────────────────────────────
  empty:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: T.textMuted, textAlign: 'center', lineHeight: 20 },

  // ── Modal ─────────────────────────────────────────────────────────────────
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: {
    backgroundColor: T.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 8, maxHeight: '92%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: T.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalHdr: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  modalTypeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  modalTypeEmoji: { fontSize: 16 },
  modalTypeLabel: { fontSize: 13, fontWeight: '700' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: T.textMuted },
  modalTitle: { fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 4 },
  modalTime:  { fontSize: 12, color: T.textMuted, marginBottom: 14 },

  messageBubble: {
    backgroundColor: T.primaryBg, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: T.border, marginBottom: 14,
  },
  messageText: { fontSize: 15, color: T.text, lineHeight: 24 },

  infoBox: {
    backgroundColor: T.card, borderRadius: 12,
    borderWidth: 1, borderColor: T.border, marginBottom: 14, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: T.primaryBg,
  },
  infoLabel: { fontSize: 13, color: T.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, color: T.text, fontWeight: '700' },

  actionSection: { marginBottom: 14 },
  actionSectionLabel: {
    fontSize: 11, fontWeight: '700', color: T.textMuted,
    letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase',
  },
  actionRow:        { flexDirection: 'row', gap: 10 },
  actionBtn:        { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: T.primary },
  actionBtnOutline: { backgroundColor: T.primaryBg, borderWidth: 1, borderColor: T.border },
  actionBtnText:    { fontSize: 14, fontWeight: '800' },

  resolvedBanner: {
    borderRadius: 12, padding: 14, borderWidth: 1,
    alignItems: 'center', marginBottom: 14,
  },
  navBtn: {
    borderWidth: 1, borderColor: T.border, borderRadius: 12,
    padding: 13, alignItems: 'center', marginBottom: 14,
  },
  navBtnText: { fontSize: 14, fontWeight: '700', color: T.primary },

  replyThread:      { marginBottom: 14 },
  replyThreadLabel: {
    fontSize: 11, fontWeight: '700', color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  replyBubble:     { maxWidth: '82%', padding: 10, borderRadius: 14, marginBottom: 8 },
  replyBubbleMe:   { backgroundColor: T.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  replyBubbleThem: {
    backgroundColor: T.primaryBg, alignSelf: 'flex-start',
    borderBottomLeftRadius: 4, borderWidth: 1, borderColor: T.border,
  },
  replyBubbleText: { fontSize: 13, lineHeight: 20 },
  replyTime:       { fontSize: 10, marginTop: 3 },

  replySentBanner: {
    backgroundColor: T.successBg, borderRadius: 10,
    padding: 10, alignItems: 'center', marginBottom: 12,
  },

  quickReplies:      { marginBottom: 10 },
  quickRepliesLabel: {
    fontSize: 11, fontWeight: '700', color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  quickChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: T.primaryBg, borderWidth: 1, borderColor: T.border, marginRight: 8,
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: T.primary },

  replyBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    borderTopWidth: 1, borderTopColor: T.border,
    paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    backgroundColor: T.card,
  },
  replyInput: {
    flex: 1, backgroundColor: T.primaryBg, borderRadius: 20,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: T.text, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: T.primary, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  sendBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});