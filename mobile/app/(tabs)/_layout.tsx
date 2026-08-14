import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceContainer,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find Ride',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="offer"
        options={{
          title: 'Offer Ride',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚗</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔔</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
