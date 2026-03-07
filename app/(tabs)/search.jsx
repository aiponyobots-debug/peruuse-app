import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const SUGGESTED = [
  { id: '1', name: 'Maya Chen', handle: '@mayachen', initials: 'MC', items: 24 },
  { id: '2', name: 'Jake Rivera', handle: '@jakerivera', initials: 'JR', items: 12 },
  { id: '3', name: 'Sara Kim', handle: '@sarakim', initials: 'SK', items: 31 },
  { id: '4', name: 'Leo Park', handle: '@leopark', initials: 'LP', items: 8 },
  { id: '5', name: 'Nina Patel', handle: '@ninapatel', initials: 'NP', items: 19 },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState({});

  const results = query
    ? SUGGESTED.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.handle.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTED;

  const toggleFollow = (id) => {
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Find Friends</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or username..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{query ? 'Results' : 'Suggested for you'}</Text>
        {results.map(user => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>{user.handle} · {user.items} hauls</Text>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, following[user.id] && styles.followingBtn]}
              onPress={() => toggleFollow(user.id)}
            >
              <Text style={[styles.followText, following[user.id] && styles.followingText]}>
                {following[user.id] ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  heading: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  content: { padding: 20 },
  sectionTitle: { fontFamily: 'serif', fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  userHandle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: Colors.accent,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  followText: { fontSize: 13, fontWeight: '600', color: Colors.accentText },
  followingText: { color: Colors.textMuted },
});
