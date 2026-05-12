/**
 * ExpenseApprovalScreen.js — Admin
 *
 * Scope: Amount-based tiered approval workflow
 *   <₹5,000     → Auto approved
 *   ₹5K-25K    → Treasurer approval
 *   ₹25K-1L    → Chairman + Treasurer
 *   >₹1L       → Committee vote (3 of 5)
 *
 * Cross-role: appStore.expenseApprovals is the shared state
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Modal, ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  navy: '#1A7A7A', navyDeep: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1E293B', sub: '#64748B',
  border: '#DBEAFE', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7', danger: '#DC2626',
  dangerBg: '#FEE2E2', purple: '#7C3AED', purpleBg: '#F3E8FF',
};

const COMMITTEE = [
  { id: 'cm1', name: 'Suresh Mehta', role: 'Chairman' },
  { id: 'cm2', name: 'Priya Reddy',  role: 'Secretary' },
  { id: 'cm3', name: 'Arjun Nair',   role: 'Treasurer' },
  { id: 'cm4', name: 'Kavita Shah',  role: 'Member' },
  { id: 'cm5', name: 'Rohit Patel',  role: 'Member' },
];

function ApprovalLevelBadge({ level }) {
  const cfg = {
    auto:      { label: 'Auto',      color: P.success, bg: P.successBg },
    treasurer: { label: 'Treasurer', color: P.warning,  bg: P.warningBg },
    chairman:  { label: 'Chairman',  color: P.purple,   bg: P.purpleBg  },
    committee: { label: 'Committee', color: P.danger,   bg: P.dangerBg  },
  }[level] || { label: level, color: P.sub, bg: P.border };
  return (
    <View style={[lbs.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
      <Text style={[lbs.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const lbs = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  text:  { fontSize: 11, fontWeight: '800' },
});

export default function ExpenseApprovalScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const expenseApprovals      = useAppStore(s => s.expenseApprovals      || []);
  const submitExpenseForApproval = useAppStore(s => s.submitExpenseForApproval);
  const approveExpense        = useAppStore(s => s.approveExpense);
  const rejectExpense         = useAppStore(s => s.rejectExpense);
  const castCommitteeVote     = useAppStore(s => s.castCommitteeVote);

  const [tab, setTab]     = useState('pending');
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  // New expense form
  const [form, setForm] = useState({ title: '', category: 'Maintenance', amount: '', vendor: '', description: '' });
  const CATEGORIES = ['Maintenance', 'Electrical', 'Plumbing', 'Cleaning', 'Security', 'Garden', 'Lift', 'Pump', 'Other'];

  const pending  = expenseApprovals.filter(e => e.status === 'pending');
  const approved = expenseApprovals.filter(e => e.status === 'approved');
  const rejected = expenseApprovals.filter(e => e.status === 'rejected');

  const displayList = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  const getThreshold = (amt) => {
    if (amt < 5000)    return { level: 'auto',      label: 'Auto-approve',         color: P.success };
    if (amt < 25000)   return { level: 'treasurer',  label: 'Treasurer Approval',   color: P.warning };
    if (amt < 100000)  return { level: 'chairman',   label: 'Chairman + Treasurer',  color: P.purple  };
    return               { level: 'committee',  label: 'Committee Vote (3/5)',  color: P.danger  };
  };

  const handleSubmit = () => {
    const amt = Number(form.amount);
    if (!form.title.trim() || !amt || amt <= 0) {
      Alert.alert('Incomplete', 'Please fill title and a valid amount.');
      return;
    }
    const expense = submitExpenseForApproval({
      title: form.title, category: form.category,
      amount: amt, vendor: form.vendor,
      description: form.description,
      submittedBy: user?.name || 'Admin',
    });
    setAddModal(false);
    setForm({ title: '', category: 'Maintenance', amount: '', vendor: '', description: '' });
    const th = getThreshold(amt);
    Alert.alert(
      expense.status === 'approved' ? '✅ Auto-Approved' : '📤 Submitted',
      expense.status === 'approved'
        ? `₹${amt.toLocaleString('en-IN')} expense auto-approved (below ₹5,000 threshold).`
        : `Expense forwarded for ${th.label}.`
    );
  };

  const handleApprove = (expense) => {
    Alert.alert('Approve Expense', `Approve ₹${Number(expense.amount).toLocaleString('en-IN')} — "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => { approveExpense(expense.id, user?.name || 'Admin'); setDetailModal(null); } },
    ]);
  };

  const handleReject = (expense) => {
    Alert.prompt('Reject Expense', 'Reason for rejection:', (remark) => {
      rejectExpense(expense.id, user?.name || 'Admin', remark || '');
      setDetailModal(null);
    }, 'plain-text', '', 'default');
  };

  const handleVote = (expense, vote) => {
    const myMember = COMMITTEE.find(c => c.id === (user?.id || 'cm1')) || COMMITTEE[0];
    castCommitteeVote(expense.id, myMember.id, myMember.name, vote);
    setDetailModal(null);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Expense Approvals</Text>
            <Text style={s.headerSub}>Amount-based approval tiers</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setAddModal(true)}>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '300' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Threshold Guide */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }} contentContainerStyle={s.thresholdRow}>
        {[
          { label: '<₹5K', level: 'auto',      color: P.success },
          { label: '₹5K-25K', level: 'treasurer', color: P.warning },
          { label: '₹25K-1L', level: 'chairman',  color: P.purple  },
          { label: '>₹1L', level: 'committee', color: P.danger  },
        ].map(t => (
          <View key={t.level} style={[s.threshChip, { borderColor: t.color + '40', backgroundColor: t.color + '10' }]}>
            <Text style={[s.threshText, { color: t.color }]}>{t.label}</Text>
            <Text style={[s.threshLevel, { color: t.color }]}>{t.level}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['pending', `Pending (${pending.length})`], ['approved', `Approved (${approved.length})`], ['rejected', `Rejected (${rejected.length})`]].map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab === k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab === k && s.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayList}
        keyExtractor={e => e.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>{tab === 'pending' ? '✅' : '📋'}</Text>
            <Text style={s.emptyText}>No {tab} expenses</Text>
          </View>
        }
        renderItem={({ item: e }) => (
          <TouchableOpacity style={s.card} onPress={() => setDetailModal(e)} activeOpacity={0.88}>
            <View style={s.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{e.title}</Text>
                <Text style={s.cardCat}>{e.category} · {e.vendor || 'No vendor'}</Text>
              </View>
              <ApprovalLevelBadge level={e.approvalLevel} />
            </View>
            <View style={s.cardMid}>
              <Text style={s.amtText}>₹{Number(e.amount).toLocaleString('en-IN')}</Text>
              <View style={[s.statusDot, { backgroundColor: e.status === 'approved' ? P.success : e.status === 'rejected' ? P.danger : P.warning }]} />
              <Text style={s.cardSub}>{e.status === 'approved' ? 'Approved' : e.status === 'rejected' ? 'Rejected' : 'Pending'}</Text>
            </View>
            {e.approvalLevel === 'committee' && e.votes?.length > 0 && (
              <Text style={s.voteText}>
                Votes: {e.votes.filter(v => v.vote === 'yes').length} Yes / {e.votes.filter(v => v.vote === 'no').length} No (need 3)
              </Text>
            )}
            <Text style={s.submittedText}>Submitted {new Date(e.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} by {e.submittedBy}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add Expense Modal */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={s.modalOverlay}>
          <ScrollView style={s.modalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Expense</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
            </View>
            {[
              { label: 'Title *', key: 'title', placeholder: 'e.g. Elevator repair' },
              { label: 'Vendor / Supplier', key: 'vendor', placeholder: 'e.g. TechElev Pvt Ltd' },
              { label: 'Amount (₹) *', key: 'amount', placeholder: '0', keyboardType: 'numeric' },
              { label: 'Description', key: 'description', placeholder: 'Details…', multiline: true },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={[s.fieldInput, f.multiline && { height: 80, textAlignVertical: 'top' }]}
                  value={form[f.key]} onChangeText={v => setForm(x => ({ ...x, [f.key]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={P.sub}
                  keyboardType={f.keyboardType || 'default'} multiline={f.multiline}
                />
              </View>
            ))}
            <Text style={s.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[s.catChip, form.category === c && s.catChipActive]} onPress={() => setForm(x => ({ ...x, category: c }))}>
                  <Text style={[s.catChipText, form.category === c && s.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {form.amount ? (
              <View style={[s.previewBox, { backgroundColor: getThreshold(Number(form.amount)).color + '10', borderColor: getThreshold(Number(form.amount)).color + '30' }]}>
                <Text style={{ color: getThreshold(Number(form.amount)).color, fontWeight: '800', fontSize: 13 }}>
                  → {getThreshold(Number(form.amount)).label}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={s.submitBtnText}>Submit for Approval</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail / Action Modal */}
      <Modal visible={!!detailModal} transparent animationType="slide" onRequestClose={() => setDetailModal(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {detailModal && (
              <>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>{detailModal.title}</Text>
                  <TouchableOpacity onPress={() => setDetailModal(null)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
                </View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Amount</Text><Text style={s.detailValue}>₹{Number(detailModal.amount).toLocaleString('en-IN')}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Category</Text><Text style={s.detailValue}>{detailModal.category}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Vendor</Text><Text style={s.detailValue}>{detailModal.vendor || '—'}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Approval</Text><ApprovalLevelBadge level={detailModal.approvalLevel} /></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Status</Text><Text style={s.detailValue}>{detailModal.status}</Text></View>
                {detailModal.description ? <Text style={s.detailDesc}>{detailModal.description}</Text> : null}

                {detailModal.approvalLevel === 'committee' && detailModal.status === 'pending' && (
                  <View style={s.voteSection}>
                    <Text style={s.voteSectionTitle}>Committee Votes</Text>
                    {COMMITTEE.map(m => {
                      const myVote = (detailModal.votes || []).find(v => v.memberId === m.id);
                      return (
                        <View key={m.id} style={s.voteRow}>
                          <Text style={s.voteName}>{m.name} <Text style={s.voteRole}>({m.role})</Text></Text>
                          {myVote
                            ? <View style={[s.voteResult, { backgroundColor: myVote.vote === 'yes' ? P.successBg : P.dangerBg }]}>
                                <Text style={{ color: myVote.vote === 'yes' ? P.success : P.danger, fontWeight: '800', fontSize: 12 }}>{myVote.vote.toUpperCase()}</Text>
                              </View>
                            : <Text style={s.votePending}>Pending</Text>
                          }
                        </View>
                      );
                    })}
                    <View style={s.voteBtns}>
                      <TouchableOpacity style={[s.voteBtn, { backgroundColor: P.success }]} onPress={() => handleVote(detailModal, 'yes')} activeOpacity={0.85}>
                        <Text style={s.voteBtnText}>✅ Vote Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.voteBtn, { backgroundColor: P.danger }]} onPress={() => handleVote(detailModal, 'no')} activeOpacity={0.85}>
                        <Text style={s.voteBtnText}>❌ Vote No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {detailModal.status === 'pending' && detailModal.approvalLevel !== 'committee' && (
                  <View style={s.actionRow}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: P.danger }]} onPress={() => handleReject(detailModal)} activeOpacity={0.85}>
                      <Text style={s.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: P.success }]} onPress={() => handleApprove(detailModal)} activeOpacity={0.85}>
                      <Text style={s.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8F5F5' },
  header:    { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backText:  { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  thresholdRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  threshChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  threshText: { fontSize: 12, fontWeight: '800' },
  threshLevel: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FFF', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: P.border },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: P.navy },
  tabText: { fontSize: 11, fontWeight: '700', color: P.sub },
  tabTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: P.text },
  cardCat: { fontSize: 12, color: P.sub, marginTop: 2 },
  cardMid: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amtText: { fontSize: 18, fontWeight: '900', color: P.navy },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardSub: { fontSize: 12, color: P.sub },
  voteText: { fontSize: 12, color: P.purple, fontWeight: '700', marginTop: 6 },
  submittedText: { fontSize: 11, color: P.sub, marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: P.sub },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: P.text, flex: 1, marginRight: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: P.text },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: P.border, marginRight: 8 },
  catChipActive: { backgroundColor: P.navy, borderColor: P.navy },
  catChipText: { fontSize: 12, fontWeight: '700', color: P.sub },
  catChipTextActive: { color: '#FFF' },
  previewBox: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 14 },
  submitBtn: { backgroundColor: P.navy, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.border },
  detailLabel: { fontSize: 13, color: P.sub },
  detailValue: { fontSize: 13, fontWeight: '700', color: P.text },
  detailDesc: { fontSize: 13, color: P.sub, marginTop: 12, lineHeight: 20 },
  voteSection: { marginTop: 16 },
  voteSectionTitle: { fontSize: 14, fontWeight: '800', color: P.text, marginBottom: 10 },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: P.border },
  voteName: { fontSize: 13, color: P.text, fontWeight: '600' },
  voteRole: { color: P.sub, fontWeight: '400' },
  voteResult: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  votePending: { fontSize: 12, color: P.sub },
  voteBtns: { flexDirection: 'row', gap: 12, marginTop: 14 },
  voteBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  voteBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
