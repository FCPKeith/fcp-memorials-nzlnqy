
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Map } from '@/components/Map';
import { apiGet } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

interface Memorial {
  id: string;
  full_name: string;
  latitude: number;
  longitude: number;
  location_visibility: string;
  public_url: string;
}

export default function MapScreen() {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  console.log('MapScreen: Rendered');

  useEffect(() => {
    loadMemorials();
  }, []);

  const loadMemorials = async () => {
    console.log('[Map] Loading memorials from map endpoint');
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<Memorial[]>('/api/memorials/map');
      console.log('[Map] Memorials loaded successfully:', data.length);
      setMemorials(data);
    } catch (err) {
      console.error('[Map] Error loading memorials:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load memorials';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (memorial: Memorial) => {
    console.log('MapScreen: Memorial marker pressed:', memorial.public_url);
    router.push(`/memorial/${memorial.public_url}` as any);
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.body, styles.loadingText]}>Loading memorials...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <>
        <View style={[commonStyles.container, styles.centerContent]}>
          <Text style={[commonStyles.title, styles.centerText]}>Error</Text>
          <Text style={[commonStyles.body, styles.centerText, styles.errorText]}>{error}</Text>
          <TouchableOpacity style={commonStyles.button} onPress={loadMemorials}>
            <Text style={commonStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error Loading Memorials"
          message={error}
          buttons={[
            {
              text: 'Retry',
              onPress: () => {
                setShowErrorModal(false);
                loadMemorials();
              },
              style: 'primary',
            },
            {
              text: 'Cancel',
              onPress: () => setShowErrorModal(false),
              style: 'default',
            },
          ]}
        />
      </>
    );
  }

  const markers = memorials.map((memorial) => ({
    id: memorial.id,
    latitude: memorial.latitude,
    longitude: memorial.longitude,
    title: memorial.full_name,
    description: 'Tap to view memorial',
    onPress: () => handleMarkerPress(memorial),
  }));

  const initialRegion = memorials.length > 0
    ? {
        latitude: memorials[0].latitude,
        longitude: memorials[0].longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FCP Memorials</Text>
        <Text style={styles.headerSubtitle}>
          {memorials.length} memorial{memorials.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>
      <Map
        markers={markers}
        initialRegion={initialRegion}
        style={styles.map}
        showsUserLocation={true}
      />
    </View>
  );
}

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
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  map: {
    flex: 1,
  },
});
