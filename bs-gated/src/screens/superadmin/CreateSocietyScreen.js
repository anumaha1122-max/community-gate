
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';
import { useAppContext } from '../superadmin/SocietyContext';

export default function CreateSocietyScreen({ navigation }) {
  const { addSociety } = useAppContext();

  const [society, setSociety] = useState({
    name: '',
    city: '',
    units: '',
    adminName: '',
    plan: 'Basic',
    documents: [],
  });

  const [status, setStatus] = useState('Pending');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (key, value) => {
    setSociety((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateSociety = () => {
    if (!society.name.trim()) {
      alert('Please enter society name');
      return;
    }

    if (!society.city.trim()) {
      alert('Please enter city');
      return;
    }

    if (!society.units.trim()) {
      alert('Please enter units');
      return;
    }

    if (!society.adminName.trim()) {
      alert('Please assign admin name');
      return;
    }

    const newSocietyData = {
      id: `SOC-${Date.now()}`,
      societyName: society.name,
      name: society.name,
      city: society.city,
      units: society.units,
      adminName: society.adminName,
      plan: society.plan,
      status,
      documents: society.documents || [],
    };

    addSociety(newSocietyData);
    setSuccessMessage('Society created successfully!');
    setShowSuccessPopup(true);
  };

  const handleActivateDeactivate = () => {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    setSuccessMessage(`Society status changed to ${newStatus}`);
    setShowSuccessPopup(true);
  };

  const handleAssignAdmin = () => {
    setShowAdminModal(true);
  };

  const handleSaveAdmin = () => {
    if (!society.adminName.trim()) {
      alert('Please enter admin name');
      return;
    }
    setShowAdminModal(false);
  };

  const closeSuccessPopup = () => {
    const shouldGoBack = successMessage === 'Society created successfully!';
    setShowSuccessPopup(false);
    if (shouldGoBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.header}>Create New Society</Text>
          <Text style={styles.subHeader}>
            Add society details, assign admin and configure status
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Society Information</Text>

            <Text style={styles.label}>Society Name</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter society name"
              value={society.name}
              onChangeText={(text) => updateField('name', text)}
              placeholderTextColor="#8A8A8A"
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter city"
              value={society.city}
              onChangeText={(text) => updateField('city', text)}
              placeholderTextColor="#8A8A8A"
            />

            <Text style={styles.label}>Units</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter number of units"
              value={society.units}
              onChangeText={(text) => updateField('units', text)}
              keyboardType="numeric"
              placeholderTextColor="#8A8A8A"
            />

            <Text style={styles.label}>Admin Name</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter admin name"
              value={society.adminName}
              onChangeText={(text) => updateField('adminName', text)}
              placeholderTextColor="#8A8A8A"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Subscription Plan</Text>
            <View style={styles.planRow}>
              {['Basic', 'Premium', 'Enterprise'].map((plan) => {
                const active = society.plan === plan;
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[styles.planChip, active && styles.planChipActive]}
                    onPress={() => updateField('plan', plan)}
                  >
                    <Text style={[styles.planChipText, active && styles.planChipTextActive]}>
                      {plan}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  status === 'Active'
                    ? styles.activeBadge
                    : status === 'Inactive'
                    ? styles.inactiveBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    status === 'Active'
                      ? styles.activeBadgeText
                      : status === 'Inactive'
                      ? styles.inactiveBadgeText
                      : styles.pendingBadgeText,
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleActivateDeactivate}>
              <Text style={styles.secondaryButtonText}>
                {status === 'Active' ? 'Deactivate Society' : 'Activate Society'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Management</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleAssignAdmin}>
              <Text style={styles.secondaryButtonText}>Assign Admin</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateSociety}>
            <Text style={styles.primaryButtonText}>Create Society</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showAdminModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Assign Admin</Text>

              <TextInput
                style={styles.inputField}
                placeholder="Enter admin name"
                value={society.adminName}
                onChangeText={(text) => updateField('adminName', text)}
                placeholderTextColor="#8A8A8A"
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAdmin}>
                <Text style={styles.primaryButtonText}>Save Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAdminModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showSuccessPopup} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.successPopupContainer}>
              <Ionicons
                name="checkmark-circle"
                size={52}
                color={COLORS.primaryNavy}
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.successText}>{successMessage}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={closeSuccessPopup}>
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: 56,
    paddingBottom: 30,
  },
  backArrow: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subHeader: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subText,
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subText,
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    padding: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  planRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  planChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.chipBg,
  },
  planChipActive: {
    backgroundColor: COLORS.primaryNavy,
    borderColor: COLORS.primaryNavy,
  },
  planChipText: {
    color: COLORS.chipText,
    fontWeight: '700',
    fontSize: 13,
  },
  planChipTextActive: {
    color: COLORS.white,
  },
  statusRow: {
    marginBottom: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pendingBadge: {
    backgroundColor: '#FFF4E6',
  },
  activeBadge: {
    backgroundColor: '#E9F8EE',
  },
  inactiveBadge: {
    backgroundColor: '#FFE9E9',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pendingBadgeText: {
    color: '#C97A10',
  },
  activeBadgeText: {
    color: '#1E8E3E',
  },
  inactiveBadgeText: {
    color: '#D93025',
  },
  primaryButton: {
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryNavy,
  },
  secondaryButtonText: {
    color: COLORS.primaryNavy,
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  successPopupContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryNavy,
    marginBottom: 10,
    textAlign: 'center',
  },
});