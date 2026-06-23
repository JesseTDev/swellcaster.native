/**
 * SurfMapMarker — glowing rating dot; tap circle for spot data
 */

import { Pressable, StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

import type { CurrentConditions, CuratedSpot } from "@/services/api";
import { getRatingColor, getSurfRating } from "@/utils/forecast";

const DOT_SIZE = 10;
const TOUCH_SIZE = 40;

interface SurfMapMarkerProps {
  spot: CuratedSpot;
  conditions?: CurrentConditions | null;
  isSelected?: boolean;
  onPress: () => void;
}

export function SurfMapMarker({
  spot,
  conditions,
  isSelected = false,
  onPress,
}: SurfMapMarkerProps) {
  const rating = conditions?.rating
    ?? (conditions
      ? getSurfRating(conditions.swell.height, conditions.swell.period)
      : null);
  const color = rating ? getRatingColor(rating) : "#94A3B8";

  return (
    <Marker
      coordinate={{ latitude: spot.lat, longitude: spot.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress();
      }}
    >
      <Pressable
        onPress={onPress}
        hitSlop={6}
        style={styles.hitArea}
        accessibilityRole="button"
        accessibilityLabel={`${spot.name} surf conditions`}
      >
        <View style={styles.dotStack}>
          <View
            style={[
              styles.glowRing,
              styles.glowOuter,
              {
                backgroundColor: `${color}18`,
                shadowColor: color,
              },
              isSelected && styles.glowOuterSelected,
            ]}
          />
          <View
            style={[
              styles.glowRing,
              styles.glowMid,
              { backgroundColor: `${color}55` },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: color,
                borderColor: isSelected ? "#FFFFFF" : `${color}CC`,
                shadowColor: color,
              },
              isSelected && styles.dotSelected,
            ]}
          />
        </View>
      </Pressable>
    </Marker>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dotStack: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    borderRadius: 999,
  },
  glowOuter: {
    width: 28,
    height: 28,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 4,
  },
  glowOuterSelected: {
    width: 32,
    height: 32,
  },
  glowMid: {
    width: 18,
    height: 18,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  dotSelected: {
    width: DOT_SIZE + 2,
    height: DOT_SIZE + 2,
    borderRadius: (DOT_SIZE + 2) / 2,
    borderWidth: 2,
  },
});
