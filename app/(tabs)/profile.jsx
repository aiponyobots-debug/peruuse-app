import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const HAULS = [
  { id: '1', emoji: '👗', brand: 'ARITZIA', name: 'Featherweight Tee', price: '$58' },
  { id: '2', emoji: '👟', brand: 'ALLBIRDS', name: 'Tree Runner', price: '$120' },
  { id: '3', emoji: '💇', brand: 'DYSON', name: 'Airwrap', price: '$599' },
  { id: '4', emoji: '🥤', brand: 'STANLEY', name: 'Quencher', price: '$45' },
  { id: '5', emoji: '✨', brand: 'GLOSSIER', name: 'You Perfume', price: '$40' },
  { id: '6', emoji: '🎧', brand: 'APPLE', name: 'AirPods Pro', price: '$249' },
];

export default function Profile() {
  const [tab, setTab] = useState('Hauls');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>T</Text>
          </View>
          <Text style={styles.name}>Tess</Text>
          <Text style={styles.handle}>@tess</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>248</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>192</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>6</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          {['Hauls', 'Wishlist'].map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.grid}>
          {HAULS.map(item => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.gridImage}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.gridBrand}>{item.brand}</Text>
              <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.gridPrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: Colors.accentText, fontWeight: '700' },
  name: { fontFamily: 'serif', fontSize: 22, fontWeight: '700', color: Colors.text },
  handle: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: 20 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginHorizontal: 20 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Colors.accentText },
  tabText: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: Colors.accentText, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  gridItem: { width: '47%', backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', padding: 12 },
  gridImage: {
    height: 120,
    backgroundColor: Colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridEmoji: { fontSize: 40 },
  gridBrand: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  gridName: { fontFamily: 'serif', fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  gridPrice: { fontSize: 12, color: Colors.text, fontWeight: '500' },
});
