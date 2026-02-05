
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[commonStyles.container, styles.container]}>
        <Text style={styles.title}>Memorial Not Found</Text>
        <Text style={styles.message}>
          This memorial page doesn&apos;t exist or has been removed.
        </Text>
        <Link href="/(tabs)/(scanner)" style={styles.link}>
          <Text style={styles.linkText}>Return to Scanner</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  linkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
