/**
 * AMCContractsAdminScreen.js — Admin → Settings → AMC Contracts
 *
 * Admin sees all vendor AMC/project proposals and can:
 *   - Approve (sets status → active)
 *   - Negotiate (sends remark back → status: negotiation)
 *   - Reject (with reason)
 *   - Record payment installment
 *   - Renew expired contracts
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Modal, ScrollView, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAdminStore from '../../../store/adminStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1A2E2E', sub: '#3D6E6E', muted: '#7A9E9E',
  border: '#D0EEEE', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7', danger: '#DC2626', dangerBg: '#FEE2E2',
  blue: '#1D4ED8', blueBg: '#EFF6FF',
};

const STATUS_CFG = {
  proposed:   { label: 'Awaiting Review', color: P.blue,    bg: P.blueBg    },
  negotiation:{ label: 'Negotiation',     color: P.warning, bg: P.warningBg },
  active:     { label: 'Active',          color: P.success, bg: P.successBg },
  completed:  { label: 'Completed',       color: P.muted,   bg: '#F1F5F9'   },
  rejected:   { label: 'Rejected',        color: P.danger,  bg: P.dangerBg  },
  expired:    { label: 'Expired',         color: P.muted,   bg: '#F1F5F9'   },
  renewal_due:{ label: 'Renewal Due',     color: P.warning, bg: P.warningBg },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ActionModal({ visible, contract: c, onClose, onApprove, onNegotiate, onReject, onPayment, onRenew }) {
  const [remark,      setRemark]      = useState('');
  const [newEndDate,  setNewEndDate]  = useState('');
  const [actionMode,  setActionMode]  = useState(null); // 'approve'|'negotiate'|'reject'|'renew'

  if (!c) return null;
  const cfg = STATUS_CFG[c.status] || STATUS_CFG.proposed;

  const reset = () => { setRemark(''); setNewEndDate(''); setActionMode(null); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={ms.overlay}>
        <ScrollView style={ms.card} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={ms.header}>
            <Text style={ms.title} numberOfLines={2}>{c.title}</Text>
            <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color={P.muted} /></TouchableOpacity>
          </View>

          {/* Status + meta */}
          <View style={[ms.badge, { backgroundColor: cfg.bg, alignSelf: 'flex-start', marginBottom: 14 }]}>
            <Text style={[ms.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>

          {[
            ['Vendor',    `${c.vendorName} — ${c.vendorCompany}`],
            ['Category',  c.category],
            ['Type',      c.type === 'AMC' ? 'Annual Maintenance Contract' : 'Project'],
            ['Period',    `${fmt(c.startDate)} → ${fmt(c.endDate)}`],
            ['Value',     `₹${Number(c.amount||0).toLocaleString('en-IN')}`],
            ['Payment',   c.paymentSchedule],
            ['Installments', `${c.paidInstallments}/${c.totalInstallments} paid`],
          ].map(([k,v]) => (
            <View key={k} style={ms.row}>
              <Text style={ms.rowLabel}>{k}</Text>
              <Text style={ms.rowVal}>{v}</Text>
            </View>
          ))}

          {c.scope ? (
            <>
              <Text style={ms.secLabel}>Scope of Work</Text>
              <Text style={ms.scope}>{c.scope}</Text>
            </>
          ) : null}

          {/* Vendor counter during negotiation */}
          {c.vendorCounter ? (
            <View style={ms.counterBox}>
              <Text style={ms.counterTitle}>🔧 Vendor Counter Proposal</Text>
              <Text style={ms.counterText}>{c.vendorCounter}</Text>
            </View>
          ) : null}

          {/* Timeline */}
          {(c.timeline||[]).length > 0 && (
            <>
              <Text style={ms.secLabel}>Timeline</Text>
              {c.timeline.map((ev, i) => {
                const last = i === c.timeline.length - 1;
                return (
                  <View key={i} style={{ flexDirection:'row', marginBottom: last ? 16 : 0 }}>
                    <View style={{ alignItems:'center', width:18, marginRight:10 }}>
                      <View style={{ width:10, height:10, borderRadius:5, backgroundColor: last ? P.teal : P.border, marginTop:4 }} />
                      {!last && <View style={{ width:2, flex:1, backgroundColor:P.border, marginVertical:2 }} />}
                    </View>
                    <View style={{ flex:1, paddingBottom: last ? 0 : 14 }}>
                      <Text style={{ fontSize:12, color: last ? P.text : P.muted, fontWeight: last?'700':'400' }}>{ev.action}</Text>
                      <Text style={{ fontSize:11, color:P.muted, marginTop:2 }}>{fmt(ev.at)}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* Action buttons per status */}
          {['proposed','negotiation'].includes(c.status) && !actionMode && (
            <View style={{ gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[ms.btn, { backgroundColor: P.successBg, borderColor: P.success }]}
                onPress={() => setActionMode('approve')} activeOpacity={0.85}>
                <Ionicons name="checkmark-circle-outline" size={18} color={P.success} />
                <Text style={[ms.btnText, { color: P.success }]}>Approve Contract</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[ms.btn, { backgroundColor: P.warningBg, borderColor: P.warning }]}
                onPress={() => setActionMode('negotiate')} activeOpacity={0.85}>
                <Ionicons name="chatbubble-outline" size={18} color={P.warning} />
                <Text style={[ms.btnText, { color: P.warning }]}>Negotiate / Request Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[ms.btn, { backgroundColor: P.dangerBg, borderColor: P.danger }]}
                onPress={() => setActionMode('reject')} activeOpacity={0.85}>
                <Ionicons name="close-circle-outline" size={18} color={P.danger} />
                <Text style={[ms.btnText, { color: P.danger }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {c.status === 'active' && c.paidInstallments < c.totalInstallments && !actionMode && (
            <TouchableOpacity style={[ms.btn, { backgroundColor: P.successBg, borderColor: P.success }]}
              onPress={() => Alert.alert('Record Payment?',
                `Mark installment ${c.paidInstallments + 1}/${c.totalInstallments} as received?`,
                [{ text: 'Cancel', style: 'cancel' },
                 { text: 'Confirm', onPress: () => { onPayment(c.id); reset(); }}]
              )} activeOpacity={0.85}>
              <Ionicons name="card-outline" size={18} color={P.success} />
              <Text style={[ms.btnText, { color: P.success }]}>
                Record Installment {c.paidInstallments + 1}/{c.totalInstallments}
              </Text>
            </TouchableOpacity>
          )}

          {['expired','completed'].includes(c.status) && !actionMode && (
            <TouchableOpacity style={[ms.btn, { backgroundColor: P.blueBg, borderColor: P.blue }]}
              onPress={() => setActionMode('renew')} activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={18} color={P.blue} />
              <Text style={[ms.btnText, { color: P.blue }]}>Renew Contract</Text>
            </TouchableOpacity>
          )}

          {/* Remark input for approve/negotiate/reject */}
          {actionMode && actionMode !== 'renew' && (
            <>
              <Text style={[ms.secLabel, { marginTop: 16 }]}>
                {actionMode === 'approve'   ? 'Approval Note (optional)' :
                 actionMode === 'negotiate' ? 'What changes are needed? *' :
                 'Rejection Reason *'}
              </Text>
              <TextInput
                style={[ms.input, { height: 80, textAlignVertical: 'top' }]}
                value={remark} onChangeText={setRemark}
                placeholder={
                  actionMode === 'approve'   ? 'e.g. Approved. Please start from agreed date.' :
                  actionMode === 'negotiate' ? 'e.g. Please reduce amount by 10% and extend warranty.' :
                  'e.g. Budget constraints this quarter.'
                }
                placeholderTextColor={P.muted} multiline
              />
              <View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
                <TouchableOpacity style={[ms.btn, { flex:1, borderColor: P.border }]}
                  onPress={() => setActionMode(null)} activeOpacity={0.85}>
                  <Text style={[ms.btnText, { color: P.muted }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ms.btn, { flex:2,
                    backgroundColor: actionMode==='approve' ? P.successBg : actionMode==='negotiate' ? P.warningBg : P.dangerBg,
                    borderColor:     actionMode==='approve' ? P.success   : actionMode==='negotiate' ? P.warning   : P.danger,
                  }]}
                  onPress={() => {
                    if ((actionMode === 'negotiate' || actionMode === 'reject') && !remark.trim()) {
                      Alert.alert('Required', 'Please add a reason.'); return;
                    }
                    if (actionMode === 'approve')   onApprove(c.id, remark);
                    if (actionMode === 'negotiate') onNegotiate(c.id, remark);
                    if (actionMode === 'reject')    onReject(c.id, remark);
                    reset();
                  }} activeOpacity={0.85}>
                  <Text style={[ms.btnText, {
                    color: actionMode==='approve' ? P.success : actionMode==='negotiate' ? P.warning : P.danger,
                  }]}>
                    {actionMode === 'approve' ? '✓ Confirm Approval' :
                     actionMode === 'negotiate' ? '💬 Send for Negotiation' : '✕ Confirm Rejection'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {actionMode === 'renew' && (
            <>
              <Text style={[ms.secLabel, { marginTop: 16 }]}>New End Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={ms.input} value={newEndDate} onChangeText={setNewEndDate}
                placeholder="e.g. 2026-12-31" placeholderTextColor={P.muted}
              />
              <View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
                <TouchableOpacity style={[ms.btn, { flex:1, borderColor: P.border }]}
                  onPress={() => setActionMode(null)} activeOpacity={0.85}>
                  <Text style={[ms.btnText, { color: P.muted }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[ms.btn, { flex:2, backgroundColor: P.blueBg, borderColor: P.blue }]}
                  onPress={() => {
                    if (!newEndDate.trim()) { Alert.alert('Required', 'Enter new end date.'); return; }
                    onRenew(c.id, newEndDate.trim()); reset();
                  }} activeOpacity={0.85}>
                  <Text style={[ms.btnText, { color: P.blue }]}>🔄 Confirm Renewal</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  overlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  card:        { backgroundColor:'#FFF', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:'92%' },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:12 },
  title:       { fontSize:17, fontWeight:'900', color:P.text, flex:1 },
  badge:       { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeText:   { fontSize:11, fontWeight:'800' },
  row:         { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:P.border },
  rowLabel:    { fontSize:12, color:P.muted, flex:1 },
  rowVal:      { fontSize:13, fontWeight:'700', color:P.text, flex:2, textAlign:'right' },
  secLabel:    { fontSize:12, fontWeight:'800', color:P.muted, marginBottom:8, marginTop:14 },
  scope:       { fontSize:13, color:P.sub, lineHeight:20, backgroundColor:P.bg, borderRadius:10, padding:12 },
  counterBox:  { backgroundColor:'#E8F5F5', borderRadius:12, padding:12, marginTop:12, borderLeftWidth:3, borderLeftColor:P.teal },
  counterTitle:{ fontSize:12, fontWeight:'800', color:P.teal, marginBottom:6 },
  counterText: { fontSize:13, color:P.sub, lineHeight:18 },
  btn:         { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderWidth:1.5, borderRadius:14, paddingVertical:13 },
  btnText:     { fontSize:14, fontWeight:'800' },
  input:       { borderWidth:1.5, borderColor:P.border, borderRadius:12, paddingHorizontal:14, paddingVertical:11, fontSize:14, color:P.text },
});

// ─── Main Screen ────────────────────────────────────────────────────────────────
export default function AMCContractsAdminScreen({ navigation }) {
  const contracts          = useAdminStore(s => s.amcContracts     || []);
  const approveAMCContract = useAdminStore(s => s.approveAMCContract);
  const negotiateAMCContract = useAdminStore(s => s.negotiateAMCContract);
  const rejectAMCContract  = useAdminStore(s => s.rejectAMCContract);
  const recordAMCPayment   = useAdminStore(s => s.recordAMCPayment);
  const renewAMCContract   = useAdminStore(s => s.renewAMCContract);

  const [tab,    setTab]    = useState('pending');
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');

  const tabData = useMemo(() => {
    const base = contracts.filter(c =>
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    );
    if (tab === 'pending')  return base.filter(c => ['proposed','negotiation'].includes(c.status));
    if (tab === 'active')   return base.filter(c => ['active','renewal_due'].includes(c.status));
    if (tab === 'closed')   return base.filter(c => ['completed','rejected','expired'].includes(c.status));
    return base;
  }, [contracts, tab, search]);

  const cnt = (k) => {
    if (k === 'pending') return contracts.filter(c => ['proposed','negotiation'].includes(c.status)).length;
    if (k === 'active')  return contracts.filter(c => ['active','renewal_due'].includes(c.status)).length;
    if (k === 'closed')  return contracts.filter(c => ['completed','rejected','expired'].includes(c.status)).length;
    return contracts.length;
  };

  const totalValue = contracts.filter(c => c.status === 'active')
    .reduce((s, c) => s + Number(c.amount || 0), 0);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>AMC / Contracts</Text>
            <Text style={s.headerSub}>{cnt('active')} active · ₹{totalValue.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Pending Review', val: cnt('pending'), color: P.blue,    bg: P.blueBg,    icon: '⏳' },
          { label: 'Active',          val: cnt('active'),  color: P.success, bg: P.successBg, icon: '✅' },
          { label: 'Closed',          val: cnt('closed'),  color: P.muted,   bg: '#F1F5F9',   icon: '📁' },
        ].map(st => (
          <View key={st.label} style={[s.statCard, { backgroundColor: st.bg, borderColor: st.color + '30' }]}>
            <Text style={{ fontSize: 18 }}>{st.icon}</Text>
            <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
            <Text style={[s.statLabel, { color: st.color }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color={P.muted} />
        <TextInput style={s.searchInput} placeholder="Search vendor, title, category…"
          value={search} onChangeText={setSearch} placeholderTextColor={P.muted} />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['pending','Pending Review'],['active','Active'],['closed','Closed'],['all','All']].map(([k,l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab===k && s.tabTextActive]}>
              {l}{cnt(k)>0 ? ` (${cnt(k)})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tabData}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyTitle}>{tab==='pending' ? 'No pending proposals' : 'Nothing here'}</Text>
            <Text style={s.emptySub}>Vendor AMC proposals appear here for your review.</Text>
          </View>
        }
        renderItem={({ item: c }) => {
          const cfg = STATUS_CFG[c.status] || STATUS_CFG.proposed;
          const installPct = c.totalInstallments > 0 ? Math.round((c.paidInstallments/c.totalInstallments)*100) : 0;
          return (
            <TouchableOpacity style={s.card} onPress={() => setDetail(c)} activeOpacity={0.88}>
              <View style={s.cardTop}>
                <View style={{ flex:1 }}>
                  <Text style={s.cardTitle}>{c.title}</Text>
                  <Text style={s.cardSub}>{c.vendorName} · {c.category} · {c.type==='AMC'?'🔄 AMC':'📋 Project'}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={s.metaRow}>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Period</Text>
                  <Text style={s.metaVal}>{fmt(c.startDate)} – {fmt(c.endDate)}</Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Value</Text>
                  <Text style={[s.metaVal, { color: P.teal, fontWeight:'800' }]}>
                    ₹{Number(c.amount||0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              {c.status === 'active' && c.totalInstallments > 1 && (
                <View style={s.payRow}>
                  <View style={s.payBarBg}>
                    <View style={[s.payBarFill, { width: `${installPct}%` }]} />
                  </View>
                  <Text style={s.payText}>{c.paidInstallments}/{c.totalInstallments} installments</Text>
                </View>
              )}
              {c.vendorCounter && c.status === 'negotiation' && (
                <View style={s.counterChip}>
                  <Text style={s.counterChipText}>💬 Vendor sent counter — tap to review</Text>
                </View>
              )}
              <View style={s.cardFooter}>
                <Text style={s.proposedDate}>Proposed {fmt(c.proposedAt)}</Text>
                <View style={s.reviewBtn}>
                  <Text style={s.reviewBtnText}>{
                    c.status === 'proposed' || c.status === 'negotiation' ? 'Review →' : 'View →'
                  }</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <ActionModal
        visible={!!detail}
        contract={detail}
        onClose={() => setDetail(null)}
        onApprove={(id, remark) => { approveAMCContract(id, remark); Alert.alert('✅ Approved', 'Contract is now active. Vendor notified.'); }}
        onNegotiate={(id, remark) => { negotiateAMCContract(id, remark); Alert.alert('💬 Sent', 'Negotiation request sent to vendor.'); }}
        onReject={(id, remark) => { rejectAMCContract(id, remark); Alert.alert('Contract Rejected', 'Vendor notified.'); }}
        onPayment={(id) => { recordAMCPayment(id); Alert.alert('✅ Payment Recorded', 'Installment marked as received.'); }}
        onRenew={(id, newEnd) => { renewAMCContract(id, newEnd); Alert.alert('🔄 Renewed', `Contract renewed until ${newEnd}.`); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.bg },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  statsRow:    { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 10 },
  statCard:    { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4 },
  statVal:     { fontSize: 22, fontWeight: '900' },
  statLabel:   { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  searchRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: P.border, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: P.text },
  tabRow:      { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab:         { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 3, borderBottomColor: P.teal },
  tabText:     { fontSize: 11, fontWeight: '600', color: P.muted },
  tabTextActive:{ color: P.teal, fontWeight: '800' },
  card:        { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: P.text, lineHeight: 22 },
  cardSub:     { fontSize: 12, color: P.muted, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: '800' },
  metaRow:     { flexDirection: 'row', gap: 12, backgroundColor: P.bg, borderRadius: 10, padding: 10, marginBottom: 10 },
  metaItem:    { flex: 1 },
  metaLabel:   { fontSize: 10, color: P.muted, fontWeight: '700', marginBottom: 3, textTransform: 'uppercase' },
  metaVal:     { fontSize: 13, fontWeight: '700', color: P.text },
  payRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  payBarBg:    { flex: 1, height: 6, backgroundColor: P.border, borderRadius: 3, overflow: 'hidden' },
  payBarFill:  { height: 6, backgroundColor: P.teal, borderRadius: 3 },
  payText:     { fontSize: 11, color: P.muted, fontWeight: '600' },
  counterChip: { backgroundColor: '#E8F5F5', borderRadius: 8, padding: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: P.teal },
  counterChipText:{ fontSize: 12, color: P.teal, fontWeight: '700' },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: P.border, marginTop: 4 },
  proposedDate:{ fontSize: 11, color: P.muted },
  reviewBtn:   { backgroundColor: P.teal, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  reviewBtnText:{ color: '#FFF', fontSize: 12, fontWeight: '800' },
  empty:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: P.text, marginBottom: 8, textAlign: 'center' },
  emptySub:    { fontSize: 13, color: P.muted, textAlign: 'center', lineHeight: 20 },
});
