/**
 * AmenityWaitlistScreen.js — Module 8: Amenities
 *
 * Resident joins/leaves waitlist for a fully booked amenity slot.
 * When a cancellation happens, the first person on the waitlist
 * gets notified and has 30 minutes to confirm the slot.
 *
 * Also shows the resident's current waitlist positions.
 *
 * Theme: VisitorListScreen tokens.
 * Store: residentStore.waitlistEntries + joinWaitlist + leaveWaitlist
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert,
} from 'react-native';
import { useAuthStore }  from '../../../store/AuthStore';
import useResidentStore  from '../../../store/residentStore';

const V = {
  header:'#1A7A7A', headerDark:'#0D6E6E',
  bg:'#E8F5F5', surface:'#FFFFFF',
  border:'#D0EEEE', divider:'#E8F5F5',
  text:'#1A2E2E', textSub:'#3D6E6E', textMuted:'#7A9E9E',
  primary:'#1A7A7A', chip:'#F0FAFA',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  successBg:'#CCFBF1',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'});
}

export default function AmenityWaitlistScreen({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const myId   = user?.id || 'res1';
  const amenities      = useResidentStore(s => s.amenities) || [];
  const waitlistEntries = useResidentStore(s => s.waitlistEntries) || [];
  const leaveWaitlist  = useResidentStore(s => s.leaveWaitlist);

  const myWaitlist = waitlistEntries
    .filter(e => e.residentId === myId)
    .sort((a,b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  const STATUS_META = {
    waiting:  { label:'⏳ Waiting', color:'#E65100', bg:'#FEF3C7' },
    notified: { label:'🔔 Slot Available!', color:V.primary, bg:V.successBg },
    expired:  { label:'⏰ Offer Expired', color:'#64748B', bg:'#F1F5F9' },
    confirmed:{ label:'✅ Confirmed', color:V.primary, bg:V.successBg },
  };

  const handleLeave = (entry) => {
    Alert.alert('Leave Waitlist',`Remove yourself from the ${entry.amenityName} waitlist on ${fmt(entry.date)}?`,[
      {text:'Stay on List',style:'cancel'},
      {text:'Leave Waitlist',style:'destructive', onPress:() => {
        leaveWaitlist(entry.id);
        Alert.alert('Removed','You have been removed from the waitlist.');
      }},
    ]);
  };

  const handleConfirm = (entry) => {
    Alert.alert('Confirm Slot',`Confirm your booking for ${entry.amenityName} on ${fmt(entry.date)} at ${entry.slot}?\n\nYou have 30 minutes to confirm before the slot is offered to the next person.`,[
      {text:'Not Now',style:'cancel'},
      {text:'✅ Confirm Booking', onPress:() => {
        // In production: navigate to payment/confirmation flow
        navigation.navigate('AmenityBooking', {
          amenityId: entry.amenityId,
          prefillDate: entry.date,
          prefillSlot: entry.slot,
          fromWaitlist: true,
          waitlistId: entry.id,
        });
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark}/>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>My Waitlists</Text>
            <Text style={s.headerSub}>{myWaitlist.filter(e=>e.status==='waiting').length} active waitlist position{myWaitlist.filter(e=>e.status==='waiting').length!==1?'s':''}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation?.navigate('Amenities')}>
            <Text style={s.addBtnText}>Browse Amenities</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoBanner}>
          <Text style={s.infoText}>When a slot opens up, you'll be notified and have <Text style={{fontWeight:'800'}}>30 minutes</Text> to confirm. If you don't confirm in time, the slot moves to the next person.</Text>
        </View>

        <Text style={s.sectionLabel}>MY WAITLIST POSITIONS ({myWaitlist.length})</Text>

        {myWaitlist.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize:48,marginBottom:12}}>⏳</Text>
            <Text style={s.emptyTitle}>No waitlist entries</Text>
            <Text style={s.emptySub}>When a slot is fully booked, you can join the waitlist from the amenity booking page. You'll be notified if a spot opens up.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation?.navigate('Amenities')}>
              <Text style={s.emptyBtnText}>Browse Amenities</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myWaitlist.map((entry, idx) => {
            const meta = STATUS_META[entry.status] || STATUS_META.waiting;
            const amenity = amenities.find(a => a.id === entry.amenityId);
            return (
              <View key={entry.id} style={[s.card, entry.status==='notified' && {borderColor:V.primary,borderWidth:2}]}>
                <View style={s.cardHeader}>
                  <View style={s.amenityIcon}>
                    <Text style={{fontSize:24}}>{entry.amenityEmoji || amenity?.emoji || '🏛️'}</Text>
                  </View>
                  <View style={{flex:1, marginLeft:12}}>
                    <Text style={s.cardTitle}>{entry.amenityName}</Text>
                    <Text style={s.cardSub}>📅 {fmt(entry.date)} · ⏰ {entry.slot}</Text>
                    <Text style={s.cardSub}>Queue position: <Text style={{fontWeight:'900',color:V.primary}}>#{entry.queuePosition || (idx+1)}</Text></Text>
                  </View>
                  <View style={[s.statusBadge,{backgroundColor:meta.bg}]}>
                    <Text style={[s.statusText,{color:meta.color}]}>{meta.label}</Text>
                  </View>
                </View>

                {entry.status === 'notified' && (
                  <View style={s.notifyBanner}>
                    <Text style={s.notifyText}>🔔 A slot is available! Confirm within {entry.minutesLeft || 30} minutes or it will be passed on.</Text>
                    <TouchableOpacity style={s.confirmBtn} onPress={() => handleConfirm(entry)}>
                      <Text style={s.confirmBtnText}>✅ Confirm Now</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={s.cardFooter}>
                  <Text style={s.cardFooterText}>Joined waitlist: {new Date(entry.joinedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</Text>
                  {entry.status === 'waiting' && (
                    <TouchableOpacity onPress={() => handleLeave(entry)}>
                      <Text style={s.leaveText}>Leave Waitlist</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor:V.bg },
  header:{ backgroundColor:V.header, paddingTop:44, paddingHorizontal:20, paddingBottom:16 },
  backBtn:{ marginBottom:10 }, backText:{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:'600' },
  headerRow:{ flexDirection:'row', alignItems:'center' },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#FFF' },
  headerSub:{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 },
  addBtn:{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:14, paddingVertical:8, borderRadius:20 },
  addBtnText:{ color:'#FFF', fontWeight:'700', fontSize:13 },
  body:{ padding:16 },
  infoBanner:{ backgroundColor:V.chip, borderRadius:12, padding:14, marginBottom:14, borderWidth:1, borderColor:V.border },
  infoText:{ fontSize:13, color:V.textSub, lineHeight:20 },
  sectionLabel:{ fontSize:11, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginBottom:10 },
  card:{ backgroundColor:V.surface, borderRadius:14, borderWidth:1, borderColor:V.border, padding:14, marginBottom:10 },
  cardHeader:{ flexDirection:'row', alignItems:'flex-start', marginBottom:10 },
  amenityIcon:{ width:48, height:48, borderRadius:14, backgroundColor:V.chip, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:V.border },
  cardTitle:{ fontSize:15, fontWeight:'800', color:V.text },
  cardSub:{ fontSize:12, color:V.textMuted, marginTop:3 },
  statusBadge:{ paddingHorizontal:9, paddingVertical:4, borderRadius:10 },
  statusText:{ fontSize:10, fontWeight:'800' },
  notifyBanner:{ backgroundColor:V.successBg, borderRadius:10, padding:12, borderWidth:1, borderColor:V.border, marginBottom:10 },
  notifyText:{ fontSize:13, color:V.textSub, lineHeight:18, marginBottom:10 },
  confirmBtn:{ backgroundColor:V.primary, borderRadius:10, paddingVertical:10, alignItems:'center' },
  confirmBtnText:{ color:'#FFF', fontWeight:'800', fontSize:14 },
  cardFooter:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderTopWidth:1, borderTopColor:V.divider, paddingTop:8 },
  cardFooterText:{ fontSize:11, color:V.textMuted },
  leaveText:{ fontSize:12, fontWeight:'700', color:V.danger },
  empty:{ alignItems:'center', paddingVertical:40, paddingHorizontal:24 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:V.text, marginBottom:8 },
  emptySub:{ fontSize:13, color:V.textMuted, textAlign:'center', lineHeight:20, marginBottom:16 },
  emptyBtn:{ backgroundColor:V.primary, paddingHorizontal:24, paddingVertical:10, borderRadius:20 },
  emptyBtnText:{ color:'#FFF', fontWeight:'700', fontSize:14 },
});