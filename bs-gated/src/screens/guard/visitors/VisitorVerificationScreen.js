import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal, FlatList,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const GATES = ['Main Gate', 'Side Gate', 'Back Gate', 'Service Gate'];
const VEHICLE_TYPES = ['🚗 Car', '🏍️ Bike', '🛺 Auto', '🚐 Van', '🚶 Walk-in'];
const PHOTO_AVATARS = ['👤', '👨', '👩', '🧑', '👴', '👵', '🧔', '👲'];

function ModeToggle({ mode, onChange }) {
  return (
    <View style={styles.modeToggle}>
      {[{ k: 'otp', label: '🔢 Enter OTP' }, { k: 'qr', label: '📱 Scan QR' }].map(m => (
        <TouchableOpacity key={m.k} style={[styles.modeBtn, mode === m.k && styles.modeBtnActive]} onPress={() => onChange(m.k)}>
          <Text style={[styles.modeBtnText, mode === m.k && styles.modeBtnTextActive]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CheckInModal({ visitor, guardName, onConfirm, onClose }) {
  const [photo, setPhoto]             = useState('👤');
  const [vehicleNo, setVehicleNo]     = useState(visitor?.vehicleNumber || '');
  const [parkingSlot, setParkingSlot] = useState('');
  const [vehicleType, setVehicleType] = useState('🚗 Car');
  const [gate, setGate]               = useState('Main Gate');
  const [showAvatars, setShowAvatars] = useState(false);

  const handleConfirm = () => {
    onConfirm({ photo, vehicleNote: vehicleNo || vehicleType, gate });
  };

  return (
    <Modal visible transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {/* Fixed Header */}
            <View style={styles.modalHdr}>
              <Text style={styles.modalTitle}>✅ Allow Entry</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 22, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Visitor summary */}
              <View style={styles.visitorSummary}>
                <Text style={{ fontSize: 36 }}>{photo}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitorName}>{visitor?.name}</Text>
                  <Text style={styles.visitorSub}>🏠 Unit {visitor?.hostUnit} · {visitor?.purpose}</Text>
                </View>
              </View>

              {/* Photo capture */}
              <Text style={styles.fieldLabel}>📸 Visitor Photo</Text>
              <TouchableOpacity style={styles.photoPickerBtn} onPress={() => setShowAvatars(v => !v)}>
                <Text style={{ fontSize: 32 }}>{photo}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Tap to capture / select</Text>
              </TouchableOpacity>
              {showAvatars && (
                <View style={styles.avatarRow}>
                  {PHOTO_AVATARS.map(a => (
                    <TouchableOpacity key={a} onPress={() => { setPhoto(a); setShowAvatars(false); }} style={[styles.avatarOpt, photo === a && styles.avatarOptActive]}>
                      <Text style={{ fontSize: 26 }}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Vehicle Number */}
              <Text style={styles.fieldLabel}>🚗 Vehicle Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TS09AB1234 (optional)"
                placeholderTextColor="#94A3B8"
                value={vehicleNo}
                onChangeText={setVehicleNo}
                autoCapitalize="characters"
              />

              {/* Parking Slot */}
              <Text style={styles.fieldLabel}>🅿️ Parking Slot</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. B-12 (optional)"
                placeholderTextColor="#94A3B8"
                value={parkingSlot}
                onChangeText={setParkingSlot}
                autoCapitalize="characters"
              />

              {/* Vehicle Type */}
              <Text style={styles.fieldLabel}>🚘 Vehicle Type</Text>
              <View style={styles.chipRow}>
                {VEHICLE_TYPES.map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, vehicleType === t && styles.chipActive]} onPress={() => setVehicleType(t)}>
                    <Text style={[styles.chipText, vehicleType === t && { color: '#FFFFFF' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gate */}
              <Text style={styles.fieldLabel}>🚪 Entry Gate</Text>
              <View style={styles.chipRow}>
                {GATES.map(g => (
                  <TouchableOpacity key={g} style={[styles.chip, gate === g && styles.chipActive]} onPress={() => setGate(g)}>
                    <Text style={[styles.chipText, gate === g && { color: '#FFFFFF' }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm button inside scroll so it's always reachable */}
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>✅ CONFIRM ENTRY</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function QRScanSimulator({ visitors, onScan, onClose }) {
  const approved = visitors.filter(v => v.status === 'APPROVED');
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { maxHeight: '70%' }]}>
          <View style={styles.modalHdr}>
            <Text style={styles.modalTitle}>📱 QR Scanner</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22, color: '#64748B' }}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.corner, { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3 }]} />
            <View style={[styles.corner, { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.corner, { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3 }]} />
            <Text style={{ color: '#7A9E9E', fontSize: 13 }}>Point camera at visitor's QR code</Text>
          </View>
          <Text style={styles.orLabel}>— or select approved visitor —</Text>
          <FlatList
            data={approved}
            keyExtractor={i => i.id}
            style={{ maxHeight: 200 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.qrItem} onPress={() => onScan(item.qrCode)}>
                <Text style={styles.qrName}>{item.name}</Text>
                <Text style={styles.qrSub}>Unit {item.hostUnit} · {item.purpose}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#7A9E9E', padding: 20 }}>No approved visitors</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

function VisitorCard({ visitor, onCheckIn, onDeny }) {
  const S = { CREATED: '#F59E0B', APPROVED: '#0F766E', CHECKED_IN: '#1D4ED8', CHECKED_OUT: '#64748B', DENIED: '#DC2626' };
  const color = S[visitor.status] || '#64748B';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><Text style={{ fontSize: 26 }}>👤</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.visitorName}>{visitor.name}</Text>
          <Text style={styles.visitorSub}>📱 {visitor.phone || '—'}</Text>
          <Text style={styles.visitorSub}>🏠 Unit {visitor.hostUnit}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{visitor.status}</Text>
        </View>
      </View>
      <View style={styles.detailsBox}>
        {[
          { l: 'Purpose', v: visitor.purpose },
          { l: 'Vehicle', v: visitor.guardVehicleNote || visitor.vehicleNumber || '—' },
          { l: 'Host', v: visitor.hostResidentName || '—' },
          { l: 'OTP', v: visitor.otp },
        ].map(r => (
          <View key={r.l} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{r.l}</Text>
            <Text style={styles.detailValue}>{r.v}</Text>
          </View>
        ))}
        {visitor.checkedInAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entry Gate</Text>
            <Text style={styles.detailValue}>{visitor.entryGate} • {visitor.verifiedByName || visitor.verifiedBy}</Text>
          </View>
        )}
        {visitor.photo && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Photo</Text>
            <Text style={{ fontSize: 24 }}>{visitor.photo}</Text>
          </View>
        )}
      </View>
      {visitor.status === 'APPROVED' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.denyBtn} onPress={() => onDeny(visitor)}>
            <Text style={styles.denyBtnText}>✗ Deny</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkInBtn} onPress={() => onCheckIn(visitor)}>
            <Text style={styles.checkInBtnText}>✓ Allow Entry</Text>
          </TouchableOpacity>
        </View>
      )}
      {visitor.status === 'CHECKED_IN' && (
        <View style={styles.successRow}>
          <Text style={styles.successText}>✅ Checked in at {visitor.entryGate}</Text>
        </View>
      )}
      {visitor.status === 'CHECKED_OUT' && (
        <View style={[styles.successRow, { backgroundColor: '#E8F5F5' }]}>
          <Text style={[styles.successText, { color: '#7A9E9E' }]}>🚪 Checked out</Text>
        </View>
      )}
      {visitor.status === 'DENIED' && (
        <View style={[styles.successRow, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.successText, { color: '#C62828' }]}>🚫 Entry denied</Text>
        </View>
      )}
    </View>
  );
}

export default function VisitorVerificationScreen({ navigation }) {
  const theme = useTheme();
  const user             = useAuthStore(s => s.user);
  const visitors         = useSecurityStore(s => s.visitors);
  const checkInVisitor   = useSecurityStore(s => s.checkInVisitor);
  const denyVisitor      = useSecurityStore(s => s.denyVisitor);
  const verifyVisitorOTP = useSecurityStore(s => s.verifyVisitorOTP);
  const verifyVisitorQR  = useSecurityStore(s => s.verifyVisitorQR);
  const checkBlacklist   = useSecurityStore(s => s.checkBlacklist);
  const entryLogs        = useSecurityStore(s => s.entryLogs);

  const [mode, setMode]                 = useState('otp');
  const [otpInput, setOtpInput]         = useState('');
  const [foundVisitor, setFoundVisitor] = useState(null);
  const [showQR, setShowQR]             = useState(false);
  const [showCheckIn, setShowCheckIn]   = useState(false);
  const [search, setSearch]             = useState('');

  const guardId   = user?.id   || 'sec1';
  const guardName = user?.name || 'Guard';

  const handleOTPVerify = async () => {
    const input = otpInput.trim();
    if (input.length < 4) { Alert.alert('Invalid', 'Enter a valid OTP'); return; }
 
    // If 6 digits, try Maintenance OTP
    if (input.length === 6) {
      const validateMaintenanceOtp = useSecurityStore.getState().validateMaintenanceOtp;
      const { ok, request } = await validateMaintenanceOtp(input, guardId, guardName);
      if (ok) {
        Alert.alert('✅ Maintenance Approved', `Vendor: ${request.assignedVendorName}\nUnit: ${request.unit}\nJob: ${request.title}\n\nEntry ALLOWED.`);
        setOtpInput('');
        return;
      }
    }
 
    const { ok, visitor } = verifyVisitorOTP(input);
    if (!ok) { Alert.alert('Not Found', 'No approved visitor/vendor found with this OTP.'); return; }
    const bl = checkBlacklist(visitor.name, visitor.phone);
    if (bl) { Alert.alert('🚫 BLACKLISTED', `${visitor.name} is blacklisted.\nReason: ${bl.reason}\n\nEntry DENIED.`); return; }
    setFoundVisitor(visitor);
    setOtpInput('');
  };

  const handleQRScan = (qrData) => {
    setShowQR(false);
    const { ok, visitor } = verifyVisitorQR(qrData);
    if (!ok) { Alert.alert('Invalid QR', 'No approved visitor found.'); return; }
    const bl = checkBlacklist(visitor.name, visitor.phone);
    if (bl) { Alert.alert('🚫 BLACKLISTED', `${visitor.name} is blacklisted.\nReason: ${bl.reason}`); return; }
    setFoundVisitor(visitor);
  };

  const handleCheckIn = (visitor) => {
    setFoundVisitor(visitor);
    setShowCheckIn(true);
  };

  const handleConfirmCheckIn = ({ photo, vehicleNote, gate }) => {
    checkInVisitor(foundVisitor.id, guardId, guardName, gate, photo, vehicleNote);
    setShowCheckIn(false);
    setFoundVisitor(prev => ({ ...prev, status: 'CHECKED_IN', entryGate: gate, verifiedByName: guardName, photo, guardVehicleNote: vehicleNote }));
    Alert.alert('✅ Entry Allowed', `${foundVisitor.name} checked in at ${gate}.`);
  };

  const handleDeny = (visitor) => {
    Alert.alert('Deny Entry', `Deny ${visitor.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deny', style: 'destructive', onPress: () => {
        denyVisitor(visitor.id, guardId);
        setFoundVisitor(prev => ({ ...prev, status: 'DENIED' }));
        Alert.alert('Entry Denied', `${visitor.name} denied.`);
      }},
    ]);
  };

  const filteredSearch = search.length > 1
    ? visitors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.hostUnit || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.otp || '').includes(search)
      )
    : [];

  const recentLogs = entryLogs.filter(l => l.type === 'VISITOR').slice(0, 8);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Visitor Verification</Text>
          <Text style={styles.headerSub}>OTP / QR gate entry</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ModeToggle mode={mode} onChange={m => { setMode(m); setFoundVisitor(null); setOtpInput(''); }} />

        {mode === 'otp' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔢 Verify by OTP</Text>
            <Text style={styles.cardSub}>Ask visitor for the 6-digit OTP from their pass</Text>
            <View style={styles.otpRow}>
              <TextInput
                style={styles.otpInput}
                placeholder="6-digit OTP"
                placeholderTextColor="#94A3B8"
                value={otpInput}
                onChangeText={setOtpInput}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.verifyBtn} onPress={handleOTPVerify}>
                <Text style={styles.verifyBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {mode === 'qr' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 Verify by QR</Text>
            <Text style={styles.cardSub}>Scan the visitor's QR pass from their phone</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowQR(true)}>
              <Text style={styles.scanBtnText}>📸 Open QR Scanner</Text>
            </TouchableOpacity>
          </View>
        )}

        {foundVisitor && (
          <>
            <Text style={styles.sectionLabel}>VERIFICATION RESULT</Text>
            <VisitorCard visitor={foundVisitor} onCheckIn={handleCheckIn} onDeny={handleDeny} />
          </>
        )}

        <Text style={styles.sectionLabel}>SEARCH VISITORS</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, unit or OTP..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {filteredSearch.map(v => (
          <VisitorCard key={v.id} visitor={v} onCheckIn={handleCheckIn} onDeny={handleDeny} />
        ))}

        {recentLogs.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT VISITOR ENTRIES</Text>
            {recentLogs.map(log => (
              <View key={log.id} style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <Text style={{ fontSize: 20 }}>{log.action === 'CHECK_IN' ? '✅' : '🚪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{log.name}</Text>
                  <Text style={styles.cardSub}>{log.unit} · {log.gate} · {log.guardName || log.guardId}</Text>
                  {log.vehicleNote ? <Text style={[styles.cardSub, { color: theme.primary }]}>🚗 {log.vehicleNote}</Text> : null}
                </View>
                <Text style={{ fontSize: 11, color: theme.textMuted }}>{new Date(log.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {showQR && <QRScanSimulator visitors={visitors} onScan={handleQRScan} onClose={() => setShowQR(false)} />}
      {showCheckIn && foundVisitor && (
        <CheckInModal
          visitor={foundVisitor}
          guardName={guardName}
          onConfirm={handleConfirmCheckIn}
          onClose={() => setShowCheckIn(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:            { flex: 1, backgroundColor: '#FFFFFF' },
  header:            { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  backBtn:           { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:          { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
  headerTitle:       { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  headerSub:         { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  body:              { padding: 16 },
  sectionLabel:      { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  modeToggle:        { flexDirection: 'row', backgroundColor: '#D0EEEE', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn:           { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive:     { backgroundColor: '#FFFFFF', elevation: 2 },
  modeBtnText:       { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modeBtnTextActive: { color: '#1A7A7A', fontWeight: '800' },
  card:              { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  cardTitle:         { fontSize: 15, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  cardSub:           { fontSize: 12, color: '#64748B', marginBottom: 4 },
  cardHeader:        { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar:            { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  otpRow:            { flexDirection: 'row', gap: 10 },
  otpInput:          { flex: 1, backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontWeight: '800', color: '#1A2E2E', textAlign: 'center', letterSpacing: 4 },
  verifyBtn:         { backgroundColor: '#1A7A7A', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  verifyBtnText:     { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  scanBtn:           { backgroundColor: '#1A7A7A', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  scanBtnText:       { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  searchInput:       { backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E' },
  visitorName:       { fontSize: 16, fontWeight: '800', color: '#1A2E2E' },
  visitorSub:        { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge:             { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:         { fontSize: 10, fontWeight: '800' },
  detailsBox:        { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, gap: 6 },
  detailRow:         { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel:       { fontSize: 12, color: '#64748B', fontWeight: '600' },
  detailValue:       { fontSize: 12, color: '#1A2E2E', fontWeight: '700' },
  actionRow:         { flexDirection: 'row', gap: 10, marginTop: 14 },
  denyBtn:           { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA' },
  denyBtnText:       { color: '#C62828', fontSize: 14, fontWeight: '800' },
  checkInBtn:        { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#1A7A7A' },
  checkInBtnText:    { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  successRow:        { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12 },
  successText:       { color: '#1A7A7A', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  // Modal
  overlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox:          { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' },
  modalHdr:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:        { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
  visitorSummary:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 16 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: '#7A9E9E', marginBottom: 6, marginTop: 10 },
  photoPickerBtn:    { backgroundColor: '#E8F5F5', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 8 },
  avatarRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  avatarOpt:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5F5' },
  avatarOptActive:   { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#2563EB' },
  input:             { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1A2E2E', marginBottom: 8 },
  chipRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip:              { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0EEEE' },
  chipActive:        { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText:          { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  confirmBtn:        { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  confirmBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  // QR
  viewfinder:        { backgroundColor: '#000', borderRadius: 16, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  corner:            { position: 'absolute', width: 28, height: 28, borderColor: '#D4AF5A' },
  orLabel:           { textAlign: 'center', fontSize: 12, color: '#7A9E9E', marginBottom: 12 },
  qrItem:            { padding: 14, borderRadius: 10, backgroundColor: '#E8F5F5', marginBottom: 8, borderWidth: 1, borderColor: '#D0EEEE' },
  qrName:            { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  qrSub:             { fontSize: 12, color: '#64748B', marginTop: 2 },
});

