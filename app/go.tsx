
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';

/**
 * Universal Link Handler
 * 
 * This page handles the universal QR code format: https://fcpmemorials.com/go?m=john-doe-1928
 * 
 * Flow:
 * 1. User scans QR code → Opens https://fcpmemorials.com/go?m=john-doe-1928
 * 2. If app is installed → This page extracts the memorial slug and redirects to /memorial/[id]
 * 3. If app is NOT installed → Web version shows the memorial (handled by web routing)
 */
export default function UniversalLinkHandler() {
  const { m } = useLocalSearchParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);

  console.log('[UniversalLinkHandler] Received memorial slug:', m);

  useEffect(() => {
    if (m && typeof m === 'string') {
      console.log('[UniversalLinkHandler] Redirecting to memorial:', m);
      // Small delay to ensure smooth transition
      setTimeout(() => {
        router.replace(`/memorial/${m}` as any);
      }, 100);
    } else {
      console.log('[UniversalLinkHandler] No memorial slug provided, redirecting to home');
      setTimeout(() => {
        router.replace('/');
      }, 100);
    }
  }, [m]);

  return (
    <View style={[commonStyles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[commonStyles.body, styles.loadingText]}>
        Opening memorial...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
});
