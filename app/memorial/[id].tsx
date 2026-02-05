
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { apiGet } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

interface Memorial {
  id: string;
  full_name: string;
  birth_date?: string;
  death_date?: string;
  story_text: string;
  photos: string[];
  video_link?: string;
  audio_narration_link?: string;
  latitude?: number;
  longitude?: number;
  location_visibility: string;
  qr_code_url: string;
  public_url: string;
  created_at: string;
}

// Helper to resolve image sources
function resolveImageSource(source: string | number | any): any {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source;
}

export default function MemorialDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  console.log('MemorialDetailScreen: Rendered with id:', id);

  useEffect(() => {
    if (id) {
      loadMemorial(id as string);
    }
  }, [id]);

  const loadMemorial = async (memorialId: string) => {
    console.log('[MemorialDetail] Loading memorial:', memorialId);
    setLoading(true);
    setError(null);

    try {
      // Try to fetch by public URL first
      const data = await apiGet<Memorial>(`/api/memorials/by-url/${memorialId}`);
      console.log('[MemorialDetail] Memorial loaded successfully:', data);
      setMemorial(data);
    } catch (err) {
      console.error('[MemorialDetail] Error loading memorial:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load memorial';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!memorial) return;

    console.log('MemorialDetailScreen: Sharing memorial:', memorial.public_url);
    try {
      await Share.share({
        message: `Remember ${memorial.full_name} - ${memorial.public_url}`,
        url: `https://fcpmemorials.com/memorial/${memorial.public_url}`,
      });
    } catch (err) {
      console.error('MemorialDetailScreen: Error sharing:', err);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const birthDateFormatted = formatDate(memorial?.birth_date);
  const deathDateFormatted = formatDate(memorial?.death_date);
  const datesText = birthDateFormatted && deathDateFormatted
    ? `${birthDateFormatted} - ${deathDateFormatted}`
    : '';

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Memorial',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerBackTitle: 'Back',
          }}
        />
        <View style={[commonStyles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.body, styles.loadingText]}>Loading memorial...</Text>
        </View>
      </>
    );
  }

  if (error || !memorial) {
    const errorDisplayText = error || 'Memorial not found';
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Memorial',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerBackTitle: 'Back',
          }}
        />
        <View style={[commonStyles.container, styles.centerContent]}>
          <Text style={[commonStyles.title, styles.centerText]}>Error</Text>
          <Text style={[commonStyles.body, styles.centerText, styles.errorText]}>
            {errorDisplayText}
          </Text>
          <TouchableOpacity style={commonStyles.button} onPress={() => router.back()}>
            <Text style={commonStyles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
            router.back();
          }}
          title="Memorial Not Found"
          message={errorDisplayText}
          buttons={[
            {
              text: 'Go Back',
              onPress: () => {
                setShowErrorModal(false);
                router.back();
              },
              style: 'primary',
            },
          ]}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: memorial.full_name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <IconSymbol
                ios_icon_name="square.and.arrow.up"
                android_material_icon_name="share"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        {memorial.photos.length > 0 && (
          <View style={styles.photoGallery}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {memorial.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={resolveImageSource(photo)}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.name}>{memorial.full_name}</Text>
          {datesText && <Text style={styles.dates}>{datesText}</Text>}

          <View style={commonStyles.divider} />

          <Text style={styles.storyTitle}>Their Story</Text>
          <Text style={styles.story}>{memorial.story_text}</Text>

          {memorial.qr_code_url && (
            <>
              <View style={commonStyles.divider} />
              <Text style={styles.qrTitle}>Memorial QR Code</Text>
              <Image
                source={resolveImageSource(memorial.qr_code_url)}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centerText: {
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 24,
  },
  shareButton: {
    marginRight: 8,
  },
  content: {
    paddingBottom: 40,
  },
  photoGallery: {
    height: 300,
    backgroundColor: colors.card,
  },
  photo: {
    width: width,
    height: 300,
  },
  infoSection: {
    padding: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dates: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  story: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
});
