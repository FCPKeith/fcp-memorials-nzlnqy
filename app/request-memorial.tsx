
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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { apiPost } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const calculatePrice = (): number => {
    let total = TIER_PRICES[formData.tier_selected];
    
    // Add preservation add-on if selected
    if (formData.preservation_addon && formData.preservation_billing_cycle) {
      total += PRESERVATION_PRICES[formData.preservation_billing_cycle];
    }
    
    // Apply discount if requested
    if (formData.discount_requested) {
      total = total * 0.85; // 15% discount
    }
    
    return total;
  };

  const handleSubmit = async () => {
    console.log('[RequestMemorial] Submitting request with data:', {
      ...formData,
      story_notes: formData.story_notes.substring(0, 50) + '...' // Truncate for logging
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
      const response = await apiPost<{ id: string; payment_amount: number }>('/api/memorial-requests', formData);
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
          
          <Text style={styles.label}>Loved One's Name *</Text>
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
          style={[commonStyles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
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
  note: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
});
