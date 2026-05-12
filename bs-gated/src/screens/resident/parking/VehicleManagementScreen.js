/**
 * VehicleManagementScreen.js — Module 4: Vehicle & Parking
 *
 * Full vehicle management: registered vehicles from profileData + extras.
 * Real-world features:
 *  - View all registered vehicles with type, colour, model
 *  - Insurance expiry date + renewal reminder toggle
 *  - PUC (Pollution) certificate expiry + reminder
 *  - Digital vehicle sticker (shows unit, owner, society)
 *  - RFID tag status (assigned / pending)
 *  - Add/Edit/Delete vehicles (delegates to PersonalInfo store)
 *  - Quick navigate to GuestParking
 *  - Quick navigate to ParkingSlotPass (resident's own parking)
 *
 * Theme: VisitorListScreen tokens.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore }   from '../../../store/AuthStore';
import useResidentStore   from '../../../store/residentStore';

const V = {
  header:'#1A7A7A', headerDark:'#0D6E6E',
  bg:'#E8F5F5', surface:'#FFFFFF',
  border:'#D0EEEE', divider:'#E8F5F5',
  text:'#1A2E2E', textSub:'#3D6E6E', textMuted:'#7A9E9E',
  primary:'#1A7A7A', chip:'#F0FAFA',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  successBg:'#CCFBF1',
};

const VEH_TYPES = ['Car','Bike','Scooter','Electric Car','Electric Bike','Cycle','Other'];
const VEH_EMOJI = { Car:'🚗', Bike:'🏍️', Scooter:'🛵','Electric Car':'⚡🚗','Electric Bike':'⚡🏍️', Cycle:'🚲', Other:'🚘' };

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86400000);
}

function expiryColor(days) {
  if (days === null) return V.textMuted;
  if (days < 0)   return V.danger;
  if (days < 30)  return V.warning;
  return V.primary;
}

function expiryLabel(days, label) {
  if (days === null) return `${label}: Not set`;
  if (days < 0)  return `${label}: Expired ${Math.abs(days)}d ago`;
  if (days === 0) return `${label}: Expires TODAY`;
  if (days < 30) return `${label}: Expires in ${days} days`;
  return `${label}: Valid (${days}d left)`;
}

// ─── Digital Vehicle Sticker ──────────────────────────────────────────────────
function StickerModal({ vehicle, user, society, onClose }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.overlay}>
        <View style={st.sticker}>
          <View style={st.stickerHeader}>
            <Text style={st.stickerSociety}>{society?.name || 'BS Gated Community'}</Text>
            <Text style={st.stickerSub}>RESIDENT VEHICLE STICKER</Text>
          </View>
          <View style={st.stickerBody}>
            <Text style={st.stickerEmoji}>{VEH_EMOJI[vehicle.type] || '🚗'}</Text>
            <Text style={st.stickerPlate}>{vehicle.number}</Text>
            <Text style={st.stickerModel}>{vehicle.type}{vehicle.model ? ` · ${vehicle.model}` : ''}</Text>
            {vehicle.colour ? <Text style={st.stickerColour}>{vehicle.colour}</Text> : null}
          </View>
          <View style={st.stickerFooter}>
            <Text style={st.stickerOwner}>Unit {user?.unit || '—'} · {user?.name || 'Resident'}</Text>
            {vehicle.rfidStatus === 'assigned' ? (
              <View style={st.rfidBadge}><Text style={st.rfidText}>🔵 RFID Assigned</Text></View>
            ) : (
              <View style={[st.rfidBadge,{backgroundColor:'#FEF3C7'}]}><Text style={[st.rfidText,{color:'#E65100'}]}>⏳ RFID Pending</Text></View>
            )}
          </View>
        </View>
        <TouchableOpacity style={st.closeBtn} onPress={onClose}>
          <Text style={st.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
const st = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding:24 },
  sticker:{ backgroundColor:'#FFF', borderRadius:20, overflow:'hidden', width:'100%', maxWidth:340, elevation:8 },
  stickerHeader:{ backgroundColor:V.primary, padding:16, alignItems:'center' },
  stickerSociety:{ fontSize:16, fontWeight:'900', color:'#FFF' },
  stickerSub:{ fontSize:10, color:'rgba(255,255,255,0.7)', letterSpacing:2, marginTop:2 },
  stickerBody:{ padding:24, alignItems:'center' },
  stickerEmoji:{ fontSize:48, marginBottom:10 },
  stickerPlate:{ fontSize:28, fontWeight:'900', color:V.text, letterSpacing:4, fontFamily:'monospace', marginBottom:6 },
  stickerModel:{ fontSize:14, fontWeight:'700', color:V.textSub, marginBottom:4 },
  stickerColour:{ fontSize:12, color:V.textMuted },
  stickerFooter:{ backgroundColor:V.chip, padding:14, alignItems:'center', gap:8 },
  stickerOwner:{ fontSize:13, fontWeight:'700', color:V.textSub },
  rfidBadge:{ backgroundColor:V.successBg, paddingHorizontal:12, paddingVertical:5, borderRadius:20 },
  rfidText:{ fontSize:11, fontWeight:'800', color:V.primary },
  closeBtn:{ marginTop:20, backgroundColor:'rgba(255,255,255,0.9)', paddingHorizontal:32, paddingVertical:12, borderRadius:20 },
  closeBtnText:{ fontSize:14, fontWeight:'700', color:V.text },
});

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({ v, user, society, onEdit, onDelete, onSticker }) {
  const [expanded, setExpanded] = useState(false);
  const insurDays = daysUntil(v.insuranceExpiry);
  const pucDays   = daysUntil(v.pucExpiry);
  const hasAlert  = (insurDays !== null && insurDays < 30) || (pucDays !== null && pucDays < 30);

  return (
    <TouchableOpacity style={[s.card, hasAlert && {borderColor:V.warning, borderWidth:1.5}]}
      onPress={() => setExpanded(x => !x)} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={[s.vehIcon, {backgroundColor: v.type?.includes('Electric') ? '#E0F2FE' : V.chip}]}>
          <Text style={{fontSize:24}}>{VEH_EMOJI[v.type] || '🚗'}</Text>
        </View>
        <View style={{flex:1, marginLeft:12}}>
          <Text style={s.cardPlate}>{v.number}</Text>
          <Text style={s.cardSub}>{v.type}{v.model ? ` · ${v.model}` : ''}{v.colour ? ` · ${v.colour}` : ''}</Text>
        </View>
        <View style={{alignItems:'flex-end', gap:4}}>
          {v.rfidStatus === 'assigned' ? (
            <View style={s.rfidBadge}><Text style={s.rfidText}>RFID ✓</Text></View>
          ) : (
            <View style={[s.rfidBadge,{backgroundColor:V.warningBg}]}><Text style={[s.rfidText,{color:V.warning}]}>RFID ⏳</Text></View>
          )}
          {hasAlert && <View style={[s.rfidBadge,{backgroundColor:V.dangerBg}]}><Text style={[s.rfidText,{color:V.danger}]}>⚠️ Expiry</Text></View>}
        </View>
      </View>

      {expanded && (
        <View style={s.expandBody}>
          <View style={s.divider}/>
          {/* Insurance */}
          <View style={[s.docRow, {borderColor: expiryColor(insurDays)+'40'}]}>
            <Text style={s.docIcon}>🛡️</Text>
            <View style={{flex:1}}>
              <Text style={[s.docLabel, {color: expiryColor(insurDays)}]}>{expiryLabel(insurDays,'Insurance')}</Text>
              {v.insurancePolicy ? <Text style={s.docSub}>Policy: {v.insurancePolicy}</Text> : null}
            </View>
          </View>
          {/* PUC */}
          <View style={[s.docRow, {borderColor: expiryColor(pucDays)+'40'}]}>
            <Text style={s.docIcon}>♻️</Text>
            <View style={{flex:1}}>
              <Text style={[s.docLabel, {color: expiryColor(pucDays)}]}>{expiryLabel(pucDays,'PUC Certificate')}</Text>
            </View>
          </View>
          {/* Actions */}
          <View style={s.actionRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => onSticker(v)}>
              <Text style={s.actionText}>🏷️ Sticker</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => onEdit(v)}>
              <Text style={s.actionText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn,{backgroundColor:V.dangerBg,borderColor:'#FFCDD2'}]} onPress={() => onDelete(v)}>
              <Text style={[s.actionText,{color:V.danger}]}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VehicleManagementScreen({ navigation }) {
  const user     = useAuthStore(s => s.user);
  const society  = useResidentStore(s => s.society);
  const profileData   = useResidentStore(s => s.profileData);
  const addVehicle    = useResidentStore(s => s.addVehicle);
  const updateVehicle = useResidentStore(s => s.updateVehicle);
  const deleteVehicle = useResidentStore(s => s.deleteVehicle);

  const vehicles = profileData?.vehicles || [];
  const [stickerVeh, setStickerVeh] = useState(null);

  // Edit/Add form
  const [showForm, setShowForm]   = useState(false);
  const [editing,  setEditing]    = useState(null);
  const [fNum,  setFNum]    = useState('');
  const [fType, setFType]   = useState('Car');
  const [fModel,setFModel]  = useState('');
  const [fColour,setFColour]= useState('');
  const [fInsDate,setFInsDate]=useState('');
  const [fInsPolicy,setFInsPolicy]=useState('');
  const [fPucDate,setFPucDate]=useState('');
  const [fRfid, setFRfid]   = useState('pending');

  const openAdd = () => {
    setEditing(null);
    setFNum('');setFType('Car');setFModel('');setFColour('');
    setFInsDate('');setFInsPolicy('');setFPucDate('');setFRfid('pending');
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setFNum(v.number);setFType(v.type||'Car');setFModel(v.model||'');setFColour(v.colour||'');
    setFInsDate(v.insuranceExpiry||'');setFInsPolicy(v.insurancePolicy||'');
    setFPucDate(v.pucExpiry||'');setFRfid(v.rfidStatus||'pending');
    setShowForm(true);
  };

  const saveVehicle = () => {
    if (!fNum.trim()) return Alert.alert('Required','Enter vehicle number.');
    const num = fNum.trim().toUpperCase().replace(/\s/g,'');
    if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(num))
      return Alert.alert('Invalid','Enter valid Indian vehicle number (e.g. TS09AB1234).');
    const data = { number:num, type:fType, model:fModel.trim(), colour:fColour.trim(),
                   insuranceExpiry:fInsDate.trim(), insurancePolicy:fInsPolicy.trim(),
                   pucExpiry:fPucDate.trim(), rfidStatus:fRfid };
    if (editing) {
      updateVehicle(editing.id, data);
    } else {
      if (vehicles.some(v => v.number === num))
        return Alert.alert('Duplicate',`Vehicle ${num} already registered.`);
      addVehicle(data);
    }
    setShowForm(false);
    Alert.alert('✅ Saved', editing ? 'Vehicle updated.' : 'Vehicle registered.');
  };

  const confirmDelete = (v) => {
    Alert.alert('Delete Vehicle',`Remove ${v.number}?`,[
      {text:'Cancel',style:'cancel'},
      {text:'Delete',style:'destructive', onPress:() => deleteVehicle(v.id)},
    ]);
  };

  const expiringVehicles = vehicles.filter(v => {
    const ins = daysUntil(v.insuranceExpiry);
    const puc = daysUntil(v.pucExpiry);
    return (ins!==null && ins<30) || (puc!==null && puc<30);
  });

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark}/>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>My Vehicles</Text>
            <Text style={s.headerSub}>{vehicles.length} vehicle{vehicles.length!==1?'s':''} registered</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Text style={s.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Expiry alerts */}
        {expiringVehicles.length > 0 && (
          <View style={s.alertBanner}>
            <Text style={s.alertBannerText}>
              ⚠️ {expiringVehicles.length} vehicle{expiringVehicles.length!==1?'s have':' has'} expiring documents — tap vehicle to update.
            </Text>
          </View>
        )}

        {/* Quick links */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickBtn} onPress={() => navigation?.navigate('GuestParking')}>
            <Text style={{fontSize:22}}>🅿️</Text>
            <Text style={s.quickText}>Guest Parking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => navigation?.navigate('ParkingSlotPass')}>
            <Text style={{fontSize:22}}>🏷️</Text>
            <Text style={s.quickText}>My Parking Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => navigation?.navigate('EVCharging')}>
            <Text style={{fontSize:22}}>⚡</Text>
            <Text style={s.quickText}>EV Charging</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>REGISTERED VEHICLES ({vehicles.length})</Text>

        {vehicles.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize:48, marginBottom:12}}>🚗</Text>
            <Text style={s.emptyTitle}>No vehicles registered</Text>
            <Text style={s.emptySub}>Register your vehicles for faster gate entry, parking allocation and insurance/PUC reminders.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAdd}>
              <Text style={s.emptyBtnText}>+ Register Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map(v => (
            <VehicleCard key={v.id} v={v} user={user} society={society}
              onEdit={openEdit} onDelete={confirmDelete} onSticker={setStickerVeh}/>
          ))
        )}
        <View style={{height:40}}/>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.handle}/>
              <View style={m.headerRow}>
                <View>
                  <Text style={m.title}>{editing ? 'Edit Vehicle' : 'Register Vehicle'}</Text>
                  <Text style={m.sub}>Unit {user?.unit || '—'}</Text>
                </View>
                <TouchableOpacity style={m.closeBtn} onPress={() => setShowForm(false)}>
                  <Text style={m.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <Text style={m.label}>VEHICLE NUMBER *</Text>
                <TextInput style={m.input} value={fNum} onChangeText={setFNum}
                  placeholder="e.g. TS09AB1234" placeholderTextColor={V.textMuted}
                  autoCapitalize="characters" maxLength={12}/>

                <Text style={m.label}>VEHICLE TYPE *</Text>
                <View style={m.chipRow}>
                  {VEH_TYPES.map(t => (
                    <TouchableOpacity key={t} style={[m.chip, fType===t && m.chipActive]} onPress={() => setFType(t)}>
                      <Text style={[m.chipText, fType===t && {color:'#FFF'}]}>{VEH_EMOJI[t]} {t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {[
                  {label:'MAKE / MODEL', val:fModel, set:setFModel, ph:'e.g. Maruti Swift'},
                  {label:'COLOUR',       val:fColour, set:setFColour, ph:'e.g. White'},
                  {label:'INSURANCE POLICY NUMBER', val:fInsPolicy, set:setFInsPolicy, ph:'e.g. POL-2024-XXXX'},
                  {label:'INSURANCE EXPIRY DATE',   val:fInsDate,   set:setFInsDate,   ph:'e.g. 31 Dec 2025'},
                  {label:'PUC CERTIFICATE EXPIRY',  val:fPucDate,   set:setFPucDate,   ph:'e.g. 30 Jun 2025'},
                ].map(f => (
                  <View key={f.label} style={{marginBottom:14}}>
                    <Text style={m.label}>{f.label}</Text>
                    <TextInput style={m.input} value={f.val} onChangeText={f.set}
                      placeholder={f.ph} placeholderTextColor={V.textMuted}/>
                  </View>
                ))}

                <Text style={m.label}>RFID TAG STATUS</Text>
                <View style={m.chipRow}>
                  {[{k:'pending',l:'⏳ Pending'},{k:'assigned',l:'✅ Assigned'}].map(o => (
                    <TouchableOpacity key={o.k} style={[m.chip, fRfid===o.k && m.chipActive]} onPress={() => setFRfid(o.k)}>
                      <Text style={[m.chipText, fRfid===o.k && {color:'#FFF'}]}>{o.l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={m.saveBtn} onPress={saveVehicle}>
                  <Text style={m.saveBtnText}>✅  {editing ? 'Update' : 'Register'} Vehicle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={m.cancelBtn} onPress={() => setShowForm(false)}>
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sticker Modal */}
      {stickerVeh && (
        <StickerModal vehicle={stickerVeh} user={user} society={society} onClose={() => setStickerVeh(null)}/>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor:V.bg },
  header:{ backgroundColor:V.header, paddingTop:44, paddingHorizontal:20, paddingBottom:16 },
  backBtn:{ marginBottom:10 }, backText:{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:'600' },
  headerRow:{ flexDirection:'row', alignItems:'center' },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#FFF' },
  headerSub:{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 },
  addBtn:{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:16, paddingVertical:8, borderRadius:20 },
  addBtnText:{ color:'#FFF', fontWeight:'700', fontSize:14 },
  body:{ padding:16 },
  alertBanner:{ backgroundColor:V.warningBg, borderRadius:10, padding:12, marginBottom:12, borderWidth:1, borderColor:'#FDE68A' },
  alertBannerText:{ fontSize:12, fontWeight:'700', color:V.warning },
  quickRow:{ flexDirection:'row', gap:10, marginBottom:16 },
  quickBtn:{ flex:1, backgroundColor:V.surface, borderRadius:12, padding:12, alignItems:'center', gap:4, borderWidth:1, borderColor:V.border },
  quickText:{ fontSize:11, fontWeight:'700', color:V.textSub, textAlign:'center' },
  sectionLabel:{ fontSize:11, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginBottom:10 },
  card:{ backgroundColor:V.surface, borderRadius:14, borderWidth:1, borderColor:V.border, padding:14, marginBottom:10 },
  cardHeader:{ flexDirection:'row', alignItems:'center' },
  vehIcon:{ width:52, height:52, borderRadius:14, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:V.border },
  cardPlate:{ fontSize:17, fontWeight:'900', color:V.text, letterSpacing:2, fontFamily:'monospace' },
  cardSub:{ fontSize:12, color:V.textMuted, marginTop:3 },
  rfidBadge:{ backgroundColor:V.successBg, paddingHorizontal:8, paddingVertical:3, borderRadius:10 },
  rfidText:{ fontSize:10, fontWeight:'800', color:V.primary },
  expandBody:{ marginTop:8 },
  divider:{ height:1, backgroundColor:V.divider, marginBottom:12 },
  docRow:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F8FAFA', borderRadius:10, padding:10, borderWidth:1, marginBottom:8 },
  docIcon:{ fontSize:18 },
  docLabel:{ fontSize:13, fontWeight:'700' },
  docSub:{ fontSize:11, color:V.textMuted, marginTop:2 },
  actionRow:{ flexDirection:'row', gap:8, marginTop:4 },
  actionBtn:{ flex:1, alignItems:'center', paddingVertical:9, borderRadius:10, backgroundColor:V.chip, borderWidth:1, borderColor:V.border },
  actionText:{ fontSize:12, fontWeight:'700', color:V.primary },
  empty:{ alignItems:'center', paddingVertical:40 },
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
  chipRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  chip:{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:V.chip, borderWidth:1, borderColor:V.border },
  chipActive:{ backgroundColor:V.primary, borderColor:V.primary },
  chipText:{ fontSize:12, fontWeight:'700', color:V.textSub },
  input:{ backgroundColor:'#F5FAFA', borderWidth:1.5, borderColor:V.border, borderRadius:12, paddingHorizontal:14, paddingVertical:12, fontSize:14, color:V.text, marginBottom:0 },
  saveBtn:{ backgroundColor:V.primary, borderRadius:14, paddingVertical:15, alignItems:'center', marginTop:8 },
  saveBtnText:{ color:'#FFF', fontSize:15, fontWeight:'800' },
  cancelBtn:{ paddingVertical:14, alignItems:'center' },
  cancelText:{ fontSize:14, fontWeight:'600', color:V.textMuted },
});