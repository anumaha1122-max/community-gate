/**
 * GPSDashboard.js — Maid Tracking (Real Workflow)
 *
 * Workflow:
 *  1. Resident adds maid (name + phone) → status: pending
 *  2. Maid receives invite on Maid App → accepts or declines
 *  3. On accept → status: tracking (live location visible)
 *  4. Resident can: pause tracking, resume, call maid, open map, remove
 *  5. Maid can stop sharing anytime → status: offline
 *
 * Cards are tappable — collapse/expand to show full detail + actions.
 * Theme matches visitor screens exactly.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Linking,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Theme — mirrors visitor screen ──────────────────────────────────────────
const T = {
  bg:           '#E8F5F5',
  header:       '#1A7A7A',
  headerDark:   '#0D6E6E',
  surface:      '#FFFFFF',
  border:       '#D0EEEE',
  text:         '#1A2E2E',
  textSub:      '#3D6E6E',
  textMuted:    '#7A9E9E',
  primary:      '#1A7A7A',
  primaryLight: '#1A9E9E',
  accent:       '#E8A020',
  accentBg:     '#FFF8E1',
  success:      '#0F766E',
  successBg:    '#CCFBF1',
  warning:      '#D97706',
  warningBg:    '#FEF3C7',
  danger:       '#DC2626',
  dangerBg:     '#FEE2E2',
  offline:      '#64748B',
  offlineBg:    '#F1F5F9',
  infoBg:       '#F0F9FF',
  infoBorder:   '#BAE6FD',
  inputBg:      '#F0FAFA',
  inputBorder:  '#B0DEDE',
  white:        '#FFFFFF',
  divider:      '#EEF2F2',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDist = (m) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

const calcDist = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const SOC_LAT = 17.4126;
const SOC_LNG = 78.2595;
const SOC_RADIUS_M = 400;

const simulatePos = (maid, tick) => {
  const seed = maid.phone.charCodeAt(maid.phone.length - 1);
  const angle = (tick * 0.05 + seed) % (2 * Math.PI);
  const r = 0.0012 + 0.0005 * Math.sin(tick * 0.03 + seed);
  return {
    lat: SOC_LAT + r * Math.sin(angle),
    lng: SOC_LNG + r * Math.cos(angle),
    updatedAt: new Date().toISOString(),
  };
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:  { label: 'Invite Sent',      bg: T.warningBg, color: T.warning, dot: '#F59E0B' },
  tracking: { label: 'Live',             bg: T.successBg, color: T.success, dot: T.success },
  paused:   { label: 'Paused',           bg: T.offlineBg, color: T.offline, dot: '#94A3B8' },
  declined: { label: 'Invite Declined',  bg: T.dangerBg,  color: T.danger,  dot: T.danger  },
  offline:  { label: 'Offline',          bg: T.offlineBg, color: T.offline, dot: '#94A3B8' },
};

// ─── Pulsing live dot ─────────────────────────────────────────────────────────
function LivePulse() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 14, height: 14, borderRadius: 7,
        backgroundColor: T.success, opacity, transform: [{ scale }],
      }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.success }} />
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <View style={[bs.wrap, { backgroundColor: cfg.bg }]}>
      <View style={[bs.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[bs.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const bs = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '700' },
});

// ─── Detail row inside expanded card ─────────────────────────────────────────
function DetailRow({ icon, label, value, valueColor }) {
  return (
    <View style={dr.row}>
      <Text style={dr.icon}>{icon}</Text>
      <Text style={dr.label}>{label}</Text>
      <Text style={[dr.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}
const dr = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.divider },
  icon:  { fontSize: 14, width: 24 },
  label: { flex: 1, fontSize: 13, color: T.textMuted },
  value: { fontSize: 13, fontWeight: '700', color: T.text, textAlign: 'right', flexShrink: 1, marginLeft: 8 },
});

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ label, icon, color, bg, onPress }) {
  return (
    <TouchableOpacity style={[ab.btn, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={[ab.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const ab = StyleSheet.create({
  btn:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12, gap: 4, minWidth: 64 },
  label: { fontSize: 11, fontWeight: '700' },
});

// ─── Maid Card (expandable) ───────────────────────────────────────────────────
function MaidCard({ maid, position, onRemove, onPause, onResume, onReInvite, onOpenMap, onCall }) {
  const [expanded, setExpanded] = useState(false);

  const isTracking = maid.status === 'tracking';
  const isPending  = maid.status === 'pending';
  const isPaused   = maid.status === 'paused';
  const isDeclined = maid.status === 'declined';
  const isOffline  = maid.status === 'offline';

  const dist   = position ? calcDist(position.lat, position.lng, SOC_LAT, SOC_LNG) : null;
  const inside = dist !== null && dist < SOC_RADIUS_M;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const summaryLine = () => {
    if (isTracking && position) {
      return inside
        ? { text: 'Inside Society', color: T.success }
        : { text: `Outside · ${fmtDist(dist)} away`, color: T.danger };
    }
    if (isPending)  return { text: 'Waiting for acceptance', color: T.warning };
    if (isPaused)   return { text: 'Tracking paused by you', color: T.offline };
    if (isDeclined) return { text: 'Invite was declined',   color: T.danger };
    if (isOffline)  return { text: 'Maid stopped sharing',  color: T.offline };
    return { text: '—', color: T.textMuted };
  };

  const summary = summaryLine();
  const avatarBg = isTracking ? T.successBg : isDeclined ? T.dangerBg : T.offlineBg;

  return (
    <View style={[cs.card, expanded && cs.cardExpanded]}>

      {/* ── Collapsed header — always visible ── */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.75} style={cs.headerRow}>
        <View style={[cs.avatar, { backgroundColor: avatarBg }]}>
          <Text style={cs.avatarText}>🧹</Text>
          {isTracking && <View style={cs.liveBadge}><LivePulse /></View>}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <Text style={cs.name} numberOfLines={1}>{maid.name}</Text>
            <StatusBadge status={maid.status} />
          </View>
          <Text style={cs.phone}>{maid.phone}</Text>
          <Text style={[cs.summary, { color: summary.color }]}>{summary.text}</Text>
        </View>

        <Text style={[cs.chevron, expanded && cs.chevronUp]}>{'›'}</Text>
      </TouchableOpacity>

      {/* ── Expanded body ── */}
      {expanded && (
        <View style={cs.expandedBody}>
          <View style={cs.dividerLine} />

          {/* TRACKING — live location details */}
          {isTracking && position && (
            <View style={cs.locationBlock}>
              <View style={cs.locationHeaderRow}>
                <LivePulse />
                <Text style={cs.locationTitle}>Live Location</Text>
                <Text style={cs.locationTime}>Updated {fmtTime(position.updatedAt)}</Text>
              </View>
              <View style={[cs.locationStatusBox, { backgroundColor: inside ? T.successBg : T.dangerBg }]}>
                <Text style={[cs.locationStatusText, { color: inside ? T.success : T.danger }]}>
                  {inside ? '✅  Inside Society premises' : `🚶  Outside Society · ${fmtDist(dist)} away`}
                </Text>
              </View>
              <DetailRow icon="📍" label="Latitude"       value={`${position.lat.toFixed(6)}° N`} />
              <DetailRow icon="📍" label="Longitude"      value={`${position.lng.toFixed(6)}° E`} />
              <DetailRow icon="📅" label="Tracking since" value={fmtDate(maid.addedAt)} />
            </View>
          )}

          {/* PENDING */}
          {isPending && (
            <View style={cs.stateBlock}>
              <Text style={cs.stateEmoji}>⏳</Text>
              <Text style={cs.stateTitle}>Invite Sent</Text>
              <Text style={cs.stateDesc}>
                {maid.name.split(' ')[0]} has received a notification on the Maid App.
                {'\n'}Once they accept, their live location will appear here.
              </Text>
              <DetailRow icon="📅" label="Invited on" value={fmtDate(maid.addedAt)} />
              <DetailRow icon="🕐" label="Invited at" value={fmtTime(maid.addedAt)} />
            </View>
          )}

          {/* PAUSED */}
          {isPaused && (
            <View style={cs.stateBlock}>
              <Text style={cs.stateEmoji}>⏸</Text>
              <Text style={cs.stateTitle}>Tracking Paused</Text>
              <Text style={cs.stateDesc}>
                You paused location sharing for {maid.name.split(' ')[0]}.
                {'\n'}Tap Resume to turn it back on — they will be notified.
              </Text>
              <DetailRow icon="📅" label="Added on" value={fmtDate(maid.addedAt)} />
            </View>
          )}

          {/* DECLINED */}
          {isDeclined && (
            <View style={cs.stateBlock}>
              <Text style={cs.stateEmoji}>🚫</Text>
              <Text style={cs.stateTitle}>Invite Declined</Text>
              <Text style={cs.stateDesc}>
                {maid.name.split(' ')[0]} declined the tracking invite.
                {'\n'}You can send the invite again or remove them from your list.
              </Text>
            </View>
          )}

          {/* OFFLINE */}
          {isOffline && (
            <View style={cs.stateBlock}>
              <Text style={cs.stateEmoji}>📴</Text>
              <Text style={cs.stateTitle}>Maid is Offline</Text>
              <Text style={cs.stateDesc}>
                {maid.name.split(' ')[0]} has stopped sharing their location.
                {'\n'}Tracking resumes when they open the Maid App again.
              </Text>
              <DetailRow icon="📅" label="Added on" value={fmtDate(maid.addedAt)} />
            </View>
          )}

          {/* ── Action buttons ── */}
          <View style={cs.actionsRow}>
            {isTracking && (
              <>
                <ActionBtn icon="🗺" label="Map"    color={T.primary} bg={T.successBg}  onPress={() => onOpenMap(position, maid.name)} />
                <ActionBtn icon="📞" label="Call"   color={T.primary} bg="#EFF6FF"      onPress={() => onCall(maid.phone)} />
                <ActionBtn icon="⏸" label="Pause"  color={T.warning} bg={T.warningBg}  onPress={() => { toggle(); onPause(maid); }} />
              </>
            )}
            {isPaused && (
              <>
                <ActionBtn icon="▶" label="Resume" color={T.success} bg={T.successBg}  onPress={() => { toggle(); onResume(maid); }} />
                <ActionBtn icon="📞" label="Call"  color={T.primary} bg="#EFF6FF"      onPress={() => onCall(maid.phone)} />
              </>
            )}
            {isPending && (
              <>
                <ActionBtn icon="📞" label="Call"     color={T.primary} bg="#EFF6FF"    onPress={() => onCall(maid.phone)} />
                <ActionBtn icon="🔁" label="Re-send"  color={T.warning} bg={T.warningBg} onPress={() => { toggle(); onReInvite(maid); }} />
              </>
            )}
            {(isDeclined || isOffline) && (
              <>
                <ActionBtn icon="📞" label="Call"      color={T.primary} bg="#EFF6FF"   onPress={() => onCall(maid.phone)} />
                <ActionBtn icon="📲" label="Re-invite" color={T.success} bg={T.successBg} onPress={() => { toggle(); onReInvite(maid); }} />
              </>
            )}
            <ActionBtn icon="🗑" label="Remove" color={T.danger} bg={T.dangerBg} onPress={() => { toggle(); onRemove(maid); }} />
          </View>
        </View>
      )}
    </View>
  );
}

