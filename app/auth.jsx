import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = '812432536878-hj29jgu55dv71c6h3ad917d52icmb8vs.apps.googleusercontent.com';
const WEB_CLIENT_ID = '812432536878-umihn5qt44piegrr8fhj5kdu89p16bkb.apps.googleusercontent.com';

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { idToken, accessToken } = response.authentication;
      handleGoogleAuth(idToken, accessToken);
    } else if (response?.type === 'error') {
      setError('Google sign-in failed. Try again.');
      setLoading(false);
    } else if (response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleAuth = async (idToken, accessToken) => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle(idToken, accessToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    setLoading(true);
    setError('');
    await promptAsync();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setError('Check your email for a password reset link.');
      } else if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, username, fullName);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = mode === 'forgot'
    ? !!email
    : mode === 'signin'
    ? email && password
    : email && password && fullName && username;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.wordmark}>
          <Text style={styles.logoEyes}>👀</Text>
          <Text style={styles.logo}>peruuse</Text>
        </View>
        <Text style={styles.tagline}>Browse what your friends buy.</Text>


        {mode === 'signin' && (
          <>
            <TouchableOpacity
              style={[styles.googleButton, (!request || loading) && styles.buttonDisabled]}
              onPress={handleGooglePress}
              disabled={!request || loading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
          </>
        )}

        {mode === 'signup' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />

        {mode !== 'forgot' && (
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {mode === 'signin' && (
          <TouchableOpacity onPress={() => { setMode('forgot'); setError(''); }}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={[styles.error, error.startsWith('Check') && styles.success]}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || !isValid}>
          <Text style={styles.buttonText}>
            {loading
              ? '...'
              : mode === 'forgot'
              ? 'Send Reset Link'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(m => m === 'signup' ? 'signin' : m === 'forgot' ? 'signin' : 'signup'); setError(''); }}>
          <Text style={styles.toggle}>
            {mode === 'signup' ? 'Already have an account? Sign in' : mode === 'forgot' ? 'Back to sign in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: 32, justifyContent: 'center', gap: 12 },
  wordmark: { flexDirection: 'column', alignItems: 'center', marginBottom: 8 },
  logoEyes: { fontSize: 48, marginBottom: 8 },
  logo: { fontFamily: Fonts.serif, fontSize: 48, color: Colors.text, letterSpacing: 4, fontFamily: Fonts.serif },
  tagline: { fontSize: 16, color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic', marginBottom: 24, fontFamily: Fonts.sans },
  googleButton: { backgroundColor: '#EFEFED', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  googleButtonText: { color: Colors.text, fontSize: 15, fontFamily: Fonts.sansSemiBold },
  buttonDisabled: { opacity: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sansMedium },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, fontSize: 15, color: Colors.text, fontFamily: Fonts.sans },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12 },
  passwordInput: { flex: 1, padding: 16, fontSize: 15, color: Colors.text, fontFamily: Fonts.sans },
  eyeBtn: { paddingHorizontal: 16 },
  button: { backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  buttonText: { color: Colors.accentText, fontSize: 16, fontFamily: Fonts.sansSemiBold },
  toggle: { textAlign: 'center', color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.sans },
  forgotLink: { textAlign: 'right', color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.sansMedium },
  error: { color: '#E8705A', fontSize: 13, fontFamily: Fonts.sans },
  success: { color: Colors.accentText },
});
