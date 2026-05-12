import React, { useState } from 'react';
import { ScrollView, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import ListCard from '../../components/SAListCard';
import InfoBanner from '../../components/SAInfoBanner';
import { societyRequests } from '../../data/superAdminData';
import COLORS from '../../theme/SAcolors';

export default function SocietiesScreen({ navigation }) {
  const [items] = useState(societyRequests);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.societyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateSociety = () => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('CreateSocietyScreen');
    } else {
      navigation.navigate('CreateSocietyScreen');
    }
  };

  const openSocietyDetails = (item) => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('SocietyDetails', { society: item });
    } else {
      navigation.navigate('SocietyDetails', { society: item });
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Society Onboarding"
        subtitle="Approve and activate societies"
        rightIcon="add-outline"
        onRightIconPress={openCreateSociety}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.createButton} onPress={openCreateSociety}>
          <Text style={styles.createButtonText}>Create New Society</Text>
        </TouchableOpacity>

        <InfoBanner text="Society Admin requests are reviewed here. Approve, assign subscription plan, activate society and issue branded subdomain." />

        <TextInput
          style={styles.searchBar}
          placeholder="Search Society by Name"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />

        <SectionHeader
          title="Pending & Active Requests"
          actionText={`${filteredItems.length} records`}
        />

        {filteredItems.map((item) => (
          <ListCard
            key={item.id}
            title={item.societyName}
            subtitle={`${item.city} · ${item.units} units · Admin: ${item.adminName}`}
            metaLeft={item.id}
            metaRight={item.plan}
            status={item.status}
            onPress={() => openSocietyDetails(item)}
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
  },
  createButton: {
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});