import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, FlatList, Alert, Modal, ScrollView,
} from 'react-native';
import useAppStore   from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const ROLES = ['All Residents', 'vendors', 'guards', 'residents'];

export default function AnnouncementsScreen({ navigation }) {
  const announcements    = useAppStore(s => s.announcements)      || [];
  const addAnnouncement  = useAppStore(s => s.addAnnouncement);
  const deleteAnnouncement= useAppStore(s => s.deleteAnnouncement);
  const user = useAuthStore(s => s.user);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ title:'', body:'', targetRole:'All Residents', urgent:false });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleAdd = () => {
    if (!form.title.trim()) { Alert.alert('Required','Enter a title'); return; }
    if (!form.body.trim())  { Alert.alert('Required','Enter message body'); return; }
    addAnnouncement && addAnnouncement({
      ...form, postedBy: user?.name||'Admin', postedAt: new Date().toISOString(),
    });
    setForm({ title:'', body:'', targetRole:'All Residents', urgent:false });
    setModal(false);
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
            <Text style={s.headerTitle}>📢 Announcements</Text>
            <Text style={s.headerSub}>{announcements.length} notices posted</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
            <Text style={s.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[...announcements].sort((a,b)=>new Date(b.postedAt)-new Date(a.postedAt))}
        keyExtractor={a => a.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>📢</Text><Text style={s.emptyText}>No announcements yet</Text></View>}
        renderItem={({ item }) => (
          <View style={[s.card, item.urgent && {borderLeftWidth:4, borderLeftColor:'#DC2626'}]}>
            <View style={s.cardTop}>
              <View style={{flex:1}}>
                {item.urgent && <View style={s.urgentBadge}><Text style={s.urgentText}>🔴 URGENT</Text></View>}
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardBody}>{item.body}</Text>
              </View>
            </View>
            <View style={s.cardMeta}>
              <Text style={s.metaText}>For: {item.targetRole} · {fmt(item.postedAt)}</Text>
              <Text style={s.metaText}>by {item.postedBy||'Admin'}</Text>
              {deleteAnnouncement && (
                <TouchableOpacity onPress={() => Alert.alert('Delete?','',[ {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteAnnouncement(item.id)} ])}>
                  <Text style={{color:'#DC2626',fontSize:12,fontWeight:'700'}}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <Modal visible={modal} animationType="slide" transparent onRequestClose={()=>setModal(false)}>
        <View style={s.modalOverlay}>
          <ScrollView style={s.modalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Announcement</Text>
              <TouchableOpacity onPress={()=>setModal(false)}><Text style={{fontSize:22,color:'#7A9E9E'}}>✕</Text></TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>Title *</Text>
            <TextInput style={s.fieldInput} value={form.title} onChangeText={v=>f('title',v)} placeholder="e.g. Water shutdown notice" placeholderTextColor="#7A9E9E" />
            <Text style={s.fieldLabel}>Message *</Text>
            <TextInput style={[s.fieldInput,{height:100,textAlignVertical:'top'}]} value={form.body} onChangeText={v=>f('body',v)} placeholder="Full announcement details…" placeholderTextColor="#7A9E9E" multiline />
            <Text style={s.fieldLabel}>Send To</Text>
            <View style={s.chipRow}>
              {ROLES.map(r=>(
                <TouchableOpacity key={r} style={[s.chip, form.targetRole===r && s.chipActive]} onPress={()=>f('targetRole',r)}>
                  <Text style={[s.chipText, form.targetRole===r && s.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.urgentToggle} onPress={()=>f('urgent',!form.urgent)}>
              <View style={[s.toggle, form.urgent && s.toggleOn]} />
              <Text style={s.toggleLabel}>Mark as Urgent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.submitBtn} onPress={handleAdd}>
              <Text style={s.submitBtnText}>📢 Post Announcement</Text>
            </TouchableOpacity>
            <View style={{height:30}} />
          </ScrollView>
        </View>
      </Modal>
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
  list:         { padding:14, paddingBottom:40 },
  card:         { backgroundColor:'#FFF', borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:'#D0EEEE', elevation:1 },
  cardTop:      { flexDirection:'row', gap:12, marginBottom:8 },
  urgentBadge:  { backgroundColor:'#FEE2E2', borderRadius:20, paddingHorizontal:10, paddingVertical:3, alignSelf:'flex-start', marginBottom:6 },
  urgentText:   { color:'#DC2626', fontSize:11, fontWeight:'800' },
  cardTitle:    { fontSize:15, fontWeight:'800', color:'#1A2E2E', marginBottom:4 },
  cardBody:     { fontSize:13, color:'#3D6E6E', lineHeight:20 },
  cardMeta:     { flexDirection:'row', gap:12, paddingTop:10, borderTopWidth:1, borderTopColor:'#D0EEEE', flexWrap:'wrap' },
  metaText:     { fontSize:11, color:'#7A9E9E' },
  empty:        { alignItems:'center', paddingTop:60 },
  emptyText:    { fontSize:15, color:'#7A9E9E', marginTop:12 },
  // Modal
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalCard:    { backgroundColor:'#FFF', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:'90%' },
  modalHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  modalTitle:   { fontSize:18, fontWeight:'900', color:'#1A2E2E' },
  fieldLabel:   { fontSize:12, fontWeight:'700', color:'#3D6E6E', marginBottom:6 },
  fieldInput:   { backgroundColor:'#E8F5F5', borderRadius:12, paddingHorizontal:14, paddingVertical:11, fontSize:14, color:'#1A2E2E', borderWidth:1, borderColor:'#D0EEEE', marginBottom:14 },
  chipRow:      { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 },
  chip:         { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'#E8F5F5', borderWidth:1, borderColor:'#D0EEEE' },
  chipActive:   { backgroundColor:'#1A7A7A', borderColor:'#1A7A7A' },
  chipText:     { fontSize:12, fontWeight:'600', color:'#3D6E6E' },
  chipTextActive:{ color:'#FFF', fontWeight:'800' },
  urgentToggle: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  toggle:       { width:40, height:22, borderRadius:11, backgroundColor:'#D0EEEE' },
  toggleOn:     { backgroundColor:'#DC2626' },
  toggleLabel:  { fontSize:14, color:'#1A2E2E', fontWeight:'600' },
  submitBtn:    { backgroundColor:'#1A7A7A', borderRadius:14, paddingVertical:15, alignItems:'center', marginTop:8 },
  submitBtnText:{ color:'#FFF', fontSize:15, fontWeight:'800' },
});
