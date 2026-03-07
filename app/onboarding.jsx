import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/Colors';

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

function SplashStep({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>HAUL</Text>
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
        <Text style={styles.logo}>HAUL</Text>
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
          HAUL only reads order confirmation emails — nothing else. Your inbox stays private.
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
        <Text style={styles.buttonText}>Start Hauling</Text>
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
  logo: {
    fontFamily: 'serif',
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  body: {
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
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.accentText,
    fontSize: 16,
    fontWeight: '600',
  },
  skip: {
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
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
