/**
 * LocationHeader — place name with current-location label
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ConditionBadge } from '@/components/ui/condition-badge';

interface LocationHeaderProps {
  /** e.g. "Current location" or "Selected location" */
  locationLabel: string;
  /** Reverse-geocoded place name, e.g. "Maroochydore" */
  placeName: string;
  /** Area / state / country, e.g. "Sunshine Coast, Queensland" */
  placeRegion?: string | null;
  swellHeightM: number;
  swellPeriodS?: number;
  lastUpdated?: Date;
  testID?: string;
}

export function LocationHeader({
  locationLabel,
  placeName,
  placeRegion,
  swellHeightM,
  swellPeriodS = 8,
  lastUpdated,
  testID,
}: LocationHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <View style={styles.locationBlock}>
          <ThemedText themeColor="textSecondary" style={styles.currentLabel}>
            {locationLabel}
          </ThemedText>
          <ThemedText style={styles.placeName}>{placeName}</ThemedText>
          {placeRegion ? (
            <ThemedText themeColor="textSecondary" style={styles.region}>
              {placeRegion}
            </ThemedText>
          ) : null}
        </View>
        <ConditionBadge swellHeightM={swellHeightM} swellPeriodS={swellPeriodS} />
      </View>
      {lastUpdated ? (
        <ThemedText themeColor="textSecondary" style={styles.time}>
          Observed {formattedTime} local
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  locationBlock: {
    flex: 1,
  },
  currentLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  region: {
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginTop: 8,
  },
});
