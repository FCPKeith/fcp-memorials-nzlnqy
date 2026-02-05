
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Modal } from '@/components/ui/Modal';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showInvalidQRModal, setShowInvalidQRModal] = useState(false);
  const router = useRouter();

  console.log('ScannerScreen: Rendered');

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      console.log('ScannerScreen: Requesting camera permission');
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    console.log('[Scanner] QR code scanned:', data);
    setScanned(true);

    // Extract memorial ID or public URL from the scanned data
    // Expected format: https://fcpmemorials.com/memorial/john-doe-1945
    // or just the memorial ID
    const memorialId = extractMemorialId(data);
    
    if (memorialId) {
      console.log('[Scanner] Navigating to memorial:', memorialId);
      router.push(`/memorial/${memorialId}` as any);
    } else {
      console.log('[Scanner] Invalid QR code format');
      setShowInvalidQRModal(true);
    }
  };

  const extractMemorialId = (data: string): string | null => {
    // Try to extract memorial ID from URL
    const urlMatch = data.match(/memorial\/([a-zA-Z0-9-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Check if it's a direct memorial ID (alphanumeric with hyphens)
    if (/^[a-zA-Z0-9-]+$/.test(data)) {
      return data;
    }
    
    return null;
  };

  if (!permission) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.body}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <IconSymbol
          ios_icon_name="camera.fill"
          android_material_icon_name="camera"
          size={64}
          color={colors.textSecondary}
          style={styles.icon}
        />
        <Text style={[commonStyles.title, styles.centerText]}>Camera Permission Required</Text>
        <Text style={[commonStyles.body, styles.centerText, styles.description]}>
          FCP Memorials needs camera access to scan QR codes at memorial sites.
        </Text>
        <TouchableOpacity style={commonStyles.button} onPress={requestPermission}>
          <Text style={commonStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>FCP Memorials</Text>
            <Text style={styles.headerSubtitle}>Scan QR Code</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.instruction}>
              Position the QR code within the frame
            </Text>
            {scanned && (
              <TouchableOpacity
                style={[commonStyles.button, styles.rescanButton]}
                onPress={() => setScanned(false)}
              >
                <Text style={commonStyles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>

      <Modal
        visible={showInvalidQRModal}
        onClose={() => {
          setShowInvalidQRModal(false);
          setScanned(false);
        }}
        title="Invalid QR Code"
        message="This QR code does not link to a memorial. Please scan a valid FCP Memorials QR code."
        buttons={[
          {
            text: 'Try Again',
            onPress: () => {
              setShowInvalidQRModal(false);
              setScanned(false);
            },
            style: 'primary',
          },
        ]}
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
  icon: {
    marginBottom: 24,
  },
  description: {
    marginTop: 12,
    marginBottom: 32,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 100 : 120,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  rescanButton: {
    marginTop: 8,
  },
});
