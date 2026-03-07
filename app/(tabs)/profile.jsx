import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useWishlist } from '../../context/WishlistContext';

const HAULS = [
  { id: '1', emoji: '👗', brand: 'ARITZIA', name: 'Featherweight Tee', price: '$58' },
  { id: '2', emoji: '👟', brand: 'ALLBIRDS', name: 'Tree Runner', price: '$120' },
  { id: '3', emoji: '💇', brand: 'DYSON', name: 'Airwrap', price: '$599' },
  { id: '4', emoji: '🥤', brand: 'STANLEY', name: 'Quencher', price: '$45' },
  { id: '5', emoji: '✨', brand: 'GLOSSIER', name: 'You Perfume', price: '$40' },
  { id: '6', emoji: '🎧', brand: 'APPLE', name: 'AirPods Pro', price: '$249' },
];

function SettingsModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Settings</Text>
        </View>
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>ACCOUNT</Text>
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Name</Text>
              <Text style={styles.settingsValue}>Tess</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Username</Text>
              <Text style={styles.settingsValue}>@tess</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Email</Text>
              <Text style={styles.settingsValue}>tess@email.com</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>PRIVACY</Text>
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Default post privacy</Text>
              <Text style={styles.settingsValue}>Friends Only</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Gmail connection</Text>
              <Text style={styles.settingsValue}>Connected</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const FOLLOWERS = [
  { id: '1', name: 'Maya Chen', handle: '@mayachen', initials: 'MC' },
  { id: '2', name: 'Jake Rivera', handle: '@jakerivera', initials: 'JR' },
  { id: '3', name: 'Sara Kim', handle: '@sarakim', initials: 'SK' },
];

const FOLLOWING = [
  { id: '1', name: 'Leo Park', handle: '@leopark', initials: 'LP' },
  { id: '2', name: 'Nina Patel', handle: '@ninapatel', initials: 'NP' },
];

function PeopleModal({ visible, title, people, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.settingsContent}>
          {people.map(p => (
            <View key={p.id} style={styles.personRow}>
              <View style={styles.personAvatar}>
                <Text style={styles.personInitials}>{p.initials}</Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text style={styles.personHandle}>{p.handle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function Profile() {
  const [tab, setTab] = useState('Hauls');
  const [showSettings, setShowSettings] = useState(false);
  const [showPeople, setShowPeople] = useState(null);
  const { wishlist } = useWishlist();

  return (
    <SafeAreaView style={styles.container}>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <PeopleModal
        visible={showPeople !== null}
        title={showPeople === 'followers' ? 'Followers' : 'Following'}
        people={showPeople === 'followers' ? FOLLOWERS : FOLLOWING}
        onClose={() => setShowPeople(null)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.gearButton} onPress={() => setShowSettings(true)}>
            <Feather name="settings" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>T</Text>
          </View>
          <Text style={styles.name}>Tess</Text>
          <Text style={styles.handle}>@tess</Text>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.stat} onPress={() => setShowPeople('followers')}>
              <Text style={styles.statNum}>248</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.stat} onPress={() => setShowPeople('following')}>
              <Text style={styles.statNum}>192</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
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
          {tab === 'Hauls' && HAULS.map(item => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.gridImage}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.gridBrand}>{item.brand}</Text>
              <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.gridPrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
          {tab === 'Wishlist' && wishlist.length === 0 && (
            <View style={styles.emptyWishlist}>
              <Text style={styles.emptyText}>Items you Want It on will appear here.</Text>
            </View>
          )}
          {tab === 'Wishlist' && wishlist.map(item => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.gridImage}>
                <Text style={styles.gridEmoji}>📦</Text>
              </View>
              <Text style={styles.gridBrand}>{item.brand}</Text>
              <Text style={styles.gridName} numberOfLines={1}>{item.product}</Text>
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
  modalHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4 },
  modalTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text },
  settingsContent: { padding: 20 },
  settingsSection: { marginBottom: 32 },
  settingsSectionTitle: { fontSize: 11, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '600', marginBottom: 8 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsLabel: { fontSize: 15, color: Colors.text },
  settingsValue: { fontSize: 15, color: Colors.textMuted },
  logoutButton: { marginTop: 8, borderWidth: 1, borderColor: '#E8705A', borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: '#E8705A', fontSize: 15, fontWeight: '600' },
  personRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  personAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  personInitials: { fontSize: 15, fontWeight: '600', color: Colors.text },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  personHandle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  profileSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  gearButton: { position: 'absolute', top: 24, right: 20, padding: 4 },
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
  emptyWishlist: { width: '100%', paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
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
