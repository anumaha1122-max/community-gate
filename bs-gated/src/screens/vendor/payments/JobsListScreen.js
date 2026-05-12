/**
 * JobsListScreen.js — Vendor "My Jobs" screen
 * ✅ Rebuilt with teal #1A7A7A theme matching resident/admin screens
 * ✅ Full workflow: quote_accepted → approved_to_start → work_in_progress
 *    (with 12 stage step submission) → work_completed → payment flow
 * ✅ Inline stage submission, gate OTP display, payment request
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Alert, FlatList,
} from 'react-native';
import useAppStore     from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import { BusinessTabBar } from '../../../vendor/components/TabBars';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5', tealMid: '#D0EEEE',
  tealText: '#3D6E6E', bg: '#E8F5F5', surface: '#FFFFFF', text: '#1A2E2E',
  textMuted: '#7A9E9E', border: '#D0EEEE',
  amber: '#B45309', amberBg: '#FEF3C7', green: '#15803D', greenBg: '#DCFCE7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
};

const WORK_STAGES = [
  'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
  'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
  'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
];

const JOB_TABS = [
  { key: 'inprogress', l: '🔧 In Progress' },
  { key: 'approved',   l: '🚀 Approved' },
  { key: 'completed',  l: '✅ Completed' },
  { key: 'all',        l: 'All Jobs' },
];

const STATUS_STYLE = {
  quote_accepted:                { color: P.green,  bg: P.greenBg,  label: '✅ Accepted — Go to Gate' },
  approved_to_start:             { color: P.purple, bg: P.purpleBg, label: '🚀 Approved — Show Gate OTP' },
  work_in_progress:              { color: P.amber,  bg: P.amberBg,  label: '🔧 Work In Progress' },
  work_completed:                { color: P.teal,   bg: P.tealSoft, label: '🏁 Work Done' },
  payment_requested_to_admin:    { color: P.amber,  bg: P.amberBg,  label: '💳 Payment Requested' },
  payment_requested_to_resident: { color: P.purple, bg: P.purpleBg, label: '💳 Billing Resident' },
  payment_received:              { color: P.teal,   bg: P.tealSoft, label: '💸 Paid by Resident' },
  paid_to_vendor:                { color: P.green,  bg: P.greenBg,  label: '✔️ Paid & Closed' },
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Work Stage Progress Stepper ─────────────────────────────────────────────
function WorkStepper({ step, pendingStep, pendingApproval }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        {WORK_STAGES.map((stage, i) => {
          const done   = i < step;
          const active = pendingApproval ? i === pendingStep : i === step;
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', width: 62 }}>
                <View style={[ws.dot,
                  done   && ws.dotDone,
                  active && (pendingApproval ? ws.dotPending : ws.dotActive),
                ]}>
                  <Text style={{ fontSize: 10 }}>{done ? '✓' : pendingApproval && active ? '⏳' : (i + 1).toString()}</Text>
                </View>
                <Text style={[ws.label,
                  done   && { color: P.tealDark },
                  active && { color: pendingApproval ? P.amber : P.teal, fontWeight: '800' },
                ]} numberOfLines={2}>{stage}</Text>
              </View>
              {i < WORK_STAGES.length - 1 && (
                <View style={[ws.line, done && ws.lineDone]} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const ws = StyleSheet.create({
  dot:        { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: P.tealMid, marginBottom: 4 },
  dotDone:    { backgroundColor: P.tealDark, borderColor: P.tealDark },
  dotActive:  { backgroundColor: P.teal, borderColor: P.teal, transform: [{ scale: 1.1 }] },
  dotPending: { backgroundColor: P.amberBg, borderColor: P.amber },
  label:      { fontSize: 8, color: P.textMuted, textAlign: 'center', fontWeight: '600', maxWidth: 60 },
  line:       { width: 16, height: 2, backgroundColor: P.tealMid, marginBottom: 16 },
  lineDone:   { backgroundColor: P.tealDark },
});

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onPress }) {
  const ss = STATUS_STYLE[job.status] || { color: P.textMuted, bg: '#F5F5F5', label: job.status };
  const step = job._workStep || 0;
  const pct  = Math.round((step / 12) * 100);

  return (
    <TouchableOpacity style={jc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={jc.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={jc.title} numberOfLines={1}>{job.title || job.category}</Text>
          <Text style={jc.sub}>{job.residentName} · Unit {job.unit}</Text>
        </View>
        <View style={[jc.badge, { backgroundColor: ss.bg }]}>
          <Text style={[jc.badgeText, { color: ss.color }]}>{ss.label}</Text>
        </View>
      </View>

      <View style={jc.metaRow}>
        <Text style={jc.meta}>{job.category}</Text>
        <Text style={jc.meta}>{fmtDate(job.createdAt)}</Text>
        {job.quote?.amount && <Text style={[jc.meta, { color: P.green, fontWeight: '800' }]}>₹{job.quote.amount.toLocaleString('en-IN')}</Text>}
      </View>

      {/* Gate OTP banner */}
      {job.status === 'approved_to_start' && job.vendorGateOtp && (
        <View style={jc.otpBanner}>
          <Text style={jc.otpLabel}>🔐 Gate OTP</Text>
          <Text style={jc.otpCode}>{job.vendorGateOtp}</Text>
          <Text style={jc.otpHint}>Show to security guard at gate</Text>
        </View>
      )}

      {/* Work progress bar */}
      {job.status === 'work_in_progress' && (
        <View style={{ marginTop: 8 }}>
          <View style={jc.progressBg}>
            <View style={[jc.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={jc.progressLabel}>
            Stage {step}/12 · {pct}%
            {job.pendingStepApproval ? `  ·  ⏳ Awaiting approval for stage ${(job.pendingStep ?? 0) + 1}` : `  ·  📋 Submit stage ${step + 1}`}
          </Text>
        </View>
      )}

      <Text style={jc.tapHint}>Tap to manage →</Text>
    </TouchableOpacity>
  );
}

