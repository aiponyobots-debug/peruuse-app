import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const FILTERS = ['Fashion', 'Beauty', 'Home', 'Tech'];

const TRENDING = [
  { id: '1', brand: 'SKIMS', product: 'Soft Lounge Long Slip Dress', price: '$108', emoji: '👗' },
  { id: '2', brand: 'STANLEY', product: 'Quencher H2.0 Tumbler', price: '$45', emoji: '🥤' },
  { id: '3', brand: 'APPLE', product: 'AirPods Pro (2nd Gen)', price: '$249', emoji: '🎧' },
  { id: '4', brand: 'GLOSSIER', product: 'You Solid Perfume', price: '$40', emoji: '✨' },
];

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState('Fashion');
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Discover</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, people..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Trending this week</Text>
        {TRENDING.map(item => (
          <View key={item.id} style={styles.trendCard}>
            <View style={styles.trendImage}>
              <Text style={styles.trendEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.trendInfo}>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.productName}>{item.product}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  heading: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 14,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  filters: { marginBottom: 4 },
  filtersContent: { gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: Colors.accentText },
  content: { padding: 20 },
  sectionTitle: { fontFamily: 'serif', fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  trendCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  trendImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendEmoji: { fontSize: 28 },
  trendInfo: { flex: 1 },
  brand: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  productName: { fontFamily: 'serif', fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  price: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  buyButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buyButtonText: { color: Colors.accentText, fontSize: 13, fontWeight: '600' },
});
