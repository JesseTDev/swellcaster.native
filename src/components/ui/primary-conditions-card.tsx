/**
 * PrimaryConditionsCard — hero surf + wind with refined gradient surface
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import {
  ForecastColors,
  ForecastRadii,
  ForecastTypography,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDirection } from '@/utils/forecast';
import { formatWindSpeedKnots } from '@/utils/units';

interface PrimaryConditionsCardProps {
  surfHeightFt: string;
  windDirection: number;
  windSpeedKnots: number;
  testID?: string;
}

export function PrimaryConditionsCard({
  surfHeightFt,
  windDirection,
  windSpeedKnots,
  testID,
}: PrimaryConditionsCardProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const isDark = scheme === 'dark';

  const gradientColors = isDark
    ? (['#1E3A5F', '#1E293B', '#172033'] as const)
    : (['#F0F9FF', '#FFFFFF', '#F8FAFC'] as const);

  const accentBarColors = isDark
    ? (['#38BDF8', '#0EA5E9', '#0284C7'] as const)
    : (['#7DD3FC', '#38BDF8', '#0284C7'] as const);

  return (
    <View
      style={[
        styles.outer,
        {
          shadowColor: isDark ? palette.accent : palette.shadow,
          borderColor: isDark ? '#475569' : '#BAE6FD',
        },
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <LinearGradient
          colors={accentBarColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />

        <View
          style={[
            styles.glowOrb,
            { backgroundColor: isDark ? `${palette.accent}18` : `${palette.accent}12` },
          ]}
        />

        <View style={styles.content}>
          <ThemedText themeColor="textSecondary" style={styles.surfLabel}>
            Est. surf height
          </ThemedText>
          <View style={styles.surfRow}>
            <ThemedText style={styles.surfValue}>{surfHeightFt}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.surfUnit}>
              ft
            </ThemedText>
          </View>

          <View style={[styles.windRow, { borderTopColor: isDark ? '#FFFFFF14' : '#64748B18' }]}>
            <ThemedText themeColor="textSecondary" style={styles.windLabel}>
              Wind
            </ThemedText>
            <DirectionArrow
              fromDegrees={windDirection}
              color="#EAB308"
              size={28}
              showLabel={false}
            />
            <ThemedText style={styles.windDirection}>
              {formatDirection(windDirection)}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.windDivider}>
              ·
            </ThemedText>
            <ThemedText style={styles.windSpeed}>
              {formatWindSpeedKnots(windSpeedKnots)}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 6,
    borderRadius: ForecastRadii.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  gradient: {
    borderRadius: ForecastRadii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: ForecastRadii.card,
    borderBottomLeftRadius: ForecastRadii.card,
  },
  glowOrb: {
    position: 'absolute',
    top: -28,
    right: -28,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    paddingLeft: 20,
  },
  surfLabel: {
    ...ForecastTypography.label,
    marginBottom: 2,
    letterSpacing: 0.8,
  },
  surfRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 12,
  },
  surfValue: {
    ...ForecastTypography.display,
    fontVariant: ['tabular-nums'],
  },
  surfUnit: {
    ...ForecastTypography.displayUnit,
    marginBottom: 6,
  },
  windRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    marginTop: 2,
    borderTopWidth: 1,
  },
  windLabel: {
    ...ForecastTypography.label,
    marginRight: 2,
  },
  windDirection: {
    ...ForecastTypography.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  windDivider: {
    ...ForecastTypography.body,
  },
  windSpeed: {
    ...ForecastTypography.bodyBold,
    fontVariant: ['tabular-nums'],
  },
});
