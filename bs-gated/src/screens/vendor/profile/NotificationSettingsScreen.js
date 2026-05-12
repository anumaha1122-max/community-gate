import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function NotificationSettingsScreen({ navigation }) {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    new_requests: true,
    quote_approved: true,
    quote_rejected: true,
    payment: true,
    reminders: true,
    promotions: false,
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const ITEMS = [
    { key: 'new_requests',   label: 'New Requests',        sub: 'When a customer sends a new request' },
    { key: 'quote_approved', label: 'Quote Approved',       sub: 'When your quote is accepted'         },
    { key: 'quote_rejected', label: 'Quote Rejected',       sub: 'When your quote is declined'         },
    { key: 'payment',        label: 'Payment Received',     sub: 'When payment is credited'            },
    { key: 'reminders',      label: 'Job Reminders',        sub: 'Visit and deadline reminders'        },
    { key: 'promotions',     label: 'Promotions & Offers',  sub: 'App deals and special offers'        },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Card style={{ paddingVertical: 4 }}>
          {ITEMS.map((item, i) => (
            <View key={item.key}>
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>{item.label}</Text>
                  <Text style={s.toggleSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ false: Colors.border, true: Colors.teal }}
                  thumbColor="#fff"
                />
              </View>
              {i < ITEMS.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:      { padding: 16, paddingBottom: 40 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  toggleLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  toggleSub:   { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  teal:        { color: '#1A7A7A' },
});
