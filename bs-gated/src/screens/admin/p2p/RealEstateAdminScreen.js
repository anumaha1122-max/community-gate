import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
import useAppStore from '../../../store/appStore';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const STATUS_CFG = {
  pending:  { label:'Pending',  color:'#D97706', bg:'#FEF3C7' },
  approved: { label:'Approved', color:'#16A34A', bg:'#DCFCE7' },
  rejected: { label:'Rejected', color:'#DC2626', bg:'#FEE2E2' },
};

export default function RealEstateAdminScreen({ navigation }) {
  const listings         = useAppStore(s => s.realEstateListings) || [];
  const approveListing   = useAppStore(s => s.approveRealEstateListing);
  const rejectListing    = useAppStore(s => s.rejectRealEstateListing);
  const [filter, setFilter] = useState('pending');

  const filtered = listings.filter(l => filter === 'all' || l.status === filter);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🏠 Real Estate</Text>
            <Text style={s.headerSub}>{listings.filter(l=>l.status==='pending').length} pending approval</Text>
          </View>
        </View>
        <View style={s.statsRow}>
          {[
            {l:'Pending', v:listings.filter(l=>l.status==='pending').length, c:'#FDE68A'},
            {l:'Approved',v:listings.filter(l=>l.status==='approved').length,c:'#6EE7B7'},
            {l:'Rejected',v:listings.filter(l=>l.status==='rejected').length,c:'#FCA5A5'},
          ].map((st,i)=>(
            <View key={i} style={{flex:1,alignItems:'center'}}>
              {i>0 && <View style={{position:'absolute',left:0,top:4,bottom:4,width:1,backgroundColor:'rgba(255,255,255,0.2)'}}/>}
              <Text style={{fontSize:20,fontWeight:'900',color:st.c}}>{st.v}</Text>
              <Text style={{fontSize:9,color:'rgba(255,255,255,0.6)',fontWeight:'600',marginTop:1}}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.tabRow}>
        {['pending','approved','rejected','all'].map(k=>(
          <TouchableOpacity key={k} style={[s.tab,filter===k&&s.tabActive]} onPress={()=>setFilter(k)}>
            <Text style={[s.tabText,filter===k&&s.tabTextActive]}>{k.charAt(0).toUpperCase()+k.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={l=>l.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>🏠</Text><Text style={s.emptyText}>No listings here</Text></View>}
        renderItem={({item:l})=>{
          const cfg = STATUS_CFG[l.status]||STATUS_CFG.pending;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={{flex:1}}>
                  <Text style={s.cardTitle}>{l.title||`${l.type} — Unit ${l.unit}`}</Text>
                  <Text style={s.cardSub}>Unit {l.unit} · {l.sellerName||l.ownerName||'Resident'}</Text>
                  {l.price ? <Text style={s.cardPrice}>₹{Number(l.price).toLocaleString('en-IN')}</Text> : null}
                </View>
                <View style={[s.badge,{backgroundColor:cfg.bg}]}>
                  <Text style={[s.badgeText,{color:cfg.color}]}>{cfg.label}</Text>
                </View>
              </View>
              {l.description ? <Text style={s.cardDesc} numberOfLines={2}>{l.description}</Text> : null}
              <Text style={s.cardMeta}>Listed {fmt(l.createdAt||l.listedAt)}</Text>
              {l.status==='pending' && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#FEE2E2'}]}
                    onPress={()=>Alert.alert('Reject?','',[ {text:'Cancel',style:'cancel'},{text:'Reject',style:'destructive',onPress:()=>rejectListing&&rejectListing(l.id)} ])}>
                    <Text style={[s.actionBtnText,{color:'#DC2626'}]}>✕ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#DCFCE7',flex:2}]}
                    onPress={()=>{ approveListing&&approveListing(l.id); Alert.alert('✅ Approved','Listing is now live.'); }}>
                    <Text style={[s.actionBtnText,{color:'#16A34A'}]}>✓ Approve Listing</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:       { flex:1, backgroundColor:'#E8F5F5' },
  header:       { backgroundColor:'#1A7A7A', paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
  backText:     { color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  headerTitle:  { fontSize:22, fontWeight:'900', color:'#FFF' },
  headerSub:    { fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:1 },
  statsRow:     { flexDirection:'row', alignItems:'center' },
  tabRow:       { flexDirection:'row', backgroundColor:'#FFF', borderBottomWidth:1, borderBottomColor:'#D0EEEE' },
  tab:          { flex:1, paddingVertical:12, alignItems:'center' },
  tabActive:    { borderBottomWidth:3, borderBottomColor:'#1A7A7A' },
  tabText:      { fontSize:12, fontWeight:'600', color:'#7A9E9E' },
  tabTextActive:{ color:'#1A7A7A', fontWeight:'800' },
  list:         { padding:14, paddingBottom:40 },
  card:         { backgroundColor:'#FFF', borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:'#D0EEEE', elevation:1 },
  cardTop:      { flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:8 },
  cardTitle:    { fontSize:15, fontWeight:'800', color:'#1A2E2E' },
  cardSub:      { fontSize:12, color:'#7A9E9E', marginTop:2 },
  cardPrice:    { fontSize:16, fontWeight:'900', color:'#1A7A7A', marginTop:4 },
  cardDesc:     { fontSize:13, color:'#3D6E6E', lineHeight:20, marginBottom:8 },
  cardMeta:     { fontSize:11, color:'#7A9E9E' },
  badge:        { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeText:    { fontSize:11, fontWeight:'800' },
  actionRow:    { flexDirection:'row', gap:8, marginTop:10 },
  actionBtn:    { flex:1, paddingVertical:10, borderRadius:10, alignItems:'center' },
  actionBtnText:{ fontSize:13, fontWeight:'800' },
  empty:        { alignItems:'center', paddingTop:60 },
  emptyText:    { fontSize:15, color:'#7A9E9E', marginTop:12 },
});
