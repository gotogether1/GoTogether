import React from 'react';
import { Tabs } from 'expo-router';
import { Colors, Typography } from '../../src/theme';
import { Text, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarLabelStyle: styles.labelStyle,
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>🔍</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="offer"
        options={{
          title: 'Offer',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>➕</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>🚗</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActiveContainer]}>
              <Text style={styles.iconText}>👤</Text>
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
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  labelStyle: {
    ...Typography.labelSm,
    fontWeight: '600',
    fontSize: 11,
  },
  iconContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  iconActiveContainer: {
    backgroundColor: '#DBEAFE',
  },
  iconText: {
    fontSize: 18,
  },
});
