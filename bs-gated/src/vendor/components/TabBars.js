import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Fonts, Radius } from '../theme';
import { useAuthStore } from '../../store/AuthStore';

const TAB_ICONS = {
  home:     '🏠',
  requests: '📋',
  jobs:     '🔧',
  earnings: '💰',
  profile:  '👤',
  orders:   '📦',
  products: '🛒',
  more:     '•••',
};

export const BusinessTabBar = ({ activeTab, onTabPress }) => {
  const verificationStatus = useAuthStore(s => {
    try {
      const live = s.registeredUsers && s.user
        ? s.registeredUsers.find(u => u.id === s.user.id)
        : null;
      return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
    } catch { return 'not_submitted'; }
  });
  const isVerified = verificationStatus === 'approved';

  const tabs = [
    { key: 'Home',     icon: 'home',     label: 'Home',     unlocked: true  },
    { key: 'Requests', icon: 'requests', label: 'Requests', unlocked: false },
    { key: 'Jobs',     icon: 'jobs',     label: 'Jobs',     unlocked: false },
    { key: 'Earnings', icon: 'earnings', label: 'Earnings', unlocked: false },
    { key: 'Profile',  icon: 'profile',  label: 'Profile',  unlocked: true  },
  ];
  return (
    <View style={styles.bar}>
      {tabs.map(t => {
        const active  = activeTab === t.key;
        const locked  = !isVerified && !t.unlocked;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              if (locked) {
                Alert.alert(
                  '🔒 Verification Required',
                  'Please verify your account from Profile to unlock this section.',
                  [
                    { text: 'Go to Profile', onPress: () => onTabPress('Profile') },
                    { text: 'OK', style: 'cancel' },
                  ]
                );
                return;
              }
              onTabPress(t.key);
            }}
            activeOpacity={0.7}
            style={[styles.item, active && { backgroundColor: Colors.purpleLight }]}
          >
            <View style={{ position: 'relative' }}>
              <Text style={[styles.icon, locked && { opacity: 0.35 }]}>{TAB_ICONS[t.icon]}</Text>
              {locked && (
                <Text style={{ position: 'absolute', top: -4, right: -6, fontSize: 9 }}>🔒</Text>
              )}
            </View>
            <Text style={[styles.label, active && { color: Colors.purple, fontWeight: Fonts.bold }, locked && { opacity: 0.35 }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MarketplaceTabBar = ({ activeTab, onTabPress }) => {
  const verificationStatus = useAuthStore(s => {
    try {
      const live = s.registeredUsers && s.user
        ? s.registeredUsers.find(u => u.id === s.user.id)
        : null;
      return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
    } catch {
      return 'not_submitted';
    }
  });
  const isVerified = verificationStatus === 'approved';

  const tabs = [
    { key: 'Home',     icon: 'home',     label: 'Home',     unlocked: true  },
    { key: 'Orders',   icon: 'orders',   label: 'Orders',   unlocked: false },
    { key: 'Products', icon: 'products', label: 'Products', unlocked: false },
    { key: 'Earnings', icon: 'earnings', label: 'Earnings', unlocked: false },
    { key: 'More',     icon: 'more',     label: 'Profile',  unlocked: true  },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map(t => {
        const active  = activeTab === t.key;
        const locked  = !isVerified && !t.unlocked;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              if (locked) {
                Alert.alert(
                  '🔒 Verification Required',
                  'Please verify your account from Profile to unlock this section.',
                  [
                    { text: 'Go to Profile', onPress: () => onTabPress('More') },
                    { text: 'OK', style: 'cancel' },
                  ]
                );
                return;
              }
              onTabPress(t.key);
            }}
            activeOpacity={0.7}
            style={[styles.item, active && { backgroundColor: Colors.tealLight }]}
          >
            <View style={{ position: 'relative' }}>
              <Text style={[styles.icon, locked && { opacity: 0.35 }]}>{TAB_ICONS[t.icon]}</Text>
              {locked && (
                <Text style={{ position: 'absolute', top: -4, right: -6, fontSize: 9 }}>🔒</Text>
              )}
            </View>
            <Text style={[styles.label, active && { color: Colors.teal, fontWeight: Fonts.bold }, locked && { opacity: 0.35 }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 68,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  icon:  { fontSize: 20 },
  label: { fontSize: 10, fontWeight: Fonts.medium, color: Colors.text3, marginTop: 3 },
});
