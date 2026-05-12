
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import BuilderBottomNav from './BuilderBottomNav';

const NAVY = '#1A7A7A';
const NAVY_2 = '#1A7A7A';
const GOLD = '#ffffff';
const BG = '#E8f5f5';
const WHITE = '#FFFFFF';
const BORDER = '#E2E8F0';
const MUTED = '#64748B';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const DANGER = '#EF4444';
const INFO = '#06B6D4';
const CHIP_BG = '#EEF2FF';

const defaultMilestones = [
  {
    id: 'M1',
    name: 'Foundation',
    expectedDate: '2026-05-15',
    completion: 100,
    status: 'Completed',
  },
  {
    id: 'M2',
    name: 'Slab',
    expectedDate: '2026-06-20',
    completion: 82,
    status: 'In Progress',
  },
  {
    id: 'M3',
    name: 'Brickwork',
    expectedDate: '2026-07-10',
    completion: 60,
    status: 'In Progress',
  },
  {
    id: 'M4',
    name: 'Plastering',
    expectedDate: '2026-08-05',
    completion: 32,
    status: 'Pending',
  },
  {
    id: 'M5',
    name: 'Finishing',
    expectedDate: '2026-09-12',
    completion: 15,
    status: 'Pending',
  },
  {
    id: 'M6',
    name: 'Possession',
    expectedDate: '2026-10-25',
    completion: 0,
    status: 'Pending',
  },
];

const defaultUpdates = [
  {
    id: 'U1',
    milestone: 'Slab',
    tower: 'Tower A',
    phase: 'Phase 1',
    completion: 82,
    expectedDate: '2026-06-20',
    note: 'Tower A slab casting updated. Slight rain delay buffer added.',
    delay: false,
    photoLink: 'https://example.com/photo1.jpg',
    videoLink: 'https://example.com/video1.mp4',
    sentToCustomers: true,
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'U2',
    milestone: 'Brickwork',
    tower: 'Tower B',
    phase: 'Phase 1',
    completion: 60,
    expectedDate: '2026-07-10',
    note: 'Brickwork progressing block-wise. Material stock available.',
    delay: false,
    photoLink: 'https://example.com/photo2.jpg',
    videoLink: '',
    sentToCustomers: false,
    createdAt: 'Today, 01:15 PM',
  },
];

const towers = ['Tower A', 'Tower B', 'Tower C', 'Tower D'];
const phases = ['Phase 1', 'Phase 2', 'Phase 3'];
const milestoneOptions = ['Foundation', 'Slab', 'Brickwork', 'Plastering', 'Finishing', 'Possession'];

function BottomNavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={styles.bottomNavItem}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.bottomNavIcon, active && styles.bottomNavActiveText]}>
        {icon}
      </Text>
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavActiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ConstructionTrackingScreen({ navigation, route }) {
  const [milestones, setMilestones] = useState(defaultMilestones);
  const [updates, setUpdates] = useState(defaultUpdates);
  const [selectedTower, setSelectedTower] = useState('Tower A');
  const [selectedPhase, setSelectedPhase] = useState('Phase 1');
  const [selectedMilestone, setSelectedMilestone] = useState('Slab');
  const [completion, setCompletion] = useState('82');
  const [expectedDate, setExpectedDate] = useState('2026-06-20');
  const [note, setNote] = useState('');
  const [photoLink, setPhotoLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerPreview, setCustomerPreview] = useState(true);
  const [notifyCustomers, setNotifyCustomers] = useState(true);

  const currentRouteName = route?.name || 'BuilderConstructionTracking';

  const handleBottomNavigation = (screen) => {
    if (currentRouteName === screen) return;
    navigation?.navigate?.(screen);
  };

  const overallProgress = useMemo(() => {
    if (!milestones.length) return 0;
    const total = milestones.reduce((sum, item) => sum + Number(item.completion || 0), 0);
    return Math.round(total / milestones.length);
  }, [milestones]);

  const completedMilestones = milestones.filter(item => item.completion >= 100).length;
  const delayedUpdates = updates.filter(item => item.delay).length;

  const handleSaveProgressUpdate = () => {
    if (!selectedMilestone || !selectedTower || !selectedPhase || !completion || !expectedDate) {
      Alert.alert('Required', 'Please fill milestone, tower, phase, completion and expected date.');
      return;
    }

    const progressValue = Number(completion);
    if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      Alert.alert('Invalid completion', 'Completion should be between 0 and 100.');
      return;
    }

    const isDelay = delayReason.trim().length > 0;

    const newUpdate = {
      id: `U${Date.now()}`,
      milestone: selectedMilestone,
      tower: selectedTower,
      phase: selectedPhase,
      completion: progressValue,
      expectedDate,
      note: note.trim() || 'Progress updated by builder.',
      delay: isDelay,
      delayReason: delayReason.trim(),
      photoLink: photoLink.trim(),
      videoLink: videoLink.trim(),
      sentToCustomers: notifyCustomers,
      createdAt: 'Just now',
    };

    setUpdates(prev => [newUpdate, ...prev]);

    setMilestones(prev =>
      prev.map(item =>
        item.name === selectedMilestone
          ? {
              ...item,
              completion: progressValue,
              expectedDate,
              status: progressValue >= 100 ? 'Completed' : progressValue > 0 ? 'In Progress' : 'Pending',
            }
          : item
      )
    );

    setShowAddModal(false);
    setNote('');
    setPhotoLink('');
    setVideoLink('');
    setDelayReason('');

    Alert.alert(
      'Progress Updated',
      notifyCustomers
        ? 'Progress updated and customer notification flagged successfully.'
        : 'Progress updated successfully.'
    );
  };

  const handleSendCustomerNotification = item => {
    setUpdates(prev =>
      prev.map(update =>
        update.id === item.id ? { ...update, sentToCustomers: true } : update
      )
    );
    Alert.alert('Notification Sent', `Customers notified for ${item.milestone} update.`);
  };

  const handleOpenMedia = (label, link) => {
    if (!link) {
      Alert.alert(label, `No ${label.toLowerCase()} link added yet.`);
      return;
    }
    Alert.alert(label, link);
  };

  const StepCard = ({ no, text, role }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepNumberWrap}>
        <Text style={styles.stepNumber}>{no}</Text>
      </View>

      <Text style={styles.stepText}>{text}</Text>

      <View style={styles.rolePill}>
        <Text style={styles.rolePillText}>{role}</Text>
      </View>
    </View>
  );

  const StatCard = ({ label, value, sub }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatCard label="Overall Progress" value={`${overallProgress}%`} sub="Average project completion" />
          <StatCard label="Completed" value={`${completedMilestones}/${milestones.length}`} sub="Milestones finished" />
          <StatCard label="Updates" value={`${updates.length}`} sub="Recent progress entries" />
          <StatCard label="Delayed" value={`${delayedUpdates}`} sub="Updates with delay note" />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Milestone Timeline</Text>
            <TouchableOpacity style={styles.primarySmallBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.primarySmallBtnText}>Add Update</Text>
            </TouchableOpacity>
          </View>

          {milestones.map(item => (
            <View key={item.id} style={styles.milestoneCard}>
              <View style={styles.milestoneTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneTitle}>{item.name}</Text>
                  <Text style={styles.milestoneDate}>Expected: {item.expectedDate}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Completed'
                      ? styles.statusCompleted
                      : item.status === 'In Progress'
                      ? styles.statusProgress
                      : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'Completed'
                        ? styles.statusCompletedText
                        : item.status === 'In Progress'
                        ? styles.statusProgressText
                        : styles.statusPendingText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.completion}%` }]} />
                </View>
                <Text style={styles.progressPercent}>{item.completion}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Builder Progress Form</Text>

          <Text style={styles.inputLabel}>Select Tower</Text>
          <View style={styles.optionWrap}>
            {towers.map(item => (
              <OptionChip
                key={item}
                label={item}
                active={selectedTower === item}
                onPress={() => setSelectedTower(item)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Select Phase</Text>
          <View style={styles.optionWrap}>
            {phases.map(item => (
              <OptionChip
                key={item}
                label={item}
                active={selectedPhase === item}
                onPress={() => setSelectedPhase(item)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Select Milestone</Text>
          <View style={styles.optionWrap}>
            {milestoneOptions.map(item => (
              <OptionChip
                key={item}
                label={item}
                active={selectedMilestone === item}
                onPress={() => setSelectedMilestone(item)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Completion %</Text>
          <TextInput
            value={completion}
            onChangeText={setCompletion}
            placeholder="Enter completion percentage"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Expected Completion Date</Text>
          <TextInput
            value={expectedDate}
            onChangeText={setExpectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Progress Notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add work update, milestone summary, material status..."
            placeholderTextColor="#94A3B8"
            multiline
            style={[styles.input, styles.textArea]}
          />

          <Text style={styles.inputLabel}>Photo Link</Text>
          <TextInput
            value={photoLink}
            onChangeText={setPhotoLink}
            placeholder="Paste construction photo URL"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Video Link</Text>
          <TextInput
            value={videoLink}
            onChangeText={setVideoLink}
            placeholder="Paste construction video URL"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Delay Reason</Text>
          <TextInput
            value={delayReason}
            onChangeText={setDelayReason}
            placeholder="Optional: weather, labor, materials, approval delay..."
            placeholderTextColor="#94A3B8"
            multiline
            style={[styles.input, styles.textAreaSmall]}
          />

          <View style={styles.toggleRow}>
            <ToggleButton
              label={notifyCustomers ? 'Customer Notification: ON' : 'Customer Notification: OFF'}
              active={notifyCustomers}
              onPress={() => setNotifyCustomers(prev => !prev)}
            />
            <ToggleButton
              label={customerPreview ? 'Customer View: ON' : 'Customer View: OFF'}
              active={customerPreview}
              onPress={() => setCustomerPreview(prev => !prev)}
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveProgressUpdate}>
            <Text style={styles.primaryBtnText}>Save Progress Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Progress Updates</Text>

          {updates.map(item => (
            <View key={item.id} style={styles.updateCard}>
              <View style={styles.updateTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.updateTitle}>
                    {item.milestone} • {item.tower}
                  </Text>
                  <Text style={styles.updateSub}>
                    {item.phase} • Expected: {item.expectedDate}
                  </Text>
                </View>

                <View style={styles.updatePercentPill}>
                  <Text style={styles.updatePercentText}>{item.completion}%</Text>
                </View>
              </View>

              <Text style={styles.updateNote}>{item.note}</Text>

              {item.delay ? (
                <View style={styles.delayBox}>
                  <Text style={styles.delayBoxText}>
                    Delay Notification Active{item.delayReason ? `: ${item.delayReason}` : ''}
                  </Text>
                </View>
              ) : null}

              <View style={styles.linkRow}>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => handleOpenMedia('Photo Link', item.photoLink)}
                >
                  <Text style={styles.linkBtnText}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => handleOpenMedia('Video Link', item.videoLink)}
                >
                  <Text style={styles.linkBtnText}>Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.linkBtn,
                    item.sentToCustomers ? styles.linkBtnMuted : styles.linkBtnPrimary,
                  ]}
                  onPress={() => handleSendCustomerNotification(item)}
                >
                  <Text
                    style={[
                      styles.linkBtnText,
                      item.sentToCustomers ? styles.linkBtnMutedText : styles.linkBtnPrimaryText,
                    ]}
                  >
                    {item.sentToCustomers ? 'Notified' : 'Notify'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.updateTime}>{item.createdAt}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Compliance & Approvals</Text>

          <View style={styles.complianceRow}>
            <ComplianceBox title="RERA Layout Plan" value="Approved" status="good" />
            <ComplianceBox title="Sanctions" value="Accessible" status="good" />
            <ComplianceBox title="Delay Alerts" value="Configured" status="warn" />
          </View>
        </View>

        {customerPreview ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Customer Live View Preview</Text>

            <View style={styles.customerPreviewCard}>
              <Text style={styles.customerPreviewTitle}>Urban Crest • Tower A</Text>
              <Text style={styles.customerPreviewText}>
                Customers can view milestone wise progress, completion percentage,
                updated timeline, gallery links, and delay notifications in real time.
              </Text>

              <View style={styles.previewMiniRow}>
                <PreviewMiniBox title="Current Milestone" value={selectedMilestone} />
                <PreviewMiniBox title="Completion" value={`${completion || 0}%`} />
                <PreviewMiniBox title="Expected" value={expectedDate || '--'} />
              </View>
            </View>
          </View>
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

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quick Progress Update</Text>

            <Text style={styles.inputLabel}>Milestone</Text>
            <View style={styles.optionWrap}>
              {milestoneOptions.map(item => (
                <OptionChip
                  key={item}
                  label={item}
                  active={selectedMilestone === item}
                  onPress={() => setSelectedMilestone(item)}
                />
              ))}
            </View>

            <Text style={styles.inputLabel}>Completion %</Text>
            <TextInput
              value={completion}
              onChangeText={setCompletion}
              placeholder="Enter completion"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Expected Date</Text>
            <TextInput
              value={expectedDate}
              onChangeText={setExpectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProgressUpdate}>
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FeatureChip({ label }) {
  return (
    <View style={styles.featureChip}>
      <Text style={styles.featureChipText}>{label}</Text>
    </View>
  );
}

function OptionChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionChip, active && styles.optionChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ToggleButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.toggleBtnText, active && styles.toggleBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ComplianceBox({ title, value, status }) {
  return (
    <View style={styles.complianceBox}>
      <Text style={styles.complianceTitle}>{title}</Text>
      <Text
        style={[
          styles.complianceValue,
          status === 'good' ? styles.goodText : styles.warnText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function PreviewMiniBox({ title, value }) {
  return (
    <View style={styles.previewMiniBox}>
      <Text style={styles.previewMiniTitle}>{title}</Text>
      <Text style={styles.previewMiniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: NAVY,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: NAVY_2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    color: NAVY,
    fontSize: 22,
    fontWeight: '800',
  },

  container: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 152,
  },

  stepsSection: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stepNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CFFAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepNumber: {
    color: '#0E7490',
    fontWeight: '800',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    color: NAVY,
    fontSize: 14,
    lineHeight: 22,
  },
  rolePill: {
    backgroundColor: '#CCFBF1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  rolePillText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  featureChip: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  featureChipText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
  },
  statValue: {
    color: NAVY,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
  },
  statSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  primarySmallBtn: {
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  primarySmallBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },

  milestoneCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 10,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
  },
  milestoneDate: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusProgress: {
    backgroundColor: '#DBEAFE',
  },
  statusPending: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusCompletedText: {
    color: '#15803D',
  },
  statusProgressText: {
    color: '#1D4ED8',
  },
  statusPendingText: {
    color: '#475569',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: SUCCESS,
    borderRadius: 999,
  },
  progressPercent: {
    marginLeft: 10,
    color: NAVY,
    fontSize: 13,
    fontWeight: '800',
  },

  inputLabel: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionChip: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  optionChipText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '700',
  },
  optionChipTextActive: {
    color: WHITE,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: NAVY,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 78,
    textAlignVertical: 'top',
  },

  toggleRow: {
    marginTop: 4,
    marginBottom: 14,
  },
  toggleBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  toggleBtnText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleBtnTextActive: {
    color: '#15803D',
  },

  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
  },

  updateCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  updateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
  },
  updateSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  updatePercentPill: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  updatePercentText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  updateNote: {
    color: NAVY,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 10,
  },
  delayBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  delayBoxText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  linkBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  linkBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  linkBtnPrimary: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  linkBtnPrimaryText: {
    color: WHITE,
  },
  linkBtnMuted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  linkBtnMutedText: {
    color: '#15803D',
  },
  updateTime: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },

  complianceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  complianceBox: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  complianceTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  complianceValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  goodText: {
    color: '#15803D',
  },
  warnText: {
    color: '#B45309',
  },

  customerPreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  customerPreviewTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  customerPreviewText: {
    color: NAVY,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 12,
  },
  previewMiniRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  previewMiniBox: {
    width: '31%',
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
  },
  previewMiniTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewMiniValue: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  modalCancelBtn: {
    width: '48%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
  },
  modalSaveBtn: {
    width: '48%',
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  bottomNavWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  bottomNav: {
    height: 78,
    backgroundColor: NAVY,
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
    color: GOLD,
  },
});