/**
 * DirectionCard — swell and wind direction side by side
 */

import { StyleSheet, View } from 'react-native';

import { DirectionArrow } from '@/components/ui/direction-arrow';
import { ForecastCard } from '@/components/ui/forecast-card';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/themed-text';

import { formatWindSpeedKnots } from '@/utils/units';

interface DirectionCardProps {
  swellDirection: number;
  windDirection: number;
  windSpeedKnots?: number;
  /** Render inline without an outer card — for nested panels */
  embedded?: boolean;
  testID?: string;
}

export function DirectionCard({
  swellDirection,
  windDirection,
  windSpeedKnots,
  embedded = false,
  testID,
}: DirectionCardProps) {
  const content = (
    <>
      <SectionHeader title="Directions" subtitle="Where swell and wind are coming from" />
      <View style={styles.row}>
        <View style={styles.item}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Swell
          </ThemedText>
          <DirectionArrow fromDegrees={swellDirection} color="#A855F7" size={40} />
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Wind
          </ThemedText>
          <DirectionArrow fromDegrees={windDirection} color="#EAB308" size={40} />
          {windSpeedKnots != null ? (
            <ThemedText style={styles.windSpeed}>{formatWindSpeedKnots(windSpeedKnots)}</ThemedText>
          ) : null}
        </View>
      </View>
    </>
  );

  if (embedded) {
    return (
      <View style={styles.embedded} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <ForecastCard style={styles.card} testID={testID}>
      {content}
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  embedded: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#64748B33',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  windSpeed: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 56,
    backgroundColor: '#64748B44',
    marginHorizontal: 8,
  },
});
