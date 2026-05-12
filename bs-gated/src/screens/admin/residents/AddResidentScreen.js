import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

export default function AddResidentScreen({ navigation }) {
  const theme = useTheme();
  // Theme tokens
  const _bg = theme.background; // ensures theme reactive
  const addResident = useAdminStore((s) => s.addResident);

  const [name,  setName]  = useState('');
  const [unit,  setUnit]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !unit.trim() || !phone.trim()) {
      Alert.alert('Validation', 'Name, Unit and Phone are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addResident({ name: name.trim(), unit: unit.trim(), email: email.trim(), phone: phone.trim() });
      setLoading(false);
      Alert.alert('Success', `${name} added as resident.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 600);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Resident</Text>

          <Text style={globalStyles.label}>Full Name *</Text>
          <TextInput style={globalStyles.input} placeholder="e.g. Rahul Sharma" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

          <Text style={globalStyles.label}>Unit / Flat No. *</Text>
          <TextInput style={globalStyles.input} placeholder="e.g. A-101" placeholderTextColor={COLORS.textMuted} value={unit} onChangeText={setUnit} autoCapitalize="characters" />

          <Text style={globalStyles.label}>Phone Number *</Text>
          <TextInput style={globalStyles.input} placeholder="10-digit mobile" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />

          <Text style={globalStyles.label}>Email (Optional)</Text>
          <TextInput style={globalStyles.input} placeholder="email@example.com" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={globalStyles.btnText}>Add Resident</Text>
            }
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
  formCard: { ...globalStyles.card, padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});
