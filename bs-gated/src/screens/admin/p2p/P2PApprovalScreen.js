import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
import useAppStore from '../../../store/appStore';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const STATUS_CFG = {
  pending:  {label:'Pending', color:'#D97706',bg:'#FEF3C7'},
  approved: {label:'Approved',color:'#16A34A',bg:'#DCFCE7'},
  rejected: {label:'Rejected',color:'#DC2626',bg:'#FEE2E2'},
};

export default function P2PApprovalScreen({ navigation }) {
  const p2pListings      = useAppStore(s => s.p2pListings)       || [];
  const approveP2P       = useAppStore(s => s.approveP2PListing);
  const rejectP2P        = useAppStore(s => s.rejectP2PListing);
  const [filter, setFilter] = useState('pending');

  const filtered = p2pListings.filter(l => filter==='all' || l.status===filter);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🛍️ P2P Approvals</Text>
            <Text style={s.headerSub}>{p2pListings.filter(l=>l.status==='pending').length} pending review</Text>
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
        data={filtered} keyExtractor={l=>l.id} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>🛍️</Text><Text style={s.emptyText}>No listings here</Text></View>}
        renderItem={({item:l})=>{
          const cfg = STATUS_CFG[l.status]||STATUS_CFG.pending;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={{flex:1}}>
                  <Text style={s.cardTitle}>{l.title||l.name||'Listing'}</Text>
                  <Text style={s.cardSub}>{l.sellerName||l.userName||'Resident'} · Unit {l.unit||l.sellerUnit}</Text>
                  {l.price?<Text style={s.cardPrice}>₹{Number(l.price).toLocaleString('en-IN')}</Text>:null}
                  {l.category&&<Text style={s.cardSub}>Category: {l.category}</Text>}
                </View>
                <View style={[s.badge,{backgroundColor:cfg.bg}]}>
                  <Text style={[s.badgeText,{color:cfg.color}]}>{cfg.label}</Text>
                </View>
              </View>
              <Text style={s.cardMeta}>Listed {fmt(l.createdAt||l.listedAt)}</Text>
              {l.status==='pending' && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#FEE2E2'}]}
                    onPress={()=>Alert.alert('Reject?','',[ {text:'Cancel',style:'cancel'},{text:'Reject',style:'destructive',onPress:()=>rejectP2P&&rejectP2P(l.id)} ])}>
                    <Text style={[s.actionBtnText,{color:'#DC2626'}]}>✕ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#DCFCE7',flex:2}]}
                    onPress={()=>{ approveP2P&&approveP2P(l.id); Alert.alert('✅ Approved','Listing is now visible.'); }}>
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
  screen:{flex:1,backgroundColor:'#E8F5F5'},
  header:{backgroundColor:'#1A7A7A',paddingTop:40,paddingBottom:16,paddingHorizontal:20},
  backText:{color:'rgba(255,255,255,0.85)',fontSize:14,fontWeight:'600',marginBottom:8},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  headerTitle:{fontSize:22,fontWeight:'900',color:'#FFF'},
  headerSub:{fontSize:12,color:'rgba(255,255,255,0.72)',marginTop:1},
  tabRow:{flexDirection:'row',backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#D0EEEE'},
  tab:{flex:1,paddingVertical:12,alignItems:'center'},
  tabActive:{borderBottomWidth:3,borderBottomColor:'#1A7A7A'},
  tabText:{fontSize:12,fontWeight:'600',color:'#7A9E9E'},
  tabTextActive:{color:'#1A7A7A',fontWeight:'800'},
  list:{padding:14,paddingBottom:40},
  card:{backgroundColor:'#FFF',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#D0EEEE',elevation:1},
  cardTop:{flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:6},
  cardTitle:{fontSize:15,fontWeight:'800',color:'#1A2E2E'},
  cardSub:{fontSize:12,color:'#7A9E9E',marginTop:2},
  cardPrice:{fontSize:16,fontWeight:'900',color:'#1A7A7A',marginTop:4},
  cardMeta:{fontSize:11,color:'#7A9E9E',marginBottom:4},
  badge:{paddingHorizontal:10,paddingVertical:4,borderRadius:20},
  badgeText:{fontSize:11,fontWeight:'800'},
  actionRow:{flexDirection:'row',gap:8,marginTop:10},
  actionBtn:{flex:1,paddingVertical:10,borderRadius:10,alignItems:'center'},
  actionBtnText:{fontSize:13,fontWeight:'800'},
  empty:{alignItems:'center',paddingTop:60},
  emptyText:{fontSize:15,color:'#7A9E9E',marginTop:12},
});
