

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  bg: '#E8F5F5',
  navy: '#1A7A7A',
  navy2: '#1A7A7A',
  white: '#FFFFFF',
  text: '#162033',
  sub: '#6B7280',
  border: '#E5E7EB',
  soft: '#EEF4FF',
  cardSoft: '#F8FAFC',
  blueSoft: '#E8F0FF',
  blueText: '#1D4ED8',
  greenSoft: '#E8F7EC',
  greenText: '#15803D',
  amberSoft: '#FFF4D6',
  amberText: '#B45309',
  purpleSoft: '#F1E8FF',
  purpleText: '#7C3AED',
  redSoft: '#FDE8E8',
  redText: '#B91C1C',
  tealSoft: '#DDF7F2',
  tealText: '#0F766E',
  shadow: 'rgba(16,35,62,0.08)',
  gold: '#C9A84C',
};

const INITIAL_SOFT_POSSESSION = [
  {
    id: 'SP-1001',
    customerName: 'Rahul Sharma',
    unitId: 'A-203',
    tower: 'A',
    floor: '2',
    projectName: 'Skyline Heights',
    unitType: '2.5 BHK',
    paymentPercent: 82,
    eligibilityTriggered: true,
    builderReviewed: false,
    possessionLetterIssued: false,
    interiorPermissionGranted: false,
    inspectionScheduled: false,
    interiorWorkStatus: 'Not Started',
    finalPossessionReady: false,
    stage: 'Eligibility Triggered',
    remarks: 'Customer crossed payment threshold. Awaiting builder review.',
    timeline: [
      'Customer crossed 80% payment threshold',
      'System triggered soft possession eligibility',
    ],
  },
  {
    id: 'SP-1002',
    customerName: 'Priya Reddy',
    unitId: 'B-304',
    tower: 'B',
    floor: '3',
    projectName: 'Skyline Heights',
    unitType: '3 BHK',
    paymentPercent: 88,
    eligibilityTriggered: true,
    builderReviewed: true,
    possessionLetterIssued: true,
    interiorPermissionGranted: true,
    inspectionScheduled: false,
    interiorWorkStatus: 'In Progress',
    finalPossessionReady: false,
    stage: 'Interior Work In Progress',
    remarks: 'Digital soft possession letter issued. Customer interior work started.',
    timeline: [
      'Customer crossed 80% payment threshold',
      'System triggered soft possession eligibility',
      'Builder reviewed eligibility',
      'Digital soft possession letter issued',
      'Temporary interior work permission granted',
    ],
  },
  {
    id: 'SP-1003',
    customerName: 'Ananya Verma',
    unitId: 'C-105',
    tower: 'C',
    floor: '1',
    projectName: 'Skyline Heights',
    unitType: '2 BHK',
    paymentPercent: 90,
    eligibilityTriggered: true,
    builderReviewed: true,
    possessionLetterIssued: true,
    interiorPermissionGranted: true,
    inspectionScheduled: true,
    interiorWorkStatus: 'Completed',
    finalPossessionReady: true,
    stage: 'Ready For Final Possession',
    remarks: 'Interior work and inspection completed. Ready for final possession.',
    timeline: [
      'Customer crossed 90% payment threshold',
      'System triggered soft possession eligibility',
      'Builder reviewed eligibility',
      'Digital soft possession letter issued',
      'Temporary interior work permission granted',
      'Pre-handover inspection scheduled',
      'Interior work completed',
      'Marked ready for final possession',
    ],
  },
];

function BottomNavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomNavItem} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.bottomNavIcon, active && styles.bottomNavActiveText]}>
        {icon}
      </Text>
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavActiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SoftPossessionBuilderScreen({ navigation, route }) {
  const [requests, setRequests] = useState(INITIAL_SOFT_POSSESSION);
  const [selectedId, setSelectedId] = useState(INITIAL_SOFT_POSSESSION[0].id);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');

  const currentRouteName = route?.name || 'BuilderSoftPossession';

  const handleBottomNavigation = (screen) => {
    if (currentRouteName === screen) return;
    navigation?.navigate?.(screen);
  };

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === selectedId),
    [requests, selectedId]
  );

  const stats = useMemo(() => {
    return {
      total: requests.length,
      eligible: requests.filter((r) => r.eligibilityTriggered).length,
      reviewed: requests.filter((r) => r.builderReviewed).length,
      inProgress: requests.filter((r) => r.interiorWorkStatus === 'In Progress').length,
      finalReady: requests.filter((r) => r.finalPossessionReady).length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let list = [...requests];

    if (activeTab === 'Eligible') {
      list = list.filter((item) => item.eligibilityTriggered);
    } else if (activeTab === 'Reviewed') {
      list = list.filter((item) => item.builderReviewed);
    } else if (activeTab === 'In Progress') {
      list = list.filter((item) => item.interiorWorkStatus === 'In Progress');
    } else if (activeTab === 'Final Ready') {
      list = list.filter((item) => item.finalPossessionReady);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          String(item.id).toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.unitId.toLowerCase().includes(q) ||
          item.unitType.toLowerCase().includes(q)
      );
    }

    return list;
  }, [requests, activeTab, search]);

  const updateRequest = (id, updates, timelineMessage) => {
    setRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...updates,
          timeline: timelineMessage
            ? [...(item.timeline || []), timelineMessage]
            : item.timeline,
        };
      })
    );
  };

  const getStatusConfig = (item) => {
    if (!item) {
      return { label: 'No Record', bg: COLORS.redSoft, text: COLORS.redText };
    }

    if (item.finalPossessionReady) {
      return {
        label: 'Ready For Final Possession',
        bg: COLORS.greenSoft,
        text: COLORS.greenText,
      };
    }

    if (item.interiorWorkStatus === 'In Progress') {
      return {
        label: 'Interior Work In Progress',
        bg: COLORS.blueSoft,
        text: COLORS.blueText,
      };
    }

    if (item.possessionLetterIssued) {
      return {
        label: 'Soft Possession Issued',
        bg: COLORS.purpleSoft,
        text: COLORS.purpleText,
      };
    }

    if (item.builderReviewed) {
      return {
        label: 'Reviewed By Builder',
        bg: COLORS.amberSoft,
        text: COLORS.amberText,
      };
    }

    if (item.eligibilityTriggered) {
      return {
        label: 'Eligibility Triggered',
        bg: COLORS.tealSoft,
        text: COLORS.tealText,
      };
    }

    return { label: 'Pending', bg: COLORS.redSoft, text: COLORS.redText };
  };

  const checklist = useMemo(() => {
    if (!selectedRequest) return [];

    return [
      { label: 'Payment threshold crossed (80-90%)', done: selectedRequest.paymentPercent >= 80 },
      { label: 'Soft possession eligibility triggered', done: selectedRequest.eligibilityTriggered },
      { label: 'Builder reviewed eligibility', done: selectedRequest.builderReviewed },
      { label: 'Digital soft possession letter issued', done: selectedRequest.possessionLetterIssued },
      { label: 'Temporary interior work permission granted', done: selectedRequest.interiorPermissionGranted },
      { label: 'Pre-handover inspection scheduled', done: selectedRequest.inspectionScheduled },
      { label: 'Interior work completed', done: selectedRequest.interiorWorkStatus === 'Completed' },
      { label: 'Ready for final possession', done: selectedRequest.finalPossessionReady },
    ];
  }, [selectedRequest]);

  const markReviewed = () => {
    if (!selectedRequest) return;

    if (selectedRequest.builderReviewed) {
      Alert.alert('Already updated', 'Eligibility is already reviewed.');
      return;
    }

    updateRequest(
      selectedRequest.id,
      {
        builderReviewed: true,
        stage: 'Reviewed By Builder',
        remarks: 'Builder reviewed and approved soft possession eligibility.',
      },
      'Builder reviewed soft possession eligibility'
    );

    Alert.alert('Updated', 'Eligibility review marked successfully.');
  };

  const issueLetter = () => {
    if (!selectedRequest) return;

    if (!selectedRequest.builderReviewed) {
      Alert.alert('Pending step', 'Please review eligibility first.');
      return;
    }

    if (selectedRequest.possessionLetterIssued) {
      Alert.alert('Already updated', 'Soft possession letter is already issued.');
      return;
    }

    updateRequest(
      selectedRequest.id,
      {
        possessionLetterIssued: true,
        stage: 'Soft Possession Issued',
        remarks: 'Digital soft possession letter issued to customer.',
      },
      'Digital soft possession letter issued'
    );

    Alert.alert('Updated', 'Digital soft possession letter issued successfully.');
  };

  const grantPermission = () => {
    if (!selectedRequest) return;

    if (!selectedRequest.possessionLetterIssued) {
      Alert.alert('Pending step', 'Issue the possession letter first.');
      return;
    }

    if (selectedRequest.interiorPermissionGranted) {
      Alert.alert('Already updated', 'Interior work permission is already granted.');
      return;
    }

    updateRequest(
      selectedRequest.id,
      {
        interiorPermissionGranted: true,
        interiorWorkStatus: 'In Progress',
        stage: 'Interior Work In Progress',
        remarks: 'Temporary interior work permission granted by builder.',
      },
      'Temporary interior work permission granted'
    );

    Alert.alert('Updated', 'Temporary interior work permission granted.');
  };

  const openInspectionModal = () => {
    if (!selectedRequest) return;

    if (!selectedRequest.interiorPermissionGranted) {
      Alert.alert('Pending step', 'Grant interior work permission first.');
      return;
    }

    setInspectionDate('');
    setInspectionTime('');
    setInspectionModalVisible(true);
  };

  const confirmInspection = () => {
    if (!selectedRequest) return;

    if (!inspectionDate.trim() || !inspectionTime.trim()) {
      Alert.alert('Missing details', 'Please enter inspection date and time.');
      return;
    }

    updateRequest(
      selectedRequest.id,
      {
        inspectionScheduled: true,
        remarks: `Inspection scheduled on ${inspectionDate} at ${inspectionTime}.`,
      },
      `Pre-handover inspection scheduled for ${inspectionDate} at ${inspectionTime}`
    );

    setInspectionModalVisible(false);
    Alert.alert('Updated', 'Pre-handover inspection scheduled.');
  };

  const markReadyForFinal = () => {
    if (!selectedRequest) return;

    if (!selectedRequest.inspectionScheduled) {
      Alert.alert('Pending step', 'Schedule inspection first.');
      return;
    }

    updateRequest(
      selectedRequest.id,
      {
        interiorWorkStatus: 'Completed',
        finalPossessionReady: true,
        stage: 'Ready For Final Possession',
        remarks: 'Unit approved and marked ready for final possession.',
      },
      'Marked ready for final possession'
    );

    Alert.alert('Updated', 'Unit marked ready for final possession.');
  };

  const statusConfig = getStatusConfig(selectedRequest);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Builder Panel</Text>
            </View>
            <Text style={styles.headerMini}>Soft possession • review • letters • inspection</Text>
          </View>

          <Text style={styles.heading}>Soft Possession Management</Text>
          <Text style={styles.subheading}>
            Review eligible units, issue letters, grant permissions, and track final readiness
          </Text>

          <View style={styles.headerStatsRow}>
            <HeaderStatCard label="Total" value={stats.total} />
            <HeaderStatCard label="Eligible" value={stats.eligible} />
            <HeaderStatCard label="Reviewed" value={stats.reviewed} />
            <HeaderStatCard label="Interior Work" value={stats.inProgress} />
            <HeaderStatCard label="Final Ready" value={stats.finalReady} />
          </View>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by customer, unit, project, type, or ID"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {['All', 'Eligible', 'Reviewed', 'In Progress', 'Final Ready'].map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Soft Possession Units</Text>
          <Text style={styles.sectionCount}>{filteredRequests.length} records</Text>
        </View>

        {filteredRequests.map((item) => {
          const active = item.id === selectedId;
          const cfg = getStatusConfig(item);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={[styles.requestCard, active && styles.requestCardActive]}
              onPress={() => setSelectedId(item.id)}
            >
              <View style={styles.requestTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>{item.customerName}</Text>
                  <Text style={styles.requestSub}>
                    {item.projectName} • {item.unitId} • {item.unitType}
                  </Text>
                  <Text style={styles.requestMeta}>Soft Possession ID: {item.id}</Text>
                  <Text style={styles.requestMeta}>Payment Completion: {item.paymentPercent}%</Text>
                </View>

                <View style={[styles.smallPill, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.smallPillText, { color: cfg.text }]}>
                    {cfg.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedRequest ? (
          <>
            <View style={styles.detailCard}>
              <View style={styles.detailTopRow}>
                <View>
                  <Text style={styles.detailTitle}>{selectedRequest.customerName}</Text>
                  <Text style={styles.detailSub}>
                    {selectedRequest.projectName} • Unit {selectedRequest.unitId}
                  </Text>
                </View>

                <View style={[styles.smallPill, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.smallPillText, { color: statusConfig.text }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <InfoCard label="Soft Possession ID" value={selectedRequest.id} />
                <InfoCard label="Project" value={selectedRequest.projectName} />
                <InfoCard label="Unit" value={selectedRequest.unitId} />
                <InfoCard label="Tower / Floor" value={`${selectedRequest.tower} / ${selectedRequest.floor}`} />
                <InfoCard label="Unit Type" value={selectedRequest.unitType} />
                <InfoCard label="Payment Completion" value={`${selectedRequest.paymentPercent}%`} />
                <InfoCard label="Interior Work" value={selectedRequest.interiorWorkStatus} />
                <InfoCard label="Current Stage" value={selectedRequest.stage} />
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Remarks</Text>
                <Text style={styles.noteText}>{selectedRequest.remarks}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.blockTitle}>Soft Possession Review Checklist</Text>
              <Text style={styles.blockSub}>
                Builder can verify eligibility, issue documents, and track readiness
              </Text>

              {checklist.map((item) => (
                <CheckRow key={item.label} title={item.label} value={item.done} />
              ))}
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.blockTitle}>Builder Actions</Text>

              <View style={styles.actionsWrap}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.outlineBtn]}
                  onPress={markReviewed}
                  activeOpacity={0.85}
                >
                  <Text style={styles.outlineBtnText}>Mark Eligibility Reviewed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.purpleBtn]}
                  onPress={issueLetter}
                  activeOpacity={0.85}
                >
                  <Text style={styles.purpleBtnText}>Issue Soft Possession Letter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.amberBtn]}
                  onPress={grantPermission}
                  activeOpacity={0.85}
                >
                  <Text style={styles.amberBtnText}>Grant Interior Permission</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.blueBtn]}
                  onPress={openInspectionModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.blueBtnText}>Schedule Inspection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.successBtn]}
                  onPress={markReadyForFinal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.successBtnText}>Mark Ready For Final Possession</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.blockTitle}>Activity Timeline</Text>

              {selectedRequest.timeline?.length ? (
                selectedRequest.timeline.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <Text style={styles.timelineText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No activity available.</Text>
              )}
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.blockTitle}>Final Outcome</Text>
              <OutcomeRow
                label="Soft Possession Letter"
                value={selectedRequest.possessionLetterIssued ? 'Issued' : 'Pending'}
              />
              <OutcomeRow
                label="Interior Work Permission"
                value={selectedRequest.interiorPermissionGranted ? 'Granted' : 'Pending'}
              />
              <OutcomeRow
                label="Inspection"
                value={selectedRequest.inspectionScheduled ? 'Scheduled' : 'Pending'}
              />
              <OutcomeRow
                label="Final Possession Readiness"
                value={selectedRequest.finalPossessionReady ? 'Ready' : 'Not Ready'}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          <BottomNavItem
            label="Dashboard"
            icon="🏠"
            active={currentRouteName === 'BuilderDashboard'}
            onPress={() => handleBottomNavigation('BuilderDashboard')}
          />
          <BottomNavItem
            label="Projects"
            icon="🏢"
            active={
              currentRouteName === 'BuilderProjectSetup' ||
              currentRouteName === 'BuilderProjectCreation' ||
              currentRouteName === 'BuilderUnitInventory' ||
              currentRouteName === 'BuilderComplianceTracking' ||
              currentRouteName === 'BuilderAvailabilityChart' ||
              currentRouteName === 'BuilderConstructionTracking'
            }
            onPress={() => handleBottomNavigation('BuilderProjectSetup')}
          />
          <BottomNavItem
            label="Bookings"
            icon="🤝"
            active={
              currentRouteName === 'BuilderUnitBooking' ||
              currentRouteName === 'BuilderAppointmentBooking' ||
              currentRouteName === 'BuilderSoftPossession'
            }
            onPress={() => handleBottomNavigation('BuilderUnitBooking')}
          />
          <BottomNavItem
            label="Payments"
            icon="💳"
            active={currentRouteName === 'BuilderPaymentSchedule'}
            onPress={() => handleBottomNavigation('BuilderPaymentSchedule')}
          />
        </View>
      </View>

      <Modal
        visible={inspectionModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInspectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Inspection</Text>
              <TouchableOpacity onPress={() => setInspectionModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                {selectedRequest?.customerName} • {selectedRequest?.unitId}
              </Text>
              <Text style={styles.modalInfoSub}>
                Enter inspection date and time for pre-handover review
              </Text>
            </View>

            <Text style={styles.inputLabel}>Inspection Date</Text>
            <TextInput
              value={inspectionDate}
              onChangeText={setInspectionDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <Text style={styles.inputLabel}>Inspection Time</Text>
            <TextInput
              value={inspectionTime}
              onChangeText={setInspectionTime}
              placeholder="Ex: 11:00 AM"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmInspection}
              activeOpacity={0.88}
            >
              <Text style={styles.confirmBtnText}>Confirm Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HeaderStatCard({ label, value }) {
  return (
    <View style={styles.headerStatCard}>
      <Text style={styles.headerStatValue}>{value}</Text>
      <Text style={styles.headerStatLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function CheckRow({ title, value }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkDot, value ? styles.checkDotYes : styles.checkDotNo]} />
      <Text style={styles.checkTitle}>{title}</Text>
      <Text style={[styles.checkValue, { color: value ? COLORS.greenText : COLORS.redText }]}>
        {value ? 'Completed' : 'Pending'}
      </Text>
    </View>
  );
}

function OutcomeRow({ label, value }) {
  return (
    <View style={styles.outcomeRow}>
      <Text style={styles.outcomeLabel}>{label}</Text>
      <Text style={styles.outcomeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 152,
  },

  header: {
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerMini: {
    color: '#C7D2E3',
    fontSize: 12,
    fontWeight: '600',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 12,
  },
  subheading: {
    fontSize: 14,
    color: '#CFD8E6',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 22,
  },
  headerStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  headerStatCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  headerStatValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  headerStatLabel: {
    color: '#D8E0EE',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  searchInput: {
    fontSize: 15,
    color: COLORS.text,
    minHeight: 44,
  },

  tabsRow: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 14,
  },
  tabPill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabPillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  tabPillText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  tabPillTextActive: {
    color: COLORS.white,
  },

  sectionHeaderRow: {
    marginTop: 4,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.sub,
    fontWeight: '600',
  },

  requestCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  requestCardActive: {
    borderColor: COLORS.blueText,
    backgroundColor: '#F8FBFF',
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  requestName: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '800',
  },
  requestSub: {
    fontSize: 13,
    color: COLORS.sub,
    marginTop: 4,
    fontWeight: '600',
  },
  requestMeta: {
    fontSize: 13,
    color: COLORS.sub,
    marginTop: 4,
  },

  smallPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '800',
  },

  detailCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '800',
  },
  detailSub: {
    fontSize: 13,
    color: COLORS.sub,
    marginTop: 4,
    fontWeight: '600',
  },

  infoGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '47%',
    backgroundColor: COLORS.cardSoft,
    borderRadius: 14,
    padding: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.sub,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    lineHeight: 20,
  },

  noteBox: {
    marginTop: 14,
    backgroundColor: COLORS.soft,
    borderRadius: 14,
    padding: 12,
  },
  noteLabel: {
    fontSize: 12,
    color: COLORS.sub,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
    fontWeight: '600',
  },

  blockTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  blockSub: {
    fontSize: 13,
    color: COLORS.sub,
    lineHeight: 20,
    marginBottom: 12,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  checkDotYes: {
    backgroundColor: COLORS.greenText,
  },
  checkDotNo: {
    backgroundColor: COLORS.redText,
  },
  checkTitle: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  checkValue: {
    fontSize: 12,
    fontWeight: '800',
  },

  actionsWrap: {
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  outlineBtnText: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 14,
  },
  purpleBtn: {
    backgroundColor: COLORS.purpleSoft,
  },
  purpleBtnText: {
    color: COLORS.purpleText,
    fontWeight: '800',
    fontSize: 14,
  },
  amberBtn: {
    backgroundColor: COLORS.amberSoft,
  },
  amberBtnText: {
    color: COLORS.amberText,
    fontWeight: '800',
    fontSize: 14,
  },
  blueBtn: {
    backgroundColor: COLORS.blueSoft,
  },
  blueBtnText: {
    color: COLORS.blueText,
    fontWeight: '800',
    fontSize: 14,
  },
  successBtn: {
    backgroundColor: COLORS.greenSoft,
  },
  successBtnText: {
    color: COLORS.greenText,
    fontWeight: '800',
    fontSize: 14,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blueText,
    marginTop: 6,
    marginRight: 10,
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.sub,
    lineHeight: 22,
    marginTop: 8,
  },

  outcomeRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  outcomeLabel: {
    fontSize: 12,
    color: COLORS.sub,
    marginBottom: 4,
    fontWeight: '700',
  },
  outcomeValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeText: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 14,
  },
  modalInfoBox: {
    backgroundColor: COLORS.soft,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '800',
  },
  modalInfoSub: {
    fontSize: 13,
    color: COLORS.sub,
    marginTop: 4,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
  },
  confirmBtn: {
    backgroundColor: COLORS.navy,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  bottomNavWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  bottomNav: {
    height: 78,
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  bottomNavIcon: {
    fontSize: 18,
    marginBottom: 4,
    color: '#94A3B8',
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  bottomNavActiveText: {
    color: COLORS.gold,
  },
});