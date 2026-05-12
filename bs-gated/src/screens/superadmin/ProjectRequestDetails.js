import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import COLORS from '../../theme/SAcolors';
import { useAppContext } from './SocietyContext';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80';

export default function ProjectRequestDetails({ navigation, route }) {
  const { projectRequestId } = route.params || {};

  const {
    projectRequests,
    approveProjectRequest,
    rejectProjectRequest,
  } = useAppContext();

  const [remark, setRemark] = useState('');

  const project = useMemo(
    () => (projectRequests || []).find((item) => item.id === projectRequestId),
    [projectRequests, projectRequestId]
  );

  const handleApprove = () => {
    if (!project) return;

    approveProjectRequest(project.id, 'Approved by Super Admin');

    Alert.alert('Approved', 'Project request approved successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleReject = () => {
    if (!project) return;

    if (!remark.trim()) {
      Alert.alert('Remark required', 'Please enter a rejection remark.');
      return;
    }

    rejectProjectRequest(project.id, remark.trim());

    Alert.alert('Rejected', 'Project request rejected successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  if (!project) {
    return (
      <ScreenWrapper>
        <AppHeader
          title="Project Request Details"
          subtitle="Request not found"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Project request not found.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Project Request Details"
        subtitle="Review and decide on builder request"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageCard}>
          <Image
            source={{ uri: project.coverImage || DEFAULT_IMAGE }}
            style={styles.coverImage}
          />
          <View style={styles.statusWrap}>
            <Text style={styles.statusText}>
              {project.approvalStatus || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Project Overview</Text>

          <DetailRow label="Project Name" value={project.projectName} />
          <DetailRow label="Builder Name" value={project.builderName} />
          <DetailRow label="Builder ID" value={project.builderId} />
          <DetailRow label="Project Type" value={project.projectType} />
          <DetailRow label="Possession Type" value={project.possessionType} />
          <DetailRow label="State" value={project.state} />
          <DetailRow label="City" value={project.city} />
          <DetailRow label="Location" value={project.location} />
          <DetailRow label="Landmark" value={project.landmark} />
          <DetailRow label="RERA Number" value={project.reraNumber} />
          <DetailRow label="RERA Approval Date" value={project.reraApprovalDate} />
          <DetailRow label="Launch Date" value={project.launchDate} />
          <DetailRow label="Completion Date" value={project.completionDate} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scale & Pricing</Text>

          <DetailRow label="Phases" value={project.phaseCount} />
          <DetailRow label="Towers" value={project.towerCount} />
          <DetailRow label="Total Units" value={project.totalUnits} />
          <DetailRow label="Price Range" value={project.priceRange} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.longText}>
            {project.description || 'No project description added.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <Text style={styles.longText}>
            {project.highlights || 'No highlights added.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Amenities</Text>

          {project.selectedAmenities?.length ? (
            <View style={styles.chipWrap}>
              {project.selectedAmenities.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.longText}>No amenities selected.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rejection Remark</Text>
          <TextInput
            value={remark}
            onChangeText={setRemark}
            placeholder="Enter reason for rejection"
            placeholderTextColor="#94A3B8"
            multiline
            style={styles.remarkInput}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectBtnText}>Reject with Remark</Text>
          </TouchableOpacity>
        </View>

        {!!project.reviewMessage && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Latest Review Message</Text>
            <Text style={styles.longText}>{project.reviewMessage}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  imageCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    marginBottom: 14,
  },
  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  statusWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  longText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '700',
  },
  remarkInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
    color: COLORS.text,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#B91C1C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});