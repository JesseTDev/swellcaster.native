/**
 * Current Conditions Component
 * Displays current surf conditions with wave, swell, and wind wave data
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { CurrentConditions as CurrentConditionsType } from '@/services/api';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WaveCard } from './wave-card';

interface CurrentConditionsProps {
  data?: CurrentConditionsType;
  isLoading?: boolean;
  error?: Error | null;
  testID?: string;
}

export function CurrentConditions({ 
  data, 
  isLoading, 
  error,
  testID 
}: CurrentConditionsProps) {
  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer} testID={`${testID}-loading`}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.statusText}>Loading conditions...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer} testID={`${testID}-error`}>
        <ThemedText type="smallBold" style={styles.errorText}>
          Error loading conditions
        </ThemedText>
        <ThemedText>{error.message}</ThemedText>
      </ThemedView>
    );
  }

  if (!data) {
    return null;
  }

  const timestamp = new Date(data.timestamp);

  return (
    <ThemedView style={styles.container} testID={testID}>
      <ThemedText type="title" style={styles.header}>
        Current Conditions
      </ThemedText>
      
      <ThemedText style={styles.timestamp}>
        {timestamp.toLocaleString()}
      </ThemedText>

      <View style={styles.temperatureContainer}>
        <ThemedText type="subtitle">Water Temperature</ThemedText>
        <ThemedText type="title" style={styles.temperature}>
          {data.waterTemperature.toFixed(1)}°C
        </ThemedText>
      </View>

      <WaveCard 
        title="Wave" 
        data={data.wave}
        testID={`${testID}-wave`}
      />
      
      <WaveCard 
        title="Swell" 
        data={data.swell}
        testID={`${testID}-swell`}
      />
      
      <WaveCard 
        title="Wind Wave" 
        data={data.windWave}
        testID={`${testID}-windwave`}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    marginBottom: 8,
  },
  timestamp: {
    opacity: 0.7,
    marginBottom: 16,
  },
  temperatureContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 16,
  },
  temperature: {
    fontSize: 48,
    marginTop: 8,
  },
  statusText: {
    marginTop: 12,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 8,
  },
});
