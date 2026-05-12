import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function ServicesOfferedScreen({ navigation }) {
  const theme = useTheme();
  const ALL_SERVICES = [
    'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Cleaning',
    'AC Service', 'Pest Control', 'Interior Design', 'Lift Maintenance', 'CCTV Installation',
  ];
  const [selected, setSelected] = useState(['Plumbing', 'Electrical']);

  const toggle = (svc) => {
    setSelected(prev =>
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Services Offered" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.sectionHint}>Select all services you provide to customers.</Text>

        <Card style={{ marginBottom: 12, paddingVertical: 4 }}>
          {ALL_SERVICES.map((svc, i) => {
            const active = selected.includes(svc);
            return (
              <View key={svc}>
                <TouchableOpacity style={s.serviceRow} activeOpacity={0.75} onPress={() => toggle(svc)}>
                  <View style={[s.checkbox, active && s.checkboxActive]}>
                    {active && <Text style={s.checkmark}>✓</Text>}
                  </View>
                  <Text style={[s.serviceLabel, active && { color: Colors.purple, fontWeight: Fonts.bold }]}>{svc}</Text>
                </TouchableOpacity>
                {i < ALL_SERVICES.length - 1 && <Divider />}
              </View>
            );
          })}
        </Card>

        <PrimaryButton
          title={`Save (${selected.length} selected)`}
          onPress={() => navigation.goBack()}
          color={Colors.purple}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:        { padding: 16, paddingBottom: 40 },
  sectionHint:   { fontSize: 13, color: '#3D6E6E', marginBottom: 16, lineHeight: 20 },
  serviceRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8, borderWidth: 1, borderColor: '#D0EEEE', gap: 14 },
  checkbox:      { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D0EEEE', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FFFE' },
  checkboxActive:{ borderColor: '#1A7A7A', backgroundColor: '#1A7A7A' },
  checkmark:     { color: '#FFF', fontSize: 14, fontWeight: '900' },
  bold:          { fontWeight: '800', color: '#1A2E2E' },
  purple:        { color: '#1A7A7A' },
});
