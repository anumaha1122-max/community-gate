/**
 * FranchiseManagementScreen.js — SuperAdmin
 *
 * Scope: Franchise Management — master admin portal
 * - Create franchise regions/cities
 * - Assign builders and admins to franchises
 * - View franchise-wise analytics (societies, revenue)
 * - Multi-city support
 */

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../store/appStore';

const P = {
  navy: '#1E3A8A', navyDeep: '#172554', bg: '#F0F4FF',
  surface: '#FFF', text: '#1E293B', sub: '#64748B',
  border: '#DBEAFE', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7', gold: '#D97706',
  purple: '#7C3AED', purpleBg: '#F3E8FF',
};

const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

export default function FranchiseManagementScreen({ navigation }) {
  const franchises     = useAppStore(s => s.franchises     || []);
  const createFranchise = useAppStore(s => s.createFranchise);
  const assignToFranchise = useAppStore(s => s.assignToFranchise);
  const builderRequests = useAppStore(s => s.builderRequests || []);

  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: '', city: 'Hyderabad', contactPerson: '', phone: '', email: '' });

  const approvedBuilders = builderRequests.filter(b => b.status === 'approved');

  const handleCreate = () => {
    if (!form.name.trim() || !form.city) {
      Alert.alert('Incomplete', 'Franchise name and city are required.');
      return;
    }
    createFranchise({ ...form });
    setModal(false);
    setForm({ name: '', city: 'Hyderabad', contactPerson: '', phone: '', email: '' });
    Alert.alert('✅ Franchise Created', `"${form.name}" franchise created for ${form.city}.`);
  };

  const handleAssignBuilder = (franchise) => {
    if (approvedBuilders.length === 0) {
      Alert.alert('No Builders', 'No approved builders available to assign.');
      return;
    }
    const options = approvedBuilders
      .filter(b => !franchise.assignedBuilders.includes(b.id))
      .map(b => ({
        text: b.companyName || b.email,
        onPress: () => {
          assignToFranchise(franchise.id, b.id, 'builder');
          Alert.alert('✅ Assigned', `Builder assigned to ${franchise.name} franchise.`);
        },
      }));
    if (options.length === 0) {
      Alert.alert('All Assigned', 'All approved builders are already in this franchise.');
      return;
    }
    Alert.alert('Assign Builder', 'Select a builder to assign:', [...options, { text: 'Cancel', style: 'cancel' }]);
  };

  const stats = {
    total: franchises.length,
    active: franchises.filter(f => f.status === 'active').length,
    totalBuilders: franchises.reduce((s, f) => s + (f.assignedBuilders?.length || 0), 0),
    cities: [...new Set(franchises.map(f => f.city))].length,
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDeep} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Franchise Management</Text>
          <Text style={s.headerSub}>Multi-city franchise network</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Total', value: stats.total, icon: '🏢', color: P.navy },
          { label: 'Active', value: stats.active, icon: '✅', color: P.success },
          { label: 'Cities', value: stats.cities, icon: '🌆', color: P.purple },
          { label: 'Builders', value: stats.totalBuilders, icon: '🏗️', color: P.gold },
        ].map(st => (
          <View key={st.label} style={s.statCard}>
            <Text style={s.statEmoji}>{st.icon}</Text>
            <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={franchises}
        keyExtractor={f => f.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🏢</Text>
            <Text style={s.emptyTitle}>No Franchises Yet</Text>
            <Text style={s.emptySub}>Create city-wise franchise offices to manage your builder network.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setModal(true)}>
              <Text style={s.emptyBtnText}>+ Create Franchise</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: f }) => (
          <TouchableOpacity style={s.card} onPress={() => setDetail(f)} activeOpacity={0.88}>
            <View style={s.cardTop}>
              <View style={s.cardIcon}>
                <Text style={{ fontSize: 24 }}>🏢</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{f.name}</Text>
                <Text style={s.cardCity}>
                  <Ionicons name="location-outline" size={12} color={P.sub} /> {f.city}
                </Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: f.status === 'active' ? P.successBg : P.warningBg }]}>
                <Text style={[s.statusText, { color: f.status === 'active' ? P.success : P.warning }]}>
                  {f.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={s.cardStats}>
              <View style={s.miniStat}>
                <Text style={s.miniVal}>{f.assignedBuilders?.length || 0}</Text>
                <Text style={s.miniLabel}>Builders</Text>
              </View>
              <View style={s.miniStat}>
                <Text style={s.miniVal}>{f.assignedAdmins?.length || 0}</Text>
                <Text style={s.miniLabel}>Admins</Text>
              </View>
              {f.contactPerson ? (
                <View style={[s.miniStat, { flex: 2 }]}>
                  <Text style={s.miniVal} numberOfLines={1}>{f.contactPerson}</Text>
                  <Text style={s.miniLabel}>Contact</Text>
                </View>
              ) : null}
            </View>
            <View style={s.cardActions}>
              <TouchableOpacity style={s.assignBtn} onPress={() => handleAssignBuilder(f)} activeOpacity={0.85}>
                <Ionicons name="person-add-outline" size={14} color={P.navy} />
                <Text style={s.assignText}>Assign Builder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.detailBtn} onPress={() => setDetail(f)} activeOpacity={0.85}>
                <Text style={s.detailText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Create Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <ScrollView style={s.modalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Franchise</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
            </View>

            {[
              { label: 'Franchise Name *', key: 'name', placeholder: 'e.g. GoldenRich Hyderabad' },
              { label: 'Contact Person', key: 'contactPerson', placeholder: 'e.g. Ramesh Kumar' },
              { label: 'Phone', key: 'phone', placeholder: '9876543210', keyboardType: 'phone-pad' },
              { label: 'Email', key: 'email', placeholder: 'franchise@goldenrich.in', keyboardType: 'email-address' },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.fieldInput} value={form[f.key]}
                  onChangeText={v => setForm(x => ({ ...x, [f.key]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={P.sub}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}

            <Text style={s.fieldLabel}>City *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CITIES.map(c => (
                <TouchableOpacity key={c} style={[s.cityChip, form.city === c && s.cityChipActive]} onPress={() => setForm(f => ({ ...f, city: c }))}>
                  <Text style={[s.cityText, form.city === c && s.cityTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.createBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={s.createBtnText}>Create Franchise</Text>
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
                  <Text style={s.modalTitle}>{detail.name}</Text>
                  <TouchableOpacity onPress={() => setDetail(null)}><Ionicons name="close" size={22} color={P.sub} /></TouchableOpacity>
                </View>
                {[
                  ['City', detail.city],
                  ['Contact', detail.contactPerson || '—'],
                  ['Phone', detail.phone || '—'],
                  ['Email', detail.email || '—'],
                  ['Status', detail.status],
                  ['Created', new Date(detail.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                ].map(([l, v]) => (
                  <View key={l} style={s.detailRow}>
                    <Text style={s.detailLabel}>{l}</Text>
                    <Text style={s.detailValue}>{v}</Text>
                  </View>
                ))}
                <Text style={[s.fieldLabel, { marginTop: 16 }]}>Assigned Builders ({detail.assignedBuilders?.length || 0})</Text>
                {(detail.assignedBuilders || []).length === 0
                  ? <Text style={{ color: P.sub, fontSize: 13 }}>None assigned yet</Text>
                  : (detail.assignedBuilders || []).map(id => {
                      const b = builderRequests.find(r => r.id === id);
                      return <Text key={id} style={s.listItem}>• {b?.companyName || id}</Text>;
                    })
                }
                <TouchableOpacity style={s.createBtn} onPress={() => { setDetail(null); handleAssignBuilder(detail); }}>
                  <Text style={s.createBtnText}>+ Assign Builder</Text>
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
  root: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.navyDeep, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: P.surface, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: P.border, elevation: 2 },
  statEmoji: { fontSize: 22 },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: P.sub, fontWeight: '600' },
  card: { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: P.bg, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 16, fontWeight: '900', color: P.text },
  cardCity: { fontSize: 12, color: P.sub, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '800' },
  cardStats: { flexDirection: 'row', gap: 12, backgroundColor: P.bg, borderRadius: 12, padding: 10, marginBottom: 14 },
  miniStat: { flex: 1, alignItems: 'center' },
  miniVal: { fontSize: 16, fontWeight: '900', color: P.text },
  miniLabel: { fontSize: 10, color: P.sub, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10 },
  assignBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: P.navy, backgroundColor: '#EFF6FF' },
  assignText: { color: P.navy, fontSize: 13, fontWeight: '700' },
  detailBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 10, backgroundColor: P.navy },
  detailText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: P.text },
  emptySub: { fontSize: 14, color: P.sub, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { backgroundColor: P.navy, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: P.text, flex: 1 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: P.text, marginBottom: 0 },
  cityChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: P.border, marginRight: 8, backgroundColor: '#FFF' },
  cityChipActive: { backgroundColor: P.navy, borderColor: P.navy },
  cityText: { fontSize: 12, fontWeight: '700', color: P.sub },
  cityTextActive: { color: '#FFF' },
  createBtn: { backgroundColor: P.navy, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 30 },
  createBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.border },
  detailLabel: { fontSize: 12, color: P.sub },
  detailValue: { fontSize: 13, fontWeight: '700', color: P.text },
  listItem: { fontSize: 13, color: P.text, paddingVertical: 4 },
});
