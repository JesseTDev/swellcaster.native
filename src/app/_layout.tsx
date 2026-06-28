import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthTokenSync } from '@/providers/auth-token-sync';
import { QueryProvider } from '@/providers/query-provider';

SplashScreen.preventAutoHideAsync();

function requirePublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to native/.env — see .env.example.',
    );
  }
  return key;
}

const publishableKey = requirePublishableKey();

const SwellDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ForecastColors.dark.accent,
    background: ForecastColors.dark.surface,
    card: ForecastColors.dark.surfaceContainer,
    text: ForecastColors.dark.onSurface,
    border: ForecastColors.dark.outlineVariant,
  },
};

const SwellLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ForecastColors.light.accentBright,
    background: ForecastColors.light.surface,
    card: ForecastColors.light.surfaceContainer,
    text: ForecastColors.light.onSurface,
    border: ForecastColors.light.outlineVariant,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthTokenSync />
      <QueryProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? SwellDarkTheme : SwellLightTheme}
        >
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="sign-in"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
