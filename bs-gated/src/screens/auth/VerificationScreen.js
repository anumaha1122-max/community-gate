/**
 * VerificationScreen.js
 *
 * Used in TWO contexts:
 *
 * CONTEXT A — After registration (via AuthNavigator, user NOT logged in):
 *   route.params.user contains the newly registered user
 *   After submit → show success → "Go Back to Login" button → navigate('Login')
 *
 * CONTEXT B — From Profile inside role dashboard (user IS logged in):
 *   reads user from AuthStore session
 *   After submit → "Back to Profile" → navigation.goBack()
 *
 * VERIFICATION STATUSES:
 *   not_submitted → show upload form
 *   pending       → show "waiting for approval" + "Go Back to Login" or "Back to Profile"
 *   approved      → show approved state
 *   rejected      → show rejected + resubmit option
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert, TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../../store/AuthStore';

const P = {
  teal:          '#1A7A7A',
  tealDark:      '#0D6E6E',
  tealSoft:      '#E8F5F5',
  tealMid:       '#D0EEEE',
  bg:            '#E8F5F5',
  surface:       '#FFFFFF',
  text:          '#1A2E2E',
  textMuted:     '#7A9E9E',
  textSub:       '#3D6E6E',
  border:        '#D0EEEE',
  success:       '#2E7D32',
  successBg:     '#E8F5E9',
  successBorder: '#A5D6A7',
  warning:       '#E65100',
  warningBg:     '#FEF3C7',
  warningBorder: '#FDE68A',
  danger:        '#C62828',
  dangerBg:      '#FEE2E2',
  dangerBorder:  '#FECACA',
  blue:          '#1D4ED8',
  blueBg:        '#EFF6FF',
  blueBorder:    '#BFDBFE',
};

const DOCS_BY_ROLE = {
  resident: [
    { id: 'id_proof',   label: 'Government ID Proof',       desc: 'Aadhaar / PAN / Passport',              required: true  },
    { id: 'flat_doc',   label: 'Flat Ownership Document',   desc: 'Sale Deed / Allotment / Rent Agreement', required: true  },
    { id: 'photo',      label: 'Passport Size Photo',       desc: 'Clear recent photograph',               required: true  },
    { id: 'vehicle_rc', label: 'Vehicle RC (Optional)',     desc: 'RC book for your vehicle',              required: false },
  ],
  vendor: [
    { id: 'business_reg', label: 'Business Registration', desc: 'Shop Act / MSME / Partnership Deed', required: true  },
    { id: 'gst',          label: 'GST Certificate',       desc: 'GSTIN registration certificate',     required: true  },
    { id: 'id_proof',     label: 'Owner ID Proof',        desc: 'Aadhaar / PAN Card',                 required: true  },
    { id: 'photo',        label: 'Business / Owner Photo',desc: 'Recent photograph',                  required: true  },
  ],
  security: [
    { id: 'id_proof',      label: 'Government ID Proof',             desc: 'Aadhaar Card (mandatory)',      required: true  },
    { id: 'police_verify', label: 'Police Verification Certificate', desc: 'Background check clearance',   required: true  },
    { id: 'photo',         label: 'Passport Size Photo',             desc: 'Clear recent photograph',      required: true  },
    { id: 'experience',    label: 'Experience Letter (Optional)',    desc: 'Letter from previous employer', required: false },
  ],
  builder: [
    { id: 'rera',          label: 'RERA Registration',        desc: 'State RERA certificate',             required: true  },
    { id: 'gst',           label: 'GST Certificate',          desc: 'Company GSTIN',                      required: true  },
    { id: 'company_pan',   label: 'Company PAN',              desc: 'Company PAN card',                   required: true  },
    { id: 'director_id',   label: 'Director / Promoter ID',  desc: 'Aadhaar or passport of director',    required: true  },
    { id: 'incorporation', label: 'Incorporation Certificate',desc: 'Company incorporation document',     required: false },
  ],
  admin: [
    { id: 'id_proof',      label: 'Government ID Proof',  desc: 'Aadhaar / PAN Card',          required: true },
    { id: 'authorization', label: 'Authorization Letter', desc: 'Society NOC / MC Resolution', required: true },
    { id: 'photo',         label: 'Passport Size Photo',  desc: 'Clear recent photograph',     required: true },
  ],
};

const ROLE_FIELDS = {
  resident: [
    { id: 'flat',    label: 'Flat / Unit Number', placeholder: 'e.g. B-204' },
    { id: 'block',   label: 'Block / Tower',      placeholder: 'e.g. Block B' },
    { id: 'members', label: 'Number of Members',  placeholder: 'e.g. 4', keyboardType: 'numeric' },
  ],
  vendor: [
    { id: 'businessName', label: 'Business Name',    placeholder: 'e.g. Raju Electricals' },
    { id: 'gstNumber',    label: 'GST Number',       placeholder: 'e.g. 27XXXXX1234Z1ZV' },
    { id: 'serviceArea',  label: 'Service Category', placeholder: 'e.g. Electrical, Plumbing' },
  ],
  security: [
    { id: 'gate',       label: 'Assigned Gate / Post', placeholder: 'e.g. Main Gate' },
    { id: 'shift',      label: 'Shift Preference',     placeholder: 'Day / Night / Flexible' },
    { id: 'experience', label: 'Years of Experience',  placeholder: 'e.g. 3', keyboardType: 'numeric' },
  ],
  builder: [
    { id: 'company',    label: 'Company Name',    placeholder: 'e.g. ABC Constructions' },
    { id: 'reraNumber', label: 'RERA Number',     placeholder: 'e.g. P52100040697' },
    { id: 'city',       label: 'Operating City',  placeholder: 'e.g. Pune' },
  ],
  admin: [
    { id: 'societyName', label: 'Society / Complex Name', placeholder: 'e.g. Green Valley' },
    { id: 'designation', label: 'Your Designation',       placeholder: 'e.g. Secretary / Chairman' },
  ],
};

const APPROVER = {
  resident: 'Admin', vendor: 'Admin', security: 'Admin',
  builder: 'Super Admin', admin: 'Super Admin',
};

const ROLE_LABEL = {
  resident: 'Resident', vendor: 'Vendor', security: 'Guard / Security',
  builder: 'Builder', admin: 'Admin',
};

function DocCard({ doc, uploaded, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.docCard, uploaded && { borderColor: P.successBorder, backgroundColor: '#F9FFFA' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.docIconBox, { backgroundColor: uploaded ? P.successBg : P.tealSoft }]}>
        <Text style={{ fontSize: 24 }}>{uploaded ? '✅' : '📄'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{doc.label}</Text>
        <Text style={styles.docDesc}>{doc.desc}</Text>
        {!doc.required && <Text style={styles.optionalTag}>Optional</Text>}
      </View>
      <View style={[styles.uploadPill, { backgroundColor: uploaded ? P.successBg : P.tealSoft }]}>
        <Text style={[styles.uploadPillText, { color: uploaded ? P.success : P.teal }]}>
          {uploaded ? '✓ Done' : '+ Upload'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VerificationScreen({ navigation, route }) {
  // CONTEXT A: came from registration/login flow — user passed via params
  // CONTEXT B: came from profile inside dashboard — user from store session
  const sessionUser        = useAuthStore(s => s.user);
  const submitVerification = useAuthStore(s => s.submitVerification);
  const registeredUsers    = useAuthStore(s => s.registeredUsers);
  const isLoggedIn         = useAuthStore(s => s.isLoggedIn);

  // Prefer route param user (registration flow), fall back to session user (profile flow)
  const paramUser  = route?.params?.user;
  const isResubmit = route?.params?.resubmit || false;

  // Determine which user we are verifying
  const activeUser = paramUser || sessionUser;
  const role       = activeUser?.role || 'resident';
  const docs       = DOCS_BY_ROLE[role]  || [];
  const fields     = ROLE_FIELDS[role]   || [];
  const approver   = APPROVER[role]      || 'Admin';
  const roleLabel  = ROLE_LABEL[role]    || role;

  // Get LIVE verificationStatus from registeredUsers (reflects admin approval instantly)
  const liveUser           = registeredUsers.find(u => u.id === activeUser?.id) || activeUser;
  const verificationStatus = isResubmit ? 'not_submitted' : (liveUser?.verificationStatus || 'not_submitted');

  const [uploaded,    setUploaded]    = useState({});
  const [fieldValues, setFieldValues] = useState({});

  const requiredDocs = docs.filter(d => d.required);
  const requiredDone = requiredDocs.filter(d => uploaded[d.id]).length;

  // Context-aware back button
  // If not logged in (auth flow) → go to Login
  // If logged in (profile flow) → go back to profile
  const handleBack = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      navigation.goBack();
    }
  };

  // Context-aware done button (after submit / status screens)
  // If not logged in → "Go Back to Login"
  // If logged in → "Back to Profile"
  const doneLabel  = isLoggedIn ? 'Back to Profile' : 'Go Back to Login';
  const handleDone = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      navigation.goBack();
    }
  };

  const handleUpload = async (docId) => {
    Alert.alert('Debug', 'Opening Picker...');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploaded(prev => ({ ...prev, [docId]: file.name }));
      }
    } catch (err) {
      console.error('Picker Error:', err);
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleSubmit = () => {
    const missing = requiredDocs.filter(d => !uploaded[d.id]);
    if (missing.length > 0) {
      Alert.alert(
        'Missing Documents',
        `Please upload these required documents:\n\n${missing.map(d => `• ${d.label}`).join('\n')}`
      );
      return;
    }
    Alert.alert(
      'Submit Verification',
      `Your documents will be sent to the ${approver} for review.\n\nAfter submission, please wait for approval.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            await submitVerification(activeUser?.id);
            Alert.alert('Submitted', 'Your verification request is now pending.');
          },
        },
      ]
    );
  };

  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (verificationStatus === 'approved') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.successBorder }]}>
            <Text style={styles.statusEmoji}>✅</Text>
            <Text style={styles.statusTitle}>Verification Approved!</Text>
            <Text style={styles.statusBody}>
              Your profile has been verified and approved by the{' '}
              <Text style={{ fontWeight: '800', color: P.teal }}>{approver}</Text>.
              You have full access to all features.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.successBg, borderColor: P.successBorder }]}>
              <Text style={[styles.badgeText, { color: P.success }]}>✓ Verified & Approved</Text>
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PENDING ───────────────────────────────────────────────────────────────
  if (verificationStatus === 'pending' || verificationStatus === 'pending_approval') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.blueBorder }]}>
            <Text style={styles.statusEmoji}>📬</Text>
            <Text style={styles.statusTitle}>Documents Submitted!</Text>
            <Text style={styles.statusBody}>
              Your verification request has been sent to the{' '}
              <Text style={{ fontWeight: '800', color: P.teal }}>{approver}</Text> for review.{'\n\n'}
              Please wait for approval. You will be notified once approved.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.blueBg, borderColor: P.blueBorder }]}>
              <Text style={[styles.badgeText, { color: P.blue }]}>⏳ Waiting for {approver} Approval</Text>
            </View>
            <View style={styles.stepsList}>
              {[
                { label: 'Documents Uploaded',    done: true },
                { label: `${approver} reviewing`, done: false, active: true },
                { label: 'You get notified',      done: false },
                { label: 'Profile activated',     done: false },
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepDot, step.done && styles.stepDotDone, step.active && styles.stepDotActive]}>
                    <Text style={styles.stepDotNum}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, step.done && { color: P.success }, step.active && { color: P.teal, fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
            {/* Go Back to Login button */}
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── REJECTED ──────────────────────────────────────────────────────────────
  if (verificationStatus === 'rejected') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.dangerBorder }]}>
            <Text style={styles.statusEmoji}>❌</Text>
            <Text style={styles.statusTitle}>Verification Rejected</Text>
            <Text style={styles.statusBody}>
              Your documents were reviewed by the{' '}
              <Text style={{ fontWeight: '800', color: P.danger }}>{approver}</Text> and could not be approved.{'\n\n'}
              Please upload the correct documents and resubmit.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.dangerBg, borderColor: P.dangerBorder }]}>
              <Text style={[styles.badgeText, { color: P.danger }]}>✗ Rejected — Resubmission Required</Text>
            </View>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: P.danger, marginBottom: 12 }]}
              onPress={() => {
                // Reset store verificationStatus back to not_submitted so form reappears
                useAuthStore.setState(s => ({
                  registeredUsers: s.registeredUsers.map(u =>
                    u.id === activeUser?.id
                      ? { ...u, verificationStatus: 'not_submitted', docsSubmitted: false }
                      : u
                  ),
                  user: s.user?.id === activeUser?.id
                    ? { ...s.user, verificationStatus: 'not_submitted', docsSubmitted: false }
                    : s.user,
                }));
                setUploaded({});
                setFieldValues({});
              }}
            >
              <Text style={styles.doneBtnText}>Resubmit Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#64748B' }]} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── NOT SUBMITTED — show form ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Verification</Text>
        <Text style={styles.headerSub}>{roleLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        <View style={[styles.banner, { backgroundColor: P.warningBg, borderColor: P.warningBorder }]}>
          <Text style={[styles.bannerTitle, { color: P.warning }]}>📋 Complete Your Verification</Text>
          <Text style={[styles.bannerBody, { color: P.warning }]}>
            Fill in your details and upload the required documents.
            Your profile will be reviewed by the{' '}
            <Text style={{ fontWeight: '800' }}>{approver}</Text> after submission.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Required documents</Text>
            <Text style={[styles.progressCount, { color: requiredDone === requiredDocs.length ? P.success : P.teal }]}>
              {requiredDone} / {requiredDocs.length}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${requiredDocs.length > 0 ? (requiredDone / requiredDocs.length) * 100 : 0}%`,
            }]} />
          </View>
        </View>

        {fields.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Your Details</Text>
            {fields.map(f => (
              <View key={f.id} style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={fieldValues[f.id] || ''}
                  onChangeText={v => setFieldValues(prev => ({ ...prev, [f.id]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={P.textMuted}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              uploaded={!!uploaded[doc.id]}
              onPress={() => handleUpload(doc.id)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Request for Approval →</Text>
        </TouchableOpacity>

        {/* Back to Login link at bottom */}
        <TouchableOpacity style={styles.backToLoginBtn} onPress={handleDone}>
          <Text style={styles.backToLoginText}>← {doneLabel}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: P.bg },
  header:          { backgroundColor: P.teal, padding: 20, paddingTop: 20 },
  backBtn:         { marginBottom: 8 },
  backText:        { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' },
  headerTitle:     { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  headerSub:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  banner:          { margin: 16, borderRadius: 14, borderWidth: 1, padding: 16 },
  bannerTitle:     { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  bannerBody:      { fontSize: 13, lineHeight: 20 },
  progressCard:    { marginHorizontal: 16, marginBottom: 12, backgroundColor: P.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.border },
  progressRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel:   { fontSize: 13, fontWeight: '700', color: P.textSub },
  progressCount:   { fontSize: 13, fontWeight: '800' },
  progressBarBg:   { height: 6, backgroundColor: P.tealMid, borderRadius: 4 },
  progressBarFill: { height: 6, backgroundColor: P.teal, borderRadius: 4 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 12, marginTop: 4 },
  fieldLabel:      { fontSize: 13, fontWeight: '700', color: P.textSub, marginBottom: 5 },
  fieldInput:      { borderWidth: 1.5, borderRadius: 10, borderColor: P.border, backgroundColor: P.surface, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text },
  docCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, borderRadius: 14, borderWidth: 1, borderColor: P.border, padding: 14, marginBottom: 10 },
  docIconBox:      { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docLabel:        { fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 2 },
  docDesc:         { fontSize: 12, color: P.textMuted, lineHeight: 17 },
  optionalTag:     { fontSize: 11, color: P.teal, fontWeight: '600', marginTop: 2 },
  uploadPill:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  uploadPillText:  { fontSize: 12, fontWeight: '700' },
  submitBtn:       { marginHorizontal: 16, marginTop: 8, backgroundColor: P.teal, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText:   { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  backToLoginBtn:  { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  backToLoginText: { color: P.teal, fontSize: 14, fontWeight: '700' },

  centeredContent: { flexGrow: 1, padding: 16 },
  statusCard:      { backgroundColor: P.surface, borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center' },
  statusEmoji:     { fontSize: 56, marginBottom: 16 },
  statusTitle:     { fontSize: 22, fontWeight: '900', color: P.text, marginBottom: 8, textAlign: 'center' },
  statusBody:      { fontSize: 14, color: P.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  badge:           { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 },
  badgeText:       { fontSize: 13, fontWeight: '700' },
  stepsList:       { width: '100%', marginBottom: 24 },
  stepRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepDot:         { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepDotDone:     { backgroundColor: P.successBg, borderWidth: 1.5, borderColor: P.success },
  stepDotActive:   { backgroundColor: P.tealSoft, borderWidth: 1.5, borderColor: P.teal },
  stepDotNum:      { fontSize: 11, fontWeight: '800', color: '#64748B' },
  stepText:        { fontSize: 14, color: P.textMuted, flex: 1 },
  doneBtn:         { width: '100%', backgroundColor: P.teal, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 4 },
  doneBtnText:     { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
