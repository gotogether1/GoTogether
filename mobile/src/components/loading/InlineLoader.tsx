import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface InlineLoaderProps {
  label?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  label = 'Processing…',
  size = 'small',
  color = Colors.primary,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      aria-busy={true}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator size={size} color={color} style={styles.spinner} />
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  spinner: {
    marginRight: Spacing.xs + 2,
  },
  label: {
    ...Typography.bodyMd,
    fontWeight: '600',
  },
});
