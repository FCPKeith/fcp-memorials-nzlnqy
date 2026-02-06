
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
import { authenticatedGet, authenticatedPut } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

interface MemorialRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  loved_one_name: string;
  birth_date?: string;
  death_date?: string;
  story_notes: string;
  tier_selected: string;
  discount_requested: boolean;
  discount_type?: string;
  payment_status: string;
  payment_amount: number;
  request_status: string;
  created_at: string;
  preservation_addon?: boolean;
  preservation_billing_cycle?: 'monthly' | 'yearly';
}

export default function MemorialRequestsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<MemorialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MemorialRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    } else if (user) {
      loadRequests();
    }
  }, [user, authLoading]);

  const loadRequests = async () => {
    console.log('[MemorialRequests] Loading requests');
    setLoading(true);
    setError(null);

    try {
      const data = await authenticatedGet<MemorialRequest[]>('/api/admin/memorial-requests');
      console.log('[MemorialRequests] Requests loaded:', data.length);
      setRequests(data);
    } catch (err) {
      console.error('[MemorialRequests] Error loading requests:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    console.log('[MemorialRequests] Updating request status:', requestId, newStatus);

    try {
      await authenticatedPut(`/api/admin/memorial-requests/${requestId}`, {
        request_status: newStatus,
      });
      console.log('[MemorialRequests] Status updated successfully');
      setShowStatusModal(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err) {
      console.error('[MemorialRequests] Error updating status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      setShowErrorModal(true);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTierName = (tier: string): string => {
    const tierMap: Record<string, string> = {
      tier_1_marked: 'Tier I — Marked ($75)',
      tier_2_remembered: 'Tier II — Remembered ($125)',
      tier_3_enduring: 'Tier III — Enduring ($200)',
      // Legacy tier names (for backwards compatibility)
      basic: 'Basic ($299)',
      standard: 'Standard ($499)',
      premium: 'Premium ($799)',
    };
    return tierMap[tier] || tier;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'submitted':
        return colors.warning;
      case 'under_review':
        return colors.secondary;
      case 'approved':
        return colors.success;
      case 'published':
        return colors.primary;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.body, styles.loadingText]}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Memorial Requests ({requests.length})</Text>

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={commonStyles.body}>No memorial requests found.</Text>
        </View>
      ) : (
        requests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => {
              setSelectedRequest(request);
              setShowStatusModal(true);
            }}
          >
            <View style={styles.requestHeader}>
              <Text style={styles.requestName}>{request.loved_one_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.request_status) }]}>
                <Text style={styles.statusText}>{request.request_status}</Text>
              </View>
            </View>

            <Text style={styles.requestDetail}>Requester: {request.requester_name}</Text>
            <Text style={styles.requestDetail}>Email: {request.requester_email}</Text>
            <Text style={styles.requestDetail}>
              Dates: {formatDate(request.birth_date)} - {formatDate(request.death_date)}
            </Text>
            <Text style={styles.requestDetail}>Tier: {formatTierName(request.tier_selected)}</Text>
            {request.preservation_addon && (
              <Text style={styles.requestDetail}>
                Preservation Add-on: {request.preservation_billing_cycle === 'monthly' ? '$2/month' : '$12/year'}
              </Text>
            )}
            <Text style={styles.requestDetail}>
              Payment: ${request.payment_amount} ({request.payment_status})
            </Text>
            {request.discount_requested && (
              <Text style={styles.requestDetail}>
                Discount: {request.discount_type} (15% off)
              </Text>
            )}
            <Text style={styles.requestDetail}>Submitted: {formatDate(request.created_at)}</Text>
          </TouchableOpacity>
        ))
      )}

      {selectedRequest && (
        <Modal
          visible={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedRequest(null);
          }}
          title="Update Request Status"
          message={`Change status for ${selectedRequest.loved_one_name}?`}
        >
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.warning }]}
              onPress={() => updateRequestStatus(selectedRequest.id, 'under_review')}
            >
              <Text style={styles.statusButtonText}>Under Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.success }]}
              onPress={() => updateRequestStatus(selectedRequest.id, 'approved')}
            >
              <Text style={styles.statusButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.error }]}
              onPress={() => updateRequestStatus(selectedRequest.id, 'rejected')}
            >
              <Text style={styles.statusButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || 'An error occurred'}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowErrorModal(false),
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
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  requestDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusButtons: {
    gap: 12,
    marginTop: 16,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
