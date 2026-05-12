/**
 * AMCContractsScreen.js — Vendor (Business)
 *
 * Real-world AMC / Contract workflow:
 *   Vendor proposes → Admin reviews → (approve / negotiate / reject)
 *   negotiation     → Vendor counters → Admin re-reviews
 *   approved        → active → payment installments tracked
 *   active          → renewal_due (30 days before end) → renewed / expired
 *
 * Cross-role: all state lives in adminStore.amcContracts so admin sees it instantly.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Modal, ScrollView,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Card, Badge } from '../../../vendor/components';
import { BusinessTabBar } from '../../../vendor/components/TabBars';
import useAdminStore     from '../../../store/adminStore';
import { useAuthStore }  from '../../../store/AuthStore';
import { useTheme }      from '../../../hooks/useTheme';

// ─── Constants ─────────────────────────────────────────────────────────────────
const T = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1A2E2E', sub: '#3D6E6E', muted: '#7A9E9E',
  border: '#D0EEEE', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7', danger: '#DC2626', dangerBg: '#FEE2E2',
  blue: '#1D4ED8', blueBg: '#EFF6FF', purple: '#7C3AED', purpleBg: '#F3E8FF',
};

const STATUS_CFG = {
  proposed:   { label: 'Awaiting Admin',   color: T.blue,    bg: T.blueBg    },
  negotiation:{ label: 'Negotiation',      color: T.warning, bg: T.warningBg },
  active:     { label: 'Active',           color: T.success, bg: T.successBg },
  completed:  { label: 'Completed',        color: T.muted,   bg: '#F1F5F9'   },
  rejected:   { label: 'Rejected',         color: T.danger,  bg: T.dangerBg  },
  expired:    { label: 'Expired',          color: T.muted,   bg: '#F1F5F9'   },
  renewal_due:{ label: 'Renewal Due',      color: T.warning, bg: T.warningBg },
};

const PAYMENT_OPTS  = ['monthly', 'quarterly', 'half-yearly', 'one-time'];
const CATEGORIES    = ['Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Cleaning',
                       'Pest Control', 'Security', 'IT/CCTV', 'Landscaping', 'Lift', 'Other'];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Contract Card ─────────────────────────────────────────────────────────────
function ContractCard({ contract: c, onPress, onCounter }) {
  const cfg = STATUS_CFG[c.status] || STATUS_CFG.proposed;
  const installmentPct = c.totalInstallments > 0
    ? Math.round((c.paidInstallments / c.totalInstallments) * 100) : 0;
  const daysLeft = c.endDate
    ? Math.ceil((new Date(c.endDate) - Date.now()) / 86400000) : null;
  const nearExpiry = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{c.title}</Text>
          <Text style={s.cardSub}>{c.category} · {c.type === 'AMC' ? '🔄 AMC' : '📋 Project'}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={s.metaRow}>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Duration</Text>
          <Text style={s.metaVal}>{fmt(c.startDate)} – {fmt(c.endDate)}</Text>
        </View>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Value</Text>
          <Text style={[s.metaVal, { color: T.teal, fontWeight: '800' }]}>
            ₹{Number(c.amount || 0).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Payment progress */}
      {c.status === 'active' && c.totalInstallments > 1 && (
        <View style={s.payRow}>
          <View style={s.payBarBg}>
            <View style={[s.payBarFill, { width: `${installmentPct}%` }]} />
          </View>
          <Text style={s.payText}>{c.paidInstallments}/{c.totalInstallments} installments</Text>
        </View>
      )}

      {/* Expiry warning */}
      {nearExpiry && (
        <View style={s.expiryBanner}>
          <Ionicons name="warning-outline" size={14} color={T.warning} />
          <Text style={s.expiryText}>⚠️ Expires in {daysLeft} days — request renewal</Text>
        </View>
      )}

      {/* Admin remark */}
      {(c.adminRemark || c.vendorCounter) && (
        <View style={s.remarkBox}>
          {c.adminRemark ? (
            <Text style={s.remarkText}>🏢 Admin: "{c.adminRemark}"</Text>
          ) : null}
          {c.vendorCounter ? (
            <Text style={[s.remarkText, { color: T.teal, marginTop: c.adminRemark ? 4 : 0 }]}>
              🔧 Your counter: "{c.vendorCounter}"
            </Text>
          ) : null}
        </View>
      )}

      {/* Counter action for negotiation */}
      {c.status === 'negotiation' && !c.vendorCounter && (
        <TouchableOpacity style={s.counterBtn} onPress={() => onCounter(c)} activeOpacity={0.85}>
          <Ionicons name="chatbubble-outline" size={14} color={T.teal} />
          <Text style={s.counterBtnText}>Send Counter Proposal</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ─── Propose Modal ─────────────────────────────────────────────────────────────
function ProposeModal({ visible, onClose, onSubmit, user }) {
  const [form, setForm] = useState({
    type: 'AMC', category: 'Plumbing', title: '', scope: '',
    startDate: '', endDate: '', amount: '', paymentSchedule: 'quarterly',
  });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const totalInstallments = {
    monthly: 12, quarterly: 4, 'half-yearly': 2, 'one-time': 1,
  }[form.paymentSchedule] || 1;

  const handleSubmit = () => {
    if (!form.title.trim() || !form.amount || !form.startDate || !form.endDate) {
      Alert.alert('Incomplete', 'Please fill title, amount, start and end dates.');
      return;
    }
    onSubmit({
      ...form,
      vendorId:      user?.id      || 'ven1',
      vendorName:    user?.name    || 'Bob Vendor',
      vendorCompany: user?.company || 'Fix-It Pro',
      amount:        Number(form.amount),
      totalInstallments,
    });
    setForm({ type: 'AMC', category: 'Plumbing', title: '', scope: '', startDate: '', endDate: '', amount: '', paymentSchedule: 'quarterly' });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <ScrollView style={s.modalCard} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Propose Contract</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={T.muted} />
            </TouchableOpacity>
          </View>

          {/* Type */}
          <Text style={s.fieldLabel}>Type *</Text>
          <View style={s.toggleRow}>
            {['AMC', 'project'].map(t => (
              <TouchableOpacity key={t} style={[s.toggleChip, form.type === t && s.toggleChipActive]}
                onPress={() => f('type', t)}>
                <Text style={[s.toggleText, form.type === t && s.toggleTextActive]}>
                  {t === 'AMC' ? '🔄 AMC' : '📋 Project'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={s.fieldLabel}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[s.chip, form.category === c && s.chipActive]} onPress={() => f('category', c)}>
                <Text style={[s.chipText, form.category === c && s.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {[
            { label: 'Contract Title *', key: 'title', placeholder: 'e.g. Plumbing AMC 2025-26' },
            { label: 'Scope of Work', key: 'scope', placeholder: 'What is included…', multiline: true },
            { label: 'Start Date * (YYYY-MM-DD)', key: 'startDate', placeholder: '2025-06-01' },
            { label: 'End Date * (YYYY-MM-DD)',   key: 'endDate',   placeholder: '2026-05-31' },
            { label: 'Total Contract Value (₹) *', key: 'amount', placeholder: '36000', kb: 'numeric' },
          ].map(fi => (
            <View key={fi.key} style={{ marginBottom: 14 }}>
              <Text style={s.fieldLabel}>{fi.label}</Text>
              <TextInput
                style={[s.fieldInput, fi.multiline && { height: 80, textAlignVertical: 'top' }]}
                value={form[fi.key]} onChangeText={v => f(fi.key, v)}
                placeholder={fi.placeholder} placeholderTextColor={T.muted}
                keyboardType={fi.kb || 'default'} multiline={fi.multiline}
              />
            </View>
          ))}

          {/* Payment schedule */}
          <Text style={s.fieldLabel}>Payment Schedule *</Text>
          <View style={s.toggleRow}>
            {PAYMENT_OPTS.map(p => (
              <TouchableOpacity key={p} style={[s.toggleChip, form.paymentSchedule === p && s.toggleChipActive]}
                onPress={() => f('paymentSchedule', p)}>
                <Text style={[s.toggleText, form.paymentSchedule === p && s.toggleTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {form.amount ? (
            <View style={s.amtPreview}>
              <Text style={s.amtPreviewLabel}>Per installment</Text>
              <Text style={s.amtPreviewVal}>
                ₹{Math.round(Number(form.amount) / totalInstallments).toLocaleString('en-IN')} × {totalInstallments}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="send-outline" size={18} color="#FFF" />
            <Text style={s.submitBtnText}>Submit to Admin for Approval</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Counter Modal ──────────────────────────────────────────────────────────────
function CounterModal({ visible, contract, onClose, onSend }) {
  const [text, setText] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, { maxHeight: 400 }]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Counter Proposal</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity>
          </View>
          {contract?.adminRemark ? (
            <View style={[s.remarkBox, { marginBottom: 14 }]}>
              <Text style={s.remarkText}>🏢 Admin: "{contract.adminRemark}"</Text>
            </View>
          ) : null}
          <Text style={s.fieldLabel}>Your Counter Proposal</Text>
          <TextInput
            style={[s.fieldInput, { height: 100, textAlignVertical: 'top' }]}
            value={text} onChangeText={setText}
            placeholder="e.g. We can offer ₹34,000 with 5-year warranty included…"
            placeholderTextColor={T.muted} multiline
          />
          <TouchableOpacity
            style={[s.submitBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={() => { if (text.trim()) { onSend(contract.id, text); setText(''); onClose(); }}}
            disabled={!text.trim()} activeOpacity={0.85}
          >
            <Ionicons name="send-outline" size={16} color="#FFF" />
            <Text style={s.submitBtnText}>Send Counter to Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ visible, contract: c, onClose }) {
  if (!c) return null;
  const cfg = STATUS_CFG[c.status] || STATUS_CFG.proposed;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <ScrollView style={s.modalCard} showsVerticalScrollIndicator={false}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { flex: 1, marginRight: 12 }]}>{c.title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg, alignSelf: 'flex-start', marginBottom: 16 }]}>
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>

          {[
            ['Type',              c.type === 'AMC' ? 'Annual Maintenance Contract' : 'Project'],
            ['Category',          c.category],
            ['Vendor',            `${c.vendorName} — ${c.vendorCompany}`],
            ['Contract Period',   `${fmt(c.startDate)} → ${fmt(c.endDate)}`],
            ['Total Value',       `₹${Number(c.amount || 0).toLocaleString('en-IN')}`],
            ['Payment Schedule',  c.paymentSchedule],
            ['Installments Paid', `${c.paidInstallments}/${c.totalInstallments}`],
          ].map(([k, v]) => (
            <View key={k} style={s.detailRow}>
              <Text style={s.detailLabel}>{k}</Text>
              <Text style={s.detailVal}>{v}</Text>
            </View>
          ))}

          {c.scope ? (
            <>
              <Text style={[s.fieldLabel, { marginTop: 14 }]}>Scope of Work</Text>
              <Text style={s.scopeText}>{c.scope}</Text>
            </>
          ) : null}

          {/* Timeline */}
          {(c.timeline || []).length > 0 && (
            <>
              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Timeline</Text>
              {c.timeline.map((ev, i) => {
                const last = i === c.timeline.length - 1;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ alignItems: 'center', width: 22, marginRight: 10 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: last ? T.teal : T.border, marginTop: 4 }} />
                      {!last && <View style={{ width: 2, flex: 1, backgroundColor: T.border, marginVertical: 2 }} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
                      <Text style={{ fontSize: 13, color: last ? T.text : T.muted, fontWeight: last ? '700' : '500' }}>{ev.action}</Text>
                      <Text style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{fmt(ev.at)}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function AMCContractsScreen({ navigation }) {
  const theme    = useTheme();
  const user     = useAuthStore(s => s.user);
  const contracts       = useAdminStore(s => s.amcContracts    || []);
  const proposeAMCContract = useAdminStore(s => s.proposeAMCContract);
  const vendorCounterAMC   = useAdminStore(s => s.vendorCounterAMC);

  const [tab,          setTab]          = useState('active');
  const [proposeModal, setProposeModal] = useState(false);
  const [counterModal, setCounterModal] = useState(null);  // contract
  const [detailModal,  setDetailModal]  = useState(null);  // contract

  const vendorId = user?.id || 'ven1';

  // Only show contracts belonging to this vendor
  const myContracts = contracts.filter(c => c.vendorId === vendorId);

  const tabData = useMemo(() => {
    if (tab === 'active')    return myContracts.filter(c => ['active', 'renewal_due'].includes(c.status));
    if (tab === 'pending')   return myContracts.filter(c => ['proposed', 'negotiation'].includes(c.status));
    if (tab === 'closed')    return myContracts.filter(c => ['completed', 'rejected', 'expired'].includes(c.status));
    return myContracts;
  }, [myContracts, tab]);

  const cnt = (k) => {
    if (k === 'active')  return myContracts.filter(c => ['active','renewal_due'].includes(c.status)).length;
    if (k === 'pending') return myContracts.filter(c => ['proposed','negotiation'].includes(c.status)).length;
    if (k === 'closed')  return myContracts.filter(c => ['completed','rejected','expired'].includes(c.status)).length;
    return 0;
  };

  const handlePropose = (data) => {
    proposeAMCContract(data);
    Alert.alert('✅ Submitted', 'Your contract proposal has been sent to admin for review. You\'ll be notified once approved or if changes are required.');
  };

  const handleCounter = (contractId, counterText) => {
    vendorCounterAMC(contractId, counterText);
    Alert.alert('✅ Sent', 'Your counter proposal has been sent to admin for re-review.');
  };

  // Summary stats
  const totalActive   = myContracts.filter(c => c.status === 'active').length;
  const totalValue    = myContracts.filter(c => c.status === 'active').reduce((s, c) => s + Number(c.amount || 0), 0);
  const pendingApproval = myContracts.filter(c => c.status === 'proposed').length;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>AMC / Contracts</Text>
          <Text style={s.headerSub}>{totalActive} active · ₹{totalValue.toLocaleString('en-IN')} contracted</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setProposeModal(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Active',          val: totalActive,      color: T.success, bg: T.successBg, icon: '✅' },
          { label: 'Pending Approval',val: pendingApproval,  color: T.blue,    bg: T.blueBg,    icon: '⏳' },
          { label: 'In Negotiation',  val: myContracts.filter(c=>c.status==='negotiation').length, color: T.warning, bg: T.warningBg, icon: '💬' },
        ].map(st => (
          <View key={st.label} style={[s.statCard, { backgroundColor: st.bg, borderColor: st.color + '30' }]}>
            <Text style={{ fontSize: 20 }}>{st.icon}</Text>
            <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
            <Text style={[s.statLabel, { color: st.color }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['active','Active'], ['pending','Pending'], ['closed','Closed']].map(([k,l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab===k && s.tabTextActive]}>
              {l}{cnt(k) > 0 ? ` (${cnt(k)})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tabData}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyTitle}>
              {tab === 'active'  ? 'No active contracts' :
               tab === 'pending' ? 'No pending proposals' : 'No closed contracts'}
            </Text>
            <Text style={s.emptySub}>
              {tab === 'active' ? 'Propose a new AMC or project contract to get started.' :
               tab === 'pending'? 'Proposals you submit will appear here until admin responds.' :
               'Completed and rejected contracts appear here.'}
            </Text>
            {tab !== 'closed' && (
              <TouchableOpacity style={s.proposeBtn} onPress={() => setProposeModal(true)}>
                <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                <Text style={s.proposeBtnText}>Propose Contract</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            onPress={() => setDetailModal(item)}
            onCounter={c => setCounterModal(c)}
          />
        )}
      />

      <ProposeModal
        visible={proposeModal}
        onClose={() => setProposeModal(false)}
        onSubmit={handlePropose}
        user={user}
      />

      <CounterModal
        visible={!!counterModal}
        contract={counterModal}
        onClose={() => setCounterModal(null)}
        onSend={handleCounter}
      />

      <DetailModal
        visible={!!detailModal}
        contract={detailModal}
        onClose={() => setDetailModal(null)}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  header:      { backgroundColor: T.tealDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  addBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },

  statsRow:    { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 10 },
  statCard:    { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4 },
  statVal:     { fontSize: 24, fontWeight: '900' },
  statLabel:   { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  tabRow:      { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 3, borderBottomColor: T.teal },
  tabText:     { fontSize: 13, fontWeight: '600', color: T.muted },
  tabTextActive:{ color: T.teal, fontWeight: '800' },

  card:        { backgroundColor: T.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: T.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: T.text, lineHeight: 22 },
  cardSub:     { fontSize: 12, color: T.muted, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: '800' },

  metaRow:     { flexDirection: 'row', gap: 12, backgroundColor: T.bg, borderRadius: 10, padding: 10, marginBottom: 10 },
  metaItem:    { flex: 1 },
  metaLabel:   { fontSize: 10, color: T.muted, fontWeight: '700', marginBottom: 3, textTransform: 'uppercase' },
  metaVal:     { fontSize: 13, fontWeight: '700', color: T.text },

  payRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  payBarBg:    { flex: 1, height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  payBarFill:  { height: 6, backgroundColor: T.teal, borderRadius: 3 },
  payText:     { fontSize: 11, color: T.muted, fontWeight: '600' },

  expiryBanner:{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.warningBg, borderRadius: 8, padding: 8, marginBottom: 8 },
  expiryText:  { fontSize: 12, color: T.warning, fontWeight: '700' },

  remarkBox:   { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: T.border },
  remarkText:  { fontSize: 12, color: T.sub, lineHeight: 18 },

  counterBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: T.teal, backgroundColor: '#E8F5F5' },
  counterBtnText:{ color: T.teal, fontSize: 13, fontWeight: '700' },

  empty:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: T.text, marginBottom: 8, textAlign: 'center' },
  emptySub:    { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  proposeBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.teal, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  proposeBtnText:{ color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Modals
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:   { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 18, fontWeight: '900', color: T.text },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: T.muted, marginBottom: 6 },
  fieldInput:  { borderWidth: 1.5, borderColor: T.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: T.text, marginBottom: 0 },
  toggleRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  toggleChip:  { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: T.border },
  toggleChipActive:{ backgroundColor: T.teal, borderColor: T.teal },
  toggleText:  { fontSize: 12, fontWeight: '700', color: T.muted },
  toggleTextActive:{ color: '#FFF' },
  chip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: T.border, marginRight: 6 },
  chipActive:  { backgroundColor: T.teal, borderColor: T.teal },
  chipText:    { fontSize: 12, fontWeight: '600', color: T.sub },
  chipTextActive:{ color: '#FFF' },
  amtPreview:  { backgroundColor: T.bg, borderRadius: 10, padding: 12, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amtPreviewLabel:{ fontSize: 12, color: T.muted },
  amtPreviewVal:{ fontSize: 15, fontWeight: '800', color: T.teal },
  submitBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.teal, borderRadius: 14, paddingVertical: 15, marginTop: 8 },
  submitBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Detail modal
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  detailLabel: { fontSize: 12, color: T.muted, flex: 1 },
  detailVal:   { fontSize: 13, fontWeight: '700', color: T.text, flex: 2, textAlign: 'right' },
  scopeText:   { fontSize: 13, color: T.sub, lineHeight: 20, backgroundColor: T.bg, borderRadius: 10, padding: 12 },
});
