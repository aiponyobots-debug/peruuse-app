import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [autoPost, setAutoPost] = useState(true);

  const steps = [
    <SplashStep key="splash" onNext={() => setStep(1)} />,
    <SignUpStep key="signup" onNext={() => setStep(2)} />,
    <GmailStep key="gmail" onNext={() => setStep(3)} />,
    <PrivacyStep key="privacy" autoPost={autoPost} setAutoPost={setAutoPost} onNext={() => router.replace('/(tabs)')} />,
  ];

  return steps[step];
}

function LogoWordmark() {
  return (
    <View style={styles.wordmark}>
      <Text style={styles.logo}>peruuse</Text>
    </View>
  );
}

function SplashStep({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <LogoWordmark />
        <Text style={styles.tagline}>Browse what your friends buy.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SignUpStep({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <LogoWordmark />
        <Text style={styles.heading}>Create your account</Text>
      </View>
      <View style={styles.authButtons}>
        <TouchableOpacity style={styles.authButton} onPress={onNext}>
          <Text style={styles.authButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authButton} onPress={onNext}>
          <Text style={styles.authButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authButton} onPress={onNext}>
          <Text style={styles.authButtonText}>Continue with Phone</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function GmailStep({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.heading}>Connect Gmail</Text>
        <Text style={styles.body}>
          Peruuse only reads order confirmation emails — nothing else. Your inbox stays private.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Connect Gmail</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNext}>
        <Text style={styles.skip}>Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function PrivacyStep({ autoPost, setAutoPost, onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.heading}>Privacy Settings</Text>
        <Text style={styles.body}>Control how your purchases get shared.</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Auto-post purchases</Text>
            <Text style={styles.toggleSub}>Or review each one before sharing</Text>
          </View>
          <Switch
            value={autoPost}
            onValueChange={setAutoPost}
            trackColor={{ true: Colors.accent }}
            thumbColor={Colors.white}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Start Exploring</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  top: {
    flex: 1,
    paddingTop: 32,
  },
  wordmark: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontFamily: Fonts.serif,
    fontSize: 52,
    color: Colors.text,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: Fonts.serifLightItalic,
    fontSize: 17,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    marginBottom: 16,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 32,
  },
  authButtons: {
    gap: 12,
    marginBottom: 32,
  },
  authButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  authButtonText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.accentText,
    fontSize: 16,
  },
  skip: {
    fontFamily: Fonts.sans,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  toggleLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.text,
  },
  toggleSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
