import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, FlatList, Alert,
} from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';
import { useAuthStore }     from '../../../store/AuthStore';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

export default function BlacklistScreen({ navigation }) {
  const blacklist       = useSecurityStore(s => s.blacklist);
  const addToBlacklist  = useSecurityStore(s => s.addToBlacklist);
  const removeBlacklist = useSecurityStore(s => s.removeFromBlacklist);
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', vehicleNumber:'', reason:'' });
  const f = (k, v) => setForm(p => ({...p, [k]:v}));

  const filtered = blacklist.filter(b =>
    !search ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search) ||
    b.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Enter name'); return; }
    if (!form.reason.trim()) { Alert.alert('Required', 'Enter reason'); return; }
    addToBlacklist({ ...form, addedBy: user?.name || 'Admin', addedAt: new Date().toISOString() });
    setForm({ name:'', phone:'', vehicleNumber:'', reason:'' });
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🚫 Blacklist</Text>
            <Text style={s.headerSub}>{blacklist.filter(b=>b.active).length} active blocks</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(p => !p)}>
            <Text style={s.addBtnText}>{showAdd ? '✕ Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAdd && (
        <View style={s.addCard}>
          {[
            { label:'Full Name *', key:'name', placeholder:'e.g. John Doe' },
            { label:'Phone',       key:'phone', placeholder:'10-digit number', kb:'phone-pad' },
            { label:'Vehicle No.', key:'vehicleNumber', placeholder:'e.g. MH12AB1234' },
            { label:'Reason *',    key:'reason', placeholder:'Why is this person blocked?' },
          ].map(fi => (
            <View key={fi.key} style={{marginBottom:10}}>
              <Text style={s.fieldLabel}>{fi.label}</Text>
              <TextInput style={s.fieldInput} value={form[fi.key]} onChangeText={v=>f(fi.key,v)}
                placeholder={fi.placeholder} placeholderTextColor="#7A9E9E" keyboardType={fi.kb||'default'} />
            </View>
          ))}
          <TouchableOpacity style={s.submitBtn} onPress={handleAdd}>
            <Text style={s.submitBtnText}>Add to Blacklist</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.searchWrap}>
        <TextInput style={s.searchInput} placeholder="Search name, phone, vehicle…" placeholderTextColor="#7A9E9E"
          value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>✅</Text><Text style={s.emptyText}>Blacklist is empty</Text></View>}
        renderItem={({ item: b }) => (
          <View style={[s.card, !b.active && {opacity:0.5}]}>
            <View style={s.cardTop}>
              <View style={s.avatar}><Text style={{fontSize:20}}>🚫</Text></View>
              <View style={{flex:1}}>
                <Text style={s.cardName}>{b.name}</Text>
                {b.phone ? <Text style={s.cardSub}>📱 {b.phone}</Text> : null}
                {b.vehicleNumber ? <Text style={s.cardSub}>🚗 {b.vehicleNumber}</Text> : null}
                <Text style={[s.cardSub, {color:'#DC2626', marginTop:4}]}>Reason: {b.reason}</Text>
              </View>
              <View style={[s.badge, {backgroundColor: b.active ? '#FEE2E2' : '#F1F5F9'}]}>
                <Text style={[s.badgeText, {color: b.active ? '#DC2626' : '#7A9E9E'}]}>{b.active ? 'Active' : 'Removed'}</Text>
              </View>
            </View>
            <View style={s.cardMeta}>
              <Text style={s.metaText}>Added by {b.addedBy || 'Admin'} · {fmt(b.addedAt)}</Text>
              {b.active && removeBlacklist && (
                <TouchableOpacity onPress={() => Alert.alert('Remove?', `Remove ${b.name} from blacklist?`, [
                  {text:'Cancel',style:'cancel'},
                  {text:'Remove',style:'destructive',onPress:()=>removeBlacklist(b.id)},
                ])}>
                  <Text style={{color:'#DC2626',fontSize:12,fontWeight:'700'}}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:       { flex:1, backgroundColor:'#E8F5F5' },
  header:       { backgroundColor:'#1A7A7A', paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
  backText:     { color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle:  { fontSize:22, fontWeight:'900', color:'#FFF' },
  headerSub:    { fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:1 },
  addBtn:       { backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:14, paddingVertical:7, borderRadius:20 },
  addBtnText:   { color:'#FFF', fontSize:13, fontWeight:'700' },
  addCard:      { backgroundColor:'#FFF', padding:16, borderBottomWidth:1, borderBottomColor:'#D0EEEE' },
  fieldLabel:   { fontSize:12, fontWeight:'700', color:'#3D6E6E', marginBottom:4 },
  fieldInput:   { backgroundColor:'#E8F5F5', borderRadius:10, paddingHorizontal:14, paddingVertical:10, fontSize:14, color:'#1A2E2E', borderWidth:1, borderColor:'#D0EEEE' },
  submitBtn:    { backgroundColor:'#DC2626', borderRadius:12, paddingVertical:13, alignItems:'center', marginTop:8 },
  submitBtnText:{ color:'#FFF', fontSize:14, fontWeight:'800' },
  searchWrap:   { backgroundColor:'#FFF', paddingHorizontal:16, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#D0EEEE' },
  searchInput:  { backgroundColor:'#E8F5F5', borderRadius:10, paddingHorizontal:14, paddingVertical:9, fontSize:14, color:'#1A2E2E' },
  list:         { padding:14, paddingBottom:40 },
  card:         { backgroundColor:'#FFF', borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:'#D0EEEE', elevation:1 },
  cardTop:      { flexDirection:'row', alignItems:'flex-start', gap:12 },
  avatar:       { width:40, height:40, borderRadius:20, backgroundColor:'#FEE2E2', alignItems:'center', justifyContent:'center' },
  cardName:     { fontSize:15, fontWeight:'800', color:'#1A2E2E' },
  cardSub:      { fontSize:12, color:'#7A9E9E', marginTop:2 },
  badge:        { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeText:    { fontSize:11, fontWeight:'800' },
  cardMeta:     { flexDirection:'row', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:'#D0EEEE' },
  metaText:     { fontSize:11, color:'#7A9E9E' },
  empty:        { alignItems:'center', paddingTop:60 },
  emptyText:    { fontSize:15, color:'#7A9E9E', marginTop:12 },
});
