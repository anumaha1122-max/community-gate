/**
 * ResidentMaintenanceScreen.js
 *
 * THEME  : Matches visitor/real-estate screens — teal #1A7A7A header,
 *          #E8F5F5 background, white cards, teal/amber accents.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Modal, Alert, FlatList,
} from 'react-native';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import StatusBadge from '../../../components/common/StatusBadge';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting',
  'Appliances', 'Structural', 'Pest Control', 'Landscaping', 'Other',
];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TIME_SLOTS = ['Morning (8–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Flexible'];
const CONTACT_OPT = ['Call', 'WhatsApp', 'In-App'];

const PRIORITY_COLOR = {
  Low: { color: '#1A7A7A', bg: '#D1FAF0' },
  Medium: { color: '#B45309', bg: '#FEF3C7' },
  High: { color: '#C2410C', bg: '#FFEDD5' },
  Urgent: { color: '#B91C1C', bg: '#FEE2E2' },
};

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: '📋' },
  { key: 'quote_requested', label: 'Quote Sent', icon: '📩' },
  { key: 'quoted', label: 'Quoted', icon: '💰' },
  { key: 'quote_sent_to_resident', label: 'Quote Received', icon: '📨' },
  { key: 'quote_accepted', label: 'Accepted', icon: '✅' },
  { key: 'approved_to_start', label: 'Approved', icon: '🚀' },
  { key: 'work_in_progress', label: 'In Progress', icon: '🔨' },
  { key: 'work_completed', label: 'Completed', icon: '🎉' },
];

const WORK_STAGES = [
  'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
  'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
  'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
];

function statusIndex(status) {
  const i = STATUS_STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Status Progress Stepper ──────────────────────────────────────────────────
function StatusStepper({ status }) {
  const current = statusIndex(status);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
        {STATUS_STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const pending = i > current;
          return (
            <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', width: 60 }}>
                <View style={[
                  stp.dot,
                  done && stp.dotDone,
                  active && stp.dotActive,
                  pending && stp.dotPending,
                ]}>
                  <Text style={{ fontSize: 11 }}>{done ? '✓' : step.icon}</Text>
                </View>
                <Text style={[
                  stp.stepLabel,
                  active && { color: '#1A7A7A', fontWeight: '800' },
                  done && { color: '#0D6E6E' },
                ]} numberOfLines={2}>
                  {step.label}
                </Text>
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={[stp.line, done && stp.lineDone]} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const stp = StyleSheet.create({
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#B0DEDE', marginBottom: 4 },
  dotDone: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
  dotActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A', transform: [{ scale: 1.15 }] },
  dotPending: { backgroundColor: '#F0FAFA', borderColor: '#D0EEEE' },
  stepLabel: { fontSize: 9, color: '#7A9E9E', textAlign: 'center', fontWeight: '600', maxWidth: 58 },
  line: { width: 20, height: 2, backgroundColor: '#D0EEEE', marginBottom: 16 },
  lineDone: { backgroundColor: '#0D6E6E' },
});

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={{ fontSize: 28, color: n <= value ? '#F59E0B' : '#D0EEEE' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Rate & Review Modal ──────────────────────────────────────────────────────
function RateModal({ visible, onClose, req }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const submitVendorRating = useAppStore(s => s.submitVendorRating);
  const user = useAuthStore(s => s.user);

  const handleSubmit = () => {
    if (!rating) { Alert.alert('Please select a star rating'); return; }
    if (req && submitVendorRating) {
      submitVendorRating({
        vendorId: req.assignedVendorId || 'ven1',
        vendorName: req.assignedVendorName || 'Vendor',
        residentId: user?.id || 'res1',
        residentName: user?.name || 'Resident',
        requestId: req.id,
        rating,
        review: comment.trim(),
        category: req.category || 'General',
      });
    }
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setRating(0);
      setComment('');
      onClose();
      Alert.alert('⭐ Thank you!', 'Your feedback has been submitted.');
    }, 900);
  };

  if (!req) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={rm.overlay}>
        <View style={rm.sheet}>
          <View style={rm.handle} />
          <Text style={rm.title}>Rate This Job</Text>
          <Text style={rm.sub}>{req.category} · {req.vendorName || 'Vendor'}</Text>
          <StarRating value={rating} onChange={setRating} />
          <TextInput
            style={rm.input}
            placeholder="Share your experience (optional)…"
            placeholderTextColor="#7A9E9E"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity style={[rm.btn, done && { opacity: 0.7 }]} onPress={handleSubmit} disabled={done}>
            <Text style={rm.btnText}>{done ? 'Submitting…' : '⭐ Submit Review'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rm.cancel} onPress={onClose}>
            <Text style={rm.cancelText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const rm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#E8F5F5', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#B0DEDE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  sub: { fontSize: 13, color: '#7A9E9E', marginBottom: 12 },
  input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, padding: 12, fontSize: 14, color: '#1A2E2E', marginVertical: 10, minHeight: 80 },
  btn: { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  cancel: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#7A9E9E', fontWeight: '600' },
});

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({ req, onPress }) {
  const pc = PRIORITY_COLOR[req.priority] || PRIORITY_COLOR.Medium;
  const needsAction = ['quote_sent_to_resident'].includes(req.status)
    || (['work_in_progress', 'work_completed'].includes(req.status) && req.pendingStepApproval);
  const closed = ['work_completed', 'payment_received', 'paid_to_vendor', 'rejected', 'quote_rejected'].includes(req.status);

  return (
    <TouchableOpacity style={[rc.card, needsAction && rc.cardUrgent]} activeOpacity={0.85} onPress={onPress}>
      <View style={rc.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={rc.title} numberOfLines={1}>{req.title}</Text>
          <Text style={rc.sub}>{req.category} · {req.id}</Text>
        </View>
        <StatusBadge status={req.status} />
      </View>

      <View style={rc.metaRow}>
        <View style={[rc.priorityTag, { backgroundColor: pc.bg }]}>
          <Text style={[rc.priorityText, { color: pc.color }]}>{req.priority}</Text>
        </View>
        <Text style={rc.dateText}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        {req.vendorName && (
          <View style={rc.vendorChip}>
            <Text style={rc.vendorText}>🔧 {req.vendorName}</Text>
          </View>
        )}
      </View>

      {needsAction && (
        <View style={rc.actionBanner}>
          <Text style={rc.actionBannerText}>
            {req.status === 'quote_sent_to_resident' ? '💰 Quote ready — tap to review' :
                (req.status === 'work_in_progress' && req.pendingStepApproval && (req.workStep === 0 || !req.workStep)) ? '🔧 Vendor at site — tap to confirm arrival' :
                  (req.status === 'work_in_progress' && req.pendingStepApproval && req.workStep === 12) ? '🏁 Work done — tap to approve' : ''}
          </Text>
        </View>
      )}

      {closed && (
        <View style={rc.closedTag}>
          <Text style={rc.closedText}>✔ Closed</Text>
        </View>
      )}

      <Text style={rc.tapHint}>Tap to view details →</Text>
    </TouchableOpacity>
  );
}

const rc = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE', shadowColor: '#1A7A7A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardUrgent: { borderColor: '#FDE68A', borderWidth: 1.5 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  title: { fontSize: 15, fontWeight: '800', color: '#1A2E2E', flex: 1 },
  sub: { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  priorityTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityText: { fontSize: 11, fontWeight: '800' },
  dateText: { fontSize: 12, color: '#7A9E9E' },
  vendorChip: { backgroundColor: '#E8F5F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#B0DEDE' },
  vendorText: { fontSize: 11, fontWeight: '700', color: '#1A7A7A' },
  actionBanner: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 4, borderWidth: 1, borderColor: '#FDE68A' },
  actionBannerText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  closedTag: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: '#F0FAFA', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  closedText: { fontSize: 11, color: '#7A9E9E', fontWeight: '700' },
  tapHint: { fontSize: 11, color: '#B0DEDE', textAlign: 'right', marginTop: 6, fontWeight: '600' },
  directPayBtn: { backgroundColor: '#1A7A7A', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 12, shadowColor: '#1A7A7A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  directPayBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});

// ─── New Request Modal ────────────────────────────────────────────────────────
function NewRequestModal({ visible, onClose, onSubmit, theme }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Plumbing', priority: 'Medium',
    preferredSlot: 'Flexible', contactPref: 'Call',
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Missing Info', 'Please fill in the title and description.');
      return;
    }
    onSubmit(form);
    setForm({ title: '', description: '', category: 'Plumbing', priority: 'Medium', preferredSlot: 'Flexible', contactPref: 'Call' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E8F5F5' }}>
        <View style={nrm.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={nrm.close}>✕</Text>
          </TouchableOpacity>
          <Text style={nrm.title}>New Request</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={nrm.body} showsVerticalScrollIndicator={false}>
          <View style={nrm.infoBanner}>
            <Text style={nrm.infoText}>📋 Your request goes to the admin, who will assign a vendor and share a quote before any work begins.</Text>
          </View>

          <Text style={nrm.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[nrm.chip, form.category === c && nrm.chipActive]} onPress={() => f('category', c)}>
                <Text style={[nrm.chipText, form.category === c && nrm.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={nrm.label}>Priority</Text>
          <View style={nrm.chipRow}>
            {PRIORITIES.map(p => {
              const pc = PRIORITY_COLOR[p];
              const active = form.priority === p;
              return (
                <TouchableOpacity key={p}
                  style={[nrm.chip, active && { backgroundColor: pc.bg, borderColor: pc.color }]}
                  onPress={() => f('priority', p)}
                >
                  <Text style={[nrm.chipText, active && { color: pc.color, fontWeight: '800' }]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={nrm.label}>Issue Title *</Text>
          <TextInput style={nrm.input} placeholder="e.g. Leaking pipe under kitchen sink" placeholderTextColor="#7A9E9E" value={form.title} onChangeText={v => f('title', v)} />

          <Text style={nrm.label}>Description *</Text>
          <TextInput style={[nrm.input, { minHeight: 90, textAlignVertical: 'top' }]} placeholder="Describe the issue in detail — what's wrong, when it started, severity…" placeholderTextColor="#7A9E9E" value={form.description} onChangeText={v => f('description', v)} multiline />

          <Text style={nrm.label}>Preferred Time Slot for Visit</Text>
          <View style={nrm.chipRow}>
            {TIME_SLOTS.map(s => (
              <TouchableOpacity key={s} style={[nrm.chip, form.preferredSlot === s && nrm.chipActive]} onPress={() => f('preferredSlot', s)}>
                <Text style={[nrm.chipText, form.preferredSlot === s && nrm.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={nrm.label}>Preferred Contact Method</Text>
          <View style={nrm.chipRow}>
            {CONTACT_OPT.map(c => (
              <TouchableOpacity key={c} style={[nrm.chip, form.contactPref === c && nrm.chipActive]} onPress={() => f('contactPref', c)}>
                <Text style={[nrm.chipText, form.contactPref === c && nrm.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={nrm.submitBtn} onPress={handleSubmit}>
            <Text style={nrm.submitText}>🔧 Submit Request</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const nrm = StyleSheet.create({
  header: { backgroundColor: '#1A7A7A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  close: { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700', width: 32 },
  body: { padding: 16 },
  infoBanner: { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#3D6E6E', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B0DEDE', marginRight: 4 },
  chipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  visible, req, onClose, theme,
  onAcceptQuote, onRejectQuote,
  onApproveStep, onRejectStep,
  onRateOpen, onReopen, onEscalate,
}) {
  if (!req) return null;
  const pc = PRIORITY_COLOR[req.priority] || PRIORITY_COLOR.Medium;
  const stepNum = req.pendingStep ?? req._workStep ?? 0;
  const isCompleted = ['work_completed', 'payment_received', 'paid_to_vendor'].includes(req.status);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E8F5F5' }}>
        <View style={dm.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={dm.close}>✕</Text>
          </TouchableOpacity>
          <Text style={dm.title} numberOfLines={1}>{req.title}</Text>
          <View style={[dm.priorityPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFF' }}>{req.priority}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={dm.body} showsVerticalScrollIndicator={false}>
          <View style={dm.card}>
            <Text style={dm.secLabel}>PROGRESS</Text>
            <StatusStepper status={req.status} />
          </View>

          <View style={dm.card}>
            <Text style={dm.secLabel}>REQUEST DETAILS</Text>
            {[
              ['ID', req.id],
              ['Category', req.category],
              ['Unit', req.unit],
              ['Priority', req.priority],
              ['Submitted', fmtDate(req.createdAt)],
              req.preferredSlot && ['Preferred Slot', req.preferredSlot],
              req.contactPref && ['Contact via', req.contactPref],
              req.vendorName && ['Vendor', req.vendorName],
            ].filter(Boolean).map(([k, v]) => (
              <View key={k} style={dm.detailRow}>
                <Text style={dm.detailKey}>{k}</Text>
                <Text style={dm.detailVal}>{v}</Text>
              </View>
            ))}
            <Text style={[dm.secLabel, { marginTop: 12 }]}>DESCRIPTION</Text>
            <Text style={dm.descText}>{req.description}</Text>
          </View>

          {req.status === 'quote_sent_to_resident' && req.quote && (
            <View style={[dm.actionCard, { borderColor: '#FDE68A' }]}>
              <Text style={dm.actionCardTitle}>💰 Quote Received — Review & Decide</Text>
              <View style={dm.quoteAmountRow}>
                <Text style={dm.quoteAmount}>₹{req.quote.amount?.toLocaleString('en-IN')}</Text>
              </View>
              {req.quote.description && <Text style={dm.quoteDesc}>{req.quote.description}</Text>}
              {req.quote.eta && <Text style={dm.quoteMeta}>⏱ ETA: {req.quote.eta}</Text>}
              {req.quote.estimatedDays && <Text style={dm.quoteMeta}>📅 Est. {req.quote.estimatedDays} day{req.quote.estimatedDays > 1 ? 's' : ''}</Text>}
              <View style={dm.btnRow}>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#1A7A7A', flex: 1 }]} onPress={() => { onAcceptQuote(req.id); onClose(); }}>
                  <Text style={dm.btnText}>✓ Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#FEE2E2', flex: 1 }]} onPress={() => {
                  Alert.alert('Reject Quote', 'Reject this quote? Admin will seek a revised one.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => { onRejectQuote(req.id); onClose(); } },
                  ]);
                }}>
                  <Text style={[dm.btnText, { color: '#B91C1C' }]}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {req.status === 'work_in_progress' && req.pendingStepApproval && (
            <View style={[dm.actionCard, { borderColor: '#1A7A7A' }]}>
              <Text style={dm.actionCardTitle}>
                {(req.workStep === 0 || !req.workStep) ? '🔧 Confirm Vendor Arrival' : '🏁 Approve Maintenance Work'}
              </Text>
              <Text style={dm.actionCardSub}>
                {(req.workStep === 0 || !req.workStep)
                  ? 'The vendor has arrived at the gate and is ready to start. Tap Approve to confirm they have reached your unit.'
                  : 'The vendor has marked the work as completed. Please inspect and approve to proceed to payment.'}
              </Text>
              <View style={dm.btnRow}>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#1A7A7A', flex: 1 }]} onPress={() => { onApproveStep(req.id, true); onClose(); }}>
                  <Text style={dm.btnText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#FEE2E2', flex: 1 }]} onPress={() => {
                  Alert.alert('Reject/Feedback', 'Not satisfied? Vendor will be notified to review.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => { onRejectStep(req.id, false); onClose(); } },
                  ]);
                }}>
                  <Text style={[dm.btnText, { color: '#B91C1C' }]}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isCompleted && (
            <View style={dm.card}>
              <Text style={dm.secLabel}>COMPLETED</Text>
              {req.workCompletedAt && (
                <Text style={{ fontSize: 13, color: '#3D6E6E', marginBottom: 12 }}>✔ Work completed on {fmtDate(req.workCompletedAt)}</Text>
              )}
              <View style={dm.btnRow}>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#F59E0B', flex: 1 }]} onPress={() => { onClose(); onRateOpen(); }}>
                  <Text style={dm.btnText}>⭐ Rate Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[dm.btn, { backgroundColor: '#FEE2E2', flex: 1 }]} onPress={() => {
                  Alert.alert('Re-open Request', 'Is the issue not fully resolved? This will create a follow-up.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Re-open', onPress: () => { onReopen(req.id); onClose(); } },
                  ]);
                }}>
                  <Text style={[dm.btnText, { color: '#B91C1C' }]}>↩ Re-open</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {['submitted', 'quote_requested', 'assigned'].includes(req.status) && (
            <TouchableOpacity style={dm.escalateBtn} onPress={() => {
              Alert.alert('Escalate Request', 'This will send an urgent reminder to admin.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Escalate', onPress: () => { onEscalate(req.id); onClose(); } },
              ]);
            }}>
              <Text style={dm.escalateBtnText}>🚨 Escalate to Admin</Text>
            </TouchableOpacity>
          )}

          {req.timeline?.length > 0 && (
            <View style={dm.card}>
              <Text style={dm.secLabel}>TIMELINE</Text>
              {[...req.timeline].reverse().map((t, i) => (
                <View key={i} style={dm.timelineRow}>
                  <View style={dm.timelineLine}>
                    <View style={[dm.timelineDot, i === 0 && { backgroundColor: '#1A7A7A' }]} />
                    {i < req.timeline.length - 1 && <View style={dm.timelineConnector} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 14 }}>
                    <Text style={dm.timelineAction}>{t.action}</Text>
                    {t.by && <Text style={dm.timelineMeta}>by {t.by}</Text>}
                    {t.at && <Text style={dm.timelineMeta}>{fmtDate(t.at)}</Text>}
                    {t.note && <Text style={dm.timelineNote}>{t.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const dm = StyleSheet.create({
  header: { backgroundColor: '#1A7A7A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 20, gap: 10 },
  close: { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700', width: 32 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFF' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  body: { padding: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' },
  detailKey: { fontSize: 13, color: '#7A9E9E' },
  detailVal: { fontSize: 13, fontWeight: '700', color: '#1A2E2E', textAlign: 'right', flex: 1, marginLeft: 12 },
  descText: { fontSize: 14, color: '#3D6E6E', lineHeight: 22 },
  actionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2 },
  actionCardTitle: { fontSize: 15, fontWeight: '800', color: '#1A2E2E', marginBottom: 6 },
  actionCardSub: { fontSize: 13, color: '#5A8E8E', lineHeight: 19, marginBottom: 4 },
  quoteAmountRow: { marginVertical: 6 },
  quoteAmount: { fontSize: 26, fontWeight: '900', color: '#0D6E6E' },
  quoteDesc: { fontSize: 14, color: '#3D6E6E', lineHeight: 20 },
  quoteMeta: { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', paddingHorizontal: 8 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  escalateBtn: { backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: '#FECACA' },
  escalateBtnText: { color: '#B91C1C', fontWeight: '800', fontSize: 14 },
  timelineRow: { flexDirection: 'row', gap: 10 },
  timelineLine: { alignItems: 'center', width: 14 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#B0DEDE', marginTop: 2 },
  timelineConnector: { flex: 1, width: 2, backgroundColor: '#E8F5F5', marginVertical: 2 },
  timelineAction: { fontSize: 13, fontWeight: '700', color: '#1A2E2E' },
  timelineMeta: { fontSize: 11, color: '#7A9E9E', marginTop: 1 },
  timelineNote: { fontSize: 12, color: '#3D6E6E', marginTop: 2, fontStyle: 'italic' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const FILTERS = [
  { k: 'all', l: 'All' },
  { k: 'action', l: '⚡ Action' },
  { k: 'progress', l: '🔨 In Progress' },
  { k: 'closed', l: '✔ Closed' },
];

export default function ResidentMaintenanceScreen({ navigation }) {
  const theme = useTheme();
  const currentUser = useAuthStore(s => s.user);
  const requests = useAppStore(s => s.maintenanceRequests);
  const fetchMaintenance = useAppStore(s => s.fetchMaintenance);

  React.useEffect(() => {
    if (currentUser?.id) {
      fetchMaintenance('resident', currentUser.id);
    }
  }, [currentUser?.id]);

  const addMaintenanceRequest = useAppStore(s => s.addMaintenanceRequest);
  const residentRespondToQuote = useAppStore(s => s.residentRespondToQuote);
  const approveWorkStep = useAppStore(s => s.approveWorkStep);
  const bills = useResidentStore(s => s.bills);

  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [showRate, setShowRate] = useState(false);
  const [rateTarget, setRateTarget] = useState(null);

  const myRequests = requests
    .filter(r => r.residentId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const ACTION_STATUSES = ['quote_sent_to_resident'];
  const PROGRESS_STATUSES = ['submitted', 'quote_requested', 'quoted', 'assigned', 'quote_accepted', 'approved_to_start', 'work_in_progress'];
  const CLOSED_STATUSES = ['work_completed', 'payment_received', 'paid_to_vendor', 'rejected', 'quote_rejected'];

  const filtered = myRequests.filter(r => {
    if (filter === 'action') return ACTION_STATUSES.includes(r.status) || (['work_in_progress', 'work_completed'].includes(r.status) && r.pendingStepApproval);
    if (filter === 'progress') return PROGRESS_STATUSES.includes(r.status);
    if (filter === 'closed') return CLOSED_STATUSES.includes(r.status);
    return true;
  });

  const actionCount = myRequests.filter(r =>
    ACTION_STATUSES.includes(r.status) || (['work_in_progress', 'work_completed'].includes(r.status) && r.pendingStepApproval)
  ).length;

  const submitRequest = async (form) => {
    try {
      const req = await addMaintenanceRequest({
        ...form,
        residentId: currentUser.id,
        residentName: currentUser.name,
        unit: currentUser.unit,
      });
      setShowNew(false);
      Alert.alert('✅ Submitted!', `ID: ${req.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit.');
    }
  };

  const handleReopen = (id) => Alert.alert('↩ Re-opened', 'Follow-up sent.');
  const handleEscalate = (id) => Alert.alert('🚨 Escalated', 'Admin notified.');
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '';

  return (
    <SafeAreaView style={sc.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={sc.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={sc.backBtn}>
              <Text style={sc.backText}>← Dashboard</Text>
            </TouchableOpacity>
            <Text style={sc.headerTitle}>Maintenance</Text>
            <Text style={sc.headerSub}>{myRequests.length} total{actionCount > 0 ? ` · ${actionCount} action` : ''}</Text>
          </View>
          <TouchableOpacity style={sc.newBtn} onPress={() => setShowNew(true)}>
            <Text style={sc.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={sc.filterBar}>
        {FILTERS.map(({ k, l }) => (
          <TouchableOpacity key={k} style={[sc.filterTab, filter === k && sc.filterTabActive]} onPress={() => setFilter(k)}>
            <Text style={[sc.filterTabText, filter === k && sc.filterTabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={sc.listPad}
        renderItem={({ item }) => (
          <RequestCard req={item} onPress={() => setSelectedReq(item)} />
        )}
        ListEmptyComponent={
          <View style={sc.empty}>
            <Text style={sc.emptyTitle}>No requests</Text>
          </View>
        }
      />

      <NewRequestModal visible={showNew} onClose={() => setShowNew(false)} onSubmit={submitRequest} theme={theme} />
      <DetailModal
        visible={!!selectedReq} req={selectedReq} onClose={() => setSelectedReq(null)} theme={theme}
        onAcceptQuote={(id) => residentRespondToQuote(id, true)}
        onRejectQuote={(id) => residentRespondToQuote(id, false)}
        onApproveStep={(id) => approveWorkStep?.(id, true, currentUser?.name || 'Resident')}
        onRejectStep={(id) => approveWorkStep?.(id, false, currentUser?.name || 'Resident')}
        onRateOpen={() => { setRateTarget(selectedReq); setShowRate(true); }}
        onReopen={handleReopen} onEscalate={handleEscalate}
      />
      <RateModal visible={showRate} onClose={() => { setShowRate(false); setRateTarget(null); }} req={rateTarget} />
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8F5F5' },
  header: { backgroundColor: '#1A7A7A', padding: 20, paddingTop: 40 },
  backBtn: { marginBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  newBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newBtnText: { color: '#FFF', fontWeight: '800' },
  filterBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  filterTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  filterTabActive: { borderBottomWidth: 3, borderBottomColor: '#1A7A7A' },
  filterTabText: { fontSize: 13, color: '#7A9E9E' },
  filterTabTextActive: { color: '#1A7A7A', fontWeight: '800' },
  listPad: { padding: 16 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, color: '#7A9E9E' },
});