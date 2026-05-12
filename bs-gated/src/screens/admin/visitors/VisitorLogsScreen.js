import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, FlatList, ScrollView,
} from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';

const STATUS_META = {
  CHECKED_IN:  { label: 'Inside',      color: '#1A7A7A', bg: '#E8F5F5' },
  APPROVED:    { label: 'Approved',     color: '#16A34A', bg: '#DCFCE7' },
  CHECKED_OUT: { label: 'Left',         color: '#7A9E9E', bg: '#F1F5F9' },
  DENIED:      { label: 'Denied',       color: '#DC2626', bg: '#FEE2E2' },
};

export default function VisitorLogsScreen({ navigation }) {
  const visitors = useSecurityStore(s => s.visitors);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const FILTERS = ['all', 'CHECKED_IN', 'APPROVED', 'CHECKED_OUT', 'DENIED'];

  const filtered = visitors
    .filter(v => filter === 'all' || v.status === filter)
    .filter(v =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.hostUnit.toLowerCase().includes(search.toLowerCase()) ||
      (v.phone && v.phone.includes(search))
    );

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>👥 Visitor Logs</Text>
            <Text style={s.headerSub}>{visitors.length} total · {visitors.filter(v=>v.status==='CHECKED_IN').length} inside now</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput style={s.searchInput} placeholder="Search name, unit, phone…" placeholderTextColor="#7A9E9E"
          value={search} onChangeText={setSearch} />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter===f && s.filterChipActive]}
            onPress={() => setFilter(f)}>
            <Text style={[s.filterChipText, filter===f && s.filterChipTextActive]}>
              {f === 'all' ? `All (${visitors.length})` : `${STATUS_META[f]?.label||f} (${visitors.filter(v=>v.status===f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={v => v.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>👥</Text><Text style={s.emptyText}>No visitors found</Text></View>}
        renderItem={({ item }) => {
          const meta = STATUS_META[item.status] || { label: item.status, color: '#7A9E9E', bg: '#F1F5F9' };
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={s.avatar}><Text style={{fontSize:20}}>👤</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardSub}>{item.purpose} · Unit {item.hostUnit}</Text>
                  {item.phone ? <Text style={s.cardSub}>📱 {item.phone}</Text> : null}
                </View>
                <View style={[s.badge, {backgroundColor: meta.bg}]}>
                  <Text style={[s.badgeText, {color: meta.color}]}>{meta.label}</Text>
                </View>
              </View>
              <View style={s.cardMeta}>
                {item.entryGate ? <Text style={s.metaText}>🚪 {item.entryGate}</Text> : null}
                <Text style={s.metaText}>🕐 {fmt(item.checkedInAt || item.createdAt)}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: '#E8F5F5' },
  header:           { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:         { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:      { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub:        { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  searchWrap:       { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  searchInput:      { backgroundColor: '#E8F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: '#1A2E2E' },
  filterScroll:     { backgroundColor: '#FFF', maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  filterChip:       { paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 4 },
  filterChipActive: { borderBottomWidth: 3, borderBottomColor: '#1A7A7A' },
  filterChipText:   { fontSize: 13, color: '#7A9E9E', fontWeight: '600' },
  filterChipTextActive: { color: '#1A7A7A', fontWeight: '800' },
  list:             { padding: 14, paddingBottom: 40 },
  card:             { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE', elevation: 1 },
  cardTop:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar:           { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' },
  cardName:         { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  cardSub:          { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '800' },
  cardMeta:         { flexDirection: 'row', gap: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#D0EEEE' },
  metaText:         { fontSize: 11, color: '#7A9E9E' },
  empty:            { alignItems: 'center', paddingTop: 60 },
  emptyText:        { fontSize: 15, color: '#7A9E9E', marginTop: 12 },
});
