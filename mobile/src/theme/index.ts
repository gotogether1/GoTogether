export const Colors = {
  // Brand & Accent Colors
  primary: '#2563EB', // Royal Blue
  primaryDark: '#1D4ED8',
  primaryContainer: '#EFF6FF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E40AF',

  secondary: '#0F172A', // Slate Dark
  secondaryContainer: '#F1F5F9',
  onSecondary: '#FFFFFF',

  // Background & Surfaces
  background: '#F8FAFC',
  onBackground: '#0F172A',

  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceBorder: '#E2E8F0',
  surfaceContainer: '#E2E8F0',
  surfaceContainerLow: '#F1F5F9',
  surfaceContainerHigh: '#CBD5E1',
  onSurface: '#0F172A',
  onSurfaceVariant: '#64748B',

  // Borders & Outlines
  outline: '#94A3B8',
  outlineVariant: '#CBD5E1',

  // Semantic Status Colors
  success: '#059669', // Emerald Green
  successContainer: '#ECFDF5',
  onSuccess: '#FFFFFF',

  warning: '#D97706', // Amber
  warningContainer: '#FEF3C7',

  error: '#DC2626', // Crimson Red
  errorContainer: '#FEF2F2',
  onError: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  containerMargin: 16,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  displayLg: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
  headlineLg: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32, letterSpacing: -0.3 },
  headlineMd: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  labelLg: { fontSize: 14, fontWeight: '700' as const, lineHeight: 20 },
  labelMd: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  labelSm: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};
