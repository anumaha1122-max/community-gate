import React, { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function GuardBiometricScreen({ navigation }) {
  const theme = useTheme();
  const [guardId, setGuardId] = useState('');
  const [guardName, setGuardName] = useState('');
  const [scanType, setScanType] = useState('Fingerprint');
  const [status, setStatus] = useState('Not Verified');
  const [lastVerifiedAt, setLastVerifiedAt] = useState('');
  const [logs, setLogs] = useState([
    {
      id: '1',
      guardId: 'GRD001',
      guardName: 'Ramesh',
      scanType: 'Fingerprint',
      status: 'Verified',
      time: '09:00 AM',
    },
    {
      id: '2',
      guardId: 'GRD002',
      guardName: 'Suresh',
      scanType: 'Fingerprint',
      status: 'Failed',
      time: '09:10 AM',
    },
  ]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validateForm = () => {
    if (!guardId.trim()) {
      Alert.alert('Validation', 'Enter guard ID');
      return false;
    }
    if (!guardName.trim()) {
      Alert.alert('Validation', 'Enter guard name');
      return false;
    }
    return true;
  };

  const handleBiometricAuth = () => {
    if (!validateForm()) return;

    const currentTime = getCurrentTime();
    // Simulate biometric: alternate verified/failed for demo
    const success = Math.random() > 0.3;

    if (success) {
      setStatus('Verified');
      setLastVerifiedAt(currentTime);
      setLogs((prev) => [{ id: Date.now().toString(), guardId, guardName, scanType, status: 'Verified', time: currentTime }, ...prev]);
      Alert.alert('Success', `${scanType} verified successfully`);
    } else {
      setStatus('Failed');
      setLogs((prev) => [{ id: Date.now().toString(), guardId, guardName, scanType, status: 'Failed', time: currentTime }, ...prev]);
      Alert.alert('Failed', `${scanType} verification failed`);
    }
  };

  const handleReset = () => {
    setGuardId('');
    setGuardName('');
    setScanType('Fingerprint');
    setStatus('Not Verified');
    setLastVerifiedAt('');
  };

  return (
    <SafeAreaView style={_s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={_s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={_s.bk}>
          <Text style={_s.bkTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={_s.hdTtl}>Attendance & Biometric</Text>
          <Text style={_s.hdSub}>Guard check-in / check-out log</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Guard Verification</Text>

        <Text style={styles.label}>Guard ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter guard ID"
          value={guardId}
          onChangeText={setGuardId}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Guard Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter guard name"
          value={guardName}
          onChangeText={setGuardName}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Scan Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              scanType === 'Fingerprint' && styles.typeBtnActive,
            ]}
            onPress={() => setScanType('Fingerprint')}
          >
            <Text
              style={[
                styles.typeBtnText,
                scanType === 'Fingerprint' && styles.typeBtnTextActive,
              ]}
            >
              Fingerprint
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn,
              scanType === 'Face ID' && styles.typeBtnActive,
            ]}
            onPress={() => setScanType('Face ID')}
          >
            <Text
              style={[
                styles.typeBtnText,
                scanType === 'Face ID' && styles.typeBtnTextActive,
              ]}
            >
              Face ID
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text
            style={[
              styles.statusValue,
              status === 'Verified'
                ? styles.verifiedText
                : status === 'Failed'
                ? styles.failedText
                : styles.pendingText,
            ]}
          >
            {status}
          </Text>
          {lastVerifiedAt ? (
            <Text style={styles.lastTime}>Last verified at: {lastVerifiedAt}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleBiometricAuth}>
          <Text style={styles.primaryBtnText}>Start Biometric Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Verification Logs</Text>

      {logs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No biometric logs found</Text>
        </View>
      ) : (
        logs.map((item) => (
          <View key={item.id} style={styles.logCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.guardName}>{item.guardName}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  item.status === 'Verified' ? styles.verifiedBadge : styles.failedBadge,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Text style={styles.logText}>Guard ID: {item.guardId}</Text>
            <Text style={styles.logText}>Scan Type: {item.scanType}</Text>
            <Text style={styles.logText}>Time: {item.time}</Text>
          </View>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E8F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A2E2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A9E9E',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A7A7A',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2E2E',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#E8F5F5',
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A2E2E',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BFC7D1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeBtnActive: {
    backgroundColor: '#1A7A7A',
    borderColor: '#1A7A7A',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2E2E',
  },
  typeBtnTextActive: {
    color: '#1A2E2E',
  },
  statusCard: {
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E8EE',
  },
  statusLabel: {
    fontSize: 13,
    color: '#7A9E9E',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  verifiedText: {
    color: '#2E7D32',
  },
  failedText: {
    color: '#C62828',
  },
  pendingText: {
    color: '#EF6C00',
  },
  lastTime: {
    fontSize: 13,
    color: '#7A9E9E',
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#1A7A7A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#1A2E2E',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#AAB3BE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: '#1A2E2E',
    fontSize: 14,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A7A7A',
    marginBottom: 10,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  verifiedBadge: {
    backgroundColor: '#FFFFFF',
    color: '#2E7D32',
  },
  failedBadge: {
    backgroundColor: '#FDECEC',
    color: '#C62828',
  },
  logText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A9E9E',
    fontSize: 15,
  },
});

const _s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#E8F5F5' },
  hdr:   { backgroundColor: '#0D6E6E', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bk:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  bkTxt: { fontSize: 26, color: '#FFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  hdTtl: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  hdSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
});