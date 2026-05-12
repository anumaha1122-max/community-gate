import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const ICONS = ['🏊', '💪', '🏛️', '🎾', '🏸', '⚽', '🎱', '🧘', '🏋️', '🛝'];

export default function AddAmenityScreen({ navigation }) {
  const theme = useTheme();
  // Theme tokens
  const _bg = theme.background; // ensures theme reactive
  const addAmenity = useAdminStore((s) => s.addAmenity);

  const [name,         setName]         = useState('');
  const [icon,         setIcon]         = useState('🏛️');
  const [maxSlots,     setMaxSlots]     = useState('10');
  const [pricePerSlot, setPricePerSlot] = useState('0');
  const [slotsInput,   setSlotsInput]   = useState('06:00-07:00, 07:00-08:00, 17:00-18:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Amenity name is required.');
      return;
    }
    const slots = slotsInput.split(',').map(s => s.trim()).filter(Boolean);
    setLoading(true);
    setTimeout(() => {
      addAmenity({
        name: name.trim(),
        icon,
        maxSlots: parseInt(maxSlots, 10) || 10,
        pricePerSlot: parseInt(pricePerSlot, 10) || 0,
        slots,
      });
      setLoading(false);
      Alert.alert('Success', `${name} added.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 500);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[globalStyles.card, styles.formCard]}>
          <Text style={styles.formTitle}>New Amenity</Text>

          <Text style={globalStyles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}
                onPress={() => setIcon(ic)}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={globalStyles.label}>Amenity Name *</Text>
          <TextInput style={globalStyles.input} placeholder="e.g. Swimming Pool" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

          <Text style={globalStyles.label}>Max Capacity (per slot)</Text>
          <TextInput style={globalStyles.input} placeholder="10" placeholderTextColor={COLORS.textMuted} value={maxSlots} onChangeText={setMaxSlots} keyboardType="numeric" />

          <Text style={globalStyles.label}>Price per Slot (₹, 0 = Free)</Text>
          <TextInput style={globalStyles.input} placeholder="0" placeholderTextColor={COLORS.textMuted} value={pricePerSlot} onChangeText={setPricePerSlot} keyboardType="numeric" />

          <Text style={globalStyles.label}>Time Slots (comma-separated)</Text>
          <TextInput
            style={[globalStyles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="06:00-07:00, 17:00-18:00, ..."
            placeholderTextColor={COLORS.textMuted}
            value={slotsInput}
            onChangeText={setSlotsInput}
            multiline
          />

          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.btnText}>Add Amenity</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  formCard: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#1A2E2E', marginBottom: 20 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  iconBtn: { padding: 10, borderRadius: 10, backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#D0EEEE' },
  iconBtnActive: { borderColor: '#1A7A7A', backgroundColor: '#E8F5F5' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: '#7A9E9E', fontSize: 14, fontWeight: '600' },
});