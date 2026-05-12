import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

const revenueData = [
  { id: '1', title: 'Subscription Revenue', value: '₹9.4L', desc: 'From society annual plans' },
  { id: '2', title: 'Builder Revenue', value: '₹4.8L', desc: 'From builder onboarding and services' },
  { id: '3', title: 'Marketplace Revenue', value: '₹1.8L', desc: 'Vendor and order commissions' },
  { id: '4', title: 'Other Revenue', value: '₹2.6L', desc: 'Ads, white-label and support services' },
];

export default function RevenueDetailsScreen({ navigation }) {
  return (
    <ScreenWrapper>
      <AppHeader
        title="Revenue Details"
        subtitle="Revenue overview and breakdown"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={styles.summaryValue}>₹18.6L</Text>
          <Text style={styles.summarySubtext}>+8.4% growth from last cycle</Text>
        </View>

        <SectionHeader title="Revenue Breakdown" />

        {revenueData.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primaryNavy,
    borderRadius: SPACING.radiusMd,
    padding: SPACING.lg,
  },
  summaryLabel: {
    color: '#D9E3F0',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  summarySubtext: {
    color: '#D9E3F0',
    fontSize: 13,
    marginTop: 6,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryNavy,
    marginTop: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 6,
    lineHeight: 18,
  },
});