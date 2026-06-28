/**
 * DirectionCard — swell and wind direction (collapsible when not embedded)
 */

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import { CollapsibleForecastCard } from '@/components/ui/collapsible-forecast-card';
import { StatRow } from '@/components/ui/stat-row';
import { ThemedText } from '@/components/themed-text';
import { ForecastColors, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

import { formatDirection, formatDirectionFull } from '@/utils/forecast';
import { formatWaveHeightValueFeet, WAVE_HEIGHT_UNIT } from '@/utils/units';

interface DirectionCardProps {
  swellDirection: number;
  swellHeightM?: number;
  swellPeriodS?: number;
  windDirection: number;
  windSpeedKnots?: number;
  windSeaHeightM?: number;
  /** Render inline without an outer card — for nested panels */
  embedded?: boolean;
  defaultExpanded?: boolean;
  testID?: string;
}

function DirectionContent({
  swellDirection,
  swellHeightM,
  swellPeriodS,
  windDirection,
  windSpeedKnots,
  windSeaHeightM,
}: Omit<DirectionCardProps, 'embedded' | 'defaultExpanded' | 'testID'>) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  return (
    <>
      <View style={styles.row}>
        <View style={styles.item}>
          <ThemedText themeColor="textSecondary" style={styles.arrowLabel}>
            Swell
          </ThemedText>
          <DirectionArrow fromDegrees={swellDirection} color={palette.secondary} size={32} />
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <ThemedText themeColor="textSecondary" style={styles.arrowLabel}>
            Wind
          </ThemedText>
          <DirectionArrow fromDegrees={windDirection} color={palette.tertiary} size={32} />
        </View>
      </View>

      <View style={styles.stats}>
        {swellHeightM != null ? (
          <StatRow
            label="Swell height"
            value={formatWaveHeightValueFeet(swellHeightM)}
            unit={WAVE_HEIGHT_UNIT}
          />
        ) : null}
        {swellPeriodS != null ? (
          <StatRow label="Swell period" value={swellPeriodS.toFixed(1)} unit="s" />
        ) : null}
        <StatRow
          label="Swell direction"
          value={formatDirection(swellDirection)}
          unit={`${Math.round(swellDirection)}°`}
        />
        <StatRow
          label="Wind direction"
          value={formatDirection(windDirection)}
          unit={`${Math.round(windDirection)}°`}
        />
        {windSpeedKnots != null ? (
          <StatRow label="Wind speed" value={Math.round(windSpeedKnots).toString()} unit="kt" />
        ) : null}
        {windSeaHeightM != null ? (
          <StatRow
            label="Wind sea"
            value={formatWaveHeightValueFeet(windSeaHeightM)}
            unit={WAVE_HEIGHT_UNIT}
          />
        ) : null}
      </View>
    </>
  );
}

function EmbeddedDirectionCard({
  swellDirection,
  swellHeightM,
  swellPeriodS,
  windDirection,
  windSpeedKnots,
  windSeaHeightM,
  defaultExpanded = false,
  testID,
}: Omit<DirectionCardProps, 'embedded'>) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const action = `${formatDirection(swellDirection)} · ${formatDirection(windDirection)}`;

  return (
    <View style={styles.embedded} testID={testID}>
      <Pressable
        style={({ pressed }) => [styles.embeddedHeader, pressed && styles.headerPressed]}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <PlatformSymbol
          name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' }}
          size={10}
          weight="semibold"
          tintColor={theme.textSecondary}
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />
        <ThemedText themeColor="textSecondary" style={styles.embeddedTitle}>
          Swell & wind
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.embeddedAction}>
          {action}
        </ThemedText>
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(100)}>
          <DirectionContent
            swellDirection={swellDirection}
            swellHeightM={swellHeightM}
            swellPeriodS={swellPeriodS}
            windDirection={windDirection}
            windSpeedKnots={windSpeedKnots}
            windSeaHeightM={windSeaHeightM}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

export function DirectionCard({
  swellDirection,
  swellHeightM,
  swellPeriodS,
  windDirection,
  windSpeedKnots,
  windSeaHeightM,
  embedded = false,
  defaultExpanded = false,
  testID,
}: DirectionCardProps) {
  const action = `${formatDirection(swellDirection)} · ${formatDirection(windDirection)}`;

  if (embedded) {
    return (
      <EmbeddedDirectionCard
        swellDirection={swellDirection}
        swellHeightM={swellHeightM}
        swellPeriodS={swellPeriodS}
        windDirection={windDirection}
        windSpeedKnots={windSpeedKnots}
        windSeaHeightM={windSeaHeightM}
        defaultExpanded={defaultExpanded}
        testID={testID}
      />
    );
  }

  return (
    <CollapsibleForecastCard
      title="Swell & wind"
      subtitle={formatDirectionFull(swellDirection)}
      action={action}
      defaultExpanded={defaultExpanded}
      testID={testID}
    >
      <DirectionContent
        swellDirection={swellDirection}
        swellHeightM={swellHeightM}
        swellPeriodS={swellPeriodS}
        windDirection={windDirection}
        windSpeedKnots={windSpeedKnots}
        windSeaHeightM={windSeaHeightM}
      />
    </CollapsibleForecastCard>
  );
}

const styles = StyleSheet.create({
  embedded: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#64748B33',
  },
  embeddedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  headerPressed: {
    opacity: 0.7,
  },
  embeddedTitle: {
    ...ForecastTypography.sectionTitle,
    flex: 1,
  },
  embeddedAction: {
    ...ForecastTypography.caption,
    maxWidth: '45%',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  arrowLabel: {
    ...ForecastTypography.label,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: '#64748B44',
    marginHorizontal: 8,
  },
  stats: {
    marginTop: 2,
  },
});
