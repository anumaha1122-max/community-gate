/**
 * PersonalInfoScreen.js
 *
 * Full personal profile management screen.
 * Theme: Identical to VisitorListScreen — header #1A7A7A, bg #E8F5F5,
 *        surface #FFFFFF, border #D0EEEE, text #1A2E2E, muted #7A9E9E.
 *
 * Sections:
 *   1. Personal Details  — name, email, phone, DOB, gender (edit in-place)
 *   2. Family Members    — add / edit / delete members (name, relation, DOB, phone)
 *   3. Vehicles          — add / edit / delete (number, type, colour, model)
 *   4. Pets              — add / edit / delete (name, type, breed, colour)
 *
 * All data is persisted in residentStore (profileData) and reflected globally.
 * AuthStore.setUser() is called for name/email/phone so header stays in sync.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore }  from '../../../store/AuthStore';
import useResidentStore  from '../../../store/residentStore';

// ─── Visitor-screen colour tokens ────────────────────────────────────────────
const V = {
  header:     '#1A7A7A',
  headerDark: '#0D6E6E',
  bg:         '#E8F5F5',
  surface:    '#FFFFFF',
  border:     '#D0EEEE',
  divider:    '#E8F5F5',
  text:       '#1A2E2E',
  textSub:    '#3D6E6E',
  textMuted:  '#7A9E9E',
  primary:    '#1A7A7A',
  chip:       '#E8F5F5',
  infoBg:     '#E8F5F5',
  danger:     '#C62828',
  dangerBg:   '#FEE2E2',
  warning:    '#E65100',
  warningBg:  '#FEF3C7',
  successBg:  '#CCFBF1',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const RELATIONS  = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'In-law', 'Other'];
const GENDERS    = ['Male', 'Female', 'Other', 'Prefer not to say'];
const VEH_TYPES  = ['Car', 'Bike', 'Scooter', 'Electric Car', 'Electric Bike', 'Cycle', 'Other'];
const PET_TYPES  = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'];

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, onAdd, addLabel }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{emoji}  {title}</Text>
      {onAdd && (
        <TouchableOpacity style={sh.addBtn} onPress={onAdd}>
          <Text style={sh.addText}>+ {addLabel || 'Add'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const sh = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title:  { fontSize: 11, fontWeight: '800', color: V.textMuted, letterSpacing: 1 },
  addBtn: { backgroundColor: V.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  addText:{ color: '#FFF', fontSize: 12, fontWeight: '700' },
});

// ─── Info row inside a card ───────────────────────────────────────────────────
function InfoRow({ label, value, last }) {
  return (
    <View style={[ir.row, !last && ir.border]}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}
const ir = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  border: { borderBottomWidth: 1, borderBottomColor: V.divider },
  label:  { fontSize: 13, color: V.textMuted, fontWeight: '600', flex: 1 },
  value:  { fontSize: 13, color: V.text, fontWeight: '700', flex: 2, textAlign: 'right' },
});

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ children, style, accent }) {
  return (
    <View style={[
      card.wrap,
      accent && { borderLeftWidth: 3, borderLeftColor: V.primary },
      style,
    ]}>
      {children}
    </View>
  );
}
const card = StyleSheet.create({
  wrap: {
    backgroundColor: V.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: V.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});

// ─── Card header with edit/delete ────────────────────────────────────────────
function CardActions({ onEdit, onDelete }) {
  return (
    <View style={ca.row}>
      <TouchableOpacity style={ca.editBtn} onPress={onEdit}>
        <Text style={ca.editText}>✏️  Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ca.delBtn} onPress={onDelete}>
        <Text style={ca.delText}>🗑  Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
const ca = StyleSheet.create({
  row:     { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: V.divider },
  editBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: V.infoBg, borderWidth: 1, borderColor: V.border },
  editText:{ fontSize: 12, fontWeight: '700', color: V.primary },
  delBtn:  { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: V.dangerBg, borderWidth: 1, borderColor: '#FFCDD2' },
  delText: { fontSize: 12, fontWeight: '700', color: V.danger },
});

// ─── Generic text field ───────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, keyboardType, maxLength, optional }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}{optional ? <Text style={{ color: V.textMuted }}> (optional)</Text> : ' *'}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={V.textMuted}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        autoCorrect={false}
      />
    </View>
  );
}
const f = StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '800', color: V.textSub, letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: '#F5FAFA', borderWidth: 1.5, borderColor: V.border, borderRadius: 12,
           paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: V.text },
});

// ─── Chip selector ────────────────────────────────────────────────────────────
function ChipSelect({ label, options, value, onChange }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={f.label}>{label} *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => (
          <TouchableOpacity
            key={o}
            style={[cs.chip, value === o && cs.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text style={[cs.text, value === o && cs.textActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const cs = StyleSheet.create({
  chip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: V.chip, borderWidth: 1, borderColor: V.border },
  chipActive: { backgroundColor: V.primary, borderColor: V.primary },
  text:       { fontSize: 12, fontWeight: '600', color: V.textSub },
  textActive: { color: '#FFF' },
});

// ─── Bottom-sheet modal ───────────────────────────────────────────────────────
function BottomSheet({ visible, title, subtitle, onClose, onSave, saveLabel, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={bs.overlay}>
          <View style={bs.sheet}>
            <View style={bs.handle} />
            <View style={bs.headerRow}>
              <View>
                <Text style={bs.title}>{title}</Text>
                {subtitle && <Text style={bs.subtitle}>{subtitle}</Text>}
              </View>
              <TouchableOpacity style={bs.closeBtn} onPress={onClose}>
                <Text style={bs.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {children}
              <TouchableOpacity style={bs.saveBtn} onPress={onSave}>
                <Text style={bs.saveBtnText}>{saveLabel || '✅  Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={bs.cancelBtn} onPress={onClose}>
                <Text style={bs.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const bs = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: V.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 40, maxHeight: '92%' },
  handle:    { width: 40, height: 4, backgroundColor: V.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:     { fontSize: 19, fontWeight: '800', color: V.text },
  subtitle:  { fontSize: 12, color: V.textMuted, marginTop: 2 },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeX:    { fontSize: 13, fontWeight: '700', color: '#64748B' },
  saveBtn:   { backgroundColor: V.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '800' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText:{ fontSize: 14, fontWeight: '600', color: V.textMuted },
});

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
export default function PersonalInfoScreen({ navigation }) {
  const user    = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);

  // Profile data from residentStore (family / vehicles / pets)
  const profileData    = useResidentStore(s => s.profileData);
  const updateProfile  = useResidentStore(s => s.updateProfile);
  const addFamilyMember    = useResidentStore(s => s.addFamilyMember);
  const updateFamilyMember = useResidentStore(s => s.updateFamilyMember);
  const deleteFamilyMember = useResidentStore(s => s.deleteFamilyMember);
  const addVehicle    = useResidentStore(s => s.addVehicle);
  const updateVehicle = useResidentStore(s => s.updateVehicle);
  const deleteVehicle = useResidentStore(s => s.deleteVehicle);
  const addPet        = useResidentStore(s => s.addPet);
  const updatePet     = useResidentStore(s => s.updatePet);
  const deletePet     = useResidentStore(s => s.deletePet);

  const family   = profileData?.family   || [];
  const vehicles = profileData?.vehicles || [];
  const pets     = profileData?.pets     || [];

  // ── Personal edit modal ────────────────────────────────────────────────────
  const [showPersonal, setShowPersonal] = useState(false);
  const [pName,   setPName]   = useState('');
  const [pEmail,  setPEmail]  = useState('');
  const [pPhone,  setPPhone]  = useState('');
  const [pDOB,    setPDOB]    = useState('');
  const [pGender, setPGender] = useState('');
  const [pEmergName,  setPEmergName]  = useState('');
  const [pEmergPhone, setPEmergPhone] = useState('');

  const openPersonal = () => {
    setPName(user?.name || '');
    setPEmail(user?.email || '');
    setPPhone(user?.phone || '');
    setPDOB(profileData?.dob || '');
    setPGender(profileData?.gender || '');
    setPEmergName(profileData?.emergencyName || '');
    setPEmergPhone(profileData?.emergencyPhone || '');
    setShowPersonal(true);
  };

  const savePersonal = () => {
    if (!pName.trim())  return Alert.alert('Required', 'Please enter your name.');
    if (!pPhone.trim()) return Alert.alert('Required', 'Please enter your phone number.');
    if (!/^\d{10}$/.test(pPhone.trim())) return Alert.alert('Invalid', 'Enter a valid 10-digit mobile number.');
    // Sync identity fields to AuthStore so header/greeting updates everywhere
    setUser({ name: pName.trim(), email: pEmail.trim(), phone: pPhone.trim() });
    // Extra profile fields go to residentStore
    updateProfile({
      dob: pDOB.trim(),
      gender: pGender,
      emergencyName: pEmergName.trim(),
      emergencyPhone: pEmergPhone.trim(),
    });
    setShowPersonal(false);
    Alert.alert('✅ Saved', 'Your personal information has been updated.');
  };

  // ── Family member modal ────────────────────────────────────────────────────
  const [showFamily, setShowFamily] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [fName,     setFName]     = useState('');
  const [fRelation, setFRelation] = useState('Spouse');
  const [fDOB,      setFDOB]      = useState('');
  const [fPhone,    setFPhone]    = useState('');
  const [fGender,   setFGender]   = useState('Male');

  const openAddFamily = () => {
    setEditingMember(null);
    setFName(''); setFRelation('Spouse'); setFDOB(''); setFPhone(''); setFGender('Male');
    setShowFamily(true);
  };

  const openEditFamily = (m) => {
    setEditingMember(m);
    setFName(m.name); setFRelation(m.relation); setFDOB(m.dob || '');
    setFPhone(m.phone || ''); setFGender(m.gender || 'Male');
    setShowFamily(true);
  };

  const saveFamily = () => {
    if (!fName.trim()) return Alert.alert('Required', 'Please enter member name.');
    const data = { name: fName.trim(), relation: fRelation, dob: fDOB.trim(), phone: fPhone.trim(), gender: fGender };
    if (editingMember) {
      updateFamilyMember(editingMember.id, data);
    } else {
      addFamilyMember(data);
    }
    setShowFamily(false);
    Alert.alert('✅ Saved', editingMember ? 'Member updated.' : 'Family member added.');
  };

  const confirmDeleteFamily = (m) => {
    Alert.alert('Delete Member', `Remove ${m.name} from your family list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFamilyMember(m.id) },
    ]);
  };

  // ── Vehicle modal ─────────────────────────────────────────────────────────
  const [showVehicle, setShowVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vNumber, setVNumber] = useState('');
  const [vType,   setVType]   = useState('Car');
  const [vModel,  setVModel]  = useState('');
  const [vColour, setVColour] = useState('');

  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVNumber(''); setVType('Car'); setVModel(''); setVColour('');
    setShowVehicle(true);
  };

  const openEditVehicle = (v) => {
    setEditingVehicle(v);
    setVNumber(v.number); setVType(v.type); setVModel(v.model || ''); setVColour(v.colour || '');
    setShowVehicle(true);
  };

  const saveVehicle = () => {
    if (!vNumber.trim()) return Alert.alert('Required', 'Please enter vehicle number.');
    const num = vNumber.trim().toUpperCase();
    // Basic Indian vehicle number format check
    if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(num.replace(/\s/g, ''))) {
      return Alert.alert('Invalid Number', 'Enter a valid Indian vehicle number (e.g. TS09AB1234).');
    }
    const data = { number: num, type: vType, model: vModel.trim(), colour: vColour.trim() };
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
    } else {
      // Check duplicate
      if (vehicles.some(v => v.number === num)) {
        return Alert.alert('Duplicate', `Vehicle ${num} is already registered.`);
      }
      addVehicle(data);
    }
    setShowVehicle(false);
    Alert.alert('✅ Saved', editingVehicle ? 'Vehicle updated.' : 'Vehicle added.');
  };

  const confirmDeleteVehicle = (v) => {
    Alert.alert('Delete Vehicle', `Remove ${v.number} from your vehicles?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle(v.id) },
    ]);
  };

  // ── Pet modal ─────────────────────────────────────────────────────────────
  const [showPet, setShowPet] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petName,   setPetName]   = useState('');
  const [petType,   setPetType]   = useState('Dog');
  const [petBreed,  setPetBreed]  = useState('');
  const [petColour, setPetColour] = useState('');
  const [petVacc,   setPetVacc]   = useState('');

  const openAddPet = () => {
    setEditingPet(null);
    setPetName(''); setPetType('Dog'); setPetBreed(''); setPetColour(''); setPetVacc('');
    setShowPet(true);
  };

  const openEditPet = (p) => {
    setEditingPet(p);
    setPetName(p.name); setPetType(p.type); setPetBreed(p.breed || '');
    setPetColour(p.colour || ''); setPetVacc(p.vaccination || '');
    setShowPet(true);
  };

  const savePet = () => {
    if (!petName.trim()) return Alert.alert('Required', "Please enter your pet's name.");
    const data = { name: petName.trim(), type: petType, breed: petBreed.trim(), colour: petColour.trim(), vaccination: petVacc.trim() };
    if (editingPet) {
      updatePet(editingPet.id, data);
    } else {
      addPet(data);
    }
    setShowPet(false);
    Alert.alert('✅ Saved', editingPet ? 'Pet updated.' : 'Pet added.');
  };

  const confirmDeletePet = (p) => {
    Alert.alert('Delete Pet', `Remove ${p.name} from your pets?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePet(p.id) },
    ]);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Personal Information</Text>
            <Text style={s.headerSub}>Unit {user?.unit || '—'} · Manage your profile</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── PERSONAL DETAILS ── */}
        <SectionHeader emoji="👤" title="PERSONAL DETAILS" onAdd={openPersonal} addLabel="Edit" />

        <Card accent>
          <InfoRow label="Full Name"   value={user?.name} />
          <InfoRow label="Email"       value={user?.email} />
          <InfoRow label="Phone"       value={user?.phone} />
          <InfoRow label="Unit"        value={user?.unit} />
          <InfoRow label="Date of Birth" value={profileData?.dob} />
          <InfoRow label="Gender"      value={profileData?.gender} />
          <InfoRow label="Emergency Contact" value={profileData?.emergencyName ? `${profileData.emergencyName} · ${profileData.emergencyPhone}` : null} last />
          <TouchableOpacity style={s.editFullBtn} onPress={openPersonal}>
            <Text style={s.editFullBtnText}>✏️  Edit Personal Details</Text>
          </TouchableOpacity>
        </Card>

        {/* ── FAMILY MEMBERS ── */}
        <SectionHeader emoji="👨‍👩‍👧‍👦" title="FAMILY MEMBERS" onAdd={openAddFamily} addLabel="Add Member" />

        {family.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>👨‍👩‍👧</Text>
            <Text style={s.emptyTitle}>No family members added</Text>
            <Text style={s.emptyDesc}>Add family members living in your unit. This information helps security identify authorised residents.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAddFamily}>
              <Text style={s.emptyBtnText}>+ Add Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          family.map(m => (
            <Card key={m.id}>
              <View style={s.cardHeaderRow}>
                <View style={[s.memberAvatar, { backgroundColor: V.infoBg }]}>
                  <Text style={{ fontSize: 22 }}>
                    {m.relation === 'Child' ? '👶' : m.relation === 'Spouse' ? '💑' : m.relation === 'Parent' ? '👴' : '👤'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.cardItemTitle}>{m.name}</Text>
                  <View style={s.relationBadge}>
                    <Text style={s.relationBadgeText}>{m.relation}</Text>
                  </View>
                </View>
              </View>
              <InfoRow label="Gender"       value={m.gender} />
              <InfoRow label="Date of Birth" value={m.dob} />
              <InfoRow label="Phone"        value={m.phone} last />
              <CardActions onEdit={() => openEditFamily(m)} onDelete={() => confirmDeleteFamily(m)} />
            </Card>
          ))
        )}

        {/* ── VEHICLES ── */}
        <SectionHeader emoji="🚗" title="VEHICLES" onAdd={openAddVehicle} addLabel="Add Vehicle" />

        {vehicles.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🚗</Text>
            <Text style={s.emptyTitle}>No vehicles registered</Text>
            <Text style={s.emptyDesc}>Register your vehicles for faster gate entry and parking slot allocation.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAddVehicle}>
              <Text style={s.emptyBtnText}>+ Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map(v => (
            <Card key={v.id}>
              <View style={s.cardHeaderRow}>
                <View style={[s.memberAvatar, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={{ fontSize: 22 }}>
                    {v.type === 'Car' || v.type === 'Electric Car' ? '🚗'
                      : v.type === 'Bike' || v.type === 'Electric Bike' ? '🏍️'
                      : v.type === 'Scooter' ? '🛵'
                      : v.type === 'Cycle' ? '🚲' : '🚗'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.cardItemTitle}>{v.number}</Text>
                  <View style={[s.relationBadge, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                    <Text style={[s.relationBadgeText, { color: '#EA580C' }]}>{v.type}</Text>
                  </View>
                </View>
              </View>
              <InfoRow label="Model"  value={v.model} />
              <InfoRow label="Colour" value={v.colour} last />
              <CardActions onEdit={() => openEditVehicle(v)} onDelete={() => confirmDeleteVehicle(v)} />
            </Card>
          ))
        )}

        {/* ── PETS ── */}
        <SectionHeader emoji="🐾" title="PETS" onAdd={openAddPet} addLabel="Add Pet" />

        {pets.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🐾</Text>
            <Text style={s.emptyTitle}>No pets registered</Text>
            <Text style={s.emptyDesc}>Register your pets for community records and to receive pet-friendly society updates.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAddPet}>
              <Text style={s.emptyBtnText}>+ Add Pet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map(p => (
            <Card key={p.id}>
              <View style={s.cardHeaderRow}>
                <View style={[s.memberAvatar, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={{ fontSize: 22 }}>
                    {p.type === 'Dog' ? '🐶' : p.type === 'Cat' ? '🐱'
                      : p.type === 'Bird' ? '🐦' : p.type === 'Fish' ? '🐟'
                      : p.type === 'Rabbit' ? '🐰' : '🐾'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.cardItemTitle}>{p.name}</Text>
                  <View style={[s.relationBadge, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                    <Text style={[s.relationBadgeText, { color: '#7C3AED' }]}>{p.type}</Text>
                  </View>
                </View>
              </View>
              <InfoRow label="Breed"       value={p.breed} />
              <InfoRow label="Colour"      value={p.colour} />
              <InfoRow label="Vaccination" value={p.vaccination} last />
              <CardActions onEdit={() => openEditPet(p)} onDelete={() => confirmDeletePet(p)} />
            </Card>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── PERSONAL EDIT MODAL ── */}
      <BottomSheet
        visible={showPersonal}
        title="Edit Personal Details"
        subtitle="Changes sync across the entire app"
        onClose={() => setShowPersonal(false)}
        onSave={savePersonal}
        saveLabel="✅  Save Details"
      >
        <Field label="FULL NAME"    value={pName}  onChange={setPName}  placeholder="e.g. Arjun Sharma" />
        <Field label="EMAIL"        value={pEmail} onChange={setPEmail} placeholder="e.g. arjun@email.com" keyboardType="email-address" optional />
        <Field label="PHONE NUMBER" value={pPhone} onChange={setPPhone} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} />
        <Field label="DATE OF BIRTH" value={pDOB} onChange={setPDOB} placeholder="e.g. 15 Aug 1990" optional />
        <ChipSelect label="GENDER" options={GENDERS} value={pGender} onChange={setPGender} />
        <View style={[s.dividerLine, { marginBottom: 16 }]} />
        <Text style={[f.label, { marginBottom: 12, color: V.warning }]}>🆘 EMERGENCY CONTACT</Text>
        <Field label="CONTACT NAME"  value={pEmergName}  onChange={setPEmergName}  placeholder="e.g. Priya Sharma" optional />
        <Field label="CONTACT PHONE" value={pEmergPhone} onChange={setPEmergPhone} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} optional />
      </BottomSheet>

      {/* ── FAMILY MEMBER MODAL ── */}
      <BottomSheet
        visible={showFamily}
        title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
        subtitle="Members listed here are authorised unit residents"
        onClose={() => setShowFamily(false)}
        onSave={saveFamily}
        saveLabel={editingMember ? '✅  Update Member' : '✅  Add Member'}
      >
        <Field label="FULL NAME" value={fName} onChange={setFName} placeholder="e.g. Priya Sharma" />
        <ChipSelect label="RELATION" options={RELATIONS} value={fRelation} onChange={setFRelation} />
        <ChipSelect label="GENDER"   options={GENDERS}   value={fGender}   onChange={setFGender}   />
        <Field label="DATE OF BIRTH" value={fDOB}   onChange={setFDOB}   placeholder="e.g. 20 Mar 1995" optional />
        <Field label="PHONE NUMBER"  value={fPhone} onChange={setFPhone} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} optional />
      </BottomSheet>

      {/* ── VEHICLE MODAL ── */}
      <BottomSheet
        visible={showVehicle}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        subtitle="Registered vehicles get faster gate entry"
        onClose={() => setShowVehicle(false)}
        onSave={saveVehicle}
        saveLabel={editingVehicle ? '✅  Update Vehicle' : '✅  Add Vehicle'}
      >
        <Field label="VEHICLE NUMBER" value={vNumber} onChange={setVNumber} placeholder="e.g. TS09AB1234" maxLength={15} />
        <ChipSelect label="VEHICLE TYPE" options={VEH_TYPES} value={vType} onChange={setVType} />
        <Field label="MAKE / MODEL"  value={vModel}  onChange={setVModel}  placeholder="e.g. Maruti Swift" optional />
        <Field label="COLOUR"        value={vColour} onChange={setVColour} placeholder="e.g. White" optional />
      </BottomSheet>

      {/* ── PET MODAL ── */}
      <BottomSheet
        visible={showPet}
        title={editingPet ? 'Edit Pet' : 'Add Pet'}
        subtitle="Registered pets are on society records"
        onClose={() => setShowPet(false)}
        onSave={savePet}
        saveLabel={editingPet ? '✅  Update Pet' : '✅  Add Pet'}
      >
        <Field label="PET NAME" value={petName} onChange={setPetName} placeholder="e.g. Bruno" />
        <ChipSelect label="PET TYPE" options={PET_TYPES} value={petType} onChange={setPetType} />
        <Field label="BREED"       value={petBreed}  onChange={setPetBreed}  placeholder="e.g. Labrador" optional />
        <Field label="COLOUR"      value={petColour} onChange={setPetColour} placeholder="e.g. Golden" optional />
        <Field label="VACCINATION STATUS" value={petVacc} onChange={setPetVacc} placeholder="e.g. Up to date, Due Dec 2025" optional />
      </BottomSheet>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: V.bg },

  // Header
  header:     { backgroundColor: V.header, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:    { marginBottom: 10 },
  backText:   { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow:  { flexDirection: 'row', alignItems: 'center' },
  headerTitle:{ fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Body
  body: { padding: 16, paddingTop: 20 },

  // Edit button inside personal card
  editFullBtn:     { marginTop: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: V.infoBg, alignItems: 'center', borderWidth: 1, borderColor: V.border },
  editFullBtnText: { fontSize: 13, fontWeight: '700', color: V.primary },

  // Card header row
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  memberAvatar:  { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: V.border },
  cardItemTitle: { fontSize: 15, fontWeight: '800', color: V.text },

  // Relation / type badge
  relationBadge:     { flexDirection: 'row', alignSelf: 'flex-start', marginTop: 4, backgroundColor: V.successBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: V.border },
  relationBadgeText: { fontSize: 10, fontWeight: '800', color: V.primary, letterSpacing: 0.3 },

  // Empty state card
  emptyCard:  { backgroundColor: V.surface, borderRadius: 14, padding: 24, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: V.border },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: V.text, marginBottom: 6 },
  emptyDesc:  { fontSize: 12, color: V.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  emptyBtn:   { backgroundColor: V.primary, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20 },
  emptyBtnText:{ color: '#FFF', fontWeight: '700', fontSize: 13 },

  dividerLine: { height: 1, backgroundColor: V.divider },
});