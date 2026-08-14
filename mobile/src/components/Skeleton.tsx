import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, Text } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <SkeletonBox width={100} height={24} borderRadius={12} />
        <SkeletonBox width={80} height={20} borderRadius={6} />
      </View>
      <View style={styles.routeBox}>
        <SkeletonBox width="80%" height={22} style={{ marginBottom: 8 }} />
        <SkeletonBox width="60%" height={22} />
      </View>
      <View style={styles.cardFooter}>
        <SkeletonBox width={120} height={16} />
        <SkeletonBox width={90} height={16} />
      </View>
    </View>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlayCard}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.overlayText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surfaceContainer,
  },
  cardContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  routeBox: {
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  overlayText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
});
