import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import NotificationsScreen from './notifications';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function StoryBubble({ name, initials }) {
  return (
    <View style={styles.storyItem}>
      <View style={styles.storyRing}>
        <View style={styles.storyAvatar}>
          <Text style={styles.storyInitials}>{initials}</Text>
        </View>
      </View>
      <Text style={styles.storyName}>{name}</Text>
    </View>
  );
}

import { Linking } from 'react-native';
import { useWishlist } from '../../context/WishlistContext';

function FeedCard({ item }) {
  const { user } = useAuth();
  const [wantIt, setWantIt] = useState(false);
  const [haveIt, setHaveIt] = useState(false);
  const [wantCount, setWantCount] = useState(item.reactions.wantIt);
  const [haveCount, setHaveCount] = useState(item.reactions.haveIt);

  useEffect(() => {
    if (!user) return;
    supabase.from('reactions').select('type').eq('post_id', item.id).eq('user_id', user.id).then(({ data }) => {
      setWantIt((data || []).some(r => r.type === 'want'));
      setHaveIt((data || []).some(r => r.type === 'have'));
    });
  }, [item.id, user]);

  const toggleReaction = async (type) => {
    const isActive = type === 'want' ? wantIt : haveIt;
    const setActive = type === 'want' ? setWantIt : setHaveIt;
    const setCount = type === 'want' ? setWantCount : setHaveCount;

    if (isActive) {
      await supabase.from('reactions').delete().eq('post_id', item.id).eq('user_id', user.id).eq('type', type);
      setActive(false);
      setCount(c => c - 1);
    } else {
      await supabase.from('reactions').insert({ post_id: item.id, user_id: user.id, type });
      setActive(true);
      setCount(c => c + 1);
    }
  };

  return (
    <View style={styles.cardShadow}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user.initials}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.meta}>bought this · {item.purchasedAt ? formatPurchaseDate(item.purchasedAt) : item.timeAgo}{item.status ? ` · ${item.status}` : ''}</Text>
        </View>
      </View>

      <View style={styles.productImage}>
        {item.image
          ? <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          : <Text style={styles.productImagePlaceholder}>📦</Text>
        }
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.productName}>{item.product}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.actions}>
          <View style={styles.reactions}>
            <TouchableOpacity
              style={[styles.reactionBtn, wantIt && styles.reactionBtnActive]}
              onPress={() => toggleReaction('want')}
            >
              <Feather name="bookmark" size={14} color={wantIt ? Colors.background : Colors.textMuted} />
              <Text style={[styles.reactionText, wantIt && styles.reactionTextActive]}>Want It</Text>
              <Text style={[styles.reactionCount, wantIt && styles.reactionTextActive]}>{wantCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reactionBtn, haveIt && styles.reactionBtnActive]}
              onPress={() => toggleReaction('have')}
            >
              <Feather name="check-circle" size={14} color={haveIt ? Colors.background : Colors.textMuted} />
              <Text style={[styles.reactionText, haveIt && styles.reactionTextActive]}>Have It</Text>
              <Text style={[styles.reactionCount, haveIt && styles.reactionTextActive]}>{haveCount}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            <Text style={styles.buyButtonText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </View>
  );
}

