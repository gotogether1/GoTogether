import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
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
        tabBarButton: ({ ref, ...restProps }: any) => (
          <Pressable
            {...restProps}
            android_ripple={{ color: 'transparent' }}
            style={({ pressed }) => [
              restProps.style,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          />
        ),
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

      {/* 2. PUBLISH (+) BUTTON IN DOCK */}
      <Tabs.Screen
        name="offer"
        options={{
          title: 'Publish',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={24}
                color={focused ? Colors.primary : '#94A3B8'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 3. CENTER FLOATING BLUE BUTTON (MY RIDES / DASHBOARD) */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerFloatingBtn, focused && styles.centerFloatingBtnActive]}>
              <Ionicons name={focused ? 'car' : 'car-outline'} size={26} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 4. FIND A RIDE (ACCESSIBLE VIA HOME SEARCH & HERO CARDS) */}
      <Tabs.Screen
        name="find"
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
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 72,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabBarItemStyle: {
    height: Platform.OS === 'ios' ? 64 : 64,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: 48,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  centerFloatingBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  centerFloatingBtnActive: {
    backgroundColor: '#1E40AF',
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
