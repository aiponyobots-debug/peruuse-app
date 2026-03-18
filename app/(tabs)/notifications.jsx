import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications({ onClose }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchActivity();
  }, [user]));

  const fetchActivity = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch reactions on current user's posts
    const { data: reactions } = await supabase
      .from('reactions')
      .select('id, type, created_at, user_id, post_id, profiles:user_id(full_name, username), posts!inner(user_id, product_name)')
      .eq('posts.user_id', user.id)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    // Fetch new followers
    const { data: followers } = await supabase
      .from('follows')
      .select('id, created_at, follower_id, profiles:follower_id(full_name, username)')
      .eq('following_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    const reactionItems = (reactions || []).map(r => {
      const name = r.profiles?.full_name || r.profiles?.username || 'Someone';
      const initials = name.slice(0, 2).toUpperCase();
      const product = r.posts?.product_name || 'your find';
      const verb = r.type === 'want' ? 'wants' : 'has';
      return {
        id: `r-${r.id}`,
        type: r.type,
        initials,
        user: name,
        action: `${verb} your ${product}`,
        time: timeAgo(r.created_at),
        created_at: r.created_at,
      };
    });

    const followItems = (followers || []).map(f => {
      const name = f.profiles?.full_name || f.profiles?.username || 'Someone';
      const initials = name.slice(0, 2).toUpperCase();
      return {
        id: `f-${f.id}`,
        type: 'follow',
        initials,
        user: name,
        action: 'started following you',
        time: timeAgo(f.created_at),
        created_at: f.created_at,
      };
    });

    const all = [...reactionItems, ...followItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    setItems(all);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Activity</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />}
        {!loading && items.length === 0 && (
          <Text style={styles.empty}>No activity yet. Share a find and let your friends react!</Text>
        )}
        {items.map(n => (
          <View key={n.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{n.initials}</Text>
            </View>
            <View style={styles.textBlock}>
              {n.user && <Text style={styles.userName}>{n.user}</Text>}
              <Text style={styles.action}>{n.action}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4 },
  heading: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text },
  content: { padding: 20, gap: 4 },
  empty: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 22, fontFamily: Fonts.sans },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  textBlock: { flex: 1 },
  userName: { fontSize: 14, color: Colors.text, marginBottom: 2, fontFamily: Fonts.sansSemiBold },
  action: { fontSize: 14, color: Colors.textMuted, lineHeight: 20, fontFamily: Fonts.sans },
  time: { fontSize: 12, color: Colors.textMuted, marginTop: 4, fontFamily: Fonts.sansMedium },
});
