/**
 * OrderDetailsScreen.js — Vendor Marketplace
 * Shows full order detail from appStore with real actions.
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Colors } from '../../../vendor/theme';
import { AppHeader, Card, Badge, Divider } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore  from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const STATUS_CFG = {
  pending:           { label:'New',             color:Colors.amber,  bg:Colors.amberLight },
  accepted:          { label:'Confirmed',        color:Colors.teal,   bg:Colors.tealLight  },
  assigned_delivery: { label:'Out for Delivery', color:Colors.blue,   bg:Colors.blueLight  },
  out_for_delivery:  { label:'At Door',          color:'#7C3AED',     bg:'#F3E8FF'         },
  delivered:         { label:'Delivered ✅',      color:Colors.green,  bg:Colors.greenLight },
  rejected:          { label:'Rejected',         color:'#DC2626',     bg:'#FEE2E2'         },
  returned:          { label:'Return Req.',       color:'#D97706',     bg:'#FEF3C7'         },
};

const TIMELINE_LABELS = {
  'Order Placed':              '🛒',
  'Order Confirmed by Vendor': '✅',
  'Delivery assigned':         '🏍️',
  'OTP Verified — Entry Allowed': '🔐',
  'Delivery Confirmed by Resident': '📦',
  'Delivery Rejected by Resident':  '❌',
  'Return Requested by Resident':   '↩️',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
}

export default function OrderDetailsScreen({ navigation, route }) {
  const theme   = useTheme();
  const orderId = route?.params?.orderId;
  const orders  = useAppStore(s => s.marketplaceOrders);
  const vendorAcceptOrder     = useAppStore(s => s.vendorAcceptOrder);
  const vendorRejectOrder     = useAppStore(s => s.vendorRejectOrder);
  const markOrderDelivered    = useAppStore(s => s.markOrderDelivered);

  const order = orders.find(o => o.id === orderId) || route?.params?.order;

  if (!order) {
    return (
      <SafeAreaView style={s.root}>
        <AppHeader title="Order Details" onBack={() => navigation.goBack()} />
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:48 }}>📦</Text>
          <Text style={{ fontSize:16, color:'#64748B', marginTop:12 }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = STATUS_CFG[order.status] || { label:order.status, color:'#64748B', bg:'#F1F5F9' };
  const subtotal = (order.items||[]).reduce((s,i) => s + i.price*i.qty, 0);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={theme.mode==='light'?'dark-content':'light-content'} backgroundColor={theme.header} />
      <AppHeader
        title="Order Details"
        subtitle={`#${order.id}`}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={[s.statusChip, { backgroundColor:cfg.bg }]}>
            <Text style={[s.statusChipText, { color:cfg.color }]}>{cfg.label}</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:100 }} showsVerticalScrollIndicator={false}>

        {/* Resident info */}
        <Card>
          <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
            <View style={s.avatar}><Text style={{ fontSize:24 }}>👤</Text></View>
            <View style={{ flex:1 }}>
              <Text style={s.resName}>{order.residentName}</Text>
              <Text style={s.resUnit}>Unit {order.unit}</Text>
            </View>
            <View style={[s.statusChip, { backgroundColor:cfg.bg }]}>
              <Text style={[s.statusChipText, { color:cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
        </Card>

        {/* OTP card (show when assigned_delivery) */}
        {order.otp && ['assigned_delivery'].includes(order.status) && !order.otpVerified && (
          <View style={s.otpCard}>
            <Text style={s.otpLabel}>🔐 Delivery OTP</Text>
            <Text style={s.otpCode}>{order.otp}</Text>
            <Text style={s.otpSub}>Resident shares this OTP with delivery partner · Guard verifies at gate</Text>
          </View>
        )}

        {/* OTP verified banner */}
        {order.otpVerified && (
          <View style={[s.infoBanner, { backgroundColor:'#DCFCE7', borderLeftColor:'#16A34A' }]}>
            <Text style={{ fontSize:13, color:'#166534', fontWeight:'700' }}>✅ OTP Verified — Delivery partner is inside the community</Text>
          </View>
        )}

        {/* Items */}
        <Card>
          <Text style={s.sectionLabel}>ITEMS ORDERED</Text>
          {(order.items||[]).map((item, i) => (
            <View key={i} style={[s.itemRow, i < (order.items||[]).length-1 && { borderBottomWidth:1, borderBottomColor:'#F1F5F9' }]}>
              <View style={s.itemEmoji}><Text style={{ fontSize:22 }}>{item.emoji||'📦'}</Text></View>
              <View style={{ flex:1 }}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemQty}>×{item.qty}</Text>
              </View>
              <Text style={s.itemPrice}>₹{(item.price * item.qty).toLocaleString('en-IN')}</Text>
            </View>
          ))}
          <Divider />
          <View style={s.billRow}><Text style={s.billKey}>Subtotal</Text><Text style={s.billVal}>₹{subtotal.toLocaleString('en-IN')}</Text></View>
          <View style={s.billRow}><Text style={s.billKey}>Delivery</Text><Text style={s.billVal}>₹{order.deliveryCharge||20}</Text></View>
          <Divider />
          <View style={s.billRow}>
            <Text style={[s.billKey, { fontSize:16, fontWeight:'800', color:'#1E293B' }]}>Total</Text>
            <Text style={[s.billVal, { fontSize:18, fontWeight:'900', color:Colors.teal }]}>₹{(order.total||0).toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        {/* Delivery partner */}
        {order.deliveryPartnerName && (
          <Card>
            <Text style={s.sectionLabel}>DELIVERY PARTNER</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
              <View style={s.dpAvatar}><Text style={{ fontSize:22 }}>🏍️</Text></View>
              <View>
                <Text style={s.itemName}>{order.deliveryPartnerName}</Text>
                <Text style={s.itemQty}>Delivery Partner</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Timeline */}
        {(order.timeline||[]).length > 0 && (
          <Card>
            <Text style={s.sectionLabel}>ORDER TIMELINE</Text>
            {(order.timeline||[]).map((ev, i) => {
              const emoji = Object.entries(TIMELINE_LABELS).find(([k]) => ev.action.startsWith(k))?.[1] || '📋';
              const isLast = i === order.timeline.length - 1;
              return (
                <View key={i} style={{ flexDirection:'row', alignItems:'flex-start' }}>
                  <View style={{ alignItems:'center', width:28, marginRight:10 }}>
                    <View style={{ width:24, height:24, borderRadius:12, backgroundColor: isLast ? Colors.teal : '#F1F5F9', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ fontSize:11 }}>{emoji}</Text>
                    </View>
                    {!isLast && <View style={{ width:2, flex:1, backgroundColor:'#E2E8F0', marginVertical:3 }} />}
                  </View>
                  <View style={{ flex:1, paddingBottom: isLast ? 0 : 14 }}>
                    <Text style={{ fontSize:13, fontWeight: isLast?'700':'500', color: isLast?'#1E293B':'#475569' }}>{ev.action}</Text>
                    <Text style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{fmt(ev.at)}</Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Actions */}
        {order.status === 'pending' && (
          <View style={{ flexDirection:'row', gap:12, marginTop:8 }}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor:'#FEE2E2' }]}
              onPress={() => Alert.alert('Reject?','',[ {text:'Cancel',style:'cancel'}, {text:'Reject',style:'destructive', onPress:()=>{ vendorRejectOrder(order.id); navigation.goBack(); }} ])} activeOpacity={0.85}>
              <Text style={[s.actionBtnText, { color:'#DC2626' }]}>✕ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor:'#DCFCE7', flex:2 }]}
              onPress={() => { vendorAcceptOrder(order.id); Alert.alert('✅ Accepted','Assign a delivery partner when ready to dispatch.'); }} activeOpacity={0.85}>
              <Text style={[s.actionBtnText, { color:'#16A34A' }]}>✓ Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'out_for_delivery' && order.otpVerified && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor:Colors.green, marginTop:8 }]}
            onPress={() => { markOrderDelivered(order.id); Alert.alert('✅ Done','Order marked as delivered.', [{text:'OK',onPress:()=>navigation.goBack()}]); }} activeOpacity={0.85}>
            <Text style={[s.actionBtnText, { color:'#FFF' }]}>📦 Mark as Delivered</Text>
          </TouchableOpacity>
        )}

        {order.status === 'returned' && (
          <View style={[s.infoBanner, { backgroundColor:'#FEF3C7', borderLeftColor:'#D97706' }]}>
            <Text style={{ fontSize:13, color:'#92400E', fontWeight:'700' }}>📦 Return requested — contact resident to arrange pickup and process refund.</Text>
          </View>
        )}

        <View style={{ height:20 }} />
      </ScrollView>

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
  root:          { flex:1, backgroundColor:'#F8FFFE' },
  statusChip:    { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  statusChipText:{ fontSize:11, fontWeight:'800' },
  avatar:        { width:52, height:52, borderRadius:26, backgroundColor:'#F1F5F9', alignItems:'center', justifyContent:'center' },
  resName:       { fontSize:16, fontWeight:'800', color:'#1E293B' },
  resUnit:       { fontSize:12, color:'#64748B', marginTop:2 },
  sectionLabel:  { fontSize:11, fontWeight:'800', color:'#94A3B8', letterSpacing:0.8, marginBottom:12 },
  itemRow:       { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10 },
  itemEmoji:     { width:44, height:44, borderRadius:12, backgroundColor:'#F0FAFA', alignItems:'center', justifyContent:'center' },
  itemName:      { fontSize:14, fontWeight:'700', color:'#1E293B' },
  itemQty:       { fontSize:12, color:'#64748B', marginTop:2 },
  itemPrice:     { fontSize:14, fontWeight:'800', color:'#1E293B' },
  billRow:       { flexDirection:'row', justifyContent:'space-between', paddingVertical:6 },
  billKey:       { fontSize:13, color:'#64748B' },
  billVal:       { fontSize:13, fontWeight:'700', color:'#1E293B' },
  dpAvatar:      { width:44, height:44, borderRadius:22, backgroundColor:'#E8F5F5', alignItems:'center', justifyContent:'center' },
  otpCard:       { backgroundColor:'#F0FDF4', borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:'#A5D6A7', alignItems:'center' },
  otpLabel:      { fontSize:12, color:'#2E7D32', fontWeight:'700', marginBottom:6 },
  otpCode:       { fontSize:36, fontWeight:'900', color:'#1A7A7A', letterSpacing:10, marginBottom:4 },
  otpSub:        { fontSize:11, color:'#4B5563', textAlign:'center' },
  infoBanner:    { borderLeftWidth:4, borderRadius:10, padding:12, marginBottom:12 },
  actionBtn:     { flex:1, borderRadius:14, paddingVertical:14, alignItems:'center' },
  actionBtnText: { fontSize:14, fontWeight:'800' },
});
