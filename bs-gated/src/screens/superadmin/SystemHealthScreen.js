import React from 'react';
import { ScrollView } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import ListCard from '../../components/SAListCard';
import { systemHealth } from '../../data/superAdminData';

export default function SystemHealthScreen({ navigation }) {
  return (
    <ScreenWrapper>
      <AppHeader
        title="System Health"
        subtitle="Servers, APIs and queues"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Live Service Status" />

        {systemHealth.map((service) => (
          <ListCard
            key={service.id}
            title={service.service}
            subtitle={service.detail}
            metaLeft="Platform"
            metaRight="Live"
            status={service.status}
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}