import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const NOTIFICATIONS = [
  { id: '1', type: 'want', user: 'Maya Chen', initials: 'MC', action: 'wants your Aritzia haul', time: '5m ago' },
  { id: '2', type: 'follow', user: 'Jake Rivera', initials: 'JR', action: 'started following you', time: '1h ago' },
  { id: '3', type: 'trending', user: null, initials: '🔥', action: 'Your Dyson Airwrap post is trending!', time: '2h ago' },
  { id: '4', type: 'have', user: 'Sara Kim', initials: 'SK', action: 'has your Stanley Quencher too', time: '3h ago' },
  { id: '5', type: 'want', user: 'Leo Park', initials: 'LP', action: 'wants your Allbirds haul', time: '5h ago' },
];

export default function Notifications({ onClose }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Activity</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {NOTIFICATIONS.map(n => (
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
  heading: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text },
  content: { padding: 20, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  textBlock: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  action: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  time: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});
