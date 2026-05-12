import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

export default function AdminHomeScreen({ navigation }) {
  const theme = useTheme();
  const logout = useAuthStore((state) => state.logout);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Home</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('AdminMaintenanceTab')}>
        <Text style={styles.btnText}>🔧 Maintenance Management</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  btn: { backgroundColor: '#1A7A7A', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
