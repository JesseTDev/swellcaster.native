/**
 * MapSelectionPin — small custom pin for map-tap selections (not surf spots)
 */

import { StyleSheet, View } from "react-native";

const PIN_SIZE = 8;
const RING_SIZE = 18;

export function MapSelectionPin() {
  return (
    <View style={styles.hitArea}>
      <View style={styles.ring} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: "rgba(2, 132, 199, 0.25)",
  },
  dot: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: "#0284C7",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
