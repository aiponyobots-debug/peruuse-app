import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = '812432536878-hj29jgu55dv71c6h3ad917d52icmb8vs.apps.googleusercontent.com';
const WEB_CLIENT_ID = '812432536878-umihn5qt44piegrr8fhj5kdu89p16bkb.apps.googleusercontent.com';

export default function GmailConnect() {
  const { connectGmail, skipGmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) {
        connectGmail(token);
      } else {
        setError('Could not connect Gmail. Try again.');
        setLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Could not connect Gmail. Try again.');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    await promptAsync();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.heading}>Auto-detect your orders</Text>
        <Text style={styles.body}>
          Connect Gmail and Peruuse will automatically find your order confirmation emails and turn them into finds — no manual entry needed.
        </Text>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>What we access</Text>
          <Text style={styles.privacyItem}>✓  Order confirmation emails only</Text>
          <Text style={styles.privacyItem}>✗  We never read personal emails</Text>
          <Text style={styles.privacyItem}>✗  We never store your emails</Text>
          <Text style={styles.privacyItem}>✗  We never share your data</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, (!request || loading) && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={!request || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Connecting...' : 'Connect Gmail'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={skipGmail}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 20 },
  heading: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  privacyCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, width: '100%', gap: 10, marginBottom: 32 },
  privacyTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  privacyItem: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  error: { color: '#E8705A', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 18, alignItems: 'center', width: '100%', marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.accentText, fontSize: 16, fontWeight: '600' },
  skip: { fontSize: 14, color: Colors.textMuted },
});
