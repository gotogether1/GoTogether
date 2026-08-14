import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const buttonStyles = [
    styles.button,
    isSecondary && styles.secondaryButton,
    isOutline && styles.outlineButton,
    isDanger && styles.dangerButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    isSecondary && styles.secondaryText,
    isOutline && styles.outlineText,
    isDanger && styles.dangerText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.onPrimary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: Colors.secondaryContainer,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.onSurface,
  },
  outlineText: {
    color: Colors.primary,
  },
  dangerText: {
    color: Colors.onError,
  },
  disabledText: {
    color: Colors.outline,
  },
});
