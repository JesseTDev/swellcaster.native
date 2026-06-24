/**
 * VideoMapMarker — film icon for active condition videos on the map
 */

import { StyleSheet, View } from 'react-native';

import { PlatformSymbol } from '@/components/ui/platform-symbol';

interface VideoMapMarkerProps {
  isSelected?: boolean;
}

const ICON_SIZE = 28;

export function VideoMapMarker({ isSelected = false }: VideoMapMarkerProps) {
  return (
    <View style={[styles.wrap, isSelected && styles.selected]}>
      <View style={styles.icon}>
        <PlatformSymbol
          name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
          size={14}
          tintColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: ICON_SIZE + 8,
    height: ICON_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    transform: [{ scale: 1.12 }],
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});
