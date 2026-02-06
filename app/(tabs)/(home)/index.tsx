import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>FCP Memorials</Text>
        <Text style={styles.subtitle}>Honoring Lives, Preserving Legacies</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroText}>
          Create lasting digital memorials for your loved ones. Share their stories, preserve their memories, and honor their legacy.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <IconSymbol
              ios_icon_name="qrcode"
              android_material_icon_name="qr-code"
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>1. Scan QR Code</Text>
            <Text style={styles.featureDescription}>
              Visit a memorial site and scan the QR code to view the memorial instantly
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <IconSymbol
              ios_icon_name="map"
              android_material_icon_name="map"
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>2. Explore Map</Text>
            <Text style={styles.featureDescription}>
              Discover memorials near you on our interactive map
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <IconSymbol
              ios_icon_name="heart.fill"
              android_material_icon_name="favorite"
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>3. Create Memorial</Text>
            <Text style={styles.featureDescription}>
              Request a memorial for your loved one with photos, stories, and more
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => router.push("/request-memorial" as any)}
        >
          <Text style={commonStyles.buttonText}>Request a Memorial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[commonStyles.button, styles.secondaryButton]}
          onPress={() => router.push("/(tabs)/(scanner)" as any)}
        >
          <Text style={commonStyles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Universal QR Code System</Text>
        <Text style={styles.infoText}>
          Our universal QR codes work internationally on any device. They automatically detect if the app is installed and fall back to the web version if not.
        </Text>
        <View style={styles.infoBadges}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>✓ Works Worldwide</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>✓ Auto App Detection</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>✓ Web Fallback</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  heroSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    gap: 12,
    marginBottom: 32,
  },
  secondaryButton: {
    backgroundColor: colors.highlight,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
});
