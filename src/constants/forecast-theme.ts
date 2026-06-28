/**
 * Forecast UI tokens — Stitch M3 design system (React Native)
 */

import { type TextStyle, type ViewStyle } from 'react-native';

import { AppFonts } from '@/constants/fonts';

/** Stitch spacing tokens */
export const ForecastSpacing = {
  stackGap: 8,
  gutter: 12,
  containerMargin: 16,
  cardPadding: 16,
} as const;

export const ForecastColors = {
  light: {
    accent: '#00668A',
    accentBright: '#0284C7',
    secondary: '#7C3AED',
    tertiary: '#CA8A04',
    onSurface: '#1A2332',
    onSurfaceVariant: '#475569',
    surface: '#EEF2FA',
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#E2E8F4',
    surfaceContainerHighest: '#CBD5E1',
    surfaceDim: '#E8EEF8',
    outline: '#94A3B8',
    outlineVariant: '#CBD5E1',
    accentSoft: '#E0F2FE',
    border: 'rgba(0, 0, 0, 0.06)',
    borderStrong: 'rgba(0, 0, 0, 0.1)',
    surfaceElevated: 'rgba(255, 255, 255, 0.92)',
    muted: '#64748B',
    success: '#16A34A',
    warning: '#CA8A04',
    danger: '#DC2626',
    shadow: '#0F172A',
    ratingText: '#0B1326',
  },
  dark: {
    accent: '#8ED5FF',
    accentBright: '#38BDF8',
    secondary: '#DDB7FF',
    tertiary: '#FDC425',
    onSurface: '#DAE2FD',
    onSurfaceVariant: '#BDC8D1',
    surface: '#0B1326',
    surfaceContainer: '#171F33',
    surfaceContainerHigh: '#222A3D',
    surfaceContainerHighest: '#2D3449',
    surfaceDim: '#0B1326',
    outline: '#87929A',
    outlineVariant: '#3E484F',
    accentSoft: '#171F33',
    border: 'rgba(255, 255, 255, 0.05)',
    borderStrong: 'rgba(255, 255, 255, 0.08)',
    surfaceElevated: 'rgba(23, 31, 51, 0.85)',
    muted: '#BDC8D1',
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#EF4444',
    shadow: '#000000',
    ratingText: '#0B1326',
  },
} as const;

export type ForecastTheme = typeof ForecastColors.light;
export type ForecastColorScheme = keyof typeof ForecastColors;

export const ForecastRadii = {
  card: 12,
  inner: 8,
  chip: 999,
} as const;

export type ForecastCardVariant = 'default' | 'featured' | 'accent';

/** Glass-style elevated surface for forecast sections */
export function getForecastCardStyle(
  scheme: ForecastColorScheme,
  variant: ForecastCardVariant = 'default'
): ViewStyle {
  const palette = ForecastColors[scheme];

  const base: ViewStyle = {
    borderRadius: ForecastRadii.card,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceElevated,
    overflow: 'hidden',
  };

  if (variant === 'featured') {
    return {
      ...base,
      borderColor: scheme === 'light' ? palette.accentBright : palette.border,
    };
  }

  if (variant === 'accent') {
    return {
      ...base,
      backgroundColor: palette.surfaceContainer,
      borderColor: palette.outlineVariant,
    };
  }

  return base;
}

/** Bordered inset surfaces (search, segmented controls, chips) */
export function getForecastInsetStyle(scheme: ForecastColorScheme): ViewStyle {
  const palette = ForecastColors[scheme];
  return {
    borderRadius: ForecastRadii.inner + 4,
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}4D`,
    backgroundColor: palette.surfaceContainer,
  };
}

const sans = AppFonts.sans;
const sansSemiBold = AppFonts.sansSemiBold;
const sansBold = AppFonts.sansBold;
const sansExtraBold = AppFonts.sansExtraBold;
const mono = AppFonts.mono;
const monoSemiBold = AppFonts.monoSemiBold;

/** Stitch typography scale */
export const ForecastTypography = {
  caption: {
    fontFamily: sans,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
  } satisfies TextStyle,
  label: {
    fontFamily: sansExtraBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
    textTransform: 'uppercase' as const,
    fontWeight: '700',
  } satisfies TextStyle,
  body: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } satisfies TextStyle,
  bodyBold: {
    fontFamily: sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  } satisfies TextStyle,
  metric: {
    fontFamily: monoSemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  metricLg: {
    fontFamily: monoSemiBold,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  display: {
    fontFamily: sansExtraBold,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.72,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  displayLg: {
    fontFamily: sansBold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.28,
  } satisfies TextStyle,
  displayUnit: {
    fontFamily: sansBold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  } satisfies TextStyle,
  sectionTitle: {
    fontFamily: sansExtraBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
    textTransform: 'uppercase' as const,
    fontWeight: '700',
  } satisfies TextStyle,
  placeName: {
    fontFamily: sansBold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.28,
  } satisfies TextStyle,
  microData: {
    fontFamily: mono,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  headline: {
    fontFamily: sansSemiBold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  } satisfies TextStyle,
} as const;
