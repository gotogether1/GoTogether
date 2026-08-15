import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';
import { getRecentSearches, RecentSearchItem } from '../../src/utils/recentSearches';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const isLoggedIn = !!user;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Commuter';

  useEffect(() => {
    async function loadHistory() {
      const items = await getRecentSearches(user?.uid);
      setRecentSearches(items);
    }
    loadHistory();
  }, [user?.uid]);

  const handlePublishPress = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to publish a ride.',
        [
          { text: 'Log In', onPress: () => router.push('/auth/login') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    router.push('/(tabs)/offer');
  };

  const handleRecentSearchTap = (item: RecentSearchItem) => {
    router.push({
      pathname: '/(tabs)/find',
      params: {
        pickup: item.pickup,
        destination: item.destination,
      },
    });
  };

  const topInsetPadding = Math.max(insets.top, 16) + 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.userGreetingMeta}>
            <Text style={styles.greetingSub}>{isLoggedIn ? 'Welcome back' : 'Welcome to GoTogether'}</Text>
            <Text style={styles.userTitle} numberOfLines={1}>{displayName}</Text>
          </View>

          {isLoggedIn ? (
            <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(tabs)/notifications')} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={20} color="#0F172A" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginPillHeader} onPress={() => router.push('/auth/login')} activeOpacity={0.85}>
              <Text style={styles.loginPillHeaderText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dual Hero Action Cards */}
        <View style={styles.dualCardRow}>
          <TouchableOpacity style={styles.heroCardPrimary} onPress={handlePublishPress} activeOpacity={0.88}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="add-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.heroCardTitle}>Publish a Ride</Text>
            <Text style={styles.heroCardSub}>Share your route & seats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroCardAccent} onPress={() => router.push('/(tabs)/find')} activeOpacity={0.88}>
            <View style={styles.heroIconBadgeDark}>
              <Ionicons name="search-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.heroCardTitleDark}>Find a Ride</Text>
            <Text style={styles.heroCardSubDark}>Search carpool or bike pool</Text>
          </TouchableOpacity>
        </View>

        {/* Recently Searched Routes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Searched</Text>
        </View>

        {recentSearches.length === 0 ? (
          <View style={styles.emptyRecentBox}>
            <Ionicons name="time-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyRecentTitle}>No Recent Searches</Text>
            <Text style={styles.emptyRecentSub}>Routes you search for will appear here for quick access.</Text>
            <TouchableOpacity
              style={styles.startSearchBtn}
              onPress={() => router.push('/(tabs)/find')}
              activeOpacity={0.85}
            >
              <Text style={styles.startSearchBtnText}>Search a Route</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItemCard}
                onPress={() => handleRecentSearchTap(item)}
                activeOpacity={0.85}
              >
                <View style={styles.recentIconBadge}>
                  <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.recentMeta}>
                  <Text style={styles.recentRouteTitle}>{item.pickup} → {item.destination}</Text>
                  <Text style={styles.recentSubText}>Tap to pre-fill search in Find a Ride</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Community Trust Banner */}
        <View style={styles.trustBannerCard}>
          <Ionicons name="shield-checkmark-sharp" size={24} color={Colors.primary} />
          <View style={styles.trustMeta}>
            <Text style={styles.trustTitle}>Verified Commuter Network</Text>
            <Text style={styles.trustSub}>Every pooler is authenticated with Firebase ID verification and community reviews.</Text>
          </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  userGreetingMeta: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  greetingSub: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Typography.fontFamily.medium,
  },
  userTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Typography.fontFamily.bold,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  loginPillHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  loginPillHeaderText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.medium,
  },
  dualCardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  heroCardPrimary: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: Spacing.md,
  },
  heroCardAccent: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: Spacing.md,
  },
  heroIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroIconBadgeDark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
    fontFamily: Typography.fontFamily.bold,
  },
  heroCardSub: {
    fontSize: 12,
    color: '#3B82F6',
  },
  heroCardTitleDark: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Typography.fontFamily.bold,
  },
  heroCardSubDark: {
    fontSize: 12,
    color: '#94A3B8',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Typography.fontFamily.bold,
  },
  emptyRecentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: Spacing.xs,
  },
  emptyRecentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  emptyRecentSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  startSearchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  startSearchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  recentList: {
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  recentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentMeta: {
    flex: 1,
  },
  recentRouteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  trustBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: 12,
  },
  trustMeta: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  trustSub: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
});
