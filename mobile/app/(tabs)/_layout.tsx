import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? Colors.primary : '#64748B'}
              />
              <Text style={[styles.labelText, focused && styles.labelTextActive]}>Home</Text>
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
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={22}
                color={focused ? Colors.primary : '#64748B'}
              />
              <Text style={[styles.labelText, focused && styles.labelTextActive]}>Find</Text>
            </View>
          ),
        }}
      />

      {/* 3. OFFER / CREATE */}
      <Tabs.Screen
        name="offer"
        options={{
          title: 'Offer',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={22}
                color={focused ? Colors.primary : '#64748B'}
              />
              <Text style={[styles.labelText, focused && styles.labelTextActive]}>Offer</Text>
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

      {/* 5. INBOX / NOTIFICATIONS WITH RED BADGE DOT */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <View style={styles.iconBadgeWrapper}>
                <Ionicons
                  name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                  size={22}
                  color={focused ? Colors.primary : '#64748B'}
                />
                <View style={styles.redBadgeDot} />
              </View>
              <Text style={[styles.labelText, focused && styles.labelTextActive]}>Inbox</Text>
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
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? Colors.primary : '#64748B'}
              />
              <Text style={[styles.labelText, focused && styles.labelTextActive]}>Profile</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    width: 68,
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF',
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  labelText: {
    ...Typography.labelSm,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  labelTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
