import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import StatCard from '../../components/SAStatCard';
import ListCard from '../../components/SAListCard';
import { analyticsCards, activityFeed } from '../../data/superAdminData';
import SPACING from '../../theme/spacing';

export default function AnalyticsScreen() {
  return (   
    <ScreenWrapper>
      <AppHeader  
        title="Platform Analytics"
        subtitle="All societies · builders · revenue"
        rightIcon="download-outline"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="KPI Overview" />
        <View style={styles.statsWrap}>
          {analyticsCards.map((item) => (
            <StatCard
              key={item.id}
              title={item.title}     
              value={item.value}
              change="Updated now"
            />
          ))}
        </View>

        <SectionHeader title="Recent Metric Events" />
        {activityFeed.map((item) => (
          <ListCard
            key={item.id}
            title={item.title}
            subtitle={item.time}
            metaLeft="Analytics"
            metaRight="Live"
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsWrap: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});           