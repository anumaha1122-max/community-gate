import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function EditProfileScreen({ navigation }) {
  const theme = useTheme();
  const [name,     setName]     = useState('Ramesh Kumar');
  const [phone,    setPhone]    = useState('+91 98765 43210');
  const [email,    setEmail]    = useState('ramesh.kumar@gmail.com');
  const [city,     setCity]     = useState('Hyderabad, Telangana');
  const [address,  setAddress]  = useState('Plot 5, Jubilee Hills, Hyderabad');
  const [category, setCategory] = useState('Plumbing & Electrical');
  const [bio,      setBio]      = useState('Professional plumber & electrician with 8+ years of experience.');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.avatarRow}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>RK</Text>
          </View>
          <TouchableOpacity style={s.changePhotoBtn} activeOpacity={0.8}>
            <Text style={s.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <InputField label="Full Name"        value={name}     onChangeText={setName}     placeholder="Your full name" />
          <InputField label="Phone Number"     value={phone}    onChangeText={setPhone}    placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
          <InputField label="Email"            value={email}    onChangeText={setEmail}    placeholder="email@example.com" />
          <InputField label="City"             value={city}     onChangeText={setCity}     placeholder="City, State" />
          <InputField label="Full Address"     value={address}  onChangeText={setAddress}  placeholder="House/Flat, Area, City" />
          <InputField label="Service Category" value={category} onChangeText={setCategory} placeholder="e.g. Plumbing, Electrical" />
          <InputField label="About / Bio"      value={bio}      onChangeText={setBio}      placeholder="Brief description" multiline />
        </Card>

        <PrimaryButton title="Save Changes" onPress={() => navigation.goBack()} color={Colors.purple} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:          { padding: 16, paddingBottom: 40 },
  avatarRow:       { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarCircle:    { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A7A7A', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText:      { fontSize: 28, fontWeight: '800', color: '#FFF' },
  changePhotoBtn:  { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#1A7A7A', backgroundColor: '#CCFBF1' },
  changePhotoText: { fontSize: 13, color: '#1A7A7A', fontWeight: '700' },
  purple:          { color: '#1A7A7A' },
});
