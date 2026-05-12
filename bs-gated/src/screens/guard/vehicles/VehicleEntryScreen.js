import React, { useMemo, useState } from 'react';
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

export default function VehicleEntryScreen({ navigation }) {
  const theme = useTheme();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [searchText, setSearchText] = useState('');

  const [vehicleLogs, setVehicleLogs] = useState([
    {
      id: '1',
      vehicleNumber: 'TS09AB1234',
      ownerName: 'Ravi Kumar',
      flatNumber: 'A-102',
      vehicleType: 'Car',
      purpose: 'Resident',
      parkingSlot: '',
      status: 'Entered',
      entryTime: '09:10 AM',
      exitTime: '-',
    },
    {
      id: '2',
      vehicleNumber: 'TS10XY5678',
      ownerName: 'Suresh',
      flatNumber: 'B-203',
      vehicleType: 'Bike',
      purpose: 'Visitor',
      parkingSlot: 'P-07',
      status: 'Exited',
      entryTime: '10:05 AM',
      exitTime: '11:20 AM',
    },
  ]);

  const validateForm = () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Validation', 'Enter vehicle number');
      return false;
    }
    if (!ownerName.trim()) {
      Alert.alert('Validation', 'Enter owner name');
      return false;
    }
    if (!flatNumber.trim()) {
      Alert.alert('Validation', 'Enter flat number');
      return false;
    }
    if (!vehicleType.trim()) {
      Alert.alert('Validation', 'Enter vehicle type');
      return false;
    }
    if (!purpose.trim()) {
      Alert.alert('Validation', 'Enter purpose');
      return false;
    }
    return true;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddVehicleLog = () => {
    if (!validateForm()) return;

    const newVehicle = {
      id: Date.now().toString(),
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName,
      flatNumber,
      vehicleType,
      purpose,
      parkingSlot: parkingSlot.trim().toUpperCase() || '',
      status: 'Entered',
      entryTime: getCurrentTime(),
      exitTime: '-',
    };

    setVehicleLogs((prev) => [newVehicle, ...prev]);

    setVehicleNumber('');
    setOwnerName('');
    setFlatNumber('');
    setVehicleType('');
    setPurpose('');
    setParkingSlot('');

    Alert.alert('Success', 'Vehicle entry added successfully');
  };

  const handleMarkExit = (id) => {
    setVehicleLogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Exited',
              exitTime: getCurrentTime(),
            }
          : item
      )
    );
    Alert.alert('Updated', 'Vehicle marked as exited');
  };

  const filteredLogs = useMemo(() => {
    return vehicleLogs.filter((item) => {
      const value = searchText.toLowerCase();
      return (
        item.vehicleNumber.toLowerCase().includes(value) ||
        item.ownerName.toLowerCase().includes(value) ||
        item.flatNumber.toLowerCase().includes(value) ||
        item.vehicleType.toLowerCase().includes(value) ||
        item.purpose.toLowerCase().includes(value)
      );
    });
  }, [searchText, vehicleLogs]);

  return (
    <SafeAreaView style={_s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={_s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={_s.bk}>
          <Text style={_s.bkTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={_s.hdTtl}>Vehicle Entry Log</Text>
          <Text style={_s.hdSub}>Track vehicle movements</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Vehicle Logs</Text>
      <Text style={styles.subtitle}>Add vehicle entry and manage exit logs</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Vehicle Entry</Text>

        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          autoCapitalize="characters"
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Owner Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter owner name"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Flat Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter flat number"
          value={flatNumber}
          onChangeText={setFlatNumber}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Vehicle Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Car / Bike / EV / Van"
          value={vehicleType}
          onChangeText={setVehicleType}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={styles.input}
          placeholder="Resident / Visitor / Delivery"
          value={purpose}
          onChangeText={setPurpose}
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Parking Slot (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. P-12, B2-05"
          value={parkingSlot}
          onChangeText={setParkingSlot}
          autoCapitalize="characters"
          placeholderTextColor="#777"
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddVehicleLog}>
          <Text style={styles.primaryBtnText}>Add Vehicle Log</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Search Vehicle Logs</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by vehicle / owner / flat"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#777"
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Vehicle Entries</Text>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No vehicle logs found</Text>
        </View>
      ) : (
        filteredLogs.map((item) => (
          <View key={item.id} style={styles.logCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.vehicleNo}>{item.vehicleNumber}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  item.status === 'Entered' ? styles.enteredBadge : styles.exitedBadge,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Text style={styles.logText}>Owner: {item.ownerName}</Text>
            <Text style={styles.logText}>Flat: {item.flatNumber}</Text>
            <Text style={styles.logText}>Type: {item.vehicleType}</Text>
            <Text style={styles.logText}>Purpose: {item.purpose}</Text>
            {item.parkingSlot ? <Text style={[styles.logText, {color: theme.primary, fontWeight: '700'}]}>Parking Slot: {item.parkingSlot}</Text> : null}
            <Text style={styles.logText}>Entry: {item.entryTime}</Text>
            <Text style={styles.logText}>Exit: {item.exitTime}</Text>

            {item.status === 'Entered' && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handleMarkExit(item.id)}
              >
                <Text style={styles.secondaryBtnText}>Mark Exit</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5F5',
    padding: 16,
    paddingBottom: 40,
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
  vehicleNo: {
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
  enteredBadge: {
    backgroundColor: '#FFFFFF',
    color: '#2E7D32',
  },
  exitedBadge: {
    backgroundColor: '#FDECEC',
    color: '#C62828',
  },
  logText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1A7A7A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1A7A7A',
    fontSize: 14,
    fontWeight: '700',
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
