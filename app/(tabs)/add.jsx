import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

export default function AddPost() {
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Add a Haul</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.linkBox}>
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

        <View style={styles.field}>
          <Text style={styles.label}>Tag a friend</Text>
          <TextInput
            style={styles.input}
            placeholder="@username"
            placeholderTextColor={Colors.textMuted}
            value={tag}
            onChangeText={setTag}
            autoCapitalize="none"
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
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  heading: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: Colors.text },
  content: { padding: 20, gap: 20 },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  linkBox: { gap: 8 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  captionInput: { height: 100, textAlignVertical: 'top' },
  autoFillButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
  },
  autoFillText: { color: Colors.accentText, fontSize: 14, fontWeight: '600' },
  preview: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    height: 200,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  previewPlaceholder: { fontSize: 40 },
  previewHint: { fontSize: 13, color: Colors.textMuted },
  previewFields: { padding: 16 },
  previewBrand: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  previewProduct: { fontFamily: 'serif', fontSize: 16, fontWeight: '700', color: Colors.textMuted, marginBottom: 4 },
  previewPrice: { fontSize: 14, color: Colors.textMuted },
  field: { gap: 4 },
  privacyRow: { flexDirection: 'row', gap: 8 },
  privacyOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  privacyText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  postButton: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  postButtonText: { color: Colors.accentText, fontSize: 16, fontWeight: '600' },
});
