import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, Modal, TextInput, ScrollView,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const SHIFTS = ['Morning', 'Evening', 'Night'];
const GATES  = ['Main Gate', 'Side Gate', 'Back Gate'];

export default function GuardManagementScreen() {
  const theme = useTheme();
  const guards            = useAdminStore((s) => s.guards);
  const addGuard          = useAdminStore((s) => s.addGuard);
  const toggleGuardActive = useAdminStore((s) => s.toggleGuardActive);

  const [modalVisible, setModalVisible] = useState(false);
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Morning');
  const [gate,  setGate]  = useState('Main Gate');

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation', 'Name and Phone are required.');
      return;
    }
    addGuard({ name: name.trim(), phone: phone.trim(), shift, gate });
    setModalVisible(false);
    setName(''); setPhone('');
  };

  const handleToggle = (g) => {
    Alert.alert(g.active ? 'Deactivate' : 'Activate', `${g.active ? 'Deactivate' : 'Activate'} ${g.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => toggleGuardActive(g.id) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.guardCard, !item.active && { opacity: 0.55 }]}>
      <View style={styles.avatarCircle}>
        <Text style={{ fontSize: 22 }}>🛡️</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.guardName}>{item.name}</Text>
        <Text style={styles.guardMeta}>{item.shift} Shift · {item.gate}</Text>
        <Text style={styles.guardPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={[styles.toggleBtn, { backgroundColor: item.active ? COLORS.success + '20' : COLORS.danger + '20' }]}
        onPress={() => handleToggle(item)}
      >
        <Text style={{ color: item.active ? COLORS.success : COLORS.danger, fontWeight: '700', fontSize: 12 }}>
          {item.active ? 'Active' : 'Off Duty'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guards ({guards.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Guard</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guards}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 36 }}>🛡️</Text>
            <Text style={globalStyles.emptyText}>No guards added</Text>
          </View>
        }
      />

      {/* Add Guard Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Add Guard</Text>

              <Text style={globalStyles.label}>Full Name *</Text>
              <TextInput style={globalStyles.input} placeholder="Guard's name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

              <Text style={globalStyles.label}>Phone *</Text>
              <TextInput style={globalStyles.input} placeholder="Mobile number" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={globalStyles.label}>Shift</Text>
              <View style={styles.optionRow}>
                {SHIFTS.map((s) => (
                  <TouchableOpacity key={s} style={[styles.optionBtn, shift === s && styles.optionBtnActive]} onPress={() => setShift(s)}>
                    <Text style={[styles.optionText, shift === s && styles.optionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={globalStyles.label}>Gate</Text>
              <View style={styles.optionRow}>
                {GATES.map((g) => (
                  <TouchableOpacity key={g} style={[styles.optionBtn, gate === g && styles.optionBtnActive]} onPress={() => setGate(g)}>
                    <Text style={[styles.optionText, gate === g && styles.optionTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 8 }]} onPress={handleAdd}>
                <Text style={globalStyles.btnText}>Add Guard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  guardCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  guardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  guardMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
  guardPhone: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.border },
  optionBtnActive: { backgroundColor: COLORS.primary },
  optionText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  optionTextActive: { color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});
