import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, Keyboard, Animated, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchOrderEmails } from '../../lib/gmail';

WebBrowser.maybeCompleteAuthSession();

const PRIVACY_OPTIONS = ['Public', 'Friends Only', 'Private'];
const IOS_CLIENT_ID = '812432536878-hj29jgu55dv71c6h3ad917d52icmb8vs.apps.googleusercontent.com';
const WEB_CLIENT_ID = '812432536878-umihn5qt44piegrr8fhj5kdu89p16bkb.apps.googleusercontent.com';

export default function AddPost() {
  const { user, gmailToken, connectGmail, clearGmailToken } = useAuth();
  const [showManual, setShowManual] = useState(false);
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('Friends Only');
  const [loading, setLoading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [orderEmails, setOrderEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [gmailError, setGmailError] = useState(false);
  const [emailSourceId, setEmailSourceId] = useState(null);
  const [purchasedAt, setPurchasedAt] = useState(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) connectGmail(token);
    }
  }, [response]);

  useFocusEffect(useCallback(() => {
    if (gmailToken && !loadingEmails) loadEmails(gmailToken);
  }, [gmailToken]));

  const alreadyPosted = (item, postedIds) => postedIds.has(item.id);

  const loadEmails = async (token) => {
    setLoadingEmails(true);
    setGmailError(false);
    try {
      const [emails, { data: existingPosts }] = await Promise.all([
        fetchOrderEmails(token),
        supabase.from('posts').select('email_source_id').eq('user_id', user.id).not('email_source_id', 'is', null),
      ]);
      const postedIds = new Set((existingPosts || []).map(p => p.email_source_id));
      const filtered = emails.filter(item => !alreadyPosted(item, postedIds));
      setOrderEmails(filtered);
      // Background-fetch images for cards that don't have one
      const missing = filtered.filter(e => !e.imageUrl && e.productUrl);
      missing.slice(0, 6).forEach(async (item) => {
        try {
          const resolved = resolveTrackerUrl(item.productUrl);
          const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(resolved)}`);
          const json = await res.json();
          const img = json?.data?.image?.url;
          if (img) setOrderEmails(prev => prev.map(e => e.id === item.id ? { ...e, imageUrl: img } : e));
        } catch {}
      });
    } catch (e) {
      console.log('[add] loadEmails error:', e.message);
      if (e.message === 'token_expired') {
        await clearGmailToken();
      }
      setGmailError(true);
    } finally {
      setLoadingEmails(false);
    }
  };

  const resolveTrackerUrl = (url) => {
    // Many retailer email links are click-tracker URLs with the real URL encoded inside
    // e.g. https://click.orders.jcrew.com/CL0/https:%2F%2Fwww.jcrew.com%2Fp%2F...
    try {
      const decoded = decodeURIComponent(url);
      const match = decoded.match(/https?:\/\/(?!click\.|email\.|go\.|r\.|link\.|track\.|mail\.)[\w.-]+\.[a-z]{2,}\/\S+/i);
      if (match) return match[0];
    } catch {}
    return url;
  };

  const handleSelectEmail = async (item) => {
    setBrand(item.brand || '');
    setPrice(item.price || '');
    setProduct(item.name || '');
    if (item.imageUrl) setImageUrl(item.imageUrl);
    const resolvedUrl = item.productUrl ? resolveTrackerUrl(item.productUrl) : null;
    if (resolvedUrl) setUrl(resolvedUrl);
    setEmailSourceId(item.id);
    setPurchasedAt(item.purchasedAt || null);
    setShowManual(true);
    // Try to autofill image from the resolved product URL
    if (resolvedUrl && !item.imageUrl) {
      autofillWithUrl(resolvedUrl);
    }
  };

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const autofill = async () => {
    if (!url.trim()) return Alert.alert('No link', 'Paste a product link first.');
    setAutofilling(true);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();
      const data = json?.data;
      const blocked = !data || data.title?.toLowerCase().includes('attention required') || data.title?.toLowerCase().includes('just a moment');
      if (blocked) return Alert.alert('Site is protected', 'This retailer blocks auto-fill. Please fill in the details manually.');
      if (data.title) setProduct(data.title);
      if (data.publisher) setBrand(data.publisher.toUpperCase());
      if (data.image?.url) setImageUrl(data.image.url);
      if (data.price?.amount) setPrice(`$${data.price.amount}`);
      if (!data.title && !data.publisher) Alert.alert('Could not auto-fill', 'Try filling in the details manually.');
      Keyboard.dismiss();
    } catch {
      Alert.alert('Could not fetch that link', 'Fill in the details manually.');
    } finally {
      setAutofilling(false);
    }
  };

  const autofillWithUrl = async (targetUrl) => {
    setAutofilling(true);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl.trim())}`);
      const json = await res.json();
      const data = json?.data;
      const blocked = !data || data.title?.toLowerCase().includes('attention required') || data.title?.toLowerCase().includes('just a moment');
      if (blocked) return;
      if (data.image?.url) setImageUrl(data.image.url);
      if (data.title && !product) setProduct(data.title);
      if (data.publisher) setBrand(prev => prev || data.publisher.toUpperCase());
      if (data.price?.amount) setPrice(prev => prev || `$${data.price.amount}`);
    } catch {
      // fail silently — form is already pre-filled from email
    } finally {
      setAutofilling(false);
    }
  };

  const reset = () => {
    setBrand(''); setProduct(''); setPrice(''); setUrl(''); setCaption(''); setImageUrl(null);
    setPrivacy('Friends Only'); setShowManual(false); setEmailSourceId(null); setPurchasedAt(null);
  };

  const handlePost = async () => {
    if (!product.trim()) return Alert.alert('Missing info', 'Please enter a product name.');
    if (!user) return Alert.alert('Not logged in', 'Please sign in again.');
    setLoading(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        brand: brand.trim().toUpperCase() || null,
        product_name: product.trim(),
        price: price.trim() || null,
        product_url: url.trim() || null,
        image_url: imageUrl || null,
        caption: caption.trim() || null,
        privacy: privacy.toLowerCase().replace(' ', '_'),
        email_source_id: emailSourceId || null,
        purchased_at: purchasedAt || null,
      });
      if (error) throw error;
      showToast();
      setTimeout(reset, 2800);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual form
  if (showManual) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
          <Text style={styles.toastText}>Your find is live ✓</Text>
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowManual(false)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headingLeft}>Add a Find</Text>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <Text style={styles.label}>Product Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={Colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity style={styles.autoFillButton} onPress={autofill} disabled={autofilling}>
                <Text style={styles.autoFillText}>{autofilling ? 'Filling...' : 'Auto-fill details'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.previewBox}>
              {imageUrl
                ? <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                : <View style={styles.previewPlaceholder}><Text style={styles.previewEmoji}>📷</Text><Text style={styles.previewHint}>Image will appear after auto-fill</Text></View>
              }
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Brand</Text>
              <TextInput style={styles.input} placeholder="e.g. ARITZIA" placeholderTextColor={Colors.textMuted} value={brand} onChangeText={setBrand} autoCapitalize="characters" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Wilfred Free Featherweight Tee" placeholderTextColor={Colors.textMuted} value={product} onChangeText={setProduct} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Price</Text>
              <TextInput style={styles.input} placeholder="e.g. $58" placeholderTextColor={Colors.textMuted} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Caption (optional)</Text>
              <TextInput style={[styles.input, styles.captionInput]} placeholder="Say something about this find..." placeholderTextColor={Colors.textMuted} value={caption} onChangeText={setCaption} multiline />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.privacyRow}>
                {PRIVACY_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt} style={[styles.privacyOption, privacy === opt && styles.privacyOptionActive]} onPress={() => setPrivacy(opt)}>
                    <Text style={[styles.privacyText, privacy === opt && styles.privacyTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={[styles.postButton, (!product.trim() || loading) && styles.postButtonDisabled]} onPress={handlePost} disabled={!product.trim() || loading}>
              <Text style={styles.postButtonText}>{loading ? 'Posting...' : 'Post Find'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Gmail-connected home screen
  if (gmailToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headingLeft}>Add a Find</Text>
          <TouchableOpacity onPress={() => setShowManual(true)}>
            <Text style={styles.manualLink}>Manual</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loadingEmails && <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />}
          {!loadingEmails && gmailError && (
            <View style={styles.gmailErrorBox}>
              <Text style={styles.gmailErrorText}>Gmail session expired.</Text>
              <TouchableOpacity style={styles.reconnectBtn} onPress={() => promptAsync()} disabled={!request}>
                <Text style={styles.reconnectBtnText}>Reconnect Gmail</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loadingEmails && !gmailError && orderEmails.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No recent order emails found.</Text>
              <Text style={styles.emptySubtext}>Orders usually appear within a few minutes of receiving the confirmation email.</Text>
              <TouchableOpacity onPress={() => setShowManual(true)}>
                <Text style={styles.manualLinkCenter}>Add manually instead</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loadingEmails && orderEmails.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Ready to Post</Text>
              {orderEmails.map(item => (
                <TouchableOpacity key={item.id} style={styles.emailCardShadow} onPress={() => handleSelectEmail(item)}>
                  <View style={styles.emailCard}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.emailCardImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.emailCardTop}>
                    <Text style={styles.emailName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.emailDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.emailBrand}>{item.brand}</Text>
                  {item.price ? <Text style={styles.emailPrice}>{item.price}</Text> : null}
                  <Text style={styles.emailTap}>Tap to post →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // No Gmail connected
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.heading}>Auto-post your purchases</Text>
        <Text style={styles.body}>
          Connect Gmail and Peruuse will automatically find your order confirmation emails and turn them into finds.
        </Text>
        <Text style={styles.trust}>We only read order confirmation emails. Nothing else.</Text>
        <TouchableOpacity
          style={[styles.gmailButton, (!request) && styles.postButtonDisabled]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Text style={styles.gmailButtonText}>Connect Gmail</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowManual(true)}>
          <Text style={styles.manualLink}>Add manually instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text, textAlign: 'center', marginBottom: 12 },
  headingLeft: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.text },
  backBtn: { marginRight: 12 },
  backBtnText: { fontSize: 20, color: Colors.text },
  body: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 12, fontFamily: Fonts.sans },
  trust: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 32, fontStyle: 'italic', fontFamily: Fonts.sans },
  gmailButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16, width: '100%', alignItems: 'center' },
  gmailButtonText: { color: Colors.accentText, fontSize: 16, fontFamily: Fonts.sansSemiBold },
  manualLink: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sans },
  manualLinkCenter: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 16, fontFamily: Fonts.sans },
  content: { padding: 20, gap: 16 },
  sectionLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontFamily: Fonts.sansMedium },
  emailCardShadow: { borderRadius: 16, backgroundColor: Colors.card },
  emailCard: { borderRadius: 16, overflow: 'hidden', gap: 6 },
  emailCardImage: { width: '100%', aspectRatio: 4/5, backgroundColor: '#f5f5f5' },
  emailCardTop: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  emailName: { fontSize: 15, color: Colors.text, lineHeight: 20, flex: 1, marginRight: 8, fontFamily: Fonts.sansSemiBold },
  emailBrand: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, fontFamily: Fonts.sansMedium },
  emailDate: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
  emailPrice: { fontSize: 15, color: Colors.text, paddingHorizontal: 16, fontFamily: Fonts.sansSemiBold },
  emailTap: { fontSize: 12, color: Colors.accent, paddingHorizontal: 16, paddingBottom: 16, marginTop: 4, fontFamily: Fonts.sansSemiBold },
  emptyBox: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: Colors.text, fontFamily: Fonts.sansSemiBold },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, fontFamily: Fonts.sans },
  gmailErrorBox: { alignItems: 'center', paddingTop: 40, gap: 16 },
  gmailErrorText: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sans },
  reconnectBtn: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 12, paddingHorizontal: 28 },
  reconnectBtnText: { color: Colors.accentText, fontSize: 14, fontFamily: Fonts.sansSemiBold },
  field: { gap: 6 },
  label: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Fonts.sansMedium },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, fontSize: 15, color: Colors.text, fontFamily: Fonts.sans },
  captionInput: { height: 100, textAlignVertical: 'top' },
  previewBox: { borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.card },
  previewImage: { width: '100%', aspectRatio: 4/5 },
  previewPlaceholder: { height: 160, justifyContent: 'center', alignItems: 'center', gap: 8 },
  previewEmoji: { fontSize: 36 },
  previewHint: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },
  autoFillButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  autoFillText: { color: Colors.accentText, fontSize: 14, fontFamily: Fonts.sansSemiBold },
  privacyRow: { flexDirection: 'row', gap: 8 },
  privacyOption: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 50, paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.background },
  privacyOptionActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  privacyText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
  privacyTextActive: { color: Colors.background },
  postButton: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  postButtonDisabled: { opacity: 0.4 },
  postButtonText: { color: Colors.accentText, fontSize: 16, fontFamily: Fonts.sansSemiBold },
  toast: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: Colors.text, borderRadius: 50, paddingVertical: 12, paddingHorizontal: 24, zIndex: 100 },
  toastText: { color: Colors.background, fontSize: 14, fontFamily: Fonts.sansSemiBold },
});
