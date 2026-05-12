
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, Modal } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';
import { plans } from '../../data/superAdminData';

export default function SubscriptionPlansScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null); // Store the current plan being edited
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    features: '',
  });

  const [plansList, setPlansList] = useState(plans);

  const handleSaveChanges = () => {
    const updatedPlans = plansList.map((plan) =>
      plan.id === currentPlan.id ? { ...plan, ...currentPlan } : plan
    );
    setPlansList(updatedPlans);
    setModalMessage('Plan updated successfully!');
    setModalVisible(true);
  };

  const handleAddNewPlan = () => {
    const newId = `PLN-${plansList.length + 1}`;
    const addedPlan = {
      id: newId,
      name: newPlan.name,
      price: newPlan.price,
      features: newPlan.features.split(','),
    };
    setPlansList([...plansList, addedPlan]);
    setModalMessage('New plan added successfully!');
    setModalVisible(true);
  };

  const handleDeletePlan = (planId) => {
    const updatedPlans = plansList.filter((plan) => plan.id !== planId);
    setPlansList(updatedPlans);
    setModalMessage('Plan deleted successfully!');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Subscription Plans"
        subtitle="Manage pricing and modules"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <SectionHeader title="Available Plans" />

        <View style={styles.plansContainer}>
          {plansList.map((plan) => (
            <View key={plan.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{plan.price}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {plan.features.map((feature, index) => (
                  <Text key={index} style={styles.featureText}>{`\u2022 ${feature}`}</Text>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeletePlan(plan.id)} // Delete plan
                >
                  <Text style={styles.actionBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Plan Section */}
        <SectionHeader title="Add New Plan" />
        <View style={styles.card}>
          <TextInput
            style={styles.inputField}
            placeholder="Plan Name"
            value={newPlan.name}
            onChangeText={(text) => setNewPlan({ ...newPlan, name: text })}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Price"
            value={newPlan.price}
            keyboardType="numeric"
            onChangeText={(text) => setNewPlan({ ...newPlan, price: text })}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Features (comma-separated)"
            value={newPlan.features}
            onChangeText={(text) => setNewPlan({ ...newPlan, features: text })}
          />
          <TouchableOpacity
            style={[styles.actionBtn, styles.addNewBtn]}
            onPress={handleAddNewPlan}
          >
            <Text style={styles.actionBtnText}>Add New Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal to show success or error message */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 80,
  },
  plansContainer: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Shadow effect on Android
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceTag: {
    backgroundColor: COLORS.primaryNavy,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  cardBody: {
    marginTop: SPACING.md,
  },
  featureText: {
    color: COLORS.subText,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },

  deleteBtn: {
    backgroundColor: COLORS.danger,

  },

  addNewBtn: {
    backgroundColor: COLORS.primaryNavy,
    paddingHorizontal: 50,       
  },
  inputField: {
    marginBottom: 10,
    padding: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SPACING.radiusMd,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: 350,
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});


