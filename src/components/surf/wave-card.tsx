/**
 * Wave Card Component
 * Reusable component for displaying wave data
 */

import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { WaveData } from "@/services/api";
import { formatWaveHeightFeet } from "@/utils/units";

interface WaveCardProps {
  title: string;
  data: WaveData;
  testID?: string;
}

export function WaveCard({ title, data, testID }: WaveCardProps) {
  return (
    <ThemedView style={styles.container} testID={testID}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.row}>
        <View style={styles.dataItem}>
          <ThemedText type="smallBold">Height</ThemedText>
          <ThemedText style={styles.value}>
            {formatWaveHeightFeet(data.height)}
          </ThemedText>
        </View>

        {data.direction !== undefined && (
          <View style={styles.dataItem}>
            <ThemedText type="smallBold">Direction</ThemedText>
            <ThemedText style={styles.value}>
              {data.direction.toFixed(0)}°
            </ThemedText>
          </View>
        )}

        {data.period !== undefined && (
          <View style={styles.dataItem}>
            <ThemedText type="smallBold">Period</ThemedText>
            <ThemedText style={styles.value}>
              {data.period.toFixed(1)}s
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dataItem: {
    flex: 1,
    alignItems: "center",
  },
  value: {
    fontSize: 20,
    marginTop: 4,
  },
});
