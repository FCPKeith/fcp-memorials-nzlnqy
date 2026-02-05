
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(scanner)',
      label: 'Scanner',
      icon: 'qr-code-scanner',
      route: '/(tabs)/(scanner)' as any,
    },
    {
      name: '(map)',
      label: 'Map',
      icon: 'map',
      route: '/(tabs)/(map)' as any,
    },
    {
      name: 'request',
      label: 'Request',
      icon: 'add-circle',
      route: '/request-memorial' as any,
    },
  ];

  if (Platform.OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="(scanner)"
          options={{
            title: 'Scanner',
            tabBarIcon: () => null,
          }}
        />
        <Tabs.Screen
          name="(map)"
          options={{
            title: 'Map',
            tabBarIcon: () => null,
          }}
        />
        <Tabs.Screen
          name="request"
          options={{
            title: 'Request',
            tabBarIcon: () => null,
            href: '/request-memorial',
          }}
        />
      </Tabs>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => null}
      >
        <Tabs.Screen name="(scanner)" />
        <Tabs.Screen name="(map)" />
        <Tabs.Screen
          name="request"
          options={{
            href: null, // Hide from tab bar, accessed via FloatingTabBar
          }}
        />
      </Tabs>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
