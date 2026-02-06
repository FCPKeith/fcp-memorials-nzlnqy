
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedGet, authenticatedPut } from '@/utils/api';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Modal } from '@/components/ui/Modal';
import { IconSymbol } from '@/components/IconSymbol';

interface MemorialRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  loved_one_name: string;
  birth_date?: string;
  death_date?: string;
  story_notes: string;
  media_uploads?: string[];
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

// Helper to resolve image sources
function resolveImageSource(source: string | number | any): any {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source;
}

export default function MemorialRequestsScreen() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [requests, setRequests] = useState<MemorialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[AdminRequests] User not authenticated, redirecting to auth');
      router.replace('/auth');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    console.log('[AdminRequests] Loading memorial requests');
    setLoading(true);
    setError(null);

    try {
      const data = await authenticatedGet<MemorialRequest[]>('/api/admin/memorial-requests');
      console.log('[AdminRequests] Loaded requests:', data.length);
      setRequests(data);
    } catch (err) {
      console.error('[AdminRequests] Error loading requests:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    console.log('[AdminRequests] Updating request status:', requestId, newStatus);

    try {
      await authenticatedPut(`/api/admin/memorial-requests/${requestId}/status`, {
        request_status: newStatus,
      });
      console.log('[AdminRequests] Status updated successfully');
      await loadRequests();
    } catch (err) {
      console.error('[AdminRequests] Error updating status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      setShowErrorModal(true);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTierName = (tier: string): string => {
    const tierMap: Record<string, string> = {
      tier_1_marked: 'Tier I — Marked',
      tier_2_remembered: 'Tier II — Remembered',
      tier_3_enduring: 'Tier III — Enduring',
    };
    return tierMap[tier] || tier;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      submitted: colors.primary,
      under_review: '#FFA500',
      approved: '#4CAF50',
      published: '#2196F3',
      rejected: '#F44336',
    };
    return statusColors[status] || colors.textSecondary;
  };

  const mediaCount = (request: MemorialRequest): string => {
    const uploads = request.media_uploads || [];
    const count = uploads.length;
    const countText = count === 0 ? 'No media' : count === 1 ? '1 file' : `${count} files`;
    return countText;
  };

  if (authLoading || loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <Text style={styles.header}>Memorial Requests</Text>
        <Text style={styles.description}>
          Review and manage memorial requests from families
        </Text>

        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No memorial requests yet</Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => {
              const isExpanded = expandedRequestId === request.id;
              const mediaCountText = mediaCount(request);
              
              return (
                <View key={request.id} style={styles.requestCard}>
                  <TouchableOpacity
                    onPress={() => setExpandedRequestId(isExpanded ? null : request.id)}
                  >
                    <View style={styles.requestHeader}>
                      <View style={styles.requestHeaderLeft}>
                        <Text style={styles.lovedOneName}>{request.loved_one_name}</Text>
                        <Text style={styles.requesterInfo}>
                          Requested by {request.requester_name}
                        </Text>
                      </View>
                      <View style={styles.requestHeaderRight}>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(request.request_status) },
                          ]}
                        >
                          <Text style={styles.statusText}>{request.request_status}</Text>
                        </View>
                        <IconSymbol
                          ios_icon_name={isExpanded ? 'chevron.up' : 'chevron.down'}
                          android_material_icon_name={isExpanded ? 'expand-less' : 'expand-more'}
                          size={24}
                          color={colors.textSecondary}
                        />
                      </View>
                    </View>

                    <View style={styles.requestMeta}>
                      <Text style={styles.metaText}>
                        {formatTierName(request.tier_selected)}
                      </Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.metaText}>
                        ${(request.payment_amount / 100).toFixed(2)}
                      </Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.metaText}>
                        {formatDate(request.created_at)}
                      </Text>
                    </View>

                    {request.preservation_addon && (
                      <View style={styles.addonBadge}>
                        <Text style={styles.addonText}>
                          🌍 Preservation ({request.preservation_billing_cycle})
                        </Text>
                      </View>
                    )}

                    <View style={styles.mediaCountRow}>
                      <IconSymbol
                        ios_icon_name="photo"
                        android_material_icon_name="photo"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.mediaCountText}>{mediaCountText}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Contact:</Text>
                        <Text style={styles.detailValue}>{request.requester_email}</Text>
                      </View>

                      {(request.birth_date || request.death_date) && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Dates:</Text>
                          <Text style={styles.detailValue}>
                            {request.birth_date || '?'} — {request.death_date || '?'}
                          </Text>
                        </View>
                      )}

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Story:</Text>
                        <Text style={styles.storyText}>{request.story_notes}</Text>
                      </View>

                      {request.media_uploads && request.media_uploads.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Uploaded Media:</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.mediaGallery}>
                              {request.media_uploads.map((url, index) => {
                                const isVideo = url.includes('.mp4') || url.includes('.mov');
                                
                                return (
                                  <View key={index} style={styles.mediaPreview}>
                                    {isVideo ? (
                                      <View style={styles.videoPreview}>
                                        <IconSymbol
                                          ios_icon_name="play.circle.fill"
                                          android_material_icon_name="play-circle-filled"
                                          size={40}
                                          color={colors.text}
                                        />
                                      </View>
                                    ) : (
                                      <Image
                                        source={resolveImageSource(url)}
                                        style={styles.imagePreview}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          </ScrollView>
                        </View>
                      )}

                      {request.discount_requested && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Discount:</Text>
                          <Text style={styles.detailValue}>
                            {request.discount_type} (15% off)
                          </Text>
                        </View>
                      )}

                      <View style={styles.actionButtons}>
                        {request.request_status === 'submitted' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.reviewButton]}
                            onPress={() => updateRequestStatus(request.id, 'under_review')}
                          >
                            <Text style={styles.actionButtonText}>Start Review</Text>
                          </TouchableOpacity>
                        )}

                        {request.request_status === 'under_review' && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.approveButton]}
                              onPress={() => updateRequestStatus(request.id, 'approved')}
                            >
                              <Text style={styles.actionButtonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.rejectButton]}
                              onPress={() => updateRequestStatus(request.id, 'rejected')}
                            >
                              <Text style={styles.actionButtonText}>Reject</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {request.request_status === 'approved' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.publishButton]}
                            onPress={() => updateRequestStatus(request.id, 'published')}
                          >
                            <Text style={styles.actionButtonText}>Publish</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flex: 1,
  },
  requestHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lovedOneName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  requesterInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addonBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  addonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  mediaCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaCountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  storyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mediaGallery: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#FFA500',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  publishButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
