/**
 * DayOverviewCard — rule-based summary for the rest of today
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastCard } from '@/components/ui/forecast-card';
import { OverviewBulletList } from '@/components/ui/overview-bullet-list';
import { ForecastSpacing, ForecastTypography } from '@/constants/forecast-theme';
import type { DayOverview } from '@/utils/day-overview';

interface DayOverviewCardProps {
  overview: DayOverview | null;
  testID?: string;
}

export function DayOverviewCard({ overview, testID }: DayOverviewCardProps) {
  if (!overview?.summary) return null;

  return (
    <ForecastCard style={styles.card} testID={testID}>
      <ThemedText style={styles.summary}>{overview.summary}</ThemedText>
      <OverviewBulletList
        items={overview.highlights}
        testID={testID ? `${testID}-highlights` : undefined}
      />
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: ForecastSpacing.gutter,
  },
  summary: {
    ...ForecastTypography.bodyMd,
    lineHeight: 24,
  },
});