function FeedbackModal({ visible, onClose }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await supabase.from('feedback').insert({ message: text.trim(), user_id: user?.id ?? null });
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setText('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.feedbackHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.feedbackClose}>
              <Feather name="x" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.feedbackTitle}>Share Feedback</Text>
          </View>

          {submitted ? (
            <View style={styles.feedbackThanks}>
              <Text style={styles.feedbackThanksEmoji}>🙏</Text>
              <Text style={styles.feedbackThanksTitle}>Thank you!</Text>
              <Text style={styles.feedbackThanksBody}>Your feedback helps us build a better Peruuse.</Text>
              <TouchableOpacity style={styles.feedbackDoneBtn} onPress={handleClose}>
                <Text style={styles.feedbackDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.feedbackBody}>
              <Text style={styles.feedbackLabel}>What's on your mind?</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Tell us what you think, what's missing, or what you love..."
                placeholderTextColor={Colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                autoFocus
              />
              <TouchableOpacity
                style={[styles.feedbackSubmit, !text.trim() && styles.feedbackSubmitDisabled]}
                onPress={handleSubmit}
                disabled={!text.trim()}
              >
                <Text style={styles.feedbackSubmitText}>{loading ? 'Sending...' : 'Send Feedback'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function HomeFeed() {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchFeed();
  }, []));

  const fetchFeed = async () => {
    setLoadingFeed(true);
    // Get IDs of people I follow
    const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
    const followingIds = (followData || []).map(r => r.following_id);
    const ids = [user.id, ...followingIds];

    const { data, error } = await supabase
      .from('posts')
      .select('*, reactions(type)')
      .in('user_id', ids)
      .order('created_at', { ascending: false });
    if (error) console.log('Feed error:', error.message);
    const postsWithProfiles = await Promise.all((data || []).map(async (post) => {
      const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', post.user_id).single();
      return { ...post, profiles: profile };
    }));
    setFeed(postsWithProfiles);
    setLoadingFeed(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showNotifs} animationType="slide" onRequestClose={() => setShowNotifs(false)}>
        <NotificationsScreen onClose={() => setShowNotifs(false)} />
      </Modal>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>peruuse</Text>
        <TouchableOpacity style={styles.notifButton} onPress={() => setShowNotifs(true)}>
          <Feather name="inbox" size={22} color={Colors.deepText} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <FeedbackModal visible={showFeedback} onClose={() => setShowFeedback(false)} />
      <TouchableOpacity style={styles.feedbackBanner} onPress={() => setShowFeedback(true)}>
        <Text style={styles.feedbackText}>We'd love your feedback — tap to share</Text>
        <Feather name="arrow-right" size={14} color={Colors.accentText} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loadingFeed
          ? <ActivityIndicator style={{ marginTop: 40 }} color={Colors.accent} />
          : feed.length === 0
          ? <Text style={styles.emptyFeed}>No finds yet — follow some friends or add your first find!</Text>
          : feed.map(item => <FeedCard key={item.id} item={{
              id: item.id,
              user: {
                name: item.profiles?.full_name || item.profiles?.username || 'Unknown',
                initials: (item.profiles?.full_name || item.profiles?.username || '?').slice(0, 2).toUpperCase(),
              },
              timeAgo: timeAgo(item.created_at),
              purchasedAt: item.purchased_at || null,
              status: item.status || null,
              brand: item.brand,
              product: item.product_name,
              price: item.price,
              image: item.image_url,
              url: item.product_url,
              reactions: {
                wantIt: item.reactions?.filter(r => r.type === 'want').length ?? 0,
                haveIt: item.reactions?.filter(r => r.type === 'have').length ?? 0,
              },
            }} />)
        }
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPurchaseDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.deep,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifButton: { padding: 4, position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pop,
  },
  feedbackHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackClose: { padding: 4 },
  feedbackTitle: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text },
  feedbackBody: { flex: 1, padding: 24, gap: 16 },
  feedbackLabel: { fontSize: 16, color: Colors.text, fontFamily: Fonts.sansMedium },
  feedbackInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: 16, fontSize: 15, color: Colors.text, textAlignVertical: 'top', fontFamily: Fonts.sans },
  feedbackSubmit: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  feedbackSubmitDisabled: { opacity: 0.4 },
  feedbackSubmitText: { color: Colors.accentText, fontSize: 16, fontFamily: Fonts.sansSemiBold },
  feedbackThanks: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  feedbackThanksEmoji: { fontSize: 48 },
  feedbackThanksTitle: { fontFamily: Fonts.serif, fontSize: 28, color: Colors.text },
  feedbackThanksBody: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, fontFamily: Fonts.sans },
  feedbackDoneBtn: { marginTop: 16, backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 40 },
  feedbackDoneBtnText: { color: Colors.accentText, fontSize: 15, fontFamily: Fonts.sansSemiBold },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feedbackText: { fontSize: 13, color: Colors.accentText, fontFamily: Fonts.sansMedium },
  headerTitle: {
    fontFamily: Fonts.serifLightItalic,
    fontSize: 32,
    color: Colors.deepText,
    letterSpacing: 2,
  },
  stories: { marginTop: 12, marginBottom: 8 },
  storiesContent: { paddingHorizontal: 16, gap: 16 },
  storyItem: { alignItems: 'center', gap: 4 },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: Colors.accent,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitials: { fontSize: 18, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  storyName: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
  cardShadow: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 13, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  userName: { fontSize: 14, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 1, fontFamily: Fonts.sansMedium },
  productImage: {
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholder: { fontSize: 64 },
  cardBody: { padding: 16 },
  brand: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: Fonts.sansMedium,
  },
  productName: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  price: { fontSize: 16, color: Colors.text, marginBottom: 14, fontFamily: Fonts.sansMedium },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reactions: { flexDirection: 'row', gap: 8 },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  reactionBtnActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  reactionText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans },
  reactionTextActive: { color: Colors.background },
  reactionCount: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sansSemiBold },
  buyButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buyButtonText: { color: Colors.accentText, fontSize: 14, fontFamily: Fonts.sansSemiBold },
  emptyFeed: { textAlign: 'center', color: Colors.textMuted, fontSize: 15, marginTop: 60, fontFamily: Fonts.sans },
});
