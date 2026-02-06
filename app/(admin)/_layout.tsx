
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="requests"
        options={{
          title: 'Memorial Requests',
        }}
      />
    </Stack>
  );
}
