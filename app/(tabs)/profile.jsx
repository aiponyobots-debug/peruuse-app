import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const FINDS = [
  { id: '1', emoji: '👗', brand: 'ARITZIA', name: 'Featherweight Tee', price: '$58' },
  { id: '2', emoji: '👟', brand: 'ALLBIRDS', name: 'Tree Runner', price: '$120' },
  { id: '3', emoji: '💇', brand: 'DYSON', name: 'Airwrap', price: '$599' },
  { id: '4', emoji: '🥤', brand: 'STANLEY', name: 'Quencher', price: '$45' },
  { id: '5', emoji: '✨', brand: 'GLOSSIER', name: 'You Perfume', price: '$40' },
  { id: '6', emoji: '🎧', brand: 'APPLE', name: 'AirPods Pro', price: '$249' },
];

function SettingsModal({ visible, onClose, user, profile, onProfileUpdated }) {
  const { signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, username });
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else { onProfileUpdated(); onClose(); }
  };

  const isDirty = fullName !== (profile?.full_name || '') || username !== (profile?.username || '');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Settings</Text>
          {isDirty && (
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>ACCOUNT</Text>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Name</Text>
              <TextInput
                style={styles.settingsInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Username</Text>
              <TextInput
                style={styles.settingsInput}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Email</Text>
              <Text style={styles.settingsValue}>{user?.email || '—'}</Text>
            </View>
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
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
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

function PeopleModal({ visible, title, people, onClose, actionLabel, onAction }) {
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
              {actionLabel && (
                <TouchableOpacity style={styles.unfollowBtn} onPress={() => onAction(p.id)}>
                  <Text style={styles.unfollowText}>{actionLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function EditPostModal({ post, onClose, onSaved }) {
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync fields when post changes
  if (post && brand === '' && product === '' && price === '') {
    setBrand(post.brand || '');
    setProduct(post.product_name || '');
    setPrice(post.price || '');
    setCaption(post.caption || '');
  }

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase.from('posts')
      .update({ brand: brand.toUpperCase(), product_name: product, price, caption })
      .eq('id', post.id)
      .select()
      .single();
    setSaving(false);
    if (error) return Alert.alert('Error', error.message);
    onSaved(data);
  };

  return (
    <Modal visible={!!post} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Find</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.settingsContent}>
            {[['Brand', brand, setBrand], ['Product', product, setProduct], ['Price', price, setPrice], ['Caption', caption, setCaption]].map(([label, value, setter]) => (
              <View key={label} style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>{label}</Text>
                <TextInput style={styles.settingsInput} value={value} onChangeText={setter} placeholderTextColor={Colors.textMuted} />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function Profile() {
  const [tab, setTab] = useState('Finds');
  const [showSettings, setShowSettings] = useState(false);
  const [showPeople, setShowPeople] = useState(null);
  const [finds, setFinds] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const { wishlist } = useWishlist();
  const { user, profile, refreshProfile } = useAuth();

  useFocusEffect(useCallback(() => {
    if (user) { fetchFinds(); fetchFollowing(); fetchFollowers(); }
  }, [user]));

  const fetchFinds = async () => {
    const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setFinds(data || []);
  };

  const fetchFollowing = async () => {
    const { data } = await supabase.from('follows').select('following_id, profiles!follows_following_id_fkey(id, full_name, username)').eq('follower_id', user.id);
    setFollowingList((data || []).map(r => ({
      id: r.profiles.id,
      name: r.profiles.full_name || r.profiles.username || 'Unknown',
      handle: r.profiles.username ? `@${r.profiles.username}` : '',
      initials: (r.profiles.full_name || r.profiles.username || '?').slice(0, 2).toUpperCase(),
    })));
  };

  const fetchFollowers = async () => {
    const { data } = await supabase.from('follows').select('follower_id, profiles!follows_follower_id_fkey(id, full_name, username)').eq('following_id', user.id);
    setFollowersList((data || []).map(r => ({
      id: r.profiles.id,
      name: r.profiles.full_name || r.profiles.username || 'Unknown',
      handle: r.profiles.username ? `@${r.profiles.username}` : '',
      initials: (r.profiles.full_name || r.profiles.username || '?').slice(0, 2).toUpperCase(),
    })));
  };

  const [editingPost, setEditingPost] = useState(null);

  const openPostMenu = (item) => {
    Alert.alert(item.product_name || 'Find', null, [
      { text: 'Edit', onPress: () => setEditingPost(item) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(item.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const confirmDelete = (id) => {
    Alert.alert('Delete Find', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('posts').delete().eq('id', id);
        setFinds(h => h.filter(p => p.id !== id));
      }},
    ]);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.container}>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} user={user} profile={profile} onProfileUpdated={refreshProfile} />
      <PeopleModal
        visible={showPeople !== null}
        title={showPeople === 'followers' ? 'Followers' : 'Following'}
        people={showPeople === 'followers' ? followersList : followingList}
        onClose={() => setShowPeople(null)}
        actionLabel={showPeople === 'followers' ? 'Remove' : 'Unfollow'}
        onAction={async (id) => {
          if (showPeople === 'following') {
            await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
            setFollowingList(f => f.filter(p => p.id !== id));
          } else {
            await supabase.from('follows').delete().eq('follower_id', id).eq('following_id', user.id);
            setFollowersList(f => f.filter(p => p.id !== id));
          }
        }}
      />
      <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSaved={(updated) => {
        setFinds(h => h.map(p => p.id === updated.id ? updated : p));
        setEditingPost(null);
      }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.gearButton} onPress={() => setShowSettings(true)}>
            <Feather name="settings" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || user?.email}</Text>
          <Text style={styles.handle}>{profile?.username ? `@${profile.username}` : ''}</Text>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.stat} onPress={() => setShowPeople('followers')}>
              <Text style={styles.statNum}>{followersList.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.stat} onPress={() => setShowPeople('following')}>
              <Text style={styles.statNum}>{followingList.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{finds.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          {['Finds', 'Wishlist'].map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.grid}>
          {tab === 'Finds' && finds.length === 0 && (
            <View style={styles.emptyWishlist}>
              <Text style={styles.emptyText}>No finds yet. Add your first one!</Text>
            </View>
          )}
          {tab === 'Finds' && finds.map(item => (
            <View key={item.id} style={styles.gridItem}>
              <View style={styles.gridImage}>
                {item.image_url
                  ? <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  : <Text style={styles.gridEmoji}>📦</Text>
                }
                <TouchableOpacity style={styles.gridMenuBtn} onPress={() => openPostMenu(item)}>
                  <Feather name="more-horizontal" size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.gridBrand}>{item.brand}</Text>
              <Text style={styles.gridName} numberOfLines={1}>{item.product_name}</Text>
              <Text style={styles.gridPrice}>{item.price}</Text>
              <View style={styles.statusRow}>
                {['kept', 'returned'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, item.status === s && styles.statusBtnActive]}
                    onPress={async () => {
                      const newStatus = item.status === s ? null : s;
                      await supabase.from('posts').update({ status: newStatus }).eq('id', item.id);
                      setFinds(h => h.map(p => p.id === item.id ? { ...p, status: newStatus } : p));
                    }}
                  >
                    <Text style={[styles.statusText, item.status === s && styles.statusTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  modalTitle: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text },
  settingsContent: { padding: 20 },
  settingsSection: { marginBottom: 32 },
  settingsSectionTitle: { fontSize: 11, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 8, fontFamily: Fonts.sansMedium },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsLabel: { fontSize: 15, color: Colors.text, fontFamily: Fonts.sans },
  settingsValue: { fontSize: 15, color: Colors.textMuted, fontFamily: Fonts.sans },
  saveBtn: { marginLeft: 'auto', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: Colors.accent, borderRadius: 50 },
  saveBtnText: { color: Colors.accentText, fontSize: 14, fontFamily: Fonts.sansSemiBold },
  settingsInput: { flex: 1, fontSize: 15, color: Colors.text, textAlign: 'right', fontFamily: Fonts.sans },
  logoutButton: { marginTop: 8, borderWidth: 1, borderColor: '#E8705A', borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: '#E8705A', fontSize: 15, fontFamily: Fonts.sansSemiBold },
  personRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  personAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  personInitials: { fontSize: 15, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  personHandle: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontFamily: Fonts.sansMedium },
  unfollowBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 50, paddingVertical: 6, paddingHorizontal: 14 },
  unfollowText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
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
  avatarText: { fontSize: 32, color: Colors.accentText, fontFamily: Fonts.sansSemiBold },
  name: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.text },
  handle: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: 20, fontFamily: Fonts.sansMedium },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontFamily: Fonts.sansMedium },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginHorizontal: 20 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Colors.accentText },
  tabText: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
  tabTextActive: { color: Colors.accentText, fontFamily: Fonts.sansSemiBold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  emptyWishlist: { width: '100%', paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', fontFamily: Fonts.sans },
  gridItem: { width: '47%', backgroundColor: Colors.card, borderRadius: 16, padding: 12 },
  gridImage: {
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: Colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  gridMenuBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 50,
    padding: 4,
  },
  gridEmoji: { fontSize: 40 },
  gridBrand: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3, fontFamily: Fonts.sansMedium },
  gridName: { fontFamily: Fonts.serif, fontSize: 13, color: Colors.text, marginBottom: 2 },
  gridPrice: { fontSize: 12, color: Colors.text, marginBottom: 8, fontFamily: Fonts.sansMedium },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  statusBtn: { flex: 1, paddingVertical: 4, borderRadius: 50, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  statusBtnActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  statusText: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, fontFamily: Fonts.sansMedium },
  statusTextActive: { color: Colors.background },
});
