
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedGet } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

interface RequestStats {
  total: number;
  submitted: number;
  under_review: number;
  approved: number;
  published: number;
  rejected: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    } else if (user) {
      loadStats();
    }
  }, [user, authLoading]);

  const loadStats = async () => {
    console.log('[AdminDashboard] Loading stats');
    setLoading(true);
    setError(null);

    try {
      const requests = await authenticatedGet<any[]>('/api/admin/memorial-requests');
      
      const statsData: RequestStats = {
        total: requests.length,
        submitted: requests.filter(r => r.request_status === 'submitted').length,
        under_review: requests.filter(r => r.request_status === 'under_review').length,
        approved: requests.filter(r => r.request_status === 'approved').length,
        published: requests.filter(r => r.request_status === 'published').length,
        rejected: requests.filter(r => r.request_status === 'rejected').length,
      };

      console.log('[AdminDashboard] Stats loaded:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('[AdminDashboard] Error loading stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stats';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (err) {
      console.error('[AdminDashboard] Error signing out:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.body, styles.loadingText]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>FCP Memorials</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.submitted}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.under_review}</Text>
            <Text style={styles.statLabel}>Under Review</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.published}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => router.push('/(admin)/requests' as any)}
        >
          <Text style={commonStyles.buttonText}>View All Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.button, styles.secondaryButton]}
          onPress={handleSignOut}
        >
          <Text style={commonStyles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || 'An error occurred'}
        buttons={[
          {
            text: 'Retry',
            onPress: () => {
              setShowErrorModal(false);
              loadStats();
            },
            style: 'primary',
          },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: colors.highlight,
  },
});
