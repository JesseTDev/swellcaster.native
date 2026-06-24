import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { videosApi } from '@/services/api/endpoints';
import type { CoordinatesParams } from '@/services/api/types';

interface RecordConditionVideoButtonProps {
  coords: CoordinatesParams;
  disabled?: boolean;
  disabledHint?: string;
  locationLabel?: string;
  onUploaded?: () => void;
}

export function RecordConditionVideoButton({
  coords,
  disabled = false,
  disabledHint,
  locationLabel,
  onUploaded,
}: RecordConditionVideoButtonProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handlePress = async () => {
    if (disabled || uploading) {
      if (disabled && disabledHint) {
        Alert.alert('Location required', disabledHint);
      }
      return;
    }

    if (coords.lat === 0 && coords.lon === 0) {
      Alert.alert('Location required', 'Enable location so your video pins to where you are.');
      return;
    }

    const camera = await ImagePicker.requestCameraPermissionsAsync();
    if (!camera.granted) {
      Alert.alert('Camera required', 'Allow camera access to record surf conditions.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const name = asset.fileName ?? `conditions-${Date.now()}.mp4`;
    const type = asset.mimeType ?? 'video/mp4';

    setUploading(true);
    try {
      await videosApi.upload(coords, { uri: asset.uri, name, type });
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      onUploaded?.();
      Alert.alert(
        'Uploaded',
        'Your surf forecast video is live at this location for the next 12 hours.'
      );
    } catch (error) {
      let message = 'Could not upload video. Try again at the break.';
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as { error?: string } | undefined;
        if (apiError?.error) message = apiError.error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Upload failed', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            borderColor: disabled ? palette.border : palette.accent,
            backgroundColor: disabled ? palette.surface : palette.accentSoft,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel="Record a surf forecast video"
      >
        {uploading ? (
          <ActivityIndicator color={palette.accent} size="small" />
        ) : (
          <>
            <View
              style={[
                styles.filmIcon,
                {
                  backgroundColor: disabled ? palette.muted : palette.accent,
                },
              ]}
            >
              <PlatformSymbol
                name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
                size={18}
                tintColor="#FFFFFF"
              />
            </View>
            <ThemedText
              style={[
                styles.label,
                { color: disabled ? palette.muted : palette.accent },
              ]}
            >
              Record a surf forecast video
            </ThemedText>
          </>
        )}
      </Pressable>
      {!disabled && locationLabel ? (
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          At {locationLabel} · using your GPS
        </ThemedText>
      ) : null}
      {disabled && disabledHint ? (
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          {disabledHint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filmIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
});
