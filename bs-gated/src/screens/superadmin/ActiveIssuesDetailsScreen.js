import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

const issuesData = [
  {
    id: '1',
    title: 'Payment API latency spike',
    severity: 'Critical',
    desc: 'Payment service response time is higher than expected.',
  },
  {
    id: '2',
    title: 'Notification delivery backlog',
    severity: 'Critical',
    desc: 'Push notifications are delayed for some societies.',
  },
  {
    id: '3',
    title: 'Builder KYC pending review',
    severity: 'Warning',
    desc: 'Several builder verification requests are awaiting manual checks.',
  },
  {
    id: '4',
    title: 'Low storage alert',
    severity: 'Warning',
    desc: 'Media uploads are nearing storage threshold.',
  },
  {
    id: '5',
    title: 'Inactive society admin accounts',
    severity: 'Review',
    desc: 'Some admin accounts have not completed activation.',
  },
];

function getSeverityStyle(severity) {
  switch (severity) {
    case 'Critical':
      return { bg: '#FFE9E9', color: '#D93025' };
    case 'Warning':
      return { bg: '#FFF4E6', color: '#C97A10' };
    default:
      return { bg: '#EEF2FF', color: '#334155' };
  }
}

export default function ActiveIssuesDetailsScreen({ navigation }) {
  return (
    <ScreenWrapper>
      <AppHeader
        title="Active Issues"
        subtitle="Current platform alerts and problems"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Open Issues</Text>
          <Text style={styles.summaryValue}>05</Text>
          <Text style={styles.summarySubtext}>2 critical alerts need immediate attention</Text>
        </View>

        <SectionHeader title="Issue List" />

        {issuesData.map((item) => {
          const severityStyle = getSeverityStyle(item.severity);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: severityStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: severityStyle.color }]}>
                    {item.severity}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          );
        })}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 8,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});