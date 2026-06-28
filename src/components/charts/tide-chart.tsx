/**
 * TideChart — 24-hour sea level from the forecast API
 */

import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ForecastLineChart,
  type ForecastLinePoint,
} from '@/components/charts/forecast-line-chart';
import { ThemedText } from '@/components/themed-text';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { ForecastCard } from '@/components/ui/forecast-card';
import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ForecastHour } from '@/services/api';
import {
  findTideExtremes,
  formatTideExtremeLabel,
  formatTideHeightM,
  hasTideMeasurements,
  type TidePoint,
} from '@/utils/tide';

interface TideChartProps {
  data: ForecastHour[];
  testID?: string;
}

export function TideChart({ data, testID }: TideChartProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const tideColor = palette.secondary;

  const chartData = useMemo(() => data.slice(0, 24), [data]);
  const seaLevelsM = useMemo(
    () => chartData.map((h) => h.seaLevelHeightM ?? 0),
    [chartData]
  );
  const hasTide = hasTideMeasurements(seaLevelsM);

  const points: ForecastLinePoint[] = useMemo(
    () =>
      chartData.map((item, index) => ({
        value: Number((seaLevelsM[index] ?? 0).toFixed(2)),
        label:
          index % 4 === 0
            ? `${new Date(item.timestamp).getHours().toString().padStart(2, '0')}`
            : undefined,
      })),
    [chartData, seaLevelsM]
  );

  const tidePoints: TidePoint[] = useMemo(
    () =>
      chartData.map((item, index) => ({
        timestamp: item.timestamp,
        seaLevelHeightM: seaLevelsM[index] ?? 0,
      })),
    [chartData, seaLevelsM]
  );

  if (chartData.length === 0) {
    return null;
  }

  const values = points.map((p) => p.value);
  const maxHeight = values.length ? Math.max(...values) : 0;
  const minHeight = values.length ? Math.min(...values) : 0;
  const extremes = hasTide ? findTideExtremes(tidePoints) : [];

  return (
    <ForecastCard style={styles.container} testID={testID}>
      <CollapsibleSection
        title="Tide"
        subtitle="Sea level · next 24 hours"
        action={
          hasTide ? `Now ${formatTideHeightM(seaLevelsM[0] ?? 0)}` : undefined
        }
      >
        {hasTide ? (
          <>
            <ForecastLineChart
              data={points}
              color={tideColor}
              fromZero={false}
              testID={`${testID}-line`}
            />

            <View style={styles.footer}>
              <ThemedText themeColor="textSecondary" style={styles.footerText}>
                Range {minHeight.toFixed(2)} – {maxHeight.toFixed(2)} m
              </ThemedText>
              {extremes.length > 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.extremesText}>
                  {extremes.map(formatTideExtremeLabel).join('  ·  ')}
                </ThemedText>
              ) : null}
            </View>
          </>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.unavailable}>
            Tide data unavailable for this location.
          </ThemedText>
        )}
      </CollapsibleSection>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  footer: {
    marginTop: 4,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
  extremesText: {
    fontSize: 11,
    lineHeight: 16,
  },
  unavailable: {
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 8,
  },
});
