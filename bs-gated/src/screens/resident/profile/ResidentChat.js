/**
 * ResidentChat.js
 *
 * Real-time resident-to-resident chat screen.
 * Used for both P2P marketplace listings and Real Estate listings.
 *
 * Route params:
 *   { contextId, contextTitle, contextType ('p2p'|'realestate'),
 *     buyerId, buyerName, buyerUnit,
 *     sellerId, sellerName, sellerUnit,
 *     myId, myName, myUnit }
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import useAppStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const fmt = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export default function ResidentChatScreen({ navigation, route }) {
  const theme = useTheme();
  const {
    contextId, contextTitle, contextType,
    buyerId, buyerName, buyerUnit,
    sellerId, sellerName, sellerUnit,
    myId, myName, myUnit,
  } = route.params;

  const sendResidentChatMessage = useAppStore(s => s.sendResidentChatMessage);
  const markResidentChatRead    = useAppStore(s => s.markResidentChatRead);
  const getChatIdForListing     = useAppStore(s => s.getChatIdForListing);
  const getResidentChatById     = useAppStore(s => s.getResidentChatById);

  const chatId = getChatIdForListing(contextId, buyerId, sellerId);
  // Subscribe to live updates from the store
  const chat = useAppStore(s => s.residentChats[chatId]);
  const messages = chat?.messages || [];

  const [text, setText] = useState('');
  const flatRef = useRef(null);

  const iAmSeller = myId === sellerId;
  const otherName = iAmSeller ? buyerName : sellerName;
  const otherUnit = iAmSeller ? buyerUnit : sellerUnit;
  const myRole    = iAmSeller ? 'seller' : 'buyer';

  // Mark as read when screen opens or new messages arrive
  useEffect(() => {
    if (chatId) markResidentChatRead(chatId, myRole);
  }, [chatId, messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendResidentChatMessage({
      buyerId, buyerName, buyerUnit,
      sellerId, sellerName, sellerUnit,
      context: contextType,
      contextId,
      text: trimmed,
      fromId: myId,
    });
    setText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.fromId === myId;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && { color: theme.card }]}>{item.text}</Text>
          <Text style={[styles.timeText, isMe && { color: 'rgba(255,255,255,0.7)' }]}>{fmt(item.sentAt)}</Text>
        </View>
      </View>
    );
  };

  const contextEmoji = contextType === 'p2p' ? '♻️' : '🏠';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.card, fontSize: 22, fontWeight: '700' }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerName}>{otherName} · {otherUnit}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{contextEmoji} {contextTitle}</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Context banner */}
      <View style={styles.contextBanner}>
        <Text style={styles.contextBannerText}>{contextEmoji} {contextTitle}</Text>
        {iAmSeller && (
          <View style={styles.sellerBadge}><Text style={{ fontSize: 10, fontWeight: '800', color: theme.primary }}>YOU ARE THE SELLER</Text></View>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>💬</Text>
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptySub}>
                {iAmSeller
                  ? `${buyerName} is interested in your listing.`
                  : `Message ${sellerName} about this listing.`}
              </Text>
            </View>
          }
          renderItem={renderMessage}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={{ fontSize: 20 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#E8F5F5' },
  header:  { backgroundColor: '#1A2E2E', flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  headerName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerSub:  { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  onlineDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2E7D32', marginLeft: 8 },

  contextBanner: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contextBannerText: { fontSize: 13, fontWeight: '600', color: '#3D6E6E', flex: 1, marginRight: 8 },
  sellerBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  listContent: { padding: 16, paddingBottom: 20, flexGrow: 1 },
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
  emptySub:    { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 30 },

  msgRow:    { marginBottom: 10, flexDirection: 'row' },
  msgRowMe:  { justifyContent: 'flex-end' },
  bubble:    { maxWidth: '75%', borderRadius: 16, padding: 12 },
  bubbleMe:  { backgroundColor: '#1A7A7A', borderBottomRightRadius: 4 },
  bubbleThem:{ backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#D0EEEE' },
  bubbleText:{ fontSize: 15, color: '#1A2E2E', lineHeight: 21 },
  timeText:  { fontSize: 10, color: '#7A9E9E', marginTop: 4, alignSelf: 'flex-end' },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  input:    { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1A2E2E', maxHeight: 120 },
  sendBtn:  { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A7A7A', alignItems: 'center', justifyContent: 'center' },
});
