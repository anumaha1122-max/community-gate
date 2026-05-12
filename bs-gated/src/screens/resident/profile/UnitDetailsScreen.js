/**
 * UnitDetailsScreen.js
 *
 * Shows unit details, ownership type, tenant info, documents.
 * Theme: Identical to VisitorListScreen.
 *
 * Real-world features:
 *  - View unit info (block, floor, BHK, sq.ft, facing)
 *  - Switch between Owner / Tenant mode
 *  - Tenant: show lease start/end, landlord details
 *  - Owner: show ownership date, occupied/vacant status
 *  - Registered family count, vehicle count, pet count (live from store)
 *  - Society dues summary (links to billing)
 *  - KYC status (Aadhaar/PAN verified indicator)
 *  - All editable via bottom-sheet forms, persisted in residentStore
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore }  from '../../../store/AuthStore';
import useResidentStore  from '../../../store/residentStore';

const V = {
  header: '#1A7A7A', headerDark: '#0D6E6E',
  bg: '#E8F5F5', surface: '#FFFFFF',
  border: '#D0EEEE', divider: '#E8F5F5',
  text: '#1A2E2E', textSub: '#3D6E6E', textMuted: '#7A9E9E',
  primary: '#1A7A7A', chip: '#E8F5F5',
  danger: '#C62828', dangerBg: '#FEE2E2',
  warning: '#E65100', warningBg: '#FEF3C7',
  successBg: '#CCFBF1',
};

function SectionLabel({ children }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

function InfoRow({ icon, label, value, valueColor, last }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowBorder]}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, valueColor && { color: valueColor }]}>{value || '—'}</Text>
    </View>
  );
}

function StatPill({ emoji, count, label, color }) {
  return (
    <View style={[s.statPill, { borderColor: V.border }]}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[s.statNum, { color: color || V.primary }]}>{count}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const OWNERSHIP_TYPES = ['Owner', 'Tenant'];
const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse'];
const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

export default function UnitDetailsScreen({ navigation }) {
  const user    = useAuthStore(s => s.user);
  const profileData = useResidentStore(s => s.profileData);
  const unitData    = useResidentStore(s => s.unitData);
  const updateUnit  = useResidentStore(s => s.updateUnit);
  const bills       = useResidentStore(s => s.bills);

  const family   = profileData?.family   || [];
  const vehicles = profileData?.vehicles || [];
  const pets     = profileData?.pets     || [];

  const myId = user?.id || 'res1';
  const unpaidBills = bills.filter(b => b.residentId === myId && b.status === 'unpaid');
  const totalDues   = unpaidBills.reduce((s, b) => s + b.total, 0);

  // Merge stored data with defaults
  const unit = {
    block: 'Tower A', floor: '1', bhk: '2 BHK', sqft: '1100',
    facing: 'East', parkingSlot: 'P-12',
    ownershipType: 'Owner',
    ownershipDate: '15 Jan 2020',
    landlordName: '', landlordPhone: '',
    leaseStart: '', leaseEnd: '',
    aadhaarVerified: true, panVerified: false,
    ...unitData,
  };

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});

  const openEdit = () => {
    setForm({ ...unit });
    setShowEdit(true);
  };

  const saveEdit = () => {
    if (!form.ownershipType) return Alert.alert('Required', 'Select ownership type.');
    updateUnit(form);
    setShowEdit(false);
    Alert.alert('✅ Saved', 'Unit details updated.');
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Unit Details</Text>
            <Text style={s.headerSub}>Unit {user?.unit || 'A-101'} · {unit.ownershipType}</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={openEdit}>
            <Text style={s.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Unit card */}
        <View style={[s.card, s.cardAccent]}>
          <View style={s.unitTopRow}>
            <View style={s.unitAvatarWrap}>
              <Text style={{ fontSize: 32 }}>🏠</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.unitNum}>Unit {user?.unit || 'A-101'}</Text>
              <Text style={s.unitSociety}>{useResidentStore.getState().society?.name || 'BS Gated Community'}</Text>
              <View style={[s.ownerBadge, { backgroundColor: unit.ownershipType === 'Owner' ? V.successBg : V.warningBg }]}>
                <Text style={[s.ownerBadgeText, { color: unit.ownershipType === 'Owner' ? V.primary : V.warning }]}>
                  {unit.ownershipType === 'Owner' ? '🔑 Owner' : '🏠 Tenant'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resident stats */}
        <View style={s.statsRow}>
          <StatPill emoji="👨‍👩‍👧" count={family.length}   label="Members"  />
          <StatPill emoji="🚗"     count={vehicles.length} label="Vehicles" />
          <StatPill emoji="🐾"     count={pets.length}     label="Pets"     />
        </View>

        {/* Dues alert */}
        {totalDues > 0 && (
          <TouchableOpacity style={s.duesAlert} onPress={() => navigation.navigate('BillingList')}>
            <Text style={s.duesAlertText}>⚠️  ₹{totalDues.toLocaleString('en-IN')} outstanding dues · Tap to pay →</Text>
          </TouchableOpacity>
        )}

        {/* Unit specs */}
        <SectionLabel>UNIT SPECIFICATIONS</SectionLabel>
        <View style={s.card}>
          <InfoRow icon="🏢" label="Block / Tower" value={unit.block} />
          <InfoRow icon="⬆️" label="Floor"        value={`Floor ${unit.floor}`} />
          <InfoRow icon="🏠" label="BHK Type"     value={unit.bhk} />
          <InfoRow icon="📐" label="Built-up Area" value={unit.sqft ? `${unit.sqft} sq.ft` : null} />
          <InfoRow icon="🧭" label="Facing"       value={unit.facing} />
          <InfoRow icon="🅿️" label="Parking Slot" value={unit.parkingSlot} last />
        </View>

        {/* Ownership details */}
        <SectionLabel>{unit.ownershipType === 'Owner' ? 'OWNERSHIP DETAILS' : 'TENANCY DETAILS'}</SectionLabel>
        <View style={s.card}>
          {unit.ownershipType === 'Owner' ? (
            <>
              <InfoRow icon="📅" label="Ownership Since" value={unit.ownershipDate} />
              <InfoRow icon="🏠" label="Status"          value="Owner Occupied" valueColor={V.primary} last />
            </>
          ) : (
            <>
              <InfoRow icon="👤" label="Landlord Name"  value={unit.landlordName} />
              <InfoRow icon="📱" label="Landlord Phone" value={unit.landlordPhone} />
              <InfoRow icon="📅" label="Lease Start"    value={unit.leaseStart} />
              <InfoRow icon="📅" label="Lease End"      value={unit.leaseEnd} last />
            </>
          )}
        </View>

        {/* KYC status */}
        <SectionLabel>KYC VERIFICATION</SectionLabel>
        <View style={s.card}>
          <InfoRow
            icon="🪪" label="Aadhaar"
            value={unit.aadhaarVerified ? '✅ Verified' : '⚠️ Pending'}
            valueColor={unit.aadhaarVerified ? V.primary : V.warning}
          />
          <InfoRow
            icon="🪪" label="PAN Card"
            value={unit.panVerified ? '✅ Verified' : '⚠️ Pending'}
            valueColor={unit.panVerified ? V.primary : V.warning}
            last
          />
          {(!unit.aadhaarVerified || !unit.panVerified) && (
            <View style={s.kycBanner}>
              <Text style={s.kycText}>Complete KYC verification to access all society services and remove restrictions.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.handle} />
              <View style={m.headerRow}>
                <View>
                  <Text style={m.title}>Edit Unit Details</Text>
                  <Text style={m.subtitle}>Unit {user?.unit || 'A-101'}</Text>
                </View>
                <TouchableOpacity style={m.closeBtn} onPress={() => setShowEdit(false)}>
                  <Text style={m.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Ownership type */}
                <Text style={m.fieldLabel}>OWNERSHIP TYPE *</Text>
                <View style={m.chipRow}>
                  {OWNERSHIP_TYPES.map(t => (
                    <TouchableOpacity key={t} style={[m.chip, form.ownershipType === t && m.chipActive]} onPress={() => set('ownershipType', t)}>
                      <Text style={[m.chipText, form.ownershipType === t && { color: '#FFF' }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* BHK */}
                <Text style={m.fieldLabel}>BHK TYPE</Text>
                <View style={m.chipRow}>
                  {BHK_TYPES.map(t => (
                    <TouchableOpacity key={t} style={[m.chip, form.bhk === t && m.chipActive]} onPress={() => set('bhk', t)}>
                      <Text style={[m.chipText, form.bhk === t && { color: '#FFF' }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Facing */}
                <Text style={m.fieldLabel}>FACING</Text>
                <View style={m.chipRow}>
                  {FACING.map(f => (
                    <TouchableOpacity key={f} style={[m.chip, form.facing === f && m.chipActive]} onPress={() => set('facing', f)}>
                      <Text style={[m.chipText, form.facing === f && { color: '#FFF' }]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sq.ft & parking */}
                {[
                  { key: 'sqft', label: 'BUILT-UP AREA (sq.ft)', kb: 'numeric', ph: 'e.g. 1100' },
                  { key: 'parkingSlot', label: 'PARKING SLOT', ph: 'e.g. P-12' },
                ].map(f => (
                  <View key={f.key} style={{ marginBottom: 14 }}>
                    <Text style={m.fieldLabel}>{f.label}</Text>
                    <TextInput style={m.input} value={form[f.key] || ''} onChangeText={v => set(f.key, v)}
                      placeholder={f.ph} placeholderTextColor={V.textMuted} keyboardType={f.kb || 'default'} />
                  </View>
                ))}

                {/* Tenant-specific fields */}
                {form.ownershipType === 'Tenant' && (
                  <>
                    {[
                      { key: 'landlordName',  label: 'LANDLORD NAME',  ph: 'e.g. Suresh Kumar' },
                      { key: 'landlordPhone', label: 'LANDLORD PHONE', ph: '10-digit mobile', kb: 'phone-pad' },
                      { key: 'leaseStart',    label: 'LEASE START DATE', ph: 'e.g. 01 Jan 2024' },
                      { key: 'leaseEnd',      label: 'LEASE END DATE',   ph: 'e.g. 31 Dec 2024' },
                    ].map(f => (
                      <View key={f.key} style={{ marginBottom: 14 }}>
                        <Text style={m.fieldLabel}>{f.label}</Text>
                        <TextInput style={m.input} value={form[f.key] || ''} onChangeText={v => set(f.key, v)}
                          placeholder={f.ph} placeholderTextColor={V.textMuted} keyboardType={f.kb || 'default'} />
                      </View>
                    ))}
                  </>
                )}

                <TouchableOpacity style={m.saveBtn} onPress={saveEdit}>
                  <Text style={m.saveBtnText}>✅  Save Unit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={m.cancelBtn} onPress={() => setShowEdit(false)}>
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: V.bg },
  header: { backgroundColor: V.header, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  body: { padding: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: V.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  card: { backgroundColor: V.surface, borderRadius: 14, borderWidth: 1, borderColor: V.border, overflow: 'hidden', marginBottom: 4 },
  cardAccent: { borderLeftWidth: 4, borderLeftColor: V.primary, padding: 16, marginBottom: 4 },
  unitTopRow: { flexDirection: 'row', alignItems: 'center' },
  unitAvatarWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: V.chip, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: V.border },
  unitNum: { fontSize: 18, fontWeight: '900', color: V.text },
  unitSociety: { fontSize: 12, color: V.textMuted, marginTop: 2 },
  ownerBadge: { flexDirection: 'row', alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ownerBadgeText: { fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 4 },
  statPill: { flex: 1, backgroundColor: V.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: V.textMuted, marginTop: 2 },
  duesAlert: { backgroundColor: V.warningBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A', marginTop: 10 },
  duesAlertText: { fontSize: 12, fontWeight: '700', color: V.warning, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: V.divider },
  infoIcon: { fontSize: 14, width: 24 },
  infoLabel: { flex: 1, fontSize: 13, color: V.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700', color: V.text },
  kycBanner: { margin: 12, marginTop: 4, backgroundColor: V.warningBg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FDE68A' },
  kycText: { fontSize: 12, color: V.warning, fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: V.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 40, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: V.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', color: V.text },
  subtitle: { fontSize: 12, color: V.textMuted, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeX: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: V.textSub, letterSpacing: 0.5, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: V.chip, borderWidth: 1, borderColor: V.border },
  chipActive: { backgroundColor: V.primary, borderColor: V.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: V.textSub },
  input: { backgroundColor: '#F5FAFA', borderWidth: 1.5, borderColor: V.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: V.text },
  saveBtn: { backgroundColor: V.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: V.textMuted },
});
