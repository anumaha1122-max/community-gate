/**
 * RateVendorScreen.js — Resident
 *
 * Appears after maintenance payment is confirmed.
 * Submits rating to appStore.vendorRatings.
 * Cross-role: vendor can see it in VendorRatingsScreen.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1A2E2E', sub: '#3D6E6E',
  muted: '#7A9E9E', border: '#D0EEEE', gold: '#D97706',
  goldBg: '#FEF3C7', success: '#16A34A', successBg: '#DCFCE7',
};

const TAGS = ['On Time', 'Clean Work', 'Professional', 'Good Communication', 'Reasonably Priced', 'Would Hire Again'];

export default function RateVendorScreen({ navigation, route }) {
  const { requestId, vendorId, vendorName, category } = route.params || {};

  const user = useAuthStore(s => s.user);
  const submitVendorRating = useAppStore(s => s.submitVendorRating);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Select Rating', 'Please select a star rating before submitting.');
      return;
    }
    submitVendorRating({
      vendorId: vendorId || 'ven1',
      vendorName: vendorName || 'Vendor',
      residentId: user?.id || 'res1',
      residentName: user?.name || 'Resident',
      requestId: requestId || '',
      rating,
      review: review.trim() || selectedTags.join(', '),
      tags: selectedTags,
      category: category || 'General',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={s.successContainer}>
          <Text style={s.successEmoji}>⭐</Text>
          <Text style={s.successTitle}>Thank You!</Text>
          <Text style={s.successSub}>Your {rating}-star review for {vendorName || 'the vendor'} has been submitted. This helps the community choose the best service providers.</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Rate Your Experience</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Vendor info */}
        <View style={s.vendorCard}>
          <View style={s.vendorIcon}>
            <Text style={{ fontSize: 28 }}>🔧</Text>
          </View>
          <View>
            <Text style={s.vendorName}>{vendorName || 'Service Vendor'}</Text>
            <Text style={s.vendorCat}>{category || 'Maintenance'} Service</Text>
            {requestId && <Text style={s.vendorJob}>Job #{requestId}</Text>}
          </View>
        </View>

        {/* Star Rating */}
        <View style={s.starSection}>
          <Text style={s.starLabel}>How was the service?</Text>
          <View style={s.starRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} style={s.starBtn} activeOpacity={0.8}>
                <Text style={[s.star, { color: i <= rating ? P.gold : '#CBD5E1' }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.starCaption}>
            {rating === 0 ? 'Tap to rate' :
             rating === 1 ? '😞 Poor'      :
             rating === 2 ? '😐 Fair'      :
             rating === 3 ? '🙂 Good'      :
             rating === 4 ? '😊 Great'     : '🤩 Excellent!'}
          </Text>
        </View>

        {/* Quick Tags */}
        <View style={s.tagsSection}>
          <Text style={s.tagsLabel}>What went well? (optional)</Text>
          <View style={s.tagsWrap}>
            {TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.tag, selectedTags.includes(tag) && s.tagActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text style={[s.tagText, selectedTags.includes(tag) && s.tagTextActive]}>
                  {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Written Review */}
        <View style={s.reviewSection}>
          <Text style={s.reviewLabel}>Write a review (optional)</Text>
          <TextInput
            style={s.reviewInput}
            value={review}
            onChangeText={setReview}
            placeholder="Share details about your experience…"
            placeholderTextColor={P.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={s.charCount}>{review.length}/500</Text>
        </View>

        <TouchableOpacity
          style={[s.submitBtn, rating === 0 && s.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={s.submitBtnText}>Submit Review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={() => navigation.goBack()}>
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.tealDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  scroll: { padding: 20 },

  vendorCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: P.border, elevation: 2 },
  vendorIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: P.bg, alignItems: 'center', justifyContent: 'center' },
  vendorName: { fontSize: 17, fontWeight: '900', color: P.text },
  vendorCat: { fontSize: 13, color: P.sub, marginTop: 2 },
  vendorJob: { fontSize: 11, color: P.muted, marginTop: 4 },

  starSection: { backgroundColor: P.surface, borderRadius: 18, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  starLabel: { fontSize: 16, fontWeight: '800', color: P.text, marginBottom: 16 },
  starRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 44 },
  starCaption: { fontSize: 16, fontWeight: '700', color: P.sub, marginTop: 12 },

  tagsSection: { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  tagsLabel: { fontSize: 14, fontWeight: '800', color: P.text, marginBottom: 12 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  tagActive: { backgroundColor: P.teal, borderColor: P.teal },
  tagText: { fontSize: 13, fontWeight: '600', color: P.sub },
  tagTextActive: { color: '#FFF' },

  reviewSection: { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: P.border },
  reviewLabel: { fontSize: 14, fontWeight: '800', color: P.text, marginBottom: 10 },
  reviewInput: { borderWidth: 1, borderColor: P.border, borderRadius: 12, padding: 14, fontSize: 14, color: P.text, minHeight: 100 },
  charCount: { fontSize: 11, color: P.muted, textAlign: 'right', marginTop: 6 },

  submitBtn: { backgroundColor: P.teal, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { color: P.muted, fontSize: 14 },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successEmoji: { fontSize: 72, marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '900', color: P.text, marginBottom: 12 },
  successSub: { fontSize: 15, color: P.sub, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  doneBtn: { backgroundColor: P.teal, borderRadius: 16, paddingHorizontal: 40, paddingVertical: 16 },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
