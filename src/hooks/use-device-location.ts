/**
 * useDeviceLocation — GPS coordinates + reverse-geocoded place name
 */

import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CoordinatesParams } from '@/services/api';
import type { PlaceInfo } from '@/utils/geocoding';
import { formatPlaceFromGeocode } from '@/utils/geocoding';

interface DeviceLocationState {
  coords: CoordinatesParams | null;
  place: PlaceInfo | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

const initialState: DeviceLocationState = {
  coords: null,
  place: null,
  isLoading: true,
  error: null,
  permissionDenied: false,
};

const LOCATION_TIMEOUT_MS = 12_000;
const LAST_KNOWN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function toCoords(position: Location.LocationObject): CoordinatesParams {
  return {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

async function resolvePlace(coords: CoordinatesParams): Promise<PlaceInfo> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lon,
    });
    return formatPlaceFromGeocode(results, coords);
  } catch {
    return formatPlaceFromGeocode([], coords);
  }
}

export function useDeviceLocation() {
  const [state, setState] = useState<DeviceLocationState>(initialState);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (): Promise<CoordinatesParams | null> => {
    const requestId = ++requestIdRef.current;

    const apply = (patch: Partial<DeviceLocationState>) => {
      if (requestId !== requestIdRef.current) return;
      setState((current) => ({ ...current, ...patch }));
    };

    apply({ isLoading: true, error: null });

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        apply({
          coords: null,
          place: null,
          isLoading: false,
          error: 'Location services are disabled on this device.',
          permissionDenied: false,
        });
        return null;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        apply({
          coords: null,
          place: null,
          isLoading: false,
          error: 'Location permission is required to show your local forecast.',
          permissionDenied: true,
        });
        return null;
      }

      // Fast path — MapKit often has a cached fix before getCurrentPositionAsync returns.
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: LAST_KNOWN_MAX_AGE_MS,
      });

      if (lastKnown) {
        const cachedCoords = toCoords(lastKnown);
        apply({
          coords: cachedCoords,
          place: formatPlaceFromGeocode([], cachedCoords),
          isLoading: false,
          error: null,
          permissionDenied: false,
        });
        resolvePlace(cachedCoords).then((place) => {
          apply({ place });
        });
      }

      try {
        const position = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          LOCATION_TIMEOUT_MS,
          'Location timed out. Try searching for a place, or move near a window.'
        );

        const coords = toCoords(position);
        apply({
          coords,
          place: formatPlaceFromGeocode([], coords),
          isLoading: false,
          error: null,
          permissionDenied: false,
        });

        const place = await resolvePlace(coords);
        apply({ place });

        return coords;
      } catch (gpsError) {
        if (lastKnown) {
          return toCoords(lastKnown);
        }
        throw gpsError;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to read device location.';

      apply({
        coords: null,
        place: null,
        isLoading: false,
        error: message,
        permissionDenied: false,
      });

      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    coords: state.coords,
    place: state.place,
    isLoading: state.isLoading,
    error: state.error,
    permissionDenied: state.permissionDenied,
    refresh,
  };
}
