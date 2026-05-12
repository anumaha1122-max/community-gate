import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Alert,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

const STATUS_COLOR = { paid:'#1A7A7A', pending:'#D97706', overdue:'#DC2626' };
const STATUS_BG    = { paid:'#E8F5F5', pending:'#FEF3C7', overdue:'#FEE2E2' };
const STATUS_ICON  = { paid:'✅', pending:'⏳', overdue:'🔴' };
const FILTERS = [
  {key:'all',label:'All'},{key:'pending',label:'⏳ Pending'},
  {key:'overdue',label:'🔴 Overdue'},{key:'paid',label:'✅ Paid'},
];

export default function BillingDashboardScreen({ navigation }) {
  const billing         = useAdminStore(s => s.billing) || [];
  const markInvoicePaid = useAdminStore(s => s.markInvoicePaid);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const collected = billing.filter(b=>b.status==='paid').reduce((s,b)=>s+b.amount,0);
  const dues      = billing.filter(b=>b.status!=='paid').reduce((s,b)=>s+b.amount,0);
  const total     = collected + dues;
  const pct       = total > 0 ? Math.round((collected/total)*100) : 0;

  const filtered = billing.filter(b => {
    const matchFilter = filter==='all' || b.status===filter;
    const matchSearch = (b.residentName||'').toLowerCase().includes(search.toLowerCase()) ||
                        (b.unit||'').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>💳 Billing</Text>
            <Text style={s.headerSub}>{pct}% collected · ₹{dues.toLocaleString('en-IN')} outstanding</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('GenerateInvoice')}>
            <Text style={s.addBtnText}>+ Invoice</Text>
          </TouchableOpacity>
        </View>
        <View style={s.statsRow}>
          {[
            {l:'Collected', v:`₹${(collected/1000).toFixed(0)}K`, c:'#6EE7B7'},
            {l:'Pending',   v:billing.filter(b=>b.status==='pending').length, c:'#FDE68A'},
            {l:'Overdue',   v:billing.filter(b=>b.status==='overdue').length, c:'#FCA5A5'},
          ].map((st,i)=>(
            <View key={i} style={{flex:1,alignItems:'center'}}>
              {i>0&&<View style={{position:'absolute',left:0,top:4,bottom:4,width:1,backgroundColor:'rgba(255,255,255,0.2)'}}/>}
              <Text style={{fontSize:18,fontWeight:'900',color:st.c}}>{st.v}</Text>
              <Text style={{fontSize:9,color:'rgba(255,255,255,0.6)',fontWeight:'600',marginTop:1}}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.searchWrap}>
        <TextInput style={s.searchInput} placeholder="Search resident, unit…" placeholderTextColor="#7A9E9E"
          value={search} onChangeText={setSearch} />
      </View>

      <View style={s.filterRow}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f.key} style={[s.filterChip,filter===f.key&&s.filterChipActive]}
            onPress={()=>setFilter(f.key)}>
            <Text style={[s.filterChipText,filter===f.key&&s.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered} keyExtractor={b=>b.id} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>💳</Text><Text style={s.emptyText}>No bills found</Text></View>}
        renderItem={({item})=>{
          const col = STATUS_COLOR[item.status]||'#7A9E9E';
          const bg  = STATUS_BG[item.status]||'#F1F5F9';
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={{flex:1}}>
                  <Text style={s.cardName}>{item.residentName}</Text>
                  <Text style={s.cardSub}>Unit {item.unit} · {item.month||item.description||'Maintenance'}</Text>
                  <Text style={[s.cardAmount,{color:col}]}>₹{(item.amount||0).toLocaleString('en-IN')}</Text>
                </View>
                <View style={[s.badge,{backgroundColor:bg}]}>
                  <Text style={[s.badgeText,{color:col}]}>{STATUS_ICON[item.status]} {item.status}</Text>
                </View>
              </View>
              {item.status!=='paid' && (
                <TouchableOpacity style={s.markPaidBtn}
                  onPress={()=>Alert.alert('Mark as Paid?',`₹${item.amount} for ${item.residentName}`,[
                    {text:'Cancel',style:'cancel'},
                    {text:'Mark Paid',onPress:()=>markInvoicePaid&&markInvoicePaid(item.id)},
                  ])}>
                  <Text style={s.markPaidText}>✓ Mark as Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:           {flex:1,backgroundColor:'#E8F5F5'},
  header:           {backgroundColor:'#1A7A7A',paddingTop:40,paddingBottom:16,paddingHorizontal:20},
  backText:         {color:'rgba(255,255,255,0.85)',fontSize:14,fontWeight:'600',marginBottom:8},
  headerRow:        {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
  headerTitle:      {fontSize:22,fontWeight:'900',color:'#FFF'},
  headerSub:        {fontSize:12,color:'rgba(255,255,255,0.72)',marginTop:1},
  addBtn:           {backgroundColor:'rgba(255,255,255,0.2)',paddingHorizontal:14,paddingVertical:7,borderRadius:20},
  addBtnText:       {color:'#FFF',fontSize:13,fontWeight:'700'},
  statsRow:         {flexDirection:'row',alignItems:'center'},
  searchWrap:       {backgroundColor:'#FFF',paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#D0EEEE'},
  searchInput:      {backgroundColor:'#E8F5F5',borderRadius:10,paddingHorizontal:14,paddingVertical:9,fontSize:14,color:'#1A2E2E'},
  filterRow:        {flexDirection:'row',backgroundColor:'#FFF',paddingHorizontal:8,paddingVertical:8,gap:6,borderBottomWidth:1,borderBottomColor:'#D0EEEE'},
  filterChip:       {paddingHorizontal:12,paddingVertical:6,borderRadius:20,backgroundColor:'#E8F5F5'},
  filterChipActive: {backgroundColor:'#1A7A7A'},
  filterChipText:   {fontSize:12,fontWeight:'600',color:'#3D6E6E'},
  filterChipTextActive:{color:'#FFF',fontWeight:'800'},
  list:             {padding:14,paddingBottom:40},
  card:             {backgroundColor:'#FFF',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#D0EEEE',elevation:1},
  cardTop:          {flexDirection:'row',alignItems:'flex-start',gap:12},
  cardName:         {fontSize:15,fontWeight:'800',color:'#1A2E2E'},
  cardSub:          {fontSize:12,color:'#7A9E9E',marginTop:2},
  cardAmount:       {fontSize:16,fontWeight:'900',marginTop:4},
  badge:            {paddingHorizontal:10,paddingVertical:4,borderRadius:20},
  badgeText:        {fontSize:11,fontWeight:'800'},
  markPaidBtn:      {marginTop:10,backgroundColor:'#E8F5F5',borderRadius:10,paddingVertical:9,alignItems:'center',borderWidth:1,borderColor:'#D0EEEE'},
  markPaidText:     {color:'#1A7A7A',fontSize:13,fontWeight:'800'},
  empty:            {alignItems:'center',paddingTop:60},
  emptyText:        {fontSize:15,color:'#7A9E9E',marginTop:12},
});
