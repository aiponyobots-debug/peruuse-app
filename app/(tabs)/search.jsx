import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    fetchFollowing();
  }, [user]));

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
    setFollowing(new Set((data || []).map(r => r.following_id)));
  };

  const search = async (text) => {
    setQuery(text);
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .or(`full_name.ilike.%${text}%,username.ilike.%${text}%`)
      .neq('id', user.id)
      .limit(20);
    setResults(data || []);
    setLoading(false);
  };

  const toggleFollow = async (profileId) => {
    const isFollowing = following.has(profileId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileId);
      setFollowing(prev => { const s = new Set(prev); s.delete(profileId); return s; });
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId });
      setFollowing(prev => new Set(prev).add(profileId));
    }
  };

  const displayList = results;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Find Friends</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or username..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={search}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />}
        {!loading && query.length > 0 && displayList.length === 0 && (
          <Text style={styles.empty}>No users found for "{query}"</Text>
        )}
        {!loading && query.length === 0 && (
          <Text style={styles.empty}>Search for friends by name or username.</Text>
        )}
        {displayList.map(u => {
          const isFollowing = following.has(u.id);
          const initials = (u.full_name || u.username || '?').slice(0, 2).toUpperCase();
          return (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.full_name || u.username}</Text>
                <Text style={styles.userHandle}>{u.username ? `@${u.username}` : ''}</Text>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={() => toggleFollow(u.id)}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  heading: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, fontFamily: Fonts.sans },
  content: { padding: 20 },
  empty: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 20, fontFamily: Fonts.sans },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  userHandle: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontFamily: Fonts.sansMedium },
  followBtn: { borderWidth: 1, borderColor: Colors.accent, borderRadius: 50, paddingVertical: 8, paddingHorizontal: 18, backgroundColor: Colors.accent },
  followingBtn: { backgroundColor: 'transparent', borderColor: Colors.border },
  followText: { fontSize: 13, color: Colors.accentText, fontFamily: Fonts.sansSemiBold },
  followingText: { color: Colors.textMuted, fontFamily: Fonts.sansMedium },
});
