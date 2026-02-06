
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { apiPost } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { uploadFile } from '@/utils/upload';

interface RequestFormData {
  requester_name: string;
  requester_email: string;
  loved_one_name: string;
  birth_date: string;
  death_date: string;
  story_notes: string;
  location_info: string;
  tier_selected: 'tier_1_marked' | 'tier_2_remembered' | 'tier_3_enduring';
  discount_requested: boolean;
  discount_type?: 'military' | 'first_responder';
  country?: string;
  preservation_addon: boolean;
  preservation_billing_cycle?: 'monthly' | 'yearly';
  media_uploads: string[];
}

interface MediaFile {
  uri: string;
  type: 'photo' | 'video';
  name: string;
}

const TIER_PRICES = {
  tier_1_marked: 75,
  tier_2_remembered: 125,
  tier_3_enduring: 200,
};

const PRESERVATION_PRICES = {
  monthly: 2,
  yearly: 12,
};

const TIER_LIMITS = {
  tier_1_marked: { photos: 5, videos: 0 },
  tier_2_remembered: { photos: 10, videos: 1 },
  tier_3_enduring: { photos: 20, videos: 999 }, // "multiple" = high limit
};

// Helper to resolve image sources
function resolveImageSource(source: string | number | any): any {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source;
}

