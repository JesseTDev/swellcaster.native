/**
 * TideChart — 24-hour sea level / tide curve
 */

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  ForecastLineChart,
  type ForecastLinePoint,
} from '@/components/charts/forecast-line-chart';
import { ThemedText } from '@/components/themed-text';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { ForecastCard } from '@/components/ui/forecast-card';
import type { ForecastHour } from '@/services/api';
import {
  fetchOpenMeteoTide,
  hasTideMeasurements,
} from '@/services/tide/open-meteo-tide';
import {
  findTideExtremes,
  formatTideExtremeLabel,
  formatTideHeightFt,
  seaLevelToFeet,
  type TidePoint,
} from '@/utils/tide';

const TIDE_COLOR = '#0E7490';

interface TideChartProps {
  data: ForecastHour[];
  lat?: number;
  lon?: number;
  testID?: string;
}

export function TideChart({ data, lat, lon, testID }: TideChartProps) {
  const chartData = data.slice(0, 24);
  const apiSeaLevels = chartData.map((h) => h.seaLevelHeightM);
  const apiHasTide = hasTideMeasurements(apiSeaLevels);

  const [fallbackSeaLevels, setFallbackSeaLevels] = useState<number[] | null>(
    null
  );
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  useEffect(() => {
    if (apiHasTide || lat == null || lon == null) {
      setFallbackSeaLevels(null);
      setFallbackError(null);
      return;
    }

    let cancelled = false;
    setIsLoadingFallback(true);
    setFallbackError(null);

    fetchOpenMeteoTide(lat, lon)
      .then(({ seaLevelHeightM }) => {
        if (cancelled) return;
        setFallbackSeaLevels(seaLevelHeightM.slice(0, 24));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setFallbackError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFallback(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiHasTide, lat, lon]);

  const seaLevelsM = useMemo(() => {
    if (apiHasTide) {
      return chartData.map((h) => h.seaLevelHeightM ?? 0);
    }
    if (fallbackSeaLevels) {
      return fallbackSeaLevels;
    }
    return [];
  }, [apiHasTide, chartData, fallbackSeaLevels]);

  const points: ForecastLinePoint[] = useMemo(
    () =>
      chartData.map((item, index) => ({
        value: Number(seaLevelToFeet(seaLevelsM[index] ?? 0).toFixed(2)),
        label:
          index % 4 === 0
            ? `${new Date(item.timestamp).getHours().toString().padStart(2, '0')}`
            : undefined,
      })),
    [chartData, seaLevelsM]
  );

  const tidePoints: TidePoint[] = chartData.map((item, index) => ({
    timestamp: item.timestamp,
    seaLevelHeightM: seaLevelsM[index] ?? 0,
  }));

  const hasTide = hasTideMeasurements(seaLevelsM);
  const values = points.map((p) => p.value);
  const maxHeight = values.length ? Math.max(...values) : 0;
  const minHeight = values.length ? Math.min(...values) : 0;
  const extremes = hasTide ? findTideExtremes(tidePoints) : [];

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ForecastCard style={styles.container} testID={testID}>
      <CollapsibleSection
        title="Tide"
        subtitle="Sea level · next 24 hours"
        action={
          hasTide ? `Now ${formatTideHeightFt(seaLevelsM[0] ?? 0)}` : undefined
        }
      >
        {isLoadingFallback ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={TIDE_COLOR} />
            <ThemedText themeColor="textSecondary" style={styles.loadingText}>
              Loading tide data
            </ThemedText>
          </View>
        ) : null}

        {!isLoadingFallback && hasTide ? (
          <>
            <ForecastLineChart
              data={points}
              color={TIDE_COLOR}
              fromZero={false}
              testID={`${testID}-line`}
            />

            <View style={styles.footer}>
              <ThemedText themeColor="textSecondary" style={styles.footerText}>
                Range {minHeight.toFixed(1)} – {maxHeight.toFixed(1)} ft · est.
                model tide
              </ThemedText>
              {extremes.length > 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.extremesText}>
                  {extremes.map(formatTideExtremeLabel).join('  ·  ')}
                </ThemedText>
              ) : null}
            </View>
          </>
        ) : null}

        {!isLoadingFallback && !hasTide ? (
          <ThemedText themeColor="textSecondary" style={styles.unavailable}>
            {fallbackError ?? 'Tide data unavailable for this location.'}
          </ThemedText>
        ) : null}
      </CollapsibleSection>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
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
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  unavailable: {
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 8,
  },
});
