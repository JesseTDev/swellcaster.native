import { useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ForecastColors, ForecastRadii, ForecastTypography } from '@/constants/forecast-theme';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = 'oauth_google' | 'oauth_apple' | 'oauth_facebook';

const OAUTH_PROVIDERS: { strategy: OAuthStrategy; label: string }[] = [
  { strategy: 'oauth_google', label: 'Continue with Google' },
  { strategy: 'oauth_apple', label: 'Continue with Apple' },
  { strategy: 'oauth_facebook', label: 'Continue with Facebook' },
];

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function SignInScreen() {
  useWarmUpBrowser();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;
  const { startSSOFlow } = useSSO();
  const [busyProvider, setBusyProvider] = useState<OAuthStrategy | null>(null);

  const finishAuth = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleOAuth = async (strategy: OAuthStrategy) => {
    setBusyProvider(strategy);
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'native' });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        finishAuth();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      Alert.alert('Could not continue', message);
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.three }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText style={styles.title}>Sign in or create account</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Required to record and share live surf conditions. Google, Apple, and Facebook work for
          new and returning users.
        </ThemedText>

        <View style={styles.oauthList}>
          {OAUTH_PROVIDERS.map(({ strategy, label }) => (
            <Pressable
              key={strategy}
              style={[
                styles.oauthButton,
                { borderColor: palette.borderStrong, backgroundColor: palette.surface },
              ]}
              onPress={() => void handleOAuth(strategy)}
              disabled={busyProvider != null}
            >
              {busyProvider === strategy ? (
                <ActivityIndicator color={palette.accent} />
              ) : (
                <ThemedText style={styles.oauthLabel}>{label}</ThemedText>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.cancelButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <ThemedText themeColor="textSecondary">Cancel</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    ...ForecastTypography.placeName,
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  oauthList: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  oauthButton: {
    minHeight: 48,
    borderRadius: ForecastRadii.inner,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  oauthLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
