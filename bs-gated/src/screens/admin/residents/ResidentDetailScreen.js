import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

const P = {
  teal:'#1A7A7A', tealDeep:'#1A7A7A', tealSoft:'#E8F5F5', tealMid:'#D0EEEE',
  bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', border:'#D0EEEE',
  danger:'#C62828', dangerBg:'#FEE2E2', warning:'#E65100', success:'#1A7A7A',
};

const KYC_COLOR = { verified: P.success, pending: P.warning, rejected: P.danger };

function InfoRow({ label, value, last }) {
  return (
    <View style={[s.infoRow, !last && s.infoBorder]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function ResidentDetailScreen({ route, navigation }) {
  const { resident } = route.params;
  const toggleResidentActive = useAdminStore(st => st.toggleResidentActive);
  const updateKycStatus      = useAdminStore(st => st.updateKycStatus);
  const residents            = useAdminStore(st => st.residents);
  const live = residents.find(r => r.id === resident.id) || resident;

  const handleToggleActive = () => {
    const action = live.active ? 'Deactivate' : 'Activate';
    Alert.alert(action, `${action} ${live.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: live.active ? 'destructive' : 'default', onPress: () => toggleResidentActive(live.id) },
    ]);
  };

  const handleKyc = (status) => {
    Alert.alert('Update KYC', `Set KYC to "${status}" for ${live.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: () => updateKycStatus(live.id, status) },
    ]);
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Resident Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Avatar card */}
        <View style={s.avatarCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{live.name.charAt(0)}</Text>
          </View>
          <Text style={s.residentName}>{live.name}</Text>
          <Text style={s.residentUnit}>🏠 Unit {live.unit}</Text>
          <View style={[s.statusBadge, { backgroundColor: live.active ? P.success : P.textMuted }]}>
            <Text style={s.statusBadgeText}>{live.active ? '✓ Active' : 'Inactive'}</Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact Info</Text>
          <InfoRow label="Phone"  value={`📱 ${live.phone}`} />
          <InfoRow label="Email"  value={live.email ? `✉️ ${live.email}` : '—'} />
          <InfoRow label="Joined" value={live.joinedAt} last />
        </View>

        {/* KYC */}
        <View style={s.card}>
          <Text style={s.cardTitle}>KYC Status</Text>
          <View style={[s.kycCurrentWrap, { backgroundColor: KYC_COLOR[live.kycStatus] + '18' }]}>
            <Text style={[s.kycCurrent, { color: KYC_COLOR[live.kycStatus] }]}>
              Current: {live.kycStatus.charAt(0).toUpperCase() + live.kycStatus.slice(1)}
            </Text>
          </View>
          <View style={s.kycRow}>
            {['pending', 'verified', 'rejected'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={[s.kycBtn, { borderColor: KYC_COLOR[opt] }, live.kycStatus === opt && { backgroundColor: KYC_COLOR[opt] }]}
                onPress={() => handleKyc(opt)}
              >
                <Text style={[s.kycBtnText, { color: live.kycStatus === opt ? '#FFF' : KYC_COLOR[opt] }]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: live.active ? P.dangerBg : P.tealSoft, borderColor: live.active ? P.danger : P.teal }]}
          onPress={handleToggleActive}
          activeOpacity={0.85}
        >
          <Text style={[s.actionBtnText, { color: live.active ? P.danger : P.teal }]}>
            {live.active ? '⛔ Deactivate Resident' : '✅ Activate Resident'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.tealDeep },
  safeTop:     { backgroundColor: P.tealDeep },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:    { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },

  body:        { flex: 1, backgroundColor: P.bg },

  avatarCard:  { backgroundColor: P.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: P.border, marginBottom: 14 },
  avatarCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: P.teal + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: P.tealMid },
  avatarText:  { fontSize: 36, fontWeight: '800', color: P.teal },
  residentName:{ fontSize: 22, fontWeight: '800', color: P.text },
  residentUnit:{ fontSize: 14, color: P.textMuted, marginTop: 4 },
  statusBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  card:        { backgroundColor: P.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.border, marginBottom: 14 },
  cardTitle:   { fontSize: 13, fontWeight: '800', color: P.text, marginBottom: 12, letterSpacing: 0.3 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoBorder:  { borderBottomWidth: 1, borderBottomColor: P.border },
  infoLabel:   { fontSize: 13, color: P.textMuted, fontWeight: '600' },
  infoValue:   { fontSize: 13, color: P.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  kycCurrentWrap: { borderRadius: 10, padding: 10, marginBottom: 14 },
  kycCurrent:     { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  kycRow:      { flexDirection: 'row', gap: 10 },
  kycBtn:      { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  kycBtnText:  { fontSize: 13, fontWeight: '700' },

  actionBtn:   { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, marginTop: 4 },
  actionBtnText: { fontSize: 15, fontWeight: '800' },
});