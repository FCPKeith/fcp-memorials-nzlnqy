
import { StyleSheet } from 'react-native';

// FCP Memorials - Dark, respectful, minimalist color palette
export const colors = {
  // Dark neutral palette
  background: '#0A0A0A',        // Deep black
  card: '#1A1A1A',              // Dark gray card
  border: '#2A2A2A',            // Subtle border
  
  // Text colors
  text: '#E8E8E8',              // Off-white for primary text
  textSecondary: '#A0A0A0',     // Gray for secondary text
  textTertiary: '#707070',      // Darker gray for tertiary text
  
  // Accent colors - muted and respectful
  primary: '#8B7355',           // Warm bronze/taupe
  secondary: '#5A6B7D',         // Muted slate blue
  accent: '#9B8B7E',            // Soft beige
  
  // Functional colors
  highlight: '#3A3A3A',         // Subtle highlight
  success: '#6B8E6B',           // Muted green
  error: '#8B5A5A',             // Muted red
  warning: '#8B7B5A',           // Muted amber
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
