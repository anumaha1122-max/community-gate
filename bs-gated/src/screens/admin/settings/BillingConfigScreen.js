/**
 * BillingConfigScreen.js — Admin → Settings → Billing Configuration
 * Scope Module 14: Billing Configuration
 * - Flat-type wise maintenance rates (1BHK, 2BHK, 3BHK, 4BHK)
 * - Additional charges master (sinking fund, water, parking)
 * - Late fee configuration (% per month, grace period)
 * - Discount rules
 * - Billing cycle (day of month for auto-generation)
 * Store: adminStore.billingConfig + updateBillingConfig()
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Switch,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

const P = {
  teal:'#1A7A7A', tealDark:'#0D6E6E', tealSoft:'#E8F5F5',
  bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', textSub:'#3D6E6E', border:'#D0EEEE',
  warning:'#E65100', success:'#2E7D32',
};

const FLAT_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Duplex', 'Penthouse'];

function SH({ t }) { return <Text style={s.sh}>{t}</Text>; }

function ToggleRow({ label, sub, value, onValueChange }) {
  return (
    <View style={s.tr}>
      <View style={{ flex: 1 }}>
        <Text style={s.tl}>{label}</Text>
        {sub && <Text style={s.ts}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: P.border, true: P.teal + '60' }}
        thumbColor={value ? P.teal : '#94A3B8'} />
    </View>
  );
}

export default function BillingConfigScreen({ navigation }) {
  const cfg    = useAdminStore(st => st.billingConfig) || {};
  const update = useAdminStore(st => st.updateBillingConfig);

  // Flat-type rates (per month in ₹)
  const [flatRates, setFlatRates] = useState(cfg.flatRates || {
    '1 BHK': '2500', '2 BHK': '3500', '3 BHK': '4500',
    '4 BHK': '6000', 'Duplex': '7500', 'Penthouse': '10000',
  });

  // Additional charges
  const [sinkingFund,    setSinkingFund]    = useState(String(cfg.sinkingFund    || '500'));
  const [waterCharges,   setWaterCharges]   = useState(String(cfg.waterCharges   || '300'));
  const [parkingCharges, setParkingCharges] = useState(String(cfg.parkingCharges || '500'));
  const [parkingEnabled, setParkingEnabled] = useState(cfg.parkingEnabled        ?? true);
  const [waterMeterBased,setWaterMeterBased]= useState(cfg.waterMeterBased       ?? false);

  // Late fees
  const [lateFeeEnabled,  setLateFeeEnabled]  = useState(cfg.lateFeeEnabled  ?? true);
  const [lateFeeRate,     setLateFeeRate]     = useState(String(cfg.lateFeeRate  || '2'));
  const [gracePeriodDays, setGracePeriodDays] = useState(String(cfg.gracePeriodDays || '10'));

  // Billing cycle
  const [billingDay,    setBillingDay]    = useState(String(cfg.billingDay    || '1'));
  const [dueDays,       setDueDays]       = useState(String(cfg.dueDays       || '10'));
  const [autoGenerate,  setAutoGenerate]  = useState(cfg.autoGenerate         ?? true);

  // Discounts
  const [earlyPayDiscount,  setEarlyPayDiscount]  = useState(String(cfg.earlyPayDiscount  || '0'));
  const [seniorDiscount,    setSeniorDiscount]    = useState(String(cfg.seniorDiscount    || '0'));
  const [discountEnabled,   setDiscountEnabled]   = useState(cfg.discountEnabled          ?? false);

  const updateRate = (type, val) => setFlatRates(p => ({ ...p, [type]: val }));

  const save = () => {
    update({
      flatRates,
      sinkingFund: parseFloat(sinkingFund)||0,
      waterCharges: parseFloat(waterCharges)||0,
      parkingCharges: parseFloat(parkingCharges)||0,
      parkingEnabled, waterMeterBased,
      lateFeeEnabled,
      lateFeeRate: parseFloat(lateFeeRate)||2,
      gracePeriodDays: parseInt(gracePeriodDays)||10,
      billingDay: parseInt(billingDay)||1,
      dueDays: parseInt(dueDays)||10,
      autoGenerate,
      earlyPayDiscount: parseFloat(earlyPayDiscount)||0,
      seniorDiscount: parseFloat(seniorDiscount)||0,
      discountEnabled,
    });
    Alert.alert('✅ Saved', 'Billing configuration updated.');
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
            <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>⚙️ Billing Config</Text>
        <Text style={s.headerSub}>Rates, fees & invoice cycle</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        <SH t="🏠 Maintenance Rate (per Flat Type / Month)" />
        <View style={s.card}>
          {FLAT_TYPES.map((type, i) => (
            <View key={type}>
              {i > 0 && <View style={s.div} />}
              <View style={s.rateRow}>
                <Text style={s.rateLabel}>{type}</Text>
                <View style={s.rateInputWrap}>
                  <Text style={s.rupee}>₹</Text>
                  <TextInput
                    style={s.rateInput}
                    value={flatRates[type]}
                    onChangeText={v => updateRate(type, v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={P.textMuted}
                  />
                  <Text style={s.perMonth}>/mo</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <SH t="💧 Additional Charges" />
        <View style={s.card}>
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>Sinking Fund</Text>
            <View style={s.rateInputWrap}>
              <Text style={s.rupee}>₹</Text>
              <TextInput style={s.rateInput} value={sinkingFund} onChangeText={setSinkingFund} keyboardType="numeric" placeholder="0" placeholderTextColor={P.textMuted} />
              <Text style={s.perMonth}>/mo</Text>
            </View>
          </View>
          <View style={s.div} />
          <ToggleRow label="Water Charges" sub={waterMeterBased ? 'Meter-based billing' : 'Fixed monthly charge'} value={waterMeterBased} onValueChange={setWaterMeterBased} />
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>{waterMeterBased ? 'Rate (₹/kL)' : 'Fixed Amount'}</Text>
            <View style={s.rateInputWrap}>
              <Text style={s.rupee}>₹</Text>
              <TextInput style={s.rateInput} value={waterCharges} onChangeText={setWaterCharges} keyboardType="numeric" placeholder="0" placeholderTextColor={P.textMuted} />
            </View>
          </View>
          <View style={s.div} />
          <ToggleRow label="Parking Charges" sub="Monthly parking fee per slot" value={parkingEnabled} onValueChange={setParkingEnabled} />
          {parkingEnabled && (
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Per Slot / Month</Text>
              <View style={s.rateInputWrap}>
                <Text style={s.rupee}>₹</Text>
                <TextInput style={s.rateInput} value={parkingCharges} onChangeText={setParkingCharges} keyboardType="numeric" placeholder="0" placeholderTextColor={P.textMuted} />
                <Text style={s.perMonth}>/mo</Text>
              </View>
            </View>
          )}
        </View>

        <SH t="⚠️ Late Fee Configuration" />
        <View style={s.card}>
          <ToggleRow label="Late Fee Enabled" sub="Charge interest on overdue invoices" value={lateFeeEnabled} onValueChange={setLateFeeEnabled} />
          {lateFeeEnabled && (<>
            <View style={s.div} />
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Late Fee Rate (%/month)</Text>
              <View style={s.rateInputWrap}>
                <TextInput style={s.rateInput} value={lateFeeRate} onChangeText={setLateFeeRate} keyboardType="decimal-pad" placeholder="2" placeholderTextColor={P.textMuted} />
                <Text style={s.perMonth}>%</Text>
              </View>
            </View>
            <View style={s.div} />
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Grace Period (days)</Text>
              <View style={s.rateInputWrap}>
                <TextInput style={s.rateInput} value={gracePeriodDays} onChangeText={setGracePeriodDays} keyboardType="numeric" placeholder="10" placeholderTextColor={P.textMuted} />
                <Text style={s.perMonth}>days</Text>
              </View>
            </View>
          </>)}
        </View>

        <SH t="📅 Billing Cycle" />
        <View style={s.card}>
          <ToggleRow label="Auto-generate Invoices" sub="Automatically generate bills on billing day" value={autoGenerate} onValueChange={setAutoGenerate} />
          <View style={s.div} />
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>Billing Day (of month)</Text>
            <View style={s.rateInputWrap}>
              <TextInput style={s.rateInput} value={billingDay} onChangeText={setBillingDay} keyboardType="numeric" placeholder="1" placeholderTextColor={P.textMuted} />
              <Text style={s.perMonth}>st</Text>
            </View>
          </View>
          <View style={s.div} />
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>Due After (days)</Text>
            <View style={s.rateInputWrap}>
              <TextInput style={s.rateInput} value={dueDays} onChangeText={setDueDays} keyboardType="numeric" placeholder="10" placeholderTextColor={P.textMuted} />
              <Text style={s.perMonth}>days</Text>
            </View>
          </View>
        </View>

        <SH t="🎁 Discount Rules" />
        <View style={s.card}>
          <ToggleRow label="Discounts Enabled" sub="Apply discounts on qualifying payments" value={discountEnabled} onValueChange={setDiscountEnabled} />
          {discountEnabled && (<>
            <View style={s.div} />
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Early Payment Discount</Text>
              <View style={s.rateInputWrap}>
                <TextInput style={s.rateInput} value={earlyPayDiscount} onChangeText={setEarlyPayDiscount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={P.textMuted} />
                <Text style={s.perMonth}>%</Text>
              </View>
            </View>
            <View style={s.div} />
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Senior Citizen Discount</Text>
              <View style={s.rateInputWrap}>
                <TextInput style={s.rateInput} value={seniorDiscount} onChangeText={setSeniorDiscount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={P.textMuted} />
                <Text style={s.perMonth}>%</Text>
              </View>
            </View>
          </>)}
        </View>

        {/* Summary preview */}
        <SH t="📊 Rate Summary Preview" />
        <View style={s.card}>
          <Text style={s.previewTitle}>Sample Bill — 2 BHK</Text>
          {[
            ['Maintenance',    `₹${flatRates['2 BHK'] || 0}`],
            ['Sinking Fund',   `₹${sinkingFund}`],
            ['Water Charges',  `₹${waterCharges}`],
            parkingEnabled && ['Parking', `₹${parkingCharges}`],
          ].filter(Boolean).map(([label, val], i) => (
            <View key={i} style={s.previewRow}>
              <Text style={s.previewLabel}>{label}</Text>
              <Text style={s.previewVal}>{val}</Text>
            </View>
          ))}
          <View style={[s.div, { marginVertical: 8 }]} />
          <View style={s.previewRow}>
            <Text style={[s.previewLabel, { fontWeight: '800', color: P.text }]}>Total (excl. GST)</Text>
            <Text style={[s.previewVal, { fontWeight: '900', color: P.teal }]}>
              ₹{[
                parseFloat(flatRates['2 BHK'])||0,
                parseFloat(sinkingFund)||0,
                parseFloat(waterCharges)||0,
                parkingEnabled ? parseFloat(parkingCharges)||0 : 0,
              ].reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={save}>
          <Text style={s.saveBtnTxt}>💾 Save Billing Configuration</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: P.tealDark },
  header:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.tealDark, padding: 16, paddingTop: 8 },
  back:      { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt:   { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  htitle:    { color: '#FFF', fontSize: 17, fontWeight: '800' },
  hsub:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  saveHdr:   { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveHdrTxt:{ color: '#FFF', fontWeight: '700', fontSize: 13 },
  body:      { flex: 1, backgroundColor: P.bg },
  sh:        { fontSize: 11, fontWeight: '800', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  card:      { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  div:       { height: 1, backgroundColor: P.border },
  rateRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rateLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: P.text },
  rateInputWrap:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  rupee:     { fontSize: 14, color: P.textSub, fontWeight: '700' },
  rateInput: { width: 80, textAlign: 'right', borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 15, fontWeight: '700', borderColor: P.border, backgroundColor: P.bg, color: P.text },
  perMonth:  { fontSize: 11, color: P.textMuted, fontWeight: '600' },
  tr:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  tl:        { fontSize: 14, fontWeight: '700', color: P.text },
  ts:        { fontSize: 12, color: P.textMuted, marginTop: 2 },
  previewTitle:{ fontSize: 13, fontWeight: '800', color: P.textSub, marginBottom: 10 },
  previewRow:{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  previewLabel:{ fontSize: 13, color: P.textMuted },
  previewVal:{ fontSize: 13, fontWeight: '700', color: P.text },
  saveBtn:   { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnTxt:{ color: '#FFF', fontWeight: '800', fontSize: 15 },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
});
