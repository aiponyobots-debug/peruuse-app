import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import NotificationsScreen from './notifications';
import { Colors } from '../../constants/Colors';

const STORIES = [
  { id: '1', name: 'maya', initials: 'M' },
  { id: '2', name: 'jake', initials: 'J' },
  { id: '3', name: 'sara', initials: 'S' },
  { id: '4', name: 'leo', initials: 'L' },
  { id: '5', name: 'nina', initials: 'N' },
];

const FEED = [
  {
    id: '1',
    user: { name: 'Maya Chen', initials: 'MC' },
    timeAgo: '2h ago',
    brand: 'ARITZIA',
    product: 'Wilfred Free Featherweight Tee',
    price: '$58',
    image: null,
    url: 'https://www.aritzia.com',
    reactions: { wantIt: 12, haveIt: 3 },
  },
  {
    id: '2',
    user: { name: 'Jake Rivera', initials: 'JR' },
    timeAgo: '4h ago',
    brand: 'ALLBIRDS',
    product: 'Tree Runner Go Sneakers',
    price: '$120',
    image: null,
    url: 'https://www.allbirds.com',
    reactions: { wantIt: 8, haveIt: 5 },
  },
  {
    id: '3',
    user: { name: 'Sara Kim', initials: 'SK' },
    timeAgo: '6h ago',
    brand: 'DYSON',
    product: 'Airwrap Multi-Styler',
    price: '$599',
    image: null,
    url: 'https://www.dyson.com',
    reactions: { wantIt: 34, haveIt: 7 },
  },
];

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
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wantIt = isWishlisted(item.id);
  const [haveIt, setHaveIt] = useState(false);
  const [wantCount, setWantCount] = useState(item.reactions.wantIt);
  const [haveCount, setHaveCount] = useState(item.reactions.haveIt);

  const toggleWant = () => {
    toggleWishlist(item);
    setWantCount(c => wantIt ? c - 1 : c + 1);
  };

  const toggleHave = () => {
    setHaveIt(prev => {
      setHaveCount(c => prev ? c - 1 : c + 1);
      return !prev;
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user.initials}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.meta}>bought this · {item.timeAgo}</Text>
        </View>
      </View>

      <View style={styles.productImage}>
        <Text style={styles.productImagePlaceholder}>📦</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.productName}>{item.product}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.actions}>
          <View style={styles.reactions}>
            <TouchableOpacity
              style={[styles.reactionBtn, wantIt && styles.reactionBtnActive]}
              onPress={toggleWant}
            >
              <Feather name="bookmark" size={14} color={wantIt ? Colors.accentText : Colors.textMuted} />
              <Text style={[styles.reactionText, wantIt && styles.reactionTextActive]}>Want It</Text>
              <Text style={[styles.reactionCount, wantIt && styles.reactionTextActive]}>{wantCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reactionBtn, haveIt && styles.reactionBtnActive]}
              onPress={toggleHave}
            >
              <Feather name="check-circle" size={14} color={haveIt ? Colors.accentText : Colors.textMuted} />
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
  );
}

function FeedbackModal({ visible, onClose }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) setSubmitted(true);
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
              <Text style={styles.feedbackThanksBody}>Your feedback helps us build a better HAUL.</Text>
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
                <Text style={styles.feedbackSubmitText}>Send Feedback</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function HomeFeed() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showNotifs} animationType="slide" onRequestClose={() => setShowNotifs(false)}>
        <NotificationsScreen onClose={() => setShowNotifs(false)} />
      </Modal>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HAUL</Text>
        <TouchableOpacity style={styles.notifButton} onPress={() => setShowNotifs(true)}>
          <Feather name="inbox" size={22} color={Colors.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <FeedbackModal visible={showFeedback} onClose={() => setShowFeedback(false)} />
      <TouchableOpacity style={styles.feedbackBanner} onPress={() => setShowFeedback(true)}>
        <Text style={styles.feedbackText}>We'd love your feedback — tap to share</Text>
        <Feather name="arrow-right" size={14} color={Colors.accentText} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {FEED.map(item => <FeedCard key={item.id} item={item} />)}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: '#E8705A',
  },
  feedbackHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackClose: { padding: 4 },
  feedbackTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text },
  feedbackBody: { flex: 1, padding: 24, gap: 16 },
  feedbackLabel: { fontSize: 16, color: Colors.text, fontWeight: '500' },
  feedbackInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: 16, fontSize: 15, color: Colors.text, textAlignVertical: 'top' },
  feedbackSubmit: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  feedbackSubmitDisabled: { opacity: 0.4 },
  feedbackSubmitText: { color: Colors.accentText, fontSize: 16, fontWeight: '600' },
  feedbackThanks: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  feedbackThanksEmoji: { fontSize: 48 },
  feedbackThanksTitle: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: Colors.text },
  feedbackThanksBody: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  feedbackDoneBtn: { marginTop: 16, backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 40 },
  feedbackDoneBtnText: { color: Colors.accentText, fontSize: 15, fontWeight: '600' },
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
  feedbackText: { fontSize: 13, color: Colors.accentText, fontWeight: '500' },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 3,
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
  storyInitials: { fontSize: 18, color: Colors.text, fontWeight: '600' },
  storyName: { fontSize: 11, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
  avatarText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  productImage: {
    height: 280,
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
  },
  productName: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  price: { fontSize: 16, color: Colors.text, fontWeight: '500', marginBottom: 14 },
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
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  reactionText: { fontSize: 12, color: Colors.textMuted },
  reactionTextActive: { color: Colors.accentText },
  reactionCount: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  buyButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buyButtonText: { color: Colors.accentText, fontSize: 14, fontWeight: '600' },
});
