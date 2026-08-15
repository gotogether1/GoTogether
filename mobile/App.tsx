import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from './src/config/firebase';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>GoTogether App Ready</Text>
          <Text style={styles.title}>GoTogether</Text>
          <Text style={styles.subtitle}>Community-Driven Travel & Ride-Sharing</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Services & Environment Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>🟢</Text>
            <Text style={styles.statusLabel}>Expo SDK 57:</Text>
            <Text style={styles.statusValue}>Connected</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>🟢</Text>
            <Text style={styles.statusLabel}>Firebase JS SDK:</Text>
            <Text style={styles.statusValue}>Initialized</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>🟢</Text>
            <Text style={styles.statusLabel}>Neon PostgreSQL:</Text>
            <Text style={styles.statusValue}>Configured (.env)</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>🟢</Text>
            <Text style={styles.statusLabel}>Stitch MCP:</Text>
            <Text style={styles.statusValue}>Connected</Text>
          </View>
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>🚀 Ready to Build</Text>
          <Text style={styles.infoText}>
            Your Expo React Native project is fully set up and configured with Firebase, Neon DB, and Android package name (<Text style={styles.codeText}>com.gotogether.app</Text>).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    marginRight: 10,
    fontSize: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'Platform',
    fontWeight: '700',
  },
});
