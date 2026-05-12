/**
 * AdminMaintenance.js
 * Full standalone admin maintenance screen — teal theme matching resident screens.
 * Same functionality as AdminMaintenanceScreen, registered separately in AdminNavigator.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Modal, Alert, FlatList,
} from 'react-native';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5', tealMid: '#D0EEEE',
  tealText: '#3D6E6E', bg: '#E8F5F5', surface: '#FFFFFF', text: '#1A2E2E',
  textMuted: '#7A9E9E', border: '#D0EEEE', danger: '#C62828', dangerBg: '#FEE2E2',
  amber: '#B45309', amberBg: '#FEF3C7', green: '#15803D', greenBg: '#DCFCE7',
};

const STATUS_COLORS = {
  submitted: { color: '#B45309', bg: '#FEF3C7' },
  quote_requested: { color: '#0891B2', bg: '#E0F7FA' },
  assigned: { color: '#6366F1', bg: '#EDE9FE' },
  quoted: { color: '#8B5CF6', bg: '#F3E8FF' },
  quote_sent_to_resident: { color: '#0D9488', bg: '#CCFBF1' },
  quote_accepted: { color: '#15803D', bg: '#DCFCE7' },
  quote_rejected: { color: '#DC2626', bg: '#FEE2E2' },
  approved_to_start: { color: '#2563EB', bg: '#DBEAFE' },
  work_in_progress: { color: '#D97706', bg: '#FEF3C7' },
  work_completed: { color: '#15803D', bg: '#DCFCE7' },
  payment_requested_to_admin: { color: '#EA580C', bg: '#FFEDD5' },
  payment_requested_to_resident: { color: '#7C3AED', bg: '#EDE9FE' },
  payment_received: { color: '#0891B2', bg: '#E0F7FA' },
  paid_to_vendor: { color: '#15803D', bg: '#DCFCE7' },
};

const STATUS_LABEL = {
  submitted: '🆕 New',
  quote_requested: '📤 Quote Req',
  assigned: '👷 Assigned',
  quoted: '💰 Quote In',
  quote_sent_to_resident: '📨 Sent to Resident',
  quote_accepted: '✅ Accepted',
  quote_rejected: '❌ Rejected',
  approved_to_start: '🚀 Go to Gate',
  work_in_progress: '🔧 In Progress',
  work_completed: '🏁 Work Done',
  payment_requested_to_admin: '💳 Pay Due',
  payment_requested_to_resident: '💳 Billing Resident',
  payment_received: '💸 Resident Paid',
  paid_to_vendor: '✔️ Closed',
};

const PRIORITY_COLORS = {
  Low: { color: '#1A7A7A', bg: '#D1FAF0' },
  Medium: { color: '#B45309', bg: '#FEF3C7' },
  High: { color: '#C2410C', bg: '#FFEDD5' },
  Urgent: { color: '#B91C1C', bg: '#FEE2E2' },
};

const WORK_STAGES = [
  'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
  'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
  'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
];

const ADMIN_ACTION_STATUSES = ['submitted', 'quoted', 'quote_accepted', 'payment_requested_to_admin', 'payment_received'];

const FILTERS = [
  { k: 'all', l: 'All' },
  { k: 'action', l: '⚡ Action' },
  { k: 'pending', l: '⏳ Pending' },
  { k: 'progress', l: '🔧 Progress' },
  { k: 'closed', l: '✔ Closed' },
];

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { color: P.textMuted, bg: '#F5F5F5' };
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: c.bg }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: c.color }}>{STATUS_LABEL[status] || status?.replace(/_/g, ' ')}</Text>
    </View>
  );
}

function RequestCard({ req, onPress }) {
  const needsAction = ADMIN_ACTION_STATUSES.includes(req.status);
  const pc = PRIORITY_COLORS[req.priority] || PRIORITY_COLORS.Medium;
  return (
    <TouchableOpacity style={[rc.card, needsAction && rc.cardAction]} onPress={onPress} activeOpacity={0.85}>
      {needsAction && <View style={rc.dot} />}
      <View style={rc.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={rc.title} numberOfLines={1}>{req.title}</Text>
          <Text style={rc.sub}>{req.category} · Unit {req.unit} · {req.residentName}</Text>
        </View>
        <StatusBadge status={req.status} />
      </View>
      <View style={rc.metaRow}>
        <View style={[rc.tag, { backgroundColor: pc.bg }]}>
          <Text style={[rc.tagText, { color: pc.color }]}>{req.priority}</Text>
        </View>
        <Text style={rc.date}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
        {req.assignedVendorName && <View style={rc.chip}><Text style={rc.chipText}>🔧 {req.assignedVendorName}</Text></View>}
        {req.quote?.amount && (
          <View style={[rc.chip, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
            <Text style={[rc.chipText, { color: P.green }]}>₹{req.quote.amount.toLocaleString('en-IN')}</Text>
          </View>
        )}
      </View>
      {needsAction && (
        <View style={rc.actionBanner}>
          <Text style={rc.actionBannerText}>
            {req.status === 'submitted' ? '📤 New — Send quote request to vendors' :
              req.status === 'quoted' ? '📨 Quote in — Forward to resident' :
                req.status === 'quote_accepted' ? '🚀 Resident accepted — Approve work start' :
                  req.status === 'payment_requested_to_admin' ? '💳 Vendor billing — Request payment from resident' :
                    req.status === 'payment_received' ? '💸 Resident paid — Pay vendor to close job' : ''}
          </Text>
        </View>
      )}
      <Text style={rc.tapHint}>Tap to view & take action →</Text>
    </TouchableOpacity>
  );
}

const rc = StyleSheet.create({
  card: { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, shadowColor: P.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: 'relative' },
  cardAction: { borderColor: '#FDE68A', borderWidth: 1.5 },
  dot: { position: 'absolute', top: 14, right: 14, width: 9, height: 9, borderRadius: 5, backgroundColor: '#F59E0B' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  title: { fontSize: 15, fontWeight: '800', color: P.text, flex: 1 },
  sub: { fontSize: 12, color: P.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '800' },
  date: { fontSize: 12, color: P.textMuted },
  chip: { backgroundColor: P.tealSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: P.tealMid },
  chipText: { fontSize: 11, fontWeight: '700', color: P.teal },
  actionBanner: { backgroundColor: P.amberBg, borderRadius: 8, padding: 8, marginTop: 4, borderWidth: 1, borderColor: '#FDE68A' },
  actionBannerText: { fontSize: 12, fontWeight: '700', color: P.amber },
  tapHint: { fontSize: 11, color: P.tealMid, textAlign: 'right', marginTop: 6, fontWeight: '600' },
});

// ─── Vendor Picker Modal ──────────────────────────────────────────────────────
function VendorPickerModal({ visible, req, vendors, onClose, onSend }) {
  const [selected, setSelected] = useState([]);
  const toggle = (v) => setSelected(p => p.some(s => s.id === v.id) ? p.filter(s => s.id !== v.id) : [...p, { id: v.id, name: v.name }]);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <View style={vp.header}>
          <TouchableOpacity onPress={onClose}><Text style={vp.close}>✕</Text></TouchableOpacity>
          <Text style={vp.title}>📤 Request Quotes from Vendors</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {req && (
            <View style={vp.infoBanner}>
              <Text style={vp.infoTitle}>📋 {req.title}</Text>
              <Text style={vp.infoSub}>{req.category} · {req.priority} priority · Unit {req.unit}</Text>
            </View>
          )}
          <Text style={vp.label}>Select vendors to invite for quoting:</Text>
          {vendors.length === 0 && <Text style={{ textAlign: 'center', color: P.textMuted, marginTop: 24, fontSize: 14 }}>No vendors in the system.</Text>}
          {vendors.map(v => {
            const isSel = selected.some(s => s.id === v.id);
            return (
              <TouchableOpacity key={v.id} style={[vp.vendorCard, isSel && vp.vendorCardActive]} onPress={() => toggle(v)}>
                <View style={vp.avatar}><Text style={{ fontSize: 24 }}>🏪</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={vp.vendorName}>{v.name}</Text>
                  {v.company && <Text style={vp.vendorSub}>{v.company}</Text>}
                </View>
                <View style={[vp.checkbox, isSel && vp.checkboxSel]}>
                  {isSel && <Text style={{ color: '#FFF', fontWeight: '900' }}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
          {selected.length > 0 ? (
            <TouchableOpacity style={vp.sendBtn} onPress={() => { onSend(selected); setSelected([]); }}>
              <Text style={vp.sendBtnText}>📨 Send to {selected.length} Vendor{selected.length > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ textAlign: 'center', color: P.textMuted, marginTop: 12, fontSize: 13 }}>Tap vendors to select</Text>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const vp = StyleSheet.create({
  header: { backgroundColor: P.teal, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 20 },
  close: { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700', width: 32 },
  title: { fontSize: 17, fontWeight: '800', color: '#FFF', flex: 1, textAlign: 'center' },
  infoBanner: { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#1E40AF' },
  infoSub: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: P.tealText, marginBottom: 10 },
  vendorCard: { backgroundColor: P.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: P.border },
  vendorCardActive: { borderColor: P.teal, borderWidth: 2 },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center' },
  vendorName: { fontSize: 15, fontWeight: '800', color: P.text },
  vendorSub: { fontSize: 12, color: P.textMuted, marginTop: 2 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: P.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: P.teal, borderColor: P.teal },
  sendBtn: { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  sendBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ visible, req, vendors, onClose, storeActions }) {
  const [showVendorPick, setShowVendorPick] = useState(false);
  if (!req) return null;

  const { adminSendQuoteRequest, adminApproveQuote, adminConfirmWorkStart, adminRequestPaymentFromResident, adminPayVendor, approveWorkStep } = storeActions;
  const stepNum = req.pendingStep ?? req._workStep ?? 0;
  const stageName = WORK_STAGES[stepNum] || `Stage ${stepNum + 1}`;

  const getAction = () => {
    switch (req.status) {
      case 'submitted':
        return { label: '📤 Send Quote Request to Vendors', color: P.teal, onPress: () => setShowVendorPick(true) };
      case 'quote_requested':
        return { label: `⏳ Waiting for vendor quotes (${req.invitedVendorIds?.length || 0} invited)`, color: P.textMuted, onPress: () => Alert.alert('Waiting', `${req.invitedVendorIds?.length || 0} vendor(s) notified.`) };
      case 'assigned':
        return { label: '⏳ Waiting for vendor quote…', color: P.textMuted, onPress: () => Alert.alert('Waiting', `${req.assignedVendorName || 'Vendor'} will submit a quote.`) };
      case 'quoted':
        return { label: `📨 Forward Quote ₹${req.quote?.amount?.toLocaleString('en-IN')} to Resident`, color: P.green, onPress: () => { adminApproveQuote(req.id); onClose(); Alert.alert('✅ Done', `Quote forwarded to ${req.residentName}.`); } };
      case 'quote_sent_to_resident':
        return { label: `⏳ Awaiting ${req.residentName}'s decision…`, color: P.textMuted, onPress: () => Alert.alert('Waiting', 'Quote sent to resident.') };
      case 'quote_rejected':
        return { label: '🔄 Re-request Quotes from Vendors', color: '#D97706', onPress: () => setShowVendorPick(true) };
      case 'quote_accepted':
        return { label: '🚀 Approve Work Start (Generate Gate OTP)', color: P.teal, onPress: () => { adminConfirmWorkStart(req.id); onClose(); Alert.alert('✅ Done', 'Gate OTP generated. Vendor is cleared to enter.'); } };
      case 'approved_to_start':
        return { label: '⏳ Vendor heading to gate…', color: P.textMuted, onPress: () => Alert.alert('Info', `${req.assignedVendorName || 'Vendor'} has gate OTP.`) };
      case 'work_in_progress':
        if (req.pendingStepApproval) {
          return { label: `✅ Approve Stage ${stepNum + 1} — "${stageName}"`, color: P.green, onPress: () => { approveWorkStep(req.id, 'Admin'); onClose(); Alert.alert('✅ Approved!', `Stage ${stepNum + 1} "${stageName}" approved.`); } };
        }
        return { label: `🔧 In Progress — Stage ${req._workStep || 0}/12`, color: '#D97706', onPress: () => Alert.alert('Info', `Stage ${req._workStep || 0}/12 complete.`) };
      case 'work_completed':
        return { label: '🏁 Work Done — Awaiting vendor payment request', color: P.textMuted, onPress: () => Alert.alert('Waiting', 'Vendor will request payment soon.') };
      case 'payment_requested_to_admin':
        return { label: '💳 Request Payment from Resident', color: '#D97706', onPress: () => { adminRequestPaymentFromResident(req.id); onClose(); Alert.alert('✅ Done', 'Payment request sent to resident.'); } };
      case 'payment_requested_to_resident':
        return { label: `⏳ Awaiting ${req.residentName}'s payment…`, color: P.textMuted, onPress: () => Alert.alert('Waiting', 'Waiting for resident to pay.') };
      case 'payment_received':
        return { label: '💸 Pay Vendor & Close Job', color: P.green, onPress: () => { adminPayVendor(req.id); onClose(); Alert.alert('✅ Job Closed!', 'Vendor has been paid.'); } };
      case 'paid_to_vendor':
        return { label: '✔️ Job Closed — Fully Paid', color: P.green, onPress: () => Alert.alert('Closed', 'Job is complete.') };
      default: return null;
    }
  };

  const action = getAction();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <View style={dm.header}>
          <TouchableOpacity onPress={onClose}><Text style={dm.close}>✕</Text></TouchableOpacity>
          <Text style={dm.title} numberOfLines={1}>{req.title}</Text>
          <StatusBadge status={req.status} />
        </View>

        <ScrollView contentContainerStyle={dm.body} showsVerticalScrollIndicator={false}>
          {action && (
            <TouchableOpacity style={[dm.actionCard, { borderColor: action.color === P.textMuted ? P.border : action.color }]} onPress={action.onPress}>
              <Text style={[dm.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          )}

          {req.vendorGateOtp && ['approved_to_start', 'work_in_progress'].includes(req.status) && (
            <View style={dm.otpCard}>
              <Text style={dm.otpTitle}>🔐 Vendor Gate OTP</Text>
              <Text style={dm.otpCode}>{req.vendorGateOtp}</Text>
              <Text style={dm.otpSub}>Vendor shows this to security guard at gate</Text>
            </View>
          )}

          {req.status === 'work_in_progress' && (
            <View style={dm.card}>
              <Text style={dm.secLabel}>WORK PROGRESS — STAGE {req._workStep || 0}/12</Text>
              <View style={{ height: 8, backgroundColor: P.tealMid, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <View style={{ height: 8, backgroundColor: P.teal, borderRadius: 4, width: `${((req._workStep || 0) / 12) * 100}%` }} />
              </View>
              <Text style={{ fontSize: 12, color: P.textMuted, marginBottom: 12 }}>
                {Math.round(((req._workStep || 0) / 12) * 100)}% complete
                {req.pendingStepApproval ? `  ·  ⏳ Stage ${stepNum + 1} "${stageName}" awaiting approval` : ''}
              </Text>
              {WORK_STAGES.map((stage, i) => {
                const done = i < (req._workStep || 0);
                const pending = req.pendingStepApproval && i === stepNum;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{
                      width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1,
                      backgroundColor: done ? P.teal : pending ? '#D97706' : '#F1F5F9',
                    }}>
                      <Text style={{ fontSize: 11, color: (done || pending) ? '#FFF' : P.textMuted, fontWeight: '800' }}>
                        {done ? '✓' : i + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: done ? '700' : '600', color: done ? P.tealText : pending ? '#D97706' : P.textMuted }}>
                        {stage}
                      </Text>
                      {pending && <Text style={{ fontSize: 11, color: '#D97706', fontWeight: '700' }}>⏳ Awaiting approval — use action card above</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={dm.card}>
            <Text style={dm.secLabel}>REQUEST DETAILS</Text>
            {[
              ['ID', req.id], ['Category', req.category], ['Priority', req.priority],
              ['Unit', req.unit], ['Resident', req.residentName], ['Submitted', fmtDate(req.createdAt)],
              req.assignedVendorName && ['Vendor', req.assignedVendorName],
              req.invitedVendorIds?.length > 0 && ['Invited', `${req.invitedVendorIds.length} vendor(s)`],
            ].filter(Boolean).map(([k, v]) => (
              <View key={k} style={dm.detailRow}>
                <Text style={dm.detailKey}>{k}</Text>
                <Text style={dm.detailVal}>{v}</Text>
              </View>
            ))}
            <Text style={[dm.secLabel, { marginTop: 12 }]}>DESCRIPTION</Text>
            <Text style={{ fontSize: 14, color: P.tealText, lineHeight: 22 }}>{req.description}</Text>
          </View>

          {req.quote && (
            <View style={dm.card}>
              <Text style={dm.secLabel}>QUOTE</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: P.green, marginBottom: 4 }}>₹{req.quote.amount?.toLocaleString('en-IN')}</Text>
              {req.quote.description && <Text style={{ fontSize: 14, color: P.tealText }}>{req.quote.description}</Text>}
              {req.quote.estimatedDays && <Text style={{ fontSize: 12, color: P.textMuted, marginTop: 4 }}>📅 {req.quote.estimatedDays} day(s)</Text>}
            </View>
          )}

          {req.timeline?.length > 0 && (
            <View style={dm.card}>
              <Text style={dm.secLabel}>TIMELINE</Text>
              {[...req.timeline].reverse().map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <View style={{ width: 14, alignItems: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: i === 0 ? P.teal : P.tealMid, marginTop: 2 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: P.text }}>{t.action}</Text>
                    {t.by && <Text style={{ fontSize: 11, color: P.textMuted }}>by {t.by}</Text>}
                    {t.at && <Text style={{ fontSize: 11, color: P.textMuted }}>{fmtDate(t.at)}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        <VendorPickerModal
          visible={showVendorPick}
          req={req}
          vendors={vendors}
          onClose={() => setShowVendorPick(false)}
          onSend={(sel) => {
            adminSendQuoteRequest(req.id, sel);
            setShowVendorPick(false);
            onClose();
            Alert.alert('✅ Sent!', `Quote request sent to ${sel.length} vendor(s): ${sel.map(v => v.name).join(', ')}.`);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const dm = StyleSheet.create({
  header: { backgroundColor: P.teal, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 20, gap: 10 },
  close: { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700', width: 32 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFF' },
  body: { padding: 14 },
  actionCard: { backgroundColor: P.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 2, alignItems: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  otpCard: { backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#7C3AED', alignItems: 'center' },
  otpTitle: { fontSize: 13, fontWeight: '800', color: '#5B21B6', marginBottom: 8 },
  otpCode: { fontSize: 32, fontWeight: '900', color: '#4C1D95', letterSpacing: 8 },
  otpSub: { fontSize: 12, color: '#7C3AED', marginTop: 6 },
  card: { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel: { fontSize: 10, fontWeight: '800', color: P.textMuted, letterSpacing: 1, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' },
  detailKey: { fontSize: 13, color: P.textMuted },
  detailVal: { fontSize: 13, fontWeight: '700', color: P.text, textAlign: 'right', flex: 1, marginLeft: 12 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdminMaintenance({ navigation }) {
  const maintenanceRequests = useAppStore(s => s.maintenanceRequests);
  const registeredUsers = useAuthStore(s => s.registeredUsers);
  const adminSendQuoteRequest = useAppStore(s => s.adminSendQuoteRequest);
  const adminApproveQuote = useAppStore(s => s.adminApproveQuote);
  const adminConfirmWorkStart = useAppStore(s => s.adminConfirmWorkStart);
  const adminRequestPaymentFromResident = useAppStore(s => s.adminRequestPaymentFromResident);
  const adminPayVendor = useAppStore(s => s.adminPayVendor);
  const approveWorkStep = useAppStore(s => s.approveWorkStep);

  const storeActions = { adminSendQuoteRequest, adminApproveQuote, adminConfirmWorkStart, adminRequestPaymentFromResident, adminPayVendor, approveWorkStep };
  const vendors = registeredUsers.filter(u => u.role === 'vendor');
 
  useEffect(() => {
    useAuthStore.getState().fetchUsers();
  }, []);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const actionCount = maintenanceRequests.filter(r => ADMIN_ACTION_STATUSES.includes(r.status)).length;
  const inProgress = maintenanceRequests.filter(r => r.status === 'work_in_progress').length;
  const resolved = maintenanceRequests.filter(r => ['work_completed', 'paid_to_vendor'].includes(r.status)).length;

  const filtered = maintenanceRequests
    .filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.unit || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.residentName || '').toLowerCase().includes(q);
      const matchFilter =
        filter === 'all' ? true :
          filter === 'action' ? ADMIN_ACTION_STATUSES.includes(r.status) :
            filter === 'pending' ? ['quote_requested', 'assigned', 'quote_sent_to_resident', 'approved_to_start'].includes(r.status) :
              filter === 'progress' ? r.status === 'work_in_progress' :
                filter === 'closed' ? ['work_completed', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor', 'quote_rejected'].includes(r.status) :
                  true;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const aA = ADMIN_ACTION_STATUSES.includes(a.status) ? 0 : 1;
      const bA = ADMIN_ACTION_STATUSES.includes(b.status) ? 0 : 1;
      if (aA !== bA) return aA - bA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <SafeAreaView style={sc.screen}>
      <StatusBar barStyle="light-content" backgroundColor={P.teal} />

      {/* Header */}
      <View style={sc.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={sc.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={sc.headerRow}>
          <View>
            <Text style={sc.headerTitle}>Maintenance</Text>
            <Text style={sc.headerSub}>{maintenanceRequests.length} total{actionCount > 0 ? ` · ⚡ ${actionCount} need action` : ''}</Text>
          </View>
        </View>
        <View style={sc.statsRow}>
          {[
            { v: maintenanceRequests.length, l: 'Total', c: '#FFF' },
            { v: actionCount, l: 'Action Needed', c: '#FDE68A' },
            { v: inProgress, l: 'In Progress', c: '#FCD34D' },
            { v: resolved, l: 'Resolved', c: '#6EE7B7' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              {i > 0 && <View style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />}
              <Text style={{ fontSize: 20, fontWeight: '900', color: s.c }}>{s.v}</Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1, textAlign: 'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={sc.searchWrap}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={sc.searchInput}
          placeholder="Search title, unit, resident, category…"
          placeholderTextColor={P.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: P.textMuted, fontSize: 16 }}>✕</Text></TouchableOpacity>}
      </View>

      {/* Filter Tabs */}
      <View style={sc.filterBar}>
        {FILTERS.map(({ k, l }) => (
          <TouchableOpacity key={k} style={[sc.filterTab, filter === k && sc.filterTabActive]} onPress={() => setFilter(k)}>
            <Text style={[sc.filterTabText, filter === k && sc.filterTabTextActive]}>
              {l}{k === 'action' && actionCount > 0 ? ` (${actionCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={sc.listPad}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RequestCard req={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <View style={sc.empty}>
            <Text style={{ fontSize: 52 }}>🔧</Text>
            <Text style={sc.emptyTitle}>No requests found</Text>
            <Text style={sc.emptySub}>{search ? 'Try a different search.' : 'No items in this view.'}</Text>
          </View>
        }
      />

      <DetailModal
        visible={!!selected}
        req={selected}
        vendors={vendors}
        onClose={() => setSelected(null)}
        storeActions={storeActions}
      />
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.teal, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border, paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: P.text, paddingVertical: 4 },
  filterBar: { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  filterTab: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  filterTabActive: { borderBottomWidth: 3, borderBottomColor: P.teal },
  filterTabText: { fontSize: 11, fontWeight: '600', color: P.textMuted },
  filterTabTextActive: { color: P.teal, fontWeight: '800' },
  listPad: { padding: 14, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: P.text },
  emptySub: { fontSize: 14, color: P.textMuted, textAlign: 'center', lineHeight: 20 },
});