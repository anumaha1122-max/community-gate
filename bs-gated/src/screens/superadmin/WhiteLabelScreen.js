
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';
import InfoBanner from '../../components/SAInfoBanner';
import { useAppContext } from '../superadmin/SocietyContext';

export default function WhiteLabelScreen({ navigation }) {
  const { whiteLabelConfig, updateWhiteLabelConfig } = useAppContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [editedValue, setEditedValue] = useState('');

  const handleEdit = (field, currentValue) => {
    setSelectedField(field);
    setEditedValue(currentValue || '');
    setEditModalVisible(true);
  };

  const handleSave = () => {
    if (selectedField === 'primaryDomain') {
      updateWhiteLabelConfig({ primaryDomain: editedValue });
    } else if (selectedField === 'emailDomain') {
      updateWhiteLabelConfig({ emailDomain: editedValue });
    }

    setEditModalVisible(false);
    setSelectedField('');
    setEditedValue('');
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setSelectedField('');
    setEditedValue('');
  };

  const handlePickLogo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow gallery access to upload logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateWhiteLabelConfig({ logo: result.assets[0].uri });
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="White Label"
        subtitle="Branding, domain and tenant controls"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <InfoBanner text="This is where platform branding, society-specific domain mapping, default theme settings, tenant isolation and notification template control belong." />

        <SectionHeader title="Master White Label Configuration" />

        <View style={styles.card}>
          <Text style={styles.label}>Master Logo</Text>

          {whiteLabelConfig.logo ? (
            <Image source={{ uri: whiteLabelConfig.logo }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>No logo uploaded</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handlePickLogo}>
            <Text style={styles.editButtonText}>
              {whiteLabelConfig.logo ? 'Change Logo' : 'Upload Logo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Primary Domain</Text>
              <Text style={styles.value}>{whiteLabelConfig.primaryDomain}</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                handleEdit('primaryDomain', whiteLabelConfig.primaryDomain)
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Email Domain</Text>
              <Text style={styles.value}>{whiteLabelConfig.emailDomain}</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                handleEdit('emailDomain', whiteLabelConfig.emailDomain)
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionHeader title="Enabled Controls" />

        <View style={styles.card}>
          <Text style={styles.point}>{`\u2022 Custom society subdomains`}</Text>
          <Text style={styles.point}>{`\u2022 Logo, fonts and primary colors per tenant`}</Text>
          <Text style={styles.point}>{`\u2022 Feature toggles by subscription plan`}</Text>
          <Text style={styles.point}>{`\u2022 Multi-language notifications`}</Text>
          <Text style={styles.point}>{`\u2022 Scheduled report delivery`}</Text>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit {selectedField === 'primaryDomain' ? 'Primary Domain' : 'Email Domain'}
            </Text>

            <TextInput
              style={styles.input}
              value={editedValue}
              onChangeText={setEditedValue}
              placeholder="Enter updated value"
              placeholderTextColor={COLORS.subText}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 4,
  },
  point: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: COLORS.primaryNavy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  logoPreview: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: 'contain',
    backgroundColor: '#F8F8F8',
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});