export const Colors = {
  primary: '#2563EB',
  primaryContainer: '#DBEAFE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E40AF',

  secondary: '#565E74',
  secondaryContainer: '#DAE2FD',
  onSecondary: '#FFFFFF',

  background: '#F8FAFC',
  onBackground: '#191C1E',

  surface: '#FFFFFF',
  surfaceDim: '#D8DADC',
  surfaceBright: '#F7F9FB',
  surfaceContainerLow: '#F2F4F6',
  surfaceContainer: '#ECEEF0',
  surfaceContainerHigh: '#E6E8EA',
  onSurface: '#191C1E',
  onSurfaceVariant: '#434655',

  outline: '#737686',
  outlineVariant: '#C3C6D7',

  success: '#006329',
  successContainer: '#C7FFCA',
  onSuccess: '#FFFFFF',

  warning: '#D97706',
  warningContainer: '#FEF3C7',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  containerMargin: 20,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headlineLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  headlineMd: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
};
