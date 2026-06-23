/**
 * ForecastLineChart — shared area line chart (gifted-charts)
 */

import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ForecastLinePoint {
  value: number;
  label?: string;
}

interface ForecastLineChartProps {
  data: ForecastLinePoint[];
  color: string;
  height?: number;
  unitSuffix?: string;
  fromZero?: boolean;
  testID?: string;
}

export function ForecastLineChart({
  data,
  color,
  height = 180,
  unitSuffix = '',
  fromZero = true,
  testID,
}: ForecastLineChartProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;
  const screenWidth = Dimensions.get('window').width - 64;

  if (data.length === 0) {
    return null;
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const yAxisOffset = fromZero ? 0 : Math.max(0, minValue - minValue * 0.05);

  const spacing =
    data.length > 1 ? Math.max(12, (screenWidth - 48) / (data.length - 1)) : 24;

  return (
    <View style={styles.wrap} testID={testID}>
      <LineChart
        areaChart
        curved
        isAnimated
        animationDuration={600}
        data={data}
        height={height}
        width={screenWidth}
        spacing={spacing}
        initialSpacing={12}
        endSpacing={12}
        color={color}
        thickness={2.5}
        startFillColor={color}
        endFillColor={color}
        startOpacity={0.28}
        endOpacity={0.02}
        hideDataPoints
        rulesType="dashed"
        rulesColor={palette.border}
        dashWidth={4}
        dashGap={6}
        noOfSections={3}
        yAxisOffset={yAxisOffset}
        yAxisColor="transparent"
        xAxisColor={palette.border}
        yAxisTextStyle={[styles.axisText, { color: palette.muted }]}
        xAxisLabelTextStyle={[styles.axisText, { color: palette.muted }]}
        formatYLabel={(v) => `${Number(v).toFixed(1)}${unitSuffix}`}
        backgroundColor={palette.surfaceElevated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginLeft: -4,
  },
  axisText: {
    fontSize: 10,
  },
});
