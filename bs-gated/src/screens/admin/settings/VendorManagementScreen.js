/**
 * VendorManagementScreen.js — Admin → Vendor Management
 * Scope Module 14: Vendor Management
 * - Approved vendor directory (category-wise)
 * - Performance monitoring (rating, jobs completed, response time)
 * - Contract management (active/expired)
 * - Approve new vendors / blacklist underperformers
 * Store: adminStore.vendors + addVendor, updateVendor, toggleVendorActive, blacklistVendor
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Modal, FlatList,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal:'#1A7A7A', tealDark:'#0D6E6E', tealSoft:'#E8F5F5',
  bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', textSub:'#3D6E6E', border:'#D0EEEE',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  success:'#2E7D32', successBg:'#E8F5E9',
};

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Cleaning', 'Pest Control', 'Security', 'IT/CCTV', 'Landscaping', 'Other'];

const SEED_VENDORS = [
  { id: 2, name: 'Bob Vendor',       company: 'Fix-It Pro',       category: 'Plumbing',    phone: '8765432100', rating: 4.5, jobsDone: 28, responseTime: '2h', status: 'active',   contractEnd: '2025-12-31', email: 'bob@fixit.com' },
  { id: 101, name: 'Alice Vendor',     company: 'Quick Repairs',    category: 'Electrical',  phone: '8765432101', rating: 4.2, jobsDone: 19, responseTime: '3h', status: 'active',   contractEnd: '2025-09-30', email: 'alice@qr.com' },
  { id: 102, name: 'Suresh Works',     company: 'Paint Masters',    category: 'Painting',    phone: '8765432102', rating: 3.9, jobsDone: 12, responseTime: '4h', status: 'active',   contractEnd: '2025-06-30', email: 'suresh@pm.com' },
  { id: 103, name: 'Clean Pro',        company: 'Spotless Society', category: 'Cleaning',    phone: '8765432103', rating: 4.7, jobsDone: 45, responseTime: '1h', status: 'active',   contractEnd: '2026-01-31', email: 'clean@sp.com' },
  { id: 104, name: 'Raju Carpenter',   company: 'Wood Craft',       category: 'Carpentry',   phone: '8765432104', rating: 4.0, jobsDone: 8,  responseTime: '5h', status: 'inactive', contractEnd: '2025-03-31', email: 'raju@wc.com' },
];

function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= full ? '#F59E0B' : i === full+1 && hasHalf ? '#F59E0B' : '#D1D5DB' }}>
          {i <= full ? '★' : i === full+1 && hasHalf ? '½' : '☆'}
        </Text>
      ))}
      <Text style={{ fontSize: 11, color: P.textMuted, marginLeft: 3 }}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function VendorCard({ vendor, onPress, onToggle, onBlacklist }) {
  const isActive = vendor.status === 'active';
  const isExpiring = vendor.contractEnd && new Date(vendor.contractEnd) < new Date(Date.now() + 30*24*3600000);

  return (
    <TouchableOpacity style={s.vcard} onPress={() => onPress(vendor)} activeOpacity={0.85}>
      <View style={s.vcardTop}>
        <View style={s.vavatar}>
          <Text style={{ fontSize: 22 }}>🔧</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.vname}>{vendor.company}</Text>
          <Text style={s.vsub}>{vendor.name} · {vendor.category}</Text>
          <StarRating rating={vendor.rating} />
        </View>
        <View style={[s.vstatus, { backgroundColor: isActive ? P.successBg : P.dangerBg }]}>
          <Text style={[s.vstatusText, { color: isActive ? P.success : P.danger }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={s.vmetaRow}>
        <View style={s.vmeta}>
          <Text style={s.vmetaVal}>{vendor.jobsDone}</Text>
          <Text style={s.vmetaLabel}>Jobs Done</Text>
        </View>
        <View style={s.vmeta}>
          <Text style={s.vmetaVal}>{vendor.responseTime}</Text>
          <Text style={s.vmetaLabel}>Avg Response</Text>
        </View>
        <View style={s.vmeta}>
          <Text style={[s.vmetaVal, isExpiring && { color: P.warning }]}>
            {vendor.contractEnd ? vendor.contractEnd.slice(0, 7) : '—'}
          </Text>
          <Text style={s.vmetaLabel}>Contract End</Text>
        </View>
      </View>

      {isExpiring && (
        <View style={s.expiring}>
          <Text style={s.expiringText}>⚠️ Contract expiring soon</Text>
        </View>
      )}

      <View style={s.vactions}>
        <TouchableOpacity style={[s.vbtn, { backgroundColor: isActive ? P.dangerBg : P.successBg }]}
          onPress={() => onToggle(vendor)}>
          <Text style={[s.vbtnText, { color: isActive ? P.danger : P.success }]}>
            {isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.vbtn, { backgroundColor: P.dangerBg }]} onPress={() => onBlacklist(vendor)}>
          <Text style={[s.vbtnText, { color: P.danger }]}>Blacklist</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function VendorManagementScreen({ navigation }) {
  const storedVendors    = useAdminStore(st => st.vendors);
  const addVendor        = useAdminStore(st => st.addVendor);
  const registerNewUser  = useAuthStore(st => st.registerNewUser);
  const updateVendor     = useAdminStore(st => st.updateVendor);
  const addToBlacklist   = useAdminStore(st => st.addToBlacklist);

  // Merge seed + store vendors
  const vendors = (storedVendors && storedVendors.length > 0) ? storedVendors : SEED_VENDORS;

  const [search,   setSearch]   = useState('');
  const [catTab,   setCatTab]   = useState('All');
  const [showAdd,  setShowAdd]  = useState(false);
  const [selected, setSelected] = useState(null);

  // Add vendor form
  const [form, setForm] = useState({ name:'', company:'', category:'Plumbing', phone:'', email:'', contractEnd:'' });

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      const matchCat    = catTab === 'All' || v.category === catTab;
      const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase())
                       || v.company.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [vendors, catTab, search]);

  const handleToggle = (vendor) => {
    const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
    Alert.alert(
      newStatus === 'active' ? 'Activate Vendor' : 'Deactivate Vendor',
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} ${vendor.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateVendor(vendor.id, { status: newStatus }) },
      ]
    );
  };

  const handleBlacklist = (vendor) => {
    Alert.alert('Blacklist Vendor', `Blacklist ${vendor.company}? They will be removed from the approved vendor list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Blacklist',
        style: 'destructive',
        onPress: () => {
          addToBlacklist({ name: vendor.company, phone: vendor.phone, reason: 'Vendor blacklisted by Admin', type: 'vendor' });
          updateVendor(vendor.id, { status: 'blacklisted' });
          Alert.alert('Done', `${vendor.company} has been blacklisted.`);
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.company.trim() || !form.phone.trim()) {
      Alert.alert('Required', 'Name, company, and phone are required.');
      return;
    }
    const newVendor = {
      ...form,
      role: 'vendor',
      rating: 4.0, jobsDone: 0, responseTime: '—',
      status: 'active', contractEnd: form.contractEnd || '2025-12-31',
    };
    
    const res = await registerNewUser(newVendor);
    if (res.success) {
      addVendor(newVendor);
      setShowAdd(false);
      setForm({ name:'', company:'', category:'Plumbing', phone:'', email:'', contractEnd:'' });
      Alert.alert('Success', `${form.company} has been added and approved.`);
    } else {
      Alert.alert('Error', res.message || 'Failed to add vendor');
    }
  };

  const stats = {
    total:    vendors.length,
    active:   vendors.filter(v => v.status === 'active').length,
    topRated: vendors.filter(v => v.rating >= 4.5).length,
    expiring: vendors.filter(v => v.contractEnd && new Date(v.contractEnd) < new Date(Date.now() + 30*24*3600000)).length,
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>🔧 Vendor Management</Text>
          <Text style={s.headerSub}>Approved vendor directory</Text>
        </View>
        <TouchableOpacity style={s.addHdr} onPress={() => setShowAdd(true)}>
          <Text style={s.addHdrTxt}>+ Add Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={s.statsBar}>
        {[
          { label: 'Total',    val: stats.total,    color: P.teal },
          { label: 'Active',   val: stats.active,   color: P.success },
          { label: 'Top Rated',val: stats.topRated, color: '#F59E0B' },
          { label: 'Expiring', val: stats.expiring, color: P.warning },
        ].map(st => (
          <View key={st.label} style={s.statPill}>
            <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search vendors…"
          placeholderTextColor={P.textMuted}
        />
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat}
            style={[s.catChip, catTab === cat && s.catChipActive]}
            onPress={() => setCatTab(cat)}>
            <Text style={[s.catChipText, catTab === cat && { color: '#FFF' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={v => v.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={setSelected}
            onToggle={handleToggle}
            onBlacklist={handleBlacklist}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={s.emptyText}>No vendors found</Text>
          </View>
        }
      />

      {/* Add Vendor Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Vendor</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={{ fontSize: 22, color: P.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Vendor Name *',   key: 'name',        kb: 'default' },
                { label: 'Company Name *',  key: 'company',     kb: 'default' },
                { label: 'Phone *',         key: 'phone',       kb: 'phone-pad' },
                { label: 'Email',           key: 'email',       kb: 'email-address' },
                { label: 'Contract End (YYYY-MM-DD)', key: 'contractEnd', kb: 'default' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: 12 }}>
                  <Text style={s.fl}>{f.label}</Text>
                  <TextInput
                    style={s.modalInput}
                    value={form[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    keyboardType={f.kb}
                    placeholder={f.label}
                    placeholderTextColor={P.textMuted}
                  />
                </View>
              ))}
              <Text style={s.fl}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.slice(1).map(cat => (
                  <TouchableOpacity key={cat}
                    style={[s.catChip, form.category === cat && s.catChipActive, { marginRight: 8 }]}
                    onPress={() => setForm(p => ({ ...p, category: cat }))}>
                    <Text style={[s.catChipText, form.category === cat && { color: '#FFF' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>
            <TouchableOpacity style={s.modalBtn} onPress={handleAdd}>
              <Text style={s.modalBtnText}>Add Vendor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: P.tealDark },
  header:   { flexDirection: 'row', alignItems: 'center', backgroundColor: P.tealDark, padding: 16, paddingTop: 8 },
  back:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt:  { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  htitle:   { color: '#FFF', fontSize: 17, fontWeight: '800' },
  hsub:     { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  addHdr:   { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addHdrTxt:{ color: '#FFF', fontWeight: '700', fontSize: 13 },

  statsBar:  { flexDirection: 'row', backgroundColor: P.tealDark, paddingHorizontal: 16, paddingBottom: 12 },
  statPill:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  searchWrap:  { backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: { backgroundColor: P.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text, borderWidth: 1, borderColor: P.border },

  catScroll: { backgroundColor: P.bg, paddingVertical: 8, maxHeight: 52 },
  catChip:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: P.border, backgroundColor: P.surface },
  catChipActive: { backgroundColor: P.teal, borderColor: P.teal },
  catChipText:   { fontSize: 12, fontWeight: '600', color: P.textMuted },

  vcard:    { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  vcardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  vavatar:  { width: 48, height: 48, borderRadius: 14, backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vname:    { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 2 },
  vsub:     { fontSize: 12, color: P.textMuted, marginBottom: 4 },
  vstatus:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  vstatusText: { fontSize: 11, fontWeight: '700' },
  vmetaRow: { flexDirection: 'row', marginBottom: 10 },
  vmeta:    { flex: 1, alignItems: 'center' },
  vmetaVal: { fontSize: 15, fontWeight: '800', color: P.text },
  vmetaLabel:{ fontSize: 10, color: P.textMuted, fontWeight: '600', marginTop: 2 },
  expiring: { backgroundColor: P.warningBg, borderRadius: 8, padding: 8, marginBottom: 10 },
  expiringText: { fontSize: 12, color: P.warning, fontWeight: '700' },
  vactions: { flexDirection: 'row', gap: 8 },
  vbtn:     { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  vbtnText: { fontSize: 13, fontWeight: '700' },

  empty:    { alignItems: 'center', paddingTop: 60 },
  emptyText:{ fontSize: 15, color: P.textMuted, fontWeight: '600' },

  fl:        { fontSize: 12, fontWeight: '700', color: P.textSub, marginBottom: 5 },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:     { backgroundColor: P.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:{ fontSize: 18, fontWeight: '800', color: P.text },
  modalInput:{ borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, borderColor: P.border, backgroundColor: P.bg, color: P.text },
  modalBtn:  { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalBtnText:{ color: '#FFF', fontWeight: '800', fontSize: 15 },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  addHdr:      { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addHdrTxt:   { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
