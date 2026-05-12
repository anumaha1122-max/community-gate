import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

function getStatusStyle(status) {
  switch (status) {
    case 'Approved':
    case 'Active':
      return { bg: '#E9F8EE', color: COLORS.success };
    case 'Rejected':
    case 'Inactive':
      return { bg: '#FFE9E9', color: COLORS.danger };
    case 'Pending':
    default:
      return { bg: '#FFF4E6', color: COLORS.warning };
  }
}

export default function SocietyDetailsScreen({ navigation, route }) {
  const society = useMemo(() => route.params?.society, [route.params]);

  const [status, setStatus] = useState(society?.status || 'Pending');
  const [assignedPlan, setAssignedPlan] = useState(society?.plan || 'Basic');
  const [adminName, setAdminName] = useState(society?.adminName || '');
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [lastActionNote, setLastActionNote] = useState('');

  if (!society) return null;

  const statusStyle = getStatusStyle(status);

  const handleAssignAdmin = () => {
    const updatedSociety = { ...society, adminName };
    console.log('Admin assigned:', updatedSociety);
    alert(`Admin for ${society.societyName} has been updated to: ${adminName}`);
  };

  const handleApprove = () => {
    if (!approvalReason.trim()) {
      alert('Please enter approval reason');
      return;
    }

    setStatus('Approved');
    setLastActionNote(`Approved reason: ${approvalReason}`);
    alert(`Society approved successfully.\nReason: ${approvalReason}`);
    setApprovalReason('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    setStatus('Rejected');
    setLastActionNote(`Rejected reason: ${rejectionReason}`);
    alert(`Society rejected successfully.\nReason: ${rejectionReason}`);
    setRejectionReason('');
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title={society.societyName}
        subtitle={`${society.city} · ${society.id}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Society Admin</Text>
          <Text style={styles.value}>{adminName || society.adminName}</Text>

          <Text style={styles.label}>Units</Text>
          <Text style={styles.value}>{society.units}</Text>

          <Text style={styles.label}>Current Plan</Text>
          <Text style={styles.value}>{assignedPlan}</Text>

          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
          </View>

          {lastActionNote ? (
            <>
              <Text style={styles.label}>Latest Action Note</Text>
              <Text style={styles.noteText}>{lastActionNote}</Text>
            </>
          ) : null}
        </View>

        <SectionHeader title="Submitted Documents" />
        <View style={styles.card}>
          {(society.documents || []).map((doc) => (
            <View key={doc} style={styles.docRow}>
              <Text style={styles.docText}>{`\u2022 ${doc}`}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Assign Subscription Plan" />
        <View style={styles.planRow}>
          {['Basic', 'Premium', 'Enterprise'].map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[
                styles.planChip,
                assignedPlan === plan && styles.planChipActive,
              ]}
              onPress={() => setAssignedPlan(plan)}
            >
              <Text
                style={[
                  styles.planChipText,
                  assignedPlan === plan && styles.planChipTextActive,
                ]}
              >
                {plan}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Assign Admin" />
        <View style={styles.card}>
          <TextInput
            style={styles.inputField}
            placeholder="Enter Admin Name"
            value={adminName}
            onChangeText={setAdminName}
            placeholderTextColor={COLORS.subText}
          />
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primaryNavy }]}
            onPress={handleAssignAdmin}
          >
            <Text style={styles.actionBtnText}>Assign Admin</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Approve Society" />
        <View style={styles.card}>
          <Text style={styles.reasonLabel}>Approval Reason</Text>
          <TextInput
            style={[styles.inputField, styles.reasonInput]}
            placeholder="Enter reason for approval"
            value={approvalReason}
            onChangeText={setApprovalReason}
            multiline
            placeholderTextColor={COLORS.subText}
          />
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
            onPress={handleApprove}
          >
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Reject Society" />
        <View style={styles.card}>
          <Text style={styles.reasonLabel}>Rejection Reason</Text>
          <TextInput
            style={[styles.inputField, styles.reasonInput]}
            placeholder="Enter reason for rejection"
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            placeholderTextColor={COLORS.subText}
          />
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
            onPress={handleReject}
          >
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '700',
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
  },
  noteText: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.primaryNavy,
    fontWeight: '600',
    lineHeight: 20,
  },
  docRow: {
    paddingVertical: 8,
  },
  docText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  planRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: SPACING.sm,
  },
  planChip: {
    backgroundColor: COLORS.chipBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planChipActive: {
    backgroundColor: COLORS.primaryNavy,
  },
  planChipText: {
    color: COLORS.chipText,
    fontWeight: '800',
  },
  planChipTextActive: {
    color: COLORS.white,
  },
  inputField: {
    marginBottom: 10,
    padding: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  reasonInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  reasonLabel: {
    fontSize: 13,
    color: COLORS.subText,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
});