const jc = StyleSheet.create({
  card:         { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, shadowColor: P.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  topRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  title:        { fontSize: 15, fontWeight: '800', color: P.text, flex: 1 },
  sub:          { fontSize: 12, color: P.textMuted, marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 10, fontWeight: '800' },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' },
  meta:         { fontSize: 12, color: P.textMuted },
  otpBanner:    { backgroundColor: '#E8F5F5', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 2, borderColor: P.teal, alignItems: 'center' },
  otpLabel:     { fontSize: 11, fontWeight: '700', color: P.purple, marginBottom: 4 },
  otpCode:      { fontSize: 28, fontWeight: '900', color: '#4C1D95', letterSpacing: 6 },
  otpHint:      { fontSize: 10, color: P.purple, marginTop: 4 },
  progressBg:   { height: 6, backgroundColor: P.tealMid, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: P.teal, borderRadius: 3 },
  progressLabel:{ fontSize: 11, color: P.tealText, fontWeight: '600' },
  tapHint:      { fontSize: 11, color: P.tealMid, textAlign: 'right', marginTop: 6, fontWeight: '600' },
});

// ─── Detail Sheet Modal ────────────────────────────────────────────────────────
function JobDetailModal({ job, onClose }) {
  const vendorRequestStepApproval = useAppStore(s => s.vendorRequestStepApproval);
  const vendorRequestPayment      = useAppStore(s => s.vendorRequestPayment);
  const liveJob = useAppStore(s => s.maintenanceRequests.find(r => r.id === job?.id)) || job;

  if (!liveJob) return null;

  const step           = liveJob._workStep || 0;
  const pct            = Math.round((step / 12) * 100);
  const pendingApproval = liveJob.pendingStepApproval === true;
  const pendingStepNum  = liveJob.pendingStep ?? step;
  const pendingStageName = WORK_STAGES[pendingStepNum] || `Stage ${pendingStepNum + 1}`;

  return (
    <Modal visible={!!job} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        {/* Header */}
        <View style={md.header}>
          <TouchableOpacity onPress={onClose}><Text style={md.close}>✕</Text></TouchableOpacity>
          <Text style={md.title} numberOfLines={1}>{liveJob.title || liveJob.category}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={md.body} showsVerticalScrollIndicator={false}>
          {/* Gate OTP */}
          {['approved_to_start', 'work_in_progress'].includes(liveJob.status) && liveJob.vendorGateOtp && (
            <View style={md.otpCard}>
              <Text style={md.otpTitle}>🔐 Your Gate Entry OTP</Text>
              <Text style={md.otpCode}>{liveJob.vendorGateOtp}</Text>
              <Text style={md.otpSub}>Show this to the security guard at the main gate to enter</Text>
            </View>
          )}

          {/* quote_accepted — waiting for admin */}
          {liveJob.status === 'quote_accepted' && (
            <View style={[md.infoCard, { borderColor: P.green }]}>
              <Text style={md.infoTitle}>✅ Quote Accepted by Resident</Text>
              <Text style={md.infoSub}>Waiting for admin to approve work start and generate your gate OTP. You'll be notified.</Text>
            </View>
          )}

          {/* Work stages */}
          {liveJob.status === 'work_in_progress' && (
            <View style={md.card}>
              <Text style={md.secLabel}>WORK PROGRESS — {step}/12 STAGES COMPLETE</Text>
              <View style={{ height: 8, backgroundColor: P.tealMid, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <View style={{ height: 8, backgroundColor: P.teal, borderRadius: 4, width: `${pct}%` }} />
              </View>
              <Text style={{ fontSize: 12, color: P.tealText, fontWeight: '600', marginBottom: 12 }}>{pct}% complete</Text>

              <WorkStepper step={step} pendingStep={pendingStepNum} pendingApproval={pendingApproval} />

              {pendingApproval ? (
                <View style={md.waitCard}>
                  <Text style={md.waitTitle}>⏳ Awaiting Approval</Text>
                  <Text style={md.waitSub}>Stage {pendingStepNum + 1} "{pendingStageName}" submitted. Waiting for admin or resident to approve before you continue.</Text>
                </View>
              ) : step < 12 ? (
                <TouchableOpacity
                  style={md.stageBtn}
                  onPress={() => {
                    vendorRequestStepApproval(liveJob.id);
                    Alert.alert('📋 Submitted', `Stage ${step + 1} "${WORK_STAGES[step] || ''}" submitted for approval. Admin/resident will be notified.`);
                  }}
                >
                  <Text style={md.stageBtnText}>📋 Submit Stage {step + 1} — "{WORK_STAGES[step] || ''}" for Approval</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* work_completed — request payment */}
          {liveJob.status === 'work_completed' && (
            <View style={md.card}>
              <Text style={md.secLabel}>WORK COMPLETE</Text>
              <Text style={{ fontSize: 14, color: P.tealText, marginBottom: 16 }}>All 12 stages done! Request payment from admin to get paid.</Text>
              <TouchableOpacity
                style={[md.stageBtn, { backgroundColor: P.green }]}
                onPress={() => { vendorRequestPayment(liveJob.id); onClose(); Alert.alert('💰 Done', 'Payment request sent to admin.'); }}
              >
                <Text style={md.stageBtnText}>💰 Request Payment from Admin</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* payment states */}
          {['payment_requested_to_admin', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor'].includes(liveJob.status) && (
            <View style={[md.infoCard, { borderColor: P.green }]}>
              <Text style={md.infoTitle}>
                {liveJob.status === 'paid_to_vendor'             ? '✔️ Paid & Job Closed!' :
                 liveJob.status === 'payment_received'           ? '💸 Resident Paid — Admin will transfer shortly' :
                 liveJob.status === 'payment_requested_to_resident' ? '⏳ Billing resident, awaiting payment' :
                 '⏳ Payment request sent to admin'}
              </Text>
              <Text style={md.infoSub}>Amount: ₹{liveJob.quote?.amount?.toLocaleString('en-IN')}</Text>
            </View>
          )}

          {/* Job Details */}
          <View style={md.card}>
            <Text style={md.secLabel}>JOB DETAILS</Text>
            {[
              ['ID',         liveJob.id],
              ['Category',   liveJob.category],
              ['Priority',   liveJob.priority],
              ['Unit',       liveJob.unit],
              ['Resident',   liveJob.residentName],
              ['Submitted',  fmtDate(liveJob.createdAt)],
              liveJob.quote?.amount && ['Quote',   `₹${liveJob.quote.amount.toLocaleString('en-IN')}`],
              liveJob.quote?.estimatedDays && ['ETA', `${liveJob.quote.estimatedDays} day(s)`],
            ].filter(Boolean).map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' }}>
                <Text style={{ fontSize: 13, color: P.textMuted }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: P.text }}>{v}</Text>
              </View>
            ))}
            {liveJob.description && (
              <>
                <Text style={[md.secLabel, { marginTop: 12 }]}>DESCRIPTION</Text>
                <Text style={{ fontSize: 14, color: P.tealText, lineHeight: 22 }}>{liveJob.description}</Text>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const md = StyleSheet.create({
  header:     { backgroundColor: P.teal, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 20, gap: 10 },
  close:      { fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: '700', width: 32 },
  title:      { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFF' },
  body:       { padding: 14 },
  otpCard:    { backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#7C3AED', alignItems: 'center' },
  otpTitle:   { fontSize: 14, fontWeight: '800', color: '#5B21B6', marginBottom: 8 },
  otpCode:    { fontSize: 36, fontWeight: '900', color: '#4C1D95', letterSpacing: 8 },
  otpSub:     { fontSize: 12, color: '#7C3AED', marginTop: 6, textAlign: 'center' },
  infoCard:   { backgroundColor: P.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 2 },
  infoTitle:  { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 4 },
  infoSub:    { fontSize: 13, color: P.tealText, lineHeight: 20 },
  card:       { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel:   { fontSize: 10, fontWeight: '800', color: P.textMuted, letterSpacing: 1, marginBottom: 10 },
  waitCard:   { backgroundColor: P.amberBg, borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FDE68A' },
  waitTitle:  { fontSize: 14, fontWeight: '800', color: P.amber, marginBottom: 4 },
  waitSub:    { fontSize: 13, color: P.amber, lineHeight: 19 },
  stageBtn:   { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  stageBtnText:{ color: '#FFF', fontWeight: '800', fontSize: 14 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobsListScreen({ navigation }) {
  const authUser = useAuthStore(s => s.user);
  const requests = useAppStore(s => s.maintenanceRequests);
  const users    = useAppStore(s => s.users);

  const [activeTab, setActiveTab] = useState('inprogress');
  const [selectedJob, setSelectedJob] = useState(null);

  const vendorUser = users.find(u => u.role === 'vendor' && u.id === authUser?.id)
    || users.find(u => u.role === 'vendor');

  const jobs = requests.filter(r =>
    r.assignedVendorId === vendorUser?.id &&
    ['quote_accepted', 'approved_to_start', 'work_in_progress', 'work_completed',
     'payment_requested_to_admin', 'payment_requested_to_resident',
     'payment_received', 'paid_to_vendor'].includes(r.status)
  );

  const filtered = jobs.filter(j => {
    if (activeTab === 'inprogress') return ['work_in_progress', 'approved_to_start'].includes(j.status);
    if (activeTab === 'approved')   return ['quote_accepted', 'approved_to_start'].includes(j.status);
    if (activeTab === 'completed')  return ['work_completed', 'payment_requested_to_admin', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor'].includes(j.status);
    return true; // all
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tabsWithCounts = JOB_TABS.map(t => ({
    ...t,
    count: jobs.filter(j => {
      if (t.key === 'inprogress') return ['work_in_progress', 'approved_to_start'].includes(j.status);
      if (t.key === 'approved')   return ['quote_accepted', 'approved_to_start'].includes(j.status);
      if (t.key === 'completed')  return ['work_completed', 'payment_requested_to_admin', 'payment_requested_to_resident', 'payment_received', 'paid_to_vendor'].includes(j.status);
      return true;
    }).length,
  }));

  const totalEarnings = jobs.filter(j => j.status === 'paid_to_vendor').reduce((s, j) => s + (j.quote?.amount || 0), 0);

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
            <Text style={sc.headerTitle}>My Jobs</Text>
            <Text style={sc.headerSub}>{jobs.length} total · ₹{totalEarnings.toLocaleString('en-IN')} earned</Text>
          </View>
        </View>
        {/* Stats */}
        <View style={sc.statsRow}>
          {[
            { v: jobs.filter(j => j.status === 'work_in_progress').length, l: 'In Progress', c: '#FCD34D' },
            { v: jobs.filter(j => ['quote_accepted', 'approved_to_start'].includes(j.status)).length, l: 'Approved', c: '#A5B4FC' },
            { v: jobs.filter(j => j.status === 'paid_to_vendor').length, l: 'Completed', c: '#6EE7B7' },
            { v: jobs.filter(j => j.status === 'work_in_progress' && j.pendingStepApproval).length, l: 'Awaiting Appvl', c: '#FDE68A' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              {i > 0 && <View style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />}
              <Text style={{ fontSize: 20, fontWeight: '900', color: s.c }}>{s.v}</Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1, textAlign: 'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={sc.tabScroll} contentContainerStyle={sc.tabRow}>
        {tabsWithCounts.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[sc.tab, activeTab === t.key && sc.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[sc.tabText, activeTab === t.key && sc.tabTextActive]}>
              {t.l} ({t.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      <FlatList
        data={filtered}
        keyExtractor={j => j.id}
        contentContainerStyle={sc.listPad}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <JobCard job={item} onPress={() => setSelectedJob(item)} />}
        ListEmptyComponent={
          <View style={sc.empty}>
            <Text style={{ fontSize: 52 }}>🗂️</Text>
            <Text style={sc.emptyTitle}>No jobs here</Text>
            <Text style={sc.emptySub}>
              {activeTab === 'inprogress' ? 'No active jobs. Check Requests for incoming work.' :
               activeTab === 'approved'   ? 'No approved jobs awaiting gate entry.' :
               'No completed jobs yet.'}
            </Text>
          </View>
        }
      />

      <BusinessTabBar
        activeTab="Jobs"
        onTabPress={(tab) => {
          if (tab === 'Home')     navigation.navigate('BusinessHome');
          if (tab === 'Requests') navigation.navigate('RequestList');
          if (tab === 'Earnings') navigation.navigate('Earnings');
          if (tab === 'Profile')  navigation.navigate('VendorProfile');
        }}
      />

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: P.bg },
  header:       { backgroundColor: P.teal, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  statsRow:     { flexDirection: 'row', alignItems: 'center' },
  tabScroll:    { backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border, maxHeight: 50 },
  tabRow:       { flexDirection: 'row', gap: 0, paddingHorizontal: 4, alignItems: 'center' },
  tab:          { paddingHorizontal: 14, paddingVertical: 14 },
  tabActive:    { borderBottomWidth: 3, borderBottomColor: P.teal },
  tabText:      { fontSize: 12, fontWeight: '600', color: P.textMuted },
  tabTextActive:{ color: P.teal, fontWeight: '800' },
  listPad:      { padding: 14, paddingBottom: 100 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyTitle:   { fontSize: 17, fontWeight: '800', color: P.text },
  emptySub:     { fontSize: 14, color: P.textMuted, textAlign: 'center', lineHeight: 20 },
});