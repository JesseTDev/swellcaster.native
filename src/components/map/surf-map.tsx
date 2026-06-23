/**
 * SurfMap — interactive map with GPS, tap-to-select, and condition markers
 */

import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";

import { MapSelectionPin } from "@/components/map/map-selection-pin";
import { SurfMapMarker } from "@/components/map/surf-map-marker";
import { useCuratedSpots } from "@/hooks/api/use-curated-spots";
import { useSurfSpotConditions } from "@/hooks/use-surf-spot-conditions";
import type { CoordinatesParams, CuratedSpot } from "@/services/api";

const DEFAULT_REGION: Region = {
  latitude: -26.6556,
  longitude: 153.0908,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

interface SurfMapProps {
  userCoords: CoordinatesParams | null;
  selectedCoords: CoordinatesParams | null;
  /** True when a labelled surf spot was tapped — hides the map pin */
  selectedIsSpot?: boolean;
  onSelectCoords: (coords: CoordinatesParams, label?: string) => void;
}

function isSameCoords(a: CoordinatesParams, b: CoordinatesParams): boolean {
  return (
    Math.abs(a.lat - b.lat) < 0.0001 && Math.abs(a.lon - b.lon) < 0.0001
  );
}

export function SurfMap({
  userCoords,
  selectedCoords,
  selectedIsSpot = false,
  onSelectCoords,
}: SurfMapProps) {
  const mapRef = useRef<MapView>(null);
  const { data: curatedSpots = [] } = useCuratedSpots();
  const spotConditions = useSurfSpotConditions(curatedSpots);
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);

  useEffect(() => {
    if (userCoords && !hasCenteredOnUser) {
      mapRef.current?.animateToRegion(
        {
          latitude: userCoords.lat,
          longitude: userCoords.lon,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        },
        600,
      );
      setHasCenteredOnUser(true);
    }
  }, [userCoords, hasCenteredOnUser]);

  const handleMapPress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onSelectCoords({ lat: latitude, lon: longitude });
  };

  const handleMarkerPress = (spot: CuratedSpot) => {
    onSelectCoords({ lat: spot.lat, lon: spot.lon }, spot.name);
    mapRef.current?.animateToRegion(
      {
        latitude: spot.lat,
        longitude: spot.lon,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      400,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={Platform.OS === "android"}
        onPress={handleMapPress}
      >
        {spotConditions.map(({ spot, conditions }) => (
          <SurfMapMarker
            key={spot.id}
            spot={spot}
            swellHeightM={conditions?.swell?.height}
            swellPeriodS={conditions?.swell?.period}
            isSelected={
              selectedCoords != null &&
              isSameCoords(selectedCoords, { lat: spot.lat, lon: spot.lon })
            }
            onPress={() => handleMarkerPress(spot)}
          />
        ))}

        {selectedCoords && !selectedIsSpot ? (
          <Marker
            coordinate={{
              latitude: selectedCoords.lat,
              longitude: selectedCoords.lon,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <MapSelectionPin />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});
