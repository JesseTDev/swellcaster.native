/**
 * Forecast UI tokens — shared across surf components
 */

import { Platform, type ViewStyle } from 'react-native';

export const ForecastColors = {
  light: {
    accent: '#0284C7',
    accentSoft: '#E0F2FE',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    surface: '#F8FAFC',
    surfaceElevated: '#FFFFFF',
    muted: '#64748B',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    shadow: '#0F172A',
  },
  dark: {
    accent: '#38BDF8',
    accentSoft: '#0C4A6E',
    border: '#334155',
    borderStrong: '#475569',
    surface: '#0F172A',
    surfaceElevated: '#1E293B',
    muted: '#94A3B8',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    shadow: '#000000',
  },
} as const;

export type ForecastTheme = typeof ForecastColors.light;
export type ForecastColorScheme = keyof typeof ForecastColors;

export const ForecastRadii = {
  card: 14,
  inner: 10,
  chip: 999,
} as const;

export type ForecastCardVariant = 'default' | 'featured' | 'accent';

/** Shared elevation + border for forecast surfaces */
export function getForecastCardStyle(
  scheme: ForecastColorScheme,
  variant: ForecastCardVariant = 'default'
): ViewStyle {
  const palette = ForecastColors[scheme];

  const shadow: ViewStyle = Platform.select({
    ios: {
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: scheme === 'light' ? 0.08 : 0.35,
      shadowRadius: 10,
    },
    android: {
      elevation: scheme === 'light' ? 3 : 5,
    },
    default: {
      boxShadow:
        scheme === 'light'
          ? '0 2px 12px rgba(15, 23, 42, 0.08)'
          : '0 4px 16px rgba(0, 0, 0, 0.35)',
    },
  }) ?? {};

  const base: ViewStyle = {
    borderRadius: ForecastRadii.card,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surfaceElevated,
    overflow: 'hidden',
    ...shadow,
  };

  if (variant === 'featured') {
    return {
      ...base,
      borderColor: scheme === 'light' ? '#BAE6FD' : palette.borderStrong,
      ...(Platform.select({
        ios: {
          shadowColor: palette.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: scheme === 'light' ? 0.12 : 0.2,
          shadowRadius: 14,
        },
        android: { elevation: 4 },
        default: {
          boxShadow:
            scheme === 'light'
              ? '0 4px 20px rgba(2, 132, 199, 0.12)'
              : '0 4px 20px rgba(56, 189, 248, 0.15)',
        },
      }) ?? {}),
    };
  }

  if (variant === 'accent') {
    return {
      ...base,
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
      borderWidth: 1.5,
    };
  }

  return base;
}

/** Bordered inset surfaces (search, segmented controls, chips) */
export function getForecastInsetStyle(scheme: ForecastColorScheme): ViewStyle {
  const palette = ForecastColors[scheme];
  return {
    borderRadius: ForecastRadii.inner,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
  };
}

/** Compact typography scale for forecast UI */
export const ForecastTypography = {
  caption: { fontSize: 10, lineHeight: 14, letterSpacing: 0.3 },
  label: { fontSize: 10, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  body: { fontSize: 13, lineHeight: 18 },
  bodyBold: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  metric: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  metricLg: { fontSize: 18, lineHeight: 22, fontWeight: '700' as const },
  display: { fontSize: 36, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -1 },
  displayUnit: { fontSize: 16, lineHeight: 20, fontWeight: '500' as const },
  sectionTitle: { fontSize: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' as const, fontWeight: '700' as const },
  placeName: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
} as const;