const cs = StyleSheet.create({
  card:            { backgroundColor: T.white, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: T.border, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardExpanded:    { borderColor: T.primary },
  headerRow:       { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatar:          { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 22 },
  liveBadge:       { position: 'absolute', bottom: -1, right: -1 },
  name:            { fontSize: 15, fontWeight: '800', color: T.text, flexShrink: 1 },
  phone:           { fontSize: 12, color: T.textMuted, marginBottom: 2 },
  summary:         { fontSize: 12, fontWeight: '600' },
  chevron:         { fontSize: 22, color: T.textMuted, marginLeft: 8, transform: [{ rotate: '90deg' }] },
  chevronUp:       { transform: [{ rotate: '-90deg' }] },
  dividerLine:     { height: 1, backgroundColor: T.divider, marginHorizontal: 14 },
  expandedBody:    { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 10 },
  locationBlock:   { marginBottom: 10 },
  locationHeaderRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  locationTitle:   { fontSize: 14, fontWeight: '800', color: T.text, flex: 1 },
  locationTime:    { fontSize: 11, color: T.textMuted },
  locationStatusBox:  { borderRadius: 10, padding: 10, marginBottom: 6 },
  locationStatusText: { fontSize: 13, fontWeight: '700' },
  stateBlock:      { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  stateEmoji:      { fontSize: 36, marginBottom: 8 },
  stateTitle:      { fontSize: 15, fontWeight: '800', color: T.text, marginBottom: 6 },
  stateDesc:       { fontSize: 13, color: T.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  actionsRow:      { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
});

// ─── Add Maid Modal ───────────────────────────────────────────────────────────
function AddMaidModal({ visible, onClose, onAdd }) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setName(''); setPhone(''); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) { setError("Please enter the maid's name."); return; }
    if (!/^\d{10}$/.test(phone.trim())) { setError('Enter a valid 10-digit mobile number.'); return; }
    onAdd({ name: name.trim(), phone: phone.trim() });
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <View style={ms.headerRow}>
            <View>
              <Text style={ms.title}>Add Maid</Text>
              <Text style={ms.subtitle}>Send a tracking invite</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={ms.closeBtn}>
              <Text style={ms.closeX}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={ms.infoBox}>
            <Text style={ms.infoTitle}>🔐 Consent-based tracking</Text>
            <Text style={ms.infoText}>
              Your maid must explicitly accept before any location is shared.
              They can stop sharing at any time from the Maid App.
            </Text>
          </View>
          <Text style={ms.label}>MAID NAME *</Text>
          <TextInput
            style={[ms.input, error && !name.trim() && ms.inputErr]}
            placeholder="e.g. Savita Devi"
            placeholderTextColor={T.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Text style={ms.label}>MOBILE NUMBER *</Text>
          <TextInput
            style={[ms.input, error && !/^\d{10}$/.test(phone.trim()) && ms.inputErr]}
            placeholder="10-digit mobile number"
            placeholderTextColor={T.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {!!error && <Text style={ms.errorText}>{'⚠  '}{error}</Text>}
          <TouchableOpacity style={ms.submitBtn} onPress={handleSubmit}>
            <Text style={ms.submitText}>{'📲  Send Invite'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.cancelBtn} onPress={handleClose}>
            <Text style={ms.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle:     { width: 40, height: 4, backgroundColor: T.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title:      { fontSize: 20, fontWeight: '800', color: T.text },
  subtitle:   { fontSize: 13, color: T.textMuted, marginTop: 2 },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeX:     { fontSize: 13, fontWeight: '700', color: '#64748B' },
  infoBox:    { backgroundColor: T.infoBg, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: T.infoBorder, marginBottom: 18 },
  infoTitle:  { fontSize: 12, fontWeight: '800', color: T.primary, marginBottom: 4 },
  infoText:   { fontSize: 12, color: '#3A7A7A', lineHeight: 19 },
  label:      { fontSize: 11, fontWeight: '700', color: T.textSub, letterSpacing: 0.6, marginBottom: 6 },
  input:      { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: T.text, marginBottom: 14 },
  inputErr:   { borderColor: T.danger },
  errorText:  { fontSize: 12, color: T.danger, fontWeight: '600', marginBottom: 10 },
  submitBtn:  { backgroundColor: T.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 2 },
  submitText: { color: T.white, fontWeight: '800', fontSize: 15 },
  cancelBtn:  { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: T.textMuted },
});

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 52, marginBottom: 12 }}>🧹</Text>
      <Text style={{ fontSize: 17, fontWeight: '800', color: T.text, marginBottom: 8 }}>No maids added yet</Text>
      <Text style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
        {'Add your maid\'s name and mobile number.\nThey\'ll receive an invite to share their location.'}
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: T.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 }}
        onPress={onAdd}
      >
        <Text style={{ color: T.white, fontWeight: '800', fontSize: 14 }}>+ Add Maid</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Demo seed data ───────────────────────────────────────────────────────────
const DEMO_MAIDS = [
  { id: 'm1', name: 'Savita Devi',  phone: '9876500001', status: 'tracking', addedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm2', name: 'Radha Bai',   phone: '9876500002', status: 'pending',  addedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm3', name: 'Meena Kumari',phone: '9876500003', status: 'declined', addedAt: new Date(Date.now() - 7200000).toISOString() },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GPSDashboard({ navigation }) {
  const [maids, setMaids]         = useState(DEMO_MAIDS);
  const [positions, setPositions] = useState({});
  const [tick, setTick]           = useState(0);
  const [showAdd, setShowAdd]     = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'tracking' | 'pending'

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const next = {};
    maids.filter((m) => m.status === 'tracking').forEach((m) => {
      next[m.id] = simulatePos(m, tick);
    });
    setPositions(next);
  }, [tick, maids]);

  const handleAdd = useCallback(({ name, phone }) => {
    if (maids.some((m) => m.phone === phone)) {
      Alert.alert('Already Added', `A maid with number ${phone} is already in your list.`);
      return;
    }
    const maid = { id: `m${Date.now()}`, name, phone, status: 'pending', addedAt: new Date().toISOString() };
    setMaids((prev) => [maid, ...prev]);
    setShowAdd(false);
    Alert.alert('📲 Invite Sent!', `${name} will receive a notification on the Maid App.\n\nOnce they accept, their live location will appear here.`);
  }, [maids]);

  const handleRemove = (maid) => {
    Alert.alert(
      'Remove Maid',
      `Stop tracking ${maid.name}?\n\nThey will be notified that tracking has ended.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          setMaids((prev) => prev.filter((m) => m.id !== maid.id));
          setPositions((prev) => { const n = { ...prev }; delete n[maid.id]; return n; });
        }},
      ]
    );
  };

  const handlePause = (maid) => {
    Alert.alert(
      'Pause Tracking',
      `Pause location tracking for ${maid.name}?\n\nYou can resume anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pause', onPress: () =>
          setMaids((prev) => prev.map((m) => m.id === maid.id ? { ...m, status: 'paused' } : m))
        },
      ]
    );
  };

  const handleResume = (maid) => {
    setMaids((prev) => prev.map((m) => m.id === maid.id ? { ...m, status: 'tracking' } : m));
    Alert.alert('Tracking Resumed', `${maid.name} will be notified that location sharing is active again.`);
  };

  const handleReInvite = (maid) => {
    Alert.alert(
      'Re-send Invite',
      `Send a new tracking invite to ${maid.name} (${maid.phone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Invite', onPress: () => {
          setMaids((prev) => prev.map((m) => m.id === maid.id ? { ...m, status: 'pending', addedAt: new Date().toISOString() } : m));
          Alert.alert('📲 Invite Re-sent!', `${maid.name} will receive a new notification.`);
        }},
      ]
    );
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot Call', 'Unable to open the phone dialler on this device.')
    );
  };

  const handleOpenMap = (pos, label) => {
    const url = Platform.OS === 'ios'
      ? `maps:?q=${encodeURIComponent(label)}&ll=${pos.lat},${pos.lng}`
      : `geo:${pos.lat},${pos.lng}?q=${pos.lat},${pos.lng}(${encodeURIComponent(label)})`;
    Linking.canOpenURL(url)
      .then((ok) => Linking.openURL(ok ? url : `https://maps.google.com/?q=${pos.lat},${pos.lng}`))
      .catch(() => Linking.openURL(`https://maps.google.com/?q=${pos.lat},${pos.lng}`));
  };

  const liveCount    = maids.filter((m) => m.status === 'tracking').length;
  const pendingCount = maids.filter((m) => m.status === 'pending').length;

  const filteredMaids = activeFilter === 'tracking'
    ? maids.filter((m) => m.status === 'tracking')
    : activeFilter === 'pending'
    ? maids.filter((m) => m.status === 'pending')
    : maids;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={T.headerDark} />

      {/* Header */}
      <View style={scr.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={scr.backBtn}>
          <Text style={scr.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={scr.headerTitle}>👩‍🍳 Maid Tracking</Text>
            <Text style={scr.headerSub}>{liveCount} live · {pendingCount} pending</Text>
          </View>
          <TouchableOpacity style={scr.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={scr.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={scr.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        {maids.length > 0 && (
          <View style={scr.statsRow}>
            <TouchableOpacity
              style={[scr.statPill, { backgroundColor: activeFilter === 'tracking' ? T.success : T.successBg }, activeFilter === 'tracking' && scr.statPillActive]}
              onPress={() => setActiveFilter(activeFilter === 'tracking' ? 'all' : 'tracking')}
              activeOpacity={0.75}
            >
              <Text style={[scr.statNum, { color: activeFilter === 'tracking' ? T.white : T.success }]}>{liveCount}</Text>
              <Text style={[scr.statLabel, { color: activeFilter === 'tracking' ? T.white : T.success }]}>Live Now</Text>
              {activeFilter === 'tracking' && <Text style={scr.filterActiveTag}>✓ filtered</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[scr.statPill, { backgroundColor: activeFilter === 'pending' ? T.warning : T.warningBg }, activeFilter === 'pending' && scr.statPillActive]}
              onPress={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
              activeOpacity={0.75}
            >
              <Text style={[scr.statNum, { color: activeFilter === 'pending' ? T.white : T.warning }]}>{pendingCount}</Text>
              <Text style={[scr.statLabel, { color: activeFilter === 'pending' ? T.white : T.warning }]}>Pending</Text>
              {activeFilter === 'pending' && <Text style={scr.filterActiveTag}>✓ filtered</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[scr.statPill, { backgroundColor: activeFilter === 'all' ? T.primary : T.offlineBg }, activeFilter === 'all' && scr.statPillActive]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.75}
            >
              <Text style={[scr.statNum, { color: activeFilter === 'all' ? T.white : T.text }]}>{maids.length}</Text>
              <Text style={[scr.statLabel, { color: activeFilter === 'all' ? T.white : T.textMuted }]}>Total</Text>
              {activeFilter === 'all' && <Text style={[scr.filterActiveTag, { color: 'rgba(255,255,255,0.8)' }]}>all shown</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Tap hint */}
        {maids.length > 0 && (
          <View style={scr.hintBox}>
            <Text style={scr.hintText}>{'💡  Tap a card to see location details and actions'}</Text>
          </View>
        )}

        {/* Maid list */}
        <View style={scr.section}>
          <View style={scr.sectionHeader}>
            <Text style={scr.sectionTitle}>
              {activeFilter === 'tracking' ? '📡 Live Maids' : activeFilter === 'pending' ? '⏳ Pending Invites' : 'My Maids'}
            </Text>
            <TouchableOpacity style={scr.sectionAddBtn} onPress={() => setShowAdd(true)}>
              <Text style={scr.sectionAddText}>+ Add Maid</Text>
            </TouchableOpacity>
          </View>
          {maids.length === 0
            ? <EmptyState onAdd={() => setShowAdd(true)} />
            : filteredMaids.length === 0
            ? (
              <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>
                  {activeFilter === 'tracking' ? '📡' : '⏳'}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 4 }}>
                  No {activeFilter === 'tracking' ? 'live' : 'pending'} maids
                </Text>
                <Text style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
                  {activeFilter === 'tracking'
                    ? 'No one is sharing their location right now.'
                    : 'No invites are waiting for acceptance.'}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilter('all')} style={{ backgroundColor: T.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}>
                  <Text style={{ color: T.white, fontWeight: '700', fontSize: 13 }}>Show All Maids</Text>
                </TouchableOpacity>
              </View>
            )
            : filteredMaids.map((maid) => (
                <MaidCard
                  key={maid.id}
                  maid={maid}
                  position={positions[maid.id] || null}
                  onRemove={handleRemove}
                  onPause={handlePause}
                  onResume={handleResume}
                  onReInvite={handleReInvite}
                  onOpenMap={handleOpenMap}
                  onCall={handleCall}
                />
              ))
          }
        </View>

        {/* Privacy */}
        <View style={scr.privacyBox}>
          <Text style={scr.privacyTitle}>🔐 Privacy & Consent</Text>
          <Text style={scr.privacyText}>
            {'• Location is only shared after the maid explicitly accepts.\n'}
            {'• Maids can stop sharing anytime from their app.\n'}
            {'• You are notified when a maid goes offline.\n'}
            {'• Location data is not stored after the session ends.'}
          </Text>
        </View>

      </ScrollView>

      <AddMaidModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────
const scr = StyleSheet.create({
  header:         { backgroundColor: T.header, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:        { marginBottom: 8 },
  backText:       { color: T.white, fontSize: 14, fontWeight: '600' },
  headerTitle:    { color: T.white, fontSize: 18, fontWeight: '800' },
  headerSub:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  addBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText:     { color: T.white, fontWeight: '800', fontSize: 13 },
  scroll:         { padding: 16, paddingBottom: 40 },
  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statPill:       { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statPillActive: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
  filterActiveTag:{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 3, letterSpacing: 0.3 },
  statNum:        { fontSize: 22, fontWeight: '900' },
  statLabel:      { fontSize: 11, fontWeight: '700', marginTop: 2 },
  hintBox:        { backgroundColor: T.accentBg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 12 },
  hintText:       { fontSize: 12, color: '#92400E', fontWeight: '600', textAlign: 'center' },
  section:        { backgroundColor: T.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: T.border },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:   { fontSize: 15, fontWeight: '800', color: T.text },
  sectionAddBtn:  { backgroundColor: T.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  sectionAddText: { color: T.white, fontSize: 12, fontWeight: '800' },
  privacyBox:     { backgroundColor: T.infoBg, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: T.infoBorder },
  privacyTitle:   { fontSize: 12, fontWeight: '800', color: T.primary, marginBottom: 6 },
  privacyText:    { fontSize: 12, color: '#3A7A7A', lineHeight: 20 },
});