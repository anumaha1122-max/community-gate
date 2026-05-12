import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const CATEGORIES = ['Maintenance', 'Salary', 'Utilities', 'Cleaning', 'Security', 'Other'];
const CAT_ICONS  = { Maintenance: '🔧', Salary: '💳', Utilities: '⚡', Cleaning: '🧹', Security: '🛡️', Other: '📦' };

export default function ExpenseScreen() {
  const theme = useTheme();
  const expenses   = useAdminStore((s) => s.expenses);
  const addExpense = useAdminStore((s) => s.addExpense);

  const [modalVisible, setModalVisible] = useState(false);
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [amount,   setAmount]   = useState('');

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    if (!title.trim() || !amount || isNaN(parseInt(amount, 10))) {
      Alert.alert('Validation', 'Title and Amount are required.');
      return;
    }
    addExpense({ title: title.trim(), category, amount: parseInt(amount, 10) });
    setModalVisible(false);
    setTitle(''); setAmount('');
  };

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.expenseCard]}>
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 22 }}>{CAT_ICONS[item.category] || '📦'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseMeta}>{item.category} · {item.date}</Text>
      </View>
      <Text style={styles.expenseAmount}>₹{item.amount.toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>₹{total.toLocaleString()}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Expenses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 36 }}>📊</Text>
            <Text style={globalStyles.emptyText}>No expenses recorded</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Add Expense</Text>

              <Text style={globalStyles.label}>Title *</Text>
              <TextInput style={globalStyles.input} placeholder="Expense title" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />

              <Text style={globalStyles.label}>Category</Text>
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.catChip, category === c && styles.catChipActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.catText, category === c && styles.catTextActive]}>{CAT_ICONS[c]} {c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={globalStyles.label}>Amount (₹) *</Text>
              <TextInput style={globalStyles.input} placeholder="0" placeholderTextColor={COLORS.textMuted} value={amount} onChangeText={setAmount} keyboardType="numeric" />

              <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary]} onPress={handleAdd}>
                <Text style={globalStyles.btnText}>Add Expense</Text>
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
  totalBanner: { backgroundColor: '#1A7A7A', padding: 20, alignItems: 'center' },
  totalLabel: { color: '#CE93D8', fontSize: 13, fontWeight: '600' },
  totalAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  header: { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: '#1A7A7A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
  expenseCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  expenseMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.border },
  catChipActive: { backgroundColor: '#1A7A7A' },
  catText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  catTextActive: { color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});
