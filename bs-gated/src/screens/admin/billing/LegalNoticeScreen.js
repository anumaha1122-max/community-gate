/**
 * LegalNoticeScreen.js — Admin
 *
 * Billing → Legal Notices
 * Real workflow per scope:
 *   Day 11  → Soft reminder (auto-generated)
 *   Day 30  → Formal notice (admin action)
 *   Day 45  → Legal notice (admin action, template)
 *
 * Cross-role: notice saved in appStore → resident sees it in BillingListScreen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../../store/appStore';

const P = {
  navy: '#1A7A7A', navyDeep: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFFFFF', text: '#1E293B', sub: '#64748B',
  border: '#DBEAFE', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7', danger: '#DC2626',
  dangerBg: '#FEE2E2',
};

const NOTICE_TYPES = [
  { key: 'soft_reminder', label: 'Soft Reminder', day: 11, color: P.warning, bg: P.warningBg, icon: '📩', desc: 'Friendly reminder — Day 11 of overdue' },
  { key: 'formal_notice', label: 'Formal Notice',  day: 30, color: P.danger,  bg: P.dangerBg,  icon: '⚠️', desc: 'Formal demand notice — Day 30 of overdue' },
  { key: 'legal_notice',  label: 'Legal Notice',   day: 45, color: '#7C3AED', bg: '#F3E8FF',   icon: '⚖️', desc: 'Legal action notice — Day 45 of overdue' },
];

const TEMPLATE = {
  soft_reminder: (r, amt) => `Dear ${r.name},\n\nThis is a gentle reminder that maintenance dues of ₹${amt.toLocaleString('en-IN')} for unit ${r.unit} are outstanding as of today.\n\nKindly clear the dues at the earliest to avoid further penalties.\n\nRegards,\nSociety Management`,
  formal_notice: (r, amt) => `Dear ${r.name},\n\nDespite our earlier reminder, maintenance dues of ₹${amt.toLocaleString('en-IN')} for unit ${r.unit} remain unpaid.\n\nYou are hereby formally notified to clear all outstanding dues within 7 days of receipt of this notice, failing which further action shall be initiated.\n\nRegards,\nSociety Management`,
  legal_notice:  (r, amt) => `LEGAL NOTICE\n\nTo: ${r.name}, Unit ${r.unit}\n\nWhereas you have failed to pay maintenance dues of ₹${amt.toLocaleString('en-IN')} despite repeated reminders and formal notice, you are hereby put on notice that legal proceedings may be initiated under applicable law if payment is not made within 15 days.\n\nThis notice is without prejudice to all other rights and remedies available.\n\nFor Society Management Committee`,
};

export default function LegalNoticeScreen({ navigation }) {
  const billing = useAppStore(s => s.billing || []);
  const users   = useAppStore(s => s.users   || []);
  const legalNotices    = useAppStore(s => s.legalNotices    || []);
  const sendLegalNotice = useAppStore(s => s.sendLegalNotice);
  const resolveNotice   = useAppStore(s => s.resolveNotice);
  const getResidentBills = useAppStore(s => s.getResidentBills);

  const [tab, setTab]       = useState('overdue');   // overdue | sent
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);        // { resident, amount, noticeType }
  const [msgText, setMsgText] = useState('');

  // Build overdue list from billing store
  const adminBilling = useAppStore(s => {
    // Use adminStore bills
    return [];
  });

  // Seed overdue residents for demo
  const overdueResidents = useMemo(() => [
    { id: 'res1', name: 'John Resident',  unit: 'A-101', phone: '9876543210', overdueAmount: 4500,  overdueDays: 18 },
    { id: 'res2', name: 'Jane Resident',  unit: 'B-202', phone: '9876543211', overdueAmount: 12000, overdueDays: 35 },
    { id: 'res3', name: 'Ravi Kumar',     unit: 'C-303', phone: '9876543212', overdueAmount: 28500, overdueDays: 52 },
    { id: 'res4', name: 'Meena Patel',    unit: 'A-204', phone: '9876540001', overdueAmount: 6800,  overdueDays: 12 },
    { id: 'res5', name: 'Arjun Sharma',   unit: 'D-101', phone: '9876540002', overdueAmount: 18000, overdueDays: 40 },
  ], []);

  const getRecommendedType = (days) => {
    if (days >= 45) return 'legal_notice';
    if (days >= 30) return 'formal_notice';
    return 'soft_reminder';
  };

  const filtered = overdueResidents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.unit.toLowerCase().includes(search.toLowerCase())
  );

  const sentNotices = legalNotices.filter(n =>
    n.residentName?.toLowerCase().includes(search.toLowerCase()) ||
    n.unit?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (resident) => {
    const type = getRecommendedType(resident.overdueDays);
    const tmpl = TEMPLATE[type];
    setMsgText(tmpl(resident, resident.overdueAmount));
    setModal({ resident, amount: resident.overdueAmount, noticeType: type });
  };

  const handleSend = () => {
    if (!modal) return;
    const { resident, amount, noticeType } = modal;
    const nt = NOTICE_TYPES.find(t => t.key === noticeType);
    sendLegalNotice({
      residentId: resident.id,
      residentName: resident.name,
      unit: resident.unit,
      phone: resident.phone,
      amount,
      type: noticeType,
      typeLabel: nt?.label || noticeType,
      message: msgText,
      overdueDays: resident.overdueDays,
    });
    Alert.alert('✅ Notice Sent', `${nt?.label} sent to ${resident.name} (Unit ${resident.unit})`);
    setModal(null);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Legal Notices</Text>
            <Text style={s.headerSub}>Day 11 · 30 · 45 overdue workflow</Text>
          </View>
        </View>
      </View>

      {/* Notice type legend */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.legendScroll} contentContainerStyle={s.legendRow}>
        {NOTICE_TYPES.map(nt => (
          <View key={nt.key} style={[s.legendChip, { backgroundColor: nt.bg, borderColor: nt.color + '40' }]}>
            <Text>{nt.icon}</Text>
            <View>
              <Text style={[s.legendLabel, { color: nt.color }]}>{nt.label}</Text>
              <Text style={[s.legendDay, { color: nt.color }]}>Day {nt.day}+</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={s.tabs}>
        {['overdue', 'sent'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'overdue' ? `Overdue (${overdueResidents.length})` : `Sent (${legalNotices.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color={P.sub} />
        <TextInput
          style={s.searchInput} placeholder="Search resident or unit…"
          value={search} onChangeText={setSearch} placeholderTextColor={P.sub}
        />
      </View>

      {tab === 'overdue' ? (
        <FlatList
          data={filtered}
          keyExtractor={r => r.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: r }) => {
            const recType = getRecommendedType(r.overdueDays);
            const nt = NOTICE_TYPES.find(t => t.key === recType);
            const alreadySent = legalNotices.some(n => n.residentId === r.id && n.type === recType && n.status !== 'resolved');
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{r.name}</Text>
                    <Text style={s.cardUnit}>Unit {r.unit} · {r.phone}</Text>
                  </View>
                  <View style={[s.dayBadge, { backgroundColor: nt?.bg }]}>
                    <Text style={[s.dayBadgeText, { color: nt?.color }]}>Day {r.overdueDays}</Text>
                  </View>
                </View>
                <View style={s.cardMid}>
                  <Text style={s.amtLabel}>Overdue Amount</Text>
                  <Text style={s.amtValue}>₹{r.overdueAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.cardMid}>
                  <Text style={s.amtLabel}>Recommended Action</Text>
                  <Text style={[s.recText, { color: nt?.color }]}>{nt?.icon} {nt?.label}</Text>
                </View>
                {alreadySent ? (
                  <View style={[s.sentBadge]}>
                    <Ionicons name="checkmark-circle" size={14} color={P.success} />
                    <Text style={s.sentText}>{nt?.label} already sent</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[s.sendBtn, { backgroundColor: nt?.color }]} onPress={() => openModal(r)} activeOpacity={0.85}>
                    <Text style={s.sendBtnText}>Send {nt?.label} →</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={sentNotices}
          keyExtractor={n => n.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📭</Text>
              <Text style={s.emptyText}>No notices sent yet</Text>
            </View>
          }
          renderItem={({ item: n }) => {
            const nt = NOTICE_TYPES.find(t => t.key === n.type);
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{n.residentName}</Text>
                    <Text style={s.cardUnit}>Unit {n.unit}</Text>
                  </View>
                  <View style={[s.dayBadge, { backgroundColor: nt?.bg || P.border }]}>
                    <Text style={[s.dayBadgeText, { color: nt?.color || P.sub }]}>{nt?.label || n.typeLabel}</Text>
                  </View>
                </View>
                <Text style={s.cardUnit}>Amount: ₹{Number(n.amount || 0).toLocaleString('en-IN')}</Text>
                <Text style={s.cardUnit}>Sent: {new Date(n.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                <View style={s.statusRow}>
                  <View style={[s.statusDot, { backgroundColor: n.status === 'resolved' ? P.success : n.status === 'acknowledged' ? P.warning : P.danger }]} />
                  <Text style={s.statusText}>{n.status === 'resolved' ? 'Resolved' : n.status === 'acknowledged' ? 'Acknowledged' : 'Pending Response'}</Text>
                  {n.status !== 'resolved' && (
                    <TouchableOpacity onPress={() => resolveNotice(n.id)} style={s.resolveBtn}>
                      <Text style={s.resolveBtnText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Send Modal */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {modal ? NOTICE_TYPES.find(t => t.key === modal.noticeType)?.label : ''}
              </Text>
              <TouchableOpacity onPress={() => setModal(null)}>
                <Ionicons name="close" size={22} color={P.sub} />
              </TouchableOpacity>
            </View>

            {modal && (
              <>
                <View style={s.modalMeta}>
                  <Text style={s.modalMetaText}>To: <Text style={{ fontWeight: '800' }}>{modal.resident.name}</Text> — Unit {modal.resident.unit}</Text>
                  <Text style={s.modalMetaText}>Amount Due: <Text style={{ color: P.danger, fontWeight: '800' }}>₹{modal.amount.toLocaleString('en-IN')}</Text></Text>
                </View>

                {/* Type selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {NOTICE_TYPES.map(nt => (
                    <TouchableOpacity
                      key={nt.key}
                      style={[s.typeChip, modal.noticeType === nt.key && { backgroundColor: nt.bg, borderColor: nt.color }]}
                      onPress={() => {
                        setModal(m => ({ ...m, noticeType: nt.key }));
                        setMsgText(TEMPLATE[nt.key](modal.resident, modal.amount));
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{nt.icon}</Text>
                      <Text style={[s.typeChipText, modal.noticeType === nt.key && { color: nt.color }]}>{nt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={s.msgLabel}>Notice Content (editable)</Text>
                <TextInput
                  style={s.msgInput} value={msgText} onChangeText={setMsgText}
                  multiline numberOfLines={8} textAlignVertical="top"
                />

                <TouchableOpacity style={s.modalSendBtn} onPress={handleSend} activeOpacity={0.85}>
                  <Ionicons name="send" size={16} color="#FFF" />
                  <Text style={s.modalSendText}>Send via App + SMS</Text>
                </TouchableOpacity>
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

  legendScroll: { maxHeight: 70 },
  legendRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 10, flexDirection: 'row' },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  legendLabel: { fontSize: 12, fontWeight: '800' },
  legendDay: { fontSize: 11, fontWeight: '600' },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFF', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: P.border },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: P.navy },
  tabText: { fontSize: 13, fontWeight: '700', color: P.sub },
  tabTextActive: { color: '#FFF' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: P.border, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: P.text },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '800', color: P.text },
  cardUnit: { fontSize: 12, color: P.sub, marginTop: 2 },
  dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dayBadgeText: { fontSize: 12, fontWeight: '800' },
  cardMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  amtLabel: { fontSize: 12, color: P.sub },
  amtValue: { fontSize: 15, fontWeight: '900', color: P.danger },
  recText: { fontSize: 13, fontWeight: '700' },
  sentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  sentText: { color: P.success, fontSize: 13, fontWeight: '700' },
  sendBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  sendBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: P.sub, flex: 1 },
  resolveBtn: { backgroundColor: P.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  resolveBtnText: { color: P.success, fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: P.sub },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: P.text },
  modalMeta: { backgroundColor: P.bg, borderRadius: 12, padding: 12, marginBottom: 14, gap: 4 },
  modalMetaText: { fontSize: 13, color: P.sub },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: P.border, marginRight: 8, backgroundColor: '#FFF' },
  typeChipText: { fontSize: 12, fontWeight: '700', color: P.sub },
  msgLabel: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  msgInput: { borderWidth: 1, borderColor: P.border, borderRadius: 12, padding: 14, fontSize: 13, color: P.text, minHeight: 150, marginBottom: 16 },
  modalSendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P.navy, borderRadius: 14, paddingVertical: 14 },
  modalSendText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
