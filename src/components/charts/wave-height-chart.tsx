/**
 * WaveHeightChart — 24-hour estimated surf height series
 */

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
import { estimateSurfHeightFtFromConditions, type SurfEstimateContext } from '@/utils/surf-height';

interface WaveHeightChartProps {
  data: ForecastHour[];
  surfContext?: Pick<SurfEstimateContext, 'shoreBearing' | 'breakType'>;
  testID?: string;
}

function buildChartPoints(
  data: ForecastHour[],
  surfContext?: Pick<SurfEstimateContext, 'shoreBearing' | 'breakType'>
): ForecastLinePoint[] {
  return data.slice(0, 24).map((item, index) => {
    const context: SurfEstimateContext | undefined = surfContext
      ? {
          ...surfContext,
          swellDirection: item.swell.direction,
          windWaveHeight: item.windWave.height,
        }
      : undefined;
    const ft = estimateSurfHeightFtFromConditions(item.wave, item.swell, context);
    const value = Number.isFinite(ft) ? Number(ft.toFixed(2)) : 0;
    const label =
      index % 4 === 0
        ? `${new Date(item.timestamp).getHours().toString().padStart(2, '0')}`
        : undefined;

    return { value, label };
  });
}

export function WaveHeightChart({ data, surfContext, testID }: WaveHeightChartProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  const chartData = data.slice(0, 24);
  if (chartData.length === 0) {
    return null;
  }

  const points = buildChartPoints(chartData, surfContext);
  const values = points.map((p) => p.value);
  const maxHeight = Math.max(...values, 0);
  const minHeight = Math.min(...values, 0);

  return (
    <ForecastCard style={styles.container} testID={testID}>
      <CollapsibleSection
        title="Est. surf height"
        subtitle="Next 24 hours"
        action={`Peak ${maxHeight.toFixed(1)} ft`}
      >
        <ForecastLineChart
          data={points}
          color={palette.accent}
          fromZero
          testID={`${testID}-line`}
        />

        <View style={styles.footer}>
          <ThemedText themeColor="textSecondary" style={styles.footerText}>
            Range {minHeight.toFixed(1)} – {maxHeight.toFixed(1)} ft
          </ThemedText>
        </View>
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
  },
  footerText: {
    fontSize: 11,
  },
});
