import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, SafeAreaView, FlatList } from 'react-native';
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
    reactions: { wantIt: 12, haveIt: 3, meh: 1 },
  },
  {
    id: '2',
    user: { name: 'Jake Rivera', initials: 'JR' },
    timeAgo: '4h ago',
    brand: 'ALLBIRDS',
    product: 'Tree Runner Go Sneakers',
    price: '$120',
    image: null,
    reactions: { wantIt: 8, haveIt: 5, meh: 0 },
  },
  {
    id: '3',
    user: { name: 'Sara Kim', initials: 'SK' },
    timeAgo: '6h ago',
    brand: 'DYSON',
    product: 'Airwrap Multi-Styler',
    price: '$599',
    image: null,
    reactions: { wantIt: 34, haveIt: 7, meh: 2 },
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

function FeedCard({ item }) {
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
            <TouchableOpacity style={styles.reaction}>
              <Text style={styles.reactionText}>🔥 Want It</Text>
              <Text style={styles.reactionCount}>{item.reactions.wantIt}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reaction}>
              <Text style={styles.reactionText}>✓ Have It</Text>
              <Text style={styles.reactionCount}>{item.reactions.haveIt}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reaction}>
              <Text style={styles.reactionText}>😐 Meh</Text>
              <Text style={styles.reactionCount}>{item.reactions.meh}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function HomeFeed() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HAUL</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories} contentContainerStyle={styles.storiesContent}>
          {STORIES.map(s => <StoryBubble key={s.id} {...s} />)}
        </ScrollView>

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
  },
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
  reaction: { alignItems: 'center' },
  reactionText: { fontSize: 11, color: Colors.textMuted },
  reactionCount: { fontSize: 12, color: Colors.text, fontWeight: '600', textAlign: 'center' },
  buyButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buyButtonText: { color: Colors.accentText, fontSize: 14, fontWeight: '600' },
});
