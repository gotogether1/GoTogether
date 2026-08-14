import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap | string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'compass-outline',
  title = 'No rides found near your route',
  message = 'Try adjusting your pickup landmark, departure time, or travel date.',
  actionLabel = 'Try Again',
  onAction,
}) => {
  const iconName = (typeof icon === 'string' && icon in Ionicons.glyphMap ? icon : 'compass-outline') as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={32} color={Colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onAction && actionLabel ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
  },
  actionText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
});
