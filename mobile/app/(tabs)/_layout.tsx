import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={focused ? Colors.primary : '#94A3B8'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 2. FIND */}
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={24}
                color={focused ? Colors.primary : '#94A3B8'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 3. CENTER FLOATING "+" ACTION BUTTON (OFFER) */}
      <Tabs.Screen
        name="offer"
        options={{
          title: 'Offer',
          tabBarIcon: () => (
            <View style={styles.centerFloatingBtn}>
              <Ionicons name="add" size={30} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 4. MY RIDES (HIDDEN FROM BAR) */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />

      {/* 5. INBOX WITH RED UNREAD BADGE DOT */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={styles.iconBadgeWrapper}>
                <Ionicons
                  name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                  size={24}
                  color={focused ? Colors.primary : '#94A3B8'}
                />
                <View style={styles.redBadgeDot} />
              </View>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 6. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={focused ? Colors.primary : '#94A3B8'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    paddingHorizontal: 4,
  },
  tabBarItemStyle: {
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 68,
    width: 48,
    paddingTop: 8,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  centerFloatingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
