
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../superadmin/SocietyContext';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

function getStatusStyle(status) {
  switch (status) {
    case 'Approved':
    case 'Active':
      return { bg: '#E9F8EE', color: COLORS.success };
    case 'Pending':
    case 'Review':
      return { bg: '#FFF4E6', color: COLORS.warning };
    case 'Rejected':
    case 'Inactive':
      return { bg: '#FFE9E9', color: COLORS.danger };
    default:
      return { bg: COLORS.chipBg, color: COLORS.chipText };
  }
}

export default function TotalSocietiesDetails({ navigation }) {
  const { societies } = useAppContext();

  useEffect(() => {
    console.log('Societies Updated:', societies);
  }, [societies]);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primaryNavy} />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Total Societies Details</Text>
            <Text style={styles.subtitle}>List of all societies</Text>
          </View>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{societies.length} Societies</Text>
        </View>
      </View>

      <FlatList
        data={societies}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);

          return (
            <View style={styles.societyCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.societyName}>{item.name || item.societyName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.societyInfo}>City: {item.city}</Text>
              <Text style={styles.societyInfo}>Units: {item.units}</Text>
              <Text style={styles.societyAdmin}>Admin: {item.adminName}</Text>
              <Text style={styles.societyDocuments}>
                Documents:{' '}
                {item.documents && item.documents.length > 0
                  ? item.documents.join(', ')
                  : 'No documents'}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No societies found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8FAFC',
    padding: SPACING.lg,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 4,
  },
  countBadge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  societyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  societyName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  societyInfo: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 2,
  },
  societyAdmin: {
    fontSize: 14,
    color: COLORS.primaryNavy,
    fontWeight: '700',
    marginTop: 6,
  },
  societyDocuments: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 6,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 20,
    color: COLORS.subText,
    textAlign: 'center',
    fontSize: 14,
  },
});