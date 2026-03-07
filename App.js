import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HAUL</Text>
      <Text style={styles.tagline}>Browse what your friends buy.</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1815',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#8A8680',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
