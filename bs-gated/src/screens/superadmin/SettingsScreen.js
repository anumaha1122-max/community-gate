import React from 'react';
import { ScrollView, Alert } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import ActionTile from '../../components/SAActionTile';
import InfoBanner from '../../components/SAInfoBanner';
import { useAuthStore } from '../../store/AuthStore';

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout(); // 🔥 this triggers Login screen
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Platform Settings"
        subtitle="Master configuration and controls"
        rightIcon="options-outline"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <InfoBanner text="Use this section for platform identity, billing rules, gateway setup, feature toggles, white-label management and compliance settings." />

        <SectionHeader title="Configuration Modules" />

        <ActionTile
          title="Subscription Plans"
          subtitle="Pricing, billing cycle, plan features"
          icon="card-outline"
          onPress={() => navigation.navigate('SubscriptionPlans')}
        />

        <ActionTile
          title="White Label Settings"
          subtitle="Domain, theme, logo, fonts"
          icon="color-palette-outline"
          onPress={() => navigation.navigate('WhiteLabel')}
        />

        <ActionTile
          title="System Health"
          subtitle="API, DB, queue and logs"
          icon="pulse-outline"
          onPress={() => navigation.navigate('SystemHealth')}
        />

        <ActionTile
          title="Society Management"
          subtitle="Approve and activate societies"
          icon="business-outline"
          onPress={() => navigation.navigate('Societies')}
        />

        <ActionTile
          title="Franchise Management"
          subtitle="Multi-city franchise network & builders"
          icon="git-network-outline"
          onPress={() => navigation.navigate('FranchiseManagement')}
        />

        <SectionHeader title="Account" />

        <ActionTile
          title="Logout"
          subtitle="Go back to dashboard"
          icon="log-out-outline"
          onPress={handleLogout}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}