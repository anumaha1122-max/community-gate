import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const STATUS_CFG = {
  pending:  {label:'Pending', color:'#D97706',bg:'#FEF3C7'},
  approved: {label:'Approved',color:'#16A34A',bg:'#DCFCE7'},
  rejected: {label:'Rejected',color:'#DC2626',bg:'#FEE2E2'},
};

export default function VisitorParkingAdminScreen({ navigation }) {
  const guestParking        = useSecurityStore(s => s.guestParking) || [];
  const approveGuestParking = useSecurityStore(s => s.approveGuestParking);
  const rejectGuestParking  = useSecurityStore(s => s.rejectGuestParking);
  const [filter, setFilter] = useState('pending');

  const filtered = guestParking.filter(p => filter==='all' || p.status===filter);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🚗 Visitor Parking</Text>
            <Text style={s.headerSub}>{guestParking.filter(p=>p.status==='pending').length} requests pending</Text>
          </View>
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
        keyExtractor={p=>p.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>🚗</Text><Text style={s.emptyText}>No parking requests</Text></View>}
        renderItem={({item:p})=>{
          const cfg = STATUS_CFG[p.status]||STATUS_CFG.pending;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={{flex:1}}>
                  <Text style={s.cardTitle}>{p.vehicleNumber||'Vehicle'}</Text>
                  <Text style={s.cardSub}>Unit {p.hostUnit} · {p.guestName||'Guest'}</Text>
                  {p.purpose && <Text style={s.cardSub}>Purpose: {p.purpose}</Text>}
                  {p.startDate && <Text style={s.cardSub}>📅 {fmt(p.startDate)} – {fmt(p.endDate)}</Text>}
                </View>
                <View style={[s.badge,{backgroundColor:cfg.bg}]}>
                  <Text style={[s.badgeText,{color:cfg.color}]}>{cfg.label}</Text>
                </View>
              </View>
              {p.status==='pending' && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#FEE2E2'}]}
                    onPress={()=>rejectGuestParking&&rejectGuestParking(p.id)}>
                    <Text style={[s.actionBtnText,{color:'#DC2626'}]}>✕ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#DCFCE7',flex:2}]}
                    onPress={()=>{ approveGuestParking&&approveGuestParking(p.id); Alert.alert('✅ Approved'); }}>
                    <Text style={[s.actionBtnText,{color:'#16A34A'}]}>✓ Approve</Text>
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
  screen:        {flex:1,backgroundColor:'#E8F5F5'},
  header:        {backgroundColor:'#1A7A7A',paddingTop:40,paddingBottom:16,paddingHorizontal:20},
  backText:      {color:'rgba(255,255,255,0.85)',fontSize:14,fontWeight:'600',marginBottom:8},
  headerRow:     {flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  headerTitle:   {fontSize:22,fontWeight:'900',color:'#FFF'},
  headerSub:     {fontSize:12,color:'rgba(255,255,255,0.72)',marginTop:1},
  tabRow:        {flexDirection:'row',backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#D0EEEE'},
  tab:           {flex:1,paddingVertical:12,alignItems:'center'},
  tabActive:     {borderBottomWidth:3,borderBottomColor:'#1A7A7A'},
  tabText:       {fontSize:12,fontWeight:'600',color:'#7A9E9E'},
  tabTextActive: {color:'#1A7A7A',fontWeight:'800'},
  list:          {padding:14,paddingBottom:40},
  card:          {backgroundColor:'#FFF',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#D0EEEE',elevation:1},
  cardTop:       {flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:8},
  cardTitle:     {fontSize:15,fontWeight:'800',color:'#1A2E2E'},
  cardSub:       {fontSize:12,color:'#7A9E9E',marginTop:2},
  badge:         {paddingHorizontal:10,paddingVertical:4,borderRadius:20},
  badgeText:     {fontSize:11,fontWeight:'800'},
  actionRow:     {flexDirection:'row',gap:8,marginTop:10},
  actionBtn:     {flex:1,paddingVertical:10,borderRadius:10,alignItems:'center'},
  actionBtnText: {fontSize:13,fontWeight:'800'},
  empty:         {alignItems:'center',paddingTop:60},
  emptyText:     {fontSize:15,color:'#7A9E9E',marginTop:12},
});
