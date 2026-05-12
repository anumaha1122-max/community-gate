/**
 * BlacklistViewScreen.js — Module 3: Security
 *
 * Read-only view of society blacklist for residents.
 * Residents can see who is blocked from entering the society
 * so they can pre-warn if a visitor might be flagged.
 *
 * Also shows entry denials from their own visitors.
 * Theme: VisitorListScreen tokens.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput,
} from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';
import { useAuthStore }     from '../../../store/AuthStore';

const V = {
  header:'#1A7A7A', headerDark:'#0D6E6E',
  bg:'#E8F5F5', surface:'#FFFFFF',
  border:'#D0EEEE', divider:'#E8F5F5',
  text:'#1A2E2E', textSub:'#3D6E6E', textMuted:'#7A9E9E',
  primary:'#1A7A7A', chip:'#E8F5F5',
  danger:'#C62828', dangerBg:'#FEE2E2',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

export default function BlacklistViewScreen({ navigation }) {
  const blacklist = useSecurityStore(s => s.blacklist).filter(b => b.active);
  const [search, setSearch] = useState('');

  const filtered = blacklist.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.phone && b.phone.includes(search))
  );

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark}/>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>Restricted Persons</Text>
            <Text style={s.headerSub}>{blacklist.length} person{blacklist.length!==1?'s':''} blocked from entry</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search by name or phone…" placeholderTextColor={V.textMuted}/>
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{fontSize:16, color:V.textMuted, paddingHorizontal:8}}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoBanner}>
          <Text style={s.infoText}>⚠️ These persons have been <Text style={{fontWeight:'800'}}>blocked from entering the society</Text> by management. If your visitor appears on this list, they will be denied entry at the gate.</Text>
        </View>

        <Text style={s.sectionLabel}>BLOCKED PERSONS ({filtered.length})</Text>

        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize:48, marginBottom:12}}>🛡️</Text>
            <Text style={s.emptyTitle}>{search ? 'No matches found' : 'No blocked persons'}</Text>
            <Text style={s.emptySub}>{search ? 'Try a different name or phone number.' : 'The society currently has no active blacklist entries.'}</Text>
          </View>
        ) : (
          filtered.map(b => (
            <View key={b.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={{fontSize:22}}>🚫</Text>
                </View>
                <View style={{flex:1, marginLeft:12}}>
                  <Text style={s.cardName}>{b.name}</Text>
                  {b.phone ? <Text style={s.cardSub}>📱 {b.phone}</Text> : null}
                  {b.idProof ? <Text style={s.cardSub}>🪪 {b.idProof}</Text> : null}
                </View>
                <View style={s.blockedBadge}>
                  <Text style={s.blockedBadgeText}>BLOCKED</Text>
                </View>
              </View>
              <View style={s.reasonBox}>
                <Text style={s.reasonLabel}>REASON</Text>
                <Text style={s.reasonText}>{b.reason}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaText}>Added by {b.addedByName || 'Admin'} · {fmt(b.addedAt)}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor:V.bg },
  header:{ backgroundColor:V.header, paddingTop:40, paddingHorizontal:20, paddingBottom:16 },
  backText:{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:{ flexDirection:'row', alignItems:'center' },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#FFF' },
  headerSub:{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 },
  searchWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:V.surface, margin:16, marginBottom:4, borderRadius:12, borderWidth:1, borderColor:V.border, paddingHorizontal:12 },
  searchIcon:{ fontSize:16, marginRight:8 },
  searchInput:{ flex:1, fontSize:14, color:V.text, paddingVertical:12 },
  body:{ padding:16, paddingTop:8 },
  infoBanner:{ backgroundColor:'#FFF3F3', borderRadius:12, padding:14, marginBottom:14, borderWidth:1, borderColor:'#FFCDD2' },
  infoText:{ fontSize:13, color:'#7C0000', lineHeight:20 },
  sectionLabel:{ fontSize:11, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginBottom:10 },
  card:{ backgroundColor:V.surface, borderRadius:14, borderWidth:1, borderColor:V.border, borderLeftWidth:4, borderLeftColor:V.danger, padding:14, marginBottom:10 },
  cardHeader:{ flexDirection:'row', alignItems:'flex-start', marginBottom:10 },
  avatar:{ width:44, height:44, borderRadius:22, backgroundColor:V.dangerBg, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#FFCDD2' },
  cardName:{ fontSize:15, fontWeight:'800', color:V.text },
  cardSub:{ fontSize:12, color:V.textMuted, marginTop:2 },
  blockedBadge:{ backgroundColor:V.dangerBg, paddingHorizontal:9, paddingVertical:4, borderRadius:10 },
  blockedBadgeText:{ fontSize:10, fontWeight:'900', color:V.danger, letterSpacing:0.5 },
  reasonBox:{ backgroundColor:'#FFF8F8', borderRadius:10, padding:10, borderWidth:1, borderColor:'#FFCDD2', marginBottom:8 },
  reasonLabel:{ fontSize:10, fontWeight:'800', color:V.danger, letterSpacing:1, marginBottom:4 },
  reasonText:{ fontSize:13, color:V.text, lineHeight:18 },
  metaRow:{ },
  metaText:{ fontSize:11, color:V.textMuted },
  empty:{ alignItems:'center', paddingVertical:40 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:V.text, marginBottom:8 },
  emptySub:{ fontSize:13, color:V.textMuted, textAlign:'center', lineHeight:20 },
});