import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

export default function AddPost() {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [showManual, setShowManual] = useState(false);

  if (!gmailConnected && !showManual) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>📬</Text>
          <Text style={styles.heading}>Auto-post your purchases</Text>
          <Text style={styles.body}>
            Connect Gmail and HAUL will automatically detect your order confirmation emails and create posts for you.
          </Text>
          <Text style={styles.trust}>We only read order confirmation emails. Nothing else.</Text>
          <TouchableOpacity style={styles.gmailButton} onPress={() => setGmailConnected(true)}>
            <Text style={styles.gmailButtonText}>Connect Gmail</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowManual(true)}>
            <Text style={styles.manualLink}>Add manually instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (gmailConnected && !showManual) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.heading}>Gmail Connected!</Text>
          <Text style={styles.body}>
            New order confirmations will automatically appear in your feed. Your friends will see what you buy in real time.
          </Text>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>● Gmail is active</Text>
          </View>
          <TouchableOpacity style={styles.gmailButton} onPress={() => setShowManual(true)}>
            <Text style={styles.gmailButtonText}>Add a post manually</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingLeft}>Add a Haul</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Paste a product link or type a name</Text>
          <TextInput
            style={styles.input}
            placeholder="https://... or product name"
            placeholderTextColor={Colors.textMuted}
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.autoFillButton}>
            <Text style={styles.autoFillText}>Auto-fill details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.preview}>
          <View style={styles.previewImage}>
            <Text style={styles.previewPlaceholder}>📷</Text>
            <Text style={styles.previewHint}>Product image will appear here</Text>
          </View>
          <View style={styles.previewFields}>
            <Text style={styles.previewBrand}>BRAND</Text>
            <Text style={styles.previewProduct}>Product name</Text>
            <Text style={styles.previewPrice}>$0.00</Text>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.input, styles.captionInput]}
            placeholder="Say something about this haul..."
            placeholderTextColor={Colors.textMuted}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
        <View style={styles.privacyRow}>
          {['Public', 'Friends Only', 'Private'].map(opt => (
            <TouchableOpacity key={opt} style={styles.privacyOption}>
              <Text style={styles.privacyText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>Post Haul</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  heading: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  headingLeft: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text },
  body: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  trust: { fontSize: 13, color: Colors.accentText, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' },
  gmailButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16, width: '100%', alignItems: 'center' },
  gmailButtonText: { color: Colors.accentText, fontSize: 16, fontWeight: '600' },
  manualLink: { fontSize: 14, color: Colors.textMuted },
  connectedBadge: { backgroundColor: Colors.card, borderRadius: 50, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 32 },
  connectedText: { fontSize: 13, color: Colors.accentText, fontWeight: '500' },
  content: { padding: 20, gap: 20 },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text },
  captionInput: { height: 100, textAlignVertical: 'top' },
  autoFillButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  autoFillText: { color: Colors.accentText, fontSize: 14, fontWeight: '600' },
  preview: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden' },
  previewImage: { height: 200, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center', gap: 8 },
  previewPlaceholder: { fontSize: 40 },
  previewHint: { fontSize: 13, color: Colors.textMuted },
  previewFields: { padding: 16 },
  previewBrand: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  previewProduct: { fontFamily: 'serif', fontSize: 16, fontWeight: '700', color: Colors.textMuted, marginBottom: 4 },
  previewPrice: { fontSize: 14, color: Colors.textMuted },
  field: { gap: 4 },
  privacyRow: { flexDirection: 'row', gap: 8 },
  privacyOption: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 50, paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.white },
  privacyText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  postButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  postButtonText: { color: Colors.accentText, fontSize: 16, fontWeight: '600' },
});
