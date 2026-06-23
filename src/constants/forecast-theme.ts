/**
 * Forecast UI tokens — shared across surf components
 */

export const ForecastColors = {
  light: {
    accent: '#0284C7',
    accentSoft: '#E0F2FE',
    border: '#E2E8F0',
    surface: '#F8FAFC',
    surfaceElevated: '#FFFFFF',
    muted: '#64748B',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
  },
  dark: {
    accent: '#38BDF8',
    accentSoft: '#0C4A6E',
    border: '#334155',
    surface: '#0F172A',
    surfaceElevated: '#1E293B',
    muted: '#94A3B8',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
} as const;

export type ForecastTheme = typeof ForecastColors.light;