export default function RequestMemorialScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RequestFormData>({
    requester_name: '',
    requester_email: '',
    loved_one_name: '',
    birth_date: '',
    death_date: '',
    story_notes: '',
    location_info: '',
    tier_selected: 'tier_2_remembered',
    discount_requested: false,
    country: '',
    preservation_addon: false,
    media_uploads: [],
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const tierLimits = TIER_LIMITS[formData.tier_selected];
  const photoCount = mediaFiles.filter(f => f.type === 'photo').length;
  const videoCount = mediaFiles.filter(f => f.type === 'video').length;

  const calculatePrice = (): number => {
    let total = TIER_PRICES[formData.tier_selected];
    
    if (formData.preservation_addon && formData.preservation_billing_cycle) {
      total += PRESERVATION_PRICES[formData.preservation_billing_cycle];
    }
    
    if (formData.discount_requested) {
      total = total * 0.85;
    }
    
    return total;
  };

  const pickImages = async () => {
    console.log('[RequestMemorial] User tapped Add Photos button');
    
    if (photoCount >= tierLimits.photos) {
      setError(`Your selected tier allows up to ${tierLimits.photos} photos`);
      setShowErrorModal(true);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      setError('Permission to access photos is required');
      setShowErrorModal(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: tierLimits.photos - photoCount,
    });

    if (!result.canceled && result.assets) {
      console.log('[RequestMemorial] Selected photos:', result.assets.length);
      const newPhotos: MediaFile[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'photo' as const,
        name: asset.fileName || `photo-${Date.now()}.jpg`,
      }));
      setMediaFiles([...mediaFiles, ...newPhotos]);
    }
  };

  const pickVideo = async () => {
    console.log('[RequestMemorial] User tapped Add Video button');
    
    if (videoCount >= tierLimits.videos) {
      setError(`Your selected tier allows up to ${tierLimits.videos} video${tierLimits.videos === 1 ? '' : 's'}`);
      setShowErrorModal(true);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      setError('Permission to access videos is required');
      setShowErrorModal(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      console.log('[RequestMemorial] Selected video:', result.assets[0].uri);
      const newVideo: MediaFile = {
        uri: result.assets[0].uri,
        type: 'video',
        name: result.assets[0].fileName || `video-${Date.now()}.mp4`,
      };
      setMediaFiles([...mediaFiles, newVideo]);
    }
  };

  const removeMedia = (index: number) => {
    console.log('[RequestMemorial] Removing media at index:', index);
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
  };

  const handleSubmit = async () => {
    console.log('[RequestMemorial] Submitting request with data:', {
      ...formData,
      story_notes: formData.story_notes.substring(0, 50) + '...',
      mediaCount: mediaFiles.length,
    });

    // Validation
    if (!formData.requester_name || !formData.requester_email || !formData.loved_one_name || !formData.story_notes) {
      setError('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload media files first
      let uploadedUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        console.log('[RequestMemorial] Uploading media files:', mediaFiles.length);
        setUploadingMedia(true);
        
        try {
          const uploadPromises = mediaFiles.map(async (file) => {
            console.log('[RequestMemorial] Uploading file:', file.name);
            const result = await uploadFile(file.uri, 'file');
            return result.url;
          });
          
          uploadedUrls = await Promise.all(uploadPromises);
          console.log('[RequestMemorial] All media uploaded successfully:', uploadedUrls.length);
        } catch (uploadError) {
          console.error('[RequestMemorial] Media upload failed:', uploadError);
          throw new Error('Failed to upload media files. Please try again.');
        } finally {
          setUploadingMedia(false);
        }
      }

      // Submit the request with uploaded media URLs
      const submissionData = {
        ...formData,
        media_uploads: uploadedUrls,
      };

      const response = await apiPost<{ id: string; payment_amount: number }>('/api/memorial-requests', submissionData);
      console.log('[RequestMemorial] Request submitted successfully. Email notification will be sent to floatincoffin@icloud.com');
      console.log('[RequestMemorial] Response:', response);
      setRequestId(response.id);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('[RequestMemorial] Error submitting request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const photoLimitText = `${photoCount}/${tierLimits.photos} photos`;
  const videoLimitText = tierLimits.videos === 0 ? 'No videos' : `${videoCount}/${tierLimits.videos} video${tierLimits.videos === 1 ? '' : 's'}`;
  const canAddPhotos = photoCount < tierLimits.photos;
  const canAddVideos = videoCount < tierLimits.videos;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Request Memorial',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <Text style={styles.header}>Request a Memorial</Text>
        <Text style={styles.description}>
          Create a lasting tribute for your loved one. All memorials are professionally curated by FCP Memorials with dignity and care.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Viewing memorials is always free{'\n'}
            ✓ Payment required only for memorial creation{'\n'}
            ✓ Submission reviewed before payment{'\n'}
            ✓ No aggressive upsells or pressure
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.requester_name}
            onChangeText={(text) => setFormData({ ...formData, requester_name: text })}
            placeholder="Enter your name"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Your Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.requester_email}
            onChangeText={(text) => setFormData({ ...formData, requester_email: text })}
            placeholder="Enter your email"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memorial Information</Text>
          
          <Text style={styles.label}>Loved One&apos;s Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.loved_one_name}
            onChangeText={(text) => setFormData({ ...formData, loved_one_name: text })}
            placeholder="Enter their full name"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Birth Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.birth_date}
            onChangeText={(text) => setFormData({ ...formData, birth_date: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Death Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.death_date}
            onChangeText={(text) => setFormData({ ...formData, death_date: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Their Story *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.story_notes}
            onChangeText={(text) => setFormData({ ...formData, story_notes: text })}
            placeholder="Share their story, memories, and what made them special..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={6}
          />

          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.location_info}
            onChangeText={(text) => setFormData({ ...formData, location_info: text })}
            placeholder="Cemetery or memorial location"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Country (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            placeholder="Country"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Tier</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the memorial service that honors their story
          </Text>
          
          <TouchableOpacity
            style={[styles.tierCard, formData.tier_selected === 'tier_1_marked' && styles.tierCardSelected]}
            onPress={() => setFormData({ ...formData, tier_selected: 'tier_1_marked' })}
          >
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>🕯️</Text>
              <View style={styles.tierTitleContainer}>
                <Text style={styles.tierName}>Tier I — Marked</Text>
                <Text style={styles.tierPrice}>$75 one-time</Text>
              </View>
            </View>
            <Text style={styles.tierSubtitle}>Foundational Memorial</Text>
            <Text style={styles.tierDescription}>
              • GPS grave pin on the map{'\n'}
              • Name, dates, and location{'\n'}
              • Short written remembrance{'\n'}
              • Upload up to 5 photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tierCard, formData.tier_selected === 'tier_2_remembered' && styles.tierCardSelected]}
            onPress={() => setFormData({ ...formData, tier_selected: 'tier_2_remembered' })}
          >
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>🎙️</Text>
              <View style={styles.tierTitleContainer}>
                <Text style={styles.tierName}>Tier II — Remembered</Text>
                <Text style={styles.tierPrice}>$125 one-time</Text>
              </View>
            </View>
            <Text style={styles.tierSubtitle}>Narrated Story Memorial</Text>
            <Text style={styles.tierDescription}>
              Everything in Tier I, plus:{'\n'}
              • Extended written story{'\n'}
              • Narrated audio memorial (voice by FCP){'\n'}
              • Upload up to 10 photos{'\n'}
              • Upload 1 short video clip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tierCard, formData.tier_selected === 'tier_3_enduring' && styles.tierCardSelected]}
            onPress={() => setFormData({ ...formData, tier_selected: 'tier_3_enduring' })}
          >
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>🪦</Text>
              <View style={styles.tierTitleContainer}>
                <Text style={styles.tierName}>Tier III — Enduring</Text>
                <Text style={styles.tierPrice}>$200 one-time</Text>
              </View>
            </View>
            <Text style={styles.tierSubtitle}>Full Legacy Memorial</Text>
            <Text style={styles.tierDescription}>
              Everything in Tier II, plus:{'\n'}
              • Expanded life story{'\n'}
              • Multiple narration segments{'\n'}
              • Upload up to 20 photos{'\n'}
              • Upload multiple video clips{'\n'}
              • Priority review{'\n'}
              • Ongoing edits included
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media Uploads</Text>
          <Text style={styles.sectionSubtitle}>
            {photoLimitText} • {videoLimitText}
          </Text>

          <View style={styles.mediaButtonsRow}>
            <TouchableOpacity
              style={[styles.mediaButton, !canAddPhotos && styles.mediaButtonDisabled]}
              onPress={pickImages}
              disabled={!canAddPhotos}
            >
              <IconSymbol
                ios_icon_name="photo"
                android_material_icon_name="photo"
                size={24}
                color={canAddPhotos ? colors.primary : colors.textTertiary}
              />
              <Text style={[styles.mediaButtonText, !canAddPhotos && styles.mediaButtonTextDisabled]}>
                Add Photos
              </Text>
            </TouchableOpacity>

            {tierLimits.videos > 0 && (
              <TouchableOpacity
                style={[styles.mediaButton, !canAddVideos && styles.mediaButtonDisabled]}
                onPress={pickVideo}
                disabled={!canAddVideos}
              >
                <IconSymbol
                  ios_icon_name="video"
                  android_material_icon_name="videocam"
                  size={24}
                  color={canAddVideos ? colors.primary : colors.textTertiary}
                />
                <Text style={[styles.mediaButtonText, !canAddVideos && styles.mediaButtonTextDisabled]}>
                  Add Video
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mediaFiles.length > 0 && (
            <View style={styles.mediaGrid}>
              {mediaFiles.map((file, index) => (
                <View key={index} style={styles.mediaItem}>
                  {file.type === 'photo' ? (
                    <Image source={resolveImageSource(file.uri)} style={styles.mediaThumbnail} />
                  ) : (
                    <View style={[styles.mediaThumbnail, styles.videoPlaceholder]}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle-filled"
                        size={40}
                        color={colors.text}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedia(index)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {mediaFiles.length === 0 && (
            <View style={styles.emptyMediaState}>
              <IconSymbol
                ios_icon_name="photo.on.rectangle"
                android_material_icon_name="photo-library"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyMediaText}>No media uploaded yet</Text>
              <Text style={styles.emptyMediaSubtext}>
                Photos and videos help tell their story
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optional Add-On</Text>
          
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setFormData({ 
              ...formData, 
              preservation_addon: !formData.preservation_addon,
              preservation_billing_cycle: !formData.preservation_addon ? 'yearly' : undefined
            })}
          >
            <View style={[styles.checkbox, formData.preservation_addon && styles.checkboxChecked]}>
              {formData.preservation_addon && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.addonTextContainer}>
              <Text style={styles.checkboxLabel}>🌍 Preservation & Hosting</Text>
              <Text style={styles.addonDescription}>
                Long-term hosting, ability to update text and media, continued public access
              </Text>
            </View>
          </TouchableOpacity>

          {formData.preservation_addon && (
            <View style={styles.billingOptions}>
              <TouchableOpacity
                style={[styles.billingButton, formData.preservation_billing_cycle === 'monthly' && styles.billingButtonSelected]}
                onPress={() => setFormData({ ...formData, preservation_billing_cycle: 'monthly' })}
              >
                <Text style={styles.billingButtonTitle}>Monthly</Text>
                <Text style={styles.billingButtonPrice}>$2/month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.billingButton, formData.preservation_billing_cycle === 'yearly' && styles.billingButtonSelected]}
                onPress={() => setFormData({ ...formData, preservation_billing_cycle: 'yearly' })}
              >
                <Text style={styles.billingButtonTitle}>Yearly</Text>
                <Text style={styles.billingButtonPrice}>$12/year</Text>
                <Text style={styles.billingButtonSavings}>Save $12</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount (Optional)</Text>
          
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setFormData({ ...formData, discount_requested: !formData.discount_requested })}
          >
            <View style={[styles.checkbox, formData.discount_requested && styles.checkboxChecked]}>
              {formData.discount_requested && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>I qualify for military or first responder discount (15% off)</Text>
          </TouchableOpacity>

          {formData.discount_requested && (
            <View style={styles.discountOptions}>
              <TouchableOpacity
                style={[styles.discountButton, formData.discount_type === 'military' && styles.discountButtonSelected]}
                onPress={() => setFormData({ ...formData, discount_type: 'military' })}
              >
                <Text style={styles.discountButtonText}>Military</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.discountButton, formData.discount_type === 'first_responder' && styles.discountButtonSelected]}
                onPress={() => setFormData({ ...formData, discount_type: 'first_responder' })}
              >
                <Text style={styles.discountButtonText}>First Responder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>${calculatePrice()}</Text>
        </View>

        <TouchableOpacity
          style={[commonStyles.button, (loading || uploadingMedia) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || uploadingMedia}
        >
          {loading || uploadingMedia ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.text} />
              <Text style={styles.loadingText}>
                {uploadingMedia ? 'Uploading media...' : 'Submitting...'}
              </Text>
            </View>
          ) : (
            <Text style={commonStyles.buttonText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Required fields. Your request will be reviewed before payment is required.{'\n'}
          Viewing memorials is always free — payment is only for creating a memorial.
        </Text>
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

      <Modal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        title="Request Submitted"
        message={`Your memorial request has been submitted successfully. Request ID: ${requestId}. An email notification has been sent to FCP Memorials, and you will receive payment instructions via email shortly.`}
        buttons={[
          {
            text: 'Done',
            onPress: () => {
              setShowSuccessModal(false);
              router.back();
            },
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
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  tierCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tierCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tierTitleContainer: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  tierSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  tierDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  mediaButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  mediaButtonTextDisabled: {
    color: colors.textTertiary,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  emptyMediaState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyMediaText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyMediaSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  addonTextContainer: {
    flex: 1,
  },
  addonDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    lineHeight: 16,
  },
  billingOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  billingButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  billingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  billingButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  billingButtonPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billingButtonSavings: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  discountOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  discountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  discountButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  discountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  note: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
});
