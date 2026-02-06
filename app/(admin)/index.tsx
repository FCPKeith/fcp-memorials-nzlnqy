
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
import { Modal } from '@/components/ui/Modal';
import { colors, commonStyles } from '@/styles/commonStyles';
import { authenticatedGet } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

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
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log("AdminDashboard: Auth state changed", { user: user?.email, authLoading });
    if (!authLoading && !user) {
      console.log("AdminDashboard: No user found, redirecting to auth");
      router.replace('/auth');
    } else if (!authLoading && user) {
      console.log("AdminDashboard: User authenticated, loading stats");
      loadStats();
    }
  }, [user, authLoading]);

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log("AdminDashboard: Fetching memorial requests to calculate stats...");
      
      // Fetch all memorial requests
      const requests = await authenticatedGet<any[]>('/api/admin/memorial-requests');
      console.log("AdminDashboard: Loaded requests:", requests.length);
      
      // Calculate stats from the requests
      const calculatedStats: RequestStats = {
        total: requests.length,
        submitted: requests.filter(r => r.request_status === 'submitted').length,
        under_review: requests.filter(r => r.request_status === 'under_review').length,
        approved: requests.filter(r => r.request_status === 'approved').length,
        published: requests.filter(r => r.request_status === 'published').length,
        rejected: requests.filter(r => r.request_status === 'rejected').length,
      };
      
      console.log("AdminDashboard: Stats calculated:", calculatedStats);
      setStats(calculatedStats);
    } catch (error: any) {
      console.error("AdminDashboard: Failed to load stats:", error);
      setErrorMessage(error.message || 'Failed to load statistics');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("AdminDashboard: User confirmed sign out");
    setShowSignOutModal(false);
    try {
      await signOut();
      console.log("AdminDashboard: Sign out complete");
    } catch (error: any) {
      console.error("AdminDashboard: Sign out error:", error);
      setErrorMessage(error.message || 'Failed to sign out');
      setShowErrorModal(true);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  const userEmail = user.email || 'Admin';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.emailText}>{userEmail}</Text>
        </View>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setShowSignOutModal(true)}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Request Statistics</Text>
          
          <View style={styles.statsGrid}>
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
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/requests')}
        >
          <Text style={styles.actionButtonText}>View All Requests</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        buttons={[
          {
            text: "Cancel",
            onPress: () => setShowSignOutModal(false),
            style: "cancel",
          },
          {
            text: "Sign Out",
            onPress: handleSignOut,
            style: "destructive",
          },
        ]}
      />

      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setShowErrorModal(false),
            style: "primary",
          },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.error,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
