/**
 * App font families — Hanken Grotesk (UI) + JetBrains Mono (data)
 */

import { Platform } from 'react-native';

/** Loaded via useFonts in root layout; falls back to system fonts until ready */
export const AppFonts = {
  sans: Platform.select({
    ios: 'HankenGrotesk_400Regular',
    android: 'HankenGrotesk_400Regular',
    default: 'Hanken Grotesk',
  })!,
  sansMedium: Platform.select({
    ios: 'HankenGrotesk_500Medium',
    android: 'HankenGrotesk_500Medium',
    default: 'Hanken Grotesk',
  })!,
  sansSemiBold: Platform.select({
    ios: 'HankenGrotesk_600SemiBold',
    android: 'HankenGrotesk_600SemiBold',
    default: 'Hanken Grotesk',
  })!,
  sansBold: Platform.select({
    ios: 'HankenGrotesk_700Bold',
    android: 'HankenGrotesk_700Bold',
    default: 'Hanken Grotesk',
  })!,
  sansExtraBold: Platform.select({
    ios: 'HankenGrotesk_800ExtraBold',
    android: 'HankenGrotesk_800ExtraBold',
    default: 'Hanken Grotesk',
  })!,
  mono: Platform.select({
    ios: 'JetBrainsMono_500Medium',
    android: 'JetBrainsMono_500Medium',
    default: 'JetBrains Mono',
  })!,
  monoSemiBold: Platform.select({
    ios: 'JetBrainsMono_600SemiBold',
    android: 'JetBrainsMono_600SemiBold',
    default: 'JetBrains Mono',
  })!,
} as const;
