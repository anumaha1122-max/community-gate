/**
 * DeliveryPassScreen.js  — Module 3: Security
 *
 * Resident creates delivery gate passes for incoming deliveries.
 * Flow:
 *   1. Select provider (Swiggy / Zomato / Amazon / Blinkit / Other)
 *   2. Enter delivery person name + phone (optional — sometimes unknown)
 *   3. Expected time window
 *   4. securityStore.addDelivery() → OTP + QR generated
 *   5. Share OTP with delivery person via WhatsApp/SMS/Copy
 *   6. Guard scans / enters OTP → entry allowed
 *
 * Lists all my active/past delivery passes.
 * Theme: VisitorListScreen (#1A7A7A header, #E8F5F5 bg)
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';

// ─── Theme ─────────────────────────────────────────────────────────────────
const V = {
  header:'#1A7A7A', headerDark:'#0D6E6E',
  bg:'#E8F5F5', surface:'#FFFFFF',
  border:'#D0EEEE', divider:'#E8F5F5',
  text:'#1A2E2E', textSub:'#3D6E6E', textMuted:'#7A9E9E',
  primary:'#1A7A7A', chip:'#E8F5F5',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  successBg:'#CCFBF1',
};

const PROVIDERS = [
  { key:'Swiggy',   emoji:'🛵', color:'#FC8019', bg:'#FFF3E0' },
  { key:'Zomato',   emoji:'🍕', color:'#CB202D', bg:'#FFF0F0' },
  { key:'Amazon',   emoji:'📦', color:'#FF9900', bg:'#FFF8E1' },
  { key:'Blinkit',  emoji:'⚡', color:'#F5C518', bg:'#FFFDE7' },
  { key:'Zepto',    emoji:'🟣', color:'#7C3AED', bg:'#F5F3FF' },
  { key:'Dunzo',    emoji:'🏃', color:'#00A699', bg:'#E0F7FA' },
  { key:'Flipkart', emoji:'🛍️', color:'#2874F0', bg:'#EEF4FF' },
  { key:'Other',    emoji:'📬', color:'#64748B', bg:'#F1F5F9' },
];

const STATUS_META = {
  PENDING:      { label:'⏳ Awaiting Delivery', color:'#E65100', bg:'#FEF3C7', dot:'#FB8C00' },
  OTP_VERIFIED: { label:'✅ Guard Verified',    color:'#1A7A7A', bg:'#CCFBF1', dot:'#0F766E' },
  DELIVERED:    { label:'📦 Delivered',         color:'#2E7D32', bg:'#E8F5E9', dot:'#43A047' },
  CANCELLED:    { label:'🚫 Cancelled',         color:'#64748B', bg:'#F1F5F9', dot:'#94A3B8' },
};

const TIME_WINDOWS = [
  'Within 30 mins','30–60 mins','1–2 hours','2–4 hours','Today anytime','Tomorrow',
];

const uid = () => `res1`; // will use user id

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
}

// ─── Share OTP Modal ──────────────────────────────────────────────────────────
function ShareOTPModal({ visible, delivery, onClose }) {
  const [sent, setSent] = useState(false);
  if (!delivery) return null;
  const prov = PROVIDERS.find(p => p.key === delivery.provider) || PROVIDERS[7];
  const msg = `Hi, I've created a gate pass for your delivery at BS Gated Community.\n\nDelivery OTP: ${delivery.otp}\n\nShow this OTP to the security guard at the main gate for entry.\n\nValid for today only.`;

  const share = (ch) => {
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); Alert.alert('✅ Shared!',`OTP sent via ${ch}.`); },900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={[sh.sheet, { backgroundColor: prov.color }]}>
          <View style={sh.handle} />
          <Text style={sh.title}>📤 Share Delivery OTP</Text>
          <View style={sh.otpBox}>
            <Text style={sh.otpLabel}>DELIVERY OTP</Text>
            <Text style={sh.otpValue}>{delivery.otp}</Text>
            <Text style={sh.otpHint}>Share with {delivery.deliveryPersonName || 'delivery person'}</Text>
          </View>
          <View style={sh.msgBox}>
            <Text style={sh.msgText}>{msg}</Text>
          </View>
          {sent ? (
            <View style={{ alignItems:'center', paddingVertical:16 }}>
              <Text style={{ color:'#FFF', fontSize:16, fontWeight:'800' }}>✅ Sharing...</Text>
            </View>
          ) : (
            <View style={sh.channelRow}>
              {[{icon:'💬',label:'WhatsApp'},{icon:'📱',label:'SMS'},{icon:'📋',label:'Copy'},{icon:'📧',label:'Email'}].map(c => (
                <TouchableOpacity key={c.label} style={sh.channelBtn} onPress={() => share(c.label)}>
                  <Text style={{ fontSize:22 }}>{c.icon}</Text>
                  <Text style={sh.channelText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
            <Text style={sh.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const sh = StyleSheet.create({
  overlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  sheet:       { borderTopLeftRadius:24, borderTopRightRadius:24, padding:22, paddingBottom:36 },
  handle:      { width:40, height:4, backgroundColor:'rgba(255,255,255,0.3)', borderRadius:2, alignSelf:'center', marginBottom:16 },
  title:       { fontSize:18, fontWeight:'800', color:'#FFF', marginBottom:14 },
  otpBox:      { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:16, padding:16, alignItems:'center', marginBottom:14 },
  otpLabel:    { fontSize:10, fontWeight:'800', color:'rgba(255,255,255,0.7)', letterSpacing:2, marginBottom:6 },
  otpValue:    { fontSize:42, fontWeight:'900', color:'#FFF', letterSpacing:12, fontFamily:'monospace' },
  otpHint:     { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:6 },
  msgBox:      { backgroundColor:'rgba(255,255,255,0.15)', borderRadius:12, padding:12, marginBottom:14 },
  msgText:     { fontSize:12, color:'rgba(255,255,255,0.9)', lineHeight:18, fontFamily:'monospace' },
  channelRow:  { flexDirection:'row', gap:8, marginBottom:8 },
  channelBtn:  { flex:1, alignItems:'center', backgroundColor:'rgba(255,255,255,0.2)', borderRadius:14, paddingVertical:12 },
  channelText: { fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.85)', marginTop:4 },
  cancelBtn:   { paddingVertical:14, alignItems:'center' },
  cancelText:  { color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:'700' },
});

// ─── Delivery Card ────────────────────────────────────────────────────────────
function DeliveryCard({ del, onShare, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const meta  = STATUS_META[del.status] || STATUS_META.PENDING;
  const prov  = PROVIDERS.find(p => p.key === del.provider) || PROVIDERS[7];
  const canCancel = del.status === 'PENDING';

  return (
    <TouchableOpacity style={[s.card, expanded && {borderColor:V.primary}]}
      onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={[s.provIcon, { backgroundColor: prov.bg }]}>
          <Text style={{ fontSize:22 }}>{prov.emoji}</Text>
        </View>
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={s.cardTitle}>{del.provider} Delivery</Text>
          <Text style={s.cardSub}>{fmt(del.createdAt)}</Text>
          {del.expectedWindow && <Text style={s.cardSub}>⏱ {del.expectedWindow}</Text>}
        </View>
        <View style={[s.statusBadge,{backgroundColor:meta.bg}]}>
          <View style={[s.statusDot,{backgroundColor:meta.dot}]}/>
          <Text style={[s.statusText,{color:meta.color}]}>{del.status}</Text>
        </View>
      </View>

      <View style={[s.statusBanner,{backgroundColor:meta.bg,borderColor:meta.color}]}>
        <Text style={[s.statusBannerText,{color:meta.color}]}>{meta.label}</Text>
      </View>

      {expanded && (
        <View style={s.expandBody}>
          <View style={s.divider}/>
          {del.status === 'PENDING' && (
            <View style={s.otpDisplayRow}>
              <Text style={s.otpDisplayLabel}>GATE OTP</Text>
              <Text style={s.otpDisplayValue}>{del.otp}</Text>
              <Text style={s.otpDisplayHint}>Share with delivery person</Text>
            </View>
          )}
          {del.deliveryPersonName ? (
            <View style={s.infoRow}><Text style={s.infoLabel}>Delivery Person</Text><Text style={s.infoValue}>{del.deliveryPersonName}</Text></View>
          ) : null}
          {del.deliveryPersonPhone ? (
            <View style={s.infoRow}><Text style={s.infoLabel}>Phone</Text><Text style={s.infoValue}>{del.deliveryPersonPhone}</Text></View>
          ) : null}
          {del.otpVerifiedAt ? (
            <View style={s.infoRow}><Text style={s.infoLabel}>Guard Verified</Text><Text style={s.infoValue}>{fmt(del.otpVerifiedAt)}</Text></View>
          ) : null}
          {del.deliveredAt ? (
            <View style={s.infoRow}><Text style={s.infoLabel}>Delivered At</Text><Text style={s.infoValue}>{fmt(del.deliveredAt)}</Text></View>
          ) : null}
          <View style={s.actionRow}>
            {del.status === 'PENDING' && (
              <TouchableOpacity style={s.shareBtn} onPress={() => onShare(del)}>
                <Text style={s.shareBtnText}>📤 Share OTP</Text>
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity style={s.cancelDelBtn} onPress={() => onCancel(del)}>
                <Text style={s.cancelDelBtnText}>🗑 Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DeliveryPassScreen({ navigation }) {
  const user         = useAuthStore(s => s.user);
  const deliveries   = useSecurityStore(s => s.deliveries);
  const addDelivery  = useSecurityStore(s => s.addDelivery);

  const myId   = user?.id   || 'res1';
  const myUnit = user?.unit || 'A-101';
  const myName = user?.name || 'Resident';

  const myDeliveries = deliveries
    .filter(d => d.hostResidentId === myId)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [filter, setFilter]       = useState('all');
  const [showForm, setShowForm]   = useState(false);
  const [shareTarget, setShare]   = useState(null);

  // Form state
  const [fProvider,   setFProvider]   = useState('Swiggy');
  const [fName,       setFName]       = useState('');
  const [fPhone,      setFPhone]      = useState('');
  const [fWindow,     setFWindow]     = useState('Within 30 mins');

  const filtered = filter === 'all' ? myDeliveries
    : myDeliveries.filter(d => d.status === filter);

  const FILTERS = [
    {k:'all',     label:'All'},
    {k:'PENDING', label:'⏳ Active'},
    {k:'OTP_VERIFIED', label:'✅ Verified'},
    {k:'DELIVERED',    label:'📦 Delivered'},
  ];

  const handleCreate = () => {
    const delivery = addDelivery({
      provider: fProvider,
      deliveryPersonName: fName.trim() || `${fProvider} Delivery`,
      deliveryPersonPhone: fPhone.trim(),
      expectedWindow: fWindow,
      hostResidentId: myId,
      hostResidentName: myName,
      hostUnit: myUnit,
    });
    setShowForm(false);
    setFProvider('Swiggy'); setFName(''); setFPhone(''); setFWindow('Within 30 mins');
    // Auto-show share modal
    setTimeout(() => setShare(delivery), 400);
  };

  const handleCancel = (del) => {
    Alert.alert('Cancel Pass', `Cancel the delivery pass for ${del.provider}?`, [
      {text:'Keep',style:'cancel'},
      {text:'Cancel Pass',style:'destructive', onPress: () => {
        // Mark cancelled in store using updateDeliveryStatus if it exists, else via local state hack
        // Using securityStore direct set
        useSecurityStore.setState(s => ({
          deliveries: s.deliveries.map(d => d.id === del.id ? {...d, status:'CANCELLED'} : d),
        }));
        Alert.alert('Cancelled','Delivery pass has been cancelled.');
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark}/>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>Delivery Passes</Text>
            <Text style={s.headerSub}>{myDeliveries.filter(d=>d.status==='PENDING').length} active pass{myDeliveries.filter(d=>d.status==='PENDING').length!==1?'es':''}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
            <Text style={s.addBtnText}>+ New Pass</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.k} style={[s.chip, filter===f.k && s.chipActive]} onPress={() => setFilter(f.k)}>
              <Text style={[s.chipText, filter===f.k && s.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoBanner}>
          <Text style={s.infoText}>Create a gate pass before your delivery arrives. Share the OTP with the delivery person — they show it to the guard for entry.</Text>
        </View>

        <Text style={s.sectionLabel}>
          {filter==='all' ? 'ALL DELIVERY PASSES' : filter==='PENDING' ? 'ACTIVE PASSES' : filter+' PASSES'}
          {' '}({filtered.length})
        </Text>

        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize:48,marginBottom:12}}>📦</Text>
            <Text style={s.emptyTitle}>No delivery passes{filter!=='all'?' here':' yet'}</Text>
            <Text style={s.emptySub}>Create a pass before your Swiggy, Amazon or other delivery arrives so the guard can verify them quickly.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={s.emptyBtnText}>+ Create Pass</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(del => (
            <DeliveryCard key={del.id} del={del} onShare={setShare} onCancel={handleCancel}/>
          ))
        )}
        <View style={{height:40}}/>
      </ScrollView>

      {/* Create Form Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.handle}/>
              <View style={m.headerRow}>
                <View>
                  <Text style={m.title}>New Delivery Pass</Text>
                  <Text style={m.sub}>An OTP will be generated for the guard</Text>
                </View>
                <TouchableOpacity style={m.closeBtn} onPress={() => setShowForm(false)}>
                  <Text style={m.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={m.label}>DELIVERY PROVIDER *</Text>
                <View style={m.providerGrid}>
                  {PROVIDERS.map(p => (
                    <TouchableOpacity key={p.key}
                      style={[m.provChip, fProvider===p.key && {backgroundColor:p.color, borderColor:p.color}]}
                      onPress={() => setFProvider(p.key)}>
                      <Text style={{fontSize:18}}>{p.emoji}</Text>
                      <Text style={[m.provText, fProvider===p.key && {color:'#FFF'}]}>{p.key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={m.label}>EXPECTED ARRIVAL</Text>
                <View style={m.chipRow}>
                  {TIME_WINDOWS.map(w => (
                    <TouchableOpacity key={w} style={[m.chip, fWindow===w && m.chipActive]} onPress={() => setFWindow(w)}>
                      <Text style={[m.chipText, fWindow===w && {color:'#FFF'}]}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={m.label}>DELIVERY PERSON NAME (optional)</Text>
                <TextInput style={m.input} value={fName} onChangeText={setFName}
                  placeholder="e.g. Ravi Kumar" placeholderTextColor={V.textMuted}/>

                <Text style={m.label}>DELIVERY PERSON PHONE (optional)</Text>
                <TextInput style={m.input} value={fPhone} onChangeText={setFPhone}
                  placeholder="10-digit mobile" placeholderTextColor={V.textMuted}
                  keyboardType="phone-pad" maxLength={10}/>

                <TouchableOpacity style={m.createBtn} onPress={handleCreate}>
                  <Text style={m.createBtnText}>🎫  Generate Delivery Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={m.cancelBtn} onPress={() => setShowForm(false)}>
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ShareOTPModal visible={!!shareTarget} delivery={shareTarget} onClose={() => setShare(null)}/>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor:V.bg },
  header:{ backgroundColor:V.header, paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
  backText:{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:{ flexDirection:'row', alignItems:'center', marginBottom:12 },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#FFF' },
  headerSub:{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 },
  addBtn:{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:16, paddingVertical:8, borderRadius:20 },
  addBtnText:{ color:'#FFF', fontWeight:'700', fontSize:14 },
  filterRow:{ flexDirection:'row', gap:8, paddingBottom:2 },
  chip:{ paddingHorizontal:14, paddingVertical:6, borderRadius:20, backgroundColor:'rgba(255,255,255,0.15)', borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  chipActive:{ backgroundColor:'#FFF' },
  chipText:{ fontSize:12, fontWeight:'600', color:'rgba(255,255,255,0.85)' },
  chipTextActive:{ color:V.primary },
  body:{ padding:16 },
  infoBanner:{ backgroundColor:V.chip, borderRadius:12, padding:14, marginBottom:14, borderWidth:1, borderColor:V.border },
  infoText:{ fontSize:13, color:V.textSub, lineHeight:20 },
  sectionLabel:{ fontSize:11, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginBottom:10 },
  card:{ backgroundColor:V.surface, borderRadius:16, borderWidth:1, borderColor:V.border, padding:14, marginBottom:10, elevation:1 },
  cardHeader:{ flexDirection:'row', alignItems:'flex-start', marginBottom:8 },
  provIcon:{ width:46, height:46, borderRadius:23, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:V.border },
  cardTitle:{ fontSize:15, fontWeight:'800', color:V.text },
  cardSub:{ fontSize:12, color:V.textMuted, marginTop:2 },
  statusBadge:{ flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:9, paddingVertical:4, borderRadius:20 },
  statusDot:{ width:6, height:6, borderRadius:3 },
  statusText:{ fontSize:10, fontWeight:'800' },
  statusBanner:{ paddingVertical:6, paddingHorizontal:12, borderRadius:8, borderWidth:1, alignSelf:'flex-start', marginBottom:4 },
  statusBannerText:{ fontSize:12, fontWeight:'700' },
  expandBody:{ marginTop:8 },
  divider:{ height:1, backgroundColor:V.divider, marginBottom:12 },
  otpDisplayRow:{ backgroundColor:V.chip, borderRadius:12, padding:16, alignItems:'center', marginBottom:12, borderWidth:1, borderColor:V.border },
  otpDisplayLabel:{ fontSize:10, fontWeight:'800', color:V.textMuted, letterSpacing:2, marginBottom:4 },
  otpDisplayValue:{ fontSize:36, fontWeight:'900', color:V.primary, letterSpacing:10, fontFamily:'monospace' },
  otpDisplayHint:{ fontSize:11, color:V.textMuted, marginTop:4 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:V.divider },
  infoLabel:{ fontSize:13, color:V.textMuted, fontWeight:'600' },
  infoValue:{ fontSize:13, fontWeight:'700', color:V.text },
  actionRow:{ flexDirection:'row', gap:10, marginTop:12 },
  shareBtn:{ flex:1, backgroundColor:V.successBg, borderRadius:12, paddingVertical:10, alignItems:'center', borderWidth:1, borderColor:V.border },
  shareBtnText:{ fontSize:13, fontWeight:'700', color:V.primary },
  cancelDelBtn:{ flex:1, backgroundColor:V.dangerBg, borderRadius:12, paddingVertical:10, alignItems:'center', borderWidth:1, borderColor:'#FFCDD2' },
  cancelDelBtnText:{ fontSize:13, fontWeight:'700', color:V.danger },
  empty:{ alignItems:'center', paddingVertical:40, paddingHorizontal:24 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:V.text, marginBottom:8 },
  emptySub:{ fontSize:13, color:V.textMuted, textAlign:'center', lineHeight:20, marginBottom:16 },
  emptyBtn:{ backgroundColor:V.primary, paddingHorizontal:24, paddingVertical:10, borderRadius:20 },
  emptyBtnText:{ color:'#FFF', fontWeight:'700', fontSize:14 },
});

const m = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:V.surface, borderTopLeftRadius:24, borderTopRightRadius:24, padding:22, paddingBottom:40, maxHeight:'92%' },
  handle:{ width:40, height:4, backgroundColor:V.border, borderRadius:2, alignSelf:'center', marginBottom:18 },
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  title:{ fontSize:19, fontWeight:'800', color:V.text },
  sub:{ fontSize:12, color:V.textMuted, marginTop:2 },
  closeBtn:{ width:32, height:32, borderRadius:16, backgroundColor:'#F1F5F9', alignItems:'center', justifyContent:'center' },
  closeX:{ fontSize:13, fontWeight:'700', color:'#64748B' },
  label:{ fontSize:11, fontWeight:'800', color:V.textSub, letterSpacing:0.5, marginBottom:8 },
  providerGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  provChip:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:V.chip, borderRadius:20, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:V.border },
  provText:{ fontSize:12, fontWeight:'700', color:V.textSub },
  chipRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  chip:{ paddingHorizontal:12, paddingVertical:7, borderRadius:20, backgroundColor:V.chip, borderWidth:1, borderColor:V.border },
  chipActive:{ backgroundColor:V.primary, borderColor:V.primary },
  chipText:{ fontSize:12, fontWeight:'600', color:V.textSub },
  input:{ backgroundColor:'#F5FAFA', borderWidth:1.5, borderColor:V.border, borderRadius:12, paddingHorizontal:14, paddingVertical:12, fontSize:14, color:V.text, marginBottom:14 },
  createBtn:{ backgroundColor:V.primary, borderRadius:14, paddingVertical:15, alignItems:'center', marginTop:4 },
  createBtnText:{ color:'#FFF', fontSize:15, fontWeight:'800' },
  cancelBtn:{ paddingVertical:14, alignItems:'center' },
  cancelText:{ fontSize:14, fontWeight:'600', color:V.textMuted },
});