import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  primary: { backgroundColor: Colors.primaryContainer },
  primaryText: { color: Colors.primary },

  secondary: { backgroundColor: Colors.secondaryContainer },
  secondaryText: { color: Colors.secondary },

  success: { backgroundColor: Colors.successContainer },
  successText: { color: Colors.success },

  warning: { backgroundColor: Colors.warningContainer },
  warningText: { color: Colors.warning },

  error: { backgroundColor: Colors.errorContainer },
  errorText: { color: Colors.error },

  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.outlineVariant },
  outlineText: { color: Colors.onSurfaceVariant },

  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
