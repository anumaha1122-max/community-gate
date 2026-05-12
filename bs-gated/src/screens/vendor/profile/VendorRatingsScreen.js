/**
 * VendorRatingsScreen.js — Vendor
 *
 * Scope: Rating & review system — vendor sees all reviews, avg score,
 * breakdown by star, category-wise performance.
 * Resident submits a rating after maintenance is paid_to_vendor.
 */

import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1A2E2E', sub: '#3D6E6E',
  muted: '#7A9E9E', border: '#D0EEEE', gold: '#D97706',
  goldBg: '#FEF3C7', danger: '#C62828', dangerBg: '#FEE2E2',
  success: '#16A34A', successBg: '#DCFCE7',
};

function StarRow({ rating, count }) {
  const stars = rating; // 1-5
  return (
    <View style={st.starRow}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 16, color: i <= stars ? P.gold : '#E5E7EB' }}>★</Text>
      ))}
      <Text style={st.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function ScoreBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={st.barRow}>
      <Text style={st.barStar}>{star}★</Text>
      <View style={st.barBg}>
        <View style={[st.barFill, { width: `${pct}%`, backgroundColor: star >= 4 ? P.success : star === 3 ? P.gold : P.danger }]} />
      </View>
      <Text style={st.barCount}>{count}</Text>
    </View>
  );
}

export default function VendorRatingsScreen({ navigation }) {
  const user      = useAuthStore(s => s.user);
  const vendorId  = user?.id || 'ven1';
  const allRatings       = useAppStore(s => s.vendorRatings || []);
  const getVendorRatings  = useAppStore(s => s.getVendorRatings);
  const getVendorAvgRating = useAppStore(s => s.getVendorAvgRating);

  const ratings = getVendorRatings(vendorId);
  const avg     = getVendorAvgRating(vendorId);

  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
    return counts;
  }, [ratings]);

  const catPerf = useMemo(() => {
    const map = {};
    ratings.forEach(r => {
      if (!map[r.category]) map[r.category] = { total: 0, count: 0 };
      map[r.category].total += r.rating;
      map[r.category].count += 1;
    });
    return Object.entries(map).map(([cat, d]) => ({ cat, avg: (d.total / d.count).toFixed(1), count: d.count }));
  }, [ratings]);

  const avgNum = avg ? Number(avg) : 0;
  const scoreColor = avgNum >= 4 ? P.success : avgNum >= 3 ? P.gold : P.danger;

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Ratings & Reviews</Text>
      </View>

      <FlatList
        data={ratings}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListHeaderComponent={
          <>
            {/* Score Card */}
            <View style={st.scoreCard}>
              <View style={st.scoreLeft}>
                <Text style={[st.scoreNum, { color: scoreColor }]}>{avg || '—'}</Text>
                <StarRow rating={avgNum} />
                <Text style={st.scoreSub}>{ratings.length} review{ratings.length !== 1 ? 's' : ''}</Text>
              </View>
              <View style={st.scoreBars}>
                {[5, 4, 3, 2, 1].map(star => (
                  <ScoreBar key={star} star={star} count={breakdown[star] || 0} total={ratings.length} />
                ))}
              </View>
            </View>

            {/* Category Performance */}
            {catPerf.length > 0 && (
              <View style={st.catCard}>
                <Text style={st.catTitle}>Performance by Category</Text>
                {catPerf.map(c => (
                  <View key={c.cat} style={st.catRow}>
                    <Text style={st.catName}>{c.cat}</Text>
                    <Text style={st.catCount}>{c.count} job{c.count !== 1 ? 's' : ''}</Text>
                    <Text style={[st.catAvg, { color: Number(c.avg) >= 4 ? P.success : Number(c.avg) >= 3 ? P.gold : P.danger }]}>
                      ★ {c.avg}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={st.sectionTitle}>All Reviews</Text>
          </>
        }
        ListEmptyComponent={
          <View style={st.empty}>
            <Text style={st.emptyEmoji}>⭐</Text>
            <Text style={st.emptyTitle}>No reviews yet</Text>
            <Text style={st.emptySub}>Complete maintenance jobs and get rated by residents.</Text>
          </View>
        }
        renderItem={({ item: r }) => (
          <View style={st.card}>
            <View style={st.cardTop}>
              <View style={st.cardAvatar}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardName}>{r.residentName}</Text>
                <Text style={st.cardCat}>{r.category} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
              </View>
              <View style={st.ratingBadge}>
                <Text style={st.ratingBadgeText}>★ {r.rating}</Text>
              </View>
            </View>
            {r.review ? (
              <Text style={st.reviewText}>"{r.review}"</Text>
            ) : (
              <Text style={[st.reviewText, { color: P.muted, fontStyle: 'italic' }]}>No written review.</Text>
            )}
            <Text style={st.jobRef}>Job #{r.requestId}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.tealDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },

  scoreCard: { flexDirection: 'row', backgroundColor: P.surface, borderRadius: 20, padding: 20, margin: 16, borderWidth: 1, borderColor: P.border, gap: 20, elevation: 3 },
  scoreLeft: { alignItems: 'center', gap: 6 },
  scoreNum: { fontSize: 52, fontWeight: '900', lineHeight: 58 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 14, fontWeight: '700', color: P.sub, marginLeft: 4 },
  scoreSub: { fontSize: 12, color: P.muted },
  scoreBars: { flex: 1, justifyContent: 'center', gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barStar: { fontSize: 11, color: P.sub, width: 18, textAlign: 'right' },
  barBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { fontSize: 11, color: P.muted, width: 16, textAlign: 'right' },

  catCard: { backgroundColor: P.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: P.border },
  catTitle: { fontSize: 14, fontWeight: '800', color: P.text, marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: P.border },
  catName: { flex: 1, fontSize: 13, color: P.text, fontWeight: '600' },
  catCount: { fontSize: 12, color: P.muted, marginRight: 12 },
  catAvg: { fontSize: 14, fontWeight: '800' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: P.text, marginHorizontal: 16, marginBottom: 12 },

  card: { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: P.bg, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 14, fontWeight: '800', color: P.text },
  cardCat: { fontSize: 12, color: P.muted, marginTop: 2 },
  ratingBadge: { backgroundColor: P.goldBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ratingBadgeText: { color: P.gold, fontWeight: '900', fontSize: 13 },
  reviewText: { fontSize: 13, color: P.sub, lineHeight: 20, fontStyle: 'italic' },
  jobRef: { fontSize: 11, color: P.muted, marginTop: 8 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: P.text },
  emptySub: { fontSize: 13, color: P.muted, textAlign: 'center', lineHeight: 20 },
});
