/**
 * MaterialManagementScreen.js — Builder
 *
 * Latest inclusion per scope: Material Management Software integration
 *
 * Real workflow:
 *   Builder requests material → SuperAdmin/PM approves → Order placed → Delivered to site
 *   Cross-role: uses appStore.materialRequests
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../store/appStore';
import { useAuthStore } from '../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1A2E2E', sub: '#3D6E6E',
  muted: '#7A9E9E', border: '#D0EEEE', success: '#16A34A',
  successBg: '#DCFCE7', warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#C62828', dangerBg: '#FEE2E2', blue: '#1D4ED8', blueBg: '#EFF6FF',
};

const STATUSES = {
  requested: { label: 'Requested',  color: P.warning, bg: P.warningBg, icon: '📋' },
  approved:  { label: 'Approved',   color: P.blue,    bg: P.blueBg,    icon: '✅' },
  ordered:   { label: 'Ordered',    color: P.teal,    bg: '#E8F5F5',   icon: '🛒' },
  delivered: { label: 'Delivered',  color: P.success, bg: P.successBg, icon: '📦' },
};

const CATEGORIES = ['Cement', 'Steel', 'Bricks', 'Sand', 'Electrical', 'Plumbing', 'Paint', 'Tiles', 'Wood', 'Glass', 'Other'];
const UNITS = ['kg', 'tonne', 'bags', 'pieces', 'sq.ft', 'cubic.ft', 'litre', 'bundle'];

export default function MaterialManagementScreen({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const projects = useAppStore(s => s.projects || []);
  const materialRequests   = useAppStore(s => s.materialRequests   || []);
  const addMaterialRequest  = useAppStore(s => s.addMaterialRequest);
  const approveMaterialRequest = useAppStore(s => s.approveMaterialRequest);
  const markMaterialOrdered = useAppStore(s => s.markMaterialOrdered);
  const markMaterialDelivered = useAppStore(s => s.markMaterialDelivered);

  const [tab, setTab]   = useState('all');
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);

  const [form, setForm] = useState({
    projectId: projects[0]?.id || '',
    category: 'Cement', material: '', quantity: '', unit: 'bags',
    vendor: '', requiredDate: '', notes: '',
  });

  const filtered = useMemo(() => {
    if (tab === 'all') return materialRequests;
    return materialRequests.filter(r => r.status === tab);
  }, [materialRequests, tab]);

  const handleAdd = () => {
    if (!form.material.trim() || !form.quantity) {
      Alert.alert('Incomplete', 'Please fill material name and quantity.');
      return;
    }
    addMaterialRequest({
      ...form,
      projectName: projects.find(p => p.id === form.projectId)?.name || 'Project',
      requestedBy: user?.name || 'Builder',
    });
    setModal(false);
    setForm(f => ({ ...f, material: '', quantity: '', vendor: '', notes: '' }));
    Alert.alert('✅ Requested', 'Material request submitted. Awaiting approval.');
  };

  const handleAction = (req) => {
    const actions = [];
    if (req.status === 'requested') actions.push({ text: 'Approve', onPress: () => approveMaterialRequest(req.id, user?.name || 'Builder') });
    if (req.status === 'approved')  actions.push({ text: 'Mark Ordered', onPress: () => markMaterialOrdered(req.id) });
    if (req.status === 'ordered')   actions.push({ text: 'Mark Delivered', onPress: () => markMaterialDelivered(req.id) });
    actions.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Update Status', `"${req.material}"`, actions);
  };

  const tabCounts = {
    all: materialRequests.length,
    requested: materialRequests.filter(r => r.status === 'requested').length,
    approved: materialRequests.filter(r => r.status === 'approved').length,
    ordered: materialRequests.filter(r => r.status === 'ordered').length,
    delivered: materialRequests.filter(r => r.status === 'delivered').length,
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Material Management</Text>
          <Text style={s.headerSub}>{materialRequests.length} total requests</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Summary row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 70 }} contentContainerStyle={s.summaryRow}>
        {Object.entries(STATUSES).map(([key, cfg]) => (
          <TouchableOpacity key={key} style={[s.summChip, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]} onPress={() => setTab(key)}>
            <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
            <Text style={[s.summLabel, { color: cfg.color }]}>{tabCounts[key] || 0}</Text>
            <Text style={[s.summSub, { color: cfg.color }]}>{cfg.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46 }} contentContainerStyle={s.tabRow}>
        {[['all', 'All'], ['requested', 'Requested'], ['approved', 'Approved'], ['ordered', 'Ordered'], ['delivered', 'Delivered']].map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab === k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab === k && s.tabTextActive]}>{l} ({tabCounts[k] || 0})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🏗️</Text>
            <Text style={s.emptyText}>No material requests</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setModal(true)}>
              <Text style={s.emptyBtnText}>+ Request Material</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: r }) => {
          const st2 = STATUSES[r.status] || STATUSES.requested;
          return (
            <TouchableOpacity style={s.card} onPress={() => setDetail(r)} activeOpacity={0.88}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{r.material}</Text>
                  <Text style={s.cardSub}>{r.category} · {r.projectName}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st2.bg, borderColor: st2.color + '30' }]}>
                  <Text style={[s.statusText, { color: st2.color }]}>{st2.icon} {st2.label}</Text>
                </View>
              </View>
              <View style={s.cardMid}>
                <View style={s.metaItem}>
                  <Ionicons name="cube-outline" size={14} color={P.muted} />
                  <Text style={s.metaText}>{r.quantity} {r.unit}</Text>
                </View>
                {r.vendor ? (
                  <View style={s.metaItem}>
                    <Ionicons name="business-outline" size={14} color={P.muted} />
                    <Text style={s.metaText}>{r.vendor}</Text>
                  </View>
                ) : null}
                {r.requiredDate ? (
                  <View style={s.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={P.muted} />
                    <Text style={s.metaText}>By {r.requiredDate}</Text>
                  </View>
                ) : null}
              </View>
              {r.status !== 'delivered' && (
                <TouchableOpacity style={s.actionBtn} onPress={() => handleAction(r)} activeOpacity={0.85}>
                  <Text style={s.actionText}>
                    {r.status === 'requested' ? '✅ Approve' : r.status === 'approved' ? '🛒 Mark Ordered' : '📦 Mark Delivered'}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Add Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <ScrollView style={s.modalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Request Material</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
            </View>

            {/* Project */}
            <Text style={s.label}>Project</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {projects.map(p => (
                <TouchableOpacity key={p.id} style={[s.chip, form.projectId === p.id && s.chipActive]} onPress={() => setForm(f => ({ ...f, projectId: p.id }))}>
                  <Text style={[s.chipText, form.projectId === p.id && s.chipTextActive]}>{p.name || p.projectName}</Text>
                </TouchableOpacity>
              ))}
              {projects.length === 0 && <Text style={{ color: P.muted, fontSize: 13 }}>No projects yet</Text>}
            </ScrollView>

            {/* Category */}
            <Text style={s.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[s.chip, form.category === c && s.chipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
                  <Text style={[s.chipText, form.category === c && s.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {[
              { label: 'Material Name *', key: 'material', placeholder: 'e.g. OPC 53 Cement' },
              { label: 'Vendor / Supplier', key: 'vendor', placeholder: 'e.g. ACC Cement Ltd' },
              { label: 'Required By Date', key: 'requiredDate', placeholder: 'e.g. 2026-06-15' },
              { label: 'Notes', key: 'notes', placeholder: 'Special instructions…', multiline: true },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 14 }}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput
                  style={[s.input, f.multiline && { height: 72, textAlignVertical: 'top' }]}
                  value={form[f.key]} onChangeText={v => setForm(x => ({ ...x, [f.key]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={P.muted} multiline={f.multiline}
                />
              </View>
            ))}

            {/* Quantity + Unit */}
            <View style={s.qtyRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={s.label}>Quantity *</Text>
                <TextInput
                  style={s.input} value={form.quantity}
                  onChangeText={v => setForm(f => ({ ...f, quantity: v }))}
                  placeholder="0" placeholderTextColor={P.muted} keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} style={[s.chip, form.unit === u && s.chipActive]} onPress={() => setForm(f => ({ ...f, unit: u }))}>
                      <Text style={[s.chipText, form.unit === u && s.chipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={s.submitBtnText}>Submit Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!detail} transparent animationType="fade" onRequestClose={() => setDetail(null)}>
        <View style={[s.overlay, { justifyContent: 'center' }]}>
          <View style={[s.modalCard, { borderRadius: 20, margin: 20 }]}>
            {detail && (
              <>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>{detail.material}</Text>
                  <TouchableOpacity onPress={() => setDetail(null)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
                </View>
                {[
                  ['Category', detail.category],
                  ['Project', detail.projectName],
                  ['Quantity', `${detail.quantity} ${detail.unit}`],
                  ['Vendor', detail.vendor || '—'],
                  ['Required By', detail.requiredDate || '—'],
                  ['Requested By', detail.requestedBy],
                  ['Notes', detail.notes || '—'],
                ].map(([l, v]) => (
                  <View key={l} style={s.detailRow}>
                    <Text style={s.detailLabel}>{l}</Text>
                    <Text style={s.detailValue}>{v}</Text>
                  </View>
                ))}
                <Text style={[s.label, { marginTop: 12 }]}>Timeline</Text>
                {(detail.timeline || []).map((t, i) => (
                  <View key={i} style={s.timelineRow}>
                    <View style={s.timelineDot} />
                    <Text style={s.timelineText}>{t.action} — {t.by}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.tealDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  summaryRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 10, flexDirection: 'row' },
  summChip: { padding: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center', minWidth: 72 },
  summLabel: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  summSub: { fontSize: 10, fontWeight: '700' },
  tabRow: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, flexDirection: 'row' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: P.border },
  tabActive: { backgroundColor: P.teal, borderColor: P.teal },
  tabText: { fontSize: 12, fontWeight: '700', color: P.sub },
  tabTextActive: { color: '#FFF' },
  card: { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: P.text },
  cardSub: { fontSize: 12, color: P.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardMid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: P.sub },
  actionBtn: { backgroundColor: P.teal, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 52 },
  emptyText: { fontSize: 16, color: P.sub },
  emptyBtn: { backgroundColor: P.teal, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: P.text, flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: P.text, marginBottom: 0 },
  qtyRow: { flexDirection: 'row', marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: P.border, marginRight: 8, backgroundColor: '#FFF' },
  chipActive: { backgroundColor: P.teal, borderColor: P.teal },
  chipText: { fontSize: 12, fontWeight: '700', color: P.sub },
  chipTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: P.border },
  detailLabel: { fontSize: 12, color: P.sub },
  detailValue: { fontSize: 13, fontWeight: '700', color: P.text, maxWidth: '60%', textAlign: 'right' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: P.teal },
  timelineText: { fontSize: 12, color: P.sub },
});
