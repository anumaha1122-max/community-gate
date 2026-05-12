import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function PrivacySecurityScreen({ navigation }) {
  const theme = useTheme();
  const [twoFA, setTwoFA] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Privacy & Security" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Card style={{ marginBottom: 12 }}>
          <Text style={s.cardTitle}>Security</Text>
          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Two-Factor Authentication</Text>
              <Text style={s.toggleSub}>Extra security on login</Text>
            </View>
            <Switch value={twoFA} onValueChange={setTwoFA} trackColor={{ false: Colors.border, true: Colors.teal }} thumbColor="#fff" />
          </View>
          <Divider />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.75}>
            <Text style={s.menuLabel}>Change Password</Text>
            <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.75}>
            <Text style={s.menuLabel}>Active Login Sessions</Text>
            <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Privacy</Text>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.75}>
            <Text style={s.menuLabel}>Privacy Policy</Text>
            <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.75}>
            <Text style={s.menuLabel}>Terms of Service</Text>
            <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={[s.menuRow]} activeOpacity={0.75}>
            <Text style={[s.menuLabel, { color: '#E53E3E' }]}>Delete Account</Text>
            <Text style={{ fontSize: 18, color: '#E53E3E' }}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:      { padding: 16, paddingBottom: 40 },
  cardTitle:   { fontSize: 14, fontWeight: '800', color: '#1A2E2E', marginBottom: 10 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  toggleLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  toggleSub:   { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  menuRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#D0EEEE', gap: 12 },
  menuLabel:   { flex: 1, fontSize: 14, fontWeight: '600', color: '#1A2E2E' },
  teal:        { color: '#1A7A7A' },
  text3:       { color: '#7A9E9E' },
});
