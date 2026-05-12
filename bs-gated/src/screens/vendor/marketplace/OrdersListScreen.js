/**
 * OrdersListScreen.js — Vendor Marketplace
 *
 * Real workflow connected to appStore.marketplaceOrders:
 *   pending           → Vendor accepts or rejects
 *   accepted          → Vendor assigns delivery partner → assigned_delivery
 *   assigned_delivery → Guard verifies OTP → out_for_delivery
 *   out_for_delivery  → Resident confirms → delivered
 *   returned          → Return requested by resident
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, Modal, ScrollView,
} from 'react-native';
import { Colors } from '../../../vendor/theme';
import { AppHeader } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore      from '../../../store/appStore';
import { useTheme }     from '../../../hooks/useTheme';

const STATUS_CFG = {
  pending:           { label: 'New',             color: Colors.amber,  bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',        color: Colors.teal,   bg: Colors.tealLight   },
  assigned_delivery: { label: 'Out for Delivery', color: Colors.blue,   bg: Colors.blueLight   },
  out_for_delivery:  { label: 'At Door',          color: '#7C3AED',     bg: '#F3E8FF'          },
  delivered:         { label: 'Delivered',        color: Colors.green,  bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',         color: '#DC2626',     bg: '#FEE2E2'          },
  return_requested:  { label: '↩️ Return Req.',   color: '#D97706',     bg: '#FEF3C7'          },
  return_accepted:   { label: 'Return Accepted',  color: '#7C3AED',     bg: '#F3E8FF'          },
  return_picked_up:  { label: 'Item Picked Up',   color: '#0D9488',     bg: '#CCFBF1'          },
  return_rejected:   { label: 'Return Rejected',  color: '#DC2626',     bg: '#FEE2E2'          },
  returned:          { label: 'Refund Done',       color: Colors.green,  bg: Colors.greenLight  },
};

const TABS = [
  { key: 'pending',   label: 'New'       },
  { key: 'active',    label: 'Active'    },
  { key: 'delivered', label: 'Delivered' },
  { key: 'returns',   label: 'Returns'   },
  { key: 'other',     label: 'Other'     },
];

const DELIVERY_PARTNERS = [
  { id: 'dp1', name: 'Rajesh Kumar', phone: '9876500001' },
  { id: 'dp2', name: 'Suresh Singh', phone: '9876500002' },
  { id: 'dp3', name: 'Mohan Das',    phone: '9876500003' },
  { id: 'dp4', name: 'Priya Sharma', phone: '9876500004' },
];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
}

function AssignModal({ visible, orderId, onClose, onAssign }) {
  const [sel, setSel] = useState(null);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={am.overlay}>
        <View style={am.card}>
          <View style={am.hdr}>
            <Text style={am.title}>Assign Delivery Partner</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22, color:'#64748B' }}>✕</Text></TouchableOpacity>
          </View>
          <Text style={am.sub}>Order {orderId}</Text>
          {DELIVERY_PARTNERS.map(dp => (
            <TouchableOpacity key={dp.id} style={[am.row, sel?.id===dp.id && am.rowSel]} onPress={() => setSel(dp)}>
              <View style={am.avatar}><Text style={{ fontSize:20 }}>🏍️</Text></View>
              <View style={{ flex:1 }}>
                <Text style={am.name}>{dp.name}</Text>
                <Text style={am.phone}>{dp.phone}</Text>
              </View>
              {sel?.id===dp.id && <Text style={{ color:Colors.teal, fontSize:20 }}>✓</Text>}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[am.btn, !sel && { opacity:0.4 }]} disabled={!sel}
            onPress={() => { onAssign(sel); onClose(); setSel(null); }} activeOpacity={0.85}>
            <Text style={am.btnText}>Assign & Dispatch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const am = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  card:    { backgroundColor:'#FFF', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:36 },
  hdr:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  title:   { fontSize:17, fontWeight:'800', color:'#1E293B' },
  sub:     { fontSize:12, color:'#64748B', marginBottom:16 },
  row:     { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#F1F5F9' },
  rowSel:  { backgroundColor:'#F0FAFA', borderRadius:12, paddingHorizontal:8 },
  avatar:  { width:44, height:44, borderRadius:22, backgroundColor:'#E8F5F5', alignItems:'center', justifyContent:'center' },
  name:    { fontSize:14, fontWeight:'700', color:'#1E293B' },
  phone:   { fontSize:12, color:'#64748B', marginTop:2 },
  btn:     { backgroundColor:Colors.teal, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:18 },
  btnText: { color:'#FFF', fontSize:15, fontWeight:'800' },
});

function OrderCard({ order, onAccept, onReject, onAssign, onPress }) {
  const vendorAcceptReturn   = useAppStore(s => s.vendorAcceptReturn);
  const vendorPickedUpReturn = useAppStore(s => s.vendorPickedUpReturn);
  const vendorCompleteReturn = useAppStore(s => s.vendorCompleteReturn);
  const vendorRejectReturn   = useAppStore(s => s.vendorRejectReturn);
  const cfg = STATUS_CFG[order.status] || { label: order.status, color:'#64748B', bg:'#F1F5F9' };
  return (
    <TouchableOpacity style={oc.card} onPress={onPress} activeOpacity={0.88}>
      <View style={oc.top}>
        <View style={{ flex:1 }}>
          <Text style={oc.id}>Order #{order.id}</Text>
          <Text style={oc.date}>{fmt(order.placedAt)}</Text>
        </View>
        <View style={[oc.badge, { backgroundColor:cfg.bg }]}>
          <Text style={[oc.badgeText, { color:cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={oc.resRow}>
        <Text style={{ fontSize:18 }}>👤</Text>
        <View>
          <Text style={oc.resName}>{order.residentName}</Text>
          <Text style={oc.resUnit}>Unit {order.unit}</Text>
        </View>
      </View>

      <View style={{ gap:3, marginBottom:10 }}>
        {(order.items||[]).slice(0,3).map((item,i) => (
          <Text key={i} style={{ fontSize:12, color:'#475569' }}>{item.emoji||'📦'} {item.name} ×{item.qty}</Text>
        ))}
        {(order.items||[]).length > 3 && <Text style={{ fontSize:12, color:'#94A3B8' }}>+{order.items.length-3} more</Text>}
      </View>

      <View style={oc.footer}>
        <Text style={oc.total}>₹{(order.total||0).toLocaleString('en-IN')}</Text>
        <Text style={{ fontSize:12, color:'#94A3B8' }}>{(order.items||[]).length} items</Text>
      </View>

      {order.status === 'pending' && (
        <View style={{ flexDirection:'row', gap:10, marginTop:12 }}>
          <TouchableOpacity style={[oc.btn,{ backgroundColor:'#FEE2E2' }]} onPress={()=>onReject(order)} activeOpacity={0.85}>
            <Text style={[oc.btnText,{ color:'#DC2626' }]}>✕ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[oc.btn,{ backgroundColor:'#DCFCE7', flex:2 }]} onPress={()=>onAccept(order)} activeOpacity={0.85}>
            <Text style={[oc.btnText,{ color:'#16A34A' }]}>✓ Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      {order.status === 'accepted' && (
        <TouchableOpacity style={[oc.btn,{ backgroundColor:Colors.teal, marginTop:12 }]} onPress={()=>onAssign(order)} activeOpacity={0.85}>
          <Text style={[oc.btnText,{ color:'#FFF' }]}>🏍️ Assign Delivery Partner</Text>
        </TouchableOpacity>
      )}
      {order.status === 'assigned_delivery' && (
        <View style={{ backgroundColor:'#FEF3C7', borderRadius:10, padding:10, marginTop:10 }}>
          <Text style={{ fontSize:12, fontWeight:'700', color:'#D97706' }}>⏳ Delivery partner at gate — awaiting OTP verification</Text>
        </View>
      )}
      {order.status === 'return_requested' && (
        <View style={{ marginTop:10, gap:8 }}>
          <View style={{ backgroundColor:'#FEF3C7', borderRadius:10, padding:10 }}>
            <Text style={{ fontSize:12, fontWeight:'700', color:'#D97706' }}>↩️ Return requested by resident</Text>
            <Text style={{ fontSize:11, color:'#92400E', marginTop:2 }}>Accept to arrange pickup, or reject with reason.</Text>
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
            <TouchableOpacity
              style={[oc.btn,{ backgroundColor:'#FEE2E2' }]}
              onPress={() => Alert.alert('Reject Return?','',[ {text:'Cancel',style:'cancel'}, {text:'Reject', style:'destructive', onPress:()=>{ vendorRejectReturn(order.id,'Item not eligible for return'); Alert.alert('Rejected','Resident notified.'); }} ])}
              activeOpacity={0.85}
            >
              <Text style={[oc.btnText,{ color:'#DC2626' }]}>✕ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[oc.btn,{ backgroundColor:'#F3E8FF', flex:2 }]}
              onPress={() => { vendorAcceptReturn(order.id); Alert.alert('✅ Return Accepted','Arrange pickup from resident.'); }}
              activeOpacity={0.85}
            >
              <Text style={[oc.btnText,{ color:'#7C3AED' }]}>✓ Accept Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {order.status === 'return_accepted' && (
        <TouchableOpacity
          style={[oc.btn,{ backgroundColor:'#CCFBF1', marginTop:10 }]}
          onPress={() => { vendorPickedUpReturn(order.id); Alert.alert('✅ Marked Picked Up','Item collected. Complete return to process refund.'); }}
          activeOpacity={0.85}
        >
          <Text style={[oc.btnText,{ color:'#0D9488' }]}>🏍️ Mark as Picked Up</Text>
        </TouchableOpacity>
      )}
      {order.status === 'return_picked_up' && (
        <TouchableOpacity
          style={[oc.btn,{ backgroundColor:Colors.greenLight, marginTop:10 }]}
          onPress={() => { vendorCompleteReturn(order.id); Alert.alert('✅ Refund Processed','Resident has been notified of refund.'); }}
          activeOpacity={0.85}
        >
          <Text style={[oc.btnText,{ color:Colors.green }]}>💰 Process Refund & Complete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
const oc = StyleSheet.create({
  card:     { backgroundColor:'#FFF', borderRadius:18, padding:18, marginBottom:14, borderWidth:1, borderColor:'#E2E8F0', elevation:3, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:6 },
  top:      { flexDirection:'row', alignItems:'flex-start', marginBottom:12 },
  id:       { fontSize:15, fontWeight:'800', color:'#1E293B' },
  date:     { fontSize:11, color:'#94A3B8', marginTop:2 },
  badge:    { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeText:{ fontSize:11, fontWeight:'800' },
  resRow:   { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F8FAFC', borderRadius:10, padding:10, marginBottom:12 },
  resName:  { fontSize:13, fontWeight:'700', color:'#1E293B' },
  resUnit:  { fontSize:11, color:'#64748B', marginTop:2 },
  footer:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTopWidth:1, borderTopColor:'#F1F5F9' },
  total:    { fontSize:18, fontWeight:'900', color:Colors.teal },
  btn:      { flex:1, borderRadius:12, paddingVertical:11, alignItems:'center' },
  btnText:  { fontSize:13, fontWeight:'800' },
});

export default function OrdersListScreen({ navigation }) {
  const theme   = useTheme();
  const orders  = useAppStore(s => s.marketplaceOrders);
  const vendorAcceptOrder     = useAppStore(s => s.vendorAcceptOrder);
  const vendorRejectOrder     = useAppStore(s => s.vendorRejectOrder);
  const assignDeliveryPartner = useAppStore(s => s.assignDeliveryPartner);
  const vendorAcceptReturn    = useAppStore(s => s.vendorAcceptReturn);
  const vendorPickedUpReturn  = useAppStore(s => s.vendorPickedUpReturn);
  const vendorCompleteReturn  = useAppStore(s => s.vendorCompleteReturn);
  const vendorRejectReturn    = useAppStore(s => s.vendorRejectReturn);

  const [activeTab,    setActiveTab]    = useState('pending');
  const [assignModal,  setAssignModal]  = useState(null);

  const tabOrders = useMemo(() => orders.filter(o => {
    if (activeTab === 'pending')   return o.status === 'pending';
    if (activeTab === 'active')    return ['accepted','assigned_delivery','out_for_delivery'].includes(o.status);
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'returns')   return ['return_requested','return_accepted','return_picked_up','return_rejected','returned'].includes(o.status);
    if (activeTab === 'other')     return o.status === 'rejected';
    return false;
  }).sort((a,b) => new Date(b.placedAt)-new Date(a.placedAt)), [orders, activeTab]);

  const cnt = (k) => orders.filter(o => {
    if (k==='pending')   return o.status==='pending';
    if (k==='active')    return ['accepted','assigned_delivery','out_for_delivery'].includes(o.status);
    if (k==='delivered') return o.status==='delivered';
    if (k==='returns')   return ['return_requested','return_accepted','return_picked_up','return_rejected','returned'].includes(o.status);
    if (k==='other')     return o.status==='rejected';
  }).length;

  const handleAccept = (order) => {
    Alert.alert('Accept Order', `Confirm order from ${order.residentName}?`, [
      { text: 'Cancel', style:'cancel' },
      { text:'Accept', onPress:() => { vendorAcceptOrder(order.id); Alert.alert('✅ Accepted','Assign a delivery partner when ready.'); }},
    ]);
  };

  const handleReject = (order) => {
    Alert.alert('Reject Order', 'Resident will be notified.', [
      { text:'Cancel', style:'cancel' },
      { text:'Reject', style:'destructive', onPress:() => { vendorRejectOrder(order.id); }},
    ]);
  };

  const handleAssign = (partner) => {
    if (!assignModal) return;
    assignDeliveryPartner(assignModal.id, partner.id, partner.name);
    Alert.alert('🏍️ Dispatched!', `${partner.name} is on the way.\nResident must share OTP at the gate.`);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={theme.mode==='light'?'dark-content':'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Orders" subtitle={`${orders.length} total`} onBack={() => navigation.goBack()} />

      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, activeTab===t.key && s.tabActive]} onPress={() => setActiveTab(t.key)}>
            <Text style={[s.tabText, activeTab===t.key && s.tabTextActive]}>
              {t.label}{cnt(t.key)>0 ? ` (${cnt(t.key)})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab==='pending' && tabOrders.length>0 && (
        <View style={s.banner}>
          <Text style={s.bannerText}>⏰ Accept or reject new orders within 30 minutes</Text>
        </View>
      )}

      <FlatList
        data={tabOrders}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding:16, paddingBottom:100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize:48, marginBottom:12 }}>📦</Text>
            <Text style={s.emptyT}>{activeTab==='pending'?'No new orders':activeTab==='active'?'No active deliveries':'Nothing here'}</Text>
            <Text style={s.emptyS}>{activeTab==='pending'?'New orders from residents will appear here':'Completed and assigned orders appear here'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onAccept={handleAccept} onReject={handleReject}
            onAssign={o => setAssignModal(o)}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })} />
        )}
      />

      <AssignModal visible={!!assignModal} orderId={assignModal?.id}
        onClose={() => setAssignModal(null)} onAssign={handleAssign} />

      <MarketplaceTabBar activeTab="Orders" onTabPress={(tab) => {
        if (tab==='Home')     navigation.navigate('MarketplaceHome');
        if (tab==='Products') navigation.navigate('ProductList');
        if (tab==='Earnings') navigation.navigate('MarketplaceEarnings');
        if (tab==='Profile')  navigation.navigate('MarketplaceProfile');
      }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:'#E8F5F5' },
  tabRow:       { flexDirection:'row', backgroundColor:'#FFF', borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  tab:          { flex:1, paddingVertical:12, alignItems:'center' },
  tabActive:    { borderBottomWidth:3, borderBottomColor:Colors.teal },
  tabText:      { fontSize:12, fontWeight:'600', color:'#94A3B8' },
  tabTextActive:{ color:Colors.teal, fontWeight:'800' },
  banner:       { backgroundColor:'#FEF3C7', borderLeftWidth:4, borderLeftColor:'#D97706', paddingHorizontal:16, paddingVertical:10 },
  bannerText:   { fontSize:12, color:'#92400E', fontWeight:'600' },
  empty:        { alignItems:'center', paddingTop:80, paddingHorizontal:30 },
  emptyT:       { fontSize:17, fontWeight:'800', color:'#1E293B', marginBottom:8 },
  emptyS:       { fontSize:13, color:'#94A3B8', textAlign:'center', lineHeight:20 },
});
