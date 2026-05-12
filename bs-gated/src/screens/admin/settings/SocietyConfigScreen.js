import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

function Field({ label, value, onChange, placeholder, kb }) {
  return (
    <View style={s.fr}>
      <Text style={s.fl}>{label}</Text>
      <TextInput style={s.fi} value={value} onChangeText={onChange}
        placeholder={placeholder || label} placeholderTextColor="#7A9E9E"
        keyboardType={kb || 'default'} />
    </View>
  );
}

export default function SocietyConfigScreen({ navigation }) {
  const cfg    = useAdminStore(st => st.societyConfig) || {};
  const update = useAdminStore(st => st.updateSocietyConfig);
  const [form, setForm] = useState({
    name:         cfg.name         || '',
    address:      cfg.address      || '',
    city:         cfg.city         || '',
    pincode:      cfg.pincode      || '',
    phone:        cfg.phone        || '',
    email:        cfg.email        || '',
    gstNumber:    cfg.gstNumber    || '',
    registrationNo: cfg.registrationNo || '',
    totalFlats:   String(cfg.totalFlats || ''),
    totalBlocks:  String(cfg.totalBlocks || ''),
    maintenanceDueDay: String(cfg.maintenanceDueDay || '5'),
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Society name is required'); return; }
    update && update({ ...form, totalFlats: Number(form.totalFlats), totalBlocks: Number(form.totalBlocks), maintenanceDueDay: Number(form.maintenanceDueDay) });
    Alert.alert('✅ Saved', 'Society configuration updated.');
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
            <Text style={s.headerTitle}>🏢 Society Config</Text>
            <Text style={s.headerSub}>Name, address & settings</Text>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Basic Info</Text>
        <View style={s.card}>
          <Field label="Society Name *" value={form.name} onChange={v=>f('name',v)} />
          <Field label="Address"        value={form.address} onChange={v=>f('address',v)} />
          <Field label="City"           value={form.city} onChange={v=>f('city',v)} />
          <Field label="Pincode"        value={form.pincode} onChange={v=>f('pincode',v)} kb="numeric" />
          <Field label="Phone"          value={form.phone} onChange={v=>f('phone',v)} kb="phone-pad" />
          <Field label="Email"          value={form.email} onChange={v=>f('email',v)} kb="email-address" />
        </View>

        <Text style={s.sectionTitle}>Registration</Text>
        <View style={s.card}>
          <Field label="GST Number"       value={form.gstNumber} onChange={v=>f('gstNumber',v)} />
          <Field label="Registration No." value={form.registrationNo} onChange={v=>f('registrationNo',v)} />
        </View>

        <Text style={s.sectionTitle}>Building Info</Text>
        <View style={s.card}>
          <Field label="Total Flats"     value={form.totalFlats}  onChange={v=>f('totalFlats',v)}  kb="numeric" />
          <Field label="Total Blocks"    value={form.totalBlocks} onChange={v=>f('totalBlocks',v)} kb="numeric" />
          <Field label="Maintenance Due Day (1-31)" value={form.maintenanceDueDay} onChange={v=>f('maintenanceDueDay',v)} kb="numeric" />
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={handleSave}>
          <Text style={s.submitBtnText}>💾 Save Configuration</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#E8F5F5' },
  header:      { backgroundColor:'#1A7A7A', paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
  backText:    { color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle: { fontSize:22, fontWeight:'900', color:'#FFF' },
  headerSub:   { fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:1 },
  saveBtn:     { backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:14, paddingVertical:7, borderRadius:20 },
  saveBtnText: { color:'#FFF', fontSize:13, fontWeight:'700' },
  body:        { padding:16 },
  sectionTitle:{ fontSize:13, fontWeight:'800', color:'#3D6E6E', marginBottom:8, marginTop:8, textTransform:'uppercase', letterSpacing:0.5 },
  card:        { backgroundColor:'#FFF', borderRadius:14, paddingHorizontal:16, marginBottom:14, borderWidth:1, borderColor:'#D0EEEE' },
  fr:          { paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#D0EEEE' },
  fl:          { fontSize:12, fontWeight:'700', color:'#3D6E6E', marginBottom:6 },
  fi:          { fontSize:15, color:'#1A2E2E', fontWeight:'600' },
  submitBtn:   { backgroundColor:'#1A7A7A', borderRadius:14, paddingVertical:16, alignItems:'center', marginTop:8 },
  submitBtnText:{ color:'#FFF', fontSize:15, fontWeight:'800' },
});
