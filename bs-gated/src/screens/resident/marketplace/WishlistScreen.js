/**
 * WishlistScreen.js — Resident
 *
 * Shows saved/wishlisted products. Resident can:
 *  - View all wishlisted items
 *  - Remove from wishlist
 *  - Add to cart directly from wishlist
 *  - Navigate to product detail
 */

import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFFFFF', text: '#1A2E2E', sub: '#3D6E6E',
  muted: '#7A9E9E', border: '#D0EEEE', danger: '#C62828',
  dangerBg: '#FEE2E2', gold: '#D97706', goldBg: '#FEF3C7',
};

function ProductCard({ product, onRemove, onAddToCart, onPress }) {
  const inStock = product.stock > 0 && product.active;
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      <View style={s.cardLeft}>
        <Text style={s.emoji}>{product.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{product.name}</Text>
          <Text style={s.cat}>{product.category}</Text>
          <Text style={s.price}>₹{product.price}</Text>
          {!inStock && (
            <View style={s.oosBadge}>
              <Text style={s.oosText}>Out of Stock</Text>
            </View>
          )}
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.removeBtn} onPress={onRemove} activeOpacity={0.8}>
          <Ionicons name="heart" size={20} color={P.danger} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.cartBtn, !inStock && s.cartBtnDisabled]}
          onPress={inStock ? onAddToCart : null}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={16} color="#FFF" />
          <Text style={s.cartBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function WishlistScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const residentId = user?.id || 'res1';

  const getWishlist    = useAppStore(s => s.getWishlist);
  const toggleWishlist = useAppStore(s => s.toggleWishlist);
  const addToCart      = useAppStore(s => s.addToCart);
  const cart           = useAppStore(s => s.cart);

  const items = getWishlist(residentId);

  const handleRemove = (product) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${product.name}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => toggleWishlist(residentId, product.id) },
      ]
    );
  };

  const handleAddToCart = (product) => {
    const existing = cart.find(i => i.productId === product.id);
    addToCart(product, 1);
    Alert.alert('Added to Cart', `${product.name} added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('ResidentCart') },
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>My Wishlist</Text>
          <Text style={s.headerSub}>{items.length} saved item{items.length !== 1 ? 's' : ''}</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ResidentCart')}
            style={s.cartIconBtn}
          >
            <Ionicons name="cart-outline" size={22} color="#FFF" />
            {cart.length > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🤍</Text>
          <Text style={s.emptyTitle}>Your wishlist is empty</Text>
          <Text style={s.emptySub}>Save products you love and find them here anytime.</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('MarketHome')}>
            <Text style={s.shopBtnText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onRemove={() => handleRemove(item)}
              onAddToCart={() => handleAddToCart(item)}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
          ListFooterComponent={
            items.length > 0 ? (
              <TouchableOpacity
                style={s.addAllBtn}
                onPress={() => {
                  const inStock = items.filter(p => p.stock > 0 && p.active);
                  inStock.forEach(p => addToCart(p, 1));
                  Alert.alert('Added All', `${inStock.length} in-stock item(s) added to cart.`, [
                    { text: 'View Cart', onPress: () => navigation.navigate('ResidentCart') },
                  ]);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text style={s.addAllText}>Add All In-Stock to Cart</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.bg },
  header:      { backgroundColor: P.tealDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  cartIconBtn: { marginLeft: 'auto', position: 'relative' },
  cartBadge:   { position: 'absolute', top: -6, right: -6, backgroundColor: P.gold, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  card:        { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: P.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji:       { fontSize: 36 },
  name:        { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 2 },
  cat:         { fontSize: 12, color: P.muted, fontWeight: '600', marginBottom: 4 },
  price:       { fontSize: 16, fontWeight: '900', color: P.teal },
  oosBadge:    { backgroundColor: P.dangerBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  oosText:     { color: P.danger, fontSize: 11, fontWeight: '700' },

  cardActions:    { gap: 8, alignItems: 'center' },
  removeBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: P.dangerBg, alignItems: 'center', justifyContent: 'center' },
  cartBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P.teal, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  cartBtnDisabled:{ opacity: 0.4 },
  cartBtnText:    { color: '#FFF', fontSize: 13, fontWeight: '800' },

  addAllBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P.tealDark, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  addAllText:  { color: '#FFF', fontSize: 15, fontWeight: '800' },

  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji:  { fontSize: 64, marginBottom: 20 },
  emptyTitle:  { fontSize: 20, fontWeight: '900', color: P.text, marginBottom: 8, textAlign: 'center' },
  emptySub:    { fontSize: 14, color: P.muted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  shopBtn:     { backgroundColor: P.teal, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  shopBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
