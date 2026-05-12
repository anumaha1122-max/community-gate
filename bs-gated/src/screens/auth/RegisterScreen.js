/**
 * RegisterScreen.js
 *
 * Simple registration — just account details, NO doc upload here.
 * Docs are collected later inside the dashboard (Profile > Verify).
 *
 * Fields: Role, Full Name, Mobile, OTP (demo skip), Password, Confirm Password
 *
 * On submit:
 *   → registerUser() saves user AND auto-logs in (isLoggedIn=true)
 *   → RootNavigator routes to role dashboard automatically
 *   → Inside dashboard: Profile tab is open, all other tabs locked until verified
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../../store/AuthStore';

const ROLES = ['Resident', 'Vendor', 'Guard', 'Builder', 'Admin'];
const MOCK_OTP = '123456';

const ROLE_MAP = {
  Resident: 'resident',
  Vendor:   'vendor',
  Guard:    'security',
  Builder:  'builder',
  Admin:    'admin',
};

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFFFFF', text: '#1A2E2E', textSub: '#3D6E6E',
  textMuted: '#7A9E9E', border: '#D0EEEE', success: '#2E7D32',
  successBg: '#E8F5E9', successBorder: '#A5D6A7',
};

export default function RegisterScreen({ navigation }) {
  const registerUser = useAuthStore((s) => s.registerUser);

  const [name,            setName]            = useState('');
  const [phone,           setPhone]           = useState('');
  const [unit,            setUnit]            = useState('');
  const [otp,             setOtp]             = useState('');
  const [otpSent,         setOtpSent]         = useState(false);
  const [otpVerified,     setOtpVerified]     = useState(false);
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState('Resident');
  const [showPw,          setShowPw]          = useState(false);
  const [aadhaarDoc,      setAadhaarDoc]      = useState(null);
  const [panDoc,          setPanDoc]          = useState(null);

  const handleSendOtp = () => {
    if (phone.length < 10) { Alert.alert('Invalid', 'Enter a valid 10-digit mobile number.'); return; }
    setOtpSent(true);
    Alert.alert('OTP Sent', `Demo OTP: ${MOCK_OTP}\n\nYou can also tap "Skip OTP" below.`);
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== MOCK_OTP) { Alert.alert('Wrong OTP', `Demo OTP is ${MOCK_OTP}`); return; }
    setOtpVerified(true);
  };

  const handleSkipOtp = () => {
    // Demo only — skip OTP verification
    setOtpVerified(true);
    setOtpSent(true);
  };

  const pickDoc = async (type) => {
    Alert.alert('Debug', 'Opening Picker...');
    console.log('Picking document for:', type);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
      });

      console.log('Picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file.name);
        if (type === 'aadhaar') setAadhaarDoc(file);
        else if (type === 'pan') setPanDoc(file);
      }
    } catch (err) {
      console.error('Document Picker Error:', err);
      Alert.alert('Picker Error', 'Could not open document picker.');
    }
  };

  const handleRegister = async () => {
    console.log('Attempting registration...');
    if (!name.trim())                 { Alert.alert('Required', 'Please enter your full name.'); return; }
    if (phone.length < 10)            { Alert.alert('Required', 'Enter a valid 10-digit mobile number.'); return; }
    if (!unit.trim())                { Alert.alert('Required', 'Please enter your Unit/Flat number.'); return; }
    if (!otpVerified)                 { Alert.alert('Required', 'Please verify your mobile number first.'); return; }
    if (!password.trim())             { Alert.alert('Required', 'Please create a password.'); return; }
    if (password.length < 6)          { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { Alert.alert('Mismatch', 'Passwords do not match.'); return; }

    const roleKey = ROLE_MAP[role] || 'resident';

    // registerUser() is now async — MUST await
    const result = await registerUser({
      name: name.trim(),
      phone: phone.trim(),
      unit: unit.trim(),
      password,
      role: roleKey,
      aadhaarUrl: aadhaarDoc ? aadhaarDoc.name : null,
      panUrl: panDoc ? panDoc.name : null,
    });

    if (!result.success) {
      Alert.alert('Error', result.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={[rs.safe, { backgroundColor: P.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={P.teal} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={rs.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={rs.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={rs.backBtn}>
              <Text style={rs.backText}>← Back to Login</Text>
            </TouchableOpacity>
            <Text style={rs.headerTitle}>Create Account</Text>
            <Text style={rs.headerSub}>Join your community — verify later inside the app</Text>
          </View>

          <View style={rs.card}>

            {/* Role selector */}
            <Text style={rs.label}>Register as *</Text>
            <View style={rs.roleGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[rs.roleChip, role === r && rs.roleChipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[rs.roleChipText, role === r && { color: '#FFF' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name */}
            <Text style={rs.label}>Full Name *</Text>
            <TextInput
              style={rs.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={P.textMuted}
              autoCapitalize="words"
            />

            {/* Unit / Flat Number */}
            <Text style={rs.label}>Unit / Flat Number *</Text>
            <TextInput
              style={rs.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g. A-101 or Villa 5"
              placeholderTextColor={P.textMuted}
            />

            {/* Mobile + OTP */}
            <Text style={rs.label}>Mobile Number *</Text>
            <View style={rs.row}>
              <TextInput
                style={[rs.input, { flex: 1, borderColor: otpVerified ? P.success : P.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile"
                placeholderTextColor={P.textMuted}
                keyboardType="numeric"
                maxLength={10}
                editable={!otpVerified}
              />
              <TouchableOpacity
                style={[rs.otpBtn, { backgroundColor: otpVerified ? P.success : P.teal }]}
                onPress={otpVerified ? null : handleSendOtp}
                activeOpacity={otpVerified ? 1 : 0.8}
              >
                <Text style={rs.otpBtnText}>{otpVerified ? '✓ Verified' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </View>

            {otpSent && !otpVerified && (
              <>
                <Text style={[rs.label, { marginTop: 8 }]}>Enter OTP *</Text>
                <View style={rs.row}>
                  <TextInput
                    style={[rs.input, { flex: 1 }]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="6-digit OTP"
                    placeholderTextColor={P.textMuted}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity style={[rs.otpBtn, { backgroundColor: P.tealDark }]} onPress={handleVerifyOtp}>
                    <Text style={rs.otpBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Demo skip OTP */}
            {!otpVerified && (
              <TouchableOpacity style={rs.skipBtn} onPress={handleSkipOtp}>
                <Text style={rs.skipBtnText}>⚡ Demo: Skip OTP Verification</Text>
              </TouchableOpacity>
            )}

            {/* Password */}
            <Text style={[rs.label, { marginTop: 8 }]}>Password *</Text>
            <View style={rs.row}>
              <TextInput
                style={[rs.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={P.textMuted}
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <TouchableOpacity style={rs.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={rs.label}>Confirm Password *</Text>
            <TextInput
              style={rs.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor={P.textMuted}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />

            {/* Document Upload Section */}
            {role === 'Resident' && (
              <>
                <Text style={rs.label}>Verification Documents (Optional) *</Text>
                <View style={rs.docRow}>
                  <TouchableOpacity style={[rs.docBtn, aadhaarDoc && rs.docBtnSuccess]} onPress={() => pickDoc('aadhaar')}>
                    <Text style={rs.docBtnEmoji}>{aadhaarDoc ? '✅' : '🪪'}</Text>
                    <Text style={[rs.docBtnText, aadhaarDoc && { color: P.success }]}>
                      {aadhaarDoc ? aadhaarDoc.name.substring(0, 15) : 'Upload Aadhaar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[rs.docBtn, panDoc && rs.docBtnSuccess]} onPress={() => pickDoc('pan')}>
                    <Text style={rs.docBtnEmoji}>{panDoc ? '✅' : '💳'}</Text>
                    <Text style={[rs.docBtnText, panDoc && { color: P.success }]}>
                      {panDoc ? panDoc.name.substring(0, 15) : 'Upload PAN Card'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Info box */}
            <View style={rs.infoBox}>
              <Text style={rs.infoText}>
                ℹ️ After registration you'll go straight to your dashboard.{'\n'}
                Go to <Text style={{ fontWeight: '800' }}>Profile → Verify Account</Text> to upload your documents and get approved.
              </Text>
            </View>

            <TouchableOpacity style={rs.registerBtn} onPress={handleRegister}>
              <Text style={rs.registerBtnText}>Register & Enter Dashboard →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rs.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={rs.loginLinkText}>
                Already have an account?{'  '}
                <Text style={{ fontWeight: '800', color: P.teal }}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const rs = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: { backgroundColor: P.teal, padding: 24, paddingTop: 48 },
  backBtn:{ marginBottom: 12 },
  backText:{ color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  card:   { margin: 16, backgroundColor: P.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: P.border },

  label:  { fontSize: 13, fontWeight: '700', color: P.textSub, marginBottom: 6, marginTop: 4 },
  input:  { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, backgroundColor: P.bg, borderColor: P.border, color: P.text, marginBottom: 2 },
  row:    { flexDirection: 'row', gap: 8 },
  otpBtn: { paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, justifyContent: 'center', minWidth: 100, alignItems: 'center' },
  otpBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  eyeBtn: { backgroundColor: P.bg, borderRadius: 12, padding: 13, borderWidth: 1.5, borderColor: P.border, justifyContent: 'center' },

  roleGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  roleChip:       { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, backgroundColor: P.bg, borderColor: P.border },
  roleChipActive: { backgroundColor: P.teal, borderColor: P.teal },
  roleChipText:   { fontSize: 13, fontWeight: '600', color: P.textMuted },

  skipBtn:     { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  skipBtnText: { fontSize: 12, color: P.teal, fontWeight: '700' },

  infoBox:  { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 4 },
  infoText: { fontSize: 13, color: '#1D4ED8', lineHeight: 20 },

  registerBtn:     { backgroundColor: P.teal, paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 12, marginBottom: 12 },
  registerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  loginLink:       { alignItems: 'center', paddingVertical: 8 },
  loginLinkText:   { fontSize: 14, color: P.textMuted },

  docRow:      { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 8 },
  docBtn:      { flex: 1, backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  docBtnSuccess:{ backgroundColor: P.successBg, borderColor: P.success },
  docBtnEmoji: { fontSize: 20 },
  docBtnText:  { fontSize: 12, fontWeight: '700', color: P.textSub, textAlign: 'center' },
});
