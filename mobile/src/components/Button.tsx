import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isInteractionDisabled = loading || disabled;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const getBackgroundColor = () => {
    if (isInteractionDisabled && variant === 'primary') return '#93C5FD';
    if (variant === 'secondary') return Colors.secondary;
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    if (variant === 'danger') return Colors.error;
    return Colors.primary;
  };

  const getTextColor = () => {
    if (variant === 'outline') return Colors.primary;
    if (variant === 'ghost') return Colors.onSurface;
    if (variant === 'secondary') return Colors.onSecondary;
    return Colors.onPrimary;
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && styles.outlineBorder,
          Shadows.sm,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isInteractionDisabled}
        activeOpacity={0.88}
        aria-busy={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <>
            {icon ? <Text style={styles.icon}>{icon}</Text> : null}
            <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 18,
    marginRight: Spacing.xs + 2,
  },
  text: {
    ...Typography.labelLg,
    fontWeight: '700',
    fontSize: 16,
  },
});
