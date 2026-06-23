/**
 * Example Screen - Using Current Conditions
 * 
 * This demonstrates how to use the API hooks and components
 */

import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { CurrentConditions } from '@/components/surf';
import { useCurrent } from '@/hooks/api';

// Example coordinates: Sydney, Australia (Bondi Beach)
const SYDNEY_COORDS = {
  lat: -33.8915,
  lon: 151.2767,
};

export default function ExampleScreen() {
  const { data, isLoading, error } = useCurrent(SYDNEY_COORDS);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.header}>
          Surf Conditions
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Bondi Beach, Sydney
        </ThemedText>

        <CurrentConditions
          data={data}
          isLoading={isLoading}
          error={error}
          testID="current-conditions"
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginTop: 32,
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
});
