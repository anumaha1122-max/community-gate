import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

const P = {
  teal:'#1A7A7A', tealDeep:'#1A7A7A', tealSoft:'#E8F5F5', tealMid:'#D0EEEE',
  tealText:'#3D6E6E', bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', textSub:'#3D6E6E', border:'#D0EEEE',
  danger:'#C62828', warning:'#E65100', success:'#1A7A7A',
};

const KYC_COLOR = { verified: P.success, pending: P.warning, rejected: P.danger };
const KYC_LABEL = { verified: 'KYC ✓', pending: 'KYC Pending', rejected: 'KYC ✗' };

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'pending',  label: 'KYC Pending' },
  { key: 'verified', label: 'KYC Verified' },
];

export default function ResidentListScreen({ navigation }) {
  const residents    = useAdminStore(s => s.residents);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = residents.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.unit.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'active' && r.active) ||
      (filter === 'inactive' && !r.active) ||
      filter === r.kycStatus;
    return matchSearch && matchFilter;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[s.card, !item.active && s.inactiveCard]}
      onPress={() => navigation.navigate('ResidentDetail', { resident: item })}
      activeOpacity={0.85}
    >
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={s.name}>{item.name}</Text>
          {!item.active && (
            <View style={s.inactivePill}><Text style={s.inactivePillText}>Inactive</Text></View>
          )}
        </View>
        <Text style={s.unit}>🏠 Unit {item.unit}</Text>
        <Text style={s.phone}>📱 {item.phone}</Text>
      </View>
      <View style={[s.kycBadge, { backgroundColor: KYC_COLOR[item.kycStatus] + '20' }]}>
        <Text style={[s.kycText, { color: KYC_COLOR[item.kycStatus] }]}>{KYC_LABEL[item.kycStatus]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Residents ({residents.length})</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddResident')}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={s.body}>
        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search name or unit..."
            placeholderTextColor={P.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[s.chip, filter === f.key && s.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.chipText, filter === f.key && s.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statPill}>
            <Text style={s.statVal}>{residents.filter(r => r.active).length}</Text>
            <Text style={s.statLab}>Active</Text>
          </View>
          <View style={s.statPill}>
            <Text style={[s.statVal, { color: P.warning }]}>{residents.filter(r => r.kycStatus === 'pending').length}</Text>
            <Text style={s.statLab}>KYC Pending</Text>
          </View>
          <View style={s.statPill}>
            <Text style={[s.statVal, { color: P.danger }]}>{residents.filter(r => !r.active).length}</Text>
            <Text style={s.statLab}>Inactive</Text>
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>👥</Text>
              <Text style={s.emptyText}>No residents found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.tealDeep },
  safeTop:     { backgroundColor: P.tealDeep },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:    { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  addBtn:      { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  addBtnText:  { color: '#FFF', fontWeight: '700', fontSize: 13 },

  body:        { flex: 1, backgroundColor: P.bg },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, borderRadius: 12, borderWidth: 1, borderColor: P.border, marginHorizontal: 16, marginTop: 14, paddingHorizontal: 12, height: 46 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: P.text },
  filterRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: P.tealMid },
  chipActive:  { backgroundColor: P.teal },
  chipText:    { fontSize: 12, fontWeight: '700', color: P.tealText },
  chipTextActive: { color: '#FFF' },

  statsRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statPill:    { flex: 1, backgroundColor: P.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: P.border },
  statVal:     { fontSize: 18, fontWeight: '900', color: P.teal },
  statLab:     { fontSize: 10, color: P.textMuted, fontWeight: '600', marginTop: 2 },

  list:        { paddingHorizontal: 16, paddingBottom: 24 },
  card:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: P.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.border, marginBottom: 10, elevation: 1 },
  inactiveCard:{ opacity: 0.6 },
  avatar:      { width: 46, height: 46, borderRadius: 23, backgroundColor: P.teal + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontWeight: '800', color: P.teal },
  name:        { fontSize: 15, fontWeight: '700', color: P.text },
  unit:        { fontSize: 12, color: P.textMuted, marginTop: 2 },
  phone:       { fontSize: 12, color: P.textMuted, marginTop: 1 },
  inactivePill:{ backgroundColor: P.textMuted + '25', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  inactivePillText: { fontSize: 10, color: P.textMuted, fontWeight: '700' },
  kycBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  kycText:     { fontSize: 10, fontWeight: '700' },

  empty:       { alignItems: 'center', paddingVertical: 60 },
  emptyText:   { fontSize: 15, color: P.textMuted, fontWeight: '600' },
});